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
import { ThisReceiver } from '@angular/compiler';
import { ClientesProductosService } from 'src/app/Servicios/ClientesProductos.service';


pdfMake.vfs = pdfFonts.pdfMake.vfs;


@Component({
  selector: 'app.opedidoproducto.component',
  templateUrl: './opedidoproducto.component.html',
  styleUrls: ['./opedidoproducto.component.css']
})

export class OpedidoproductoComponent implements OnInit {

  public FormPedidoExternoClientes !: FormGroup; //Formulario de pedidos
  public FormPedidoExternoProductos!: FormGroup;
  public FormSedesClientes !: FormGroup;
  public FormConsultaPedidoExterno !: FormGroup;
  public page : number;
  titulo = 'Generar PDF con Angular JS 5';
  imagen1 = 'assets/img/tc.jpg';

  AccionBoton = "Agregar";
  Ide : number | undefined;


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
  undMed:UnidadMedidaService[]=[];
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
  valorTotal=[];
  EmpresaVendedora=[];
  EstadoDocumentos= [];
  EstadoDeDocumentos : any;
  SedeSeleccionada: any;
  IDSedeSeleccionada : any;
  UsuarioSeleccionado : any;

  pedidosID = [];

  datosPDF : any;

  pages: number = 1;
  dataset: any[] = ['1','2','3','4','5','6','7','8','9','10'];

  storage_Id : number;
  storage_Nombre : any;
  storage_Rol : any;

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
      ProdUnidadMedidaACF: new FormControl(),
      ProdTipo: new FormControl(),
      ProdCantidad: new FormControl(),
      ProdUnidadMedidaCant: new FormControl(),
      ProdPrecioUnd: new FormControl(),
      ProdTipoMoneda: new FormControl(),
      ProdStock: new FormControl(),
      ProdDescripcion: new FormControl(),
    });

    this.FormConsultaPedidoExterno = this.frmBuilderPedExterno.group({
      PedExtIdConsulta: new FormControl(),
      PedExtFechaConsulta: new FormControl(),
      PedExtFechaEntregaConsulta: new FormControl(),
      // PedExtEstadoConsulta: new FormControl(),
      // PedExtUsuarioConsulta: new FormControl(),
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
    this.PruebaInsercion();
    this.lecturaStorage();
    this.usuarioComboBox();
  }

  lecturaStorage(){
    this.storage_Id = this.storage.get('Id');
    this.storage_Nombre = this.storage.get('Nombre');
    let rol = this.storage.get('Rol');
    this.rolService.srvObtenerLista().subscribe(datos_roles => {
      for (let index = 0; index < datos_roles.length; index++) {
        if (datos_roles[index].rolUsu_Id == rol) {
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
       ProdId: [,''],
       ProdNombre: [,''],
       ProdAncho: [,''],
       ProdFuelle: [,''],
       ProdCalibre: [,''],
       ProdUnidadMedidaACF: [,''],
       ProdTipo: [,''],
       ProdCantidad: ['', Validators.required],
       ProdUnidadMedidaCant: ['', Validators.required],
       ProdPrecioUnd: ['', Validators.required],
       ProdTipoMoneda: ['', Validators.required],
       ProdStock: ['', Validators.required],
       ProdDescripcion: [,''],


    });

    this.FormConsultaPedidoExterno = this.frmBuilderPedExterno.group({
      PedExtIdConsulta: [, Validators.required],
      // PedExtFechaConsulta: [, Validators.required],
      // PedExtFechaEntregaConsulta: [, Validators.required],
      // PedExtEstadoConsulta: [, Validators.required],
      // PedExtUsuarioConsulta : ['',],
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
    if(this.FormPedidoExternoProductos.valid) this.cargarFormProductoEnTablas();
    else Swal.fire("Hay campos vacios en el formulario de producto");
  }

  // Funcion que limpia los todos los campos de la vista
  LimpiarCampos() {
    this.FormPedidoExternoClientes.reset();
    this.FormPedidoExternoProductos.reset();
    // this.ArrayProducto = [];
    // this.valorTotal = [];
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
          }
        }
      });
    });
  }

  ciudadClienteComboBox(){
    this.ciudad = [];
    this.sedeCliente=[];
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
            });
          });
        }
      }
    });
  }

  usuarioComboBox(){
    this.usuarioService.srvObtenerListaUsuario().subscribe(datos_usuarios => {
      for (let index = 0; index < datos_usuarios.length; index++) {
        this.usuarios.push(datos_usuarios[index].usua_Nombre);
        
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
            this.estado.push(datos_estados[index].estado_Nombre);

          }
        }
      }, error =>{ console.log("error"); });
    });
  }

  // Funcion para cargar los productos de un solo cliente
  productoCliente(){
    this.producto = [];
    let nombre_Cliente : string = this.FormPedidoExternoClientes.value.PedClienteNombre
    let id_cliente : number;
    this.clientesService.srvObtenerLista().subscribe(datos_clientes => {
      for (let i = 0; i < datos_clientes.length; i++) {
        if (datos_clientes[i].cli_Nombre == nombre_Cliente) {
          id_cliente = datos_clientes[i].cli_Id;
        }        
      }
      this.ClientesProductosService.srvObtenerLista().subscribe(datos_clientesProductos => {
        for (let index = 0; index < datos_clientesProductos.length; index++) {
          if (datos_clientesProductos[index].cli_Id == id_cliente) {
            this.productosServices.srvObtenerListaPorId(datos_clientesProductos[index].prod_Id).subscribe(datos_productos => {
              this.producto.push(datos_productos);
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

  // Funcion para llenar los datos de los productos en cada uno de los campos
  llenadoProducto(){
    this.productoInfo = [];

    // Producto
    let nombreProducto : string = this.FormPedidoExternoProductos.value.ProdNombre;
    this.productosServices.srvObtenerLista().subscribe(datos_productos => {
      this.productoInfo = [];
      for (let p = 0; p < datos_productos.length; p++) {
        if (nombreProducto == datos_productos[p].prod_Nombre) {
          this.productoInfo.push(datos_productos[p]);

          // Tipo de Producto
          this.tiposProductosService.srvObtenerLista().subscribe(datos_tiposProductos => {
            for (let tpProdu = 0; tpProdu < datos_tiposProductos.length; tpProdu++) {
              if (datos_tiposProductos[tpProdu].tpProd_Id == datos_productos[p].tpProd_Id) {
                this.tipoProducto.push(datos_tiposProductos[tpProdu].tpProd_Nombre);

                this.FormPedidoExternoProductos.setValue({
                  ProdId: `${datos_productos[p].prod_Id}`,
                  ProdNombre: `${this.FormPedidoExternoProductos.value.ProdNombre}`,
                  ProdAncho: `${datos_productos[p].prod_Ancho}`,
                  ProdFuelle: `${datos_productos[p].prod_Fuelle}`,
                  ProdCalibre: `${datos_productos[p].prod_Calibre}`,
                  ProdUnidadMedidaACF: `${datos_productos[p].undMedACF}`,
                  ProdTipo: `${datos_tiposProductos[tpProdu].tpProd_Nombre}`,
                  ProdCantidad: `${this.FormPedidoExternoProductos.value.ProdCantidad}`,
                  ProdUnidadMedidaCant: `${this.FormPedidoExternoProductos.value.ProdUnidadMedidaCant}`,
                  ProdPrecioUnd: ``,
                  ProdTipoMoneda: ``,
                  ProdStock: ``,
                  ProdDescripcion: `${datos_productos[p].prod_Descripcion}`,
                });

                // Existencias
                this.existenciasProductosServices.srvObtenerLista().subscribe(datos_existencias => {
                  for (let e = 0; e < datos_existencias.length; e++) {
                    if (datos_productos[p].prod_Id == datos_existencias[e].prod_Id) {
                      this.tipoMoneda = [];
                      this.existenciasProductos.push(datos_existencias[e]);

                      // Tipo de Moneda
                      this.tipoMonedaService.srvObtenerLista().subscribe(datos_tiposMoneda => {
                        for (let index = 0; index < datos_tiposMoneda.length; index++) {
                          if (datos_existencias[e].tpMoneda_Id == datos_tiposMoneda[index].tpMoneda_Id) {
                            this.tipoMoneda.push(datos_tiposMoneda[index].tpMoneda_Id);

                            this.unidadMedidaService.srvObtenerLista().subscribe(datos_unidadMedida => {
                              for (let und = 0; und < datos_unidadMedida.length; und++) {
                                if (datos_productos[p].undMedACF == datos_unidadMedida[und].undMed_Id) {
                                  this.undMed.push(datos_unidadMedida[und].undMed_Id);

                                  // Llenado de formulario
                                  this.FormPedidoExternoProductos.setValue({
                                    ProdId: `${datos_productos[p].prod_Id}`,
                                    ProdNombre: `${this.FormPedidoExternoProductos.value.ProdNombre}`,
                                    ProdAncho: `${datos_productos[p].prod_Ancho}`,
                                    ProdFuelle: `${datos_productos[p].prod_Fuelle}`,
                                    ProdCalibre: `${datos_productos[p].prod_Calibre}`,
                                    ProdUnidadMedidaACF: `${datos_productos[p].undMedACF}`,
                                    ProdTipo: `${datos_tiposProductos[tpProdu].tpProd_Nombre}`,
                                    ProdCantidad: `${this.FormPedidoExternoProductos.value.ProdCantidad}`,
                                    ProdUnidadMedidaCant: `${this.FormPedidoExternoProductos.value.ProdUnidadMedidaCant}`,
                                    ProdPrecioUnd: `${datos_existencias[e].exProd_Precio}`,
                                    ProdTipoMoneda: `${datos_tiposMoneda[index].tpMoneda_Id}`,
                                    ProdStock: `${datos_existencias[e].exProd_Cantidad}`,
                                    ProdDescripcion: `${datos_productos[p].prod_Descripcion}`,
                                  });
                                  break;
                                }else {
                                  this.undMed = [];
                                  
                                }
                              }
                            });
                            continue;
                          }else{
                            this.tipoMoneda = [];
                            this.tipoMonedaComboBox();
                          }
                        }
                      });
                    }
                  }
                });
                continue;
              }else {
                this.tipoProducto = [];
                this.tipoProductoComboBox();
              }
            }
          });
        }
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

    // if (this.FormConsultaPedidoExterno.valid) {
      
    // } else if (this.FormConsultaPedidoExterno.value.PedExtEstadoConsulta != null) {
    //   console.log(2)
    //   this.pedidosProductos = [];
    //   this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidos => {
    //     for (let index = 0; index < datos_pedidos.length; index++) {
    //       this.estadosService.srvObtenerListaEstados().subscribe(datos_estados => {
    //         for (let i = 0; i < datos_estados.length; i++) {
    //           if (datos_estados[i].estado_Nombre == this.FormConsultaPedidoExterno.value.PedExtEstadoConsulta) {
    //             this.sedesClientesService.srvObtenerListaPorId(datos_pedidos[index].sedeCli_Id).subscribe(datos_sedes => {
    //               this.clientesService.srvObtenerListaPorId(datos_sedes.cli_Id).subscribe(datos_clientes => {
    //                 this.usuarioService.srvObtenerListaPorId(this.storage_Id).subscribe(datos_usuarios => {
    //                   if (datos_usuarios.rolUsu_Id == 2) {
    //                     if (datos_usuarios.usua_Nombre == this.storage_Nombre) {
    //                       if (datos_pedidos[index].usua_Id == datos_usuarios.usua_Id) this.pedidosProductos.push(datos_pedidos[index]);
    //                       else Swal.fire("No tiene acceso a este pedido");
    //                     }
    //                   } else if (datos_usuarios.rolUsu_Id == 1) this.pedidosProductos.push(datos_pedidos[index]);
    //                 });
    //               });
    //             });
    //             break;
    //           }
    //         }
    //       });
    //     }
    //   });
    // }
    // else if (this.FormConsultaPedidoExterno.value.PedExtIdConsulta != "") {
    //   console.log(1)
    //   this.pedidosProductos = [];
    //   this.pedidoproductoService.srvObtenerListaPorId(this.FormConsultaPedidoExterno.value.PedExtIdConsulta).subscribe(datos_pedidos => {
    //     this.sedesClientesService.srvObtenerListaPorId(datos_pedidos.sedeCli_Id).subscribe(datos_sedes => {
    //       this.clientesService.srvObtenerListaPorId(datos_sedes.cli_Id).subscribe(datos_clientes => {
    //         this.usuarioService.srvObtenerListaPorId(this.storage_Id).subscribe(datos_usuarios => {
    //           if (datos_usuarios.rolUsu_Id == 2) {
    //             if (datos_usuarios.usua_Nombre == this.storage_Nombre) {
    //               if (datos_pedidos.usua_Id == datos_usuarios.usua_Id) this.pedidosProductos.push(datos_pedidos);
    //               else Swal.fire("No tiene acceso a este pedido");
    //             }
    //           } else if (datos_usuarios.rolUsu_Id == 1) this.pedidosProductos.push(datos_pedidos);
    //         });
    //       });
    //     });
    //   });
    // } 

    // this.pedidosProductos = [];
    // this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidos => {
    //   for (let index = 0; index < datos_pedidos.length; index++) {
    //     this.sedesClientesService.srvObtenerListaPorId(datos_pedidos[index].sedeCli_Id).subscribe(datos_sedes => {          
    //       this.clientesService.srvObtenerListaPorId(datos_sedes.cli_Id).subscribe(datos_clientes => {
    //         this.usuarioService.srvObtenerListaPorId(this.storage_Id).subscribe(datos_usuarios => {
    //           this.estadosService.srvObtenerListaPorId(datos_pedidos[index].estado_Id).subscribe(datos_estados => {
    //               if (this.FormConsultaPedidoExterno.valid) {
                      
    //               } else if (this.FormConsultaPedidoExterno.value.PedExtIdConsulta == datos_pedidos[index].pedExt_Id){      
    //                 // Consulta por el ID del pedido
    //                 if (datos_usuarios.rolUsu_Id == 2) {
    //                   if (datos_pedidos[index].usua_Id == datos_usuarios.usua_Id) this.pedidosProductos.push(datos_pedidos[index]);
    //                   else Swal.fire("No tiene acceso a este pedido");
    //                 }else if (datos_usuarios.rolUsu_Id == 1) {
    //                   this.pedidosProductos.push(datos_pedidos[index]);
    //                   console.log(datos_pedidos[index])
    //                 }

    //               } else if (this.FormConsultaPedidoExterno.value.PedExtEstadoConsulta == datos_pedidos[index].estado_Id){
    //                 // Consulta por el Estado del pedido
                    
    //               }
    //           })
    //         });
    //       }, error => { console.log(error)});
          
    //     }, error => { console.log(error)});
    //   }
    // }, error => { console.log(error)});
    if(this.FormConsultaPedidoExterno.valid) {
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListaPorId(this.FormConsultaPedidoExterno.value.PedExtIdConsulta).subscribe(datos_pedidos => {
        this.sedesClientesService.srvObtenerListaPorId(datos_pedidos.sedeCli_Id).subscribe(datos_sedes => {
          this.clientesService.srvObtenerListaPorId(datos_sedes.cli_Id).subscribe(datos_clientes => {
            this.usuarioService.srvObtenerListaPorId(this.storage_Id).subscribe(datos_usuarios => {
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
    }else {
      this.pedidosProductos = [];
      this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          this.sedesClientesService.srvObtenerListaPorId(datos_pedidos[index].sedeCli_Id).subscribe(datos_sedes => {
            this.clientesService.srvObtenerListaPorId(datos_sedes.cli_Id).subscribe(datos_clientes => {
              this.usuarioService.srvObtenerListaPorId(this.storage_Id).subscribe(datos_usuarios => {
                if (datos_usuarios.rolUsu_Id == 2) {
                  if (datos_usuarios.usua_Nombre == this.storage_Nombre) {
                    if (datos_pedidos[index].usua_Id == datos_usuarios.usua_Id) this.pedidosProductos.push(datos_pedidos[index]);
                  }
                } else if (datos_usuarios.rolUsu_Id == 1){
                  this.pedidosProductos.push(datos_pedidos[index]);
                } 
                this.pedidosProductos.sort();
              });
            });
          });
        }
      });
    }
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
      if (result.isConfirmed) {
        window.location.href = "./";
      } else if (result.isDenied) {
        
      }
    })
  }

  //Se obtiene el ultimo codigo del pedido y se incrementa en 1. (Contador)
  ObtenerUltimoPedido() {
    let ultimoCodigoPedido : number;

    this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(dataPedExternos =>{
      for (let index = 0; index < dataPedExternos.length; index++) {

        ultimoCodigoPedido = dataPedExternos[index].pedExt_Codigo;
        this.contadorPedidosExternos = ultimoCodigoPedido + 1

        //console.log('Ultimo codigo pedido: ' + ultimoCodigoPedido );
        //console.log('Ultimo codigo Pedido a guardar: ' + this.contadorPedidosExternos);
        //console.log(this.contadorPedidosExternos);
  }
    });
  }

  eventoEnterInput(dato : any) {
    dato = "Mundo"

    console.log("Hola " + dato);
  }

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
      pUndMedCant : "Und. Cant",
      pPrecioU : "Precio U",
      pMoneda : "Moneda",
      pStock : "Stock",
      pDescripcion : "Descripción",
      pSubtotal : "Subtotal",
    }]
  }

  PruebaInsercion() {
    let ID : number;
    let Nombre : string;
    let Numero : number;

    this.Registro = [
      {ID : 1, Valores: [Nombre = 'Haider', Numero=5]},
      {ID : 2, Valores: [Nombre = 'Haidercc', Numero=6]},
      {ID : 3, Valores: [Nombre = 'Haider10', Numero=10]},
      {ID : 4, Valores: [Nombre = 'Haider11', Numero=11]}
    ]

  //  this.titulosTabla = []
  }

  //Carga productos en tabla.
  cargarFormProductoEnTablas(){

    let productoExt : any = {
      Id : this.FormPedidoExternoProductos.get('ProdId')?.value,
      Nombre : this.FormPedidoExternoProductos.get('ProdNombre').value,
      Ancho : this.FormPedidoExternoProductos.get('ProdAncho').value,
      Fuelle : this.FormPedidoExternoProductos.get('ProdFuelle').value,
      Cal : this.FormPedidoExternoProductos.get('ProdCalibre').value,
      Und : this.FormPedidoExternoProductos.get('ProdUnidadMedidaACF').value,
      Tipo : this.FormPedidoExternoProductos.get('ProdTipo').value,
      Cant : this.FormPedidoExternoProductos.get('ProdCantidad').value,
      UndCant : this.FormPedidoExternoProductos.get('ProdUnidadMedidaCant')?.value,
      PrecioUnd : this.FormPedidoExternoProductos.get('ProdPrecioUnd').value,
      TpMoneda : this.FormPedidoExternoProductos.get('ProdTipoMoneda').value,
      Stock : this.FormPedidoExternoProductos.get('ProdStock').value,
      Produ_Descripcion : this.FormPedidoExternoProductos.get('ProdDescripcion').value,
      SubTotal : this.FormPedidoExternoProductos.get('ProdCantidad').value * this.FormPedidoExternoProductos.get('ProdPrecioUnd')?.value
    }
    //console.log(this.ArrayProducto.length)

    if(this.ArrayProducto.length == 0) {
      this.ArrayProducto.push(productoExt);
      this.LimpiarCamposProductos();

      productoExt = []; //Vaciar lo que viene del formulario.

    } else { //Si el array que llena la tabla no esta vacío.

      for (let index = 0; index < this.ArrayProducto.length; index++) {

        if(productoExt.Id === this.ArrayProducto[index].Id) { //Verifico si campo y form en posicion ID son iguales
          Swal.fire('Evite cargar datos duplicados a la tabla. Verifique!');
          console.log('Estan repetidos ' + productoExt.Id + ' - ' +  this.ArrayProducto[index].Id);
          break;
        } else {

          console.log('No Estan repetidos ' + productoExt.Id + ' - ' +  this.ArrayProducto[index].Id)
          this.ArrayProducto.push(productoExt);

          productoExt = []; //Vaciar lo que viene del formulario.
          break;
        }
      }
    }

    for (let index = 0; index < this.ArrayProducto.length; index++) {
      this.valorTotal = this.ArrayProducto.reduce((accion, productoExt,) => accion + (productoExt.Cant * productoExt.PrecioUnd), 0)
      console.log(this.valorTotal);
    }
  }

  // Funcion para crear los pedidos de productos y añadirlos a la base de datos
  CrearPedidoExterno() {
    this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidos => {
      let pedidosID = [];
      let idProducto : any;
      let cantidadProducto : any;
      let unidadMedida : any;
      let campoEstado = this.FormPedidoExternoClientes.get('PedEstadoId')?.value

      for (let ped = 0; ped < datos_pedidos.length; ped++) {
        pedidosID.push(datos_pedidos[ped].pedExt_Id);        
      }

      let ultimoId = Math.max.apply(null, pedidosID);
      let nombrePDf = ultimoId + 1;

      const camposPedido : any = {
        PedExt_Codigo: this.contadorPedidosExternos,
        PedExt_FechaCreacion: this.FormPedidoExternoClientes.get('PedFecha')?.value,
        PedExt_FechaEntrega: this.FormPedidoExternoClientes.get('PedFechaEnt')?.value,
        Empresa_Id: this.EmpresaVendedora,
        SedeCli_Id: this.IDSedeSeleccionada,
        Usua_Id: this.UsuarioSeleccionado,
        Estado_Id: this.EstadoDocumentos,
        PedExt_Observacion: this.FormPedidoExternoClientes.get('PedObservacion')?.value,
        PedExt_PrecioTotal: this.valorTotal,
        PedExt_Archivo: this.datosPDF
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

            const productosPerdidos : any = {
              Prod_Id: idProducto,
              PedExt_Id: nombrePDf,
              PedExtProd_Cantidad : cantidadProducto,
              UndMed_Id : unidadMedida,
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

  //Función para obtener el ID de la empresa, apartir de la posición
  /*La idea es que al iniciar sesión se deje en algún lado del programa el ID
  de la empresa y se capte de ahí su Identificación*/
  obtenerEmpresa(){
    this.SrvEmpresa.srvObtenerLista().subscribe((dataEmpresa) => {
      for (let index = 0; index < dataEmpresa.length; index++) {
        this.EmpresaVendedora = dataEmpresa[0].empresa_Id;
        break
        //this.EmpresaVendedora = dataEmpresa[1].empresa_Nombre;
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
    }, error => {
      console.log(error);
    })
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
    }, error => {
      console.log(error);
    })
  }

  /*Función para captar el ID de usuario según su nombre, dato que se pasa a
  la tabla de pedidos al insertar el dato.*/
  CaptarUsuarioSeleccionado() {
    let usuarioCombo = this.FormPedidoExternoClientes.get('PedUsuarioNombre')?.value;

    this.usuarioService.srvObtenerListaUsuario().subscribe(dataUsuario => {
      for (let index = 0; index < dataUsuario.length; index++) {
        if(usuarioCombo == dataUsuario[index].usua_Nombre) this.UsuarioSeleccionado = dataUsuario[index].usua_Id;
      }
    }, error => {
      console.log(error);
    })
  }

  // Función para limpiar la tabla en la que se muestran los productos del pedido
  LimpiarTablaTotal(){
    this.ArrayProducto = [];
    this.valorTotal = []
  }

  // Funcion para llenar la tabla de productos con la informacion que se inserte en los modales
  llenarTablaProductosCreador(id : any, nombre : string, ancho : any, fuelle : any,
    calibre : any, undMed : string, tpProducto : string, cantidad : any, undMed2 : string, precio : any, moneda : string, descripcion : string){

    let productoExt : any = {
      Id : id,
      Nombre : nombre,
      Ancho : ancho,
      Fuelle : fuelle,
      Cal : calibre,
      Und : undMed,
      Tipo : tpProducto,
      Cant : cantidad,
      UndCant : undMed2,
      PrecioUnd : precio,
      TpMoneda : moneda,
      Stock : cantidad,
      Produ_Descripcion : descripcion,
      SubTotal : cantidad * precio,
    }

    if(this.ArrayProducto.length == 0){
      console.log(this.ArrayProducto)
      this.ArrayProducto.push(productoExt);
    } else {
      for (let index = 0; index < this.ArrayProducto.length; index++) {
        if(this.FormPedidoExternoProductos.value.ProdId == this.ArrayProducto[index].Id) Swal.fire('No se pueden cargar datos identicos a la tabla.')
        else this.ArrayProducto.push(productoExt);
        break;
      }
    }
    for (let index = 0; index < this.ArrayProducto.length; index++) {
      this.valorTotal = this.ArrayProducto.reduce((accion, productoExt,) => accion + (productoExt.Cant * productoExt.PrecioUnd), 0)
      console.log(this.valorTotal);
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
                    const pdfDefinicion : any = {
                      info: {
                        title: `${ultimoId}`
                      },
                      content : [
                        {
                          text: `Plasticaribe S.A.S ---- Orden de Pedidos de Productos`,
                          alignment: 'center',
                          style: 'header',
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

                        this.table(this.ArrayProducto, ['Id', 'Nombre', 'Ancho', 'Fuelle', 'Cal', 'Und', 'Tipo', 'Cant', 'UndCant', 'PrecioUnd', 'SubTotal']),
                        
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
                      }
                    }
                    const pdf = pdfMake.createPdf(pdfDefinicion);
                    pdf.open();
                    console.log(pdf);
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
          widths: [20, 75, 28, 28, 20, 20, 45, 30, 35, 45, 75],
          body: this.buildTableBody(data, columns),     
        },
        fontSize: 9,
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
                                  this.clientesService.srvObtenerListaPorId(datos_sedes.cli_Id).subscribe(datos_clientes => {console.log(id)
                                    for (let k = 0; k < this.productosPedidos.length; k++) {
                                      const pdfDefinicion : any = {
                                        info: {
                                          title: `${datos_pedidos.pedExt_Id}`
                                        },
                                        content : [
                                          {
                                            text: `Plasticaribe S.A.S ---- Orden de Pedidos de Productos`,
                                            alignment: 'center',
                                            style: 'header',
                                          },
                                          '\n \n',
                                          {
                                            text: `Fecha de pedido: ${datos_pedidos.pedExt_FechaCreacion}`,
                                            style: 'header',
                                            alignment: 'right',
                                          },
                          
                                          {
                                            text: `Fecha de entrega: ${datos_pedidos.pedExt_FechaEntrega} `,
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
                                                  `Tipo de Cliente: ${datos_clientes.tpCli_Id}`
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
      
                                          this.table(this.productosPedidos, ['Id', 'Nombre', 'Ancho', 'Fuelle', 'Cal', 'Und', 'Tipo', 'Cant', 'UndCant', 'PrecioUnd', 'SubTotal']),
                                          
                                          {
                                            text: `\n\nValor Total Pedido: $${datos_pedidos.pedExt_PrecioTotal}`,
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
                                            fontSize: 9,
                                            bold: true
                                          },
                                        }
                                      }
                                      const pdf = pdfMake.createPdf(pdfDefinicion);
                                      pdf.open();
                                      break;
                                    }
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
                            Cal : datos_productos[i].prod_Calibre,
                            Und : datos_productos[i].undMedACF,
                            Tipo : datos_tipo.tpProd_Nombre,
                            Cant : datos_pedidos_productos[index].pedExtProd_Cantidad,
                            UndCant : datos_pedidos_productos[index].undMed_Id,
                            PrecioUnd : datos_existencias[e].exProd_Precio,
                            Moneda : datos_existencias[e].tpMoneda_Id,
                            Stock : datos_existencias[e].exProd_Cantidad,
                            SubTotal : datos_pedidos_productos[index].pedExtProd_Cantidad * datos_existencias[e].exProd_Precio,
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
  QuitarProductoTabla(index : number) {

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
  insertarClientes(id : any, tipoId : any, nombre : any, telefono : any, email : any, tipoCliente : string, ciudadSede : any, vendedor : any, codigoPostal : number, direccionSede : any, sedeCLiID : any){
    let usuario : number;
    let Id_TipoCliente : number

    this.tipoClientService.srvObtenerLista().subscribe(datos_tipoCliente => {
      for (let index = 0; index < datos_tipoCliente.length; index++) {
        if (datos_tipoCliente[index].tpCli_Nombre == tipoCliente) {
          Id_TipoCliente = datos_tipoCliente[index].tpCli_Id;

          this.usuarioService.srvObtenerListaUsuario().subscribe(datos_usuario => {
            for (let index = 0; index < datos_usuario.length; index++) {
              if (datos_usuario[index].usua_Nombre == vendedor) {
                usuario = datos_usuario[index].usua_Id;

                const datosClientes : any = {
                  Cli_Id: id,
                  TipoIdentificacion_Id : tipoId,
                  Cli_Nombre: nombre,
                  Cli_Telefono: telefono,
                  Cli_Email: email,
                  tpCli_Id: Id_TipoCliente,
                  Usua_Id: usuario,
                  Estado_Id : 9
                }

                this.clientesService.srvObtenerLista().subscribe(datos_clientes => {
                  for (let index = 0; index < datos_clientes.length; index++) {
                    if (datos_clientes[index].cli_Nombre != id) {
                      this.clientesService.srvGuardar(datosClientes).subscribe(datos => {
                        Swal.fire('Cliente guardado con éxito!');
                        this.llenarSedeCliente(id, ciudadSede, codigoPostal, direccionSede, sedeCLiID);
                      }, error => { console.log(error); });
                      break;
                    }else continue;
                  }
                });
              }      
            }
          });
        }
      }
    });
  }

  // Funcion para guardar en la base de datos las sede de clientes
  llenarSedeCliente(id : number, ciudadSede : any, codigoPostal : number, direccionSede : any, sedeCLiID :any){
    
    this.sedesClientesService.srvObtenerLista().subscribe(datos_sedes => {
      let sedes_id = [];
      let nuevoID : any;
      for (let index = 0; index < datos_sedes.length; index++) {
        if (datos_sedes[index].cli_Id == sedeCLiID) {
          sedes_id.push(datos_sedes[index].sedeCli_Id);
        }
      }

      if (sedes_id.length == 0) {
        
        nuevoID = id +""+ 1;
        console.log(nuevoID);
      } else {
        console.log(sedes_id);
        let ultimoId = Math.max.apply(null, sedes_id);
        nuevoID = ultimoId + 1;
        console.log(nuevoID);
      }

      const datosSedes : any = {
        sedeCli_Id: nuevoID,
        SedeCliente_Ciudad: ciudadSede,
        SedeCliente_Direccion: direccionSede,
        SedeCli_CodPostal: codigoPostal,
        Cli_Id : sedeCLiID,
      }

      this.sedesClientesService.srvGuardar(datosSedes).subscribe(datos_sede => {
        console.log('Sede de cliente guardada con éxito!');
      }, error => { console.log(error); });
    });
  }

  // Funcion para guardar productos en la base de datos
  registrarProducto(id : any, nombre : any, ancho : any, fuelle : any, calibre : any, undMed : any, tpProducto : any, descripcion : any){

    let tipoProductos_nombre = tpProducto;
    let tipoProducto_Id : number;
    this.tiposProductosService.srvObtenerLista().subscribe(datos_tipoProducto => {
      for (let index = 0; index < datos_tipoProducto.length; index++) {
        if (tipoProductos_nombre == datos_tipoProducto[index].tpProd_Nombre) {
          tipoProducto_Id = datos_tipoProducto[index].tpProd_Id;

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
          
          console.log(datosProductos)
          this.productosServices.srvGuardar(datosProductos).subscribe(datos => {
            Swal.fire('Producto guardado con éxito!');
          }, error => {console.log(error)});
          break;
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
        ExProd_PrecioExistencia: precio,
        ExProd_PrecioSinInflacion: precio,
        ExProd_PrecioTotalFinal: precioFinal,
        TpMoneda_Id: moneda,
      }

      console.log(datosExistencias)
      this.existenciasProductosServices.srvGuardar(datosExistencias).subscribe(datos_existencias => {
        console.log('Existencias guardada con éxito!');
      }, error => { console.log(error)});
  }

  // Funcion para actualizar un producto
  actualizarProducto(){
    Swal.fire({
      title: '¿Está seguro de actualizar este producto?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, actualizar!'
    }).then((result) => {
      if (result.isConfirmed) {
        let id : number = this.FormPedidoExternoProductos.value.ProdId;
        let tipo_Id : number;

        let codigo : number;
        let CodigosProductos = [];
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
                  Estado_Id: 10
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
                  }, error => {console.log(error)});
                });
                break;
              }
            }
          });
        });
      }
    });
    
  }

  // Funcion para editar un pedido
  MostrarPedido(formulario : any) {
    this.Ide = formulario.pedExt_Id;
    this.AccionBoton = "Editar";
    this.ArrayProducto = [];
    this.pedidoproductoService.srvObtenerListaPorId(this.Ide).subscribe(datos_pedidos => {
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
                                      this.FormPedidoExternoClientes.patchValue({
                                        PedClienteNombre: datos_clientes.cli_Nombre,
                                        PedSedeCli_Id: datos_sedes.sedeCliente_Direccion,                                        
                                        PedUsuarioNombre: datos_usuarios.usua_Nombre,
                                        PedFecha: formulario.pedExt_FechaCreacion.split("T"),
                                        PedFechaEnt: formulario.pedExt_FechaEntrega,
                                        PedEstadoId: datos_estados[j].estado_Nombre,
                                        PedObservacion: datos_pedidos.pedExt_Observacion,
                                      });
                                      this.tiposProductosService.srvObtenerListaPorId(datos_productos[i].tpProd_Id).subscribe(datos_tipo_producto => {
                                        let id = datos_productos[i].prod_Id;
                                        let nombre = datos_productos[i].prod_Nombre;
                                        let ancho = datos_productos[i].prod_Ancho;
                                        let fuelle = datos_productos[i].prod_Fuelle;
                                        let calibre = datos_productos[i].prod_Calibre;
                                        let undMed = datos_productos[i].undMedACF;
                                        let tpProduct = datos_tipo_producto.tpProd_Nombre;
                                        let cantidad = datos_pedidos_productos[index].pedExtProd_Cantidad;
                                        let undMed2 = datos_pedidos_productos[index].undMed_Id;
                                        let precio = datos_existencias[e].exProd_Precio;
                                        let moneda = datos_existencias[e].tpMoneda_Id;
                                        let descripcion = datos_productos[i].prod_Descripcion
                                        this.llenarTablaProductosCreador(id, nombre, ancho, fuelle, calibre, undMed, tpProduct, cantidad, undMed2, precio, moneda, descripcion);
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

  // Función para editar uno de los pedidos
  editarPedido() {
    this.Ide;
    this.AccionBoton = "Editar";
    this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidos => {
      this.usuarioService.srvObtenerListaUsuario().subscribe(datos_usuarios => {
        for (let i = 0; i < datos_usuarios.length; i++) {
          if (datos_usuarios[i].usua_Nombre == this.FormPedidoExternoClientes.value.PedUsuarioNombre) {
            
            let pedidosID = [];
            let idProducto : any;
            let cantidadProducto : any;
            let unidadMedida : any;
            let campoEstado = this.FormPedidoExternoClientes.get('PedEstadoId')?.value
            let idEstado : number;

            this.estadosService.srvObtenerListaEstados().subscribe(datos_estado => {
              for (let index = 0; index < datos_estado.length; index++) {
                if (datos_estado[index].estado_Nombre == campoEstado) {
                  idEstado = datos_estado[index].estado_Id;
                  break;
                }          
              }

              for (let ped = 0; ped < datos_pedidos.length; ped++) {
                pedidosID.push(datos_pedidos[ped].pedExt_Id);        
              }
  
              let ultimoId = Math.max.apply(null, pedidosID);
              let idPedido;
        
              const camposPedido : any = {
                PedExt_Id : this.Ide,
                PedExt_Codigo : this.contadorPedidosExternos,
                PedExt_FechaCreacion:  this.FormPedidoExternoClientes.get('PedFecha')?.value,
                PedExt_FechaEntrega: this.FormPedidoExternoClientes.get('PedFechaEnt')?.value,
                Empresa_Id: this.EmpresaVendedora,
                SedeCli_Id: this.IDSedeSeleccionada,
                Estado_Id: idEstado,
                Usua_Id: datos_usuarios[i].usua_Id,
                PedExt_Observacion: this.FormPedidoExternoClientes.get('PedObservacion')?.value,
                PedExt_PrecioTotal: this.valorTotal,
                PedExt_Archivo: this.datosPDF
              }
  
              if(!this.ArrayProducto.length) Swal.fire('Debe cargar al menos un producto en la tabla.');
              else if (camposPedido.PedExt_FechaEntrega <= camposPedido.PedExt_FechaCreacion) Swal.fire('La fecha de creación no puede ser menor o igual a la fecha de entrega.');
              else{
                this.pedidoproductoService.srvActualizarPedidosProdusctos(this.Ide, camposPedido).subscribe(datos_pedido_Actualizado => {
        
                  for (let index = 0; index < this.ArrayProducto.length; index++) {
                    idProducto = this.ArrayProducto[index].Id;
                    cantidadProducto = this.ArrayProducto[index].Cant;
                    unidadMedida = this.ArrayProducto[index].UndCant;
        
                    const productosPerdidos : any = {
                      Prod_Id: idProducto,
                      PedExt_Id: idPedido,
                      PedExtProd_Cantidad : cantidadProducto,
                      UndMed_Id : unidadMedida,
                    }
                    let idPedidoProductos : any = (idProducto +""+ this.Ide);
                    console.log(idPedidoProductos)
                    this.PedidoProductosService.srvObtenerListaPorId(this.Ide).subscribe(datos_pedido_Actualizado => {
                      console.log(datos_pedido_Actualizado)
                    }, error => {console.log(error); });
                    this.PedidoProductosService.srvActualizar(this.Ide, productosPerdidos).subscribe(datos_pedido_Actualizado => {
                    }, error => {console.log(error); });
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
                    title: 'Pedido actualizado satisfactoriamente'
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
    });
  }

}