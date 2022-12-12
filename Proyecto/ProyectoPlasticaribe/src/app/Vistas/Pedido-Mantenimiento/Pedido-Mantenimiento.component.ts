import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-Pedido-Mantenimiento',
  templateUrl: './Pedido-Mantenimiento.component.html',
  styleUrls: ['./Pedido-Mantenimiento.component.css']
})

export class PedidoMantenimientoComponent implements OnInit {

  FormPedidoMantenimiento : FormGroup;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  cargando : boolean = false; //Variable que permitirá validar si debe salir o no la imagen de carga
  activos : any [] = []; //Variable que almacenará los activos
  tiposMantenimiento : any [] = []; //Variable que almacenará los diferentes tipos de mantenimientos
  activosSeleccionados : any [] = []; //Variable que almacenará los activos seleccionados para el mantenimiento
  idActivosSeleccionados : number [] = []; //Variable que va a almacenar el id de cada uno de los activos selccionados

  constructor(private frmBuilder : FormBuilder,
                @Inject(SESSION_STORAGE) private storage: WebStorageService,
                  private rolService : RolesService) {

    this.FormPedidoMantenimiento = this.frmBuilder.group({
      ConsecutivoPedido : [null],
      Observacion : [null],
      IdActivo : [0, Validators.required],
      Activo : [null, Validators.required],
      TipoMantenimiento : [null, Validators.required],
      FechaDaño : [null, Validators.required],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
  }

  /**Leer storage para validar su rol y mostrar el usuario. */
  lecturaStorage(){
    this.storage_Id = this.storage.get('Id');
    this.storage_Nombre = this.storage.get('Nombre');
    let rol = this.storage.get('Rol');
    this.rolService.srvObtenerLista().subscribe(datos_roles => {
      for (let index = 0; index < datos_roles.length; index++) {
        if (datos_roles[index].rolUsu_Id == rol) {
          this.ValidarRol = rol;
          this.storage_Rol = datos_roles[index].rolUsu_Nombre;
        }
      }
    });
  }

  // Funcion que limpiará los campos donde se elegen los activos a los que se les hará mantenimiento
  limpiarCampos(){
    this.FormPedidoMantenimiento.reset();
    this.cargando = false;
  }

  // Funcion que va a limpiar todos los campos y dejará la vista como nueva
  limpiarTodo(){
    this.FormPedidoMantenimiento.reset();
    this.idActivosSeleccionados = [];
    this.activosSeleccionados = [];
    this.cargando = false;
  }

  // Funcion que sleccionará un activo
  seleccionarActivo(){
    this.cargando = true;
    if (this.FormPedidoMantenimiento.valid) {
      if (!this.idActivosSeleccionados.includes(this.FormPedidoMantenimiento.value.IdActivo)){
        let info : any = {
          Id: this.FormPedidoMantenimiento.value.IdActivo,
          Nombre: this.FormPedidoMantenimiento.value.Activo,
          Fecha: this.FormPedidoMantenimiento.value.FechaDaño,
          TipoMantenimiento: this.FormPedidoMantenimiento.value.TipoMantenimiento,
        }
        this.activosSeleccionados.push(info);
        this.idActivosSeleccionados.push(info.Id);
      } else this.mensajesAdvertencia(`¡El activo ${this.FormPedidoMantenimiento.value.Activo} ha sido seleccionado previamente!`);;
    } else this.mensajesAdvertencia(`¡Hay campos vacios!`);
  }

  // Funcion que quitará de la tabla de los activos seleccionados
  quitarActivo(item : any){
    Swal.fire({
      title: `¿Estás seguro de eliminar el activo ${item.Nombre} del pedido?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        for (let i = 0; i < this.activosSeleccionados.length; i++) {
          for (let j = 0; j < this.idActivosSeleccionados.length; j++) {
            if (item.Id == this.activosSeleccionados[i].Id && item.Id == this.idActivosSeleccionados[j]) {
              this.activosSeleccionados.splice(i,1);
              this.idActivosSeleccionados.splice(j,1);
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
                title: `¡Se ha quitado el activo ${item.Nombre} del pedido!`
              });
              break;
            }
          }
        }
      }
    });
  }

  // Funcion que quitará todos los activos seleccionados para mantenimiento
  quitarTodos(){
    Swal.fire({
      title: `¿Estás seguro de eliminar todos los activos del pedido?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.activosSeleccionados = [];
        this.idActivosSeleccionados = [];
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
          title: `¡Se han eliminado todos los activos del pedido!`
        });
      }
    });
  }

  // Funcion que creará el pedido de mantenimiento de activos
  crearPedido(){
    if (this.activosSeleccionados.length > 0) {

    } else this.mensajesAdvertencia(`¡Debe seleccionar minimo un activo para crear el pedido de mantenimiento!`);
  }

  // Funcion que pasará mensajes de advertencia
  mensajesAdvertencia(texto : string){
    Swal.fire({ icon : 'warning', title : `Advertencia`, text : texto });
    this.cargando = false;
  }

  // Funcion que enviaraá mensajes de error
  mensajesError(texto : string, error : any = ''){
    Swal.fire({ icon : 'error', title : `Opps...`, html: `<b>${texto}</b><br>` + `<spam style="color: #f00">${error}</spam>` });
    this.cargando = false;
  }
}
