import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioService } from 'src/app/Servicios/usuario.service';
import { EmpresaService } from 'src/app/Servicios/empresa.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-Vista-login-component',
  templateUrl: './login-component.component.html',
  styleUrls: ['./login-component.component.css']
})

export class LoginComponentComponent implements OnInit {

  public formularioUsuario !: FormGroup;

  /* SE INSTANCIA LA VARIABLE "empresas" QUE VA A SER DE TIPO "EmpresaService" Y TAMBIEN SERÁ UN ARRAY.
  AQUÍ SE GUARDARÁN LOS NOMBRES DE LAS EMPRESAS QUE HAY EN LA BASE DE DATOS */
  empresas:EmpresaService[]=[];

  constructor(private usuarioServices : UsuarioService, private empresaServices : EmpresaService, private frmBuilderUsuario : FormBuilder) { 
    this.formularioUsuario = this.frmBuilderUsuario.group({
      Identificacion: [, Validators.required],
      Contrasena: [, Validators.required],
      Empresa: [, Validators.required],
    });
  }

  ngOnInit(): void { this.cargaDatosComboBox()}

  // FUNCION PARA CARGAR LOS DATOS DE LAS EMPRESAS EN EL COMBOBOX DEL HTML
  cargaDatosComboBox(){
    this.empresaServices.srvObtenerLista().subscribe(datos_empresa=>{
      for (let index = 0; index < datos_empresa.length; index++) {
        /* LA SIGUIENTE LINEA DE CODIGO HARÁ QUE SE CONSULTEN LOS DATOS DE LAS EMPRESAS PARA FINALMENTE SOLO GUARDAR EL NOMBRE DE LA EMPRESA
        EN LA VARIABLE "empresas" Y ESTA VARIABLE SE LE PASARÁ EN EL HTML AL COMBOBOX QUE MOSTRARÁ LAS EMPRESAS */
        this.empresas.push(datos_empresa[index].empresa_Nombre);
      }
    }, error =>{ Swal.fire('Ocurrió un error, intentelo de nuevo'); });
  }

  // FUNCION PARA HACER VALIDACIONES DE CAMPOS VACIOS, QUE DADO ESTE CASO (EN EL QUE HAYAN CAMPOS VACIOS) SE MOSTRARÁ UN MENSAJE INFOMANDO DE ESTO.
  // SI NO HAY CAMPOS VACIOS ENTRARÍA A EL METODO Consulta()
  validarCamposVacios() : any{
    if(this.formularioUsuario.valid) this.Consulta();    
    else Swal.fire("HAY CAMPOS VACIOS");
  }
  
  // FUNCION PARA LIMPIAR LOS CAMPOS DEL FORMULARIO.
  clear(){ this.formularioUsuario.reset(); }

  // FUNCION PARA HACER LA VALIDACION DE LA ENTRADA DE USUARIOS, SE VERIFICAN LOS CAMPOS DIGITADOS CON LA BASE DE DATOS. 
  Consulta(){
    // FUNCION QUE CONSULTA LOS DATOS EN LA BASE DE DATOS
    this.usuarioServices.srvObtenerListaUsuario().subscribe(datos_usuarios=>{
      for (let i = 0; i < datos_usuarios.length; i++) {
        let dato_id: number = datos_usuarios[i].usua_Id;
        let dato_contrasena: string = datos_usuarios[i].usua_Contrasena;
        if (this.formularioUsuario.value.Identificacion == dato_id && this.formularioUsuario.value.Contrasena == dato_contrasena) {
          window.location.href = "./principal";
        } else {
          if (this.formularioUsuario.value.Identificacion != dato_id){
            Swal.fire('El número de Identificación no concuerda');
          } else if (this.formularioUsuario.value.Contrasena != dato_contrasena) {
            Swal.fire('La contraseña y la Identificación no concuerdan');
          } else console.log("Bienvenido");
        }
      }
    }, error =>{ Swal.fire('Ocurrió un error, intentelo de nuevo'); });
  }
}