import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { AppComponent } from 'src/app/app.component';
import { ClientesService } from 'src/app/Servicios/Clientes/clientes.service';
import { Detalles_PrecargueDespachoService } from 'src/app/Servicios/Detalles_PrecargueDespacho/Detalles_PrecargueDespacho.service';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Precargue_RollosDespachoComponent } from '../Precargue_RollosDespacho/Precargue_RollosDespacho.component';

@Component({
  selector: 'app-Mov_PrecargueDespacho',
  templateUrl: './Mov_PrecargueDespacho.component.html',
  styleUrls: ['./Mov_PrecargueDespacho.component.css']
})
export class Mov_PrecargueDespachoComponent implements OnInit {

  form !: FormGroup;
  load: boolean = false;
  modoSeleccionado: boolean;
  ValidarRol : number;
  storage_Id : number;
  storage_Nombre : any;
  searchedData: any[] = [];
  @ViewChild('dt') dt: Table;
  modal : boolean = false;

  clients : any = [];
  statuses : any = [];

  constructor(
    private appComponent: AppComponent,
    private frmBuilder: FormBuilder,
    private svStatuses: EstadosService,
    private svMsjs : MensajesAplicacionService,
    private svZeus : InventarioZeusService,
    private svDtlPreload : Detalles_PrecargueDespachoService,
    private cmpPreload : Precargue_RollosDespachoComponent,
  ) {
      this.initForm();
      this.modoSeleccionado = this.appComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.readStorage();
    this.loadRankDates();
    this.getStatuses();
  }

  //*Función para cargar las fechas desde que inicia el modulo.
  loadRankDates(){
    let initialDate = new Date(moment().subtract(30, 'days').format('YYYY-MM-DD'));
    this.form.patchValue({ 'startDate' : initialDate, 'endDate' : new Date() });
  }

  //*
  getStatuses = () => this.svStatuses.srvObtenerListaEstados().subscribe(data => { this.statuses = data.filter(x => [11,5].includes(x.estado_Id))  }, error => { this.msjs(`Error`, `Error al consultar los estados.`) });

  //*
  initForm(){
    this.form = this.frmBuilder.group({
      id : [null],
      startDate : [null, Validators.required],
      endDate : [null, Validators.required],
      idClient: [null],
      client: [null],
      status: [null],
    });
  }

  //*Leer storage del navegador.  
  readStorage() {
    this.storage_Id = this.appComponent.storage_Id;
    this.ValidarRol = this.appComponent.storage_Rol;
  }

  //*
  searchClientsByName() {
    let name = this.form.value.client;
    this.svZeus.getClientByName(name).subscribe(data => this.clients = data);
  }

  //*
  selectClient() {
    let client = this.clients.find(x => x.idcliente == this.form.value.client);
    this.form.patchValue({ 'idClient': client.idcliente, 'client': client.razoncial, });
  }

  //*
  clearFields(){
    this.form.reset();
    this.searchedData = [];
    this.loadRankDates();
  }

  //*
  searchData(){
    this.load = true;
    let date1 : any = moment(this.form.value.startDate).format('YYYY-MM-DD');
    let date2 : any = moment(this.form.value.endDate).format('YYYY-MM-DD');

    this.svDtlPreload.getMovementsPreload(date1, date2, this.validateUrl()).subscribe(data => {
      this.searchedData = data;
      this.load = false;
    }, error => {
      this.msjs(`Error`, `Error al consultar los datos de Precargue.`);
    });
  }

  //*
  validateUrl(){
    let id: any = this.form.value.id;
    let status: any = this.form.value.status;
    let client : any = this.form.value.idClient;
    let url : string = ``;

    if(id != null) url += `id=${id}`;
    if(status != null) url.length > 0 ? url += `&status=${status}` : url += `status=${status}`;
    if(client != null) url.length > 0 ? url += `&roll=${client}` : url += `roll=${client}`;

    if(url.length > 0) url = `?${url}`;
    return url;
  }

  //*
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
        return this.svMsjs.mensajeAdvertencia(`No hay un tipo de mensaje asociado!`); 
    }``
  }

  discardPreload(){}

  //*
  createPDF(id : number){
    this.cmpPreload.createPDF(id, `descargado`);
  }

  

}
