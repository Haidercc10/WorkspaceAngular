import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Workbook } from 'exceljs';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { modelControlCalidad_Extrusion } from 'src/app/Modelo/modelControlCalidad';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { ControlCalidad_ExtrusionService } from 'src/app/Servicios/ControlCalidad_Extrusion/ControlCalidad_Extrusion.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { PigmentoProductoService } from 'src/app/Servicios/PigmentosProductos/pigmentoProducto.service';
import { AppComponent } from 'src/app/app.component';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import * as fs from 'file-saver';

@Injectable({ 
  providedIn: 'root'
})

@Component({
  selector: 'app-ControlCalidad_Extrusion',
  templateUrl: './ControlCalidad_Extrusion.component.html',
  styleUrls: ['./ControlCalidad_Extrusion.component.css']
})
export class ControlCalidad_ExtrusionComponent implements OnInit {
  
  load : boolean = false;
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  
  FormFiltros !: FormGroup; /** Formulario que contendrá los filtros de búsqueda */
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  hora : any = moment().format('HH:mm:ss'); //Variable que se usará para llenar la hora actual

  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente

  public registros : any = []; //Array que va a contener los registros de los controles de sellado
  eleccion : any = ["Si", "No"]; //Array que va a contener los registros de los controles de sellado
  tiposBobinas : any = ["TUBULAR", "LÁMINA"]; //Array que va a contener los registros de los controles de sellado
  apariencias : any = ["OK", "MAL ESTADO"]; //Array que va a contener las apariencias de el/los rollos verificados
  pigmentos : any = []; //Array que va a contener los registros de los pigmentos de los productos
  registroSeleccionado : any = []; //Array que va a contener el registro seleccionado de la tabla.
  ronda : number = 0; //Variable que se usará para almacenar la ronda del controles de sellado
  turnos : any = ["DIA", "NOCHE"]; //Array que va a contener los registros de los turnos
  registroClonado : any = {}; //Variable que clonará un objeto cuando se desee editar y lo quitará si se cancela la edición 
  habilitarCampos : boolean = false; //Variable que se usará para habilitar o deshabilitar los campos de la vista
  @ViewChild('dtExtrusion') dtExtrusion: Table | undefined;
  rangoFechas : any = []; //Variable que va a contener los rangos de fechas de los controles de extrusion
  rondas : any = [1, 2, 3]; //Variable que va a contener las rondas de los controles de extrusion
  maquinas : any = []; 

  constructor(private AppComponent : AppComponent, 
                private srvBagpro : BagproService, 
                  private msjs : MensajesAplicacionService, 
                    private srvPigmentos : PigmentoProductoService, 
                      private srvCcExtrusion : ControlCalidad_ExtrusionService, 
                        private msg : MessageService) { 
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.lecturaStorage(); 
    this.cargarPigmentos();
    this.mostrarRegistrosHoy();
    this.exportarExcel();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  //Función que consultará todos los Pigmentos
  cargarPigmentos = () => this.srvPigmentos.srvObtenerLista().subscribe(data => this.pigmentos = data); 

  //Función que consultará las OT con rondas el día de hoy
  mostrarRegistrosHoy() {
    this.registros = [];
    this.load = true;
    let fechaInicio : any = this.rangoFechas[0] == null || this.rangoFechas[0].length == 0 ? this.today : moment(this.rangoFechas[0]).format('YYYY-MM-DD');
    let fechaFin : any = this.rangoFechas[1] == null || this.rangoFechas[1].length == 0 ? fechaInicio : moment(this.rangoFechas[1]).format('YYYY-MM-DD');
    
    this.srvCcExtrusion.Get_TodoHoy(fechaInicio, fechaFin).subscribe(data => {
      if(data.length > 0) data.forEach(res => this.cargarRegistrosCCExtrusion(res));
    }, null, () => this.load = false);
  }

  //Función que cargará los registros de las OT a los que se les ha guardado una ronda hoy.
  cargarRegistrosCCExtrusion(datos : any) {
    let pigmento : any = this.pigmentos.filter(pigmento => pigmento.pigmt_Id == datos.pigmento_Id);

    let info : any = {
      Id : datos.ccExt_Id,
      Ronda : datos.ccExt_Ronda,
      Turno : datos.turno_Id,
      OT : datos.ccExt_OT,
      Maquina : datos.ccExt_Maquina,
      Cliente : datos.ccExt_Cliente,
      Item : datos.prod_Id,
      Referencia : datos.referencia,
      Rollo : datos.ccExt_Rollo,
      Pigmento : pigmento[0].pigmt_Nombre,
      AnchoTubular : datos.ccExt_AnchoTubular,
      PesoMetro : datos.ccExt_PesoMetro,
      Ancho : datos.ccExt_Ancho,
      CalMin : datos.ccExt_CalibreMin,
      CalMax : datos.ccExt_CalibreMax,
      CalProm : datos.ccExt_CalibreProm,
      Apariencia : datos.ccExt_Apariencia,
      Tratado : datos.ccExt_Tratado,
      Rasgado : datos.ccExt_Rasgado,
      TipoBobina : datos.ccExt_TipoBobina,
      Fecha : datos.ccExt_Fecha.replace('T00:00:00', ''),
      Observacion : datos.ccExt_Observacion,
      CalibreTB : datos.ccExt_CalibreTB,
      Guardado : true,
    }
    this.registros.push(info);
    this.registros.sort((a, b) => a.Ronda - b.Ronda);
    this.registros.sort((a, b) => a.OT - b.OT);
    this.registros.sort((a, b) => a.Fecha.localeCompare(b.Fecha));
  }

  //Función que va a consultar la información de la OT a la que desea agregar una ronda.
  consultarOT(datos : any, indexTabla : number){
    this.load = true;
    this.ronda = 0;
    this.srvBagpro.getOtControlCalidadExtrusion(datos.OT, `EXTRUSION`).subscribe(data => {
      if(data.length > 0){
        data.forEach(dato => {
        if(!this.maquinas.includes(dato.maquina)){
            this.maquinas.push(dato.maquina);
            this.cargarRegistro(data[0], indexTabla);
          }
        }); 
        this.load = false;
        setTimeout(() => document.getElementById(`edit_${indexTabla}`).click(), 100);
      } else { 
        this.load = false;
        this.msjs.mensajeAdvertencia(`Advertencia`, `No se encontraron registros con la OT N° ${datos.OT}`);
      } 
    });
    
  }

  //Función que cargará la fila con los datos de la OT a la que desea agregar una ronda.
  cargarRegistro(data : any, indexTabla : number){
    let pigmento : any = this.pigmentos.filter(pigmento => pigmento.pigmt_Id == data.pigmentoId);
    let info : any = {
      Id : 0,
      Ronda : this.ronda, 
      Turno : `DIA`,
      OT : data.ot,
      Maquina : data.maquina, 
      Cliente : data.cliente,
      Item : data.item,
      Referencia : data.referencia,
      Rollo : data.rollo,
      Pigmento : pigmento[0].pigmt_Nombre,
      AnchoTubular : data.ancho,
      PesoMetro : 0,
      Ancho : data.ancho,
      CalMin : 0,
      CalMax : 0,
      CalProm : 0,
      Apariencia : `No`,
      Tratado : data.tratadoId == `2` ? `No` : `Si`,
      Rasgado : `No`,
      TipoBobina : `TUBULAR`,
      CalibreTB : data.calibre,
      Fecha : this.today,
      Observacion : ``,
    }
    this.registros[indexTabla] = info;
  }

  //Función que agregará una fila vacia a la tabla de registros.
  agregarFila() {
    if(this.registros.length == 0 || this.registros[0] == undefined) {
      this.registros.unshift({});
      setTimeout(() => { this.dtExtrusion.initRowEdit(this.dtExtrusion.value[0]); }, 200); 
    } else if(this.registros[0].Id == undefined) {
      this.msjs.mensajeAdvertencia(`Advertencia`, `No se puede agregar otra fila vacia!`);
    } else {
      this.registros.unshift({});
      setTimeout(() => { this.dtExtrusion.initRowEdit(this.dtExtrusion.value[0]); }, 200); 
    }
  }

  //Función que va a registrar la ronda de la OT a la que desea agregar una ronda.
  registroEdicionRonda(fila : any) {
    let esError : boolean = false;
    let pigmento : any = this.pigmentos.filter(pigmento => pigmento.pigmt_Nombre == fila.Pigmento);
    this.load = true;
    this.onReject(`eleccion`);
    console.log(fila)
    let modelo : modelControlCalidad_Extrusion = {
      CcExt_Id: fila.Id > 0 ? fila.Id : 0,
      Turno_Id: fila.Turno,
      Usua_Id: this.storage_Id,
      CcExt_Maquina: fila.Maquina,
      CcExt_Ronda: fila.Ronda,
      CcExt_OT: fila.OT,
      CcExt_Cliente: fila.Cliente,
      Prod_Id: fila.Item,
      Referencia: fila.Referencia,
      CcExt_Rollo: fila.Rollo,
      Pigmento_Id: pigmento[0].pigmt_Id,
      CcExt_AnchoTubular: fila.AnchoTubular,
      CcExt_PesoMetro: fila.PesoMetro,
      CcExt_Ancho: fila.Ancho,
      UndMed_Id: `Cms`,
      CcExt_CalibreMax: fila.CalMax,
      CcExt_CalibreMin: fila.CalMin,
      CcExt_CalibreProm: fila.CalProm,
      CcExt_Apariencia: fila.Apariencia,
      CcExt_Tratado: fila.Tratado,
      CcExt_Rasgado: fila.Rasgado,
      CcExt_TipoBobina: fila.TipoBobina,
      CcExt_Fecha: this.today,
      CcExt_Hora: this.hora,
      CcExt_Observacion: fila.Observacion,
      CcExt_CalibreTB: fila.CalibreTB,
    }

    if(fila.Id > 0) {
      this.srvCcExtrusion.Put(fila.Id ,modelo).subscribe(data => { esError = false; }, error => { esError = true; }); 
        if (esError) this.msjs.mensajeError(`Error`, `No se pudo actualizar la ronda!`);
        else {
          this.msjs.mensajeConfirmacion(`Excelente!`, `Ronda ${fila.Ronda} de la OT N° ${fila.OT} actualizada exitosamente!`);
          setTimeout(() => { 
            this.mostrarRegistrosHoy();
            this.load = false; 
          }, 500); 
        }  
    } else {
      this.srvCcExtrusion.Post(modelo).subscribe(data => { esError = false; }, error => { esError = true; }); 
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

  //Función que se ejecutará cuando se haga click en el botón de Editar
  onRowEditInit = (data : any, indice : number) => this.registroClonado[indice] = {...data};
  
  //Función que validará si la ronda ya existe, si existe se editará, si no se creará
  validarId(data : any){
    data = this.registroSeleccionado;
    this.registroEdicionRonda(data);
  }

  //función que cancela la selección/edición de la fila.
  onRowEditCancel(indice : number) {
    this.registros[indice] = this.registroClonado[indice];
    delete this.registroClonado[indice];
  }
  
   /** Función para mostrar una elección de eliminación de OT/Rollo de la tabla. */
  mostrarEleccion(data : any){
    this.registroSeleccionado = data;
    if(data.Id > 0) this.msg.add({severity:'warn', key:'eleccion', summary:'Elección', detail: `Está seguro que desea actualizar la ronda N° ${data.Ronda} de la OT N° ${data.OT}?`, sticky: true});
    else this.msg.add({severity:'warn', key:'eleccion', summary:'Elección', detail: `Está seguro que desea crear la ronda N° ${data.Ronda} de la OT N° ${data.OT}?`, sticky: true});
  }

  /** Cerrar Dialogo de eliminación*/
  onReject = (dato : any) => this.msg.clear(dato);

  //Quitar registro de la tabla
  quitarRegistro = (index : number) => this.registros.splice(index, 1);

  //Función que se encarga de filtrar la información de la tabla
  aplicarfiltro = ($event, campo : any, valorCampo : string) => this.dtExtrusion!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  exportarExcel(){
    this.load = true;
    let datos : any[] = [];
    let infoDocumento : any = [];
    let title = "CONTROL DE CALIDAD DE EXTRUSIÓN";

    setTimeout(() => {
    const header1 = ["FECHA", "", "", "TURNO", "", "NOMBRE INSPECTOR", ""]
    const header2 = ["MAQUINA", "RONDA", "OT", "CLIENTE", "REFERENCIA", "N° ROLLO", "PIGMENTO", "ANCHO TUBULAR", "PESO METRO (g)", "ANCHO (cm)", "MIN", "MAX", "PROM", "APARIENCIA", "TRATADO", "RASGADO", "TUBULAR", "LAMINA"]
    for (const item of datos) {
      const datos1  : any = [item.Id, item.Nombre, item.Ancho, item.Inicial, item.Entrada, item.Salida, item.Cant, item.Diferencia, item.UndCant, item.PrecioUnd, item.SubTotal, item.Categoria];
      infoDocumento.push(datos1);
    }
    let workbook = new Workbook();
    const imageId1 = workbook.addImage({ base64:  logoParaPdf, extension: 'png', });
    
    let worksheet = workbook.addWorksheet(title);
    worksheet.addImage(imageId1, 'A1:C3');
    let titleRow = worksheet.addRow([]);
    titleRow.font = { name: 'Calibri', family: 4, size: 12, bold: true };
    worksheet.addRow([]);
    worksheet.addRow([]);
    worksheet.addRow([]);
    let headerRow1 = worksheet.addRow(header1);
    headerRow1.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow1.font = { name: 'Calibri', family: 4, size: 10, bold: true };
    headerRow1.height = 20
    headerRow1.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'ffffff' }
      }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    });
    worksheet.addRow([]);
    let headerRow2 = worksheet.addRow(header2);
    headerRow2.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow2.font = { name: 'Calibri', family: 4, size: 10, bold: true };
    headerRow2.height = 60
    headerRow2.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'ffffff' }
      }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    });
    
    worksheet.mergeCells('A1:C3');
    worksheet.mergeCells('D1:P3');
    worksheet.mergeCells('Q1:R1');
    worksheet.mergeCells('Q2:R2');
    worksheet.mergeCells('Q3:R3');
    worksheet.mergeCells('B5:C5');
    worksheet.mergeCells('F5:G5');
    worksheet.mergeCells('H5:R5');
    worksheet.getCell('D1').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('H7').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true  };
    worksheet.getCell('I7').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true  };
    worksheet.getCell('J7').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true  };
    worksheet.getCell('B7').alignment = { textRotation: 90, vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('N7').alignment = { textRotation: 90, vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('O7').alignment = { textRotation: 90, vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('P7').alignment = { textRotation: 90, vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('D1').value = title;
    worksheet.getCell('Q1').value = `Código: FR-AC01`; 
    worksheet.getCell('Q2').value = `Versión: 03`; 
    worksheet.getCell('Q3').value = `Fecha: 30/07/2022`; 
    worksheet.getCell('Q1').font = { name: 'Calibri', family: 4, size: 10 };
    worksheet.getCell('Q2').font = { name: 'Calibri', family: 4, size: 10 };
    worksheet.getCell('Q3').font = { name: 'Calibri', family: 4, size: 10 };
    worksheet.getCell('A1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    worksheet.getCell('D1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    worksheet.getCell('Q1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    worksheet.getCell('Q2').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    worksheet.getCell('Q3').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    worksheet.getCell('H5').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    infoDocumento.forEach(d => {  
      let row = worksheet.addRow(d);
      row.getCell(8).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
      row.getCell(9).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
      row.getCell(10).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
      row.getCell(11).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
      row.getCell(12).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
      row.getCell(13).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
      //let qty= row.getCell(7);
      //let color = 'ADD8E6';
      //qty.fill = {
      //  type: 'pattern',
      //  pattern: 'solid',
      //  fgColor: { argb: color }
      //}
    });
    worksheet.getColumn(1).width = 10;
    worksheet.getColumn(2).width = 5;
    worksheet.getColumn(3).width = 12;
    worksheet.getColumn(4).width = 25;
    worksheet.getColumn(5).width = 30;
    worksheet.getColumn(6).width = 10;
    worksheet.getColumn(7).width = 10;
    worksheet.getColumn(8).width = 10;
    worksheet.getColumn(9).width = 8;
    worksheet.getColumn(10).width = 8;
    worksheet.getColumn(11).width = 7;
    worksheet.getColumn(12).width = 7;
    worksheet.getColumn(13).width = 7;
    worksheet.getColumn(14).width = 5;
    worksheet.getColumn(15).width = 5;
    worksheet.getColumn(16).width = 5;
    worksheet.getColumn(17).width = 12;
    worksheet.getColumn(18).width = 8;
    worksheet.getColumn(19).width = 8;
    setTimeout(() => {
      workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        fs.saveAs(blob, title + `.xlsx`);
      });
      this.load = false;
      this.msjs.mensajeConfirmacion(`¡Información Exportada!`, `¡Se ha creado un archivo de Excel con la información del ` + title + `!`);
    }, 1000);
  }, 1500);
        
  }

  cambiarMaquina(){
    this.srvCcExtrusion.GetRonda(this.maquinas).subscribe(data => {

    }, error => {});
  }
}
