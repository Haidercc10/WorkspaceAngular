import { Component, Injectable, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { AppComponent } from 'src/app/app.component';
import { DevolucionesCalidadService } from 'src/app/Servicios/Devoluciones_Calidad/devoluciones-calidad.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { CreacionExcelService } from 'src/app/Servicios/CreacionExcel/CreacionExcel.service';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-mov-devoluciones-calidad',
  templateUrl: './mov-devoluciones-calidad.component.html',
  styleUrls: ['./mov-devoluciones-calidad.component.css']
})
export class MovDevolucionesCalidadComponent implements OnInit {
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
    private svExcel : CreacionExcelService,
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
      itemId: [null ],
      item: [null ],
      client: [null ],
      clientId: [null ],
    });
  }

  validateUrl(){
    let ot: any = this.formFilters.value.ot;
    let typeRejected: any = this.formFilters.value.typeMov;
    let client : any = this.formFilters.value.clientId;
    let item : any = this.formFilters.value.itemId;
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
    let nombre: string = this.formFilters.value.item;
    this.svProducts.obtenerItemsLike(nombre).subscribe(resp => this.products = resp);
  }

  selectedProduct() {
    let producto: any = this.formFilters.value.item;
    this.formFilters.patchValue({
      'itemId': producto,
      'item': this.products.find(x => x.prod_Id == producto).prod_Nombre
    });
  }

  searchData(){
    this.load = true;
    let date1 : any = moment(this.formFilters.value.startDate).format('YYYY-MM-DD');
    let date2 : any = moment(this.formFilters.value.endDate).format('YYYY-MM-DD');

    this.svDevQuality.getMovementsDvQuality(date1, date2, this.validateUrl()).subscribe(data => {
      this.serchedData = data;
      this.load = false;
    }, error => {
      this.load = false;
      console.log(error);this.errorMessage('Error al consultar los registros de devouciones', error)
    });
  }

  errorMessage(message: string, error: HttpErrorResponse) {
    this.load = false;
    this.msg.mensajeError(message, `Error: ${error.statusText} | Status: ${error.status}`);
  }

  clearFields(){
    this.formFilters.reset();
    this.loadRankDates();
  }

  //Función que exportará un formato excel con los datos de los clientes
  exportExcel(){
    if(this.serchedData.length > 0) {
      setTimeout(() => { this.loadSheetAndStyles(this.serchedData); }, 500);
    } else this.msg.mensajeAdvertencia(`Advertencia`, `No hay datos para exportar.`);
  }

  //Función que cargará la hoja y los estilos. 
  loadSheetAndStyles(data : any){  
    let title : any = `Movimientos de Devoluciones de`
    title += ` ${moment(this.formFilters.value.startDate).format('DD-MM-YYYY')} a ${moment(this.formFilters.value.endDate).format('DD-MM-YYYY')}`;
    let fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } };
    let border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }, };
    let font = { name: 'Calibri', family: 4, size: 11, bold: true };
    let alignment = { vertical: 'middle', horizontal: 'center', wrapText: true};
    let workbook = this.svExcel.formatoExcel(title, true);

    this.addNewSheet(workbook, title, fill, border, font, alignment, data);
    this.svExcel.creacionExcel(title, workbook);
  }

  //Función para agregar una nueva hoja de calculo.
  addNewSheet(wb : any, title : any, fill : any, border : any, font : any, alignment : any, data : any){
    let fontTitle = { name: 'Calibri', family: 4, size: 15, bold: true };
    let worksheet : any = wb.worksheets[0];
    this.loadStyleTitle(worksheet, title, fontTitle, alignment);
    this.loadHeader(worksheet, fill, border, font, alignment);
    this.loadInfoExcel(worksheet, this.dataExcel(data), border,  alignment);
  }

  //Cargar estilos del titulo de la hoja.
  loadStyleTitle(ws: any, title : any, fontTitle : any, alignment : any){
    ws.getCell('A1').alignment = alignment;
    ws.getCell('A1').font = fontTitle;
    ws.getCell('A1').value = title;
  }

  //Función para cargar los titulos de el header y los estilos.
  loadHeader(ws : any, fill : any, border : any, font : any, alignment : any){
    let rowHeader : any = ['A5','B5','C5','D5','E5','F5','G5','H5','I5','J5','J5','K5','L5','M5','N5','O5','P5','Q5']; 
    //ws.addRow([]);
    ws.addRow(this.loadFieldsHeader());
    
    rowHeader.forEach(x => ws.getCell(x).fill = fill);
    rowHeader.forEach(x => ws.getCell(x).alignment = alignment);
    rowHeader.forEach(x => ws.getCell(x).border = border);
    rowHeader.forEach(x => ws.getCell(x).font = font);
    ws.mergeCells('A1:Q3');

    this.loadSizeHeader(ws);
  }

  //Función para cargar el tamaño y el alto de las columnas del header.
  loadSizeHeader(ws : any){
    [7,17].forEach(x => ws.getColumn(x).width = 50);
    [5,10,12,13,16].forEach(x => ws.getColumn(x).width = 40);
    [1].forEach(x => ws.getColumn(x).width = 5);
    [3].forEach(x => ws.getColumn(x).width = 10);
    [2,3,4,6,8,9,11,14,15].forEach(x => ws.getColumn(x).width = 12);
    
    [12].forEach(x => ws.getColumn(x).width = 20);
  }

 //Función para cargar los nombres de las columnas del header
  loadFieldsHeader(){
    let headerRow = [
      'N°',
      'Fecha',
      'Año',
      'Mes', 
      'Cliente',
      'Item', 
      'Referencia', 
      'OT',
      'Fecha Producción',
      'No conformidad',
      'Rechazo', 
      'Responsable',
      'Requerimiento',
      'Peso',
      'Precio Kg', 
      'Precio Kg Mala Calidad',
      'Observaciones', 
    ];
    return headerRow;
  }

  //Cargar información con los estilos al formato excel. 
  loadInfoExcel(ws : any, data : any, border : any, alignment : any){
    let contador : any = 6;
    let row : any = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q']; 
    let formatNumber: Array<number> = [15, 16];
    let formatNumber2: Array<number> = [14];

    formatNumber.forEach(i => ws.getColumn(i).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00');
    formatNumber2.forEach(i => ws.getColumn(i).numFmt = '""#,##0.00;[Red]\-"$"#,##0.00'); 

    data.forEach(x => {
      ws.addRow(x);
      row.forEach(r => {
        ws.getCell(`${r}${contador}`).border = border;
        ws.getCell(`${r}${contador}`).font = { name: 'Calibri', family: 4, size: 10 };
        ws.getCell(`${r}${contador}`).alignment = alignment;
      });
      contador++
    }); 
  }

  //.Función que contendrá la info al documento excel. 
  dataExcel(data : any){
    let info : any = [];
    let count : number = 0;
    data.forEach(x => {
      info.push([
        count += 1,
        x.devs.dvc_Fecha.replace('T00:00:00', ''),
        x.devs.dvc_Ano,
        x.devs.dvc_Mes,
        x.client.cli_Nombre,
        x.devs.prod_Id,
        x.item.prod_Nombre,
        x.devs.dvc_OT,
        x.devs.dvc_FechaProduccion.replace('T00:00:00', ''),
        x.fails.falla_Nombre,
        x.devs.dvc_TipoRechazo,
        x.process.proceso_Nombre,
        x.req.req_Nombre, 
        x.devs.dvc_PesoNeto, 
        x.devs.dvc_Precio, 
        x.devs.dvc_Subtotal,
        x.devs.dvc_Observacion,
      ]);
    });
    return info;
  }
}
