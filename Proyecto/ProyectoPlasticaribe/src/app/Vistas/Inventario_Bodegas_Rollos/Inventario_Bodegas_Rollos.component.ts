import { Component, OnInit } from '@angular/core';
import { ShepherdService } from 'angular-shepherd';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import moment from 'moment';
import { Detalle_BodegaRollosService } from 'src/app/Servicios/Detalle_BodegaRollos/Detalle_BodegaRollos.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsInvenatarioBodegas as defaultSteps } from 'src/app/data';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';

@Component({
  selector: 'app-Inventario_Bodegas_Rollos',
  templateUrl: './Inventario_Bodegas_Rollos.component.html',
  styleUrls: ['./Inventario_Bodegas_Rollos.component.css']
})

export class Inventario_Bodegas_RollosComponent implements OnInit {

  cargando : boolean = false; //Variable para validar que salga o no la imagen de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  inventarioTotal : any [] = []; //Variable que almacenará la información del inventario total de todas las bodegas
  inventarioExtrusion : any [] = []; //Variable que almacenará la información del inventario de la bodega de extrusion
  inventarioProductoIntermedio : any [] = []; //Variable que almacenará la información del inventario de la bodega de producto intermedio
  inventarioImpresion : any [] = []; //Variable que almacenará la información del inventario de la bodega de impresio
  inventarioRotograbado : any [] = []; //Variable que almacenará la información del inventario de la bodega de rotograbado
  inventarioSellado : any [] = []; //Variable que almacenará la información del inventario de la bodega de sellado
  inventarioDespacho : any [] = []; //Variable que almacenará la información del inventario de la bodega de despacho
  inventarioDetallado : any [] = []; //Vaariable que almacenará la información del inventario detallado
  inventario : boolean = false; //Variablq que validará si se ve el modal de los rollos o no

  constructor(private AppComponent : AppComponent,
                private shepherdService: ShepherdService,
                  private msj : MensajesAplicacionService,
                    private bgRollosService : Detalle_BodegaRollosService,) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.lecturaStorage();
    this.consultarInventario();
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que va a hacer que se inicie el tutorial in-app
  tutorial(){
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number: any) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g,'$1,');

  // Funcion que va a buscar la información de los inventarios de las bodegas
  consultarInventario(){
    let num : number = 0;
    this.cargando = true;
    this.bgRollosService.GetInventarioRollos().subscribe(data => {
      if (data.length == 0) this.cargando = false;
      for (let i = 0; i < data.length; i++) {
        let info : any = {
          Orden: data[i].bgRollo_OrdenTrabajo,
          Item: data[i].prod_Id,
          Referencia: data[i].prod_Nombre,
          Cantidad: data[i].cantidad,
          Presentacion: data[i].undMed_Id,
          Rollos: data[i].rollos,
          Bodega: data[i].bgRollo_BodegaActual,
          BodegaActual: data[i].proceso_Nombre,
        }
        //this.inventarioTotal.push(info);
        //if (data[i].bgRollo_BodegaActual == 'EXT') this.inventarioExtrusion.push(info);
        if (data[i].bgRollo_BodegaActual == 'BGPI') this.inventarioProductoIntermedio.push(info);
        //if (data[i].bgRollo_BodegaActual == 'IMP') this.inventarioImpresion.push(info);
        //if (data[i].bgRollo_BodegaActual == 'ROT') this.inventarioRotograbado.push(info);
        //if (data[i].bgRollo_BodegaActual == 'SELLA') this.inventarioSellado.push(info);
        //if (data[i].bgRollo_BodegaActual == 'DESP') this.inventarioDespacho.push(info);
        num += 1;
        if (num == data.length) this.cargando = false;
      }
    }, error => {
       this.msj.mensajeError(`Error`, `No fue posible cargar el inventario de rollos`); 
       this.cargando = false
    });
  }

  // Funcion que va a consultar los detalles de las ordenes de trabajo
  consultarDetallesInventario(orden : number, bodega : string){
    let num : number = 0;
    this.inventarioDetallado = [];
    this.bgRollosService.GetInventarioRollos_OrdenTrabajo(orden, bodega).subscribe(data => {
      this.inventario = true;
      for (let i = 0; i < data.length; i++) {
        let info : any = {
          Rollo: data[i].dtBgRollo_Rollo,
          Orden: data[i].bgRollo_OrdenTrabajo,
          Item: data[i].prod_Id,
          Referencia: data[i].prod_Nombre,
          Cantidad: data[i].dtBgRollo_Cantidad,
          Presentacion: data[i].undMed_Id,
          Fecha: data[i].bgRollo_FechaEntrada.replace('T00:00:00', ''),
          Extrusion: data[i].dtBgRollo_Extrusion ? 'SI' : 'NO',
          ProductoIntermedio: data[i].dtBgRollo_ProdIntermedio ? 'SI' : 'NO',
          Impresion: data[i].dtBgRollo_Impresion ? 'SI' : 'NO',
          Rotograbado: data[i].dtBgRollo_Rotograbado ? 'SI' : 'NO',
          Sellado: data[i].dtBgRollo_Sellado ? 'SI' : 'NO',
          Despacho: data[i].dtBgRollo_Despacho ? 'SI' : 'NO',
        }
        this.inventarioDetallado.push(info);
        if (num == data.length) this.cargando = false;
      }
    }, () => this.cargando = false);
  }

  // Funcion que va a aplicar un filtro de busqueda a las tablas
  aplicarfiltro = ($event : any, campo : any, valorCampo : string, tabla : any) => tabla!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  // Funcion que va a calcular la cantidad total de kg que hay
  calcularTotalKg(data : any) : number{
    if (data.length == 0) return 0;
    let total : number = 0;
    total = data.reduce((a,b) => a + b.Cantidad);
    return total;
  }

  calcularTotalRollos(data : any) : number{
    if (data.length == 0) return 0;
    let total : number = 0;
    total = data.reduce((a,b) => a + b.Rollos);
    return total;
  }

  // Funcion que va a crear un archivo de excel
  crearExcel(num : number){
    this.cargando = true;
    let datos : any [] = [];
    let infoDocumento : any [] = [];
    let title : string = ``;

    if (num == 1) {
      title = `Inventario Bodegas - ${this.today}`;
      datos = this.inventarioTotal;
    } else if (num == 2) {
      title = `Inventario Bodega Extrusión - ${this.today}`;
      datos = this.inventarioExtrusion;
    } else if (num == 3) {
      title = `Inventario Bodega Producto Intermedio - ${this.today}`;
      datos = this.inventarioProductoIntermedio;
    } else if (num == 4) {
      title = `Inventario Bodega Impresión - ${this.today}`;
      datos = this.inventarioImpresion;
    } else if (num == 5) {
      title = `Inventario Bodega Rotograbado - ${this.today}`;
      datos = this.inventarioRotograbado;
    } else if (num == 6) {
      title = `Inventario Bodega Sellado - ${this.today}`;
      datos = this.inventarioSellado;
    } else if (num == 7) {
      title = `Inventario Bodega Despacho - ${this.today}`;
      datos = this.inventarioDespacho;
    }
    setTimeout(() => {
      const header = ["Orden Trabajo", "Item", "Referencia", "Cantidad Kg", "Presentación", "Cantidad Rollos", "Bodega Actual"]
      for (const item of datos) {
        const datos1  : any = [item.Orden, item.Item, item.Referencia, item.Cantidad, item.Presentacion, item.Rollos, item.BodegaActual];
        infoDocumento.push(datos1);
      }
      let workbook = new Workbook();
      const imageId1 = workbook.addImage({ base64:  logoParaPdf, extension: 'png', });
      let worksheet = workbook.addWorksheet(title);
      worksheet.addImage(imageId1, 'A1:B3');
      let titleRow = worksheet.addRow([title]);
      titleRow.font = { name: 'Calibri', family: 4, size: 16, underline: 'double', bold: true };
      worksheet.addRow([]);
      worksheet.addRow([]);
      let headerRow = worksheet.addRow(header);
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'eeeeee' }
        }
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      });
      worksheet.mergeCells('A1:G3');
      worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
      infoDocumento.forEach(d => {
        let row = worksheet.addRow(d);
        row.getCell(4).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
        row.getCell(6).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
      });
      worksheet.getColumn(1).width = 20;
      worksheet.getColumn(2).width = 20;
      worksheet.getColumn(3).width = 60;
      worksheet.getColumn(4).width = 30;
      worksheet.getColumn(5).width = 15;
      worksheet.getColumn(6).width = 20;
      worksheet.getColumn(7).width = 30;
      setTimeout(() => {
        workbook.xlsx.writeBuffer().then((data) => {
          let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          fs.saveAs(blob, title + `.xlsx`);
        });
        this.cargando = false;
        this.msj.mensajeConfirmacion(`¡Información Exportada!`, `¡Se ha creado un archivo de Excel con la información del !` + title);
      }, 1000);
    }, 1500);
  }

  // Funcion que va a crear un excel de los detalles
  crearExcelDetallado(){
    this.cargando = true;
    this.inventario = false;
    let datos : any [] = this.inventarioDetallado;
    let infoDocumento : any [] = [];
    let title : string = `Inventario Detallado`;

    setTimeout(() => {
      const header = ["Rollo", "Orden Trabajo", "Item", "Referencia", "Cantidad", "Presentación", "Fecha Ingreso", "Extrusión", "Producto Intermedio", "Impresión", "Rotograbado", "Sellado", "Despacho"]
      for (const item of datos) {
        const datos1  : any = [item.Rollo, item.Orden, item.Item, item.Referencia, item.Cantidad, item.Presentacion, item.Fecha, item.Extrusion, item.ProductoIntermedio, item.Impresion, item.Rotograbado, item.Sellado, item.Despacho];
        infoDocumento.push(datos1);
      }
      let workbook = new Workbook();
      const imageId1 = workbook.addImage({ base64:  logoParaPdf, extension: 'png', });
      let worksheet = workbook.addWorksheet(title);
      worksheet.addImage(imageId1, 'A1:B3');
      let titleRow = worksheet.addRow([title]);
      titleRow.font = { name: 'Calibri', family: 4, size: 16, underline: 'double', bold: true };
      worksheet.addRow([]);
      worksheet.addRow([]);
      let headerRow = worksheet.addRow(header);
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'eeeeee' }
        }
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      });
      worksheet.mergeCells('A1:M3');
      worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
      infoDocumento.forEach(d => {
        let row = worksheet.addRow(d);
        row.getCell(5).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
      });
      worksheet.getColumn(1).width = 20;
      worksheet.getColumn(2).width = 20;
      worksheet.getColumn(3).width = 20;
      worksheet.getColumn(4).width = 60;
      worksheet.getColumn(5).width = 20;
      worksheet.getColumn(6).width = 15;
      worksheet.getColumn(7).width = 15;
      worksheet.getColumn(8).width = 15;
      worksheet.getColumn(9).width = 20;
      worksheet.getColumn(10).width = 15;
      worksheet.getColumn(11).width = 15;
      worksheet.getColumn(12).width = 15;
      worksheet.getColumn(13).width = 15;
      setTimeout(() => {
        workbook.xlsx.writeBuffer().then((data) => {
          let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          fs.saveAs(blob, title + `.xlsx`);
        });
        this.cargando = false;
        this.inventario = true;
        this.msj.mensajeConfirmacion(`¡Información Exportada!`, `¡Se ha creado un archivo de Excel con la información del !` + title);
      }, 1000);
    }, 1500);
  }
}
