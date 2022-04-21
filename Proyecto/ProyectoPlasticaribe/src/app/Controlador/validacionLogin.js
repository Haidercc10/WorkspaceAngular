function validar (identificacion){
    const { rest } = require('../Modelo/conexion.js'); //Llamado del archivo que contiene la conexión a la base de datos.
    setTimeout(async () => {
        const resultado = await rest.executeQuery ('SELECT usu_id FROM usuarios');
        console.log(resultado.data);
    },50);

    if (identificacion == resultado.data("usu_id")) {
        
    }    

}

let identificacion = document.getElementById("identificacion");


