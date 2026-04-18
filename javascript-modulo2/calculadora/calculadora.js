const sumar = (num1, num2) => {
    return parseInt(num1) + parseInt(num2);
}
const restar = (num1, num2) => {
    return parseInt(num1) - parseInt(num2);
}
const dividir = (num1, num2) => {
    return parseInt(num1) / parseInt(num2);
}
const multiplicar = (num1, num2) => {
    return parseInt(num1) * parseInt(num2);
}
alert ("¿que operacion desea realizar?");
let operacion= prompt ("1: sumar, 2: restar, 3: dividir, 4: multiplicar");

if (operacion == 1) {
    const numero1 = prompt("ingresar");
    const numero2 = prompt("ingresar");
    resultado = sumar(numero1, numero2);
    alert(`el resultado es ${resultado}`);
}

else if (operacion == 2) {
    const numero1 = prompt("ingresar");
    const numero2 = prompt("ingresar");
    resultado = restar(numero1, numero2);
    alert(`el resultado es ${resultado}`);
}

else if (operacion == 3) {
    const numero1 = prompt("ingresar");
    const numero2 = prompt("ingresar");
    resultado = dividir(numero1, numero2);
    alert(`el resultado es ${resultado}`);
}

else if (operacion == 4) {
    const numero1 = prompt("ingresar");
    const numero2 = prompt("ingresar");
    resultado = multiplicar(numero1, numero2);
    alert(`el resultado es ${resultado}`);
}
