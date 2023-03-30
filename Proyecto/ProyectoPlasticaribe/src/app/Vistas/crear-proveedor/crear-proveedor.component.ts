import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { TipoIdentificacionService } from 'src/app/Servicios/TipoIdentificacion/tipo-identificacion.service';
import { Tipo_ProveedorService } from 'src/app/Servicios/TipoProveedor/tipo_Proveedor.service';
import Swal from 'sweetalert2';
import { ProveedorService } from 'src/app/Servicios/Proveedor/proveedor.service';
import moment from 'moment';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-crear-proveedor',
  templateUrl: './crear-proveedor.component.html',
  styleUrls: ['./crear-proveedor.component.css']
})
export class CrearProveedorComponent implements OnInit {

  public FormCrearProveedor !: FormGroup; /** Formulario para crear proveedores */
  tipoIdentificacion = []; /** Array para cargar los tipos de identificación */
  tiposProveedores = []; /** Array para cargar los proveedores */

  constructor(private formBuilderCrearProveedor : FormBuilder,
                private Crearproveerdor : ProveedorService,
                  private tipoIdentificacionService : TipoIdentificacionService,
                    private tipoProveedorService : Tipo_ProveedorService,
                      private messageService: MessageService ) {

    //Creación formulario crear proveedor en modal.
    this.FormCrearProveedor = this.formBuilderCrearProveedor.group({
      provId: [null, Validators.required],
      ProvNombre: [null, Validators.required],
      provTipoId: [null, Validators.required],
      TipoProv: [null, Validators.required],
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

  /** Cargar tipos de identificación del proveedor nit/cedula */
  tipoIdntificacion() {
    this.tipoIdentificacionService.srvObtenerLista().subscribe(datos_tipoIdentificacion => {
      for(let index = 0; index < datos_tipoIdentificacion.length; index++){
        this.tipoIdentificacion.push(datos_tipoIdentificacion[index].tipoIdentificacion_Id);
      }
    });
  }

  /** Cargar los tipos de proveedores */
  tipoProveedor(){
    this.tipoProveedorService.srvObtenerLista().subscribe(datos_tiposProveedores => {
      for (let index = 0; index < datos_tiposProveedores.length; index++) {
        this.tiposProveedores.push(datos_tiposProveedores[index])
      }
    });
  }

  /** Crear el registro del proveedor en la BD.  */
  validarCamposVaciosProveedor() : any{
    if (this.FormCrearProveedor.valid) this.registroProveedor();
    else this.mostrarAdvertencia('Debe llenar los campos vacios!');
  }

  /** Función para resetear el formulario */
  LimpiarCampos() {
    this.FormCrearProveedor.patchValue({ provId: null, ProvNombre: null, provTipoId: null, TipoProv: null, ProvCiudad: '', ProvTelefono: '', ProvEmail: '',});
  }

   /** Registrar proveedores en la BD. */
  registroProveedor(){
    let id : number = this.FormCrearProveedor.value.provId;
    let nombre : string = this.FormCrearProveedor.value.ProvNombre;
    let tipoId : string = this.FormCrearProveedor.value.provTipoId;
    let tipoProveedor : any = this.FormCrearProveedor.value.TipoProv;
    let ciudad : string = this.FormCrearProveedor.value.ProvCiudad;
    let telefono : string = this.FormCrearProveedor.value.ProvTelefono;
    let email : string = this.FormCrearProveedor.value.ProvEmail;
    this.CreacionProveedor(id, tipoId, nombre, tipoProveedor, ciudad, telefono, email);
  }

  //Funcion que creará un proveedor y lo guardará en la base de datos
  CreacionProveedor( idProveedor : number,
    TipoIdProveedor : string,
    nombreProveedor : string,
    tipoproveedor : any,
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
     this.mostrarConfirmacion('Proveedor creado con éxito!');
     setTimeout(() => { this.LimpiarCampos(); }, 500);
   }, error => { this.mostrarError('No fue posible crear el registro, por favor, verifique!') });
 }

 /** Mostrar mensaje de confirmación al crear materia prima */
 mostrarConfirmacion(mensaje : any) {
    this.messageService.add({severity:'success', detail: mensaje});
 }

 /** Mostrar mensaje de confirmación al crear materia prima */
 mostrarError(mensaje : any) {
    this.messageService.add({severity:'error', detail: mensaje});
 }

 /** Mostrar mensaje de confirmación al crear materia prima */
 mostrarAdvertencia(mensaje : any) {
  this.messageService.add({severity:'warning', detail: mensaje});
 }
}
