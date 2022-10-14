import { Component, Inject, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { EstadosService } from 'src/app/Servicios/estados.service';
import { EstadosProcesos_OTService } from 'src/app/Servicios/EstadosProcesos_OT.service';
import { FallasTecnicasService } from 'src/app/Servicios/FallasTecnicas.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import { DetallesEntradaRollosService } from 'src/app/Servicios/DetallesEntradaRollos.service';
import { DatosOTStatusComponent } from '../DatosOT-Status/DatosOT-Status.component';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-Reporte_Procesos_OT',
  templateUrl: './Reporte_Procesos_OT.component.html',
  styleUrls: ['./Reporte_Procesos_OT.component.css']
})
export class Reporte_Procesos_OTComponent implements OnInit {

  @ViewChild(DatosOTStatusComponent) MostrarDatosOTxStatus : DatosOTStatusComponent;

  public formularioOT !: FormGroup;
  public page1 : number; //Variable que tendrá el paginado de la tabla en la que se muestran los pedidos consultados
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = new Date(); //Variable que se usará para llenar la fecha actual
  month : any = new Date(); //Variable que se usará para llenar la fecha de hace un mes
  ArrayDocumento = []; //Varibale que almacenará la información que se mostrará en la tabla de vista
  load : boolean = true; //Variable que permitirá validar si debe salir o no la imagen de carga
  fallas : any = []; //Variable que almacenará las posibles fallas que puede tener una orden de trabajo en produccion
  otSeleccionada : number = 0; //Variable que almacenará el numero de la OT que fue previamente seleccionada
  estados : any = []; //VAriable que almacenará los estados de las ordenes de trabajo
  public arrayDatosOT = [];
  public modal_DatosStatusOT : boolean = false;

  constructor(private frmBuilder : FormBuilder,
                @Inject(SESSION_STORAGE) private storage: WebStorageService,
                  private rolService : RolesService,
                    private fallasTecnicasService : FallasTecnicasService,
                      private estadosProcesos_OTService : EstadosProcesos_OTService,
                        private estadosService : EstadosService,
                          private servicioBagPro : BagproService,
                            private dtEntradasRollosService : DetallesEntradaRollosService,) {

    this.formularioOT = this.frmBuilder.group({
      idDocumento : [null],
      fecha: [null],
      fechaFinal : [null],
      estado : [null],
      fallasOT : [null],
      ObservacionOT : [''],
    });
  }

  ngOnInit() {
    this.fecha();
    this.lecturaStorage();
    this.ObternerFallas();
    this.obtenerEstados();
  }

  //Funcion que colocará la fecha actual
  fecha(){
    this.today = new Date();
    var dd : any = this.today.getDate();
    var mm : any = this.today.getMonth() + 1;
    var yyyy : any = this.today.getFullYear();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    this.today = yyyy + '-' + mm + '-' + dd;

    this.month = new Date();
    var dd : any = this.month.getDate();
    var mm : any = this.month.getMonth();
    var yyyy : any;
    (mm == 12) ? yyyy = this.month.getFullYear() - 1 : yyyy = this.month.getFullYear();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    this.month = yyyy + '-' + mm + '-' + dd;
  }

  /**Leer storage para validar su rol y mostrar el usuario. */
  lecturaStorage(){
    this.storage_Id = this.storage.get('Id');
    this.storage_Nombre = this.storage.get('Nombre');
    let rol = this.storage.get('Rol');
    this.rolService.srvObtenerLista().subscribe(datos_roles => {
      for (let index = 0; index < datos_roles.length; index++) {
        if (datos_roles[index].rolUsu_Id == rol) {
          this.ValidarRol = rol;
          this.storage_Rol = datos_roles[index].rolUsu_Nombre;
        }
      }
    });
  }

  // Funcion que exportará a excel todo el contenido de la tabla
  exportToExcel() : void {
    if (this.ArrayDocumento.length == 0) Swal.fire("¡Para poder crear el archivo de Excel primero debe cargar minimo un OT en la tabla!");
    else {
      this.load = false;
      setTimeout(() => {
        const title = `Reporte de OT por Procesos - ${this.today}`;
        const header = ["OT", "Extrusión", "Impresión", "Rotograbado", "Laminado", "Doblado", "Corte", "Empaque", "Sellado", "Wiketiado", "Cant. Producir", "Cant. Ingresada", "Cant. Enviada", "Fallas", "Observación", "Estado", "Fecha Creación"]
        let datos : any =[];

        for (const item of this.ArrayDocumento) {
          const datos1  : any = [item.ot, item.ext, item.imp, item.rot, item.lam, item.dbl, item.cor, item.emp, item.sel, item.wik, item.cant, item.entrada, item.salida, item.falla, item.obs, item.est, item.fecha];
          datos.push(datos1);
        }
        let workbook = new Workbook();
        let worksheet = workbook.addWorksheet(`Reporte de OT por Procesos - ${this.today}`);
        let titleRow = worksheet.addRow([title]);
        titleRow.font = { name: 'Calibri', family: 4, size: 16, underline: 'double', bold: true };
        worksheet.addRow([]);

        const Colores = ['Iniciado', 'Abierta', 'No Iniciado', 'Terminada', 'Asignada'];

        // // Color Amarillo
        // const amarilloTitle = 'Iniciado';
        // let amarilloRow = worksheet.addRow([amarilloTitle]);
        // amarilloRow.font = { name: 'Calibri', family: 4, size: 12, bold: true };
        // amarilloRow.eachCell((cell, number) => {
        //   cell.fill = {
        //     type: 'pattern',
        //     pattern: 'solid',
        //     fgColor: { argb: 'F9FC5B' }
        //   }
        //   cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
        // });
        // // Color Naranja
        // const naranjaTitle = 'Abierta';
        // let naranjaRow = worksheet.addRow([naranjaTitle]);
        // naranjaRow.font = { name: 'Calibri', family: 4, size: 12, bold: true };
        // naranjaRow.eachCell((cell, number) => {
        //   cell.fill = {
        //     type: 'pattern',
        //     pattern: 'solid',
        //     fgColor: { argb: 'FDCD7A' }
        //   }
        //   cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
        // });
        // // Color Rojo
        // const rojoTitle = 'No Iniciado';
        // let rojoRow = worksheet.addRow([rojoTitle]);
        // rojoRow.font = { name: 'Calibri', family: 4, size: 12, bold: true };
        // rojoRow.eachCell((cell, number) => {
        //   cell.fill = {
        //     type: 'pattern',
        //     pattern: 'solid',
        //     fgColor: { argb: 'FF837B' }
        //   }
        //   cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
        // });

        let coloresRow = worksheet.addRow(Colores);
          let iniciado = coloresRow.getCell(1);
          let abierta = coloresRow.getCell(2);
          let noIniciado = coloresRow.getCell(3);
          let terminado = coloresRow.getCell(4);
          let asignado = coloresRow.getCell(5);

          iniciado.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F9FC5B' }
          }

          abierta.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FDCD7A' }
          }

          noIniciado.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF837B' }
          }

          terminado.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'C7FD7A' }
          }

          asignado.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'ADD8E6' }
          }


        let headerRow = worksheet.addRow(header);
        headerRow.eachCell((cell, number) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'eeeeee' }
          }
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
        });
        worksheet.mergeCells('A1:Q2');
        worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

        datos.forEach(d => {
          let row = worksheet.addRow(d);
          let CantPedida = row.getCell(11);

          let qtyExt = row.getCell(2);
          let qtyImp = row.getCell(3);
          let qtyRot = row.getCell(4);
          let qtyLam = row.getCell(5);
          let qtyDbl = row.getCell(6);
          let qtyCor = row.getCell(7);
          let qtyEmp = row.getCell(8);
          let qtySel = row.getCell(9);
          let qtyWik = row.getCell(10);

          // Extrusion
          row.getCell(2).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          let colorExt;
          if (+qtyExt.value >= d[10]) colorExt = 'C7FD7A'; //Terminada
          else if (+qtyExt.value < d[10] && +qtyExt.value > 0) colorExt = 'F9FC5B'; //Iniciada
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0 && d[15] == 'Abierta') colorExt = 'FDCD7A'; //Abierta
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0  && d[15] == 'Asignada') colorExt = 'ADD8E6'; //Asignada
          else if (+qtyExt.value == 0 && (qtyImp.value == 0 || qtyRot.value == 0 || qtyLam.value == 0 || qtyDbl.value == 0 || qtyCor.value == 0 || qtyEmp.value == 0 || qtySel.value == 0 || qtyWik.value == 0 ) && d[15] != 'Asignada' && d[15] != 'Abierta') colorExt = 'FF837B'; //No Iniciada
          qtyExt.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colorExt }
          }

          // Impresion
          row.getCell(3).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          let colorImp;
          if (+qtyImp.value >= d[10]) colorImp = 'C7FD7A'; //Terminada
          else if (+qtyImp.value < d[10] && +qtyImp.value > 0) colorImp = 'F9FC5B'; //Iniciada
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0 && d[15] == 'Abierta') colorImp = 'FDCD7A'; //Abierta
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0  && d[15] == 'Asignada') colorImp = 'ADD8E6'; //Asignada
          else if (+qtyImp.value == 0 && (qtyExt.value == 0 || qtyRot.value == 0 || qtyLam.value == 0 || qtyDbl.value == 0 || qtyCor.value == 0 || qtyEmp.value == 0 || qtySel.value == 0 || qtyWik.value == 0 ) && d[15] != 'Asignada' && d[15] != 'Abierta') colorImp = 'FF837B'; //No Iniciada
          qtyImp.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colorImp }
          }

          //Rotograbado
          row.getCell(4).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          let colorRot;
          if (+qtyRot.value >= d[10]) colorRot = 'C7FD7A'; //Terminada
          else if (+qtyRot.value < d[10] && +qtyRot.value > 0) colorRot = 'F9FC5B'; //Iniciada
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0 && d[15] == 'Abierta') colorRot = 'FDCD7A'; //Abierta
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0  && d[15] == 'Asignada') colorRot = 'ADD8E6'; //Asignada
          else if (+qtyRot.value == 0 && (qtyExt.value == 0 || qtyImp.value == 0 || qtyLam.value == 0 || qtyDbl.value == 0 || qtyCor.value == 0 || qtyEmp.value == 0 || qtySel.value == 0 || qtyWik.value == 0 ) && d[15] != 'Asignada' && d[15] != 'Abierta') colorRot = 'FF837B'; //No Iniciada
          qtyRot.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colorRot }
          }

          //Laminado
          row.getCell(5).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          let colorLam;
          if (+qtyLam.value >= d[10]) colorLam = 'C7FD7A'; //Terminada
          else if (+qtyLam.value < d[10] && +qtyLam.value > 0) colorLam = 'F9FC5B'; //Iniciada
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0 && d[15] == 'Abierta') colorLam = 'FDCD7A'; //Abierta
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0  && d[15] == 'Asignada') colorLam = 'ADD8E6'; //Asignada
          else if (+qtyLam.value == 0 && (qtyExt.value == 0 || qtyImp.value == 0 || qtyRot.value == 0 || qtyDbl.value == 0 || qtyCor.value == 0 || qtyEmp.value == 0 || qtySel.value == 0 || qtyWik.value == 0 ) && d[15] != 'Asignada' && d[15] != 'Abierta') colorLam = 'FF837B'; //No Iniciada
          qtyLam.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colorLam }
          }

          // Doblado
          row.getCell(6).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          let colorDbl;
          if (+qtyDbl.value >= d[10]) colorDbl = 'C7FD7A'; //Terminada
          else if (+qtyDbl.value < d[10] && +qtyDbl.value > 0) colorDbl = 'F9FC5B'; //Iniciada
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0 && d[15] == 'Abierta') colorDbl = 'FDCD7A'; //Abierta
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0  && d[15] == 'Asignada') colorDbl = 'ADD8E6'; //Asignada
          else if (+qtyDbl.value == 0 && (qtyExt.value == 0 || qtyImp.value == 0 || qtyRot.value == 0 || qtyLam.value == 0 || qtyCor.value == 0 || qtyEmp.value == 0 || qtySel.value == 0 || qtyWik.value == 0 ) && d[15] != 'Asignada' && d[15] != 'Abierta') colorDbl = 'FF837B'; //No Iniciada
          qtyDbl.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colorDbl }
          }

          // Corte
          row.getCell(7).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          let colorCor;
          if (+qtyCor.value >= d[10]) colorCor = 'C7FD7A'; //Terminada
          else if (+qtyCor.value < d[10] && +qtyCor.value > 0) colorCor = 'F9FC5B'; //Iniciada
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0 && d[15] == 'Abierta') colorCor = 'FDCD7A'; //Abierta
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0  && d[15] == 'Asignada') colorCor = 'ADD8E6'; //Asignada
          else if (+qtyCor.value == 0 && (qtyExt.value == 0 || qtyImp.value == 0 || qtyRot.value == 0 || qtyLam.value == 0 || qtyDbl.value == 0 || qtyEmp.value == 0 || qtySel.value == 0 || qtyWik.value == 0 ) && d[15] != 'Asignada' && d[15] != 'Abierta') colorCor = 'FF837B'; //No Iniciada
          qtyCor.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colorCor }
          }

          // Empaque
          row.getCell(8).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          let colorEmp;
          if (+qtyEmp.value >=  (+CantPedida + (+CantPedida * -0.10))) colorEmp = 'C7FD7A'; //Terminada
          else if (+qtyEmp.value <  (+CantPedida + (+CantPedida * -0.10)) && +qtyEmp.value > 0) colorEmp = 'F9FC5B'; //Iniciada
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0 && d[15] == 'Abierta') colorEmp = 'FDCD7A'; //Abierta
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0  && d[15] == 'Asignada') colorEmp = 'ADD8E6'; //Asignada
          else if (+qtyEmp.value == 0 && (qtyExt.value == 0 || qtyImp.value == 0 || qtyRot.value == 0 || qtyLam.value == 0 || qtyDbl.value == 0 || qtyCor.value == 0 || qtySel.value == 0 || qtyWik.value == 0 ) && d[15] != 'Asignada' && d[15] != 'Abierta') colorEmp = 'FF837B'; //No Iniciada
          qtyEmp.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colorEmp }
          }

          // Sellado
          row.getCell(9).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          let colorSel;
          if (+qtySel.value >= (+CantPedida + (+CantPedida * -0.10))) colorSel = 'C7FD7A'; //Terminada
          else if (+qtySel.value <  (+CantPedida + (+CantPedida * -0.10)) && +qtySel.value > 0) colorSel = 'F9FC5B'; //Iniciada
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0 && d[15] == 'Abierta') colorSel = 'FDCD7A'; //Abierta
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0  && d[15] == 'Asignada') colorSel = 'ADD8E6'; //Asignada
          else if (+qtySel.value == 0 && (qtyExt.value == 0 || qtyImp.value == 0 || qtyRot.value == 0 || qtyLam.value == 0 || qtyDbl.value == 0 || qtyCor.value == 0 || qtyEmp.value == 0 || qtyWik.value == 0 ) && d[15] != 'Asignada' && d[15] != 'Abierta') colorSel = 'FF837B'; //No Iniciada
          qtySel.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colorSel }
          }

          // Wiketiado
          row.getCell(10).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          let colorWik;
          if (+qtyWik.value >=  (+CantPedida + (+CantPedida * -0.10))) colorWik = 'C7FD7A'; //Terminada
          else if (+qtyWik.value <  (+CantPedida + (+CantPedida * -0.10)) && +qtyWik.value > 0) colorSel = 'F9FC5B'; //Iniciada
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0 && d[15] == 'Abierta') colorWik = 'FDCD7A'; //Abierta
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0  && d[15] == 'Asignada') colorWik = 'ADD8E6'; //Asignada
          else if (+qtyWik.value == 0 && (qtyExt.value == 0 || qtyImp.value == 0 || qtyRot.value == 0 || qtyLam.value == 0 || qtyDbl.value == 0 || qtyCor.value == 0 || qtyEmp.value == 0 || qtySel.value == 0 ) && d[15] != 'Asignada' && d[15] != 'Abierta') colorWik = 'FF837B'; //No Iniciada
          qtyWik.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colorWik }
          }

          row.getCell(11).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(12).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(13).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
        });

        /** Significado info colores. */
       /* worksheet.getCell('S3').value = "Info. Colores"
        worksheet.getCell('S3').fill = {
          type: 'pattern',
          pattern:'darkVertical',
          bgColor:{argb:'eeeeee'},
          fgColor:{argb:'eeeeee'},
        };
        worksheet.getCell('S3').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }

        worksheet.getCell('S4').value = "Abierta"
        worksheet.getCell('S4').fill = {
          type: 'pattern',
          pattern:'darkVertical',
          bgColor:{argb:'FDCD7A'},
          fgColor:{argb:'FDCD7A'},
        };
        worksheet.getCell('S5').value = "En Proceso"
        worksheet.getCell('S5').fill = {
          type: 'pattern',
          pattern:'solid',
          bgColor:{argb:'FF837B'},
          fgColor:{argb:'FF837B'},
        };

        worksheet.getCell('S6').value = "Terminada"
        worksheet.getCell('S6').fill = {
          type: 'pattern',
          pattern:'solid',
          fgColor:{argb:'C7FD7A'},
          bgColor:{argb:'C7FD7A'},
        };

        worksheet.getCell('S7').value = "Cerrada"
        worksheet.getCell('S7').fill = {
          type: 'pattern',
          pattern:'solid',
          fgColor:{argb:'FDCD7A'},
          bgColor:{argb:'FDCD7A'},
        };

        worksheet.getCell('S8').value = "Asignada"
        worksheet.getCell('S8').fill = {
          type: 'pattern',
          pattern:'solid',
          fgColor:{argb:'FF837B'},
          bgColor:{argb:'FF837B'},
        };*/

        worksheet.getColumn(1).width = 10;
        worksheet.getColumn(2).width = 12;
        worksheet.getColumn(3).width = 12;
        worksheet.getColumn(4).width = 12;
        worksheet.getColumn(5).width = 12;
        worksheet.getColumn(6).width = 12;
        worksheet.getColumn(7).width = 12;
        worksheet.getColumn(8).width = 12;
        worksheet.getColumn(9).width = 12;
        worksheet.getColumn(10).width = 12;
        worksheet.getColumn(11).width = 15;
        worksheet.getColumn(12).width = 15;
        worksheet.getColumn(13).width = 15;
        worksheet.getColumn(14).width = 20;
        worksheet.getColumn(15).width = 20;
        worksheet.getColumn(16).width = 15;
        worksheet.getColumn(17).width = 15;
        worksheet.getColumn(19).width = 15;

        setTimeout(() => {
          workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, `Reporte de OT por Procesos - ${this.today}.xlsx`);
          });
          this.load = true;
        }, 1000);
      }, 3500);
    }
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  // Funcion que limpiará todos los campos de la vista
  limpiarCampos(){
    this.ArrayDocumento = [];
    this.formularioOT = this.frmBuilder.group({
      idDocumento : [null],
      fecha: [null],
      fechaFinal : [null],
      estado : [null],
      fallasOT : [null],
      ObservacionOT : [''],
    });
    this.otSeleccionada = 0;
  }

  // Funcion que mostrará las posibles fallas que puede tener una orden de trabajo en produccion
  ObternerFallas(){
    this.fallasTecnicasService.srvObtenerLista().subscribe(datos_fallas => {
      for (let i = 0; i < datos_fallas.length; i++) {
        this.fallas.push(datos_fallas[i]);
      }
    });
  }

  //Funcion que consultará los estados para ordenes de trabajo
  obtenerEstados(){
    this.estadosService.srvObtenerListaEstados().subscribe(datos_estados => {
      for (let i = 0; i < datos_estados.length; i++) {
        if (datos_estados[i].tpEstado_Id == 4) this.estados.push(datos_estados[i]);
        this.estados.sort((a,b) => a.estado_Nombre.localeCompare(b.estado_Nombre));
      }
    })
  }

  //Funcion que consultará las ordenes de trabajo dependiendo de los filtros que se le pasen
  consultarOT(){
    this.load = false;
    this.otSeleccionada = 0;
    this.ArrayDocumento = [];
    let numOT : number = this.formularioOT.value.idDocumento;
    let fechaincial : any = this.formularioOT.value.fecha;
    let fechaFinal : any = this.formularioOT.value.fechaFinal;
    let fallas : any = this.formularioOT.value.fallasOT;
    let estado : number = this.formularioOT.value.estado;

    if (numOT != null && fechaincial != null && fechaFinal != null && fallas != null && estado != null) {
      this.estadosProcesos_OTService.srvObtenerListaPorOtFechasFallas(numOT, fechaincial, fechaFinal, fallas).subscribe(datos_ot => {
        if (datos_ot.length == 0) setTimeout(() => { Swal.fire(`No se encontraron OT's con la combinación de filtros consultada.`); }, 3000);
        else {
          for (let i = 0; i < datos_ot.length; i++) {
            if (datos_ot[i].estado_Id == estado) {
              this.llenarArray(datos_ot[i].estProcOT_OrdenTrabajo,
                              datos_ot[i].estProcOT_ExtrusionKg,
                              datos_ot[i].estProcOT_ImpresionKg,
                              datos_ot[i].estProcOT_RotograbadoKg,
                              datos_ot[i].estProcOT_DobladoKg,
                              datos_ot[i].estProcOT_LaminadoKg,
                              datos_ot[i].estProcOT_CorteKg,
                              datos_ot[i].estProcOT_EmpaqueKg,
                              datos_ot[i].estProcOT_SelladoKg,
                              datos_ot[i].estProcOT_WiketiadoKg,
                              datos_ot[i].estProcOT_CantidadPedida,
                              datos_ot[i].falla_Nombre,
                              datos_ot[i].estProcOT_Observacion,
                              datos_ot[i].estado_Nombre,
                              datos_ot[i].estProcOT_FechaCreacion,);
            }
          }
        }
      });
    } else if (numOT != null && fechaincial != null && fechaFinal != null && fallas != null) {
      this.estadosProcesos_OTService.srvObtenerListaPorOtFechasFallas(numOT, fechaincial, fechaFinal, fallas).subscribe(datos_ot => {
        if (datos_ot.length == 0) setTimeout(() => { Swal.fire(`No se encontraron OT's con la combinación de filtros consultada.`); }, 3000);
        else {
          for (let i = 0; i < datos_ot.length; i++) {
            this.llenarArray(datos_ot[i].estProcOT_OrdenTrabajo,
                            datos_ot[i].estProcOT_ExtrusionKg,
                            datos_ot[i].estProcOT_ImpresionKg,
                            datos_ot[i].estProcOT_RotograbadoKg,
                            datos_ot[i].estProcOT_DobladoKg,
                            datos_ot[i].estProcOT_LaminadoKg,
                            datos_ot[i].estProcOT_CorteKg,
                            datos_ot[i].estProcOT_EmpaqueKg,
                            datos_ot[i].estProcOT_SelladoKg,
                            datos_ot[i].estProcOT_WiketiadoKg,
                            datos_ot[i].estProcOT_CantidadPedida,
                            datos_ot[i].falla_Nombre,
                            datos_ot[i].estProcOT_Observacion,
                            datos_ot[i].estado_Nombre,
                            datos_ot[i].estProcOT_FechaCreacion,);
          }
        }
      });
    } else if (fechaincial != null && fechaFinal != null && fallas != null && estado != null) {
      this.estadosProcesos_OTService.srvObtenerListaPorFechasEstadoFalla(fechaincial, fechaFinal, estado, fallas).subscribe(datos_ot => {
        if (datos_ot.length == 0) setTimeout(() => { Swal.fire(`No se encontraron OT's con la combinación de filtros consultada.`); }, 3000);
        else {
          for (let i = 0; i < datos_ot.length; i++) {
            this.llenarArray(datos_ot[i].estProcOT_OrdenTrabajo,
                            datos_ot[i].estProcOT_ExtrusionKg,
                            datos_ot[i].estProcOT_ImpresionKg,
                            datos_ot[i].estProcOT_RotograbadoKg,
                            datos_ot[i].estProcOT_DobladoKg,
                            datos_ot[i].estProcOT_LaminadoKg,
                            datos_ot[i].estProcOT_CorteKg,
                            datos_ot[i].estProcOT_EmpaqueKg,
                            datos_ot[i].estProcOT_SelladoKg,
                            datos_ot[i].estProcOT_WiketiadoKg,
                            datos_ot[i].estProcOT_CantidadPedida,
                            datos_ot[i].falla_Nombre,
                            datos_ot[i].estProcOT_Observacion,
                            datos_ot[i].estado_Nombre,
                            datos_ot[i].estProcOT_FechaCreacion,);
          }
        }
      });
    } else if (numOT != null && fechaincial != null && fechaFinal != null && estado != null) {
      this.estadosProcesos_OTService.srvObtenerListaPorOtFechas(numOT, fechaincial, fechaFinal).subscribe(datos_ot => {
        if (datos_ot.length == 0) setTimeout(() => { Swal.fire(`No se encontraron OT's con la combinación de filtros consultada.`); }, 3000);
        else {
          for (let i = 0; i < datos_ot.length; i++) {
            if (datos_ot[i].estado_Id == estado){
              this.llenarArray(datos_ot[i].estProcOT_OrdenTrabajo,
                              datos_ot[i].estProcOT_ExtrusionKg,
                              datos_ot[i].estProcOT_ImpresionKg,
                              datos_ot[i].estProcOT_RotograbadoKg,
                              datos_ot[i].estProcOT_DobladoKg,
                              datos_ot[i].estProcOT_LaminadoKg,
                              datos_ot[i].estProcOT_CorteKg,
                              datos_ot[i].estProcOT_EmpaqueKg,
                              datos_ot[i].estProcOT_SelladoKg,
                              datos_ot[i].estProcOT_WiketiadoKg,
                              datos_ot[i].estProcOT_CantidadPedida,
                              datos_ot[i].falla_Nombre,
                              datos_ot[i].estProcOT_Observacion,
                              datos_ot[i].estado_Nombre,
                              datos_ot[i].estProcOT_FechaCreacion,);
            }
          }
        }
      });
    } else if (fechaincial != null && fechaFinal != null && fallas != null) {
      this.estadosProcesos_OTService.srvObtenerListaPorFechasFallas(fechaincial, fechaFinal, fallas).subscribe(datos_ot => {
        if (datos_ot.length == 0) setTimeout(() => { Swal.fire(`No se encontraron OT's con la combinación de filtros consultada.`); }, 3000);
        else {
          for (let i = 0; i < datos_ot.length; i++) {
            this.llenarArray(datos_ot[i].estProcOT_OrdenTrabajo,
                            datos_ot[i].estProcOT_ExtrusionKg,
                            datos_ot[i].estProcOT_ImpresionKg,
                            datos_ot[i].estProcOT_RotograbadoKg,
                            datos_ot[i].estProcOT_DobladoKg,
                            datos_ot[i].estProcOT_LaminadoKg,
                            datos_ot[i].estProcOT_CorteKg,
                            datos_ot[i].estProcOT_EmpaqueKg,
                            datos_ot[i].estProcOT_SelladoKg,
                            datos_ot[i].estProcOT_WiketiadoKg,
                            datos_ot[i].estProcOT_CantidadPedida,
                            datos_ot[i].falla_Nombre,
                            datos_ot[i].estProcOT_Observacion,
                            datos_ot[i].estado_Nombre,
                            datos_ot[i].estProcOT_FechaCreacion,);
          }
        }
      });
    } else if (numOT != null && fechaincial != null && fechaFinal != null) {
      this.estadosProcesos_OTService.srvObtenerListaPorOtFechas(numOT, fechaincial, fechaFinal).subscribe(datos_ot => {
        if (datos_ot.length == 0) setTimeout(() => { Swal.fire(`No se encontraron OT's con la combinación de filtros consultada.`); }, 3000);
        else {
          for (let i = 0; i < datos_ot.length; i++) {
            this.llenarArray(datos_ot[i].estProcOT_OrdenTrabajo,
                            datos_ot[i].estProcOT_ExtrusionKg,
                            datos_ot[i].estProcOT_ImpresionKg,
                            datos_ot[i].estProcOT_RotograbadoKg,
                            datos_ot[i].estProcOT_DobladoKg,
                            datos_ot[i].estProcOT_LaminadoKg,
                            datos_ot[i].estProcOT_CorteKg,
                            datos_ot[i].estProcOT_EmpaqueKg,
                            datos_ot[i].estProcOT_SelladoKg,
                            datos_ot[i].estProcOT_WiketiadoKg,
                            datos_ot[i].estProcOT_CantidadPedida,
                            datos_ot[i].falla_Nombre,
                            datos_ot[i].estProcOT_Observacion,
                            datos_ot[i].estado_Nombre,
                            datos_ot[i].estProcOT_FechaCreacion,);
          }
        }
      });
    } else if (numOT != null && fallas != null && estado != null) {
      this.estadosProcesos_OTService.srvObtenerListaPorOtFallas(numOT, fallas).subscribe(datos_ot => {
        if (datos_ot.length == 0) setTimeout(() => { Swal.fire(`No se encontraron OT's con la combinación de filtros consultada.`); }, 3000);
        else {
          for (let i = 0; i < datos_ot.length; i++) {
            if (estado == datos_ot[i].estado_Id) {
              this.llenarArray(datos_ot[i].estProcOT_OrdenTrabajo,
                              datos_ot[i].estProcOT_ExtrusionKg,
                              datos_ot[i].estProcOT_ImpresionKg,
                              datos_ot[i].estProcOT_RotograbadoKg,
                              datos_ot[i].estProcOT_DobladoKg,
                              datos_ot[i].estProcOT_LaminadoKg,
                              datos_ot[i].estProcOT_CorteKg,
                              datos_ot[i].estProcOT_EmpaqueKg,
                              datos_ot[i].estProcOT_SelladoKg,
                              datos_ot[i].estProcOT_WiketiadoKg,
                              datos_ot[i].estProcOT_CantidadPedida,
                              datos_ot[i].falla_Nombre,
                              datos_ot[i].estProcOT_Observacion,
                              datos_ot[i].estado_Nombre,
                              datos_ot[i].estProcOT_FechaCreacion,);
            }
          }
        }
      });
    } else if (fechaincial != null && fechaFinal != null && estado != null) {
      this.estadosProcesos_OTService.srvObtenerListaPorFechasEstado(fechaincial, fechaFinal, estado).subscribe(datos_ot => {
        if (datos_ot.length == 0) setTimeout(() => { Swal.fire(`No se encontraron OT's con la combinación de filtros consultada.`); }, 3000);
        else {
          for (let i = 0; i < datos_ot.length; i++) {
            this.llenarArray(datos_ot[i].estProcOT_OrdenTrabajo,
                            datos_ot[i].estProcOT_ExtrusionKg,
                            datos_ot[i].estProcOT_ImpresionKg,
                            datos_ot[i].estProcOT_RotograbadoKg,
                            datos_ot[i].estProcOT_DobladoKg,
                            datos_ot[i].estProcOT_LaminadoKg,
                            datos_ot[i].estProcOT_CorteKg,
                            datos_ot[i].estProcOT_EmpaqueKg,
                            datos_ot[i].estProcOT_SelladoKg,
                            datos_ot[i].estProcOT_WiketiadoKg,
                            datos_ot[i].estProcOT_CantidadPedida,
                            datos_ot[i].falla_Nombre,
                            datos_ot[i].estProcOT_Observacion,
                            datos_ot[i].estado_Nombre,
                            datos_ot[i].estProcOT_FechaCreacion,);
          }
        }
      });
    } else if (fechaincial != null && fallas != null && estado != null) {
      this.estadosProcesos_OTService.srvObtenerListaPorFechaEstadoFalla(fechaincial, estado, fallas).subscribe(datos_ot => {
        if (datos_ot.length == 0) setTimeout(() => { Swal.fire(`No se encontraron OT's con la combinación de filtros consultada.`); }, 3000);
        else {
            for (let i = 0; i < datos_ot.length; i++) {
              this.llenarArray(datos_ot[i].estProcOT_OrdenTrabajo,
                              datos_ot[i].estProcOT_ExtrusionKg,
                              datos_ot[i].estProcOT_ImpresionKg,
                              datos_ot[i].estProcOT_RotograbadoKg,
                              datos_ot[i].estProcOT_DobladoKg,
                              datos_ot[i].estProcOT_LaminadoKg,
                              datos_ot[i].estProcOT_CorteKg,
                              datos_ot[i].estProcOT_EmpaqueKg,
                              datos_ot[i].estProcOT_SelladoKg,
                              datos_ot[i].estProcOT_WiketiadoKg,
                              datos_ot[i].estProcOT_CantidadPedida,
                              datos_ot[i].falla_Nombre,
                              datos_ot[i].estProcOT_Observacion,
                              datos_ot[i].estado_Nombre,
                              datos_ot[i].estProcOT_FechaCreacion,);
            }
        }
      });
    } else if (numOT != null && fechaincial != null && estado != null) {
      this.estadosProcesos_OTService.srvObtenerListaPorOtFecha(numOT, fechaincial).subscribe(datos_ot => {
        if (datos_ot.length == 0) setTimeout(() => { Swal.fire(`No se encontraron OT's con la combinación de filtros consultada.`); }, 3000);
        else {
          for (let i = 0; i < datos_ot.length; i++) {
            if (datos_ot[i].estado_Id == estado) {
              this.llenarArray(datos_ot[i].estProcOT_OrdenTrabajo,
                              datos_ot[i].estProcOT_ExtrusionKg,
                              datos_ot[i].estProcOT_ImpresionKg,
                              datos_ot[i].estProcOT_RotograbadoKg,
                              datos_ot[i].estProcOT_DobladoKg,
                              datos_ot[i].estProcOT_LaminadoKg,
                              datos_ot[i].estProcOT_CorteKg,
                              datos_ot[i].estProcOT_EmpaqueKg,
                              datos_ot[i].estProcOT_SelladoKg,
                              datos_ot[i].estProcOT_WiketiadoKg,
                              datos_ot[i].estProcOT_CantidadPedida,
                              datos_ot[i].falla_Nombre,
                              datos_ot[i].estProcOT_Observacion,
                              datos_ot[i].estado_Nombre,
                              datos_ot[i].estProcOT_FechaCreacion,);
            }
          }
        }
      });

    } else if (fechaincial != null && fechaFinal != null) {
      if (fechaincial < '2022-05-01' && fechaFinal < '2022-05-01') setTimeout(() => { Swal.fire('Solo se mostrarán OTs desde el inicio de las Asignaciones de Materia Prima (01/05/2022)'); }, 3000);
      else if(fechaFinal < fechaincial) setTimeout(() => { Swal.fire('La fecha final debe ser mayor que la fecha inicial');}, 3000);
      else{
        this.estadosProcesos_OTService.srvObtenerListaPorFechas(fechaincial, fechaFinal).subscribe(datos_ot => {
          if (datos_ot.length == 0) setTimeout(() => { Swal.fire('No existen OTs creadas en las fechas consultadas.'); }, 3000);
          else {
            for (let i = 0; i < datos_ot.length; i++) {
              this.llenarArray(datos_ot[i].estProcOT_OrdenTrabajo,
                              datos_ot[i].estProcOT_ExtrusionKg,
                              datos_ot[i].estProcOT_ImpresionKg,
                              datos_ot[i].estProcOT_RotograbadoKg,
                              datos_ot[i].estProcOT_DobladoKg,
                              datos_ot[i].estProcOT_LaminadoKg,
                              datos_ot[i].estProcOT_CorteKg,
                              datos_ot[i].estProcOT_EmpaqueKg,
                              datos_ot[i].estProcOT_SelladoKg,
                              datos_ot[i].estProcOT_WiketiadoKg,
                              datos_ot[i].estProcOT_CantidadPedida,
                              datos_ot[i].falla_Nombre,
                              datos_ot[i].estProcOT_Observacion,
                              datos_ot[i].estado_Nombre,
                              datos_ot[i].estProcOT_FechaCreacion,);
            }
          }
        });
      }
    } else if (numOT != null && fechaincial != null) {
      this.estadosProcesos_OTService.srvObtenerListaPorOtFecha(numOT, fechaincial).subscribe(datos_ot => {
        if (datos_ot.length == 0) setTimeout(() => { Swal.fire(`No se encontraron OT's con la combinación de filtros consultada.`); }, 3000);
        else {
          for (let i = 0; i < datos_ot.length; i++) {
            this.llenarArray(datos_ot[i].estProcOT_OrdenTrabajo,
                            datos_ot[i].estProcOT_ExtrusionKg,
                            datos_ot[i].estProcOT_ImpresionKg,
                            datos_ot[i].estProcOT_RotograbadoKg,
                            datos_ot[i].estProcOT_DobladoKg,
                            datos_ot[i].estProcOT_LaminadoKg,
                            datos_ot[i].estProcOT_CorteKg,
                            datos_ot[i].estProcOT_EmpaqueKg,
                            datos_ot[i].estProcOT_SelladoKg,
                            datos_ot[i].estProcOT_WiketiadoKg,
                            datos_ot[i].estProcOT_CantidadPedida,
                            datos_ot[i].falla_Nombre,
                            datos_ot[i].estProcOT_Observacion,
                            datos_ot[i].estado_Nombre,
                            datos_ot[i].estProcOT_FechaCreacion,);
          }
        }
      });
    } else if (numOT != null && fallas != null) {
      this.estadosProcesos_OTService.srvObtenerListaPorOtFallas(numOT, fallas).subscribe(datos_ot => {
        if (datos_ot.length == 0) setTimeout(() => {Swal.fire(`No se encontraron OT's con la combinación de filtros consultada.`);}, 3000);
        else {
          for (let i = 0; i < datos_ot.length; i++) {
            this.llenarArray(datos_ot[i].estProcOT_OrdenTrabajo,
                            datos_ot[i].estProcOT_ExtrusionKg,
                            datos_ot[i].estProcOT_ImpresionKg,
                            datos_ot[i].estProcOT_RotograbadoKg,
                            datos_ot[i].estProcOT_DobladoKg,
                            datos_ot[i].estProcOT_LaminadoKg,
                            datos_ot[i].estProcOT_CorteKg,
                            datos_ot[i].estProcOT_EmpaqueKg,
                            datos_ot[i].estProcOT_SelladoKg,
                            datos_ot[i].estProcOT_WiketiadoKg,
                            datos_ot[i].estProcOT_CantidadPedida,
                            datos_ot[i].falla_Nombre,
                            datos_ot[i].estProcOT_Observacion,
                            datos_ot[i].estado_Nombre,
                            datos_ot[i].estProcOT_FechaCreacion,);
          }
        }
      });
    } else if (fechaincial != null && fallas != null) {
      if (fechaincial < '2022-05-01') setTimeout(() => { Swal.fire(`Solo se muestran OT's desde el inicio de las asignaciones de Materia Prima (01/05/2022)`); }, 3000);
      else {
        this.estadosProcesos_OTService.srvObtenerListaPorOtFechaFalla(fechaincial, fallas).subscribe(datos_ot => {
          for (let i = 0; i < datos_ot.length; i++) {
            this.llenarArray(datos_ot[i].estProcOT_OrdenTrabajo,
                            datos_ot[i].estProcOT_ExtrusionKg,
                            datos_ot[i].estProcOT_ImpresionKg,
                            datos_ot[i].estProcOT_RotograbadoKg,
                            datos_ot[i].estProcOT_DobladoKg,
                            datos_ot[i].estProcOT_LaminadoKg,
                            datos_ot[i].estProcOT_CorteKg,
                            datos_ot[i].estProcOT_EmpaqueKg,
                            datos_ot[i].estProcOT_SelladoKg,
                            datos_ot[i].estProcOT_WiketiadoKg,
                            datos_ot[i].estProcOT_CantidadPedida,
                            datos_ot[i].falla_Nombre,
                            datos_ot[i].estProcOT_Observacion,
                            datos_ot[i].estado_Nombre,
                            datos_ot[i].estProcOT_FechaCreacion,);
          }
        });
      }
    } else if (estado != null && numOT != null) {
      this.estadosProcesos_OTService.srvObtenerListaPorOT(numOT).subscribe(datos_ot => {
        if (datos_ot.length == 0) setTimeout(() => { Swal.fire(`No se encontraron OT's con la combinación de filtros consultada.`); }, 3000);
        else{
          for (let i = 0; i < datos_ot.length; i++) {
            if (datos_ot[i].estado_Id == estado) {
              this.llenarArray(datos_ot[i].estProcOT_OrdenTrabajo,
                              datos_ot[i].estProcOT_ExtrusionKg,
                              datos_ot[i].estProcOT_ImpresionKg,
                              datos_ot[i].estProcOT_RotograbadoKg,
                              datos_ot[i].estProcOT_DobladoKg,
                              datos_ot[i].estProcOT_LaminadoKg,
                              datos_ot[i].estProcOT_CorteKg,
                              datos_ot[i].estProcOT_EmpaqueKg,
                              datos_ot[i].estProcOT_SelladoKg,
                              datos_ot[i].estProcOT_WiketiadoKg,
                              datos_ot[i].estProcOT_CantidadPedida,
                              datos_ot[i].falla_Nombre,
                              datos_ot[i].estProcOT_Observacion,
                              datos_ot[i].estado_Nombre,
                              datos_ot[i].estProcOT_FechaCreacion,);
            }
          }
        }
      });
    } else if (estado != null && fallas != null) {
      this.estadosProcesos_OTService.srvObtenerListaPorOtEstadoFalla(estado, fallas).subscribe(datos_ot => {
        if (datos_ot.length == 0) setTimeout(() => { Swal.fire(`No se encontraron OT's con la combinación de filtros consultada.`); }, 3000);
        else{
          for (let i = 0; i < datos_ot.length; i++) {
            this.llenarArray(datos_ot[i].estProcOT_OrdenTrabajo,
                            datos_ot[i].estProcOT_ExtrusionKg,
                            datos_ot[i].estProcOT_ImpresionKg,
                            datos_ot[i].estProcOT_RotograbadoKg,
                            datos_ot[i].estProcOT_DobladoKg,
                            datos_ot[i].estProcOT_LaminadoKg,
                            datos_ot[i].estProcOT_CorteKg,
                            datos_ot[i].estProcOT_EmpaqueKg,
                            datos_ot[i].estProcOT_SelladoKg,
                            datos_ot[i].estProcOT_WiketiadoKg,
                            datos_ot[i].estProcOT_CantidadPedida,
                            datos_ot[i].falla_Nombre,
                            datos_ot[i].estProcOT_Observacion,
                            datos_ot[i].estado_Nombre,
                            datos_ot[i].estProcOT_FechaCreacion,);
          }
        }
      });
    } else if (fechaincial != null && estado != null) {
      this.estadosProcesos_OTService.srvObtenerListaPorFecha(fechaincial).subscribe(datos_ot => {
        if (datos_ot.length == 0) setTimeout(() => {Swal.fire(`No se encontraron OT's con la combinación de filtros consultada.`); }, 3000);
        else{
          for (let i = 0; i < datos_ot.length; i++) {
            if (datos_ot[i].estado_Id == estado) {
              this.llenarArray(datos_ot[i].estProcOT_OrdenTrabajo,
                              datos_ot[i].estProcOT_ExtrusionKg,
                              datos_ot[i].estProcOT_ImpresionKg,
                              datos_ot[i].estProcOT_RotograbadoKg,
                              datos_ot[i].estProcOT_DobladoKg,
                              datos_ot[i].estProcOT_LaminadoKg,
                              datos_ot[i].estProcOT_CorteKg,
                              datos_ot[i].estProcOT_EmpaqueKg,
                              datos_ot[i].estProcOT_SelladoKg,
                              datos_ot[i].estProcOT_WiketiadoKg,
                              datos_ot[i].estProcOT_CantidadPedida,
                              datos_ot[i].falla_Nombre,
                              datos_ot[i].estProcOT_Observacion,
                              datos_ot[i].estado_Nombre,
                              datos_ot[i].estProcOT_FechaCreacion,);
            }
          }
        }
      });
    } else if (numOT != null) {
      this.estadosProcesos_OTService.srvObtenerListaPorOT(numOT).subscribe(datos_ot => {
        if (datos_ot.length == 0) setTimeout(() => {Swal.fire('No se encontró la OT consultada.');}, 3000);
        else {
          for (let i = 0; i < datos_ot.length; i++) {
            this.llenarArray(datos_ot[i].estProcOT_OrdenTrabajo,
                            datos_ot[i].estProcOT_ExtrusionKg,
                            datos_ot[i].estProcOT_ImpresionKg,
                            datos_ot[i].estProcOT_RotograbadoKg,
                            datos_ot[i].estProcOT_DobladoKg,
                            datos_ot[i].estProcOT_LaminadoKg,
                            datos_ot[i].estProcOT_CorteKg,
                            datos_ot[i].estProcOT_EmpaqueKg,
                            datos_ot[i].estProcOT_SelladoKg,
                            datos_ot[i].estProcOT_WiketiadoKg,
                            datos_ot[i].estProcOT_CantidadPedida,
                            datos_ot[i].falla_Nombre,
                            datos_ot[i].estProcOT_Observacion,
                            datos_ot[i].estado_Nombre,
                            datos_ot[i].estProcOT_FechaCreacion,);
          }
        }

      });
    } else if (fechaincial != null) {
      if (fechaincial < '2022-05-01') setTimeout(() => { Swal.fire(`Solo se muestran OT's desde el inicio de las asignaciones de Materia Prima (2022-05-01)`); }, 3000);
      else {
        this.estadosProcesos_OTService.srvObtenerListaPorFecha(fechaincial).subscribe(datos_ot => {
          if (datos_ot.length == 0) setTimeout(() => { Swal.fire(`No se encontraron OTs creadas el día ${fechaincial}`); }, 3000);
          else {
            for (let i = 0; i < datos_ot.length; i++) {
              this.llenarArray(datos_ot[i].estProcOT_OrdenTrabajo,
                datos_ot[i].estProcOT_ExtrusionKg,
                datos_ot[i].estProcOT_ImpresionKg,
                datos_ot[i].estProcOT_RotograbadoKg,
                datos_ot[i].estProcOT_DobladoKg,
                datos_ot[i].estProcOT_LaminadoKg,
                datos_ot[i].estProcOT_CorteKg,
                datos_ot[i].estProcOT_EmpaqueKg,
                datos_ot[i].estProcOT_SelladoKg,
                datos_ot[i].estProcOT_WiketiadoKg,
                datos_ot[i].estProcOT_CantidadPedida,
                datos_ot[i].falla_Nombre,
                datos_ot[i].estProcOT_Observacion,
                datos_ot[i].estado_Nombre,
                datos_ot[i].estProcOT_FechaCreacion);
            }
          };
        });
      }
    } else if (fallas != null) {
      this.estadosProcesos_OTService.srvObtenerListaPorFallas(fallas).subscribe(datos_ot => {
        if (datos_ot.length == 0) setTimeout(() => { Swal.fire('No se encontraron OTs con la falla consultada.'); }, 3000);
        else {
          for (let i = 0; i < datos_ot.length; i++) {
            this.llenarArray(datos_ot[i].estProcOT_OrdenTrabajo,
                            datos_ot[i].estProcOT_ExtrusionKg,
                            datos_ot[i].estProcOT_ImpresionKg,
                            datos_ot[i].estProcOT_RotograbadoKg,
                            datos_ot[i].estProcOT_DobladoKg,
                            datos_ot[i].estProcOT_LaminadoKg,
                            datos_ot[i].estProcOT_CorteKg,
                            datos_ot[i].estProcOT_EmpaqueKg,
                            datos_ot[i].estProcOT_SelladoKg,
                            datos_ot[i].estProcOT_WiketiadoKg,
                            datos_ot[i].estProcOT_CantidadPedida,
                            datos_ot[i].falla_Nombre,
                            datos_ot[i].estProcOT_Observacion,
                            datos_ot[i].estado_Nombre,
                            datos_ot[i].estProcOT_FechaCreacion,);
          }
        }
      });
    } else if (estado != null) {
      this.estadosProcesos_OTService.srvObtenerListaPorOtEstado(estado).subscribe(datos_ot => {
        if (datos_ot.length == 0) setTimeout(() => {Swal.fire(`No se encontraron OT's con el Estado consultado.`);}, 3000);
        else{
          for (let i = 0; i < datos_ot.length; i++) {
            this.llenarArray(datos_ot[i].estProcOT_OrdenTrabajo,
                            datos_ot[i].estProcOT_ExtrusionKg,
                            datos_ot[i].estProcOT_ImpresionKg,
                            datos_ot[i].estProcOT_RotograbadoKg,
                            datos_ot[i].estProcOT_DobladoKg,
                            datos_ot[i].estProcOT_LaminadoKg,
                            datos_ot[i].estProcOT_CorteKg,
                            datos_ot[i].estProcOT_EmpaqueKg,
                            datos_ot[i].estProcOT_SelladoKg,
                            datos_ot[i].estProcOT_WiketiadoKg,
                            datos_ot[i].estProcOT_CantidadPedida,
                            datos_ot[i].falla_Nombre,
                            datos_ot[i].estProcOT_Observacion,
                            datos_ot[i].estado_Nombre,
                            datos_ot[i].estProcOT_FechaCreacion,);
          }
        }
      });
    } else {
      this.estadosProcesos_OTService.srvObtenerListaPorFecha(this.today).subscribe(datos_ot => {
        if (datos_ot.length == 0) setTimeout(() => { Swal.fire(`No se encontraron OT's creadas del día de hoy.`); }, 3000);
        else {
          for (let i = 0; i < datos_ot.length; i++) {
            this.llenarArray(datos_ot[i].estProcOT_OrdenTrabajo,
              datos_ot[i].estProcOT_ExtrusionKg,
              datos_ot[i].estProcOT_ImpresionKg,
              datos_ot[i].estProcOT_RotograbadoKg,
              datos_ot[i].estProcOT_DobladoKg,
              datos_ot[i].estProcOT_LaminadoKg,
              datos_ot[i].estProcOT_CorteKg,
              datos_ot[i].estProcOT_EmpaqueKg,
              datos_ot[i].estProcOT_SelladoKg,
              datos_ot[i].estProcOT_WiketiadoKg,
              datos_ot[i].estProcOT_CantidadPedida,
              datos_ot[i].falla_Nombre,
              datos_ot[i].estProcOT_Observacion,
              datos_ot[i].estado_Nombre,
              datos_ot[i].estProcOT_FechaCreacion);
          }
        }
      });
    }

    setTimeout(() => { this.load = true; }, 2500);
  }

  //Funcion encargada de llenar un array con la informacion de las ordenes de trabajo y el producido de cada area
  llenarArray(ot : number, ext : number, imp : number, rot : number, dbl : number, lam : number, cor : number, emp : number, sel : number, wik : number, can : number, falla : string, observacion : string, estado : any, fecha : any){
    let info : any = {
      ot : ot,
      ext : ext,
      imp : imp,
      rot : rot,
      dbl : dbl,
      lam : lam,
      cor : cor,
      emp : emp,
      sel : sel,
      wik : wik,
      cant : can,
      falla : falla,
      obs : observacion,
      est : estado,
      fecha : fecha.replace("T00:00:00", ""),
      entrada : 0,
      salida : 0,
    }
    this.ArrayDocumento.push(info);
    this.ArrayDocumento.sort((a,b) => a.fecha.localeCompare(b.fecha));
    this.ArrayDocumento.sort((a,b) => Number(a.ot)- Number(b.ot));
    this.load = true;
    setTimeout(() => {
      this.dtEntradasRollosService.srvConsultarOTEntradas(ot).subscribe(datos_entradas => {
        for (let j = 0; j < datos_entradas.length; j++) {
          for (let i = 0; i < this.ArrayDocumento.length; i++) {
            if (this.ArrayDocumento[i].ot == ot) this.ArrayDocumento[i].entrada = datos_entradas[j].sum;
          }
        }
      });
      this.dtEntradasRollosService.srvConsultarOtSalidas(ot).subscribe(datos_salidas => {
        for (let k = 0; k < datos_salidas.length; k++) {
          for (let i = 0; i < this.ArrayDocumento.length; i++) {
            if (this.ArrayDocumento[i].ot == ot) this.ArrayDocumento[i].salida = datos_salidas[k].sum;
          }
        }
      });
    }, 1200);
  }

  // Funcion que va a asignar un valor una variable, el valor será la orden de trabajo sobre la que se le dió click
  seleccionarFilaTabla(form : any){
    this.otSeleccionada = form.ot;
  }

  //
  seleccionarOTxStatus(form : any, proceso : any){
    this.otSeleccionada = form.ot;
    this.MostrarDatosOTxStatus.ArrayDatosProcesos = [];
    this.MostrarDatosOTxStatus.ArrayDatosAgrupados = [];

    if (proceso == 'EXTRUSION') {
      this.servicioBagPro.srvObtenerListaPorStatusExtrusion(this.otSeleccionada).subscribe(registros_OT => {
        if (registros_OT.length == 0) this.cerrarModal(`No se encontraron registros de la OT ${this.otSeleccionada} en el proceso de ${proceso}`);
        else {
          for (let index = 0; index < registros_OT.length; index++) {
            const Info : any = {
              Rollo : registros_OT[index].item,
              Cliente : registros_OT[index].clienteNombre,
              Producto : registros_OT[index].clienteItemNombre,
              Peso : this.formatonumeros(registros_OT[index].extnetokg),
              Unidad : 'Kg',
              Operador : registros_OT[index].operador,
              Maquina : registros_OT[index].maquina,
              Turno : registros_OT[index].turno,
              Status : registros_OT[index].nomStatus,
              Fecha : registros_OT[index].fecha.replace("T00:00:00", " ") + registros_OT[index].hora,
            }
            this.MostrarDatosOTxStatus.ArrayDatosProcesos.push(Info);
          }
        }
      });

      this.servicioBagPro.srvObtenerDataConsolidada_StatusExtrusion(this.otSeleccionada, proceso).subscribe(datos_agrupados => {
        for (let i = 0; i < datos_agrupados.length; i++) {
          let info : any = {
            Ot : datos_agrupados[i].ot,
            Producto : datos_agrupados[i].clienteItemNombre,
            Operador : datos_agrupados[i].operador,
            Peso : this.formatonumeros(datos_agrupados[i].sumaPesoKg),
            Fecha : datos_agrupados[i].fecha.replace('T00:00:00', ''),
            Proceso : datos_agrupados[i].nomStatus,
          }
          this.MostrarDatosOTxStatus.ArrayDatosAgrupados.push(info);
          this.MostrarDatosOTxStatus.ArrayDatosAgrupados.sort((a,b) => a.Operador.localeCompare(b.Operador));
        }
      });

    } else if (proceso == 'IMPRESION') {
      this.servicioBagPro.srvObtenerListaPorStatusImpresion(this.otSeleccionada).subscribe(registros_OT => {
        if (registros_OT.length == 0) this.cerrarModal(`No se encontraron registros de la OT ${this.otSeleccionada} en el proceso de ${proceso}`);
        else {
          for (let index = 0; index < registros_OT.length; index++) {
            const Info : any = {
              Rollo : registros_OT[index].item,
              Cliente : registros_OT[index].clienteNombre,
              Producto : registros_OT[index].clienteItemNombre,
              Peso : this.formatonumeros(registros_OT[index].extnetokg),
              Unidad : 'Kg',
              Operador : registros_OT[index].operador,
              Maquina : registros_OT[index].maquina,
              Turno : registros_OT[index].turno,
              Status : registros_OT[index].nomStatus,
              Fecha : registros_OT[index].fecha.replace("T00:00:00", " ") + registros_OT[index].hora,
            }
            this.MostrarDatosOTxStatus.ArrayDatosProcesos.push(Info);
          }
        }
      });

      this.servicioBagPro.srvObtenerDataConsolidada_StatusExtrusion(this.otSeleccionada, proceso).subscribe(datos_agrupados => {
        for (let i = 0; i < datos_agrupados.length; i++) {
          let info : any = {
            Ot : datos_agrupados[i].ot,
            Producto : datos_agrupados[i].clienteItemNombre,
            Operador : datos_agrupados[i].operador,
            Peso : this.formatonumeros(datos_agrupados[i].sumaPesoKg),
            Fecha : datos_agrupados[i].fecha.replace('T00:00:00', ''),
            Proceso : datos_agrupados[i].nomStatus,
          }
          this.MostrarDatosOTxStatus.ArrayDatosAgrupados.push(info);
          this.MostrarDatosOTxStatus.ArrayDatosAgrupados.sort((a,b) => a.Operador.localeCompare(b.Operador));
        }
      });
    } else if (proceso == 'ROTOGRABADO') {
      this.servicioBagPro.srvObtenerListaPorStatusRotograbado(this.otSeleccionada).subscribe(registros_OT => {
        if (registros_OT.length == 0) this.cerrarModal(`No se encontraron registros de la OT ${this.otSeleccionada} en el proceso de ${proceso}`);
        else {
          for (let index = 0; index < registros_OT.length; index++) {
            const Info : any = {
              Rollo : registros_OT[index].item,
              Cliente : registros_OT[index].clienteNombre,
              Producto : registros_OT[index].clienteItemNombre,
              Peso : this.formatonumeros(registros_OT[index].extnetokg),
              Unidad : 'Kg',
              Operador : registros_OT[index].operador,
              Maquina : registros_OT[index].maquina,
              Turno : registros_OT[index].turno,
              Status : registros_OT[index].nomStatus,
              Fecha : registros_OT[index].fecha.replace("T00:00:00", " ") + registros_OT[index].hora,
            }
            this.MostrarDatosOTxStatus.ArrayDatosProcesos.push(Info);
          }
        }
      });

      this.servicioBagPro.srvObtenerDataConsolidada_StatusExtrusion(this.otSeleccionada, proceso).subscribe(datos_agrupados => {
        for (let i = 0; i < datos_agrupados.length; i++) {
          let info : any = {
            Ot : datos_agrupados[i].ot,
            Producto : datos_agrupados[i].clienteItemNombre,
            Operador : datos_agrupados[i].operador,
            Peso : this.formatonumeros(datos_agrupados[i].sumaPesoKg),
            Fecha : datos_agrupados[i].fecha.replace('T00:00:00', ''),
            Proceso : datos_agrupados[i].nomStatus,
          }
          this.MostrarDatosOTxStatus.ArrayDatosAgrupados.push(info);
          this.MostrarDatosOTxStatus.ArrayDatosAgrupados.sort((a,b) => a.Operador.localeCompare(b.Operador));
        }
      });
    } else if (proceso == 'DOBLADO') {
      this.servicioBagPro.srvObtenerListaPorStatusDoblado(this.otSeleccionada).subscribe(registros_OT => {
        if (registros_OT.length == 0) this.cerrarModal(`No se encontraron registros de la OT ${this.otSeleccionada} en el proceso de ${proceso}`);
        else {
          for (let index = 0; index < registros_OT.length; index++) {
            const Info : any = {
              Rollo : registros_OT[index].item,
              Cliente : registros_OT[index].clienteNombre,
              Producto : registros_OT[index].clienteItemNombre,
              Peso : this.formatonumeros(registros_OT[index].extnetokg),
              Unidad : 'Kg',
              Operador : registros_OT[index].operador,
              Maquina : registros_OT[index].maquina,
              Turno : registros_OT[index].turno,
              Status : registros_OT[index].nomStatus,
              Fecha : registros_OT[index].fecha.replace("T00:00:00", " ") + registros_OT[index].hora,
            }
            this.MostrarDatosOTxStatus.ArrayDatosProcesos.push(Info);
          }
        }
      });

      this.servicioBagPro.srvObtenerDataConsolidada_StatusExtrusion(this.otSeleccionada, proceso).subscribe(datos_agrupados => {
        for (let i = 0; i < datos_agrupados.length; i++) {
          let info : any = {
            Ot : datos_agrupados[i].ot,
            Producto : datos_agrupados[i].clienteItemNombre,
            Operador : datos_agrupados[i].operador,
            Peso : this.formatonumeros(datos_agrupados[i].sumaPesoKg),
            Fecha : datos_agrupados[i].fecha.replace('T00:00:00', ''),
            Proceso : datos_agrupados[i].nomStatus,
          }
          this.MostrarDatosOTxStatus.ArrayDatosAgrupados.push(info);
          this.MostrarDatosOTxStatus.ArrayDatosAgrupados.sort((a,b) => a.Operador.localeCompare(b.Operador));
        }
      });
    } else if (proceso == 'LAMINADO') {
      this.servicioBagPro.srvObtenerListaPorStatusLaminado(this.otSeleccionada).subscribe(registros_OT => {
        if (registros_OT.length == 0) this.cerrarModal(`No se encontraron registros de la OT ${this.otSeleccionada} en el proceso de ${proceso}`);
        else {
          for (let index = 0; index < registros_OT.length; index++) {
            const Info : any = {
              Rollo : registros_OT[index].item,
              Cliente : registros_OT[index].clienteNombre,
              Producto : registros_OT[index].clienteItemNombre,
              Peso : this.formatonumeros(registros_OT[index].extnetokg),
              Unidad : 'Kg',
              Operador : registros_OT[index].operador,
              Maquina : registros_OT[index].maquina,
              Turno : registros_OT[index].turno,
              Status : registros_OT[index].nomStatus,
              Fecha : registros_OT[index].fecha.replace("T00:00:00", " ") + registros_OT[index].hora,
            }
            this.MostrarDatosOTxStatus.ArrayDatosProcesos.push(Info);
          }
        }
      });

      this.servicioBagPro.srvObtenerDataConsolidada_StatusExtrusion(this.otSeleccionada, proceso).subscribe(datos_agrupados => {
        for (let i = 0; i < datos_agrupados.length; i++) {
          let info : any = {
            Ot : datos_agrupados[i].ot,
            Producto : datos_agrupados[i].clienteItemNombre,
            Operador : datos_agrupados[i].operador,
            Peso : this.formatonumeros(datos_agrupados[i].sumaPesoKg),
            Fecha : datos_agrupados[i].fecha.replace('T00:00:00', ''),
            Proceso : datos_agrupados[i].nomStatus,
          }
          this.MostrarDatosOTxStatus.ArrayDatosAgrupados.push(info);
          this.MostrarDatosOTxStatus.ArrayDatosAgrupados.sort((a,b) => a.Operador.localeCompare(b.Operador));
        }
      });
    } else if (proceso == 'CORTE') {
      this.servicioBagPro.srvObtenerListaPorStatusCorte(this.otSeleccionada).subscribe(registros_OT => {
        if (registros_OT.length == 0) this.cerrarModal(`No se encontraron registros de la OT ${this.otSeleccionada} en el proceso de ${proceso}`);
        else {
          for (let index = 0; index < registros_OT.length; index++) {
            const Info : any = {
              Rollo : registros_OT[index].item,
              Cliente : registros_OT[index].clienteNombre,
              Producto : registros_OT[index].clienteItemNombre,
              Peso : this.formatonumeros(registros_OT[index].extnetokg),
              Unidad : 'Kg',
              Operador : registros_OT[index].operador,
              Maquina : registros_OT[index].maquina,
              Turno : registros_OT[index].turno,
              Status : registros_OT[index].nomStatus,
              Fecha : registros_OT[index].fecha.replace("T00:00:00", " ") + registros_OT[index].hora,
            }
            this.MostrarDatosOTxStatus.ArrayDatosProcesos.push(Info);
          }
        }
      });

      this.servicioBagPro.srvObtenerDataConsolidada_StatusExtrusion(this.otSeleccionada, proceso).subscribe(datos_agrupados => {
        for (let i = 0; i < datos_agrupados.length; i++) {
          let info : any = {
            Ot : datos_agrupados[i].ot,
            Producto : datos_agrupados[i].clienteItemNombre,
            Operador : datos_agrupados[i].operador,
            Peso : this.formatonumeros(datos_agrupados[i].sumaPesoKg),
            Fecha : datos_agrupados[i].fecha.replace('T00:00:00', ''),
            Proceso : datos_agrupados[i].nomStatus,
          }
          this.MostrarDatosOTxStatus.ArrayDatosAgrupados.push(info);
          this.MostrarDatosOTxStatus.ArrayDatosAgrupados.sort((a,b) => a.Operador.localeCompare(b.Operador));
        }
      });
    } else if (proceso == 'EMPAQUE') {
      this.servicioBagPro.srvObtenerListaPorStatusEmpaque(this.otSeleccionada).subscribe(registros_OT => {
        if (registros_OT.length == 0) this.cerrarModal(`No se encontraron registros de la OT ${this.otSeleccionada} en el proceso de ${proceso}`);
        else {
          for (let index = 0; index < registros_OT.length; index++) {
            const Info : any = {
              Rollo : registros_OT[index].item,
              Cliente : registros_OT[index].clienteNombre,
              Producto : registros_OT[index].clienteItemNombre,
              Peso : this.formatonumeros(registros_OT[index].extnetokg),
              Unidad : 'Kg',
              Operador : registros_OT[index].operador,
              Maquina : registros_OT[index].maquina,
              Turno : registros_OT[index].turno,
              Status : registros_OT[index].nomStatus,
              Fecha : registros_OT[index].fecha.replace("T00:00:00", " ") + registros_OT[index].hora,
            }
            this.MostrarDatosOTxStatus.ArrayDatosProcesos.push(Info);
          }
        }
      });

      this.servicioBagPro.srvObtenerDataConsolidada_StatusExtrusion(this.otSeleccionada, proceso).subscribe(datos_agrupados => {
        for (let i = 0; i < datos_agrupados.length; i++) {
          let info : any = {
            Ot : datos_agrupados[i].ot,
            Producto : datos_agrupados[i].clienteItemNombre,
            Operador : datos_agrupados[i].operador,
            Peso : this.formatonumeros(datos_agrupados[i].sumaPesoKg),
            Fecha : datos_agrupados[i].fecha.replace('T00:00:00', ''),
            Proceso : datos_agrupados[i].nomStatus,
          }
          this.MostrarDatosOTxStatus.ArrayDatosAgrupados.push(info);
          this.MostrarDatosOTxStatus.ArrayDatosAgrupados.sort((a,b) => a.Operador.localeCompare(b.Operador));
        }
      });
    } else if (proceso == 'SELLADO') {
      this.servicioBagPro.srvObtenerListaPorStatusSellado(this.otSeleccionada).subscribe(registros_OT => {
        if (registros_OT.length == 0) this.cerrarModal(`No se encontraron registros de la OT ${this.otSeleccionada} en el proceso de ${proceso}`);
        else {
          for (let index = 0; index < registros_OT.length; index++) {
            const Info : any = {
              Rollo : registros_OT[index].item,
              Cliente : registros_OT[index].cliente,
              Producto : registros_OT[index].nomReferencia,
              Peso : this.formatonumeros(registros_OT[index].qty),
              Unidad : registros_OT[index].unidad,
              Operador : registros_OT[index].operario,
              Maquina : registros_OT[index].maquina,
              Turno : registros_OT[index].turnos,
              Status : registros_OT[index].nomStatus,
              Fecha : registros_OT[index].fechaEntrada.replace("T00:00:00", " ") + registros_OT[index].hora,
            }
            this.MostrarDatosOTxStatus.ArrayDatosProcesos.push(Info);
          }
        }
      });
      this.servicioBagPro.srvObtenerDataConsolidada_StatusSellado(this.otSeleccionada, proceso).subscribe(datos_agrupados => {
        for (let i = 0; i < datos_agrupados.length; i++) {
          let info : any = {
            Ot : datos_agrupados[i].ot,
            Producto : datos_agrupados[i].nomReferencia,
            Operador : datos_agrupados[i].operario,
            Peso : `${this.formatonumeros(datos_agrupados[i].sumaCantidad)} UND - ${this.formatonumeros(datos_agrupados[i].sumaPeso)} KG`,
            Fecha : datos_agrupados[i].fechaEntrada.replace('T00:00:00', ''),
            Proceso : datos_agrupados[i].nomStatus,
          }
          this.MostrarDatosOTxStatus.ArrayDatosAgrupados.push(info);
          this.MostrarDatosOTxStatus.ArrayDatosAgrupados.sort((a,b) => a.Operador.localeCompare(b.Operador));
        }
      });
    } else if (proceso == 'Wiketiado') {
      this.servicioBagPro.srvObtenerListaPorStatusWiketiado(this.otSeleccionada).subscribe(registros_OT => {
        if (registros_OT.length == 0) this.cerrarModal(`No se encontraron registros de la OT ${this.otSeleccionada} en el proceso de ${proceso}`);
        else {
          for (let index = 0; index < registros_OT.length; index++) {
            const Info : any = {
              Rollo : registros_OT[index].item,
              Cliente : registros_OT[index].cliente,
              Producto : registros_OT[index].nomReferencia,
              Peso : this.formatonumeros(registros_OT[index].qty),
              Unidad : registros_OT[index].unidad,
              Operador : registros_OT[index].operario,
              Maquina : registros_OT[index].maquina,
              Turno : registros_OT[index].turnos,
              Status : registros_OT[index].nomStatus,
              Fecha : registros_OT[index].fechaEntradareplace("T00:00:00", " ") + registros_OT[index].hora,
            }
            this.MostrarDatosOTxStatus.ArrayDatosProcesos.push(Info);
          }
        }
      });
      this.servicioBagPro.srvObtenerDataConsolidada_StatusSellado(this.otSeleccionada, proceso).subscribe(datos_agrupados => {
        for (let i = 0; i < datos_agrupados.length; i++) {
          let info : any = {
            Ot : datos_agrupados[i].ot,
            Producto : datos_agrupados[i].nomReferencia,
            Operador : datos_agrupados[i].operario,
            Peso : `${this.formatonumeros(datos_agrupados[i].sumaCantidad)} UND - ${this.formatonumeros(datos_agrupados[i].sumaPeso)} KG`,
            Fecha : datos_agrupados[i].fechaEntrada.replace('T00:00:00', ''),
            Proceso : datos_agrupados[i].nomStatus,
          }
          this.MostrarDatosOTxStatus.ArrayDatosAgrupados.push(info);
          this.MostrarDatosOTxStatus.ArrayDatosAgrupados.sort((a,b) => a.Operador.localeCompare(b.Operador));
        }
      });
    }
    if (this.MostrarDatosOTxStatus.ArrayDatosProcesos.length != 0) this.modal_DatosStatusOT = true;
  }

  // Funcion que va a cerrar el modal cuando no haya información
  cerrarModal(message : string){
    Swal.fire({
      title: message,
      confirmButtonText: 'OK'
    }).then((result) => {
      let btn : any = document.getElementById("btn-close");
      btn.click();
    });
  }

  // Funcion que va a añadir una falla o observacion a una ot
  anadirFalla(){
    let falla : number = this.formularioOT.value.fallasOT;
    let observacion : string = this.formularioOT.value.ObservacionOT;

    if(this.otSeleccionada == 0) Swal.fire('Debe seleccionar una OT');

    this.estadosProcesos_OTService.srvObtenerListaPorOT(this.otSeleccionada).subscribe(datos_ot => {
      for (let i = 0; i < datos_ot.length; i++) {
        let info : any = {
          EstProcOT_OrdenTrabajo : datos_ot[i].estProcOT_OrdenTrabajo,
          EstProcOT_ExtrusionKg : datos_ot[i].estProcOT_ExtrusionKg,
          EstProcOT_ImpresionKg : datos_ot[i].estProcOT_ImpresionKg,
          EstProcOT_RotograbadoKg : datos_ot[i].estProcOT_RotograbadoKg,
          EstProcOT_LaminadoKg : datos_ot[i].estProcOT_LaminadoKg,
          EstProcOT_CorteKg : datos_ot[i].estProcOT_CorteKg,
          EstProcOT_DobladoKg : datos_ot[i].estProcOT_DobladoKg,
          EstProcOT_SelladoKg : datos_ot[i].estProcOT_SelladoKg,
          EstProcOT_SelladoUnd : datos_ot[i].estProcOT_SelladoUnd,
          EstProcOT_WiketiadoKg : datos_ot[i].estProcOT_WiketiadoKg,
          EstProcOT_WiketiadoUnd : datos_ot[i].estProcOT_WiketiadoUnd,
          EstProcOT_CantidadPedida : datos_ot[i].estProcOT_CantidadPedida,
          UndMed_Id : datos_ot[i].undMed_Id,
          Estado_Id : datos_ot[i].estado_Id,
          Falla_Id : falla,
          EstProcOT_Observacion : observacion,
          EstProcOT_FechaCreacion : datos_ot[i].estProcOT_FechaCreacion,
          EstProcOT_EmpaqueKg : datos_ot[i].estProcOT_EmpaqueKg,
        }
        /**/
        if (falla == null) Swal.fire("Debe seleccionar un tipo de falla.")
        else {
          this.estadosProcesos_OTService.srvActualizarPorOT(this.otSeleccionada, info).subscribe(datos_ot => {
            const Toast = Swal.mixin({
              toast: true,
              position: 'center',
              showConfirmButton: false,
              timer: 1500,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
              }
            });
            Toast.fire({
              icon: 'success',
              title: `Falla agregada a la OT ${this.otSeleccionada} con exito!`
            });
            this.limpiarCampos();
          });
        }
      }
    });
  }
}
