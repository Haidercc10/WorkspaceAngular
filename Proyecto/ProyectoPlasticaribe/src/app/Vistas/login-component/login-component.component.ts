import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmpresaService } from 'src/app/Servicios/Empresa/empresa.service';
import {SESSION_STORAGE, WebStorageService} from 'ngx-webstorage-service';
import { AuthenticationService } from 'src/app/_Services/authentication.service';
import { Router } from '@angular/router';
import { MovimientosAplicacionService } from 'src/app/Servicios/Movimientos_Aplicacion/MovimientosAplicacion.service';
import moment from 'moment';
import { AuthenticationService_InvZeus } from 'src/app/_Services/authentication_InvZeus.service';
import { authentication_ContaZeus } from 'src/app/_Services/authentication_ContaZeus.service';
import { authentication_BagPro } from 'src/app/_Services/authentication_BagPro.service';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { EncriptacionService } from 'src/app/Servicios/Encriptacion/Encriptacion.service';
import { CookieService } from 'ngx-cookie-service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';

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
                                private http : HttpClient,
                                  private messageService: MessageService,
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
  cargaDatosComboBox = () => this.empresaServices.srvObtenerLista().subscribe(datos => this.empresas = datos, () => this.mensajeService.mensajeError('Error', '¡No fue posible consultar la Empresa, verifique!'));

  // Funcion que va a redireccionar al apartado de archivos
  redireccionarArchivos = () => window.location.pathname = '/Archivos';

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
            this.movAplicacionService.insert(infoMovimientoAplicacion).subscribe(datos_Mov => {
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
}
