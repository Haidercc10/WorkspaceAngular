import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { ActivosService } from 'src/app/Servicios/Activos/Activos.service';
import { DetallePedido_MantenimientoService } from 'src/app/Servicios/DetallePedido_Mantenimiento/DetallePedido_Mantenimiento.service';
import { Pedido_MantenimientoService } from 'src/app/Servicios/Pedido_Mantenimiento/Pedido_Mantenimiento.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import { Tipo_MantenimientoService } from 'src/app/Servicios/TiposMantenimientos/Tipo_Mantenimiento.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})

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
                  private rolService : RolesService,
                    private pedidoMantenimientoService : Pedido_MantenimientoService,
                      private dtPedidoMantenimientoService : DetallePedido_MantenimientoService,
                        private activosService : ActivosService,
                          private tipoMantenimientoService : Tipo_MantenimientoService,) {

    this.FormPedidoMantenimiento = this.frmBuilder.group({
      ConsecutivoPedido : [null],
      Observacion : [null],
      IdActivo : [null, Validators.required],
      Activo : [null, Validators.required],
      IdTipoMantenimiento : [null, Validators.required],
      TipoMantenimiento : [null, Validators.required],
      FechaDaño : [null, Validators.required],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.obtenerActivos();
    this.obtenerUlimoId();
    this.obtenerTiposMantenimiento();
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

  // Funcion que cargará los activos
  obtenerActivos(){
    this.activosService.GetTodo().subscribe(datos_activos => {
      for (let i = 0; i < datos_activos.length; i++) {
        this.activos.push(datos_activos[i]);
      }
    }, error => { this.mensajesError(`¡No se encontraron activos para realizar el pedido!`, error.message) });
  }

  // Funcion que obtendrá el id el ultimo pedido creado para saber que consecutivo es el siguiente
  obtenerUlimoId(){
    this.pedidoMantenimientoService.getUltimoIdPedido().subscribe(datos_ultimoPedido => {
      this.FormPedidoMantenimiento.setValue({
        ConsecutivoPedido : datos_ultimoPedido + 1,
        Observacion : this.FormPedidoMantenimiento.value.Observacion,
        IdActivo : this.FormPedidoMantenimiento.value.IdActivo,
        Activo : this.FormPedidoMantenimiento.value.Activo,
        IdTipoMantenimiento : this.FormPedidoMantenimiento.value.IdTipoMantenimiento,
        TipoMantenimiento : this.FormPedidoMantenimiento.value.TipoMantenimiento,
        FechaDaño : this.FormPedidoMantenimiento.value.FechaDaño,
      });
    }, error => { this.mensajesError(`¡No se puedo obtener el consecutivo del próximo pedido!`, error.message) });
  }

  // Función que obtendrá todos los tipos de mantenimiento
  obtenerTiposMantenimiento(){
    this.tipoMantenimientoService.GetTodo().subscribe(datos_tiposMantenimiento => {
      for (let i = 0; i < datos_tiposMantenimiento.length; i++) {
        this.tiposMantenimiento.push(datos_tiposMantenimiento[i]);
      }
    }, error => { this.mensajesError(`¡No se pudieron obtener los diferentes tipos de mantenimientos!`, error.message) });
  }

  // Funcion que tomará el id del activo seleccionado, lo almacenará y cambiará el id por el nombre en el campo de activo
  buscarActivoSeleccionado(){
    this.activosService.GetId(this.FormPedidoMantenimiento.value.Activo).subscribe(datos_activo => {
      this.FormPedidoMantenimiento.setValue({
        ConsecutivoPedido : this.FormPedidoMantenimiento.value.ConsecutivoPedido,
        Observacion : this.FormPedidoMantenimiento.value.Observacion,
        IdActivo : datos_activo.actv_Id,
        Activo : datos_activo.actv_Nombre,
        IdTipoMantenimiento : this.FormPedidoMantenimiento.value.IdTipoMantenimiento,
        TipoMantenimiento : this.FormPedidoMantenimiento.value.TipoMantenimiento,
        FechaDaño : this.FormPedidoMantenimiento.value.FechaDaño,
      });
    }, error => { this.mensajesError(`¡No se puede encontrar la información del activo ${this.FormPedidoMantenimiento.value.Activo}!`, error.message) });
  }

  // Funcion que va a tomar el id de l tipo de mantenimiento seleccionado, lo almacenará y cambiará el id por el nombre en el campo de tipo de mantenimiento
  buscarTipoMantenimientoSeleccionado(){
    this.tipoMantenimientoService.GetId(this.FormPedidoMantenimiento.value.TipoMantenimiento).subscribe(datos_tipoMtto => {
      this.FormPedidoMantenimiento.setValue({
        ConsecutivoPedido : this.FormPedidoMantenimiento.value.ConsecutivoPedido,
        Observacion : this.FormPedidoMantenimiento.value.Observacion,
        IdActivo : this.FormPedidoMantenimiento.value.IdActivo,
        Activo : this.FormPedidoMantenimiento.value.Activo,
        IdTipoMantenimiento : datos_tipoMtto.tpMtto_Id,
        TipoMantenimiento : datos_tipoMtto.tpMtto_Nombre,
        FechaDaño : this.FormPedidoMantenimiento.value.FechaDaño,
      });
    }, error => { this.mensajesError(`¡No se puedo obtner información acerca del tipo de mantenimiento ${this.FormPedidoMantenimiento.value.TipoMantenimiento}!`, error.message) });
  }

  // Funcion que limpiará los campos donde se elegen los activos a los que se les hará mantenimiento
  limpiarCampos(){
    this.FormPedidoMantenimiento.reset();
    this.cargando = false;
  }

  // Funcion que va a limpiar todos los campos y dejará la vista como nueva
  limpiarTodo(){
    this.obtenerUlimoId();
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
          Id_TipoMantenimiento: this.FormPedidoMantenimiento.value.IdTipoMantenimiento,
        }
        this.activosSeleccionados.push(info);
        this.idActivosSeleccionados.push(info.Id);
        this.cargando = false;
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
                timer: 3500,
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
          timer: 3500,
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
      let observacion : string = this.FormPedidoMantenimiento.value.Observacion;
      if (observacion == null) observacion = '';
      let info : any = {
        Usua_Id : this.storage_Id,
        PedMtto_Fecha : this.today,
        PedMtto_Hora : moment().format('H:mm:ss'),
        Estado_Id : 11,
        PedMtto_Observacion : observacion,
      }
      this.pedidoMantenimientoService.Insert(info).subscribe(datos_pedido => { this.buscarUltimoID(); }, error => { this.mensajesError('¡Ha ocurrido un error al crear el pedido de mantenimiento!', error.message) });
    } else this.mensajesAdvertencia(`¡Debe seleccionar minimo un activo para crear el pedido de mantenimiento!`);
  }

  // Funcion que va a buscar el ultimo Id del ultimo pedido creado y creará los detalles de manteniientos
  buscarUltimoID(){
    this.pedidoMantenimientoService.getUltimoIdPedido().subscribe(datos_ultimoPedido => {
      for (let i = 0; i < this.activosSeleccionados.length; i++) {
        let info : any = {
          PedMtto_Id : datos_ultimoPedido,
          Actv_Id : this.activosSeleccionados[i].Id,
          TpMtto_Id : this.activosSeleccionados[i].Id_TipoMantenimiento,
          DtPedMtto_FechaFalla : this.activosSeleccionados[i].Fecha,
        }
        this.dtPedidoMantenimientoService.Insert(info).subscribe(datos_pedidoCreado => {}, error => { this.mensajesError(`¡Error al almacenar los activos a los que se les hará mantenimientos!`, error.message) });
      }
      setTimeout(() => {
        Swal.fire({ icon : 'success', title : `Registro Exitoso`, text : `¡Se ha creado un Pedido de Mantenimiento para ${this.activosSeleccionados.length} activo(s)!` });
        this.limpiarTodo();
      }, 10 * this.activosSeleccionados.length);
    }, error => { this.mensajesError(`¡No se puedo obtener el consecutivo del próximo pedido!`, error.message) });
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