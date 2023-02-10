import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
import { MessageService } from 'primeng/api';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { modelMezclas } from 'src/app/Modelo/modelMezclas';
import { modelMezMaterial } from 'src/app/Modelo/modelMezMaterial';
import { modelMezPigmento } from 'src/app/Modelo/modelMezPigmento';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { ClientesService } from 'src/app/Servicios/Clientes/clientes.service';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { FormatosService } from 'src/app/Servicios/Formato/Formatos.service';
import { Laminado_CapaService } from 'src/app/Servicios/LaminadoCapa/Laminado_Capa.service';
import { MaterialProductoService } from 'src/app/Servicios/MaterialProducto/materialProducto.service';
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
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import { Tipos_ImpresionService } from 'src/app/Servicios/TipoImpresion/Tipos_Impresion.service';
import { TipoProductoService } from 'src/app/Servicios/TipoProducto/tipo-producto.service';
import { TiposSelladoService } from 'src/app/Servicios/TiposSellado/TiposSellado.service';
import { TratadoService } from 'src/app/Servicios/Tratado/Tratado.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-ordenes-trabajo',
  templateUrl: './ordenes-trabajo.component.html',
  styleUrls: ['./ordenes-trabajo.component.css']
})

export class OrdenesTrabajoComponent implements OnInit {

  public FormOrdenTrabajo !: FormGroup;
  public FormOrdenTrabajoExtrusion !: FormGroup;
  public FormOrdenTrabajoImpresion !: FormGroup;
  public FormOrdenTrabajoLaminado !: FormGroup;
  public FormOrdenTrabajoCorte !: FormGroup;
  public FormOrdenTrabajoSellado !: FormGroup;
  public FormOrdenTrabajoMezclas !: FormGroup;

  public arrayTintas = []; /** Array que colocará las tintas en los combobox al momento de crear la OT */
  public arrayPigmentos = []; /** Array que colocará las pigmentos en los combobox al momento de crear la OT */
  public arrayMateriales = []; /** Array que colocará las materiales en los combobox al momento de crear la OT*/
  public arrayUnidadesMedidas = []; /** Array que colocará las unidades de medida en los combobox al momento de crear la OT*/
  cargando : boolean = false; //Variable para validar que salga o no la imagen de carga
  vistaPedidos : boolean = false; //Funcion que validará si se muestra el navbar de ordenes de trabajo o no
  checkedCyrel : boolean = false; //Variable para saber si el checkbox del Cyrel está seleccionado o no
  checkedCorte : boolean = false; //Variable para saber si el checkbox del Corte está seleccionado o no
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  pedidosSinOT : any = []; //Variable que almacenará la informacion de los pedidos que no tienen orden de trabajo aun
  cantidadCostoProductos : number = 0; //Variable que se utilizará para mostrar el costo total de los productos provenientes del pedido
  ultimaOrdenTrabajo : number; // Variable que almacenará el numero de la OT que se está creando
  ArrayProducto : any [] = []; //Variable que tendrá la informacion de los productos que fueron pedidos
  estados : any = []; //Variable que almacenará los estados que puede tener una orden de trabajo
  tratado : any = []; //Vairbale que servirá para almacenar los tratado que puede tener una bolsa en el proceso de extrusion
  formatos : any = []; //Variable que servirá para almacenar los formatos que se harán en extrusion
  tiposImpresion : any = []; //Variable que guardará los diferentes tipos de impresion que hay en la empresa
  laminado_capas : any = []; //Vaiable qie almacenará los diferentes laminados
  cantidadKgMasMargen : number = 0; //Variable que almacenará el total que se va a producir en la orden de trabajo, sumandole el margen que le proporcionen
  cantidadUndMasMargen : number = 0; //Variable que almacenará el total que se va a producir en la orden de trabajo, sumandole el margen que le proporcionen
  producto : number = 0; //Variable que almacenará el producto al que se espera que se le cree la orden de trabajo
  pedidoId : number = 0; //VAriable que almacenará el pedido del cual se estará creando la orden de trabajo
  clienteId : number = 0; //Variable que almacenará el ID de la sede del cliente al cual se le creará la orden de trabajo
  cantidadKilos : number = 0; //Variable que va a almacenar la cantidad de kilos pedidos en el pedido y que se harán en la orden de trabajo
  cantidadUnidades : number = 0; //Variable que va a almacenar la cantidad de unidades pedidas en el pedido y que se harán en la orden de trabajo
  pesoProducto : number = 0; //Variable que va a almacenar el peso del producto al que se le hará la orden de trabajo
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
  corte : boolean = false; //Variable que servirá para saber si se pasará por el proceso o no
  sellado : boolean = false; //Variable que servirá para saber si se pasará por el proceso o no
  cantidadProducto : number = 0; //Variable que almacenará la cantidad de producto que se va a pedir
  valorProducto : number = 0; //Variable que almacenrá ek valor total el producto
  netoKg : number = 0; //Variable que almacenará el peso neto en kilogramos que se debe producir
  valorKg : number = 0; //Variable que almacenará el valor del kilogramo
  valorOt : number = 0; //Variable que almacenará el valor total de la orden de trabajo
  margenKg : number = 0; //Variable que almcanerá la cantidad adicional de kg que se harán para manejar un margen de error
  pesoPaquete : number = 0; //Variable que almacenará cuantos kg pesa un paquete
  pesoBulto : number = 0; //Variable que almacenará cuantos kg pesa un bulto
  informacionSeleccionada : any; //Variable que almacenará la información del producto seleccionado

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
                private rolService : RolesService,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
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
                                                                  private tipoSelladoService : TiposSelladoService,) {

    this.FormOrdenTrabajo = this.frmBuilderPedExterno.group({
      OT_Id: [''],
      Pedido_Id: ['', Validators.required],
      Nombre_Vendedor: ['', Validators.required],
      OT_FechaCreacion: this.today,
      OT_FechaEntrega: ['', Validators.required],
      Id_Sede_Cliente : ['', Validators.required],
      ID_Cliente: ['', Validators.required],
      Nombre_Cliente: ['', Validators.required],
      Ciudad_SedeCliente: ['', Validators.required],
      Direccion_SedeCliente : ['', Validators.required],
      OT_Estado : ['', Validators.required],
      OT_Observacion : [''],
      Margen : [0, Validators.required],
      OT_Cyrel : [''],
      OT_Extrusion : [''],
      OT_Impresion : [''],
      OT_Rotograbado : [''],
      OT_Laminado : [''],
      OT_Corte : [''],
      OT_Doblado : [''],
      OT_Sellado : [''],
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
      UnidadMedida_Extrusion : ['', Validators.required],
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
      Formato_Corte : ['', Validators.required],
      Ancho_Corte : ['', Validators.required],
      Largo_Corte : ['', Validators.required],
      Fuelle_Corte : ['', Validators.required],
      Margen_Corte : ['', Validators.required],
    });

    this.FormOrdenTrabajoSellado = this.frmBuilderPedExterno.group({
      Formato_Sellado : ['', Validators.required],
      Ancho_Sellado : ['', Validators.required],
      Largo_Sellado : ['', Validators.required],
      Fuelle_Sellado : ['', Validators.required],
      Margen_Sellado : ['', Validators.required],
      PesoMillar : [0, Validators.required],
      TipoSellado : [0, Validators.required],
      PrecioDia : [0, Validators.required],
      PrecioNoche : [0, Validators.required],
      CantidadPaquete : [0, Validators.required],
      PesoPaquete : [0, Validators.required],
      CantidadBulto : [0, Validators.required],
      PesoBulto : [0, Validators.required],
    });

    /** Formulario para creación de mezclas */
    this.formCrearMezclas = this.frmBuilderPedExterno.group({
      idMezcla : null,
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


    this.FormOrdenTrabajoMezclas = this.frmBuilderPedExterno.group({
      Id_Mezcla : ['', Validators.required],
      Nombre_Mezclas : ['', Validators.required],
      Chechbox_Capa1 : ['', Validators.required],
      Chechbox_Capa2 : ['', Validators.required],
      Chechbox_Capa3 : ['', Validators.required],
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

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.storage.get('Id');
    this.storage_Nombre = this.storage.get('Nombre');
    this.ValidarRol = this.storage.get('Rol');
  }

  // Funcion que limpiará todos los campos
  limpiarCampos(){
    this.FormOrdenTrabajo.patchValue({
      OT_Id: '',
      Pedido_Id: '',
      Nombre_Vendedor: '',
      OT_FechaCreacion: this.today,
      OT_FechaEntrega: '',
      Id_Sede_Cliente : '',
      ID_Cliente: '',
      Nombre_Cliente: '',
      Ciudad_SedeCliente: '',
      Direccion_SedeCliente : '',
      OT_Estado : 11,
      OT_Observacion : '',
      Margen : 0,
      OT_Cyrel : '',
      OT_Extrusion : false,
      OT_Impresion : false,
      OT_Rotograbado : false,
      OT_Laminado : false,
      OT_Corte : false,
      OT_Doblado : false,
      OT_Sellado : false,
    });
    this.FormOrdenTrabajoExtrusion.patchValue({
      Material_Extrusion : 1,
      Formato_Extrusion : 1,
      Pigmento_Extrusion : 1,
      Ancho_Extrusion1 : 0,
      Ancho_Extrusion2 : 0,
      Ancho_Extrusion3 : 0,
      Calibre_Extrusion : 0,
      UnidadMedida_Extrusion : '',
      Tratado_Extrusion : 1,
      Peso_Extrusion : 0,
    });
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
    this.FormOrdenTrabajoMezclas.patchValue({
      Id_Mezcla: '',
      Nombre_Mezclas : '',
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
      materialP_Capa3 : 1,
      PorcentajeMaterialP_Capa3 : 0,
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
    this.FormOrdenTrabajoCorte.patchValue({
      Formato_Corte : '',
      Ancho_Corte : '',
      Largo_Corte : '',
      Fuelle_Corte : '',
      Margen_Corte : '',
    });
    this.FormOrdenTrabajoSellado.patchValue({
      Formato_Sellado : '',
      Ancho_Sellado : '',
      Largo_Sellado : '',
      Fuelle_Sellado : '',
      Margen_Sellado : '',
      PesoMillar : 0,
      TipoSellado : 0,
      PrecioDia : 0,
      PrecioNoche : 0,
      CantidadPaquete : 0,
      PesoPaquete : 0,
      CantidadBulto : 0,
      PesoBulto : 0,
    });
    this.checkedCyrel = false;
    this.checkedCorte = false;
    this.checkedCapa1 = false;
    this.checkedCapa2 = false;
    this.checkedCapa3 = false;
    this.ArrayProducto = [];
    this.cantidadKgMasMargen = 0;
    this.cantidadUndMasMargen = 0;
    this.producto = 0;
    this.pedidoId = 0;
    this.clienteId = 0;
    this.cantidadKilos = 0;
    this.cantidadUnidades = 0;
    this.pesoProducto = 0;
    this.idMezclaSeleccionada = 0;
    this.ultimaOT();
    this.pedidos();
    this.cargando = false;
    this.nroCapas = 0;
    this.nroCapasOT = 0;
  }

  /** Función que cargará las tintas en los combobox al momento de crear la OT. */
  cargarTintasEnProcesoImpresion(){
    this.servicioTintas.srvObtenerLista().subscribe(registrosTintas => { this.arrayTintas = registrosTintas; });
  }

  /** Función que cargará los pigmentos en el combobox al momento de crear la OT. */
  cargarPigmentosEnProcesoExtrusion(){
    this.servicioPigmentos.srvObtenerLista().subscribe(registrosPigmentos => { this.arrayPigmentos = registrosPigmentos; });
  }

  //Funcion que cargará los estados que puede tener una orden de trabajo
  cargarEstados(){
    this.estadosService.srvObtenerListaEstados().subscribe(datos_estados => { this.estados = datos_estados; });
  }

  /** Función que cargará los materiales en el combobox al momento de crear la OT. */
  cargarMaterialEnProcesoExtrusion(){
    this.servicioMateriales.srvObtenerLista().subscribe(registrosMateriasProd => { this.arrayMateriales = registrosMateriasProd; });
  }

   /** Función que cargará los materiales en el combobox al momento de llamar el modal de Crear Mezclas. */
  cargarMateriales_MatPrima(){
    this.servicioMateriales.srvObtenerLista().subscribe(registrosMateriasProd => { this.arrayMateriales2 = registrosMateriasProd; });
  }

  /** Función que cargará las unidades de medida en el combobox al momento de crear la OT. */
  cargarUnidadMedidaEnProcesoExtrusion(){
    this.servicioUnidadMedida.srvObtenerLista().subscribe(datos_und => {
      for (let i = 0; i < datos_und.length; i++) {
        if (datos_und[i].undMed_Id == 'Cms' || datos_und[i].undMed_Id == 'Plgs') this.arrayUnidadesMedidas.push(datos_und[i].undMed_Id);
      }
    });
  }

  //Funcion que se encargará de cargar los diferentes tratados para el proceso de extrusion
  cargarTratadoEnProcesoExtrusion(){
    this.tratadoServise.srvObtenerLista().subscribe(datos_tratado => { this.tratado = datos_tratado; });
  }

  //Funcion que cargará los formatos para el proceso de extrusion
  cargarFormatosEnProcesoExtrusion(){
    this.formatoService.srvObtenerLista().subscribe(datos_formatos => { this.formatos = datos_formatos; });
  }

  //Funcion que cargará los diferentes tipos de impresion que maneja la empresa
  cargarTiposImpresion(){
    this.tiposImpresionService.srvObtenerLista().subscribe(datos_tiposImpresion => { this.tiposImpresion = datos_tiposImpresion; });
  }

  //Funcion que cargará los diferentes laminados
  cargarLaminados(){
    this.laminadoCapasService.srvObtenerLista().subscribe(datos_laminado => { this.laminado_capas = datos_laminado; });
  }

  // Funcion que cargará las mezclas de materiales
  cargarMezclaMateria(){
    this.mezclasMateriales = [];
    this.mezclaMaterialService.srvObtenerLista().subscribe(datos_mezclasMateriales => { this.mezclasMateriales = datos_mezclasMateriales; });
  }

  // Funcion que cargará las mezclas de materiales
  cargarMezclaMateria2(){
    this.mezclasMateriales2 = [];
    this.mezclaMaterialService.srvObtenerLista().subscribe(datos_mezclasMateriales => {
      for (let i = 0; i < datos_mezclasMateriales.length; i++) {
        this.mezclasMateriales2.push(datos_mezclasMateriales[i]);
      }
    });
  }

  // Funcion que cargará las mezclas de pigmentos
  cargarMezclaPigmento(){
    this.mezclaPigmentosService.srvObtenerLista().subscribe(datos_mezclaPigmentos => { this.mezclasPigmentos = datos_mezclaPigmentos; });
  }

    // Funcion que cargará las mezclas de pigmentos
  cargarMezclaPigmento2(){
    this.mezclasPigmentos2 = [];
    this.mezclaPigmentosService.srvObtenerLista().subscribe(datos_mezclaPigmentos => {
      for (let i = 0; i < datos_mezclaPigmentos.length; i++) {
        this.mezclasPigmentos2.push(datos_mezclaPigmentos[i])
      }
    });
  }

  // Funcion que cargará el nombre de las mezclas
  cargarMezclas(){
    this.mezclasService.srvObtenerLista().subscribe(datos_mezclas => { this.mezclas = datos_mezclas; });
  }

  //Funcion que va cargar cada uno de los componentes de la mezcla
  cargarCombinacionMezclas(){
    this.mezclasService.srvObtenerListaPorId(this.FormOrdenTrabajoMezclas.value.Nombre_Mezclas).subscribe(datos_mezcla => {
      this.nroCapasOT = datos_mezcla.mezcla_NroCapas;
      /*if (datos_mezcla.mezcla_NroCapas == 1) {
        this.checkedCapa1 = true;
        this.checkedCapa2 = false;
        this.checkedCapa3 = false;
        const capa1 : any = document.getElementById("capa1");
        capa1.click();
      } else if (datos_mezcla.mezcla_NroCapas == 2) {
        this.checkedCapa1 = false;
        this.checkedCapa2 = true;
        this.checkedCapa3 = false;
        const capa2 : any = document.getElementById("capa2");
        capa2.click();
      } else if (datos_mezcla.mezcla_NroCapas == 3) {
        this.checkedCapa1 = false;
        this.checkedCapa2 = false;
        this.checkedCapa3 = true;
        const capa3 : any = document.getElementById("capa3");
        capa3.click();
      }*/
      this.FormOrdenTrabajoMezclas = this.frmBuilderPedExterno.group({
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
      setTimeout(() => {
        this.FormOrdenTrabajoMezclas.disable();
        this.FormOrdenTrabajoMezclas.get('Nombre_Mezclas').enable();
        this.FormOrdenTrabajoMezclas.get('Id_Mezclas').enable();
      }, 1000);



    }, error => {
      this.mezclasService.getMezclaNombre(this.FormOrdenTrabajoMezclas.value.Nombre_Mezclas).subscribe(datos_mezcla => {
        this.nroCapasOT = datos_mezcla.mezcla_NroCapas;
        /*if (datos_mezcla.mezcla_NroCapas == 1) {
          this.checkedCapa1 = true;
          this.checkedCapa2 = false;
          this.checkedCapa3 = false;
          const capa1 : any = document.getElementById("capa1");
          capa1.click();
        } else if (datos_mezcla.mezcla_NroCapas == 2) {
          this.checkedCapa1 = false;
          this.checkedCapa2 = true;
          this.checkedCapa3 = false;
          const capa2 : any = document.getElementById("capa2");
          capa2.click();
        } else if (datos_mezcla.mezcla_NroCapas == 3) {
          this.checkedCapa1 = false;
          this.checkedCapa2 = false;
          this.checkedCapa3 = true;
          const capa3 : any = document.getElementById("capa3");
          capa3.click();
        }*/
        this.FormOrdenTrabajoMezclas = this.frmBuilderPedExterno.group({
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
      });
    });
  }

  // Funcion que va cargará la informacion de los tipos de productos
  cargarTiposProductos(){
    this.tiposProductosService.srvObtenerLista().subscribe(datos => { this.tipoProductos = datos });
  }

  // Funcion que va a cargar la informacion de los tipos de sellado
  cargarTiposSellado(){
    this.tipoSelladoService.srvObtenerLista().subscribe(datos => { this.tipoSellado = datos });
  }

  // Funcion que traerá la ultima orden de trabajo para poder tomar el ID de la OT
  ultimaOT(){
    this.bagProService.srvObtenerListaClienteOT_UltimaOT().subscribe(datos_ot => { this.ultimaOrdenTrabajo = datos_ot.item + 1;  });
  }

  //Funcion que servirá para mostrar la informacion de los pedidos que no tienen orden de trabajo
  pedidos(){
    this.pedidoExternoService.GetPedidosSinOT().subscribe(datos => { this.pedidosSinOT = datos });
  }

  // funcion que consultará la informacion del pedido apra crear la orden de trabajo
  informacionPedido(){
    let pedido : number = this.FormOrdenTrabajo.value.Pedido_Id;
    this.cantidadKgMasMargen = 0;
    this.cantidadUndMasMargen = 0;
    this.cantidadCostoProductos = 0;
    this.ArrayProducto = [];
    this.limpiarCampos();
    this.pedidoExternoService.GetInfoPedido(pedido).subscribe(datos => {
      for (let i = 0; i < datos.length; i++) {
        this.FormOrdenTrabajo.patchValue({
          OT_Id: null,
          Pedido_Id: pedido,
          Nombre_Vendedor: datos[i].vendedor,
          OT_FechaCreacion: this.today,
          OT_FechaEntrega: null,
          Id_Sede_Cliente : datos[i].id_Sede_Cliente,
          ID_Cliente: datos[i].id_Cliente,
          Nombre_Cliente: datos[i].cliente,
          Ciudad_SedeCliente: datos[i].ciudad,
          Direccion_SedeCliente : datos[i].direccion,
          OT_Estado : datos[i].estado,
          OT_Observacion : datos[i].observacion,
          Margen : 0,
          OT_Cyrel : this.checkedCyrel,
          OT_Extrusion : this.extrusion,
          OT_Impresion : this.impresion,
          OT_Rotograbado : this.rotograbado,
          OT_Laminado : this.laminado,
          OT_Corte : this.checkedCorte,
          OT_Doblado : this.doblado,
          OT_Sellado : this.sellado,
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
          Cant : datos[i].cantidad_Pedida,
          Cant_Inicial : datos[i].cantidad_Pedida,
          UndCant : datos[i].und_Pedido,
          TipoSellado : datos[i].tipo_Sellado,
          PrecioUnd : datos[i].precio_Producto,
          SubTotal : datos[i].subTotal_Producto,
          FechaEntrega : datos[i].fecha_Entrega.replace('T00:00:00', ''),
        }
        this.ArrayProducto.push(productoExt);
        this.cantidadCostoProductos += datos[i].subTotal_Producto;
      }
    });
  }

  // Funcion que va buscar, almacenar y mostrar la información de la ultima orden de trabajo para un producto con una presentacion especifica
  consultarInfoProducto(data : any){
    this.informacionSeleccionada = data;
    this.cantidadKgMasMargen = 0;
    this.cantidadUndMasMargen = 0;
    this.cantidadProducto = 0;
    this.valorProducto = 0;
    this.netoKg = 0;
    this.valorKg = 0;
    this.valorOt = 0;
    this.margenKg = 0;
    this.pesoPaquete = 0;
    this.pesoBulto = 0;
    this.producto = data.Id;
    this.presentacionProducto = data.UndCant;
    this.ordenTrabajoService.GetInfoUltOT(data.Id, data.UndCant).subscribe(datos_Ot => {
      this.FormOrdenTrabajo.patchValue({
        OT_FechaEntrega: data.FechaEntrega,
        OT_Observacion : datos_Ot.observacion,
        Margen : datos_Ot.margen_Adicional,
      });
      this.FormOrdenTrabajoExtrusion.patchValue({
        Material_Extrusion : datos_Ot.material_Extrusion_Id,
        Formato_Extrusion : datos_Ot.formato_Extrusion_Id,
        Pigmento_Extrusion : datos_Ot.pigmento_Extrusion_Id,
        Ancho_Extrusion1 : datos_Ot.ancho1_Extrusion,
        Ancho_Extrusion2 : datos_Ot.ancho2_Extrusion,
        Ancho_Extrusion3 : datos_Ot.ancho3_Extrusion,
        Calibre_Extrusion : datos_Ot.calibre_Extrusion,
        UnidadMedida_Extrusion : datos_Ot.undMed_Extrusion,
        Tratado_Extrusion : datos_Ot.tratado_Extrusion_Id,
        Peso_Extrusion : datos_Ot.peso_Extrusion,
      });
      this.FormOrdenTrabajoImpresion.patchValue({
        Tipo_Impresion : datos_Ot.tipo_Impresion_Id,
        Rodillo_Impresion : datos_Ot.rodillo_Impresion,
        Pista_Impresion : datos_Ot.pista_Impresion,
        Tinta_Impresion1 : datos_Ot.tinta1_Impresion,
        Tinta_Impresion2 : datos_Ot.tinta2_Impresion,
        Tinta_Impresion3 : datos_Ot.tinta3_Impresion,
        Tinta_Impresion4 : datos_Ot.tinta4_Impresion,
        Tinta_Impresion5 : datos_Ot.tinta5_Impresion,
        Tinta_Impresion6 : datos_Ot.tinta6_Impresion,
        Tinta_Impresion7 : datos_Ot.tinta7_Impresion,
        Tinta_Impresion8 : datos_Ot.tinta8_Impresion,
      });
      this.FormOrdenTrabajoLaminado.patchValue({
        Capa_Laminado1 : datos_Ot.capa1_Laminado_Id,
        Calibre_Laminado1 : datos_Ot.calibre1_Laminado,
        cantidad_Laminado1 : datos_Ot.cantidad2_Laminado,
        Capa_Laminado2 : datos_Ot.capa2_Laminado_Id,
        Calibre_Laminado2 : datos_Ot.calibre2_Laminado,
        cantidad_Laminado2 : datos_Ot.cantidad2_Laminado,
        Capa_Laminado3 : datos_Ot.capa3_Laminado_Id,
        Calibre_Laminado3 : datos_Ot.calibre3_Laminado,
        cantidad_Laminado3 : datos_Ot.cantidad3_Laminado,
      });
      this.FormOrdenTrabajoCorte.patchValue({
        Formato_Corte : data.Tipo,
        Ancho_Corte : data.Ancho,
        Largo_Corte : data.Largo,
        Fuelle_Corte : data.Fuelle,
        Margen_Corte : datos_Ot.margen_Adicional,
      });
      this.FormOrdenTrabajoSellado.patchValue({
        Formato_Sellado : data.Tipo,
        Ancho_Sellado : data.Ancho,
        Largo_Sellado : data.Largo,
        Fuelle_Sellado : data.Fuelle,
        Margen_Sellado : datos_Ot.margen_Adicional,
        PesoMillar : data.PesoMillar,
        TipoSellado : data.TipoSellado,
        CantidadPaquete : data.CantPaquete,
        CantidadBulto : data.CantBulto,
      });
      this.checkedCyrel = datos_Ot.cyrel
      this.extrusion = datos_Ot.extrusion;
      this.impresion = datos_Ot.impresion;
      this.rotograbado = datos_Ot.rotograbado;
      this.laminado = datos_Ot.laminado;
      this.checkedCorte = datos_Ot.corte;
      this.sellado = datos_Ot.sellado;
      setTimeout(() => { this.calcularDatosOt(data) }, 500);
      /*if (datos_Ot.cant_Capas_Mezclas == 1) {
        this.checkedCapa1 = true;
        this.checkedCapa2 = false;
        this.checkedCapa3 = false;
        const capa1 : any = document.getElementById("capa1");
        capa1.click();
      } else if (datos_Ot.cant_Capas_Mezclas == 2) {
        this.checkedCapa1 = false;
        this.checkedCapa2 = true;
        this.checkedCapa3 = false;
        const capa2 : any = document.getElementById("capa2");
        capa2.click();
      } else if (datos_Ot.cant_Capas_Mezclas == 3) {
        this.checkedCapa1 = false;
        this.checkedCapa2 = false;
        this.checkedCapa3 = true;
        const capa3 : any = document.getElementById("capa3");
        capa3.click();
      }*/

      this.FormOrdenTrabajoMezclas.patchValue({
        Id_Mezcla : datos_Ot.mezcla_Id,
        Nombre_Mezclas : datos_Ot.mezcla,
        Chechbox_Capa1 : datos_Ot.cant_Capas_Mezclas,
        Chechbox_Capa2 : '',
        Chechbox_Capa3 : '',
        Proc_Capa1 : datos_Ot.capa1_Mezcla,
        Proc_Capa2 : datos_Ot.capa2_Mezcla,
        Proc_Capa3 : datos_Ot.capa3_Mezcla,
        materialP1_Capa1 : datos_Ot.material1_Capa1_Mezcla_Id,
        PorcentajeMaterialP1_Capa1 : datos_Ot.porcentaje_Material1_Capa1_Mezcla,
        materialP1_Capa2 : datos_Ot.material1_Capa2_Mezcla_Id,
        PorcentajeMaterialP1_Capa2 : datos_Ot.porcentaje_Material1_Capa2_Mezcla,
        materialP1_Capa3 : datos_Ot.material1_Capa3_Mezcla_Id,
        PorcentajeMaterialP1_Capa3 : datos_Ot.porcentaje_Material1_Capa3_Mezcla,
        materialP2_Capa1 : datos_Ot.material2_Capa1_Mezcla_Id,
        PorcentajeMaterialP2_Capa1 : datos_Ot.porcentaje_Material2_Capa1_Mezcla,
        materialP2_Capa2 : datos_Ot.material2_Capa2_Mezcla_Id,
        PorcentajeMaterialP2_Capa2 : datos_Ot.porcentaje_Material2_Capa2_Mezcla,
        materialP2_Capa3 : datos_Ot.material2_Capa3_Mezcla_Id,
        PorcentajeMaterialP2_Capa3 : datos_Ot.porcentaje_Material2_Capa3_Mezcla,
        materialP3_Capa1 : datos_Ot.material3_Capa1_Mezcla_Id,
        PorcentajeMaterialP3_Capa1 : datos_Ot.porcentaje_Material3_Capa1_Mezcla,
        materialP3_Capa2 : datos_Ot.material3_Capa2_Mezcla_Id,
        PorcentajeMaterialP3_Capa2 : datos_Ot.porcentaje_Material3_Capa2_Mezcla,
        materialP3_Capa3 : datos_Ot.material3_Capa3_Mezcla_Id,
        PorcentajeMaterialP3_Capa3 : datos_Ot.porcentaje_Material3_Capa3_Mezcla,
        materialP4_Capa1 : datos_Ot.material4_Capa1_Mezcla_Id,
        PorcentajeMaterialP4_Capa1 : datos_Ot.porcentaje_Material4_Capa1_Mezcla,
        materialP4_Capa2 : datos_Ot.material4_Capa2_Mezcla_Id,
        PorcentajeMaterialP4_Capa2 : datos_Ot.porcentaje_Material4_Capa2_Mezcla,
        materialP_Capa3 : datos_Ot.material4_Capa3_Mezcla_Id,
        PorcentajeMaterialP_Capa3 : datos_Ot.porcentaje_Material4_Capa3_Mezcla,
        MezclaPigmentoP1_Capa1 : datos_Ot.pigmento1_Capa1_Mezcla_Id,
        PorcentajeMezclaPigmentoP1_Capa1 : datos_Ot.porcentaje_Pigmento1_Capa1_Mezcla,
        MezclaPigmentoP1_Capa2 : datos_Ot.pigmento1_Capa2_Mezcla_Id,
        PorcentajeMezclaPigmentoP1_Capa2 : datos_Ot.porcentaje_Pigmento1_Capa2_Mezcla,
        MezclaPigmento1_Capa3 : datos_Ot.pigmento1_Capa3_Mezcla_Id,
        PorcentajeMezclaPigmentoP1_Capa3 :datos_Ot.porcentaje_Pigmento1_Capa3_Mezcla,
        MezclaPigmentoP2_Capa1 : datos_Ot.pigmento2_Capa1_Mezcla_Id,
        PorcentajeMezclaPigmentoP2_Capa1 : datos_Ot.porcentaje_Pigmento2_Capa1_Mezcla,
        MezclaPigmentoP2_Capa2 : datos_Ot.pigmento2_Capa2_Mezcla_Id,
        PorcentajeMezclaPigmentoP2_Capa2 : datos_Ot.porcentaje_Pigmento2_Capa2_Mezcla,
        MezclaPigmento2_Capa3 : datos_Ot.pigmento2_Capa3_Mezcla_Id,
        PorcentajeMezclaPigmentoP2_Capa3 : datos_Ot.porcentaje_Pigmento2_Capa3_Mezcla,
      });

      setTimeout(() => {
        this.FormOrdenTrabajoMezclas.disable();
        this.FormOrdenTrabajoMezclas.get('Nombre_Mezclas').enable();
        this.FormOrdenTrabajoMezclas.get('Id_Mezcla').enable();
      }, 1000);

    }, error => {
      let presentacion : string = data.UndCant;
      if (presentacion == 'Kg') presentacion = 'Kilo';
      else if (presentacion == 'Und') presentacion = 'Unidad';
      let impresion : any;
      let laminadoCapa1 : any, laminadoCapa2 : any, laminadoCapa3 : any;
      this.bagProService.srvObtenerListaClienteOT_Item_Presentacion(data.Id, presentacion).subscribe(datos_Ot => {
        let ot : any = [];
        ot.push(datos_Ot);
        for (const itemOt of ot) {
          this.FormOrdenTrabajo.patchValue({
            OT_FechaEntrega: data.FechaEntrega,
            OT_Observacion : itemOt.observacion,
            Margen : itemOt.ptMargen,
          });

          if (itemOt.cyrel == 1) this.checkedCyrel = true;
          else if (itemOt.cyrel == 0) this.checkedCyrel = false;

          if (itemOt.corte == 1) this.checkedCorte = true;
          else if (itemOt.corte == 0) this.checkedCorte = false;

          this.FormOrdenTrabajoExtrusion.patchValue({
            Material_Extrusion : parseInt(itemOt.extMaterial.trim()),
            Formato_Extrusion : parseInt(itemOt.ptFormatopt.trim()),
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
                Tinta_Impresion1 : datos_impresion[j].tinta_Id1,
                Tinta_Impresion2 : datos_impresion[j].tinta_Id2,
                Tinta_Impresion3 : datos_impresion[j].tinta_Id3,
                Tinta_Impresion4 : datos_impresion[j].tinta_Id4,
                Tinta_Impresion5 : datos_impresion[j].tinta_Id5,
                Tinta_Impresion6 : datos_impresion[j].tinta_Id6,
                Tinta_Impresion7 : datos_impresion[j].tinta_Id7,
                Tinta_Impresion8 : datos_impresion[j].tinta_Id8,
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
            PrecioDia : 0,
            PrecioNoche : 0,
            CantidadPaquete : data.CantPaquete,
            PesoPaquete : 0,
            CantidadBulto : data.CantBulto,
            PesoBulto : 0,
          });
          setTimeout(() => { this.calcularDatosOt(data); }, 1000);
          this.FormOrdenTrabajoMezclas.value.Nombre_Mezclas = itemOt.mezModoNom;
          this.cargarCombinacionMezclas();
        }
      }, error => { this.mensajeAdvertencia(`No se encuentra una Orden de Trabajo anterior para el producto ${data.Id} y presentación ${presentacion}`); });
    });
  }

  // Funcion que va a calcular los datos de la ot
  calcularDatosOt(data : any){
    let margen_Adicional = this.FormOrdenTrabajoSellado.value.Margen_Sellado | this.FormOrdenTrabajoCorte.value.Margen_Corte;
    if (this.checkedCorte) margen_Adicional = this.FormOrdenTrabajoCorte.value.Margen_Corte;
    if (this.sellado) margen_Adicional = this.FormOrdenTrabajoSellado.value.Margen_Sellado;
    this.FormOrdenTrabajo.patchValue({Margen : margen_Adicional});
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
    } else this.mensajeAdvertencia(`¡Debe elegir una unidad de medida para extrusión!`);
  }

  // Funcion que se se ejecurá cuando hayan deseleccionado un producto
  onRowUnselect(){
    this.FormOrdenTrabajoExtrusion.patchValue({
      Material_Extrusion : 1,
      Formato_Extrusion : 1,
      Pigmento_Extrusion : 1,
      Ancho_Extrusion1 : 0,
      Ancho_Extrusion2 : 0,
      Ancho_Extrusion3 : 0,
      Calibre_Extrusion : 0,
      UnidadMedida_Extrusion : '',
      Tratado_Extrusion : 1,
    });
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
    this.FormOrdenTrabajoMezclas.patchValue({
      Id_Mezcla: '',
      Nombre_Mezclas : '',
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
      materialP_Capa3 : 1,
      PorcentajeMaterialP_Capa3 : 0,
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
    this.informacionSeleccionada = '';
    this.checkedCapa1 = false;
    this.checkedCapa2 = false;
    this.checkedCapa3 = false;
    this.cantidadKgMasMargen = 0;
    this.cantidadUndMasMargen = 0;
    this.producto = 0;
    this.cantidadKilos = 0;
    this.cantidadUnidades = 0;
    this.pesoProducto = 0;
    this.idMezclaSeleccionada = 0;
    this.extrusion = false;
    this.impresion = false;
    this.rotograbado = false;
    this.laminado = false;
    this.checkedCorte = false;
    this.sellado = false;
  }

  //Funcion que va a guardar la información de la orden de trabajo
  guardarOt(){
    let fechaEntrega : any = this.FormOrdenTrabajo.value.OT_FechaEntrega;
    let ordenTrabajo : any = this.FormOrdenTrabajo.value.OT_Id;
    if(fechaEntrega == null) this.FormOrdenTrabajo.value.OT_FechaEntrega = this.today;
    if(ordenTrabajo == null) this.FormOrdenTrabajo.value.OT_Id = 309;

    if (!this.FormOrdenTrabajoLaminado.valid || !this.FormOrdenTrabajoImpresion.valid || !this.FormOrdenTrabajoExtrusion.valid || !this.FormOrdenTrabajo.valid){
      console.log(this.FormOrdenTrabajoLaminado)
      console.log(this.FormOrdenTrabajoImpresion)
      console.log(this.FormOrdenTrabajoExtrusion)
      console.log(this.FormOrdenTrabajo)
      this.mensajeAdvertencia("!Hay campos vacíos¡");
    } else if (this.FormOrdenTrabajoLaminado.valid && this.FormOrdenTrabajoImpresion.valid && this.FormOrdenTrabajoExtrusion.valid && this.FormOrdenTrabajo.valid){
      this.cargando = true;
      let errorExt : boolean = false, errorImp : boolean = false, errorLam : boolean = false, errorSelCor : boolean = false, cyrelOT : any, corteOT : any;
      if (this.checkedCyrel) cyrelOT = '1';
      else cyrelOT = '0';
      if (this.checkedCorte) corteOT = '1'
      else corteOT = '0';
      let infoOT : any = {
        SedeCli_Id : this.FormOrdenTrabajo.value.Id_Sede_Cliente,
        Prod_Id : this.producto,
        Ot_PesoNetoKg : this.netoKg,
        Ot_ValorOT : this.valorOt,
        Ot_MargenAdicional : this.FormOrdenTrabajo.value.Margen,
        Ot_ValorKg : this.valorKg,
        Ot_ValorUnidad : this.valorProducto,
        Ot_FechaCreacion : this.today,
        Estado_Id : 4,
        Usua_Id : this.storage_Id,
        PedExt_Id : parseInt(this.FormOrdenTrabajo.value.Pedido_Id),
        Ot_Observacion : this.FormOrdenTrabajo.value.OT_Observacion,
        Ot_Cyrel : cyrelOT,
        Ot_Corte : corteOT,
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
        errorImp = this.guardarOt_Impresion(datos_ot.ot_Id);
        this.cambiarEstadoCliente(this.FormOrdenTrabajo.value.ID_Cliente);
        setTimeout(() => { this.pdfOrdenTrabajo(datos_ot.ot_Id); }, 1500);
        setTimeout(() => {
          if (!errorExt && !errorImp && !errorLam && !errorSelCor) Swal.fire({icon: 'success', title: '¡Orden de Trabajo Creada!', text: `Se ha creado la de trabajo N°${datos_ot.ot_Id}`});
          this.limpiarCampos();
        }, 2000);
      }, err => {
        this.mensajeError(`¡No fue posible crear la Orden de Trabajo!`, err.message);
        this.cargando = false;
      });
    }
  }

  //Funcion que va a guardar la informacion de extrusion de la orden de trabajo
  guardarOt_Extrusion(ordenTrabajo : number){
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
    this.otExtrusionServie.srvGuardar(infoOTExt).subscribe(datos_otExtrusion => { return true; }, error => { this.mensajeError(`¡No se guardó información de la OT en el área de 'Extrusión'!`, error.message); });
    return false;
  }

  //Funcion que va a guardar la informacion de impresion de la orden de trabajo
  guardarOt_Impresion(ordenTrabajo : number){
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
        this.otImpresionService.srvGuardar(infoOTImp).subscribe(datos_otImpresion => { return true; }, error => { this.mensajeError(`¡No se guardó información de la OT en el área de 'Impresión' y 'Rotograbado'!`, error.message); });
      }
    });
    return false;
  }

  //Funcion que va a guardar la informacion de laminado de la orden de trabajo
  guardarOt_Laminado(ordenTrabajo : number){
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
    this.otLaminadoService.srvGuardar(infoOTLam).subscribe(datos_laminado => { return true; }, error => { this.mensajeError(`¡No se guardó información de la OT en el área de 'Laminado'!`, error.message); });
    return false;
  }

  // Funcion que va a guardar la informacion de la orden de trabajo para sellado y/o corte
  guardarOt_Sellado_Corte(ordenTrabajo : number){
    let info : any = {
      Ot_Id : ordenTrabajo,
      Corte :  this.checkedCorte,
      Sellado :  this.sellado,
      Formato_Id : this.FormOrdenTrabajoSellado.value.Formato_Sellado,
      SelladoCorte_Ancho : this.FormOrdenTrabajoSellado.value.Ancho_Sellado,
      SelladoCorte_Largo : this.FormOrdenTrabajoSellado.value.Largo_Sellado,
      SelladoCorte_Fuelle : this.FormOrdenTrabajoSellado.value.Fuelle_Sellado,
      SelladoCorte_PesoMillar : this.FormOrdenTrabajoSellado.value.PesoMillar,
      TpSellado_Id : this.FormOrdenTrabajoSellado.value.TipoSellado,
      SelladoCorte_PrecioSelladoDia : this.FormOrdenTrabajoSellado.value.PrecioDia,
      SelladoCorte_PrecioSelladoNoche : this.FormOrdenTrabajoSellado.value.PrecioNoche,
      SelladoCorte_CantBolsasPaquete : this.FormOrdenTrabajoSellado.value.CantidadPaquete,
      SelladoCorte_CantBolsasBulto : this.FormOrdenTrabajoSellado.value.PesoPaquete,
      SelladoCorte_PesoPaquete : this.FormOrdenTrabajoSellado.value.CantidadBulto,
      SelladoCorte_PesoBulto : this.FormOrdenTrabajoSellado.value.PesoBulto,
    }
    this.otSelladoCorteService.post(info).subscribe(datos => { return true; }, error => { this.mensajeError(`¡No se guardó información de la OT en el área de 'Sellado' o 'Corte'!`, error.message); });
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
        this.productoService.PutEstadoProducto(producto, info).subscribe(datos_Producto => { }, error => {
          Swal.fire({icon: 'error', title: 'Opps...', html: `<b>¡No fue posible actualizar el estado del producto ${producto}!</b><br><span style="color: #F00">${error.message}</span>`})
        });
      }
    }, error => { Swal.fire({icon: 'error', title: 'Opps...', html: `<b>¡El producto ${producto} no se ha encontrado!</b><br><span style="color: #F00">${error.message}</span>`}) });
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
      this.clienteServise.PutEstadoCliente(cliente, info).subscribe(datos => {  }, error => {
        Swal.fire({icon: 'error', title: 'Opps...', html: `<b>¡No fue posible actualizar el estado del cliente con el Id ${cliente}!</b><br><span style="color: #F00">${error.message}</span>`})
      });
    }, error => { Swal.fire({icon: 'error', title: 'Opps...', html: `<b>¡El cliente con el Id ${cliente} no se ha encontrado!</b><br><span style="color: #F00">${error.message}</span>`}) });
  }

  // Funcion que creará el PDF de la Orden de trabajo
  pdfOrdenTrabajo(ot : number = this.FormOrdenTrabajo.value.OT_Id){
    let usuario : string = this.storage.get('Nombre');
    this.ordenTrabajoService.srvObtenerListaPdfOTInsertada(ot).subscribe(datos_ot => {
      for (let i = 0; i < datos_ot.length; i++) {
        if (datos_ot[i].cyrel == "1") {
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
            content : [
              {
                columns: [
                  { image : logoParaPdf, width : 70, height :40 },
                  {
                    width: 390,
                    text: `PLASTICARIBE S.A.S 800188732-2.\nORDEN DE TRABAJO. ${moment().format('YYYY-MM-DD')}`,
                    style: 'titulo',
                    alignment: 'center',
                  },
                  { width: 90, text: `OT ${datos_ot[i].numero_Orden}`, style: 'ot', alignment: 'right', }
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
                      { border: [true, true, false, false], text: `Id Producto`, style: 'titulo', },
                      { border: [false, true, true, false], text: `${datos_ot[i].id_Producto}` },
                    ],
                    [
                      { border: [true, false, false, true], text: `Cliente`, style: 'titulo', },
                      { border: [false, false, true, true], text: `${datos_ot[i].cliente}` },
                      { border: [false, false, false, true], text: `Producto`, style: 'titulo', },
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
                fontSize: 10.5,
              },
              '\n',
              '\n',
              '\n',
              // Hoja 2
              {
                columns: [
                  { image : logoParaPdf, width : 70, height :40 },
                  {
                    width: 390,
                    text: `PLASTICARIBE S.A.S 800188732-2.\nORDEN DE TRABAJO. ${moment().format('YYYY-MM-DD')}`,
                    style: 'titulo',
                    alignment: 'center',
                  },
                  { width: 90, text: `OT ${ot}`, style: 'ot', alignment: 'right', }
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
                      { border: [true, true, false, false], text: `Id Producto`, style: 'titulo', },
                      { border: [false, true, true, false], text: `${datos_ot[i].id_Producto}` },
                    ],
                    [
                      { border: [true, false, false, true], text: `Cliente`, style: 'titulo', },
                      { border: [false, false, true, true], text: `${datos_ot[i].cliente}` },
                      { border: [false, false, false, true], text: `Producto`, style: 'titulo', },
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
                              { border : [], text : `${this.formatonumeros(datos_ot[i].ancho1_Extrusion)}       +       ${this.formatonumeros(datos_ot[i].ancho2_Extrusion)}       +       `, },
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
              {
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
              },
              '\n\n',
              {
                table : {
                  widths : [539],
                  style : '',
                  body : [
                    [ { border : [true, true, true, false], text : `Observación: ` } ],
                    [ { border : [true, false, true, true], text : `${datos_ot[i].observacion}` } ]
                  ]
                },
                layout: { defaultBorder: false,  },
                fontSize: 10.5,
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
        } else if (datos_ot[i].cyrel == "0") {
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
            content : [
              {
                columns: [
                  { image : logoParaPdf, width : 70, height :40 },
                  {
                    width: 390,
                    text: `PLASTICARIBE S.A.S 800188732-2.\nORDEN DE TRABAJO. ${moment().format('YYYY-MM-DD')}`,
                    style: 'titulo',
                    alignment: 'center',
                  },
                  { width: 90, text: `OT ${datos_ot[i].numero_Orden}`, style: 'ot', alignment: 'right', }
                ]
              },
              '\n',
              {
                style: 'tablaEmpresa',
                table: {
                  widths: [90, '*', 90, '*'],
                  style: 'header',
                  body: [
                    [
                      { border: [true, true, false, false], text: `Id Cliente`, style: 'titulo', },
                      { border: [false, true, false, false], text: `${datos_ot[i].id_Cliente}` },
                      { border: [true, true, false, false], text: `Id Producto`, style: 'titulo', },
                      { border: [false, true, true, false], text: `${datos_ot[i].id_Producto}` },
                    ],
                    [
                      { border: [true, false, false, true], text: `Cliente`, style: 'titulo', },
                      { border: [false, false, true, true], text: `${datos_ot[i].cliente}` },
                      { border: [false, false, false, true], text: `Producto`, style: 'titulo', },
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
                  widths : ['*'],
                  style : '',
                  body : [
                    [ { border : [true, true, true, false], text : `Observación: ` } ],
                    [ { border : [true, false, true, true], text : `${datos_ot[i].observacion}` } ]
                  ]
                },
                layout: { defaultBorder: false, },
                fontSize: 10.5,
              },
              '\n',
              '\n',
              '\n',
              // Hoja 2
              {
                columns: [
                  { image : logoParaPdf, width : 70, height :40 },
                  {
                    width: 390,
                    text: `PLASTICARIBE S.A.S 800188732-2.\nORDEN DE TRABAJO. ${moment().format('YYYY-MM-DD')}`,
                    style: 'titulo',
                    alignment: 'center',
                  },
                  { width: 90, text: `OT ${ot}`, style: 'ot', alignment: 'right', }
                ]
              },
              '\n',
              {
                style: 'tablaEmpresa',
                table: {
                  widths: [90, '*', 90, '*'],
                  style: 'header',
                  body: [
                    [
                      { border: [true, true, false, false], text: `Id Cliente`, style: 'titulo', },
                      { border: [false, true, false, false], text: `${datos_ot[i].id_Cliente}` },
                      { border: [true, true, false, false], text: `Id Producto`, style: 'titulo', },
                      { border: [false, true, true, false], text: `${datos_ot[i].id_Producto}` },
                    ],
                    [
                      { border: [true, false, false, true], text: `Cliente`, style: 'titulo', },
                      { border: [false, false, true, true], text: `${datos_ot[i].cliente}` },
                      { border: [false, false, false, true], text: `Producto`, style: 'titulo', },
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
                              { border : [], text : `${this.formatonumeros(datos_ot[i].ancho1_Extrusion)}       +       ${this.formatonumeros(datos_ot[i].ancho2_Extrusion)}       +       `, },
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
              '\n\n\n',
              {
                table : {
                  widths : ['*'],
                  style : '',
                  body : [
                    [ { border : [true, true, true, false], text : `Observación: ` } ],
                    [ { border : [true, false, true, true], text : `${datos_ot[i].observacion}` } ]
                  ]
                },
                layout: { defaultBorder: false,  },
                fontSize: 10.5,
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
      }
    });
  }

  // Funcion que va a consultar la informacion de la una orden de trabajo
  ConsultarOrdenTrabajo(){
    let numeroOT : number = this.FormOrdenTrabajo.value.OT_Id;
    this.ArrayProducto = [];

    this.ordenTrabajoService.srvObtenerListaPdfOTInsertada(numeroOT).subscribe(datos_orden => {
      for (let i = 0; i < datos_orden.length; i++) {
        this.FormOrdenTrabajo.patchValue({
          OT_Id: numeroOT,
          Pedido_Id: datos_orden[i].pedExt_Id,
          Nombre_Vendedor: datos_orden[i].vendedor,
          OT_FechaCreacion: datos_orden[i].ot_FechaCreacion.replace('T00:00:00', ''),
          OT_FechaEntrega: datos_orden[i].pedExt_FechaEntrega.replace('T00:00:00', ''),
          Id_Sede_Cliente : datos_orden[i].sedeCli_Id,
          ID_Cliente: datos_orden[i].cli_Id,
          Nombre_Cliente: datos_orden[i].cli_Nombre,
          Ciudad_SedeCliente: datos_orden[i].sedeCliente_Ciudad,
          Direccion_SedeCliente : datos_orden[i].sedeCliente_Direccion,
          OT_Estado : datos_orden[i].estado_Id,
          OT_Observacion : datos_orden[i].ot_Observacion,
          Margen : datos_orden[i].ot_MargenAdicional,
          OT_Cyrel : datos_orden[i].ot_Cyrel,
          OT_Corte : datos_orden[i].ot_Corte,
        });
        if (datos_orden[i].ot_Cyrel == 1) this.checkedCyrel = true;
        if (datos_orden[i].ot_Corte == 1) this.checkedCorte = true;

        let productoExt : any = {
          Id : datos_orden[i].prod_Id,
          Nombre : datos_orden[i].prod_Nombre,
          Ancho : datos_orden[i].prod_Ancho,
          Fuelle : datos_orden[i].prod_Fuelle,
          Largo : datos_orden[i].prod_Largo,
          Cal : datos_orden[i].prod_Calibre,
          Und : datos_orden[i].undMedACF,
          PesoMillar : datos_orden[i].prod_Peso_Millar,
          Tipo : datos_orden[i].tpProd_Nombre,
          Material : datos_orden[i].materialProducto,
          Pigmento : datos_orden[i].pigmentoProducto,
          CantPaquete : datos_orden[i].prod_CantBolsasPaquete,
          CantBulto : datos_orden[i].prod_CantBolsasBulto,
          Cant : datos_orden[i].ot_CantidadKilos,
          Cant_Inicial : datos_orden[i].ot_CantidadKilos,
          UndCant : datos_orden[i].presentacion_Id,
          TipoSellado : datos_orden[i].tpSellados_Nombre,
          PrecioUnd : datos_orden[i].pedExtProd_PrecioUnitario,
          SubTotal : datos_orden[i].pedExtProd_PrecioUnitario * datos_orden[i].ot_CantidadKilos,
        }
        this.ArrayProducto.push(productoExt);
        this.cantidadCostoProductos = datos_orden[i].pedExtProd_PrecioUnitario * datos_orden[i].ot_CantidadKilos;

        this.FormOrdenTrabajoExtrusion.patchValue({
          Material_Extrusion : datos_orden[i].material_Id,
          Formato_Extrusion : datos_orden[i].formato_Id,
          Pigmento_Extrusion : datos_orden[i].pigmt_Id,
          Ancho_Extrusion1 : datos_orden[i].extrusion_Ancho1,
          Ancho_Extrusion2 : datos_orden[i].extrusion_Ancho2,
          Ancho_Extrusion3 : datos_orden[i].extrusion_Ancho3,
          Calibre_Extrusion : datos_orden[i].calibre_Extrusion,
          UnidadMedida_Extrusion : datos_orden[i].undMed_Id,
          Tratado_Extrusion : datos_orden[i].tratado_Id,
        });
        this.FormOrdenTrabajoImpresion.patchValue({
          Tipo_Impresion : datos_orden[i].tpImpresion_Id,
          Rodillo_Impresion : datos_orden[i].rodillo_Id,
          Pista_Impresion : datos_orden[i].pista_Id,
          Tinta_Impresion1 : datos_orden[i].tinta1_Nombre,
          Tinta_Impresion2 : datos_orden[i].tinta2_Nombre,
          Tinta_Impresion3 : datos_orden[i].tinta3_Nombre,
          Tinta_Impresion4 : datos_orden[i].tinta4_Nombre,
          Tinta_Impresion5 : datos_orden[i].tinta5_Nombre,
          Tinta_Impresion6 : datos_orden[i].tinta6_Nombre,
          Tinta_Impresion7 : datos_orden[i].tinta7_Nombre,
          Tinta_Impresion8 : datos_orden[i].tinta8_Nombre,
        });
        this.FormOrdenTrabajoLaminado.patchValue({
          Capa_Laminado1 : datos_orden[i].capa_Id1,
          Calibre_Laminado1 : datos_orden[i].lamCapa_Calibre1,
          cantidad_Laminado1 : datos_orden[i].lamCapa_Cantidad1,
          Capa_Laminado2 : datos_orden[i].capa_Id2,
          Calibre_Laminado2 : datos_orden[i].lamCapa_Calibre2,
          cantidad_Laminado2 : datos_orden[i].lamCapa_Cantidad2,
          Capa_Laminado3 : datos_orden[i].capa_Id3,
          Calibre_Laminado3 : datos_orden[i].lamCapa_Calibre13,
          cantidad_Laminado3 : datos_orden[i].lamCapa_Cantidad3,
        });
        setTimeout(() => {
          if (this.pesoProducto != 0) {
            if (datos_orden.UndCant == 'Kg') {
              this.cantidadKilos = datos_orden.Cant;
              this.cantidadUnidades = datos_orden.Cant / this.pesoProducto;
            } else {
              this.cantidadUnidades = datos_orden.Cant;
              this.cantidadKilos = (datos_orden.Cant * this.pesoProducto) / 1000;
            }
          } else if (this.pesoProducto == 0) {
            this.cantidadKilos = datos_orden.Cant;
            this.cantidadUnidades = datos_orden.Cant;
          }
          this.cantidadKgMasMargen = this.cantidadKilos + ((this.cantidadKilos * this.FormOrdenTrabajo.value.Margen) / 100);
          this.cantidadUndMasMargen = this.cantidadUnidades + ((this.cantidadUnidades * this.FormOrdenTrabajo.value.Margen) / 100);
        }, 500);
        if (datos_orden[i].mezcla_NroCapas == 1) {
          this.checkedCapa1 = true;
          this.checkedCapa2 = false;
          this.checkedCapa3 = false;
          const capa1 : any = document.getElementById("capa1");
          capa1.click();
        } else if (datos_orden[i].mezcla_NroCapas == 2) {
          this.checkedCapa1 = false;
          this.checkedCapa2 = true;
          this.checkedCapa3 = false;
          const capa2 : any = document.getElementById("capa2");
          capa2.click();
        } else if (datos_orden[i].mezcla_NroCapas == 3) {
          this.checkedCapa1 = false;
          this.checkedCapa2 = false;
          this.checkedCapa3 = true;
          const capa3 : any = document.getElementById("capa3");
          capa3.click();
        }
        this.FormOrdenTrabajoMezclas.patchValue({
          Id_Mezcla : datos_orden[i].mezcla_Id,
          Nombre_Mezclas : datos_orden[i].mezcla_Nombre,
          Chechbox_Capa1 : this.checkedCapa1,
          Chechbox_Capa2 : this.checkedCapa2,
          Chechbox_Capa3 : this.checkedCapa3,
          Proc_Capa1 : datos_orden[i].mezcla_PorcentajeCapa1,
          Proc_Capa2 : datos_orden[i].mezcla_PorcentajeCapa2,
          Proc_Capa3 : datos_orden[i].mezcla_PorcentajeCapa3,
          materialP1_Capa1 : datos_orden[i].mezMaterial_Id1xCapa1,
          PorcentajeMaterialP1_Capa1 : datos_orden[i].mezcla_PorcentajeMaterial1_Capa1,
          materialP1_Capa2 : datos_orden[i].mezMaterial_Id1xCapa2,
          PorcentajeMaterialP1_Capa2 : datos_orden[i].mezcla_PorcentajeMaterial1_Capa2,
          materialP1_Capa3 : datos_orden[i].mezMaterial_Id1xCapa3,
          PorcentajeMaterialP1_Capa3 : datos_orden[i].mezcla_PorcentajeMaterial1_Capa3,
          materialP2_Capa1 : datos_orden[i].mezMaterial_Id2xCapa1,
          PorcentajeMaterialP2_Capa1 : datos_orden[i].mezcla_PorcentajeMaterial2_Capa1,
          materialP2_Capa2 : datos_orden[i].mezMaterial_Id2xCapa2,
          PorcentajeMaterialP2_Capa2 : datos_orden[i].mezcla_PorcentajeMaterial2_Capa2,
          materialP2_Capa3 : datos_orden[i].mezMaterial_Id2xCapa3,
          PorcentajeMaterialP2_Capa3 : datos_orden[i].mezcla_PorcentajeMaterial2_Capa3,
          materialP3_Capa1 : datos_orden[i].mezMaterial_Id3xCapa1,
          PorcentajeMaterialP3_Capa1 : datos_orden[i].mezcla_PorcentajeMaterial3_Capa1,
          materialP3_Capa2 : datos_orden[i].mezMaterial_Id3xCapa2,
          PorcentajeMaterialP3_Capa2 : datos_orden[i].mezcla_PorcentajeMaterial3_Capa2,
          materialP3_Capa3 : datos_orden[i].mezMaterial_Id3xCapa3,
          PorcentajeMaterialP3_Capa3 : datos_orden[i].mezcla_PorcentajeMaterial3_Capa3,
          materialP4_Capa1 : datos_orden[i].mezMaterial_Id4xCapa1,
          PorcentajeMaterialP4_Capa1 : datos_orden[i].mezcla_PorcentajeMaterial4_Capa1,
          materialP4_Capa2 : datos_orden[i].mezMaterial_Id4xCapa2,
          PorcentajeMaterialP4_Capa2 : datos_orden[i].mezcla_PorcentajeMaterial4_Capa2,
          materialP_Capa3 : datos_orden[i].mezMaterial_Id4xCapa3,
          PorcentajeMaterialP_Capa3 : datos_orden[i].mezcla_PorcentajeMaterial4_Capa3,
          MezclaPigmentoP1_Capa1 : datos_orden[i].mezPigmto_Id1xCapa1,
          PorcentajeMezclaPigmentoP1_Capa1 : datos_orden[i].mezcla_PorcentajePigmto1_Capa1,
          MezclaPigmentoP1_Capa2 : datos_orden[i].mezPigmto_Id1xCapa2,
          PorcentajeMezclaPigmentoP1_Capa2 : datos_orden[i].mezcla_PorcentajePigmto1_Capa2,
          MezclaPigmento1_Capa3 : datos_orden[i].mezPigmto_Id1xCapa3,
          PorcentajeMezclaPigmentoP1_Capa3 :datos_orden[i].mezcla_PorcentajePigmto1_Capa3,
          MezclaPigmentoP2_Capa1 : datos_orden[i].mezPigmto_Id2xCapa1,
          PorcentajeMezclaPigmentoP2_Capa1 : datos_orden[i].mezcla_PorcentajePigmto2_Capa1,
          MezclaPigmentoP2_Capa2 : datos_orden[i].mezPigmto_Id2xCapa2,
          PorcentajeMezclaPigmentoP2_Capa2 : datos_orden[i].mezcla_PorcentajePigmto2_Capa2,
          MezclaPigmento2_Capa3 : datos_orden[i].mezPigmto_Id2xCapa3,
          PorcentajeMezclaPigmentoP2_Capa3 : datos_orden[i].mezcla_PorcentajePigmto2_Capa3,
        });
      }
    }, error => { Swal.fire({icon:'error', title: 'OT no encontrada', text: `¡No se ha encontrado una orden de trabajo con el consecutivo ${numeroOT}!`}) });
  }

  //
  cargarModalMezclas() {
    this.modalMezclas = true;

    this.cargarMezclaMateria2();
    this.cargarMezclaPigmento2();
    this.cargarMateriales_MatPrima();
    setTimeout(() => { this.initFormCrearMezclas(); }, 1000);
  }

  //
  initFormCrearMezclas(){
    this.checkedCapa1 = false;
    this.checkedCapa2 = false;
    this.checkedCapa2 = false;
    this.idMezclaSeleccionada = 0;
    this.formCrearMezclas = this.frmBuilderPedExterno.group ({
      idMezcla : null,
      Nombre_Mezclas : null,
      Material_MatPrima : this.arrayMateriales2[0].material_Id,
      Chechbox_Capa1 : '',
      Chechbox_Capa2 : '',
      Chechbox_Capa3 : '',
      Proc_Capa1 : 0,
      Proc_Capa2 : 0,
      Proc_Capa3 : 0,
      materialP1_Capa1 : this.mezclasMateriales2[0].mezMaterial_Id,
      PorcentajeMaterialP1_Capa1 : [0, Validators.required],
      materialP1_Capa2 : this.mezclasMateriales2[0].mezMaterial_Id,
      PorcentajeMaterialP1_Capa2 : [0, Validators.required],
      materialP1_Capa3 : this.mezclasMateriales2[0].mezMaterial_Id,
      PorcentajeMaterialP1_Capa3 : [0, Validators.required],
      materialP2_Capa1 : this.mezclasMateriales2[0].mezMaterial_Id,
      PorcentajeMaterialP2_Capa1 : [0, Validators.required],
      materialP2_Capa2 : this.mezclasMateriales2[0].mezMaterial_Id,
      PorcentajeMaterialP2_Capa2 : [0, Validators.required],
      materialP2_Capa3 : this.mezclasMateriales2[0].mezMaterial_Id,
      PorcentajeMaterialP2_Capa3 : [0, Validators.required],
      materialP3_Capa1 : this.mezclasMateriales2[0].mezMaterial_Id,
      PorcentajeMaterialP3_Capa1 : [0, Validators.required],
      materialP3_Capa2 : this.mezclasMateriales2[0].mezMaterial_Id,
      PorcentajeMaterialP3_Capa2 : [0, Validators.required],
      materialP3_Capa3 : this.mezclasMateriales2[0].mezMaterial_Id,
      PorcentajeMaterialP3_Capa3 : [0, Validators.required],
      materialP4_Capa1 : this.mezclasMateriales2[0].mezMaterial_Id,
      PorcentajeMaterialP4_Capa1 : [0, Validators.required],
      materialP4_Capa2 : this.mezclasMateriales2[0].mezMaterial_Id,
      PorcentajeMaterialP4_Capa2 : [0, Validators.required],
      materialP4_Capa3 : this.mezclasMateriales2[0].mezMaterial_Id,
      PorcentajeMaterialP4_Capa3 : [0, Validators.required],
      MezclaPigmentoP1_Capa1 : this.mezclasPigmentos2[0].mezPigmto_Id,
      PorcentajeMezclaPigmentoP1_Capa1 : [0, Validators.required],
      MezclaPigmentoP1_Capa2 : this.mezclasPigmentos2[0].mezPigmto_Id,
      PorcentajeMezclaPigmentoP1_Capa2 : [0, Validators.required],
      MezclaPigmento1_Capa3 : this.mezclasPigmentos2[0].mezPigmto_Id,
      PorcentajeMezclaPigmentoP1_Capa3 :[0, Validators.required],
      MezclaPigmentoP2_Capa1 : this.mezclasPigmentos2[0].mezPigmto_Id,
      PorcentajeMezclaPigmentoP2_Capa1 : [0, Validators.required],
      MezclaPigmentoP2_Capa2 : this.mezclasPigmentos2[0].mezPigmto_Id,
      PorcentajeMezclaPigmentoP2_Capa2 : [0, Validators.required],
      MezclaPigmento2_Capa3 : this.mezclasPigmentos2[0].mezPigmto_Id,
      PorcentajeMezclaPigmentoP2_Capa3 : [0, Validators.required],
    });
  }

  //
  cargarCombinacionMezclas2(){
    let nombreMezcla : any =  this.formCrearMezclas.value.Nombre_Mezclas;
    if (nombreMezcla != null) {
      this.mezclasService.srvObtenerListaPorNombre(nombreMezcla.replace('%', '%25')).subscribe(datos_mezcla => {
        for (let i = 0; i < datos_mezcla.length; i++) {
          this.idMezclaSeleccionada = datos_mezcla[i].mezcla_Id;
          this.nroCapas = datos_mezcla[i].mezcla_NroCapas;

          /*if (datos_mezcla[i].mezcla_NroCapas == 1) {
           this.checkedCapa1 = true;
            this.checkedCapa2 = false;
            this.checkedCapa3 = false;
            const capa1 : any = document.getElementById("capa1");
            capa1.click();
          } else if (datos_mezcla[i].mezcla_NroCapas == 2) {
            this.checkedCapa1 = false;
            this.checkedCapa2 = true;
            this.checkedCapa3 = false;
            const capa2 : any = document.getElementById("capa2");
            capa2.click();
          } else if (datos_mezcla[i].mezcla_NroCapas == 3) {
            this.checkedCapa1 = false;
            this.checkedCapa2 = false;
            this.checkedCapa3 = true;
            const capa3 : any = document.getElementById("capa3");
            capa3.click();
          }*/
          console.log(this.nroCapas);
          if(this.nroCapas == 1) this.checkedCapa1 == true; this.checkedCapa2 == false; this.checkedCapa3 == false;
          if(this.nroCapas == 2) this.checkedCapa1 == false; this.checkedCapa2 == true; this.checkedCapa3 == false;
          if(this.nroCapas == 3) this.checkedCapa1 == false; this.checkedCapa2 == false; this.checkedCapa3 == true;

          this.objetoDatos = {
            Material_MatPrima : datos_mezcla[i].material_Id,
            mezclaNroCapas : this.nroCapas,
            Proc_Capa1 : datos_mezcla[i].mezcla_PorcentajeCapa1,
            Proc_Capa2 : datos_mezcla[i].mezcla_PorcentajeCapa2,
            Proc_Capa3 : datos_mezcla[i].mezcla_PorcentajeCapa3,
            materialP1_Capa1 : datos_mezcla[i].mezMaterial_Id1xCapa1,
            PorcentajeMaterialP1_Capa1 : datos_mezcla[i].mezcla_PorcentajeMaterial1_Capa1,
            materialP1_Capa2 : datos_mezcla[i].mezMaterial_Id1xCapa2,
            PorcentajeMaterialP1_Capa2 : datos_mezcla[i].mezcla_PorcentajeMaterial1_Capa2,
            materialP1_Capa3 : datos_mezcla[i].mezMaterial_Id1xCapa3,
            PorcentajeMaterialP1_Capa3 : datos_mezcla[i].mezcla_PorcentajeMaterial1_Capa3,
            materialP2_Capa1 : datos_mezcla[i].mezMaterial_Id2xCapa1,
            PorcentajeMaterialP2_Capa1 : datos_mezcla[i].mezcla_PorcentajeMaterial2_Capa1,
            materialP2_Capa2 : datos_mezcla[i].mezMaterial_Id2xCapa2,
            PorcentajeMaterialP2_Capa2 : datos_mezcla[i].mezcla_PorcentajeMaterial2_Capa2,
            materialP2_Capa3 : datos_mezcla[i].mezMaterial_Id2xCapa3,
            PorcentajeMaterialP2_Capa3 : datos_mezcla[i].mezcla_PorcentajeMaterial2_Capa3,
            materialP3_Capa1 : datos_mezcla[i].mezMaterial_Id3xCapa1,
            PorcentajeMaterialP3_Capa1 : datos_mezcla[i].mezcla_PorcentajeMaterial3_Capa1,
            materialP3_Capa2 : datos_mezcla[i].mezMaterial_Id3xCapa2,
            PorcentajeMaterialP3_Capa2 : datos_mezcla[i].mezcla_PorcentajeMaterial3_Capa2,
            materialP3_Capa3 : datos_mezcla[i].mezMaterial_Id3xCapa3,
            PorcentajeMaterialP3_Capa3 : datos_mezcla[i].mezcla_PorcentajeMaterial3_Capa3,
            materialP4_Capa1 : datos_mezcla[i].mezMaterial_Id4xCapa1,
            PorcentajeMaterialP4_Capa1 : datos_mezcla[i].mezcla_PorcentajeMaterial4_Capa1,
            materialP4_Capa2 : datos_mezcla[i].mezMaterial_Id4xCapa2,
            PorcentajeMaterialP4_Capa2 : datos_mezcla[i].mezcla_PorcentajeMaterial4_Capa2,
            materialP4_Capa3 : datos_mezcla[i].mezMaterial_Id4xCapa3,
            PorcentajeMaterialP4_Capa3 : datos_mezcla[i].mezcla_PorcentajeMaterial4_Capa3,
            MezclaPigmentoP1_Capa1 : datos_mezcla[i].mezPigmto_Id1xCapa1,
            PorcentajeMezclaPigmentoP1_Capa1 : datos_mezcla[i].mezcla_PorcentajePigmto1_Capa1,
            MezclaPigmentoP1_Capa2 : datos_mezcla[i].mezPigmto_Id1xCapa2,
            PorcentajeMezclaPigmentoP1_Capa2 : datos_mezcla[i].mezcla_PorcentajePigmto1_Capa2,
            MezclaPigmento1_Capa3 : datos_mezcla[i].mezPigmto_Id1xCapa3,
            PorcentajeMezclaPigmentoP1_Capa3 :datos_mezcla[i].mezcla_PorcentajePigmto1_Capa3,
            MezclaPigmentoP2_Capa1 : datos_mezcla[i].mezPigmto_Id2xCapa1,
            PorcentajeMezclaPigmentoP2_Capa1 : datos_mezcla[i].mezcla_PorcentajePigmto2_Capa1,
            MezclaPigmentoP2_Capa2 : datos_mezcla[i].mezPigmto_Id2xCapa2,
            PorcentajeMezclaPigmentoP2_Capa2 : datos_mezcla[i].mezcla_PorcentajePigmto2_Capa2,
            MezclaPigmento2_Capa3 : datos_mezcla[i].mezPigmto_Id2xCapa3,
            PorcentajeMezclaPigmentoP2_Capa3 : datos_mezcla[i].mezcla_PorcentajePigmto2_Capa3,
          }

          this.formCrearMezclas = this.frmBuilderPedExterno.group({
            mezclaId : this.idMezclaSeleccionada,
            Nombre_Mezclas : nombreMezcla.replace('%25', '%'),
            Material_MatPrima : datos_mezcla[i].material_Id,
            Chechbox_Capa1 : this.nroCapas,
            Chechbox_Capa2 : '',
            Chechbox_Capa3 : '',
            Proc_Capa1 : datos_mezcla[i].mezcla_PorcentajeCapa1,
            Proc_Capa2 : datos_mezcla[i].mezcla_PorcentajeCapa2,
            Proc_Capa3 : datos_mezcla[i].mezcla_PorcentajeCapa3,
            materialP1_Capa1 : datos_mezcla[i].mezMaterial_Id1xCapa1,
            PorcentajeMaterialP1_Capa1 : datos_mezcla[i].mezcla_PorcentajeMaterial1_Capa1,
            materialP1_Capa2 : datos_mezcla[i].mezMaterial_Id1xCapa2,
            PorcentajeMaterialP1_Capa2 : datos_mezcla[i].mezcla_PorcentajeMaterial1_Capa2,
            materialP1_Capa3 : datos_mezcla[i].mezMaterial_Id1xCapa3,
            PorcentajeMaterialP1_Capa3 : datos_mezcla[i].mezcla_PorcentajeMaterial1_Capa3,
            materialP2_Capa1 : datos_mezcla[i].mezMaterial_Id2xCapa1,
            PorcentajeMaterialP2_Capa1 : datos_mezcla[i].mezcla_PorcentajeMaterial2_Capa1,
            materialP2_Capa2 : datos_mezcla[i].mezMaterial_Id2xCapa2,
            PorcentajeMaterialP2_Capa2 : datos_mezcla[i].mezcla_PorcentajeMaterial2_Capa2,
            materialP2_Capa3 : datos_mezcla[i].mezMaterial_Id2xCapa3,
            PorcentajeMaterialP2_Capa3 : datos_mezcla[i].mezcla_PorcentajeMaterial2_Capa3,
            materialP3_Capa1 : datos_mezcla[i].mezMaterial_Id3xCapa1,
            PorcentajeMaterialP3_Capa1 : datos_mezcla[i].mezcla_PorcentajeMaterial3_Capa1,
            materialP3_Capa2 : datos_mezcla[i].mezMaterial_Id3xCapa2,
            PorcentajeMaterialP3_Capa2 : datos_mezcla[i].mezcla_PorcentajeMaterial3_Capa2,
            materialP3_Capa3 : datos_mezcla[i].mezMaterial_Id3xCapa3,
            PorcentajeMaterialP3_Capa3 : datos_mezcla[i].mezcla_PorcentajeMaterial3_Capa3,
            materialP4_Capa1 : datos_mezcla[i].mezMaterial_Id4xCapa1,
            PorcentajeMaterialP4_Capa1 : datos_mezcla[i].mezcla_PorcentajeMaterial4_Capa1,
            materialP4_Capa2 : datos_mezcla[i].mezMaterial_Id4xCapa2,
            PorcentajeMaterialP4_Capa2 : datos_mezcla[i].mezcla_PorcentajeMaterial4_Capa2,
            materialP4_Capa3 : datos_mezcla[i].mezMaterial_Id4xCapa3,
            PorcentajeMaterialP4_Capa3 : datos_mezcla[i].mezcla_PorcentajeMaterial4_Capa3,
            MezclaPigmentoP1_Capa1 : datos_mezcla[i].mezPigmto_Id1xCapa1,
            PorcentajeMezclaPigmentoP1_Capa1 : datos_mezcla[i].mezcla_PorcentajePigmto1_Capa1,
            MezclaPigmentoP1_Capa2 : datos_mezcla[i].mezPigmto_Id1xCapa2,
            PorcentajeMezclaPigmentoP1_Capa2 : datos_mezcla[i].mezcla_PorcentajePigmto1_Capa2,
            MezclaPigmento1_Capa3 : datos_mezcla[i].mezPigmto_Id1xCapa3,
            PorcentajeMezclaPigmentoP1_Capa3 :datos_mezcla[i].mezcla_PorcentajePigmto1_Capa3,
            MezclaPigmentoP2_Capa1 : datos_mezcla[i].mezPigmto_Id2xCapa1,
            PorcentajeMezclaPigmentoP2_Capa1 : datos_mezcla[i].mezcla_PorcentajePigmto2_Capa1,
            MezclaPigmentoP2_Capa2 : datos_mezcla[i].mezPigmto_Id2xCapa2,
            PorcentajeMezclaPigmentoP2_Capa2 : datos_mezcla[i].mezcla_PorcentajePigmto2_Capa2,
            MezclaPigmento2_Capa3 : datos_mezcla[i].mezPigmto_Id2xCapa3,
            PorcentajeMezclaPigmentoP2_Capa3 : datos_mezcla[i].mezcla_PorcentajePigmto2_Capa3,
          });
        }
      });
    } else this.mensajeAdvertencia('Debe llenar el campo nombre de mezclas');
  }

  // Funcion que enviará un mensaje de advertencia
  mensajeAdvertencia(text : string){
    Swal.fire({ icon: 'warning', title: 'Advertencia', showCloseButton: true, html: `<b>${text}</b><br>` });
  }

  // Funcion que devolverá un mensaje de error con la informacion que se le envie
  mensajeError(text : string, error : string = ''){
    Swal.fire({icon : 'error', title: 'Opps...', html: `<b>${text}</b>` + `<span style="#f00">${error}</span>`});
  }

  //
  cambiarNroCapas1() {
    let mezcla : any = this.formCrearMezclas.value.Nombre_Mezclas;
    let material : any = this.formCrearMezclas.value.Material_MatPrima;
    let material1C1 : any = this.formCrearMezclas.value.materialP1_Capa1;
    let porcMaterial1C1 : any = this.formCrearMezclas.value.PorcentajeMaterialP1_Capa1;
    let material2C1 : any = this.formCrearMezclas.value.materialP2_Capa1;
    let porcMaterial2C1 : any = this.formCrearMezclas.value.PorcentajeMaterialP2_Capa1;
    let material3C1 : any = this.formCrearMezclas.value.materialP3_Capa1;
    let porcMaterial3C1 : any = this.formCrearMezclas.value.PorcentajeMaterialP3_Capa1;
    let material4C1 : any = this.formCrearMezclas.value.materialP4_Capa1;
    let porcMaterial4C1 : any = this.formCrearMezclas.value.PorcentajeMaterialP4_Capa1;
    let pigmento1C1 : any = this.formCrearMezclas.value.MezclaPigmentoP1_Capa1;
    let porcPigmento1C1 : any = this.formCrearMezclas.value.PorcentajeMezclaPigmentoP1_Capa1;
    let pigmento2C1 : any = this.formCrearMezclas.value.MezclaPigmentoP2_Capa1;
    let porcPigmento2C1 : any = this.formCrearMezclas.value.PorcentajeMezclaPigmentoP2_Capa1;

    this.checkedCapa1 = true;
    this.checkedCapa2 = false;
    this.checkedCapa3 = false;
    this.nroCapas = 1;

    this.formCrearMezclas = this.frmBuilderPedExterno.group ({
      mezclaId : 0,
      Nombre_Mezclas : mezcla,
      Material_MatPrima : material,
      Chechbox_Capa1 : this.nroCapas,
      Proc_Capa1 : 100,
      Proc_Capa2 : 0,
      Proc_Capa3 : 0,
      materialP1_Capa1 : material1C1,
      PorcentajeMaterialP1_Capa1 : porcMaterial1C1,
      materialP1_Capa2 : this.mezclasMateriales2[0].mezMaterial_Id,
      PorcentajeMaterialP1_Capa2 : [0, Validators.required],
      materialP1_Capa3 : this.mezclasMateriales2[0].mezMaterial_Id,
      PorcentajeMaterialP1_Capa3 : [0, Validators.required],
      materialP2_Capa1 : material2C1,
      PorcentajeMaterialP2_Capa1 : porcMaterial2C1,
      materialP2_Capa2 : this.mezclasMateriales2[0].mezMaterial_Id,
      PorcentajeMaterialP2_Capa2 : [0, Validators.required],
      materialP2_Capa3 : this.mezclasMateriales2[0].mezMaterial_Id,
      PorcentajeMaterialP2_Capa3 : [0, Validators.required],
      materialP3_Capa1 : material3C1,
      PorcentajeMaterialP3_Capa1 : porcMaterial3C1,
      materialP3_Capa2 : this.mezclasMateriales2[0].mezMaterial_Id,
      PorcentajeMaterialP3_Capa2 : [0, Validators.required],
      materialP3_Capa3 : this.mezclasMateriales2[0].mezMaterial_Id,
      PorcentajeMaterialP3_Capa3 : [0, Validators.required],
      materialP4_Capa1 : material4C1,
      PorcentajeMaterialP4_Capa1 : porcMaterial4C1,
      materialP4_Capa2 : this.mezclasMateriales2[0].mezMaterial_Id,
      PorcentajeMaterialP4_Capa2 : [0, Validators.required],
      materialP4_Capa3 : this.mezclasMateriales2[0].mezMaterial_Id,
      PorcentajeMaterialP4_Capa3 : [0, Validators.required],
      MezclaPigmentoP1_Capa1 : pigmento1C1,
      PorcentajeMezclaPigmentoP1_Capa1 : porcPigmento1C1,
      MezclaPigmentoP1_Capa2 : this.mezclasPigmentos2[0].mezPigmto_Id,
      PorcentajeMezclaPigmentoP1_Capa2 : [0, Validators.required],
      MezclaPigmento1_Capa3 : this.mezclasPigmentos2[0].mezPigmto_Id,
      PorcentajeMezclaPigmentoP1_Capa3 :[0, Validators.required],
      MezclaPigmentoP2_Capa1 : pigmento2C1,
      PorcentajeMezclaPigmentoP2_Capa1 : porcPigmento2C1,
      MezclaPigmentoP2_Capa2 : this.mezclasPigmentos2[0].mezPigmto_Id,
      PorcentajeMezclaPigmentoP2_Capa2 : [0, Validators.required],
      MezclaPigmento2_Capa3 : this.mezclasPigmentos2[0].mezPigmto_Id,
      PorcentajeMezclaPigmentoP2_Capa3 : [0, Validators.required],
    });
  }

  //
  cambiarNroCapas2() {
    let mezcla : any = this.formCrearMezclas.value.Nombre_Mezclas;
    let material : any = this.formCrearMezclas.value.Material_MatPrima;
    /** Capa 1 */
    let material1C1 : any = this.formCrearMezclas.value.materialP1_Capa1;
    let porcMaterial1C1 : any = this.formCrearMezclas.value.PorcentajeMaterialP1_Capa1;
    let material2C1 : any = this.formCrearMezclas.value.materialP2_Capa1;
    let porcMaterial2C1 : any = this.formCrearMezclas.value.PorcentajeMaterialP2_Capa1;
    let material3C1 : any = this.formCrearMezclas.value.materialP3_Capa1;
    let porcMaterial3C1 : any = this.formCrearMezclas.value.PorcentajeMaterialP3_Capa1;
    let material4C1 : any = this.formCrearMezclas.value.materialP4_Capa1;
    let porcMaterial4C1 : any = this.formCrearMezclas.value.PorcentajeMaterialP4_Capa1;
    let pigmento1C1 : any = this.formCrearMezclas.value.MezclaPigmentoP1_Capa1;
    let porcPigmento1C1 : any = this.formCrearMezclas.value.PorcentajeMezclaPigmentoP1_Capa1;
    let pigmento2C1 : any = this.formCrearMezclas.value.MezclaPigmentoP2_Capa1;
    let porcPigmento2C1 : any = this.formCrearMezclas.value.PorcentajeMezclaPigmentoP2_Capa1;
    /** Capa 2 */
    let material1C2 : any = this.formCrearMezclas.value.materialP1_Capa2;
    let porcMaterial1C2 : any = this.formCrearMezclas.value.PorcentajeMaterialP1_Capa2;
    let material2C2 : any = this.formCrearMezclas.value.materialP2_Capa2;
    let porcMaterial2C2 : any = this.formCrearMezclas.value.PorcentajeMaterialP2_Capa2;
    let material3C2 : any = this.formCrearMezclas.value.materialP3_Capa2;
    let porcMaterial3C2 : any = this.formCrearMezclas.value.PorcentajeMaterialP3_Capa2;
    let material4C2 : any = this.formCrearMezclas.value.materialP4_Capa2;
    let porcMaterial4C2 : any = this.formCrearMezclas.value.PorcentajeMaterialP4_Capa2;
    let pigmento1C2 : any = this.formCrearMezclas.value.MezclaPigmentoP1_Capa2;
    let porcPigmento1C2 : any = this.formCrearMezclas.value.PorcentajeMezclaPigmentoP1_Capa2;
    let pigmento2C2 : any = this.formCrearMezclas.value.MezclaPigmentoP2_Capa2;
    let porcPigmento2C2 : any = this.formCrearMezclas.value.PorcentajeMezclaPigmentoP2_Capa2;

    this.checkedCapa1 = false;
    this.checkedCapa2 = true;
    this.checkedCapa3 = false;
    this.nroCapas = 2;

    this.formCrearMezclas = this.frmBuilderPedExterno.group ({
      mezclaId : 0,
      Nombre_Mezclas : mezcla,
      Material_MatPrima : material,
      Chechbox_Capa1 : this.nroCapas,
      Proc_Capa1 : 50,
      Proc_Capa2 : 50,
      Proc_Capa3 : 0,
      materialP1_Capa1 : material1C1,
      PorcentajeMaterialP1_Capa1 : porcMaterial1C1,
      materialP1_Capa2 : material1C2,
      PorcentajeMaterialP1_Capa2 : porcMaterial1C2,
      materialP1_Capa3 : this.mezclasMateriales2[0].mezMaterial_Id,
      PorcentajeMaterialP1_Capa3 : [0, Validators.required],
      materialP2_Capa1 : material2C1,
      PorcentajeMaterialP2_Capa1 : porcMaterial2C1,
      materialP2_Capa2 : material2C2,
      PorcentajeMaterialP2_Capa2 : porcMaterial2C2,
      materialP2_Capa3 : this.mezclasMateriales2[0].mezMaterial_Id,
      PorcentajeMaterialP2_Capa3 : [0, Validators.required],
      materialP3_Capa1 : material3C1,
      PorcentajeMaterialP3_Capa1 : porcMaterial3C1,
      materialP3_Capa2 : material3C2,
      PorcentajeMaterialP3_Capa2 : porcMaterial3C2,
      materialP3_Capa3 : this.mezclasMateriales2[0].mezMaterial_Id,
      PorcentajeMaterialP3_Capa3 : [0, Validators.required],
      materialP4_Capa1 : material4C1,
      PorcentajeMaterialP4_Capa1 : porcMaterial4C1,
      materialP4_Capa2 : material4C2,
      PorcentajeMaterialP4_Capa2 : porcMaterial4C2,
      materialP4_Capa3 : this.mezclasMateriales2[0].mezMaterial_Id,
      PorcentajeMaterialP4_Capa3 : [0, Validators.required],
      MezclaPigmentoP1_Capa1 : pigmento1C1,
      PorcentajeMezclaPigmentoP1_Capa1 : porcPigmento1C1,
      MezclaPigmentoP1_Capa2 : pigmento1C2,
      PorcentajeMezclaPigmentoP1_Capa2 : porcPigmento1C2,
      MezclaPigmento1_Capa3 : this.mezclasPigmentos2[0].mezPigmto_Id,
      PorcentajeMezclaPigmentoP1_Capa3 :[0, Validators.required],
      MezclaPigmentoP2_Capa1 : pigmento2C1,
      PorcentajeMezclaPigmentoP2_Capa1 : porcPigmento2C1,
      MezclaPigmentoP2_Capa2 : pigmento2C2,
      PorcentajeMezclaPigmentoP2_Capa2 : porcPigmento2C2,
      MezclaPigmento2_Capa3 : this.mezclasPigmentos2[0].mezPigmto_Id,
      PorcentajeMezclaPigmentoP2_Capa3 : [0, Validators.required],
    });

  }

  //
  cambiarNroCapas3() {
    let mezcla : any = this.formCrearMezclas.value.Nombre_Mezclas;
    let material : any = this.formCrearMezclas.value.Material_MatPrima;
    /** Capa 1 */
    let material1C1 : any = this.formCrearMezclas.value.materialP1_Capa1;
    let porcMaterial1C1 : any = this.formCrearMezclas.value.PorcentajeMaterialP1_Capa1;
    let material2C1 : any = this.formCrearMezclas.value.materialP2_Capa1;
    let porcMaterial2C1 : any = this.formCrearMezclas.value.PorcentajeMaterialP2_Capa1;
    let material3C1 : any = this.formCrearMezclas.value.materialP3_Capa1;
    let porcMaterial3C1 : any = this.formCrearMezclas.value.PorcentajeMaterialP3_Capa1;
    let material4C1 : any = this.formCrearMezclas.value.materialP4_Capa1;
    let porcMaterial4C1 : any = this.formCrearMezclas.value.PorcentajeMaterialP4_Capa1;
    let pigmento1C1 : any = this.formCrearMezclas.value.MezclaPigmentoP1_Capa1;
    let porcPigmento1C1 : any = this.formCrearMezclas.value.PorcentajeMezclaPigmentoP1_Capa1;
    let pigmento2C1 : any = this.formCrearMezclas.value.MezclaPigmentoP2_Capa1;
    let porcPigmento2C1 : any = this.formCrearMezclas.value.PorcentajeMezclaPigmentoP2_Capa1;
    /** Capa 2 */
    let material1C2 : any = this.formCrearMezclas.value.materialP1_Capa2;
    let porcMaterial1C2 : any = this.formCrearMezclas.value.PorcentajeMaterialP1_Capa2;
    let material2C2 : any = this.formCrearMezclas.value.materialP2_Capa2;
    let porcMaterial2C2 : any = this.formCrearMezclas.value.PorcentajeMaterialP2_Capa2;
    let material3C2 : any = this.formCrearMezclas.value.materialP3_Capa2;
    let porcMaterial3C2 : any = this.formCrearMezclas.value.PorcentajeMaterialP3_Capa2;
    let material4C2 : any = this.formCrearMezclas.value.materialP4_Capa2;
    let porcMaterial4C2 : any = this.formCrearMezclas.value.PorcentajeMaterialP4_Capa2;
    let pigmento1C2 : any = this.formCrearMezclas.value.MezclaPigmentoP1_Capa2;
    let porcPigmento1C2 : any = this.formCrearMezclas.value.PorcentajeMezclaPigmentoP1_Capa2;
    let pigmento2C2 : any = this.formCrearMezclas.value.MezclaPigmentoP2_Capa2;
    let porcPigmento2C2 : any = this.formCrearMezclas.value.PorcentajeMezclaPigmentoP2_Capa2;
    /** Capa 3 */
    let material1C3 : any = this.formCrearMezclas.value.materialP1_Capa3;
    let porcMaterial1C3 : any = this.formCrearMezclas.value.PorcentajeMaterialP1_Capa3;
    let material2C3 : any = this.formCrearMezclas.value.materialP2_Capa3;
    let porcMaterial2C3 : any = this.formCrearMezclas.value.PorcentajeMaterialP2_Capa3;
    let material3C3 : any = this.formCrearMezclas.value.materialP3_Capa3;
    let porcMaterial3C3 : any = this.formCrearMezclas.value.PorcentajeMaterialP3_Capa3;
    let material4C3 : any = this.formCrearMezclas.value.materialP4_Capa3;
    let porcMaterial4C3 : any = this.formCrearMezclas.value.PorcentajeMaterialP4_Capa3;
    let pigmento1C3 : any = this.formCrearMezclas.value.MezclaPigmento1_Capa3;
    let porcPigmento1C3 : any = this.formCrearMezclas.value.PorcentajeMezclaPigmentoP1_Capa3;
    let pigmento2C3 : any = this.formCrearMezclas.value.MezclaPigmento2_Capa3;
    let porcPigmento2C3 : any = this.formCrearMezclas.value.PorcentajeMezclaPigmentoP2_Capa3;

    this.checkedCapa1 = false;
    this.checkedCapa2 = false;
    this.checkedCapa3 = true;
    this.nroCapas = 3;

    this.formCrearMezclas = this.frmBuilderPedExterno.group({
      mezclaId : 0,
      Nombre_Mezclas : mezcla,
      Material_MatPrima : material,
      Chechbox_Capa1 : this.nroCapas,
      Proc_Capa1 : 30,
      Proc_Capa2 : 40,
      Proc_Capa3 : 30,
      materialP1_Capa1 : material1C1,
      PorcentajeMaterialP1_Capa1 : porcMaterial1C1,
      materialP1_Capa2 : material1C2,
      PorcentajeMaterialP1_Capa2 : porcMaterial1C2,
      materialP1_Capa3 : material1C3,
      PorcentajeMaterialP1_Capa3 : porcMaterial1C3,
      materialP2_Capa1 : material2C1,
      PorcentajeMaterialP2_Capa1 : porcMaterial2C1,
      materialP2_Capa2 : material2C2,
      PorcentajeMaterialP2_Capa2 : porcMaterial2C2,
      materialP2_Capa3 : material2C3,
      PorcentajeMaterialP2_Capa3 : porcMaterial2C3,
      materialP3_Capa1 : material3C1,
      PorcentajeMaterialP3_Capa1 : porcMaterial3C1,
      materialP3_Capa2 : material3C2,
      PorcentajeMaterialP3_Capa2 : porcMaterial3C2,
      materialP3_Capa3 : material3C3,
      PorcentajeMaterialP3_Capa3 : porcMaterial3C3,
      materialP4_Capa1 : material4C1,
      PorcentajeMaterialP4_Capa1 : porcMaterial4C1,
      materialP4_Capa2 : material4C2,
      PorcentajeMaterialP4_Capa2 : porcMaterial4C2,
      materialP4_Capa3 : material4C3,
      PorcentajeMaterialP4_Capa3 : porcMaterial4C3,
      MezclaPigmentoP1_Capa1 : pigmento1C1,
      PorcentajeMezclaPigmentoP1_Capa1 : porcPigmento1C1,
      MezclaPigmentoP1_Capa2 : pigmento1C2,
      PorcentajeMezclaPigmentoP1_Capa2 : porcPigmento1C2,
      MezclaPigmento1_Capa3 : pigmento1C3,
      PorcentajeMezclaPigmentoP1_Capa3 : porcPigmento1C3,
      MezclaPigmentoP2_Capa1 : pigmento2C1,
      PorcentajeMezclaPigmentoP2_Capa1 : porcPigmento2C1,
      MezclaPigmentoP2_Capa2 : pigmento2C2,
      PorcentajeMezclaPigmentoP2_Capa2 : porcPigmento2C2,
      MezclaPigmento2_Capa3 : pigmento2C3,
      PorcentajeMezclaPigmentoP2_Capa3 : porcPigmento2C3,
    });
  }

  /** Función que creará la mezcla predefinida  */
  crearMezclaPredefinida() {
    let mezcla : any = this.formCrearMezclas.value.Nombre_Mezclas;
    let material : any = this.formCrearMezclas.value.Material_MatPrima;
    /** Porcentajes de capa */
    let porc_Capa1 : any = this.formCrearMezclas.value.Proc_Capa1;
    let porc_Capa2 : any = this.formCrearMezclas.value.Proc_Capa2
    let porc_Capa3 : any = this.formCrearMezclas.value.Proc_Capa3;
    /** Capa 1 */
    let material1C1 : any = this.formCrearMezclas.value.materialP1_Capa1;
    let porcMaterial1C1 : any = this.formCrearMezclas.value.PorcentajeMaterialP1_Capa1;
    let material2C1 : any = this.formCrearMezclas.value.materialP2_Capa1;
    let porcMaterial2C1 : any = this.formCrearMezclas.value.PorcentajeMaterialP2_Capa1;
    let material3C1 : any = this.formCrearMezclas.value.materialP3_Capa1;
    let porcMaterial3C1 : any = this.formCrearMezclas.value.PorcentajeMaterialP3_Capa1;
    let material4C1 : any = this.formCrearMezclas.value.materialP4_Capa1;
    let porcMaterial4C1 : any = this.formCrearMezclas.value.PorcentajeMaterialP4_Capa1;
    let pigmento1C1 : any = this.formCrearMezclas.value.MezclaPigmentoP1_Capa1;
    let porcPigmento1C1 : any = this.formCrearMezclas.value.PorcentajeMezclaPigmentoP1_Capa1;
    let pigmento2C1 : any = this.formCrearMezclas.value.MezclaPigmentoP2_Capa1;
    let porcPigmento2C1 : any = this.formCrearMezclas.value.PorcentajeMezclaPigmentoP2_Capa1;
    /** Capa 2 */
    let material1C2 : any = this.formCrearMezclas.value.materialP1_Capa2;
    let porcMaterial1C2 : any = this.formCrearMezclas.value.PorcentajeMaterialP1_Capa2;
    let material2C2 : any = this.formCrearMezclas.value.materialP2_Capa2;
    let porcMaterial2C2 : any = this.formCrearMezclas.value.PorcentajeMaterialP2_Capa2;
    let material3C2 : any = this.formCrearMezclas.value.materialP3_Capa2;
    let porcMaterial3C2 : any = this.formCrearMezclas.value.PorcentajeMaterialP3_Capa2;
    let material4C2 : any = this.formCrearMezclas.value.materialP4_Capa2;
    let porcMaterial4C2 : any = this.formCrearMezclas.value.PorcentajeMaterialP4_Capa2;
    let pigmento1C2 : any = this.formCrearMezclas.value.MezclaPigmentoP1_Capa2;
    let porcPigmento1C2 : any = this.formCrearMezclas.value.PorcentajeMezclaPigmentoP1_Capa2;
    let pigmento2C2 : any = this.formCrearMezclas.value.MezclaPigmentoP2_Capa2;
    let porcPigmento2C2 : any = this.formCrearMezclas.value.PorcentajeMezclaPigmentoP2_Capa2;
    /** Capa 3 */
    let material1C3 : any = this.formCrearMezclas.value.materialP1_Capa3;
    let porcMaterial1C3 : any = this.formCrearMezclas.value.PorcentajeMaterialP1_Capa3;
    let material2C3 : any = this.formCrearMezclas.value.materialP2_Capa3;
    let porcMaterial2C3 : any = this.formCrearMezclas.value.PorcentajeMaterialP2_Capa3;
    let material3C3 : any = this.formCrearMezclas.value.materialP3_Capa3;
    let porcMaterial3C3 : any = this.formCrearMezclas.value.PorcentajeMaterialP3_Capa3;
    let material4C3 : any = this.formCrearMezclas.value.materialP4_Capa3;
    let porcMaterial4C3 : any = this.formCrearMezclas.value.PorcentajeMaterialP4_Capa3;
    let pigmento1C3 : any = this.formCrearMezclas.value.MezclaPigmento1_Capa3;
    let porcPigmento1C3 : any = this.formCrearMezclas.value.PorcentajeMezclaPigmentoP1_Capa3;
    let pigmento2C3 : any = this.formCrearMezclas.value.MezclaPigmento2_Capa3;
    let porcPigmento2C3 : any = this.formCrearMezclas.value.PorcentajeMezclaPigmentoP2_Capa3;

    /** Si % del material es 'null' entonces coloca 0 al porcentaje */
    if (porcMaterial1C1 == null) { porcMaterial1C1 = 0 } else { porcMaterial1C1; }
    if (porcMaterial2C1 == null) { porcMaterial2C1 = 0 } else { porcMaterial2C1; }
    if (porcMaterial3C1 == null) { porcMaterial3C1 = 0 } else { porcMaterial3C1; }
    if (porcMaterial4C1 == null) { porcMaterial4C1 = 0 } else { porcMaterial4C1; }
    if (porcMaterial1C2 == null) { porcMaterial1C2 = 0 } else { porcMaterial1C2; }
    if (porcMaterial2C2 == null) { porcMaterial2C2 = 0 } else { porcMaterial2C2; }
    if (porcMaterial3C2 == null) { porcMaterial3C2 = 0 } else { porcMaterial3C2; }
    if (porcMaterial4C2 == null) { porcMaterial4C2 = 0 } else { porcMaterial4C2; }
    if (porcMaterial1C3 == null) { porcMaterial1C3 = 0 } else { porcMaterial1C3; }
    if (porcMaterial2C3 == null) { porcMaterial2C3 = 0 } else { porcMaterial2C3; }
    if (porcMaterial3C3 == null) { porcMaterial3C3 = 0 } else { porcMaterial3C3; }
    if (porcMaterial4C3 == null) { porcMaterial4C3 = 0 } else { porcMaterial4C3; }

    /** Si material es 'no aplica' entonces coloca 0 al porcentaje */
    if (material1C1 == 1) { porcMaterial1C1 = 0 } else { porcMaterial1C1; }
    if (material2C1 == 1) { porcMaterial2C1 = 0 } else { porcMaterial2C1; }
    if (material3C1 == 1) { porcMaterial3C1 = 0 } else { porcMaterial3C1; }
    if (material4C1 == 1) { porcMaterial4C1 = 0 } else { porcMaterial4C1; }
    if (material1C2 == 1) { porcMaterial1C2 = 0 } else { porcMaterial1C2; }
    if (material2C2 == 1) { porcMaterial2C2 = 0 } else { porcMaterial2C2; }
    if (material3C2 == 1) { porcMaterial3C2 = 0 } else { porcMaterial3C2; }
    if (material4C2 == 1) { porcMaterial4C2 = 0 } else { porcMaterial4C2; }
    if (material1C3 == 1) { porcMaterial1C3 = 0 } else { porcMaterial1C3; }
    if (material2C3 == 1) { porcMaterial2C3 = 0 } else { porcMaterial2C3; }
    if (material3C3 == 1) { porcMaterial3C3 = 0 } else { porcMaterial3C3; }
    if (material4C3 == 1) { porcMaterial4C3 = 0 } else { porcMaterial4C3; }

    if(mezcla != null) {
      if(this.checkedCapa1 == true) {
        let porcentajeTotalCapas : any = (porc_Capa1 + porc_Capa2 + porc_Capa3);
        if (porcentajeTotalCapas == 100) {
          if(material1C1 != 1 || material2C1 != 1 || material3C1 != 1 || material4C1 != 1){
            let porcentajeTotalCapa1 : number = porcMaterial1C1 + porcMaterial2C1 + porcMaterial3C1 + porcMaterial4C1;
            if (porcentajeTotalCapa1 == 100) {
              this.mezclasService.srvObtenerListaPorNombre(mezcla.replace('%', '%25')).subscribe(dataMezcla => {
                if(dataMezcla.length == 0) {
                  if(!this.compararRegistroEntrante()) {
                    let modelo : modelMezclas = {
                      mezclaId : 0,
                      Mezcla_Nombre: mezcla.replace('%25', '%'),
                      Mezcla_NroCapas: this.nroCapas,
                      Material_Id: material,
                      Mezcla_PorcentajeCapa1: porc_Capa1,
                      MezMaterial_Id1xCapa1: material1C1,
                      Mezcla_PorcentajeMaterial1_Capa1: porcMaterial1C1,
                      MezMaterial_Id2xCapa1: material2C1,
                      Mezcla_PorcentajeMaterial2_Capa1: porcMaterial2C1,
                      MezMaterial_Id3xCapa1: material3C1,
                      Mezcla_PorcentajeMaterial3_Capa1: porcMaterial3C1,
                      MezMaterial_Id4xCapa1: material4C1,
                      Mezcla_PorcentajeMaterial4_Capa1: porcMaterial4C1,
                      MezPigmto_Id1xCapa1: pigmento1C1,
                      Mezcla_PorcentajePigmto1_Capa1: porcPigmento1C1,
                      MezPigmto_Id2xCapa1: pigmento2C1,
                      Mezcla_PorcentajePigmto2_Capa1: porcPigmento2C1,
                      Mezcla_PorcentajeCapa2: porc_Capa2,
                      MezMaterial_Id1xCapa2: material1C2,
                      Mezcla_PorcentajeMaterial1_Capa2: porcMaterial1C2,
                      MezMaterial_Id2xCapa2: material2C2,
                      Mezcla_PorcentajeMaterial2_Capa2: porcMaterial2C2,
                      MezMaterial_Id3xCapa2: material3C2,
                      Mezcla_PorcentajeMaterial3_Capa2: porcMaterial3C2,
                      MezMaterial_Id4xCapa2: material4C2,
                      Mezcla_PorcentajeMaterial4_Capa2: porcMaterial4C2,
                      MezPigmto_Id1xCapa2: pigmento1C2,
                      Mezcla_PorcentajePigmto1_Capa2: porcPigmento1C2,
                      MezPigmto_Id2xCapa2: pigmento2C2,
                      Mezcla_PorcentajePigmto2_Capa2: porcPigmento2C2,
                      Mezcla_PorcentajeCapa3: porc_Capa3,
                      MezMaterial_Id1xCapa3: material1C3,
                      Mezcla_PorcentajeMaterial1_Capa3: porcMaterial1C3,
                      MezMaterial_Id2xCapa3: material2C3,
                      Mezcla_PorcentajeMaterial2_Capa3: porcMaterial2C3,
                      MezMaterial_Id3xCapa3: material3C3,
                      Mezcla_PorcentajeMaterial3_Capa3: porcMaterial3C3,
                      MezMaterial_Id4xCapa3: material4C3,
                      Mezcla_PorcentajeMaterial4_Capa3: porcMaterial4C3,
                      MezPigmto_Id1xCapa3: pigmento1C3,
                      Mezcla_PorcentajePigmto1_Capa3: porcPigmento1C3,
                      MezPigmto_Id2xCapa3: pigmento2C3,
                      Mezcla_PorcentajePigmto2_Capa3: porcPigmento2C3,
                      Usua_Id: this.storage_Id,
                      Mezcla_FechaIngreso: this.today
                    }
                    this.mezclasService.srvGuardar(modelo).subscribe(dataMezclas2 => {
                      this.mostrarConfirmacion(`Registro de Mezcla Predefinida creado con éxito!`);
                      setTimeout(() => {
                        this.initFormCrearMezclas();
                        this.cargarMezclas();
                      }, 1000);
                    });
                  } else this.mostrarAdvertencia(`No es posible crear una mezcla con las mismas caracteristicas de una mezcla existente.`);
                } else this.mostrarAdvertencia(`Ya existe una mezcla llamada ${mezcla}`);
              });
            } else this.mostrarAdvertencia('La suma del porcentaje de mezcla de materiales de la capa 1 debe ser 100, por favor verifique!');
          } else this.mostrarAdvertencia('No puede usar este porcentaje para el/los material(es) seleccionado(s)');
        } else this.mostrarAdvertencia('El porcentaje de mezcla de la capa 1 debe ser 100, por favor verifique!.');
        /** Fin Condición 1 */

      } else if(this.checkedCapa2 == true) {
        let porcentajeTotalCapas : any = (porc_Capa1 + porc_Capa2 + porc_Capa3);
        if(porcentajeTotalCapas == 100 && porc_Capa1 != 0 && porc_Capa2 != 0) {
          if((material1C1 != 1 || material2C1 != 1 || material3C1 != 1 || material4C1 != 1)
            && (material1C2 != 1 || material2C2 != 1 || material3C2 != 1 || material4C2 != 1)) {

            let porcMaterialesCapa1 : number = (porcMaterial1C1 + porcMaterial2C1 + porcMaterial3C1 + porcMaterial4C1);
            let porcMaterialesCapa2: number = (porcMaterial1C2 + porcMaterial2C2 + porcMaterial3C2 + porcMaterial4C2);
            if(porcMaterialesCapa1 == 100 && porcMaterialesCapa2 == 100) {
              this.mezclasService.srvObtenerListaPorNombre(mezcla.replace('%', '%25')).subscribe(dataMezcla => {
                if(dataMezcla.length == 0) {
                  if(!this.compararRegistroEntrante()) {
                    let modelo : modelMezclas = {
                      mezclaId : 0,
                      Mezcla_Nombre: mezcla.replace('%25', '%'),
                      Mezcla_NroCapas: 2,
                      Material_Id: material,
                      Mezcla_PorcentajeCapa1: porc_Capa1,
                      MezMaterial_Id1xCapa1: material1C1,
                      Mezcla_PorcentajeMaterial1_Capa1: porcMaterial1C1,
                      MezMaterial_Id2xCapa1: material2C1,
                      Mezcla_PorcentajeMaterial2_Capa1: porcMaterial2C1,
                      MezMaterial_Id3xCapa1: material3C1,
                      Mezcla_PorcentajeMaterial3_Capa1: porcMaterial3C1,
                      MezMaterial_Id4xCapa1: material4C1,
                      Mezcla_PorcentajeMaterial4_Capa1: porcMaterial4C1,
                      MezPigmto_Id1xCapa1: pigmento1C1,
                      Mezcla_PorcentajePigmto1_Capa1: porcPigmento1C1,
                      MezPigmto_Id2xCapa1: pigmento2C1,
                      Mezcla_PorcentajePigmto2_Capa1: porcPigmento2C1,
                      Mezcla_PorcentajeCapa2: porc_Capa2,
                      MezMaterial_Id1xCapa2: material1C2,
                      Mezcla_PorcentajeMaterial1_Capa2: porcMaterial1C2,
                      MezMaterial_Id2xCapa2: material2C2,
                      Mezcla_PorcentajeMaterial2_Capa2: porcMaterial2C2,
                      MezMaterial_Id3xCapa2: material3C2,
                      Mezcla_PorcentajeMaterial3_Capa2: porcMaterial3C2,
                      MezMaterial_Id4xCapa2: material4C2,
                      Mezcla_PorcentajeMaterial4_Capa2: porcMaterial4C2,
                      MezPigmto_Id1xCapa2: pigmento1C2,
                      Mezcla_PorcentajePigmto1_Capa2: porcPigmento1C2,
                      MezPigmto_Id2xCapa2: pigmento2C2,
                      Mezcla_PorcentajePigmto2_Capa2: porcPigmento2C2,
                      Mezcla_PorcentajeCapa3: porc_Capa3,
                      MezMaterial_Id1xCapa3: material1C3,
                      Mezcla_PorcentajeMaterial1_Capa3: porcMaterial1C3,
                      MezMaterial_Id2xCapa3: material2C3,
                      Mezcla_PorcentajeMaterial2_Capa3: porcMaterial2C3,
                      MezMaterial_Id3xCapa3: material3C3,
                      Mezcla_PorcentajeMaterial3_Capa3: porcMaterial3C3,
                      MezMaterial_Id4xCapa3: material4C3,
                      Mezcla_PorcentajeMaterial4_Capa3: porcMaterial4C3,
                      MezPigmto_Id1xCapa3: pigmento1C3,
                      Mezcla_PorcentajePigmto1_Capa3: porcPigmento1C3,
                      MezPigmto_Id2xCapa3: pigmento2C3,
                      Mezcla_PorcentajePigmto2_Capa3: porcPigmento2C3,
                      Usua_Id: this.storage_Id,
                      Mezcla_FechaIngreso: this.today
                    }
                    this.mezclasService.srvGuardar(modelo).subscribe(dataMezclas2 => {
                      this.mostrarConfirmacion(`Registro de Mezcla Predefinida creado con éxito!`);
                      setTimeout(() => { this.initFormCrearMezclas(); this.cargarMezclas(); }, 1000);
                    });
                  } else this.mostrarAdvertencia(`No es posible crear una mezcla con las mismas caracteristicas de una mezcla existente.`);
                } else this.mostrarAdvertencia(`Ya existe una mezcla llamada ${mezcla}`);
              });
            } else this.mostrarAdvertencia('La suma del porcentaje de mezcla de los materiales en cada capa debe ser 100');
          } else this.mostrarAdvertencia('No puede usar estos porcentajes de mezcla para los materiales seleccionados');
        } else this.mostrarAdvertencia('La suma del porcentaje de mezcla de las capas 1 y 2 debe ser 100');
        /** Fin Condición 2 */

      } else if (this.checkedCapa3 == true) {
        let porcentajeTotalCapas : number = (porc_Capa1 + porc_Capa2 + porc_Capa3);
        if(porcentajeTotalCapas == 100 && porc_Capa1 != 0 && porc_Capa2 != 0 && porc_Capa3 != 0) {
          if((material1C1 != 1 || material2C1 != 1 || material3C1 != 1 || material4C1 != 1)
            && (material1C2 != 1 || material2C2 != 1 || material3C2 != 1 || material4C2 != 1)
            && (material1C3 != 1 || material2C3 != 1 || material3C3 != 1 || material4C3 != 1)) {
            let porcMaterialesCapa1 : number = (porcMaterial1C1 + porcMaterial2C1 + porcMaterial3C1 + porcMaterial4C1);
            let porcMaterialesCapa2: number = (porcMaterial1C2 + porcMaterial2C2 + porcMaterial3C2 + porcMaterial4C2);
            let porcMaterialesCapa3: number = (porcMaterial1C3 + porcMaterial2C3 + porcMaterial3C3 + porcMaterial4C3);
            if(porcMaterialesCapa1 == 100 && porcMaterialesCapa2 == 100 && porcMaterialesCapa3 == 100) {
              this.mezclasService.srvObtenerListaPorNombre(mezcla.replace('%', '%25')).subscribe(dataMezcla => {
                if(dataMezcla.length == 0) {
                  if(!this.compararRegistroEntrante()) {
                    let modelo : modelMezclas = {
                      mezclaId : 0,
                      Mezcla_Nombre: mezcla.replace('%25', '%'),
                      Mezcla_NroCapas: 2,
                      Material_Id: material,
                      Mezcla_PorcentajeCapa1: porc_Capa1,
                      MezMaterial_Id1xCapa1: material1C1,
                      Mezcla_PorcentajeMaterial1_Capa1: porcMaterial1C1,
                      MezMaterial_Id2xCapa1: material2C1,
                      Mezcla_PorcentajeMaterial2_Capa1: porcMaterial2C1,
                      MezMaterial_Id3xCapa1: material3C1,
                      Mezcla_PorcentajeMaterial3_Capa1: porcMaterial3C1,
                      MezMaterial_Id4xCapa1: material4C1,
                      Mezcla_PorcentajeMaterial4_Capa1: porcMaterial4C1,
                      MezPigmto_Id1xCapa1: pigmento1C1,
                      Mezcla_PorcentajePigmto1_Capa1: porcPigmento1C1,
                      MezPigmto_Id2xCapa1: pigmento2C1,
                      Mezcla_PorcentajePigmto2_Capa1: porcPigmento2C1,
                      Mezcla_PorcentajeCapa2: porc_Capa2,
                      MezMaterial_Id1xCapa2: material1C2,
                      Mezcla_PorcentajeMaterial1_Capa2: porcMaterial1C2,
                      MezMaterial_Id2xCapa2: material2C2,
                      Mezcla_PorcentajeMaterial2_Capa2: porcMaterial2C2,
                      MezMaterial_Id3xCapa2: material3C2,
                      Mezcla_PorcentajeMaterial3_Capa2: porcMaterial3C2,
                      MezMaterial_Id4xCapa2: material4C2,
                      Mezcla_PorcentajeMaterial4_Capa2: porcMaterial4C2,
                      MezPigmto_Id1xCapa2: pigmento1C2,
                      Mezcla_PorcentajePigmto1_Capa2: porcPigmento1C2,
                      MezPigmto_Id2xCapa2: pigmento2C2,
                      Mezcla_PorcentajePigmto2_Capa2: porcPigmento2C2,
                      Mezcla_PorcentajeCapa3: porc_Capa3,
                      MezMaterial_Id1xCapa3: material1C3,
                      Mezcla_PorcentajeMaterial1_Capa3: porcMaterial1C3,
                      MezMaterial_Id2xCapa3: material2C3,
                      Mezcla_PorcentajeMaterial2_Capa3: porcMaterial2C3,
                      MezMaterial_Id3xCapa3: material3C3,
                      Mezcla_PorcentajeMaterial3_Capa3: porcMaterial3C3,
                      MezMaterial_Id4xCapa3: material4C3,
                      Mezcla_PorcentajeMaterial4_Capa3: porcMaterial4C3,
                      MezPigmto_Id1xCapa3: pigmento1C3,
                      Mezcla_PorcentajePigmto1_Capa3: porcPigmento1C3,
                      MezPigmto_Id2xCapa3: pigmento2C3,
                      Mezcla_PorcentajePigmto2_Capa3: porcPigmento2C3,
                      Usua_Id: this.storage_Id,
                      Mezcla_FechaIngreso: this.today
                    }
                    this.mezclasService.srvGuardar(modelo).subscribe(dataMezclas2 => {
                      this.mostrarConfirmacion(`Registro de Mezcla Predefinida creado con éxito!`);
                      setTimeout(() => { this.initFormCrearMezclas(); this.cargarMezclas(); }, 1000);
                    });
                  } else this.mostrarAdvertencia(`No es posible crear una mezcla con las mismas caracteristicas de una mezcla existente.`);
                } else this.mostrarAdvertencia(`Ya existe una mezcla llamada ${mezcla}`)
              });
            } else this.mostrarAdvertencia('La suma del porcentaje de mezcla de los materiales en cada capa debe ser 100');
          } else this.mostrarAdvertencia('No puede usar este porcentaje para los materiales seleccionados');
        } else this.mostrarAdvertencia('La suma del porcentaje de mezcla de las capas debe ser 100');
        /** Fin condición 3 */
      } else this.mostrarAdvertencia('Debe elegir el número de capas de la mezcla.');
    } else this.mostrarAdvertencia('Debe diligenciar el campo Nombre de Mezcla');
  }

  /** Función que validará si las caracteristicas de la mezcla ya existen. Si no existen crea la mezcla.  */
  compararRegistroEntrante() {
    if(this.objetoDatos.Material_MatPrima == this.formCrearMezclas.value.Material_MatPrima &&
      this.objetoDatos.mezclaNroCapas == this.nroCapas &&
      this.objetoDatos.Proc_Capa1 == this.formCrearMezclas.value.Proc_Capa1 &&
      this.objetoDatos.Proc_Capa2 == this.formCrearMezclas.value.Proc_Capa2 &&
      this.objetoDatos.Proc_Capa3 == this.formCrearMezclas.value.Proc_Capa3 &&
      this.objetoDatos.materialP1_Capa1 == this.formCrearMezclas.value.materialP1_Capa1 &&
      this.objetoDatos.PorcentajeMaterialP1_Capa1 == this.formCrearMezclas.value.PorcentajeMaterialP1_Capa1 &&
      this.objetoDatos.materialP1_Capa2 == this.formCrearMezclas.value.materialP1_Capa2 &&
      this.objetoDatos.PorcentajeMaterialP1_Capa2 == this.formCrearMezclas.value.PorcentajeMaterialP1_Capa2 &&
      this.objetoDatos.materialP1_Capa3 == this.formCrearMezclas.value.materialP1_Capa3 &&
      this.objetoDatos.PorcentajeMaterialP1_Capa3 == this.formCrearMezclas.value.PorcentajeMaterialP1_Capa3 &&
      this.objetoDatos.materialP2_Capa1 == this.formCrearMezclas.value.materialP2_Capa1 &&
      this.objetoDatos.PorcentajeMaterialP2_Capa1 == this.formCrearMezclas.value.PorcentajeMaterialP2_Capa1 &&
      this.objetoDatos.materialP2_Capa2 == this.formCrearMezclas.value.materialP2_Capa2 &&
      this.objetoDatos.PorcentajeMaterialP2_Capa2 == this.formCrearMezclas.value.PorcentajeMaterialP2_Capa2 &&
      this.objetoDatos.materialP2_Capa3 == this.formCrearMezclas.value.materialP2_Capa3 &&
      this.objetoDatos.PorcentajeMaterialP2_Capa3 == this.formCrearMezclas.value.PorcentajeMaterialP2_Capa3 &&
      this.objetoDatos.materialP3_Capa1 == this.formCrearMezclas.value.materialP3_Capa1 &&
      this.objetoDatos.PorcentajeMaterialP3_Capa1 == this.formCrearMezclas.value.PorcentajeMaterialP3_Capa1 &&
      this.objetoDatos.materialP3_Capa2 == this.formCrearMezclas.value.materialP3_Capa2 &&
      this.objetoDatos.PorcentajeMaterialP3_Capa2 == this.formCrearMezclas.value.PorcentajeMaterialP3_Capa2 &&
      this.objetoDatos.materialP3_Capa3 == this.formCrearMezclas.value.materialP3_Capa3 &&
      this.objetoDatos.PorcentajeMaterialP3_Capa3 == this.formCrearMezclas.value.PorcentajeMaterialP3_Capa3 &&
      this.objetoDatos.materialP4_Capa1 == this.formCrearMezclas.value.materialP4_Capa1 &&
      this.objetoDatos.PorcentajeMaterialP4_Capa1 == this.formCrearMezclas.value.PorcentajeMaterialP4_Capa1 &&
      this.objetoDatos.materialP4_Capa2 == this.formCrearMezclas.value.materialP4_Capa2 &&
      this.objetoDatos.PorcentajeMaterialP4_Capa2 == this.formCrearMezclas.value.PorcentajeMaterialP4_Capa2 &&
      this.objetoDatos.materialP4_Capa3 == this.formCrearMezclas.value.materialP4_Capa3 &&
      this.objetoDatos.PorcentajeMaterialP4_Capa3 == this.formCrearMezclas.value.PorcentajeMaterialP4_Capa3 &&
      this.objetoDatos.MezclaPigmentoP1_Capa1 == this.formCrearMezclas.value.MezclaPigmentoP1_Capa1 &&
      this.objetoDatos.PorcentajeMezclaPigmentoP1_Capa1 == this.formCrearMezclas.value.PorcentajeMezclaPigmentoP1_Capa1 &&
      this.objetoDatos.MezclaPigmentoP1_Capa2 == this.formCrearMezclas.value.MezclaPigmentoP1_Capa2 &&
      this.objetoDatos.PorcentajeMezclaPigmentoP1_Capa2 == this.formCrearMezclas.value.PorcentajeMezclaPigmentoP1_Capa2 &&
      this.objetoDatos.MezclaPigmento1_Capa3 == this.formCrearMezclas.value.MezclaPigmento1_Capa3 &&
      this.objetoDatos.PorcentajeMezclaPigmentoP1_Capa3 == this.formCrearMezclas.value.PorcentajeMezclaPigmentoP1_Capa3 &&
      this.objetoDatos.MezclaPigmentoP2_Capa1 == this.formCrearMezclas.value.MezclaPigmentoP2_Capa1 &&
      this.objetoDatos.PorcentajeMezclaPigmentoP2_Capa1 == this.formCrearMezclas.value.PorcentajeMezclaPigmentoP2_Capa1 &&
      this.objetoDatos.MezclaPigmentoP2_Capa2 == this.formCrearMezclas.value.MezclaPigmentoP2_Capa2 &&
      this.objetoDatos.PorcentajeMezclaPigmentoP2_Capa2 == this.formCrearMezclas.value.PorcentajeMezclaPigmentoP2_Capa2 &&
      this.objetoDatos.MezclaPigmento2_Capa3 == this.formCrearMezclas.value.MezclaPigmento2_Capa3 &&
      this.objetoDatos.PorcentajeMezclaPigmentoP2_Capa3 == this.formCrearMezclas.value.PorcentajeMezclaPigmentoP2_Capa3) {
      return true;
    } else return false;
  }

  //
  cargarModalMateriales(){
    this.modalMateriales = true;
  }

  /** Función para crear mater desde el modal de crear mezclas */
  crearMaterial(){
    let nombreMaterial : string = this.formCrearMateriales.value.matNombre;
    let descripcionMaterial : string = this.formCrearMateriales.value.matDescripcion;
    if(descripcionMaterial == null) descripcionMaterial = `Mezcla de Material ${nombreMaterial.toUpperCase()}`;
    this.mezclaMaterialService.getMezclasMateriales(nombreMaterial.toUpperCase()).subscribe(dataMzMaterial => {
      if(dataMzMaterial.length == 0) {
        const material : modelMezMaterial = {
          MezMaterial_Nombre: nombreMaterial.toUpperCase(),
          MezMaterial_Descripcion: descripcionMaterial,
        }
        this.mezclaMaterialService.srvGuardar(material).subscribe(dataMzMaterial2 => {
          this.mostrarConfirmacion('Registro creado con éxito!');
          setTimeout(() => {
            this.formCrearMateriales.reset();
            this.cargarMezclaMateria();
            this.cargarMezclaMateria2();
          }, 300);
        });
      } else this.mostrarAdvertencia(`Ya existe una material de mezclas llamado ${nombreMaterial.toUpperCase()}`);
    });
  }

  /** Función para crear pigmentos desde el modal de crear mezclas */
  crearPigmento(){
    let nombrePigmento : string = this.formCrearPigmentos.value.pigNombre;
    let descripcionPigmento : string = this.formCrearPigmentos.value.pigDescripcion;

    if(descripcionPigmento == null) descripcionPigmento = `Mezcla de Pigmento ${nombrePigmento.toUpperCase()}`;

    this.mezclaPigmentosService.getMezclasPigmentos(nombrePigmento.toUpperCase()).subscribe(dataMzPigmento => {
      if(dataMzPigmento.length == 0) {
        const pigmento : modelMezPigmento = {
          MezPigmto_Nombre: nombrePigmento.toUpperCase(),
          MezPigmto_Descripcion: descripcionPigmento,
        }
        console.table(pigmento);
        this.mezclaPigmentosService.srvGuardar(pigmento).subscribe(dataMzPigmento => {
          this.mostrarConfirmacion('Registro creado con éxito!');
          setTimeout(() => {
          this.formCrearPigmentos.reset();
          this.mezclasPigmentos();
          this.mezclasPigmentos2();
          }, 300);
        });
      } else this.mostrarAdvertencia(`Ya existe un pigmento de mezclas llamado ${nombrePigmento.toUpperCase()}`)
    });
  }

  //
  cargarModalPigmentos(){
    this.modalPigmentos = true;
  }

  /** Mostrar mensaje de error */
  mostrarAdvertencia(dato : any) {
    this.messageService.add({severity:'warn', detail: dato});
  }

  /** Mostrar mensaje de confirmación */
  mostrarConfirmacion(texto : string) {
    this.messageService.add({severity:'success', detail: texto } );
  }
}
