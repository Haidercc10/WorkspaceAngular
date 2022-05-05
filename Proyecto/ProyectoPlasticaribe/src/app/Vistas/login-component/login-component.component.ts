import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { modelUsuario } from 'src/app/Modelo/modelUsuario';
import { UsuarioService } from 'src/app/Servicios/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-Vista-login-component',
  templateUrl: './login-component.component.html',
  styleUrls: ['./login-component.component.css']
})

export class LoginComponentComponent implements OnInit {

  public formularioUsuario !: FormGroup;

  constructor(private usuarioServices : UsuarioService, private frmBuilderUsuario : FormBuilder) { 
    this.formularioUsuario = this.frmBuilderUsuario.group({
      Identificacion: [, Validators.required],
      Contrasena: [, Validators.required],
      Empresa: [, Validators.required],
    });
  }

  ngOnInit(): void { }

  validarCamposVacios() : any{

    if(this.formularioUsuario.valid){

      Swal.fire("Los datos se enviaron correctamente");
      let obtener = this.usuarioServices.srvObtenerListaUsuario();
      console.log(obtener);

    }else Swal.fire("HAY CAMPOS VACIOS");

  }

  clear() { this.formularioUsuario.reset(); }

  Consulta(){

    const campoUsuario : modelUsuario = {
      Usua_Id: this.formularioUsuario.get('Identificacion')?.value,
      Empresa_Id: this.formularioUsuario.get('Empresa')?.value,
      Usua_Contrasena: this.formularioUsuario.get('Contrasena')?.value,
      Usua_Codigo: 0,
      TipoIdentificacion_Id: 0,
      Usua_Nombre: '',
      Area_Id: 0,
      tpUsu_Id: 0,
      RolUsu_Id: 0,
      Estado_Id: 0,
      Usua_Email: '',
      Usua_Telefono: '',
      cajComp_Id: 0,
      eps_Id: 0,
      fPen_Id: 0
    }

    this.usuarioServices.srvObtenerListaUsuario().subscribe(data=>{

      let Usu_Id: number = campoUsuario.Usua_Id;
      let Usu_Empresa: number = campoUsuario.Empresa_Id;
      let Usu_Contrasena: string = campoUsuario.Usua_Contrasena;

      if (this.formularioUsuario.value.Identificacion == Usu_Id && this.formularioUsuario.value.Empresa == Usu_Empresa && this.formularioUsuario.value.Contrasena == Usu_Contrasena) {
        
        Swal.fire('Consulta Exítosa');
        window.location.href = "./principal";

      } else {
        if (this.formularioUsuario.value.Identificacion == Usu_Id) Swal.fire('El número de Identificación no concuerda');          
        else if (this.formularioUsuario.value.Contrasena == Usu_Contrasena) Swal.fire('La contraseña y la Identificación no concuerdan');
      }

    }, error =>{ Swal.fire('Ocurrió un error'); });
  }
}