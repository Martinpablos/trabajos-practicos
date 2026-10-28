import { db } from "./app.js";
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let listaMateriasPrimasCache = [];

// 1. Obtener materias primas de la base para llenar los desplegables de ingredientes
export async function cargarInsumosParaSelect() {
    try {
        const querySnapshot = await getDocs(collection(db, "materiaPrima"));
        listaMateriasPrimasCache = [];
        querySnapshot.forEach((docSnap) => {
            listaMateriasPrimasCache.push({
                id: docSnap.id,
                ...docSnap.data()
            });
        });
    } catch (e) {
        console.error("Error al obtener materias primas para recetas: ", e);
    }
}

// 2. Agregar una fila dinámica de ingrediente en el modal
export function agregarFilaIngrediente() {
    const contenedor = document.getElementById("contenedorIngredientes");
    if (!contenedor) return;

    const filaId = Date.now();
    let opcionesHTML = `<option value="">-- Seleccionar Insumo / Sub-receta --</option>`;
    
    listaMateriasPrimasCache.forEach(insumo => {
        const cantidadNum = Number(insumo.cantidad) || 1;
        const precioNum = Number(insumo.precio) || 0;
        const costoUnit = cantidadNum > 0 ? (precioNum / cantidadNum) : 0;
        
        opcionesHTML += `<option value="${insumo.id}" data-costo="${costoUnit}">${insumo.nombre || "Sin nombre"} ($${costoUnit.toFixed(2)} c/u)</option>`;
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
            <input type="number" step="any" class="form-control input-cantidad" placeholder="Cantidad usada">
        </div>
        <div class="col-md-2 text-end">
            <button type="button" class="btn btn-outline-danger btn-sm" onclick="document.getElementById('fila-${filaId}').remove();">✕</button>
        </div>
    `;

    contenedor.appendChild(divFila);
}

// 3. Guardar receta en Firebase Firestore
export async function guardarReceta(nombre, tipo, rendimiento) {
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
        await addDoc(collection(db, "recetas"), {
            nombre,
            tipo,
            rendimiento: rendimientoNum,
            ingredientes,
            costoTotal: costoTotalCalculado,
            costoUnitario,
            fechaCreacion: new Date()
        });
        cargarRecetas();
    } catch (e) {
        console.error("Error al guardar la receta: ", e);
    }
}

// 4. Cargar y renderizar la tabla de Recetas
export async function cargarRecetas() {
    const tabla = document.getElementById("tabla-recetas");
    if (!tabla) return;

    tabla.innerHTML = "";

    try {
        const querySnapshot = await getDocs(collection(db, "recetas"));
        querySnapshot.forEach((docSnap) => {
            const receta = docSnap.data();

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
                        <button class="btn btn-sm btn-outline-secondary">Editar</button>
                    </td>
                </tr>
            `;
        });
    } catch (e) {
        console.error("Error al cargar recetas: ", e);
    }
}