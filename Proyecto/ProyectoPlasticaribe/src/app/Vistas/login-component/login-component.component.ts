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
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-Vista-login-component',
  templateUrl: './login-component.component.html',
  styleUrls: ['./login-component.component.css']
})

export class LoginComponentComponent implements OnInit {

  cargando : boolean = false;
  formularioUsuario !: FormGroup;
  data:any=[];
  ruta : any;
  mostrarPass : boolean = false;
  empresas: any [] = [];
  ipAddress : any;

  constructor(private empresaServices : EmpresaService,
                private frmBuilderUsuario : FormBuilder,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                    private authenticationService: AuthenticationService,
                      private router: Router,
                        private movAplicacionService : MovimientosAplicacionService,
                          private authenticationInvZeusService : AuthenticationService_InvZeus,
                            private authenticationContaZeusService : authentication_ContaZeus,
                              private authenticationBagPro : authentication_BagPro,
                                private http : HttpClient) {

    if (!this.storage.get('Token')) localStorage.clear();
    if ((this.storage.get('Token')
       && this.storage.get('Token_BagPro')
       && this.storage.get('Token_Inv_Zeus')
       && this.storage.get('Token_Conta_Zeus')) || localStorage.getItem('user')) this.router.navigate(['/home']);
    this.formularioUsuario = this.frmBuilderUsuario.group({
      Identificacion: [null, Validators.required],
      Contrasena: [null, Validators.required],
      Empresa: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.storage.clear();
    localStorage.clear();
    this.cargaDatosComboBox();
    this.http.get("http://api.ipify.org/?format=json").subscribe((res:any)=>{ this.ipAddress = res.ip; });
  }

  // Funcion que guardará informacion a en la sesion
  saveInLocal(key, val): void {
    this.storage.set(key, val);
    this.data[key]= this.storage.get(key);
  }

  // FUNCION PARA CARGAR LOS DATOS DE LAS EMPRESAS EN EL COMBOBOX DEL HTML
  cargaDatosComboBox(){
    this.empresaServices.srvObtenerLista().subscribe(datos =>{ this.empresas = datos; }, error =>{ this.mensajeError('¡Ha ocurrido un error!'); });
  }

  // Funcion que va a redireccionar al apartado de archivos
  redireccionarArchivos(){
    window.location.pathname = '/Archivos';
  }

  //Funcion que va a validar si hay campos vacios
  validarCamposVacios() : any{
    if (this.formularioUsuario.valid) this.consultaLogin();
    else this.advertenciaCamposVacios('¡Por favor llenar los campos vacios!');
  }

  // Funcion que se encargará de enviar al API la información del usuario que desea iniciar sesion y dependiendo de la respuesta de esta se actuará
  consultaLogin(){
    this.cargando = true;
    let empresa : number = this.formularioUsuario.value.Empresa;
    let idUsuario : number = this.formularioUsuario.value.Identificacion;
    let contrasena : string = this.formularioUsuario.value.Contrasena;
    let data : any = { "id_Usuario": idUsuario, "contrasena": contrasena, "empresa": empresa };
    this.authenticationService.login(data).subscribe(datos => {
      this.authenticationInvZeusService.login().subscribe(datos_InvZeus => {
        this.authenticationContaZeusService.login().subscribe(datos_ContZeus => {
          this.authenticationBagPro.login().subscribe(datos_BagPro => {
            let idUsuario : number = datos.usua_Id;
            let nombre: string = datos.usuario;
            let rol: number = datos.rolUsu_Id;
            let infoMovimientoAplicacion : any = {
              "Usua_Id" : idUsuario,
              "MovApp_Nombre" : `Inicio de sesión`,
              "MovApp_Descripcion" : `El usuario "${nombre}" con el ID ${idUsuario} inició sesión el día ${moment().format('YYYY-MM-DD')} a las ${moment().format('H:mm:ss')} horas.`,
              "MovApp_Fecha" : moment().format('YYYY-MM-DD'),
              "MovApp_Hora" : moment().format('H:mm:ss'),
            }
            this.movAplicacionService.insert(infoMovimientoAplicacion).subscribe(datos_Mov => {
              this.saveInLocal('Id', idUsuario);
              this.saveInLocal('Nombre', nombre);
              this.saveInLocal('Rol', rol);
              window.location.pathname = '/home';
            }, err => { this.mensajeError(`¡Error al registrar el inicio de sesión!`); });
          }, err => { this.mensajeError(`¡Error al conectarse con BagPro!`); });
        }, err => { this.mensajeError(`¡Error al conectarse con Contabilidad de Zeus!`); });
      }, err => { this.mensajeError(`¡Error al conectarse con Inventario de Zeus!`); });
    }, err => { this.mensajeError(`¡No fue posible iniciar sesión!`) });
  }

  // Funcion que mostrará una advertencia para cuando haya campos vacios en la edicion o creacion de un usuario
  advertenciaCamposVacios(mensaje : string) {
    Swal.fire({icon: 'warning',  title: 'Advertencia', text: mensaje, confirmButtonColor: '#ffc107', });
    this.cargando = false;
  }

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
  mensajeError(text : string){
    Swal.fire({ icon: 'warning', title: 'Oops...', html: `<b>¡${text}!</b><hr>`, });
    this.cargando = false;
  }
}
