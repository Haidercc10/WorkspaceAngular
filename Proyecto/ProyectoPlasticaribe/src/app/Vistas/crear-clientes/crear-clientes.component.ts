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
      TipoIdCliente: new FormControl(),
      CliNombre:  new FormControl(),
      CliDireccion:  new FormControl(),
      CliTelefono:  new FormControl(),
      CliEmail:  new FormControl(),
      TipoClienteId: new FormControl(),
      UsuIdNombre: new FormControl(),

      SedeCli_Id: new FormControl(),
      SedeCli_Ciudad: new FormControl(),
      CliId2: new FormControl(),
      SedeCli_Postal: new FormControl(),
      SedeCli_Direccion: new FormControl(),

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
       UsuIdNombre: ['', Validators.required],

       SedeCli_Id: ['', Validators.required],
       SedeCli_Ciudad: ['', Validators.required],
       CliId2: ['', Validators.required],
       SedeCli_Postal: ['', Validators.required],
       SedeCli_Direccion: ['', Validators.required]
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


guardarClientes(){
  const camposClientes : any = {
    ClieId: this.FormCrearClientes.get('')?.value,
    TpIdCliente: this.FormCrearClientes.get('')?.value,
    ClieNombre: this.FormCrearClientes.get('')?.value,
    ClieDireccion: this.FormCrearClientes.get('')?.value,
    ClieTelefono: this.FormCrearClientes.get('')?.value,
    ClieEmail: this.FormCrearClientes.get('')?.value,
    TpClienteId: this.FormCrearClientes.get('')?.value,
    UsuIdNombre: this.FormCrearClientes.get('')?.value,

    SedeClie_Id: this.FormCrearClientes.get('')?.value,
    SedeClie_Ciudad: this.FormCrearClientes.get('')?.value,
    ClieId2: this.FormCrearClientes.get('')?.value,
    SedeClie_Postal: this.FormCrearClientes.get('')?.value,
    SedeClie_Direccion: this.FormCrearClientes.get('')?.value
  }
}


}
