import { db } from "./app.js";
import { collection, getDocs, addDoc, doc, deleteDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. Cargar Gastos, Ventas y Calcular Balance Financiero con Filtro de Mes
export async function cargarBalanceYGastos() {
    const tablaGastos = document.getElementById("tabla-gastos");
    if (!tablaGastos) return;

    tablaGastos.innerHTML = "";

    // Obtenemos el valor del input mes (ej: "2026-11"). Si no está seleccionado, usamos el mes actual.
    const inputFiltroMes = document.getElementById("filtroMesBalance");
    let anioSeleccionado, mesSeleccionado;

    if (inputFiltroMes && inputFiltroMes.value) {
        const partes = inputFiltroMes.value.split("-");
        anioSeleccionado = Number(partes[0]);
        mesSeleccionado = Number(partes[1]) - 1; // Los meses en JS van de 0 a 11
    } else {
        const ahoraFiltro = new Date();
        anioSeleccionado = ahoraFiltro.getFullYear();
        mesSeleccionado = ahoraFiltro.getMonth();
        if (inputFiltroMes) {
            inputFiltroMes.value = `${anioSeleccionado}-${String(mesSeleccionado + 1).padStart(2, '0')}`;
        }
    }

    try {
        // A. Obtener y Filtrar Gastos por el Mes Seleccionado
        const snapGastos = await getDocs(collection(db, "gastos"));
        let totalGastosMes = 0;

        snapGastos.forEach((docSnap) => {
            const g = docSnap.data();
            const id = docSnap.id;
            const monto = Number(g.monto) || 0;

            let fechaGastoObj = new Date();
            let fechaStr = "Hoy";

            if (g.fecha) {
                if (typeof g.fecha.toDate === 'function') {
                    fechaGastoObj = g.fecha.toDate();
                    fechaStr = fechaGastoObj.toLocaleDateString();
                } else {
                    const partes = g.fecha.split('-');
                    if (partes.length === 3) {
                        fechaGastoObj = new Date(partes[0], partes[1] - 1, partes[2]);
                        fechaStr = `${partes[2]}/${partes[1]}/${partes[0]}`;
                    }
                }
            }

            // Filtrar gasto si pertenece al mes y año seleccionado
            const esDelMes = fechaGastoObj.getMonth() === mesSeleccionado && fechaGastoObj.getFullYear() === anioSeleccionado;

            if (esDelMes) {
                totalGastosMes += monto;
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
            }
        });

        // B. Obtener Ventas para calcular Diaria, Semanal, Mensual Total y Ganancia Neta
        const snapVentas = await getDocs(collection(db, "ventas"));
        let ventaDiaria = 0;
        let ventaSemanal = 0;
        let ventaMensualTotal = 0;

        const ahora = new Date();
        ahora.setHours(0,0,0,0);

        const hace7Dias = new Date();
        hace7Dias.setDate(hace7Dias.getDate() - 7);

        snapVentas.forEach((docSnap) => {
            const v = docSnap.data();
            const totalVenta = Number(v.total) || 0;
            
            if (v.fecha) {
                const fechaVenta = v.fecha.toDate();
                
                // Venta del Mes Seleccionado en el filtro
                if (fechaVenta.getMonth() === mesSeleccionado && fechaVenta.getFullYear() === anioSeleccionado) {
                    ventaMensualTotal += totalVenta;
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

        // C. Calcular Ganancia Neta Mensual (Ventas Totales del Mes - Gastos Totales del Mes)
        const gananciaMensualNeta = ventaMensualTotal - totalGastosMes;

        // D. Renderizar en las tarjetas de la interfaz (asegurate de tener los IDs en tu HTML)
        const elDiaria = document.getElementById("ventaDiaria") || document.getElementById("gananciaDiaria");
        const elSemanal = document.getElementById("ventaSemanal") || document.getElementById("gananciaSemanal");
        const elVentaMensual = document.getElementById("ventaMensualTotal");
        const elGananciaMensual = document.getElementById("gananciaMensualNeta") || document.getElementById("gananciaMensual");

        if (elDiaria) elDiaria.textContent = `$${ventaDiaria.toFixed(2)}`;
        if (elSemanal) elSemanal.textContent = `$${ventaSemanal.toFixed(2)}`;
        if (elVentaMensual) elVentaMensual.textContent = `$${ventaMensualTotal.toFixed(2)}`;
        if (elGananciaMensual) elGananciaMensual.textContent = `$${gananciaMensualNeta.toFixed(2)}`;

    } catch (e) {
        console.error("Error al calcular el balance financiero: ", e);
    }
}

// 2. Guardar nuevo gasto con fecha seleccionada
document.addEventListener("DOMContentLoaded", () => {
    const formGasto = document.getElementById("formGasto");
    
    const inputFecha = document.getElementById("fechaGasto");
    if (inputFecha && !inputFecha.value) {
        const hoy = new Date().toISOString().split('T')[0];
        inputFecha.value = hoy;
    }

    // Inicializar selector de mes al cargar si existe (¡Acá queda registrado de forma limpia!)
    const inputFiltroMes = document.getElementById("filtroMesBalance");
    if (inputFiltroMes) {
        inputFiltroMes.addEventListener("change", () => {
            cargarBalanceYGastos();
        });
    }

    if (formGasto) {
        formGasto.addEventListener("submit", async (e) => {
            e.preventDefault();

            const concepto = document.getElementById("conceptoGasto").value;
            const categoria = document.getElementById("categoriaGasto").value;
            const monto = Number(document.getElementById("montoGasto").value) || 0;
            const fechaSeleccionada = document.getElementById("fechaGasto").value;

            try {
                await addDoc(collection(db, "gastos"), {
                    concepto,
                    categoria,
                    monto,
                    fecha: fechaSeleccionada
                });

                formGasto.reset();
                
                if (inputFecha) {
                    inputFecha.value = new Date().toISOString().split('T')[0];
                }

                const modalElement = document.getElementById("modalGasto");
                if (modalElement) {
                    bootstrap.Modal.getInstance(modalElement).hide();
                }

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