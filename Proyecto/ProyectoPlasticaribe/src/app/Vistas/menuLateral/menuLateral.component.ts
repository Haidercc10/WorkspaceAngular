import { DOCUMENT } from '@angular/common';
import { Component, Inject, Injectable, Input, OnInit, ViewChild, inject } from '@angular/core';
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
import { CorreosWebService } from 'src/app/Servicios/CorreosWeb/CorreosWeb.service';
import { environment } from 'src/environments/environment';
import { VERSION_APP } from 'src/environments/version';
import { TemaService, alCambiarTema } from 'src/app/Servicios/Tema/Tema.service';
import { VistaFavorita, VistasFavoritasService } from 'src/app/Servicios/VistasFavoritas/VistasFavoritas.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd } from '@angular/router';
import { combineLatest, filter, fromEvent, interval, merge, startWith, throttleTime } from 'rxjs';
import { DestroyRef } from '@angular/core';

/** Cada cuánto se refrescan los contadores de la barra superior mientras la pestaña está visible. */
const REFRESCO_CONTADORES_MS = 5 * 60 * 1000;
/** Llave de sessionStorage: el aviso de eventos del día ya se mostró en esta sesión (el logout limpia sessionStorage). */
const LLAVE_AVISO_EVENTOS_DIA = 'avisoEventosDiaMostrado';
import { CantidadesTickets, TicketsService } from 'src/app/Servicios/Tickets/Tickets.service';

Injectable({
  providedIn: 'root'
});

@Component({
  selector: 'app-menuLateral',
  templateUrl: './menuLateral.component.html',
  styleUrls: ['./menuLateral.component.css']
})

export class MenuLateralComponent implements OnInit {

  display: boolean = false;
  items: MenuItem[];
  mode = new FormControl('over' as MatDrawerMode);
  @ViewChild(AppComponent) appComponent: AppComponent;
  public FormUsuarios !: FormGroup; // Formulario alojado en el modal para editar y eliminar usuarios

  categorias: any[] = [];
  today: any = moment().format('YYYY-MM-DD');
  menuConfiguracion: boolean = false;
  menuUsuario: boolean = false;
  modalUsuario: boolean = false;
  modalCalendario: boolean = false;
  modalCorreos: boolean = false;
  storage_Id: number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre: any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol: any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol: number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  mostrarMenu: boolean = false; //Variable que se utilizará para mostrar el menú
  cantidadEventos: number = 0; //Variable que almacenará la cantidad de eventos que hay desde el día actual hasta el fin de mes
  eventosHoy: any[] = []; //VAriable que almacenará los eventos que hay para el día actual
  eventosMes: any[] = []; //Variable que almacenará los eventos que hay para el mes actual
  eventosDia: boolean = false; //Variable que indica si se mostrará el modal con los eventos del día
  cantidadCorreosNuevos: number = 0; //Variable que almacenará la cantidad de correos nuevos que hay en el sistema
  position: string = '';
  modoSeleccionado: boolean;
  private readonly suscripcionTema = alCambiarTema(oscuro => this.modoSeleccionado = oscuro); // mantiene el interruptor y los logos al día con el tema
  esBeta: boolean = environment.esBeta; //Indica si la app se compiló para el entorno de pruebas (npm run build:beta)
  versionApp: string = VERSION_APP; //Versión de la app (package.json), se sube con npm run version:parche | version:menor | version:mayor
  roles: any[] = [];
  cargando: boolean = false;

  // Estrella de la barra superior: agrega o quita la página actual de los accesos rápidos (barra inferior)
  private readonly vistasFavService = inject(VistasFavoritasService);
  vistaActual: VistaFavorita | null = null; // vista de la página actual, si el rol puede tenerla como acceso rápido
  esFavorita: boolean = false;
  guardandoFavorito: boolean = false;
  // Botón de tickets (rol 1): abiertos + en revisión. cantidadesTickets queda en null si el rol no tiene permiso a Gestionar Tickets
  private readonly ticketsService = inject(TicketsService);
  cantidadesTickets: CantidadesTickets | null = null;
  totalTicketsPendientes: number = 0;
  tooltipTickets: string = 'Gestionar tickets';
  private readonly suscripcionTickets = this.ticketsService.cantidadesSoporte$.pipe(takeUntilDestroyed()).subscribe(c => {
    this.cantidadesTickets = c;
    this.totalTicketsPendientes = c ? c.abiertos + c.enRevision : 0;
    this.tooltipTickets = c ? `Tickets: ${c.abiertos} abierto(s), ${c.enRevision} en revisión` : 'Gestionar tickets';
  });

  tooltipCalendario: string = 'Calendario de eventos';
  private readonly destroyRef = inject(DestroyRef);
  private readonly correosWebService = inject(CorreosWebService);

  private readonly suscripcionFavorito = combineLatest([
    inject(Router).events.pipe(filter(e => e instanceof NavigationEnd), startWith(null)),
    this.vistasFavService.misFavoritos$,
    this.vistasFavService.disponiblesSinError(),
  ]).pipe(takeUntilDestroyed()).subscribe(([, { favoritos }, disponibles]) => {
    this.vistaActual = VistasFavoritasService.vistaDeUrl(this.router?.url ?? location.pathname, disponibles);
    this.esFavorita = !!this.vistaActual && favoritos.some(f => f.id === this.vistaActual!.id);
  });

  constructor(private AppComponent: AppComponent,
    private formBuilder: FormBuilder,
    private rolService: RolesService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private authenticationService: AuthenticationService,
    private cookieService: CookieService,
    @Inject(DOCUMENT) private document: Document,
    private usuarioService: UsuarioService,
    private mensajeService: MensajesAplicacionService,
    private eventosCalService: EventosCalendarioService,
    private vistasPermisosService: Vistas_PermisosService,
    private router: Router,
    private temaService: TemaService,) {

    this.FormUsuarios = this.formBuilder.group({
      usuNombre: [null, Validators.required],
      usuPassword: [null, Validators.required],
    });
  }

  async ngOnInit() {
    this.lecturaStorage();
    this.cantidadEventosMes();
    this.consultarEventosHoy();
    this.CargarCategorias();
    this.abrirModalUsuario();
    if (this.ValidarRol == 1) this.ticketsService.cargarCantidadesSoporte().subscribe();
    this.programarRefrescoContadores();
  }

  /**
   * Refresca los contadores de la barra superior (calendario y tickets): al crear, editar o eliminar un evento,
   * cada REFRESCO_CONTADORES_MS mientras la pestaña está visible y al volver a la pestaña.
   * Los correos no lo necesitan: se escuchan en tiempo real desde Firebase.
   */
  private programarRefrescoContadores() {
    this.eventosCalService.cambios$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.cantidadEventosMes());

    merge(interval(REFRESCO_CONTADORES_MS), fromEvent(this.document, 'visibilitychange')).pipe(
      filter(() => this.document.visibilityState === 'visible'),
      throttleTime(30 * 1000), // al alternar pestañas seguido no se repiten consultas
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      this.cantidadEventosMes();
      if (this.ValidarRol == 1) this.ticketsService.cargarCantidadesSoporte().subscribe();
    });
  }

  irAGestionTickets = () => this.router.navigateByUrl('/Gestion-Tickets');

  /** Agrega la página actual a los accesos rápidos, o la quita si ya estaba (respeta el límite de la API). */
  alternarFavoritoActual() {
    const vista = this.vistaActual;
    if (!vista || this.guardandoFavorito) return;

    const { limite, favoritos } = this.vistasFavService.actual;
    const ids = favoritos.map(f => f.id);
    const quitar = ids.includes(vista.id);
    if (!quitar && ids.length >= limite) {
      this.mensajeService.mensajeAdvertencia('Límite alcanzado', `Ya tiene ${limite} accesos rápidos. Quite uno desde el botón + de la barra inferior.`);
      return;
    }

    this.guardandoFavorito = true;
    this.vistasFavService.guardar(quitar ? ids.filter(id => id !== vista.id) : [...ids, vista.id]).subscribe({
      next: () => {
        this.guardandoFavorito = false;
        this.mensajeService.mensajeConfirmacion('OK!', `"${vista.nombre}" se ${quitar ? 'quitó de' : 'agregó a'} sus accesos rápidos.`);
      },
      error: err => {
        this.guardandoFavorito = false;
        this.mensajeService.mensajeError('¡No se pudieron guardar sus accesos rápidos!', typeof err?.error === 'string' ? err.error : '');
      },
    });
  }

  /*Función que cargará el menú lateral y quitará el enlace "Inventario Areas" en la categoria
  materias primas  para los usuarios con roles de bopp, sellado, rotograbado e impresión */
  mostrarMenuLateral() {
    let ruta: any = this.router.url;
    this.display = true;
    if ([85, 7, 3, 8, 86, 63, 89, 62, 4, 88, 12, 2, 104].includes(this.ValidarRol)) {
      setTimeout(() => {
        this.categorias.forEach(x => {
          if ([85, 7, 3, 8, 86, 63, 89, 62, 4, 88, 12, 2, 104].includes(this.ValidarRol) && x.items != undefined && x.items.length == 0) this.categorias.splice(this.categorias.indexOf(x), 1);
        });
        this.router.navigate([ruta]);
      }, 20);
    }
  }

  lecturaStorage() {
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
    this.rolService.srvObtenerListaPorId(this.ValidarRol).subscribe(datos => this.storage_Rol = datos.rolUsu_Nombre);
    if ([1, 6, 2].includes(this.ValidarRol)) this.escucharCorreosNuevos(); // mismos roles que ven el botón de correos
  }

  aumentarLetra() {
    let fontSize: number = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-size'));
    if (parseFloat(fontSize.toFixed(2)) < 1.2) document.documentElement.style.setProperty('--font-size', `${fontSize * 1.1569}`);
    this.cookieService.set('TamanoLetra', `${parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-size')).toFixed(2)}`, { expires: 365, sameSite: 'Lax' });
    this.cambiarColorIcono();
  }

  disminuirLetra() {
    let fontSize: number = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-size'));
    if (parseFloat(fontSize.toFixed(2)) > 0.67) document.documentElement.style.setProperty('--font-size', `${fontSize * 0.86437}`);
    this.cookieService.set('TamanoLetra', `${parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-size')).toFixed(2)}`, { expires: 365, sameSite: 'Lax' });
    this.cambiarColorIcono();
  }

  cambiarColorIcono() {
    let fontSize: number = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-size'));
    const icono1 = this.document.getElementById('iconoTanamoLetra1') as HTMLElement;
    const icono2 = this.document.getElementById('iconoTanamoLetra2') as HTMLElement;
    const icono3 = this.document.getElementById('iconoTanamoLetra3') as HTMLElement;
    const icono4 = this.document.getElementById('iconoTanamoLetra4') as HTMLElement;
    const icono5 = this.document.getElementById('iconoTanamoLetra5') as HTMLElement;

    fontSize > 0.66 && fontSize < 0.68 ? icono1.className = 'pi pi-circle-fill font-size-25' : icono1.className = 'pi pi-circle font-size-16';
    fontSize > 0.68 && fontSize < 0.89 ? icono2.className = 'pi pi-circle-fill font-size-25' : icono2.className = 'pi pi-circle font-size-16';
    fontSize > 0.89 && fontSize < 1.03 ? icono3.className = 'pi pi-circle-fill font-size-25' : icono3.className = 'pi pi-circle font-size-16';
    fontSize > 1.03 && fontSize < 1.19 ? icono4.className = 'pi pi-circle-fill font-size-25' : icono4.className = 'pi pi-circle font-size-16';
    fontSize > 1.19 && fontSize < 1.30 ? icono5.className = 'pi pi-circle-fill font-size-25' : icono5.className = 'pi pi-circle font-size-16';
  }

  configuracion() {
    this.menuConfiguracion = true;
    setTimeout(() => this.cambiarColorIcono(), 100);
  }

  CargarCategorias() {
    this.vistasPermisosService.GetCategoriasMenu(this.ValidarRol).subscribe(data => {
      this.cargando = true;
      this.categorias = [];
      for (let i = 0; i < data.length; i++) {
        data[i].split('|').forEach(element => {
          if (this.categorias.length > 0 && element != '' && !['Inicio', 'Pruebas', 'Vistas'].includes(element)) {
            if (this.categorias.findIndex(item => item.label == element) == -1) this.categorias.push({ label: element, icon: '', items: [] });
          } else if (element != '' && !['Inicio', 'Pruebas', 'Vistas'].includes(element)) this.categorias.push({ label: element, icon: '', items: [] });
        });
      }
      this.categorias.sort((a, b) => a.label.localeCompare(b.label));
      this.agregarOpcionesAdiciones();
      setTimeout(() => this.cargarOpcionesMenu(), 50);
    });
  }

  agregarOpcionesAdiciones() {
    this.categorias.unshift({
      label: `Inicio`,
      icon: 'pi pi-home',
      command: () => {
        this.router.navigate(['/home']);
        this.display = false;
      }
    });

    if (this.storage_Id == 123456789) {
      this.categorias.unshift({
        label: `Vistas`,
        icon: 'pi pi-eye',
        command: () => {
          this.router.navigate(['/gestion-vistas']);
          this.display = false;
        }
      });
      this.categorias.unshift({
        label: `Pruebas`,
        icon: 'pi pi-wrench',
        command: () => {
          this.router.navigate(['/pruebas']);
          this.display = false;
        }
      });
    }
  }

  cargarOpcionesMenu() {
    let count: number = 0;
    let storage_Id: number = this.storage_Id;
    this.categorias.forEach(element => {
      if (element.label == 'Calidad' && storage_Id != 1081784961) {
        element.items.push(
          {
            label: 'Sistema de Gestión', icon: '', items: [
              { label: 'Aseguramiento de la Calidad', icon: 'pi pi-flag-fill', command: () => { this.router.navigate(['/aseguramiento-calidad']); } },
              { label: 'Sistemas de Gestión', icon: 'pi pi-check-circle', command: () => { this.router.navigate(['/sistema-gestion-calidad']); } }
            ]
          }
        );
      }

      this.vistasPermisosService.Get_Vistas_Rol(this.ValidarRol, element.label).subscribe(data => {
        for (let i = 0; i < data.length; i++) {
          if (element.items) {
            element.items.push(
              {
                label: data[i].vp_Nombre, icon: data[i].vp_Icono_Menu,
                command: () => {
                  this.router.navigate([data[i].vp_Ruta]);
                  if (element.label == `Materia Prima`) {
                    if (data[i].vp_Ruta == `/inventario-areas`) this.router.navigate([`${data[i].vp_Ruta}/materiales`]);
                  } else if (element.label == `Productos`) {
                    if (data[i].vp_Ruta == `/inventario-areas`) this.router.navigate([`${data[i].vp_Ruta}/items`]);
                  }
                  this.display = false;
                }
              });
          }
        }
        if (element.items) element.items.sort((a, b) => a.label.localeCompare(b.label));
        if (![1, 3, 7, 61, 85, 63, 89, 62, 4, 88, 12, 2, 104].includes(this.ValidarRol) && element.label == `Materia Prima`) element.items.splice(element.items.findIndex(x => x.label == `Inventario Areas`), 1);
        count++;
        if (count == this.categorias.length) this.cargando = false;
      });
    });
  }

  mostrarMenuUsuario = () => this.menuUsuario = true;

  abrirModalUsuario() {
    this.usuarioService.getUsuariosxId(this.storage_Id).subscribe(dataUsuarios => {
      this.FormUsuarios.patchValue({ usuNombre: dataUsuarios[0].usua_Nombre, usuPassword: dataUsuarios[0].usua_Contrasena, });
    });
  }

  // Funcion que actualizará los usuarios
  actualizarUsuario() {
    this.usuarioService.getUsuariosxId(this.storage_Id).subscribe(dataUsuarios => {
      for (let i = 0; i < dataUsuarios.length; i++) {
        const infoUsuarios: any = {
          Usua_Id: dataUsuarios[i].usua_Id,
          Usua_Nombre: this.FormUsuarios.value.usuNombre,
          TpUsu_Id: dataUsuarios[i].tpUsu_Id,
          Area_Id: dataUsuarios[i].area_Id,
          RolUsu_Id: dataUsuarios[i].rolUsu_Id,
          Estado_Id: dataUsuarios[i].estado_Id,
          Usua_Telefono: dataUsuarios[i].usua_Telefono,
          Usua_Contrasena: this.FormUsuarios.value.usuPassword,
          Usua_Email: dataUsuarios[i].usua_Email,
          TipoIdentificacion_Id: 'C.C',
          Empresa_Id: 800188732,
          cajComp_Id: dataUsuarios[i].cajComp_Id,
          eps_Id: dataUsuarios[i].eps_Id,
          fPen_Id: dataUsuarios[i].fPen_Id,
          Usua_Fecha: dataUsuarios[i].usua_Fecha,
          Usua_Hora: dataUsuarios[i].usua_Hora,
          Usua_Cedula: dataUsuarios[i].usua_Cedula,
        }
        this.usuarioService.srvActualizarUsuario(infoUsuarios.Usua_Id, infoUsuarios).subscribe(() => {
          this.modalUsuario = false;
          this.mensajeService.mensajeConfirmacion('OK!', `¡Los datos del usuario ${this.FormUsuarios.value.usuNombre} han sido actualizados!`);
        }, () => this.mensajeService.mensajeError(`¡Ocurrió un error!`, `¡Ocurrió un error al actualizar los datos del usuario ${this.FormUsuarios.value.usuNombre}!`));
      }
    });
  }

  // Funcion que consultará la cantidad de eventos que hay en el mes
  cantidadEventosMes() {
    let inicio: any = moment().format('YYYY-MM-DD');
    let fin: any = moment().endOf('month').format('YYYY-MM-DD');
    this.eventosCalService.GetCantidadEventos(this.storage_Id, this.ValidarRol, inicio, fin).subscribe({
      next: data => {
        this.cantidadEventos = Number(data) || 0;
        this.tooltipCalendario = this.cantidadEventos > 0
          ? `Calendario: ${this.cantidadEventos} evento(s) de hoy a fin de mes`
          : 'Calendario de eventos';
      },
      error: () => { /* el contador es informativo: si falla, se conserva el último valor */ },
    });
  }

  /**
   * Consulta los eventos de hoy y, si hay, los muestra una sola vez por sesión
   * (salvo que el usuario haya elegido "No volver a mostrar"; el login borra esa preferencia).
   */
  consultarEventosHoy() {
    let avisoMostrado = false;
    try { avisoMostrado = sessionStorage.getItem(LLAVE_AVISO_EVENTOS_DIA) === '1'; } catch { }
    if (avisoMostrado || this.cookieService.get('MostrarEventosDia') == 'no') return;

    this.eventosHoy = [];
    this.eventosCalService.GetEventosDia(this.storage_Id, this.ValidarRol).subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        this.eventosHoy.push({
          Fecha_Hora_Inicio: `${data[i].eventoCal_HoraInicial}`,
          Fecha_Hora_Fin: `${data[i].eventoCal_FechaFinal.replace('T00:00:00', '')} ${data[i].eventoCal_HoraFinal}`,
          Nombre: data[i].eventoCal_Nombre,
          Descripcion: data[i].eventoCal_Descripcion,
          Dia: moment().format('DD'),
          Mes: moment().format('MMM').toUpperCase(),
        });
      }
      if (this.eventosHoy.length == 0) return;
      this.eventosDia = true;
      try { sessionStorage.setItem(LLAVE_AVISO_EVENTOS_DIA, '1'); } catch { }
    });
  }

  consultarEventosMes() {
    this.eventosMes = [];
    this.eventosCalService.GEtEventosMes(this.storage_Id, this.ValidarRol).subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        this.eventosMes.push({
          Fecha_Hora_Inicio: `${data[i].eventoCal_HoraInicial}`,
          Fecha_Hora_Fin: `${data[i].eventoCal_FechaFinal.replace('T00:00:00', '')} ${data[i].eventoCal_HoraFinal}`,
          Nombre: data[i].eventoCal_Nombre,
          Descripcion: data[i].eventoCal_Descripcion,
          Dia: moment(data[i].eventoCal_FechaInicial).format('DD'),
          Mes: moment().format('MMM').toUpperCase(),
        });
      }
    });
  }

  mostrarModalCalendario = () => this.modalCalendario = true;

  noMostrarMasDialogoEventosDia(mostrar: string) {
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
        this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'You have accepted' });
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

  // Interruptor de tema: TemaService guarda la preferencia, cambia el CSS y avisa a todas las vistas abiertas
  mostrar() {
    this.temaService.cambiar(!!this.modoSeleccionado);
  }

  /**
   * Contador de correos nuevos en tiempo real: baja al abrir un correo y sube cuando llega uno, sin recargar.
   * Comparte la escucha a Firebase con la bandeja de correos (CorreosWebService).
   */
  private escucharCorreosNuevos() {
    this.correosWebService.cantidadNuevos$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: cantidad => this.cantidadCorreosNuevos = cantidad,
      error: () => { /* sin conexión a Firebase: se conserva el último valor */ },
    });
  }
}
