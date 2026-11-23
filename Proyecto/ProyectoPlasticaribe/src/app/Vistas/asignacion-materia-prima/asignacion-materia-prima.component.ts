import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { ConfirmationService } from 'primeng/api';
import { catchError, finalize, of, Subject, Subscription, switchMap, takeUntil } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { TutorialesService } from 'src/app/Servicios/Tutoriales/Tutoriales.service';
import {
  ClaveTutorialAsignacionManual,
  ClaveTutorialAsignacionSolicitud,
  pasosTutorialAsignacion,
} from 'src/app/Tutoriales/Tutoriales_AsignacionMaterial';
import {
  AutorizacionExcesoPendiente,
  DetalleSolicitudMaterial,
  MaquinaDetalleSolicitud,
  EstadoSolicitudMaterial,
  RegistrarAsignacionRequest,
  RegistrarAsignacionResult,
  ResumenSolicitudOT,
  motivoOTCerrada,
  ADICIONAL_KG_OT,
  ESTADOS_OT_CERRADA,
  ROLES_EXCEDER_LIMITE_OT,
  TipoMaterialInventario,
  solicitudCerrada,
  formatoNumero,
  aTipoMaterial,
  LOCALE_NUMEROS,
  RETRASO_TOOLTIP_AYUDA_MS,
} from 'src/app/Modelo/modelFlujoMaterialProduccion';
import { AutorizacionesExcesoOTService } from 'src/app/Servicios/AutorizacionesExcesoOT/autorizacionesExcesoOT.service';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { DetallesAsignacionService } from 'src/app/Servicios/DetallesAsgMateriaPrima/detallesAsignacion.service';
import { InventarioTransaccionalService } from 'src/app/Servicios/InventarioTransaccional/inventarioTransaccional.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { AsignacionMPService } from 'src/app/Servicios/Asignacion_MateriaPrima/asignacionMP.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { SolicitudMP_ExtrusionService } from 'src/app/Servicios/SolicitudMP_Extrusion/SolicitudMP_Extrusion.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { alCambiarTema } from 'src/app/Servicios/Tema/Tema.service';

/** Materiales comodín que no se pueden asignar. */
const MATERIALES_NO_ASIGNABLES = [84, 2001, 88, 89, 2072];

/** Margen para comparar cantidades sin que los errores de redondeo de JavaScript cuenten. */
const TOLERANCIA = 0.005;

/** Duración (ms) de los mensajes de error, más largos para poder leer el motivo. */
const DURACION_ERROR_MS = 6000;
/** Segundos que se muestra el aviso de PDF generado antes de abrirlo en una pestaña nueva. */
const ESPERA_ABRIR_PDF_SEG = 1.5;

/** Datos del aviso de asignación creada (se muestra fijo dentro del popup / la página). */
interface AsignacionCreada {
  asignacionId: number;
  /** Texto del aviso. */
  detalle: string;
  /** Máquina sugerida para la siguiente asignación (otra con faltante), o null. */
  siguienteMaquina: number | null;
}

/** Redondea a dos decimales, que es lo que acepta el API. */
const redondear2 = (valor: number): number => Math.round((Number(valor) || 0) * 100) / 100;

/** Material agregado a la tabla de asignación (modo manual) o armado desde la solicitud al asignar. */
interface MaterialSeleccionado {
  Id: number;
  TipoMaterial: TipoMaterialInventario;
  Nombre: string;
  Cantidad: number;
  Stock: number;
  Und_Medida: string;
  Proceso: string;
}

/** Material de una subcategoría de la solicitud con la cantidad que se va a asignar. */
interface MaterialAsignar {
  tipo: TipoMaterialInventario;
  id: number;
  nombre: string;
  und: string;
  stock: number;
  /** Lo que pidió el solicitante (0 si es un sustituto). */
  solicitado: number;
  entregado: number;
  /** Lo que falta entregar de este material según lo pedido. */
  pendiente: number;
  /** Cantidad a asignar escrita por quien asigna. */
  cantidad: number | null;
  /** Material de la misma subcategoría que no se pidió (se entrega en lugar de otro). */
  esSustituto: boolean;
}

/** Subcategoría de la solicitud con sus materiales a asignar. */
interface SubcategoriaAsignar {
  id: number;
  nombre: string;
  und: string;
  solicitado: number;
  entregado: number;
  faltante: number;
  /** False en solicitudes anteriores, pedidas solo por subcategoría. */
  conMateriales: boolean;
  materiales: MaterialAsignar[];
  /** Material elegido en "Otro material de esta subcategoría". */
  otroMaterial: number | null;
  /** Materiales de la subcategoría con stock que aún no están en la lista. */
  opcionesOtro: { label: string; value: number }[];
}

@Component({
  selector: 'app-asignacion-materia-prima',
  templateUrl: './asignacion-materia-prima.component.html',
  styleUrls: ['./asignacion-materia-prima.component.css']
})
export class AsignacionMateriaPrimaComponent implements OnInit, OnDestroy {
  /** Retraso de los tooltips de información o ayuda (los de botones de acción inmediata salen sin retraso). */
  readonly retrasoAyuda = RETRASO_TOOLTIP_AYUDA_MS;
  /** Punto decimal y coma de miles en los campos numéricos (igual que el pipe number). */
  readonly localeNumeros = LOCALE_NUMEROS;

  /** Se usa dentro del popup del reporte: oculta el título y la tarjeta, y solo asigna la solicitud recibida. */
  @Input() modoPopup: boolean = false;
  /** Solicitud que se asigna en el popup. */
  @Input() solicitudId: number | null = null;
  @ViewChild('formularioAsignacion') formularioAsignacion!: ElementRef<HTMLFormElement>;
  /** Se creó una asignación (el popup sigue abierto): el reporte refresca su lista y su detalle. */
  @Output() asignacionRegistrada = new EventEmitter<number>();
  public FormMateriaPrimaRetiro !: FormGroup;
  public FormMateriaPrimaRetirada !: FormGroup;
  /** Material obtenido en la última consulta; se usa para validar que el Id y nombre del formulario no se alteraron. */
  private materialConsultado: { id: number; nombre: string } | null = null;

  /** Indica si hay una materia prima consultada; bloquea Und y Proceso porque se toman del material. */
  get hayMaterialConsultado(): boolean {
    return this.materialConsultado !== null;
  }

  storage_Id: any;
  storage_Nombre: any;
  ValidarRol: any;
  cargando: boolean = false; //Indica si hay una operación en curso
  materiaPrima: any[] = []; //Materias primas y tintas para el selector manual
  materiasPrimasSeleccionadas: MaterialSeleccionado[] = [];
  unidadMedida: any[] = [];
  procesos: any[] = [];
  today: string = moment().format('YYYY-MM-DD');
  kgOT: number = 0; //Kg máximos de la OT (kg de la OT más el adicional permitido)
  /** Kg de la OT en BagPro, sin el adicional (umbral de la solicitud de la OT). */
  kgRealOT: number = 0;
  estadoOT: any;
  /** Solicitud de la OT (estado de todas sus solicitudes); null si la OT aún no tiene solicitudes. */
  solicitudOT: ResumenSolicitudOT | null = null;
  infoOrdenTrabajo: any[] = [];
  categoriasMP: any[] = [];
  categoriasTintas: any[] = [];
  mpSeleccionada: MaterialSeleccionado | null = null;
  modoSeleccionado: boolean;
  private readonly suscripcionTema = alCambiarTema(oscuro => this.modoSeleccionado = oscuro); // mantiene modoSeleccionado al día con el tema

  // Asignación basada en una solicitud
  /** Hay una solicitud cargada: se asigna por sus subcategorías y materiales. */
  esSolicitud: boolean = false;
  detalleSolicitud: DetalleSolicitudMaterial | null = null;
  subcategoriasAsignar: SubcategoriaAsignar[] = [];
  /** Máquinas de la solicitud con su parte (informativa) y lo ya entregado a cada una; se elige una por asignación. */
  maquinasSolicitud: MaquinaDetalleSolicitud[] = [];
  /** Máquina que se deja elegida al recargar la solicitud (después de crear una asignación). */
  private maquinaPreferida: number | null = null;
  /** La solicitud ya no está activa (p. ej. quedó completada después de una asignación): se ve, pero ya no se asigna. */
  solicitudCompleta = false;
  /** El PDF de la asignación se está generando (botón del aviso con "Generando PDF…"). */
  generandoPdfAsignacion = false;
  /** La solicitud se está cargando en el popup (de la consulta hasta tener la OT): se ven filas de relleno, sin máscara. */
  private cargandoSolicitud = false;
  /** El tutorial de la primera vez espera a que termine la carga de la solicitud. */
  private tutorialPendiente = false;

  /** Muestra las filas de relleno en lugar del formulario (solo en el popup, mientras carga la solicitud). */
  get mostrarEsqueleto(): boolean {
    return this.modoPopup && this.cargandoSolicitud;
  }

  /** Aviso de la última asignación creada (con "Generar PDF" y "Asignar a máquina N"); null = oculto. */
  avisoCreada: AsignacionCreada | null = null;
  @ViewChild('avisoCreadaElemento') avisoCreadaElemento?: ElementRef<HTMLElement>;
  /** Materiales del proceso de la solicitud (una fila por material), para sustitutos y solicitudes anteriores. */
  private catalogoProceso: any[] = [];
  private consultaSolicitud?: Subscription;

  // Autorizaciones de exceso de la OT
  dialogoSolicitarAutorizacion: boolean = false;
  excesoKgPorAutorizar: number = 0;
  motivoAutorizacion: string = '';
  dialogoAutorizacionesPendientes: boolean = false;
  autorizacionesPendientes: (AutorizacionExcesoPendiente & { motivoRechazo?: string })[] = [];

  private destroy$ = new Subject<void>();

  constructor(private materiaPrimaService: MateriaPrimaService,
    private unidadMedidaService: UnidadMedidaService,
    private procesosService: ProcesosService,
    private frmBuilderMateriaPrima: FormBuilder,
    private AppComponent: AppComponent,
    private detallesAsignacionService: DetallesAsignacionService,
    private bagProServices: BagproService,
    private tintasService: TintasService,
    private confirmationService: ConfirmationService,
    private tutoriales: TutorialesService,
    private mensajeService: MensajesAplicacionService,
    private servicioSolicitudes: SolicitudMP_ExtrusionService,
    private servicioInventario: InventarioTransaccionalService,
    private servicioAutorizaciones: AutorizacionesExcesoOTService,
    private servicioPDF: CreacionPdfService,
    private servicioAsignacion: AsignacionMPService,
  ) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.FormMateriaPrimaRetiro = this.frmBuilderMateriaPrima.group({
      OTRetiro: [null, Validators.required],
      Solicitud: [null],
      FechaRetiro: [this.today, Validators.required],
      Maquina: [null, Validators.required],
      kgOt: [null, Validators.required],
      ObservacionRetiro: [''],
      dateIn: [new Date(), Validators.required],
    });

    this.FormMateriaPrimaRetirada = this.frmBuilderMateriaPrima.group({
      MpIdRetirada: ['', Validators.required],
      MpNombreRetirada: ['', Validators.required],
      MpCantidadRetirada: [null, Validators.required],
      MpUnidadMedidaRetirada: ['', Validators.required],
      MpStockRetirada: [null, Validators.required],
      ProcesoRetiro: ['', Validators.required],
      Categoria: ['', Validators.required],
    });
  }

  /** En el popup carga la solicitud recibida; en la página completa carga los catálogos del modo manual. */
  ngOnInit(): void {
    this.lecturaStorage();
    if (this.modoPopup) {
      if (this.solicitudId) this.cargarSolicitud(this.solicitudId);
      return;
    }
    this.obtenerUnidadMedida();
    this.obtenerProcesos();
    this.obtenerMateriaPrima();
    this.consultarCategorias();
    this.tutoriales.iniciarPrimeraVez(ClaveTutorialAsignacionManual, this.storage_Id, () => this.pasosTutorial());
  }

  /** Cancela las suscripciones activas y el tutorial abierto al destruir el componente (o cerrar el popup). */
  ngOnDestroy() {
    this.tutoriales.cancelar();
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Indica si el usuario puede superar el límite de kg de la OT. */
  get puedeExcederLimite(): boolean {
    return ROLES_EXCEDER_LIMITE_OT.includes(Number(this.ValidarRol));
  }

  /** Muestra el tutorial (botón "i"): el de la asignación por solicitud o el de la asignación manual. */
  tutorial = () => this.tutoriales.iniciar(this.pasosTutorial());

  private pasosTutorial() {
    return pasosTutorialAsignacion({
      esSolicitud: this.esSolicitud,
      modoPopup: this.modoPopup,
      puedeExcederLimite: this.puedeExcederLimite,
    });
  }

  lecturaStorage() {
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  /** Limpia los formularios y vuelve al modo manual. */
  LimpiarCampos() {
    this.consultaSolicitud?.unsubscribe();
    this.limpiarCamposMP();
    this.FormMateriaPrimaRetiro.reset({ FechaRetiro: this.today, dateIn: new Date(), ObservacionRetiro: '' });
    this.kgOT = 0;
    this.kgRealOT = 0;
    this.solicitudOT = null;
    this.cargando = false;
    this.materiasPrimasSeleccionadas = [];
    this.infoOrdenTrabajo = [];
    this.limpiarDatosSolicitud();
  }

  /** Quita la solicitud consultada, su OT y máquina, y vuelve al modo manual. */
  limpiarSolicitudSeleccionada(): void {
    this.FormMateriaPrimaRetiro.patchValue({ Solicitud: null, OTRetiro: null, Maquina: null });
    this.infoOrdenTrabajo = [];
    this.materiasPrimasSeleccionadas = [];
    this.kgOT = 0;
    this.kgRealOT = 0;
    this.solicitudOT = null;
    this.limpiarDatosSolicitud();
  }

  private limpiarDatosSolicitud() {
    this.esSolicitud = false;
    this.detalleSolicitud = null;
    this.subcategoriasAsignar = [];
    this.maquinasSolicitud = [];
    this.solicitudCompleta = false;
    this.catalogoProceso = [];
  }

  /** Limpia el formulario de selección de materia prima (Id, nombre, stock, cantidad, und y proceso) y el material consultado. */
  limpiarCamposMP() {
    this.FormMateriaPrimaRetirada.reset();
    this.materialConsultado = null;
  }

  obtenerUnidadMedida = () => this.unidadMedidaService.srvObtenerLista().pipe(takeUntil(this.destroy$)).subscribe({
    next: data => this.unidadMedida = data,
    error: error => this.notificarError(error, 'No se pudieron cargar las unidades de medida.', 'Cargar unidades de medida'),
  });

  obtenerProcesos = () => this.procesosService.srvObtenerLista().pipe(takeUntil(this.destroy$)).subscribe({
    next: data => this.procesos = data.filter((item) => item.proceso_Id != 'TINTAS'),
    error: error => this.notificarError(error, 'No se pudieron cargar los procesos.', 'Cargar procesos'),
  });

  obtenerMateriaPrima() {
    this.materiaPrimaService.getMpTintaBopp().pipe(takeUntil(this.destroy$)).subscribe({
      next: data => {
        this.materiaPrima = data.filter((item) => item.categoria != 6);
        this.materiaPrima.sort((a, b) => a.nombre.localeCompare(b.nombre));
      },
      error: error => this.notificarError(error, 'No se pudo cargar la lista de materias primas.', 'Cargar materias primas'),
    });
  }

  consultarCategorias() {
    this.materiaPrimaService.GetCategoriasMateriaPrima().pipe(takeUntil(this.destroy$)).subscribe({
      next: datos => this.categoriasMP = datos,
      error: error => this.notificarError(error, 'No se pudieron cargar las categorías de materia prima.', 'Cargar categorías de materia prima'),
    });
    this.tintasService.GetCategoriasTintas().pipe(takeUntil(this.destroy$)).subscribe({
      next: datos => this.categoriasTintas = datos,
      error: error => this.notificarError(error, 'No se pudieron cargar las categorías de tintas.', 'Cargar categorías de tintas'),
    });
  }

  /** Indica si el material ya está en la tabla de asignación. */
  private materialYaSeleccionado = (tipo: TipoMaterialInventario, id: number) =>
    this.materiasPrimasSeleccionadas.some(x => x.TipoMaterial === tipo && x.Id === id);

  /** Consulta la OT en BagPro y lo que ya tiene asignado para calcular lo que resta por asignar. */
  infoOT() {
    const ot: string = this.FormMateriaPrimaRetiro.value.OTRetiro;
    if (!ot) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `Debe ingresar una OT.`);

    this.cargando = true;
    this.bagProServices.srvObtenerListaClienteOT_Item(ot)
      .pipe(takeUntil(this.destroy$), finalize(() => {
        this.cargando = false;
        // La carga de la solicitud termina con la consulta de la OT (la última del armado del formulario).
        this.cargandoSolicitud = false;
        if (this.tutorialPendiente) {
          this.tutorialPendiente = false;
          this.tutoriales.iniciarPrimeraVez(ClaveTutorialAsignacionSolicitud, this.storage_Id, () => this.pasosTutorial(), 400);
        }
      }))
      .subscribe({
        next: datos => {
          if (!datos || datos.length === 0) {
            this.mensajeService.mensajeAdvertencia('Advertencia', `La OT N° ${ot} no se encuentra registrada en BagPro.`);
            return;
          }
          const datosOT = datos[0];
          this.kgRealOT = Number(datosOT.datosotKg) || 0;
          this.kgOT = datosOT.datosotKg * (1 + ADICIONAL_KG_OT);
          this.estadoOT = datosOT.estado;
          this.FormMateriaPrimaRetiro.patchValue({ kgOt: this.kgOT });
          this.cargarInformacionOT(ot, datosOT);
          this.cargarSolicitudOT(Number(ot));
        },
        error: error => this.notificarError(error, `No se pudo consultar la OT N° ${ot}.`, 'Consultar OT')
      });
  }

  /**
   * Carga en la tabla de la OT los kg asignados y la cantidad pedida en la unidad de su presentación.
   * @param ot Número de la OT.
   * @param datosOT Datos de la OT obtenidos de BagPro.
   */
  cargarInformacionOT(ot: string, datosOT: any) {
    this.detallesAsignacionService.getMateriasPrimasAsignadas(parseInt(ot)).pipe(takeUntil(this.destroy$)).subscribe({
      error: error => this.notificarError(error, `No se pudo consultar lo ya asignado a la OT N° ${ot}.`, 'Consultar kg asignados a la OT'),
      next: asignado => {
      const presentacion: string = (datosOT.ptPresentacionNom || '').trim();
      const porPresentacion: Record<string, { und: string; cantidad: number }> = {
        'Kilo': { und: 'Kg', cantidad: datosOT.datosotKg },
        'Unidad': { und: 'Und', cantidad: datosOT.datoscantBolsa },
        'Paquete': { und: 'Paquete', cantidad: datosOT.datoscantBolsa },
      };
      const pedido = porPresentacion[presentacion] ?? porPresentacion['Kilo'];

      this.infoOrdenTrabajo = [{
        ot: ot,
        cliente: datosOT.clienteNom,
        item: datosOT.clienteItems,
        referencia: datosOT.clienteItemsNom,
        kg: this.kgOT,
        kgRestante: this.kgOT - asignado,
        cantAsignada: asignado,
        cantPedida: pedido.cantidad,
        und: pedido.und,
      }];
    }});
  }

  /**
   * Consulta la solicitud de la OT (null si aún no tiene solicitudes) y avisa si la OT ya no admite asignaciones
   * de materia prima (completada) o de nada (finalizada o verificada).
   * @param ot Número de la OT.
   * @param alTerminar Recibe el resumen consultado (p. ej. para avisar el cambio de estado después de asignar).
   */
  private cargarSolicitudOT(ot: number, alTerminar?: (resumen: ResumenSolicitudOT | null) => void) {
    this.servicioSolicitudes.obtenerResumenOT(ot).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status !== 404) this.notificarError(error, `No se pudo consultar la solicitud de la OT N° ${ot}.`, 'Consultar solicitud de la OT');
        return of(null);
      }),
      takeUntil(this.destroy$),
    ).subscribe(resumen => {
      this.solicitudOT = resumen;
      if (alTerminar) return alTerminar(resumen);

      // Recarga después de asignar: si esta asignación completó la OT es un logro, no una advertencia.
      const estadoAntes = this.estadoOTAntesDeAsignar;
      this.estadoOTAntesDeAsignar = undefined;
      if (estadoAntes !== undefined && resumen?.estado_Id === EstadoSolicitudMaterial.Completada) {
        if (estadoAntes !== EstadoSolicitudMaterial.Completada)
          this.mensajeService.mensajeConfirmacion('¡OT completada!',
            `La OT N° ${ot} llegó a su tope y quedó COMPLETADA: sus solicitudes de materia prima ya recibieron todo el material.`);
        return;
      }
      const motivo = this.motivoOTNoAdmite;
      if (motivo) this.mensajeService.mensajeAdvertencia('Advertencia', motivo, DURACION_ERROR_MS);
    });
  }

  /**
   * Estado de la solicitud de la OT antes de la última asignación, mientras se recarga la solicitud después de asignar
   * (undefined fuera de esa recarga). Sirve para mostrar como éxito, y no como advertencia, que la OT quedó completada.
   */
  private estadoOTAntesDeAsignar: number | null | undefined = undefined;

  /**
   * Por qué la OT no admite la asignación: completada (no recibe más materia prima) o finalizada / verificada.
   * Las tintas sí se admiten en una OT completada (solicitud de tintas, o asignación manual sin materias primas),
   * igual que en el API. Null si se puede asignar.
   */
  get motivoOTNoAdmite(): string | null {
    const sinMateriaPrima = this.materiasPrimasSeleccionadas.length > 0
      && !this.materiasPrimasSeleccionadas.some(m => m.TipoMaterial === TipoMaterialInventario.MateriaPrima);
    const proceso = this.esSolicitud ? (this.detalleSolicitud?.proceso_Id ?? '') : (sinMateriaPrima ? '' : 'EXT');
    const motivo = motivoOTCerrada(this.solicitudOT?.estado_Id, proceso, Number(this.FormMateriaPrimaRetiro.value.OTRetiro));
    return motivo?.replace('no admite más solicitudes', 'no admite más asignaciones') ?? null;
  }

  // ───────────────────────── Modo manual (sin solicitud) ─────────────────────────

  /**
   * Consulta el material del campo Materia Prima y carga sus datos. El selector deja en el control
   * el id de la opción elegida, o el texto escrito (id o nombre) si se presionó Enter sin coincidencia.
   */
  cambiarNombreMateriaPrima() {
    const id = this.FormMateriaPrimaRetirada.value.MpNombreRetirada?.toString().trim();
    if (id == null || id === '') return this.mensajeService.mensajeAdvertencia(`Advertencia`, `Debe ingresar una materia prima.`);

    this.cargando = true;
    this.materiaPrimaService.getInfoMpTintaBopp(id).pipe(takeUntil(this.destroy$), finalize(() => this.cargando = false)).subscribe({
      next: datos => {
        const material = datos.find(x =>
          (this.categoriasMP.includes(x.categoria) || this.categoriasTintas.includes(x.categoria)) &&
          !MATERIALES_NO_ASIGNABLES.includes(x.id));
        if (!material) {
          this.limpiarCamposMP();
          return this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡La materia prima consultada no existe o no se puede asignar!`);
        }

        this.materialConsultado = { id: material.id, nombre: material.nombre };
        this.FormMateriaPrimaRetirada.patchValue({
          MpIdRetirada: material.id,
          MpNombreRetirada: material.nombre,
          MpCantidadRetirada: 0,
          MpUnidadMedidaRetirada: material.undMedida,
          MpStockRetirada: material.stock,
          ProcesoRetiro: this.categoriasMP.includes(material.categoria) ? 'EXT' : 'IMP',
          Categoria: material.categoria,
        });
      },
      error: error => {
        this.limpiarCamposMP();
        this.notificarError(error, `No se pudo consultar la materia prima ${id}.`, 'Consultar materia prima');
      }
    });
  }

  // Funcion para colocar la materia prima en la tabla
  validarCamposVaciosMPRetirada() {
    const form = this.FormMateriaPrimaRetirada.value;
    const tipo = this.categoriasTintas.includes(form.Categoria) ? TipoMaterialInventario.Tinta : TipoMaterialInventario.MateriaPrima;

    if (!this.FormMateriaPrimaRetirada.valid) return this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡Hay campos vacios en el formulario de materia prima!`);
    if (!this.materialConsultado || this.materialConsultado.id != form.MpIdRetirada || this.materialConsultado.nombre !== form.MpNombreRetirada)
      return this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡La materia prima del formulario no corresponde a la consultada, selecciónela nuevamente!`);
    if (!form.MpCantidadRetirada || form.MpCantidadRetirada <= 0) return this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡La cantidad a asignar debe ser mayor a cero (0)!`);
    if (this.materialYaSeleccionado(tipo, form.MpIdRetirada)) return this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡La materia prima ${form.MpNombreRetirada} ya ha sido seleccionada!`);
    if (form.MpCantidadRetirada > form.MpStockRetirada) return this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡La cantidad a asignar supera a la cantidad en stock!`);

    this.materiasPrimasSeleccionadas.push({
      Id: form.MpIdRetirada,
      TipoMaterial: tipo,
      Nombre: form.MpNombreRetirada,
      Cantidad: form.MpCantidadRetirada,
      Und_Medida: form.MpUnidadMedidaRetirada,
      Proceso: form.ProcesoRetiro,
      Stock: form.MpStockRetirada,
    });
    this.limpiarCamposMP();
  }

  /** Total de la tabla de materiales a asignar. */
  calcularTotalSeleccionado = (): number => this.materiasPrimasSeleccionadas.reduce((a, b) => a + Number(b.Cantidad || 0), 0);

  // Funcion que va a quitar la materia prima
  quitarMateriaPrima() {
    const seleccionada = this.mpSeleccionada;
    if (!seleccionada) return;
    this.materiasPrimasSeleccionadas = this.materiasPrimasSeleccionadas
      .filter(x => !(x.TipoMaterial === seleccionada.TipoMaterial && x.Id === seleccionada.Id));
    this.mpSeleccionada = null;
  }

  /** Valida las cantidades de la tabla manual (mayores a cero y sin superar el stock) antes de asignar. */
  validarStockMateriales() {
    const enCero = this.materiasPrimasSeleccionadas.find(m => !(Number(m.Cantidad) > 0));
    if (enCero) return this.mensajeService.mensajeAdvertencia('Advertencia', `La cantidad de ${enCero.Nombre} debe ser mayor a cero; si no la necesita, quítela.`);
    if (this.materiasPrimasSeleccionadas.some(m => Number(m.Cantidad) > Number(m.Stock))) {
      return this.mensajeService.mensajeAdvertencia('Advertencia', 'Existen materiales con cantidades solicitadas mayores a su stock, por favor, verifique!');
    }
    this.materiasPrimasSeleccionadas.forEach(m => m.Cantidad = redondear2(m.Cantidad));
    if (this.validarEncabezado()) this.crearAsignacion();
  }

  /** Valida el formulario de la asignación y la OT. Devuelve false (y avisa) si falta algo. */
  private validarEncabezado(): boolean {
    const maquina: number = this.FormMateriaPrimaRetiro.value.Maquina;
    if (!this.FormMateriaPrimaRetiro.valid) {
      this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, '¡Debe llenar los campos vacios!');
      this.scrollToFirstInvalidField();
      return false;
    }
    if (this.materiasPrimasSeleccionadas.length == 0) {
      this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, '¡Debe seleccionar minimo una materia prima para crear la asignación!');
      return false;
    }
    if (!(maquina >= 1)) {
      this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, '¡El numero de la maquina no es valido!');
      return false;
    }
    if (this.infoOrdenTrabajo.length == 0) {
      this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, '¡Debe consultar la OT antes de asignar!');
      return false;
    }
    if (ESTADOS_OT_CERRADA.includes(Number(this.estadoOT))) {
      this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡No es posible asignar a la OT ${this.FormMateriaPrimaRetiro.value.OTRetiro}, porque ya se encuentra cerrada!`);
      return false;
    }
    // El API también lo valida; aquí se avisa antes de armar la asignación.
    const motivo = this.motivoOTNoAdmite;
    if (motivo) {
      this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, motivo, DURACION_ERROR_MS);
      return false;
    }
    return true;
  }

  /** Desplaza suavemente el formulario hasta el primer control inválido. */
  private scrollToFirstInvalidField(): void {
    const controlInvalido = this.formularioAsignacion?.nativeElement.querySelector<HTMLElement>('[formControlName].ng-invalid');
    controlInvalido?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // ───────────────────────── Asignación basada en una solicitud ─────────────────────────

  /** Consulta la solicitud del campo (Enter) en la página completa. */
  consultarSolicitudMaterial() {
    const texto = (this.FormMateriaPrimaRetiro.value.Solicitud ?? '').toString().trim();
    if (!/^\d+$/.test(texto) || Number(texto) <= 0) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `El valor ingresado en el campo solicitud no es válido`);
    this.cargarSolicitud(Number(texto));
  }

  /**
   * Carga la solicitud con sus subcategorías y materiales, y los materiales de su proceso (para sustitutos y para
   * las solicitudes anteriores que no tienen materiales). Luego consulta la OT.
   * @param id Solicitud a asignar.
   */
  /**
   * @param permitirCerrada true al recargar después de una asignación que la completó: se muestra sin poder asignar.
   */
  cargarSolicitud(id: number, permitirCerrada: boolean = false) {
    this.consultaSolicitud?.unsubscribe();
    this.materiasPrimasSeleccionadas = [];
    this.limpiarDatosSolicitud();
    this.cargando = true;
    this.cargandoSolicitud = true;
    this.consultaSolicitud = this.servicioSolicitudes.obtenerSolicitud(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: detalle => {
        if (solicitudCerrada(detalle.estado_Id) && !permitirCerrada) {
          this.cargando = false;
          this.cargandoSolicitud = false;
          return this.mensajeService.mensajeAdvertencia(`Advertencia`, `La solicitud N° ${id} está ${detalle.estado.toLowerCase()}; solo se asignan solicitudes pendientes o parciales.`, DURACION_ERROR_MS);
        }
        this.materiaPrimaService.getSubcategories(detalle.proceso_Id).pipe(
          catchError(() => {
            this.mensajeService.mensajeAdvertencia('Advertencia', 'No se pudieron consultar los demás materiales del proceso; solo se podrán asignar los solicitados.');
            return of([] as any[]);
          }),
          finalize(() => this.cargando = false),
          takeUntil(this.destroy$),
        ).subscribe(catalogo => this.prepararSolicitud(detalle, catalogo));
      },
      error: (error: HttpErrorResponse) => {
        this.cargando = false;
        this.cargandoSolicitud = false;
        if (error.status === 404) this.mensajeService.mensajeAdvertencia('Advertencia', `La solicitud N° ${id} no existe.`);
        else this.notificarError(error, `No se pudo obtener la solicitud N° ${id}.`, 'Consultar solicitud para asignar');
      },
    });
  }

  /** Arma las subcategorías a asignar, la máquina y el encabezado, y consulta la OT. */
  private prepararSolicitud(detalle: DetalleSolicitudMaterial, catalogo: any[]) {
    this.detalleSolicitud = detalle;
    this.catalogoProceso = catalogo.filter(m => m.id_Subcategoria != null && !MATERIALES_NO_ASIGNABLES.includes(Number(m.item)));
    const tipo = detalle.proceso_Id === 'EXT' ? TipoMaterialInventario.MateriaPrima : TipoMaterialInventario.Tinta;

    this.subcategoriasAsignar = detalle.subcategorias.map(s => {
      const materiales: MaterialAsignar[] = s.materiales.map(m => ({
        tipo: aTipoMaterial(m.tipoMaterial),
        id: m.materialId,
        nombre: m.nombre,
        und: m.undMed_Id,
        stock: Number(m.stock),
        solicitado: Number(m.solicitado),
        entregado: Number(m.entregado),
        pendiente: redondear2(Math.max(0, m.solicitado - m.entregado)),
        cantidad: null,
        esSustituto: m.solicitado <= 0,
      }));
      // Solicitud anterior (sin materiales pedidos): se ofrecen los materiales de la subcategoría con stock.
      if (!s.conMateriales) {
        this.catalogoProceso
          .filter(c => c.id_Subcategoria === s.subCatMP_Id && c.stock > 0 && !materiales.some(m => m.id === c.item))
          .sort((a, b) => b.stock - a.stock)
          .forEach(c => materiales.push(this.materialDeCatalogo(c, tipo, s.undMed_Id)));
      }
      const subcategoria: SubcategoriaAsignar = {
        id: s.subCatMP_Id,
        nombre: s.nombre,
        und: s.undMed_Id,
        solicitado: Number(s.solicitado),
        entregado: Number(s.entregado),
        faltante: Number(s.faltante),
        conMateriales: s.conMateriales,
        materiales,
        otroMaterial: null,
        opcionesOtro: [],
      };
      subcategoria.opcionesOtro = this.otrosMateriales(subcategoria);
      return subcategoria;
    });

    // Si el API no envía el objetivo (versión anterior), se calcula aquí: total solicitado × porcentaje.
    const totalSolicitado = detalle.subcategorias.reduce((t, s) => t + Number(s.solicitado), 0);
    this.maquinasSolicitud = detalle.maquinas
      .filter(m => m.maquina > 0)
      .map(m => ({
        maquina: m.maquina,
        porcentaje: Number(m.porcentaje),
        objetivo: m.objetivo != null ? Number(m.objetivo) : redondear2(totalSolicitado * Number(m.porcentaje) / 100),
        entregado: Number(m.entregado) || 0,
      }));
    this.solicitudCompleta = solicitudCerrada(detalle.estado_Id);
    this.esSolicitud = true;
    this.FormMateriaPrimaRetiro.patchValue({
      Solicitud: detalle.id,
      OTRetiro: String(detalle.ot),
      Maquina: this.maquinaInicial(),
      ObservacionRetiro: '',
      dateIn: new Date(),
    });
    this.infoOT();
    // El tutorial (primera vez) arranca cuando termina la carga, con el formulario ya en pantalla.
    this.tutorialPendiente = true;
  }

  /**
   * Máquina elegida al cargar la solicitud: la única, la preferida (al recargar después de asignar)
   * o la primera que todavía tiene faltante.
   */
  private maquinaInicial(): number | null {
    const maquinas = this.maquinasSolicitud;
    if (maquinas.length === 0) return null;
    if (maquinas.length === 1) return maquinas[0].maquina;
    // La preferida (la que acaba de recibir) solo se conserva si todavía puede elegirse.
    const preferida = maquinas.find(m => m.maquina === this.maquinaPreferida && !this.maquinaBloqueada(m));
    this.maquinaPreferida = null;
    return (preferida ?? maquinas.find(m => this.faltanteMaquina(m) > TOLERANCIA) ?? maquinas[0]).maquina;
  }

  /** Máquina que recibe la asignación (la del formulario). */
  get maquinaElegida(): number | null {
    const valor = this.FormMateriaPrimaRetiro.value.Maquina;
    return valor != null && valor !== '' ? Number(valor) : null;
  }

  /** Elige la máquina que recibe con su botón. */
  elegirMaquina(maquina: number) {
    const m = this.maquinasSolicitud.find(x => x.maquina === maquina);
    if (m && this.maquinaBloqueada(m)) return;
    this.FormMateriaPrimaRetiro.patchValue({ Maquina: maquina });
  }

  /** Lo que le falta recibir a la máquina según su parte (negativo si ya recibió más). */
  faltanteMaquina = (m: MaquinaDetalleSolicitud): number => redondear2(m.objetivo - m.entregado);

  /**
   * La máquina ya recibió su parte y otra todavía tiene faltante: no se puede elegir (se ve en verde, solo informa).
   * Si todas recibieron su parte pero la solicitud aún tiene faltante (redondeos, sustitutos), se pueden elegir todas.
   */
  maquinaBloqueada(m: MaquinaDetalleSolicitud): boolean {
    return this.faltanteMaquina(m) <= TOLERANCIA
      && this.maquinasSolicitud.some(otra => otra !== m && this.faltanteMaquina(otra) > TOLERANCIA);
  }

  /** Porcentaje de avance de la máquina (para su barra), de 0 a 100. */
  avanceMaquina = (m: MaquinaDetalleSolicitud): number => m.objetivo > 0 ? Math.min(100, m.entregado / m.objetivo * 100) : 0;

  /** Qué falta para poder crear la asignación (se muestra en el pie y deshabilita el botón), o null si está lista. */
  get faltaParaAsignar(): string | null {
    if (this.solicitudCompleta) return `La solicitud quedó ${(this.detalleSolicitud?.estado ?? 'completada').toLowerCase()}: ya no admite más asignaciones.`;
    if (this.maquinaElegida == null) return 'Elija la máquina que recibe el material.';
    if (this.resumenAsignar.materiales === 0) return 'Escriba en "A asignar" lo que va a entregar de cada material.';
    return null;
  }

  /** Aviso (no bloquea) si la máquina elegida recibiría más de su parte de la solicitud. */
  get avisoExcesoMaquina(): string | null {
    if (this.maquinasSolicitud.length < 2 || this.resumenAsignar.total <= 0) return null;
    const maquina = this.maquinasSolicitud.find(m => m.maquina === this.maquinaElegida);
    if (!maquina) return null;
    const recibiria = redondear2(maquina.entregado + this.resumenAsignar.total);
    return recibiria > maquina.objetivo + TOLERANCIA
      ? `La máquina ${maquina.maquina} recibiría ${formatoNumero(recibiria)} y su parte (${maquina.porcentaje} %) es ${formatoNumero(maquina.objetivo)}.`
      : null;
  }

  /** Convierte un material del catálogo del proceso en una fila a asignar (sustituto: no se pidió). */
  private materialDeCatalogo = (c: any, tipo: TipoMaterialInventario, und: string): MaterialAsignar => ({
    tipo,
    id: Number(c.item),
    nombre: String(c.referencia).trim(),
    und: c.undMed_Id ?? und,
    stock: Number(c.stock),
    solicitado: 0,
    entregado: 0,
    pendiente: 0,
    cantidad: null,
    esSustituto: true,
  });

  /** Materiales de la subcategoría con stock que todavía no están en su lista (para "Otro material"). */
  private otrosMateriales(subcategoria: SubcategoriaAsignar): { label: string; value: number }[] {
    return this.catalogoProceso
      .filter(c => c.id_Subcategoria === subcategoria.id && c.stock > 0 && !subcategoria.materiales.some(m => m.id === Number(c.item)))
      .sort((a, b) => b.stock - a.stock)
      .map(c => ({ label: `${String(c.referencia).trim()} · stock ${formatoNumero(Number(c.stock))}`, value: Number(c.item) }));
  }

  /** Agrega a la subcategoría el material elegido en "Otro material de esta subcategoría". */
  agregarOtroMaterial(subcategoria: SubcategoriaAsignar) {
    const item = subcategoria.otroMaterial;
    const c = this.catalogoProceso.find(x => Number(x.item) === item);
    if (!c || !this.detalleSolicitud) return;
    const tipo = this.detalleSolicitud.proceso_Id === 'EXT' ? TipoMaterialInventario.MateriaPrima : TipoMaterialInventario.Tinta;
    subcategoria.materiales = [...subcategoria.materiales, this.materialDeCatalogo(c, tipo, subcategoria.und)];
    subcategoria.otroMaterial = null;
    subcategoria.opcionesOtro = this.otrosMateriales(subcategoria);
  }

  /** Cantidad escrita para asignar en una subcategoría. */
  totalAsignar = (subcategoria: SubcategoriaAsignar): number =>
    redondear2(subcategoria.materiales.reduce((t, m) => t + Number(m.cantidad || 0), 0));

  /** Lo que quedaría faltando de la subcategoría después de esta asignación (negativo si se pasa). */
  quedaria = (subcategoria: SubcategoriaAsignar): number => redondear2(subcategoria.faltante - this.totalAsignar(subcategoria));

  /** Total escrito para asignar en toda la solicitud y cuántos materiales lo componen. */
  get resumenAsignar(): { materiales: number; total: number } {
    const conCantidad = this.subcategoriasAsignar.flatMap(s => s.materiales).filter(m => Number(m.cantidad) > 0);
    return { materiales: conCantidad.length, total: redondear2(conCantidad.reduce((t, m) => t + Number(m.cantidad), 0)) };
  }

  /**
   * Propone cantidades: a cada material solicitado, lo menor entre lo que le falta y su stock, sin pasar el faltante
   * de la subcategoría. Los sustitutos no se llenan solos. Solo llena los campos vacíos.
   * @param subcategoria Subcategoría a llenar; si se omite, todas.
   */
  llenarConFaltante(subcategoria?: SubcategoriaAsignar) {
    const proporcion = this.proporcionMaquinaElegida();
    if (proporcion == null) return this.mensajeService.mensajeAdvertencia('Advertencia', 'Elija primero la máquina que recibe el material.');
    const destino = subcategoria ? [subcategoria] : this.subcategoriasAsignar;
    let sinStock = 0;
    destino.forEach(s => {
      let disponible = redondear2(s.faltante - this.totalAsignar(s));
      s.materiales.filter(m => !m.esSustituto && !(Number(m.cantidad) > 0) && m.pendiente > 0).forEach(m => {
        const propuesta = redondear2(Math.min(m.pendiente * proporcion, Math.max(0, m.stock), Math.max(0, disponible)));
        if (propuesta > 0) {
          m.cantidad = propuesta;
          disponible = redondear2(disponible - propuesta);
        }
        if (m.stock < m.pendiente) sinStock++;
      });
    });
    if (sinStock > 0) this.mensajeService.mensajeAdvertencia('Advertencia', `${sinStock} material(es) no tienen stock suficiente para lo que falta; complete con otro material de la subcategoría si es necesario.`, DURACION_ERROR_MS);
  }

  /**
   * Parte de lo faltante que le toca a la máquina elegida (0 a 1), para "Llenar con lo faltante":
   * lo que le falta a la máquina sobre lo que le falta a toda la solicitud. Con una sola máquina, o si las demás
   * ya recibieron su parte, es 1 (se llena todo lo faltante). null si hay varias máquinas y no se eligió ninguna.
   */
  private proporcionMaquinaElegida(): number | null {
    if (this.maquinasSolicitud.length <= 1) return 1;
    const elegida = this.maquinasSolicitud.find(m => m.maquina === this.maquinaElegida);
    if (!elegida) return null;
    const otrasConFaltante = this.maquinasSolicitud.some(m => m !== elegida && this.faltanteMaquina(m) > TOLERANCIA);
    if (!otrasConFaltante) return 1;
    const faltanteSolicitud = this.subcategoriasAsignar.reduce((t, s) => t + Math.max(0, s.faltante), 0);
    if (faltanteSolicitud <= 0) return 0;
    return Math.min(1, Math.max(0, this.faltanteMaquina(elegida)) / faltanteSolicitud);
  }

  /** Borra las cantidades escritas. */
  limpiarCantidades() {
    this.subcategoriasAsignar.forEach(s => s.materiales.forEach(m => m.cantidad = null));
  }

  /**
   * Revisa la asignación por solicitud: máquina, cantidades mayores a cero, sin pasar el stock de cada material ni
   * el faltante de cada subcategoría. Si todo está bien, muestra el resumen para confirmar.
   */
  validarAsignacionSolicitud() {
    if (this.cargando || !this.detalleSolicitud || this.solicitudCompleta) return;
    if (this.maquinaElegida == null) return this.mensajeService.mensajeAdvertencia('Advertencia', 'Elija la máquina que recibe el material.');
    const elegidos = this.subcategoriasAsignar.flatMap(s => s.materiales.filter(m => m.cantidad != null && m.cantidad !== 0).map(m => ({ s, m })));
    if (elegidos.length === 0) return this.mensajeService.mensajeAdvertencia('Advertencia', 'Escriba la cantidad a asignar de al menos un material.');

    const negativo = elegidos.find(x => !(Number(x.m.cantidad) > 0));
    if (negativo) return this.mensajeService.mensajeAdvertencia('Advertencia', `La cantidad de ${negativo.m.nombre} debe ser mayor a cero.`);
    const sinStock = elegidos.find(x => Number(x.m.cantidad) > x.m.stock + TOLERANCIA);
    if (sinStock) return this.mensajeService.mensajeAdvertencia('Advertencia', `La cantidad de ${sinStock.m.nombre} (${formatoNumero(Number(sinStock.m.cantidad))}) supera su stock (${formatoNumero(sinStock.m.stock)}).`, DURACION_ERROR_MS);
    const excedida = this.subcategoriasAsignar.find(s => this.quedaria(s) < -TOLERANCIA);
    if (excedida) return this.mensajeService.mensajeAdvertencia('Advertencia', `A ${excedida.nombre} le faltan ${formatoNumero(excedida.faltante)} ${excedida.und} y se están asignando ${formatoNumero(this.totalAsignar(excedida))}.`, DURACION_ERROR_MS);

    this.materiasPrimasSeleccionadas = elegidos.map(({ m }) => ({
      Id: m.id,
      TipoMaterial: m.tipo,
      Nombre: m.nombre,
      Cantidad: redondear2(Number(m.cantidad)),
      Stock: m.stock,
      Und_Medida: m.und,
      Proceso: this.detalleSolicitud!.proceso_Id,
    }));
    if (!this.validarEncabezado()) return;

    const avisos = elegidos
      .filter(x => x.m.esSustituto || Number(x.m.cantidad) > x.m.pendiente + TOLERANCIA)
      .map(x => x.m.esSustituto ? `${x.m.nombre} no se pidió: se entrega como sustituto.` : `${x.m.nombre}: se asigna más de lo pedido.`);
    if (this.avisoExcesoMaquina) avisos.push(this.avisoExcesoMaquina);
    this.resumenConfirmacion = {
      encabezado: `Solicitud N° ${this.detalleSolicitud.id} · OT ${this.detalleSolicitud.ot}`,
      maquina: this.maquinaElegida,
      filas: this.subcategoriasAsignar
        .filter(s => this.totalAsignar(s) > 0)
        .map(s => ({ nombre: s.nombre, und: s.und, asignar: this.totalAsignar(s), quedan: Math.max(0, this.quedaria(s)) })),
      total: this.resumenAsignar.total,
      materiales: elegidos.length,
      avisos,
    };
    // Diálogo propio con el resumen en tabla (plantilla en el HTML); Enter crea la asignación y Esc vuelve a revisar.
    (document.activeElement as HTMLElement | null)?.blur();
    this.confirmationService.confirm({
      key: 'resumenAsignacion',
      header: '¿Crear la asignación?',
      acceptLabel: 'Crear asignación',
      rejectLabel: 'Revisar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      defaultFocus: 'accept',
      accept: () => this.crearAsignacion(),
    });
  }

  /** Resumen que se muestra en el diálogo "¿Crear la asignación?". */
  resumenConfirmacion: {
    encabezado: string;
    maquina: number | null;
    filas: { nombre: string; und: string; asignar: number; quedan: number }[];
    total: number;
    materiales: number;
    avisos: string[];
  } | null = null;

  // ───────────────────────── Registrar ─────────────────────────

  /** Construye la petición de la asignación con los datos del formulario, la OT y los materiales. */
  private construirAsignacion(confirmarExceso: boolean): RegistrarAsignacionRequest {
    const form = this.FormMateriaPrimaRetiro.value;
    const ot = this.infoOrdenTrabajo[0];
    return {
      OrdenTrabajo: Number(form.OTRetiro),
      Maquina: Number(form.Maquina),
      Observacion: form.ObservacionRetiro || undefined,
      FechaRealEntrega: moment(form.dateIn).format('YYYY-MM-DD'),
      SolicitudId: this.esSolicitud && form.Solicitud ? Number(form.Solicitud) : null,
      ProductoId: Number(ot.item) || 1,
      CantidadPedidaOT: Number(ot.cantPedida) || 0,
      UnidadMedidaOT: ot.und || 'Kg',
      LimiteKgOT: this.kgOT,
      // Kg de la OT en BagPro (umbral de la solicitud de la OT).
      KgOT: this.kgRealOT || null,
      ConfirmarExceso: confirmarExceso,
      Materiales: this.materiasPrimasSeleccionadas.map(m => ({
        TipoMaterial: m.TipoMaterial,
        MaterialId: m.Id,
        Cantidad: Number(m.Cantidad),
        ProcesoId: m.Proceso,
      })),
    };
  }

  /**
   * Registra la asignación en una sola operación del API (detalles, inventario y estado de la solicitud).
   * Si supera el límite de la OT, pide confirmación a quien puede excederlo o permite solicitar autorización.
   * @param confirmarExceso Indica que el usuario confirmó superar el límite de la OT.
   */
  crearAsignacion(confirmarExceso: boolean = false) {
    if (this.cargando) return;
    this.cargando = true;

    this.servicioInventario.registrarAsignacion(this.construirAsignacion(confirmarExceso))
      .pipe(takeUntil(this.destroy$), finalize(() => this.cargando = false))
      .subscribe({
        next: resultado => this.asignacionExitosa(resultado),
        error: (error: HttpErrorResponse) => this.manejarErrorAsignacion(error),
      });
  }

  /**
   * Control de errores de la página: mensaje entendible según la causa y "Ver detalles" con la información técnica.
   * @param error Error recibido.
   * @param porDefecto Mensaje si el servidor no explicó la causa.
   * @param operacion Qué se estaba haciendo (se ve en "Ver detalles").
   * @param metodo Método HTTP de la operación.
   */
  private notificarError(error: unknown, porDefecto: string, operacion: string, metodo: string = 'GET') {
    this.mensajeService.errorDetallado(error, porDefecto, { operacion, metodo });
  }

  /** Muestra el error del API o abre el flujo de exceso del límite de la OT. */
  private manejarErrorAsignacion(error: HttpErrorResponse) {
    const resultado = error.error as RegistrarAsignacionResult | undefined;
    if (error.status === 409 && resultado?.requiereAutorizacion) {
      this.excesoKgPorAutorizar = resultado.excesoKg ?? 0;
      if (this.puedeExcederLimite) {
        this.confirmar('Superar límite de la OT', `${resultado.mensaje} ¿Desea continuar con la asignación?`, () => this.crearAsignacion(true), 'Asignar de todas formas');
      } else {
        this.motivoAutorizacion = '';
        this.dialogoSolicitarAutorizacion = true;
      }
      return;
    }
    this.notificarError(error, 'No se pudo crear la asignación de materia prima.', 'Crear asignación de materia prima', 'POST');
  }

  /**
   * Genera el PDF de la asignación y notifica el resultado.
   * @param resultado Respuesta del API con la asignación creada.
   */
  /**
   * Asignación creada: muestra el aviso con "Generar PDF" (ya no se genera solo) y, en una solicitud con varias
   * máquinas, "Asignar a la máquina N" con la siguiente que tiene faltante. Con solicitud, el formulario se recarga
   * con lo entregado al día y el popup sigue abierto; sin solicitud (página directa) se limpia.
   * @param resultado Respuesta del API con la asignación creada.
   */
  private asignacionExitosa(resultado: RegistrarAsignacionResult) {
    const asignacionId = resultado.asignacionId!;
    const completada = resultado.estadoSolicitud === EstadoSolicitudMaterial.Completada;
    const maquina = this.maquinaElegida;
    const siguienteMaquina = this.esSolicitud && !completada ? this.siguienteMaquinaConFaltante(maquina, this.resumenAsignar.total) : null;
    let detail = `Asignación N° ${asignacionId} creada satisfactoriamente${maquina != null ? ` para la máquina ${maquina}` : ''}.`;
    if (completada) detail += ' La solicitud quedó completada.';
    else if (resultado.estadoSolicitud === EstadoSolicitudMaterial.Parcial) detail += ' La solicitud quedó con entrega parcial.';

    this.avisoCreada = { asignacionId, detalle: detail, siguienteMaquina };
    this.avisarCambioOT(Number(this.FormMateriaPrimaRetiro.value.OTRetiro), asignacionId);
    // Se lleva la vista al aviso (queda arriba del formulario).
    setTimeout(() => this.avisoCreadaElemento?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));

    if (this.esSolicitud && this.detalleSolicitud) {
      // Se recarga con lo entregado al día; queda elegida la misma máquina (el aviso ofrece pasar a la siguiente).
      this.maquinaPreferida = maquina;
      this.estadoOTAntesDeAsignar = this.solicitudOT?.estado_Id ?? null;
      this.cargarSolicitud(this.detalleSolicitud.id, true);
      this.asignacionRegistrada.emit(asignacionId);
      return;
    }
    // La asignación descontó inventario: se recarga la lista para que el stock que se muestra esté actualizado.
    this.obtenerMateriaPrima();
    this.LimpiarCampos();
  }

  /**
   * Después de asignar, consulta la solicitud de la OT y agrega al aviso si la OT se completó sola (llegó al tope)
   * o si ya llegó a sus kg y se puede completar desde Movimientos.
   * @param ot Número de la OT.
   * @param asignacionId Asignación del aviso (si el aviso ya cambió, no se toca).
   */
  private avisarCambioOT(ot: number, asignacionId: number) {
    const estadoAntes = this.solicitudOT?.estado_Id;
    const umbralAntes = this.solicitudOT?.umbralAlcanzado ?? false;
    if (!(ot > 0)) return;
    this.cargarSolicitudOT(ot, resumen => {
      if (!resumen || this.avisoCreada?.asignacionId !== asignacionId) return;
      let extra = '';
      if (resumen.estado_Id === EstadoSolicitudMaterial.Completada && estadoAntes !== EstadoSolicitudMaterial.Completada)
        extra = ` La OT llegó al tope (${formatoNumero(resumen.topeKgOT)} kg) y quedó COMPLETADA: sus solicitudes de materia prima ya no reciben más material.`;
      else if (resumen.puedeCompletar && !umbralAntes)
        extra = ` La OT ya llegó a sus kg (${formatoNumero(resumen.kgOT)} kg): se puede completar desde Movimientos.`;
      if (extra) this.avisoCreada = { ...this.avisoCreada, detalle: this.avisoCreada.detalle + extra };
    });
  }

  /**
   * Siguiente máquina de la solicitud (después de la actual, en orden) que todavía tiene faltante de su parte.
   * @param actual Máquina que acaba de recibir.
   * @param recibido Lo que acaba de recibir (aún no está en los datos cargados).
   */
  private siguienteMaquinaConFaltante(actual: number | null, recibido: number): number | null {
    const maquinas = this.maquinasSolicitud;
    if (maquinas.length < 2) return null;
    const inicio = Math.max(0, maquinas.findIndex(m => m.maquina === actual));
    for (let i = 1; i < maquinas.length; i++) {
      const m = maquinas[(inicio + i) % maquinas.length];
      const entregado = m.maquina === actual ? m.entregado + recibido : m.entregado;
      if (m.objetivo - entregado > TOLERANCIA) return m.maquina;
    }
    return null;
  }

  /** Botón "Asignar a la máquina N" del aviso: elige esa máquina para la siguiente asignación. */
  asignarSiguienteMaquina(creada: AsignacionCreada) {
    if (creada.siguienteMaquina != null) this.elegirMaquina(creada.siguienteMaquina);
    // El aviso sigue (para poder generar el PDF de la asignación anterior), sin el botón de la siguiente máquina.
    if (this.avisoCreada) this.avisoCreada = { ...this.avisoCreada, siguienteMaquina: null };
  }

  /**
   * Botón "Generar PDF" del aviso: el botón muestra "Generando PDF…" y el aviso sigue abierto mientras se arma;
   * al terminar sale el aviso "PDF generado" y se abre en una pestaña nueva (materias primas y tintas en un solo PDF).
   */
  generarPdfDesdeAviso(creada: AsignacionCreada) {
    if (this.generandoPdfAsignacion) return;
    this.generandoPdfAsignacion = true;
    this.servicioAsignacion.obtenerDatosPdf(creada.asignacionId).pipe(
      switchMap(datos => (datos.subcategorias ?? []).length > 0 ? this.servicioPDF.generarBlobAsignacionMateriaPrima(datos) : of(null)),
      finalize(() => this.generandoPdfAsignacion = false),
      takeUntil(this.destroy$),
    ).subscribe({
      next: pdf => {
        if (pdf) this.abrirPdfConAviso(pdf, `El PDF de la asignación N° ${creada.asignacionId}`, `Asignacion ${creada.asignacionId}.pdf`);
      },
      error: error => this.notificarError(error, `No fue posible generar el PDF de la asignación N° ${creada.asignacionId}.`, 'Generar PDF de la asignación'),
    });
  }

  /**
   * Aviso "se generó correctamente" y, pasado un momento, abre el PDF en una pestaña nueva. Si el navegador
   * bloquea la pestaña (ventanas emergentes), lo descarga para que el usuario no se quede sin el documento.
   */
  private abrirPdfConAviso(pdf: Blob, documento: string, archivo: string) {
    this.mensajeService.mensajeConfirmacion('¡PDF generado!',
      `${documento} se generó correctamente. A continuación se abrirá en una nueva pestaña.`, ESPERA_ABRIR_PDF_SEG * 1000 + 500);
    const url = URL.createObjectURL(pdf);
    setTimeout(() => {
      if (!window.open(url, '_blank')) {
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = archivo;
        enlace.click();
        this.mensajeService.mensajeAdvertencia('Advertencia', `El navegador bloqueó la pestaña nueva, por eso el PDF se descargó (${archivo}). Puede permitir las ventanas emergentes para este sitio.`, DURACION_ERROR_MS);
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    }, ESPERA_ABRIR_PDF_SEG * 1000);
  }

  /** Envía la solicitud de autorización para superar el límite de la OT. */
  enviarSolicitudAutorizacion() {
    const motivo = this.motivoAutorizacion.trim();
    if (!motivo) return this.mensajeService.mensajeAdvertencia('Advertencia', 'Debe indicar el motivo de la solicitud.');

    this.cargando = true;
    this.servicioAutorizaciones.solicitar(Number(this.FormMateriaPrimaRetiro.value.OTRetiro), this.excesoKgPorAutorizar, motivo)
      .pipe(takeUntil(this.destroy$), finalize(() => this.cargando = false))
      .subscribe({
        next: () => {
          this.dialogoSolicitarAutorizacion = false;
          this.mensajeService.mensajeConfirmacion('OK!', 'Solicitud de autorización enviada. Cuando sea aprobada, vuelva a realizar la asignación.');
        },
        error: error => this.notificarError(error, 'No fue posible enviar la solicitud de autorización.', 'Solicitar autorización de exceso', 'POST')
      });
  }

  /** Abre el listado de autorizaciones de exceso pendientes. */
  verAutorizacionesPendientes() {
    this.cargando = true;
    this.servicioAutorizaciones.getPendientes()
      .pipe(takeUntil(this.destroy$), finalize(() => this.cargando = false))
      .subscribe({
        next: data => {
          this.autorizacionesPendientes = data;
          this.dialogoAutorizacionesPendientes = true;
        },
        error: error => this.notificarError(error, 'No fue posible consultar las autorizaciones pendientes.', 'Consultar autorizaciones de exceso pendientes')
      });
  }

  /**
   * Aprueba o rechaza una autorización pendiente.
   * @param autorizacion Autorización seleccionada.
   * @param aprobar True para aprobar; false para rechazar con el motivo digitado.
   */
  responderAutorizacion(autorizacion: AutorizacionExcesoPendiente & { motivoRechazo?: string }, aprobar: boolean) {
    const motivo = (autorizacion.motivoRechazo || '').trim();
    if (!aprobar && !motivo) return this.mensajeService.mensajeAdvertencia('Advertencia', 'Debe indicar el motivo del rechazo.');

    const operacion = aprobar
      ? this.servicioAutorizaciones.aprobar(autorizacion.autEx_Id)
      : this.servicioAutorizaciones.rechazar(autorizacion.autEx_Id, motivo);
    this.cargando = true;
    operacion.pipe(takeUntil(this.destroy$), finalize(() => this.cargando = false)).subscribe({
      next: () => {
        this.autorizacionesPendientes = this.autorizacionesPendientes.filter(a => a.autEx_Id !== autorizacion.autEx_Id);
        this.mensajeService.mensajeConfirmacion('Confirmación', `Autorización de la OT ${autorizacion.autEx_OrdenTrabajo} ${aprobar ? 'aprobada' : 'rechazada'}.`);
      },
      error: error => this.notificarError(error, 'No fue posible responder la autorización.', 'Responder autorización de exceso', 'PUT')
    });
  }

  /**
   * Abre el diálogo de confirmación de la página (p-confirmDialog "confirmarAsignacion"), con el mismo estilo que el resto.
   * Enter acepta (el botón principal tiene el foco) y Esc o la X cancelan. Respeta los saltos de línea del mensaje.
   */
  private confirmar(titulo: string, detalle: string, accion: () => void, aceptar = 'Continuar', rechazar = 'Cancelar', icono = 'pi pi-exclamation-triangle') {
    (document.activeElement as HTMLElement | null)?.blur();
    this.confirmationService.confirm({
      key: 'confirmarAsignacion',
      header: titulo,
      message: detalle,
      icon: icono,
      acceptLabel: aceptar,
      rejectLabel: rechazar,
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      defaultFocus: 'accept',
      accept: accion,
    });
  }

  mostrarEleccion(item: MaterialSeleccionado) {
    this.mpSeleccionada = item;
    this.confirmar('Quitar material', `¿Está seguro que desea quitar ${item.Nombre} de la asignación?`, () => this.quitarMateriaPrima(), 'Quitar');
  }
}
