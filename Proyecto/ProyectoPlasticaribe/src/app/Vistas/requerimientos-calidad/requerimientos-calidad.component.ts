import { Component, Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import moment from 'moment';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { fails } from '../Crear_Fallas/Crear_Fallas.component';
import { AppComponent } from 'src/app/app.component';
import { RequerimientosCalidadService } from 'src/app/Servicios/Requerimientos_Calidad/requerimientos-calidad.service';
import { modelRequerimientos_Calidad } from 'src/app/Modelo/modelRequerimientos_Calidad';
import { DevolucionesCalidadComponent } from '../devoluciones-calidad/devoluciones-calidad.component';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-requerimientos-calidad',
  templateUrl: './requerimientos-calidad.component.html',
  styleUrls: ['./requerimientos-calidad.component.css']
})
export class RequerimientosCalidadComponent {
  form !: FormGroup; //Variable que se usará para validar el formulario 
  load : boolean = false; //Variable para mostrar el cargando mientras se crea el requerimiento
  typeReqs : any = []; //Variable para almacenar los tipos de requerimientos y mostrarlos en el select
  selectedMode : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private frmBuild : FormBuilder, 
    private AppComponent : AppComponent, 
    private svMsjs : MensajesAplicacionService, 
    private svReqs : RequerimientosCalidadService, 
    private cmpDevQuality : DevolucionesCalidadComponent,
  ) {
      this.selectedMode = this.AppComponent.temaSeleccionado;
      this.loadForm();
  }

  ngOnInit() {
  }

  //Función para cargar formulario
  loadForm(){
    this.form = this.frmBuild.group({
      req : [null, Validators.required],
      description : [null, Validators.required],
    });
  }

  //Función para crear fallas tecnicas
  createReqs(){
    if(this.form.valid) {
      this.load = true;
      let info : modelRequerimientos_Calidad = {
        Req_Nombre: this.form.value.req,
        Req_Descripcion: this.form.value.description,
        Req_FechaCreacion: moment().format('YYYY-MM-DD'),
        Req_HoraCreacion: moment().format('HH:mm:ss'),
      }
      this.svReqs.Post(info).subscribe(data => {
        this.svMsjs.mensajeConfirmacion('Requerimiento creado correctamente!');
        this.load = false;
        this.cmpDevQuality.modalReqs = false;
        this.cmpDevQuality.getRequirements(); 
        setTimeout(() => { this.form.reset(); }, 2000);
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
