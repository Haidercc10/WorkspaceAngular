import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';
import { log } from 'node:console';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { modelDetalles_PlanillaDespacho } from 'src/app/Modelo/modelDetalles_PlanillaDespacho';
import { modelPlanillas_Despacho } from 'src/app/Modelo/modelPlanillas_Despacho';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { DetallesAsignacionProductosFacturaService } from 'src/app/Servicios/DetallesFacturacionRollos/DetallesAsignacionProductosFactura.service';
import { DetallesPlanillaDespachoService } from 'src/app/Servicios/Detalles_PlanillaDespacho/detalles-planilla-despacho.service';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { AsignacionProductosFacturaService } from 'src/app/Servicios/FacturacionRollos/AsignacionProductosFactura.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { PlanillasDespachoService } from 'src/app/Servicios/Planillas_Despacho/planillas-despacho.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-Movimientos_Despacho',
  templateUrl: './Movimientos_Despacho.component.html',
  styleUrls: ['./Movimientos_Despacho.component.css']
})

export class Movimientos_DespachoComponent implements OnInit {

  load: boolean = false;
  storage_Id: number;
  storage_Nombre: string;
  ValidarRol: number;
  modoSeleccionado: boolean = false;
  formSearchDespacho: FormGroup;
  form: FormGroup;
  drivers: any[] = [];
  dataDespacho: any[] = [];
  modal : boolean = false;
  codePlanilla : number = 0;
  statuses : Array<any> = [];
  @ViewChild('dt') dt: Table | undefined;
  dataSpreadSheet : any = {};
  dataDetails : any = {};
  indice : number;
  modalUpdateSpreadsheet : boolean = false;
  spreadSheet : number = null;

  constructor(private appComponent: AppComponent,
    private frmBuilder: FormBuilder,
    private dtAsgDespacho: DetallesAsignacionProductosFacturaService,
    private usersService: UsuarioService,
    private msj: MensajesAplicacionService,
    private createPDFService: CreacionPdfService,
    private svZeus : InventarioZeusService,
    private svSpreadsheets : PlanillasDespachoService,
    private svDetailsSpreadSheets : DetallesPlanillaDespachoService,
    private svAsgDispatch : AsignacionProductosFacturaService,
    private svStatuses : EstadosService,
    private msg : MessageService, 
  ) {

    this.modoSeleccionado = this.appComponent.temaSeleccionado;
    this.formSearchDespacho = this.frmBuilder.group({
      document: [null],
      dateStart: [null],
      dateEnd: [null],
      driver: [null],
      car: [null],
    });

    this.form = this.frmBuilder.group({
      date: [null],
      observation: [null],
      counting: [null],
      status: [null],
      hour: [null],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.getDrivers();
    this.getStatuses();
    this.loadRankDates();
    //this.searchMovements();
  }

  loadRankDates(){
    this.formSearchDespacho.patchValue({ 'dateStart' : new Date(), 'dateEnd' : new Date() });
  }

  lecturaStorage() {
    this.storage_Id = this.appComponent.storage_Id;
    this.storage_Nombre = this.appComponent.storage_Nombre;
    this.ValidarRol = this.appComponent.storage_Rol;
  }

  getDrivers() {
    this.usersService.GetConsdutores().subscribe(data => this.drivers = data);
  }

  clearFields() {
    this.formSearchDespacho.reset();
    this.loadRankDates();
    this.load = false;
    this.dataDespacho = [];
    this.dataDetails = [];
    this.dataSpreadSheet = [] 
  }

  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  searchMovements() {
    this.dataDespacho = [];
    //let lastMonth: any = moment().subtract(1, 'M').format('YYYY-MM-DD');
    this.load = true
    let today : any = moment().format('YYYY-MM-DD');
    let dateStart: any = moment(this.formSearchDespacho.value.dateStart).format('YYYY-MM-DD');
    let dateEnd: any = moment(this.formSearchDespacho.value.dateEnd).format('YYYY-MM-DD');
    dateStart = dateStart == 'Fecha inválida' ? today : dateStart;
    dateEnd = dateEnd == 'Fecha inválida' ? today : dateEnd;
    let route: string = this.validateParamsInRoute();
    this.dtAsgDespacho.GetRollosEnviadosCamion(dateStart, dateEnd, route).subscribe(data => {
      let datalength : number = data ? data.length : 0;
      let count : number = 0;
      data.forEach(x => {
        x.details.forEach(z => {
          this.svZeus.getDataFactura(z.factura).subscribe(zData => {
            z.valor = zData.total,
            z.forma_Pago = zData.typePay
          });
        });
        count++
        if(count == datalength) this.dataDespacho = data;
      });
      this.load = false;
    }, error => {
      this.msj.mensajeError(`No existen planillas de despacho en la fecha consultada | ${error.status} ${error.statusText}`);
      this.load = false;
    });
  }

  validateParamsInRoute() {
    let document: number = this.formSearchDespacho.value.document;
    let driver: any = this.formSearchDespacho.value.driver;
    let car: number = this.formSearchDespacho.value.car;
    let route: string = '';

    if (document != null) route += `factura=${document}`;
    if (car != null) route.length > 0 ? route += `&placa=${car}` : route += `placa=${car}`;
    if (driver != null) route.length > 0 ? route += `&conductor=${driver}` : route += `conductor=${driver}`;
    if (route.length > 0) route = `?${route}`;
    return route;
  }

  //Función para crear el encabezado de las planillas
  createSpreadSheet(data : any, index : number){
    this.load = true;
    let info : modelPlanillas_Despacho = {
      'Pla_Id': 0,
      'Pla_Placa': data.placa,
      'Pla_Fecha': moment().format('YYYY-MM-DD'),
      'Pla_Hora': moment().format('HH:mm:ss'),
      'Pla_ValorTotal': this.totalDispatch(data, index),
      'Pla_ValorContado': this.totalCounting(data, index),
      'Usua_Id': this.storage_Id,
      'Estado_Id': 11,
      'Pla_FechaRecepcion': moment().format('YYYY-MM-DD'),
      'Pla_HoraRecepcion': moment().format('HH:mm:ss'),
      'Pla_ValorRecibido': 0,
      'Pla_Observacion': '',
      'Usua_Conductor': data.id_Conductor,
      'Pla_PesoTotal': data.pesoTotal,
    }
    this.svSpreadsheets.Post(info).subscribe(dataPlanilla => {
      this.createDetailsSpreadSheet(dataPlanilla, data, index);
    }, error => {
      this.msj.mensajeError(`Error`, `Error al crear la planilla de despacho | ${error.status} ${error.statusText}`);
      this.load = false;
    });
  }

  //Función para crear el detalle de las planillas
  createDetailsSpreadSheet(dataPlanilla : any, data : any,  index : number){
    let count : number = 0;
    let details : any = [];
    
    this.dataDespacho[index].details.forEach(x => {
      let info : modelDetalles_PlanillaDespacho = {
        'DtPla_Codigo': 0,
        'Pla_Id': dataPlanilla.pla_Id,
        'Cli_Id': x.idCliente,
        'DtPla_Factura': x.factura,
        'DtPla_ValorFactura': x.valor,
        'DtPla_FormaPago': x.forma_Pago,
        'DtPla_UnidadesProducto': x.unidades_Producto,
        'DtPla_PesoBruto': x.peso_Bruto
      }
      this.svDetailsSpreadSheets.Post(info).subscribe(dataDet => {
        count++;
        x.codigos.forEach(y => { details.push(y); });
        if(count == this.dataDespacho[index].details.length) {
          this.updateMovementsDispatch(dataPlanilla.pla_Id, details);
        }
      }, error => {
        this.msj.mensajeError(`Error`, `Error al crear los detalles de la planilla de despacho | ${error.status} ${error.statusText}`);
        this.load = false;
      });
    });
  }

  //Función para actualizar los mov. de despacho
  updateMovementsDispatch(codeSpreadSheet : number, codeDispatchs : any){
    this.svAsgDispatch.putMovementsDispatch(codeSpreadSheet, true, codeDispatchs).subscribe(() => {
      this.load = false;
      this.createPDF(codeSpreadSheet);
      this.msj.mensajeConfirmacion(`Confirmación`, `Se creó exitosamente la planilla de despacho N° ${codeSpreadSheet}`);
      setTimeout(() => { 
        this.searchMovements();
        this.clearFields(); 
      }, 3000);
    }, error => {
      this.msj.mensajeError(`Error`, `Error al actualizar los movimientos de despacho | ${error.status} ${error.statusText}`);
      this.load = false;
    });
  }

  deleteFactFromSpreadSheet(data : any, details : any, index : number){
    this.onReject('anulled');
    let indx : number = this.dataDespacho.findIndex(x => x.planilla == data.planilla);
    
    this.svAsgDispatch.putMovementsDispatch(data.planilla, false, details.codigos).subscribe(() => {
      this.svDetailsSpreadSheets.getId(details.codigoDetail).subscribe(dataPL => {
        this.svDetailsSpreadSheets.Delete(dataPL.dtPla_Codigo).subscribe(() => {
          this.load = false;
          this.dataDespacho[indx].details.splice(index, 1);
          this.msj.mensajeConfirmacion(`Confirmación`, `Se retiró la factura N° ${details.factura} de la planilla N° ${data.planilla} exitosamente!`);
          this.createPDF(data.planilla);
          //setTimeout(() => { this.searchMovements(); }, 500);
        }, error => {
          this.msj.mensajeError(`Error`, `Error al eliminar la factura N° ${details.factura} de la planilla N° ${data.planilla} | ${error.status} ${error.statusText}`);
          this.load = false;
        });
      }, error => {
        this.msj.mensajeError(`Error`, `Error al consultar el detalle de la planilla | ${error.status} ${error.statusText}`);
        this.load = false;
      });
    }, error => {
      this.msj.mensajeError(`Error`, `Error al actualizar los movimientos de despacho | ${error.status} ${error.statusText}`);
      this.load = false;
    });
  }

  //Función para mostrar el valor total en pesos del despacho.
  totalDispatch(data, index): number {
    let total: number = 0;
    total = this.dataDespacho[index].details.reduce((acc, x) => acc += x.valor, 0);
    return total;
  }

  //Función para mostrar el valor total en pesos de contado del despacho.
  totalCounting(data, index): number {
    let total: number = 0;
    total = this.dataDespacho[index].details.filter(x => x.forma_Pago == 'CONTADO').reduce((acc, x) => acc += x.valor, 0);
    return total;
  }

  //Valor total cargado en camiones.
  totalValueDispatch(){
    let total = 0;
    this.dataDespacho.forEach(x => { 
      x.details.forEach(z => { total += z.valor; });
    });
    return total;
  }

  //Valor total a recaudar por facturas de contado. 
  totalValueCounting(){
    let total = 0;
    this.dataDespacho.forEach(x => { 
      x.details.forEach(z => { 
        if(z.forma_Pago == 'CONTADO') total += z.valor; 
      });
    });
    return total;
  }

  //Función para aplicar filtro en columnas
  applyFilter = ($event, campo : any, valorCampo : string) => this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  //Función para editar planillas por Id. 
  editSpreadSheet(data : any){
    this.codePlanilla = 0;
    this.svDetailsSpreadSheets.getSpreadSheetforId(data.planilla).subscribe(dataSp => {
      if(dataSp[0].status == 'CERRADA') this.msj.mensajeAdvertencia(`Advertencia`, `La planilla ya se encuentra cerrada!`);
      else {
        this.modal = true;
        this.codePlanilla = data.planilla;
        this.loadDataInModal(dataSp);
      }
    }, error => {
      if([404, 400].includes(error.status)) this.msj.mensajeAdvertencia(`Advertencia`, `No hay planillas asociadas a este movimiento.`)
      else this.msj.mensajeError(`Error`, `Error al consultar la planilla | ${error.status} ${error.statusText}`);
    });
  }

  //Función para cargar los datos de la planilla en el modal.
  loadDataInModal(data : any){
    this.form.patchValue({
      date : new Date(),
      counting : data[0].planilla.pla_ValorRecibido, 
      status : data[0].planilla.estado_Id, 
      observation : data[0].planilla.pla_Observacion, 
      hour : moment().format('HH:mm:ss'),
    });
  }

  //Función para actualizar la planilla. 
  updateSpreadSheetReceived(){
    this.onReject('update');
    this.load = true;
    let date : any = moment(this.form.value.date).format('YYYY-MM-DD');
    this.form.patchValue({ 'date' : date, 'hour' : moment().format('HH:mm:ss') });
    
    this.svSpreadsheets.putSpreadSheetForId(this.codePlanilla, this.form.value).subscribe(data => {
      this.load = false;
      this.msj.mensajeConfirmacion(`Confirmación`, `Planilla N° ${this.codePlanilla} actualizada correctamente!`);
      this.modal = false;
      this.createPDF(this.codePlanilla);
    }, error => {
      this.msj.mensajeError(`Error`, `Error al actualizar la planilla recibida N° ${this.codePlanilla} | ${error.status} ${error.statusText}`);
      this.load = false;
    });
  }

  //
  updateSpreadSheetForFact(){
    this.load = true;
    this.modalUpdateSpreadsheet = false;
    let detail : number = this.dataDetails.codigoDetail;
    let indx : number = this.dataDespacho.findIndex(x => x.planilla == this.dataSpreadSheet.planilla);
    
    this.svSpreadsheets.getId(this.spreadSheet).subscribe(dataSp => {
      this.svDetailsSpreadSheets.Put(detail, this.spreadSheet, this.dataDetails.codigos).subscribe(() => {
        this.dataDespacho[indx].details.splice(this.indice, 1);

        this.msj.mensajeConfirmacion(`Confirmación`, `Planilla N° ${this.spreadSheet} actualizada correctamente!`);
        this.createPDF(this.spreadSheet);
        this.load = false;
      }, error => {
       this.msj.mensajeError(`Error`, `Error al actualizar el movimiento seleccionado a la planilla N° ${this.spreadSheet} | ${error.status} ${error.statusText}`);
       this.load = false;
      });
    }, error => {
      this.msj.mensajeError(`Error`, `No se encontró la planilla N° ${this.spreadSheet} | ${error.status} ${error.statusText}`);
      this.load = false;
    });
  }

  //Función para limpiar los campos del modal en la planilla. 
  clearFieldsModal(){
    this.form.patchValue({
      date : new Date(), 
      counting  : 0, 
      status : null, 
      observation : '',
      hour : moment().format('HH:mm:ss'),
    });
  }

  //Función que mostrará un msj en las filas de mov. que tengan planillas asociadas. 
  msgRowSpreadSheets(data : any){
    return data.planilla == null ? '' : `Haz doble clic para actualizar la planilla N° ${data.planilla}`;
  }

   //Función que mostrará un msj de confirmación para la actualización de planillas.
   viewMsjUpdateSpreadSheet(){
    this.load = true;
    let msg : string = `Está seguro(a) que desea actualizar la información de la planilla N° ${this.codePlanilla}`;
    setTimeout(() => { this.msg.add({ severity:'warn', key:'update', summary: `Elección`, detail : msg,  sticky: true}); }, 200);
  }

  viewModal(data : any, details : any, index : number) {
    this.modalUpdateSpreadsheet = true;
    this.dataSpreadSheet = data;
    this.dataDetails = details;
    this.indice = index;
    this.spreadSheet = null;
    console.log(data, details, index);
  }

  //Función que mostrará un msj de confirmación para la actualización de planillas.
  viewMsjQuitFactura(data : any, details : any, index : number){
    this.dataSpreadSheet = data;
    this.dataDetails = details;
    this.indice = index;
    this.load = true;
    
    let msg : string = `Está seguro(a) que desea retirar la factura N° ${details.factura} de la planilla N° ${data.planilla}`;
    setTimeout(() => { this.msg.add({ severity:'warn', key:'anulled', summary: `Elección`, detail : msg,  sticky: true}); }, 200);
  }

  //Función que quitará el msj de elección
  onReject(key : any) {
    this.load = false;
    this.msg.clear(key);
  }

  //Función para cargar estados.
  getStatuses = () => this.svStatuses.srvObtenerListaEstados().subscribe(resp => this.statuses = resp.filter(x => [11, 18].includes(x.estado_Id)));

  //Función para mostrar la planilla después de que se crea. 
  createPDF(planilla : number) {
    this.load = true;
    this.svDetailsSpreadSheets.getSpreadSheetforId(planilla).subscribe(data => {
      let title = `Planilla de Despacho No. ${planilla}`;
      let content = [
        this.datosClientePDF(data[0]),
        this.table(this.dataProductionInPDF(data), ['No.', 'Factura', 'NIT/CC', 'Cliente', 'Valor', 'Forma Pago', 'Peso Bruto']),
        this.totalQuantities(data[0]),
        this.infoAtte(),
      ];
      this.createPDFService.formatoPDF(title, content);
      setTimeout(() => this.load = false, 3000);
    });
  }

  //Función que muestra los datos generales de la planilla. 
  datosClientePDF(data: any) {
    let date : any = data.planilla.pla_Fecha.replace('T00:00:00', '');
    let hour : string = data.planilla.pla_Hora;
    let dateReceived : any = data.planilla.pla_FechaRecepcion.replace('T00:00:00', ''); 
    let hourReceived : string = data.planilla.pla_HoraRecepcion; 
    console.log(hour,data);
    
    return {
      margin: 5,
      table: {
        widths: ['50%', '50%'],
        body: [
          [
            { text: `Información General de Despacho`, colSpan: 2, alignment: 'center', fontSize: 10, bold: true, },{}
          ],
          [
            { text: `Conductor: ${data.driver}`, border: [true, true, false, true] },
            { text: `Placa: ${data.planilla.pla_Placa}`, border: [true, true, true, true] },
          ],
          [
            { text: `Valor total: $${this.formatonumeros(data.planilla.pla_ValorTotal)}`, border: [true, true, false, true] },
            { text: `Valor contado: $${this.formatonumeros(data.planilla.pla_ValorContado)}`, border: [true, true, true, true] },
          ],
          [
            { text: `Fecha planilla: ${date.replace('T00:00:00', '') + ' ' + hour}`, border: [true, true, false, true] },
            { text: `Fecha recepción: ${date == dateReceived && hour == hourReceived ? '' : dateReceived + ' ' + hourReceived}`, border: [true, true, true, true] },
          ],
          [
            { text: `Estado planilla: ${data.status}`, border: [true, true, false, true] },
            { text: `Valor contado recepcionado: $${this.formatonumeros(data.planilla.pla_ValorRecibido)}`, border: [true, true, true, true] },
          ],
          [
            { text: `Peso bruto total: ${this.formatonumeros(data.planilla.pla_PesoTotal)} KLS`, border: [true, true, false, true] },
            { text: `Generado por: ${data.userName}`, border: [true, true, true, true] },
          ],
          [
            { text: `Observacion: ${data.planilla.pla_Observacion}`, colSpan : 2, border: [true, true, true, true] },
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

  //Función que muestra la información consolidad de la planilla. 
  dataProductionInPDF(dataPla) {
    let data: any = [];
    let count: number = 1;
    dataPla.forEach(x => {
      data.push({
        "No.": count++,
        "Factura": x.details.dtPla_Factura,
        'NIT/CC': x.details.cli_Id,
        'Cliente': x.client,
        'Forma Pago': x.details.dtPla_FormaPago,
        'Valor': this.formatonumeros((x.details.dtPla_ValorFactura).toFixed(2)),
        'Peso Bruto': this.formatonumeros((x.details.dtPla_PesoBruto).toFixed(2))
      });
    });
    return data;
  }

  //Función que crea la tabla de donde se encuentran las facturas despachadas. 
  table(data, columns) {
    return {
      margin: [0, 15, 0, 0],
      table: {
        headerRows: 2,
        widths: ['5%', '10%', '10%', '40%', '15%', '10%', '10%'],
        body: this.buildTableBody(data, columns, 'Información detallada de Facturas'),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex == 0 || rowIndex == 1) ? '#CCCCCC' : null;
        }
      }
    };
  }

  //Función que contruye el cuerpo de la tabla
  buildTableBody(data, columns, title) {
    var body = [];
    body.push([{ colSpan: 7, text: title, bold: true, alignment: 'center', fontSize: 10 }, '', '', '', '', '', '']);
    body.push(columns);
    data.forEach(function (row) {
      var dataRow = [];
      columns.forEach(function (column) {
        dataRow.push(row[column].toString());
      });
      body.push(dataRow);
    });
    return body;
  }

  //Función que muestra los totales. 
  totalQuantities(data) {
    return {
      //colSpan: 2,
      table: {
        widths: ['5%', '10%', '10%', '40%', '15%', '10%', '10%'],
        body: [
          [
            { border: [false, false, false, false], text: ``},
            { border: [false, false, false, false], text: ``},
            { border: [false, false, false, false], text: ``},
            { border: [true, false, true, true], text: `Valor Total`, alignment: 'right', bold: true },
            { border: [true, false, true, true], text: `$${this.formatonumeros(data.planilla.pla_ValorTotal)}`, alignment: 'left', bold: true },
            { border: [true, false, true, true], text: `Total Kilos`, alignment: 'right', bold: true},
            { border: [true, false, true, true], text: `${this.formatonumeros(data.planilla.pla_PesoTotal)}`, alignment: 'left', bold: true }
          ],
        ]
      },
      fontSize: 8,
    }
  }

  // Tabla con firmas de entrega y recibo. 
  infoAtte() {
    return {
      margin: [40, 80],
      fontSize: 10,
      bold: true,
      table: {
        widths: ['*', '*'],
        body: [
          [
            { text: `Entrega: __________________________`, alignment: 'left', border: [false, false, false, false], },
            { text: `Recibe: ___________________________`, alignment: 'right', border: [false, false, false, false], },
          ],
        ],
      }
    }
  }
  
}