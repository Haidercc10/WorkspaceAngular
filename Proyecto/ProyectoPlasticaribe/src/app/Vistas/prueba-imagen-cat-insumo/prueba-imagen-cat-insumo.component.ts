import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import { ControlCalidad_CorteDobladoService } from 'src/app/Servicios/ControlCalidad_CorteDoblado/ControlCalidad_CorteDoblado.service';
import { ControlCalidad_ImpresionService } from 'src/app/Servicios/ControlCalidad_Impresion/ControlCalidad_Impresion.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, CertificadoCalidad as defaultSteps } from 'src/app/data';

@Component({
  selector: 'app-prueba-imagen-cat-insumo',
  templateUrl: './prueba-imagen-cat-insumo.component.html',
  styleUrls: ['./prueba-imagen-cat-insumo.component.css']
})

export class PruebaImagenCatInsumoComponent implements OnInit {

  cargando : boolean = false;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  datosControlCal_Extrusion : any [] = []; //Variable que va a almacenar los datos del control de calidad del area de extrusion

  constructor(private frmBuilder : FormBuilder,
                private AppComponent : AppComponent,
                  private msj : MensajesAplicacionService,
                    private shepherdService: ShepherdService,
                      private controlDbl : ControlCalidad_CorteDobladoService,
                        private controlImp : ControlCalidad_ImpresionService,) {}

  ngOnInit(): void {
    this.lecturaStorage();
  }

  tutorial() {
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que va añadir una fila mas a la tabla, para que pueda ser agregado un dato
  AgregarFila = () => this.datosControlCal_Extrusion.push({});

  // Fucion que va a consultar los datos de los controles de calidad del area de extrusión
  ConsultarDatosControlCal_Extrusion() {
  }

  // Fucion que va a consultar los datos de los controles de calidad del area de impresión
  ConsultarDatosControlCal_Impresion() {
  }

  // Fucion que va a consultar los datos de los controles de calidad del area de doblado y corte
  ConsultarDatosControlCal_DobladoCorte() {
  }

  // Fucion que va a consultar los datos de los controles de calidad del area de sellado
  ConsultarDatosControlCal_Sellado() {
  }

}