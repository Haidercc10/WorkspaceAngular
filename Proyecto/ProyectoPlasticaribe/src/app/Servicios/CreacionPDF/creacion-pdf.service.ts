import { Inject, Injectable } from '@angular/core';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import JsBarcode from 'jsbarcode';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { EncriptacionService } from '../Encriptacion/Encriptacion.service';
import { ReImpresionEtiquetasService, ReImpresionEtiquetas } from '../ReImpresionEtiquetas/ReImpresionEtiquetas.service';
import { referenceWike } from './referenciaWiketiado';
import { UtileriaService } from '../Utileria/utileria.service';

@Injectable({
  providedIn: 'root'
})

export class CreacionPdfService {

  title : any;

  constructor(private rePrintService: ReImpresionEtiquetasService,
    @Inject(SESSION_STORAGE) private storage: WebStorageService,
    private encriptacion: EncriptacionService,
    private utileria: UtileriaService) { }

  formatoPDF(titulo: string, content: any, headerAdicional: any = {}) {
    this.title = titulo; 
    let today: any = moment().format('YYYY-MM-DD');
    let hour: any = moment().format('HH:mm:ss');
    const pdfDefinicion: any = {
      info: { title: titulo },
      pageOrientation: 'portrait',
      pageSize: 'LETTER',
      watermark: { text: 'PLASTICARIBE SAS', color: 'red', opacity: 0.02, bold: true, italics: false },
      pageMargins: [25, 120, 25, 35],
      header: this.headerPDF(today, hour, titulo, headerAdicional),
      content: content,
    }
    setTimeout(() => this.crearPDF(pdfDefinicion), 3000);
  }

  private headerPDF(today: any, hour: any, titulo: string, headerAdicional: any): {} {
    return (currentPage: any, pageCount: any) => {
      return [
        {
          margin: [20, 8, 20, 0],
          columns: [
            { image: logoParaPdf, width: 150, height: 30, margin: [20, 25, 80, 10] },
            this.title == null ? null : this.empresaFechaHoraTituloPDF(titulo, today, hour),
            this.title == null ? null : this.paginadoFechaHoraPDF(currentPage, pageCount, today, hour)
          ]
        },
        this.lineaHeaderFooterPDF([false, true, false, false]),
        headerAdicional,
      ];
    }
  }

  private empresaFechaHoraTituloPDF(titulo: string, today: any, hour: any): {} {
    return {
      width: '*',
      alignment: 'center',
      table: {
        body: [
          [{ text: 'NIT. 800188732', bold: true, alignment: 'center', fontSize: 10 }],
          [{ text: titulo, bold: true, alignment: 'center', fontSize: 10 }],
        ]
      },
      layout: 'noBorders',
      margin: [80, 20, 0, 10],
    }
  }

  private paginadoFechaHoraPDF(currentPage: { toString: () => string; }, pageCount: string, today: any, hour: any): {} {
    return {
      width: '*',
      alignment: 'center',
      margin: [100, 20, 20, 0],
      table: {
        body: [
          [{ text: `Página: `, alignment: 'left', fontSize: 8, bold: true }, { text: `${currentPage.toString() + ' de ' + pageCount}`, alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
          [{ text: `Fecha: `, alignment: 'left', fontSize: 8, bold: true }, { text: today, alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
          [{ text: `Hora: `, alignment: 'left', fontSize: 8, bold: true }, { text: hour, alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
        ]
      },
      layout: 'noBorders',
    }
  }

  private lineaHeaderFooterPDF(borders: boolean[]): {} {
    return {
      margin: [25, 0],
      table: {
        headerRows: 1,
        widths: ['*'],
        body: [
          [{ border: borders, text: '' }],
        ]
      },
      layout: { defaultBorder: false, }
    }
  }

  private crearPDF(pdfDefinicion: TDocumentDefinitions) {
    pdfMake.createPdf(pdfDefinicion).open();
  }

  /* ============================================================== CREATE TAG PRODUCTION ===================================================================== */
  createTagProduction(dataTag: modelTagProduction) {
    let code: number = dataTag.reel;
    const pdfDefinition: any = {
      pageOrientation: 'landscape',
      info: { title: `Etiqueta ${code}` },
      pageSize: { width: 188.97640176, height: 377.95280352 },
      pageMargins: [10, 10, 10, 20],
      footer: this.footerPDF(dataTag.productionProcess, dataTag.operator),
      content: this.contentPDF(dataTag),
    }
    let windoeFeatures = `height=500,width=500`;
    let win = window.open('', 'Print', windoeFeatures);
    pdfMake.createPdf(pdfDefinition).print({}, win);
    if (dataTag.copy) this.createRePrint(dataTag);
    setTimeout(() => win.close(), 8000);
  }

  private contentPDF(dataTag: modelTagProduction) {
    return [
      {
        table: {
          widths: ['25%', '25%', '50%'],
          body: this.contentPrincipalTablePDF(dataTag)
        },
      }
    ]
  }

  private contentPrincipalTablePDF(dataTag: modelTagProduction): any[] {
    let content = [];
    if (dataTag.showNameBussiness) content.push(this.infoBussinessPDF(dataTag));
    content.push(this.adictionalInformationTag(dataTag));
    content.push(
      this.infoClient(dataTag),
      this.infoProduct(dataTag),
      this.dataOrderProduction(dataTag),
      this.materiaOrderProduction(dataTag),
      this.quantityAndBarcode(dataTag),
      this.adictionalInformation(dataTag.reel),
    );
    return content;
  }

  private infoBussinessPDF(dataTag: modelTagProduction): any[] {
    return [
      { text: `PLASTICARIBE S.A.S`, bold: true, fontSize: 10, alignment: 'center', colSpan: 2 },
      {},
      { text: `CALLE 42 #52-105 Barranquilla`, bold: true, fontSize: 10, alignment: 'center' }
    ];
  }

  private adictionalInformationTag(dataTag: modelTagProduction): any[] {
    return [
      { text: `APTO PARA EL CONTACTO CON ALIMENTOS`, bold: true, fontSize: 10, alignment: 'center', colSpan: 3 },
      {},
      {}
    ];
  }

  private infoClient(dataTag: modelTagProduction): any[] {
    let nameClient: string = (dataTag.client).toUpperCase();
    let size: number = nameClient.length > 40 ? 10 : 12;
    return [
      { text: `Cliente: ${(dataTag.client).toUpperCase()}`, bold: true, fontSize: size, alignment: 'left', colSpan: 3 },
      {},
      {}
    ];
  }

  private infoProduct(dataTag: modelTagProduction): any[] {
    let reference: string = (dataTag.reference).toUpperCase();
    let size: number = reference.length > 30 ? 9 : 12;
    return [
      { text: `Item: ${(dataTag.item)}`, bold: true, fontSize: 12, alignment: 'left' },
      { text: `REF: ${(dataTag.reference).toUpperCase()}`, bold: true, fontSize: size, alignment: 'left', colSpan: 2 },
      {},
    ];
  }

  private dataOrderProduction(dataTag: modelTagProduction): any[] {
    let infoTag: string = `${this.utileria.formatoNumeros((dataTag.width).toFixed(2))} ${this.utileria.formatoNumeros((dataTag.bellows).toFixed(2))} ${this.utileria.formatoNumeros((dataTag.height).toFixed(2))} ${dataTag.und}  CAL: ${this.utileria.formatoNumeros((dataTag.cal).toFixed(2))}   Material: ${dataTag.material}`;
    if (dataTag.productionProcess == 'SELLADO') infoTag = `${dataTag.dataTagForClient}      Material: ${dataTag.material}`;
    return [
      {
        colSpan: 3,
        table: {
          widths: ['auto', '*', 'auto', 'auto'],
          body: [
            [
              { text: `OT: ${dataTag.orderProduction}`, bold: true, fontSize: 10, alignment: 'center', colSpan: dataTag.showDataTagForClient ? 4 : 1 },
              !dataTag.showDataTagForClient ? {
                text: infoTag,
                bold: true,
                fontSize: 9,
                alignment: 'center',
                colSpan: 3,
              } : {},
              {},
              {},
            ]
          ]
        },
        layout: 'noBorders'
      },
      {},
      {},
    ];
  }

  private materiaOrderProduction(dataTag: modelTagProduction): any[] {
    return [
      { text: dataTag.presentationItem1, bold: true, fontSize: 10, alignment: 'center' },
      { text: dataTag.presentationItem2, bold: true, fontSize: 10, alignment: 'center' },
      { text: `Rollo: ${dataTag.reel}${!dataTag.copy ? '' : '.'}`, bold: true, fontSize: 10, alignment: 'center' },
    ];
  }

  private quantityAndBarcode(dataTag: modelTagProduction) {
    let data = [];
    data.push(this.tableWithQuantity(dataTag.quantity));
    data.push(this.tableWithQuantity(dataTag.quantity2));
    data.push(this.createBarcode(dataTag.reel));
    return data;
  }

  private tableWithQuantity(quantity: number) {
    let size: number = quantity > 999 ? 18 : quantity > 9999 ? 14 : 24;
    return { text: `${this.utileria.formatoNumeros((quantity).toFixed(2))}`, bold: true, fontSize: size, alignment: 'center' };
  }

  private createBarcode(code: number) {
    const imageBarcode = document.createElement('img');
    imageBarcode.id = 'barcode';
    document.body.appendChild(imageBarcode);
    JsBarcode("#barcode", code.toString(), { format: "CODE128A", displayValue: false, width: 5, height: 100 });
    let imagePDF = { image: imageBarcode.src, width: 160, height: 40 };
    imageBarcode.remove();
    return imagePDF;
  }

  private adictionalInformation(code: number) {
    return [
      { text: ``, bold: true, fontSize: 10, alignment: 'center', border: [false, false, false, false] },
      { text: ``, bold: true, fontSize: 10, alignment: 'center', border: [false, false, false, false] },
      { text: ``, bold: true, fontSize: 10, alignment: 'center', border: [false, false, false, false] },
    ];
  }

  private footerPDF(productionProcess: 'EXTRUSION' | 'IMPRESION' | 'ROTOGRABADO' | 'LAMIMADO' | 'DOBLADO' | 'CORTE' | 'EMPAQUE' | 'SELLADO' | 'WIKETIADO', operator?: any) {
    let width: number = productionProcess == 'SELLADO' || productionProcess == 'WIKETIADO' ? operator.length > 30 ? 170 : operator.length >= 20 && operator.length < 30 ? 130 : 100 : 0;
    let operative: string = productionProcess == 'SELLADO' || productionProcess == 'WIKETIADO' ? `${operator}` : '';
    return {
      columns: [
        { text: `${moment().format('YYYY-MM-DD')} - ${moment().format('H:mm:ss')}`, alignment: 'center', fontSize: 8, },
        { text: operative, alignment: 'center', fontSize: 8, width: width, },
        { text: productionProcess, alignment: 'center', fontSize: 8 },
      ]
    }
  }

  createRePrint(dataTag: modelTagProduction) {
    if (dataTag.copy) {
      let data: ReImpresionEtiquetas = {
        Orden_Trabajo: parseInt(dataTag.orderProduction),
        NumeroRollo_BagPro: dataTag.reel,
        Proceso_Id: this.validateProcess(dataTag.productionProcess),
        Fecha: moment().format('YYYY-MM-DD'),
        Hora: moment().format('HH:mm:ss'),
        Usua_Id: this.encriptacion.decrypt(this.storage.get('Id') == undefined ? '' : this.storage.get('Id')),
      }
      this.rePrintService.insert(data).subscribe(null, error => console.log(error));
    }
  }

  validateProcess(proceso: string): 'EXT' | 'IMP' | 'ROT' | 'LAM' | 'DBLD' | 'CORTE' | 'EMP' {
    const processMapping = {
      'EXTRUSION': 'EXT',
      'IMPRESION': 'IMP',
      'ROTOGRABADO': 'ROT',
      'LAMINADO': 'LAM',
      'DOBLADO': 'DBLD',
      'CORTE': 'CORTE',
      'EMPAQUE': 'EMP',
      'SELLADO': 'SELLA',
      'WIKETIADO': 'WIKE'
    };
    return processMapping[proceso] || proceso;
  }

  /* ======================================================== PDF para precargues ==================================================== */

  contentPDFPrecargue(data): any[] {
    let content: any[] = [];
    let consolidatedInformation: Array<any> = this.getInfoGroupedPDF(data);
    let informationProducts: Array<any> = this.getInfoDetailsPDF(data);
    content.push(this.infoMovementPDF(data[0]));
    content.push(this.tablaGroupedPDF(consolidatedInformation));
    content.push(this.tableTotals(consolidatedInformation))
    content.push(this.tablaDetailsPDF(informationProducts));
    return content;
  }

  getInfoGroupedPDF(data: any): Array<any> {
    let info: Array<any> = [];
    let contador: number = 0;
    data.forEach(d => {
      if (!info.map(x => x.Item).includes(d.item)) {
        contador++;
        let cantRegistros: number = data.filter(x => x.item == d.item).length;
        let quantity: number = 0;
        let weight: number = 0;
        data.filter(x => x.item == d.item).forEach(x => {
          weight += x.weight,
            quantity += x.quantity
        });

        info.push({
          "#": contador,
          "Item": d.item,
          "Referencia": d.reference,
          "Rollos": cantRegistros,
          "Peso": weight.toFixed(2),
          "Cantidad": quantity.toFixed(2),
          "Und": d.presentation,
        });
      }
    });
    return info;
  }

  getInfoDetailsPDF(data: any): Array<any> {
    let info: Array<any> = [];
    let count: number = 0;

    data.forEach(d => {
      count++;
      info.push({
        "#": count,
        "Rollo": d.roll,
        "OT": d.ot,
        "Item": d.item,
        "Referencia": d.reference,
        "Peso": d.weight,
        "Cantidad": d.quantity,
        "Und": d.presentation,
      });
    });
    return info;
  }

  //Función que muestra una tabla con la información general del ingreso.
  infoMovementPDF(data: any): {} {
    let date1: any = data.date1.replace('T00:00:00', '');
    let date2: any = data.date2.replace('T00:00:00', '');
    return {
      margin: [0, 0, 0, 20],
      table: {
        widths: ['34%', '33%', '33%'],
        body: [
          [
            { text: `Información general del movimiento`, colSpan: 3, alignment: 'center', fontSize: 10, bold: true }, {}, {}
          ],
          [
            { text: `Orden Fact.: ${data.of == 4472 ? '' : data.of}` },
            { text: `Usuario ingreso: ${data.user1}` },
            { text: `Fecha ingreso: ${data.date1.replace('T00:00:00', '')} ${data.hour1}` },
          ],
          [
            { text: `CC/NIT: ${data.idClient}`},
            { text: `Cliente: ${data.client.toUpperCase()}`, colSpan: 2},{}
          ],
          [
            { text: `Estado: ${data.status}` },
            { text: `Usuario Modifica: ${data.user2 == 0 ? '' : data.user2}` },
            { text: `Fecha Modifica: ${date1 == date2 ? '' : date2} ${data.hour1 == data.hour2 ? '' : data.hour2}` },
          ],
          [
            { text: `Observación Precargue: ${data.observation1 == null ? '' : data.observation1}`, colSpan: 3, fontSize: 9, }, {}, {}
          ],
          [
            { text: `Observación Orden Fact.: ${data.observation2 == null ? '' : data.observation2}`, colSpan: 3, fontSize: 9, }, {}, {}
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

  //Función que consolida la información por mat. primas
  tablaGroupedPDF(data) {
    let columns: Array<string> = ['#', 'Item', 'Referencia', 'Rollos', 'Peso', 'Cantidad', 'Und'];
    let widths: Array<string> = ['5%', '10%', '45%', '10%', '10%', '10%', '10%'];
    return {
      table: {
        headerRows: 2,
        widths: widths,
        body: this.buildTableBody1(data, columns, 'Consolidado de rollos precargados por item'),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex <= 1) ? '#DDDDDD' : null;
        }
      }
    };
  }

  //Tabla con materiales recuperados ingresados detallados
  tablaDetailsPDF(data) {
    let columns: Array<string> = ['#', 'Rollo', 'OT', 'Item', 'Referencia', 'Peso', 'Cantidad', 'Und'];
    let widths: Array<string> = ['5%', '9%', '8%', '8%', '45%', '8%', '10%', '7%'];
    return {
      margin: [0, 20],
      table: {
        headerRows: 2,
        widths: widths,
        body: this.buildTableBody2(data, columns, 'Información detallada de rollos precargados'),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex <= 1) ? '#DDDDDD' : null;
        }
      }
    };
  }

  //Tabla con los valores totales de pesos y registros
  tableTotals(data: any) {
    return {
      fontSize: 8,
      bold: false,
      table: {
        widths: ['5%', '10%', '45%', '10%', '10%', '10%', '10%'],
        body: [
          [
            { text: ``, bold: true, border: [true, false, false, true], },
            { text: ``, bold: true, border: [false, false, false, true], },
            { text: `Totales`, alignment: 'right', bold: true, border: [false, false, true, true], },
            { text: `${this.utileria.formatoNumeros((data.reduce((a, b) => a += parseInt(b.Rollos), 0)))}`, bold: true, border: [false, false, true, true], },
            { text: `${this.utileria.formatoNumeros((data.reduce((a, b) => a += parseFloat(b.Peso), 0)).toFixed(2))}`, bold: true, border: [false, false, true, true], },
            { text: `${this.utileria.formatoNumeros((data.reduce((a, b) => a += parseFloat(b.Cantidad), 0)).toFixed(2))}`, bold: true, border: [false, false, true, true], },
            { text: ``, bold: true, border: [false, false, true, true], },
          ],
        ],
      }
    }
  }

  buildTableBody1(data, columns, title) {
    var body: any = [];
    body.push([{ colSpan: 7, text: title, bold: true, alignment: 'center', fontSize: 10 }, '', '', '', '', '', '']);
    body.push(columns);
    data.forEach(function (row) {
      var dataRow: any = [];
      columns.forEach((column) => dataRow.push(row[column].toString()));
      body.push(dataRow);
    });
    return body;
  }

  buildTableBody2(data, columns, title) {
    var body: any = [];
    body.push([{ colSpan: 8, text: title, bold: true, alignment: 'center', fontSize: 10 }, '', '', '', '', '', '', '',]);
    body.push(columns);
    data.forEach(function (row) {
      var dataRow: any = [];
      columns.forEach((column) => dataRow.push(row[column].toString()));
      body.push(dataRow);
    });
    return body;
  }
  /* ================================================= FIN PDF PARA PRECARGUES ===================================================== */
}

@Injectable({
  providedIn: 'root'
})

export class TagProduction_2 {

  constructor(private rePrintService: ReImpresionEtiquetasService,
    @Inject(SESSION_STORAGE) private storage: WebStorageService,
    private encriptacion: EncriptacionService,) { }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  private formatNumbers = (number: string) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  createTagProduction(dataTag: modelTagProduction) {
    let code: number = dataTag.reel;
    const pdfDefinition: any = {
      pageOrientation: 'portrait',
      info: { title: `Etiqueta ${code}` },
      pageSize: { width: 377.95280352, height: 188.97640176 },
      pageMargins: [10, 10, 10, 10],
      content: this.contentPDF(dataTag),
    }
    pdfMake.createPdf(pdfDefinition).open();
    // let windoeFeatures = `height=500,width=500`;
    // let win = window.open('', 'Print', windoeFeatures);
    // pdfMake.createPdf(pdfDefinition).print({}, win);
    // if (dataTag.copy) this.createRePrint(dataTag);
    // setTimeout(() => win.close(), 8000);
  }

  private contentPDF(dataTag: modelTagProduction) {
    return [
      {
        table: {
          widths: ['50%', '50%'],
          body: this.contentPrincipalTablePDF(dataTag)
        },
      }
    ]
  }

  private contentPrincipalTablePDF(dataTag: modelTagProduction): any[] {
    let content = [];
    if (dataTag.showNameBussiness) content.push(this.dataBussiness());
    content.push(
      this.adictionalInformationTag(),
      this.infoClient(dataTag),
      this.dataOrderAndItem(dataTag),
      this.nameReference(dataTag),
      this.nameMaterial(dataTag),
      this.createBarcode(dataTag),
      this.quantity(dataTag),
      this.presentationsTag(dataTag),
      this.processAndDate(dataTag),
      this.opertaros(dataTag),
    );

    return content;
  }

  private dataBussiness(): any[] {
    return [
      {
        colSpan: 2,
        margin: [0, 0],
        table: {
          widths: ['100%'],
          body: [
            [{ border: [false, false, false, false], bold: true, alignment: 'center', fontSize: 15, text: 'PLASTICARIBE S.A.S' }],
            [{ border: [false, false, false, false], alignment: 'center', fontSize: 8, margin: [0, -3, 0, 0], text: 'CALLE 42 #52-105 BARRANQUILLA' }]
          ]
        }
      },
      {}
    ];
  }

  private adictionalInformationTag(): any[] {
    return [
      { text: `APTO PARA EL CONTACTO CON ALIMENTOS`, bold: true, fontSize: 8, alignment: 'center', colSpan: 2, margin: [-10, 0] },
      {}
    ];
  }

  private infoClient(dataTag: modelTagProduction): any[] {
    return [
      {
        colSpan: 2,
        margin: [0, 0],
        columns: [
          { width: 'auto', text: 'CLI.:', bold: true, fontSize: 10, alignment: 'left' },
          { width: '*', text: (dataTag.client).toUpperCase(), fontSize: 10, alignment: 'left' },
        ]
      },
      {}
    ];
  }

  private dataOrderAndItem(dataTag: modelTagProduction): any[] {
    return [
      {
        margin: [-5, -3],
        colSpan: 2,
        table: {
          widths: ['45%', '55%'],
          margin: [0, 3],
          body: [
            [
              {
                border: [false, false, true, false],
                columns: [
                  { width: '30%', text: 'OT:', bold: true, fontSize: 12, alignment: 'left' },
                  { width: '70%', text: (dataTag.orderProduction), fontSize: 12, alignment: 'left' },
                ]
              },
              {
                border: [false, false, false, false],
                columns: [
                  { width: '40%', text: 'ITEM:', bold: true, fontSize: 12, alignment: 'left' },
                  { width: '60%', text: dataTag.item, fontSize: 12, alignment: 'left' },
                ]
              }
            ]
          ]
        }
      },
      {}
    ]
  }

  private nameReference(dataTag: modelTagProduction): any[] {
    return [
      {
        colSpan: 2,
        margin: [0, 0],
        columns: [
          { width: 'auto', text: 'REF.:', bold: true, fontSize: 10, alignment: 'left' },
          { width: '*', text: (dataTag.reference).toUpperCase(), fontSize: 10, alignment: 'left' },
        ]
      },
      {}
    ];
  }

  private nameMaterial(dataTag: modelTagProduction): any[] {
    return [
      {
        margin: [-5, -3],
        colSpan: 2,
        table: {
          widths: ['52%', '48%'],
          margin: [0, 3],
          body: [
            [
              {
                border: [false, false, true, false],
                columns: [
                  { width: 'auto', text: 'MAT:', bold: true, fontSize: 9, alignment: 'left' },
                  { width: 'auto', text: (dataTag.material).toUpperCase(), fontSize: 9, alignment: 'left' },
                ]
              },
              {
                border: [false, false, false, false],
                columns: [
                  { width: 'auto', text: 'BULTO:', bold: true, fontSize: 10, alignment: 'left' },
                  { width: 'auto', text: `${dataTag.reel}${!dataTag.copy ? '' : '.'}`, fontSize: 10, alignment: 'left' },
                ]
              }
            ]
          ]
        }
      },
      {}
    ]
  }

  private createBarcode(dataTag: modelTagProduction) {
    let size: number = this.sizeBarcode(dataTag);
    const imageBarcode = document.createElement('img');
    if (dataTag.productionProcess != 'WIKETIADO') {
      imageBarcode.id = 'barcode';
      document.body.appendChild(imageBarcode);
      JsBarcode("#barcode", (dataTag.reel).toString(), { format: "CODE128A", displayValue: false, width: 50, height: 150 });
      let imagePDF = { image: imageBarcode.src, width: 155, height: size, colSpan: 2, alignment: 'center', margin: [0, -1] };
      imageBarcode.remove();
      return [imagePDF, {}];
    } else {
      let imagePDF = { image: referenceWike, width: 170, height: size, colSpan: 2, alignment: 'center', margin: [0, -1] };
      return [imagePDF, {}];
    }
  }

  private sizeBarcode(dataTag: modelTagProduction): number {
    console.clear();
    let sizeClient: number = dataTag.client.length;
    let sizeReference: number = dataTag.reference.length;
    let size: number = 90;
    size += sizeClient < 50 ? sizeClient < 24 ? 30 : 10 : 0;
    size += sizeReference < 50 ? sizeReference < 24 ? 30 : 10 : 0;
    return size;
  }

  private quantity(dataTag: modelTagProduction) {
    let data = [];
    data.push(this.tableWithQuantity(dataTag.quantity));
    data.push(this.tableWithQuantity(dataTag.quantity2));
    return data;
  }

  private tableWithQuantity(quantity: number) {
    let roundedquantity = Math.round(quantity);
    let finalQuantity: string = quantity == roundedquantity ? `${roundedquantity}` : quantity.toFixed(2);
    let size: number = finalQuantity.length > 6 ? 18 : finalQuantity.length > 8 ? 20 : 22;
    return { text: `${this.formatNumbers((finalQuantity))}`, bold: true, fontSize: size, alignment: 'center', margin: [0, -1] };
  }

  private presentationsTag(dataTag: modelTagProduction): any[] {
    return [
      { text: dataTag.presentationItem1, bold: true, fontSize: 10, alignment: 'center' },
      { text: dataTag.presentationItem2, bold: true, fontSize: 10, alignment: 'center' },
    ];
  }

  private processAndDate(dataTag: modelTagProduction): Array<any> {
    return [
      { text: dataTag.productionProcess, alignment: 'center', fontSize: 8, bold: true },
      { text: `${moment().format('YYYY-MM-DD HH:mm:ss')}`, alignment: 'center', fontSize: 8 },
    ]
  }

  private opertaros(dataTag): Array<any> {
    return [
      { text: dataTag.operator, bold: true, colSpan: 2, alignment: 'center', fontSize: dataTag.operator.length > 28 ? 7 : 9, margin: [-5, 0] },
      {},
    ]
  }

  private createRePrint(dataTag: modelTagProduction) {
    if (dataTag.copy) {
      let data: ReImpresionEtiquetas = {
        Orden_Trabajo: parseInt(dataTag.orderProduction),
        NumeroRollo_BagPro: dataTag.reel,
        Proceso_Id: this.validateProcess(dataTag.productionProcess),
        Fecha: moment().format('YYYY-MM-DD'),
        Hora: moment().format('HH:mm:ss'),
        Usua_Id: this.encriptacion.decrypt(this.storage.get('Id') == undefined ? '' : this.storage.get('Id')),
      }
      this.rePrintService.insert(data).subscribe(null, error => console.log(error));
    }
  }

  validateProcess(proceso: string): 'EXT' | 'IMP' | 'ROT' | 'LAM' | 'DBLD' | 'CORTE' | 'EMP' | 'SELLA' | 'WIKE' {
    const processMapping = {
      'EXTRUSION': 'EXT',
      'IMPRESION': 'IMP',
      'ROTOGRABADO': 'ROT',
      'LAMINADO': 'LAM',
      'DOBLADO': 'DBLD',
      'CORTE': 'CORTE',
      'EMPAQUE': 'EMP',
      'SELLADO': 'SELLA',
      'WIKETIADO': 'WIKE'
    };
    return processMapping[proceso] || proceso;
  }
}

export interface modelTagProduction {
  client: string;
  item: number;
  reference: string;
  width: number;
  height: number;
  bellows: number;
  und: string;
  cal: number;
  orderProduction: string;
  material: string;
  quantity: number;
  quantity2: number;
  reel: number;
  presentationItem1: string;
  presentationItem2: string;
  productionProcess: 'EXTRUSION' | 'IMPRESION' | 'ROTOGRABADO' | 'LAMIMADO' | 'DOBLADO' | 'CORTE' | 'EMPAQUE' | 'SELLADO' | 'WIKETIADO';
  showNameBussiness?: boolean;
  operator?: string;
  copy?: boolean;
  dataTagForClient?: string;
  showDataTagForClient?: boolean;
}
