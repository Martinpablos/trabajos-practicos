/** 
 * comportamiento de una funcion (no es la manera correcta de escribir una funcion)
 * 
 * function saludar (){
    console.log("bienvenido a la clase de funciones")
}

function sumar() {
    console.log(2+5);
}

saludar()
sumar();
*/

function pantallaDeDocumento() {
    
    let documento = '';

    function ingresarNumero (n) {
        documento += n;
    }

    function mostrar() {
        return ''
    }

    return {
        mostrar
    }

}






