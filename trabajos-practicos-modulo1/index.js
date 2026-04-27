// lista de recetas que el usuario puede elegir y guardar como favoritas

//objeto a heredar para cada receta (class,constructor,this,new)

    class receta {
        constructor(id,nombre,descripcion,contiene){
            this.id=id;
            this.nombre=nombre;
            this.descripcion=descripcion;
            this.contiene=contiene;
        }
    }

const receta1 = new receta (1,"roulade-arrolado","suave y liviano","quesocrema,frutos rojos, frutas frescas, hojas de menta"); 
const receta2 = new receta (2,"rogel","dulce y crocante", "dulce de leche, merengue, batido de crema");
const receta3 = new receta (3,"panetton","esponjoso y dulce", "chocolate, mani amargo, baño de crema batida");
const receta4 = new receta (4,"pavlova", "dulce y tentadora", "merengue frances, dulce de leche, crema batida, frutos rojos");

//array maestro de recetas
//array para recetas favoritas del usuario, cuando el usuario elija una receta, se buscara en el array maestro y se pushea a este array de favoritos

const recetas = [receta1, receta2 , receta3, receta4];
const favoritas = [];

//funcion para pushear recetas al array de favoritas, se le pasa el id de la receta que el usuario elige, se busca en el array maestro y se guarda en el array favoritas.

const listaFavoritas = (id) => {
    const recetaElegida = recetas.find((receta)=> receta.id === id);
    if()
}


//no se debe duplicar lo guardado en favoritos
//se debe poder eliminar una receta de favoritos
//se debe mostrar el resultado total de recetas favoritas guardadas por el usuario

