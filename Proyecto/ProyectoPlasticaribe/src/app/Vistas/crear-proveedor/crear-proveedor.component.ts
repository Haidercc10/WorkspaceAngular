import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { TipoIdentificacionService } from 'src/app/Servicios/TipoIdentificacion/tipo-identificacion.service';
import { Tipo_ProveedorService } from 'src/app/Servicios/TipoProveedor/tipo_Proveedor.service';
import Swal from 'sweetalert2';
import { ProveedorService } from 'src/app/Servicios/Proveedor/proveedor.service';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})

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
                private Crearproveerdor : ProveedorService,
                  private tipoIdentificacionService : TipoIdentificacionService,
                    private tipoProveedorService : Tipo_ProveedorService,) {

    //Creación formulario crear proveedor en modal.
    this.FormCrearProveedor = this.formBuilderCrearProveedor.group({
      provId: ['', Validators.required],
      ProvNombre: ['', Validators.required],
      provTipoId: ['', Validators.required],
      TipoProv: ['', Validators.required],
      ProvCiudad: [''],
      ProvTelefono: [''],
      ProvEmail: [''],
    });
   }

   //Todo lo que se carga al iniciar la página.
  ngOnInit(): void {
    this.tipoIdntificacion();
    this.tipoProveedor();
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

    this.CreacionProveedor(id, tipoId, nombre, tipoProveedor, ciudad, telefono, email);
    this.FormCrearProveedor.reset();
  }

  //Funcion que creará un proveedor y lo guardará en la base de datos
  CreacionProveedor( idProveedor : number,
    TipoIdProveedor : string,
    nombreProveedor : string,
    tipoproveedor : number,
    ciudadProveedor : string,
    telefonoProveedor : string,
    emailProveedor : string){

   const datosProveedor : any = {
     Prov_Id : idProveedor,
     TipoIdentificacion_Id : TipoIdProveedor,
     Prov_Nombre : nombreProveedor,
     TpProv_Id : tipoproveedor,
     Prov_Ciudad : ciudadProveedor,
     Prov_Telefono : telefonoProveedor,
     Prov_Email : emailProveedor,
     Prov_Fecha : moment().format('YYYY-MM-DD'),
     Prov_Hora : moment().format('H:mm:ss'),
   }

   this.Crearproveerdor.srvGuardar(datosProveedor).subscribe(datos_nuevoProveedor => {
     const Toast = Swal.mixin({
       toast: true,
       position: 'center',
       showConfirmButton: false,
       timer: 1500,
       timerProgressBar: true,
       didOpen: (toast) => {
         toast.addEventListener('mouseenter', Swal.stopTimer)
         toast.addEventListener('mouseleave', Swal.resumeTimer)
       }
     });
     Toast.fire({
       icon: 'success',
       title: '¡Proveedor creado con exito!'
     });
   });
 }
}
