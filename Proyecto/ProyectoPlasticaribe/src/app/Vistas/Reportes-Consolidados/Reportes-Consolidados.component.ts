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
    if ([7,8,9,62,63].includes(this.ValidarRol)) this.produccionDetallada = true;
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  //
  cambioTab(e : any) {
    var index = e.index;
    index == 0 ?  this.facturacion = true : this.facturacion = false;
    index == 1 ?  this.consolidadoProduccionAreas = true : this.consolidadoProduccionAreas = false;
    index == 2 ?  this.produccionDetallada = true : this.produccionDetallada = false;
    index == 3 ?  this.cartera = true : this.cartera = false;
    index == 4 ?  this.facturacionVendedores = true : this.facturacionVendedores = false;
    index == 5 ?  this.facturacionItems = true : this.facturacionItems = false;
    index == 6 ?  this.pedidos = true : this.pedidos = false;
    index == 7 ?  this.inventarioProductos = true : this.inventarioProductos = false;
    index == 8 ?  this.estadisticasVentas = true : this.estadisticasVentas = false;
  }

}
