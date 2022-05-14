import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TipoClienteService } from 'src/app/Servicios/tipo-cliente.service';
import { TipoIdentificacionService } from 'src/app/Servicios/tipo-identificacion.service';
import { UsuarioService } from 'src/app/Servicios/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-clientes',
  templateUrl: './crear-clientes.component.html',
  styleUrls: ['./crear-clientes.component.css']
})
export class ClientesComponent implements OnInit {

  public FormCrearClientes : FormGroup;

  tipoIdentificacion = [];
  tiposClientes = [];
  usuario = [];

  constructor(private formBuilderCrearClientes : FormBuilder,
                private tiposClientesService : TipoClienteService,
                  private tipoIdentificacionService : TipoIdentificacionService,
                    private usuarioService : UsuarioService) {

    this.FormCrearClientes = this.formBuilderCrearClientes.group({
      CliId: new FormControl,
      TipoIdCliente: new FormControl(),
      CliNombre:  new FormControl(),
      CliDireccion:  new FormControl(),
      CliTelefono:  new FormControl(),
      CliEmail:  new FormControl(),
      TipoClienteId: new FormControl(),
      UsuIdNombre: new FormControl(),

      SedeCli_Id: new FormControl(),
      SedeCli_Ciudad: new FormControl(),
      CliId2: new FormControl(),
      SedeCli_Postal: new FormControl(),
      SedeCli_Direccion: new FormControl(),

    })

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
       CliDireccion: ['', Validators.required],
       CliTelefono: ['', Validators.required],
       CliEmail: ['', Validators.required],
       TipoClienteId: ['', Validators.required],
       UsuIdNombre: ['', Validators.required],

       SedeCli_Id: ['', Validators.required],
       SedeCli_Ciudad: ['', Validators.required],
       CliId2: ['', Validators.required],
       SedeCli_Postal: ['', Validators.required],
       SedeCli_Direccion: ['', Validators.required]
    })
  }


  validarCamposVacios() : any{
    if(this.FormCrearClientes.valid){

      Swal.fire("Los datos se enviaron correctamente");
      console.log(this.FormCrearClientes);
    }else{
      Swal.fire("Hay campos vacios");
      console.log(this.FormCrearClientes);
    }
  }

  LimpiarCampos() {
    this.FormCrearClientes.reset();
  }


  guardarClientes(){
    const camposClientes : any = {
      ClieId: this.FormCrearClientes.get('')?.value,
      TpIdCliente: this.FormCrearClientes.get('')?.value,
      ClieNombre: this.FormCrearClientes.get('')?.value,
      ClieDireccion: this.FormCrearClientes.get('')?.value,
      ClieTelefono: this.FormCrearClientes.get('')?.value,
      ClieEmail: this.FormCrearClientes.get('')?.value,
      TpClienteId: this.FormCrearClientes.get('')?.value,
      UsuIdNombre: this.FormCrearClientes.get('')?.value,

      SedeClie_Id: this.FormCrearClientes.get('')?.value,
      SedeClie_Ciudad: this.FormCrearClientes.get('')?.value,
      ClieId2: this.FormCrearClientes.get('')?.value,
      SedeClie_Postal: this.FormCrearClientes.get('')?.value,
      SedeClie_Direccion: this.FormCrearClientes.get('')?.value
    }
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
    }, error => { Swal.fire('Ocurrió un error, intentelo de nuevo'); });
  }

  usuarioComboBox() {
    this.usuarioService.srvObtenerListaUsuario().subscribe(datos_usuarios => {
      for (let index = 0; index < datos_usuarios.length; index++) {
        this.usuario.push(datos_usuarios[index].usua_Nombre);        
      }
    })
  }

}
