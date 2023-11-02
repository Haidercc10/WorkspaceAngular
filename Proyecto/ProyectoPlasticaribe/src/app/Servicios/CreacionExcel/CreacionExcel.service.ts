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
        const imageId1 = workbook.addImage({ base64:  logoParaPdf, extension: 'png', });
        let worksheet = workbook.addWorksheet(`Determinación de Costos`);
        let titleRow = worksheet.addRow([titulo]);
        titleRow.font = { name: 'Calibri', family: 4, size: 16, underline: 'double', bold: true };
        worksheet.addImage(imageId1, 'A1:B3');

        workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, `${titulo}.xlsx`);
        });
    }

}
