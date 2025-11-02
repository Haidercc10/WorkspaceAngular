import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { CreacionExcelService } from 'src/app/Servicios/CreacionExcel/CreacionExcel.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-ReporteFacturacionClientes',
  templateUrl: './ReporteFacturacionClientes.component.html',
  styleUrls: ['./ReporteFacturacionClientes.component.css']
})

export class ReporteFacturacionClientesComponent implements OnInit {

  load: boolean = false;
  storage_Id: number | undefined;
  storage_Name: string | undefined;
  validateRole: number | undefined;
  formClientFilters: FormGroup;
  selectedMode: boolean = false;
  clients: Array<any> = [];
  items: Array<any> = [];
  billsPerClient: Array<BillsClient> = [];
  @ViewChild('billsClient') billsClient: Table | undefined;
  @ViewChild('detailsTable') detailsTable: Table | undefined;
  asesores : any = [];

  constructor(private appComponent: AppComponent,
    private zeusInvService: InventarioZeusService,
    private frmBuilder: FormBuilder,
    private msg: MensajesAplicacionService,
    private svExcel: CreacionExcelService,
    private svUsuarios : UsuarioService,
  ) {
    this.selectedMode = this.appComponent.temaSeleccionado;
  }

  ngOnInit(): void {
    this.initForm();
    this.obtenerVendedores();
  }

  initForm() {
    this.formClientFilters = this.frmBuilder.group({
      idClient: [null],
      client: [null],
      item: [null],
      reference: [null],
      start: [null],
      end: [null],
      sales : [null]
    });
  }

  clearFields() {
    this.formClientFilters.reset();
    this.load = false;
    this.billsPerClient = [];
    this.items = [];
    this.clients = [];
    this.billsClient.clear();
  }

  errorMessage(message: string, error: HttpErrorResponse) {
    this.msg.mensajeError(message, `Error: ${error.error.title} | Status: ${error.status}`);
    this.load = false;
  }

  aplyFilter = ($event, campo: string, table: Table) => table!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  obtenerVendedores = () => this.svUsuarios.GetVendedores().subscribe(data => this.asesores = data);

  searchClients() {
    let idClient = this.formClientFilters.value.idClient;
    this.zeusInvService.getClientByIdThird(idClient).subscribe(data => {
      data.forEach(cli => {
        this.formClientFilters.patchValue({
          idClient: cli.idcliente,
          client: cli.razoncial,
        });
      });
    }, error => this.errorMessage(`¡No se encontró información del cliente consultado!`, error));
  }

  searchClientsByName() {
    let name = this.formClientFilters.value.client;
    this.zeusInvService.getClientByName(name).subscribe(data => this.clients = data);
  }

  selectClient() {
    let client = this.clients.find(x => x.idcliente == this.formClientFilters.value.client);
    this.formClientFilters.patchValue({
      idClient: client.idcliente,
      client: client.razoncial,
    });
  }

  searchItems() {
    let item = this.formClientFilters.value.item;
    this.zeusInvService.GetItemsByNumber(item).subscribe(data => {
      data.forEach(d => {
        this.formClientFilters.patchValue({
          item: d.codigo,
          reference: d.nombre,
        });
      });
    }, error => this.errorMessage(`¡No se encontró información del item consultado!`, error));
  }

  searchItemsByName() {
    let name: string = this.formClientFilters.value.reference;
    this.zeusInvService.GetItemsByName(name).subscribe(data => this.items = data);
  }

  selectItem() {
    let item = this.items.find(x => x.codigo == this.formClientFilters.value.reference);
    this.formClientFilters.patchValue({
      item: item.codigo,
      reference: item.nombre,
    });
  }

  validateRoute(): string {
    let route: string = '';
    let start = moment(this.formClientFilters.value.start).format('YYYY-MM-DD') == 'Fecha inválida' ? '2001-01-01' : moment(this.formClientFilters.value.start).format('YYYY-MM-DD');
    let end = moment(this.formClientFilters.value.end).format('YYYY-MM-DD') == 'Fecha inválida' ? moment().format('YYYY-MM-DD') : moment(this.formClientFilters.value.end).format('YYYY-MM-DD');
    let idClient = this.formClientFilters.value.idClient;
    let item = this.formClientFilters.value.item;
    let sales : any = this.formClientFilters.value.item;
    if (idClient != null) route += `client=${idClient}`;
    if (item != null) route.length > 0 ? route += `&item=${item}` : route += `item=${item}`;
    if (sales != null) route.length > 0 ? route += `&sales=${sales}` : route += `sales=${sales}`;
    if (route.length > 0) route = `?${route}`;
    route = `/${start}/${end}${route}`;
    return route;
  }

  searchBillsFromClient() {
    this.load = true;
    this.billsPerClient = [];
    this.billsClient.clear();
    let errorMessage: string = `¡No se encontraron facturas del cliente seleccionado!`;
    let count: number = 0;
    let route: string = this.validateRoute();
    this.zeusInvService.GetBillsByClient(route).subscribe(data => {
      data.forEach(bill => {
        this.consolidateDataClients(bill, data);
        count++;
        if (count == data.length) this.load = false;
      });
    }, error => this.errorMessage(errorMessage, error));
  }

  consolidateDataClients(billData: any, allData: any) {
    if (!this.billsPerClient.map(x => x.bill).includes(billData.bill)){
      let consolidateData: BillsClient = {
        year: billData.year,
        month: this.validateMonth(billData.month),
        date: (billData.date).replace('T00:00:00', ''),
        bill: billData.bill,
        id_Client: billData.id_Client,
        client: billData.client,
        sales : billData.sales,
        subTotal: this.subTotalPerBill(billData.bill, allData),
        subTotalDiscount: this.subTotalPerBillDiscount(billData.bill, allData),
        subTotalIVA: this.subTotalPerBillIVA(billData.bill, allData),
        finalSubTotal: this.subTotalPerBillFinal(billData.bill, allData),
        details: this.detailsDataClients(billData.bill, allData)
      }
      this.billsPerClient.push(consolidateData);
      this.billsPerClient.sort((a,b) => a.date.localeCompare(b.date));
    }
  }

  subTotalPerBill(bill: string, allData: any): number {
    let subTotal: number = 0;
    let detailsBill = allData.filter(x => x.bill == bill);
    detailsBill.forEach(det => subTotal += det.subTotal);
    return subTotal;
  }

  subTotalPerBillDiscount(bill: string, allData: any): number {
    let subTotal: number = 0;
    let detailsBill = allData.filter(x => x.bill == bill);
    detailsBill.forEach(det => subTotal += det.discount);
    return subTotal;
  }

  subTotalPerBillIVA(bill: string, allData: any): number {
    let subTotal: number = 0;
    let detailsBill = allData.filter(x => x.bill == bill);
    detailsBill.forEach(det => subTotal += det.iva);
    return subTotal;
  }

  subTotalPerBillFinal(bill: string, allData: any): number {
    let subTotal: number = 0;
    let detailsBill = allData.filter(x => x.bill == bill);
    detailsBill.forEach(det => subTotal += det.finalSubTotal);
    return subTotal;
  }

  detailsDataClients(bill: any, allData: any): Array<BillsClientDetails> {
    let details: Array<BillsClientDetails> = [];
    let detailsBill = allData.filter(x => x.bill == bill);
    detailsBill.forEach((data: any) => {
      details.push({
        item: data.item,
        reference: data.reference,
        quantity: data.quantity,
        presentation: data.presentation,
        price: data.price,
        subTotal: data.subTotal,
        percentageDiscount: data.percentageDiscount,
        subTotalDiscount: data.discount,
        percentageIVA: data.percentageIVA,
        subTotalIVA: data.iva,
        finalSubTotal: data.finalSubTotal
      });
    });
    return details;
  }

  validateMonth(numberMonth: number): 'ENERO' | 'FEBRERO' | 'MARZO' | 'ABRIL' | 'MAYO' | 'JUNIO' | 'JULIO' | 'AGOSTO' | 'SEPTIEMBRE' | 'OCTUBRE' | 'NOVIEMBRE' | 'DICIEMBRE' {
    let months: Array<'ENERO' | 'FEBRERO' | 'MARZO' | 'ABRIL' | 'MAYO' | 'JUNIO' | 'JULIO' | 'AGOSTO' | 'SEPTIEMBRE' | 'OCTUBRE' | 'NOVIEMBRE' | 'DICIEMBRE'> = [
      'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ];
    return months[numberMonth];
  }

  totalBillsClientSubTotal() : number {
    let total: number = 0;
    this.billsPerClient.forEach(bill => total += bill.subTotal);
    return total;
  }

  totalBillsClientDiscount() : number {
    let total: number = 0;
    this.billsPerClient.forEach(bill => total += bill.subTotalDiscount);
    return total;
  }

  totalBillsClientIVA() : number {
    let total: number = 0;
    this.billsPerClient.forEach(bill => total += bill.subTotalIVA);
    return total;
  }

  totalBillsClient() : number {
    let total: number = 0;
    this.billsPerClient.forEach(bill => total += bill.finalSubTotal);
    return total;
  }
  //Función que exportará un formato excel con los datos de los clientes
  exportExcel(){
    console.log(this.billsPerClient);
    if(this.billsPerClient.length > 0) {
      setTimeout(() => { this.loadSheetAndStyles(this.billsPerClient); }, 500);
    } else this.msg.mensajeAdvertencia(`Advertencia`, `No hay datos para exportar.`);
  }

  //Función que cargará la hoja y los estilos. 
  loadSheetAndStyles(data : any){  
    let title : any = `Reporte de Facturación de Clientes`;  
    title += ` ${moment().format('DD-MM-YYYY')}`
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
    let rowHeader : any = ['A5','B5','C5','D5','E5','F5','G5','H5','I5','J5']; 
    //ws.addRow([]);
    ws.addRow(this.loadFieldsHeader());
    
    rowHeader.forEach(x => ws.getCell(x).fill = fill);
    rowHeader.forEach(x => ws.getCell(x).alignment = alignment);
    rowHeader.forEach(x => ws.getCell(x).border = border);
    rowHeader.forEach(x => ws.getCell(x).font = font);
    ws.mergeCells('A1:J3');

    this.loadSizeHeader(ws);
  }

  //Función para cargar el tamaño y el alto de las columnas del header.
  loadSizeHeader(ws : any){
    [4,9,5].forEach(x => ws.getColumn(x).width = 40);
    [1].forEach(x => ws.getColumn(x).width = 5);
    [2,3,9,8,6,7,10].forEach(x => ws.getColumn(x).width = 15);
  }

 //Función para cargar los nombres de las columnas del header
  loadFieldsHeader(){
    let headerRow = [
      'N°',
      'Factura',
      'NIT/CC',
      'Razón Social',
      'Asesor',
      'Fecha',
      'Valor', 
      'Descuento',
      'Iva', 
      'Subtotal',
    ];
    return headerRow;
  }

  //Cargar información con los estilos al formato excel. 
  loadInfoExcel(ws : any, data : any, border : any, alignment : any){
    let contador : any = 6;
    let formatNumber: Array<number> = [7,8,9,10];
    formatNumber.forEach(i => ws.getColumn(i).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00');
    let row : any = ['A','B','C','D','E','F','G','H','I','J']; 
    
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

  //.Función que contendrá la info al documento excel. 
  dataExcel(data : any){
    let info : any = [];
    let count : number = 0;
    data.forEach(x => {
      info.push([
        count += 1,
        x.bill,
        x.id_Client,
        x.client,
        x.sales,
        x.date,
        x.subTotal, 
        x.subTotalDiscount,
        x.subTotalIVA,
        x.finalSubTotal,
      ]);
    });
    this.addTotal(info);
    return info;
  }

  //Agregar fila de totales al formato excel.
  addTotal(info : any){
    info.push([
      '',
      '',
      '',
      '',
      '',
      'TOTAL',
      this.qtySubTotal(),
      this.qtyDiscount(),
      this.qtyIva(),
      this.qtyTotal()
    ]);
  }

  qtyTotal = () => this.billsPerClient.reduce((a,b) => a += b.finalSubTotal, 0);

  qtyIva = () => this.billsPerClient.filter(x => x.subTotalIVA > 0).reduce((a,b) => a += b.subTotalIVA, 0);

  qtyDiscount = () => this.billsPerClient.filter(x => x.subTotalDiscount > 0).reduce((a,b) => a += b.subTotalDiscount, 0);
  
  qtySubTotal = () => this.billsPerClient.reduce((a,b) => a += b.subTotal, 0);

}

interface BillsClient {
  year: number;
  month: string;
  date: any;
  bill: string;
  id_Client: number;
  client: string;
  sales : string;
  subTotal: number;
  subTotalDiscount: number;
  subTotalIVA: number;
  finalSubTotal: number;
  details: Array<BillsClientDetails>;
}

interface BillsClientDetails {
  item: number;
  reference: string;
  quantity: number;
  presentation: string;
  price: number;
  subTotal: number;
  percentageDiscount: number;
  subTotalDiscount: number;
  percentageIVA: number;
  subTotalIVA: number;
  finalSubTotal: number;
}