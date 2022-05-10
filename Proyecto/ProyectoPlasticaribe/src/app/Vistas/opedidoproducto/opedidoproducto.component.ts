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
import { modelProducto } from 'src/app/Modelo/modelProducto';
import { modelOpedidoproducto } from 'src/app/Modelo/modelOpedidoproducto';
import { SrvEstadosService } from 'src/app/Servicios/srv-estados.service';
import { modelEstado } from 'src/app/Modelo/modelEstado';
import { EmpresaService } from 'src/app/Servicios/empresa.service';

@Component({
  selector: 'app.opedidoproducto.component',
  templateUrl: './opedidoproducto.component.html',
  styleUrls: ['./opedidoproducto.component.css']
})

export class OpedidoproductoComponent implements OnInit {

  public FormPedidoExterno !: FormGroup; //Formulario de pedidos
  public FormSedesClientes !: FormGroup;
  public FormConsultaPedidoExterno !: FormGroup;

  selectClientes : string;

  //Llamar modales, inicializados como falsos para que no se carguen al ingresar a la pagina.
  public ModalCrearProductos: boolean = false;
  public ModalCrearCliente: boolean = false;
  public ModalSedesClientes: boolean= false;
  public TituloSedes = "";

  DatosEstado : modelEstado;


  // VARIABLES PARA PASAR A LOS COMBOBOX
  cliente:ClientesService[]=[];
  sedeCliente:SedeClienteService[]=[];
  usuarioVendedor:UsuarioService[]=[];
  producto:ProductoService[]=[];
  tipoProducto:TipoProductoService[]=[];
  undMed:UnidadMedidaService[]=[];
  tipoMoneda:TipoMonedaService[]=[];

  ComboboxEstados: SrvEstadosService [] = [];

  pedidosProductos:OpedidoproductoService[]=[];

  pedidoID:OpedidoproductoService[]=[];
  pedidoFechaPedido:OpedidoproductoService[]=[];
  pedidoFechaEntrega:OpedidoproductoService[]=[];
  pedidoCliente:OpedidoproductoService[]=[];
  pedidoEstado:OpedidoproductoService[]=[];
  pedidoObservaion:OpedidoproductoService[]=[];
  pedidoPrecioTotal:OpedidoproductoService[]=[];
  pedidoArchivo:OpedidoproductoService[]=[];

  contadorPedidosExternos : OpedidoproductoService[]=[];
  ArrayProducto : any[] = [];
  valorTotal : any;
  EmpresaVendedora : any;

  constructor(private pedidoproductoService : OpedidoproductoService,
     private productosServices : ProductoService,
      private clientesService :ClientesService,
        private sedesClientesService: SedeClienteService,
         private usuarioService: UsuarioService,
          private unidadMedidaService : UnidadMedidaService,
            private tiposProductosService : TipoProductoService,
              private tipoMonedaService : TipoMonedaService,
              private SrvEstadosService : SrvEstadosService,
               private SrvEmpresa : EmpresaService,
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
       ProdStock: new FormControl(),
       ProdDescripcion: new FormControl()
    });

    this.FormConsultaPedidoExterno = this.frmBuilderPedExterno.group({
      PedExtIdConsulta: new FormControl(),
      PedExtFechaConsulta: new FormControl(),
      PedExtFechaEntregaConsulta: new FormControl(),
      PedExtEstadoConsulta: new FormControl()
    });
    //this.contador = 0;
    this.ArrayProducto = [];
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
    this.estadosComboBox();
    this.cargarNombresCombos();
    this.ObtenerUltimoPedido();
    this.obtenerEmpresa();
  }

  initForms() {
    //Campos que vienen del formulario
    this.FormPedidoExterno = this.frmBuilderPedExterno.group({
      //Datos para la tabla de pedidos.
        PedClienteId: ['', Validators.required],
        PedSedeCli_Id: [''],
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
        ProdDescripcion: ['', Validators.required],
      });

      this.FormConsultaPedidoExterno = this.frmBuilderPedExterno.group({
        PedExtIdConsulta:  [, Validators.required],
        PedExtFechaConsulta: [, Validators.required],
        PedExtFechaEntregaConsulta: [, Validators.required],
        PedExtEstadoConsulta: [, Validators.required]
      })

  }

  cargarNombresCombos(){
    this.selectClientes = "Seleccione cliente"
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
        //Swal.fire("Valido");
        console.log('Formulario validado');
        console.log(this.FormPedidoExterno);
        //this.ArrayProducto.push(this.FormPedidoExterno);
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
        this.sedeCliente.push(datos_sedeCliente[index].sedeCli_Id);
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
      for (let index = 0; index < datos_tiposProductos.length; index++) {
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

  estadosComboBox(){
    this.SrvEstadosService.srvObtenerListaEstados().subscribe(dataEstados=>{
      for (let index = 0; index < dataEstados.length; index++) {
        this.ComboboxEstados.push(dataEstados[index].estado_Id);

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

 ObtenerUltimoPedido(){
    this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(dataPedExternos =>{
      for (let index = 0; index < dataPedExternos.length; index++) {
        this.contadorPedidosExternos.find(dataPedExternos[index].pedExt_Id)
        console.log(dataPedExternos);
        console.log(this.contadorPedidosExternos);
      }
    });
  }

  cargarFormProductoEnTablas(){

    let productoExt : any = {
      Produ_Id : this.FormPedidoExterno.get('ProdId')?.value,
      Produ_Nombre : this.FormPedidoExterno.get('ProdNombre')?.value,
      Produ_Ancho : this.FormPedidoExterno.get('ProdAncho')?.value,
      Produ_Fuelle : this.FormPedidoExterno.get('ProdFuelle')?.value,
      Produ_Calibre : this.FormPedidoExterno.get('ProdCalibre')?.value,
      UndMedACF : this.FormPedidoExterno.get('ProdUnidadMedidaACF')?.value,
      TpProdu_Id : this.FormPedidoExterno.get('ProdTipo')?.value,
      Produ_Cantidad : this.FormPedidoExterno.get('ProdCantidad')?.value,
      UndMedPeso : this.FormPedidoExterno.get('ProdUnidadMedidaCant')?.value,
      PrecioUnd : this.FormPedidoExterno.get('ProdPrecioUnd')?.value,
      TipoMoneda : this.FormPedidoExterno.get('ProdTipoMoneda')?.value,
      Stock : this.FormPedidoExterno.get('ProdStock')?.value,
      Produ_Descripcion : this.FormPedidoExterno.get('ProdDescripcion')?.value,
      Subtotal : this.FormPedidoExterno.get('ProdCantidad')?.value * this.FormPedidoExterno.get('ProdPrecioUnd')?.value
    }



      if(this.ArrayProducto.length == 0){
      console.log(this.ArrayProducto)
      this.ArrayProducto.push(productoExt);

    } else {

      for (let index = 0; index < this.ArrayProducto.length; index++) {
        if(this.FormPedidoExterno.value.ProdId == this.ArrayProducto[index]) {
            Swal.fire('No se pueden cargar datos identicos a la tabla.')
        } else {
          this.ArrayProducto.push(productoExt);
          console.log('Llegue hasta aqui.')

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

CrearPedidoExterno() {

  const camposPedido : any = {


    PedExt_Codigo: 1,
    PedExt_FechaCreacion: this.FormPedidoExterno.get('PedFecha')?.value,
    PedExt_FechaEntrega: this.FormPedidoExterno.get('PedFechaEnt')?.value,
    Empresa_Id: this.EmpresaVendedora,
    SedeCli_Id: this.FormPedidoExterno.get('PedSedeCli_Id')?.value,
    Estado_Id: this.FormPedidoExterno.get('PedEstadoId')?.value,
    PedExt_Observacion: this.FormPedidoExterno.get('PedObservacion')?.value,
    PedExt_PrecioTotal: this.valorTotal,
    PedExt_Archivo: 1


      }

      console.log(camposPedido.Empresa_Id);
      console.log(camposPedido.SedeCli_Id);
      console.log(camposPedido.Estado_Id);

      if(this.ArrayProducto.length == 0){
        Swal.fire('Debe cargar al menos un producto en la tabla.')
      } else {
        this.pedidoproductoService.srvGuardarPedidosProductos(camposPedido).subscribe(data=> {
          Swal.fire('¡Pedido guardado con éxito!');
        }, error => {
          console.log(error);
          console.log(camposPedido);
          console.log(camposPedido.Empresa_Id);
          console.log(camposPedido.SedeCli_Id);
          console.log(camposPedido.Estado_Id);
        })
      }


}

obtenerEmpresa(){


  this.SrvEmpresa.srvObtenerLista().subscribe((dataEmpresa) => {

    for (let index = 0; index < dataEmpresa.length; index++) {
        this.EmpresaVendedora = dataEmpresa[1].empresa_Id
        //console.log(dataEmpresa[1].empresa_Id);
    }

  }, error => {
    console.log(error);
  })
}



}
