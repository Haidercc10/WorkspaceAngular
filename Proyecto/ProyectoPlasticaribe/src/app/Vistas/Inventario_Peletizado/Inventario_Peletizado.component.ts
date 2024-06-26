import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { Ingreso_PeletizadoService } from 'src/app/Servicios/Ingreso_Peletizado/Ingreso_Peletizado.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-Inventario_Peletizado',
  templateUrl: './Inventario_Peletizado.component.html',
  styleUrls: ['./Inventario_Peletizado.component.css']
})
export class Inventario_PeletizadoComponent implements OnInit {
  load : boolean = false;
  recoveries : any = [];
  peletizados : any = [];
  detailsPele : any = [];
  modoSeleccionado: boolean = false;
  @ViewChild('tableRecoveries') tableRecoveries: Table | undefined;
  @ViewChild('tablePeletizados') tablePeletizados: Table | undefined;
  @ViewChild('tableDetails') tableDetails: Table | undefined;
  

  constructor(
    private AppComponent : AppComponent, 
    private svIngPele : Ingreso_PeletizadoService, 
    private svMatPrima : MateriaPrimaService,
    private msj : MensajesAplicacionService,
  ) { 
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.inventoryPeletizados();
    this.inventoryMaterialRecovery();
  }

  inventoryMaterialRecovery(){
    this.load = true;
    this.recoveries = [];

    this.svMatPrima.getPeletizados().subscribe(data => { this.recoveries = data; }, error => {
      this.msj.mensajeError(`Error`, `Error al consultar los materiales recuperados | ${error.status} ${error.statusText}`);
      this.load = false;
    })
  }

  inventoryPeletizados(){
    this.peletizados = [];

    this.svIngPele.getStockPele_Grouped().subscribe(data => { 
      data.details = [];
      this.peletizados = data; 
      this.load = false;
    }, error => {
      this.msj.mensajeError(`Error`, `Error al consultar información de la bodega de peletizados | ${error.status} ${error.statusText}`);
      this.load = false;
    });
  }

  loadDetailsPeletizados(data : any){
    this.svIngPele.getStockPele_Details(data.id_MatPrima).subscribe(dataPele => {
      let index : number = this.peletizados.findIndex(x => x.id_MatPrima == data.id_MatPrima);
      this.peletizados[index].details = dataPele;
    }, error => {
      this.msj.mensajeError(`Error`, `Error al consultar información de los detalles del material ${data.matPrima} | ${error.status} ${error.statusText}`);
    });
  }

  applyFilter = ($event, campo : any, table : any) => table!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  totalQtyPele = () => this.peletizados.reduce((a, b) => a += b.ing.ingPel_Cantidad, 0);

  totalQtyRecoveries = () => this.peletizados.reduce((a, b) => a += b.ing.ingPel_Cantidad, 0);

  totalQtyStock = (data) => data._value.reduce((a, b) => a += b.stock, 0);

  totalPrice = (data) => data._value.reduce((a, b) => a += b.subtotal, 0);

  exportPDF(){}

}

