import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { AreaService } from 'src/app/Servicios/Areas/area.service';
import { CreacionExcelService } from 'src/app/Servicios/CreacionExcel/CreacionExcel.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { NominaDetallada_PlasticaribeService } from 'src/app/Servicios/Nomina_Detallada/NominaDetallada_Plasticaribe.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-Reporte_Nomina',
  templateUrl: './Reporte_Nomina.component.html',
  styleUrls: ['./Reporte_Nomina.component.css']
})
export class Reporte_NominaComponent implements OnInit {
  form !: FormGroup;
  modeSelected : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  validateRol : number; //Variable que se usará en la vista para validar el tipo de rol
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  load: boolean = false; //Variable que validará cuando vaya a salir la animacion de carga
  dataReport : any = []; //Variable que se usará para almacenar los datos del reporte
  areas : any = []; //Variable que se usará para almacenar las areas de trabajo
  employees : any = []; //Variable que se usará para almacenar los empleados 
  @ViewChild('dt') dt: Table | undefined;


  constructor(
    private AppComponent : AppComponent,
    private msj : MensajesAplicacionService,
    private frmBuilder : FormBuilder,
    private svAreas : AreaService, 
    private svEmployees : UsuarioService,
    private svPayRoll : NominaDetallada_PlasticaribeService, 
    private svExcel : CreacionExcelService,
  ) { 
    this.loadModeAndForm();
  }

  ngOnInit() {
    this.loadAreas();
    this.loadTest();
    this.exportToExcel();
  }

  viewTutorial(){}

  //Cargar modo del programa y formulario
  loadModeAndForm(){
    this.modeSelected = this.AppComponent.temaSeleccionado;
    this.form = this.frmBuilder.group({
      dates : [null],
      id : [null],
      name : [null],
      areas : [null],
    });
  }

  //.Función que cargará la información de los procesos/areas
  loadAreas() {
    this.svAreas.srvObtenerLista().subscribe(data => { this.areas = data.filter(x => [1,3,4,6,7,8,9,10,11,12,19,20,21,22,25,28,29,30,31,32].includes(x.area_Id)); }, () => this.msj.mensajeError(`Error al cargar las áreas`)); 
  } 

  
  //.Función que limpiará los campos del formulario y los datos del reporte
  clearFields(){
    this.form.reset();
    this.dataReport = [];
  }

  //.Función que cargará el reporte de nomina.
  searchPayRoll(){
    let fmt : string = 'YYYY-MM-DD';
    let dates : any = this.form.value.dates;
    let date1 : any = dates == null ? this.today : moment(this.form.value.dates[0]).format(fmt);
    let date2 : any = ['Fecha inválida', null, undefined, ''].includes(dates == null ? dates : dates[1]) ? this.today : moment(this.form.value.dates[1]).format(fmt);
  
    this.svPayRoll.getPayroll(date1, date2, this.urlAPI()).subscribe(data => { this.dataReport = data; }, error => {
      this.msj.mensajeError(`Error al cargar el reporte`, `Status: ${error.status} | Message: ${console.error()}`);
    });
  }

  loadTest(){
    this.dataReport.push({
      'IdEmployee' : 1234567890,
      'CardEmployee' : 1234567890,
      'Employee' : 'PRUEBA PRUEBA PRUEBA PRUEBA',
      'Rol' : 1,
      'Ocupation' : 'OPERARIO SELLADO',
      'IdArea' : 1,
      'Area' : 'SELLADO',
      'Days_Labor' : 8,
      'Value_Inability' : 0,
      'Value_HoursExtras' : 0,
      'Value_AuxTransport' : 0,
      'Remuneration' : 100000,
      'Eps' : 13000,
      'Afp' : 13000,
      'Saving' : 20000,
      'Loan' : 5000,
      'Advance' : 50000,
      'TotalPay' : 98000,
    });
  }

  //Función para completar la ruta del endpoint del API
  urlAPI(){
    let id : any = this.form.value.id;
    let name : any = this.form.value.name;
    let area : any = this.form.value.areas;
    let route : any = ``;

    if(id != null) route.length > 0 ? route += `&id=${id}` : route += `id=${id}`;
    if(name != null) route.length > 0 ? route += `&name=${name}` : route += `name=${name}`;
    if(area != null) route.length > 0 ? route += `&area=${area}` : route += `area=${area}`;
    route = route.length > 0 ? `?${route}` : ``;

    return route;
  }

  //.Función para cargar los empleados según el campo de búsqueda.
  getEmployee(searchFor : string){
    let field : any = this.form.get(searchFor)?.value;
    if(field.toString().length > 1) {
      this.svEmployees.getEmployees(field).subscribe(data => { 
        this.employees = data;
        if(searchFor == 'id') this.selectEmployee('id'); 
      }, error => { if(searchFor == 'id') this.msj.mensajeError(`No se encontró el empleado\r\n Error: ${error.status}`); });
    }
  }

  //.Función para seleccionar un empleado de la lista de empleados.
  selectEmployee(searchFor : any){
    let test : any = this.employees.filter((item) => [item.usua_Nombre, item.usua_Id].includes(this.form.get(searchFor)?.value));
    this.form.patchValue({ 'id' : test[0].usua_Id, 'name' : test[0].usua_Nombre, });
  }

  //Función para filtrar la tabla de empleados.
  applyFilter = ($event, campo : any, valorCampo : string) => this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  //Función para calcular el total de la nomina.
  calculateTotal(){}
  
  //Función para exportar el reporte a excel.
  exportToExcel(){
    if(this.dataReport.length > 0) {
      this.load = true;
      setTimeout(() => { this.loadSheetAndStyles(); }, 2000);
    } else this.msj.mensajeAdvertencia(`No hay datos para exportar`);
  }

  //Función que cargará la hoja de cálculo y los estilos.
  loadSheetAndStyles(){ 
    let title : any = `Reporte de Nomina desde ${this.form.value.dates} hasta ${this.form.value.dates}`;  
    let fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } };
    let border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }, };
    let font = { name: 'Calibri', family: 4, size: 11, bold: true };
    let alignment = { vertical: 'middle', horizontal: 'center', wrapText: true};
    let workbook = this.svExcel.formatoExcel(title, true);

    this.addNewSheet(workbook, title, fill, border, font, alignment, this.dataReport);
    this.svExcel.creacionExcel(title, workbook);
    this.load = false;
  }

  //Función para agregar una nueva hoja de calculo.
  addNewSheet(wb : any, title : any, fill : any, border : any, font : any, alignment : any, data : any){
    let fontTitle = { name: 'Calibri', family: 4, size: 20, bold: true };
    let worksheet : any = wb.worksheets[0];
    this.loadStyleTitle(worksheet, title, fontTitle, alignment);
    this.loadHeader(worksheet, fill, border, font, alignment);
  }

  //Cargar estilos del titulo de la hoja.
  loadStyleTitle(ws: any, title : any, fontTitle : any, alignment : any){
    ws.getCell('A1').alignment = alignment;
    ws.getCell('A1').font = fontTitle;
    ws.getCell('A1').value = title;
  }

  //Función para cargar los titulos de el header y los estilos.
  loadHeader(ws : any, fill : any, border : any, font : any, alignment : any){
    let columnsAlphabetize1 : any = ['A5','B5','C5','D5','E5','F5','G5','H5','I5','J5','K5','L5','M5','N5','O5','P5','Q5','R5','S5','T5','U5','V5','W5','X5','Y5','Z5'] 
    let columnsAlphabetize2 : any = ['AA5','AB5','AC5','AD5','AE5','AF5','AG5','AH5','AI5','AJ5','AK5','AL5','AM5','AN5','AO5','AP5','AQ5','AR5','AS5','AT5','AU5','AV5','AW5','AX5','AY5', 'AZ5', 'BA5']; 
    let rowHeader : any = columnsAlphabetize1.concat(columnsAlphabetize2);
    ws.addRow(this.loadFieldsHeader());
    
    rowHeader.forEach(x => ws.getCell(x).fill = fill);
    rowHeader.forEach(x => ws.getCell(x).alignment = alignment);
    rowHeader.forEach(x => ws.getCell(x).border = border);
    rowHeader.forEach(x => ws.getCell(x).font = font);
    
    ws.mergeCells('A1:BA3');
    this.loadMergeCells(ws)
    this.loadSizeHeader(ws);
  }

  loadMergeCells(ws : any){
    let cells : any = ['', '', '', '', ''];
  }

  //Función para cargar el tamaño y el alto de las columnas del header.
  loadSizeHeader(ws : any){
    [8,9].forEach(x => ws.getColumn(x).width = 12);
    [10].forEach(x => ws.getColumn(x).width = 9);
    [11,12,14,16,18,22,28,30,32].forEach(x => ws.getColumn(x).width = 7);
    [2,4,6,7,13,15,17,19,21,23,25,27,29,31,33,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52].forEach(x => ws.getColumn(x).width = 16);
    [1,5,20,24,26].forEach(x => ws.getColumn(x).width = 8);
    [3,53].forEach(x => ws.getColumn(x).width = 50);
    [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,37,38,39,40,42,43,44,45,46,47,48,49,50,51,52,53].forEach(x => ws.getColumn(x).height = 40);
  }
  
  //.Función para cargar la info al documento excel. 
  loadInfoExcel(){
    let info : any = [];
    this.dataReport.forEach(x => {
      info.push([
        x.length + 1,
        x.user.usua_Cedula,
        x.user.usua_Nombre,
        x.role.rolUsu_Nombre,  
        x.areas.area_nombre,
        '',
        x.payRoll.salarioBase,
        x.payRoll.periodoInicio,
        x.payRoll.periodoFin,
        x.payRoll.diasAusente,
        x.payRoll.diasPagar,
        x.payRoll.horasPagar,
        x.payRoll.valorDiasPagar,
        x.payRoll.diasIncapEG,
        x.payRoll.valorIncapEG,
        x.payRoll.diasIncapAT,
        x.payRoll.valorIncapAT,
        x.payRoll.diasIncapPATMAT,
        x.payRoll.valorIncapPATMAT,
        x.payRoll.horasADCDiurnas,
        x.payRoll.valorADCDiurnas,
        x.payRoll.horasNoctDom,
        x.payRoll.valorNoctDom,
        x.payRoll.horasExtDiurnasDom,  
        x.payRoll.valorExtDiurnasDom,
        x.payRoll.horasRecargo035,
        x.payRoll.valorRecargo035,
        x.payRoll.horasExtNocturnasDom,  
        x.payRoll.valorExtNocturnasDom,
        x.payRoll.horasRecargo075,
        x.payRoll.valorRecargo075,
        x.payRoll.horasRecargo100,
        x.payRoll.valorRecargo100,
        x.payRoll.tarifaADC,  
        x.payRoll.valorTotalADCComp,
        x.payRoll.auxTransporte,
        x.payRoll.productividadSella,
        x.payRoll.productividadExt,  
        x.payRoll.productividadMontaje,
        x.payRoll.devengado,
        x.payRoll.eps,
        x.payRoll.afp,
        x.payRoll.ahorro,
        x.payRoll.prestamo,  
        x.payRoll.anticipo,
        x.payRoll.totalDcto,
        x.payRoll.pagoPTESemanaAnt,
        x.payRoll.dctos,  
        x.payRoll.deducciones,
        x.payRoll.totalPagar,
        x.payRoll.totalPagar,
        x.status.estado_Nombre,
        x.payRollType.tpNomina_Nombre,
        x.payRoll.novedades,
      ]);
    });
    return info;
  }

  //Función para cargar los nombres de las columnas del header
  loadFieldsHeader(){
    let headerRow = [
      'Items',
      'Cedula', 
      'Nombre', 
      'Cargo', 
      'Sistema', 
      'C. Costos', 
      'Salario Base', 
      'Periodo Inicial', 
      'Periodo Final', 
      'Dias Ausente', 
      'Dias a Pagar', 
      'Horas a Pagar', 
      'Valor Dias Laborados', 
      'Dias Incap E.G.', 
      'Valor Incap E.G.',
      'Dias Incap A.T.', 
      'Valor Incap A.T.', 
      'Dias Incap PAT / MAT', 
      'Valor Incap PAT/MAT',   
      'Horas ADC Diurnas',
      'Valor ADC Diurnas', 
      'Horas Noct. Dom',
      'Valor Noct. Dom', 
      'Horas Ext Diurnas Dom', 
      'Valor Ext Diurnas Dom',
      'Horas Recargo 0.35',
      'Valor Recargo 0.35',
      'Horas Ext. Noct. Dom',
      'Valor Ext. Noct. Dom', 
      'Horas ADC 100%',
      'Valor ADC 100%',
      'Horas ADC 75%',
      'Valor ADC 75%',
      'Tarifa ADC', 
      'Total Valor ADC Comp.', 
      'Aux. Transp.',
      'Productividad Sellado',
      'Productividad Extrusión',
      'Productividad Montaje',
      'Devengado', 
      'EPS', 
      'AFP',
      'Ahorro', 
      'Prestamo', 
      'Anticipo', 
      'Total DCTO', 
      'Pago PTE. Semana ANT.',
      'DCTOS',
      'Deducciones', 
      'Total a Pagar',
      'Tipo Nómina',
      'Estado Nómina', 
      'Novedad'
    ];
    return headerRow;
  }
}

export interface payRoll {

}
