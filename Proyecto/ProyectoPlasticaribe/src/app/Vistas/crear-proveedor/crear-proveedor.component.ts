import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {PedidomateriaprimaComponent} from 'src/app/Vistas/pedidomateriaprima/pedidomateriaprima.component';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { TipoIdentificacionService } from 'src/app/Servicios/tipo-identificacion.service';
import { Tipo_ProveedorService } from 'src/app/Servicios/tipo_Proveedor.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-proveedor',
  templateUrl: './crear-proveedor.component.html',
  styleUrls: ['./crear-proveedor.component.css']
})
export class CrearProveedorComponent implements OnInit {

  public FormCrearProveedor !: FormGroup;

  tipoIdentificacion = [];
  tiposProveedores = [];

  constructor(private formBuilderCrearProveedor : FormBuilder,
              private Crearproveerdor : PedidomateriaprimaComponent,
              @Inject(SESSION_STORAGE) private storage: WebStorageService,
                private tipoIdentificacionService : TipoIdentificacionService,
                  private tipoProveedorService : Tipo_ProveedorService,
                    public pedidoMP : PedidomateriaprimaComponent) {

    //Creación formulario crear proveedor en modal.
    this.FormCrearProveedor = this.formBuilderCrearProveedor.group({
      provId: new FormControl(),
      ProvNombre: new FormControl(),
      provTipoId: new FormControl(),
      TipoProv: new FormControl(),
      ProvCiudad: new FormControl(),
      ProvTelefono: new FormControl(),
      ProvEmail: new FormControl(),
    });
   }

   //Todo lo que se carga al iniciar la página.
  ngOnInit(): void {
    this.initFormsCrearProveedor();
    this.tipoIdntificacion();
    this.tipoProveedor();
  }

  //Inicializando formulario de Crear Proveedores en modal.
  initFormsCrearProveedor(){
    this.FormCrearProveedor = this.formBuilderCrearProveedor.group({
      provId: ['', Validators.required],
      ProvNombre: ['', Validators.required],
      provTipoId: ['', Validators.required],
      TipoProv: ['', Validators.required],
      ProvCiudad: ['', Validators.required],
      ProvTelefono: ['', Validators.required],
      ProvEmail: ['', Validators.required],
    });
  }

  tipoIdntificacion() {
    this.tipoIdentificacionService.srvObtenerLista().subscribe(datos_tipoIdentificacion => {
      for(let index = 0; index < datos_tipoIdentificacion.length; index++){
        this.tipoIdentificacion.push(datos_tipoIdentificacion[index].tipoIdentificacion_Id);
      }
    });
  }

  tipoProveedor(){
    this.tipoProveedorService.srvObtenerLista().subscribe(datos_tiposProveedores => {
      for (let index = 0; index < datos_tiposProveedores.length; index++) {
        this.tiposProveedores.push(datos_tiposProveedores[index])
      }
    });
  }

  validarCamposVaciosProveedor() : any{
    if (this.FormCrearProveedor.valid) this.registroProveedor();
    else Swal.fire("Hay campos vacios")
  }


  LimpiarCampos() {
    this.FormCrearProveedor.reset();
  }

  registroProveedor(){
    let id : number = this.FormCrearProveedor.value.provId;
    let nombre : string = this.FormCrearProveedor.value.ProvNombre;
    let tipoId : string = this.FormCrearProveedor.value.provTipoId;
    let tipoProveedor : number = this.FormCrearProveedor.value.TipoProv;
    let ciudad : string = this.FormCrearProveedor.value.ProvCiudad;
    let telefono : string = this.FormCrearProveedor.value.ProvTelefono;
    let email : string = this.FormCrearProveedor.value.ProvEmail;

    this.pedidoMP.CreacionProveedor(id, tipoId, nombre, tipoProveedor, ciudad, telefono, email);
  }
}
