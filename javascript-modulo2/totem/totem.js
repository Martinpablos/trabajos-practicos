function pantallaDeInicio() {

    function crearLogo(){
    return '<img src="#"/>';
    }
    function crearSaludo(){
    return '<p>Hola, bienvenido a JavaScript!</p>'
    }

    function mostrar() {
        const logo = crearLogo();
        const saludo = crearSaludo();

        return 
        ` 
        <div>
            ${logo}
            ${saludo}
        </div>
        `;
    }
    
    return {
        mostrar
    }
}

pantallaDeInicio().mostrar();