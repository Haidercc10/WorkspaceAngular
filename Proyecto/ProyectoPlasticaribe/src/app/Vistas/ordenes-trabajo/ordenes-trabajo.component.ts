import { Component, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import { Console } from 'console';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { MessageService } from 'primeng/api';
import { Dropdown } from 'primeng/dropdown';
import { modelMezMaterial } from 'src/app/Modelo/modelMezMaterial';
import { modelMezPigmento } from 'src/app/Modelo/modelMezPigmento';
import { modelMezclas } from 'src/app/Modelo/modelMezclas';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { ClientesService } from 'src/app/Servicios/Clientes/clientes.service';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { FormatosService } from 'src/app/Servicios/Formato/Formatos.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
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
import { OpedidoproductoService } from 'src/app/Servicios/PedidosProductos/opedidoproducto.service';
import { PigmentoProductoService } from 'src/app/Servicios/PigmentosProductos/pigmentoProducto.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { SedeClienteService } from 'src/app/Servicios/SedeCliente/sede-cliente.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import { Tipos_ImpresionService } from 'src/app/Servicios/TipoImpresion/Tipos_Impresion.service';
import { TipoProductoService } from 'src/app/Servicios/TipoProducto/tipo-producto.service';
import { TiposSelladoService } from 'src/app/Servicios/TiposSellado/TiposSellado.service';
import { TratadoService } from 'src/app/Servicios/Tratado/Tratado.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsOrdenTrabajo as defaultSteps, stepsMezclasOT as defaultSteps2, stepsCrearMezclasOT as defaultSteps3 } from 'src/app/data';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-ordenes-trabajo',
  templateUrl: './ordenes-trabajo.component.html',
  styleUrls: ['./ordenes-trabajo.component.css']
})

export class OrdenesTrabajoComponent implements OnInit {

  FormOrdenTrabajo !: FormGroup;
  FormOrdenTrabajoExtrusion !: FormGroup;
  FormOrdenTrabajoImpresion !: FormGroup;
  FormOrdenTrabajoLaminado !: FormGroup;
  FormOrdenTrabajoCorte !: FormGroup;
  FormOrdenTrabajoSellado !: FormGroup;
  FormOrdenTrabajoMezclas !: FormGroup;

  arrayTintas = []; /** Array que colocará las tintas en los combobox al momento de crear la OT */
  arrayPigmentos = []; /** Array que colocará las pigmentos en los combobox al momento de crear la OT */
  arrayMateriales = []; /** Array que colocará las materiales en los combobox al momento de crear la OT*/
  arrayUnidadesMedidas = []; /** Array que colocará las unidades de medida en los combobox al momento de crear la OT*/
  cargando : boolean = false; //Variable para validar que salga o no la imagen de carga
  edicionOrdenTrabajo : boolean = false; //Variable para validar que se está editando o no una orden de trabajo
  vistaPedidos : boolean = false; //Funcion que validará si se muestra el navbar de ordenes de trabajo o no
  checkedCyrel : boolean = false; //Variable para saber si el checkbox del Cyrel está seleccionado o no
  checkedCorte : boolean = false; //Variable para saber si el checkbox del Corte está seleccionado o no
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  pedidosSinOT : any = []; //Variable que almacenará la informacion de los pedidos que no tienen orden de trabajo aun
  ultimaOrdenTrabajo : number; // Variable que almacenará el numero de la OT que se está creando
  ArrayProducto : any [] = []; //Variable que tendrá la informacion de los productos que fueron pedidos
  estados : any = []; //Variable que almacenará los estados que puede tener una orden de trabajo
  tratado : any = []; //Vairbale que servirá para almacenar los tratado que puede tener una bolsa en el proceso de extrusion
  formatos : any = []; //Variable que servirá para almacenar los formatos que se harán en extrusion
  tiposImpresion : any = []; //Variable que guardará los diferentes tipos de impresion que hay en la empresa
  laminado_capas : any = []; //Vaiable qie almacenará los diferentes laminados
  producto : number = 0; //Variable que almacenará el producto al que se espera que se le cree la orden de trabajo
  mezclasMateriales : any = [] //Vaiable que almacenará las mezclas de materiales
  mezclasMateriales2 : any = [] //Vaiable que almacenará los ID de las mezclas de materiales
  mezclasPigmentos : any = []; //Variable que almacenará las mezclas de pigmentos
  mezclasPigmentos2 : any = []; //Variable que almacenará los ID de las mezclas de pigmentos
  mezclas : any = []; //Variable que almacenará las mezclas
  checkedCapa1 : boolean = false; //Variable para saber si el checkbox de la capa 1 está seleccionado
  checkedCapa2 : boolean = false; //Variable para saber si el checkbox de la capa 2 está seleccionado
  checkedCapa3 : boolean = false; //Variable para saber si el checkbox de la capa 3 está seleccionado
  idMezclaSeleccionada : number = 0; //Variable que almacenará el ID de la mezcla que fue seleccionada
  presentacionProducto : string; //Variablle que almacenará la presentacion del producto
  modalMezclas : boolean = false; //Variable que mostrará o no el modal para crear mezclas.
  tipoProductos : any [] = []; //Vairbla que almacenará la informacion de ls tipos de productos
  tipoSellado : any [] = []; //Variable que almacenará la informacion de los tipos de sellados
  extrusion : boolean = false; //Variable que servirá para saber si se pasará por el proceso o no
  impresion : boolean = false; //Variable que servirá para saber si se pasará por el proceso o no
  rotograbado : boolean = false; //Variable que servirá para saber si se pasará por el proceso o no
  laminado : boolean = false; //Variable que servirá para saber si se pasará por el proceso o no
  doblado : boolean = false; //Variable que servirá para saber si se pasará por el proceso o no
  sellado : boolean = false; //Variable que servirá para saber si se pasará por el proceso o no
  cantidadProducto : number = 0; //Variable que almacenará la cantidad de producto que se va a pedir
  valorProducto : number = 0; //Variable que almacenrá ek valor total el producto
  netoKg : number = 0; //Variable que almacenará el peso neto en kilogramos que se debe producir
  valorKg : number = 0; //Variable que almacenará el valor del kilogramo
  valorOt : number = 0; //Variable que almacenará el valor total de la orden de trabajo
  margenKg : number = 0; //Variable que almcanerá la cantidad adicional de kg que se harán para manejar un margen de error
  pesoPaquete : number = 0; //Variable que almacenará cuantos kg pesa un paquete
  pesoBulto : number = 0; //Variable que almacenará cuantos kg pesa un bulto
  pesoProducto : number = 0; //Variable que almacenará el peso del producto
  informacionSeleccionada : any; //Variable que almacenará la información del producto seleccionado
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  formCrearMezclas !: FormGroup;
  arrayMateriales2 : any = [];
  objetoDatos : any;
  existencia : boolean = false;
  nroCapas : number = 0;
  modalMateriales : boolean = false;
  modalPigmentos : boolean = false;
  formCrearPigmentos !: FormGroup;
  formCrearMateriales !: FormGroup;
  nroCapasOT : number = 0;

  constructor(private frmBuilderPedExterno : FormBuilder,
                private AppComponent : AppComponent,
                  private bagProService : BagproService,
                    private pedidoExternoService : OpedidoproductoService,
                      private servicioTintas : TintasService,
                        private servicioMateriales : MaterialProductoService,
                          private servicioPigmentos : PigmentoProductoService,
                            private servicioUnidadMedida : UnidadMedidaService,
                              private estadosService : EstadosService,
                                private tratadoServise : TratadoService,
                                  private formatoService : FormatosService,
                                    private tiposImpresionService : Tipos_ImpresionService,
                                      private laminadoCapasService : Laminado_CapaService,
                                        private ordenTrabajoService : Orden_TrabajoService,
                                          private otExtrusionServie : OT_ExtrusionService,
                                            private otImpresionService : OT_ImpresionService,
                                              private otLaminadoService : OT_LaminadoService,
                                                private otSelladoCorteService : OrdenTrabajo_Sellado_CorteService,
                                                  private mezclaMaterialService : Mezclas_MaterialesService,
                                                    private mezclaPigmentosService : Mezclas_PigmentosService,
                                                      private mezclasService : MezclasService,
                                                        private messageService: MessageService,
                                                          private productoService : ProductoService,
                                                            private clienteServise : ClientesService,
                                                              private tiposProductosService : TipoProductoService,
                                                                private tipoSelladoService : TiposSelladoService,
                                                                  private pedidosZeusService : InventarioZeusService,
                                                                    private sedeClienteService : SedeClienteService,
                                                                      private shepherdService: ShepherdService,
                                                                        private mensajeService : MensajesAplicacionService,) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.FormOrdenTrabajo = this.frmBuilderPedExterno.group({
      OT_Id: [null],
      Pedido_Id: [null, Validators.required],
      Nombre_Vendedor: [null, Validators.required],
      OT_FechaCreacion: [this.today, Validators.required],
      OT_FechaEntrega: [null, Validators.required],
      Id_Sede_Cliente : [null, Validators.required],
      ID_Cliente: [null, Validators.required],
      Nombre_Cliente: [null, Validators.required],
      Ciudad_SedeCliente: [null, Validators.required],
      Direccion_SedeCliente : [null, Validators.required],
      OT_Estado : [null],
      OT_Observacion : [null],
      Margen : [0, Validators.required],
    });

    this.FormOrdenTrabajoExtrusion = this.frmBuilderPedExterno.group({
      /*** Datos para tabla de extrusión */
      Material_Extrusion : [1, Validators.required],
      Formato_Extrusion : [1, Validators.required],
      Pigmento_Extrusion : [1, Validators.required],
      Ancho_Extrusion1 : [0, Validators.required],
      Ancho_Extrusion2 : [0, Validators.required],
      Ancho_Extrusion3 : [0, Validators.required],
      Calibre_Extrusion : [0, Validators.required],
      UnidadMedida_Extrusion : [null, Validators.required],
      Tratado_Extrusion : [1, Validators.required],
      Peso_Extrusion : [0, Validators.required],
    });

    this.FormOrdenTrabajoImpresion = this.frmBuilderPedExterno.group({
      /*** Datos para tabla de impresióm */
      Tipo_Impresion : [1, Validators.required],
      Rodillo_Impresion : [0, Validators.required],
      Pista_Impresion : [0, Validators.required],
      Tinta_Impresion1 : ['NO APLICA', Validators.required],
      Tinta_Impresion2 : ['NO APLICA', Validators.required],
      Tinta_Impresion3 : ['NO APLICA', Validators.required],
      Tinta_Impresion4 : ['NO APLICA', Validators.required],
      Tinta_Impresion5 : ['NO APLICA', Validators.required],
      Tinta_Impresion6 : ['NO APLICA', Validators.required],
      Tinta_Impresion7 : ['NO APLICA', Validators.required],
      Tinta_Impresion8 : ['NO APLICA', Validators.required],
    });

    this.FormOrdenTrabajoLaminado = this.frmBuilderPedExterno.group({
      /*** Datos para tabla de Laminado */
      Capa_Laminado1 : [1, Validators.required],
      Calibre_Laminado1 : [0, Validators.required],
      cantidad_Laminado1 : [0, Validators.required],
      Capa_Laminado2 : [1, Validators.required],
      Calibre_Laminado2 : [0, Validators.required],
      cantidad_Laminado2 : [0, Validators.required],
      Capa_Laminado3 : [1, Validators.required],
      Calibre_Laminado3 : [0, Validators.required],
      cantidad_Laminado3 : [0, Validators.required],
    });

    this.FormOrdenTrabajoCorte = this.frmBuilderPedExterno.group({
      Formato_Corte : [null, Validators.required],
      Ancho_Corte : [null, Validators.required],
      Largo_Corte : [null, Validators.required],
      Fuelle_Corte : [null, Validators.required],
      Margen_Corte : [null, Validators.required],
    });

    this.FormOrdenTrabajoSellado = this.frmBuilderPedExterno.group({
      Formato_Sellado : [null, Validators.required],
      Ancho_Sellado : [null, Validators.required],
      Largo_Sellado : [null, Validators.required],
      Fuelle_Sellado : [null, Validators.required],
      Margen_Sellado : [null, Validators.required],
      PesoMillar : [0, Validators.required],
      TipoSellado : [0, Validators.required],
      PrecioDia : [0, Validators.required],
      PrecioNoche : [0, Validators.required],
      CantidadPaquete : [0, Validators.required],
      PesoPaquete : [0, Validators.required],
      CantidadBulto : [0, Validators.required],
      PesoBulto : [0, Validators.required],
    });

    this.FormOrdenTrabajoMezclas = this.frmBuilderPedExterno.group({
      Id_Mezcla : [null, Validators.required],
      Nombre_Mezclas : [null, Validators.required],
      Chechbox_Capa1 : [null, Validators.required],
      Chechbox_Capa2 : [null, Validators.required],
      Chechbox_Capa3 : [null, Validators.required],
      Proc_Capa1 : [0, Validators.required],
      Proc_Capa2 : [0, Validators.required],
      Proc_Capa3 : [0, Validators.required],
      materialP1_Capa1 : [1, Validators.required],
      PorcentajeMaterialP1_Capa1 : [0, Validators.required],
      materialP1_Capa2 : [1, Validators.required],
      PorcentajeMaterialP1_Capa2 : [0, Validators.required],
      materialP1_Capa3 : [1, Validators.required],
      PorcentajeMaterialP1_Capa3 : [0, Validators.required],
      materialP2_Capa1 : [1, Validators.required],
      PorcentajeMaterialP2_Capa1 : [0, Validators.required],
      materialP2_Capa2 : [1, Validators.required],
      PorcentajeMaterialP2_Capa2 : [0, Validators.required],
      materialP2_Capa3 : [1, Validators.required],
      PorcentajeMaterialP2_Capa3 : [0, Validators.required],
      materialP3_Capa1 : [1, Validators.required],
      PorcentajeMaterialP3_Capa1 : [0, Validators.required],
      materialP3_Capa2 : [1, Validators.required],
      PorcentajeMaterialP3_Capa2 : [0, Validators.required],
      materialP3_Capa3 : [1, Validators.required],
      PorcentajeMaterialP3_Capa3 : [0, Validators.required],
      materialP4_Capa1 : [1, Validators.required],
      PorcentajeMaterialP4_Capa1 : [0, Validators.required],
      materialP4_Capa2 : [1, Validators.required],
      PorcentajeMaterialP4_Capa2 : [0, Validators.required],
      materialP_Capa3 : [1, Validators.required],
      PorcentajeMaterialP_Capa3 : [0, Validators.required],
      MezclaPigmentoP1_Capa1 : [1, Validators.required],
      PorcentajeMezclaPigmentoP1_Capa1 : [0, Validators.required],
      MezclaPigmentoP1_Capa2 : [1, Validators.required],
      PorcentajeMezclaPigmentoP1_Capa2 : [0, Validators.required],
      MezclaPigmento1_Capa3 : [1, Validators.required],
      PorcentajeMezclaPigmentoP1_Capa3 :[0, Validators.required],
      MezclaPigmentoP2_Capa1 : [1, Validators.required],
      PorcentajeMezclaPigmentoP2_Capa1 : [0, Validators.required],
      MezclaPigmentoP2_Capa2 : [1, Validators.required],
      PorcentajeMezclaPigmentoP2_Capa2 : [0, Validators.required],
      MezclaPigmento2_Capa3 : [1, Validators.required],
      PorcentajeMezclaPigmentoP2_Capa3 : [0, Validators.required],
    });

    /** Formulario para creación de mezclas */
    this.formCrearMezclas = this.frmBuilderPedExterno.group({
      mezclaId : '',
      Nombre_Mezclas : ['', Validators.required],
      Material_MatPrima : [0, Validators.required],
      Chechbox_Capa1 : ['', Validators.required],
      Chechbox_Capa2 : ['', Validators.required],
      Chechbox_Capa3 : ['', Validators.required],
      Proc_Capa1 : [0, Validators.required],
      Proc_Capa2 : [0, Validators.required],
      Proc_Capa3 : [0, Validators.required],
      materialP1_Capa1 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP1_Capa1 : [0, Validators.required],
      materialP1_Capa2 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP1_Capa2 : [0, Validators.required],
      materialP1_Capa3 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP1_Capa3 : [0, Validators.required],
      materialP2_Capa1 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP2_Capa1 : [0, Validators.required],
      materialP2_Capa2 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP2_Capa2 : [0, Validators.required],
      materialP2_Capa3 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP2_Capa3 : [0, Validators.required],
      materialP3_Capa1 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP3_Capa1 : [0, Validators.required],
      materialP3_Capa2 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP3_Capa2 : [0, Validators.required],
      materialP3_Capa3 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP3_Capa3 : [0, Validators.required],
      materialP4_Capa1 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP4_Capa1 : [0, Validators.required],
      materialP4_Capa2 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP4_Capa2 : [0, Validators.required],
      materialP4_Capa3 : ['NO APLICA MATERIAL', Validators.required],
      PorcentajeMaterialP4_Capa3 : [0, Validators.required],
      MezclaPigmentoP1_Capa1 : ['NO APLICA PIGMENTO', Validators.required],
      PorcentajeMezclaPigmentoP1_Capa1 : [0, Validators.required],
      MezclaPigmentoP1_Capa2 : ['NO APLICA PIGMENTO', Validators.required],
      PorcentajeMezclaPigmentoP1_Capa2 : [0, Validators.required],
      MezclaPigmento1_Capa3 : ['NO APLICA PIGMENTO', Validators.required],
      PorcentajeMezclaPigmentoP1_Capa3 :[0, Validators.required],
      MezclaPigmentoP2_Capa1 : ['NO APLICA PIGMENTO', Validators.required],
      PorcentajeMezclaPigmentoP2_Capa1 : [0, Validators.required],
      MezclaPigmentoP2_Capa2 : ['NO APLICA PIGMENTO', Validators.required],
      PorcentajeMezclaPigmentoP2_Capa2 : [0, Validators.required],
      MezclaPigmento2_Capa3 : ['NO APLICA PIGMENTO', Validators.required],
      PorcentajeMezclaPigmentoP2_Capa3 : [0, Validators.required],
    });


    this.formCrearMateriales = this.frmBuilderPedExterno.group({
      matNombre : [null, Validators.required],
      matDescripcion :  [null, Validators.required],
    });

    this.formCrearPigmentos = this.frmBuilderPedExterno.group({
      pigNombre : [null, Validators.required],
      pigDescripcion :  [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.cargarEstados();
    this.lecturaStorage();
    this.ultimaOT();
    this.pedidos();
    this.pedidosZues();
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

  /** Función que mostrará un tutorial describiendo paso a paso cada funcionalidad de la aplicación en el apartado de crear mezclas*/
  verTutorial3() {
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps3);
    this.shepherdService.start();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  /** Función que cargará las tintas en los combobox al momento de crear la OT. */
  cargarTintasEnProcesoImpresion = () => this.servicioTintas.srvObtenerLista().subscribe(tintas => this.arrayTintas = tintas.filter((item) => item.catMP_Id == 7));

  /** Función que cargará los pigmentos en el combobox al momento de crear la OT. */
  cargarPigmentosEnProcesoExtrusion = () => this.servicioPigmentos.srvObtenerLista().subscribe(pigmentos => this.arrayPigmentos = pigmentos);

  //Funcion que cargará los estados que puede tener una orden de trabajo
  cargarEstados = () => this.estadosService.srvObtenerListaEstados().subscribe(datos => this.estados = datos);

  /** Función que cargará los materiales en el combobox al momento de crear la OT. */
  cargarMaterialEnProcesoExtrusion = () => this.servicioMateriales.srvObtenerLista().subscribe(materiasProd => this.arrayMateriales = materiasProd);

   /** Función que cargará los materiales en el combobox al momento de llamar el modal de Crear Mezclas. */
  cargarMateriales_MatPrima = () => this.servicioMateriales.srvObtenerLista().subscribe(materiasProd => this.arrayMateriales2 = materiasProd);

  /** Función que cargará las unidades de medida en el combobox al momento de crear la OT. */
  cargarUnidadMedidaEnProcesoExtrusion = () => this.servicioUnidadMedida.srvObtenerLista().subscribe(datos => this.arrayUnidadesMedidas = datos.filter((item) => item.undMed_Id == 'Cms' || item.undMed_Id == 'Plgs'));

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

  // Funcion que cargará las mezclas de materiales
  cargarMezclaMateria2 = () => this.mezclaMaterialService.srvObtenerLista().subscribe(datos => this.mezclasMateriales2 = datos);

  // Funcion que cargará las mezclas de pigmentos
  cargarMezclaPigmento = () => this.mezclaPigmentosService.srvObtenerLista().subscribe(datos => this.mezclasPigmentos = datos);

    // Funcion que cargará las mezclas de pigmentos
  cargarMezclaPigmento2 = () => this.mezclaPigmentosService.srvObtenerLista().subscribe(datos => this.mezclasPigmentos2 = datos);

  // Funcion que cargará el nombre de las mezclas
  cargarMezclas = () => this.mezclasService.srvObtenerLista().subscribe(datos => this.mezclas = datos);

  // Funcion que va cargará la informacion de los tipos de productos
  cargarTiposProductos = () => this.tiposProductosService.srvObtenerLista().subscribe(datos => this.tipoProductos = datos);

  // Funcion que va a cargar la informacion de los tipos de sellado
  cargarTiposSellado = () => this.tipoSelladoService.srvObtenerLista().subscribe(datos => this.tipoSellado = datos);

  // Funcion que traerá la ultima orden de trabajo para poder tomar el ID de la OT
  ultimaOT = () => this.bagProService.srvObtenerListaClienteOT_UltimaOT().subscribe(datos_ot => this.ultimaOrdenTrabajo = datos_ot.item + 1);

  //Funcion que servirá para mostrar la informacion de los pedidos que no tienen orden de trabajo
  pedidos = () => this.pedidoExternoService.GetPedidosSinOT().subscribe(datos => this.pedidosSinOT = datos);

  // Funcion que va a cerrar el mensaje de confirmación de edicion de una orden de trabajo
  cerrarMensaje = () => this.messageService.clear('editarOrden');

  // Funcion que va a obtener los pedidos provenientes de zeus
  pedidosZues(){
    this.pedidosZeusService.GetPedidosAgrupados().subscribe(datos_Pedidos => {
      for (let i = 0; i < datos_Pedidos.length; i++) {
        let data : any =  {
          "id_Pedido": parseInt(datos_Pedidos[i].consecutivo),
          "id_Cliente": datos_Pedidos[i],
          "nombre_Cliente": datos_Pedidos[i].cliente,
          "cantidad_Productos": 1,
          "zeus" : true,
        }
        this.pedidosSinOT.push(data);
      }
    });
  }

  // Funcion que colocará los campos del formulario principal con datos predeterminados
  limpiarFormOrdenTrabajo(){
    this.FormOrdenTrabajo.reset();
    this.FormOrdenTrabajo.patchValue({ OT_FechaCreacion : this.today });
  }

  // Funcion que va a limpiar los campos del formulario de extrusión
  limpiarFormExtrusion(){
    this.FormOrdenTrabajoExtrusion.patchValue({
      Material_Extrusion : 1,
      Formato_Extrusion : 1,
      Pigmento_Extrusion : 1,
      Ancho_Extrusion1 : 0,
      Ancho_Extrusion2 : 0,
      Ancho_Extrusion3 : 0,
      Calibre_Extrusion : 0,
      UnidadMedida_Extrusion : 'Cms',
      Tratado_Extrusion : 1,
      Peso_Extrusion : 0,
    });
  }

  // Funcion que va a limpiar los campos del formulario de impresion y rotograbado
  limpiarFormImpresion(){
    this.FormOrdenTrabajoImpresion.patchValue({
      Tipo_Impresion : 1,
      Rodillo_Impresion : 0,
      Pista_Impresion : 0,
      Tinta_Impresion1 : 'NO APLICA',
      Tinta_Impresion2 : 'NO APLICA',
      Tinta_Impresion3 : 'NO APLICA',
      Tinta_Impresion4 : 'NO APLICA',
      Tinta_Impresion5 : 'NO APLICA',
      Tinta_Impresion6 : 'NO APLICA',
      Tinta_Impresion7 : 'NO APLICA',
      Tinta_Impresion8 : 'NO APLICA',
    });
  }

  // Funcion que va a limpiar los campos del formulario de laminado
  limpiarFormLaminado(){
    this.FormOrdenTrabajoLaminado.patchValue({
      Capa_Laminado1 : 1,
      Calibre_Laminado1 : 0,
      cantidad_Laminado1 : 0,
      Capa_Laminado2 : 1,
      Calibre_Laminado2 : 0,
      cantidad_Laminado2 : 0,
      Capa_Laminado3 : 1,
      Calibre_Laminado3 : 0,
      cantidad_Laminado3 : 0,
    });
  }

  // Funcion que va a limpiar los campos del formulario de orte
  limpiarFormCorte(){
    this.FormOrdenTrabajoCorte.patchValue({
      Formato_Corte : 7,
      Ancho_Corte : 0,
      Largo_Corte : 0,
      Fuelle_Corte : 0,
      Margen_Corte : 0,
    });
  }

  // Funcion que va a limpíar los campos del formulario de sellado
  limpiarFormSellado(){
    this.FormOrdenTrabajoSellado.patchValue({
      Formato_Sellado : 7,
      Ancho_Sellado : 0,
      Largo_Sellado : 0,
      Fuelle_Sellado : 0,
      Margen_Sellado : 0,
      PesoMillar : 0,
      TipoSellado : 1,
      PrecioDia : 0,
      PrecioNoche : 0,
      CantidadPaquete : 0,
      PesoPaquete : 0,
      CantidadBulto : 0,
      PesoBulto : 0,
    });
  }

  // Funcion que va a limpiar los campos del formulario de mezclas
  limpiarFormMezclas(){
    this.FormOrdenTrabajoMezclas.patchValue({ Nombre_Mezclas : 'ALTA 1 X 1 NEGRO', });
    this.cargarCombinacionMezclas();
  }

  // Funcion que limpiará todos los campos
  limpiarCampos(){
    this.ultimaOT();
    this.pedidos();
    this.pedidosZues();
    this.limpiarFormOrdenTrabajo();
    this.limpiarFormExtrusion();
    this.limpiarFormImpresion();
    this.limpiarFormLaminado();
    this.limpiarFormCorte();
    this.limpiarFormSellado();
    this.limpiarFormMezclas();
    this.edicionOrdenTrabajo = false;
    this.checkedCyrel = false;
    this.checkedCorte = false;
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

  // Funcion que va a limpiar los campos de los formularios de cada proceso y tambien los checkbox
  limpiarProducto(){
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
    this.checkedCorte = false;
    this.checkedCyrel = false;
    this.cantidadProducto = 0;
    this.valorProducto = 0;
    this.netoKg = 0;
    this.valorKg = 0;
    this.valorOt = 0;
    this.margenKg = 0;
    this.pesoPaquete = 0;
    this.pesoBulto = 0;
  }

  //Funcion que va cargar cada uno de los componentes de la mezcla
  cargarCombinacionMezclas(){
    let simboloPorcentaje : boolean = false;
    let data : string = this.FormOrdenTrabajoMezclas.value.Nombre_Mezclas;
    simboloPorcentaje = data.toString().includes("%") ? true : false;
    if(simboloPorcentaje) data = data.replace('%', '%25')
    else data = data;

    this.mezclasService.getMezclaNombre(data).subscribe(datos_mezcla => {
      this.nroCapasOT = datos_mezcla.mezcla_NroCapas;
      setTimeout(() => {
        this.FormOrdenTrabajoMezclas.disable();
        this.FormOrdenTrabajoMezclas.get('Nombre_Mezclas').enable();
        this.FormOrdenTrabajoMezclas.get('Id_Mezcla').enable();
        this.FormOrdenTrabajoMezclas.patchValue({
          Id_Mezcla : datos_mezcla.mezcla_Id,
          Nombre_Mezclas : datos_mezcla.mezcla_Nombre,
          Chechbox_Capa1 : this.nroCapasOT,
          Chechbox_Capa2 : '',
          Chechbox_Capa3 : '',
          Proc_Capa1 : datos_mezcla.mezcla_PorcentajeCapa1,
          Proc_Capa2 : datos_mezcla.mezcla_PorcentajeCapa2,
          Proc_Capa3 : datos_mezcla.mezcla_PorcentajeCapa3,
          materialP1_Capa1 : datos_mezcla.mezMaterial_Id1xCapa1,
          PorcentajeMaterialP1_Capa1 : datos_mezcla.mezcla_PorcentajeMaterial1_Capa1,
          materialP1_Capa2 : datos_mezcla.mezMaterial_Id1xCapa2,
          PorcentajeMaterialP1_Capa2 : datos_mezcla.mezcla_PorcentajeMaterial1_Capa2,
          materialP1_Capa3 : datos_mezcla.mezMaterial_Id1xCapa3,
          PorcentajeMaterialP1_Capa3 : datos_mezcla.mezcla_PorcentajeMaterial1_Capa3,
          materialP2_Capa1 : datos_mezcla.mezMaterial_Id2xCapa1,
          PorcentajeMaterialP2_Capa1 : datos_mezcla.mezcla_PorcentajeMaterial2_Capa1,
          materialP2_Capa2 : datos_mezcla.mezMaterial_Id2xCapa2,
          PorcentajeMaterialP2_Capa2 : datos_mezcla.mezcla_PorcentajeMaterial2_Capa2,
          materialP2_Capa3 : datos_mezcla.mezMaterial_Id2xCapa3,
          PorcentajeMaterialP2_Capa3 : datos_mezcla.mezcla_PorcentajeMaterial2_Capa3,
          materialP3_Capa1 : datos_mezcla.mezMaterial_Id3xCapa1,
          PorcentajeMaterialP3_Capa1 : datos_mezcla.mezcla_PorcentajeMaterial3_Capa1,
          materialP3_Capa2 : datos_mezcla.mezMaterial_Id3xCapa2,
          PorcentajeMaterialP3_Capa2 : datos_mezcla.mezcla_PorcentajeMaterial3_Capa2,
          materialP3_Capa3 : datos_mezcla.mezMaterial_Id3xCapa3,
          PorcentajeMaterialP3_Capa3 : datos_mezcla.mezcla_PorcentajeMaterial3_Capa3,
          materialP4_Capa1 : datos_mezcla.mezMaterial_Id4xCapa1,
          PorcentajeMaterialP4_Capa1 : datos_mezcla.mezcla_PorcentajeMaterial4_Capa1,
          materialP4_Capa2 : datos_mezcla.mezMaterial_Id4xCapa2,
          PorcentajeMaterialP4_Capa2 : datos_mezcla.mezcla_PorcentajeMaterial4_Capa2,
          materialP_Capa3 : datos_mezcla.mezMaterial_Id4xCapa3,
          PorcentajeMaterialP_Capa3 : datos_mezcla.mezcla_PorcentajeMaterial4_Capa3,
          MezclaPigmentoP1_Capa1 : datos_mezcla.mezPigmto_Id1xCapa1,
          PorcentajeMezclaPigmentoP1_Capa1 : datos_mezcla.mezcla_PorcentajePigmto1_Capa1,
          MezclaPigmentoP1_Capa2 : datos_mezcla.mezPigmto_Id1xCapa2,
          PorcentajeMezclaPigmentoP1_Capa2 : datos_mezcla.mezcla_PorcentajePigmto1_Capa2,
          MezclaPigmento1_Capa3 : datos_mezcla.mezPigmto_Id1xCapa3,
          PorcentajeMezclaPigmentoP1_Capa3 :datos_mezcla.mezcla_PorcentajePigmto1_Capa3,
          MezclaPigmentoP2_Capa1 : datos_mezcla.mezPigmto_Id1xCapa1,
          PorcentajeMezclaPigmentoP2_Capa1 : datos_mezcla.mezcla_PorcentajePigmto2_Capa1,
          MezclaPigmentoP2_Capa2 : datos_mezcla.mezPigmto_Id2xCapa2,
          PorcentajeMezclaPigmentoP2_Capa2 : datos_mezcla.mezcla_PorcentajePigmto2_Capa2,
          MezclaPigmento2_Capa3 : datos_mezcla.mezPigmto_Id2xCapa3,
          PorcentajeMezclaPigmentoP2_Capa3 : datos_mezcla.mezcla_PorcentajePigmto2_Capa3,
        });
      }, 300);
    });
  }

  // Funcion que va a validar si el pedido viene de zeus
  validarPedido(){
    let nuevo = this.pedidosSinOT.filter(item => item.id_Pedido == this.FormOrdenTrabajo.value.Pedido_Id);
    !nuevo[0].zeus ? this.informacionPedido() : this.informacionPedidoZeus();
  }

  // funcion que consultará la informacion de un pedido de Zeus
  informacionPedidoZeus(){
    let pedido : number = this.FormOrdenTrabajo.value.Pedido_Id;
    this.limpiarCampos();
    let presentacion : string;
    this.pedidosZeusService.GetInfoPedido_Consecutivo(pedido).subscribe(datos => {
      for (let i = 0; i < datos.length; i++) {
        if (datos[i].presentacion == "UND") presentacion = 'Und';
        else if (datos[i].presentacion == 'KLS') presentacion = 'Kg';
        else if (datos[i].presentacion == 'PAQ') presentacion = 'Paquete';
        this.sedeClienteService.GetSedeCliente(datos[i].id_Cliente, datos[i].ciudad, datos[i].direccion_Cliente).subscribe(datosSede => {
          for (let j = 0; j < datosSede.length; j++) {
            this.FormOrdenTrabajo.reset();
            this.FormOrdenTrabajo.patchValue({
              Pedido_Id: pedido,
              Nombre_Vendedor: datos[i].vendedor,
              OT_FechaCreacion: this.today,
              Id_Sede_Cliente : datosSede[j].sedeCli_Id,
              ID_Cliente: datosSede[j].cli_Id,
              Nombre_Cliente: datos[i].cliente,
              Ciudad_SedeCliente: datos[i].ciudad,
              Direccion_SedeCliente : datos[i].direccion_Cliente,
              OT_Estado : datos[i].estado == 'Parcialmente Satisfecho' ? datos[i].estado = 12 : datos[i].estado = 11,
              OT_Observacion : datos[i].observacion,
            });
            break;
          }
        });
        this.productoService.GetInfoProducto_Prod_Presentacion(datos[i].id_Producto, presentacion).subscribe(datos_producto => {
          for (let j = 0; j < datos_producto.length; j++) {
            let productoExt : any = {
              Id : datos_producto[j].produ.prod_Id,
              Nombre : datos_producto[j].produ.prod_Nombre,
              Ancho : datos_producto[j].produ.prod_Ancho,
              Fuelle : datos_producto[j].produ.prod_Fuelle,
              Largo : datos_producto[j].produ.prod_Largo,
              Cal : datos_producto[j].produ.prod_Calibre,
              Und : presentacion,
              Peso_Producto : datos_producto[j].produ.prod_Peso,
              PesoMillar : datos_producto[j].produ.prod_Peso_Millar,
              Tipo : datos_producto[j].tipo_Producto,
              Material : datos_producto[j].material,
              Pigmento : datos_producto[j].pigmento,
              CantPaquete : datos_producto[j].produ.prod_CantBolsasPaquete,
              CantBulto : datos_producto[j].produ.prod_CantBolsasBulto,
              Cant : parseFloat(datos[i].cant_Pendiente),
              Cant_Inicial : parseFloat(datos[i].cant_Pendiente),
              TipoSellado : datos_producto[i].tipo_Sellado,
              UndCant : presentacion,
              PrecioUnd : datos[i].precioUnidad,
              SubTotal : datos[i].costo_Cant_Pendiente,
              FechaEntrega : datos[i].fecha_Entrega.replace('T00:00:00', ''),
            }
            this.ArrayProducto.push(productoExt);
          }
        });
      }
    });
  }

  // funcion que consultará la informacion del pedido apra crear la orden de trabajo
  informacionPedido(){
    let pedido : number = this.FormOrdenTrabajo.value.Pedido_Id;
    this.ArrayProducto = [];
    this.limpiarCampos();
    this.pedidoExternoService.GetInfoPedido(pedido).subscribe(datos => {
      for (let i = 0; i < datos.length; i++) {
        this.FormOrdenTrabajo.reset();
        this.FormOrdenTrabajo.patchValue({
          Pedido_Id: pedido,
          Nombre_Vendedor: datos[i].vendedor,
          OT_FechaCreacion: this.today,
          Id_Sede_Cliente : datos[i].id_Sede_Cliente,
          ID_Cliente: datos[i].id_Cliente,
          Nombre_Cliente: datos[i].cliente,
          Ciudad_SedeCliente: datos[i].ciudad,
          Direccion_SedeCliente : datos[i].direccion,
          OT_Estado : datos[i].estado,
          OT_Observacion : datos[i].observacion,
        });

        let productoExt : any = {
          Id : datos[i].id_Producto,
          Nombre : datos[i].producto,
          Ancho : datos[i].ancho_Producto,
          Fuelle : datos[i].fuelle_Producto,
          Largo : datos[i].largo_Producto,
          Cal : datos[i].calibre_Producto,
          Und : datos[i].und_ACFL,
          Peso_Producto : datos[i].peso_Producto,
          PesoMillar : datos[i].peso_Millar,
          Tipo : datos[i].tipo_Producto,
          Material : datos[i].material_Producto,
          Pigmento : datos[i].pigmento_Producto,
          CantPaquete : datos[i].cant_Paquete,
          CantBulto : datos[i].cant_Bulto,
          Cant : datos[i].cantidad_Restante,
          Cant_Inicial : datos[i].cantidad_Pedida,
          UndCant : datos[i].und_Pedido,
          TipoSellado : datos[i].tipo_Sellado,
          PrecioUnd : datos[i].precio_Producto,
          SubTotal : datos[i].subTotal_Producto,
          FechaEntrega : datos[i].fecha_Entrega.replace('T00:00:00', ''),
        }
        this.ArrayProducto.push(productoExt);
      }
    });
  }

  // Funcion que va a calcular el costo total de los productos que tiene el pedido
  calcularCostoPedido() : number{
    let total : number = 0;
    for (let i = 0; i < this.ArrayProducto.length; i++) {
      total += this.ArrayProducto[i].SubTotal;
    }
    return total;
  }

  // Funcion que va buscar, almacenar y mostrar la información de la ultima orden de trabajo para un producto con una presentacion especifica
  consultarInfoProducto(data : any){
    this.informacionSeleccionada = data;
    this.limpiarProducto();
    this.producto = data.Id;
    this.presentacionProducto = data.UndCant;
    this.ordenTrabajoService.GetInfoUltOT(data.Id, data.UndCant).subscribe(datos_Ot => {
      this.FormOrdenTrabajo.patchValue({
        OT_FechaEntrega: data.FechaEntrega,
        OT_Observacion : datos_Ot.observacion,
        Margen : datos_Ot.margen,
      });
      this.FormOrdenTrabajoExtrusion.patchValue({
        Material_Extrusion : datos_Ot.id_Material,
        Formato_Extrusion : datos_Ot.id_Formato_Extrusion,
        Pigmento_Extrusion : datos_Ot.id_Pigmento_Extrusion,
        Ancho_Extrusion1 : datos_Ot.ancho1_Extrusion,
        Ancho_Extrusion2 : datos_Ot.ancho2_Extrusion,
        Ancho_Extrusion3 : datos_Ot.ancho3_Extrusion,
        Calibre_Extrusion : datos_Ot.calibre_Extrusion,
        UnidadMedida_Extrusion : datos_Ot.und_Extrusion,
        Tratado_Extrusion : datos_Ot.id_Tratado,
        Peso_Extrusion : datos_Ot.peso_Extrusion,
      });
      this.FormOrdenTrabajoImpresion.patchValue({
        Tipo_Impresion : datos_Ot.id_Tipo_Imptesion,
        Rodillo_Impresion : datos_Ot.rodillo,
        Pista_Impresion : datos_Ot.pista,
        Tinta_Impresion1 : datos_Ot.tinta1,
        Tinta_Impresion2 : datos_Ot.tinta2,
        Tinta_Impresion3 : datos_Ot.tinta3,
        Tinta_Impresion4 : datos_Ot.tinta4,
        Tinta_Impresion5 : datos_Ot.tinta5,
        Tinta_Impresion6 : datos_Ot.tinta6,
        Tinta_Impresion7 : datos_Ot.tinta7,
        Tinta_Impresion8 : datos_Ot.tinta8,
      });
      this.FormOrdenTrabajoLaminado.patchValue({
        Capa_Laminado1 : datos_Ot.id_Capa1,
        Calibre_Laminado1 : datos_Ot.calibre_Laminado_Capa1,
        cantidad_Laminado1 : datos_Ot.cantidad_Laminado_Capa1,
        Capa_Laminado2 : datos_Ot.id_Capa2,
        Calibre_Laminado2 : datos_Ot.calibre_Laminado_Capa2,
        cantidad_Laminado2 : datos_Ot.cantidad_Laminado_Capa2,
        Capa_Laminado3 : datos_Ot.id_Capa3,
        Calibre_Laminado3 : datos_Ot.calibre_Laminado_Capa3,
        cantidad_Laminado3 : datos_Ot.cantidad_Laminado_Capa3,
      });
      this.FormOrdenTrabajoCorte.patchValue({
        Formato_Corte : datos_Ot.formato_Producto,
        Ancho_Corte : datos_Ot.selladoCorte_Ancho,
        Largo_Corte : datos_Ot.selladoCorte_Largo,
        Fuelle_Corte : datos_Ot.selladoCorte_Fuelle,
        Margen_Corte : datos_Ot.margen,
      });
      this.FormOrdenTrabajoSellado.patchValue({
        Formato_Sellado : datos_Ot.formato_Producto,
        Ancho_Sellado : datos_Ot.selladoCorte_Ancho,
        Largo_Sellado : datos_Ot.selladoCorte_Largo,
        Fuelle_Sellado : datos_Ot.selladoCorte_Fuelle,
        Margen_Sellado : datos_Ot.margen,
        PesoMillar : datos_Ot.prod_Peso_Millar,
        TipoSellado : datos_Ot.tpSellados_Nombre,
        CantidadPaquete : datos_Ot.selladoCorte_CantBolsasPaquete,
        CantidadBulto : datos_Ot.selladoCorte_CantBolsasBulto,
        PrecioDia : datos_Ot.selladoCorte_PrecioSelladoDia,
        PrecioNoche : datos_Ot.selladoCorte_PrecioSelladoNoche,
      });
      this.checkedCyrel = datos_Ot.cyrel;
      this.extrusion = datos_Ot.extrusion;
      this.impresion = datos_Ot.impresion;
      this.rotograbado = datos_Ot.rotograbado;
      this.laminado = datos_Ot.laminado;
      this.checkedCorte = datos_Ot.corte;
      this.sellado = datos_Ot.sellado;
      setTimeout(() => this.calcularDatosOt(data), 500);
      this.FormOrdenTrabajoMezclas.patchValue({ Nombre_Mezclas : datos_Ot.mezcla_Id, });
      this.cargarCombinacionMezclas();
    }, () => {
      let presentacion : string = data.UndCant, impresion : any, laminadoCapa1 : any, laminadoCapa2 : any, laminadoCapa3 : any;
      if (presentacion == 'Kg') presentacion = 'Kilo';
      else if (presentacion == 'Und') presentacion = 'Unidad';
      this.bagProService.srvObtenerListaClienteOT_Item_Presentacion(data.Id, presentacion).subscribe(datos_Ot => {
        for (const itemOt of datos_Ot) {
          this.FormOrdenTrabajo.patchValue({
            OT_FechaEntrega: data.FechaEntrega,
            OT_Observacion : itemOt.observacion,
            Margen : itemOt.ptMargen,
          });

          itemOt.extrusion.trim() == '1' ? this.extrusion = true : this.extrusion = false;
          itemOt.impresion.trim() == '1' ? this.impresion = true : this.impresion = false;
          itemOt.lamiando.trim() == '1' ? this.rotograbado = true : this.rotograbado = false;
          itemOt.laminado2.trim() == '1' ? this.laminado = true : this.laminado = false;
          itemOt.pterminado.trim() == '1' ? this.sellado = true : this.sellado = false;
          itemOt.corte.trim() == '1' ? this.checkedCorte = true : this.checkedCorte = false;
          itemOt.cyrel.trim() == '1' ? this.checkedCyrel = true : this.checkedCyrel = false;

          this.FormOrdenTrabajoExtrusion.patchValue({
            Material_Extrusion : parseInt(itemOt.extMaterial.trim()),
            Formato_Extrusion : parseInt(itemOt.extFormato.trim()),
            Pigmento_Extrusion : parseInt(itemOt.extPigmento.trim()),
            Ancho_Extrusion1 : itemOt.extAcho1,
            Ancho_Extrusion2 : itemOt.extAcho2,
            Ancho_Extrusion3 : itemOt.extAcho3,
            Calibre_Extrusion : itemOt.extCalibre,
            UnidadMedida_Extrusion : itemOt.extUnidadesNom.trim(),
            Tratado_Extrusion : parseInt(itemOt.extTratado.trim()),
            Peso_Extrusion : itemOt.extPeso,
          });

          if (itemOt.impFlexoNom.trim() != 'FLEXOGRAFIA' && itemOt.impFlexoNom.trim() != 'ROTOGRABADO') impresion = 1;
          else if (itemOt.impFlexoNom.trim() == 'FLEXOGRAFIA') impresion = 2;
          else if (itemOt.impFlexoNom.trim() == 'ROTOGRABADO') impresion = 3;

          let tinta1 : any = itemOt.impTinta1Nom.trim();
          let tinta2 : any = itemOt.impTinta2Nom.trim();
          let tinta3 : any = itemOt.impTinta3Nom.trim();
          let tinta4 : any = itemOt.impTinta4Nom.trim();
          let tinta5 : any = itemOt.impTinta5Nom.trim();
          let tinta6 : any = itemOt.impTinta6Nom.trim();
          let tinta7 : any = itemOt.impTinta7Nom.trim();
          let tinta8 : any = itemOt.impTinta8Nom.trim();

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
                Tipo_Impresion : impresion,
                Rodillo_Impresion : itemOt.impRodillo,
                Pista_Impresion : itemOt.impPista,
                Tinta_Impresion1 : datos_impresion[j].tinta_Nombre1,
                Tinta_Impresion2 : datos_impresion[j].tinta_Nombre2,
                Tinta_Impresion3 : datos_impresion[j].tinta_Nombre3,
                Tinta_Impresion4 : datos_impresion[j].tinta_Nombre4,
                Tinta_Impresion5 : datos_impresion[j].tinta_Nombre5,
                Tinta_Impresion6 : datos_impresion[j].tinta_Nombre6,
                Tinta_Impresion7 : datos_impresion[j].tinta_Nombre7,
                Tinta_Impresion8 : datos_impresion[j].tinta_Nombre8,
              });
            }
          });

          laminadoCapa1 = itemOt.lamCapa1.trim();
          laminadoCapa2 = itemOt.lamCapa2.trim();
          laminadoCapa3 = itemOt.lamCapa3.trim();

          if (laminadoCapa1 == '1') laminadoCapa1 = 1;
          if (laminadoCapa2 == '1') laminadoCapa2 = 1;
          if (laminadoCapa3 == '1') laminadoCapa3 = 1;

          this.FormOrdenTrabajoLaminado.patchValue({
            Capa_Laminado1 : parseInt(laminadoCapa1),
            Calibre_Laminado1 : itemOt.lamCalibre1,
            cantidad_Laminado1 : itemOt.cant1,
            Capa_Laminado2 : parseInt(laminadoCapa2),
            Calibre_Laminado2 : itemOt.lamCalibre2,
            cantidad_Laminado2 : itemOt.cant2,
            Capa_Laminado3 : parseInt(laminadoCapa3),
            Calibre_Laminado3 : itemOt.lamCalibre3,
            cantidad_Laminado3 : itemOt.cant3,
          });
          this.FormOrdenTrabajoCorte.patchValue({
            Formato_Corte : data.Tipo,
            Ancho_Corte : data.Ancho,
            Largo_Corte : data.Largo,
            Fuelle_Corte : data.Fuelle,
            Margen_Corte : itemOt.ptMargen,
          });
          this.FormOrdenTrabajoSellado.patchValue({
            Formato_Sellado : data.Tipo,
            Ancho_Sellado : data.Ancho,
            Largo_Sellado : data.Largo,
            Fuelle_Sellado : data.Fuelle,
            Margen_Sellado : itemOt.ptMargen,
            PesoMillar : data.PesoMillar,
            TipoSellado : data.TipoSellado,
            PrecioDia : itemOt.dia,
            PrecioNoche : itemOt.noche,
            CantidadPaquete : data.CantPaquete,
            PesoPaquete : itemOt.pesopaquete == '' ? itemOt.pesopaquete = 0 : itemOt.pesopaquete = parseFloat(itemOt.pesopaquete),
            CantidadBulto : data.CantBulto,
            PesoBulto : itemOt.pesoBulto == '' ? itemOt.pesoBulto = 0 : itemOt.pesoBulto = parseFloat(itemOt.pesoBulto),
          });
          setTimeout(() => { this.calcularDatosOt(data); }, 1000);
          this.FormOrdenTrabajoMezclas.value.Nombre_Mezclas = itemOt.mezModoNom;
          this.cargarCombinacionMezclas();
        }
      }, () => this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `No se encuentra una Orden de Trabajo anterior para el producto ${data.Id} y presentación ${presentacion}`));
    });
  }

  // Funcion que va a calcular los datos de la ot
  calcularDatosOt(data : any){
    let margen_Adicional = this.FormOrdenTrabajoSellado.value.Margen_Sellado | this.FormOrdenTrabajoCorte.value.Margen_Corte;
    if (this.checkedCorte) margen_Adicional = this.FormOrdenTrabajoCorte.value.Margen_Corte;
    if (this.sellado) margen_Adicional = this.FormOrdenTrabajoSellado.value.Margen_Sellado;
    this.FormOrdenTrabajo.patchValue({ Margen : margen_Adicional });
    if (this.FormOrdenTrabajoExtrusion.value.UnidadMedida_Extrusion == 'Cms' || this.FormOrdenTrabajoExtrusion.value.UnidadMedida_Extrusion == 'Plgs') {
      let ancho1 : number = this.FormOrdenTrabajoExtrusion.value.Ancho_Extrusion1;
      let ancho2 : number = this.FormOrdenTrabajoExtrusion.value.Ancho_Extrusion2;
      let ancho3 : number = this.FormOrdenTrabajoExtrusion.value.Ancho_Extrusion3;
      let calibre : number = this.FormOrdenTrabajoExtrusion.value.Calibre_Extrusion;
      let material : number = this.FormOrdenTrabajoExtrusion.value.Material_Extrusion;
      let fact : number = 0;
      let largoUnd : number = 0;
      //Calcular Peso de Extrusion
      if (this.FormOrdenTrabajoExtrusion.value.UnidadMedida_Extrusion == 'Cms') {
        largoUnd = 100;
        if (material == 3) fact = 0.0048;
        else fact = 0.00468;
        this.FormOrdenTrabajoExtrusion.patchValue({ Peso_Extrusion : ((ancho1 + ancho2 + ancho3) * calibre * fact * largoUnd), });
      } else {
        largoUnd = 39.3701;
        if (material == 3) fact = 0.0317;
        else fact = 0.0302;
        this.FormOrdenTrabajoExtrusion.patchValue({ Peso_Extrusion : ((ancho1 + ancho2 + ancho3) * calibre * fact * largoUnd), });
      }
      //Calcular Peso Producto y Peso Millar
      for (let i = 0; i < this.ArrayProducto.length; i++) {
        if (this.ArrayProducto[i].Id == data.Id && this.ArrayProducto[i].UndCant == data.UndCant) {
          //Peso Producto
          if (this.FormOrdenTrabajoExtrusion.value.UnidadMedida_Extrusion == 'Cms'){
            if (material == 3) fact = 0.0048;
            else fact = 0.00468;
            this.ArrayProducto[i].Peso_Producto = (this.ArrayProducto[i].Ancho) * (this.ArrayProducto[i].Largo + this.ArrayProducto[i].Fuelle) * (this.ArrayProducto[i].Cal) * fact / 1000;
          } else {
            if (material == 3) fact = 0.0317;
            else fact = 0.0302;
            this.ArrayProducto[i].Peso_Producto = (this.ArrayProducto[i].Ancho) * (this.ArrayProducto[i].Largo + this.ArrayProducto[i].Fuelle) * (this.ArrayProducto[i].Cal) * fact / 1000;
          }
          this.pesoProducto = this.ArrayProducto[i].Peso_Producto;
          //Peso Millar
          this.ArrayProducto[i].PesoMillar = this.ArrayProducto[i].Peso_Producto * 1000;
          if (this.ArrayProducto[i].Tipo == 'Laminado' || this.ArrayProducto[i].Tipo == 'Hoja') this.ArrayProducto[i].PesoMillar / 2;

          //Calcular datos de la ot
          if (data.UndCant == 'Kg') {
            this.cantidadProducto = data.Cant;
            this.margenKg = margen_Adicional * (data.Cant / 100);
            this.netoKg = data.Cant + ((data.Cant * margen_Adicional) / 100);
            this.valorKg = data.PrecioUnd;
            this.valorProducto = data.PrecioUnd;
            this.valorOt = data.Cant * this.valorProducto;
          } else if (data.UndCant == 'Paquete') {
            this.cantidadProducto = data.Cant;
            this.valorProducto = data.PrecioUnd;
            this.margenKg = margen_Adicional * (((data.Cant * data.CantPaquete * this.ArrayProducto[i].PesoMillar) / 1000) / 100);
            this.netoKg = ((1 + (margen_Adicional / 100)) * ((this.ArrayProducto[i].PesoMillar / 1000) * (data.Cant * data.CantPaquete)));
            this.valorOt = data.Cant * data.PrecioUnd;
            if (data.PesoMillar > 0 && data.CantPaquete > 0) this.pesoPaquete = this.ArrayProducto[i].PesoMillar * (data.CantPaquete / 1000);
            if (data.CantPaquete > 0) this.pesoBulto = this.pesoPaquete * data.CantBulto;
            if (data.CantPaquete == 0) this.valorKg = 0;
            else {
              if (data.CantPaquete > 0) this.valorKg = data.PrecioUnd / this.pesoPaquete;
              else this.valorKg = 0;
            }
          } else if (data.UndCant == 'Und') {
            this.cantidadProducto = data.Cant;
            this.valorProducto = data.PrecioUnd;
            this.valorOt = this.cantidadProducto * this.valorProducto;
            this.margenKg = (margen_Adicional * ((data.Cant * this.ArrayProducto[i].PesoMillar) / 1000)) / 100;
            this.netoKg = ((1 + (margen_Adicional / 100)) * ((this.ArrayProducto[i].PesoMillar / 1000) * data.Cant));
            if (this.ArrayProducto[i].Peso_Producto > 0){
              if (this.valorOt == 0) this.valorOt = 1;
              if ((data.Cant * this.ArrayProducto[i].PesoMillar) / 1000 == 0) this.valorKg = 0;
              else this.valorKg = this.valorOt / ((data.Cant * this.ArrayProducto[i].PesoMillar) / 1000);
            } else this.valorOt = 0;
          } else if (data.UndCant == 'Rollo') {
          }
        }
      }
    } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `¡Debe elegir una unidad de medida para extrusión!`);
  }

  // Funcion que se se ejecurá cuando hayan deseleccionado un producto
  productoDeseleccionado(){
    this.limpiarFormExtrusion();
    this.limpiarFormImpresion();
    this.limpiarFormLaminado();
    this.limpiarFormMezclas();
    this.limpiarFormCorte();
    this.limpiarFormSellado();
    this.producto = 0;
    this.idMezclaSeleccionada = 0;
    this.nroCapas = 0;
    this.nroCapasOT = 0;
    this.checkedCyrel = false;
    this.checkedCorte = false;
    this.checkedCapa1 = false;
    this.checkedCapa2 = false;
    this.checkedCapa3 = false;
    this.presentacionProducto = '';
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

  // Función que va a validar que la información este correcta
  validarDatos(){
    if (this.FormOrdenTrabajo.valid) {
      if (!this.extrusion) this.limpiarFormExtrusion();
      if (!this.impresion && !this.rotograbado) this.limpiarFormImpresion();
      if (!this.laminado) this.limpiarFormLaminado();
      if (!this.checkedCorte) this.limpiarFormCorte();
      if (!this.sellado) this.limpiarFormSellado();
      if (!this.FormOrdenTrabajoMezclas.valid) this.limpiarFormMezclas();

      setTimeout(() => {
        if (this.FormOrdenTrabajoExtrusion.valid) {
          if (this.FormOrdenTrabajoImpresion.valid) {
            if (this.FormOrdenTrabajoLaminado.valid) {
              if (this.FormOrdenTrabajoCorte.valid) {
                if (this.FormOrdenTrabajoSellado.valid) {
                  if (this.FormOrdenTrabajoMezclas.valid) this.guardarOt();
                  else this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡El formulario de Mezclas tiene campos vacios!`);
                } else this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡El formulario de Sellado tiene campos vacios!`);
              } else this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡El formulario de Corte tiene campos vacios!`);
            } else this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡EL formulario de Laminado tiene campos vacios!`);
          } else this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡El formulario de Impresion tiene campos vacios!`);
        } else this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡EL formulario de Extrusion tiene campos vacios!`);
      }, 700);
    } else this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡Hay campos del formulario vacios!`);
  }

  //Funcion que va a guardar la información de la orden de trabajo
  guardarOt(){
    let fechaEntrega : any = this.FormOrdenTrabajo.value.OT_FechaEntrega;
    if (fechaEntrega == null) this.FormOrdenTrabajo.value.OT_FechaEntrega = this.today;

    this.cargando = true;
    let errorExt : boolean = false, errorImp : boolean = false, errorLam : boolean = false, errorSelCor : boolean = false;
    let infoOT : any = {
      SedeCli_Id : this.FormOrdenTrabajo.value.Id_Sede_Cliente,
      Prod_Id : this.producto,
      Ot_PesoNetoKg : this.netoKg,
      Ot_ValorOT : this.valorOt,
      Ot_MargenAdicional : this.FormOrdenTrabajo.value.Margen,
      Ot_ValorKg : this.valorKg,
      Ot_ValorUnidad : this.valorProducto,
      Ot_FechaCreacion : this.today,
      Estado_Id : 15,
      Usua_Id : this.storage_Id,
      PedExt_Id : parseInt(this.FormOrdenTrabajo.value.Pedido_Id),
      Ot_Observacion : this.FormOrdenTrabajo.value.OT_Observacion,
      Ot_Cyrel : this.checkedCyrel,
      Ot_Corte : this.checkedCorte,
      Mezcla_Id : this.FormOrdenTrabajoMezclas.value.Id_Mezcla,
      UndMed_Id : this.presentacionProducto,
      Ot_Hora : moment().format('H:mm:ss'),
      Extrusion : this.extrusion,
      Impresion : this.impresion,
      Laminado : this.laminado,
      Rotograbado : this.rotograbado,
      Sellado : this.sellado,
      Ot_CantidadPedida : this.cantidadProducto,
    }
    this.ordenTrabajoService.srvGuardar(infoOT).subscribe(datos_ot => {
      errorExt = this.guardarOt_Extrusion(datos_ot.ot_Id);
      errorImp = this.guardarOt_Impresion(datos_ot.ot_Id);
      errorLam = this.guardarOt_Laminado(datos_ot.ot_Id);
      errorSelCor = this.guardarOt_Sellado_Corte(datos_ot.ot_Id);
      setTimeout(() => {
        if (!errorExt && !errorImp && !errorLam && !errorSelCor) {
          this.mensajeService.mensajeConfirmacion('¡Orden de Trabajo Creada!', `Se ha creado la de trabajo N°${datos_ot.ot_Id}`);
          this.cambiarEstadoCliente(this.FormOrdenTrabajo.value.ID_Cliente);
          this.cambiarEstadoProducto(this.producto);
          this.pdfOrdenTrabajo(datos_ot.ot_Id);
          this.limpiarCampos();
        }
      }, 2000);
    }, error => {
      this.mensajeService.mensajeError(`¡No fue posible crear la Orden de Trabajo!`, error.error);
      this.cargando = false;
    });
  }

  //Funcion que va a guardar la informacion de extrusion de la orden de trabajo
  guardarOt_Extrusion(ordenTrabajo : number) : boolean{
    let infoOTExt : any = {
      Ot_Id : ordenTrabajo,
      Material_Id : this.FormOrdenTrabajoExtrusion.value.Material_Extrusion,
      Formato_Id : this.FormOrdenTrabajoExtrusion.value.Formato_Extrusion,
      Pigmt_Id : this.FormOrdenTrabajoExtrusion.value.Pigmento_Extrusion,
      Extrusion_Calibre : this.FormOrdenTrabajoExtrusion.value.Calibre_Extrusion,
      Extrusion_Ancho1 : this.FormOrdenTrabajoExtrusion.value.Ancho_Extrusion1,
      Extrusion_Ancho2 : this.FormOrdenTrabajoExtrusion.value.Ancho_Extrusion2,
      Extrusion_Ancho3 : this.FormOrdenTrabajoExtrusion.value.Ancho_Extrusion3,
      UndMed_Id : this.FormOrdenTrabajoExtrusion.value.UnidadMedida_Extrusion,
      Tratado_Id : this.FormOrdenTrabajoExtrusion.value.Tratado_Extrusion,
      Extrusion_Peso : this.FormOrdenTrabajoExtrusion.value.Peso_Extrusion,
    }
    this.otExtrusionServie.srvGuardar(infoOTExt).subscribe(() => { }, error => {
      this.mensajeService.mensajeError(`¡No se guardó información de la OT en el área de 'Extrusión'!`, error.error);
      return true;
    });
    return false;
  }

  //Funcion que va a guardar la informacion de impresion de la orden de trabajo
  guardarOt_Impresion(ordenTrabajo : number) : boolean {
    let rodilloImpresion : any = this.FormOrdenTrabajoImpresion.value.Rodillo_Impresion;
    let pistaImpresion : any = this.FormOrdenTrabajoImpresion.value.Pista_Impresion;
    let tinta1Impresion : any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion1;
    let tinta2Impresion : any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion2;
    let tinta3Impresion : any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion3;
    let tinta4Impresion : any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion4;
    let tinta5Impresion : any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion5;
    let tinta6Impresion : any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion6;
    let tinta7Impresion : any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion7;
    let tinta8Impresion : any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion8;
    this.servicioTintas.srvObtenerListaConsultaImpresion(tinta1Impresion, tinta2Impresion, tinta3Impresion, tinta4Impresion, tinta5Impresion, tinta6Impresion, tinta7Impresion, tinta8Impresion).subscribe(datos_impresion => {
      for (let j = 0; j < datos_impresion.length; j++) {
        let infoOTImp : any = {
          Ot_Id : ordenTrabajo,
          TpImpresion_Id : this.FormOrdenTrabajoImpresion.value.Tipo_Impresion,
          Rodillo_Id : rodilloImpresion,
          Pista_Id : pistaImpresion,
          Tinta1_Id : datos_impresion[j].tinta_Id1,
          Tinta2_Id : datos_impresion[j].tinta_Id2,
          Tinta3_Id : datos_impresion[j].tinta_Id3,
          Tinta4_Id : datos_impresion[j].tinta_Id4,
          Tinta5_Id : datos_impresion[j].tinta_Id5,
          Tinta6_Id : datos_impresion[j].tinta_Id6,
          Tinta7_Id : datos_impresion[j].tinta_Id7,
          Tinta8_Id : datos_impresion[j].tinta_Id8,
        }
        this.otImpresionService.srvGuardar(infoOTImp).subscribe(() => { }, error => {
          this.mensajeService.mensajeError(`¡No se guardó información de la OT en el área de 'Impresión' y 'Rotograbado'!`, error.error);
          return true;
        });
      }
    });
    return false;
  }

  //Funcion que va a guardar la informacion de laminado de la orden de trabajo
  guardarOt_Laminado(ordenTrabajo : number) : boolean {
    let infoOTLam : any = {
      OT_Id : ordenTrabajo,
      Capa_Id1 : this.FormOrdenTrabajoLaminado.value.Capa_Laminado1,
      Capa_Id2 : this.FormOrdenTrabajoLaminado.value.Capa_Laminado2,
      Capa_Id3 : this.FormOrdenTrabajoLaminado.value.Capa_Laminado3,
      LamCapa_Calibre1 : this.FormOrdenTrabajoLaminado.value.Calibre_Laminado1,
      LamCapa_Calibre2 : this.FormOrdenTrabajoLaminado.value.Calibre_Laminado2,
      LamCapa_Calibre3 : this.FormOrdenTrabajoLaminado.value.Calibre_Laminado3,
      LamCapa_Cantidad1 : this.FormOrdenTrabajoLaminado.value.cantidad_Laminado1,
      LamCapa_Cantidad2 : this.FormOrdenTrabajoLaminado.value.cantidad_Laminado2,
      LamCapa_Cantidad3 : this.FormOrdenTrabajoLaminado.value.cantidad_Laminado3,
    }
    this.otLaminadoService.srvGuardar(infoOTLam).subscribe(() => { }, error => {
      this.mensajeService.mensajeError(`¡No se guardó información de la OT en el área de 'Laminado'!`, error.error);
      return true;
    });
    return false;
  }

  // Funcion que va a guardar la informacion de la orden de trabajo para sellado y/o corte
  guardarOt_Sellado_Corte(ordenTrabajo : number) : boolean {
    let tipoSellado : number = this.FormOrdenTrabajoSellado.value.TipoSellado, formato : number = this.FormOrdenTrabajoSellado.value.Formato_Sellado;
    this.otSelladoCorteService.getTipoSellado_Formato(tipoSellado, formato).subscribe(datos => {
      let info : any = {
        Ot_Id : ordenTrabajo,
        Corte :  this.checkedCorte,
        Sellado :  this.sellado,
        Formato_Id : datos.tpProd_Id,
        SelladoCorte_Ancho : this.FormOrdenTrabajoSellado.value.Ancho_Sellado,
        SelladoCorte_Largo : this.FormOrdenTrabajoSellado.value.Largo_Sellado,
        SelladoCorte_Fuelle : this.FormOrdenTrabajoSellado.value.Fuelle_Sellado,
        SelladoCorte_PesoMillar : this.FormOrdenTrabajoSellado.value.PesoMillar,
        TpSellado_Id : datos.tpSellado_Id,
        SelladoCorte_PrecioSelladoDia : this.FormOrdenTrabajoSellado.value.PrecioDia,
        SelladoCorte_PrecioSelladoNoche : this.FormOrdenTrabajoSellado.value.PrecioNoche,
        SelladoCorte_CantBolsasPaquete : this.FormOrdenTrabajoSellado.value.CantidadPaquete,
        SelladoCorte_CantBolsasBulto : this.FormOrdenTrabajoSellado.value.CantidadBulto,
        SelladoCorte_PesoPaquete : this.FormOrdenTrabajoSellado.value.PesoPaquete,
        SelladoCorte_PesoBulto : this.FormOrdenTrabajoSellado.value.PesoBulto,
        SelladoCorte_PesoProducto : this.pesoProducto,
      }
      this.otSelladoCorteService.post(info).subscribe(() => { }, error => {
        this.mensajeService.mensajeError(`¡No se guardó información de la OT en el área de 'Sellado' o 'Corte'!`, error.error);
        return true;
      });
    }, error => this.mensajeService.mensajeError(`¡No se pudo obtener informacón del Formato y Tipo de Sellado Selecionados para el área de Sellado!`, error.error));
    return false;
  }

  //Funcion que va a cambiar el estado de un producto a "Activo"
  cambiarEstadoProducto(producto : number){
    this.productoService.srvObtenerListaPorIdProducto(producto).subscribe(datos => {
      for (let i = 0; i < datos.length; i++) {
        let info : any = {
          Prod_Id : producto,
          Prod_Nombre : datos[i].prod_Nombre,
          Prod_Descripcion : datos[i].prod_Descripcion,
          TpProd_Id : datos[i].tpProd_Id,
          Prod_Peso : datos[i].prod_Peso,
          Prod_Peso_Millar : datos[i].prod_Peso_Millar,
          UndMedPeso : datos[i].undMedPeso,
          Prod_Fuelle : datos[i].prod_Fuelle,
          Prod_Ancho : datos[i].prod_Ancho,
          Prod_Calibre : datos[i].prod_Calibre,
          UndMedACF : datos[i].undMedACF,
          Estado_Id : 10,
          Prod_Largo : datos[i].prod_Largo,
          Pigmt_Id : datos[i].pigmt_Id,
          Material_Id : datos[i].material_Id,
          Prod_CantBolsasBulto : datos[i].prod_CantBolsasBulto,
          Prod_CantBolsasPaquete : datos[i].prod_CantBolsasPaquete,
          TpSellado_Id : datos[i].tpSellado_Id,
          Prod_Fecha : datos[i].prod_Fecha,
          Prod_Hora : datos[i].prod_Hora,
          Prod_PrecioDia_Sellado : 0,
          Prod_PrecioNoche_Sellado : 0,
          Prod_Peso_Paquete : 0,
          Prod_Peso_Bulto : 0,
        }
        this.productoService.PutEstadoProducto(producto, info).subscribe(() => { }, error => {
          this.mensajeService.mensajeError(`¡No fue posible actualizar el estado del producto ${producto}!`, error.error);
        });
      }
    }, error => this.mensajeService.mensajeError(`¡El producto ${producto} no se ha encontrado!`, error.error));
  }

  // Funcion que va a cambiar el estado de un cliente a "Activo"
  cambiarEstadoCliente(cliente : number){
    this.clienteServise.srvObtenerListaPorId(cliente).subscribe(datos_cliente => {
      let info : any = {
        Cli_Id : datos_cliente.cli_Id,
        TipoIdentificacion_Id : datos_cliente.tipoIdentificacion_Id,
        Cli_Nombre : datos_cliente.cli_Nombre,
        Cli_Telefono : datos_cliente.cli_Telefono,
        Cli_Email : datos_cliente.cli_Email,
        TPCli_Id : datos_cliente.tPCLi_Id,
        usua_Id : datos_cliente.usua_Id,
        Estado_Id : 1,
        Cli_Fecha : datos_cliente.cli_Fecha,
        Cli_Hora : datos_cliente.cli_Hora,
      }
      this.clienteServise.PutEstadoCliente(cliente, info).subscribe(() => { }, error => this.mensajeService.mensajeError(`No fue posible actualizar el estado del cliente con el Id ${cliente}`, error.error));
    }, error => this.mensajeService.mensajeError(`El cliente con el Id ${cliente} no se ha encontrado!`, error.error));
  }

  // Funcion que creará el PDF de la Orden de trabajo
  pdfOrdenTrabajo(ot : number = this.FormOrdenTrabajo.value.OT_Id){
    let usuario : string = this.AppComponent.storage_Nombre;
    this.ordenTrabajoService.srvObtenerListaPdfOTInsertada(ot).subscribe(datos_ot => {
      for (let i = 0; i < datos_ot.length; i++) {
        const pdfDefinicion : any = {
          info: { title: `${datos_ot[i].numero_Orden}` },
          pageSize: { width: 630, height: 760 },
          footer: function(currentPage : any, pageCount : any) {
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
          watermark: { text: 'PLASTICARIBE SAS', color: 'red', opacity: 0.05, bold: true, italics: false },
          content : [
            {
              columns: [
                { image : logoParaPdf, width : 220, height : 50, margin: [ 0, -15, 0, 0 ] },
                {
                  width: 390,
                  text: `PLASTICARIBE S.A.S 800188732-2.\nORDEN DE TRABAJO. ${datos_ot[i].numero_Orden}`,
                  style: 'titulo',
                  alignment: 'center',
                },
              ]
            },
            '\n',
            {
              style: 'tablaEmpresa',
              table: {
                widths: [60, '*', 60, '*'],
                style: 'header',
                body: [
                  [
                    { border: [true, true, false, false], text: `Id Cliente`, style: 'titulo', },
                    { border: [false, true, false, false], text: `${datos_ot[i].id_Cliente}` },
                    { border: [true, true, false, false], text: `Item`, style: 'titulo', },
                    { border: [false, true, true, false], text: `${datos_ot[i].id_Producto}` },
                  ],
                  [
                    { border: [true, false, false, true], text: `Cliente`, style: 'titulo', },
                    { border: [false, false, true, true], text: `${datos_ot[i].cliente}` },
                    { border: [false, false, false, true], text: `Referencia`, style: 'titulo', },
                    { border: [false, false, true, true], text: `${datos_ot[i].producto}` },
                  ],
                ]
              },
              layout: { defaultBorder: false, },
              fontSize: 9,
            },
            '\n',
            {
              table : {
                widths : ['*', '*', '*', '*', '*'],
                style : '',
                body : [
                  [
                    { border: [false, false, false, false], fillColor: '#aaaaaa', text: `Material`,  style: 'titulo', alignment: 'center', },
                    { border: [false, false, false, false], fillColor: '#aaaaaa', text: `Cant. Bolsas`, style: 'titulo', alignment: 'center', },
                    { border: [false, false, false, false], fillColor: '#aaaaaa', text: `Cant. Kilos (Kg)`, style: 'titulo',  alignment: 'center', },
                    { border: [false, false, false, false], fillColor: '#aaaaaa', text: `Presentación`, style: 'titulo', alignment: 'center', },
                    { border: [false, false, false, false], fillColor: '#aaaaaa', text: `Despachar`, style: 'titulo', alignment: 'center',  },
                  ],
                  [
                    { border: [false, false, false, false], text: `${datos_ot[i].material}`, alignment: 'center', },
                    { border: [false, false, false, false], text: `${this.formatonumeros(datos_ot[i].cantidad_Pedida)}`, alignment: 'center', },
                    { border: [false, false, false, false], text: `${this.formatonumeros(datos_ot[i].peso_Neto)}`, alignment: 'center', },
                    { border: [false, false, false, false], text: `${datos_ot[i].presentacion}`, alignment: 'center', },
                    { border: [false, false, false, false], text: `${datos_ot[i].fecha_Entrega.replace('T00:00:00', '')}`, alignment: 'center', },
                  ]
                ]
              },
              layout: { defaultBorder: false, },
              fontSize: 9,
            },
            '\n \n',
            {
              table : {
                widths : ['*'],
                style : '',
                body : [
                  [ { border: [false, false, false, false], fillColor: '#aaaaaa', text: `Materia Prima`, alignment: 'center', style: 'titulo', } ]
                ]
              },
              layout: { defaultBorder: false, },
              fontSize: 9,
            },
          // Mezclas
            '\n',
            {
              table : {
                widths : ['*', '*', '*'],
                style : '',
                body : [
                  [
                    { border: [false, false, false, true], text: `Material`, alignment: 'center', style: 'titulo', },
                    { border: [false, false, false, true], text: `Cod Producto`, alignment: 'center', style: 'titulo', },
                    { border: [false, false, false, true], text: `Kilos (Kg)`, alignment: 'center', style: 'titulo', }
                  ],
                  [
                    {
                      border : [false, false, false, true],
                      table : {
                        widths : ['*'],
                        style : '',
                        body : [
                          [ { border : [], text : `CAPA UNICA:`, }, ],
                          [ { border : [], text : `${datos_ot[i].mezcla_PorcentajeCapa1}`, }, ],
                          [ { border : [], text : ``, }, ]
                        ]
                      }
                    },
                    {
                      border : [false, false, false, true],
                      table : {
                        widths : ['*'],
                        style : '',
                        body : [
                          [ { border : [], text : `${datos_ot[i].m1C1_nombre}`, alignment: 'justify', }, ],
                          [ { border : [], text : `${datos_ot[i].m2C1_nombre}`,  alignment: 'justify', }, ],
                          [ { border : [], text : `${datos_ot[i].m3C1_nombre}`, alignment: 'justify', }, ],
                          [ { border : [], text : `${datos_ot[i].m4C1_nombre}`, alignment: 'justify', }, ],
                          [ { border : [], text : `${datos_ot[i].p1C1_Nombre}`, alignment: 'justify', }, ],
                          [ { border : [], text : `${datos_ot[i].p2C1_Nombre}`, alignment: 'justify', }, ]
                        ]
                      }
                    },
                    {
                      border : [false, false, false, true],
                      table : {
                        widths : ['*'],
                        style : '',
                        body : [
                          [ { border : [], text : `${datos_ot[i].mezcla_PorcentajeMaterial1_Capa1}%`, alignment: 'center', }, ],
                          [ { border : [], text : `${datos_ot[i].mezcla_PorcentajeMaterial2_Capa1}%`, alignment: 'center', }, ],
                          [ { border : [], text : `${datos_ot[i].mezcla_PorcentajeMaterial3_Capa1}%`, alignment: 'center', }, ],
                          [ { border : [], text : `${datos_ot[i].mezcla_PorcentajeMaterial4_Capa1}%`, alignment: 'center', }, ],
                          [ { border : [], text : `${datos_ot[i].mezcla_PorcentajePigmto1_Capa1}%`, alignment: 'center', }, ],
                          [ { border : [], text : `${datos_ot[i].mezcla_PorcentajePigmto2_Capa1}%`, alignment: 'center', }, ]
                        ]
                      }
                    }
                  ],
                  [
                    {
                      border : [false, false, false, true],
                      table : {
                        widths : ['*'],
                        style : '',
                        body : [
                          [ { border : [], text : `CAPA INTERNA:`, }, ],
                          [ { border : [], text : `${datos_ot[i].mezcla_PorcentajeCapa2}`, }, ],
                          [ { border : [], text : ``, }, ]
                        ]
                      }
                    },
                    {
                      border : [false, false, false, true],
                      table : {
                        widths : ['*'],
                        style : '',
                        body : [
                          [ { border : [], text : `${datos_ot[i].m1C2_nombre}`, alignment: 'justify', }, ],
                          [ { border : [], text : `${datos_ot[i].m2C2_nombre}`, alignment: 'justify', }, ],
                          [ { border : [], text : `${datos_ot[i].m3C2_nombre}`, alignment: 'justify', }, ],
                          [ { border : [], text : `${datos_ot[i].m4C2_nombre}`, alignment: 'justify', }, ],
                          [ { border : [], text : `${datos_ot[i].p1C2_Nombre}`, alignment: 'justify', }, ],
                          [ { border : [], text : `${datos_ot[i].p2C2_Nombre}`, alignment: 'justify', }, ]
                        ]
                      }
                    },
                    {
                      border : [false, false, false, true],
                      table : {
                        widths : ['*'],
                        style : '',
                        body : [
                          [ { border : [], text : `${datos_ot[i].mezcla_PorcentajeMaterial1_Capa2}%`, alignment: 'center', }, ],
                          [ { border : [], text : `${datos_ot[i].mezcla_PorcentajeMaterial2_Capa2}%`, alignment: 'center', }, ],
                          [ { border : [], text : `${datos_ot[i].mezcla_PorcentajeMaterial3_Capa2}%`, alignment: 'center', }, ],
                          [ { border : [], text : `${datos_ot[i].mezcla_PorcentajeMaterial4_Capa2}%`, alignment: 'center', }, ],
                          [ { border : [], text : `${datos_ot[i].mezcla_PorcentajePigmto1_Capa2}%`, alignment: 'center', }, ],
                          [ { border : [], text : `${datos_ot[i].mezcla_PorcentajePigmto2_Capa2}%`, alignment: 'center', }, ]
                        ]
                      }
                    }
                  ],
                  [
                    {
                      border : [false, false, false, true],
                      table : {
                        widths : ['*'],
                        style : '',
                        body : [
                          [ { border : [], text : `CAPA EXTERNA:`, }, ],
                          [ { border : [], text : `${datos_ot[i].mezcla_PorcentajeCapa3}`, }, ],
                          [ { border : [], text : ``, }, ]
                        ]
                      }
                    },
                    {
                      border : [false, false, false, true],
                      table : {
                        widths : ['*'],
                        style : '',
                        body : [
                          [ { border : [], text : `${datos_ot[i].m1C3_nombre}`, alignment: 'justify', }, ],
                          [ { border : [], text : `${datos_ot[i].m2C3_nombre}`, alignment: 'justify', }, ],
                          [ { border : [], text : `${datos_ot[i].m3C3_nombre}`, alignment: 'justify', }, ],
                          [ { border : [],  text : `${datos_ot[i].m4C3_nombre}`, alignment: 'justify', }, ],
                          [ { border : [], text : `${datos_ot[i].p1C3_Nombre}`, alignment: 'justify', }, ],
                          [ { border : [], text : `${datos_ot[i].p2C3_Nombre}`, alignment: 'justify', }, ]
                        ]
                      }
                    },
                    {
                      border : [false, false, false, true],
                      table : {
                        widths : ['*'],
                        style : '',
                        body : [
                          [ { border : [], text : `${datos_ot[i].mezcla_PorcentajeMaterial1_Capa3}%`, alignment: 'center', }, ],
                          [ { border : [], text : `${datos_ot[i].mezcla_PorcentajeMaterial2_Capa3}%`, alignment: 'center', }, ],
                          [ { border : [],  text : `${datos_ot[i].mezcla_PorcentajeMaterial3_Capa3}%`, alignment: 'center', }, ],
                          [ { border : [], text : `${datos_ot[i].mezcla_PorcentajeMaterial4_Capa3}%`, alignment: 'center', }, ],
                          [ { border : [], text : `${datos_ot[i].mezcla_PorcentajePigmto1_Capa3}%`, alignment: 'center', }, ],
                          [ { border : [], text : `${datos_ot[i].mezcla_PorcentajePigmto2_Capa3}%`, alignment: 'center', }, ]
                        ]
                      }
                    }
                  ],
                ]
              },
              layout: { defaultBorder: false, },
              fontSize: 9,
            },
            '\n',
            {
              table : {
                widths : ['*'],
                style : '',
                body : [
                  [ { border: [false, false, false, false], text : `EXTRUSIÓN`, alignment: 'center', fillColor: '#aaaaaa', style: 'titulo', } ]
                ]
              }
            },
            {
              table : {
                widths : ['*', '*', '*', '*', '*', '*', '*'],
                style : '',
                body : [
                  [
                    { border: [false, false, false, false],  fillColor: '#eeeeee', text: `Pigmento`, alignment: 'center', style : 'subtitulo', },
                    { border: [false, false, false, false], fillColor: '#eeeeee', text: `Formato`, alignment: 'center', style : 'subtitulo', },
                    { border: [false, false, false, false], fillColor: '#eeeeee', text: `Ancho`, alignment: 'center', style : 'subtitulo', },
                    { border: [false, false, false, false], fillColor: '#eeeeee', text: `Und Medida`, alignment: 'center', style : 'subtitulo', },
                    { border: [false, false, false, false], fillColor: '#eeeeee', text: `Calibre`, alignment: 'center', style : 'subtitulo', },
                    { border: [false, false, false, false], fillColor: '#eeeeee', text: `Peso MT \n(Min/Max)`, alignment: 'center', style : 'subtitulo', },
                    { border: [false, false, false, false], fillColor: '#eeeeee', text: `Tratado`, alignment: 'center', style : 'subtitulo', }
                  ],
                  [
                    { border: [false, false, false, false], text: `${datos_ot[i].pigmento_Extrusion}`, alignment: 'center', },
                    { border: [false, false, false, false], text: `${datos_ot[i].formato_Extrusin}`, alignment: 'center', },
                    { border: [false, false, false, false], text: `${this.formatonumeros(datos_ot[i].ancho1_Extrusion)}   +   ${this.formatonumeros(datos_ot[i].ancho2_Extrusion)}   +   ${this.formatonumeros(datos_ot[i].ancho3_Extrusion)}`, alignment: 'center', },
                    { border: [false, false, false, false], text: `${datos_ot[i].und_Extrusion}`, alignment: 'center', },
                    { border: [false, false, false, false], text: `${this.formatonumeros(datos_ot[i].calibre_Extrusion)}`, alignment: 'center', },
                    { border: [false, false, false, false], text: `${this.formatonumeros(datos_ot[i].peso_Extrusion)}`, alignment: 'center', },
                    { border: [false, false, false, false], text: `${datos_ot[i].tratado}`, alignment: 'center', }
                  ]
                ]
              },
              layout: { defaultBorder: false, },
              fontSize: 9,
            },
            '\n',
            {
              table : {
                widths : [539],
                style : '',
                body : [
                  [ { border : [true, true, true, false], text : `Observación: ` } ],
                  [ { border : [true, false, true, true], text : `${datos_ot[i].observacion}` } ]
                ]
              },
              layout: { defaultBorder: false, },
              fontSize: 9,
            },
            '\n',
            '\n',
            '\n',
            // Hoja 2
            {
              columns: [
                { image : logoParaPdf, width : 220, height : 50, margin: [ 0, -15, 0, 0 ] },
                {
                  width: 390,
                  text: `PLASTICARIBE S.A.S 800188732-2.\nORDEN DE TRABAJO. ${datos_ot[i].numero_Orden}`,
                  style: 'titulo',
                  alignment: 'center',
                },
              ]
            },
            '\n',
            {
              style: 'tablaEmpresa',
              table: {
                widths: [60, '*', 60, '*'],
                style: 'header',
                body: [
                  [
                    { border: [true, true, false, false], text: `Id Cliente`, style: 'titulo', },
                    { border: [false, true, false, false], text: `${datos_ot[i].id_Cliente}` },
                    { border: [true, true, false, false], text: `Item`, style: 'titulo', },
                    { border: [false, true, true, false], text: `${datos_ot[i].id_Producto}` },
                  ],
                  [
                    { border: [true, false, false, true], text: `Cliente`, style: 'titulo', },
                    { border: [false, false, true, true], text: `${datos_ot[i].cliente}` },
                    { border: [false, false, false, true], text: `Referencia`, style: 'titulo', },
                    { border: [false, false, true, true], text: `${datos_ot[i].producto}` },
                  ],
                ]
              },
              layout: { defaultBorder: false, },
              fontSize: 9,
            },
            '\n',
            {
              table : {
                widths : ['*', '*', '*', '*', '*'],
                style : '',
                body : [
                  [
                    { border: [false, false, false, false], fillColor: '#aaaaaa', text: `Material`,  style: 'titulo', alignment: 'center', },
                    { border: [false, false, false, false], fillColor: '#aaaaaa', text: `Cant. Bolsas`, style: 'titulo', alignment: 'center', },
                    { border: [false, false, false, false], fillColor: '#aaaaaa', text: `Cant. Kilos (Kg)`, style: 'titulo',  alignment: 'center', },
                    { border: [false, false, false, false], fillColor: '#aaaaaa', text: `Presentación`, style: 'titulo', alignment: 'center', },
                    { border: [false, false, false, false], fillColor: '#aaaaaa', text: `Despachar`, style: 'titulo', alignment: 'center',  },
                  ],
                  [
                    { border: [false, false, false, false], text: `${datos_ot[i].material}`, alignment: 'center', },
                    { border: [false, false, false, false], text: `${this.formatonumeros(datos_ot[i].cantidad_Pedida)}`, alignment: 'center', },
                    { border: [false, false, false, false], text: `${this.formatonumeros(datos_ot[i].peso_Neto)}`, alignment: 'center', },
                    { border: [false, false, false, false], text: `${datos_ot[i].presentacion}`, alignment: 'center', },
                    { border: [false, false, false, false], text: `${datos_ot[i].fecha_Entrega.replace('T00:00:00', '')}`, alignment: 'center', },
                  ]
                ]
              },
              layout: { defaultBorder: false, },
              fontSize: 9,
            },
            '\n',
            // Procesos
            {
              table : {
                widths : ['*', 20, '*'],
                style : '',
                body : [
                  [
                    // Extrusion
                    {
                      table : {
                        widths : ['*', '*', '*'],
                        style : '',
                        body : [
                          [
                            { colSpan : 3, text : `EXTRUSIÓN`, alignment: 'center', fillColor: '#aaaaaa', style: 'titulo', },
                            { },
                            { }
                          ],
                          [
                            { border : [], text : `Pigmento: `, },
                            { border : [], text : `${datos_ot[i].pigmento_Extrusion}`, },
                            { border : [], text : ``, }
                          ],
                          [
                            { border : [], text : `Formato: `, },
                            { border : [], text : `${datos_ot[i].formato_Extrusin}`, },
                            { border : [], text : ``, }
                          ],
                          [
                            { border : [], text : `Calibre: `, },
                            { border : [], text : `${this.formatonumeros(datos_ot[i].calibre_Extrusion)}`, },
                            { border : [], text : ``, }
                          ],
                          [
                            { border : [], text : `Unidad Medida: `, },
                            { border : [], text : `${datos_ot[i].und_Extrusion}`, },
                            { border : [], text : ``, }
                          ],
                          [
                            { border : [], text : `ANCHO`, },
                            { border : [], text : `${this.formatonumeros(datos_ot[i].ancho1_Extrusion)}       +       ${this.formatonumeros(datos_ot[i].ancho2_Extrusion)}   +   `, },
                            { border : [], text : `       ${this.formatonumeros(datos_ot[i].ancho3_Extrusion)}`, }
                          ],
                          [
                            { border : [], text : `Peso MT (Min/Max): `, },
                            { border : [false, false, false, false], text : `${datos_ot[i].peso_Extrusion}`, },
                            { border : [false, false, false, false], text : ``, }
                          ],
                          [
                            { border : [], text : `Tratado Caras: `, },
                            { border : [], text : `${datos_ot[i].tratado}`, },
                            { border : [], text : ``, }
                          ],
                        ]
                      }
                    },
                    { },
                    // Laminado
                    {
                      table : {
                        widths : ['*', '*', '*'],
                        style : '',
                        body : [
                          [
                            { colSpan : 3, text : `LAMINADO`, alignment: 'center', fillColor: '#aaaaaa', style: 'titulo', },
                            { border : [], text : ``, },
                            { border : [], text : ``, }
                          ],
                          [
                            { border : [], text : `CAPA`, bold : true, },
                            { border : [], text : `CALIBRE`, bold : true, },
                            { border : [], text : `CANTIDAD`, bold : true, }
                          ],
                          [
                            { border : [], text : `${datos_ot[i].laminado_Capa1}`, },
                            { border : [], text : `${datos_ot[i].calibre_Laminado_Capa1}`, },
                            { border : [], text : `${datos_ot[i].cantidad_Laminado_Capa1}`, }
                          ],
                          [
                            { border : [], text : `${datos_ot[i].laminado_Capa2}`, },
                            { border : [], text : `${datos_ot[i].calibre_Laminado_Capa2}`, },
                            { border : [], text : `${datos_ot[i].cantidad_Laminado_Capa2}`, }
                          ],
                          [
                            { border : [], text : `${datos_ot[i].laminado_Capa3}`, },
                            { border : [], text : `${datos_ot[i].calibre_Laminado_Capa3}`, },
                            { border : [], text : `${datos_ot[i].cantidad_Laminado_Capa3}`, }
                          ]
                        ]
                      }
                    }
                  ],
                  [
                    { },
                    { },
                    { }
                  ],
                  [
                    { },
                    { },
                    { }
                  ],
                  [
                    // Impresion
                    {
                      table : {
                        widths : ['*', '*'],
                        style : '',
                        body : [
                          [
                            { colSpan : 2, text : `IMPRESIÓN`, alignment: 'center', fillColor: '#aaaaaa', style: 'titulo', },
                            { },
                          ],
                          [
                            { border : [], text : `Tipo Impresión: `, },
                            { border : [], text : `${datos_ot[i].tipo_Impresion}`, }
                          ],
                          [
                            { border : [], text : `Rodillo N°: `, },
                            { border : [], text : `${datos_ot[i].rodillo}`, }
                          ],
                          [
                            { border : [], text : `N° de Pista: `, },
                            { border : [], text : `${datos_ot[i].pista}`, }
                          ],
                          [
                            { border : [], text : `Tinta 1: `, },
                            { border : [], text : `${datos_ot[i].tinta1}`, }
                          ],
                          [
                            { border : [], text : `Tinta 2: `, },
                            { border : [], text : `${datos_ot[i].tinta2}`, }
                          ],
                          [
                            { border : [], text : `Tinta 3: `, },
                            { border : [], text : `${datos_ot[i].tinta3}`, }
                          ],
                          [
                            { border : [], text : `Tinta 4: `, },
                            { border : [], text : `${datos_ot[i].tinta4}`, }
                          ],
                          [
                            { border : [], text : `Tinta 5: `, },
                            { border : [], text : `${datos_ot[i].tinta5}`, }
                          ],
                          [
                            { border : [], text : `Tinta 6: `, },
                            { border : [], text : `${datos_ot[i].tinta6}`, }
                          ],
                          [
                            { border : [], text : `Tinta 7: `, },
                            { border : [], text : `${datos_ot[i].tinta7}`, }
                          ],
                          [
                            { border : [], text : `Tinta 8: `, },
                            { border : [], text : `${datos_ot[i].tinta8}`, }
                          ],
                        ]
                      }
                    },
                    { },
                    // Producto Terimnado
                    {
                      table : {
                        widths : ['*', '*', '*'],
                        style : '',
                        body : [
                          [
                            { colSpan : 3, text : `PRODUCTO TERMINADO`, alignment: 'center', fillColor: '#aaaaaa', style: 'titulo', },
                            { },
                            { },
                          ],
                          [
                            { border : [], text : `Formato Bolsa: `, alignment: 'center', },
                            { border : [], text : `${datos_ot[i].formato_Producto}`, alignment: 'center', },
                            { border : [], text : ``, },
                          ],
                          [
                            { border : [], text : `Ancho`, alignment: 'right', bold : true, },
                            { border : [], text : `Largo`, alignment: 'center', bold : true, },
                            { border : [], text : `Fuelle`, alignment: 'left', bold : true, },
                          ],
                          [
                            { border : [], colspan : 3, text : `${this.formatonumeros(datos_ot[i].selladoCorte_Ancho)}`, alignment: 'right', },
                            { border : [], colspan : 3, text : `x          ${this.formatonumeros(datos_ot[i].selladoCorte_Largo)}          x`, alignment: 'center', },
                            { border : [], colspan : 3, text : `${this.formatonumeros(datos_ot[i].selladoCorte_Fuelle)}               ${datos_ot[i].und_Extrusion}`, },
                          ],
                          [
                            { border : [], text : ``, },
                            { border : [], text : ``, },
                            { border : [], text : ``, },
                          ],
                          [
                            { border : [], text : ``, },
                            { border : [], text : ``, },
                            { border : [], text : ``, },
                          ],
                          [
                            { border : [], text : `Sellado: `, },
                            { border : [], text : `${datos_ot[i].tpSellados_Nombre}`, },
                            { border : [], text : ``, },
                          ],
                          [
                            { border : [], text : `Margen: `, },
                            { border : [], text : `${datos_ot[i].margen}`, },
                            { border : [], text : ``, },
                          ],
                          [
                            { border : [], text : `Peso Millar: `, },
                            { border : [], text : `${datos_ot[i].selladoCorte_PesoMillar}`, },
                            { border : [], text : ``, },
                          ],
                          [
                            { border : [], text : `Cant. x Paquete: `, },
                            { border : [], text : `${datos_ot[i].selladoCorte_CantBolsasPaquete}`, },
                            { border : [], text : ``, },
                          ],
                          [
                            { border : [], text : `Cant. x Bulto: `, },
                            { border : [], text : `${datos_ot[i].selladoCorte_CantBolsasBulto}`, },
                            { border : [], text : ``, },
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
            datos_ot[i].cyrel ? {
              table : {
                widths : [20, '*', 20],
                style : '',
                body : [
                  [
                    { border : [], text : ``, },
                    { border : [], text : `Hacer Cyrel`, alignment : 'center', bold : true},
                    { border : [], text : ``, }
                  ]
                ]
              }
            } : {},
            '\n\n',
            {
              table : {
                widths : [539],
                body : [
                  [ { border : [true, true, true, false], text : `Observación: ` } ],
                  [ { border : [true, false, true, true], text : `${datos_ot[i].observacion}` } ]
                ]
              },
              layout: { defaultBorder: false,  },
              fontSize: 9,
              margin: [0, -20]
            }
          ],
          styles: {
            header: { fontSize: 7, bold: true },
            titulo: { fontSize: 11, bold: true },
            ot: { fontSize: 13, bold: true },
            subtitulo : { fontSize : 10, bold : true }
          }
        }
        const pdf = pdfMake.createPdf(pdfDefinicion);
        pdf.open();
      }
    });
  }

  // Funcion que va a consultar la informacion de la una orden de trabajo
  ConsultarOrdenTrabajo(){
    let numeroOT : number = this.FormOrdenTrabajo.value.OT_Id;
    this.limpiarCampos();
    this.edicionOrdenTrabajo = true;

    this.ordenTrabajoService.srvObtenerListaPdfOTInsertada(numeroOT).subscribe(datos_orden => {
      for (let i = 0; i < datos_orden.length; i++) {

        this.checkedCyrel = datos_orden[i].cyrel;
        this.extrusion = datos_orden[i].extrusion;
        this.impresion = datos_orden[i].impresion;
        this.rotograbado = datos_orden[i].rotograbado;
        this.laminado = datos_orden[i].laminado;
        this.checkedCorte = datos_orden[i].corte;
        this.sellado = datos_orden[i].sellado;

        this.FormOrdenTrabajo.patchValue({
          OT_Id: datos_orden[i].numero_Orden,
          Pedido_Id: datos_orden[i].id_Pedido,
          Nombre_Vendedor: datos_orden[i].vendedor,
          OT_FechaCreacion: datos_orden[i].fecha_Creacion.replace('T00:00:00', ''),
          OT_FechaEntrega: datos_orden[i].fecha_Entrega.replace('T00:00:00', ''),
          Id_Sede_Cliente : datos_orden[i].id_SedeCliente,
          ID_Cliente: datos_orden[i].id_Cliente,
          Nombre_Cliente: datos_orden[i].cliente,
          Ciudad_SedeCliente: datos_orden[i].ciudad,
          Direccion_SedeCliente : datos_orden[i].direccion,
          OT_Estado : datos_orden[i].estado_Orden,
          OT_Observacion : datos_orden[i].observacion,
          Margen : datos_orden[i].ot_MargenAdicional,
        });

        let productoExt : any = {
          Id : datos_orden[i].id_Producto,
          Nombre : datos_orden[i].producto,
          Ancho : datos_orden[i].selladoCorte_Ancho,
          Fuelle : datos_orden[i].selladoCorte_Fuelle,
          Largo : datos_orden[i].selladoCorte_Largo,
          Cal : datos_orden[i].calibre_Extrusion,
          Und : datos_orden[i].und_Extrusion,
          PesoMillar : datos_orden[i].selladoCorte_PesoMillar,
          Tipo : datos_orden[i].formato_Producto,
          Material : datos_orden[i].material,
          Pigmento : datos_orden[i].pigmento_Extrusion,
          CantPaquete : datos_orden[i].selladoCorte_CantBolsasPaquete,
          CantBulto : datos_orden[i].selladoCorte_CantBolsasBulto,
          Cant : datos_orden[i].cantidad_Pedida,
          Cant_Inicial : datos_orden[i].cantidad_Pedida,
          UndCant : datos_orden[i].id_Presentacion,
          TipoSellado : datos_orden[i].tpSellados_Nombre,
          PrecioUnd : datos_orden[i].precio_Producto,
          SubTotal : datos_orden[i].precio_Producto * datos_orden[i].cantidad_Pedida,
          FechaEntrega : datos_orden[i].fecha_Entrega.replace('T00:00:00', ''),
        }
        this.producto = datos_orden[i].id_Producto;
        this.presentacionProducto = datos_orden[i].id_Presentacion;
        this.ArrayProducto.push(productoExt);

        this.FormOrdenTrabajoExtrusion.patchValue({
          Material_Extrusion : datos_orden[i].id_Material,
          Formato_Extrusion : datos_orden[i].id_Formato_Extrusion,
          Pigmento_Extrusion : datos_orden[i].id_Pigmento_Extrusion,
          Ancho_Extrusion1 : datos_orden[i].ancho1_Extrusion,
          Ancho_Extrusion2 : datos_orden[i].ancho2_Extrusion,
          Ancho_Extrusion3 : datos_orden[i].ancho3_Extrusion,
          Calibre_Extrusion : datos_orden[i].calibre_Extrusion,
          UnidadMedida_Extrusion : datos_orden[i].und_Extrusion,
          Tratado_Extrusion : datos_orden[i].id_Tratado,
        });
        this.FormOrdenTrabajoImpresion.patchValue({
          Tipo_Impresion : datos_orden[i].id_Tipo_Imptesion,
          Rodillo_Impresion : datos_orden[i].rodillo,
          Pista_Impresion : datos_orden[i].pista,
          Tinta_Impresion1 : datos_orden[i].tinta1,
          Tinta_Impresion2 : datos_orden[i].tinta2,
          Tinta_Impresion3 : datos_orden[i].tinta3,
          Tinta_Impresion4 : datos_orden[i].tinta4,
          Tinta_Impresion5 : datos_orden[i].tinta5,
          Tinta_Impresion6 : datos_orden[i].tinta6,
          Tinta_Impresion7 : datos_orden[i].tinta7,
          Tinta_Impresion8 : datos_orden[i].tinta8,
        });
        this.FormOrdenTrabajoLaminado.patchValue({
          Capa_Laminado1 : datos_orden[i].id_Capa1,
          Calibre_Laminado1 : datos_orden[i].calibre_Laminado_Capa1,
          cantidad_Laminado1 : datos_orden[i].cantidad_Laminado_Capa1,
          Capa_Laminado2 : datos_orden[i].id_Capa2,
          Calibre_Laminado2 : datos_orden[i].calibre_Laminado_Capa2,
          cantidad_Laminado2 : datos_orden[i].cantidad_Laminado_Capa2,
          Capa_Laminado3 : datos_orden[i].id_Capa3,
          Calibre_Laminado3 : datos_orden[i].calibre_Laminado_Capa3,
          cantidad_Laminado3 : datos_orden[i].cantidad_Laminado_Capa3,
        });
        this.FormOrdenTrabajoCorte.patchValue({
          Formato_Corte : datos_orden[i].formato_Producto,
          Ancho_Corte : datos_orden[i].selladoCorte_Ancho,
          Largo_Corte : datos_orden[i].selladoCorte_Largo,
          Fuelle_Corte : datos_orden[i].selladoCorte_Fuelle,
          Margen_Corte : datos_orden[i].margen_Adicional,
        });
        this.FormOrdenTrabajoSellado.patchValue({
          Formato_Sellado : datos_orden[i].formato_Producto,
          Ancho_Sellado : datos_orden[i].selladoCorte_Ancho,
          Largo_Sellado : datos_orden[i].selladoCorte_Largo,
          Fuelle_Sellado : datos_orden[i].selladoCorte_Fuelle,
          Margen_Sellado : datos_orden[i].margen,
          PesoMillar : datos_orden[i].selladoCorte_PesoMillar,
          TipoSellado : datos_orden[i].tpSellados_Nombre,
          CantidadPaquete : datos_orden[i].selladoCorte_CantBolsasPaquete,
          CantidadBulto : datos_orden[i].selladoCorte_CantBolsasBulto,
          PrecioDia : datos_orden[i].selladoCorte_PrecioSelladoDia,
          PrecioNoche : datos_orden[i].selladoCorte_PrecioSelladoNoche,
          PesoPaquete : datos_orden[i].selladoCorte_PesoBulto,
          PesoBulto : datos_orden[i].selladoCorte_PesoPaquete,
        });
        this.FormOrdenTrabajoMezclas.patchValue({ Nombre_Mezclas : datos_orden[i].mezcla_Id, });
        this.cargarCombinacionMezclas();
        this.calcularDatosOt(productoExt);
      }
    }, error => this.mensajeService.mensajeError(`¡No se ha encontrado una orden de trabajo con el consecutivo ${numeroOT}!`, error.error));
  }

  // Funcion que va a validar que si se desee actualizar la orden de trabajo
  validarActualizacionOT(){
    if (this.FormOrdenTrabajo.valid) {
      let ot : number = this.FormOrdenTrabajo.value.OT_Id;
      if (!this.extrusion) this.limpiarFormExtrusion();
      if (!this.impresion && !this.rotograbado) this.limpiarFormImpresion();
      if (!this.laminado) this.limpiarFormLaminado();
      if (!this.checkedCorte) this.limpiarFormCorte();
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
                      severity:'warn',
                      key: 'editarOrden',
                      summary:'Confirmación de Edición de OT',
                      detail:
                      `<h6><b>Esta seguro de editar la información de la Orden de Trabajo N° ${ot}?</b></h6><br>` +
                      `<spam><b>¡Al hacer esto no se recuperarán los datos iniciales!</b><br></spam>`,
                      sticky: true
                    });
                  } else this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡El formulario de Mezclas tiene campos vacios!`);
                } else this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡El formulario de Sellado tiene campos vacios!`);
              } else this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡El formulario de Corte tiene campos vacios!`);
            } else this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡EL formulario de Laminado tiene campos vacios!`);
          } else this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡El formulario de Impresion tiene campos vacios!`);
        } else this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡EL formulario de Extrusion tiene campos vacios!`);
      }, 700);
    } else this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡Hay campos del formulario vacios!`);
  }

  // Funcion que va actualizar con nueva información la orden de trabajo
  editarOrdenTrabajo(){
    if (this.edicionOrdenTrabajo) {
      this.cargando = true;
      let ot : number = this.FormOrdenTrabajo.value.OT_Id;
      this.ordenTrabajoService.srvObtenerListaPorId(ot).subscribe(datos_Orden => {
        let info : any = {
          Ot_Id : ot,
          SedeCli_Id : this.FormOrdenTrabajo.value.Id_Sede_Cliente,
          Prod_Id : this.producto,
          Ot_PesoNetoKg : this.netoKg,
          Ot_ValorOT : this.valorOt,
          Ot_MargenAdicional : this.FormOrdenTrabajo.value.Margen,
          Ot_ValorKg : this.valorKg,
          Ot_ValorUnidad : this.valorProducto,
          Ot_FechaCreacion : datos_Orden.ot_FechaCreacion,
          Estado_Id : 15,
          Usua_Id : this.storage_Id,
          PedExt_Id : parseInt(this.FormOrdenTrabajo.value.Pedido_Id),
          Ot_Observacion : this.FormOrdenTrabajo.value.OT_Observacion,
          Ot_Cyrel : this.checkedCyrel,
          Ot_Corte : this.checkedCorte,
          Mezcla_Id : this.FormOrdenTrabajoMezclas.value.Id_Mezcla,
          UndMed_Id : this.presentacionProducto,
          Ot_Hora : datos_Orden.ot_Hora,
          Extrusion : this.extrusion,
          Impresion : this.impresion,
          Laminado : this.laminado,
          Rotograbado : this.rotograbado,
          Sellado : this.sellado,
          Ot_CantidadPedida : this.cantidadProducto,
        }
        this.ordenTrabajoService.srvActualizar(ot, info).subscribe(() => {
          let errorExt : boolean, errorImp : boolean, errorLam : boolean, errorSelCor : boolean;
          errorExt = this.actualizarOt_Extrusion(ot);
          errorImp = this.actualizarOT_Impresion(ot);
          errorLam = this. actualizarOT_Laminado(ot);
          errorSelCor = this.actualizarOT_Sellado_Corte(ot);
          setTimeout(() => {
            if (!errorExt && !errorImp && !errorLam && !errorSelCor) {
              this.mensajeService.mensajeConfirmacion('¡Actualizado Correctamente!', `Se ha realizado la actualización de la Orden de Trabajo N° ${ot}`);
              this.limpiarCampos();
            }
          }, 1500);
        }, () => this.mensajeService.mensajeError(`¡Error!`, `¡No fue posible actualizar la Orden de Trabajo N° ${ot}!`));
      }, () => this.mensajeService.mensajeError(`¡Error!`, `No se pudo obtener información de la Orden de Trabajo N° ${ot}`));
    }
  }

  // Funcion que va a actualizar la tabla "OT_Extrusion"
  actualizarOt_Extrusion(ot : number) : any {
    this.otExtrusionServie.GetOT_Extrusion(ot).subscribe(datos_extrusion => {
      for (let i = 0; i < datos_extrusion.length; i++) {
        let infoOTExt : any = {
          Extrusion_Id : datos_extrusion[i].extrusion_Id,
          Ot_Id : ot,
          Material_Id : this.FormOrdenTrabajoExtrusion.value.Material_Extrusion,
          Formato_Id : this.FormOrdenTrabajoExtrusion.value.Formato_Extrusion,
          Pigmt_Id : this.FormOrdenTrabajoExtrusion.value.Pigmento_Extrusion,
          Extrusion_Calibre : this.FormOrdenTrabajoExtrusion.value.Calibre_Extrusion,
          Extrusion_Ancho1 : this.FormOrdenTrabajoExtrusion.value.Ancho_Extrusion1,
          Extrusion_Ancho2 : this.FormOrdenTrabajoExtrusion.value.Ancho_Extrusion2,
          Extrusion_Ancho3 : this.FormOrdenTrabajoExtrusion.value.Ancho_Extrusion3,
          UndMed_Id : this.FormOrdenTrabajoExtrusion.value.UnidadMedida_Extrusion,
          Tratado_Id : this.FormOrdenTrabajoExtrusion.value.Tratado_Extrusion,
          Extrusion_Peso : this.FormOrdenTrabajoExtrusion.value.Peso_Extrusion,
        }
        this.otExtrusionServie.srvActualizar(datos_extrusion[i].extrusion_Id, infoOTExt).subscribe(() => { }, error => {
          this.mensajeService.mensajeError(`¡No se actualizó la información de la OT en el área de 'Extrusión'!`, error.error);
          return true;
        });
      }
    }, () => {
      this.mensajeService.mensajeError(`¡No se encontró información de la OT N° ${ot}!`, '');
      return true;
    });
    return false;
  }

  // Funcion que va a actualizar la tabla "OT_Impresion"
  actualizarOT_Impresion(ot : number) : any {
    this.otImpresionService.GetOT_Impresion(ot).subscribe(datos_Impresion => {
      for (let i = 0; i < datos_Impresion.length; i++) {
        let rodilloImpresion : any = this.FormOrdenTrabajoImpresion.value.Rodillo_Impresion;
        let pistaImpresion : any = this.FormOrdenTrabajoImpresion.value.Pista_Impresion;
        let tinta1Impresion : any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion1;
        let tinta2Impresion : any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion2;
        let tinta3Impresion : any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion3;
        let tinta4Impresion : any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion4;
        let tinta5Impresion : any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion5;
        let tinta6Impresion : any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion6;
        let tinta7Impresion : any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion7;
        let tinta8Impresion : any = this.FormOrdenTrabajoImpresion.value.Tinta_Impresion8;
        this.servicioTintas.srvObtenerListaConsultaImpresion(tinta1Impresion, tinta2Impresion, tinta3Impresion, tinta4Impresion, tinta5Impresion, tinta6Impresion, tinta7Impresion, tinta8Impresion).subscribe(datos_impresion => {
          for (let j = 0; j < datos_impresion.length; j++) {
            let infoOTImp : any = {
              Impresion_Id : datos_Impresion[i].impresion_Id,
              Ot_Id : ot,
              TpImpresion_Id : this.FormOrdenTrabajoImpresion.value.Tipo_Impresion,
              Rodillo_Id : rodilloImpresion,
              Pista_Id : pistaImpresion,
              Tinta1_Id : datos_impresion[j].tinta_Id1,
              Tinta2_Id : datos_impresion[j].tinta_Id2,
              Tinta3_Id : datos_impresion[j].tinta_Id3,
              Tinta4_Id : datos_impresion[j].tinta_Id4,
              Tinta5_Id : datos_impresion[j].tinta_Id5,
              Tinta6_Id : datos_impresion[j].tinta_Id6,
              Tinta7_Id : datos_impresion[j].tinta_Id7,
              Tinta8_Id : datos_impresion[j].tinta_Id8,
            }
            this.otImpresionService.srvActualizar(datos_Impresion[i].impresion_Id, infoOTImp).subscribe(() => { }, error => {
              this.mensajeService.mensajeError(`¡No se actualizó información de la OT en el área de 'Impresión' y 'Rotograbado'!`, error.error);
              return true;
            });
          }
        }, () => {
          this.mensajeService.mensajeError(`¡Error!`, `¡No se encontrarón las tintas seleccionadas en el proceso de impresión!`);
          return true;
        });
      }
    }, () => {
      this.mensajeService.mensajeError(`¡Error!`, `¡No se encontró información de la OT N° ${ot}!`);
      return true;
    });
    return false;
  }

  // Funcion que va a a ctualizar la tabla #OT_Laminado
  actualizarOT_Laminado(ot : number){
    this.otLaminadoService.GetOT_Laminado(ot).subscribe(datos_laminado => {
      for (let i = 0; i < datos_laminado.length; i++) {
        let infoOTLam : any = {
          LamCapa_Id : datos_laminado[i].lamCapa_Id,
          OT_Id : ot,
          Capa_Id1 : this.FormOrdenTrabajoLaminado.value.Capa_Laminado1,
          Capa_Id2 : this.FormOrdenTrabajoLaminado.value.Capa_Laminado2,
          Capa_Id3 : this.FormOrdenTrabajoLaminado.value.Capa_Laminado3,
          LamCapa_Calibre1 : this.FormOrdenTrabajoLaminado.value.Calibre_Laminado1,
          LamCapa_Calibre2 : this.FormOrdenTrabajoLaminado.value.Calibre_Laminado2,
          LamCapa_Calibre3 : this.FormOrdenTrabajoLaminado.value.Calibre_Laminado3,
          LamCapa_Cantidad1 : this.FormOrdenTrabajoLaminado.value.cantidad_Laminado1,
          LamCapa_Cantidad2 : this.FormOrdenTrabajoLaminado.value.cantidad_Laminado2,
          LamCapa_Cantidad3 : this.FormOrdenTrabajoLaminado.value.cantidad_Laminado3,
        }
        this.otLaminadoService.srvActualizar(datos_laminado[i].lamCapa_Id, infoOTLam).subscribe(() => { }, error => {
          this.mensajeService.mensajeError(`¡No se actualizó la información de la OT en el área de 'Laminado'!`, error.error);
          return true;
        });
      }
    }, () => {
      this.mensajeService.mensajeError(`¡No se encontró información de la OT N° ${ot}!`, '');
      return true;
    });
    return false;
  }

  // Funcion que va a a ctualizar la tabla "OT_Sellado_Corte"
  actualizarOT_Sellado_Corte(ot : number){
    this.otSelladoCorteService.GetOT_SelladoCorte(ot).subscribe(datos_ot => {
      for (let i = 0; i < datos_ot.length; i++) {
        let tipoSellado : number = this.FormOrdenTrabajoSellado.value.TipoSellado, formato : number = this.FormOrdenTrabajoSellado.value.Formato_Sellado;
        this.otSelladoCorteService.getTipoSellado_Formato(tipoSellado, formato).subscribe(datos => {
          let info : any = {
            SelladoCorte_Id : datos_ot[i].selladoCorte_Id,
            Ot_Id : ot,
            Corte :  this.checkedCorte,
            Sellado :  this.sellado,
            Formato_Id : datos.tpProd_Id,
            SelladoCorte_Ancho : this.FormOrdenTrabajoSellado.value.Ancho_Sellado,
            SelladoCorte_Largo : this.FormOrdenTrabajoSellado.value.Largo_Sellado,
            SelladoCorte_Fuelle : this.FormOrdenTrabajoSellado.value.Fuelle_Sellado,
            SelladoCorte_PesoMillar : this.FormOrdenTrabajoSellado.value.PesoMillar,
            TpSellado_Id : datos.tpSellado_Id,
            SelladoCorte_PrecioSelladoDia : this.FormOrdenTrabajoSellado.value.PrecioDia,
            SelladoCorte_PrecioSelladoNoche : this.FormOrdenTrabajoSellado.value.PrecioNoche,
            SelladoCorte_CantBolsasPaquete : this.FormOrdenTrabajoSellado.value.CantidadPaquete,
            SelladoCorte_CantBolsasBulto : this.FormOrdenTrabajoSellado.value.CantidadBulto,
            SelladoCorte_PesoPaquete : this.FormOrdenTrabajoSellado.value.PesoPaquete,
            SelladoCorte_PesoBulto : this.FormOrdenTrabajoSellado.value.PesoBulto,
          }
          this.otSelladoCorteService.put(datos_ot[i].selladoCorte_Id, info).subscribe(() => { }, error => {
            this.mensajeService.mensajeError(`¡No se actualizó la información de la OT en el área de 'Sellado' o 'Corte'!`, error.error);
            return true;
          });
        }, error => {
          this.mensajeService.mensajeError(`¡No se pudo obtener informacón del Formato y Tipo de Sellado Selecionados para el área de Sellado!`, error.error);
          return true;
        });
      }
    }, () => {
      this.mensajeService.mensajeError(`¡No se ha encontrado información de la OT N° ${ot}!`, '');
      return true;
    });
    return false;
  }

  // Función que va a abrir el modal de creación de las mezclas
  cargarModalMezclas() {
    this.modalMezclas = true;
    this.cargarMezclaMateria2();
    this.cargarMezclaPigmento2();
    this.cargarMateriales_MatPrima();
    setTimeout(() => { this.initFormCrearMezclas(); }, 1000);
  }

  // Función que va a abrir el modal de la creación de materiales
  cargarModalMateriales = () => this.modalMateriales = true;

  // Función que va a abrir el modal de la creación de pigmentos
  cargarModalPigmentos = () => this.modalPigmentos = true;

  //
  initFormCrearMezclas(){
    this.formCrearMezclas.disable();
    this.formCrearMezclas.get('mezclaId').enable();
    this.formCrearMezclas.get('Nombre_Mezclas').enable();
    this.checkedCapa1 = false;
    this.checkedCapa2 = false;
    this.checkedCapa2 = false;
    this.idMezclaSeleccionada = 0;
    this.formCrearMezclas.patchValue ({
      mezclaId : 0,
      Nombre_Mezclas : '',
      Material_MatPrima : '',
      Chechbox_Capa1 : '',
      Chechbox_Capa2 : '',
      Chechbox_Capa3 : '',
      Proc_Capa1 : 0,
      Proc_Capa2 : 0,
      Proc_Capa3 : 0,
      materialP1_Capa1 : 1,
      PorcentajeMaterialP1_Capa1 : 0,
      materialP1_Capa2 : 1,
      PorcentajeMaterialP1_Capa2 : 0,
      materialP1_Capa3 : 1,
      PorcentajeMaterialP1_Capa3 : 0,
      materialP2_Capa1 : 1,
      PorcentajeMaterialP2_Capa1 : 0,
      materialP2_Capa2 : 1,
      PorcentajeMaterialP2_Capa2 : 0,
      materialP2_Capa3 : 1,
      PorcentajeMaterialP2_Capa3 : 0,
      materialP3_Capa1 : 1,
      PorcentajeMaterialP3_Capa1 : 0,
      materialP3_Capa2 : 1,
      PorcentajeMaterialP3_Capa2 : 0,
      materialP3_Capa3 : 1,
      PorcentajeMaterialP3_Capa3 : 0,
      materialP4_Capa1 : 1,
      PorcentajeMaterialP4_Capa1 : 0,
      materialP4_Capa2 : 1,
      PorcentajeMaterialP4_Capa2 : 0,
      materialP4_Capa3 : 1,
      PorcentajeMaterialP4_Capa3 : 0,
      MezclaPigmentoP1_Capa1 : 1,
      PorcentajeMezclaPigmentoP1_Capa1 : 0,
      MezclaPigmentoP1_Capa2 : 1,
      PorcentajeMezclaPigmentoP1_Capa2 : 0,
      MezclaPigmento1_Capa3 : 1,
      PorcentajeMezclaPigmentoP1_Capa3 :0,
      MezclaPigmentoP2_Capa1 : 1,
      PorcentajeMezclaPigmentoP2_Capa1 : 0,
      MezclaPigmentoP2_Capa2 : 1,
      PorcentajeMezclaPigmentoP2_Capa2 : 0,
      MezclaPigmento2_Capa3 : 1,
      PorcentajeMezclaPigmentoP2_Capa3 : 0,
    });
  }

  //
  cargarCombinacionMezclas2(){
    if (this.formCrearMezclas.value.Nombre_Mezclas != null) {
      this.mezclasService.srvObtenerListaPorNombre(this.formCrearMezclas.value.Nombre_Mezclas.replace('%', '%25')).subscribe(datos_mezcla => {
        for (let i = 0; i < datos_mezcla.length; i++) {
          this.idMezclaSeleccionada = datos_mezcla[i].mezcla_Id;
          this.nroCapas = datos_mezcla[i].mezcla_NroCapas;

          /** Selecciona el nro de capas que tiene la mezcla seleccionada */
          if(this.nroCapas == 1) this.habilitarCapa1();
          if(this.nroCapas == 2) this.habilitarCapa2();
          if(this.nroCapas == 3) this.habilitarCapa3();

          this.cargarCamposMezclaSeleccionada(datos_mezcla[i]); /** carga los campos con los datos de la mezcla seleccionada */
        }
      });
    } else this.mensajeService.mensajeAdvertencia(`Advertencia`, 'Debe llenar el campo nombre de mezclas');
  }

  cargarCamposMezclaSeleccionada(datos_mezcla : any) {
    this.formCrearMezclas.patchValue({
      mezclaId : this.idMezclaSeleccionada,
      Nombre_Mezclas : this.formCrearMezclas.value.Nombre_Mezclas.replace('%25', '%'),
      Material_MatPrima : datos_mezcla.material_Id,
      Chechbox_Capa1 : this.nroCapas,
      Chechbox_Capa2 : '',
      Chechbox_Capa3 : '',
      Proc_Capa1 : datos_mezcla.mezcla_PorcentajeCapa1,
      Proc_Capa2 : datos_mezcla.mezcla_PorcentajeCapa2,
      Proc_Capa3 : datos_mezcla.mezcla_PorcentajeCapa3,
      materialP1_Capa1 : datos_mezcla.mezMaterial_Id1xCapa1,
      PorcentajeMaterialP1_Capa1 : datos_mezcla.mezcla_PorcentajeMaterial1_Capa1,
      materialP1_Capa2 : datos_mezcla.mezMaterial_Id1xCapa2,
      PorcentajeMaterialP1_Capa2 : datos_mezcla.mezcla_PorcentajeMaterial1_Capa2,
      materialP1_Capa3 : datos_mezcla.mezMaterial_Id1xCapa3,
      PorcentajeMaterialP1_Capa3 : datos_mezcla.mezcla_PorcentajeMaterial1_Capa3,
      materialP2_Capa1 : datos_mezcla.mezMaterial_Id2xCapa1,
      PorcentajeMaterialP2_Capa1 : datos_mezcla.mezcla_PorcentajeMaterial2_Capa1,
      materialP2_Capa2 : datos_mezcla.mezMaterial_Id2xCapa2,
      PorcentajeMaterialP2_Capa2 : datos_mezcla.mezcla_PorcentajeMaterial2_Capa2,
      materialP2_Capa3 : datos_mezcla.mezMaterial_Id2xCapa3,
      PorcentajeMaterialP2_Capa3 : datos_mezcla.mezcla_PorcentajeMaterial2_Capa3,
      materialP3_Capa1 : datos_mezcla.mezMaterial_Id3xCapa1,
      PorcentajeMaterialP3_Capa1 : datos_mezcla.mezcla_PorcentajeMaterial3_Capa1,
      materialP3_Capa2 : datos_mezcla.mezMaterial_Id3xCapa2,
      PorcentajeMaterialP3_Capa2 : datos_mezcla.mezcla_PorcentajeMaterial3_Capa2,
      materialP3_Capa3 : datos_mezcla.mezMaterial_Id3xCapa3,
      PorcentajeMaterialP3_Capa3 : datos_mezcla.mezcla_PorcentajeMaterial3_Capa3,
      materialP4_Capa1 : datos_mezcla.mezMaterial_Id4xCapa1,
      PorcentajeMaterialP4_Capa1 : datos_mezcla.mezcla_PorcentajeMaterial4_Capa1,
      materialP4_Capa2 : datos_mezcla.mezMaterial_Id4xCapa2,
      PorcentajeMaterialP4_Capa2 : datos_mezcla.mezcla_PorcentajeMaterial4_Capa2,
      materialP4_Capa3 : datos_mezcla.mezMaterial_Id4xCapa3,
      PorcentajeMaterialP4_Capa3 : datos_mezcla.mezcla_PorcentajeMaterial4_Capa3,
      MezclaPigmentoP1_Capa1 : datos_mezcla.mezPigmto_Id1xCapa1,
      PorcentajeMezclaPigmentoP1_Capa1 : datos_mezcla.mezcla_PorcentajePigmto1_Capa1,
      MezclaPigmentoP1_Capa2 : datos_mezcla.mezPigmto_Id1xCapa2,
      PorcentajeMezclaPigmentoP1_Capa2 : datos_mezcla.mezcla_PorcentajePigmto1_Capa2,
      MezclaPigmento1_Capa3 : datos_mezcla.mezPigmto_Id1xCapa3,
      PorcentajeMezclaPigmentoP1_Capa3 :datos_mezcla.mezcla_PorcentajePigmto1_Capa3,
      MezclaPigmentoP2_Capa1 : datos_mezcla.mezPigmto_Id2xCapa1,
      PorcentajeMezclaPigmentoP2_Capa1 : datos_mezcla.mezcla_PorcentajePigmto2_Capa1,
      MezclaPigmentoP2_Capa2 : datos_mezcla.mezPigmto_Id2xCapa2,
      PorcentajeMezclaPigmentoP2_Capa2 : datos_mezcla.mezcla_PorcentajePigmto2_Capa2,
      MezclaPigmento2_Capa3 : datos_mezcla.mezPigmto_Id2xCapa3,
      PorcentajeMezclaPigmentoP2_Capa3 : datos_mezcla.mezcla_PorcentajePigmto2_Capa3,
    });
  }

  // Funcion que va a habilitar los campos de la capa 1 en el modal de creación de materia prima
  cambiarNroCapas1() {
    this.checkedCapa1 = true;
    this.checkedCapa2 = false;
    this.checkedCapa3 = false;
    this.nroCapas = 1;

    this.formCrearMezclas.patchValue({
      mezclaId : 0,
      Chechbox_Capa1 : this.nroCapas,
      Proc_Capa1 : 100,
      Proc_Capa2 : 0,
      Proc_Capa3 : 0,
      materialP1_Capa2 : 1,
      PorcentajeMaterialP1_Capa2 : 0,
      materialP1_Capa3 : 1,
      PorcentajeMaterialP1_Capa3 : 0,
      materialP2_Capa2 : 1,
      PorcentajeMaterialP2_Capa2 : 0,
      materialP2_Capa3 : 1,
      PorcentajeMaterialP2_Capa3 : 0,
      materialP3_Capa2 : 1,
      PorcentajeMaterialP3_Capa2 : 0,
      materialP3_Capa3 : 1,
      PorcentajeMaterialP3_Capa3 : 0,
      materialP4_Capa2 : 1,
      PorcentajeMaterialP4_Capa2 : 0,
      materialP4_Capa3 : 1,
      PorcentajeMaterialP4_Capa3 : 0,
      MezclaPigmentoP1_Capa2 : 1,
      PorcentajeMezclaPigmentoP1_Capa2 : 0,
      MezclaPigmento1_Capa3 : 1,
      PorcentajeMezclaPigmentoP1_Capa3 :0,
      MezclaPigmentoP2_Capa2 : 1,
      PorcentajeMezclaPigmentoP2_Capa2 : 0,
      MezclaPigmento2_Capa3 : 1,
      PorcentajeMezclaPigmentoP2_Capa3 : 0,
    });
  }

  // Funcion que va a habilitar los campos de la capa 2 en el modal de creación de materia prima
  cambiarNroCapas2() {
    this.checkedCapa1 = false;
    this.checkedCapa2 = true;
    this.checkedCapa3 = false;
    this.nroCapas = 2

    this.formCrearMezclas.patchValue ({
      mezclaId : 0,
      Chechbox_Capa1 : this.nroCapas,
      Proc_Capa1 : 50,
      Proc_Capa2 : 50,
      Proc_Capa3 : 0,
      materialP1_Capa3 : 1,
      PorcentajeMaterialP1_Capa3 : 0,
      materialP2_Capa3 : 1,
      PorcentajeMaterialP2_Capa3 : 0,
      materialP3_Capa3 : 1,
      PorcentajeMaterialP3_Capa3 : 0,
      materialP4_Capa3 : 1,
      PorcentajeMaterialP4_Capa3 : 0,
      MezclaPigmento1_Capa3 : 1,
      PorcentajeMezclaPigmentoP1_Capa3 : 0,
      MezclaPigmento2_Capa3 : 1,
      PorcentajeMezclaPigmentoP2_Capa3 : 0,
    });
  }

  // Funcion que va a habilitar los campos de la capa 3 en el modal de creación de materia prima
  cambiarNroCapas3() {
    this.checkedCapa1 = false;
    this.checkedCapa2 = false;
    this.checkedCapa3 = true;
    this.nroCapas = 3;

    this.formCrearMezclas.patchValue ({
      mezclaId : 0,
      Chechbox_Capa1 : this.nroCapas,
      Proc_Capa1 : 30,
      Proc_Capa2 : 40,
      Proc_Capa3 : 30,
    });
  }

  /** Función que creará la mezcla predefinida  */
  crearMezclaPredefinida() {
    let mezcla : any = this.formCrearMezclas.value.Nombre_Mezclas;
    /** Porcentajes de capa */
    let porc_Capa1 : any = this.formCrearMezclas.value.Proc_Capa1 == undefined ? 0 : this.formCrearMezclas.value.Proc_Capa1;
    let porc_Capa2 : any = this.formCrearMezclas.value.Proc_Capa2 == undefined ? 0 : this.formCrearMezclas.value.Proc_Capa2;
    let porc_Capa3 : any =  this.formCrearMezclas.value.Proc_Capa3 == undefined ? 0 : this.formCrearMezclas.value.Proc_Capa3;
    /** Capa 1 */
    let material1C1 : any = this.formCrearMezclas.value.materialP1_Capa1;
    let porcMaterial1C1 : any = this.formCrearMezclas.value.PorcentajeMaterialP1_Capa1;
    let material2C1 : any = this.formCrearMezclas.value.materialP2_Capa1;
    let porcMaterial2C1 : any = this.formCrearMezclas.value.PorcentajeMaterialP2_Capa1;
    let material3C1 : any = this.formCrearMezclas.value.materialP3_Capa1;
    let porcMaterial3C1 : any = this.formCrearMezclas.value.PorcentajeMaterialP3_Capa1;
    let material4C1 : any = this.formCrearMezclas.value.materialP4_Capa1;
    let porcMaterial4C1 : any = this.formCrearMezclas.value.PorcentajeMaterialP4_Capa1;
    /** Capa 2 */
    let material1C2 : any = this.formCrearMezclas.value.materialP1_Capa2;
    let porcMaterial1C2 : any = this.formCrearMezclas.value.PorcentajeMaterialP1_Capa2;
    let material2C2 : any = this.formCrearMezclas.value.materialP2_Capa2;
    let porcMaterial2C2 : any = this.formCrearMezclas.value.PorcentajeMaterialP2_Capa2;
    let material3C2 : any = this.formCrearMezclas.value.materialP3_Capa2;
    let porcMaterial3C2 : any = this.formCrearMezclas.value.PorcentajeMaterialP3_Capa2;
    let material4C2 : any = this.formCrearMezclas.value.materialP4_Capa2;
    let porcMaterial4C2 : any = this.formCrearMezclas.value.PorcentajeMaterialP4_Capa2;
    /** Capa 3 */
    let material1C3 : any = this.formCrearMezclas.value.materialP1_Capa3;
    let porcMaterial1C3 : any = this.formCrearMezclas.value.PorcentajeMaterialP1_Capa3;
    let material2C3 : any = this.formCrearMezclas.value.materialP2_Capa3;
    let porcMaterial2C3 : any = this.formCrearMezclas.value.PorcentajeMaterialP2_Capa3;
    let material3C3 : any = this.formCrearMezclas.value.materialP3_Capa3;
    let porcMaterial3C3 : any = this.formCrearMezclas.value.PorcentajeMaterialP3_Capa3;
    let material4C3 : any = this.formCrearMezclas.value.materialP4_Capa3;
    let porcMaterial4C3 : any = this.formCrearMezclas.value.PorcentajeMaterialP4_Capa3;

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

    if(mezcla != null) {
      this.mezclasService.srvObtenerListaPorNombre(mezcla.replace('%', '%25')).subscribe(dataMezcla => {
        if(dataMezcla.length == 0){
          let porcentajeTotalCapas : any = (porc_Capa1 + porc_Capa2 + porc_Capa3);
          if(this.checkedCapa1 == true) {
            if (porcentajeTotalCapas == 100) {
              if(material1C1 != 1 || material2C1 != 1 || material3C1 != 1 || material4C1 != 1){
                let porcentajeTotalCapa1 : number = (parseFloat(porcMaterial1C1) + parseFloat(porcMaterial2C1) + parseFloat(porcMaterial3C1) + parseFloat(porcMaterial4C1));
                if (porcentajeTotalCapa1 == 100) this.infoMezclaCrear();
                else this.mensajeService.mensajeAdvertencia(`Advertencia`, `La suma del porcentaje de mezcla de materiales de la capa 1 es ${porcentajeTotalCapa1} y debe ser 100, por favor verifique!`);
              } else this.mensajeService.mensajeAdvertencia(`Advertencia`, 'No puede usar este porcentaje para el/los material(es) seleccionado(s)');
            } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `El porcentaje total de la capa 1 es ${porcentajeTotalCapas} y debe ser 100 ` ) ;
          } else if(this.checkedCapa2 == true) {
            if(porcentajeTotalCapas == 100 && porc_Capa1 != 0 && porc_Capa2 != 0) {
              if((material1C1 != 1 || material2C1 != 1 || material3C1 != 1 || material4C1 != 1)
                && (material1C2 != 1 || material2C2 != 1 || material3C2 != 1 || material4C2 != 1)) {
                let porcMaterialesCapa1 : number = (porcMaterial1C1 + porcMaterial2C1 + porcMaterial3C1 + porcMaterial4C1);
                let porcMaterialesCapa2: number = (porcMaterial1C2 + porcMaterial2C2 + porcMaterial3C2 + porcMaterial4C2);
                if(porcMaterialesCapa1 == 100 && porcMaterialesCapa2 == 100) this.infoMezclaCrear();
                else this.mensajeService.mensajeAdvertencia(`Advertencia`, 'La suma del porcentaje de mezcla de los materiales en cada capa debe ser 100');
              } else this.mensajeService.mensajeAdvertencia(`Advertencia`, 'No puede usar estos porcentajes de mezcla para los materiales seleccionados');
            } else this.mensajeService.mensajeAdvertencia(`Advertencia`, 'La suma del porcentaje de mezcla de las capas 1 y 2 debe ser 100');
          } else if (this.checkedCapa3 == true) {
            if(porcentajeTotalCapas == 100 && porc_Capa1 != 0 && porc_Capa2 != 0 && porc_Capa3 != 0) {
              if((material1C1 != 1 || material2C1 != 1 || material3C1 != 1 || material4C1 != 1)
                && (material1C2 != 1 || material2C2 != 1 || material3C2 != 1 || material4C2 != 1)
                && (material1C3 != 1 || material2C3 != 1 || material3C3 != 1 || material4C3 != 1)) {
                let porcMaterialesCapa1 : number = (porcMaterial1C1 + porcMaterial2C1 + porcMaterial3C1 + porcMaterial4C1);
                let porcMaterialesCapa2: number = (porcMaterial1C2 + porcMaterial2C2 + porcMaterial3C2 + porcMaterial4C2);
                let porcMaterialesCapa3: number = (porcMaterial1C3 + porcMaterial2C3 + porcMaterial3C3 + porcMaterial4C3);
                if(porcMaterialesCapa1 == 100 && porcMaterialesCapa2 == 100 && porcMaterialesCapa3 == 100) this.infoMezclaCrear();
                else this.mensajeService.mensajeAdvertencia(`Advertencia`, 'La suma del porcentaje de mezcla de los materiales en cada capa debe ser 100');
              } else this.mensajeService.mensajeAdvertencia(`Advertencia`, 'No puede usar este porcentaje para los materiales seleccionados');
            } else this.mensajeService.mensajeAdvertencia(`Advertencia`, 'La suma del porcentaje de mezcla de las capas debe ser 100');
          } else this.mensajeService.mensajeAdvertencia(`Advertencia`, 'Debe elegir el número de capas de la mezcla.');
        } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `Ya existe una mezcla llamada ${mezcla}`);
      });
    } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `Debe diligenciar el campo "Nombre de Mezcla"`);
  }

  // Función que va a crear la mezcla en la base de datos
  infoMezclaCrear(){
    let mezcla : any = this.formCrearMezclas.value.Nombre_Mezclas;
    let modelo : modelMezclas = {
      Mezcla_Nombre: mezcla.replace('%25', '%'),
      Mezcla_NroCapas: this.nroCapas,
      Material_Id:  this.formCrearMezclas.value.Material_MatPrima,
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
      this.mensajeService.mensajeConfirmacion(`Registro de Mezcla Predefinida creado con éxito!`, '');
      setTimeout(() => {
        this.initFormCrearMezclas();
        this.cargarMezclas();
      }, 1000);
    }, error => this.mensajeService.mensajeError(`¡Error!`, `¡${error.error}!`));
  }

  /** Función para crear mater desde el modal de crear mezclas */
  crearMaterial(){
    let nombreMaterial : string = this.formCrearMateriales.value.matNombre;
    let descripcionMaterial : string = this.formCrearMateriales.value.matDescripcion;
    this.mezclaMaterialService.getMezclasMateriales(nombreMaterial.toUpperCase()).subscribe(dataMzMaterial => {
      if(dataMzMaterial.length == 0) {
        const material : modelMezMaterial = {
          MezMaterial_Nombre: nombreMaterial.toUpperCase(),
          MezMaterial_Descripcion: descripcionMaterial == null ? `Mezcla de Material ${nombreMaterial.toUpperCase()}` : descripcionMaterial,
        }
        this.mezclaMaterialService.srvGuardar(material).subscribe(() => {
          this.mensajeService.mensajeConfirmacion('Registro creado con éxito!', '');
          setTimeout(() => {
            this.formCrearMateriales.reset();
            this.cargarMezclaMateria();
            this.cargarMezclaMateria2();
          }, 300);
        });
      } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `Ya existe una material de mezclas llamado ${nombreMaterial.toUpperCase()}`);
    });
  }

  /** Función para crear pigmentos desde el modal de crear mezclas */
  crearPigmento(){
    let nombrePigmento : string = this.formCrearPigmentos.value.pigNombre;
    let descripcionPigmento : string = this.formCrearPigmentos.value.pigDescripcion;
    this.mezclaPigmentosService.getMezclasPigmentos(nombrePigmento.toUpperCase()).subscribe(dataMzPigmento => {
      if(dataMzPigmento.length == 0) {
        const pigmento : modelMezPigmento = {
          MezPigmto_Nombre: nombrePigmento.toUpperCase(),
          MezPigmto_Descripcion: descripcionPigmento == null ? `Mezcla de Pigmento ${nombrePigmento.toUpperCase()}` : descripcionPigmento,
        }
        this.mezclaPigmentosService.srvGuardar(pigmento).subscribe(() => {
          this.mensajeService.mensajeConfirmacion('Registro creado con éxito!', '');
          setTimeout(() => {
          this.formCrearPigmentos.reset();
          this.mezclasPigmentos();
          this.mezclasPigmentos2();
          }, 300);
        });
      } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `Ya existe un pigmento de mezclas llamado ${nombrePigmento.toUpperCase()}`)
    });
  }

  // Funcion que va a deshabilitar los campos del formulario de mezclas, luego habilitará solo los campos de la capa 1
  habilitarCapa1(){
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
  habilitarCapa2(){
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
  habilitarCapa3(){
    setTimeout(() => {
      this.formCrearMezclas.enable();
      this.cambiarNroCapas3();
    }, 300);
  }

  /** Función que validará que no se elija ninguna tinta igual a otra en el formulario de impresión y organizará las tintas */
  validarTinta(posicion : string){
    let tinta : any = this.FormOrdenTrabajoImpresion.get('Tinta_Impresion' + posicion)?.value;
    let tintasSeleccionadas : any[] = Object.values(this.FormOrdenTrabajoImpresion.value);
    tintasSeleccionadas = tintasSeleccionadas.filter((item) => typeof(item) == 'string');
    let indice : number = tintasSeleccionadas.indexOf(tinta);
    if(indice != -1) tintasSeleccionadas.splice(indice, 1);
    if(tinta != 'NO APLICA') {
      if(tintasSeleccionadas.includes(tinta)) {
        this.mensajeService.mensajeAdvertencia(`Advertencia`, `La tinta ${tinta} ya se encuentra elegida, por favor seleccione otra!`);
        this.FormOrdenTrabajoImpresion.get('Tinta_Impresion'+ posicion)?.setValue('NO APLICA');
      }
    }
    for (let index = 1; index < parseInt(posicion); index++) {
      if(tintasSeleccionadas[index - 1].includes('NO APLICA')) {
        this.FormOrdenTrabajoImpresion.get('Tinta_Impresion' + index)?.setValue(tinta);
        this.FormOrdenTrabajoImpresion.get('Tinta_Impresion' + posicion)?.setValue('NO APLICA');
        break;
      }
    }
  }

  /** Función para validar que no se elijan laminados de capa iguales en el formulario y que se organicen dependiendo la posición */
  validarLaminado(posicion : number){
    let campoLaminado : any = this.FormOrdenTrabajoLaminado.get('Capa_Laminado' + posicion.toString())?.value;
    let laminados : any[] = Object.values(this.FormOrdenTrabajoLaminado.value);
    let lam1 : any = laminados.splice(0, 1); let lam2 : any = laminados.splice(2, 1); let lam3 : any = laminados.splice(4, 1);
    let laminadosCapas : any[] = [...lam1, ...lam2, ...lam3];
    let indice : number = laminadosCapas.indexOf(campoLaminado);
    if(indice != -1) laminadosCapas.splice(indice, 1);
    if(campoLaminado != 'NO APLICA') {
      if(laminadosCapas.includes(campoLaminado)) {
        this.mensajeService.mensajeAdvertencia(`Advertencia`, `El laminado ${this.laminado_capas[campoLaminado - 1].lamCapa_Nombre} ya se encuentra selecionado, por favor elija otro!`);
        this.FormOrdenTrabajoLaminado.get('Capa_Laminado' + posicion.toString())?.setValue(1);
      }
    }
    for (let index = 1; index < posicion; index++) {
      if(laminadosCapas[index - 1].toString().includes('1')) {
        this.FormOrdenTrabajoLaminado.get('Capa_Laminado' + index)?.setValue(campoLaminado);
        this.FormOrdenTrabajoLaminado.get('Capa_Laminado' + posicion)?.setValue(1);
        break;
      }
    }
    this.validarLaminadoCapa(posicion);
  }

  validarLaminadoCapa(posicion : number) {
    let campoLaminado : any = this.FormOrdenTrabajoLaminado.get('Capa_Laminado' + posicion.toString())?.value;
    if(campoLaminado == 1) {
      this.FormOrdenTrabajoLaminado.get('Calibre_Laminado' + posicion)?.setValue(0);
      this.FormOrdenTrabajoLaminado.get('cantidad_Laminado' + posicion)?.setValue(0);
    }
  }
}
