import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ServicioAreasService } from 'src/app/Servicios/servicio-areas.service';

@Component({
  selector: 'app-areas-component',
  templateUrl: './areas-component.component.html',
  styleUrls: ['./areas-component.component.css']
})
export class AreasComponentComponent implements OnInit {

  //principal$!:Observable<any[]>

  constructor(private servicioAreasTS : ServicioAreasService, private frmBuilderAreas : FormBuilder) { }

  //Agregar input areas
  @Input() areas: any;
  areaCodigo: number | String= "";
  areaNombre: String="";
  areaDescripcion:  String="";

  ngOnInit(): void {

  }

    //Formularios Reactivos
    formularioAreas = this.frmBuilderAreas.group({
      areaCodigo : ['', Validators.required, Validators.minLength(6), Validators.maxLength(10)],
      areaNombre : ['', Validators.required, Validators.minLength(3), Validators.maxLength(50)],
      areaDescripcion : ['', Validators.required, Validators.minLength(1), Validators.maxLength(200)]

    })

    agregarAreas2(){

    }

  //Función para agregar areas.
  agregarAreas(){
    var camposAreas = {
       area_Codigo : this.areaCodigo,
       area_Nombre : this.areaNombre,
       area_Descripcion : this.areaDescripcion
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
    alert('Hola');
  }

  validarCamposVacios(){

    if(this.areaCodigo == null && this.areaNombre == null && this.areaDescripcion == null) {
      alert('Debe llenar los campos vacios');
    } else {
      alert('Todo esta OK');
    }
  }

  //Metodo para limpiar campos
  limpiarCampos(){
    //alert(this.areaCodigo + " " + this.areaNombre + " " + this.areaDescripcion);
    this.areaCodigo = "";
    this.areaNombre = "";
    this.areaDescripcion = "";
  }




}



