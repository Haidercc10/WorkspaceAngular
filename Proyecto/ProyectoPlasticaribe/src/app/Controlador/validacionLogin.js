<<<<<<< HEAD
<<<<<<< HEAD
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
=======
function validar (){

    const { rest } = require('../Modelo/conexion.js'); //Llamado del archivo que contiene la conexión a la base de datos.

    setTimeout(async () => {
        const resultado = await rest.executeQuery ('SELECT * FROM areas');
        console.log(resultado.data);
    },50);

}

validar();
>>>>>>> 239d2cf5c50c7a2bea9f29dd6b8d00abd7f5e1f7
=======
function validar (identificacion){
    const { rest } = require('../Modelo/conexion.js'); //Llamado del archivo que contiene la conexión a la base de datos.
    setTimeout(async () => {
        const resultado = await rest.executeQuery ('SELECT usu_id FROM usuarios');
        console.log(resultado.data);
    },50);

    if (identificacion == resultado.data("usu_id")) {
        
    }    

}

let identificacion = document.getElementById("identificacion");


>>>>>>> 3105bda35c236ac1c782e16715c4dee5dea1b8f0
