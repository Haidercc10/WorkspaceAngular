//Pensada para que sea el codigo de todas las consultas, solo parale parametros
const { rest } = require('./conexion.js');

setTimeout(async () => {

    //CONSULTA DE DATOS
    const usuario_consulta = await rest.executeQuery(`select usu_id, usu_contrasena from usuarios`);
    const empresa_consulta = await rest.executeQuery(`select emp_nombre from empresa`);
    // print the result
    console.log("-----------------------------------------------------------------------------------------------------------------------------------");
    let resultado_usuario = (usuario_consulta.data[0]);
    let usuario = resultado_usuario[0];
    let usuario_final = (`ID: "${usuario['usu_id']}", CONTRASEÑA: "${usuario['usu_contrasena']}"`)

    let resultado_empresa = (empresa_consulta.data[0]);
    let empresa = resultado_empresa[0];
    let empresa_final = (`NOMBRE: "${empresa['emp_nombre']}"`)

    console.log(`Los datos del usuario son: ${usuario_final}, y los de la empresa son: ${empresa_final}`);
    console.log("-----------------------------------------------------------------------------------------------------------------------------------");

},2000); 







