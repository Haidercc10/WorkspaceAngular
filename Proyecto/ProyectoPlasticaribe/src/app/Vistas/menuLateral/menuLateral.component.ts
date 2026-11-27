import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, HostListener, Inject, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import moment from 'moment';
import { CookieService } from 'ngx-cookie-service';
import { MenuItem } from 'primeng/api';
import { EventoCalendario, EventosCalendarioService } from 'src/app/Servicios/EventosCalendario/EventosCalendario.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { OpcionMenuLateral, Vistas_PermisosService } from 'src/app/Servicios/Vistas_Permisos/Vistas_Permisos.service';
import { AuthenticationService } from 'src/app/_Services/authentication.service';
import { AppComponent } from 'src/app/app.component';
import { CorreosWebService } from 'src/app/Servicios/CorreosWeb/CorreosWeb.service';
import { environment } from 'src/environments/environment';
import { VERSION_APP } from 'src/environments/version';
import { PreferenciaTema, TemaService, alCambiarTema } from 'src/app/Servicios/Tema/Tema.service';
import { TamanoLetraService } from 'src/app/Servicios/TamanoLetra/TamanoLetra.service';
import { PreferenciasUsuarioService } from 'src/app/Servicios/PreferenciasUsuario/PreferenciasUsuario.service';
import { VistaFavorita, VistasFavoritasService } from 'src/app/Servicios/VistasFavoritas/VistasFavoritas.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd } from '@angular/router';
import { combineLatest, filter, fromEvent, interval, merge, startWith, switchMap, throttleTime } from 'rxjs';
import { DestroyRef } from '@angular/core';
import { CantidadesTickets, TicketsService } from 'src/app/Servicios/Tickets/Tickets.service';
import { autorNovedadTicket, NotificacionesTicketsService, NotificacionTicket, NovedadesTickets, tituloNovedadTicket, ultimaNovedadPorTicket } from 'src/app/Servicios/Tickets/NotificacionesTickets.service';
import { OverlayPanel } from 'primeng/overlaypanel';
import { AvisosEsquinaService } from 'src/app/Servicios/AvisosEsquina/AvisosEsquina.service';
import { EncriptacionService } from 'src/app/Servicios/Encriptacion/Encriptacion.service';

/** Cada cuánto se refrescan los contadores de la barra superior mientras la pestaña está visible. */
const REFRESCO_CONTADORES_MS = 5 * 60 * 1000;
/** Llave de sessionStorage: el aviso de eventos del día ya se mostró en esta sesión (el logout limpia sessionStorage). */
const LLAVE_AVISO_EVENTOS_DIA = 'avisoEventosDiaMostrado';
/** Minutos antes del inicio en que se recuerda un evento con hora (0 = al iniciar). Los de todo el día no tienen recordatorios. */
const HITOS_RECORDATORIO_MIN = [30, 15, 0];
/** El recordatorio "Empieza ahora" se muestra hasta este tiempo después del inicio (p. ej. si la pestaña estaba oculta). */
const GRACIA_INICIO_MS = 2 * 60 * 1000;
/** Cada cuánto se revisan los recordatorios mientras la pestaña está visible. */
const REVISION_RECORDATORIOS_MS = 30 * 1000;
/** Prefijo de los recordatorios de eventos en los avisos de la esquina (AvisosEsquinaService). */
const PREFIJO_AVISO_EVENTO = 'evento:';
/**
 * localStorage, por usuario: día (YYYY-MM-DD) en que eligió "No mostrar más hoy" (sin aviso al entrar ni recordatorios),
 * y recordatorios ya mostrados ("id|inicio" → menor hito mostrado), compartidos entre pestañas y recargas.
 */
const LLAVE_EVENTOS_SILENCIADOS = 'eventosSilenciados_';
const LLAVE_RECORDATORIOS_MOSTRADOS = 'recordatoriosEventos_';

/** Categorías que no se muestran como panel: Inicio, Pruebas y Vistas van como enlaces directos al tope del menú. */
const CATEGORIAS_ENLACE_DIRECTO = ['Inicio', 'Pruebas', 'Vistas'];
/** Roles que ven "Inventario Areas" dentro de Materia Prima (los demás solo la ven en Productos). */
const ROLES_INVENTARIO_AREAS_MP = [1, 3, 7, 61, 85, 63, 89, 62, 4, 88, 12, 2, 104];
/** Usuario que ve "Pruebas" y "Vistas" (a propósito por usuario, no por rol). */
const USUARIO_VISTAS_PRUEBAS = 123456789;
/** Usuario que no ve "Sistema de Gestión" en Calidad (a propósito por usuario, no por rol). */
const USUARIO_SIN_SISTEMA_GESTION = 1081784961;
/** "Inventario Areas" no tiene página propia: según la categoría abre la de materiales o la de productos. */
const RUTA_INVENTARIO_AREAS = '/inventario-areas';
const SUBRUTA_INVENTARIO_AREAS: { [categoria: string]: string } = { 'Materia Prima': 'materiales', 'Productos': 'items' };

/** Texto sin tildes, en minúsculas y sin espacios a los lados: "produccion" encuentra "Producción". */
const normalizarTexto = (texto: any): string => `${texto ?? ''}`.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

@Component({
  selector: 'app-menuLateral',
  templateUrl: './menuLateral.component.html',
  styleUrls: ['./menuLateral.component.css']
})

export class MenuLateralComponent implements OnInit {

  display: boolean = false; // menú lateral izquierdo abierto
  public FormUsuarios !: FormGroup; // Formulario alojado en el modal para editar y eliminar usuarios

  categorias: MenuItem[] = []; // menú lateral completo (enlaces directos + categorías con sus vistas)
  modeloMenu: MenuItem[] = []; // lo que muestra el p-panelMenu: el menú completo o el resultado de la búsqueda
  cargando: boolean = false; // el menú lateral se está consultando
  errorMenu: boolean = false; // la última carga del menú lateral falló (se muestra "Reintentar")
  busquedaMenu: string = ''; // texto del buscador del menú lateral
  cantidadResultados: number = 0; // vistas que coinciden con la búsqueda
  primerResultado: MenuItem | null = null; // vista que se abre con Enter en el buscador
  @ViewChild('campoBuscarMenu') campoBuscarMenu?: ElementRef<HTMLInputElement>;
  menuUsuario: boolean = false;
  seccionMenuUsuario: number | number[] | null = null; // sección abierta del menú de usuario (0 perfil, 1 eventos)
  cargandoPerfil: boolean = false;
  guardandoPerfil: boolean = false;
  private readonly encriptacion = inject(EncriptacionService);
  modalCalendario: boolean = false;
  modalCorreos: boolean = false;
  storage_Id: number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre: any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol: any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol: number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  cantidadEventos: number = 0; //Variable que almacenará la cantidad de eventos que hay desde el día actual hasta el fin de mes
  eventosHoy: EventoCalendario[] = []; //Eventos que ocurren hoy (aviso "Eventos de hoy")
  eventosMes: EventoCalendario[] = []; //Eventos de hoy a fin de mes (badge y sección "Eventos" del menú de usuario)
  eventosDia: boolean = false; //Variable que indica si se mostrará el modal con los eventos del día
  /** Recordatorios de eventos (uno por evento: al pasar al siguiente hito o cambiar la hora se reemplaza) y novedades de tickets. */
  private readonly avisosEsquina = inject(AvisosEsquinaService);
  private readonly notificacionesTickets = inject(NotificacionesTicketsService);
  cantidadCorreosNuevos: number = 0; //Variable que almacenará la cantidad de correos nuevos que hay en el sistema
  modoSeleccionado: boolean;
  private readonly suscripcionTema = alCambiarTema(oscuro => this.modoSeleccionado = oscuro); // mantiene los logos y el "Ahora: …" al día con el tema

  // Sección "Apariencia" del menú de usuario: tema (claro / oscuro / sistema) y tamaño de letra
  readonly opcionesTema: { valor: PreferenciaTema, etiqueta: string, icono: string, ayuda: string }[] = [
    { valor: 'light', etiqueta: 'Claro', icono: 'pi-sun', ayuda: 'Tema claro' },
    { valor: 'dark', etiqueta: 'Oscuro', icono: 'pi-moon', ayuda: 'Tema oscuro' },
    { valor: 'system', etiqueta: 'Sistema', icono: 'pi-desktop', ayuda: 'Usa el mismo tema que Windows' },
  ];
  readonly nivelesLetra = TamanoLetraService.NIVELES;
  preferenciaTema: PreferenciaTema = 'light';
  porcentajeLetra: number = TamanoLetraService.PREDETERMINADO;
  avisoLetraVisible: boolean = false;
  private temporizadorAvisoLetra?: ReturnType<typeof setTimeout>;
  private readonly suscripcionPreferenciaTema = inject(TemaService).preferencia$.pipe(takeUntilDestroyed())
    .subscribe(preferencia => this.preferenciaTema = preferencia);
  private readonly suscripcionLetra = inject(TamanoLetraService).porcentaje$.pipe(takeUntilDestroyed())
    .subscribe(porcentaje => this.porcentajeLetra = porcentaje);
  esBeta: boolean = environment.esBeta; //Indica si la app se compiló para el entorno de pruebas (npm run build:beta)
  versionApp: string = VERSION_APP; //Versión de la app (package.json), se sube con npm run version:parche | version:menor | version:mayor

  // Estrella de la barra superior: agrega o quita la página actual de los accesos rápidos (barra inferior)
  private readonly vistasFavService = inject(VistasFavoritasService);
  vistaActual: VistaFavorita | null = null; // vista de la página actual, si el rol puede tenerla como acceso rápido
  esFavorita: boolean = false;
  guardandoFavorito: boolean = false;
  // Botón de tickets (todos): su número son las novedades sin leer y abre el panel de novedades. A soporte (rol 1) el
  // panel y el tooltip le muestran además los abiertos y en revisión; cantidadesTickets queda en null para los demás.
  private readonly ticketsService = inject(TicketsService);
  cantidadesTickets: CantidadesTickets | null = null;
  novedadesTickets: NovedadesTickets = { total: 0, notificaciones: [] };
  /** Última novedad de cada ticket, la más reciente primero (filas del panel). */
  filasNovedades: { novedad: NotificacionTicket; cantidad: number }[] = [];
  tooltipTickets: string = 'Tickets';
  private readonly suscripcionTickets = combineLatest([
    this.ticketsService.cantidadesSoporte$,
    this.notificacionesTickets.novedades$,
  ]).pipe(takeUntilDestroyed()).subscribe(([c, novedades]) => {
    this.cantidadesTickets = c;
    this.novedadesTickets = novedades;
    this.filasNovedades = ultimaNovedadPorTicket(novedades.notificaciones);
    const partes = [novedades.total > 0 ? `${novedades.total} novedad(es) sin leer` : 'sin novedades'];
    if (c) partes.push(`${c.abiertos} abierto(s), ${c.enRevision} en revisión`);
    this.tooltipTickets = `Tickets: ${partes.join(' · ')}`;
  });
  readonly tituloNovedad = tituloNovedadTicket;
  readonly autorNovedad = autorNovedadTicket;
  /** Fecha relativa de la novedad ("hace 5 minutos"). */
  haceCuanto = (fecha: string) => moment(fecha).fromNow();

  /** Abre el ticket de la novedad desde el panel. */
  verNovedadTicket(n: NotificacionTicket, panel: OverlayPanel) {
    panel.hide();
    this.notificacionesTickets.verTicket(n.ticketId, n.esMio);
  }

  /**
   * PrimeNG pone la punta del panel a 1.25rem del borde izquierdo del botón (menos dos veces el radio del panel), no
   * en su centro; como el panel se corre a la izquierda para no salirse de la pantalla, la punta quedaba antes del
   * ícono. Se recalcula para que apunte al centro del botón (1.25rem según el tamaño de letra actual).
   */
  centrarFlechaPanel(panel: OverlayPanel, boton: HTMLElement) {
    const contenedor = panel.container;
    if (!contenedor) return;
    const rem = parseFloat(getComputedStyle(this.document.documentElement).fontSize) || 16;
    const centroBoton = boton.getBoundingClientRect().left + boton.offsetWidth / 2;
    contenedor.style.setProperty('--overlayArrowLeft', `${centroBoton - contenedor.getBoundingClientRect().left - 1.25 * rem}px`);
  }

  marcarNovedadesLeidas(panel: OverlayPanel) {
    panel.hide();
    this.notificacionesTickets.marcarTodasLeidas();
  }

  irAMisTickets(panel: OverlayPanel) {
    panel.hide();
    this.router.navigate(['/Tickets'], { queryParams: { pestana: 'mis-tickets' } });
  }

  irAGestionTicketsDesdePanel(panel: OverlayPanel) {
    panel.hide();
    this.irAGestionTickets();
  }

  tooltipCalendario: string = 'Calendario de eventos';
  private readonly destroyRef = inject(DestroyRef);
  private readonly correosWebService = inject(CorreosWebService);

  private readonly suscripcionFavorito = combineLatest([
    inject(Router).events.pipe(filter(e => e instanceof NavigationEnd), startWith(null)),
    this.vistasFavService.misFavoritos$,
    this.vistasFavService.disponiblesSinError(),
  ]).pipe(takeUntilDestroyed()).subscribe(([, { favoritos }, disponibles]) => {
    const url = this.router?.url ?? location.pathname;
    // Inicio ya es un acceso rápido fijo: en esa página no se muestra la estrella.
    this.vistaActual = VistasFavoritasService.esInicio(url) ? null : VistasFavoritasService.vistaDeUrl(url, disponibles);
    this.esFavorita = !!this.vistaActual && favoritos.some(f => f.id === this.vistaActual!.id);
  });

  constructor(private AppComponent: AppComponent,
    private formBuilder: FormBuilder,
    private rolService: RolesService,
    private authenticationService: AuthenticationService,
    private cookieService: CookieService,
    @Inject(DOCUMENT) private document: Document,
    private usuarioService: UsuarioService,
    private mensajeService: MensajesAplicacionService,
    private eventosCalService: EventosCalendarioService,
    private vistasPermisosService: Vistas_PermisosService,
    private router: Router,
    private temaService: TemaService,
    private tamanoLetraService: TamanoLetraService,
    private preferenciasUsuario: PreferenciasUsuarioService,) {

    this.FormUsuarios = this.formBuilder.group({
      usuNombre: [null, [Validators.required, Validators.maxLength(50)]],
      usuPassword: [null, [Validators.required, Validators.maxLength(25)]],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.cantidadEventosMes();
    this.consultarEventosHoy();
    this.programarRecordatoriosEventos();
    this.notificacionesTickets.iniciar(this.destroyRef);
    this.cargarMenuLateral();
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

  /**
   * Abre el menú lateral (clic en el logo) con el buscador vacío y la categoría de la página actual abierta.
   * Si la última carga falló, la reintenta al abrirlo.
   */
  mostrarMenuLateral() {
    this.limpiarBusqueda();
    this.abrirCategoriaActual();
    this.display = true;
    if (this.errorMenu && !this.cargando) this.cargarMenuLateral(true);
  }

  /** Al terminar de abrirse el menú, pone el cursor en el buscador (solo con mouse: en celular abriría el teclado). */
  enfocarBuscador() {
    let conMouse = false;
    try { conMouse = matchMedia('(hover: hover) and (pointer: fine)').matches; } catch { }
    if (conMouse) this.campoBuscarMenu?.nativeElement.focus();
  }

  //#region Buscador del menú lateral
  buscarEnMenu(texto: string) {
    this.busquedaMenu = texto;
    this.aplicarBusqueda();
  }

  limpiarBusqueda() {
    this.busquedaMenu = '';
    this.aplicarBusqueda();
  }

  /** Enter en el buscador: abre la primera vista encontrada. */
  abrirPrimerResultado() {
    if (!this.busquedaMenu.trim() || !this.primerResultado?.routerLink) return;
    this.router.navigateByUrl(`${this.primerResultado.routerLink}`);
    this.display = false;
  }

  /** Escape con texto: borra la búsqueda sin cerrar el menú. Sin texto, deja que el menú se cierre como siempre. */
  escapeEnBuscador(evento: Event) {
    if (!this.busquedaMenu) return;
    evento.stopPropagation();
    this.limpiarBusqueda();
  }

  private aplicarBusqueda() {
    const termino = normalizarTexto(this.busquedaMenu);
    this.modeloMenu = termino ? this.filtrarMenu(this.categorias, termino) : this.categorias;
    const opciones = this.opcionesFinales(this.modeloMenu);
    this.cantidadResultados = opciones.length;
    this.primerResultado = opciones[0] ?? null;
  }

  /**
   * Deja las vistas cuyo nombre contiene el texto; si el texto coincide con una categoría, la deja completa.
   * Los grupos que quedan se muestran abiertos. Se copian los grupos para no cambiar el menú completo.
   */
  private filtrarMenu(items: MenuItem[], termino: string): MenuItem[] {
    const resultado: MenuItem[] = [];
    for (const item of items) {
      const coincide = normalizarTexto(item.label).includes(termino);
      if (item.items?.length) {
        const hijos = coincide ? item.items : this.filtrarMenu(item.items, termino);
        if (hijos.length > 0) resultado.push({ ...item, expanded: true, items: hijos });
      } else if (coincide) resultado.push(item);
    }
    return resultado;
  }

  /** Vistas (opciones con enlace) en el orden en que se ven en el menú. */
  private opcionesFinales(items: MenuItem[]): MenuItem[] {
    return items.flatMap(item => item.items?.length ? this.opcionesFinales(item.items) : (item.routerLink ? [item] : []));
  }
  //#endregion

  /**
   * Deja abierta solo la categoría (y el grupo interno) donde está la página actual; las demás se cierran,
   * así el menú no acumula categorías abiertas de visitas anteriores. En Inicio quedan todas cerradas.
   * Los grupos internos se leen al crear el p-panelMenu, por eso a la categoría se le pasa una copia de su lista.
   * Una vista puede estar en varias categorías (p. ej. "Ver Pedidos" en Comercial y Pedidos): solo se abre la primera,
   * porque el p-panelMenu es de una categoría a la vez ([multiple]="false") y con dos abiertas el contenido de una
   * queda encimado sobre las categorías siguientes.
   */
  private abrirCategoriaActual() {
    const url = VistasFavoritasService.normalizarRuta(this.router.url);
    let yaAbierta = false;
    this.categorias.forEach(categoria => {
      if (!categoria.items?.length) return;
      const contieneActual = !yaAbierta && this.marcarRutaActual(categoria.items, url);
      categoria.expanded = contieneActual;
      if (contieneActual) {
        yaAbierta = true;
        categoria.items = [...categoria.items];
      }
    });
  }

  /** Abre los grupos que contienen la página actual; indica si la encontró en esta lista. */
  private marcarRutaActual(items: MenuItem[], url: string): boolean {
    let encontrada = false;
    for (const item of items) {
      if (item.items?.length) {
        if (this.marcarRutaActual(item.items, url)) {
          item.expanded = true;
          encontrada = true;
        }
      } else if (item.routerLink) {
        const ruta = VistasFavoritasService.normalizarRuta(`${item.routerLink}`);
        if (url === ruta || url.startsWith(`${ruta}/`)) encontrada = true;
      }
    }
    return encontrada;
  }

  lecturaStorage() {
    this.storage_Id = this.AppComponent.storage_Id;
    this.preferenciasUsuario.iniciarSesion(this.storage_Id); // aplica el tema y la letra guardados de este usuario
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
    this.rolService.srvObtenerListaPorId(this.ValidarRol).subscribe(datos => this.storage_Rol = datos.rolUsu_Nombre);
    if ([1, 6, 2].includes(this.ValidarRol)) this.escucharCorreosNuevos(); // mismos roles que ven el botón de correos
  }

  //#region Apariencia (tema y tamaño de letra)
  get letraPredeterminada(): boolean {
    return this.porcentajeLetra === TamanoLetraService.PREDETERMINADO;
  }

  cambiarPreferenciaTema(preferencia: PreferenciaTema) {
    this.temaService.establecerPreferencia(preferencia);
  }

  cambiarTamanoLetra(porcentaje: number) {
    this.tamanoLetraService.establecer(porcentaje);
  }

  restablecerLetra() {
    this.tamanoLetraService.restablecer();
  }

  /**
   * Atajos de teclado del tamaño de letra, en cualquier vista: Ctrl + Alt + (+ / −) y Ctrl + Alt + 0 para restablecer.
   * Se usa event.code (posición de la tecla) porque en teclados en español Ctrl + Alt equivale a AltGr y event.key trae
   * otro carácter. Por la misma razón no actúan mientras se escribe en un campo: ahí AltGr + tecla escribe símbolos
   * (p. ej. "~" o "]") y no se deben robar.
   */
  @HostListener('document:keydown', ['$event'])
  atajoTamanoLetra(evento: KeyboardEvent) {
    if (!evento.ctrlKey || !evento.altKey || evento.shiftKey || evento.metaKey || this.esCampoEditable(evento.target)) return;

    const antes = this.porcentajeLetra;
    if (['NumpadAdd', 'Equal', 'BracketRight'].includes(evento.code)) this.tamanoLetraService.aumentar();
    else if (['NumpadSubtract', 'Minus', 'Slash'].includes(evento.code)) this.tamanoLetraService.disminuir();
    else if (['Numpad0', 'Digit0'].includes(evento.code)) this.tamanoLetraService.restablecer();
    else return;

    evento.preventDefault();
    // Se avisa incluso si no cambió (ya estaba en el mínimo, el máximo o el 100 %), para que se vea que el atajo funcionó
    if (!this.menuUsuario || antes === this.porcentajeLetra) this.mostrarAvisoLetra();
  }

  private esCampoEditable(destino: EventTarget | null): boolean {
    const elemento = destino as HTMLElement | null;
    if (!elemento?.tagName) return false;
    return elemento.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(elemento.tagName);
  }

  private mostrarAvisoLetra() {
    this.avisoLetraVisible = true;
    clearTimeout(this.temporizadorAvisoLetra);
    this.temporizadorAvisoLetra = setTimeout(() => this.avisoLetraVisible = false, 1500);
  }
  //#endregion

  //#region Menú lateral
  /**
   * Consulta en una sola petición las vistas del rol y arma el menú agrupado por categoría.
   * Las categorías sin vistas no se muestran. Si falla, el menú queda en estado de error con "Reintentar".
   * @param avisarError muestra el error con "Ver detalles": solo cuando el usuario pidió la carga (abrir el menú o
   * "Reintentar"), para no lanzar un aviso al entrar a la app por un menú que todavía no ha abierto.
   */
  cargarMenuLateral(avisarError: boolean = false) {
    this.cargando = true;
    this.errorMenu = false;
    this.vistasPermisosService.GetMenu(this.ValidarRol).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: opciones => {
        this.categorias = [...this.enlacesDirectos(), ...this.agruparPorCategoria(opciones ?? [])];
        this.cargando = false;
        this.aplicarBusqueda();
        if (this.display) this.abrirCategoriaActual(); // se reintentó con el menú abierto
      },
      error: error => {
        this.cargando = false;
        this.errorMenu = true;
        if (avisarError) this.mensajeService.errorDetallado(error, '¡No se pudo cargar el menú!', { operacion: 'Cargar el menú lateral', metodo: 'GET' });
      },
    });
  }

  /** Paneles del menú en orden alfabético, sin las categorías que van como enlace directo (Inicio, Pruebas, Vistas). */
  private agruparPorCategoria(opciones: OpcionMenuLateral[]): MenuItem[] {
    const porCategoria = new Map<string, OpcionMenuLateral[]>();
    opciones.filter(opcion => opcion.categoria && !CATEGORIAS_ENLACE_DIRECTO.includes(opcion.categoria)).forEach(opcion => {
      if (!porCategoria.has(opcion.categoria)) porCategoria.set(opcion.categoria, []);
      porCategoria.get(opcion.categoria)!.push(opcion);
    });
    return [...porCategoria.keys()]
      .sort((a, b) => a.localeCompare(b))
      .map(nombre => this.crearCategoria(nombre, porCategoria.get(nombre)!))
      .filter(categoria => categoria.items!.length > 0);
  }

  /** Panel de una categoría con sus vistas ordenadas alfabéticamente. */
  private crearCategoria(nombre: string, vistas: OpcionMenuLateral[]): MenuItem {
    let items: MenuItem[] = vistas.map(vista => this.crearOpcion(vista.nombre, vista.icono, this.rutaDeVista(nombre, vista.ruta)));

    if (nombre == 'Materia Prima' && !ROLES_INVENTARIO_AREAS_MP.includes(this.ValidarRol)) items = items.filter(item => item.label != 'Inventario Areas');

    if (nombre == 'Calidad' && this.storage_Id != USUARIO_SIN_SISTEMA_GESTION) {
      items.push({
        label: 'Sistema de Gestión', icon: '', items: [
          this.crearOpcion('Aseguramiento de la Calidad', 'pi pi-flag-fill', '/aseguramiento-calidad'),
          this.crearOpcion('Sistemas de Gestión', 'pi pi-check-circle', '/sistema-gestion-calidad'),
        ]
      });
    }

    items.sort((a, b) => `${a.label}`.localeCompare(`${b.label}`));
    return { label: nombre, icon: '', items };
  }

  /** "Inventario Areas" no tiene página propia: va directo a la de materiales o a la de productos según la categoría. */
  private rutaDeVista(categoria: string, ruta: string): string {
    const subruta = SUBRUTA_INVENTARIO_AREAS[categoria];
    return ruta == RUTA_INVENTARIO_AREAS && subruta ? `${ruta}/${subruta}` : ruta;
  }

  /**
   * Opción del menú como enlace real (routerLink): se puede abrir en otra pestaña con Ctrl/Shift + clic o clic central,
   * y PrimeNG la resalta (p-menuitem-link-active) cuando es la página actual.
   * Con un clic normal cierra el menú; con Ctrl/Shift/⌘ el navegador abre otra pestaña y el menú sigue abierto.
   */
  private crearOpcion(label: string, icon: string, ruta: string): MenuItem {
    return {
      label, icon,
      routerLink: ruta,
      command: ({ originalEvent }) => {
        const evento = originalEvent as MouseEvent | undefined;
        if (!evento?.ctrlKey && !evento?.shiftKey && !evento?.metaKey) this.display = false;
      },
    };
  }

  /** Enlaces al tope del menú: Inicio para todos; Pruebas y Vistas solo para el usuario autorizado. */
  private enlacesDirectos(): MenuItem[] {
    const enlaces: MenuItem[] = [];
    if (this.storage_Id == USUARIO_VISTAS_PRUEBAS) {
      enlaces.push(this.crearOpcion('Pruebas', 'pi pi-wrench', '/pruebas'));
      enlaces.push(this.crearOpcion('Vistas', 'pi pi-eye', '/gestion-vistas'));
    }
    enlaces.push(this.crearOpcion('Inicio', 'pi pi-home', '/home'));
    return enlaces;
  }
  //#endregion

  /** Iniciales del usuario para el avatar del menú de usuario (máx. 2 letras). */
  get inicialesUsuario(): string {
    const palabras = `${this.storage_Nombre ?? ''}`.trim().split(/\s+/).filter(Boolean);
    if (palabras.length == 0) return '?';
    return (palabras[0][0] + (palabras.length > 1 ? palabras[palabras.length - 1][0] : '')).toUpperCase();
  }

  /** Abre el menú de usuario con los datos frescos del perfil y todas las secciones cerradas (el usuario decide cuál abrir). */
  mostrarMenuUsuario() {
    this.seccionMenuUsuario = null;
    this.menuUsuario = true;
    this.cargarPerfil();
  }

  /** Carga (o recarga, al descartar) el nombre y la contraseña del usuario en el formulario de perfil. */
  cargarPerfil() {
    this.cargandoPerfil = true;
    this.usuarioService.getUsuariosxId(this.storage_Id).subscribe({
      next: datos => {
        const usuario = datos?.[0];
        this.FormUsuarios.reset({ usuNombre: usuario?.usua_Nombre ?? '', usuPassword: usuario?.usua_Contrasena ?? '' });
        this.cargandoPerfil = false;
      },
      error: () => {
        this.cargandoPerfil = false;
        this.mensajeService.mensajeError('¡No se pudo cargar su perfil!', 'Intente de nuevo en unos segundos.');
      },
    });
  }

  campoInvalido = (campo: string): boolean => {
    const control = this.FormUsuarios.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched);
  };

  /** Guarda el nombre y la contraseña del usuario conectado, conservando el resto de sus datos. */
  actualizarUsuario() {
    if (this.guardandoPerfil) return;
    if (this.FormUsuarios.invalid) {
      Object.values(this.FormUsuarios.controls).forEach(c => { c.markAsDirty(); c.markAsTouched(); });
      this.mensajeService.mensajeAdvertencia('¡Campos incompletos!', 'Debe llenar el nombre y la contraseña.');
      return;
    }

    const nombre: string = `${this.FormUsuarios.value.usuNombre}`.trim().toUpperCase();
    const contrasena: string = `${this.FormUsuarios.value.usuPassword}`;
    this.guardandoPerfil = true;

    this.usuarioService.getUsuariosxId(this.storage_Id).pipe(
      switchMap(datos => {
        const usuario = datos?.[0];
        if (!usuario) throw new Error('Usuario no encontrado');
        return this.usuarioService.srvActualizarUsuario(usuario.usua_Id, {
          Usua_Id: usuario.usua_Id,
          Usua_Nombre: nombre,
          TpUsu_Id: usuario.tpUsu_Id,
          Area_Id: usuario.area_Id,
          RolUsu_Id: usuario.rolUsu_Id,
          Estado_Id: usuario.estado_Id,
          Usua_Telefono: usuario.usua_Telefono,
          Usua_Contrasena: contrasena,
          Usua_Email: usuario.usua_Email,
          TipoIdentificacion_Id: usuario.tipoIdentificacion_Id ?? 'C.C',
          Empresa_Id: usuario.empresa_Id ?? 800188732,
          cajComp_Id: usuario.cajComp_Id,
          eps_Id: usuario.eps_Id,
          fPen_Id: usuario.fPen_Id,
          Usua_Fecha: usuario.usua_Fecha,
          Usua_Hora: usuario.usua_Hora,
          Usua_Cedula: usuario.usua_Cedula,
        });
      }),
    ).subscribe({
      next: () => {
        this.guardandoPerfil = false;
        this.actualizarNombreSesion(nombre);
        this.FormUsuarios.reset({ usuNombre: nombre, usuPassword: contrasena });
        this.mensajeService.mensajeConfirmacion('OK!', '¡Su perfil fue actualizado!');
      },
      error: () => {
        this.guardandoPerfil = false;
        this.mensajeService.mensajeError('¡Ocurrió un error!', '¡No se pudieron guardar los cambios de su perfil!');
      },
    });
  }

  /** Refleja el nuevo nombre en la barra superior y en la sesión (lo usan el registro de cierre de sesión y otras vistas). */
  private actualizarNombreSesion(nombre: string) {
    this.storage_Nombre = nombre;
    this.AppComponent.storage_Nombre = nombre;
    this.authenticationService.saveInLocal('Nombre', this.encriptacion.encrypt(nombre));
  }

  /** Eventos de hoy a fin de mes: alimentan el badge del calendario y la sección "Eventos" del menú de usuario. */
  cantidadEventosMes() {
    const hoy = moment().startOf('day');
    this.eventosCalService.getRango(hoy.toDate(), hoy.clone().endOf('month').toDate(), Number(this.ValidarRol)).subscribe({
      next: eventos => {
        const ahora = new Date();
        this.eventosMes = eventos.filter(e => e.fin >= ahora);
        this.cantidadEventos = this.eventosMes.length;
        this.tooltipCalendario = this.cantidadEventos > 0
          ? `Calendario: ${this.cantidadEventos} evento(s) de hoy a fin de mes`
          : 'Calendario de eventos';
        this.revisarRecordatorios();
      },
      error: () => { /* el contador es informativo: si falla, se conserva el último valor */ },
    });
  }

  /**
   * Aviso "Eventos de hoy", una sola vez por sesión (salvo que el usuario haya elegido "No mostrar más hoy").
   * Muestra los eventos de todo el día y los que tienen hora y aún no empiezan: uno de 12:00 sale si se entra
   * a las 8:00, pero ya no desde las 12:00.
   */
  consultarEventosHoy() {
    let avisoMostrado = false;
    try { avisoMostrado = sessionStorage.getItem(LLAVE_AVISO_EVENTOS_DIA) === '1'; } catch { }
    if (avisoMostrado || this.eventosSilenciadosHoy()) return;

    this.eventosCalService.getHoy(Number(this.ValidarRol)).subscribe({
      next: eventos => {
        const ahora = new Date();
        this.eventosHoy = eventos.filter(e => e.todoElDia || e.inicio > ahora);
        if (this.eventosHoy.length == 0) return;
        this.eventosDia = true;
        try { sessionStorage.setItem(LLAVE_AVISO_EVENTOS_DIA, '1'); } catch { }
      },
      error: () => { /* el aviso es informativo: si falla, simplemente no se muestra */ },
    });
  }

  mostrarModalCalendario = () => {
    this.eventosDia = false;
    this.menuUsuario = false;
    this.modalCalendario = true;
  };

  /** "No mostrar más hoy" (aviso de entrada y recordatorios): sin avisos de eventos hasta mañana. */
  noMostrarEventosHoy() {
    try { localStorage.setItem(LLAVE_EVENTOS_SILENCIADOS + this.storage_Id, moment().format('YYYY-MM-DD')); } catch { }
    this.eventosDia = false;
    this.avisosEsquina.quitarSi(a => a.id.startsWith(PREFIJO_AVISO_EVENTO));
  }

  private eventosSilenciadosHoy(): boolean {
    try { return localStorage.getItem(LLAVE_EVENTOS_SILENCIADOS + this.storage_Id) === moment().format('YYYY-MM-DD'); }
    catch { return false; }
  }

  /** Revisa los recordatorios cada REVISION_RECORDATORIOS_MS y al volver a la pestaña. */
  private programarRecordatoriosEventos() {
    merge(interval(REVISION_RECORDATORIOS_MS), fromEvent(this.document, 'visibilitychange'))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.revisarRecordatorios());
  }

  /**
   * Recordatorios de eventos con hora: 30 y 15 minutos antes y al iniciar (HITOS_RECORDATORIO_MIN); cuando el evento
   * empieza ya no se recuerda. Toma los eventos de eventosMes (se refrescan cada REFRESCO_CONTADORES_MS y al crear o
   * editar uno). Solo con la pestaña visible; si se saltó un hito (pestaña oculta), sale solo el más reciente.
   * Cada hito sale una vez aunque se recargue o haya varias pestañas (registro en localStorage).
   */
  private revisarRecordatorios() {
    if (this.document.visibilityState !== 'visible' || this.eventosSilenciadosHoy()) return;

    const ahora = Date.now();
    const llaveRegistro = LLAVE_RECORDATORIOS_MOSTRADOS + this.storage_Id;
    let mostrados: Record<string, number> = {};
    try { mostrados = JSON.parse(localStorage.getItem(llaveRegistro) || '{}') ?? {}; } catch { }
    let cambio = false;

    for (const evento of this.eventosMes) {
      if (evento.todoElDia) continue;
      const inicio = evento.inicio.getTime();
      if (ahora >= inicio + GRACIA_INICIO_MS) continue;
      const alcanzados = HITOS_RECORDATORIO_MIN.filter(h => ahora >= inicio - h * 60000);
      if (alcanzados.length == 0) continue;
      const hito = Math.min(...alcanzados);
      const llave = `${evento.id}|${inicio}`; // con el inicio: si editan la hora, se vuelve a recordar
      if (mostrados[llave] != null && mostrados[llave] <= hito) continue;
      mostrados[llave] = hito;
      cambio = true;
      this.mostrarRecordatorio(evento, hito);
    }

    // Recordatorios en pantalla de eventos eliminados o con otra hora de inicio (si la nueva ya tocaba, se reemplazó arriba)
    const inicios = new Map(this.eventosMes.map(e => [e.id, e.inicio.getTime()]));
    this.avisosEsquina.quitarSi(a => a.id.startsWith(PREFIJO_AVISO_EVENTO) && inicios.get(a.datos.id) !== a.datos.inicio);

    // Se olvidan los registros de eventos que empezaron hace más de un día
    for (const llave of Object.keys(mostrados)) {
      if (Number(llave.split('|')[1]) < ahora - 24 * 60 * 60 * 1000) { delete mostrados[llave]; cambio = true; }
    }
    if (cambio) try { localStorage.setItem(llaveRegistro, JSON.stringify(mostrados)); } catch { }
  }

  private mostrarRecordatorio(evento: EventoCalendario, hito: number) {
    const inicio = moment(evento.inicio), fin = moment(evento.fin);
    const horario = inicio.isSame(fin, 'day')
      ? `${inicio.format('h:mm a')} – ${fin.format('h:mm a')}`
      : `${inicio.format('h:mm a')} – ${fin.format('D MMM h:mm a')}`;
    // Los minutos que faltan de verdad: si el evento se creó con poca anticipación o la pestaña estuvo oculta,
    // el hito de 30 puede salir cuando faltan 20.
    const faltan = Math.ceil((evento.inicio.getTime() - Date.now()) / 60000);
    const id = PREFIJO_AVISO_EVENTO + evento.id;
    this.avisosEsquina.mostrar({
      id,
      severidad: hito == 0 ? 'warn' : 'info',
      icono: 'pi pi-clock',
      titulo: hito == 0 || faltan <= 0 ? 'El evento empieza ahora'
        : `El evento empieza en ${faltan} ${faltan == 1 ? 'minuto' : 'minutos'}`,
      detalle: `${evento.nombre} · ${horario}`,
      datos: { id: evento.id, inicio: evento.inicio.getTime() },
      acciones: [
        { etiqueta: 'Ver calendario', icono: 'pi pi-calendar', accion: () => { this.avisosEsquina.quitar(id); this.mostrarModalCalendario(); } },
        { etiqueta: 'No mostrar más hoy', icono: 'pi pi-ban', accion: () => this.noMostrarEventosHoy() },
      ],
    });
  }

  /** Cierra la sesión de inmediato, sin confirmación. */
  cerrarSesion() {
    this.menuUsuario = false;
    this.authenticationService.logout();
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
