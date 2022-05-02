import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app.ocompra.component',
  templateUrl: './ocompra.component.html',
  styleUrls: ['./ocompra.component.css']
})
export class OcompraComponent implements OnInit {

  public formularioOcompra !: FormGroup;
  constructor( private frmBuilderOcompra : FormBuilder) { }


  ngOnInit(): void {
    this.initForms();
  }

  initForms() {
    this.formularioOcompra = this.frmBuilderOcompra.group({
      Codigo: [, Validators.required],
      Nombre: [, Validators.required],
      CantidadM: [, Validators.required],
      NombreM: [, Validators.required],
      ID: [, Validators.required],
      Stock: [, Validators.required],
      Cantidad: [, Validators.required],
      IDUsuario: [, Validators.required],
      Usuario: [, Validators.required],
      NombreProveedor: [, Validators.required],
      IDProveedor: [, Validators.required],


      // areaDescripcion: [, Validators.required],
    });
  }

  // VALIDACION PARA CAMPOS VACIOS
  validarCamposVacios() : any{
      if(this.formularioOcompra.valid){
        Swal.fire("Los datos se enviaron correctamente");

        this.clear();


      }else{
        Swal.fire("HAY CAMPOS VACIOS");
      }
  }

  clear() {
    console.log("clear clicked")
    this.formularioOcompra.reset();
  }

}

