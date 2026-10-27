// Importar Firebase desde los CDNs oficiales
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Tus credenciales reales de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDa4nqcc3-ZWbK51cZPxJeegvyHEYMT_hg",
    authDomain: "sistema-celi.firebaseapp.com",
    projectId: "sistema-celi",
    storageBucket: "sistema-celi.firebasestorage.app",
    messagingSenderId: "167240526122",
    appId: "1:167240526122:web:b160382d6c4087a6435653",
    measurementId: "G-39YYQFK8QV"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Variable global para saber si estamos editando y qué ID
let idItemEnEdicion = null;

// 1. FUNCIÓN PARA LEER Y MOSTRAR LAS MATERIAS PRIMAS EN LA TABLA
async function cargarMateriasPrimas() {
    const tabla = document.getElementById("tabla-materia-prima");
    if (!tabla) return;

    tabla.innerHTML = ""; 
    
    try {
        const querySnapshot = await getDocs(collection(db, "materiaPrima"));
        querySnapshot.forEach((docSnap) => {
            const item = docSnap.data();
            const id = docSnap.id;
            
            const cantidad = Number(item.cantidad) || 0;
            const precio = Number(item.precio) || 0;
            const stock = Number(item.stock) || 0;
            const costoUnitario = cantidad > 0 ? (precio / cantidad).toFixed(2) : "0.00";

            tabla.innerHTML += `
                <tr>
                    <td><strong>${item.nombre || "Sin nombre"}</strong></td>
                    <td>${cantidad}</td>
                    <td>$${precio}</td>
                    <td>$${costoUnitario}</td>
                    <td><span class="badge bg-success">Disponible (${stock}kg)</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-secondary" onclick="prepararEdicion('${id}')">Editar</button>
                    </td>
                </tr>
            `;
        });
    } catch (e) {
        console.error("Error al cargar datos de Firebase: ", e);
    }
}

// 2. FUNCIÓN PARA GUARDAR NUEVA MATERIA PRIMA
async function guardarMateriaPrima(nombre, cantidad, precio, stock) {
    try {
        await addDoc(collection(db, "materiaPrima"), {
            nombre: nombre,
            cantidad: Number(cantidad),
            precio: Number(precio),
            stock: Number(stock),
            fecha: new Date()
        });
        cargarMateriasPrimas();
    } catch (e) {
        console.error("Error al guardar en Firebase: ", e);
    }
}

// 3. FUNCIÓN PARA ACTUALIZAR MATERIA PRIMA EXISTENTE
async function actualizarMateriaPrima(id, nombre, cantidad, precio, stock) {
    try {
        const refDoc = doc(db, "materiaPrima", id);
        await updateDoc(refDoc, {
            nombre: nombre,
            cantidad: Number(cantidad),
            precio: Number(precio),
            stock: Number(stock)
        });
        cargarMateriasPrimas();
    } catch (e) {
        console.error("Error al actualizar: ", e);
    }
}

// 4. FUNCIÓN GLOBAL PARA PREPARAR EL MODAL AL HACER CLIC EN EDITAR
window.prepararEdicion = async function(id) {
    try {
        const refDoc = doc(db, "materiaPrima", id);
        const snapshot = await getDoc(refDoc);
        
        if (snapshot.exists()) {
            const data = snapshot.data();
            document.getElementById("mpNombre").value = data.nombre;
            document.getElementById("mpCantidad").value = data.cantidad;
            document.getElementById("mpPrecio").value = data.precio;
            document.getElementById("mpStock").value = data.stock;
            
            idItemEnEdicion = id; 

            const modalEl = document.getElementById('modalMateriaPrima');
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        }
    } catch (e) {
        console.error("Error al cargar datos para editar: ", e);
    }
};

// 5. CAPTURAR EL ENVÍO DEL FORMULARIO (CREAR O EDITAR)
const formMateriaPrima = document.getElementById("formMateriaPrima");
if (formMateriaPrima) {
    formMateriaPrima.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nombre = document.getElementById("mpNombre").value;
        const cantidad = document.getElementById("mpCantidad").value;
        const precio = document.getElementById("mpPrecio").value;
        const stock = document.getElementById("mpStock").value;

        if (idItemEnEdicion) {
            await actualizarMateriaPrima(idItemEnEdicion, nombre, cantidad, precio, stock);
            idItemEnEdicion = null; 
        } else {
            await guardarMateriaPrima(nombre, cantidad, precio, stock);
        }

        formMateriaPrima.reset();
        const modalEl = document.getElementById('modalMateriaPrima');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
    });
}

// 6. BUSCADOR EN TIEMPO REAL
const buscadorMp = document.getElementById("buscadorMp");
if (buscadorMp) {
    buscadorMp.addEventListener("input", (e) => {
        const textoBusqueda = e.target.value.toLowerCase();
        const filas = document.querySelectorAll("#tabla-materia-prima tr");

        filas.forEach(fila => {
            const nombreInsumo = fila.querySelector("td").textContent.toLowerCase();
            if (nombreInsumo.includes(textoBusqueda)) {
                fila.style.display = "";
            } else {
                fila.style.display = "none";
            }
        });
    });
}

// 7. CARGAR LA TABLA AL ABRIR LA PÁGINA
document.addEventListener("DOMContentLoaded", () => {
    cargarMateriasPrimas();
});