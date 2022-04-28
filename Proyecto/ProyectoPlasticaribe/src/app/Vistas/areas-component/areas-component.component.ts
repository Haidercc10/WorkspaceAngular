import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { modelAreas } from 'src/app/Modelo/modelAreas';
import { ServicioAreasService } from 'src/app/Servicios/servicio-areas.service';

@Component({
  selector: 'app-areas-component',
  templateUrl: './areas-component.component.html',
  styleUrls: ['./areas-component.component.css']
})
export class AreasComponentComponent implements OnInit {

  //Colocar el mismo nombre del formulario de la vista.
  formularioAreas !: FormGroup;

  //Instancia el servicio en el contructor, además Inyeccion de dependencias formBuilder.
  constructor(private servicioAreasTS : ServicioAreasService, private frmBuilderAreas : FormBuilder) { 
    this.formularioAreas = this.frmBuilderAreas.group({
      areaCodigo: [, Validators.required],
      areaNombre: [, Validators.required],
      areaDescripcion: ['',]
    });
   }
   
  ngOnInit() { }

  //Metodo para limpiar campos
  limpiarCampos(){
    this.formularioAreas.reset();
  }
  
  //llamar esta función en formulario reactivo en el ngSubmit en el html.
  // VALIDACION PARA CAMPOS VACIOS
  validarCamposVacios() : any{
    if(this.formularioAreas.valid){
      alert("Los datos se enviaron correctamente");
      this.agregarAreas();
    }else{
     alert("¡HAY CAMPOS VACIOS!");
    }
  }


  agregarAreas(){
    const campoArea : modelAreas = {
      /*las variables hacen referencia al modelo de areas y lo que esta entre parentesis
      viene de las propiedades y valores del formulario*/
      area_Codigo : this.formularioAreas.get('areaCodigo')?.value,
      area_Nombre : this.formularioAreas.get('areaNombre')?.value,
      area_Descripcion : this.formularioAreas.get('areaDescripcion')?.value
    }

    this.servicioAreasTS.srvGuardarArea(campoArea).subscribe(data=>{
    console.log(data);
    alert('Registro exitoso con exito'); //Muestra mensaje de confirmación
    this.limpiarCampos(); //Limpia los campos
    }, error =>{
        alert('Ocurrió un error');
        console.log(error);
    });
  }
}
 