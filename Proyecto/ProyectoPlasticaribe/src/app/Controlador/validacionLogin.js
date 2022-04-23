
function validarCampos() {

  let identificacion = document.getElementById("identificacion");
  let contrasena = document.getElementById("contrasena");
  let empresa = document.getElementById("empresa");

  if ( $(identificacion).val().trim().length > 0 && $(contrasena).val().trim().length > 0 && $(empresa).val().trim().length > 0){

    alert('Todo está bien');
    validar(identificacion, contrasena, empresa);

  } else alert('Debe llenar los campos vacios');
}

//FUNCION PARA LLAMAR A LA CONSULTA NECESARIA PARA VALIDAR EL LOGIN
function validar (identificacion, contrasena, empresa){
  const {consultaBD} = require('../Modelo/consultaLogin.js');
}

validarCampos();