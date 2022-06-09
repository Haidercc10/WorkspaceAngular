import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TipoClienteService } from 'src/app/Servicios/tipo-cliente.service';
import { TipoIdentificacionService } from 'src/app/Servicios/tipo-identificacion.service';
import { UsuarioService } from 'src/app/Servicios/usuario.service';
import Swal from 'sweetalert2';
import {OpedidoproductoComponent} from 'src/app/Vistas/opedidoproducto/opedidoproducto.component'

@Component({
  selector: 'app-crear-clientes',
  templateUrl: './crear-clientes.component.html',
  styleUrls: ['./crear-clientes.component.css']
})
export class ClientesComponent implements OnInit {

  public FormCrearClientes : FormGroup;
  public FormCrearSedeClientes : FormGroup

  tipoIdentificacion = [];
  tiposClientes = [];
  usuario = [];
  tipo_cliente : number;

  constructor(private formBuilderCrearClientes : FormBuilder,
                private tiposClientesService : TipoClienteService,
                  private tipoIdentificacionService : TipoIdentificacionService,
                    private usuarioService : UsuarioService,
                      private pedidoCliente : OpedidoproductoComponent,) {

    this.FormCrearClientes = this.formBuilderCrearClientes.group({
      CliId: new FormControl,
      TipoIdCliente: new FormControl(),
      CliNombre:  new FormControl(),
      CliTelefono:  new FormControl(),
      CliEmail:  new FormControl(),
      TipoClienteId: new FormControl(),
      UsuIdNombre: new FormControl(),
    });

    this.FormCrearSedeClientes = this.formBuilderCrearClientes.group({
      SedeCli_Id: new FormControl(),
      SedeCli_Ciudad: new FormControl(),
      CliId2: new FormControl(),
      SedeCli_Postal: new FormControl(),
      SedeCli_Direccion: new FormControl(),
    });

   }

  ngOnInit(): void {
    this.tipoIdntificacion();
    this.tipoClienteComboBox();
    this.usuarioComboBox();
  }

  initFormsCrearClientes(){
    this.FormCrearClientes = this.formBuilderCrearClientes.group({
       CliId: ['', Validators.required],
       TipoIdCliente: ['', Validators.required],
       CliNombre: ['', Validators.required],
       CliTelefono: ['', Validators.required],
       CliEmail: ['', Validators.required],
       TipoClienteId: ['', Validators.required],
       UsuIdNombre: ['', Validators.required],
    });

    this.FormCrearSedeClientes = this.formBuilderCrearClientes.group({
      SedeCli_Id: ['', Validators.required],
       SedeCli_Ciudad: ['', Validators.required],
       CliId2: ['', Validators.required],
       SedeCli_Postal: ['', Validators.required],
       SedeCli_Direccion: ['', Validators.required]
    });
  }


  validarCamposVaciosClientes() : any{
    if(this.FormCrearClientes.valid){
      this.crearCliente();
      this.LimpiarCampos();
    }else Swal.fire("Hay campos vacios"); 
  }

  validarCamposVaciosSedes(){
    if(this.FormCrearSedeClientes.valid){
      this.crearSede();
      this.LimpiarCamposSede();
    }else Swal.fire("Hay campos vacios");
  }

  LimpiarCampos() {
    this.FormCrearClientes.reset();
  }

  LimpiarCamposSede(){
    this.FormCrearSedeClientes.reset();
  }

  tipoIdntificacion() {
    this.tipoIdentificacionService.srvObtenerLista().subscribe(datos_tipoIdentificacion => {
      for(let index = 0; index < datos_tipoIdentificacion.length; index++){
        this.tipoIdentificacion.push(datos_tipoIdentificacion[index].tipoIdentificacion_Id);
      }
    });
  }

  tipoClienteComboBox() {
    this.tiposClientesService.srvObtenerLista().subscribe(datos_tiposClientes => {
      for (let index = 0; index < datos_tiposClientes.length; index++) {
        this.tiposClientes.push(datos_tiposClientes[index].tpCli_Nombre);
      }
    });
  }

  usuarioComboBox() {
    this.usuarioService.srvObtenerListaUsuario().subscribe(datos_usuarios => {
      for (let index = 0; index < datos_usuarios.length; index++) {
        this.usuario.push(datos_usuarios[index].usua_Nombre);        
      }
    });
  }

  crearCliente(){

    let id : any = this.FormCrearClientes.value.CliId;
    let tipoId : any = this.FormCrearClientes.value.TipoIdCliente;
    let nombreCliente : any = this.FormCrearClientes.value.CliNombre;
    let telefono : string = this.FormCrearClientes.value.CliTelefono;
    let email : any = this.FormCrearClientes.value.CliEmail;
    let tipoCliente : string = this.FormCrearClientes.value.TipoClienteId;
    let vendedor : any = this. FormCrearClientes.value.UsuIdNombre;

    let sedeCLiID : any = this.FormCrearClientes.value.CliId2;
    let ciudadsedeCliente : any = this.FormCrearClientes.value.SedeCli_Ciudad;    
    let codigoPostal : any = this.FormCrearClientes.value.SedeCli_Postal;
    let direccionSede : any = this.FormCrearClientes.value.SedeCli_Direccion;

    this.pedidoCliente.insertarClientes(id, tipoId, nombreCliente, telefono, email, tipoCliente, ciudadsedeCliente, vendedor, codigoPostal, direccionSede, sedeCLiID);
  }

  crearSede(){
    let id : any = this.FormCrearSedeClientes.value.CliId2;
    let ciudadsedeCliente : any = this.FormCrearSedeClientes.value.SedeCli_Ciudad;    
    let codigoPostal : any = this.FormCrearSedeClientes.value.SedeCli_Postal;
    let direccionSede : any = this.FormCrearSedeClientes.value.SedeCli_Direccion;
    this.pedidoCliente.llenarSedeCliente(id, ciudadsedeCliente, codigoPostal, direccionSede);
  }

}
