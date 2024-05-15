import { Component, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { FallasTecnicasService } from 'src/app/Servicios/FallasTecnicas/FallasTecnicas.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { TpFallasTecnicasService } from 'src/app/Servicios/TipoFallasTecnicas/TpFallasTecnicas.service';
import { AppComponent } from 'src/app/app.component';
import { EliminarRollos_ProduccionComponent } from '../EliminarRollos_Produccion/EliminarRollos_Produccion.component';
import { Devolucion_OrdenFacturacionComponent } from '../Devolucion_OrdenFacturacion/Devolucion_OrdenFacturacion.component';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-Crear_Fallas',
  templateUrl: './Crear_Fallas.component.html',
  styleUrls: ['./Crear_Fallas.component.css']
})
export class Crear_FallasComponent implements OnInit {

  form !: FormGroup; //Variable que se usará para validar el formulario 
  load : boolean = false;
  typeFails : any = [];
  selectedMode : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private frmBuild : FormBuilder, 
    private AppComponent : AppComponent, 
    private svMsjs : MensajesAplicacionService, 
    private svTypeFails : TpFallasTecnicasService, 
    private svTechnicalFails : FallasTecnicasService, 
    private cmDeleteRolls : EliminarRollos_ProduccionComponent, 
    private cmpDevolutionItems : Devolucion_OrdenFacturacionComponent) {
      this.selectedMode = this.AppComponent.temaSeleccionado;
      this.loadForm();
  }

  ngOnInit() {
    this.getTypeFails();
  }

  //Función para cargar formulario
  loadForm(){
    this.form = this.frmBuild.group({
      fail : [null, Validators.required],
      description : [null, Validators.required],
      typeFail : [null, Validators.required],
    });
  }

  //Función para obtener los tipos de fallas
  getTypeFails() {
    this.svTypeFails.GetTodo().subscribe(data => { 
      this.typeFails = data;
      this.typeFails.sort((a, b) => Number(b.tipoFalla_Id) - Number(a.tipoFalla_Id)); 
    }, error => {  });
  } 

  //Función para crear fallas tecnicas
  createFail(){
    if(this.form.valid) {
      this.load = true;
      let fail : fails = {
        Falla_Id : 0,
        Falla_Nombre: this.form.value.fail,
        Falla_Descripcion: this.form.value.description,
        TipoFalla_Id: this.form.value.typeFail,
        Fecha_Creacion: moment().format('YYYY-MM-DD'),
        Hora_Creacion: moment().format('HH:mm:ss'),
      }
      this.svTechnicalFails.Post(fail).subscribe(data => {
        this.svMsjs.mensajeConfirmacion('Falla creada correctamente!');
        this.load = false;
        this.cmDeleteRolls.modalFails = false;
        this.cmDeleteRolls.getFails();
        this.cmpDevolutionItems.modalFails = false;
        this.cmpDevolutionItems.getFails(); 
      }, error => {
        this.svMsjs.mensajeError(`Error`, `Ha ocurrido un error, por favor verifique!`);
        this.load = false;
      });
    } else this.svMsjs.mensajeAdvertencia(`Advertencia`, `Debe diligenciar todos los campos!`);
  }

  clearLabels = () => this.form.reset();    

  //Función para cargar la información del nombre en la descripción
  loadDescription(){
    let fail : any = this.form.value.fail;
    this.form.patchValue({ 'description' : fail, });
  }

  
}

export interface fails {
  Falla_Id? : number;
  Falla_Nombre : string;
  Falla_Descripcion : string;
  TipoFalla_Id : number;
  Fecha_Creacion : any;
  Hora_Creacion : string;
}
