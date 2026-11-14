import { db } from "./app.js";
import { collection, getDocs, doc, updateDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. Cargar y renderizar la tabla de Lista de Precios
export async function cargarListaPrecios() {
    const tabla = document.getElementById("tabla-precios"); // Asegurate que coincida con tu ID
    if (!tabla) return;

    tabla.innerHTML = "";

    try {
        const querySnapshot = await getDocs(collection(db, "recetas"));
        
        // 1. Creamos un array para guardar solo los productos finales filtrados
        let listaPrecios = [];
        querySnapshot.forEach((docSnap) => {
            const producto = docSnap.data();
            if (producto.tipo === "producto_final" || producto.tipo === "final") {
                listaPrecios.push({ id: docSnap.id, ...producto });
            }
        });

        // 2. Ordenamos alfabéticamente por el nombre del producto
        listaPrecios.sort((a, b) => {
            const nombreA = a.nombre || "";
            const nombreB = b.nombre || "";
            return nombreA.localeCompare(nombreB);
        });

        // 3. Recorremos el array ordenado para armar la tabla
        listaPrecios.forEach((producto) => {
            const id = producto.id;
            const costoUnitario = Number(producto.costoUnitario) || 0;
            const margenMinorista = producto.margenMinorista !== undefined ? Number(producto.margenMinorista) : 100;
            const margenMayorista = producto.margenMayorista !== undefined ? Number(producto.margenMayorista) : 50;

            const precioMinorista = costoUnitario * (1 + margenMinorista / 100);
            const precioMayorista = costoUnitario * (1 + margenMayorista / 100);

            tabla.innerHTML += `
                <tr class="fila-producto">
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
                    <td class="columna-acciones">
                        <button class="btn btn-sm btn-outline-dark" onclick="abrirModalMargenes('${id}', '${producto.nombre}', ${margenMinorista}, ${margenMayorista})">
                            Editar
                        </button>
                    </td>
                </tr>
            `;
        });

    } catch (e) {
        console.error("Error al cargar lista de precios: ", e);
    }
}
// 2. Abrir modal individual
window.abrirModalMargenes = function(id, nombre, actualMinorista, actualMayorista) {
    document.getElementById("productoIdMargen").value = id;
    document.getElementById("tituloModalMargenes").textContent = `Editar Márgenes: ${nombre}`;
    document.getElementById("inputMargenMinorista").value = actualMinorista;
    document.getElementById("inputMargenMayorista").value = actualMayorista;

    const modalElement = document.getElementById("modalMargenes");
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
};

// 3. Guardar cambios individuales y globales
document.addEventListener("DOMContentLoaded", () => {
    // Formulario individual
    const formMargenes = document.getElementById("formMargenes");
    if (formMargenes) {
        formMargenes.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = document.getElementById("productoIdMargen").value;
            const nuevoMinorista = Number(document.getElementById("inputMargenMinorista").value) || 0;
            const nuevoMayorista = Number(document.getElementById("inputMargenMayorista").value) || 0;

            try {
                const refDoc = doc(db, "recetas", id);
                await updateDoc(refDoc, { margenMinorista: nuevoMinorista, margenMayorista: nuevoMayorista });

                const modalElement = document.getElementById("modalMargenes");
                bootstrap.Modal.getInstance(modalElement).hide();
                cargarListaPrecios();
            } catch (error) {
                console.error("Error al actualizar márgenes: ", error);
            }
        });
    }

    // Formulario global (actualiza masivamente todos los productos finales)
    const formConfigGlobal = document.getElementById("formConfigGlobal");
    if (formConfigGlobal) {
        formConfigGlobal.addEventListener("submit", async (e) => {
            e.preventDefault();
            const nuevoMinorista = Number(document.getElementById("globalMinorista").value) || 0;
            const nuevoMayorista = Number(document.getElementById("globalMayorista").value) || 0;

            if (confirm(`¿Estás seguro de aplicar ${nuevoMinorista}% minorista y ${nuevoMayorista}% mayorista a TODOS los productos?`)) {
                try {
                    const querySnapshot = await getDocs(collection(db, "recetas"));
                    const batch = writeBatch(db);

                    querySnapshot.forEach((docSnap) => {
                        const producto = docSnap.data();
                        if (producto.tipo === "producto_final" || producto.tipo === "final") {
                            const refDoc = doc(db, "recetas", docSnap.id);
                            batch.update(refDoc, { 
                                margenMinorista: nuevoMinorista, 
                                margenMayorista: nuevoMayorista 
                            });
                        }
                    });

                    await batch.commit();

                    const modalElement = document.getElementById("modalConfigGlobal");
                    bootstrap.Modal.getInstance(modalElement).hide();
                    cargarListaPrecios();
                    alert("¡Márgenes globales actualizados con éxito!");
                } catch (error) {
                    console.error("Error al actualizar márgenes globales: ", error);
                }
            }
        });
    }
});

// 4. Imprimir Lista Minorista (Oculta porcentajes y precio mayorista)
window.imprimirMinorista = function() {
    document.body.classList.add("modo-impresion-minorista");
    window.print();
    document.body.classList.remove("modo-impresion-minorista");
};

// 4.1. Imprimir Lista Mayorista (Oculta porcentajes y precio minorista)
window.imprimirMayorista = function() {
    document.body.classList.add("modo-impresion-mayorista");
    window.print();
    document.body.classList.remove("modo-impresion-mayorista");
};
// 5. Buscador
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