import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app.opedidoproducto.component',
  templateUrl: './opedidoproducto.component.html',
  styleUrls: ['./opedidoproducto.component.css']
})
export class OpedidoproductoComponent implements OnInit {

  public formularioOpedidoproducto !: FormGroup;
  constructor( private frmBuilderOpedidoproducto : FormBuilder) { }


  ngOnInit(): void {
    this.initForms();
  }

  initForms() {
    this.formularioOpedidoproducto = this.frmBuilderOpedidoproducto.group({
      Fuelle: [, Validators.required],
      Calibre: [, Validators.required],
      Cantidad: [, Validators.required],
      PrecioUnidad: [, Validators.required],
      Stock: [, Validators.required],
      Ancho: [, Validators.required],
      Nombre: [, Validators.required],

    });
  }

  // VALIDACION PARA CAMPOS VACIOS
  validarCamposVacios() : any{
      if(this.formularioOpedidoproducto.valid){
        Swal.fire("Los datos se enviaron correctamente");

        this.clear();


      }else{
        Swal.fire("HAY CAMPOS VACIOS");
      }
  }

  clear() {
    console.log("clear clicked")
    this.formularioOpedidoproducto.reset();
  }

}

