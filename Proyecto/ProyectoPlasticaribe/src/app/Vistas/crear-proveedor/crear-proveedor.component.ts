import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'; 
import {PedidomateriaprimaComponent} from 'src/app/Vistas/pedidomateriaprima/pedidomateriaprima.component';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';

@Component({
  selector: 'app-crear-proveedor',
  templateUrl: './crear-proveedor.component.html',
  styleUrls: ['./crear-proveedor.component.css']
})
export class CrearProveedorComponent implements OnInit {

  public FormCrearProveedor !: FormGroup;
  

  tipoIdentificacion = [];
  tiposClientes = [];
  usuario = [];
  tipo_cliente : number;

  constructor(private formBuilderCrearProveedor : FormBuilder,
                      private Crearproveerdor :PedidomateriaprimaComponent,
                        @Inject(SESSION_STORAGE) private storage: WebStorageService, ) {

                          


                          
    this.FormCrearProveedor = this.formBuilderCrearProveedor.group({
      CliId: new FormControl,
     
    });

    

   }

  ngOnInit(): void {
    
  }

  initFormsCrearProveedor(){
    
    }

    


  validarCamposVaciosProveedor() : any{
    
  }

  
  LimpiarCampos() {
    this.FormCrearProveedor.reset();
  }

  
}
