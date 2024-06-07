import { HttpErrorResponse } from '@angular/common/http';
import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { modelDevolucionProductos } from 'src/app/Modelo/modelDevolucionProductos';
import { modelDtProductoDevuelto } from 'src/app/Modelo/modelDtProductoDevuelto';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { DetallesDevolucionesProductosService } from 'src/app/Servicios/DetallesDevolucionRollosFacturados/DetallesDevolucionesProductos.service';
import { DevolucionesProductosService } from 'src/app/Servicios/DevolucionesRollosFacturados/DevolucionesProductos.service';
import { Dt_OrdenFacturacionService } from 'src/app/Servicios/Dt_OrdenFacturacion/Dt_OrdenFacturacion.service';
import { FallasTecnicasService } from 'src/app/Servicios/FallasTecnicas/FallasTecnicas.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { AppComponent } from 'src/app/app.component';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-Devolucion_OrdenFacturacion',
  templateUrl: './Devolucion_OrdenFacturacion.component.html',
  styleUrls: ['./Devolucion_OrdenFacturacion.component.css']
})

export class Devolucion_OrdenFacturacionComponent implements OnInit {

  storage_Id: number;
  ValidarRol: number;
  load: boolean = false;
  modoSeleccionado: boolean;
  formDataOrder: FormGroup;
  production: Array<production> = [];
  productionSelected: Array<production> = [];
  consolidatedProduction: Array<production> = [];
  fails : Array<any> = [];
  modalFails : boolean = false;
  reposition: boolean = false;
  
  @ViewChild('tableOrder') tableOrder : Table | undefined;
  @ViewChild('tableDevolution') tableDevolution : Table | undefined;
  @ViewChild('tableConsolidate') tableConsolidate : Table | undefined;

  constructor(private appComponent: AppComponent,
    private frmBuilder: FormBuilder,
    private msg: MensajesAplicacionService,
    private dtOrderFactService: Dt_OrdenFacturacionService,
    private createPDFService: CreacionPdfService,
    private devService: DevolucionesProductosService,
    private dtDevService: DetallesDevolucionesProductosService,
    private svFails : FallasTecnicasService,
    private svProduction : Produccion_ProcesosService,) {

    this.modoSeleccionado = appComponent.temaSeleccionado;

    this.formDataOrder = this.frmBuilder.group({
      order : [null, Validators.required],
      fact: [null, Validators.required],
      idClient: [null, Validators.required],
      client: [null, Validators.required],
      reason: [null, Validators.required],
      reposition : [false, Validators.required],
      roll : [''],
      observation: ['']
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.getFails();
  }

  formatNumbers = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  errorMessage(message: string, error: HttpErrorResponse) {
    this.load = false;
    this.msg.mensajeError(message, `Error: ${error.statusText} | Status: ${error.status}`);
  }

  lecturaStorage() {
    this.storage_Id = this.appComponent.storage_Id;
    this.ValidarRol = this.appComponent.storage_Rol;
  }

  //Función para obtener las fallas técnicas.
  getFails = () =>  this.svFails.srvObtenerLista().subscribe(datos => { this.fails = datos.filter((item) => [13,14,15].includes(item.tipoFalla_Id)) });
  
  applyFilter = ($event, campo : any, table : any) => table!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  clearFields() {
    this.load = false;
    this.formDataOrder.reset();
    this.production = [];
    this.productionSelected = [];
    this.consolidatedProduction = [];
  }

  clearTables(){
    this.production = [];
    this.productionSelected = [];
    this.consolidatedProduction = [];
  }

  validateUrl(){
    let order: any = this.formDataOrder.value.order;
    let fact: any = this.formDataOrder.value.fact;
    let roll : any = this.formDataOrder.value.roll;
    let url : string = ``;

    if(order != null) url += `of=${order}`;
    if(fact != null) url.length > 0 ? url += `&fact=${fact}` : url += `fact=${fact}`;
    if(roll != null) url.length > 0 ? url += `&roll=${roll}` : url += `roll=${roll}`;

    if(url.length > 0) url = `?${url}`;
    return url;
  }

  searchData() {
    this.clearTables();
    let reason: any = this.formDataOrder.value.reason;

    if (reason != null) {
      if (![null, undefined, ''].includes(this.validateUrl())) {
        this.load = true;
        this.dtOrderFactService.GetInformationOrderFactByFilters(this.validateUrl()).subscribe(dataOf => {
          console.log(dataOf);
          this.dtOrderFactService.GetInformationOrderFactByFactForDevolution(dataOf.id).subscribe(data => {
            data.forEach(x => {
              this.production.push({  
                'item': x.producto.prod_Id,
                'reference': x.producto.prod_Nombre,
                'numberProduction': x.dtOrder.numero_Rollo,
                'quantity': x.dtOrder.cantidad,
                'presentation': x.dtOrder.presentacion, 
                'fail' : reason,
              });
              this.changeInformationFact(x);
              this.load = false;
            });
          }, error => { this.errorMessage(`Ocurrió un error al consultar la orden de facturación N° ${dataOf.id}!`, error); });
        }, (error: HttpErrorResponse) => { this.errorMessage(`Error al consultar la orden de facturación por filtros!`, error);}); 
      } else this.msg.mensajeAdvertencia('Orden de facturación no valida!');
    } else this.msg.mensajeAdvertencia(`Debe elegir el motivo de la devolución!`);
  }

  changeInformationFact(data: any) {
    this.formDataOrder.patchValue({ 'idClient': data.clientes.cli_Id, 'client': data.clientes.cli_Nombre, 'fact': data.order.factura, 'order' : data.order.id, });
  }

  selectedProduction(production: production) {
    this.load = true;
    let index = this.production.findIndex(x => x.numberProduction == production.numberProduction);
    this.production.splice(index, 1);
    this.getConsolidateProduction();
    setTimeout(() => this.load = false, 50);
  }

  deselectedProduction(production: production) {
    this.load = true;
    let index = this.productionSelected.findIndex(x => x.numberProduction == production.numberProduction);
    this.productionSelected.splice(index, 1);
    this.getConsolidateProduction();
    setTimeout(() => this.load = false, 50);
  }

  selectedAllProduction() {
    this.load = true;
    this.productionSelected = this.productionSelected.concat(this.production);
    this.production = [];
    this.getConsolidateProduction();
    setTimeout(() => this.load = false, 50);
  }

  deselectedAllProduction() {
    this.load = true;
    this.production = this.production.concat(this.productionSelected);
    this.productionSelected = [];
    this.getConsolidateProduction();
    setTimeout(() => this.load = false, 50);
  }

  selectionForFilters(){
    let data = this.tableOrder.filteredValue ? this.tableOrder.filteredValue : this.tableOrder.value;

    if(data.length > 0) {
      this.load = true;
      this.productionSelected = this.productionSelected.concat(data); 
      if(!this.tableOrder.filteredValue) this.production = [];
      else {
        data.forEach(x => {
          let index : number = this.production.findIndex(p => p.numberProduction == x.numberProduction);
          this.production.splice(index, 1);
        });
        this.productionSelected.sort((a,b) => Number(b.numberProduction) - Number(a.numberProduction));
      }
      this.getConsolidateProduction();
      setTimeout(() => { this.load = false; }, 5);
    } else this.msg.mensajeAdvertencia(`No hay datos para seleccionar!`, ``);
  }

  deselectionForFilters(){
    let data = this.tableDevolution.filteredValue ? this.tableDevolution.filteredValue : this.tableDevolution.value;

    if(data.length > 0) {
      this.load = true;
      this.production = this.production.concat(data); 
      if(!this.tableDevolution.filteredValue) this.productionSelected = [];
      else {
        data.forEach(x => {
          let index : number = this.productionSelected.findIndex(p => p.numberProduction == x.numberProduction);
          this.productionSelected.splice(index, 1);
        });
        this.production.sort((a,b) => Number(a.numberProduction) - Number(b.numberProduction));
      }
      this.getConsolidateProduction();
      setTimeout(() => { this.load = false; }, 5);
    } else this.msg.mensajeAdvertencia(`No hay datos para deseleccionar!`, ``);  
  }

  getConsolidateProduction() {
    this.consolidatedProduction = this.productionSelected.reduce((a, b) => {
      if (!a.map(x => x.item).includes(b.item)) a = [...a, b];
      return a;
    }, []);
  }

  totalQuantityByProduct(item: number): number {
    let total: number = 0;
    this.productionSelected.filter(x => x.item == item).forEach(x => total += x.quantity);
    return total;
  }

  totalCountProductionByProduct(item: number): number {
    let total: number = 0;
    total = this.productionSelected.filter(x => x.item == item).length;
    return total;
  }

  validateInformation() {
    console.log(this.formDataOrder.value);
    console.log(this.formDataOrder);
    
    if (this.formDataOrder.valid) {
      if (this.productionSelected.length > 0) {
        if (this.formDataOrder.value.order != null) this.saveDev();
        else this.msg.mensajeAdvertencia(`¡El campo 'N° de Orden' se encuentra vacío!`);
      } else this.msg.mensajeAdvertencia(`No ha seleccionado ningún rollo para devolver!`);
    } else this.msg.mensajeAdvertencia(`Debe ingresar todos los datos!`);
  }

  saveDev() {
    this.load = true;
    let order : number = this.formDataOrder.value.order;
    let reposition : boolean = this.formDataOrder.value.reposition;
    let info: modelDevolucionProductos = {
      'FacturaVta_Id': this.formDataOrder.value.fact,
      'Cli_Id': this.formDataOrder.value.idClient,
      'DevProdFact_Fecha': moment().format('YYYY-MM-DD'),
      'DevProdFact_Hora': moment().format('HH:mm:ss'),
      'DevProdFact_Observacion': this.formDataOrder.value.observation != null ? (this.formDataOrder.value.observation).toUpperCase() : '',
      'TipoDevProdFact_Id': 1,
      'Usua_Id': this.storage_Id,
      'Id_OrdenFact': order,
      'Estado_Id': 11,
      'DevProdFact_Reposicion': reposition,
      'UsuaModifica_Id' : 0,
    };
    this.devService.srvGuardar(info).subscribe(data => this.saveDetailsFact(data), error => this.errorMessage(`¡Ocurrió un error al crear la devolución!`, error));
  }

  saveDetailsFact(data: any) {
    let count: number = 0;

    this.productionSelected.forEach(prod => {
      let info: modelDtProductoDevuelto = {
        'DevProdFact_Id': data.devProdFact_Id,
        'Prod_Id': prod.item,
        'DtDevProdFact_Cantidad': prod.quantity,
        'UndMed_Id': prod.presentation,
        'Rollo_Id': prod.numberProduction,
        'Falla_Id': prod.fail,
      }
      this.dtDevService.srvGuardar(info).subscribe(() => {
        count++;
        if (count == this.productionSelected.length) this.changeStatus(data);
      }, error => this.errorMessage(`Ocurrió un error al guardar los detalles de la devolución!`, error));
    });
  }

  changeStatus(data: any){
    let order: number = this.formDataOrder.value.order;
    let reels: any = [];

    this.productionSelected.forEach(x => { reels.push({ 'roll' : x.numberProduction, 'item' : x.item, 'currentStatus' : 23, 'newStatus' : 24, 'envioZeus' : true}) });
    this.dtOrderFactService.PutStatusProduction(reels.map(x => x.roll), order).subscribe(() => {
      this.updateStatusProduction(reels, data);
    }, (error) => this.errorMessage(`Ocurrió un error al cambiar el estado de los rollos en la orden N° ${order}!`, error));
  }

  updateStatusProduction(rolls : any, data : any){
    this.svProduction.putChangeStateProduction(rolls).subscribe(dataChange => {
      this.createPDF(data.devProdFact_Id, 'creada');
    }, error => {
      this.errorMessage(`No fue posible actualizar el estado de los rollos devueltos!`, error);
    })
  }

  createPDF(devolution: any, action? : string) {
    this.dtDevService.GetInformationDevById(devolution).subscribe(data => {
      let title: string = `Devolución N° ${devolution}`;
      let content: any[] = this.contentPDF(data);
      this.createPDFService.formatoPDF(title, content);
      this.msg.mensajeConfirmacion(`Devolución N° ${devolution} ${action} exitosamente!`);
      setTimeout(() => this.clearFields(), 3000);
    }, error => this.errorMessage(`¡Ocurrió un error al buscar información de la devolución #${devolution}!`, error));
  }

  contentPDF(data): any[] {
    let content: any[] = [];
    let consolidatedInformation: Array<any> = this.consolidatedInformation(data);
    let informationProducts: Array<any> = this.getInformationProducts(data);
    content.push(this.informationMovement(data[0]));
    content.push(this.informationClientPDF(data[0]));
    content.push(this.observationPDF(data[0]));
    content.push(this.tableConsolidated(consolidatedInformation));
    content.push(this.tableProducts(informationProducts));
    return content;
  }

  consolidatedInformation(data: any): Array<any> {
    let consolidatedInformation: Array<any> = [];
    let count: number = 0;
    data.forEach(prod => {
      if (!consolidatedInformation.map(x => x.Item).includes(prod.prod.prod_Id)) {
        count++;
        let cuontProduction: number = data.filter(x => x.prod.prod_Id == prod.prod.prod_Id).length;
        let totalQuantity: number = 0;
        data.filter(x => x.prod.prod_Id == prod.prod.prod_Id).forEach(x => totalQuantity += x.dtDev.cantidad);
        consolidatedInformation.push({
          "#": count,
          "Item": prod.prod.prod_Id,
          "Referencia": prod.prod.prod_Nombre,
          "Cant. Rollos": this.formatNumbers((cuontProduction).toFixed(2)),
          "Cantidad": this.formatNumbers((totalQuantity).toFixed(2)),
          "Presentación": prod.dtDev.presentacion
        });
      }
    });
    return consolidatedInformation;
  }

  getInformationProducts(data: any): Array<any> {
    let informationProducts: Array<any> = [];
    let count: number = 0;
    data.forEach(prod => {
      count++;
      informationProducts.push({
        "#": count,
        "Rollo": prod.dtDev.numero_Rollo,
        "Item": prod.prod.prod_Id,
        "Referencia": prod.prod.prod_Nombre,
        "Cantidad": this.formatNumbers((prod.dtDev.cantidad).toFixed(2)),
        "Presentación": prod.dtDev.presentacion,
        "Estado" : prod.estadoOF,
      });
    });
    return informationProducts;
  }

  informationMovement(data): {} {
    return {
      table: {
        widths: ['34%', '33%', '33%'],
        body: [
          [
            { text: `Información general del movimiento`, colSpan: 3, alignment: 'center', fontSize: 10, bold: true }, {}, {}
          ],
          [
            { text: `Orden Fact: ${data.dev.id_OrdenFact}` },
            { text: `Factura: ${data.dev.facturaVta_Id}` },
            { text: `Requiere reposición: ${data.dev.DevProdFact_Reposicion == true ? 'SI' : 'NO' }` },
          ],
          [
            { text: `Usuario ingreso: ${data.usua.usua_Nombre}` },
            { text: `Usuario revisión: ${data.usua.usua_Modifica == 0 ? '' : data.usua.usua_Modifica}` },
            { text: `Estado: ${data.estadoDv.estado_Nombre}` },
          ],
          [
            { text: `Fecha ingreso: ${(data.dev.devProdFact_Fecha).replace('T00:00:00','')} ${data.dev.devProdFact_Hora}`, }, 
            { text: `Fecha revisión: ${data.dev.devProdFact_FechaModificado != null ? (data.dev.devProdFact_FechaModificado).replace('T00:00:00','') : ''} ${data.dev.devProdFact_HoraModificado != null ? data.dev.devProdFact_HoraModificado : ''}`, }, 
            { text: `Fecha cierre: ${data.dev.devProdFact_FechaFinalizado != null ? (data.dev.devProdFact_FechaFinalizado).replace('T00:00:00', '') : ''} ${data.dev.devProdFact_HoraFinalizado != null ? data.dev.devProdFact_HoraFinalizado : ''}`, } 
          ] 
        ]
      },
      fontSize: 9,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex == 0) ? '#DDDDDD' : null;
        }
      }
    }
  }

  informationClientPDF(data): {} {
    return {
      margin : [0, 15, 0, 0],
      table: {
        widths: ['50%', '20%', '30%'],
        body: [
          [
            { text: `Información detallada del Cliente`, colSpan: 3, alignment: 'center', fontSize: 10, bold: true }, {}, {}
          ],
          [
            { text: `Nombre: ${data.cliente.cli_Nombre}` },
            { text: `ID: ${data.cliente.cli_Id}` },
            { text: `Tipo de ID: ${data.cliente.tipoIdentificacion_Id}` },
          ],
          [
            { text: `Telefono: ${data.cliente.cli_Telefono}` },
            { text: `E-mail: ${data.cliente.cli_Email}`, colSpan: 2 },
            {}
          ], 
        ]
      },
      fontSize: 9,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex == 0) ? '#DDDDDD' : null;
        }
      }
    }
  }

  tableConsolidated(data) {
    let columns: Array<string> = ['#', 'Item', 'Referencia', 'Cant. Rollos', 'Cantidad', 'Presentación'];
    let widths: Array<string> = ['10%', '10%', '40%', '15%', '15%', '10%'];
    return {
      table: {
        headerRows: 2,
        widths: widths,
        body: this.buildTableBody1(data, columns, 'Consolidado de producto(s)'),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex <= 1) ? '#DDDDDD' : null;
        }
      }
    };
  }

  tableProducts(data) {
    let columns: Array<string> = ['#', 'Rollo', 'Item', 'Referencia', 'Cantidad', 'Presentación', 'Estado'];
    let widths: Array<string> = ['4%', '8%', '8%', '40%', '10%', '10%', '20%'];
    return {
      margin: [0, 10],
      table: {
        headerRows: 2,
        widths: widths,
        body: this.buildTableBody2(data, columns, 'Rollos Seleccionados'),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex <= 1) ? '#DDDDDD' : null;
        }
      }
    };
  }

  buildTableBody1(data, columns, title) {
    var body = [];
    body.push([{ colSpan: 6, text: title, bold: true, alignment: 'center', fontSize: 10 }, '', '', '', '', '']);
    body.push(columns);
    data.forEach(function (row) {
      var dataRow = [];
      columns.forEach((column) => dataRow.push(row[column].toString()));
      body.push(dataRow);
    });
    return body;
  }

  buildTableBody2(data, columns, title) {
    var body = [];
    body.push([{ colSpan: 7, text: title, bold: true, alignment: 'center', fontSize: 10 }, '', '', '', '', '', '']);
    body.push(columns);
    data.forEach(function (row) {
      var dataRow = [];
      columns.forEach((column) => dataRow.push(row[column].toString()));
      body.push(dataRow);
    });
    return body;
  }

  observationPDF(data) {
    return {
      margin: [0, 20],
      table: {
        widths: ['*'],
        body: [
          [{ border: [true, true, true, false], text: `Observación: `, style: 'subtitulo', bold: true }],
          [{ border: [true, false, true, true], text: `Devolución por: ${data.dtDev.falla}. ${data.dev.devProdFact_Observacion.toString().trim()}` }]
        ]
      },
      fontSize: 9,
    }
  }

}

interface production {
  item: number;
  reference: string;
  numberProduction?: number;
  quantity: number;
  cuontProduction?: number;
  presentation: string;
  fail? : number;
}