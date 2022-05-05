import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app.Usuario.component',
  templateUrl: './Usuario.component.html',
  styleUrls: ['./Usuario.component.css']
})
export class UsuarioComponent implements OnInit {

  public formularioUsuario !: FormGroup;



  constructor( private frmBuilderUsuario: FormBuilder) {

    this.formularioUsuario = this.frmBuilderUsuario.group({
      identificador: [, Validators.required],
      Codigo: [, Validators.required],
      Nombre: [, Validators.required],
      Direccion: [, Validators.required],
      Telefono: [, Validators.required],
      Email: [, Validators.required],
      TipoIdentificacion_Id: [, Validators.required],
      usuTipo: [, Validators.required],
      Empresa_Id: [, Validators.required],
      Estado_Id: [, Validators.required],
      usuArea: [, Validators.required],
      usuRol: [, Validators.required],
      usuEps: [, Validators.required],
      usuFondoP: [, Validators.required],
      usuCajaComp: [, Validators.required],
    });




  }

  ngOnInit(): void { }

  clear() {
      this.formularioUsuario.reset();

    }

  // VALIDACION PARA CAMPOS VACIOS Y ENVIO DE DATOS
  validarCamposVacios() : any{
      if(this.formularioUsuario.valid){
        Swal.fire("Los datos se enviaron correctamente");
        this.clear();


      }else{
        Swal.fire("HAY CAMPOS VACIOS");
      }
  }



}


