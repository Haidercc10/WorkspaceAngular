import { Component, OnInit } from '@angular/core';
import { Console } from 'console';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { modelControlCalidad_Sellado } from 'src/app/Modelo/modelControlCalidad';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { ControlCalidad_SelladoService } from 'src/app/Servicios/ControlCalidad_Sellado/ControlCalidad_Sellado.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { TurnosService } from 'src/app/Servicios/Turnos/Turnos.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-ControlCalidad_Sellado',
  templateUrl: './ControlCalidad_Sellado.component.html',
  styleUrls: ['./ControlCalidad_Sellado.component.css']
})
export class ControlCalidad_SelladoComponent implements OnInit {
  registros : any = [];
  turnos : any = [];
  eleccion : any = ["SI", "NO"];
  resistencia : any = ["NO APLICA", "BAJA", "MEDIA", "ALTA"];
  load : boolean = false;
  today : any = moment().format('YYYY-MM-DD');
  hora : any = moment().format('HH:mm:ss');
  registroSeleccionado : any;
  ronda : number = 0; 
  registrosClonados = {};

  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente


  constructor(private srvTurnos : TurnosService,
                private srvCcSellado : ControlCalidad_SelladoService, 
                  private srvBagpro : BagproService, 
                    private msjs : MensajesAplicacionService, 
                      private msg : MessageService, 
                        private AppComponent : AppComponent) { }

  ngOnInit() {
    this.lecturaStorage();
    this.cargarTurnos();
    this.mostrarRegistrosHoy();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  agregarFila = () => this.registros.push({});

  //.Función que cargará la información de los turnos
  cargarTurnos = () => this.srvTurnos.srvObtenerLista().subscribe(data => { this.turnos = data; }); 

  //.Función que cargará los registros del día actual
  mostrarRegistrosHoy() {
    this.load = true;
    this.registros = [];
    this.srvCcSellado.GetControlCalidad_SelladoHoy().subscribe(data => {
      if(data.length > 0) {
        for (let index = 0; index < data.length; index++) {
          this.cargarTabla(data[index]);
        }
      }
    });
    setTimeout(() => { this.load = false; }, 800);
  }

  //. Función que cargará la tabla con los registros del día actual
  cargarTabla(datos : any) {
    let info : any = {
      Id : datos.ccSel_Id,
      Ronda : datos.ccSel_Ronda,
      Turno : datos.turno_Id,
      OT : datos.ccSel_OT,
      Maquina : datos.ccSel_Maquina,
      Item : datos.prod_Id,
      Referencia : datos.referencia,
      Calibre : datos.ccSel_Calibre,
      Ancho : datos.ccSel_Ancho,
      Largo : datos.ccSel_Largo, 
      Af_Izquierdo : datos.anchoFuelle_Izq,
      Af_Derecho : datos.anchoFuelle_Der,
      Af_Abajo : datos.anchoFuelle_Abajo,
      Apariencia : datos.ccSel_Apariencia,
      Rasgado : datos.ccSel_Rasgado,
      Filtrado : datos.ccSel_PruebaFiltrado,
      Presion : datos.ccSel_PruebaPresion,
      Sellabilidad : datos.ccSel_Sellabilidad,
      Impresion : datos.ccSel_Impresion,
      Precorte : datos.ccSel_Precorte,
      Perforacion : datos.ccSel_Perforacion,
      BolsasxPaq : datos.ccSel_CantBolsasxPaq,
      Observacion : datos.ccSel_Observacion,
    }
    this.registros.push(info);
    this.registros.sort((a, b) => a.Ronda - b.Ronda);
    this.registros.sort((a, b) => a.OT - b.OT);
  }

  //. Consultar la OT que se encuentra en la fila seleccionada
  consultarOT(datos : any, index : number){
    this.ronda = 0;
    this.srvCcSellado.GetRonda(datos.OT).subscribe(dato => { this.ronda = dato });
    setTimeout(() => {
      this.ronda += 1
      if(this.ronda > 3) this.msjs.mensajeAdvertencia(`Advertencia`, `Ya completó las rondas permitidas para la OT N° ${datos.OT}!`)
      else {
        this.srvBagpro.getOtControlCalidadExtrusion(datos.OT, `SELLADO`).subscribe(data => {
          if(data.length > 0){
            let info : any = {
              Id : 0,
              Ronda : this.ronda,
              Turno : `NE`,
              OT : data[0].ot,
              Maquina : parseInt(data[0].maquina.trim()),
              Item : data[0].item,
              Referencia : data[0].referencia,
              Calibre : data[0].calibre,
              Ancho : data[0].ancho,
              Largo : data[0].largo, 
              Af_Izquierdo : data[0].anchoFuelle_Derecha,
              Af_Derecho : data[0].anchoFuelle_Izquierda,
              Af_Abajo : data[0].anchoFuelle_Abajo,
              Apariencia : ``,
              Rasgado : ``,
              Filtrado : ``,
              Presion : ``,
              Sellabilidad :``,
              Impresion : ``,
              Precorte : ``,
              Perforacion : ``,
              BolsasxPaq : data[0].cantBolsasxPaq,
              Observacion : ``,
            }
            this.registros[index] = info;
            this.registros.sort((a, b) => a.Ronda - b.Ronda);
            this.registros.sort((a, b) => a.OT - b.OT);
          } else this.msjs.mensajeAdvertencia(`Advertencia`, `No se encontraron registros con la OT N° ${datos.OT}`)
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
    let esError : boolean = false;
    this.onReject(`eleccion`);
    let modelo : modelControlCalidad_Sellado = {
      CcSel_Id : fila.Id > 0 ? fila.Id : 0,
      Turno_Id: fila.Turno,
      Usua_Id: this.storage_Id,
      CcSel_Maquina: fila.Maquina,
      CcSel_Ronda: fila.Ronda,
      CcSel_OT: fila.OT,
      Prod_Id: fila.Item,
      Referencia: fila.Referencia,
      CcSel_Calibre: fila.Calibre,
      CcSel_Ancho: fila.Ancho,
      CcSel_Largo: fila.Largo,
      UndMed_AL: 'Cms',
      AnchoFuelle_Izq: fila.Af_Izquierdo,
      AnchoFuelle_Der: fila.Af_Derecho,
      AnchoFuelle_Abajo: fila.Af_Abajo,
      UndMed_AF: 'Cms',
      CcSel_Rasgado: fila.Rasgado,
      CcSel_PruebaFiltrado: fila.Filtrado,
      CcSel_PruebaPresion: fila.Presion,
      CcSel_Sellabilidad: fila.Sellabilidad,
      CcSel_Impresion: fila.Impresion,
      CcSel_Precorte: fila.Precorte,
      CcSel_Perforacion: fila.Perforacion,
      CcSel_CantBolsasxPaq: fila.BolsasxPaq,
      CcSel_Fecha: this.today,
      CcSel_Hora: this.hora,
      CcSel_Observacion: fila.Observacion
    }

    if(fila.Id > 0) {
      this.srvCcSellado.Put(fila.Id, modelo).subscribe(data => { esError = false; }, error => { esError = true; }); 
      if (esError) this.msjs.mensajeError(`Error`, `No se pudo actualizar la ronda!`)
      else {
        this.msjs.mensajeConfirmacion(`Excelente!`, `Ronda ${fila.Ronda} de la OT N° ${fila.OT} actualizada exitosamente!`);
        this.mostrarRegistrosHoy();
      }
    } else {
      this.srvCcSellado.Post(modelo).subscribe(data => { esError = false; }, error => { esError = true; }); 
      if (esError) this.msjs.mensajeError(`Error`, `No se pudo registrar la ronda!`)
      else {
        this.msjs.mensajeConfirmacion(`Excelente!`, `Ronda ${fila.Ronda} de la OT N° ${fila.OT} creada correctamente!`);
        this.mostrarRegistrosHoy();
      }
    }
  }

  //Función que guardará los registros del día actual
  /*actualizarRonda(fila : any) {
    let esError : boolean = false;
    this.onReject(`eleccion`);
    let modelo : modelControlCalidad_Sellado = {
      CcSel_Id : fila.Id,
      Turno_Id: fila.Turno,
      Usua_Id: this.storage_Id,
      CcSel_Maquina: fila.Maquina,
      CcSel_Ronda: fila.Ronda,
      CcSel_OT: fila.OT,
      Prod_Id: fila.Item,
      Referencia: fila.Referencia,
      CcSel_Calibre: fila.Calibre,
      CcSel_Ancho: fila.Ancho,
      CcSel_Largo: fila.Largo,
      UndMed_AL: 'Cms',
      AnchoFuelle_Izq: fila.Af_Izquierdo,
      AnchoFuelle_Der: fila.Af_Derecho,
      AnchoFuelle_Abajo: fila.Af_Abajo,
      UndMed_AF: 'Cms',
      CcSel_Rasgado: fila.Rasgado,
      CcSel_PruebaFiltrado: fila.Filtrado,
      CcSel_PruebaPresion: fila.Presion,
      CcSel_Sellabilidad: fila.Sellabilidad,
      CcSel_Impresion: fila.Impresion,
      CcSel_Precorte: fila.Precorte,
      CcSel_Perforacion: fila.Perforacion,
      CcSel_CantBolsasxPaq: fila.BolsasxPaq,
      CcSel_Fecha: this.today,
      CcSel_Hora: this.hora,
      CcSel_Observacion: fila.Observacion
    }
    this.srvCcSellado.Put(fila.Id, modelo).subscribe(data => { esError = false; }, error => { esError = true; }); 
     if (esError) this.msjs.mensajeError(`Error`, `No se pudo actualizar la ronda!`)
     else {
      this.msjs.mensajeConfirmacion(`Excelente!`, `Ronda ${fila.Ronda} de la OT N° ${fila.OT} actualizada exitosamente!`);
      this.mostrarRegistrosHoy();
    }
  }*/

  //. Función para mostrar una elección de creación o actualización de un registro
  mostrarEleccion(data : any){
    this.registroSeleccionado = data;
    if(data.Id > 0) this.msg.add({severity:'warn', key:'eleccion', summary:'Elección', detail: `Está seguro que desea actualizar la ronda N° ${data.Ronda} de la OT N° ${data.OT}?`, sticky: true});
    else this.msg.add({severity:'warn', key:'eleccion', summary:'Elección', detail: `Está seguro que desea crear la ronda N° ${data.Ronda} de la OT N° ${data.OT}?`, sticky: true});
  }

  //. Función para cerrar el dialogo de elección
  onReject = (dato : any) => this.msg.clear(dato);

  filaEditar(fila : any) {
    console.log(fila)
  }
}
