
let identificacion = document.getElementById("identificacion");
let contrasena = document.getElementById("contrasena");
let empresa = document.getElementById("empresa");

function ingresar(identificacion,contrasena,empresa) {

    return identificacion + contrasena + empresa;
}

function validarCampos() {

  if ( $(identificacion).val().trim().length > 0 &&
       $(contrasena).val().trim().length > 0 &&
       $(empresa).val().trim().length > 0)  {
    alert('Todo está bien')
  } else {
    alert('Debe llenar los campos vacios')
}

  /*return identificacion + contrasena + empresa;*/
}
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
function validar (){

    const { rest } = require('../Modelo/conexion.js'); //Llamado del archivo que contiene la conexión a la base de datos.

    setTimeout(async () => {
        const resultado = await rest.executeQuery ('SELECT * FROM areas');
        console.log(resultado.data);
    },50);

}

validar();

