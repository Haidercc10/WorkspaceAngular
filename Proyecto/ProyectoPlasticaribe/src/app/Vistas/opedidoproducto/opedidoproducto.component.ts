import { ThisReceiver } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl, MinLengthValidator } from '@angular/forms';
import Swal from 'sweetalert2';
import { CrearSedesClientesComponent } from '../crear-sedes-clientes/crear-sedes-clientes.component';

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

  constructor(private frmBuilderPedExterno : FormBuilder) {

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
     })
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
         ProdStock: ['', Validators.required]
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
  validarCamposVacios() : any{
      if(this.FormPedidoExterno.valid){

        Swal.fire("Los datos se enviaron correctamente");
        //this.LimpiarCampos();
        console.log(this.FormPedidoExterno);
      }else{
        Swal.fire("Hay campos vacios");
        console.log(this.FormPedidoExterno);
      }
  }

  LimpiarCampos() {
    this.FormPedidoExterno.reset();
  }

  Alerta(){
    alert('Dime Hola');
  }



}

