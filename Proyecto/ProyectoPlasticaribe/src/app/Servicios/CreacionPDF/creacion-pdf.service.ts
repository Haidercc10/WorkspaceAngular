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
    private util: UtileriaService
  ) { }

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
    setTimeout(() => this.crearPDF(pdfDefinicion), 2000);
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
    if (win){
      pdfMake.createPdf(pdfDefinition).print({}, win);
      if (dataTag.copy) this.createRePrint(dataTag);
      setTimeout(() => win.close(), 8000);
    }
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
    let content: any[] = [];
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
    let infoTag: string = `${this.util.formatoNumeros((dataTag.width).toFixed(2))} ${this.util.formatoNumeros((dataTag.bellows).toFixed(2))} ${this.util.formatoNumeros((dataTag.height).toFixed(2))} ${dataTag.und}  CAL: ${this.util.formatoNumeros((dataTag.cal).toFixed(2))}   Material: ${dataTag.material}`;
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
    let data: any[] = [];
    data.push(this.tableWithQuantity(dataTag.quantity));
    data.push(this.tableWithQuantity(dataTag.quantity2));
    data.push(this.createBarcode(dataTag.reel));
    return data;
  }

  private tableWithQuantity(quantity: number) {
    let size: number = quantity > 999 ? 18 : quantity > 9999 ? 14 : 24;
    return { text: `${this.util.formatoNumeros((quantity).toFixed(2))}`, bold: true, fontSize: size, alignment: 'center' };
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
      this.rePrintService.insert(data).subscribe({next: ()=> null, error: error => console.log(error)});
    }
  }

  // ===========================================================================================================================
  //                                               PDF PARA CREAR ORDEN DE PRECARGUES
  // ===========================================================================================================================

  contentPDFPrecargue(data): any[] {
    let content: any[] = [];
    let consolidatedInformation: Array<any> = this.getInfoGroupedPrecarguePDF(data);
    let informationProducts: Array<any> = this.getInfoDetailsPrecarguePDF(data);
    content.push(this.infoMovementPrecarguePDF(data[0]));
    content.push(this.tablaGroupedPrecarguePDF(consolidatedInformation));
    content.push(this.tableTotalsPrecarguePDF(consolidatedInformation))
    content.push(this.tablaDetailsPrecarguePDF(informationProducts));
    return content;
  }

  getInfoGroupedPrecarguePDF(data: any): Array<any> {
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

  getInfoDetailsPrecarguePDF(data: any): Array<any> {
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
  infoMovementPrecarguePDF(data: any): {} {
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
  tablaGroupedPrecarguePDF(data) {
    let columns: Array<string> = ['#', 'Item', 'Referencia', 'Rollos', 'Peso', 'Cantidad', 'Und'];
    let widths: Array<string> = ['5%', '10%', '45%', '10%', '10%', '10%', '10%'];
    return {
      table: {
        headerRows: 2,
        widths: widths,
        body: this.buildTableBodyPrecargue1(data, columns, 'Consolidado de rollos precargados por item'),
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
  tablaDetailsPrecarguePDF(data) {
    let columns: Array<string> = ['#', 'Rollo', 'OT', 'Item', 'Referencia', 'Peso', 'Cantidad', 'Und'];
    let widths: Array<string> = ['5%', '9%', '8%', '8%', '45%', '8%', '10%', '7%'];
    return {
      margin: [0, 20],
      table: {
        headerRows: 2,
        widths: widths,
        body: this.buildTableBodyPrecargue2(data, columns, 'Información detallada de rollos precargados'),
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
  tableTotalsPrecarguePDF(data: any) {
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
            { text: `${this.util.formatoNumeros((data.reduce((a, b) => a += parseInt(b.Rollos), 0)))}`, bold: true, border: [false, false, true, true], },
            { text: `${this.util.formatoNumeros((data.reduce((a, b) => a += parseFloat(b.Peso), 0)).toFixed(2))}`, bold: true, border: [false, false, true, true], },
            { text: `${this.util.formatoNumeros((data.reduce((a, b) => a += parseFloat(b.Cantidad), 0)).toFixed(2))}`, bold: true, border: [false, false, true, true], },
            { text: ``, bold: true, border: [false, false, true, true], },
          ],
        ],
      }
    }
  }

  buildTableBodyPrecargue1(data, columns, title) {
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

  buildTableBodyPrecargue2(data, columns, title) {
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

  // ==============================================================================================================================
  //                                             PDF PARA ORDEN DE FACTURACION NO DIRECTA
  // ==============================================================================================================================

  NoDirectOFContent_PDF(data): any[] {
    let content: any[] = [];
    let consolidatedInformation: Array<any> = this.consolidatedInformationOF_NoDirecta(data);
    let informationProducts: Array<any> = this.getInformationProductsOF_NoDirecta(data);

    content.push(this.informationClientOF(data[0]));
    content.push(this.observationOF(data[0]));
    content.push(this.tableConsolidatedOF(consolidatedInformation));
    content.push(this.tableTotalsOF_NoDirecta(data))
    content.push(this.tableProductsOF(informationProducts));
    return content;
  }

  consolidatedInformationOF_NoDirecta(data: any): Array<any> {
    let consolidatedInformation: Array<any> = [];
    let count: number = 0;
    data.forEach(prod => {
      if (!consolidatedInformation.map(x => x.Item).includes(prod.producto.prod_Id)) {
        count++;
        let cuontProduction: number = data.filter(x => x.producto.prod_Id == prod.producto.prod_Id).length;
        let totalQuantity: number = 0;
        let totalWeight: number = 0;
        let totalNetWeight: number = 0;
        data.filter(x => x.producto.prod_Id == prod.producto.prod_Id).forEach(x => {
          totalQuantity += x.dtOrder.cantidad,
            totalWeight += x.weight,
            totalNetWeight += x.netWeight
        });
        consolidatedInformation.push({
          "#": count,
          "Pedido": prod.dtOrder.consecutivo_Pedido,
          "Item": prod.producto.prod_Id,
          "Referencia": prod.producto.prod_Nombre,
          "Rollos": this.util.formatoNumeros((cuontProduction)),
          "Peso B.": this.util.formatoNumeros((totalWeight).toFixed(2)),
          "Peso_Bruto": this.util.formatoNumeros((totalWeight).toFixed(2)),
          "Peso N.": this.util.formatoNumeros((totalNetWeight).toFixed(2)),
          "Peso_Neto": this.util.formatoNumeros((totalNetWeight).toFixed(2)),
          "Cantidad": this.util.formatoNumeros((totalQuantity).toFixed(2)),
          "Unidad": prod.dtOrder.presentacion
        });
      }
    });
    return consolidatedInformation;
  }

  getInformationProductsOF_NoDirecta(data: any): Array<any> {
    let informationProducts: Array<any> = [];
    let count: number = 0;
    data.sort((a, b) => Number(a.dtOrder.numero_Rollo) - Number(b.dtOrder.numero_Rollo));
    data.sort((a, b) => Number(a.producto.prod_Id) - Number(b.producto.prod_Id));
    data.forEach(prod => {
      count++;
      informationProducts.push({
        "#": count,
        "Rollo": prod.dtOrder.numero_Rollo,
        "OT": prod.orderProduction,
        "Item": prod.producto.prod_Id,
        "Referencia": prod.producto.prod_Nombre,
        "Peso": this.util.formatoNumeros((prod.weight).toFixed(2)),
        "Peso B.": this.util.formatoNumeros((prod.weight).toFixed(2)),
        "Cantidad": this.util.formatoNumeros((prod.dtOrder.cantidad).toFixed(2)),
        "Unidad": prod.dtOrder.presentacion,
        "Ubicación": prod.ubication == null ? '' : prod.ubication,
      });
    });
    return informationProducts;
  }

  informationClientOF(data): {} {
    return {
      table: {
        widths: ['50%', '20%', '30%'],
        body: [
          [
            { text: `Información detallada del Cliente`, colSpan: 3, alignment: 'center', fontSize: 10, bold: true }, {}, {}
          ],
          [
            { text: `Nombre: ${data.clientes.cli_Nombre}` },
            { text: `ID: ${data.clientes.cli_Id}` },
            { text: `Tel.: ${data.clientes.cli_Telefono}` },
          ],
          [
            { text: `E-mail: ${data.clientes.cli_Email}` },
            { text: `Ciudad: ${data.sede ? data.sede.city : data.city}` },
            { text: `Dirección: ${data.sede ? data.sede.direction : data.direction}` },
          ],
          [
            { text: `Asesor: ${data.asesor.usua_Nombre == undefined ? data.asesor.nombre : data.asesor.usua_Nombre}`, },
            { text: `Tel.: ${data.clientes.cli_Telefono}` },
            { text: `OF Directa: ${data.order.of_Directa}` },
          ],
          data.datosEnvio != null ? [
            { text: `Conductor: ${data.datosEnvio.conductor}` },
            { text: `Placa: ${data.datosEnvio.placa}` },
            { text: `Despacha: ${data.datosEnvio.creadoPor}` },
          ] : [
            { border: [false, false, false, false], colSpan: 3, text: '' }, {}, {}
          ],
          data.datosEnvio != null ? [
            { text: `Fecha de Orden: ${(data.order.fecha).replace('T00:00:00', '')} ${data.order.hora}` },
            { text: `Fecha de Despacho: ${(data.datosEnvio.fecha).replace('T00:00:00', '')} ${(data.datosEnvio.hora)}`, colSpan: 2 }, {}
          ] : [
            { text: `Fecha de Orden: ${(data.order.fecha).replace('T00:00:00', '')} ${data.order.hora}`, colSpan: 3, }, {}, {}
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

  tableConsolidatedOF(data) {
    let columns: Array<string> = ['#', 'Pedido', 'Item', 'Referencia', 'Peso B.', 'Peso N.', 'Rollos', 'Cantidad', 'Unidad'];
    let widths: Array<string> = ['4%', '7%', '7%', '40%', '8%', '8%', '7%', '12%', '7%'];
    return {
      table: {
        headerRows: 2,
        widths: widths,
        body: this.buildTableBodyOF(data, columns, 'Consolidado de producto(s)'),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex == 0 || rowIndex == 1) ? '#DDDDDD' : null;
        }
      }
    };
  }

  tableProductsOF(data) {
    let columns: Array<string> = ['#', 'Rollo', 'OT', 'Item', 'Referencia', 'Peso'.replace('Peso', 'Peso B.'), 'Cantidad', 'Unidad', 'Ubicación'];
    let widths: Array<string> = ['4%', '8%', '7%', '7%', '36%', '7%', '8%', '7%', '16%'];
    return {
      margin: [0, 10],
      table: {
        headerRows: 2,
        widths: widths,
        body: this.buildTableBodyOF(data, columns, 'Rollos Seleccionados'),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex == 0 || rowIndex == 1) ? '#DDDDDD' : null;
        }
      }
    };
  }

  buildTableBodyOF(data, columns, title) {
    var body: any = [];
    body.push([{ colSpan: 9, text: title, bold: true, alignment: 'center', fontSize: 10 }, '', '', '', '', '', '', '', '']);
    body.push(columns);
    data.forEach(function (row) {
      var dataRow: any = [];
      columns.forEach((column) => dataRow.push(row[column].toString()));
      body.push(dataRow);
    });
    return body;
  }

  observationOF(data) {
    return {
      margin: [0, 20],
      table: {
        widths: ['*'],
        body: [
          [{ border: [true, true, true, false], text: `Observación Orden:`, style: 'subtitulo', bold: true }],
          [{ border: [true, false, true, true], text: `${data.order.observacion.toString().trim()}` }],
          data.datosEnvio != null ? [{ border: [true, true, true, false], text: `Observación Despacho:`, style: 'subtitulo', bold: true }] : [{ border: [false, false, false, false], text: '' }],
          data.datosEnvio != null ? [{ border: [true, false, true, true], text: `${data.datosEnvio.observacion.toString().trim()}` }] : [{ border: [false, false, false, false], text: '' }]
        ]
      },
      fontSize: 9,
    }
  }

  // Tabla con totales finales. 
  tableTotalsOF_NoDirecta(data) {
    let qtyRolls = this.consolidatedInformationOF_NoDirecta(data).reduce((a, b) => a + parseInt(b.Rollos), 0);
    let totalWeight = this.consolidatedInformationOF_NoDirecta(data).reduce((a, b) => a + parseFloat(b.Peso_Bruto.replace().replace(',', '')), 0);
    let totalNetWeight = this.consolidatedInformationOF_NoDirecta(data).reduce((a, b) => a + parseFloat(b.Peso_Neto.replace().replace(',', '')), 0);
    let totalQty = this.consolidatedInformationOF_NoDirecta(data).reduce((a, b) => a + parseFloat(b.Cantidad.replace(',', '')), 0);
    let units: any = [];

    this.consolidatedInformationOF_NoDirecta(data).forEach(x => {
      if (!units.includes(x.Unidad)) {
        units.push(x.Unidad);
      }
    });

    return {
      margin: [0, 0, 0, 0],
      fontSize: 8,
      bold: false,
      table: {
        widths: ['4%', '7%', '7%', '40%', '8%', '8%', '7%', '12%', '7%'],
        body: [
          [
            { text: ``, alignment: 'center', border: [true, false, false, true], },
            { text: ``, alignment: 'center', border: [false, false, false, true], },
            { text: ``, alignment: 'center', border: [false, false, false, true], },
            { text: `Totales`, alignment: 'right', bold: true, border: [false, false, false, true], },
            { text: `${this.util.formatoNumeros((totalWeight).toFixed(2))}`, alignment: '', bold: true, border: [true, false, true, true], },
            { text: `${this.util.formatoNumeros((totalNetWeight).toFixed(2))}`, alignment: '', bold: true, border: [true, false, true, true], },
            { text: `${this.util.formatoNumeros((qtyRolls))}`, alignment: '', bold: true, border: [true, false, true, true] },
            { text: `${this.util.formatoNumeros((totalQty).toFixed(2))}`, alignment: '', bold: true, border: [true, false, true, true], },
            { text: `${units.length == 1 ? units : ``}`, alignment: '', bold: true, border: [false, false, true, true], },
          ],
        ],
      }
    }
  }

  // ==============================================================================================================================
  //                                             PDF PARA ORDEN DE FACTURACION DIRECTA
  // ==============================================================================================================================

  DirectOFContent_PDF(data): any[] {
    let content: any[] = [];
    let consolidatedInformation: Array<any> = this.ConsolidatedInformationOF_Direct(data);
    let informationProducts: Array<any> = this.getInformationProductsOF_Direct(data[0].detailsFact);

    content.push(this.informationClientOF(data[0]));
    content.push(this.observationOF(data[0]));
    content.push(this.tableConsolidatedOF(consolidatedInformation));
    content.push(this.TableTotalsOF_Direct(data));

    informationProducts.length > 0 ? content.push(this.tableProductsOF(informationProducts)) : null;
    return content;
  }

  /// Función para cargar la información consolidada de las referencias.
  ConsolidatedInformationOF_Direct(data: any) {
    let consolidatedInformation: any = [];
    let count: number = 0;

    data.forEach(x => {
      count++
      consolidatedInformation.push({
        "#": count,
        "Pedido": x.dtOrder.factPro_Pedido,
        "Item": x.producto.prod_Id,
        "Referencia": x.producto.prod_Nombre,
        "Rollos": this.util.formatoNumeros((x.dtOrder.factPro_Unidades).toFixed(2)),
        "Peso B.": this.util.formatoNumeros((x.dtOrder.peso_Bruto).toFixed(2)),
        "Peso_Bruto": this.util.formatoNumeros((x.dtOrder.peso_Bruto).toFixed(2)),
        "Peso N.": this.util.formatoNumeros((x.dtOrder.peso_Neto).toFixed(2)),
        "Peso_Neto": this.util.formatoNumeros((x.dtOrder.peso_Neto).toFixed(2)),
        "Cantidad": this.util.formatoNumeros((x.dtOrder.factPro_Cantidad).toFixed(2)),
        "Unidad": x.dtOrder.undMed_Id
      });
    });
    return consolidatedInformation;
  }

  /// Función para cargar la información detallada de las referencias.
  getInformationProductsOF_Direct(data: any): Array<any> {
    let informationProducts: Array<any> = [];
    if (![null, undefined].includes(data)) {
      let count: number = 0;
      data.sort((a, b) => Number(a.dtOrder.numero_Rollo) - Number(b.dtOrder.numero_Rollo));
      data.sort((a, b) => Number(a.producto.prod_Id) - Number(b.producto.prod_Id));
      data.forEach(prod => {
        count++;
        informationProducts.push({
          "#": count,
          "Rollo": prod.dtOrder.numero_Rollo,
          "OT": prod.dataProduction.ordenProduction,
          "Item": prod.producto.prod_Id,
          "Referencia": prod.producto.prod_Nombre,
          "Peso": this.util.formatoNumeros((prod.dataProduction.weight).toFixed(2)),
          "Peso B.": this.util.formatoNumeros((prod.dataProduction.weight).toFixed(2)),
          "Cantidad": this.util.formatoNumeros((prod.dtOrder.cantidad).toFixed(2)),
          "Unidad": prod.dtOrder.presentacion,
          "Ubicación": prod.ubication == null ? '' : prod.ubication,
        });
      });
    }
    return informationProducts;
  }

  /// Tabla con los totales de la consolidada. 
  TableTotalsOF_Direct(data) {
    let qtyRolls = this.ConsolidatedInformationOF_Direct(data).reduce((a, b) => a + parseFloat(b.Rollos.replace().replace(',', '')), 0);
    let totalWeight = this.ConsolidatedInformationOF_Direct(data).reduce((a, b) => a + parseFloat(b.Peso_Bruto.replace().replace(',', '')), 0);
    let totalNetWeight = this.ConsolidatedInformationOF_Direct(data).reduce((a, b) => a + parseFloat(b.Peso_Neto.replace().replace(',', '')), 0);
    let totalQty = this.ConsolidatedInformationOF_Direct(data).reduce((a, b) => a + parseFloat(b.Cantidad.replace(',', '')), 0);
    let units: any = [];

    this.ConsolidatedInformationOF_Direct(data).forEach(x => {
      if (!units.includes(x.Unidad)) {
        units.push(x.Unidad);
      }
    });

    return {
      margin: [0, 0, 0, 0],
      fontSize: 8,
      bold: false,
      table: {
        widths: ['4%', '7%', '7%', '40%', '8%', '8%', '7%', '12%', '7%'],
        body: [
          [
            { text: ``, alignment: 'center', border: [true, false, false, true], },
            { text: ``, alignment: 'center', border: [false, false, false, true], },
            { text: ``, alignment: 'center', border: [false, false, false, true], },
            { text: `Totales`, alignment: 'right', bold: true, border: [false, false, false, true], },
            { text: `${this.util.formatoNumeros((totalWeight).toFixed(2))}`, alignment: '', bold: true, border: [true, false, true, true], },
            { text: `${this.util.formatoNumeros((totalNetWeight).toFixed(2))}`, alignment: '', bold: true, border: [true, false, true, true], },
            { text: `${this.util.formatoNumeros((qtyRolls))}`, alignment: '', bold: true, border: [true, false, true, true] },
            { text: `${this.util.formatoNumeros((totalQty).toFixed(2))}`, alignment: '', bold: true, border: [true, false, true, true], },
            { text: `${units.length == 1 ? units : ``}`, alignment: '', bold: true, border: [false, false, true, true], },
          ],
        ],
      }
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

  // ==============================================================================================================================
  //                                             PDF PARA INGRESO BODEGA ROLLOS
  // ==============================================================================================================================

  IngresoBodegaRollos_contentPDF(data): any[] {
    let content: any[] = [];
    let consolidatedInformation: Array<any> = this.getInfoIngresoRollosPDF(data);
    let informationProducts: Array<any> = this.getInfoDetallesIngresoRollosPDF(data);
    content.push(this.infoMovementIngresoRollosPDF(data[0]));
    content.push(this.tablaIngresoRollosPDF(consolidatedInformation));
    content.push(this.tableTotalsIngresoRollosPDF(consolidatedInformation))
    content.push(this.tablaDetallesIngresoRollosPDF(informationProducts));
    return content;
  }

  getInfoIngresoRollosPDF(data: any): Array<any> {
    let info: Array<any> = [];
    let contador: number = 0;
    data.forEach(d => {
      if (!info.map(x => x.OT).includes(d.orden_Trabajo)) {
        contador++;
        let cantRegistros : number = data.filter(x => x.orden_Trabajo == d.orden_Trabajo).length;
        let pesoTotal: number = 0;
        data.filter(x => x.orden_Trabajo == d.orden_Trabajo).forEach(x => pesoTotal += x.cantidad);
        info.push({
          "#": contador,
          "OT": d.orden_Trabajo,
          "Item": d.item,
          "Referencia": d.referencia,
          "Rollos" : cantRegistros,
          "Peso": pesoTotal.toFixed(2),
          "Presentación" : d.presentacion,
        });
      }
    });
    return info;
  }

  getInfoDetallesIngresoRollosPDF(data: any): Array<any> {
    let info: Array<any> = [];
    let count: number = 0;

    data.forEach(d => {
      count++;
      info.push({
        "#": count,
        "Rollo": d.rollo,
        "OT": d.orden_Trabajo,
        "Item": d.item,
        "Referencia": d.referencia,
        "Peso": d.cantidad,
        "Und" : d.presentacion,
        "Proceso" : d.bodega_Inicial,
        "Bodega" : d.bodega_Ingreso,
        "Ubicación" : d.ubicacion,
      });
    });
    return info;
  }

  //Función que muestra una tabla con la información general del ingreso.
  infoMovementIngresoRollosPDF(data : any): {} {
    return {
      margin : [0, 0, 0, 20],
      table: {
        widths: ['34%', '33%', '33%'],
        body: [
          [
            { text: `Información general del movimiento`, colSpan: 3, alignment: 'center', fontSize: 10, bold: true }, {}, {}
          ],
          [
            { text: `Usuario ingreso: ${data.usuario}` },
            { text: `Fecha ingreso: ${data.fecha.replace('T00:00:00', '')}` },
            { text: `Hora ingreso: ${data.hora}` },
          ],
          [
            { text: `Observación: ${data.observacion}`, colSpan: 3, fontSize: 9, }, {}, {}
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
  tablaIngresoRollosPDF(data) {
    let columns: Array<string> = ['#', 'OT', 'Item', 'Referencia', 'Rollos', 'Peso', 'Presentación'];
    let widths: Array<string> = ['5%', '10%', '10%', '45%', '10%', '10%', '10%'];
    return {
      table: {
        headerRows: 2,
        widths: widths,
        body: this.buildTableBodyIngresoRollos1(data, columns, 'Consolidado de rollos ingresados por orden de producción'),
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
  tablaDetallesIngresoRollosPDF(data) {
    let columns: Array<string> = ['#', 'Rollo', 'Proceso', 'Bodega', 'Ubicación', 'OT', 'Item', 'Referencia', 'Peso', 'Und'];
    let widths: Array<string> = ['3%', '8%', '7%', '6%', '12%', '7%', '7%', '40%', '7%', '3%'];
    return {
      margin: [0, 20],
      table: {
        headerRows: 2,
        widths: widths,
        body: this.buildTableBodyIngresoRollos2(data, columns, 'Información detallada de rollos ingresados'),
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
  tableTotalsIngresoRollosPDF(data : any){
    return {
      fontSize: 8,
      bold: false,
      table: {
        widths: ['5%', '10%', '10%', '45%', '10%', '10%', '10%'],
        body: [
          [
            { text: ``, bold : true, border: [true, false, false, true], },
            { text: ``, bold : true, border: [false, false, false, true], },
            { text: ``, bold : true, border: [false, false, false, true], },
            { text: `Totales`, alignment: 'right', bold : true, border: [false, false, true, true], },
            { text: `${this.util.formatoNumeros((data.reduce((a, b) => a += parseInt(b.Rollos), 0)))}`, bold : true, border: [false, false, true, true], },
            { text: `${this.util.formatoNumeros((data.reduce((a, b) => a += parseFloat(b.Peso), 0)).toFixed(2))}`, bold : true, border: [false, false, true, true], },
            { text: `Kg`, bold : true, border: [false, false, true, true], },
          ],
        ],
      }
    }
  }

  buildTableBodyIngresoRollos1(data, columns, title) {
    var body : any = [];
    body.push([{ colSpan: 7, text: title, bold: true, alignment: 'center', fontSize: 10 }, '', '', '', '', '', '']);
    body.push(columns);
    data.forEach(function (row) {
      var dataRow: any = [];
      columns.forEach((column) => dataRow.push(row[column].toString()));
      body.push(dataRow);
    });
    return body;
  }

  buildTableBodyIngresoRollos2(data, columns, title) {
    var body : any = [];
    body.push([{ colSpan: 10, text: title, bold: true, alignment: 'center', fontSize: 10 }, '', '', '', '', '', '', '', '', '']);
    body.push(columns);
    data.forEach(function (row) {
      var dataRow : any = [];
      columns.forEach((column) => dataRow.push(row[column].toString()));
      body.push(dataRow);
    });
    return body;
  }
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
    let content: any[] = [];
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
    let data: any[] = [];
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
