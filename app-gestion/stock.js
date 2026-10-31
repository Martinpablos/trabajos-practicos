import { db } from "./app.js";
import { collection, getDocs, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. Cargar y renderizar la tabla de Stock (filtrando solo Productos Finales)
export async function cargarStockProductos() {
    const tabla = document.getElementById("tabla-stock");
    if (!tabla) return;

    tabla.innerHTML = "";

    try {
        const querySnapshot = await getDocs(collection(db, "recetas"));
        
        querySnapshot.forEach((docSnap) => {
            const receta = docSnap.data();
            const id = docSnap.id;

            // Solo mostramos en Stock los Productos Finales (no las sub-recetas aisladas)
            if (receta.tipo === "producto_final" || receta.tipo === "final") {
                const stockActual = Number(receta.stock) || 0;
                const costoUnitario = Number(receta.costoUnitario) || 0;
                const valorTotalStock = stockActual * costoUnitario;

                tabla.innerHTML += `
                    <tr>
                        <td><strong>${receta.nombre || "Sin nombre"}</strong></td>
                        <td>
                            <div class="d-flex align-items-center gap-2">
                                <button class="btn btn-sm btn-outline-danger px-2" onclick="modificarStock('${id}', -1)">-</button>
                                <span class="fs-6 fw-bold px-2">${stockActual} u.</span>
                                <button class="btn btn-sm btn-outline-success px-2" onclick="modificarStock('${id}', 1)">+</button>
                            </div>
                        </td>
                        <td>$${costoUnitario.toFixed(2)}</td>
                        <td><strong>$${valorTotalStock.toFixed(2)}</strong></td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary" onclick="abrirModalAjuste('${id}', '${receta.nombre}', ${stockActual})">Ajustar</button>
                        </td>
                    </tr>
                `;
            }
        });
    } catch (e) {
        console.error("Error al cargar el stock de productos: ", e);
    }
}

// 2. Modificar stock rápido (+1 o -1)
window.modificarStock = async function(idReceta, cambio) {
    try {
        const refDoc = doc(db, "recetas", idReceta);
        const snap = await getDoc(refDoc);
        
        if (snap.exists()) {
            const stockActual = Number(snap.data().stock) || 0;
            const nuevoStock = Math.max(0, stockActual + cambio); // Evita stock negativo
            
            await updateDoc(refDoc, { stock: nuevoStock });
            cargarStockProductos(); // Recargar tabla
        }
    } catch (e) {
        console.error("Error al modificar stock: ", e);
    }
};

// 3. Modal de ajuste manual de stock (opcional para cambios de cantidad exacta)
window.abrirModalAjuste = async function(id, nombre, stockActual) {
    const nuevaCantidad = prompt(`Ajustar stock para "${nombre}":`, stockActual);
    if (nuevaCantidad !== null && !isNaN(nuevaCantidad) && nuevaCantidad.trim() !== "") {
        const cantidadNum = Math.max(0, Number(nuevaCantidad));
        try {
            const refDoc = doc(db, "recetas", id);
            await updateDoc(refDoc, { stock: cantidadNum });
            cargarStockProductos();
        } catch (e) {
            console.error("Error al ajustar stock manual: ", e);
        }
    }
};

// 4. Conectar el buscador de stock en tiempo real
export function inicializarBuscadorStock() {
    const buscadorStock = document.getElementById("buscadorStock");
    if (buscadorStock) {
        buscadorStock.addEventListener("input", (e) => {
            const textoBusqueda = e.target.value.toLowerCase();
            const filas = document.querySelectorAll("#tabla-stock tr");

            filas.forEach(fila => {
                const nombreProducto = fila.querySelector("td").textContent.toLowerCase();
                if (nombreProducto.includes(textoBusqueda)) {
                    fila.style.display = "";
                } else {
                    fila.style.display = "none";
                }
            });
        });
    }
}