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

@Component({
  selector: 'app-Mov_BodegaRollos',
  templateUrl: './Mov_BodegaRollos.component.html',
  styleUrls: ['./Mov_BodegaRollos.component.css']
})
export class Mov_BodegaRollosComponent implements OnInit {

  form: FormGroup;
  load: boolean = false;
  storage_Id: number;
  validateRole: number | undefined;
  selectedMode: boolean = false;
  products: any[] = [];
  dataSearched: Array<any> = [];
  @ViewChild('tableMov') tableMov: Table | undefined;
  modal : boolean = false;
  dataSelected : any = [];
  materiasPrimas : any [] = [];
  typesMovements : any = ['ENTRADA', 'SALIDA']; 
  dataFound : any = [];
  //@ViewChild(Ingreso_Rollos_ExtrusionComponent) cmpEntryStore : Ingreso_Rollos_ExtrusionComponent

  constructor(
    private appComponent: AppComponent,
    private frmBuilder: FormBuilder,
    private productsService: ProductoService,
    private msg: MensajesAplicacionService,
    private svDetStoreRolls : Detalle_BodegaRollosService, 
    private cmpOutputStore : Solicitud_Rollos_BodegasComponent,
    private cmpEntryStore : Ingreso_Rollos_ExtrusionComponent, 
  ) {
    this.selectedMode = this.appComponent.temaSeleccionado;
    this.initForm();
   }

  ngOnInit() {
    this.loadRankDates();
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
    });
  }

  //Función para cargar las fechas desde que inicia el modulo.
  loadRankDates(){
    let initialDate = new Date(moment().subtract(30, 'days').format('YYYY-MM-DD'));
    this.form.patchValue({ 'rankDates' : [initialDate, new Date()] });
  }

  //Función para obtener los movimientos de entradas y solicitudes de rollos
  getMovements(){
    this.dataFound = [];
    this.dataFound = [];

    if((this.form.value.rankDates).length == 2) {
      let date1 : any = moment(this.form.value.rankDates[0]).format('YYYY-MM-DD');
      let date2 : any = moment(this.form.value.rankDates[1]).format('YYYY-MM-DD');
      this.load = true;

      this.svDetStoreRolls.getMovementsStore(date1, date2, this.validateUrl()).subscribe(data => {
        this.dataFound = data;
        this.load = false;
      }, error => this.msg.mensajeError(`Error`, `No se ha podido consultar los movimientos de la bodega!`));
    } else this.msg.mensajeAdvertencia(`Advertencia`, `Debe elegir 2 fechas para consultar!`);
  }

  //Validar la url se pasará como parametro en el metodo que consulta el API.
  validateUrl(){
    let ot: any = this.form.value.orderProduction;
    let item: any = this.form.value.item;
    let roll : any = this.form.value.roll;
    let typeMov : any = this.form.value.typeMov;
    let url : string = ``;

    if(ot != null) url += `ot=${ot}`;
    if(item != null) url.length > 0 ? url += `&item=${item}` : url += `item=${item}`;
    if(roll != null) url.length > 0 ? url += `&roll=${roll}` : url += `roll=${roll}`;
    if(typeMov != null) url.length > 0 ? url += `&typeMov=${typeMov}` : url += `typeMov=${typeMov}`;

    if(url.length > 0) url = `?${url}`;
    console.log(url);
    return url;
  }

  //Función para limpiar los campos y las tablas. 
  clearFields(){
    this.form.reset();
    this.dataFound = [];
    this.dataFound = [];
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


  totalQty = () => this.dataFound.reduce((a, b) => a += b.quantity, 0);

  applyFilter = ($event, campo : any, table : any) => table!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  viewEntryPDF(data) {
    data.typeMov == 'SALIDA' ? this.cmpOutputStore.createPDF(data.movement, `exportada`) : this.cmpEntryStore.createPDF(data.movement, `exportada`);
  }
}
