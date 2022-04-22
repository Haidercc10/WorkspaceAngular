//Pensada para que sea el codigo de todas las consultas, solo parale parametros
const { rest } = require('./conexion.js');

setTimeout(async () => {

    //CONSULTA DE DATOS
    let decripcion = "Tiene acceso a parte del programa";
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

    // // INSERCION DE DATOS SQL

    // const result = await rest.executeQuery('INSERT INTO roles (rol_id, rol_codigo, rol_nombre, rol_descripcion) VALUES (@id, @codigo, @nombre, @descripcion)',[{
    //     name: 'id',
    //     type: 'int',
    //     value: 3
    // },{
    //     name: 'codigo',
    //     type: 'int',
    //     value: 3
    // }, {
    //     name: 'nombre',
    //     type: 'nvarchar',
    //     value: 'Secretaria'
    // },{
    //     name: 'descripcion',
    //     type: 'nvarchar', 
    //     value: `${decripcion}`
    // }]);
    // console.log(result.data);

},2000);



