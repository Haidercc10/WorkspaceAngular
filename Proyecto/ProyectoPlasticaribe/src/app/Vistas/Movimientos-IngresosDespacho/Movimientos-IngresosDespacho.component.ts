import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { DetallesEntradaRollosService } from 'src/app/Servicios/DetallesEntradasRollosDespacho/DetallesEntradaRollos.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { AppComponent } from 'src/app/app.component';

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
  @ViewChild('table') table : Table | undefined;

  constructor(private appComponent: AppComponent,
    private frmBuilder: FormBuilder,
    private detailsProductionIncomeService: DetallesEntradaRollosService,
    private productsService: ProductoService,
    private msg: MensajesAplicacionService,
    private createPDFService : CreacionPdfService,) {

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

  clearFields(){
    this.products = [];
    this.dataSearched = [];
    this.formFilters.reset();
    this.load = false;
  }

  searchProduct(){
    let nombre : string = this.formFilters.value.reference;
    this.productsService.obtenerItemsLike(nombre).subscribe(resp => this.products = resp);
  }

  selectedProduct(){
    let producto : any = this.formFilters.value.reference;
    this.formFilters.patchValue({
      item : producto,
      reference : this.products.find(x => x.prod_Id == producto).prod_Nombre
    });
  }

  searchaDataProductionIncome(){
    let lastMounth: any = moment().subtract(1, 'M').format('YYYY-MM-DD');
    let startDate: any = moment(this.formFilters.value.startDate).format('YYYY-MM-DD');
    let endDate: any = moment(this.formFilters.value.endDate).format('YYYY-MM-DD');
    startDate = startDate == 'Fecha inválida' ? lastMounth : startDate;
    endDate = endDate == 'Fecha inválida' ? moment().format('YYYY-MM-DD') : endDate;
    let route: string = this.validateRoute();
    this.load = true;
    this.dataSearched = [];
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
    
    if (production != null) route += `production=${document}`;
    if (orderProduction != null) route.length > 0 ? route += `&orderProduction=${orderProduction}` : route += `orderProduction=${orderProduction}`;
    if (item != null) route.length > 0 ? route += `&item=${item}` : route += `item=${item}`;
    if (route.length > 0) route = `?${route}`;

    return route;
  }

  fillDataProductionIncome(data: any){
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
    });

    this.dataSearched.sort((a, b) => a.hour.localeCompare(b.hour));
    this.dataSearched.sort((a, b) => a.date.localeCompare(b.date));
  }

  applyFilter = ($event, campo : any) => this.table!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  formatNumbers = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  createPDF(){
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
          "#" : this.formatNumbers(count),
          "Item": prod.item,
          "Referencia": prod.reference,
          "Cant. Rollos": this.formatNumbers((cuontProduction).toFixed(2)),
          "Cantidad": this.formatNumbers((totalQuantity).toFixed(2)),
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
        "#" : this.formatNumbers(count),
        "Rollo": prod.production,
        "Item": prod.item,
        "Referencia": prod.reference,
        "Cantidad": this.formatNumbers((prod.quantity).toFixed(2)),
        "Presentación": prod.presentation,
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
        body: this.buildTableBody(data, columns, 'Consolidado de producto(s)'),
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
    let columns: Array<string> = ['#', 'Rollo', 'Item', 'Referencia', 'Cantidad', 'Presentación'];
    let widths: Array<string> = ['5%', '12%', '12%', '46%', '15%', '10%'];
    return {
      margin: [0, 5],
      table: {
        headerRows: 2,
        widths: widths,
        dontBreakRow: true,
        body: this.buildTableBody(data, columns, 'Rollos Ingresados'),
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
    body.push([{colSpan: 6, text: title, bold: true, alignment: 'center', fontSize: 10 } , '', '', '', '', '']);
    body.push(columns);
    data.forEach(function (row) {
      var dataRow = [];
      columns.forEach((column) => dataRow.push(row[column].toString()));
      body.push(dataRow);
    });
    return body;
  }
}

interface dataDesp {
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
}
