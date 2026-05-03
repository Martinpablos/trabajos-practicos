//moldes para las recetas, aplico herencia al igual que en la lista de favoritas, pero esta vez con los precios, para poder darles el uso en la calculadora de precios del carrito de compras.

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

//

const carrito = (subTotal) =>{
    const envio="envio "+3000;
    const descuento=0;
    const total=subTotal+envio-descuento;


    if(subTotal >= 10000){
        descuento=subTotal*0.07;
        envio='coste del envio: 1500$ , descuento del 50% aplicado';
    }

    else if  (subTotal >=15000){
        descuento=subTotal*0.15;
        envio='coste del envio: 750$ , descuento del 75% aplicado';
    }

    else if (subTotal >=20000){
        descuento=subTotal*0.20;
        envio='¡Envio gratis!';
    }

    total=subTotal-descuento;

    return {
        envio: envio,
        descuento: descuento,
        total: total
    };
};