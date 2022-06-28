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

  constructor(private formBuilderCrearProveedor : FormBuilder,
              private Crearproveerdor : PedidomateriaprimaComponent,
              @Inject(SESSION_STORAGE) private storage: WebStorageService,) {

    //Creación formulario crear proveedor en modal.
    this.FormCrearProveedor = this.formBuilderCrearProveedor.group({
      provId: new FormControl,
      provNombre: new FormControl,
      provTipoId: new FormControl,
      TipoProv: new FormControl,
      ProvCiudad: new FormControl,
      ProvTelefono: new FormControl,
      ProvEmail: new FormControl
    });



   }
   //Todo lo que se carga al iniciar la página.
  ngOnInit(): void {
    this.initFormsCrearProveedor();
  }

  //Inicializando formulario de Crear Proveedores en modal.
  initFormsCrearProveedor(){
    this.FormCrearProveedor = this.formBuilderCrearProveedor.group({
      provId: ['', Validators.required],
      provNombre: ['', Validators.required],
      provTipoId: ['', Validators.required],
      TipoProv: ['', Validators.required],
      ProvCiudad: ['', Validators.required],
      ProvTelefono: ['', Validators.required],
      ProvEmail: ['', Validators.required]
    });
  }




  validarCamposVaciosProveedor() : any{

  }


  LimpiarCampos() {
    this.FormCrearProveedor.reset();
  }


}
