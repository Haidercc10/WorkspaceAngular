import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { modelControlCalidad_Extrusion } from 'src/app/Modelo/modelControlCalidad';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { ControlCalidad_ExtrusionService } from 'src/app/Servicios/ControlCalidad_Extrusion/ControlCalidad_Extrusion.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { PigmentoProductoService } from 'src/app/Servicios/PigmentosProductos/pigmentoProducto.service';
import { AppComponent } from 'src/app/app.component';

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
    this.cargarRegistro(undefined);
    this.cargarPigmentos();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  //
  cargarPigmentos = () => this.srvPigmentos.srvObtenerLista().subscribe(data => { this.pigmentos = data; }); 

  mostrarRegistrosHoy() {
    
  }

  //
  cargarRegistro(data : any){
    console.log(data)
    let info : any = {
      Ronda : data == undefined ? 1 : 1, 
      OT : data == undefined ? `` : data.ot,
      Maquina : data == undefined ? `` : data.maquina, 
      Cliente :  data == undefined ? `` : data.cliente,
      Item :  data == undefined ? `` : data.item,
      Referencia : data == undefined ? `` : data.referencia,
      Rollo : data == undefined ? `` : data.rollo,
      Pigmento : data == undefined ? `NO APLICA` : parseInt(data.pigmentoId.trim()),
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
    }
    this.registros.push(info);
  }

  //
  consultarOT(data : any){
    this.registros = [];

    this.srvBagpro.getOtControlCalidadExtrusion(data.OT, `EXTRUSION`).subscribe(data => {
      if(data.length > 0){
        let cantRegistros : number = data.length;
        let indice = Math.floor(Math.random() * cantRegistros);
        this.cargarRegistro(data[indice]);
      } else this.msjs.mensajeAdvertencia(`Advertencia`, `No se encontraron registros con la OT ${data[0].OT}`)
    });
  }

  registrarRonda(){
  }

  //Como se muestra el registro seleccionado
  onRowEditInit(data : any) {
    console.log(1);
    console.log(data);
  }

  //Crear
  onRowEditSave(fila : any) {
    fila = this.registroSeleccionado;
    this.onReject(`eleccion`);
    let modelo : modelControlCalidad_Extrusion = {
      Turno_Id: `RD`,
      Usua_Id: this.storage_Id,
      CcExt_Maquina: fila.Maquina,
      CcExt_Ronda: fila.Ronda,
      CcExt_OT: fila.OT,
      CcExt_Cliente: fila.Cliente,
      Prod_Id: fila.Item,
      Referencia: fila.Referencia,
      CcExt_Rollo: fila.Rollo,
      Pigmento_Id: fila.Pigmento,
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
      CcExt_Observacion: ``
    }
    this.srvCcExtrusion.Post(modelo).subscribe(data => { this.msjs.mensajeConfirmacion(`Confirmacion`, `Registro de ronda N° ${fila.Ronda} para la OT N° ${fila.OT} creado con éxito!`) }, 
    error => { this.msjs.mensajeError(`Error`, `No se pudo crear la ronda N° ${fila.Ronda} para la OT N° ${fila.OT}`) }); 
  }

  //Cancelar 
  onRowEditCancel(data : any) {
    console.log(3);
    console.log(data);
  }
  
   /** Función para mostrar una elección de eliminación de OT/Rollo de la tabla. */
  mostrarEleccion(data : any){
    this.registroSeleccionado = data
    this.msg.add({severity:'warn', key:'eleccion', summary:'Elección', detail: `Está seguro que desea guardar la ronda N° ${data.Ronda} de la OT N° ${data.OT}?`, sticky: true});
  }

  /** Cerrar Dialogo de eliminación*/
  onReject = (dato : any) => this.msg.clear(dato);


}
