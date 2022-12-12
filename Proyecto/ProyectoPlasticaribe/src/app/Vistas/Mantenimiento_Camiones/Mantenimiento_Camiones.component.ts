import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-Mantenimiento_Camiones',
  templateUrl: './Mantenimiento_Camiones.component.html',
  styleUrls: ['./Mantenimiento_Camiones.component.css']
})
export class Mantenimiento_CamionesComponent implements OnInit {

  public formConsultarPedidoMtto !: FormGroup;
  public cargando : boolean = true;

  constructor(private frmBuilder : FormBuilder) {
    this.inicializarFormulario();
   }

  ngOnInit() {
  }

  inicializarFormulario(){
    this.formConsultarPedidoMtto = this.frmBuilder.group({
      idPedido : [null, Validators.required]
    })
  }

  consultarPedido(){
    let pedido : number = this.formConsultarPedidoMtto.value.idPedido;

    if(pedido != null){

    } else {
      this.advertenciaCamposVacios();
    }
  }

  /** Mensaje de advertencia campos vacios */
  advertenciaCamposVacios() {
    Swal.fire({icon: 'warning',  title: 'Advertencia', text: `Debe diligenciar el campo ID Pedido`, confirmButtonColor: '#ffc107', });
  }

}
