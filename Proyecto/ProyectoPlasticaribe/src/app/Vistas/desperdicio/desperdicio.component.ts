import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { ActivosService } from 'src/app/Servicios/Activos/Activos.service';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { DesperdicioService } from 'src/app/Servicios/Desperdicio/desperdicio.service';
import { FallasTecnicasService } from 'src/app/Servicios/FallasTecnicas/FallasTecnicas.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app.desperdicio.component',
  templateUrl: './desperdicio.component.html',
  styleUrls: ['./desperdicio.component.css']
})

export class DesperdicioComponent implements OnInit {

  FormDesperdicio !: FormGroup;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  cargando : boolean = false; //Variable que permitirá validar si debe salir o no la imagen de carga
  fallas : any [] = []; //Variable que almacenará los diferentes tipos de fallas por los que se puede dar un desperdicio
  operarios : any [] = []; //Variable que almacenará la informacion de los operarios
  procesos : any [] = []; //Variable que almacenará los procesos de produccion de la empresa
  maquinas : any [] = [];
  grupoDespercios : any [] = [];

  constructor(private frmBuilder : FormBuilder,
                private rolService : RolesService,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                    private bagProService : BagproService,
                      private operariosService : UsuarioService,
                        private procesosService : ProcesosService,
                          private fallasService : FallasTecnicasService,
                            private maquinasService : ActivosService,
                              private deperdicioService : DesperdicioService,) {

    this.FormDesperdicio = this.frmBuilder.group({
      OTDesperdicio : [null, Validators.required],
      IdMaquina : [null, Validators.required],
      Maquina : [null, Validators.required],
      IdOperario : [null, Validators.required],
      Operario : [null, Validators.required],
      IdProducto : [null, Validators.required],
      Producto : [null, Validators.required],
      IdTipoMaterial : [null, Validators.required],
      TipoMaterial : [null, Validators.required],
      Impreso : [null, Validators.required],
      IdTipoNoConformidad : [null, Validators.required],
      TipoNoConformidad : [null, Validators.required],
      CantidadKg : [null, Validators.required],
      Observacion : [null],
      IdArea : [null, Validators.required],
      Area : [null, Validators.required],
      Fecha : [null, Validators.required],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.obtenerOperarios();
    this.obtenerProcesos();
    this.obtenerFallas();
    this.obtenerMaquinas();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage() {
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
    }, error => { this.mensajesError(`¡Error al concetarse con el API!`, error.message); });
  }

  // Funcion que limpiará los campos del formulario
  limpiarCampos(){
    this.FormDesperdicio.reset();
  }

  // Funcion que va a limpiar todo
  limpiarTodo(){
    this.cargando = false;
    this.FormDesperdicio.reset();
    this.grupoDespercios = [];
  }

  // Funcion que va a consultar los operarios
  obtenerOperarios(){
    this.operariosService.getUsuarios().subscribe(datos_operarios => {
      for (let i = 0; i < datos_operarios.length; i++) {
        this.operarios.push(datos_operarios[i]);
      }
    });
  }

  //Funcion que va a conultar y obtener todas las areas de la empresa
  obtenerProcesos(){
    this.procesosService.srvObtenerLista().subscribe(datos_procesos => {
      for (let i = 0; i < datos_procesos.length; i++) {
        if (datos_procesos[i].proceso_Codigo != 12
          && datos_procesos[i].proceso_Codigo != 11
          && datos_procesos[i].proceso_Codigo != 10) this.procesos.push(datos_procesos[i]);
      }
    });
  }

  // Funcion que va a consultar y obtener la informacion de las fallas
  obtenerFallas(){
    this.fallasService.srvObtenerLista().subscribe(datos_fallas => {
      for (let i = 0; i < datos_fallas.length; i++) {
        if (datos_fallas[i].tipoFalla_Id == 11) this.fallas.push(datos_fallas[i]);
      }
    });
  }

  // Funcion que va a consultar y obtener la informacion de las maquinas
  obtenerMaquinas(){
    this.maquinasService.GetTodo().subscribe(datos_maquinas => {
      for (let i = 0; i < datos_maquinas.length; i++) {
        this.maquinas.push(datos_maquinas[i]);
      }
    });
  }

  // Funcion que va a consultar el id de la falla y en su lugar colocará el nombre en el formulario
  buscarFalla(){
    this.fallasService.srvObtenerListaPorId(this.FormDesperdicio.value.TipoNoConformidad).subscribe(datos_falla => {
      this.FormDesperdicio.setValue({
        OTDesperdicio : this.FormDesperdicio.value.OTDesperdicio,
        IdMaquina : this.FormDesperdicio.value.IdMaquina,
        Maquina : this.FormDesperdicio.value.Maquina,
        IdOperario : this.FormDesperdicio.value.IdOperario,
        Operario : this.FormDesperdicio.value.Operario,
        IdProducto : this.FormDesperdicio.value.IdProducto,
        Producto : this.FormDesperdicio.value.Producto,
        IdTipoMaterial : this.FormDesperdicio.value.IdTipoMaterial,
        TipoMaterial : this.FormDesperdicio.value.TipoMaterial,
        Impreso : this.FormDesperdicio.value.Impreso,
        IdTipoNoConformidad : datos_falla.falla_Id,
        TipoNoConformidad : datos_falla.falla_Nombre,
        CantidadKg : this.FormDesperdicio.value.CantidadKg,
        Observacion : this.FormDesperdicio.value.Observacion,
        IdArea : this.FormDesperdicio.value.IdArea,
        Area : this.FormDesperdicio.value.Area,
        Fecha : this.FormDesperdicio.value.Fecha,
      });
    }, error => { this.mensajesError(`¡No se pudo obtener información de la "No Conformidad" seleccionada!`, error.message); });
  }

  // Funcion que va a consultar el id del operario y en su lugar colocará el nombre en el formulario
  buscarOperario(){
    this.operariosService.srvObtenerListaPorId(this.FormDesperdicio.value.Operario).subscribe(datos_operario => {
      this.FormDesperdicio.setValue({
        OTDesperdicio : this.FormDesperdicio.value.OTDesperdicio,
        IdMaquina : this.FormDesperdicio.value.IdMaquina,
        Maquina : this.FormDesperdicio.value.Maquina,
        IdOperario : datos_operario.usua_Id,
        Operario : datos_operario.usua_Nombre,
        IdProducto : this.FormDesperdicio.value.IdProducto,
        Producto : this.FormDesperdicio.value.Producto,
        IdTipoMaterial : this.FormDesperdicio.value.IdTipoMaterial,
        TipoMaterial : this.FormDesperdicio.value.TipoMaterial,
        Impreso : this.FormDesperdicio.value.Impreso,
        IdTipoNoConformidad : this.FormDesperdicio.value.IdTipoNoConformidad,
        TipoNoConformidad : this.FormDesperdicio.value.TipoNoConformidad,
        CantidadKg : this.FormDesperdicio.value.CantidadKg,
        Observacion : this.FormDesperdicio.value.Observacion,
        IdArea : this.FormDesperdicio.value.IdArea,
        Area : this.FormDesperdicio.value.Area,
        Fecha : this.FormDesperdicio.value.Fecha,
      });
    }, error => { this.mensajesError(`¡No se pudo obtener información del operario seleccionada!`, error.message); });
  }

  // Funcion que va a consultar el id de la maquina y en su lugar colocará el serial de la maquina
  buscarMaquina(){
    this.maquinasService.GetId(this.FormDesperdicio.value.Maquina).subscribe(datos_maquinas => {
      this.FormDesperdicio.setValue({
        OTDesperdicio : this.FormDesperdicio.value.OTDesperdicio,
        IdMaquina : datos_maquinas.actv_Id,
        Maquina : datos_maquinas.actv_Serial,
        IdOperario : this.FormDesperdicio.value.IdOperario,
        Operario : this.FormDesperdicio.value.Operario,
        IdProducto : this.FormDesperdicio.value.IdProducto,
        Producto : this.FormDesperdicio.value.Producto,
        IdTipoMaterial : this.FormDesperdicio.value.IdTipoMaterial,
        TipoMaterial : this.FormDesperdicio.value.TipoMaterial,
        Impreso : this.FormDesperdicio.value.Impreso,
        IdTipoNoConformidad : this.FormDesperdicio.value.IdTipoNoConformidad,
        TipoNoConformidad : this.FormDesperdicio.value.TipoNoConformidad,
        CantidadKg : this.FormDesperdicio.value.CantidadKg,
        Observacion : this.FormDesperdicio.value.Observacion,
        IdArea : this.FormDesperdicio.value.IdArea,
        Area : this.FormDesperdicio.value.Area,
        Fecha : this.FormDesperdicio.value.Fecha,
      });
    }, error => { this.mensajesError(`¡No se pudo obtener información de la maquina seleccionada!`, error.message); });
  }

  // Funcion que va a consultar el id del area y en su lugar colocará el nombre del area o proceso
  buscarProceso(){
    this.procesosService.srvObtenerListaPorId(this.FormDesperdicio.value.Area).subscribe(datos_procesos => {
      this.FormDesperdicio.setValue({
        OTDesperdicio : this.FormDesperdicio.value.OTDesperdicio,
        IdMaquina : this.FormDesperdicio.value.IdMaquina,
        Maquina : this.FormDesperdicio.value.Maquina,
        IdOperario : this.FormDesperdicio.value.IdOperario,
        Operario : this.FormDesperdicio.value.Operario,
        IdProducto : this.FormDesperdicio.value.IdProducto,
        Producto : this.FormDesperdicio.value.Producto,
        IdTipoMaterial : this.FormDesperdicio.value.IdTipoMaterial,
        TipoMaterial : this.FormDesperdicio.value.TipoMaterial,
        Impreso : this.FormDesperdicio.value.Impreso,
        IdTipoNoConformidad : this.FormDesperdicio.value.IdTipoNoConformidad,
        TipoNoConformidad : this.FormDesperdicio.value.TipoNoConformidad,
        CantidadKg : this.FormDesperdicio.value.CantidadKg,
        Observacion : this.FormDesperdicio.value.Observacion,
        IdArea : datos_procesos.proceso_Id,
        Area : datos_procesos.proceso_Nombre,
        Fecha : this.FormDesperdicio.value.Fecha,
      });
    }, error => { this.mensajesError(`¡No se pudo obtener información del área seleccionada!`, error.message); });
  }

  // Funcion que consultará la informacion de la orden de trabajo
  consultarOrdenTrabajo(){
    this.cargando = true;
    let orden : number = this.FormDesperdicio.value.OTDesperdicio;
    this.bagProService.srvObtenerListaClienteOT_Item(orden).subscribe(datos_orden => {
      for (let i = 0; i < datos_orden.length; i++) {
        let imp : any = datos_orden[i].impresion.trim();
        if (imp == "1") imp = "SI";
        else if (imp == "0") imp = "NO";
        this.FormDesperdicio.setValue({
          OTDesperdicio : orden,
          IdMaquina : this.FormDesperdicio.value.IdMaquina,
          Maquina : this.FormDesperdicio.value.Maquina,
          IdOperario : this.FormDesperdicio.value.IdOperario,
          Operario : this.FormDesperdicio.value.Operario,
          IdProducto : datos_orden[i].clienteItems,
          Producto : datos_orden[i].clienteItemsNom,
          IdTipoMaterial : datos_orden[i].extMaterial,
          TipoMaterial : datos_orden[i].extMaterialNom,
          Impreso : imp,
          IdTipoNoConformidad : this.FormDesperdicio.value.IdTipoNoConformidad,
          TipoNoConformidad : this.FormDesperdicio.value.TipoNoConformidad,
          CantidadKg : this.FormDesperdicio.value.CantidadKg,
          Observacion : this.FormDesperdicio.value.Observacion,
          IdArea : this.FormDesperdicio.value.IdArea,
          Area : this.FormDesperdicio.value.Area,
          Fecha : this.FormDesperdicio.value.Fecha,
        });
        this.cargando = false;
      }
    }, error => { this.mensajesError(`¡No se pudo obtener información de la orden de trabajo N° ${orden}!`, error.message); });
  }

  // Funcion que va a llenar la tabla con la informacion del desperdicio digitadi
  llenarTabla(){
    if (this.FormDesperdicio.valid) {
      let info : any = {
        Ot : this.FormDesperdicio.value.OTDesperdicio,
        IdMaquina : this.FormDesperdicio.value.IdMaquina,
        Maquina : this.FormDesperdicio.value.Maquina,
        IdItem : this.FormDesperdicio.value.IdProducto,
        Item : `${this.FormDesperdicio.value.IdProducto} - ${this.FormDesperdicio.value.Producto}`,
        IdMateria : parseInt(this.FormDesperdicio.value.IdTipoMaterial.trim()),
        Material : this.FormDesperdicio.value.TipoMaterial,
        IdOperario : this.FormDesperdicio.value.IdOperario,
        Operario : this.FormDesperdicio.value.Operario,
        IdNoConformidad : this.FormDesperdicio.value.IdTipoNoConformidad,
        NoConformidad : this.FormDesperdicio.value.TipoNoConformidad,
        Cantidad : this.FormDesperdicio.value.CantidadKg,
        Impreso : this.FormDesperdicio.value.Impreso,
        Observacion : this.FormDesperdicio.value.Observacion,
        Fecha : this.FormDesperdicio.value.Fecha,
        IdArea : this.FormDesperdicio.value.IdArea,
        Area : this.FormDesperdicio.value.Area,
      }
      this.grupoDespercios.push(info);
      this.limpiarCampos();
    } else this.mensajesAdvertencia(`¡Hay Campos Vacios!`);
  }

  // Funcion que va a crear el registro de desperdicio
  crearDesperdicio(){
    if (this.grupoDespercios.length != 0){
      this.cargando = true;
      for (let i = 0; i < this.grupoDespercios.length; i++) {
        let info : any = {
          Desp_OT : this.grupoDespercios[i].Ot,
          Prod_Id : this.grupoDespercios[i].IdItem,
          Material_Id : this.grupoDespercios[i].IdMateria,
          Actv_Id : this.grupoDespercios[i].IdMaquina,
          Usua_Operario : this.grupoDespercios[i].IdOperario,
          Desp_Impresion : this.grupoDespercios[i].Impreso,
          Falla_Id : this.grupoDespercios[i].IdNoConformidad,
          Desp_PesoKg : this.grupoDespercios[i].Cantidad,
          Desp_Fecha : this.grupoDespercios[i].Fecha,
          Desp_Observacion : this.grupoDespercios[i].Observacion,
          Usua_Id : this.storage_Id,
          Desp_FechaRegistro : this.today,
          Desp_HoraRegistro : moment().format('H:mm:ss'),
          Proceso_Id : this.grupoDespercios[i].IdArea,
        }
        this.deperdicioService.Insert(info).subscribe(datos_insertados => {
          Swal.fire({ icon : 'success', title : `Registro Exitoso`, text : 'Se ha ingresado el desperdicio exitosamente' });
          this.limpiarTodo();
        }, error => { this.mensajesError(`¡Ha ocurrido un error, no se pudo ingresar el desperdicio!`, error.message); });
      }
    } else this.mensajesAdvertencia(`¡Debe añadir minimo un registro a la tabla para crear un desperdicio!`);
  }

  // Quitar un desperdicio de la tabla
  quitarDesperdicio(){

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
