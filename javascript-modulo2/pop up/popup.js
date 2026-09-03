

// PASO 1: Capturar o llamar los elementos mediante su ID
const btnAbrir = document.getElementById("btn-fav");
const btnCerrar = document.getElementById("btn-nofav");
const overlay = document.getElementById("overlay");
const spam = document.getElementById("spam");

// PASO 2: Función para ABRIR el popup
btnAbrir.addEventListener("click", () => {
  // Le agregamos la clase '.active' de CSS
    overlay.classList.add("active");
    spam.classList.add("active");
});

// PASO 3: Función para CERRAR el popup
btnCerrar.addEventListener("click", () => {
  // Le quitamos la clase '.active' de CSS
    overlay.classList.remove("active");
});

// OPCIONAL: Cerrar al hacer clic en el fondo oscuro fuera del cuadro
overlay.addEventListener("click", (e) => {
  // Verificamos que el clic haya sido directamente en el overlay y no adentro del cuadro
    if (e.target === overlay) {
    overlay.classList.remove("active");
    }
});


//const botoninicial = document.getElementById("boton-inicial");

//botoninicial.addEventListener("click", () => {})