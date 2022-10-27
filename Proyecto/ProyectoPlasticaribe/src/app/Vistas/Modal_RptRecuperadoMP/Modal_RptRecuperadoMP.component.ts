import { Component, Injectable, OnInit } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-Modal_RptRecuperadoMP',
  templateUrl: './Modal_RptRecuperadoMP.component.html',
  styleUrls: ['./Modal_RptRecuperadoMP.component.css']
})
export class Modal_RptRecuperadoMPComponent implements OnInit {

  public titulosTabla = [];
  constructor() { }

  ngOnInit() {
    this.columnasTablaDatos();
  }


  columnasTablaDatos() {

    this.titulosTabla = []

    let info : any = {
      OT : "OT",
      MP : "Mat. Prima",
      FechaAsgMP : "Fecha Asignación",
      Usuario : "Usuario",
      CantidadAsg : "Cantidad",
    }

    this.titulosTabla.push(info);
  }

}
