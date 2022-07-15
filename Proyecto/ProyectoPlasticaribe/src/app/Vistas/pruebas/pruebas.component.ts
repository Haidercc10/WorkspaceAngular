import { Component, OnInit } from '@angular/core';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import { InventarioArticuloZeusService } from 'src/app/Servicios/inventarioArticuloZeus.service';

@Component({
  selector: 'app-pruebas',
  templateUrl: './pruebas.component.html',
  styleUrls: ['./pruebas.component.css']
})
export class PruebasComponent implements OnInit {

  public ModalCrearProveedor: boolean = false;
  items = [];
  articulos = [];

  constructor() { }

  ngOnInit() {

  }

  LlamarModalCrearProveedor() {
    this.ModalCrearProveedor = true;
  }

}
