import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';

@Injectable({
  providedIn: 'root'
})
export class CodeBarService {

  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService,) { }

  createTagProduction(user: any) {
    let code: number = 1048322496;
    const pdfDefinition: any = {
      pageOrientation: 'portrait',
      info: { title: `` },
      pageSize: { width: 377.95280352, height: 377.95280352 },
      pageMargins: [10, 10, 10, 10],
      content: this.contentPDF(user),
    }
    pdfMake.createPdf(pdfDefinition).open() /*getBuffer((buffer) => {
      let data: any = {
        nameTag: `Id ${0} - N${code}`,
        buffer: buffer,
      };
      window.electron.send('print-pdf', data);
    });*/
    //if (dataTag.copy) this.createRePrint(dataTag);
  }

  private contentPDF(user) {
    return [
      {
        table: {
          widths: ['50%', '50%'],
          body: this.contentPrincipalTablePDF(user)
        },
      }
    ]
  }

  private contentPrincipalTablePDF(user): any[] {
    let content = [];
    content.push(this.dataBussiness());
    /*content.push(
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
    );*/

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
/*
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
    //console.clear();
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
   */   

}
