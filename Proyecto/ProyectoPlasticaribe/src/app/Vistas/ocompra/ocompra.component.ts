import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app.ocompra.component',
  templateUrl: './ocompra.component.html',
  styleUrls: ['./ocompra.component.css']
  
})
export class OcompraComponent implements OnInit {

  public formularioOC !: FormGroup;
  public formularioBuscarPedido !: FormGroup;
  public formularioCreacionMateriaPrima !: FormGroup;

  constructor( private frmBuilderOcompra : FormBuilder) { 

    this.formularioOC = this.frmBuilderOcompra.group({
      IdDetalleOc: [, Validators.required],
      fechaOrdenCompra: [, Validators.required],
      IdProveedor: [, Validators.required],
      NombreProveedor: [, Validators.required],
      estadoOC: [, Validators.required],
      IdUsuario: [, Validators.required],
      NombreUsuario: [, Validators.required],
      NombreMateriaPrima: [, Validators.required],
      CantidadMateriaPrima: [, Validators.required],
      UnidadMedidaMateriaPrima: [, Validators.required],
      StockMateriaPrima: [, Validators.required],
      TipoMateriaPrima: [, Validators.required],
    });

    this.formularioBuscarPedido = this.frmBuilderOcompra.group({
      buscarPedidoId: [, Validators.required],
    });


  }

  ngOnInit(){

  }


  

  clear() {
      this.formularioOC.reset();
      this.formularioBuscarPedido.reset();
    }

  // VALIDACION PARA CAMPOS VACIOS Y ENVIO DE DATOS 
  validarCamposVacios_Guardar() : any{
      if(this.formularioOC.valid){
        Swal.fire("Los datos se enviaron correctamente");
        this.clear();


      }else{
        Swal.fire("HAY CAMPOS VACIOS");
      }
  }

  validarCamposVacios_Consultar() : any{
    if(this.formularioBuscarPedido.valid){
      Swal.fire("Consulta Exitosa");
      this.clear();


    }
    else{
      Swal.fire("HAY CAMPOS VACIOS");
    }
  }

  modalRegistroMateriaPrima(){
    
  }
}




