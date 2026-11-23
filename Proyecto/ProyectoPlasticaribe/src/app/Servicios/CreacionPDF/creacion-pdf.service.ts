import { Inject, Injectable } from '@angular/core';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { logoNuevoParaPdf } from 'src/app/logoPlasticaribeNuevo_Base64';
import JsBarcode from 'jsbarcode';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { EncriptacionService } from '../Encriptacion/Encriptacion.service';
import { ReImpresionEtiquetasService, ReImpresionEtiquetas } from '../ReImpresionEtiquetas/ReImpresionEtiquetas.service';
import { referenceWike } from './referenciaWiketiado';
import { UtileriaService } from '../Utileria/utileria.service';
import { catchError, map, Observable } from 'rxjs';
import { BagproService } from '../BagPro/Bagpro.service';
import { Orden_TrabajoService } from '../OrdenTrabajo/Orden_Trabajo.service';
import { DatosPdfAsignacion, DetalleSolicitudMaterial, MaterialDetalleSolicitud, SubcategoriaAsignadaPdf, SubcategoriaDetalleSolicitud } from 'src/app/Modelo/modelFlujoMaterialProduccion';

@Injectable({
  providedIn: 'root'
})

export class CreacionPdfService {

  title : any;

  constructor(private rePrintService: ReImpresionEtiquetasService,
    @Inject(SESSION_STORAGE) private storage: WebStorageService,
    private encriptacion: EncriptacionService,
    private util: UtileriaService,
    private ordenTrabajoService: Orden_TrabajoService,
    private bagProService: BagproService,
  ) { }

  /**
   * @param tituloPestana Título del documento (el que se ve en la pestaña del navegador); por defecto el mismo título.
   */
  formatoPDF(titulo: string, content: any, headerAdicional: any = {}, tituloPestana: string = titulo) {
    this.title = titulo; 
    let today: any = moment().format('YYYY-MM-DD');
    let hour: any = moment().format('HH:mm:ss');
    const pdfDefinicion: any = {
      info: { title: tituloPestana },
      pageOrientation: 'portrait',
      pageSize: 'LETTER',
      watermark: { text: 'PLASTICARIBE SAS', color: 'red', opacity: 0.02, bold: true, italics: false },
      pageMargins: [25, 120, 25, 35],
      header: this.headerPDF(today, hour, titulo, headerAdicional),
      content: content,
    }
    setTimeout(() => this.crearPDF(pdfDefinicion), 2000);
  }

  /**
   * Cabecera común: logo (ancho fijo), título (ocupa todo el espacio restante) y paginado/fecha/hora (ancho fijo).
   * El logo necesita `width` además de `fit`: en pdfmake una columna sin width es '*' y se repartiría el espacio con el título.
   * En carta (612 pt) quedan ~572 pt: 130 para el logo, 95 para el paginado y ~340 para el título,
   * suficiente para que cada línea del título (p. ej. "Asignación de Materia Prima N° 91510") quepa en un solo renglón.
   */
  private headerPDF(today: any, hour: any, titulo: string, headerAdicional: any): {} {
    return (currentPage: any, pageCount: any) => {
      return [
        {
          margin: [20, 8, 20, 0],
          columns: [
            // Margen izquierdo 5: el logo empieza donde empieza la línea del encabezado (x = 25); arriba 20 lo centra con el título
            { image: logoNuevoParaPdf, width: 130, fit: [130, 26], margin: [5, 20, 0, 8] },
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
    // Stack en lugar de tabla: las celdas de tabla agregan relleno entre filas y el espacio NIT → título quedaba
    // mayor que entre las líneas del título. Así todas las líneas tienen el mismo interlineado.
    return {
      width: '*',
      alignment: 'center',
      bold: true,
      fontSize: 10,
      lineHeight: 1.15,
      stack: [
        { text: 'NIT. 800188732' },
        { text: titulo },
      ],
      // Derecha 45 = 10 + (130 del logo − 95 del paginado): iguala los lados para que el título quede centrado en la página
      margin: [10, 18, 45, 8],
    }
  }

  private paginadoFechaHoraPDF(currentPage: { toString: () => string; }, pageCount: string, today: any, hour: any): {} {
    return {
      width: 95,
      alignment: 'left',
      margin: [0, 20, 0, 0],
      table: {
        body: [
          [{ text: `Página: `, alignment: 'left', fontSize: 8, bold: true }, { text: `${currentPage.toString() + ' de ' + pageCount}`, alignment: 'left', fontSize: 8 }],
          [{ text: `Fecha: `, alignment: 'left', fontSize: 8, bold: true }, { text: today, alignment: 'left', fontSize: 8 }],
          [{ text: `Hora: `, alignment: 'left', fontSize: 8, bold: true }, { text: hour, alignment: 'left', fontSize: 8 }],
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
            { text: `Fecha Modifica: ${date1 == date2 && data.hour1 == data.hour2 ? '' : `${date2} ${data.hour2}`}` },
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

  /* ============================================================== SOLICITUD DE MATERIAL DE PRODUCCIÓN ===================================================================== */

  /**
   * Genera el PDF de una solicitud de material de producción con datos ya consultados (este servicio no llama al API).
   * Copia del PDF que genera SolicitudMP_ExtrusionComponent, sin depender de esa pantalla y con estas correcciones:
   * totales por unidad de medida (no suma Kg con Cms), Kg reales de la OT separados del límite, datos de la solicitud
   * (estado, fechas, solicitante, máquina, proceso), cantidades entregadas/faltantes y la cabecera común de los PDFs.
   * Muestra las máquinas con su porcentaje y las subcategorías con sus materiales.
   * @param solicitud Detalle de `SolicitudesExtrusion/{id}` (encabezado, máquinas y subcategorías con materiales).
   * @param ot Datos de la OT en BagPro, o null si no se encontró.
   */
  solicitudMaterialProduccionPDF(solicitud: DetalleSolicitudMaterial, ot: DatosOTSolicitudPDF | null) {
    const { titulo, tituloPestana, content } = this.contenidoSolicitudMaterialPDF(solicitud, ot);
    this.formatoPDF(titulo, content, {}, tituloPestana);
  }

  /**
   * Genera el PDF de la solicitud de material como archivo en memoria (sin abrirlo), para mostrar un aviso
   * y abrirlo después (como `generarBlobOrdenTrabajo`).
   */
  generarBlobSolicitudMaterialProduccion(solicitud: DetalleSolicitudMaterial, ot: DatosOTSolicitudPDF | null): Observable<Blob> {
    return this.generarBlobPDF(() => this.contenidoSolicitudMaterialPDF(solicitud, ot));
  }

  /**
   * Genera el PDF de una asignación de materia prima y tintas como archivo en memoria (sin abrirlo), para mostrar un aviso
   * y abrirlo después.
   * @param datos Datos de `Asignacion_MatPrima/{id}/pdf`.
   */
  generarBlobAsignacionMateriaPrima(datos: DatosPdfAsignacion): Observable<Blob> {
    return this.generarBlobPDF(() => this.contenidoAsignacionMaterialPDF(datos));
  }

  /**
   * PDF con el formato común (cabecera con logo, NIT, título y paginado; marca de agua y márgenes) para un contenido
   * armado por el componente. Lo usa, por ejemplo, Pedidos de Productos (ReportePedidos_Zeus).
   * @param contenido Función que arma el contenido (pdfmake lo modifica al maquetarlo, por eso se pide una función).
   */
  generarBlobFormatoComun(titulo: string, contenido: () => any[], tituloPestana: string = titulo, orientacion: 'portrait' | 'landscape' = 'portrait'): Observable<Blob> {
    return this.generarBlobPDF(() => ({ titulo, tituloPestana, content: contenido(), orientacion }));
  }

  /**
   * Arma un PDF con el formato común (cabecera, marca de agua, márgenes) y lo entrega como archivo en memoria.
   * @param contenido Devuelve el título de la cabecera, el título de la pestaña y el contenido del documento.
   */
  private generarBlobPDF(contenido: () => {
    titulo: string;
    tituloPestana: string;
    content: any[];
    /** Título de la cabecera por hoja (si cambia de una hoja a otra); si no se envía, todas usan `titulo`. */
    tituloPorPagina?: (pagina: number) => string;
    /** Se ejecuta al maquetar cada nodo; sirve para saber en qué hoja empieza cada sección. */
    pageBreakBefore?: (nodo: any) => boolean;
    /** Orientación de la hoja; por defecto vertical. */
    orientacion?: 'portrait' | 'landscape';
  }): Observable<Blob> {
    return new Observable<Blob>(suscriptor => {
      try {
        const hoy = moment().format('YYYY-MM-DD');
        const hora = moment().format('HH:mm:ss');
        // pdfmake modifica el contenido al maquetarlo: cada pasada arma el suyo con `contenido()`.
        const definicion = () => {
          const { titulo, tituloPestana, content, tituloPorPagina, orientacion } = contenido();
          this.title = titulo;
          return {
            info: { title: tituloPestana },
            pageOrientation: orientacion ?? 'portrait',
            pageSize: 'LETTER',
            watermark: { text: 'PLASTICARIBE SAS', color: 'red', opacity: 0.02, bold: true, italics: false },
            pageMargins: [25, 120, 25, 35],
            header: tituloPorPagina
              ? (pagina: number, total: number) => (this.headerPDF(hoy, hora, tituloPorPagina(pagina), {}) as any)(pagina, total)
              : this.headerPDF(hoy, hora, titulo, {}),
            content,
          };
        };
        const entregar = (blob: Blob) => {
          suscriptor.next(blob);
          suscriptor.complete();
        };
        const { pageBreakBefore } = contenido();
        if (pageBreakBefore) {
          // pdfmake dibuja las cabeceras antes de llamar a pageBreakBefore: una primera pasada solo averigua
          // en qué hoja empieza cada sección y la segunda dibuja las cabeceras ya con ese dato.
          pdfMake.createPdf({ ...definicion(), pageBreakBefore } as any).getBuffer(() => pdfMake.createPdf(definicion() as any).getBlob(entregar));
        } else {
          pdfMake.createPdf(definicion() as any).getBlob(entregar);
        }
      } catch (error) {
        suscriptor.error(error);
      }
    });
  }

  /** Título y contenido del PDF de una solicitud de material (comunes a abrirlo directo o como archivo). */
  private contenidoSolicitudMaterialPDF(solicitud: DetalleSolicitudMaterial, ot: DatosOTSolicitudPDF | null): { titulo: string; tituloPestana: string; content: any[] } {
    const subcategorias = [...(solicitud.subcategorias ?? [])].sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));

    const titulo = `Solicitud de Materia Prima N° ${solicitud.id}\nOrden de Trabajo N° ${solicitud.ot}`;
    const content = [
      this.infoSolicitudMaterialPDF(solicitud, subcategorias),
      this.infoOTSolicitudMaterialPDF(solicitud, ot),
      this.tablaMaquinasSolicitudPDF(solicitud),
      this.tablaSubcategoriasSolicitudPDF(subcategorias),
      this.observacionSolicitudMaterialPDF(solicitud.observacion ?? ''),
    ];
    // Título corto para la pestaña del navegador; el título completo va en la cabecera del documento.
    return { titulo, tituloPestana: `Solicitud MP #${solicitud.id}`, content };
  }

  /** Formatea una cantidad con separador de miles y dos decimales. */
  private cantidadPDF = (valor: number): string => this.util.formatoNumeros((Number(valor) || 0).toFixed(2));

  /** Toma la fecha (yyyy-MM-dd) de un valor de fecha del API. */
  private fechaPDF = (valor: any): string => valor ? String(valor).substring(0, 10) : 'Sin definir';

  /** Estilo de tabla con las dos primeras filas (título y columnas) sombreadas. */
  private layoutEncabezadoGris = { fillColor: (rowIndex: number) => rowIndex === 0 || rowIndex === 1 ? '#DDDDDD' : null };

  /** Suma lo solicitado, entregado y faltante de las subcategorías por unidad de medida (no suma Kg con otras unidades). */
  private totalesPorMedidaPDF(subcategorias: SubcategoriaDetalleSolicitud[]): Map<string, { solicitado: number; entregado: number; faltante: number }> {
    const totales = new Map<string, { solicitado: number; entregado: number; faltante: number }>();
    subcategorias.forEach(s => {
      const total = totales.get(s.undMed_Id) ?? { solicitado: 0, entregado: 0, faltante: 0 };
      total.solicitado += Number(s.solicitado) || 0;
      total.entregado += Number(s.entregado) || 0;
      total.faltante += Number(s.faltante) || 0;
      totales.set(s.undMed_Id, total);
    });
    return totales;
  }

  /** Datos generales de la solicitud y un resumen de lo pedido (total, subcategorías, materiales y máquinas). */
  private infoSolicitudMaterialPDF(solicitud: DetalleSolicitudMaterial, subcategorias: SubcategoriaDetalleSolicitud[]): {} {
    const maquinas = solicitud.maquinas ?? [];
    const totalSolicitado = Array.from(this.totalesPorMedidaPDF(subcategorias).entries())
      .map(([medida, total]) => `${this.cantidadPDF(total.solicitado)} ${medida}`).join(' + ') || '0.00';
    const cantidadMateriales = subcategorias.reduce((suma, s) => suma + (s.materiales ?? []).filter(m => !this.materialNoPedidoPDF(m)).length, 0);
    const plural = (n: number, singular: string, pluralTexto: string) => `${n} ${n === 1 ? singular : pluralTexto}`;
    const resumen = [
      `Total solicitado: ${totalSolicitado}`,
      plural(subcategorias.length, 'subcategoría', 'subcategorías'),
      ...(cantidadMateriales > 0 ? [plural(cantidadMateriales, 'material', 'materiales')] : []),
      plural(maquinas.length, 'máquina', 'máquinas'),
    ].join('  ·  ');

    return {
      margin: [0, 0, 0, 10],
      fontSize: 8,
      table: {
        widths: ['*', '*', '*', '*'],
        body: [
          [{ text: 'Información de la Solicitud', colSpan: 4, alignment: 'center', fontSize: 10, bold: true }, {}, {}, {}],
          [
            `Estado: ${solicitud.estado ?? ''}`,
            `Proceso: ${solicitud.proceso_Id ?? ''}`,
            `${maquinas.length === 1 ? 'Máquina' : 'Máquinas'}: ${maquinas.map(m => m.maquina).join(', ')}`,
            `Solicitante: ${solicitud.usuario ?? ''}`,
          ],
          [
            { text: `Fecha creación: ${this.fechaPDF(solicitud.fecha)} ${String(solicitud.hora ?? '').substring(0, 8)}`, colSpan: 2 }, {},
            { text: `Fecha estimada de entrega: ${this.fechaPDF(solicitud.fechaEntrega)}`, colSpan: 2 }, {},
          ],
          [{ text: resumen, colSpan: 4, bold: true }, {}, {}, {}],
        ]
      },
      layout: { fillColor: (rowIndex: number) => rowIndex === 0 ? '#DDDDDD' : null },
    };
  }

  /**
   * Distribución por máquina: porcentaje, kg que le tocan del total solicitado, lo ya entregado a cada una y lo que falta.
   * Las solicitudes anteriores (una sola máquina guardada en el encabezado) llegan del API con esa máquina al 100 %.
   */
  private tablaMaquinasSolicitudPDF(solicitud: DetalleSolicitudMaterial): {} {
    const maquinas = solicitud.maquinas ?? [];
    const numero = (valor: number, bold = false) => ({ text: this.cantidadPDF(valor), alignment: 'right', bold });
    const porcentaje = (valor: number, bold = false) => ({ text: `${this.cantidadPDF(valor)} %`, alignment: 'right', bold });
    const faltante = (objetivo: number, entregado: number) => Math.max(0, (Number(objetivo) || 0) - (Number(entregado) || 0));
    const total = maquinas.reduce((t, m) => ({
      porcentaje: t.porcentaje + (Number(m.porcentaje) || 0),
      objetivo: t.objetivo + (Number(m.objetivo) || 0),
      entregado: t.entregado + (Number(m.entregado) || 0),
      faltante: t.faltante + faltante(m.objetivo, m.entregado),
    }), { porcentaje: 0, objetivo: 0, entregado: 0, faltante: 0 });

    return {
      margin: [0, 0, 0, 10],
      fontSize: 8,
      table: {
        headerRows: 2,
        keepWithHeaderRows: 1,
        dontBreakRows: true,
        widths: ['*', 85, 85, 85, 85],
        body: [
          [{ text: 'Distribución por máquina', colSpan: 5, alignment: 'center', fontSize: 10, bold: true }, {}, {}, {}, {}],
          ['Máquina', 'Porcentaje', 'Kg solicitados', 'Kg entregados', 'Kg faltantes'],
          ...maquinas.map(m => [String(m.maquina), porcentaje(m.porcentaje), numero(m.objetivo), numero(m.entregado), numero(faltante(m.objetivo, m.entregado))]),
          [{ text: 'Total', bold: true, alignment: 'right' }, porcentaje(total.porcentaje, true), numero(total.objetivo, true), numero(total.entregado, true), numero(total.faltante, true)],
        ]
      },
      layout: this.layoutEncabezadoGris,
    };
  }

  /** El material se entregó sin haberse pedido: sustituto, o material entregado en una solicitud anterior (sin materiales). */
  private materialNoPedidoPDF = (m: MaterialDetalleSolicitud): boolean => m.esSustituto || (Number(m.solicitado) || 0) === 0;

  /** Datos de la OT: kg reales de la OT y kg límite (con el adicional permitido) por separado. */
  private infoOTSolicitudMaterialPDF(solicitud: any, ot: DatosOTSolicitudPDF | null): {} {
    return {
      margin: [0, 0, 0, 10],
      fontSize: 8,
      table: {
        widths: [45, 140, 40, '*', 65, 65],
        body: [
          [{ text: 'Información de la OT', colSpan: 6, alignment: 'center', fontSize: 10, bold: true }, {}, {}, {}, {}, {}],
          ['OT', 'Cliente', 'Item', 'Referencia', 'Kg OT', 'Kg Límite'],
          ot
            ? [solicitud.ot, ot.cliente || '', ot.item ?? '', ot.referencia || '', this.cantidadPDF(ot.kgOT), this.cantidadPDF(ot.kgLimite)]
            : [solicitud.ot, { text: 'No se encontró la OT en BagPro', colSpan: 5, italics: true }, {}, {}, {}, {}],
        ]
      },
      layout: this.layoutEncabezadoGris,
    };
  }

  /**
   * Subcategorías (en negrita, con el Id junto al nombre) y debajo, con sangría, sus materiales; cada fila con lo
   * solicitado, entregado y faltante. Los materiales entregados sin pedirse salen en cursiva con su motivo.
   * Al final, un total por cada unidad de medida.
   */
  private tablaSubcategoriasSolicitudPDF(subcategorias: SubcategoriaDetalleSolicitud[]): {} {
    const numero = (valor: number, extra: {} = {}) => ({ text: this.cantidadPDF(valor), alignment: 'right', ...extra });
    const filas: any[][] = [];
    subcategorias.forEach(s => {
      filas.push([
        { text: `${s.subCatMP_Id} - ${s.nombre}`, bold: true },
        numero(s.solicitado, { bold: true }), numero(s.entregado, { bold: true }), numero(s.faltante, { bold: true }),
        { text: s.undMed_Id, bold: true },
      ]);
      (s.materiales ?? []).forEach(m => {
        const noPedido = this.materialNoPedidoPDF(m);
        const solicitado = Number(m.solicitado) || 0;
        const entregado = Number(m.entregado) || 0;
        const motivo = m.esSustituto ? ' (sustituto)' : noPedido ? ' (entregado)' : '';
        const estilo = noPedido ? { italics: true } : {};
        filas.push([
          { text: `${m.materialId} - ${(m.nombre || '').trim()}${motivo}`, margin: [12, 0, 0, 0], ...estilo },
          numero(solicitado, estilo), numero(entregado, estilo), numero(Math.max(0, solicitado - entregado), estilo),
          { text: m.undMed_Id, ...estilo },
        ]);
      });
    });

    return {
      margin: [0, 0, 0, 10],
      fontSize: 8,
      table: {
        headerRows: 2,
        keepWithHeaderRows: 1,
        dontBreakRows: true,
        widths: ['*', 65, 65, 65, 45],
        body: [
          [{ text: 'Subcategorías y materiales solicitados', colSpan: 5, alignment: 'center', fontSize: 10, bold: true }, {}, {}, {}, {}],
          ['Subcategoría / Material', 'Solicitada', 'Entregada', 'Faltante', 'Medida'],
          ...filas,
          ...Array.from(this.totalesPorMedidaPDF(subcategorias).entries()).map(([medida, total]) => [
            { text: `Total ${medida}`, bold: true, alignment: 'right' },
            numero(total.solicitado, { bold: true }), numero(total.entregado, { bold: true }), numero(total.faltante, { bold: true }),
            { text: medida, bold: true },
          ]),
        ]
      },
      layout: this.layoutEncabezadoGris,
    };
  }

  /** Observación de la solicitud. */
  private observacionSolicitudMaterialPDF(observacion: string): {} {
    return {
      fontSize: 8,
      table: {
        widths: ['*'],
        body: [[{ text: `Observación:\n${observacion || ''}`, margin: [0, 0, 0, 15] }]]
      },
    };
  }

  /* ============================================================== ASIGNACIÓN DE MATERIA PRIMA ===================================================================== */

  /**
   * Genera el PDF de una asignación de BOPP con datos ya consultados (este servicio no llama al API). Las de materia
   * prima y tintas usan `asignacionMaterialPDF` (agrupadas por subcategoría y con el saldo de la solicitud).
   * Trasladado desde MovimientoMPComponent con estas correcciones: se quitan Precio, SubTotal y Valor Total (siempre
   * se imprimían en $0), el peso total se suma por unidad de medida, el título de la tabla corresponde al tipo de
   * material y se muestra la máquina.
   * @param datos Filas de `Materia_Prima/getInfoMovimientoAsignaciones/{id}/{tipo}`: encabezado repetido en cada fila más el material.
   */
  asignacionMateriaPrimaPDF(datos: any[]) {
    const { titulo, tituloPestana, content } = this.contenidoAsignacionPDF(datos);
    this.formatoPDF(titulo, content, {}, tituloPestana);
  }

  /** Título y contenido del PDF de una asignación (comunes a abrirlo directo o como archivo). */
  private contenidoAsignacionPDF(datos: any[]): { titulo: string; tituloPestana: string; content: any[] } {
    const asignacion = datos[0];
    const solicitud = Number(asignacion.solicitud_Id) || 0;
    const titulo = [
      `${asignacion.tipo_Movimiento} N° ${asignacion.id}`,
      // 0 = sin solicitud; 1 = solicitud genérica de las asignaciones manuales.
      solicitud > 1 ? `Basado en Solicitud N° ${solicitud}` : '',
      `Orden de Trabajo N° ${asignacion.codigo}`,
    ].filter(linea => linea).join('\n');

    const materiales = datos.map(d => ({ ...this.materialAsignadoPDF(d), cantidad: Number(d.cantidad) || 0, medida: d.unidad_Medida }));
    const content = [
      this.infoAsignacionPDF(asignacion),
      this.tablaMaterialesAsignadosPDF(asignacion.movimiento, materiales),
      this.observacionAsignacionPDF(asignacion.observacion),
    ];
    // Título corto para la pestaña del navegador; el título completo va en la cabecera del documento.
    return { titulo, tituloPestana: `Asignación MP #${asignacion.id}`, content };
  }

  /**
   * Abre el PDF de una asignación de materia prima y tintas (un solo PDF con ambos tipos de material).
   * @param datos Datos de `Asignacion_MatPrima/{id}/pdf`.
   */
  asignacionMaterialPDF(datos: DatosPdfAsignacion) {
    const { titulo, tituloPestana, content } = this.contenidoAsignacionMaterialPDF(datos);
    this.formatoPDF(titulo, content, {}, tituloPestana);
  }

  /**
   * Título y contenido del PDF de una asignación de materia prima y tintas: información general, distribución por
   * máquina (solo si viene de una solicitud), materiales agrupados por subcategoría y observación.
   */
  private contenidoAsignacionMaterialPDF(datos: DatosPdfAsignacion): { titulo: string; tituloPestana: string; content: any[] } {
    const subcategorias = datos.subcategorias ?? [];
    const titulo = [
      `Asignación de Materia Prima N° ${datos.id}`,
      datos.solicitud ? `Basado en Solicitud N° ${datos.solicitud.id}` : '',
      `Orden de Trabajo N° ${datos.ot}`,
    ].filter(linea => linea).join('\n');

    const content = [
      this.infoAsignacionMaterialPDF(datos, subcategorias),
      ...(datos.solicitud ? [this.tablaMaquinasAsignacionPDF(datos)] : []),
      this.tablaSubcategoriasAsignacionPDF(subcategorias, !!datos.solicitud),
      this.observacionAsignacionPDF(datos.observacion ?? ''),
    ];
    return { titulo, tituloPestana: `Asignación MP #${datos.id}`, content };
  }

  /** Estilo de las tablas de la asignación: título y columnas sombreados. */
  private layoutEncabezadoAsignacion = { fillColor: (rowIndex: number) => rowIndex === 0 || rowIndex === 1 ? '#CCCCCC' : null };

  /** Datos generales de la asignación, la solicitud de la que viene (o que es manual) y un resumen de lo asignado. */
  private infoAsignacionMaterialPDF(datos: DatosPdfAsignacion, subcategorias: SubcategoriaAsignadaPdf[]): {} {
    const totales = new Map<string, number>();
    subcategorias.forEach(s => totales.set(s.undMed_Id, (totales.get(s.undMed_Id) ?? 0) + (Number(s.estaAsignacion) || 0)));
    const totalAsignado = Array.from(totales.entries()).map(([medida, total]) => `${this.cantidadPDF(total)} ${medida}`).join(' + ') || '0.00';
    const cantidadMateriales = subcategorias.reduce((suma, s) => suma + (s.materiales ?? []).length, 0);
    const plural = (n: number, singular: string, pluralTexto: string) => `${n} ${n === 1 ? singular : pluralTexto}`;
    const resumen = [
      `Total asignado: ${totalAsignado}`,
      plural(subcategorias.length, 'subcategoría', 'subcategorías'),
      plural(cantidadMateriales, 'material', 'materiales'),
    ].join('  ·  ');
    const origen = datos.solicitud
      ? `Solicitud N° ${datos.solicitud.id}${datos.solicitud.estado ? ` (${datos.solicitud.estado})` : ''}`
      : 'Asignación manual (sin solicitud)';

    return {
      fontSize: 8,
      table: {
        widths: ['15%', '30%', '15%', '20%', '20%'],
        body: [
          [{ text: 'Información General del Movimiento', colSpan: 5, alignment: 'center', fontSize: 10, bold: true }, {}, {}, {}, {}],
          [
            `OT N°: ${datos.ot}`,
            `Usuario: ${datos.usuario ?? ''}`,
            `Máquina: ${datos.maquina || ''}`,
            `Fecha Registro: ${this.fechaPDF(datos.fecha)} ${datos.hora ?? ''}`,
            `Fecha Asignación: ${this.fechaPDF(datos.fechaReal ?? datos.fecha)}`,
          ],
          [{ text: origen, colSpan: 5 }, {}, {}, {}, {}],
          [{ text: resumen, colSpan: 5, bold: true }, {}, {}, {}, {}],
        ]
      },
      layout: { fillColor: (rowIndex: number) => rowIndex === 0 ? '#DDDDDD' : null },
    };
  }

  /**
   * Distribución por máquina de la solicitud con lo entregado hasta esta asignación (incluida); la máquina que
   * recibió esta asignación va en negrita.
   */
  private tablaMaquinasAsignacionPDF(datos: DatosPdfAsignacion): {} {
    const maquinas = datos.solicitud?.maquinas ?? [];
    const faltante = (objetivo: number, entregado: number) => Math.max(0, (Number(objetivo) || 0) - (Number(entregado) || 0));
    const celda = (text: string, bold: boolean, alignment = 'right') => ({ text, bold, alignment });
    const total = maquinas.reduce((t, m) => ({
      porcentaje: t.porcentaje + (Number(m.porcentaje) || 0),
      objetivo: t.objetivo + (Number(m.objetivo) || 0),
      entregado: t.entregado + (Number(m.entregado) || 0),
      faltante: t.faltante + faltante(m.objetivo, m.entregado),
    }), { porcentaje: 0, objetivo: 0, entregado: 0, faltante: 0 });

    return {
      margin: [0, 15, 0, 0],
      fontSize: 8,
      table: {
        headerRows: 2,
        keepWithHeaderRows: 1,
        dontBreakRows: true,
        widths: ['*', 75, 75, 75, 75],
        body: [
          [{ text: 'Distribución por máquina (hasta esta asignación)', colSpan: 5, alignment: 'center', fontSize: 10, bold: true }, {}, {}, {}, {}],
          ['Máquina', 'Porcentaje', 'Kg solicitados', 'Kg entregados', 'Kg faltantes'],
          ...maquinas.map(m => {
            const esta = Number(m.maquina) === Number(datos.maquina);
            return [
              celda(`${m.maquina}${esta ? '  (esta asignación)' : ''}`, esta, 'left'),
              celda(`${this.cantidadPDF(m.porcentaje)} %`, esta),
              celda(this.cantidadPDF(m.objetivo), esta),
              celda(this.cantidadPDF(m.entregado), esta),
              celda(this.cantidadPDF(faltante(m.objetivo, m.entregado)), esta),
            ];
          }),
          [
            celda('Total', true),
            celda(`${this.cantidadPDF(total.porcentaje)} %`, true),
            celda(this.cantidadPDF(total.objetivo), true),
            celda(this.cantidadPDF(total.entregado), true),
            celda(this.cantidadPDF(total.faltante), true),
          ],
        ]
      },
      layout: this.layoutEncabezadoAsignacion,
    };
  }

  /**
   * Subcategorías (en negrita, con el Id junto al nombre) y debajo, con sangría, los materiales de esta asignación.
   * Con solicitud: Solicitada, Entregada antes, Esta asignación y Faltante (después de esta). Manual: solo la cantidad.
   * Al final, un total por cada unidad de medida.
   */
  private tablaSubcategoriasAsignacionPDF(subcategorias: SubcategoriaAsignadaPdf[], conSolicitud: boolean): {} {
    const numero = (valor: number, extra: {} = {}) => ({ text: this.cantidadPDF(valor), alignment: 'right', ...extra });
    const nombreSubcategoria = (s: SubcategoriaAsignadaPdf) => Number(s.subCatMP_Id) > 0 ? `${s.subCatMP_Id} - ${s.nombre}` : s.nombre;
    const totales = new Map<string, { solicitado: number; antes: number; esta: number; faltante: number }>();
    const filas: any[][] = [];

    subcategorias.forEach(s => {
      const total = totales.get(s.undMed_Id) ?? { solicitado: 0, antes: 0, esta: 0, faltante: 0 };
      total.solicitado += Number(s.solicitado) || 0;
      total.antes += Number(s.entregadoAntes) || 0;
      total.esta += Number(s.estaAsignacion) || 0;
      total.faltante += Number(s.faltante) || 0;
      totales.set(s.undMed_Id, total);

      const negrita = { bold: true };
      filas.push(conSolicitud
        ? [{ text: nombreSubcategoria(s), bold: true }, numero(s.solicitado, negrita), numero(s.entregadoAntes, negrita), numero(s.estaAsignacion, negrita), numero(s.faltante, negrita), { text: s.undMed_Id, bold: true }]
        : [{ text: nombreSubcategoria(s), bold: true }, numero(s.estaAsignacion, negrita), { text: s.undMed_Id, bold: true }]);

      // Subcategoría pedida sin materiales (solicitudes anteriores) o no pedida: sus materiales no tienen cantidad solicitada propia.
      const sinSolicitadoPorMaterial = (s.materiales ?? []).every(m => !m.esSustituto && !((Number(m.solicitado) || 0) > 0));
      (s.materiales ?? []).forEach(m => {
        const solicitado = Number(m.solicitado) || 0;
        const antes = Number(m.entregadoAntes) || 0;
        const esta = Number(m.estaAsignacion) || 0;
        const estilo = m.esSustituto ? { italics: true } : {};
        const nombre = { text: `${m.materialId} - ${(m.nombre || '').trim()}${m.esSustituto ? ' (sustituto)' : ''}`, margin: [12, 0, 0, 0], ...estilo };
        const vacio = { text: '' };
        filas.push(conSolicitud
          ? [
            nombre,
            sinSolicitadoPorMaterial ? vacio : numero(solicitado, estilo),
            numero(antes, estilo),
            numero(esta, estilo),
            sinSolicitadoPorMaterial ? vacio : numero(Math.max(0, solicitado - antes - esta), estilo),
            { text: m.undMed_Id, ...estilo },
          ]
          : [nombre, numero(esta, estilo), { text: m.undMed_Id, ...estilo }]);
      });
    });

    const filasTotales = Array.from(totales.entries()).map(([medida, total]) => conSolicitud
      ? [{ text: `Total ${medida}`, bold: true, alignment: 'right' }, numero(total.solicitado, { bold: true }), numero(total.antes, { bold: true }), numero(total.esta, { bold: true }), numero(total.faltante, { bold: true }), { text: medida, bold: true }]
      : [{ text: `Peso Total ${medida}`, bold: true, alignment: 'right' }, numero(total.esta, { bold: true }), { text: medida, bold: true }]);

    const columnas = conSolicitud
      ? ['Subcategoría / Material', 'Solicitada', 'Entregada antes', 'Esta asignación', 'Faltante', 'Medida']
      : ['Subcategoría / Material', 'Cantidad', 'Medida'];
    const titulo = { text: 'Subcategorías y materiales asignados', colSpan: columnas.length, alignment: 'center', fontSize: 10, bold: true };

    return {
      margin: [0, 15, 0, 0],
      fontSize: 8,
      table: {
        headerRows: 2,
        keepWithHeaderRows: 1,
        dontBreakRows: true,
        widths: conSolicitud ? ['*', 60, 60, 60, 60, 40] : ['*', 80, 50],
        body: [
          [titulo, ...columnas.slice(1).map(() => ({}))],
          columnas,
          ...filas,
          ...filasTotales,
        ]
      },
      layout: this.layoutEncabezadoAsignacion,
    };
  }

  /**
   * Genera en un solo PDF todas las asignaciones de una solicitud: una sección por asignación, cada una empieza
   * en hoja nueva. Cada hoja lleva la misma cabecera que el PDF individual de su asignación.
   * @param lotes Datos de `Asignacion_MatPrima/{id}/pdf` de cada asignación.
   * @param solicitud Número de la solicitud.
   * @param ot Número de la OT.
   */
  generarBlobAsignacionesSolicitud(lotes: DatosPdfAsignacion[], solicitud: number, ot: number): Observable<Blob> {
    const ID_SECCION = 'seccion-asignacion-';
    /** Hoja en la que empieza cada sección: la registra la primera pasada y la usa la segunda para las cabeceras. */
    const conDatos = lotes.filter(datos => (datos.subcategorias ?? []).length > 0);
    const hojaInicio: number[] = conDatos.map((_, i) => i + 1);
    return this.generarBlobPDF(() => {
      // Cada sección es el mismo contenido (y la misma cabecera) que el PDF individual de la asignación.
      const secciones = conDatos.map(datos => this.contenidoAsignacionMaterialPDF(datos));
      // El id va en el primer bloque de la sección (no en el que lleva el salto de hoja: pdfmake no consulta esos nodos).
      const content = secciones.map((seccion, i) => ({
        stack: seccion.content.map((bloque, j) => j === 0 ? { ...bloque, id: `${ID_SECCION}${i}` } : bloque),
        pageBreak: i > 0 ? 'before' : undefined,
      }));
      return {
        titulo: secciones[0]?.titulo ?? `Asignaciones de la Solicitud N° ${solicitud}\nOrden de Trabajo N° ${ot}`,
        tituloPestana: `Asignaciones Solicitud MP #${solicitud}`,
        content,
        pageBreakBefore: (nodo: any) => {
          const id: string = nodo?.id ?? '';
          if (id.startsWith(ID_SECCION) && nodo.startPosition?.pageNumber) hojaInicio[Number(id.slice(ID_SECCION.length))] = nodo.startPosition.pageNumber;
          return false; // Solo se registra la hoja; los saltos ya los define cada sección.
        },
        tituloPorPagina: (pagina: number) => {
          let indice = 0;
          hojaInicio.forEach((inicio, i) => { if (inicio <= pagina) indice = i; });
          return secciones[indice]?.titulo ?? '';
        },
      };
    });
  }

  /** Id y nombre del material de la fila según el tipo de movimiento. */
  private materialAsignadoPDF(dato: any): { id: any; nombre: string } {
    switch (dato.movimiento) {
      case 'ASIGTINTAS': return { id: dato.tinta_Id, nombre: dato.tinta };
      case 'ASIGMP': return { id: dato.materia_Prima_Id, nombre: dato.materia_Prima };
      default: return { id: dato.bopp_Id, nombre: dato.bopp };
    }
  }

  /** Datos generales de la asignación. */
  private infoAsignacionPDF(asignacion: any): {} {
    return {
      fontSize: 8,
      table: {
        widths: ['15%', '30%', '15%', '20%', '20%'],
        body: [
          [{ text: 'Información General del Movimiento', colSpan: 5, alignment: 'center', fontSize: 10, bold: true }, {}, {}, {}, {}],
          [
            `OT N°: ${asignacion.codigo}`,
            `Usuario: ${asignacion.usuario ?? ''}`,
            `Máquina: ${asignacion.maquina || ''}`,
            `Fecha Registro: ${this.fechaPDF(asignacion.fecha)} ${asignacion.hora ?? ''}`,
            `Fecha Asignación: ${this.fechaPDF(asignacion.fechaReal ?? asignacion.fecha)}`,
          ],
        ]
      },
      layout: { fillColor: (rowIndex: number) => rowIndex === 0 ? '#DDDDDD' : null },
    };
  }

  /** Materiales asignados con un peso total por cada unidad de medida. */
  private tablaMaterialesAsignadosPDF(movimiento: string, materiales: { id: any; nombre: string; cantidad: number; medida: string }[]): {} {
    const tituloTabla = movimiento === 'ASIGTINTAS' ? 'Información detallada de Tintas'
      : movimiento === 'ASIGMP' ? 'Información detallada de Materias Primas'
      : 'Información detallada de Biorientados';

    const totales = new Map<string, number>();
    materiales.forEach(m => totales.set(m.medida, (totales.get(m.medida) ?? 0) + m.cantidad));

    return {
      margin: [0, 15, 0, 0],
      fontSize: 8,
      table: {
        headerRows: 2,
        widths: ['12%', '*', '18%', '15%'],
        body: [
          [{ text: tituloTabla, colSpan: 4, alignment: 'center', fontSize: 10, bold: true }, {}, {}, {}],
          ['Id', 'Nombre', 'Cantidad', 'Presentación'],
          ...materiales.map(m => [m.id, m.nombre, this.cantidadPDF(m.cantidad), m.medida]),
          ...Array.from(totales.entries()).map(([medida, total]) => [
            { text: `Peso Total ${medida}`, colSpan: 2, bold: true, alignment: 'right' }, {},
            { text: this.cantidadPDF(total), bold: true },
            { text: medida, bold: true },
          ]),
        ]
      },
      layout: { fillColor: (rowIndex: number) => rowIndex === 0 || rowIndex === 1 ? '#CCCCCC' : null },
    };
  }

  /** Observación de la asignación. */
  private observacionAsignacionPDF(observacion: string): {} {
    return {
      margin: [0, 20],
      fontSize: 9,
      table: {
        widths: ['*'],
        body: [
          [{ border: [true, true, true, false], text: 'Observación: ' }],
          [{ border: [true, false, true, true], text: observacion ? observacion.toString().toUpperCase().trim() : '' }],
        ]
      },
    };
  }

  // ===================================================================== ORDEN DE TRABAJO
  // Formato PDF de la Orden de Trabajo, compartido por la página Orden de Trabajo y Solicitud de Material de Producción.

  /**
   * Consulta los datos de la OT para el PDF: primero en Plasticaribe y, si no está, en BagPro.
   * @param ot Número de la orden de trabajo.
   * @returns La primera fila de la OT, o null si la consulta no trae filas. Falla si no existe en ninguno.
   */
  obtenerDatosOrdenTrabajo(ot: number): Observable<any | null> {
    return this.ordenTrabajoService.GetOrdenTrabajo(ot, '').pipe(
      catchError(() => this.bagProService.GetOrdenTrabajo(ot)),
      map((datos: any) => (Array.isArray(datos) ? datos[0] : datos) ?? null),
    );
  }

  /**
   * Arma el documento PDF de la OT (sin abrirlo ni descargarlo).
   * @param datos_ot Fila de la OT devuelta por Plasticaribe o BagPro.
   * @param usuario Nombre que se muestra en el pie como quien generó el documento.
   */
  crearPdfOrdenTrabajo(datos_ot: any, usuario: string) {
    const pdfDefinicion: any = {
      info: { title: `OT ${datos_ot.numero_Orden}` }, // Título que muestra la pestaña del navegador al abrir el PDF
      pageSize: { width: 630, height: 760 },
      watermark: { text: 'PLASTICARIBE SAS', color: 'red', opacity: 0.03, bold: true, italics: false },
      pageMargins: [25, 190, 25, 35],
      header: this.headerPDFOT(datos_ot),
      footer: this.footerPDFOT(usuario),
      content: this.contentPDFOT(datos_ot),
      styles: this.stylesPDFOT()
    };
    return pdfMake.createPdf(pdfDefinicion);
  }

  /**
   * Genera el PDF de la OT como archivo en memoria, para abrirlo o descargarlo cuando convenga
   * (p. ej. después de mostrar un aviso).
   * @param datos_ot Fila de la OT devuelta por Plasticaribe o BagPro.
   * @param usuario Nombre que se muestra en el pie como quien generó el documento.
   */
  generarBlobOrdenTrabajo(datos_ot: any, usuario: string): Observable<Blob> {
    return new Observable<Blob>(suscriptor => {
      try {
        this.crearPdfOrdenTrabajo(datos_ot, usuario).getBlob((blob: Blob) => {
          suscriptor.next(blob);
          suscriptor.complete();
        });
      } catch (error) {
        suscriptor.error(error);
      }
    });
  }

  private formatonumerosOT =(number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  /**
   * Convierte un valor posiblemente nulo en texto sin espacios sobrantes para el PDF.
   * @param valor Valor recibido de la API (las OT de BagPro o antiguas pueden traer nulos).
   * @param porDefecto Texto que se usa cuando el valor es nulo o indefinido.
   * @returns Texto limpio o el valor por defecto.
   */
  private txtOT(valor: any, porDefecto: string = ''): string {
    return valor == null ? porDefecto : valor.toString().trim();
  }

  /**
   * Formatea un número para el PDF con separador de miles y los decimales indicados.
   * Los valores nulos o no numéricos se muestran como 0.
   * @param valor Valor recibido de la API.
   * @param decimales Cantidad de decimales a mostrar.
   * @returns Número formateado como texto.
   */
  private numOT(valor: any, decimales: number = 2): string {
    const numero = Number(valor);
    return this.formatonumerosOT((Number.isFinite(numero) ? numero : 0).toFixed(decimales));
  }

  // Funcion que va a crear el header del PDF
  private headerPDFOT(datos_ot) {
    return [
      {
        margin: [25, 5],
        columns: this.informacionEmpresaHeaderOT(datos_ot)
      },
      {
        margin: [25, 5],
        style: 'tablaEmpresa',
        table: this.informacionClienteItemHeaderOT(datos_ot),
        layout: { defaultBorder: false, },
        fontSize: 9,
      },
      '\n',
      {
        margin: [25, 5],
        table: this.informacaionExtrusionHeaderOT(datos_ot),
        layout: { defaultBorder: false, },
        fontSize: 9,
      },
    ];
  }

  // Funcion que va a colocar la información de la empresa en el header
  private informacionEmpresaHeaderOT(datos_ot) {
    return [
      // El logo empieza en el borde izquierdo de las tablas del encabezado
      { image: logoNuevoParaPdf, width: 170, fit: [170, 30], margin: [0, 10, 0, 5] },
      {
        text: `OT ${datos_ot.numero_Orden}`,
        style: 'orden_trabajo',
        alignment: 'right',
        margin: [0, 10, 10, 0],
      },
    ]
  }

  // Funaion que va a colocar la informacion del cliente y del item en el header
  private informacionClienteItemHeaderOT(datos_ot) {
    return {
      widths: ['10%', '40%', '12%', '38%'],
      style: 'header',
      body: [
        [
          { border: [true, true, false, false], text: `Id Cliente`, style: 'titulo', },
          { border: [false, true, false, false], text: `${this.txtOT(datos_ot.id_SedeCliente)}` },
          { border: [true, true, false, false], text: `Item`, style: 'titulo', },
          { border: [false, true, true, false], text: `${this.txtOT(datos_ot.id_Producto)}` },
        ],
        [
          { border: [true, false, false, true], text: `Cliente`, style: 'titulo', },
          { border: [false, false, true, true], text: `${this.txtOT(datos_ot.cliente)}` },
          { border: [false, false, false, true], text: `Referencia`, style: 'titulo', },
          { border: [false, false, true, true], text: `${this.txtOT(datos_ot.producto)}` },
        ],
      ]
    }
  }

  // Funcion que va a colocar informacion general de la extrusion en el header
  private informacaionExtrusionHeaderOT(datos_ot) {
    return {
      widths: ['*', '*', '*', '*', '*', '*'],
      body: [
        [
          { text: `Fecha Creación`, style: 'titulosTablas', border: [true, true, false, true] },
          { text: `Material`, style: 'titulosTablas', border: [false, true, false, true] },
          { text: `Cant. Bolsas`, style: 'titulosTablas', border: [false, true, false, true] },
          { text: `Cant. Kilos (Kg)`, style: 'titulosTablas', border: [false, true, false, true] },
          { text: `Presentación`, style: 'titulosTablas', border: [false, true, false, true] },
          { text: `Fecha Entrega`, style: 'titulosTablas', border: [false, true, true, true] },
        ],
        [
          // Solo la fecha (yyyy-MM-dd): Plasticaribe y BagPro la envían con hora
          { text: `${datos_ot.fecha_Creacion ? `${datos_ot.fecha_Creacion}`.substring(0, 10) : ''}`, style: 'datosTablaExtrusion' },
          { text: `${this.txtOT(datos_ot.material)}`, style: 'datosTablaExtrusion' },
          { text: `${this.numOT(datos_ot.cantidad_Pedida)}`, style: 'datosTablaExtrusion' },
          { text: `${this.numOT(datos_ot.peso_Neto)}`, style: 'datosTablaExtrusion' },
          { text: `${this.txtOT(datos_ot.presentacion)}`, style: 'datosTablaExtrusion' },
          { text: `${datos_ot.fecha_Entrega ? datos_ot.fecha_Entrega.replace('T00:00:00', '') : ''}`, style: 'datosTablaExtrusion' },
        ]
      ]
    };
  }

  // Funcion que va a crear el contenido del PDF
  private contentPDFOT(datos_ot) {
    let data: any = [];
    data.push(this.hoja1ContentPDFOT(datos_ot));
    data.push(this.hoja2ContentPDFOT(datos_ot));
    // if (this.impresion) data.push(this.hoja2ContentPDFOT(datos_ot));
    // if (this.sellado) data.push(this.hoja2ContentPDFOT(datos_ot));
    return data;
  }

  // Funcion que va a crear la hoja 1 del PDF
  private hoja1ContentPDFOT(datos_ot) {
    let data: any[] = [];
    data.push(
      this.tituloMezclasOT(datos_ot),
      '\n',
      this.datosMezclasOT(datos_ot),
      '\n\n',
      this.tituloExtrusionOT(),
      this.datosExtrusionOT(datos_ot),
      '\n',
      this.observacionOT(datos_ot),
    )
    return data;
  }

  /**
   * Fila de la observación general de la OT (Ot_Observacion) para las tablas de observaciones por proceso.
   * Se mantiene en la hoja 1 y en la hoja 2 mientras se termina de salir de BagPro, y solo si tiene texto.
   * @param datos_ot Datos de la orden de trabajo consultada.
   * @returns Arreglo con la fila de la observación general, o vacío si no tiene texto.
   */
  private filaObservacionGeneralPDFOT(datos_ot): { proceso: string, texto: string }[] {
    const texto = this.textoObservacionPDFOT(datos_ot?.observacion);
    return texto == '' ? [] : [{ proceso: `General`, texto }];
  }

  // Funcion que va a colocar el nombre de la mezcla que tiene el item
  private tituloMezclasOT(datos_ot) {
    return {
      table: {
        widths: ['*'],
        body: [
          [{ text: this.txtOT(datos_ot.mezcla_Nombre) == '' ? 'MATERIA PRIMA' : this.txtOT(datos_ot.mezcla_Nombre), style: 'titulosTablas' }]
        ]
      },
      fontSize: 9,
    }
  }

  // Funcion que va a colocar la información de la mezcla
  private datosMezclasOT(datos_ot) {
    let validacion: boolean = Math.max(...[
      this.txtOT(datos_ot.m1C1_nombre).length,
      this.txtOT(datos_ot.m2C1_nombre).length,
      this.txtOT(datos_ot.m3C1_nombre).length,
      this.txtOT(datos_ot.m4C1_nombre).length,
      this.txtOT(datos_ot.p1C1_Nombre).replace('PIGMENTO', 'PIG.').length,
      this.txtOT(datos_ot.p2C1_Nombre).replace('PIGMENTO', 'PIG.').length
    ]) > 20;

    return {
      columns: [
        this.columna1MezclaOT(datos_ot, validacion),
        this.columna2MezclaOT(datos_ot, validacion),
        this.columna3MezclaOT(datos_ot, validacion),
      ],
      fontSize: 9,
      columnGap: 10
    }
  }

  // Funcion que va a colocar la información de la mezcla en la capa 1
  private columna1MezclaOT(datos_ot, validacion) {
    return {
      width: datos_ot.mezcla_PorcentajeCapa1 == 0 ? '*' : validacion ? 'auto' : '*',
      table: {
        widths: [40, '*', 'auto'],
        heights: (row) => (row) * 3,
        body: [
          [
            { colSpan: 3, text: `CAPA UNICA`, alignment: 'center', style: 'titulosTablas' },
            {},
            {}
          ],
          [
            { border: [true, false, false, false], text: `(%) Capa:` },
            { border: [], text: `${datos_ot.mezcla_PorcentajeCapa1 ?? 0}%` },
            { border: [false, false, true, false], text: `` }
          ],
          [
            { border: [true, false, false, false], text: `Mat. 1:` },
            { border: [], text: `${datos_ot.m1C1_nombre == 'NO APLICA MATERIAL' ? 'N/A' : this.txtOT(datos_ot.m1C1_nombre)}` },
            { border: [false, false, true, false], text: `${datos_ot.mezcla_PorcentajeMaterial1_Capa1 ?? 0}%` }
          ],
          [
            { border: [true, false, false, false], text: `Mat. 2:` },
            { border: [], text: `${datos_ot.m2C1_nombre == 'NO APLICA MATERIAL' ? 'N/A' : this.txtOT(datos_ot.m2C1_nombre)}` },
            { border: [false, false, true, false], text: `${datos_ot.mezcla_PorcentajeMaterial2_Capa1 ?? 0}%` }
          ],
          [
            { border: [true, false, false, false], text: `Mat. 3:` },
            { border: [], text: `${datos_ot.m3C1_nombre == 'NO APLICA MATERIAL' ? 'N/A' : this.txtOT(datos_ot.m3C1_nombre)}` },
            { border: [false, false, true, false], text: `${datos_ot.mezcla_PorcentajeMaterial3_Capa1 ?? 0}%` }
          ],
          [
            { border: [true, false, false, false], text: `Mat. 4:` },
            { border: [], text: `${datos_ot.m4C1_nombre == 'NO APLICA MATERIAL' ? 'N/A' : this.txtOT(datos_ot.m4C1_nombre)}` },
            { border: [false, false, true, false], text: `${datos_ot.mezcla_PorcentajeMaterial4_Capa1 ?? 0}%` }
          ],
          [
            { border: [true, false, false, false], text: `Pig. 1:` },
            { border: [], text: `${datos_ot.p1C1_Nombre == 'NO APLICA PIGMENTO' ? 'N/A' : this.txtOT(datos_ot.p1C1_Nombre).replace('PIGMENTO', 'PIG.')}` },
            { border: [false, false, true, false], text: `${datos_ot.mezcla_PorcentajePigmto1_Capa1 ?? 0}%` }
          ],
          [
            { border: [true, false, false, true], text: `Pig. 2:` },
            { border: [false, false, false, true], text: `${datos_ot.p2C1_Nombre == 'NO APLICA PIGMENTO' ? 'N/A' : this.txtOT(datos_ot.p2C1_Nombre).replace('PIGMENTO', 'PIG.')}` },
            { border: [false, false, true, true], text: `${datos_ot.mezcla_PorcentajePigmto2_Capa1 ?? 0}%` }
          ],
        ]
      }
    }
  }

  // Funcion que va a colocar la información de la mezcla en la capa 2
  private columna2MezclaOT(datos_ot, validacion) {
    return {
      width: datos_ot.mezcla_PorcentajeCapa1 == 0 ? '*' : validacion ? 'auto' : '*',
      table: {
        widths: [40, '*', 'auto'],
        heights: (row) => (row) * 3,
        body: [
          [
            { colSpan: 3, text: `CAPA INTERNA`, alignment: 'center', style: 'titulosTablas', },
            {},
            {}
          ],
          [
            { border: [true, false, false, false], text: `(%) Capa:` },
            { border: [], text: `${datos_ot.mezcla_PorcentajeCapa2 ?? 0}%` },
            { border: [false, false, true, false], text: `` }
          ],
          [
            { border: [true, false, false, false], text: `Mat. 1:` },
            { border: [], text: `${datos_ot.m1C2_nombre == 'NO APLICA MATERIAL' ? 'N/A' : this.txtOT(datos_ot.m1C2_nombre)}` },
            { border: [false, false, true, false], text: `${datos_ot.mezcla_PorcentajeMaterial1_Capa2 ?? 0}%` }
          ],
          [
            { border: [true, false, false, false], text: `Mat. 2:` },
            { border: [], text: `${datos_ot.m2C2_nombre == 'NO APLICA MATERIAL' ? 'N/A' : this.txtOT(datos_ot.m2C2_nombre)}` },
            { border: [false, false, true, false], text: `${datos_ot.mezcla_PorcentajeMaterial2_Capa2 ?? 0}%` }
          ],
          [
            { border: [true, false, false, false], text: `Mat. 3:` },
            { border: [], text: `${datos_ot.m3C2_nombre == 'NO APLICA MATERIAL' ? 'N/A' : this.txtOT(datos_ot.m3C2_nombre)}` },
            { border: [false, false, true, false], text: `${datos_ot.mezcla_PorcentajeMaterial3_Capa2 ?? 0}%` }
          ],
          [
            { border: [true, false, false, false], text: `Mat. 4:` },
            { border: [], text: `${datos_ot.m4C2_nombre == 'NO APLICA MATERIAL' ? 'N/A' : this.txtOT(datos_ot.m4C2_nombre)}` },
            { border: [false, false, true, false], text: `${datos_ot.mezcla_PorcentajeMaterial4_Capa2 ?? 0}%` }
          ],
          [
            { border: [true, false, false, false], text: `Pig. 1:` },
            { border: [], text: `${datos_ot.p1C2_Nombre == 'NO APLICA PIGMENTO' ? 'N/A' : this.txtOT(datos_ot.p1C2_Nombre).replace('PIGMENTO', 'PIG.')}` },
            { border: [false, false, true, false], text: `${datos_ot.mezcla_PorcentajePigmto1_Capa2 ?? 0}%` }
          ],
          [
            { border: [true, false, false, true], text: `Pig. 2:` },
            { border: [false, false, false, true], text: `${datos_ot.p2C2_Nombre == 'NO APLICA PIGMENTO' ? 'N/A' : this.txtOT(datos_ot.p2C2_Nombre).replace('PIGMENTO', 'PIG.')}` },
            { border: [false, false, true, true], text: `${datos_ot.mezcla_PorcentajePigmto2_Capa2 ?? 0}%` }
          ],
        ]
      }
    }
  }

  // Funcion que va a colocar la información de la mezcla en la capa 3
  private columna3MezclaOT(datos_ot, validacion) {
    return {
      width: datos_ot.mezcla_PorcentajeCapa1 == 0 ? '*' : validacion ? 'auto' : '*',
      table: {
        widths: [40, '*', 'auto'],
        heights: (row) => (row) * 3,
        body: [
          [
            { colSpan: 3, text: `CAPA EXTERNA`, alignment: 'center', style: 'titulosTablas', },
            {},
            {}
          ],
          [
            { border: [true, false, false, false], text: `(%) Capa: ` },
            { border: [], text: `${datos_ot.mezcla_PorcentajeCapa3 ?? 0}%` },
            { border: [false, false, true, false], text: `` }
          ],
          [
            { border: [true, false, false, false], text: `Mat. 1:` },
            { border: [], text: `${datos_ot.m1C3_nombre == 'NO APLICA MATERIAL' ? 'N/A' : this.txtOT(datos_ot.m1C3_nombre)}` },
            { border: [false, false, true, false], text: `${datos_ot.mezcla_PorcentajeMaterial1_Capa3 ?? 0}%` }
          ],
          [
            { border: [true, false, false, false], text: `Mat. 2:` },
            { border: [], text: `${datos_ot.m2C3_nombre == 'NO APLICA MATERIAL' ? 'N/A' : this.txtOT(datos_ot.m2C3_nombre)}` },
            { border: [false, false, true, false], text: `${datos_ot.mezcla_PorcentajeMaterial2_Capa3 ?? 0}%` }
          ],
          [
            { border: [true, false, false, false], text: `Mat. 3:` },
            { border: [], text: `${datos_ot.m3C3_nombre == 'NO APLICA MATERIAL' ? 'N/A' : this.txtOT(datos_ot.m3C3_nombre)}` },
            { border: [false, false, true, false], text: `${datos_ot.mezcla_PorcentajeMaterial3_Capa3 ?? 0}%` }
          ],
          [
            { border: [true, false, false, false], text: `Mat. 4:` },
            { border: [], text: `${datos_ot.m4C3_nombre == 'NO APLICA MATERIAL' ? 'N/A' : this.txtOT(datos_ot.m4C3_nombre)}` },
            { border: [false, false, true, false], text: `${datos_ot.mezcla_PorcentajeMaterial4_Capa3 ?? 0}%` }
          ],
          [
            { border: [true, false, false, false], text: `Pig. 1:` },
            { border: [], text: `${datos_ot.p1C3_Nombre == 'NO APLICA PIGMENTO' ? 'N/A' : this.txtOT(datos_ot.p1C3_Nombre).replace('PIGMENTO', 'PIG.')}` },
            { border: [false, false, true, false], text: `${datos_ot.mezcla_PorcentajePigmto1_Capa3 ?? 0}%` }
          ],
          [
            { border: [true, false, false, true], text: `Pig. 2:` },
            { border: [false, false, false, true], text: `${datos_ot.p2C3_Nombre == 'NO APLICA PIGMENTO' ? 'N/A' : this.txtOT(datos_ot.p2C3_Nombre).replace('PIGMENTO', 'PIG.')}` },
            { border: [false, false, true, true], text: `${datos_ot.mezcla_PorcentajePigmto2_Capa3 ?? 0}%` }
          ],
        ]
      }
    }
  }

  // Funcion que va a colocar 'EXTRUSIÓN' en la hoja 1
  private tituloExtrusionOT() {
    return {
      table: {
        widths: ['*'],
        body: [
          [{ text: `EXTRUSIÓN`, style: 'titulosTablas' }]
        ]
      }
    };
  }

  /**
   * Devuelve el texto de grafilado a mostrar en el PDF de la OT.
   * @param grafilado Valor de grafilado de extrusión (puede no venir si la OT se consultó desde BagPro).
   * @returns 'SÍ' si es verdadero, 'NO' si es falso y 'NO APLICA' si no hay valor.
   */
  private textoGrafiladoPDFOT(grafilado: boolean | null | undefined): string {
    if (grafilado === true) return 'SÍ';
    if (grafilado === false) return 'NO';
    return 'NO APLICA';
  }

  /**
   * Coloca en la hoja 1 la tabla con la información de extrusión, incluido el grafilado a la derecha de tratado.
   * @param datos_ot Datos de la orden de trabajo consultada.
   * @returns Nodo pdfmake con la tabla de extrusión.
   */
  private datosExtrusionOT(datos_ot) {
    return {
      table: {
        widths: [60, 60, '*', 40, 55, 55, 50, 55],
        body: [
          [
            { text: `Pigmento`, style: 'subtituloTablas' },
            { text: `Formato`, style: 'subtituloTablas' },
            { text: `Ancho`, style: 'subtituloTablas' },
            { text: `Und Medida`, style: 'subtituloTablas' },
            { text: `Calibre`, style: 'subtituloTablas' },
            { text: `Peso MT \n(Min/Max)`, style: 'subtituloTablas' },
            { text: `Tratado`, style: 'subtituloTablas' },
            { text: `Grafilado`, style: 'subtituloTablas' }
          ],
          [{}, {}, {}, {}, {}, {}, {}, {}],
          [
            { border: [false, false, false, false], text: `${this.txtOT(datos_ot.pigmento_Extrusion)}`, alignment: 'center', },
            { border: [false, false, false, false], text: `${this.txtOT(datos_ot.formato_Extrusin)}`, alignment: 'center', },
            { border: [false, false, false, false], text: `${this.numOT(datos_ot.ancho1_Extrusion)}   +   ${this.numOT(datos_ot.ancho2_Extrusion)}   +   ${this.numOT(datos_ot.ancho3_Extrusion)}`, alignment: 'center', },
            { border: [false, false, false, false], text: `${this.txtOT(datos_ot.und_Extrusion)}`, alignment: 'center', },
            { border: [false, false, false, false], text: `${this.numOT(datos_ot.calibre_Extrusion)}`, alignment: 'center', },
            { border: [false, false, false, false], text: `${this.numOT(datos_ot.peso_Extrusion)}`, alignment: 'center', },
            { border: [false, false, false, false], text: `${this.txtOT(datos_ot.tratado)}`, alignment: 'center', },
            { border: [false, false, false, false], text: `${this.textoGrafiladoPDFOT(datos_ot.extrusion_Grafilado)}`, alignment: 'center', }
          ]
        ]
      },
      layout: { defaultBorder: false, },
      fontSize: 9,
    }
  }

  /**
   * Tabla de observaciones por proceso de la hoja 1: la observación general (si tiene texto) y luego la de extrusión.
   * La fila de extrusión se muestra siempre, como antes.
   * @param datos_ot Datos de la orden de trabajo consultada.
   * @returns Nodo pdfmake con la tabla de observaciones de la hoja 1.
   */
  private observacionOT(datos_ot) {
    return this.tablaObservacionesPDFOT([
      ...this.filaObservacionGeneralPDFOT(datos_ot),
      { proceso: `Extrusión`, texto: this.textoObservacionPDFOT(datos_ot.extrusion_Observacion) },
    ]);
  }

  /**
   * Arma el contenido de la hoja 2: procesos, cyrel y, al final, la tabla de observaciones por proceso.
   * Si la OT no lleva cyrel se omite su separador para que la tabla de observaciones quede más arriba.
   * @param datos_ot Datos de la orden de trabajo consultada.
   * @returns Arreglo de nodos pdfmake de la hoja 2.
   */
  private hoja2ContentPDFOT(datos_ot) {
    let data: any[] = [];
    const llevaCyrel: boolean = datos_ot.cyrel == true || datos_ot.cyrel == '1';
    const observaciones = this.observacionesPorProcesoPDFOT(datos_ot);
    data.push(this.procesosHoja2OT(datos_ot));
    if (llevaCyrel) data.push('\n', this.cyrelPDFOT(datos_ot));
    if (observaciones) data.push('\n', observaciones);
    return data;
  }

  /**
   * Coloca en la hoja 2 las tablas de cada proceso. El margen superior negativo acerca la primera fila
   * a la tabla del encabezado para reducir el espacio que deja el margen superior de la página.
   * El margen inferior separa estas tablas de los encabezados de lo que sigue (Cyrel / observaciones).
   * @param datos_ot Datos de la orden de trabajo consultada.
   * @returns Nodo pdfmake con las tablas de los procesos.
   */
  private procesosHoja2OT(datos_ot) {
    return {
      pageBreak: 'before',
      margin: [0, -18, 0, 10],
      table: {
        widths: ['*', 20, '*'],
        body: [
          [this.procesoExtrusionOT(datos_ot), {}, this.procesoLaminadoOT(datos_ot)],
          [{}, {}, {}],
          [this.procesoImpresionOT(datos_ot), {}, this.productoTermiandoOT(datos_ot),]
        ]
      },
      layout: { defaultBorder: false, },
      fontSize: 9,
    }
  }

  /**
   * Coloca en la hoja 2 la información del proceso de extrusión, con el grafilado debajo de tratado caras.
   * @param datos_ot Datos de la orden de trabajo consultada.
   * @returns Nodo pdfmake con la tabla del proceso de extrusión.
   */
  private procesoExtrusionOT(datos_ot) {
    return {
      table: {
        widths: ['*', '*', '*'],
        body: [
          [
            { colSpan: 3, text: `EXTRUSIÓN`, style: 'titulosTablas', border: [true, true, true, true] },
            {},
            {}
          ],
          [
            { text: `Pigmento: `, style: 'subtitulo' },
            { text: `${this.txtOT(datos_ot.pigmento_Extrusion)}` },
            {}
          ],
          [
            { text: `Formato: `, style: 'subtitulo' },
            { text: `${this.txtOT(datos_ot.formato_Extrusin)}` },
            {}
          ],
          [
            { text: `Calibre: `, style: 'subtitulo' },
            { text: `${this.numOT(datos_ot.calibre_Extrusion)}` },
            {}
          ],
          [
            { text: `Unidad Medida: `, style: 'subtitulo' },
            { text: `${this.txtOT(datos_ot.und_Extrusion)}` },
            {}
          ],
          [
            { text: `ANCHO`, style: 'subtitulo' },
            { text: `${this.numOT(datos_ot.ancho1_Extrusion)}   +   ${this.numOT(datos_ot.ancho2_Extrusion)}   +` },
            { text: `   ${this.numOT(datos_ot.ancho3_Extrusion)}` }
          ],
          [
            { text: `Peso MT (Min/Max): `, style: 'subtitulo' },
            { text: `${this.numOT(datos_ot.peso_Extrusion)}` },
            {}
          ],
          [
            { text: `Tratado Caras: `, style: 'subtitulo' },
            { text: `${this.txtOT(datos_ot.tratado)}` },
            {}
          ],
          [
            { text: `Grafilado: `, style: 'subtitulo' },
            { text: `${this.textoGrafiladoPDFOT(datos_ot.extrusion_Grafilado)}` },
            {}
          ],
        ]
      },
      layout: { defaultBorder: false, },
    }
  }

  // Función que va a colocar en la hoja 2 la información del proceso de laminado
  private procesoLaminadoOT(datos_ot) {
    return {
      table: {
        widths: ['*', '*', '*'],
        body: [
          [
            { colSpan: 3, text: `LAMINADO`, style: 'titulosTablas', border: [true, true, true, true] },
            {},
            {}
          ],
          [
            { text: `CAPA`, style: 'subtitulo' },
            { text: `CALIBRE`, style: 'subtitulo' },
            { text: `CANTIDAD`, style: 'subtitulo' }
          ],
          [
            { text: `${this.txtOT(datos_ot.laminado_Capa1)}`, },
            { text: `${this.numOT(datos_ot.calibre_Laminado_Capa1)}`, },
            { text: `${this.numOT(datos_ot.cantidad_Laminado_Capa1)}`, }
          ],
          [
            { text: `${this.txtOT(datos_ot.laminado_Capa2)}`, },
            { text: `${this.numOT(datos_ot.calibre_Laminado_Capa2)}`, },
            { text: `${this.numOT(datos_ot.cantidad_Laminado_Capa2)}`, }
          ],
          [
            { text: `${this.txtOT(datos_ot.laminado_Capa3)}`, },
            { text: `${this.numOT(datos_ot.calibre_Laminado_Capa3)}`, },
            { text: `${this.numOT(datos_ot.cantidad_Laminado_Capa3)}`, }
          ]
        ]
      },
      layout: { defaultBorder: false, },
    }
  }

  // Función que va a colocar en la hoja 2 la información del proceso de impresión
  private procesoImpresionOT(datos_ot) {
    return {
      table: {
        widths: ['*', '*'],
        body: [
          [
            { colSpan: 2, text: `IMPRESIÓN`, style: 'titulosTablas', border: [true, true, true, true] },
            {},
          ],
          [
            { text: `Tipo Impresión: `, style: 'subtitulo' },
            { text: `${this.txtOT(datos_ot.tipo_Impresion) == 'NO APLICA' ? 'FLEXOGRAFIA' : this.txtOT(datos_ot.tipo_Impresion)}` }
          ],
          [
            { text: `Rodillo N°: `, style: 'subtitulo' },
            { text: `${this.txtOT(datos_ot.rodillo)}` }
          ],
          [
            { text: `N° de Pista: `, style: 'subtitulo' },
            { text: `${this.txtOT(datos_ot.pista)}` }
          ],
          [
            { text: `Tinta 1: `, style: 'subtitulo' },
            { text: `${this.txtOT(datos_ot.tinta1)}` }
          ],
          [
            { text: `Tinta 2: `, style: 'subtitulo' },
            { text: `${this.txtOT(datos_ot.tinta2)}` }
          ],
          [
            { text: `Tinta 3: `, style: 'subtitulo' },
            { text: `${this.txtOT(datos_ot.tinta3)}` }
          ],
          [
            { text: `Tinta 4: `, style: 'subtitulo' },
            { text: `${this.txtOT(datos_ot.tinta4)}` }
          ],
          [
            { text: `Tinta 5: `, style: 'subtitulo' },
            { text: `${this.txtOT(datos_ot.tinta5)}` }
          ],
          [
            { text: `Tinta 6: `, style: 'subtitulo' },
            { text: `${this.txtOT(datos_ot.tinta6)}` }
          ],
          [
            { text: `Tinta 7: `, style: 'subtitulo' },
            { text: `${this.txtOT(datos_ot.tinta7)}` }
          ],
          [
            { text: `Tinta 8: `, style: 'subtitulo' },
            { text: `${this.txtOT(datos_ot.tinta8)}` }
          ],
        ]
      },
      layout: { defaultBorder: false, },
    }
  }

  /**
   * Coloca en la hoja 2 la información de producto terminado (sellado/corte), con la solapa al lado del fuelle.
   * @param datos_ot Datos de la orden de trabajo consultada.
   * @returns Nodo pdfmake con la tabla de producto terminado.
   */
  private productoTermiandoOT(datos_ot) {
    // Las OT que vienen de BagPro no traen la solapa, por eso se toma 0 por defecto
    const solapa: number = Number(datos_ot.selladoCorte_Solapa) || 0;
    return {
      table: {
        widths: ['*', '*', '*', '*'],
        body: [
          [
            { colSpan: 4, text: `PRODUCTO TERMINADO`, style: 'titulosTablas', border: [true, true, true, true] },
            {},
            {},
            {},
          ],
          [
            { text: `Formato Bolsa: `, style: 'subtitulo' },
            { colSpan: 2, text: `${this.txtOT(datos_ot.formato_Producto)}`, alignment: 'center', },
            {},
            { text: ``, },
          ],
          [
            { text: `Ancho`, alignment: 'center', style: 'subtitulo' },
            { text: `Largo`, alignment: 'center', style: 'subtitulo' },
            { text: `Fuelle`, alignment: 'center', style: 'subtitulo' },
            { text: `Solapa`, alignment: 'center', style: 'subtitulo' },
          ],
          [
            { text: `${this.numOT(datos_ot.selladoCorte_Ancho)}   x`, alignment: 'center', },
            { text: `${this.numOT(datos_ot.selladoCorte_Largo)}   x`, alignment: 'center', },
            { text: `${this.numOT(datos_ot.selladoCorte_Fuelle)}`, alignment: 'center', },
            { text: `${this.numOT(solapa)}   ${this.txtOT(datos_ot.und_Extrusion)}`, alignment: 'center', },
          ],
          [
            // Margen superior: separa "Sellado" de la fila de medidas (Ancho / Largo / Fuelle / Solapa)
            { text: `Sellado: `, style: 'subtitulo', margin: [0, 6, 0, 0] },
            { colSpan: 3, text: `${this.txtOT(datos_ot.tpSellados_Nombre)}`, margin: [0, 6, 0, 0] },
            {},
            {},
          ],
          [
            { text: `Margen: `, style: 'subtitulo' },
            { colSpan: 3, text: `${this.numOT(datos_ot.margen)}` },
            {},
            {},
          ],
          [
            { text: `Peso Millar: `, style: 'subtitulo' },
            { colSpan: 3, text: `${this.numOT(datos_ot.selladoCorte_PesoMillar)}` },
            {},
            {},
          ],
          [
            { text: `Cant. x Paquete: `, style: 'subtitulo' },
            { colSpan: 3, text: `${this.numOT(datos_ot.selladoCorte_CantBolsasPaquete)}` },
            {},
            {},
          ],
          [
            { text: `Cant. x Bulto: `, style: 'subtitulo' },
            { colSpan: 3, text: `${this.numOT(datos_ot.selladoCorte_CantBolsasBulto)}` },
            {},
            {},
          ]
        ]
      },
      layout: { defaultBorder: false, },
    }
  }

  // Función que va a colocar en la hoja 2 si a la orden de trabajo se le debe crear un cyrel o no
  private cyrelPDFOT(datos_ot) {
    return datos_ot.cyrel == true || datos_ot.cyrel == '1' ? {
      table: {
        margin: [15, 5],
        widths: [20, '*', 20],
        body: [
          [
            {},
            { text: `Hacer Cyrel`, style: 'titulosTablas', border: [true, true, true, true] },
            {}
          ]
        ]
      },
      layout: { defaultBorder: false, },
    } : {}
  }

  /**
   * Arma la tabla de observaciones por proceso de la hoja 2. Solo incluye las filas que tienen observación,
   * para no ocupar espacio con procesos vacíos ni desbordar el contenido a otra hoja.
   * "Producto Terminado" muestra la observación compartida de corte y sellado.
   * La observación general va en la primera fila (si tiene texto) y la de extrusión se muestra solo en la hoja 1.
   * @param datos_ot Datos de la orden de trabajo consultada.
   * @returns Nodo pdfmake con la tabla, o null si ningún proceso tiene observación.
   */
  private observacionesPorProcesoPDFOT(datos_ot) {
    const filas = [
      ...this.filaObservacionGeneralPDFOT(datos_ot),
      { proceso: `Laminado`, texto: this.textoObservacionPDFOT(datos_ot.laminado_Observacion) },
      { proceso: `Impresión`, texto: this.textoObservacionPDFOT(datos_ot.impresion_Observacion) },
      { proceso: `Producto Terminado`, texto: this.textoObservacionPDFOT(datos_ot.selladoCorte_Observacion) },
    ].filter(fila => fila.texto != '');

    if (filas.length == 0) return null;
    return this.tablaObservacionesPDFOT(filas);
  }

  /**
   * Arma la tabla "OBSERVACIONES POR PROCESO" (encabezado Proceso / Observación) que comparten la hoja 1 y la hoja 2.
   * @param filas Filas a mostrar, cada una con el nombre del proceso y su observación.
   * @returns Nodo pdfmake con la tabla.
   */
  private tablaObservacionesPDFOT(filas: { proceso: string, texto: string }[]) {
    return {
      table: {
        widths: [120, '*'],
        headerRows: 2,
        dontBreakRows: true,
        body: [
          [
            { colSpan: 2, text: `OBSERVACIONES POR PROCESO`, style: 'titulosTablas', border: [true, true, true, true] },
            {}
          ],
          [
            { text: `Proceso`, style: 'subtituloTablas' },
            { text: `Observación`, style: 'subtituloTablas' }
          ],
          ...filas.map(fila => [
            { text: fila.proceso, style: 'subtitulo' },
            { text: fila.texto }
          ]),
        ]
      },
      fontSize: 9,
    }
  }

  /**
   * Normaliza el texto de una observación para el PDF. Las OT que vienen de BagPro no traen
   * las observaciones por proceso, por eso se toleran valores nulos o indefinidos.
   * @param valor Observación tal como llega de la API.
   * @returns Observación sin espacios sobrantes, o cadena vacía si no existe.
   */
  private textoObservacionPDFOT(valor: any): string {
    return valor == null ? '' : valor.toString().trim();
  }

  // Función que va a colocar el footer del PDF
  private footerPDFOT(usuario: string) {
    return function (currentPage: any, pageCount: any) {
      return [
        '\n',
        {
          columns: [
            { text: `Documento generado por ${usuario}`, alignment: ' left', fontSize: 8, margin: [30, 0, 0, 0] },
            { text: `Fecha Expedición Documento ${moment().format('YYYY-MM-DD')} - ${moment().format('H:mm:ss')}`, alignment: 'right', fontSize: 8 },
            { text: `${currentPage.toString()} de ${pageCount}`, alignment: 'right', fontSize: 8, margin: [0, 0, 30, 0] },
          ]
        }
      ]
    }
  }

  // Funcion que va a colocar los estilos en el PDF
  private stylesPDFOT() {
    return {
      header: { fontSize: 7, bold: true },
      titulo: { fontSize: 11, bold: true },
      ot: { fontSize: 11, bold: true },
      orden_trabajo: { fontSize: 30, bold: true },
      subtitulo: { fontSize: 10, bold: true },
      titulosTablas: {
        border: [false, false, false, false],
        fillColor: '#cccccc',
        alignment: 'center',
        bold: true,
        fontSize: 11
      },
      subtituloTablas: {
        border: [false, false, false, false],
        fillColor: '#eeeeee',
        alignment: 'center',
        bold: true,
        fontSize: 10
      },
      datosTablaExtrusion: {
        alignment: 'center',
        border: [false, false, false, false],
      }
    }
  }
}

/** Movimientos de asignación que imprime CreacionPdfService.asignacionMateriaPrimaPDF. */
export const MOVIMIENTOS_ASIGNACION: string[] = ['ASIGMP', 'ASIGTINTAS', 'ASIGBOPA', 'ASIGBOPP', 'ASIGPOLY'];

/** Datos de la OT (consultados en BagPro) que se imprimen en el PDF de la solicitud de material. */
export interface DatosOTSolicitudPDF {
  cliente: string;
  /** Número del item (producto) de la OT. */
  item: number | string | null;
  referencia: string;
  /** Kg de la OT. */
  kgOT: number;
  /** Kg máximos permitidos (kg de la OT más el adicional). */
  kgLimite: number;
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
