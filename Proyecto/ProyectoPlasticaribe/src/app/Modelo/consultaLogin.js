//Pensada para que sea el codigo de todas las consultas, solo parale parametros
const { rest } = require('./conexion.js');

let identificacion = 1000729594;
let empresas = "Plasticaribe S.A.S";

try {
    
    setTimeout(async () => {
        //CONSULTA DE DATOS DE LAS TABLAS USUARIO Y EMPRESA
        const usuario_consulta = await rest.executeQuery(`select usu_nombre, usu_contrasena from usuarios where usu_id = ${identificacion}`);
        const empresa_consulta = await rest.executeQuery(`select emp_id from empresa where emp_nombre = '${empresas}'`);
        
        //TOMA LOS RESULTADOS DE LOS ARRAYS ARROJADOS Y SACA EL JSON PARA MANEJARLO LUEGO
        //USUARIOS
        let resultado_usuario = (usuario_consulta.data[0]);
        let usuario = resultado_usuario[0];
        let usuario_final = (`Nombre: "${usuario['usu_nombre']}", Contraseña: "${usuario['usu_contrasena']}"`)
        //EMPRESA
        let resultado_empresa = (empresa_consulta.data[0]);
        let empresa = resultado_empresa[0];
        let empresa_final = (`Id: "${empresa['emp_id']}"`);
    
        //IMPRIME RESULTADOS DE LA CONSULTA 
        console.log("");
        console.log("--------------------------------------------DATOS DE LA CONSULTA-------------------------------------------------------------------");
        console.log(`Los datos del usuario son: ${usuario_final}, y los de la empresa son: ${empresa_final}`);
        console.log("-----------------------------------------------------------------------------------------------------------------------------------");
    
    },1500);

} catch (error) {
    console.log(error);
}

 

