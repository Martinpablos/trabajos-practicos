// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDa4nqcc3-ZWBk51cZPxJeegvyHEYMT_hg",
    authDomain: "sistema-celi.firebaseapp.com",
    projectId: "sistema-celi",
    storageBucket: "sistema-celi.firebasestorage.app",
    messagingSenderId: "167240526122",
    appId: "1:167240526122:web:b160382d6c4087a6435653",
    measurementId: "G-39YYQFK8QV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

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


import { doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Capturar el envío del formulario de manera correcta
const formMateriaPrima = document.getElementById("formMateriaPrima");
if (formMateriaPrima) {
    formMateriaPrima.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nombre = document.getElementById("mpNombre").value;
        const cantidad = document.getElementById("mpCantidad").value;
        const precio = document.getElementById("mpPrecio").value;
        const stock = document.getElementById("mpStock").value;

        // Ahora sí, el await está dentro de una función async (el addEventListener)
        await guardarMateriaPrima(nombre, cantidad, precio, stock);

        // Limpiar formulario y cerrar modal
        formMateriaPrima.reset();
        const modalEl = document.getElementById('modalMateriaPrima');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
    });
}