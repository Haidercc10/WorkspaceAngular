import { ThisReceiver } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-sedes-clientes',
  templateUrl: './crear-sedes-clientes.component.html',
  styleUrls: ['./crear-sedes-clientes.component.css']
})
export class CrearSedesClientesComponent implements OnInit {

  //Formulario sedes clientes.
  public FormSedesClientes !: FormGroup;

  constructor(private FormBuilderSedesClientes : FormBuilder) {

    this.FormSedesClientes = this.FormBuilderSedesClientes.group({
      //Instanciar campos que vienen del formulario
      //Pedidos
      SedeCli_Id: new FormControl(),
      SedeCli_Ciudad: new FormControl(),
      CliNombre: new FormControl(),
      SedeCli_Postal: new FormControl(),
    })

  }

  ngOnInit(): void {
    this.initFormsSedes();
  }

  initFormsSedes(){
    this.FormSedesClientes = this.FormBuilderSedesClientes.group({
      //Instanciar campos que vienen del formulario
      //Pedidos
      SedeCli_Id: ['', Validators.required],
      SedeCli_Ciudad: ['', Validators.required],
      CliNombre: ['', Validators.required],
      SedeCli_Postal: ['', Validators.required]
    })

  }

  // VALIDACION PARA CAMPOS VACIOS
  validarCamposVacios() {
    if(this.FormSedesClientes.valid){
      Swal.fire("Los datos se enviaron correctamente");
      console.log(this.FormSedesClientes);
    }else{
      Swal.fire("Hay campos vacios");
      console.log(this.FormSedesClientes);
    }
}

LimpiarCampos() {
  this.FormSedesClientes.reset();
}




}
