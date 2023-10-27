import { Injectable } from '@angular/core';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';

@Injectable({
    providedIn: 'root'
})

export class CreacionPdfService {

    constructor() { }

    formatoPDF(titulo, content : any){
        let today : any = moment().format('YYYY-MM-DD');
        let hour : any = moment().format('HH:mm:ss');
        const pdfDefinicion : any = {
          info: { title: titulo },
          pageOrientation: 'portrait',
          pageSize: 'LETTER',
          watermark: { text: 'PLASTICARIBE SAS', color: 'red', opacity: 0.05, bold: true, italics: false },
          pageMargins : [25, 100, 25, 35],
          header: this.headerPDF(today, hour),
          content : content,
        }
        setTimeout(() => this.crearPDF(pdfDefinicion), 3000);
    }
    
    private headerPDF(today, hour){
        return (currentPage : any, pageCount : any) => {
            return [
            {
                margin: [20, 8, 20, 0],
                columns: [
                { image : logoParaPdf, width : 150, height : 30, margin: [20, 25, 80, 10] },
                this.empresaFechaHoraTituloPDF(),
                this.paginadoFechaHoraPDF(currentPage, pageCount, today, hour)
                ]
            },
            this.lineaHeaderFooterPDF([false, true, false, false]),
            ];
        }
    }

    private empresaFechaHoraTituloPDF(){
        return {
            width: '*',
            alignment: 'center',
            table: {
            body: [
                [{text: 'NIT. 800188732', bold: true, alignment: 'center', fontSize: 10}],
                [{text: `Fecha Doc. ${moment().format('YYYY-MM-DD')} ${moment().format('H:mm:ss')}`, alignment: 'center', fontSize: 8}],
                [{text: 'Pedidos de Ventas', bold: true, alignment: 'center', fontSize: 10}],
            ]
            },
            layout: 'noBorders',
            margin: [80, 20, 0, 10],
        }
    }

    private paginadoFechaHoraPDF(currentPage, pageCount, today, hour){
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

    private lineaHeaderFooterPDF(borders : boolean []){
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

}
