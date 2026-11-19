import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';
import { ConfirmationService } from 'primeng/api';
import { catchError, finalize, forkJoin, map, Observable, of, Subject, Subscription, switchMap, takeUntil } from 'rxjs';
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
  ROLES_VERIFICAR_SOLICITUD,
  ROLES_VER_PDF_SOLICITUD,
  SolicitudConsultada,
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
  { id: EstadoSolicitudMaterial.Finalizada, nombre: 'Finalizadas', clase: 'finalizada', icono: 'pi pi-check-square' },
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
  modoSeleccionado : boolean;
  private readonly suscripcionTema = alCambiarTema(oscuro => this.modoSeleccionado = oscuro); // mantiene modoSeleccionado al día con el tema
  ValidarRol : number;
  readonly estadosSolicitud = ESTADOS_SOLICITUD;
  formFiltros !: FormGroup;

  /** Cantidad de solicitudes por estado (chips). */
  conteo : { [estado: number]: number } = {};
  /** Estados de la última consulta (resalta el chip correspondiente). */
  estadosConsultados : number[] = [];
  /** Texto que explica qué se está mostrando en la tabla. */
  descripcionConsulta : string = '';

  solicitudes : SolicitudConsultada[] = [];
  solicitudSeleccionada : SolicitudConsultada | null = null;

  /** Detalle completo de la solicitud seleccionada. */
  detalle : DetalleSolicitudMaterial | null = null;
  datosOT : DatosOTResumen | null = null;
  cargandoDetalle : boolean = false;

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
   * - `fecha=YYYY-MM-DD` y `estado=E`: solicitudes creadas ese día en ese estado; con `seleccionar=N` deja esa seleccionada.
   * @returns true si había filtros en la URL (ya se consultó).
   */
  private aplicarFiltrosDeLaUrl() : boolean {
    const parametros = this.ruta.snapshot.queryParamMap;
    const solicitud = parametros.get('solicitud');
    const fecha = parametros.get('fecha');
    if (solicitud && /^\d+$/.test(solicitud)) {
      this.formFiltros.patchValue({ documento: solicitud });
      this.consultarFiltros();
      return true;
    }
    if (!fecha || !moment(fecha, 'YYYY-MM-DD', true).isValid()) return false;

    const estado = Number(parametros.get('estado'));
    const seleccionar = Number(parametros.get('seleccionar'));
    this.idPorSeleccionar = Number.isInteger(seleccionar) && seleccionar > 0 ? seleccionar : null;
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

  /** Asigna material y finaliza o cancela solicitudes. */
  get puedeGestionar() : boolean {
    return ROLES_GESTIONAR_SOLICITUD.includes(this.ValidarRol);
  }

  /** Marca como verificadas las solicitudes finalizadas. */
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

  /** La solicitud seleccionada está pendiente o parcial: se puede asignar, finalizar o cancelar. */
  get solicitudActiva() : boolean {
    return this.detalle?.estado_Id === EstadoSolicitudMaterial.Pendiente || this.detalle?.estado_Id === EstadoSolicitudMaterial.Parcial;
  }

  get solicitudFinalizada() : boolean {
    return this.detalle?.estado_Id === EstadoSolicitudMaterial.Finalizada;
  }

  /** "Ver asignaciones PDF": solo en solicitudes parciales, finalizadas o verificadas que tengan asignaciones. */
  get puedeVerAsignacionesPdf() : boolean {
    const estado = this.detalle?.estado_Id;
    return (estado === EstadoSolicitudMaterial.Parcial || estado === EstadoSolicitudMaterial.Finalizada || estado === EstadoSolicitudMaterial.Verificada)
      && (this.detalle?.asignaciones?.length ?? 0) > 0;
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
      next: pdf => this.abrirPdfConAviso(pdf, solicitud.asignaciones!.length, solicitud.id),
      error: error => this.notificarError(error, `No fue posible generar el PDF de las asignaciones de la solicitud N° ${solicitud.id}.`, 'Generar PDF de asignaciones'),
    });
  }

  /** Aviso "PDF generado" y, pasado un momento, lo abre en una pestaña nueva (si el navegador la bloquea, lo descarga). */
  private abrirPdfConAviso(pdf : Blob, cantidad : number, solicitud : number) {
    const archivo = `Asignaciones solicitud ${solicitud}.pdf`;
    this.msj.mensajeConfirmacion('¡PDF generado!',
      `El PDF con ${cantidad} asignación(es) de la solicitud N° ${solicitud} se generó correctamente. A continuación se abrirá en una nueva pestaña.`, 2000);
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

  /** Chip de estado: muestra todas las solicitudes de ese estado, sin límite de fechas (igual que su conteo). */
  consultarPorEstado(estado : number) {
    this.formFiltros.reset({ estados: [estado] });
    const nombre = ESTADOS_SOLICITUD.find(e => e.id === estado)?.nombre ?? '';
    this.consultar({ estados: [estado] }, `Todas las solicitudes ${nombre.toLowerCase()}`);
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
    this.estadosConsultados = filtros.id != null ? [] : (filtros.estados ?? []);
    const seleccionada = conservarSeleccion ? this.solicitudSeleccionada?.id : null;
    if (!conservarSeleccion) this.quitarSeleccion();

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
   * Pide confirmación para finalizar o cancelar la solicitud seleccionada.
   * @param estado Finalizada (5) o Cancelada (4).
   */
  pedirCambioEstado(estado : number) {
    const solicitud = this.detalle;
    if (!solicitud || !this.solicitudActiva) return;
    const accion = estado === EstadoSolicitudMaterial.Finalizada ? 'finalizar' : 'cancelar';
    const aviso = estado === EstadoSolicitudMaterial.Finalizada && solicitud.estado_Id === EstadoSolicitudMaterial.Pendiente
      ? ' No tiene material entregado.'
      : estado === EstadoSolicitudMaterial.Cancelada && solicitud.estado_Id === EstadoSolicitudMaterial.Parcial
        ? ' Ya tiene material entregado; lo entregado no se devuelve.' : '';
    this.confirmar(estado === EstadoSolicitudMaterial.Finalizada ? 'Finalizar solicitud' : 'Cancelar solicitud',
      `¿Está seguro que desea ${accion} la solicitud N° ${solicitud.id} de la OT ${solicitud.ot}?${aviso}`,
      () => this.cambiarEstado(solicitud.id, estado, accion),
      estado === EstadoSolicitudMaterial.Finalizada ? 'Finalizar' : 'Cancelar solicitud',
      estado === EstadoSolicitudMaterial.Finalizada ? 'Cancelar' : 'Volver');
  }

  /** Finaliza o cancela la solicitud con el endpoint que valida el estado y el permiso. */
  private cambiarEstado(id : number, estado : number, accion : string) {
    this.servicioSolicitudes.cambiarEstado(id, estado)
      .pipe(this.conCarga(), takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.msj.mensajeConfirmacion('Confirmación', `¡La solicitud N° ${id} quedó ${accion === 'finalizar' ? 'FINALIZADA' : 'CANCELADA'}!`);
          this.refrescar();
        },
        error: (error : HttpErrorResponse) => {
          this.notificarError(error, `No fue posible ${accion} la solicitud N° ${id}.`, accion === 'finalizar' ? 'Finalizar solicitud' : 'Cancelar solicitud', 'PUT');
          if (error.status === 409) this.refrescar();
        },
      });
  }

  /** Pide confirmación para marcar como verificada la solicitud finalizada. */
  pedirVerificacion() {
    const solicitud = this.detalle;
    if (!solicitud || !this.solicitudFinalizada) return;
    this.confirmar('Verificar asignación',
      `¿Está seguro que la asignación de la solicitud N° ${solicitud.id} está completada? Se marcará como VERIFICADA.`,
      () => this.verificarSolicitud(solicitud.id), 'Marcar como verificada');
  }

  private verificarSolicitud(id : number) {
    this.servicioSolicitudes.verificarSolicitud(id)
      .pipe(this.conCarga(), takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.msj.mensajeConfirmacion('Confirmación', `¡La solicitud N° ${id} se marcó como VERIFICADA!`);
          this.refrescar();
        },
        error : (error : HttpErrorResponse) => {
          this.notificarError(error, `No fue posible verificar la solicitud N° ${id}.`, 'Verificar solicitud', 'PUT');
          if (error.status === 409) this.refrescar();
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
