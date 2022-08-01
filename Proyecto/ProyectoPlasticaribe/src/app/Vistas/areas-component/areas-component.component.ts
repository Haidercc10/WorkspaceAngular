import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { modelAreas } from 'src/app/Modelo/modelAreas';
import { ServicioAreasService } from 'src/app/Servicios/servicio-areas.service';
import Swal from 'sweetalert2';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { EntradaBOPPService } from 'src/app/Servicios/entrada-BOPP.service';

@Component({
  selector: 'app-areas-component',
  templateUrl: './areas-component.component.html',
  styleUrls: ['./areas-component.component.css']
})
export class AreasComponentComponent implements OnInit {

  arrayBOPP = [];

  //Colocar el mismo nombre del formulario de la vista.
  formularioAreas !: FormGroup;
  myControl = new FormControl('');
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions: Observable<string[]>;


  //Instancia el servicio en el contructor, además Inyeccion de dependencias formBuilder.
  constructor(private servicioAreasTS : ServicioAreasService,
                 private frmBuilderAreas : FormBuilder,
                 private bopp : EntradaBOPPService,) {
    this.formularioAreas = this.frmBuilderAreas.group({
      areaId: ['',],
      areaNombre: [, Validators.required],
      areaDescripcion: ['',]
    });
   }

  ngOnInit() {
    this.obtenerBOPP();

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.arrayBOPP.filter(option => option.toLowerCase().includes(filterValue));
  }

  obtenerBOPP(){
    this.bopp.srvObtenerLista().subscribe(datos_bopp => {
      for (let i = 0; i < datos_bopp.length; i++) {
        this.arrayBOPP.push(datos_bopp[i].bopP_Nombre);
      }
    });
  }

  //Metodo para limpiar campos
  limpiarCampos(){
    this.formularioAreas.reset();
  }

  //llamar esta función en formulario reactivo en el ngSubmit en el html.
  // VALIDACION PARA CAMPOS VACIOS
  validarCamposVacios() : any{
    if(this.formularioAreas.valid){
      this.agregar();
      Swal.fire("Los datos se enviaron correctamente");
    }else{
     Swal.fire("¡HAY CAMPOS VACIOS!");
    }
  }

  agregar(){
    const campoArea : modelAreas = {
      /*las variables hacen referencia al modelo de areas y lo que esta entre parentesis
      viene de las propiedades y valores del formulario*/
      area_Id : this.formularioAreas.get('areaCodigo')?.value,
      area_Nombre : this.formularioAreas.get('areaNombre')?.value,
      area_Descripcion : this.formularioAreas.get('areaDescripcion')?.value
    }

    this.servicioAreasTS.srvGuardarArea(campoArea).subscribe(data=>{
      Swal.fire('Registro exitoso'); //Muestra mensaje de confirmación
      this.limpiarCampos(); //Limpia los campos
    }, error =>{
        Swal.fire('Ocurrió un error');
        console.log(error);
    });
  }
}
