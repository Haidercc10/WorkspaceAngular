import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { Detalle_BodegaRollosService } from 'src/app/Servicios/Detalle_BodegaRollos/Detalle_BodegaRollos.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { AppComponent } from 'src/app/app.component';
import { Ingreso_Rollos_ExtrusionComponent } from '../Ingreso_Rollos_Extrusion/Ingreso_Rollos_Extrusion.component';
import { Solicitud_Rollos_BodegasComponent } from '../Solicitud_Rollos_Bodegas/Solicitud_Rollos_Bodegas.component';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';

@Component({
  selector: 'app-Mov_BodegaRollos',
  templateUrl: './Mov_BodegaRollos.component.html',
  styleUrls: ['./Mov_BodegaRollos.component.css']
})
export class Mov_BodegaRollosComponent implements OnInit {

  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente

  form: FormGroup;
  load: boolean = false;
  validateRole: number | undefined;
  selectedMode: boolean = false;
  products: any[] = [];
  dataSearched: Array<any> = [];
  @ViewChild('tableMovIn') tableMovIn: Table | undefined;
  @ViewChild('tableMovOut') tableMovOut: Table | undefined;
  modal : boolean = false;
  dataSelected : any = [];
  materiasPrimas : any [] = [];
  typesMovements : any = ['ENTRADA', 'SALIDA', 'DEVOLUCIÓN']; 
  dataFoundIn : any = [];
  dataFoundOut : any = [];
  currentStore : string = ``;
  process : any = [];
  //@ViewChild(Ingreso_Rollos_ExtrusionComponent) cmpEntryStore : Ingreso_Rollos_ExtrusionComponent

  constructor(
    private appComponent: AppComponent,
    private frmBuilder: FormBuilder,
    private productsService: ProductoService,
    private msg: MensajesAplicacionService,
    private svDetStoreRolls : Detalle_BodegaRollosService, 
    private cmpOutputStore : Solicitud_Rollos_BodegasComponent,
    private cmpEntryStore : Ingreso_Rollos_ExtrusionComponent,
    private svProcess : ProcesosService, 
  ) {
    this.selectedMode = this.appComponent.temaSeleccionado;
    this.initForm();
   }

  ngOnInit() {
    this.lecturaStorage();
    this.loadRankDates();
    this.getProcess();
  }

  //*Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.appComponent.storage_Id;
    this.storage_Nombre = this.appComponent.storage_Nombre;
    this.ValidarRol = this.appComponent.storage_Rol;
  }

  //*
  getProcess() {
    this.svProcess.srvObtenerLista().subscribe(data => { 
      this.process = data.filter(x => [2,3,4,13,16].includes(x.proceso_Codigo));
      console.log(this.process);
      this.loadCurrentWareHouse(); 
    }, error => { 
      this.msg.mensajeError(`Error`, `Error al consultar los procesos. | ${error.status} ${error.statusText}`); 
    });
  } 

  //*
  loadCurrentWareHouse(){
    if([95,1].includes(this.ValidarRol))  {
      this.form.patchValue({ process : 'BGPI' });
      this.currentStore = ``;
    } else if([89].includes(this.ValidarRol)) {
      this.form.patchValue({ process : 'ROT' });
      this.currentStore = this.process.find(x => x.proceso_Id == 'ROT').proceso_Nombre;
    } else if([86].includes(this.ValidarRol)) {
      this.form.patchValue({ process : 'SELLA' });
      this.currentStore = this.process.find(x => x.proceso_Id == 'SELLA').proceso_Nombre;
    } else if([4].includes(this.ValidarRol)) {
      this.form.patchValue({ process : 'IMP' });
      this.currentStore = this.process.find(x => x.proceso_Id == 'IMP').proceso_Nombre;
    }  
  }
  
  //Función para inicializar formulario
  initForm() {
    this.form = this.frmBuilder.group({
      orderProduction: [null],
      rankDates : [null, Validators.required],
      item: [null],
      reference: [null],
      production: [null],
      typeMov : [null], 
      process : [null]
    });
  }

  //Función para cargar las fechas desde que inicia el modulo.
  loadRankDates(){
    let initialDate = new Date(moment().subtract(30, 'days').format('YYYY-MM-DD'));
    this.form.patchValue({ 'rankDates' : [initialDate, new Date()] });
  }

  //Función para obtener los movimientos de entradas y solicitudes de rollos
  getMovements(){
    this.dataFoundIn = [];
    this.dataFoundOut = [];
    this.load = true;

    if((this.form.value.rankDates).length == 2) {
      let date1 : any = moment(this.form.value.rankDates[0]).format('YYYY-MM-DD');
      let date2 : any = moment(this.form.value.rankDates[1]).format('YYYY-MM-DD');

      this.svDetStoreRolls.getMovementsStore(date1, date2, this.validateUrl()).subscribe(data => {
        this.dataFoundIn = data.filter(x => x.typeMov == 'ENTRADA');
        this.dataFoundOut = data.filter(x => x.typeMov == 'SALIDA');
        this.load = false;
      }, error => {
        this.msg.mensajeError(`Error`, `No se ha podido consultar los movimientos de la bodega!`);
        this.load = false;
      }); 
    } else {
      this.msg.mensajeAdvertencia(`Advertencia`, `Debe elegir 2 fechas para consultar!`);
      this.load = false;
    } 
  }

  //Validar la url se pasará como parametro en el metodo que consulta el API.
  validateUrl(){
    let ot: any = this.form.value.orderProduction;
    let item: any = this.form.value.item;
    let roll : any = this.form.value.production;
    let typeMov : any = this.form.value.typeMov;
    let process : any = this.form.value.process;
    let url : string = ``;
    

    if(ot != null) url += `ot=${ot}`;
    if(item != null) url.length > 0 ? url += `&item=${item}` : url += `item=${item}`;
    if(roll != null) url.length > 0 ? url += `&roll=${roll}` : url += `roll=${roll}`;
    if(typeMov != null) url.length > 0 ? url += `&typeMov=${typeMov}` : url += `typeMov=${typeMov}`;
    if(process != null) url.length > 0 ? url += `&process=${process}` : url += `process=${process}`;

    if(url.length > 0) url = `?${url}`;
    console.log(url);
    return url;
  }

  //Función para limpiar los campos y las tablas. 
  clearFields(){
    this.form.reset();
    this.dataFoundIn = [];
    this.dataFoundOut = [];
    this.loadRankDates();
  }

  //Función que busca un listado de items dependiendo los caracteres que haya en el campo referencia 
  searchProduct() {
    let nombre: string = this.form.value.reference;
    this.productsService.obtenerItemsLike(nombre).subscribe(resp => this.products = resp);
  }

  //Función que carga item y referencia dependiendo el que se seleccione en la lista.
  selectedProduct() {
    let producto: any = this.form.value.reference;
    this.form.patchValue({ 'item': producto, 'reference': this.products.find(x => x.prod_Id == producto).prod_Nombre });
  }

  totalQty = (data) => data.reduce((a, b) => a += b.quantity, 0);

  applyFilter = ($event, campo : any, table : any) => table!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  viewEntryPDF(data) {
    data.typeMov == 'SALIDA' ? this.cmpOutputStore.createPDF(data.movement, `exportada`) : this.cmpEntryStore.createPDF(data.movement, `exportada`);
  }
}
