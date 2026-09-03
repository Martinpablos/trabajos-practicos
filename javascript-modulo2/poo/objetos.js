

// class autos {
//     constructor (marca, modelo, color, año ){

//         this.marca=marca;
//         this.modelo=modelo;
//         this.color=color;
//         this.año=año;
//         this.Info= `el auto es un ${this.marca} modelo ${this.modelo} de color ${this.color} del año ${this.año}`;
//     }
//     exibirInfo() {
//         console.log(this.Info);
//     }
// }

// let auto1 =new autos ("ford", "mustang", "rojo", 1969);
// let auto2 =new autos ("chevrolet", "camaro", "gris", 1980);
// let auto3 =new autos ("dodge", "vaiper", "azul noche", 1999);
// let auto4 =new autos ("toyota", "supra", "negro", 1998);

// auto1.exibirInfo();
// auto2.exibirInfo();
// auto3.exibirInfo();
// auto4.exibirInfo();


// let auto5 =new autos ("nissan", "skyline", "azul", 1995);

// auto5.exibirInfo();

//
//
//class receta {
//    constructor (nombre, ingredientes, porciones ){
//
//        this.nombre=nombre;
//        this.ingredientes=ingredientes;
//        this.porciones=porciones;
//        this.Info= `El plato es ${this.nombre} hecho con ${this.ingredientes} y se sirven ${this.porciones} porciones.`;
//    }
//    exibirInfo() {
//        console.log(this.Info);
//    }
//}
//
//let receta1 =new receta ("pollo con salsa blanca y champignones", "pollo, crema,caldo,cebolla de verdeo, champignones,etc", 4);
//let receta2 =new receta ("lomo al malbec", "lomo, malbec, sal, pimienta, aceite de oliva, ajo", 4);
//let receta3 =new receta ("empanadas de carne cortadas a cuchillo", "bola de lomo, papas,cebolla,pimiento,aceitunas",12);
//
//receta1.exibirInfo();
//receta2.exibirInfo();
//receta3.exibirInfo();
//
//
//




let recetas = ('ingresa el numero de la receta que deseas ver: receta 1, receta 2, receta 3');
const menu = prompt(recetas); 

if (menu == '1') {
    console.log("pollo con salsa blanca y champignones", "pollo, crema,caldo,cebolla de verdeo, champignones,etc");
}
else if (menu == '2'){
    console.log("empanadas de carne cortadas a cuchillo", "bola de lomo, papas,cebolla,pimiento,aceitunas");
}
else if (menu == '3'){
    console.log("lomo al malbec", "lomo, malbec, sal, pimienta, aceite de oliva, ajo");
}
else {
    console.log('no existe la receta');
}

