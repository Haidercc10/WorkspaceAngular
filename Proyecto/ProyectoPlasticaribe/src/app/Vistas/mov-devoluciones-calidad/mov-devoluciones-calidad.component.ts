import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { AppComponent } from 'src/app/app.component';
import { DevolucionesCalidadComponent } from '../devoluciones-calidad/devoluciones-calidad.component';
import { DevolucionesCalidadService } from 'src/app/Servicios/Devoluciones_Calidad/devoluciones-calidad.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';

@Component({
  selector: 'app-mov-devoluciones-calidad',
  templateUrl: './mov-devoluciones-calidad.component.html',
  styleUrls: ['./mov-devoluciones-calidad.component.css']
})
export class MovDevolucionesCalidadComponent {
  formFilters !: FormGroup;
  load: boolean = false;
  modoSeleccionado: boolean;
  validateRole: number;
  storage_Id : number;
  storage_Nombre : any;
  serchedData: any[] = [];
  @ViewChild('dt') dt: Table;
  clients: any[] = [];
  items : any = [];
  typesMovements: any = ['INTERNO', 'EXTERNO'];
  products : any = [];

  constructor(
    private appComponent : AppComponent,
    private frmBuilder : FormBuilder, 
    private svDevQuality : DevolucionesCalidadService,
    private svZeusInv : InventarioZeusService, 
    private msg : MensajesAplicacionService,
    private svProducts : ProductoService,
  ){
      this.modoSeleccionado = this.appComponent.temaSeleccionado;
      this.initForm();
  }  

  ngOnInit() {
    this.readStorage();
    this.loadRankDates();
  }

  //Función para cargar fechas en el rango.
  loadRankDates(){
    let initialDate = new Date(moment().subtract(30, 'days').format('YYYY-MM-DD'));
    this.formFilters.patchValue({ 'startDate' : initialDate, 'endDate' : new Date() });
  }

  readStorage(){
    this.storage_Id = this.appComponent.storage_Id;
    this.storage_Nombre = this.appComponent.storage_Nombre;
    this.validateRole = this.appComponent.storage_Rol;
  }

  initForm(){
    this.formFilters = this.frmBuilder.group({
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      typeMov: [null, ],
      ot: [null, ],
      item: [null ],
      client: [null ],
    });
  }

  validateUrl(){
    let ot: any = this.formFilters.value.ot;
    let typeRejected: any = this.formFilters.value.typeMov;
    let client : any = this.formFilters.value.client;
    let item : any = this.formFilters.value.item;
    let url : string = ``;

    if(ot != null) url += `ot=${ot}`;
    if(client != null) url.length > 0 ? url += `&client=${client}` : url += `client=${client}`;
    if(item != null) url.length > 0 ? url += `&item=${item}` : url += `item=${item}`;
    if(typeRejected != null) url.length > 0 ? url += `&typeRejected=${typeRejected}` : url += `typeRejected=${typeRejected}`;

    if(url.length > 0) url = `?${url}`;
    return url;
  }

  searchClients() {
    let idClient = this.formFilters.value.clientId;
    this.svZeusInv.getClientByIdThird(idClient).subscribe(data => {
      data.forEach(cli => { this.formFilters.patchValue({ 'clientId': cli.idcliente, 'client': cli.razoncial, }); });
    }, error => this.errorMessage(`¡No se encontró información del cliente consultado!`, error));
  }

  searchClientsByName() {
    let name = this.formFilters.value.client;
    this.svZeusInv.getClientByName(name).subscribe(data => this.clients = data);
  }

  selectClient() {
    let client = this.clients.find(x => x.idcliente == this.formFilters.value.client);
    this.formFilters.patchValue({ 'clientId': client.idcliente, 'client': client.razoncial, });
  }

  searchProduct() {
    let nombre: string = this.formFilters.value.reference;
    this.svProducts.obtenerItemsLike(nombre).subscribe(resp => this.products = resp);
  }

  selectedProduct() {
    let producto: any = this.formFilters.value.reference;
    this.formFilters.patchValue({
      item: producto,
      reference: this.products.find(x => x.prod_Id == producto).prod_Nombre
    });
  }

  searchData(){
    let date1 : any = moment(this.formFilters.value.startDate).format('YYYY-MM-DD');
    let date2 : any = moment(this.formFilters.value.endDate).format('YYYY-MM-DD');

    this.svDevQuality.getMovementsDvQuality(date1, date2, this.validateUrl()).subscribe(data => {
      this.serchedData = data;
      console.log(data);
    }, error => {
      console.log(error);
    });
  }

  exportExcel(){}

  errorMessage(message: string, error: HttpErrorResponse) {
    this.load = false;
    this.msg.mensajeError(message, `Error: ${error.statusText} | Status: ${error.status}`);
  }
}
