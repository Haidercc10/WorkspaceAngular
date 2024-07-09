import { Component, Injectable, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { Orden_FacturacionComponent } from '../Orden_Facturacion/Orden_Facturacion.component';
import { Devolucion_OrdenFacturacionComponent } from '../Devolucion_OrdenFacturacion/Devolucion_OrdenFacturacion.component';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';

@Injectable({
  providedIn : 'root'
})

@Component({
  selector: 'app-Movimientos_Rollos',
  templateUrl: './Movimientos_Rollos.component.html',
  styleUrls: ['./Movimientos_Rollos.component.css']
})
export class Movimientos_RollosComponent implements OnInit {
  load : boolean = true;
  movements : Array<any> = [];
  cols !: any;

  constructor(private AppComponent : AppComponent,
    private svProduction : Produccion_ProcesosService,
    private cmpOF : Orden_FacturacionComponent,
    private cmpDevolutions : Devolucion_OrdenFacturacionComponent,
    private msj : MensajesAplicacionService,
  ) { }

  ngOnInit() {
    this.loadColumnsTable();
  }

  //Función para cargar los campos de la tabla.
  loadColumnsTable(){
    this.cols = [];
    this.cols = [
      { field: 'type', header: 'Movimiento', type : 'text' },
      { field: 'id', header: 'Id' , type : 'number' },
      { field: 'rollBagPro', header: 'Rollo', type : 'number' },
      { field: 'item', header: 'Item', type : 'number' },
      { field: 'reference', header: 'Referencia', type : 'text' },
      { field: 'qty', header: 'Cantidad' , type : 'number' },
      { field: 'presentation', header: 'Presentación', type : 'text' },
      { field: 'date', header: 'Fecha', type : 'text' },
      { field: 'hour', header: 'Hora', type : 'text' },
      { field: 'userName', header: 'Usuario', type : 'text' },
      { field: 'status', header: 'Estado', type : 'text' },
      { field: 'observation', header: 'Observacion', type : 'text' },
    ];
  }

  //Función para cargar el modal de movimientos.
  searchMovements(data : any, type : string){
    this.movements = [];
    this.load = true;
    console.log(data);
    let rolloPl : any =  type == `Produccion` ? data.observacion == null ? 0 : data.observacion.replace(`Rollo #`, ``) : data.productionPL;
    type == `Produccion` ? rolloPl == 0 ? rolloPl = 0 : rolloPl = rolloPl.replace(`en PBDD.dbo.Produccion_Procesos`, ``) : rolloPl = rolloPl; 
    rolloPl = parseInt(rolloPl);
    let rollBagpro : any = type == `Produccion` ? data.rollo : data.production;
    
    this.svProduction.getMovementsRolls(rollBagpro, data.item, rolloPl).subscribe(dataPl => {
      if(dataPl.length > 0) {
        this.movements = dataPl;
        this.movements.sort((a, b) => a.date.localeCompare(b.date));
        this.load = false;
      } //else this.messages(`Advertencia`, `No se encontró información del rollo/bulto N° ${data.rollo}`);
    }, error => { this.messages(`Error`, `Se encontraron errores consultando información del rollo/bulto N° ${data.rollo}`); });
  }

  //Función que mostrará msjs dependiendo el tipo de msnsaje
  messages(msj1 : string, msj2 : string){
    this.load = false;
    switch (msj1) {
      case 'Confirmación':
        return this.msj.mensajeConfirmacion(msj1, msj2);
      case 'Advertencia':
        return this.msj.mensajeAdvertencia(msj1, msj2);
      case 'Error':
        return this.msj.mensajeError(msj1, msj2);
      default: 
        this.msj.mensajeAdvertencia(msj1, msj2);
        break;
    }
  }

  //Función para descargar PDF de los diferentes tipos de movimientos.
  downloadPDF(data : any){
    this.load = true;
    if(data.type == `ORDEN FACTURACIÓN`) this.cmpOF.createPDF(data.id, ``);
    else if(data.type == `SALIDA DESPACHO`) this.cmpOF.createPDF(parseInt(data.observation.replace(`Orden de Facturación #`, ``)), data.id);
    else if(data.type == `DEVOLUCIÓN`) this.cmpDevolutions.createPDF(data.id, `exportada`);
    setTimeout(() => { this.load = false }, 1000);
  }
}
