import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
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

  constructor(private appComponent: AppComponent,
    private zeusInvService: InventarioZeusService,
    private frmBuilder: FormBuilder,
    private msg: MensajesAplicacionService,) {
    this.selectedMode = this.appComponent.temaSeleccionado;
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.formClientFilters = this.frmBuilder.group({
      idClient: [null],
      client: [null],
      item: [null],
      reference: [null],
      start: [null],
      end: [null],
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
    if (idClient != null) route += `client=${idClient}`;
    if (item != null) route.length > 0 ? route += `&item=${item}` : route += `item=${item}`;
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
}

interface BillsClient {
  year: number;
  month: string;
  date: any;
  bill: string;
  id_Client: number;
  client: string;
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