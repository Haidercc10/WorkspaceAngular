import { HttpErrorResponse } from '@angular/common/http';
import { Component, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import JsBarcode from 'jsbarcode';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { modelDtPreEntregaRollos } from 'src/app/Modelo/modelDtPreEntregaRollo';
import { modelPreentregaRollos } from 'src/app/Modelo/modelPreEntregaRollo';
import { DtPreEntregaRollosService } from 'src/app/Servicios/DetallesPreIngresoRollosDespacho/DtPreEntregaRollos.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { PreEntregaRollosService } from 'src/app/Servicios/PreIngresoRollosDespacho/PreEntregaRollos.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { TurnosService } from 'src/app/Servicios/Turnos/Turnos.service';
import { AppComponent } from 'src/app/app.component';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';

@Component({
  selector: 'app-PreIngresoProduccion_Despacho',
  templateUrl: './PreIngresoProduccion_Despacho.component.html',
  styleUrls: ['./PreIngresoProduccion_Despacho.component.css']
})

@Injectable({
  providedIn: 'root'
})

export class PreIngresoProduccion_DespachoComponent implements OnInit {

  storage_Id: number;
  ValidarRol: number;
  load: boolean = false;
  modoSeleccionado: boolean;
  formData: FormGroup;
  process: Array<any> = [];
  turns: Array<any> = [];
  production: Array<OrderProduction> = [];
  productionSelected: Array<OrderProduction> = [];
  consolidatedProduction: Array<OrderProduction> = [];

  constructor(private appComponent: AppComponent,
    private formBuilder: FormBuilder,
    private msg: MensajesAplicacionService,
    private productionProcessService: Produccion_ProcesosService,
    private preInService: PreEntregaRollosService,
    private detailsPreInService: DtPreEntregaRollosService,
    private processService: ProcesosService,
    private turnService: TurnosService,) {

    this.modoSeleccionado = appComponent.temaSeleccionado;
    this.formData = this.formBuilder.group({
      orderProduction: [null],
      process: [null, Validators.required],
      dates: [null, Validators.required],
      turn: [null, Validators.required],
      observation: [null],
    });
  }

  ngOnInit() {
    this.readStorage();
    this.getProcess();
    this.getTurns();
  }

  readStorage() {
    this.storage_Id = this.appComponent.storage_Id;
    this.ValidarRol = this.appComponent.storage_Rol;
  }

  errorMessage(message: string, error: HttpErrorResponse) {
    this.load = false;
    this.msg.mensajeError(message, `Error: ${error.statusText} | Status: ${error.status}`);
  }

  formatNumbers = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  clearFields() {
    this.load = false;
    this.formData.reset();
    this.production = [];
    this.productionSelected = [];
    this.consolidatedProduction = [];
  }

  getTurns() {
    this.turnService.srvObtenerLista().subscribe(data => this.turns = data.filter(x => ['DIA', 'NOCHE'].includes(x.turno_Id)));
  }

  getProcess() {
    this.processService.srvObtenerLista().subscribe(data => {
      this.process = data.filter(x => ['EXT', 'EMP', 'SELLA'].includes(x.proceso_Id));
      this.formData.patchValue({ process: this.validateProcess() });
    });
  }

  validateProcess(): 'EMP' | 'SELLA' | 'EXT' {
    let process = {
      '87': 'EMP',
      '86': 'SELLA',
      '85': 'EXT',
    }
    return process[(this.ValidarRol).toString()];
  }

  validateSearch() {
    if (this.formData.value.process != null) {
      if (this.formData.value.dates != null && this.formData.value.dates.length == 2) {
        if (this.formData.value.turn != null) this.searchDataOrderProduction();
        else this.msg.mensajeAdvertencia(`¡Debe seleccionar un turno!`);
      } else this.msg.mensajeAdvertencia(`¡Debes seleccionar un rango de fechas!`);
    } else this.msg.mensajeAdvertencia(`¡Debe seleccionar un proceso!`);
  }

  searchDataOrderProduction() {
    this.load = true;
    this.production = [];
    let process: string = this.formData.value.process;
    let turn: string = this.formData.value.turn;
    let start: any = moment(this.formData.value.dates[0]).format('YYYY-MM-DD');
    let end: any = moment(this.formData.value.dates[1]).format('YYYY-MM-DD');
    this.productionProcessService.GetInformationAboutProductionByOrderProduction_Process(process, turn, start, end).subscribe(data => {
      this.production = data.filter(x => !this.productionSelected.map(y => y.numberProduction).includes(x.numberProduction));
    }, error => this.errorMessage(`¡Error al consultar la producción!`, error), () => this.load = false);
  }

  selectedProduction(production: OrderProduction) {
    this.load = true;
    let index = this.production.findIndex(x => x.numberProduction == production.numberProduction);
    this.production.splice(index, 1);
    this.getConsolidateProduction();
    setTimeout(() => this.load = false, 5);
  }

  deselectedProduction(production: OrderProduction) {
    this.load = true;
    let index = this.productionSelected.findIndex(x => x.numberProduction == production.numberProduction);
    this.productionSelected.splice(index, 1);
    this.getConsolidateProduction();
    setTimeout(() => this.load = false, 5);
  }

  selectedAllProduction() {
    this.load = true;
    this.productionSelected = this.productionSelected.concat(this.production);
    this.production = [];
    this.getConsolidateProduction();
    setTimeout(() => this.load = false, 5);
  }

  deselectedAllProduction() {
    this.load = true;
    this.production = this.production.concat(this.productionSelected);
    this.productionSelected = [];
    this.getConsolidateProduction();
    setTimeout(() => this.load = false, 5);
  }

  getConsolidateProduction() {
    this.consolidatedProduction = this.productionSelected.reduce((a, b) => {
      if (!a.map(x => x.orderProduction).includes(b.orderProduction)) a = [...a, b];
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
    if (this.formData.valid) {
      if (this.productionSelected.length > 0) this.savePreIn();
      else this.msg.mensajeAdvertencia(`¡No ha seleccionado ningún rollo!`);
    } else this.msg.mensajeAdvertencia(`¡Debe seleccionar el proceso!`);
  }

  savePreIn() {
    this.load = true;
    let observation: string = this.formData.value.observation;
    const data: modelPreentregaRollos = {
      PreEntRollo_Fecha: moment().format('YYYY-MM-DD'),
      PreEntRollo_Observacion: ![null, undefined].includes(observation) ? observation.toUpperCase() : '',
      Usua_Id: this.storage_Id,
      PreEntRollo_Hora: moment().format('H:mm:ss'),
    }
    this.preInService.srvGuardar(data).subscribe(data => this.saveDetailsPreIn(data.preEntRollo_Id), error => this.errorMessage(`¡Ocurrió un error al crear el Pre Ingreso!`, error));
  }

  saveDetailsPreIn(idPreIn: number) {
    let count: number = 0;
    this.productionSelected.forEach(pp => {
      const data: modelDtPreEntregaRollos = {
        PreEntRollo_Id: idPreIn,
        Rollo_Id: pp.numberProduction,
        DtlPreEntRollo_Cantidad: pp.quantity,
        UndMed_Rollo: pp.presentation,
        Proceso_Id: pp.process,
        Cli_Id: 1,
        DtlPreEntRollo_OT: pp.orderProduction,
        Prod_Id: pp.item,
        UndMed_Producto: pp.presentation,
      }
      this.detailsPreInService.srvGuardar(data).subscribe(() => {
        count++;
        if (count == this.productionSelected.length) this.PutDelivered_NoAvaible(idPreIn);
      }, error => this.errorMessage(`¡Ocurrió un error al crear los detalles del Pre Ingreso!`, error));
    });
  }

  PutDelivered_NoAvaible(idPreIn: number) {
    this.productionProcessService.PutDelivered_NoAvaible(idPreIn).subscribe(() => {
      this.msg.mensajeConfirmacion(`¡Pre Ingreso creado correctamente!`);
      this.createPDF(idPreIn);
    }, error => this.errorMessage(`¡Ocurrió un error al cambiar el estado de los rollos/bultos!`, error));
  }

  createPDF(idPreIn: number) {
    this.detailsPreInService.GetInformactionAboutPreIn_ById(idPreIn).subscribe(data => {
      this.load = true;
      let title: string = `Entrega Producción N° ${idPreIn}`;
      let content: any[] = this.contentPDF(data, title, idPreIn);
      const pdfDefinicion: any = {
        info: { title: title },
        pageOrientation: 'portrait',
        pageSize: 'LETTER',
        watermark: { text: 'PLASTICARIBE SAS', color: 'red', opacity: 0.02, bold: true, italics: false },
        pageMargins: [25, 25, 25, 25],
        footer: this.footerPDF(),
        content: content,
      }
      pdfMake.createPdf(pdfDefinicion).open();
      setTimeout(() => this.clearFields(), 3000);
    }, error => this.errorMessage(`¡Se guardó la información del Pre Ingreso pero no se puedo crear el PDF!`, error));
  }

  contentPDF(data: any, title: string, idPreIn: number): Array<any> {
    let content: Array<any> = [];
    let consolidatedInformation: Array<any> = this.consolidatedInformation(data);
    let count: number = 0;
    consolidatedInformation.forEach(prod => {
      let informationProducts: Array<any> = this.getInformationProducts(data, prod.Item);
      content.push(this.headerPDF_Barcode(title, idPreIn, prod.Item, count == 0));
      content.push(this.tableInformationPreIn(data[0]));
      content.push(this.tableConsolidated(consolidatedInformation.filter(x => x.Item == prod.Item)));
      content.push(this.tableProducts(informationProducts));
      count++;
    });
    return content;
  }

  consolidatedInformation(data: any): Array<any> {
    let consolidatedInformation: Array<any> = [];
    let count: number = 0;
    data.forEach(prod => {
      if (!consolidatedInformation.map(x => x.Item).includes(prod.details.item)) {
        count++;
        let cuontProduction: number = data.filter(x => x.details.item == prod.details.item).length;
        let totalQuantity: number = 0;
        data.filter(x => x.details.item == prod.details.item).forEach(x => totalQuantity += x.details.quantity);
        consolidatedInformation.push({
          "#": count,
          "OT": prod.details.orderProduction,
          "Item": prod.details.item,
          "Referencia": prod.details.reference,
          "Cant. Rollos": this.formatNumbers((cuontProduction)),
          "Cantidad": this.formatNumbers((totalQuantity).toFixed(2)),
          "Presentación": prod.details.presentation
        });
      }
    });
    return consolidatedInformation;
  }

  getInformationProducts(data: any, item: number): Array<any> {
    let informationProducts: Array<any> = [];
    let count: number = 0;
    data.filter(pp => pp.details.item == item).forEach(prod => {
      count++;
      informationProducts.push({
        "#": count,
        "OT": prod.details.orderProduction,
        "Rollo": prod.details.production,
        "Item": prod.details.item,
        "Referencia": prod.details.reference,
        "Cantidad": this.formatNumbers((prod.details.quantity).toFixed(2)),
        "Presentación": prod.details.presentation,
      });
    });
    return informationProducts;
  }

  headerPDF_Barcode(title: string, pre_Id: number, item: number, pageBreak: boolean) {
    return [
      {
        pageBreak: (!pageBreak) ? 'before' : '',
        table: {
          widths: ['*'],
          margin: [0, -150, 0, 0],
          body: [
            [
              {
                columns: [
                  this.fillImageBussinessPDF(),
                  this.titlePDfBarCode(title),
                  this.createBarCode(pre_Id, item)
                ]
              }
            ]
          ]
        },
        fontSize: 9,
        layout: { defaultBorder: false }
      },
      this.lineHeaderFooter(),
    ];
  }

  fillImageBussinessPDF() {
    return {
      width: '25%',
      alignment: 'center',
      table: {
        body: [
          [{ image: logoParaPdf, width: 150, height: 25 }],
        ]
      },
      layout: 'noBorders',
      margin: [5, 10, 80, 10]
    }
  }

  titlePDfBarCode(titulo: string): {} {
    return {
      width: '40%',
      alignment: 'center',
      table: {
        body: [
          [{ text: titulo, bold: true, alignment: 'center', fontSize: 10 }],
        ]
      },
      layout: 'noBorders',
      margin: [70, 15, 0, 10],
    }
  }

  createBarCode(pre_Id: number, item: number) {
    const imageBarcode = document.createElement('img');
    imageBarcode.id = 'barcode';
    document.body.appendChild(imageBarcode);
    JsBarcode("#barcode", `ENTRLL#${pre_Id}-ITEM#${item}`, { format: "CODE128A", displayValue: false, width: 80, height: 200 });
    let imagePDF = { image: imageBarcode.src, width: 160, height: 50, alignment: 'center' };
    imageBarcode.remove();
    return [imagePDF];
  }

  lineHeaderFooter(): {} {
    return {
      margin: [0, 0],
      table: {
        headerRows: 1,
        widths: ['*'],
        body: [
          [{ border: [false, true, false, false], text: '' }],
        ]
      },
      layout: { defaultBorder: false, }
    }
  }

  tableInformationPreIn(data: any): {} {
    return {
      margin: [0, 10],
      table: {
        widths: ['50%', '20%', '30%'],
        body: [
          [
            { text: `Información General Entrega`, colSpan: 3, alignment: 'center', fontSize: 10, bold: true }, {}, {}
          ],
          [
            { text: `Nombre: ${data.pre.user_Name}`, colSpan: 2 },
            {},
            { text: `Fecha: ${data.pre.date}` }
          ],
          [
            { text: `Observación: ${(data.pre.observation).toUpperCase()}`, colSpan: 3 }, {}, {}
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
    let columns: Array<string> = ['#', 'OT', 'Item', 'Referencia', 'Cant. Rollos', 'Cantidad', 'Presentación'];
    let widths: Array<string> = ['8%', '10%', '10%', '40%', '10%', '12%', '10%'];
    return {
      margin: [0, 10],
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
    let columns: Array<string> = ['#', 'OT', 'Rollo', 'Item', 'Referencia', 'Cantidad', 'Presentación'];
    let widths: Array<string> = ['8%', '10%', '10%', '10%', '40%', '12%', '10%'];
    return {
      margin: [0, 10],
      table: {
        headerRows: 2,
        widths: widths,
        body: this.buildTableBody(data, columns, 'Rollos Seleccionados'),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex == 0 || rowIndex == 1) ? '#DDDDDD' : null;
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
      columns.forEach((column) => dataRow.push(row[column].toString()));
      body.push(dataRow);
    });
    return body;
  }

  footerPDF() {
    return function (currentPage: any, pageCount: any) {
      return [
        {
          columns: [
            { text: `Fecha Expedición Documento ${moment().format('YYYY-MM-DD')} - ${moment().format('HH:mm:ss')}`, alignment: 'left', fontSize: 8, margin: [30, 0, 0, 0] },
            { text: `${currentPage.toString()} de ${pageCount}`, alignment: 'right', fontSize: 8, margin: [0, 0, 30, 0] },
          ]
        }
      ]
    }
  }
}

interface OrderProduction {
  orderProduction: number;
  item: number;
  reference: string;
  numberProduction?: number;
  quantity: number;
  cuontProduction?: number;
  presentation: string;
  date: any;
  process: string;
}
