import { Component, DestroyRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Detalle_TicketComponent } from '../Tickets/Detalle_Ticket/Detalle_Ticket.component';
import { TutorialesService } from 'src/app/Servicios/Tutoriales/Tutoriales.service';
import moment from 'moment';
import { Table } from 'primeng/table';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { CantidadesTickets, claseEstadoTicket, EstadoTicket, rangoFechasTicketsPorDefecto, TicketListado, TicketsService } from 'src/app/Servicios/Tickets/Tickets.service';
import { AppComponent } from 'src/app/app.component';
import { ClavesTutorialTickets, pasosTutorialGestionTickets } from 'src/app/Tutoriales/Tutoriales_Tickets';
import { alCambiarTema } from 'src/app/Servicios/Tema/Tema.service';

/** Qué tickets muestra la tabla: los pendientes salen siempre; las fechas solo limitan a los finalizados. */
type VistaTickets = 'pendientes' | 'finalizados' | 'todos';

/** Filtro que aplica cada chip de conteo sobre la tabla (reemplaza a la vista mientras está activo). */
type FiltroChipTicket = 'abiertos' | 'enRevision' | 'resueltosMes';

interface ChipEstadoTicket {
  filtro : FiltroChipTicket;
  etiqueta : string;
  icono : string;
  clase : string;
  tooltip : string;
  cantidad : (c : CantidadesTickets) => number;
}

/** Nivel de alerta por antigüedad de un ticket pendiente (clase CSS antiguedad--*). */
type NivelAntiguedad = 'normal' | 'advertencia' | 'peligro';

/** Ticket del listado con los datos calculados que usa la tabla. */
interface TicketGestion extends TicketListado {
  creado : Date;
  /** Días completos desde la creación (por fecha, sin hora). */
  dias : number;
  /** Solo en pendientes; null en finalizados. */
  nivelAntiguedad : NivelAntiguedad | null;
  /** Fecha y hora del último movimiento del historial, o la creación si aún no tiene. */
  ultimaActividad : Date;
  /** Pendiente y el último movimiento lo hizo el reportante: falta la respuesta de soporte. */
  esperandoSoporte : boolean;
}

/** Días desde la creación a partir de los cuales un pendiente se marca en amarillo y en rojo. */
const DIAS_ADVERTENCIA = 3;
const DIAS_PELIGRO = 6;

const ESTADOS_PENDIENTES : number[] = [EstadoTicket.ABIERTO, EstadoTicket.EN_REVISION];

@Component({
  selector: 'app-Gestion_Tickets',
  templateUrl: './Gestion_Tickets.component.html',
  styleUrls: ['./Gestion_Tickets.component.css']
})

export class Gestion_TicketsComponent implements OnInit, OnDestroy {

  @ViewChild('dt') dt: Table | undefined; //Variable identificadora en la que se verán los tickets
  cargando : boolean = false;
  modoSeleccionado : boolean = false; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  private readonly suscripcionTema = alCambiarTema(oscuro => this.modoSeleccionado = oscuro); // mantiene modoSeleccionado al día con el tema

  readonly DIAS_ADVERTENCIA = DIAS_ADVERTENCIA;
  readonly DIAS_PELIGRO = DIAS_PELIGRO;

  cantidades : CantidadesTickets = { abiertos: 0, enRevision: 0, resueltosMes: 0, promedioDiasResolucion: null };
  tickets : TicketGestion[] = []; // lo que devolvió la API
  ticketsTabla : TicketGestion[] = []; // lo que muestra la tabla (según la vista o el chip)
  ultimaConsulta : Date | null = null;

  readonly vistas : { label : string, value : VistaTickets }[] = [
    { label: 'Pendientes', value: 'pendientes' },
    { label: 'Finalizados', value: 'finalizados' },
    { label: 'Todos', value: 'todos' },
  ];
  vista : VistaTickets = 'pendientes';

  readonly chipsEstado : ChipEstadoTicket[] = [
    { filtro: 'abiertos', etiqueta: 'Abiertos', icono: 'pi pi-exclamation-triangle', clase: claseEstadoTicket(EstadoTicket.ABIERTO),
      tooltip: 'Ver solo los tickets abiertos', cantidad: c => c.abiertos },
    { filtro: 'enRevision', etiqueta: 'En revisión', icono: 'pi pi-hourglass', clase: claseEstadoTicket(EstadoTicket.EN_REVISION),
      tooltip: 'Ver solo los tickets en revisión', cantidad: c => c.enRevision },
    { filtro: 'resueltosMes', etiqueta: 'Resueltos en el mes', icono: 'pi pi-check-square', clase: claseEstadoTicket(EstadoTicket.RESUELTO),
      tooltip: 'Ver los tickets resueltos este mes', cantidad: c => c.resueltosMes },
  ];
  filtroChip : FiltroChipTicket | null = null; // chip seleccionado (null = sin filtro)

  /** Filtros de la barra (búsqueda general, tipo y área) y sus opciones, armadas con los tickets consultados. */
  busqueda : string = '';
  filtroTipo : string | null = null;
  filtroArea : string | null = null;
  opcionesTipo : string[] = [];
  opcionesArea : string[] = [];

  /** Rango de fechas de creación de los finalizados (por defecto, el último año). */
  fechaInicio : Date = rangoFechasTicketsPorDefecto().inicio;
  fechaFin : Date = rangoFechasTicketsPorDefecto().fin;
  readonly hoy : Date = new Date();

  codigoDetalle : number | null = null;
  detalleVisible : boolean = false;
  @ViewChild('detalleTicket') detalleTicket? : Detalle_TicketComponent;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  constructor(private AppComponent : AppComponent,
                private ticketService : TicketsService,
                  private tutoriales : TutorialesService,
                    private mensajeService : MensajesAplicacionService) { }

  ngOnInit() {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.consultar();
    // "Ver ticket" de los avisos de novedades llega con ?ticket=<código> (también estando ya en esta página)
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(parametros => {
      const ticket = Number(parametros.get('ticket'));
      if (ticket > 0) this.abrirTicketDesdeAviso(ticket);
    });
  }

  /**
   * Abre (o recarga, si ya está abierto) el detalle del ticket del aviso, recarga la tabla y quita ?ticket de la URL
   * para que al recargar no se vuelva a abrir y el mismo aviso funcione de nuevo.
   */
  private abrirTicketDesdeAviso(codigo : number) {
    if (this.detalleVisible && this.codigoDetalle === codigo) this.detalleTicket?.cargar();
    else {
      this.codigoDetalle = codigo;
      this.detalleVisible = true;
      this.consultar();
    }
    this.router.navigate([], { relativeTo: this.route, queryParams: { ticket: null }, queryParamsHandling: 'merge', replaceUrl: true });
  }

  ngOnDestroy() {
  }

  tutorial = () => this.tutoriales.iniciar(pasosTutorialGestionTickets());

  /** Las fechas solo aplican cuando la vista incluye finalizados (los pendientes salen siempre). */
  get usaFechas() : boolean { return this.vista !== 'pendientes' && !this.filtroChip; }

  /**
   * Consulta las cantidades de las tarjetas y la lista de tickets.
   * @param reiniciarPagina true cuando cambió el filtro; false al recargar tras atender un ticket (se queda en la misma página).
   */
  consultar(reiniciarPagina : boolean = false){
    const incluirFinalizados = this.vista !== 'pendientes';
    if (incluirFinalizados && (!this.fechaInicio || !this.fechaFin)) {
      this.mensajeService.mensajeAdvertencia('¡Faltan fechas!', 'Seleccione la fecha inicial y la fecha final.');
      return;
    }
    if (incluirFinalizados && this.fechaInicio > this.fechaFin) {
      this.mensajeService.mensajeAdvertencia('¡Rango inválido!', 'La fecha inicial no puede ser mayor que la fecha final.');
      return;
    }
    this.cargando = true;
    this.ticketService.getCantidades().subscribe(c => this.cantidades = c);
    this.ticketService.getGestion(this.fechaInicio, this.fechaFin, incluirFinalizados, this.filtroChip === 'resueltosMes').subscribe({
      next: datos => {
        this.tickets = datos.map(t => this.prepararTicket(t));
        this.opcionesTipo = this.valoresUnicos(this.tickets.map(t => t.tipo));
        this.opcionesArea = this.valoresUnicos(this.tickets.map(t => t.area));
        this.aplicarVista();
        if (reiniciarPagina && this.dt) this.dt.first = 0;
        this.ultimaConsulta = new Date();
        this.cargando = false;
        // Primera vez: se inicia cuando la tabla ya tiene datos (y no está la animación de carga encima)
        this.tutoriales.iniciarPrimeraVez(ClavesTutorialTickets.GESTION, this.AppComponent.storage_Id, pasosTutorialGestionTickets);
      },
      error: () => {
        this.cargando = false;
        this.mensajeService.mensajeError('¡Ha ocurrido un error!', '¡No se pudieron consultar los tickets!');
      }
    });
  }

  /** Calcula antigüedad, última actividad y si espera respuesta de soporte. */
  private prepararTicket(t : TicketListado) : TicketGestion {
    const creado = moment(t.fechaCreacion);
    const dias = moment().startOf('day').diff(creado.clone().startOf('day'), 'days');
    const pendiente = ESTADOS_PENDIENTES.includes(t.estadoId);
    const ultimaActividad = t.ultimaActividadFecha
      ? moment(`${t.ultimaActividadFecha.substring(0, 10)} ${t.ultimaActividadHora ?? '00:00:00'}`, 'YYYY-MM-DD HH:mm:ss').toDate()
      : creado.toDate();
    return {
      ...t,
      creado: creado.toDate(),
      dias,
      nivelAntiguedad: !pendiente ? null : dias >= DIAS_PELIGRO ? 'peligro' : dias >= DIAS_ADVERTENCIA ? 'advertencia' : 'normal',
      ultimaActividad,
      esperandoSoporte: pendiente && t.ultimoAutorId != null && t.ultimoAutorId === t.usuarioId,
    };
  }

  private valoresUnicos = (valores : string[]) : string[] =>
    [...new Set(valores.filter(v => !!v))].sort((a, b) => a.localeCompare(b, 'es'));

  /** Cambia entre pendientes, finalizados y todos; quita el chip seleccionado. */
  cambiarVista(vista : VistaTickets | null) {
    if (!vista) return;
    const necesitaConsultar = (vista !== 'pendientes') !== (this.vista !== 'pendientes') || this.filtroChip === 'resueltosMes';
    this.vista = vista;
    this.filtroChip = null;
    if (necesitaConsultar) this.consultar(true);
    else {
      this.aplicarVista();
      if (this.dt) this.dt.first = 0;
    }
  }

  /**
   * Filtra la tabla por el estado del chip; un segundo clic sobre el mismo chip quita el filtro.
   * Abiertos y en revisión siempre vienen en la consulta, así que se filtran aquí.
   * Resueltos en el mes se pide a la API por fecha de resolución, igual que la cantidad de la tarjeta.
   */
  seleccionarChip(filtro : FiltroChipTicket) {
    const anterior = this.filtroChip;
    this.filtroChip = anterior === filtro ? null : filtro;
    if (anterior === 'resueltosMes' || this.filtroChip === 'resueltosMes') {
      this.consultar(true);
      return;
    }
    this.aplicarVista();
    if (this.dt) this.dt.first = 0;
  }

  /** Arma ticketsTabla según el chip seleccionado o, si no hay, según la vista. */
  private aplicarVista() {
    const inicioMes = moment().startOf('month');
    const pendiente = (t : TicketGestion) => ESTADOS_PENDIENTES.includes(t.estadoId);
    const cumpleChip : Record<FiltroChipTicket, (t : TicketGestion) => boolean> = {
      abiertos: t => t.estadoId === EstadoTicket.ABIERTO,
      enRevision: t => t.estadoId === EstadoTicket.EN_REVISION,
      resueltosMes: t => t.estadoId === EstadoTicket.RESUELTO && t.fechaResolucion != null && moment(t.fechaResolucion).isSameOrAfter(inicioMes),
    };
    const cumpleVista : Record<VistaTickets, (t : TicketGestion) => boolean> = {
      pendientes: pendiente,
      finalizados: t => !pendiente(t),
      todos: () => true,
    };
    this.ticketsTabla = this.tickets.filter(this.filtroChip ? cumpleChip[this.filtroChip] : cumpleVista[this.vista]);
  }

  /** Consulta los finalizados creados desde el primer día del mes actual hasta hoy. */
  filtrarMesActual(){
    this.fechaInicio = moment().startOf('month').toDate();
    this.fechaFin = moment().startOf('day').toDate();
    this.consultar(true);
  }

  /** Vuelve a pendientes, al rango por defecto (último año) y sin filtros. */
  clearFilters(){
    this.filtroChip = null;
    this.vista = 'pendientes';
    this.busqueda = '';
    this.filtroTipo = null;
    this.filtroArea = null;
    this.dt?.reset();
    const rango = rangoFechasTicketsPorDefecto();
    this.fechaInicio = rango.inicio;
    this.fechaFin = rango.fin;
    this.consultar(true);
  }

  buscar = () => this.dt?.filterGlobal(this.busqueda, 'contains');
  filtrarTipo = () => this.dt?.filter(this.filtroTipo, 'tipo', 'equals');
  filtrarArea = () => this.dt?.filter(this.filtroArea, 'area', 'equals');

  /** Mensaje de la tabla vacía según lo que se está viendo. */
  get mensajeVacio() : { icono : string, texto : string } {
    if (this.busqueda || this.filtroTipo || this.filtroArea) return { icono: 'pi pi-search', texto: 'Ningún ticket coincide con la búsqueda.' };
    if (this.filtroChip === 'abiertos') return { icono: 'pi pi-check-circle', texto: '¡No hay tickets abiertos!' };
    if (this.filtroChip === 'enRevision') return { icono: 'pi pi-check-circle', texto: 'No hay tickets en revisión.' };
    if (this.filtroChip === 'resueltosMes') return { icono: 'pi pi-inbox', texto: 'Aún no se ha resuelto ningún ticket este mes.' };
    if (this.vista === 'pendientes') return { icono: 'pi pi-check-circle', texto: '¡No hay tickets pendientes! Todo está al día.' };
    return { icono: 'pi pi-inbox', texto: 'No hay tickets finalizados creados en el rango de fechas.' };
  }

  /** Texto de la antigüedad: "Hoy", "1 día", "5 días". */
  textoDias = (dias : number) : string => dias <= 0 ? 'Hoy' : dias === 1 ? '1 día' : `${dias} días`;

  /** "hace 2 horas", "hace 3 días" (moment está en español desde AppComponent). */
  haceCuanto = (fecha : Date) : string => moment(fecha).fromNow();

  // ---------------------------------------------------------------- detalle

  /** Tickets en el orden y con los filtros con que se ven en la tabla, para moverse entre ellos desde el detalle. */
  private get listaVisible() : TicketGestion[] {
    return (this.dt?.filteredValue as TicketGestion[] | undefined) ?? this.dt?.value as TicketGestion[] ?? this.ticketsTabla;
  }

  get posicionDetalle() : number { return this.listaVisible.findIndex(t => t.codigo === this.codigoDetalle); }
  get totalDetalle() : number { return this.listaVisible.length; }

  /** Abre el ticket anterior (-1) o siguiente (+1) de la tabla sin cerrar el popup. */
  moverDetalle(paso : number) {
    const lista = this.listaVisible;
    const destino = lista[this.posicionDetalle + paso];
    if (destino) this.codigoDetalle = destino.codigo;
  }

  abrirDetalle(ticket : TicketListado) {
    this.codigoDetalle = ticket.codigo;
    this.detalleVisible = true;
  }

  cerrarDetalle = () => this.codigoDetalle = null;

  claseEstado = (estadoId : number) => claseEstadoTicket(estadoId);
}
