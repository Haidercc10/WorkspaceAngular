import { Injectable } from '@angular/core';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import JsBarcode from 'jsbarcode';

@Injectable({
    providedIn: 'root'
})

export class CreacionPdfService {

    constructor() { }

    // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
    private formatNumbers = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

    formatoPDF(titulo : string, content : any, headerAdicional : any = {}){
        let today : any = moment().format('YYYY-MM-DD');
        let hour : any = moment().format('HH:mm:ss');
        const pdfDefinicion : any = {
            info: { title: titulo },
            pageOrientation: 'portrait',
            pageSize: 'LETTER',
            watermark: { text: 'PLASTICARIBE SAS', color: 'red', opacity: 0.02, bold: true, italics: false },
            pageMargins : [25, 110, 25, 35],
            header: this.headerPDF(today, hour, titulo, headerAdicional),
            content : content,
        }
        setTimeout(() => this.crearPDF(pdfDefinicion), 3000);
    }
    
    private headerPDF(today, hour, titulo, headerAdicional) : {} {
        return (currentPage : any, pageCount : any) => {
            return [
                {
                    margin: [20, 8, 20, 0],
                    columns: [
                        { image : logoParaPdf, width : 150, height : 30, margin: [20, 25, 80, 10] },
                        this.empresaFechaHoraTituloPDF(titulo),
                        this.paginadoFechaHoraPDF(currentPage, pageCount, today, hour)
                    ]
                },
                this.lineaHeaderFooterPDF([false, true, false, false]),
                headerAdicional,
            ];
        }
    }

    private empresaFechaHoraTituloPDF(titulo : string) : {} {
        return {
            width: '*',
            alignment: 'center',
            table: {
                body: [
                    [{text: 'NIT. 800188732', bold: true, alignment: 'center', fontSize: 10}],
                    [{text: `Fecha Doc. ${moment().format('YYYY-MM-DD')} ${moment().format('H:mm:ss')}`, alignment: 'center', fontSize: 8}],
                    [{text: titulo, bold: true, alignment: 'center', fontSize: 10}],
                ]
            },
            layout: 'noBorders',
            margin: [80, 20, 0, 10],
        }
    }

    private paginadoFechaHoraPDF(currentPage, pageCount, today, hour) : {} {
        return {
            width: '*',
            alignment: 'center',
            margin: [100, 20, 20, 0],
            table: {
                body: [
                    [{text: `Pagina: `, alignment: 'left', fontSize: 8, bold: true}, { text: `${currentPage.toString() + ' de ' + pageCount}`, alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                    [{text: `Fecha: `, alignment: 'left', fontSize: 8, bold: true}, {text: today, alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                    [{text: `Hora: `, alignment: 'left', fontSize: 8, bold: true}, {text: hour, alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                ]
            },
            layout: 'noBorders',
        }
    }

    private lineaHeaderFooterPDF(borders : boolean []) : {} {
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

    private crearPDF(pdfDefinicion){
        pdfMake.createPdf(pdfDefinicion).open();
    }

    /* ============================================================== CREATE TAG PRODUCTION ===================================================================== */
    createTagProduction(dataTag : modelTagProduction){
        let code : number = dataTag.reel;
        const pdfDefinition : any = {
            pageOrientation: 'landscape',
            info: {title: `Etiqueta ${code}`},
            pageSize: {width: 188.97640176, height: 377.95280352},
            pageMargins : [10, 10, 10, 20],
            footer: this.footerPDF(dataTag.productionProcess, dataTag.operator),
            content : this.contentPDF(dataTag),
        }
        let windoeFeatures = `height=189,width=378`;
        let win = window.open('', 'Print', windoeFeatures);
        pdfMake.createPdf(pdfDefinition).print({}, win);
        setTimeout(() => win.close(), 3000);
    }

    private contentPDF(dataTag : modelTagProduction){
        return[
            {
                table : {
                    widths : ['25%', '25%', '50%'],
                    body : this.contentPrincipalTablePDF(dataTag)
                },
            }
        ]
    }

    private contentPrincipalTablePDF(dataTag : modelTagProduction) : any [] {
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

    private infoBussinessPDF(dataTag : modelTagProduction) : any [] {
        return [
            {text: `PLASTICARIBE S.A.S`, bold: true, fontSize: 10, alignment: 'center', colSpan: 2},
            {},
            {text: `CALLE 42 #52-105 Barranquilla`, bold: true, fontSize: 10, alignment: 'center'}
        ];
    }

    private adictionalInformationTag(dataTag : modelTagProduction) : any [] {
        return [
            {text: `APTO PARA EL CONTACTO CON ALIMENTOS`, bold: true, fontSize: 10, alignment: 'center', colSpan: 3},
            {},
            {}
        ];
    }

    private infoClient(dataTag : modelTagProduction) : any [] {
        let nameClient : string = (dataTag.client).toUpperCase();
        let size : number = nameClient.length > 40 ? 10 : 12;
        return [
            {text: `Cliente: ${(dataTag.client).toUpperCase()}`, bold: true, fontSize: size, alignment: 'left', colSpan: 3},
            {},
            {}
        ];
    }

    private infoProduct(dataTag : modelTagProduction) : any [] {
        let reference : string = (dataTag.reference).toUpperCase();
        let size : number = reference.length > 30 ? 9 : 12;
        return [
            {text: `Item: ${(dataTag.item)}`, bold: true, fontSize: 12, alignment: 'left'},
            {text: `REF: ${(dataTag.reference).toUpperCase()}`, bold: true, fontSize: size, alignment: 'left', colSpan: 2},
            {},
        ];
    }

    private dataOrderProduction(dataTag : modelTagProduction) : any [] {
        return [
            {
                colSpan: 3,
                table : {
                    widths : ['auto', '*', 'auto', 'auto'],
                    body : [
                        [
                            {text: `OT: ${dataTag.orderProduction}`, bold: true, fontSize: 11, alignment: 'center'},
                            {text: `${this.formatNumbers((dataTag.width).toFixed(2))} ${this.formatNumbers((dataTag.bellows).toFixed(2))} ${this.formatNumbers((dataTag.height).toFixed(2))} ${dataTag.und}`, bold: true, fontSize: 10, alignment: 'center'},
                            {text: `CAL: ${this.formatNumbers((dataTag.cal).toFixed(2))}`, bold: true, fontSize: 10, alignment: 'center'},
                            {text: `Material: ${dataTag.material}`, bold: true, fontSize: 10, alignment: 'center'},
                        ]
                    ]
                },
                layout: 'noBorders'
            },
            {},
            {},
        ];
    }

    private materiaOrderProduction(dataTag : modelTagProduction) : any [] {
        return [
            {text: dataTag.presentationItem1, bold: true, fontSize: 10, alignment: 'center'},
            {text: dataTag.presentationItem2, bold: true, fontSize: 10, alignment: 'center'},
            {text: `Rollo: ${dataTag.reel}`, bold: true, fontSize: 10, alignment: 'center'},  
        ];
    }

    private quantityAndBarcode(dataTag : modelTagProduction){
        let data = [];
        data.push(this.tableWithQuantity(dataTag.quantity));
        data.push(this.tableWithQuantity(dataTag.quantity2));
        data.push(this.createBarcode(dataTag.reel));
        return data;
    }

    private tableWithQuantity(quantity : number){
        let size : number = quantity > 999 ? 18 : quantity > 9999 ? 14 : 24;
        return {text: `${this.formatNumbers((quantity).toFixed(2))}`, bold: true, fontSize: size, alignment: 'center'};
    }

    private createBarcode(code : number){
        const imageBarcode = document.createElement('img');
        imageBarcode.id = 'barcode';
        document.body.appendChild(imageBarcode);
        JsBarcode("#barcode", code.toString(), {format: "CODE128A", displayValue: false, width:5, height:100});
        let imagePDF = {image : imageBarcode.src, width : 160, height: 40};
        imageBarcode.remove();
        return imagePDF;
    }

    private adictionalInformation(code : number){
        return [
            {text: ``, bold: true, fontSize: 10, alignment: 'center', border : [false, false, false, false]},
            {text: ``, bold: true, fontSize: 10, alignment: 'center', border : [false, false, false, false]},
            {text: ``, bold: true, fontSize: 10, alignment: 'center', border : [false, false, false, false]},
        ];
    }

    private footerPDF(productionProcess : 'EXTRUSION' | 'IMPRESION' | 'ROTOGRABADO' | 'LAMIMADO' | 'DOBLADO' | 'CORTE' | 'EMPAQUE' | 'SELLADO' | 'WIKETIADO', operator? : any){
        let width : number = productionProcess == 'SELLADO' || productionProcess == 'WIKETIADO' ? operator.length > 30 ? 170 : operator.length >= 20 && operator.length < 30 ? 130 : 100 : 0;
        let operative : string = productionProcess == 'SELLADO' || productionProcess == 'WIKETIADO' ? `${operator}` : '';
        return {
            columns: [ 
                { text: `${moment().format('YYYY-MM-DD')} - ${moment().format('H:mm:ss')}`, alignment: 'center', fontSize: 8, },
                { text: operative, alignment: 'center', fontSize: 8, width : width, bold : true, },
                { text: productionProcess, alignment: 'center', fontSize: 8 },
            ]
        }
    }
}

export interface modelTagProduction {
    client : string;
    item : number;
    reference : string;
    width : number;
    height : number;
    bellows : number;
    und : string;
    cal : number;
    orderProduction : string;
    material : string;
    quantity : number;
    quantity2 : number;
    reel : number;
    presentationItem1 : string;
    presentationItem2 : string;
    productionProcess : 'EXTRUSION' | 'IMPRESION' | 'ROTOGRABADO' | 'LAMIMADO' | 'DOBLADO' | 'CORTE' | 'EMPAQUE' | 'SELLADO' | 'WIKETIADO';
    showNameBussiness? : boolean;
    operator? : string;
}
