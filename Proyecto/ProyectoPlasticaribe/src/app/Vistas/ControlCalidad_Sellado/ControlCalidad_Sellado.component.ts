import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { Workbook } from 'exceljs';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { modelControlCalidad_Sellado } from 'src/app/Modelo/modelControlCalidad';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { ControlCalidad_SelladoService } from 'src/app/Servicios/ControlCalidad_Sellado/ControlCalidad_Sellado.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { TurnosService } from 'src/app/Servicios/Turnos/Turnos.service';
import { AppComponent } from 'src/app/app.component';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import * as fs from 'file-saver';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-ControlCalidad_Sellado',
  templateUrl: './ControlCalidad_Sellado.component.html',
  styleUrls: ['./ControlCalidad_Sellado.component.css']
})
export class ControlCalidad_SelladoComponent implements OnInit {
  registros : any = []; //.Array que cargará los registros en la tabla
  turnos : any = ["DIA", "NOCHE"]; //.Array que cargará los turnos
  eleccion : any = ["SI", "NO", "OK"]; //.Array que se mostrará en campos de elección
  resistencia : any = ["OK", "NO APLICA", "BAJA", "MEDIA", "ALTA"]; //.Array que cargará la resistencia de sellabilidad de un producto
  load : boolean = false; //.Variable que se usará durante la carga de un proceso que requiera tiempo
  today : any = moment().format('YYYY-MM-DD'); //.Fecha actual
  hora : any = moment().format('HH:mm:ss'); //.Hora actual
  registroSeleccionado : any; //.Objeto que contendrá los datos del registro seleccionado
  ronda : number = 0;  //.Variable que cargará el numero de la ronda de una OT.
  registroClonado : any = {};

  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  @ViewChild('dtSellado') dtSellado: Table | undefined;
  rangoFechas : any = []; //Variable que va a contener los rangos de fechas de los controles de sellado
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro


  constructor(private srvCcSellado : ControlCalidad_SelladoService, 
                  private srvBagpro : BagproService, 
                    private msjs : MensajesAplicacionService, 
                      private msg : MessageService, 
                        private AppComponent : AppComponent) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;                       
                         }

  ngOnInit() {
    this.lecturaStorage();
    this.mostrarRegistrosHoy();
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
    this.exportarExcel();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  //Función que agregará una fila vacia a la tabla de registros.
  agregarFila() {
    if(this.registros.length == 0 || this.registros[0] == undefined) {
      this.registros.unshift({});
      setTimeout(() => { this.dtSellado.initRowEdit(this.dtSellado.value[0]); }, 200); 
    } else if(this.registros[0].Id == undefined) {
      this.msjs.mensajeAdvertencia(`Advertencia`, `No se puede agregar otra fila vacia!`);
    } else {
      this.registros.unshift({});
      setTimeout(() => { this.dtSellado.initRowEdit(this.dtSellado.value[0]); }, 200); 
    }
  }

  //.Función que cargará los registros del día actual
  mostrarRegistrosHoy() {
    this.registros = [];
    this.load = true;
    let fechaInicio : any = this.rangoFechas[0] == null || this.rangoFechas[0].length == 0 ? this.today : moment(this.rangoFechas[0]).format('YYYY-MM-DD');
    let fechaFin : any = this.rangoFechas[1] == null || this.rangoFechas[1].length == 0 ? fechaInicio : moment(this.rangoFechas[1]).format('YYYY-MM-DD');
    
    this.srvCcSellado.GetControlCalidad_SelladoHoy(fechaInicio, fechaFin).subscribe(data => {
      if(data.length > 0) {
        for (let index = 0; index < data.length; index++) {
          this.cargarTabla(data[index]);
        }
      }
      this.load = false;
    });
    
  }

  //. Función que cargará la tabla con los registros del día actual
  cargarTabla(datos : any) {
    let info : any = {
      'Id' : datos.ccSel_Id,
      'Ronda' : datos.ccSel_Ronda,
      'Turno' : datos.turno_Id,
      'OT' : datos.ccSel_OT,
      'Maquina' : datos.ccSel_Maquina,
      'Item' : datos.prod_Id,
      'Referencia' : datos.referencia,
      'Calibre' : datos.ccSel_Calibre,
      'Ancho' : datos.ccSel_Ancho,
      'Largo' : datos.ccSel_Largo, 
      'Af_Izquierdo' : datos.anchoFuelle_Izq,
      'Af_Derecho' : datos.anchoFuelle_Der,
      'Af_Abajo' : datos.anchoFuelle_Abajo,
      'Apariencia' : datos.ccSel_Apariencia,
      'Rasgado' : datos.ccSel_Rasgado,
      'Filtrado' : datos.ccSel_PruebaFiltrado,
      'Presion' : datos.ccSel_PruebaPresion,
      'Sellabilidad' : datos.ccSel_Sellabilidad,
      'Impresion' : datos.ccSel_Impresion,
      'Precorte' : datos.ccSel_Precorte,
      'Perforacion' : datos.ccSel_Perforacion,
      'BolsasxPaq' : datos.ccSel_CantBolsasxPaq,
      'Fecha' : datos.ccSel_Fecha.replace('T00:00:00', ''),
      'Observacion' : datos.ccSel_Observacion,
      'Guardado' : true,
    }
    this.registros.push(info);
    this.registros.sort((a, b) => a.Ronda - b.Ronda);
    this.registros.sort((a, b) => a.OT - b.OT);
    this.registros.sort((a, b) => a.Fecha.localeCompare(b.Fecha));
  }

  //. Consultar la OT que se encuentra en la fila seleccionada
  consultarOT(datos : any, index : number){
    this.load = true;
    this.ronda = 0;
    this.srvCcSellado.GetRonda(datos.OT).subscribe(dato => { this.ronda = dato });
    setTimeout(() => {
      this.ronda += 1
      if(this.ronda > 3) {
        this.msjs.mensajeAdvertencia(`Advertencia`, `Ya completó las rondas permitidas para la OT N° ${datos.OT}!`)
        this.registros.shift();
      } else {
        this.srvBagpro.getOtControlCalidadExtrusion(datos.OT, `SELLADO`).subscribe(data => {
          if(data.length > 0){
            let info : any = {
              'Id' : 0,
              'Ronda' : this.ronda,
              'Turno' : `DIA`,
              'OT' : data[0].ot,
              'Maquina' : parseInt(data[0].maquina.trim()),
              'Item' : data[0].item,
              'Referencia' : data[0].referencia,
              'Calibre' : data[0].calibre,
              'Ancho' : data[0].ancho,
              'Largo' : data[0].largo, 
              'Af_Izquierdo' : 0,
              'Af_Derecho' : 0,
              'Af_Abajo' : 0,
              'Rasgado' : `OK`,
              'Filtrado' : `NO`,
              'Presion' : `NO`,
              'Sellabilidad' :`OK`,
              'Impresion' : data[0].impresion == `0` ? `NO` : `SI`,
              'Precorte' : `NO`,
              'Perforacion' : `NO`,
              'BolsasxPaq' : data[0].cantBolsasxPaq,
              'Fecha' : this.today,
              'Observacion' : ``,
            }
            this.registros[index] = info;
            this.load = false;
            setTimeout(() => { this.dtSellado.initRowEdit(this.dtSellado.value[0]); }, 500); 
          } else {
            this.load = false;
            this.msjs.mensajeAdvertencia(`Advertencia`, `No se encontraron registros de la OT N° ${datos.OT} en el proceso de SELLADO`);
          } 
        });
      }
    }, 200);
  }     

  //.Función que ejecutará una acción dependiendo del id del registro seleccionado
  validarId(dato : any){
    dato = this.registroSeleccionado;
    this.creacionEdicionRonda(dato);
  }

  //Función que guardará los registros del día actual
  creacionEdicionRonda(fila : any) {
    this.load = true;
    let esError : boolean = false;
    this.onReject(`eleccion`);
    let modelo : modelControlCalidad_Sellado = {
      'CcSel_Id' : fila.Id > 0 ? fila.Id : 0,
      'Turno_Id': fila.Turno,
      'Usua_Id': this.storage_Id,
      'CcSel_Maquina': fila.Maquina,
      'CcSel_Ronda': fila.Ronda,
      'CcSel_OT': fila.OT,
      'Prod_Id': fila.Item,
      'Referencia': fila.Referencia,
      'CcSel_Calibre': fila.Calibre,
      'CcSel_Ancho': fila.Ancho,
      'CcSel_Largo': fila.Largo,
      'UndMed_AL': 'Cms',
      'AnchoFuelle_Izq': fila.Af_Izquierdo,
      'AnchoFuelle_Der': fila.Af_Derecho,
      'AnchoFuelle_Abajo': fila.Af_Abajo,
      'UndMed_AF': 'Cms',
      'CcSel_Rasgado': fila.Rasgado,
      'CcSel_PruebaFiltrado': fila.Filtrado,
      'CcSel_PruebaPresion': fila.Presion,
      'CcSel_Sellabilidad': fila.Sellabilidad,
      'CcSel_Impresion': fila.Impresion,
      'CcSel_Precorte': fila.Precorte,
      'CcSel_Perforacion': fila.Perforacion,
      'CcSel_CantBolsasxPaq': fila.BolsasxPaq,
      'CcSel_Fecha': this.today,
      'CcSel_Hora': this.hora,
      'CcSel_Observacion': fila.Observacion
    }

    if(fila.Id > 0) {
      this.srvCcSellado.Put(fila.Id, modelo).subscribe(data => { esError = false; }, error => { esError = true; }); 
      if (esError) this.msjs.mensajeError(`Error`, `No se pudo actualizar la ronda!`);
      else {
        this.msjs.mensajeConfirmacion(`Excelente!`, `Ronda ${fila.Ronda} de la OT N° ${fila.OT} actualizada exitosamente!`);
        setTimeout(() => { 
          this.mostrarRegistrosHoy();
          this.load = false; 
        }, 500); 
      }
    } else {
      this.srvCcSellado.Post(modelo).subscribe(data => { esError = false; }, error => { esError = true; }); 
      if (esError) this.msjs.mensajeError(`Error`, `No se pudo registrar la ronda!`);
      else {
        this.msjs.mensajeConfirmacion(`Excelente!`, `Ronda ${fila.Ronda} de la OT N° ${fila.OT} creada correctamente!`);
        setTimeout(() => { 
          this.mostrarRegistrosHoy();
          this.load = false; 
        }, 500); 
      }
    }
  }  

  //. Función para mostrar una elección de creación o actualización de un registro
  mostrarEleccion(data : any){
    this.registroSeleccionado = data;
    if(data.Id > 0) this.msg.add({severity:'warn', key:'eleccion', summary:'Elección', detail: `Está seguro que desea actualizar la ronda N° ${data.Ronda} de la OT N° ${data.OT}?`, sticky: true});
    else this.msg.add({severity:'warn', key:'eleccion', summary:'Elección', detail: `Está seguro que desea crear la ronda N° ${data.Ronda} de la OT N° ${data.OT}?`, sticky: true});
  }

  //. Función para cerrar el dialogo de elección
  onReject = (dato : any) => this.msg.clear(dato);

  //. Función que clona la fila seleccionada para poder editarla.
  filaEditar(fila : any, index : number) {
    this.registroClonado[index] = {...fila};
  } 
  
  // Función que cancela la edición de la fila.
  filaCancelar(fila : any, index : number) {
    this.registros[index] = this.registroClonado[index];
    delete this.registroClonado[index];
  }

  //Función que se encarga de filtrar la información de la tabla
  aplicarfiltro = ($event, campo : any, valorCampo : string) => this.dtSellado!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  //.Quitar registro de la tabla
  quitarRegistro = (index : number) => this.registros.splice(index, 1);

  exportarExcel(){
    //if(this.registros.length > 0) {
      this.load = true;
      let nombreArchivo : string = `FR-AC04 Control de calidad de Sellado`;
      let workbook : any = new Workbook();
      this.encabezadoLibro(workbook);
      this.generacionExcel(workbook, nombreArchivo);
    //} else this.msjs.mensajeAdvertencia(`Advertencia`, `No hay registros para exportar!`);
  }

  encabezadoLibro(workbook : any){
    let fila1 : string [] = ['A1', 'D1', 'Q1', 'Q2', 'Q3'];
    let textoFila1 : any = ['', 'CONTROL DE CALIDAD DE SELLADO', 'Código: FR-AC04', 'Versión: 01', 'Fecha: 30/07/2022']
    let combinarCeldas : string [] = ['A1:C3', 'D1:P3', 'Q1:R1'];
    let worksheet : any = workbook.addWorksheet(`Hoja`, { pageSetup : { paperSize: 119,  orientation:'landscape'} });
    const imageId = workbook.addImage({ base64: logoParaPdf, extension: 'png', });
    
    worksheet.addImage(imageId, { tl: { col: 0.1, row: 0.45 }, ext: { width: 150, height: 40 }, editAs: 'oneCell' });
    combinarCeldas.forEach(cell => worksheet.mergeCells(cell));
    fila1.forEach(f1 => worksheet.getCell(f1).border =  { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } });
    
  }

  generacionExcel(workbook : any, nombreDoc : any ){
    setTimeout(() => {
      workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        fs.saveAs(blob, nombreDoc + ` - ` + this.today + `.xlsx`);
      });
      this.load = false;
      this.msjs.mensajeConfirmacion(`¡Información Exportada!`, `¡Se ha creado un archivo de Excel con la información!`);
    }, 400);
  }
}

