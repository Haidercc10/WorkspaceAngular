import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-Ingreso_Nomina',
  templateUrl: './Ingreso_Nomina.component.html',
  styleUrls: ['./Ingreso_Nomina.component.css']
})
export class Ingreso_NominaComponent implements OnInit {
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  load: boolean = false; //Variable que validará cuando vaya a salir la animacion de carga
  FormNomina !: FormGroup;
  valorTotal : number = 0;
  arrayNomina : any = [];

  constructor(private AppComponent : AppComponent,
                private msj : MensajesAplicacionService,
                  private shepherd : ShepherdService,
                    private frmBuilder : FormBuilder) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;

    this.FormNomina = this.frmBuilder.group({
      fechas : [''],
      valor : [''],
      descripcion : [''],
    });
   }

  ngOnInit() {
  }

  //Función que se encarga de leer la información que se almacena en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  verTutorial(){
  }

  cargarTabla() {
    let fechaInicial : any;
    let fechaFinal : any;

    let info : any = {
      fecha1 : fechaInicial,
      fecha2 : fechaInicial,
      valor : this.FormNomina.value.valor,
      descripcion : this.FormNomina.value.descripcion
    }

    this.arrayNomina.push(info);
  }

}
