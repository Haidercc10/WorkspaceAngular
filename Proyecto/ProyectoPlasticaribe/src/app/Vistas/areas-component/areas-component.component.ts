import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { modelAreas } from 'src/app/Modelo/modelAreas';
import { ServicioAreasService } from 'src/app/Servicios/servicio-areas.service';

@Component({
  selector: 'app-areas-component',
  templateUrl: './areas-component.component.html',
  styleUrls: ['./areas-component.component.css']
})
export class AreasComponentComponent implements OnInit {

  //Colocar el mismo nombre del formulario de la vista.
   formularioAreas : FormGroup;

  //Instancia el servicio en el contructor, además Inyeccion de dependencias formBuilder.
  constructor(private servicioAreasTS : ServicioAreasService, private frmBuilderAreas : FormBuilder) {

    //Formulario reactivo de áreas
    this.formularioAreas = this.frmBuilderAreas.group({
      //valores bindeados/igualados formulario.
      areaCodigo :      ['', [Validators.required, Validators.minLength(6), Validators.maxLength(10)]],
      areaNombre :      ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      areaDescripcion : ['', ], // campo No requerido - *opcional
    })
  }

  //Agregar input areas
  /*
  @Input() areas: any;
  areaCodigo: number | String= "";
  areaNombre: String="";
  areaDescripcion:  String="";*/

  ngOnInit(): void {

  }

  //llamar esta función en formulario reactivo en el ngSubmit en el html.
    agregarAreas2(){
      const campoArea : modelAreas = {
        /*las variables hacen referencia al modelo de areas y lo que esta entre parentesis
        viene de las propiedades y valores del formulario*/
        area_Codigo : this.formularioAreas.get('areaCodigo')?.value,
        area_Nombre : this.formularioAreas.get('areaNombre')?.value,
        area_Descripcion : this.formularioAreas.get('areaDescripcion')?.value
     }
     this.servicioAreasTS.srvGuardarArea(campoArea).subscribe(data=>{
     console.log(data)
     this.alerta(); //Muestra mensaje de confirmación
     this.limpiarCampos(); //Limpia los campos
     }, error =>{
       alert('Ocurrió un error')
       console.log(error);
     })
    }


  agregarAreas(){
    var camposAreas = {
      /* area_Codigo : this.areaCodigo,
       area_Nombre : this.areaNombre,
       area_Descripcion : this.areaDescripcion*/
    }
    this.servicioAreasTS.srvAgregarAreas(camposAreas).subscribe(data=>{
      console.log(data);
    }, error => {
      console.log(error);
    }
  )
  }

  //Probando alerta
  alerta(){
    alert('Área registrada con exito')
  }

  validarCamposVacios(){
    let codigoArea = document.getElementById("Codigo");
    let nombreArea = document.getElementById("Nombre")
    let descripcionArea = document.getElementById("Descripcion")

    if((codigoArea == null)  && (nombreArea == null)  && (descripcionArea == null)) {
      alert('Debe llenar los campos vacios');
    } else {
      alert('Todo esta OK');
      this.limpiarCampos();
    }
  }

  //Metodo para limpiar campos
  limpiarCampos(){
    this.formularioAreas.reset();

  }

  validarCamposSinValor(): any{
    if(this.formularioAreas.valid){
      alert('Hola')

    }else{
      alert('OK')
    }

  }






}



