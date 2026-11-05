import { db } from "./app.js";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. Cargar y renderizar la tabla de Clientes
export async function cargarClientes() {
    const tabla = document.getElementById("tabla-clientes");
    if (!tabla) return;

    tabla.innerHTML = "";

    try {
        const querySnapshot = await getDocs(collection(db, "clientes"));
        
        querySnapshot.forEach((docSnap) => {
            const cliente = docSnap.data();
            const id = docSnap.id;
            const deudaActual = Number(cliente.deuda) || 0;

            tabla.innerHTML += `
                <tr>
                    <td><strong>${cliente.nombre || "Sin nombre"}</strong></td>
                    <td>${cliente.dni || "-"}</td>
                    <td>${cliente.telefono || "-"}</td>
                    <td>
                        <span class="fw-bold ${deudaActual > 0 ? 'text-danger' : 'text-success'}">
                            $${deudaActual.toFixed(2)}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-secondary me-1" onclick="editarCliente('${id}')">Editar</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="eliminarCliente('${id}')">Eliminar</button>
                    </td>
                </tr>
            `;
        });
    } catch (e) {
        console.error("Error al cargar clientes: ", e);
    }
}

// 2. Guardar o actualizar cliente desde el formulario
document.addEventListener("DOMContentLoaded", () => {
    const formCliente = document.getElementById("formCliente");
    if (formCliente) {
        formCliente.addEventListener("submit", async (e) => {
            e.preventDefault();

            const id = document.getElementById("clienteId").value;
            const nombre = document.getElementById("nombreCliente").value;
            const dni = document.getElementById("dniCliente").value;
            const telefono = document.getElementById("telefonoCliente").value;

            try {
                if (id) {
                    // Editar existente
                    const refDoc = doc(db, "clientes", id);
                    await updateDoc(refDoc, { nombre, dni, telefono });
                } else {
                    // Crear nuevo (con deuda inicial en 0)
                    await addDoc(collection(db, "clientes"), {
                        nombre,
                        dni,
                        telefono,
                        deuda: 0
                    });
                }

                // Limpiar form y cerrar modal
                formCliente.reset();
                document.getElementById("clienteId").value = "";
                const modalElement = document.getElementById("modalCliente");
                bootstrap.Modal.getInstance(modalElement).hide();

                cargarClientes();
            } catch (e) {
                console.error("Error al guardar cliente: ", e);
            }
        });
    }
});

// 3. Preparar edición de cliente
window.editarCliente = async function(id) {
    try {
        const docRef = doc(db, "clientes", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const cliente = docSnap.data();
            document.getElementById("clienteId").value = id;
            document.getElementById("nombreCliente").value = cliente.nombre || "";
            document.getElementById("dniCliente").value = cliente.dni || "";
            document.getElementById("telefonoCliente").value = cliente.telefono || "";
            document.getElementById("tituloModalCliente").textContent = "Editar Cliente";

            const modalElement = document.getElementById("modalCliente");
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
    } catch (e) {
        console.error("Error al cargar cliente para editar: ", e);
    }
};

// 4. Eliminar cliente
window.eliminarCliente = async function(id) {
    if (confirm("¿Estás seguro de que querés eliminar este cliente?")) {
        try {
            await deleteDoc(doc(db, "clientes", id));
            cargarClientes();
        } catch (e) {
            console.error("Error al eliminar cliente: ", e);
        }
    }
};

// 5. Buscador de Clientes
export function inicializarBuscadorClientes() {
    const buscadorClientes = document.getElementById("buscadorClientes");
    if (buscadorClientes) {
        buscadorClientes.addEventListener("input", (e) => {
            const texto = e.target.value.toLowerCase();
            const filas = document.querySelectorAll("#tabla-clientes tr");

            filas.forEach(fila => {
                const textoFila = fila.textContent.toLowerCase();
                if (textoFila.includes(texto)) {
                    fila.style.display = "";
                } else {
                    fila.style.display = "none";
                }
            });
        });
    }
}

// En lugar de recorrer el snapshot directamente, lo pasamos a un array:
let listaClientes = [];
querySnapshot.forEach((docSnap) => {
    listaClientes.push({ id: docSnap.id, ...docSnap.data() });
});

// Ordenamos alfabéticamente por el campo 'nombre'
listaClientes.sort((a, b) => a.nombre.localeCompare(b.nombre));

// Ahora recorremos la lista ya ordenada para dibujarla en la tabla
listaClientes.forEach((c) => {
    // Tu código para pintar la fila en la tabla...s
});