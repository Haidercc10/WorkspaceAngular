import { Inject, Injectable } from '@angular/core';
import JsBarcode from 'jsbarcode';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { EncriptacionService } from '../Encriptacion/Encriptacion.service';
import { ReImpresionEtiquetas, ReImpresionEtiquetasService } from '../ReImpresionEtiquetas/ReImpresionEtiquetas.service';

@Injectable({
    providedIn: 'root'
})

export class CreacionPdfService {

    constructor(private rePrintService: ReImpresionEtiquetasService,
        @Inject(SESSION_STORAGE) private storage: WebStorageService,
        private encriptacion: EncriptacionService,) { }

    // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
    private formatNumbers = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

    formatoPDF(titulo: string, content: any, headerAdicional: any = {}) {
        let today: any = moment().format('YYYY-MM-DD');
        let hour: any = moment().format('HH:mm:ss');
        const pdfDefinicion: any = {
            info: { title: titulo },
            pageOrientation: 'portrait',
            pageSize: 'LETTER',
            watermark: { text: 'PLASTICARIBE SAS', color: 'red', opacity: 0.02, bold: true, italics: false },
            pageMargins: [25, 110, 25, 35],
            header: this.headerPDF(today, hour, titulo, headerAdicional),
            content: content,
        }
        setTimeout(() => this.crearPDF(pdfDefinicion, titulo), 3000);
    }

    private headerPDF(today, hour, titulo, headerAdicional): {} {
        return (currentPage: any, pageCount: any) => {
            return [
                {
                    margin: [20, 8, 20, 0],
                    columns: [
                        { image: logoParaPdf, width: 150, height: 30, margin: [20, 25, 80, 10] },
                        this.empresaFechaHoraTituloPDF(titulo),
                        this.paginadoFechaHoraPDF(currentPage, pageCount, today, hour)
                    ]
                },
                this.lineaHeaderFooterPDF([false, true, false, false]),
                headerAdicional,
            ];
        }
    }

    private empresaFechaHoraTituloPDF(titulo: string): {} {
        return {
            width: '*',
            alignment: 'center',
            table: {
                body: [
                    [{ text: 'NIT. 800188732', bold: true, alignment: 'center', fontSize: 10 }],
                    [{ text: `Fecha Doc. ${moment().format('YYYY-MM-DD')} ${moment().format('H:mm:ss')}`, alignment: 'center', fontSize: 8 }],
                    [{ text: titulo, bold: true, alignment: 'center', fontSize: 10 }],
                ]
            },
            layout: 'noBorders',
            margin: [80, 20, 0, 10],
        }
    }

    private paginadoFechaHoraPDF(currentPage, pageCount, today, hour): {} {
        return {
            width: '*',
            alignment: 'center',
            margin: [100, 20, 20, 0],
            table: {
                body: [
                    [{ text: `Pagina: `, alignment: 'left', fontSize: 8, bold: true }, { text: `${currentPage.toString() + ' de ' + pageCount}`, alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                    [{ text: `Fecha: `, alignment: 'left', fontSize: 8, bold: true }, { text: today, alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                    [{ text: `Hora: `, alignment: 'left', fontSize: 8, bold: true }, { text: hour, alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                ]
            },
            layout: 'noBorders',
        }
    }

    private lineaHeaderFooterPDF(borders: boolean[]): {} {
        return {
            margin: [20, 0],
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

    private crearPDF(pdfDefinicion, titulo: string) {
        pdfMake.createPdf(pdfDefinicion).download(`${titulo}.pdf`);
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
        pdfMake.createPdf(pdfDefinition).getBuffer((buffer) => window.electron.send('print-pdf', buffer));
        if (dataTag.copy) this.createRePrint(dataTag);
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
        let infoTag: string = `${this.formatNumbers((dataTag.width).toFixed(2))} ${this.formatNumbers((dataTag.bellows).toFixed(2))} ${this.formatNumbers((dataTag.height).toFixed(2))} ${dataTag.und}  CAL: ${this.formatNumbers((dataTag.cal).toFixed(2))}   Material: ${dataTag.material}`;
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
        return { text: `${this.formatNumbers((quantity).toFixed(2))}`, bold: true, fontSize: size, alignment: 'center' };
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
        let width: number = operator.length > 30 ? 170 : operator.length >= 20 && operator.length < 30 ? 130 : 100;
        return {
            columns: [
                { text: `${moment().format('YYYY-MM-DD')} - ${moment().format('H:mm:ss')}`, alignment: 'center', fontSize: 8, },
                { text: operator, alignment: 'center', fontSize: 8, width: width, },
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
        pdfMake.createPdf(pdfDefinition).getBuffer((buffer) => window.electron.send('print-pdf', buffer));
        if (dataTag.copy) this.createRePrint(dataTag);
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
                margin: [0, 3],
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
            { text: `APTO PARA EL CONTACTO CON ALIMENTOS`, bold: true, fontSize: 7, alignment: 'center', colSpan: 2 },
            {}
        ];
    }

    private infoClient(dataTag: modelTagProduction): any[] {
        return [
            {
                colSpan: 2,
                margin: [0, 3],
                columns: [
                    { width: '23%', text: 'CLIENTE:', bold: true, fontSize: 8, alignment: 'left' },
                    { width: '77%', text: (dataTag.client).toUpperCase(), fontSize: 10, alignment: 'left' },
                ]
            },
            {}
        ];
    }

    private dataOrderAndItem(dataTag: modelTagProduction): any[] {
        return [
            {
                margin: [0, 3],
                columns: [
                    { width: '25%', text: 'OT:', bold: true, fontSize: 10, alignment: 'left' },
                    { width: '75%', text: (dataTag.orderProduction), fontSize: 10, alignment: 'left' },
                ]
            },
            {
                margin: [0, 3],
                columns: [
                    { width: '35%', text: 'ITEM:', bold: true, fontSize: 10, alignment: 'left' },
                    { width: '65%', text: dataTag.item, fontSize: 10, alignment: 'left' },
                ]
            }
        ]
    }

    private nameReference(dataTag: modelTagProduction): any[] {
        return [
            {
                colSpan: 2,
                margin: [0, 3],
                columns: [
                    { width: '13%', text: 'REF.:', bold: true, fontSize: 8, alignment: 'left' },
                    { width: '87%', text: (dataTag.reference).toUpperCase(), fontSize: 10, alignment: 'left' },
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
                    widths: ['59%', '41%'],
                    margin: [0, 3],
                    body: [
                        [
                            {
                                border: [false, false, true, false],
                                columns: [
                                    { width: 'auto', text: 'MATERIAL:', bold: true, fontSize: 7, alignment: 'left' },
                                    { width: 'auto', text: (dataTag.material).toUpperCase(), fontSize: 7, alignment: 'left' },
                                ]
                            },
                            {
                                border: [false, false, false, false],
                                columns: [
                                    { width: 'auto', text: 'BULTO:', bold: true, fontSize: 8, alignment: 'left' },
                                    { width: 'auto', text: `${dataTag.reel}${!dataTag.copy ? '' : '.'}`, fontSize: 9, alignment: 'left' },
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
        imageBarcode.id = 'barcode';
        document.body.appendChild(imageBarcode);
        JsBarcode("#barcode", (dataTag.reel).toString(), { format: "CODE128A", displayValue: false, width: 50, height: 150 });
        let imagePDF = { image: imageBarcode.src, width: 155, height: size, colSpan: 2, alignment: 'center' };
        imageBarcode.remove();
        return [imagePDF, {}];
    }

    private sizeBarcode(dataTag: modelTagProduction): number {
        let sizeClient: number = dataTag.client.length;
        let sizeReference: number = dataTag.reference.length;
        let size: number = 95;
        if (sizeClient < 22) size += 13;
        if (sizeReference < 25) size += 13;
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
        return { text: `${this.formatNumbers((finalQuantity))}`, bold: true, fontSize: size, alignment: 'center', margin: [0, 5] };
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
            { text: dataTag.operator, bold: true, colSpan: 2, alignment: 'center', fontSize: 9 },
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