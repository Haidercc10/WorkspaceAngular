import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { modelConceptos_Automaticos } from 'src/app/Modelo/modelConceptos_Automaticos';
import { Conceptos_AutomaticosService } from 'src/app/Servicios/Conceptos_Automaticos/Conceptos_Automaticos.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Tipos_ConceptosService } from 'src/app/Servicios/Tipos_Conceptos/Tipos_Conceptos.service';

@Component({
  selector: 'app-Crear_Conceptos',
  templateUrl: './Crear_Conceptos.component.html',
  styleUrls: ['./Crear_Conceptos.component.css']
})
export class Crear_ConceptosComponent implements OnInit {
  formConcepts !: FormGroup //Formulario para crear conceptos.
  conceptTypes : any = []; //Tipos de conceptos.

  constructor(private svcConcepts : Conceptos_AutomaticosService, 
    private formBuilder : FormBuilder, 
    private svcMsjs : MensajesAplicacionService, 
    private svcConceptTypes : Tipos_ConceptosService) { }

  ngOnInit() {
    this.initForm();
    this.getConceptTypes();
  }

  //Función que inicializará el formulario 
  initForm(){
    this.formConcepts = this.formBuilder.group({
      Concept: ['', Validators.required],
      Base : [1145000, Validators.required],
      Percentage : [0, Validators.required],
      conceptType : [1, Validators.required],
    });
  }  
    
  //Función que creará nuevos conceptos automaticos 
  createConcepts(){
    if(this.formConcepts.valid){
      let data : modelConceptos_Automaticos = {
        Concepto: this.formConcepts.value.Concept,
        Base: this.formConcepts.value.Base,
        Porcentaje: this.formConcepts.value.Percentage, 
        TpCcpto_Id: this.formConcepts.value.conceptType,
      }
      this.svcConcepts.postConcepts(data).subscribe(res => {
        this.svcMsjs.mensajeConfirmacion(`Concepto creado correctamente!`);
        this.clearLabels();
      }, error => this.svcMsjs.mensajeError(`No fue posible crear el concepto, verifique!`))
    } else this.svcMsjs.mensajeAdvertencia(`Faltan datos por llenar, por favor verifique!`);
  }

  //Función para limpiar campos
  clearLabels = () => this.formConcepts.reset();

  //Función que cargará los diferentes tipos de conceptos. 
  getConceptTypes = () => this.svcConceptTypes.GetTiposConceptos().subscribe(res => this.conceptTypes = res);
}
