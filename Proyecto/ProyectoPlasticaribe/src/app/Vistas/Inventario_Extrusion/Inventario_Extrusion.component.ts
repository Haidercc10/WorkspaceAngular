import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { DtIngRollos_ExtrusionService } from 'src/app/Servicios/DetallesIngresoRollosExtrusion/DtIngRollos_Extrusion.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsInventarioExtrusion as defaultSteps } from 'src/app/data';

@Component({
  selector: 'app-Inventario_Extrusion',
  templateUrl: './Inventario_Extrusion.component.html',
  styleUrls: ['./Inventario_Extrusion.component.css']
})
export class Inventario_ExtrusionComponent implements OnInit {

  FormInventario !: FormGroup;
  cargando : boolean = false ;
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  ArrayRollos : any [] = []; //VAribale que almacenará los rollos consultados
  pesosTotal : number = 0; //Variable que almacenará la suma total de todos los rollos
  datosOrden : boolean = false; //Variable que mostrará o no el modal con los datos de una orden
  numeroOrden : number = 0; //Variable que va a almacenar el numero de la orden que se está consultando
  ArrayInfoOrden : any [] = []; //variable que va a tener la informacion de la orden de trabajo consultada
  pesoTotalOrden : number = 0; //Variable que va a tener el peso total de la orden consultada
  aperturaModal : number = 0;
  modoSeleccionado : boolean;

  constructor(private frmBuilder : FormBuilder,
                private AppComponent : AppComponent,
                  private ingRollosService : DtIngRollos_ExtrusionService,
                    private messageService: MessageService,
                      private shepherdService: ShepherdService,
                        private mensajeService : MensajesAplicacionService,) {

    this.FormInventario = this.frmBuilder.group({
      OrdenTrabajo : [null],
      FechaInicial : [null],
      FechaFinal : [null],
      Rollo : [null],
    });

    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.lecturaStorage();
    this.consultar();
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
  }

  // Funcion que va a hacer que se inicie el tutorial in-app
  tutorial(){
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  // Funcion que exportará a excel todo el contenido de la tabla
  exportToExcel() : void {
    if (this.ArrayRollos.length == 0) this.mensajeService.mensajeAdvertencia('Advertencia', '¡Para exportar el archivo a Excel debe cargar rollos en la tabla!');
    else {
      const title = `Inventario Extrusión - ${this.today}`;
      const header = ["OT", "Producto", "Nombre Producto", "Peso", "Unidad Medida"]
      let datos : any =[];
      for (const item of this.ArrayRollos) {
        const datos1  : any = [item.OT, item.Producto, item.NombreProducto, item.Peso, item.Und];
        datos.push(datos1);
      }
      let workbook = new Workbook();
      let worksheet = workbook.addWorksheet(`Inventario Extrusión - ${this.today}`);
      let titleRow = worksheet.addRow([title]);
      titleRow.font = { name: 'Calibri', family: 4, size: 16, underline: 'double', bold: true };
      worksheet.addRow([]);
      let headerRow = worksheet.addRow(header);
      headerRow.eachCell((cell, number) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'eeeeee' }
        }
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      });
      worksheet.mergeCells('A1:E2');
      worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
      datos.forEach(d => {
        let row = worksheet.addRow(d);
        row.getCell(5).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
      });
      worksheet.getColumn(1).width = 15;
      worksheet.getColumn(2).width = 15;
      worksheet.getColumn(3).width = 60;
      worksheet.getColumn(4).width = 15;
      worksheet.getColumn(5).width = 15;
      setTimeout(() => {
        workbook.xlsx.writeBuffer().then((data) => {
          let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          fs.saveAs(blob, `Inventario Extrusión - ${this.today}.xlsx`);
          this.mensajeService.mensajeConfirmacion(`Confirmación`,`Inventario de extrusión exportado con éxito!`);
        });
      }, 500);
    }
  }

  // Funcion que exportará a excel todo el contenido de la tabla
  exportToExcelModal() : void {
    const title = `Inventario Extrusión OT ${this.numeroOrden} - ${this.today}`;
    const header = ["Rollo", "OT", "Producto", "Nombre Producto", "Peso", "Unidad Medida", "Fecha"]
    let datos : any =[];
    for (const item of this.ArrayInfoOrden) {
      const datos1  : any = [item.Rollo, item.OT, item.Producto, item.NombreProducto, item.Peso, item.Und, item.Fecha];
      datos.push(datos1);
    }
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet(`Inventario Extrusión OT ${this.numeroOrden} - ${this.today}`);
    let titleRow = worksheet.addRow([title]);
    titleRow.font = { name: 'Calibri', family: 4, size: 16, underline: 'double', bold: true };
    worksheet.addRow([]);
    let headerRow = worksheet.addRow(header);
    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'eeeeee' }
      }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    });
    worksheet.mergeCells('A1:G2');
    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    datos.forEach(d => {
      let row = worksheet.addRow(d);
      row.getCell(5).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
    });
    worksheet.getColumn(1).width = 15;
    worksheet.getColumn(2).width = 15;
    worksheet.getColumn(3).width = 15;
    worksheet.getColumn(4).width = 60;
    worksheet.getColumn(5).width = 15;
    worksheet.getColumn(6).width = 15;
    worksheet.getColumn(7).width = 22;
    setTimeout(() => {
      workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        fs.saveAs(blob, `Inventario Extrusión OT ${this.numeroOrden} - ${this.today}.xlsx`);
        this.mensajeService.mensajeConfirmacion(`Confirmación`,`Inventario de extrusión de la OT ${this.numeroOrden} exportado con éxito!`)
      });
    }, 500);
  }

  // funcion que va a limpiar todos los campos
  LimpiarCampos(){
    this.FormInventario.reset();
    this.ArrayRollos = [];
    this.pesosTotal = 0;
    this.cargando = false;
  }

  // Funcion que va a consultar el inventario
  consultar(){
    this.cargando = true;
    this.ArrayRollos = [];
    this.ingRollosService.getTodosRollosDisponiblesAgrupados().subscribe(datos_rollos => {
      for (let i = 0; i < datos_rollos.length; i++) {
        this.llenarTabla(datos_rollos[i]);
      }
    }, () => this.mensajeService.mensajeError(`Error`,`No se pudo obtener el inventario de la bodega de extrusión!`));
  }

  // funcion que va a lenar la tabla con la informacion cosultada
  llenarTabla(data : any){
    let info : any = {
      OT : data.dtIngRollo_OT,
      Producto : data.prod_Id,
      NombreProducto : data.prod_Nombre,
      Peso : data.suma,
      Und : data.undMed_Id,
    }
    this.pesosTotal += info.Peso;
    this.ArrayRollos.push(info);
    this.ArrayRollos.sort((a,b) => Number(a.Rollo) - Number(b.Rollo));
    this.cargando = false;
  }

  // Consultará los datos de la orden de trabajo y los rollo s que tiene
  consultarOrden(orden : number){
    this.numeroOrden = orden;
    this.ArrayInfoOrden = [];
    this.pesoTotalOrden = 0;
    this.datosOrden = true;
    this.ingRollosService.getRollosDisponiblesOT(this.numeroOrden).subscribe(datos_rollos => {
      for (let i = 0; i < datos_rollos.length; i++) {
        this.llenarTablaModal(datos_rollos[i]);
      }
    }, () => this.mensajeService.mensajeError(`Error`,`No se pudo obtener información de los rollos en bodega de la OT N° ${this.numeroOrden}!`));
  }

  // Funcion que va a llenar la tabla del modal con los rollos de la orden de trabajo
  llenarTablaModal(data : any){
    let info : any = {
      Rollo : data.rollo_Id,
      OT : data.dtIngRollo_OT,
      Producto : data.prod_Id,
      NombreProducto : data.prod_Nombre,
      Peso : data.dtIngRollo_Cantidad,
      Und : data.undMed_Id,
      Fecha : data.ingRollo_Fecha.replace('T00:00:00', '')
    }
    this.pesoTotalOrden += info.Peso;
    this.ArrayInfoOrden.push(info);
    this.ArrayInfoOrden.sort((a,b) => Number(a.Rollo) - Number(b.Rollo));
  }

  // Funcion que limpiará los datos del modal
  limpiarModal(){
    this.cargando = false;
    this.numeroOrden = 0;
    this.ArrayInfoOrden = [];
    this.pesoTotalOrden = 0;
    this.datosOrden = false;
    this.aperturaModal = 0;
  }

  // Funcion que limpiará los filtros utilizados en la tabla
  clear = (table: Table) => table.clear();
}
