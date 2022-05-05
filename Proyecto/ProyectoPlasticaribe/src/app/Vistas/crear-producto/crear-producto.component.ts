import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SrvModalCrearProductosService } from 'src/app/Servicios/srv-modal-crear-productos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-producto',
  templateUrl: './crear-producto.component.html',
  styleUrls: ['./crear-producto.component.css']
})
export class CrearProductoComponent implements OnInit {

  public FormCrearProducto : FormGroup;

  constructor(private frmBuilderCrearProducto : FormBuilder) {

    this.FormCrearProducto = this.frmBuilderCrearProducto.group({

      //Instanciar campos que vienen del formulario
      ProduId: new FormControl(),
      ProduNombre: new FormControl(),
      ProduAncho: new FormControl(),
      ProduFuelle: new FormControl(),
      ProduCalibre: new FormControl(),
      ProduUnidadMedidaACF: new FormControl(),
      ProduTipo: new FormControl(),
      ProduCantidad: new FormControl(),
      ProduUnidadMedidaCant: new FormControl(),
      ProduPrecioUnd: new FormControl(),
      ProduTipoMoneda: new FormControl(),
      ProduStock: new FormControl()
    })

  }

  ngOnInit(): void {
    this.initFormsCrearProducto
  }

  initFormsCrearProducto() {
    //Campos que vienen del formulario
    this.FormCrearProducto = this.frmBuilderCrearProducto.group({
      //Datos para la tabla de productos. (Iguala el valor del campo en la vista)
       ProduId:['',  Validators.required],
       ProduNombre: ['', Validators.required],
       ProduAncho: ['', Validators.required],
       ProduFuelle: ['', Validators.required],
       ProduCalibre: ['', Validators.required],
       ProduUnidadMedidaACF: ['', Validators.required],
       ProduTipo: ['', Validators.required],
       ProduCantidad: ['', Validators.required],
       ProduUnidadMedidaCant: ['', Validators.required],
       ProduPrecioUnd: ['', Validators.required],
       ProduTipoMoneda: ['', Validators.required],
       ProduStock: ['', Validators.required]
     })
}

validarCamposVacios() : any{
  if(this.FormCrearProducto.valid){

    Swal.fire("Los datos se enviaron correctamente");
    console.log(this.FormCrearProducto);
  }else{
    Swal.fire("Hay campos vacios");
    console.log(this.FormCrearProducto);
  }
}

LimpiarCampos() {
this.FormCrearProducto.reset();
}



}
