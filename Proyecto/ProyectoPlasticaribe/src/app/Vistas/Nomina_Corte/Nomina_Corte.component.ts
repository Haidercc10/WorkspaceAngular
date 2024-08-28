import { ThisReceiver } from '@angular/compiler';
import { Component, OnInit, ViewChild } from '@angular/core';
import moment from 'moment';
import { Table } from 'primeng/table';
import { AppComponent } from 'src/app/app.component';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { CreacionExcelService } from 'src/app/Servicios/CreacionExcel/CreacionExcel.service';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';

@Component({
  selector: 'app-Nomina_Corte',
  templateUrl: './Nomina_Corte.component.html',
  styleUrls: ['./Nomina_Corte.component.css']
})
export class Nomina_CorteComponent implements OnInit {

  storage_Id: number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre: any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol: any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol: number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today: any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  load: boolean = false; //Variable que validará cuando vaya a salir la animacion de carga
  modoSeleccionado: boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  rankDates: any[] = []; /** Array que almacenará el rango de fechas */
  productionCourt : any [] = [];
  hiddenProduction : any = [];
  productionCourtDetails : any = [];
  payRollConsolidate : any = [];
  infoModal : any = [];
  modal : boolean = false;
  @ViewChild('dt') dt: Table | undefined;
  @ViewChild('dtDetails') dtDetails: Table | undefined;
  @ViewChild('dtDetailsModal') dtDetailsModal: Table | undefined;
  operator : string = ``;
  activeOperators : any = [];

  constructor(private AppComponent: AppComponent,
    private svBagPro : BagproService,
    private msj : MensajesAplicacionService,
    private svExcel : CreacionExcelService,
    private svUsers : UsuarioService,
    private svPDF : CreacionPdfService, 
  ) { 
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.getActiveUsers();
  }

  getActiveUsers = () => this.svUsers.getOperatorsCourt().subscribe(data => { this.activeOperators = data; });

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage() {
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  searchPayRoll(){
    this.productionCourt = [];
    this.hiddenProduction = [];
    this.productionCourtDetails = [];

    if (this.rankDates.length == 2) {
      this.load = true;
      let date1 : any = moment(this.rankDates[0]).format('YYYY-MM-DD');
      let date2 : any = moment(this.rankDates[1]).format('YYYY-MM-DD');

      this.svBagPro.getPayRollCourt(date1, date2).subscribe(data => {
        this.load = false;
        console.log(data);
        this.productionCourtDetails = data.filter(x => this.activeOperators.includes(x.operator));
        this.productionCourt = data.filter(x => this.activeOperators.includes(x.operator));
        this.hiddenProduction = data.filter(x => this.activeOperators.includes(x.operator));
        
        this.consolidatePayRoll();
        this.loadTableDetails();
      }, error => {

      });
    }
  }

  consolidatePayRoll(){
    this.payRollConsolidate = this.productionCourt.reduce((a, b) => {
      if(!a.map(x => x.operator).includes(b.operator)) {
        let obj = { 'operator': b.operator, 'value_Pay': b.value_Pay, 'weight': b.weight, 'position_Job' : b.position_Job, 'item' : b.item, 'details' : [] };
        a.push(obj);
      } else {
        a[a.map(x => x.operator).indexOf(b.operator)].value_Pay += b.value_Pay;
        a[a.map(x => x.operator).indexOf(b.operator)].weight += b.weight;
      }
      return a;
    }, []);
    
  }

  loadTableDetails(){
    this.hiddenProduction.forEach(z => {
      
      let index = this.payRollConsolidate.findIndex(x => x.operator.includes(z.operator));
      if(index != 1) {
        if(!this.payRollConsolidate[index].details.map(x => x.item).includes(z.item)){
          console.log(index, z.operator);
          this.payRollConsolidate[index].details.push({
            'item' : z.item,
            'reference' : z.reference,
            'operator' : z.operator,
            'value_Day' : z.value_Day,
            'value_Sunday' : z.value_Sunday,
            'value_Night' : z.value_Night,
            'turn' : z.turn,  
            'weight' : z.weight,
            'value_Pay' : z.value_Pay,
          });
        } else {
          let index2 = this.payRollConsolidate[index].details.findIndex(x => x.item == z.item);
          this.payRollConsolidate[index].details[index2].weight += z.weight;
          this.payRollConsolidate[index].details[index2].value_Pay += z.value_Pay;
        }
      }
    });
  }

  loadModal(operator : string, item : any){
    this.modal = true;
    this.operator = operator; 
    this.infoModal = [];
    this.infoModal = this.hiddenProduction.filter(x => x.operator == operator && x.item == item);
  }

  /** Filtrar la tabla detallada del modal de sellado */
  applyFilter = ($event, campo : any, table : any) => table!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  calcTotalPay = () => this.payRollConsolidate.reduce((a, b) => a += b.value_Pay, 0);

  calcTotalProduction = () => this.payRollConsolidate.reduce((a, b) => a += b.weight, 0);

  //* FORMATO EXCEL
  createExcel(){
    if(this.hiddenProduction.length > 0) {
      this.load = true;
      this.hiddenProduction.sort((a, b) => a.operator.localeCompare(b.operator))
      setTimeout(() => { this.loadSheetAndStyles(this.hiddenProduction);  }, 500);
    } else this.msj.mensajeAdvertencia(`Advertencia`, `No hay datos para exportar!`);
  }

  //Función que cargará la hoja de cálculo y los estilos.
  loadSheetAndStyles(data : any){  
    let title : any = `Nómina de Corte`;
    title += ` ${moment().format('DD-MM-YYYY')}`
    let fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } };
    let border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }, };
    let font = { name: 'Calibri', family: 4, size: 11, bold: true };
    let alignment = { vertical: 'middle', horizontal: 'center', wrapText: true};
    let workbook = this.svExcel.formatoExcel(title, true);

    this.addNewSheet(workbook, title, fill, border, font, alignment, data);
    this.svExcel.creacionHoja(workbook, `Nómina Consolidada Corte`, false);
    this.addGroupedSheet(workbook, fill, font, border, this.groupedInfoExcel(), 2)
    this.svExcel.creacionExcel(title, workbook);
    this.load = false;
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
    let rowHeader : any = ['A5','B5','C5','D5','E5','F5','G5','H5','I5','J5','K5','L5','M5']; 
    //ws.addRow([]);
    ws.addRow(this.loadFieldsHeader());
    
    rowHeader.forEach(x => ws.getCell(x).fill = fill);
    rowHeader.forEach(x => ws.getCell(x).alignment = alignment);
    rowHeader.forEach(x => ws.getCell(x).border = border);
    rowHeader.forEach(x => ws.getCell(x).font = font);
    ws.mergeCells('A1:M3');

    this.loadSizeHeader(ws);
  }

  //Función para cargar el tamaño y el alto de las columnas del header.
  loadSizeHeader(ws : any){
    [2,6].forEach(x => ws.getColumn(x).width = 50);
    [11,2].forEach(x => ws.getColumn(x).width = 30);
    [3,5,4,13].forEach(x => ws.getColumn(x).width = 10);
    [12].forEach(x => ws.getColumn(x).width = 8);
    [1].forEach(x => ws.getColumn(x).width = 5);
    [7,8,10,9].forEach(x => ws.getColumn(x).width = 15);
  }

 //Función para cargar los nombres de las columnas del header
  loadFieldsHeader(){
    let headerRow = [
      'N°',
      'Operario',
      'Rollo',
      'OT',
      'Item', 
      'Referencia', 
      'Peso',
      'Presentación',
      'Valor Producción', 
      'Subtotal',
      'Fecha',
      'Turno',
      'Domingo'
    ];
    return headerRow;
  }

  //.Función que contendrá la info al documento excel. 
  dataExcel(data : any){
    let info : any = [];
    let count : number = 0;
    data.forEach(x => {
      info.push([
        count += 1,
        x.operator,
        x.roll,
        x.ot,
        x.item,
        x.reference,
        x.weight,
        'Kg',
        x.value_Production,
        x.value_Pay,
        `${x.date.replace('T00:00:00', ` ${x.hour}`)} `,
        x.turn,
        x.sunday ? 'SI' : 'NO'
      ]);
    });
    this.addTotal(info);
    return info;
  }

  //Cargar información con los estilos al formato excel. 
  loadInfoExcel(ws : any, data : any, border : any, alignment : any){
    let formatNumber: Array<number> = [7,8,10];
    let contador : any = 6;
    let row : any = ['A','B','C','D','E','F','G','H','I','J','K','L','M']; 

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
      '',
      'KG PRODUCIDOS',
      this.hiddenProduction.reduce((a, b) => a += b.weight, 0),
      '',
      'TOTAL',
      this.hiddenProduction.reduce((a, b) => a += b.value_Pay, 0),
      '',
      '',
      ''
    ]);
  }

   //*Hoja 2 Agrupada
  addGroupedSheet(workbook, fill , font, border, data : any, pageNumber : number){
    let page = workbook.worksheets[pageNumber - 1];
    this.addGroupedHeader(page, font, border, fill);
    page.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    this.addGroupedInfoExcel(page, data);
  }

  //.Agregar encabezado de la hoja 2: Reporte de producción consolidado.
  addGroupedHeader(worksheet, font, border, fill) {
    worksheet.addRow([]);
    worksheet.addRow([]);
    let rowHeader : any = ['A4', 'B4', 'C4', 'D4', 'E4', ];
    worksheet.addRow(['Operario', 'Cargo', 'Producción', 'Presentación', 'Valor a Pagar',]);
    
    rowHeader.forEach(x => worksheet.getCell(x).fill = fill);
    rowHeader.forEach(x => worksheet.getCell(x).font = font);
    rowHeader.forEach(x => worksheet.getCell(x).border = border);

    let concatCells : any = ['A1:E3'];
    this.stylesGroupedPage(worksheet, concatCells, []);
  }

  //.Agregar información a la hoja 2: Reporte de producción consolidado.
  addGroupedExcel(worksheet : any, data : any) {
    let formatNumber: Array<number> = [3, 5];
    formatNumber.forEach(i => worksheet.getColumn(i).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    data.forEach(d => worksheet.addRow(d));
  }

  //.Agregar información a la hoja 2: Reporte de producción consolidado.
  addGroupedInfoExcel(worksheet : any, data : any) {
    let formatNumber: Array<number> = [3,5];
    formatNumber.forEach(i => worksheet.getColumn(i).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    data.forEach(d => worksheet.addRow(d));
  }

  //.Información agrupada de la hoja 2: Reporte de producción consolidado.
  groupedInfoExcel(){
    let info : any = [];
    info = this.payRollConsolidate.reduce((acc, obj) => {
      if(!acc.map(x => x[0]).includes(obj.operator)) {
        acc = [...acc, [obj.operator, obj.position_Job, obj.weight, 'Kg', obj.value_Pay]]
      }
      return acc;
    }, [])
    //this.produccion.forEach(d => info.push([d.orden, d.cliente, d.item, d.referencia, d.peso, d.cantidad, d.presentacion, ]));
    return info;
  }

  //.Estilos de la hoja 2: Reporte de producción consolidado..
  stylesGroupedPage(worksheet, concatCells, formatNumber) {
    formatNumber.forEach(i => worksheet.getColumn(i).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    [1].forEach(x => worksheet.getColumn(x).width = 30);
    [2,3,4,5].forEach(x => worksheet.getColumn(x).width = 20)
    concatCells.forEach(cell => worksheet.mergeCells(cell));
  }

  formatNumbers = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  //*CREACIÓN DE FORMATO PDF
  createPDF(){
    this.load = true;
    let date1 : any = moment(this.rankDates[0]).format('YYYY-MM-DD');
    let date2 : any = moment(this.rankDates[1]).format('YYYY-MM-DD');

    setTimeout(() => {
      let title: string = `Nómina Corte de ${date1} a ${date2}`;
      let content: Array<any> = this.contentPDF();
      this.svPDF.formatoPDF(title, content);
      setTimeout(() => this.load = false, 2000);
    }, 1000);
  }

  contentPDF(): Array<any> {
    let content: Array<any> = [];
    let consolidatedInformation: Array<any> = this.getPayRollConsolidate();
    content.push(this.tableConsolidated(consolidatedInformation));
    content.push(this.tableSubTotal());
    content.push(this.tableDetailsOperatorsPDF());
    return content;
  }

  getPayRollConsolidate(){
    let consolidatedInfo: Array<any> = [];
    let count: number = 0;

    this.payRollConsolidate.forEach(x => {
      consolidatedInfo.push({
        '#' : count += 1,
        'Operario' : x.operator,
        'Cargo' : x.position_Job,
        'Producción' : this.formatNumbers((x.weight).toFixed(2)),
        'Presentación' : 'Kg',
        'Valor a Pagar' : `$ ${this.formatNumbers((x.value_Pay).toFixed(2))}` ,
      }); 
    });

    return consolidatedInfo;
  }

  tableConsolidated(data) {
    let columns: Array<string> = ['#', 'Operario', 'Cargo', 'Producción', 'Presentación', 'Valor a Pagar'];
    let widths: Array<string> = ['5%', '35%', '15%', '20%', '10%', '15%'];
    return {
      table: {
        headerRows: 2,
        widths: widths,
        body: this.buildTableBody(data, columns, 'Consolidado de Nómina de Operario(s)'),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex == 0 || rowIndex == 1) ? '#DDDDDD' : null;
        }
      }
    };
  }

  buildTableBody(data, columns, title: string) {
    var body = [];
    body.push([{ colSpan: 6, text: title, bold: true, alignment: 'center', fontSize: 10 }, '', '', '', '', '']);
    body.push(columns);
    data.forEach(function (row) {
      var dataRow = [];
      columns.forEach((column) => dataRow.push(row[column]));
      body.push(dataRow);
    });
    return body;
  }

  tableSubTotal() {
    let total: number = 0;
    let weight: number = 0;

    this.payRollConsolidate.forEach(x => {
      total += x.value_Pay
      weight += x.weight;
    } );
    return {
      margin: [0, 0, 0, 20],
      table: {
        widths: ['5%', '35%', '15%', '20%', '10%', '15%'],
        style: 'header',
        body: [
          [
            { border: [true, false, true, true], text: `Total Producción`, fontSize: 8, bold: true, colSpan : 3, aligment : 'left' },
            '',
            '',      
            { border: [true, false, true, true], text: `${this.formatNumbers((weight).toFixed(2))}`,  fontSize: 8, bold: true },
            { border: [true, false, true, true], text: `Total Nomina`, fontSize: 8, bold: true, alignment: 'right', },
            { border: [true, false, true, true], text: `$ ${this.formatNumbers((total).toFixed(2))}`, fontSize: 8, bold: true },
          ],
        ]
      }
    }
  }

  tableDetailsOperatorsPDF(): Array<any> {
    let data: Array<any> = [];
    let includedOperators: Array<string> = [];
    let count: number = 0;
    this.hiddenProduction.forEach(x => {
      if (!includedOperators.includes(x.operator)) {
        includedOperators.push(x.operator);
        count++;
        data.push([
          {
            margin: [0, 10],
            colSpan: 3,
            table: {
              headerRows: 1,
              widths : ['5%', '75%', '20%'],
              body: this.tableDetailsOrdersProductionPDF(x.operator, count),
            },
            fontSize: 9,
          },{},{}
        ]);
      }
    });
    return data;
  }

  tableDetailsOrdersProductionPDF(operator: number, countOperator: number){
    let orderByOperator: Array<any> = this.hiddenProduction.filter(x => x.operator == operator);
    let includedOrders: Array<number> = [];
    let count: number = 0;
    let data: Array<any> = [this.informationOperatorPDF(operator, countOperator)];
    orderByOperator.forEach(x => {
      if (!includedOrders.includes(x.ot)) {
        includedOrders.push(x.ot);
        count++;
        data.push([
          {
            margin: [5, 5],
            colSpan: 3,
            table: {
              headerRows: 1,
              widths : ['5%', '12%', '12%', '55%', '16%'],
              body: this.tableDetailsProductionByOrderPDF(x.ot, orderByOperator, count),
            },
            fontSize: 9,
          },{},{}
        ]);
      }
    });
    return data;
  }

  informationOperatorPDF(operator: any, countOperator: number){
    let totalQuantity: number = 0;
    this.hiddenProduction.filter(y => y.operator == operator).forEach(y => totalQuantity += y.value_Pay);
    let dataOperator: Array<any> = this.hiddenProduction.filter(x => x.operator == operator);
    return [
      { border: [true, true, false, true], text: countOperator, fillColor: '#ccc', bold: true },
      { border: [false, true, false, true], text: `Operario: ${dataOperator[0].operator}`, fillColor: '#ccc', bold: true },
      { border: [false, true, true, true], text: `Pago: $ ${this.formatNumbers((totalQuantity).toFixed(2))}`, fillColor: '#ccc', bold: true, alignment: 'right' },
    ];
  }

  tableDetailsProductionByOrderPDF(order: number, dataProduction: Array<any>, countOrder: number) {
    let data: Array<any> = [this.informationOrderPDF(order, countOrder, dataProduction)];
    data.push([
      {
        margin: [5, 5],
        colSpan: 5,
        table: {
          headerRows: 1,
          widths : ['5%', '10%', '10%', '10%', '10%', '5%', '5%', '10%', '8%', '10%', '12%', '5%'],
          body: this.dataDetailsProductionPDF(order, dataProduction),
        },
        fontSize: 9,
      },{},{},{},{}
    ]);
    return data;
  }

  informationOrderPDF(order: any, countOrder: number, dataProduction){
    let dataOrder: Array<any> = dataProduction.filter(x => x.ot == order);
    return [
      { border: [true, true, true, false], text: countOrder, fillColor: '#ddd', bold: true },
      { border: [true, true, true, false], text: `OT: ${dataOrder[0].ot}`, fillColor: '#ddd', bold: true },
      { border: [true, true, true, false], text: `Item: ${dataOrder[0].item}`, fillColor: '#ddd', bold: true },
      { border: [true, true, true, false], text: `Ref.:${dataOrder[0].reference}`, fillColor: '#ddd', bold: true },
      { border: [true, true, true, false], text: `Registros: ${this.formatNumbers((dataOrder.length))}`, fillColor: '#ddd', bold: true, alignment: 'right' },
    ];
  }

  dataDetailsProductionPDF(order: number, dataProduction: Array<any>){
    let data: Array<any> = [this.titlesDetailsProductionPDF()];
    let productionByOrder: Array<any> = dataProduction.filter(x => x.ot == order);
    let count: number = 0;
    productionByOrder.forEach(x => {
      count++;
      data.push([
        { border: [false, false, false, false], fontSize: 8, alignment: 'center', text: this.formatNumbers((count)) },
        { border: [false, false, false, false], fontSize: 8, alignment: 'center', text: x.date.replace('T00:00:00',``) },
        { border: [false, false, false, false], fontSize: 8, alignment: 'center', text: x.hour },
        { border: [false, false, false, false], fontSize: 8, alignment: 'center', text: x.roll },
        { border: [false, false, false, false], fontSize: 8, alignment: 'center', text: this.formatNumbers((x.weight).toFixed(2)) },
        { border: [false, false, false, false], fontSize: 8, alignment: 'center', text: 'Kg' },
        { border: [false, false, false, false], fontSize: 8, alignment: 'center', text: x.machine },
        { border: [false, false, false, false], fontSize: 8, alignment: 'center', text: x.sunday ? 'SI' : 'NO' },
        { border: [false, false, false, false], fontSize: 8, alignment: 'center', text: x.turn },
        { border: [false, false, false, false], fontSize: 8, alignment: 'center', text: `$ ${this.formatNumbers((x.value_Production).toFixed(2))}`  },
        { border: [false, false, false, false], fontSize: 8, alignment: 'center', text: `$ ${this.formatNumbers((x.value_Pay).toFixed(2))}`  },
        { border: [false, false, false, false], fontSize: 8, alignment: 'center', text: x.send_Zeus },
      ]);
    });
    return data;
  }

  titlesDetailsProductionPDF(){
    return [
      { border: [true, true, false, true], alignment: 'center', text: `#`, fillColor: '#eee', bold: true },
      { border: [false, true, false, true], alignment: 'center', text: `Fecha`, fillColor: '#eee', bold: true },
      { border: [false, true, false, true], alignment: 'center', text: `Hora`, fillColor: '#eee', bold: true },
      { border: [false, true, false, true], alignment: 'center', text: `Bulto`, fillColor: '#eee', bold: true },
      { border: [false, true, false, true], alignment: 'center', text: `Peso`, fillColor: '#eee', bold: true },
      { border: [false, true, false, true], alignment: 'center', text: `Und`, fillColor: '#eee', bold: true },
      { border: [false, true, false, true], alignment: 'center', text: `MQ`, fillColor: '#eee', bold: true },
      { border: [false, true, false, true], alignment: 'center', text: `Dom.`, fillColor: '#eee', bold: true },
      { border: [false, true, false, true], alignment: 'center', text: `Turno`, fillColor: '#eee', bold: true },
      { border: [false, true, false, true], alignment: 'center', text: `Valor`, fillColor: '#eee', bold: true },
      { border: [false, true, false, true], alignment: 'center', text: `Total`, fillColor: '#eee', bold: true },
      { border: [false, true, true, true], alignment: 'center', text: `Zeus`, fillColor: '#eee', bold: true },
    ]
  }

}

