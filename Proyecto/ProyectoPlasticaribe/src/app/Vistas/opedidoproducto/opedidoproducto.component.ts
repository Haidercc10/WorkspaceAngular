import { Component, OnInit } from '@angular/core';
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
import * as html2pdf from 'html2pdf.js'
import { PedidoProductosService } from 'src/app/Servicios/pedidoProductos.service'

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

import { stringify } from 'querystring';
import { Console } from 'console';
import { ThisReceiver } from '@angular/compiler';


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
  usuarioVendedor=[];
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

/* Vaiables para rescatar los ID de estado, sedes, empresa, valorTotal */
  valorTotal=[];
  EmpresaVendedora=[];
  EstadoDocumentos= [];
  EstadoDeDocumentos : any;
  SedeSeleccionada: any;
  IDSedeSeleccionada : any;
  UsuarioSeleccionado : any;

  idCliente = [];
  tipoIdCliente = [];
  telefonoCliente = [];
  emailCliente = [];
  tipoCliente = [];
  ciudadSede = [];
  codigoPostal = [];
  estadoCliente = [];



  pedidosID = [];

  datosPDF : any;

  pages: number = 1;
  dataset: any[] = ['1','2','3','4','5','6','7','8','9','10'];

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
                           private PedidoProductosService : PedidoProductosService,) {

    this.FormPedidoExternoClientes = this.frmBuilderPedExterno.group({
      //Instanciar campos que vienen del formulario
      //Pedidos
      PedSedeCli_Id: new FormControl(),
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
      pdf:new FormControl(),
    });

    this.FormConsultaPedidoExterno = this.frmBuilderPedExterno.group({
      PedExtIdConsulta: new FormControl(),
      PedExtFechaConsulta: new FormControl(),
      PedExtFechaEntregaConsulta: new FormControl(),
      PedExtEstadoConsulta: new FormControl()
    });
  }

  //Cargar al iniciar.
  ngOnInit(): void {
    this.initForms();
    this.clientesComboBox();
    this.estadoComboBox();
    this.productoComboBox();
    this.undMedidaComboBox();
    this.obtenerEmpresa();
    this.ObtenerUltimoPedido();
    //this.LimpiarCampos();
    this.tipoProductoComboBox();
    this.tipoMonedaComboBox();
    //this.obtenerEmpresa();
    this.ColumnasTabla();
    this.PruebaInsercion();
  }

  initForms() {
    //Campos que vienen del formulario
    this.FormPedidoExternoClientes = this.frmBuilderPedExterno.group({
      //Datos para la tabla de pedidos.
      PedClienteNombre: ['', Validators.required],
      PedSedeCli_Id: ['', Validators.required],
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
       ProdUnidadMedidaACF: ['', Validators.required],
       ProdTipo: ['', Validators.required],
       ProdCantidad: ['', Validators.required],
       ProdUnidadMedidaCant: ['', Validators.required],
       ProdPrecioUnd: ['', Validators.required],
       ProdTipoMoneda: ['', Validators.required],
       ProdStock: ['', Validators.required],
       ProdDescripcion: [''],


    });

    this.FormConsultaPedidoExterno = this.frmBuilderPedExterno.group({
      PedExtIdConsulta: [, Validators.required],
      // PedExtFechaConsulta: [, Validators.required],
      // PedExtFechaEntregaConsulta: [, Validators.required],
      // PedExtEstadoConsulta: [, Validators.required],
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
    if(this.FormPedidoExternoProductos.valid){
      console.log(this.FormPedidoExternoProductos);
      this.cargarFormProductoEnTablas();

    } else {
      Swal.fire("Hay campos vacios en el formulario de producto");
      console.log(this.FormPedidoExternoProductos);

    }
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
    this.clientesService.srvObtenerLista().subscribe(datos_cliente => {
      for (let index = 0; index < datos_cliente.length; index++) {
        this.cliente.push(datos_cliente[index].cli_Nombre);
        this.clienteDatos.push(datos_cliente[index]);
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


            for (let i = 0; i < datos_sedesClientes.length; i++) {
              if (datos_cliente[index].cli_Id == datos_sedesClientes[i].cli_Id) {
                this.sedeCliente.push(datos_sedesClientes[i].sedeCliente_Direccion);
                //Llena datos de usuarios segun cliente seleccionado.
                this.usuarioService.srvObtenerListaUsuario().subscribe(dataUsuario => {
                  this.usuarioVende=[];
                  for (let inx = 0; inx < dataUsuario.length; inx++) {

                    if(datos_cliente[index].usua_Id == dataUsuario[inx].usua_Id) {
                      this.usuarioVende.push(dataUsuario[inx].usua_Nombre);
                      console.log('Aqui: ' +  this.usuarioVende);

                      break;
                    } else {
                      this.usuarioVende=[];
                    }
                  }
                });
              }
            }
          });
        }

        //LLENA EL USUARIO DEPENDIENDO DEL CLIENTE
       /* this.usuarioService.srvObtenerListaUsuario().subscribe(datos_usuarioVendedor => {
          this.usuarioVendedor = [];
          for (let j = 0; j < datos_usuarioVendedor.length; j++) {
            if (datos_cliente[index].usua_Id == datos_usuarioVendedor[j].usua_Id) {
              this.usuarioVendedor.push(datos_usuarioVendedor[index].usua_Nombre);
              break;
            } else this.usuarioVendedor = [];
          }
        });*/
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

  // Función para llenar el comboBox de productos con todos los productos
  productoComboBox() {
    this.productosServices.srvObtenerLista().subscribe(datos_productos => {
      for (let index = 0; index < datos_productos.length; index++) {
        this.producto.push(datos_productos[index].prod_Nombre);
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
    this.undMed = [];

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
                                  this.undMedidaComboBox();
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
    if(this.FormConsultaPedidoExterno.valid) {
      this.pedidosProductos = [];
        this.pedidoproductoService.srvObtenerListaPorId(this.FormConsultaPedidoExterno.value.PedExtIdConsulta).subscribe(datos_pedidos => {
          this.pedidosProductos.push(datos_pedidos);

        }, error => { Swal.fire(`El pedido con el ID: ${this.FormConsultaPedidoExterno.value.PedExtIdConsulta} no existe`)});
    }else {
      this.pedidosProductos = [];
      this.sedeCliente = [];
      this.nombreCliente = [];
      this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          this.pedidosProductos.push(datos_pedidos[index]);
          // this.sedesClientesService.srvObtenerLista().subscribe(datos_sedeCliente => {
          //   for (let sede = 0; sede < datos_sedeCliente.length; sede++) {
          //     if (this.pedidosProductos[index].sedeCli_Id == datos_sedeCliente[sede].sedeCli_Id) {
          //     let id : number = datos_sedeCliente[sede].cli_Id;
          //       this.clientesService.srvObtenerListaPorId(id).subscribe(datos_cliente => {
          //         this.pedidosProductos[index].sedeCli_Id(datos_cliente.cli_Nombre);
          //       });
          //     }
          //   }
          // })
        }

      }, error => {
      Swal.fire(`Ocurrió un error, intentelo de nuevo ${error}`);
    });
  }
}


  /*validarCamposVaciosConsulta(){
    if(this.FormConsultaPedidoExterno.valid) {
      this.pedidosProductos = [];
        this.pedidoproductoService.srvObtenerListaPorId(this.FormConsultaPedidoExterno.value.PedExtIdConsulta).subscribe(datos_pedidos => {
          this.pedidosProductos.push(datos_pedidos);

        }, error => { Swal.fire(`El pedido con el ID: ${this.FormConsultaPedidoExterno.value.PedExtIdConsulta} no existe`)});
    }else {
      this.pedidosProductos = [];
      this.sedeCliente = [];
      this.nombreCliente = [];
      this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidos => {
        for (let index = 0; index < datos_pedidos.length; index++) {
          this.pedidosProductos.push(datos_pedidos[index]);
          // this.sedesClientesService.srvObtenerLista().subscribe(datos_sedeCliente => {
          //   for (let sede = 0; sede < datos_sedeCliente.length; sede++) {
          //     if (this.pedidosProductos[index].sedeCli_Id == datos_sedeCliente[sede].sedeCli_Id) {
          //     let id : number = datos_sedeCliente[sede].cli_Id;
          //       this.clientesService.srvObtenerListaPorId(id).subscribe(datos_cliente => {
          //         this.pedidosProductos[index].sedeCli_Id(datos_cliente.cli_Nombre);
          //       });
          //     }
          //   }
          // })
        }
      });
    }
  }*/

  /* CONSULTAR EN LA TABLA DE USUARIOS EL NOMBRE QUE ESTÁ DIGITADO EN EL COMBOBOX DE USUARIOS Y BUSCAR EL ID DE ESE NOMBRE PARA PASARSELO A LA TABLA DE PEDIDOS
    DE PRODUCTOS
    SE PUEDE OMITIR */
  consultarNombreUsuario() {
    this.usuarioService.srvObtenerListaUsuario().subscribe(datos_usuarios => {
      for (let i = 0; i < datos_usuarios.length; i++) {
        let dato_nombre: string = datos_usuarios[i].usua_Nombre;
        if (this.FormPedidoExternoClientes.value.PedUsuarioNombre == dato_nombre) {
          let dato_id: number = datos_usuarios[i].usua_Id;
          console.log(`El número de identificacion del Usuario ${dato_nombre} es ${dato_id}`);
          break;
        }else if (this.FormPedidoExternoClientes.value.PedUsuarioNombre == "") {
          console.log("selecciona un vendedor");
          break;
        }
      }

    }, error => {
      Swal.fire('Ocurrió un error, intentelo de nuevo');
    });

      }




  /* FUNCION PARA RELIZAR CONFIMACIÓN DE SALIDA DE LA VISTA */
  confimacionSalida(){
    let salir: string = prompt("¿Seguro que desea salir?\n Digite S para si o N para no");
    if(salir == "s" || salir == "S" || salir == "si" || salir == "Si" || salir == "SI" || salir == "sI") {
      window.location.href = "./navbarLateral";
    }else if (salir == "n" || salir == "N" || salir == "no" || salir == "No" || salir == "NO" || salir == "nO"){

    }else {
      Swal.fire("Digite datos validos")
    }
  }

  // FUNCION  DEL PDF
  download(){
    var element = document.getElementById('table');
    var opt = {
      margin:       1,
      filename:     'Reporte.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    }
    // New Promise-based usage
    let pdf = html2pdf().from(element).set(opt).save();
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

 /* cargarFormProductoEnTablas(){
      let productoExt : any = {
        Produ_Id : this.FormPedidoExternoProductos.get('ProdId')?.value,
        Produ_Nombre : this.FormPedidoExternoProductos.get('ProdNombre').value,
        Produ_Ancho : this.FormPedidoExternoProductos.get('ProdAncho').value,
        Produ_Fuelle : this.FormPedidoExternoProductos.get('ProdFuelle').value,
        Produ_Calibre : this.FormPedidoExternoProductos.get('ProdCalibre').value,
        UndMedACF : this.FormPedidoExternoProductos.get('ProdUnidadMedidaACF').value,
        TpProdu_Id : this.FormPedidoExternoProductos.get('ProdTipo').value,
        Produ_Cantidad : this.FormPedidoExternoProductos.get('ProdCantidad').value,
        UndMedPeso : this.FormPedidoExternoProductos.get('ProdUnidadMedidaCant')?.value,
        PrecioUnd : this.FormPedidoExternoProductos.get('ProdPrecioUnd').value,
        TipoMoneda : this.FormPedidoExternoProductos.get('ProdTipoMoneda').value,
        Stock : this.FormPedidoExternoProductos.get('ProdStock').value,
        Produ_Descripcion : this.FormPedidoExternoProductos.get('ProdDescripcion').value,
        Subtotal : this.FormPedidoExternoProductos.get('ProdCantidad').value * this.FormPedidoExternoProductos.get('ProdPrecioUnd')?.value
    }

      if(!this.ArrayProducto.length) { //Está vacio?
        console.log('Hola, estoy vacio.');

        this.ArrayProducto.push(productoExt); //Agrega un dato
        console.log('Te coloque un dato');


        productoExt = []; //Vaciar lo que viene del formulario.
        console.log(productoExt);

      } else if (this.ArrayProducto.length) { //Si el array que llena la tabla no esta vacío.

        for (let index = 0; index < this.ArrayProducto.length; index++) {

          if(productoExt.Produ_Id === this.ArrayProducto[index].Produ_Id) { //Verifico si campo y form en posicion ID son iguales

            console.log('Estan repetidos ' + productoExt.Produ_Id + ' - ' +  this.ArrayProducto[index].Produ_Id);
            console.log(index)
            break;
          } else {

            console.log('No Estan repetidos ' + productoExt.Produ_Id + ' - ' +  this.ArrayProducto[index].Produ_Id)
            this.ArrayProducto.push(productoExt);

            productoExt = []; //Vaciar lo que viene del formulario.
            console.log(productoExt);
            console.log(index)
            break;
          }
          //console.log(productoExt.Produ_Id);
          //console.log(this.ArrayProducto[length])
          //console.log('Hola');

        }

      } else {
        console.log('Me sali de eso.');

      }


      //console.log(this.ArrayProducto.length)

        if(!this.ArrayProducto[0]) {
          this.ArrayProducto.push(productoExt);
          console.log('Entre aqui');
          console.log(this.ArrayProducto);
          productoExt = {};
        } else {
          for (let index = 0; index < this.ArrayProducto.length; index++) {
              if (this.FormPedidoExternoProductos.value.ProdId == this.ArrayProducto[index].Produ_Id) {
                  Swal.fire('No se pueden cargar datos identicos a la tabla.');
                  break;
              } else {

                  setTimeout(() => {
                    this.ArrayProducto.push(productoExt);
                    this.LimpiarCamposProductos();
                    productoExt = {};
                  }, 1500);
                  console.log('Llegue hasta aqui.');
              }
              break;
            }

          }
      } */

     /* for (let index = 0; index < this.ArrayProducto.length; index++) {
        this.valorTotal = this.ArrayProducto.reduce((accion, productoExt,) => accion + (productoExt.Produ_Cantidad * productoExt.PrecioUnd), 0)
        console.log(this.valorTotal);
      }

  }*/



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


    if(this.ArrayProducto.length == 0) { //Está vacio?
      console.log('Hola, estoy vacio.');

      this.ArrayProducto.push(productoExt); //Agrega un dato
      console.log('Te coloque un dato');
      this.LimpiarCamposProductos();

      productoExt = []; //Vaciar lo que viene del formulario.
      console.log(productoExt);

    } else { //Si el array que llena la tabla no esta vacío.

      for (let index = 0; index < this.ArrayProducto.length; index++) {

        if(productoExt.Id === this.ArrayProducto[index].Id) { //Verifico si campo y form en posicion ID son iguales
          Swal.fire('Evite cargar datos duplicados a la tabla. Verifique!');
          console.log('Estan repetidos ' + productoExt.Id + ' - ' +  this.ArrayProducto[index].Id);
          console.log(index)
          break;
        } else {

          console.log('No Estan repetidos ' + productoExt.Id + ' - ' +  this.ArrayProducto[index].Id)
          this.ArrayProducto.push(productoExt);

          productoExt = []; //Vaciar lo que viene del formulario.
          this.LimpiarCampos();
          console.log(productoExt);
          console.log(index)
          break;
        }
      }


    }

    for (let index = 0; index < this.ArrayProducto.length; index++) {
      this.valorTotal = this.ArrayProducto.reduce((accion, productoExt,) => accion + (productoExt.Cant * productoExt.PrecioUnd), 0)
      console.log(this.valorTotal);
    }

    /*if(this.ArrayProducto.length == 0){

      this.ArrayProducto.push(productoExt);
      console.log(productoExt)
      this.LimpiarCamposProductos();

    } else {
      console.log(this.ArrayProducto);
      for (let index = 0; index < this.ArrayProducto.length; index++) {
        if(this.FormPedidoExternoProductos.value.ProdId == this.ArrayProducto[index].Id) {
            Swal.fire('No se pueden cargar datos identicos a la tabla.');
            console.log('array: ' + this.ArrayProducto[index].Produ_Id);
            console.log('formulario: ' + this.FormPedidoExternoProductos.value.ProdId);
            break
        } else {
            console.log('array: ' + this.ArrayProducto[index].Produ_Id);
            console.log('formulario: ' + this.FormPedidoExternoProductos.value.ProdId);
            this.ArrayProducto.push(productoExt);
            this.LimpiarCamposProductos();
            console.log('Llegue hasta aqui.');
        }
        break;
      }
    }
    for (let index = 0; index < this.ArrayProducto.length; index++) {
      this.valorTotal = this.ArrayProducto.reduce((accion, productoExt,) => accion + (productoExt.Cant * productoExt.PrecioUnd), 0)
      console.log(this.valorTotal);
    }*/
  }


  // Funcion para crear los pedidos de productos y añadirlos a la base de datos
  CrearPedidoExterno() {
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

    let campoEstado = this.FormPedidoExternoClientes.get('PedEstadoId')?.value

    if(!this.ArrayProducto.length){
      Swal.fire('Debe cargar al menos un producto en la tabla.');

    } else if (campoEstado == "Finalizado" || campoEstado == "Cancelado" || campoEstado == "Anulado") {
      Swal.fire('No puede crear un pedido con el estado seleccionado. Por favor verifique.');

    } else if (camposPedido.PedExt_FechaEntrega <= camposPedido.PedExt_FechaCreacion){
      Swal.fire('La fecha de creación no puede ser menor o igual a la fecha de entrega.');

    }else{
      this.pedidoproductoService.srvGuardarPedidosProductos(camposPedido).subscribe(data=> {
        Swal.fire('¡Pedido guardado con éxito!');
          this.crearpdf();
          setTimeout(() => {
          this.LimpiarCampos();
        }, 1000);

     }, error => { console.log(error); });
    }
  }

  //Función para obtener el ID de la empresa, apartir de la posición
  /*La idea es que al iniciar sesión se deje en algún lado del programa el ID
  de la empresa y se capte de ahí su Identificación*/
  obtenerEmpresa(){
    this.SrvEmpresa.srvObtenerLista().subscribe((dataEmpresa) => {
      for (let index = 0; index < dataEmpresa.length; index++) {

          this.EmpresaVendedora = dataEmpresa[1].empresa_Id;
          console.log(dataEmpresa[1].empresa_Nombre);
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
        console.log('Estado ' + data[index].estado_Id + ' - ' + data[index].estado_Nombre);
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
        console.log(data[index].sedeCli_Id);

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
      if(usuarioCombo == dataUsuario[index].usua_Nombre) {

        this.UsuarioSeleccionado = dataUsuario[index].usua_Id;
        console.log('Usuario: ' + this.UsuarioSeleccionado);
      }

    }
  }, error => {
    console.log(error);
  })
}

LimpiarTablaTotal(){
  this.ArrayProducto = [];
  this.valorTotal = []
}


/*
    if (FechaEntrega < FechaCreacion) Swal.fire('La fecha de creación no puede ser menor o igual a la fecha de entrega.');
    else {

    if (FechaEntrega <= FechaCreacion) {
      Swal.fire('La fecha de creación no puede ser menor o igual a la fecha de entrega.');
    } else {

      this.crearpdf();
      // this.insertarProducto();
      this.CrearPedidoExterno();
    }
  }

  //Función para captar el ID del estado según el nombre del estado seleccionado.
  captarEstadoSeleccionado(){
    this.EstadoDeDocumentos = this.FormPedidoExternoClientes.get('PedEstadoId')?.value;

    this.estadosService.srvObtenerListaEstados().subscribe(data=>{
      for (let index = 0; index < data.length; index++) {
        if(this.EstadoDeDocumentos == data[index].estado_Nombre) {
          console.log('Estado ' + data[index].estado_Id + ' - ' + data[index].estado_Nombre);
          this.EstadoDocumentos = data[index].estado_Id;
        }

      }
    }, error => {
      console.log(error);
    })
  }

  /*Función para captar el ID de la sede seleccionada según su nombre, dato que se pasa a
  la tabla de pedidos al insertar el dato.*/

  /*captarSedeSeleccionada(){
    this.SedeSeleccionada = this.FormPedidoExternoClientes.get('PedSedeCli_Id')?.value;

    this.sedesClientesService.srvObtenerLista().subscribe(data=>{
      for (let index = 0; index < data.length; index++) {
        if(this.SedeSeleccionada == data[index].sedeCliente_Direccion) {
          console.log(data[index].sedeCli_Id);

          this.IDSedeSeleccionada = data[index].sedeCli_Id;
        }

      }
    }, error => {
      console.log(error);
    })
  }*/

  /*Función para captar el ID de usuario según su nombre, dato que se pasa a
  la tabla de pedidos al insertar el dato.*/
 /* CaptarUsuarioSeleccionado() {
    let usuarioCombo = this.FormPedidoExternoClientes.get('PedUsuarioNombre')?.value;

    this.usuarioService.srvObtenerListaUsuario().subscribe(dataUsuario => {
      for (let index = 0; index < dataUsuario.length; index++) {
        if(usuarioCombo == dataUsuario[index].usua_Nombre) {

          this.UsuarioSeleccionado = dataUsuario[index].usua_Id;
          console.log('Usuario: ' + this.UsuarioSeleccionado);
        }

      }
    }, error => {
      console.log(error);
    })
  }*/

  // Funcion para limpiar los la tabla de de productos
  /*LimpiarTablaTotal(){
    this.ArrayProducto = [];
    this.valorTotal = []
  }*/

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
        if(this.FormPedidoExternoProductos.value.ProdId == this.ArrayProducto[index].Id) {
            Swal.fire('No se pueden cargar datos identicos a la tabla.')
        } else {
          this.ArrayProducto.push(productoExt);
        }
        break;
      }
    }
    for (let index = 0; index < this.ArrayProducto.length; index++) {
      this.valorTotal = this.ArrayProducto.reduce((accion, productoExt,) => accion + (productoExt.Cant * productoExt.PrecioUnd), 0)
      console.log(this.valorTotal);
    }
  }

  // Funcion para llenar los datos de los clientes que se son creados en el modal
  llenarClientesCreado(id : any, tipoId : any, nombre : any, telefono : any, email : any, tipoCliente : any, ciudadSede : any, vendedor : any, codigoPostal : any, direccionSede : any){
    this.cliente.push(nombre);
    this.sedeCliente.push(direccionSede);
    this.usuarioVendedor.push(vendedor);

    this.idCliente.push(id);
    this.tipoIdCliente.push(tipoId);
    this.telefonoCliente.push(telefono);
    this.emailCliente.push(email);
    this.tipoCliente.push(tipoCliente);
    this.ciudadSede.push(ciudadSede);
    this.codigoPostal.push(codigoPostal);
    // this.estadoCliente.push(estadoCliente);
  }

  // Fucnion para que crear ub pdf apenas se realiza el pedido de productos
  crearpdf(){
    this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidos => {
      let pedidosID = [];
      for (let ped = 0; ped < datos_pedidos.length; ped++) {
        pedidosID.push(datos_pedidos[ped].pedExt_Id);
      }
      let ultimoId = Math.max.apply(null, pedidosID);
      let nombrePDf = ultimoId + 1;

      this.clientesService.srvObtenerLista().subscribe(datos_clientes => {
        for (let cli = 0; cli < datos_clientes.length; cli++) {
          if (datos_clientes[cli].cli_Nombre == this.FormPedidoExternoClientes.value.PedClienteNombre) {
            for (let index = 0; index < this.ArrayProducto.length; index++) {
              this.sedesClientesService.srvObtenerLista().subscribe(datos_sedeCliente => {
                for (let sede = 0; sede < datos_sedeCliente.length; sede++) {
                  if (datos_sedeCliente[sede].sedeCliente_Direccion == this.FormPedidoExternoClientes.value.PedSedeCli_Id) {
                    const pdfDefinicion : any = {
                      info: {
                        title: `${nombrePDf}`
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
                  }
                }
              });
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
            return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
          }
        }
    };
  }

  // Funcion para llenar el pdf con información de la base de datos dependiendo el pedido
  llenarPDFConBD(){
    /*this.PedidoProductosService.srvObtenerLista().subscribe(datos_PedidosProductos => {
      console.log("entra")
      for (let index = 0; index < datos_PedidosProductos.length; index++) {
        this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidos => {
          for (let i = 0; i < datos_pedidos.length; i++) {
            console.log("entra 2")
            if (datos_PedidosProductos[index].pedExt_Id == datos_pedidos[i].pedExt_Id) {
              console.log("entra 3")
              this.sedesClientesService.srvObtenerLista().subscribe(datos_sedesClientes => {
                for (let s = 0; s < datos_sedesClientes.length; s++) {
                  if (datos_sedesClientes[s].sedeCli_Id == datos_pedidos[i].sedeCli_Id) {
                    this.clientesService.srvObtenerLista().subscribe(datos_cliente => {
                      for (let j = 0; j < datos_cliente.length; j++) {
                        if (datos_pedidos[i].cli_Id == datos_cliente[j].cli_Id) {
                        this.productosServices.srvObtenerLista().subscribe(datos_Productos => {
                          for (let k = 0; k < datos_Productos.length; k++) {
                            if (datos_Productos[k].prod_Id == datos_PedidosProductos[index].prod_Id) {
                              this.existenciasProductosServices.srvObtenerLista().subscribe(datos_existencias => {
                                for (let e = 0; e < datos_existencias.length; e++) {
                                  if (datos_existencias[e].prod_Id == datos_Productos[k].prod_Id) {
                                    this.usuarioService.srvObtenerListaPorId(datos_cliente[j].usua_Id).subscribe(datos_usuario => {
                                      this.tiposProductosService.srvObtenerLista().subscribe(datos_tiposProductos => {
                                        for (let t = 0; t < datos_tiposProductos.length; t++) {
                                          if (datos_tiposProductos[t].tpProd_Id == datos_Productos[k].tpProd_Id) {
                                            const pdfDefinicion : any = {
                                              info: {
                                                title: `${datos_pedidos[i].pedExt_Id}`
                                              },
                                              content : [
                                                {
                                                  text: `${this.EmpresaVendedora} ---- Orden de Pedidos de Productos`,
                                                  alignment: 'center',
                                                  style: 'header',
                                                },
                                                '\n \n',
                                                {
                                                  text: `Fecha de pedido: ${datos_pedidos[i].pedExt_FechaCreacion}`,
                                                  style: 'fecha',
                                                  alignment: 'right',
                                                },

                                                {
                                                  text: `Fecha de entrega: ${datos_pedidos[i].pedExt_FechaCreacion} `,
                                                  style: 'fecha',
                                                  alignment: 'right',
                                                },
                                                {
                                                  text: `Vendedor: ${datos_usuario.usua_Nombre}\n`,
                                                  alignment: 'right',
                                                },
                                                {
                                                  text: `Estado del pedido: ${this.FormPedidoExternoClientes.value.PedEstadoId}\n \n`,
                                                  alignment: 'right',
                                                },
                                                {
                                                  text: `\n Información detallada del cliente \n `,
                                                  alignment: 'center',
                                                  style: 'header'
                                                },
                                                {
                                                  style: 'tablaCliente',
                                                  table: {
                                                    widths: ['*', '*', '*'],
                                                    body: [
                                                      [
                                                        `ID: ${datos_cliente[j].cli_Id}`,
                                                        `Tipo de ID: ${datos_cliente[j].tipoIdentificacion_Id}`,
                                                        `Tipo de Cliente: ${datos_cliente[j].tpCli_Id}`
                                                      ],
                                                      [
                                                        `Nombre: ${this.FormPedidoExternoClientes.value.PedClienteNombre}`,
                                                        `Telefono: ${datos_cliente[j].cli_Telefono}`,
                                                        `Ciudad: ${datos_sedesClientes[s].sedeCliente_Ciudad}`
                                                      ],
                                                      [
                                                        `Dirección: ${datos_sedesClientes[s].sedeCliente_Direccion}`,
                                                        `Codigo Postal: ${datos_sedesClientes[s].sedeCli_CodPostal}`,
                                                        ``
                                                      ]
                                                    ]
                                                  },
                                                  layout: 'lightHorizontalLines'
                                                },
                                                {
                                                  text: `\n \nObervación sobre el pedido: \n ${datos_pedidos[i].pedExt_Observacion}\n`
                                                },
                                                {
                                                  text: `\n Información detallada de producto(s) pedido(s) \n `,
                                                  alignment: 'center',
                                                  style: 'header'
                                                },
                                                {
                                                  style: 'tablaProductos',
                                                  table: {
                                                    body: [
                                                      ['ID', `${datos_Productos[k].prod_Id}`],
                                                      ['Nombre', `${datos_Productos[k].prod_Nombre}`],
                                                      ['Ancho', `${datos_Productos[k].prod_Ancho}`],
                                                      ['Fuelle', `${datos_Productos[k].prod_Fuelle}`],
                                                      ['Calibre', `${datos_Productos[k].prod_Calibre}`],
                                                      ['Uni. Medida', `${datos_Productos[k].undMedACF}`],
                                                      ['Tipo Prod.', `${datos_tiposProductos[t].tpProd_Nombre}`],
                                                      ['Cantidad', `${datos_PedidosProductos[index]}`],
                                                      ['Uni. Medida', `${datos_PedidosProductos[index]}`],
                                                      ['Precio Unidad', `${datos_existencias[e].exProd_Precio}`],
                                                      ['Stock', `${datos_existencias[e].Stock}`],
                                                      ['Subtotal', `${datos_Productos[k].pedExt_PrecioTotal}`]
                                                    ]
                                                  },
                                                  layout: {
                                                    fillColor: function (rowIndex, node, columnIndex) {
                                                      return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
                                                    }
                                                  }
                                                },
                                                {
                                                  text: `\n\nValor Total Pedido: $${datos_Productos[k].pedExt_PrecioTotal}`,
                                                  alignment: 'right',
                                                },
                                                {
                                                  text: `Tipo de moneda: ${datos_existencias[e].tpMoneda_Id}`,
                                                  alignment: 'right',
                                                }
                                              ],
                                              styles: {
                                                header: {
                                                  fontSize: 14,
                                                  bold: true
                                                },
                                                tablaProductos: {
                                                  fontSize: 12,
                                                }
                                              }
                                            }
                                            const pdf = pdfMake.createPdf(pdfDefinicion);
                                            pdf.open();
                                          }
                                        }
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
            }
          }
        });
      }
    });*/

    this.PedidoProductosService.srvObtenerLista().subscribe(datos_pedidosProductos => {
      for (let index = 0; index < datos_pedidosProductos.length; index++) {
        var pedido_ID : number = datos_pedidosProductos[index].pedExt_Id;
        if (pedido_ID == this.FormConsultaPedidoExterno.value.PedExtIdConsulta) {
          var producto_ID : number = datos_pedidosProductos[index].prod_Id;
          var cantidad_Producto : number = datos_pedidosProductos[index].pedExtProd_Cantidad;
          var unidMedida_cantidad : string = datos_pedidosProductos[index].undMed_Id;

          this.pedidoproductoService.srvObtenerListaPorId(pedido_ID).subscribe(datos_pedidos => {
            console.log(datos_pedidos)
          });
        }
      }
    });
  }


  QuitarProductoTabla(index : number) {
    this.ArrayProducto.splice(index, 1);


  }

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




/*  ProdId: new FormControl(),
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
      pdf:new FormControl(), */

  // Funcion para guardar clientes en la base de datos
  insertarClientes(id : any, tipoId : any, nombre : any, telefono : any, email : any, tipoCliente : any, ciudadSede : any, vendedor : any, codigoPostal : any, direccionSede : any){
    let sedeId : number;
    let usuario : number;
    this.sedesClientesService.srvObtenerLista().subscribe(datos_sedes => {
      for (let index = 0; index < datos_sedes.length; index++) {
        sedeId = datos_sedes[index].SedeCli_Id;
      }
    });

    this.usuarioService.srvObtenerListaUsuario().subscribe(datos_usuario => {
      for (let index = 0; index < datos_usuario.length; index++) {
        if (datos_usuario[index].usua_Nombre == vendedor) {
          usuario = datos_usuario[index].usua_Id;
        }

      }
    });

    let ultimoId = Math.max.apply(null, sedeId);
    var nuevoID = ultimoId + 1;

    const datosClientes : any = {
      Cli_Id: id,
      TipoIdentificacion_Id : tipoId,
      Cli_Nombre: nombre,
      Cli_Telefono: telefono,
      Cli_Email: email,
      TPCli_Id: tipoCliente,
      Usua_Id: usuario,
      Estado_Id : 9
    }

    const datosSedes : any = {
      SedeCli_Id: nuevoID,
      SedeCliente_Ciudad: ciudadSede,
      SedeCliente_Direccion: direccionSede,
      SedeCli_CodPostal: codigoPostal,
      Cli_Id : id,
    }

    this.clientesService.srvObtenerLista().subscribe(datos_clientes => {
      for (let index = 0; index < datos_clientes.length; index++) {
        if (datos_clientes[index].cli_Nombre != id) {
          this.clientesService.srvGuardar(datosClientes).subscribe(datos => {
            console.log('Cliente guardado con éxito!');
            console.log(datos);
          }, error => { console.log(error); });
          break;
        }else continue;
      }
    });

    this.sedesClientesService.srvGuardar(datosSedes).subscribe(datos_sede => {
      console.log('Cliente guardado con éxito!');
    }, error => { console.log(error); });
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
            Estado_Id: 9
          };

          this.productosServices.srvObtenerLista().subscribe(datos_productos => {
            for (let index = 0; index < datos_productos.length; index++) {
              if (datos_productos[index].prod_Id != id) {
                // Productos
                this.productosServices.srvGuardar(datosProductos).subscribe(datos => {
                  console.log('Producto guardado con éxito!');
                }, error => { console.log("Error de conexión")});
                break;
              }
            }
          });
          break;
        }
      }
    });
  }

  // Funcion para guardarr las existencias de los productos en la base de datos
  registrarExistenciaProducto(id : any, cantidad : any, undMed2 : any, precio : any, precioFinal : string, moneda : any){
    this.existenciasProductosServices.srvObtenerLista().subscribe(datos_existencias => {
      for (let ped = 0; ped < datos_existencias.length; ped++) {
        this.pedidosID.push(datos_existencias[ped].exProd_Id);
      }
    });

    let ultimoId = Math.max.apply(null, this.pedidosID);
    var nuevoID = ultimoId + 1;

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

    // Existencias
    this.existenciasProductosServices.srvGuardar(datosExistencias).subscribe(datos_existencias => {
      console.log('Existencias guardada con éxito!');
      console.log(datos_existencias)
    }, error => { console.log(error)});
  }


}

