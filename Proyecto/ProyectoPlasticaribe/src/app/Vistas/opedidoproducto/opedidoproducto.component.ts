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


@Component({
  selector: 'app.opedidoproducto.component',
  templateUrl: './opedidoproducto.component.html',
  styleUrls: ['./opedidoproducto.component.css']
})

export class OpedidoproductoComponent implements OnInit {

  public FormPedidoExterno !: FormGroup; //Formulario de pedidos
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
  sedeCliente:SedeClienteService[]=[];
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

    this.FormPedidoExterno = this.frmBuilderPedExterno.group({
      //Instanciar campos que vienen del formulario
      //Pedidos
      PedSedeCli_Id: new FormControl(),
      PedClienteNombre: new FormControl(),
      PedUsuarioNombre: new FormControl(),
      PedFecha: new FormControl(),
      PedFechaEnt: new FormControl(),
      PedEstadoId: new FormControl(),
      PedObservacion: new FormControl(),
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
      ProdDescripcion: new FormControl()
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
  }

  initForms() {
    //Campos que vienen del formulario
    this.FormPedidoExterno = this.frmBuilderPedExterno.group({
      //Datos para la tabla de pedidos.
      PedClienteNombre: ['', Validators.required],
      PedSedeCli_Id: ['', Validators.required],
      PedUsuarioNombre: ['', Validators.required],
      PedFecha: ['', Validators.required],
      PedFechaEnt: ['', Validators.required],
      PedEstadoId: ['', Validators.required],
      PedObservacion: ['', Validators.required],
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
    if(this.FormPedidoExterno.valid){
      console.log(this.FormPedidoExterno);
      this.cargarFormProductoEnTablas();

    }else{
      Swal.fire("Hay campos vacios");
      console.log(this.FormPedidoExterno);
    }
  }

  LimpiarCampos() {
    this.FormPedidoExterno.reset();
  }

  /* EMPIEZA A HACE LAS RESPECTIVAS VALIDACIONES PARA MOSTRAR DATOS EN LOS COMBOBOX DESDE QUE ARRANCA LA PAGINA */
  clientesComboBox() {
    this.clientesService.srvObtenerLista().subscribe(datos_cliente => {
      for (let index = 0; index < datos_cliente.length; index++) {
        this.cliente.push(datos_cliente[index].cli_Nombre);
      }
    });
  }


  sedesClientesComboBox(){
    //LLENA LA SEDE DEL CLIENTE DEPENDIENDO DEL CLIENTE
    let clienteNombreBD: string = this.FormPedidoExterno.value.PedClienteNombre;
    this.clientesService.srvObtenerLista().subscribe(datos_cliente=>{
      for (let index = 0; index < datos_cliente.length; index++) {
        if (datos_cliente[index].cli_Nombre == clienteNombreBD){
          this.sedesClientesService.srvObtenerLista().subscribe(datos_sedesClientes => {
            this.sedeCliente=[]
            for (let i = 0; i < datos_sedesClientes.length; i++) {
              if (datos_cliente[index].cli_Id == datos_sedesClientes[i].cli_Id) {
                this.sedeCliente.push(datos_sedesClientes[i].sedeCliente_Direccion);
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

  llenado(){


    let productoNombre : string = this.FormPedidoExterno.value.ProdNombre;
    this.productosServices.srvObtenerLista().subscribe(datos_productos => {
      this.productoInfo = [];
      for (let index = 0; index < datos_productos.length; index++) {
        this.productosServices.srvObtenerLista().subscribe(datos_productosInfo => {
          if(datos_productos[index].prod_Nombre == productoNombre){
            this.productoInfo.push(datos_productosInfo[index]);

            // PARA MOSTRAR LAS EXISTENCIAS Y DEMAS INFORMACION DELP RODUCTO ELEGIDO
            this.existenciasProductos = [];
            for (let index = 0; index < datos_productos.length; index++) {
              if (datos_productos[index].prod_Nombre == productoNombre) {
                this.existenciasProductosServices.srvObtenerLista().subscribe(datos_existencias => {
                  for (let i = 0; i < datos_existencias.length; i++) {
                    if (datos_productos[index].prod_Id == datos_existencias[i].prod_Id) {
                      this.existenciasProductos.push(datos_existencias[i]);

                      //PARA MOSTRAR EL TIPO DE MONEDA CON EL QUE SE FACTURA ESE PRODUCTO
                      this.tipoMoneda=[];
                      this.tipoMonedaService.srvObtenerLista().subscribe(datos_tiposMondedas => {
                        for (let j = 0; j < datos_tiposMondedas.length; j++) {
                          if (datos_existencias[i].tpMoneda_Id == datos_tiposMondedas[j].tpMoneda_Id) {
                            this.tipoMoneda.push(datos_tiposMondedas[j].tpMoneda_Id);

                            //PARA MOSTRAR EL NOMBRE DEL TIPO DE PRODUCTO
                            this.tiposProductosService.srvObtenerLista().subscribe(datos_tiposProductos => {
                              this.tipoProducto=[];
                              for (let k = 0; k < datos_tiposProductos.length; k++) {
                                if (datos_tiposProductos[k].tpProd_Id == datos_productos[index].tpProd_Id) {
                                  this.tipoProducto.push(datos_tiposProductos[k].tpProd_Nombre);

                                    // PARA LLENAR LOS DATOS
                                    // cliente
                                    for (let clienteItem of this.cliente) {
                                      if (clienteItem == this.FormPedidoExterno.value.PedClienteNombre) {
                                        // sede cliente
                                        for (let sedeCliItem of this.sedeCliente) {
                                          if (sedeCliItem == this.FormPedidoExterno.value.PedSedeCli_Id) {
                                            //  usuario
                                            for (let usuarioItem of this.usuarioVendedor) {
                                              if (usuarioItem == this.FormPedidoExterno.value.PedUsuarioNombre) {
                                                // estado
                                                for (let estadoItem of this.estado) {
                                                  if (estadoItem == this.FormPedidoExterno.value.PedEstadoId) {

                                                    // Llenado de formulario
                                                    this.FormPedidoExterno.setValue({
                                                      PedClienteNombre: `${clienteItem}`,
                                                      PedSedeCli_Id: `${sedeCliItem}`,
                                                      PedUsuarioNombre:`${usuarioItem}`,
                                                      PedFecha: `${this.FormPedidoExterno.value.PedFecha}`,
                                                      PedFechaEnt: `${this.FormPedidoExterno.value.PedFechaEnt}`,
                                                      PedEstadoId: `${estadoItem}`,
                                                      PedObservacion: `${this.FormPedidoExterno.value.PedObservacion}`,
                                                      ProdId: `${datos_productosInfo[index].prod_Id}`,
                                                      ProdNombre: `${datos_productosInfo[index].prod_Nombre}`,
                                                      ProdAncho: `${datos_productosInfo[index].prod_Ancho}`,
                                                      ProdFuelle: `${datos_productosInfo[index].prod_Fuelle}`,
                                                      ProdCalibre: `${datos_productosInfo[index].prod_Calibre}`,
                                                      ProdUnidadMedidaACF: `${datos_productosInfo[index].undMedACF}`,
                                                      ProdTipo: `${datos_tiposProductos[k].tpProd_Nombre}`,
                                                      ProdCantidad: `${this.FormPedidoExterno.value.ProdCantidad}`,
                                                      ProdUnidadMedidaCant: `${this.FormPedidoExterno.value.ProdUnidadMedidaCant}`,
                                                      ProdPrecioUnd: `${datos_existencias[i].exProd_Precio}`,
                                                      ProdTipoMoneda: `${datos_tiposMondedas[j].tpMoneda_Id}`,
                                                      ProdStock: `${datos_existencias[i].exProd_Cantidad}`,
                                                      ProdDescripcion: `${datos_productosInfo[index].prod_Descripcion}`,
                                                    });
                                                    break;
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  break;
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
    this.pedidoproductoService.srvObtenerListaPorId(this.FormConsultaPedidoExterno.value.PedExtIdConsulta).subscribe(datos_pedidosExternos => {
      this.pedidosProductos.push(datos_pedidosExternos);
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
        if (this.FormPedidoExterno.value.PedUsuarioNombre == dato_nombre) {
          let dato_id: number = datos_usuarios[i].usua_Id;
          console.log(`El número de identificacion del Usuario ${dato_nombre} es ${dato_id}`);
          break;
        }else if (this.FormPedidoExterno.value.PedUsuarioNombre == "") {
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
  html2pdf().from(element).set(opt).save();
  }
//Se obtiene el ultimo codigo del pedido y se incrementa en 1. (Contador)
  ObtenerUltimoPedido() {
    let ultimoCodigoPedido : number;

    this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(dataPedExternos =>{
      for (let index = 0; index < dataPedExternos.length; index++) {

        ultimoCodigoPedido = dataPedExternos[index].pedExt_Codigo;
        this.contadorPedidosExternos = ultimoCodigoPedido + 1

        console.log('Ultimo codigo pedido: ' + ultimoCodigoPedido );
        console.log('Ultimo codigo Pedido a guardar: ' + this.contadorPedidosExternos);
        //console.log(this.contadorPedidosExternos);
      }
    });
  }

  cargarFormProductoEnTablas(){

    let data = []
    let productoExt : any = {
      Produ_Id : this.FormPedidoExterno.get('ProdId')?.value,
      Produ_Nombre : this.FormPedidoExterno.get('ProdNombre').value,
      Produ_Ancho : this.FormPedidoExterno.get('ProdAncho').value,
      Produ_Fuelle : this.FormPedidoExterno.get('ProdFuelle').value,
      Produ_Calibre : this.FormPedidoExterno.get('ProdCalibre').value,
      UndMedACF : this.FormPedidoExterno.get('ProdUnidadMedidaACF').value,
      TpProdu_Id : this.FormPedidoExterno.get('ProdTipo').value,
      Produ_Cantidad : this.FormPedidoExterno.get('ProdCantidad').value,
      UndMedPeso : this.FormPedidoExterno.get('ProdUnidadMedidaCant')?.value,
      PrecioUnd : this.FormPedidoExterno.get('ProdPrecioUnd').value,
      TipoMoneda : this.FormPedidoExterno.get('ProdTipoMoneda').value,
      Stock : this.FormPedidoExterno.get('ProdStock').value,
      Produ_Descripcion : this.FormPedidoExterno.get('ProdDescripcion').value,
      Subtotal : this.FormPedidoExterno.get('ProdCantidad').value * this.FormPedidoExterno.get('ProdPrecioUnd')?.value
    }

      if(this.ArrayProducto.length == 0){
        //console.log(this.ArrayProducto);
        this.ArrayProducto.push(productoExt);
      } else {

      for (let index = 0; index < this.ArrayProducto.length; index++) {
        //console.log(this.ArrayProducto)
       /**/

       data = Object.values(productoExt.Produ_Id);

        console.log(data);
        console.log(productoExt.Produ_Id)

        if(data == this.ArrayProducto[index].Produ_Id) {
          Swal.fire('No se pueden cargar datos identicos a la tabla.')
      } else {
        this.ArrayProducto.push(productoExt);
        console.log('Llegue hasta aqui.')
      }

        break;
      }

    }
    for (let index = 0; index < this.ArrayProducto.length; index++) {
      this.valorTotal = this.ArrayProducto.reduce((accion, productoExt,) => accion + (productoExt.Produ_Cantidad * productoExt.PrecioUnd), 0)
      console.log(this.valorTotal);
    }

  }

  cargarDatosTablaProductos(){
    const producto : any = {
    }
  }

  CrearPedidoExterno() {
//    this.CaptarUsuarioSeleccionado();
//    this.captarSedeSeleccionada();

    const camposPedido : any = {
      PedExt_Codigo: this.contadorPedidosExternos,
      PedExt_FechaCreacion: this.FormPedidoExterno.get('PedFecha')?.value,
      PedExt_FechaEntrega: this.FormPedidoExterno.get('PedFechaEnt')?.value,
      Empresa_Id: this.EmpresaVendedora,
      SedeCli_Id: this.IDSedeSeleccionada,
      Usua_Id: this.UsuarioSeleccionado,
      Estado_Id: this.EstadoDocumentos,
      PedExt_Observacion: this.FormPedidoExterno.get('PedObservacion')?.value,
      PedExt_PrecioTotal: this.valorTotal,
      PedExt_Archivo: 1
    }

    let campoEstado = this.FormPedidoExterno.get('PedEstadoId')?.value
    //console.log(camposPedido);

    if(this.ArrayProducto.length == 0){
      Swal.fire('Debe cargar al menos un producto en la tabla.')

    } else if(campoEstado == "Finalizado" || campoEstado == "Cancelado" || campoEstado == "Anulado") {
      Swal.fire('No puede crear un pedido con el estado seleccionado. Por favor verifique.')

    }else{

      this.pedidoproductoService.srvGuardarPedidosProductos(camposPedido).subscribe(data=> {
        Swal.fire('¡Pedido guardado con éxito!');
        setTimeout(() => {
          this.LimpiarCampos();
          this.LimpiarTablaTotal();
          console.log(camposPedido.Usuario_Id);
        }, 2000);

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
      }
    }, error => { console.log(error); })
  }

//Funcion para validar que la fecha de entrega del pedido no sea menor o igual a la fecha de creación.
validarFechas(){

  let FechaCreacion : any;
  let FechaEntrega : any;

  FechaCreacion = this.FormPedidoExterno.get('PedFecha')?.value;
  FechaEntrega = this.FormPedidoExterno.get('PedFechaEnt')?.value;

  if (FechaEntrega <= FechaCreacion) {
    Swal.fire('La fecha de creación no puede ser menor o igual a la fecha de entrega.');
  } else {
    this.CrearPedidoExterno();
    //console.log('Correcto');
  }

}
//Función para captar el ID del estado según el nombre del estado seleccionado.
captarEstadoSeleccionado(){
  this.EstadoDeDocumentos = this.FormPedidoExterno.get('PedEstadoId')?.value;

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
  this.SedeSeleccionada = this.FormPedidoExterno.get('PedSedeCli_Id')?.value;

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
  let usuarioCombo = this.FormPedidoExterno.get('PedUsuarioNombre')?.value;

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
  let Estado = this.FormPedidoExterno.get('PedEstadoId')?.value

  if (Estado == "Finalizado" || Estado == "Anulado" || Estado == "Cancelado") {
    Swal.fire('No puede crear un pedido con el estado seleccionado. Por favor verifique.')
  }
}

}


