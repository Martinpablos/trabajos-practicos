//moldes para las recetas, aplico herencia al igual que en la lista de favoritas, pero esta vez con los precios, para poder darles el uso en la calculadora de precios del carrito de compras.

// ... (Clase receta y constantes de recetas igual)

const calcularCarrito = (subTotal) => { // Cambiado nombre aquí
    let envio = "Envío: $3000";
    let descuento = 0;
    
    if (subTotal >= 20000) {
        descuento = subTotal * 0.20;
        envio = '¡Envío gratis!';
    } else if (subTotal >= 15000) {
        descuento = subTotal * 0.15;
        envio = 'Coste del envío: $750 (75% OFF)';
    } else if (subTotal >= 10000) {
        descuento = subTotal * 0.07;
        envio = 'Coste del envío: $1500 (50% OFF)';
    }

    return {
        envio: envio,
        descuento: descuento,
        total: subTotal - descuento
    };
};

const mostrarCarrito = () => {
    const contenedorItems = document.getElementById("lista-items-dinamicos"); // ID nuevo para no borrar el resumen
    const datosGuardados = JSON.parse(localStorage.getItem("carritoCelicitas")) || [];

    if (datosGuardados.length === 0) {
        if(contenedorItems) contenedorItems.innerHTML = "<p>Tu carrito está vacío 🍰</p>";
        return;
    }

    let acumuladorSubtotal = 0;
    contenedorItems.innerHTML = "";

    datosGuardados.forEach(item => {
        acumuladorSubtotal += item.precio;
        contenedorItems.innerHTML += `
            <div class="item-carrito-lista">
                <p><strong>${item.nombre}</strong> - $${item.precio}</p>
            </div>
        `;
    });

    const beneficios = calcularCarrito(acumuladorSubtotal);

    // Actualizamos los campos del Resumen de Compra
    document.getElementById("cant-prod").innerText = datosGuardados.length;
    document.getElementById("subtotal-display").innerText = `$${acumuladorSubtotal}`;
    document.getElementById("descuento-display").innerText = `-$${beneficios.descuento}`;
    document.getElementById("envio-display").innerText = beneficios.envio;
    document.getElementById("total-final-display").innerText = `$${beneficios.total}`;
};

window.onload = mostrarCarrito;