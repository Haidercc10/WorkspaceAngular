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
import { CreacionExcelService } from 'src/app/Servicios/CreacionExcel/CreacionExcel.service';
import { ReporteProduccionComponent } from '../Reporte-Produccion/Reporte-Produccion.component';

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
  eleccion : any = ["PASA", "NO PASA", "NO APLICA"]; //Array que va a contener los registros de los controles de sellado
  eleccion2 : any = ["SI", "NO"]; //Array que va a contener los registros de los controles de sellado
  tiposBobinas : any = ["TUBULAR", "LAMINA", 'NO APLICA']; //Array que va a contener los registros de los controles de sellado
  apariencias : any = ["PASA", "NO PASA", "ACEPTABLE"]; //Array que va a contener las apariencias de el/los rollos verificados
  pigmentos : any = []; //Array que va a contener los registros de los pigmentos de los productos
  registroSeleccionado : any = []; //Array que va a contener el registro seleccionado de la tabla.
  ronda : number = 0; //Variable que se usará para almacenar la ronda del controles de sellado
  //turnos : any = ["DIA", "NOCHE"]; //Array que va a contener los registros de los turnos
  registroClonado : any = {}; //Variable que clonará un objeto cuando se desee editar y lo quitará si se cancela la edición 
  habilitarCampos : boolean = false; //Variable que se usará para habilitar o deshabilitar los campos de la vista
  @ViewChild('dtExtrusion') dtExtrusion: Table | undefined;
  rangoFechas : any = []; //Variable que va a contener los rangos de fechas de los controles de extrusion
  rondas : any = [1, 2, 3, 4, 5]; //Variable que va a contener las rondas de los controles de extrusion
  maquinas : any = []; //Variable que guardará las maquinas desde las que se pesó una OT.
  sidesRoll : any = ["A", "B"];
  turn : any = [];
  productionReport : boolean = false;
  productionMachines : any = [];
  @ViewChild(ReporteProduccionComponent) cmpProduction : ReporteProduccionComponent;

  constructor(private AppComponent : AppComponent, 
                private srvBagpro : BagproService, 
                  private msjs : MensajesAplicacionService, 
                    private srvPigmentos : PigmentoProductoService, 
                      private srvCcExtrusion : ControlCalidad_ExtrusionService, 
                        private msg : MessageService, 
                          private svExcel : CreacionExcelService,) { 
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.rangoFechas = [new Date(moment().add(1, 'd').format('YYYY-MM-DD')), new Date(moment().add(1, 'd').format('YYYY-MM-DD'))]
  }

  ngOnInit() {
    
    this.lecturaStorage(); 
    this.cargarPigmentos();
    setTimeout(() => {
      this.mostrarRegistrosHoy();
    }, 500); 
    this.getCurrentTurn(); 
    //this.exportExcel();
    //this.generarFormatoExcel();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  getCurrentTurn() {
    this.srvBagpro.GetHorarioProceso('EXTRUSION').subscribe(turn => { this.turn = turn.toString(); }, error => { this.msjs.mensajeError(`Error`, `Errores encontrados al consultar los turnos.`) });
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
      'Id' : datos.ccExt_Id,
      'Ronda' : datos.ccExt_Ronda,
      'OT' : datos.ccExt_OT,
      'Maquina' : datos.ccExt_Maquina,
      'Cliente' : datos.ccExt_Cliente,
      'Item' : datos.prod_Id,
      'Referencia' : datos.referencia,
      'Rollo' : datos.ccExt_Rollo,
      'Pigmento' : pigmento[0].pigmt_Nombre,
      'AnchoTubular' : datos.ccExt_AnchoTubular,
      'PesoMetro' : datos.ccExt_PesoMetro,
      'Ancho' : datos.ccExt_Ancho,
      'CalMin' : datos.ccExt_CalibreMin,
      'CalMax' : datos.ccExt_CalibreMax,
      'CalProm' : datos.ccExt_CalibreProm,
      'Apariencia' : datos.ccExt_Apariencia,
      'Tratado' : datos.ccExt_Tratado,
      'Rasgado' : datos.ccExt_Rasgado,
      'TipoBobina' : datos.ccExt_TipoBobina,
      'Fecha' : datos.ccExt_Fecha.replace('T00:00:00', ''),
      'Hora' : datos.ccExt_Hora,
      'Observacion' : datos.ccExt_Observacion,
      'CalibreTB' : datos.ccExt_CalibreTB,
      'Guardado' : true,
      //Nuevos campos
      'AlDardo' : datos.ccExt_AlDardo,
      'Geles' : datos.ccExt_Geles,
      'Quemado' : datos.ccExt_Quemado,
      'Brillo' : datos.ccExt_Brillo,
      'Cal1' : datos.ccExt_Calibre1,
      'Cal2' : datos.ccExt_Calibre2,
      'Cal3' : datos.ccExt_Calibre3,
      'Cal4' : datos.ccExt_Calibre4,
      'Cal5' : datos.ccExt_Calibre5,
      'Cal6' : datos.ccExt_Calibre6,
      'Cal7' : datos.ccExt_Calibre7,
      'Cal8' : datos.ccExt_Calibre8,
      'Cal9' : datos.ccExt_Calibre9,
      'Cal10' : datos.ccExt_Calibre10,
      'Cal11' : datos.ccExt_Calibre11,
      'Cal12' : datos.ccExt_Calibre12,
      'Cal13' : datos.ccExt_Calibre13,
      'Cal14' : datos.ccExt_Calibre14,
      'Cal15' : datos.ccExt_Calibre15,
      'Cal16' : datos.ccExt_Calibre16,
      'Desviacion' : datos.ccExt_Desviacion,
      'Moda' : datos.ccExt_Moda,
    }
    this.registros.push(info);
    this.registros.sort((a, b) => a.Ronda - b.Ronda);
    this.registros.sort((a, b) => a.OT - b.OT);
    this.registros.sort((a, b) => a.Fecha.localeCompare(b.Fecha));
  }

  //Función que va a consultar la información de la OT a la que desea agregar una ronda.
  consultarOT(datos : any, indexTabla : number){
    this.maquinas =[];
    this.load = true;
    this.ronda = 0;
    this.srvBagpro.getOtControlCalidadExtrusion(datos.OT, `EXTRUSION`).subscribe(data => {
      if(data.length > 0){
        data[0].maquina.forEach(dato => {
          if(!this.maquinas.includes(dato)){
            this.maquinas.push(dato);
          }
        });
        this.cargarRegistro(data[0], indexTabla);
        this.load = false;
        setTimeout(() => document.getElementById(`edit_${indexTabla}`).click(), 100);
      } else { 
        this.load = false;
        this.msjs.mensajeAdvertencia(`Advertencia`, `No se encontraron registros con la OT N° ${datos.OT}`);
      } 
    });
  }

  //Validar ronda actual. 
  validateRound(data : any, index : number){
    let round : number = 0;
    round = this.registros.filter(x => x.Maquina == data.maquina[0]).length;
    this.registros[index].Ronda = data.maquina.length == 0 ? round = round : round = (round + 1);
    return round;
  }

  validateRoundInput(data : any, index : number){
    let round : number = 0;
    round = this.registros.filter(x => x.Maquina == data.Maquina).length;
    this.registros[index].Ronda = round;
    console.log(this.registros[index].Ronda);
    
    return round;
  }

  calculateAverage(index : number){
    let caliber : number = 0; 
    let cal1 : number = this.registros[index].Cal1; 
    let cal2 : number = this.registros[index].Cal2; 
    let cal3 : number = this.registros[index].Cal3; 
    let cal4 : number = this.registros[index].Cal4; 
    caliber = (cal1 + cal2 + cal3 + cal4) / 4;
    this.registros[index].CalProm = caliber;
    return caliber;
  }

  calculateModa(index : number) {
    let moda : number = 0;
    let caliber : number = this.registros[index].CalibreTB;
    let numeros : any = [
      this.registros[index].Cal1, 
      this.registros[index].Cal2,
      this.registros[index].Cal3,
      this.registros[index].Cal4,
    ];
    const frecuencia = {};

    // Contar cuántas veces aparece cada número
    for (let num of numeros) {
      frecuencia[num] = (frecuencia[num] || 0) + 1;
    }

    // Encontrar la mayor frecuencia
    let maxFrecuencia = 0;
    let modas = [];

    for (let num in frecuencia) {
      if (frecuencia[num] > maxFrecuencia) {
        maxFrecuencia = frecuencia[num];
        modas = [Number(num)];
      } else if (frecuencia[num] === maxFrecuencia) {
        modas.push(Number(num));
      }
    }

    // Si todos los números tienen la misma frecuencia → no hay moda
    const todasIguales = Object.values(frecuencia).every(f => f === maxFrecuencia);
    if (todasIguales) return null;

    moda = modas.length === 1 ? modas[0] : modas.includes(caliber) ? caliber : modas[0];
    this.registros[index].Moda = moda;
    console.log(moda);
    return moda; // Puede haber más de una moda
  }

  calculateDesv(index : number){
    let desviation : number = 0;
    let cal1 : number = Math.pow((this.registros[index].Cal1 - this.calculateAverage(index)), 2); 
    let cal2 : number = Math.pow((this.registros[index].Cal2 - this.calculateAverage(index)), 2);  
    let cal3 : number = Math.pow((this.registros[index].Cal3 - this.calculateAverage(index)), 2);  
    let cal4 : number = Math.pow((this.registros[index].Cal4 - this.calculateAverage(index)), 2);   

    desviation = (cal1 + cal2 + cal3 + cal4) / 4;
    desviation = Math.sqrt(desviation);
    this.registros[index].Desviacion = desviation;
    return desviation;
  }

  //Función que cargará la fila con los datos de la OT a la que desea agregar una ronda.
  cargarRegistro(data : any, indexTabla : number){
    let pigmento : any = this.pigmentos.filter(pigmento => pigmento.pigmt_Id == data.pigmentoId);
    let info : any = {
      'Id' : 0,
      'Ronda' : this.validateRound(data, indexTabla),
      'OT' : data.ot,
      'Maquina' : data.maquina[0], 
      'Cliente' : data.cliente,
      'Item' : data.item,
      'Referencia' : data.referencia,
      'Rollo' : 'A',
      'Pigmento' : pigmento[0].pigmt_Nombre,
      'AnchoTubular' : data.anchoFuelle_Derecha,
      'PesoMetro' : 0,
      'Ancho' : data.anchoFuelle_Derecha,
      'CalMin' : data.calibre - ((data.calibre * 5) / 100),
      'CalMax' : data.calibre + ((data.calibre * 5) / 100),
      'CalProm' : data.calibre,
      'Apariencia' : `PASA`,
      'Tratado' : ['1','2','0',null].includes(data.tratadoId) ? `NO APLICA` : `PASA`,
      'Rasgado' : `PASA`,
      'TipoBobina' : data.formato.startsWith('T') ? 'TUBULAR' : data.formato.startsWith('L') ? 'LAMINA' : 'NO APLICA',
      'CalibreTB' : data.calibre,
      'Fecha' : moment().format('YYYY-MM-DD'),
      'Hora' : moment().format('HH:mm:ss'),
      'Observacion' : ``,
      'AlDardo' : 'SI',
      'Geles' : 'NO', 
      'Quemado' : 'NO', 
      'Brillo' : 'NO',
      'Cal1' : data.calibre,
      'Cal2' : data.calibre,
      'Cal3' : data.calibre,
      'Cal4' : data.calibre,
      'Moda' : data.calibre,
      'Desviacion': 0, 
      'Guardado' : false,
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
    this.getCurrentTurn();
    let esError : boolean = false;
    let pigmento : any = this.pigmentos.filter(pigmento => pigmento.pigmt_Nombre == fila.Pigmento);
    this.load = true;
    this.onReject(`eleccion`);
    
    let modelo : modelControlCalidad_Extrusion = {
      'CcExt_Id': fila.Id > 0 ? fila.Id : 0,
      'Turno_Id': this.turn == 'RN' ? 'NOCHE' : this.turn == 'RD' ? 'DIA' : this.turn,
      'Usua_Id': this.storage_Id,
      'CcExt_Maquina': fila.Maquina,
      'CcExt_Ronda': fila.Ronda,
      'CcExt_OT': fila.OT,
      'CcExt_Cliente': fila.Cliente,
      'Prod_Id': fila.Item,
      'Referencia': fila.Referencia,
      'CcExt_Rollo': fila.Rollo,
      'Pigmento_Id': pigmento[0].pigmt_Id,
      'CcExt_AnchoTubular': fila.AnchoTubular,
      'CcExt_PesoMetro': fila.PesoMetro,
      'CcExt_Ancho': fila.Ancho,
      'UndMed_Id': `Cms`,
      'CcExt_CalibreMax': fila.CalMax,
      'CcExt_CalibreMin': fila.CalMin,
      'CcExt_CalibreProm': fila.CalProm,
      'CcExt_Apariencia': fila.Apariencia,
      'CcExt_Tratado': fila.Tratado,
      'CcExt_Rasgado': fila.Rasgado,
      'CcExt_TipoBobina': fila.TipoBobina,
      'CcExt_Fecha': moment().format('YYYY-MM-DD'),
      'CcExt_Hora': moment().format('HH:mm:ss'),
      'CcExt_Observacion': fila.Observacion,
      'CcExt_CalibreTB': fila.CalibreTB,
      'CcExt_AlDardo': fila.AlDardo,
      'CcExt_Geles': 'NO',
      'CcExt_Quemado': 'NO',
      'CcExt_Brillo': 'NO',
      'CcExt_Calibre1': fila.Cal1,
      'CcExt_Calibre2': fila.Cal2,
      'CcExt_Calibre3': fila.Cal3,
      'CcExt_Calibre4': fila.Cal4,
      'CcExt_Calibre5': 0,
      'CcExt_Calibre6': 0,
      'CcExt_Calibre7': 0,
      'CcExt_Calibre8': 0,
      'CcExt_Calibre9': 0,
      'CcExt_Calibre10': 0,
      'CcExt_Calibre11': 0,
      'CcExt_Calibre12': 0,
      'CcExt_Calibre13': 0,
      'CcExt_Calibre14': 0,
      'CcExt_Calibre15': 0,
      'CcExt_Calibre16': 0,
      'CCExt_Moda': fila.Moda,
      'CCExt_Desviacion': fila.Desviacion
    }
    
    if(fila.Id > 0) {
      this.srvCcExtrusion.Put(fila.Id ,modelo).subscribe(data => { esError = false; }, error => { esError = true; }); 
        if (esError) this.msjs.mensajeError(`Error`, `No se pudo actualizar la ronda!`);
        else {
          this.msjs.mensajeConfirmacion(`Excelente!`, `Ronda ${fila.Ronda} de la maquina N° ${fila.Maquina} actualizada exitosamente!`);
          setTimeout(() => { 
            this.mostrarRegistrosHoy();
            this.load = false; 
          }, 500); 
        }  
    } else {
      this.srvCcExtrusion.Post(modelo).subscribe(data => { esError = false; }, error => { esError = true; }); 
        if (esError) this.msjs.mensajeError(`Error`, `No se pudo registrar la ronda!`);
        else {
          this.msjs.mensajeConfirmacion(`Excelente!`, `Ronda ${fila.Ronda} de la maquina N° ${fila.Maquina} creada correctamente!`);
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
    if(data.Id > 0) this.msg.add({severity:'warn', key:'eleccion', summary:'Elección', detail: `Está seguro que desea actualizar la ronda N° ${data.Ronda} de la maquina N° ${data.Maquina}?`, sticky: true});
    else this.msg.add({severity:'warn', key:'eleccion', summary:'Elección', detail: `Está seguro que desea crear la ronda N° ${data.Ronda} de la maquina N° ${data.Maquina}?`, sticky: true});
  }

  /** Cerrar Dialogo de eliminación*/
  onReject = (dato : any) => this.msg.clear(dato);

  //Quitar registro de la tabla
  quitarRegistro = (index : number) => this.registros.splice(index, 1);

  //Función que se encarga de filtrar la información de la tabla
  aplicarfiltro = ($event, campo : any, valorCampo : string) => this.dtExtrusion!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  //Función que generará el formato excel dependiendo la cantidad de registros que tenga la tabla
  generarFormatoExcel(){
    //if(this.registros.length > 0) {
    setTimeout(() => {
      this.load = true;
      let filasRestantes : number = this.registros.length;
      let filasTomadas : number = 0;
      let contadorHojas : number = 0;
      let workbook : any = new Workbook();
      let title : any = `FR-AC01 Control de calidad de extrusión`;
      
      /*for (let index = 0; index < 48; index + 24) {
        if(filasRestantes > 0 && filasRestantes > 24) {
          this.crearHojasExcel(workbook, filasTomadas, contadorHojas += 1);
          filasRestantes -= 24;
          filasTomadas += 24;
        } else if(filasRestantes > 0 && filasRestantes < 24) {
          this.crearHojasExcel(workbook, filasTomadas, contadorHojas += 1);
          filasTomadas += filasRestantes;
          filasRestantes -= filasRestantes;
        } else if(filasRestantes == 0) break;
      }*/
      setTimeout(() => {
        workbook.xlsx.writeBuffer().then((data) => {
          let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          fs.saveAs(blob, title + ` - ` + this.today + `.xlsx`);
        });
        this.load = false;
        this.msjs.mensajeConfirmacion(`¡Información Exportada!`, `¡Se ha creado un archivo de Excel con la información!`);
      }, 500);
    //} else this.msjs.mensajeAdvertencia(`Advertencia`, `No hay registros para exportar!`);
    }, 1500);
      
  }

  // funcion que va a generar las hojas del formato y su nombre
  crearHojasExcel(workbook : any, filasTomadas : number, contadorHojas){
    let worksheet = workbook.addWorksheet(`Hoja ` + `${contadorHojas}`, { pageSetup : { paperSize: 119,  orientation:'landscape'}, });
    const imageId1 = workbook.addImage({ base64: logoParaPdf, extension: 'png', });
    worksheet.addImage(imageId1, { tl: { col: 0.1, row: 0.45 }, ext: { width: 150, height: 40 }, editAs: 'oneCell' });
    this.formatoExcel(worksheet, filasTomadas);
  }

  //Función que mostrará el cargue de datos al formato excel
  formatoExcel(worksheet : any, ft : number){
    let datos : any[] = [];
    let infoDocumento : any = [];
    let columnas : string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R' ];
    datos = this.registros;
    //Información
    for (const item of datos) {
      const datos1  : any = [item.Maquina, item.Ronda, item.OT, item.Cliente, item.Referencia, item.Rollo, item.Pigmento, item.AnchoTubular, item.PesoMetro, item.Ancho, item.CalMin,
      item.CalMax, item.CalProm, item.Apariencia, item.Tratado, item.Rasgado, item.TipoBobina == 'TUBULAR' ? item.CalibreTB : 'N/A', item.TipoBobina == 'LAMINA' ? item.CalibreTB : 'N/A'];
      infoDocumento.push(datos1);
    }

    //Titulos y ajustes del formato.
    this.headersExcel(worksheet);
    this.ajustesHojaExcel(worksheet);

    //Cargue de datos al excel.
    for (let index = 0; index < columnas.length; index++) {
      for (let i = 8; i < 32; i++) {
        worksheet.getCell(`${columnas[index]}${i}`).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell(`${columnas[index]}${i}`).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell(`${columnas[index]}${i}`).font = { name: 'Calibri', family: 4, size: 10, };
        if(infoDocumento[i - 8 + ft] != undefined) worksheet.getCell(`${columnas[index]}${i}`).value = infoDocumento[i - 8 + ft][index];  
      }
    }

    //Ajuste del tamaño de las columnas
    let arrayColumnas = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
    let arrayTamanoColumnas = [9, 4, 10, 25, 30, 10, 10, 10, 7, 7, 6, 6, 6, 4, 4, 4, 8, 8];
    arrayColumnas.forEach(ac => worksheet.getColumn(ac).width = arrayTamanoColumnas[ac - 1]);
  }

  // Funcion que va a darle el estilo a cada celda del encabezado de la tabla
  headersExcel(worksheet : any) {
    const header1 = ["FECHA", "", "", "TURNO", "", "NOMBRE INSPECTOR", ""]
    const header2 = ["MAQUINA", "RONDA", "OT", "CLIENTE", "REFERENCIA", "N° ROLLO", "PIGMENTO", "ANCHO TUBULAR", "PESO METRO (g)", "ANCHO (cm)", "CAL. MIN", "CAL. MAX", "CAL. PROM", "APARIENCIA", "TRATADO", "RASGADO", "TIPO BOBINA", "CALIBRE"]
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
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    });
    worksheet.addRow([]);
    let headerRow2 = worksheet.addRow(header2);
    headerRow2.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow2.font = { name: 'Calibri', family: 4, size: 10, bold: true };
    headerRow2.height = 60
    headerRow2.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    });
  }

  // Funcion que va a darle el estilo a cada celda del cuerpo de la tabla
  ajustesHojaExcel(worksheet : any) {
    let titulo : string = `CONTROL DE CALIDAD DE EXTRUSIÓN`;
    let unirCeldas : string [] = ['A1:C3', 'D1:P3', 'Q1:R1', 'Q2:R2', 'Q3:R3', 'B5:C5', 'F5:G5', 'H5:R5', 'A33:R36'];
    let alinearWrap : string [] = ['H7', 'I7', 'J7', 'K7', 'L7', 'M7', 'Q7', 'R7'];
    let textoRotado : string [] = ['B7', 'N7', 'O7', 'P7'];
    let textoFormato : string [] = ['Q1', 'Q2', 'Q3', 'A33'];
    let fila1 : string [] = ['A1', 'D1', 'Q1', 'Q2', 'Q3', 'H5', 'A33'];
    let altoFilas : number[] = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
    let filaEncabezado : any = ['B5', 'E5', 'H5']

    unirCeldas.forEach(cell => worksheet.mergeCells(cell));
    alinearWrap.forEach(cell => worksheet.getCell(cell).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true  });
    textoRotado.forEach(cell => worksheet.getCell(cell).alignment = { vertical: 'middle', horizontal: 'center', textRotation: 90 });
    textoFormato.forEach(f => worksheet.getCell(f).font = { name: 'Calibri', family: 4, size: 10, });
    worksheet.getCell('D1').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A33').alignment = { vertical: 'top', horizontal: 'left' };
    //worksheet.getCell('D1').value = titulo;
    worksheet.getCell('A33').value = `OBSERVACIONES: `;
    worksheet.getCell('Q1').value = `Código: FR-AC01`; 
    worksheet.getCell('Q2').value = `Versión: 03`; 
    worksheet.getCell('Q3').value = `Fecha: 30/07/2022`;
    worksheet.getCell('B5').value = this.today; 
    worksheet.getCell('E5').value = this.hora > '18:00:00' ? 'NOCHE' : 'DIA'; 
    worksheet.getCell('H5').value = this.AppComponent.storage_Nombre;
    filaEncabezado.forEach(f => worksheet.getCell(f).font = { name: 'Calibri', family: 4, size: 10, bold: false });
    fila1.forEach(f => worksheet.getCell(f).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } });
    altoFilas.forEach(row => { worksheet.getRow(row).height = 23  });
  }

  // Funcion que va a consultar la OT cuando se presiona la tecla TAB
  presionarTab($event, registro : any, index : number) {
    const tecla = $event.key;
    console.log(tecla);
    (['Tab', 'Enter'].includes(tecla)) ? this.consultarOT(registro, index) : null;
  } 

  loadDataMachine(date : any, machine : any){
    this.productionMachines = [];
    this.productionReport = true;
    let date1 = moment(date).add(1, 'd').format('YYYY-MM-DD');
    
    this.cmpProduction.formFiltros.patchValue({ 'rangoFechas' : [new Date(date1), new Date(date1)], 'Maquina' : machine, 'proceso' : 'EXTRUSION'});
    this.cmpProduction.consultarProduccion();
  }

  //TODO: FORMATO EXCEL REAL
  exportExcel(){
    if(this.registros.length > 0) {
      setTimeout(() => { this.loadSheetAndStyles2(this.registros); }, 500);
    } else this.msjs.mensajeAdvertencia(`No hay datos para exportar`, `Debe haber al menos un registro en la tabla!`);
  }
  
  //Función que cargará la hoja de cálculo y los estilos.
  loadSheetAndStyles2(data : any){
    let title : any = `Control de calidad de extrusión`;  
    //title += ` ${moment().format('DD-MM-YYYY')}`
    let fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '' } };
    let border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }, };
    let font = { name: 'Calibri', family: 4, size: 10, bold: true };
    let alignment = { vertical: 'middle', horizontal: 'center', wrapText: true};
    let workbook = this.svExcel.formatoExcel(title, true);

    this.addNewSheet2(workbook, title, fill, border, font, alignment, data);
    this.svExcel.creacionExcel(title, workbook);
  }

  //Función para agregar una nueva hoja de calculo.
  addNewSheet2(wb : any, title : any, fill : any, border : any, font : any, alignment : any, data : any){
    let fontTitle = { name: 'Calibri', family: 4, size: 10, bold: true };
    let worksheet : any = wb.worksheets[0];

    this.loadStyleTitle2(worksheet, title, fontTitle, alignment);
    this.loadHeader(worksheet, fill, border, font, alignment);
    this.loadHeader2(worksheet, fill, border, font, alignment);
    this.loadInfoExcel2(worksheet, [this.dataExcel2(data)], border,  alignment);
  }

  //Cargar estilos del titulo de la hoja.
  loadStyleTitle2(ws: any, title : any, fontTitle : any, alignment : any){
    ws.getCell('D1').alignment = alignment;
    ws.getCell('D1').font = fontTitle;
    ws.getCell('D1').value = title;
    ws.getCell('W1').alignment = alignment;
    ws.getCell('W1').font = fontTitle;
    ws.getCell('W1').value = `Código:FR-AC-GC-03`; 
    ws.getCell('W2').alignment = alignment;
    ws.getCell('W2').font = fontTitle;
    ws.getCell('W2').value = `Versión: 03`; 
    ws.getCell('W3').alignment = alignment;
    ws.getCell('W3').font = fontTitle;
    ws.getCell('W3').value = `Fecha: 30/07/2022`;
  }

  loadHeader(ws : any, fill : any, border : any, font : any, alignment : any){
    let rowHeader : any = ['A5','B5','C5','D5','E5','F5','G5','H5','I5', 'J5','K5','L5','M5', 'N5', 'O5', 'P5', 'Q5', 'R5','S5','T5','U5','V5','W5','X5']; 
    let unirCeldas : string [] = ['A1:C3', 'D1:V3', 'W1:X1', 'W2:X2', 'W3:X3', 'B5:C5', 'F5:G5', 'H5:X5'];
    //ws.addRow([]);
    ws.addRow(this.loadFieldsHeader());
    
    rowHeader.forEach(x => ws.getCell(x).fill = fill);
    rowHeader.forEach(x => ws.getCell(x).alignment = alignment);
    rowHeader.forEach(x => ws.getCell(x).border = border);
    rowHeader.forEach(x => ws.getCell(x).font = font);

    unirCeldas.forEach(cell => ws.mergeCells(cell));
    this.loadSizeHeader(ws);
  }

  //Función para cargar los titulos de el header y los estilos.
  loadHeader2(ws : any, fill : any, border : any, font : any, alignment : any){
    let rowHeader : any = ['A7','B7','C7','D7','E7','F7','G7','H7','I7','J7','K7','L7','M7', 'N7', 'O7', 'P7', 'Q7','R7','S7', 'T7', 'U7', 'V7', 'W7', 'X7' ];
    let alinearWrap : string [] = ['H7', 'I7', 'J7', 'K7', 'L7', 'M7', 'Q7', ];
    let textoRotado : string [] = ['B7', 'F7', 'N7', 'O7', 'P7']; 
    
    ws.addRow([]);
    ws.addRow(this.loadFieldsHeader2());
    
    rowHeader.forEach(x => ws.getCell(x).fill = fill);
    rowHeader.forEach(x => ws.getCell(x).alignment = alignment);
    rowHeader.forEach(x => ws.getCell(x).border = border);
    rowHeader.forEach(x => ws.getCell(x).font = font);
    //ws.mergeCells('A1:M3');

    alinearWrap.forEach(cell => ws.getCell(cell).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true  });
    textoRotado.forEach(cell => ws.getCell(cell).alignment = { vertical: 'middle', horizontal: 'center', textRotation: 90 });
    this.loadSizeHeader2(ws);
  }

  //Función para cargar el tamaño y el alto de las columnas del header.
  loadSizeHeader(ws : any){
    [11,12,13,6].forEach(x => ws.getColumn(x).width = 6);
    [9,10].forEach(x => ws.getColumn(x).width = 7);
    [14,15,16].forEach(x => ws.getColumn(x).width = 4);
    [17,18,19,20,21,22,].forEach(x => ws.getColumn(x).width = 8);
    [23,24].forEach(x => ws.getColumn(x).width = 9);
    [3,7,8].forEach(x => ws.getColumn(x).width = 10);
    [1].forEach(x => ws.getColumn(x).width = 10);
    [2].forEach(x => ws.getColumn(x).width = 4);
    [4].forEach(x => ws.getColumn(x).width = 25);
    [5].forEach(x => ws.getColumn(x).width = 33);
  }

  //Función para cargar el tamaño y el alto de las columnas del header.
  loadSizeHeader2(ws : any){
    [11,12,13,6].forEach(x => ws.getColumn(x).width = 7);
    [9,10].forEach(x => ws.getColumn(x).width = 7);
    [14,15,16].forEach(x => ws.getColumn(x).width = 4);
    [17,18,19,20,21,22,].forEach(x => ws.getColumn(x).width = 9);
    [23,24].forEach(x => ws.getColumn(x).width = 9);
    [3,7,8].forEach(x => ws.getColumn(x).width = 10);
    [1].forEach(x => ws.getColumn(x).width = 10);
    [2].forEach(x => ws.getColumn(x).width = 4);
    [4].forEach(x => ws.getColumn(x).width = 25);
    [5].forEach(x => ws.getColumn(x).width = 33);
  }

  //Función para cargar los nombres de las columnas del header
  loadFieldsHeader(){
    let headerRow = [
      "FECHA", "", "", "TURNO", "", "INSPECTOR", ""
    ];
    return headerRow;
  }

 //Función para cargar los nombres de las columnas del header
  loadFieldsHeader2(){
    let headerRow = [
      "MQ", "RONDA", "OT", "CLIENTE", "PRODUCTO", "EMBOBINADOR", "PIGMENTO", "ANCHO TUBULAR", "PESO METRO (g)", "ANCHO (cm)", "CAL. MIN", "CAL. MAX", "CAL. PROM", "APARIENCIA", "TRATADO", "RASGADO", "TIPO BOBINA", "CALIBRE", "CAL 1", "CAL 2", "CAL 3", "CAL 4", "MODA", "DESV." 
    ];
    return headerRow;
  }

  //Cargar información con los estilos al formato excel. 
  loadInfoExcel2(ws : any, data : any, border : any, alignment : any){
    //let formatNumber: Array<number> = [9,10,11,12];
    let contador : any = 8;
    let row : any = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','V','W','X']; 

    //formatNumber.forEach(x => ws.getColumn(x).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    data[0].forEach(x => {
      ws.addRow(x);
      row.forEach(r => {
        ws.getCell(`${r}${contador}`).border = border;
        ws.getCell(`${r}${contador}`).font = { name: 'Calibri', family: 4, size: 10 };
        ws.getCell(`${r}${contador}`).alignment = alignment;
      });
      contador++
    });
    this.observations(ws, contador);
    //row.forEach(r => ws.getCell(`${r}${contador - 1}`).font = { name: 'Calibri', family: 4, size: 11, bold : true, }); 
  }

  //.Función que contendrá la info al documento excel. 
  dataExcel2(data : any){
    let info : any = [];
    data.forEach(x => {
      info.push([
        x.Maquina,
        x.Ronda,
        x.OT,
        x.Cliente,
        x.Referencia,
        x.Rollo,
        x.Pigmento,
        x.AnchoTubular,
        x.PesoMetro,
        x.Ancho, 
        x.CalMin,
        x.CalMax,
        x.CalProm,
        x.Apariencia == 'PASA' ? 'P' : x.Apariencia == 'ACEPTABLE' ? 'A' : 'NP' ,
        x.Tratado == 'PASA' ? 'P' : x.Tratado == 'NO PASA' ? 'NP' : 'NA',
        x.Rasgado == 'PASA' ? 'P' : x.Tratado == 'NO PASA' ? 'NP' : 'NA',
        x.TipoBobina,
        x.CalibreTB,
        x.Cal1,
        x.Cal2,
        x.Cal3,
        x.Cal4,
        x.Moda,
        x.Desviacion
      ]);
    });
    return info;
  }
  
  observations(ws, contador){
    if(this.registros.length > 24) {
      let unirCeldas : string [] = [`A${contador}:X${contador}`];
      ws.getCell(`$A${contador}`).value = `OBSERVACIONES: `;
      unirCeldas.forEach(cell => ws.mergeCells(cell));
    } else {
      let unirCeldas : string [] = ['A33:X36'];
      ws.getCell('A33').value = `OBSERVACIONES: `;
      unirCeldas.forEach(cell => ws.mergeCells(cell));
    }
  }
  
}
