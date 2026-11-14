import { db } from "./app.js";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. Cargar y renderizar la tabla de Clientes
export async function cargarClientes() {
    const tabla = document.getElementById("tabla-clientes"); // Asegurate que coincida con el ID de tu tabla
    if (!tabla) return;

    tabla.innerHTML = "";

    try {
        const querySnapshot = await getDocs(collection(db, "clientes"));
        
        // 1. Pasamos los datos a un array (arreglo)
        let listaClientes = [];
        querySnapshot.forEach((docSnap) => {
            listaClientes.push({ id: docSnap.id, ...docSnap.data() });
        });

        // 2. Ordenamos alfabéticamente por el campo 'nombre'
        listaClientes.sort((a, b) => {
            const nombreA = a.nombre || "";
            const nombreB = b.nombre || "";
            return nombreA.localeCompare(nombreB);
        });

        // 3. Recorremos el array ya ordenado para armar la tabla
        listaClientes.forEach((c) => {
            tabla.innerHTML += `
                <tr>
                    <td>
                        <button class="btn btn-sm btn-outline-success me-1" onclick="abrirModalPago('${c.id}', '${c.nombre}', ${c.deuda || 0})">💵 Pagar</button>
                        <button class="btn btn-sm btn-outline-secondary me-1" onclick="editarCliente('${c.id}')">Editar</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="eliminarCliente('${c.id}')">Eliminar</button>
                    </td>
                    <td>${c.nombre}</td>
                    <td>${c.dni || 'S/N'}</td>
                    <td>${c.telefono || '-'}</td>
                    <td>$${(Number(c.deuda) || 0).toFixed(2)}</td>
                    <td>
                        <!-- tus botones de acción -->
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

// 6. Abrir modal para registrar pago de deuda
window.abrirModalPago = function(id, nombre, deudaActual) {
    document.getElementById("pagoClienteId").value = id;
    document.getElementById("tituloModalPago").textContent = `Registrar Pago: ${nombre} (Deuda actual: $${deudaActual.toFixed(2)})`;
    document.getElementById("montoPago").value = "";

    const modalElement = document.getElementById("modalPago");
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
};

// 7. Procesar el pago del cliente
document.addEventListener("DOMContentLoaded", () => {
    const formPago = document.getElementById("formPago");
    if (formPago) {
        formPago.addEventListener("submit", async (e) => {
            e.preventDefault();

            const idCliente = document.getElementById("pagoClienteId").value;
            const montoAbonado = Number(document.getElementById("montoPago").value) || 0;

            if (montoAbonado <= 0) {
                alert("Por favor, ingresá un monto válido.");
                return;
            }

            try {
                const refCliente = doc(db, "clientes", idCliente);
                const snapCliente = await getDoc(refCliente);

                if (snapCliente.exists()) {
                    const dataCliente = snapCliente.data();
                    const deudaActual = Number(dataCliente.deuda) || 0;

                    // Restamos el pago a la deuda (evitamos que quede en negativo por seguridad)
                    const nuevaDeuda = Math.max(0, deudaActual - montoAbonado);

                    await updateDoc(refCliente, { deuda: nuevaDeuda });

                    // Opcional: Registrar el ingreso en la colección de caja o ventas si lo deseas
                    await addDoc(collection(db, "pagosClientes"), {
                        idCliente,
                        nombreCliente: dataCliente.nombre,
                        monto: montoAbonado,
                        fecha: new Date()
                    });

                    alert(`¡Pago registrado con éxito! Nueva deuda: $${nuevaDeuda.toFixed(2)}`);

                    // Cerrar modal y recargar tabla de forma limpia
                    document.activeElement.blur();
                    const modalElement = document.getElementById("modalPago");
                    const modalInstance = bootstrap.Modal.getInstance(modalElement);
                    if (modalInstance) {
                        modalInstance.hide();
                    }
                    formPago.reset();
                    cargarClientes();
                }
            } catch (error) {
                console.error("Error al registrar el pago: ", error);
                alert("Hubo un error al procesar el pago.");
            }
        });
    }
});