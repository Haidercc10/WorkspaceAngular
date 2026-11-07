import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { finalize, Subject, takeUntil } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsSolicitudMaterialProduccion as defaultSteps } from 'src/app/data';
import { ConfirmacionTeclado } from 'src/app/_helpers/confirmacion-teclado';
import {
  AdvertenciaDisponibilidad,
  DetalleSolicitudRequest,
  EstadoSolicitudMaterial,
  MaterialAsignadoOT,
  ADICIONAL_KG_OT,
  ROLES_EXCEDER_LIMITE_OT,
} from 'src/app/Modelo/modelFlujoMaterialProduccion';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { DetSolicitudMP_ExtrusionService } from 'src/app/Servicios/DetSolicitudMP_Extrusion/DetSolicitudMP_Extrusion.service';
import { DetallesAsignacionService } from 'src/app/Servicios/DetallesAsgMateriaPrima/detallesAsignacion.service';
import { MaquinasService } from 'src/app/Servicios/Maquinas/maquinas.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { SolicitudMP_ExtrusionService } from 'src/app/Servicios/SolicitudMP_Extrusion/SolicitudMP_Extrusion.service';
import { CreacionPdfService, DatosOTSolicitudPDF } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';


/** Estados de BagPro en los que la OT está cerrada. */
const ESTADOS_OT_CERRADA = [1, 4];

/** Subcategoría agregada a la tabla de la solicitud. */
interface SubcategoriaSolicitada {
  Id: number;
  Nombre: string;
  Cantidad: number;
  Und_Medida: string;
  Stock: number;
  Disponible?: number;
  Cantidad_Entregada: number;
  Cantidad_Faltante: number;
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
  load: boolean = false; //Indica si la vista está realizando una carga
  subcategoriasSeleccionadas: SubcategoriaSolicitada[] = [];
  unidadMedida: any = [{ undMed_Id: 'Kg' }, { undMed_Id: 'Cms' }];
  procesos: any = [];
  kgOT: number = 0; //Kg máximos de la OT (kg de la OT más el adicional permitido)
  cantRestante: number = 0; //Kg que restan por asignar en la OT
  estadoOT: any;
  infoOrdenTrabajo: any[] = [];
  mpSeleccionada: SubcategoriaSolicitada | null = null;
  modoSeleccionado: boolean;
  esSolicitud: boolean = false; //Indica que se está editando una solicitud existente
  viewSubcategories: boolean = false;
  subcategoriesInModal: any[] = [];
  subcategories: any[] = [];
  materials: any[] = [];
  materialsFiltered: any[] = [];
  viewMaterials: boolean = false;
  @ViewChild('dtSubcategories') dtSubcategories: Table | undefined;
  @ViewChild('dtMaterials') dtMaterials: Table | undefined;
  minDate: Date = new Date();
  maquinas: any[] = [];
  viewMaterialesAsignados: boolean = false; //Muestra el popup con los materiales asignados a la OT
  cargandoMaterialesAsignados: boolean = false; //Indica que se están consultando los materiales asignados
  materialesAsignados: MaterialAsignadoOT[] = [];

  /** Total solicitado al cargar la solicitud en edición; sirve para validar solo el aumento contra el límite de la OT. */
  private totalOriginalSolicitud: number = 0;
  /** Acción que ejecuta el botón "Sí" del mensaje de confirmación de la solicitud. */
  private accionPendiente: (() => void) | null = null;
  /** Confirmaciones que se responden con Enter (Sí) y Esc (No). */
  private confirmacion: ConfirmacionTeclado;
  private destroy$ = new Subject<void>();

  constructor(private materiaPrimaService: MateriaPrimaService,
    private frmBuilderMateriaPrima: FormBuilder,
    private AppComponent: AppComponent,
    private detallesAsignacionService: DetallesAsignacionService,
    private bagProServices: BagproService,
    private messageService: MessageService,
    private shepherdService: ShepherdService,
    private mensajeService: MensajesAplicacionService,
    private servicioSolicitudMpExt: SolicitudMP_ExtrusionService,
    private servicioDetSolicitudMpExt: DetSolicitudMP_ExtrusionService,
    private svMaquinas: MaquinasService,
    private servicioPDF: CreacionPdfService
  ) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.confirmacion = new ConfirmacionTeclado(this.messageService);
    this.formEncabezado = this.frmBuilderMateriaPrima.group({
      ot: [null, Validators.required],
      fecha: [moment().format('YYYY-MM-DD'), Validators.required],
      maq: [null, Validators.required],
      kgOt: [null, Validators.required],
      proceso: ['', Validators.required],
      observacion: [''],
      Solicitud: [null],
      fechaEntrega: [null,],
    });

    this.formMP = this.frmBuilderMateriaPrima.group({
      subcat_Id: [null, Validators.required],
      subcat_Nombre: [null, Validators.required],
      stock: [null, Validators.required],
      disponible: [null],
      cantidad: [null, Validators.required],
      und: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.obtenerProcesos();
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
    this.formEncabezado.patchValue({ 'proceso': this.validateProcess(), });
    if (this.validateProcess() != '') this.cargarMaquinas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.confirmacion.destruir();
  }

  /** Indica si el usuario puede solicitar por encima del límite de kg de la OT. */
  get puedeExcederLimite(): boolean {
    return ROLES_EXCEDER_LIMITE_OT.includes(Number(this.ValidarRol));
  }

  /** Extrusión solicita materias primas (cuentan para el límite de kg de la OT); los demás procesos solicitan tintas. */
  private get solicitaMateriaPrima(): boolean {
    return this.formEncabezado.get('proceso')?.value === 'EXT';
  }

  tutorial() {
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  lecturaStorage() {
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  /** Proceso que corresponde al rol del usuario; vacío si el rol puede elegirlo. */
  validateProcess() {
    if ([88, 4].includes(this.ValidarRol)) return 'IMP';
    if ([7, 85].includes(this.ValidarRol)) return 'EXT';
    if ([87, 9].includes(this.ValidarRol)) return 'EMP';
    if ([89, 63].includes(this.ValidarRol)) return 'LAM';
    return '';
  }

  /** Carga las subcategorías del proceso con su stock y su disponible (stock menos lo reservado por otras solicitudes). */
  loadSubcategories() {
    const proceso = this.formEncabezado.get('proceso')?.value;
    this.subcategoriesInModal = [];
    this.materials = [];
    if (!proceso) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `Debe seleccionar un proceso válido para cargar las subcategorías.`);

    this.materiaPrimaService.getSubcategories(proceso).pipe(takeUntil(this.destroy$)).subscribe(datos => {
      this.materials = datos;
      this.viewSubcategories = true;
      this.subcategoriesInModal = this.materials.reduce((a: any[], b: any) => {
        const existente = a.find(x => x.id_Subcategoria == b.id_Subcategoria);
        if (existente) existente.stock += b.stock;
        else a.push({ ...b });
        return a;
      }, []);
      this.subcategoriesInModal.sort((a, b) => Number(b.stock) - Number(a.stock));
      this.cargarDisponibles(this.subcategoriesInModal);
    });
  }

  /** Agrega a cada subcategoría su disponible informativo. */
  private cargarDisponibles(subcategorias: any[]) {
    const ids = subcategorias.map(s => s.id_Subcategoria).filter(id => id != null);
    if (ids.length == 0) return;
    this.servicioSolicitudMpExt.getReservas(ids).pipe(takeUntil(this.destroy$)).subscribe(reservas => {
      const disponibles = new Map(reservas.map(r => [r.subCatMP_Id, r.disponible]));
      subcategorias.forEach(s => s.disponible = disponibles.get(s.id_Subcategoria) ?? s.stock);
    });
  }

  filterForSubcategory(data: any) {
    this.materialsFiltered = this.materials.filter(x => x.id_Subcategoria == data.id_Subcategoria);
    this.materialsFiltered.sort((a, b) => Number(b.stock) - Number(a.stock));
    this.viewMaterials = true;
  }

  applyFilter = ($event, campo: any, table: any) => table!.filter(($event.target as HTMLInputElement).value, campo, 'contains');


  /** Limpia los campos de la vista y restablece el estado inicial. */
  LimpiarCampos() {
    const proceso = this.formEncabezado.get('proceso')?.value;
    this.formMP.reset();
    this.formEncabezado.reset();
    this.formEncabezado.patchValue({ fecha: moment().format('YYYY-MM-DD'), proceso });
    this.formMP.patchValue({ und: 'Kg' });
    this.cantRestante = 0;
    this.kgOT = 0;
    this.load = false;
    this.subcategoriasSeleccionadas = [];
    this.infoOrdenTrabajo = [];
    this.materialesAsignados = [];
    this.esSolicitud = false;
    this.totalOriginalSolicitud = 0;
    this.accionPendiente = null;
  }

  limpiarCamposMP() {
    this.formMP.reset();
    this.formMP.patchValue({ und: 'Kg' });
  }

  obtenerProcesos() {
    this.procesos = [
      { proceso_Id: 'EXT', proceso_Nombre: 'EXTRUSIÓN' },
      { proceso_Id: 'IMP', proceso_Nombre: 'IMPRESIÓN' },
      { proceso_Id: 'EMP', proceso_Nombre: 'EMPAQUE' },
      { proceso_Id: 'LAM', proceso_Nombre: 'LAMINADO' }
    ];
  }

  /** Consulta la orden de trabajo y muestra el estado de carga mientras obtiene sus datos. */
  infoOT() {
    const ot: string = this.formEncabezado.value.ot;
    this.load = true;
    this.bagProServices.srvObtenerListaClienteOT_Item(ot)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (data.length == 0) {
          this.load = false;
          this.mensajeService.mensajeAdvertencia(`Advertencia`, `La OT N° ${ot} no existe!`);
          return;
        }
        this.kgOT = data[0].datosotKg * (1 + ADICIONAL_KG_OT);
        this.estadoOT = data[0].estado;
        this.formEncabezado.patchValue({ 'kgOt': this.kgOT });
        this.getInfoMaterialSolicitada(parseInt(ot), data);
      }, () => {
        this.load = false;
        this.mensajeService.mensajeError(`Error`, `Error al consultar la OT ${ot}!`);
      });
  }

  /**
   * Obtiene lo asignado y lo solicitado pendiente de la OT para calcular lo que queda por solicitar.
   * @param ot Número de la orden de trabajo consultada.
   * @param data Datos obtenidos de la orden de trabajo.
   */
  getInfoMaterialSolicitada(ot: number, data: any) {
    this.detallesAsignacionService.getMateriasPrimaSolicitada(ot)
      .pipe(takeUntil(this.destroy$), finalize(() => this.load = false))
      .subscribe(asig => {
        this.cantRestante = this.kgOT - asig.cantidad_Asignada;
        const kgPorSolicitar: number = this.cantRestante - asig.cantidad_Solicitada;
        this.loadInfoOT(ot, data, asig);
        if (this.esSolicitud) this.cargarMaquinas();
        if (kgPorSolicitar > 0) this.mensajeService.mensajeConfirmacion(`Advertencia`, `La OT N° ${ot} tiene '${kgPorSolicitar.toFixed(2)}' kg restantes por solicitar.`);
        else this.mensajeService.mensajeAdvertencia(`Advertencia`, `La OT N° ${ot} no tiene kg restantes por solicitar.`);
      });
  }

  loadInfoOT(ot: number, datos_procesos: any, datos_asignacion: any) {
    this.infoOrdenTrabajo = [{
      ot: ot,
      cliente: datos_procesos[0].clienteNom,
      item: datos_procesos[0].clienteItems,
      ref: datos_procesos[0].clienteItemsNom,
      kgReal: datos_procesos[0].datosotKg,
      kg: this.kgOT,
      kgSolicitados: datos_asignacion.cantidad_Solicitada,
      kgAsignado: datos_asignacion.cantidad_Asignada,
      kgRestante: this.cantRestante,
      kgPorSolicitar: this.cantRestante - datos_asignacion.cantidad_Solicitada,
    }];
  }

  /**
   * Abre el popup y consulta el detalle de los materiales asignados (y devueltos) a la OT consultada.
   * @param ot Número de la orden de trabajo.
   */
  verMaterialesAsignados(ot: number) {
    this.materialesAsignados = [];
    this.viewMaterialesAsignados = true;
    this.cargandoMaterialesAsignados = true;
    this.detallesAsignacionService.getMaterialesAsignadosOT(ot)
      .pipe(takeUntil(this.destroy$), finalize(() => this.cargandoMaterialesAsignados = false))
      .subscribe({
        next: datos => this.materialesAsignados = datos,
        error: () => this.mensajeService.mensajeError(`Error`, `No se pudieron consultar los materiales asignados a la OT N° ${ot}!`),
      });
  }

  /** Cantidad neta de los materiales del popup: lo asignado menos lo devuelto. */
  get totalCantidadMaterialesAsignados(): number {
    return this.materialesAsignados.reduce((total, m) => total + (m.esDevolucion ? -m.cantidad : m.cantidad), 0);
  }

  getAllSubcategories() {
    const material: string = this.formMP.value.subcat_Nombre;
    const proceso: string = this.formEncabezado.get('proceso')?.value;
    if (material && material.trim().length > 2) {
      this.materiaPrimaService.getAllSubcategoriesForName(material, proceso).pipe(takeUntil(this.destroy$)).subscribe(datos => this.subcategories = datos);
    }
  }

  /** Carga la subcategoría elegida en el formulario junto con su disponible informativo. */
  loadMaterialInField() {
    const data: any = this.subcategories.find(x => x.id_Subcategoria == this.formMP.value.subcat_Nombre);
    if (!data) return;

    this.formMP.patchValue({
      'subcat_Id': data.id_Subcategoria,
      'subcat_Nombre': data.subcategoria,
      'cantidad': 0,
      'und': data.und,
      'stock': data.stock,
      'disponible': null,
    });
    this.servicioSolicitudMpExt.getReservas([data.id_Subcategoria]).pipe(takeUntil(this.destroy$)).subscribe(reservas => {
      this.formMP.patchValue({ disponible: reservas[0]?.disponible ?? data.stock });
    });
  }

  /** Agrega la subcategoría del formulario a la tabla de la solicitud. */
  validarCamposVaciosMPRetirada() {
    const form = this.formMP.value;
    if (!this.formMP.valid) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `Hay campos vacíos en el formulario de subcategoría!`);
    if (!(form.cantidad > 0)) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `La cantidad a solicitar debe ser mayor a cero (0)!`);
    if (this.subcategoriasSeleccionadas.some(x => x.Id == form.subcat_Id)) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `La subcategoría ${form.subcat_Nombre} ya ha sido seleccionada!`);

    if (form.disponible != null && form.cantidad > form.disponible) {
      this.mensajeService.mensajeAdvertencia(`Advertencia`, `La cantidad supera el disponible de ${form.subcat_Nombre} (${Number(form.disponible).toFixed(2)}); se pedirá confirmación al guardar.`);
    }

    this.subcategoriasSeleccionadas.push({
      Id: form.subcat_Id,
      Nombre: form.subcat_Nombre,
      Cantidad: form.cantidad,
      Und_Medida: form.und,
      Stock: form.stock,
      Disponible: form.disponible,
      Cantidad_Entregada: 0,
      Cantidad_Faltante: form.cantidad,
    });
    this.limpiarCamposMP();
  }

  calcularMateriaPrimaSolicitada = (): number => this.subcategoriasSeleccionadas.reduce((total, x) => total + Number(x.Cantidad || 0), 0);

  /** Quita la subcategoría de la tabla. En una solicitud existente el cambio se guarda al editar. */
  quitarMateriaPrima() {
    this.onReject('eleccion');
    const seleccionada = this.mpSeleccionada;
    if (!seleccionada) return;
    if (seleccionada.Cantidad_Entregada > 0) {
      return this.mensajeService.mensajeAdvertencia('Advertencia', `No se puede quitar ${seleccionada.Nombre} porque ya tiene ${seleccionada.Cantidad_Entregada} entregados.`);
    }
    this.subcategoriasSeleccionadas = this.subcategoriasSeleccionadas.filter(x => x.Id != seleccionada.Id);
    this.mpSeleccionada = null;
  }

  /** Valida el formulario, la tabla y el límite de la OT antes de crear o editar la solicitud. */
  validarCamposVaciosRetirada() {
    const maq: number = this.formEncabezado.value.maq;
    const proceso: string = this.formEncabezado.value.proceso;
    if (!this.formEncabezado.valid) return this.mensajeService.mensajeAdvertencia(`Advertencia`, 'Debe llenar los campos vacios!');
    if (this.subcategoriasSeleccionadas.length == 0) return this.mensajeService.mensajeAdvertencia(`Advertencia`, 'Debe seleccionar minimo una materia prima para crear la solicitud!');
    if (!(maq >= 1) || !proceso) return this.mensajeService.mensajeAdvertencia(`Advertencia`, 'Debe diligenciar los campos maquina y proceso, verifique!');
    if (this.infoOrdenTrabajo.length == 0) return this.mensajeService.mensajeAdvertencia(`Advertencia`, 'Debe consultar la OT antes de guardar la solicitud!');
    if (ESTADOS_OT_CERRADA.includes(Number(this.estadoOT))) {
      return this.mensajeService.mensajeAdvertencia(`Advertencia`, `No es posible crear/editar solicitudes a la OT ${this.formEncabezado.value.ot}, porque está cerrada!`);
    }

    const invalida = this.subcategoriasSeleccionadas.find(x => !(Number(x.Cantidad) > 0) || Number(x.Cantidad) < Number(x.Cantidad_Entregada));
    if (invalida) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `La cantidad de ${invalida.Nombre} debe ser mayor a cero y no puede ser menor a lo entregado (${invalida.Cantidad_Entregada}).`);

    this.validarLimiteOT();
  }

  /**
   * Las solicitudes de materia prima no pueden superar los kg por solicitar de la OT, salvo que un usuario con
   * permiso lo confirme. En edición solo cuenta el aumento sobre lo que ya tenía la solicitud.
   */
  private validarLimiteOT() {
    const kgPorSolicitar: number = this.infoOrdenTrabajo[0].kgPorSolicitar;
    const aumento = this.calcularMateriaPrimaSolicitada() - (this.esSolicitud ? this.totalOriginalSolicitud : 0);
    if (!this.solicitaMateriaPrima || aumento <= kgPorSolicitar) return this.guardarSolicitud();

    const ot = this.formEncabezado.value.ot;
    if (!this.puedeExcederLimite) {
      return this.mensajeService.mensajeAdvertencia(`Advertencia`, `La cantidad a solicitar supera el limite de kilos permitidos para la OT ${ot}, Debe solicitar permisos al administrador.`);
    }
    this.confirmar(`La cantidad a solicitar supera el limite de Kg permitidos para la OT ${ot}, ¿Desea solicitar de todas formas?`, () => this.guardarSolicitud());
  }

  /** Muestra el mensaje de confirmación y guarda la acción que ejecuta el botón "Sí". */
  private confirmar(detalle: string, accion: () => void) {
    this.accionPendiente = accion;
    this.confirmacion.mostrar('solicitud', 'Confirmar Elección', detalle, () => this.aceptarConfirmacion());
  }

  /** Ejecuta la acción confirmada en el mensaje de confirmación de la solicitud. */
  aceptarConfirmacion() {
    const accion = this.accionPendiente;
    this.accionPendiente = null;
    this.onReject('solicitud');
    accion?.();
  }

  /** Detalles de la tabla en el formato del API. */
  private get detallesSolicitud(): DetalleSolicitudRequest[] {
    return this.subcategoriasSeleccionadas.map(x => ({ SubCatMP_Id: x.Id, Cantidad: Number(x.Cantidad), UndMed_Id: x.Und_Medida }));
  }

  /**
   * Crea o edita la solicitud en una sola operación del API. Si lo solicitado supera la disponibilidad informativa,
   * el API pide confirmación y se reenvía confirmando.
   * @param confirmarSaldoNegativo Indica que el usuario aceptó solicitar por encima del disponible.
   */
  guardarSolicitud(confirmarSaldoNegativo: boolean = false) {
    const form = this.formEncabezado.value;
    const fechaEntrega = form.fechaEntrega ? moment(form.fechaEntrega).format('YYYY-MM-DD') : null;
    const operacion = this.esSolicitud
      ? this.servicioSolicitudMpExt.editarSolicitud(Number(form.Solicitud), {
        Maquina: Number(form.maq),
        Observacion: form.observacion || undefined,
        FechaEstimadaEntrega: fechaEntrega,
        ConfirmarSaldoNegativo: confirmarSaldoNegativo,
        Detalles: this.detallesSolicitud,
      })
      : this.servicioSolicitudMpExt.crearSolicitud({
        OrdenTrabajo: Number(form.ot),
        Maquina: Number(form.maq),
        ProcesoId: form.proceso,
        Observacion: form.observacion || undefined,
        FechaEstimadaEntrega: fechaEntrega,
        ConfirmarSaldoNegativo: confirmarSaldoNegativo,
        Detalles: this.detallesSolicitud,
      });

    this.load = true;
    operacion.pipe(takeUntil(this.destroy$), finalize(() => this.load = false)).subscribe({
      next: datos => this.solicitudExitosa(datos.solMpExt_Id),
      error: (error: HttpErrorResponse) => this.manejarErrorSolicitud(error),
    });
  }

  /** Pide confirmar la disponibilidad o muestra el error devuelto por el API. */
  private manejarErrorSolicitud(error: HttpErrorResponse) {
    if (error.status === 409 && error.error?.requiereConfirmacion) {
      const advertencias: AdvertenciaDisponibilidad[] = error.error.advertencias ?? [];
      const detalle = advertencias.map(a => `${a.nombre}: disponible ${Number(a.disponible).toFixed(2)}`).join(', ');
      return this.confirmar(`${error.error.mensaje} (${detalle}) ¿Desea continuar?`, () => this.guardarSolicitud(true));
    }
    const mensaje = typeof error.error === 'string' ? error.error : (error.error?.title ?? 'Error al guardar la solicitud de material!');
    this.mensajeService.mensajeError(`Error`, mensaje);
  }

  /** Muestra la confirmación y genera el PDF de la solicitud guardada. */
  solicitudExitosa(solicitud: number) {
    const msj = this.esSolicitud ? `Solicitud N° ${solicitud} actualizada satisfactoriamente!` : `Solicitud N° ${solicitud} creada satisfactoriamente!`;
    this.mensajeService.mensajeConfirmacion(`Confirmación`, msj);
    this.generarPdfSolicitud(solicitud);
  }

  onReject = (key: string) => this.confirmacion.cerrar(key);

  mostrarEleccion(item: SubcategoriaSolicitada) {
    this.mpSeleccionada = item;
    this.confirmacion.mostrar('eleccion', 'Elección', `Está seguro que desea quitar la materia prima de la solicitud?`, () => this.quitarMateriaPrima());
  }

  /**
   * Consulta la solicitud guardada y genera su PDF con CreacionPdfService (el mismo que usa Movimientos de
   * Solicitudes de Material). Los datos de la OT se toman de la consulta a BagPro ya hecha en esta pantalla.
   * Al terminar limpia el formulario.
   * @param solicitud Identificador de la solicitud.
   */
  private generarPdfSolicitud(solicitud: number) {
    const datosOT = this.infoOrdenTrabajo[0];
    const ot: DatosOTSolicitudPDF | null = datosOT
      ? { cliente: datosOT.cliente, referencia: datosOT.ref, kgOT: datosOT.kgReal, kgLimite: datosOT.kg }
      : null;

    this.load = true;
    this.servicioDetSolicitudMpExt.GetSolicitudMp_Extrusion(solicitud)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.load = false; this.LimpiarCampos(); }))
      .subscribe(detalles => {
        if (detalles.length === 0) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `No se encontraron subcategorías para la solicitud N° ${solicitud}.`);
        this.servicioPDF.solicitudMaterialProduccionPDF(detalles, ot);
      }, () => this.mensajeService.mensajeError(`Error`, `¡No se pudo obtener la información de la solicitud N° ${solicitud} para generar el PDF!`));
  }

  /** Consulta una solicitud activa para editarla. */
  consultarSolicitudMaterial() {
    const solicitud: number = this.formEncabezado.value.Solicitud;
    this.subcategoriasSeleccionadas = [];
    this.infoOrdenTrabajo = [];
    this.esSolicitud = false;
    if (!solicitud) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `El N° de la solicitud no es válido`);

    this.load = true;
    this.servicioDetSolicitudMpExt.GetSolicitudMp_Extrusion(solicitud)
      .pipe(takeUntil(this.destroy$), finalize(() => this.load = false))
      .subscribe(data => {
        if (data.length == 0) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `La solicitud N° ${solicitud} no existe!`);
        if ([EstadoSolicitudMaterial.Cancelada, EstadoSolicitudMaterial.Finalizada].includes(data[0].estado)) {
          return this.mensajeService.mensajeAdvertencia(`Advertencia`, `No se pueden editar solicitudes con estado finalizado o cancelado!`);
        }
        this.cargarDetallesSolicitud(data);
      }, () => this.mensajeService.mensajeError(`Error`, `No se pudo obtener la solicitud de material consultada!`));
  }

  /**
   * Carga los datos de una solicitud en el formulario y la tabla.
   * @param data Detalles de la solicitud consultada.
   */
  cargarDetallesSolicitud(data: any[]) {
    this.esSolicitud = true;
    this.formEncabezado.patchValue({
      'ot': data[0].ot,
      'maq': data[0].maquina,
      'observacion': data[0].observacion,
      'proceso': data[0].proceso,
      'fechaEntrega': data[0].fecha_Entrega ? moment(data[0].fecha_Entrega).toDate() : null,
    });
    this.subcategoriasSeleccionadas = data.map(item => ({
      Id: item.id_Subcategoria,
      Nombre: item.subcategoria,
      Stock: item.stock,
      Cantidad: item.cantidad_Pedida,
      Und_Medida: item.medida,
      Cantidad_Entregada: item.cantidad_Entregada,
      Cantidad_Faltante: item.cantidad_Restante,
    }));
    this.totalOriginalSolicitud = this.calcularMateriaPrimaSolicitada();
    this.infoOT();
  }

  /** Función para cargar las máquinas disponibles */
  cargarMaquinas() {
    const proceso: string = this.formEncabezado.value.proceso;
    this.maquinas = [];
    if (!proceso) return;
    this.svMaquinas.getMaquinasPorProceso(proceso)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.maquinas = data;
        this.maquinas.sort((a, b) => Number(a.maq_Numero) - Number(b.maq_Numero));
      }, error => this.mensajeService.mensajeError(`Error`, `No fue posible cargar las máquinas disponibles: ${error.error}`));
  }
}
