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
  calidad : boolean = false;

  constructor(private AppComponent : AppComponent,) { }

  ngOnInit() {
    this.lecturaStorage();
    if ([1,60,12,94,85,2,98,5].includes(this.ValidarRol)) this.ordenTrabajo = true;
    if ([3,12,85].includes(this.ValidarRol)) this.materiaPrima = true;
    if ([61,12,85,97,10].includes(this.ValidarRol)) this.pedidos = true;
    if (this.ValidarRol == 69) this.recaudos = true;
    if ([1,12,94,85,98,5].includes(this.ValidarRol)) this.inventarioAreas = true;
    if ([1,5].includes(this.ValidarRol)) this.calidad = true;
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
    this.calidad = false;
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
    index == 1 && [1,12,60,98].includes(this.ValidarRol) ? this.facturacion = true : this.facturacion = false;
    index == 2 ? this.materiaPrima = true : this.materiaPrima = false;
    index == 3 ? this.pedidos = true : this.pedidos = false;
    index == 4 ? this.facturacionVendedores = true : this.facturacionVendedores = false;
    index == 5 ? this.recaudos = true : this.recaudos = false;
    index == 6 ? this.cuentasPagar = true : this.cuentasPagar = false;
    index == 7 ? this.gerencia = true : this.gerencia = false;
    index == 8 ? this.costos = true : this.costos = false;
    index == 9 ? this.compras = true : this.compras = false;
    index == 10 ? this.inventarioAreas = true : this.inventarioAreas = false;
    //index == 1 && this.ValidarRol == 12 ? this.facturacion = true : null;
    index == 0 && [12,96,10].includes(this.ValidarRol) ? this.facturacion = true : null;
    index == 1 && [12,96,2,10].includes(this.ValidarRol) ? this.pedidos = true : null;
    //index == 2 && this.ValidarRol == 12 ? this.materiaPrima = true : null;
    //index == 3 && this.ValidarRol == 12 ? this.pedidos = true : null;
    index == 0 && [94,2].includes(this.ValidarRol) ? this.ordenTrabajo = true : null;
    index == 1 && [5].includes(this.ValidarRol) ? this.gerencia = true : null;
    index == 2 && [5].includes(this.ValidarRol) ? this.inventarioAreas = true : null;
    index == 1 && [94].includes(this.ValidarRol) ? this.inventarioAreas = true : null;
    index == 1 && [85].includes(this.ValidarRol) ? this.materiaPrima = true : null;
    index == 2 && [85,].includes(this.ValidarRol) ? this.pedidos = true : null;
    index == 3 && [85].includes(this.ValidarRol) ? this.inventarioAreas = true : null;
    index == 2 && [97,10].includes(this.ValidarRol) ? this.gerencia = true : null;
    index == 2 && [2].includes(this.ValidarRol) ? this.facturacionVendedores = true : null;
    index == 4 && [98].includes(this.ValidarRol) ? this.inventarioAreas = true : null;
    index == 11 ? this.calidad = true : null;
  }
}
