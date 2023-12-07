import { Component, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TipoIdentificacionService } from 'src/app/Servicios/TipoIdentificacion/tipo-identificacion.service';
import { Tipo_ProveedorService } from 'src/app/Servicios/TipoProveedor/tipo_Proveedor.service';
import { ProveedorService } from 'src/app/Servicios/Proveedor/proveedor.service';
import moment from 'moment';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Conceptos_AutomaticosService } from 'src/app/Servicios/Conceptos_Automaticos/Conceptos_Automaticos.service';

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
  conceptsRteIva = []; //Variable que cargará los conceptos de tipo reteiva
  conceptsRteIca = []; //Variable que cargará los conceptos de tipo reteica
  conceptsRteFuente = []; //Variable que cargará los conceptos de tipo retefuente

  constructor(private formBuilderCrearProveedor : FormBuilder,
                private Crearproveerdor : ProveedorService,
                  private tipoIdentificacionService : TipoIdentificacionService,
                    private tipoProveedorService : Tipo_ProveedorService,
                      private mensajeService : MensajesAplicacionService,
                        private svcConcepts : Conceptos_AutomaticosService) {

    //Creación formulario crear proveedor en modal.
    this.FormCrearProveedor = this.formBuilderCrearProveedor.group({
      provId: [null, Validators.required],
      ProvNombre: [null, Validators.required],
      provTipoId: [null, Validators.required],
      TipoProv: [null, Validators.required],
      ProvCiudad: [''],
      ProvTelefono: [''],
      ProvEmail: [''],
      ReteIva: [null],
      ReteIca: [null],
      ReteFuente: [null],
    });
   }

   //Todo lo que se carga al iniciar la página.
  ngOnInit(): void {
    this.tipoIdntificacion();
    this.tipoProveedor();
    this.getConcepts();
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
  tipoProveedor = () => this.tipoProveedorService.srvObtenerLista().subscribe(datos_tiposProveedores => this.tiposProveedores = datos_tiposProveedores);

  /** Crear el registro del proveedor en la BD.  */
  validarCamposVaciosProveedor = () => this.FormCrearProveedor.valid ? this.registroProveedor() : this.mensajeService.mensajeAdvertencia(`Advertencia`, 'Debe llenar los campos vacios!');

  /** Función para resetear el formulario */
  LimpiarCampos = () => this.FormCrearProveedor.reset();

   /** Registrar proveedores en la BD. */
  registroProveedor(){
    let id : number = this.FormCrearProveedor.value.provId;
    let nombre : string = this.FormCrearProveedor.value.ProvNombre;
    let tipoId : string = this.FormCrearProveedor.value.provTipoId;
    let tipoProveedor : any = this.FormCrearProveedor.value.TipoProv;
    let ciudad : string = this.FormCrearProveedor.value.ProvCiudad;
    let telefono : string = this.FormCrearProveedor.value.ProvTelefono;
    let email : string = this.FormCrearProveedor.value.ProvEmail;
    const datosProveedor : any = {
      Prov_Id : id,
      TipoIdentificacion_Id : tipoId,
      Prov_Nombre : nombre.toUpperCase(),
      TpProv_Id : tipoProveedor,
      Prov_Ciudad : ciudad,
      Prov_Telefono : telefono,
      Prov_Email : email,
      Prov_Fecha : moment().format('YYYY-MM-DD'),
      Prov_Hora : moment().format('H:mm:ss'),
      ReteFuente : this.FormCrearProveedor.value.ReteIva,
      ReteICA : this.FormCrearProveedor.value.ReteIca,
      ReteIVA : this.FormCrearProveedor.value.ReteFuente,
    }

    this.Crearproveerdor.srvGuardar(datosProveedor).subscribe(() => {
      this.mensajeService.mensajeConfirmacion(`Proveedor Creado`, 'Proveedor creado con éxito!');
      setTimeout(() => { this.LimpiarCampos(); }, 500);
    }, () => this.mensajeService.mensajeError(`Error`, 'No fue posible crear el registro, por favor, verifique!'));
  }

  //Función que cargará todos los tipos de conceptos
  getConcepts(){
    this.svcConcepts.getAllConcepts().subscribe(data => {
      this.conceptsRteIva = data.filter(x => x.concepto.includes('IVA'));
      this.conceptsRteIca = data.filter(x => x.concepto.includes('ICA'));
      this.conceptsRteFuente = data.filter(x => x.concepto.includes('FUENTE'));
    });
  }
}
