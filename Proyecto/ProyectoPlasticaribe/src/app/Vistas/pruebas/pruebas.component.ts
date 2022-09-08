import { Component, OnInit } from '@angular/core';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';

@Component({
  selector: 'app-pruebas',
  templateUrl: './pruebas.component.html',
  styleUrls: ['./pruebas.component.css']
})
export class PruebasComponent implements OnInit{
  datePipe: any;

  constructor(){ }

  ngOnInit() {
    const title = 'Car Sell Report';
    const header = ["Year", "Month", "Make", "Model", "Quantity", "Pct"]
    const data = [
      { "Year" : 2007, "Month" : 1, "Make" : "Volkswagen ", "Model" : "Volkswagen Passat", "Quantity" : 1267, "Pct" : 10},
      { "Year" : 2007, "Month" : 1, "Make" : "Volkswagen ", "Model" : "Volkswagen Passat", "Quantity" : 1267, "Pct" : 11},
      { "Year" : 2007, "Month" : 1, "Make" : "Volkswagen ", "Model" : "Volkswagen Passat", "Quantity" : 1267, "Pct" : 12},
      // [2007, 1, "Toyota ", "Toyota Rav4", 819, 6.5],
      // [2007, 1, "Toyota ", "Toyota Avensis", 1, 6.2],
      // [2007, 1, "Volkswagen ", "Volkswagen Golf", 720, 5.7],
      // [2007, 1, "Toyota ", "Toyota Corolla", 400, 5.4],
    ];
    console.log(data)
    let data3 : any =[];
    for (const item of data) {
      const data2  : any =
        [item.Year, item.Month, item.Make, item.Model, item.Quantity, item.Pct]

      data3.push(data2);
      console.log(data3)
    }
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('Car Data');

    // Add new row
    let titleRow = worksheet.addRow([title]);

    // Set font, size and style in title row.
    titleRow.font = { name: 'Comic Sans MS', family: 4, size: 16, underline: 'double', bold: true };

    // Blank Row
    worksheet.addRow([]);

    //Add row with current date

    //Add Header Row
    let headerRow = worksheet.addRow(header);

    // Cell Style : Fill and Border
    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'ff0000' }
      }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    });

    worksheet.mergeCells('A1:D2');

    // Add Data and Conditional Formatting

    let data3_1 = data3[2]
    console.log(data3_1[5])
    data3.forEach(d => {
        let row = worksheet.addRow(d);
        let qty = row.getCell(5);
        console.log(qty)
        let color = 'FF99FF99';
        if (+qty.value > data3_1[5]) {
          color = 'FF9999'
        }
        qty.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: color }
        }
      }
    );

    // workbook.xlsx.writeBuffer().then((data) => {
    //   let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    //   fs.saveAs(blob, 'CarData.xlsx');
    // });
  }



}
