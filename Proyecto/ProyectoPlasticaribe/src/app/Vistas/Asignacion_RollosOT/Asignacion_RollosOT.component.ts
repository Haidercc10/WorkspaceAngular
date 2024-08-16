import { Component, OnInit, ViewChild } from '@angular/core';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { log } from 'console';
import moment from 'moment';
import { Table } from 'primeng/table';
import { AppComponent } from 'src/app/app.component';
import { Asignacion_RollosOT } from 'src/app/Modelo/Asignacion_RollosOT';
import { Detalles_AsignacionRollosOT } from 'src/app/Modelo/Detalles_AsignacionRollosOT';
import { Asignacion_RollosOTService } from 'src/app/Servicios/Asignacion_RollosOT/Asignacion_RollosOT.service';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { Detalle_BodegaRollosService } from 'src/app/Servicios/Detalle_BodegaRollos/Detalle_BodegaRollos.service';
import { Detalles_AsignacionRollosOTService } from 'src/app/Servicios/Detalles_AsignacionRollosOT/Detalles_AsignacionRollosOT.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';

@Component({
  selector: 'app-Asignacion_RollosOT',
  templateUrl: './Asignacion_RollosOT.component.html',
  styleUrls: ['./Asignacion_RollosOT.component.css']
})
export class Asignacion_RollosOTComponent implements OnInit {

  load : boolean = false; //Variable para validar que salga o no la imagen de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  form !: FormGroup;
  process : any [] = [];
  //*Arrays para guardar los datos de las tablas
  rollsAvailables : any [] = [];
  rollsSelected : any [] = [];
  rollsConsolidate : any [] = [];
  //*Tablas
  @ViewChild('dt1') dt1 : Table | undefined; 
  @ViewChild('dt2') dt2 : Table | undefined; 
  @ViewChild('dt3') dt3 : Table | undefined; 

  constructor(private AppComponent : AppComponent, 
    private svProcess : ProcesosService,
    private svMsjs : MensajesAplicacionService,
    private frmBuilder : FormBuilder,
    private svDetailsStoreRolls : Detalle_BodegaRollosService,
    private svPDF : CreacionPdfService,
    private svAssignRolls : Asignacion_RollosOTService,
    private svDtlAsignRolls : Detalles_AsignacionRollosOTService,
  ) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.initForm();
   }

  ngOnInit() {
    this.lecturaStorage();
    this.getProcess();
  }

  //* Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number : any) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  //*Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  //*
  initForm(){
    this.form = this.frmBuilder.group({
      process: [null, Validators.required],
      ot : [null, Validators.required],
      observation : [null],
    });
  }

  //*Función para obtener las areas
  getProcess(){
    this.svProcess.srvObtenerLista().subscribe(data => {
      switch (this.ValidarRol) {
        case 86:
            this.process = data.filter(x => ['SELLA'].includes(x.proceso_Id)); 
            break;
        case 4:  
            this.process = data.filter(x => ['IMP'].includes(x.proceso_Id)); 
            break;
        case 89:
            this.process = data.filter(x => ['ROT'].includes(x.proceso_Id));  
            break;    
        default: 
            this.process = data;
          break;
      }
    });
  }

  //*
  getRollsForOT(){
    console.log(this.form);
    if (this.form.valid) {
      let ot : number = this.form.value.ot;
      let store : string = this.form.value.process;
      let url : string = store != null ? `?bodegaIngreso=${store}` : '';

      this.load = true;
      this.rollsAvailables = [];
      this.rollsSelected = [];
      this.rollsConsolidate = [];

      this.svDetailsStoreRolls.GetRollosDisponibles(store, ot, 19, url).subscribe(data => { 
        this.rollsAvailables = data;
        this.load = false; 
      }, err => {
        this.msjs(`Error`, `No se encontraron rollos disponibles de la OT N° ${ot} | ${err.status} ${err.statusText}`);
        this.load = false;
      });
    } else this.msjs(`Advertencia`, `Debe llenar los campos requeridos`);
  }

  loadRollsTable(){}

  //*
  clearForm(){
    this.load = false;
    this.form.patchValue({ ot: null, observation: null, });
  }

  //*
  clearAll(){
    this.clearForm();
    this.rollsAvailables = [];
    this.rollsSelected = [];
    this.rollsConsolidate = [];
  }

  //* 
  selectAll(){
    this.load = true;
    this.rollsSelected = this.rollsSelected.concat(this.rollsAvailables);
    this.rollsAvailables = [];  
    this.rollsSelected.sort((a,b) => Number(a.rollo) - Number(b.rollo) );
    this.groupRolls();
    setTimeout(() => { this.load = false; }, 5);
  }

  //* 
  selectOne(row : any){
    this.load = true;
    this.rollsAvailables.splice(this.rollsAvailables.findIndex((data) => data.rollo == row.rollo), 1);
    this.rollsSelected.sort((a,b) => Number(a.rollo) - Number(b.rollo) );
    this.groupRolls();
    setTimeout(() => { this.load = false; }, 5);
  }

  //*
  deselectAll(){
    this.load = true;
    this.rollsAvailables = this.rollsAvailables.concat(this.rollsSelected);
    this.rollsSelected = [];  
    this.rollsAvailables.sort((a,b) => Number(a.rollo) - Number(b.rollo) );
    this.groupRolls();
    setTimeout(() => { this.load = false; }, 5);
  }

  //*
  deselectOne(data : any){
    this.load = true;
   
    this.rollsSelected.splice(this.rollsSelected.findIndex((row) => row.rollo == data.rollo), 1);
    this.rollsAvailables.sort((a, b) => Number(a.rollo) - Number(b.rollo));
    this.groupRolls();
    setTimeout(() => { this.load = false; }, 5);
  }

  //*
  groupRolls(){
    this.rollsConsolidate = this.rollsSelected.reduce((a, b) => {
      if(!a.map(x => x.ot).includes(b.ot)) a = [...a, b];
      console.log(a);
      return a;
    }, []);
  }

  //*
  PostHeaderAssign(){
    if(this.rollsSelected.length > 0)
    this.load = true;
    let info : Asignacion_RollosOT = {
      AsgRll_Fecha: moment().format('YYYY-MM-DD'),
      AsgRll_Hora: moment().format('YYYY-MM-DD'),
      AsgRll_Observacion: this.form.value.observation,
      Usua_Id: this.storage_Id,
    }
    console.log(info);
    
    this.svAssignRolls.Post(info).subscribe(data => { this.PostDetailsAssign(data.asgRll_Id) }, error => {
      this.msjs(`Error`, `Error al crear el encabezado de la asignación de los rollos | ${error.status} ${error.statusText}`);
    });
  }

  //*
  PostDetailsAssign(id : number){
    let count : number = 0;
    let process : any = this.form.value.process;
    this.rollsSelected.forEach(rs => {
      let info : Detalles_AsignacionRollosOT = {
        'AsgRll_Id': id,
        'DtAsgRll_OT': rs.ot,
        'Prod_Id': rs.item,
        'Rollo_Id': rs.rollo,
        'DtAsgRll_Cantidad': rs.cantidad,
        'UndMed_Id': 'Kg',
        'Proceso_Id': process
      }
      this.svDtlAsignRolls.Post(info).subscribe(data => {
        count++;
        if(count == this.rollsSelected.length) this.updateStoreRolls(id); 
      }, error => {
        this.msjs(`Error`, `Error al asignar los rollos | ${error.status} ${error.statusText}`);
       });
    });
  }

  updateStoreRolls(idAssign : number){
    console.log(idAssign);
    
    let rolls : any = []; 
    let process : any = this.form.value.process;

    this.rollsSelected.forEach(x => rolls.push({ 'Rollo' : x.rollo,  'OT' : x.ot, 'Ubicacion' : x.ubicacion}));
    this.svDetailsStoreRolls.putRollsStore(23, process, rolls).subscribe(data => {
      this.load = false;
      //this.createPDF(idAssign, `creada`);
    }, error => { this.msjs(`Error`, `Ha ocurrido un error al actualizar la bodega de rollos | ${error.status} ${error.statusText}`); });
  }

  //*
  applyFilter = ($event, campo : any, datos : Table) => datos!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  //*
  qtyTotalConsolidateForOrder  = (ot : number) => this.rollsSelected.filter(x => x.ot == ot).reduce((a, b) => a += b.cantidad, 0);

  //*
  qtyRollsConsolidateForOrder = (ot : number) => this.rollsSelected.filter(x => x.ot == ot).length;

  //*
  qtyTotalRolls = () => this.rollsSelected.length;

  //*
  qtyTotal = () =>  this.rollsSelected.reduce((a, b) => a += b.cantidad, 0);

  //*
  msjs(msj1 : string, msj2 : string){
    this.load = false;

    switch (msj1) {
      case 'Confirmación' :
        return this.svMsjs.mensajeConfirmacion(msj1, msj2);
      case 'Advertencia' : 
        return this.svMsjs.mensajeAdvertencia(msj1, msj2);
      case 'Error' : 
        return this.svMsjs.mensajeError(msj1, msj2);
      default :
        return this.svMsjs.mensajeAdvertencia(`No hay un tipo de mensaje asociado!`); 
    }
  }

  //*
  createPDF(id : number, action : string) {
    this.svDtlAsignRolls.getId(id).subscribe(data => {
      let title: string = `Solicitud de rollos N° ${id}`;
      let content: any[] = this.contentPDF(data);
      this.svPDF.formatoPDF(title, content);
      this.msjs(`Confirmación`, `Asignación de Rollo a Orden de Trabajo ${action} exitosamente!`);
      setTimeout(() => this.clearAll(), 3000);
    }, error => this.msjs(`Error`, `Error al consultar la asignación de rollos N° ${id} | ${error.status} ${error.statusText}`));
  }

  //*
  contentPDF(data): any[] {
    let content: any[] = [];
    let infoGrouped : Array<any> = this.getAssignPDF(data);
    let infoDetails : Array<any> = this.getDetailsAssignPDF(data);
    content.push(this.infoMovementPDF(data[0]));
    content.push(this.tableConsolidatePDF(infoGrouped));
    content.push(this.tableDetailsPDF(infoGrouped))
    content.push(this.tableTotalsPDF(infoDetails));
    return content;
  }

  //Función que muestra una tabla con la información general del ingreso.
  infoMovementPDF(data : any): {} {
    return {
      margin : [0, 0, 0, 20],
      table: {
        widths: ['34%', '33%', '33%'],
        body: [
          [
            { text: `Información general del movimiento`, colSpan: 3, alignment: 'center', fontSize: 10, bold: true }, {}, {}
          ],
          [
            { text: `Usuario registro: ${data.user}` },
            { text: `Fecha registro: ${data.date.replace('T00:00:00', '')}` },
            { text: `Hora registro: ${data.hour}` },
          ],
          [
            { text: `Observación: ${data.observation}`, colSpan: 3, fontSize: 9, }, {}, {}
          ], 
        ]
      },
      fontSize: 9,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex == 0) ? '#DDDDDD' : null;
        }
      }
    }
  }

  //*
  getAssignPDF(data: any): Array<any> {
    let info: Array<any> = [];
    let contador: number = 0;
    data.forEach(d => {
      if (!info.map(x => x.OT).includes(d.orden_Trabajo)) {
        contador++;
        let cantRegistros : number = data.filter(x => x.orden_Trabajo == d.orden_Trabajo).length;
        let pesoTotal: number = 0;
        data.filter(x => x.orden_Trabajo == d.orden_Trabajo).forEach(x => pesoTotal += x.cantidad);
        info.push({
          "#": contador,
          "OT": d.orden_Trabajo,
          "Item": d.item,
          "Referencia": d.referencia,
          "Rollos" : cantRegistros,
          "Peso": this.formatonumeros((pesoTotal).toFixed(2)),
          "Peso2": pesoTotal,
          "Presentación" : d.presentacion,
        });
      }
    });
    return info;
  }

  //*
  getDetailsAssignPDF(data: any): Array<any> {
    let info: Array<any> = [];
    let count: number = 0;

    data.forEach(d => {
      count++;
      info.push({
        "#": count,
        "Rollo": d.rollo,
        "OT": d.orden_Trabajo,
        "Item": d.item,
        "Referencia": d.referencia,
        "Peso": d.cantidad.toFixed(2),
        "Und" : d.presentacion,
        "Solicita" : d.bodega_Solicitante == 'Producto Intermedio' ? 'P. Intermedio' : d.bodega_Solicitante,
        "Entrega" : d.bodega_Solicitada == 'Producto Intermedio' ? 'P. Intermedio' : d.bodega_Solicitada,
      });
    });
    info.sort((a, b) => a.OT - b.OT);
    return info;
  }

  //Función que consolida la información por mat. primas
  tableConsolidatePDF(data) {
    let columns: Array<string> = ['#', 'OT', 'Item', 'Referencia', 'Rollos', 'Peso', 'Presentación'];
    let widths: Array<string> = ['5%', '10%', '10%', '45%', '10%', '10%', '10%'];
    return {
      table: {
        headerRows: 2,
        widths: widths,
        body: this.buildTableBody1(data, columns, 'Consolidado de rollos de la solicitud'),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex <= 1) ? '#DDDDDD' : null;
        }
      }
    };
  }

  //Tabla con materiales recuperados ingresados detallados
  tableDetailsPDF(data) {
    let columns: Array<string> = ['#', 'Rollo', 'Bodega', 'OT', 'Item', 'Referencia', 'Peso', 'Und'];
    let widths: Array<string> = ['4%', '8%', '10%', '10%', '8%', '8%', '40%', '8%', '4%'];
    return {
      margin: [0, 20],
      table: {
        headerRows: 2,
        widths: widths,
        body: this.buildTableBody2(data, columns, 'Información detallada de los rollos solicitados'),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex <= 1) ? '#DDDDDD' : null;
        }
      }
    };
  }

  //Tabla con los valores totales de pesos y registros
  tableTotalsPDF(data : any){
    return {
      fontSize: 8,
      bold: false,
      table: {
        widths: ['5%', '10%', '10%', '45%', '10%', '10%', '10%'],
        body: [
          [
            { text: ``, bold : true, border: [true, false, false, true], },
            { text: ``, bold : true, border: [false, false, false, true], },
            { text: ``, bold : true, border: [false, false, false, true], },
            { text: `Totales`, alignment: 'right', bold : true, border: [false, false, true, true], },
            { text: `${this.formatonumeros(0)}`, bold : true, border: [false, false, true, true], },
            { text: `${this.formatonumeros(0)}`, bold : true, border: [false, false, true, true], },
            { text: `Kg`, bold : true, border: [false, false, true, true], },
          ],
        ],
      }
    }
  }

  //*
  buildTableBody1(data, columns, title) {
    var body = [];
    body.push([{ colSpan: 7, text: title, bold: true, alignment: 'center', fontSize: 10 }, '', '', '', '', '', '']);
    body.push(columns);
    data.forEach(function (row) {
      var dataRow = [];
      columns.forEach((column) => dataRow.push(row[column].toString()));
      body.push(dataRow);
    });
    return body;
  }

  //*
  buildTableBody2(data, columns, title) {
    var body = [];
    body.push([{ colSpan: 8, text: title, bold: true, alignment: 'center', fontSize: 10 }, '', '', '', '', '', '', '']);
    body.push(columns);
    data.forEach(function (row) {
      var dataRow = [];
      columns.forEach((column) => dataRow.push(row[column].toString()));
      body.push(dataRow);
    });
    return body;
  }
}
