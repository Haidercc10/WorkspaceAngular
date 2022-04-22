//Pensada para que sea el codigo de todas las consultas, solo parale parametros
const { rest } = require('./conexion.js');

setTimeout(async () => {

    // INSERCION DE DATOS SQL

    const result = await rest.executeQuery('INSERT INTO roles (rol_id, rol_codigo, rol_nombre, rol_descripcion) VALUES (@id, @codigo, @nombre, @descripcion)',[{
        name: 'id',
        type: 'int',
        value: 3
    },{
        name: 'codigo',
        type: 'int',
        value: 3
    }, {
        name: 'nombre',
        type: 'nvarchar',
        value: 'Secretaria'
    },{
        name: 'descripcion',
        type: 'nvarchar', 
        value: `${decripcion}`
    }]);
    console.log(result.data);

},2000);