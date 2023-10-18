import { Component, Injectable, OnDestroy, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';

@Injectable({  providedIn: 'root' })

@Component({
  selector: 'app-PaginaPrincipal',
  templateUrl: './PaginaPrincipal.component.html',
  styleUrls: ['./PaginaPrincipal.component.css']
})

export class PaginaPrincipalComponent implements OnInit, OnDestroy {

  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  ordenTrabajo : boolean = false;
  facturacion : boolean = false;
  materiaPrima : boolean = false;
  pedidos: boolean = false;
  facturacionVendedores : boolean = false;
  recaudos : boolean = false;
  cuentasPagar : boolean = false;
  gerencia : boolean = false;
  costos : boolean = false;
  compras : boolean = false;
  inventarioAreas : boolean = false;

  constructor(private AppComponent : AppComponent,) { }

  ngOnInit() {
    this.lecturaStorage();
    if (this.ValidarRol == 1 || this.ValidarRol == 60) this.ordenTrabajo = true;
    if (this.ValidarRol == 3) this.materiaPrima = true;
    if (this.ValidarRol == 61) this.pedidos = true;
    if (this.ValidarRol == 69) this.recaudos = true;
  }

  ngOnDestroy(): void {
    this.ordenTrabajo = false;
    this.facturacion = false;
    this.materiaPrima = false;
    this.pedidos= false;
    this.facturacionVendedores = false;
    this.recaudos = false;
    this.cuentasPagar = false;
    this.gerencia = false;
    this.costos = false;
    this.compras = false;
    this.inventarioAreas = false;
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  //
  cambioTab(e : any) {
    var index = e.index;
    index == 0 ? this.ordenTrabajo = true : this.ordenTrabajo = false;
    index == 1 ?  this.facturacion = true : this.facturacion = false;
    index == 2 ?  this.materiaPrima = true : this.materiaPrima = false;
    index == 3 ?  this.pedidos = true : this.pedidos = false;
    index == 4 ?  this.facturacionVendedores = true : this.facturacionVendedores = false;
    index == 5 ?  this.recaudos = true : this.recaudos = false;
    index == 6 ?  this.cuentasPagar = true : this.cuentasPagar = false;
    index == 7 ?  this.gerencia = true : this.gerencia = false;
    index == 8 ?  this.costos = true : this.costos = false;
    index == 9 ?  this.compras = true : this.compras = false;
    index == 10 ?  this.inventarioAreas = true : this.inventarioAreas = false;
  }
}
