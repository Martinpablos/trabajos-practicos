const calcularCarrito = (subTotal) => { 
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

const botonVaciar = document.getElementById("vaciar-carrito");
if (botonVaciar) {
    botonVaciar.addEventListener("click", () => {
        localStorage.removeItem("carritoCelicitas"); //borro
        location.reload(); //recargo vacio
    });
}


const mostrarCarrito = () => {
    const contenedorItems = document.getElementById("lista-items-dinamicos");
    const cantProd = document.getElementById("cant-prod");
    const subtotalDisplay = document.getElementById("subtotal-display");
    const descuentoDisplay = document.getElementById("descuento-display");
    const envioDisplay = document.getElementById("envio-display");
    const totalDisplay = document.getElementById("total-final-display");

    const datosGuardados = JSON.parse(localStorage.getItem("carritoCelicitas")) || [];

    if (!contenedorItems) return;

    if (datosGuardados.length === 0) {
        contenedorItems.innerHTML = "<p>¡Tentate con algo! Agrega al carrito.</p>";
        // Limpia los números si está vacío
        if(cantProd) cantProd.innerText = "0";
        if(subtotalDisplay) subtotalDisplay.innerText = "$0";
        if(totalDisplay) totalDisplay.innerText = "$0";
        return;
    }

    let acumuladorSubtotal = 0;
    contenedorItems.innerHTML = "";

    datosGuardados.forEach(item => {
        acumuladorSubtotal += item.precio;
        contenedorItems.innerHTML += `
            <div class="item-carrito-lista" style="border-bottom: 1px solid #eee; padding: 10px 0; display: flex; justify-content: space-between;">
                <span><strong>${item.nombre}</strong></span>
                <span>$${item.precio}</span>
            </div>
        `;
    });

    const beneficios = calcularCarrito(acumuladorSubtotal);

    if(cantProd) cantProd.innerText = datosGuardados.length;
    if(subtotalDisplay) subtotalDisplay.innerText = `$${acumuladorSubtotal}`;
    if(descuentoDisplay) descuentoDisplay.innerText = `-$${beneficios.descuento.toFixed(0)}`;
    if(envioDisplay) envioDisplay.innerText = beneficios.envio;
    if(totalDisplay) totalDisplay.innerText = `$${beneficios.total.toFixed(0)}`;
};

document.addEventListener("DOMContentLoaded", mostrarCarrito);