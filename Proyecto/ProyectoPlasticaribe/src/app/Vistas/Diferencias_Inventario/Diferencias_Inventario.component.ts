import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Table } from 'primeng/table';
import moment from 'moment';
import { OverlayPanel } from 'primeng/overlaypanel';
import { CreacionExcelService } from 'src/app/Servicios/CreacionExcel/CreacionExcel.service';
import { Dt_OrdenFacturacionService } from 'src/app/Servicios/Dt_OrdenFacturacion/Dt_OrdenFacturacion.service';
import { ExistenciasProductosService } from 'src/app/Servicios/ExistenciasProductos/existencias-productos.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { log } from 'console';

@Component({
  selector: 'app-Diferencias_Inventario',
  templateUrl: './Diferencias_Inventario.component.html',
  styleUrls: ['./Diferencias_Inventario.component.css']
})
export class Diferencias_InventarioComponent implements OnInit {

  load: boolean = false;
  storage_Id: number | undefined;
  storage_Name: string | undefined;
  ValidarRol: number | undefined;
  form !: FormGroup;
  modoSeleccionado: boolean;
  inventory : any = [];
  dataPL : Array<any> = [];
  dataZeus : Array<any> = [];
  modal : boolean = false;
  item : any = {};
  infoColor : any = ``; 
  stockInformation : any = [];
  modal2 : boolean = false;
  
  @ViewChild('tableZeus') tableZeus : Table | undefined;
  @ViewChild('tablePL') tablePL : Table | undefined;
  @ViewChild('dt') dt : Table | undefined;
  @ViewChild('op') op: OverlayPanel | undefined;
  @ViewChild('tableDetails1') tableDetails1: OverlayPanel | undefined;

  constructor(private zeusService : InventarioZeusService,
                private svExistProducts : ExistenciasProductosService, 
                  private dtOrderFact : Dt_OrdenFacturacionService,
                    private svcExcel : CreacionExcelService,
                      private msjs : MensajesAplicacionService,
                        private svBagPro : BagproService,
                          private svProductionProcess : Produccion_ProcesosService
                    ) { }

  ngOnInit() {
    this.items();
  }

  items(){
    this.inventory = [];
    this.load = true;
    this.zeusService.getInventoryZeus().subscribe(data => {
      this.svExistProducts.getInventoryProducts(data).subscribe(data2 => {
        this.inventory = data2.filter(x => x != null);
        this.svBagPro.srvObtenerItemsBagproXClienteItem(data2.filter(x => x != null).map(z => z.item)).subscribe(dataBagPro => {
          this.inventory.forEach(i => {
            i.client = dataBagPro.filter(x => x.clienteItems == i.item)[0].clienteNom;
          });
          this.load = false;
        }, e => {
          this.load = false;
          console.log(e, 1);
        })
      }, err => {
        this.load = false;
        console.log(err, 2);
      })
    }, error => {
      this.load = false;
      console.log(error, 3);
    });
  }
  
  applyFilter = ($event, campo: any, data: Table) => data!.filter(($event.target as HTMLInputElement).value, campo, 'contains');
  
  getModal(info : any){
    this.dataPL = [];
    this.dataZeus = [];
    this.item = {};
    this.item = { 'item' : info.item, 'reference' : info.reference };
    console.log(this.item);
    this.load = true;
    this.zeusService.getFacturacionPorItem(info.item).subscribe(data => { 
      this.dataZeus = data;
      this.dataZeus.sort((a,b) => b.date.localeCompare(a.date));
      this.dtOrderFact.getDetailsForItem(info.item).subscribe(data2 => {
        this.dataPL = data2;
        this.dataPL.sort((a,b) => b.date.localeCompare(a.date));
      }, err => {
        console.log(err);
      });
     }, error => {
      console.log(error);
     });
     setTimeout(() => { 
      this.modal = true;
      this.load = false; 
    }, 1500);
  }
  //Función para cargar los rollos que se cargarán en cuanto se seleccione una fila 
  loadInfoRollsAvailables(data : any){
    this.stockInformation = [];
    this.load = true;
    this.item = {};
    this.item = { 'item' : data.item, 'reference' : data.reference };
    this.svProductionProcess.getRollsAvailablesForItem(data.item).subscribe(dataRolls => {
      this.stockInformation = this.fillAvaibleProduction(dataRolls);
      this.modal2 = true;
      this.load = false;
    }, error => { this.msjs.mensajeAdvertencia(`Error`, `No se pudo obtener información del item N° ${data.item} en despacho.`); });
  }

  fillAvaibleProduction(data: any): Array<AvaibleProdution> {
    let AvaibleProdution: Array<AvaibleProdution> = [];
    data.forEach(stock => {
      AvaibleProdution.push({
        'NumberProduction': stock.number_BagPro,
        'Quantity': stock.quantity,
        'Weight': stock.weight,
        'Presentation': stock.presentation,
        'Process': stock.process,
        'Date': stock.date,
        'Hour': stock.hour,
        'Price': stock.sellPrice,
        'Turn': stock.turn.turno_Nombre,
        'Information': stock.information,
        'orderProduction': stock.orderProduction,
      });
    });
    return AvaibleProdution;
  }

  qtyTotalZeus = () => this.dataZeus.reduce((acc, item) => acc + item.qty, 0);  

  qtyTotalPlasticaribe = () => this.dataPL.reduce((acc, item) => acc + item.qty, 0);  

  //*Exportar formato excel del inventario
  exportExcel(){
    if(this.inventory.length > 0) {
      this.load = true;
      setTimeout(() => {
        let title : string = `Diferencias de Inventario ${moment().format('YYYY-MM-DD')}`;
        let fill : any = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } };
        let font : any = { size: 12, bold: true, alignment: 'center', name : 'Calibri' };
        let border : any = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        let workbook = this.svcExcel.formatoExcel(title, true);
        this.addSheet(workbook, fill, font, border, this.infoProduction(), 1);
        this.svcExcel.creacionHoja(workbook, `Diferencias de Inventario`, false);
        this.svcExcel.creacionExcel(title, workbook);
        this.load = false;  
      }, 2000);
    } else this.msjs.mensajeAdvertencia(`No hay registros para exportar!`);
  }

  //.Agregar hoja al formato excel.
  addSheet(workbook, fill , font, border, data : any, pageNumber : number) {
    let page = workbook.worksheets[pageNumber - 1];
    this.addHeaderPage(page, font, border, fill);
    page.getCell('A1').alignment = { vertical: 'middle', horizontal: 'right' };
    this.addInfoExcel(page, data);
  }

  //.Información de la producción.
  infoProduction(){
    let info : any = [];
    this.inventory.forEach(d => info.push([d.item, d.client, d.reference, d.qtyZeus, d.qtyPL, d.difference, d.genericQty, d.presentationPL, d.price]));    
    return info;
  }

  //.Agregar información a la hoja del excel.
  addInfoExcel(worksheet : any, data : any) {
    let formatNumber: Array<number> = [4,5,6,7,9];
    formatNumber.forEach(i => worksheet.getColumn(i).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    data.forEach(d => worksheet.addRow(d));
  }

  //.Agregar encabezado a la hoja del excel.
  addHeaderPage(worksheet, font, border, fill) {
    let rowHeader : any = ['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5', 'I5']
    worksheet.addRow(['Item', 'Cliente', 'Referencia', 'Cant. Zeus', 'Cant. Plasticaribe', 'Diferencia', 'Cant. Rollo/Bulto', 'Presentación', 'Precio']);
    
    rowHeader.forEach(x => worksheet.getCell(x).fill = fill);
    rowHeader.forEach(x => worksheet.getCell(x).font = font);
    rowHeader.forEach(x => worksheet.getCell(x).border = border);

    let concatCells : any = ['A1:I3'];
    this.stylesPage(worksheet, concatCells, []);
  }

  //.Estilos de la hoja del excel.
  stylesPage(worksheet, concatCells, formatNumber) {
    formatNumber.forEach(i => worksheet.getColumn(i).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    [1,4,6,9].forEach(x => worksheet.getColumn(x).width = 15);
    [2,3].forEach(x => worksheet.getColumn(x).width = 50);
    [5,7,8].forEach(x => worksheet.getColumn(x).width = 20);
    concatCells.forEach(cell => worksheet.mergeCells(cell));
  }

  //Función que muestra en un overlay la descripción de los 
  //colores rojo y amarillo de las cantidades.
  descriptionColors($event : any, color : string){
    if (color == 'yellow') this.infoColor = `<b>${'AMARILLO:'}</b> Indica que el item <b>tiene mayor cantidad en Zeus</b> que en Plasticaribe `;
    if (color == 'red') this.infoColor = `<b>${'ROJO:'}</b> Indica que <b>la cantidad en Plasticaribe es mayor</b> que en Zeus.`;

    setTimeout(() => {
      this.op!.toggle($event);
      $event.stopPropagation();
    }, 500);
  }

  //.Excel
  //. Función utilizada para descargar el formato excel
  exportExcel2(){
    if(this.inventory.length > 0) {
      this.load = true;
      setTimeout(() => {
        let title : string = `Movimientos Item ${this.item.item} - ${this.item.reference} - Zeus`;
        let fill : any = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } };
        let font : any = { size: 12, bold: true, alignment: 'center', name : 'Calibri' };
        let border : any = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        let workbook = this.svcExcel.formatoExcel(title, true);
        this.addSheet2(workbook, fill, font, border, this.infoProduction2(), 1);
        this.svcExcel.creacionHoja(workbook, `Movimientos Referencia ${this.item.item} - ${this.item.reference} - Plasticaribe`, false);
        this.addGroupedSheet2(workbook, fill, font, border, this.groupedInfoExcel2(), 2);
        this.svcExcel.creacionExcel(`Movimientos del item ${this.item.item}`, workbook);
        this.load = false;  
      }, 2000);
    } else this.msjs.mensajeAdvertencia(`No hay registros para exportar!`);
  }

  //.Agregar hoja al formato excel.
  addSheet2(workbook, fill , font, border, data : any, pageNumber : number) {
    let page = workbook.worksheets[pageNumber - 1];
    this.addHeaderPage2(page, font, border, fill);
    page.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    this.addInfoExcel2(page, data);
  }

  //.Información de la producción.
  infoProduction2(){
    let info : any = [];
    this.dataZeus.forEach(d => info.push([d.type, d.doc, d.date.replace('T00:00:00', ''), d.fact, d.client, d.qty, d.presentation, d.observation ]));
    return info;
  }

  //.Agregar información a la hoja del excel.
  addInfoExcel2(worksheet : any, data : any) {
    let formatNumber: Array<number> = [6];
    formatNumber.forEach(i => worksheet.getColumn(i).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    data.forEach(d => worksheet.addRow(d));
  }

  //.Agregar encabezado a la hoja del excel.
  addHeaderPage2(worksheet, font, border, fill) {
    
    let rowHeader : any = ['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5', ]
    worksheet.addRow(['Tipo', 'Consecutivo', 'Fecha', 'Documento', 'Cliente', 'Cantidad', 'Und', 'Observación', ]);
    
    rowHeader.forEach(x => worksheet.getCell(x).fill = fill);
    rowHeader.forEach(x => worksheet.getCell(x).font = font);
    rowHeader.forEach(x => worksheet.getCell(x).border = border);

    let concatCells : any = ['A1:H3'];
    this.stylesPage2(worksheet, concatCells, []);
  }

  //.Estilos de la hoja del excel.
  stylesPage2(worksheet, concatCells, formatNumber) {
    formatNumber.forEach(i => worksheet.getColumn(i).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    [1].forEach(x => worksheet.getColumn(x).width = 8);
    [3, 4, 6, 7].forEach(x => worksheet.getColumn(x).width = 12);
    [2].forEach(x => worksheet.getColumn(x).width = 15);
    [5].forEach(x => worksheet.getColumn(x).width = 45);
    [8].forEach(x => worksheet.getColumn(x).width = 70);
    concatCells.forEach(cell => worksheet.mergeCells(cell));
  }

  //Hoja 2 Agrupada
  addGroupedSheet2(workbook, fill , font, border, data : any, pageNumber : number){
    let page = workbook.worksheets[pageNumber - 1];
    this.addGroupedHeader2(page, font, border, fill);
    page.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    this.addGroupedInfoExcel2(page, data);
  }

  //.Agregar encabezado de la hoja 2: Reporte de producción consolidado.
  addGroupedHeader2(worksheet, font, border, fill) {
    worksheet.addRow([]);
    worksheet.addRow([]);
    let rowHeader : any = ['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4', ]
    worksheet.addRow(['Tipo', 'Consecutivo', 'Fecha', 'Documento', 'Cliente', 'Cantidad', 'Und', 'Observación', ]);
    
    rowHeader.forEach(x => worksheet.getCell(x).fill = fill);
    rowHeader.forEach(x => worksheet.getCell(x).font = font);
    rowHeader.forEach(x => worksheet.getCell(x).border = border);

    let concatCells : any = ['A1:H3'];
    this.stylesGroupedPage2(worksheet, concatCells, []);
  }

  //.Agregar información a la hoja 2: Reporte de producción consolidado.
  addGroupedExcel2(worksheet : any, data : any) {
    let formatNumber: Array<number> = [6];
    formatNumber.forEach(i => worksheet.getColumn(i).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    data.forEach(d => worksheet.addRow(d));
  }

  //.Agregar información a la hoja 2: Reporte de producción consolidado.
  addGroupedInfoExcel2(worksheet : any, data : any) {
    let formatNumber: Array<number> = [6];
    formatNumber.forEach(i => worksheet.getColumn(i).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    data.forEach(d => worksheet.addRow(d));
  }

  //.Información agrupada de la hoja 2: Reporte de producción consolidado.
  groupedInfoExcel2(){
    let info : any = [];
    this.dataPL.forEach(d => info.push([d.type, d.doc, d.date.replace('T00:00:00', ''), d.fact, d.client, d.qty, d.presentation, d.observation ]));
    return info;
  }

  //.Estilos de la hoja 2: Reporte de producción consolidado..
  stylesGroupedPage2(worksheet, concatCells, formatNumber) {
    formatNumber.forEach(i => worksheet.getColumn(i).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    [1].forEach(x => worksheet.getColumn(x).width = 8);
    [3, 4, 6, 7].forEach(x => worksheet.getColumn(x).width = 12);
    [2].forEach(x => worksheet.getColumn(x).width = 15);
    [5].forEach(x => worksheet.getColumn(x).width = 45);
    [8].forEach(x => worksheet.getColumn(x).width = 70);
    concatCells.forEach(cell => worksheet.mergeCells(cell));
  }
}

interface AvaibleProdution {
  NumberProduction: number;
  Quantity: number,
  Weight: number,
  Presentation: string,
  Process: string,
  Date: any,
  Hour: string,
  Price: number,
  Turn: string,
  Information: string,
  orderProduction: number,
}
