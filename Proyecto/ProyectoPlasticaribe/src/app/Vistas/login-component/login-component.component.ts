import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import moment from 'moment';
import { CookieService } from 'ngx-cookie-service';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { EmpresaService } from 'src/app/Servicios/Empresa/empresa.service';
import { EncriptacionService } from 'src/app/Servicios/Encriptacion/Encriptacion.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { MovimientosAplicacionService } from 'src/app/Servicios/Movimientos_Aplicacion/MovimientosAplicacion.service';
import { AuthenticationService } from 'src/app/_Services/authentication.service';
import { authentication_BagPro } from 'src/app/_Services/authentication_BagPro.service';
import { authentication_ContaZeus } from 'src/app/_Services/authentication_ContaZeus.service';
import { AuthenticationService_InvZeus } from 'src/app/_Services/authentication_InvZeus.service';

/**
 * The `LoginComponentComponent` class handles the login functionality of the application.
 * It includes methods for validating user credentials, logging in, and redirecting to different pages based on the user's role.
 * It also interacts with various services for authentication and storing user information.
 */

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
  modoSeleccionado : boolean; //Variable para validar el tema seleccionado, si la variable es true estará en modo oscuro, si es false estará en modo claro

  constructor(private empresaServices : EmpresaService,
                private frmBuilderUsuario : FormBuilder,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                    private authenticationService: AuthenticationService,
                      private router: Router,
                        private movAplicacionService : MovimientosAplicacionService,
                          private authenticationInvZeusService : AuthenticationService_InvZeus,
                            private authenticationContaZeusService : authentication_ContaZeus,
                              private authenticationBagPro : authentication_BagPro,
                                private encriptacion : EncriptacionService,
                                  private cookiesServices : CookieService,
                                    private mensajeService : MensajesAplicacionService,) {

    if (!this.storage.get('Token')) localStorage.clear();
    if ((this.storage.get('Token')
       && this.storage.get('Token_BagPro')
       && this.storage.get('Token_Inv_Zeus')
       && this.storage.get('Token_Conta_Zeus')) || localStorage.getItem('user')) this.router.navigate(['/home']);

    window.localStorage.setItem('theme', this.cookiesServices.get('theme'));
    this.modoSeleccionado = window.localStorage.getItem('theme') == 'dark' ? true : false;
    this.formularioUsuario = this.frmBuilderUsuario.group({
      Identificacion: [null, Validators.required],
      Contrasena: [null, Validators.required],
      Empresa: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.storage.clear();
    this.cookiesServices.delete('MostrarEventosDia');
    localStorage.clear();
    this.cargaDatosComboBox();
  }

  // Funcion que guardará informacion a en la sesion
  saveInLocal(key, val): void {
    this.storage.set(key, val);
    this.data[key]= this.storage.get(key);
  }

  // FUNCION PARA CARGAR LOS DATOS DE LAS EMPRESAS EN EL COMBOBOX DEL HTML
  cargaDatosComboBox = () => this.empresaServices.srvObtenerLista().subscribe(datos => this.empresas = datos, () => this.mensajeService.mensajeError('Error', '¡No fue posible consultar la Empresa, verifique!'));

  // Funcion que va a redireccionar al apartado de archivos
  redireccionarArchivos = () => this.router.navigate(['/Archivos']);

  //Funcion que va a validar si hay campos vacios
  validarCamposVacios = () => this.formularioUsuario.valid ? this.consultaLogin() : this.mensajeService.mensajeAdvertencia('Advertencia', '¡Por favor llenar los campos vacios!');

  // Funcion que se encargará de enviar al API la información del usuario que desea iniciar sesion y dependiendo de la respuesta de esta se actuará
  consultaLogin(){
    this.cargando = true;
    let empresa : number = this.formularioUsuario.value.Empresa;
    let idUsuario : number = this.formularioUsuario.value.Identificacion;
    let contrasena : string = this.formularioUsuario.value.Contrasena;
    let data : any = { "id_Usuario": idUsuario, "contrasena": contrasena, "empresa": empresa };
    this.authenticationService.login(data).subscribe(datos => {
      this.authenticationInvZeusService.login().subscribe(() => {
        this.authenticationContaZeusService.login().subscribe(() => {
          this.authenticationBagPro.login().subscribe(() => {
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
            this.movAplicacionService.insert(infoMovimientoAplicacion).subscribe(() => {
              this.saveInLocal('Id', this.encriptacion.encrypt(idUsuario.toString()));
              this.saveInLocal('Nombre', this.encriptacion.encrypt(nombre.toString()));
              this.saveInLocal('Rol', this.encriptacion.encrypt(rol.toString()));
              window.location.pathname = '/home';
            }, () => {
              this.mensajeService.mensajeError(`¡Error!`, `¡Error al registrar el inicio de sesión!`);
              this.cargando = false;
            });
          }, () => {
            this.mensajeService.mensajeError(`¡Error!`, `¡Error al conectarse con BagPro!`);
            this.cargando = false;
          });
        }, () => {
          this.mensajeService.mensajeError(`¡Error!`, `¡Error al conectarse con Contabilidad de Zeus!`);
          this.cargando = false;
        });
      }, () => {
        this.mensajeService.mensajeError(`¡Error!`, `¡Error al conectarse con Inventario de Zeus!`);
        this.cargando = false;
      });
    }, () => {
      this.mensajeService.mensajeError(`¡Error!`, `¡No fue posible iniciar sesión!`);
      this.cargando = false;
    });
  }
}
