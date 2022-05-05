import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-clientes',
  templateUrl: './crear-clientes.component.html',
  styleUrls: ['./crear-clientes.component.css']
})
export class ClientesComponent implements OnInit {

  public FormCrearClientes : FormGroup;

  constructor(private formBuilderCrearClientes : FormBuilder) {

    this.FormCrearClientes = this.formBuilderCrearClientes.group({
      CliId: new FormControl,
      TipoIdCliente: new FormControl,
      CliNombre:  new FormControl,
      CliDireccion:  new FormControl,
      CliTelefono:  new FormControl,
      CliEmail:  new FormControl,
      TipoClienteId: new FormControl,
      UsuIdNombre: new FormControl
    })

   }

  ngOnInit(): void {

  }

  initFormsCrearClientes(){
    this.FormCrearClientes = this.formBuilderCrearClientes.group({
       CliId: ['', Validators.required],
       TipoIdCliente: ['', Validators.required],
       CliNombre: ['', Validators.required],
       CliDireccion: ['', Validators.required],
       CliTelefono: ['', Validators.required],
       CliEmail: ['', Validators.required],
       TipoClienteId: ['', Validators.required],
       UsuIdNombre: ['', Validators.required]
    })
  }


  validarCamposVacios() : any{
    if(this.FormCrearClientes.valid){

      Swal.fire("Los datos se enviaron correctamente");
      console.log(this.FormCrearClientes);
    }else{
      Swal.fire("Hay campos vacios");
      console.log(this.FormCrearClientes);
    }
}

LimpiarCampos() {
  this.FormCrearClientes.reset();
}


}
