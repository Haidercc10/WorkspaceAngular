import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Table } from 'primeng/table';
import { ActivosService } from 'src/app/Servicios/Activos/Activos.service';
import { AreaService } from 'src/app/Servicios/Areas/area.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import { Tipo_ActivoService } from 'src/app/Servicios/TiposActivos/Tipo_Activo.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-Reporte_Mantenimiento',
  templateUrl: './Reporte_Mantenimiento.component.html',
  styleUrls: ['./Reporte_Mantenimiento.component.css']
})

export class Reporte_MantenimientoComponent implements OnInit {

  FormActivos !: FormGroup; //Formulario de por el que se podrá hacer consultas mas especificas
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  cargando : boolean = false; //Variable que permitirá validar si debe salir o no la imagen de carga
  tiposActivos : any [] = []; //Variable que va a almacenar los diferentes tipos de activos
  areas : any [] = []; //Variable que va a almacenar las difrentes areas
  activos : any [] = []; //Variable que va a almacenar los diferentes activos
  InformacionActivos : any [] = []; //Variable que va a almacenar los datos consultados y los mostrará en la tabla

  constructor(private frmBuilderMateriaPrima : FormBuilder,
                private rolService : RolesService,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                    private areasService : AreaService,
                      private activosService : ActivosService,
                        private tipoActivoService : Tipo_ActivoService,) {

    this.FormActivos = this.frmBuilderMateriaPrima.group({
      ActivoId : [null, Validators.required],
      ActivoNombre: [null, Validators.required],
      FechaInicial: [null, Validators.required],
      FechaFinal: [null, Validators.required],
      TipoActivo : [null, Validators.required],
      AreasActivos : [null, Validators.required],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.obtenerTiposActivos();
    this.obtenerAreas();
    this.consultarActivos();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
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

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion, los numeros al finalizar serán retornados como string
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  // Funcion que va a limpiar todo
  LimpiarCampos() {
    this.FormActivos.reset();
  }

  // Funcion que obtendrá los tipos de activos
  obtenerTiposActivos(){
    this.tipoActivoService.GetTodo().subscribe(datos_tiposActivos => {
      for (let i = 0; i < datos_tiposActivos.length; i++) {
        this.tiposActivos.push(datos_tiposActivos[i]);
      }
    });
  }

  // Funcion que va a obtener las areas de la empresa
  obtenerAreas(){
    this.areasService.srvObtenerLista().subscribe(datos_areas => {
      for (let i = 0; i < datos_areas.length; i++) {
        this.areas.push(datos_areas[i]);
      }
    });
  }

  // Funcion que buscará el nombre de un activo
  buscarActivo(){
    this.activos = [];
    let nombreActivo : string = this.FormActivos.value.ActivoNombre;
    this.activosService.GetActivoNombre(nombreActivo).subscribe(datos_activos => {
      for (let i = 0; i < datos_activos.length; i++) {
        this.activos.push(datos_activos[i]);
      }
    }, error => { this.mensajesError(`¡No se encontró informacaión de activos con la información brindada!`, error.message); });
  }

  // Funcion que tomará el id del activo seleccionado, lo almacenará y cambiará el id por el nombre en el campo de activo
  buscarActivoSeleccionado(){
    this.activosService.GetId(this.FormActivos.value.ActivoNombre).subscribe(datos_activo => {
      this.FormActivos.setValue({
        ActivoId : datos_activo.actv_Id,
        ActivoNombre : datos_activo.actv_Nombre,
        FechaInicial : this.FormActivos.value.FechaInicial,
        FechaFinal : this.FormActivos.value.FechaFinal,
        TipoActivo : this.FormActivos.value.TipoActivo,
        AreasActivos : this.FormActivos.value.AreasActivos,
      });
    }, error => { this.mensajesError(`¡No se puede encontrar la información del activo ${this.FormActivos.value.Activo}!`, error.message) });
  }

  // Funcion que va a consultar la información de los activos
  consultarActivos(){
    this.cargando = true;
    this.activosService.GetTodo().subscribe(datos_activos => {
      for (let i = 0; i < datos_activos.length; i++) {
        this.activosService.GetInfoActivos(datos_activos[i].actv_Id).subscribe(datos_infoActivos => {
          if (datos_infoActivos.length == 0) this.llenarTablaSinMantenimientos(datos_infoActivos);
          else this.llenarTabla(datos_infoActivos);
        }, error => { this.mensajesError(`¡No se ha podido buscar la información del activo ${datos_activos[i].actv_Nombre}!`, error.message); });
      }
    }, error => { this.mensajesError(`¡No se han podido consultar los activos!`, error.message); });
  }

  // Funcion que va a llenar la tabla con la información proveniente de la consulta
  llenarTabla(datos : any){
    let info : any = {
      Id : datos.activo_Id,
      Nombre : datos.activo_Nombre,
      Fecha : datos.fecha_Compra.replace('T00:00:00', ''),
      FechaUltMtto : datos.fecha_UltMtto.replace('T00:00:00', ''),
      PrecioCompra : datos.precio_Compra,
      PrecioUltMtto : datos.precio_UltMtto,
      PrecioTotalMtto : datos.precio_TotalMtto,
      Depreciacion : datos.depreciacion,
    }
    this.InformacionActivos.push(info);
    this.cargando = false;
  }

  // Funcion que va a llenar tabla si el activo consultado no tiene mantenimientos
  llenarTablaSinMantenimientos(datos : any){
    let info : any = {
      Id : datos.actv_Serial,
      Nombre : datos.actv_Nombre,
      Fecha : datos.actv_FechaCompra.replace('T00:00:00', ''),
      FechaUltMtto : '',
      PrecioCompra : datos.actv_PrecioCompra,
      PrecioUltMtto : 0,
      PrecioTotalMtto : 0,
      Depreciacion : datos.actv_Depreciacion,
    }
    this.InformacionActivos.push(info);
    this.cargando = false;
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
