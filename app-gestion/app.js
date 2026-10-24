// Importar Firebase desde los CDNs oficiales (versión modular 10)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. TU CONFIGURACIÓN DE FIREBASE 
// (Estos datos te los da Firebase gratis cuando creás un proyecto en su consola)
const firebaseConfig = {
    apiKey: "TU_API_KEY_AQUI",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "TU_SENDER_ID",
    appId: "TU_APP_ID"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 2. FUNCIÓN PARA LEER MATERIA PRIMA DESDE FIREBASE
async function cargarMateriasPrimas() {
    const tabla = document.getElementById("tabla-materia-prima");
    if (!tabla) return;

    tabla.innerHTML = ""; // Limpiar tabla
    
    try {
        const querySnapshot = await getDocs(collection(db, "materiaPrima"));
        querySnapshot.forEach((doc) => {
            const item = doc.data();
            tabla.innerHTML += `
                <tr>
                    <td>${item.nombre}</td>
                    <td>${item.cantidad}</td>
                    <td>$${item.precio}</td>
                    <td>$${(item.precio / item.cantidad).toFixed(2)}</td>
                    <td><span class="badge bg-success">Disponible (${item.stock}kg)</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-secondary">Editar</button>
                    </td>
                </tr>
            `;
        });
    } catch (e) {
        console.error("Error al cargar datos de Firebase: ", e);
    }
}

// 3. FUNCIÓN PARA GUARDAR NUEVA MATERIA PRIMA EN LA NUBE
async function guardarMateriaPrima(nombre, cantidad, precio, stock) {
    try {
        await addDoc(collection(db, "materiaPrima"), {
            nombre: nombre,
            cantidad: Number(cantidad),
            precio: Number(precio),
            stock: Number(stock),
            fecha: new Date()
        });
        console.log("¡Guardado exitoso en Firebase!");
        cargarMateriasPrimas(); // Recargar la tabla automáticamente
    } catch (e) {
        console.error("Error al guardar en Firebase: ", e);
    }
}

// Ejecutar al iniciar la app
document.addEventListener("DOMContentLoaded", () => {
    cargarMateriasPrimas();
});