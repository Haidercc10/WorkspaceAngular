import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDrawerMode } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import moment from 'moment';
import { CookieService } from 'ngx-cookie-service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { EventosCalendarioService } from 'src/app/Servicios/EventosCalendario/EventosCalendario.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { Vistas_PermisosService } from 'src/app/Servicios/Vistas_Permisos/Vistas_Permisos.service';
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

  categorias : any[] = [];
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
  eventosMes : any [] = []; //Variable que almacenará los eventos que hay para el mes actual
  eventosDia : boolean = false; //Variable que indica si se mostrará el modal con los eventos del día
  position: string = '';
  modoSeleccionado : boolean;

  roles : any [] = [];

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
                                  private eventosCalService : EventosCalendarioService,
                                    private vistasPermisosService : Vistas_PermisosService,
                                      private router : Router) {

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
    this.CargarCategorias();
    this.abrirModalUsuario();
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

  CargarCategorias(){
    this.vistasPermisosService.GetCategoriasMenu(this.ValidarRol).subscribe(data => {
      this.categorias = [];
      for (let i = 0; i < data.length; i++){
        data[i].split('|').forEach(element => {
          if (this.categorias.length > 0 && element != '' && !['Inicio', 'Pruebas'].includes(element)) {
            if (this.categorias.findIndex(item => item.label == element) == -1) this.categorias.push({label: element, icon: '', items: []});
          } else if (element != '' && !['Inicio', 'Pruebas'].includes(element)) this.categorias.push({label: element, icon: '', items: []});
        });
      }
      this.categorias.sort((a, b) => a.label.localeCompare(b.label));
      this.categorias.unshift({label: `Inicio`, icon: 'pi pi-home', command: () => this.router.navigate(['/home'])});
      if (this.storage_Id == 123456789) this.categorias.unshift({label: `Pruebas`, icon: 'pi pi-wrench', command: () => this.router.navigate(['/pruebas'])});
      this.cargarOpcionesMenu();
    });
  }

  cargarOpcionesMenu(){
    this.categorias.forEach(element => {
      this.vistasPermisosService.Get_Vistas_Rol(this.ValidarRol, element.label).subscribe(data => {
        for (let i = 0; i < data.length; i++){
          element.items.push({ label: data[i].vp_Nombre, icon: data[i].vp_Icono_Menu, command: () => this.router.navigate([data[i].vp_Ruta]) });
        }
        element.items.sort((a, b) => a.label.localeCompare(b.label));
      });
    });
  }

  mostrarMenuUsuario = () => this.menuUsuario = true;

  abrirModalUsuario(){
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
    this.eventosMes = [];
    this.eventosCalService.GetEventosDia(this.storage_Id, this.ValidarRol).subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        this.eventosHoy.push({
          Fecha_Hora_Inicio : `${data[i].eventoCal_HoraInicial}`,
          Fecha_Hora_Fin : `${data[i].eventoCal_FechaFinal.replace('T00:00:00', '')} ${data[i].eventoCal_HoraFinal}`,
          Nombre : data[i].eventoCal_Nombre,
          Descripcion : data[i].eventoCal_Descripcion,
          Dia: moment().format('DD'),
          Mes: moment().format('MMM').toUpperCase(),
        });
        if (this.cookieService.get('MostrarEventosDia') == 'no' || this.cookieService.get('MostrarEventosDia') == undefined) this.eventosDia = false;
        else this.eventosDia = true;
      }      
    });
    this.eventosCalService.GEtEventosMes(this.storage_Id, this.ValidarRol).subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        this.eventosMes.push({
          Fecha_Hora_Inicio : `${data[i].eventoCal_HoraInicial}`,
          Fecha_Hora_Fin : `${data[i].eventoCal_FechaFinal.replace('T00:00:00', '')} ${data[i].eventoCal_HoraFinal}`,
          Nombre : data[i].eventoCal_Nombre,
          Descripcion : data[i].eventoCal_Descripcion,
          Dia: moment(data[i].eventoCal_FechaInicial).format('DD'),
          Mes: moment().format('MMM').toUpperCase(),
        });
      }
    });
  }

  mostrarModalCalendario = () => this.modalCalendario = true;

  noMostrarMasDialogoEventosDia(mostrar : string){
    this.cookieService.set('MostrarEventosDia', mostrar, { expires: 365, sameSite: 'Lax' });
    this.eventosDia = false;
  }

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

  confirm(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: '¿Seguro que desea salir?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.authenticationService.logout(),
    });
  }
  
  // Funcion que cambiará el tema de la aplicación
  mostrar() {
    let modo = window.localStorage.getItem("theme");
    if(modo) this.AppComponent.temaSeleccionado = modo == 'dark' ? true : false;
    this.cambiar(this.AppComponent.temaSeleccionado);
  }

  // Funcion que cambiará el tema de la aplicación
  cambiar(estado : any) {
    let tema = estado ? 'dark' : 'light';
    window.localStorage.setItem("theme", tema);
    this.cookieService.set('theme', tema, { expires: 365, sameSite: 'Lax' });
    let linkTema = this.document.getElementById('app-theme') as HTMLLinkElement;
    linkTema.href = 'lara-' + tema + '-blue' + '.css';
  }
}
