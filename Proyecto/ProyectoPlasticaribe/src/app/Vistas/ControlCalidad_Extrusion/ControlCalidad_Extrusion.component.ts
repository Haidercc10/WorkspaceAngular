import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { InitEditableRow, Table } from 'primeng/table';
import { modelControlCalidad_Extrusion } from 'src/app/Modelo/modelControlCalidad';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { ControlCalidad_ExtrusionService } from 'src/app/Servicios/ControlCalidad_Extrusion/ControlCalidad_Extrusion.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { PigmentoProductoService } from 'src/app/Servicios/PigmentosProductos/pigmentoProducto.service';
import { TurnosService } from 'src/app/Servicios/Turnos/Turnos.service';
import { AppComponent } from 'src/app/app.component';

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

  registros : any = []; //Array que va a contener los registros de los controles de sellado
  eleccion : any = ["Si", "No"]; //Array que va a contener los registros de los controles de sellado
  tiposBobinas : any = ["TUBULAR", "LÁMINA"]; //Array que va a contener los registros de los controles de sellado
  apariencias : any = ["NORMAL", "RASGADO"]; //Array que va a contener las apariencias de el/los rollos verificados
  pigmentos : any = []; //Array que va a contener los registros de los pigmentos de los productos
  registroSeleccionado : any = []; //Array que va a contener el registro seleccionado de la tabla.
  ronda : number = 0; //Variable que se usará para almacenar la ronda del controles de sellado
  turnos : any = []; //Array que va a contener los registros de los turnos
  registroClonado : any = {}; //Variable que clonará un objeto cuando se desee editar y lo quitará si se cancela la edición 
  habilitarCampos : boolean = false; //Variable que se usará para habilitar o deshabilitar los campos de la vista
  @ViewChild('dtExtrusion') dtExtrusion: Table | undefined;

  constructor(private AppComponent : AppComponent, 
                private srvBagpro : BagproService, 
                  private msjs : MensajesAplicacionService, 
                    private srvPigmentos : PigmentoProductoService, 
                      private srvCcExtrusion : ControlCalidad_ExtrusionService, 
                        private msg : MessageService, 
                          private srvTurnos : TurnosService, ) { 
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.lecturaStorage(); 
    this.cargarPigmentos();
    this.cargarTurnos();
    //this.mostrarRegistrosHoy(null, null);
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  //Función que consultará todos los Pigmentos
  cargarPigmentos = () => this.srvPigmentos.srvObtenerLista().subscribe(data => { this.pigmentos = data; }); 

  //Función que consultará los turnos
  cargarTurnos = () => this.srvTurnos.srvObtenerLista().subscribe(data => { this.turnos = data; }); 

  //Función que consultará las OT con rondas el día de hoy
  mostrarRegistrosHoy(fechaInicio : any, fechaFin : any) {
    this.registros = [];
    this.load = true;
    if(fechaInicio == `Fecha inválida`) fechaInicio = null
    if(fechaFin == `Fecha inválida`) fechaFin = null

    fechaInicio == null || fechaInicio.length == 0 ? fechaInicio = this.today : fechaInicio = moment(fechaInicio).format('YYYY-MM-DD');
    fechaFin == null ? fechaFin = fechaInicio : fechaFin = moment(fechaFin).format('YYYY-MM-DD');
    
    this.srvCcExtrusion.Get_TodoHoy(fechaInicio, fechaFin).subscribe(data => {
      if(data.length > 0) {
        console.log(100)
        for (let index = 0; index < data.length; index++) {
          this.cargarRegistrosCCExtrusion(data[index]);
        }
      }
      this.load = false;
      console.log(200)
    });
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
      Pigmento : `NO APLICA`,
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
      Observacion : datos.ccExt_Observacion,
    }
    this.registros.push(info);
    this.registros.sort((a, b) => a.Ronda - b.Ronda);
    this.registros.sort((a, b) => a.OT - b.OT);
  }

  //Función que va a consultar la información de la OT a la que desea agregar una ronda.
  consultarOT(datos : any, indexTabla : number, editando : boolean){
    this.load = true;
    this.ronda = 0;
    this.srvCcExtrusion.GetRonda(datos.OT).subscribe(dato => { this.ronda = dato; });
    setTimeout(() => {
      this.ronda += 1;
      if(this.ronda > 3) {
        this.msjs.mensajeAdvertencia(`Advertencia`, `Ya completó las rondas permitidas para la OT N° ${datos.OT}!`)
        this.registros.shift();
      } else {
        this.srvBagpro.getOtControlCalidadExtrusion(datos.OT, `EXTRUSION`).subscribe(data => {
          if(data.length > 0){
            editando = true;
            let cantRegistros : number = data.length;
            let indice = Math.floor(Math.random() * cantRegistros);
            this.cargarRegistro(data[indice], indexTabla, editando);
            this.load = false;
            setTimeout(() => document.getElementById(`edit_${indexTabla}`).click(), 100);
            //setTimeout(() => { this.dtExtrusion.initRowEdit(this.dtExtrusion.value[0]); }, 500); 
          } else this.msjs.mensajeAdvertencia(`Advertencia`, `No se encontraron registros con la OT N° ${datos.OT}`)
        });
      }
    }, 500);
   
  }

  //Función que agregará una fila vacia a la tabla de registros.
  agregarFila() {
    if(this.registros.length == 0) this.registros.unshift({});
    else if(this.registros[0].Id == undefined) this.msjs.mensajeAdvertencia(`Advertencia`, `No se puede agregar otra fila vacia!`);
    else this.registros.unshift({});
  }

  //Función que cargará la fila con los datos de la OT a la que desea agregar una ronda.
  cargarRegistro(data : any, indexTabla : number, editando){
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
      AnchoTubular : 0,
      PesoMetro : 0,
      Ancho : 0,
      CalMin : 0,
      CalMax : 0,
      CalProm : 0,
      Apariencia : ``,
      Tratado : ``,
      Rasgado : ``,
      TipoBobina : ``,
      Observacion : ``,
    }
    this.registros[indexTabla] = info;
  }

  //Función que va a registrar la ronda de la OT a la que desea agregar una ronda.
  registrarRonda(fila : any) {
    let pigmento : any = this.pigmentos.filter(pigmento => pigmento.pigmt_Nombre == fila.Pigmento);
    this.load = true;
    let esError : boolean = false;
    this.onReject(`eleccion`);
    let modelo : modelControlCalidad_Extrusion = {
      CcExt_Id: 0,
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
      CcExt_Observacion: fila.Observacion
    }
    this.srvCcExtrusion.Post(modelo).subscribe(data => { esError = false; }, error => { esError = true; }); 
     if (esError) this.msjs.mensajeError(`Error`, `No se pudo registrar la ronda!`)
     else {
      this.mostrarRegistrosHoy(null, null);
      setTimeout(() => { 
        this.load = false;
        this.msjs.mensajeConfirmacion(`Excelente!`, `Ronda ${fila.Ronda} de la OT N° ${fila.OT} creada correctamente!`);
      }, 3000);
    }
  }

  //Función que se ejecutará cuando se haga click en el botón de Editar
  onRowEditInit(data : any, indice : number) {
    this.registroClonado[indice] = {...data};
  }
  
  //Función que validará si la ronda ya existe, si existe se editará, si no se creará
  validarId(data : any){
    data = this.registroSeleccionado;
    if(data.Id > 0) this.editarRonda(data);
    else this.registrarRonda(data);
  }

  //Función que editará la información de la ronda y OT seleccionada
  editarRonda(fila : any) {
    let pigmento : any = this.pigmentos.filter(pigmento => pigmento.pigmt_Nombre == fila.Pigmento);
    this.load = true;
    let esError : boolean = false;
    this.onReject(`eleccion`);
    let modelo : modelControlCalidad_Extrusion = {
      CcExt_Id : fila.Id,
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
      CcExt_Observacion: fila.Observacion
    }
    this.srvCcExtrusion.Put(fila.Id, modelo).subscribe(data => { esError = false; }, error => { esError = true; });
    if(esError) this.msjs.mensajeError(`Error`, `No se pudo actualizar la ronda!`);
    else {
      this.mostrarRegistrosHoy(null, null);
      this.msjs.mensajeConfirmacion(`Excelente!`, `Ronda ${fila.Ronda} de la OT N° ${fila.OT} actualizada correctamente!`);
      setTimeout(() => { this.load = false; }, 2500);
    } 
  }

  //función que cancela la selección/edición de la fila.
  onRowEditCancel(data : any, indice : number) {
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

  quitarRegistro(index : number){
    this.registros.splice(index, 1);
  }
}
