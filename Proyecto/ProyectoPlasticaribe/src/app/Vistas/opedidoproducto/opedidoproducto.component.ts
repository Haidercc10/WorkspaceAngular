import { Component, Inject, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl} from '@angular/forms';
import Swal from 'sweetalert2';
import { OpedidoproductoService } from 'src/app/Servicios/PedidosProductos/opedidoproducto.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { ClientesService } from 'src/app/Servicios/Clientes/clientes.service';
import { SedeClienteService } from 'src/app/Servicios/SedeCliente/sede-cliente.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import { TipoProductoService } from 'src/app/Servicios/TipoProducto/tipo-producto.service'
import { TipoMonedaService } from 'src/app/Servicios/TipoMoneda/tipo-moneda.service';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { TipoEstadosService } from 'src/app/Servicios/TipoEstado/tipo-estados.service';
import { ExistenciasProductosService } from 'src/app/Servicios/ExistenciasProductos/existencias-productos.service';
import { EmpresaService } from 'src/app/Servicios/Empresa/empresa.service';
import { PedidoProductosService } from 'src/app/Servicios/DetallesPedidoProductos/pedidoProductos.service'
import { CookieService } from 'ngx-cookie-service';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import { TipoClienteService } from 'src/app/Servicios/TipoCliente/tipo-cliente.service';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { ClientesProductosService } from 'src/app/Servicios/Clientes_Productos/ClientesProductos.service';
import { modelCliente } from 'src/app/Modelo/modelCliente';
import { MaterialProductoService } from 'src/app/Servicios/MaterialProducto/materialProducto.service';
import { PigmentoProductoService } from 'src/app/Servicios/PigmentosProductos/pigmentoProducto.service';
import { OrdenesTrabajoComponent } from '../ordenes-trabajo/ordenes-trabajo.component';
import { Orden_TrabajoService } from 'src/app/Servicios/OrdenTrabajo/Orden_Trabajo.service';
import moment from 'moment';
import { AppComponent } from 'src/app/app.component';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app.opedidoproducto.component',
  templateUrl: './opedidoproducto.component.html',
  styleUrls: ['./opedidoproducto.component.css']
})

export class OpedidoproductoComponent implements OnInit {

  @ViewChild(OrdenesTrabajoComponent) CrearOrdenTrabajo : OrdenesTrabajoComponent;

  public FormPedidoExternoClientes !: FormGroup; //Formulario de pedidos cliente
  public FormPedidoExternoProductos!: FormGroup; //Formuladio de pedidos productos
  public FormConsultaPedidoExterno !: FormGroup; //Formulario de pedidos consultados
  public page : number; //Variable que tendrá el paginado de la tabla en la que se muestran los pedidos consultados
  AccionBoton = "Agregar"; //Variable que almanará informacio para saber si un producto está en edicion o no (Se editará un producto cargado en la tabla, no uno en la base de datos)
  Ide : number | undefined; //Variable para almacenar el ID del producto que está en la tabla y se va a editar
  id_pedido : number; //Variable que almacenará el ID del pedido que se va a mostrar

  //Llamar modales, inicializados como falsos para que no se carguen al ingresar a la pagina.
  public ModalCrearProductos: boolean = false;
  public ModalCrearCliente: boolean = false;
  public ModalSedesClientes: boolean = false;

  temporal : boolean = true; //Variable momentanea que va a hacer que no se muestre una parte del codigo del HTML en la vista, esto mientras se soluciona el hecho de que se termine esta vista
  modalOrdenTrabajo : boolean = false; //Variable para validar si se abre el modal o no

  // VARIABLES PARA PASAR A LOS COMBOBOX
  cliente = []; //Variable que almacenará el nombre de los clientes para pasarlos en la vista
  clienteDatos = []; //Variable que almacenará la informacion completa de los clientes
  sedeCliente:any=[]; //Varieble que almacenará las direcciones de las sedes de los cliente
  ciudad :any=[]; //Variable que almacenará las ciudades de los clientes
  usuarioVendedor=[]; //Variable que almacenara los nombres de los usuarios vendedores
  usuarios=[]; //Variable que almacenara los nombres de los usuarios vendedores y los mostrará en la vista
  estado=[]; //Variable que almacenará los estados que se mostrarán en la vista
  estadoConsulta=[]; //Variable que almacenará los estados que se mostrarán en la vista
  producto=[]; //Varibale que gusradará los productos dependiendo del cliente seleccionado
  nombreProd : string; // Variable que guardará el nombre del producto que está seleccionado
  productoInfo=[]; //Variable que almacenará la informacion completa del producto buscado o selccionado
  tipoProducto=[]; //Variable que almacenará los tipos de productos y los mostrará en la vista
  materialProducto = []; //Varibale que almacenará los materiables de los producto
  pigmentoProducto =[]; //Varible que guardará los pigmentos de un producto
  tipoProductoConsultado=[]; //Variable que guardará el tipo de producto consultado
  undMed:UnidadMedidaService[]=[]; //Variable que guardará las unidades de medida
  presentacion = []; //Variable que almacenará la presentacion de unproducto consultado
  tipoMoneda:TipoMonedaService[]=[]; //Variable que almacenará los tipos de monedas y luego los mostrará en la vista
  usuarioVende=[] //Variable que almacenará la informacion del vendedor de el cliente seleccionado
  titulosTabla = []; //Variable que almacenará los titulos de la tabla de productos que se ve al final de la vista
  existenciasProductos=[]; //Varible que almacenará las existencias de un producto
  pedidosProductos = []; //Variable que se va a almacenar los pedidos consultados
  contadorPedidosExternos : number; //Variable que tendrá el ID de un nuevo pedido, con base al ultimo pedido hecho sumandole 1
  ArrayProducto : any [] = []; //Variable que tendrá la informacion de los productos que se piden en el nuevo pedido
  productosPedidos = []; //Variable que tendrá los productos que se han pedido en un pedido consultado y que se quiere mostrar

/* Vaiables para rescatar los ID de estado, sedes, empresa, valorTotal */
  valorTotal : number = 0; //Variable que guardará el valor total del pedido
  EmpresaVendedora=[]; //Variable que tendrá la informacion de la empresa vendedora
  EstadoDocumentos= []; //Variable que tendrá la informacion del estado que tiene el nuevo pedido
  EstadoDeDocumentos : any; //Variable que tendrá el ID del estado que tiene el nuevo pedido
  SedeSeleccionada: any; ////Variable que tendrá la informacion de la sede que tiene el nuevo pedido
  IDSedeSeleccionada : any = 0; //Variable que tendrá el ID de la sede que tiene el nuevo pedido
  UsuarioSeleccionado : any = 0; //Variable que tendrá el ID del vendedor que tiene el nuevo pedido
  pedidosID = []; //variable que va a tener los id de los pedidos que ya se han creado
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente

  //variable para almacenar el id del cliente que esta seleccionado
  clienteId : number; //Variable que almacenará  el id del cliente sleccionado al momento de crear un producto
  fechaCreacionCortada = []; //Variable que tendrá la fecha de creacion de pedidos cortada de los pedidos consultados (La fecha en la base de datos de datetime por lo que viene con una hora pero esa hora no se debe mostrar)
  fechaEntregaCortada = []; //Variable que tendrá la fecha de entrega de pedidos cortada de los pedidos consultados (La fecha en la base de datos de datetime por lo que viene con una hora pero esa hora no se debe mostrar)
  fechaCreacion : any; //Variable que tendrá la fecha de creacion de pedido de los pedidos consultados
  fechaEntrega : any; //Variable que tendrá la fecha de creacion de entrega de los pedidos consultados
  nombreProducto : string; //Varible que almacenará el nombre de un producto consultado o seleccionado
  productoEliminado : number; //Variable que tendrá el id de un producto que se va a eliminar de la base de datos o de un pedido nuevo
  ultimoPrecio : number = 0; //Variable que almacenará el ultimo precio por el que se facturó un producto
  Productospedidos : any; //Variable que tendrá la informacion de un producto buscado o seleccionado
  today : any = new Date(); //Variable que se usará para llenar la fecha actual
  enPedido : string = 'no'; //Variable que se usará para saber si el cliente se encuentra en una actualizacion de pedido o no
  pigmento : any = ''; //Variable que se usará para almacenar el pigmento del producto consultado o seleccionado
  material : any = ''; //Variable que se usará para almacenar el material del producto consultado o seleccionado
  public load : boolean = true; //Variable que va a servir para mostrar o no la imagen de carga

  /** Variables para inputs de autocompletados */
  validarInputClientes : any;
  validarInputClienteConsulta : any;
  validarInputVendedorConsulta : any;
  keywordClientes = 'cli_Nombre';
  keywordVendedorConsulta = 'usua_Nombre';
  validarInputNombresProductos : any;
  keywordNombresProductos = 'prod_Nombre';
  public historyHeading: string = 'Seleccionado Recientemente';
  public historyHeading2: string = 'Seleccionado Recientemente';
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro


  constructor(private pedidoproductoService : OpedidoproductoService,
    private productosServices : ProductoService,
      private clientesService :ClientesService,
        private sedesClientesService: SedeClienteService,
          private usuarioService: UsuarioService,
            private tipoEstadoService : TipoEstadosService,
              private unidadMedidaService : UnidadMedidaService,
                private frmBuilderPedExterno : FormBuilder,
                  private estadosService : EstadosService,
                    private existenciasProductosServices : ExistenciasProductosService,
                      private tiposProductosService : TipoProductoService,
                        private tipoMonedaService : TipoMonedaService,
                          private SrvEmpresa : EmpresaService,
                            private PedidoProductosService : PedidoProductosService,
                              private tipoClientService : TipoClienteService,
                                private rolService : RolesService,
                                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                                    private ClientesProductosService : ClientesProductosService,
                                      private materialService : MaterialProductoService,
                                        private pigmentoServices : PigmentoProductoService,
                                          private ordenTrabajoService : Orden_TrabajoService,
                                            private AppComponent : AppComponent ) {

     this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    //Campos que vienen del formulario
    this.FormPedidoExternoClientes = this.frmBuilderPedExterno.group({
      //Datos para la tabla de pedidos.
      PedClienteNombre: ['', Validators.required],
      PedSedeCli_Id: ['', Validators.required],
      ciudad_sede: ['', Validators.required],
      PedUsuarioNombre: ['', Validators.required],
      PedFecha: ['', Validators.required],
      PedFechaEnt: ['', Validators.required],
      PedEstadoId: ['', Validators.required],
      PedObservacion: ['', Validators.required],
    });

    this.FormPedidoExternoProductos = this.frmBuilderPedExterno.group({
       //Datos para la tabla de productos.
       ProdId: ['', Validators.required],
       ProdNombre: ['', Validators.required],
       ProdAncho: ['', Validators.required],
       ProdFuelle: ['', Validators.required],
       ProdCalibre: ['', Validators.required],
       ProdLargo: ['', Validators.required],
       ProdUnidadMedidaACF: ['', Validators.required],
       ProdTipo: ['', Validators.required],
       ProdMaterial: ['', Validators.required],
       ProdPigmento: ['', Validators.required],
       ProdCantidad: ['', Validators.required],
       ProdUnidadMedidaCant: ['', Validators.required],
       ProdPrecioUnd: ['', Validators.required],
       ProdUltFacturacion : ['', Validators.required],
       ProdTipoMoneda: ['', Validators.required],
       ProdStock: ['', Validators.required],
       ProdDescripcion: ['', Validators.required],
    });

    this.FormConsultaPedidoExterno = this.frmBuilderPedExterno.group({
      PedExtIdConsulta: [, Validators.required],
      PedExtFechaConsulta: [, Validators.required],
      PedExtFechaEntregaConsulta: [, Validators.required],
      PedExtEstadoConsulta: [, Validators.required],
      PedExtUsuarioConsulta : ['',],
      PedExtClienteConsulta : ['',],
      PedExtIdClienteConsulta : ['',],
    });

    this.validarInputClientes = true;
    this.validarInputNombresProductos = true
    this.validarInputClienteConsulta = true;
    this.validarInputVendedorConsulta = true;
  }

  //Cargar al iniciar.
  ngOnInit(): void {
    if (this.storage.get('Rol') == 1 || this.storage.get('Rol') == 2) {
      this.clientesComboBox();
      this.estadoComboBox();
      this.estadoComboBoxConsulta();
      this.undMedidaComboBox();
      this.obtenerEmpresa();
      this.ObtenerUltimoPedido();
      this.tipoProductoComboBox();
      this.matrialProductoComboBox();
      this.pigmentoProductocomboBox();
      this.tipoMonedaComboBox();
      this.ColumnasTabla();
      this.lecturaStorage();
      this.usuarioComboBox();
      this.LimpiarCampos();
      this.limpiarCamposConsulta();
      this.fecha();
    } else window.location.href = "./home";
  }

  selectEventClienteConsulta(item) {
    this.FormConsultaPedidoExterno.value.ProdNombre = item.cli_Nombre;
    if (this.FormConsultaPedidoExterno.value.ProdNombre != '') this.validarInputClienteConsulta = false;
    else this.validarInputClienteConsulta = true;
    // do something with selected item
  }

  onChangeSearchClienteConsulta(val: string) {
    if (val != '') this.validarInputClienteConsulta = false;
    else this.validarInputClienteConsulta = true;
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  onFocusedClienteConsulta(e){
    if (!e.isTrusted) this.validarInputClienteConsulta = false;
    else this.validarInputClienteConsulta = true;
    if (this.FormConsultaPedidoExterno.value.ProdNombre != null) this.validarInputClienteConsulta = false;
    else this.validarInputClienteConsulta = true;
    // do something when input is focused
  }

  onChangeSearchNombreCliente(val: string) {
    if (val != '') this.validarInputClientes = false;
    else this.validarInputClientes = true;
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  onFocusedNombreCliente(e){
    if (!e.isTrusted) this.validarInputClientes = false;
    else this.validarInputClientes = true;
    if (this.FormPedidoExternoClientes.value.PedClienteNombre != null) this.validarInputClientes = false;
    else this.validarInputClientes = true;
    // do something when input is focused
  }

  selectEventNombreProductos(item) {
    this.FormPedidoExternoProductos.value.ProdNombre = item.prod_Id;
    if (this.FormPedidoExternoProductos.value.ProdNombre != '') this.validarInputNombresProductos = false;
    else this.validarInputNombresProductos = true;
    // do something with selected item
  }

  onChangeSearchNombreProductos(val: string) {
    if (val != '') this.validarInputNombresProductos = false;
    else this.validarInputNombresProductos = true;
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  onFocusedNombreProductos(e){
    if (!e.isTrusted) this.validarInputNombresProductos = false;
    else this.validarInputNombresProductos = true;
    if (this.FormPedidoExternoProductos.value.ProdNombre != null) this.validarInputNombresProductos = false;
    else this.validarInputNombresProductos = true;
    // do something when input is focused
  }

  selectEventVendedorConsulta(item) {
    this.FormConsultaPedidoExterno.value.PedExtUsuarioConsulta = item.usua_Nombre;
    if (this.FormConsultaPedidoExterno.value.PedExtUsuarioConsulta != '') this.validarInputVendedorConsulta = false;
    else this.validarInputVendedorConsulta = true;
    // do something with selected item
  }

  onChangeSearchVendedorConsulta(val: string) {
    if (val != '') this.validarInputVendedorConsulta = false;
    else this.validarInputVendedorConsulta = true;
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  onFocusedVendedorConsulta(e){
    if (!e.isTrusted) this.validarInputVendedorConsulta = false;
    else this.validarInputVendedorConsulta = true;
    if (this.FormConsultaPedidoExterno.value.PedExtUsuarioConsulta != null) this.validarInputVendedorConsulta = false;
    else this.validarInputVendedorConsulta = true;
    // do something when input is focused
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
    let rol = this.storage.get('Rol');
    this.rolService.srvObtenerLista().subscribe(datos_roles => {
      for (let index = 0; index < datos_roles.length; index++) {
        if (datos_roles[index].rolUsu_Id == rol) {
          this.ValidarRol = rol;
          this.storage_Rol = datos_roles[index].rolUsu_Nombre;
        }
      }
    });
  }

  //Funcion que colocará la fecha actual y la colocará en el campo de fecha de pedido
  fecha(){
    this.today = new Date();
    var dd : any = this.today.getDate();
    var mm : any = this.today.getMonth() + 1;
    var yyyy : any = this.today.getFullYear();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    this.today = yyyy + '-' + mm + '-' + dd;

    this.FormPedidoExternoClientes.setValue({
      PedSedeCli_Id: '',
      ciudad_sede: '',
      PedClienteNombre: '',
      PedUsuarioNombre: '',
      PedFecha: this.today,
      PedFechaEnt: '',
      PedEstadoId: '',
      PedObservacion: '',
    });
  }

  //Cargar modal de crear producto
  LlamarModalCrearProducto() {
    this.ModalCrearProductos = true;
  }

  // Funcion para llamar el modal que crea clientes
  LlamarModalCrearCliente() {
    this.ModalCrearCliente = true;
  }

  // VALIDACION PARA CAMPOS VACIOS
  validarCamposVacios(){
    if(this.FormPedidoExternoProductos.valid) this.cargarFormProductoEnTablas(this.ArrayProducto);
    else Swal.fire("Hay campos vacios en el formulario de producto");
  }

  // Funcion que limpia los todos los campos de la vista
  LimpiarCampos() {
    this.FormPedidoExternoProductos = this.frmBuilderPedExterno.group({
      //Productos
      ProdId: '',
      ProdNombre: '',
      ProdAncho: '',
      ProdFuelle: '',
      ProdCalibre: '',
      ProdLargo: '',
      ProdUnidadMedidaACF: '',
      ProdTipo: '',
      ProdMaterial: '',
      ProdPigmento: '',
      ProdCantidad: '',
      ProdUnidadMedidaCant: '',
      ProdPrecioUnd: '',
      ProdUltFacturacion : '',
      ProdTipoMoneda: '',
      ProdStock: '',
      ProdDescripcion: '',
    });
    this.ArrayProducto = [];
    this.valorTotal = 0;
  }

  // Funcion para limpiar los campos de el apartado de productos
  LimpiarCamposProductos(){
    this.FormPedidoExternoProductos = this.frmBuilderPedExterno.group({
      //Productos
      ProdId: '',
      ProdNombre: '',
      ProdAncho: '',
      ProdFuelle: '',
      ProdCalibre: '',
      ProdLargo: '',
      ProdUnidadMedidaACF: '',
      ProdTipo: '',
      ProdMaterial: '',
      ProdPigmento: '',
      ProdCantidad: '',
      ProdUnidadMedidaCant: '',
      ProdPrecioUnd: '',
      ProdUltFacturacion : '',
      ProdTipoMoneda: '',
      ProdStock: '',
      ProdDescripcion: '',
    });
  }

  //Funcion que limpiará TODOS los campos de la vista de pedidos
  limpiarTodosCampos(){
    this.ArrayProducto = [];
    this.valorTotal = 0;
    this.FormConsultaPedidoExterno.reset();
    this.pedidosProductos = [];
    this.id_pedido = 0;
    this.enPedido = 'no';
    this.FormPedidoExternoProductos = this.frmBuilderPedExterno.group({
      //Productos
      ProdId: '',
      ProdNombre: '',
      ProdAncho: '',
      ProdFuelle: '',
      ProdCalibre: '',
      ProdLargo: '',
      ProdUnidadMedidaACF: '',
      ProdTipo: '',
      ProdMaterial: '',
      ProdPigmento: '',
      ProdCantidad: '',
      ProdUnidadMedidaCant: '',
      ProdPrecioUnd: '',
      ProdUltFacturacion : '',
      ProdTipoMoneda: '',
      ProdStock: '',
      ProdDescripcion: '',
    });
  }

  /* EMPIEZA A HACE LAS RESPECTIVAS VALIDACIONES PARA MOSTRAR DATOS EN LOS COMBOBOX DESDE QUE ARRANCA LA PAGINA */
  clientesComboBox() {
    this.usuarioService.srvObtenerListaPorId(this.storage.get('Id')).subscribe(datos_usuarios => {
      this.clientesService.srvObtenerListaPorEstado(1).subscribe(datos_clientes => {
        for (let index = 0; index < datos_clientes.length; index++) {
          if (datos_usuarios.rolUsu_Id == 2) {
            this.cliente.push(datos_clientes[index]);
            this.clienteDatos.push(datos_clientes[index]);
            continue;
          }else {
            this.cliente.push(datos_clientes[index]);
            this.clienteDatos.push(datos_clientes[index]);
          }
          this.cliente.sort((a,b) => a.cli_Nombre.localeCompare(b.cli_Nombre));
        }
      });
    });
  }

  //Funcion para llenar las ciudades del cliente en donde tiene sedes
  ciudadClienteComboBox(itemsNombre? : any){
    this.FormPedidoExternoClientes.value.PedClienteNombre = itemsNombre.cli_Id;
    if (this.FormPedidoExternoClientes.value.PedClienteNombre != '') this.validarInputClientes = false;
    else this.validarInputClientes = true;
    this.LimpiarCamposProductos();
    this.ciudad = [];
    this.sedeCliente=[];
    this.usuarioVende=[];
    let clienteBD: any = this.FormPedidoExternoClientes.value.PedClienteNombre;
    this.sedesClientesService.srvObtenerListaPorCliente(clienteBD).subscribe(datos_sedesClientes => {
      for (let i = 0; i < datos_sedesClientes.length; i++) {
        this.ciudad.push(datos_sedesClientes[i].sedeCliente_Ciudad);
        this.sedeCliente.push(datos_sedesClientes[i]);
      }

      if (this.sedeCliente.length <= 1 ) {
        for (const item of this.sedeCliente) {
          this.sedeCliente = [];
          this.usuarioVende.push(item.usua_Nombre);
          this.sedeCliente.push(item.sedeCliente_Direccion);
          this.FormPedidoExternoClientes.setValue({
            PedClienteNombre: this.FormPedidoExternoClientes.value.PedClienteNombre,
            PedSedeCli_Id: item.sedeCliente_Direccion,
            ciudad_sede: item.sedeCliente_Ciudad,
            PedUsuarioNombre: item.usua_Nombre,
            PedFecha: this.FormPedidoExternoClientes.value.PedFecha,
            PedFechaEnt: this.FormPedidoExternoClientes.value.PedFechaEnt,
            PedEstadoId: this.FormPedidoExternoClientes.value.PedEstadoId,
            PedObservacion: this.FormPedidoExternoClientes.value.PedObservacion,
          });
        }
      } else {
        for (const item of this.sedeCliente) {
          this.usuarioVende.push(item.usua_Nombre);
          this.FormPedidoExternoClientes.setValue({
            PedClienteNombre: this.FormPedidoExternoClientes.value.PedClienteNombre,
            PedSedeCli_Id: this.FormPedidoExternoClientes.value.PedSedeCli_Id,
            ciudad_sede: this.FormPedidoExternoClientes.value.ciudad_sede,
            PedUsuarioNombre: item.usua_Nombre,
            PedFecha: this.FormPedidoExternoClientes.value.PedFecha,
            PedFechaEnt: this.FormPedidoExternoClientes.value.PedFechaEnt,
            PedEstadoId: this.FormPedidoExternoClientes.value.PedEstadoId,
            PedObservacion: this.FormPedidoExternoClientes.value.PedObservacion,
          });
          break;
        }
        this.sedeCliente = [];

        for (let i = 0; i < datos_sedesClientes.length; i++) {
          this.sedeCliente.push(datos_sedesClientes[i].sedeCliente_Direccion);
        }
      }
    });
  }

  usuarioComboBox(){
    this.usuarioService.srvObtenerListaPorId(this.storage.get('Id')).subscribe(datos_usuarios => {
      if (datos_usuarios.rolUsu_Id == 2) {
        this.usuarios.push(datos_usuarios);
        this.usuarios.sort((a,b) => a.usua_Nombre.localeCompare(b.usua_Nombre));
      }else {
        this.usuarioService.srvObtenerListaUsuario().subscribe(datos_usuarios => {
          for (let index = 0; index < datos_usuarios.length; index++) {
            if (datos_usuarios[index].rolUsu_Id == 2) {
              this.usuarios.push(datos_usuarios[index]);
              this.usuarios.sort((a,b) => a.usua_Nombre.localeCompare(b.usua_Nombre));
            }
          }
        });
      }
    });
  }

  // Funcion para llenar el comboBox de estados
  estadoComboBox(){
    // FORMA DE HACER QUE SOLO SE RETORNEN LOS ESTADOS CON EL TIPO DE ESTADO "1", QUE ES EL EXCLUSIOVO PARA DOCUMENTOS
    this.tipoEstadoService.srvObtenerListaPorId(1).subscribe(datos_tiposEstados => {
      this.estadosService.srvObtenerListaEstados().subscribe(datos_estados=>{
        for (let index = 0; index < datos_estados.length; index++) {
          if (datos_tiposEstados.tpEstado_Id == datos_estados[index].tpEstado_Id) {
            if (this.ValidarRol == 2){
              if (datos_estados[index].estado_Id == 11) {
                this.estado.push(datos_estados[index].estado_Nombre);
                break;
              }
            } else if (this.ValidarRol == 1){
              this.estado.push(datos_estados[index].estado_Nombre);
            }
          }
        }
        this.estado.sort();
      }, error =>{ console.log("error"); });
    });
  }

  // Funcion para llenar el comboBox de estados
  estadoComboBoxConsulta(){
    // FORMA DE HACER QUE SOLO SE RETORNEN LOS ESTADOS CON EL TIPO DE ESTADO "1", QUE ES EL EXCLUSIOVO PARA DOCUMENTOS
    this.tipoEstadoService.srvObtenerListaPorId(1).subscribe(datos_tiposEstados => {
      this.estadosService.srvObtenerListaEstados().subscribe(datos_estados=>{
        for (let index = 0; index < datos_estados.length; index++) {
          if (datos_tiposEstados.tpEstado_Id == datos_estados[index].tpEstado_Id) {
            this.estadoConsulta.push(datos_estados[index].estado_Nombre);
          }
        }
        this.estado.sort();
      }, error =>{ console.log("error"); });
    });
  }

  // Funcion para cargar los productos de un solo cliente
  productoCliente(){
    this.producto = [];
    let Id_Cliente : any = this.FormPedidoExternoClientes.value.PedClienteNombre;
    this.ClientesProductosService.srvObtenerListaPorNombreCliente(Id_Cliente).subscribe(datos_clientesProductos => {
      for (let index = 0; index < datos_clientesProductos.length; index++) {
        this.productosServices.srvObtenerListaPorId(datos_clientesProductos[index].prod_Id).subscribe(datos_productos => {
          this.producto.push(datos_productos);
        });
      }
    });
  }

  // Funcion para llenar el comboBox de tipos de Productos con los tipos de productos
  tipoProductoComboBox(){
    this.tiposProductosService.srvObtenerLista().subscribe(datos_tiposProductos => {
      for (let index = 0; index < datos_tiposProductos.length; index++) {
        this.tipoProducto.push(datos_tiposProductos[index].tpProd_Nombre);
      }
    });
  }

  // Funcion para llenar el comboBox de material del producto
  matrialProductoComboBox(){
    this.materialService.srvObtenerLista().subscribe(datos_material => {
      for (let index = 0; index < datos_material.length; index++) {
        this.materialProducto.push(datos_material[index].material_Nombre)
      }
    });
  }

  // Funcion para llenar el comboBox de pigmentos del producto
  pigmentoProductocomboBox(){
    this.pigmentoServices.srvObtenerLista().subscribe(datos_pigmentos => {
      for (let index = 0; index < datos_pigmentos.length; index++) {
        this.pigmentoProducto.push(datos_pigmentos[index].pigmt_Nombre)
      }
    });
  }

  // Funcion para llenar el combobox de tipo de moneda con los tipos de monedas
  tipoMonedaComboBox(){
    this.tipoMonedaService.srvObtenerLista().subscribe(datos_tiposMoneda => {
      for (let index = 0; index < datos_tiposMoneda.length; index++) {
        this.tipoMoneda.push(datos_tiposMoneda[index].tpMoneda_Id);
      }
    });
  }

  //Funcion encargada de buscar un producto por el id del producto
  buscarProducto(){
    this.producto = [];
    this.presentacion = [];
    let idProducto : number = this.FormPedidoExternoProductos.value.ProdId;

    this.existenciasProductosServices.srvObtenerListaPorIdProducto(idProducto).subscribe(datos_producto => {
      for (let i = 0; i < datos_producto.length; i++) {
        this.PedidoProductosService.srvObtenerListaPorIdProducto(idProducto, datos_producto[i].undMed_Id).subscribe(datos_productoPedido => {
          let datos : any = [];
          datos.push(datos_productoPedido);
          for (const item of datos) {
            this.ultimoPrecio = item.pedExtProd_PrecioUnitario;
          }
        });

        setTimeout(() => {
          this.presentacion.push(datos_producto[i].undMed_Id);
          this.FormPedidoExternoProductos.setValue({
            ProdId: datos_producto[i].prod_Id,
            ProdNombre: datos_producto[i].prod_Nombre,
            ProdAncho: datos_producto[i].prod_Ancho,
            ProdFuelle: datos_producto[i].prod_Fuelle,
            ProdCalibre: datos_producto[i].prod_Calibre,
            ProdLargo: datos_producto[i].prod_Largo,
            ProdUnidadMedidaACF: datos_producto[i].undMedACF,
            ProdTipo: datos_producto[i].tpProd_Nombre,
            ProdMaterial: datos_producto[i].material_Nombre,
            ProdPigmento: datos_producto[i].pigmt_Nombre,
            ProdCantidad: this.FormPedidoExternoProductos.value.ProdCantidad,
            ProdUnidadMedidaCant: datos_producto[i].undMed_Id,
            ProdPrecioUnd: datos_producto[i].exProd_PrecioVenta,
            ProdUltFacturacion: this.ultimoPrecio,
            ProdTipoMoneda: datos_producto[i].tpMoneda_Id,
            ProdStock: datos_producto[i].exProd_Cantidad,
            ProdDescripcion: datos_producto[i].prod_Descripcion,
          });
          if (this.FormPedidoExternoProductos.value.ProdNombre != '') this.validarInputNombresProductos = false;
          else this.validarInputNombresProductos = true;
        }, 100);
      }
    });
  }

  // Funcion para llenar los datos de los productos en cada uno de los campos
  llenadoProducto(item : any){
    this.productoInfo = [];
    this.presentacion = [];
    this.FormPedidoExternoProductos.value.ProdNombre = item.prod_Id;

    let idProducto : any = this.FormPedidoExternoProductos.value.ProdNombre = item.prod_Id;
    this.existenciasProductosServices.srvObtenerListaPorIdProducto(idProducto).subscribe(datos_producto => {
      for (let i = 0; i < datos_producto.length; i++) {
      this.PedidoProductosService.srvObtenerListaPorIdProducto(idProducto, datos_producto[i].undMed_Id).subscribe(datos_productoPedido => {
        let datos : any = [];
        datos.push(datos_productoPedido);
        for (const item of datos) {
          this.ultimoPrecio = item.pedExtProd_PrecioUnitario;
        }
      });

        this.presentacion.push(datos_producto[i].undMed_Id);
        this.FormPedidoExternoProductos.setValue({
          ProdId: datos_producto[i].prod_Id,
          ProdNombre: datos_producto[i].prod_Nombre,
          ProdAncho: datos_producto[i].prod_Ancho,
          ProdFuelle: datos_producto[i].prod_Fuelle,
          ProdCalibre: datos_producto[i].prod_Calibre,
          ProdLargo: datos_producto[i].prod_Largo,
          ProdUnidadMedidaACF: datos_producto[i].undMedACF,
          ProdTipo: datos_producto[i].tpProd_Nombre,
          ProdMaterial: datos_producto[i].material_Nombre,
          ProdPigmento: datos_producto[i].pigmt_Nombre,
          ProdCantidad: this.FormPedidoExternoProductos.value.ProdCantidad,
          ProdUnidadMedidaCant: datos_producto[i].undMed_Id,
          ProdPrecioUnd: datos_producto[i].exProd_PrecioVenta,
          ProdUltFacturacion: this.ultimoPrecio,
          ProdTipoMoneda: datos_producto[i].tpMoneda_Id,
          ProdStock: datos_producto[i].exProd_Cantidad,
          ProdDescripcion: datos_producto[i].prod_Descripcion,
        });
        if (this.FormPedidoExternoProductos.value.ProdNombre != '') this.validarInputNombresProductos = false;
        else this.validarInputNombresProductos = true;
      }
    });
  }

  // Funcion para llenar los combobox de unidad de medida con las unidades de medidas
  undMedidaComboBox() {
    this.unidadMedidaService.srvObtenerLista().subscribe(datos_undMed => {
      for (let index = 0; index < datos_undMed.length; index++) {
        this.undMed.push(datos_undMed[index].undMed_Id);
      }
    }, error => { Swal.fire('Ocurrió un error, intentelo de nuevo'); });
  }

  // Funcion para validar los campos vacios de las consultas
  validarCamposVaciosConsulta(){
    this.load = false;
    this.fechaCreacionCortada = [];
    this.fechaEntregaCortada = [];
    let fechaPedido : any = this.FormConsultaPedidoExterno.value.PedExtFechaConsulta;
    let fechaEntrega : any = this.FormConsultaPedidoExterno.value.PedExtFechaEntregaConsulta;
    let estadoNombre : string = this.FormConsultaPedidoExterno.value.PedExtEstadoConsulta;
    let idPedido : number = this.FormConsultaPedidoExterno.value.PedExtIdConsulta;
    let nombreVendedor : string = this.FormConsultaPedidoExterno.value.PedExtUsuarioConsulta;
    let idCliente : number = this.FormConsultaPedidoExterno.value.PedExtIdClienteConsulta;
    let nombreCliente : any = this.FormConsultaPedidoExterno.value.PedExtClienteConsulta;
    if (nombreCliente != null) nombreCliente = this.FormConsultaPedidoExterno.value.PedExtClienteConsulta.cli_Nombre;
    else nombreCliente = null;
    if (nombreVendedor != null) nombreVendedor = this.FormConsultaPedidoExterno.value.PedExtUsuarioConsulta.usua_Nombre;
    else nombreVendedor = null;

    //Buscará el o los pedidos que tengan los filtros que se le están pasando, es decir, todos (no es necesario que esten llenos los campos idCliente y nombreCliente, con uno vale)
    if (fechaPedido != null && fechaEntrega != null && estadoNombre != null && nombreVendedor != null && (idCliente != null || nombreCliente != null)) {
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListaFechasEstadoVendedor(fechaPedido, fechaEntrega, estadoNombre, nombreVendedor).subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          if (datos_pedidos[index].cli_Nombre == nombreCliente || datos_pedidos[index].cli_Id == idCliente) {
            if (this.ValidarRol == 2) {
              if (datos_pedidos[index].usua_Nombre == this.storage_Nombre) this.pedidosProductos.push(datos_pedidos[index]);
            } else if (this.ValidarRol == 1) this.pedidosProductos.push(datos_pedidos[index]);
            this.pedidosProductos.sort((a,b)=> Number(b.pedExt_Id) - Number(a.pedExt_Id));
          }
        }
      });
    }
    //Buscará el o los pedidos que tengan los filtros que se le están pasando, es decir, todos excepto el vendedor (no es necesario que esten llenos los campos idCliente y nombreCliente, con uno vale)
    else if (fechaPedido != null && fechaEntrega != null && estadoNombre != null && (idCliente != null || nombreCliente != null)) {
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListaFechasEstado(fechaPedido, fechaEntrega, estadoNombre).subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          if (datos_pedidos[index].cli_Nombre == nombreCliente || datos_pedidos[index].cli_Id == idCliente) {
            if (this.ValidarRol == 2) {
              if (datos_pedidos[index].usua_Nombre == this.storage_Nombre) this.pedidosProductos.push(datos_pedidos[index]);
            } else if (this.ValidarRol == 1) this.pedidosProductos.push(datos_pedidos[index]);
            this.pedidosProductos.sort((a,b)=> Number(b.pedExt_Id) - Number(a.pedExt_Id));
          }
        }
      });
    }
    //Buscará el o los pedidos que tengan los filtros que se le están pasando, es decir, todos excepto los campos idCliente y nombreCliente
    else if (fechaPedido != null && fechaEntrega != null && estadoNombre != null && nombreVendedor != null) {
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListaFechasEstadoVendedor(fechaPedido, fechaEntrega, estadoNombre, nombreVendedor).subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          if (this.ValidarRol == 2) {
            if (datos_pedidos[index].usua_Nombre == this.storage_Nombre) this.pedidosProductos.push(datos_pedidos[index]);
          } else if (this.ValidarRol == 1) this.pedidosProductos.push(datos_pedidos[index]);
          this.pedidosProductos.sort((a,b)=> Number(b.pedExt_Id) - Number(a.pedExt_Id));
        }
      });
    }
    //Buscará el o los pedidos que tengan los filtros que se le están pasando, es decir, todos exceptuando la fecha de entrega (no es necesario que esten llenos los campos idCliente y nombreCliente, con uno vale)
    else if (fechaPedido != null && estadoNombre != null && nombreVendedor != null && (idCliente != null || nombreCliente != null)) {
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListaFechaCreacionEstadoVendedor(fechaPedido, estadoNombre, nombreVendedor).subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          if (datos_pedidos[index].cli_Nombre == nombreCliente || datos_pedidos[index].cli_Id == idCliente) {
            if (this.ValidarRol == 2) {
              if (datos_pedidos[index].usua_Nombre == this.storage_Nombre) this.pedidosProductos.push(datos_pedidos[index]);
            } else if (this.ValidarRol == 1) this.pedidosProductos.push(datos_pedidos[index]);
            this.pedidosProductos.sort((a,b)=> Number(b.pedExt_Id) - Number(a.pedExt_Id));
          }
        }
      });
    }
    //Buscará el o los pedidos que tengan los filtros que se le están pasando, es decir, todos exceptuando la fecha de creacion (no es necesario que esten llenos los campos idCliente y nombreCliente, con uno vale)
    else if (fechaEntrega != null && estadoNombre != null && nombreVendedor != null && (idCliente != null || nombreCliente != null)) {
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListaFechaEntregaEstadoVendedor(fechaEntrega, estadoNombre, nombreVendedor).subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          if (datos_pedidos[index].cli_Nombre == nombreCliente || datos_pedidos[index].cli_Id == idCliente) {
            if (this.ValidarRol == 2) {
              if (datos_pedidos[index].usua_Nombre == this.storage_Nombre) this.pedidosProductos.push(datos_pedidos[index]);
            } else if (this.ValidarRol == 1) this.pedidosProductos.push(datos_pedidos[index]);
            this.pedidosProductos.sort((a,b)=> Number(b.pedExt_Id) - Number(a.pedExt_Id));
          }
        }
      });
    }
    //Buscará el o los pedidos que tengan los filtros que se le están pasando, es decir, fechas y estado
    else if (fechaPedido != null && fechaEntrega != null && estadoNombre != null) {
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListaFechas(fechaPedido, fechaEntrega).subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          if (datos_pedidos[index].estado_Nombre == estadoNombre) {
            if (this.ValidarRol == 2) {
              if (datos_pedidos[index].usua_Nombre == this.storage_Nombre) this.pedidosProductos.push(datos_pedidos[index]);
            } else if (this.ValidarRol == 1) this.pedidosProductos.push(datos_pedidos[index]);
            this.pedidosProductos.sort((a,b)=> Number(b.pedExt_Id) - Number(a.pedExt_Id));
          }
        }
      });
    }
    //Buscará el o los pedidos que tengan los filtros que se le están pasando, es decir, fechas y cliente (no es necesario que esten llenos los campos idCliente y nombreCliente, con uno vale)
    else if (fechaPedido != null && fechaEntrega != null && (idCliente != null || nombreCliente != null)) {
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListaFechas(fechaPedido, fechaEntrega).subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          if (datos_pedidos[index].cli_Nombre == nombreCliente || datos_pedidos[index].cli_Id == idCliente) {
            if (this.ValidarRol == 2) {
              if (datos_pedidos[index].usua_Nombre == this.storage_Nombre) this.pedidosProductos.push(datos_pedidos[index]);
            } else if (this.ValidarRol == 1) this.pedidosProductos.push(datos_pedidos[index]);
            this.pedidosProductos.sort((a,b)=> Number(b.pedExt_Id) - Number(a.pedExt_Id));
          }
        }
      });
    }
    //Buscará el o los pedidos que tengan los filtros que se le están pasando, es decir, fechas y vendedor
    else if (fechaPedido != null && fechaEntrega != null && nombreVendedor != null) {
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListaFechas(fechaPedido, fechaEntrega).subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          if (datos_pedidos[index].usua_Nombre == nombreVendedor) {
            if (this.ValidarRol == 2) {
              if (datos_pedidos[index].usua_Nombre == this.storage_Nombre) this.pedidosProductos.push(datos_pedidos[index]);
            } else if (this.ValidarRol == 1) this.pedidosProductos.push(datos_pedidos[index]);
            this.pedidosProductos.sort((a,b)=> Number(b.pedExt_Id) - Number(a.pedExt_Id));
          }
        }
      });
    }
    //Buscará el o los pedidos que tengan los filtros que se le están pasando, es decir, fecha en que se hizo el pedido, estado y cliente
    else if (fechaPedido != null && estadoNombre != null && (idCliente != null || nombreCliente != null)){
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListaFechaCreacionEstado(fechaPedido, estadoNombre).subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          if (datos_pedidos[index].cli_Nombre == nombreCliente || datos_pedidos[index].cli_Id == idCliente) {
            if (this.ValidarRol == 2) {
              if (datos_pedidos[index].usua_Nombre == this.storage_Nombre) this.pedidosProductos.push(datos_pedidos[index]);
            } else if (this.ValidarRol == 1) this.pedidosProductos.push(datos_pedidos[index]);
            this.pedidosProductos.sort((a,b)=> Number(b.pedExt_Id) - Number(a.pedExt_Id));
          }
        }
      });
    }
    //Buscará el o los pedidos que tengan los filtros que se le están pasando, es decir, fecha en que se hizo el pedido, estado y vendedor
    else if (fechaPedido != null && estadoNombre != null && nombreVendedor != null) {
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListaFechaCreacionUsuario(fechaPedido, nombreVendedor).subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          if (datos_pedidos[index].estado_Nombre == estadoNombre) {
            if (this.ValidarRol == 2) {
              if (datos_pedidos[index].usua_Nombre == this.storage_Nombre) this.pedidosProductos.push(datos_pedidos[index]);
            } else if (this.ValidarRol == 1) this.pedidosProductos.push(datos_pedidos[index]);
            this.pedidosProductos.sort((a,b)=> Number(b.pedExt_Id) - Number(a.pedExt_Id));
          }
        }
      });
    }
    //Buscará el o los pedidos que tengan los filtros que se le están pasando, es decir, fecha en que se hizo el pedido, vendedor y cliente
    else if (fechaPedido != null && nombreVendedor != null && (idCliente != null || nombreCliente != null)) {
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListaFechaCreacionUsuario(fechaPedido, nombreVendedor).subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          if (datos_pedidos[index].cli_Nombre == nombreCliente || datos_pedidos[index].cli_Id == idCliente) {
            if (this.ValidarRol == 2) {
              if (datos_pedidos[index].usua_Nombre == this.storage_Nombre) this.pedidosProductos.push(datos_pedidos[index]);
            } else if (this.ValidarRol == 1) this.pedidosProductos.push(datos_pedidos[index]);
            this.pedidosProductos.sort((a,b)=> Number(b.pedExt_Id) - Number(a.pedExt_Id));
          }
        }
      });
    }
    //Buscará el o los pedidos que tengan los filtros que se le están pasando, es decir, fecha de entrega, estado y cliente
    else if (fechaEntrega != null && estadoNombre != null && (idCliente != null || nombreCliente != null)) {
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListaFechaEntregaEstado(fechaEntrega, estadoNombre).subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          if (datos_pedidos[index].cli_Nombre == nombreCliente || datos_pedidos[index].cli_Id == idCliente) {
            if (this.ValidarRol == 2) {
              if (datos_pedidos[index].usua_Nombre == this.storage_Nombre) this.pedidosProductos.push(datos_pedidos[index]);
            } else if (this.ValidarRol == 1) this.pedidosProductos.push(datos_pedidos[index]);
            this.pedidosProductos.sort((a,b)=> Number(b.pedExt_Id) - Number(a.pedExt_Id));
          }
        }
      });
    }
    //Buscará el o los pedidos que tengan los filtros que se le están pasando, es decir, fecha de entrega, estado y vendedor
    else if (fechaEntrega != null && estadoNombre != null && nombreVendedor != null) {
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListaFechaEntregaUsuario(fechaEntrega, nombreVendedor).subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          if (datos_pedidos[index].estado_Nombre == estadoNombre) {
            if (this.ValidarRol == 2) {
              if (datos_pedidos[index].usua_Nombre == this.storage_Nombre) this.pedidosProductos.push(datos_pedidos[index]);
            } else if (this.ValidarRol == 1) this.pedidosProductos.push(datos_pedidos[index]);
            this.pedidosProductos.sort((a,b)=> Number(b.pedExt_Id) - Number(a.pedExt_Id));
          }
        }
      });
    }
    //Buscará el o los pedidos que tengan los filtros que se le están pasando, es decir, fecha de entrega, vendedor y cliente
    else if (fechaEntrega != null && nombreVendedor != null && (idCliente != null || nombreCliente != null)) {
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListaFechaEntregaUsuario(fechaEntrega, nombreVendedor).subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          if (datos_pedidos[index].cli_Id == idCliente || datos_pedidos[index].cli_Nombre == nombreCliente) {
            if (this.ValidarRol == 2) {
              if (datos_pedidos[index].usua_Nombre == this.storage_Nombre) this.pedidosProductos.push(datos_pedidos[index]);
            } else if (this.ValidarRol == 1) this.pedidosProductos.push(datos_pedidos[index]);
            this.pedidosProductos.sort((a,b)=> Number(b.pedExt_Id) - Number(a.pedExt_Id));
          }
        }
      });
    }
    //Buscará el o los pedidos que tengan los filtros que se le están pasando, es decir, estado, vendedor y cliente
    else if (estadoNombre != null && nombreVendedor != null && (idCliente != null || nombreCliente != null)) {
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListaEstadoUsuario(estadoNombre, nombreVendedor).subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          if (datos_pedidos[index].cli_Id == idCliente || datos_pedidos[index].cli_Nombre == nombreCliente) {
            if (this.ValidarRol == 2) {
              if (datos_pedidos[index].usua_Nombre == this.storage_Nombre) this.pedidosProductos.push(datos_pedidos[index]);
            } else if (this.ValidarRol == 1) this.pedidosProductos.push(datos_pedidos[index]);
            this.pedidosProductos.sort((a,b)=> Number(b.pedExt_Id) - Number(a.pedExt_Id));
          }
        }
      });
    }
    //Buscará el o los pedidos que tengan los filtros que se le están pasando, es decir, fecha del pedido y estado
    else if (fechaPedido != null && estadoNombre != null) {
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListaFechaCreacion(fechaPedido).subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          if (datos_pedidos[index].estado_Nombre == estadoNombre) {
            if (this.ValidarRol == 2) {
              if (datos_pedidos[index].usua_Nombre == this.storage_Nombre) this.pedidosProductos.push(datos_pedidos[index]);
            } else if (this.ValidarRol == 1) this.pedidosProductos.push(datos_pedidos[index]);
            this.pedidosProductos.sort((a,b)=> Number(b.pedExt_Id) - Number(a.pedExt_Id));
          }
        }
      });
    }
    //Buscará el o los pedidos que tengan los filtros que se le están pasando, es decir, fecha del pedido y cliente
    else if (fechaPedido != null && (idCliente != null || nombreCliente != null)) {
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListaFechaCreacion(fechaPedido).subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          if (datos_pedidos[index].cli_Id == idCliente || datos_pedidos[index].cli_Nombre == nombreCliente) {
            if (this.ValidarRol == 2) {
              if (datos_pedidos[index].usua_Nombre == this.storage_Nombre) this.pedidosProductos.push(datos_pedidos[index]);
            } else if (this.ValidarRol == 1) this.pedidosProductos.push(datos_pedidos[index]);
            this.pedidosProductos.sort((a,b)=> Number(b.pedExt_Id) - Number(a.pedExt_Id));
          }
        }
      });
    }
    //Buscará el o los pedidos que tengan los filtros que se le están pasando, es decir, fecha del pedido y vendedor
    else if (fechaPedido != null && nombreVendedor != null) {
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListaFechaCreacion(fechaPedido).subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          if (nombreVendedor == datos_pedidos[index].usua_Nombre) {
            if (this.ValidarRol == 2) {
              if (datos_pedidos[index].usua_Nombre == this.storage_Nombre) this.pedidosProductos.push(datos_pedidos[index]);
            } else if (this.ValidarRol == 1) this.pedidosProductos.push(datos_pedidos[index]);
            this.pedidosProductos.sort((a,b)=> Number(b.pedExt_Id) - Number(a.pedExt_Id));
          }
        }
      });
    }
    //Buscará los pedidos por las fechas filtradas
    else if (fechaPedido !== null && fechaEntrega !== null) {
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListaFechas(fechaPedido, fechaEntrega).subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          if (this.ValidarRol == 2) {
            if (datos_pedidos[index].usua_Nombre == this.storage_Nombre) this.pedidosProductos.push(datos_pedidos[index]);
          } else if (this.ValidarRol == 1) this.pedidosProductos.push(datos_pedidos[index]);
          this.pedidosProductos.sort((a,b)=> Number(b.pedExt_Id) - Number(a.pedExt_Id));
        }
      });
    }
    //Buscará el o los pedidos que tengan los filtros que se le están pasando, es decir, fecha de entrga y estado
    else if (fechaEntrega != null && estadoNombre != null) {
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListaFechaEntrega(fechaEntrega).subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          if (datos_pedidos[index].estado_Nombre == estadoNombre) {
            if (this.ValidarRol == 2) {
              if (datos_pedidos[index].usua_Nombre == this.storage_Nombre) this.pedidosProductos.push(datos_pedidos[index]);
            } else if (this.ValidarRol == 1) this.pedidosProductos.push(datos_pedidos[index]);
            this.pedidosProductos.sort((a,b)=> Number(b.pedExt_Id) - Number(a.pedExt_Id));
          }
        }
      });
    }
    //Buscará el o los pedidos que tengan los filtros que se le están pasando, es decir, fecha de entrga y cliente
    else if (fechaEntrega != null && (idCliente != null || nombreCliente != null)) {
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListaFechaEntrega(fechaEntrega).subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          if (idCliente == datos_pedidos[index].cli_Id || nombreCliente == datos_pedidos[index].cli_Nombre) {
            if (this.ValidarRol == 2) {
              if (datos_pedidos[index].usua_Nombre == this.storage_Nombre) this.pedidosProductos.push(datos_pedidos[index]);
            } else if (this.ValidarRol == 1) this.pedidosProductos.push(datos_pedidos[index]);
            this.pedidosProductos.sort((a,b)=> Number(b.pedExt_Id) - Number(a.pedExt_Id));
          }
        }
      });
    }
    //Buscará el o los pedidos que tengan los filtros que se le están pasando, es decir, fecha de entrga y vendedor
    else if (fechaEntrega != null && nombreVendedor != null) {
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListaFechaEntrega(fechaEntrega).subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          if (datos_pedidos[index].usua_Nombre == nombreVendedor) {
            if (this.ValidarRol == 2) {
              if (datos_pedidos[index].usua_Nombre == this.storage_Nombre) this.pedidosProductos.push(datos_pedidos[index]);
            } else if (this.ValidarRol == 1) this.pedidosProductos.push(datos_pedidos[index]);
            this.pedidosProductos.sort((a,b)=> Number(b.pedExt_Id) - Number(a.pedExt_Id));
          }
        }
      });
    }
    //Buscará el o los pedidos que tengan los filtros que se le están pasando, es decir, estado y cliente
    else if (estadoNombre != null && (idCliente != null || nombreCliente != null)) {
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListanombreEstado(estadoNombre).subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          if (datos_pedidos[index].estado_Nombre == estadoNombre) {
            if (nombreCliente == datos_pedidos[index].cli_Nombre || idCliente == datos_pedidos[index].cli_Id) {
              if (this.ValidarRol == 2) {
                if (datos_pedidos[index].usua_Nombre == this.storage_Nombre) this.pedidosProductos.push(datos_pedidos[index]);
              } else if (this.ValidarRol == 1) this.pedidosProductos.push(datos_pedidos[index]);
              this.pedidosProductos.sort((a,b)=> Number(b.pedExt_Id) - Number(a.pedExt_Id));
            }
          }
        }
      });
    }
    //Buscará el o los pedidos que tengan los filtros que se le están pasando, es decir, estado y vendedor
    else if (estadoNombre != null && nombreVendedor != null) {
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListanomberVendeder(nombreVendedor).subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          if (datos_pedidos[index].estado_Nombre == estadoNombre) {
            if (this.ValidarRol == 2) {
              if (datos_pedidos[index].usua_Nombre == this.storage_Nombre) this.pedidosProductos.push(datos_pedidos[index]);
            } else if (this.ValidarRol == 1) this.pedidosProductos.push(datos_pedidos[index]);
            this.pedidosProductos.sort((a,b)=> Number(b.pedExt_Id) - Number(a.pedExt_Id));
          }
        }
      });
    }
    //Buscará los pedidos con el estado que se digitó
    else if (estadoNombre !== null) {
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListanombreEstado(estadoNombre).subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          if (this.ValidarRol == 2) {
            if (datos_pedidos[index].usua_Nombre == this.storage_Nombre) this.pedidosProductos.push(datos_pedidos[index]);
          } else if (this.ValidarRol == 1) this.pedidosProductos.push(datos_pedidos[index]);
          this.pedidosProductos.sort((a,b)=> Number(b.pedExt_Id) - Number(a.pedExt_Id));
        }
      });
    }
    //Buscará el pedido por el ID que se digitó
    else if (idPedido !== null) {
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListaIDPedido(idPedido).subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          if (this.ValidarRol == 2) {
            if (datos_pedidos[index].usua_Nombre == this.storage_Nombre) this.pedidosProductos.push(datos_pedidos[index]);
          } else if (this.ValidarRol == 1) this.pedidosProductos.push(datos_pedidos[index]);
          this.pedidosProductos.sort((a,b)=> Number(b.pedExt_Id) - Number(a.pedExt_Id));
        }
      });
    }
    //Buscará los pedidos del usuario que se ha seleccionado
    else if (nombreVendedor !== null){
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListanomberVendeder(nombreVendedor).subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          if (this.ValidarRol == 2) {
            if (datos_pedidos[index].usua_Nombre == this.storage_Nombre) this.pedidosProductos.push(datos_pedidos[index]);
          } else if (this.ValidarRol == 1) this.pedidosProductos.push(datos_pedidos[index]);
          this.pedidosProductos.sort((a,b)=> Number(b.pedExt_Id) - Number(a.pedExt_Id));
        }
      });
    }
    //Buscará los pedidos del cliente que se buscó por su Id
    else if (idCliente !== null){
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListaIdCliente(idCliente).subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          if (this.ValidarRol == 2) {
            if (datos_pedidos[index].usua_Nombre == this.storage_Nombre) this.pedidosProductos.push(datos_pedidos[index]);
          } else if (this.ValidarRol == 1) this.pedidosProductos.push(datos_pedidos[index]);
          this.pedidosProductos.sort((a,b)=> Number(b.pedExt_Id) - Number(a.pedExt_Id));
        }
      });
    }
    //Buscará los pedidos de los clientes por el que se seleccionó
    else if (nombreCliente !== null){
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListaNombreCliente(nombreCliente).subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          if (this.ValidarRol == 2) {
            if (datos_pedidos[index].usua_Nombre == this.storage_Nombre) this.pedidosProductos.push(datos_pedidos[index]);
          } else if (this.ValidarRol == 1) this.pedidosProductos.push(datos_pedidos[index]);
          this.pedidosProductos.sort((a,b)=> Number(b.pedExt_Id) - Number(a.pedExt_Id));
        }
      });
    }
    //Buscará los pedidos por la fecha que se selccionó, esta fecha será la fecha de creación del pedido
    else if (fechaPedido !== null) {
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListaFechaCreacion(fechaPedido).subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          if (this.ValidarRol == 2) {
            if (datos_pedidos[index].usua_Nombre == this.storage_Nombre) this.pedidosProductos.push(datos_pedidos[index]);
          } else if (this.ValidarRol == 1) this.pedidosProductos.push(datos_pedidos[index]);
          this.pedidosProductos.sort((a,b)=> Number(b.pedExt_Id) - Number(a.pedExt_Id));
        }
      });
    }
    //Buscará los pedidos por la fecha que se selccionó, esta fecha será la fecha de entrega del pedido
    else if (fechaEntrega !== null) {
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListaFechaEntrega(fechaEntrega).subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          if (this.ValidarRol == 2) {
            if (datos_pedidos[index].usua_Nombre == this.storage_Nombre) this.pedidosProductos.push(datos_pedidos[index]);
          } else if (this.ValidarRol == 1) this.pedidosProductos.push(datos_pedidos[index]);
          this.pedidosProductos.sort((a,b)=> Number(b.pedExt_Id) - Number(a.pedExt_Id));
        }
      });
    }
    //Bucará todos los pedidos existentes
    else {
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListaPedidoExterno().subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          if (this.ValidarRol == 2) {
            if (datos_pedidos[index].usua_Nombre == this.storage_Nombre) this.pedidosProductos.push(datos_pedidos[index]);
          } else if (this.ValidarRol == 1) this.pedidosProductos.push(datos_pedidos[index]);
          this.pedidosProductos.sort((a,b)=> Number(b.pedExt_Id) - Number(a.pedExt_Id));
        }
      });
    }

    setTimeout(() => {
      this.load = true;
    }, 1500);
  }

  //Funcion que organiza los campos de la tabla de pedidos de mayor a menor
  organizacionPrecioDblClick(){
    this.pedidosProductos.sort((a,b)=> Number(b.pedExt_PrecioTotal) - Number(a.pedExt_PrecioTotal));
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });
    Toast.fire({
      icon: 'warning',
      title: 'Ordenado por "Precio Total" de mayor a menor'
    });
  }

  //Funcion que organiza los campos de la tabla de pedidos de menor a mayor
  organizacionPrecio(){
    this.pedidosProductos.sort((a,b)=> Number(a.pedExt_PrecioTotal) - Number(b.pedExt_PrecioTotal));
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });
    Toast.fire({
      icon: 'warning',
      title: 'Ordenado por "Precio Total" de menor a mayor'
    });
  }

  //Funcion que limpia los campos de consulta de pedidos
  limpiarCamposConsulta(){
    this.FormConsultaPedidoExterno.reset();
    this.pedidosProductos = [];
  }

  //Se obtiene el ultimo codigo del pedido y se incrementa en 1. (Contador)
  ObtenerUltimoPedido() {
    this.pedidoproductoService.srvObtenerUltimoPedido().subscribe(dataPedExternos =>{
      let datos : any = [];
      datos.push(dataPedExternos);
      for (const item of datos) {
        this.contadorPedidosExternos = item.pedExt_Id + 1;
      }
    });
  }

  //Funcion que colocará el nombre a las columnas de la tabla en la cual se muestran los productos pedidos por los clientes
  ColumnasTabla(){
    this.titulosTabla = [];
    this.titulosTabla = [{
      pID : "Id",
      pNombre : "Nombre",
      pAncho :   "Ancho",
      pFuelle : "Fuelle",
      pCalibre : "Cal",
      pUndMedACF : "Und.",
      pTipoProd : "TipoProd",
      pMaterial : 'Material',
      pPigmento : 'Pigmento',
      pCantidad : "Cantidad",
      pLargo : "Largo",
      pUndMedCant : "Und. Cant",
      pPrecioU : "Precio U",
      pMoneda : "Moneda",
      pStock : "Stock",
      pDescripcion : "Descripción",
      pSubtotal : "Subtotal",
    }]
  }

  // Funcion que envia la informacion de los productos a la tabla.
  cargarFormProductoEnTablas(formulario : any){

    this.ultimoPrecio = 0;
    let idProducto : number = this.FormPedidoExternoProductos.value.ProdId;
    let precioProducto : number = this.FormPedidoExternoProductos.value.ProdPrecioUnd;
    let presentacion : string = this.FormPedidoExternoProductos.value.ProdUnidadMedidaCant;
    let cantidad : number = this.FormPedidoExternoProductos.value.ProdCantidad;
    let subtotalProd : number = precioProducto * cantidad;
    let nombreProducto : any = this.FormPedidoExternoProductos.value.ProdNombre;

    this.valorTotal = this.valorTotal + subtotalProd;

    this.existenciasProductosServices.srvObtenerListaPorIdProducto(idProducto).subscribe(datos_existencias => {
      for (let index = 0; index < datos_existencias.length; index++) {
        if (precioProducto >= datos_existencias[index].exProd_PrecioVenta) {
          let productoExt : any = {
            Id : this.FormPedidoExternoProductos.get('ProdId')?.value,
            Nombre : nombreProducto,
            Ancho : this.FormPedidoExternoProductos.get('ProdAncho').value,
            Fuelle : this.FormPedidoExternoProductos.get('ProdFuelle').value,
            Cal : this.FormPedidoExternoProductos.get('ProdCalibre').value,
            Und : this.FormPedidoExternoProductos.get('ProdUnidadMedidaACF').value,
            Tipo : this.FormPedidoExternoProductos.get('ProdTipo').value,
            Material : this.FormPedidoExternoProductos.value.ProdMaterial,
            Pigmento: this.FormPedidoExternoProductos.value.ProdPigmento,
            Cant : this.FormPedidoExternoProductos.get('ProdCantidad').value,
            Largo : this.FormPedidoExternoProductos.get('ProdLargo').value,
            UndCant : this.FormPedidoExternoProductos.get('ProdUnidadMedidaCant')?.value,
            PrecioUnd : precioProducto,
            TpMoneda : this.FormPedidoExternoProductos.get('ProdTipoMoneda').value,
            Stock : this.FormPedidoExternoProductos.get('ProdStock').value,
            Produ_Descripcion : this.FormPedidoExternoProductos.get('ProdDescripcion').value,
            SubTotal : this.FormPedidoExternoProductos.get('ProdCantidad').value * this.FormPedidoExternoProductos.get('ProdPrecioUnd')?.value
          }

          let campoId = this.FormPedidoExternoProductos.get('ProdId')?.value;
          if (this.AccionBoton == "Agregar" && this.ArrayProducto.length == 0) {
            this.ArrayProducto.push(productoExt);
            this.LimpiarCamposProductos();

          } else if (this.AccionBoton == "Agregar" && this.ArrayProducto.length != 0){
            this.ArrayProducto.push(productoExt);
            this.LimpiarCamposProductos();
            productoExt = [];
          } else {
            for (let index = 0; index < formulario.length; index++) {
              if(productoExt.Id == this.ArrayProducto[index].Id) {
                this.ArrayProducto.splice(index, 1);
                this.ArrayProducto.push(productoExt);
                this.AccionBoton = "Agregar";
                this.LimpiarCamposProductos();
                break;
              }
            }
          }
        } else Swal.fire(`El precio digitado no puede ser menor al que tiene el producto estipulado $${datos_existencias[index].exProd_PrecioVenta}`);
        }
      // for (let index = 0; index < this.ArrayProducto.length; index++) {
      //   this.valorTotal = this.ArrayProducto.reduce((accion) => accion + (cantidad * precioProducto), 0);
      // }
      this.ArrayProducto.sort((a,b)=> Number(a.PrecioUnd) - Number(b.PrecioUnd));
    });
  }

  // Funcion para crear los pedidos de productos y añadirlos a la base de datos
  CrearPedidoExterno() {
    let direccionSede : string = this.FormPedidoExternoClientes.value.PedSedeCli_Id;
    let ciudad : string = this.FormPedidoExternoClientes.value.ciudad_sede;
    let clienteNombre : any = this.FormPedidoExternoClientes.value.PedClienteNombre;
    let idProducto : any;
    let cantidadProducto : any;
    let unidadMedida : any;
    let precioUnidad : number;
    let campoEstado = this.FormPedidoExternoClientes.get('PedEstadoId')?.value;

    this.estadosService.srvObtenerListaPorNombreEstado(campoEstado).subscribe(datos_estado => {
      for (let j = 0; j < datos_estado.length; j++) {
        this.sedesClientesService.srvObtenerListaPorClienteSede(clienteNombre.cli_Nombre, ciudad, direccionSede).subscribe(datos_sedeCliente => {
          for (let i = 0; i < datos_sedeCliente.length; i++) {
            const camposPedido : any = {
              PedExt_FechaCreacion: this.FormPedidoExternoClientes.get('PedFecha')?.value,
              PedExt_FechaEntrega: this.FormPedidoExternoClientes.get('PedFechaEnt')?.value,
              Empresa_Id: this.EmpresaVendedora,
              SedeCli_Id: datos_sedeCliente[i].sedeCli_Id,
              Usua_Id: datos_sedeCliente[i].usua_Id,
              Estado_Id: datos_estado[j].estado_Id,
              PedExt_Observacion: this.FormPedidoExternoClientes.get('PedObservacion')?.value,
              PedExt_PrecioTotal: this.valorTotal,
              PedExt_Archivo: 0,
              PedExt_HoraCreacion : moment().format('H:mm:ss'),
            }

            if(!this.ArrayProducto.length) Swal.fire('Debe cargar al menos un producto en la tabla.');
            else if (campoEstado == "Finalizado" || campoEstado == "Cancelado" || campoEstado == "Anulado") Swal.fire('No puede crear un pedido con el estado seleccionado. Por favor verifique.');
            else if (camposPedido.PedExt_FechaEntrega <= camposPedido.PedExt_FechaCreacion) Swal.fire('La fecha de creación no puede ser menor o igual a la fecha de entrega.');
            else{
              this.pedidoproductoService.srvGuardarPedidosProductos(camposPedido).subscribe(data=> {

                this.pedidoproductoService.srvObtenerUltimoPedido().subscribe(dataPedExternos =>{
                  let datos : any = [];
                  datos.push(dataPedExternos);
                  for (const item of datos) {
                    for (let index = 0; index < this.ArrayProducto.length; index++) {
                      idProducto = this.ArrayProducto[index].Id;
                      cantidadProducto = this.ArrayProducto[index].Cant;
                      unidadMedida = this.ArrayProducto[index].UndCant;
                      precioUnidad = this.ArrayProducto[index].PrecioUnd;

                      const productosPedidos : any = {
                        Prod_Id: idProducto,
                        PedExt_Id: item.pedExt_Id,
                        PedExtProd_Cantidad : cantidadProducto,
                        UndMed_Id : unidadMedida,
                        PedExtProd_PrecioUnitario : precioUnidad
                      }

                      this.PedidoProductosService.srvGuardar(productosPedidos).subscribe(registro_pedido_productos => {}, error => { console.log(error); });
                    }
                    const Toast = Swal.mixin({
                      toast: true,
                      position: 'top-end',
                      showConfirmButton: false,
                      timer: 3000,
                      timerProgressBar: true,
                      didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer)
                        toast.addEventListener('mouseleave', Swal.resumeTimer)
                      }
                    })

                    Toast.fire({
                      icon: 'success',
                      title: 'Pedido creado satisfactoriamente'
                    });

                    this.crearpdf();
                    setTimeout(() => {
                      this.LimpiarCampos();
                    }, 1000);
                  }
                });
              }, error => { console.log(error); });
            }
          }
        });
      }
    });
  }

  //Función para obtener el ID de la empresa, apartir de la posición
  /*La idea es que al iniciar sesión se deje en algún lado del programa el ID
  de la empresa y se capte de ahí su Identificación*/
  obtenerEmpresa(){
    this.SrvEmpresa.srvObtenerLista().subscribe((dataEmpresa) => {
      for (let index = 0; index < dataEmpresa.length; index++) {
        this.EmpresaVendedora = dataEmpresa[0].empresa_Id;
        break
      }
    }, error => { console.log(error); })
  }

  // Función para limpiar la tabla en la que se muestran los productos del pedido
  LimpiarTablaTotal(){
    this.ArrayProducto = [];
    this.valorTotal = 0;
  }

  // Funcion para llenar la tabla de productos con la informacion que se inserte en los modales
  llenarTablaProductosCreador(id : any, nombre : string, ancho : any, fuelle : any, calibre : any, largo : any, undMed : string, tpProducto : string, material : string, pigmento : string, cantidad : any, undMed2 : string, precio : any, moneda : string, descripcion : string){
    if (precio != null && cantidad != null) {
      let productoExt : any = {
        Id : id,
        Nombre : nombre,
        Ancho : ancho,
        Fuelle : fuelle,
        Cal : calibre,
        Und : undMed,
        Tipo : tpProducto,
        Material : material,
        Pigmento : pigmento,
        Cant : cantidad,
        Largo : largo,
        UndCant : undMed2,
        PrecioUnd : precio,
        TpMoneda : moneda,
        Stock : cantidad,
        Produ_Descripcion : descripcion,
        SubTotal : this.formatonumeros(cantidad * precio),
      }

      if(this.ArrayProducto.length == 0) this.ArrayProducto.push(productoExt);
      else {
        for (let index = 0; index < this.ArrayProducto.length; index++) {
          if(this.FormPedidoExternoProductos.value.ProdId == this.ArrayProducto[index].Id) Swal.fire('No se pueden cargar datos identicos a la tabla.');
          else this.ArrayProducto.push(productoExt);
          break;
        }
      }
      for (let index = 0; index < this.ArrayProducto.length; index++) {
        this.valorTotal = this.ArrayProducto.reduce((accion, productoExt,) => accion + (cantidad * precio), 0);
      }
    }
  }

  // Funcion para llenar los datos de los clientes que se son creados en el modal
  llenarClientesCreado(id : any, tipoId : any, nombre : any, telefono : any, email : any, tipoCliente : any, ciudadSede : any, vendedor : any, codigoPostal : any, direccionSede : any, sedeCLiID :any){
    this.cliente.push(nombre);
    this.sedeCliente.push(direccionSede);
    this.usuarioVendedor.push(vendedor);
  }

  // Fucnion para que crear ub pdf apenas se realiza el pedido de productos
  crearpdf(){
    this.pedidoproductoService.srvObtenerUltimoPedido().subscribe(dataPedExternos =>{
      let nombreCliente : any = this.FormPedidoExternoClientes.value.PedClienteNombre;
      let datos : any = [];
      datos.push(dataPedExternos);
      for (const item of datos) {
        this.sedesClientesService.srvObtenerListaPorNombreCliente(nombreCliente.cli_Nombre).subscribe(datos_sedeCliente => {
          for (let i = 0; i < datos_sedeCliente.length; i++) {
            for (let j = 0; j < this.ArrayProducto.length; j++) {
              const pdfDefinicion : any = {
                info: {
                  title: `${item.pedExt_Id}`
                },
                pageSize: {
                  width: 630,
                  height: 760
                },
                content : [
                  {
                    text: `Plasticaribe S.A.S ---- Orden de Pedidos de Productos`,
                    alignment: 'center',
                    style: 'titulo',
                  },
                  '\n \n',
                  {
                    text: `Fecha de pedido: ${this.FormPedidoExternoClientes.value.PedFecha}`,
                    style: 'header',
                    alignment: 'right',
                  },

                  {
                    text: `Fecha de entrega: ${this.FormPedidoExternoClientes.value.PedFechaEnt} `,
                    style: 'header',
                    alignment: 'right',
                  },
                  {
                    text: `Vendedor: ${this.FormPedidoExternoClientes.value.PedUsuarioNombre}\n`,
                    alignment: 'right',
                    style: 'header',
                  },
                  {
                    text: `Estado del pedido: ${this.FormPedidoExternoClientes.value.PedEstadoId}\n \n`,
                    alignment: 'right',
                    style: 'header',
                  },
                  {
                    text: `\n Información detallada del cliente \n \n`,
                    alignment: 'center',
                    style: 'header'
                  },
                  {
                    style: 'tablaCliente',
                    table: {
                      widths: ['*', '*', '*'],
                      style: 'header',
                      body: [
                        [
                          `ID: ${datos_sedeCliente[i].cli_Id}`,
                          `Tipo de ID: ${datos_sedeCliente[i].tipoIdentificacion_Id}`,
                          `Tipo de Cliente: ${datos_sedeCliente[i].tpCli_Nombre}`
                        ],
                        [
                          `Nombre: ${datos_sedeCliente[i].cli_Nombre}`,
                          `Telefono: ${datos_sedeCliente[i].cli_Telefono}`,
                          `Ciudad: ${datos_sedeCliente[i].sedeCliente_Ciudad}`
                        ],
                        [
                          `Dirección: ${datos_sedeCliente[i].sedeCliente_Direccion}`,
                          `Codigo Postal: ${datos_sedeCliente[i].sedeCli_CodPostal}`,
                          `E-mail: ${datos_sedeCliente[i].cli_Email}`
                        ]
                      ]
                    },
                    layout: 'lightHorizontalLines',
                    fontSize: 9,
                  },
                  {
                    text: `\n \nObervación sobre el pedido: \n ${this.FormPedidoExternoClientes.value.PedObservacion}\n`,
                    style: 'header',
                  },
                  {
                    text: `\n Información detallada de producto(s) pedido(s) \n `,
                    alignment: 'center',
                    style: 'header'
                  },

                  this.table(this.ArrayProducto, ['Id', 'Nombre', 'Ancho', 'Fuelle', 'Cal', 'Largo', 'Und', 'Tipo', 'Material', 'Pigmento', 'Cant', 'UndCant', 'PrecioUnd', 'SubTotal']),

                  {
                    text: `\n\nValor Total Pedido: $${this.formatonumeros(this.valorTotal)}`,
                    alignment: 'right',
                    style: 'header',
                  },
                  {
                    text: `Tipo de moneda: ${this.ArrayProducto[j].TpMoneda}`,
                    alignment: 'right',
                    style: 'header',
                  }
                ],
                styles: {
                  header: {
                    fontSize: 8,
                    bold: true
                  },
                  titulo: {
                    fontSize: 15,
                    bold: true
                  }
                }
              }
              const pdf = pdfMake.createPdf(pdfDefinicion);
              pdf.open();
              break;
            }
            break;
          }
        });
        break;
      }
    });
  }

  // funcion que se encagará de llenar la tabla de los productos en el pdf
  buildTableBody(data, columns) {
    var body = [];
    body.push(columns);
    data.forEach(function(row) {
        var dataRow = [];
        columns.forEach(function(column) {
            dataRow.push(row[column].toString());
        });
        body.push(dataRow);
    });

    return body;
  }

  // Funcion que genera la tabla donde se mostrará la información de los productos pedidos
  table(data, columns) {
    return {
        table: {
          headerRows: 1,
          widths: [18, 60, 20, 20, 20, 20, 20, 40, 45, 38, 30, 15, 25, 55],
          body: this.buildTableBody(data, columns),
        },
        fontSize: 7,
        layout: {
          fillColor: function (rowIndex, node, columnIndex) {
            return (rowIndex == 0) ? '#CCCCCC' : null;
          }
        }
    };
  }

  // Funcion para llenar el pdf con información de la base de datos dependiendo el pedido
  llenarPDFConBD(id : any){
    this.pedidoproductoService.srvObtenerListaPorIdPedidoLlenarPDF(id).subscribe(datos_pedido => {
      for (let i = 0; i < datos_pedido.length; i++) {
        for (const item of this.productosPedidos) {
          let FechaCreacionDatetime = datos_pedido[i].pedExt_FechaCreacion;
          let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T");
          let fechaCreacionFinal = FechaCreacionDatetime.substring(0, FechaCreacionNueva);

          let FechaEntregaDatetime = datos_pedido[i].pedExt_FechaEntrega;
          let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
          let fechaEntregaFinal = FechaEntregaDatetime.substring(0, FechaEntregaNueva);

          const pdfDefinicion : any = {
            info: {
              title: `${datos_pedido[i].pedExt_Id}`
            },
            pageSize: {
              width: 630,
              height: 760
            },
            content : [
              {
                text: `Orden de Pedidos de Productos N° ${datos_pedido[i].pedExt_Id}`,
                alignment: 'right',
                style: 'titulo',
              },
              '\n \n',
              {
                text: `Fecha de pedido: ${fechaCreacionFinal}`,
                style: 'header',
                alignment: 'right',
              },

              {
                text: `Fecha de entrega: ${fechaEntregaFinal} `,
                style: 'header',
                alignment: 'right',
              },
              {
                text: `Vendedor: ${datos_pedido[i].usua_Nombre}\n`,
                alignment: 'right',
                style: 'header',
              },
              {
                text: `Estado del pedido: ${datos_pedido[i].estado_Nombre}\n \n`,
                alignment: 'right',
                style: 'header',
              },
              {
                text: `\n Información detallada del cliente \n \n`,
                alignment: 'center',
                style: 'header'
              },
              {
                style: 'tablaCliente',
                table: {
                  widths: ['*', '*', '*'],
                  style: 'header',
                  body: [
                    [
                      `ID: ${datos_pedido[i].cli_Id}`,
                      `Tipo de ID: ${datos_pedido[i].tipoIdentificacion_Id}`,
                      `Tipo de Cliente: ${datos_pedido[i].tpCli_Nombre}`
                    ],
                    [
                      `Nombre: ${datos_pedido[i].cli_Nombre}`,
                      `Telefono: ${datos_pedido[i].cli_Telefono}`,
                      `Ciudad: ${datos_pedido[i].sedeCliente_Ciudad}`
                    ],
                    [
                      `Dirección: ${datos_pedido[i].sedeCliente_Direccion}`,
                      `Codigo Postal: ${datos_pedido[i].sedeCli_CodPostal}`,
                      `E-mail: ${datos_pedido[i].cli_Email}`
                    ]
                  ]
                },
                layout: 'lightHorizontalLines',
                fontSize: 9,
              },
              {
                text: `\n \nObervación sobre el pedido: \n ${datos_pedido[i].pedExt_Observacion}\n`,
                style: 'header',
              },
              {
                text: `\n Información detallada de producto(s) pedido(s) \n `,
                alignment: 'center',
                style: 'header'
              },

              this.table(this.productosPedidos, ['Id', 'Nombre', 'Ancho', 'Fuelle', 'Cal', 'Largo', 'Und', 'Tipo', 'Material', 'Pigmento', 'Cant', 'UndCant', 'PrecioUnd', 'SubTotal']),

              {
                style: 'tablaTotales',
                table: {
                  widths: [335, 135, 55],
                  style: 'header',
                  body: [
                    [
                      '',
                      {
                        border: [true, false, true, true],
                        text: `SUBTOTAL`
                      },
                      {
                        border: [false, false, true, true],
                        text: `${this.formatonumeros(datos_pedido[i].pedExt_PrecioTotal)}`
                      },
                    ],
                    [
                      '',
                      {
                        border: [true, false, true, true],
                        text: `DESCUENTO (%)`
                      },
                      {
                        border: [false, false, true, true],
                        text: `${datos_pedido[i].pedExt_Descuento}`
                      },
                    ],
                    [
                      '',
                      {
                        border: [true, false, true, true],
                        text: `SUBTOTAL MENOS DESCUENTO`
                      },
                      {
                        border: [false, false, true, true],
                        text: `${this.formatonumeros((datos_pedido[i].pedExt_PrecioTotal - ((datos_pedido[i].pedExt_PrecioTotal * datos_pedido[i].pedExt_Descuento) / 100)).toFixed(2))}`
                      },
                    ],
                    [
                      '',
                      {
                        border: [true, false, true, true],
                        text: `IVA (%)`
                      },
                      {
                        border: [false, false, true, true],
                        text: `${this.formatonumeros(datos_pedido[i].pedExt_Iva)}`
                      },
                    ],
                    [
                      '',
                      {
                        border: [true, false, true, true],
                        text: `SUBTOTAL MAS IVA`
                      },
                      {
                        border: [false, false, true, true],
                        text: `${this.formatonumeros((datos_pedido[i].pedExt_PrecioTotal + ((datos_pedido[i].pedExt_PrecioTotal* datos_pedido[i].pedExt_Iva) / 100)).toFixed(2))}`
                      },
                    ],
                    [
                      '',
                      {
                        border: [true, false, true, true],
                        text: `TOTAL`
                      },
                      {
                        border: [false, false, true, true],
                        text: `${this.formatonumeros(datos_pedido[i].pedExt_PrecioTotalFinal)}`
                      },
                    ]
                  ]
                },
                layout: {
                  defaultBorder: false,
                },
                fontSize: 7,
              },
            ],
            styles: {
              header: {
                fontSize: 8,
                bold: true
              },
              titulo: {
                fontSize: 15,
                bold: true
              }
            }
          }
          const pdf = pdfMake.createPdf(pdfDefinicion);
          pdf.open();
          break;
        }
        break;
      }
    });
  }

  // Funcion que llena el array con los productos que pertenecen al pedido que se consulta
  llenarProductoPedido(formulario : any){
    let id : any = formulario.pedExt_Id
    this.productosPedidos = [];

    this.PedidoProductosService.srvObtenerListaPorIdProductoPedido(id).subscribe(datos_pedido => {
      for (let i = 0; i < datos_pedido.length; i++) {
        this.existenciasProductosServices.srvObtenerListaPorIdProducto(datos_pedido[i].prod_Id).subscribe(datos_producto => {
          for (let j = 0; j < datos_producto.length; j++) {
            const producto : any = {
              Id: datos_producto[j].prod_Id,
              Nombre : datos_producto[j].prod_Nombre,
              Ancho : datos_producto[j].prod_Ancho,
              Fuelle : datos_producto[j].prod_Fuelle,
              Largo: datos_producto[j].prod_Largo,
              Cal : datos_producto[j].prod_Calibre,
              Und : datos_producto[j].undMedACF,
              Tipo : datos_producto[j].tpProd_Nombre,
              Material: datos_producto[j].material_Nombre,
              Pigmento: datos_producto[j].pigmt_Nombre,
              Cant : this.formatonumeros(datos_pedido[i].pedExtProd_Cantidad),
              UndCant : datos_pedido[i].undMed_Id,
              PrecioUnd : this.formatonumeros(datos_pedido[i].pedExtProd_PrecioUnitario),
              Moneda : datos_producto[j].tpMoneda_Id,
              Stock : datos_producto[j].exProd_Cantidad,
              SubTotal : this.formatonumeros((datos_pedido[i].pedExtProd_Cantidad * datos_pedido[i].pedExtProd_PrecioUnitario).toFixed(2)),
            }
            this.productosPedidos.push(producto);
          }
        });
      }
    });
    setTimeout(() => {
      this.llenarPDFConBD(id);
    }, 1200);
  }

  // Función para quitar un producto de la tabla
  QuitarProductoTabla(index : number, formulario : any) {
    this.productoEliminado = formulario.Id
    Swal.fire({
      title: '¿Estás seguro de eliminar el producto del pedido?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        if (this.enPedido === 'si') this.eliminarProductoPedido(this.productoEliminado);
        this.ArrayProducto.splice(index, 1);
        this.formatonumeros(this.valorTotal = this.valorTotal - formulario.SubTotal);
        Swal.fire('Producto eliminado');
      }
    });
  }

  // Función para editar uno de los productos de la tabla
  EditarProductoTabla(formulario : any) {
    this.Ide = formulario.Id;
    this.AccionBoton = "Editar";
    this.producto = [];
    this.presentacion = [];

    this.PedidoProductosService.srvObtenerListaPorIdProducto(formulario.Id, formulario.UndCant).subscribe(datos_productoPedido => {
      let datos : any = [];
      datos.push(datos_productoPedido);
      for (const item of datos) {
        this.existenciasProductosServices.srvObtenerListaPorIdProducto(formulario.Id).subscribe(datos_producto => {
          for (let i = 0; i < datos_producto.length; i++) {
            this.presentacion.push(datos_producto[i].undMed_Id);
            this.FormPedidoExternoProductos.patchValue({
              ProdId : formulario.Id,
              ProdNombre: formulario.Nombre,
              ProdAncho : formulario.Ancho,
              ProdFuelle : formulario.Fuelle,
              ProdCalibre : formulario.Cal,
              ProdLargo : formulario.Largo,
              ProdUnidadMedidaACF : formulario.Und,
              ProdTipo : formulario.Tipo,
              ProdCantidad : formulario.Cant,
              ProdUnidadMedidaCant : formulario.UndCant,
              ProdPrecioUnd : formulario.PrecioUnd,
              ProdTipoMoneda : formulario.TpMoneda,
              ProdStock : datos_producto[i].exProd_Cantidad,
              ProdDescripcion : formulario.Produ_Descripcion,
              ProdMaterial: formulario.Material,
              ProdPigmento: formulario.Pigmento,
              ProdUltFacturacion : item.pedExtProd_PrecioUnitario,
            });
            if (this.FormPedidoExternoProductos.value.ProdNombre != '') this.validarInputNombresProductos = false;
            else this.validarInputNombresProductos = true;
          }
        });
      }
    });
  }

  // Funcion para guardar clientes en la base de datos
  insertarClientes(id : any, tipoId : any, nombre : any, telefono : string, email : any, tipoCliente : string, ciudadSede : any, vendedor : any, codigoPostal : number, direccionSede : any, sedeCLiID : any){
    this.tipoClientService.srvObtenerListaPorNombreTipoCliente(tipoCliente).subscribe(datos_tipoCliente => {
      for (let index = 0; index < datos_tipoCliente.length; index++) {
        this.usuarioService.srvObtenerListaPorNombreUsuario(vendedor).subscribe(datos_usuario => {
          for (let index = 0; index < datos_usuario.length; index++) {
              if (this.ValidarRol == 2) {
                const datosClientes : modelCliente = {
                  Cli_Id: id,
                  TipoIdentificacion_Id : tipoId,
                  Cli_Nombre: nombre,
                  Cli_Telefono: telefono,
                  Cli_Email: email,
                  TPCli_Id: datos_tipoCliente[index].tpCli_Id,
                  Usua_Id: datos_usuario[index].usua_Id,
                  Estado_Id : 8,
                  Cli_Fecha : moment().format('YYYY-MM-DD'),
                  Cli_Hora : moment().format('H:mm:ss'),
                }
                this.clientesService.srvGuardar(datosClientes).subscribe(datos => { Swal.fire('Cliente guardado con éxito!'); }, error => { console.log(error); });
              }else if (this.ValidarRol == 1){
                const datosClientes : modelCliente = {
                  Cli_Id: id,
                  TipoIdentificacion_Id : tipoId,
                  Cli_Nombre: nombre,
                  Cli_Telefono: telefono,
                  Cli_Email: email,
                  TPCli_Id: datos_tipoCliente[index].tpCli_Id,
                  Usua_Id: datos_usuario[index].usua_Id,
                  Estado_Id : 1,
                  Cli_Fecha : moment().format('YYYY-MM-DD'),
                  Cli_Hora : moment().format('H:mm:ss'),
                }
                this.clientesService.srvGuardar(datosClientes).subscribe(datos => { Swal.fire('Cliente guardado con éxito!'); }, error => { console.log(error); });
              }
            break;
          }
        });
      }
    });
  }

  // Funcion para guardar en la base de datos las sede de clientes
  llenarSedeCliente(id : number, ciudadSede : any, codigoPostal : number, direccionSede : any){
    let sedes_id = [];
    let nuevoID : any;

    this.sedesClientesService.srvObtenerListaPorId(id+1).subscribe(datos_sedePorID => {
      this.sedesClientesService.srvObtenerLista().subscribe(datos_sedes => {
        for (let index = 0; index < datos_sedes.length; index++) {
          if (datos_sedes[index].cli_Id == id) sedes_id.push(datos_sedes[index].sedeCli_Id);
        }

        let ultimoId = Math.max.apply(null, sedes_id);
        nuevoID = ultimoId + 1;
        const datosSedes : any = {
          sedeCli_Id: nuevoID,
          SedeCliente_Ciudad: ciudadSede,
          SedeCliente_Direccion: direccionSede,
          SedeCli_CodPostal: codigoPostal,
          Cli_Id : id,
          SedeCli_Fecha : this.today,
          SedeCli_Hora : moment().format('H:mm:ss'),
        }
        this.sedesClientesService.srvGuardar(datosSedes).subscribe(datos_sede => {
          this.clientesComboBox();
          Swal.fire('Sede de cliente guardada con éxito!');
       }, error => { console.log(error); });

      });
    }, error => {
      nuevoID = id +""+ 1;
      const datosSedess : any = {
        sedeCli_Id: nuevoID,
        SedeCliente_Ciudad: ciudadSede,
        SedeCliente_Direccion: direccionSede,
        SedeCli_CodPostal: codigoPostal,
        Cli_Id : id,
      }
      this.sedesClientesService.srvGuardar(datosSedess).subscribe(datos_sede => {
        this.clientesComboBox();
        Swal.fire('Sede de cliente guardada con éxito!');
       }, error => { console.log(error); });
    });
  }

  // Funcion para guardar productos en la base de datos
  registrarProducto(id : any, nombre : any, ancho : any, fuelle : any, calibre : any, largo : any, undMed : any, tpProducto : any, material : any, pigmento : any, descripcion : any, cliente : any){
    let tipoProductos_nombre = tpProducto;
    this.tiposProductosService.srvObtenerListaPorNombreTipoProducto(tipoProductos_nombre).subscribe(datos_tipoProducto => {
      for (let index = 0; index < datos_tipoProducto.length; index++) {
        this.pigmentoServices.srvObtenerListaPorNombrePigmento(pigmento).subscribe(datos_pigmentos => {
          for (let pigm = 0; pigm < datos_pigmentos.length; pigm++) {
            this.materialService.srvObtenerListaPorNombreMaterial(material).subscribe(datos_material => {
              for (let mat = 0; mat < datos_material.length; mat++) {
                if (this.ValidarRol == 2) {
                  const datosProductos : any = {
                    Prod_Id: id,
                    Prod_Nombre: nombre,
                    Prod_Descripcion: descripcion,
                    TpProd_Id: datos_tipoProducto[index].tpProd_Id,
                    Prod_Peso_Bruto: 0,
                    Prod_Peso_Neto: 0,
                    UndMedPeso: undMed,
                    Prod_Fuelle: fuelle,
                    Prod_Ancho: ancho,
                    Prod_Calibre: calibre,
                    UndMedACF: undMed,
                    Estado_Id: 9,
                    Prod_Largo: largo,
                    Pigmt_Id: datos_pigmentos[pigm].pigmt_Id,
                    Material_Id: datos_material[mat].material_Id,
                    Prod_Fecha : this.today,
                    Prod_Hora : moment().format('H:mm:ss'),
                  };
                  this.clientesService.srvObtenerListaPorNombreCliente(cliente).subscribe(datos_clientes => {
                    for (let i = 0; i < datos_clientes.length; i++) {
                      const clienteproducto : any = {
                        Cli_Id: datos_clientes[i].cli_Id,
                        Prod_Id: id
                      }
                      this.productosServices.srvGuardar(datosProductos).subscribe(datos => {
                        this.ClientesProductosService.srvGuardar(clienteproducto).subscribe(datos =>{
                          const Toast = Swal.mixin({
                            toast: true,
                            position: 'center',
                            showConfirmButton: false,
                            timer: 3500,
                            timerProgressBar: true,
                            didOpen: (toast) => {
                              toast.addEventListener('mouseenter', Swal.stopTimer)
                              toast.addEventListener('mouseleave', Swal.resumeTimer)
                            }
                          });
                          Toast.fire({
                            icon: 'success',
                            title: `Producto creado con exito`
                          });
                        });
                      }, error => {console.log(error)});
                      break;
                    }
                  });
                }else if (this.ValidarRol == 1){
                  const datosProductos : any = {
                    Prod_Id: id,
                    Prod_Nombre: nombre,
                    Prod_Descripcion: descripcion,
                    TpProd_Id: datos_tipoProducto[index].tpProd_Id,
                    Prod_Peso_Bruto: 0,
                    Prod_Peso_Neto: 0,
                    UndMedPeso: undMed,
                    Prod_Fuelle: fuelle,
                    Prod_Ancho: ancho,
                    Prod_Calibre: calibre,
                    UndMedACF: undMed,
                    Estado_Id: 10,
                    Prod_Largo: largo,
                    Pigmt_Id: datos_pigmentos[pigm].pigmt_Id,
                    Material_Id: datos_material[mat].material_Id
                  };
                  this.clientesService.srvObtenerListaPorNombreCliente(cliente).subscribe(datos_clientes => {
                    for (let i = 0; i < datos_clientes.length; i++) {
                      const clienteproducto : any = {
                        Cli_Id: datos_clientes[i].cli_Id,
                        Prod_Id: id
                      }
                      this.productosServices.srvGuardar(datosProductos).subscribe(datos => {
                        this.ClientesProductosService.srvGuardar(clienteproducto).subscribe(datos =>{
                          const Toast = Swal.mixin({
                            toast: true,
                            position: 'center',
                            showConfirmButton: false,
                            timer: 3500,
                            timerProgressBar: true,
                            didOpen: (toast) => {
                              toast.addEventListener('mouseenter', Swal.stopTimer)
                              toast.addEventListener('mouseleave', Swal.resumeTimer)
                            }
                          });
                          Toast.fire({
                            icon: 'success',
                            title: `Producto creado con exito`
                          });
                        });
                      }, error => {console.log(error)});
                      break;
                    }
                  });
                }
              }
            });
          }
        });
      }
    });
  }

  // Funcion para guardarr las existencias de los productos en la base de datos
  registrarExistenciaProducto(id : any, cantidad : any, undMed2 : any, precio : any, precioFinal : string, moneda : any){
      const datosExistencias : any = {
        Prod_Id: id,
        ExProd_Cantidad: cantidad,
        TpBod_Id: 2,
        UndMed_Id: undMed2,
        ExProd_Precio: precio,
        ExProd_PrecioExistencia: precio * cantidad,
        ExProd_PrecioSinInflacion: 0,
        TpMoneda_Id: moneda,
        ExProd_PrecioVenta: precio,
      };
      this.existenciasProductosServices.srvGuardar(datosExistencias).subscribe(datos_existencias => {
        const Toast = Swal.mixin({
          toast: true,
          position: 'center',
          showConfirmButton: false,
          timer: 3500,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        });
        Toast.fire({
          icon: 'success',
          title: `La existencia del producto con el ID ${id} ha sido creada correctamente`
        });
      }, error => { console.log(error)});
  }

  // Funcion para actualizar un producto
  actualizarProducto(){
    let nombreProd : string = this.FormPedidoExternoProductos.value.ProdNombre;
    Swal.fire({
      title: '¿Está seguro de actualizar este producto?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Si, actualizar!'
    }).then((result) => {
      if (result.isConfirmed) {
        let id : number = this.FormPedidoExternoProductos.value.ProdId;
        let presentacion : any = this.FormPedidoExternoProductos.value.ProdUnidadMedidaCant;
        this.tiposProductosService.srvObtenerListaPorNombreTipoProducto( this.FormPedidoExternoProductos.value.ProdTipo).subscribe(datos_tipos => {
          for (let index = 0; index < datos_tipos.length; index++) {
            this.materialService.srvObtenerListaPorNombreMaterial(this.FormPedidoExternoProductos.value.ProdMaterial).subscribe(datos_material => {
              for (let index = 0; index < datos_material.length; index++) {
                this.pigmentoServices.srvObtenerListaPorNombrePigmento(this.FormPedidoExternoProductos.value.ProdPigmento).subscribe(datos_pigmentos => {
                  for (let index = 0; index < datos_pigmentos.length; index++) {
                    this.existenciasProductosServices.srvObtenerListaPorIdProductoPresentacion(id, presentacion).subscribe(datos_existencias => {
                      for (let i = 0; i < datos_existencias.length; i++) {
                        const datosProducto = {
                          Prod_Id : id,
                          Prod_Nombre: nombreProd,
                          Prod_Descripcion: this.FormPedidoExternoProductos.value.ProdDescripcion,
                          TpProd_Id: datos_tipos[index].tpProd_Id,
                          Prod_Peso_Bruto: datos_existencias[i].prod_Peso_Bruto,
                          Prod_Peso_Neto: datos_existencias[i].prod_Peso_Neto,
                          UndMedPeso: datos_existencias[i].undMedPeso,
                          Prod_Fuelle: this.FormPedidoExternoProductos.value.ProdFuelle,
                          Prod_Ancho: this.FormPedidoExternoProductos.value.ProdAncho,
                          Prod_Calibre: this.FormPedidoExternoProductos.value.ProdCalibre,
                          UndMedACF: this.FormPedidoExternoProductos.value.ProdUnidadMedidaACF,
                          Estado_Id: 10,
                          Prod_Largo: this.FormPedidoExternoProductos.value.ProdLargo,
                          Pigmt_Id: datos_pigmentos[index].pigmt_Id,
                          Material_Id: datos_material[index].material_Id,
                        }

                        const datosExistencias = {
                          Prod_Id: id,
                          exProd_Id: datos_existencias[i].exProd_Id,
                          ExProd_Cantidad: this.FormPedidoExternoProductos.value.ProdStock,
                          UndMed_Id: datos_existencias[i].undMed_Id,
                          TpBod_Id: datos_existencias[i].tpBod_Id,
                          ExProd_Precio: datos_existencias[i].exProd_Precio,
                          ExProd_PrecioExistencia: (this.FormPedidoExternoProductos.value.ProdPrecioUnd * this.FormPedidoExternoProductos.value.ProdStock),
                          ExProd_PrecioSinInflacion: datos_existencias[i].exProd_PrecioSinInflacion,
                          ExProd_PrecioTotalFinal: datos_existencias[i].exProd_PrecioTotalFinal,
                          TpMoneda_Id: this.FormPedidoExternoProductos.value.ProdTipoMoneda,
                          exProd_PrecioVenta : this.FormPedidoExternoProductos.value.ProdPrecioUnd
                        }
                        this.productosServices.srvActualizar(id, datosProducto).subscribe(datos_productos => {
                          this.existenciasProductosServices.srvActualizarProductoPresentacion(id, presentacion, datosExistencias).subscribe(datos_existencias => {
                            Swal.fire("¡Producto actualizado con exito!");
                          });
                        });
                        break;
                      }
                    });
                    break;
                  }
                });
                break;
              }
            });
            break;
          }
        });
      }
    });
  }

  // Funcion para editar un pedido
  MostrarPedido(formulario : any) {
    this.enPedido = 'si';
    this.ArrayProducto = [];
    this.sedeCliente = [];
    this.usuarioVende = [];
    this.ciudad = [];
    Swal.fire({
      title: '¿Está seguro de editar este pedido?',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Si, editar pedido',
      denyButtonText: `No, no editar`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.id_pedido = formulario.pedExt_Id;
        this.pedidoproductoService.srvObtenerListaPorIdPedidoLlenarPDF(formulario.pedExt_Id).subscribe(datos_pedido => {
          for (let i = 0; i < datos_pedido.length; i++) {
            this.sedesClientesService.srvObtenerListaPorNombreCliente(datos_pedido[i].cli_Nombre).subscribe(datos_sedesClientes => {
              for (let i = 0; i < datos_sedesClientes.length; i++) {
                this.ciudad.push(datos_sedesClientes[i].sedeCliente_Ciudad);
                this.sedeCliente.push(datos_sedesClientes[i].sedeCliente_Direccion);
              }
              for (let i = 0; i < datos_sedesClientes.length; i++) {
                this.usuarioVende.push(datos_sedesClientes[i].usua_Nombre);
                break;
              }
            });
            this.PedidoProductosService.srvObtenerListaPorIdProductoPedido(formulario.pedExt_Id).subscribe(datos_productosPedidos => {
              for (let j = 0; j < datos_productosPedidos.length; j++) {
                this.existenciasProductosServices.srvObtenerListaPorIdProducto(datos_productosPedidos[j].prod_Id).subscribe(datos_productos => {
                  for (let k = 0; k < datos_productos.length; k++) {
                    let FechaCreacionDatetime = datos_pedido[i].pedExt_FechaCreacion
                    let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T")
                    let fechaCreacion = FechaCreacionDatetime.substring(0, FechaCreacionNueva);

                    let FechaEntregaDatetime = datos_pedido[i].pedExt_FechaEntrega;
                    let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
                    let fechaEntrega = FechaEntregaDatetime.substring(0, FechaEntregaNueva);

                    this.FormPedidoExternoClientes.patchValue({
                      PedClienteNombre: datos_pedido[i].cli_Nombre,
                      ciudad_sede: datos_pedido[i].sedeCliente_Ciudad,
                      PedSedeCli_Id: datos_pedido[i].sedeCliente_Direccion,
                      PedUsuarioNombre: datos_pedido[i].usua_Nombre,
                      PedFecha: fechaCreacion,
                      PedFechaEnt: fechaEntrega,
                      PedEstadoId: datos_pedido[i].estado_Nombre,
                      PedObservacion: datos_pedido[i].pedExt_Observacion,
                    });
                    if (this.FormPedidoExternoClientes.value.PedClienteNombre != '') this.validarInputClientes = false;
                    else this.validarInputClientes = true;

                    let productoExt : any = {
                      Id : datos_productos[k].prod_Id,
                      Nombre : datos_productos[k].prod_Nombre,
                      Ancho : datos_productos[k].prod_Ancho,
                      Fuelle : datos_productos[k].prod_Fuelle,
                      Cal : datos_productos[k].prod_Calibre,
                      Und : datos_productos[k].undMedACF,
                      Tipo : datos_productos[k].tpProd_Nombre,
                      Material : datos_productos[k].material_Nombre,
                      Pigmento : datos_productos[k].pigmt_Nombre,
                      Cant : datos_productosPedidos[j].pedExtProd_Cantidad,
                      Largo : datos_productos[k].prod_Largo,
                      UndCant : datos_productosPedidos[j].undMed_Id,
                      PrecioUnd : datos_productosPedidos[j].pedExtProd_PrecioUnitario,
                      TpMoneda : datos_productos[k].tpMoneda_Id,
                      Stock : datos_productos[k].ExProd_Cantidad,
                      Produ_Descripcion : datos_productos[k].prod_Descripcion,
                      SubTotal : datos_productosPedidos[j].pedExtProd_Cantidad * datos_productosPedidos[j].pedExtProd_PrecioUnitario,
                    }

                    if(this.ArrayProducto.length == 0) this.ArrayProducto.push(productoExt);
                    else {
                      for (let index = 0; index < this.ArrayProducto.length; index++) {
                        this.ArrayProducto.push(productoExt);
                        this.valorTotal = this.ArrayProducto.reduce((accion, productoExt,) => accion + (datos_productosPedidos[j].pedExtProd_Cantidad * datos_productosPedidos[j].pedExtProd_PrecioUnitario), 0);
                        break;
                      }
                    }
                    break;
                  }
                });
              }
            });
          }
        });
      }
    });
  }

  // Función para editar uno de los pedidos
  editarPedido() {
    this.enPedido = 'no';
    this.id_pedido;
    let estadoNombre : string = this.FormPedidoExternoClientes.value.PedEstadoId;
    let idProducto = [];
    let productoArray = [];
    let info_producto = [];
    let clienteNombre : any = this.FormPedidoExternoClientes.value.PedClienteNombre;

    this.sedesClientesService.srvObtenerListaPorNombreCliente(clienteNombre).subscribe(datos_sede =>{
      for (let sede = 0; sede < datos_sede.length; sede++) {
        if (datos_sede[sede].sedeCliente_Ciudad == this.FormPedidoExternoClientes.get('ciudad_sede')?.value) {
          this.estadosService.srvObtenerListaPorNombreEstado(estadoNombre).subscribe(datos_estado => {
            for (let index = 0; index < datos_estado.length; index++) {

              //Empezamos a llenar la informacion del pedido actualizado
              const camposPedido : any = {
                PedExt_Id : this.id_pedido,
                PedExt_FechaCreacion:  this.FormPedidoExternoClientes.get('PedFecha')?.value,
                PedExt_FechaEntrega: this.FormPedidoExternoClientes.get('PedFechaEnt')?.value,
                Empresa_Id: this.EmpresaVendedora,
                SedeCli_Id: datos_sede[sede].sedeCli_Id,
                Estado_Id: datos_estado[index].estado_Id,
                Usua_Id: datos_sede[sede].usua_Id,
                PedExt_Observacion: this.FormPedidoExternoClientes.get('PedObservacion')?.value,
                PedExt_PrecioTotal: this.valorTotal,
                PedExt_Archivo: 0
              }

              //Validamos que la tabla no este vacia, si está vacia entonces le enviamos un mensaje de confirmacion
              if(!this.ArrayProducto.length) Swal.fire('Debe cargar al menos un producto en la tabla.');
              //Validamos que la fecha de entrega no sea menor a la fecha en que se crea el pedido
              else if (camposPedido.PedExt_FechaEntrega <= camposPedido.PedExt_FechaCreacion) Swal.fire('La fecha de creación no puede ser menor o igual a la fecha de entrega.');
              //Si ninguna de las validaciones anteriores se cumple entonces empezamos con la actualizacion del pedido
              else {
                //Actualizamos el pedido
                this.pedidoproductoService.srvActualizarPedidosProductos(this.id_pedido, camposPedido).subscribe(datos_pedido_actualizado => {
                  //Recorremos la tabla para tomar la informacion que está almacenada ahí
                  for (let prod = 0; prod < this.ArrayProducto.length; prod++) {
                    idProducto.push(this.ArrayProducto[prod].Id);
                    productoArray.push(this.ArrayProducto);
                  }
                  //Validamos el estado del pedido (2: En proceso, 5: Finalizado, 6: Iniciado)
                  if (datos_estado[index].estado_Id == 2 || datos_estado[index].estado_Id == 5 || datos_estado[index].estado_Id == 6) {
                    //Empezamos a tomar la informacion del cliente para actualizarlo
                    const datosClienteActualizado : any = {
                      Cli_Id: datos_sede[sede].cli_Id,
                      TipoIdentificacion_Id : datos_sede[sede].tipoIdentificacion_Id,
                      Cli_Nombre: datos_sede[sede].cli_Nombre,
                      Cli_Telefono: datos_sede[sede].cli_Telefono,
                      Cli_Email: datos_sede[sede].cli_Email,
                      TPCli_Id: datos_sede[sede].tpCli_Id,
                      Usua_Id: datos_sede[sede].usua_Id,
                      Estado_Id : 1,
                    }
                    this.clientesService.srvActualizar(datos_sede[sede].cli_Id, datosClienteActualizado).subscribe(cliente_Actualizado => {});

                    //Luego de terminar con el cliente empezamos a actualizar el producto
                    for (const item of idProducto) {
                      this.productosServices.srvObtenerListaPorId(item).subscribe(datos_productos => {
                        info_producto.push(datos_productos);
                        for (let i = 0; i < info_producto.length; i++) {
                          const datosProducto : any = {
                            Prod_Id : item,
                            Prod_Nombre: info_producto[i].prod_Nombre,
                            Prod_Descripcion: info_producto[i].prod_Descripcion,
                            TpProd_Id: info_producto[i].tpProd_Id,
                            Prod_Peso_Bruto: info_producto[i].prod_Peso_Bruto,
                            Prod_Peso_Neto: info_producto[i].prod_Peso_Neto,
                            UndMedPeso: info_producto[i].undMedPeso,
                            Prod_Fuelle: info_producto[i].prod_Fuelle,
                            Prod_Ancho: info_producto[i].prod_Ancho,
                            Prod_Calibre: info_producto[i].prod_Calibre,
                            UndMedACF: info_producto[i].undMedACF,
                            Estado_Id: 10,
                            Prod_Largo: 0,
                            Pigmt_Id : info_producto[i].pigmt_Id,
                            Material_Id : info_producto[i].material_Id,
                          }
                          this.productosServices.srvActualizar(item, datosProducto).subscribe(datos_producto_actualizado => {}, error => {console.log(error);});
                        }

                        /*Luego se consulta la tabla de Clientes_Productos para saber si los productos que estan en el pedido
                        tiene una relacion con el cliente, sino es asi entonces se insertará una nueva relacion */
                        // this.ClientesProductosService.srvObtenerListaPorId(datos_sede[sede].cli_Id, item).subscribe(datos_clienteProductos => {}, error => {
                        //   const clienteProductos : any = {
                        //     Cli_Id: datos_sede[sede].cli_Id,
                        //     Prod_Id: item,
                        //   }
                        //   this.ClientesProductosService.srvGuardar(clienteProductos).subscribe(datos_clienteProductos => {});
                        // });

                        /*Finalmente se procede con la tabla PedidosExternos_Productos en la que se podrá actualizar, eliminar e insertar datos.
                        Para esto primero consultamos por el producto y el pedido, si estos existen los actualizará, sino existen los gusradará
                        Pero si un producto de la tabla es eliminado este deberá eliminarse de la base de datos */
                        for (let prod = 0; prod < this.ArrayProducto.length; prod++) {
                          idProducto.push(this.ArrayProducto[prod].Id);

                          // this.PedidoProductosService.srvObtenerListaPorId(this.ArrayProducto[prod].Id, this.id_pedido).subscribe(datos_productosPedidos => {

                          //   const datosProductosPedidos : any = {
                          //     Prod_Id: this.ArrayProducto[prod].Id,
                          //     PedExt_Id: this.id_pedido,
                          //     PedExtProd_Cantidad : this.ArrayProducto[prod].Cant,
                          //     UndMed_Id : this.ArrayProducto[prod].UndCant,
                          //     PedExtProd_PrecioUnitario : this.ArrayProducto[prod].PrecioUnd
                          //   }
                          //   this.PedidoProductosService.srvActualizar(this.ArrayProducto[prod].Id, this.id_pedido, datosProductosPedidos).subscribe(datos_productosPedidosActualizado => {});

                          // }, error => {
                          //   const datosProductosPedidos : any = {
                          //     Prod_Id: this.ArrayProducto[prod].Id,
                          //     PedExt_Id: this.id_pedido,
                          //     PedExtProd_Cantidad : this.ArrayProducto[prod].Cant,
                          //     UndMed_Id : this.ArrayProducto[prod].UndCant,
                          //     PedExtProd_PrecioUnitario : this.ArrayProducto[prod].PrecioUnd
                          //   }
                          //   this.PedidoProductosService.srvGuardar(datosProductosPedidos).subscribe(datos_productosPedidosActualizado => {});

                          // });
                        }
                      });
                    }

                  //Si el estado llega a ser (9: En pedido) solo se podrán agregar productos al pedido
                  } else if (datos_estado[index].estado_Id == 11){
                    for (let prod = 0; prod < this.ArrayProducto.length; prod++) {
                      idProducto.push(this.ArrayProducto[prod].Id);

                      // this.PedidoProductosService.srvObtenerListaPorId(this.ArrayProducto[prod].Id, this.id_pedido).subscribe(datos_productosPedidos => {

                      //   const datosProductosPedidos : any = {
                      //     Prod_Id: this.ArrayProducto[prod].Id,
                      //     PedExt_Id: this.id_pedido,
                      //     PedExtProd_Cantidad : this.ArrayProducto[prod].Cant,
                      //     UndMed_Id : this.ArrayProducto[prod].UndCant,
                      //     PedExtProd_PrecioUnitario : this.ArrayProducto[prod].PrecioUnd
                      //   }
                      //   this.PedidoProductosService.srvActualizar(this.ArrayProducto[prod].Id, this.id_pedido, datosProductosPedidos).subscribe(datos_productosPedidosActualizado => {});

                      // }, error => {
                      //   const datosProductosPedidos : any = {
                      //     Prod_Id: this.ArrayProducto[prod].Id,
                      //     PedExt_Id: this.id_pedido,
                      //     PedExtProd_Cantidad : this.ArrayProducto[prod].Cant,
                      //     UndMed_Id : this.ArrayProducto[prod].UndCant,
                      //     PedExtProd_PrecioUnitario : this.ArrayProducto[prod].PrecioUnd
                      //   }
                      //   this.PedidoProductosService.srvGuardar(datosProductosPedidos).subscribe(datos_productosPedidosActualizado => {});
                      // });
                    }
                  }
                  const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                      toast.addEventListener('mouseenter', Swal.stopTimer)
                      toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                  });
                  Toast.fire({
                    icon: 'success',
                    title: `¡El pedido ${this.id_pedido} ha sido actualizado!`
                  });
                  this.crearpdfPedidoActualizado(this.id_pedido);
                  setTimeout(() => {
                    this.LimpiarCampos();
                  }, 1000);
                });
              }
              break;
            }
          });
          break;
        } else continue;
      }
    });
  }

  //Funcion que se encarga de tomar el producto eliminado de la tabla en la vista y eliminarlo en la base de datos
  eliminarProductoPedido(item : number){
    // this.PedidoProductosService.srvObtenerListaPorId(item, this.id_pedido).subscribe(datos_productosPedidos => {
    //   this.PedidoProductosService.srvEliminar(item, this.id_pedido).subscribe(datos_productosPedidos_eliminado => {});
    // });
  }

  //Funcion que crea un pdf del pedido una vez es actualizado
  crearpdfPedidoActualizado(idPedido : number){
    let nombreCliente : any = this.FormPedidoExternoClientes.value.PedClienteNombre;
    this.sedesClientesService.srvObtenerListaPorNombreCliente(nombreCliente).subscribe(datos_sedeCliente => {
      for (let i = 0; i < datos_sedeCliente.length; i++) {
        if (datos_sedeCliente[i].sedeCliente_Ciudad == this.FormPedidoExternoClientes.get('ciudad_sede')?.value) {
          for (let j = 0; j < this.ArrayProducto.length; j++) {
            const pdfDefinicion : any = {
              info: {
                title: `${idPedido}`
              },
              pageSize: {
                width: 630,
                height: 760
              },
              content : [
                {
                  text: `Plasticaribe S.A.S ---- Orden de Pedidos de Productos`,
                  alignment: 'center',
                  style: 'titulo',
                },
                '\n \n',
                {
                  text: `Fecha de pedido: ${this.FormPedidoExternoClientes.value.PedFecha}`,
                  style: 'header',
                  alignment: 'right',
                },

                {
                  text: `Fecha de entrega: ${this.FormPedidoExternoClientes.value.PedFechaEnt} `,
                  style: 'header',
                  alignment: 'right',
                },
                {
                  text: `Vendedor: ${this.FormPedidoExternoClientes.value.PedUsuarioNombre}\n`,
                  alignment: 'right',
                  style: 'header',
                },
                {
                  text: `Estado del pedido: ${this.FormPedidoExternoClientes.value.PedEstadoId}\n \n`,
                  alignment: 'right',
                  style: 'header',
                },
                {
                  text: `\n Información detallada del cliente \n \n`,
                  alignment: 'center',
                  style: 'header'
                },
                {
                  style: 'tablaCliente',
                  table: {
                    widths: ['*', '*', '*'],
                    style: 'header',
                    body: [
                      [
                        `ID: ${datos_sedeCliente[i].cli_Id}`,
                        `Tipo de ID: ${datos_sedeCliente[i].tipoIdentificacion_Id}`,
                        `Tipo de Cliente: ${datos_sedeCliente[i].tpCli_Nombre}`
                      ],
                      [
                        `Nombre: ${datos_sedeCliente[i].cli_Nombre}`,
                        `Telefono: ${datos_sedeCliente[i].cli_Telefono}`,
                        `Ciudad: ${datos_sedeCliente[i].sedeCliente_Ciudad}`
                      ],
                      [
                        `Dirección: ${datos_sedeCliente[i].sedeCliente_Direccion}`,
                        `Codigo Postal: ${datos_sedeCliente[i].sedeCli_CodPostal}`,
                        `E-mail: ${datos_sedeCliente[i].cli_Email}`
                      ]
                    ]
                  },
                  layout: 'lightHorizontalLines',
                  fontSize: 9,
                },
                {
                  text: `\n \nObervación sobre el pedido: \n ${this.FormPedidoExternoClientes.value.PedObservacion}\n`,
                  style: 'header',
                },
                {
                  text: `\n Información detallada de producto(s) pedido(s) \n `,
                  alignment: 'center',
                  style: 'header'
                },

                this.table(this.ArrayProducto, ['Id', 'Nombre', 'Ancho', 'Fuelle', 'Cal', 'Largo', 'Und', 'Tipo', 'Material', 'Pigmento', 'Cant', 'UndCant', 'PrecioUnd', 'SubTotal']),

                {
                  text: `\n\nValor Total Pedido: $${this.formatonumeros(this.valorTotal)}`,
                  alignment: 'right',
                  style: 'header',
                },
                {
                  text: `Tipo de moneda: ${this.ArrayProducto[j].TpMoneda}`,
                  alignment: 'right',
                  style: 'header',
                }
              ],
              styles: {
                header: {
                  fontSize: 8,
                  bold: true
                },
                titulo: {
                  fontSize: 15,
                  bold: true
                }
              }
            }
            const pdf = pdfMake.createPdf(pdfDefinicion);
            pdf.open();
            break;
          }
          break;
        }
      }
    });
  }

  //
  CrearOT(item : any){
    this.ordenTrabajoService.srvObtenerListaNumeroPedido(item.pedExt_Id).subscribe(datos_ot => {
      if (datos_ot.length == 0) {
        this.modalOrdenTrabajo = true;
        this.CrearOrdenTrabajo.vistaPedidos = true;
        let FechaEntregaDatetime = item.pedExt_FechaEntrega;
        let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
        let fechaEntrega = FechaEntregaDatetime.substring(0, FechaEntregaNueva);
        let itemOt : any = {
          id : item.pedExt_Id,
          nombre : `${item.pedExt_Id} - ${item.cli_Nombre} - ${fechaEntrega}`,
          fecha : fechaEntrega,
        }
        // this.CrearOrdenTrabajo.consultarPedido(itemOt);
      } else if (datos_ot.length >= 1){
        let productosOT : any = [];

        for (let i = 0; i < datos_ot.length; i++) {
          productosOT.push(datos_ot[i].prod_Id);
        }

        this.PedidoProductosService.srvObtenerListaPorIdProductoPedido(item.pedExt_Id).subscribe(datos_productosPedidos => {
          let productos : any = [];
          for (let j = 0; j < datos_productosPedidos.length; j++) {
            if (!productosOT.includes(datos_productosPedidos[j].prod_Id)) {
              productos.push(datos_productosPedidos[j].prod_Id)
              this.modalOrdenTrabajo = true;
              this.CrearOrdenTrabajo.vistaPedidos = true;
              let FechaEntregaDatetime = item.pedExt_FechaEntrega;
              let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
              let fechaEntrega = FechaEntregaDatetime.substring(0, FechaEntregaNueva);
              let itemOt : any = {
                id : item.pedExt_Id,
                nombre : `${item.pedExt_Id} - ${item.cli_Nombre} - ${fechaEntrega}`,
                fecha : fechaEntrega,
              }
              // this.CrearOrdenTrabajo.consultarPedido(itemOt);
            } else continue;
          }
          if (productos.length == 0) Swal.fire(`El pedido ${item.pedExt_Id} ya tiene ordenes de trabajo`);
        });
      } else Swal.fire(`El pedido ${item.pedExt_Id} ya tiene ordenes de trabajo`);
    });
  }

  limpiarCamposAlCerrarModal() {
    this.modalOrdenTrabajo = false;
  }
}
;
