import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { Reporte_Procesos_OTComponent } from '../Reporte_Procesos_OT/Reporte_Procesos_OT.component';

@Injectable({
  providedIn: 'root'
})


@Component({
  selector: 'app-DatosOT-Status',
  templateUrl: './DatosOT-Status.component.html',
  styleUrls: ['./DatosOT-Status.component.css']
})
export class DatosOTStatusComponent implements OnInit {

  @ViewChild(Reporte_Procesos_OTComponent) Reporte_ProcesosOT : Reporte_Procesos_OTComponent;

  public ArrayDatosProcesos = [];
  constructor() { }

  ngOnInit() {
  }


  cargarDatosTablaProcesos(){

  }

}
