import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl} from '@angular/forms';
import Swal from 'sweetalert2';
import { OpedidoproductoService } from 'src/app/Servicios/opedidoproducto.service';
import { ProductoService } from 'src/app/Servicios/producto.service';
import { UsuarioService } from 'src/app/Servicios/usuario.service';
import { ClientesService } from 'src/app/Servicios/clientes.service';
import { SedeClienteService } from 'src/app/Servicios/sede-cliente.service';
import { UnidadMedidaService } from 'src/app/Servicios/unidad-medida.service';
import { TipoProductoService } from 'src/app/Servicios/tipo-producto.service'
import { TipoMonedaService } from 'src/app/Servicios/tipo-moneda.service';
import { EstadosService } from 'src/app/Servicios/estados.service';
import { TipoEstadosService } from 'src/app/Servicios/tipo-estados.service';
import { ExistenciasProductosService } from 'src/app/Servicios/existencias-productos.service';
import { EmpresaService } from 'src/app/Servicios/empresa.service';
import { PedidoProductosService } from 'src/app/Servicios/pedidoProductos.service'
import pdfMake from 'pdfmake/build/pdfmake';
import { RolesService } from 'src/app/Servicios/roles.service';
import { TipoClienteService } from 'src/app/Servicios/tipo-cliente.service';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { ClientesProductosService } from 'src/app/Servicios/ClientesProductos.service';
import { modelCliente } from 'src/app/Modelo/modelCliente';
import { MaterialProductoService } from 'src/app/Servicios/materialProducto.service';
import { PigmentoProductoService } from 'src/app/Servicios/pigmentoProducto.service';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-Pedido-Externo',
  templateUrl: './Pedido-Externo.component.html',
  styleUrls: ['./Pedido-Externo.component.css']
})

export class PedidoExternoComponent implements OnInit {

  serializedDate = new FormControl(new Date().toISOString());

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
  descuento : number = 0; //Variable que guardará el valor en porcentaje del descuento hecho al cliente
  valorMenosDescuento : number = 0; //Variable que tendrá el valor del de la venta menos el descuento
  iva : number = 0; //Variable que gusrdará la cantidad de iva sobre la venta
  valorMenosIva : number = 0; //Variable que tendrá el valor del de la venta menos el iva
  valorfinal : number = 0; //VAlor final menos em iva y el descuento
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
                                        private pigmentoServices : PigmentoProductoService,) {


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
      PedDescuento : ['', Validators.required],
      PedIva : ['', Validators.required],
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
      this.undMedidaComboBox();
      this.obtenerEmpresa();
      this.ObtenerUltimoPedido();
      this.ColumnasTabla();
      this.lecturaStorage();
      this.usuarioComboBox();
      this.LimpiarCampos();
      this.fecha();
    } else window.location.href = "./home";
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
      PedDescuento : 0,
      PedIva : 0,
    });
  }

  //Funcion que validar si cambia uno de los input se muestre la misma informacion en la parde abajo de la tabla
  ivaDescuento(){
    this.descuento = this.FormPedidoExternoClientes.value.PedDescuento;
    this.iva = this.FormPedidoExternoClientes.value.PedIva;
    this.valorMenosDescuento += (this.valorTotal * this.descuento) / 100;
    this.valorMenosIva += (this.valorTotal * this.iva) / 100;
    this.valorfinal += this.valorTotal - this.valorMenosDescuento + this.valorMenosIva;
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
    this.descuento = 0;
    this.valorMenosDescuento = 0;
    this.iva = 0;
    this.valorMenosIva = 0;
    this.valorfinal = 0;
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
    this.FormPedidoExternoClientes.setValue({
      PedSedeCli_Id: '',
      ciudad_sede: '',
      PedClienteNombre: '',
      PedUsuarioNombre: '',
      PedFecha: this.today,
      PedFechaEnt: '',
      PedEstadoId: '',
      PedObservacion: '',
      PedDescuento : 0,
      PedIva : 0,
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
            PedDescuento : this.FormPedidoExternoClientes.value.PedDescuento,
            PedIva : this.FormPedidoExternoClientes.value.PedIva,
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
            PedDescuento : this.FormPedidoExternoClientes.value.PedDescuento,
            PedIva : this.FormPedidoExternoClientes.value.PedIva,
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
        }, 100);
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
    let cantidad : number = this.FormPedidoExternoProductos.value.ProdCantidad;
    let subtotalProd : number = precioProducto * cantidad;
    let nombreProducto : any = this.FormPedidoExternoProductos.value.ProdNombre;

    this.valorTotal += subtotalProd;

    this.valorMenosDescuento = (this.valorTotal * this.descuento) / 100;
    this.valorMenosIva = (this.valorTotal * this.iva) / 100;
    this.valorfinal = this.valorTotal - this.valorMenosDescuento + this.valorMenosIva;

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
            Cant : this.formatonumeros(this.FormPedidoExternoProductos.get('ProdCantidad').value),
            Largo : this.FormPedidoExternoProductos.get('ProdLargo').value,
            UndCant : this.FormPedidoExternoProductos.get('ProdUnidadMedidaCant')?.value,
            PrecioUnd : this.formatonumeros(precioProducto),
            TpMoneda : this.FormPedidoExternoProductos.get('ProdTipoMoneda').value,
            Stock : this.formatonumeros(this.FormPedidoExternoProductos.get('ProdStock').value),
            Produ_Descripcion : this.FormPedidoExternoProductos.get('ProdDescripcion').value,
            SubTotal : this.formatonumeros(this.FormPedidoExternoProductos.value.ProdPrecioUnd * this.FormPedidoExternoProductos.value.ProdCantidad),
          }

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

    this.sedesClientesService.srvObtenerListaPorClienteSede(clienteNombre.cli_Nombre, ciudad, direccionSede).subscribe(datos_sedeCliente => {
      for (let i = 0; i < datos_sedeCliente.length; i++) {
        const camposPedido : any = {
          PedExt_FechaCreacion: this.FormPedidoExternoClientes.get('PedFecha')?.value,
          PedExt_FechaEntrega: this.FormPedidoExternoClientes.get('PedFecha')?.value,
          Empresa_Id: this.EmpresaVendedora,
          SedeCli_Id: datos_sedeCliente[i].sedeCli_Id,
          Usua_Id: datos_sedeCliente[i].usua_Id,
          Estado_Id: 11,
          PedExt_Observacion: this.FormPedidoExternoClientes.get('PedObservacion')?.value,
          PedExt_PrecioTotal: this.valorTotal,
          PedExt_Archivo: 0,
          PedExt_Descuento: this.FormPedidoExternoClientes.value.PedDescuento,
          PedExt_Iva: this.FormPedidoExternoClientes.value.PedIva,
          PedExt_PrecioTotalFinal : this.valorfinal,
        }

        if(!this.ArrayProducto.length) Swal.fire('Debe cargar al menos un producto en la tabla.');
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
                  this.limpiarTodosCampos();
                }, 1000);
              }
            });
          }, error => { console.log(error); });
        }
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
    this.SrvEmpresa.srvObtenerListaPorId(800188730).subscribe(datos_empresa => {
      let empresa = [];
      empresa.push(datos_empresa);
      for (const itemEmpresa of empresa) {
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
                        text: `Orden de Pedidos de Productos`,
                        alignment: 'right',
                        style: 'titulo',
                      },
                      '\n \n',
                      {
                        style: 'tablaEmpresa',
                        table: {
                          widths: [90, '*', 90, '*'],
                          style: 'header',
                          body: [
                            [
                              {
                                border: [false, false, false, false],
                                text: `Nombre Empresa`
                              },
                              {
                                border: [false, false, false, true],
                                text: `${itemEmpresa.empresa_Nombre}`
                              },
                              {
                                border: [false, false, false, false],
                                text: `Fecha`
                              },
                              {
                                border: [false, false, false, true],
                                text: `${this.FormPedidoExternoClientes.value.PedFecha}`
                              },
                            ],
                            [
                              {
                                border: [false, false, false, false],
                                text: `Dirección`
                              },
                              {
                                border: [false, false, false, true],
                                text: `${itemEmpresa.empresa_Direccion}`
                              },
                              {
                                border: [false, false, false, false],
                                text: `No. de Pedido`
                              },
                              {
                                border: [false, false, false, true],
                                text: `${item.pedExt_Id}`
                              },
                            ],
                            [
                              {
                                border: [false, false, false, false],
                                text: `Ciudad`
                              },
                              {
                                border: [false, false, false, true],
                                text: `${itemEmpresa.empresa_Ciudad}`
                              },
                              {
                                border: [false, false, false, false],
                                text: ``
                              },
                              {
                                border: [false, false, false, false],
                                text: ``
                              },
                            ]
                          ]
                        },
                        layout: {
                          defaultBorder: false,
                        },
                        fontSize: 9,
                      },
                      '\n \n',
                      {
                        text: `Vendedor: ${this.FormPedidoExternoClientes.value.PedUsuarioNombre}\n`,
                        alignment: 'left',
                        style: 'header',
                      },
                      '\n \n',
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
                        text: `\n\n Información detallada de producto(s) pedido(s) \n `,
                        alignment: 'center',
                        style: 'header'
                      },

                      this.table(this.ArrayProducto, ['Id', 'Nombre', 'Cant', 'UndCant', 'PrecioUnd', 'SubTotal']),

                      {
                        style: 'tablaTotales',
                        table: {
                          widths: [256, '*', 98],
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
                                text: `${this.formatonumeros(this.valorTotal)}`
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
                                text: `${this.descuento}`
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
                                text: `${this.formatonumeros(this.valorTotal - this.valorMenosDescuento)}`
                              },
                            ],
                            [
                              '',
                              {
                                border: [true, false, true, true],
                                text: `IVA`
                              },
                              {
                                border: [false, false, true, true],
                                text: `${this.formatonumeros(this.iva)}`
                              },
                            ],
                            [
                              '',
                              {
                                border: [true, false, true, true],
                                text: `SUBTOTAL MENOS IVA`
                              },
                              {
                                border: [false, false, true, true],
                                text: `${this.formatonumeros(this.valorTotal + this.valorMenosIva)}`
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
                                text: `${this.formatonumeros(this.valorfinal)}`
                              },
                            ]
                          ]
                        },
                        layout: {
                          defaultBorder: false,
                        },
                        fontSize: 8,
                      },
                      {
                        text: `\n \nObervación sobre el pedido: \n ${this.FormPedidoExternoClientes.value.PedObservacion}\n`,
                        style: 'header',
                      }
                    ],
                    styles: {
                      header: {
                        fontSize: 10,
                        bold: true
                      },
                      titulo: {
                        fontSize: 20,
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
          widths: [50, 197, 50, 50, 50, 98],
          body: this.buildTableBody(data, columns),
        },
        fontSize: 8,
        layout: {
          fillColor: function (rowIndex, node, columnIndex) {
            return (rowIndex == 0) ? '#CCCCCC' : null;
          }
        }
    };
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

    this.PedidoProductosService.srvObtenerListaPorIdProducto(formulario.Id, formulario.ProdUnidadMedidaCant).subscribe(datos_productoPedido => {
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
              ProdStock : formulario.Stock,
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
                  Estado_Id : 8
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
                  Estado_Id : 1
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

}
