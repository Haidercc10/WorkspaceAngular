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

@Component({
  selector: 'app.opedidoproducto.component',
  templateUrl: './opedidoproducto.component.html',
  styleUrls: ['./opedidoproducto.component.css']
})

export class OpedidoproductoComponent implements OnInit {

  public FormPedidoExterno !: FormGroup; //Formulario de pedidos
  public FormSedesClientes !: FormGroup;
  public FormConsultaPedidoExterno !: FormGroup;

  //Llamar modales, inicializados como falsos para que no se carguen al ingresar a la pagina.
  public ModalCrearProductos: boolean = false;
  public ModalCrearCliente: boolean = false;
  public ModalSedesClientes: boolean= false;
  public TituloSedes = "";

  // VARIABLES PARA PASAR A LOS COMBOBOX
  cliente:ClientesService[]=[];
  sedeCliente:SedeClienteService[]=[];
  usuarioVendedor:UsuarioService[]=[];
  producto:ProductoService[]=[];
  tipoProducto:TipoProductoService[]=[];
  undMed:UnidadMedidaService[]=[];
  tipoMoneda:TipoMonedaService[]=[];

  pedidosProductos:OpedidoproductoService[]=[];

  pedidoID:OpedidoproductoService[]=[];
  pedidoFechaPedido:OpedidoproductoService[]=[];
  pedidoFechaEntrega:OpedidoproductoService[]=[];
  pedidoCliente:OpedidoproductoService[]=[];
  pedidoEstado:OpedidoproductoService[]=[];
  pedidoObservaion:OpedidoproductoService[]=[];
  pedidoPrecioTotal:OpedidoproductoService[]=[];
  pedidoArchivo:OpedidoproductoService[]=[];

  constructor(private pedidoproductoService : OpedidoproductoService,
     private productosServices : ProductoService,
      private clientesService :ClientesService,
        private sedesClientesService: SedeClienteService,
         private usuarioService: UsuarioService,
          private unidadMedidaService : UnidadMedidaService,
            private tiposProductosService : TipoProductoService,
              private tipoMonedaService : TipoMonedaService,
                private frmBuilderPedExterno : FormBuilder) {

    this.FormPedidoExterno = this.frmBuilderPedExterno.group({

       //Instanciar campos que vienen del formulario
       //Pedidos
       PedClienteId: new FormControl(),
       PedSedeCli_Id: new FormControl(),
       PedUsuarioId: new FormControl(),
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
    this.sedesClientesComboBox();
    this.usuarioVendedorComboBox();
    this.estadoComboBox();
    this.productoComboBox();
    this.undMedidaComboBox();
    this.tipoProductoComboBox();
    this.tipoMonedaComboBox();
  }

  initForms() {
    //Campos que vienen del formulario
    this.FormPedidoExterno = this.frmBuilderPedExterno.group({
      //Datos para la tabla de pedidos.
        PedClienteId: ['', Validators.required],
        PedSedeCli_Id: ['', Validators.required],
        PedUsuarioId: ['', Validators.required],
        PedFecha: ['', Validators.required],
        PedFechaEnt: ['', Validators.required],
        PedEstadoId: ['', Validators.required],
        PedObservacion: [''],
      //Datos para la tabla de productos.
        ProdId:['',  Validators.required],
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
        PedExtIdConsulta:  [, Validators.required],
        PedExtFechaConsulta: [, Validators.required],
        PedExtFechaEntregaConsulta: [, Validators.required],
        PedExtEstadoConsulta: [, Validators.required]
      })

  }

  //Cargar modal de crear producto
  LlamarModalCrearProducto() {
    this.ModalCrearProductos = true;
  }

  LlamarModalCrearCliente() {
    this.ModalCrearCliente = true;
  }

  LlamarModalSedesClientes(){
    this.ModalSedesClientes = true;
    this.TituloSedes = "Crear sedes clientes"
    //this.crearSedes.initFormsSedes();
  }

  // VALIDACION PARA CAMPOS VACIOS
  validarCamposVacios(){
      if(this.FormPedidoExterno.valid){
        this.consultarDatos();
      }else{
        Swal.fire("Hay campos vacios");
      }
  }

  LimpiarCampos() {
    this.FormPedidoExterno.reset();
  }

  /* EMPIEZA A HACE LAS RESPECTIVAS VALIDACIONES PARA MOSTRAR DATOS EN LOS COMBOBOX DESDE QUE ARRANCA LA PAGINA */
  clientesComboBox(){
    this.clientesService.srvObtenerLista().subscribe(datos_cliente=>{
      for (let index = 0; index < datos_cliente.length; index++) {
        this.cliente.push(datos_cliente[index].cli_Nombre);
      }
    });
  }

  sedesClientesComboBox(){
    this.sedesClientesService.srvObtenerLista().subscribe(datos_sedeCliente=>{
      for (let index = 0; index < datos_sedeCliente.length; index++) {
        this.sedeCliente.push(datos_sedeCliente[index].sedecli_Nombre);
      }
    });
  }

  usuarioVendedorComboBox(){
    this.usuarioService.srvObtenerListaUsuario().subscribe(datos_usuario=>{
      for (let index = 0; index < datos_usuario.length; index++) {
        this.usuarioVendedor.push(datos_usuario[index].usua_Nombre);
      }
    });
  }

  estadoComboBox(){

  }

  productoComboBox(){
    this.productosServices.srvObtenerLista().subscribe(datos_productos=>{
      for (let index = 0; index < datos_productos.length; index++) {
        this.producto.push(datos_productos[index].prod_Nombre);
      }
    });
  }

  tipoProductoComboBox(){
    this.tiposProductosService.srvObtenerLista().subscribe(datos_tiposProductos=>{
      for (let index = 0; index < datos_tiposProductos[index].length; index++) {
        this.tipoProducto.push(datos_tiposProductos[index].tpProd_Nombre);
      }
    });
  }

  undMedidaComboBox(){
    this.unidadMedidaService.srvObtenerLista().subscribe(datos_undMed=>{
      for (let index = 0; index < datos_undMed.length; index++) {
        this.undMed.push(datos_undMed[index].undMed_Nombre);
      }
    }, error =>{ Swal.fire('Ocurrió un error, intentelo de nuevo'); });
  }

  tipoMonedaComboBox(){
    this.tipoMonedaService.srvObtenerLista().subscribe(datos_tipoMoneda=>{
      for (let index = 0; index < datos_tipoMoneda.length; index++) {
        this.tipoMoneda.push(datos_tipoMoneda[index].tpMoneda_Id);
      }
    });
  }

  usuarioVendedorId(){
    this.usuarioService.srvObtenerListaUsuario().subscribe(datos_usuario=>{
      for (let index = 0; index < datos_usuario.length; index++) {
        this.usuarioVendedor.push(datos_usuario[index].usua_Nombre);
      }
    });
  }

  /* FUNCION PARA LLENAR LOS INPUTS CON LOS DATOS DE LOS PEDIDOS DE PRODUCTOS DEPENDIENDO DE LA CONSULTA HECHA */
  consultarDatos(){
    this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidosExternos=>{
      for (let i = 0; i < datos_pedidosExternos.length; i++) {
        if (this.FormConsultaPedidoExterno.value.PedExtIdConsulta == datos_pedidosExternos[i].pedExt_Id) {

          this.llenarTabla();

        }else if(this.FormConsultaPedidoExterno.value.PedExtFechaConsulta == datos_pedidosExternos[i].pedExt_FechaCreacion){

        }else if(this.FormConsultaPedidoExterno.value.PedExtFechaEntregaConsulta == datos_pedidosExternos[i].pedExt_FechaEntrega){

        }else if (this.FormConsultaPedidoExterno.value.PedExtEstadoConsulta == datos_pedidosExternos[i].estado) {

        } else {

        }


        /* FORMA PARA QUE AL MOMENTO DE CONSULTAR UN PEDIDO, SE LLENEN EL RESTO DE DATOS DEL PEDIDO CONSULTADO.
        ESTO SE HARIA LLAMANDO AL DOM EN EL TS Y LUEGO SE LE ASIGNAN LOS VALORES QUE SE VAN A MOSTRAR.

        let prueba: string | undefined | any = this.pedidosProductos.push(datos_pedidosExternos[i].pedExt_Observacion)
        let observacion: HTMLElement = document.getElementById('#PextObservacion');
        observacion.innerHTML = prueba;
        */
      }
    }, error =>{ Swal.fire('Ocurrió un error, intentelo de nuevo'); });
  }

  /* FUNCIÓN PARA LLENAR LOS CAMPOS DE LA TABLA DE PRODUCTOS, DEPENDIENDO DE LA CONSULTA HECHA */
  llenarTabla(){
    this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidos=>{
      for (let index = 0; index < datos_pedidos.length; index++) {
        this.pedidosProductos.push(datos_pedidos[index]);
        console.log(this.pedidosProductos);
      }
    });
  }

  /* CONSULTAR EN LA TABLA DE USUARIOS EL NOMBRE ESTÁ DIGITADO EN EL COMBOBOX DE USUARIOS Y BUSCAR EL ID DE ESE NOMBRE PARA PASARSELO A LA TABLA DE PEDIDOS
    DE PRODUCTOS */
  consultarNombreUsuario(){
    this.usuarioService.srvObtenerListaUsuario().subscribe(datos_usuarios=>{
      for (let i = 0; i < datos_usuarios.length; i++) {
        let dato_nombre: number = datos_usuarios[i].usua_Nombre;
        if (this.FormPedidoExterno.value.PedUsuarioId == dato_nombre) {
          let dato_id: string = datos_usuarios[i].usua_Id;
          console.log(`El número de identificacion del Usuario ${dato_nombre} es ${dato_id}`);
          break;
        }
      }
    }, error =>{ Swal.fire('Ocurrió un error, intentelo de nuevo'); });
  }
}
