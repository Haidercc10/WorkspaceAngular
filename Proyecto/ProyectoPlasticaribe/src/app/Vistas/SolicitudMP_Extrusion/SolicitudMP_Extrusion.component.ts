import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { defer, finalize, map, Observable, of, Subject, Subscription, switchMap, takeUntil } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { ConfirmacionTeclado } from 'src/app/_helpers/confirmacion-teclado';
import { TutorialesService } from 'src/app/Servicios/Tutoriales/Tutoriales.service';
import { ClaveTutorialSolicitudMaterial, pasosTutorialSolicitudMaterial } from 'src/app/Tutoriales/Tutoriales_SolicitudMaterial';
import {
  AdvertenciaDisponibilidad,
  DetalleSolicitudRequest,
  MaterialAsignadoOT,
  ADICIONAL_KG_OT,
  ESTADOS_OT_CERRADA,
  ROLES_EDITAR_SOLICITUD,
  ROLES_EXCEDER_LIMITE_OT,
  solicitudCerrada,
} from 'src/app/Modelo/modelFlujoMaterialProduccion';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { DetSolicitudMP_ExtrusionService } from 'src/app/Servicios/DetSolicitudMP_Extrusion/DetSolicitudMP_Extrusion.service';
import { DetallesAsignacionService } from 'src/app/Servicios/DetallesAsgMateriaPrima/detallesAsignacion.service';
import { MaquinasService } from 'src/app/Servicios/Maquinas/maquinas.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { SolicitudMP_ExtrusionService } from 'src/app/Servicios/SolicitudMP_Extrusion/SolicitudMP_Extrusion.service';
import { CreacionPdfService, DatosOTSolicitudPDF } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { alCambiarTema } from 'src/app/Servicios/Tema/Tema.service';

/** Segundos que se muestra el aviso de PDF generado antes de abrirlo en una pestaña nueva. */
const ESPERA_ABRIR_PDF_OT_SEG = 3;

/** Duración (ms) de los mensajes de error, más largos que los de 3 s para poder leer el motivo. */
const DURACION_ERROR_MS = 6000;

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

/** Unidades que se pueden elegir cuando la subcategoría no trae la suya. */
const UNIDADES_MEDIDA = [{ undMed_Id: 'Kg' }, { undMed_Id: 'Cms' }];

/** Redondea a dos decimales, que es lo que acepta el API. */
const redondear2 = (valor: number): number => Math.round((Number(valor) || 0) * 100) / 100;

/** Subcategoría agregada a la tabla de la solicitud. */
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

  public formEncabezado !: FormGroup;
  public formMP !: FormGroup;

  storage_Id: number;
  storage_Nombre: any;
  ValidarRol: number;
  readonly procesos = PROCESOS;
  readonly unidadMedida = UNIDADES_MEDIDA;
  readonly minDate: Date = new Date();
  modoSeleccionado: boolean;
  private readonly suscripcionTema = alCambiarTema(oscuro => this.modoSeleccionado = oscuro); // mantiene modoSeleccionado al día con el tema

  subcategoriasSeleccionadas: SubcategoriaSolicitada[] = [];
  infoOrdenTrabajo: InfoOrdenTrabajo[] = [];
  maquinas: any[] = [];
  mpSeleccionada: SubcategoriaSolicitada | null = null;
  /** Solicitud que se está editando, o null si se está creando una nueva. */
  solicitudEnEdicion: number | null = null;

  /** Resultados de la búsqueda de subcategorías del autocompletado. */
  resultadosBusqueda: any[] = [];
  /** Modal de subcategorías del proceso con su stock y disponible. */
  mostrarSubcategorias: boolean = false;
  subcategoriasModal: any[] = [];
  /** Materiales del proceso (una fila por material); el modal de materiales filtra los de una subcategoría. */
  private materialesProceso: any[] = [];
  mostrarMateriales: boolean = false;
  materialesSubcategoria: any[] = [];

  mostrarMaterialesAsignados: boolean = false;
  cargandoMaterialesAsignados: boolean = false;
  materialesAsignados: MaterialAsignadoOT[] = [];

  /** PDF de OT esperando a abrirse; evita generarlo dos veces mientras se muestra el aviso. */
  abriendoPdfOT: boolean = false;

  /** Hay cambios en la tabla de subcategorías que no se han guardado. */
  private cambiosSinGuardar: boolean = false;
  /** Subcategoría obtenida en la última selección; se usa para validar que el Id y nombre del formulario no se alteraron. */
  private subcategoriaConsultada: { id: number; nombre: string } | null = null;
  /** Consultas en curso; se cancelan al iniciar otra igual para que una respuesta vieja no pise a la nueva. */
  private busquedaSubcategorias?: Subscription;
  private consultaOT?: Subscription;
  private consultaSolicitud?: Subscription;
  /** Momento (ms) del último aviso de encabezado incompleto; evita repetir el mensaje en cada tecla. */
  private ultimoAvisoEncabezado: number = 0;
  /** Operaciones que muestran el cargando; el overlay se quita cuando terminan todas. */
  private cargasActivas: number = 0;
  /** Acción que ejecuta el botón "Sí" del mensaje de confirmación de la solicitud. */
  private accionPendiente: (() => void) | null = null;
  /** Confirmaciones que se responden con Enter (Sí) y Esc (No). */
  private confirmacion: ConfirmacionTeclado;
  private destroy$ = new Subject<void>();

  constructor(private materiaPrimaService: MateriaPrimaService,
    private frmBuilder: FormBuilder,
    private AppComponent: AppComponent,
    private detallesAsignacionService: DetallesAsignacionService,
    private bagProServices: BagproService,
    private messageService: MessageService,
    private tutoriales: TutorialesService,
    private mensajeService: MensajesAplicacionService,
    private servicioSolicitudMpExt: SolicitudMP_ExtrusionService,
    private servicioDetSolicitudMpExt: DetSolicitudMP_ExtrusionService,
    private svMaquinas: MaquinasService,
    private servicioPDF: CreacionPdfService
  ) {
    this.confirmacion = new ConfirmacionTeclado(this.messageService);
    this.formEncabezado = this.frmBuilder.group({
      ot: [null, Validators.required],
      maq: [null, Validators.required],
      proceso: ['', Validators.required],
      observacion: [''],
      Solicitud: [null],
      fechaEntrega: [null, Validators.required],
    });

    this.formMP = this.frmBuilder.group({
      subcat_Id: [null, Validators.required],
      subcat_Nombre: [null, Validators.required],
      stock: [null],
      disponible: [null],
      cantidad: [null, Validators.required],
      und: ['Kg', Validators.required],
    });
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.formEncabezado.patchValue({ proceso: this.procesoDelRol });
    this.cargarMaquinas();
    this.tutoriales.iniciarPrimeraVez(ClaveTutorialSolicitudMaterial, this.storage_Id, () => this.pasosTutorial());
  }

  ngOnDestroy(): void {
    this.tutoriales.cancelar();
    this.destroy$.next();
    this.destroy$.complete();
    this.confirmacion.destruir();
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

  /** Puede editar solicitudes existentes y elegir el proceso. */
  get esAdministrador(): boolean {
    return ROLES_EDITAR_SOLICITUD.includes(Number(this.ValidarRol));
  }

  /** Indica si el usuario puede solicitar por encima del límite de kg de la OT. */
  get puedeExcederLimite(): boolean {
    return ROLES_EXCEDER_LIMITE_OT.includes(Number(this.ValidarRol));
  }

  /** Extrusión solicita materias primas (cuentan para el límite de kg de la OT); los demás procesos solicitan tintas. */
  get solicitaMateriaPrima(): boolean {
    return this.formEncabezado.get('proceso')?.value === PROCESO_EXTRUSION;
  }

  /** Proceso que corresponde al rol del usuario; vacío si el rol puede elegirlo. */
  private get procesoDelRol(): string {
    return PROCESO_POR_ROL[Number(this.ValidarRol)] ?? '';
  }

  /** Indica si hay una subcategoría seleccionada; bloquea Und porque se toma de la subcategoría. */
  get haySubcategoriaConsultada(): boolean {
    return this.subcategoriaConsultada !== null;
  }

  /** OT consultada (la que se ve en la tabla de información de la OT), o null si no hay. */
  get infoOT(): InfoOrdenTrabajo | null {
    return this.infoOrdenTrabajo[0] ?? null;
  }

  /**
   * La OT consultada sigue siendo la del campo. Si el usuario cambió el número sin presionar Enter,
   * la tabla muestra otra OT y no se puede agregar, guardar ni exportar con esos datos.
   */
  get otVigente(): boolean {
    const enCampo = (this.formEncabezado.value.ot ?? '').toString().trim();
    return this.infoOT != null && enCampo === String(this.infoOT.ot);
  }

  /** Encabezado completo, OT consultada y abierta: se pueden buscar y agregar subcategorías. */
  get encabezadoCompleto(): boolean {
    return this.formEncabezado.valid && this.otVigente && !this.infoOT!.cerrada;
  }

  /** El PDF solo se puede exportar si la OT del campo es la consultada. */
  get puedeExportarPdfOT(): boolean {
    return this.otVigente && !this.load && !this.abriendoPdfOT;
  }

  /** Unidad del stock en el modal de subcategorías: las materias primas son en kg; las tintas tienen varias unidades. */
  get unidadStockModal(): string {
    return this.solicitaMateriaPrima ? 'Kg' : '';
  }

  /** Total solicitado en la tabla. */
  get totalSolicitado(): number {
    return this.subcategoriasSeleccionadas.reduce((total, x) => total + Number(x.Cantidad || 0), 0);
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
      esAdministrador: this.esAdministrador,
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
        error: (error: HttpErrorResponse) => this.mostrarError(this.textoError(error, `No fue posible cargar las máquinas del proceso ${proceso}!`)),
      });
  }

  /**
   * Al cambiar el proceso se quitan la máquina, la subcategoría cargada y las subcategorías agregadas,
   * porque pertenecían al proceso anterior (materias primas y tintas no se mezclan), y se recargan las máquinas.
   */
  cambiarProceso() {
    const quitadas = this.subcategoriasSeleccionadas.length;
    this.limpiarCamposMP();
    this.subcategoriasSeleccionadas = [];
    this.cambiosSinGuardar = false;
    this.formEncabezado.patchValue({ maq: null });
    this.cargarMaquinas();
    if (quitadas > 0) this.mensajeService.mensajeAdvertencia(`Advertencia`, `Se quitaron ${quitadas} subcategoría(s) agregadas porque pertenecían al proceso anterior.`);
  }

  // ───────────────────────── Orden de trabajo ─────────────────────────

  /** Consulta la OT del campo (Enter). En edición la OT es la de la solicitud y no se cambia. */
  consultarOT() {
    if (this.esSolicitud) return;
    const texto = (this.formEncabezado.value.ot ?? '').toString().trim();
    if (!/^\d+$/.test(texto)) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `Digite un número de OT válido!`);
    this.formEncabezado.patchValue({ ot: texto });
    this.cargarOT(Number(texto));
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
      error: (error: HttpErrorResponse) => this.mostrarError(this.textoError(error, `Error al consultar la OT N° ${ot}!`)),
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

    if (info.cerrada) {
      this.mensajeService.mensajeAdvertencia(`Advertencia`, `La OT N° ${ot} está cerrada, no se le pueden crear ni editar solicitudes!`, DURACION_ERROR_MS);
    } else if (!this.solicitaMateriaPrima) {
      this.mensajeService.mensajeInformacion(`Información`, `OT N° ${ot} consultada. Las tintas no cuentan para el límite de kg de la OT.`);
    } else if (info.kgPorSolicitar > TOLERANCIA_KG) {
      this.mensajeService.mensajeConfirmacion(`OT N° ${ot}`, `Tiene ${info.kgPorSolicitar.toFixed(2)} kg restantes por solicitar.`);
    } else {
      this.mensajeService.mensajeAdvertencia(`Advertencia`, `La OT N° ${ot} no tiene kg restantes por solicitar.`);
    }
  }

  /** Abre el popup y consulta el detalle de los materiales asignados (y devueltos) a la OT consultada. */
  verMaterialesAsignados(ot: number) {
    this.materialesAsignados = [];
    this.mostrarMaterialesAsignados = true;
    this.cargandoMaterialesAsignados = true;
    this.detallesAsignacionService.getMaterialesAsignadosOT(ot)
      .pipe(takeUntil(this.destroy$), finalize(() => this.cargandoMaterialesAsignados = false))
      .subscribe({
        next: datos => this.materialesAsignados = datos,
        error: () => this.mostrarError(`No se pudieron consultar los materiales asignados a la OT N° ${ot}!`),
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
      error: () => this.mostrarError(otEncontrada
        ? `No fue posible generar el PDF de la OT N° ${ot}!`
        : `No se encontró la OT N° ${ot} para generar el PDF!`),
    });
  }

  /**
   * Muestra el aviso de éxito y, pasados unos segundos, abre el PDF en una pestaña nueva. Si el navegador
   * bloquea la pestaña (ventanas emergentes), lo descarga para que el usuario no se quede sin el documento.
   */
  private abrirPdfOTConAviso(pdf: Blob, ot: number) {
    this.abriendoPdfOT = true;
    this.mensajeService.mensajeConfirmacion('OK!',
      `El PDF de la orden de trabajo N° ${ot} se generó correctamente. En unos momentos se abrirá en una nueva pestaña.`,
      ESPERA_ABRIR_PDF_OT_SEG * 1000 + 500);

    const url = URL.createObjectURL(pdf);
    setTimeout(() => {
      this.abriendoPdfOT = false;
      const pestana = window.open(url, '_blank');
      if (!pestana) {
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = `OT ${ot}.pdf`;
        enlace.click();
        this.mensajeService.mensajeAdvertencia(`Advertencia`, `El navegador bloqueó la pestaña nueva, por eso el PDF de la OT N° ${ot} se descargó. Puede permitir las ventanas emergentes para este sitio.`, DURACION_ERROR_MS);
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    }, ESPERA_ABRIR_PDF_OT_SEG * 1000);
  }

  // ───────────────────────── Subcategorías ─────────────────────────

  /** Abre el modal con las subcategorías del proceso, su stock y su disponible (stock menos lo reservado por solicitudes activas). */
  verSubcategorias() {
    const proceso = this.formEncabezado.get('proceso')?.value;
    if (!proceso) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `Debe seleccionar un proceso para ver sus subcategorías.`);

    this.materiaPrimaService.getSubcategories(proceso).pipe(this.conCarga(), takeUntil(this.destroy$)).subscribe({
      next: datos => {
        this.materialesProceso = datos;
        const porSubcategoria = new Map<number, any>();
        datos.forEach(material => {
          const existente = porSubcategoria.get(material.id_Subcategoria);
          if (existente) existente.stock += material.stock;
          else porSubcategoria.set(material.id_Subcategoria, { ...material, disponible: null });
        });
        this.subcategoriasModal = [...porSubcategoria.values()].sort((a, b) => Number(b.stock) - Number(a.stock));
        this.mostrarSubcategorias = true;
        this.cargarDisponibles(this.subcategoriasModal, s => s.id_Subcategoria, (s, disponible) => s.disponible = disponible ?? s.stock);
      },
      error: (error: HttpErrorResponse) => this.mostrarError(this.textoError(error, `No se pudieron consultar las subcategorías del proceso ${proceso}!`)),
    });
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
      error: () => this.mensajeService.mensajeAdvertencia(`Advertencia`, `No se pudo consultar el disponible de las subcategorías.`),
    });
  }

  /** Abre el modal con los materiales que componen la subcategoría. */
  verMaterialesSubcategoria(subcategoria: any) {
    this.materialesSubcategoria = this.materialesProceso
      .filter(x => x.id_Subcategoria == subcategoria.id_Subcategoria)
      .sort((a, b) => Number(b.stock) - Number(a.stock));
    this.mostrarMateriales = true;
  }

  /** Carga en el formulario la subcategoría elegida en el modal. */
  usarSubcategoria(subcategoria: any) {
    if (!this.encabezadoCompleto) {
      this.ultimoAvisoEncabezado = 0;
      return this.avisarEncabezadoIncompleto();
    }
    this.mostrarSubcategorias = false;
    this.cargarSubcategoria(subcategoria, subcategoria.disponible);
  }

  applyFilter = ($event: Event, campo: string, tabla: Table) => tabla.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  /** Selecciona todo el contenido del input clicado, para reemplazar el valor sin tener que borrarlo. */
  seleccionarContenido(event: MouseEvent) {
    const input = event.target;
    if (input instanceof HTMLInputElement && !input.readOnly) input.select();
  }

  /** Limpia el formulario de subcategoría (Id, nombre, cantidad, disponible, stock y und) y la subcategoría consultada. */
  limpiarCamposMP() {
    this.formMP.reset({ und: 'Kg' });
    this.subcategoriaConsultada = null;
    // Cancela la búsqueda pendiente y entrega una lista nueva para que el autocompletado apague su ícono de carga.
    this.busquedaSubcategorias?.unsubscribe();
    this.resultadosBusqueda = [];
  }

  /**
   * El campo Subcategoría está bloqueado mientras el encabezado no está completo; aun así recibe las teclas.
   * Si el usuario intenta escribir o borrar, se le indica qué le falta.
   */
  validarEncabezadoAlDigitar(event: KeyboardEvent) {
    if (this.encabezadoCompleto) return;
    const editaTexto = event.key?.length === 1 || ['Backspace', 'Delete'].includes(event.key);
    if (!editaTexto || event.ctrlKey || event.metaKey || event.altKey) return;
    this.avisarEncabezadoIncompleto();
  }

  /**
   * Advierte qué falta del encabezado para consultar una subcategoría. Mientras el aviso sigue visible
   * no se repite, para no apilar un mensaje por cada tecla.
   */
  private avisarEncabezadoIncompleto() {
    const ahora = Date.now();
    if (ahora - this.ultimoAvisoEncabezado < 3000) return;
    this.ultimoAvisoEncabezado = ahora;
    this.resultadosBusqueda = [];

    const encabezado = this.formEncabezado.value;
    if (!encabezado.proceso) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `Debe seleccionar un proceso para consultar una subcategoría!`);
    if (this.otVigente && this.infoOT!.cerrada) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `La OT N° ${this.infoOT!.ot} está cerrada, no se le pueden solicitar materiales!`);

    const faltantes: string[] = [];
    if (!this.otVigente) faltantes.push('consultar la OT (Enter)');
    if (!encabezado.maq) faltantes.push('seleccionar la máquina');
    if (!encabezado.fechaEntrega) faltantes.push('elegir la fecha de entrega');
    const detalle = faltantes.length > 0
      ? (faltantes.length > 1 ? `${faltantes.slice(0, -1).join(', ')} y ${faltantes[faltantes.length - 1]}` : faltantes[0])
      : 'completar el encabezado';
    this.mensajeService.mensajeAdvertencia(`Advertencia`, `Debe ${detalle} para consultar una subcategoría!`);
  }

  /**
   * Busca subcategorías por Id (desde 1 dígito) o por nombre (desde 3 caracteres).
   * Descarta respuestas que lleguen después de que el texto del campo haya cambiado.
   */
  buscarSubcategorias() {
    const texto: string = (this.formMP.value.subcat_Nombre ?? '').toString().trim();
    const proceso: string = this.formEncabezado.get('proceso')?.value;
    const esId = /^\d+$/.test(texto);
    // El autocompletado mantiene su ícono de carga hasta que cambian las opciones, por eso siempre se asigna una lista nueva.
    this.busquedaSubcategorias?.unsubscribe();
    if (!this.encabezadoCompleto || (!esId && texto.length < 3)) {
      this.resultadosBusqueda = [];
      if (!this.encabezadoCompleto) this.avisarEncabezadoIncompleto();
      return;
    }

    this.busquedaSubcategorias = this.materiaPrimaService.buscarSubcategorias(texto, proceso).pipe(takeUntil(this.destroy$)).subscribe({
      // Si el texto cambió sin lanzar otra búsqueda (p. ej. se borró todo), se entrega una lista vacía para cerrar la carga.
      next: datos => this.resultadosBusqueda = (this.formMP.value.subcat_Nombre ?? '').toString().trim() === texto ? datos : [],
      error: () => {
        this.resultadosBusqueda = [];
        this.mensajeService.mensajeAdvertencia(`Advertencia`, `No se pudo buscar la subcategoría, intente nuevamente.`);
      },
    });
  }

  /**
   * Carga la subcategoría en el formulario junto con su disponible informativo y pasa el foco a la cantidad.
   * @param subcategoria Subcategoría elegida (del autocompletado o del modal).
   * @param disponible Disponible ya conocido; si no se envía, se consulta.
   */
  cargarSubcategoria(subcategoria: any, disponible?: number | null) {
    if (!subcategoria) return;
    const id: number = subcategoria.id_Subcategoria;
    this.subcategoriaConsultada = { id, nombre: subcategoria.subcategoria };
    this.formMP.patchValue({
      subcat_Id: id,
      subcat_Nombre: subcategoria.subcategoria,
      cantidad: null,
      und: subcategoria.und ?? 'Kg', // Las subcategorías del modal y algunas tintas no traen unidad desde el API
      stock: subcategoria.stock,
      disponible: disponible ?? null,
    });
    this.enfocar('Cantidad');
    if (disponible != null) return;

    this.servicioSolicitudMpExt.getReservas([id]).pipe(takeUntil(this.destroy$)).subscribe({
      next: reservas => {
        // Si mientras tanto se limpió o se eligió otra subcategoría, no se pisa el disponible con el de esta.
        if (this.subcategoriaConsultada?.id != id) return;
        this.formMP.patchValue({ disponible: reservas[0]?.disponible ?? subcategoria.stock });
      },
      error: () => this.mensajeService.mensajeAdvertencia(`Advertencia`, `No se pudo consultar el disponible de ${subcategoria.subcategoria}.`),
    });
  }

  /** Agrega la subcategoría del formulario a la tabla de la solicitud y vuelve el foco al campo Subcategoría. */
  agregarSubcategoria() {
    const form = this.formMP.value;
    if (!this.encabezadoCompleto) {
      this.ultimoAvisoEncabezado = 0;
      return this.avisarEncabezadoIncompleto();
    }
    if (!this.formMP.valid) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `Hay campos vacíos en el formulario de subcategoría!`);
    if (!this.subcategoriaConsultada || this.subcategoriaConsultada.id != form.subcat_Id || this.subcategoriaConsultada.nombre !== form.subcat_Nombre)
      return this.mensajeService.mensajeAdvertencia(`Advertencia`, `La subcategoría del formulario no corresponde a la seleccionada, selecciónela nuevamente!`);
    const cantidad = redondear2(form.cantidad);
    if (!(cantidad > 0)) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `La cantidad a solicitar debe ser mayor a cero (0)!`);
    if (this.subcategoriasSeleccionadas.some(x => x.Id == form.subcat_Id)) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `La subcategoría ${form.subcat_Nombre} ya ha sido seleccionada!`);

    if (form.disponible != null && cantidad > form.disponible) {
      this.mensajeService.mensajeAdvertencia(`Advertencia`, `La cantidad supera el disponible de ${form.subcat_Nombre} (${Number(form.disponible).toFixed(2)}); se pedirá confirmación al guardar.`);
    }

    this.subcategoriasSeleccionadas = [...this.subcategoriasSeleccionadas, {
      Id: form.subcat_Id,
      Nombre: form.subcat_Nombre,
      Cantidad: cantidad,
      Und_Medida: form.und,
      Disponible: form.disponible,
      Cantidad_Entregada: 0,
      Cantidad_Faltante: cantidad,
      FaltanteOriginal: 0,
    }];
    this.cambiosSinGuardar = true;
    this.limpiarCamposMP();
    this.enfocar('MP');
  }

  /** Actualiza la cantidad editada en la tabla y recalcula su faltante. */
  cambiarCantidad(fila: SubcategoriaSolicitada, valor: number | null) {
    fila.Cantidad = valor ?? 0;
    fila.Cantidad_Faltante = redondear2(this.pendienteFila(fila));
    this.cambiosSinGuardar = true;
  }

  /** Pide confirmar antes de quitar la subcategoría de la tabla. */
  mostrarEleccion(item: SubcategoriaSolicitada) {
    this.mpSeleccionada = item;
    this.confirmacion.mostrar('eleccion', 'Quitar subcategoría', `¿Está seguro que desea quitar ${item.Nombre} de la solicitud?`, () => this.quitarMateriaPrima());
  }

  /** Quita la subcategoría de la tabla. En una solicitud existente el cambio se guarda al editar. */
  quitarMateriaPrima() {
    this.onReject('eleccion');
    const seleccionada = this.mpSeleccionada;
    this.mpSeleccionada = null;
    if (!seleccionada) return;
    if (seleccionada.Cantidad_Entregada > 0) {
      return this.mensajeService.mensajeAdvertencia('Advertencia', `No se puede quitar ${seleccionada.Nombre} porque ya tiene ${seleccionada.Cantidad_Entregada} entregados.`);
    }
    this.subcategoriasSeleccionadas = this.subcategoriasSeleccionadas.filter(x => x.Id != seleccionada.Id);
    this.cambiosSinGuardar = true;
  }

  // ───────────────────────── Guardar ─────────────────────────

  /** Valida el encabezado, la tabla y el límite de la OT antes de crear o editar la solicitud. */
  validarYGuardarSolicitud() {
    if (this.load) return;
    if (!this.otVigente) return this.mensajeService.mensajeAdvertencia(`Advertencia`, 'Debe consultar la OT (Enter) antes de guardar la solicitud!');
    if (this.infoOT!.cerrada) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `No es posible crear/editar solicitudes a la OT ${this.infoOT!.ot}, porque está cerrada!`);
    if (!this.formEncabezado.value.fechaEntrega) return this.mensajeService.mensajeAdvertencia(`Advertencia`, 'Debe elegir la fecha de entrega del material!');
    if (!this.formEncabezado.valid) return this.mensajeService.mensajeAdvertencia(`Advertencia`, 'Debe llenar los campos vacíos del encabezado (proceso y máquina)!');
    if (this.subcategoriasSeleccionadas.length == 0) return this.mensajeService.mensajeAdvertencia(`Advertencia`, 'Debe agregar mínimo una subcategoría para guardar la solicitud!');

    const invalida = this.subcategoriasSeleccionadas.find(x => !(redondear2(x.Cantidad) > 0) || redondear2(x.Cantidad) < Number(x.Cantidad_Entregada));
    if (invalida) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `La cantidad de ${invalida.Nombre} debe ser mayor a cero y no puede ser menor a lo entregado (${invalida.Cantidad_Entregada}).`);

    this.validarLimiteOT();
  }

  /**
   * Las solicitudes de materia prima no pueden superar los kg por solicitar de la OT, salvo que un usuario con
   * permiso lo confirme. En edición solo cuenta el aumento sobre lo que ya tenía la solicitud. El API repite esta validación.
   */
  private validarLimiteOT() {
    if (!this.solicitaMateriaPrima || this.kgQuedarian >= -TOLERANCIA_KG) return this.guardarSolicitud();

    const ot = this.infoOT!.ot;
    const exceso = (-this.kgQuedarian).toFixed(2);
    if (!this.puedeExcederLimite) {
      return this.mensajeService.mensajeAdvertencia(`Advertencia`, `La cantidad a solicitar supera en ${exceso} kg el límite de la OT ${ot}. Debe solicitar permisos al administrador.`, DURACION_ERROR_MS);
    }
    this.confirmar('Superar límite de la OT', `La cantidad a solicitar supera en ${exceso} kg el límite de la OT ${ot}. ¿Desea solicitar de todas formas?`,
      () => this.guardarSolicitud({ excesoLimite: true }));
  }

  /** Muestra el mensaje de confirmación y guarda la acción que ejecuta el botón "Sí". */
  private confirmar(titulo: string, detalle: string, accion: () => void) {
    this.accionPendiente = accion;
    this.confirmacion.mostrar('solicitud', titulo, detalle, () => this.aceptarConfirmacion());
  }

  /** Ejecuta la acción confirmada en el mensaje de confirmación de la solicitud. */
  aceptarConfirmacion() {
    const accion = this.accionPendiente;
    this.accionPendiente = null;
    this.onReject('solicitud');
    accion?.();
  }

  onReject = (key: string) => this.confirmacion.cerrar(key);

  /** Detalles de la tabla en el formato del API. */
  private get detallesSolicitud(): DetalleSolicitudRequest[] {
    return this.subcategoriasSeleccionadas.map(x => ({ SubCatMP_Id: x.Id, Cantidad: redondear2(x.Cantidad), UndMed_Id: x.Und_Medida }));
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
      Maquina: Number(form.maq),
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
      const detalle = advertencias.map(a => `${a.nombre}: disponible ${Number(a.disponible).toFixed(2)}`).join(', ');
      return this.confirmar('Confirmar disponibilidad', `${cuerpo.mensaje} (${detalle}) ¿Desea continuar?`,
        () => this.guardarSolicitud({ ...confirmaciones, saldoNegativo: true }));
    }
    if (error.status === 409 && cuerpo?.requiereConfirmacionLimite) {
      return this.confirmar('Superar límite de la OT', `${cuerpo.mensaje} ¿Desea solicitar de todas formas?`,
        () => this.guardarSolicitud({ ...confirmaciones, excesoLimite: true }));
    }
    this.mostrarError(this.textoError(error, 'Error al guardar la solicitud de material!'));
  }

  /**
   * Obtiene el mensaje legible de un error del API: texto plano, `mensaje`, errores de validación (ProblemDetails)
   * o un mensaje por defecto.
   */
  private textoError(error: HttpErrorResponse, porDefecto: string): string {
    if (error.status === 0) return 'No hay conexión con el servidor, intente nuevamente.';
    if (error.status === 403) return 'No tiene permisos para realizar esta operación.';
    const cuerpo = error.error;
    if (typeof cuerpo === 'string' && cuerpo.trim()) return cuerpo;
    if (cuerpo?.mensaje) return cuerpo.mensaje;
    if (cuerpo?.errors) {
      const errores = ([] as string[]).concat(...(Object.values(cuerpo.errors) as string[][]));
      if (errores.length > 0) return errores.join(' ');
    }
    return porDefecto;
  }

  private mostrarError = (detalle: string) => this.mensajeService.mensajeError(`Error`, detalle, DURACION_ERROR_MS);

  /** Muestra la confirmación y genera el PDF de la solicitud guardada. */
  solicitudExitosa(solicitud: number) {
    const msj = this.esSolicitud ? `Solicitud N° ${solicitud} actualizada satisfactoriamente!` : `Solicitud N° ${solicitud} creada satisfactoriamente!`;
    this.mensajeService.mensajeConfirmacion(`Confirmación`, msj);
    this.cambiosSinGuardar = false;
    this.generarPdfSolicitud(solicitud);
  }

  /**
   * Consulta la solicitud guardada y genera su PDF con CreacionPdfService (el mismo que usa Movimientos de
   * Solicitudes de Material). Los datos de la OT se toman de la consulta a BagPro ya hecha en esta pantalla.
   * Al terminar limpia el formulario.
   */
  private generarPdfSolicitud(solicitud: number) {
    const info = this.infoOT;
    const ot: DatosOTSolicitudPDF | null = info
      ? { cliente: info.cliente, item: info.item, referencia: info.ref, kgOT: info.kgReal, kgLimite: info.kg }
      : null;

    this.servicioDetSolicitudMpExt.GetSolicitudMp_Extrusion(solicitud)
      .pipe(this.conCarga(), takeUntil(this.destroy$), finalize(() => this.limpiarTodo()))
      .subscribe({
        next: detalles => detalles.length === 0
          ? this.mensajeService.mensajeAdvertencia(`Advertencia`, `No se encontraron subcategorías para la solicitud N° ${solicitud}.`)
          : this.servicioPDF.solicitudMaterialProduccionPDF(detalles, ot),
        error: () => this.mostrarError(`¡No se pudo obtener la información de la solicitud N° ${solicitud} para generar el PDF!`),
      });
  }

  // ───────────────────────── Edición y limpieza ─────────────────────────

  /** Consulta una solicitud activa para editarla (Enter en el campo Solicitud). */
  consultarSolicitudMaterial() {
    if (!this.esAdministrador) return;
    const texto = (this.formEncabezado.value.Solicitud ?? '').toString().trim();
    if (!/^\d+$/.test(texto) || Number(texto) <= 0) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `El N° de la solicitud no es válido`);
    const solicitud = Number(texto);
    if (solicitud === this.solicitudEnEdicion) return;
    this.confirmarSiHayCambios(() => this.cargarSolicitud(solicitud));
  }

  /** Consulta la solicitud y, si se puede editar, la carga. Si no, se conserva lo que había en pantalla. */
  private cargarSolicitud(solicitud: number) {
    this.consultaSolicitud?.unsubscribe();
    this.consultaSolicitud = this.servicioDetSolicitudMpExt.GetSolicitudMp_Extrusion(solicitud)
      .pipe(this.conCarga(), takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          if (data.length == 0) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `La solicitud N° ${solicitud} no existe!`);
          if (solicitudCerrada(data[0].estado)) {
            return this.mensajeService.mensajeAdvertencia(`Advertencia`, `La solicitud N° ${solicitud} está ${String(data[0].nombre_Estado ?? 'cerrada').toLowerCase()}; no se pueden editar solicitudes finalizadas, verificadas o canceladas!`, DURACION_ERROR_MS);
          }
          this.cargarDetallesSolicitud(solicitud, data);
        },
        error: (error: HttpErrorResponse) => this.mostrarError(this.textoError(error, `No se pudo obtener la solicitud de material consultada!`)),
      });
  }

  /**
   * Carga los datos de una solicitud en el formulario y la tabla. Las filas repetidas de una misma subcategoría
   * (datos anteriores) se consolidan en una, igual que lo hace el API al guardar.
   */
  private cargarDetallesSolicitud(solicitud: number, data: any[]) {
    this.limpiarCamposMP();
    this.solicitudEnEdicion = solicitud;
    this.formEncabezado.patchValue({
      Solicitud: solicitud,
      ot: String(data[0].ot),
      maq: data[0].maquina,
      observacion: data[0].observacion,
      proceso: data[0].proceso,
      fechaEntrega: data[0].fecha_Entrega ? moment(data[0].fecha_Entrega).toDate() : null,
    });
    this.cargarMaquinas();

    const porSubcategoria = new Map<number, SubcategoriaSolicitada>();
    data.forEach(item => {
      const existente = porSubcategoria.get(item.id_Subcategoria);
      if (existente) {
        existente.Cantidad = redondear2(existente.Cantidad + Number(item.cantidad_Pedida));
        existente.Cantidad_Entregada = redondear2(existente.Cantidad_Entregada + Number(item.cantidad_Entregada));
        return;
      }
      porSubcategoria.set(item.id_Subcategoria, {
        Id: item.id_Subcategoria,
        Nombre: item.subcategoria,
        Cantidad: Number(item.cantidad_Pedida),
        Und_Medida: item.medida,
        Disponible: null,
        Cantidad_Entregada: Number(item.cantidad_Entregada),
        Cantidad_Faltante: 0,
        FaltanteOriginal: 0,
      });
    });
    this.subcategoriasSeleccionadas = [...porSubcategoria.values()].map(fila => {
      const faltante = redondear2(this.pendienteFila(fila));
      return { ...fila, Cantidad_Faltante: faltante, FaltanteOriginal: faltante };
    });
    this.cambiosSinGuardar = false;
    this.cargarDisponibles(this.subcategoriasSeleccionadas, f => f.Id, (f, disponible) => f.Disponible = disponible ?? null);
    this.cargarOT(Number(data[0].ot));
  }

  /** Sale del modo edición sin guardar (pide confirmación si hay cambios). */
  cancelarEdicion = () => this.confirmarSiHayCambios(() => this.limpiarTodo());

  /** Botón "Limpiar Todo": pide confirmación si hay cambios sin guardar. */
  solicitarLimpiarTodo = () => this.confirmarSiHayCambios(() => this.limpiarTodo());

  /** Ejecuta la acción directamente o, si hay subcategorías sin guardar, después de confirmarlo. */
  private confirmarSiHayCambios(accion: () => void) {
    if (!this.cambiosSinGuardar) return accion();
    this.confirmar('Cambios sin guardar', 'Hay cambios en las subcategorías de la solicitud que no se han guardado y se perderán. ¿Desea continuar?', accion);
  }

  /** Limpia los campos de la vista y restablece el estado inicial (conserva el proceso). */
  limpiarTodo() {
    const proceso = this.formEncabezado.get('proceso')?.value;
    this.consultaOT?.unsubscribe();
    this.consultaSolicitud?.unsubscribe();
    this.limpiarCamposMP();
    this.formEncabezado.reset({ proceso, observacion: '' });
    this.subcategoriasSeleccionadas = [];
    this.infoOrdenTrabajo = [];
    this.materialesAsignados = [];
    this.solicitudEnEdicion = null;
    this.cambiosSinGuardar = false;
    this.accionPendiente = null;
  }

  /** Pasa el foco al input indicado cuando Angular termine de actualizar la vista. */
  private enfocar(id: string) {
    setTimeout(() => (document.getElementById(id) as HTMLInputElement | null)?.focus());
  }
}
