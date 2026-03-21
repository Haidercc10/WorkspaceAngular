import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import moment from 'moment';
import { forkJoin } from 'rxjs';
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
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';

@Component({
  selector: 'app-Mov_Reposiciones',
  templateUrl: './Mov_Reposiciones.component.html',
  styleUrls: ['./Mov_Reposiciones.component.css']
})

export class Mov_ReposicionesComponent implements OnInit {

  form!: FormGroup;
  load: boolean = false;
  modoSeleccionado: boolean;
  ValidarRol: number;
  storage_Id: number;
  storage_Nombre: any;
  searchedData: any[] = [];
  @ViewChild('dt') dt: Table;
  modal: boolean = false;
  rollsFromRepo: any = [];
  rollsConsolidates: any = [];
  clients: any = [];
  statuses: any = [];
  selectedRepo: any = {};
  @ViewChild('op') op: OverlayPanel | undefined;
  observation: any = null;
  fails: any = [];
  sales: any[] = [];
  private allDetailsForRepo: any[] = [];

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
    private svSales : UsuarioService,
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
  
  getFails = () => this.svFails.srvObtenerLista().subscribe(datos => { this.fails = datos.filter((item: any) => item.tipoFalla_Id == 25); });

  //*
  getStatuses = () => this.svStatuses.srvObtenerListaEstados().subscribe(
    data => { this.statuses = data.filter((x: any) => [11, 5, 3].includes(x.estado_Id)); },
    () => { this.msjs(`Error`, `Error al consultar los estados.`); }
  );

  getSales() {
    const asesorId: number | null = this.ValidarRol == 2 ? this.appComponent.storage_Id : null;
    this.svSales.GetVendedores().subscribe(resp => {
      this.sales = asesorId ? resp.filter((x: any) => x.usua_Id == asesorId) : resp;
    });
  }

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
      sales : [null],
    });
  }

  //*Leer storage del navegador.  
  readStorage() {
    this.storage_Id = this.appComponent.storage_Id;
    this.ValidarRol = this.appComponent.storage_Rol;
    this.getSales();
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
    const date1 = moment(this.form.value.startDate).format('YYYY-MM-DD');
    const date2 = moment(this.form.value.endDate).format('YYYY-MM-DD');

    this.svDtlRepositions.getMovementsReposition(date1, date2, this.buildQueryParams()).subscribe(data => {
      this.searchedData = data;
      this.load = false;
    }, error => {
      this.msjs(`Error`, `Error al consultar los datos de la reposición | ${error.status} ${error.statusText}.`);
    });
  }

  //* Construye los parámetros de búsqueda para la URL.
  buildQueryParams(): string {
    const { id, status, idClient: client, fail, sales } = this.form.value;
    const params: string[] = [];

    if (id != null)     params.push(`id=${id}`);
    if (status != null) params.push(`status=${status}`);
    if (client != null) params.push(`roll=${client}`);
    if (fail != null)   params.push(`fail=${fail}`);
    if (sales != null)  params.push(`sales=${sales}`);

    return params.length > 0 ? `?${params.join('&')}` : '';
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
    }
  }

  //*Función para mostrar el msj de confirmación de anulación de reposición
  viewMsgAnullation(data : any) {
    this.load = true;
    this.selectedRepo = data;
    this.svDtlRepositions.getRepositionId(data.movement).subscribe(
      details => {
        this.allDetailsForRepo = details;
        this.rollsConsolidates = this.consolidateByItem(details);
        this.load = false;
        this.msg.add({severity:'warn', key:'reposition', summary:'Elección', detail: `¿Está seguro que desea anular la reposición N° ${data.movement}?`, sticky: true});
      },
      error => {
        this.msjs(`Error`, `Error al consultar la reposición N° ${data.movement} | ${error.status} ${error.statusText}.`);
      }
    );
  }
  
  //* Función para quitar msj de confirmación.
  onReject(key : any) {
    this.load = false;
    this.msg.clear(key);
  }

  //* Función para anular la reposición y cambiar estado DISPONIBLE los rollos.
  discardReposition(){
    this.onReject('reposition');
    const data = this.selectedRepo;
    this.load = true;
    this.svProduction.putAvailableFromReposition(data.movement, this.storage_Id).subscribe(() => {
      this.msjs(`Confirmación`, `Reposición N° ${data.movement} anulada exitosamente!`);
      this.searchData();
    }, error => {
      this.msjs(`Error`, `Error al actualizar el estado de los rollos | ${error.status} ${error.statusText}.`);
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
    this.onReject('reposition');
    const adjustments$ = this.rollsConsolidates.map((data: any) => {
      // La API devuelve el campo 'presentation'; no se usa 'unit' porque aquí
      // se trabaja directamente con la respuesta del API sin pasar por loadTable.
      const unity : string = data.presentation == 'Kg' ? 'KLS' : data.presentation == 'Und' ? 'UND' : 'PAQ';
      const qty : string = this.qtyTotalItem(data).toString();
      const item : string = data.item;
      const price : string = data.price;
      const detail : string = `Ajuste desde App Plasticaribe por concepto de REPOSICION al Item ${item} con cantidad de ${qty} ${unity}`;
      return this.svProduction.sendProductionToZeus(detail, item, unity, 0, qty, price);
    });

    this.load = true;
    forkJoin(adjustments$).subscribe(
      () => { this.discardReposition(); },
      error => { this.msjs(`Error`, `No fue posible enviar el ajuste positivo a Zeus | ${error.status} ${error.statusText}`); }
    );
  }

  //* Consolida los detalles de una reposición por item único.
  private consolidateByItem(details: any[]): any[] {
    return details.reduce((acc: any[], value: any) => {
      if (!acc.find((x: any) => x.item == value.item)) acc.push(value);
      return acc;
    }, []);
  }

  //* Calcula la cantidad total de un item sumando todos sus rollos en el detalle.
  private qtyTotalItem(data: any): number {
    return this.allDetailsForRepo
      .filter((x: any) => x.item == data.item)
      .reduce((a: number, b: any) => a + b.quantity, 0);
  }


  finishRepo(data : any){
    this.onReject('finishReposition');
    this.load = true;
    const info : any = [{ 'user' : this.storage_Id, 'status' : 5 }]
    this.svRepo.putReposition(data.movement, info).subscribe(() => {
      this.msjs(`Confirmación`, `Reposición N° ${data.movement} finalizada exitosamente!`);
      this.searchData();
    }, error => {
      this.msjs(`Error`, `Error al finalizar la reposición N° ${data.movement} | ${error.status} ${error.statusText}.`);
    });
  }

  //*Función para mostrar el msj de confirmación de finalización de reposición
  viewMsgFinishRepo(data : any) {
    this.load = true;
    this.selectedRepo = data;
    this.svDtlRepositions.getRepositionId(data.movement).subscribe(
      details => {
        this.allDetailsForRepo = details;
        this.rollsConsolidates = this.consolidateByItem(details);
        this.load = false;
        this.msg.add({severity:'warn', key:'finishReposition', summary:'Elección', detail: `¿Está seguro que desea finalizar la reposición N° ${data.movement}?`, sticky: true});
      },
      error => {
        this.msjs(`Error`, `Error al consultar la reposición N° ${data.movement} | ${error.status} ${error.statusText}.`);
      }
    );
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

    rowHeader.forEach((x: any) => {
      ws.getCell(x).fill = fill;
      ws.getCell(x).alignment = alignment;
      ws.getCell(x).border = border;
      ws.getCell(x).font = font;
    });
    ws.mergeCells('A1:H3');

    this.loadSizeHeader(ws);
  }

  //Función para cargar el tamaño y el alto de las columnas del header.
  loadSizeHeader(ws : any){
    [3, 8, 7].forEach(x => ws.getColumn(x).width = 50);
    ws.getColumn(1).width = 5;
    ws.getColumn(2).width = 15;
    [4, 5, 6].forEach(x => ws.getColumn(x).width = 20);
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

    data.forEach((x: any) => {
      ws.addRow(x);
      row.forEach((r: any) => {
        ws.getCell(`${r}${contador}`).border = border;
        ws.getCell(`${r}${contador}`).font = { name: 'Calibri', family: 4, size: 10 };
        ws.getCell(`${r}${contador}`).alignment = alignment;
      });
      contador++
    }); 
  }

  //.Función que contendrá la info al documento excel. 
  dataExcel(data : any): any[] {
    let count : number = 0;
    return data.map((x: any) => [
      ++count,
      x.movement,
      x.client,
      `${x.date1.replace('T00:00:00', '')} - ${x.hour1}`,
      x.status,
      x.fail,
      x.authorize,
      x.observation1,
    ]);
  }
}

