import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { modelRol } from 'src/app/Modelo/modelRol';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-roles-component',
  templateUrl: './roles-component.component.html',
  styleUrls: ['./roles-component.component.css']
})

export class RolesComponentComponent implements OnInit {

  public formularioRoles !: FormGroup;

  constructor(private servicioRolesTS : RolesService, private frmBuilderRoles : FormBuilder) {
    this.formularioRoles = this.frmBuilderRoles.group({
      rolId: ['',],
      rolNombre: [, Validators.required],
      rolDescripcion: ['',],
    });
   }

  ngOnInit(): void { }

  // VALIDACION PARA CAMPOS VACIOS
  validarCamposVacios() : any{
      if(this.formularioRoles.valid){
        Swal.fire("Los datos se enviaron correctamente");
        this.clear();
        this.agregarAreas();

      }else{
        Swal.fire("HAY CAMPOS VACIOS");
      }
  }

  clear() {
    this.formularioRoles.reset();
  }

  agregarAreas(){
    const campoRol : modelRol = {
      RolUsu_Id : this.formularioRoles.get('rolId')?.value,
      RolUsu_Nombre : this.formularioRoles.get('rolNombre')?.value,
      RolUsu_Descripcion : this.formularioRoles.get('rolDescripcion')?.value
    }

    this.servicioRolesTS.srvGuardar(campoRol).subscribe(data=>{
      console.log(data);
      Swal.fire('Registro exitoso');
      this.clear();
    }, error =>{
        Swal.fire('Ocurrió un error');
        console.log(error);
    });
  }

}
