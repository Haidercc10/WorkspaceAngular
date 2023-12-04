import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { DetallesAsignacionProductosFacturaService } from 'src/app/Servicios/DetallesFacturacionRollos/DetallesAsignacionProductosFactura.service';
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
    private createPDFService: CreacionPdfService,) {

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
    let lastMonth: any = moment().subtract(1, 'M').format('YYYY-MM-DD');
    let dateStart: any = moment(this.formSearchDespacho.value.dateStart).format('YYYY-MM-DD');
    let dateEnd: any = moment(this.formSearchDespacho.value.dateEnd).format('YYYY-MM-DD');
    dateStart = dateStart == 'Fecha inválida' ? lastMonth : dateStart;
    dateEnd = dateEnd == 'Fecha inválida' ? moment().format('YYYY-MM-DD') : dateEnd;
    let route: string = this.validateParamsInRoute();
    this.dtAsgDespacho.GetRollosEnviadosCamion(dateStart, dateEnd, route).subscribe(data => {
      this.dataDespacho = data;
      this.load = true;
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

  totalQuantity(data): number {
    let total: number = 0;
    total = data.details.reduce((acc, prod) => acc + (prod.presentacion == 'Kg' ? prod.peso : prod.cantidad), 0);
    return total;
  }

  createPDF(data: any) {
    this.load = true;
    let numFact = data.factura;
    let title = `Despacho de Mercancia Factura #${numFact}`;
    let content = [
      this.informationAboutFact(),
      this.datosClientePDF(data),
      this.informacionProduction(),
      this.table(this.dataProductionInPDF(data), ['Rollo', 'Item', 'Referencia', 'Cantidad', 'Presentación']),
      this.totalQuantities(data),
    ];
    this.createPDFService.formatoPDF(title, content);
    setTimeout(() => this.load = false, 3000);
  }

  informationAboutFact() {
    return {
      text: `Información Factura`,
      alignment: 'center',
      fontSize: 10,
      bold: true
    };
  }

  datosClientePDF(data: any) {
    let fact = data.factura;
    let driver = data.conductor;
    let cli = data.id_Cliente;
    let nameCli = data.cliente;
    let idCar = data.placa;
    return {
      margin: 5,
      table: {
        widths: ['50%', '50%'],
        body: [
          [
            { text: `Factura: ${fact}`, border: [true, true, false, true] },
            { text: ``, border: [false, true, true, true] },
          ],
          [
            { text: `Documento: ${cli}`, border: [true, true, false, true] },
            { text: `Cliente: ${nameCli}`, border: [true, true, true, true] },
          ],
          [
            { text: `Conductor: ${driver.nombre}`, border: [true, true, false, true] },
            { text: `Placa: ${idCar}`, border: [true, true, true, true] },
          ],
          [
            this.observacionPDF(data.observacion),
            {},
          ]
        ]
      },
      fontSize: 9,
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

  informacionProduction() {
    return {
      text: `Información detallada de los rollos `,
      alignment: 'center',
      style: 'header',
      fontSize: 10,
      bold: true
    }
  }

  dataProductionInPDF(dataFact) {
    let data: any = [];
    dataFact.details.forEach(prod => {
      data.push({
        "Rollo": prod.rollo,
        'Item': prod.item,
        'Referencia': prod.referencia,
        'Cantidad': this.formatonumeros((prod.cantidad).toFixed(2)),
        'Presentación': prod.presentacion
      })
    });
    return data;
  }

  table(data, columns) {
    return {
      margin: [0, 10],
      table: {
        headerRows: 1,
        widths: ['10%', '10%', '50%', '20%', '10%'],
        body: this.buildTableBody(data, columns),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex == 0) ? '#CCCCCC' : null;
        }
      }
    };
  }

  buildTableBody(data, columns) {
    var body = [];
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
      colSpan: 2,
      margin: [0, 10],
      table: {
        widths: ['*', '*'],
        body: [
          [
            { border: [true, true, true, true], text: `Cantidad Total: ${this.formatonumeros((this.totalQuantity(data)).toFixed(2))} ${data.details[0].presentacion}`, alignment: 'center', bold: true },
            { border: [true, true, true, true], text: `Kilos Totales: ${this.formatonumeros(data.pesoTotal)} Kg`, alignment: 'center', bold: true }
          ],
        ]
      },
      fontSize: 9,
    }
  }
}