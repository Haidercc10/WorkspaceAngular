import { Component, OnInit } from '@angular/core';
import moment from 'moment';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-Dashboard_Costos',
  templateUrl: './Dashboard_Costos.component.html',
  styleUrls: ['./Dashboard_Costos.component.css']
})
export class Dashboard_CostosComponent implements OnInit {

  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que va a almacenar la fecha del dia de hoy
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  cargando : boolean = false;

  constructor(private AppComponent : AppComponent) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
   }

  ngOnInit() {
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number : any) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  tutorial() {

  }
}
