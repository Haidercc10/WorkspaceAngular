const { rest } = require('../Modelo/conexion.js'); //Llamado del archivo que contiene la conexión a la base de datos.


function validar (identificacion, contrasena, empresa){
    setTimeout(async () => {
        const resultado = await rest.executeQuery ('SELECT * FROM roles');
        console.log(resultado.data);
    },1);
}

validar();
