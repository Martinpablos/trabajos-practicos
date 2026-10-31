import { db } from "./app.js";
import { collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
                
                const margenMinorista = producto.margenMinorista !== undefined ? Number(producto.margenMinorista) : 100;
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
                            <button class="btn btn-sm btn-outline-dark" onclick="abrirModalMargenes('${id}', '${producto.nombre}', ${margenMinorista}, ${margenMayorista})">
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

// 2. Abrir el modal y cargar los datos actuales
window.abrirModalMargenes = function(id, nombre, actualMinorista, actualMayorista) {
    document.getElementById("productoIdMargen").value = id;
    document.getElementById("tituloModalMargenes").textContent = `Editar Márgenes: ${nombre}`;
    document.getElementById("inputMargenMinorista").value = actualMinorista;
    document.getElementById("inputMargenMayorista").value = actualMayorista;

    // Mostrar el modal usando Bootstrap
    const modalElement = document.getElementById("modalMargenes");
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
};

// 3. Guardar los cambios del modal en Firebase
document.addEventListener("DOMContentLoaded", () => {
    const formMargenes = document.getElementById("formMargenes");
    if (formMargenes) {
        formMargenes.addEventListener("submit", async (e) => {
            e.preventDefault();

            const id = document.getElementById("productoIdMargen").value;
            const nuevoMinorista = Number(document.getElementById("inputMargenMinorista").value) || 0;
            const nuevoMayorista = Number(document.getElementById("inputMargenMayorista").value) || 0;

            try {
                const refDoc = doc(db, "recetas", id);
                await updateDoc(refDoc, {
                    margenMinorista: nuevoMinorista,
                    margenMayorista: nuevoMayorista
                });

                // Cerrar el modal
                const modalElement = document.getElementById("modalMargenes");
                const modal = bootstrap.Modal.getInstance(modalElement);
                modal.hide();

                // Recargar tabla de precios
                cargarListaPrecios();
            } catch (error) {
                console.error("Error al actualizar márgenes: ", error);
            }
        });
    }
});

// 4. Conectar el buscador de lista de precios
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