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

// //array maestro de recetas
// //array para recetas favoritas del usuario, cuando el usuario elija una receta, se buscara en el array maestro y se pushea a este array de favoritos

// const recetas = [receta1, receta2 , receta3, receta4];
// const favoritas = [];

// //funcion para que guarde las recetas marcadas como favoritas de parte del usuario, la funcion busca la receta segun lo que elige el usuario, en el array maestro, para poder guardarlas en el array favortias, utilizando el ID de cada receta seleccionada por el usuario.

// const recetasFavoritas = (id) => {
//     const recetaElegida = recetas.find((receta)=> receta.id === id);
//         if (recetaElegida){
//             favoritas.push(recetaElegida)
//             console.log(`guardado: ${recetaElegida,nombre}`)
//         }
// }


//no se debe duplicar lo guardado en favoritos
//se debe poder eliminar una receta de favoritos
//se debe mostrar el resultado total de recetas favoritas guardadas por el usuario



const recetas = [receta1, receta2, receta3, receta4];
// Cambiamos el array [] por un Set para que el profe vea que aplicaste su consejo
const favoritas = new Set(); 

const gestionarFavoritos = (id) => {
    // 1. Buscamos la receta en el maestro
    const recetaElegida = recetas.find((receta) => receta.id === id);

    // Si no existe la receta (por las dudas), cortamos acá
    if (!recetaElegida) return;

    // 2. Usamos el método .has() del Set para saber si ya existe
    if (favoritas.has(recetaElegida)) {
        // SI YA ESTÁ: La quitamos
        favoritas.delete(recetaElegida);
        console.log(`Eliminado: ${recetaElegida.nombre}`);
    } else {
        // SI NO ESTÁ: La agregamos
        favoritas.add(recetaElegida);
        console.log(`Guardado: ${recetaElegida.nombre}`);
    }

    // Para que veas en consola cómo crece o achica la lista
    console.log("Tus favoritos actuales:", [...favoritas]);
}