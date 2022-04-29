import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-roles-component',
  templateUrl: './roles-component.component.html',
  styleUrls: ['./roles-component.component.css']
})
export class RolesComponentComponent implements OnInit {

  public formularioRoles !: FormGroup;
  constructor( private frmBuilderRoles : FormBuilder) { }


  ngOnInit(): void {
    this.initForms();
  }

  initForms() {
    this.formularioRoles = this.frmBuilderRoles.group({
      areaCodigo: [, Validators.required],
      areaNombre: [, Validators.required],
      areaDescripcion: [, Validators.required]
    });
  }

  // VALIDACION PARA CAMPOS VACIOS
  validarCamposVacios() : any{
      if(this.formularioRoles.valid){
        Swal.fire("Los datos se enviaron correctamente");

        this.clear();


      }else{
        Swal.fire("HAY CAMPOS VACIOS");
      }
  }

  clear() {
    console.log("clear clicked")
    this.formularioRoles.reset();
  }

}
