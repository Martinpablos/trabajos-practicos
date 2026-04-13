/**
let numero1, numero2,numero3,numero4;

numero1=4;
numero2=6;
numero3=8;
numero4=16;

console.log("dos y dos son:", numero1,"cuatro y dos son:", numero2,"seis y dos son:", numero3,"y ocho:",numero4);


let numeros,numeros2;

numeros=[1,2];
numeros2=[,10,9];

console.log(numeros+numeros2);


let sumas,sumas2;
sumas=24;
sumas2=12;
console.log(sumas+sumas2);

let i=0;

for(let i=0;i<=5;i++)
    { 
        if(parseInt(i)===2)
            {alert("numero par")}
        else if(parseInt(i)===3)
        {alert("numero impar")}

    console.log(i);
}


let nombre= prompt("decime tu nombre");
{
    alert("bienvenido "+nombre);

}
 */ 

/**sentencia:continue 

let i = 0;

for ( let i= 0; i<=20; i++){
    if (i === 12) {
    continue; 
    }
    document.write(i+ "<br>");
}

*/

/** array+continue 

let palabras = ["programa","computadora","culo","comida","amor","computadora","culo","comida","amor","computadora","culo","comida","amor","computadora","culo","comida","amor"];

for (let i = 0; i < palabras.length ; i++){
    if (palabras [i]=== "culo"){
        continue;
    }
    document.write (palabras [i] + "<br>");
}

*/

// let palabras1 = ["programa","computadora","culo","comida","amor","computadora"];
// let palabras2 = ["coca","fanta","sprite",palabras1,"manaos"];

// for (let palabra in palabras2){
//     if (palabra == 3){

//         for (let palabra of palabras1){

//             if (palabra === "culo"){
//             continue;
//         }
//         console.log (palabra);
//     }
//         } else {
//             console.log(palabras2[palabra]);
//         }
//     }  


// let frase = "bienvenido a mi pagina web ${nombre}";

// function saludar(nombre) {
//     console.log(frase.replace("${nombre}", nombre));
// }

// saludar("martin");

// let pollo = 20;

// function calcularPropina (precio) { 
//     let propina = precio + (precio/10);
//     console.log("el precio del plato es: " + propina);
// } 
// calcularPropina (pollo);
    

class Entrenamiento {
    constructor (ejercicio,series,repeticiones){
        this.ejercicio =ejercicio;
        this.series =series;
        this.repeticiones =repeticiones;
    }
    obtenerTexto(){
        return (`hoy es dia de ${this.ejercicio} van a ser  ${this.series} series de ${this.repeticiones} con descanso de 1 minuto entre series`);
    }
}

let entrenamiento1 = new Entrenamiento ("piernas", 3, 10);
let entrenamiento2 = new Entrenamiento ("pecho", 4, 10);
let entrenamiento3 = new Entrenamiento ("espalda", 4, 10);
let entrenamiento4 = new Entrenamiento ("brazos", 3, 10);

console.log(entrenamiento1.obtenerTexto());
console.log(entrenamiento2.obtenerTexto());
console.log(entrenamiento3.obtenerTexto());
console.log(entrenamiento4.obtenerTexto());

