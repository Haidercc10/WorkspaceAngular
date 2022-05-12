import { Component, OnInit } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-pdf',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.css' ]
})
export class PdfComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }


  createPDF(){

    const pdfDefinition: any = {
      content: [
        {
         table: {
          heights: [-5, 20, 20],
          body: [
            [
              'ID',
              'Nombre',
              'Ancho',
              'Fuelle',
              'Calibre',
              'Unidad Medida',
              'Stock',
              'Cantidad Disponible',
              'Unidad Medida',
              'Precio Unitario',
              'Precio Total en Stock',
              'Tipo Producto',
            ],
            [
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
            ],
            [
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
            ],

          ]
      }
    }

      ]
    }

    const pdf = pdfMake.createPdf(pdfDefinition);
    pdf.open();

  }
}
