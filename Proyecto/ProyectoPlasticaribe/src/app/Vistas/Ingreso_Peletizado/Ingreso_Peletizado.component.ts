import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { FallasTecnicasService } from 'src/app/Servicios/FallasTecnicas/FallasTecnicas.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { MaterialProductoService } from 'src/app/Servicios/MaterialProducto/materialProducto.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { TipoRecuperadoService } from 'src/app/Servicios/TipoRecuperado/tipoRecuperado.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-Ingreso_Peletizado',
  templateUrl: './Ingreso_Peletizado.component.html',
  styleUrls: ['./Ingreso_Peletizado.component.css']
})
export class Ingreso_PeletizadoComponent implements OnInit {

  load : boolean = false; //Variable que servirá para mostrar el spinner de carga
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  form !: FormGroup; //Variable que contiene el formulario
  materials : any = [];
  typesRecovery : any = [];
  fails : any = [];
  process : any = [];
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  presentations : Array<string> = [];
  matPrimas : any = [];
  products : any = [];  

  constructor(private AppComponent : AppComponent, 
    private svMaterials : MaterialProductoService, 
    private svTypesRecovery : TipoRecuperadoService,
    private svFails : FallasTecnicasService,
    private FrmBuilder : FormBuilder,
    private svMsjs : MensajesAplicacionService,
    private svProcess : ProcesosService,
    private svMatPrimas : MateriaPrimaService,
    private svProducts : ProductoService,
    private svUnits : UnidadMedidaService,
    private svBagpro : BagproService,
  ) { 
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;

    this.form = this.FrmBuilder.group({
      ot : [null],
      roll : [null],
      material : [null, Validators.required],
      typeRecovery : [null, Validators.required],
      fail : [null, Validators.required],
      quantity : [null, Validators.required],
      presentation : [null, Validators.required],
      observation : [null], 
      process : [null, Validators.required],
      item : [null, Validators.required],
      product : [null, Validators.required], 
      mp : [null, Validators],
      matprima : [null, Validators.required],
    });

    //this.disableForm();
    //this.initForm();
  }

  ngOnInit() {
    this.getMaterials();
    this.getTypesRecovery();
    this.getFails();
    this.getProcess();
    this.getUnits();
    this.getMatPrimas();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  //Función para inicializar el formulario.
  initForm(){
   
    //this.disableForm();
  }

  disableForm(){
    this.form.disable();
    setTimeout(() => { this.form.get('typeRecovery')?.enable(); }, 100);
  }

  enableForm = () => this.form.enable();

  //Función para obtener los diferentes tipos de materiales. 
  getMaterials = () => this.svMaterials.srvObtenerLista().subscribe(data => { this.materials = data }, error => { this.svMsjs.mensajeError(`Error`, `Error al consultar los materiales. | ${error}`); });

  //Función para obtener los tipos de recuperado
  getTypesRecovery = () => this.svTypesRecovery.GetTodo().subscribe(data => { this.typesRecovery = data }, error => { this.svMsjs.mensajeError(`Error`, `Error al consultar los tipos de recuperados. | ${error}`); });

  //Función para obtener los tipos de fallas/no conformidades. 
  getFails = () => this.svFails.srvObtenerLista().subscribe(data => { this.fails = data.filter(x => ![1,12].includes(x.tipoFalla_Id)) }, error => { this.svMsjs.mensajeError(`Error`, `Error al consultar las no conformidades. | ${error}`); });

  //Función para obtener los procesos.
  getProcess = () => this.svProcess.srvObtenerLista().subscribe(data => { this.process = data.filter(x => [6,5,14,9,1,2,7,3,4].includes(x.proceso_Codigo)) }, error => { this.svMsjs.mensajeError(`Error`, `Error al consultar los procesos. | ${error}`); });

  //Función para obtener las diferentes presentaciones
  getUnits = () => this.svUnits.srvObtenerLista().subscribe(data => { this.presentations = data.filter(x => x.undMed_Id == 'Kg'); }, error => { this.svMsjs.mensajeError(`Error`, `Error al consultar las presentaciones. | ${error}`); })

  //Función para obtener las materias primas.
  getMatPrimas = () => this.svMatPrimas.srvObtenerLista().subscribe(data => { this.matPrimas = data.filter(x => [10,4].includes(x.catMP_Id)) }, error => { this.svMsjs.mensajeError(`Error`, `Error al consultar las materias primas. | ${error}`); });

  //Función para mostrar el mostrar el nombre de la materia prima en el campo
  selectMatPrimas(){
    let mp : any = this.form.value.matprima;
    this.form.patchValue({ 'mp': mp, 'matprima' : this.matPrimas.find(x => x.matPri_Id == mp).matPri_Nombre });
  }

  //Función para obtener los productos
  getProduct() {
    let nombre: string = this.form.value.product;
    this.svProducts.obtenerItemsLike(nombre).subscribe(data => this.products = data);
  }

  //Función para seleccionar los productos
  selectedProduct() {
    let producto: any = this.form.value.product;
    this.form.patchValue({ 'item': producto, 'reference': this.products.find(x => x.prod_Id == producto).prod_Nombre });
  }

  //Función para obtener datos de la OT
  getOrderProduction(){
    let ot : any = this.form.value.ot;
    let typeRecovery : any = this.form.value.typeRecovery;
    this.load = true;

    if(typeRecovery != null) {
      this.svBagpro.GetOrdenTrabajo(ot).subscribe(data => {
        this.loadFieldsForOT(data[0]);
      }, error => { 
        this.msjs(`Error`, `Error al consultar la OT N° ${ot} | ${error}`);
        this.clearFields(); 
      });
    } else this.msjs(`Advertencia`, `Debe seleccionar el tipo de recuperado!`);
  }

  //Cargar campos en función de los datos la OT. 
  loadFieldsForOT(data : any){
    this.form.patchValue({
      'item' : data.id_Producto, 
      'product' : data.producto,
      'material' : parseInt(data.id_Material.trim()),
    });
    this.load = false;
  }

  getRollProduction(){}

  addPeletizado(){
    console.log(this.form.value);
  }

  //Función para limpiar campos
  clearFields(){
    this.form.reset();
    this.disableForm();
    this.load = false;
  }

  

  //Función para mostrar los diferentes tipos de msjs.
  msjs(msj1 : string, msj2 : string){
    this.load = false;
    switch (msj1) {
      case 'Confirmación' :
        return this.svMsjs.mensajeConfirmacion(msj1, msj2);
      case 'Advertencia' :
        return this.svMsjs.mensajeAdvertencia(msj1, msj2);
      case 'Error' :
        return this.svMsjs.mensajeError(msj1, msj2);  
      default :
        return this.svMsjs.mensajeAdvertencia(msj1, msj2); 
    }
  }
}
