import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app.eps.component',
  templateUrl: './eps.component.html',
  styleUrls: ['./eps.component.css']
})
export class EpsComponent implements OnInit {

  public formularioEps !: FormGroup;
  constructor( private frmBuilderEps : FormBuilder) { }


  ngOnInit(): void {
    this.initForms();
  }

  initForms() {
    this.formularioEps = this.frmBuilderEps.group({
      Codigo: [, Validators.required],
      Nombre: [, Validators.required],
      Direccion: [, Validators.required],
      Telefono: [, Validators.required],
      Email: [, Validators.required],

      // areaDescripcion: [, Validators.required],
    });
  }

  // VALIDACION PARA CAMPOS VACIOS
  validarCamposVacios() : any{
      if(this.formularioEps.valid){
        Swal.fire("Los datos se enviaron correctamente");

        this.clear();


      }else{
        Swal.fire("HAY CAMPOS VACIOS");
      }
  }

  clear() {
    console.log("clear clicked")
    this.formularioEps.reset();
  }

}
