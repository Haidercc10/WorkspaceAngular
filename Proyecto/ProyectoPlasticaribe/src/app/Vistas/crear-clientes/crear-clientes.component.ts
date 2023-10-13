import { Component, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { ClientesService } from 'src/app/Servicios/Clientes/clientes.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { SedeClienteService } from 'src/app/Servicios/SedeCliente/sede-cliente.service';
import { TipoClienteService } from 'src/app/Servicios/TipoCliente/tipo-cliente.service';
import { TipoIdentificacionService } from 'src/app/Servicios/TipoIdentificacion/tipo-identificacion.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { AppComponent } from 'src/app/app.component';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-crear-clientes',
  templateUrl: './crear-clientes.component.html',
  styleUrls: ['./crear-clientes.component.css']
})

export class ClientesComponent implements OnInit {

  public FormCrearClientes !: FormGroup; //Formulario de creacion de clientes
  public FormCrearSedeClientes !: FormGroup //Formulario de creacion de sedes
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  tipoIdentificacion = []; //Variable que almacena los tipos deidentificacion
  tiposClientes = []; //Variable que almacena los tipos de clientes
  usuario = []; //Variable que almancena los vendedores
  cliente = []; //Variable que almacenará el nombre de los clientes
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private AppComponent : AppComponent,
                private formBuilderCrearClientes : FormBuilder,
                  private tiposClientesService : TipoClienteService,
                    private tipoIdentificacionService : TipoIdentificacionService,
                      private usuarioService : UsuarioService,
                        private clientesService :ClientesService,
                          private sedesClientesService: SedeClienteService,
                            private mensajeService : MensajesAplicacionService,) {

    this.modoSeleccionado = this.AppComponent.temaSeleccionado;this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.FormCrearClientes = this.formBuilderCrearClientes.group({
      CliId: [null, Validators.required],
      TipoIdCliente: [null, Validators.required],
      CliNombre: [null, Validators.required],
      CliTelefono: [''],
      CliEmail: [''],
      TipoClienteId: [null, Validators.required],
      vendedorId: [null, Validators.required],
    });

    this.FormCrearSedeClientes = this.formBuilderCrearClientes.group({
      SedeCli_Ciudad: [null, Validators.required],
      CliId2: [null, Validators.required],
      SedeCli_Postal: 0,
      SedeCli_Direccion: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.tipoIdntificacion();
    this.tipoClienteComboBox();
    this.usuarioComboBox();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que limipiará los campos deñ formulario de clientes
  LimpiarCampos = () => this.FormCrearClientes.reset();

  // Funcion que limpiará los campos del formulario de sedes de clientes
  LimpiarCamposSede = () => this.FormCrearSedeClientes.reset();

  // Funcion que consultará y almacenará los tipos de identificaciones
  tipoIdntificacion = () => this.tipoIdentificacionService.srvObtenerLista().subscribe(datos => this.tipoIdentificacion = datos);

  // Funcion que consultará y almacenará los tipos de clientes
  tipoClienteComboBox = () => this.tiposClientesService.srvObtenerLista().subscribe(datos => this.tiposClientes = datos);

  // Funcion que consultará y almacneará los vendedores
  usuarioComboBox() {
    if (this.ValidarRol == 2) this.usuarioService.srvObtenerListaPorId(this.storage_Id).subscribe(datos => this.usuario = datos);
    else if (this.ValidarRol == 1) this.usuarioService.srvObtenerListaUsuario().subscribe(datos => this.usuario = datos.filter((item) => item.rolUsu_Id == 2));
  }

  // Funcion que validará los campos del formulario de clientes
  validarCamposVaciosClientes = () => this.FormCrearClientes.valid ? this.crearCliente() : this.mensajeService.mensajeAdvertencia(`Advertencia`, "Hay campos vacios");

  // Funcionq eu validará los campos dl formulario de sedes de clientes
  validarCamposVaciosSedes = () => this.FormCrearSedeClientes.valid ? this.crearSede() : this.mensajeService.mensajeAdvertencia(`Advertencia`, "Hay campos vacios");

  // Funcion que se encargará de crear clientes
  crearCliente(){
    const datosClientes : any = {
      Cli_Id: this.FormCrearClientes.value.CliId,
      TipoIdentificacion_Id : this.FormCrearClientes.value.TipoIdCliente,
      Cli_Nombre: (this.FormCrearClientes.value.CliNombre).toUpperCase(),
      Cli_Telefono: this.FormCrearClientes.value.CliTelefono,
      Cli_Email: this.FormCrearClientes.value.CliEmail,
      TPCli_Id: this.FormCrearClientes.value.TipoClienteId,
      Usua_Id: this.FormCrearClientes.value.vendedorId,
      Estado_Id : 0,
      Cli_Fecha : moment().format('YYYY-MM-DD'),
      Cli_Hora : moment().format('H:mm:ss'),
    }
    if (this.ValidarRol == 2) datosClientes.Estado_Id = 8;
    else if (this.ValidarRol == 1) datosClientes.Estado_Id = 1;
    this.clientesService.srvGuardar(datosClientes).subscribe(() => {
      this.mensajeService.mensajeConfirmacion(`¡Cliente Creado!`, `¡Se creado el cliente con el nombre ${datosClientes.Cli_Nombre}!`);
      this.LimpiarCampos();
    }, error => this.mensajeService.mensajeError('¡No fue posible crear el cliente!', error.message));
  }

  // Funcion que se encargará de crear sedes de clientes
  crearSede(){
    this.sedesClientesService.GetSedesCliente(this.FormCrearSedeClientes.value.CliId2).subscribe(datos_sedePorID => {
      const datosSedes : any = {
        sedeCli_Id: '',
        SedeCliente_Ciudad: (this.FormCrearSedeClientes.value.SedeCli_Ciudad).toUpperCase(),
        SedeCliente_Direccion: (this.FormCrearSedeClientes.value.SedeCli_Direccion).toUpperCase(),
        SedeCli_CodPostal: this.FormCrearSedeClientes.value.SedeCli_Postal,
        Cli_Id : this.FormCrearSedeClientes.value.CliId2,
        SedeCli_Fecha : moment().format('YYYY-MM-DD'),
        SedeCli_Hora : moment().format('H:mm:ss'),
      }
      if (datos_sedePorID > 0) datosSedes.sedeCli_Id = datos_sedePorID + 1;
      else if (datos_sedePorID == 0) datosSedes.sedeCli_Id = this.FormCrearSedeClientes.value.CliId2 +""+ 1;
      this.sedesClientesService.srvGuardar(datosSedes).subscribe(() => {
        this.mensajeService.mensajeConfirmacion('Guardado Exitoso', 'Sede de Cliente guardada con éxito!');
        this.LimpiarCamposSede();
      }, error => this.mensajeService.mensajeError('¡No fue posible crear la sede del cliente!', error.message));
    }, error => this.mensajeService.mensajeError('¡Ocurrió un error al momento de consultar si el cliente tiene sedes previamente creadas!', error.message));
  }
}
