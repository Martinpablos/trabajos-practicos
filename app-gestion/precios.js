import { db } from "./app.js";
import { collection, getDocs, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. Cargar y renderizar la tabla de Lista de Precios
export async function cargarListaPrecios() {
    const tabla = document.getElementById("tabla-precios");
    if (!tabla) return;

    tabla.innerHTML = "";

    try {
        const querySnapshot = await getDocs(collection(db, "recetas"));
        
        querySnapshot.forEach((docSnap) => {
            const producto = docSnap.data();
            const id = docSnap.id;

            // Solo mostramos Productos Finales en la lista de precios
            if (producto.tipo === "producto_final" || producto.tipo === "final") {
                const costoUnitario = Number(producto.costoUnitario) || 0;
                
                // Margen minorista (predeterminado 100% si no está definido)
                const margenMinorista = producto.margenMinorista !== undefined ? Number(producto.margenMinorista) : 100;
                // Margen mayorista (predeterminado 50% si no está definido)
                const margenMayorista = producto.margenMayorista !== undefined ? Number(producto.margenMayorista) : 50;

                const precioMinorista = costoUnitario * (1 + margenMinorista / 100);
                const precioMayorista = costoUnitario * (1 + margenMayorista / 100);

                tabla.innerHTML += `
                    <tr>
                        <td><strong>${producto.nombre || "Sin nombre"}</strong></td>
                        <td>$${costoUnitario.toFixed(2)}</td>
                        <td>
                            <div class="d-flex flex-column">
                                <span class="fw-bold text-success fs-6">$${precioMinorista.toFixed(2)}</span>
                                <small class="text-muted">+${margenMinorista}% ganancia</small>
                            </div>
                        </td>
                        <td>
                            <div class="d-flex flex-column">
                                <span class="fw-bold text-primary fs-6">$${precioMayorista.toFixed(2)}</span>
                                <small class="text-muted">+${margenMayorista}% ganancia</small>
                            </div>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-outline-dark" onclick="editarMargenes('${id}', '${producto.nombre}', ${margenMinorista}, ${margenMayorista})">
                                ✏️ Editar Margenes
                            </button>
                        </td>
                    </tr>
                `;
            }
        });
    } catch (e) {
        console.error("Error al cargar la lista de precios: ", e);
    }
}

// 2. Editar márgenes de ganancia individual para un producto
window.editarMargenes = async function(id, nombre, actualMinorista, actualMayorista) {
    const nuevoMinorista = prompt(`Margen Minorista (%) para "${nombre}":`, actualMinorista);
    if (nuevoMinorista === null) return;

    const nuevoMayorista = prompt(`Margen Mayorista (%) para "${nombre}":`, actualMayorista);
    if (nuevoMayorista === null) return;

    const pctMinorista = Math.max(0, Number(nuevoMinorista) || 0);
    const pctMayorista = Math.max(0, Number(nuevoMayorista) || 0);

    try {
        const refDoc = doc(db, "recetas", id);
        await updateDoc(refDoc, {
            margenMinorista: pctMinorista,
            margenMayorista: pctMayorista
        });
        cargarListaPrecios();
    } catch (e) {
        console.error("Error al actualizar márgenes de ganancia: ", e);
    }
};

// 3. Conectar el buscador de lista de precios
export function inicializarBuscadorPrecios() {
    const buscadorPrecios = document.getElementById("buscadorPrecios");
    if (buscadorPrecios) {
        buscadorPrecios.addEventListener("input", (e) => {
            const textoBusqueda = e.target.value.toLowerCase();
            const filas = document.querySelectorAll("#tabla-precios tr");

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