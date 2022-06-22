import { Component, Inject, OnInit } from '@angular/core';
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
import { CookieService } from 'ngx-cookie-service';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { RolesService } from 'src/app/Servicios/roles.service';
import { TipoClienteService } from 'src/app/Servicios/tipo-cliente.service';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { ClientesProductosService } from 'src/app/Servicios/ClientesProductos.service';
import { ThisReceiver } from '@angular/compiler';
import { modelCliente } from 'src/app/Modelo/modelCliente';
import moment from 'moment';
import * as XLSX from 'xlsx';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app.opedidoproducto.component',
  templateUrl: './opedidoproducto.component.html',
  styleUrls: ['./opedidoproducto.component.css']
})

export class OpedidoproductoComponent implements OnInit {

  serializedDate = new FormControl(new Date().toISOString());

  public FormPedidoExternoClientes !: FormGroup; //Formulario de pedidos
  public FormPedidoExternoProductos!: FormGroup;
  public FormSedesClientes !: FormGroup;
  public FormConsultaPedidoExterno !: FormGroup;
  public page : number;
  titulo = 'Generar PDF con Angular JS 5';
  imagen1 = 'assets/img/tc.jpg';
  AccionBoton = "Agregar";
  Ide : number | undefined;
  id_pedido : number;

  //Llamar modales, inicializados como falsos para que no se carguen al ingresar a la pagina.
  public ModalCrearProductos: boolean = false;
  public ModalCrearCliente: boolean = false;
  public ModalSedesClientes: boolean = false;
  public TituloSedes = "";
  ID: number;
  Nombre : string;
  Numero : number;

  // VARIABLES PARA PASAR A LOS COMBOBOX
  cliente:ClientesService[]=[];
  nombreCliente = [];
  clienteDatos = [];
  sedeCliente:SedeClienteService[]=[];
  sedeClientesDatos = [];
  ciudad :SedeClienteService[]=[];
  usuarioVendedor=[];
  usuarios=[];
  estado=[];
  tipoEstado=[];
  producto=[];
  productoInfo=[];
  tipoProducto=[];
  tipoProductoConsultado=[];
  undMed:UnidadMedidaService[]=[];
  presentacion = [];
  tipoMoneda:TipoMonedaService[]=[];
  usuarioVende=[] //Nuevo
  Registro = [];
  titulosTabla = [];
  existenciasProductos=[];
  empresa=[];
  pedidosProductos = [];
  pdfPedidoProducto = [];
  pedidoID: OpedidoproductoService[] = [];
  pedidoFechaPedido: OpedidoproductoService[] = [];
  pedidoFechaEntrega: OpedidoproductoService[] = [];
  pedidoCliente: OpedidoproductoService[] = [];
  pedidoEstado: OpedidoproductoService[] = [];
  pedidoObservaion: OpedidoproductoService[] = [];
  pedidoPrecioTotal: OpedidoproductoService[] = [];
  pedidoArchivo: OpedidoproductoService[] = [];
  contadorPedidosExternos : number;
  ArrayProducto : any[] =[];
  ArrayProductoNuevo : any =  {};
  productosPedidos = [];

/* Vaiables para rescatar los ID de estado, sedes, empresa, valorTotal */
  valorTotal : number = 0;
  EmpresaVendedora=[];
  EstadoDocumentos= [];
  EstadoDeDocumentos : any;
  SedeSeleccionada: any;
  IDSedeSeleccionada : any = 0;
  UsuarioSeleccionado : any = 0;
  pedidosID = [];
  datosPDF : any;
  pages: number = 1;
  dataset: any[] = ['1','2','3','4','5','6','7','8','9','10'];
  storage_Id : number;
  storage_Nombre : any;
  storage_Rol : any;
  ValidarRol : number;

  //variable para almacenar el id del cliente que esta seleccionado
  clienteId : number;
  fechaCreacionCortada = [];
  fechaEntregaCortada = [];
  fechaCreacion : any;
  fechaEntrega : any;
  nombreProducto : string;
  productoEliminado : number;

  ultimoPrecio : number = 0;
  Productospedidos : any;
  today : any = new Date();
  enPedido : string = 'no';

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
                                      private ClientesProductosService : ClientesProductosService) {

    this.FormPedidoExternoClientes = this.frmBuilderPedExterno.group({
      //Instanciar campos que vienen del formulario
      //Pedidos
      PedSedeCli_Id: new FormControl(),
      ciudad_sede: new FormControl(),
      PedClienteNombre: new FormControl(),
      PedUsuarioNombre: new FormControl(),
      PedFecha: new FormControl(),
      PedFechaEnt: new FormControl(),
      PedEstadoId: new FormControl(),
      PedObservacion: new FormControl(),
    });

    this.FormPedidoExternoProductos = this.frmBuilderPedExterno.group({
      //Productos
      ProdId: new FormControl(),
      ProdNombre: new FormControl(),
      ProdAncho: new FormControl(),
      ProdFuelle: new FormControl(),
      ProdCalibre: new FormControl(),
      ProdLargo: new FormControl(),
      ProdUnidadMedidaACF: new FormControl(),
      ProdTipo: new FormControl(),
      ProdCantidad: new FormControl(),
      ProdUnidadMedidaCant: new FormControl(),
      ProdPrecioUnd: new FormControl(),
      ProdUltFacturacion : new FormControl(),
      ProdTipoMoneda: new FormControl(),
      ProdStock: new FormControl(),
      ProdDescripcion: new FormControl(),
    });

    this.FormConsultaPedidoExterno = this.frmBuilderPedExterno.group({
      PedExtIdConsulta: new FormControl(),
      PedExtFechaConsulta: new FormControl(),
      PedExtFechaEntregaConsulta: new FormControl(),
      PedExtEstadoConsulta: new FormControl(),
      PedExtUsuarioConsulta: new FormControl(),
      PedExtClienteConsulta: new FormControl(),
      PedExtIdClienteConsulta : new FormControl(),
    });
  }

  //Cargar al iniciar.
  ngOnInit(): void {
    this.initForms();
    this.clientesComboBox();
    this.estadoComboBox();
    this.undMedidaComboBox();
    this.obtenerEmpresa();
    this.ObtenerUltimoPedido();
    this.tipoProductoComboBox();
    this.tipoMonedaComboBox();
    this.ColumnasTabla();
    this.lecturaStorage();
    this.usuarioComboBox();
    this.LimpiarCampos();
    this.inactividad();
    this.limpiarCamposConsulta();
    this.fecha();
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

  initForms() {
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
  }

  //Funcio para verificar la inactividad de un usuario, cunado pasa mas de 30 minutos sin actividad se cierra la sesion
  inactividad(){
    let registrarInactividad = function () {
      let t;
      window.onload = reiniciarTiempo;
      // Eventos del DOM
      document.onmousemove = reiniciarTiempo;
      document.onkeypress = reiniciarTiempo;
      document.onload = reiniciarTiempo;
      document.onmousemove = reiniciarTiempo;
      document.onmousedown = reiniciarTiempo; // aplica para una pantalla touch
      document.ontouchstart = reiniciarTiempo;
      document.onclick = reiniciarTiempo;     // aplica para un clic del touchpad
      document.onscroll = reiniciarTiempo;    // navegando con flechas del teclado
      document.onkeypress = reiniciarTiempo;

      function tiempoExcedido() {
        window.location.href = "./";
      }

      function reiniciarTiempo() {
          clearTimeout(t);
          t = setTimeout(tiempoExcedido, 1800000);
          // 1 minuto son 60000 millisegundos
          // 30 minutos son 1800000 milisegundos
      }
    };
    registrarInactividad();
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
      PedSedeCli_Id: new FormControl(),
      ciudad_sede: new FormControl(),
      PedClienteNombre: new FormControl(),
      PedUsuarioNombre: new FormControl(),
      PedFecha: this.today,
      PedFechaEnt: new FormControl(),
      PedEstadoId: new FormControl(),
      PedObservacion: null,
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
    this.FormPedidoExternoProductos.reset();
    this.ArrayProducto = [];
    this.valorTotal = 0;
  }

  // Funcion para limpiar los campos de el apartado de productos
  LimpiarCamposProductos(){
    this.FormPedidoExternoProductos.reset();
  }

  /* EMPIEZA A HACE LAS RESPECTIVAS VALIDACIONES PARA MOSTRAR DATOS EN LOS COMBOBOX DESDE QUE ARRANCA LA PAGINA */
  clientesComboBox() {
    this.usuarioService.srvObtenerListaPorId(this.storage.get('Id')).subscribe(datos_usuarios => {
      this.clientesService.srvObtenerLista().subscribe(datos_clientes => {
        for (let index = 0; index < datos_clientes.length; index++) {
          if (datos_clientes[index].estado_Id == 1) {
            if (datos_usuarios.rolUsu_Id == 2) {
              if (datos_clientes[index].usua_Id == datos_usuarios.usua_Id) {
                this.cliente.push(datos_clientes[index].cli_Nombre);
                this.clienteDatos.push(datos_clientes[index]);
                continue;
              }
            }else {
              this.cliente.push(datos_clientes[index].cli_Nombre);
              this.clienteDatos.push(datos_clientes[index]);
            }
            this.cliente.sort();
          }
        }
      });
    });
  }

  //Funcion para llenar las ciudades del cliente en donde tiene sedes
  ciudadClienteComboBox(){
    this.LimpiarCamposProductos();
    this.ciudad = [];
    this.sedeCliente=[];
    this.usuarioVende=[];
    let clienteNombreBD: string = this.FormPedidoExternoClientes.value.PedClienteNombre;
    this.clientesService.srvObtenerLista().subscribe(datos_cliente=>{
      for (let index = 0; index < datos_cliente.length; index++) {
        this.ciudad = [];
        if (datos_cliente[index].cli_Nombre == clienteNombreBD){
          this.sedesClientesService.srvObtenerLista().subscribe(datos_sedesClientes => {
            // Llena los datos de las sedes de dependiendo del cliente
            for (let i = 0; i < datos_sedesClientes.length; i++) {
              if (datos_cliente[index].cli_Id == datos_sedesClientes[i].cli_Id){
                this.ciudad.push(datos_sedesClientes[i].sedeCliente_Ciudad);
              }
            }

            if (this.ciudad.length <= 1 ) {
              for (const ciudad of this.ciudad) {
                this.FormPedidoExternoClientes.setValue({
                  PedClienteNombre: this.FormPedidoExternoClientes.value.PedClienteNombre,
                  PedSedeCli_Id: this.FormPedidoExternoClientes.value.PedSedeCli_Id,
                  ciudad_sede: ciudad,
                  PedUsuarioNombre: this.FormPedidoExternoClientes.value.PedUsuarioNombre,
                  PedFecha: this.FormPedidoExternoClientes.value.PedFecha,
                  PedFechaEnt: this.FormPedidoExternoClientes.value.PedFechaEnt,
                  PedEstadoId: this.FormPedidoExternoClientes.value.PedEstadoId,
                  PedObservacion: this.FormPedidoExternoClientes.value.PedObservacion,
                });
                this.sedesClientesComboBox();
              }
            }
          });
        }
      }
    });
  }

  // Funcion para llenar el comboBox de sedes y usuarios dependiendo del cliente seleccionado
  sedesClientesComboBox(){
    //LLENA LA SEDE DEL CLIENTE DEPENDIENDO DEL CLIENTE
    let clienteNombreBD: string = this.FormPedidoExternoClientes.value.PedClienteNombre;
    this.clientesService.srvObtenerLista().subscribe(datos_cliente=>{
      for (let index = 0; index < datos_cliente.length; index++) {
        if (datos_cliente[index].cli_Nombre == clienteNombreBD){
          this.sedesClientesService.srvObtenerLista().subscribe(datos_sedesClientes => {
            this.sedeCliente=[];
            // Llena los datos de las sedes de dependiendo del cliente
            for (let i = 0; i < datos_sedesClientes.length; i++) {
              if (datos_cliente[index].cli_Id == datos_sedesClientes[i].cli_Id){
                if (datos_sedesClientes[i].sedeCliente_Ciudad == this.FormPedidoExternoClientes.value.ciudad_sede){
                  this.sedeCliente.push(datos_sedesClientes[i].sedeCliente_Direccion);
                }
              }
            }

            //Llena datos de usuarios segun cliente seleccionado.
            this.usuarioService.srvObtenerListaUsuario().subscribe(dataUsuario => {
              this.usuarioVende=[];
              for (let inx = 0; inx < dataUsuario.length; inx++) {
                if(datos_cliente[index].usua_Id == dataUsuario[inx].usua_Id) {
                  this.usuarioVende.push(dataUsuario[inx].usua_Nombre);
                  break;
                } else this.usuarioVende=[];
              }
              if (this.sedeCliente.length <= 1) {
                for (const sede of this.sedeCliente) {
                  for (const vendedor of this.usuarioVende) {
                    this.FormPedidoExternoClientes.setValue({
                      PedClienteNombre: this.FormPedidoExternoClientes.value.PedClienteNombre,
                      PedSedeCli_Id: sede,
                      ciudad_sede: this.FormPedidoExternoClientes.value.ciudad_sede,
                      PedUsuarioNombre: vendedor,
                      PedFecha: this.FormPedidoExternoClientes.value.PedFecha,
                      PedFechaEnt: this.FormPedidoExternoClientes.value.PedFechaEnt,
                      PedEstadoId: this.FormPedidoExternoClientes.value.PedEstadoId,
                      PedObservacion: this.FormPedidoExternoClientes.value.PedObservacion,
                    });
                  }
                }
              }
            });
          });
        }
      }
    });
  }

  usuarioComboBox(){
    this.usuarioService.srvObtenerListaPorId(this.storage.get('Id')).subscribe(datos_usuarios => {
      if (datos_usuarios.rolUsu_Id == 2) {
        this.usuarios.push(datos_usuarios.usua_Nombre);
        this.usuarios.sort();
      }else {
        this.usuarioService.srvObtenerListaUsuario().subscribe(datos_usuarios => {
          for (let index = 0; index < datos_usuarios.length; index++) {
            if (datos_usuarios[index].rolUsu_Id == 2) {
              this.usuarios.push(datos_usuarios[index].usua_Nombre);
              this.usuarios.sort();
            }
          }
        });
      }
    });
  }

  // Funcion para llenar el comboBox de estados
  estadoComboBox(){
    // FORMA DE HACER QUE SOLO SE RETORNEN LOS ESTADOS CON EL TIPO DE ESTADO "1", QUE ES EL EXCLUSIOVO PARA DOCUMENTOS
    this.usuarioService.srvObtenerListaPorId(this.storage.get('Id')).subscribe(datos_usuarios => {
      this.tipoEstadoService.srvObtenerListaPorId(1).subscribe(datos_tiposEstados => {
        this.estadosService.srvObtenerListaEstados().subscribe(datos_estados=>{
          for (let index = 0; index < datos_estados.length; index++) {
            if (datos_tiposEstados.tpEstado_Id == datos_estados[index].tpEstado_Id) {
              if (datos_usuarios.rolUsu_Id == 2){
                if (datos_estados[index].estado_Id == 11) {
                  this.estado.push(datos_estados[index].estado_Nombre);
                  break;
                }
              } else if (datos_usuarios.rolUsu_Id == 1){
                this.estado.push(datos_estados[index].estado_Nombre);
              }
            }
          }
          this.estado.sort();
        }, error =>{ console.log("error"); });
      });
    });

  }

  // Funcion para cargar los productos de un solo cliente
  productoCliente(){
    this.producto = [];
    let nombre_Cliente : string = this.FormPedidoExternoClientes.value.PedClienteNombre;
    let id_cliente : number;
    this.clientesService.srvObtenerLista().subscribe(datos_clientes => {
      for (let i = 0; i < datos_clientes.length; i++) {
        if (datos_clientes[i].cli_Nombre == nombre_Cliente) id_cliente = datos_clientes[i].cli_Id;
      }
      this.ClientesProductosService.srvObtenerLista().subscribe(datos_clientesProductos => {
        for (let index = 0; index < datos_clientesProductos.length; index++) {
          if (datos_clientesProductos[index].cli_Id == id_cliente) {
            this.productosServices.srvObtenerListaPorId(datos_clientesProductos[index].prod_Id).subscribe(datos_productos => {
              this.producto.push(datos_productos);
              this.producto.sort((a, b) => a.prod_Nombre.localeCompare(b.prod_Nombre));
            });
          }
        }
      });
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
    let idProducto : number = this.FormPedidoExternoProductos.value.ProdId;
    this.productoInfo = [];
    this.existenciasProductos = [];
    this.tipoProducto = [];
    this.presentacion = [];
    this.tipoProductoConsultado = [];
    this.Productospedidos = [];
    let pedidosID = [];
    this.ultimoPrecio = 0;

    this.productosServices.srvObtenerListaPorId(idProducto).subscribe(datos_productos => {
      this.producto.push(datos_productos);
      this.productoInfo.push(datos_productos);
      for (let producto = 0; producto < this.productoInfo.length; producto++) {
        this.tiposProductosService.srvObtenerListaPorId(this.productoInfo[producto].tpProd_Id).subscribe(datos_tipoProducto => {
          this.existenciasProductosServices.srvObtenerLista().subscribe(datos_existencias => {
            for (let index = 0; index < datos_existencias.length; index++) {
              if (datos_existencias[index].prod_Id == this.productoInfo[producto].prod_Id) {
                this.PedidoProductosService.srvObtenerLista().subscribe(datos_prodPedidos => {
                  for (let ped = 0; ped < datos_prodPedidos.length; ped++) {
                    if (datos_prodPedidos[ped].prod_Id == idProducto) {
                      pedidosID.push(datos_prodPedidos[ped].pedExt_Id);
                    }
                  }
                  let ultimoId = Math.max.apply(null, pedidosID);

                  if (ultimoId == -Infinity) {
                    this.existenciasProductos = [];
                    this.existenciasProductos.push(datos_existencias[index]);
                    this.tipoProductoConsultado.push(datos_tipoProducto.tpProd_Nombre);
                    this.tipoProductoComboBox();
                    this.presentacion.push(datos_existencias[index].undMed_Id);
                    this.informacionProductoBuscado();
                  } else {
                    this.PedidoProductosService.srvObtenerListaPorId(idProducto, ultimoId).subscribe(datos_prodPed => {
                      this.Productospedidos.push(datos_prodPed);

                      for (const precio of this.Productospedidos) {
                        this.ultimoPrecio = precio.pedExtProd_PrecioUnitario;
                      }
                      this.existenciasProductos = [];
                      this.existenciasProductos.push(datos_existencias[index]);
                      this.tipoProductoConsultado.push(datos_tipoProducto.tpProd_Nombre);
                      this.tipoProductoComboBox();
                      this.presentacion.push(datos_existencias[index].undMed_Id);
                      this.informacionProductoBuscado();
                    });
                  }
                });
              }
            }
          });
        });
      }
    }, error => { Swal.fire(`No se encontró con el ID ${idProducto}`)});
  }

  //Funcion encargada de llenar los campos de producto con la informacion del producto que se buscó con anterioridad
  informacionProductoBuscado(){
    for (const producto of this.productoInfo) {
      for (const tipoProdu of this.tipoProductoConsultado) {
        for (const e of this.existenciasProductos) {
          this.nombreProducto = producto.prod_Nombre;
          this.FormPedidoExternoProductos.setValue({
            ProdId: producto.prod_Id,
            ProdNombre: this.FormPedidoExternoProductos.value.ProdNombre,
            ProdAncho: producto.prod_Ancho,
            ProdFuelle: producto.prod_Fuelle,
            ProdCalibre: producto.prod_Calibre,
            ProdLargo: producto.prod_Largo,
            ProdUnidadMedidaACF: producto.undMedACF,
            ProdTipo: tipoProdu,
            ProdCantidad: this.FormPedidoExternoProductos.value.ProdCantidad,
            ProdUnidadMedidaCant: e.undMed_Id,
            ProdPrecioUnd: e.exProd_PrecioVenta,
            ProdUltFacturacion: this.ultimoPrecio,
            ProdTipoMoneda: e.tpMoneda_Id,
            ProdStock: e.exProd_Cantidad,
            ProdDescripcion: producto.prod_Descripcion,
          });
        }
      }
    }
  }

  // Funcion para llenar los datos de los productos en cada uno de los campos
  llenadoProducto(){
    this.productoInfo = [];
    this.existenciasProductos = [];
    this.tipoProducto = [];
    this.presentacion = [];
    this.tipoProductoConsultado = [];
    this.Productospedidos = [];
    let pedidosID = [];
    this.ultimoPrecio = 0;

    let nombreProducto : string = this.FormPedidoExternoProductos.value.ProdNombre;
    for (const item of this.producto) {
      if (item.prod_Id == nombreProducto) {
        this.productosServices.srvObtenerListaPorId(item.prod_Id).subscribe(datos_productos => {
          this.productoInfo.push(datos_productos);
          for (let producto = 0; producto < this.productoInfo.length; producto++) {
            this.tiposProductosService.srvObtenerListaPorId(this.productoInfo[producto].tpProd_Id).subscribe(datos_tipoProducto => {
              this.existenciasProductosServices.srvObtenerLista().subscribe(datos_existencias => {
                for (let index = 0; index < datos_existencias.length; index++) {
                  if (datos_existencias[index].prod_Id == this.productoInfo[producto].prod_Id) {
                    this.PedidoProductosService.srvObtenerLista().subscribe(datos_prodPedidos => {
                      for (let ped = 0; ped < datos_prodPedidos.length; ped++) {
                        if (datos_prodPedidos[ped].prod_Id == item.prod_Id) {
                          pedidosID.push(datos_prodPedidos[ped].pedExt_Id);
                        }
                      }
                      let ultimoId = Math.max.apply(null, pedidosID);

                      if (ultimoId == -Infinity) {
                        this.existenciasProductos = [];
                        this.existenciasProductos.push(datos_existencias[index]);
                        this.tipoProductoConsultado.push(datos_tipoProducto.tpProd_Nombre);
                        this.tipoProductoComboBox();
                        this.presentacion.push(datos_existencias[index].undMed_Id);
                        this.informacionProductoBuscado();
                      } else {
                        this.PedidoProductosService.srvObtenerListaPorId(item.prod_Id, ultimoId).subscribe(datos_prodPed => {
                          this.Productospedidos.push(datos_prodPed);

                          for (const precio of this.Productospedidos) {
                            this.ultimoPrecio = precio.pedExtProd_PrecioUnitario;
                          }
                          this.existenciasProductos = [];
                          this.existenciasProductos.push(datos_existencias[index]);
                          this.tipoProductoConsultado.push(datos_tipoProducto.tpProd_Nombre);
                          this.tipoProductoComboBox();
                          this.presentacion.push(datos_existencias[index].undMed_Id);
                          this.informacionProductoBuscado();
                        });
                      }
                    });
                  }
                }
              });
            });
          }
        });
      }
    }
  }

  //Funcion para llenar el formulario con la informacion del producto
  informacionProducto(){
    for (const producto of this.productoInfo) {
      for (const tipoProdu of this.tipoProductoConsultado) {
        for (const e of this.existenciasProductos) {
          this.nombreProducto = producto.prod_Nombre;
          this.FormPedidoExternoProductos.setValue({
            ProdId: producto.prod_Id,
            ProdNombre: this.FormPedidoExternoProductos.value.ProdNombr,
            ProdAncho: producto.prod_Ancho,
            ProdFuelle: producto.prod_Fuelle,
            ProdCalibre: producto.prod_Calibre,
            ProdLargo: producto.prod_Largo,
            ProdUnidadMedidaACF: producto.undMedACF,
            ProdTipo: tipoProdu,
            ProdCantidad: this.FormPedidoExternoProductos.value.ProdCantidad,
            ProdUnidadMedidaCant: e.undMed_Id,
            ProdPrecioUnd: e.exProd_PrecioVenta,
            ProdUltFacturacion: this.ultimoPrecio,
            ProdTipoMoneda: e.tpMoneda_Id,
            ProdStock: e.exProd_Cantidad,
            ProdDescripcion: producto.prod_Descripcion,
          });
        }
      }
    }
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
    this.fechaCreacionCortada = [];
    this.fechaEntregaCortada = [];
    let fechaPedido : any = this.FormConsultaPedidoExterno.value.PedExtFechaConsulta;
    let fechaEntrega : any = this.FormConsultaPedidoExterno.value.PedExtFechaEntregaConsulta;
    let estadoNombre : string = this.FormConsultaPedidoExterno.value.PedExtEstadoConsulta;
    let idPedido : number = this.FormConsultaPedidoExterno.value.PedExtIdConsulta;
    let nombreVendedor : string = this.FormConsultaPedidoExterno.value.PedExtUsuarioConsulta;
    let idCliente : number = this.FormConsultaPedidoExterno.value.PedExtIdClienteConsulta;
    let nombreCliente : string = this.FormConsultaPedidoExterno.value.PedExtClienteConsulta;

    //Buscará el o los pedidos que tengan los filtros que se le están pasando, es decir, todos (no es necesario que esten llenos los campos idCliente y nombreCliente, con uno vale)
    if (fechaPedido != null && fechaEntrega != null && estadoNombre != null && nombreVendedor != null && (idCliente != null || nombreCliente != null)) {
      this.pedidosProductos = [];
      let idUsuario : number;
      let idEstado : number;
      let fechaCreacionFinal : any;
      let fechaEntregaFinal : any;
      this.estadosService.srvObtenerListaEstados().subscribe(datos_estado => {
        for (let index = 0; index < datos_estado.length; index++) {
          if (datos_estado[index].estado_Nombre == estadoNombre) {
            idEstado = datos_estado[index].estado_Id;
            this.usuarioService.srvObtenerListaUsuario().subscribe(datos_usuarios => {
              for (let usua = 0; usua < datos_usuarios.length; usua++) {
                if (datos_usuarios[usua].usua_Nombre == nombreVendedor) {
                  idUsuario = datos_usuarios[usua].usua_Id;

                  if (idCliente != null) {
                    this.sedesClientesService.srvObtenerLista().subscribe(datos_sedes => {
                      for (let sede = 0; sede < datos_sedes.length; sede++) {
                        if (datos_sedes[sede].cli_Id == idCliente) {
                          this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidos => {
                            for (let ped = 0; ped < datos_pedidos.length; ped++) {
                              let FechaCreacionDatetime = datos_pedidos[ped].pedExt_FechaCreacion;
                              let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T");
                              fechaCreacionFinal = FechaCreacionDatetime.substring(0, FechaCreacionNueva);

                              let FechaEntregaDatetime = datos_pedidos[ped].pedExt_FechaEntrega;
                              let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
                              fechaEntregaFinal = FechaEntregaDatetime.substring(0, FechaEntregaNueva);

                              if (datos_pedidos[ped].sedeCli_Id == datos_sedes[sede].sedeCli_Id &&
                                moment(fechaCreacionFinal).isBetween(fechaPedido, fechaEntrega) &&
                                moment(fechaEntregaFinal).isBetween(fechaPedido, fechaEntrega) &&
                                datos_pedidos[ped].estado_Id == idEstado &&
                                datos_pedidos[ped].usua_Id == idUsuario) {
                                this.llenadoPedidos(datos_pedidos[ped]);
                              }
                            }
                          });
                        }
                      }
                    });
                  } else if (nombreCliente != null) {
                    this.clientesService.srvObtenerLista().subscribe(datos_cliente => {
                      for (let cli = 0; cli < datos_cliente.length; cli++) {
                        if (datos_cliente[cli].cli_Nombre == nombreCliente) {
                          idCliente = datos_cliente[cli].cli_Id;
                          this.sedesClientesService.srvObtenerLista().subscribe(datos_sedes => {
                            for (let i = 0; i < datos_sedes.length; i++) {
                              if (datos_sedes[i].cli_Id == idCliente) {
                                this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidos => {
                                  for (let ped = 0; ped < datos_pedidos.length; ped++) {
                                    let FechaCreacionDatetime = datos_pedidos[ped].pedExt_FechaCreacion;
                                    let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T");
                                    fechaCreacionFinal = FechaCreacionDatetime.substring(0, FechaCreacionNueva);

                                    let FechaEntregaDatetime = datos_pedidos[ped].pedExt_FechaEntrega;
                                    let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
                                    fechaEntregaFinal = FechaEntregaDatetime.substring(0, FechaEntregaNueva);

                                    if (moment(fechaCreacionFinal).isBetween(fechaPedido, fechaEntrega) &&
                                      moment(fechaEntregaFinal).isBetween(fechaPedido, fechaEntrega) &&
                                      datos_pedidos[ped].estado_Id == idEstado &&
                                      datos_pedidos[ped].usua_Id == idUsuario &&
                                      datos_pedidos[ped].sedeCli_Id == datos_sedes[i].sedeCli_Id) {
                                      this.llenadoPedidos(datos_pedidos[ped]);
                                    }
                                  }
                                });
                              }
                            }
                          });
                        }
                      }
                    });
                  }
                }
              }
            });
          }
        }
      });
    }
    //Buscará el o los pedidos que tengan los filtros que se le están pasando, es decir, todos excepto el vendedor (no es necesario que esten llenos los campos idCliente y nombreCliente, con uno vale)
    else if (fechaPedido != null && fechaEntrega != null && estadoNombre != null && (idCliente != null || nombreCliente != null)) {
      this.pedidosProductos = [];
      let idUsuario : number;
      let idEstado : number;
      let fechaCreacionFinal : any;
      let fechaEntregaFinal : any;
      this.estadosService.srvObtenerListaEstados().subscribe(datos_estado => {
        for (let index = 0; index < datos_estado.length; index++) {
          if (datos_estado[index].estado_Nombre == estadoNombre) {
            idEstado = datos_estado[index].estado_Id;
            if (idCliente != null) {
              this.sedesClientesService.srvObtenerLista().subscribe(datos_sedes => {
                for (let sede = 0; sede < datos_sedes.length; sede++) {
                  if (datos_sedes[sede].cli_Id == idCliente) {
                    this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidos => {
                      for (let ped = 0; ped < datos_pedidos.length; ped++) {
                        let FechaCreacionDatetime = datos_pedidos[ped].pedExt_FechaCreacion;
                        let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T");
                        fechaCreacionFinal = FechaCreacionDatetime.substring(0, FechaCreacionNueva);

                        let FechaEntregaDatetime = datos_pedidos[ped].pedExt_FechaEntrega;
                        let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
                        fechaEntregaFinal = FechaEntregaDatetime.substring(0, FechaEntregaNueva);

                        if (datos_pedidos[ped].sedeCli_Id == datos_sedes[sede].sedeCli_Id &&
                          moment(fechaCreacionFinal).isBetween(fechaPedido, fechaEntrega) &&
                          moment(fechaEntregaFinal).isBetween(fechaPedido, fechaEntrega) &&
                          datos_pedidos[ped].estado_Id == idEstado) {
                          this.llenadoPedidos(datos_pedidos[ped]);
                        }
                      }
                    });
                  }
                }
              });
            } else if (nombreCliente != null) {
              this.clientesService.srvObtenerLista().subscribe(datos_cliente => {
                for (let cli = 0; cli < datos_cliente.length; cli++) {
                  if (datos_cliente[cli].cli_Nombre == nombreCliente) {
                    idCliente = datos_cliente[cli].cli_Id;
                    this.sedesClientesService.srvObtenerLista().subscribe(datos_sedes => {
                      for (let i = 0; i < datos_sedes.length; i++) {
                        if (datos_sedes[i].cli_Id == idCliente) {
                          this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidos => {
                            for (let ped = 0; ped < datos_pedidos.length; ped++) {
                              let FechaCreacionDatetime = datos_pedidos[ped].pedExt_FechaCreacion;
                              let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T");
                              fechaCreacionFinal = FechaCreacionDatetime.substring(0, FechaCreacionNueva);

                              let FechaEntregaDatetime = datos_pedidos[ped].pedExt_FechaEntrega;
                              let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
                              fechaEntregaFinal = FechaEntregaDatetime.substring(0, FechaEntregaNueva);

                              if (moment(fechaCreacionFinal).isBetween(fechaPedido, fechaEntrega) &&
                                moment(fechaEntregaFinal).isBetween(fechaPedido, fechaEntrega) &&
                                datos_pedidos[ped].estado_Id == idEstado &&
                                datos_pedidos[ped].sedeCli_Id == datos_sedes[i].sedeCli_Id) {
                                this.llenadoPedidos(datos_pedidos[ped]);
                              }
                            }
                          });
                        }
                      }
                    });
                  }
                }
              });
            }
          }
        }
      });
    }
    //Buscará el o los pedidos que tengan los filtros que se le están pasando, es decir, todos excepto los campos idCliente y nombreCliente
    else if (fechaPedido != null && fechaEntrega != null && estadoNombre != null && nombreVendedor != null) {
      this.pedidosProductos = [];
      let idUsuario : number;
      let idEstado : number;
      let fechaCreacionFinal : any;
      let fechaEntregaFinal : any;
      this.estadosService.srvObtenerListaEstados().subscribe(datos_estado => {
        for (let index = 0; index < datos_estado.length; index++) {
          if (datos_estado[index].estado_Nombre == estadoNombre) {
            idEstado = datos_estado[index].estado_Id;
            this.usuarioService.srvObtenerListaUsuario().subscribe(datos_usuarios => {
              for (let usua = 0; usua < datos_usuarios.length; usua++) {
                if (datos_usuarios[usua].usua_Nombre == nombreVendedor) {
                  idUsuario = datos_usuarios[usua].usua_Id;
                  this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidos => {
                    for (let ped = 0; ped < datos_pedidos.length; ped++) {
                      let FechaCreacionDatetime = datos_pedidos[ped].pedExt_FechaCreacion;
                      let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T");
                      fechaCreacionFinal = FechaCreacionDatetime.substring(0, FechaCreacionNueva);

                      let FechaEntregaDatetime = datos_pedidos[ped].pedExt_FechaEntrega;
                      let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
                      fechaEntregaFinal = FechaEntregaDatetime.substring(0, FechaEntregaNueva);

                      if (moment(fechaCreacionFinal).isBetween(fechaPedido, fechaEntrega) &&
                        moment(fechaEntregaFinal).isBetween(fechaPedido, fechaEntrega) &&
                        datos_pedidos[ped].estado_Id == idEstado &&
                        datos_pedidos[ped].usua_Id == idUsuario) {
                        this.llenadoPedidos(datos_pedidos[ped]);
                      }
                    }
                  });
                }
              }
            });
          }
        }
      });
    }
    //Buscará el o los pedidos que tengan los filtros que se le están pasando, es decir, todos exceptuando la fecha de entrega (no es necesario que esten llenos los campos idCliente y nombreCliente, con uno vale)
    else if (fechaPedido != null && estadoNombre != null && nombreVendedor != null && (idCliente != null || nombreCliente != null)) {
      this.pedidosProductos = [];
      let idUsuario : number;
      let idEstado : number;
      let fechaCreacionFinal : any;
      this.estadosService.srvObtenerListaEstados().subscribe(datos_estado => {
        for (let index = 0; index < datos_estado.length; index++) {
          if (datos_estado[index].estado_Nombre == estadoNombre) {
            idEstado = datos_estado[index].estado_Id;
            this.usuarioService.srvObtenerListaUsuario().subscribe(datos_usuarios => {
              for (let usua = 0; usua < datos_usuarios.length; usua++) {
                if (datos_usuarios[usua].usua_Nombre == nombreVendedor) {
                  idUsuario = datos_usuarios[usua].usua_Id;

                  if (idCliente != null) {
                    this.sedesClientesService.srvObtenerLista().subscribe(datos_sedes => {
                      for (let sede = 0; sede < datos_sedes.length; sede++) {
                        if (datos_sedes[sede].cli_Id == idCliente) {
                          this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidos => {
                            for (let ped = 0; ped < datos_pedidos.length; ped++) {
                              let FechaCreacionDatetime = datos_pedidos[ped].pedExt_FechaCreacion;
                              let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T");
                              fechaCreacionFinal = FechaCreacionDatetime.substring(0, FechaCreacionNueva);

                              if (datos_pedidos[ped].sedeCli_Id == datos_sedes[sede].sedeCli_Id &&
                                moment(fechaCreacionFinal).isBetween(fechaPedido, undefined) &&
                                datos_pedidos[ped].estado_Id == idEstado &&
                                datos_pedidos[ped].usua_Id == idUsuario) {
                                this.llenadoPedidos(datos_pedidos[ped]);
                              }
                            }
                          });
                        }
                      }
                    });
                  } else if (nombreCliente != null) {
                    this.clientesService.srvObtenerLista().subscribe(datos_cliente => {
                      for (let cli = 0; cli < datos_cliente.length; cli++) {
                        if (datos_cliente[cli].cli_Nombre == nombreCliente) {
                          idCliente = datos_cliente[cli].cli_Id;
                          this.sedesClientesService.srvObtenerLista().subscribe(datos_sedes => {
                            for (let i = 0; i < datos_sedes.length; i++) {
                              if (datos_sedes[i].cli_Id == idCliente) {
                                this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidos => {
                                  for (let ped = 0; ped < datos_pedidos.length; ped++) {
                                    let FechaCreacionDatetime = datos_pedidos[ped].pedExt_FechaCreacion;
                                    let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T");
                                    fechaCreacionFinal = FechaCreacionDatetime.substring(0, FechaCreacionNueva);

                                    if (moment(fechaCreacionFinal).isBetween(fechaPedido, undefined) &&
                                      datos_pedidos[ped].estado_Id == idEstado &&
                                      datos_pedidos[ped].usua_Id == idUsuario &&
                                      datos_pedidos[ped].sedeCli_Id == datos_sedes[i].sedeCli_Id) {
                                      this.llenadoPedidos(datos_pedidos[ped]);
                                    }
                                  }
                                });
                              }
                            }
                          });
                        }
                      }
                    });
                  }
                }
              }
            });
          }
        }
      });
    }
    //Buscará el o los pedidos que tengan los filtros que se le están pasando, es decir, todos exceptuando la fecha de creacion (no es necesario que esten llenos los campos idCliente y nombreCliente, con uno vale)
    else if (fechaEntrega != null && estadoNombre != null && nombreVendedor != null && (idCliente != null || nombreCliente != null)) {
      this.pedidosProductos = [];
      let idUsuario : number;
      let idEstado : number;
      let fechaEntregaFinal : any;
      this.estadosService.srvObtenerListaEstados().subscribe(datos_estado => {
        for (let index = 0; index < datos_estado.length; index++) {
          if (datos_estado[index].estado_Nombre == estadoNombre) {
            idEstado = datos_estado[index].estado_Id;
            this.usuarioService.srvObtenerListaUsuario().subscribe(datos_usuarios => {
              for (let usua = 0; usua < datos_usuarios.length; usua++) {
                if (datos_usuarios[usua].usua_Nombre == nombreVendedor) {
                  idUsuario = datos_usuarios[usua].usua_Id;

                  if (idCliente != null) {
                    this.sedesClientesService.srvObtenerLista().subscribe(datos_sedes => {
                      for (let sede = 0; sede < datos_sedes.length; sede++) {
                        if (datos_sedes[sede].cli_Id == idCliente) {
                          this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidos => {
                            for (let ped = 0; ped < datos_pedidos.length; ped++) {
                              let FechaEntregaDatetime = datos_pedidos[ped].pedExt_FechaEntrega;
                              let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
                              fechaEntregaFinal = FechaEntregaDatetime.substring(0, FechaEntregaNueva);

                              if (datos_pedidos[ped].sedeCli_Id == datos_sedes[sede].sedeCli_Id &&
                                moment(fechaEntregaFinal).isBetween(undefined, fechaEntrega) &&
                                datos_pedidos[ped].estado_Id == idEstado &&
                                datos_pedidos[ped].usua_Id == idUsuario) {
                                this.llenadoPedidos(datos_pedidos[ped]);
                              }
                            }
                          });
                        }
                      }
                    });
                  } else if (nombreCliente != null) {
                    this.clientesService.srvObtenerLista().subscribe(datos_cliente => {
                      for (let cli = 0; cli < datos_cliente.length; cli++) {
                        if (datos_cliente[cli].cli_Nombre == nombreCliente) {
                          idCliente = datos_cliente[cli].cli_Id;
                          this.sedesClientesService.srvObtenerLista().subscribe(datos_sedes => {
                            for (let i = 0; i < datos_sedes.length; i++) {
                              if (datos_sedes[i].cli_Id == idCliente) {
                                this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidos => {
                                  for (let ped = 0; ped < datos_pedidos.length; ped++) {
                                    let FechaEntregaDatetime = datos_pedidos[ped].pedExt_FechaEntrega;
                                    let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
                                    fechaEntregaFinal = FechaEntregaDatetime.substring(0, FechaEntregaNueva);

                                    if (moment(fechaEntregaFinal).isBetween(undefined, fechaEntrega) &&
                                      datos_pedidos[ped].estado_Id == idEstado &&
                                      datos_pedidos[ped].usua_Id == idUsuario &&
                                      datos_pedidos[ped].sedeCli_Id == datos_sedes[i].sedeCli_Id) {
                                      this.llenadoPedidos(datos_pedidos[ped]);
                                    }
                                  }
                                });
                              }
                            }
                          });
                        }
                      }
                    });
                  }
                }
              }
            });
          }
        }
      });
    }
    //Buscará el o los pedidos que tengan los filtros que se le están pasando, es decir, fechas y estado
    else if (fechaPedido != null && fechaEntrega != null && estadoNombre != null) {
      this.pedidosProductos = [];
      let idUsuario : number;
      let idEstado : number;
      let fechaCreacionFinal : any;
      let fechaEntregaFinal : any;
      this.estadosService.srvObtenerListaEstados().subscribe(datos_estado => {
        for (let index = 0; index < datos_estado.length; index++) {
          if (datos_estado[index].estado_Nombre == estadoNombre) {
            idEstado = datos_estado[index].estado_Id;
            this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidos => {
              for (let ped = 0; ped < datos_pedidos.length; ped++) {
                let FechaCreacionDatetime = datos_pedidos[ped].pedExt_FechaCreacion;
                let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T");
                fechaCreacionFinal = FechaCreacionDatetime.substring(0, FechaCreacionNueva);

                let FechaEntregaDatetime = datos_pedidos[ped].pedExt_FechaEntrega;
                let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
                fechaEntregaFinal = FechaEntregaDatetime.substring(0, FechaEntregaNueva);

                if (moment(fechaCreacionFinal).isBetween(fechaPedido, fechaEntrega) &&
                  moment(fechaEntregaFinal).isBetween(fechaPedido, fechaEntrega) &&
                  datos_pedidos[ped].estado_Id == idEstado) {
                  this.llenadoPedidos(datos_pedidos[ped]);
                }
              }
            });
          }
        }
      });
    }
    //Buscará el o los pedidos que tengan los filtros que se le están pasando, es decir, fechas y cliente (no es necesario que esten llenos los campos idCliente y nombreCliente, con uno vale)
    else if (fechaPedido != null && fechaEntrega != null && (idCliente != null || nombreCliente != null)) {
      this.pedidosProductos = [];
      let fechaCreacionFinal : any;
      let fechaEntregaFinal : any;

      if (idCliente != null) {
        this.sedesClientesService.srvObtenerLista().subscribe(datos_sedes => {
          for (let sede = 0; sede < datos_sedes.length; sede++) {
            if (datos_sedes[sede].cli_Id == idCliente) {
              this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidos => {
                for (let ped = 0; ped < datos_pedidos.length; ped++) {
                  let FechaCreacionDatetime = datos_pedidos[ped].pedExt_FechaCreacion;
                  let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T");
                  fechaCreacionFinal = FechaCreacionDatetime.substring(0, FechaCreacionNueva);

                  let FechaEntregaDatetime = datos_pedidos[ped].pedExt_FechaEntrega;
                  let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
                  fechaEntregaFinal = FechaEntregaDatetime.substring(0, FechaEntregaNueva);

                  if (datos_pedidos[ped].sedeCli_Id == datos_sedes[sede].sedeCli_Id &&
                    moment(fechaCreacionFinal).isBetween(fechaPedido, fechaEntrega) &&
                    moment(fechaEntregaFinal).isBetween(fechaPedido, fechaEntrega) ) {
                    this.llenadoPedidos(datos_pedidos[ped]);
                  }
                }
              });
            }
          }
        });
      } else if (nombreCliente != null) {
        this.clientesService.srvObtenerLista().subscribe(datos_cliente => {
          for (let cli = 0; cli < datos_cliente.length; cli++) {
            if (datos_cliente[cli].cli_Nombre == nombreCliente) {
              idCliente = datos_cliente[cli].cli_Id;
              this.sedesClientesService.srvObtenerLista().subscribe(datos_sedes => {
                for (let i = 0; i < datos_sedes.length; i++) {
                  if (datos_sedes[i].cli_Id == idCliente) {
                    this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidos => {
                      for (let ped = 0; ped < datos_pedidos.length; ped++) {
                        let FechaCreacionDatetime = datos_pedidos[ped].pedExt_FechaCreacion;
                        let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T");
                        fechaCreacionFinal = FechaCreacionDatetime.substring(0, FechaCreacionNueva);

                        let FechaEntregaDatetime = datos_pedidos[ped].pedExt_FechaEntrega;
                        let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
                        fechaEntregaFinal = FechaEntregaDatetime.substring(0, FechaEntregaNueva);

                        if (moment(fechaCreacionFinal).isBetween(fechaPedido, fechaEntrega) &&
                          moment(fechaEntregaFinal).isBetween(fechaPedido, fechaEntrega) &&
                          datos_pedidos[ped].sedeCli_Id == datos_sedes[i].sedeCli_Id) {
                          this.llenadoPedidos(datos_pedidos[ped]);
                        }
                      }
                    });
                  }
                }
              });
            }
          }
        });
      }
    }
    //Buscará el o los pedidos que tengan los filtros que se le están pasando, es decir, fechas y vendedor
    else if (fechaPedido != null && fechaEntrega != null && nombreVendedor != null) {
      console.log(1)
      this.pedidosProductos = [];
      let idUsuario : number;
      let idEstado : number;
      let fechaCreacionFinal : any;
      let fechaEntregaFinal : any;
      this.usuarioService.srvObtenerListaUsuario().subscribe(datos_usuarios => {
        for (let usua = 0; usua < datos_usuarios.length; usua++) {
          if (datos_usuarios[usua].usua_Nombre == nombreVendedor) {
            idUsuario = datos_usuarios[usua].usua_Id;
            this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidos => {
              for (let ped = 0; ped < datos_pedidos.length; ped++) {
                let FechaCreacionDatetime = datos_pedidos[ped].pedExt_FechaCreacion;
                let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T");
                fechaCreacionFinal = FechaCreacionDatetime.substring(0, FechaCreacionNueva);

                let FechaEntregaDatetime = datos_pedidos[ped].pedExt_FechaEntrega;
                let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
                fechaEntregaFinal = FechaEntregaDatetime.substring(0, FechaEntregaNueva);

                if ( moment(fechaCreacionFinal).isBetween(fechaPedido, fechaEntrega) &&
                  moment(fechaEntregaFinal).isBetween(fechaPedido, fechaEntrega) &&
                  datos_pedidos[ped].usua_Id == idUsuario) {
                  this.llenadoPedidos(datos_pedidos[ped]);
                }
              }
            });
          }
        }
      });
    }
    //Buscará los pedidos por las fechas filtradas
    else if (fechaPedido !== null && fechaEntrega !== null) {
      this.pedidosProductos = [];
      let fechaCreacionFinal : any;
      let fechaEntregaFinal : any;
      this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          let FechaCreacionDatetime = datos_pedidos[index].pedExt_FechaCreacion;
          let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T");
          fechaCreacionFinal = FechaCreacionDatetime.substring(0, FechaCreacionNueva);

          let FechaEntregaDatetime = datos_pedidos[index].pedExt_FechaEntrega;
          let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
          fechaEntregaFinal = FechaEntregaDatetime.substring(0, FechaEntregaNueva);

          if (moment(fechaCreacionFinal).isBetween(fechaPedido, fechaEntrega) && moment(fechaEntregaFinal).isBetween(fechaPedido, fechaEntrega)) {
            this.llenadoPedidos(datos_pedidos[index]);
          }
        }
      });
    }
    //Buscará los pedidos con el estado que se digitó
    else if (estadoNombre !== null) {
      let idEstado : number;
      this.pedidosProductos = [];
      this.estadosService.srvObtenerListaEstados().subscribe(datos_estado => {
        for (let index = 0; index < datos_estado.length; index++) {
          if (datos_estado[index].estado_Nombre == estadoNombre) {
            idEstado = datos_estado[index].estado_Id;
            this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidos => {
              for (let ped = 0; ped < datos_pedidos.length; ped++) {
                if (datos_pedidos[ped].estado_Id == idEstado)  this.llenadoPedidos(datos_pedidos[ped]);
              }
            });
          }
        }
      });
    }
    //Buscará el pedido por el ID que se digitó
    else if (idPedido !== null) {
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListaPorId(idPedido).subscribe(datos_pedidos => {
        this.sedesClientesService.srvObtenerListaPorId(datos_pedidos.sedeCli_Id).subscribe(datos_sedes => {
          this.clientesService.srvObtenerListaPorId(datos_sedes.cli_Id).subscribe(datos_clientes => {
            this.usuarioService.srvObtenerListaPorId(this.storage_Id).subscribe(datos_usuarios => {

              let FechaCreacionDatetime = datos_pedidos.pedExt_FechaCreacion
              let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T")
              this.fechaCreacionCortada.push(FechaCreacionDatetime.substring(0, FechaCreacionNueva));

              let FechaEntregaDatetime = datos_pedidos.pedExt_FechaEntrega;
              let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
              this.fechaEntregaCortada.push(FechaEntregaDatetime.substring(0, FechaEntregaNueva));

              if (datos_usuarios.rolUsu_Id == 2) {
                if (datos_usuarios.usua_Nombre == this.storage_Nombre) {
                  if (datos_pedidos.usua_Id == datos_usuarios.usua_Id) this.pedidosProductos.push(datos_pedidos);
                  else {
                    const Toast = Swal.mixin({
                      toast: true,
                      position: 'center',
                      showConfirmButton: false,
                      timer: 1000,
                      timerProgressBar: true,
                      didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer)
                        toast.addEventListener('mouseleave', Swal.resumeTimer)
                      }
                    })

                    Toast.fire({
                      icon: 'error',
                      title: 'Usted no tiene acceso a este pedido'
                    });
                  }
                }
              } else if (datos_usuarios.rolUsu_Id == 1) this.pedidosProductos.push(datos_pedidos);

              for (const item of this.pedidosProductos) {
                this.estadosService.srvObtenerListaEstados().subscribe(datos_estado => {
                  for (let index = 0; index < datos_estado.length; index++) {
                    if (datos_estado[index].estado_Id == item.estado_Id) item.estado_Id = datos_estado[index].estado_Nombre;
                  }
                });
              }
              for (const vendedor of this.pedidosProductos) {
                this.usuarioService.srvObtenerListaUsuario().subscribe(datos_usuario => {
                  for (let index = 0; index < datos_usuario.length; index++) {
                    if (datos_usuario[index].usua_Id == vendedor.usua_Id) vendedor.usua_Id = datos_usuario[index].usua_Nombre;
                  }
                });
              }
              for (const cliente of this.pedidosProductos) {
                this.sedesClientesService.srvObtenerListaPorId(cliente.sedeCli_Id).subscribe(datos_sede => {
                  this.clientesService.srvObtenerListaPorId(datos_sede.cli_Id).subscribe(datos_cliente => {
                    cliente.sedeCli_Id = datos_cliente.cli_Nombre;
                  });
                });
              }
            });
          });
        });
      }, error => {
        const Toast = Swal.mixin({
          toast: true,
          position: 'center',
          showConfirmButton: false,
          timer: 1000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
          }
        });
        Toast.fire({
          icon: 'error',
          title: 'El pedido no existe'
        });
      });

    }
    //Buscará los pedidos del usuario que se ha seleccionado
    else if (nombreVendedor !== null){
      let idUsuario : number;
      this.pedidosProductos = [];
      this.usuarioService.srvObtenerListaUsuario().subscribe(datos_usuarios => {
        for (let index = 0; index < datos_usuarios.length; index++) {
          if (datos_usuarios[index].usua_Nombre == nombreVendedor) {
            idUsuario = datos_usuarios[index].usua_Id;
            this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidos => {
              for (let ped = 0; ped < datos_pedidos.length; ped++) {
                if (datos_pedidos[ped].usua_Id == idUsuario) this.llenadoPedidos(datos_pedidos[ped]);
              }
            });
          }
        }
      });
    }
    //Buscará los pedidos del cliente que se buscó por su Id
    else if (idCliente !== null){
      this.pedidosProductos = [];
      this.sedesClientesService.srvObtenerLista().subscribe(datos_sedes => {
        for (let index = 0; index < datos_sedes.length; index++) {
          if (datos_sedes[index].cli_Id == idCliente) {
            this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidos => {
              for (let ped = 0; ped < datos_pedidos.length; ped++) {
                if (datos_pedidos[ped].sedeCli_Id == datos_sedes[index].sedeCli_Id) this.llenadoPedidos(datos_pedidos[ped]);
              }
            })
          }
        }
      });
    }
    //Buscará los pedidos de los clientes por el que se seleccionó
    else if (nombreCliente !== null){
      this.pedidosProductos = [];
      let idCliente : number;
      this.clientesService.srvObtenerLista().subscribe(datos_cliente => {
        for (let index = 0; index < datos_cliente.length; index++) {
          if (datos_cliente[index].cli_Nombre == nombreCliente) {
            idCliente = datos_cliente[index].cli_Id;
            this.sedesClientesService.srvObtenerLista().subscribe(datos_sedes => {
              for (let i = 0; i < datos_sedes.length; i++) {
                if (datos_sedes[i].cli_Id == idCliente) {
                  this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidos => {
                    for (let ped = 0; ped < datos_pedidos.length; ped++) {
                      if (datos_pedidos[ped].sedeCli_Id == datos_sedes[i].sedeCli_Id) this.llenadoPedidos(datos_pedidos[ped]);
                    }
                  })
                }
              }
            });
          }
        }
      });
    }
    //Buscará los pedidos por la fecha que se selccionó, esta fecha será la fecha de creación del pedido
    else if (fechaPedido !== null) {
      this.pedidosProductos = [];
      let fechaCreacionFinal : any;
      this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          let FechaCreacionDatetime = datos_pedidos[index].pedExt_FechaCreacion;
          let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T");
          fechaCreacionFinal = FechaCreacionDatetime.substring(0, FechaCreacionNueva);
          if (moment(fechaCreacionFinal).isBetween(fechaPedido, undefined)) {
            this.llenadoPedidos(datos_pedidos[index]);
          }
        }
      });
    }
    //Buscará los pedidos por la fecha que se selccionó, esta fecha será la fecha de entrega del pedido
    else if (fechaEntrega !== null) {
      this.pedidosProductos = [];
      let fechaEntregaFinal : any;
      this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          let FechaEntregaDatetime = datos_pedidos[index].pedExt_FechaEntrega;
          let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
          fechaEntregaFinal = FechaEntregaDatetime.substring(0, FechaEntregaNueva);
          if (moment(fechaEntregaFinal).isBetween(undefined, fechaEntrega)) {
            this.llenadoPedidos(datos_pedidos[index]);
          }
        }
      });
    }
    //Bucará todos los pedidos existentes
    else {
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {

          let FechaCreacionDatetime = datos_pedidos[index].pedExt_FechaCreacion
          let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T")
          this.fechaCreacionCortada.push(FechaCreacionDatetime.substring(0, FechaCreacionNueva));

          let FechaEntregaDatetime = datos_pedidos[index].pedExt_FechaEntrega;
          let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
          this.fechaEntregaCortada.push(FechaEntregaDatetime.substring(0, FechaEntregaNueva));

          this.sedesClientesService.srvObtenerListaPorId(datos_pedidos[index].sedeCli_Id).subscribe(datos_sedes => {
            this.clientesService.srvObtenerListaPorId(datos_sedes.cli_Id).subscribe(datos_clientes => {
              this.usuarioService.srvObtenerListaPorId(this.storage_Id).subscribe(datos_usuarios => {
                if (datos_usuarios.rolUsu_Id == 2) {
                  if (datos_usuarios.usua_Nombre == this.storage_Nombre) {
                    if (datos_pedidos[index].usua_Id == datos_usuarios.usua_Id) this.pedidosProductos.push(datos_pedidos[index]);
                  }
                } else if (datos_usuarios.rolUsu_Id == 1) this.pedidosProductos.push(datos_pedidos[index]);

                for (const item of this.pedidosProductos) {
                  this.estadosService.srvObtenerListaEstados().subscribe(datos_estado => {
                    for (let index = 0; index < datos_estado.length; index++) {
                      if (datos_estado[index].estado_Id == item.estado_Id) item.estado_Id = datos_estado[index].estado_Nombre;
                    }
                  });
                }
                for (const vendedor of this.pedidosProductos) {
                  this.usuarioService.srvObtenerListaUsuario().subscribe(datos_usuario => {
                    for (let index = 0; index < datos_usuario.length; index++) {
                      if (datos_usuario[index].usua_Id == vendedor.usua_Id) vendedor.usua_Id = datos_usuario[index].usua_Nombre;
                    }
                  });
                }
                for (const cliente of this.pedidosProductos) {
                  this.sedesClientesService.srvObtenerListaPorId(cliente.sedeCli_Id).subscribe(datos_sede => {
                    this.clientesService.srvObtenerListaPorId(datos_sede.cli_Id).subscribe(datos_cliente => {
                      cliente.sedeCli_Id = datos_cliente.cli_Nombre;
                    });
                  });
                }
                this.pedidosProductos.sort((a,b)=> Number(a.pedExt_Id) - Number(b.pedExt_Id));
              });
            });
          });
        }
      });
    }
  }

  // Funcion que llenará la tabla de pedidos con la informacion que viene de la funcion "validarCamposVaciosConsulta"
  llenadoPedidos(pedido : any){
    this.sedesClientesService.srvObtenerListaPorId(pedido.sedeCli_Id).subscribe(datos_sedes => {
      this.clientesService.srvObtenerListaPorId(datos_sedes.cli_Id).subscribe(datos_clientes => {
        this.usuarioService.srvObtenerListaPorId(this.storage_Id).subscribe(datos_usuarios => {
          let FechaCreacionDatetime = pedido.pedExt_FechaCreacion
          let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T")
          this.fechaCreacionCortada.push(FechaCreacionDatetime.substring(0, FechaCreacionNueva));

          let FechaEntregaDatetime = pedido.pedExt_FechaEntrega;
          let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
          this.fechaEntregaCortada.push(FechaEntregaDatetime.substring(0, FechaEntregaNueva));

          if (datos_usuarios.rolUsu_Id == 2) {
            if (datos_usuarios.usua_Nombre == this.storage_Nombre) {
              if (pedido.usua_Id == datos_usuarios.usua_Id) this.pedidosProductos.push(pedido);
              else {
                const Toast = Swal.mixin({
                  toast: true,
                  position: 'center',
                  showConfirmButton: false,
                  timer: 1000,
                  timerProgressBar: true,
                  didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer)
                    toast.addEventListener('mouseleave', Swal.resumeTimer)
                  }
                })

                Toast.fire({
                  icon: 'error',
                  title: 'Usted no tiene acceso a este pedido'
                });
              }
            }
          } else if (datos_usuarios.rolUsu_Id == 1) this.pedidosProductos.push(pedido);

          for (const item of this.pedidosProductos) {
            this.estadosService.srvObtenerListaEstados().subscribe(datos_estado => {
              for (let i = 0; i < datos_estado.length; i++) {
                if (datos_estado[i].estado_Id == item.estado_Id) item.estado_Id = datos_estado[i].estado_Nombre;
              }
            });
          }
          for (const vendedor of this.pedidosProductos) {
            this.usuarioService.srvObtenerListaUsuario().subscribe(datos_usuario => {
              for (let i = 0; i < datos_usuario.length; i++) {
                if (datos_usuario[i].usua_Id == vendedor.usua_Id) vendedor.usua_Id = datos_usuario[i].usua_Nombre;
              }
            });
          }
          for (const cliente of this.pedidosProductos) {
            this.sedesClientesService.srvObtenerListaPorId(cliente.sedeCli_Id).subscribe(datos_sede => {
              this.clientesService.srvObtenerListaPorId(datos_sede.cli_Id).subscribe(datos_cliente => {
                cliente.sedeCli_Id = datos_cliente.cli_Nombre;
              });
            });
          }
          this.pedidosProductos.sort((a,b)=> Number(a.pedExt_Id) - Number(b.pedExt_Id));
          this.pedidosProductos.sort((a,b)=> Number(a.pedExt_FechaCreacion) - Number(b.pedExt_FechaCreacion));
        });
      });
    });
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
  }

  /* FUNCION PARA RELIZAR CONFIMACIÓN DE SALIDA */
  confimacionSalida(){
    Swal.fire({
      title: '¿Seguro que desea salir?',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Salir',
      denyButtonText: `No Salir`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) window.location.href = "./";
    })
  }

  //Se obtiene el ultimo codigo del pedido y se incrementa en 1. (Contador)
  ObtenerUltimoPedido() {
    let ultimoCodigoPedido : number;
    let pedidosID = [];
    this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(dataPedExternos =>{
      for (let ped = 0; ped < dataPedExternos.length; ped++) {
        pedidosID.push(dataPedExternos[ped].pedExt_Id);
      }
      let ultimoId = Math.max.apply(null, pedidosID);
      this.contadorPedidosExternos = ultimoId + 1;
    });
  }

  eventoEnterInput(dato : any) {
    dato = "Mundo"

    console.log("Hola " + dato);
  }

  //Funcion que colocará el nombre a las columnas de la tabla en la cual se muestran los productos pedidos por los clientes
  ColumnasTabla(){
    this.titulosTabla = [];
    this.titulosTabla = [{
      pID : "Id",
      pNombre : "Nombre",
      pAncho :   "Ancho",
      pFuelle : "Fuelle",
      pCalibre : "Calb.",
      pUndMedACF : "Und.",
      pTipoProd : "TipoProd",
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

    this.valorTotal = this.valorTotal + subtotalProd;

    this.existenciasProductosServices.srvObtenerLista().subscribe(datos_existencias => {
      for (let index = 0; index < datos_existencias.length; index++) {
        if (datos_existencias[index].prod_Id == idProducto) {
          if (datos_existencias[index].undMed_Id == presentacion) {
            if (precioProducto >= datos_existencias[index].exProd_PrecioVenta) {
              let productoExt : any = {
                Id : this.FormPedidoExternoProductos.get('ProdId')?.value,
                Nombre : this.nombreProducto,
                Ancho : this.FormPedidoExternoProductos.get('ProdAncho').value,
                Fuelle : this.FormPedidoExternoProductos.get('ProdFuelle').value,
                Cal : this.FormPedidoExternoProductos.get('ProdCalibre').value,
                Und : this.FormPedidoExternoProductos.get('ProdUnidadMedidaACF').value,
                Tipo : this.FormPedidoExternoProductos.get('ProdTipo').value,
                Cant : this.FormPedidoExternoProductos.get('ProdCantidad').value,
                Largo : this.FormPedidoExternoProductos.get('ProdLargo').value,
                UndCant : this.FormPedidoExternoProductos.get('ProdUnidadMedidaCant')?.value,
                PrecioUnd : precioProducto,
                TpMoneda : this.FormPedidoExternoProductos.get('ProdTipoMoneda').value,
                Stock : this.FormPedidoExternoProductos.get('ProdStock').value,
                Produ_Descripcion : this.FormPedidoExternoProductos.get('ProdDescripcion').value,
                SubTotal : this.FormPedidoExternoProductos.get('ProdCantidad').value * this.FormPedidoExternoProductos.get('ProdPrecioUnd')?.value
              }

              // this.ArrayProducto.push(productoExt);
              // this.LimpiarCamposProductos();
              // productoExt = [];

              let campoId = this.FormPedidoExternoProductos.get('ProdId')?.value;
              if (this.AccionBoton == "Agregar" && this.ArrayProducto.length == 0) {
                this.ArrayProducto.push(productoExt);
                this.LimpiarCamposProductos();

              } else if (this.AccionBoton == "Agregar" && this.ArrayProducto.length != 0){
                for (let index = 0; index < formulario.length; index++) {
                  if(campoId === formulario[index].Id)  Swal.fire('No se puede cargar el mismo producto a la tabla.');
                  else {
                    this.ArrayProducto.push(productoExt);
                    this.LimpiarCamposProductos();
                  }
                  break;
                }
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

              for (let index = 0; index < this.ArrayProducto.length; index++) {
                this.valorTotal = this.ArrayProducto.reduce((accion, productoExt,) => accion + (productoExt.Cant * productoExt.PrecioUnd), 0)
                console.log(this.valorTotal);
              }
            } else Swal.fire(`El precio digitado no puede ser menor al que tiene el producto estipulado $${datos_existencias[index].exProd_PrecioVenta}`);
          } else {
            Swal.fire(`La presentacion seleccionada no esta registrada para este producto`);
          }
        } else continue;
      }
      // for (let index = 0; index < this.ArrayProducto.length; index++) {
      //   this.valorTotal = this.ArrayProducto.reduce((accion) => accion + (cantidad * precioProducto), 0);
      // }
      this.ArrayProducto.sort((a,b)=> Number(a.PrecioUnd) - Number(b.PrecioUnd));
    });
  }

  // Funcion para crear los pedidos de productos y añadirlos a la base de datos
  CrearPedidoExterno() {
    let nombreUsuario : string = this.FormPedidoExternoClientes.value.PedUsuarioNombre;
    let idUsuario : number;
    let direccionSede : string = this.FormPedidoExternoClientes.value.PedSedeCli_Id;
    let idSede : number;
    this.usuarioService.srvObtenerListaUsuario().subscribe(datos_usuarios => {
      for (let index = 0; index < datos_usuarios.length; index++) {
        if (datos_usuarios[index].usua_Nombre === nombreUsuario){
          idUsuario = datos_usuarios[index].usua_Id;
          this.sedesClientesService.srvObtenerLista().subscribe(datos_sede =>{
            for (let sede = 0; sede < datos_sede.length; sede++) {
              if(direccionSede === datos_sede[sede].sedeCliente_Direccion) {
                idSede = datos_sede[sede].sedeCli_Id;

                this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidos => {
                  let pedidosID = [];
                  let idProducto : any;
                  let cantidadProducto : any;
                  let unidadMedida : any;
                  let precioUnidad : number;
                  let campoEstado = this.FormPedidoExternoClientes.get('PedEstadoId')?.value

                  for (let ped = 0; ped < datos_pedidos.length; ped++) {
                    pedidosID.push(datos_pedidos[ped].pedExt_Id);
                  }

                  let ultimoId = Math.max.apply(null, pedidosID);
                  let nombrePDf = ultimoId + 1;

                  const camposPedido : any = {
                    PedExt_FechaCreacion: this.FormPedidoExternoClientes.get('PedFecha')?.value,
                    PedExt_FechaEntrega: this.FormPedidoExternoClientes.get('PedFechaEnt')?.value,
                    Empresa_Id: this.EmpresaVendedora,
                    SedeCli_Id: idSede,
                    Usua_Id: idUsuario,
                    Estado_Id: this.EstadoDocumentos,
                    PedExt_Observacion: this.FormPedidoExternoClientes.get('PedObservacion')?.value,
                    PedExt_PrecioTotal: this.valorTotal,
                    PedExt_Archivo: 0
                  }

                  if(!this.ArrayProducto.length) Swal.fire('Debe cargar al menos un producto en la tabla.');
                  else if (campoEstado == "Finalizado" || campoEstado == "Cancelado" || campoEstado == "Anulado") Swal.fire('No puede crear un pedido con el estado seleccionado. Por favor verifique.');
                  else if (camposPedido.PedExt_FechaEntrega <= camposPedido.PedExt_FechaCreacion) Swal.fire('La fecha de creación no puede ser menor o igual a la fecha de entrega.');
                  else{
                    this.pedidoproductoService.srvGuardarPedidosProductos(camposPedido).subscribe(data=> {

                      for (let index = 0; index < this.ArrayProducto.length; index++) {
                        idProducto = this.ArrayProducto[index].Id;
                        cantidadProducto = this.ArrayProducto[index].Cant;
                        unidadMedida = this.ArrayProducto[index].UndCant;
                        precioUnidad = this.ArrayProducto[index].PrecioUnd;

                        const productosPerdidos : any = {
                          Prod_Id: idProducto,
                          PedExt_Id: nombrePDf,
                          PedExtProd_Cantidad : cantidadProducto,
                          UndMed_Id : unidadMedida,
                          PedExtProd_PrecioUnitario : precioUnidad
                        }

                        this.PedidoProductosService.srvGuardar(productosPerdidos).subscribe(registro_pedido_productos => {
                        }, error => { console.log(error); });
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
                      })

                      this.crearpdf();
                      setTimeout(() => {
                        this.LimpiarCampos();
                      }, 1000);
                    }, error => { console.log(error); });
                  }
                });
              }
            }
          });
          break;
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

  //Funcion para validar que los campos de crear pedidos no esten vacios.
  validarInputsVacios(){
    if (this.FormPedidoExternoClientes.valid){
        this.CrearPedidoExterno();
    }  else {
      Swal.fire('Debe llenar los campos vacios en la sección "Crear pedido"');
    }
  }

  //Función para captar el ID del estado según el nombre del estado seleccionado.
  captarEstadoSeleccionado(){
    this.EstadoDeDocumentos = this.FormPedidoExternoClientes.get('PedEstadoId')?.value;
    this.estadosService.srvObtenerListaEstados().subscribe(data=>{
      for (let index = 0; index < data.length; index++) {
        if(this.EstadoDeDocumentos == data[index].estado_Nombre) {
          this.EstadoDocumentos = data[index].estado_Id;
        }
      }
    }, error => {console.log(error);})
  }

  /*Función para captar el ID de la sede seleccionada según su nombre, dato que se pasa a
  la tabla de pedidos al insertar el dato.*/
  captarSedeSeleccionada(){
    this.SedeSeleccionada = this.FormPedidoExternoClientes.get('PedSedeCli_Id')?.value;
    this.sedesClientesService.srvObtenerLista().subscribe(data=>{
      for (let index = 0; index < data.length; index++) {
        if(this.SedeSeleccionada == data[index].sedeCliente_Direccion) {
          this.IDSedeSeleccionada = data[index].sedeCli_Id;
        }
      }
    }, error => {console.log(error);})
  }

  /*Función para captar el ID de usuario según su nombre, dato que se pasa a
  la tabla de pedidos al insertar el dato.*/
  CaptarUsuarioSeleccionado() {
    let usuarioCombo = this.FormPedidoExternoClientes.get('PedUsuarioNombre')?.value;
    this.usuarioService.srvObtenerListaUsuario().subscribe(dataUsuario => {
      for (let index = 0; index < dataUsuario.length; index++) {
        if(usuarioCombo == dataUsuario[index].usua_Nombre) this.UsuarioSeleccionado = dataUsuario[index].usua_Id;
      }
    }, error => { console.log(error);})
  }

  // Función para limpiar la tabla en la que se muestran los productos del pedido
  LimpiarTablaTotal(){
    this.ArrayProducto = [];
    this.valorTotal = 0;
  }

  // Funcion para llenar la tabla de productos con la informacion que se inserte en los modales
  llenarTablaProductosCreador(id : any, nombre : string, ancho : any, fuelle : any, calibre : any, largo : any, undMed : string, tpProducto : string, cantidad : any, undMed2 : string, precio : any, moneda : string, descripcion : string){
    let productoExt : any = {
      Id : id,
      Nombre : nombre,
      Ancho : ancho,
      Fuelle : fuelle,
      Cal : calibre,
      Und : undMed,
      Tipo : tpProducto,
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

  // Funcion para llenar los datos de los clientes que se son creados en el modal
  llenarClientesCreado(id : any, tipoId : any, nombre : any, telefono : any, email : any, tipoCliente : any, ciudadSede : any, vendedor : any, codigoPostal : any, direccionSede : any, sedeCLiID :any){
    this.cliente.push(nombre);
    this.sedeCliente.push(direccionSede);
    this.usuarioVendedor.push(vendedor);
  }

  // Fucnion para que crear ub pdf apenas se realiza el pedido de productos
  crearpdf(){
    this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidos => {
      let pedidosID = [];
      for (let ped = 0; ped < datos_pedidos.length; ped++) {
        pedidosID.push(datos_pedidos[ped].pedExt_Id);
      }
      let ultimoId = Math.max.apply(null, pedidosID);

      this.clientesService.srvObtenerLista().subscribe(datos_clientes => {
        for (let cli = 0; cli < datos_clientes.length; cli++) {
          if (datos_clientes[cli].cli_Nombre == this.FormPedidoExternoClientes.value.PedClienteNombre) {
            for (let index = 0; index < this.ArrayProducto.length; index++) {
              this.sedesClientesService.srvObtenerLista().subscribe(datos_sedeCliente => {
                for (let sede = 0; sede < datos_sedeCliente.length; sede++) {
                  if (datos_sedeCliente[sede].sedeCliente_Direccion == this.FormPedidoExternoClientes.value.PedSedeCli_Id) {
                    this.clientesService.srvObtenerListaPorId(datos_sedeCliente[sede].cli_Id).subscribe(datos_cliente => {
                      this.tipoClientService.srvObtenerListaPorId(datos_cliente.tpCli_Id).subscribe(datos_tipocliente => {
                        const pdfDefinicion : any = {
                          info: {
                            title: `${ultimoId}`
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
                                    `ID: ${datos_clientes[cli].cli_Id}`,
                                    `Tipo de ID: ${datos_clientes[cli].tipoIdentificacion_Id}`,
                                    `Tipo de Cliente: ${datos_tipocliente.tpCli_Nombre}`
                                  ],
                                  [
                                    `Nombre: ${this.FormPedidoExternoClientes.value.PedClienteNombre}`,
                                    `Telefono: ${datos_clientes[cli].cli_Telefono}`,
                                    `Ciudad: ${datos_sedeCliente[sede].sedeCliente_Ciudad}`
                                  ],
                                  [
                                    `Dirección: ${datos_sedeCliente[sede].sedeCliente_Direccion}`,
                                    `Codigo Postal: ${datos_sedeCliente[sede].sedeCli_CodPostal}`,
                                    ``
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

                            this.table(this.ArrayProducto, ['Id', 'Nombre', 'Ancho', 'Fuelle', 'Cal', 'Largo', 'Und', 'Tipo', 'Cant', 'UndCant', 'PrecioUnd', 'SubTotal']),

                            {
                              text: `\n\nValor Total Pedido: $${this.formatonumeros(this.valorTotal)}`,
                              alignment: 'right',
                              style: 'header',
                            },
                            {
                              text: `Tipo de moneda: ${this.ArrayProducto[index].TpMoneda}`,
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
                      });
                    });
                    break;
                  }
                }
              });
              break;
            }
          }
        }
      });
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
          widths: [35, 65, 28, 28, 20, 25, 20, 45, 30, 17, 28, 60],
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

  // Funcion para llenar el pdf con información de la base de datos dependiendo el pedido
  llenarPDFConBD(formulario : any){
    let id : any = formulario.pedExt_Id

    this.pedidoproductoService.srvObtenerListaPorId(id).subscribe(datos_pedidos => {
      this.PedidoProductosService.srvObtenerLista().subscribe(datos_pedidos_productos => {
        for (let index = 0; index < datos_pedidos_productos.length; index++) {
          if (datos_pedidos.pedExt_Id == datos_pedidos_productos[index].pedExt_Id) {
            this.productosServices.srvObtenerLista().subscribe(datos_productos => {
              for (let i = 0; i < datos_productos.length; i++) {
                if (datos_productos[i].prod_Id == datos_pedidos_productos[index].prod_Id) {
                  this.existenciasProductosServices.srvObtenerLista().subscribe(datos_existencias => {
                    for (let e = 0; e < datos_existencias.length; e++) {
                      if (datos_productos[i].prod_Id == datos_existencias[e].prod_Id) {
                        this.estadosService.srvObtenerListaEstados().subscribe(datos_estados => {
                          for (let j = 0; j < datos_estados.length; j++) {
                            if (datos_estados[j].estado_Id == datos_pedidos.estado_Id) {
                              this.usuarioService.srvObtenerListaPorId(datos_pedidos.usua_Id).subscribe(datos_usuarios => {
                                this.sedesClientesService.srvObtenerListaPorId(datos_pedidos.sedeCli_Id).subscribe(datos_sedes => {
                                  this.clientesService.srvObtenerListaPorId(datos_sedes.cli_Id).subscribe(datos_clientes => {
                                    this.tipoClientService.srvObtenerListaPorId(datos_clientes.tpCli_Id).subscribe(datos_tipoCliente =>{
                                      for (let k = 0; k < this.productosPedidos.length; k++) {

                                        let FechaCreacionDatetime = datos_pedidos.pedExt_FechaCreacion;
                                        let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T");
                                        let fechaCreacionFinal = FechaCreacionDatetime.substring(0, FechaCreacionNueva);

                                        let FechaEntregaDatetime = datos_pedidos.pedExt_FechaEntrega;
                                        let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
                                        let fechaEntregaFinal = FechaEntregaDatetime.substring(0, FechaEntregaNueva);

                                        const pdfDefinicion : any = {
                                          info: {
                                            title: `${datos_pedidos.pedExt_Id}`
                                          },
                                          content : [
                                            {
                                              text: `Plasticaribe S.A.S ---- Orden de Pedidos de Productos`,
                                              alignment: 'center',
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
                                              text: `Vendedor: ${datos_usuarios.usua_Nombre}\n`,
                                              alignment: 'right',
                                              style: 'header',
                                            },
                                            {
                                              text: `Estado del pedido: ${datos_estados[j].estado_Nombre}\n \n`,
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
                                                    `ID: ${datos_clientes.cli_Id}`,
                                                    `Tipo de ID: ${datos_clientes.tipoIdentificacion_Id}`,
                                                    `Tipo de Cliente: ${datos_tipoCliente.tpCli_Nombre}`
                                                  ],
                                                  [
                                                    `Nombre: ${datos_clientes.cli_Nombre}`,
                                                    `Telefono: ${datos_clientes.cli_Telefono}`,
                                                    `Ciudad: ${datos_sedes.sedeCliente_Ciudad}`
                                                  ],
                                                  [
                                                    `Dirección: ${datos_sedes.sedeCliente_Direccion}`,
                                                    `Codigo Postal: ${datos_sedes.sedeCli_CodPostal}`,
                                                    ``
                                                  ]
                                                ]
                                              },
                                              layout: 'lightHorizontalLines',
                                              fontSize: 9,
                                            },
                                            {
                                              text: `\n \nObervación sobre el pedido: \n ${datos_pedidos.pedExt_Observacion}\n`,
                                              style: 'header',
                                            },
                                            {
                                              text: `\n Información detallada de producto(s) pedido(s) \n `,
                                              alignment: 'center',
                                              style: 'header'
                                            },

                                            this.table(this.productosPedidos, ['Id', 'Nombre', 'Ancho', 'Fuelle', 'Cal', 'Largo', 'Und', 'Tipo', 'Cant', 'UndCant', 'PrecioUnd', 'SubTotal']),

                                            {
                                              text: `\n\nValor Total Pedido: $${this.formatonumeros(datos_pedidos.pedExt_PrecioTotal)}`,
                                              alignment: 'right',
                                              style: 'header',
                                            },
                                            {
                                              text: `Tipo de moneda: ${this.productosPedidos[k].Moneda}`,
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
                                    });
                                  });
                                });
                              });
                              break;
                            }
                          }
                        });
                        break;
                      }
                    }
                  });
                  break;
                }
              }
            });
            break;
          }
        }
      });
    });

  }

  // Funcion que llena el array con los productos que pertenecen al pedido que se consulta
  llenarProductoPedido(formulario : any){
    let id : any = formulario.pedExt_Id
    this.productosPedidos = [];

    this.pedidoproductoService.srvObtenerListaPorId(id).subscribe(datos_pedidos => {
      this.PedidoProductosService.srvObtenerLista().subscribe(datos_pedidos_productos => {
        for (let index = 0; index < datos_pedidos_productos.length; index++) {
          if (datos_pedidos.pedExt_Id == datos_pedidos_productos[index].pedExt_Id) {
            this.productosServices.srvObtenerLista().subscribe(datos_productos => {
              for (let i = 0; i < datos_productos.length; i++) {
                if (datos_productos[i].prod_Id == datos_pedidos_productos[index].prod_Id) {
                  this.existenciasProductosServices.srvObtenerLista().subscribe(datos_existencias => {
                    for (let e = 0; e < datos_existencias.length; e++) {
                      if (datos_productos[i].prod_Id == datos_existencias[e].prod_Id) {
                        this.tiposProductosService.srvObtenerListaPorId(datos_productos[i].tpProd_Id).subscribe(datos_tipo => {
                          const producto : any = {
                            Id: datos_productos[i].prod_Id,
                            Nombre : datos_productos[i].prod_Nombre,
                            Ancho : datos_productos[i].prod_Ancho,
                            Fuelle : datos_productos[i].prod_Fuelle,
                            Largo: datos_productos[i].prod_Largo,
                            Cal : datos_productos[i].prod_Calibre,
                            Und : datos_productos[i].undMedACF,
                            Tipo : datos_tipo.tpProd_Nombre,
                            Cant : datos_pedidos_productos[index].pedExtProd_Cantidad,
                            UndCant : datos_pedidos_productos[index].undMed_Id,
                            PrecioUnd : this.formatonumeros(datos_pedidos_productos[index].pedExtProd_PrecioUnitario),
                            Moneda : datos_existencias[e].tpMoneda_Id,
                            Stock : datos_existencias[e].exProd_Cantidad,
                            SubTotal : this.formatonumeros(datos_pedidos_productos[index].pedExtProd_Cantidad * datos_pedidos_productos[index].pedExtProd_PrecioUnitario),
                          }
                          this.productosPedidos.push(producto);
                        });
                      }
                    }
                  });
                }
              }
            });
          }
        }
      });
    });
    this.llenarPDFConBD(formulario);
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
        if (this.enPedido === 'si') {
          this.eliminarProductoPedido(this.productoEliminado)
        }
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

    this.FormPedidoExternoProductos.patchValue({
      ProdId : formulario.Id,
      ProdNombre: formulario.Nombre,
      ProdAncho : formulario.Ancho,
      ProdFuelle : formulario.Fuelle,
      ProdCalibre : formulario.Cal,
      ProdUnidadMedidaACF : formulario.Und,
      ProdTipo : formulario.Tipo,
      ProdCantidad : formulario.Cant,
      ProdUnidadMedidaCant : formulario.UndCant,
      ProdPrecioUnd : formulario.PrecioUnd,
      ProdTipoMoneda : formulario.TpMoneda,
      ProdStock : formulario.Stock,
      ProdDescripcion : formulario.Produ_Descripcion
    });
  }

  // Funcion para guardar clientes en la base de datos
  insertarClientes(id : any, tipoId : any, nombre : any, telefono : string, email : any, tipoCliente : string, ciudadSede : any, vendedor : any, codigoPostal : number, direccionSede : any, sedeCLiID : any){

    let usuario : number;
    let Id_TipoCliente : number;
    this.tipoClientService.srvObtenerLista().subscribe(datos_tipoCliente => {
      for (let index = 0; index < datos_tipoCliente.length; index++) {
        if (datos_tipoCliente[index].tpCli_Nombre == tipoCliente) {
          Id_TipoCliente = datos_tipoCliente[index].tpCli_Id;
          this.usuarioService.srvObtenerListaUsuario().subscribe(datos_usuario => {
            for (let index = 0; index < datos_usuario.length; index++) {
              if (datos_usuario[index].usua_Nombre == vendedor) {
                usuario = datos_usuario[index].usua_Id;
                this.usuarioService.srvObtenerListaPorId(this.storage.get('Id')).subscribe(datos_usuarios => {
                  if (datos_usuarios.rolUsu_Id == 2) {
                    const datosClientes : modelCliente = {
                      Cli_Id: id,
                      TipoIdentificacion_Id : tipoId,
                      Cli_Nombre: nombre,
                      Cli_Telefono: telefono,
                      Cli_Email: email,
                      TPCli_Id: Id_TipoCliente,
                      Usua_Id: usuario,
                      Estado_Id : 8
                    }
                    this.clientesService.srvGuardar(datosClientes).subscribe(datos => {
                      Swal.fire('Cliente guardado con éxito!');
                    }, error => { console.log(error); });
                  }else if (datos_usuarios.rolUsu_Id == 1){
                    const datosClientes : modelCliente = {
                      Cli_Id: id,
                      TipoIdentificacion_Id : tipoId,
                      Cli_Nombre: nombre,
                      Cli_Telefono: telefono,
                      Cli_Email: email,
                      TPCli_Id: Id_TipoCliente,
                      Usua_Id: usuario,
                      Estado_Id : 1
                    }
                    this.clientesService.srvGuardar(datosClientes).subscribe(datos => {
                      Swal.fire('Cliente guardado con éxito!');
                    }, error => { console.log(error); });
                  }
                });
                break;
              }
            }
          });
        }
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
          Swal.fire('Sede de cliente guardada con éxito!');
        }, error => { console.log(error); });

      });
    }, error => {
      nuevoID = id +""+ 1;
      console.log(nuevoID);
      const datosSedess : any = {
        sedeCli_Id: nuevoID,
        SedeCliente_Ciudad: ciudadSede,
        SedeCliente_Direccion: direccionSede,
        SedeCli_CodPostal: codigoPostal,
        Cli_Id : id,
      }
      this.sedesClientesService.srvGuardar(datosSedess).subscribe(datos_sede => {
        Swal.fire('Sede de cliente guardada con éxito!');
      }, error => { console.log(error); });
    });
  }


















  // Funcion para guardar productos en la base de datos
  registrarProducto(id : any, nombre : any, ancho : any, fuelle : any, calibre : any, undMed : any, tpProducto : any, descripcion : any, cliente : any){
    let tipoProductos_nombre = tpProducto;
    let tipoProducto_Id : number;
    let clienteId : number;
    this.tiposProductosService.srvObtenerLista().subscribe(datos_tipoProducto => {
      for (let index = 0; index < datos_tipoProducto.length; index++) {
        if (tipoProductos_nombre == datos_tipoProducto[index].tpProd_Nombre) {
          tipoProducto_Id = datos_tipoProducto[index].tpProd_Id;

          this.usuarioService.srvObtenerListaPorId(this.storage.get('Id')).subscribe(datos_usuarios => {
            if (datos_usuarios.rolUsu_Id == 2) {
              const datosProductos : any = {
                Prod_Id: id,
                Prod_Nombre: nombre,
                Prod_Descripcion: descripcion,
                TpProd_Id: tipoProducto_Id,
                Prod_Peso_Bruto: 0,
                Prod_Peso_Neto: 0,
                UndMedPeso: undMed,
                Prod_Fuelle: fuelle,
                Prod_Ancho: ancho,
                Prod_Calibre: calibre,
                UndMedACF: undMed,
                Estado_Id: 9,
                Prod_Largo: 0,
              };
              this.clientesService.srvObtenerLista().subscribe(datos_clientes => {
                for (let i = 0; i < datos_clientes.length; i++) {
                  if (datos_clientes[i].cli_Nombre == cliente) {
                    clienteId = datos_clientes[i].cli_Id;
                    const clienteproducto : any = {
                      Cli_Id: clienteId,
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
                }
              });
            }else if (datos_usuarios.rolUsu_Id == 1){
              const datosProductos : any = {
                Prod_Id: id,
                Prod_Nombre: nombre,
                Prod_Descripcion: descripcion,
                TpProd_Id: tipoProducto_Id,
                Prod_Peso_Bruto: 0,
                Prod_Peso_Neto: 0,
                UndMedPeso: undMed,
                Prod_Fuelle: fuelle,
                Prod_Ancho: ancho,
                Prod_Calibre: calibre,
                UndMedACF: undMed,
                Estado_Id: 10,
                Prod_Largo: 0,
              };
              this.clientesService.srvObtenerLista().subscribe(datos_clientes => {
                for (let i = 0; i < datos_clientes.length; i++) {
                  if (datos_clientes[i].cli_Nombre == cliente) {
                    clienteId = datos_clientes[i].cli_Id;
                    const clienteproducto : any = {
                      Cli_Id: clienteId,
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
                }
              });
            }
          });
        }
      }
    });
  }

  // Funcion para guardarr las existencias de los productos en la base de datos
  registrarExistenciaProducto(id : any, cantidad : any, undMed2 : any, precio : any, precioFinal : string, moneda : any){
      const datosExistencias : any = {
        Prod_Id: id,
        ExProd_Cantidad: 0,
        TpBod_Id: 2,
        UndMed_Id: undMed2,
        ExProd_Precio: precio,
        ExProd_PrecioExistencia: precio * 0,
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
          title: `La existencia del producto ${id} ha sido creada correctamente`
        });
      }, error => { console.log(error)});
  }

  // Funcion para actualizar un producto
  actualizarProducto(){
    this.usuarioService.srvObtenerListaPorId(this.storage.get('Id')).subscribe(datos_usuarios => {
      this.tipoEstadoService.srvObtenerListaPorId(1).subscribe(datos_tiposEstados => {
        if (datos_usuarios.rolUsu_Id == 2){
          Swal.fire("No tine acceso a esta función");
        } else if (datos_usuarios.rolUsu_Id == 1){
          Swal.fire({
            title: '¿Está seguro de actualizar este producto?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Si, actualizar!'
          }).then((result) => {
            if (result.isConfirmed) {
              let id : number = this.FormPedidoExternoProductos.value.ProdId;
              let tipo_Id : number;
              this.tiposProductosService.srvObtenerLista().subscribe(datos_tipos => {
                for (let index = 0; index < datos_tipos.length; index++) {
                  if (datos_tipos[index].tpProd_Nombre == this.FormPedidoExternoProductos.value.ProdTipo) {
                    tipo_Id = datos_tipos[index].tpProd_Id
                  }
                }
              });

              this.productosServices.srvObtenerLista().subscribe(datos_productos => {
                this.existenciasProductosServices.srvObtenerLista().subscribe(datos_existencias => {
                  for (let i = 0; i < datos_existencias.length; i++) {
                    if (datos_existencias[i].prod_Id == id) {

                      const datosProducto = {
                        Prod_Id : id,
                        Prod_Nombre: this.FormPedidoExternoProductos.value.ProdNombre,
                        Prod_Descripcion: this.FormPedidoExternoProductos.value.ProdDescripcion,
                        TpProd_Id: tipo_Id,
                        Prod_Peso_Bruto: 0,
                        Prod_Peso_Neto: 0,
                        UndMedPeso: this.FormPedidoExternoProductos.value.ProdUnidadMedidaACF,
                        Prod_Fuelle: this.FormPedidoExternoProductos.value.ProdFuelle,
                        Prod_Ancho: this.FormPedidoExternoProductos.value.ProdAncho,
                        Prod_Calibre: this.FormPedidoExternoProductos.value.ProdCalibre,
                        UndMedACF: this.FormPedidoExternoProductos.value.ProdUnidadMedidaACF,
                        Estado_Id: 10,
                        Prod_Largo: this.FormPedidoExternoProductos.value.ProdLargo,
                      }

                      const datosExistencias = {
                        Prod_Id: id,
                        exProd_Id: datos_existencias[i].exProd_Id,
                        ExProd_Cantidad: this.FormPedidoExternoProductos.value.ProdStock,
                        UndMed_Id: this.FormPedidoExternoProductos.value.ProdUnidadMedidaACF,
                        TpBod_Id: datos_existencias[i].tpBod_Id,
                        ExProd_Precio: this.FormPedidoExternoProductos.value.ProdPrecioUnd,
                        ExProd_PrecioExistencia: datos_existencias[i].exProd_PrecioExistencia,
                        ExProd_PrecioSinInflacion: datos_existencias[i].exProd_PrecioSinInflacion,
                        ExProd_PrecioTotalFinal: datos_existencias[i].exProd_PrecioTotalFinal,
                        TpMoneda_Id: this.FormPedidoExternoProductos.value.ProdTipoMoneda,
                      }
                      this.productosServices.srvActualizar(id, datosProducto).subscribe(datos_productos => {
                        this.existenciasProductosServices.srvActualizar(datos_existencias[i].exProd_Id, datosExistencias).subscribe(datos_existencias => {
                          Swal.fire("¡Producto actualizado con exito!");
                        });
                      });
                      break;
                    }
                  }
                });
              });
            }
          });
        }
      });
    });
  }

  // Funcion para editar un pedido
  MostrarPedido(formulario : any) {
    this.enPedido = 'si';
    this.ArrayProducto = [];
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
        this.pedidoproductoService.srvObtenerListaPorId(this.id_pedido).subscribe(datos_pedidos => {
          this.PedidoProductosService.srvObtenerLista().subscribe(datos_pedidos_productos => {
            for (let index = 0; index < datos_pedidos_productos.length; index++) {
              if (datos_pedidos.pedExt_Id == datos_pedidos_productos[index].pedExt_Id) {
                this.productosServices.srvObtenerLista().subscribe(datos_productos => {
                  for (let i = 0; i < datos_productos.length; i++) {
                    if (datos_productos[i].prod_Id == datos_pedidos_productos[index].prod_Id) {
                      this.existenciasProductosServices.srvObtenerLista().subscribe(datos_existencias => {
                        for (let e = 0; e < datos_existencias.length; e++) {
                          if (datos_productos[i].prod_Id == datos_existencias[e].prod_Id) {
                            this.estadosService.srvObtenerListaEstados().subscribe(datos_estados => {
                              for (let j = 0; j < datos_estados.length; j++) {
                                if (datos_estados[j].estado_Id == datos_pedidos.estado_Id) {
                                  this.usuarioService.srvObtenerListaPorId(datos_pedidos.usua_Id).subscribe(datos_usuarios => {
                                    this.sedesClientesService.srvObtenerListaPorId(datos_pedidos.sedeCli_Id).subscribe(datos_sedes => {
                                      this.clientesService.srvObtenerListaPorId(datos_sedes.cli_Id).subscribe(datos_clientes => {
                                        let FechaCreacionDatetime = datos_pedidos.pedExt_FechaCreacion
                                        let FechaCreacionNueva = FechaCreacionDatetime.indexOf("T")
                                        this.fechaCreacion = FechaCreacionDatetime.substring(0, FechaCreacionNueva);

                                        let FechaEntregaDatetime = datos_pedidos.pedExt_FechaEntrega;
                                        let FechaEntregaNueva = FechaEntregaDatetime.indexOf("T");
                                        this.fechaEntrega = FechaEntregaDatetime.substring(0, FechaEntregaNueva);
                                        this.captarSedeSeleccionada();
                                        this.FormPedidoExternoClientes.patchValue({
                                          PedClienteNombre: datos_clientes.cli_Nombre,
                                          ciudad_sede: datos_sedes.sedeCliente_Ciudad,
                                          PedSedeCli_Id: datos_sedes.sedeCliente_Direccion,
                                          PedUsuarioNombre: datos_usuarios.usua_Nombre,
                                          PedFecha: this.fechaCreacion,
                                          PedFechaEnt: this.fechaEntrega,
                                          PedEstadoId: datos_estados[j].estado_Nombre,
                                          PedObservacion: datos_pedidos.pedExt_Observacion,
                                        });

                                        this.ciudadClienteComboBox();
                                        this.sedesClientesComboBox();
                                        this.tiposProductosService.srvObtenerListaPorId(datos_productos[i].tpProd_Id).subscribe(datos_tipo_producto => {
                                          let id = datos_productos[i].prod_Id;
                                          let nombre = datos_productos[i].prod_Nombre;
                                          let ancho = datos_productos[i].prod_Ancho;
                                          let fuelle = datos_productos[i].prod_Fuelle;
                                          let calibre = datos_productos[i].prod_Calibre;
                                          let largo = datos_productos[i].prod_Largo;
                                          let undMed = datos_productos[i].undMedACF;
                                          let tpProduct = datos_tipo_producto.tpProd_Nombre;
                                          let cantidad = datos_pedidos_productos[index].pedExtProd_Cantidad;
                                          let undMed2 = datos_pedidos_productos[index].undMed_Id;
                                          let precio = datos_pedidos_productos[index].pedExtProd_PrecioUnitario;
                                          let moneda = datos_existencias[e].tpMoneda_Id;
                                          let descripcion = datos_productos[i].prod_Descripcion
                                          this.llenarTablaProductosCreador(id, nombre, ancho, fuelle, calibre, largo, undMed, tpProduct, cantidad, undMed2, precio, moneda, descripcion);
                                        });
                                      });
                                    });
                                  });
                                }
                              }
                            });
                          }
                        }
                      });
                    }
                  }
                });
              }
            }
          });
        });
      }
    });
  }

  // Función para editar uno de los pedidos
  editarPedido() {
    this.enPedido = 'no';
    this.id_pedido;
    let estadoNombre : string = this.FormPedidoExternoClientes.value.PedEstadoId;
    let estadoId : number = 0;
    let usuarioNombre : string = this.FormPedidoExternoClientes.value.PedUsuarioNombre;
    let usuarioId : number = 0;
    let idProducto = [];
    let productoArray = [];
    let info_producto = [];
    let direccionSede : string = this.FormPedidoExternoClientes.value.PedSedeCli_Id;
    let idSede : number;

    this.sedesClientesService.srvObtenerLista().subscribe(datos_sede =>{
      for (let sede = 0; sede < datos_sede.length; sede++) {
        if(direccionSede === datos_sede[sede].sedeCliente_Direccion) {
          idSede = datos_sede[sede].sedeCli_Id;

          //Inicialmente se consulta la tabla de estados para compararlo mas adelante con el estado del pedido que se esta actualizando
          this.estadosService.srvObtenerListaEstados().subscribe(datos_estado => {
            for (let index = 0; index < datos_estado.length; index++) {
              if (datos_estado[index].estado_Nombre == estadoNombre) {
                estadoId = datos_estado[index].estado_Id;

                //Consultamos el usuario que esta digitado en la vista para luego pasarselo a la informacion actualizada del pedido
                this.usuarioService.srvObtenerListaUsuario().subscribe(datos_usuario => {
                  for (let usu = 0; usu < datos_usuario.length; usu++) {
                    if (datos_usuario[usu].usua_Nombre == usuarioNombre) {
                      usuarioId = datos_usuario[usu].usua_Id;

                      //Empezamos a llenar la informacion del pedido actualizado
                      const camposPedido : any = {
                        PedExt_Id : this.id_pedido,
                        PedExt_FechaCreacion:  this.FormPedidoExternoClientes.get('PedFecha')?.value,
                        PedExt_FechaEntrega: this.FormPedidoExternoClientes.get('PedFechaEnt')?.value,
                        Empresa_Id: this.EmpresaVendedora,
                        SedeCli_Id: idSede,
                        Estado_Id: estadoId,
                        Usua_Id: usuarioId,
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
                            productoArray.push(this.ArrayProducto[prod]);
                          }
                          //Validamos el estado del pedido (2: En proceso, 5: Finalizado, 6: Iniciado)
                          if (estadoId == 2 || estadoId == 5 || estadoId == 6) {
                            //Empezamos a tomar la informacion del cliente para actualizarlo
                            this.sedesClientesService.srvObtenerListaPorId(this.IDSedeSeleccionada).subscribe(datos_sede => {
                              this.clientesService.srvObtenerListaPorId(datos_sede.cli_Id).subscribe(datos_cliente => {
                                const datosClienteActualizado : any = {
                                  Cli_Id: datos_cliente.cli_Id,
                                  TipoIdentificacion_Id : datos_cliente.tipoIdentificacion_Id,
                                  Cli_Nombre: datos_cliente.cli_Nombre,
                                  Cli_Telefono: datos_cliente.cli_Telefono,
                                  Cli_Email: datos_cliente.cli_Email,
                                  TPCli_Id: datos_cliente.tpCli_Id,
                                  Usua_Id: datos_cliente.usua_Id,
                                  Estado_Id : 1,
                                }
                                this.clientesService.srvActualizar(datos_cliente.cli_Id, datosClienteActualizado).subscribe(cliente_Actualizado => {});

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
                                        Prod_Largo: 0
                                      }
                                      this.productosServices.srvActualizar(item, datosProducto).subscribe(datos_producto_actualizado => {}, error => {console.log(error);});
                                    }

                                    /*Luego se consulta la tabla de Clientes_Productos para saber si los productos que estan en el pedido
                                    tiene una relacion con el cliente, sino es asi entonces se insertará una nueva relacion */
                                    this.ClientesProductosService.srvObtenerListaPorId(datos_cliente.cli_Id, item).subscribe(datos_clienteProductos => {
                                      console.log(datos_clienteProductos)
                                    }, error => {
                                      const clienteProductos : any = {
                                        Cli_Id: datos_cliente.cli_Id,
                                        Prod_Id: item,
                                      }
                                      this.ClientesProductosService.srvGuardar(clienteProductos).subscribe(datos_clienteProductos => {});
                                    });

                                    /*Finalmente se procede con la tabla PedidosExternos_Productos en la que se podrá actualizar, eliminar e insertar datos.
                                    Para esto primero consultamos por el producto y el pedido, si estos existen los actualizará, sino existen los gusradará
                                    Pero si un producto de la tabla es eliminado este deberá eliminarse de la base de datos */
                                    this.PedidoProductosService.srvObtenerListaPorId(item, this.id_pedido).subscribe(datos_productosPedidos => {
                                      for (const productoPedido of productoArray) {
                                        const datosProductosPedidos : any = {
                                          Prod_Id: item,
                                          PedExt_Id: this.id_pedido,
                                          PedExtProd_Cantidad : productoPedido.Cant,
                                          UndMed_Id : productoPedido.UndCant,
                                          PedExtProd_PrecioUnitario : productoPedido.PrecioUnd
                                        }
                                        this.PedidoProductosService.srvActualizar(item, this.id_pedido, datosProductosPedidos).subscribe(datos_productosPedidosActualizado => {});
                                      }
                                    }, error => {
                                      for (const productoPedido of productoArray) {
                                        const datosProductosPedidos : any = {
                                          Prod_Id: item,
                                          PedExt_Id: this.id_pedido,
                                          PedExtProd_Cantidad : productoPedido.Cant,
                                          UndMed_Id : productoPedido.UndCant,
                                          PedExtProd_PrecioUnitario : productoPedido.PrecioUnd
                                        }
                                        this.PedidoProductosService.srvGuardar(datosProductosPedidos).subscribe(datos_productosPedidosActualizado => {});
                                      }
                                    });
                                  });
                                }
                              });
                            });

                          //Si el estado llega a ser (9: En pedido) solo se podrán agregar productos al pedido
                          } else if (estadoId == 11){
                            for (let prod = 0; prod < this.ArrayProducto.length; prod++) {
                              idProducto.push(this.ArrayProducto[prod].Id);
                              productoArray.push(this.ArrayProducto[prod]);

                              this.PedidoProductosService.srvObtenerListaPorId(this.ArrayProducto[prod].Id, this.id_pedido).subscribe(datos_productosPedidos => {
                                for (const productoPedido of productoArray) {
                                  const datosProductosPedidos : any = {
                                    Prod_Id: this.ArrayProducto[prod].Id,
                                    PedExt_Id: this.id_pedido,
                                    PedExtProd_Cantidad : productoPedido.Cant,
                                    UndMed_Id : productoPedido.UndCant,
                                    PedExtProd_PrecioUnitario : productoPedido.PrecioUnd
                                  }
                                  this.PedidoProductosService.srvActualizar(this.ArrayProducto[prod].Id, this.id_pedido, datosProductosPedidos).subscribe(datos_productosPedidosActualizado => {});
                                }
                              }, error => {
                                for (const productoPedido of productoArray) {
                                  const datosProductosPedidos : any = {
                                    Prod_Id: this.ArrayProducto[prod].Id,
                                    PedExt_Id: this.id_pedido,
                                    PedExtProd_Cantidad : productoPedido.Cant,
                                    UndMed_Id : productoPedido.UndCant,
                                    PedExtProd_PrecioUnitario : productoPedido.PrecioUnd
                                  }
                                  this.PedidoProductosService.srvGuardar(datosProductosPedidos).subscribe(datos_productosPedidosActualizado => {});
                                }
                              });
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
                    }
                  }
                });
              }
            }
          });
        }
      }
    });
  }

  //Funcion que se encarga de tomar el producto eliminado de la tabla en la vista y eliminarlo en la base de datos
  eliminarProductoPedido(item : number){
    this.PedidoProductosService.srvObtenerListaPorId(item, this.id_pedido).subscribe(datos_productosPedidos => {
      this.PedidoProductosService.srvEliminar(item, this.id_pedido).subscribe(datos_productosPedidos_eliminado => {});
    });
  }

  //Funcion que crea un pdf del pedido una vez es actualizado
  crearpdfPedidoActualizado(idPedido : number){
    this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidos => {
      this.clientesService.srvObtenerLista().subscribe(datos_clientes => {
        for (let cli = 0; cli < datos_clientes.length; cli++) {
          if (datos_clientes[cli].cli_Nombre == this.FormPedidoExternoClientes.value.PedClienteNombre) {
            for (let index = 0; index < this.ArrayProducto.length; index++) {
              this.sedesClientesService.srvObtenerLista().subscribe(datos_sedeCliente => {
                for (let sede = 0; sede < datos_sedeCliente.length; sede++) {
                  if (datos_sedeCliente[sede].sedeCliente_Direccion == this.FormPedidoExternoClientes.value.PedSedeCli_Id) {
                    const pdfDefinicion : any = {
                      info: {
                        title: `${idPedido}`
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
                                `ID: ${datos_clientes[cli].cli_Id}`,
                                `Tipo de ID: ${datos_clientes[cli].tipoIdentificacion_Id}`,
                                `Tipo de Cliente: ${datos_clientes[cli].tpCli_Id}`
                              ],
                              [
                                `Nombre: ${this.FormPedidoExternoClientes.value.PedClienteNombre}`,
                                `Telefono: ${datos_clientes[cli].cli_Telefono}`,
                                `Ciudad: ${datos_sedeCliente[sede].sedeCliente_Ciudad}`
                              ],
                              [
                                `Dirección: ${datos_sedeCliente[sede].sedeCliente_Direccion}`,
                                `Codigo Postal: ${datos_sedeCliente[sede].sedeCli_CodPostal}`,
                                ``
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

                        this.table(this.ArrayProducto, ['Id', 'Nombre', 'Ancho', 'Fuelle', 'Cal', 'Largo', 'Und', 'Tipo', 'Cant', 'UndCant', 'PrecioUnd', 'SubTotal']),

                        {
                          text: `\n\nValor Total Pedido: $${this.valorTotal}`,
                          alignment: 'right',
                          style: 'header',
                        },
                        {
                          text: `Tipo de moneda: ${this.ArrayProducto[index].TpMoneda}`,
                          alignment: 'right',
                          style: 'header',
                        }
                      ],
                      styles: {
                        header: {
                          fontSize: 9,
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
                }
              });
              break;
            }
          }
        }
      });
    });
  }

  notifyMe() {
    //Vamos a comprobar si el navegador es compatible con las notificaciones
    if (!("Notification" in window)) {
      alert("No es compatible");
    }
    // Vamos a ver si ya se han concedido permisos de notificación
    else if (Notification.permission === "granted") {
      // Si está bien vamos a crear una notificación
      let body = "Hola";

      let title = "Notificación";
      let notification = new Notification(title);

      notification.onclick = function () {
          //action
      };
      setTimeout(notification.close.bind(notification), 5000);
    }
    // De lo contrario, tenemos que pedir permiso al usuario
    else if (Notification.permission !== 'denied') {
      Notification.requestPermission(function (permission) {
        // Si el usuario acepta, vamos a crear una notificación
        if (permission === "granted") {
          var notification = new Notification( "Ahora podras recibir notifiaciones");
        }
      });
    }
  }


}
