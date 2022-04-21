function validar (){

    const { rest } = require('../Modelo/conexion.js'); //Llamado del archivo que contiene la conexión a la base de datos.

    setTimeout(async () => {
        const resultado = await rest.executeQuery ('SELECT * FROM areas');
        console.log(resultado.data);
    },50);

}

validar();
