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
import { jsPDF } from 'jspdf';
import { EstadosService } from 'src/app/Servicios/estados.service';
import { TipoEstadosService } from 'src/app/Servicios/tipo-estados.service';
import { ExistenciasProductosService } from 'src/app/Servicios/existencias-productos.service';

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
  tipoProducto:TipoProductoService[]=[];
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

  constructor(private pedidoproductoService : OpedidoproductoService,
    private productosServices : ProductoService,
      private clientesService :ClientesService,
        private sedesClientesService: SedeClienteService,
          private usuarioService: UsuarioService,
            private tipoEstadoService : TipoEstadosService,
              private unidadMedidaService : UnidadMedidaService,
                    private frmBuilderPedExterno : FormBuilder,
                      private estadosService : EstadosService,
                        private existenciasProductosServices : ExistenciasProductosService) {

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
      ProdStock: new FormControl()
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
      PedObservacion: [''],
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
    });

    this.FormConsultaPedidoExterno = this.frmBuilderPedExterno.group({
      PedExtIdConsulta: [, Validators.required],
      PedExtFechaConsulta: [, Validators.required],
      PedExtFechaEntregaConsulta: [, Validators.required],
      PedExtEstadoConsulta: [, Validators.required]
    });

    this.FormConsultaPedidoExterno = this.frmBuilderPedExterno.group({
      PedExtIdConsulta:  [, Validators.required],
      PedExtFechaConsulta: [, Validators.required],
      PedExtFechaEntregaConsulta: [, Validators.required],
      PedExtEstadoConsulta: [, Validators.required]
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

    }else{
      Swal.fire("Hay campos vacios");
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
      this.estadosService.srvObtenerLista().subscribe(datos_estados=>{
        for (let index = 0; index < datos_estados.length; index++) {
          if (datos_tiposEstados.tpEstado_Id == datos_estados[index].tpEstado_Id) this.estado.push(datos_estados[index].estado_Nombre);          
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
          }
        }, error => { console.log(error); });
      }
    });
  }

  undMedidaComboBox() {
    this.unidadMedidaService.srvObtenerLista().subscribe(datos_undMed => {
      for (let index = 0; index < datos_undMed.length; index++) {
        this.undMed.push(datos_undMed[index].undMed_Nombre);
      }
    }, error => { Swal.fire('Ocurrió un error, intentelo de nuevo'); });
  }

  // FUNCIÓN PARA MOSTRAR LAS EXISTENCIAS DEL PRODUCTO ELEGIDO
  existencias (){
    let productoNombre : string = this.FormPedidoExterno.value.ProdNombre;
    this.productosServices.srvObtenerLista().subscribe(datos_productos => {
      this.existenciasProductos = [];
      for (let index = 0; index < datos_productos.length; index++) {
        if (datos_productos[index].prod_Nombre == productoNombre) {
          this.existenciasProductosServices.srvObtenerLista().subscribe(datos_existencias => {
            for (let i = 0; i < datos_existencias.length; i++) {
              if (datos_productos[index].prod_Id == datos_existencias[i].prod_Id) {
                this.existenciasProductos.push(datos_existencias[i]);
              }            
            }
          });
        }        
      }
    });
  }

  /* FUNCION PARA LLENAR LA TABLA CON LOS DATOS DE LOS PEDIDOS DE PRODUCTOS DEPENDIENDO DE LA CONSULTA HECHA */
  consultarDatosPedidos(){
    //FORMA NUMERO 1 DE HACER LA CONSULTA DE PEDIDOS DE PRODUCTOS, ESTA FORMA BUSCA EL PEDIDO UNICAMENTE POR EL ID DE ESTE MISMO.
    this.pedidoproductoService.srvObtenerListaPorId(this.FormConsultaPedidoExterno.value.PedExtIdConsulta).subscribe(datos_pedidosExternos => {
      this.pedidosProductos.push(datos_pedidosExternos);
    }, error => { console.log(error); });

    //FORMA NUMERO 2 DE HACER LA CONSULTA DE PEDIDOS DE PRODUCTOS, ESTA FORMA BUSCA DEPENDIENDO DEL O LOS FILTROS QUE SE APLIQUEN
    this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidosExternos=>{
      for (let i = 0; i < datos_pedidosExternos.length; i++) {
        if(this.FormConsultaPedidoExterno.value.PedExtFechaConsulta == datos_pedidosExternos[i].pedExt_FechaCreacion){
          this.pedidosProductos.push(datos_pedidosExternos[i]);

        }else if(this.FormConsultaPedidoExterno.value.PedExtFechaEntregaConsulta == datos_pedidosExternos[i].pedExt_FechaEntrega){
          this.pedidosProductos.push(datos_pedidosExternos[i]);
        }else if (this.FormConsultaPedidoExterno.value.PedExtEstadoConsulta == datos_pedidosExternos[i].estado) {
          this.pedidosProductos.push(datos_pedidosExternos[i]);
        }else{
          this.pedidosProductos.push(datos_pedidosExternos[i]);
        }
      }
    }, error => { Swal.fire('Ocurrió un error, intentelo de nuevo'); });

  }

  /* CONSULTAR EN LA TABLA DE USUARIOS EL NOMBRE ESTÁ DIGITADO EN EL COMBOBOX DE USUARIOS Y BUSCAR EL ID DE ESE NOMBRE PARA PASARSELO A LA TABLA DE PEDIDOS
    DE PRODUCTOS */
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
      window.location.href = "./principal";
    }else if (salir == "n" || salir == "N" || salir == "no" || salir == "No" || salir == "NO" || salir == "nO"){
      console.log("continúe");
    }else {
      console.log("Digite valores validaos");
    }
  }

  downloadPDF(...args: []): void {
    const doc = new jsPDF();
    doc.save('hello-world.pdf');
    console.log('Generanado PDF');
  }
}
    