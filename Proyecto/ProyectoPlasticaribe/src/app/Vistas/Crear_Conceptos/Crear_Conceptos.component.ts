import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { modelConceptos_Automaticos } from 'src/app/Modelo/modelConceptos_Automaticos';
import { Conceptos_AutomaticosService } from 'src/app/Servicios/Conceptos_Automaticos/Conceptos_Automaticos.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';

@Component({
  selector: 'app-Crear_Conceptos',
  templateUrl: './Crear_Conceptos.component.html',
  styleUrls: ['./Crear_Conceptos.component.css']
})
export class Crear_ConceptosComponent implements OnInit {
  formConcepts !: FormGroup //Formulario para crear conceptos.

  constructor(private svcConcepts : Conceptos_AutomaticosService, 
    private formBuilder : FormBuilder, 
    private svcMsjs : MensajesAplicacionService) { }

  ngOnInit() {
    this.initForm();
  }

  //Función que inicializará el formulario 
  initForm(){
    this.formConcepts = this.formBuilder.group({
      Concept: ['', Validators.required],
      Base : [1145000, Validators.required],
      Percentage : [0, Validators.required],
    });
  }  
    
  //Función que creará nuevos conceptos automaticos 
  createConcepts(){
    if(this.formConcepts.valid){
      let data : modelConceptos_Automaticos = {
        Concepto: this.formConcepts.value.Concept,
        Base: this.formConcepts.value.Base,
        Porcentaje: this.formConcepts.value.Percentage
      }
      this.svcConcepts.postConcepts(data).subscribe(res => {
        this.svcMsjs.mensajeConfirmacion(`Concepto creado correctamente!`);
        this.clearLabels();
      }, error => this.svcMsjs.mensajeError(`No fue posible crear el concepto, verifique!`))
    } else this.svcMsjs.mensajeAdvertencia(`Faltan datos por llenar, por favor verifique!`);
  }

  //Función para limpiar campos
  clearLabels = () => this.formConcepts.reset();
}
