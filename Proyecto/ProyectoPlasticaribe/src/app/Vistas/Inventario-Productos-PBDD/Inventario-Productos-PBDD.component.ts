import { Component, OnInit, ViewChild } from '@angular/core';
import moment from 'moment';
import { Table } from 'primeng/table';
import { CreacionExcelService } from 'src/app/Servicios/CreacionExcel/CreacionExcel.service';
import { ExistenciasProductosService } from 'src/app/Servicios/ExistenciasProductos/existencias-productos.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { AppComponent } from 'src/app/app.component';
import { Recetas_ProductosComponent } from '../Recetas_Productos/Recetas_Productos.component';

@Component({
  selector: 'app-Inventario-Productos-PBDD',
  templateUrl: './Inventario-Productos-PBDD.component.html',
  styleUrls: ['./Inventario-Productos-PBDD.component.css']
})

export class InventarioProductosPBDDComponent implements OnInit {

  load: boolean = false;
  storage_Id: number;
  ValidarRol: number;
  modoSeleccionado: boolean = false;
  columns: Array<Columns> = [];
  selectedColumns: Array<Columns> = [];
  expandedRows: {} = {};
  stockInformation_Kg: Array<StockInformation> = [];
  stockInformation_UndPaq: Array<StockInformation> = [];
  stockInformation: Array<StockInformation> = [];
  @ViewChild('tableStock') tableStock: Table | undefined;
  @ViewChild('tableStock_Kg') tableStock_Kg: Table | undefined;
  @ViewChild('tableStock_UndPaq') tableStock_UndPaq: Table | undefined;
  recetaProducto: boolean = false;
  @ViewChild(Recetas_ProductosComponent) recetas_ProductosComponent: Recetas_ProductosComponent | undefined;

  constructor(private appComponent: AppComponent,
    private msg: MensajesAplicacionService,
    private stockService: ExistenciasProductosService,
    private createExcelService: CreacionExcelService,) {
    this.modoSeleccionado = this.appComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.getStockInformation()
  }

  fillColumns() {
    this.columns = [
      { header: 'Item', field: 'item', type: '' },
      { header: 'Cliente', field: 'client', type: '' },
      { header: 'Referencia', field: 'reference', type: '' },
      { header: 'Existencia', field: 'stock', type: 'number' },
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
    this.selectedColumns = [...this.columns];
    this.selectedColumns.splice(9, 12);
  }

  getStockInformation() {
    this.stockService.GetStockProducts_AvaibleProduction().subscribe(data => {
      this.fillColumns();
      this.stockInformation = this.fillStockInformation(data);
      this.stockInformation_Kg = this.stockInformation.filter(stock => stock.presentation == 'Kg');
      this.stockInformation_UndPaq = this.stockInformation.filter(stock => ['Und', 'Paquete'].includes(stock.presentation));
      this.stockInformation.forEach((stock) => this.expandedRows[stock.item] = true);
    });
  }

  fillStockInformation(data: any): Array<StockInformation> {
    let stockInformation: Array<StockInformation> = [];
    data.forEach(stock => {
      stockInformation.push({
        item: stock.product.item,
        reference: stock.product.reference,
        client: stock.client[0].cli.client,
        stock: stock.stock.stock,
        price: stock.stock.price,
        presentation: stock.stock.presentation,
        subTotal: stock.stock.stockPrice,
        seller: stock.client[0].vende.name_Vende,
        AvaibleProdution: this.fillAvaibleProduction(stock.avaible_Production),
        actualMonth: this.fillActualMonth(stock.stock_MonthByMonth[0]),
        junuary: stock.stock_MonthByMonth[0].enero,
        february: stock.stock_MonthByMonth[0].febrero,
        march: stock.stock_MonthByMonth[0].marzo,
        april: stock.stock_MonthByMonth[0].abril,
        may: stock.stock_MonthByMonth[0].mayo,
        june: stock.stock_MonthByMonth[0].junio,
        july: stock.stock_MonthByMonth[0].julio,
        august: stock.stock_MonthByMonth[0].agosto,
        september: stock.stock_MonthByMonth[0].septiembre,
        october: stock.stock_MonthByMonth[0].octubre,
        november: stock.stock_MonthByMonth[0].noviembre,
        december: stock.stock_MonthByMonth[0].diciembre,
      });
    });
    return stockInformation;
  }

  fillAvaibleProduction(data: any): Array<AvaibleProdution> {
    let AvaibleProdution: Array<AvaibleProdution> = [];
    data.forEach(stock => {
      AvaibleProdution.push({
        NumberProduction: stock.number,
        Quantity: stock.quantity,
        Weight: stock.weight,
        Presentation: stock.presentation,
        Process: stock.process,
        Date: stock.date,
        Hour: stock.hour,
        Price: stock.price,
        Turn: stock.turn,
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
}

interface StockInformation {
  item: number,
  reference: string,
  client: string,
  stock: number,
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