import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import moment from 'moment';
import { Table } from 'primeng/table';
import { CreacionExcelService } from 'src/app/Servicios/CreacionExcel/CreacionExcel.service';
import { Ingreso_PeletizadoService } from 'src/app/Servicios/Ingreso_Peletizado/Ingreso_Peletizado.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-Inventario_Peletizado',
  templateUrl: './Inventario_Peletizado.component.html',
  styleUrls: ['./Inventario_Peletizado.component.css']
})
export class Inventario_PeletizadoComponent implements OnInit {
  load : boolean = false;
  recoveries : any = [];
  peletizados : any = [];
  detailsPele : any = [];
  modoSeleccionado: boolean = false;
  @ViewChild('tableRecoveries') tableRecoveries: Table | undefined;
  @ViewChild('tablePeletizados') tablePeletizados: Table | undefined;
  @ViewChild('tableDetails') tableDetails: Table | undefined;
  

  constructor(
    private AppComponent : AppComponent, 
    private svIngPele : Ingreso_PeletizadoService, 
    private svMatPrima : MateriaPrimaService,
    private msj : MensajesAplicacionService,
    private svExcel : CreacionExcelService,
  ) { 
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.inventoryPeletizados();
    this.inventoryMaterialRecovery();
  }

  inventoryMaterialRecovery(){
    this.load = true;
    this.recoveries = [];

    this.svMatPrima.getPeletizados().subscribe(data => { 
      this.recoveries = data; 
      this.load = false;
    }, error => {
      this.msj.mensajeError(`Error`, `Error al consultar los materiales recuperados | ${error.status} ${error.statusText}`);
      this.load = false;
    })
  }

  inventoryPeletizados(){
    this.load = true;
    this.peletizados = [];
    
    this.svIngPele.getStockPele_Grouped().subscribe(data => { 
      data.details = [];
      this.peletizados = data; 
      this.load = false;
    }, error => {
      if(error.status == 400) this.msj.mensajeAdvertencia(`Advertencia`, `No se encontraron materiales en la bodega de peletizado`);
      else this.msj.mensajeError( `Error`, `Error al consultar información de la bodega de peletizados | ${error.status} ${error.statusText}`);
      this.load = false;
    });
  }

  loadDetailsPeletizados(data : any){
    this.svIngPele.getStockPele_Details(data.id_MatPrima).subscribe(dataPele => {
      let index : number = this.peletizados.findIndex(x => x.id_MatPrima == data.id_MatPrima);
      this.peletizados[index].details = dataPele;
    }, error => {
      this.msj.mensajeError(`Error`, `Error al consultar información de los detalles del material ${data.matPrima} | ${error.status} ${error.statusText}`);
    });
  }

  applyFilter = ($event, campo : any, table : any) => table!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  totalQtyPele = () => this.peletizados.reduce((a, b) => a += b.ing.ingPel_Cantidad, 0);

  totalQtyRecoveries = () => this.peletizados.reduce((a, b) => a += b.ing.ingPel_Cantidad, 0);

  totalQtyStock = (data) => data._value.reduce((a, b) => a += b.stock, 0);

  totalPrice = (data) => data._value.reduce((a, b) => a += b.subtotal, 0);

  totalExcelStock = (data) => data.reduce((a, b) => a += b[4], 0);

  totalExcelPrice = (data) => data.reduce((a, b) => a += b[7], 0);

  //* Función para crear excel de rollo a rollo detallado.
  createExcel(data : any, warehouse : string){
    if(data.length > 0) {
      this.load = true;
      setTimeout(() => { this.loadSheetAndStyles(data, warehouse); }, 1500);
      setTimeout(() => { this.load = false; }, 1000);
    } else this.msj.mensajeAdvertencia(`No hay datos para exportar`, `Debe haber al menos un registro en la tabla!`);
  }

  //Función que cargará la hoja de cálculo y los estilos.
  loadSheetAndStyles(data : any, warehouse : string){  
    let title : any = `Inventario ${warehouse}`
    let fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } };
    let border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }, };
    let font = { name: 'Calibri', family: 4, size: 11, bold: true };
    let alignment = { vertical: 'middle', horizontal: 'center', wrapText: true};
    let workbook = this.svExcel.formatoExcel(title, true);
    setTimeout(() => {
      this.addNewSheet(workbook, title, fill, border, font, alignment, data);
      this.svExcel.creacionExcel(title, workbook);
    }, 1000);
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
    [5,7,8].forEach(x => ws.getColumn(x).width = 15);
    [1,3,6].forEach(x => ws.getColumn(x).width = 10);
    [2].forEach(x => ws.getColumn(x).width = 20);
  }

 //Función para cargar los nombres de las columnas del header
  loadFieldsHeader(){
    let headerRow = [
      'N°',
      'Categoria',
      'Id',
      'Mat. Prima',
      'Cantidad',
      'Und', 
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
    console.log(info);
    info.push([
      '',
      '',
      '',
      'CANTIDAD TOTAL:',
      this.totalExcelStock(info),
      '',
      'TOTAL:',
      this.totalExcelPrice(info),
    ]);
  }

  //.Función que contendrá la info al documento excel. 
  dataExcel(data : any){
    let info : any = [];
    let count : number = 0;
    data.forEach(x => {
      info.push([
        count += 1,
        x.category,
        x.id_MatPrima == undefined ? x.id : x.id_MatPrima,
        x.matPrima,
        x.stock,
        x.presentation,
        x.price,
        x.subtotal,
      ]);
    });
    this.addTotal(info);
    return info;
  }

}

