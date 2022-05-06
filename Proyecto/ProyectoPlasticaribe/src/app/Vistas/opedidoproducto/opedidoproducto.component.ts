import { ThisReceiver } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl, MinLengthValidator } from '@angular/forms';
import Swal from 'sweetalert2';
import { CrearSedesClientesComponent } from '../crear-sedes-clientes/crear-sedes-clientes.component';
import { OpedidoproductoService } from 'src/app/Servicios/opedidoproducto.service';
import { ProductoService } from 'src/app/Servicios/producto.service'

@Component({
  selector: 'app.opedidoproducto.component',
  templateUrl: './opedidoproducto.component.html',
  styleUrls: ['./opedidoproducto.component.css']
})
export class OpedidoproductoComponent implements OnInit {

  public FormPedidoExterno !: FormGroup; //Formulario de pedidos
  public FormSedesClientes !: FormGroup;

  //Llamar modales, inicializados como falsos para que no se carguen al ingresar a la pagina.
  public ModalCrearProductos: boolean = false;
  public ModalCrearCliente: boolean = false;
  public ModalSedesClientes: boolean= false;
  public TituloSedes = "";

  constructor(private pedidoproductoService : OpedidoproductoService, private productosServices : ProductoService, private frmBuilderPedExterno : FormBuilder) {

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
   }

  //Cargar al iniciar.
   ngOnInit(): void {
    this.initForms();
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
  validarCamposVacios() : any{
      if(this.FormPedidoExterno.valid){
        this.consultarDatos();
      }else{
        Swal.fire("Hay campos vacios");
      }
  }

  LimpiarCampos() {
    this.FormPedidoExterno.reset();
  }

  Alerta(){
    alert('Dime Hola');
  }

  /* FUNCION PARA LLENAR LOS INPUTS CON LOS DATOS DE LOS PEDIDOS DE PRODUCTOS DEPENDIENDO DE LA CONSULTA HECHA */
  consultarDatos(){
    
    this.pedidoproductoService.srvObtenerListaPedidosProductos().subscribe(datos_pedidosExternos=>{
      
      for (let i = 0; i < datos_pedidosExternos.length; i++) {
        const element = datos_pedidosExternos[i];
        this.llenarTabla();
      }

    }, error =>{ Swal.fire('Ocurrió un error, intentelo de nuevo'); });
  }

  /* FUNCIÓN PARA LLENAR LOS CAMPOS DE LA TABLA DE PRODUCTOS, DEPENDIENDO DE LA CONSULTA HECHA */
  llenarTabla(){
    this.productosServices.srvObtenerLista().subscribe(datos_productos=>{
      for (let i = 0; i < datos_productos.length; i++) {
        let productoId: number = datos_productos[i].Prod_Id;
        let productoNombre: string = datos_productos[i].Prod_Nombre;
        let ProductoDescripcion: string = datos_productos[i].Prod_Descripcion;
        let tipoProducto: number = datos_productos[i].TpProd_Id;
        let productoPesoBruto: number = datos_productos[i].Prod_Peso_Bruto;
        let productosPesoNeto: number = datos_productos[i].Prod_Peso_Neto;
        let undMedidaPeso: string = datos_productos[i].UndMedPeso;
        let productoFuelle: number = datos_productos[i].Prod_Fuelle;
        let productoAncho: number = datos_productos[i].Prod_Ancho;
        let productoCalibre: number = datos_productos[i].Prod_Calibre;
        let undMedidaFAC: string = datos_productos[i].UndMedACF;

        let productoIdTabla = document.getElementById('id')
      }
    }, error =>{ Swal.fire('Ocurrió un error, intentelo de nuevo'); });
  }
}

