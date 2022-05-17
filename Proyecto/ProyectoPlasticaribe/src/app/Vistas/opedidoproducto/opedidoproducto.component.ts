import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl, MinLengthValidator } from '@angular/forms';
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

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

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
  titulo = 'Generar PDF con Angular JS 5';
  imagen1 = 'assets/img/tc.jpg';

  //Llamar modales, inicializados como falsos para que no se carguen al ingresar a la pagina.
  public ModalCrearProductos: boolean = false;
  public ModalCrearCliente: boolean = false;
  public ModalSedesClientes: boolean = false;
  public TituloSedes = "";

  // VARIABLES PARA PASAR A LOS COMBOBOX
  cliente:ClientesService[]=[];
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
  ArrayProducto : any [] = [];
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
  direccionSedeCliente = [];


  constructor(private pedidoproductoService : OpedidoproductoService,
    private productosServices : ProductoService,
      private clientesService :ClientesService,
        private sedesClientesService: SedeClienteService,
          private   usuarioService: UsuarioService,
            private tipoEstadoService : TipoEstadosService,
              private unidadMedidaService : UnidadMedidaService,
                private frmBuilderPedExterno : FormBuilder,
                  private estadosService : EstadosService,
                    private existenciasProductosServices : ExistenciasProductosService,
                      private tiposProductosService : TipoProductoService,
                        private tipoMonedaService : TipoMonedaService,
                          private SrvEmpresa : EmpresaService,) {

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
    this.LimpiarCampos();
    this.tipoProductoComboBox();
    this.tipoMonedaComboBox();
    //this.obtenerEmpresa();
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
      PedExtFechaConsulta: [, Validators.required],
      PedExtFechaEntregaConsulta: [, Validators.required],
      PedExtEstadoConsulta: [, Validators.required],
    });
  }

  //Cargar modal de crear producto
  LlamarModalCrearProducto() {
    this.ModalCrearProductos = true;
  }

  LlamarModalCrearCliente() {
    this.ModalCrearCliente = true;
  }

  LlamarModalSedesClientes() {
    this.ModalSedesClientes = true;
    this.TituloSedes = "Crear sedes clientes"
  }

  // VALIDACION PARA CAMPOS VACIOS
  validarCamposVacios(){
    if(this.FormPedidoExternoProductos.valid){
      console.log(this.FormPedidoExternoProductos);
      this.cargarFormProductoEnTablas();

    }else{
      Swal.fire("Hay campos vacios");
      console.log(this.FormPedidoExternoProductos);
    }
  }

  LimpiarCampos() {
    this.FormPedidoExternoClientes.reset();
    this.FormPedidoExternoProductos.reset();
    this.ArrayProducto = [];
    this.valorTotal = [];
  }

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

  sedesClientesComboBox(){
    //LLENA LA SEDE DEL CLIENTE DEPENDIENDO DEL CLIENTE
    let clienteNombreBD: string = this.FormPedidoExternoClientes.value.PedClienteNombre;
    this.clientesService.srvObtenerLista().subscribe(datos_cliente=>{
      for (let index = 0; index < datos_cliente.length; index++) {
        if (datos_cliente[index].cli_Nombre == clienteNombreBD){
          this.sedesClientesService.srvObtenerLista().subscribe(datos_sedesClientes => {
            this.sedeCliente=[]
            for (let i = 0; i < datos_sedesClientes.length; i++) {
              if (datos_cliente[index].cli_Id == datos_sedesClientes[i].cli_Id) {
                this.sedeCliente.push(datos_sedesClientes[i].sedeCliente_Direccion);
                this.sedeClientesDatos.push(datos_sedesClientes[index]);
              }
            }
          });
        }

        //LLENA EL USUARIO DEPENDIENDO DEL CLIENTE
        this.usuarioService.srvObtenerListaUsuario().subscribe(datos_usuarioVendedor => {
          this.usuarioVendedor = [];
          for (let j = 0; j < datos_usuarioVendedor.length; j++) {
            if (datos_cliente[index].usua_Id == datos_usuarioVendedor[j].usua_Id) {
              this.usuarioVendedor.push(datos_usuarioVendedor[index].usua_Nombre);
              break;
            } else this.usuarioVendedor = [];
          }
        });
      }
    });
  }

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

  productoComboBox() {
    this.productosServices.srvObtenerLista().subscribe(datos_productos => {
      for (let index = 0; index < datos_productos.length; index++) {
        this.producto.push(datos_productos[index].prod_Nombre);
      }
    });
  }


 /* llenado(){


    let productoNombre : string = this.FormPedidoExterno.value.ProdNombre;*/

  tipoProductoComboBox(){
    this.tiposProductosService.srvObtenerLista().subscribe(datos_tiposProductos => {
      for (let index = 0; index < datos_tiposProductos.length; index++) {
        this.tipoProducto.push(datos_tiposProductos[index].tpProd_Nombre);
      }
    });
  }

  tipoMonedaComboBox(){
    this.tipoMonedaService.srvObtenerLista().subscribe(datos_tiposMoneda => {
      for (let index = 0; index < datos_tiposMoneda.length; index++) {
        this.tipoMoneda.push(datos_tiposMoneda[index].tpMoneda_Id);

      }
    });
  }

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

  undMedidaComboBox() {
    this.unidadMedidaService.srvObtenerLista().subscribe(datos_undMed => {
      for (let index = 0; index < datos_undMed.length; index++) {
        this.undMed.push(datos_undMed[index].undMed_Id);
      }
    }, error => { Swal.fire('Ocurrió un error, intentelo de nuevo'); });
  }

  /* FUNCION PARA LLENAR LA TABLA CON LOS DATOS DE LOS PEDIDOS DE PRODUCTOS DEPENDIENDO DE LA CONSULTA HECHA */
  consultarDatosPedidos(){
    //FORMA NUMERO 1 DE HACER LA CONSULTA DE PEDIDOS DE PRODUCTOS, ESTA FORMA BUSCA EL PEDIDO UNICAMENTE POR EL ID DE ESTE MISMO.
    this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidosExternos => {
      this.pedidosProductos.push(datos_pedidosExternos);
      console.log(this.pedidosProductos);
    }, error => { console.log(error); });

    //FORMA NUMERO 2 DE HACER LA CONSULTA DE PEDIDOS DE PRODUCTOS, ESTA FORMA BUSCA DEPENDIENDO DEL O LOS FILTROS QUE SE APLIQUEN
    let estadoPedido : string = this.FormConsultaPedidoExterno.value.PedExtEstadoConsulta;
    let fechaPedido : string = this.FormConsultaPedidoExterno.value.PedExtFechaConsulta;
    let fechaEntrega : string = this.FormConsultaPedidoExterno.value.PedExtFechaEntregaConsulta;

    this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidosExternos=>{
      for (let i = 0; i < datos_pedidosExternos.length; i++) {
        if (estadoPedido == datos_pedidosExternos[i].estado_Id && fechaPedido == datos_pedidosExternos[i].pedExt_FechaCreacion && fechaEntrega == datos_pedidosExternos[i].pedExt_FechaEntrega) {
          this.pedidosProductos.push(datos_pedidosExternos[i]);
        } else if (estadoPedido == datos_pedidosExternos[i].estado_Id && fechaPedido == datos_pedidosExternos[i].pedExt_FechaCreacion) {
          this.pedidosProductos.push(datos_pedidosExternos[i]);
        } else if (estadoPedido == datos_pedidosExternos[i].estado_Id) {
          this.pedidosProductos.push(datos_pedidosExternos[i]);
        }else if (fechaPedido == datos_pedidosExternos[i].pedExt_FechaCreacion && fechaEntrega == datos_pedidosExternos[i].pedExt_FechaEntrega) {
          this.pedidosProductos.push(datos_pedidosExternos[i]);
        }else if (fechaPedido == datos_pedidosExternos[i].pedExt_FechaCreacion) {
          this.pedidosProductos.push(datos_pedidosExternos[i]);
        }else if (fechaEntrega == datos_pedidosExternos[i].pedExt_FechaEntrega) {
          this.pedidosProductos.push(datos_pedidosExternos[i]);
        }
      }
    }, error => { Swal.fire(`Ocurrió un error, intentelo de nuevo ${error}`); });
  }

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

    }, error => { Swal.fire('Ocurrió un error, intentelo de nuevo'); });
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
//Carga productos en tabla.
  cargarFormProductoEnTablas(){

  /*  let productoExt : any = {
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

      if(this.ArrayProducto.length == 0){
        //console.log(this.ArrayProducto);
        this.ArrayProducto.push(productoExt);
      } else {

      for (let index = 0; index < this.ArrayProducto.length; index++) {
        //console.log(this.ArrayProducto)
       /**/

  /*let data = Object.values(productoExt.Produ_Id);

        console.log(data);
        console.log(productoExt.Produ_Id)

        if(data == this.ArrayProducto[index].Produ_Id) {
          Swal.fire('No se pueden cargar datos identicos a la tabla.')
      } else {
        this.ArrayProducto.push(productoExt);
        console.log('Llegue hasta aqui.')
      }

        break;*/

    //let nombreProducto : string = this.FormPedidoExternoProductos.value.ProdNombre;
    //let cantidadPedida : number = this.FormPedidoExternoProductos.value.ProdCantidad;
    //let stock : number = this.FormPedidoExternoProductos.value.ProdStock;

   /* if (cantidadPedida > stock) {

      Swal.fire(`La cantidad pedida del producto: ${nombreProducto} es mayor a lo que tenemos en la bodega`);

    }else {*/

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

      if(this.ArrayProducto.length == 0){
        this.ArrayProducto.push(productoExt);
        this.LimpiarCamposProductos();

      } else {
        console.log(this.ArrayProducto)
        for (let index = 0; index < this.ArrayProducto.length; index++) {
          if(this.FormPedidoExternoProductos.value.ProdId == this.ArrayProducto[index].Produ_Id) {
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
        this.valorTotal = this.ArrayProducto.reduce((accion, productoExt,) => accion + (productoExt.Produ_Cantidad * productoExt.PrecioUnd), 0)
        console.log(this.valorTotal);

//      }

    }
}




  CrearPedidoExterno() {
//    this.CaptarUsuarioSeleccionado();
//    this.captarSedeSeleccionada();

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
      PedExt_Archivo: 1
    }

    let campoEstado = this.FormPedidoExternoProductos.get('PedEstadoId')?.value
    //console.log(camposPedido);

    console.log(camposPedido);

    if(this.ArrayProducto.length == 0){
      Swal.fire('Debe cargar al menos un producto en la tabla.');

      //console.log('Aquí También:' + camposPedido);
    } else if(campoEstado == "Finalizado" || campoEstado == "Cancelado" || campoEstado == "Anulado") {
      Swal.fire('No puede crear un pedido con el estado seleccionado. Por favor verifique.')

    }else{
      console.log(camposPedido);
      this.pedidoproductoService.srvGuardarPedidosProductos(camposPedido).subscribe(data=> {
        Swal.fire('¡Pedido guardado con éxito!');
        this.crearpdf();
        setTimeout(() => {
          this.LimpiarCampos();
        }, 1500);

      }, error => {
        console.log(error);

      });
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

  //Funcion para validar que la fecha de entrega del pedido no sea menor o igual a la fecha de creación.
  validarFechas(){

  let FechaCreacion : any;
  let FechaEntrega : any;

  FechaCreacion = this.FormPedidoExternoProductos.get('PedFecha')?.value;
  FechaEntrega = this.FormPedidoExternoProductos.get('PedFechaEnt')?.value;

  if (FechaEntrega <= FechaCreacion) {
    Swal.fire('La fecha de creación no puede ser menor o igual a la fecha de entrega.');
  } else {
    this.CrearPedidoExterno();

    //console.log('Correcto');
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

validarEstados(){
  let Estado = this.FormPedidoExternoProductos.get('PedEstadoId')?.value

  if (Estado == "Finalizado" || Estado == "Anulado" || Estado == "Cancelado") {
    Swal.fire('No puede crear un pedido con el estado seleccionado. Por favor verifique.');
  }
}
/*
    if (FechaEntrega < FechaCreacion) Swal.fire('La fecha de creación no puede ser menor o igual a la fecha de entrega.');
    else {
      this.crearpdf();
      this.CrearPedidoExterno();
    }
  }
*/
  llenarTablaProductosCreador(id : any, nombre : string, ancho : any, fuelle : any,
    calibre : any, undMed : string, tpProducto : string, cantidad : any, undMed2 : string, precio : any, moneda : string, descripcion : string){

      let productoExt : any = {
      Produ_Id : id,
      Produ_Nombre : nombre,
      Produ_Ancho : ancho,
      Produ_Fuelle : fuelle,
      Produ_Calibre : calibre,
      UndMedACF : undMed,
      TpProdu_Id : tpProducto,
      Produ_Cantidad : cantidad,
      UndMedPeso : undMed2,
      PrecioUnd : precio,
      TipoMoneda : moneda,
      Stock : cantidad,
      Produ_Descripcion : descripcion,
      Subtotal : cantidad * precio,


    }
    if(this.ArrayProducto.length == 0){
      console.log(this.ArrayProducto)
      this.ArrayProducto.push(productoExt);
    } else {
      for (let index = 0; index < this.ArrayProducto.length; index++) {
        if(this.FormPedidoExternoProductos.value.ProdId == this.ArrayProducto[index].Produ_Id) {
            Swal.fire('No se pueden cargar datos identicos a la tabla.')
        } else {
          this.ArrayProducto.push(productoExt);
          //this.valorTotal = this.valorTotal +
        }
        break;
      }
    }
    for (let index = 0; index < this.ArrayProducto.length; index++) {
      this.valorTotal = this.ArrayProducto.reduce((accion, productoExt,) => accion + (productoExt.Produ_Cantidad * productoExt.PrecioUnd), 0)
      console.log(this.valorTotal);
    }
  }

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
    this.direccionSedeCliente.push(direccionSede);

  }

  crearpdf(){
    this.clientesService.srvObtenerLista().subscribe(datos_clientes => {
      for (let cli = 0; cli < datos_clientes.length; cli++) {
        if (datos_clientes[cli].cli_Nombre == this.FormPedidoExternoClientes.value.PedClienteNombre) {
          for (let index = 0; index < this.ArrayProducto.length; index++) {
            this.sedesClientesService.srvObtenerLista().subscribe(datos_sedeCliente => {
              for (let sede = 0; sede < datos_sedeCliente.length; sede++) {
                if (datos_sedeCliente[sede].sedeCliente_Direccion == this.FormPedidoExternoClientes.value.PedSedeCli_Id) {
                  const pdfDefinicion : any = {
                    content : [
                      {
                        text: `${this.EmpresaVendedora} ---- Orden de Pedidos de Productos`,
                        alignment: 'center',
                        style: 'header',
                      },
                      '\n \n',
                      {
                        text: `Fecha de pedido: ${this.FormPedidoExternoClientes.value.PedFecha}`,
                        style: 'fecha',
                        alignment: 'right',
                      },

                      {
                        text: `Fecha de entrega: ${this.FormPedidoExternoClientes.value.PedFechaEnt} `,
                        style: 'fecha',
                        alignment: 'right',
                      },
                      {
                        text: `Vendedor: ${this.FormPedidoExternoClientes.value.PedUsuarioNombre}\n`,
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
                        layout: 'lightHorizontalLines'
                      },
                      {
                        text: `\n \nObervación sobre el pedido: \n ${this.FormPedidoExternoClientes.value.PedObservacion}\n`
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
                            ['ID', `${this.ArrayProducto[index].Produ_Id}`],
                            ['Nombre', `${this.ArrayProducto[index].Produ_Nombre}`],
                            ['Ancho', `${this.ArrayProducto[index].Produ_Ancho}`],
                            ['Fuelle', `${this.ArrayProducto[index].Produ_Fuelle}`],
                            ['Calibre', `${this.ArrayProducto[index].Produ_Calibre}`],
                            ['Uni. Medida', `${this.ArrayProducto[index].UndMedACF}`],
                            ['Tipo Prod.', `${this.ArrayProducto[index].TpProdu_Id}`],
                            ['Cantidad', `${this.ArrayProducto[index].Produ_Cantidad}`],
                            ['Uni. Medida', `${this.ArrayProducto[index].UndMedPeso}`],
                            ['Precio Unidad', `${this.ArrayProducto[index].PrecioUnd}`],
                            ['Stock', `${this.ArrayProducto[index].Stock}`],
                            ['Subtotal', `${this.ArrayProducto[index].Subtotal}`]
                          ]
                        },
                        layout: {
                          fillColor: function (rowIndex, node, columnIndex) {
                            return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
                          }
                        }
                      },
                      {
                        text: `\n\nValor Total Pedido: $${this.valorTotal}`,
                        alignment: 'right',
                      },
                      {
                        text: `Tipo de moneda: ${this.ArrayProducto[index].TipoMoneda}`,
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

                  const pdfDocGenerator = pdfMake.createPdf(pdfDefinicion);
                    pdfDocGenerator.getBase64((data) => {
                    console.log(data);
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
