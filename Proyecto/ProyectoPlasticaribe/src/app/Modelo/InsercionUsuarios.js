//Pensada para que sea el codigo de todas las consultas, solo parale parametros
const { rest } = require('./conexion.js');

setTimeout(async () => {

    // INSERCION DE DATOS SQL

    const result = await rest.executeQuery('INSERT INTO usuarios (usu_id, usu_codigo, usu_nombre, area_id, usu_correo, usu_telefono, rol_id, usu_estado, tpUsu_id, cajaCom_id, eps_id, fonPen_id, usu_contrasena) VALUES (@id, @codigo, @nombre, @area, @correo, @telefono, @rol, @estado, @tipo_usuario, @caja_compensacion, @eps, @fondo_pension, @contrasena)',[{
        name: 'id',
        type: 'int',
        value: 4
    },{
        name: 'codigo',
        type: 'int',
        value: 4
    }, {
        name: 'nombre',
        type: 'nvarchar',
        value: 'prueba'
    },{
        name: 'area',
        type: 'int', 
        value: 1
    },{
        name: 'correo',
        type: 'nvarchar', 
        value: 'prueba@gmail.com'
    },{
        name: 'telefono',
        type: 'int', 
        value: 321456
    },{
        name: 'rol',
        type: 'int', 
        value: 1
    },{
        name: 'estado',
        type: 'nvarchar', 
        value: 'Empleado'
    },{
        name: 'tipo_usuario',
        type: 'int', 
        value: 1
    },{
        name: 'caja_compensacion',
        type: 'int', 
        value: 1
    },{
        name: 'eps',
        type: 'int', 
        value: 1
    },{
        name: 'fondo_pension',
        type: 'int', 
        value: 1
    },{
        name: 'contrasena',
        type: 'nvarchar', 
        value: 'qwerty'
    }]);
    console.log(result);

},2000);