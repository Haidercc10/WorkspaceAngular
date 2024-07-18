import { Component, Injectable, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-Reportes-Consolidados',
  templateUrl: './Reportes-Consolidados.component.html',
  styleUrls: ['./Reportes-Consolidados.component.css']
})
export class ReportesConsolidadosComponent implements OnInit {

  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  modoSeleccionado: boolean = false;
  pedidos : boolean = false;
  inventarioProductos : boolean = false;
  facturacion : boolean = false;
  consolidadoProduccionAreas : boolean = false;
  cartera : boolean = false;
  produccionDetallada : boolean = false;
  facturacionVendedores : boolean = false;
  facturacionItems : boolean = false;
  estadisticasVentas  : boolean = false;

  constructor(private AppComponent : AppComponent,) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.lecturaStorage();
    this.facturacion = true;
    if ([4,85,86,87,88,89,12,95].includes(this.ValidarRol)) this.produccionDetallada = true;
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  //
  cambioTab(event : any) {
    //var index = e.index;
    let tab : any = event.originalEvent.srcElement.innerText;
    //console.log(index);
    tab == `Facturación` ?  this.facturacion = true : this.facturacion = false;
    tab == `Consolidado Producción` ?  this.consolidadoProduccionAreas = true : this.consolidadoProduccionAreas = false;
    tab == `Producción Detallada` ?  this.produccionDetallada = true : this.produccionDetallada = false;
    tab == `Cartera` ?  this.cartera = true : this.cartera = false;
    tab == `Facturación Vendedores` ?  this.facturacionVendedores = true : this.facturacionVendedores = false;
    tab == `Facturación de Items` ?  this.facturacionItems = true : this.facturacionItems = false;
    tab == `Pedidos` ?  this.pedidos = true : this.pedidos = false;
    tab == `Inventario` ?  this.inventarioProductos = true : this.inventarioProductos = false;
    tab == `Estadisticas Ventas` ?  this.estadisticasVentas = true : this.estadisticasVentas = false;
  }

}
