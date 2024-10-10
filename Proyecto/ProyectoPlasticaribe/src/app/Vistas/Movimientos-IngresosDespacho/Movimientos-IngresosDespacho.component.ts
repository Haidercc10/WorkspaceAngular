import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { DetallesEntradaRollosService } from 'src/app/Servicios/DetallesEntradasRollosDespacho/DetallesEntradaRollos.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { AppComponent } from 'src/app/app.component';
import { Ubicaciones_RollosComponent } from '../Ubicaciones_Rollos/Ubicaciones_Rollos.component';
import { Movimientos_RollosComponent } from '../Movimientos_Rollos/Movimientos_Rollos.component';

@Injectable({
  providedIn : 'root'
})

@Component({
  selector: 'app-Movimientos-IngresosDespacho',
  templateUrl: './Movimientos-IngresosDespacho.component.html',
  styleUrls: ['./Movimientos-IngresosDespacho.component.css']
})

export class MovimientosIngresosDespachoComponent implements OnInit {

  formFilters: FormGroup;
  load: boolean = false;
  storage_Id: number;
  validateRole: number | undefined;
  selectedMode: boolean = false;
  products: any[] = [];
  dataSearched: Array<dataDesp> = [];
  @ViewChild('table') table: Table | undefined;
  modal : boolean = false;
  dataSelected : any = [];
  traceability : boolean = false;
  @ViewChild(Movimientos_RollosComponent) cmpMovRolls : Movimientos_RollosComponent;
  selectedRoll : any = null;
  action : string = '';
  
  @ViewChild(Ubicaciones_RollosComponent) ubicationRolls : Ubicaciones_RollosComponent;

  constructor(private appComponent: AppComponent,
    private frmBuilder: FormBuilder,
    private detailsProductionIncomeService: DetallesEntradaRollosService,
    private productsService: ProductoService,
    private msg: MensajesAplicacionService,
    private createPDFService: CreacionPdfService,) {

    this.selectedMode = this.appComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.readStorage();
    this.initForm();
  }

  readStorage() {
    this.storage_Id = this.appComponent.storage_Id;
    this.validateRole = this.appComponent.storage_Rol;
  }

  initForm() {
    this.formFilters = this.frmBuilder.group({
      orderProduction: [null],
      startDate: [null],
      endDate: [null],
      item: [null],
      reference: [null],
      production: [null],
    });
  }

  clearFields() {
    this.products = [];
    this.dataSearched = [];
    this.formFilters.reset();
    this.load = false;
  }

  searchProduct() {
    let nombre: string = this.formFilters.value.reference;
    this.productsService.obtenerItemsLike(nombre).subscribe(resp => this.products = resp);
  }

  selectedProduct() {
    let producto: any = this.formFilters.value.reference;
    this.formFilters.patchValue({
      item: producto,
      reference: this.products.find(x => x.prod_Id == producto).prod_Nombre
    });
  }

  searchaDataProductionIncome() {
    let lastMounth: any = moment().subtract(1, 'M').format('YYYY-MM-DD');
    let startDate: any = moment(this.formFilters.value.startDate).format('YYYY-MM-DD');
    let endDate: any = moment(this.formFilters.value.endDate).format('YYYY-MM-DD');
    startDate = startDate == 'Fecha inválida' ? lastMounth : startDate;
    endDate = endDate == 'Fecha inválida' ? moment().format('YYYY-MM-DD') : endDate;
    let route: string = this.validateRoute();
    this.load = true;
    this.dataSearched = [];
    this.dataSelected = [];
    this.table.clear();

    this.detailsProductionIncomeService.GetDataProductionIncome(startDate, endDate, route).subscribe(data => {
      data.forEach(dataProduction => this.fillDataProductionIncome(dataProduction));
    }, error => {
      this.msg.mensajeError(`¡No se encontró información de ingresos a despacho con los parametros consultados!`, `Error: ${error.error.title} | Status: ${error.status}`);
      this.load = false;
    }, () => this.load = false);
  }

  validateRoute(): string {
    let route: string = ``;
    let production = this.formFilters.value.production;
    let orderProduction = this.formFilters.value.orderProduction;
    let item = this.formFilters.value.item;

    if (production != null) route += `production=${production}`;
    if (orderProduction != null) route.length > 0 ? route += `&orderProduction=${orderProduction}` : route += `orderProduction=${orderProduction}`;
    if (item != null) route.length > 0 ? route += `&item=${item}` : route += `item=${item}`;
    if (route.length > 0) route = `?${route}`;

    return route;
  }

  fillDataProductionIncome(data: any) {
    if (!this.dataSearched.map(x => x.production).includes(data.detailsProduction.numeroRollo_BagPro)) {
      this.dataSearched.push({
        orderProduction: data.details.dtEntRolloProd_OT,
        item: data.product.prod_Id,
        reference: data.product.prod_Nombre,
        production: data.detailsProduction.numeroRollo_BagPro,
        quantity: data.details.dtEntRolloProd_Cantidad,
        presentation: data.details.undMed_Rollo,
        date: (data.ent.entRolloProd_Fecha).replace('T00:00:00', ''),
        hour: (data.ent.entRolloProd_Hora).length == 7 ? `0${data.ent.entRolloProd_Hora}` : data.ent.entRolloProd_Hora,
        user: (data.user.usua_Nombre).toString().toUpperCase(),
        process: (data.process.proceso_Nombre).toString().toUpperCase(),
        ubication: (data.ent.entRolloProd_Observacion).toString().toUpperCase(),
        productionPL : data.detailsProduction.numero_Rollo,
        stateRollPP : data.state.estado_Nombre,
        price : data.detailsProduction.precioVenta_Producto,
      });
      this.dataSearched.sort((a, b) => a.hour.localeCompare(b.hour));
      this.dataSearched.sort((a, b) => a.date.localeCompare(b.date));
    }
  }

  applyFilter = ($event, campo: any) => this.table!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  formatNumbers = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  createPDF() {
    this.load = true;
    let title: string = `Ingresos a despacho`;
    let content: any[] = this.contentPDF();
    this.createPDFService.formatoPDF(title, content);
    setTimeout(() => this.load = false, 3000);
  }

  contentPDF(): Array<any> {
    let content: Array<any> = [];
    let consolidatedInformation: Array<any> = this.consolidatedInformation(this.dataSearched);
    let informationProducts: Array<any> = this.getInformationProducts(this.dataSearched);
    content.push(this.tableConsolidated(consolidatedInformation));
    content.push(this.tableProducts(informationProducts));
    return content;
  }

  consolidatedInformation(data: Array<dataDesp>): Array<any> {
    let consolidatedInformation: Array<any> = [];
    let count: number = 0;
    data.forEach(prod => {
      if (!consolidatedInformation.map(x => x.Item).includes(prod.item)) {
        let cuontProduction: number = data.filter(x => x.item == prod.item).length;
        let totalQuantity: number = 0;
        data.filter(x => x.item == prod.item).forEach(x => totalQuantity += x.quantity);
        count++;
        consolidatedInformation.push({
          "#": { text: this.formatNumbers(count), alignment: 'right', fontSize: 8 },
          "Item": prod.item,
          "Referencia": prod.reference,
          "Cant. Rollos": { text: this.formatNumbers((cuontProduction)), alignment: 'right', fontSize: 8 },
          "Cantidad": { text: this.formatNumbers((totalQuantity).toFixed(2)), alignment: 'right', fontSize: 8 },
          "Presentación": prod.presentation
        });
      }
    });
    return consolidatedInformation;
  }

  getInformationProducts(data: Array<dataDesp>): Array<any> {
    let informationProducts: Array<any> = [];
    let count: number = 0;
    data.forEach(prod => {
      count++;
      informationProducts.push({
        "#": { text: this.formatNumbers(count), alignment: 'right', fontSize: 7 },
        "Rollo": { text: prod.production, alignment: 'right', fontSize: 7 },
        "Item": { text: prod.item, alignment: 'right', fontSize: 7 },
        "Referencia": prod.reference,
        "Cantidad": { text: this.formatNumbers((prod.quantity).toFixed(2)), alignment: 'right', fontSize: 7 },
        "Presentación": prod.presentation,
        "Ubicación": prod.ubication
      });
    });
    return informationProducts;
  }

  tableConsolidated(data) {
    let columns: Array<string> = ['#', 'Item', 'Referencia', 'Cant. Rollos', 'Cantidad', 'Presentación'];
    let widths: Array<string> = ['5%', '10%', '50%', '10%', '15%', '10%'];
    return {
      margin: [0, 5],
      table: {
        headerRows: 2,
        widths: widths,
        body: this.buildTableBody(data, columns, 'Consolidado de producto(s)', 'COLIDATED'),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex == 0 || rowIndex == 1) ? '#DDDDDD' : null;
        }
      }
    };
  }

  tableProducts(data) {
    let columns: Array<string> = ['#', 'Rollo', 'Item', 'Referencia', 'Cantidad', 'Presentación', 'Ubicación'];
    let widths: Array<string> = ['5%', '7%', '7%', '40%', '8%', '10%', '23%'];
    return {
      margin: [0, 5],
      table: {
        headerRows: 2,
        widths: widths,
        dontBreakRow: true,
        body: this.buildTableBody(data, columns, 'Rollos Ingresados', 'DETAIL'),
      },
      fontSize: 7,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex == 0 || rowIndex == 1) ? '#DDDDDD' : null;
        }
      }
    };
  }

  buildTableBody(data, columns, title: string, type: 'COLIDATED' | 'DETAIL') {
    var body = [];
    if (type == 'COLIDATED') body.push([{ colSpan: 6, text: title, bold: true, alignment: 'center', fontSize: 10 }, '', '', '', '', '']);
    else body.push([{ colSpan: 7, text: title, bold: true, alignment: 'center', fontSize: 10 }, '', '', '', '', '', '']);
    body.push(columns);
    data.forEach(function (row) {
      var dataRow = [];
      columns.forEach((column) => dataRow.push(row[column]));
      body.push(dataRow);
    });
    return body;
  }

  fillDataProductsPDF(consolidatedInformation: any) {
    let data: Array<any> = [];
    let count: number = 0;
    consolidatedInformation.forEach(prod => {
      count++;
      data.push({
        margin: [0, 5],
        fontSize: 8,
        table: {
          headerRows: 1,
          widths: ['10%', '10%', '50%', '20%', '10%'],
          body: this.fillDataOrdersByItemPDF(prod.Item, count),
        },
      });
    });
    return data;
  }

  fillDataOrdersByItemPDF(item: any, countItem: number){
    let ordersByItem: Array<any> = this.dataSearched.filter(x => x.item == item);
    let count: number = 0;
    let includedOrders: Array<number> = [];
    let data: Array<any> = [this.informationItemPDF(item, countItem)];
    ordersByItem.forEach(prod => {
      if (!includedOrders.includes(prod.orderProduction)) {
        count++;
        includedOrders.push(prod.orderProduction);
        data.push([
          {
            margin: [0, 5],
            colSpan: 5,
            fontSize: 8,
            table: {
              headerRows: 1,
              widths: ['25%', '25%', '25%', '25%'],
              body: this.fillDataProductionyOrderPDF(prod.orderProduction, count),
            },
            layout: { defaultBorder: false, },
          },{},{},{},{}
        ]);
      }
    });
    return data;
  }

  informationItemPDF(item: any, countOperator: number){
    let totalQuantity: number = 0;
    this.dataSearched.filter(y => y.item == item).forEach(y => totalQuantity += y.quantity);
    let dataOperator: Array<any> = this.dataSearched.filter(x => x.item == item);
    return [
      { border: [true, true, false, true], text: countOperator, fillColor: '#ccc', bold: true },
      { border: [false, true, false, true], text: `${dataOperator[0].item}`, fillColor: '#ccc', bold: true, alignment: 'right' },
      { border: [false, true, false, true], text: `${dataOperator[0].reference}`, fillColor: '#ccc', bold: true },
      { border: [false, true, false, true], text: this.formatNumbers((totalQuantity).toFixed(2)), fillColor: '#ccc', bold: true, alignment: 'right' },
      { border: [false, true, true, true], text: `${dataOperator[0].presentation}`, fillColor: '#ccc', bold: true, alignment: 'right' },
    ];
  }

  fillDataProductionyOrderPDF(order: number, countOrder: number) {
    let widths: Array<string> = ['5%', '10%', '10%', '10%', '15%', '20%', '30%'];
    let data: Array<any> = [this.informationOrderPDF(order, countOrder)];
    data.push([
      {
        margin: [0, 5],
        colSpan: 4,
        table: {
          widths: widths,
          headerRows: 1,
          dontBreakRow: true,
          body: this.informationProductionPDF(order),
        },
        layout: { defaultBorder: false, },
        fontSize: 7,
      },{},{},{}
    ]);
    return data;
  }

  informationOrderPDF(order: any, countOrder: number){
    let totalQuantity: number = 0;
    this.dataSearched.filter(y => y.orderProduction == order).forEach(y => totalQuantity += y.quantity);
    let productionByOrder: Array<any> = this.dataSearched.filter(x => x.orderProduction == order);
    return [
      { border: [true, true, true, true], text: countOrder, fillColor: '#ddd', bold: true },
      { border: [true, true, true, true], text: `OT: ${productionByOrder[0].orderProduction}`, fillColor: '#ddd', bold: true },
      { border: [true, true, true, true], text: `Cantidad: ${this.formatNumbers((totalQuantity).toFixed(2))}`, fillColor: '#ddd', bold: true, alignment: 'right' },
      { border: [true, true, true, true], text: `Presentación: ${productionByOrder[0].presentation}`, fillColor: '#ddd', bold: true, alignment: 'right' },
    ];
  }

  informationProductionPDF(order: any){
    let productionByOrder: Array<any> = this.dataSearched.filter(x => x.orderProduction == order);
    let data: Array<any> = [this.titlesDetailsProductionPDF()];
    let count: number = 0;
    productionByOrder.forEach(x => {
      count++;
      data.push([
        { border: [false, false, false, false], fontSize: 7, alignment: 'right', text: this.formatNumbers((count)) },
        { border: [false, false, false, false], fontSize: 7, alignment: 'right', text: x.production },
        { border: [false, false, false, false], fontSize: 7, alignment: 'right', text: this.formatNumbers((x.quantity).toFixed(2)) },
        { border: [false, false, false, false], fontSize: 7, alignment: 'center', text: x.presentation },
        { border: [false, false, false, false], fontSize: 7, alignment: 'center', text: x.process },
        { border: [false, false, false, false], fontSize: 7, alignment: 'center', text: `${x.date} - ${x.hour}` },
        { border: [false, false, false, false], fontSize: 7, alignment: 'center', text: x.ubication },
      ]);
    });
    return data;
  }

  titlesDetailsProductionPDF(){
    return [
      { border: [true, true, true, true], alignment: 'center', text: `#`, fillColor: '#eee', bold: true },
      { border: [true, true, true, true], alignment: 'center', text: `Rollo`, fillColor: '#eee', bold: true },
      { border: [true, true, true, true], alignment: 'center', text: `Cantidad`, fillColor: '#eee', bold: true },
      { border: [true, true, true, true], alignment: 'center', text: `Presentación`, fillColor: '#eee', bold: true },
      { border: [true, true, true, true], alignment: 'center', text: `Proceso`, fillColor: '#eee', bold: true },
      { border: [true, true, true, true], alignment: 'center', text: `Fecha`, fillColor: '#eee', bold: true },
      { border: [true, true, true, true], alignment: 'center', text: `Ubicación`, fillColor: '#eee', bold: true },
    ]
  }

  //Función que cargará el modal de traslados/reubicaciones
  loadModal(validateTraslate : boolean) {
    this.modal = true;
    validateTraslate ? this.ubicationRolls.traslate = true : this.ubicationRolls.traslate = false; 
    validateTraslate ? this.action = `Traslado/Salida de rollos` : this.action = `Actualizar ubicaciones de rollos`;
    this.ubicationRolls.fails = [];
    this.ubicationRolls.getFails();
    this.ubicationRolls.loadRolls();
  }

  loadRollsAvailables(){
    this.load = true;
    this.dataSelected = this.dataSearched.filter(x => x.stateRollPP == 'DISPONIBLE');
    setTimeout(() => { this.load = false; }, 50);
  }

  //*Movimientos de rollos/bultos que pasaron por despacho
  searchMovements(data : any){
    this.load = true;
    setTimeout(() => {
      this.traceability = true;
      this.selectedRoll = data.production;
      this.cmpMovRolls.searchMovements(data, `Despacho`);
      this.load = false;
    }, 500);
  }  
}

export interface dataDesp {
  orderProduction: number;
  item: number;
  reference: string;
  production: number;
  quantity: number;
  presentation: string;
  date: string;
  hour: string;
  user: string;
  process: string;
  ubication: string;
  productionPL : number;
  stateRollPP : string;
  price : number;
}