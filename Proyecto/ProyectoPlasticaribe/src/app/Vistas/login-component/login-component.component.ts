import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmpresaService } from 'src/app/Servicios/Empresa/empresa.service';
import Swal from 'sweetalert2';
import {SESSION_STORAGE, WebStorageService} from 'ngx-webstorage-service';
import { AuthenticationService } from 'src/app/_Services/authentication.service';
import { Router } from '@angular/router';
import { MovimientosAplicacionService } from 'src/app/Servicios/Movimientos_Aplicacion/MovimientosAplicacion.service';
import moment from 'moment';
import { AuthenticationService_InvZeus } from 'src/app/_Services/authentication_InvZeus.service';
import { authentication_ContaZeus } from 'src/app/_Services/authentication_ContaZeus.service';
import { authentication_BagPro } from 'src/app/_Services/authentication_BagPro.service';

@Component({
  selector: 'app-Vista-login-component',
  templateUrl: './login-component.component.html',
  styleUrls: ['./login-component.component.css']
})

export class LoginComponentComponent implements OnInit {

  formularioUsuario !: FormGroup;
  data:any=[];
  ruta : any;
  mostrarPass : boolean = false;
  empresas: any [] = [];

  constructor(private empresaServices : EmpresaService,
                private frmBuilderUsuario : FormBuilder,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                    private authenticationService: AuthenticationService,
                      private router: Router,
                        private movAplicacionService : MovimientosAplicacionService,
                          private authenticationInvZeusService : AuthenticationService_InvZeus,
                            private authenticationContaZeusService : authentication_ContaZeus,
                              private authenticationBagPro : authentication_BagPro,) {

    this.formularioUsuario = this.frmBuilderUsuario.group({
      Identificacion: [, Validators.required],
      Contrasena: [, Validators.required],
      Empresa: [, Validators.required],
    });
  }

  ngOnInit(): void {
    this.storage.clear();
    localStorage.clear();
    this.cargaDatosComboBox();
  }

  // Funcion que guardará informacion a en la sesion
  saveInLocal(key, val): void {
    this.storage.set(key, val);
    this.data[key]= this.storage.get(key);
  }

  // FUNCION PARA CARGAR LOS DATOS DE LAS EMPRESAS EN EL COMBOBOX DEL HTML
  cargaDatosComboBox(){
    this.empresaServices.srvObtenerLista().subscribe(datos =>{ this.empresas = datos; }, error =>{ Swal.fire('Ocurrió un error, intentelo de nuevo'); });
  }

  //Funcion que va a validar si hay campos vacios
  validarCamposVacios() : any{
    if (this.formularioUsuario.valid) this.consultaLogin();
    else this.advertenciaCamposVacios();
  }

  // Funcion que se encargará de enviar al API la información del usuario que desea iniciar sesion y dependiendo de la respuesta de esta se actuará
  consultaLogin(){
    let empresa : number = this.formularioUsuario.value.Empresa;
    let idUsuario : number = this.formularioUsuario.value.Identificacion;
    let contrasena : string = this.formularioUsuario.value.Contrasena;
    let data : any = { "id_Usuario": idUsuario, "contrasena": contrasena, "empresa": empresa };
    this.authenticationService.login(data).subscribe(datos => {
      let idUsuario : number = datos.usua_Id;
      let nombre: string = datos.usuario;
      let rol: number = datos.rolUsu_Id;
      let infoMovimientoAplicacion : any = {
        "Usua_Id" : idUsuario,
        "MovApp_Nombre" : `Inicio de sesión del usuario "${nombre}"`,
        "MovApp_Descripcion" : `El usuario "${nombre}" con el ID ${idUsuario} inició sesión en el programa el día ${moment().format('YYYY-MM-DD')} a las ${moment().format('H:mm:ss')} horas.`,
        "MovApp_Fecha" : moment().format('YYYY-MM-DD'),
        "MovApp_Hora" : moment().format('H:mm:ss'),
      }
      this.movAplicacionService.insert(infoMovimientoAplicacion).subscribe(datos => { });
      this.authenticationInvZeusService.login().subscribe(datos => {});
      this.authenticationContaZeusService.login().subscribe(datos => {});
      this.authenticationBagPro.login().subscribe(datos => {});
      this.saveInLocal('Id', idUsuario);
      this.saveInLocal('Nombre', nombre);
      this.saveInLocal('Rol', rol);
      setTimeout(() => { this.router.navigate(['/home']); }, 500);
    }, error => { this.mensajeError(`¡No fue posible iniciar sesión!`, error) });
  }

  // Funcion que mostrará una advertencia para cuando haya campos vacios en la edicion o creacion de un usuario
  advertenciaCamposVacios() { Swal.fire({icon: 'warning',  title: 'Advertencia', text: `¡Por favor, debe llenar los campos vacios!`, confirmButtonColor: '#ffc107', }); }

  // Funcin que va a mostrar o no la contraseña del usuario
  mostrarPassword(){
    let password : any = document.getElementById('pass');
    if(password.type == 'password') {
      password.type = 'text';
      this.mostrarPass = true;
    } else {
      password.type = 'password';
      this.mostrarPass = false;
    }
  }

  // Funcion que mostrará un mensaje de error
  mensajeError(text : string, error : any = ""){ Swal.fire({ icon: 'warning', title: 'Oops...', html: `<b>¡${text}!</b><hr>`, }); }
}
