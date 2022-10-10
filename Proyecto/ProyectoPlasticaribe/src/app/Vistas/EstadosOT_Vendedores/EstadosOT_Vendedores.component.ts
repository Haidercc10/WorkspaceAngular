import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Workbook } from 'exceljs';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import { EstadosService } from 'src/app/Servicios/estados.service';
import { EstadosProcesos_OTService } from 'src/app/Servicios/EstadosProcesos_OT.service';
import { FallasTecnicasService } from 'src/app/Servicios/FallasTecnicas.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import Swal from 'sweetalert2';
import * as fs from 'file-saver';
import { EstadosProcesosOTxVendedoresService } from 'src/app/Servicios/EstadosProcesosOTxVendedores.service';

@Component({
  selector: 'app-EstadosOT_Vendedores',
  templateUrl: './EstadosOT_Vendedores.component.html',
  styleUrls: ['./EstadosOT_Vendedores.component.css']
})
export class EstadosOT_VendedoresComponent implements OnInit {

  public formularioOT !: FormGroup;
  public page : number; //Variable que tendrá el paginado de la tabla en la que se muestran los pedidos consultados
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

  constructor(private frmBuilder : FormBuilder,
                @Inject(SESSION_STORAGE) private storage: WebStorageService,
                  private rolService : RolesService,
                    private fallasTecnicasService : FallasTecnicasService,
                      private estadosProcesos_OTService : EstadosProcesos_OTService,
                       private srvEstadosOTVendedores : EstadosProcesosOTxVendedoresService,
                        private estadosService : EstadosService,
                        private servicioBagPro : BagproService) {

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
    console.log(this.storage_Id);
    console.log(this.storage_Nombre);
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
        const header = ["OT", "Extrusión", "Impresión", "Rotograbado", "Laminado", "Doblado", "Corte", "Empaque", "Sellado", "Wiketiado", "Cant. Producir", "Fallas", "Observación", "Estado", "Fecha Creación"]
        let datos : any =[];
        for (const item of this.ArrayDocumento) {
          const datos1  : any = [item.ot, item.ext, item.imp, item.rot, item.lam, item.dbl, item.cor, item.emp, item.sel, item.wik, item.cant, item.falla, item.obs, item.est, item.fecha];
          datos.push(datos1);
        }
        let workbook = new Workbook();
        let worksheet = workbook.addWorksheet(`Reporte de OT por Procesos - ${this.today}`);
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
        worksheet.mergeCells('A1:O2');
        worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
        datos.forEach(d => {
          let row = worksheet.addRow(d);
          let CantPedida = row.getCell(11)
          // Extrusion
          let qtyExt = row.getCell(2);
          row.getCell(2).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          let colorExt;
          if (+qtyExt.value >= d[10]) {
            colorExt = 'C7FD7A';
          } else if (+qtyExt.value < d[10] && +qtyExt.value > 0) {
            colorExt = 'FDCD7A'
          } else if (+qtyExt.value == 0) {
            colorExt = 'FF837B'
          }
          qtyExt.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colorExt }
          }
          // Impresion
          let qtyImp = row.getCell(3);
          row.getCell(3).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          let colorImp;
          if (+qtyImp.value >= d[10]) {
            colorImp = 'C7FD7A';
          } else if (+qtyImp.value < d[10] && +qtyImp.value > 0) {
            colorImp = 'FDCD7A'
          } else if (+qtyImp.value == 0) {
            colorImp = 'FF837B'
          }
          qtyImp.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colorImp }
          }
          //Rotograbado
          let qtyRot = row.getCell(4);
          row.getCell(4).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          let colorRot;
          if (+qtyRot.value >= d[10]) {
            colorRot = 'C7FD7A';
          } else if (+qtyRot.value < d[10] && +qtyRot.value > 0) {
            colorRot = 'FDCD7A'
          } else if (+qtyRot.value == 0) {
            colorRot = 'FF837B'
          }
          qtyRot.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colorRot }
          }
          //Laminado
          let qtyLam = row.getCell(5);
          row.getCell(5).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          let colorLam;
          if (+qtyLam.value >= d[10]) {
            colorLam = 'C7FD7A';
          } else if (+qtyLam.value < d[10] && +qtyLam.value > 0) {
            colorLam = 'FDCD7A'
          } else if (+qtyLam.value == 0) {
            colorLam = 'FF837B'
          }
          qtyLam.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colorLam }
          }
          // Doblado
          let qtyDbl = row.getCell(6);
          row.getCell(6).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          let colorDbl;
          if (+qtyDbl.value >= d[10]) {
            colorDbl = 'C7FD7A';
          } else if (+qtyDbl.value < d[10] && +qtyDbl.value > 0) {
            colorDbl = 'FDCD7A'
          } else if (+qtyDbl.value == 0) {
            colorDbl = 'FF837B'
          }
          qtyDbl.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colorDbl }
          }
          // Corte
          let qtyCor = row.getCell(7);
          row.getCell(7).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          let colorCor;
          if (+qtyCor.value >= d[10]) {
            colorCor = 'C7FD7A';
          } else if (+qtyCor.value < d[10] && +qtyCor.value > 0) {
            colorCor = 'FDCD7A'
          } else if (+qtyCor.value == 0) {
            colorCor = 'FF837B'
          }
          qtyCor.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colorCor }
          }
          // Empaque
          let qtyEmp = row.getCell(8);
          row.getCell(8).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          let colorEmp;
          if (+qtyEmp.value >=  (+CantPedida + (+CantPedida * -0.10))) {
            colorEmp = 'C7FD7A';
          } else if (+qtyEmp.value <  (+CantPedida + (+CantPedida * -0.10)) && +qtyEmp.value > 0) {
            colorEmp = 'FDCD7A'
          } else if (+qtyEmp.value == 0) {
            colorEmp = 'FF837B'
          }
          qtyEmp.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colorEmp }
          }
          // Sellado
          let qtySel = row.getCell(9);
          row.getCell(9).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          let colorSel;
          if (+qtySel.value >= (+CantPedida + (+CantPedida * -0.10))) {
            colorSel = 'C7FD7A';
          } else if (+qtySel.value <  (+CantPedida + (+CantPedida * -0.10)) && +qtySel.value > 0) {
            colorSel = 'FDCD7A'
          } else if (+qtySel.value == 0) {
            colorSel = 'FF837B'
          }
          qtySel.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colorSel }
          }
          // Wiketiado
          let qtyWik = row.getCell(10);
          row.getCell(10).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          let colorWik;
          if (+qtyWik.value >=  (+CantPedida + (+CantPedida * -0.10))) {
            colorWik = 'C7FD7A';
          } else if (+qtyWik.value <  (+CantPedida + (+CantPedida * -0.10)) && +qtyWik.value > 0) {
            colorWik = 'FDCD7A'
          } else if (+qtyWik.value == 0) {
            colorWik = 'FF837B'
          }
          qtyWik.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colorWik }
          }


          row.getCell(11).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
        });

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
        worksheet.getColumn(12).width = 20;
        worksheet.getColumn(13).width = 20;
        worksheet.getColumn(14).width = 15;
        worksheet.getColumn(15).width = 15;
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


        if (numOT != null && fechaincial != null && fechaFinal != null && estado != null) {
          this.srvEstadosOTVendedores.srvObtenerListaPorOtFechas(numOT, fechaincial, fechaFinal, this.storage_Id).subscribe(datos_ot => {
            if(datos_ot.length == 0){setTimeout(() => {Swal.fire(`No se encontraron OT's con la combinación de filtros consultada.`);}, 4800);
            } else {
              for (let i = 0; i < datos_ot.length; i++) {
                this.servicioBagPro.srvObtenerOTsPorVendedor(this.storage_Id).subscribe(datos_bagpro => {
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
                                    datos_ot[i].estProcOT_FechaCreacion,
                                    datos_bagpro[i].clienteNom,
                                    datos_bagpro[i].clienteItemsNom,
                                    );

                  }
                });
              }
            }
          });

        } else if (numOT != null && fechaincial != null && fechaFinal != null) {
          this.srvEstadosOTVendedores.srvObtenerListaPorOtFechas(numOT, fechaincial, fechaFinal, this.storage_Id).subscribe(datos_ot => {
            if(datos_ot.length == 0){
              setTimeout(() => {
                Swal.fire(`No se encontraron OT's con la combinación de filtros consultada.`);
              }, 4800);
            } else {
              for (let i = 0; i < datos_ot.length; i++) {
                this.servicioBagPro.srvObtenerOTsPorVendedor(this.storage_Id).subscribe(datos_bagpro => {
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
                      datos_ot[i].estProcOT_FechaCreacion,
                      datos_bagpro[i].clienteNom,
                      datos_bagpro[i].clienteItemsNom,);
                  }
                });
              }
            }
          });
        } else if (numOT != null && fallas != null && estado != null) {
          this.estadosProcesos_OTService.srvObtenerListaPorOtFallas(numOT, fallas).subscribe(datos_ot => {
            if(datos_ot.length == 0){setTimeout(() => {Swal.fire(`No se encontraron OT's con la combinación de filtros consultada.`);}, 4800);
            } else {
              for (let i = 0; i < datos_ot.length; i++) {
                if (estado == datos_ot[i].estado_Id) {
                  this.servicioBagPro.srvObtenerOTsPorVendedor(this.storage_Id).subscribe(datos_bagpro => {
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
                        datos_ot[i].estProcOT_FechaCreacion,
                        datos_bagpro[i].clienteNom,
                        datos_bagpro[i].clienteItemsNom,);
                    }
                  });
                }
              }
            }
          });
        } else if (fechaincial != null && fechaFinal != null && estado != null) {
          this.srvEstadosOTVendedores.srvObtenerListaPorFechasEstado(fechaincial, fechaFinal, estado, this.storage_Id).subscribe(datos_ot => {
            if(datos_ot.length == 0){setTimeout(() => {Swal.fire(`No se encontraron OT's con la combinación de filtros consultada.`);}, 4800);
            } else {
              for (let i = 0; i < datos_ot.length; i++) {
                this.servicioBagPro.srvObtenerOTsPorVendedor(this.storage_Id).subscribe(datos_bagpro => {
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
                      datos_ot[i].estProcOT_FechaCreacion,
                      datos_bagpro[i].clienteNom,
                      datos_bagpro[i].clienteItemsNom,);
                  }
                });
              }
            }
          });

        } else if (numOT != null && fechaincial != null && estado != null) {
          this.srvEstadosOTVendedores.srvObtenerListaPorOtFecha(numOT, fechaincial, this.storage_Id).subscribe(datos_ot => {
            if(datos_ot.length == 0){ setTimeout(() => {Swal.fire(`No se encontraron OT's con la combinación de filtros consultada.`);}, 4800);
            } else {
                for (let i = 0; i < datos_ot.length; i++) {
                  this.servicioBagPro.srvObtenerOTsPorVendedor(this.storage_Id).subscribe(datos_bagpro => {
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
                        datos_ot[i].estProcOT_FechaCreacion,
                        datos_bagpro[i].clienteNom,
                        datos_bagpro[i].clienteItemsNom,);
                    }
                  });
                }
            }
          });

        } else if (fechaincial != null && fechaFinal != null) {
          if(fechaincial < '2022-05-01' && fechaFinal < '2022-05-01') {setTimeout(() => {Swal.fire('Solo se mostrarán OTs desde el inicio de las Asignaciones de Materia Prima (01/05/2022)');}, 4800);
          }else if(fechaFinal < fechaincial) {
            setTimeout(() => {Swal.fire('La fecha final debe ser mayor que la fecha inicial');}, 4800);
          }else{
            this.srvEstadosOTVendedores.srvObtenerListaPorFechas(fechaincial, fechaFinal, this.storage_Id).subscribe(datos_ot => {
              if(datos_ot.length == 0) {setTimeout(() => {Swal.fire('No existen OTs creadas en las fechas consultadas.')}, 4800);
              } else {
                for (let i = 0; i < datos_ot.length; i++) {
                  this.servicioBagPro.srvObtenerOTsPorVendedor(this.storage_Id).subscribe(datos_bagpro => {
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
                        datos_ot[i].estProcOT_FechaCreacion,
                        datos_bagpro[i].clienteNom,
                        datos_bagpro[i].clienteItemsNom,);
                    }
                  });
                }
              }
          });
        }
        } else if (numOT != null && fechaincial != null) {
          this.srvEstadosOTVendedores.srvObtenerListaPorOtFecha(numOT, fechaincial, this.storage_Id).subscribe(datos_ot => {
            if(datos_ot.length == 0){setTimeout(() => {Swal.fire(`No se encontraron OT's con la combinación de filtros consultada.`);}, 4800);
            } else {
              for (let i = 0; i < datos_ot.length; i++) {
                this.servicioBagPro.srvObtenerOTsPorVendedor(this.storage_Id).subscribe(datos_bagpro => {
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
                      datos_ot[i].estProcOT_FechaCreacion,
                      datos_bagpro[i].clienteNom,
                      datos_bagpro[i].clienteItemsNom,);
                  }
                });
              }
            }
          });

          if(fechaincial < '2022-05-01') {
            setTimeout(() => { Swal.fire(`Solo se muestran OT's desde el inicio de las asignaciones de Materia Prima (01/05/2022)`);}, 4800);
          } else {
            this.estadosProcesos_OTService.srvObtenerListaPorOtFechaFalla(fechaincial, fallas).subscribe(datos_ot => {
              for (let i = 0; i < datos_ot.length; i++) {
                this.servicioBagPro.srvObtenerOTsPorVendedor(this.storage_Id).subscribe(datos_bagpro => {
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
                      datos_ot[i].estProcOT_FechaCreacion,
                      datos_bagpro[i].clienteNom,
                      datos_bagpro[i].clienteItemsNom,);
                  }
                });
              }
            });
          }
        } else if (estado != null && numOT != null) {
          this.srvEstadosOTVendedores.srvObtenerListaPorOT(numOT, this.storage_Id).subscribe(datos_ot => {
            if(datos_ot.length == 0){setTimeout(() => {Swal.fire(`No se encontraron OT's con la combinación de filtros consultada.`);}, 4800);
            }else{
              for (let i = 0; i < datos_ot.length; i++) {
                this.servicioBagPro.srvObtenerOTsPorVendedor(this.storage_Id).subscribe(datos_bagpro => {
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
                      datos_ot[i].estProcOT_FechaCreacion,
                      datos_bagpro[i].clienteNom,
                      datos_bagpro[i].clienteItemsNom,);
                  }
                });
              }
            }
          });

          this.estadosProcesos_OTService.srvObtenerListaPorOtEstadoFalla(estado, fallas).subscribe(datos_ot => {
            if(datos_ot.length == 0){
              setTimeout(() => {
                Swal.fire(`No se encontraron OT's con la combinación de filtros consultada.`);
              }, 4800);
            }else{
              for (let i = 0; i < datos_ot.length; i++) {
                this.servicioBagPro.srvObtenerOTsPorVendedor(this.storage_Id).subscribe(datos_bagpro => {
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
                      datos_ot[i].estProcOT_FechaCreacion,
                      datos_bagpro[i].clienteNom,
                      datos_bagpro[i].clienteItemsNom,);
                  }
                });
              }
            }
          });
        } else if (fechaincial != null && estado != null) {
          this.srvEstadosOTVendedores.srvObtenerListaPorFecha(fechaincial, this.storage_Id).subscribe(datos_ot => {
            if(datos_ot.length == 0){
              setTimeout(() => {
                Swal.fire(`No se encontraron OT's con la combinación de filtros consultada.`);
              }, 4800);
            }else{
              for (let i = 0; i < datos_ot.length; i++) {
                this.servicioBagPro.srvObtenerOTsPorVendedor(this.storage_Id).subscribe(datos_bagpro => {
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
                      datos_ot[i].estProcOT_FechaCreacion,
                      datos_bagpro[i].clienteNom,
                      datos_bagpro[i].clienteItemsNom,);
                  }
                });
              }
            }
          });
        } else if (numOT != null) {
          this.srvEstadosOTVendedores.srvObtenerListaPorOT(numOT, this.storage_Id).subscribe(datos_ot => {
            if(datos_ot.length == 0) {
              setTimeout(() => {
                  Swal.fire('No se encontró la OT consultada.');
              }, 4800);
            } else {
              for (let i = 0; i < datos_ot.length; i++) {
                this.servicioBagPro.srvObtenerOTsPorVendedor(this.storage_Id).subscribe(datos_bagpro => {
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
                      datos_ot[i].estProcOT_FechaCreacion,
                      datos_bagpro[i].clienteNom,
                      datos_bagpro[i].clienteItemsNom,);
                  }
                });
            }
          }

          });
        } else if (fechaincial != null) {
          if(fechaincial < '2022-05-01') {
            setTimeout(() => {
              Swal.fire(`Solo se muestran OT's desde el inicio de las asignaciones de Materia Prima (2022-05-01)`);
            }, 4800);
          } else {
            this.srvEstadosOTVendedores.srvObtenerListaPorFecha(fechaincial, this.storage_Id).subscribe(datos_ot => {
              if(datos_ot.length == 0) {
                setTimeout(() => {
                  Swal.fire(`No se encontraron OTs creadas el día ${fechaincial}`);
                }, 4800);
              } else {
                for (let i = 0; i < datos_ot.length; i++) {
                  this.servicioBagPro.srvObtenerOTsPorVendedor(this.storage_Id).subscribe(datos_bagpro => {
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
                        datos_ot[i].estProcOT_FechaCreacion,
                        datos_bagpro[i].clienteNom,
                        datos_bagpro[i].clienteItemsNom,);
                    }
                  });
                }
              };
            });
            }


          this.estadosProcesos_OTService.srvObtenerListaPorFallas(fallas).subscribe(datos_ot => {
            if(datos_ot.length == 0) {
              setTimeout(() => {
                Swal.fire('No se encontraron OTs con la falla consultada.');
              }, 4800);
            } else {
              for (let i = 0; i < datos_ot.length; i++) {
                this.servicioBagPro.srvObtenerOTsPorVendedor(this.storage_Id).subscribe(datos_bagpro => {
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
                      datos_ot[i].estProcOT_FechaCreacion,
                      datos_bagpro[i].clienteNom,
                      datos_bagpro[i].clienteItemsNom,);
                  }
                });
              }
            }
          });
        } else if (estado != null) {
          this.srvEstadosOTVendedores.srvObtenerListaPorOtEstado(estado, this.storage_Id).subscribe(datos_ot => {
            if(datos_ot.length == 0) {
              setTimeout(() => {
                Swal.fire(`No se encontraron OT's con el Estado consultado.`);
              }, 4800);
            }else{
              for (let i = 0; i < datos_ot.length; i++) {
                this.servicioBagPro.srvObtenerOTsPorVendedor(this.storage_Id).subscribe(datos_bagpro => {
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
                      datos_ot[i].estProcOT_FechaCreacion,
                      datos_bagpro[i].clienteNom,
                      datos_bagpro[i].clienteItemsNom,);
                  }
                });
              }
            }
          });
        } else {
          this.srvEstadosOTVendedores.srvObtenerListaPorFecha(this.today, this.storage_Id).subscribe(datos_ot => {
            if(datos_ot.length == 0) {
              setTimeout(() => {
                Swal.fire(`No se encontraron OT's creadas del día de hoy.`);
              }, 4800);
            } else {
              for (let i = 0; i < datos_ot.length; i++) {
                this.servicioBagPro.srvObtenerOTsPorVendedor(this.storage_Id).subscribe(datos_bagpro => {
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
                      datos_ot[i].estProcOT_FechaCreacion,
                      datos_bagpro[i].clienteNom,
                      datos_bagpro[i].clienteItemsNom,);
                  }
                });
              }
            }
          });
        }
        setTimeout(() => {
          this.load = true;
        }, 5000);
  }

  //Funcion encargada de llenar un array con la informacion de las ordenes de trabajo y el producido de cada area
  llenarArray(ot : number, ext : number, imp : number, rot : number, dbl : number, lam : number, cor : number, emp : number, sel : number, wik : number, can : number, falla : string, observacion : string, estado : any, fecha : any, cli: string, prod: string, ){
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
    }
      this.ArrayDocumento.push(info);
      this.ArrayDocumento.sort((a,b) => a.fecha.localeCompare(b.fecha));
      this.ArrayDocumento.sort((a,b) => Number(a.ot)- Number(b.ot));
  }

  // Funcion que va a asignar un valor una variable, el valor será la orden de trabajo sobre la que se le dió click
  seleccionarFilaTabla(form : any){
    this.otSeleccionada = form.ot;
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
        if(falla == null){
          Swal.fire("Debe seleccionar un tipo de falla.")
        } else {
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
