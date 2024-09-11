import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { AppComponent } from 'src/app/app.component';
import { Maquilas_InternasService } from 'src/app/Servicios/Maquilas_Internas/Maquilas_Internas.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Servicios_ProduccionService } from 'src/app/Servicios/Servicios_Produccion/Servicios_Produccion.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { Maquilas_InternasComponent } from '../Maquilas_Internas/Maquilas_Internas.component';
import { CreacionExcelService } from 'src/app/Servicios/CreacionExcel/CreacionExcel.service';

@Component({
  selector: 'app-MovMaquilas_Internas',
  templateUrl: './MovMaquilas_Internas.component.html',
  styleUrls: ['./MovMaquilas_Internas.component.css']
})

export class MovMaquilas_InternasComponent implements OnInit {

  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente

  form: FormGroup;
  load: boolean = false;
  validateRole: number | undefined;
  selectedMode: boolean = false;
  operators: any[] = [];
  services: any[] = [];
  dataSearched: Array<any> = [];
  @ViewChild('dtServices') dtServices: Table | undefined;
  //@ViewChild(Maquilas_InternasComponent) cmpMaqInternals : Maquilas_InternasComponent;

  constructor(private AppComponent : AppComponent,
    private svUsers : UsuarioService,
    private svServicesProduction : Servicios_ProduccionService,
    private svInternalMaquila : Maquilas_InternasService,
    private msj: MensajesAplicacionService, 
    private frmBuilder : FormBuilder,
    private cmpMaqInternals : Maquilas_InternasComponent,
    private svExcel : CreacionExcelService,
  ) { 
    this.selectedMode = this.AppComponent.temaSeleccionado;
    this.initForm();
  }

  ngOnInit() {
    this.getOperators();
    this.getServices();
    this.loadRankDates();
  }

  getOperators = () => this.svUsers.GetOperariosProduccion().subscribe(data => { this.operators = data.filter(x => x.area_Id == 11); });

  getServices(){
    this.svServicesProduction.GetTodo().subscribe(data => { this.services = data }, error => {
      this.msj.mensajeError(`Error`, `Error al consultar los servicios. | ${error.status} ${error.statusText}`);
    });
  }

  getMovements(){
    this.dataSearched = [];
    this.load = true;
    let date1 : any = moment(this.form.value.rankDates[0]).format('YYYY-MM-DD');
    let date2 : any = moment(this.form.value.rankDates[1]).format('YYYY-MM-DD');

    this.svInternalMaquila.getMovMaquilas(date1, date2, this.validateUrl()).subscribe(data => {
      this.dataSearched = data;
      this.load = false;
    }, error => {
      [400, 404].includes(error.status) ? this.msj.mensajeAdvertencia(`No se encontraron registros!`) : this.msj.mensajeAdvertencia(`Ocurrió un error en la consulta al servidor!`)
      this.load = false;
    });
  }

  //Función para cargar las fechas desde que inicia el modulo.
  loadRankDates(){
    let initialDate = new Date(moment().subtract(30, 'days').format('YYYY-MM-DD'));
    this.form.patchValue({ 'rankDates' : [initialDate, new Date()] });
  }

  //Validar la url se pasará como parametro en el metodo que consulta el API.
  validateUrl(){
    let ot: any = this.form.value.orderProduction;
    let operative: any = this.form.value.operator;
    let service : any = this.form.value.service;
    let code : any = this.form.value.code;
    let url : string = ``;

    if(ot != null) url += `ot=${ot}`;
    if(operative != null) url.length > 0 ? url += `&operative=${operative}` : url += `operative=${operative}`;
    if(service != null) url.length > 0 ? url += `&service=${service}` : url += `service=${service}`;
    if(code != null) url.length > 0 ? url += `&code=${code}` : url += `code=${code}`;

    if(url.length > 0) url = `?${url}`;
    console.log(url);
    return url;
  }

  initForm(){
    this.form = this.frmBuilder.group({
      rankDates : [null, Validators.required],
      orderProduction : [null,],
      service : [null,],
      operator : [null,],
      code : [null],
    });
  }

  clearFields(){
    this.form.reset();
    this.dataSearched = [];
    this.loadRankDates();
  }

  viewServicePDF(data : any){
    this.load = true;
    this.cmpMaqInternals.createPDF(data.roll, ` exportada`);
    setTimeout(() => { this.load = false; }, 3000);
  }
  
  applyFilter = ($event, campo : any, valorCampo : string) => this.dtServices!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  getTotalPay(){
    let data : any = this.dtServices ? this.dtServices.filteredValue ? this.dtServices.filteredValue : this.dataSearched : this.dataSearched;
    return data.reduce((a, b) => a += b.value_Pay, 0)
  }

  getTotalService(){
    let data : any = this.dtServices ? this.dtServices.filteredValue ? this.dtServices.filteredValue : this.dataSearched : this.dataSearched;
    return data.reduce((a, b) => a += b.weight, 0)
  }

  //* Función para crear excel de rollo a rollo detallado.
  createExcel(){
    let data : any = this.dtServices ? this.dtServices.filteredValue ? this.dtServices.filteredValue : this.dataSearched : this.dataSearched;
    if(data.length > 0) {
      this.load = true;
      setTimeout(() => { this.loadSheetAndStyles(data); }, 500);
      setTimeout(() => { this.load = false; }, 1000);
    } else this.msj.mensajeAdvertencia(`No hay datos para exportar`, `Debe haber al menos un registro en la tabla!`);
  }

  //Función que cargará la hoja de cálculo y los estilos.
  loadSheetAndStyles(data : any){ 
    let date1 : any = moment(this.form.value.rankDates[0]).format('DD-MM-YYYY');  
    let date2 : any = moment(this.form.value.rankDates[1]).format('DD-MM-YYYY');
    let title : any = `Movimientos de Maquilas ${date1} - ${date2}`
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
    let rowHeader : any = ['A5','B5','C5','D5','E5','F5','G5','H5']; 
    //ws.addRow([]);
    ws.addRow(this.loadFieldsHeader());
    
    rowHeader.forEach(x => ws.getCell(x).fill = fill);
    rowHeader.forEach(x => ws.getCell(x).alignment = alignment);
    rowHeader.forEach(x => ws.getCell(x).border = border);
    rowHeader.forEach(x => ws.getCell(x).font = font);
    ws.mergeCells('A1:H3');

    this.loadSizeHeader(ws);
  }

  //Función para cargar el tamaño y el alto de las columnas del header.
  loadSizeHeader(ws : any){
    [4].forEach(x => ws.getColumn(x).width = 50);
    [,7,8].forEach(x => ws.getColumn(x).width = 15);
    [1,3,6].forEach(x => ws.getColumn(x).width = 10);
    [2,5].forEach(x => ws.getColumn(x).width = 20);
  }

 //Función para cargar los nombres de las columnas del header
  loadFieldsHeader(){
    let headerRow = [
      'N°',
      'Operador',
      'Turno',
      'Servicio',
      'Fecha',
      'Cantidad (Kg)', 
      'Precio', 
      'Subtotal',
    ];
    return headerRow;
  }

  //Cargar información con los estilos al formato excel. 
  loadInfoExcel(ws : any, data : any, border : any, alignment : any){
    let formatNumber: Array<number> = [5,7,8];
    let contador : any = 6;
    let row : any = ['A','B','C','D','E','F','G','H']; 

    formatNumber.forEach(x => ws.getColumn(x).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    data.forEach(x => {
      ws.addRow(x);
      row.forEach(r => {
        ws.getCell(`${r}${contador}`).border = border;
        ws.getCell(`${r}${contador}`).font = { name: 'Calibri', family: 4, size: 10 };
        ws.getCell(`${r}${contador}`).alignment = alignment;
      });
      contador++
    });
    row.forEach(r => ws.getCell(`${r}${contador - 1}`).font = { name: 'Calibri', family: 4, size: 11, bold : true, }); 
  }

  //Agregar fila de totales al formato excel.
  addTotal(info : any){
    info.push([
      '',
      '',
      '',
      '',
      'Servicios (Kg)',
      this.getTotalService(),
      'Pago Total',
      this.getTotalPay(),
    ]);
  }

  //.Función que contendrá la info al documento excel. 
  dataExcel(data : any){
    let info : any = [];
    let count : number = 0;
    data.forEach(x => {
      info.push([
        count += 1,
        x.operator,
        x.turn,
        `${x.roll} - ${x.reference}` ,
        x.date.replace('T00:00:00', ` ${x.hour}`),
        x.weight,
        x.value_Production,
        x.value_Pay,
      ]);
    });
    this.addTotal(info);
    return info;
  }

}
