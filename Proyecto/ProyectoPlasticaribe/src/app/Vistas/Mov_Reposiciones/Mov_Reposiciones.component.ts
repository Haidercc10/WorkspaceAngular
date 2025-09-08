import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Table } from 'exceljs';
import moment from 'moment';
import { AppComponent } from 'src/app/app.component';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Detalles_ReposicionesService } from 'src/app/Servicios/Detalles_Reposiciones/Detalles_Reposiciones.service';
import { ReposicionesComponent } from '../Reposiciones/Reposiciones.component';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { MessageService } from 'primeng/api';
import { ReposicionesService } from 'src/app/Servicios/Reposiciones/Reposiciones.service';
import { OverlayPanel } from 'primeng/overlaypanel';
import { CreacionExcelService } from 'src/app/Servicios/CreacionExcel/CreacionExcel.service';
import { FallasTecnicasService } from 'src/app/Servicios/FallasTecnicas/FallasTecnicas.service';

@Component({
  selector: 'app-Mov_Reposiciones',
  templateUrl: './Mov_Reposiciones.component.html',
  styleUrls: ['./Mov_Reposiciones.component.css']
})

export class Mov_ReposicionesComponent implements OnInit {

  form !: FormGroup;
  load: boolean = false;
  modoSeleccionado: boolean;
  ValidarRol : number;
  storage_Id : number;
  storage_Nombre : any;
  searchedData: any[] = [];
  @ViewChild('dt') dt: Table;
  modal : boolean = false;
  rollsFromRepo : any = [];
  rollsConsolidates : any = [];
  clients : any = [];
  statuses : any = [];
  selectedRepo : any = {};
  @ViewChild('op') op: OverlayPanel | undefined;
  observation : any = null;
  fails : any = [];

  constructor(
    private appComponent: AppComponent,
    private frmBuilder: FormBuilder,
    private svStatuses: EstadosService,
    private svMsjs : MensajesAplicacionService,
    private svZeus : InventarioZeusService,
    private svDtlRepositions : Detalles_ReposicionesService,
    private svRepo : ReposicionesService,
    private cmpRepostions : ReposicionesComponent,
    private svProduction : Produccion_ProcesosService,
    private msg : MessageService,
    private svExcel : CreacionExcelService,
    private svFails : FallasTecnicasService,
  ) {
      this.initForm();
      this.modoSeleccionado = this.appComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.readStorage();
    this.loadRankDates();
    this.getStatuses();
    this.getFails();
  }

  //*Función para cargar las fechas desde que inicia el modulo.
  loadRankDates(){
    let initialDate = new Date(moment().subtract(30, 'days').format('YYYY-MM-DD'));
    this.form.patchValue({ 'startDate' : initialDate, 'endDate' : new Date() });
  }
  
  getFails = () =>  this.svFails.srvObtenerLista().subscribe(datos => { this.fails = datos.filter((item) => item.tipoFalla_Id == 25) });

  //*
  getStatuses = () => this.svStatuses.srvObtenerListaEstados().subscribe(data => { this.statuses = data.filter(x => [11,5,3].includes(x.estado_Id))  }, error => { this.msjs(`Error`, `Error al consultar los estados.`) });

  //*
  initForm(){
    this.form = this.frmBuilder.group({
      id : [null],
      startDate : [null, Validators.required],
      endDate : [null, Validators.required],
      idClient: [null],
      client: [null],
      status: [null],
      fail : [null],
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
    this.observation = null;
    this.loadRankDates();
  }

  //*Función para consultar los movimientos de reposiciones
  searchData(){
    this.load = true;
    let date1 : any = moment(this.form.value.startDate).format('YYYY-MM-DD');
    let date2 : any = moment(this.form.value.endDate).format('YYYY-MM-DD');

    this.svDtlRepositions.getMovementsReposition(date1, date2, this.validateUrl()).subscribe(data => {
      this.searchedData = data;
      this.load = false;
    }, error => {
      this.msjs(`Error`, `Error al consultar los datos de la reposición | ${error.status} ${error.statusText}.`);
    });
  }

  //* Validar la URL que se enviará al API para consultar.
  validateUrl(){
    let id: any = this.form.value.id;
    let status: any = this.form.value.status;
    let client : any = this.form.value.idClient;
    let fail : any = this.form.value.fail;
    let url : string = ``;

    if(id != null) url += `id=${id}`;
    if(status != null) url.length > 0 ? url += `&status=${status}` : url += `status=${status}`;
    if(client != null) url.length > 0 ? url += `&roll=${client}` : url += `roll=${client}`;
    if(fail != null) url.length > 0 ? url += `&fail=${fail}` : url += `fail=${fail}`;

    if(url.length > 0) url = `?${url}`;
    return url;
  }

  //* Función para validar los mensajes a mostrar
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

  //*Función para mostrar el msj de confirmación de eliminación de rollos
  viewMsgAnullation(data : any) {
    this.load = true;
    this.selectedRepo = {};
    this.selectedRepo = data;
    this.cmpRepostions.searchRepositions(data.movement);
    setTimeout(() => { 
      this.rollsConsolidates = this.cmpRepostions.rollsConsolidate; 
      console.log(this.rollsConsolidates);
      this.msg.add({severity:'warn', key:'reposition', summary:'Elección', detail: `¿Está seguro que desea anular la reposición N° ${data.movement}?`, sticky: true});
    }, 2500);
  } 
  
  //* Función para quitar msj de confirmación.
  onReject(key : any) {
    this.load = false;
    this.msg.clear(key);
  }

  //* Función para anular la reposición y cambiar estado DISPONIBLE los rollos.
  discardReposition(){
    this.onReject('reposition');
    let data : any = {};
    data = this.selectedRepo;
    this.load = true;
    this.svProduction.putAvailableFromReposition(data.movement, this.storage_Id).subscribe(() => {
      this.msjs(`Confirmación`, `Reposición N° ${data.movement} anulada exitosamente!`);
      this.searchData();
    }, error => {
      this.msjs(`Error`, `Error al actualizar el estado de los rollos | ${error.status} ${error.statusText}.`);
      this.load = false;
    });
  }

  //*
  createPDF(id : number){
    this.cmpRepostions.createPDF(id, `descargada`);
  }

  //*
  sendAdjustment(data : any){
    this.cmpRepostions.sendPositiveAdjustment(data);
  }

  //*
  sendPositiveAdjustment(){
    let count : number = 0
    this.onReject('reposition');
    //data = this.rollsSelected;

    this.rollsConsolidates.forEach(data => {
      let unity : string = data.unit == 'Kg' ? 'KLS' : data.unit == 'Und' ? 'UND' : 'PAQ';
      //let qty : number = data.qty;
      let item : string = data.item; 
      let price : string = data.price;
      let detail : string = `Ajuste desde App Plasticaribe por concepto de REPOSICION al Item ${item} con cantidad de ${(this.cmpRepostions.qtyTotalItem(data))} ${unity}`;
      
      this.svProduction.sendProductionToZeus(detail, item, unity, 0, (this.cmpRepostions.qtyTotalItem(data)).toString(), price).subscribe(dataAdjusment => {
        count++
        if(this.rollsConsolidates.length == count) this.discardReposition();
      }, error => { this.msjs(`Error`, `No fue posible enviar el ajuste positivo a Zeus | ${error.status} ${error.statusText}`); });
    });
  }


  finishRepo(data : any){
    this.onReject('finishReposition');
    this.load = true;
    let info : any = [{ 'user' : this.storage_Id, 'status' : 5 }]
    this.svRepo.putReposition(data.movement, info).subscribe(() => {
      this.msjs(`Confirmación`, `Reposición N° ${data.movement} finalizada exitosamente!`);
      this.load = false;
    }, error => {
      this.msjs(`Error`, `Error al finalizar la reposición N° ${data.movement} | ${error.status} ${error.statusText}.`);
      this.load = false;
    });
  }

  //*Función para mostrar el msj de confirmación de eliminación de rollos
  viewMsgFinishRepo(data : any) {
    this.load = true;
    this.selectedRepo = {};
    this.selectedRepo = data;
    this.cmpRepostions.searchRepositions(data.movement);
    setTimeout(() => { 
      this.rollsConsolidates = this.cmpRepostions.rollsConsolidate;   
      console.log(this.rollsConsolidates);
    }, 1000);
    this.msg.add({severity:'warn', key:'finishReposition', summary:'Elección', detail: `¿Está seguro que desea finalizar la reposición N° ${data.movement}?`, sticky: true});
  }

  //*Función para mostrar la observación de la orden de reposición. 
  viewObservation($event, data : any){
    this.observation = data.observation1;
    if (this.observation != null) {
      setTimeout(() => {
        this.op!.toggle($event); 
        $event.stopPropagation();
      }, 500);
    }
  }
  
  //Función que exportará un formato excel con los datos de los clientes
  exportExcel(){
    if(this.searchedData.length > 0) {
      this.load = true;
      setTimeout(() => { this.loadSheetAndStyles(this.searchedData); }, 1000);
    } else this.msjs(`Advertencia`, `No hay datos para exportar.`);
  }

  //Función que cargará la hoja y los estilos. 
  loadSheetAndStyles(data : any){  
    let title : any = `Cartas de reposición de `;  
    title += ` ${moment(this.form.value.startDate).format('DD-MM-YYYY')} a ${moment(this.form.value.endDate).format('DD-MM-YYYY')}`;
    let fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } };
    let border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }, };
    let font = { name: 'Calibri', family: 4, size: 11, bold: true };
    let alignment = { vertical: 'middle', horizontal: 'center', wrapText: true};
    let workbook = this.svExcel.formatoExcel(title, true);
    this.addNewSheet(workbook, title, fill, border, font, alignment, data);
    this.svExcel.creacionExcel(title, workbook);
    this.load = false;
  }

  //Función para agregar una nueva hoja de calculo.
  addNewSheet(wb : any, title : any, fill : any, border : any, font : any, alignment : any, data : any){
    let fontTitle = { name: 'Calibri', family: 4, size: 15, bold: true };
    let worksheet : any = wb.worksheets[0];
    this.loadStyleTitle(worksheet, title, fontTitle);
    this.loadHeader(worksheet, fill, border, font, alignment);
    this.loadInfoExcel(worksheet, this.dataExcel(data), border,  alignment);
  }

  //Cargar estilos del titulo de la hoja.
  loadStyleTitle(ws: any, title : any, fontTitle : any){
    ws.getCell('A1').alignment = { vertical: 'middle', horizontal: 'right', wrapText: true};
    ws.getCell('A1').font = fontTitle;
    ws.getCell('A1').value = title;
  }

  //Función para cargar los titulos de el header y los estilos.
  loadHeader(ws : any, fill : any, border : any, font : any, alignment : any){
    let rowHeader : any = ['A5','B5','C5','D5','E5','F5','G5','H5']; 
    ws.addRow(this.loadFieldsHeader());

    //ws.addRow([]);
    rowHeader.forEach(x => ws.getCell(x).fill = fill);
    rowHeader.forEach(x => ws.getCell(x).alignment = alignment);
    rowHeader.forEach(x => ws.getCell(x).border = border);
    rowHeader.forEach(x => ws.getCell(x).font = font);
    ws.mergeCells('A1:H3');

    this.loadSizeHeader(ws);
  }

  //Función para cargar el tamaño y el alto de las columnas del header.
  loadSizeHeader(ws : any){
    [3,8,7].forEach(x => ws.getColumn(x).width = 50);
    [1].forEach(x => ws.getColumn(x).width = 5);
    [4,5,6].forEach(x => ws.getColumn(x).width = 20);
    [2].forEach(x => ws.getColumn(x).width = 15);
  }

 //Función para cargar los nombres de las columnas del header
  loadFieldsHeader(){
    let headerRow = [
      'N°',
      'N° Carta',
      'Cliente',
      'Fecha', 
      'Estado',
      'Motivo',
      'Autoriza',
      'Observación' 
    ];
    return headerRow;
  }

  //Cargar información con los estilos al formato excel. 
  loadInfoExcel(ws : any, data : any, border : any, alignment : any){
    let contador : any = 6;
    let row : any = ['A','B','C','D','E','F','G','H']; 

    data.forEach(x => {
      ws.addRow(x);
      row.forEach(r => {
        ws.getCell(`${r}${contador}`).border = border;
        ws.getCell(`${r}${contador}`).font = { name: 'Calibri', family: 4, size: 10 };
        ws.getCell(`${r}${contador}`).alignment = alignment;
      });
      contador++
    }); 
    //row.forEach(r => ws.getCell(`${r}${contador - 1}`).font = { name: 'Calibri', family: 4, size: 11, bold : true, }); 
  }

  //.Función que contendrá la info al documento excel. 
  dataExcel(data : any){
    let info : any = [];
    let count : number = 0;
    data.forEach(x => {
      info.push([
        count += 1,
        x.movement,
        x.client,
        `${x.date1.replace('T00:00:00', '')} - ${x.hour1}`,
        x.status,
        x.fail,
        x.authorize,
        x.observation1,
      ]);
    });
    return info;
  }
}

