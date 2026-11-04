import { db } from "./app.js";
import { collection, getDocs, addDoc, doc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. Cargar Gastos y Calcular Balance Financiero
export async function cargarBalanceYGastos() {
    const tablaGastos = document.getElementById("tabla-gastos");
    if (!tablaGastos) return;

    tablaGastos.innerHTML = "";

    try {
        // A. Obtener Gastos
        const snapGastos = await getDocs(collection(db, "gastos"));
        let totalGastosMes = 0;

        snapGastos.forEach((docSnap) => {
            const g = docSnap.data();
            const id = docSnap.id;
            const monto = Number(g.monto) || 0;
            totalGastosMes += monto;

            // Formato fecha simple si existe
            const fechaStr = g.fecha ? new Date(g.fecha.toDate()).toLocaleDateString() : "Hoy";

            tablaGastos.innerHTML += `
                <tr>
                    <td>${fechaStr}</td>
                    <td><strong>${g.concepto || "Sin concepto"}</strong></td>
                    <td><span class="badge bg-secondary">${g.categoria || "varios"}</span></td>
                    <td class="text-danger fw-bold">-$${monto.toFixed(2)}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-danger" onclick="window.eliminarGasto('${id}')">🗑️</button>
                    </td>
                </tr>
            `;
        });

        // B. Obtener Ventas para calcular Diaria, Semanal y Mensual
        const snapVentas = await getDocs(collection(db, "ventas"));
        let ventaDiaria = 0;
        let ventaSemanal = 0;
        let ventaMensual = 0;

        const ahora = new Date();
        ahora.setHours(0,0,0,0);

        const hace7Dias = new Date();
        hace7Dias.setDate(hace7Dias.getDate() - 7);

        snapVentas.forEach((docSnap) => {
            const v = docSnap.data();
            const totalVenta = Number(v.total) || 0;
            
            if (v.fecha) {
                const fechaVenta = v.fecha.toDate();
                
                // Venta Mensual (mismo mes y año actual)
                if (fechaVenta.getMonth() === ahora.getMonth() && fechaVenta.getFullYear() === ahora.getFullYear()) {
                    ventaMensual += totalVenta;
                }

                // Venta Semanal (últimos 7 días)
                if (fechaVenta >= hace7Dias) {
                    ventaSemanal += totalVenta;
                }

                // Venta Diaria (hoy)
                if (fechaVenta >= ahora) {
                    ventaDiaria += totalVenta;
                }
            }
        });

        // C. Calcular Ganancia Neta Mensual (Ventas Mensuales - Gastos Mensuales)
        // (Nota: Las ventas ya contemplan el precio minorista vs costo, pero restamos los gastos operativos fijos y variables)
        const gananciaMensualNeta = ventaMensual - totalGastosMes;

        // D. Renderizar en las tarjetas de la interfaz
        document.getElementById("gananciaDiaria").textContent = `$${ventaDiaria.toFixed(2)}`;
        document.getElementById("gananciaSemanal").textContent = `$${ventaSemanal.toFixed(2)}`;
        document.getElementById("gananciaMensual").textContent = `$${gananciaMensualNeta.toFixed(2)}`;

    } catch (e) {
        console.error("Error al calcular el balance financiero: ", e);
    }
}

// 2. Guardar nuevo gasto
document.addEventListener("DOMContentLoaded", () => {
    const formGasto = document.getElementById("formGasto");
    if (formGasto) {
        formGasto.addEventListener("submit", async (e) => {
            e.preventDefault();

            const concepto = document.getElementById("conceptoGasto").value;
            const categoria = document.getElementById("categoriaGasto").value;
            const monto = Number(document.getElementById("montoGasto").value) || 0;

            try {
                await addDoc(collection(db, "gastos"), {
                    concepto,
                    categoria,
                    monto,
                    fecha: serverTimestamp()
                });

                formGasto.reset();
                const modalElement = document.getElementById("modalGasto");
                bootstrap.Modal.getInstance(modalElement).hide();

                cargarBalanceYGastos();
            } catch (e) {
                console.error("Error al registrar gasto: ", e);
            }
        });
    }
});

// 3. Eliminar gasto
window.eliminarGasto = async function(id) {
    if (confirm("¿Estás seguro de que querés eliminar este gasto?")) {
        try {
            await deleteDoc(doc(db, "gastos", id));
            cargarBalanceYGastos();
        } catch (e) {
            console.error("Error al eliminar gasto: ", e);
        }
    }
};