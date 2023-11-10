import { Injectable } from '@angular/core';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';

@Injectable({
    providedIn: 'root'
})

export class CreacionExcelService {

    constructor() { }

    formatoExcel(titulo : string){
        let workbook = new Workbook();
        this.creacionHoja(workbook, titulo);
        return workbook;
    }

    creacionHoja(workbook : Workbook, nombreHoja : string){
        const imageId1 = workbook.addImage({ base64:  logoParaPdf, extension: 'png', });
        let worksheet = workbook.addWorksheet(`${nombreHoja}`);
        let titleRow = worksheet.addRow([nombreHoja]);
        titleRow.font = { name: 'Calibri', family: 4, size: 16, underline: 'double', bold: true };
        worksheet.addImage(imageId1, 'A1:C3');
        return worksheet;
    }

    creacionExcel(nombreArchivo : string, workbook : Workbook){
      setTimeout(() => {
        workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, `${nombreArchivo}.xlsx`);
        }); 
      }, 500);
    }
}
