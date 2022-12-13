import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Table } from 'primeng/table';
import { ActivosService } from 'src/app/Servicios/Activos/Activos.service';
import { DetallePedido_MantenimientoService } from 'src/app/Servicios/DetallePedido_Mantenimiento/DetallePedido_Mantenimiento.service';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { Pedido_MantenimientoService } from 'src/app/Servicios/Pedido_Mantenimiento/Pedido_Mantenimiento.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import { Tipo_MantenimientoService } from 'src/app/Servicios/TiposMantenimientos/Tipo_Mantenimiento.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-Movimientos_Mantenimiento',
  templateUrl: './Movimientos_Mantenimiento.component.html',
  styleUrls: ['./Movimientos_Mantenimiento.component.css']
})

export class Movimientos_MantenimientoComponent implements OnInit {

  FormMovimientosMantenimiento !: FormGroup;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  cargando : boolean = false; //Variable que permitirá validar si debe salir o no la imagen de carga
  activos : any [] = []; //Variable que almacenará los activos
  tiposMantenimiento : any [] = []; //Variable que almacenará los diferentes tipos de mantenimientos
  estados : any [] = []; //Variable que almacenará los estados que puede tener un movimiento de mantenimiento
  movimientosConsultados : any [] = []; //Variable que almacenará toda la informacion de los movimientos consultados

  constructor(private frmBuilder : FormBuilder,
                @Inject(SESSION_STORAGE) private storage: WebStorageService,
                  private rolService : RolesService,
                    private pedidoMantenimientoService : Pedido_MantenimientoService,
                      private dtPedidoMantenimientoService : DetallePedido_MantenimientoService,
                        private activosService : ActivosService,
                          private tipoMantenimientoService : Tipo_MantenimientoService,
                            private estadosService : EstadosService,) {

    this.FormMovimientosMantenimiento = this.frmBuilder.group({
      ConsecutivoMovimiento : [null],
      IdActivo : [null],
      Activo : [null],
      IdTipoMantenimiento : [null],
      TipoMantenimiento : [null],
      FechaDaño : [null],
      Estado : [null],
      FechaInicial : [null],
      FechaFinal : [null],
      TipoMovimiento: [null],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.obtenerActivos();
    this.obtenerTiposMantenimiento();
    this.obtenerEstados();
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
    }, error => { this.mensajesError(`¡No se encontraron activos para realizar la consulta!`, error.message) });
  }

  // Función que obtendrá todos los tipos de mantenimiento
  obtenerTiposMantenimiento(){
    this.tipoMantenimientoService.GetTodo().subscribe(datos_tiposMantenimiento => {
      for (let i = 0; i < datos_tiposMantenimiento.length; i++) {
        this.tiposMantenimiento.push(datos_tiposMantenimiento[i]);
      }
    }, error => { this.mensajesError(`¡No se pudieron obtener los diferentes tipos de mantenimientos!`, error.message) });
  }

  // Funcion que obtendrá todos los posibles estados que pueden tener los movimientos de mantenimiento
  obtenerEstados(){
    this.estadosService.srvObtenerListaEstados().subscribe(datos_estados => {
      for (let i = 0; i < datos_estados.length; i++) {
        if (datos_estados[i].estado_Id == 11
            || datos_estados[i].estado_Id == 26
            || datos_estados[i].estado_Id == 4
            || datos_estados[i].estado_Id == 2
            || datos_estados[i].estado_Id == 17) this.estados.push(datos_estados[i]);
        this.estados.sort((a,b) => a.estado_Nombre.localeCompare(b.estado_Nombre));
      }
    }, error => { this.mensajesError(`¡Error al consultar los estados de los movimientos de mantenimiento!`, error.message); });
  }

  // Funcion que tomará el id del activo seleccionado, lo almacenará y cambiará el id por el nombre en el campo de activo
  buscarActivoSeleccionado(){
    this.activosService.GetId(this.FormMovimientosMantenimiento.value.Activo).subscribe(datos_activo => {
      this.FormMovimientosMantenimiento.setValue({
        ConsecutivoMovimiento : this.FormMovimientosMantenimiento.value.ConsecutivoMovimiento,
        IdActivo : datos_activo.actv_Id,
        Activo : datos_activo.actv_Nombre,
        IdTipoMantenimiento : this.FormMovimientosMantenimiento.value.IdTipoMantenimiento,
        TipoMantenimiento : this.FormMovimientosMantenimiento.value.TipoMantenimiento,
        FechaDaño : this.FormMovimientosMantenimiento.value.FechaDaño,
        Estado : this.FormMovimientosMantenimiento.value.Estado,
        FechaInicial : this.FormMovimientosMantenimiento.value.FechaInicial,
        FechaFinal : this.FormMovimientosMantenimiento.value.FechaFinal,
        TipoMovimiento: this.FormMovimientosMantenimiento.value.TipoMovimiento,
      });
    }, error => { this.mensajesError(`¡No se puede encontrar la información del activo ${this.FormMovimientosMantenimiento.value.Activo}!`, error.message) });
  }

  // Funcion que va a tomar el id de l tipo de mantenimiento seleccionado, lo almacenará y cambiará el id por el nombre en el campo de tipo de mantenimiento
  buscarTipoMantenimientoSeleccionado(){
    this.tipoMantenimientoService.GetId(this.FormMovimientosMantenimiento.value.TipoMantenimiento).subscribe(datos_tipoMtto => {
      this.FormMovimientosMantenimiento.setValue({
        ConsecutivoMovimiento : this.FormMovimientosMantenimiento.value.ConsecutivoMovimiento,
        IdActivo : this.FormMovimientosMantenimiento.value.IdActivo,
        Activo : this.FormMovimientosMantenimiento.value.Activo,
        IdTipoMantenimiento : datos_tipoMtto.tpMtto_Id,
        TipoMantenimiento : datos_tipoMtto.tpMtto_Nombre,
        FechaDaño : this.FormMovimientosMantenimiento.value.FechaDaño,
        Estado : this.FormMovimientosMantenimiento.value.Estado,
        FechaInicial : this.FormMovimientosMantenimiento.value.FechaInicial,
        FechaFinal : this.FormMovimientosMantenimiento.value.FechaFinal,
        TipoMovimiento: this.FormMovimientosMantenimiento.value.TipoMovimiento,
      });
    }, error => { this.mensajesError(`¡No se puedo obtner información acerca del tipo de mantenimiento ${this.FormMovimientosMantenimiento.value.TipoMantenimiento}!`, error.message) });
  }

  // Funcion que va a realizar la consulta de los movimientos
  consultar(){
    let consecutivo : number = this.FormMovimientosMantenimiento.value.ConsecutivoMovimiento;
    let tipoMivimiento : string = this.FormMovimientosMantenimiento.value.TipoMovimiento;
    let fechaInicial : any = this.FormMovimientosMantenimiento.value.FechaInicial;
    let fechaFinal : any = this.FormMovimientosMantenimiento.value.FechaFinal;
    let estado : number = this.FormMovimientosMantenimiento.value.Estado;
    let activo : number = this.FormMovimientosMantenimiento.value.IdActivo;
    let fechaDano : any = this.FormMovimientosMantenimiento.value.FechaDaño;
    let tipoMantenimiento : number = this.FormMovimientosMantenimiento.value.IdTipoMantenimiento;

    // if (consecutivo != null && tipoMivimiento != null && fechaInicial != null && fechaFinal != null && estado != null && activo != null && fechaDano != null && tipoMantenimiento != null) {
    // } else if (consecutivo != null && fechaInicial != null && fechaFinal != null && estado != null && activo != null && fechaDano != null && tipoMantenimiento != null) {
    // } else if (consecutivo != null && tipoMivimiento != null && fechaInicial != null && estado != null && activo != null && fechaDano != null && tipoMantenimiento != null) {
    // } else if (consecutivo != null && tipoMivimiento != null && fechaInicial != null && fechaFinal != null && activo != null && fechaDano != null && tipoMantenimiento != null) {
    // } else if (consecutivo != null && tipoMivimiento != null && fechaInicial != null && fechaFinal != null && estado != null && fechaDano != null && tipoMantenimiento != null) {
    // } else if (consecutivo != null && tipoMivimiento != null && fechaInicial != null && fechaFinal != null && estado != null && activo != null && tipoMantenimiento != null) {
    // } else if (consecutivo != null && tipoMivimiento != null && fechaInicial != null && fechaFinal != null && estado != null && activo != null && fechaDano != null) {
    // } else if (tipoMivimiento != null && fechaInicial != null && fechaFinal != null && estado != null && activo != null && fechaDano != null && tipoMantenimiento != null) {
    // } else if (consecutivo != null && fechaInicial != null && estado != null && activo != null && fechaDano != null && tipoMantenimiento != null) {
    // } else if (consecutivo != null && fechaInicial != null && fechaFinal != null && activo != null && fechaDano != null && tipoMantenimiento != null) {
    // } else if (consecutivo != null && fechaInicial != null && fechaFinal != null && estado != null && fechaDano != null && tipoMantenimiento != null) {
    // } else if (consecutivo != null && fechaInicial != null && fechaFinal != null && estado != null && activo != null && tipoMantenimiento != null) {
    // } else if (consecutivo != null && fechaInicial != null && fechaFinal != null && estado != null && activo != null && fechaDano != null) {
    // } else if (consecutivo != null && tipoMivimiento != null && estado != null && activo != null && fechaDano != null && tipoMantenimiento != null) {
    // } else if (consecutivo != null && tipoMivimiento != null && fechaInicial != null && activo != null && fechaDano != null && tipoMantenimiento != null) {
    // } else if (consecutivo != null && tipoMivimiento != null && fechaInicial != null && estado != null && fechaDano != null && tipoMantenimiento != null) {
    // } else if (consecutivo != null && tipoMivimiento != null && fechaInicial != null && estado != null && activo != null && tipoMantenimiento != null) {
    // } else if (consecutivo != null && tipoMivimiento != null && fechaInicial != null && estado != null && activo != null && fechaDano != null) {
    // } else if (consecutivo != null && tipoMivimiento != null && fechaInicial != null && fechaFinal != null && fechaDano != null && tipoMantenimiento != null) {
    // } else if (consecutivo != null && tipoMivimiento != null && fechaInicial != null && fechaFinal != null && activo != null && tipoMantenimiento != null) {
    // } else if (consecutivo != null && tipoMivimiento != null && fechaInicial != null && fechaFinal != null && activo != null && fechaDano != null) {
    // } else if (consecutivo != null && tipoMivimiento != null && fechaInicial != null && fechaFinal != null && estado != null && tipoMantenimiento != null) {
    // } else if (consecutivo != null && tipoMivimiento != null && fechaInicial != null && fechaFinal != null && estado != null && fechaDano != null) {
    // } else if (consecutivo != null && tipoMivimiento != null && fechaInicial != null && fechaFinal != null && estado != null && activo != null) {
    // } else if (fechaInicial != null && fechaFinal != null && estado != null && activo != null && fechaDano != null && tipoMantenimiento != null) {
    // } else if (tipoMivimiento != null && fechaInicial != null && estado != null && activo != null && fechaDano != null && tipoMantenimiento != null) {
    // } else if (tipoMivimiento != null && fechaInicial != null && fechaFinal != null && activo != null && fechaDano != null && tipoMantenimiento != null) {
    // } else if (tipoMivimiento != null && fechaInicial != null && fechaFinal != null && estado != null && fechaDano != null && tipoMantenimiento != null) {
    // } else if (tipoMivimiento != null && fechaInicial != null && fechaFinal != null && estado != null && activo != null && tipoMantenimiento != null) {
    // } else if (tipoMivimiento != null && fechaInicial != null && fechaFinal != null && estado != null && activo != null && fechaDano != null) {
    // } else if (consecutivo != null && estado != null && activo != null && fechaDano != null && tipoMantenimiento != null) {
    // } else if (consecutivo != null && fechaInicial != null && activo != null && fechaDano != null && tipoMantenimiento != null) {
    // } else if (consecutivo != null && fechaInicial != null && estado != null && fechaDano != null && tipoMantenimiento != null) {
    // } else if (consecutivo != null && fechaInicial != null && estado != null && activo != null && tipoMantenimiento != null) {
    // } else if (consecutivo != null && fechaInicial != null && estado != null && activo != null && fechaDano != null) {
    // } else if (consecutivo != null && fechaInicial != null && fechaFinal != null && fechaDano != null && tipoMantenimiento != null) {
    // } else if (consecutivo != null && fechaInicial != null && fechaFinal != null && activo != null && tipoMantenimiento != null) {
    // } else if (consecutivo != null && fechaInicial != null && fechaFinal != null && activo != null && fechaDano != null) {
    // } else if (consecutivo != null && fechaInicial != null && fechaFinal != null && estado != null && tipoMantenimiento != null) {
    // } else if (consecutivo != null && fechaInicial != null && fechaFinal != null && estado != null && fechaDano != null) {
    // } else if (consecutivo != null && fechaInicial != null && fechaFinal != null && estado != null && activo != null) {
    // } else if (consecutivo != null && tipoMivimiento != null && activo != null && fechaDano != null && tipoMantenimiento != null) {
    // } else if (consecutivo != null && tipoMivimiento != null && estado != null && fechaDano != null && tipoMantenimiento != null) {
    // } else if (consecutivo != null && tipoMivimiento != null && estado != null && activo != null && tipoMantenimiento != null) {
    // } else if (consecutivo != null && tipoMivimiento != null && estado != null && activo != null && fechaDano != null) {
    // } else if (consecutivo != null && tipoMivimiento != null && fechaInicial != null && fechaFinal != null && estado != null && activo != null && fechaDano != null && tipoMantenimiento != null) {
    // }
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

  // Funcion que limpiará los filtros utilizados en la tabla
  clear(table: Table) {
    table.clear();
  }

}
