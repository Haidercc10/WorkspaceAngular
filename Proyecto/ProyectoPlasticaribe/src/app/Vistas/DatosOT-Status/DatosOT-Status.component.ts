import { Component, Injectable, ViewChild } from '@angular/core';
import { Reporte_Procesos_OTComponent } from '../Reporte_Procesos_OT/Reporte_Procesos_OT.component';

@Injectable({
  providedIn: 'root'
})


@Component({
  selector: 'app-DatosOT-Status',
  templateUrl: './DatosOT-Status.component.html',
  styleUrls: ['./DatosOT-Status.component.css']
})
export class DatosOTStatusComponent {

  @ViewChild(Reporte_Procesos_OTComponent) Reporte_ProcesosOT : Reporte_Procesos_OTComponent;

  public ArrayDatosProcesos = [];
  public page : number; //Variable que tendrá el paginado de la tabla en la que se muestran los pedidos consultados
  ArrayDatosAgrupados : any [] = [] //variable que va a almacenar todos los agrupados de la OT en el proceso seleccionado

  constructor() { }

}
