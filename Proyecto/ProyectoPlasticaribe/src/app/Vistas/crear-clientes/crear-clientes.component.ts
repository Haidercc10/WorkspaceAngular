import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { ClientesService } from 'src/app/Servicios/Clientes/clientes.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import { SedeClienteService } from 'src/app/Servicios/SedeCliente/sede-cliente.service';
import { TipoClienteService } from 'src/app/Servicios/TipoCliente/tipo-cliente.service';
import { TipoIdentificacionService } from 'src/app/Servicios/TipoIdentificacion/tipo-identificacion.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { OpedidoproductoComponent } from 'src/app/Vistas/opedidoproducto/opedidoproducto.component';
import Swal from 'sweetalert2';
import { CrearProductoComponent } from '../crear-producto/crear-producto.component';
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

  constructor(private rolService : RolesService,
                private AppComponent : AppComponent,
                  private formBuilderCrearClientes : FormBuilder,
                    private tiposClientesService : TipoClienteService,
                      private tipoIdentificacionService : TipoIdentificacionService,
                        private usuarioService : UsuarioService,
                          private pedidoCliente : OpedidoproductoComponent,
                            private crearProducto : CrearProductoComponent,
                              private clientesService :ClientesService,
                                private sedesClientesService: SedeClienteService,) {

    this.FormCrearClientes = this.formBuilderCrearClientes.group({
      CliId: [null, Validators.required],
      TipoIdCliente: [null, Validators.required],
      CliNombre: [null, Validators.required],
      CliTelefono: [''],
      CliEmail: [''],
      TipoClienteId: [null, Validators.required],
      UsuIdNombre: [null, Validators.required],
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
  LimpiarCampos() {
    this.FormCrearClientes.setValue({
      CliId: null,
      TipoIdCliente: null,
      CliNombre: null,
      CliTelefono: '',
      CliEmail: '',
      TipoClienteId: null,
      UsuIdNombre: null,
      vendedorId: null,
    });
  }

  // Funcion que limpiará los campos del formulario de sedes de clientes
  LimpiarCamposSede(){
    this.FormCrearSedeClientes.setValue({
      SedeCli_Ciudad: null,
      CliId2: null,
      SedeCli_Postal: 0,
      SedeCli_Direccion: null
    });
  }

  // Funcion que consultará y almacenará los tipos de identificaciones
  tipoIdntificacion() {
    this.tipoIdentificacionService.srvObtenerLista().subscribe(datos_tipoIdentificacion => {
      for(let index = 0; index < datos_tipoIdentificacion.length; index++){
        this.tipoIdentificacion.push(datos_tipoIdentificacion[index].tipoIdentificacion_Id);
      }
    });
  }

  // Funcion que consultará y almacenará los tipos de clientes
  tipoClienteComboBox() {
    this.tiposClientesService.srvObtenerLista().subscribe(datos_tiposClientes => {
      for (let index = 0; index < datos_tiposClientes.length; index++) {
        this.tiposClientes.push(datos_tiposClientes[index]);
      }
    });
  }

  // Funcion que consultará y almacneará los vendedores
  usuarioComboBox() {
    this.usuarioService.srvObtenerListaPorId(this.storage_Id).subscribe(datos_usuarios => {
      if (datos_usuarios.rolUsu_Id == 2) this.usuario.push(datos_usuarios);
      else {
        this.usuarioService.srvObtenerListaUsuario().subscribe(datos_usuarios => {
          for (let index = 0; index < datos_usuarios.length; index++) {
            if (datos_usuarios[index].rolUsu_Id == 2) this.usuario.push(datos_usuarios[index]);
          }
        });
      }
    });
  }

  // Funcion que se encará de buscar la información de vendedor
  vendedoreSeleccionado(){
    let vendedor : any = this.FormCrearClientes.value.UsuIdNombre;
    this.usuarioService.srvObtenerListaPorId(vendedor).subscribe(datos_usuario => {
      this.FormCrearClientes = this.formBuilderCrearClientes.group({
        CliId: this.FormCrearClientes.value.CliId,
        TipoIdCliente: this.FormCrearClientes.value.TipoIdCliente,
        CliNombre: this.FormCrearClientes.value.CliNombre,
        CliTelefono: this.FormCrearClientes.value.CliTelefono,
        CliEmail: this.FormCrearClientes.value.CliEmail,
        TipoClienteId: this.FormCrearClientes.value.TipoClienteId,
        UsuIdNombre: datos_usuario.usua_Nombre,
        vendedorId: datos_usuario.usua_Id,
      });
    });
  }

  // Funcion que consulta´ra y almacenará los clientes
  clientesComboBox() {
    this.usuarioService.srvObtenerListaPorId(this.storage_Id).subscribe(datos_usuarios => {
      this.clientesService.srvObtenerListaPorEstado(1).subscribe(datos_clientes => {
        for (let index = 0; index < datos_clientes.length; index++) {
          if (datos_usuarios.rolUsu_Id == 2) this.cliente.push(datos_clientes[index]);
          else this.cliente.push(datos_clientes[index]);
          this.cliente.sort((a,b) => a.cli_Nombre.localeCompare(b.cli_Nombre));
        }
      });
    });
  }

  // Funcion que validará los campos del formulario de clientes
  validarCamposVaciosClientes() : any{
    if (this.FormCrearClientes.valid){
      this.crearCliente();
      this.LimpiarCampos();
      this.clientesComboBox();
    } else this.mensajeAdvertencia("Hay campos vacios");
  }

  // Funcionq eu validará los campos dl formulario de sedes de clientes
  validarCamposVaciosSedes(){
    if (this.FormCrearSedeClientes.valid){
      this.crearSede();
    } else this.mensajeAdvertencia("Hay campos vacios");
  }

  // Funcion que se encargará de crear clientes
  crearCliente(){
    if (this.ValidarRol == 2) {
      const datosClientes : any = {
        Cli_Id: this.FormCrearClientes.value.CliId,
        TipoIdentificacion_Id : this.FormCrearClientes.value.TipoIdCliente,
        Cli_Nombre: this.FormCrearClientes.value.CliNombre,
        Cli_Telefono: this.FormCrearClientes.value.CliTelefono,
        Cli_Email: this.FormCrearClientes.value.CliEmail,
        TPCli_Id: this.FormCrearClientes.value.TipoClienteId,
        Usua_Id: this.FormCrearClientes.value.vendedorId,
        Estado_Id : 8,
        Cli_Fecha : moment().format('YYYY-MM-DD'),
        Cli_Hora : moment().format('H:mm:ss'),
      }
      this.clientesService.srvGuardar(datosClientes).subscribe(datos => {
        Swal.fire({icon : 'success', title: 'Guardado Exitoso', text: 'Cliente guardado con éxito!'});
      }, error => { this.mensajeError('¡No fue posible crear el cliente!', error.message); });
    }else if (this.ValidarRol == 1){
      const datosClientes : any = {
        Cli_Id: this.FormCrearClientes.value.CliId,
        TipoIdentificacion_Id : this.FormCrearClientes.value.TipoIdCliente,
        Cli_Nombre: this.FormCrearClientes.value.CliNombre,
        Cli_Telefono: this.FormCrearClientes.value.CliTelefono,
        Cli_Email: this.FormCrearClientes.value.CliEmail,
        TPCli_Id: this.FormCrearClientes.value.TipoClienteId,
        Usua_Id: this.FormCrearClientes.value.vendedorId,
        Estado_Id : 1,
        Cli_Fecha : moment().format('YYYY-MM-DD'),
        Cli_Hora : moment().format('H:mm:ss'),
      }
      this.clientesService.srvGuardar(datosClientes).subscribe(datos => {
        Swal.fire({icon : 'success', title: 'Guardado Exitoso', text: 'Cliente guardado con éxito!'});
      }, error => { this.mensajeError('¡No fue posible crear el cliente!', error.message); });
    }
    this.crearProducto.ngOnInit();
    this.pedidoCliente.ngOnInit();
  }

  // Funcion que se encargará de crear sedes de clientes
  crearSede(){
    this.sedesClientesService.GetSedesCliente(this.FormCrearSedeClientes.value.CliId2).subscribe(datos_sedePorID => {
      if (datos_sedePorID > 0) {
        const datosSedes : any = {
          sedeCli_Id: datos_sedePorID + 1,
          SedeCliente_Ciudad: this.FormCrearSedeClientes.value.SedeCli_Ciudad,
          SedeCliente_Direccion: this.FormCrearSedeClientes.value.SedeCli_Direccion,
          SedeCli_CodPostal: this.FormCrearSedeClientes.value.SedeCli_Postal,
          Cli_Id : this.FormCrearSedeClientes.value.CliId2,
          SedeCli_Fecha : moment().format('YYYY-MM-DD'),
          SedeCli_Hora : moment().format('H:mm:ss'),
        }
        this.sedesClientesService.srvGuardar(datosSedes).subscribe(datos_sede => {
          Swal.fire({icon : 'success', title: 'Guardado Exitoso', text: 'Sede de Cliente guardada con éxito!'});
          this.LimpiarCamposSede();
          this.pedidoCliente.ngOnInit();
        }, error => { this.mensajeError('¡No fue posible crear la sede del cliente!', error.message); });
      } else if (datos_sedePorID == 0) {
        const datosSedess : any = {
          sedeCli_Id: this.FormCrearSedeClientes.value.CliId2 +""+ 1,
          SedeCliente_Ciudad: this.FormCrearSedeClientes.value.SedeCli_Ciudad,
          SedeCliente_Direccion: this.FormCrearSedeClientes.value.SedeCli_Direccion,
          SedeCli_CodPostal: this.FormCrearSedeClientes.value.SedeCli_Postal,
          Cli_Id : this.FormCrearSedeClientes.value.CliId2,
          SedeCli_Fecha : moment().format('YYYY-MM-DD'),
          SedeCli_Hora : moment().format('H:mm:ss'),
        }
        this.sedesClientesService.srvGuardar(datosSedess).subscribe(datos_sede => {
          Swal.fire({icon : 'success', title: 'Guardado Exitoso', text: 'Sede de Cliente guardada con éxito!'});
          this.LimpiarCamposSede();
          this.pedidoCliente.ngOnInit();
         }, error => { this.mensajeError('¡No fue posible crear la sede del cliente!', error.message); });
      }
    }, error => { this.mensajeError('¡Ocurrió un error al momento de consultar si el cliente tiene sedes previamente creadas!', error.message); });
  }

  // Mensaje de Advertencia
  mensajeAdvertencia(mensaje : string, mensaje2 : string = ''){
    Swal.fire({ icon: 'warning', title: 'Advertencia', html:`<b>${mensaje}</b><hr> ` + `<spam>${mensaje2}</spam>`, showCloseButton: true, });
  }

  // Mensaje de Error
  mensajeError(text : string, error : any = ''){
    Swal.fire({ icon: 'error', title: 'Error', html: `<b>${text}</b><hr> ` +  `<spam style="color : #f00;">${error}</spam> `, showCloseButton: true, });
  }

}
