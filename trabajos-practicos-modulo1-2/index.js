// ==========================================
// 1. CLASE Y ARRAY MAESTRO DE PRODUCTOS/RECETAS
// ==========================================
class Receta {
    constructor(id, nombre, descripcion, contiene, precio) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.contiene = contiene;
        this.precio = precio;
    }
}

const receta1 = new Receta(1, "Roulade-Arrollado", "Suave y liviano", "Queso crema, frutos rojos, frutas frescas, hojas de menta", 5600); 
const receta2 = new Receta(2, "Rogel", "Dulce y crocante", "Dulce de leche, merengue, batido de crema", 6200);
const receta3 = new Receta(3, "Panettone", "Esponjoso y dulce", "Chocolate, maní amargo, baño de crema batida", 4500);
const receta4 = new Receta(4, "Pavlova", "Dulce y tentadora", "Merengue francés, dulce de leche, crema batida, frutos rojos", 7800);

const recetas = [receta1, receta2, receta3, receta4];


// ==========================================
// 2. SISTEMA DE COMENTARIOS
// ==========================================

// Cargamos los comentarios previos de localStorage o un array vacío si no hay ninguno
const comentarios = JSON.parse(localStorage.getItem("comentariosCelicitas")) || [];

// Función para agregar un nuevo comentario
const agregarComentario = (event) => {
    if (event) event.preventDefault(); // Evitamos que el formulario recargue la página

    const inputNombre = document.getElementById("input-nombre-comentario");
    const inputTexto = document.getElementById("input-texto-comentario");

    if (!inputTexto || !inputTexto.value.trim()) {
        mostrarNotificacion("Por favor escribí un comentario.");
        return;
    }

    const nuevoComentario = {
        id: Date.now(), // Genera un ID único basado en el momento actual
        nombre: inputNombre && inputNombre.value.trim() !== "" ? inputNombre.value.trim() : "Anónimo",
        texto: inputTexto.value.trim(),
        fecha: new Date().toLocaleDateString('es-AR')
    };

    comentarios.push(nuevoComentario);

    // Guardamos en localStorage
    localStorage.setItem("comentariosCelicitas", JSON.stringify(comentarios));

    // Limpiamos los campos
    if (inputNombre) inputNombre.value = "";
    inputTexto.value = "";

    mostrarNotificacion("¡Comentario publicado!");
    renderComentarios();
};

// Función para borrar un comentario
const eliminarComentario = (id) => {
    const indice = comentarios.findIndex(c => c.id === id);
    if (indice !== -1) {
        comentarios.splice(indice, 1);
        localStorage.setItem("comentariosCelicitas", JSON.stringify(comentarios));
        renderComentarios();
        mostrarNotificacion("Comentario eliminado");
    }
};

// Función para renderizar los comentarios en el HTML
const renderComentarios = () => {
    const contenedorComentarios = document.getElementById("lista-comentarios");
    if (!contenedorComentarios) return;

    contenedorComentarios.innerHTML = "";

    if (comentarios.length === 0) {
        contenedorComentarios.innerHTML = `<p style="color: #666; font-style: italic;">Aún no hay comentarios. ¡Sé el primero en comentar!</p>`;
        return;
    }

    comentarios.forEach(c => {
        contenedorComentarios.innerHTML += 
        `<div class="card-comentario" style="display:flex; margin: auto; width:1000px; ">
            <div class="card-comentario" style="border: 1px solid #fc78; padding: 20px; margin: 15px 0; text-align: left; background-color: #fc72; border-radius:4px; width:100%;">
                <div style="display: flex; justify-content: space-between;">
                    <strong style="color: #333;">${c.nombre}</strong>
                    <small style="color: #5558;">${c.fecha}</small>
                </div>
                <p style="margin: 5px 0; color: #777;">${c.texto}</p>
                <button onclick="eliminarComentario(${c.id})" style="background: none; border: none; color: #d9534f; cursor: pointer; font-size: 0.7rem; padding: 0;">
                    Eliminar
                </button>
            </div>
        </div>
        `;
    });
};

// Cargar los comentarios al iniciar la página
document.addEventListener("DOMContentLoaded", () => {
    renderComentarios();
});


// ==========================================
// 3. CARRITO DE COMPRAS Y NOTIFICACIÓN POP-UP
// ==========================================

const productosCarrito = JSON.parse(localStorage.getItem("carritoCelicitas")) || [];

// Función para mostrar el Pop-up / Toast de confirmación sin usar alert()
const mostrarNotificacion = (mensaje) => {
    let toast = document.getElementById("toast-notificacion");

    // Si el contenedor no existe en el DOM, lo creamos dinámicamente
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast-notificacion";
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #bbce93;
            color: #ffffff;
            padding: 12px 20px;
            border-radius: 25px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            font-size: 0.95rem;
            font-weight: bold;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.4s ease, transform 0.4s ease;
            transform: translateY(20px);
            pointer-events: none;
        `;
        document.body.appendChild(toast);
    }

    toast.textContent = mensaje;
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";

    // Ocultar después de 2.5 segundos
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(20px)";
    }, 2500);
};

// Agregar al carrito
const agregarAlCarrito = (id) => {
    const producto = recetas.find(receta => receta.id === id);

    if (producto) {
        productosCarrito.push(producto);
        localStorage.setItem("carritoCelicitas", JSON.stringify(productosCarrito));
        
        // Reemplazamos el alert() por la notificación flotante
        mostrarNotificacion(`🛒 ${producto.nombre} agregado al carrito`);
    }
};



//==================================================
// lista de recetas que el usuario puede elegir y guardar como favoritas

//objeto a heredar para cada receta (class,constructor,this,new)

//class receta {
//    constructor(id,nombre,descripcion,contiene,precio){
//        this.id=id;
//        this.nombre=nombre;
//        this.descripcion=descripcion;
//        this.contiene=contiene;
//        this.precio=precio;
//    }
//} 
//
//const receta1 = new receta (1,"roulade-arrolado","suave y liviano","quesocrema,frutos rojos, frutas frescas, hojas de menta",5600); 
//const receta2 = new receta (2,"rogel","dulce y crocante", "dulce de leche, merengue, batido de crema",6200);
//const receta3 = new receta (3,"panetton","esponjoso y dulce", "chocolate, mani amargo, baño de crema batida",4500);
//const receta4 = new receta (4,"pavlova", "dulce y tentadora", "merengue frances, dulce de leche, crema batida, frutos rojos",7800);
//
//// //array maestro de recetas
//// //array para recetas favoritas del usuario, cuando el usuario elija una receta, se buscara en el array maestro y se pushea a este array de favoritos
//
//const recetas = [receta1, receta2 , receta3, receta4];
//
//// //funcion para que guarde las recetas marcadas como favoritas de parte del usuario, la funcion busca la receta segun lo que elige el usuario, en el array maestro, para poder guardarlas en el array favortias, utilizando el ID de cada receta seleccionada por el usuario.
//
//const favoritas = new Set();
//
//const recetaFavorita = (id)=>{
//    const recetaElegida = recetas.find((receta)=>receta.id===id);
//    if (!recetaElegida){
//        console.log(`receta no disponible en este momento`);
//        return;
//    }
//    if (favoritas.has(recetaElegida)){
//        favoritas.delete(recetaElegida)
//    }
//    else{
//        favoritas.add(recetaElegida)
//    }
//    console.log(`tus recetas favoritas son: `,[...favoritas])
//
//    localStorage.setItem("recetasFavoritas", JSON.stringify([...favoritas]));
//
//    renderFavoritas(favoritas);
//};
//
////no se debe duplicar lo guardado en favoritos
////se debe poder eliminar una receta de favoritos
////se debe mostrar el resultado total de recetas favoritas guardadas por el usuario
//
////funcion para mostrar las recetas guardadas como favoritaspor el usuario, con el array muestro su nombre y descripcion.
//
//const renderFavoritas = (listaDeFavs) => {
//    const contenedorFavoritas = document.getElementById("lista-favoritas");
//    
//    if (!contenedorFavoritas) return; 
//
//    contenedorFavoritas.innerHTML = "";
//    const arrayFavs = [...listaDeFavs];
//
//    arrayFavs.forEach(receta => {
//        contenedorFavoritas.innerHTML += `
//            <div class="card-favorita" style="border: 1px solid #ccc; margin: 10px; padding: 10px;">
//                <h4>${receta.nombre}</h4>
//                <p>${receta.descripcion}</p>
//                <button onclick="recetaFavorita(${receta.id})" class="btn-quitar">Eliminar</button>
//            </div>
//        `;
//    });
//};
//
////funcion para mostrar el carrito de compras.
//
////array de carrito.
//
////busco la receta en el array maestro, lo guardo a la lista con push y lo guardo en localstorage para que el otro html lo vea.
//
//
//const productosCarrito = JSON.parse(localStorage.getItem("carritoCelicitas")) || [];
//
//const agregarAlCarrito = (id) => {
//    const producto = recetas.find(receta => receta.id === id);
//
//    if (producto) {
//        productosCarrito.push(producto);
//        
//        localStorage.setItem("carritoCelicitas", JSON.stringify(productosCarrito));
//        
//        alert(`${producto.nombre} agregado al carrito`);
//    }
//};
//