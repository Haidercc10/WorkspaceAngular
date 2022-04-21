
const { rest } = require('../Modelo/conexion.js');

setTimeout(async () => {
    const resultado = await rest.executeQuery ('SELECT * FROM roles');
    console.log(resultado.data);
},15);

