//Pensada para que sea el codigo de todas las consultas, solo parale parametros
const { rest } = require('./conexion.js');

try{

    setTimeout(async () => {
        // INSERCION DE DATOS SQL
        const result = await rest.executeQuery('INSERT INTO usuarios (usu_id, tpId_id, usu_nombre, area_id, usu_correo, usu_telefono, rol_id, usu_estado, tpUsu_id, cajCom_id, eps_id, fonPen_id, usu_contrasena) VALUES (@id, @tipo_id, @nombre, @area, @correo, @telefono, @rol, @estado, @tipo_usuario, @caja_compensacion, @eps, @fondo_pension, @contrasena)',[{
            name: 'id',
            type: 'bigint',
            value: 789898
        }, {
            name: 'tipo_id',
            type: 'bigint',
            value: 1
        },{
            name: 'nombre',
            type: 'nvarchar',
            value: 'prueba 2'
        },{
            name: 'area',
            type: 'bigint', 
            value: 1
        },{
            name: 'correo',
            type: 'nvarchar', 
            value: 'prueba@gmail.com'
        },{
            name: 'telefono',
            type: 'bigint', 
            value: 321456
        },{
            name: 'rol',
            type: 'bigint', 
            value: 1
        },{
            name: 'estado',
            type: 'nvarchar', 
            value: 'Empleado'
        },{
            name: 'tipo_usuario',
            type: 'bigint', 
            value: 1
        },{
            name: 'caja_compensacion',
            type: 'bigint', 
            value: 12345
        },{
            name: 'eps',
            type: 'bigint', 
            value: 9632541
        },{
            name: 'fondo_pension',
            type: 'bigint', 
            value: 13254
        },{
            name: 'contrasena',
            type: 'nvarchar', 
            value: 'qwerty'
        }]);
        console.log(result);
    
    },2000);

}catch (error){
    console.log(error);
}
