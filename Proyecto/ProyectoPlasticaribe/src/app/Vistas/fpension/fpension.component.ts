import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app.fpension.component',
  templateUrl: './fpension.component.html',
  styleUrls: ['./fpension.component.css']
})
export class FpensionComponent implements OnInit {

  public formularioFpension !: FormGroup;
  constructor( private frmBuilderFpension : FormBuilder) { }


  ngOnInit(): void {
    this.initForms();
  }

  initForms() {
    this.formularioFpension = this.frmBuilderFpension.group({
      areaCodigo: [, Validators.required],
      areaNombre: [, Validators.required],
      areaDireccion: [, Validators.required],
      areaTelefono: [, Validators.required],
      areaEmail: [, Validators.required],
      // areaDescripcion: [, Validators.required],
    });
  }

  // VALIDACION PARA CAMPOS VACIOS
  validarCamposVacios() : any{
      if(this.formularioFpension.valid){
        alert("Los datos se enviaron correctamente");

        this.clear();


      }else{
        Swal.fire("HAY CAMPOS VACIOS");
      }
  }

  clear() {
    console.log("clear clicked")
    this.formularioFpension.reset();
  }

}
