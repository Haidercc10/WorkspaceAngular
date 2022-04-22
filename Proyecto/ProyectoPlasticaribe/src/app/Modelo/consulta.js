//Pensada para que sea el codigo de todas las consultas, solo parale parametros
const { rest } = require('./conexion.js');

setTimeout(async () => {

    //CONSULTA DE DATOS
    const result = await rest.executeQuery(`select * from roles where (rol_id = @id)`,[{
        name: 'id',
        type: 'Int',
        value: 3
    }]);

    // print the result
    let resultado = (result.data[0]);
    let resultado2 = resultado[0];
    console.log(resultado2);
    console.log("");
    console.log(resultado2['rol_nombre']);

},2000); 







