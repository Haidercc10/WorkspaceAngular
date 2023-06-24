import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDrawerMode } from '@angular/material/sidenav';
import moment from 'moment';
import { CookieService } from 'ngx-cookie-service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { EventosCalendarioService } from 'src/app/Servicios/EventosCalendario/EventosCalendario.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { AuthenticationService } from 'src/app/_Services/authentication.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-menuLateral',
  templateUrl: './menuLateral.component.html',
  styleUrls: ['./menuLateral.component.css']
})
export class MenuLateralComponent implements OnInit {
  display : boolean = false;
  items: MenuItem[];
  mode = new FormControl('over' as MatDrawerMode);
  @ViewChild(AppComponent) appComponent : AppComponent;
  public FormUsuarios !: FormGroup; // Formulario alojado en el modal para editar y eliminar usuarios

  today : any = moment().format('YYYY-MM-DD');
  menuConfiguracion : boolean = false;
  menuUsuario : boolean = false;
  modalUsuario : boolean = false;
  modalCalendario : boolean = false;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  mostrarMenu : boolean = false; //Variable que se utilizará para mostrar el menú
  cantidadEventos : number = 0; //Variable que almacenará la cantidad de eventos que hay desde el día actual hasta el fin de mes
  eventosHoy : any [] = []; //VAriable que almacenará los eventos que hay para el día actual
  position: string = '';
  subir : boolean = true;
  subir1 : boolean = true;
  subir2 : boolean = true;
  subir3 : boolean = true;
  subir4 : boolean = true;
  subir5 : boolean = true;
  subir6 : boolean = true;
  subir7 : boolean = true;
  subir7_1 : boolean = true;
  subir8 : boolean = true;
  subir8_1 : boolean = true;
  subir9 : boolean = true;
  subir10: boolean= true;
  subir11: boolean = true;
  subir12 : boolean = true;
  subir13 : boolean = true;
  subir14 : boolean = true;
  subir15 : boolean = true;
  subir16 : boolean = true;
  subir17 : boolean = true;
  modoSeleccionado : boolean;

  constructor(private AppComponent : AppComponent,
                private formBuilder : FormBuilder,
                  private rolService : RolesService,
                    private confirmationService: ConfirmationService,
                      private messageService: MessageService,
                        private authenticationService: AuthenticationService,
                          private cookieService: CookieService,
                            @Inject(DOCUMENT) private document : Document,
                              private usuarioService : UsuarioService,
                                private mensajeService : MensajesAplicacionService,
                                  private eventosCalService : EventosCalendarioService,) {

    this.AppComponent.mostrar();
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.FormUsuarios = this.formBuilder.group({
      usuNombre: [null, Validators.required],
      usuPassword: [null, Validators.required],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.cantidadEventosMes();
    this.consultarEventosHoy();
  }

  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
    this.rolService.srvObtenerListaPorId(this.ValidarRol).subscribe(datos => this.storage_Rol = datos.rolUsu_Nombre);
  }

  aumentarLetra() {
    let fontSize : number = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-size'));
    if (parseFloat(fontSize.toFixed(2)) < 1.2) document.documentElement.style.setProperty('--font-size', `${fontSize * 1.1569}`);
    this.cookieService.set('TamanoLetra', `${parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-size')).toFixed(2)}`, { expires: 365, sameSite: 'Lax' });
    this.cambiarColorIcono();
  }

  disminuirLetra(){
    let fontSize : number = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-size'));
    if (parseFloat(fontSize.toFixed(2)) > 0.67) document.documentElement.style.setProperty('--font-size', `${fontSize * 0.86437}`);
    this.cookieService.set('TamanoLetra', `${parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-size')).toFixed(2)}`, { expires: 365, sameSite: 'Lax' });
    this.cambiarColorIcono();
  }

  cambiarColorIcono(){
    let fontSize : number = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-size'));
    const icono1 = this.document.getElementById('iconoTanamoLetra1');
    const icono2 = this.document.getElementById('iconoTanamoLetra2');
    const icono3 = this.document.getElementById('iconoTanamoLetra3');
    const icono4 = this.document.getElementById('iconoTanamoLetra4');
    const icono5 = this.document.getElementById('iconoTanamoLetra5');

    fontSize > 0.66 && fontSize < 0.68 ? icono1.className = 'pi pi-circle-fill font-size-25' : icono1.className = 'pi pi-circle font-size-16';
    fontSize > 0.68 && fontSize < 0.89 ? icono2.className = 'pi pi-circle-fill font-size-25' : icono2.className = 'pi pi-circle font-size-16';
    fontSize > 0.89 && fontSize < 1.03 ? icono3.className = 'pi pi-circle-fill font-size-25' : icono3.className = 'pi pi-circle font-size-16';
    fontSize > 1.03 && fontSize < 1.19 ? icono4.className = 'pi pi-circle-fill font-size-25' : icono4.className = 'pi pi-circle font-size-16';
    fontSize > 1.19 && fontSize < 1.30 ? icono5.className = 'pi pi-circle-fill font-size-25' : icono5.className = 'pi pi-circle font-size-16';
  }

  configuracion(){
    this.menuConfiguracion = true;
    setTimeout(() => this.cambiarColorIcono(), 100);
  }

  mostrarMenuUsuario = () => this.menuUsuario = true;

  abrirModalUsuario(){
    this.modalUsuario = true;
    this.usuarioService.getUsuariosxId(this.storage_Id).subscribe(dataUsuarios => {
      this.FormUsuarios.patchValue({ usuNombre: dataUsuarios[0].usua_Nombre, usuPassword: dataUsuarios[0].usua_Contrasena, });
    });
  }

  // Funcion que actualizará los usuarios
  actualizarUsuario() {
    this.usuarioService.getUsuariosxId(this.storage_Id).subscribe(dataUsuarios => {
      for (let i = 0; i < dataUsuarios.length; i++) {
        const infoUsuarios : any = {
          Usua_Id : dataUsuarios[i].usua_Id,
          Usua_Nombre : this.FormUsuarios.value.usuNombre,
          TpUsu_Id : dataUsuarios[i].tpUsu_Id,
          Area_Id : dataUsuarios[i].area_Id,
          RolUsu_Id : dataUsuarios[i].rolUsu_Id,
          Estado_Id : dataUsuarios[i].estado_Id,
          Usua_Telefono : dataUsuarios[i].usua_Telefono,
          Usua_Contrasena : this.FormUsuarios.value.usuPassword,
          Usua_Email : dataUsuarios[i].usua_Email,
          TipoIdentificacion_Id : 'C.C',
          Empresa_Id : 800188732,
          cajComp_Id : dataUsuarios[i].cajComp_Id,
          eps_Id : dataUsuarios[i].eps_Id,
          fPen_Id : dataUsuarios[i].fPen_Id,
          Usua_Fecha : dataUsuarios[i].usua_Fecha,
          Usua_Hora : dataUsuarios[i].usua_Hora,
        }
        this.usuarioService.srvActualizarUsuario(infoUsuarios.Usua_Id, infoUsuarios).subscribe(() => {
          this.modalUsuario = false;
          this.mensajeService.mensajeConfirmacion(`¡Usuario Actualizado!`,`¡Los datos del usuario ${this.FormUsuarios.value.usuNombre} han sido actualizados!`);
        }, () => this.mensajeService.mensajeError(`¡Ocurrió un error!`,`¡Ocurrió un error al actualizar los datos del usuario ${this.FormUsuarios.value.usuNombre}!`));
      }
    });
  }

  // Funcion que consultará la cantidad de eventos que hay en el mes
  cantidadEventosMes(){
    let inicio : any = moment().format('YYYY-MM-DD');
    let fin : any = moment().endOf('month').format('YYYY-MM-DD');
    this.eventosCalService.GetCantidadEventos(this.storage_Id, this.ValidarRol, inicio, fin).subscribe(data => this.cantidadEventos = data);
  }

  // Funcion que consultará los eventos de hoy
  consultarEventosHoy(){
    this.eventosHoy = [];
    this.eventosCalService.GetEventosDia(this.storage_Id, this.ValidarRol).subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        this.eventosHoy.push({
          Fecha_Hora_Inicio : `${data[i].eventoCal_HoraInicial}`,
          Fecha_Hora_Fin : `${data[i].eventoCal_FechaFinal.replace('T00:00:00', '')} ${data[i].eventoCal_HoraFinal}`,
          Nombre : data[i].eventoCal_Nombre
        });
      }
    });
  }

  mostrarModalCalendario = () => this.modalCalendario = true;

  showConfirm() {
    this.confirmationService.confirm({
      message: '¿Seguro que desea salir?',
      header: 'Cerrar Sesión',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Si',
      rejectLabel: 'No',
      accept: () => {
        this.authenticationService.logout();
        this.messageService.add({severity:'info', summary:'Confirmed', detail:'You have accepted'});
      },
    });
  }

  confirm1() {
    this.messageService.clear();
    this.messageService.add({key: 'c', sticky: true, severity:'warn', summary:'¿Seguro que desea salir?'});
  }

  onConfirm = () => this.authenticationService.logout();

  onReject = () => this.messageService.clear('c');

  // Funcion que hacer que aparezca un icono u otro
  clickIcon1 = () => this.subir1 ? this.subir1 = false : this.subir1 = true;

  clickIcon2 = () => this.subir2 ? this.subir2 = false : this.subir2 = true;

  clickIcon3 = () => this.subir ? this.subir3 = false : this.subir3 = true;

  clickIcon4 = () => this.subir4 ? this.subir4 = false : this.subir4 = true;

  clickIcon5 = () => this.subir5 ? this.subir5 = false : this.subir5 = true;

  clickIcon6 = () => this.subir6 ? this.subir6 = false : this.subir6 = true;

  clickIcon7 = () => this.subir7 ? this.subir7 = false : this.subir7 = true;

  clickIcon7_1 = () => this.subir7_1 ? this.subir7_1 = false : this.subir7_1 = true;

  clickIcon8 = () => this.subir8 ? this.subir8 = false : this.subir8 = true;

  clickIcon8_1 = () => this.subir8_1 ? this.subir8_1 = false : this.subir8_1 = true;

  clickIcon9 = () => this.subir9 ? this.subir9 = false : this.subir9 = true;

  clickIcon10 = () => this.subir10 ? this.subir10 = false : this.subir10 = true;

  clickIcon11 = () => this.subir11 ? this.subir11 = false : this.subir11 = true;

  clickIcon12 = () => this.subir12 ? this.subir12 = false : this.subir12 = true;

  clickIcon13 = () => this.subir13 ? this.subir13 = false : this.subir13 = true;

  clickIcon14 = () => this.subir14 ? this.subir14 = false : this.subir14 = true;

  clickIcon15 = () => this.subir15 ? this.subir15 = false : this.subir15 = true;

  clickIcon16 = () => this.subir16 ? this.subir16 = false : this.subir16 = true;

  clickIcon17 = () => this.subir17 ? this.subir17 = false : this.subir17 = true;

  mostrar() {
    let modo = window.localStorage.getItem("theme");
    if(modo) this.AppComponent.temaSeleccionado = modo == 'dark' ? true : false;
    this.cambiar(this.AppComponent.temaSeleccionado);
  }

  cambiar(estado : any) {
    let tema = estado ? 'dark' : 'light';
    window.localStorage.setItem("theme", tema);
    this.cookieService.set('theme', tema, { expires: 365, sameSite: 'Lax' });
    let linkTema = this.document.getElementById('app-theme') as HTMLLinkElement;
    linkTema.href = 'lara-' + tema + '-blue' + '.css';
  }
}
