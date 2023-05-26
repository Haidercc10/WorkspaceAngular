import { Component, Injectable, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { OverlayPanel } from 'primeng/overlaypanel';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { ClientesService } from 'src/app/Servicios/Clientes/clientes.service';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { EstadosProcesos_OTService } from 'src/app/Servicios/EstadosProcesosOT/EstadosProcesos_OT.service';
import { EstadosProcesosOTxVendedoresService } from 'src/app/Servicios/EstadosProcesosOTVendedores/EstadosProcesosOTxVendedores.service';
import { FallasTecnicasService } from 'src/app/Servicios/FallasTecnicas/FallasTecnicas.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsReportesProcesosOT as defaultSteps } from 'src/app/data';
import { DatosOTStatusComponent } from '../DatosOT-Status/DatosOT-Status.component';
import { ReportePedidos_ZeusComponent } from '../ReportePedidos_Zeus/ReportePedidos_Zeus.component';
import { ReporteCostosOTComponent } from '../reporteCostosOT/reporteCostosOT.component';

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
  @ViewChild(ReporteCostosOTComponent) reporteCostos : ReporteCostosOTComponent;
  @ViewChild(ReportePedidos_ZeusComponent) ReportePedidos_Zeus : ReportePedidos_ZeusComponent;

  modeModal : boolean = false; //Variable que validará cuando el componente aparezca en un modal

  formularioOT !: FormGroup; //Variable de tipo formulario
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  ArrayDocumento = []; //Varibale que almacenará la información que se mostrará en la tabla de vista
  load : boolean = true; //Variable que permitirá validar si debe salir o no la imagen de carga
  fallas : any = []; //Variable que almacenará las posibles fallas que puede tener una orden de trabajo en produccion
  otSeleccionada : number = 0; //Variable que almacenará el numero de la OT que fue previamente seleccionada
  estados : any = []; //Variable que almacenará los estados de las ordenes de trabajo
  catidadOTAbiertas : number = 0; //Variable que almacenará la cantidad de ordenes de trabajo que están abiertas
  cantidadOTAsignadas : number = 0; //Variable que almacenará la cantidad de ordenes de trabajo que tiene asignaciones
  cantidadOTIniciada : number = 0; //Variable que almacenará la cantidad de ordenes de trabajo que han sido iniciadas
  cantidadOTNoIniciada : number = 0; //Variable que almacenará la cantidad de ordenes de trabajo que no han sido iniciadas
  cantidadOTTerminada : number = 0; //Variable que almacenará la cantidad de ordenes de trabajo que han terminado
  cantidadOtAnulada : number = 0; //Variable que almacenará la cantidad de ordenes de trabajo que han sido anuladas
  cantidadOTFinalizada : number = 0; //variable que almacenará la cantidad de ordenes de trabajo que han finalizado
  cantidadOTCerrada : number = 0; //Variable que almacenará la cantidad de ordenes de trabajo que están cerradas
  modalProcesos : boolean = false; //Variable que validará cuando mostrar el modal de los procesos con cada rollo pesado
  vendedores : any [] = []; //Varibale que va a almacenar la informacion de los vendedores
  columnas : any [] = []; //Variable que almacenará las columnas de la tabla que no se verá inicialmente pero que se podrá elegir
  _columnasSeleccionada : any [] = []; //variable que almacenará las columnas de la tabla que han sido seleccionadas
  modalEstadosOT: boolean; //Variable que validará cuando se muestra el modal en el que se le puede cambiar el estado a la orden de trabajo
  otInfo : any; //Variable que guardará la informacion de la orden de trabajo a la cual se le va a cambiar el estado
  clientes: any[] = []; //Variable que almacencará la informacion de los clientes
  mostrarModalCostos : boolean = false; //Variable que validará cuando se muetra el modal de costos
  estadoModal : any; //Variablke que se utilizará para validar el estado en el que se encuentra la orden de trabajo y actualziar el estado
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  infoColor : string = ''; /** Variable que servirá para mostrar la descripción de cada color */
  @ViewChild('op') op: OverlayPanel | undefined;
  ordenesSeleccionadas : any [] = []; //Variable que se utilizará para almacenar las ordenes de trabajo que hayan sido elegidas

  constructor(private frmBuilder : FormBuilder,
                private AppComponent : AppComponent,
                  private fallasTecnicasService : FallasTecnicasService,
                    private estadosProcesos_OTService : EstadosProcesos_OTService,
                      private srvEstadosOTVendedores : EstadosProcesosOTxVendedoresService,
                        private estadosService : EstadosService,
                          private servicioBagPro : BagproService,
                            private usuarioService : UsuarioService,
                              private clientesService : ClientesService,
                                private messageService: MessageService,
                                  private shepherdService: ShepherdService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.formularioOT = this.frmBuilder.group({
      idDocumento : [null],
      fecha: [null],
      fechaFinal : [null],
      estado : [null],
      fallasOT : [null],
      ObservacionOT : [''],
      Vendedor : [''],
      cliente : [null],
      Id_Vendedor : [null],
      producto : [null],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.ObternerFallas();
    this.obtenerEstados();
    this.obtenerVendedores();
    this.obtenerClientes();
  }

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

  // Funcion que limpiará todos los campos de la vista
  limpiarCampos(){
    this.ArrayDocumento = [];
    this.formularioOT.reset();
    this.catidadOTAbiertas = 0;
    this.cantidadOTAsignadas = 0;
    this.cantidadOTTerminada = 0;
    this.cantidadOTIniciada = 0;
    this.cantidadOtAnulada = 0;
    this.cantidadOTFinalizada = 0;
    this.cantidadOTCerrada = 0;
    this.otSeleccionada = 0;
  }

  // Funcion que exportará a excel todo el contenido de la tabla
  exportToExcel() : void {
    if (this.ArrayDocumento.length == 0) this.mensajeAdvertencia('¡Advertencia!',"¡Para poder crear el archivo de Excel primero debe cargar minimo un OT en la tabla!");
    else {
      this.load = false;
      setTimeout(() => {
        const title = `Reporte de OT por Procesos - ${this.today}`;
        const header = ["ID Vendedor", "OT", "Mat. Prima", "Extrusión", "Impresión", "Rotograbado", "Laminado", "Doblado", "Corte", "Empaque", "Sellado", "Wiketiado", "Cant. Producir", "Cant. Producir Und.", "Medida", "Cant. Ingresada", "Cant. Enviada", "Fallas", "Observación", "Estado", "Fecha Creación", "Fecha Inicio", "Fecha Fin"]
        let datos : any =[];

        for (const item of this.ArrayDocumento) {
          const datos1  : any = [item.usu, item.ot, item.Mp, item.ext, item.imp, item.rot, item.lam, item.dbl, item.cor, item.emp, item.sel, item.wik, item.cant, item.cantUnd, item.und, item.entrada, item.salida, item.falla, item.obs, item.est, item.fecha, item.fechaInicio, item.fechaFinal];
          datos.push(datos1);
        }
        let workbook = new Workbook();
        let worksheet = workbook.addWorksheet(`Reporte de OT por Procesos - ${this.today}`);
        let titleRow = worksheet.addRow([title]);
        titleRow.font = { name: 'Calibri', family: 4, size: 16, underline: 'double', bold: true };
        worksheet.addRow([]);

        const Colores = ['Iniciado', 'Abierta', 'No Iniciado', 'Terminada', 'Asignada', 'Anulado'];

        let coloresRow = worksheet.addRow(Colores);
        let iniciado = coloresRow.getCell(1);
        let abierta = coloresRow.getCell(2);
        let noIniciado = coloresRow.getCell(3);
        let terminado = coloresRow.getCell(4);
        let asignado = coloresRow.getCell(5);
        let anulada = coloresRow.getCell(6);

        iniciado.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F9FC5B' }
        }

        abierta.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F6D45D' }
        }

        noIniciado.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'DDDDDD' }
        }

        terminado.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '8AFC9B' }
        }

        asignado.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '83D3FF' }
        }

        anulada.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF7878' }
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
        worksheet.mergeCells('A1:W2');
        worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

        datos.forEach(d => {
          let row = worksheet.addRow(d);
          let CantPedida = row.getCell(13);

          let qtyExt = row.getCell(4);
          let qtyImp = row.getCell(5);
          let qtyRot = row.getCell(6);
          let qtyLam = row.getCell(7);
          let qtyDbl = row.getCell(8);
          let qtyCor = row.getCell(9);
          let qtyEmp = row.getCell(10);
          let qtySel = row.getCell(11);
          let qtyWik = row.getCell(12);
          let qtyEstado = row.getCell(20);

          // Extrusion
          row.getCell(4).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          let colorExt;
          if (+qtyExt.value >= d[12] && d[19] != 'Asignada' && d[19] != 'Abierta') colorExt = 'C7FD7A'; //Terminada
          else if (+qtyExt.value < d[12] && +qtyExt.value > 0) colorExt = 'F9FC5B'; //Iniciada
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0 && d[19] == 'Abierta') colorExt = 'FDCD7A'; //Abierta
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0  && d[19] == 'Asignada') colorExt = 'ADD8E6'; //Asignada
          else if (+qtyExt.value == 0 && (qtyImp.value == 0 || qtyRot.value == 0 || qtyLam.value == 0 || qtyDbl.value == 0 || qtyCor.value == 0 || qtyEmp.value == 0 || qtySel.value == 0 || qtyWik.value == 0 ) && d[19] != 'Asignada' && d[19] != 'Abierta') colorExt = 'DDDDDD'; //No Iniciada
          qtyExt.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colorExt }
          }

          // Impresion
          row.getCell(5).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          let colorImp;
          if (+qtyImp.value >= d[12] && d[19] != 'Asignada' && d[19] != 'Abierta') colorImp = 'C7FD7A'; //Terminada
          else if (+qtyImp.value < d[12] && +qtyImp.value > 0) colorImp = 'F9FC5B'; //Iniciada
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0 && d[19] == 'Abierta') colorImp = 'FDCD7A'; //Abierta
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0  && d[19] == 'Asignada') colorImp = 'ADD8E6'; //Asignada
          else if (+qtyImp.value == 0 && (qtyExt.value == 0 || qtyRot.value == 0 || qtyLam.value == 0 || qtyDbl.value == 0 || qtyCor.value == 0 || qtyEmp.value == 0 || qtySel.value == 0 || qtyWik.value == 0 ) && d[19] != 'Asignada' && d[19] != 'Abierta') colorImp = 'DDDDDD'; //No Iniciada
          qtyImp.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colorImp }
          }

          //Rotograbado
          row.getCell(6).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          let colorRot;
          if (+qtyRot.value >= d[12] && d[19] != 'Asignada' && d[19] != 'Abierta') colorRot = 'C7FD7A'; //Terminada
          else if (+qtyRot.value < d[12] && +qtyRot.value > 0) colorRot = 'F9FC5B'; //Iniciada
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0 && d[19] == 'Abierta') colorRot = 'FDCD7A'; //Abierta
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0  && d[19] == 'Asignada') colorRot = 'ADD8E6'; //Asignada
          else if (+qtyRot.value == 0 && (qtyExt.value == 0 || qtyImp.value == 0 || qtyLam.value == 0 || qtyDbl.value == 0 || qtyCor.value == 0 || qtyEmp.value == 0 || qtySel.value == 0 || qtyWik.value == 0 ) && d[19] != 'Asignada' && d[19] != 'Abierta') colorRot = 'DDDDDD'; //No Iniciada
          qtyRot.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colorRot }
          }

          //Laminado
          row.getCell(7).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          let colorLam;
          if (+qtyLam.value >= d[12] && d[19] != 'Asignada' && d[19] != 'Abierta') colorLam = 'C7FD7A'; //Terminada
          else if (+qtyLam.value < d[12] && +qtyLam.value > 0) colorLam = 'F9FC5B'; //Iniciada
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0 && d[19] == 'Abierta') colorLam = 'FDCD7A'; //Abierta
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0  && d[19] == 'Asignada') colorLam = 'ADD8E6'; //Asignada
          else if (+qtyLam.value == 0 && (qtyExt.value == 0 || qtyImp.value == 0 || qtyRot.value == 0 || qtyDbl.value == 0 || qtyCor.value == 0 || qtyEmp.value == 0 || qtySel.value == 0 || qtyWik.value == 0 ) && d[19] != 'Asignada' && d[19] != 'Abierta') colorLam = 'DDDDDD'; //No Iniciada
          qtyLam.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colorLam }
          }

          // Doblado
          row.getCell(8).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          let colorDbl;
          if (+qtyDbl.value >= d[12] && d[19] != 'Asignada' && d[19] != 'Abierta') colorDbl = 'C7FD7A'; //Terminada
          else if (+qtyDbl.value < d[12] && +qtyDbl.value > 0) colorDbl = 'F9FC5B'; //Iniciada
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0 && d[19] == 'Abierta') colorDbl = 'FDCD7A'; //Abierta
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0  && d[19] == 'Asignada') colorDbl = 'ADD8E6'; //Asignada
          else if (+qtyDbl.value == 0 && (qtyExt.value == 0 || qtyImp.value == 0 || qtyRot.value == 0 || qtyLam.value == 0 || qtyCor.value == 0 || qtyEmp.value == 0 || qtySel.value == 0 || qtyWik.value == 0 ) && d[19] != 'Asignada' && d[19] != 'Abierta') colorDbl = 'DDDDDD'; //No Iniciada
          qtyDbl.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colorDbl }
          }

          // Corte
          row.getCell(9).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          let colorCor;
          if (+qtyCor.value >= d[12] && d[19] != 'Asignada' && d[19] != 'Abierta') colorCor = 'C7FD7A'; //Terminada
          else if (+qtyCor.value < d[12] && +qtyCor.value > 0) colorCor = 'F9FC5B'; //Iniciada
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0 && d[19] == 'Abierta') colorCor = 'FDCD7A'; //Abierta
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0  && d[19] == 'Asignada') colorCor = 'ADD8E6'; //Asignada
          else if (+qtyCor.value == 0 && (qtyExt.value == 0 || qtyImp.value == 0 || qtyRot.value == 0 || qtyLam.value == 0 || qtyDbl.value == 0 || qtyEmp.value == 0 || qtySel.value == 0 || qtyWik.value == 0 ) && d[19] != 'Asignada' && d[19] != 'Abierta') colorCor = 'DDDDDD'; //No Iniciada
          qtyCor.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colorCor }
          }

          // Empaque
          row.getCell(10).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          let colorEmp;
          if (+qtyEmp.value >=  (+CantPedida + (+CantPedida)) && d[19] != 'Asignada' && d[19] != 'Abierta') colorEmp = 'C7FD7A'; //Terminada
          else if (+qtyEmp.value <  (+CantPedida + (+CantPedida)) && +qtyEmp.value > 0) colorEmp = 'F9FC5B'; //Iniciada
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0 && d[19] == 'Abierta') colorEmp = 'FDCD7A'; //Abierta
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0  && d[19] == 'Asignada') colorEmp = 'ADD8E6'; //Asignada
          else if (+qtyEmp.value == 0 && (qtyExt.value == 0 || qtyImp.value == 0 || qtyRot.value == 0 || qtyLam.value == 0 || qtyDbl.value == 0 || qtyCor.value == 0 || qtySel.value == 0 || qtyWik.value == 0 ) && d[19] != 'Asignada' && d[19] != 'Abierta') colorEmp = 'DDDDDD'; //No Iniciada
          qtyEmp.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colorEmp }
          }

          // Sellado
          row.getCell(11).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          let colorSel;
          if (+qtySel.value >= (+CantPedida + (+CantPedida)) && d[19] != 'Asignada' && d[19] != 'Abierta') colorSel = 'C7FD7A'; //Terminada
          else if (+qtySel.value <  (+CantPedida + (+CantPedida)) && +qtySel.value > 0) colorSel = 'F9FC5B'; //Iniciada
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0 && d[19] == 'Abierta') colorSel = 'FDCD7A'; //Abierta
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0  && d[19] == 'Asignada') colorSel = 'ADD8E6'; //Asignada
          else if (+qtySel.value == 0 && (qtyExt.value == 0 || qtyImp.value == 0 || qtyRot.value == 0 || qtyLam.value == 0 || qtyDbl.value == 0 || qtyCor.value == 0 || qtyEmp.value == 0 || qtyWik.value == 0 ) && d[19] != 'Asignada' && d[19] != 'Abierta') colorSel = 'DDDDDD'; //No Iniciada
          qtySel.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colorSel }
          }

          // Wiketiado
          row.getCell(12).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          let colorWik;
          if (+qtyWik.value >=  (+CantPedida + (+CantPedida)) && d[19] != 'Asignada' && d[19] != 'Abierta') colorWik = 'C7FD7A'; //Terminada
          else if (+qtyWik.value < (+CantPedida + (+CantPedida)) && +qtyWik.value > 0) colorWik = 'F9FC5B'; //Iniciada
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0 && d[19] == 'Abierta') colorWik = 'FDCD7A'; //Abierta
          else if (+qtyExt.value == 0 && qtyImp.value == 0 && qtyRot.value == 0 && qtyLam.value == 0 && qtyDbl.value == 0 && qtyCor.value == 0 && qtyEmp.value == 0 && qtySel.value == 0 && qtyWik.value == 0  && d[19] == 'Asignada') colorWik = 'ADD8E6'; //Asignada
          else if (+qtyWik.value == 0 && (qtyExt.value == 0 || qtyImp.value == 0 || qtyRot.value == 0 || qtyLam.value == 0 || qtyDbl.value == 0 || qtyCor.value == 0 || qtyEmp.value == 0 || qtySel.value == 0 ) && d[19] != 'Asignada' && d[19] != 'Abierta') colorWik = 'DDDDDD'; //No Iniciada
          qtyWik.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colorWik }
          }

          // Estado
          let colorEstado;
          if (d[19] == 'Terminada') colorEstado = 'C7FD7A'; //Terminada
          else if (d[19] == 'En proceso') colorEstado = 'F9FC5B'; //Iniciada
          else if (d[19] == 'Abierta') colorEstado = 'FDCD7A'; //Abierta
          else if (d[19] == 'Asignada') colorEstado = 'ADD8E6'; //Asignada
          else if (d[19] == 'Anaulado') colorEstado = 'FF7878' //Anulada
          qtyEstado.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colorEstado }
          }

          row.getCell(3).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(12).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(13).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(14).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(16).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(17).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
        });
        worksheet.getColumn(1).width = 12;  //OT
        worksheet.getColumn(2).width = 12;  //MP
        worksheet.getColumn(3).width = 12;  //EXT
        worksheet.getColumn(4).width = 12;  //IMP
        worksheet.getColumn(5).width = 12;  //ROT
        worksheet.getColumn(6).width = 12;  //LAM
        worksheet.getColumn(7).width = 12;  //DOB
        worksheet.getColumn(8).width = 12;  //CORTE
        worksheet.getColumn(9).width = 12;  //EMP
        worksheet.getColumn(10).width = 12; //SELL
        worksheet.getColumn(11).width = 15; //WIK
        worksheet.getColumn(12).width = 15; //PED KG
        worksheet.getColumn(13).width = 15; //PED UND
        worksheet.getColumn(14).width = 20; //UND MED
        worksheet.getColumn(15).width = 10; //ING
        worksheet.getColumn(16).width = 15; //ENV
        worksheet.getColumn(17).width = 15; //FALLA
        worksheet.getColumn(18).width = 20; //OBS
        worksheet.getColumn(19).width = 15; //ESTADO
        worksheet.getColumn(20).width = 20; //FCREACION
        worksheet.getColumn(21).width = 15; //FINICIAL
        worksheet.getColumn(22).width = 15; //FFINAL
        worksheet.getColumn(23).width = 15;

        setTimeout(() => {
          workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, `Reporte de OT por Procesos - ${this.today}.xlsx`);
            this.mensajeConfirmacion('¡Archivo Creado!', '¡Se ha exportado la información a un archivo de tipo Excel!');
          });
          this.load = true;
        }, 1000);
      }, 3500);
    }
  }

  // Funcion que obtendrá los clientes
  obtenerClientes(){
    this.clientesService.srvObtenerLista().subscribe(datos_clientes => { this.clientes = datos_clientes; });
    this.clientes.sort((a,b) => a.cli_Nombre.localeCompare(b.cli_Nombre));
  }

  // Funcion que nu cliente y guardará su id y mostrará en el campo el nombre
  selectEventCliente() {
    let cliente = this.formularioOT.value.cliente;
    let nuevo: any[] = this.clientes.filter((item) => item.cli_Id == cliente)
    this.formularioOT.patchValue({ cliente : nuevo[0].cli_Nombre, });
  }

  // Funcion que traerá los vendedores
  obtenerVendedores(){
    this.vendedores = [];
    this.usuarioService.srvObtenerListaUsuario().subscribe(datos_usuarios => {
      for (let i = 0; i < datos_usuarios.length; i++) {
        if (datos_usuarios[i].rolUsu_Id == 2) this.vendedores.push(datos_usuarios[i]);
        this.vendedores.sort((a,b) => a.usua_Nombre.localeCompare(b.usua_Nombre));
      }
    });
  }

  // Funcion que va a llenar y buscar el campos vendedor
  buscarVendedor(){
    let vendedor : any = this.formularioOT.value.Vendedor;
    let nuevo : any[] = this.vendedores.filter((item) => item.usua_Id == vendedor);
    this.formularioOT.patchValue({ Vendedor : nuevo[0].usua_Nombre, Id_Vendedor : nuevo[0].usua_Id, });
  }

  // Funcion que mostrará las posibles fallas que puede tener una orden de trabajo en produccion
  ObternerFallas = () => this.fallasTecnicasService.srvObtenerLista().subscribe(datos_fallas => this.fallas = datos_fallas);

  //Funcion que consultará los estados para ordenes de trabajo
  obtenerEstados(){
    this.estadosService.srvObtenerListaEstados().subscribe(datos_estados => {
      for (let i = 0; i < datos_estados.length; i++) {
        if (datos_estados[i].tpEstado_Id == 4 || datos_estados[i].estado_Id == 3) this.estados.push(datos_estados[i]);
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
    let fechaincial : any = moment(this.formularioOT.value.fecha).format('YYYY-MM-DD');
    let fechaFinal : any = moment(this.formularioOT.value.fechaFinal).format('YYYY-MM-DD');
    let fallas : any = this.formularioOT.value.fallasOT;
    let estado : number = this.formularioOT.value.estado;
    let vendedor : any = this.formularioOT.value.Id_Vendedor;
    let cliente : any = this.formularioOT.value.cliente;
    let producto : any = this.formularioOT.value.producto;
    if (this.ValidarRol == 2) vendedor = this.storage_Id;
    this.catidadOTAbiertas = 0;
    this.cantidadOTAsignadas = 0;
    this.cantidadOTTerminada = 0;
    this.cantidadOTIniciada = 0;
    this.cantidadOtAnulada = 0;
    this.cantidadOTFinalizada = 0;
    this.cantidadOTCerrada = 0;
    let ruta : string = '';
    let masDeUnFiltros : boolean = true;
    if (fechaincial == 'Invalid date') fechaincial = null;
    if (fechaFinal == 'Invalid date') fechaFinal = null;

    //6
    if (numOT != null && fallas != null && estado != null && vendedor != null && cliente != null && producto != null) ruta = `?ot=${numOT}&cli=${cliente}&prod=${producto}&falla=${fallas}&estado=${estado}&vendedor=${vendedor}`;
    //5
    else if (numOT != null && fallas != null && estado != null && vendedor != null && cliente != null) ruta = `?ot=${numOT}&cli=${cliente}&falla=${fallas}&estado=${estado}&vendedor=${vendedor}`;
    else if (numOT != null && fallas != null && estado != null && vendedor != null && producto != null) ruta = `?ot=${numOT}&prod=${producto}&falla=${fallas}&estado=${estado}&vendedor=${vendedor}`;
    else if (numOT != null && fallas != null && estado != null && cliente != null && producto != null) ruta = `?ot=${numOT}&cli=${cliente}&prod=${producto}&falla=${fallas}&estado=${estado}`;
    else if (numOT != null && fallas != null && vendedor != null && cliente != null && producto != null) ruta = `?ot=${numOT}&cli=${cliente}&prod=${producto}&falla=${fallas}&vendedor=${vendedor}`;
    else if (numOT != null && estado != null && vendedor != null && cliente != null && producto != null) ruta = `?ot=${numOT}&cli=${cliente}&prod=${producto}&estado=${estado}&vendedor=${vendedor}`;
    else if (fallas != null && estado != null && vendedor != null && cliente != null && producto != null) ruta = `?cli=${cliente}&prod=${producto}&falla=${fallas}&estado=${estado}&vendedor=${vendedor}`;
    //4
    else if (numOT != null && vendedor != null && cliente != null && producto != null) ruta = `?ot=${numOT}&cli=${cliente}&prod=${producto}&vendedor=${vendedor}`;
    else if (numOT != null && estado != null && cliente != null && producto != null) ruta = `?ot=${numOT}&cli=${cliente}&prod=${producto}&estado=${estado}`;
    else if (numOT != null && estado != null && vendedor != null && producto != null) ruta = `?ot=${numOT}&prod=${producto}&estado=${estado}&vendedor=${vendedor}`;
    else if (numOT != null && estado != null && vendedor != null && cliente != null) ruta = `?ot=${numOT}&cli=${cliente}&estado=${estado}&vendedor=${vendedor}`;
    else if (numOT != null && fallas != null && cliente != null && producto != null) ruta = `?ot=${numOT}&cli=${cliente}&prod=${producto}&falla=${fallas}`;
    else if (numOT != null && fallas != null && vendedor != null && producto != null) ruta = `?ot=${numOT}&prod=${producto}&falla=${fallas}&vendedor=${vendedor}`;
    else if (numOT != null && fallas != null && vendedor != null && cliente != null) ruta = `?ot=${numOT}&cli=${cliente}&falla=${fallas}&vendedor=${vendedor}`;
    else if (numOT != null && fallas != null && estado != null && producto != null) ruta = `?ot=${numOT}&prod=${producto}&falla=${fallas}&estado=${estado}`;
    else if (numOT != null && fallas != null && estado != null && cliente != null) ruta = `?ot=${numOT}&cli=${cliente}&falla=${fallas}&estado=${estado}`;
    else if (numOT != null && fallas != null && estado != null && vendedor != null) ruta = `?ot=${numOT}&falla=${fallas}&estado=${estado}&vendedor=${vendedor}`;
    else if (estado != null && vendedor != null && cliente != null && producto != null) ruta = `?cli=${cliente}&prod=${producto}&estado=${estado}&vendedor=${vendedor}`;
    else if (fallas != null && vendedor != null && cliente != null && producto != null) ruta = `?cli=${cliente}&prod=${producto}&falla=${fallas}&vendedor=${vendedor}`;
    //3
    else if (numOT != null && cliente != null && producto != null) ruta = `?ot=${numOT}&cli=${cliente}&prod=${producto}`;
    else if (numOT != null && vendedor != null && producto != null) ruta = `?ot=${numOT}&prod=${producto}&vendedor=${vendedor}`;
    else if (numOT != null && vendedor != null && cliente != null) ruta = `?ot=${numOT}&cli=${cliente}&vendedor=${vendedor}`;
    else if (numOT != null && estado != null && producto != null) ruta = `?ot=${numOT}&prod=${producto}&estado=${estado}`;
    else if (numOT != null && estado != null && cliente != null) ruta = `?ot=${numOT}&cli=${cliente}&estado=${estado}`;
    else if (numOT != null && fallas != null && producto != null) ruta = `?ot=${numOT}&prod=${producto}&falla=${fallas}`;
    else if (numOT != null && fallas != null && cliente != null) ruta = `?ot=${numOT}&cli=${cliente}&falla=${fallas}`;
    else if (numOT != null && fallas != null && estado != null) ruta = `?ot=${numOT}&falla=${fallas}&estado=${estado}`;
    else if (numOT != null && estado != null && vendedor != null) ruta = `?ot=${numOT}&estado=${estado}&vendedor=${vendedor}`;
    else if (vendedor != null && cliente != null && producto != null) ruta = `?cli=${cliente}&prod=${producto}&vendedor=${vendedor}`;
    else if (estado != null && cliente != null && producto != null) ruta = `?cli=${cliente}&prod=${producto}&estado=${estado}`;
    else if (estado != null && vendedor != null && producto != null) ruta = `?prod=${producto}&estado=${estado}&vendedor=${vendedor}`;
    else if (estado != null && vendedor != null && cliente != null) ruta = `?cli=${cliente}&estado=${estado}&vendedor=${vendedor}`;
    else if (fallas != null && cliente != null && producto != null) ruta = `?cli=${cliente}&prod=${producto}&falla=${fallas}`;
    else if (fallas != null && vendedor != null && producto != null) ruta = `?prod=${producto}&falla=${fallas}&vendedor=${vendedor}`;
    else if (fallas != null && vendedor != null && cliente != null) ruta = `?cli=${cliente}&falla=${fallas}&vendedor=${vendedor}`;
    else if (fallas != null && estado != null && producto != null) ruta = `?prod=${producto}&falla=${fallas}&estado=${estado}`;
    else if (fallas != null && estado != null && cliente != null) ruta = `?cli=${cliente}&falla=${fallas}&estado=${estado}`;
    else if (fallas != null && estado != null && vendedor != null) ruta = `?falla=${fallas}&estado=${estado}&vendedor=${vendedor}`;
    else if (numOT != null && fechaincial != null && fechaFinal != null) {
      masDeUnFiltros = false;
      this.estadosProcesos_OTService.srvObtenerListaPorOtFechas(numOT, fechaincial, fechaFinal).subscribe(datos_ot => {
        if (datos_ot.length == 0) setTimeout(() => { this.mensajeAdvertencia('¡Advertencia!',`No se encontraron OT's con la combinación de filtros consultada.`); }, 3000);
        else {
          for (let i = 0; i < datos_ot.length; i++) {
            this.llenarArray(datos_ot[i]);
          }
        }
      });
    } else if (fechaincial != null && fechaFinal != null && vendedor != null) {
      masDeUnFiltros = false;
      if (fechaincial < '2022-05-01' && fechaFinal < '2022-05-01') setTimeout(() => { this.mensajeAdvertencia(`Advertencia`, 'Solo se mostrarán OTs desde el inicio de las Asignaciones de Materia Prima (01/05/2022)');}, 4800);
      else if (fechaFinal < fechaincial) setTimeout(() => {this.mensajeAdvertencia('¡Advertencia!','La fecha final debe ser mayor que la fecha inicial');}, 4800);
      else {
        this.srvEstadosOTVendedores.srvObtenerListaPorFechas(fechaincial, fechaFinal, vendedor).subscribe(datos_ot => {
          if(datos_ot.length == 0) {setTimeout(() => {this.mensajeAdvertencia('¡Advertencia!','No existen OTs creadas en las fechas consultadas.')}, 4800);
          } else {
            for (let i = 0; i < datos_ot.length; i++) {
              this.servicioBagPro.srvObtenerListaClienteOT_Item(datos_ot[i].estProcOT_OrdenTrabajo).subscribe(datos_bagpro => {
                for (let j = 0; j < datos_bagpro.length; j++) {
                  this.llenarArray(datos_ot[i]);
                }
              });
            }
          }
        });
      }
    } else if (fechaincial != null && fechaFinal != null && fallas != null) {
      masDeUnFiltros = false;
      this.estadosProcesos_OTService.srvObtenerListaPorFechasFallas(fechaincial, fechaFinal, fallas).subscribe(datos_ot => {
        if (datos_ot.length == 0) setTimeout(() => { this.mensajeAdvertencia('¡Advertencia!',`No se encontraron OT's con la combinación de filtros consultada.`); }, 3000);
        else {
          for (let i = 0; i < datos_ot.length; i++) {
            this.llenarArray(datos_ot[i]);
          }
        }
      });
    } else if (fechaincial != null && fechaFinal != null && estado != null) {
      masDeUnFiltros = false;
      this.estadosProcesos_OTService.srvObtenerListaPorFechasEstado(fechaincial, fechaFinal, estado).subscribe(datos_ot => {
        if (datos_ot.length == 0) setTimeout(() => { this.mensajeAdvertencia('¡Advertencia!',`No se encontraron OT's con la combinación de filtros consultada.`); }, 3000);
        else {
          for (let i = 0; i < datos_ot.length; i++) {
            this.llenarArray(datos_ot[i]);
          }
        }
      });
    }
    //2
    else if (numOT != null && fallas != null) ruta = `?ot=${numOT}&falla=${fallas}`;
    else if (numOT != null && estado != null) ruta = `?ot=${numOT}&estado=${estado}`;
    else if (numOT != null && vendedor != null) ruta = `?ot=${numOT}&vendedor=${vendedor}`;
    else if (numOT != null && cliente != null) ruta = `?ot=${numOT}&cli=${cliente}`;
    else if (numOT != null && producto != null) ruta = `?ot=${numOT}&prod=${producto}`;
    else if (fallas != null && estado != null) ruta = `?falla=${fallas}&estado=${estado}`;
    else if (fallas != null && vendedor != null) ruta = `?falla=${fallas}&vendedor=${vendedor}`;
    else if (fallas != null && cliente != null) ruta = `?cli=${cliente}&falla=${fallas}`;
    else if (fallas != null && producto != null) ruta = `?prod=${producto}&falla=${fallas}`;
    else if (estado != null && vendedor != null) ruta = `?estado=${estado}&vendedor=${vendedor}`;
    else if (estado != null && cliente != null) ruta = `?cli=${cliente}&estado=${estado}`;
    else if (estado != null && producto != null) ruta = `?prod=${producto}&estado=${estado}`;
    else if (vendedor != null && cliente != null) ruta = `?cli=${cliente}&vendedor=${vendedor}`;
    else if (vendedor != null && producto != null) ruta = `?prod=${producto}&vendedor=${vendedor}`;
    else if (cliente != null && producto != null) ruta = `?cli=${cliente}&prod=${producto}`;
    //1
    else if (numOT != null) {
      masDeUnFiltros = false;
      this.estadosProcesos_OTService.srvObtenerListaPorOT(numOT).subscribe(datos_ot => {
        if (datos_ot.length == 0) setTimeout(() => {this.mensajeAdvertencia('¡Advertencia!','No se encontró la OT consultada.');}, 3000);
        else {
          for (let i = 0; i < datos_ot.length; i++) {
            this.llenarArray(datos_ot[i]);
          }
        }
      });
    } else if (fallas != null) {
      masDeUnFiltros = false;
      this.estadosProcesos_OTService.srvObtenerListaPorFallas(fallas).subscribe(datos_ot => {
        if (datos_ot.length == 0) setTimeout(() => { this.mensajeAdvertencia('¡Advertencia!','No se encontraron OTs con la falla consultada.'); }, 3000);
        else {
          for (let i = 0; i < datos_ot.length; i++) {
            this.llenarArray(datos_ot[i]);
          }
        }
      });
    } else if (vendedor != null) {
      masDeUnFiltros = false;
      this.srvEstadosOTVendedores.consultarPorFechasVendedor(this.today, this.today, vendedor).subscribe(datos_ot => {
        if(datos_ot.length == 0) setTimeout(() => { this.mensajeAdvertencia('¡Advertencia!',`No se encontraron OT's con el Estado consultado.`); }, 4800);
        else{
          for (let i = 0; i < datos_ot.length; i++) {
            this.servicioBagPro.srvObtenerOTsPorVendedor(datos_ot[i].estProcOT_OrdenTrabajo).subscribe(datos_bagpro => {
              for (let j = 0; j < datos_bagpro.length; j++) {
                this.llenarArray(datos_ot[i]);
              }
            });
          }
        }
      });
    } else if (estado != null) {
      masDeUnFiltros = false;
      this.estadosProcesos_OTService.srvObtenerListaPorOtEstado(estado).subscribe(datos_ot => {
        if (datos_ot.length == 0) setTimeout(() => {this.mensajeAdvertencia('¡Advertencia!',`No se encontraron OT's con el Estado consultado.`);}, 3000);
        else{
          for (let i = 0; i < datos_ot.length; i++) {
            this.llenarArray(datos_ot[i]);
          }
        }
      });
    } else if (cliente != null) {
      masDeUnFiltros = false;
      this.estadosProcesos_OTService.srvObtenerListaPorCliente(cliente).subscribe(datos_ot => {
        if (datos_ot.length == 0) setTimeout(() => {this.mensajeAdvertencia('¡Advertencia!',`No se encontraron OT's con el Cliente consultado.`);}, 3000);
        else{
          for (let i = 0; i < datos_ot.length; i++) {
            this.llenarArray(datos_ot[i]);
          }
        }
      });
    } else if (producto != null) {
      masDeUnFiltros = false;
      this.estadosProcesos_OTService.srvObtenerListaPorProductos(producto).subscribe(datos_ot => {
        if (datos_ot.length == 0) setTimeout(() => {this.mensajeAdvertencia('¡Advertencia!',`No se encontraron OT's con el producto consultado.`);}, 3000);
        else{
          for (let i = 0; i < datos_ot.length; i++) {
            this.llenarArray(datos_ot[i]);
          }
        }
      });
    }
    //0
    else ruta = '';
    setTimeout(() => {
      if (masDeUnFiltros == true){
      if(fechaincial == null) fechaincial = this.today;
      if(fechaFinal == null) fechaFinal = fechaincial;
        this.estadosProcesos_OTService.GetReporteProcesosOt(fechaincial, fechaFinal, ruta).subscribe(datos_ot => {
          if (datos_ot.length == 0) setTimeout(() => { this.mensajeAdvertencia('¡Advertencia!',`¡No se encontraron Ordenes de Trabajo con los parametros consultados!`); }, 3000);
          else {
            for (let i = 0; i < datos_ot.length; i++) {
              this.llenarArray(datos_ot[i]);
            }
          }
        });
      }
    }, 1500);

    setTimeout(() => { this.load = true; }, 2500);
  }

  //Funcion encargada de llenar un array con la informacion de las ordenes de trabajo y el producido de cada area
  llenarArray(data : any){
    data.usua_Id = `${data.usua_Id}`
    if (data.usua_Id.length == 2) data.usua_Id = `0${data.usua_Id}`;
    else if (data.usua_Id.length == 1) data.usua_Id = `00${data.usua_Id}`;

    if (data.estProcOT_FechaInicio == null) data.estProcOT_FechaInicio = data.estProcOT_FechaInicio
    else data.estProcOT_FechaInicio = data.estProcOT_FechaInicio.replace("T00:00:00", "");

    if (data.estProcOT_FechaFinal == null) data.estProcOT_FechaFinal = data.estProcOT_FechaFinal
    else data.estProcOT_FechaFinal = data.estProcOT_FechaFinal.replace("T00:00:00", "");

    let info : any = {
      ot : data.estProcOT_OrdenTrabajo,
      Mp : data.estProcOT_CantMatPrimaAsignada,
      ext : data.estProcOT_ExtrusionKg,
      imp : data.estProcOT_ImpresionKg,
      rot : data.estProcOT_RotograbadoKg,
      dbl : data.estProcOT_DobladoKg,
      lam : data.estProcOT_LaminadoKg,
      cor : data.estProcOT_CorteKg,
      emp : data.estProcOT_EmpaqueKg,
      sel : data.estProcOT_SelladoKg,
      selUnd : data.estProcOT_SelladoUnd,
      wik : data.estProcOT_WiketiadoKg,
      wikUnd : data.estProcOT_WiketiadoUnd,
      cant : data.estProcOT_CantidadPedida,
      cantUnd : `${this.formatonumeros(data.estProcOT_CantidadPedida)} Kg - ${this.formatonumeros(data.estProcOT_CantidadPedidaUnd)} Und`,
      falla : data.falla_Nombre,
      obs : data.estProcOT_Observacion,
      est : data.estado_Nombre,
      fecha : data.estProcOT_FechaCreacion.replace("T00:00:00", ""),
      entrada : this.formatonumeros(data.estProcOT_CantProdIngresada),
      salida : this.formatonumeros(data.estProcOT_CantProdFacturada),
      fechaInicio : data.estProcOT_FechaInicio,
      fechaFinal : data.estProcOT_FechaFinal,
      und : data.undMed_Id,
      usu : data.usua_Id,
      nombreUsu : data.usua_Nombre,
      cli : data.estProcOT_Cliente,
      prod : data.prod_Nombre,
      ped : data.estProcOT_Pedido,
    }
    this.columnas = [
      { header: 'Presentación', field: 'und'},
      { header: 'Vendedor', field: 'usu' },
      { header: 'Pedido', field: 'Ped'},
      { header: 'Cant Ingresada a Despacho', field: 'entrada'},
      { header: 'Cant Facturada', field: 'salida'},
      { header: 'Fallas', field: 'falla'},
      { header: 'Fecha Inicio OT', field: 'fechaInicio'},
      { header: 'Fecha Fin OT', field: 'fechaFinal'}
    ];

    this.ArrayDocumento.push(info);
    this.ArrayDocumento.sort((a,b) => Number(b.ot) - Number(a.ot));
    this.load = true;

    if (data.estado_Nombre == 'Abierta') this.catidadOTAbiertas += 1;
    if (data.estado_Nombre == 'Asignada') this.cantidadOTAsignadas += 1;
    if (data.estado_Nombre == 'Terminada') this.cantidadOTTerminada += 1;
    if (data.estado_Nombre == 'En proceso') this.cantidadOTIniciada += 1;
    if (data.estado_Nombre == 'Anulado') this.cantidadOtAnulada += 1;
    if (data.estado_Nombre == 'Finalizada') this.cantidadOTFinalizada += 1;
    if (data.estado_Nombre == 'Cerrada') this.cantidadOTCerrada += 1;
  }

  // Funcion que consolutará los rollos pesados por cada proceso
  seleccionarOTxStatus(form : any, proceso : any){
    this.otSeleccionada = form.ot;

    if (proceso == 'EXTRUSION' && form.ext > 0) {
      this.servicioBagPro.srvObtenerListaPorStatusExtrusion(this.otSeleccionada).subscribe(registros_OT => {
        if (registros_OT.length == 0) this.mensajeAdvertencia('¡Advertencia!',`No se encontraron registros de la OT ${this.otSeleccionada} en el proceso de ${proceso}`);
        else {
          this.modalProcesos = true;
          setTimeout(() => {
            this.MostrarDatosOTxStatus.ArrayDatosProcesos = [];

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
        }, 500);
        }
      });

      this.servicioBagPro.srvObtenerDataConsolidada_StatusExtrusion(this.otSeleccionada, proceso).subscribe(datos_agrupados => {
        this.MostrarDatosOTxStatus.ArrayDatosAgrupados = [];
        for (let i = 0; i < datos_agrupados.length; i++) {
          setTimeout(() => {
            let info : any = {
              Ot : datos_agrupados[i].ot,
              Producto : datos_agrupados[i].clienteItemNombre,
              Operador : datos_agrupados[i].operador,
              Peso : this.formatonumeros(datos_agrupados[i].sumaPesoKg),
              Fecha : datos_agrupados[i].fecha.replace('T00:00:00', ''),
              Proceso : datos_agrupados[i].nomStatus,
              Count : datos_agrupados[i].count,
            }
            this.MostrarDatosOTxStatus.ArrayDatosAgrupados.push(info);
            this.MostrarDatosOTxStatus.ArrayDatosAgrupados.sort((a,b) => a.Operador.localeCompare(b.Operador));
          }, 500);
        }
      });

    } else if (proceso == 'IMPRESION' && form.imp > 0) {
      this.servicioBagPro.srvObtenerListaPorStatusImpresion(this.otSeleccionada).subscribe(registros_OT => {
        if (registros_OT.length == 0) this.mensajeAdvertencia('¡Advertencia!',`No se encontraron registros de la OT ${this.otSeleccionada} en el proceso de ${proceso}`);
        else {
          this.modalProcesos = true;
          setTimeout(() => {
            this.MostrarDatosOTxStatus.ArrayDatosProcesos = [];
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
          }, 500);
        }
      });

      this.servicioBagPro.srvObtenerDataConsolidada_StatusExtrusion(this.otSeleccionada, proceso).subscribe(datos_agrupados => {
        for (let i = 0; i < datos_agrupados.length; i++) {
          setTimeout(() => {
            let info : any = {
              Ot : datos_agrupados[i].ot,
              Producto : datos_agrupados[i].clienteItemNombre,
              Operador : datos_agrupados[i].operador,
              Peso : this.formatonumeros(datos_agrupados[i].sumaPesoKg),
              Fecha : datos_agrupados[i].fecha.replace('T00:00:00', ''),
              Proceso : datos_agrupados[i].nomStatus,
              Count : datos_agrupados[i].count,
            }
            this.MostrarDatosOTxStatus.ArrayDatosAgrupados.push(info);
            this.MostrarDatosOTxStatus.ArrayDatosAgrupados.sort((a,b) => a.Operador.localeCompare(b.Operador));
          }, 500);
        }
      });
    } else if (proceso == 'ROTOGRABADO' && form.rot > 0) {
      this.servicioBagPro.srvObtenerListaPorStatusRotograbado(this.otSeleccionada).subscribe(registros_OT => {
        if (registros_OT.length == 0) this.mensajeAdvertencia('¡Advertencia!',`No se encontraron registros de la OT ${this.otSeleccionada} en el proceso de ${proceso}`);
        else {
          this.modalProcesos = true;
          setTimeout(() => {
            this.MostrarDatosOTxStatus.ArrayDatosProcesos = [];
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
          }, 500);
        }
      });

      this.servicioBagPro.srvObtenerDataConsolidada_StatusExtrusion(this.otSeleccionada, proceso).subscribe(datos_agrupados => {
        for (let i = 0; i < datos_agrupados.length; i++) {
          setTimeout(() => {
            let info : any = {
              Ot : datos_agrupados[i].ot,
              Producto : datos_agrupados[i].clienteItemNombre,
              Operador : datos_agrupados[i].operador,
              Peso : this.formatonumeros(datos_agrupados[i].sumaPesoKg),
              Fecha : datos_agrupados[i].fecha.replace('T00:00:00', ''),
              Proceso : datos_agrupados[i].nomStatus,
              Count : datos_agrupados[i].count,
            }
            this.MostrarDatosOTxStatus.ArrayDatosAgrupados.push(info);
            this.MostrarDatosOTxStatus.ArrayDatosAgrupados.sort((a,b) => a.Operador.localeCompare(b.Operador));
          }, 500);
        }
      });
    } else if (proceso == 'DOBLADO' && form.dbl > 0) {
      this.servicioBagPro.srvObtenerListaPorStatusDoblado(this.otSeleccionada).subscribe(registros_OT => {
        if (registros_OT.length == 0) this.mensajeAdvertencia('¡Advertencia!',`No se encontraron registros de la OT ${this.otSeleccionada} en el proceso de ${proceso}`);
        else {
          this.modalProcesos = true;
          setTimeout(() => {
            this.MostrarDatosOTxStatus.ArrayDatosProcesos = [];
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
          }, 500);
        }
      });

      this.servicioBagPro.srvObtenerDataConsolidada_StatusExtrusion(this.otSeleccionada, proceso).subscribe(datos_agrupados => {
        for (let i = 0; i < datos_agrupados.length; i++) {
          setTimeout(() => {
            let info : any = {
              Ot : datos_agrupados[i].ot,
              Producto : datos_agrupados[i].clienteItemNombre,
              Operador : datos_agrupados[i].operador,
              Peso : this.formatonumeros(datos_agrupados[i].sumaPesoKg),
              Fecha : datos_agrupados[i].fecha.replace('T00:00:00', ''),
              Proceso : datos_agrupados[i].nomStatus,
              Count : datos_agrupados[i].count,
            }
            this.MostrarDatosOTxStatus.ArrayDatosAgrupados.push(info);
            this.MostrarDatosOTxStatus.ArrayDatosAgrupados.sort((a,b) => a.Operador.localeCompare(b.Operador));
          }, 500);
        }
      });
    } else if (proceso == 'LAMINADO' && form.lam > 0) {
      this.servicioBagPro.srvObtenerListaPorStatusLaminado(this.otSeleccionada).subscribe(registros_OT => {
        if (registros_OT.length == 0) this.mensajeAdvertencia('¡Advertencia!',`No se encontraron registros de la OT ${this.otSeleccionada} en el proceso de ${proceso}`);
        else {
          this.modalProcesos = true;
          setTimeout(() => {
            this.MostrarDatosOTxStatus.ArrayDatosProcesos = [];
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
          }, 500);
        }
      });

      this.servicioBagPro.srvObtenerDataConsolidada_StatusExtrusion(this.otSeleccionada, proceso).subscribe(datos_agrupados => {
        for (let i = 0; i < datos_agrupados.length; i++) {
          setTimeout(() => {
            let info : any = {
              Ot : datos_agrupados[i].ot,
              Producto : datos_agrupados[i].clienteItemNombre,
              Operador : datos_agrupados[i].operador,
              Peso : this.formatonumeros(datos_agrupados[i].sumaPesoKg),
              Fecha : datos_agrupados[i].fecha.replace('T00:00:00', ''),
              Proceso : datos_agrupados[i].nomStatus,
              Count : datos_agrupados[i].count,
            }
            this.MostrarDatosOTxStatus.ArrayDatosAgrupados.push(info);
            this.MostrarDatosOTxStatus.ArrayDatosAgrupados.sort((a,b) => a.Operador.localeCompare(b.Operador));
          }, 500);
        }
      });
    } else if (proceso == 'CORTE' && form.cor > 0) {
      this.servicioBagPro.srvObtenerListaPorStatusCorte(this.otSeleccionada).subscribe(registros_OT => {
        if (registros_OT.length == 0) this.mensajeAdvertencia('¡Advertencia!',`No se encontraron registros de la OT ${this.otSeleccionada} en el proceso de ${proceso}`);
        else {
          this.modalProcesos = true;
          setTimeout(() => {
            this.MostrarDatosOTxStatus.ArrayDatosProcesos = [];
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
          }, 500);
        }
      });

      this.servicioBagPro.srvObtenerDataConsolidada_StatusExtrusion(this.otSeleccionada, proceso).subscribe(datos_agrupados => {
        for (let i = 0; i < datos_agrupados.length; i++) {
          setTimeout(() => {
            let info : any = {
              Ot : datos_agrupados[i].ot,
              Producto : datos_agrupados[i].clienteItemNombre,
              Operador : datos_agrupados[i].operador,
              Peso : this.formatonumeros(datos_agrupados[i].sumaPesoKg),
              Fecha : datos_agrupados[i].fecha.replace('T00:00:00', ''),
              Proceso : datos_agrupados[i].nomStatus,
              Count : datos_agrupados[i].count,
            }
            this.MostrarDatosOTxStatus.ArrayDatosAgrupados.push(info);
            this.MostrarDatosOTxStatus.ArrayDatosAgrupados.sort((a,b) => a.Operador.localeCompare(b.Operador));
          }, 500);
        }
      });
    } else if (proceso == 'EMPAQUE' && form.emp > 0) {
      this.servicioBagPro.srvObtenerListaPorStatusEmpaque(this.otSeleccionada).subscribe(registros_OT => {
        if (registros_OT.length == 0) this.mensajeAdvertencia('¡Advertencia!',`No se encontraron registros de la OT ${this.otSeleccionada} en el proceso de ${proceso}`);
        else {
          this.modalProcesos = true;
          setTimeout(() => {
            this.MostrarDatosOTxStatus.ArrayDatosProcesos = [];
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
          }, 500);
        }
      });

      this.servicioBagPro.srvObtenerDataConsolidada_StatusExtrusion(this.otSeleccionada, proceso).subscribe(datos_agrupados => {
        for (let i = 0; i < datos_agrupados.length; i++) {
          setTimeout(() => {
            let info : any = {
              Ot : datos_agrupados[i].ot,
              Producto : datos_agrupados[i].clienteItemNombre,
              Operador : datos_agrupados[i].operador,
              Peso : this.formatonumeros(datos_agrupados[i].sumaPesoKg),
              Fecha : datos_agrupados[i].fecha.replace('T00:00:00', ''),
              Proceso : datos_agrupados[i].nomStatus,
              Count : datos_agrupados[i].count,
            }
            this.MostrarDatosOTxStatus.ArrayDatosAgrupados.push(info);
            this.MostrarDatosOTxStatus.ArrayDatosAgrupados.sort((a,b) => a.Operador.localeCompare(b.Operador));
          }, 500);
        }
      });
    } else if (proceso == 'SELLADO' && form.sel > 0) {
      this.servicioBagPro.srvObtenerListaPorStatusSellado(this.otSeleccionada).subscribe(registros_OT => {
        if (registros_OT.length == 0) this.mensajeAdvertencia('¡Advertencia!',`No se encontraron registros de la OT ${this.otSeleccionada} en el proceso de ${proceso}`);
        else {
          this.modalProcesos = true;
          setTimeout(() => {
            this.MostrarDatosOTxStatus.ArrayDatosProcesos = [];
            for (let index = 0; index < registros_OT.length; index++) {
              const Info : any = {
                Rollo : registros_OT[index].item,
                Cliente : registros_OT[index].cliente,
                Producto : registros_OT[index].nomReferencia,
                Peso : `${this.formatonumeros(registros_OT[index].peso)} Kg - ${this.formatonumeros(registros_OT[index].qty)} Und`,
                Unidad : registros_OT[index].unidad,
                Operador : registros_OT[index].operario,
                Maquina : registros_OT[index].maquina,
                Turno : registros_OT[index].turnos,
                Status : registros_OT[index].nomStatus,
                Fecha : registros_OT[index].fechaEntrada.replace("T00:00:00", " ") + registros_OT[index].hora,
              }
              this.MostrarDatosOTxStatus.ArrayDatosProcesos.push(Info);
            }
          }, 500);
        }
      });
      this.servicioBagPro.srvObtenerDataConsolidada_StatusSellado(this.otSeleccionada, proceso).subscribe(datos_agrupados => {
        for (let i = 0; i < datos_agrupados.length; i++) {
          setTimeout(() => {
            let info : any = {
              Ot : datos_agrupados[i].ot,
              Producto : datos_agrupados[i].nomReferencia,
              Operador : datos_agrupados[i].operario,
              Peso : `${this.formatonumeros(datos_agrupados[i].sumaCantidad)} UND - ${this.formatonumeros(datos_agrupados[i].sumaPeso)} KG`,
              Fecha : datos_agrupados[i].fechaEntrada.replace('T00:00:00', ''),
              Proceso : datos_agrupados[i].nomStatus,
              Count : datos_agrupados[i].count,
            }
            this.MostrarDatosOTxStatus.ArrayDatosAgrupados.push(info);
            this.MostrarDatosOTxStatus.ArrayDatosAgrupados.sort((a,b) => a.Operador.localeCompare(b.Operador));
          }, 500);
        }
      });
    } else if (proceso == 'Wiketiado' && form.wik > 0) {
      this.servicioBagPro.srvObtenerListaPorStatusWiketiado(this.otSeleccionada).subscribe(registros_OT => {
        if (registros_OT.length == 0) this.mensajeAdvertencia('¡Advertencia!',`No se encontraron registros de la OT ${this.otSeleccionada} en el proceso de ${proceso}`);
        else {
          this.modalProcesos = true;
          setTimeout(() => {
            this.MostrarDatosOTxStatus.ArrayDatosProcesos = [];
            for (let index = 0; index < registros_OT.length; index++) {
              const Info : any = {
                Rollo : registros_OT[index].item,
                Cliente : registros_OT[index].cliente,
                Producto : registros_OT[index].nomReferencia,
                Peso : `${this.formatonumeros(registros_OT[index].peso)} Kg - ${this.formatonumeros(registros_OT[index].qty)} Und`,
                Unidad : registros_OT[index].unidad,
                Operador : registros_OT[index].operario,
                Maquina : registros_OT[index].maquina,
                Turno : registros_OT[index].turnos,
                Status : registros_OT[index].nomStatus,
                Fecha : registros_OT[index].fechaEntrada.replace("T00:00:00", " ") + registros_OT[index].hora,
              }
              this.MostrarDatosOTxStatus.ArrayDatosProcesos.push(Info);
            }
          }, 500);
        }
      });
      this.servicioBagPro.srvObtenerDataConsolidada_StatusSellado(this.otSeleccionada, proceso).subscribe(datos_agrupados => {
        for (let i = 0; i < datos_agrupados.length; i++) {
          setTimeout(() => {
            let info : any = {
              Ot : datos_agrupados[i].ot,
              Producto : datos_agrupados[i].nomReferencia,
              Operador : datos_agrupados[i].operario,
              Peso : `${this.formatonumeros(datos_agrupados[i].sumaCantidad)} UND - ${this.formatonumeros(datos_agrupados[i].sumaPeso)} KG`,
              Fecha : datos_agrupados[i].fechaEntrada.replace('T00:00:00', ''),
              Proceso : datos_agrupados[i].nomStatus,
              Count : datos_agrupados[i].count,
            }
            this.MostrarDatosOTxStatus.ArrayDatosAgrupados.push(info);
            this.MostrarDatosOTxStatus.ArrayDatosAgrupados.sort((a,b) => a.Operador.localeCompare(b.Operador));
          }, 500);
        }
      });
    }
  }

  // Funcion que se encargará de limpiar los campos del modal de procesos
  limpiarModalProcesos(){
    this.modalProcesos = false;
    this.MostrarDatosOTxStatus.ArrayDatosProcesos = [];
    this.MostrarDatosOTxStatus.ArrayDatosAgrupados = [];
  }

  // Funcion que va a añadir una falla o observacion a una ot
  anadirFalla(){
    let falla : number = this.formularioOT.value.fallasOT;
    let observacion : string = this.formularioOT.value.ObservacionOT;

    if(this.otSeleccionada == 0) this.mensajeAdvertencia('¡Advertencia!','Debe seleccionar una OT');

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
          EstProcOT_CantProdFacturada : datos_ot[i].estProcOT_CantProdFacturada,
          EstProcOT_CantProdIngresada : datos_ot[i].estProcOT_CantProdIngresada,
          EstProcOT_CantMatPrimaAsignada : datos_ot[i].estProcOT_CantMatPrimaAsignada,
          EstProcOT_CantidadPedida : datos_ot[i].estProcOT_CantidadPedida,
          undMed_Id : datos_ot[i].undMed_Id,
          Estado_Id : datos_ot[i].estado_Id,
          Falla_Id : falla,
          EstProcOT_Observacion : observacion,
          EstProcOT_FechaCreacion : datos_ot[i].estProcOT_FechaCreacion,
          EstProcOT_EmpaqueKg : datos_ot[i].estProcOT_EmpaqueKg,
        }
        /**/
        if (falla == null) this.mensajeAdvertencia('¡Advertencia!',"Debe seleccionar un tipo de falla.")
        else {
          this.estadosProcesos_OTService.srvActualizarPorOT(this.otSeleccionada, info).subscribe(datos_ot => {
            this.mensajeConfirmacion('¡Falla Agregada!', `¡Falla agregada a la OT ${this.otSeleccionada} con exito!`);
            this.limpiarCampos();
          });
        }
      }
    });
  }

  //
  reporteOT(ot : number){
    this.otSeleccionada = ot;
    this.mostrarModalCostos = true;
    setTimeout(() => {
      this.reporteCostos.load = false;
      this.reporteCostos.modeModal = true;
      this.reporteCostos.infoOT.setValue({
        ot : ot,
        cliente : '',
        IdProducto : '',
        NombreProducto : '',
        cantProductoSinMargenUnd : '',
        cantProductoSinMargenKg : '',
        margenAdicional : '',
        cantProductoConMargen : '',
        PresentacionProducto : '',
        ValorUnidadProductoUnd : '',
        ValorUnidadProductoKg : '',
        ValorEstimadoOt : '',
        fechaInicioOT : '',
        fechaFinOT : '',
        estadoOT : '',
      });
      setTimeout(() => { this.reporteCostos.consultaOTBagPro(); }, 500);
    }, 500);
  }

  @Input() get columnasSeleccionada(): any[] {
    return this._columnasSeleccionada;
  }

  set columnasSeleccionada(val: any[]) {
    this._columnasSeleccionada = this.columnas.filter(col => val.includes(col));
  }

  // Funcion que va abrir el modal donde se podrá editar el estado de las ordenes de trabajo
  abrirModalCambioEstado(dato? : any){
    if (dato != null) {
      this.ordenesSeleccionadas = [dato];
      this.otInfo = {...dato.ot};
      this.otSeleccionada = dato.ot;
      if (dato.est == 'Terminada') this.estadoModal = '17';
      else if (dato.est == 'En proceso') this.estadoModal = '16';
      else if (dato.est == 'Asignada') this.estadoModal = '14';
      else if (dato.est == 'Abierta') this.estadoModal = '15';
      else if (dato.est == 'Anulado') this.estadoModal = '3';
      else if (dato.est == 'Cerrada') this.estadoModal = '18';
    }
    this.modalEstadosOT = true;
  }

  // Funcion que va a validar que una orden de trabajo esrá siendo eitada. Si validará si se está cambiando el estado por medio del botón con el lapiz o por medio de la selección de una o varias ot
  cambirEstadoOT() {
    for (let i = 0; i < this.ordenesSeleccionadas.length; i++){
      this.estadosProcesos_OTService.srvObtenerListaPorOT(this.ordenesSeleccionadas[i].ot).subscribe(datos_ot => {
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
            EstProcOT_CantProdFacturada : datos_ot[i].estProcOT_CantProdFacturada,
            EstProcOT_CantProdIngresada : datos_ot[i].estProcOT_CantProdIngresada,
            EstProcOT_CantMatPrimaAsignada : datos_ot[i].estProcOT_CantMatPrimaAsignada,
            EstProcOT_CantidadPedida : datos_ot[i].estProcOT_CantidadPedida,
            UndMed_Id : datos_ot[i].undMed_Id,
            Estado_Id : this.estadoModal,
            Falla_Id : datos_ot[i].falla_Id,
            EstProcOT_Observacion : datos_ot[i].estProcOT_Observacion,
            EstProcOT_FechaCreacion : datos_ot[i].estProcOT_FechaCreacion,
            EstProcOT_EmpaqueKg : datos_ot[i].estProcOT_EmpaqueKg,
            Usua_Id : datos_ot[i].usua_Id,
            EstProcOT_FechaFinal : datos_ot[i].estProcOT_FechaFinal,
            EstProcOT_FechaInicio: datos_ot[i].estProcOT_FechaInicio,
            EstProcOT_CantidadPedidaUnd : datos_ot[i].estProcOT_CantidadPedidaUnd,
            EstProcOT_HoraFinal : datos_ot[i].estProcOT_HoraFinal,
            EstProcOT_HoraInicio : datos_ot[i].estProcOT_HoraInicio,
            EstProcOT_DiffDiasInicio_Fin : datos_ot[i].estProcOT_DiffDiasInicio_Fin,
            Cli_Id : datos_ot[i].cli_Id,
            Prod_Id : datos_ot[i].prod_Id,
            EstProcOT_CLiente : datos_ot[i].estProcOT_Cliente,
            EstProcOT_Pedido : datos_ot[i].estProcOT_Pedido,
          }
          this.estadosProcesos_OTService.srvActualizarPorOT(datos_ot[i].estProcOT_OrdenTrabajo, info).subscribe(datos_otActualizada => {
            this.cambiarEstadoOTBagpro();
            this.modalEstadosOT = false;
          });
        }
      });
    }
    setTimeout(() => {
      this.ordenesSeleccionadas = [];
      this.consultarOT();
    }, 2500);
  }

  // Funcion que va a cambiar el estado de las ordenes de trabajo en la base de datos de bagpro
  cambiarEstadoOTBagpro(){
    let estado = this.estadoModal;
    let estadoFinal : any = '';
    if (estado == 18) estadoFinal = '1'; //Cerrada
    if (estado != 18 && estado != 3) estadoFinal = '0'; //Abierta
    if (estado == 3) estadoFinal = '4'; //Anulada
    for (let i = 0; i < this.ordenesSeleccionadas.length; i++) {
      this.servicioBagPro.srvObtenerListaClienteOT_Item(this.ordenesSeleccionadas[i].ot).subscribe(datos_ot => {
        for (let i = 0; i < datos_ot.length; i++) {
          const data : any = {
            item : this.ordenesSeleccionadas[i].ot,
            clienteNom : datos_ot[i].clienteNom,
            clienteItemsNom : datos_ot[i].clienteItemsNom,
            usrCrea : datos_ot[i].usrCrea,
            estado : estadoFinal,
          }
          this.servicioBagPro.srvActualizar(this.ordenesSeleccionadas[i].ot, data, estadoFinal).subscribe(datos_clientesOT => {
            this.mensajeConfirmacion(`¡Orden de Trabajo Actualizada!`,`¡Se ha actualizado el estado de la Orden de Trabajo!`);
          });
        }
      });
    }
  }

  // cierra el modal de cambio de estado de ordenes de trabajo
  hideDialog = () => this.modalEstadosOT = false;

  // Funcion que devolverá un mensaje de satisfactorio
  mensajeConfirmacion = (titulo : string, mensaje : any) => this.messageService.add({severity:'success', summary: titulo, detail: mensaje, life: 2000});

  // Funcion que va a devolver un mensaje de error
  mensajeError = (titulo : string, mensaje : any) => this.messageService.add({severity:'error', summary: titulo, detail: mensaje, life: 5000});

  // Funcion que va a devolver un mensaje de advertencia
  mensajeAdvertencia = (titulo : string, mensaje : any) => this.messageService.add({severity:'warn', summary: titulo, detail: mensaje, life : 2000});

  // Función que mostrará la descripción de cada una de las card de los dashboard's
  mostrarDescripcion($event, color : string){
    if (color == 'amarillo') this.infoColor = `Este color indica que la OT <b>${'ya inició su producción.'}</b>`;
    if (color == 'naranja') this.infoColor = `Este color muestra que la OT está <b>${'ABIERTA'}</b>, es decir, <b>${'no tiene asignaciones y por ende no ha iniciado su producción'}</b>`;
    if (color == 'verde') this.infoColor = `Este color indica que la OT está <b>${'TERMINADA'}</b>, osea que <b>${'su producción ya alcanzó la cantidad pedida.'}</b>`;
    if (color == 'azul') this.infoColor = `Este color muestra que la OT está <b>${'ASIGNADA'}</b>, debido a que, <b>${'ya se realizaron asignaciones de materia prima pero no ha iniciado su producción.'}</b>`;
    if (color == 'rojo') this.infoColor = `Este color indica que la OT está <b>${'ANULADA, y que no puede seguir siendo producida en la planta.'}</b>`;
    if (color == 'verde2') this.infoColor = `Este color muestra que la OT está <b>${'CERRADA'}</b>, es decir, <b>${'ya se finalizó su producción y se cerró'}</b> para que no continue siendo pesada en la planta.</b>`;
    if (color == 'gris') this.infoColor = `Este color indica que la producción de la OT <b>${'no pasa por dicha área o no ha llegado aún al proceso que contiene este color.'}</b>`;

    setTimeout(() => {
      this.op!.toggle($event);
      $event.stopPropagation();
    }, 500);
  }

}
