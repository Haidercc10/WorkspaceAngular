//Pensada para que sea el codigo de todas las consultas, solo parale parametros
const { rest } = require('./conexion.js');

setTimeout(async () => {

    const resultado = await rest.executeQuery ('SELECT  FROM ');
    console.log(resultado.data);

},1500);

