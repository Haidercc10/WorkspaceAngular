import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app.usuario.component',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent implements OnInit {

  public formularioUsuario !: FormGroup;
  constructor( private frmBuilderUsuario : FormBuilder) { }


  ngOnInit(): void {
    this.initForms();
  }


initForms() {
  this.formularioUsuario= this.frmBuilderUsuario.group({

    Id: [,Validators.required],
    Nombre: [,Validators.required],
    Correo: [,Validators.required],
    Telefono: [,Validators.required],
    Direccion: [,Validators.required],

  });
}

// VALIDACION PARA CAMPOS VACIOS
validarCamposVacios() : any{
    if(this.formularioUsuario.valid){
      Swal.fire("Los datos se enviaron correctamente");
      this.clear();


    }

    else{
      Swal.fire("HAY CAMPOS VACIOS");
    }
}

clear() {
  console.log("clear clicked")
  this.formularioUsuario.reset();
}

}

