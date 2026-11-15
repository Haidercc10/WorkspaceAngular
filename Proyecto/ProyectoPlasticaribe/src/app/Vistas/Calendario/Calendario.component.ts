import { AfterViewInit, Component, DestroyRef, ElementRef, NgZone, OnInit, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions, DateSelectArg, EventClickArg, EventInput, EventSourceFuncArg } from '@fullcalendar/core';
import esLocale from '@fullcalendar/core/locales/es';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import moment from 'moment';
import { ConfirmationService } from 'primeng/api';
import {
  EventoCalendario, EventoCalendarioGuardar, EventosCalendarioService, RolCalendario, TipoVisibilidad, claseVisibilidad, nombreVisibilidad
} from 'src/app/Servicios/EventosCalendario/EventosCalendario.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { AppComponent } from 'src/app/app.component';

const ROL_ADMINISTRADOR = 1;
const DIAS_PROXIMOS = 30;
export const MAX_CARACTERES_NOMBRE_EVENTO = 200;
export const MAX_CARACTERES_DESCRIPCION_EVENTO = 1000;

type ModoEvento = 'crear' | 'editar' | 'ver';

/** La fecha final no puede ser anterior a la inicial (en eventos de todo el día se comparan solo los días). */
function finDespuesDeInicio(grupo: AbstractControl): ValidationErrors | null {
  const { inicio, fin, todoElDia } = grupo.value;
  if (!inicio || !fin) return null;
  const unidad = todoElDia ? 'day' : 'minute';
  return moment(fin).isBefore(moment(inicio), unidad) ? { finAntesDeInicio: true } : null;
}

/** Con "Roles específicos" hay que elegir al menos un rol. */
function rolesRequeridos(grupo: AbstractControl): ValidationErrors | null {
  const { visibilidad, roles } = grupo.value;
  return visibilidad == 'roles' && (!roles || roles.length == 0) ? { sinRoles: true } : null;
}

/**
 * Calendario de eventos (modal de la barra superior).
 * Los eventos se consultan por el rango visible cada vez que se cambia de mes, semana o día;
 * solo el creador o un administrador puede editarlos o eliminarlos (la API lo valida).
 */
@Component({
  selector: 'app-Calendario',
  templateUrl: './Calendario.component.html',
  styleUrls: ['./Calendario.component.css']
})
export class CalendarioComponent implements OnInit, AfterViewInit {

  @ViewChild(FullCalendarComponent) calendario?: FullCalendarComponent;
  @ViewChild('contenedorCalendario') contenedorCalendario?: ElementRef<HTMLElement>;
  private readonly destroyRef = inject(DestroyRef);
  private readonly zone = inject(NgZone);
  readonly maxNombre = MAX_CARACTERES_NOMBRE_EVENTO;
  readonly maxDescripcion = MAX_CARACTERES_DESCRIPCION_EVENTO;
  readonly diasProximos = DIAS_PROXIMOS;

  miRol: number = 0;
  esAdministrador: boolean = false;
  cargando: boolean = false;
  guardando: boolean = false;

  proximos: EventoCalendario[] = [];
  cargandoProximos: boolean = false;
  roles: RolCalendario[] = [];
  opcionesVisibilidad: { label: string, value: TipoVisibilidad, icon: string }[] = [];

  modalEvento: boolean = false;
  modo: ModoEvento = 'crear';
  eventoActual: EventoCalendario | null = null;

  readonly form = inject(FormBuilder).group({
    nombre: ['', [Validators.required, Validators.maxLength(MAX_CARACTERES_NOMBRE_EVENTO)]],
    descripcion: ['', [Validators.maxLength(MAX_CARACTERES_DESCRIPCION_EVENTO)]],
    todoElDia: [true],
    inicio: [null as Date | null, Validators.required],
    fin: [null as Date | null, Validators.required],
    visibilidad: ['yo' as TipoVisibilidad, Validators.required],
    roles: [[] as number[]],
  }, { validators: [finDespuesDeInicio, rolesRequeridos] });

  options: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    locale: esLocale,
    initialView: 'dayGridMonth',
    headerToolbar: { start: 'prev,next today', center: 'title', end: 'dayGridMonth,timeGridWeek,timeGridDay' },
    height: 'auto',
    dayMaxEvents: 3,
    eventDisplay: 'block',
    nowIndicator: true,
    selectable: true,
    selectMirror: true,
    eventTimeFormat: { hour: 'numeric', minute: '2-digit', meridiem: 'short' },
    events: (info, exito, fallo) => this.cargarEventos(info, exito, fallo),
    loading: cargando => this.cargando = cargando,
    select: info => this.nuevoDesdeSeleccion(info),
    eventClick: info => this.abrirEvento(info),
  };

  constructor(
    private eventosService: EventosCalendarioService,
    private mensajes: MensajesAplicacionService,
    private confirmationService: ConfirmationService,
    private AppComponent: AppComponent) { }

  ngOnInit() {
    this.miRol = Number(this.AppComponent.storage_Rol);
    this.esAdministrador = this.miRol == ROL_ADMINISTRADOR;
    // Quien no es administrador solo puede compartir con su rol (la API también lo valida)
    this.opcionesVisibilidad = [
      { label: nombreVisibilidad.yo, value: 'yo', icon: 'pi pi-user' },
      { label: nombreVisibilidad.rol, value: 'rol', icon: 'pi pi-id-card' },
      ...(this.esAdministrador ? [
        { label: nombreVisibilidad.todos, value: 'todos' as TipoVisibilidad, icon: 'pi pi-users' },
        { label: nombreVisibilidad.roles, value: 'roles' as TipoVisibilidad, icon: 'pi pi-list' },
      ] : []),
    ];
    if (this.esAdministrador) this.eventosService.roles$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(r => this.roles = r);
    this.cargarProximos();
  }

  /**
   * FullCalendar mide su contenedor con getBoundingClientRect(), que incluye las transformaciones CSS.
   * El p-dialog se abre con una animación que parte de scale(0.7): si el calendario se mide en ese momento
   * queda al 70 % del ancho. La animación no cambia el tamaño de diseño (offsetWidth), por eso un
   * ResizeObserver no basta: se espera, cuadro a cuadro, a que el ancho visible coincida con el de diseño
   * (animación terminada) y solo entonces se reajusta. También se reajusta cuando el contenedor cambia
   * de tamaño (ventana, panel lateral que pasa abajo en pantallas angostas).
   */
  ngAfterViewInit() {
    const contenedor = this.contenedorCalendario?.nativeElement;
    if (!contenedor) return;

    let cuadro = 0;
    const ajustarCuandoNoEsteEscalado = (intentos: number = 0) => {
      cancelAnimationFrame(cuadro);
      cuadro = requestAnimationFrame(() => {
        const escalado = Math.abs(contenedor.getBoundingClientRect().width - contenedor.offsetWidth) > 1;
        if (escalado && intentos < 120) ajustarCuandoNoEsteEscalado(intentos + 1); // máximo ~2 s esperando
        else this.calendario?.getApi().updateSize();
      });
    };

    // Fuera de Angular: no dispara detección de cambios en cada cuadro de la animación
    this.zone.runOutsideAngular(() => {
      ajustarCuandoNoEsteEscalado();
      const observador = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => ajustarCuandoNoEsteEscalado()) : null;
      observador?.observe(contenedor);
      this.destroyRef.onDestroy(() => {
        cancelAnimationFrame(cuadro);
        observador?.disconnect();
      });
    });
  }

  /** Fuente de eventos de FullCalendar: se llama con el rango visible cada vez que se navega. */
  private cargarEventos(info: EventSourceFuncArg, exito: (eventos: EventInput[]) => void, fallo: (error: Error) => void) {
    const finInclusivo = moment(info.end).subtract(1, 'day').toDate(); // FullCalendar da el fin exclusivo
    this.eventosService.getRango(info.start, finInclusivo, this.miRol).subscribe({
      next: eventos => exito(eventos.map(e => this.aEventoCalendario(e))),
      error: () => {
        this.mensajes.mensajeError('¡Ocurrió un error!', '¡No se pudieron consultar los eventos!');
        fallo(new Error('Error al consultar eventos'));
      },
    });
  }

  private aEventoCalendario(e: EventoCalendario): EventInput {
    return {
      id: String(e.id),
      title: e.nombre,
      start: e.todoElDia ? moment(e.inicio).format('YYYY-MM-DD') : e.inicio,
      // En eventos de todo el día FullCalendar espera el fin exclusivo (el día siguiente)
      end: e.todoElDia ? moment(e.fin).add(1, 'day').format('YYYY-MM-DD') : e.fin,
      allDay: e.todoElDia,
      classNames: [claseVisibilidad(e), ...(e.esPropio ? [] : ['evento-ajeno'])],
      extendedProps: { evento: e },
    };
  }

  cargarProximos() {
    this.cargandoProximos = true;
    const hoy = moment().startOf('day');
    this.eventosService.getRango(hoy.toDate(), hoy.clone().add(DIAS_PROXIMOS, 'days').toDate(), this.miRol).subscribe({
      next: eventos => {
        const ahora = new Date();
        this.proximos = eventos.filter(e => e.fin >= ahora).sort((a, b) => a.inicio.getTime() - b.inicio.getTime()).slice(0, 10);
        this.cargandoProximos = false;
      },
      error: () => this.cargandoProximos = false,
    });
  }

  private refrescar() {
    this.calendario?.getApi().refetchEvents();
    this.cargarProximos();
  }

  // ---------------------------------------------------------------- Abrir el formulario

  /** Botón "+ Nuevo": hoy, todo el día. */
  nuevo() {
    const hoy = moment().startOf('day').toDate();
    this.abrirFormulario('crear', null, { inicio: hoy, fin: hoy, todoElDia: true });
  }

  /** Clic en un día o arrastre sobre varios días / horas. */
  private nuevoDesdeSeleccion(info: DateSelectArg) {
    this.calendario?.getApi().unselect();
    const fin = info.allDay ? moment(info.end).subtract(1, 'day').toDate() : info.end; // fin exclusivo → inclusivo
    this.abrirFormulario('crear', null, { inicio: info.start, fin, todoElDia: info.allDay });
  }

  private abrirEvento(info: EventClickArg) {
    this.verEvento(info.event.extendedProps['evento'] as EventoCalendario);
  }

  /** Desde el calendario o el panel "Próximos eventos". */
  verEvento(evento: EventoCalendario) {
    this.abrirFormulario(evento.puedeEditar ? 'editar' : 'ver', evento, {
      inicio: evento.inicio, fin: evento.fin, todoElDia: evento.todoElDia,
    });
  }

  private abrirFormulario(modo: ModoEvento, evento: EventoCalendario | null, fechas: { inicio: Date, fin: Date, todoElDia: boolean }) {
    this.modo = modo;
    this.eventoActual = evento;
    let visibilidad: TipoVisibilidad = evento?.tipoVisibilidad ?? 'yo';
    // Quien no es administrador no tiene "Todos" ni "Roles específicos"
    if (!this.esAdministrador && (visibilidad == 'todos' || visibilidad == 'roles')) visibilidad = 'rol';
    this.form.reset({
      nombre: evento?.nombre ?? '',
      descripcion: evento?.descripcion ?? '',
      todoElDia: fechas.todoElDia,
      inicio: fechas.inicio,
      fin: fechas.todoElDia ? moment(fechas.fin).startOf('day').toDate() : fechas.fin,
      visibilidad,
      roles: evento?.tipoVisibilidad == 'roles' ? evento.roles : [],
    });
    modo == 'ver' ? this.form.disable() : this.form.enable();
    this.modalEvento = true;
  }

  /** Al pasar a "con hora" se propone 8:00 – 9:00 si las horas estaban en 0. */
  alCambiarTodoElDia() {
    const { todoElDia, inicio, fin } = this.form.value;
    if (todoElDia || !inicio || !fin) return;
    if (moment(inicio).format('HH:mm') == '00:00') {
      const nuevoInicio = moment(inicio).hour(8).minute(0).toDate();
      const nuevoFin = moment(fin).isSame(inicio, 'day') ? moment(nuevoInicio).add(1, 'hour').toDate() : moment(fin).hour(9).minute(0).toDate();
      this.form.patchValue({ inicio: nuevoInicio, fin: nuevoFin });
    }
  }

  /** Si la fecha inicial pasa a ser posterior a la final, la final se mueve con ella. */
  alCambiarInicio() {
    const { inicio, fin, todoElDia } = this.form.value;
    if (inicio && fin && moment(fin).isBefore(inicio, todoElDia ? 'day' : 'minute'))
      this.form.patchValue({ fin: todoElDia ? inicio : moment(inicio).add(1, 'hour').toDate() });
  }

  get titulo(): string {
    return this.modo == 'crear' ? 'Nuevo evento' : this.modo == 'editar' ? 'Editar evento' : 'Detalle del evento';
  }

  get nombreVisibilidadActual(): string {
    return this.eventoActual ? nombreVisibilidad[this.eventoActual.tipoVisibilidad] : '';
  }

  get nombresRolesActuales(): string {
    if (!this.eventoActual || this.eventoActual.tipoVisibilidad != 'roles') return '';
    return this.eventoActual.roles.map(id => this.roles.find(r => r.id == id)?.nombre ?? `Rol ${id}`).join(', ');
  }

  // ---------------------------------------------------------------- Guardar / eliminar

  guardar() {
    if (this.form.invalid || this.guardando || this.modo == 'ver') {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const datos: EventoCalendarioGuardar = {
      nombre: v.nombre ?? '',
      descripcion: v.descripcion ?? '',
      inicio: v.inicio!,
      fin: v.fin!,
      todoElDia: !!v.todoElDia,
      tipoVisibilidad: v.visibilidad!,
      roles: v.roles ?? [],
    };
    const peticion = this.modo == 'editar' && this.eventoActual
      ? this.eventosService.editar(this.eventoActual.id, datos, this.miRol)
      : this.eventosService.crear(datos, this.miRol);

    this.guardando = true;
    peticion.subscribe({
      next: () => {
        this.guardando = false;
        this.modalEvento = false;
        this.mensajes.mensajeConfirmacion('OK!', this.modo == 'editar' ? '¡Evento actualizado!' : '¡Evento creado!');
        this.refrescar();
      },
      error: err => {
        this.guardando = false;
        this.mensajes.mensajeError('¡No se pudo guardar el evento!', typeof err?.error === 'string' ? err.error : 'Intente nuevamente.');
      },
    });
  }

  confirmarEliminacion() {
    const evento = this.eventoActual;
    if (!evento) return;
    this.confirmationService.confirm({
      key: 'eliminarEvento',
      header: 'Eliminar evento',
      message: `¿Seguro que desea eliminar el evento "${evento.nombre}"? Esta acción no se puede deshacer.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => this.eliminar(evento),
    });
  }

  private eliminar(evento: EventoCalendario) {
    this.guardando = true;
    this.eventosService.eliminar(evento.id).subscribe({
      next: () => {
        this.guardando = false;
        this.modalEvento = false;
        this.mensajes.mensajeConfirmacion('OK!', '¡Evento eliminado!');
        this.refrescar();
      },
      error: () => {
        this.guardando = false;
        this.mensajes.mensajeError('¡No se pudo eliminar el evento!', 'Es posible que ya no exista o que no tenga permiso para eliminarlo.');
      },
    });
  }

  campoInvalido = (campo: string) => {
    const control = this.form.get(campo);
    return !!control && control.invalid && (control.touched || control.dirty);
  };
}
