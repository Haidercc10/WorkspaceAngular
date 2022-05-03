import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';


@Component({
  selector: 'app.cajacompensacion.component',
  templateUrl: './cajacompensacion.component.html',
  styleUrls: ['./cajacompensacion.component.css']
})
export class CajacompensacionComponent implements OnInit {

  public formularioCajacompensacion !: FormGroup;
  constructor( private frmBuilderCajacompensacion : FormBuilder) { }


  ngOnInit(): void {
    this.initForms();
  }

  initForms() {
    this.formularioCajacompensacion = this.frmBuilderCajacompensacion.group({
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
      if(this.formularioCajacompensacion.valid){
       Swal.fire("Los datos se enviaron correctamente");

        this.clear();


      }else{
        Swal.fire("HAY CAMPOS VACIOS");
      }
  }

  clear() {
    console.log("clear clicked")
    this.formularioCajacompensacion.reset();
  }

}
