import { Component, OnInit, ViewChild } from '@angular/core';
import moment from 'moment';
import { Table } from 'primeng/table';
import { CreacionExcelService } from 'src/app/Servicios/CreacionExcel/CreacionExcel.service';
import { ExistenciasProductosService } from 'src/app/Servicios/ExistenciasProductos/existencias-productos.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { AppComponent } from 'src/app/app.component';
import { Recetas_ProductosComponent } from '../Recetas_Productos/Recetas_Productos.component';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { error } from 'console';

@Component({
  selector: 'app-Inventario-Productos-PBDD',
  templateUrl: './Inventario-Productos-PBDD.component.html',
  styleUrls: ['./Inventario-Productos-PBDD.component.css']
})

export class InventarioProductosPBDDComponent implements OnInit {

  load: boolean = false;
  storage_Id: number;
  storage_Nombre: string;
  ValidarRol: number;
  modoSeleccionado: boolean = false;
  columns: Array<Columns> = [];
  selectedColumns: Array<Columns> = [];
  selectedColumnsComparative: Array<Columns> = [];
  expandedRows: {} = {};
  expandedRows2: {} = {};
  stockInformation_Kg: Array<StockInformation> = [];
  stockInformation_UndPaq: Array<StockInformation> = [];
  stockInformation: Array<StockInformation> = [];
  @ViewChild('tableStock') tableStock: Table | undefined;
  @ViewChild('tableStock_Kg') tableStock_Kg: Table | undefined;
  @ViewChild('tableStock_UndPaq') tableStock_UndPaq: Table | undefined;
  @ViewChild('tableStockEmp') tableStockEmp: Table | undefined;
  @ViewChild('tableStockSella') tableStockSella: Table | undefined;
  @ViewChild('comparativeTable') comparativeTable: Table | undefined;
  @ViewChild('tableStockDelivered_NoAvaible') tableStockDelivered_NoAvaible: Table | undefined;
  recetaProducto: boolean = false;
  @ViewChild(Recetas_ProductosComponent) recetas_ProductosComponent: Recetas_ProductosComponent | undefined;
  stockEmpaque: Array<StockInformation> = [];
  stockSellado: Array<StockInformation> = [];
  comparativeStock: Array<StockInformation> = [];
  stockDelivered_NoAvaible: Array<StockInformation> = [];
  @ViewChild('tableRollsEmpaque') tableRollsEmpaque: Table | undefined;
  @ViewChild('tableRollsSellado') tableRollsSellado: Table | undefined;
  rollsAvailablesSellado : Array<any> = [];
  rollsAvailablesEmpaque : Array<any> = [];
  totalEmpaque : number = 0;
  totalSellado : number = 0;
  totalQtyEmpaque : number = 0; 
  totalQtySellado : number = 0; 
  loading : boolean = false;
  indexTab : number = 0;
  stateOptions: any[] = [{ value: 'off', icon : 'pi pi-table', title : 'Contraer filas'}, { value: 'on', icon : 'pi pi-list', title: 'Desplegar filas'}];
  value : string = 'off';

  constructor(private appComponent: AppComponent,
    private msg: MensajesAplicacionService,
    private stockService: ExistenciasProductosService,
    private createExcelService: CreacionExcelService,
    private svProductionProcess : Produccion_ProcesosService) {
    this.modoSeleccionado = this.appComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.lecturaStorage();
    this.loadRollsProductionAvailable();
    this.getStockInformation();
   }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.appComponent.storage_Id;
    this.storage_Nombre = this.appComponent.storage_Nombre;
    this.ValidarRol = this.appComponent.storage_Rol;
  }

  fillColumns() {
     this.columns = [
      { header: 'Item', field: 'item', type: '' },
      { header: 'Cliente', field: 'client', type: '' },
      { header: 'Referencia', field: 'reference', type: '' },
      { header: 'Existencia', field: 'stock', type: 'number' },
      { header: 'Área', field: 'stockInProcess', type: 'number' },
      { header: 'Exis. Total', field: 'totalStock', type: 'number' },
      { header: 'Precio', field: 'price', type: 'number' },
      { header: 'Presentación', field: 'presentation', type: '' },
      { header: 'SubTotal', field: 'subTotal', type: 'number' },
      { header: 'Vendedor', field: 'seller', type: '' },
      { header: 'Mes Actual', field: 'actualMonth', type: 'number' },
      { header: 'Enero', field: 'junuary', type: 'number' },
      { header: 'Febrero', field: 'february', type: 'number' },
      { header: 'Marzo', field: 'march', type: 'number' },
      { header: 'Abril', field: 'april', type: 'number' },
      { header: 'Mayo', field: 'may', type: 'number' },
      { header: 'Junio', field: 'june', type: 'number' },
      { header: 'Julio', field: 'july', type: 'number' },
      { header: 'Agosto', field: 'august', type: 'number' },
      { header: 'Septiembre', field: 'september', type: 'number' },
      { header: 'Octubre', field: 'october', type: 'number' },
      { header: 'Noviembre', field: 'november', type: 'number' },
      { header: 'Diciembre', field: 'december', type: 'number' },
    ];
      if([86,4].includes(this.ValidarRol)) {
        let cols : any = [];
        cols.push(this.columns[4], this.columns[5]);
        [4,5,6,8].forEach(x => this.columns.splice(x, 1));
        this.columns.splice(8, 12);
        this.columns.splice(4, 1);
        this.selectedColumns = [...this.columns];
        this.selectedColumnsComparative = [...this.columns];
        this.selectedColumnsComparative.splice(4, 0, cols[0], cols[1]);
      } else {
        this.selectedColumns = [...this.columns];
        this.selectedColumnsComparative = [...this.columns];
        this.selectedColumnsComparative.splice(10, 13);
        this.selectedColumns.splice(10, 13);
        this.selectedColumns.splice(4, 1);
        this.selectedColumns.splice(4, 1);
      }
  }

  getStockInformation() {
    this.load = true;
    this.stockService.GetStockProducts_AvaibleProduction().subscribe(data => {
      this.getStockProcess();
      this.getStockDeliveredNotAvaible();
      this.fillColumns();
      this.stockInformation = this.fillStockInformation(data);
      this.fillComparativeStock(data, true);
      this.stockInformation_Kg = this.stockInformation.filter(stock => stock.presentation == 'Kg');
      this.stockInformation_UndPaq = this.stockInformation.filter(stock => ['Und', 'Paquete'].includes(stock.presentation));
      this.stockInformation.forEach((stock) => this.expandedRows[stock.item] = true);
      setTimeout(() => this.load = false, 2000);
    });
  }

  getStockProcess(){
    ['EMP', 'SELLA'].forEach((process: 'EMP' | 'SELLA') => {
      this.stockService.GetStockProducts_Process(process).subscribe(data => {
        if (process == 'EMP') this.stockEmpaque = this.fillStockInformation(data);
        if (process == 'SELLA') this.stockSellado = this.fillStockInformation(data);
        
        this.fillComparativeStock(data, false);
      });
    });
  }

  getStockDeliveredNotAvaible() {
    this.stockService.GetStockDelivered_NoAvaible().subscribe(data => {
      this.stockDelivered_NoAvaible = this.fillStockInformation(data);
      this.fillComparativeStock(data, false);
    });
  }

  fillStockInformation(data: any): Array<StockInformation> {
    let stockInformation: Array<StockInformation> = [];
    data.forEach(stock => {
      if (!stockInformation.map(x => x.item).includes(stock.product.item)) {
        stockInformation.push({
          item: stock.product.item,
          reference: stock.product.reference,
          client: stock.client.cli.client,
          stock: stock.stock.stock,
          price: stock.stock.price,
          presentation: stock.stock.presentation,
          // subTotal: stock.stock.stockPrice,
          subTotal: (stock.stock.stock * stock.stock.price),
          seller: stock.client.vende.name_Vende,
          AvaibleProdution: this.fillAvaibleProduction(stock.avaible_Production),
          actualMonth: (stock.stock_MonthByMonth).length == 0 ? 0 : this.fillActualMonth(stock.stock_MonthByMonth[0]),
          junuary: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].enero,
          february: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].febrero,
          march: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].marzo,
          april: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].abril,
          may: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].mayo,
          june: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].junio,
          july: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].julio,
          august: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].agosto,
          september: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].septiembre,
          october: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].octubre,
          november: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].noviembre,
          december: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].diciembre,
        });
      }
    });
    return stockInformation;
  }

  fillAvaibleProduction(data: any): Array<AvaibleProdution> {
    let AvaibleProdution: Array<AvaibleProdution> = [];
    data.forEach(stock => {
      AvaibleProdution.push({
        NumberProduction: stock.number_BagPro,
        Quantity: stock.quantity,
        Weight: stock.weight,
        Presentation: stock.presentation,
        Process: stock.process,
        Date: stock.date,
        Hour: stock.hour,
        Price: stock.sellPrice,
        Turn: stock.turn.turno_Nombre,
        Information: stock.information,
        orderProduction: stock.orderProduction,
      });
    });
    return AvaibleProdution;
  }

  fillActualMonth(data: any): number {
    let month: number = moment().month();
    const stockMonths = {
      "0": data.enero,
      "1": data.febrero,
      "2": data.marzo,
      "3": data.abril,
      "4": data.mayo,
      "5": data.junio,
      "6": data.julio,
      "7": data.agosto,
      "8": data.septiembre,
      "9": data.octubre,
      "10": data.novimebre,
      "11": data.diciembre,
    }
    return stockMonths[month];
  }

  fillComparativeStock(data: any, avaible: boolean) {
    data.forEach(stock => {
      if (!this.comparativeStock.map(x => x.item).includes(stock.product.item)) {
        this.comparativeStock.push({
          item: stock.product.item,
          reference: stock.product.reference,
          client: stock.client.cli.client,
          stock: avaible ? stock.stock.stock : 0,
          stockInProcess: !avaible ? stock.stock.stock : 0,
          totalStock: stock.stock.stock,
          price: stock.stock.price,
          presentation: stock.stock.presentation,
          subTotal: (stock.stock.stock * stock.stock.price),
          seller: stock.client.vende.name_Vende,
          AvaibleProdution: this.fillAvaibleProduction(stock.avaible_Production),
          actualMonth: (stock.stock_MonthByMonth).length == 0 ? 0 : this.fillActualMonth(stock.stock_MonthByMonth[0]),
          junuary: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].enero,
          february: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].febrero,
          march: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].marzo,
          april: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].abril,
          may: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].mayo,
          june: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].junio,
          july: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].julio,
          august: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].agosto,
          september: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].septiembre,
          october: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].octubre,
          november: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].noviembre,
          december: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].diciembre,
        });
      } else {
        let i: number = this.comparativeStock.findIndex(x => x.item == stock.product.item);
        this.comparativeStock[i].stock += avaible ? stock.stock.stock : 0;
        this.comparativeStock[i].stockInProcess += !avaible ? stock.stock.stock : 0;
        this.comparativeStock[i].totalStock += stock.stock.stock;
        this.comparativeStock[i].subTotal += (stock.stock.stock * stock.stock.price);
      }
    });
  }

  apliedFilters = (data: Table, $event, campo: any) => data!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  totalStock(dataDocument: Array<StockInformation>): number {
    let total: number = 0;
    dataDocument.forEach(stock => total += stock.subTotal);
    return total;
  }

  showPopUpCreateAndEdit(data: any = "") {
    this.recetaProducto = true;
    this.recetas_ProductosComponent.limpiarTodo();
    if (data != "") {
      this.recetas_ProductosComponent.FormProductos.patchValue({ Nombre: data.Id, });
      this.recetas_ProductosComponent.buscarProductos();
      setTimeout(() => this.recetas_ProductosComponent.cambiarNombreProducto(), 500);
    }
  }

  createExcel(dataDocument: Array<StockInformation>) {
    if (dataDocument.length > 0) {
      const title = `Inventario de Productos Terminados ${moment().format('YYYY-MM-DD')}`;
      let font: any = { name: 'Comic Sans MS', family: 4, size: 9, underline: true, bold: true };
      let border: any = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      let workbook = this.createExcelService.formatoExcel(title);
      this.addPageExcel(workbook, font, border, dataDocument);
      this.createExcelService.creacionExcel(title, workbook);
    } else this.msg.mensajeAdvertencia(`¡No hay datos suficientes para crear el archivo de Excel!`);
  }

  addPageExcel(workbook, font, border, dataDocument: Array<StockInformation>) {
    let pageOne = workbook.worksheets[0];
    this.addHeaderPageOne(pageOne, font, border);
    pageOne.mergeCells('A1:T3');
    pageOne.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    this.addDataExcel(pageOne, dataDocument);
  }

  addHeaderPageOne(worksheet, font, border) {
    const header = ["Item", "Cliente", "Referencia", "Existencias", "Precio", "Subtotal", "Presentación", "Vendedor", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    let headerRow = worksheet.addRow(header);
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } }
      cell.font = font;
      cell.border = border;
    });
  }

  addDataExcel(worksheet, dataDocument: Array<StockInformation>) {
    let dataStock = this.fillDataExcel(dataDocument);
    dataStock.forEach(d => {
      let row = worksheet.addRow(d);
      let formatNumber: number[] = [4, 5, 6, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19, 20];
      formatNumber.forEach(e => row.getCell(e).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    });
    this.changeSizeColumnsExcel(worksheet);
  }

  fillDataExcel(dataDocument: Array<StockInformation>): any[] {
    let dataStock = [];
    dataDocument.forEach(stock => {
      dataStock.push([
        stock.item,
        stock.client,
        stock.reference,
        stock.stock,
        stock.price,
        stock.subTotal,
        stock.presentation,
        stock.seller,
        stock.junuary,
        stock.february,
        stock.march,
        stock.april,
        stock.may,
        stock.june,
        stock.july,
        stock.august,
        stock.september,
        stock.october,
        stock.november,
        stock.december,
      ]);
    });
    return dataStock;
  }

  changeSizeColumnsExcel(worksheet) {
    let size60: number[] = [2, 3, 8];
    let size20: number[] = [4, 5, 6, 7];
    let size15: number[] = [1, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    size60.forEach(e => worksheet.getColumn(e).width = 60);
    size20.forEach(e => worksheet.getColumn(e).width = 20);
    size15.forEach(e => worksheet.getColumn(e).width = 15);
    worksheet.getColumn(1).width = 10;
  }

  //Función que se encarga de filtrar la información de la tabla
  applyFilter($event, campo : any, datos : Table) {
    datos!.filter(($event.target as HTMLInputElement).value, campo, 'contains');
    this.calculateTotalEmpaque();
    this.calculateTotalSellado();
  } 

  //Función que se encarga de mantener expandida la información de la tabla.
  changeTab(e : any) {
    this.indexTab = e.index;

    if([86,4].includes(this.ValidarRol)) this.indexTab == 1 ? this.deployRows() : null;
    else {
      this.indexTab == 3 ? this.deployRows() : null;
      this.indexTab == 4 ? this.deployRows() : null;
    }
  }

  //Cargar producción disponible en el area de sellado y empaque.
  loadRollsProductionAvailable(){
    this.rollsAvailablesEmpaque = [];
    this.rollsAvailablesSellado = [];
    this.loading = true;

    this.svProductionProcess.getInfoProductionAvailable().subscribe(data => { 
      this.rollsAvailablesEmpaque = data.filter(x => x.process_Id == 'EMP');
      this.rollsAvailablesSellado = data.filter(x => x.process_Id == 'SELLA'); 
      this.calculateTotalEmpaque(); 
      this.calculateTotalSellado();
      this.loading = false;
    }, error => { 
      this.msg.mensajeError(`Error`, `Ocurrió un error al consultar la producción disponible`);
      this.loading = false; 
    });
  }

  /** Función que calcula el total de existencias y de valor que hay en la producción de empaque*/
  calculateTotalEmpaque(){
    setTimeout(() => {
      this.totalEmpaque = 0;
      this.totalQtyEmpaque = 0;
      if(this.tableRollsEmpaque) {
        if(this.tableRollsEmpaque.filteredValue != undefined) this.totalsForData(this.tableRollsEmpaque.filteredValue);
        else this.totalsForData(this.rollsAvailablesEmpaque);
      } else this.totalsForData(this.rollsAvailablesEmpaque);
    }, 500);
  }

  /** Función que calcula el total de existencias y de valor que hay en la producción de sellado*/
  calculateTotalSellado(){
    setTimeout(() => {
      this.totalSellado = 0;
      this.totalQtySellado = 0;
      if(this.tableRollsSellado) {
        if(this.tableRollsSellado.filteredValue != undefined) this.totalsForData(this.tableRollsSellado.filteredValue);
        else this.totalsForData(this.rollsAvailablesSellado);
      } else this.totalsForData(this.rollsAvailablesSellado);
    }, 500);
  }

  //Función para calcular los totales según la información que se le pase como parametro.
  totalsForData(data : any){
    data.forEach(x => {
      if(x.process_Id == 'SELLA') {
        this.totalSellado += x.subtotal;  
        this.totalQtySellado += x.realQty;
      } else if(x.process_Id == 'EMP') {
        this.totalEmpaque += x.subtotal;
        this.totalQtyEmpaque += x.realQty;
      }
    });
  }

  /** Desplegar y contraer filas de la tabla. */
  deployRows(){
    const thisRef = this;
    
    if([86].includes(this.ValidarRol)) this.indexTab == 1 && this.value == 'on' ? this.stockSellado.forEach((x) => thisRef.expandedRows[x.item] = true) : this.stockSellado.forEach((x) => thisRef.expandedRows[x.item] = false);
    else if([4].includes(this.ValidarRol)) this.indexTab == 1 && this.value == 'on' ? this.stockEmpaque.forEach((x) => thisRef.expandedRows[x.item] = true) : this.stockEmpaque.forEach((x) => thisRef.expandedRows[x.item] = false);
    else {
      this.indexTab == 3 && this.value == 'on' ? this.stockEmpaque.forEach((x) => thisRef.expandedRows[x.item] = true) : this.stockEmpaque.forEach((x) => thisRef.expandedRows[x.item] = false);
      this.indexTab == 4 && this.value == 'on' ? this.stockSellado.forEach((x) => thisRef.expandedRows[x.item] = true) : this.stockSellado.forEach((x) => thisRef.expandedRows[x.item] = false);
    }
  }

  //EXCEL ROLLO A ROLLO.
  /** Función que se encarga de crear el archivo de Excel de la producción de empaque. */
  createExcelRollToRoll(data : any, process : string){
    if(data.length > 0) {
      setTimeout(() => { this.loadSheetAndStyles(data, process); }, 500);
    } else this.msg.mensajeAdvertencia(`No hay datos para exportar`, `Debe haber al menos un registro en la tabla!`);
  }

  //Función que cargará la hoja de cálculo y los estilos.
  loadSheetAndStyles(data : any, process : string){  
    let title : any = `Reporte `;  
    process == 'EMPAQUE' ? title += `rollo a rollo Empaque` : title += `bulto a bulto Sellado`;
    title += ` ${moment().format('DD-MM-YYYY')}`
    let fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } };
    let border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }, };
    let font = { name: 'Calibri', family: 4, size: 11, bold: true };
    let alignment = { vertical: 'middle', horizontal: 'center', wrapText: true};
    let workbook = this.createExcelService.formatoExcel(title, true);

    this.addNewSheet(workbook, title, fill, border, font, alignment, data);
    this.createExcelService.creacionExcel(title, workbook);
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
    let rowHeader : any = ['A5','B5','C5','D5','E5','F5','G5','H5','I5','J5','K5']; 
    //ws.addRow([]);
    ws.addRow(this.loadFieldsHeader());
    
    rowHeader.forEach(x => ws.getCell(x).fill = fill);
    rowHeader.forEach(x => ws.getCell(x).alignment = alignment);
    rowHeader.forEach(x => ws.getCell(x).border = border);
    rowHeader.forEach(x => ws.getCell(x).font = font);
    ws.mergeCells('A1:K3');

    this.loadSizeHeader(ws);
  }

  //Función para cargar el tamaño y el alto de las columnas del header.
  loadSizeHeader(ws : any){
    [5,6].forEach(x => ws.getColumn(x).width = 50);
    [11].forEach(x => ws.getColumn(x).width = 30);
    [2,3,4].forEach(x => ws.getColumn(x).width = 10);
    [9].forEach(x => ws.getColumn(x).width = 8);
    [1].forEach(x => ws.getColumn(x).width = 5);
    [7,8,10,].forEach(x => ws.getColumn(x).width = 15);
  }

 //Función para cargar los nombres de las columnas del header
  loadFieldsHeader(){
    let headerRow = [
      'N°',
      'Rollo',
      'OT',
      'Item', 
      'Cliente',
      'Referencia', 
      'Existencias',
      'Precio',
      'Unidad', 
      'Subtotal',
      'Fecha'
    ];
    return headerRow;
  }

  //Cargar información con los estilos al formato excel. 
  loadInfoExcel(ws : any, data : any, border : any, alignment : any){
    let formatNumber: Array<number> = [7,8,10];
    let contador : any = 6;
    let row : any = ['A','B','C','D','E','F','G','H','I','J','K']; 

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
  addTotal(info : any, process : string){
    info.push([
      '',
      '',
      '',
      '',
      '',
      'DISPONIBLES',
      process == 'EMP' ? this.totalQtyEmpaque : this.totalQtySellado,
      '',
      'TOTAL',
      process == 'EMP' ? this.totalEmpaque : this.totalSellado,
      ''
    ]);
  }

  //.Función que contendrá la info al documento excel. 
  dataExcel(data : any){
    let info : any = [];
    let count : number = 0;
    data.forEach(x => {
      info.push([
        count += 1,
        x.roll_BagPro,
        x.ot,
        x.item,
        x.client,
        x.reference,
        x.realQty,
        x.price,
        x.presentation,
        x.subtotal,
        x.date,
      ]);
    });
    this.addTotal(info, data[0].process_Id);
    return info;
  }
  
}

interface StockInformation {
  item: number,
  reference: string,
  client: string,
  stock: number,
  stockInProcess?: number,
  totalStock?: number,
  price: number,
  presentation: string,
  subTotal: number,
  seller: string,
  AvaibleProdution: Array<AvaibleProdution>,
  actualMonth: number,
  junuary: number,
  february: number,
  march: number,
  april: number,
  may: number,
  june: number,
  july: number,
  august: number,
  september: number,
  october: number,
  november: number,
  december: number,
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

interface Columns {
  header: string;
  field: string;
  type: string;
}
