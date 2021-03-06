import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app.opedido.component',
  templateUrl: './opedido.component.html',
  styleUrls: ['./opedido.component.css']
})
export class OpedidoComponent implements OnInit {

  public formularioOpedido !: FormGroup;
  constructor( private frmBuilderOpedido : FormBuilder) { }


  ngOnInit(): void {
    this.initForms();
  }


initForms() {
  this.formularioOpedido= this.frmBuilderOpedido.group({


    OpedidoCodigo: [, Validators.required],
    OpedidoDescripcion: [, Validators.required],

    // areaDescripcion: [, Validators.required],
  });
}

// VALIDACION PARA CAMPOS VACIOS
validarCamposVacios() : any{
    if(this.formularioOpedido.valid){
      Swal.fire("Los datos se enviaron correctamente");

      this.clear();


    }

    else{
      Swal.fire("HAY CAMPOS VACIOS");
    }
}

clear() {
  console.log("clear clicked")
  this.formularioOpedido.reset();
}

}
