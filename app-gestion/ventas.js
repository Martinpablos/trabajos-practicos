import { db } from "./app.js";
import { collection, getDocs, addDoc, doc, updateDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let carrito = [];

// 1. Cargar los selects de Clientes y Productos en la pantalla de ventas
export async function inicializarSelectsVenta() {
    const selectCliente = document.getElementById("selectCliente");
    const selectProducto = document.getElementById("selectProductoVenta");

    if (!selectCliente || !selectProducto) return;

    // Cargar Clientes
    selectCliente.innerHTML = `<option value="">Seleccionar cliente...</option>`;
    const snapClientes = await getDocs(collection(db, "clientes"));
    snapClientes.forEach(docSnap => {
        const c = docSnap.data();
        selectCliente.innerHTML += `<option value="${docSnap.id}">${c.nombre} (DNI: ${c.dni || 'S/N'})</option>`;
    });

    // Cargar Productos Terminados (con su precio minorista por defecto)
    selectProducto.innerHTML = `<option value="">Seleccionar producto...</option>`;
    const snapRecetas = await getDocs(collection(db, "recetas"));
    snapRecetas.forEach(docSnap => {
        const r = docSnap.data();
        if (r.tipo === "producto_final" || r.tipo === "final") {
            const costo = Number(r.costoUnitario) || 0;
            const margen = r.margenMinorista !== undefined ? Number(r.margenMinorista) : 100;
            const precioVenta = costo * (1 + margen / 100);

            selectProducto.innerHTML += `
                <option value="${docSnap.id}" data-nombre="${r.nombre}" data-precio="${precioVenta}" data-stock="${r.stock || 0}">
                    ${r.nombre} - Stock: ${r.stock || 0}u. ($${precioVenta.toFixed(2)})
                </option>
            `;
        }
    });
}

// 2. Manejo del Carrito
export function configurarCarrito() {
    const btnAgregar = document.getElementById("btnAgregarCarrito");
    if (!btnAgregar) return;

    btnAgregar.addEventListener("click", () => {
        const selectProd = document.getElementById("selectProductoVenta");
        const cantidadInput = document.getElementById("cantidadVenta");

        const idProducto = selectProd.value;
        if (!idProducto) {
            alert("Seleccioná un producto.");
            return;
        }

        const option = selectProd.options[selectProd.selectedIndex];
        const nombre = option.getAttribute("data-nombre");
        const precio = Number(option.getAttribute("data-precio"));
        const stockDisponible = Number(option.getAttribute("data-stock"));
        const cantidad = Number(cantidadInput.value);

        if (cantidad <= 0) {
            alert("La cantidad debe ser mayor a 0.");
            return;
        }

        // Validar si hay stock suficiente en productos terminados
        // Sumamos si ya estaba en el carrito
        const itemExistente = carrito.find(item => item.idProducto === idProducto);
        const cantidadEnCarrito = itemExistente ? itemExistente.cantidad : 0;

        if ((cantidadEnCarrito + cantidad) > stockDisponible) {
            alert(`Stock insuficiente. Stock disponible: ${stockDisponible} unidades.`);
            return;
        }

        if (itemExistente) {
            itemExistente.cantidad += cantidad;
            itemExistente.subtotal = itemExistente.cantidad * itemExistente.precioUnitario;
        } else {
            carrito.push({
                idProducto,
                nombre,
                cantidad,
                precioUnitario: precio,
                subtotal: cantidad * precio
            });
        }

        renderizarCarrito();
    });
}

function renderizarCarrito() {
    const tabla = document.getElementById("tabla-carrito");
    const spanTotal = document.getElementById("totalCarrito");
    if (!tabla) return;

    tabla.innerHTML = "";
    let totalGeneral = 0;

    carrito.forEach((item, index) => {
        totalGeneral += item.subtotal;
        tabla.innerHTML += `
            <tr>
                <td>${item.nombre}</td>
                <td>${item.cantidad}</td>
                <td>$${item.subtotal.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="window.eliminarItemCarrito(${index})">❌</button>
                </td>
            </tr>
        `;
    });

    spanTotal.textContent = totalGeneral.toFixed(2);
}

window.eliminarItemCarrito = function(index) {
    carrito.splice(index, 1);
    renderizarCarrito();
};

// 3. Registrar la Venta en Firebase
export function configurarRegistroVenta() {
    const btnRegistrar = document.getElementById("btnRegistrarVenta");
    if (!btnRegistrar) return;

    btnRegistrar.addEventListener("click", async () => {
        const idCliente = document.getElementById("selectCliente").value;
        const medioPago = document.getElementById("medioPago").value;

        if (!idCliente) {
            alert("Por favor, seleccioná un cliente para registrar la venta.");
            return;
        }

        if (carrito.length === 0) {
            alert("El carrito está vacío.");
            return;
        }

        let totalVenta = carrito.reduce((acc, item) => acc + item.subtotal, 0);

        try {
            // A. Registrar la venta en la colección "ventas"
            await addDoc(collection(db, "ventas"), {
                idCliente,
                items: carrito,
                total: totalVenta,
                medioPago,
                fecha: serverTimestamp()
            });

            // B. Descontar stock de productos terminados y de sus materias primas (ingredientes)
            for (const item of carrito) {
                const idReceta = item.idProducto;
                const cantidadVendida = Number(item.cantidad) || 0;

                const refReceta = doc(db, "recetas", idReceta);
                const snapReceta = await getDoc(refReceta);

                if (snapReceta.exists()) {
                    const recetaData = snapReceta.data();
                    
                    // 1. Descontar stock del producto terminado
                    const stockActualReceta = Number(recetaData.stock) || 0;
                    const nuevoStockReceta = Math.max(0, stockActualReceta - cantidadVendida);
                    await updateDoc(refReceta, { stock: nuevoStockReceta });

                    // 2. Descontar stock de cada materia prima/ingrediente utilizado
                    if (recetaData.ingredientes && Array.isArray(recetaData.ingredientes)) {
                        for (const ing of recetaData.ingredientes) {
                            // ing.idInsumo tiene el ID de la materia prima
                            // ing.cantidadUsada es lo que consume 1 sola unidad de la receta
                            if (ing.idInsumo && ing.idInsumo !== "no-encontrado") {
                                const totalDescontar = ing.cantidadUsada * cantidadVendida;

                                const refMateria = doc(db, "materiaPrima", ing.idInsumo);
                                const snapMateria = await getDoc(refMateria);

                                if (snapMateria.exists()) {
                                    const materiaData = snapMateria.data();
                                    // Usamos el campo "stock" para restar el inventario físico, 
                                    // dejando intactos 'cantidad' y 'precio' para que el costo no se altere.
                                    const stockMateriaActual = Number(materiaData.stock) || 0;
                                    const nuevoStockMateria = Math.max(0, stockMateriaActual - totalDescontar);

                                    await updateDoc(refMateria, { stock: nuevoStockMateria });
                                }
                            }
                        }
                    }
                }
            }

            // C. Si es Cuenta Corriente, sumar la deuda al cliente seleccionado
            if (medioPago === "cuenta_corriente") {
                const refCliente = doc(db, "clientes", idCliente);
                const snapCliente = await getDoc(refCliente);
                if (snapCliente.exists()) {
                    const deudaActual = Number(snapCliente.data().deuda) || 0;
                    await updateDoc(refCliente, { deuda: deudaActual + totalVenta });
                }
            }

            alert("¡Venta registrada con éxito y stock actualizado!");
            
            // Limpiar carrito y formulario
            carrito = [];
            renderizarCarrito();
            document.getElementById("formVenta").reset();
            inicializarSelectsVenta();
            cargarRegistroDiario();

        } catch (e) {
            console.error("Error al registrar la venta: ", e);
            alert("Hubo un error al registrar la venta.");
        }
    });
}

// 4. Cargar el Registro Diario de Ventas
export async function cargarRegistroDiario(filtro = "todos") {
    const tabla = document.getElementById("tabla-registro-diario");
    if (!tabla) return;

    tabla.innerHTML = "";

    try {
        const querySnapshot = await getDocs(collection(db, "ventas"));
        
        querySnapshot.forEach((docSnap) => {
            const venta = docSnap.data();
            
            if (filtro === "todos" || venta.medioPago === filtro) {
                let badgeClass = "bg-secondary";
                if (venta.medioPago === "efectivo") badgeClass = "bg-success";
                if (venta.medioPago === "transferencia") badgeClass = "bg-primary";
                if (venta.medioPago === "cuenta_corriente") badgeClass = "bg-danger";

                tabla.innerHTML += `
                    <tr class="border-bottom">
                        <td class="py-2">
                            <div class="d-flex justify-content-between">
                                <span class="badge ${badgeClass}">${venta.medioPago.toUpperCase()}</span>
                                <span class="fw-bold text-success">$${Number(venta.total).toFixed(2)}</span>
                            </div>
                            <small class="text-muted">Ítems: ${venta.items.length} prod.</small>
                        </td>
                    </tr>
                `;
            }
        });
    } catch (e) {
        console.error("Error al cargar registro diario: ", e);
    }
}

// 5. Configurar los botones de filtro del registro diario
export function inicializarFiltrosRegistro() {
    const botonesFiltro = document.querySelectorAll("[data-filtro]");
    botonesFiltro.forEach(btn => {
        btn.addEventListener("click", (e) => {
            botonesFiltro.forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            const filtro = e.target.getAttribute("data-filtro");
            cargarRegistroDiario(filtro);
        });
    });
}