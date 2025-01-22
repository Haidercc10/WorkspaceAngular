import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { DetallesAsignacionProductosFacturaService } from 'src/app/Servicios/DetallesFacturacionRollos/DetallesAsignacionProductosFactura.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
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
    }, () => this.msj.mensajeError(`¡No se encontró información!`), () => this.load = false);
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

  totalQuantity(data): number {
    let total: number = 0;
    total = data.details.reduce((acc, prod) => acc + (prod.presentacion == 'Kg' ? prod.peso : prod.cantidad), 0);
    return total;
  }

  createPDF(data: any, index : number) {
    this.load = true;
    let numFact = data.factura;
    let title = `Planilla de Despacho No. ${numFact}`;
    let content = [
      this.datosClientePDF(data, index),
      //this.informacionProduction(),
      this.table(this.dataProductionInPDF(data), ['No.', 'Factura', 'NIT/CC', 'Cliente', 'Valor', 'Forma Pago', 'Peso Bruto']),
      this.totalQuantities(data, index),
    ];
    this.createPDFService.formatoPDF(title, content);
    setTimeout(() => this.load = false, 3000);
  }

  datosClientePDF(data: any, index : number) {
    
    return {
      margin: 5,
      table: {
        widths: ['50%', '50%'],
        body: [
          [
            { text: `Información General de Despacho`, colSpan: 2, alignment: 'center', fontSize: 10, bold: true, },{}
          ],
          [
            { text: `Conductor: ${data.conductor}`, border: [true, true, false, true] },
            { text: `Placa: ${data.placa}`, border: [true, true, true, true] },
          ],
          [
            { text: `Valor total: $${this.formatonumeros(this.totalDispatch(data, index))}`, border: [true, true, false, true] },
            { text: `Valor contado: $${this.formatonumeros(this.totalCounting(data, index))}`, border: [true, true, true, true] },
          ],
          [
            { text: `Fecha planilla: ${data.fecha.replace('T00:00:00', '')}`, border: [true, true, false, true] },
            { text: `Fecha recepción: ${data.fecha.replace('T00:00:00', '')}`, border: [true, true, true, true] },
          ],
          [
            { text: `Estado planilla: ${''}`, border: [true, true, false, true] },
            { text: `Generado por: ${this.storage_Nombre}`, border: [true, true, true, true] },
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

  observacionPDF(observacion: string) {
    return {
      colSpan: 2,
      margin: [0, 10],
      border: [false, false, false, false],
      table: {
        widths: ['*'],
        body: [
          [{ border: [true, true, true, false], text: `Observación: `, style: 'subtitulo', bold: true }],
          [{ border: [true, false, true, true], text: observacion }]
        ]
      },
      fontSize: 9,
    }
  }

  dataProductionInPDF(dataFact) {
    let data: any = [];
    let count: number = 1;
    dataFact.details.forEach(x => {
      data.push({
        "No.": count++,
        "Factura": x.factura,
        'NIT/CC': x.idCliente,
        'Cliente': x.cliente,
        'Forma Pago': x.forma_Pago,
        'Valor': this.formatonumeros((x.valor).toFixed(2)),
        'Peso Bruto': x.peso_Bruto
      })
    });
    return data;
  }

  table(data, columns) {
    return {
      margin: [0, 10, 0, 0],
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

  totalQuantities(data, index) {
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
            { border: [true, false, true, true], text: `$${this.formatonumeros(this.totalDispatch(data, index))}`, alignment: 'left', bold: true },
            { border: [true, false, true, true], text: `Total Kilos`, alignment: 'right', bold: true},
            { border: [true, false, true, true], text: `${this.formatonumeros(data.pesoTotal)}`, alignment: 'left', bold: true }
          ],
        ]
      },
      fontSize: 9,
    }
  }
}