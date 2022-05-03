import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app.pedidomateriaprima.component',
  templateUrl: './pedidomateriaprima.component.html',
  styleUrls: ['./Pedidomateriaprima.component.css']
})
export class PedidomateriaprimaComponent implements OnInit {

  public formularioPedidomateriaprima !: FormGroup;
  constructor( private frmBuilderEps : FormBuilder) { }


  ngOnInit(): void {
    this.initForms();
  }

  initForms() {
    this.formularioPedidomateriaprima = this.frmBuilderEps.group({
      IDDetallePedido: [, Validators.required],
      IDUsuario: [, Validators.required],
      Nombre: [, Validators.required],
      NombreArea: [, Validators.required],
      Descripcion: [, Validators.required],
      Stock: [, Validators.required],
      Cantidad: [, Validators.required],
      ID: [, Validators.required],
      Turno: [, Validators.required],
      SedeCliente: [, Validators.required],
      NombreCliente: [, Validators.required],
      IDCliente: [, Validators.required],


    });
  }

  // VALIDACION PARA CAMPOS VACIOS
  validarCamposVacios() : any{
      if(this.formularioPedidomateriaprima.valid){
        Swal.fire("Los datos se enviaron correctamente");

        this.clear();


      }else{
        Swal.fire("HAY CAMPOS VACIOS");
      }
  }

  clear() {
    console.log("clear clicked")
    this.formularioPedidomateriaprima.reset();
  }

}
