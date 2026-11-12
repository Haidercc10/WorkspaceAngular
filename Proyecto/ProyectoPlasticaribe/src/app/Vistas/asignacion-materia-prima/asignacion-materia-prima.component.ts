import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { finalize, interval, Subject, takeUntil } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsAsignacionMateriaPrima as defaultSteps } from 'src/app/data';
import {
  AutorizacionExcesoPendiente,
  EstadoSolicitudMaterial,
  RegistrarAsignacionRequest,
  RegistrarAsignacionResult,
  ADICIONAL_KG_OT,
  ROLES_EXCEDER_LIMITE_OT,
  TipoMaterialInventario,
} from 'src/app/Modelo/modelFlujoMaterialProduccion';
import { AutorizacionesExcesoOTService } from 'src/app/Servicios/AutorizacionesExcesoOT/autorizacionesExcesoOT.service';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { DetSolicitudMP_ExtrusionService } from 'src/app/Servicios/DetSolicitudMP_Extrusion/DetSolicitudMP_Extrusion.service';
import { DetallesAsignacionService } from 'src/app/Servicios/DetallesAsgMateriaPrima/detallesAsignacion.service';
import { InventarioTransaccionalService } from 'src/app/Servicios/InventarioTransaccional/inventarioTransaccional.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import { ConfirmacionTeclado } from 'src/app/_helpers/confirmacion-teclado';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { alCambiarTema } from 'src/app/Servicios/Tema/Tema.service';


/** Estados de BagPro en los que la OT está cerrada y no admite asignaciones. */
const ESTADOS_OT_CERRADA = [1, 4];

/** Materiales comodín que no se pueden asignar. */
const MATERIALES_NO_ASIGNABLES = [84, 2001, 88, 89, 2072];

/** Material agregado a la tabla de asignación. */
interface MaterialSeleccionado {
  Id: number;
  TipoMaterial: TipoMaterialInventario;
  Nombre: string;
  Cantidad: number;
  Stock: number;
  Und_Medida: string;
  Proceso: string;
  SubCatMP_Id?: number;
  CantPedida?: number;
  CantAprobada?: number;
}

/** Subcategoría de la solicitud consultada. */
interface SubcategoriaSolicitud {
  Codigo: number;
  Solicitud: number;
  Id: number;
  Nombre: string;
  Cantidad: number;
  CantAprobada: number;
  CantFaltante: number;
  Und_Medida: string;
  materialesAsociados?: any[];
}

@Component({
  selector: 'app-asignacion-materia-prima',
  templateUrl: './asignacion-materia-prima.component.html',
  styleUrls: ['./asignacion-materia-prima.component.css']
})
export class AsignacionMateriaPrimaComponent implements OnInit, OnDestroy {

  @ViewChild('formularioAsignacion') formularioAsignacion!: ElementRef<HTMLFormElement>;
  @Output() asignacionCompletada = new EventEmitter<{ summary: string; detail: string }>();
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
  estadoOT: any;
  infoOrdenTrabajo: any[] = [];
  categoriasMP: any[] = [];
  categoriasTintas: any[] = [];
  mpSeleccionada: MaterialSeleccionado | null = null;
  modoSeleccionado: boolean;
  private readonly suscripcionTema = alCambiarTema(oscuro => this.modoSeleccionado = oscuro); // mantiene modoSeleccionado al día con el tema
  esSolicitud: boolean = false;
  esSolicitudDesdeReporte: boolean = false;
  expandedRows: any = {};
  subcategorias: SubcategoriaSolicitud[] = [];
  materialAConfirmar: any = null;
  subcategoriaAConfirmar: SubcategoriaSolicitud | null = null;

  /** Proceso con el que se cargaron los materiales de la solicitud (EXT = materias primas, otro = tintas). */
  private procesoMateriales: string = '';
  private materialesTotales: any[] = [];

  // Autorizaciones de exceso de la OT
  dialogoSolicitarAutorizacion: boolean = false;
  excesoKgPorAutorizar: number = 0;
  motivoAutorizacion: string = '';
  dialogoAutorizacionesPendientes: boolean = false;
  autorizacionesPendientes: (AutorizacionExcesoPendiente & { motivoRechazo?: string })[] = [];

  /** Confirmaciones que se responden con Enter (Sí) y Esc (No). */
  private confirmacion: ConfirmacionTeclado;
  private destroy$ = new Subject<void>();

  constructor(private materiaPrimaService: MateriaPrimaService,
    private unidadMedidaService: UnidadMedidaService,
    private procesosService: ProcesosService,
    private frmBuilderMateriaPrima: FormBuilder,
    private AppComponent: AppComponent,
    private detallesAsignacionService: DetallesAsignacionService,
    private bagProServices: BagproService,
    private tintasService: TintasService,
    private messageService: MessageService,
    private shepherdService: ShepherdService,
    private mensajeService: MensajesAplicacionService,
    private servicioDetSolicitudMaterial: DetSolicitudMP_ExtrusionService,
    private servicioInventario: InventarioTransaccionalService,
    private servicioAutorizaciones: AutorizacionesExcesoOTService,
    private servicioPDF: CreacionPdfService,
  ) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.confirmacion = new ConfirmacionTeclado(this.messageService);
    this.FormMateriaPrimaRetiro = this.frmBuilderMateriaPrima.group({
      OTRetiro: [null, Validators.required],
      Solicitud: [null],
      FechaRetiro: [this.today, Validators.required],
      Maquina: [null, Validators.required],
      kgOt: [null, Validators.required],
      ObservacionRetiro: [''],
      dateIn: [null, Validators.required],
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

  /** Inicializa los catálogos y sincroniza el tema mientras el componente está activo. */
  ngOnInit(): void {
    this.lecturaStorage();
    this.obtenerUnidadMedida();
    this.obtenerProcesos();
    this.obtenerMateriaPrima();
    this.consultarCategorias();
  }

  /** Cancela las suscripciones activas al destruir el componente. */
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.confirmacion.destruir();
  }

  /** Indica si el usuario puede superar el límite de kg de la OT. */
  get puedeExcederLimite(): boolean {
    return ROLES_EXCEDER_LIMITE_OT.includes(Number(this.ValidarRol));
  }

  // Funcion que va a hacer que se inicie el tutorial in-app
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

  /** Limpia los formularios y restablece el modo de consulta de asignación. */
  LimpiarCampos() {
    this.limpiarCamposMP();
    this.FormMateriaPrimaRetiro.reset();
    this.FormMateriaPrimaRetiro.patchValue({ FechaRetiro: this.today });
    this.kgOT = 0;
    this.cargando = false;
    this.materiasPrimasSeleccionadas = [];
    this.infoOrdenTrabajo = [];
    this.subcategorias = [];
    this.esSolicitud = false;
    this.esSolicitudDesdeReporte = false;
    this.expandedRows = {};
  }

  /** Limpia la solicitud consultada, su OT y máquina, y elimina los datos derivados de esa consulta. */
  limpiarSolicitudSeleccionada(): void {
    this.FormMateriaPrimaRetiro.patchValue({ Solicitud: null, OTRetiro: null, Maquina: null });
    this.infoOrdenTrabajo = [];
    this.materiasPrimasSeleccionadas = [];
    this.subcategorias = [];
    this.expandedRows = {};
    this.kgOT = 0;
    this.esSolicitud = false;
  }

  /** Limpia el formulario de selección de materia prima (Id, nombre, stock, cantidad, und y proceso) y el material consultado. */
  limpiarCamposMP() {
    this.FormMateriaPrimaRetirada.reset();
    this.materialConsultado = null;
  }

  obtenerUnidadMedida = () => this.unidadMedidaService.srvObtenerLista().pipe(takeUntil(this.destroy$)).subscribe(data => this.unidadMedida = data);

  obtenerProcesos = () => this.procesosService.srvObtenerLista().pipe(takeUntil(this.destroy$)).subscribe(data => this.procesos = data.filter((item) => item.proceso_Id != 'TINTAS'));

  obtenerMateriaPrima() {
    this.materiaPrimaService.getMpTintaBopp().pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.materiaPrima = data.filter((item) => item.categoria != 6);
      this.materiaPrima.sort((a, b) => a.nombre.localeCompare(b.nombre));
    });
  }

  consultarCategorias() {
    this.materiaPrimaService.GetCategoriasMateriaPrima().pipe(takeUntil(this.destroy$)).subscribe(datos => this.categoriasMP = datos);
    this.tintasService.GetCategoriasTintas().pipe(takeUntil(this.destroy$)).subscribe(datos => this.categoriasTintas = datos);
  }

  /**
   * Carga los materiales con stock de las subcategorías según el proceso de la solicitud:
   * extrusión usa materias primas y los demás procesos usan tintas.
   * @param proceso Proceso de la solicitud.
   */
  private obtenerMaterialesPorProceso(proceso: string) {
    this.procesoMateriales = proceso;
    this.materialesTotales = [];
    this.materiaPrimaService.getSubcategories(proceso).pipe(takeUntil(this.destroy$)).subscribe(data => this.materialesTotales = data);
  }

  /** Tipo de material de las subcategorías de la solicitud consultada. */
  private get tipoMaterialSolicitud(): TipoMaterialInventario {
    return this.procesoMateriales === 'EXT' ? TipoMaterialInventario.MateriaPrima : TipoMaterialInventario.Tinta;
  }

  // Funcion que se ejecuta al desplegar una subcategoria y carga sus materiales asociados con stock disponible
  onExpandSubcategoria(event: any) {
    event.data.materialesAsociados = this.materialesTotales.filter(x => x.id_Subcategoria == event.data.Id && x.stock > 0);
  }

  /** Indica si el material ya está en la tabla de asignación. */
  private materialYaSeleccionado = (tipo: TipoMaterialInventario, id: number) =>
    this.materiasPrimasSeleccionadas.some(x => x.TipoMaterial === tipo && x.Id === id);

  // Funcion que valida y muestra confirmación antes de enviar el material de la tabla expandida hacia la tabla de materias primas a asignar
  agregarMaterialDesdeSubcategoria(material: any, subcategoria: SubcategoriaSolicitud) {
    const cantidad: number = Number(material.CantidadIngresada);
    if (!cantidad || cantidad <= 0) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `La cantidad a asignar debe ser mayor a cero (0)!`);
    if (cantidad > material.stock) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `La cantidad a asignar supera el stock disponible del material ${material.referencia}!`);
    if (this.materialYaSeleccionado(this.tipoMaterialSolicitud, material.item)) {
      material.CantidadIngresada = null;
      return this.mensajeService.mensajeAdvertencia(`Advertencia`, `El material ${material.referencia} ya ha sido seleccionado!`);
    }

    const cantidadYaSeleccionada = this.materiasPrimasSeleccionadas
      .filter(x => x.SubCatMP_Id == subcategoria.Id)
      .reduce((a, b) => a + Number(b.Cantidad || 0), 0);
    if ((cantidadYaSeleccionada + cantidad) > subcategoria.CantFaltante) {
      material.CantidadIngresada = null;
      return this.mensajeService.mensajeAdvertencia(`Advertencia`, `La cantidad total seleccionada de la subcategoria ${subcategoria.Nombre} supera la cantidad faltante por entregar!`);
    }

    this.materialAConfirmar = material;
    this.subcategoriaAConfirmar = subcategoria;
    this.confirmacion.mostrar('confirmarMaterial', 'Confirmar Elección', `¿Está seguro que desea asignar ${cantidad} ${subcategoria.Und_Medida} del material ${material.referencia}?`, () => this.confirmarAgregarMaterial());
  }

  /** Confirma y agrega a la tabla de asignación el material validado en agregarMaterialDesdeSubcategoria */
  confirmarAgregarMaterial() {
    const material = this.materialAConfirmar;
    const subcategoria = this.subcategoriaAConfirmar;
    this.onReject('confirmarMaterial');
    if (!material || !subcategoria) return;

    const tipo = this.tipoMaterialSolicitud;
    this.materiasPrimasSeleccionadas.push({
      Id: material.item,
      TipoMaterial: tipo,
      SubCatMP_Id: subcategoria.Id,
      Nombre: material.referencia,
      Stock: material.stock,
      Cantidad: Number(material.CantidadIngresada),
      CantPedida: subcategoria.Cantidad,
      CantAprobada: subcategoria.CantAprobada,
      Und_Medida: subcategoria.Und_Medida,
      Proceso: tipo === TipoMaterialInventario.Tinta ? 'IMP' : 'EXT',
    });
    this.mensajeService.mensajeConfirmacion('Confirmación', `Se ha agregado el material ${material.referencia} correctamente.`);
    material.CantidadIngresada = null;
    this.materialAConfirmar = null;
    this.subcategoriaAConfirmar = null;
  }

  calcularTotalStockMateriales = (materiales: any[]): number => (materiales || []).reduce((a, b) => a + Number(b.stock || 0), 0);

  calcularTotalCantidadMateriales = (materiales: any[]): number => (materiales || []).reduce((a, b) => a + Number(b.CantidadIngresada || 0), 0);

  /** Consulta la OT en BagPro y lo que ya tiene asignado para calcular lo que resta por asignar. */
  infoOT() {
    const ot: string = this.FormMateriaPrimaRetiro.value.OTRetiro;
    if (!ot) return this.mensajeService.mensajeError(`Error`, `Debe ingresar una OT.`);

    this.cargando = true;
    this.bagProServices.srvObtenerListaClienteOT_Item(ot)
      .pipe(takeUntil(this.destroy$), finalize(() => this.cargando = false))
      .subscribe({
        next: datos => {
          if (!datos || datos.length === 0) {
            this.mensajeService.mensajeError('¡Error!', `La OT N° ${ot} no se encuentra registrada en BagPro.`);
            return;
          }
          const datosOT = datos[0];
          this.kgOT = datosOT.datosotKg * (1 + ADICIONAL_KG_OT);
          this.estadoOT = datosOT.estado;
          this.FormMateriaPrimaRetiro.patchValue({ kgOt: this.kgOT });
          this.cargarInformacionOT(ot, datosOT);
        },
        error: () => this.mensajeService.mensajeError(`Error`, `Error al consultar la OT ${ot}.`)
      });
  }

  /**
   * Carga en la tabla de la OT los kg asignados y la cantidad pedida en la unidad de su presentación.
   * @param ot Número de la OT.
   * @param datosOT Datos de la OT obtenidos de BagPro.
   */
  cargarInformacionOT(ot: string, datosOT: any) {
    this.detallesAsignacionService.getMateriasPrimasAsignadas(parseInt(ot)).pipe(takeUntil(this.destroy$)).subscribe(asignado => {
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
    });
  }

  /**
   * Consulta el material del campo Materia Prima y carga sus datos. El selector deja en el control
   * el id de la opción elegida, o el texto escrito (id o nombre) si se presionó Enter sin coincidencia.
   */
  cambiarNombreMateriaPrima() {
    const id = this.FormMateriaPrimaRetirada.value.MpNombreRetirada?.toString().trim();
    if (id == null || id === '') return this.mensajeService.mensajeError(`Error`, `Debe ingresar una materia prima.`);

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
      error: () => this.limpiarCamposMP()
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
    this.onReject('eleccion');
    const seleccionada = this.mpSeleccionada;
    if (!seleccionada) return;
    this.materiasPrimasSeleccionadas = this.materiasPrimasSeleccionadas
      .filter(x => !(x.TipoMaterial === seleccionada.TipoMaterial && x.Id === seleccionada.Id));
    this.mpSeleccionada = null;
  }

  /** Valida que todos los materiales seleccionados tengan stock suficiente antes de asignar. */
  validarStockMateriales() {
    if (this.materiasPrimasSeleccionadas.some(m => Number(m.Cantidad) > Number(m.Stock))) {
      return this.mensajeService.mensajeAdvertencia('Advertencia', 'Existen materiales con cantidades solicitadas mayores a su stock, por favor, verifique!');
    }
    this.validarCamposVaciosRetirada();
  }

  /** Valida el formulario y los materiales antes de realizar la asignación. */
  validarCamposVaciosRetirada() {
    const maquina: number = this.FormMateriaPrimaRetiro.value.Maquina;
    if (!this.FormMateriaPrimaRetiro.valid) {
      this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, '¡Debe llenar los campos vacios!');
      this.scrollToFirstInvalidField();
      return;
    }
    if (this.materiasPrimasSeleccionadas.length == 0) return this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, '¡Debe seleccionar minimo una materia prima para crear la asignación!');
    if (!(maquina >= 1)) return this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, '¡El numero de la maquina no es valido!');
    if (this.infoOrdenTrabajo.length == 0) return this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, '¡Debe consultar la OT antes de asignar!');
    if (ESTADOS_OT_CERRADA.includes(Number(this.estadoOT))) {
      return this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡No es posible asignar a la OT ${this.FormMateriaPrimaRetiro.value.OTRetiro}, porque ya se encuentra cerrada!`);
    }
    this.crearAsignacion();
  }

  /** Desplaza suavemente el formulario hasta el primer control inválido. */
  private scrollToFirstInvalidField(): void {
    const controlInvalido = this.formularioAsignacion.nativeElement.querySelector<HTMLElement>('[formControlName].ng-invalid');
    controlInvalido?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

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
    this.onReject('asignacion');
    this.cargando = true;

    this.servicioInventario.registrarAsignacion(this.construirAsignacion(confirmarExceso))
      .pipe(takeUntil(this.destroy$), finalize(() => this.cargando = false))
      .subscribe({
        next: resultado => this.asignacionExitosa(resultado),
        error: (error: HttpErrorResponse) => this.manejarErrorAsignacion(error),
      });
  }

  /** Muestra el error del API o abre el flujo de exceso del límite de la OT. */
  private manejarErrorAsignacion(error: HttpErrorResponse) {
    const resultado = error.error as RegistrarAsignacionResult | undefined;
    if (error.status === 409 && resultado?.requiereAutorizacion) {
      this.excesoKgPorAutorizar = resultado.excesoKg ?? 0;
      if (this.puedeExcederLimite) {
        this.confirmacion.mostrar('asignacion', 'Confirmar Elección', `${resultado.mensaje} ¿Desea continuar con la asignación?`, () => this.crearAsignacion(true));
      } else {
        this.motivoAutorizacion = '';
        this.dialogoSolicitarAutorizacion = true;
      }
      return;
    }
    this.mensajeService.mensajeError('¡Error!', resultado?.mensaje ?? (typeof error.error === 'string' ? error.error : '¡Error al crear la asignación de materia prima!'));
  }

  /**
   * Genera el PDF de la asignación y notifica el resultado.
   * @param resultado Respuesta del API con la asignación creada.
   */
  private asignacionExitosa(resultado: RegistrarAsignacionResult) {
    // Las materias primas y las tintas se imprimen en PDFs distintos; una asignación mixta genera ambos.
    if (this.materiasPrimasSeleccionadas.some(m => m.TipoMaterial === TipoMaterialInventario.MateriaPrima))
      this.generarPdfAsignacion(resultado.asignacionId!, 'ASIGMP');
    if (this.materiasPrimasSeleccionadas.some(m => m.TipoMaterial === TipoMaterialInventario.Tinta))
      this.generarPdfAsignacion(resultado.asignacionId!, 'ASIGTINTAS');

    const summary = '¡Asignación Creada!';
    let detail = `Asignación N° ${resultado.asignacionId} creada satisfactoriamente. A continuación se mostrará un PDF en una nueva pestaña.`;
    if (resultado.estadoSolicitud === EstadoSolicitudMaterial.Finalizada) detail += ' La solicitud quedó finalizada.';
    else if (resultado.estadoSolicitud === EstadoSolicitudMaterial.Parcial) detail += ' La solicitud quedó con entrega parcial.';

    if (this.esSolicitudDesdeReporte) this.asignacionCompletada.emit({ summary, detail });
    else this.mensajeService.mensajeConfirmacion(summary, detail);

    // La asignación descontó inventario: se recarga la lista para que el stock que se muestra esté actualizado.
    this.obtenerMateriaPrima();

    setTimeout(() => this.LimpiarCampos(), 1000);
  }

  /**
   * Consulta los datos de la asignación y genera su PDF con CreacionPdfService.
   * @param asignacionId Asignación creada.
   * @param movimiento ASIGMP (materias primas) o ASIGTINTAS (tintas).
   */
  private generarPdfAsignacion(asignacionId: number, movimiento: 'ASIGMP' | 'ASIGTINTAS') {
    this.materiaPrimaService.GetInfoMovimientoAsignaciones(asignacionId.toString(), movimiento)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: datos => { if (datos.length > 0) this.servicioPDF.asignacionMateriaPrimaPDF(datos); },
        error: () => this.mensajeService.mensajeError('¡Error!', `No fue posible generar el PDF de la asignación N° ${asignacionId}.`)
      });
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
          this.mensajeService.mensajeConfirmacion('Solicitud enviada', 'Cuando la autorización sea aprobada, vuelva a realizar la asignación.');
        },
        error: (error: HttpErrorResponse) => this.mensajeService.mensajeError('¡Error!', typeof error.error === 'string' ? error.error : 'No fue posible enviar la solicitud de autorización.')
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
        error: () => this.mensajeService.mensajeError('¡Error!', 'No fue posible consultar las autorizaciones pendientes.')
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
      error: (error: HttpErrorResponse) => this.mensajeService.mensajeError('¡Error!', typeof error.error === 'string' ? error.error : 'No fue posible responder la autorización.')
    });
  }

  onReject = (key: string) => this.confirmacion.cerrar(key);

  mostrarEleccion(item: MaterialSeleccionado) {
    this.mpSeleccionada = item;
    this.confirmacion.mostrar('eleccion', 'Elección', `Está seguro que desea quitar la materia prima de la asignación?`, () => this.quitarMateriaPrima());
  }

  /**
   * Consulta una solicitud activa y prepara la asignación basada en sus subcategorías.
   * @param desdeReporte Indica si la consulta se inició desde el popup del reporte.
   */
  consultarSolicitudMaterial(desdeReporte: boolean = false) {
    const solicitud: number = this.FormMateriaPrimaRetiro.value.Solicitud;
    this.materiasPrimasSeleccionadas = [];
    this.expandedRows = {};
    this.subcategorias = [];
    this.esSolicitud = false;
    this.esSolicitudDesdeReporte = desdeReporte;
    if (desdeReporte) this.FormMateriaPrimaRetiro.patchValue({ dateIn: null });
    if (!solicitud) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `El valor ingresado en el campo solicitud no es válido`);

    this.cargando = true;
    this.servicioDetSolicitudMaterial.GetSolicitudMp_Extrusion(solicitud)
      .pipe(takeUntil(this.destroy$), finalize(() => this.cargando = false))
      .subscribe({
        next: data => {
          if (data.length == 0) return this.mensajeService.mensajeAdvertencia(`Advertencia`, `La solicitud N° ${solicitud} no existe!`);
          if ([EstadoSolicitudMaterial.Cancelada, EstadoSolicitudMaterial.Finalizada].includes(data[0].estado)) {
            return this.mensajeService.mensajeAdvertencia(`Advertencia`, `No es posible cargar solicitudes finalizadas o canceladas!`);
          }
          this.FormMateriaPrimaRetiro.patchValue({ OTRetiro: data[0].ot, Maquina: data[0].maquina, ObservacionRetiro: data[0].observacion });
          this.esSolicitud = true;
          this.obtenerMaterialesPorProceso(data[0].proceso);
          this.subcategorias = data.map(item => ({
            Codigo: item.codigo,
            Solicitud: item.id,
            Id: item.id_Subcategoria,
            Nombre: item.subcategoria,
            Cantidad: item.cantidad_Pedida,
            CantAprobada: item.cantidad_Entregada || 0,
            CantFaltante: item.cantidad_Restante || 0,
            Und_Medida: item.medida,
          }));
          this.infoOT();
        },
        error: () => this.mensajeService.mensajeError(`Error`, `No se pudo obtener la solicitud de material consultada!`)
      });
  }
}
