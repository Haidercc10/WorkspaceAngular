import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { MessageService } from 'primeng/api';
import { modelMezMaterial } from 'src/app/Modelo/modelMezMaterial';
import { modelMezPigmento } from 'src/app/Modelo/modelMezPigmento';
import { modelMezclas } from 'src/app/Modelo/modelMezclas';
import { modelOrden_Trabajo } from 'src/app/Modelo/modelOrden_Trabajo';
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
import { OT_ExtrusionService } from 'src/app/Servicios/OrdenTrabajo_Extrusion/OT_Extrusion.service';
import { OT_ImpresionService } from 'src/app/Servicios/OrdenTrabajo_Impresion/OT_Impresion.service';
import { OT_LaminadoService } from 'src/app/Servicios/OrdenTrabajo_Laminado/OT_Laminado.service';
import { OrdenTrabajo_Sellado_CorteService } from 'src/app/Servicios/OrdenTrabajo_Sellado_Corte/OrdenTrabajo_Sellado_Corte.service';
import { PigmentoProductoService } from 'src/app/Servicios/PigmentosProductos/pigmentoProducto.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import { Tipos_ImpresionService } from 'src/app/Servicios/TipoImpresion/Tipos_Impresion.service';
import { TipoProductoService } from 'src/app/Servicios/TipoProducto/tipo-producto.service';
import { TiposSelladoService } from 'src/app/Servicios/TiposSellado/TiposSellado.service';
import { TratadoService } from 'src/app/Servicios/Tratado/Tratado.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsOrdenesTrabajo as defaultSteps, stepsMezclasOT as defaultSteps2 } from 'src/app/data';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';

@Component({
  selector: 'app-Orden_Trabajo',
  templateUrl: './Orden_Trabajo.component.html',
  styleUrls: ['./Orden_Trabajo.component.css']
})

export class Orden_TrabajoComponent implements OnInit {

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

  modoSeleccionado: boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  cargando: boolean = false; //Variable para validar que salga o no la imagen de carga
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
  ModalCrearProductos: boolean = false; //Funcion que va a mostrar o no el modal de productos
  ModalCrearCliente: boolean = false; //Funcion que va a mostrar o no el modal de clientes

  arrayMateriales = []; /** Array que colocará las materiales en los combobox al momento de crear la OT*/
  formatos: any = []; //Variable que servirá para almacenar los formatos que se harán en extrusion
  arrayPigmentos = []; /** Array que colocará las pigmentos en los combobox al momento de crear la OT */
  tratado: any = []; //Vairbale que servirá para almacenar los tratado que puede tener una bolsa en el proceso de extrusion
  arrayUnidadesMedidas = []; /** Array que colocará las unidades de medida en los combobox al momento de crear la OT*/
  tiposImpresion: any = []; //Variable que guardará los diferentes tipos de impresion que hay en la empresa
  arrayTintas = []; /** Array que colocará las tintas en los combobox al momento de crear la OT */
  laminado_capas: any = []; //Vaiable qie almacenará los diferentes laminados
  tipoProductos: any[] = []; //Vairbla que almacenará la informacion de ls tipos de productos
  tipoSellado: any[] = []; //Variable que almacenará la informacion de los tipos de sellados

  extrusion: boolean = false; //Variable que servirá para saber si se pasará por el proceso o no
  impresion: boolean = false; //Variable que servirá para saber si se pasará por el proceso o no
  rotograbado: boolean = false; //Variable que servirá para saber si se pasará por el proceso o no
  laminado: boolean = false; //Variable que servirá para saber si se pasará por el proceso o no
  doblado: boolean = false; //Variable que servirá para saber si se pasará por el proceso o no
  sellado: boolean = false; //Variable que servirá para saber si se pasará por el proceso o no
  corte: boolean = false; //Variable que servirá para saber si se pasará por el proceso o no
  cyrel: boolean = false; //Variable que servirá para saber si se pasará por el proceso o no
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
    private otExtrusionServie: OT_ExtrusionService,
    private otImpresionService: OT_ImpresionService,
    private otLaminadoService: OT_LaminadoService,
    private otSelladoCorteService: OrdenTrabajo_Sellado_CorteService,
    private usuarioService: UsuarioService,
    private messageService: MessageService,
    private shepherdService: ShepherdService,) {

    this.modoSeleccionado = this.AppComponent.temaSeleccionado;

    this.FormOrdenTrabajo = this.frmBuilderPedExterno.group({
      OT_Id: [null],
      Id_Vendedor: [null, Validators.required],
      Nombre_Vendedor: [null, Validators.required],
      OT_FechaCreacion: [this.today, Validators.required],
      OT_FechaEntrega: [this.today, Validators.required],
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
      Peso_Extrusion: [0, Validators.required],
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
    });

    this.FormOrdenTrabajoCorte = this.frmBuilderPedExterno.group({
      Formato_Corte: [null, Validators.required],
      Ancho_Corte: [null, Validators.required],
      Largo_Corte: [null, Validators.required],
      Fuelle_Corte: [null, Validators.required],
      Margen_Corte: [null, Validators.required],
    });

    this.FormOrdenTrabajoSellado = this.frmBuilderPedExterno.group({
      Formato_Sellado: [null, Validators.required],
      Ancho_Sellado: [null, Validators.required],
      Largo_Sellado: [null, Validators.required],
      Fuelle_Sellado: [null, Validators.required],
      Margen_Sellado: [null, Validators.required],
      PesoMillar: [0, Validators.required],
      TipoSellado: [0, Validators.required],
      PrecioDia: [0, Validators.required],
      PrecioNoche: [0, Validators.required],
      CantidadPaquete: [0, Validators.required],
      PesoPaquete: [0, Validators.required],
      CantidadBulto: [0, Validators.required],
      PesoBulto: [0, Validators.required],
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
    this.limpiarCampos();
  }

  /** Función que mostrará un tutorial describiendo paso a paso cada funcionalidad de la aplicación */
  verTutorial() {
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
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
      OT_FechaEntrega: this.today,
      OT_Estado: 15
    });
  }

  // Funcion que va a limpiar los campos del formulario de extrusión
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
      Peso_Extrusion: 0,
    });
  }

  // Funcion que va a limpiar los campos del formulario de impresion y rotograbado
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
    });
  }

  // Funcion que va a limpiar los campos del formulario de laminado
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
    });
  }

  // Funcion que va a limpiar los campos del formulario de orte
  limpiarFormCorte() {
    this.FormOrdenTrabajoCorte.patchValue({
      Formato_Corte: 7,
      Ancho_Corte: 0,
      Largo_Corte: 0,
      Fuelle_Corte: 0,
      Margen_Corte: 0,
    });
  }

  // Funcion que va a limpíar los campos del formulario de sellado
  limpiarFormSellado() {
    this.FormOrdenTrabajoSellado.patchValue({
      Formato_Sellado: 7,
      Ancho_Sellado: 0,
      Largo_Sellado: 0,
      Fuelle_Sellado: 0,
      Margen_Sellado: 0,
      PesoMillar: 0,
      TipoSellado: 'NO APLICA',
      PrecioDia: 0,
      PrecioNoche: 0,
      CantidadPaquete: 0,
      PesoPaquete: 0,
      CantidadBulto: 0,
      PesoBulto: 0,
    });
  }

  // Funcion que va a limpiar los campos del formulario de mezclas
  limpiarFormMezclas() {
    this.FormOrdenTrabajoMezclas.patchValue({ Nombre_Mezclas: 'ALTA 1 X 1 NEGRO', });
  }

  // Funcion que va a limpiar los campos de los formularios de cada proceso y tambien los checkbox
  limpiarProducto() {
    this.limpiarFormExtrusion();
    this.limpiarFormImpresion();
    this.limpiarFormLaminado();
    this.limpiarFormCorte();
    this.limpiarFormSellado();
    this.limpiarFormMezclas();
    this.extrusion = false;
    this.impresion = false;
    this.rotograbado = false;
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

  // Funcion que limpiará todos los campos
  limpiarCampos() {
    this.limpiarFormOrdenTrabajo();
    this.limpiarFormExtrusion();
    this.limpiarFormImpresion();
    this.limpiarFormLaminado();
    this.limpiarFormCorte();
    this.limpiarFormSellado();
    this.limpiarFormMezclas();
    this.cerrarMensaje();
    this.edicionOrdenTrabajo = false;
    this.cyrel = false;
    this.corte = false;
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
    this.rotograbado = false;
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
  }

  //Cargar modal de crear producto
  LlamarModalCrearProducto = () => this.ModalCrearProductos = true;

  // Funcion para llamar el modal que crea clientes
  LlamarModalCrearCliente = () => this.ModalCrearCliente = true;

  // Funcion que va a cerrar el mensaje de confirmación de edicion de una orden de trabajo
  cerrarMensaje = () => this.messageService.clear('editarOrden');

  /** Función que cargará las tintas en los combobox al momento de crear la OT. */
  cargarTintasEnProcesoImpresion = () => this.servicioTintas.srvObtenerLista().subscribe(tintas => this.arrayTintas = tintas.filter((item) => item.catMP_Id == 7));

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

  // Funcion que va a consultar los vendedores de la empresa
  consultarVendedores() {
    this.usuarioService.GetVendedores().subscribe(data => {
      this.vendedores = data;
      this.vendedores.sort((a, b) => a.usua_Nombre.localeCompare(b.usua_Nombre));
    });
  }

  // Funcion que va a consultar los clientes de la empresa
  consultarClientes = () => {
    let nombre = this.FormOrdenTrabajo.value.Nombre_Cliente;
    this.clienteServise.LikeGetCliente(nombre).subscribe(data => {
      this.clientes = data;
      this.clientes.sort((a, b) => a.cli_Nombre.localeCompare(b.cli_Nombre));
    });
  }

  // Funcion que va a colocar la información del cliente seleccionado en cada campo
  clienteSeleccionado() {
    let id_cliente = this.FormOrdenTrabajo.value.Nombre_Cliente;
    let cliente = this.clientes.find(x => x.cli_Id == id_cliente);
    let vendedor = (cliente.usua_Id).toString();
    this.usuarioService.getUsuariosxId(vendedor).subscribe(data => {
      this.FormOrdenTrabajo.patchValue({
        Id_Cliente: cliente.cli_Id,
        Nombre_Cliente: cliente.cli_Nombre,
        Id_Vendedor: vendedor.length == 2 ? vendedor = `0${vendedor}` : vendedor.length == 1 ? `00${vendedor}` : vendedor,
        Nombre_Vendedor: data[0].usua_Nombre,
      });
    });
  }

  // Funcion que va a limpiar los campos de cliente
  limpiarCliente() {
    this.FormOrdenTrabajo.patchValue({
      Id_Cliente: null,
      Nombre_Cliente: null
    });
  }

  // Funcion que va a consultar los productos de la empresa
  consultarProductos() {
    let nombreProducto = this.FormOrdenTrabajo.get('Nombre_Producto').value;
    this.productoService.obtenerItemsLike(nombreProducto).subscribe(data => this.productos = data);
  }

  // Funcion que va a colocar la información del producto seleccionado en cada campo
  productoSeleccionado() {
    let id_producto = this.FormOrdenTrabajo.value.Nombre_Producto;
    let producto = this.productos.find(x => x.prod_Id == id_producto);
    this.FormOrdenTrabajo.patchValue({
      Id_Producto: producto.prod_Id,
      Nombre_Producto: producto.prod_Nombre,
    });
    if (this.FormOrdenTrabajo.value.Id_Producto != null && this.FormOrdenTrabajo.value.Presentacion != null) this.consultarInfoProducto();
  }

  // 
  vendedorSeleccionado() {
    let nombre = this.FormOrdenTrabajo.value.Nombre_Vendedor;
    let vendedor = this.vendedores.find(x => x.usua_Nombre == nombre);
    let Id_vendedor = (vendedor.usua_Id).toString();
    this.FormOrdenTrabajo.patchValue({
      Id_Vendedor: Id_vendedor.length == 2 ? Id_vendedor = `0${Id_vendedor}` : Id_vendedor.length == 1 ? `00${Id_vendedor}` : Id_vendedor,
      Nombre_Vendedor: vendedor.usua_Nombre,
    });
  }

  // Funcion que va a buscar la información del producto por su ID
  buscarProductoPorId() {
    let id: any = this.FormOrdenTrabajo.value.Id_Producto;
    this.productoService.srvObtenerListaPorId(id).subscribe(data => {
      this.FormOrdenTrabajo.patchValue({
        Id_Producto: data.prod_Id,
        Nombre_Producto: data.prod_Nombre,
      });
      if (this.FormOrdenTrabajo.value.Id_Producto != null && this.FormOrdenTrabajo.value.Presentacion != null) this.consultarInfoProducto();
    }, () => this.msj.mensajeAdvertencia(`¡No se encontró información del Item buscado!`));
  }

  // Funcion que va a buscar la información de un producto
  buscarInformacionProducto() {
    this.productoService.GetInfoProducto_Prod_Presentacion(this.producto, this.presentacionProducto).subscribe(datos_producto => {
      if (datos_producto.length == 0) this.msj.mensajeAdvertencia(`¡No hay información de una OT para el item ${this.producto} con la presentación ${this.presentacionProducto}!`);
      for (let j = 0; j < datos_producto.length; j++) {
        let productoExt: any = {
          Id: datos_producto[j].produ.prod_Id,
          Nombre: datos_producto[j].produ.prod_Nombre,
          Ancho: datos_producto[j].produ.prod_Ancho,
          Fuelle: datos_producto[j].produ.prod_Fuelle,
          Largo: datos_producto[j].produ.prod_Largo,
          Cal: datos_producto[j].produ.prod_Calibre,
          Und: this.presentacionProducto,
          Peso_Producto: datos_producto[j].produ.prod_Peso,
          PesoMillar: datos_producto[j].produ.prod_Peso_Millar,
          Tipo: datos_producto[j].tipo_Producto,
          Material: datos_producto[j].material,
          Pigmento: datos_producto[j].pigmento,
          CantPaquete: datos_producto[j].produ.prod_CantBolsasPaquete,
          CantBulto: datos_producto[j].produ.prod_CantBolsasBulto,
          TipoSellado: datos_producto[j].tipo_Sellado,
          Cant: parseFloat(this.FormOrdenTrabajo.value.Cantidad) | 0,
          UndCant: this.presentacionProducto,
          PrecioUnd: this.FormOrdenTrabajo.value.Precio != null ? this.FormOrdenTrabajo.value.Precio : datos_producto[j].precioUnidad,
        }
        this.ArrayProducto.push(productoExt);
      }
    }, () => this.msj.mensajeAdvertencia(`¡No hay información de una OT para el item ${this.producto} con la presentación ${this.presentacionProducto}!`));
  }

  // Funcion que va a consultar las presentaciones de los productos
  consultarPresentaciones = () => this.undService.srvObtenerLista().subscribe(data => this.presentaciones = data.filter(x => ['Kg', 'Paquete', 'Rollo', 'Und'].includes(x.undMed_Id)));

  // Funcion que va a consultar los estados que puede tener la orden de trabajo
  consultarEstados = () => this.estadosService.srvObtenerListaEstados().subscribe(data => this.estados = data.filter(x => [3, 4].includes(x.tpEstado_Id)));

  // Funcion que va a consultar los datos de la ultima orden de trabajo realizada al producto que se seleccionó
  consultarInfoProducto() {
    this.limpiarProducto();
    if (this.FormOrdenTrabajo.value.Id_Producto != null && this.FormOrdenTrabajo.value.Presentacion != null) {
      this.cargando = true;
      this.producto = this.FormOrdenTrabajo.value.Id_Producto;
      this.presentacionProducto = this.FormOrdenTrabajo.value.Presentacion;
      this.buscarInformacionProducto();
      this.ordenTrabajoService.GetInfoUltOT(this.producto, this.presentacionProducto).subscribe(datos_Ot => {
        this.FormOrdenTrabajo.patchValue({
          OT_Observacion: datos_Ot.observacion,
          Margen: datos_Ot.margen,
          Cantidad: datos_Ot.cantidad_Pedida,
          Precio: this.presentacionProducto != 'Kg' ? datos_Ot.precioUnidad : datos_Ot.precioKilo,
        });
        this.FormOrdenTrabajoExtrusion.patchValue({
          Material_Extrusion: datos_Ot.id_Material,
          Formato_Extrusion: datos_Ot.id_Formato_Extrusion,
          Pigmento_Extrusion: datos_Ot.id_Pigmento_Extrusion,
          Ancho_Extrusion1: datos_Ot.ancho1_Extrusion,
          Ancho_Extrusion2: datos_Ot.ancho2_Extrusion,
          Ancho_Extrusion3: datos_Ot.ancho3_Extrusion,
          Calibre_Extrusion: datos_Ot.calibre_Extrusion,
          UnidadMedida_Extrusion: datos_Ot.und_Extrusion,
          Tratado_Extrusion: datos_Ot.id_Tratado,
          Peso_Extrusion: datos_Ot.peso_Extrusion,
        });
        this.FormOrdenTrabajoImpresion.patchValue({
          Tipo_Impresion: datos_Ot.id_Tipo_Imptesion,
          Rodillo_Impresion: datos_Ot.rodillo,
          Pista_Impresion: datos_Ot.pista,
          Tinta_Impresion1: datos_Ot.tinta1,
          Tinta_Impresion2: datos_Ot.tinta2,
          Tinta_Impresion3: datos_Ot.tinta3,
          Tinta_Impresion4: datos_Ot.tinta4,
          Tinta_Impresion5: datos_Ot.tinta5,
          Tinta_Impresion6: datos_Ot.tinta6,
          Tinta_Impresion7: datos_Ot.tinta7,
          Tinta_Impresion8: datos_Ot.tinta8,
        });
        this.FormOrdenTrabajoLaminado.patchValue({
          Capa_Laminado1: datos_Ot.id_Capa1,
          Calibre_Laminado1: datos_Ot.calibre_Laminado_Capa1,
          cantidad_Laminado1: datos_Ot.cantidad_Laminado_Capa1,
          Capa_Laminado2: datos_Ot.id_Capa2,
          Calibre_Laminado2: datos_Ot.calibre_Laminado_Capa2,
          cantidad_Laminado2: datos_Ot.cantidad_Laminado_Capa2,
          Capa_Laminado3: datos_Ot.id_Capa3,
          Calibre_Laminado3: datos_Ot.calibre_Laminado_Capa3,
          cantidad_Laminado3: datos_Ot.cantidad_Laminado_Capa3,
        });
        this.FormOrdenTrabajoCorte.patchValue({
          Formato_Corte: datos_Ot.formato_Producto,
          Ancho_Corte: datos_Ot.selladoCorte_Ancho,
          Largo_Corte: datos_Ot.selladoCorte_Largo,
          Fuelle_Corte: datos_Ot.selladoCorte_Fuelle,
          Margen_Corte: datos_Ot.margen,
        });
        this.FormOrdenTrabajoSellado.patchValue({
          Formato_Sellado: datos_Ot.formato_Producto,
          Ancho_Sellado: datos_Ot.selladoCorte_Ancho,
          Largo_Sellado: datos_Ot.selladoCorte_Largo,
          Fuelle_Sellado: datos_Ot.selladoCorte_Fuelle,
          Margen_Sellado: datos_Ot.margen,
          PesoMillar: datos_Ot.prod_Peso_Millar,
          TipoSellado: datos_Ot.tpSellados_Nombre,
          CantidadPaquete: datos_Ot.selladoCorte_CantBolsasPaquete,
          CantidadBulto: datos_Ot.selladoCorte_CantBolsasBulto,
          PrecioDia: datos_Ot.selladoCorte_PrecioSelladoDia,
          PrecioNoche: datos_Ot.selladoCorte_PrecioSelladoNoche,
        });
        this.FormOrdenTrabajoMezclas.patchValue({ Nombre_Mezclas: datos_Ot.mezcla_Nombre, });
        setTimeout(() => {
          this.cyrel = datos_Ot.cyrel == false ? false : true;
          this.extrusion = datos_Ot.extrusion == false ? false : true;
          this.impresion = datos_Ot.impresion == false ? false : true;
          this.rotograbado = datos_Ot.rotograbado == false ? false : true;
          this.laminado = datos_Ot.laminado == false ? false : true;
          this.corte = datos_Ot.corte == false ? false : true;
          this.sellado = datos_Ot.sellado == false ? false : true;
          this.calcularDatosOt();
          this.cargarCombinacionMezclas();
        }, 500);
      }, () => {
        let presentacion: string = this.presentacionProducto, impresion: any, laminadoCapa1: any, laminadoCapa2: any, laminadoCapa3: any;
        if (presentacion == 'Kg') presentacion = 'Kilo';
        else if (presentacion == 'Und') presentacion = 'Unidad';
        this.bagProService.srvObtenerListaClienteOT_Item_Presentacion(this.producto, presentacion).subscribe(datos_Ot => {
          for (const itemOt of datos_Ot) {
            this.FormOrdenTrabajo.patchValue({
              OT_Observacion: itemOt.observacion,
              Margen: itemOt.ptMargen,
              Cantidad: presentacion == 'Kilo' ? itemOt.datoscantKg : itemOt.datoscantBolsa | 0,
              Precio: presentacion == 'Kilo' ? itemOt.datosValorKg : itemOt.datosvalorBolsa | 0,
            });

            itemOt.extrusion != null ? itemOt.extrusion.trim() == '1' ? this.extrusion = true : this.extrusion = false : 0;
            itemOt.impresion != null ? itemOt.impresion.trim() == '1' ? this.impresion = true : this.impresion = false : 0;
            itemOt.lamiando ? itemOt.lamiando.trim() == '1' ? this.rotograbado = true : this.rotograbado = false : 0;
            itemOt.laminado2 ? itemOt.laminado2.trim() == '1' ? this.laminado = true : this.laminado = false : 0;
            itemOt.pterminado ? itemOt.pterminado.trim() == '1' ? this.sellado = true : this.sellado = false : 0;
            itemOt.corte ? itemOt.corte.trim() == '1' ? this.corte = true : this.corte = false : 0;
            itemOt.cyrel ? itemOt.cyrel.trim() == '1' ? this.cyrel = true : this.cyrel = false : 0;

            this.FormOrdenTrabajoExtrusion.patchValue({
              Material_Extrusion: parseInt(itemOt.extMaterial.trim()),
              Formato_Extrusion: parseInt(itemOt.extFormato.trim()) == 5 ? 4 : parseInt(itemOt.extFormato.trim()),
              Pigmento_Extrusion: parseInt(itemOt.extPigmento.trim()),
              Ancho_Extrusion1: itemOt.extAcho1,
              Ancho_Extrusion2: itemOt.extAcho2,
              Ancho_Extrusion3: itemOt.extAcho3,
              Calibre_Extrusion: itemOt.extCalibre,
              UnidadMedida_Extrusion: itemOt.extUnidadesNom.trim(),
              Tratado_Extrusion: parseInt(itemOt.extTratado.trim()),
              Peso_Extrusion: itemOt.extPeso,
            });

            if (itemOt.impFlexoNom.trim() != 'FLEXOGRAFIA' && itemOt.impFlexoNom.trim() != 'ROTOGRABADO') impresion = 1;
            else if (itemOt.impFlexoNom.trim() == 'FLEXOGRAFIA') impresion = 2;
            else if (itemOt.impFlexoNom.trim() == 'ROTOGRABADO') impresion = 3;

            let tinta1: any = itemOt.impTinta1Nom.trim();
            let tinta2: any = itemOt.impTinta2Nom.trim();
            let tinta3: any = itemOt.impTinta3Nom.trim();
            let tinta4: any = itemOt.impTinta4Nom.trim();
            let tinta5: any = itemOt.impTinta5Nom.trim();
            let tinta6: any = itemOt.impTinta6Nom.trim();
            let tinta7: any = itemOt.impTinta7Nom.trim();
            let tinta8: any = itemOt.impTinta8Nom.trim();

            if (tinta1 == '') tinta1 = 'NO APLICA';
            if (tinta2 == '') tinta2 = 'NO APLICA';
            if (tinta3 == '') tinta3 = 'NO APLICA';
            if (tinta4 == '') tinta4 = 'NO APLICA';
            if (tinta5 == '') tinta5 = 'NO APLICA';
            if (tinta6 == '') tinta6 = 'NO APLICA';
            if (tinta7 == '') tinta7 = 'NO APLICA';
            if (tinta8 == '') tinta8 = 'NO APLICA';

            this.servicioTintas.srvObtenerListaConsultaImpresion(tinta1, tinta2, tinta3, tinta4, tinta5, tinta6, tinta7, tinta8).subscribe(datos_impresion => {
              for (let j = 0; j < datos_impresion.length; j++) {
                this.FormOrdenTrabajoImpresion.setValue({
                  Tipo_Impresion: impresion,
                  Rodillo_Impresion: itemOt.impRodillo,
                  Pista_Impresion: itemOt.impPista,
                  Tinta_Impresion1: datos_impresion[j].tinta_Nombre1,
                  Tinta_Impresion2: datos_impresion[j].tinta_Nombre2,
                  Tinta_Impresion3: datos_impresion[j].tinta_Nombre3,
                  Tinta_Impresion4: datos_impresion[j].tinta_Nombre4,
                  Tinta_Impresion5: datos_impresion[j].tinta_Nombre5,
                  Tinta_Impresion6: datos_impresion[j].tinta_Nombre6,
                  Tinta_Impresion7: datos_impresion[j].tinta_Nombre7,
                  Tinta_Impresion8: datos_impresion[j].tinta_Nombre8,
                });
              }
            });

            itemOt.lamCapa1 != null ? laminadoCapa1 = itemOt.lamCapa1.trim() : 0;
            itemOt.lamCapa2 != null ? laminadoCapa2 = itemOt.lamCapa2.trim() : 0;
            itemOt.lamCapa3 != null ? laminadoCapa3 = itemOt.lamCapa3.trim() : 0;

            if (laminadoCapa1 == '1') laminadoCapa1 = 1;
            if (laminadoCapa2 == '1') laminadoCapa2 = 1;
            if (laminadoCapa3 == '1') laminadoCapa3 = 1;

            this.FormOrdenTrabajoLaminado.patchValue({
              Capa_Laminado1: parseInt(laminadoCapa1),
              Calibre_Laminado1: itemOt.lamCalibre1,
              cantidad_Laminado1: itemOt.cant1,
              Capa_Laminado2: parseInt(laminadoCapa2),
              Calibre_Laminado2: itemOt.lamCalibre2,
              cantidad_Laminado2: itemOt.cant2,
              Capa_Laminado3: parseInt(laminadoCapa3),
              Calibre_Laminado3: itemOt.lamCalibre3,
              cantidad_Laminado3: itemOt.cant3,
            });

            this.FormOrdenTrabajoCorte.patchValue({
              Formato_Corte: this.ArrayProducto[0].Tipo,
              Ancho_Corte: this.ArrayProducto[0].Ancho,
              Largo_Corte: this.ArrayProducto[0].Largo,
              Fuelle_Corte: this.ArrayProducto[0].Fuelle,
              Margen_Corte: itemOt.ptMargen,
            });
            this.FormOrdenTrabajoSellado.patchValue({
              Formato_Sellado: this.ArrayProducto[0].Tipo,
              Ancho_Sellado: this.ArrayProducto[0].Ancho | 0,
              Largo_Sellado: this.ArrayProducto[0].Largo | 0,
              Fuelle_Sellado: this.ArrayProducto[0].Fuelle | 0,
              Margen_Sellado: itemOt.ptMargen | 0,
              PesoMillar: this.ArrayProducto[0].PesoMillar | 0,
              TipoSellado: this.ArrayProducto[0].TipoSellado,
              PrecioDia: itemOt.dia | 0,
              PrecioNoche: itemOt.noche | 0,
              CantidadPaquete: this.ArrayProducto[0].CantPaquete | 0,
              PesoPaquete: [null, ''].includes(itemOt.pesopaquete) ? 0 : parseFloat(itemOt.pesopaquete),
              CantidadBulto: this.ArrayProducto[0].CantBulto,
              PesoBulto: [null, ''].includes(itemOt.pesoBulto) ? 0 : parseFloat(itemOt.pesoBulto),
            });
            setTimeout(() => this.calcularDatosOt(), 1000);
            this.FormOrdenTrabajoMezclas.value.Nombre_Mezclas = itemOt.mezModoNom;
            this.cargarCombinacionMezclas();
          }
        }, () => {
          this.msj.mensajeAdvertencia(`¡Advertencia!`, `No se encuentra una Orden de Trabajo anterior para el producto ${this.producto} y presentación ${presentacion}`);
          this.cargando = false;
        });
        this.cargando = false;
      });
    }
  }

  // Funcion que va a calcular los costos de la orden de trabajo
  calcularDatosOt() {
    setTimeout(() => {
      if (this.ArrayProducto.length > 0) {
        this.cargando = true;
        this.ArrayProducto[0].Cant = this.FormOrdenTrabajo.value.Cantidad;
        this.ArrayProducto[0].PrecioUnd = this.FormOrdenTrabajo.value.Precio;
        let margen_Adicional = this.FormOrdenTrabajoSellado.value.Margen_Sellado | this.FormOrdenTrabajoCorte.value.Margen_Corte | 0;
        if (this.corte) {
          margen_Adicional = this.FormOrdenTrabajoCorte.value.Margen_Corte;
          this.ArrayProducto[0].Tipo = this.FormOrdenTrabajoCorte.value.Formato_Corte;
        }
        if (this.sellado) {
          margen_Adicional = this.FormOrdenTrabajoSellado.value.Margen_Sellado;
          this.ArrayProducto[0].Tipo = this.FormOrdenTrabajoSellado.value.Formato_Sellado;
        }
        this.FormOrdenTrabajo.patchValue({ Margen: margen_Adicional });
        if (this.FormOrdenTrabajoExtrusion.value.UnidadMedida_Extrusion == 'Cms' || this.FormOrdenTrabajoExtrusion.value.UnidadMedida_Extrusion == 'Plgs') {
          let ancho1: number = this.FormOrdenTrabajoExtrusion.value.Ancho_Extrusion1;
          let ancho2: number = this.FormOrdenTrabajoExtrusion.value.Ancho_Extrusion2;
          let ancho3: number = this.FormOrdenTrabajoExtrusion.value.Ancho_Extrusion3;
          let calibre: number = this.FormOrdenTrabajoExtrusion.value.Calibre_Extrusion;
          let material: number = this.FormOrdenTrabajoExtrusion.value.Material_Extrusion;
          let fact: number = 0;
          let largoUnd: number = 0;
          //Calcular Peso de Extrusion
          if (this.FormOrdenTrabajoExtrusion.value.UnidadMedida_Extrusion == 'Cms') {
            largoUnd = 100;
            material == 3 ? fact = 0.0048 : fact = 0.00468;
            this.FormOrdenTrabajoExtrusion.patchValue({ Peso_Extrusion: ((ancho1 + ancho2 + ancho3) * calibre * fact * largoUnd), });
          } else {
            largoUnd = 39.3701;
            material == 3 ? fact = 0.0317 : fact = 0.0302;
            this.FormOrdenTrabajoExtrusion.patchValue({ Peso_Extrusion: ((ancho1 + ancho2 + ancho3) * calibre * fact * largoUnd), });
          }
          //Calcular Peso Producto y Peso Millar
          for (let i = 0; i < this.ArrayProducto.length; i++) {
            if (this.ArrayProducto[i].Id == this.ArrayProducto[0].Id && this.ArrayProducto[i].UndCant == this.ArrayProducto[0].UndCant) {
              //Peso Producto
              if (this.FormOrdenTrabajoExtrusion.value.UnidadMedida_Extrusion == 'Cms') {
                material == 3 ? fact = 0.0048 : fact = 0.00468;
                this.ArrayProducto[i].Peso_Producto = (this.ArrayProducto[i].Ancho) * (this.ArrayProducto[i].Largo + this.ArrayProducto[i].Fuelle) * (this.ArrayProducto[i].Cal) * fact / 1000;
              } else {
                material == 3 ? fact = 0.0317 : fact = 0.0302;
                this.ArrayProducto[i].Peso_Producto = (this.ArrayProducto[i].Ancho) * (this.ArrayProducto[i].Largo + this.ArrayProducto[i].Fuelle) * (this.ArrayProducto[i].Cal) * fact / 1000;
              }
              this.pesoProducto = this.FormOrdenTrabajoExtrusion.value.Peso_Extrusion;
              //Peso Millar
              this.ArrayProducto[i].PesoMillar = this.pesoProducto * 1000;
              if (this.ArrayProducto[i].Tipo == 'Laminado' || this.ArrayProducto[i].Tipo == 'Hoja') this.ArrayProducto[i].PesoMillar = this.ArrayProducto[i].PesoMillar / 2;

              //Calcular datos de la ot
              if (this.ArrayProducto[0].UndCant == 'Kg') {
                this.cantidadProducto = this.ArrayProducto[0].Cant;
                this.margenKg = margen_Adicional * (this.ArrayProducto[0].Cant / 100);
                this.netoKg = this.ArrayProducto[0].Cant + ((this.ArrayProducto[0].Cant * margen_Adicional) / 100);
                this.valorKg = this.ArrayProducto[0].PrecioUnd;
                this.valorProducto = this.ArrayProducto[0].PrecioUnd;
                this.valorOt = this.ArrayProducto[0].Cant * this.valorProducto;
              } else if (this.ArrayProducto[0].UndCant == 'Paquete') {
                this.cantidadProducto = this.ArrayProducto[0].Cant;
                this.valorProducto = this.ArrayProducto[0].PrecioUnd;
                this.margenKg = margen_Adicional * (((this.ArrayProducto[0].Cant * this.ArrayProducto[0].CantPaquete * this.ArrayProducto[i].PesoMillar) / 1000) / 100);
                this.netoKg = ((1 + (margen_Adicional / 100)) * ((this.ArrayProducto[i].PesoMillar / 1000) * (this.ArrayProducto[0].Cant * this.ArrayProducto[0].CantPaquete)));
                this.valorOt = this.ArrayProducto[0].Cant * this.ArrayProducto[0].PrecioUnd;
                if (this.ArrayProducto[0].PesoMillar > 0 && this.ArrayProducto[0].CantPaquete > 0) this.pesoPaquete = this.ArrayProducto[i].PesoMillar * (this.ArrayProducto[0].CantPaquete / 1000);
                if (this.ArrayProducto[0].CantPaquete > 0) this.pesoBulto = this.pesoPaquete * this.ArrayProducto[0].CantBulto;
                if (this.ArrayProducto[0].CantPaquete == 0) this.valorKg = 0;
                else this.ArrayProducto[0].CantPaquete > 0 ? this.valorKg = this.ArrayProducto[0].PrecioUnd / this.pesoPaquete : this.valorKg = 0;
              } else if (this.ArrayProducto[0].UndCant == 'Und') {
                this.cantidadProducto = this.ArrayProducto[0].Cant;
                this.valorProducto = this.ArrayProducto[0].PrecioUnd;
                this.valorOt = this.cantidadProducto * this.valorProducto;
                this.margenKg = (margen_Adicional * ((this.ArrayProducto[0].Cant * this.ArrayProducto[i].PesoMillar) / 1000)) / 100;
                this.netoKg = ((1 + (margen_Adicional / 100)) * ((this.ArrayProducto[i].PesoMillar / 1000) * this.ArrayProducto[0].Cant));
                if (this.ArrayProducto[i].Peso_Producto > 0) {
                  if (this.valorOt == 0) this.valorOt = 1;
                  if ((this.ArrayProducto[0].Cant * this.ArrayProducto[i].PesoMillar) / 1000 == 0) this.valorKg = 0;
                  else this.valorKg = this.valorOt / ((this.ArrayProducto[0].Cant * this.ArrayProducto[i].PesoMillar) / 1000);
                } else this.valorOt = 0;
              } else if (this.ArrayProducto[0].UndCant == 'Rollo') {
              }
            }
          }
        } else this.msj.mensajeAdvertencia(`Advertencia`, `¡Debe elegir una unidad de medida para extrusión!`);
        this.cargando = false;
      }
    }, 500);
  }

  //Funcion que va cargar cada uno de los componentes de la mezcla
  cargarCombinacionMezclas() {
    let simboloPorcentaje: boolean = false;
    let data : string = this.FormOrdenTrabajoMezclas.value.Nombre_Mezclas;
    if (`${data}`.trim() == 'CUSTOM') data = 'NO APLICA MEZCLA';
    simboloPorcentaje = data.includes("%") ? true : false;
    if (simboloPorcentaje) data = data.replace('%', '%25')
    else data = data;

    this.mezclasService.getMezclaNombre(data).subscribe(datos_mezcla => {
      this.nroCapasOT = datos_mezcla.mezcla_NroCapas;
      setTimeout(() => {
        this.FormOrdenTrabajoMezclas.disable();
        this.FormOrdenTrabajoMezclas.get('Nombre_Mezclas').enable();
        this.FormOrdenTrabajoMezclas.get('Id_Mezcla').enable();
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
          MezclaPigmentoP2_Capa1: datos_mezcla.mezPigmto_Id1xCapa1,
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
    this.formCrearMezclas.get('mezclaId').enable();
    this.formCrearMezclas.get('Nombre_Mezclas').enable();
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

  // Función que va a crear la mezcla en la base de datos
  infoMezclaCrear() {
    let mezcla: any = this.formCrearMezclas.value.Nombre_Mezclas;
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
      /** Mezcla porcentaje capa 2 */
      Mezcla_PorcentajeCapa2: this.formCrearMezclas.value.Mezcla_PorcentajeCapa2 == undefined ? 0 : this.formCrearMezclas.value.Proc_Capa2,
      MezMaterial_Id1xCapa2: this.formCrearMezclas.value.MezMaterial_Id1xCapa2 == undefined ? 1 : this.formCrearMezclas.value.materialP1_Capa2,
      Mezcla_PorcentajeMaterial1_Capa2: this.formCrearMezclas.value.Mezcla_PorcentajeMaterial1_Capa2 == undefined ? 0 : this.formCrearMezclas.value.PorcentajeMaterialP1_Capa2,
      MezMaterial_Id2xCapa2: this.formCrearMezclas.value.MezMaterial_Id2xCapa2 == undefined ? 1 : this.formCrearMezclas.value.materialP2_Capa2,
      Mezcla_PorcentajeMaterial2_Capa2: this.formCrearMezclas.value.Mezcla_PorcentajeMaterial2_Capa2 == undefined ? 0 : this.formCrearMezclas.value.PorcentajeMaterialP2_Capa2,
      MezMaterial_Id3xCapa2: this.formCrearMezclas.value.MezMaterial_Id3xCapa2 == undefined ? 1 : this.formCrearMezclas.value.materialP3_Capa2,
      Mezcla_PorcentajeMaterial3_Capa2: this.formCrearMezclas.value.Mezcla_PorcentajeMaterial3_Capa2 == undefined ? 0 : this.formCrearMezclas.value.PorcentajeMaterialP3_Capa2,
      MezMaterial_Id4xCapa2: this.formCrearMezclas.value.MezMaterial_Id4xCapa2 == undefined ? 1 : this.formCrearMezclas.value.materialP4_Capa2,
      Mezcla_PorcentajeMaterial4_Capa2: this.formCrearMezclas.value.Mezcla_PorcentajeMaterial4_Capa2 == undefined ? 0 : this.formCrearMezclas.value.PorcentajeMaterialP4_Capa2,
      MezPigmto_Id1xCapa2: this.formCrearMezclas.value.MezPigmto_Id1xCapa2 == undefined ? 1 : this.formCrearMezclas.value.MezclaPigmentoP1_Capa2,
      Mezcla_PorcentajePigmto1_Capa2: this.formCrearMezclas.value.Mezcla_PorcentajePigmto1_Capa2 == undefined ? 0 : this.formCrearMezclas.value.PorcentajeMezclaPigmentoP1_Capa2,
      MezPigmto_Id2xCapa2: this.formCrearMezclas.value.MezPigmto_Id2xCapa2 == undefined ? 1 : this.formCrearMezclas.value.MezclaPigmentoP2_Capa2,
      Mezcla_PorcentajePigmto2_Capa2: this.formCrearMezclas.value.Mezcla_PorcentajePigmto2_Capa2 == undefined ? 0 : this.formCrearMezclas.value.PorcentajeMezclaPigmentoP2_Capa2,
      /** Mezcla porcentaje capa 3 */
      Mezcla_PorcentajeCapa3: this.formCrearMezclas.value.Mezcla_PorcentajeCapa3 == undefined ? 0 : this.formCrearMezclas.value.Proc_Capa3,
      MezMaterial_Id1xCapa3: this.formCrearMezclas.value.MezMaterial_Id1xCapa3 == undefined ? 1 : this.formCrearMezclas.value.materialP1_Capa3,
      Mezcla_PorcentajeMaterial1_Capa3: this.formCrearMezclas.value.Mezcla_PorcentajeMaterial1_Capa3 == undefined ? 0 : this.formCrearMezclas.value.PorcentajeMaterialP1_Capa3,
      MezMaterial_Id2xCapa3: this.formCrearMezclas.value.MezMaterial_Id2xCapa3 == undefined ? 1 : this.formCrearMezclas.value.materialP2_Capa3,
      Mezcla_PorcentajeMaterial2_Capa3: this.formCrearMezclas.value.Mezcla_PorcentajeMaterial2_Capa3 == undefined ? 0 : this.formCrearMezclas.value.PorcentajeMaterialP2_Capa3,
      MezMaterial_Id3xCapa3: this.formCrearMezclas.value.MezMaterial_Id3xCapa3 == undefined ? 1 : this.formCrearMezclas.value.materialP3_Capa3,
      Mezcla_PorcentajeMaterial3_Capa3: this.formCrearMezclas.value.Mezcla_PorcentajeMaterial3_Capa3 == undefined ? 0 : this.formCrearMezclas.value.PorcentajeMaterialP3_Capa3,
      MezMaterial_Id4xCapa3: this.formCrearMezclas.value.MezMaterial_Id4xCapa3 == undefined ? 1 : this.formCrearMezclas.value.materialP4_Capa3,
      Mezcla_PorcentajeMaterial4_Capa3: this.formCrearMezclas.value.Mezcla_PorcentajeMaterial4_Capa3 == undefined ? 0 : this.formCrearMezclas.value.PorcentajeMaterialP4_Capa3,
      MezPigmto_Id1xCapa3: this.formCrearMezclas.value.MezPigmto_Id1xCapa3 == undefined ? 1 : this.formCrearMezclas.value.MezclaPigmento1_Capa3,
      Mezcla_PorcentajePigmto1_Capa3: this.formCrearMezclas.value.Mezcla_PorcentajePigmto1_Capa3 == undefined ? 0 : this.formCrearMezclas.value.PorcentajeMezclaPigmentoP1_Capa3,
      MezPigmto_Id2xCapa3: this.formCrearMezclas.value.MezPigmto_Id2xCapa3 == undefined ? 1 : this.formCrearMezclas.value.MezclaPigmento2_Capa3,
      Mezcla_PorcentajePigmto2_Capa3: this.formCrearMezclas.value.Mezcla_PorcentajePigmto2_Capa3 == undefined ? 0 : this.formCrearMezclas.value.PorcentajeMezclaPigmentoP2_Capa3,
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

  /** Función para crear mater desde el modal de crear mezclas */
  crearMaterial() {
    let nombreMaterial: string = this.formCrearMateriales.value.matNombre;
    let descripcionMaterial: string = this.formCrearMateriales.value.matDescripcion;
    this.mezclaMaterialService.getMezclasMateriales(nombreMaterial.toUpperCase()).subscribe(dataMzMaterial => {
      if (dataMzMaterial.length == 0) {
        const material: modelMezMaterial = {
          MezMaterial_Nombre: nombreMaterial.toUpperCase(),
          MezMaterial_Descripcion: descripcionMaterial == null ? `Mezcla de Material ${nombreMaterial.toUpperCase()}` : descripcionMaterial.toUpperCase(),
        }
        this.mezclaMaterialService.srvGuardar(material).subscribe(() => {
          this.msj.mensajeConfirmacion('Registro creado con éxito!', '');
          setTimeout(() => {
            this.formCrearMateriales.reset();
            this.cargarMezclaMateria();
            this.cargarMezclaMateria2();
          }, 300);
        });
      } else this.msj.mensajeAdvertencia(`Advertencia`, `Ya existe una material de mezclas llamado ${nombreMaterial.toUpperCase()}`);
    });
  }

  /** Función para crear pigmentos desde el modal de crear mezclas */
  crearPigmento() {
    let nombrePigmento: string = this.formCrearPigmentos.value.pigNombre;
    let descripcionPigmento: string = this.formCrearPigmentos.value.pigDescripcion;
    this.mezclaPigmentosService.getMezclasPigmentos(nombrePigmento.toUpperCase()).subscribe(dataMzPigmento => {
      if (dataMzPigmento.length == 0) {
        const pigmento: modelMezPigmento = {
          MezPigmto_Nombre: nombrePigmento.toUpperCase(),
          MezPigmto_Descripcion: descripcionPigmento == null ? `Mezcla de Pigmento ${nombrePigmento.toUpperCase()}` : descripcionPigmento.toUpperCase(),
        }
        this.mezclaPigmentosService.srvGuardar(pigmento).subscribe(() => {
          this.msj.mensajeConfirmacion('Registro creado con éxito!', '');
          setTimeout(() => {
            this.formCrearPigmentos.reset();
            this.mezclasPigmentos();
            this.mezclasPigmentos2();
          }, 300);
        });
      } else this.msj.mensajeAdvertencia(`Advertencia`, `Ya existe un pigmento de mezclas llamado ${nombrePigmento.toUpperCase()}`)
    });
  }

  // Funcion que va a deshabilitar los campos del formulario de mezclas, luego habilitará solo los campos de la capa 1
  habilitarCapa1() {
    setTimeout(() => {
      this.formCrearMezclas.disable();
      this.formCrearMezclas.get('mezclaId').enable();
      this.formCrearMezclas.get('Nombre_Mezclas').enable();
      this.formCrearMezclas.get('Material_MatPrima').enable();
      this.formCrearMezclas.get('Proc_Capa1').enable();
      this.formCrearMezclas.get('Chechbox_Capa1').enable();
      this.formCrearMezclas.get('materialP1_Capa1').enable();
      this.formCrearMezclas.get('PorcentajeMaterialP1_Capa1').enable();
      this.formCrearMezclas.get('materialP2_Capa1').enable();
      this.formCrearMezclas.get('PorcentajeMaterialP2_Capa1').enable();
      this.formCrearMezclas.get('materialP3_Capa1').enable();
      this.formCrearMezclas.get('PorcentajeMaterialP3_Capa1').enable();
      this.formCrearMezclas.get('materialP4_Capa1').enable();
      this.formCrearMezclas.get('PorcentajeMaterialP4_Capa1').enable();
      this.formCrearMezclas.get('MezclaPigmentoP1_Capa1').enable();
      this.formCrearMezclas.get('PorcentajeMezclaPigmentoP1_Capa1').enable();
      this.formCrearMezclas.get('MezclaPigmentoP2_Capa1').enable();
      this.formCrearMezclas.get('PorcentajeMezclaPigmentoP2_Capa1').enable();
      this.cambiarNroCapas1();
    }, 500);
  }

  // Funcion que va a deshabilitar los campos del formulario de mezclas, luego habilitará solo los campos de la capa 1 y 2
  habilitarCapa2() {
    setTimeout(() => {
      this.formCrearMezclas.enable();
      this.formCrearMezclas.get('Proc_Capa3').disable();
      this.formCrearMezclas.get('materialP1_Capa3').disable();
      this.formCrearMezclas.get('PorcentajeMaterialP1_Capa3').disable();
      this.formCrearMezclas.get('materialP2_Capa3').disable();
      this.formCrearMezclas.get('PorcentajeMaterialP2_Capa3').disable();
      this.formCrearMezclas.get('materialP3_Capa3').disable();
      this.formCrearMezclas.get('PorcentajeMaterialP3_Capa3').disable();
      this.formCrearMezclas.get('materialP4_Capa3').disable();
      this.formCrearMezclas.get('PorcentajeMaterialP4_Capa3').disable();
      this.formCrearMezclas.get('MezclaPigmento1_Capa3').disable();
      this.formCrearMezclas.get('PorcentajeMezclaPigmentoP1_Capa3').disable();
      this.formCrearMezclas.get('MezclaPigmento2_Capa3').disable();
      this.formCrearMezclas.get('PorcentajeMezclaPigmentoP2_Capa3').disable();
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
    if (tinta != 'NO APLICA') {
      if (tintasSeleccionadas.includes(tinta)) {
        this.msj.mensajeAdvertencia(`Advertencia`, `La tinta ${tinta} ya se encuentra elegida, por favor seleccione otra!`);
        this.FormOrdenTrabajoImpresion.get('Tinta_Impresion' + posicion)?.setValue('NO APLICA');
      }
    }
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
    let lam1: any = laminados.splice(0, 1); let lam2: any = laminados.splice(2, 1); let lam3: any = laminados.splice(4, 1);
    let laminadosCapas: any[] = [...lam1, ...lam2, ...lam3];
    let indice: number = laminadosCapas.indexOf(campoLaminado);
    if (indice != -1) laminadosCapas.splice(indice, 1);
    if (campoLaminado != 'NO APLICA') {
      if (laminadosCapas.includes(campoLaminado)) {
        this.msj.mensajeAdvertencia(`Advertencia`, `El laminado ${this.laminado_capas[campoLaminado - 1].lamCapa_Nombre} ya se encuentra selecionado, por favor elija otro!`);
        this.FormOrdenTrabajoLaminado.get('Capa_Laminado' + posicion.toString())?.setValue(1);
      }
    }
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

  // Función que va a validar que la información este correcta
  validarDatos() {
    if (this.FormOrdenTrabajo.valid) {
      if (!this.extrusion) this.limpiarFormExtrusion();
      if (!this.impresion && !this.rotograbado) this.limpiarFormImpresion();
      if (!this.laminado) this.limpiarFormLaminado();
      if (!this.corte) this.limpiarFormCorte();
      if (!this.sellado) this.limpiarFormSellado();
      if (!this.FormOrdenTrabajoMezclas.valid) this.limpiarFormMezclas();

      setTimeout(() => {
        if (this.FormOrdenTrabajoExtrusion.valid) {
          if (this.FormOrdenTrabajoImpresion.valid) {
            if (this.FormOrdenTrabajoLaminado.valid) {
              if (this.FormOrdenTrabajoCorte.valid) {
                if (this.FormOrdenTrabajoSellado.valid) {
                  if (this.FormOrdenTrabajoMezclas.valid) this.guardarOt();
                  else this.msj.mensajeAdvertencia(`¡Advertencia!`, `¡El formulario de Mezclas tiene campos vacios!`);
                } else this.msj.mensajeAdvertencia(`¡Advertencia!`, `¡El formulario de Sellado tiene campos vacios!`);
              } else this.msj.mensajeAdvertencia(`¡Advertencia!`, `¡El formulario de Corte tiene campos vacios!`);
            } else this.msj.mensajeAdvertencia(`¡Advertencia!`, `¡EL formulario de Laminado tiene campos vacios!`);
          } else this.msj.mensajeAdvertencia(`¡Advertencia!`, `¡El formulario de Impresion tiene campos vacios!`);
        } else this.msj.mensajeAdvertencia(`¡Advertencia!`, `¡EL formulario de Extrusion tiene campos vacios!`);
      }, 700);
    } else this.msj.mensajeAdvertencia(`¡Advertencia!`, `¡Hay campos vacios en el formulario principal!`);
  }

  //Funcion que va a guardar la información de la orden de trabajo
  guardarOt() {
    this.calcularDatosOt();
    this.cargando = true;
    let errorExt: boolean = false, errorImp: boolean = false, errorLam: boolean = false, errorSelCor: boolean = false;
    let infoOT: modelOrden_Trabajo = {
      SedeCli_Id: parseInt(`${this.FormOrdenTrabajo.value.Id_Cliente}1`),
      Prod_Id: this.producto,
      UndMed_Id: this.presentacionProducto,
      Ot_FechaCreacion: this.today,
      Ot_Hora: moment().format('H:mm:ss'),
      Estado_Id: 15,
      Usua_Id: this.storage_Id,
      PedExt_Id: 497,
      Ot_Observacion: this.FormOrdenTrabajo.value.OT_Observacion == null ? '' : (this.FormOrdenTrabajo.value.OT_Observacion).trim().toUpperCase(),
      Ot_Cyrel: this.cyrel,
      Ot_Corte: this.corte,
      Mezcla_Id: this.FormOrdenTrabajoMezclas.value.Id_Mezcla,
      Extrusion: this.extrusion,
      Impresion: this.impresion,
      Rotograbado: this.rotograbado,
      Laminado: this.laminado,
      Sellado: this.sellado,
      Ot_MargenAdicional: this.FormOrdenTrabajo.value.Margen,
      Ot_CantidadPedida: this.cantidadProducto,
      Ot_ValorUnidad: this.valorProducto,
      Ot_PesoNetoKg: this.netoKg,
      Ot_ValorKg: this.valorKg,
      Ot_ValorOT: this.valorOt,
      Id_Vendedor: parseInt(this.FormOrdenTrabajo.value.Id_Vendedor),
    }
    this.ordenTrabajoService.srvGuardar(infoOT).subscribe(datos_ot => {
      errorExt = this.guardarOt_Extrusion(datos_ot.ot_Id);
      errorImp = this.guardarOt_Impresion(datos_ot.ot_Id);
      errorLam = this.guardarOt_Laminado(datos_ot.ot_Id);
      errorSelCor = this.guardarOt_Sellado_Corte(datos_ot.ot_Id);
      setTimeout(() => {
        if (!errorExt && !errorImp && !errorLam && !errorSelCor) {
          this.msj.mensajeConfirmacion('¡Orden de Trabajo Creada!', `Se ha creado la de trabajo N°${datos_ot.ot_Id}`);
          this.cambiarEstadoCliente(this.FormOrdenTrabajo.value.Id_Cliente);
          this.cambiarEstadoProducto(this.producto);
          this.pdfOrdenTrabajo(datos_ot.ot_Id);
          this.limpiarCampos();
        }
      }, 2000);
    }, error => {
      this.msj.mensajeError(`¡No fue posible crear la Orden de Trabajo!`, error.error);
      this.cargando = false;
    });
  }

  //Funcion que va a guardar la informacion de extrusion de la orden de trabajo
  guardarOt_Extrusion(ordenTrabajo: number): boolean {
    let infoOTExt: any = {
      Ot_Id: ordenTrabajo,
      Material_Id: this.FormOrdenTrabajoExtrusion.value.Material_Extrusion,
      Formato_Id: this.FormOrdenTrabajoExtrusion.value.Formato_Extrusion,
      Pigmt_Id: this.FormOrdenTrabajoExtrusion.value.Pigmento_Extrusion,
      Extrusion_Calibre: this.FormOrdenTrabajoExtrusion.value.Calibre_Extrusion,
      Extrusion_Ancho1: this.FormOrdenTrabajoExtrusion.value.Ancho_Extrusion1,
      Extrusion_Ancho2: this.FormOrdenTrabajoExtrusion.value.Ancho_Extrusion2,
      Extrusion_Ancho3: this.FormOrdenTrabajoExtrusion.value.Ancho_Extrusion3,
      UndMed_Id: this.FormOrdenTrabajoExtrusion.value.UnidadMedida_Extrusion,
      Tratado_Id: this.FormOrdenTrabajoExtrusion.value.Tratado_Extrusion,
      Extrusion_Peso: this.FormOrdenTrabajoExtrusion.value.Peso_Extrusion,
    }
    this.otExtrusionServie.srvGuardar(infoOTExt).subscribe(null, error => {
      this.msj.mensajeError(`¡No se guardó información de la OT en el área de 'Extrusión'!`, error.error);
      return true;
    });
    return false;
  }

  //Funcion que va a guardar la informacion de impresion de la orden de trabajo
  guardarOt_Impresion(ordenTrabajo: number): boolean {
    let rodilloImpresion: any = this.FormOrdenTrabajoImpresion.value.Rodillo_Impresion;
    let pistaImpresion: any = this.FormOrdenTrabajoImpresion.value.Pista_Impresion;
    let tinta1Impresion: any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion1;
    let tinta2Impresion: any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion2;
    let tinta3Impresion: any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion3;
    let tinta4Impresion: any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion4;
    let tinta5Impresion: any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion5;
    let tinta6Impresion: any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion6;
    let tinta7Impresion: any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion7;
    let tinta8Impresion: any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion8;
    this.servicioTintas.srvObtenerListaConsultaImpresion(tinta1Impresion, tinta2Impresion, tinta3Impresion, tinta4Impresion, tinta5Impresion, tinta6Impresion, tinta7Impresion, tinta8Impresion).subscribe(datos_impresion => {
      for (let j = 0; j < datos_impresion.length; j++) {
        let infoOTImp: any = {
          Ot_Id: ordenTrabajo,
          TpImpresion_Id: this.FormOrdenTrabajoImpresion.value.Tipo_Impresion,
          Rodillo_Id: rodilloImpresion,
          Pista_Id: pistaImpresion,
          Tinta1_Id: datos_impresion[j].tinta_Id1,
          Tinta2_Id: datos_impresion[j].tinta_Id2,
          Tinta3_Id: datos_impresion[j].tinta_Id3,
          Tinta4_Id: datos_impresion[j].tinta_Id4,
          Tinta5_Id: datos_impresion[j].tinta_Id5,
          Tinta6_Id: datos_impresion[j].tinta_Id6,
          Tinta7_Id: datos_impresion[j].tinta_Id7,
          Tinta8_Id: datos_impresion[j].tinta_Id8,
        }
        this.otImpresionService.srvGuardar(infoOTImp).subscribe(null, error => {
          this.msj.mensajeError(`¡No se guardó información de la OT en el área de 'Impresión' y 'Rotograbado'!`, error.error);
          return true;
        });
      }
    });
    return false;
  }

  //Funcion que va a guardar la informacion de laminado de la orden de trabajo
  guardarOt_Laminado(ordenTrabajo: number): boolean {
    let infoOTLam: any = {
      OT_Id: ordenTrabajo,
      Capa_Id1: this.FormOrdenTrabajoLaminado.value.Capa_Laminado1,
      Capa_Id2: this.FormOrdenTrabajoLaminado.value.Capa_Laminado2,
      Capa_Id3: this.FormOrdenTrabajoLaminado.value.Capa_Laminado3,
      LamCapa_Calibre1: this.FormOrdenTrabajoLaminado.value.Calibre_Laminado1,
      LamCapa_Calibre2: this.FormOrdenTrabajoLaminado.value.Calibre_Laminado2,
      LamCapa_Calibre3: this.FormOrdenTrabajoLaminado.value.Calibre_Laminado3,
      LamCapa_Cantidad1: this.FormOrdenTrabajoLaminado.value.cantidad_Laminado1,
      LamCapa_Cantidad2: this.FormOrdenTrabajoLaminado.value.cantidad_Laminado2,
      LamCapa_Cantidad3: this.FormOrdenTrabajoLaminado.value.cantidad_Laminado3,
    }
    this.otLaminadoService.srvGuardar(infoOTLam).subscribe(null, error => {
      this.msj.mensajeError(`¡No se guardó información de la OT en el área de 'Laminado'!`, error.error);
      return true;
    });
    return false;
  }

  // Funcion que va a guardar la informacion de la orden de trabajo para sellado y/o corte
  guardarOt_Sellado_Corte(ordenTrabajo: number): boolean {
    let tipoSellado: number = this.FormOrdenTrabajoSellado.value.TipoSellado;
    let formato: number = this.sellado ? this.FormOrdenTrabajoSellado.value.Formato_Sellado : this.FormOrdenTrabajoCorte.value.Formato_Corte;
    this.otSelladoCorteService.getTipoSellado_Formato(tipoSellado, formato).subscribe(datos => {
      let info: any = {
        Ot_Id: ordenTrabajo,
        Corte: this.corte,
        Sellado: this.sellado,
        Formato_Id: datos.tpProd_Id,
        SelladoCorte_Ancho: this.sellado ? this.FormOrdenTrabajoSellado.value.Ancho_Sellado : this.FormOrdenTrabajoCorte.value.Ancho_Corte,
        SelladoCorte_Largo: this.sellado ? this.FormOrdenTrabajoSellado.value.Largo_Sellado : this.FormOrdenTrabajoCorte.value.Largo_Corte,
        SelladoCorte_Fuelle: this.sellado ? this.FormOrdenTrabajoSellado.value.Fuelle_Sellado : this.FormOrdenTrabajoCorte.value.Fuelle_Corte,
        SelladoCorte_PesoMillar: this.FormOrdenTrabajoSellado.value.PesoMillar,
        TpSellado_Id: datos.tpSellado_Id,
        SelladoCorte_PrecioSelladoDia: this.FormOrdenTrabajoSellado.value.PrecioDia,
        SelladoCorte_PrecioSelladoNoche: this.FormOrdenTrabajoSellado.value.PrecioNoche,
        SelladoCorte_CantBolsasPaquete: this.FormOrdenTrabajoSellado.value.CantidadPaquete,
        SelladoCorte_CantBolsasBulto: this.FormOrdenTrabajoSellado.value.CantidadBulto,
        SelladoCorte_PesoPaquete: this.FormOrdenTrabajoSellado.value.PesoPaquete,
        SelladoCorte_PesoBulto: this.FormOrdenTrabajoSellado.value.PesoBulto,
        SelladoCorte_PesoProducto: this.pesoProducto,
      }
      this.otSelladoCorteService.post(info).subscribe(null, error => {
        this.msj.mensajeError(`¡No se guardó información de la OT en el área de 'Sellado' o 'Corte'!`, error.error);
        return true;
      });
    }, error => {
      this.msj.mensajeError(`¡No se pudo obtener informacón del Formato y Tipo de Sellado Selecionados para el área de Sellado!`, error.error);
      return true;
    });
    return false;
  }

  //Funcion que va a cambiar el estado de un producto a "Activo"
  cambiarEstadoProducto(producto: number) {
    this.productoService.srvObtenerListaPorIdProducto(producto).subscribe(datos => {
      for (let i = 0; i < datos.length; i++) {
        let info: any = {
          Prod_Id: producto,
          Prod_Nombre: datos[i].prod_Nombre,
          Prod_Descripcion: datos[i].prod_Descripcion,
          TpProd_Id: datos[i].tpProd_Id,
          Prod_Peso: datos[i].prod_Peso,
          Prod_Peso_Millar: datos[i].prod_Peso_Millar,
          UndMedPeso: datos[i].undMedPeso,
          Prod_Fuelle: datos[i].prod_Fuelle,
          Prod_Ancho: datos[i].prod_Ancho,
          Prod_Calibre: datos[i].prod_Calibre,
          UndMedACF: datos[i].undMedACF,
          Estado_Id: 10,
          Prod_Largo: datos[i].prod_Largo,
          Pigmt_Id: datos[i].pigmt_Id,
          Material_Id: datos[i].material_Id,
          Prod_CantBolsasBulto: this.FormOrdenTrabajoSellado.value.CantidadBulto,
          Prod_CantBolsasPaquete: this.FormOrdenTrabajoSellado.value.CantidadPaquete,
          TpSellado_Id: datos[i].tpSellado_Id,
          Prod_Fecha: datos[i].prod_Fecha,
          Prod_Hora: datos[i].prod_Hora,
          Prod_PrecioDia_Sellado: this.FormOrdenTrabajoSellado.value.PrecioDia,
          Prod_PrecioNoche_Sellado: this.FormOrdenTrabajoSellado.value.PrecioNoche,
          Prod_Peso_Paquete: this.FormOrdenTrabajoSellado.value.PesoPaquete,
          Prod_Peso_Bulto: this.FormOrdenTrabajoSellado.value.PesoBulto,
        }
        this.productoService.PutEstadoProducto(producto, info).subscribe(null, error => this.msj.mensajeError(`¡No fue posible actualizar el estado del producto ${producto}!`, error.error));
      }
    }, error => this.msj.mensajeError(`¡El producto ${producto} no se ha encontrado!`, error.error));
  }

  // Funcion que va a cambiar el estado de un cliente a "Activo". El numero '1' corresponde a "Activo"
  cambiarEstadoCliente(id: number) {
    this.clienteServise.PutEstadoCliente(id, 1).subscribe(null, err => this.msj.mensajeError(`No fue posible actualizar el estado del cliente con el Id ${id}`, err.error));
  }

  // Funcion que va a consultar la informacion de la una orden de trabajo
  ConsultarOrdenTrabajo() {
    let numeroOT: number = this.FormOrdenTrabajo.value.OT_Id;
    this.limpiarCampos();
    this.edicionOrdenTrabajo = true;

    this.ordenTrabajoService.GetOrdenTrabajo(numeroOT).subscribe(datos_orden => {
      for (let i = 0; i < datos_orden.length; i++) {

        this.cyrel = datos_orden[i].cyrel;
        this.extrusion = datos_orden[i].extrusion;
        this.impresion = datos_orden[i].impresion;
        this.rotograbado = datos_orden[i].rotograbado;
        this.laminado = datos_orden[i].laminado;
        this.corte = datos_orden[i].corte;
        this.sellado = datos_orden[i].sellado;
        this.producto = datos_orden[i].id_Producto;
        this.presentacionProducto = datos_orden[i].id_Presentacion;

        this.FormOrdenTrabajo.patchValue({
          OT_Id: datos_orden[i].numero_Orden,
          Id_Vendedor: datos_orden[i].id_Vendedor,
          Nombre_Vendedor: datos_orden[i].vendedor,
          OT_FechaCreacion: datos_orden[i].fecha_Creacion.replace('T00:00:00', ''),
          OT_FechaEntrega: datos_orden[i].fecha_Entrega.replace('T00:00:00', ''),
          Id_Cliente: datos_orden[i].id_Cliente,
          Nombre_Cliente: datos_orden[i].cliente,
          Id_Producto: datos_orden[i].id_Producto,
          Nombre_Producto: datos_orden[i].producto,
          Cantidad: datos_orden[i].cantidad_Pedida,
          Presentacion: datos_orden[i].id_Presentacion,
          OT_Estado: datos_orden[i].estado_Orden,
          OT_Observacion: datos_orden[i].observacion,
          Margen: datos_orden[i].margen,
          Precio: this.presentacionProducto == 'Kg' ? datos_orden[i].valorKg : datos_orden[i].valorUnidad,
        });
        this.buscarInformacionProducto();

        this.FormOrdenTrabajoExtrusion.patchValue({
          Material_Extrusion: datos_orden[i].id_Material,
          Formato_Extrusion: datos_orden[i].id_Formato_Extrusion,
          Pigmento_Extrusion: datos_orden[i].id_Pigmento_Extrusion,
          Ancho_Extrusion1: datos_orden[i].ancho1_Extrusion,
          Ancho_Extrusion2: datos_orden[i].ancho2_Extrusion,
          Ancho_Extrusion3: datos_orden[i].ancho3_Extrusion,
          Calibre_Extrusion: datos_orden[i].calibre_Extrusion,
          UnidadMedida_Extrusion: datos_orden[i].und_Extrusion,
          Tratado_Extrusion: datos_orden[i].id_Tratado,
        });
        this.FormOrdenTrabajoImpresion.patchValue({
          Tipo_Impresion: datos_orden[i].id_Tipo_Imptesion,
          Rodillo_Impresion: datos_orden[i].rodillo,
          Pista_Impresion: datos_orden[i].pista,
          Tinta_Impresion1: datos_orden[i].tinta1,
          Tinta_Impresion2: datos_orden[i].tinta2,
          Tinta_Impresion3: datos_orden[i].tinta3,
          Tinta_Impresion4: datos_orden[i].tinta4,
          Tinta_Impresion5: datos_orden[i].tinta5,
          Tinta_Impresion6: datos_orden[i].tinta6,
          Tinta_Impresion7: datos_orden[i].tinta7,
          Tinta_Impresion8: datos_orden[i].tinta8,
        });
        this.FormOrdenTrabajoLaminado.patchValue({
          Capa_Laminado1: datos_orden[i].id_Capa1,
          Calibre_Laminado1: datos_orden[i].calibre_Laminado_Capa1,
          cantidad_Laminado1: datos_orden[i].cantidad_Laminado_Capa1,
          Capa_Laminado2: datos_orden[i].id_Capa2,
          Calibre_Laminado2: datos_orden[i].calibre_Laminado_Capa2,
          cantidad_Laminado2: datos_orden[i].cantidad_Laminado_Capa2,
          Capa_Laminado3: datos_orden[i].id_Capa3,
          Calibre_Laminado3: datos_orden[i].calibre_Laminado_Capa3,
          cantidad_Laminado3: datos_orden[i].cantidad_Laminado_Capa3,
        });
        this.FormOrdenTrabajoCorte.patchValue({
          Formato_Corte: datos_orden[i].formato_Producto,
          Ancho_Corte: datos_orden[i].selladoCorte_Ancho,
          Largo_Corte: datos_orden[i].selladoCorte_Largo,
          Fuelle_Corte: datos_orden[i].selladoCorte_Fuelle,
          Margen_Corte: datos_orden[i].margen,
        });
        this.FormOrdenTrabajoSellado.patchValue({
          Formato_Sellado: datos_orden[i].formato_Producto,
          Ancho_Sellado: datos_orden[i].selladoCorte_Ancho,
          Largo_Sellado: datos_orden[i].selladoCorte_Largo,
          Fuelle_Sellado: datos_orden[i].selladoCorte_Fuelle,
          Margen_Sellado: datos_orden[i].margen,
          PesoMillar: datos_orden[i].selladoCorte_PesoMillar,
          TipoSellado: datos_orden[i].tpSellados_Nombre,
          CantidadPaquete: datos_orden[i].selladoCorte_CantBolsasPaquete,
          CantidadBulto: datos_orden[i].selladoCorte_CantBolsasBulto,
          PrecioDia: datos_orden[i].selladoCorte_PrecioSelladoDia,
          PrecioNoche: datos_orden[i].selladoCorte_PrecioSelladoNoche,
          PesoPaquete: datos_orden[i].selladoCorte_PesoBulto,
          PesoBulto: datos_orden[i].selladoCorte_PesoPaquete,
        });
        this.FormOrdenTrabajoMezclas.patchValue({ Nombre_Mezclas: datos_orden[i].mezcla_Nombre, });
        this.cargarCombinacionMezclas();
        setTimeout(() => this.calcularDatosOt(), 1000);
      }
    }, error => this.msj.mensajeError(error.error));
  }

  // Funcion que va a validar que si se desee actualizar la orden de trabajo
  validarActualizacionOT() {
    if (this.FormOrdenTrabajo.valid) {
      let ot: number = this.FormOrdenTrabajo.value.OT_Id;
      if (!this.extrusion) this.limpiarFormExtrusion();
      if (!this.impresion && !this.rotograbado) this.limpiarFormImpresion();
      if (!this.laminado) this.limpiarFormLaminado();
      if (!this.corte) this.limpiarFormCorte();
      if (!this.sellado) this.limpiarFormSellado();
      if (!this.FormOrdenTrabajoMezclas.valid) this.limpiarFormMezclas();

      setTimeout(() => {
        if (this.FormOrdenTrabajoExtrusion.valid) {
          if (this.FormOrdenTrabajoImpresion.valid) {
            if (this.FormOrdenTrabajoLaminado.valid) {
              if (this.FormOrdenTrabajoCorte.valid) {
                if (this.FormOrdenTrabajoSellado.valid) {
                  if (this.FormOrdenTrabajoMezclas.valid) {
                    this.messageService.add({
                      severity: 'warn',
                      key: 'editarOrden',
                      summary: 'Confirmación de Edición de OT',
                      detail:
                        `<h6><b>Esta seguro de editar la información de la Orden de Trabajo N° ${ot}?</b></h6><br>` +
                        `<spam><b>¡Al hacer esto no se recuperarán los datos iniciales!</b><br></spam>`,
                      sticky: true
                    });
                  } else this.msj.mensajeAdvertencia(`¡Advertencia!`, `¡El formulario de Mezclas tiene campos vacios!`);
                } else this.msj.mensajeAdvertencia(`¡Advertencia!`, `¡El formulario de Sellado tiene campos vacios!`);
              } else this.msj.mensajeAdvertencia(`¡Advertencia!`, `¡El formulario de Corte tiene campos vacios!`);
            } else this.msj.mensajeAdvertencia(`¡Advertencia!`, `¡EL formulario de Laminado tiene campos vacios!`);
          } else this.msj.mensajeAdvertencia(`¡Advertencia!`, `¡El formulario de Impresion tiene campos vacios!`);
        } else this.msj.mensajeAdvertencia(`¡Advertencia!`, `¡EL formulario de Extrusion tiene campos vacios!`);
      }, 700);
    } else this.msj.mensajeAdvertencia(`¡Advertencia!`, `¡Hay campos del formulario vacios!`);
  }

  // Funcion que va actualizar con nueva información la orden de trabajo
  editarOrdenTrabajo() {
    if (this.edicionOrdenTrabajo) {
      this.calcularDatosOt();
      this.cargando = true;
      let ot: number = this.FormOrdenTrabajo.value.OT_Id;
      this.ordenTrabajoService.srvObtenerListaPorId(ot).subscribe(datos_Orden => {
        let info: modelOrden_Trabajo = {
          Ot_Id: datos_Orden.ot_Id,
          SedeCli_Id: parseInt(`${this.FormOrdenTrabajo.value.Id_Cliente}1`),
          Prod_Id: this.producto,
          UndMed_Id: this.presentacionProducto,
          Ot_FechaCreacion: datos_Orden.ot_FechaCreacion,
          Ot_Hora: datos_Orden.ot_Hora,
          Estado_Id: this.FormOrdenTrabajo.value.OT_Estado,
          Usua_Id: this.storage_Id,
          PedExt_Id: 497,
          Ot_Observacion: this.FormOrdenTrabajo.value.OT_Observacion == null ? '' : (this.FormOrdenTrabajo.value.OT_Observacion).trim().toUpperCase(),
          Ot_Cyrel: this.cyrel,
          Ot_Corte: this.corte,
          Mezcla_Id: this.FormOrdenTrabajoMezclas.value.Id_Mezcla,
          Extrusion: this.extrusion,
          Impresion: this.impresion,
          Rotograbado: this.rotograbado,
          Laminado: this.laminado,
          Sellado: this.sellado,
          Ot_MargenAdicional: this.FormOrdenTrabajo.value.Margen,
          Ot_CantidadPedida: this.cantidadProducto,
          Ot_ValorUnidad: this.valorProducto,
          Ot_PesoNetoKg: this.netoKg,
          Ot_ValorKg: this.valorKg,
          Ot_ValorOT: this.valorOt,
          Id_Vendedor: parseInt(this.FormOrdenTrabajo.value.Id_Vendedor),
        }
        this.ordenTrabajoService.srvActualizar(ot, info).subscribe(() => {
          let errorExt: boolean, errorImp: boolean, errorLam: boolean, errorSelCor: boolean;
          errorExt = this.actualizarOt_Extrusion(ot);
          errorImp = this.actualizarOT_Impresion(ot);
          errorLam = this.actualizarOT_Laminado(ot);
          errorSelCor = this.actualizarOT_Sellado_Corte(ot);
          setTimeout(() => {
            if (!errorExt && !errorImp && !errorLam && !errorSelCor) {
              this.msj.mensajeConfirmacion('¡Actualizado Correctamente!', `Se ha realizado la actualización de la Orden de Trabajo N° ${ot}`);
              this.cambiarEstadoCliente(this.FormOrdenTrabajo.value.Id_Cliente);
              this.cambiarEstadoProducto(this.producto);
              this.pdfOrdenTrabajo(ot);
              this.limpiarCampos();
            }
          }, 1500);
        }, () => this.msj.mensajeError(`¡Error!`, `¡No fue posible actualizar la Orden de Trabajo N° ${ot}!`));
      }, () => this.msj.mensajeError(`¡Error!`, `No se pudo obtener información de la Orden de Trabajo N° ${ot}`));
    }
  }

  // Funcion que va a actualizar la tabla "OT_Extrusion"
  actualizarOt_Extrusion(ot: number): any {
    this.otExtrusionServie.GetOT_Extrusion(ot).subscribe(datos_extrusion => {
      for (let i = 0; i < datos_extrusion.length; i++) {
        let infoOTExt: any = {
          Extrusion_Id: datos_extrusion[i].extrusion_Id,
          Ot_Id: ot,
          Material_Id: this.FormOrdenTrabajoExtrusion.value.Material_Extrusion,
          Formato_Id: this.FormOrdenTrabajoExtrusion.value.Formato_Extrusion,
          Pigmt_Id: this.FormOrdenTrabajoExtrusion.value.Pigmento_Extrusion,
          Extrusion_Calibre: this.FormOrdenTrabajoExtrusion.value.Calibre_Extrusion,
          Extrusion_Ancho1: this.FormOrdenTrabajoExtrusion.value.Ancho_Extrusion1,
          Extrusion_Ancho2: this.FormOrdenTrabajoExtrusion.value.Ancho_Extrusion2,
          Extrusion_Ancho3: this.FormOrdenTrabajoExtrusion.value.Ancho_Extrusion3,
          UndMed_Id: this.FormOrdenTrabajoExtrusion.value.UnidadMedida_Extrusion,
          Tratado_Id: this.FormOrdenTrabajoExtrusion.value.Tratado_Extrusion,
          Extrusion_Peso: this.FormOrdenTrabajoExtrusion.value.Peso_Extrusion,
        }
        this.otExtrusionServie.srvActualizar(datos_extrusion[i].extrusion_Id, infoOTExt).subscribe(null, error => {
          this.msj.mensajeError(`¡No se actualizó la información de la OT en el área de 'Extrusión'!`, error.error);
          return true;
        });
      }
    }, () => {
      this.msj.mensajeError(`¡No se encontró información de la OT N° ${ot}!`, '');
      return true;
    });
    return false;
  }

  // Funcion que va a actualizar la tabla "OT_Impresion"
  actualizarOT_Impresion(ot: number): any {
    this.otImpresionService.GetOT_Impresion(ot).subscribe(datos_Impresion => {
      for (let i = 0; i < datos_Impresion.length; i++) {
        let rodilloImpresion: any = this.FormOrdenTrabajoImpresion.value.Rodillo_Impresion;
        let pistaImpresion: any = this.FormOrdenTrabajoImpresion.value.Pista_Impresion;
        let tinta1Impresion: any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion1;
        let tinta2Impresion: any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion2;
        let tinta3Impresion: any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion3;
        let tinta4Impresion: any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion4;
        let tinta5Impresion: any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion5;
        let tinta6Impresion: any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion6;
        let tinta7Impresion: any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion7;
        let tinta8Impresion: any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion8;
        this.servicioTintas.srvObtenerListaConsultaImpresion(tinta1Impresion, tinta2Impresion, tinta3Impresion, tinta4Impresion, tinta5Impresion, tinta6Impresion, tinta7Impresion, tinta8Impresion).subscribe(datos_impresion => {
          for (let j = 0; j < datos_impresion.length; j++) {
            let infoOTImp: any = {
              Impresion_Id: datos_Impresion[i].impresion_Id,
              Ot_Id: ot,
              TpImpresion_Id: this.FormOrdenTrabajoImpresion.value.Tipo_Impresion,
              Rodillo_Id: rodilloImpresion,
              Pista_Id: pistaImpresion,
              Tinta1_Id: datos_impresion[j].tinta_Id1,
              Tinta2_Id: datos_impresion[j].tinta_Id2,
              Tinta3_Id: datos_impresion[j].tinta_Id3,
              Tinta4_Id: datos_impresion[j].tinta_Id4,
              Tinta5_Id: datos_impresion[j].tinta_Id5,
              Tinta6_Id: datos_impresion[j].tinta_Id6,
              Tinta7_Id: datos_impresion[j].tinta_Id7,
              Tinta8_Id: datos_impresion[j].tinta_Id8,
            }
            this.otImpresionService.srvActualizar(datos_Impresion[i].impresion_Id, infoOTImp).subscribe(null, error => {
              this.msj.mensajeError(`¡No se actualizó información de la OT en el área de 'Impresión' y 'Rotograbado'!`, error.error);
              return true;
            });
          }
        }, () => {
          this.msj.mensajeError(`¡Error!`, `¡No se encontrarón las tintas seleccionadas en el proceso de impresión!`);
          return true;
        });
      }
    }, () => {
      this.msj.mensajeError(`¡Error!`, `¡No se encontró información de la OT N° ${ot}!`);
      return true;
    });
    return false;
  }

  // Funcion que va a a ctualizar la tabla #OT_Laminado
  actualizarOT_Laminado(ot: number) {
    this.otLaminadoService.GetOT_Laminado(ot).subscribe(datos_laminado => {
      for (let i = 0; i < datos_laminado.length; i++) {
        let infoOTLam: any = {
          LamCapa_Id: datos_laminado[i].lamCapa_Id,
          OT_Id: ot,
          Capa_Id1: this.FormOrdenTrabajoLaminado.value.Capa_Laminado1,
          Capa_Id2: this.FormOrdenTrabajoLaminado.value.Capa_Laminado2,
          Capa_Id3: this.FormOrdenTrabajoLaminado.value.Capa_Laminado3,
          LamCapa_Calibre1: this.FormOrdenTrabajoLaminado.value.Calibre_Laminado1,
          LamCapa_Calibre2: this.FormOrdenTrabajoLaminado.value.Calibre_Laminado2,
          LamCapa_Calibre3: this.FormOrdenTrabajoLaminado.value.Calibre_Laminado3,
          LamCapa_Cantidad1: this.FormOrdenTrabajoLaminado.value.cantidad_Laminado1,
          LamCapa_Cantidad2: this.FormOrdenTrabajoLaminado.value.cantidad_Laminado2,
          LamCapa_Cantidad3: this.FormOrdenTrabajoLaminado.value.cantidad_Laminado3,
        }
        this.otLaminadoService.srvActualizar(datos_laminado[i].lamCapa_Id, infoOTLam).subscribe(null, error => {
          this.msj.mensajeError(`¡No se actualizó la información de la OT en el área de 'Laminado'!`, error.error);
          return true;
        });
      }
    }, () => {
      this.msj.mensajeError(`¡No se encontró información de la OT N° ${ot}!`, '');
      return true;
    });
    return false;
  }

  // Funcion que va a a ctualizar la tabla "OT_Sellado_Corte"
  actualizarOT_Sellado_Corte(ot: number) {
    this.otSelladoCorteService.GetOT_SelladoCorte(ot).subscribe(datos_ot => {
      for (let i = 0; i < datos_ot.length; i++) {
        let tipoSellado: any = this.FormOrdenTrabajoSellado.value.TipoSellado;
        let formato: any = this.sellado ? this.FormOrdenTrabajoSellado.value.Formato_Sellado : this.FormOrdenTrabajoCorte.value.Formato_Corte;
        this.otSelladoCorteService.getTipoSellado_Formato(tipoSellado, formato).subscribe(datos => {
          let info: any = {
            SelladoCorte_Id: datos_ot[i].selladoCorte_Id,
            Ot_Id: ot,
            Corte: this.corte,
            Sellado: this.sellado,
            Formato_Id: datos.tpProd_Id,
            SelladoCorte_Ancho: this.sellado ? this.FormOrdenTrabajoSellado.value.Ancho_Sellado : this.FormOrdenTrabajoCorte.value.Ancho_Corte,
            SelladoCorte_Largo: this.sellado ? this.FormOrdenTrabajoSellado.value.Largo_Sellado : this.FormOrdenTrabajoCorte.value.Largo_Corte,
            SelladoCorte_Fuelle: this.sellado ? this.FormOrdenTrabajoSellado.value.Fuelle_Sellado : this.FormOrdenTrabajoCorte.value.Fuelle_Corte,
            SelladoCorte_PesoMillar: this.FormOrdenTrabajoSellado.value.PesoMillar,
            TpSellado_Id: datos.tpSellado_Id,
            SelladoCorte_PrecioSelladoDia: this.FormOrdenTrabajoSellado.value.PrecioDia,
            SelladoCorte_PrecioSelladoNoche: this.FormOrdenTrabajoSellado.value.PrecioNoche,
            SelladoCorte_CantBolsasPaquete: this.FormOrdenTrabajoSellado.value.CantidadPaquete,
            SelladoCorte_CantBolsasBulto: this.FormOrdenTrabajoSellado.value.CantidadBulto,
            SelladoCorte_PesoPaquete: this.FormOrdenTrabajoSellado.value.PesoPaquete,
            SelladoCorte_PesoBulto: this.FormOrdenTrabajoSellado.value.PesoBulto,
            SelladoCorte_PesoProducto: this.pesoProducto,
          }
          this.otSelladoCorteService.put(datos_ot[i].selladoCorte_Id, info).subscribe(null, error => {
            this.msj.mensajeError(`¡No se actualizó la información de la OT en el área de 'Sellado' o 'Corte'!`, error.error);
            return true;
          });
        }, error => {
          this.msj.mensajeError(`¡No se pudo obtener informacón del Formato y Tipo de Sellado Selecionados para el área de Sellado!`, error.error);
          return true;
        });
      }
    }, () => {
      this.msj.mensajeError(`¡No se ha encontrado información de la OT N° ${ot}!`);
      return true;
    });
    return false;
  }

  // Funcion que creará el PDF de la Orden de trabajo
  pdfOrdenTrabajo(ot: number = this.FormOrdenTrabajo.value.OT_Id) {
    this.cargando = true;
    this.ordenTrabajoService.GetOrdenTrabajo(ot).subscribe(datos_ot => this.formatoPDF(datos_ot), () => {
      this.bagProService.GetOrdenTrabajo(ot).subscribe(datos_ot => this.formatoPDF(datos_ot), err => this.msj.mensajeError(err.error.errors.orden[0]));
    });
    setTimeout(() => this.cargando = false, 1200);
  }

  // Funcion que le va a dar el formato al arcivo PDF
  formatoPDF(datos_ot) {
    let usuario: string = this.AppComponent.storage_Nombre;
    for (let i = 0; i < datos_ot.length; i++) {
      let titulo: string = `${datos_ot[i].numero_Orden}`;
      const pdfDefinicion: any = {
        info: { title: titulo },
        pageSize: { width: 630, height: 760 },
        watermark: { text: 'PLASTICARIBE SAS', color: 'red', opacity: 0.05, bold: true, italics: false },
        pageMargins: [25, 190, 25, 35],
        header: [
          {
            margin: [25, 5],
            columns: [
              { image: logoParaPdf, width: 220, height: 50, margin: [10, 5] },
              {
                text: `PLASTICARIBE S.A.S 800188732-2.\nORDEN DE TRABAJO. ${datos_ot[i].numero_Orden}`,
                style: 'titulo',
                alignment: 'center',
                margin: [0, 20, 0, 0],
              },
            ]
          },
          {
            margin: [25, 5],
            style: 'tablaEmpresa',
            table: {
              widths: [60, '*', 60, '*'],
              style: 'header',
              body: [
                [
                  { border: [true, true, false, false], text: `Id Cliente`, style: 'titulo', },
                  { border: [false, true, false, false], text: `${datos_ot[i].id_SedeCliente}` },
                  { border: [true, true, false, false], text: `Item`, style: 'titulo', },
                  { border: [false, true, true, false], text: `${datos_ot[i].id_Producto}` },
                ],
                [
                  { border: [true, false, false, true], text: `Cliente`, style: 'titulo', },
                  { border: [false, false, true, true], text: `${datos_ot[i].cliente.toString().trim()}` },
                  { border: [false, false, false, true], text: `Referencia`, style: 'titulo', },
                  { border: [false, false, true, true], text: `${datos_ot[i].producto.toString().trim()}` },
                ],
              ]
            },
            layout: { defaultBorder: false, },
            fontSize: 9,
          },
          '\n',
          {
            margin: [25, 5],
            table: {
              widths: ['*', '*', '*', '*', '*'],
              style: '',
              body: [
                [
                  { border: [false, false, false, false], fillColor: '#aaaaaa', text: `Material`, style: 'titulo', alignment: 'center', },
                  { border: [false, false, false, false], fillColor: '#aaaaaa', text: `Cant. Bolsas`, style: 'titulo', alignment: 'center', },
                  { border: [false, false, false, false], fillColor: '#aaaaaa', text: `Cant. Kilos (Kg)`, style: 'titulo', alignment: 'center', },
                  { border: [false, false, false, false], fillColor: '#aaaaaa', text: `Presentación`, style: 'titulo', alignment: 'center', },
                  { border: [false, false, false, false], fillColor: '#aaaaaa', text: `Despachar`, style: 'titulo', alignment: 'center', },
                ],
                [
                  { border: [false, false, false, false], text: `${datos_ot[i].material}`, alignment: 'center', },
                  { border: [false, false, false, false], text: `${this.formatonumeros((datos_ot[i].cantidad_Pedida).toFixed(2))}`, alignment: 'center', },
                  { border: [false, false, false, false], text: `${this.formatonumeros((datos_ot[i].peso_Neto).toFixed(2))}`, alignment: 'center', },
                  { border: [false, false, false, false], text: `${datos_ot[i].presentacion}`, alignment: 'center', },
                  { border: [false, false, false, false], text: `${datos_ot[i].fecha_Entrega.replace('T00:00:00', '')}`, alignment: 'center', },
                ]
              ]
            },
            layout: { defaultBorder: false, },
            fontSize: 9,
          },
        ],
        footer: function (currentPage: any, pageCount: any) {
          return [
            '\n',
            {
              columns: [
                { text: `Documento generado por ${usuario}`, alignment: ' left', fontSize: 8, margin: [30, 0, 0, 0] },
                { text: `Fecha Expedición Documento ${moment().format('YYYY-MM-DD')} - ${moment().format('H:mm:ss')}`, alignment: 'right', fontSize: 8 },
                { text: `${currentPage.toString()} de ${pageCount}`, alignment: 'right', fontSize: 8, margin: [0, 0, 30, 0] },
              ]
            }
          ]
        },
        content: [
          {
            table: {
              widths: ['*'],
              style: '',
              body: [
                [{ border: [false, false, false, false], fillColor: '#aaaaaa', text: `Materia Prima`, alignment: 'center', style: 'titulo', }]
              ]
            },
            layout: { defaultBorder: false, },
            fontSize: 9,
          },
          // Mezclas
          '\n',
          {
            columns: [
              {
                width: datos_ot[i].mezcla_PorcentajeCapa1 == 0 ? '*' : 
                  Math.max(...[
                    datos_ot[i].m1C1_nombre.toString().trim().length,
                    datos_ot[i].m2C1_nombre.toString().trim().length,
                    datos_ot[i].m3C1_nombre.toString().trim().length,
                    datos_ot[i].m4C1_nombre.toString().trim().length,
                    datos_ot[i].p1C1_Nombre.replace('PIGMENTO', 'PIG.').toString().trim().length,
                    datos_ot[i].p2C1_Nombre.replace('PIGMENTO', 'PIG.').toString().trim().length
                  ]) > 20 ? 'auto' : '*',
                table: {
                  widths: [40, '*', 'auto'],
                  heights: (row) => (row) * 3,
                  style: '',
                  body: [
                    [
                      { colSpan: 3, text: `CAPA UNICA`, alignment: 'center', fillColor: '#aaaaaa', style: 'titulo', },
                      {},
                      {}
                    ],
                    [
                      { border: [true, false, false, false], text: `(%) Capa:` },
                      { border: [], text: `${datos_ot[i].mezcla_PorcentajeCapa1}%` },
                      { border: [false, false, true, false], text: `` }
                    ],
                    [
                      { border: [true, false, false, false], text: `Mat. 1:` },
                      { border: [], text: `${datos_ot[i].m1C1_nombre == 'NO APLICA MATERIAL' ? 'N/A' : datos_ot[i].m1C1_nombre.toString().trim()}` },
                      { border: [false, false, true, false], text: `${datos_ot[i].mezcla_PorcentajeMaterial1_Capa1}%` }
                    ],
                    [
                      { border: [true, false, false, false], text: `Mat. 2:` },
                      { border: [], text: `${datos_ot[i].m2C1_nombre == 'NO APLICA MATERIAL' ? 'N/A' : datos_ot[i].m2C1_nombre.toString().trim()}` },
                      { border: [false, false, true, false], text: `${datos_ot[i].mezcla_PorcentajeMaterial2_Capa1}%` }
                    ],
                    [
                      { border: [true, false, false, false], text: `Mat. 3:` },
                      { border: [], text: `${datos_ot[i].m3C1_nombre == 'NO APLICA MATERIAL' ? 'N/A' : datos_ot[i].m3C1_nombre.toString().trim()}` },
                      { border: [false, false, true, false], text: `${datos_ot[i].mezcla_PorcentajeMaterial3_Capa1}%` }
                    ],
                    [
                      { border: [true, false, false, false], text: `Mat. 4:` },
                      { border: [], text: `${datos_ot[i].m4C1_nombre == 'NO APLICA MATERIAL' ? 'N/A' : datos_ot[i].m4C1_nombre.toString().trim()}` },
                      { border: [false, false, true, false], text: `${datos_ot[i].mezcla_PorcentajeMaterial4_Capa1}%` }
                    ],
                    [
                      { border: [true, false, false, false], text: `Pig. 1:` },
                      { border: [], text: `${datos_ot[i].p1C1_Nombre == 'NO APLICA PIGMENTO' ? 'N/A' : datos_ot[i].p1C1_Nombre.replace('PIGMENTO', 'PIG.').toString().trim()}` },
                      { border: [false, false, true, false], text: `${datos_ot[i].mezcla_PorcentajePigmto1_Capa1}%` }
                    ],
                    [
                      { border: [true, false, false, true], text: `Pig. 2:` },
                      { border: [false, false, false, true], text: `${datos_ot[i].p2C1_Nombre == 'NO APLICA PIGMENTO' ? 'N/A' : datos_ot[i].p2C1_Nombre.replace('PIGMENTO', 'PIG.').toString().trim()}` },
                      { border: [false, false, true, true], text: `${datos_ot[i].mezcla_PorcentajePigmto2_Capa1}%` }
                    ],
                  ]
                }
              },
              {
                width: datos_ot[i].mezcla_PorcentajeCapa2 == 0 ? '*' : 
                  Math.max(...[
                    datos_ot[i].m1C2_nombre.toString().trim().length,
                    datos_ot[i].m2C2_nombre.toString().trim().length,
                    datos_ot[i].m3C2_nombre.toString().trim().length,
                    datos_ot[i].m4C2_nombre.toString().trim().length,
                    datos_ot[i].p1C2_Nombre.replace('PIGMENTO', 'PIG.').toString().trim().length,
                    datos_ot[i].p2C2_Nombre.replace('PIGMENTO', 'PIG.').toString().trim().length
                  ]) > 20 ? 'auto' : '*',
                table: {
                  widths: [40, '*', 'auto'],
                  heights: (row) => (row) * 3,
                  style: '',
                  body: [
                    [
                      { colSpan: 3, text: `CAPA INTERNA`, alignment: 'center', fillColor: '#aaaaaa', style: 'titulo', },
                      {},
                      {}
                    ],
                    [
                      { border: [true, false, false, false], text: `(%) Capa:` },
                      { border: [], text: `${datos_ot[i].mezcla_PorcentajeCapa2}%` },
                      { border: [false, false, true, false], text: `` }
                    ],
                    [
                      { border: [true, false, false, false], text: `Mat. 1:` },
                      { border: [], text: `${datos_ot[i].m1C2_nombre == 'NO APLICA MATERIAL' ? 'N/A' : datos_ot[i].m1C2_nombre.toString().trim()}` },
                      { border: [false, false, true, false], text: `${datos_ot[i].mezcla_PorcentajeMaterial1_Capa2}%` }
                    ],
                    [
                      { border: [true, false, false, false], text: `Mat. 2:` },
                      { border: [], text: `${datos_ot[i].m2C2_nombre == 'NO APLICA MATERIAL' ? 'N/A' : datos_ot[i].m2C2_nombre.toString().trim()}` },
                      { border: [false, false, true, false], text: `${datos_ot[i].mezcla_PorcentajeMaterial2_Capa2}%` }
                    ],
                    [
                      { border: [true, false, false, false], text: `Mat. 3:` },
                      { border: [], text: `${datos_ot[i].m3C2_nombre == 'NO APLICA MATERIAL' ? 'N/A' : datos_ot[i].m3C2_nombre.toString().trim()}` },
                      { border: [false, false, true, false], text: `${datos_ot[i].mezcla_PorcentajeMaterial3_Capa2}%` }
                    ],
                    [
                      { border: [true, false, false, false], text: `Mat. 4:` },
                      { border: [], text: `${datos_ot[i].m4C2_nombre == 'NO APLICA MATERIAL' ? 'N/A' : datos_ot[i].m4C2_nombre.toString().trim()}` },
                      { border: [false, false, true, false], text: `${datos_ot[i].mezcla_PorcentajeMaterial4_Capa2}%` }
                    ],
                    [
                      { border: [true, false, false, false], text: `Pig. 1:` },
                      { border: [], text: `${datos_ot[i].p1C2_Nombre == 'NO APLICA PIGMENTO' ? 'N/A' : datos_ot[i].p1C2_Nombre.replace('PIGMENTO', 'PIG.').toString().trim()}` },
                      { border: [false, false, true, false], text: `${datos_ot[i].mezcla_PorcentajePigmto1_Capa2}%` }
                    ],
                    [
                      { border: [true, false, false, true], text: `Pig. 2:` },
                      { border: [false, false, false, true], text: `${datos_ot[i].p2C2_Nombre == 'NO APLICA PIGMENTO' ? 'N/A' : datos_ot[i].p2C2_Nombre.replace('PIGMENTO', 'PIG.').toString().trim()}` },
                      { border: [false, false, true, true], text: `${datos_ot[i].mezcla_PorcentajePigmto2_Capa2}%` }
                    ],
                  ]
                }
              },
              {
                width: datos_ot[i].mezcla_PorcentajeCapa3 == 0 ? '*' : 
                  Math.max(...[
                    datos_ot[i].m1C3_nombre.toString().trim().length,
                    datos_ot[i].m2C3_nombre.toString().trim().length,
                    datos_ot[i].m3C3_nombre.toString().trim().length,
                    datos_ot[i].m4C3_nombre.toString().trim().length,
                    datos_ot[i].p1C3_Nombre.replace('PIGMENTO', 'PIG.').toString().trim().length,
                    datos_ot[i].p2C3_Nombre.replace('PIGMENTO', 'PIG.').toString().trim().length
                  ]) > 20 ? 'auto' : '*',
                table: {
                  widths: [40, '*', 'auto'],
                  heights: (row) => (row) * 3,
                  style: '',
                  body: [
                    [
                      { colSpan: 3, text: `CAPA EXTERNA`, alignment: 'center', fillColor: '#aaaaaa', style: 'titulo', },
                      {},
                      {}
                    ],
                    [
                      { border: [true, false, false, false], text: `(%) Capa: ` },
                      { border: [], text: `${datos_ot[i].mezcla_PorcentajeCapa3}%` },
                      { border: [false, false, true, false], text: `` }
                    ],
                    [
                      { border: [true, false, false, false], text: `Mat. 1:` },
                      { border: [], text: `${datos_ot[i].m1C3_nombre == 'NO APLICA MATERIAL' ? 'N/A' : datos_ot[i].m1C3_nombre.toString().trim()}` },
                      { border: [false, false, true, false], text: `${datos_ot[i].mezcla_PorcentajeMaterial1_Capa3}%` }
                    ],
                    [
                      { border: [true, false, false, false], text: `Mat. 2:` },
                      { border: [], text: `${datos_ot[i].m2C3_nombre == 'NO APLICA MATERIAL' ? 'N/A' : datos_ot[i].m2C3_nombre.toString().trim()}` },
                      { border: [false, false, true, false], text: `${datos_ot[i].mezcla_PorcentajeMaterial2_Capa3}%` }
                    ],
                    [
                      { border: [true, false, false, false], text: `Mat. 3:` },
                      { border: [], text: `${datos_ot[i].m3C3_nombre == 'NO APLICA MATERIAL' ? 'N/A' : datos_ot[i].m3C3_nombre.toString().trim()}` },
                      { border: [false, false, true, false], text: `${datos_ot[i].mezcla_PorcentajeMaterial3_Capa3}%` }
                    ],
                    [
                      { border: [true, false, false, false], text: `Mat. 4:` },
                      { border: [], text: `${datos_ot[i].m4C3_nombre == 'NO APLICA MATERIAL' ? 'N/A' : datos_ot[i].m4C3_nombre.toString().trim()}` },
                      { border: [false, false, true, false], text: `${datos_ot[i].mezcla_PorcentajeMaterial4_Capa3}%` }
                    ],
                    [
                      { border: [true, false, false, false], text: `Pig. 1:` },
                      { border: [], text: `${datos_ot[i].p1C3_Nombre == 'NO APLICA PIGMENTO' ? 'N/A' : datos_ot[i].p1C3_Nombre.replace('PIGMENTO', 'PIG.').toString().trim()}` },
                      { border: [false, false, true, false], text: `${datos_ot[i].mezcla_PorcentajePigmto1_Capa3}%` }
                    ],
                    [
                      { border: [true, false, false, true], text: `Pig. 2:` },
                      { border: [false, false, false, true], text: `${datos_ot[i].p2C3_Nombre == 'NO APLICA PIGMENTO' ? 'N/A' : datos_ot[i].p2C3_Nombre.replace('PIGMENTO', 'PIG.').toString().trim()}` },
                      { border: [false, false, true, true], text: `${datos_ot[i].mezcla_PorcentajePigmto2_Capa3}%` }
                    ],
                  ]
                }
              },
            ],
            fontSize: 9,
            columnGap: 10
          },
          '\n\n',
          {
            table: {
              widths: ['*'],
              style: '',
              body: [
                [{ border: [false, false, false, false], text: `EXTRUSIÓN`, alignment: 'center', fillColor: '#aaaaaa', style: 'titulo', }]
              ]
            }
          },
          {
            table: {
              widths: [65, 65, '*', 50, 70, 70, 60],
              style: '',
              body: [
                [
                  { border: [false, false, false, false], fillColor: '#eeeeee', text: `Pigmento`, alignment: 'center', style: 'subtitulo', },
                  { border: [false, false, false, false], fillColor: '#eeeeee', text: `Formato`, alignment: 'center', style: 'subtitulo', },
                  { border: [false, false, false, false], fillColor: '#eeeeee', text: `Ancho`, alignment: 'center', style: 'subtitulo', },
                  { border: [false, false, false, false], fillColor: '#eeeeee', text: `Und Medida`, alignment: 'center', style: 'subtitulo', },
                  { border: [false, false, false, false], fillColor: '#eeeeee', text: `Calibre`, alignment: 'center', style: 'subtitulo', },
                  { border: [false, false, false, false], fillColor: '#eeeeee', text: `Peso MT \n(Min/Max)`, alignment: 'center', style: 'subtitulo', },
                  { border: [false, false, false, false], fillColor: '#eeeeee', text: `Tratado`, alignment: 'center', style: 'subtitulo', }
                ],
                [
                  {},
                  {},
                  {},
                  {},
                  {},
                  {},
                  {},
                ],
                [
                  { border: [false, false, false, false], text: `${datos_ot[i].pigmento_Extrusion.toString().trim()}`, alignment: 'center', },
                  { border: [false, false, false, false], text: `${datos_ot[i].formato_Extrusin.toString().trim()}`, alignment: 'center', },
                  { border: [false, false, false, false], text: `${this.formatonumeros((datos_ot[i].ancho1_Extrusion).toFixed(2))}   +   ${this.formatonumeros((datos_ot[i].ancho2_Extrusion).toFixed(2))}   +   ${this.formatonumeros((datos_ot[i].ancho3_Extrusion).toFixed(2))}`, alignment: 'center', },
                  { border: [false, false, false, false], text: `${datos_ot[i].und_Extrusion}`, alignment: 'center', },
                  { border: [false, false, false, false], text: `${this.formatonumeros((datos_ot[i].calibre_Extrusion).toFixed(2))}`, alignment: 'center', },
                  { border: [false, false, false, false], text: `${this.formatonumeros((datos_ot[i].peso_Extrusion).toFixed(2))}`, alignment: 'center', },
                  { border: [false, false, false, false], text: `${datos_ot[i].tratado}`, alignment: 'center', }
                ]
              ]
            },
            layout: { defaultBorder: false, },
            fontSize: 9,
          },
          '\n',
          {
            table: {
              widths: ['*'],
              style: '',
              body: [
                [{ border: [true, true, true, false], text: `Observación: ` }],
                [{ border: [true, false, true, true], text: `${datos_ot[i].observacion.toString().trim()}` }]
              ]
            },
            layout: { defaultBorder: false, },
            fontSize: 9,
            pageBreak: 'after'
          },
          // Hoja 2
          // Procesos
          {
            table: {
              widths: ['*', 20, '*'],
              style: '',
              body: [
                [
                  // Extrusion
                  {
                    table: {
                      widths: ['*', '*', '*'],
                      style: '',
                      body: [
                        [
                          { colSpan: 3, text: `EXTRUSIÓN`, alignment: 'center', fillColor: '#aaaaaa', style: 'titulo', },
                          {},
                          {}
                        ],
                        [
                          { border: [], text: `Pigmento: `, },
                          { border: [], text: `${datos_ot[i].pigmento_Extrusion.toString().trim()}`, },
                          { border: [], text: ``, }
                        ],
                        [
                          { border: [], text: `Formato: `, },
                          { border: [], text: `${datos_ot[i].formato_Extrusin.toString().trim()}`, },
                          { border: [], text: ``, }
                        ],
                        [
                          { border: [], text: `Calibre: `, },
                          { border: [], text: `${this.formatonumeros((datos_ot[i].calibre_Extrusion).toFixed(2))}`, },
                          { border: [], text: ``, }
                        ],
                        [
                          { border: [], text: `Unidad Medida: `, },
                          { border: [], text: `${datos_ot[i].und_Extrusion.toString().trim()}`, },
                          { border: [], text: ``, }
                        ],
                        [
                          { border: [], text: `ANCHO`, },
                          { border: [], text: `${this.formatonumeros((datos_ot[i].ancho1_Extrusion).toFixed(2))}   +   ${this.formatonumeros((datos_ot[i].ancho2_Extrusion).toFixed(2))}   +`, },
                          { border: [], text: `   ${this.formatonumeros((datos_ot[i].ancho3_Extrusion).toFixed(2))}`, }
                        ],
                        [
                          { border: [], text: `Peso MT (Min/Max): `, },
                          { border: [false, false, false, false], text: `${this.formatonumeros((datos_ot[i].peso_Extrusion).toFixed(2))}`, },
                          { border: [false, false, false, false], text: ``, }
                        ],
                        [
                          { border: [], text: `Tratado Caras: `, },
                          { border: [], text: `${datos_ot[i].tratado.toString().trim()}`, },
                          { border: [], text: ``, }
                        ],
                      ]
                    }
                  },
                  {},
                  // Laminado
                  {
                    table: {
                      widths: ['*', '*', '*'],
                      style: '',
                      body: [
                        [
                          { colSpan: 3, text: `LAMINADO`, alignment: 'center', fillColor: '#aaaaaa', style: 'titulo', },
                          { border: [], text: ``, },
                          { border: [], text: ``, }
                        ],
                        [
                          { border: [], text: `CAPA`, bold: true, },
                          { border: [], text: `CALIBRE`, bold: true, },
                          { border: [], text: `CANTIDAD`, bold: true, }
                        ],
                        [
                          { border: [], text: `${datos_ot[i].laminado_Capa1.toString().trim()}`, },
                          { border: [], text: `${this.formatonumeros((datos_ot[i].calibre_Laminado_Capa1).toFixed(2))}`, },
                          { border: [], text: `${this.formatonumeros((datos_ot[i].cantidad_Laminado_Capa1).toFixed(2))}`, }
                        ],
                        [
                          { border: [], text: `${datos_ot[i].laminado_Capa2.toString().trim()}`, },
                          { border: [], text: `${this.formatonumeros((datos_ot[i].calibre_Laminado_Capa2).toFixed(2))}`, },
                          { border: [], text: `${this.formatonumeros((datos_ot[i].cantidad_Laminado_Capa2).toFixed(2))}`, }
                        ],
                        [
                          { border: [], text: `${datos_ot[i].laminado_Capa3.toString().trim()}`, },
                          { border: [], text: `${this.formatonumeros((datos_ot[i].calibre_Laminado_Capa3).toFixed(2))}`, },
                          { border: [], text: `${this.formatonumeros((datos_ot[i].cantidad_Laminado_Capa3).toFixed(2))}`, }
                        ]
                      ]
                    }
                  }
                ],
                [
                  {},
                  {},
                  {}
                ],
                [
                  {},
                  {},
                  {}
                ],
                [
                  // Impresion
                  {
                    table: {
                      widths: ['*', '*'],
                      style: '',
                      body: [
                        [
                          { colSpan: 2, text: `IMPRESIÓN`, alignment: 'center', fillColor: '#aaaaaa', style: 'titulo', },
                          {},
                        ],
                        [
                          { border: [], text: `Tipo Impresión: `, },
                          { border: [], text: `${datos_ot[i].tipo_Impresion.toString().trim() == 'NO APLICA' ? 'FLEXOGRAFIA' : datos_ot[i].tipo_Impresion.toString().trim()}`, }
                        ],
                        [
                          { border: [], text: `Rodillo N°: `, },
                          { border: [], text: `${datos_ot[i].rodillo.toString().trim()}`, }
                        ],
                        [
                          { border: [], text: `N° de Pista: `, },
                          { border: [], text: `${datos_ot[i].pista.toString().trim()}`, }
                        ],
                        [
                          { border: [], text: `Tinta 1: `, },
                          { border: [], text: `${datos_ot[i].tinta1.toString().trim()}`, }
                        ],
                        [
                          { border: [], text: `Tinta 2: `, },
                          { border: [], text: `${datos_ot[i].tinta2.toString().trim()}`, }
                        ],
                        [
                          { border: [], text: `Tinta 3: `, },
                          { border: [], text: `${datos_ot[i].tinta3.toString().trim()}`, }
                        ],
                        [
                          { border: [], text: `Tinta 4: `, },
                          { border: [], text: `${datos_ot[i].tinta4.toString().trim()}`, }
                        ],
                        [
                          { border: [], text: `Tinta 5: `, },
                          { border: [], text: `${datos_ot[i].tinta5.toString().trim()}`, }
                        ],
                        [
                          { border: [], text: `Tinta 6: `, },
                          { border: [], text: `${datos_ot[i].tinta6.toString().trim()}`, }
                        ],
                        [
                          { border: [], text: `Tinta 7: `, },
                          { border: [], text: `${datos_ot[i].tinta7.toString().trim()}`, }
                        ],
                        [
                          { border: [], text: `Tinta 8: `, },
                          { border: [], text: `${datos_ot[i].tinta8.toString().trim()}`, }
                        ],
                      ]
                    }
                  },
                  {},
                  // Producto Terimnado
                  {
                    table: {
                      widths: ['*', '*', '*'],
                      style: '',
                      body: [
                        [
                          { colSpan: 3, text: `PRODUCTO TERMINADO`, alignment: 'center', fillColor: '#aaaaaa', style: 'titulo', },
                          {},
                          {},
                        ],
                        [
                          { border: [], text: `Formato Bolsa: `, alignment: 'center', },
                          { border: [], text: `${datos_ot[i].formato_Producto.toString().trim()}`, alignment: 'center', },
                          { border: [], text: ``, },
                        ],
                        [
                          { border: [], text: `Ancho`, alignment: 'right', bold: true, },
                          { border: [], text: `Largo`, alignment: 'center', bold: true, },
                          { border: [], text: `Fuelle`, alignment: 'left', bold: true, },
                        ],
                        [
                          { border: [], colspan: 3, text: `${this.formatonumeros((datos_ot[i].selladoCorte_Ancho).toFixed(2))}`, alignment: 'right', },
                          { border: [], colspan: 3, text: `x          ${this.formatonumeros((datos_ot[i].selladoCorte_Largo).toFixed(2))}          x`, alignment: 'center', },
                          { border: [], colspan: 3, text: `${this.formatonumeros((datos_ot[i].selladoCorte_Fuelle).toFixed(2))}               ${datos_ot[i].und_Extrusion.toString().trim()}`, },
                        ],
                        [
                          { border: [], text: ``, },
                          { border: [], text: ``, },
                          { border: [], text: ``, },
                        ],
                        [
                          { border: [], text: ``, },
                          { border: [], text: ``, },
                          { border: [], text: ``, },
                        ],
                        [
                          { border: [], text: `Sellado: `, },
                          { border: [], text: `${datos_ot[i].tpSellados_Nombre.toString().trim()}`, },
                          { border: [], text: ``, },
                        ],
                        [
                          { border: [], text: `Margen: `, },
                          { border: [], text: `${this.formatonumeros((datos_ot[i].margen).toFixed(2))}`, },
                          { border: [], text: ``, },
                        ],
                        [
                          { border: [], text: `Peso Millar: `, },
                          { border: [], text: `${this.formatonumeros((datos_ot[i].selladoCorte_PesoMillar).toFixed(2))}`, },
                          { border: [], text: ``, },
                        ],
                        [
                          { border: [], text: `Cant. x Paquete: `, },
                          { border: [], text: `${this.formatonumeros((datos_ot[i].selladoCorte_CantBolsasPaquete).toFixed(2))}`, },
                          { border: [], text: ``, },
                        ],
                        [
                          { border: [], text: `Cant. x Bulto: `, },
                          { border: [], text: `${this.formatonumeros((datos_ot[i].selladoCorte_CantBolsasBulto).toFixed(2))}`, },
                          { border: [], text: ``, },
                        ]
                      ]
                    }
                  },
                ]
              ]
            },
            layout: { defaultBorder: false, },
            fontSize: 9,
          },
          '\n',
          datos_ot[i].cyrel == true || datos_ot[i].cyrel == '1' ? {
            table: {
              widths: [20, '*', 20],
              style: '',
              body: [
                [
                  { border: [], text: ``, },
                  { border: [], text: `Hacer Cyrel`, alignment: 'center', bold: true },
                  { border: [], text: ``, }
                ]
              ]
            }
          } : {},
          '\n\n',
          {
            table: {
              widths: ['*'],
              body: [
                [{ border: [true, true, true, false], text: `Observación: ` }],
                [{ border: [true, false, true, true], text: `${datos_ot[i].observacion}` }]
              ]
            },
            layout: { defaultBorder: false, },
            fontSize: 9,
            margin: [0, -20]
          }
        ],
        styles: {
          header: { fontSize: 7, bold: true },
          titulo: { fontSize: 11, bold: true },
          ot: { fontSize: 13, bold: true },
          subtitulo: { fontSize: 10, bold: true }
        }
      }
      const pdf = pdfMake.createPdf(pdfDefinicion);
      pdf.open();
    }
  }
}