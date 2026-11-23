import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';
import { ConfirmationService } from 'primeng/api';
import { OverlayPanel } from 'primeng/overlaypanel';
import { catchError, finalize, forkJoin, map, Observable, of, Subject, Subscription, switchMap, takeUntil, throwError } from 'rxjs';
import { AsignacionMPService } from 'src/app/Servicios/Asignacion_MateriaPrima/asignacionMP.service';
import { AppComponent } from 'src/app/app.component';
import {
  ADICIONAL_KG_OT,
  AutorizacionExcesoPendiente,
  DetalleSolicitudMaterial,
  EstadoSolicitudMaterial,
  FiltrosConsultaSolicitudes,
  ROLES_EXCEDER_LIMITE_OT,
  ROLES_GESTIONAR_SOLICITUD,
  ROLES_GESTIONAR_SOLICITUD_OT,
  ROLES_VERIFICAR_SOLICITUD,
  ROLES_VER_PDF_SOLICITUD,
  ResumenSolicitudOT,
  SolicitudConsultada,
  solicitudActiva,
  formatoNumero,
  RETRASO_TOOLTIP_AYUDA_MS,
} from 'src/app/Modelo/modelFlujoMaterialProduccion';
import { AutorizacionesExcesoOTService } from 'src/app/Servicios/AutorizacionesExcesoOT/autorizacionesExcesoOT.service';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { CreacionPdfService, DatosOTSolicitudPDF } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { SolicitudMP_ExtrusionService } from 'src/app/Servicios/SolicitudMP_Extrusion/SolicitudMP_Extrusion.service';
import { alCambiarTema } from 'src/app/Servicios/Tema/Tema.service';
import { TutorialesService } from 'src/app/Servicios/Tutoriales/Tutoriales.service';
import { ClaveTutorialMovimientosSolicitud, pasosTutorialMovimientosSolicitud } from 'src/app/Tutoriales/Tutoriales_MovimientosSolicitudMaterial';


/** Estados de la solicitud que se muestran como chips y en el filtro, en el orden del flujo. */
const ESTADOS_SOLICITUD = [
  { id: EstadoSolicitudMaterial.Pendiente, nombre: 'Pendientes', clase: 'pendiente', icono: 'pi pi-hourglass' },
  { id: EstadoSolicitudMaterial.Parcial, nombre: 'Parciales', clase: 'parcial', icono: 'pi pi-sliders-h' },
  { id: EstadoSolicitudMaterial.Completada, nombre: 'Completadas', clase: 'completada', icono: 'pi pi-check-circle' },
  { id: EstadoSolicitudMaterial.Finalizada, nombre: 'Finalizadas', clase: 'finalizada', icono: 'pi pi-lock' },
  { id: EstadoSolicitudMaterial.Verificada, nombre: 'Verificadas', clase: 'verificada', icono: 'pi pi-verified' },
  { id: EstadoSolicitudMaterial.Cancelada, nombre: 'Canceladas', clase: 'cancelada', icono: 'pi pi-ban' },
];

/** Estados con los que abre el reporte: las solicitudes que quien asigna debe atender. */
const ESTADOS_ACTIVOS = [EstadoSolicitudMaterial.Pendiente, EstadoSolicitudMaterial.Parcial];

/** Datos de la OT (BagPro) que se muestran en el resumen de la solicitud. */
interface DatosOTResumen {
  cliente: string;
  item: string;
  referencia: string;
  kgOT: number;
}

@Component({
  selector: 'app-Reporte_SolicitudMpExtrusion',
  templateUrl: './Reporte_SolicitudMpExtrusion.component.html',
  styleUrls: ['./Reporte_SolicitudMpExtrusion.component.css']
})
export class Reporte_SolicitudMpExtrusionComponent implements OnInit, OnDestroy {
  /** Retraso de los tooltips de información o ayuda (los de botones de acción inmediata salen sin retraso). */
  readonly retrasoAyuda = RETRASO_TOOLTIP_AYUDA_MS;
  modoSeleccionado : boolean;
  private readonly suscripcionTema = alCambiarTema(oscuro => this.modoSeleccionado = oscuro); // mantiene modoSeleccionado al día con el tema
  ValidarRol : number;
  readonly estadosSolicitud = ESTADOS_SOLICITUD;
  readonly estadoCompletada = EstadoSolicitudMaterial.Completada;
  readonly estadoCancelada = EstadoSolicitudMaterial.Cancelada;
  formFiltros !: FormGroup;

  /** Cantidad de solicitudes por estado (panel "Resumen de solicitudes"). */
  conteo : { [estado: number]: number } = {};
  /** Texto que explica qué se está mostrando en la tabla. */
  descripcionConsulta : string = '';

  solicitudes : SolicitudConsultada[] = [];
  solicitudSeleccionada : SolicitudConsultada | null = null;

  /** Detalle completo de la solicitud seleccionada. */
  detalle : DetalleSolicitudMaterial | null = null;
  datosOT : DatosOTResumen | null = null;
  cargandoDetalle : boolean = false;

  /** Solicitud de la OT consultada en el filtro (panel de la OT); null si no se filtra por OT o aún no tiene solicitudes. */
  solicitudOT : ResumenSolicitudOT | null = null;
  /** OT del panel (la del filtro), aunque aún no tenga solicitudes. */
  otPanel : number | null = null;
  datosOTPanel : DatosOTResumen | null = null;
  cargandoOT : boolean = false;
  /** El PDF de las solicitudes de la OT se está generando. */
  generandoPdfOT = false;
  private consultaOT? : Subscription;

  /** Popup de cancelación con el motivo (obligatorio). */
  dialogoCancelar = false;
  motivoCancelacion = '';
  solicitudPorCancelar : { id : number; ot : number; conEntregas : boolean } | null = null;

  modalAsignacion : boolean = false;
  /** El PDF de las asignaciones de la solicitud se está generando. */
  generandoPdfAsignaciones = false;
  /** Se creó al menos una asignación desde el popup (sigue abierto): al cerrarlo se refrescan la lista y el detalle. */
  private huboAsignacion = false;

  // Autorizaciones de exceso de la OT (antes solo en la página de asignación).
  dialogoAutorizaciones : boolean = false;
  autorizacionesPendientes : (AutorizacionExcesoPendiente & { motivoRechazo?: string })[] = [];

  /** Operaciones que muestran el cargando; el overlay se quita cuando terminan todas. */
  private cargasActivas : number = 0;
  /** Últimos filtros consultados; se repiten al refrescar después de una acción. */
  private ultimosFiltros : FiltrosConsultaSolicitudes = { estados: ESTADOS_ACTIVOS };
  /** Solicitud que se selecciona al terminar la primera consulta (llega en la URL). */
  private idPorSeleccionar : number | null = null;
  private consultaLista? : Subscription;
  private consultaDetalle? : Subscription;
  private destroy$ = new Subject<void>();

  constructor(private frmBuilder : FormBuilder,
    private confirmationService : ConfirmationService,
    private AppComponent : AppComponent,
    private servicioSolicitudes : SolicitudMP_ExtrusionService,
    private msj : MensajesAplicacionService,
    private servicioBagPro : BagproService,
    private servicioPDF : CreacionPdfService,
    private servicioAsignacion : AsignacionMPService,
    private servicioAutorizaciones : AutorizacionesExcesoOTService,
    private tutoriales : TutorialesService,
    private ruta : ActivatedRoute,
  ) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.formFiltros = this.frmBuilder.group({
      documento : [null],
      ot : [null],
      fechaDoc : [null],
      fechaFinalDoc : [null],
      estados : [[]],
    });
  }

  ngOnInit() {
    this.ValidarRol = Number(this.AppComponent.storage_Rol);
    this.cargarConteo();
    if (!this.aplicarFiltrosDeLaUrl()) this.consultar({ estados: ESTADOS_ACTIVOS }, 'Solicitudes activas (pendientes y parciales)');
  }

  /**
   * Filtros que llegan en la URL desde otra página (p. ej. el aviso "Ver en movimientos" de la solicitud):
   * - `solicitud=N`: consulta esa solicitud y la selecciona.
   * - `ot=N`: todas las solicitudes de esa OT (cualquier estado) con el panel de la OT; con `seleccionar=N` deja esa seleccionada.
   * - `fecha=YYYY-MM-DD` y `estado=E`: solicitudes creadas ese día en ese estado; con `seleccionar=N` deja esa seleccionada.
   * @returns true si había filtros en la URL (ya se consultó).
   */
  private aplicarFiltrosDeLaUrl() : boolean {
    const parametros = this.ruta.snapshot.queryParamMap;
    const solicitud = parametros.get('solicitud');
    const ot = parametros.get('ot');
    const fecha = parametros.get('fecha');
    const seleccionar = Number(parametros.get('seleccionar'));
    this.idPorSeleccionar = Number.isInteger(seleccionar) && seleccionar > 0 ? seleccionar : null;
    if (solicitud && /^\d+$/.test(solicitud)) {
      this.formFiltros.patchValue({ documento: solicitud });
      this.consultarFiltros();
      return true;
    }
    if (ot && /^\d+$/.test(ot)) {
      this.formFiltros.patchValue({ ot, estados: [] });
      this.consultarFiltros();
      return true;
    }
    if (!fecha || !moment(fecha, 'YYYY-MM-DD', true).isValid()) {
      this.idPorSeleccionar = null;
      return false;
    }

    const estado = Number(parametros.get('estado'));
    const dia = moment(fecha, 'YYYY-MM-DD').toDate();
    this.formFiltros.patchValue({ fechaDoc: dia, fechaFinalDoc: dia, estados: ESTADOS_SOLICITUD.some(e => e.id === estado) ? [estado] : [] });
    this.consultarFiltros();
    return true;
  }

  ngOnDestroy() {
    this.tutoriales.cancelar();
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ───────────────────────── Tutorial ─────────────────────────

  /** Muestra el tutorial (botón "i" del título). La primera vez se muestra solo, al terminar la primera consulta. */
  tutorial = () => this.tutoriales.iniciar(this.pasosTutorial());

  private pasosTutorial() {
    return pasosTutorialMovimientosSolicitud({
      puedeGestionar: this.puedeGestionar,
      puedeGestionarOT: this.puedeGestionarOT,
      puedeVerificar: this.puedeVerificar,
      puedeVerPdf: this.puedeVerPdf,
      puedeAutorizarExceso: this.puedeAutorizarExceso,
      seleccionarPrimera: () => { if (!this.detalle && this.solicitudes.length > 0) this.seleccionar(this.solicitudes[0]); },
    });
  }

  // ───────────────────────── Permisos y estado de la vista ─────────────────────────

  get cargando() : boolean {
    return this.cargasActivas > 0;
  }

  /** Muestra el cargando mientras el observable está activo. */
  private conCarga<T>() {
    return (fuente : Observable<T>) => {
      this.cargasActivas++;
      return fuente.pipe(finalize(() => this.cargasActivas--));
    };
  }

  /** Asigna material y cancela solicitudes. */
  get puedeGestionar() : boolean {
    return ROLES_GESTIONAR_SOLICITUD.includes(this.ValidarRol);
  }

  /** Completa y finaliza la solicitud de la OT: administrador, asignador y solicitante. */
  get puedeGestionarOT() : boolean {
    return ROLES_GESTIONAR_SOLICITUD_OT.includes(this.ValidarRol);
  }

  /** Verifica la solicitud de la OT finalizada: administrador y solicitante. */
  get puedeVerificar() : boolean {
    return ROLES_VERIFICAR_SOLICITUD.includes(this.ValidarRol);
  }

  get puedeVerPdf() : boolean {
    return ROLES_VER_PDF_SOLICITUD.includes(this.ValidarRol);
  }

  /** Aprueba o rechaza autorizaciones para superar el límite de kg de una OT. */
  get puedeAutorizarExceso() : boolean {
    return ROLES_EXCEDER_LIMITE_OT.includes(this.ValidarRol);
  }

  /** La solicitud seleccionada está pendiente o parcial: se puede asignar o cancelar. */
  get solicitudActiva() : boolean {
    return this.detalle != null && solicitudActiva(this.detalle.estado_Id);
  }

  /** "Ver asignaciones PDF": en las solicitudes que ya tienen asignaciones. */
  get puedeVerAsignacionesPdf() : boolean {
    return (this.detalle?.asignaciones?.length ?? 0) > 0;
  }

  /** Estado de la solicitud de la OT de la solicitud seleccionada (viene en la fila de la lista). */
  get estadoOTSeleccionada() : { id : number; nombre : string } | null {
    const s = this.solicitudSeleccionada;
    return s?.estadoOT_Id != null && s.id === this.detalle?.id ? { id: s.estadoOT_Id, nombre: s.estadoOT ?? '' } : null;
  }

  /** Avance (%) de lo asignado sobre el tope de la OT, para la barra del panel. */
  get avanceOT() : { asignado : number; umbral : number } {
    const r = this.solicitudOT;
    if (!r?.topeKgOT) return { asignado: 0, umbral: 0 };
    const base = Math.max(r.topeKgOT, r.kgAsignados) || 1;
    return { asignado: Math.min(r.kgAsignados / base * 100, 100), umbral: (r.kgOT ?? 0) / base * 100 };
  }

  /**
   * Por qué no se puede finalizar la OT completada (solicitudes que siguen activas), para mostrarlo junto al botón.
   * Null si no aplica.
   */
  get motivoNoFinaliza() : string | null {
    const r = this.solicitudOT;
    if (!r || r.estado_Id !== EstadoSolicitudMaterial.Completada || r.puedeFinalizar) return null;
    const activas = r.solicitudes.filter(s => solicitudActiva(s.estado_Id)).reduce((t, s) => t + s.cantidad, 0);
    return activas > 0
      ? `Hay ${activas} solicitud(es) pendiente(s) o parcial(es) en la OT; deben completarse o cancelarse para finalizarla.`
      : null;
  }

  /**
   * Genera en un solo PDF todas las asignaciones de la solicitud (una hoja por asignación y por tipo de material)
   * y lo abre en una pestaña nueva después del aviso "PDF generado".
   */
  verAsignacionesPdf() {
    const solicitud = this.detalle;
    if (!solicitud || this.generandoPdfAsignaciones || !solicitud.asignaciones?.length) return;
    // De la más antigua a la más reciente; cada asignación es una hoja con sus materias primas y tintas.
    const consultas = [...solicitud.asignaciones]
      .filter(a => a.conMateriasPrimas || a.conTintas)
      .sort((a, b) => a.id - b.id)
      .map(a => this.servicioAsignacion.obtenerDatosPdf(a.id));
    if (consultas.length === 0) return this.msj.mensajeAdvertencia('Advertencia', 'Las asignaciones de esta solicitud no tienen materiales para imprimir.');

    this.generandoPdfAsignaciones = true;
    forkJoin(consultas).pipe(
      switchMap(lotes => this.servicioPDF.generarBlobAsignacionesSolicitud(lotes, solicitud.id, solicitud.ot)),
      finalize(() => this.generandoPdfAsignaciones = false),
      takeUntil(this.destroy$),
    ).subscribe({
      next: pdf => this.abrirPdfConAviso(pdf, `Asignaciones solicitud ${solicitud.id}.pdf`,
        `El PDF con ${solicitud.asignaciones!.length} asignación(es) de la solicitud N° ${solicitud.id} se generó correctamente.`),
      error: error => this.notificarError(error, `No fue posible generar el PDF de las asignaciones de la solicitud N° ${solicitud.id}.`, 'Generar PDF de asignaciones'),
    });
  }

  /** Aviso "PDF generado" y, pasado un momento, lo abre en una pestaña nueva (si el navegador la bloquea, lo descarga). */
  private abrirPdfConAviso(pdf : Blob, archivo : string, mensaje : string) {
    this.msj.mensajeConfirmacion('¡PDF generado!', `${mensaje} A continuación se abrirá en una nueva pestaña.`, 2000);
    const url = URL.createObjectURL(pdf);
    setTimeout(() => {
      if (!window.open(url, '_blank')) {
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = archivo;
        enlace.click();
        this.msj.mensajeAdvertencia('Advertencia', `El navegador bloqueó la pestaña nueva, por eso el PDF se descargó (${archivo}). Puede permitir las ventanas emergentes para este sitio.`);
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    }, 1500);
  }

  /** Clase de color de un estado (chips y etiquetas). */
  claseEstado = (estado : number) : string => ESTADOS_SOLICITUD.find(e => e.id === estado)?.clase ?? 'pendiente';

  // ───────────────────────── Conteo y consulta ─────────────────────────

  /** Consulta cuántas solicitudes hay en cada estado (chips). */
  cargarConteo() {
    this.servicioSolicitudes.contarPorEstado().pipe(takeUntil(this.destroy$)).subscribe({
      next: datos => this.conteo = Object.fromEntries(datos.map(d => [d.estado_Id, d.cantidad])),
      error: error => this.notificarError(error, 'No se pudo consultar la cantidad de solicitudes por estado.', 'Contar solicitudes por estado'),
    });
  }

  /** Abre o cierra el panel "Resumen de solicitudes"; al abrirlo vuelve a contar para mostrar cifras al día. */
  abrirResumenEstados(evento : Event, panel : OverlayPanel) {
    if (!panel.overlayVisible) this.cargarConteo();
    panel.toggle(evento);
  }

  /** Total de solicitudes de todos los estados del resumen. */
  get totalConteo() : number {
    return ESTADOS_SOLICITUD.reduce((total, e) => total + (this.conteo[e.id] ?? 0), 0);
  }


  /**
   * Consulta con los filtros del formulario. Por N° de solicitud no se aplican las demás condiciones.
   * Sin ningún filtro se muestran las solicitudes activas, sin límite de fechas.
   */
  consultarFiltros() {
    const form = this.formFiltros.value;
    const texto = (form.documento ?? '').toString().trim();
    const textoOT = (form.ot ?? '').toString().trim();
    if (texto && !/^\d+$/.test(texto)) return this.msj.mensajeAdvertencia('Advertencia', 'El N° de solicitud debe ser un número.');
    if (textoOT && !/^\d+$/.test(textoOT)) return this.msj.mensajeAdvertencia('Advertencia', 'La OT debe ser un número.');
    if (form.fechaDoc && form.fechaFinalDoc && moment(form.fechaFinalDoc).isBefore(form.fechaDoc, 'day'))
      return this.msj.mensajeAdvertencia('Advertencia', 'La fecha final no puede ser anterior a la inicial.');

    if (texto) return this.consultar({ id: Number(texto) }, `Solicitud N° ${texto}`);

    const filtros : FiltrosConsultaSolicitudes = {
      desde: form.fechaDoc ? moment(form.fechaDoc).format('YYYY-MM-DD') : undefined,
      hasta: form.fechaFinalDoc ? moment(form.fechaFinalDoc).format('YYYY-MM-DD') : undefined,
      ot: textoOT ? Number(textoOT) : undefined,
      estados: form.estados?.length ? form.estados : undefined,
    };
    const sinFiltros = !filtros.desde && !filtros.hasta && filtros.ot == null && !filtros.estados;
    if (sinFiltros) return this.consultar({ estados: ESTADOS_ACTIVOS }, 'Solicitudes activas (pendientes y parciales)');

    const partes : string[] = [];
    if (filtros.ot != null) partes.push(`OT ${filtros.ot}`);
    if (filtros.desde || filtros.hasta) partes.push(`creadas ${filtros.desde ? 'desde ' + filtros.desde : ''} ${filtros.hasta ? 'hasta ' + filtros.hasta : ''}`.trim());
    if (filtros.estados) partes.push(filtros.estados.map(e => ESTADOS_SOLICITUD.find(x => x.id === e)?.nombre.toLowerCase()).join(', '));
    this.consultar(filtros, `Solicitudes: ${partes.join(' · ')}`);
  }

  /** Indica si el estado está marcado en los filtros. */
  estadoFiltrado(estado : number) : boolean {
    return (this.formFiltros.value.estados ?? []).includes(estado);
  }

  /** Marca o quita un estado de los filtros (botones de selección múltiple). */
  alternarEstadoFiltro(estado : number) {
    const control = this.formFiltros.get('estados')!;
    const actuales : number[] = control.value ?? [];
    control.setValue(actuales.includes(estado) ? actuales.filter(e => e !== estado) : [...actuales, estado]);
  }

  /** Limpia los filtros y vuelve a las solicitudes activas. */
  limpiarCampos() {
    this.formFiltros.reset({ estados: [] });
    this.consultar({ estados: ESTADOS_ACTIVOS }, 'Solicitudes activas (pendientes y parciales)');
  }

  /**
   * Consulta la lista. Si la solicitud seleccionada sigue en el resultado, se conserva y se recarga su detalle.
   * @param filtros Filtros de la consulta.
   * @param descripcion Texto que explica qué se muestra.
   * @param conservarSeleccion Mantener la solicitud seleccionada (al refrescar después de una acción).
   */
  private consultar(filtros : FiltrosConsultaSolicitudes, descripcion : string, conservarSeleccion : boolean = false) {
    this.ultimosFiltros = filtros;
    this.descripcionConsulta = descripcion;
    const seleccionada = conservarSeleccion ? this.solicitudSeleccionada?.id : null;
    if (!conservarSeleccion) this.quitarSeleccion();
    // Al filtrar por OT se muestra el panel de su solicitud de OT (por N° de solicitud no aplica el filtro de OT).
    this.cargarPanelOT(filtros.id == null ? filtros.ot ?? null : null);

    this.consultaLista?.unsubscribe();
    this.consultaLista = this.servicioSolicitudes.consultarSolicitudes(filtros)
      .pipe(this.conCarga(), takeUntil(this.destroy$))
      .subscribe({
        next: datos => {
          this.solicitudes = datos;
          this.tutoriales.iniciarPrimeraVez(ClaveTutorialMovimientosSolicitud, this.AppComponent.storage_Id, () => this.pasosTutorial());
          if (seleccionada != null) this.solicitudSeleccionada = datos.find(s => s.id === seleccionada) ?? null;
          // Solicitud que se pidió seleccionar desde la URL (solo en la primera consulta).
          const porSeleccionar = this.idPorSeleccionar != null ? datos.find(s => s.id === this.idPorSeleccionar) : undefined;
          this.idPorSeleccionar = null;
          if (datos.length === 0) this.msj.mensajeAdvertencia('Advertencia', 'No se encontraron solicitudes con esos filtros.');
          else if (porSeleccionar) this.seleccionar(porSeleccionar);
          else if (filtros.id != null) this.seleccionar(datos[0]);
        },
        error: error => this.notificarError(error, 'No se pudieron consultar las solicitudes de materia prima.', 'Consultar solicitudes de materia prima'),
      });
  }

  /** Repite la última consulta y el conteo conservando la solicitud seleccionada, y recarga su detalle. */
  private refrescar() {
    this.cargarConteo();
    const id = this.solicitudSeleccionada?.id ?? this.detalle?.id;
    this.consultar(this.ultimosFiltros, this.descripcionConsulta, true);
    if (id != null) this.cargarDetalle(id);
  }

  /** Muestra todas las solicitudes de la OT de la solicitud seleccionada (cualquier estado) con el panel de la OT. */
  verSolicitudesDeLaOT() {
    const ot = this.detalle?.ot;
    if (ot == null) return;
    const id = this.detalle!.id;
    this.formFiltros.reset({ ot: String(ot), estados: [] });
    this.idPorSeleccionar = id;
    this.consultar({ ot }, `Solicitudes: OT ${ot}`);
  }

  // ───────────────────────── Solicitud de la OT ─────────────────────────

  /**
   * Carga el panel de la OT: sus datos en BagPro y su solicitud de OT. Si los kg guardados no coinciden con los de
   * BagPro (p. ej. OT anteriores a la regla por OT), se actualizan y se recalcula su estado.
   * @param ot OT del filtro; null quita el panel.
   */
  private cargarPanelOT(ot : number | null) {
    this.consultaOT?.unsubscribe();
    if (ot !== this.otPanel) {
      this.solicitudOT = null;
      this.datosOTPanel = null;
    }
    this.otPanel = ot;
    if (ot == null) return;

    this.cargandoOT = true;
    this.consultaOT = forkJoin({
      bagPro: this.servicioBagPro.srvObtenerListaClienteOT_Item(ot).pipe(map(datos => datos?.[0] ?? null), catchError(() => of(null))),
      resumen: this.servicioSolicitudes.obtenerResumenOT(ot).pipe(
        catchError((error : HttpErrorResponse) => error.status === 404 ? of(null) : throwError(() => error))),
    }).pipe(
      switchMap(({ bagPro, resumen }) => {
        const kgOT = Number(bagPro?.datosotKg) || 0;
        const sincronizar = resumen && kgOT > 0 && Math.abs((resumen.kgOT ?? 0) - kgOT) > 0.005;
        return (sincronizar ? this.servicioSolicitudes.registrarKgOT(ot, kgOT) : of(resumen)).pipe(map(r => ({ bagPro, resumen: r })));
      }),
      finalize(() => this.cargandoOT = false),
      takeUntil(this.destroy$),
    ).subscribe({
      next: ({ bagPro, resumen }) => {
        this.solicitudOT = resumen;
        this.datosOTPanel = bagPro
          ? { cliente: bagPro.clienteNom, item: bagPro.clienteItems, referencia: bagPro.clienteItemsNom, kgOT: Number(bagPro.datosotKg) || 0 }
          : null;
      },
      error: error => this.notificarError(error, `No se pudo consultar la solicitud de la OT ${ot}.`, 'Consultar solicitud de la OT'),
    });
  }

  /** Pide confirmar que se completa la OT a mano (no se puede deshacer). */
  pedirCompletarOT() {
    const r = this.solicitudOT;
    if (!r?.puedeCompletar) return;
    this.confirmar('Completar solicitud de la OT',
      `Lo asignado a la OT ${r.ot} (${this.numero(r.kgAsignados)} kg) ya llegó a sus kg (${this.numero(r.kgOT)} kg). `
      + `Al completarla no se podrán crear más solicitudes ni asignaciones de materia prima para esta OT y sus solicitudes activas de materia prima quedarán completadas. `
      + `Esta acción NO se puede deshacer. ¿Desea completarla?`,
      () => this.accionOT(this.servicioSolicitudes.completarOT(r.ot), 'completar', `¡La solicitud de la OT ${r.ot} quedó COMPLETADA!`),
      'Completar OT', 'Volver');
  }

  /** Pide confirmar que se finaliza la OT (se cierra la asignación de materiales). */
  pedirFinalizarOT() {
    const r = this.solicitudOT;
    if (!r?.puedeFinalizar) return;
    this.confirmar('Finalizar solicitud de la OT',
      `Se cerrará la asignación de materiales de la OT ${r.ot}: ya no admitirá solicitudes ni asignaciones. `
      + `Si la OT aún no tiene producción, quedará como ASIGNADA en el estado de procesos. ¿Desea finalizarla?`,
      () => this.accionOT(this.servicioSolicitudes.finalizarOT(r.ot), 'finalizar', `¡La solicitud de la OT ${r.ot} quedó FINALIZADA!`),
      'Finalizar OT', 'Volver');
  }

  /** Pide confirmar que se recibió físicamente el material de la OT. */
  pedirVerificarOT() {
    const r = this.solicitudOT;
    if (!r?.puedeVerificar) return;
    this.confirmar('Verificar solicitud de la OT',
      `¿Comprobó que recibió físicamente los materiales de la OT ${r.ot} con las cantidades pedidas? Se marcará como VERIFICADA.`,
      () => this.accionOT(this.servicioSolicitudes.verificarOT(r.ot), 'verificar', `¡La solicitud de la OT ${r.ot} quedó VERIFICADA!`),
      'Marcar como verificada', 'Volver');
  }

  /**
   * Ejecuta una acción sobre la solicitud de la OT, muestra el resumen actualizado y refresca la lista y el detalle.
   * @param operacion Llamada al API (responde el resumen actualizado).
   * @param accion Verbo de la acción, para el mensaje de error.
   * @param exito Mensaje de éxito.
   */
  private accionOT(operacion : Observable<ResumenSolicitudOT>, accion : string, exito : string) {
    const ot = this.solicitudOT?.ot;
    operacion.pipe(this.conCarga(), takeUntil(this.destroy$)).subscribe({
      next: resumen => {
        this.solicitudOT = resumen;
        this.msj.mensajeConfirmacion('Confirmación', exito);
        this.refrescar();
      },
      error: (error : HttpErrorResponse) => {
        this.notificarError(error, `No fue posible ${accion} la solicitud de la OT ${ot}.`, `${accion[0].toUpperCase()}${accion.slice(1)} solicitud de la OT`, 'PUT');
        if (error.status === 409) this.refrescar();
      },
    });
  }

  /**
   * Genera un solo PDF con las solicitudes de la OT del panel: una hoja de resumen y una hoja por solicitud
   * (sin las canceladas), de la más antigua a la más reciente.
   */
  verPdfOT() {
    const resumen = this.solicitudOT;
    if (!resumen || this.generandoPdfOT) return;
    const datos = this.datosOTPanel;
    const ot : DatosOTSolicitudPDF | null = datos
      ? { cliente: datos.cliente, item: datos.item, referencia: datos.referencia, kgOT: datos.kgOT, kgLimite: datos.kgOT * (1 + ADICIONAL_KG_OT) }
      : null;

    this.generandoPdfOT = true;
    this.servicioSolicitudes.consultarSolicitudes({ ot: resumen.ot }).pipe(
      map(lista => lista.filter(s => s.estado_Id !== EstadoSolicitudMaterial.Cancelada).sort((a, b) => a.id - b.id)),
      switchMap(lista => lista.length === 0
        ? of([] as DetalleSolicitudMaterial[])
        : forkJoin(lista.map(s => this.servicioSolicitudes.obtenerSolicitud(s.id)))),
      switchMap(detalles => detalles.length === 0
        ? of(null)
        : this.servicioPDF.generarBlobSolicitudesOT(resumen, detalles, ot).pipe(map(pdf => ({ pdf, cantidad: detalles.length })))),
      finalize(() => this.generandoPdfOT = false),
      takeUntil(this.destroy$),
    ).subscribe({
      next: resultado => resultado
        ? this.abrirPdfConAviso(resultado.pdf, `Solicitudes OT ${resumen.ot}.pdf`,
          `El PDF con el resumen y ${resultado.cantidad} solicitud(es) de la OT ${resumen.ot} se generó correctamente.`)
        : this.msj.mensajeAdvertencia('Advertencia', `La OT ${resumen.ot} no tiene solicitudes (sin contar las canceladas) para imprimir.`),
      error: error => this.notificarError(error, `No fue posible generar el PDF de las solicitudes de la OT ${resumen.ot}.`, 'Generar PDF de la OT'),
    });
  }

  /** Cantidad con dos decimales y separador de miles, para los mensajes. */
  private numero = (valor : number | null | undefined) : string => formatoNumero(valor);

  /** Total solicitado de la lista (pie de la tabla al consultar por OT), sin las solicitudes canceladas. */
  get totalSolicitadoLista() : number {
    return this.solicitudes
      .filter(s => s.estado_Id !== EstadoSolicitudMaterial.Cancelada)
      .reduce((total, s) => total + (Number(s.totalSolicitado) || 0), 0);
  }

  /** Texto de las máquinas de una solicitud, p. ej. "3, 5". */
  textoMaquinas = (s : SolicitudConsultada) : string =>
    s.maquinas.length === 0 ? String(s.maquinaPrincipal) : s.maquinas.map(m => m.maquina).join(', ');

  // ───────────────────────── Detalle ─────────────────────────

  /** Selecciona una solicitud de la lista y carga su detalle. */
  seleccionar(solicitud : SolicitudConsultada) {
    this.solicitudSeleccionada = solicitud;
    this.cargarDetalle(solicitud.id);
  }

  private quitarSeleccion() {
    this.consultaDetalle?.unsubscribe();
    this.solicitudSeleccionada = null;
    this.detalle = null;
    this.datosOT = null;
    this.cargandoDetalle = false;
  }

  /**
   * Carga el detalle de la solicitud y los datos de su OT en BagPro. Si se selecciona otra antes de que
   * responda, la consulta anterior se cancela para que sus datos no se mezclen.
   */
  private cargarDetalle(id : number) {
    this.consultaDetalle?.unsubscribe();
    this.cargandoDetalle = true;
    this.consultaDetalle = this.servicioSolicitudes.obtenerSolicitud(id).pipe(
      switchMap(detalle => this.servicioBagPro.srvObtenerListaClienteOT_Item(detalle.ot).pipe(
        map(datos => ({ detalle, ot: datos?.[0] ?? null })),
        catchError(() => of({ detalle, ot: null })),
      )),
      finalize(() => this.cargandoDetalle = false),
      takeUntil(this.destroy$),
    ).subscribe({
      next: ({ detalle, ot }) => {
        this.detalle = detalle;
        this.datosOT = ot ? { cliente: ot.clienteNom, item: ot.clienteItems, referencia: ot.clienteItemsNom, kgOT: Number(ot.datosotKg) || 0 } : null;
      },
      error: (error : HttpErrorResponse) => {
        this.detalle = null;
        this.notificarError(error, `No se pudo obtener la solicitud N° ${id}.`, 'Consultar detalle de la solicitud');
      },
    });
  }

  /** Total solicitado de la solicitud. */
  get totalSolicitado() : number {
    return (this.detalle?.subcategorias ?? []).reduce((t, s) => t + Number(s.solicitado), 0);
  }

  /** Unidad común de todas las subcategorías, o null si mezclan unidades (entonces no se suman). */
  get unidadComun() : string | null {
    const unidades = new Set((this.detalle?.subcategorias ?? []).map(s => s.undMed_Id));
    return unidades.size === 1 ? [...unidades][0] : null;
  }

  totalDe = (campo : 'solicitado' | 'entregado' | 'faltante') : number =>
    (this.detalle?.subcategorias ?? []).reduce((t, s) => t + Number(s[campo]), 0);

  // ───────────────────────── Acciones ─────────────────────────

  /**
   * Abre el popup para cancelar la solicitud seleccionada, donde se escribe el motivo (obligatorio). Las solicitudes
   * ya no se finalizan una por una: se completan solas al recibir todo y se finalizan con su OT (panel de la OT).
   */
  pedirCancelacion() {
    const solicitud = this.detalle;
    if (!solicitud || !this.solicitudActiva) return;
    this.solicitudPorCancelar = { id: solicitud.id, ot: solicitud.ot, conEntregas: solicitud.estado_Id === EstadoSolicitudMaterial.Parcial };
    this.motivoCancelacion = '';
    this.dialogoCancelar = true;
  }

  /** Botón "Cancelar solicitud" del popup: cancela con el motivo; el API guarda la fecha y el usuario. */
  confirmarCancelacion() {
    const solicitud = this.solicitudPorCancelar;
    const motivo = this.motivoCancelacion.trim();
    if (!solicitud || this.cargando) return;
    if (!motivo) return this.msj.mensajeAdvertencia('Advertencia', 'Debe escribir el motivo de la cancelación.');

    this.servicioSolicitudes.cancelarSolicitud(solicitud.id, motivo)
      .pipe(this.conCarga(), takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.dialogoCancelar = false;
          this.msj.mensajeConfirmacion('Confirmación', `¡La solicitud N° ${solicitud.id} quedó CANCELADA!`);
          this.refrescar();
        },
        error: (error : HttpErrorResponse) => {
          this.notificarError(error, `No fue posible cancelar la solicitud N° ${solicitud.id}.`, 'Cancelar solicitud', 'PUT');
          if (error.status === 409) {
            this.dialogoCancelar = false;
            this.refrescar();
          }
        },
      });
  }

  /**
   * Genera el PDF de la solicitud seleccionada con los datos de la OT ya consultados. Si la OT no se encontró
   * en BagPro, el PDF se genera igual indicándolo.
   */
  verPdf() {
    const solicitud = this.detalle;
    if (!solicitud) return;
    const ot : DatosOTSolicitudPDF | null = this.datosOT
      ? { cliente: this.datosOT.cliente, item: this.datosOT.item, referencia: this.datosOT.referencia, kgOT: this.datosOT.kgOT, kgLimite: this.datosOT.kgOT * (1 + ADICIONAL_KG_OT) }
      : null;
    this.servicioSolicitudes.obtenerSolicitud(solicitud.id)
      .pipe(this.conCarga(), takeUntil(this.destroy$))
      .subscribe({
        next: (detalle : DetalleSolicitudMaterial) => {
          if ((detalle.subcategorias ?? []).length === 0) return this.msj.mensajeAdvertencia('Advertencia', `No se encontraron subcategorías para la solicitud N° ${solicitud.id}.`);
          this.servicioPDF.solicitudMaterialProduccionPDF(detalle, ot);
          this.msj.mensajeConfirmacion('Confirmación', `Generando el PDF de la solicitud N° ${solicitud.id}; se abrirá en una nueva pestaña.`);
        },
        error: error => this.notificarError(error, `No se pudo obtener la información de la solicitud N° ${solicitud.id} para generar el PDF.`, 'Generar PDF de la solicitud'),
      });
  }

  /** Abre el popup de asignación; el componente se crea con la solicitud seleccionada. */
  cargarModalCrearAsignacion() {
    if (!this.detalle || !this.solicitudActiva) return;
    this.huboAsignacion = false;
    this.modalAsignacion = true;
  }

  /**
   * El popup creó una asignación y sigue abierto (para la siguiente máquina). No se refresca ahora: recargar el
   * detalle con el popup abierto podría recrear el componente de asignación; se hace al cerrarlo.
   */
  alRegistrarAsignacion() : void {
    this.huboAsignacion = true;
  }

  /** Al cerrarse el popup, si se asignó algo, refresca la lista, los conteos y el detalle. */
  alCerrarModalAsignacion() : void {
    if (!this.huboAsignacion) return;
    this.huboAsignacion = false;
    this.refrescar();
  }

  // ───────────────────────── Autorizaciones de exceso de la OT ─────────────────────────

  verAutorizacionesPendientes() {
    this.servicioAutorizaciones.getPendientes()
      .pipe(this.conCarga(), takeUntil(this.destroy$))
      .subscribe({
        next: datos => {
          this.autorizacionesPendientes = datos;
          this.dialogoAutorizaciones = true;
        },
        error: error => this.notificarError(error, 'No fue posible consultar las autorizaciones pendientes.', 'Consultar autorizaciones de exceso pendientes'),
      });
  }

  /**
   * Aprueba o rechaza una autorización pendiente.
   * @param autorizacion Autorización seleccionada.
   * @param aprobar True para aprobar; false para rechazar con el motivo digitado.
   */
  responderAutorizacion(autorizacion : AutorizacionExcesoPendiente & { motivoRechazo?: string }, aprobar : boolean) {
    const motivo = (autorizacion.motivoRechazo || '').trim();
    if (!aprobar && !motivo) return this.msj.mensajeAdvertencia('Advertencia', 'Debe indicar el motivo del rechazo.');

    const operacion = aprobar
      ? this.servicioAutorizaciones.aprobar(autorizacion.autEx_Id)
      : this.servicioAutorizaciones.rechazar(autorizacion.autEx_Id, motivo);
    operacion.pipe(this.conCarga(), takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.autorizacionesPendientes = this.autorizacionesPendientes.filter(a => a.autEx_Id !== autorizacion.autEx_Id);
        this.msj.mensajeConfirmacion('Confirmación', `Autorización de la OT ${autorizacion.autEx_OrdenTrabajo} ${aprobar ? 'aprobada' : 'rechazada'}.`);
      },
      error: error => this.notificarError(error, 'No fue posible responder la autorización.', 'Responder autorización de exceso', 'PUT'),
    });
  }

  // ───────────────────────── Confirmaciones y errores ─────────────────────────

  /**
   * Abre el diálogo de confirmación de la página (p-confirmDialog "confirmarReporte"), con el mismo estilo que el resto.
   * Enter acepta (el botón principal tiene el foco) y Esc o la X cancelan.
   */
  private confirmar(titulo : string, detalle : string, accion : () => void, aceptar = 'Continuar', rechazar = 'Cancelar') {
    (document.activeElement as HTMLElement | null)?.blur();
    this.confirmationService.confirm({
      key: 'confirmarReporte',
      header: titulo,
      message: detalle,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: aceptar,
      rejectLabel: rechazar,
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      defaultFocus: 'accept',
      accept: accion,
    });
  }

  /**
   * Control de errores de la página: mensaje entendible según la causa y "Ver detalles" con la información técnica.
   * @param error Error recibido.
   * @param porDefecto Mensaje si el servidor no explicó la causa.
   * @param operacion Qué se estaba haciendo (se ve en "Ver detalles").
   * @param metodo Método HTTP de la operación.
   */
  private notificarError(error : unknown, porDefecto : string, operacion : string, metodo : string = 'GET') {
    this.msj.errorDetallado(error, porDefecto, { operacion, metodo });
  }
}
