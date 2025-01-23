import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';
import { modelDetalles_PlanillaDespacho } from 'src/app/Modelo/modelDetalles_PlanillaDespacho';
import { modelPlanillas_Despacho } from 'src/app/Modelo/modelPlanillas_Despacho';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { DetallesAsignacionProductosFacturaService } from 'src/app/Servicios/DetallesFacturacionRollos/DetallesAsignacionProductosFactura.service';
import { DetallesPlanillaDespachoService } from 'src/app/Servicios/Detalles_PlanillaDespacho/detalles-planilla-despacho.service';
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
  drivers: any[] = [];
  dataDespacho: any[] = [];

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
  ) {

    this.modoSeleccionado = this.appComponent.temaSeleccionado;
    this.formSearchDespacho = this.frmBuilder.group({
      document: [null],
      dateStart: [null],
      dateEnd: [null],
      driver: [null],
      car: [null],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.getDrivers();
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
    this.load = false;
    this.dataDespacho = [];
  }

  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  searchMovements() {
    //let lastMonth: any = moment().subtract(1, 'M').format('YYYY-MM-DD');
    this.load = true
    let today : any = moment().format('YYYY-MM-DD');
    let dateStart: any = moment(this.formSearchDespacho.value.dateStart).format('YYYY-MM-DD');
    let dateEnd: any = moment(this.formSearchDespacho.value.dateEnd).format('YYYY-MM-DD');
    dateStart = dateStart == 'Fecha inválida' ? today : dateStart;
    dateEnd = dateEnd == 'Fecha inválida' ? today : dateEnd;
    let route: string = this.validateParamsInRoute();
    this.dtAsgDespacho.GetRollosEnviadosCamion(dateStart, dateEnd, route).subscribe(data => {
      data.forEach(x => {
        x.details.forEach(z => {
          this.svZeus.getDataFactura(z.factura).subscribe(zData => {
            z.valor = zData.total,
            z.forma_Pago = zData.typePay
          });
        });
      });
      this.dataDespacho = data;
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
      //console.log(dataa, index);
      this.createDetailsSpreadSheet(dataPlanilla, data, index);
    }, error => {
      this.msj.mensajeError(`Error`, `Error al crear la planilla de despacho | ${error.status} ${error.statusText}`);
      this.load = false;
    });
  }

  createDetailsSpreadSheet(dataPlanilla : any, data : any,  index : number){
    let count : number = 0;
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
        count++
        if(count == this.dataDespacho[index].details.length) {
          //this.load = false;
          this.updateMovementsDispatch(dataPlanilla.pla_Id, this.dataDespacho[index].details.map(x => x.codigoSalida))
        }
      }, error => {
        this.msj.mensajeError(`Error`, `Error al crear los detalles de la planilla de despacho | ${error.status} ${error.statusText}`);
        this.load = false;
      });
    });
  }

  updateMovementsDispatch(codeSpreadSheet : number, codeDispatchs : any){
    this.svAsgDispatch.putMovementsDispatch(codeSpreadSheet, codeDispatchs).subscribe(() => {
      this.load = false;
      this.createPDF(codeSpreadSheet);
      this.msj.mensajeConfirmacion(`Confirmación`, `Se creó exitosamente la planilla de despacho N° ${codeSpreadSheet}`);
      setTimeout(() => { this.searchMovements(); }, 500);
    }, error => {
      this.msj.mensajeError(`Error`, `Error al actualizar los movimientos de despacho | ${error.status} ${error.statusText}`);
      this.load = false;
    });
  }

  totalDispatch(data, index): number {
    let total: number = 0;
    total = this.dataDespacho[index].details.reduce((acc, x) => acc += x.valor, 0);
    return total;
  }

  totalCounting(data, index): number {
    let total: number = 0;
    total = this.dataDespacho[index].details.filter(x => x.forma_Pago == 'CONTADO').reduce((acc, x) => acc += x.valor, 0);
    return total;
  }

  totalQuantity(data, index): number {
    let total: number = 0;
    total = this.dataDespacho[index].pesoTotal;
    return total;
  }

  createPDF(planilla : number) {
    this.load = true;
    this.svDetailsSpreadSheets.getSpreadSheetforId(planilla).subscribe(data => {
      let title = `Planilla de Despacho No. ${planilla}`;
      let content = [
        this.datosClientePDF(data[0]),
        //this.informacionProduction(),
        this.table(this.dataProductionInPDF(data), ['No.', 'Factura', 'NIT/CC', 'Cliente', 'Valor', 'Forma Pago', 'Peso Bruto']),
        this.totalQuantities(data[0]),
        this.infoAtte(),
      ];
      this.createPDFService.formatoPDF(title, content);
      setTimeout(() => this.load = false, 3000);
    });
  }

  datosClientePDF(data: any) {
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
            { text: `Fecha planilla: ${data.planilla.pla_Fecha.replace('T00:00:00', `- ${data.planilla.pla_Hora}`)}`, border: [true, true, false, true] },
            { text: `Fecha recepción: ${data.planilla.pla_Fecha == data.planilla.pla_FechaRecepcion ? '' : data.planilla.pla_FechaRecepcion + ' - ' + data.planilla.pla_HoraRecepcion}`, border: [true, true, true, true] },
          ],
          [
            { text: `Estado planilla: ${data.status}`, border: [true, true, false, true] },
            { text: `Generado por: ${data.userName}`, border: [true, true, true, true] },
          ],
          [
            { text: `Peso bruto total: ${data.planilla.pla_PesoTotal}`, border: [true, true, false, true] },
            { text: `Valor contado recepcionado: ${data.planilla.pla_ValorRecibido}`, border: [true, true, true, true] },
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
      })
    });
    return data;
  }

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

  // Tabla con textos finales. 
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