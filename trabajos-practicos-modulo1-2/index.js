// lista de recetas que el usuario puede elegir y guardar como favoritas

//objeto a heredar para cada receta (class,constructor,this,new)

    class receta {
        constructor(id,nombre,descripcion,contiene,precio){
            this.id=id;
            this.nombre=nombre;
            this.descripcion=descripcion;
            this.contiene=contiene;
            this.precio=precio;
        }
    }

const receta1 = new receta (1,"roulade-arrolado","suave y liviano","quesocrema,frutos rojos, frutas frescas, hojas de menta",5600); 
const receta2 = new receta (2,"rogel","dulce y crocante", "dulce de leche, merengue, batido de crema",6200);
const receta3 = new receta (3,"panetton","esponjoso y dulce", "chocolate, mani amargo, baño de crema batida",4500);
const receta4 = new receta (4,"pavlova", "dulce y tentadora", "merengue frances, dulce de leche, crema batida, frutos rojos",7800);

// //array maestro de recetas
// //array para recetas favoritas del usuario, cuando el usuario elija una receta, se buscara en el array maestro y se pushea a este array de favoritos

const recetas = [receta1, receta2 , receta3, receta4];

// //funcion para que guarde las recetas marcadas como favoritas de parte del usuario, la funcion busca la receta segun lo que elige el usuario, en el array maestro, para poder guardarlas en el array favortias, utilizando el ID de cada receta seleccionada por el usuario.

const favoritas = new Set();

const recetaFavorita = (id)=>{
    const recetaElegida = recetas.find((receta)=>receta.id===id);
    if (!recetaElegida){
        console.log(`receta no disponible en este momento`);
        return;
    }
    if (favoritas.has(recetaElegida)){
        favoritas.delete(recetaElegida)
    }
    else{
        favoritas.add(recetaElegida)
    }
    console.log(`tus recetas favoritas son: `,[...favoritas])

    localStorage.setItem("recetasFavoritas", JSON.stringify([...favoritas]));

    renderFavoritas(favoritas);
};

//no se debe duplicar lo guardado en favoritos
//se debe poder eliminar una receta de favoritos
//se debe mostrar el resultado total de recetas favoritas guardadas por el usuario

//funcion para mostrar las recetas guardadas como favoritaspor el usuario, con el array muestro su nombre y descripcion.

const renderFavoritas = (listaDeFavs) => {
    const contenedorFavoritas = document.getElementById("lista-favoritas");
    
    if (!contenedorFavoritas) return; 

    contenedorFavoritas.innerHTML = "";
    const arrayFavs = [...listaDeFavs];

    arrayFavs.forEach(receta => {
        contenedorFavoritas.innerHTML += `
            <div class="card-favorita" style="border: 1px solid #ccc; margin: 10px; padding: 10px;">
                <h4>${receta.nombre}</h4>
                <p>${receta.descripcion}</p>
                <button onclick="recetaFavorita(${receta.id})" class="btn-quitar">Eliminar</button>
            </div>
        `;
    });
};

//funcion para mostrar el carrito de compras.

//array de carrito.

//busco la receta en el array maestro, lo guardo a la lista con push y lo guardo en localstorage para que el otro html lo vea.


const productosCarrito = JSON.parse(localStorage.getItem("carritoCelicitas")) || [];

const agregarAlCarrito = (id) => {
    const producto = recetas.find(receta => receta.id === id);

    if (producto) {
        productosCarrito.push(producto);
        
        localStorage.setItem("carritoCelicitas", JSON.stringify(productosCarrito));
        
        alert(`${producto.nombre} agregado al carrito`);
    }
};

