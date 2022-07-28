import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-modal-generar-inventario-zeus',
  templateUrl: './modal-generar-inventario-zeus.component.html',
  styleUrls: ['./modal-generar-inventario-zeus.component.css']
})
export class ModalGenerarInventarioZeusComponent implements OnInit {

  public titulosTabla : any = [];
  constructor() { }

  ngOnInit(): void {
    this.ColumnasTabla();
  }

  ColumnasTabla(){
    this.titulosTabla = [{
      invItem : "Item",
      invNombre : "Nombre",
      invStock : "Existencias",
      invPrecio : "Precio",
      invSubtotal : "Subtotal",
      invCliente : "Cliente",
    }]
  }

}
