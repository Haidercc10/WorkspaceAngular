import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { ConfirmationService, ConfirmEventType, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { Vistas_PermisosService } from 'src/app/Servicios/Vistas_Permisos/Vistas_Permisos.service';
import { Table } from 'primeng/table';
import { defer, finalize, map, Observable, of, Subject, Subscription, switchMap, takeUntil } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { TutorialesService } from 'src/app/Servicios/Tutoriales/Tutoriales.service';
import { ClaveTutorialSolicitudMaterial, pasosTutorialSolicitudMaterial } from 'src/app/Tutoriales/Tutoriales_SolicitudMaterial';
import {
  AdvertenciaDisponibilidad,
  DetalleSolicitudMaterial,
  DetalleSolicitudRequest,
  EstadoSolicitudMaterial,
  MaterialAsignadoOT,
  SolicitudConsultada,
  TipoMaterialInventario,
  ADICIONAL_KG_OT,
  ESTADOS_OT_CERRADA,
  ROLES_EDITAR_SOLICITUD,
  ROLES_ELEGIR_PROCESO,
  ROLES_EXCEDER_LIMITE_OT,
  solicitudCerrada,
  formatoNumero,
  aTipoMaterial,
  LOCALE_NUMEROS,
} from 'src/app/Modelo/modelFlujoMaterialProduccion';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { DetallesAsignacionService } from 'src/app/Servicios/DetallesAsgMateriaPrima/detallesAsignacion.service';
import { MaquinasService } from 'src/app/Servicios/Maquinas/maquinas.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { DetalleError, MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { SolicitudMP_ExtrusionService } from 'src/app/Servicios/SolicitudMP_Extrusion/SolicitudMP_Extrusion.service';
import { CreacionPdfService, DatosOTSolicitudPDF } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { alCambiarTema } from 'src/app/Servicios/Tema/Tema.service';

/** Segundos que se muestra el aviso de PDF generado antes de abrirlo en una pestaña nueva. */
const ESPERA_ABRIR_PDF_OT_SEG = 1.5;

/** Duración (ms) de los mensajes de error, más largos que los de 3 s para poder leer el motivo. */
const DURACION_ERROR_MS = 6000;
/** Clave del aviso de éxito al guardar (con los botones "Ver en movimientos" y "Generar PDF"). */
const CLAVE_TOAST_SOLICITUD_GUARDADA = 'solicitudGuardada';
/** Tiempo que se ve el aviso de éxito al guardar (da tiempo de elegir una opción). */
const DURACION_AVISO_GUARDADA_MS = 15000;
/** Nombre de la vista de Movimientos de solicitudes en los permisos (data.nombre de su ruta). */
const VISTA_MOVIMIENTOS_SOLICITUD = 'Mov. Solicitud Materia Prima';

/** Datos del aviso de éxito al guardar una solicitud. */
interface SolicitudGuardada {
  solicitud: number;
  ot: DatosOTSolicitudPDF | null;
  creada: boolean;
}
/** Tiempo que se ve en el pie del popup la confirmación de lo agregado. */
const DURACION_AVISO_AGREGADO_MS = 5000;

/** Margen para comparar kg sin que los errores de redondeo de JavaScript cuenten como exceso. */
const TOLERANCIA_KG = 0.005;

/** Proceso en el que se solicitan materias primas; los demás solicitan tintas. */
const PROCESO_EXTRUSION = 'EXT';

/** Procesos que pueden solicitar material. */
const PROCESOS = [
  { proceso_Id: 'EXT', proceso_Nombre: 'EXTRUSIÓN' },
  { proceso_Id: 'IMP', proceso_Nombre: 'IMPRESIÓN' },
  { proceso_Id: 'EMP', proceso_Nombre: 'EMPAQUE' },
  { proceso_Id: 'LAM', proceso_Nombre: 'LAMINADO' },
];

/** Proceso fijo según el rol del usuario; los roles que no están aquí lo eligen. */
const PROCESO_POR_ROL: Record<number, string> = {
  88: 'IMP', 4: 'IMP',
  7: 'EXT', 85: 'EXT',
  87: 'EMP', 9: 'EMP',
  89: 'LAM', 63: 'LAM',
};

/** Redondea a dos decimales, que es lo que acepta el API. */
const redondear2 = (valor: number): number => Math.round((Number(valor) || 0) * 100) / 100;

/** Material elegido dentro de una subcategoría de la solicitud. */
interface MaterialSolicitado {
  TipoMaterial: TipoMaterialInventario;
  Id: number;
  Nombre: string;
  Cantidad: number;
  Und_Medida: string;
  Stock: number;
  /** Lo ya entregado de este material (solo al editar). */
  Entregado: number;
}

/** Subcategoría agregada a la solicitud; su cantidad es la suma de sus materiales. */
interface SubcategoriaSolicitada {
  Id: number;
  Nombre: string;
  Cantidad: number;
  Und_Medida: string;
  /** Stock menos lo reservado por todas las solicitudes activas (incluida esta); null mientras se consulta. */
  Disponible: number | null;
  Cantidad_Entregada: number;
  Cantidad_Faltante: number;
  /** Faltante guardado al cargar la solicitud en edición (0 en filas nuevas); el disponible ya lo descuenta. */
  FaltanteOriginal: number;
  Materiales: MaterialSolicitado[];
  /** Subcategoría de una solicitud anterior, pedida sin materiales: su cantidad se edita directamente. */
  SinMateriales: boolean;
}

/** Máquina elegida con la parte del material que le corresponde. */
interface MaquinaDistribucion {
  Maquina: number;
  Porcentaje: number;
  /** Cantidad que le corresponde del total solicitado. */
  Kg: number;
}

/** Información de la OT consultada que se muestra en la tabla. */
interface InfoOrdenTrabajo {
  ot: number;
  cliente: string;
  item: string;
  ref: string;
  /** Kg de la OT en BagPro. */
  kgReal: number;
  /** Kg máximos que se pueden solicitar (kg de la OT más el adicional). */
  kg: number;
  kgSolicitados: number;
  kgAsignado: number;
  kgRestante: number;
  kgPorSolicitar: number;
  cerrada: boolean;
}

/** Confirmaciones que el usuario ya dio al guardar la solicitud. */
interface ConfirmacionesSolicitud {
  saldoNegativo?: boolean;
  excesoLimite?: boolean;
}

@Component({
  selector: 'app-SolicitudMP_Extrusion',
  templateUrl: './SolicitudMP_Extrusion.component.html',
  styleUrls: ['./SolicitudMP_Extrusion.component.css']
})
export class SolicitudMP_ExtrusionComponent implements OnInit, OnDestroy {
  /** Punto decimal y coma de miles en los campos numéricos (igual que el pipe number). */
  readonly localeNumeros = LOCALE_NUMEROS;

  public formEncabezado !: FormGroup;

  storage_Id: number;
  storage_Nombre: any;
  ValidarRol: number;
  readonly procesos = PROCESOS;
  readonly minDate: Date = new Date();
  modoSeleccionado: boolean;
  private readonly suscripcionTema = alCambiarTema(oscuro => this.modoSeleccionado = oscuro); // mantiene modoSeleccionado al día con el tema

  subcategoriasSeleccionadas: SubcategoriaSolicitada[] = [];
  infoOrdenTrabajo: InfoOrdenTrabajo[] = [];
  maquinas: any[] = [];
  /** Máquinas elegidas con su porcentaje y su parte del total. */
  distribucion: MaquinaDistribucion[] = [];
  /** Solicitud que se está editando, o null si se está creando una nueva. */
  solicitudEnEdicion: number | null = null;

  // Modal "Agregar subcategoría": dos paneles (subcategorías y materiales) que se deslizan.
  mostrarAgregar: boolean = false;
  panelModal: 'subcategorias' | 'materiales' = 'subcategorias';
  subcategoriasModal: any[] = [];
  /** Subcategoría elegida en el modal; queda resaltada al volver a la lista. */
  subcategoriaModal: any | null = null;
  materialesModal: any[] = [];
  /** Búsqueda (por ID o nombre) de cada panel del modal. */
  busquedaSubcategoria = '';
  busquedaMaterial = '';
  @ViewChild('dtSubcategorias') tablaSubcategorias?: Table;
  @ViewChild('dtMateriales') tablaMateriales?: Table;
  /** Material marcado en la lista de materiales del modal. */
  materialMarcado: number | null = null;
  /** Cantidades escritas en el modal que aún no se agregan, por Id de material. */
  borrador: { [item: number]: number | null } = {};
  /** Materiales del proceso (una fila por material); el modal filtra los de cada subcategoría. */
  private materialesProceso: any[] = [];
  private procesoMateriales: string = '';
  /** Primera consulta del catálogo del modal en curso (muestra filas de relleno). */
  cargandoCatalogoModal = false;
  /** El rol puede entrar a Movimientos de solicitudes (botón "Ver en movimientos" del aviso de éxito). */
  puedeVerMovimientos = false;
  /** El PDF de la solicitud se está generando (botón del aviso con "Generando PDF…"). */
  generandoPdfSolicitud = false;
  readonly claveToastGuardada = CLAVE_TOAST_SOLICITUD_GUARDADA;
  /** Lo último que se agregó desde el popup (se ve unos segundos en su pie y con la fila iluminada). */
  ultimoAgregado: { subcategoriaId: number; texto: string; detalle: string } | null = null;
  private temporizadorAgregado?: ReturnType<typeof setTimeout>;
  /** Filas de relleno (ancho del nombre) que se ven mientras carga el catálogo por primera vez. */
  readonly filasRelleno = ['70%', '55%', '65%', '45%', '60%', '50%'].map(nombre => ({ nombre }));
  /** Error de la primera consulta del catálogo; se muestra dentro del modal con "Reintentar". */
  errorCatalogoModal: string | null = null;
  /** Detalle técnico del error de la primera carga (enlace "Ver detalles" dentro del modal). */
  detalleErrorCatalogoModal: DetalleError | null = null;
  private consultaCatalogo?: Subscription;

  mostrarMaterialesAsignados: boolean = false;
  cargandoMaterialesAsignados: boolean = false;
  materialesAsignados: MaterialAsignadoOT[] = [];

  mostrarMisSolicitudes: boolean = false;
  cargandoMisSolicitudes: boolean = false;
  misSolicitudes: SolicitudConsultada[] = [];

  /** PDF de OT esperando a abrirse; evita generarlo dos veces mientras se muestra el aviso. */
  abriendoPdfOT: boolean = false;

  /** Hay cambios en la solicitud que no se han guardado. */
  private cambiosSinGuardar: boolean = false;
  /**
   * Última OT consultada con éxito: a ella pertenecen las subcategorías de la tabla. No se borra al iniciar otra
   * consulta, para seguir preguntando aunque en medio se haya consultado una OT que no existe.
   */
  private otDeLosMateriales: number | null = null;
  /** Consultas en curso; se cancelan al iniciar otra igual para que una respuesta vieja no pise a la nueva. */
  private consultaOT?: Subscription;
  private consultaSolicitud?: Subscription;
  /** Momento (ms) del último aviso de encabezado incompleto; evita repetir el mensaje seguido. */
  private ultimoAvisoEncabezado: number = 0;
  /** Operaciones que muestran el cargando; el overlay se quita cuando terminan todas. */
  private cargasActivas: number = 0;
  private destroy$ = new Subject<void>();

  constructor(private materiaPrimaService: MateriaPrimaService,
    private frmBuilder: FormBuilder,
    private AppComponent: AppComponent,
    private detallesAsignacionService: DetallesAsignacionService,
    private bagProServices: BagproService,
    private confirmationService: ConfirmationService,
    private tutoriales: TutorialesService,
    private mensajeService: MensajesAplicacionService,
    private servicioSolicitudMpExt: SolicitudMP_ExtrusionService,
    private svMaquinas: MaquinasService,
    private servicioPDF: CreacionPdfService,
    private messageService: MessageService,
    private router: Router,
    private vistasPermisosService: Vistas_PermisosService,
  ) {
    this.formEncabezado = this.frmBuilder.group({
      ot: [null, Validators.required],
      maquinas: [null as number[] | null, Validators.required],
      proceso: ['', Validators.required],
      observacion: [''],
      Solicitud: [null],
      fechaEntrega: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.formEncabezado.patchValue({ proceso: this.procesoDelRol });
    // La distribución se sincroniza escuchando el control (lo cambian los botones de máquina y la carga de una solicitud).
    // Sin máquinas el valor queda en null y no en []: así el campo obligatorio queda vacío.
    this.formEncabezado.get('maquinas')!.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((valor: number[] | null) => {
      if (Array.isArray(valor) && valor.length === 0) this.formEncabezado.get('maquinas')!.setValue(null, { emitEvent: false });
      this.cambiarMaquinas(valor);
    });
    this.cargarMaquinas();
    this.verificarAccesoMovimientos();
    this.tutoriales.iniciarPrimeraVez(ClaveTutorialSolicitudMaterial, this.storage_Id, () => this.pasosTutorial());
  }

  ngOnDestroy(): void {
    clearTimeout(this.temporizadorAgregado);
    this.tutoriales.cancelar();
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ───────────────────────── Estado de la vista ─────────────────────────

  /** Indica si hay alguna consulta o guardado en curso (muestra el overlay de carga). */
  get load(): boolean {
    return this.cargasActivas > 0;
  }

  /** Muestra el cargando mientras el observable está activo. Varias cargas a la vez no se apagan entre sí. */
  private conCarga<T>() {
    return (fuente: Observable<T>) => defer(() => {
      this.cargasActivas++;
      return fuente.pipe(finalize(() => this.cargasActivas--));
    });
  }

  /** Indica si se está editando una solicitud existente. */
  get esSolicitud(): boolean {
    return this.solicitudEnEdicion !== null;
  }

  /** Puede consultar y editar solicitudes existentes (solo administrador). */
  get puedeEditar(): boolean {
    return ROLES_EDITAR_SOLICITUD.includes(Number(this.ValidarRol));
  }

  /** Elige el proceso (los roles sin proceso fijo). */
  get puedeElegirProceso(): boolean {
    return ROLES_ELEGIR_PROCESO.includes(Number(this.ValidarRol));
  }

  /** Indica si el usuario puede solicitar por encima del límite de kg de la OT. */
  get puedeExcederLimite(): boolean {
    return ROLES_EXCEDER_LIMITE_OT.includes(Number(this.ValidarRol));
  }

  /** Extrusión solicita materias primas (cuentan para el límite de kg de la OT); los demás procesos solicitan tintas. */
  get solicitaMateriaPrima(): boolean {
    return this.formEncabezado.get('proceso')?.value === PROCESO_EXTRUSION;
  }

  /** Tipo de material que se pide en el proceso elegido. */
  private get tipoMaterial(): TipoMaterialInventario {
    return this.solicitaMateriaPrima ? TipoMaterialInventario.MateriaPrima : TipoMaterialInventario.Tinta;
  }

  /** Proceso que corresponde al rol del usuario; vacío si el rol puede elegirlo. */
  private get procesoDelRol(): string {
    return PROCESO_POR_ROL[Number(this.ValidarRol)] ?? '';
  }

  /** OT consultada (la que se ve en la tabla de información de la OT), o null si no hay. */
  get infoOT(): InfoOrdenTrabajo | null {
    return this.infoOrdenTrabajo[0] ?? null;
  }

  /** Porcentaje adicional sobre los kg de la OT que se permite solicitar. */
  readonly porcentajeAdicional = Math.round(ADICIONAL_KG_OT * 100);

  /** Ancho (%) de cada tramo de la barra de la OT: asignado, solicitado sin asignar y por solicitar. */
  get tramosBarraOT(): { asignado: number; solicitado: number; porSolicitar: number } {
    const ot = this.infoOT;
    if (!ot) return { asignado: 0, solicitado: 0, porSolicitar: 0 };
    const asignado = Math.max(ot.kgAsignado, 0);
    const solicitado = Math.max(ot.kgSolicitados, 0);
    const porSolicitar = Math.max(ot.kgPorSolicitar, 0);
    const base = Math.max(ot.kg, asignado + solicitado + porSolicitar) || 1;
    return { asignado: asignado / base * 100, solicitado: solicitado / base * 100, porSolicitar: porSolicitar / base * 100 };
  }

  /**
   * La OT consultada sigue siendo la del campo. Si el usuario cambió el número sin presionar Enter,
   * la tabla muestra otra OT y no se puede agregar, guardar ni exportar con esos datos.
   */
  get otVigente(): boolean {
    const enCampo = (this.formEncabezado.value.ot ?? '').toString().trim();
    return this.infoOT != null && enCampo === String(this.infoOT.ot);
  }

  /** Encabezado completo, OT consultada y abierta: se pueden agregar subcategorías. */
  get encabezadoCompleto(): boolean {
    return this.formEncabezado.valid && this.otVigente && !this.infoOT!.cerrada;
  }

  /** El PDF solo se puede exportar si la OT del campo es la consultada. */
  get puedeExportarPdfOT(): boolean {
    return this.otVigente && !this.load && !this.abriendoPdfOT;
  }

  /** Unidad del stock en el modal: las materias primas son en kg; las tintas tienen varias unidades. */
  get unidadStockModal(): string {
    return this.solicitaMateriaPrima ? 'Kg' : '';
  }

  /** Total solicitado en la tabla. */
  get totalSolicitado(): number {
    return redondear2(this.subcategoriasSeleccionadas.reduce((total, x) => total + Number(x.Cantidad || 0), 0));
  }

  /** Pendiente por entregar de una fila: lo solicitado menos lo entregado. */
  private pendienteFila = (fila: SubcategoriaSolicitada): number => Math.max(0, Number(fila.Cantidad || 0) - Number(fila.Cantidad_Entregada || 0));

  /**
   * Kg que esta solicitud agrega a lo pendiente de la OT. En edición solo cuenta el aumento sobre lo que ya
   * estaba pendiente (el mismo cálculo del API).
   */
  get aumentoKg(): number {
    return this.subcategoriasSeleccionadas.reduce((total, x) => total + this.pendienteFila(x) - x.FaltanteOriginal, 0);
  }

  /** Kg que quedarían por solicitar en la OT después de guardar; negativo si se supera el límite. */
  get kgQuedarian(): number {
    return (this.infoOT?.kgPorSolicitar ?? 0) - this.aumentoKg;
  }

  /** La fila pide más de lo disponible (solo cuenta lo que aumenta sobre lo que ya tenía la solicitud). */
  excedeDisponible(fila: SubcategoriaSolicitada): boolean {
    return fila.Disponible != null && this.pendienteFila(fila) - fila.FaltanteOriginal > fila.Disponible + TOLERANCIA_KG;
  }

  // ───────────────────────── Tutorial y datos iniciales ─────────────────────────

  /** Muestra el tutorial (botón "i" del título). La primera vez que el usuario entra se muestra solo. */
  tutorial = () => this.tutoriales.iniciar(this.pasosTutorial());

  /** Pasos del tutorial según lo que el rol del usuario puede hacer en la página. */
  private pasosTutorial() {
    return pasosTutorialSolicitudMaterial({
      puedeEditar: this.puedeEditar,
      puedeElegirProceso: this.puedeElegirProceso,
      puedeExcederLimite: this.puedeExcederLimite,
      porcentajeAdicional: Math.round(ADICIONAL_KG_OT * 100),
    });
  }

  lecturaStorage() {
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  /** Carga las máquinas del proceso elegido. */
  cargarMaquinas() {
    const proceso: string = this.formEncabezado.value.proceso;
    this.maquinas = [];
    if (!proceso) return;
    this.svMaquinas.getMaquinasPorProceso(proceso)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => this.maquinas = [...data].sort((a, b) => Number(a.maq_Numero) - Number(b.maq_Numero)),
        error: error => this.notificarError(error, `No fue posible cargar las máquinas del proceso ${proceso}.`, 'Cargar máquinas del proceso'),
      });
  }

  /**
   * Al cambiar el proceso se quitan las máquinas y las subcategorías agregadas, porque pertenecían al proceso
   * anterior (materias primas y tintas no se mezclan), y se recargan las máquinas.
   */
  cambiarProceso() {
    const quitadas = this.subcategoriasSeleccionadas.length;
    this.subcategoriasSeleccionadas = [];
    this.reiniciarModal();
    this.cambiosSinGuardar = false;
    this.formEncabezado.patchValue({ maquinas: null }, { emitEvent: false });
    this.formEncabezado.get('maquinas')!.markAsUntouched();
    this.distribucion = [];
    this.cargarMaquinas();
    if (quitadas > 0) this.mensajeService.mensajeAdvertencia(`Advertencia`, `Se quitaron ${quitadas} subcategoría(s) agregadas porque pertenecían al proceso anterior.`);
  }

  // ───────────────────────── Máquinas y distribución ─────────────────────────

  /** Indica si la máquina está elegida (botón en rojo con ✓). */
  maquinaElegida(maquina: number): boolean {
    return (this.formEncabezado.value.maquinas ?? []).includes(Number(maquina));
  }

  /** Elige o quita una máquina con su botón. Sin máquinas el valor queda en null (campo obligatorio vacío). */
  alternarMaquina(maquina: number) {
    const control = this.formEncabezado.get('maquinas')!;
    const actuales: number[] = control.value ?? [];
    const numero = Number(maquina);
    const nuevas = actuales.includes(numero) ? actuales.filter(m => m !== numero) : [...actuales, numero].sort((a, b) => a - b);
    control.setValue(nuevas.length > 0 ? nuevas : null);
    control.markAsTouched();
  }

  /** Máquinas obligatorias sin elegir después de que el usuario tocó el campo o intentó continuar (se marca en rojo). */
  get maquinasPendientes(): boolean {
    const control = this.formEncabezado.get('maquinas')!;
    return control.invalid && control.touched;
  }

  /**
   * Sincroniza la distribución con las máquinas elegidas. Si cambia el conjunto de máquinas, el total se reparte
   * en partes iguales; el usuario luego ajusta las proporciones.
   */
  cambiarMaquinas(valor: number[] | null) {
    // Se usa el valor recibido: cuando el control avisa, el valor del formulario completo todavía no se ha actualizado.
    const elegidas: number[] = [...(valor ?? [])].map(Number).sort((a, b) => a - b);
    const actuales = this.distribucion.map(d => d.Maquina);
    if (elegidas.length === actuales.length && elegidas.every(m => actuales.includes(m))) return;
    this.distribucion = elegidas.map(m => ({ Maquina: m, Porcentaje: 0, Kg: 0 }));
    this.repartirIguales();
    this.cambiosSinGuardar = true;
  }

  /** Reparte el 100% en partes iguales; la última máquina se queda con el residuo del redondeo. */
  repartirIguales() {
    const n = this.distribucion.length;
    if (n === 0) return;
    const base = Math.floor(10000 / n) / 100;
    this.distribucion.forEach((d, i) => d.Porcentaje = i === n - 1 ? redondear2(100 - base * (n - 1)) : base);
    this.actualizarKgDistribucion();
  }

  /** Recalcula la parte de cada máquina cuando cambia el total solicitado. */
  private actualizarKgDistribucion() {
    const total = this.totalSolicitado;
    this.distribucion.forEach(d => d.Kg = redondear2(total * d.Porcentaje / 100));
  }

  /**
   * Cambia el porcentaje de una máquina. Con dos máquinas la otra se ajusta sola para completar el 100%.
   * @param fila Máquina editada.
   * @param valor Porcentaje digitado.
   */
  cambiarPorcentaje(fila: MaquinaDistribucion, valor: number | null) {
    fila.Porcentaje = redondear2(Math.min(100, Math.max(0, valor ?? 0)));
    const otra = this.otraMaquina(fila);
    if (otra) otra.Porcentaje = redondear2(100 - fila.Porcentaje);
    this.actualizarKgDistribucion();
    this.cambiosSinGuardar = true;
  }

  /**
   * Cambia la cantidad de una máquina y calcula su porcentaje sobre el total. Con dos máquinas la otra recibe el resto.
   * @param fila Máquina editada.
   * @param valor Cantidad digitada.
   */
  cambiarKg(fila: MaquinaDistribucion, valor: number | null) {
    const total = this.totalSolicitado;
    if (total <= 0) return;
    fila.Kg = redondear2(Math.min(total, Math.max(0, valor ?? 0)));
    fila.Porcentaje = redondear2(fila.Kg / total * 100);
    const otra = this.otraMaquina(fila);
    if (otra) {
      otra.Kg = redondear2(total - fila.Kg);
      otra.Porcentaje = redondear2(100 - fila.Porcentaje);
    }
    this.cambiosSinGuardar = true;
  }

  /** Con exactamente dos máquinas, la que no se está editando; si no, null. */
  private otraMaquina = (fila: MaquinaDistribucion): MaquinaDistribucion | null =>
    this.distribucion.length === 2 ? this.distribucion.find(d => d !== fila) ?? null : null;

  /** Suma de los porcentajes de la distribución. */
  get sumaPorcentajes(): number {
    return redondear2(this.distribucion.reduce((total, d) => total + Number(d.Porcentaje || 0), 0));
  }

  /** La distribución suma 100% y ninguna máquina queda en cero. */
  get distribucionValida(): boolean {
    return this.distribucion.length > 0 && this.sumaPorcentajes === 100 && this.distribucion.every(d => d.Porcentaje > 0);
  }

  // ───────────────────────── Orden de trabajo ─────────────────────────

  /**
   * Deja solo dígitos en el campo (OT o N° de solicitud): borra letras, símbolos y espacios al escribir o pegar.
   * @param event Evento input del campo.
   * @param control Nombre del control del encabezado.
   */
  soloDigitos(event: Event, control: 'ot' | 'Solicitud') {
    const input = event.target as HTMLInputElement;
    const limpio = input.value.replace(/\D/g, '');
    if (limpio === input.value) return;
    const cursor = Math.max((input.selectionStart ?? limpio.length) - (input.value.length - limpio.length), 0);
    this.formEncabezado.get(control)!.setValue(limpio);
    input.value = limpio;
    input.setSelectionRange(cursor, cursor);
  }

  /**
   * Consulta la OT del campo (Enter). En edición la OT es la de la solicitud y no se cambia.
   * No se consulta mientras hay una carga en curso (p. ej. el guardado, que usa los datos de la OT consultada).
   * Si ya hay subcategorías agregadas para otra OT, pregunta si se conservan o se quitan antes de consultar.
   */
  consultarOT() {
    if (this.esSolicitud || this.load) return;
    const texto = (this.formEncabezado.value.ot ?? '').toString().trim();
    if (!/^\d+$/.test(texto)) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `Digite un número de OT válido!`);
    this.formEncabezado.patchValue({ ot: texto });
    const ot = Number(texto);

    const otAnterior = this.otDeLosMateriales;
    const cantidad = this.subcategoriasSeleccionadas.length;
    if (cantidad === 0 || otAnterior == null || otAnterior === ot) return this.cargarOT(ot);

    this.confirmar('Cambiar de OT',
      `Hay ${cantidad} subcategoría(s) agregadas para la OT N° ${otAnterior}. ¿Desea conservarlas para la OT N° ${ot} o quitarlas junto con las máquinas y la fecha de entrega para empezar de nuevo?`,
      () => this.cargarOT(ot),
      'Conservar y consultar', 'Quitar y consultar',
      // Quitar: también se limpian las máquinas y la fecha de entrega para armar la solicitud desde cero (la observación se conserva).
      () => {
        this.subcategoriasSeleccionadas = [];
        this.reiniciarModal();
        this.formEncabezado.patchValue({ maquinas: null, fechaEntrega: null }, { emitEvent: false });
        this.formEncabezado.get('maquinas')!.markAsUntouched();
        this.formEncabezado.get('fechaEntrega')!.markAsUntouched();
        this.distribucion = [];
        this.cargarOT(ot);
      },
      // Esc o la X: no se consulta y el campo vuelve a la OT que se ve en la tabla.
      () => { if (this.infoOT) this.formEncabezado.patchValue({ ot: String(this.infoOT.ot) }); });
  }

  /**
   * Consulta la OT en BagPro y lo asignado y solicitado pendiente de la OT para calcular lo que queda por solicitar.
   * Si había otra consulta de OT en curso, se cancela.
   */
  private cargarOT(ot: number) {
    this.consultaOT?.unsubscribe();
    this.infoOrdenTrabajo = [];
    this.consultaOT = this.bagProServices.srvObtenerListaClienteOT_Item(ot).pipe(
      switchMap(datos => datos.length == 0
        ? of(null)
        : this.detallesAsignacionService.getMateriasPrimaSolicitada(ot).pipe(map(asig => ({ datos: datos[0], asig })))),
      this.conCarga(),
      takeUntil(this.destroy$),
    ).subscribe({
      next: resultado => resultado
        ? this.mostrarInfoOT(ot, resultado.datos, resultado.asig)
        : this.mensajeService.mensajeAdvertencia(`Advertencia`, `La OT N° ${ot} no existe!`),
      error: error => this.notificarError(error, `No se pudo consultar la OT N° ${ot}.`, 'Consultar OT'),
    });
  }

  /** Llena la tabla de la OT y avisa si está cerrada o cuántos kg quedan por solicitar. */
  private mostrarInfoOT(ot: number, datos: any, asig: any) {
    const kg = redondear2(datos.datosotKg * (1 + ADICIONAL_KG_OT));
    const kgRestante = kg - asig.cantidad_Asignada;
    const info: InfoOrdenTrabajo = {
      ot,
      cliente: datos.clienteNom,
      item: datos.clienteItems,
      ref: datos.clienteItemsNom,
      kgReal: datos.datosotKg,
      kg,
      kgSolicitados: asig.cantidad_Solicitada,
      kgAsignado: asig.cantidad_Asignada,
      kgRestante,
      kgPorSolicitar: kgRestante - asig.cantidad_Solicitada,
      cerrada: ESTADOS_OT_CERRADA.includes(Number(datos.estado)),
    };
    this.infoOrdenTrabajo = [info];
    this.otDeLosMateriales = ot;

    if (info.cerrada) {
      this.mensajeService.mensajeAdvertencia(`Advertencia`, `La OT N° ${ot} está cerrada, no se le pueden crear ni editar solicitudes!`, DURACION_ERROR_MS);
    } else if (!this.solicitaMateriaPrima) {
      this.mensajeService.mensajeInformacion(`Información`, `OT N° ${ot} consultada. Las tintas no cuentan para el límite de kg de la OT.`);
    } else if (info.kgPorSolicitar > TOLERANCIA_KG) {
      this.mensajeService.mensajeConfirmacion(`OT N° ${ot}`, `Tiene ${formatoNumero(info.kgPorSolicitar)} kg restantes por solicitar.`);
    } else {
      this.mensajeService.mensajeAdvertencia(`Advertencia`, `La OT N° ${ot} no tiene kg restantes por solicitar.`);
    }
  }

  /** Abre el popup y consulta el detalle de los materiales asignados (y devueltos) a la OT consultada. */
  verMaterialesAsignados(ot: number) {
    if ((this.infoOT?.kgAsignado ?? 0) <= TOLERANCIA_KG) {
      return this.mensajeService.mensajeInformacion(`Información`, `Aún no hay materiales asignados a la OT N° ${ot}.`);
    }
    this.materialesAsignados = [];
    this.mostrarMaterialesAsignados = true;
    this.cargandoMaterialesAsignados = true;
    this.detallesAsignacionService.getMaterialesAsignadosOT(ot)
      .pipe(takeUntil(this.destroy$), finalize(() => this.cargandoMaterialesAsignados = false))
      .subscribe({
        next: datos => this.materialesAsignados = datos,
        error: error => this.notificarError(error, `No se pudieron consultar los materiales asignados a la OT N° ${ot}.`, 'Consultar materiales asignados a la OT'),
      });
  }

  /** Cantidad neta de los materiales del popup: lo asignado menos lo devuelto. */
  get totalCantidadMaterialesAsignados(): number {
    return this.materialesAsignados.reduce((total, m) => total + (m.esDevolucion ? -m.cantidad : m.cantidad), 0);
  }

  /**
   * Genera el PDF de la OT consultada (mismo formato de la página Orden de Trabajo). Muestra el aviso de éxito,
   * espera unos segundos para que se pueda leer y luego lo abre en una pestaña nueva.
   */
  exportarPdfOT() {
    const ot = this.infoOT?.ot;
    if (ot == null) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `Debe consultar una OT para exportarla en PDF!`);
    if (!this.otVigente) {
      const enCampo = (this.formEncabezado.value.ot ?? '').toString().trim();
      return this.mensajeService.mensajeAdvertencia(`Advertencia`, `La OT del campo (${enCampo || 'vacío'}) no es la consultada (N° ${ot}). Presione Enter para consultarla antes de exportar.`);
    }

    // El cargando se mantiene desde la consulta de la OT hasta que el PDF termina de generarse.
    let otEncontrada = false;
    this.servicioPDF.obtenerDatosOrdenTrabajo(ot).pipe(
      switchMap(datos => {
        otEncontrada = true;
        return datos ? this.servicioPDF.generarBlobOrdenTrabajo(datos, this.storage_Nombre) : of(null);
      }),
      this.conCarga(),
      takeUntil(this.destroy$),
    ).subscribe({
      next: pdf => pdf
        ? this.abrirPdfOTConAviso(pdf, ot)
        : this.mensajeService.mensajeAdvertencia(`Advertencia`, `No se encontró información para generar el PDF de la OT N° ${ot}!`),
      error: error => this.notificarError(error, otEncontrada
        ? `No fue posible generar el PDF de la OT N° ${ot}.`
        : `No se encontró la OT N° ${ot} para generar el PDF.`, 'Generar PDF de la OT'),
    });
  }

  /**
   * Muestra el aviso de éxito y, pasados unos segundos, abre el PDF en una pestaña nueva. Si el navegador
   * bloquea la pestaña (ventanas emergentes), lo descarga para que el usuario no se quede sin el documento.
   */
  private abrirPdfOTConAviso(pdf: Blob, ot: number) {
    this.abriendoPdfOT = true;
    this.abrirPdfConAviso(pdf, `El PDF de la orden de trabajo N° ${ot}`, `OT ${ot}.pdf`, () => this.abriendoPdfOT = false);
  }

  /**
   * Aviso "se generó correctamente" y, pasados unos segundos, abre el PDF en una pestaña nueva. Si el navegador
   * bloquea la pestaña (ventanas emergentes), lo descarga para que el usuario no se quede sin el documento.
   * @param documento Cómo se nombra en el aviso (p. ej. "El PDF de la solicitud N° 10").
   * @param archivo Nombre del archivo si hay que descargarlo.
   * @param alAbrir Se ejecuta cuando se abre (o descarga) el PDF.
   */
  private abrirPdfConAviso(pdf: Blob, documento: string, archivo: string, alAbrir?: () => void) {
    this.mensajeService.mensajeConfirmacion('¡PDF generado!',
      `${documento} se generó correctamente. A continuación se abrirá en una nueva pestaña.`,
      ESPERA_ABRIR_PDF_OT_SEG * 1000 + 500);

    const url = URL.createObjectURL(pdf);
    setTimeout(() => {
      alAbrir?.();
      const pestana = window.open(url, '_blank');
      if (!pestana) {
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = archivo;
        enlace.click();
        this.mensajeService.mensajeAdvertencia(`Advertencia`, `El navegador bloqueó la pestaña nueva, por eso el PDF se descargó (${archivo}). Puede permitir las ventanas emergentes para este sitio.`, DURACION_ERROR_MS);
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    }, ESPERA_ABRIR_PDF_OT_SEG * 1000);
  }

  // ───────────────────────── Modal "Agregar subcategoría" ─────────────────────────

  /**
   * Abre el modal al instante en la lista de subcategorías del proceso.
   * - La primera vez (o si cambió el proceso) muestra filas de relleno mientras consulta.
   * - Si ya tiene el catálogo del proceso, lo muestra de inmediato y actualiza el stock en segundo plano.
   */
  abrirAgregarSubcategoria() {
    if (!this.encabezadoCompleto) {
      this.ultimoAvisoEncabezado = 0;
      return this.avisarEncabezadoIncompleto();
    }
    const proceso: string = this.formEncabezado.value.proceso;
    const tieneCatalogo = this.procesoMateriales === proceso && this.subcategoriasModal.length > 0;
    if (!tieneCatalogo) {
      this.subcategoriasModal = [];
      this.materialesProceso = [];
      this.subcategoriaModal = null;
    }
    this.limpiarBusqueda('subcategorias');
    this.panelModal = 'subcategorias';
    this.mostrarAgregar = true;
    this.cargarCatalogoModal(proceso, !tieneCatalogo);
  }

  /** Abre la ventana "Detalles del error" del error de la primera carga del modal. */
  verDetallesErrorCatalogo() {
    if (this.detalleErrorCatalogoModal) this.mensajeService.verDetalles(this.detalleErrorCatalogoModal);
  }

  /** Reintenta la consulta del catálogo después de un error dentro del modal. */
  reintentarCatalogoModal() {
    this.cargarCatalogoModal(this.formEncabezado.value.proceso, true);
  }

  /**
   * Consulta los materiales del proceso y arma las subcategorías del modal con su stock y su disponible.
   * @param proceso Proceso del encabezado.
   * @param mostrarCarga true muestra las filas de relleno (no hay nada que mostrar todavía); false actualiza en segundo plano.
   */
  private cargarCatalogoModal(proceso: string, mostrarCarga: boolean) {
    this.consultaCatalogo?.unsubscribe();
    this.errorCatalogoModal = null;
    this.detalleErrorCatalogoModal = null;
    this.cargandoCatalogoModal = mostrarCarga;
    this.consultaCatalogo = this.materiaPrimaService.getSubcategories(proceso)
      .pipe(takeUntil(this.destroy$), finalize(() => this.cargandoCatalogoModal = false))
      .subscribe({
        next: datos => this.aplicarCatalogoModal(proceso, datos),
        error: error => {
          const porDefecto = `No se pudieron consultar las subcategorías del proceso ${proceso}.`;
          // Primera carga: el error se ve dentro del modal (con "Reintentar" y "Ver detalles"); si ya había datos, solo se avisa.
          if (mostrarCarga) {
            const api = MensajesAplicacionService.apiDeUrl(error?.url);
            this.errorCatalogoModal = MensajesAplicacionService.mensajeAmigable(error, porDefecto, api);
            this.detalleErrorCatalogoModal = MensajesAplicacionService.detalleDeError(error, { api, operacion: 'Consultar subcategorías y materiales del proceso', metodo: 'GET' });
          } else {
            this.notificarError(error, 'No se pudo actualizar el stock; se muestra el de la consulta anterior.', 'Actualizar stock de subcategorías');
          }
        },
      });
  }

  /** Arma las subcategorías del modal; conserva el disponible ya consultado y la subcategoría abierta. */
  private aplicarCatalogoModal(proceso: string, datos: any[]) {
    const disponiblesPrevios = new Map<number, number | null>(this.subcategoriasModal.map(s => [s.id_Subcategoria, s.disponible]));
    this.procesoMateriales = proceso;
    this.materialesProceso = datos.filter(m => m.id_Subcategoria != null);
    const porSubcategoria = new Map<number, any>();
    this.materialesProceso.forEach(material => {
      const existente = porSubcategoria.get(material.id_Subcategoria);
      if (existente) existente.stock += material.stock;
      else porSubcategoria.set(material.id_Subcategoria, {
        id_Subcategoria: material.id_Subcategoria,
        subcategoria: material.subcategoria,
        stock: material.stock,
        disponible: disponiblesPrevios.get(material.id_Subcategoria) ?? null,
      });
    });
    this.subcategoriasModal = [...porSubcategoria.values()].sort((a, b) => Number(b.stock) - Number(a.stock));

    // Si el usuario ya entró a los materiales de una subcategoría, se refrescan sin sacarlo de ahí.
    if (this.subcategoriaModal) {
      const abierta = porSubcategoria.get(this.subcategoriaModal.id_Subcategoria);
      if (abierta) {
        this.subcategoriaModal = abierta;
        if (this.panelModal === 'materiales') this.materialesModal = this.materialesDe(abierta.id_Subcategoria);
      }
    }
    this.cargarDisponibles(this.subcategoriasModal, s => s.id_Subcategoria, (s, disponible) => s.disponible = disponible ?? s.stock);
  }

  /** Materiales del proceso de una subcategoría, de mayor a menor stock. */
  private materialesDe(subcategoriaId: number): any[] {
    return this.materialesProceso
      .filter(m => m.id_Subcategoria == subcategoriaId)
      .sort((a, b) => Number(b.stock) - Number(a.stock));
  }

  /**
   * Consulta el disponible informativo de varias filas y lo asigna con la función indicada.
   * @param filas Filas a completar.
   * @param idDe Obtiene el Id de subcategoría de una fila.
   * @param asignar Asigna el disponible (undefined si el API no lo devolvió).
   */
  private cargarDisponibles<T>(filas: T[], idDe: (fila: T) => number, asignar: (fila: T, disponible: number | undefined) => void) {
    const ids = filas.map(idDe).filter(id => id != null);
    if (ids.length == 0) return;
    this.servicioSolicitudMpExt.getReservas(ids).pipe(takeUntil(this.destroy$)).subscribe({
      next: reservas => {
        const disponibles = new Map(reservas.map(r => [r.subCatMP_Id, r.disponible]));
        filas.forEach(f => asignar(f, disponibles.get(idDe(f))));
      },
      error: error => this.notificarError(error, 'No se pudo consultar el disponible de las subcategorías.', 'Consultar disponible de subcategorías'),
    });
  }

  /** Pasa al panel de materiales de la subcategoría elegida (se desliza a la izquierda). */
  verMaterialesDe(subcategoria: any) {
    this.subcategoriaModal = subcategoria;
    this.limpiarBusqueda('materiales');
    this.materialMarcado = null;
    this.materialesModal = this.materialesDe(subcategoria.id_Subcategoria);
    this.panelModal = 'materiales';
  }

  /**
   * Esc dentro del modal "Agregar subcategoría": en los materiales hace lo mismo que el botón Volver;
   * en las subcategorías cierra el modal (con la misma confirmación si hay cantidades sin agregar).
   * No actúa si encima hay una confirmación, la ventana "Detalles del error" o el tutorial: ahí Esc cierra eso.
   */
  @HostListener('document:keydown.escape', ['$event'])
  alPresionarEscape(event: Event) {
    if (!this.mostrarAgregar || this.tutoriales.activo || this.mensajeService.detalleVisible) return;
    if (document.querySelector('.p-confirm-dialog')) return;
    event.preventDefault();
    if (this.panelModal === 'materiales') this.volverASubcategorias();
    else this.cerrarModalAgregar();
  }

  /**
   * Enter en la lista de subcategorías hace lo mismo que el botón Listo, cuando la solicitud ya tiene materiales.
   * No actúa sobre una fila, el buscador u otro control (ahí Enter tiene su propia acción), ni con algo abierto encima.
   */
  @HostListener('document:keydown.enter', ['$event'])
  alPresionarEnter(event: KeyboardEvent) {
    if (!this.mostrarAgregar || this.panelModal !== 'subcategorias' || this.subcategoriasSeleccionadas.length === 0) return;
    if (this.tutoriales.activo || this.mensajeService.detalleVisible || document.querySelector('.p-confirm-dialog')) return;
    const objetivo = event.target as HTMLElement | null;
    if (objetivo?.closest('input, textarea, select, button, a[href], tr[tabindex]')) return;
    event.preventDefault();
    this.cerrarModalAgregar();
  }

  /** Vuelve a la lista de subcategorías; la elegida queda resaltada y las cantidades escritas se conservan. */
  volverASubcategorias() {
    // El foco no se queda en un campo del panel de materiales (ya oculto): así el siguiente Enter funciona como "Listo".
    (document.activeElement as HTMLElement | null)?.blur();
    this.panelModal = 'subcategorias';
    this.materialMarcado = null;
  }

  /**
   * Marca el material y pasa el cursor a su cantidad.
   * @param material Material de la fila.
   */
  marcarMaterial(material: any) {
    this.materialMarcado = material.item;
    this.enfocar(`cantMat${material.item}`);
  }

  /** Cantidad ya agregada a la solicitud de una subcategoría (para la etiqueta del modal). */
  cantidadEnSolicitud = (subcategoria: number | undefined): number =>
    this.subcategoriasSeleccionadas.find(s => s.Id === subcategoria)?.Cantidad ?? 0;

  /** Cantidad ya agregada a la solicitud de un material del proceso. */
  cantidadMaterialEnSolicitud = (item: number): number =>
    this.subcategoriasSeleccionadas.flatMap(s => s.Materiales).find(m => m.Id === item && m.TipoMaterial === this.tipoMaterial)?.Cantidad ?? 0;

  /** Materiales de la subcategoría abierta con una cantidad escrita mayor a cero. */
  private get materialesConCantidad(): any[] {
    return this.materialesModal.filter(m => redondear2(this.borrador[m.item] ?? 0) > 0);
  }

  /** Resumen de lo escrito en la subcategoría abierta: cuántos materiales y cuánto suman. */
  get resumenBorrador(): { cantidad: number; total: number } {
    const conCantidad = this.materialesConCantidad;
    return { cantidad: conCantidad.length, total: redondear2(conCantidad.reduce((t, m) => t + Number(this.borrador[m.item]), 0)) };
  }

  /** Total escrito en todo el modal que aún no se agrega (todas las subcategorías). */
  private get totalSinAgregar(): number {
    return Object.values(this.borrador).filter(v => redondear2(v ?? 0) > 0).length;
  }

  /**
   * Agrega a la solicitud los materiales con cantidad de la subcategoría abierta. Si un material ya estaba,
   * se suma a lo que tenía; si la subcategoría ya estaba, se le agregan los materiales. Luego vuelve a la lista.
   */
  agregarBorrador() {
    const subcategoria = this.subcategoriaModal;
    const elegidos = this.materialesConCantidad;
    if (!subcategoria || elegidos.length === 0) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `Escriba la cantidad de al menos un material.`);

    let fila = this.subcategoriasSeleccionadas.find(s => s.Id === subcategoria.id_Subcategoria);
    const unidad = fila && !fila.SinMateriales ? fila.Und_Medida : (elegidos[0].undMed_Id ?? 'Kg');
    const otraUnidad = elegidos.find(m => (m.undMed_Id ?? 'Kg') !== unidad);
    if (otraUnidad) {
      return this.mensajeService.mensajeAdvertencia(`Advertencia`,
        `La subcategoría ${subcategoria.subcategoria} se pide en ${unidad} y el material ${otraUnidad.referencia} está en ${otraUnidad.undMed_Id}. Agréguelos por separado.`, DURACION_ERROR_MS);
    }

    if (!fila) {
      fila = {
        Id: subcategoria.id_Subcategoria,
        Nombre: subcategoria.subcategoria,
        Cantidad: 0,
        Und_Medida: unidad,
        Disponible: subcategoria.disponible ?? null,
        Cantidad_Entregada: 0,
        Cantidad_Faltante: 0,
        FaltanteOriginal: 0,
        Materiales: [],
        SinMateriales: false,
      };
      this.subcategoriasSeleccionadas = [...this.subcategoriasSeleccionadas, fila];
    } else if (fila.SinMateriales) {
      // Subcategoría de una solicitud anterior: desde ahora su cantidad es la suma de sus materiales.
      this.mensajeService.mensajeAdvertencia(`Advertencia`,
        `${fila.Nombre} se había pedido sin materiales (${formatoNumero(fila.Cantidad)}); desde ahora su cantidad es la suma de los materiales agregados.`, DURACION_ERROR_MS);
      fila.SinMateriales = false;
      fila.Und_Medida = unidad;
    }

    const totalAgregado = redondear2(elegidos.reduce((t, m) => t + Number(this.borrador[m.item]), 0));
    const sumados: string[] = [];
    elegidos.forEach(m => {
      const cantidad = redondear2(Number(this.borrador[m.item]));
      const existente = fila!.Materiales.find(x => x.Id === m.item);
      if (existente) {
        sumados.push(`${existente.Nombre}: ${formatoNumero(existente.Cantidad)} + ${formatoNumero(cantidad)} = ${formatoNumero(redondear2(existente.Cantidad + cantidad))}`);
        existente.Cantidad = redondear2(existente.Cantidad + cantidad);
      } else {
        fila!.Materiales.push({
          TipoMaterial: this.tipoMaterial,
          Id: m.item,
          Nombre: m.referencia,
          Cantidad: cantidad,
          Und_Medida: m.undMed_Id ?? unidad,
          Stock: m.stock,
          Entregado: 0,
        });
      }
      delete this.borrador[m.item];
    });

    this.recalcularFila(fila);
    this.cambiosSinGuardar = true;
    // Confirmación dentro del popup (pie y fila iluminada) en vez de un toast que tapa la lista.
    this.mostrarAgregado(subcategoria.id_Subcategoria,
      `${subcategoria.subcategoria}: ${elegidos.length} material(es) por ${formatoNumero(totalAgregado)} · queda en ${formatoNumero(fila.Cantidad)} ${fila.Und_Medida}`
      + (sumados.length > 0 ? ' (se sumó a lo que ya tenía)' : ''),
      sumados.length > 0 ? `Se sumaron a lo que ya tenía: ${sumados.join('; ')}.` : '');
    this.volverASubcategorias();
  }

  /**
   * Muestra unos segundos en el pie del popup lo que se acaba de agregar e ilumina la fila de la subcategoría.
   * @param subcategoriaId Fila que se ilumina.
   * @param texto Resumen corto.
   * @param detalle Texto del tooltip (p. ej. los materiales que se sumaron).
   */
  private mostrarAgregado(subcategoriaId: number, texto: string, detalle: string) {
    clearTimeout(this.temporizadorAgregado);
    this.ultimoAgregado = { subcategoriaId, texto, detalle };
    this.temporizadorAgregado = setTimeout(() => this.ultimoAgregado = null, DURACION_AVISO_AGREGADO_MS);
  }

  /** Cierra el modal; si quedaron cantidades escritas sin agregar, pide confirmar. */
  cerrarModalAgregar() {
    const pendientes = this.totalSinAgregar;
    if (pendientes === 0) {
      this.mostrarAgregar = false;
      return;
    }
    this.confirmar('Cantidades sin agregar', `Hay ${pendientes} material(es) con cantidad escrita que no se han agregado a la solicitud. ¿Desea cerrar y descartarlos?`, () => {
      this.borrador = {};
      this.mostrarAgregar = false;
    }, 'Descartar y cerrar', 'Seguir editando');
  }

  /** Al cerrarse el modal (por la X o Esc) se descartan las cantidades no agregadas y vuelve a la lista. */
  alCerrarModalAgregar() {
    this.borrador = {};
    this.panelModal = 'subcategorias';
    this.materialMarcado = null;
  }

  /**
   * Limpia el estado del modal (al cambiar de proceso o limpiar la página). El catálogo se conserva porque se guarda
   * por proceso: si el proceso cambia, al abrir el modal se consulta de nuevo.
   */
  private reiniciarModal() {
    this.consultaCatalogo?.unsubscribe();
    this.cargandoCatalogoModal = false;
    this.errorCatalogoModal = null;
    this.detalleErrorCatalogoModal = null;
    this.borrador = {};
    this.subcategoriaModal = null;
    this.materialesModal = [];
    this.panelModal = 'subcategorias';
  }

  /** Borra la búsqueda de un panel del modal y quita su filtro de la tabla. */
  private limpiarBusqueda(panel: 'subcategorias' | 'materiales') {
    if (panel === 'subcategorias') {
      this.busquedaSubcategoria = '';
      this.tablaSubcategorias?.filterGlobal('', 'contains');
    } else {
      this.busquedaMaterial = '';
      this.tablaMateriales?.filterGlobal('', 'contains');
    }
  }

  /** Selecciona todo el contenido del input clicado, para reemplazar el valor sin tener que borrarlo. */
  seleccionarContenido(event: MouseEvent) {
    const input = event.target;
    if (input instanceof HTMLInputElement && !input.readOnly) input.select();
  }

  /**
   * Advierte qué falta del encabezado para agregar subcategorías. Mientras el aviso sigue visible no se repite.
   */
  private avisarEncabezadoIncompleto() {
    const ahora = Date.now();
    if (ahora - this.ultimoAvisoEncabezado < 3000) return;
    this.ultimoAvisoEncabezado = ahora;

    const encabezado = this.formEncabezado.value;
    if (!encabezado.proceso) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `Debe seleccionar un proceso para agregar subcategorías!`);
    if (this.otVigente && this.infoOT!.cerrada) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `La OT N° ${this.infoOT!.ot} está cerrada, no se le pueden solicitar materiales!`);

    const faltantes: string[] = [];
    if (!this.otVigente) faltantes.push('consultar la OT (Enter)');
    if (!encabezado.fechaEntrega) faltantes.push('elegir la fecha de entrega');
    if (!encabezado.maquinas?.length) {
      faltantes.push('seleccionar al menos una máquina');
      this.formEncabezado.get('maquinas')!.markAsTouched();
    }
    const detalle = faltantes.length > 0
      ? (faltantes.length > 1 ? `${faltantes.slice(0, -1).join(', ')} y ${faltantes[faltantes.length - 1]}` : faltantes[0])
      : 'completar el encabezado';
    this.mensajeService.mensajeAdvertencia(`Advertencia`, `Debe ${detalle} para agregar subcategorías!`);
  }

  // ───────────────────────── Tabla de subcategorías solicitadas ─────────────────────────

  /** Recalcula la cantidad de la subcategoría (suma de sus materiales), su faltante y la distribución por máquina. */
  private recalcularFila(fila: SubcategoriaSolicitada) {
    if (!fila.SinMateriales) fila.Cantidad = redondear2(fila.Materiales.reduce((t, m) => t + Number(m.Cantidad || 0), 0));
    fila.Cantidad_Faltante = redondear2(this.pendienteFila(fila));
    this.actualizarKgDistribucion();
  }

  /**
   * Cambia la cantidad de un material de la tabla y recalcula su subcategoría.
   * @param fila Subcategoría del material.
   * @param material Material editado.
   * @param valor Cantidad digitada.
   */
  cambiarCantidadMaterial(fila: SubcategoriaSolicitada, material: MaterialSolicitado, valor: number | null) {
    material.Cantidad = redondear2(valor ?? 0);
    this.recalcularFila(fila);
    this.cambiosSinGuardar = true;
  }

  /** Cambia la cantidad de una subcategoría de una solicitud anterior (sin materiales). */
  cambiarCantidad(fila: SubcategoriaSolicitada, valor: number | null) {
    fila.Cantidad = redondear2(valor ?? 0);
    this.recalcularFila(fila);
    this.cambiosSinGuardar = true;
  }

  /** Pide confirmar antes de quitar una subcategoría con todos sus materiales. */
  pedirQuitarSubcategoria(fila: SubcategoriaSolicitada) {
    if (fila.Cantidad_Entregada > 0) {
      return this.mensajeService.mensajeAdvertencia('Advertencia', `No se puede quitar ${fila.Nombre} porque ya tiene ${formatoNumero(fila.Cantidad_Entregada)} entregados.`);
    }
    this.confirmar('Quitar subcategoría', `¿Está seguro que desea quitar ${fila.Nombre} y sus ${fila.Materiales.length} material(es) de la solicitud?`, () => {
      this.subcategoriasSeleccionadas = this.subcategoriasSeleccionadas.filter(x => x.Id !== fila.Id);
      this.actualizarKgDistribucion();
      this.cambiosSinGuardar = true;
    }, 'Quitar');
  }

  /** Pide confirmar antes de quitar un material. Si es el último de la subcategoría, se quita la subcategoría. */
  pedirQuitarMaterial(fila: SubcategoriaSolicitada, material: MaterialSolicitado) {
    if (fila.Materiales.length === 1) return this.pedirQuitarSubcategoria(fila);
    const quedaria = redondear2(fila.Cantidad - material.Cantidad);
    if (quedaria < fila.Cantidad_Entregada) {
      return this.mensajeService.mensajeAdvertencia('Advertencia', `No se puede quitar ${material.Nombre}: ${fila.Nombre} quedaría en ${formatoNumero(quedaria)}, por debajo de lo entregado (${formatoNumero(fila.Cantidad_Entregada)}).`);
    }
    this.confirmar('Quitar material', `¿Está seguro que desea quitar ${material.Nombre} de ${fila.Nombre}?`, () => {
      fila.Materiales = fila.Materiales.filter(m => m !== material);
      this.recalcularFila(fila);
      this.cambiosSinGuardar = true;
    }, 'Quitar');
  }

  // ───────────────────────── Guardar ─────────────────────────

  /** Valida el encabezado, la tabla, la distribución y el límite de la OT antes de crear o editar la solicitud. */
  validarYGuardarSolicitud() {
    if (this.load) return;
    if (!this.otVigente) return this.mensajeService.mensajeAdvertencia(`Advertencia`, 'Debe consultar la OT (Enter) antes de guardar la solicitud!');
    if (this.infoOT!.cerrada) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `No es posible crear/editar solicitudes a la OT ${this.infoOT!.ot}, porque está cerrada!`);
    if (!this.formEncabezado.value.fechaEntrega) return this.mensajeService.mensajeAdvertencia(`Advertencia`, 'Debe elegir la fecha de entrega del material!');
    if (!this.formEncabezado.valid) return this.mensajeService.mensajeAdvertencia(`Advertencia`, 'Debe llenar los campos vacíos del encabezado (proceso y máquinas)!');
    if (this.subcategoriasSeleccionadas.length == 0) return this.mensajeService.mensajeAdvertencia(`Advertencia`, 'Debe agregar mínimo una subcategoría para guardar la solicitud!');

    const materialEnCero = this.subcategoriasSeleccionadas.flatMap(s => s.Materiales.map(m => ({ s, m }))).find(x => !(x.m.Cantidad > 0));
    if (materialEnCero) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `La cantidad de ${materialEnCero.m.Nombre} (${materialEnCero.s.Nombre}) debe ser mayor a cero; si no lo necesita, quítelo.`);

    const invalida = this.subcategoriasSeleccionadas.find(x => !(redondear2(x.Cantidad) > 0) || redondear2(x.Cantidad) < Number(x.Cantidad_Entregada));
    if (invalida) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `La cantidad de ${invalida.Nombre} debe ser mayor a cero y no puede ser menor a lo entregado (${invalida.Cantidad_Entregada}).`);

    if (!this.distribucionValida) {
      return this.mensajeService.mensajeAdvertencia(`Advertencia`, `La distribución por máquina debe sumar 100% y ninguna máquina puede quedar en 0% (suma ${this.sumaPorcentajes}%).`, DURACION_ERROR_MS);
    }

    this.validarLimiteOT();
  }

  /**
   * Las solicitudes de materia prima no pueden superar los kg por solicitar de la OT, salvo que un usuario con
   * permiso lo confirme. En edición solo cuenta el aumento sobre lo que ya tenía la solicitud. El API repite esta validación.
   */
  private validarLimiteOT() {
    if (!this.solicitaMateriaPrima || this.kgQuedarian >= -TOLERANCIA_KG) return this.guardarSolicitud();

    const ot = this.infoOT!.ot;
    const exceso = formatoNumero(-this.kgQuedarian);
    if (!this.puedeExcederLimite) {
      return this.mensajeService.mensajeAdvertencia(`Advertencia`, `La cantidad a solicitar supera en ${exceso} kg el límite de la OT ${ot}. Debe solicitar permisos al administrador.`, DURACION_ERROR_MS);
    }
    this.confirmar('Superar límite de la OT', `La cantidad a solicitar supera en ${exceso} kg el límite de la OT ${ot}. ¿Desea solicitar de todas formas?`,
      () => this.guardarSolicitud({ excesoLimite: true }), 'Solicitar de todas formas');
  }

  /**
   * Abre el diálogo de confirmación de la página (p-confirmDialog "confirmarSolicitud").
   * Enter acepta (el botón principal tiene el foco) y Esc o la X cancelan.
   * @param aceptar Texto del botón principal (por defecto "Continuar").
   * @param rechazar Texto del botón secundario (por defecto "Cancelar").
   * @param alRechazar Acción del botón secundario; si no se indica, ese botón no hace nada.
   * @param alCancelar Se ejecuta al cerrar con Esc o la X.
   */
  private confirmar(titulo: string, detalle: string, accion: () => void, aceptar = 'Continuar', rechazar = 'Cancelar',
    alRechazar?: () => void, alCancelar?: () => void) {
    (document.activeElement as HTMLElement | null)?.blur();
    this.confirmationService.confirm({
      key: 'confirmarSolicitud',
      header: titulo,
      message: detalle,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: aceptar,
      rejectLabel: rechazar,
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      defaultFocus: 'accept',
      accept: accion,
      reject: (tipo: ConfirmEventType) => tipo === ConfirmEventType.REJECT ? alRechazar?.() : alCancelar?.(),
    });
  }

  /** Subcategorías y materiales de la tabla en el formato del API. */
  private get detallesSolicitud(): DetalleSolicitudRequest[] {
    return this.subcategoriasSeleccionadas.map(x => ({
      SubCatMP_Id: x.Id,
      Cantidad: redondear2(x.Cantidad),
      UndMed_Id: x.Und_Medida,
      Materiales: x.SinMateriales ? null : x.Materiales.map(m => ({ TipoMaterial: m.TipoMaterial, MaterialId: m.Id, Cantidad: redondear2(m.Cantidad) })),
    }));
  }

  /**
   * Crea o edita la solicitud en una sola operación del API. Si el API pide confirmar la disponibilidad o el
   * límite de la OT, se reenvía con esa confirmación.
   * @param confirmaciones Confirmaciones que el usuario ya aceptó.
   */
  guardarSolicitud(confirmaciones: ConfirmacionesSolicitud = {}) {
    const form = this.formEncabezado.value;
    const info = this.infoOT!;
    const comunes = {
      Maquinas: this.distribucion.map(d => ({ Maquina: d.Maquina, Porcentaje: redondear2(d.Porcentaje) })),
      Observacion: form.observacion || undefined,
      FechaEstimadaEntrega: moment(form.fechaEntrega).format('YYYY-MM-DD'),
      ConfirmarSaldoNegativo: !!confirmaciones.saldoNegativo,
      LimiteKgOT: this.solicitaMateriaPrima ? info.kg : null,
      ConfirmarExcesoLimite: !!confirmaciones.excesoLimite,
      Detalles: this.detallesSolicitud,
    };
    const operacion = this.esSolicitud
      ? this.servicioSolicitudMpExt.editarSolicitud(this.solicitudEnEdicion!, comunes)
      : this.servicioSolicitudMpExt.crearSolicitud({ ...comunes, OrdenTrabajo: info.ot, ProcesoId: form.proceso });

    operacion.pipe(this.conCarga(), takeUntil(this.destroy$)).subscribe({
      next: datos => this.solicitudExitosa(datos.solMpExt_Id),
      error: (error: HttpErrorResponse) => this.manejarErrorSolicitud(error, confirmaciones),
    });
  }

  /** Pide confirmar la disponibilidad o el exceso del límite de la OT, o muestra el error devuelto por el API. */
  private manejarErrorSolicitud(error: HttpErrorResponse, confirmaciones: ConfirmacionesSolicitud) {
    const cuerpo = error.error;
    if (error.status === 409 && cuerpo?.requiereConfirmacion) {
      const advertencias: AdvertenciaDisponibilidad[] = cuerpo.advertencias ?? [];
      const detalle = advertencias.map(a => `${a.nombre}: disponible ${formatoNumero(Number(a.disponible))}`).join(', ');
      return this.confirmar('Confirmar disponibilidad', `${cuerpo.mensaje} (${detalle}) ¿Desea continuar?`,
        () => this.guardarSolicitud({ ...confirmaciones, saldoNegativo: true }));
    }
    if (error.status === 409 && cuerpo?.requiereConfirmacionLimite) {
      return this.confirmar('Superar límite de la OT', `${cuerpo.mensaje} ¿Desea solicitar de todas formas?`,
        () => this.guardarSolicitud({ ...confirmaciones, excesoLimite: true }), 'Solicitar de todas formas');
    }
    this.notificarError(error, 'No se pudo guardar la solicitud de materia prima.',
      this.esSolicitud ? 'Editar solicitud de materia prima' : 'Crear solicitud de materia prima', this.esSolicitud ? 'PUT' : 'POST');
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

  /**
   * Al guardar: limpia el formulario y muestra el aviso de éxito con dos opciones, "Ver en movimientos" y "Generar PDF".
   * El PDF ya no se genera solo; el usuario lo pide si lo necesita.
   */
  solicitudExitosa(solicitud: number) {
    const creada = !this.esSolicitud;
    const info = this.infoOT;
    // Los datos de la OT para el PDF se guardan antes de limpiar el formulario.
    const ot: DatosOTSolicitudPDF | null = info
      ? { cliente: info.cliente, item: info.item, referencia: info.ref, kgOT: info.kgReal, kgLimite: info.kg }
      : null;
    this.cambiosSinGuardar = false;
    this.limpiarTodo();
    this.messageService.clear(CLAVE_TOAST_SOLICITUD_GUARDADA);
    this.messageService.add({
      key: CLAVE_TOAST_SOLICITUD_GUARDADA,
      severity: 'success',
      summary: creada ? '¡Solicitud creada!' : '¡Solicitud actualizada!',
      detail: `Solicitud N° ${solicitud} ${creada ? 'creada' : 'actualizada'} satisfactoriamente.`,
      life: DURACION_AVISO_GUARDADA_MS,
      data: { solicitud, ot, creada } as SolicitudGuardada,
    });
  }

  /** Botón "Ver en movimientos" del aviso: abre Movimientos de solicitudes con la solicitud seleccionada. */
  verSolicitudEnMovimientos(guardada: SolicitudGuardada) {
    this.messageService.clear(CLAVE_TOAST_SOLICITUD_GUARDADA);
    // Recién creada: las pendientes de hoy (ahí está). Editada: se busca por su número (puede ser de otro día o parcial).
    const queryParams = guardada.creada
      ? { fecha: moment().format('YYYY-MM-DD'), estado: EstadoSolicitudMaterial.Pendiente, seleccionar: guardada.solicitud }
      : { solicitud: guardada.solicitud };
    this.router.navigate(['/reporte-solicitud-mp-extrusion'], { queryParams });
  }

  /**
   * Botón "Generar PDF" del aviso: el botón muestra "Generando PDF…" y el aviso sigue abierto mientras se arma;
   * al terminar se cierra y sale el aviso "PDF generado" antes de abrirlo en una pestaña nueva.
   */
  generarPdfDesdeAviso(guardada: SolicitudGuardada) {
    if (this.generandoPdfSolicitud) return;
    this.generarPdfSolicitud(guardada.solicitud, guardada.ot);
  }

  /** Consulta si el rol puede entrar a Movimientos de solicitudes; si no, el aviso no muestra el botón "Ver en movimientos". */
  private verificarAccesoMovimientos() {
    this.vistasPermisosService.GetPermisos(this.ValidarRol, VISTA_MOVIMIENTOS_SOLICITUD).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.puedeVerMovimientos = true,
      error: () => this.puedeVerMovimientos = false,
    });
  }

  /**
   * Consulta la solicitud guardada y genera su PDF con CreacionPdfService (el mismo que usa Movimientos de
   * Solicitudes de Material).
   * @param ot Datos de la OT tomados de la consulta a BagPro hecha en esta pantalla.
   */
  private generarPdfSolicitud(solicitud: number, ot: DatosOTSolicitudPDF | null) {
    this.generandoPdfSolicitud = true;
    this.servicioSolicitudMpExt.obtenerSolicitud(solicitud).pipe(
      switchMap(detalle => (detalle.subcategorias ?? []).length === 0 ? of(null) : this.servicioPDF.generarBlobSolicitudMaterialProduccion(detalle, ot)),
      takeUntil(this.destroy$),
      finalize(() => this.generandoPdfSolicitud = false),
    ).subscribe({
      next: pdf => {
        this.messageService.clear(CLAVE_TOAST_SOLICITUD_GUARDADA);
        if (!pdf) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `No se encontraron subcategorías para la solicitud N° ${solicitud}.`);
        this.abrirPdfConAviso(pdf, `El PDF de la solicitud N° ${solicitud}`, `Solicitud ${solicitud}.pdf`);
      },
      error: error => {
        this.messageService.clear(CLAVE_TOAST_SOLICITUD_GUARDADA);
        this.notificarError(error, `No se pudo generar el PDF de la solicitud N° ${solicitud}.`, 'Generar PDF de la solicitud');
      },
    });
  }

  // ───────────────────────── Mis solicitudes pendientes ─────────────────────────

  /** Abre la lista de las solicitudes pendientes creadas por el usuario, que puede cancelar. */
  verMisSolicitudes() {
    this.misSolicitudes = [];
    this.mostrarMisSolicitudes = true;
    this.cargandoMisSolicitudes = true;
    this.servicioSolicitudMpExt.consultarSolicitudes({ estados: [EstadoSolicitudMaterial.Pendiente], soloMias: true })
      .pipe(takeUntil(this.destroy$), finalize(() => this.cargandoMisSolicitudes = false))
      .subscribe({
        next: datos => this.misSolicitudes = datos,
        error: error => this.notificarError(error, 'No se pudieron consultar sus solicitudes pendientes.', 'Consultar mis solicitudes pendientes'),
      });
  }

  /** Texto de las máquinas de una solicitud, p. ej. "3 (60%), 5 (40%)". */
  textoMaquinas = (solicitud: SolicitudConsultada): string => solicitud.maquinas.length === 0
    ? String(solicitud.maquinaPrincipal)
    : solicitud.maquinas.map(m => solicitud.maquinas.length === 1 ? `${m.maquina}` : `${m.maquina} (${m.porcentaje}%)`).join(', ');

  /** Pide confirmar la cancelación de una solicitud propia pendiente. */
  pedirCancelarSolicitud(solicitud: SolicitudConsultada) {
    this.confirmar('Cancelar solicitud',
      `¿Está seguro que desea cancelar la solicitud N° ${solicitud.id} de la OT ${solicitud.ot}? No se puede deshacer; si la necesita, deberá crear una nueva.`,
      () => this.cancelarSolicitud(solicitud), 'Cancelar solicitud', 'Volver');
  }

  /** Cancela la solicitud (el API solo lo permite al dueño mientras esté pendiente). */
  private cancelarSolicitud(solicitud: SolicitudConsultada) {
    this.servicioSolicitudMpExt.cambiarEstado(solicitud.id, EstadoSolicitudMaterial.Cancelada)
      .pipe(this.conCarga(), takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.misSolicitudes = this.misSolicitudes.filter(s => s.id !== solicitud.id);
          this.mensajeService.mensajeConfirmacion('Confirmación', `La solicitud N° ${solicitud.id} fue cancelada.`);
          if (this.solicitudEnEdicion === solicitud.id) this.limpiarTodo();
        },
        error: (error: HttpErrorResponse) => {
          this.notificarError(error, `No fue posible cancelar la solicitud N° ${solicitud.id}.`, 'Cancelar solicitud', 'PUT');
          if (error.status === 409) this.verMisSolicitudes();
        },
      });
  }

  // ───────────────────────── Edición y limpieza ─────────────────────────

  /** Consulta una solicitud activa para editarla (Enter en el campo Solicitud; solo administrador). */
  consultarSolicitudMaterial() {
    if (!this.puedeEditar) return;
    const texto = (this.formEncabezado.value.Solicitud ?? '').toString().trim();
    if (!/^\d+$/.test(texto) || Number(texto) <= 0) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `El N° de la solicitud no es válido`);
    const solicitud = Number(texto);
    if (solicitud === this.solicitudEnEdicion) return;
    this.confirmarSiHayCambios(() => this.cargarSolicitud(solicitud));
  }

  /** Consulta la solicitud y, si se puede editar, la carga. Si no, se conserva lo que había en pantalla. */
  private cargarSolicitud(solicitud: number) {
    this.consultaSolicitud?.unsubscribe();
    this.consultaSolicitud = this.servicioSolicitudMpExt.obtenerSolicitud(solicitud)
      .pipe(this.conCarga(), takeUntil(this.destroy$))
      .subscribe({
        next: datos => {
          if (solicitudCerrada(datos.estado_Id)) {
            return this.mensajeService.mensajeAdvertencia(`Advertencia`, `La solicitud N° ${solicitud} está ${String(datos.estado ?? 'cerrada').toLowerCase()}; no se pueden editar solicitudes finalizadas, verificadas o canceladas!`, DURACION_ERROR_MS);
          }
          this.cargarDetallesSolicitud(datos);
        },
        error: (error: HttpErrorResponse) => error.status === 404
          ? this.mensajeService.mensajeAdvertencia(`Advertencia`, `La solicitud N° ${solicitud} no existe!`)
          : this.notificarError(error, `No se pudo obtener la solicitud N° ${solicitud}.`, 'Consultar solicitud para editar'),
      });
  }

  /**
   * Carga una solicitud en el formulario, la distribución y la tabla. Los materiales entregados que no se pidieron
   * (sustitutos) no se cargan: no son parte de lo solicitado.
   */
  private cargarDetallesSolicitud(datos: DetalleSolicitudMaterial) {
    this.reiniciarModal();
    this.solicitudEnEdicion = datos.id;
    // Las solicitudes muy antiguas pueden no tener máquina (0): se deja vacío para que se elija una.
    const maquinas = datos.maquinas.filter(m => m.maquina > 0);
    this.formEncabezado.patchValue({
      Solicitud: datos.id,
      ot: String(datos.ot),
      maquinas: maquinas.length > 0 ? maquinas.map(m => m.maquina) : null,
      observacion: datos.observacion,
      proceso: datos.proceso_Id,
      fechaEntrega: datos.fechaEntrega ? moment(datos.fechaEntrega).toDate() : null,
    }, { emitEvent: false });
    this.cargarMaquinas();

    this.subcategoriasSeleccionadas = datos.subcategorias.map(s => {
      const fila: SubcategoriaSolicitada = {
        Id: s.subCatMP_Id,
        Nombre: s.nombre,
        Cantidad: Number(s.solicitado),
        Und_Medida: s.undMed_Id,
        Disponible: s.disponible,
        Cantidad_Entregada: Number(s.entregado),
        Cantidad_Faltante: 0,
        FaltanteOriginal: 0,
        SinMateriales: !s.conMateriales,
        Materiales: s.materiales.filter(m => m.solicitado > 0).map(m => ({
          TipoMaterial: aTipoMaterial(m.tipoMaterial),
          Id: m.materialId,
          Nombre: m.nombre,
          Cantidad: Number(m.solicitado),
          Und_Medida: m.undMed_Id,
          Stock: Number(m.stock),
          Entregado: Number(m.entregado),
        })),
      };
      const faltante = redondear2(this.pendienteFila(fila));
      return { ...fila, Cantidad_Faltante: faltante, FaltanteOriginal: faltante };
    });
    this.distribucion = maquinas.map(m => ({ Maquina: m.maquina, Porcentaje: Number(m.porcentaje), Kg: 0 }));
    this.actualizarKgDistribucion();
    this.cambiosSinGuardar = false;
    this.cargarOT(Number(datos.ot));
  }

  /** Sale del modo edición sin guardar (pide confirmación si hay cambios). */
  cancelarEdicion = () => this.confirmarSiHayCambios(() => this.limpiarTodo());

  /** Botón "Limpiar Todo": pide confirmación si hay cambios sin guardar. */
  solicitarLimpiarTodo = () => this.confirmarSiHayCambios(() => this.limpiarTodo());

  /** Ejecuta la acción directamente o, si hay cambios sin guardar, después de confirmarlo. */
  private confirmarSiHayCambios(accion: () => void) {
    if (!this.cambiosSinGuardar) return accion();
    this.confirmar('Cambios sin guardar', 'Hay cambios en la solicitud que no se han guardado y se perderán. ¿Desea continuar?', accion, 'Descartar cambios', 'Seguir editando');
  }

  /** Limpia los campos de la vista y restablece el estado inicial (conserva el proceso). */
  limpiarTodo() {
    const proceso = this.formEncabezado.get('proceso')?.value;
    this.consultaOT?.unsubscribe();
    this.consultaSolicitud?.unsubscribe();
    this.reiniciarModal();
    this.formEncabezado.reset({ proceso, observacion: '', maquinas: null }, { emitEvent: false });
    this.subcategoriasSeleccionadas = [];
    this.distribucion = [];
    this.infoOrdenTrabajo = [];
    this.materialesAsignados = [];
    this.solicitudEnEdicion = null;
    this.otDeLosMateriales = null;
    this.cambiosSinGuardar = false;
  }

  /** Pasa el foco al input indicado cuando Angular termine de actualizar la vista. */
  private enfocar(id: string) {
    setTimeout(() => (document.getElementById(id) as HTMLInputElement | null)?.focus());
  }
}
