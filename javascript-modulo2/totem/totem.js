function pantallaDeInicio() {

    function pedirNombre(){
            let nombre = (prompt('Ingrese su nombre:'));
            return nombre;
    }
    function crearSaludo(){
    return ('Hola , bienvenido a JavaScript!');    
    }

    function mostrar() {
        const nombre = pedirNombre();
        const saludo = crearSaludo();

        return console.log(`Hola ${nombre}, bienvenido a JavaScript!`);
    }
    
    return {
        mostrar
    }
}

pantallaDeInicio().mostrar();