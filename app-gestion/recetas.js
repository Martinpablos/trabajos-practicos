import { db } from "./app.js";
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let listaElementosCache = []; // Aquí guardaremos materias primas Y sub-recetas
let idRecetaEnEdicion = null;

// 1. Obtener materias primas y sub-recetas para llenar los desplegables
export async function cargarInsumosParaSelect() {
    try {
        listaElementosCache = [];

        // A. Cargar Materias Primas base
        const snapshotMp = await getDocs(collection(db, "materiaPrima"));
        snapshotMp.forEach((docSnap) => {
            const data = docSnap.data();
            const cantidadNum = Number(data.cantidad) || 1;
            const precioNum = Number(data.precio) || 0;
            const costoUnit = cantidadNum > 0 ? (precioNum / cantidadNum) : 0;

            listaElementosCache.push({
                id: docSnap.id,
                nombre: data.nombre || "Sin nombre",
                costoUnitario: costoUnit,
                categoria: "Materia Prima"
            });
        });

        // B. Cargar Sub-recetas existentes (ej: Pan de Miga)
        const snapshotRecetas = await getDocs(collection(db, "recetas"));
        snapshotRecetas.forEach((docSnap) => {
            const data = docSnap.data();
            // Solo sumamos las que son sub-recetas para ser usadas en productos finales
            if (data.tipo === "subreceta") {
                listaElementosCache.push({
                    id: docSnap.id,
                    nombre: `[Sub-receta] ${data.nombre}`,
                    costoUnitario: Number(data.costoUnitario) || 0,
                    categoria: "Sub-receta"
                });
            }
        });

    } catch (e) {
        console.error("Error al obtener elementos para recetas: ", e);
    }
}

// 2. Agregar una fila dinámica de ingrediente en el modal
export function agregarFilaIngrediente(idElementoSeleccionado = "", cantidadUsada = "") {
    const contenedor = document.getElementById("contenedorIngredientes");
    if (!contenedor) return;

    const filaId = Date.now() + Math.random();
    let opcionesHTML = `<option value="">-- Seleccionar Insumo o Sub-receta --</option>`;
    
    listaElementosCache.forEach(item => {
        const selected = item.id === idElementoSeleccionado ? "selected" : "";
        opcionesHTML += `<option value="${item.id}" data-costo="${item.costoUnitario}" ${selected}>${item.nombre} ($${item.costoUnitario.toFixed(2)} c/u)</option>`;
    });

    const divFila = document.createElement("div");
    divFila.className = "row mb-2 align-items-center fila-ingrediente";
    divFila.id = `fila-${filaId}`;
    divFila.innerHTML = `
        <div class="col-md-6">
            <select class="form-control select-insumo">
                ${opcionesHTML}
            </select>
        </div>
        <div class="col-md-4">
            <input type="number" step="any" class="form-control input-cantidad" placeholder="Cantidad usada" value="${cantidadUsada}">
        </div>
        <div class="col-md-2 text-end">
            <button type="button" class="btn btn-outline-danger btn-sm" onclick="document.getElementById('fila-${filaId}').remove();">✕</button>
        </div>
    `;

    contenedor.appendChild(divFila);
}

// 3. Guardar o Actualizar Receta en Firebase Firestore
export async function guardarOActualizarReceta(nombre, tipo, rendimiento) {
    const ingredientes = [];
    let costoTotalCalculado = 0;

    const filas = document.querySelectorAll(".fila-ingrediente");
    filas.forEach(fila => {
        const select = fila.querySelector(".select-insumo");
        const inputCant = fila.querySelector(".input-cantidad");
        
        const option = select.options[select.selectedIndex];
        const idInsumo = select.value;
        const nombreInsumo = option.text;
        const costoUnitario = Number(option.getAttribute("data-costo")) || 0;
        const cantidadUsada = Number(inputCant.value) || 0;
        const costoSubtotal = costoUnitario * cantidadUsada;

        if (idInsumo && cantidadUsada > 0) {
            costoTotalCalculado += costoSubtotal;
            ingredientes.push({
                idInsumo,
                nombreInsumo,
                cantidadUsada,
                costoSubtotal
            });
        }
    });

    const rendimientoNum = Number(rendimiento) || 1;
    const costoUnitario = rendimientoNum > 0 ? (costoTotalCalculado / rendimientoNum) : 0;

    try {
        if (idRecetaEnEdicion) {
            const refDoc = doc(db, "recetas", idRecetaEnEdicion);
            await updateDoc(refDoc, {
                nombre,
                tipo,
                rendimiento: rendimientoNum,
                ingredientes,
                costoTotal: costoTotalCalculado,
                costoUnitario
            });
            idRecetaEnEdicion = null;
        } else {
            await addDoc(collection(db, "recetas"), {
                nombre,
                tipo,
                rendimiento: rendimientoNum,
                ingredientes,
                costoTotal: costoTotalCalculado,
                costoUnitario,
                fechaCreacion: new Date()
            });
        }
        cargarRecetas();
        // Recargamos la cache para que la nueva sub-receta esté disponible inmediatamente para otros productos
        await cargarInsumosParaSelect();
    } catch (e) {
        console.error("Error al guardar/actualizar la receta: ", e);
    }
}

// 4. Preparar modal para Editar Receta
window.prepararEdicionReceta = async function(id) {
    try {
        await cargarInsumosParaSelect(); // Asegurar que tenemos la lista actualizada
        const refDoc = doc(db, "recetas", id);
        const snapshot = await getDoc(refDoc);
        
        if (snapshot.exists()) {
            const data = snapshot.data();
            
            document.getElementById("recetaNombre").value = data.nombre || "";
            document.getElementById("recetaTipo").value = data.tipo || "subreceta";
            document.getElementById("recetaRendimiento").value = data.rendimiento || 1;

            const contenedor = document.getElementById("contenedorIngredientes");
            contenedor.innerHTML = "";

            if (data.ingredientes && Array.isArray(data.ingredientes)) {
                data.ingredientes.forEach(ing => {
                    agregarFilaIngrediente(ing.idInsumo, ing.cantidadUsada);
                });
            }

            idRecetaEnEdicion = id;

            const modalEl = document.getElementById('modalReceta');
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        }
    } catch (e) {
        console.error("Error al cargar receta para editar: ", e);
    }
};

// 5. Eliminar Receta
window.eliminarReceta = async function(id) {
    if (confirm("¿Estás seguro de que querés eliminar esta receta?")) {
        try {
            await deleteDoc(doc(db, "recetas", id));
            cargarRecetas();
            await cargarInsumosParaSelect();
        } catch (e) {
            console.error("Error al eliminar la receta: ", e);
        }
    }
};

// 6. Cargar y renderizar la tabla de Recetas
export async function cargarRecetas() {
    const tabla = document.getElementById("tabla-recetas");
    if (!tabla) return;

    tabla.innerHTML = "";

    try {
        const querySnapshot = await getDocs(collection(db, "recetas"));
        querySnapshot.forEach((docSnap) => {
            const receta = docSnap.data();
            const id = docSnap.id;

            const badgeTipo = receta.tipo === "subreceta" 
                ? `<span class="badge bg-warning text-dark">Sub-receta</span>` 
                : `<span class="badge bg-info text-dark">Producto Final</span>`;

            tabla.innerHTML += `
                <tr>
                    <td><strong>${receta.nombre || "Sin nombre"}</strong></td>
                    <td>${badgeTipo}</td>
                    <td>${receta.rendimiento || 0} u.</td>
                    <td>$${Number(receta.costoTotal || 0).toFixed(2)}</td>
                    <td><strong>$${Number(receta.costoUnitario || 0).toFixed(2)}</strong></td>
                    <td>
                        <button class="btn btn-sm btn-outline-secondary me-1" onclick="prepararEdicionReceta('${id}')">Editar</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="eliminarReceta('${id}')">Eliminar</button>
                    </td>
                </tr>
            `;
        });
    } catch (e) {
        console.error("Error al cargar recetas: ", e);
    }
}

// 7. Resetear el modal
window.resetearModalReceta = async function() {
    idRecetaEnEdicion = null;
    const form = document.getElementById("formReceta");
    if (form) form.reset();
    document.getElementById("contenedorIngredientes").innerHTML = "";
    await cargarInsumosParaSelect(); // Refrescar lista al abrir el modal
};