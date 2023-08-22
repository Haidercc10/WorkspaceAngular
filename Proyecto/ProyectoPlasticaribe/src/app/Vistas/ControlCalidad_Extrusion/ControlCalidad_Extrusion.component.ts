import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import moment from 'moment';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-ControlCalidad_Extrusion',
  templateUrl: './ControlCalidad_Extrusion.component.html',
  styleUrls: ['./ControlCalidad_Extrusion.component.css']
})
export class ControlCalidad_ExtrusionComponent implements OnInit {
  
  load : boolean = false;
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  
  FormFiltros !: FormGroup; /** Formulario que contendrá los filtros de búsqueda */
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual

  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente

  registros : any = []; //Array que va a contener los registros de los controles de sellado
  eleccion : any = ["Si", "No"]; //Array que va a contener los registros de los controles de sellado
  tiposBobinas : any = ["TUBULAR", "LÁMINA"]; //Array que va a contener los registros de los controles de sellado

  constructor(private AppComponent : AppComponent) { 
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit() {
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  //
  cargarTablaInicial(){
    let info : any = {
      Ronda : ``,
      OT : ``,
      Maquina : ``,
      Cliente : ``,
      Referencia : ``,
      Rollo : ``,
      Pigmento : ``,
      Ancho : ``,
      PesoMetro : ``,
      AnchoTubular : ``,
      CalMin : ``,
      CalMax : ``,
      CalProm : ``,
      Apariencia : ``,
      Tratado : ``,
      Rasgado : ``,
      TipoBobina : ``,
    }
    this.registros.push(info);
  }


}
