import { Component, OnInit, ViewChild } from '@angular/core';
import moment from 'moment';
import { Table } from 'primeng/table';
import { AppComponent } from 'src/app/app.component';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { Inventario_AreasService } from 'src/app/Servicios/Inventario_Areas/Inventario_Areas.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';

@Component({
  selector: 'app-Reporte_InventarioAreas',
  templateUrl: './Reporte_InventarioAreas.component.html',
  styleUrls: ['./Reporte_InventarioAreas.component.css']
})
export class Reporte_InventarioAreasComponent implements OnInit {
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
 
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  hora : any = moment().format('H:mm:ss'); //Variable que se usará para llenar la hora actual 
  load : boolean = false;
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  rangoFechas : any = []; //Variable que guardará el rango de fechas seleccionado por el usuario
  invMatPrimas : any = []; //Variable que guardará el inventario de las areas.
  invReciclados : any = []; //Variable que guardará el inventario de las areas
  invExtrusion : any = []; //Variable que guardará el inventario de las extrusiones
  invRotograbado : any = []; //Variable que guardará el inventario de las rotograbado
  invSellado : any = []; //Variable que guardará el inventario de las sellado
  invImpresion : any = []; //Variable que guardará el inventario de las impresion
  invMateriales : any = []; //Variable que guardará el inventario de los materiales
  
  @ViewChild('dtExt') dtExt: Table | undefined; //Tabla que representa el inventario de extrusión
  @ViewChild('dtMat') dtMat: Table | undefined; //Tabla que representa el inventario de materiales en proceso
  @ViewChild('dtImp') dtImp: Table | undefined; //Tabla que representa el inventario de impresion
  @ViewChild('dtRot') dtRot: Table | undefined; //Tabla que representa el inventario de rotograbado
  @ViewChild('dtSella') dtSella: Table | undefined; //Tabla que representa el inventario de sellado
  @ViewChild('dtMatPrima') dtMatPrima: Table | undefined; //Tabla que representa el inventario de materias primas
  @ViewChild('dtReciclados') dtReciclados: Table | undefined; //Tabla que representa el inventario de reciclados


  constructor(private AppComponent : AppComponent, 
              private svcInvAreas : Inventario_AreasService,
                private msj : MensajesAplicacionService, 
                  private svcMatPrimas : MateriaPrimaService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
   }

  ngOnInit() {
    this.inventarioMateriasPrimas();
    this.consultarInventario();
  }

  verTutorial(){}

  //Función que consultará el inventario de todas las areas y lo mostrará en la tabla. 
  consultarInventario(){
    let fecha1 : any;
    let fecha2 : any;
    this.svcInvAreas.GetPorFecha(`2023-09-01`, `2023-09-15`).subscribe(data => {
      if(data.length > 0) {
        data.forEach(x => {
          if(x.id_Area == `EXT` && x.esMaterial == false) this.invExtrusion.push(x);
          if(x.id_Area == `EXT` && x.esMaterial == true) this.invMateriales.push(x);
          if(x.id_Area == `ROT`) this.invRotograbado.push(x);
          if(x.id_Area == `SELLA`) this.invSellado.push(x);
          if(x.id_Area == `IMP`) this.invImpresion.push(x);
        });
        this.exportarExcel();
      } else this.msj.mensajeAdvertencia(`¡Advertencia!`, `¡No se encontró información de inventarios en las fechas consultadas!`);
    });
  }

  //Función que mostrará el inventario de materias primas y reciclados en la tabla. 
  inventarioMateriasPrimas() {
    this.svcMatPrimas.srvObtenerLista().subscribe(data => {
      if(data.length > 0) {
        data.forEach(x => {
          let info : any = {
            'fecha_Inventario' : this.today,
            'ot' :  '',
            'item' : x.matPri_Id,
            'referencia' : x.matPri_Nombre,
            'stock' : x.matPri_Stock,
            'precio' : x.matPri_Precio, 
            'subtotal' : x.matPri_Stock * x.matPri_Precio,
          }
          x.catMP_Id == 10 ? this.invReciclados.push(info) : this.invMatPrimas.push(info);
        });
      } 
    });
  }

  //Funciones que calcularán el total de cada inventario.
  calcularTotalExtrusion = () => this.invExtrusion.reduce((acum, valor) => (acum + valor.subtotal), 0);

  calcularTotalRotograbado = () => this.invRotograbado.reduce((acum, valor) => (acum + valor.subtotal), 0);

  calcularTotalSellado = () => this.invSellado.reduce((acum, valor) => (acum + valor.subtotal), 0);

  calcularTotalImpresion = () => this.invImpresion.reduce((acum, valor) => (acum + valor.subtotal), 0);

  calcularTotalMateriales = () => this.invMateriales.reduce((acum, valor) => (acum + valor.subtotal), 0);

  calcularTotalMatPrimas = () => this.invMatPrimas.reduce((acum, valor) => (acum + valor.subtotal), 0);

  calcularTotalReciclados = () => this.invReciclados.reduce((acum, valor) => (acum + valor.subtotal), 0);

  //Funciones que permitiran realizar filtros en la tabla.
  aplicarfiltroExt = ($event, campo : any, valorCampo : string) => this.dtExt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  aplicarfiltroMat = ($event, campo : any, valorCampo : string) => this.dtMat!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  aplicarfiltroImp = ($event, campo : any, valorCampo : string) => this.dtImp!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
  
  aplicarfiltroRot = ($event, campo : any, valorCampo : string) => this.dtRot!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  aplicarfiltroSella = ($event, campo : any, valorCampo : string) => this.dtSella!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  aplicarfiltroMatPrima = ($event, campo : any, valorCampo : string) => this.dtMatPrima!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  aplicarfiltroReciclado = ($event, campo : any, valorCampo : string) => this.dtReciclados!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  exportarExcel(){
    this.load = true;
    let tituloTotal : string = `INVENTARIO TOTAL`;
    let tituloExtrusion : string = `INVENTARIO EXTRUSIÓN`;
    let tituloRotograbado : string = `INVENTARIO ROTOGRABADO`;
    let tituloSellado : string = `INVENTARIO SELLADO`;
    let tituloImpresion : string = `INVENTARIO IMPRESIÓN`;
    let tituloMateriales : string = `MATERIALES EN EXTRUSIÓN`;
    let tituloMatPrimas : string = `INVENTARIO DE MATERIA PRIMA`;
    let tituloReciclados : string = `INVENTARIO DE RECICLADOS`;
    let unirCeldasHoja : string [] = [];
    let header : string [] = [];

    let workbook = new Workbook();
    const image = workbook.addImage({ base64:  logoParaPdf, extension: 'png', });

    // HOJA 1, INVENTARIO TOTAL
    let worksheetTotal = workbook.addWorksheet(`Inventario Total`);
    this.formatoTitulos(worksheetTotal, tituloTotal);
    header = ['Área', 'Total'];
    let headerRowTotales = worksheetTotal.addRow(header);
    this.formatoEncabezado(headerRowTotales);
    this.calcularInvTotal().forEach(d => {
      let row = worksheetTotal.addRow(d);
      let celdas = [1, 2];
      celdas.forEach(cell => {
        row.getCell(cell).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EAFAF1' } };
        row.getCell(cell).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
        if (row.getCell(1).value == 'TOTAL') row.getCell(cell).font = { name: 'Calibri', family: 4, size: 11, bold: true };
        worksheetTotal.getColumn(cell).numFmt = '""#,##0.00;[Black]\-""#,##0.00';
        worksheetTotal.getColumn(cell).width = 30;
      });
    });
    unirCeldasHoja = ['A1:B3'];
    unirCeldasHoja.forEach(cell => worksheetTotal.mergeCells(cell));

    //HOJA 2, INVENTARIO EXTRUSIÓN
    let worksheetExtrusion = workbook.addWorksheet(`Inventario Extrusión`);
    this.formatoTitulos(worksheetExtrusion, tituloExtrusion, image);
    header = ['Fecha', 'OT', 'Item', 'Referencia', 'Kg', 'Precio', 'SubTotal'];
    let headerRowExtrusion = worksheetExtrusion.addRow(header);
    this.formatoEncabezado(headerRowExtrusion);
    this.formatoCuerpo(this.calcularInvExtrusion(), worksheetExtrusion);

    // HOJA 3, INVENTARIO ROTOGRABADO
    let worksheetRotograbado = workbook.addWorksheet(`Inventario Rotograbado`);
    this.formatoTitulos(worksheetRotograbado, tituloRotograbado, image);
    header = ['Fecha', 'OT', 'Item', 'Referencia', 'Kg', 'Precio', 'SubTotal'];
    let headerRowRotograbado = worksheetRotograbado.addRow(header);
    this.formatoEncabezado(headerRowRotograbado);
    this.formatoCuerpo(this.calcularInvRotograbado(), worksheetRotograbado);

    // HOJA 4, INVENTARIO SELLADO
    let worksheetSellado = workbook.addWorksheet(`Inventario Sellado`);
    this.formatoTitulos(worksheetSellado, tituloSellado, image);
    header = ['Fecha', 'OT', 'Item', 'Referencia', 'Kg', 'Precio', 'SubTotal'];
    let headerRowSellado = worksheetSellado.addRow(header);
    this.formatoEncabezado(headerRowSellado);
    this.formatoCuerpo(this.calcularInvSellado(), worksheetSellado);

    // HOJA 5, INVENTARIO IMPRESION
    let worksheetImpresion = workbook.addWorksheet(`Inventario Impresión`);
    this.formatoTitulos(worksheetImpresion, tituloImpresion, image);
    header = ['Fecha', 'OT', 'Item', 'Referencia', 'Kg', 'Precio', 'SubTotal'];
    let headerRowImpresion = worksheetImpresion.addRow(header);
    this.formatoEncabezado(headerRowImpresion);
    this.formatoCuerpo(this.calcularInvImpresion(), worksheetImpresion);

    // HOJA 6, INVENTARIO MATERIA PRIMA
    let worksheetMateriaPrima = workbook.addWorksheet(`Inventario Materia Prima`);
    this.formatoTitulos(worksheetMateriaPrima, tituloMatPrimas, image);
    header = ['Fecha', 'OT', 'Item', 'Referencia', 'Kg', 'Precio', 'SubTotal'];
    let headerRowMatPrimas = worksheetMateriaPrima.addRow(header);
    this.formatoEncabezado(headerRowMatPrimas);
    this.formatoCuerpo(this.calcularInvMateriasPrimas(), worksheetMateriaPrima);
    
    // HOJA 7, INVENTARIO RECICLADOS O RECUPERADOS
    let worksheetRecuperado = workbook.addWorksheet(`Inventario Recuperado`);
    this.formatoTitulos(worksheetRecuperado, tituloReciclados, image);
    header = ['Fecha', 'OT', 'Item', 'Referencia', 'Kg', 'Precio', 'SubTotal'];
    let headerRowRecuperado = worksheetRecuperado.addRow(header);
    this.formatoEncabezado(headerRowRecuperado);
    this.formatoCuerpo(this.calcularInvRecuperado(), worksheetRecuperado);


    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, `Inventarios_Areas.xlsx`);
    });
    this.load = false;
  }

  formatoTitulos(worksheet : any, titulo : string, image? : any){
    if (worksheet.name != 'Inventario Total') {
      worksheet.addImage(image, {
        tl: { col: 0.1, row: 0.40 },
        ext: { width: 170, height: 45 },
        editAs: 'oneCell'
      });
    }
    let titleImpresion = worksheet.addRow([titulo]);
    titleImpresion.font = { name: 'Calibri', family: 4, size: 16, underline: 'double', bold: true };
    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFD5' } };
    worksheet.getCell('A1').border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
    worksheet.addRow([]);
    if (worksheet.name != 'Inventario Total') worksheet.addRow([]);
  }

  formatoEncabezado(headerRow : any){
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFD5' } };
      cell.font = { name: 'Calibri', family: 4, size: 11, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
    });
  }

  formatoCuerpo(data : any, worksheet : any){
    data.forEach(d => {
      let row = worksheet.addRow(d);
      let celdas = [1, 2, 3, 4, 5, 6, 7];
      celdas.forEach(cell => {
        row.getCell(cell).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8DC' } };
        row.getCell(cell).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
        if (row.getCell(1).value == 'TOTAL') row.getCell(cell).font = { name: 'Calibri', family: 4, size: 11, bold: true };
        if ([5, 6, 7].includes(cell)) row.getCell(cell).numFmt = '#,##0.00';
      });
    });
    [1, 2, 3, 5].forEach(cell => worksheet.getColumn(cell).width = 15);
    [6, 7].forEach(cell => worksheet.getColumn(cell).width = 30);
    [4].forEach(cell => worksheet.getColumn(cell).width = 50);
    let unirCeldasHoja = ['A1:G3'];
    unirCeldasHoja.forEach(cell => worksheet.mergeCells(cell));
  }

  calcularInvTotal() : any [] {
    let datos : any [] = [];
    datos = [
      ['RECICLADO', this.calcularTotalReciclados()],
      ['MATERIA PRIMA', this.calcularTotalMatPrimas()],
      ['EXTRUSIÓN', this.calcularTotalExtrusion()],
      ['ROLLOS', 0],
      ['IMPRESIÓN', this.calcularTotalImpresion()],
      ['SELLADO', this.calcularTotalSellado()],
      ['ROTOGRABADO', this.calcularTotalRotograbado()],
      ['DESPACHO', 0],
      ['TOTAL', ],
    ];
    return datos;
  }

  calcularInvExtrusion() : any [] {
    let datos : any [] = [];
    this.invExtrusion.forEach(ext => {
      datos.push([
        ext.fecha_Inventario.replace('T00:00:00', ''),
        ext.ot,
        ext.item,
        ext.referencia,
        ext.stock,
        ext.precio,
        ext.subtotal
      ]);
    });
    datos.push([
      'TOTAL',
      '',
      '',
      '',
      this.invExtrusion.reduce((a,b) => a + b.stock, 0),
      '',
      this.invExtrusion.reduce((a,b) => a + b.subtotal, 0)
    ]);
    return datos;
  }

  calcularInvRotograbado() : any [] {
    let datos : any [] = [];
    this.invRotograbado.forEach(ext => {
      datos.push([
        ext.fecha_Inventario.replace('T00:00:00', ''),
        ext.ot,
        ext.item,
        ext.referencia,
        ext.stock,
        ext.precio,
        ext.subtotal
      ]);
    });
    datos.push([
      'TOTAL',
      '',
      '',
      '',
      this.invRotograbado.reduce((a,b) => a + b.stock, 0),
      '',
      this.invRotograbado.reduce((a,b) => a + b.subtotal, 0)
    ]);
    return datos;
  }

  calcularInvSellado() : any [] {
    let datos : any [] = [];
    this.invSellado.forEach(ext => {
      datos.push([
        ext.fecha_Inventario.replace('T00:00:00', ''),
        ext.ot,
        ext.item,
        ext.referencia,
        ext.stock,
        ext.precio,
        ext.subtotal
      ]);
    });
    datos.push([
      'TOTAL',
      '',
      '',
      '',
      this.invSellado.reduce((a,b) => a + b.stock, 0),
      '',
      this.invSellado.reduce((a,b) => a + b.subtotal, 0)
    ]);
    return datos;
  }

  calcularInvImpresion() : any [] {
    let datos : any [] = [];
    this.invImpresion.forEach(ext => {
      datos.push([
        ext.fecha_Inventario.replace('T00:00:00', ''),
        ext.ot,
        ext.item,
        ext.referencia,
        ext.stock,
        ext.precio,
        ext.subtotal
      ]);
    });
    datos.push([
      'TOTAL',
      '',
      '',
      '',
      this.invImpresion.reduce((a,b) => a + b.stock, 0),
      '',
      this.invImpresion.reduce((a,b) => a + b.subtotal, 0)
    ]);
    return datos;
  }

  calcularInvMateriasPrimas() : any [] {
    let datos : any [] = [];
    this.invMatPrimas.forEach(ext => {
      datos.push([
        ext.fecha_Inventario.replace('T00:00:00', ''),
        ext.ot,
        ext.item,
        ext.referencia,
        ext.stock,
        ext.precio,
        ext.subtotal
      ]);
    });
    datos.push([
      'TOTAL',
      '',
      '',
      '',
      this.invMatPrimas.reduce((a,b) => a + b.stock, 0),
      '',
      this.invMatPrimas.reduce((a,b) => a + b.subtotal, 0)
    ]);
    return datos;
  }

  calcularInvRecuperado() : any [] {
    let datos : any [] = [];
    this.invReciclados.forEach(ext => {
      datos.push([
        ext.fecha_Inventario.replace('T00:00:00', ''),
        ext.ot,
        ext.item,
        ext.referencia,
        ext.stock,
        ext.precio,
        ext.subtotal
      ]);
    });
    datos.push([
      'TOTAL',
      '',
      '',
      '',
      this.invReciclados.reduce((a,b) => a + b.stock, 0),
      '',
      this.invReciclados.reduce((a,b) => a + b.subtotal, 0)
    ]);
    return datos;
  }
}
