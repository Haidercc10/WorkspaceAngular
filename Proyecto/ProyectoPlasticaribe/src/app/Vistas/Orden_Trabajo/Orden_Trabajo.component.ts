import { Component, Injectable, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { EMPTY, Observable, Subject, Subscription, catchError, debounceTime, distinctUntilChanged, filter, finalize, forkJoin, map, of, switchMap, throwError } from 'rxjs';
import { modelMezMaterial } from 'src/app/Modelo/modelMezMaterial';
import { modelMezPigmento } from 'src/app/Modelo/modelMezPigmento';
import { modelMezclas } from 'src/app/Modelo/modelMezclas';
import { CrearOrdenTrabajoDatos, EditarOrdenTrabajoCompleta, EditarOrdenTrabajoDatos, OtExtrusionDatos, OtImpresionDatos, OtLaminadoDatos, OtSelladoCorteDatos, ProcesosOrdenTrabajo } from 'src/app/Modelo/modelOrdenTrabajoCompleta';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { ClientesService } from 'src/app/Servicios/Clientes/clientes.service';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { FormatosService } from 'src/app/Servicios/Formato/Formatos.service';
import { Laminado_CapaService } from 'src/app/Servicios/LaminadoCapa/Laminado_Capa.service';
import { MaterialProductoService } from 'src/app/Servicios/MaterialProducto/materialProducto.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { MezclasService } from 'src/app/Servicios/Mezclas/Mezclas.service';
import { Mezclas_MaterialesService } from 'src/app/Servicios/MezclasMateriales/Mezclas_Materiales.service';
import { Mezclas_PigmentosService } from 'src/app/Servicios/MezclasPigmentos/Mezclas_Pigmentos.service';
import { Orden_TrabajoService } from 'src/app/Servicios/OrdenTrabajo/Orden_Trabajo.service';
import { OrdenTrabajo_Sellado_CorteService } from 'src/app/Servicios/OrdenTrabajo_Sellado_Corte/OrdenTrabajo_Sellado_Corte.service';
import { PigmentoProductoService } from 'src/app/Servicios/PigmentosProductos/pigmentoProducto.service';
import { HistorialNombreProducto, ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import { Tipos_ImpresionService } from 'src/app/Servicios/TipoImpresion/Tipos_Impresion.service';
import { TipoProductoService } from 'src/app/Servicios/TipoProducto/tipo-producto.service';
import { TiposSelladoService } from 'src/app/Servicios/TiposSellado/TiposSellado.service';
import { TratadoService } from 'src/app/Servicios/Tratado/Tratado.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsOrdenesTrabajo as defaultSteps, stepsMezclasOT as defaultSteps2, stepsBusquedaOrdenesTrabajo } from 'src/app/data';
import { SedeClienteService } from 'src/app/Servicios/SedeCliente/sede-cliente.service';
import { modelProducto } from 'src/app/Modelo/modelProducto';
import { modelExistenciaProductos } from 'src/app/Modelo/modelExisteciaProductos';
import { ExistenciasProductosService } from 'src/app/Servicios/ExistenciasProductos/existencias-productos.service';
import { EstadosProcesos_OTService } from 'src/app/Servicios/EstadosProcesosOT/EstadosProcesos_OT.service';
import { OtCalculoCostosService, RangoPesoTeorico, REGLA_PESO_MILLAR_D2 } from 'src/app/Servicios/OrdenTrabajo/OtCalculoCostos.service';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';

/**
 * Presentaciones con las que se puede crear una OT; también son las opciones del dropdown de presentación.
 * "Rollo" no se usa (decisión del responsable): una OT existente con Rollo se puede consultar, editar y generar su PDF,
 * pero no se crean OT nuevas con esa presentación (puede llegar desde BagPro como presentación del item).
 */
const PRESENTACIONES_OT_PERMITIDAS: readonly string[] = ['Kg', 'Paquete', 'Und', 'MTS'];

/**
 * Roles que pueden crear y editar OT desde esta vista (decisión del responsable, medida temporal mientras se define
 * quién puede renombrar el maestro de productos). Los demás roles solo consultan y generan el PDF.
 * La API todavía no aplica esta restricción.
 */
const ROLES_GUARDAR_OT: readonly number[] = [1, 98];

/** OT encontrada al consultar por número: en Plasticaribe (editable) o solo en BagPro (plantilla). */
interface ResultadoBusquedaOT {
  origen: 'plasticaribe' | 'bagpro';
  datos: any;
  sede?: any;
  /** true si el item/presentación de la OT no existe en Plasticaribe; en ese caso la OT no se carga. */
  productoNoEncontrado?: boolean;
}

/** Información encontrada al consultar por item: ficha de BagPro (ClientesOtItem) o, como respaldo, la última OT de Plasticaribe. */
interface ResultadoBusquedaItem {
  origen: 'item' | 'ultimaOT';
  datos: any;
  sede?: any;
  /** true si el item/presentación no existe en Plasticaribe; en ese caso el item no se carga. */
  productoNoEncontrado?: boolean;
}

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-Orden_Trabajo',
  templateUrl: './Orden_Trabajo.component.html',
  styleUrls: ['./Orden_Trabajo.component.css']
})

export class Orden_TrabajoComponent implements OnInit, OnDestroy {

  FormOrdenTrabajo !: FormGroup;
  FormOrdenTrabajoExtrusion !: FormGroup;
  FormOrdenTrabajoImpresion !: FormGroup;
  FormOrdenTrabajoLaminado !: FormGroup;
  FormOrdenTrabajoCorte !: FormGroup;
  FormOrdenTrabajoSellado !: FormGroup;
  FormOrdenTrabajoMezclas !: FormGroup;
  formCrearMezclas !: FormGroup;
  formCrearMateriales !: FormGroup;
  formCrearPigmentos !: FormGroup;

  /** Tema oscuro/claro de la aplicación. Se lee directo de AppComponent (antes un setInterval de 1 s forzaba la
   * detección de cambios de todo el formulario cada segundo y no se detenía al salir de la pantalla). */
  get modoSeleccionado(): boolean { return this.AppComponent.temaSeleccionado; }
  cargando: boolean = false; //Variable para validar que salga o no la imagen de carga
  confirmandoEdicion: boolean = false; //Indica que el mensaje de confirmación de edición está abierto; deshabilita los botones "Editar OT"
  guardando: boolean = false; //Indica que hay una creación o edición de OT en curso; bloquea un segundo envío (doble clic)
  today: any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id: number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre: any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol: any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol: number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  clientes: any[] = []; //Variable que almacenará la informacion de los clientes
  vendedores: any[] = []; //Variable que almacenará la informacion de los vendedores
  productos: any[] = []; //Variable que almacenará la informacion de los productos
  presentaciones: any[] = []; //Variable que almacenará la informacion de las presentaciones
  estados: any[] = []; //Variable que almacenará la informacion de los estados
  edicionOrdenTrabajo: boolean = false; //Variable para validar que se está editando o no una orden de trabajo
  otCargada: number | null = null; //Número de la OT cargada en pantalla; base para navegar con ◀ ▶ y para restaurar el campo si una búsqueda no encuentra la OT
  private busquedaOT?: Subscription; //Búsqueda de OT en curso; se cancela al iniciar otra para no mezclar datos de dos OTs
  private refrescoProducto?: Subscription; //Refresco en segundo plano de ArrayProducto (buscarInformacionProducto); se cancela en limpiarCampos
  private errorRefrescoAvisado: boolean = false; //Evita repetir el aviso de error del refresco de producto hasta que vuelva a responder
  private calculosPendientes = new Set<ReturnType<typeof setTimeout>>(); //Temporizadores de cálculo diferido (calcularDatosOt); se cancelan al guardar
  private calculoOtProgramado?: ReturnType<typeof setTimeout>; //Último recálculo de calcularDatosOt; cada tecla reemplaza al anterior (debounce)
  private textoBusquedaProducto = new Subject<string>(); //Texto digitado en Referencia; se consulta con debounce (iniciarBusquedaProductos)
  private suscripcionBusquedaProductos?: Subscription; //Búsqueda de productos por nombre; se cierra en ngOnDestroy
  produccionProcesos: any[] = []; //Fila de Estados Procesos OT con los kg (y und) producidos por proceso de la OT consultada
  otProduccion: number | null = null; //Número de la OT a la que pertenece la tabla de producción por proceso
  cargandoProduccion: boolean = false; //Indica si se está consultando la producción por proceso
  private consultaProduccion?: Subscription; //Consulta de producción en curso; se cancela al consultar otra OT para no mezclar datos
  ModalCrearProductos: boolean = false; //Funcion que va a mostrar o no el modal de productos
  ModalCrearCliente: boolean = false; //Funcion que va a mostrar o no el modal de clientes

  arrayMateriales: any = []; /** Array que colocará las materiales en los combobox al momento de crear la OT*/
  formatos: any = []; //Variable que servirá para almacenar los formatos que se harán en extrusion
  arrayPigmentos: any = []; /** Array que colocará las pigmentos en los combobox al momento de crear la OT */
  opcionesSiNo: { label: string, value: boolean }[] = [{ label: 'Sí', value: true }, { label: 'No', value: false }]; //Opciones del campo grafilado
  tratado: any = []; //Vairbale que servirá para almacenar los tratado que puede tener una bolsa en el proceso de extrusion
  arrayUnidadesMedidas: any = []; /** Array que colocará las unidades de medida en los combobox al momento de crear la OT*/
  tiposImpresion: any = []; //Variable que guardará los diferentes tipos de impresion que hay en la empresa
  arrayTintas: any = []; /** Array que colocará las tintas en los combobox al momento de crear la OT */
  laminado_capas: any = []; //Vaiable qie almacenará los diferentes laminados
  tipoProductos: any[] = []; //Vairbla que almacenará la informacion de ls tipos de productos
  tipoSellado: any[] = []; //Variable que almacenará la informacion de los tipos de sellados

  extrusion: boolean = false; //Variable que servirá para saber si se pasará por el proceso o no
  impresion: boolean = false; //Variable que servirá para saber si se pasará por el proceso o no
  laminado: boolean = false; //Variable que servirá para saber si se pasará por el proceso o no
  doblado: boolean = false; //Variable que servirá para saber si se pasará por el proceso o no
  sellado: boolean = false; //Variable que servirá para saber si se pasará por el proceso o no
  corte: boolean = false; //Variable que servirá para saber si se pasará por el proceso o no
  cyrel: boolean = false; //Variable que servirá para saber si se pasará por el proceso o no
  motrarEmpresaEtiquetas: boolean = true; //Variable que servirá para saber si se muestra o no la empresa en las etiquetas
  informacionSeleccionada: any; //Variable que almacenará la información del producto seleccionado
  presentacionProducto: string; //Variablle que almacenará la presentacion del producto
  cantidadProducto: number = 0; //Variable que almacenará la cantidad de producto que se va a pedir
  valorProducto: number = 0; //Variable que almacenrá ek valor total el producto
  netoKg: number = 0; //Variable que almacenará el peso neto en kilogramos que se debe producir
  valorKg: number = 0; //Variable que almacenará el valor del kilogramo
  valorOt: number = 0; //Variable que almacenará el valor total de la orden de trabajo
  margenKg: number = 0; //Variable que almcanerá la cantidad adicional de kg que se harán para manejar un margen de error
  pesoPaquete: number = 0; //Variable que almacenará cuantos kg pesa un paquete
  pesoBulto: number = 0; //Variable que almacenará cuantos kg pesa un bulto
  pesoProducto: number = 0; //Variable que almacenará el peso del producto
  pesoMillar: number = 0; //Variable que almacenará el peso de un millar
  private sinPesoParaValorKg: boolean = false; //true si el último cálculo dejó Valor Kg en 0 por falta de Peso Millar (o de cantidad por paquete)
  private valorKgCargado: number | null = null; //Valor Kg guardado de la OT abierta en edición; se conserva cuando la presentación no lo calcula (MTS)
  private rowVersionCargada: string | null = null; //Versión de la fila (rowVersion de getOrdenTrabajo, base64) de la OT abierta en edición; se envía como Ot_RowVersion para detectar ediciones concurrentes (409)
  private nombresCargados: { sede: any, cliente: string, producto: string } | null = null; //Nombres de cliente y producto con los que se cargó la OT en edición; si cambian, la confirmación lo indica
  /** Pestaña abierta (0 = Buscar Orden Trabajo, 1 = Crear Orden Trabajo); el botón de tutorial del título muestra el de esa pestaña. */
  tabActivo: number = 0;
  /** true después de intentar crear o editar: la vista resalta en rojo los campos obligatorios vacíos (clase ot-resaltar-obligatorios). */
  resaltarObligatorios: boolean = false;
  editandoReferencia: boolean = false; //true si se habilitó (lápiz) el campo Referencia para cambiar el nombre del item; si no, es de solo lectura
  private referenciaOriginal: string | null = null; //Nombre del item al habilitar el cambio de referencia; se restaura si se cancela
  modalHistorialNombres: boolean = false; //Muestra el historial de nombres del item
  historialNombres: HistorialNombreProducto[] = []; //Cambios de nombre del item (más reciente primero)
  cargandoHistorialNombres: boolean = false; //Indica si se está consultando el historial de nombres
  private avisoSinPesoMostrado: boolean = false; //Indica si la última validación de guardado ya mostró el aviso de Valor Kg 0 (evita repetirlo al confirmar la edición)
  producto: number = 0; //Variable que almacenará el producto al que se espera que se le cree la orden de trabajo
  ArrayProducto: any[] = []; //Variable que tendrá la informacion de los productos que fueron pedidos

  modalMezclas: boolean = false; //Variable que mostrará o no el modal para crear mezclas.
  mezclasMateriales: any = [] //Vaiable que almacenará las mezclas de materiales
  mezclasMateriales2: any = [] //Vaiable que almacenará los ID de las mezclas de materiales
  mezclasPigmentos: any = []; //Variable que almacenará las mezclas de pigmentos
  mezclasPigmentos2: any = []; //Variable que almacenará los ID de las mezclas de pigmentos
  mezclas: any = []; //Variable que almacenará las mezclas
  arrayMateriales2: any = [];
  modalMateriales: boolean = false;
  modalPigmentos: boolean = false;
  checkedCapa1: boolean = false; //Variable para saber si el checkbox de la capa 1 está seleccionado
  checkedCapa2: boolean = false; //Variable para saber si el checkbox de la capa 2 está seleccionado
  checkedCapa3: boolean = false; //Variable para saber si el checkbox de la capa 3 está seleccionado
  idMezclaSeleccionada: number = 0; //Variable que almacenará el ID de la mezcla que fue seleccionada
  nroCapas: number = 0;
  nroCapasOT: number = 0;
  ultimaOT: number = 0;
  ultimaOTApp: number = 0;
  dataBusquedaxItem: any;
  ultimoItem: number = 0;
  hora: any = moment().format('HH:mm:ss');
  minDate: Date = new Date();

  constructor(private frmBuilderPedExterno: FormBuilder,
    private AppComponent: AppComponent,
    private productoService: ProductoService,
    private clienteServise: ClientesService,
    private undService: UnidadMedidaService,
    private estadosService: EstadosService,
    private msj: MensajesAplicacionService,
    private ordenTrabajoService: Orden_TrabajoService,
    private bagProService: BagproService,
    private servicioTintas: TintasService,
    private servicioMateriales: MaterialProductoService,
    private servicioPigmentos: PigmentoProductoService,
    private tratadoServise: TratadoService,
    private formatoService: FormatosService,
    private tiposImpresionService: Tipos_ImpresionService,
    private laminadoCapasService: Laminado_CapaService,
    private mezclaMaterialService: Mezclas_MaterialesService,
    private mezclaPigmentosService: Mezclas_PigmentosService,
    private mezclasService: MezclasService,
    private tiposProductosService: TipoProductoService,
    private tipoSelladoService: TiposSelladoService,
    private otSelladoCorteService: OrdenTrabajo_Sellado_CorteService,
    private usuarioService: UsuarioService,
    private messageService: MessageService,
    private shepherdService: ShepherdService,
    private svcSedes: SedeClienteService,
    private svcExistencias: ExistenciasProductosService,
    private estadosProcesosService: EstadosProcesos_OTService,
    private calculoCostos: OtCalculoCostosService,
    private creacionPdf: CreacionPdfService,) {

    this.FormOrdenTrabajo = this.frmBuilderPedExterno.group({
      OT_Id: [null],
      Id_Vendedor: [null, Validators.required],
      Nombre_Vendedor: [null, Validators.required],
      OT_FechaCreacion: [this.today, Validators.required],
      OT_FechaEntrega: [new Date(), Validators.required], // Obligatoria (la API también la exige)
      Id_Cliente: [null, Validators.required],
      Nombre_Cliente: [null, Validators.required],
      Id_Producto: [null, Validators.required],
      Nombre_Producto: [null, Validators.required],
      Cantidad: [null, Validators.required],
      Presentacion: [null, Validators.required],
      Precio: [null, Validators.required],
      Margen: [null, Validators.required],
      OT_Estado: [15, Validators.required],
      OT_Observacion: [null],
    });

    this.FormOrdenTrabajoExtrusion = this.frmBuilderPedExterno.group({
      /*** Datos para tabla de extrusión */
      Material_Extrusion: [1, Validators.required],
      Formato_Extrusion: [1, Validators.required],
      Pigmento_Extrusion: [1, Validators.required],
      Ancho_Extrusion1: [0, Validators.required],
      Ancho_Extrusion2: [0, Validators.required],
      Ancho_Extrusion3: [0, Validators.required],
      Calibre_Extrusion: [0, Validators.required],
      UnidadMedida_Extrusion: [null, Validators.required],
      Tratado_Extrusion: [1, Validators.required],
      Grafilado_Extrusion: [null],
      Peso_Extrusion: [0, Validators.required],
      Extrusion_Observacion: [null],
    });

    this.FormOrdenTrabajoImpresion = this.frmBuilderPedExterno.group({
      /*** Datos para tabla de impresióm */
      Tipo_Impresion: [1, Validators.required],
      Rodillo_Impresion: [0, Validators.required],
      Pista_Impresion: [0, Validators.required],
      Tinta_Impresion1: ['NO APLICA', Validators.required],
      Tinta_Impresion2: ['NO APLICA', Validators.required],
      Tinta_Impresion3: ['NO APLICA', Validators.required],
      Tinta_Impresion4: ['NO APLICA', Validators.required],
      Tinta_Impresion5: ['NO APLICA', Validators.required],
      Tinta_Impresion6: ['NO APLICA', Validators.required],
      Tinta_Impresion7: ['NO APLICA', Validators.required],
      Tinta_Impresion8: ['NO APLICA', Validators.required],
      Impresion_Observacion: [null],
    });

    this.FormOrdenTrabajoLaminado = this.frmBuilderPedExterno.group({
      /*** Datos para tabla de Laminado */
      Capa_Laminado1: [1, Validators.required],
      Calibre_Laminado1: [0, Validators.required],
      cantidad_Laminado1: [0, Validators.required],
      Capa_Laminado2: [1, Validators.required],
      Calibre_Laminado2: [0, Validators.required],
      cantidad_Laminado2: [0, Validators.required],
      Capa_Laminado3: [1, Validators.required],
      Calibre_Laminado3: [0, Validators.required],
      cantidad_Laminado3: [0, Validators.required],
      Laminado_Observacion: [null],
    });

    this.FormOrdenTrabajoCorte = this.frmBuilderPedExterno.group({
      Formato_Corte: [null, Validators.required],
      Ancho_Corte: [null, Validators.required],
      Largo_Corte: [null, Validators.required],
      Fuelle_Corte: [null, Validators.required],
      Margen_Corte: [null, Validators.required],
      Etiqueta_Ancho_Corte: ['0'], // Ya no se muestra en la vista; se conserva el valor cargado para no romper el contrato de la API
      Calibre_Cliente_Corte: ['0'], // Se guarda y se carga en SelladoCorte_Etiqueta_Largo (EtiquetaLargo en BagPro)
      Etiqueta_Fuelle_Corte: ['0'], // Ya no se muestra en la vista; se conserva el valor cargado para no romper el contrato de la API
      SelladoCorte_Observacion: [null],
    });

    this.FormOrdenTrabajoSellado = this.frmBuilderPedExterno.group({
      Formato_Sellado: [null, Validators.required],
      Ancho_Sellado: [null, Validators.required],
      Largo_Sellado: [null, Validators.required],
      Fuelle_Sellado: [null, Validators.required],
      Solapa_Sellado: [null,],
      Ancho_Sellado1: [0],
      Ancho_Sellado2: [0],
      Ancho_Sellado3: [0],
      Etiqueta_Ancho_Sellado: [null, Validators.required],
      Etiqueta_Largo_Sellado: [null], // Ya no se muestra en la vista; se conserva para no romper el contrato de la API
      Etiqueta_Fuelle_Sellado: [null], // Ya no se muestra en la vista; se conserva para no romper el contrato de la API
      Calibre_Sellado: [0],
      Margen_Sellado: [null, Validators.required],
      PesoMillar: [0, Validators.required],
      TipoSellado: [0, Validators.required],
      CantidadPaquete: [0, Validators.required],
      PesoPaquete: [0, Validators.required],
      CantidadBulto: [0, Validators.required],
      PesoBulto: [0, Validators.required],
      PrecioDia: [0, Validators.required],
      PrecioNoche: [0, Validators.required],
      PrecioWiketiadoDia_Mq50: [0, Validators.required],
      PrecioWiketiadoNoche_Mq50: [0, Validators.required],
      PrecioWiketiadoDia_Mq9: [0, Validators.required],
      PrecioWiketiadoNoche_Mq9: [0, Validators.required],
      SelladoCorte_Observacion: [null],
    });

    this.FormOrdenTrabajoMezclas = this.frmBuilderPedExterno.group({
      Id_Mezcla: [null, Validators.required],
      Nombre_Mezclas: [null, Validators.required],
      Chechbox_Capa1: [null, Validators.required],
      Chechbox_Capa2: [null, Validators.required],
      Chechbox_Capa3: [null, Validators.required],
      Proc_Capa1: [0, Validators.required],
      Proc_Capa2: [0, Validators.required],
      Proc_Capa3: [0, Validators.required],
      materialP1_Capa1: [1, Validators.required],
      PorcentajeMaterialP1_Capa1: [0, Validators.required],
      materialP1_Capa2: [1, Validators.required],
      PorcentajeMaterialP1_Capa2: [0, Validators.required],
      materialP1_Capa3: [1, Validators.required],
      PorcentajeMaterialP1_Capa3: [0, Validators.required],
      materialP2_Capa1: [1, Validators.required],
      PorcentajeMaterialP2_Capa1: [0, Validators.required],
      materialP2_Capa2: [1, Validators.required],
      PorcentajeMaterialP2_Capa2: [0, Validators.required],
      materialP2_Capa3: [1, Validators.required],
      PorcentajeMaterialP2_Capa3: [0, Validators.required],
      materialP3_Capa1: [1, Validators.required],
      PorcentajeMaterialP3_Capa1: [0, Validators.required],
      materialP3_Capa2: [1, Validators.required],
      PorcentajeMaterialP3_Capa2: [0, Validators.required],
      materialP3_Capa3: [1, Validators.required],
      PorcentajeMaterialP3_Capa3: [0, Validators.required],
      materialP4_Capa1: [1, Validators.required],
      PorcentajeMaterialP4_Capa1: [0, Validators.required],
      materialP4_Capa2: [1, Validators.required],
      PorcentajeMaterialP4_Capa2: [0, Validators.required],
      materialP_Capa3: [1, Validators.required],
      PorcentajeMaterialP_Capa3: [0, Validators.required],
      MezclaPigmentoP1_Capa1: [1, Validators.required],
      PorcentajeMezclaPigmentoP1_Capa1: [0, Validators.required],
      MezclaPigmentoP1_Capa2: [1, Validators.required],
      PorcentajeMezclaPigmentoP1_Capa2: [0, Validators.required],
      MezclaPigmento1_Capa3: [1, Validators.required],
      PorcentajeMezclaPigmentoP1_Capa3: [0, Validators.required],
      MezclaPigmentoP2_Capa1: [1, Validators.required],
      PorcentajeMezclaPigmentoP2_Capa1: [0, Validators.required],
      MezclaPigmentoP2_Capa2: [1, Validators.required],
      PorcentajeMezclaPigmentoP2_Capa2: [0, Validators.required],
      MezclaPigmento2_Capa3: [1, Validators.required],
      PorcentajeMezclaPigmentoP2_Capa3: [0, Validators.required],
    });

    /** Formulario para creación de mezclas */
    this.formCrearMezclas = this.frmBuilderPedExterno.group({
      mezclaId: '',
      Nombre_Mezclas: ['', Validators.required],
      Material_MatPrima: [0, Validators.required],
      Chechbox_Capa1: ['', Validators.required],
      Chechbox_Capa2: ['', Validators.required],
      Chechbox_Capa3: ['', Validators.required],
      Proc_Capa1: [0, Validators.required],
      Proc_Capa2: [0, Validators.required],
      Proc_Capa3: [0, Validators.required],
      materialP1_Capa1: ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP1_Capa1: [0, Validators.required],
      materialP1_Capa2: ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP1_Capa2: [0, Validators.required],
      materialP1_Capa3: ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP1_Capa3: [0, Validators.required],
      materialP2_Capa1: ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP2_Capa1: [0, Validators.required],
      materialP2_Capa2: ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP2_Capa2: [0, Validators.required],
      materialP2_Capa3: ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP2_Capa3: [0, Validators.required],
      materialP3_Capa1: ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP3_Capa1: [0, Validators.required],
      materialP3_Capa2: ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP3_Capa2: [0, Validators.required],
      materialP3_Capa3: ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP3_Capa3: [0, Validators.required],
      materialP4_Capa1: ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP4_Capa1: [0, Validators.required],
      materialP4_Capa2: ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP4_Capa2: [0, Validators.required],
      materialP4_Capa3: ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP4_Capa3: [0, Validators.required],
      MezclaPigmentoP1_Capa1: ['NO APLICA PIGMENTO', Validators.required],
      PorcentajeMezclaPigmentoP1_Capa1: [0, Validators.required],
      MezclaPigmentoP1_Capa2: ['NO APLICA PIGMENTO', Validators.required],
      PorcentajeMezclaPigmentoP1_Capa2: [0, Validators.required],
      MezclaPigmento1_Capa3: ['NO APLICA PIGMENTO', Validators.required],
      PorcentajeMezclaPigmentoP1_Capa3: [0, Validators.required],
      MezclaPigmentoP2_Capa1: ['NO APLICA PIGMENTO', Validators.required],
      PorcentajeMezclaPigmentoP2_Capa1: [0, Validators.required],
      MezclaPigmentoP2_Capa2: ['NO APLICA PIGMENTO', Validators.required],
      PorcentajeMezclaPigmentoP2_Capa2: [0, Validators.required],
      MezclaPigmento2_Capa3: ['NO APLICA PIGMENTO', Validators.required],
      PorcentajeMezclaPigmentoP2_Capa3: [0, Validators.required],
    });


    this.formCrearMateriales = this.frmBuilderPedExterno.group({
      matNombre: [null, Validators.required],
      matDescripcion: [null, Validators.required],
    });

    this.formCrearPigmentos = this.frmBuilderPedExterno.group({
      pigNombre: [null, Validators.required],
      pigDescripcion: [null, Validators.required],
    });
  }

  ngOnInit() {
    this.iniciarBusquedaProductos();
    this.lecturaStorage();
    this.consultarVendedores();
    this.consultarPresentaciones();
    this.consultarEstados();
    this.cargarTintasEnProcesoImpresion();
    this.cargarPigmentosEnProcesoExtrusion();
    this.cargarMaterialEnProcesoExtrusion();
    this.cargarUnidadMedidaEnProcesoExtrusion();
    this.cargarTratadoEnProcesoExtrusion();
    this.cargarFormatosEnProcesoExtrusion();
    this.cargarTiposImpresion();
    this.cargarLaminados();
    this.cargarMezclaMateria();
    this.cargarMezclaPigmento();
    this.cargarMezclas();
    this.cargarTiposProductos();
    this.cargarTiposSellado();
    this.sincronizarAnchoTotalSellado();
    this.limpiarCampos();
    this.ultimaOTBagPro();
    this.ultimoIdProducto();
  }

  /**
   * Muestra el tutorial de la pestaña abierta: Buscar OT (tabActivo 0) o Crear OT (tabActivo 1).
   * Cada tutorial solo apunta a elementos de su pestaña, porque los de la otra pestaña están ocultos.
   * @returns No retorna un valor.
   */
  verTutorial() {
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(this.tabActivo == 0 ? stepsBusquedaOrdenesTrabajo : defaultSteps);
    this.shepherdService.start();
  }

  /** Función que mostrará un tutorial describiendo paso a paso cada funcionalidad de la aplicación en el apartado de mezclas*/
  verTutorial2() {
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps2);
    this.shepherdService.start();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage() {
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  // Funcion que colocará los campos del formulario principal con datos predeterminados
  limpiarFormOrdenTrabajo() {
    this.FormOrdenTrabajo.reset();
    this.FormOrdenTrabajo.patchValue({
      OT_FechaCreacion: this.today,
      OT_FechaEntrega: new Date(), // Por defecto la fecha de hoy
      OT_Estado: 15
    });
  }

  /**
   * Restaura los valores iniciales del formulario de extrusión.
   *
   * @returns No retorna un valor.
   */
  limpiarFormExtrusion() {
    this.FormOrdenTrabajoExtrusion.patchValue({
      Material_Extrusion: 1,
      Formato_Extrusion: 1,
      Pigmento_Extrusion: 1,
      Ancho_Extrusion1: 0,
      Ancho_Extrusion2: 0,
      Ancho_Extrusion3: 0,
      Calibre_Extrusion: 0,
      UnidadMedida_Extrusion: 'Cms',
      Tratado_Extrusion: 1,
      Grafilado_Extrusion: null,
      Peso_Extrusion: 0,
      Extrusion_Observacion: null,
    });
  }

  /**
   * Restaura los valores iniciales del formulario de impresión.
   *
   * @returns No retorna un valor.
   */
  limpiarFormImpresion() {
    this.FormOrdenTrabajoImpresion.patchValue({
      Tipo_Impresion: 1,
      Rodillo_Impresion: 0,
      Pista_Impresion: 0,
      Tinta_Impresion1: 'NO APLICA',
      Tinta_Impresion2: 'NO APLICA',
      Tinta_Impresion3: 'NO APLICA',
      Tinta_Impresion4: 'NO APLICA',
      Tinta_Impresion5: 'NO APLICA',
      Tinta_Impresion6: 'NO APLICA',
      Tinta_Impresion7: 'NO APLICA',
      Tinta_Impresion8: 'NO APLICA',
      Impresion_Observacion: null,
    });
  }

  /**
   * Restaura los valores iniciales del formulario de laminado.
   *
   * @returns No retorna un valor.
   */
  limpiarFormLaminado() {
    this.FormOrdenTrabajoLaminado.patchValue({
      Capa_Laminado1: 1,
      Calibre_Laminado1: 0,
      cantidad_Laminado1: 0,
      Capa_Laminado2: 1,
      Calibre_Laminado2: 0,
      cantidad_Laminado2: 0,
      Capa_Laminado3: 1,
      Calibre_Laminado3: 0,
      cantidad_Laminado3: 0,
      Laminado_Observacion: null,
    });
  }

  /**
   * Restaura los valores iniciales del formulario de corte.
   *
   * @returns No retorna un valor.
   */
  limpiarFormCorte() {
    this.FormOrdenTrabajoCorte.patchValue({
      Formato_Corte: 'SIN FORMATO',
      Ancho_Corte: 0,
      Largo_Corte: 0,
      Fuelle_Corte: 0,
      Margen_Corte: 0,
      Etiqueta_Ancho_Corte: '0',
      Calibre_Cliente_Corte: '0',
      Etiqueta_Fuelle_Corte: '0',
    });
  }

  /**
   * Restaura los valores iniciales del formulario de sellado.
   *
   * @returns No retorna un valor.
   */
  limpiarFormSellado() {
    this.FormOrdenTrabajoSellado.patchValue({
      Formato_Sellado: 'SIN FORMATO',
      Ancho_Sellado: 0,
      Largo_Sellado: 0,
      Fuelle_Sellado: 0,
      Solapa_Sellado: 0,
      Ancho_Sellado1: 0,
      Ancho_Sellado2: 0,
      Ancho_Sellado3: 0,
      Margen_Sellado: 0,
      Etiqueta_Ancho_Sellado: 0,
      Etiqueta_Largo_Sellado: 0,
      Etiqueta_Fuelle_Sellado: 0,
      Calibre_Sellado: 0,
      PesoMillar: 0,
      TipoSellado: 'NO APLICA',
      CantidadPaquete: 0,
      PesoPaquete: 0,
      CantidadBulto: 0,
      PesoBulto: 0,
      PrecioDia: 0,
      PrecioNoche: 0,
      PrecioWiketiadoDia_Mq50: 0,
      PrecioWiketiadoNoche_Mq50: 0,
      PrecioWiketiadoDia_Mq9: 0,
      PrecioWiketiadoNoche_Mq9: 0,
    });
  }

  // Funcion que va a limpiar los campos del formulario de mezclas
  limpiarFormMezclas() {
    this.FormOrdenTrabajoMezclas.patchValue({ Nombre_Mezclas: 'ALTA 1 X 1 NEGRO', });
  }

  /**
   * Restaura los formularios de proceso y los datos derivados del producto.
   * Cancela el refresco pendiente del producto anterior y los cálculos diferidos, para que una respuesta tardía no
   * vuelva a llenar ArrayProducto ni programe un recálculo con el item anterior. Si ese refresco venía de un guardado,
   * su `finalize` libera la pantalla de carga; quien llama (`consultarInfoProducto`) la vuelve a activar para su consulta.
   *
   * @returns No retorna un valor.
   */
  limpiarProducto() {
    this.refrescoProducto?.unsubscribe();
    this.cancelarCalculosPendientes();
    this.limpiarFormExtrusion();
    this.limpiarFormImpresion();
    this.limpiarFormLaminado();
    this.limpiarFormCorte();
    this.limpiarFormSellado();
    this.FormOrdenTrabajoCorte.patchValue({ SelladoCorte_Observacion: null });
    this.FormOrdenTrabajoSellado.patchValue({ SelladoCorte_Observacion: null });
    this.limpiarFormMezclas();
    this.extrusion = false;
    this.impresion = false;
    this.laminado = false;
    this.sellado = false;
    this.corte = false;
    this.cyrel = false;
    this.cantidadProducto = 0;
    this.valorProducto = 0;
    this.netoKg = 0;
    this.valorKg = 0;
    this.valorOt = 0;
    this.margenKg = 0;
    this.pesoPaquete = 0;
    this.pesoBulto = 0;
  }

  /**
   * Limpia los datos de la orden y restablece los valores iniciales de sus formularios.
   * Cancela el refresco pendiente del producto y los cálculos diferidos para que no vuelvan a llenar
   * ArrayProducto ni los costos con datos de la OT anterior.
   *
   * @returns No retorna un valor.
   */
  limpiarCampos() {
    console.log('Limpiando campos de la orden de trabajo');
    this.refrescoProducto?.unsubscribe();
    this.cancelarCalculosPendientes();
    this.limpiarFormOrdenTrabajo();
    this.limpiarFormExtrusion();
    this.limpiarFormImpresion();
    this.limpiarFormLaminado();
    this.limpiarFormCorte();
    this.limpiarFormSellado();
    this.FormOrdenTrabajoCorte.patchValue({ SelladoCorte_Observacion: null });
    this.FormOrdenTrabajoSellado.patchValue({ SelladoCorte_Observacion: null });
    this.limpiarFormMezclas();
    this.cerrarMensaje();
    this.edicionOrdenTrabajo = false;
    this.otCargada = null;
    this.limpiarProduccionProcesos();
    this.cyrel = false;
    this.corte = false;
    this.motrarEmpresaEtiquetas = true;
    this.ArrayProducto = [];
    this.checkedCapa1 = false;
    this.checkedCapa2 = false;
    this.checkedCapa3 = false;
    this.presentacionProducto = '';
    this.producto = 0;
    this.idMezclaSeleccionada = 0;
    this.nroCapas = 0;
    this.nroCapasOT = 0;
    this.extrusion = false;
    this.impresion = false;
    this.laminado = false;
    this.sellado = false;
    this.cargando = false;
    this.cantidadProducto = 0;
    this.valorProducto = 0;
    this.netoKg = 0;
    this.valorKg = 0;
    this.valorOt = 0;
    this.margenKg = 0;
    this.pesoPaquete = 0;
    this.pesoBulto = 0;
    this.informacionSeleccionada = 0;
    this.valorKgCargado = null;
    this.rowVersionCargada = null;
    this.nombresCargados = null;
    this.editandoReferencia = false;
    this.referenciaOriginal = null;
    this.resaltarObligatorios = false;
  }

  /**
   * Al crear o editar una OT, habilita o cancela el cambio del nombre (referencia) del item. El campo Referencia es de solo
   * lectura hasta habilitarlo; habilitado, su texto se envía como nuevo nombre: queda en el maestro, en ClientesOT_Item de
   * BagPro y en Zeus, y el nombre anterior en el historial. Al cancelar, se restaura el nombre que tenía.
   * @returns No retorna un valor.
   */
  alternarEdicionReferencia() {
    if (this.editandoReferencia) {
      this.FormOrdenTrabajo.patchValue({ Nombre_Producto: this.referenciaOriginal });
      this.editandoReferencia = false;
      this.referenciaOriginal = null;
      return;
    }
    if (!this.producto) {
      this.msj.mensajeAdvertencia(`¡Advertencia!`, `Primero cargue el item al que le quiere cambiar la referencia.`);
      return;
    }
    this.referenciaOriginal = this.FormOrdenTrabajo.value.Nombre_Producto;
    this.editandoReferencia = true;
  }

  /**
   * Abre el historial de nombres (referencias) del item cargado.
   * @returns No retorna un valor.
   */
  verHistorialNombres() {
    if (!this.producto) {
      this.msj.mensajeAdvertencia(`¡Advertencia!`, `Primero cargue un item.`);
      return;
    }
    this.historialNombres = [];
    this.modalHistorialNombres = true;
    this.cargandoHistorialNombres = true;
    this.productoService.GetHistorialNombres(this.producto).subscribe({
      next: data => { this.historialNombres = data ?? []; this.cargandoHistorialNombres = false; },
      error: error => {
        this.cargandoHistorialNombres = false;
        this.msj.mensajeError(`¡No fue posible consultar el historial de nombres del item ${this.producto}!`, error?.message ?? '');
      },
    });
  }

  //Cargar modal de crear producto
  LlamarModalCrearProducto = () => this.ModalCrearProductos = true;

  // Funcion para llamar el modal que crea clientes
  LlamarModalCrearCliente = () => this.ModalCrearCliente = true;

  /**
   * Cierra el mensaje de confirmación de edición de la OT y vuelve a habilitar los botones "Editar OT".
   * @returns No retorna un valor.
   */
  cerrarMensaje() {
    this.messageService.clear('editarOrden');
    this.confirmandoEdicion = false;
  }

  /** Carga las tintas para impresión y ajusta las selecciones actuales al nombre de cada opción. */
  cargarTintasEnProcesoImpresion = () => this.servicioTintas.srvObtenerLista().subscribe(tintas => {
    this.arrayTintas = tintas.filter((item) => item.catMP_Id == 7);
    this.sincronizarTintasFormulario();
  });

  /** Función que cargará los pigmentos en el combobox al momento de crear la OT. */
  cargarPigmentosEnProcesoExtrusion = () => this.servicioPigmentos.srvObtenerLista().subscribe(pigmentos => this.arrayPigmentos = pigmentos);

  /** Función que cargará los materiales en el combobox al momento de crear la OT. */
  cargarMaterialEnProcesoExtrusion = () => this.servicioMateriales.srvObtenerLista().subscribe(materiasProd => this.arrayMateriales = materiasProd);

  /** Función que cargará las unidades de medida en el combobox al momento de crear la OT. */
  cargarUnidadMedidaEnProcesoExtrusion = () => this.undService.srvObtenerLista().subscribe(datos => this.arrayUnidadesMedidas = datos.filter((item) => ['Cms', 'Plgs'].includes(item.undMed_Id)));

  //Funcion que se encargará de cargar los diferentes tratados para el proceso de extrusion
  cargarTratadoEnProcesoExtrusion = () => this.tratadoServise.srvObtenerLista().subscribe(datos_tratado => this.tratado = datos_tratado);

  //Funcion que cargará los formatos para el proceso de extrusion
  cargarFormatosEnProcesoExtrusion = () => this.formatoService.srvObtenerLista().subscribe(datos_formatos => this.formatos = datos_formatos);

  //Funcion que cargará los diferentes tipos de impresion que maneja la empresa
  cargarTiposImpresion = () => this.tiposImpresionService.srvObtenerLista().subscribe(datos => this.tiposImpresion = datos);

  //Funcion que cargará los diferentes laminados
  cargarLaminados = () => this.laminadoCapasService.srvObtenerLista().subscribe(datos => this.laminado_capas = datos);

  // Funcion que cargará las mezclas de materiales
  cargarMezclaMateria = () => this.mezclaMaterialService.srvObtenerLista().subscribe(datos => this.mezclasMateriales = datos);

  // Funcion que cargará las mezclas de pigmentos
  cargarMezclaPigmento = () => this.mezclaPigmentosService.srvObtenerLista().subscribe(datos => this.mezclasPigmentos = datos);

  // Funcion que cargará el nombre de las mezclas
  cargarMezclas = () => this.mezclasService.srvObtenerLista().subscribe(datos => this.mezclas = datos);

  // Funcion que va cargará la informacion de los tipos de productos
  cargarTiposProductos = () => this.tiposProductosService.srvObtenerLista().subscribe(datos => this.tipoProductos = datos);

  // Funcion que va a cargar la informacion de los tipos de sellado
  cargarTiposSellado = () => this.tipoSelladoService.srvObtenerLista().subscribe(datos => this.tipoSellado = datos);

  // Funcion que cargará las mezclas de materiales
  cargarMezclaMateria2 = () => this.mezclaMaterialService.srvObtenerLista().subscribe(datos => this.mezclasMateriales2 = datos);

  // Funcion que cargará las mezclas de pigmentos
  cargarMezclaPigmento2 = () => this.mezclaPigmentosService.srvObtenerLista().subscribe(datos => this.mezclasPigmentos2 = datos);

  /** Función que cargará los materiales en el combobox al momento de llamar el modal de Crear Mezclas. */
  cargarMateriales_MatPrima = () => this.servicioMateriales.srvObtenerLista().subscribe(materiasProd => this.arrayMateriales2 = materiasProd);

  /**
   * Al marcar Impresión fija el tipo de impresión en flexografía (único tipo vigente; Rotograbado fue descontinuado).
   * @returns No retorna un valor.
   */
  impresionSeleccionada() {
    if (this.impresion) this.FormOrdenTrabajoImpresion.patchValue({ Tipo_Impresion: 2 });
  }

  /**
   * Obtiene el código hexadecimal de una tinta seleccionada por su nombre.
   * @param color Nombre de la tinta seleccionada.
   * @returns El código hexadecimal de la tinta o null si no existe coincidencia.
   */
  colocarColor(color: unknown): string | null {
    const nombreNormalizado = String(color ?? '').trim().toLowerCase();
    if (!nombreNormalizado) {
      return null;
    }

    const tinta = this.arrayTintas.find((item) =>
      String(item.tinta_Nombre ?? '').trim().toLowerCase() === nombreNormalizado);
    return this.normalizarCodigoColor(tinta?.tinta_CodigoHexadecimal)
      ?? this.colorPorNombre(tinta?.tinta_Nombre ?? color);
  }

  /**
   * Obtiene un color CSS de respaldo a partir del nombre común de la tinta.
   * @param nombre Nombre de la tinta.
   * @returns El color asociado al nombre o null cuando no es un color conocido.
   */
  private colorPorNombre(nombre: unknown): string | null {
    const nombreNormalizado = String(nombre ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
    const colores: Record<string, string> = {
      blanco: '#ffffff',
      amarillo: '#ffff00',
      naranja: '#ffa500',
      cafe: '#a52a2a',
      marron: '#a52a2a',
      rojo: '#ff0000',
      negro: '#000000',
      azul: '#0000ff',
      verde: '#008000',
      morado: '#800080',
      violeta: '#800080',
      rosado: '#ffc0cb',
      rosa: '#ffc0cb',
      gris: '#808080',
      transparente: '#ffffff',
      'no aplica': '#e5e7eb',
    };
    return colores[nombreNormalizado] ?? null;
  }

  /**
   * Normaliza un código hexadecimal para poder aplicarlo como color CSS.
   * @param codigo Código hexadecimal guardado, con o sin el prefijo #.
   * @returns El código hexadecimal CSS normalizado o null si el formato no es válido.
   */
  normalizarCodigoColor(codigo: unknown): string | null {
    const codigoNormalizado = String(codigo ?? '').trim().replace(/^#/, '');
    return /^(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(codigoNormalizado)
      ? `#${codigoNormalizado}`
      : null;
  }

  /**
   * Devuelve el nombre de tinta que coincide con las opciones del dropdown.
   * @param nombre Nombre de tinta recibido desde una orden de trabajo.
   * @returns El nombre canónico de la opción o el nombre recibido sin espacios exteriores.
   */
  private nombreTintaParaDropdown(nombre: unknown): string {
    const nombreRecibido = String(nombre ?? '').trim();
    const nombreNormalizado = nombreRecibido.toLowerCase();
    const tinta = this.arrayTintas.find((item) =>
      String(item.tinta_Nombre ?? '').trim().toLowerCase() === nombreNormalizado);
    return tinta?.tinta_Nombre ?? nombreRecibido;
  }

  /**
   * Sincroniza los valores actuales del formulario con los nombres canónicos de las tintas.
   * @returns No retorna un valor.
   */
  private sincronizarTintasFormulario(): void {
    for (let numeroTinta = 1; numeroTinta <= 8; numeroTinta++) {
      const control = this.FormOrdenTrabajoImpresion.get(`Tinta_Impresion${numeroTinta}`);
      if (control) {
        control.setValue(this.nombreTintaParaDropdown(control.value), { emitEvent: false });
      }
    }
  }

  /**
   * Consulta las opciones de vendedor y sincroniza el vendedor de la OT si ya tiene identificador.
   * @returns No retorna un valor.
   */
  consultarVendedores() {
    let asesor: any = this.ValidarRol == 2 ? this.AppComponent.storage_Id : null;
    this.usuarioService.GetVendedores().subscribe(data => {
      this.vendedores = data;
      this.vendedores = asesor ? this.vendedores.filter(x => x.usua_Id == asesor) : this.vendedores
      this.vendedores.sort((a, b) => a.usua_Nombre.localeCompare(b.usua_Nombre));

      const idVendedor = this.FormOrdenTrabajo.get('Id_Vendedor')?.value;
      if (idVendedor !== null && idVendedor !== undefined && String(idVendedor).trim() !== '') {
        this.seleccionarVendedorPorId(idVendedor);
      }
    });
  }

  // Funcion que va a consultar los clientes de la empresa (al crear y al editar, para elegir otro cliente).
  consultarClientes = () => {
    let nombre = this.FormOrdenTrabajo.value.Nombre_Cliente;
    if (!nombre || nombre.trim() === '' || nombre.trim().length < 3) return;

    this.clienteServise.GetSedesClientes_NombreCliente(nombre).subscribe(data => {
      this.clientes = data;
      this.clientes.sort((a, b) => a.cli_Nombre.localeCompare(b.cli_Nombre));
    }, error => {
      console.error(error);
    });
  }

  /**
   * Coloca la información del cliente seleccionado y su vendedor en el formulario.
   * En modo edición cambia el cliente (sede) de la OT; si no se elige de la lista, el texto escrito queda como
   * nombre del cliente solo para esa OT.
   * @returns No retorna un valor.
   */
  clienteSeleccionado() {
    let id_cliente: any = this.FormOrdenTrabajo.value.Nombre_Cliente;
    console.log(this.clientes, id_cliente);

    let cliente = this.clientes.find(x => x.sedeCli_Id == parseInt(id_cliente));
    console.log(cliente);

    if (!cliente) return;
    let vendedor = (cliente.usua_Id).toString();

    this.FormOrdenTrabajo.patchValue({
      'Id_Cliente': cliente.sedeCli_Id,
      'Nombre_Cliente': cliente.cli_Nombre,
      'Id_Vendedor': vendedor.length == 2 ? vendedor = `0${vendedor}` : vendedor.length == 1 ? `00${vendedor}` : vendedor,
      'Nombre_Vendedor': this.idVendedorParaDropdown(cliente.usua_Id),
    });
  }

  // Funcion que va a limpiar los campos de cliente
  limpiarCliente() {
    this.FormOrdenTrabajo.patchValue({
      Id_Cliente: null,
      Nombre_Cliente: null
    });
  }

  // Funcion que va a consultar los productos de la empresa. En modo edición no busca: el campo es el nombre del producto
  // (se actualiza en el maestro al editar la OT); el item se cambia desde el campo "Item".
  // Solo envía el texto: la consulta la hace `iniciarBusquedaProductos` con debounce.
  consultarProductos() {
    if (this.edicionOrdenTrabajo || this.editandoReferencia) return;
    this.textoBusquedaProducto.next(`${this.FormOrdenTrabajo.get('Nombre_Producto')?.value ?? ''}`.trim());
  }

  /**
   * Consulta los productos por nombre mientras se escribe en Referencia sin saturar el API: espera 300 ms sin teclear,
   * ignora textos repetidos (flechas, Shift, etc.), exige al menos 2 caracteres y cancela la consulta anterior si
   * sigue pendiente, para que una respuesta tardía no reemplace la lista de un texto más reciente.
   * Un texto solo numérico (el código que pone el datalist al elegir un item) no se consulta.
   * @returns No retorna un valor.
   */
  private iniciarBusquedaProductos(): void {
    this.suscripcionBusquedaProductos = this.textoBusquedaProducto.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(texto => texto.length >= 2 && isNaN(Number(texto))),
      switchMap(texto => this.productoService.obtenerItemsLike(encodeURIComponent(texto)).pipe(catchError(() => of([])))),
    ).subscribe(data => this.productos = data ?? []);
  }

  ngOnDestroy(): void {
    this.suscripcionBusquedaProductos?.unsubscribe();
    this.busquedaOT?.unsubscribe();
    this.refrescoProducto?.unsubscribe();
    this.cancelarCalculosPendientes();
  }

  /**
   * Coloca el producto elegido en el formulario y, cuando BagPro responde su presentación, carga la información del item.
   * En modo edición, o si el texto no corresponde a un producto de la lista, no hace nada (el texto queda como nombre).
   * @returns No retorna un valor.
   */
  productoSeleccionado() {
    if (this.edicionOrdenTrabajo || this.editandoReferencia) return;
    let id_producto = this.FormOrdenTrabajo.value.Nombre_Producto;
    let producto = this.productos.find(x => x.prod_Id == id_producto);
    if (!producto) return;
    this.FormOrdenTrabajo.patchValue({
      Id_Producto: producto.prod_Id,
      Nombre_Producto: producto.prod_Nombre,
    });
    this.cargarPresentacionYConsultarItem(producto.prod_Id);
  }

  /**
   * Consulta en BagPro la presentación del item, la coloca en el formulario y luego carga la información del item.
   * Si la presentación no se puede consultar, se usa la que tenga el formulario.
   * @param idProducto Código del item.
   * @returns No retorna un valor.
   */
  cargarPresentacionYConsultarItem(idProducto: number) {
    this.cargando = true;
    this.presentacionItem$(idProducto).subscribe(presentacion => this.aplicarPresentacionYConsultarItem(presentacion));
  }

  /**
   * Consulta en BagPro la última presentación del item, convertida a la de Plasticaribe (Kilo → Kg, Unidad → Und).
   * @param idProducto Código del item.
   * @returns Observable con la presentación, o null si el item no tiene ficha en BagPro o la consulta falla.
   */
  private presentacionItem$(idProducto: number): Observable<string | null> {
    return this.bagProService.GetPresentacionItem(idProducto).pipe(
      map(data => {
        const presentacion = `${data?.ptPresentacionNom ?? ''}`.trim();
        if (!presentacion) return null;
        return presentacion == 'Kilo' ? 'Kg' : presentacion == 'Unidad' ? 'Und' : presentacion;
      }),
      catchError(() => of(null))
    );
  }

  /**
   * Coloca la presentación encontrada (si hay) y carga la información del item. Sin presentación se usa la que tenga
   * el formulario (antes se colocaba el texto "undefined" cuando BagPro no tenía el item).
   * @param presentacion Presentación del item, o null para conservar la del formulario.
   * @returns No retorna un valor.
   */
  private aplicarPresentacionYConsultarItem(presentacion: string | null): void {
    if (presentacion) this.FormOrdenTrabajo.patchValue({ Presentacion: presentacion });
    this.cargando = false;
    this.consultarInfoProducto();
  }

  /**
   * Actualiza el identificador cuando se selecciona un vendedor en el dropdown.
   * @returns No retorna un valor.
   */
  vendedorSeleccionado() {
    let nombre = this.FormOrdenTrabajo.value.Nombre_Vendedor;
    if (nombre === null || nombre === undefined) {
      this.limpiarIdVendedor();
      return;
    }

    let vendedor = this.vendedores.find(x => x.usua_Id == nombre);
    if (!vendedor) {
      this.limpiarIdVendedor();
      return;
    }

    const idVendedor = String(vendedor.usua_Id).padStart(3, '0');
    this.FormOrdenTrabajo.patchValue({
      Id_Vendedor: idVendedor,
      Nombre_Vendedor: vendedor.usua_Id,
    });
  }

  /**
   * Limpia el identificador del vendedor cuando se borra la selección del dropdown.
   * @returns No retorna un valor.
   */
  limpiarIdVendedor(): void {
    this.FormOrdenTrabajo.patchValue({ Id_Vendedor: null });
  }

  /**
   * Busca el producto por el código digitado y, si existe, carga su presentación y la información del item.
   * @returns No retorna un valor.
   */
  buscarProductoPorId() {
    let id: any = `${this.FormOrdenTrabajo.value.Id_Producto ?? ''}`.trim();
    if (!id) return;
    this.cargando = true;
    // El producto (Plasticaribe) y su presentación (BagPro) se consultan a la vez en lugar de uno tras otro
    forkJoin({ data: this.productoService.srvObtenerListaPorId(id), presentacion: this.presentacionItem$(id) }).subscribe(({ data, presentacion }) => {
      this.FormOrdenTrabajo.patchValue({
        'Id_Producto': data.prod_Id,
        'Nombre_Producto': data.prod_Nombre,
      });
      this.aplicarPresentacionYConsultarItem(presentacion);
    }, () => {
      this.cargando = false;
      this.msj.mensajeAdvertencia(`¡No se encontró información del Item buscado!`);
    });
  }

  /**
   * Refresca en segundo plano la información del producto actual (ArrayProducto). Se usa solo cuando ArrayProducto
   * falta o es de otro item/presentación (`calcularDatosOt`, `validarProductoCargado`). Cancela el refresco anterior
   * si sigue pendiente; `limpiarCampos` también lo cancela para que una respuesta tardía no vuelva a llenar
   * ArrayProducto con el producto de una OT ya guardada o descartada.
   * Cuando el producto llega, programa un recálculo (con `programarCalculo`: no corre durante un guardado y se cancela
   * con `cancelarCalculosPendientes`) para que los costos no queden calculados con datos vacíos o de otro item.
   * Si la consulta falla (API caída, 500), el error queda en consola y el aviso se muestra una sola vez
   * hasta que un refresco vuelva a responder, para no repetir el aviso en cada recálculo.
   * @param alGuardar true cuando lo pide un intento de guardado que se bloqueó: muestra la pantalla de carga y un único
   * aviso con el resultado (el item no existe, o ya se cargó y hay que revisar los costos y volver a guardar).
   * @returns No retorna un valor.
   */
  buscarInformacionProducto(alGuardar: boolean = false) {
    this.refrescoProducto?.unsubscribe();
    const producto = this.producto;
    const presentacion = this.presentacionProducto;
    if (alGuardar) this.cargando = true;
    this.refrescoProducto = this.obtenerInformacionProducto$(!alGuardar).pipe(
      finalize(() => { if (alGuardar) this.cargando = false; })
    ).subscribe({
      next: cargado => {
        this.errorRefrescoAvisado = false;
        if (!cargado) {
          if (alGuardar) this.msj.mensajeAdvertencia(`¡No se puede guardar la OT!`, `El item ${producto} con la presentación ${presentacion} no existe en Plasticaribe.`, 6000);
          return;
        }
        this.programarCalculo(() => this.calcularDatosOtInmediato(), 0);
        if (alGuardar) this.msj.mensajeAdvertencia(`¡La OT no se guardó!`, `Se acaba de cargar la información del item ${producto}. Revise los costos y vuelva a guardar.`, 6000);
      },
      error: error => {
        console.error(error);
        if (this.errorRefrescoAvisado && !alGuardar) return;
        this.errorRefrescoAvisado = true;
        this.msj.mensajeError(`¡No fue posible consultar la información del item ${producto}!`, error?.error);
      }
    });
  }

  /**
   * Consulta el producto y presentación actuales y llena ArrayProducto; avisa si no se encuentra.
   * Solo una respuesta vacía o un 400/404 significan "no existe"; los demás errores (500, red) se propagan
   * para que los muestre el manejador de error de quien llama.
   * @param avisar false omite el aviso cuando no se encuentra, para que quien llama muestre uno propio.
   * @returns Observable que emite true si se cargó el producto y false si no existe; falla con los demás errores.
   */
  obtenerInformacionProducto$(avisar: boolean = true): Observable<boolean> {
    return this.productoService.GetInfoProducto_Prod_Presentacion(this.producto, this.presentacionProducto).pipe(
      map(datos_producto => {
        if (!datos_producto?.length) {
          if (avisar) this.msj.mensajeAdvertencia(`Debe ingresar un producto válido y su presentación correspondiente.`);
          return false;
        }
        datos_producto.forEach(data => this.llenarProducto(data));
        return true;
      }),
      catchError((error: HttpErrorResponse) => {
        if (!this.esOrdenNoEncontrada(error)) return throwError(() => error);
        if (avisar) this.msj.mensajeAdvertencia(`¡No hay información de una OT para el item ${this.producto} con la presentación ${this.presentacionProducto}!`);
        return of(false);
      })
    );
  }

  /**
   * Muestra el aviso de que una OT o un item no se pudo cargar porque su producto no existe en Plasticaribe.
   * @param origen Texto que identifica lo que se intentó cargar (p. ej. "la OT N° 123" o "el item").
   * @returns No retorna un valor.
   */
  private avisarProductoNoEncontrado(origen: string): void {
    this.msj.mensajeAdvertencia(`¡Advertencia!`, `¡No se pudo cargar ${origen}: el item ${this.producto} con la presentación ${this.presentacionProducto} no existe en Plasticaribe!`);
  }

  /**
   * Prepara la información del producto para los cálculos y formularios de la OT.
   * @param data Producto y datos relacionados recibidos del servicio.
   * @returns No retorna un valor.
   */
  llenarProducto(data: any) {
    this.ArrayProducto = [{
      'Id': data.produ.prod_Id,
      'Nombre': data.produ.prod_Nombre,
      'Ancho': data.produ.prod_Ancho,
      'Fuelle': data.produ.prod_Fuelle,
      'Largo': data.produ.prod_Largo,
      'Cal': data.produ.prod_Calibre,
      'Und': this.presentacionProducto,
      'Peso_Producto': data.produ.prod_Peso,
      'PesoMillar': data.produ.prod_Peso_Millar,
      'Solapa': data.produ.prod_Solapa,
      'Tipo': data.tipo_Producto,
      'Material': data.material,
      'Pigmento': data.pigmento,
      'CantPaquete': data.produ.prod_CantBolsasPaquete,
      'CantBulto': data.produ.prod_CantBolsasBulto,
      'TipoSellado': data.tipo_Sellado,
      'Cant': parseFloat(this.FormOrdenTrabajo.value.Cantidad) | 0,
      'UndCant': this.presentacionProducto,
      'PrecioUnd': this.FormOrdenTrabajo.value.Precio != null ? this.FormOrdenTrabajo.value.Precio : data.precioUnidad,
    }];
  }

  /** Consulta las unidades de medida y deja como opciones de presentación solo las permitidas (`PRESENTACIONES_OT_PERMITIDAS`). */
  consultarPresentaciones = () => this.undService.srvObtenerLista().subscribe(data => this.presentaciones = data.filter(x => PRESENTACIONES_OT_PERMITIDAS.includes(x.undMed_Id)));

  // Funcion que va a consultar los estados que puede tener la orden de trabajo
  consultarEstados = () => this.estadosService.srvObtenerListaEstados().subscribe(data => this.estados = data.filter(x => [3, 4].includes(x.tpEstado_Id)));

  /**
   * Carga toda la información del item seleccionado tal como está guardado en BagPro (ClientesOtItem):
   * cliente, vendedor, procesos, extrusión, impresión, laminado, sellado y mezclas.
   * Si el item no está en BagPro usa la última OT de Plasticaribe; si tampoco existe, avisa sin borrar el producto.
   * Si el item/presentación no existe en Plasticaribe, avisa y no carga nada ni ejecuta `alCargar`.
   * Si había una OT abierta en modo edición, sale de ese modo antes de cargar (la OT abierta no se modifica)
   * y el item queda como plantilla para crear una OT nueva.
   * Cancela cualquier consulta anterior para que cambios rápidos de item no mezclen datos.
   * @param alCargar Función opcional que se ejecuta cuando la información quedó cargada.
   * @returns No retorna un valor.
   */
  consultarInfoProducto(alCargar?: () => void) {
    const producto = this.FormOrdenTrabajo.value.Id_Producto;
    const presentacion = this.FormOrdenTrabajo.value.Presentacion;
    if (producto == null || presentacion == null) return;

    const otEnEdicion: number | null = this.edicionOrdenTrabajo ? this.FormOrdenTrabajo.value.OT_Id : null;
    if (this.edicionOrdenTrabajo) this.salirModoEdicion();

    this.busquedaOT?.unsubscribe();
    this.limpiarProducto();
    this.cargando = true;
    this.producto = producto;
    this.presentacionProducto = presentacion;
    // La ficha del item (BagPro / última OT) y la información del producto (Plasticaribe) no dependen entre sí:
    // se consultan a la vez; después solo falta la sede del cliente cuando la ficha viene de BagPro.
    this.busquedaOT = forkJoin({
      resultado: this.buscarItem$(producto, presentacion),
      productoEncontrado: this.obtenerInformacionProducto$(false),
    }).pipe(
      switchMap(({ resultado, productoEncontrado }) => resultado ? this.prepararCargaItem$(resultado, productoEncontrado) : of(null))
    ).subscribe(resultado => {
      if (!resultado) {
        this.msj.mensajeAdvertencia(`¡Advertencia!`, `¡No hay información del item ${producto} con la presentación ${presentacion}!`);
        this.cargando = false;
        return;
      }
      if (resultado.productoNoEncontrado) {
        // Sin producto no se llenan los formularios ni se ejecuta alCargar (p. ej. la copia de OT no guarda)
        this.avisarProductoNoEncontrado(`el item`);
        this.cargando = false;
        return;
      }
      this.cargarItem(resultado);
      if (otEnEdicion != null) this.msj.mensajeAdvertencia(`¡Advertencia!`, `Se cargó el item ${producto} como plantilla para una OT nueva; la OT N° ${otEnEdicion} no se modificó.`, 6000);
      alCargar?.();
    }, error => {
      this.msj.mensajeError(`¡No fue posible consultar la información del item ${producto}!`, error.error);
      this.cargando = false;
    });
  }

  /**
   * Sale del modo edición sin modificar la OT que estaba abierta: quita su número, su versión (rowVersion),
   * la confirmación de edición y la tabla de producción, para que lo que se cargue después quede como plantilla
   * de una OT nueva ("Crear OT").
   * @returns No retorna un valor.
   */
  private salirModoEdicion(): void {
    this.cerrarMensaje();
    this.edicionOrdenTrabajo = false;
    this.otCargada = null;
    this.FormOrdenTrabajo.patchValue({ OT_Id: null });
    this.limpiarProduccionProcesos();
    this.valorKgCargado = null;
    this.rowVersionCargada = null;
    this.nombresCargados = null;
  }

  /**
   * Busca la ficha del item en BagPro (ClientesOtItem) y, si no existe, la última OT del item en Plasticaribe.
   * Para el rol vendedor (2) la ficha de BagPro se filtra por su código.
   * @param producto Código del item.
   * @param presentacion Presentación en Plasticaribe (Kg, Und, Paquete, Rollo).
   * @returns Observable con la información encontrada, o null si no existe en ninguna; otros errores se propagan.
   */
  buscarItem$(producto: number, presentacion: string): Observable<ResultadoBusquedaItem | null> {
    const presentacionBagPro = presentacion == 'Kg' ? 'Kilo' : presentacion == 'Und' ? 'Unidad' : presentacion;
    const sales = this.ValidarRol == 2 ? `?sales=${String(this.storage_Id).padStart(3, '0')}` : '';
    const ultimaOT$ = this.ordenTrabajoService.GetInfoUltOT(producto, presentacion).pipe(
      map(datos => {
        const ot = Array.isArray(datos) ? datos[0] : datos;
        return ot ? { origen: 'ultimaOT', datos: ot } as ResultadoBusquedaItem : null;
      }),
      catchError(error => this.esOrdenNoEncontrada(error) ? of(null) : throwError(() => error))
    );
    return this.bagProService.srvObtenerListaClienteOT_Item_Presentacion(producto, presentacionBagPro, sales).pipe(
      catchError(error => this.esOrdenNoEncontrada(error) ? of([]) : throwError(() => error)),
      switchMap(datos => datos?.length > 0
        ? of({ origen: 'item', datos: datos[0] } as ResultadoBusquedaItem)
        : ultimaOT$)
    );
  }

  /**
   * Consulta lo necesario para cargar el item encontrado: el producto y, para la ficha de BagPro, la sede del cliente.
   * @param resultado Información del item encontrada y su origen.
   * @returns Observable con el mismo resultado, incluida la sede cuando el origen es BagPro, y marcado con
   * `productoNoEncontrado` si el item/presentación no existe en Plasticaribe.
   */
  prepararCargaItem$(resultado: ResultadoBusquedaItem, productoEncontrado: boolean): Observable<ResultadoBusquedaItem> {
    // Sin producto no se cargará nada: no hace falta consultar la sede
    if (resultado.origen == 'ultimaOT' || !productoEncontrado) return of({ ...resultado, productoNoEncontrado: !productoEncontrado });
    return this.consultarSedeCliente$(resultado.datos.nitCliente).pipe(
      map(sede => ({ ...resultado, sede, productoNoEncontrado: false }))
    );
  }

  /**
   * Llena los formularios con la información del item sin tocar el número ni el modo de la OT.
   * @param resultado Ficha del item (BagPro) o última OT de Plasticaribe, con la sede si se encontró.
   * @returns No retorna un valor.
   */
  cargarItem(resultado: ResultadoBusquedaItem) {
    if (resultado.origen == 'item' && !resultado.sede) this.msj.mensajeAdvertencia(`Advertencia`, `No se encontró la sede del cliente consultada.`);
    this.cargarFormularios(resultado.sede, resultado.datos, null);
    this.calcularDatosOt();
    this.cargando = false;
    if (resultado.origen == 'ultimaOT') this.msj.mensajeInformacion(`Item ${this.producto} no encontrado en BagPro`, `Se cargó la información de la última OT del item en Plasticaribe.`, 5000);
  }

  /**
   * Consulta la sede del cliente en Plasticaribe a partir del NIT que devuelve BagPro.
   * @param nitCliente NIT del cliente.
   * @returns Observable con la primera sede, o null si no existe o la consulta falla.
   */
  consultarSedeCliente$(nitCliente: any): Observable<any> {
    return (this.svcSedes.GetSedeClientexNitBagPro(nitCliente) as Observable<any[]>).pipe(
      map(sedes => sedes?.[0] ?? null),
      catchError(() => of(null))
    );
  }

  /**
   * Carga los formularios con los datos de la sede y la orden de trabajo consultada.
   * @param dataSedes Datos de la sede del cliente, si está disponible.
   * @param dataOt Datos de la orden de trabajo consultada.
   * @param ot Número de la orden de trabajo; null conserva el número actual (carga por item).
   * @returns No retorna un valor.
   */
  cargarFormularios(dataSedes: any, dataOt: any, ot: number | null) {
    // Otro item u otra OT: se cancela el cambio de referencia que estuviera habilitado
    this.editandoReferencia = false;
    this.referenciaOriginal = null;
    this.llenarDatosCliente(dataSedes ? dataSedes : dataOt)
    this.llenarFormularioOrdenTrabajo(dataOt);
    this.llenarFormularioExtrusion(dataOt);
    this.llenarFormularioLaminado(dataOt);
    this.llenarFormularioCorte(dataOt);
    this.llenarFormularioSellado(dataOt);
    this.llenarFormularioImpresion(dataOt);
    this.validarProcesosOrdenTrabajo(dataOt);
    this.FormOrdenTrabajoMezclas.patchValue({ Nombre_Mezclas: dataOt.mezcla_Nombre, });
    if (ot != null) this.FormOrdenTrabajo.patchValue({ OT_Id: ot, });
    this.cargarCombinacionMezclas();
  }

  /**
   * Sincroniza el código y la selección del dropdown a partir del identificador del vendedor.
   * @param idVendedor Identificador del vendedor guardado en la orden de trabajo.
   * @returns No retorna un valor.
   */
  private seleccionarVendedorPorId(idVendedor: unknown): void {
    const idNumerico = Number(idVendedor);
    if (idVendedor === null || idVendedor === undefined || String(idVendedor).trim() === '' || !Number.isFinite(idNumerico)) {
      return;
    }

    const vendedorExistente = this.vendedores.find(opcion => Number(opcion.usua_Id) === idNumerico);
    if (vendedorExistente) {
      this.aplicarVendedorSeleccionado(vendedorExistente, idNumerico);
      return;
    }

    this.usuarioService.getUsuariosxId(idNumerico).subscribe(data => {
      const idActual = this.idVendedorParaDropdown(this.FormOrdenTrabajo.get('Id_Vendedor')?.value);
      if (idActual === null || Number(idActual) !== idNumerico) {
        return;
      }

      const vendedor = Array.isArray(data)
        ? data.find(opcion => Number(opcion.usua_Id) === idNumerico)
        : data;

      if (!vendedor || Number(vendedor.usua_Id) !== idNumerico) {
        this.msj.mensajeAdvertencia('Vendedor no encontrado', `No se encontró un vendedor con el Id ${idNumerico}.`);
        return;
      }

      if (!this.vendedores.some(opcion => Number(opcion.usua_Id) === idNumerico)) {
        this.vendedores = [...this.vendedores, vendedor];
      }

      this.aplicarVendedorSeleccionado(vendedor, idNumerico);
    }, error => {
      this.msj.mensajeError(`No fue posible consultar el vendedor con el Id ${idNumerico}.`, error.error);
    });
  }

  /**
   * Aplica la selección solo si el formulario todavía corresponde al mismo vendedor.
   * @param vendedor Opción del vendedor que se mostrará en el dropdown.
   * @param idVendedor Identificador numérico que se está cargando.
   * @returns No retorna un valor.
   */
  private aplicarVendedorSeleccionado(vendedor: any, idVendedor: number): void {
    const idActual = this.idVendedorParaDropdown(this.FormOrdenTrabajo.get('Id_Vendedor')?.value);
    if (idActual === null || Number(idActual) !== idVendedor) {
      return;
    }

    this.FormOrdenTrabajo.patchValue({
      Id_Vendedor: String(idVendedor).padStart(3, '0'),
      Nombre_Vendedor: vendedor.usua_Id,
    });
  }

  /**
   * Carga en el formulario los datos de cliente, vendedor y producto de una OT previa.
   * @param data Datos de la orden de trabajo; puede ser nulo cuando no existe.
   * @returns No retorna un valor.
   */
  llenarDatosCliente(data: any) {
    let vendedor: string = data ? (data.id_Vendedor ?? '') : ''; // BagPro puede traer el vendedor en null
    this.FormOrdenTrabajo.patchValue({
      Id_Cliente: data == undefined ? '' : data.id_Cliente,
      Nombre_Cliente: data == undefined ? '' : data.cliente,
      Id_Producto: this.ArrayProducto[0]?.Id,
      Nombre_Producto: this.ArrayProducto[0]?.Nombre,
      Presentacion: this.ArrayProducto[0]?.Und,
      Id_Vendedor: !data ? '' : vendedor.length == 2 ? vendedor = `0${vendedor}` : (vendedor).length == 1 ? `00${vendedor}` : vendedor,
      Nombre_Vendedor: !data ? '' : this.idVendedorParaDropdown(data.id_Vendedor),
    });
    if (data?.id_Vendedor !== null && data?.id_Vendedor !== undefined) {
      this.seleccionarVendedorPorId(data.id_Vendedor);
    }
  }

  /**
   * Convierte el identificador de vendedor al valor numérico usado por las opciones del dropdown.
   * @param idVendedor Identificador del vendedor, con o sin ceros a la izquierda.
   * @returns El identificador numérico o null cuando el valor está vacío o no es numérico.
   */
  private idVendedorParaDropdown(idVendedor: unknown): number | string | null {
    if (idVendedor === null || idVendedor === undefined || String(idVendedor).trim() === '') {
      return null;
    }

    const idNumerico = Number(idVendedor);
    if (!Number.isFinite(idNumerico)) {
      return null;
    }

    const vendedor = this.vendedores.find(opcion => Number(opcion.usua_Id) === idNumerico);
    return vendedor ? vendedor.usua_Id : idNumerico;
  }

  /**
   * Convierte la fecha de entrega seleccionada al formato esperado por el API.
   * @returns Fecha en formato YYYY-MM-DD o null cuando el campo está vacío.
   */
  fechaEntregaParaApi(): string | null {
    const fecha = this.FormOrdenTrabajo.value.OT_FechaEntrega;
    return fecha ? moment(fecha).format('YYYY-MM-DD') : null;
  }
  // Funcion que va a llenar el formulario de la orden de trabajo con los datos de la ultima orden de trabajo creada
  llenarFormularioOrdenTrabajo(data: any) {
    this.FormOrdenTrabajo.patchValue({
      OT_Id: this.FormOrdenTrabajo.value.OT_Id,
      Id_Vendedor: this.FormOrdenTrabajo.value.Id_Vendedor,
      Nombre_Vendedor: this.FormOrdenTrabajo.value.Nombre_Vendedor,
      OT_FechaCreacion: this.FormOrdenTrabajo.value.OT_FechaCreacion,
      OT_FechaEntrega: this.FormOrdenTrabajo.value.OT_FechaEntrega,
      Id_Cliente: this.FormOrdenTrabajo.value.Id_Cliente,
      Nombre_Cliente: this.FormOrdenTrabajo.value.Nombre_Cliente,
      Id_Producto: this.FormOrdenTrabajo.value.Id_Producto,
      Nombre_Producto: this.FormOrdenTrabajo.value.Nombre_Producto,
      Cantidad: data.cantidad_Pedida || this.FormOrdenTrabajo.value.Cantidad,
      Presentacion: this.FormOrdenTrabajo.value.Presentacion,
      Precio: (['Kilo', 'Kg'].includes(this.presentacionProducto) ? data.valorKg : data.valorUnidad) || this.FormOrdenTrabajo.value.Precio,
      Margen: data.margen || this.FormOrdenTrabajo.value.Margen,
      OT_Estado: this.FormOrdenTrabajo.value.OT_Estado,
      OT_Observacion: data.observacion || this.FormOrdenTrabajo.value.OT_Observacion,
    });
  }

  /**
   * Marca los procesos por los que pasará el item. Rotograbado fue descontinuado: si la OT o el item lo tenía,
   * se carga como Impresión para conservar rodillo, pista y tintas, y se avisa al usuario.
   * @param data Datos de la OT o del item consultado.
   * @returns No retorna un valor.
   */
  validarProcesosOrdenTrabajo(data: any) {
    this.motrarEmpresaEtiquetas = data.motrarEmpresaEtiquetas;
    this.cyrel = data.cyrel;
    this.extrusion = data.extrusion;
    this.impresion = !!(data.impresion || data.rotograbado);
    if (data.rotograbado) this.msj.mensajeAdvertencia(`Proceso de Rotograbado`, `Esta OT/item tenía Rotograbado, que ya no existe; se cargó como Impresión. Revise los datos de impresión.`);
    this.laminado = data.laminado;
    this.corte = data.corte;
    this.sellado = data.sellado;
  }

  /**
   * Carga los parámetros de extrusión y su observación desde una orden previa.
   * @param data Datos de la orden consultada.
   * @returns No retorna un valor.
   */
  llenarFormularioExtrusion(data: any) {
    this.FormOrdenTrabajoExtrusion.patchValue({
      Material_Extrusion: data.id_Material || this.FormOrdenTrabajoExtrusion.value.Material_Extrusion,
      Formato_Extrusion: data.id_Formato_Extrusion || this.FormOrdenTrabajoExtrusion.value.Formato_Extrusion,
      Pigmento_Extrusion: data.id_Pigmento_Extrusion || this.FormOrdenTrabajoExtrusion.value.Pigmento_Extrusion,
      Ancho_Extrusion1: data.ancho1_Extrusion || this.FormOrdenTrabajoExtrusion.value.Ancho_Extrusion1,
      Ancho_Extrusion2: data.ancho2_Extrusion || this.FormOrdenTrabajoExtrusion.value.Ancho_Extrusion2,
      Ancho_Extrusion3: data.ancho3_Extrusion || this.FormOrdenTrabajoExtrusion.value.Ancho_Extrusion3,
      Calibre_Extrusion: data.calibre_Extrusion || this.FormOrdenTrabajoExtrusion.value.Calibre_Extrusion,
      UnidadMedida_Extrusion: data.und_Extrusion?.toString().trim() || this.FormOrdenTrabajoExtrusion.value.UnidadMedida_Extrusion,
      Tratado_Extrusion: data.id_Tratado || this.FormOrdenTrabajoExtrusion.value.Tratado_Extrusion,
      Grafilado_Extrusion: data.extrusion_Grafilado ?? null,
      Peso_Extrusion: data.peso_Extrusion,
      Extrusion_Observacion: data.extrusion_Observacion || null,
    });
  }

  /**
   * Carga los parámetros de impresión y su observación desde una orden previa.
   * @param data Datos de la orden consultada.
   * @returns No retorna un valor.
   */
  llenarFormularioImpresion(data: any) {
    this.FormOrdenTrabajoImpresion.patchValue({
      Tipo_Impresion: data.impresion || data.rotograbado ? 2 : 1,
      Rodillo_Impresion: data.rodillo || this.FormOrdenTrabajoImpresion.value.Rodillo_Impresion,
      Pista_Impresion: data.pista || this.FormOrdenTrabajoImpresion.value.Pista_Impresion,
      Tinta_Impresion1: this.nombreTintaParaDropdown(data.tinta1 || this.FormOrdenTrabajoImpresion.value.Tinta_Impresion1),
      Tinta_Impresion2: this.nombreTintaParaDropdown(data.tinta2 || this.FormOrdenTrabajoImpresion.value.Tinta_Impresion2),
      Tinta_Impresion3: this.nombreTintaParaDropdown(data.tinta3 || this.FormOrdenTrabajoImpresion.value.Tinta_Impresion3),
      Tinta_Impresion4: this.nombreTintaParaDropdown(data.tinta4 || this.FormOrdenTrabajoImpresion.value.Tinta_Impresion4),
      Tinta_Impresion5: this.nombreTintaParaDropdown(data.tinta5 || this.FormOrdenTrabajoImpresion.value.Tinta_Impresion5),
      Tinta_Impresion6: this.nombreTintaParaDropdown(data.tinta6 || this.FormOrdenTrabajoImpresion.value.Tinta_Impresion6),
      Tinta_Impresion7: this.nombreTintaParaDropdown(data.tinta7 || this.FormOrdenTrabajoImpresion.value.Tinta_Impresion7),
      Tinta_Impresion8: this.nombreTintaParaDropdown(data.tinta8 || this.FormOrdenTrabajoImpresion.value.Tinta_Impresion8),
      Impresion_Observacion: data.impresion_Observacion || null,
    });
  }

  /**
   * Carga los parámetros de laminado y su observación desde una orden previa.
   * @param data Datos de la orden consultada.
   * @returns No retorna un valor.
   */
  llenarFormularioLaminado(data: any) {
    this.FormOrdenTrabajoLaminado.patchValue({
      Capa_Laminado1: parseInt(data.id_Capa1) || this.FormOrdenTrabajoLaminado.value.Capa_Laminado1,
      Calibre_Laminado1: data.calibre_Laminado_Capa1 || this.FormOrdenTrabajoLaminado.value.Calibre_Laminado1,
      cantidad_Laminado1: data.cantidad_Laminado_Capa1 || this.FormOrdenTrabajoLaminado.value.cantidad_Laminado1,
      Capa_Laminado2: parseInt(data.id_Capa2) || this.FormOrdenTrabajoLaminado.value.Capa_Laminado2,
      Calibre_Laminado2: data.calibre_Laminado_Capa2 || this.FormOrdenTrabajoLaminado.value.Calibre_Laminado2,
      cantidad_Laminado2: data.cantidad_Laminado_Capa2 || this.FormOrdenTrabajoLaminado.value.cantidad_Laminado2,
      Capa_Laminado3: parseInt(data.id_Capa3) || this.FormOrdenTrabajoLaminado.value.Capa_Laminado3,
      Calibre_Laminado3: data.calibre_Laminado_Capa3 || this.FormOrdenTrabajoLaminado.value.Calibre_Laminado3,
      cantidad_Laminado3: data.cantidad_Laminado_Capa3 || this.FormOrdenTrabajoLaminado.value.cantidad_Laminado3,
      Laminado_Observacion: data.laminado_Observacion || null,
    });
  }

  /**
   * Carga los parámetros de corte desde una orden previa.
   * @param data Datos de la orden consultada.
   * @returns No retorna un valor.
   */
  llenarFormularioCorte(data: any) {
    this.FormOrdenTrabajoCorte.patchValue({
      Formato_Corte: this.ArrayProducto[0]?.Tipo || this.FormOrdenTrabajoCorte.value.Formato_Corte,
      Ancho_Corte: this.ArrayProducto[0]?.Ancho || this.FormOrdenTrabajoCorte.value.Ancho_Corte,
      Largo_Corte: this.ArrayProducto[0]?.Largo || this.FormOrdenTrabajoCorte.value.Largo_Corte,
      Fuelle_Corte: this.ArrayProducto[0]?.Fuelle || this.FormOrdenTrabajoCorte.value.Fuelle_Corte,
      Margen_Corte: data.margen || this.FormOrdenTrabajoCorte.value.Margen_Corte,
      Etiqueta_Ancho_Corte: data.selladoCorte_Etiqueta_Ancho || this.FormOrdenTrabajoCorte.value.Etiqueta_Ancho_Corte,
      // BagPro envía selladoCorte_CalibreCliente (EtiquetaLargo sin respaldo); su selladoCorte_Etiqueta_Largo cae al Largo si está vacío.
      // Plasticaribe no lo envía y su SelladoCorte_Etiqueta_Largo ya es el valor guardado.
      Calibre_Cliente_Corte: data.selladoCorte_CalibreCliente !== undefined
        ? this.textoEtiqueta(data.selladoCorte_CalibreCliente)
        : (data.selladoCorte_Etiqueta_Largo || this.FormOrdenTrabajoCorte.value.Calibre_Cliente_Corte),
      Etiqueta_Fuelle_Corte: data.selladoCorte_Etiqueta_Fuelle || this.FormOrdenTrabajoCorte.value.Etiqueta_Fuelle_Corte,
    });
  }

  /**
   * Carga los parámetros de sellado, la solapa y la observación compartida con corte.
   * Calibre Cliente toma la primera fuente con valor mayor a 0: `selladoCorte_Calibre` (guardado en Plasticaribe
   * o calculado por BagPro desde EtiquetaLargo/ExtCalibre) y, en su defecto, el calibre de extrusión ya cargado.
   * Requiere que el formulario de extrusión se haya llenado antes.
   * @param data Datos de la orden consultada.
   * @returns No retorna un valor.
   */
  llenarFormularioSellado(data: any) {
    const observacionSelladoCorte = data.selladoCorte_Observacion || null;
    this.FormOrdenTrabajoCorte.patchValue({ SelladoCorte_Observacion: observacionSelladoCorte });
    this.FormOrdenTrabajoSellado.patchValue({
      Formato_Sellado: this.ArrayProducto[0]?.Tipo,
      Ancho_Sellado: this.ArrayProducto[0]?.Ancho,
      Largo_Sellado: this.ArrayProducto[0]?.Largo,
      Fuelle_Sellado: this.ArrayProducto[0]?.Fuelle,
      Solapa_Sellado: data.selladoCorte_Solapa ?? this.ArrayProducto[0]?.Solapa ?? 0,
      Ancho_Sellado1: data.selladoCorte_Ancho1 ?? 0,
      Ancho_Sellado2: data.selladoCorte_Ancho2 ?? 0,
      Ancho_Sellado3: data.selladoCorte_Ancho3 ?? 0,
      Etiqueta_Ancho_Sellado: data.selladoCorte_Etiqueta_Ancho || '0',
      Etiqueta_Largo_Sellado: data.selladoCorte_Etiqueta_Largo || '0',
      Etiqueta_Fuelle_Sellado: data.selladoCorte_Etiqueta_Fuelle || '0',
      Calibre_Sellado: Number(data.selladoCorte_Calibre) > 0 ? Number(data.selladoCorte_Calibre) : (Number(this.FormOrdenTrabajoExtrusion.value.Calibre_Extrusion) || 0),
      Margen_Sellado: data.margen,
      PesoMillar: this.ArrayProducto[0]?.PesoMillar,
      TipoSellado: this.ArrayProducto[0]?.TipoSellado,
      CantidadPaquete: this.ArrayProducto[0]?.CantPaquete || 0.0,
      PesoPaquete: [null, ''].includes(data.selladoCorte_PesoPaquete) ? 0.0 : parseFloat(data.selladoCorte_PesoPaquete) || 0.0,
      CantidadBulto: this.ArrayProducto[0]?.CantBulto || 0.0,
      PesoBulto: [null, ''].includes(data.selladoCorte_PesoBulto) ? 0.0 : parseFloat(data.selladoCorte_PesoBulto) || 0.0,
      PrecioDia: parseFloat(data.selladoCorte_PrecioSelladoDia) || 0.0,
      PrecioNoche: parseFloat(data.selladoCorte_PrecioSelladoNoche) || 0.0,
      PrecioWiketiadoDia_Mq50: data.selladoCorte_PrecioDia_Wik_Mq50 || 0.0,
      PrecioWiketiadoNoche_Mq50: data.selladoCorte_PrecioNoche_Wik_Mq50 || 0.00,
      PrecioWiketiadoDia_Mq9: data.selladoCorte_PrecioDia_Wik_Mq9 || 0.0,
      PrecioWiketiadoNoche_Mq9: data.selladoCorte_PrecioNoche_Wik_Mq9 || 0.0,
      SelladoCorte_Observacion: observacionSelladoCorte,
    });
    this.calcularPesosPaqueteBulto(true, true);
    this.copiarAnchosExtrusionAProductoTerminado(true);
  }

  /**
   * Copia Ancho 1, Fuelle Izq. y Fuelle Der. de extrusión a los campos equivalentes de producto terminado (sellado).
   * Los campos de producto terminado siguen siendo editables; el valor corregido a mano se guarda tal cual.
   * @param soloVacios true solo llena los campos de producto terminado que estén en 0 o vacíos (carga de OT o item),
   * para no reemplazar valores guardados; false copia siempre (edición en extrusión).
   * @returns No retorna un valor.
   */
  copiarAnchosExtrusionAProductoTerminado(soloVacios: boolean = false) {
    const extrusion = this.FormOrdenTrabajoExtrusion.value;
    const sellado = this.FormOrdenTrabajoSellado.value;
    const campos: [string, string][] = [
      ['Ancho_Extrusion1', 'Ancho_Sellado1'],
      ['Ancho_Extrusion2', 'Ancho_Sellado2'],
      ['Ancho_Extrusion3', 'Ancho_Sellado3'],
    ];
    const cambios: { [campo: string]: number } = {};
    campos.forEach(([campoExtrusion, campoSellado]) => {
      if (soloVacios && (Number(sellado[campoSellado]) || 0) > 0) return;
      cambios[campoSellado] = Number(extrusion[campoExtrusion]) || 0;
    });
    this.FormOrdenTrabajoSellado.patchValue(cambios);
  }

  /**
   * Peso teórico de un paquete y su rango de tolerancia. Para las referencias CAMISILLA BIOD con peso manual de
   * producción es el peso del bulto repartido entre la Cantidad Bulto digitada (T3.0: 23 kg / 2 = 11,5 kg;
   * T2.0: 35 kg / 10 = 3,5 kg); para el resto, la fórmula de producción
   * (1 paquete × Peso Millar × Cantidad Paquete / 1000). Se muestra debajo de Peso Paquete mientras se escribe.
   * @returns Peso teórico, mínimo y máximo del paquete (0 si faltan datos).
   */
  get pesoTeoricoPaquete(): RangoPesoTeorico {
    const sellado = this.FormOrdenTrabajoSellado.value;
    return this.calculoCostos.rangoPesoTeorico(this.pesoPaqueteManual() ?? this.calculoCostos.calcularPesoTeorico({
      presentacion: 'Paquete', cantidad: 1, pesoMillar: sellado.PesoMillar, cantidadPaquete: sellado.CantidadPaquete,
    }));
  }

  /**
   * Peso teórico de un bulto y su rango de tolerancia: peso teórico del paquete × Cantidad Bulto. En las referencias
   * CAMISILLA BIOD con peso manual es el peso fijo de la tabla (23 kg aunque el bulto traiga 1 o 2 paquetes).
   * Se muestra debajo de Peso Bulto mientras se escribe.
   * @returns Peso teórico, mínimo y máximo del bulto.
   */
  get pesoTeoricoBulto(): RangoPesoTeorico {
    return this.calculoCostos.rangoPesoTeorico(this.pesoTeoricoBultoKg());
  }

  /**
   * Peso teórico del bulto en kg (ver `pesoTeoricoBulto`), sin redondear.
   * @returns Peso teórico del bulto.
   */
  private pesoTeoricoBultoKg(): number {
    const cantidadBulto = Number(this.FormOrdenTrabajoSellado.value.CantidadBulto) || 0;
    // BIOD: el paquete es el bulto repartido entre la cantidad (1 si no se ha digitado), así que el bulto da el peso de la tabla
    const paquetes = this.pesoPaqueteManual() != null && cantidadBulto <= 0 ? 1 : cantidadBulto;
    return this.pesoTeoricoPaquete.pesoTeorico * paquetes;
  }

  /**
   * Peso del paquete según la tabla manual de producción (solo referencias CAMISILLA BIOD). Toma el formato de sellado
   * y el de corte, porque al cargar una OT todavía no se sabe cuál de los dos procesos aplica, y el nombre del item
   * del formulario (refleja un cambio de referencia) o, si no hay, el del item cargado.
   * @returns El peso del paquete en kg, o null si la referencia no tiene peso manual.
   */
  pesoPaqueteManual(): number | null {
    const nombreFormulario = this.FormOrdenTrabajo.value.Nombre_Producto;
    const referencia = typeof nombreFormulario == 'string' && isNaN(Number(nombreFormulario)) ? nombreFormulario : this.ArrayProducto[0]?.Nombre;
    const formatos = `${this.FormOrdenTrabajoSellado.value.Formato_Sellado ?? ''} ${this.FormOrdenTrabajoCorte.value.Formato_Corte ?? ''}`;
    // Paquetes por bulto digitados en la OT: el peso de la tabla es el del bulto completo y se reparte entre ellos
    return this.calculoCostos.pesoPaqueteManual(formatos, referencia, this.FormOrdenTrabajoSellado.value.CantidadBulto);
  }

  /**
   * Llena Peso Paquete y Peso Bulto del formulario de sellado con el peso teórico (ver `pesoTeoricoPaquete` y
   * `pesoTeoricoBulto`). En las referencias CAMISILLA BIOD con peso manual el bulto queda en el peso de la tabla y el
   * paquete se reparte entre la Cantidad Bulto (23 kg con 2 paquetes: paquete 11,5 y bulto 23). Si solo cambió el
   * Peso Paquete (editado a mano), el bulto se calcula como Peso Paquete × Cantidad Bulto.
   * Al cargar una OT o un item (soloVacios) se conservan los pesos guardados, salvo en las referencias CAMISILLA BIOD
   * con peso manual: en esas siempre se cargan los pesos de la tabla. Si falta algún dato no se toca el valor actual.
   * @param recalcularPaquete true recalcula el peso del paquete; false solo recalcula el bulto con el peso de paquete actual.
   * @param soloVacios true solo llena los pesos que estén en 0 o vacíos (carga de OT o item), para no reemplazar valores guardados.
   * @returns No retorna un valor.
   */
  calcularPesosPaqueteBulto(recalcularPaquete: boolean = true, soloVacios: boolean = false) {
    if (soloVacios && this.pesoPaqueteManual() != null) soloVacios = false;
    const sellado = this.FormOrdenTrabajoSellado.value;
    const cantidadBulto: number = Number(sellado.CantidadBulto) || 0;
    const pesoTeoricoPaquete: number = this.pesoTeoricoPaquete.pesoTeorico;
    let pesoPaquete: number = Number(sellado.PesoPaquete) || 0;
    let pesoBulto: number = cantidadBulto > 0 ? pesoPaquete * cantidadBulto : 0;

    if (recalcularPaquete && pesoTeoricoPaquete > 0 && (!soloVacios || pesoPaquete <= 0)) {
      pesoPaquete = Math.round(pesoTeoricoPaquete * 100) / 100;
      // Con el teórico sin redondear: 35 kg en 3 paquetes da paquete 11,67 y bulto 35 (no 35,01)
      pesoBulto = this.pesoTeoricoBultoKg();
      this.FormOrdenTrabajoSellado.patchValue({ PesoPaquete: pesoPaquete });
    }
    if (pesoBulto > 0 && (!soloVacios || (Number(sellado.PesoBulto) || 0) <= 0)) {
      this.FormOrdenTrabajoSellado.patchValue({ PesoBulto: Math.round(pesoBulto * 100) / 100 });
    }
  }

  /**
   * Mantiene sincronizada la observación común de los formularios de corte y sellado.
   * @param event Evento de entrada del campo de observación.
   * @returns No retorna un valor.
   */
  actualizarObservacionSelladoCorte(event: Event): void {
    if (event.target instanceof HTMLTextAreaElement) {
      const observacion = event.target.value;
      this.FormOrdenTrabajoCorte.get('SelladoCorte_Observacion')?.setValue(observacion, { emitEvent: false });
      this.FormOrdenTrabajoSellado.get('SelladoCorte_Observacion')?.setValue(observacion, { emitEvent: false });
    }
  }

  /**
   * Mantiene el Ancho Total de producto terminado como Ancho + Fuelle Izq. + Fuelle Der.
   * Si los tres valores están en 0 (OT antiguas sin desglose) se conserva el ancho total existente.
   * @returns No retorna un valor.
   */
  sincronizarAnchoTotalSellado(): void {
    const controles = ['Ancho_Sellado1', 'Ancho_Sellado2', 'Ancho_Sellado3'];
    controles.forEach(nombre => this.FormOrdenTrabajoSellado.get(nombre)?.valueChanges.subscribe(() => {
      const total = controles.reduce((suma, c) => suma + (Number(this.FormOrdenTrabajoSellado.get(c)?.value) || 0), 0);
      if (total > 0) this.FormOrdenTrabajoSellado.get('Ancho_Sellado')?.setValue(parseFloat(total.toFixed(2)), { emitEvent: false });
    }));
  }

  /**
   * Programa (500 ms) el recálculo de pesos y costos de la OT. Solo consulta de nuevo el producto si ArrayProducto
   * está vacío o es de otro item/presentación (p. ej. un item nuevo sin ficha en BagPro ni OT previa); el cálculo
   * ya no modifica ArrayProducto, así que no hace falta refrescarlo en cada tecla.
   * No se ejecuta si al vencer el tiempo hay un guardado en curso, y los pendientes se cancelan al guardar.
   * @returns No retorna un valor.
   */
  calcularDatosOt() {
    // Debounce: cada tecla reemplaza el recálculo pendiente (antes cada tecla dejaba su propio recálculo en cola)
    if (this.calculoOtProgramado != null) {
      clearTimeout(this.calculoOtProgramado);
      this.calculosPendientes.delete(this.calculoOtProgramado);
    }
    this.calculoOtProgramado = this.programarCalculo(() => {
      if (this.productoPendienteDeCargar()) this.buscarInformacionProducto();
      this.calcularDatosOtInmediato();
    }, 500);
  }

  /**
   * Indica si la información del producto (ArrayProducto) falta o no corresponde al item y la presentación
   * actuales (`producto` y `presentacionProducto`), que son los que consulta `buscarInformacionProducto`.
   * @returns true si hay un item y una presentación seleccionados y ArrayProducto no les corresponde.
   */
  private productoPendienteDeCargar(): boolean {
    if (!this.producto || !this.presentacionProducto) return false;
    const cargado = this.ArrayProducto[0];
    return !cargado || `${cargado.Id}`.trim() != `${this.producto}`.trim() || `${cargado.Und}`.trim() != `${this.presentacionProducto}`.trim();
  }

  /**
   * Comprueba que el item y la presentación del formulario sean los mismos que los del producto cargado
   * (`producto`, `presentacionProducto` y ArrayProducto), para no guardar costos calculados con otro item.
   * Si ArrayProducto falta o es de otro item, no guarda y pide la información del producto con
   * `buscarInformacionProducto(true)`, que muestra un único aviso con el resultado (no existe, o ya se cargó).
   * @returns true si todo corresponde; false si no (el aviso ya se mostró o lo mostrará la consulta).
   */
  private validarProductoCargado(): boolean {
    const formulario = this.FormOrdenTrabajo.value;
    if (`${formulario.Id_Producto ?? ''}`.trim() != `${this.producto ?? ''}`.trim() || `${formulario.Presentacion ?? ''}`.trim() != `${this.presentacionProducto ?? ''}`.trim()) {
      this.msj.mensajeAdvertencia(`¡No se puede guardar la OT!`, `El item o la presentación del formulario no coinciden con el item cargado. Vuelva a buscar el item ${formulario.Id_Producto ?? ''} e intente de nuevo.`, 6000);
      return false;
    }
    if (!this.ArrayProducto.length || this.productoPendienteDeCargar()) {
      this.buscarInformacionProducto(true);
      return false;
    }
    return true;
  }

  /**
   * Programa una acción de cálculo diferida y guarda su temporizador para poder cancelarla.
   * Si al vencer el tiempo hay un guardado en curso, la acción no se ejecuta (no debe cambiar los valores
   * que se están enviando ni apagar la pantalla de carga).
   * @param accion Acción que se ejecutará.
   * @param milisegundos Tiempo de espera.
   * @returns No retorna un valor.
   */
  private programarCalculo(accion: () => void, milisegundos: number): ReturnType<typeof setTimeout> {
    const temporizador = setTimeout(() => {
      this.calculosPendientes.delete(temporizador);
      if (this.guardando) return;
      accion();
    }, milisegundos);
    this.calculosPendientes.add(temporizador);
    return temporizador;
  }

  /**
   * Cancela todos los cálculos diferidos pendientes (de calcularDatosOt y de la carga de una OT).
   * @returns No retorna un valor.
   */
  private cancelarCalculosPendientes(): void {
    this.calculosPendientes.forEach(temporizador => clearTimeout(temporizador));
    this.calculosPendientes.clear();
  }

  /**
   * Calcula pesos y costos de la OT con los datos que ya están en pantalla, sin esperas ni nuevas consultas.
   * Si la unidad de extrusión no es Cms ni Plgs no calcula y avisa (salvo `avisar` en false).
   * @param avisar false omite el aviso de unidad de extrusión, para que quien llama muestre uno propio (guardado).
   * @returns true si se calcularon los costos; false si no hay producto, la unidad de extrusión no es Cms ni Plgs
   * o la presentación no tiene regla de cálculo.
   */
  calcularDatosOtInmediato(avisar: boolean = true): boolean {
    let calculado: boolean = false;
    if (this.ArrayProducto.length > 0) {
      this.cargando = true;
      this.ArrayProducto[0].Cant = this.FormOrdenTrabajo.value.Cantidad;
      this.ArrayProducto[0].PrecioUnd = this.FormOrdenTrabajo.value.Precio;
      this.ArrayProducto[0].UndCant = this.presentacionProducto;
      let margen_Adicional = this.calcularMargenAdicional();
      if (this.FormOrdenTrabajoExtrusion.value.UnidadMedida_Extrusion == 'Cms' || this.FormOrdenTrabajoExtrusion.value.UnidadMedida_Extrusion == 'Plgs') {
        let material: number = this.FormOrdenTrabajoExtrusion.value.Material_Extrusion;
        let fact: number = 0;
        this.calcularPesoExtrusion(material, fact);
        for (let i = 0; i < this.ArrayProducto.length; i++) {
          if (this.ArrayProducto[i].Id == this.ArrayProducto[0].Id && this.ArrayProducto[i].UndCant == this.ArrayProducto[0].UndCant) {
            this.calcularPesoProducto(material, fact);
            calculado = this.calcularCostosOT(margen_Adicional);
          }
        }
      } else if (avisar) this.msj.mensajeAdvertencia(`Advertencia`, `¡Debe elegir una unidad de medida para extrusión!`);
      this.cargando = false;
    }
    return calculado;
  }

  calcularMargenAdicional(): number {
    // Sin sellado ni corte se usa el Margen Prod. Terminado digitado (antes quedaba en 0)
    let margen_Adicional: number = this.FormOrdenTrabajo.value.Margen ?? 0;
    if (this.sellado) {
      margen_Adicional = this.FormOrdenTrabajoSellado.value.Margen_Sellado;
      this.ArrayProducto[0].Tipo = this.FormOrdenTrabajoSellado.value.Formato_Sellado;
    } else if (this.corte) {
      margen_Adicional = this.FormOrdenTrabajoCorte.value.Margen_Corte;
      this.ArrayProducto[0].Tipo = this.FormOrdenTrabajoCorte.value.Formato_Corte;
    }
    // Solo si cambió: no reescribir el campo mientras el usuario lo digita
    if (this.FormOrdenTrabajo.value.Margen !== margen_Adicional) this.FormOrdenTrabajo.patchValue({ Margen: margen_Adicional });
    return margen_Adicional;
  }

  /**
   * Mantiene iguales el Margen Prod. Terminado y los márgenes de Sellado y Corte: al escribir en cualquiera de
   * ellos se copia el valor a los otros dos y se recalculan pesos y costos (Margen Kg, Neto Kg, Cant. Kg).
   * El campo de origen no se reescribe para no mover el cursor mientras se digita.
   * @param margen Margen digitado en porcentaje.
   * @param origen Campo en el que se digitó.
   * @returns No retorna un valor.
   */
  sincronizarMargen(margen: number | string | null, origen: 'ot' | 'sellado' | 'corte'): void {
    const valor = margen == null || margen === '' ? null : Number(margen);
    if (origen != 'ot') this.FormOrdenTrabajo.patchValue({ Margen: valor }, { emitEvent: false });
    if (origen != 'sellado') this.FormOrdenTrabajoSellado.patchValue({ Margen_Sellado: valor }, { emitEvent: false });
    if (origen != 'corte') this.FormOrdenTrabajoCorte.patchValue({ Margen_Corte: valor }, { emitEvent: false });
    this.calcularDatosOt();
  }

  // Funcion que va a llenar el formulario de impresion con los datos de la ultima orden de trabajo creada
  calcularPesoExtrusion(material: number, fact: number) {
    let ancho1: number = this.FormOrdenTrabajoExtrusion.value.Ancho_Extrusion1;
    let ancho2: number = this.FormOrdenTrabajoExtrusion.value.Ancho_Extrusion2;
    let ancho3: number = this.FormOrdenTrabajoExtrusion.value.Ancho_Extrusion3;
    let calibre: number = this.FormOrdenTrabajoExtrusion.value.Calibre_Extrusion;
    let largoUnd: number = 0;
    if (this.FormOrdenTrabajoExtrusion.value.UnidadMedida_Extrusion == 'Cms') {
      largoUnd = 100;
      material == 3 ? fact = 0.0048 : fact = 0.00468;
      this.FormOrdenTrabajoExtrusion.patchValue({ Peso_Extrusion: ((ancho1 + ancho2 + ancho3) * calibre * fact * largoUnd), });
    } else {
      largoUnd = 39.3701;
      material == 3 ? fact = 0.0317 : fact = 0.0302;
      this.FormOrdenTrabajoExtrusion.patchValue({ Peso_Extrusion: ((ancho1 + ancho2 + ancho3) * calibre * fact * largoUnd), });
    }
  }

  /**
   * Calcula el peso del producto con sus dimensiones y el factor del material, y toma el Peso Millar base del producto
   * (el que se muestra en sellado y se guarda). No modifica el Peso Millar de ArrayProducto: la regla de LAMINADO/HOJA
   * (D2) se aplica en `OtCalculoCostosService` sobre una variable local, así que repetir el cálculo no acumula divisiones.
   * El tipo para la regla D2 es el mismo formato que se envía en SelladoCorte.Formato_Id (`formatoProductoTerminado`).
   * @param material Id del material de extrusión.
   * @param fact Parámetro conservado por compatibilidad; el factor lo calcula el servicio.
   * @returns No retorna un valor.
   */
  calcularPesoProducto(material: number, fact: number) {
    const producto = this.ArrayProducto[0];
    producto.Tipo = this.formatoProductoTerminado();
    // Solo se llama con Cms o Plgs (lo valida calcularDatosOtInmediato); cualquier unidad distinta de Cms usa el factor de Plgs, como antes
    const unidad: string = this.FormOrdenTrabajoExtrusion.value.UnidadMedida_Extrusion == 'Cms' ? 'Cms' : 'Plgs';
    producto.Peso_Producto = this.calculoCostos.calcularPesoProducto(
      { ancho: producto.Ancho, largo: producto.Largo, fuelle: producto.Fuelle, calibre: producto.Cal }, unidad, material);
    this.pesoProducto = producto.Peso_Producto;
    this.pesoMillar = producto.PesoMillar;
  }

  /**
   * Kilos de la cantidad pedida; muestra el mismo valor que Neto Kg de Datos Costos OT (incluye el margen adicional).
   * @returns Cantidad pedida en kilogramos.
   */
  get cantidadPedidaKg(): number {
    return this.netoKg || 0;
  }

  /**
   * Precio total de la OT: Cant. Pedida × Precio Unitario, con los valores del formulario para que se vea
   * mientras se escribe (no espera el recálculo de costos).
   * @returns Precio total; 0 si falta la cantidad o el precio.
   */
  get precioTotal(): number {
    const { Cantidad, Precio } = this.FormOrdenTrabajo.value;
    return (Number(Cantidad) || 0) * (Number(Precio) || 0);
  }

  /**
   * Texto con la fórmula que se usa para obtener un campo calculado de la OT; se muestra debajo del campo.
   * Las fórmulas que dependen de la presentación siguen las reglas de `OtCalculoCostosService.calcularCostos`.
   * @param campo Campo calculado.
   * @returns La fórmula en texto, o '' si el campo no tiene cálculo para la presentación actual.
   */
  formulaCalculo(campo: 'netoKg' | 'margenKg' | 'valorKg' | 'pesoExtrusion' | 'pesoPaquete' | 'pesoBulto'): string {
    const presentacion = `${this.presentacionProducto ?? ''}`.trim();
    const formato = this.ArrayProducto[0]?.Tipo ?? this.formatoProductoTerminado();
    // Regla D2: en LAMINADO/HOJA por paquete el Peso Millar se divide entre 2
    const pm = REGLA_PESO_MILLAR_D2.tipos.includes(formato ?? '') && REGLA_PESO_MILLAR_D2.presentaciones.includes(presentacion)
      ? `(Peso Millar ÷ ${REGLA_PESO_MILLAR_D2.divisor})` : 'Peso Millar';
    const kilos: { [presentacion: string]: string } = {
      'Kg': 'Cant. Pedida',
      'Paquete': `Cant. Pedida × Bolsas x Paquete × ${pm} / 1000`,
      'Und': `Cant. Pedida × ${pm} / 1000`,
    };
    switch (campo) {
      case 'netoKg':
        if (presentacion == 'MTS') return 'Sin regla para metros (0)';
        return kilos[presentacion] ? `${kilos[presentacion]} × (1 + Margen / 100)` : '';
      case 'margenKg':
        if (presentacion == 'MTS') return 'Sin regla para metros (0)';
        return kilos[presentacion] ? `${kilos[presentacion]} × Margen / 100` : '';
      case 'valorKg':
        switch (presentacion) {
          case 'Kg': return 'Igual al Precio Unitario';
          case 'Paquete': return `Precio Unitario ÷ (${pm} × Bolsas x Paquete / 1000)`;
          case 'Und': return `Valor OT ÷ (Cant. Pedida × ${pm} / 1000)`;
          case 'MTS': return 'Pendiente de definir para metros';
          default: return '';
        }
      case 'pesoExtrusion': {
        const cms = this.FormOrdenTrabajoExtrusion.value.UnidadMedida_Extrusion == 'Cms';
        const material3 = Number(this.FormOrdenTrabajoExtrusion.value.Material_Extrusion) === 3;
        const factor = cms ? (material3 ? 0.0048 : 0.00468) : (material3 ? 0.0317 : 0.0302);
        return `(Ancho 1 + Fuelle Izq. + Fuelle Der.) × Calibre × ${factor} × ${cms ? 100 : 39.3701}`;
      }
      case 'pesoPaquete':
        return this.pesoPaqueteManual() != null
          ? 'Peso de tabla CAMISILLA BIOD ÷ Cantidad x Bulto'
          : `${pm} × Cantidad bolsas x ${presentacion || 'Paquete'} / 1000`;
      case 'pesoBulto':
        return this.pesoPaqueteManual() != null ? 'Peso fijo de tabla CAMISILLA BIOD' : `Peso ${presentacion || 'Paquete'} × Cantidad x Bulto`;
    }
  }

  /**
   * Calcula los costos de la OT (cantidad, valor unidad, margen kg, neto kg, valor kg, valor OT y pesos de paquete/bulto)
   * con `OtCalculoCostosService` a partir del producto cargado. Si la presentación no tiene regla de cálculo (p. ej. Rollo),
   * conserva los valores actuales, como hasta ahora. Si el servicio no calcula el Valor Kg (MTS, pendiente de definir),
   * usa 0 en una OT nueva y, al editar, conserva el Valor Kg con el que se cargó la OT.
   * H-C/I2: usa las mismas entradas que se envían y con las que el servidor valida: la cantidad por paquete editada en
   * sellado (CantidadPaquete → SelladoCorte_CantBolsasPaquete), el Peso Millar de SelladoCorte_PesoMillar y el formato
   * de SelladoCorte.Formato_Id.
   * @param margen_Adicional Margen adicional en porcentaje.
   * @returns true si se calcularon los costos; false si la presentación no tiene regla de cálculo.
   */
  calcularCostosOT(margen_Adicional: number): boolean {
    const data = this.ArrayProducto[0];
    const resultado = this.calculoCostos.calcularCostos({
      presentacion: data.UndCant,
      cantidad: data.Cant,
      precio: data.PrecioUnd,
      margenAdicional: margen_Adicional,
      pesoMillar: data.PesoMillar,
      tipoProducto: data.Tipo,
      cantidadPaquete: this.FormOrdenTrabajoSellado.value.CantidadPaquete,
      cantidadBulto: data.CantBulto,
    });
    if (!resultado) return false;
    this.cantidadProducto = resultado.cantidadProducto;
    this.valorProducto = resultado.valorProducto;
    this.margenKg = resultado.margenKg;
    this.netoKg = resultado.netoKg;
    // TODO: Valor Kg MTS por definir (responsable)
    this.valorKg = resultado.valorKg ?? (this.edicionOrdenTrabajo ? this.valorKgCargado ?? 0 : 0);
    this.valorOt = resultado.valorOt;
    if (resultado.pesoPaquete != null) this.pesoPaquete = resultado.pesoPaquete;
    if (resultado.pesoBulto != null) this.pesoBulto = resultado.pesoBulto;
    this.sinPesoParaValorKg = resultado.sinPesoParaValorKg;
    return true;
  }

  //Funcion que va cargar cada uno de los componentes de la mezcla
  cargarCombinacionMezclas() {
    let simboloPorcentaje: boolean = false;
    let data: string = this.FormOrdenTrabajoMezclas.value.Nombre_Mezclas;
    if (['CUSTOM', ''].includes(`${data}`.trim())) data = 'NO APLICA MEZCLA';
    simboloPorcentaje = data.includes("%") ? true : false;
    if (simboloPorcentaje) data = data.replace('%', '%25')
    else data = data;

    this.mezclasService.getMezclaNombre(data).subscribe(datos_mezcla => {
      this.nroCapasOT = datos_mezcla.mezcla_NroCapas;
      setTimeout(() => {
        this.FormOrdenTrabajoMezclas.disable();
        this.FormOrdenTrabajoMezclas.get('Nombre_Mezclas')?.enable();
        this.FormOrdenTrabajoMezclas.get('Id_Mezcla')?.enable();
        this.FormOrdenTrabajoMezclas.patchValue({
          Id_Mezcla: datos_mezcla.mezcla_Id,
          Nombre_Mezclas: datos_mezcla.mezcla_Nombre,
          Chechbox_Capa1: this.nroCapasOT,
          Chechbox_Capa2: '',
          Chechbox_Capa3: '',
          Proc_Capa1: datos_mezcla.mezcla_PorcentajeCapa1,
          Proc_Capa2: datos_mezcla.mezcla_PorcentajeCapa2,
          Proc_Capa3: datos_mezcla.mezcla_PorcentajeCapa3,
          materialP1_Capa1: datos_mezcla.mezMaterial_Id1xCapa1,
          PorcentajeMaterialP1_Capa1: datos_mezcla.mezcla_PorcentajeMaterial1_Capa1,
          materialP1_Capa2: datos_mezcla.mezMaterial_Id1xCapa2,
          PorcentajeMaterialP1_Capa2: datos_mezcla.mezcla_PorcentajeMaterial1_Capa2,
          materialP1_Capa3: datos_mezcla.mezMaterial_Id1xCapa3,
          PorcentajeMaterialP1_Capa3: datos_mezcla.mezcla_PorcentajeMaterial1_Capa3,
          materialP2_Capa1: datos_mezcla.mezMaterial_Id2xCapa1,
          PorcentajeMaterialP2_Capa1: datos_mezcla.mezcla_PorcentajeMaterial2_Capa1,
          materialP2_Capa2: datos_mezcla.mezMaterial_Id2xCapa2,
          PorcentajeMaterialP2_Capa2: datos_mezcla.mezcla_PorcentajeMaterial2_Capa2,
          materialP2_Capa3: datos_mezcla.mezMaterial_Id2xCapa3,
          PorcentajeMaterialP2_Capa3: datos_mezcla.mezcla_PorcentajeMaterial2_Capa3,
          materialP3_Capa1: datos_mezcla.mezMaterial_Id3xCapa1,
          PorcentajeMaterialP3_Capa1: datos_mezcla.mezcla_PorcentajeMaterial3_Capa1,
          materialP3_Capa2: datos_mezcla.mezMaterial_Id3xCapa2,
          PorcentajeMaterialP3_Capa2: datos_mezcla.mezcla_PorcentajeMaterial3_Capa2,
          materialP3_Capa3: datos_mezcla.mezMaterial_Id3xCapa3,
          PorcentajeMaterialP3_Capa3: datos_mezcla.mezcla_PorcentajeMaterial3_Capa3,
          materialP4_Capa1: datos_mezcla.mezMaterial_Id4xCapa1,
          PorcentajeMaterialP4_Capa1: datos_mezcla.mezcla_PorcentajeMaterial4_Capa1,
          materialP4_Capa2: datos_mezcla.mezMaterial_Id4xCapa2,
          PorcentajeMaterialP4_Capa2: datos_mezcla.mezcla_PorcentajeMaterial4_Capa2,
          materialP_Capa3: datos_mezcla.mezMaterial_Id4xCapa3,
          PorcentajeMaterialP_Capa3: datos_mezcla.mezcla_PorcentajeMaterial4_Capa3,
          MezclaPigmentoP1_Capa1: datos_mezcla.mezPigmto_Id1xCapa1,
          PorcentajeMezclaPigmentoP1_Capa1: datos_mezcla.mezcla_PorcentajePigmto1_Capa1,
          MezclaPigmentoP1_Capa2: datos_mezcla.mezPigmto_Id1xCapa2,
          PorcentajeMezclaPigmentoP1_Capa2: datos_mezcla.mezcla_PorcentajePigmto1_Capa2,
          MezclaPigmento1_Capa3: datos_mezcla.mezPigmto_Id1xCapa3,
          PorcentajeMezclaPigmentoP1_Capa3: datos_mezcla.mezcla_PorcentajePigmto1_Capa3,
          MezclaPigmentoP2_Capa1: datos_mezcla.mezPigmto_Id2xCapa1,
          PorcentajeMezclaPigmentoP2_Capa1: datos_mezcla.mezcla_PorcentajePigmto2_Capa1,
          MezclaPigmentoP2_Capa2: datos_mezcla.mezPigmto_Id2xCapa2,
          PorcentajeMezclaPigmentoP2_Capa2: datos_mezcla.mezcla_PorcentajePigmto2_Capa2,
          MezclaPigmento2_Capa3: datos_mezcla.mezPigmto_Id2xCapa3,
          PorcentajeMezclaPigmentoP2_Capa3: datos_mezcla.mezcla_PorcentajePigmto2_Capa3,
        });
      }, 300);
    });
  }

  // Función que va a abrir el modal de creación de las mezclas
  cargarModalMezclas() {
    this.modalMezclas = true;
    this.cargarMezclaMateria2();
    this.cargarMezclaPigmento2();
    this.cargarMateriales_MatPrima();
    setTimeout(() => this.initFormCrearMezclas(), 1000);
  }

  // Función que va a abrir el modal de la creación de materiales
  cargarModalMateriales = () => this.modalMateriales = true;

  // Función que va a abrir el modal de la creación de pigmentos
  cargarModalPigmentos = () => this.modalPigmentos = true;

  //
  initFormCrearMezclas() {
    this.formCrearMezclas.disable();
    this.formCrearMezclas.get('mezclaId')?.enable();
    this.formCrearMezclas.get('Nombre_Mezclas')?.enable();
    this.checkedCapa1 = false;
    this.checkedCapa2 = false;
    this.checkedCapa2 = false;
    this.idMezclaSeleccionada = 0;
    this.formCrearMezclas.patchValue({
      mezclaId: 0,
      Nombre_Mezclas: '',
      Material_MatPrima: '',
      Chechbox_Capa1: '',
      Chechbox_Capa2: '',
      Chechbox_Capa3: '',
      Proc_Capa1: 0,
      Proc_Capa2: 0,
      Proc_Capa3: 0,
      materialP1_Capa1: 1,
      PorcentajeMaterialP1_Capa1: 0,
      materialP1_Capa2: 1,
      PorcentajeMaterialP1_Capa2: 0,
      materialP1_Capa3: 1,
      PorcentajeMaterialP1_Capa3: 0,
      materialP2_Capa1: 1,
      PorcentajeMaterialP2_Capa1: 0,
      materialP2_Capa2: 1,
      PorcentajeMaterialP2_Capa2: 0,
      materialP2_Capa3: 1,
      PorcentajeMaterialP2_Capa3: 0,
      materialP3_Capa1: 1,
      PorcentajeMaterialP3_Capa1: 0,
      materialP3_Capa2: 1,
      PorcentajeMaterialP3_Capa2: 0,
      materialP3_Capa3: 1,
      PorcentajeMaterialP3_Capa3: 0,
      materialP4_Capa1: 1,
      PorcentajeMaterialP4_Capa1: 0,
      materialP4_Capa2: 1,
      PorcentajeMaterialP4_Capa2: 0,
      materialP4_Capa3: 1,
      PorcentajeMaterialP4_Capa3: 0,
      MezclaPigmentoP1_Capa1: 1,
      PorcentajeMezclaPigmentoP1_Capa1: 0,
      MezclaPigmentoP1_Capa2: 1,
      PorcentajeMezclaPigmentoP1_Capa2: 0,
      MezclaPigmento1_Capa3: 1,
      PorcentajeMezclaPigmentoP1_Capa3: 0,
      MezclaPigmentoP2_Capa1: 1,
      PorcentajeMezclaPigmentoP2_Capa1: 0,
      MezclaPigmentoP2_Capa2: 1,
      PorcentajeMezclaPigmentoP2_Capa2: 0,
      MezclaPigmento2_Capa3: 1,
      PorcentajeMezclaPigmentoP2_Capa3: 0,
    });
  }

  //
  cargarCombinacionMezclas2() {
    if (this.formCrearMezclas.value.Nombre_Mezclas != null) {
      this.mezclasService.srvObtenerListaPorNombre(this.formCrearMezclas.value.Nombre_Mezclas.replace('%', '%25')).subscribe(datos_mezcla => {
        for (let i = 0; i < datos_mezcla.length; i++) {
          this.idMezclaSeleccionada = datos_mezcla[i].mezcla_Id;
          this.nroCapas = datos_mezcla[i].mezcla_NroCapas;

          /** Selecciona el nro de capas que tiene la mezcla seleccionada */
          if (this.nroCapas == 1) this.habilitarCapa1();
          if (this.nroCapas == 2) this.habilitarCapa2();
          if (this.nroCapas == 3) this.habilitarCapa3();

          this.cargarCamposMezclaSeleccionada(datos_mezcla[i]); /** carga los campos con los datos de la mezcla seleccionada */
        }
      });
    } else this.msj.mensajeAdvertencia(`Advertencia`, 'Debe llenar el campo nombre de mezclas');
  }

  cargarCamposMezclaSeleccionada(datos_mezcla: any) {
    this.formCrearMezclas.patchValue({
      mezclaId: this.idMezclaSeleccionada,
      Nombre_Mezclas: this.formCrearMezclas.value.Nombre_Mezclas.replace('%25', '%'),
      Material_MatPrima: datos_mezcla.material_Id,
      Chechbox_Capa1: this.nroCapas,
      Chechbox_Capa2: '',
      Chechbox_Capa3: '',
      Proc_Capa1: datos_mezcla.mezcla_PorcentajeCapa1,
      Proc_Capa2: datos_mezcla.mezcla_PorcentajeCapa2,
      Proc_Capa3: datos_mezcla.mezcla_PorcentajeCapa3,
      materialP1_Capa1: datos_mezcla.mezMaterial_Id1xCapa1,
      PorcentajeMaterialP1_Capa1: datos_mezcla.mezcla_PorcentajeMaterial1_Capa1,
      materialP1_Capa2: datos_mezcla.mezMaterial_Id1xCapa2,
      PorcentajeMaterialP1_Capa2: datos_mezcla.mezcla_PorcentajeMaterial1_Capa2,
      materialP1_Capa3: datos_mezcla.mezMaterial_Id1xCapa3,
      PorcentajeMaterialP1_Capa3: datos_mezcla.mezcla_PorcentajeMaterial1_Capa3,
      materialP2_Capa1: datos_mezcla.mezMaterial_Id2xCapa1,
      PorcentajeMaterialP2_Capa1: datos_mezcla.mezcla_PorcentajeMaterial2_Capa1,
      materialP2_Capa2: datos_mezcla.mezMaterial_Id2xCapa2,
      PorcentajeMaterialP2_Capa2: datos_mezcla.mezcla_PorcentajeMaterial2_Capa2,
      materialP2_Capa3: datos_mezcla.mezMaterial_Id2xCapa3,
      PorcentajeMaterialP2_Capa3: datos_mezcla.mezcla_PorcentajeMaterial2_Capa3,
      materialP3_Capa1: datos_mezcla.mezMaterial_Id3xCapa1,
      PorcentajeMaterialP3_Capa1: datos_mezcla.mezcla_PorcentajeMaterial3_Capa1,
      materialP3_Capa2: datos_mezcla.mezMaterial_Id3xCapa2,
      PorcentajeMaterialP3_Capa2: datos_mezcla.mezcla_PorcentajeMaterial3_Capa2,
      materialP3_Capa3: datos_mezcla.mezMaterial_Id3xCapa3,
      PorcentajeMaterialP3_Capa3: datos_mezcla.mezcla_PorcentajeMaterial3_Capa3,
      materialP4_Capa1: datos_mezcla.mezMaterial_Id4xCapa1,
      PorcentajeMaterialP4_Capa1: datos_mezcla.mezcla_PorcentajeMaterial4_Capa1,
      materialP4_Capa2: datos_mezcla.mezMaterial_Id4xCapa2,
      PorcentajeMaterialP4_Capa2: datos_mezcla.mezcla_PorcentajeMaterial4_Capa2,
      materialP4_Capa3: datos_mezcla.mezMaterial_Id4xCapa3,
      PorcentajeMaterialP4_Capa3: datos_mezcla.mezcla_PorcentajeMaterial4_Capa3,
      MezclaPigmentoP1_Capa1: datos_mezcla.mezPigmto_Id1xCapa1,
      PorcentajeMezclaPigmentoP1_Capa1: datos_mezcla.mezcla_PorcentajePigmto1_Capa1,
      MezclaPigmentoP1_Capa2: datos_mezcla.mezPigmto_Id1xCapa2,
      PorcentajeMezclaPigmentoP1_Capa2: datos_mezcla.mezcla_PorcentajePigmto1_Capa2,
      MezclaPigmento1_Capa3: datos_mezcla.mezPigmto_Id1xCapa3,
      PorcentajeMezclaPigmentoP1_Capa3: datos_mezcla.mezcla_PorcentajePigmto1_Capa3,
      MezclaPigmentoP2_Capa1: datos_mezcla.mezPigmto_Id2xCapa1,
      PorcentajeMezclaPigmentoP2_Capa1: datos_mezcla.mezcla_PorcentajePigmto2_Capa1,
      MezclaPigmentoP2_Capa2: datos_mezcla.mezPigmto_Id2xCapa2,
      PorcentajeMezclaPigmentoP2_Capa2: datos_mezcla.mezcla_PorcentajePigmto2_Capa2,
      MezclaPigmento2_Capa3: datos_mezcla.mezPigmto_Id2xCapa3,
      PorcentajeMezclaPigmentoP2_Capa3: datos_mezcla.mezcla_PorcentajePigmto2_Capa3,
    });
  }

  // Funcion que va a habilitar los campos de la capa 1 en el modal de creación de materia prima
  cambiarNroCapas1() {
    this.checkedCapa1 = true;
    this.checkedCapa2 = false;
    this.checkedCapa3 = false;
    this.nroCapas = 1;

    this.formCrearMezclas.patchValue({
      mezclaId: 0,
      Chechbox_Capa1: this.nroCapas,
      Proc_Capa1: 100,
      Proc_Capa2: 0,
      Proc_Capa3: 0,
      materialP1_Capa2: 1,
      PorcentajeMaterialP1_Capa2: 0,
      materialP1_Capa3: 1,
      PorcentajeMaterialP1_Capa3: 0,
      materialP2_Capa2: 1,
      PorcentajeMaterialP2_Capa2: 0,
      materialP2_Capa3: 1,
      PorcentajeMaterialP2_Capa3: 0,
      materialP3_Capa2: 1,
      PorcentajeMaterialP3_Capa2: 0,
      materialP3_Capa3: 1,
      PorcentajeMaterialP3_Capa3: 0,
      materialP4_Capa2: 1,
      PorcentajeMaterialP4_Capa2: 0,
      materialP4_Capa3: 1,
      PorcentajeMaterialP4_Capa3: 0,
      MezclaPigmentoP1_Capa2: 1,
      PorcentajeMezclaPigmentoP1_Capa2: 0,
      MezclaPigmento1_Capa3: 1,
      PorcentajeMezclaPigmentoP1_Capa3: 0,
      MezclaPigmentoP2_Capa2: 1,
      PorcentajeMezclaPigmentoP2_Capa2: 0,
      MezclaPigmento2_Capa3: 1,
      PorcentajeMezclaPigmentoP2_Capa3: 0,
    });
  }

  // Funcion que va a habilitar los campos de la capa 2 en el modal de creación de materia prima
  cambiarNroCapas2() {
    this.checkedCapa1 = false;
    this.checkedCapa2 = true;
    this.checkedCapa3 = false;
    this.nroCapas = 2

    this.formCrearMezclas.patchValue({
      mezclaId: 0,
      Chechbox_Capa1: this.nroCapas,
      Proc_Capa1: 50,
      Proc_Capa2: 50,
      Proc_Capa3: 0,
      materialP1_Capa3: 1,
      PorcentajeMaterialP1_Capa3: 0,
      materialP2_Capa3: 1,
      PorcentajeMaterialP2_Capa3: 0,
      materialP3_Capa3: 1,
      PorcentajeMaterialP3_Capa3: 0,
      materialP4_Capa3: 1,
      PorcentajeMaterialP4_Capa3: 0,
      MezclaPigmento1_Capa3: 1,
      PorcentajeMezclaPigmentoP1_Capa3: 0,
      MezclaPigmento2_Capa3: 1,
      PorcentajeMezclaPigmentoP2_Capa3: 0,
    });
  }

  // Funcion que va a habilitar los campos de la capa 3 en el modal de creación de materia prima
  cambiarNroCapas3() {
    this.checkedCapa1 = false;
    this.checkedCapa2 = false;
    this.checkedCapa3 = true;
    this.nroCapas = 3;

    this.formCrearMezclas.patchValue({
      mezclaId: 0,
      Chechbox_Capa1: this.nroCapas,
      Proc_Capa1: 30,
      Proc_Capa2: 40,
      Proc_Capa3: 30,
    });
  }

  /** Función que creará la mezcla predefinida  */
  crearMezclaPredefinida() {
    let mezcla: any = this.formCrearMezclas.value.Nombre_Mezclas;
    /** Porcentajes de capa */
    let porc_Capa1: any = this.formCrearMezclas.value.Proc_Capa1 == undefined ? 0 : this.formCrearMezclas.value.Proc_Capa1;
    let porc_Capa2: any = this.formCrearMezclas.value.Proc_Capa2 == undefined ? 0 : this.formCrearMezclas.value.Proc_Capa2;
    let porc_Capa3: any = this.formCrearMezclas.value.Proc_Capa3 == undefined ? 0 : this.formCrearMezclas.value.Proc_Capa3;
    /** Capa 1 */
    let material1C1: any = this.formCrearMezclas.value.materialP1_Capa1;
    let porcMaterial1C1: any = this.formCrearMezclas.value.PorcentajeMaterialP1_Capa1;
    let material2C1: any = this.formCrearMezclas.value.materialP2_Capa1;
    let porcMaterial2C1: any = this.formCrearMezclas.value.PorcentajeMaterialP2_Capa1;
    let material3C1: any = this.formCrearMezclas.value.materialP3_Capa1;
    let porcMaterial3C1: any = this.formCrearMezclas.value.PorcentajeMaterialP3_Capa1;
    let material4C1: any = this.formCrearMezclas.value.materialP4_Capa1;
    let porcMaterial4C1: any = this.formCrearMezclas.value.PorcentajeMaterialP4_Capa1;
    /** Capa 2 */
    let material1C2: any = this.formCrearMezclas.value.materialP1_Capa2;
    let porcMaterial1C2: any = this.formCrearMezclas.value.PorcentajeMaterialP1_Capa2;
    let material2C2: any = this.formCrearMezclas.value.materialP2_Capa2;
    let porcMaterial2C2: any = this.formCrearMezclas.value.PorcentajeMaterialP2_Capa2;
    let material3C2: any = this.formCrearMezclas.value.materialP3_Capa2;
    let porcMaterial3C2: any = this.formCrearMezclas.value.PorcentajeMaterialP3_Capa2;
    let material4C2: any = this.formCrearMezclas.value.materialP4_Capa2;
    let porcMaterial4C2: any = this.formCrearMezclas.value.PorcentajeMaterialP4_Capa2;
    /** Capa 3 */
    let material1C3: any = this.formCrearMezclas.value.materialP1_Capa3;
    let porcMaterial1C3: any = this.formCrearMezclas.value.PorcentajeMaterialP1_Capa3;
    let material2C3: any = this.formCrearMezclas.value.materialP2_Capa3;
    let porcMaterial2C3: any = this.formCrearMezclas.value.PorcentajeMaterialP2_Capa3;
    let material3C3: any = this.formCrearMezclas.value.materialP3_Capa3;
    let porcMaterial3C3: any = this.formCrearMezclas.value.PorcentajeMaterialP3_Capa3;
    let material4C3: any = this.formCrearMezclas.value.materialP4_Capa3;
    let porcMaterial4C3: any = this.formCrearMezclas.value.PorcentajeMaterialP4_Capa3;

    /** Si % del material es 'null' entonces coloca 0 al porcentaje */
    porcMaterial1C1 == null ? porcMaterial1C1 = 0 : porcMaterial1C1;
    porcMaterial2C1 == null ? porcMaterial2C1 = 0 : porcMaterial2C1;
    porcMaterial3C1 == null ? porcMaterial3C1 = 0 : porcMaterial3C1;
    porcMaterial4C1 == null ? porcMaterial4C1 = 0 : porcMaterial4C1;
    porcMaterial1C2 == null ? porcMaterial1C2 = 0 : porcMaterial1C2;
    porcMaterial2C2 == null ? porcMaterial2C2 = 0 : porcMaterial2C2;
    porcMaterial3C2 == null ? porcMaterial3C2 = 0 : porcMaterial3C2;
    porcMaterial4C2 == null ? porcMaterial4C2 = 0 : porcMaterial4C2;
    porcMaterial1C3 == null ? porcMaterial1C3 = 0 : porcMaterial1C3;
    porcMaterial2C3 == null ? porcMaterial2C3 = 0 : porcMaterial2C3;
    porcMaterial3C3 == null ? porcMaterial3C3 = 0 : porcMaterial3C3;
    porcMaterial4C3 == null ? porcMaterial4C3 = 0 : porcMaterial4C3;

    /** Si material es 'no aplica' entonces coloca 0 al porcentaje */
    material1C1 == 1 ? porcMaterial1C1 = 0 : porcMaterial1C1;
    material2C1 == 1 ? porcMaterial2C1 = 0 : porcMaterial2C1;
    material3C1 == 1 ? porcMaterial3C1 = 0 : porcMaterial3C1;
    material4C1 == 1 ? porcMaterial4C1 = 0 : porcMaterial4C1;
    material1C2 == 1 ? porcMaterial1C2 = 0 : porcMaterial1C2;
    material2C2 == 1 ? porcMaterial2C2 = 0 : porcMaterial2C2;
    material3C2 == 1 ? porcMaterial3C2 = 0 : porcMaterial3C2;
    material4C2 == 1 ? porcMaterial4C2 = 0 : porcMaterial4C2;
    material1C3 == 1 ? porcMaterial1C3 = 0 : porcMaterial1C3;
    material2C3 == 1 ? porcMaterial2C3 = 0 : porcMaterial2C3;
    material3C3 == 1 ? porcMaterial3C3 = 0 : porcMaterial3C3;
    material4C3 == 1 ? porcMaterial4C3 = 0 : porcMaterial4C3;

    if (mezcla != null) {
      this.mezclasService.srvObtenerListaPorNombre(mezcla.replace('%', '%25')).subscribe(dataMezcla => {
        if (dataMezcla.length == 0) {
          let porcentajeTotalCapas: any = (porc_Capa1 + porc_Capa2 + porc_Capa3);
          if (this.checkedCapa1 == true) {
            if (porcentajeTotalCapas == 100) {
              if (material1C1 != 1 || material2C1 != 1 || material3C1 != 1 || material4C1 != 1) {
                let porcentajeTotalCapa1: number = (parseFloat(porcMaterial1C1) + parseFloat(porcMaterial2C1) + parseFloat(porcMaterial3C1) + parseFloat(porcMaterial4C1));
                if (porcentajeTotalCapa1 == 100) this.infoMezclaCrear();
                else this.msj.mensajeAdvertencia(`Advertencia`, `La suma del porcentaje de mezcla de materiales de la capa 1 es ${porcentajeTotalCapa1} y debe ser 100, por favor verifique!`);
              } else this.msj.mensajeAdvertencia(`Advertencia`, 'No puede usar este porcentaje para el/los material(es) seleccionado(s)');
            } else this.msj.mensajeAdvertencia(`Advertencia`, `El porcentaje total de la capa 1 es ${porcentajeTotalCapas} y debe ser 100 `);
          } else if (this.checkedCapa2 == true) {
            if (porcentajeTotalCapas == 100 && porc_Capa1 != 0 && porc_Capa2 != 0) {
              if ((material1C1 != 1 || material2C1 != 1 || material3C1 != 1 || material4C1 != 1)
                && (material1C2 != 1 || material2C2 != 1 || material3C2 != 1 || material4C2 != 1)) {
                let porcMaterialesCapa1: number = (porcMaterial1C1 + porcMaterial2C1 + porcMaterial3C1 + porcMaterial4C1);
                let porcMaterialesCapa2: number = (porcMaterial1C2 + porcMaterial2C2 + porcMaterial3C2 + porcMaterial4C2);
                if (porcMaterialesCapa1 == 100 && porcMaterialesCapa2 == 100) this.infoMezclaCrear();
                else this.msj.mensajeAdvertencia(`Advertencia`, 'La suma del porcentaje de mezcla de los materiales en cada capa debe ser 100');
              } else this.msj.mensajeAdvertencia(`Advertencia`, 'No puede usar estos porcentajes de mezcla para los materiales seleccionados');
            } else this.msj.mensajeAdvertencia(`Advertencia`, 'La suma del porcentaje de mezcla de las capas 1 y 2 debe ser 100');
          } else if (this.checkedCapa3 == true) {
            if (porcentajeTotalCapas == 100 && porc_Capa1 != 0 && porc_Capa2 != 0 && porc_Capa3 != 0) {
              if ((material1C1 != 1 || material2C1 != 1 || material3C1 != 1 || material4C1 != 1)
                && (material1C2 != 1 || material2C2 != 1 || material3C2 != 1 || material4C2 != 1)
                && (material1C3 != 1 || material2C3 != 1 || material3C3 != 1 || material4C3 != 1)) {
                let porcMaterialesCapa1: number = (porcMaterial1C1 + porcMaterial2C1 + porcMaterial3C1 + porcMaterial4C1);
                let porcMaterialesCapa2: number = (porcMaterial1C2 + porcMaterial2C2 + porcMaterial3C2 + porcMaterial4C2);
                let porcMaterialesCapa3: number = (porcMaterial1C3 + porcMaterial2C3 + porcMaterial3C3 + porcMaterial4C3);
                if (porcMaterialesCapa1 == 100 && porcMaterialesCapa2 == 100 && porcMaterialesCapa3 == 100) this.infoMezclaCrear();
                else this.msj.mensajeAdvertencia(`Advertencia`, 'La suma del porcentaje de mezcla de los materiales en cada capa debe ser 100');
              } else this.msj.mensajeAdvertencia(`Advertencia`, 'No puede usar este porcentaje para los materiales seleccionados');
            } else this.msj.mensajeAdvertencia(`Advertencia`, 'La suma del porcentaje de mezcla de las capas debe ser 100');
          } else this.msj.mensajeAdvertencia(`Advertencia`, 'Debe elegir el número de capas de la mezcla.');
        } else this.msj.mensajeAdvertencia(`Advertencia`, `Ya existe una mezcla llamada ${mezcla}`);
      });
    } else this.msj.mensajeAdvertencia(`Advertencia`, `Debe diligenciar el campo "Nombre de Mezcla"`);
  }

  /**
   * Crea la mezcla predefinida con los valores del modal de mezclas.
   * Las capas que no están activas tienen sus controles deshabilitados (no vienen en `value`):
   * en ese caso se envía 0 en los porcentajes y 1 ("no aplica") en materiales y pigmentos.
   * @returns No retorna un valor.
   */
  infoMezclaCrear() {
    const v = this.formCrearMezclas.value;
    let mezcla: any = v.Nombre_Mezclas;
    let modelo: modelMezclas = {
      Mezcla_Nombre: mezcla.replace('%25', '%'),
      Mezcla_NroCapas: this.nroCapas,
      Material_Id: this.formCrearMezclas.value.Material_MatPrima,
      /** Mezcla porcentaje capa 1 */
      Mezcla_PorcentajeCapa1: this.formCrearMezclas.value.Proc_Capa1,
      MezMaterial_Id1xCapa1: this.formCrearMezclas.value.materialP1_Capa1,
      Mezcla_PorcentajeMaterial1_Capa1: this.formCrearMezclas.value.PorcentajeMaterialP1_Capa1,
      MezMaterial_Id2xCapa1: this.formCrearMezclas.value.materialP2_Capa1,
      Mezcla_PorcentajeMaterial2_Capa1: this.formCrearMezclas.value.PorcentajeMaterialP2_Capa1,
      MezMaterial_Id3xCapa1: this.formCrearMezclas.value.materialP3_Capa1,
      Mezcla_PorcentajeMaterial3_Capa1: this.formCrearMezclas.value.PorcentajeMaterialP3_Capa1,
      MezMaterial_Id4xCapa1: this.formCrearMezclas.value.materialP4_Capa1,
      Mezcla_PorcentajeMaterial4_Capa1: this.formCrearMezclas.value.PorcentajeMaterialP4_Capa1,
      MezPigmto_Id1xCapa1: this.formCrearMezclas.value.MezclaPigmentoP1_Capa1,
      Mezcla_PorcentajePigmto1_Capa1: this.formCrearMezclas.value.PorcentajeMezclaPigmentoP1_Capa1,
      MezPigmto_Id2xCapa1: this.formCrearMezclas.value.MezclaPigmentoP2_Capa1,
      Mezcla_PorcentajePigmto2_Capa1: this.formCrearMezclas.value.PorcentajeMezclaPigmentoP2_Capa1,
      /** Mezcla porcentaje capa 2 (si la capa no está activa sus controles están deshabilitados y no vienen en value) */
      Mezcla_PorcentajeCapa2: v.Proc_Capa2 ?? 0,
      MezMaterial_Id1xCapa2: v.materialP1_Capa2 ?? 1,
      Mezcla_PorcentajeMaterial1_Capa2: v.PorcentajeMaterialP1_Capa2 ?? 0,
      MezMaterial_Id2xCapa2: v.materialP2_Capa2 ?? 1,
      Mezcla_PorcentajeMaterial2_Capa2: v.PorcentajeMaterialP2_Capa2 ?? 0,
      MezMaterial_Id3xCapa2: v.materialP3_Capa2 ?? 1,
      Mezcla_PorcentajeMaterial3_Capa2: v.PorcentajeMaterialP3_Capa2 ?? 0,
      MezMaterial_Id4xCapa2: v.materialP4_Capa2 ?? 1,
      Mezcla_PorcentajeMaterial4_Capa2: v.PorcentajeMaterialP4_Capa2 ?? 0,
      MezPigmto_Id1xCapa2: v.MezclaPigmentoP1_Capa2 ?? 1,
      Mezcla_PorcentajePigmto1_Capa2: v.PorcentajeMezclaPigmentoP1_Capa2 ?? 0,
      MezPigmto_Id2xCapa2: v.MezclaPigmentoP2_Capa2 ?? 1,
      Mezcla_PorcentajePigmto2_Capa2: v.PorcentajeMezclaPigmentoP2_Capa2 ?? 0,
      /** Mezcla porcentaje capa 3 */
      Mezcla_PorcentajeCapa3: v.Proc_Capa3 ?? 0,
      MezMaterial_Id1xCapa3: v.materialP1_Capa3 ?? 1,
      Mezcla_PorcentajeMaterial1_Capa3: v.PorcentajeMaterialP1_Capa3 ?? 0,
      MezMaterial_Id2xCapa3: v.materialP2_Capa3 ?? 1,
      Mezcla_PorcentajeMaterial2_Capa3: v.PorcentajeMaterialP2_Capa3 ?? 0,
      MezMaterial_Id3xCapa3: v.materialP3_Capa3 ?? 1,
      Mezcla_PorcentajeMaterial3_Capa3: v.PorcentajeMaterialP3_Capa3 ?? 0,
      MezMaterial_Id4xCapa3: v.materialP4_Capa3 ?? 1,
      Mezcla_PorcentajeMaterial4_Capa3: v.PorcentajeMaterialP4_Capa3 ?? 0,
      MezPigmto_Id1xCapa3: v.MezclaPigmento1_Capa3 ?? 1,
      Mezcla_PorcentajePigmto1_Capa3: v.PorcentajeMezclaPigmentoP1_Capa3 ?? 0,
      MezPigmto_Id2xCapa3: v.MezclaPigmento2_Capa3 ?? 1,
      Mezcla_PorcentajePigmto2_Capa3: v.PorcentajeMezclaPigmentoP2_Capa3 ?? 0,
      Usua_Id: this.storage_Id,
      Mezcla_FechaIngreso: this.today
    }

    this.mezclasService.srvGuardar(modelo).subscribe(() => {
      this.msj.mensajeConfirmacion(`Registro de Mezcla Predefinida creado con éxito!`, '');
      setTimeout(() => {
        this.initFormCrearMezclas();
        this.cargarMezclas();
      }, 1000);
    }, error => this.msj.mensajeError(`¡Error!`, `¡${error.error}!`));
  }

  /**
   * Crea un material de mezclas desde el modal de crear mezclas. El nombre es obligatorio (se guarda sin espacios
   * sobrantes y en mayúsculas); la descripción es opcional y, si no se diligencia, se genera a partir del nombre.
   * @returns No retorna un valor.
   */
  crearMaterial() {
    const nombreMaterial: string = (this.formCrearMateriales.value.matNombre ?? '').toString().trim().toUpperCase();
    const descripcionMaterial: string = (this.formCrearMateriales.value.matDescripcion ?? '').toString().trim();
    if (nombreMaterial == '') {
      this.msj.mensajeAdvertencia(`Advertencia`, `Debe diligenciar el nombre del material.`);
      return;
    }
    this.mezclaMaterialService.getMezclasMateriales(nombreMaterial).subscribe(dataMzMaterial => {
      if (dataMzMaterial.length == 0) {
        const material: modelMezMaterial = {
          MezMaterial_Nombre: nombreMaterial,
          MezMaterial_Descripcion: descripcionMaterial == '' ? `Mezcla de Material ${nombreMaterial}` : descripcionMaterial.toUpperCase(),
        }
        this.mezclaMaterialService.srvGuardar(material).subscribe(() => {
          this.msj.mensajeConfirmacion('Registro creado con éxito!', '');
          setTimeout(() => {
            this.formCrearMateriales.reset();
            this.cargarMezclaMateria();
            this.cargarMezclaMateria2();
          }, 300);
        }, error => this.msj.mensajeError(`¡No fue posible crear el material ${nombreMaterial}!`, error.error));
      } else this.msj.mensajeAdvertencia(`Advertencia`, `Ya existe una material de mezclas llamado ${nombreMaterial}`);
    }, error => this.msj.mensajeError(`¡No fue posible validar si el material ${nombreMaterial} ya existe!`, error.error));
  }

  /**
   * Crea un pigmento de mezclas desde el modal de crear mezclas y refresca las listas de pigmentos.
   * El nombre es obligatorio (se guarda sin espacios sobrantes y en mayúsculas); la descripción es opcional
   * y, si no se diligencia, se genera a partir del nombre.
   * @returns No retorna un valor.
   */
  crearPigmento() {
    const nombrePigmento: string = (this.formCrearPigmentos.value.pigNombre ?? '').toString().trim().toUpperCase();
    const descripcionPigmento: string = (this.formCrearPigmentos.value.pigDescripcion ?? '').toString().trim();
    if (nombrePigmento == '') {
      this.msj.mensajeAdvertencia(`Advertencia`, `Debe diligenciar el nombre del pigmento.`);
      return;
    }
    this.mezclaPigmentosService.getMezclasPigmentos(nombrePigmento).subscribe(dataMzPigmento => {
      if (dataMzPigmento.length == 0) {
        const pigmento: modelMezPigmento = {
          MezPigmto_Nombre: nombrePigmento,
          MezPigmto_Descripcion: descripcionPigmento == '' ? `Mezcla de Pigmento ${nombrePigmento}` : descripcionPigmento.toUpperCase(),
        }
        this.mezclaPigmentosService.srvGuardar(pigmento).subscribe(() => {
          this.msj.mensajeConfirmacion('Registro creado con éxito!', '');
          setTimeout(() => {
            this.formCrearPigmentos.reset();
            this.cargarMezclaPigmento();
            this.cargarMezclaPigmento2();
          }, 300);
        }, error => this.msj.mensajeError(`¡No fue posible crear el pigmento ${nombrePigmento}!`, error.error));
      } else this.msj.mensajeAdvertencia(`Advertencia`, `Ya existe un pigmento de mezclas llamado ${nombrePigmento}`)
    }, error => this.msj.mensajeError(`¡No fue posible validar si el pigmento ${nombrePigmento} ya existe!`, error.error));
  }

  // Funcion que va a deshabilitar los campos del formulario de mezclas, luego habilitará solo los campos de la capa 1
  habilitarCapa1() {
    setTimeout(() => {
      this.formCrearMezclas.disable();
      this.formCrearMezclas.get('mezclaId')?.enable();
      this.formCrearMezclas.get('Nombre_Mezclas')?.enable();
      this.formCrearMezclas.get('Material_MatPrima')?.enable();
      this.formCrearMezclas.get('Proc_Capa1')?.enable();
      this.formCrearMezclas.get('Chechbox_Capa1')?.enable();
      this.formCrearMezclas.get('materialP1_Capa1')?.enable();
      this.formCrearMezclas.get('PorcentajeMaterialP1_Capa1')?.enable();
      this.formCrearMezclas.get('materialP2_Capa1')?.enable();
      this.formCrearMezclas.get('PorcentajeMaterialP2_Capa1')?.enable();
      this.formCrearMezclas.get('materialP3_Capa1')?.enable();
      this.formCrearMezclas.get('PorcentajeMaterialP3_Capa1')?.enable();
      this.formCrearMezclas.get('materialP4_Capa1')?.enable();
      this.formCrearMezclas.get('PorcentajeMaterialP4_Capa1')?.enable();
      this.formCrearMezclas.get('MezclaPigmentoP1_Capa1')?.enable();
      this.formCrearMezclas.get('PorcentajeMezclaPigmentoP1_Capa1')?.enable();
      this.formCrearMezclas.get('MezclaPigmentoP2_Capa1')?.enable();
      this.formCrearMezclas.get('PorcentajeMezclaPigmentoP2_Capa1')?.enable();
      this.cambiarNroCapas1();
    }, 500);
  }

  // Funcion que va a deshabilitar los campos del formulario de mezclas, luego habilitará solo los campos de la capa 1 y 2
  habilitarCapa2() {
    setTimeout(() => {
      this.formCrearMezclas.enable();
      this.formCrearMezclas.get('Proc_Capa3')?.disable();
      this.formCrearMezclas.get('materialP1_Capa3')?.disable();
      this.formCrearMezclas.get('PorcentajeMaterialP1_Capa3')?.disable();
      this.formCrearMezclas.get('materialP2_Capa3')?.disable();
      this.formCrearMezclas.get('PorcentajeMaterialP2_Capa3')?.disable();
      this.formCrearMezclas.get('materialP3_Capa3')?.disable();
      this.formCrearMezclas.get('PorcentajeMaterialP3_Capa3')?.disable();
      this.formCrearMezclas.get('materialP4_Capa3')?.disable();
      this.formCrearMezclas.get('PorcentajeMaterialP4_Capa3')?.disable();
      this.formCrearMezclas.get('MezclaPigmento1_Capa3')?.disable();
      this.formCrearMezclas.get('PorcentajeMezclaPigmentoP1_Capa3')?.disable();
      this.formCrearMezclas.get('MezclaPigmento2_Capa3')?.disable();
      this.formCrearMezclas.get('PorcentajeMezclaPigmentoP2_Capa3')?.disable();
      this.cambiarNroCapas2();
    }, 300);
  }

  // Funcion que va a deshabilitar los campos del formulario de mezclas, luego habilitará solo los campos de la capa 1, 2 y 3
  habilitarCapa3() {
    setTimeout(() => {
      this.formCrearMezclas.enable();
      this.cambiarNroCapas3();
    }, 300);
  }

  /** Función que validará que no se elija ninguna tinta igual a otra en el formulario de impresión y organizará las tintas */
  validarTinta(posicion: string) {
    let tinta: any = this.FormOrdenTrabajoImpresion.get('Tinta_Impresion' + posicion)?.value;
    let tintasSeleccionadas: any[] = Object.values(this.FormOrdenTrabajoImpresion.value);
    tintasSeleccionadas = tintasSeleccionadas.filter((item) => typeof (item) == 'string');
    let indice: number = tintasSeleccionadas.indexOf(tinta);
    if (indice != -1) tintasSeleccionadas.splice(indice, 1);
    for (let index = 1; index < parseInt(posicion); index++) {
      if (tintasSeleccionadas[index - 1].includes('NO APLICA')) {
        this.FormOrdenTrabajoImpresion.get('Tinta_Impresion' + index)?.setValue(tinta);
        this.FormOrdenTrabajoImpresion.get('Tinta_Impresion' + posicion)?.setValue('NO APLICA');
        break;
      }
    }
  }

  /** Función para validar que no se elijan laminados de capa iguales en el formulario y que se organicen dependiendo la posición */
  validarLaminado(posicion: number) {
    let campoLaminado: any = this.FormOrdenTrabajoLaminado.get('Capa_Laminado' + posicion.toString())?.value;
    let laminados: any[] = Object.values(this.FormOrdenTrabajoLaminado.value);
    let lam1: any = laminados.splice(0, 1);
    let lam2: any = laminados.splice(2, 1);
    let lam3: any = laminados.splice(4, 1);
    let laminadosCapas: any[] = [...lam1, ...lam2, ...lam3];
    let indice: number = laminadosCapas.indexOf(campoLaminado);
    if (indice != -1) laminadosCapas.splice(indice, 1);
    for (let index = 1; index < posicion; index++) {
      if (laminadosCapas[index - 1].toString().includes('1')) {
        this.FormOrdenTrabajoLaminado.get('Capa_Laminado' + index)?.setValue(campoLaminado);
        this.FormOrdenTrabajoLaminado.get('Capa_Laminado' + posicion)?.setValue(1);
        break;
      }
    }
    this.validarLaminadoCapa(posicion);
  }

  validarLaminadoCapa(posicion: number) {
    let campoLaminado: any = this.FormOrdenTrabajoLaminado.get('Capa_Laminado' + posicion.toString())?.value;
    if (campoLaminado == 1) {
      this.FormOrdenTrabajoLaminado.get('Calibre_Laminado' + posicion)?.setValue(0);
      this.FormOrdenTrabajoLaminado.get('cantidad_Laminado' + posicion)?.setValue(0);
    }
  }

  /**
   * Valida la información de la OT y, si es correcta, la crea. No hace nada si ya hay un guardado en curso.
   * @returns No retorna un valor.
   */
  validarDatos() {
    if (this.guardando || !this.validarRolGuardar()) return;
    this.resaltarObligatorios = true;
    if (!this.FormOrdenTrabajo.valid) {
      this.avisarCamposVacios();
      return;
    }
    if (!this.presentacionPermitidaParaCrear()) return;
    if (!this.validarReferenciaCreacion()) return;
    if (this.prepararFormulariosParaGuardar()) this.guardarOt();
  }

  /**
   * Al crear con el cambio de referencia habilitado, comprueba que el nombre nuevo no esté vacío ni supere 100 caracteres
   * (Productos.Prod_Nombre).
   * @returns true si es válido o no se está cambiando la referencia; false si no (ya se mostró el aviso).
   */
  private validarReferenciaCreacion(): boolean {
    if (!this.editandoReferencia) return true;
    const nombre = this.textoNombre(this.FormOrdenTrabajo.value.Nombre_Producto);
    if (nombre == null) {
      this.msj.mensajeAdvertencia(`¡No se puede crear la OT!`, `La referencia (nombre del item) no puede estar vacía.`, 6000);
      return false;
    }
    if (nombre.length > 100) {
      this.msj.mensajeAdvertencia(`¡No se puede crear la OT!`, `La referencia (nombre del item) no puede tener más de 100 caracteres.`, 6000);
      return false;
    }
    return true;
  }

  /**
   * Avisa qué campos obligatorios del formulario principal están vacíos (por su etiqueta en pantalla) y lleva el
   * cursor al primero. Los campos ya se ven en rojo porque `resaltarObligatorios` está activo.
   * @returns No retorna un valor.
   */
  private avisarCamposVacios() {
    const vacios = Array.from(document.querySelectorAll<HTMLElement>('#formOrdenTrabajo [formcontrolname].ng-invalid'));
    const nombres = vacios
      .map(el => el.closest('.p-float-label')?.querySelector('label')?.textContent?.trim() || el.getAttribute('formcontrolname') || '')
      .filter((nombre, i, lista) => nombre !== '' && lista.indexOf(nombre) === i);
    this.msj.mensajeAdvertencia(`¡Hay campos obligatorios vacíos!`,
      nombres.length ? `Complete los campos resaltados en rojo: ${nombres.join(', ')}.` : `Complete los campos resaltados en rojo.`, 6000);
    const primero = vacios[0];
    (primero?.matches('input, textarea') ? primero : primero?.querySelector<HTMLElement>('input, textarea'))?.focus();
  }

  /** Indica si el rol del usuario puede crear y editar OT (`ROLES_GUARDAR_OT`); la vista oculta los botones si no puede. */
  get puedeGuardarOT(): boolean {
    return ROLES_GUARDAR_OT.includes(Number(this.ValidarRol));
  }

  /**
   * Bloquea crear o editar si el rol no está autorizado (por si se llama sin pasar por los botones ocultos).
   * @returns true si el rol puede guardar; false si no (ya se mostró el aviso).
   */
  private validarRolGuardar(): boolean {
    if (this.puedeGuardarOT) return true;
    this.msj.mensajeAdvertencia(`¡Advertencia!`, `Su rol no tiene permiso para crear ni editar órdenes de trabajo.`);
    return false;
  }

  /**
   * Comprueba que la presentación de la OT nueva esté entre las permitidas (`PRESENTACIONES_OT_PERMITIDAS`).
   * Una presentación como "Rollo" puede llegar desde BagPro (presentación del item o plantilla de una OT de BagPro);
   * en ese caso avisa y no deja crear la OT. Solo aplica a la creación: las OT existentes se siguen editando.
   * Si todavía no hay un item cargado (sin presentación), pide buscarlo o cargarlo.
   * @returns true si la presentación está permitida; false si no (ya se mostró el aviso).
   */
  private presentacionPermitidaParaCrear(): boolean {
    const presentacion = `${this.presentacionProducto ?? ''}`.trim();
    if (PRESENTACIONES_OT_PERMITIDAS.includes(presentacion)) return true;
    if (!presentacion) {
      this.msj.mensajeAdvertencia(`¡No se puede crear la OT!`, `No hay un item cargado. Busque el item (Enter en el código) o selecciónelo con su presentación y espere a que cargue.`, 6000);
      return false;
    }
    this.msj.mensajeAdvertencia(`¡No se puede crear la OT!`, `La presentación "${presentacion}" no está habilitada para crear OT. Seleccione una de estas: ${PRESENTACIONES_OT_PERMITIDAS.join(', ')}.`, 6000);
    return false;
  }

  /**
   * Prepara y valida los formularios de procesos antes de crear o editar una OT, sin esperas:
   * limpia los procesos que no aplican, recalcula pesos y costos con lo que hay en pantalla y valida
   * los subformularios en el orden habitual. Antes cancela los cálculos diferidos pendientes. No guarda si la
   * información del producto falta o es de otro item/presentación (`validarProductoCargado`), ni si algún valor
   * calculado no es finito (`validarValoresCalculados`), ni si no se pudieron calcular los costos (unidad de extrusión
   * distinta de Cms/Plgs o presentación sin regla), para no enviar costos en 0 ni sobrescribir los guardados al editar.
   * El cálculo es idempotente: se puede repetir sin cambiar el resultado.
   * @param repetirAvisoSinPeso false no repite el aviso (no bloqueante) de Valor Kg 0 si ya se mostró en la validación anterior;
   * si la condición aparece recién ahora, el aviso sí se muestra.
   * @returns true si todo es válido; false si algo no lo es (ya se mostró el aviso).
   */
  private prepararFormulariosParaGuardar(repetirAvisoSinPeso: boolean = true): boolean {
    // Un cálculo diferido pendiente (al teclear o al cargar) no debe ejecutarse durante el guardado
    this.cancelarCalculosPendientes();
    if (!this.extrusion) this.limpiarFormExtrusion();
    if (!this.impresion) this.limpiarFormImpresion();
    if (!this.laminado) this.limpiarFormLaminado();
    if (!this.corte) this.limpiarFormCorte();
    if (!this.sellado) this.limpiarFormSellado();
    if (!this.FormOrdenTrabajoMezclas.valid) this.limpiarFormMezclas();

    if (!this.validarProductoCargado()) return false;
    if (!this.validarNombresEdicion()) return false;
    if (!this.calcularDatosOtInmediato(false)) {
      // Sin cálculo la OT se enviaría con costos en 0 (o, al editar, sobrescribiría los guardados)
      const unidad = this.FormOrdenTrabajoExtrusion.value.UnidadMedida_Extrusion;
      const detalle = !['Cms', 'Plgs'].includes(unidad)
        ? `Seleccione la unidad de medida de extrusión (Cms o Plgs) para calcular los costos.`
        : `No hay regla de cálculo de costos para la presentación "${this.presentacionProducto}".`;
      this.msj.mensajeAdvertencia(`¡No se puede guardar la OT: no se calcularon los costos!`, detalle, 6000);
      return false;
    }

    const validaciones: [FormGroup, string][] = [
      [this.FormOrdenTrabajoExtrusion, `¡EL formulario de Extrusion tiene campos vacios!`],
      [this.FormOrdenTrabajoImpresion, `¡El formulario de Impresion tiene campos vacios!`],
      [this.FormOrdenTrabajoLaminado, `¡EL formulario de Laminado tiene campos vacios!`],
      [this.FormOrdenTrabajoCorte, `¡El formulario de Corte tiene campos vacios!`],
      [this.FormOrdenTrabajoSellado, `¡El formulario de Sellado tiene campos vacios!`],
      [this.FormOrdenTrabajoMezclas, `¡El formulario de Mezclas tiene campos vacios!`],
    ];
    const invalido = validaciones.find(([formulario]) => !formulario.valid);
    if (invalido) {
      this.msj.mensajeAdvertencia(`¡Advertencia!`, invalido[1]);
      return false;
    }
    return this.validarValoresCalculados(repetirAvisoSinPeso);
  }

  /**
   * Comprueba, justo antes de armar el payload, que los valores calculados y numéricos que se envían sean números
   * finitos (sin null, NaN ni Infinity) y que las entradas de costos que teclea el usuario (cantidad, precio, margen,
   * cantidad por paquete y por bulto) no sean negativas, y que el precio unitario sea mayor que 0. Si algo no es válido,
   * avisa con los nombres y no deja guardar.
   * Si el Valor Kg quedó en 0 por falta de Peso Millar (o de cantidad por paquete), muestra un aviso que no bloquea.
   * @param repetirAvisoSinPeso false no repite el aviso de Valor Kg 0 si la validación anterior ya lo mostró.
   * @returns true si todos los valores son válidos; false si alguno no lo es (ya se mostró el aviso).
   */
  private validarValoresCalculados(repetirAvisoSinPeso: boolean = true): boolean {
    const negativos = this.calculoCostos.valoresNegativos({
      'Cantidad': this.FormOrdenTrabajo.value.Cantidad,
      'Precio': this.FormOrdenTrabajo.value.Precio,
      'Margen': this.FormOrdenTrabajo.value.Margen,
      'Cantidad Paquete': this.FormOrdenTrabajoSellado.value.CantidadPaquete,
      'Cantidad Bulto': this.FormOrdenTrabajoSellado.value.CantidadBulto,
    });
    if (negativos.length > 0) {
      this.msj.mensajeAdvertencia(`¡No se puede guardar la OT!`, `No se permiten valores negativos en: ${negativos.join(', ')}.`, 6000);
      return false;
    }
    // El precio unitario es obligatorio y debe ser mayor que 0 (al crear y al editar); la API aplica la misma regla.
    const precio = Number(this.FormOrdenTrabajo.value.Precio);
    if (!Number.isFinite(precio) || precio <= 0) {
      this.msj.mensajeAdvertencia(`¡No se puede guardar la OT!`, `El precio unitario debe ser mayor que 0.`, 6000);
      return false;
    }
    const noValidos = this.calculoCostos.valoresNoFinitos({
      'Cantidad': this.cantidadProducto,
      'Valor Unidad': this.valorProducto,
      'Margen': this.FormOrdenTrabajo.value.Margen,
      'Neto Kg': this.netoKg,
      'Valor Kg': this.valorKg,
      'Valor OT': this.valorOt,
      'Peso Millar': this.FormOrdenTrabajoSellado.value.PesoMillar,
      'Peso Producto': this.pesoProducto,
    });
    if (noValidos.length > 0) {
      this.msj.mensajeAdvertencia(`¡No se puede guardar la OT!`, `Los siguientes valores no son válidos: ${noValidos.join(', ')}. Revise la cantidad, el precio, el margen y la información del item.`);
      return false;
    }
    const sinPeso = this.sinPesoParaValorKg && ['Paquete', 'Und'].includes(this.presentacionProducto);
    if (sinPeso && (repetirAvisoSinPeso || !this.avisoSinPesoMostrado)) {
      this.msj.mensajeAdvertencia(`¡Advertencia!`, `El Valor Kg quedó en 0 porque el item ${this.producto} no tiene Peso Millar${this.presentacionProducto == 'Paquete' ? ' o cantidad por paquete' : ''}.`, 6000);
    }
    this.avisoSinPesoMostrado = sinPeso;
    return true;
  }

  /**
   * Crea la orden de trabajo en un único flujo: sede del cliente → datos de procesos → creación.
   * El número de OT, el creador (usuario del token), la fecha, la hora y el estado inicial los asigna la API;
   * el número creado se lee de la respuesta (`numero_OT`) para el mensaje y el PDF.
   * Ignora la llamada si ya hay un guardado en curso (evita doble envío). Cualquier error o validación fallida
   * muestra un mensaje y libera la pantalla; si la OT se crea, limpia los campos y abre su PDF.
   * Solo se invoca desde `validarDatos` (Búsqueda ya no guarda OTs); la firma se conserva hasta la reestructuración (F3).
   * @param otCreadaBagPro Parámetro conservado por compatibilidad; no se usa.
   * @returns No retorna un valor.
   */
  guardarOt(otCreadaBagPro: boolean = false) {
    if (this.guardando) return;
    this.guardando = true;
    this.cargando = true;
    let creada: boolean = false;
    (this.svcSedes.GetSedeClientexNitBagPro(this.FormOrdenTrabajo.value.Id_Cliente) as Observable<any[]>).pipe(
      catchError(error => this.cortarGuardado(`¡No fue posible consultar la sede del cliente!`, error)),
      switchMap(sede => {
        if (!sede?.length) return this.cortarGuardado(`¡No se encontró ninguna sede para el cliente!`, null, true);
        this.FormOrdenTrabajo.patchValue({ Id_Cliente: sede[0].idSede });
        return this.consultarDatosProcesos().pipe(
          catchError(error => this.cortarGuardado(`¡No fue posible consultar la información necesaria para crear la Orden de Trabajo!`, error))
        );
      }),
      switchMap(datosProcesos => {
        let procesos = this.construirProcesosOt(datosProcesos);
        if (!procesos) return EMPTY;

        let infoOT: CrearOrdenTrabajoDatos = {
          'SedeCli_Id': this.FormOrdenTrabajo.value.Id_Cliente,
          'Prod_Id': this.producto,
          'UndMed_Id': this.presentacionProducto,
          'Ot_FechaEntrega': this.fechaEntregaParaApi(),
          'PedExt_Id': 517,
          // Solo si se habilitó el cambio de referencia; la API lo cambia en el maestro si difiere y guarda el historial
          'Prod_Nombre': this.editandoReferencia ? this.textoNombre(this.FormOrdenTrabajo.value.Nombre_Producto) : null,
          'Ot_Observacion': this.FormOrdenTrabajo.value.OT_Observacion == null ? '' : (this.FormOrdenTrabajo.value.OT_Observacion).trim().toUpperCase(),
          'Ot_Cyrel': this.cyrel,
          'Ot_Corte': this.corte,
          'Mezcla_Id': this.FormOrdenTrabajoMezclas.value.Id_Mezcla,
          'Extrusion': this.extrusion,
          'Impresion': this.impresion,
          'Rotograbado': false, // Proceso descontinuado; se conserva la columna.
          'Laminado': this.laminado,
          'Sellado': this.sellado,
          'Ot_MargenAdicional': this.FormOrdenTrabajo.value.Margen,
          'Ot_CantidadPedida': this.cantidadProducto,
          'Ot_ValorUnidad': this.valorProducto,
          'Ot_PesoNetoKg': this.netoKg,
          'Ot_ValorKg': this.valorKg,
          'Ot_ValorOT': this.valorOt,
          'Id_Vendedor': parseInt(this.FormOrdenTrabajo.value.Id_Vendedor),
          'MotrarEmpresaEtiquetas': this.motrarEmpresaEtiquetas,
        }
        return this.ordenTrabajoService.crearOrdenCompleta({ OrdenTrabajo: infoOT, ...procesos }).pipe(
          catchError(error => this.cortarGuardado(`¡No fue posible crear la Orden de Trabajo!`, error))
        );
      }),
      finalize(() => {
        this.guardando = false;
        // Si la OT se creó, el overlay lo controla la generación del PDF
        if (!creada) this.cargando = false;
      })
    ).subscribe({
      next: datos_ot => {
        creada = true;
        // La OT recién creada pasa a ser la última conocida (botón "Última")
        this.ultimaOT = Math.max(this.ultimaOT || 0, Number(datos_ot.numero_OT) || 0);
        this.msj.mensajeConfirmacion('¡Orden de Trabajo Creada!', `Se ha creado la de orden de trabajo N°${datos_ot.numero_OT}`);
        // Los datos no se borran: se carga la OT recién creada (queda en pantalla con su número, en modo edición),
        // así un segundo clic en "Crear" no duplica la OT
        this.ConsultarOrdenTrabajo(Number(datos_ot.numero_OT));
        this.pdfOrdenTrabajo(datos_ot.numero_OT);
      },
      // Errores no previstos dentro del flujo (p. ej. datos nulos al armar la OT); los HTTP ya se informaron en cada paso
      error: error => this.informarErrorInesperadoGuardado(`¡No fue posible crear la Orden de Trabajo por un error inesperado!`, error),
    });
  }

  /**
   * Informa un error no previsto del flujo de crear o editar una OT (no HTTP, ya que esos se informan en cada paso)
   * y lo deja en consola para su diagnóstico.
   * @param mensaje Mensaje para el usuario.
   * @param error Error capturado.
   * @returns No retorna un valor.
   */
  private informarErrorInesperadoGuardado(mensaje: string, error: any): void {
    console.error(error);
    this.msj.mensajeError(mensaje, `Revise la información de la OT e intente de nuevo. Detalle: ${error?.message ?? error}`);
  }

  /**
   * Muestra el mensaje de un paso fallido del guardado (crear o editar OT) y termina el flujo sin emitir valores,
   * para que su `finalize` libere la pantalla. Si hay error HTTP, muestra su detalle con `detalleErrorApi`
   * (ProblemDetails, ValidationProblemDetails o texto) durante más tiempo para que se pueda leer.
   * @param mensaje Mensaje para el usuario.
   * @param error Error HTTP recibido, si lo hay; su detalle se muestra junto al mensaje.
   * @param advertencia true muestra una advertencia en lugar de un error.
   * @returns Observable vacío que completa de inmediato.
   */
  private cortarGuardado(mensaje: string, error: any = null, advertencia: boolean = false): Observable<never> {
    if (advertencia) this.msj.mensajeAdvertencia(`¡Advertencia!`, mensaje);
    else {
      const detalle = this.detalleErrorApi(error);
      this.msj.mensajeError(mensaje, detalle, detalle ? 10000 : 3000);
    }
    return EMPTY;
  }

  /**
   * Obtiene un texto legible del error devuelto por la API. Con ProblemDetails usa `detail` (o `title` si no hay detail);
   * con ValidationProblemDetails agrega cada mensaje de `errors` ("Campo: mensaje"). Si el cuerpo es texto lo devuelve
   * tal cual; si no hay cuerpo usa el código y el texto del estado HTTP.
   * @param error Error HTTP (HttpErrorResponse) o cualquier valor recibido en el catchError.
   * @returns El detalle para mostrar; vacío si no hay error.
   */
  private detalleErrorApi(error: any): string {
    if (!error) return '';
    const cuerpo = error.error;
    if (typeof cuerpo === 'string' && cuerpo.trim() !== '') return cuerpo;
    if (cuerpo && typeof cuerpo === 'object') {
      const partes: string[] = [];
      const principal = cuerpo.detail || cuerpo.title;
      if (principal) partes.push(`${principal}`);
      if (cuerpo.errors && typeof cuerpo.errors === 'object') {
        Object.keys(cuerpo.errors).forEach(campo => {
          const mensajes = Array.isArray(cuerpo.errors[campo]) ? cuerpo.errors[campo] : [cuerpo.errors[campo]];
          mensajes.forEach((m: unknown) => partes.push(campo ? `${campo}: ${m}` : `${m}`));
        });
      }
      if (partes.length > 0) return partes.join(' | ');
    }
    if (error.status) return `Error ${error.status}${error.statusText ? ` (${error.statusText})` : ''}`;
    return `${error?.message ?? ''}`;
  }

  /**
   * Formato (nombre del tipo de producto) del producto terminado: el de sellado si la OT es de sellado; si no, el de corte.
   * Es el formato que se envía en SelladoCorte.Formato_Id y, por eso, el que se usa como tipo para la regla D2 (I2).
   * @returns Nombre del formato seleccionado.
   */
  private formatoProductoTerminado(): any {
    return this.sellado ? this.FormOrdenTrabajoSellado.value.Formato_Sellado : this.FormOrdenTrabajoCorte.value.Formato_Corte;
  }

  /**
   * Consulta los Ids de las tintas seleccionadas y el formato/tipo de sellado, necesarios para armar los procesos de la OT.
   * Si la combinación de tipo de sellado y formato no existe (404), `datosSellado` llega en null para que
   * `construirProcesosOt` muestre el aviso; cualquier otro error se propaga.
   * @returns Observable con las tintas encontradas y el formato/tipo de sellado (null si no existe).
   */
  consultarDatosProcesos(): Observable<{ datosImpresion: any[], datosSellado: any }> {
    let tipoSellado: number = this.FormOrdenTrabajoSellado.value.TipoSellado;
    let formato: any = this.formatoProductoTerminado();
    let tintas = this.FormOrdenTrabajoImpresion.value;
    return forkJoin({
      datosImpresion: this.servicioTintas.srvObtenerListaConsultaImpresion(tintas.Tinta_Impresion1, tintas.Tinta_Impresion2, tintas.Tinta_Impresion3, tintas.Tinta_Impresion4, tintas.Tinta_Impresion5, tintas.Tinta_Impresion6, tintas.Tinta_Impresion7, tintas.Tinta_Impresion8),
      datosSellado: this.otSelladoCorteService.getTipoSellado_Formato(tipoSellado, formato).pipe(
        catchError((error: HttpErrorResponse) => error?.status === 404 ? of(null) : throwError(() => error))
      ),
    });
  }

  /**
   * Arma la información de los cuatro procesos de la OT. Si no se encontraron las tintas o no existe la combinación
   * de tipo de sellado y formato (la API responde 404), muestra el error y apaga la carga.
   * @param datos Tintas y formato/tipo de sellado consultados con consultarDatosProcesos.
   * @returns Procesos de la OT para la API, o null si faltan las tintas o la combinación de sellado/formato.
   */
  construirProcesosOt(datos: { datosImpresion: any[], datosSellado: any }): ProcesosOrdenTrabajo | null {
    if (datos.datosImpresion.length == 0) {
      this.msj.mensajeError(`¡No se encontraron las tintas seleccionadas para el área de 'Impresión'!`);
      this.cargando = false;
      return null;
    }
    if (!datos.datosSellado) {
      this.msj.mensajeError(`¡No existe la combinación de tipo de sellado y formato seleccionada!`, `Verifique el tipo de sellado y el formato del producto terminado.`);
      this.cargando = false;
      return null;
    }
    return {
      Extrusion: this.construirInfoOt_Extrusion(),
      Impresion: this.construirInfoOt_Impresion(datos.datosImpresion[0]),
      Laminado: this.construirInfoOt_Laminado(),
      SelladoCorte: this.construirInfoOt_Sellado_Corte(datos.datosSellado),
    };
  }

  /**
   * Construye la configuración y observación del proceso de extrusión. El Ot_Id lo asigna la API.
   * @returns Información de extrusión para crear o editar la OT (sin Ids).
   */
  construirInfoOt_Extrusion(): OtExtrusionDatos {
    return {
      'Material_Id': this.FormOrdenTrabajoExtrusion.value.Material_Extrusion,
      'Formato_Id': this.FormOrdenTrabajoExtrusion.value.Formato_Extrusion,
      'Pigmt_Id': this.FormOrdenTrabajoExtrusion.value.Pigmento_Extrusion,
      'Extrusion_Calibre': this.FormOrdenTrabajoExtrusion.value.Calibre_Extrusion,
      'Extrusion_Ancho1': this.FormOrdenTrabajoExtrusion.value.Ancho_Extrusion1,
      'Extrusion_Ancho2': this.FormOrdenTrabajoExtrusion.value.Ancho_Extrusion2,
      'Extrusion_Ancho3': this.FormOrdenTrabajoExtrusion.value.Ancho_Extrusion3,
      'UndMed_Id': this.FormOrdenTrabajoExtrusion.value.UnidadMedida_Extrusion,
      'Tratado_Id': this.FormOrdenTrabajoExtrusion.value.Tratado_Extrusion,
      'Extrusion_Grafilado': this.FormOrdenTrabajoExtrusion.value.Grafilado_Extrusion,
      'Extrusion_Peso': this.FormOrdenTrabajoExtrusion.value.Peso_Extrusion,
      'Extrusion_Observacion': this.FormOrdenTrabajoExtrusion.value.Extrusion_Observacion,
    }
  }

  /**
   * Construye la configuración y observación del proceso de impresión. El Ot_Id lo asigna la API.
   * @param datosImpresion Ids de las tintas seleccionadas, consultados por nombre.
   * @returns Información de impresión para crear o editar la OT (sin Ids).
   */
  construirInfoOt_Impresion(datosImpresion: any): OtImpresionDatos {
    return {
      'TpImpresion_Id': this.FormOrdenTrabajoImpresion.value.Tipo_Impresion,
      'Rodillo_Id': this.FormOrdenTrabajoImpresion.value.Rodillo_Impresion,
      'Pista_Id': this.FormOrdenTrabajoImpresion.value.Pista_Impresion,
      'Tinta1_Id': datosImpresion.tinta_Id1,
      'Tinta2_Id': datosImpresion.tinta_Id2,
      'Tinta3_Id': datosImpresion.tinta_Id3,
      'Tinta4_Id': datosImpresion.tinta_Id4,
      'Tinta5_Id': datosImpresion.tinta_Id5,
      'Tinta6_Id': datosImpresion.tinta_Id6,
      'Tinta7_Id': datosImpresion.tinta_Id7,
      'Tinta8_Id': datosImpresion.tinta_Id8,
      'Impresion_Observacion': this.FormOrdenTrabajoImpresion.value.Impresion_Observacion,
    }
  }

  /**
   * Construye la configuración y observación del proceso de laminado. El OT_Id lo asigna la API.
   * @returns Información de laminado para crear o editar la OT (sin Ids).
   */
  construirInfoOt_Laminado(): OtLaminadoDatos {
    return {
      'Capa_Id1': this.FormOrdenTrabajoLaminado.value.Capa_Laminado1,
      'Capa_Id2': this.FormOrdenTrabajoLaminado.value.Capa_Laminado2,
      'Capa_Id3': this.FormOrdenTrabajoLaminado.value.Capa_Laminado3,
      'LamCapa_Calibre1': this.FormOrdenTrabajoLaminado.value.Calibre_Laminado1,
      'LamCapa_Calibre2': this.FormOrdenTrabajoLaminado.value.Calibre_Laminado2,
      'LamCapa_Calibre3': this.FormOrdenTrabajoLaminado.value.Calibre_Laminado3,
      'LamCapa_Cantidad1': this.FormOrdenTrabajoLaminado.value.cantidad_Laminado1,
      'LamCapa_Cantidad2': this.FormOrdenTrabajoLaminado.value.cantidad_Laminado2,
      'LamCapa_Cantidad3': this.FormOrdenTrabajoLaminado.value.cantidad_Laminado3,
      'Laminado_Observacion': this.FormOrdenTrabajoLaminado.value.Laminado_Observacion,
    }
  }

  /**
   * Construye la configuración, solapa y observación de sellado o corte. El Ot_Id lo asigna la API.
   * @param datos Formato y tipo de sellado seleccionados.
   * @returns Información de sellado/corte para crear o editar la OT (sin Ids).
   */
  construirInfoOt_Sellado_Corte(datos: any): OtSelladoCorteDatos {
    return {
      'Corte': this.corte,
      'Sellado': this.sellado,
      'Formato_Id': datos.tpProd_Id,
      'SelladoCorte_Ancho': this.sellado ? this.FormOrdenTrabajoSellado.value.Ancho_Sellado : this.FormOrdenTrabajoCorte.value.Ancho_Corte,
      'SelladoCorte_Largo': this.sellado ? this.FormOrdenTrabajoSellado.value.Largo_Sellado : this.FormOrdenTrabajoCorte.value.Largo_Corte,
      'SelladoCorte_Fuelle': this.sellado ? this.FormOrdenTrabajoSellado.value.Fuelle_Sellado : this.FormOrdenTrabajoCorte.value.Fuelle_Corte,
      'SelladoCorte_Solapa': this.sellado ? this.FormOrdenTrabajoSellado.value.Solapa_Sellado : null,
      'SelladoCorte_Calibre': this.sellado ? this.FormOrdenTrabajoSellado.value.Calibre_Sellado : null,
      'SelladoCorte_Ancho1': this.sellado ? this.FormOrdenTrabajoSellado.value.Ancho_Sellado1 : null,
      'SelladoCorte_Ancho2': this.sellado ? this.FormOrdenTrabajoSellado.value.Ancho_Sellado2 : null,
      'SelladoCorte_Ancho3': this.sellado ? this.FormOrdenTrabajoSellado.value.Ancho_Sellado3 : null,
      'SelladoCorte_Observacion': this.sellado
        ? this.FormOrdenTrabajoSellado.value.SelladoCorte_Observacion
        : this.FormOrdenTrabajoCorte.value.SelladoCorte_Observacion,
      // I2: el mismo Peso Millar con el que se calcularon los costos (el de sellado se pone en 0 si la OT no es de sellado)
      'SelladoCorte_PesoMillar': this.ArrayProducto[0]?.PesoMillar ?? this.FormOrdenTrabajoSellado.value.PesoMillar,
      'TpSellado_Id': datos.tpSellado_Id,
      'SelladoCorte_PrecioSelladoDia': this.FormOrdenTrabajoSellado.value.PrecioDia,
      'SelladoCorte_PrecioSelladoNoche': this.FormOrdenTrabajoSellado.value.PrecioNoche,
      'SelladoCorte_CantBolsasPaquete': this.FormOrdenTrabajoSellado.value.CantidadPaquete,
      'SelladoCorte_CantBolsasBulto': this.FormOrdenTrabajoSellado.value.CantidadBulto,
      'SelladoCorte_PesoPaquete': this.FormOrdenTrabajoSellado.value.PesoPaquete,
      'SelladoCorte_PesoBulto': this.FormOrdenTrabajoSellado.value.PesoBulto,
      'SelladoCorte_PesoProducto': this.pesoProducto,
      'SelladoCorte_Etiqueta_Ancho': this.sellado ? `${this.FormOrdenTrabajoSellado.value.Etiqueta_Ancho_Sellado}`.toUpperCase() : this.textoEtiqueta(this.FormOrdenTrabajoCorte.value.Etiqueta_Ancho_Corte),
      // En corte, Calibre Cliente se guarda en SelladoCorte_Etiqueta_Largo (EtiquetaLargo en BagPro)
      'SelladoCorte_Etiqueta_Largo': this.sellado ? `${this.FormOrdenTrabajoSellado.value.Etiqueta_Largo_Sellado}`.toUpperCase() : this.textoEtiqueta(this.FormOrdenTrabajoCorte.value.Calibre_Cliente_Corte),
      'SelladoCorte_Etiqueta_Fuelle': this.sellado ? `${this.FormOrdenTrabajoSellado.value.Etiqueta_Fuelle_Sellado}`.toUpperCase() : this.textoEtiqueta(this.FormOrdenTrabajoCorte.value.Etiqueta_Fuelle_Corte),
      'SelladoCorte_PrecioDia_Wik_Mq50': this.FormOrdenTrabajoSellado.value.PrecioWiketiadoDia_Mq50,
      'SelladoCorte_PrecioNoche_Wik_Mq50': this.FormOrdenTrabajoSellado.value.PrecioWiketiadoNoche_Mq50,
      'SelladoCorte_PrecioDia_Wik_Mq9': this.FormOrdenTrabajoSellado.value.PrecioWiketiadoDia_Mq9,
      'SelladoCorte_PrecioNoche_Wik_Mq9': this.FormOrdenTrabajoSellado.value.PrecioWiketiadoNoche_Mq9,
    }
  }

  /**
   * Convierte un campo de etiqueta de corte en el texto que se guarda: en mayúsculas y sin espacios al inicio o al final.
   * Vacío o null se guarda como '0' (BagPro trata '' y '0' de EtiquetaLargo como "sin calibre cliente" y usa el de extrusión).
   * @param valor Valor del formulario.
   * @returns Texto para SelladoCorte_Etiqueta_*.
   */
  private textoEtiqueta(valor: unknown): string {
    const texto = valor == null ? '' : `${valor}`.trim();
    return texto === '' ? '0' : texto.toUpperCase();
  }


  /**
   * Consulta una orden de trabajo y carga sus datos en los formularios. Solo limpia la pantalla si la OT existe:
   * en Plasticaribe queda en modo edición; si solo existe en BagPro se carga como plantilla para crear una nueva;
   * si no existe se conserva lo que había en pantalla.
   * @param numero Desplazamiento relativo (-1, 0, 1) sobre la OT actual o número absoluto de OT.
   * @returns No retorna un valor.
   */
  /**
   * Botón "Última": consulta en ese momento el último número de OT y la carga. Antes usaba `ultimaOT`, que solo se
   * consultaba al abrir la pantalla, así que una OT creada después (p. ej. 142648) no aparecía y cargaba la anterior.
   * Toma el mayor entre BagPro y Plasticaribe; si ambas consultas fallan usa el último número conocido.
   * @returns No retorna un valor.
   */
  consultarUltimaOT(): void {
    this.cargando = true;
    forkJoin({
      bagPro: this.bagProService.srvObtenerListaClienteOT_UltimaOT().pipe(map(data => Number(data?.item) || 0), catchError(() => of(0))),
      plasticaribe: this.ordenTrabajoService.GetUlt_Numero_OT().pipe(map(data => Number(data) || 0), catchError(() => of(0))),
    }).subscribe(({ bagPro, plasticaribe }) => {
      this.ultimaOT = Math.max(this.ultimaOT || 0, bagPro, plasticaribe);
      this.cargando = false;
      // 0, 1 y -1 son desplazamientos en ConsultarOrdenTrabajo; un número real de OT siempre es mayor
      if (this.ultimaOT > 1) this.ConsultarOrdenTrabajo(this.ultimaOT);
      else this.msj.mensajeAdvertencia(`No fue posible consultar la última OT`, ``);
    });
  }

  ConsultarOrdenTrabajo(numero: number) {
    const numeroOT = this.resolverNumeroOT(numero);
    if (numeroOT == null) {
      this.msj.mensajeAdvertencia(`¡Advertencia!`, `¡Debe ingresar un número de OT válido para realizar la búsqueda!`);
      return;
    }

    this.busquedaOT?.unsubscribe();
    this.cargando = true;
    this.busquedaOT = this.buscarOrdenTrabajo$(numeroOT).pipe(
      switchMap(resultado => resultado ? this.prepararCargaOrdenTrabajo$(resultado) : of(null))
    ).subscribe(resultado => {
      if (!resultado) {
        this.msj.mensajeAdvertencia(`¡Advertencia!`, `¡No existe una Orden de Trabajo con el número ${numeroOT}!`);
        if (this.otCargada != null) this.FormOrdenTrabajo.patchValue({ OT_Id: this.otCargada });
        this.cargando = false;
        return;
      }
      if (resultado.productoNoEncontrado) return this.cancelarCargaOTSinProducto(numeroOT);
      if (resultado.origen == 'plasticaribe') this.cargarOrdenTrabajoPlasticaribe(resultado.datos);
      else this.cargarOrdenTrabajoBagPro(resultado, numeroOT);
      this.otCargada = numeroOT;
      this.consultarProduccionProcesos(numeroOT);
    }, error => {
      this.msj.mensajeError(`¡No fue posible consultar la Orden de Trabajo N° ${numeroOT}!`, error.error);
      this.restaurarNumeroOTSinCarga(numeroOT);
      this.cargando = false;
    });
  }

  /**
   * Tras un error al consultar una OT, vuelve a poner en el campo el número consultado si la pantalla quedó
   * sin OT cargada (prepararCargaOrdenTrabajo$ ya la limpió), para que ◀ ▶ tengan una base para navegar.
   * Si la OT anterior sigue cargada no se toca el campo.
   * @param numeroOT Número de la OT consultada.
   * @returns No retorna un valor.
   */
  private restaurarNumeroOTSinCarga(numeroOT: number): void {
    if (this.otCargada == null) this.FormOrdenTrabajo.patchValue({ OT_Id: numeroOT });
  }

  /**
   * Termina la carga de una OT cuyo item/presentación no existe en Plasticaribe: avisa, deja la pantalla limpia
   * (ya la limpió prepararCargaOrdenTrabajo$), sin modo edición, y conserva el número consultado para poder navegar.
   * @param numeroOT Número de la OT que se intentó cargar.
   * @returns No retorna un valor.
   */
  private cancelarCargaOTSinProducto(numeroOT: number): void {
    this.avisarProductoNoEncontrado(`la OT N° ${numeroOT}`);
    this.FormOrdenTrabajo.patchValue({ OT_Id: numeroOT });
    this.cargando = false;
  }

  /**
   * Calcula el número de OT a consultar sin modificar el estado de la pantalla.
   * @param numero -1/1 navega desde la OT cargada (o la digitada); 0 usa la digitada; cualquier otro valor es un número absoluto.
   * @returns Número de OT válido (entero mayor que cero) o null si no se puede determinar.
   */
  resolverNumeroOT(numero: number): number | null {
    let numeroOT: number;
    if ([0, 1, -1].includes(numero)) {
      const base = numero == 0 ? this.FormOrdenTrabajo.value.OT_Id : (this.otCargada ?? this.FormOrdenTrabajo.value.OT_Id);
      if (base == null || base === '') return null;
      numeroOT = Number(base) + numero;
    } else numeroOT = Number(numero);
    return Number.isInteger(numeroOT) && numeroOT > 0 ? numeroOT : null;
  }

  /**
   * Busca la OT primero en Plasticaribe y, si no está, en BagPro (filtrando por vendedor cuando el rol es 2).
   * Solo un 400/404 se considera "no encontrada"; cualquier otro error se propaga.
   * @param numeroOT Número de la OT a buscar.
   * @returns Observable con la OT y su origen, o null si no existe en ninguno de los dos sistemas.
   */
  buscarOrdenTrabajo$(numeroOT: number): Observable<ResultadoBusquedaOT | null> {
    return this.ordenTrabajoService.GetOrdenTrabajo(numeroOT, '').pipe(
      catchError(error => this.esOrdenNoEncontrada(error) ? of([]) : throwError(() => error)),
      switchMap(datos => datos?.length > 0
        ? of({ origen: 'plasticaribe', datos: datos[0] } as ResultadoBusquedaOT)
        : this.buscarOrdenTrabajoBagPro$(numeroOT))
    );
  }

  /**
   * Busca la OT solo en BagPro, filtrando por vendedor cuando el rol es 2.
   * @param numeroOT Número de la OT a buscar.
   * @returns Observable con la OT de BagPro, o null si no existe; cualquier error distinto de 400/404 se propaga.
   */
  buscarOrdenTrabajoBagPro$(numeroOT: number): Observable<ResultadoBusquedaOT | null> {
    const sales = this.ValidarRol == 2 ? `?sales=${String(this.storage_Id).padStart(3, '0')}` : '';
    return this.bagProService.GetOrdenDeTrabajo(numeroOT, sales).pipe(
      map(datos => datos?.length > 0 ? { origen: 'bagpro', datos: datos[0] } as ResultadoBusquedaOT : null),
      catchError(error => this.esOrdenNoEncontrada(error) ? of(null) : throwError(() => error))
    );
  }

  /**
   * Indica si un error HTTP de consulta de OT significa "no encontrada" (las APIs responden 400 o 404).
   * @param error Error devuelto por la consulta.
   * @returns true si la OT no existe; false si es otro tipo de error.
   */
  private esOrdenNoEncontrada = (error: HttpErrorResponse): boolean => [400, 404].includes(error.status);

  /**
   * Carga una OT de BagPro como plantilla para crear una nueva. Lo usa la búsqueda de OTs (crear / copiar OT).
   * Si la OT no existe en BagPro se avisa y no se modifica la pantalla; si su item/presentación no existe en
   * Plasticaribe se avisa, la pantalla queda limpia y no se ejecuta `alCargar`.
   * @param ot Número de la OT o fila de la búsqueda con la propiedad ordenTrabajo.
   * @param alCargar Función opcional que se ejecuta cuando la OT quedó cargada (p. ej. copiar OT).
   * @returns No retorna un valor.
   */
  busquedaOTBagPro(ot: any, alCargar?: () => void) {
    const numeroOT = Number(typeof ot == 'number' ? ot : ot?.ordenTrabajo);
    if (!Number.isInteger(numeroOT) || numeroOT <= 0) {
      this.msj.mensajeAdvertencia(`¡Advertencia!`, `¡Debe ingresar un número de OT válido para realizar la búsqueda!`);
      return;
    }

    this.busquedaOT?.unsubscribe();
    this.cargando = true;
    this.busquedaOT = this.buscarOrdenTrabajoBagPro$(numeroOT).pipe(
      switchMap(resultado => resultado ? this.prepararCargaOrdenTrabajo$(resultado) : of(null))
    ).subscribe(resultado => {
      if (!resultado) {
        this.msj.mensajeAdvertencia(`¡Advertencia!`, `¡No existe en BagPro una Orden de Trabajo con el número ${numeroOT}!`);
        this.cargando = false;
        return;
      }
      // Sin producto no se carga la OT ni se ejecuta alCargar (la copia de OT no guarda)
      if (resultado.productoNoEncontrado) return this.cancelarCargaOTSinProducto(numeroOT);
      this.cargarOrdenTrabajoBagPro(resultado, numeroOT, false);
      this.otCargada = numeroOT;
      this.consultarProduccionProcesos(numeroOT);
      alCargar?.();
    }, error => {
      this.msj.mensajeError(`¡No fue posible consultar la Orden de Trabajo N° ${numeroOT} en BagPro!`, error.error);
      this.restaurarNumeroOTSinCarga(numeroOT);
      this.cargando = false;
    });
  }

  /**
   * Consulta en Estados Procesos OT (Plasticaribe) los kg producidos por proceso de la OT, sin importar si la OT
   * se cargó desde Plasticaribe o desde BagPro. No consulta BagPro. Cancela la consulta anterior para no mostrar
   * datos de otra OT y un fallo no impide cargar ni editar la OT.
   * @param ot Número de la OT cuya producción se va a mostrar.
   * @returns No retorna un valor.
   */
  consultarProduccionProcesos(ot: number) {
    this.consultaProduccion?.unsubscribe();
    this.otProduccion = ot;
    this.produccionProcesos = [];
    this.cargandoProduccion = true;
    this.consultaProduccion = this.estadosProcesosService.consultaPorOT(ot).pipe(
      finalize(() => this.cargandoProduccion = false)
    ).subscribe(datos => this.produccionProcesos = this.unaFilaProduccion(datos), () => {
      this.msj.mensajeAdvertencia(`¡Advertencia!`, `¡No fue posible consultar la producción por proceso de la OT N° ${ot}!`);
    });
  }

  /**
   * Deja una sola fila de Estados Procesos OT por OT. Si la tabla tiene registros duplicados de la misma OT (pasa
   * cuando el trigger de ClientesOT la crea más de una vez), los triggers de producción actualizan todos por número
   * de OT, así que tienen los mismos kilos: se muestra el registro original (el de menor EstProcOT_Id).
   * @param datos Filas devueltas por la consulta de Estados Procesos OT.
   * @returns Lista con una fila, o vacía si no hay datos.
   */
  private unaFilaProduccion(datos: any[] | null): any[] {
    if (!Array.isArray(datos) || datos.length == 0) return [];
    const original = datos.reduce((menor, fila) => Number(fila?.estProcOT_Id) < Number(menor?.estProcOT_Id) ? fila : menor);
    return [original];
  }

  /**
   * Cancela la consulta de producción en curso y oculta la tabla de producción por proceso.
   * @returns No retorna un valor.
   */
  limpiarProduccionProcesos() {
    this.consultaProduccion?.unsubscribe();
    this.produccionProcesos = [];
    this.otProduccion = null;
    this.cargandoProduccion = false;
  }

  /**
   * Limpia la pantalla y consulta lo necesario para cargar la OT encontrada: el producto y, para BagPro, la sede del cliente.
   * @param resultado OT encontrada y su origen.
   * @returns Observable con el mismo resultado, incluida la sede cuando el origen es BagPro, y marcado con
   * `productoNoEncontrado` si el item/presentación de la OT no existe en Plasticaribe.
   */
  prepararCargaOrdenTrabajo$(resultado: ResultadoBusquedaOT): Observable<ResultadoBusquedaOT> {
    this.limpiarCampos();
    this.cargando = true;
    if (resultado.origen == 'plasticaribe') {
      this.producto = resultado.datos.id_Producto;
      this.presentacionProducto = resultado.datos.id_Presentacion;
      return this.obtenerInformacionProducto$(false).pipe(
        map(producto => ({ ...resultado, productoNoEncontrado: !producto }))
      );
    }

    this.producto = resultado.datos.id_Producto;
    this.presentacionProducto = resultado.datos.presentacion == 'Kilo' ? 'Kg' : resultado.datos.presentacion == 'Unidad' ? 'Und' : resultado.datos.presentacion;
    return forkJoin({ producto: this.obtenerInformacionProducto$(false), sede: this.consultarSedeCliente$(resultado.datos.nitCliente) }).pipe(
      map(({ producto, sede }) => ({ ...resultado, sede, productoNoEncontrado: !producto }))
    );
  }

  /**
   * Carga en los formularios una OT existente en Plasticaribe y habilita el modo edición.
   * Guarda su Valor Kg para conservarlo al editar cuando la presentación no lo calcula (MTS) y su versión
   * (`rowVersion` del GET), que se envía como `Ot_RowVersion` al editar.
   * @param datos Fila de la OT devuelta por getOrdenTrabajo.
   * @returns No retorna un valor.
   */
  cargarOrdenTrabajoPlasticaribe(datos: any) {
    const valorKg = Number(datos.valorKg);
    this.valorKgCargado = datos.valorKg != null && Number.isFinite(valorKg) ? valorKg : null;
    // M6: el GET devuelve `rowVersion`; el PUT lo espera como `Ot_RowVersion` (ver editarOrdenTrabajo)
    this.rowVersionCargada = typeof datos.rowVersion === 'string' && datos.rowVersion.trim() !== '' ? datos.rowVersion : null;
    this.FormOrdenTrabajo.patchValue({
      'OT_Id': datos.numero_Orden,
      'Id_Vendedor': datos.id_Vendedor,
      'Nombre_Vendedor': this.idVendedorParaDropdown(datos.id_Vendedor),
      'OT_FechaCreacion': datos.fecha_Creacion?.replace('T00:00:00', '') ?? null,
      'OT_FechaEntrega': datos.fecha_Entrega ? moment(datos.fecha_Entrega.replace('T00:00:00', '')).toDate() : null,
      'Id_Cliente': datos.id_Cliente,
      'Nombre_Cliente': datos.cliente,
      'Id_Producto': datos.id_Producto,
      'Nombre_Producto': datos.producto,
      'Cantidad': datos.cantidad_Pedida,
      'Presentacion': datos.id_Presentacion,
      'OT_Estado': datos.estado_Orden,
      'OT_Observacion': datos.observacion,
      'Margen': datos.margen,
      'Precio': this.presentacionProducto == 'Kg' ? datos.valorKg : datos.valorUnidad,
    });
    this.llenarFormularios(datos);
    this.edicionOrdenTrabajo = true;
    // `cliente` ya es el nombre propio de la OT si se cambió en una edición anterior (Ot_NombreCliente)
    this.nombresCargados = { sede: datos.id_Cliente, cliente: `${datos.cliente ?? ''}`.trim(), producto: `${datos.producto ?? ''}`.trim() };
  }

  /**
   * Carga una OT que solo existe en BagPro como plantilla para crear una nueva; no habilita el modo edición.
   * @param resultado OT de BagPro y la sede del cliente (puede ser null).
   * @param numeroOT Número de la OT consultada.
   * @param avisarSoloBagPro Muestra el aviso de que la OT no existe en Plasticaribe (consulta por número de OT).
   * @returns No retorna un valor.
   */
  cargarOrdenTrabajoBagPro(resultado: ResultadoBusquedaOT, numeroOT: number, avisarSoloBagPro: boolean = true) {
    if (!resultado.sede) this.msj.mensajeAdvertencia(`Advertencia`, `No se encontró la sede del cliente consultada.`);
    this.cargarFormularios(resultado.sede, resultado.datos, numeroOT);
    this.calcularDatosOt();
    this.edicionOrdenTrabajo = false;
    this.cargando = false;
    if (avisarSoloBagPro) this.msj.mensajeInformacion(`OT N° ${numeroOT} encontrada solo en BagPro`, `Se cargó como plantilla para crear una nueva Orden de Trabajo.`, 5000);
  }

  // Función que llena los formularios con los datos de la orden de trabajo
  llenarFormularios(datos_orden: any) {
    this.validarProcesosOrdenTrabajo(datos_orden);
    this.llenarFormularioExtrusion(datos_orden);
    this.llenarFormularioImpresion(datos_orden);
    this.llenarFormularioLaminado(datos_orden);
    this.llenarFormularioCorte(datos_orden);
    this.llenarFormularioSellado(datos_orden);
    this.FormOrdenTrabajoMezclas.patchValue({ Nombre_Mezclas: datos_orden.mezcla_Nombre });
    this.cargarCombinacionMezclas();
    this.programarCalculo(() => this.calcularDatosOt(), 1000);
    this.cargando = false;
  }

  /**
   * Valida la información de la OT en edición y, si es correcta, pide confirmación antes de actualizarla.
   * No hace nada si ya hay un guardado en curso o si la confirmación ya está abierta (una sola confirmación).
   * @returns No retorna un valor.
   */
  validarActualizacionOT() {
    if (this.guardando || this.confirmandoEdicion || !this.validarRolGuardar()) return;
    this.resaltarObligatorios = true;
    if (!this.FormOrdenTrabajo.valid) {
      this.avisarCamposVacios();
      return;
    }
    let ot: number = this.FormOrdenTrabajo.value.OT_Id;
    if (!this.prepararFormulariosParaGuardar()) return;
    this.cerrarMensaje();
    this.confirmandoEdicion = true;
    this.messageService.add({
      severity: 'warn',
      key: 'editarOrden',
      summary: 'Confirmación de Edición de OT',
      detail:
        `<h6><b>Esta seguro de editar la información de la Orden de Trabajo N° ${ot}?</b></h6><br>` +
        `<spam><b>¡Al hacer esto no se recuperarán los datos iniciales!</b><br></spam>` +
        this.avisoCambioNombres(),
      sticky: true
    });
  }

  /**
   * Actualiza la orden de trabajo en un único flujo: datos actuales de la OT → datos de procesos → edición.
   * Solo actúa en modo edición y si no hay un guardado en curso (evita doble envío). Cualquier error o validación
   * fallida muestra un mensaje y libera la pantalla; si la OT se actualiza, limpia los campos y abre su PDF.
   * Antes de enviar vuelve a validar y recalcular de forma síncrona (`prepararFormulariosParaGuardar`), por si el usuario
   * cambió datos con la confirmación abierta: así se envían los costos actuales con una sola confirmación.
   * Envía la versión con la que se cargó la OT (`Ot_RowVersion`); si no la tiene, no envía y pide volver a cargarla.
   * Si la API responde 409 (otro usuario la modificó), avisa que hay que volver a cargarla.
   * @returns No retorna un valor.
   */
  editarOrdenTrabajo() {
    if (!this.edicionOrdenTrabajo || this.guardando || !this.validarRolGuardar()) return;
    this.cerrarMensaje();
    if (!this.FormOrdenTrabajo.valid) {
      this.msj.mensajeAdvertencia(`¡Advertencia!`, `¡Hay campos del formulario vacios!`);
      return;
    }
    // No repite el aviso de Valor Kg 0 si ya se mostró al pedir la confirmación (sí lo muestra si la condición es nueva)
    if (!this.prepararFormulariosParaGuardar(false)) return;
    let ot: number = this.FormOrdenTrabajo.value.OT_Id;
    const rowVersion = this.rowVersionCargada;
    if (!rowVersion) {
      this.msj.mensajeAdvertencia(`¡No se puede editar la OT N° ${ot}!`, `No se recibió la versión de la OT. Vuelva a cargarla e intente de nuevo.`, 6000);
      return;
    }
    this.guardando = true;
    this.cargando = true;
    let editada: boolean = false;

    this.ordenTrabajoService.GetDatosOrden(ot).pipe(
      catchError(() => {
        this.msj.mensajeError(`¡Error!`, `¡La Orden de Trabajo N° ${ot} ya no existe en Plasticaribe!`);
        return EMPTY;
      }),
      switchMap(datos_Orden => this.consultarDatosProcesos().pipe(
        catchError(error => this.cortarGuardado(`¡No fue posible consultar la información necesaria para actualizar la Orden de Trabajo!`, error)),
        map(datosProcesos => ({ datos_Orden, datosProcesos }))
      )),
      switchMap(({ datos_Orden, datosProcesos }) => {
        let procesos = this.construirProcesosOt(datosProcesos);
        if (!procesos) return EMPTY;
        let info = this.informacionOrdenTrabajo();
        // M6: mapeo explícito de la versión recibida en el GET (`rowVersion`) al campo del PUT (`Ot_RowVersion`)
        const solicitud: EditarOrdenTrabajoCompleta = { Ot_RowVersion: rowVersion, OrdenTrabajo: info, ...procesos };
        return this.ordenTrabajoService.editarOrdenCompleta(datos_Orden.ot_Id, solicitud).pipe(
          catchError((error: HttpErrorResponse) => error?.status === 409
            ? this.cortarGuardado(`La OT fue modificada por otro usuario; vuelva a cargarla`, error)
            : this.cortarGuardado(`¡No fue posible actualizar la Orden de Trabajo N° ${ot}!`, error))
        );
      }),
      finalize(() => {
        this.guardando = false;
        // Si la OT se actualizó, el overlay lo controla la generación del PDF
        if (!editada) this.cargando = false;
      })
    ).subscribe({
      next: datos_ot => {
        editada = true;
        this.msj.mensajeConfirmacion('¡Actualizado Correctamente!', `Se ha realizado la actualización de la Orden de Trabajo N° ${datos_ot.numero_OT}`);
        this.limpiarCampos();
        this.pdfOrdenTrabajo(datos_ot.numero_OT);
      },
      // Errores no previstos dentro del flujo (p. ej. datos nulos al armar la OT); los HTTP ya se informaron en cada paso
      error: error => this.informarErrorInesperadoGuardado(`¡No fue posible actualizar la Orden de Trabajo N° ${ot} por un error inesperado!`, error),
    });
  }

  /**
   * Arma los datos generales editables de la OT (lista blanca de editarCompleta). No envía Ot_Id, número, fecha ni hora
   * de creación, creador ni estado: los conserva la API y el último editor lo toma del token. Producto y presentación
   * se envían solo para que la API compruebe que no cambiaron (si difieren responde 422; cambiar el item o la presentación
   * sale del modo edición). La sede sí se puede cambiar (cliente elegido de la lista).
   * Sí se envían los nombres: el del producto se actualiza en el maestro y el del cliente se guarda solo en esta OT.
   * @returns Datos generales de la OT para editarla.
   */
  informacionOrdenTrabajo(): EditarOrdenTrabajoDatos {
    let info: EditarOrdenTrabajoDatos = {
      'SedeCli_Id': this.FormOrdenTrabajo.value.Id_Cliente,
      'Prod_Id': this.producto,
      'UndMed_Id': this.presentacionProducto,
      'Ot_FechaEntrega': this.fechaEntregaParaApi(),
      'Ot_Observacion': this.FormOrdenTrabajo.value.OT_Observacion == null ? '' : (this.FormOrdenTrabajo.value.OT_Observacion).trim().toUpperCase(),
      'Ot_Cyrel': this.cyrel,
      'Ot_Corte': this.corte,
      'Mezcla_Id': this.FormOrdenTrabajoMezclas.value.Id_Mezcla,
      'Extrusion': this.extrusion,
      'Impresion': this.impresion,
      'Rotograbado': false, // Proceso descontinuado; se conserva la columna.
      'Laminado': this.laminado,
      'Sellado': this.sellado,
      'Ot_MargenAdicional': this.FormOrdenTrabajo.value.Margen,
      'Ot_CantidadPedida': this.cantidadProducto,
      'Ot_ValorUnidad': this.valorProducto,
      'Ot_PesoNetoKg': this.netoKg,
      'Ot_ValorKg': this.valorKg,
      'Ot_ValorOT': this.valorOt,
      'Id_Vendedor': parseInt(this.FormOrdenTrabajo.value.Id_Vendedor),
      'MotrarEmpresaEtiquetas': this.motrarEmpresaEtiquetas,
      // Nombres: el del producto se actualiza en el maestro; el del cliente solo en esta OT (la API decide si cambiaron)
      'Prod_Nombre': this.textoNombre(this.FormOrdenTrabajo.value.Nombre_Producto),
      'Ot_NombreCliente': this.textoNombre(this.FormOrdenTrabajo.value.Nombre_Cliente),
    }
    return info;
  }

  /**
   * Quita los espacios al inicio y al final de un nombre del formulario.
   * @param valor Valor del campo.
   * @returns El texto sin espacios extremos; null si está vacío.
   */
  private textoNombre(valor: unknown): string | null {
    const texto = valor == null ? '' : `${valor}`.trim();
    return texto === '' ? null : texto;
  }

  /**
   * Arma el aviso de la confirmación de edición con los nombres que van a cambiar respecto a los cargados.
   * @returns HTML con los cambios de nombre (escapado), o cadena vacía si no hay cambios.
   */
  private avisoCambioNombres(): string {
    if (!this.nombresCargados) return '';
    const escapar = (texto: string) => texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const cliente = this.textoNombre(this.FormOrdenTrabajo.value.Nombre_Cliente) ?? '';
    const producto = this.textoNombre(this.FormOrdenTrabajo.value.Nombre_Producto) ?? '';
    let aviso = '';
    if (producto !== this.nombresCargados.producto) {
      aviso += `<br><span>El nombre del item ${this.producto} cambiará en el maestro de productos, BagPro y Zeus: ` +
        `<b>${escapar(this.nombresCargados.producto)}</b> → <b>${escapar(producto)}</b>.</span><br>`;
    }
    if (`${this.FormOrdenTrabajo.value.Id_Cliente ?? ''}` !== `${this.nombresCargados.sede ?? ''}`) {
      aviso += `<br><span>El cliente de la OT cambiará (en Plasticaribe y BagPro): ` +
        `<b>${escapar(this.nombresCargados.cliente)}</b> → <b>${escapar(cliente)}</b>.</span><br>`;
    } else if (cliente !== this.nombresCargados.cliente) {
      aviso += `<br><span>El nombre del cliente cambiará solo en esta OT y en su item de BagPro: ` +
        `<b>${escapar(this.nombresCargados.cliente)}</b> → <b>${escapar(cliente)}</b>.</span><br>`;
    }
    return aviso;
  }

  /**
   * En modo edición, comprueba que los nombres de producto y cliente no estén vacíos (o solo con espacios) y no superen
   * el largo que se guarda (Productos.Prod_Nombre: 100; Orden_Trabajo.Ot_NombreCliente: 150, igual a
   * Existencias_Productos.ExProd_Cliente).
   * @returns true si son válidos o no se está editando; false si alguno no lo es (ya se mostró el aviso).
   */
  private validarNombresEdicion(): boolean {
    if (!this.edicionOrdenTrabajo) return true;
    const largos: [string | null, number, string][] = [
      [this.textoNombre(this.FormOrdenTrabajo.value.Nombre_Producto), 100, 'del producto'],
      [this.textoNombre(this.FormOrdenTrabajo.value.Nombre_Cliente), 150, 'del cliente'],
    ];
    const vacio = largos.find(([texto]) => texto == null);
    if (vacio) {
      this.msj.mensajeAdvertencia(`¡No se puede guardar la OT!`, `El nombre ${vacio[2]} no puede estar vacío.`, 6000);
      return false;
    }
    const largo = largos.find(([texto, maximo]) => (texto?.length ?? 0) > maximo);
    if (largo) {
      this.msj.mensajeAdvertencia(`¡No se puede guardar la OT!`, `El nombre ${largo[2]} no puede tener más de ${largo[1]} caracteres.`, 6000);
      return false;
    }
    return true;
  }

  /**
   * Consulta la OT (Plasticaribe y, si no está, BagPro) y abre su PDF. El formato está en CreacionPdfService,
   * compartido con otras pantallas.
   * @param ot Número de la OT; por defecto la del formulario.
   */
  pdfOrdenTrabajo(ot: number = this.FormOrdenTrabajo.value.OT_Id) {
    if (ot == null) return this.msj.mensajeAdvertencia(`¡Debe llenar el campo con el Número de un OT para mostrar el PDF de dicha OT!`);

    this.cargando = true;
    this.creacionPdf.obtenerDatosOrdenTrabajo(ot).pipe(finalize(() => this.cargando = false)).subscribe({
      next: datos_ot => this.formatoPDF(datos_ot),
      error: () => this.msj.mensajeError(`¡No se encontró una Orden con el Numero ${ot}!`),
    });
  }

  /**
   * Genera y abre el PDF de una OT.
   * @param datos_ot Fila de la OT devuelta por Plasticaribe o BagPro.
   * @returns No retorna un valor.
   */
  formatoPDF(datos_ot) {
    if (!datos_ot) return this.msj.mensajeAdvertencia(`¡No se encontró información para generar el PDF de la Orden de Trabajo!`);
    try {
      this.creacionPdf.crearPdfOrdenTrabajo(datos_ot, this.AppComponent.storage_Nombre).open();
    } catch (error) {
      this.msj.mensajeError(`¡No fue posible generar el PDF de la Orden de Trabajo!`);
    }
  }

  //Función que cargará la última OT de Plasticaribe. 
  ultimoNumeroOT = () => this.ordenTrabajoService.GetUlt_Numero_OT().subscribe(data => this.ultimaOTApp = data, () => this.msj.mensajeAdvertencia(`No fue posible consultar la última OT`, ``));

  //Función que cargará la última OT de Plasticaribe. 
  ultimaOTBagPro = () => this.bagProService.srvObtenerListaClienteOT_UltimaOT().subscribe(data => this.ultimaOT = data.item, () => this.msj.mensajeAdvertencia(`No fue posible consultar la última OT de BagPro.`, ``));

  ultimoIdProducto = () => this.productoService.GetIdUltimoProducto().subscribe(data => { this.ultimoItem = data; }, () => this.msj.mensajeAdvertencia(`No fue posible consultar el último ID de Producto.`, ``));

  // Función que va a validar los formularios
  validarFormularios() {
    this.cargando = true;
    if (this.FormOrdenTrabajo.valid) {
      setTimeout(() => {
        if (this.FormOrdenTrabajoExtrusion.valid) {
          if (this.FormOrdenTrabajoImpresion.valid) {
            if (this.FormOrdenTrabajoLaminado.valid) {
              if (this.FormOrdenTrabajoCorte.valid) {
                if (this.FormOrdenTrabajoSellado.valid) {
                  if (this.FormOrdenTrabajoMezclas.valid) this.validarNuevoProducto();
                  else this.msj.mensajeAdvertencia(`¡Advertencia!`, `¡El formulario de Mezclas tiene campos vacios!`);
                } else this.msj.mensajeAdvertencia(`¡Advertencia!`, `¡El formulario de Sellado tiene campos vacios!`);
              } else this.msj.mensajeAdvertencia(`¡Advertencia!`, `¡El formulario de Corte tiene campos vacios!`);
            } else this.msj.mensajeAdvertencia(`¡Advertencia!`, `¡EL formulario de Laminado tiene campos vacios!`);
          } else this.msj.mensajeAdvertencia(`¡Advertencia!`, `¡El formulario de Impresion tiene campos vacios!`);
        } else this.msj.mensajeAdvertencia(`¡Advertencia!`, `¡EL formulario de Extrusion tiene campos vacios!`);
      }, 700);
    } else {
      this.cargando = false;
      this.msj.mensajeAdvertencia(`¡Advertencia!`, `¡Hay campos vacios en el formulario principal!`);
    }
  }

  // Función que va a crear un nuevo producto.
  validarNuevoProducto() {
    this.cargando = true;
    this.productoService.GetProductsByName(this.FormOrdenTrabajo.value.Nombre_Producto).subscribe(data => {
      if (data.length > 0) this.msj.mensajeAdvertencia(`El producto ${this.FormOrdenTrabajo.value.Nombre_Producto} ya existe!`); //this.validarDatos();
    }, () => this.crearNuevoProducto());
  }

  /**
   * Arma el nuevo producto con los Ids de tipo de sellado y formato (el guardado sigue deshabilitado).
   * Si la combinación no existe (404) o la consulta falla, avisa y libera la pantalla de carga.
   * @returns No retorna un valor.
   */
  crearNuevoProducto() {
    let tipoSellado: number = this.FormOrdenTrabajoSellado.value.TipoSellado;
    let formato: number = this.sellado ? this.FormOrdenTrabajoSellado.value.Formato_Sellado : this.FormOrdenTrabajoCorte.value.Formato_Corte;
    this.otSelladoCorteService.getTipoSellado_Formato(tipoSellado, formato).subscribe(data => {
      let item: modelProducto = {
        'Prod_Id': this.ultimoItem + 1,
        'Prod_Nombre': this.FormOrdenTrabajo.value.Nombre_Producto,
        'Prod_Descripcion': this.FormOrdenTrabajo.value.Nombre_Producto,
        'TpProd_Id': data.tpProd_Id,
        'Prod_Peso': this.pesoProducto,
        'Prod_Peso_Millar': this.FormOrdenTrabajoSellado.value.PesoMillar,
        'UndMedPeso': 'Kg',
        'Prod_Fuelle': this.FormOrdenTrabajoSellado.value.Fuelle_Sellado || this.FormOrdenTrabajoCorte.value.Fuelle_Corte,
        'Prod_Ancho': this.FormOrdenTrabajoSellado.value.Ancho_Sellado || this.FormOrdenTrabajoCorte.value.Ancho_Corte,
        'Prod_Calibre': this.FormOrdenTrabajoExtrusion.value.Calibre_Extrusion,
        'UndMedACF': this.FormOrdenTrabajoExtrusion.value.UnidadMedida_Extrusion,
        'Estado_Id': 10,
        'Prod_Largo': this.FormOrdenTrabajoSellado.value.Largo_Sellado || this.FormOrdenTrabajoCorte.value.Largo_Corte,
        'Pigmt_Id': this.FormOrdenTrabajoExtrusion.value.Pigmento_Extrusion,
        'Material_Id': this.FormOrdenTrabajoExtrusion.value.Material_Extrusion,
        'Prod_CantBolsasBulto': this.FormOrdenTrabajoSellado.value.CantidadBulto,
        'Prod_CantBolsasPaquete': this.FormOrdenTrabajoSellado.value.CantidadPaquete,
        'TpSellado_Id': data.tpSellado_Id,
        'Prod_Fecha': this.today,
        'Prod_Hora': this.hora,
        'Prod_PesoBulto': this.FormOrdenTrabajoSellado.value.PesoBulto,
        'Prod_PesoPaquete': this.FormOrdenTrabajoSellado.value.PesoPaquete,
        'Prod_PrecioDia_Sellado': this.FormOrdenTrabajoSellado.value.PrecioDia,
        'Prod_PrecioNoche_Sellado': this.FormOrdenTrabajoSellado.value.PrecioNoche,
      }
      console.log(item);
      //this.productoService.srvGuardar(item).subscribe(data => this.crearExistenciaProducto(data), () => this.msj.mensajeError(`Error`, `No fue posible crear el producto, verifique!`));
    }, (error: HttpErrorResponse) => {
      this.cargando = false;
      if (error?.status === 404) this.msj.mensajeError(`¡No existe la combinación de tipo de sellado y formato seleccionada!`, `Verifique el tipo de sellado y el formato del producto terminado.`);
      else this.msj.mensajeError(`¡No fue posible consultar el tipo de sellado y el formato!`, error?.error);
    });
  }

  // Función que va a crear una nueva existencia de producto.
  crearExistenciaProducto(data: any) {
    let existencia: modelExistenciaProductos = {
      'Prod_Id': data.prod_Id,
      'exProd_Id': 0,
      'ExProd_Cantidad': 0,
      'UndMed_Id': this.FormOrdenTrabajo.value.Presentacion,
      'TpBod_Id': 3,
      'ExProd_Precio': 0,
      'ExProd_PrecioExistencia': 0,
      'ExProd_PrecioSinInflacion': 0,
      'TpMoneda_Id': 'COP',
      'ExProd_PrecioVenta': this.FormOrdenTrabajo.value.Precio,
      'ExProd_CantMinima': 0,
      'ExProd_Fecha': this.today,
      'ExProd_Hora': this.hora,
    }
    this.svcExistencias.srvGuardar(existencia).subscribe(data => {
      this.FormOrdenTrabajo.patchValue({ OT_Id: null, Id_Producto: data.prod_Id });
      this.cargando = false;
      this.msj.mensajeConfirmacion(`Confirmación`, `Producto ${data.prod_Nombre} creado con éxito!`);
    }, () => {
      this.cargando = false;
      this.msj.mensajeError(`Error`, `No fue posible la existencia del producto, verifique!`)
    });
  }
}