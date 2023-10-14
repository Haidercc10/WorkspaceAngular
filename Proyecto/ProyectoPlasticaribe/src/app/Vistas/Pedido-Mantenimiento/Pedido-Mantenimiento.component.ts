import { Component, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { ActivosService } from 'src/app/Servicios/Activos/Activos.service';
import { DetallePedido_MantenimientoService } from 'src/app/Servicios/DetallePedido_Mantenimiento/DetallePedido_Mantenimiento.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Pedido_MantenimientoService } from 'src/app/Servicios/Pedido_Mantenimiento/Pedido_Mantenimiento.service';
import { Tipo_MantenimientoService } from 'src/app/Servicios/TiposMantenimientos/Tipo_Mantenimiento.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsPedidoMtto as defaultSteps } from 'src/app/data';

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
  activoSeleccionado : any = [];
  llave : string = '';
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private frmBuilder : FormBuilder,
                private AppComponent : AppComponent,
                  private pedidoMantenimientoService : Pedido_MantenimientoService,
                    private dtPedidoMantenimientoService : DetallePedido_MantenimientoService,
                      private activosService : ActivosService,
                        private tipoMantenimientoService : Tipo_MantenimientoService,
                          private messageService: MessageService,
                            private shepherdService: ShepherdService,
                              private msj : MensajesAplicacionService,) {

    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
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
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que cargará los activos
  obtenerActivos = () => this.activosService.GetTodo().subscribe(datos => this.activos = datos, () => this.msj.mensajeError(`¡No se encontraron activos para realizar el pedido!`));

  // Funcion que obtendrá el id el ultimo pedido creado para saber que consecutivo es el siguiente
  obtenerUlimoId(){
    this.pedidoMantenimientoService.getUltimoIdPedido().subscribe(datos => this.FormPedidoMantenimiento.patchValue({ConsecutivoPedido : datos + 1}), () => this.FormPedidoMantenimiento.patchValue({ConsecutivoPedido : 1}));
  }

  // Función que obtendrá todos los tipos de mantenimiento
  obtenerTiposMantenimiento = () => this.tipoMantenimientoService.GetTodo().subscribe(datos => this.tiposMantenimiento = datos);

  // Funcion que tomará el id del activo seleccionado, lo almacenará y cambiará el id por el nombre en el campo de activo
  buscarActivoSeleccionado(){
    let nuevo : any[] = this.activos.filter((item) => item.actv_Id == this.FormPedidoMantenimiento.value.Activo);
    this.FormPedidoMantenimiento.patchValue({
      IdActivo : nuevo[0].actv_Id,
      Activo : nuevo[0].actv_Nombre,
    });
  }

  // Funcion que va a tomar el id de l tipo de mantenimiento seleccionado, lo almacenará y cambiará el id por el nombre en el campo de tipo de mantenimiento
  buscarTipoMantenimientoSeleccionado(){
    let nuevo : any[] = this.tiposMantenimiento.filter((item) => item.tpMtto_Id == this.FormPedidoMantenimiento.value.TipoMantenimiento);
    this.FormPedidoMantenimiento.patchValue({
      IdTipoMantenimiento : nuevo[0].tpMtto_Id,
      TipoMantenimiento : nuevo[0].tpMtto_Nombre,
    });
  }

  // Funcion que limpiará los campos donde se elegen los activos a los que se les hará mantenimiento
  limpiarCampos(){
    this.FormPedidoMantenimiento.reset();
    this.obtenerUlimoId();
    this.cargando = false;
  }

  // Funcion que va a limpiar todos los campos y dejará la vista como nueva
  limpiarTodo(){
    this.FormPedidoMantenimiento.reset();
    this.obtenerUlimoId();
    this.idActivosSeleccionados = [];
    this.activosSeleccionados = [];
    this.cargando = false;
  }

  // Funcion que sleccionará un activo
  seleccionarActivo(){
    if (this.FormPedidoMantenimiento.valid) {
      if (!this.idActivosSeleccionados.includes(this.FormPedidoMantenimiento.value.IdActivo)){
        let info : any = {
          Id: this.FormPedidoMantenimiento.value.IdActivo,
          Nombre: this.FormPedidoMantenimiento.value.Activo,
          Fecha: this.FormPedidoMantenimiento.value.FechaDaño,
          TipoMantenimiento: this.FormPedidoMantenimiento.value.TipoMantenimiento,
          Id_TipoMantenimiento: this.FormPedidoMantenimiento.value.IdTipoMantenimiento,
        }
        info.Fecha = moment(this.FormPedidoMantenimiento.value.FechaDaño).format('YYYY-MM-DD');
        this.activosSeleccionados.push(info);
        this.idActivosSeleccionados.push(info.Id);
      } else this.msj.mensajeAdvertencia(`Advertencia`, `¡El activo ${this.FormPedidoMantenimiento.value.Activo} ha sido seleccionado previamente!`);
    } else this.msj.mensajeAdvertencia(`Advertencia`, `¡Debe llenar los campos vacios!`);
  }

  // Funcion que quitará de la tabla de los activos seleccionados
  quitarActivo(item : any){
    item = this.activoSeleccionado;
    this.onReject();
    this.activosSeleccionados.splice(this.activosSeleccionados.findIndex(i => i.Id == item.Id), 1);
    this.idActivosSeleccionados.splice(this.idActivosSeleccionados.findIndex(i => i == item.Id), 1);
    this.msj.mensajeConfirmacion('Confirmación', `Se ha eliminado el activo ${item.Nombre} de la tabla!`);
  }

  // Funcion que quitará todos los activos seleccionados para mantenimiento
  quitarTodos() {
    this.onReject();
    this.activosSeleccionados = [];
    this.idActivosSeleccionados = [];
    this.msj.mensajeConfirmacion('Confirmación', `Se han eliminado todos los activos de la tabla!`);
  }

  // Funcion que creará el pedido de mantenimiento de activos
  crearPedido(){
    if (this.activosSeleccionados.length > 0) {
      let info : any = {
        Usua_Id : this.storage_Id,
        PedMtto_Fecha : this.today,
        PedMtto_Hora : moment().format('H:mm:ss'),
        Estado_Id : 11,
        PedMtto_Observacion : this.FormPedidoMantenimiento.value.Observacion == null ? '' : this.FormPedidoMantenimiento.value.Observacion.toUpperCase(),
      }
      this.pedidoMantenimientoService.Insert(info).subscribe(data => this.buscarUltimoID(data.pedMtto_Id), () => {
        this.msj.mensajeError(`Error`, '¡Ha ocurrido un error al crear el pedido de mantenimiento!');
        this.cargando = false;
      });
    } else {
      this.msj.mensajeAdvertencia(`Advertencia`, `¡Debe seleccionar minimo un activo para crear el pedido de mantenimiento!`);
      this.cargando = false;
    }
  }

  // Funcion que va a buscar el ultimo Id del ultimo pedido creado y creará los detalles de manteniientos
  buscarUltimoID(id : number){
    let numDatos = 0;
    for (let i = 0; i < this.activosSeleccionados.length; i++) {
      let info : any = {
        PedMtto_Id : id,
        Actv_Id : this.activosSeleccionados[i].Id,
        TpMtto_Id : this.activosSeleccionados[i].Id_TipoMantenimiento,
        DtPedMtto_FechaFalla : this.activosSeleccionados[i].Fecha,
      }
      this.dtPedidoMantenimientoService.Insert(info).subscribe(() => {
        numDatos++;
        if (numDatos == this.activosSeleccionados.length) {
          this.msj.mensajeConfirmacion('Confirmación', `Se ha creado un Pedido de mantenimiento para ${this.activosSeleccionados.length} activo(s)!`);
          this.limpiarTodo();
        }
      }, () => {
        this.msj.mensajeError(`Error`, `¡Error al almacenar los activos a los que se les hará mantenimientos!`);
        this.cargando = false;
      });
    }
  }

  mostrarEleccion(item : any, modo : string){
    this.llave = modo;
    setTimeout(() => {
      if(this.llave == 'uno') {
        this.activoSeleccionado = item;
        this.messageService.add({severity:'warn', key: this.llave, summary:'Elección', detail: `Está seguro que desea quitar el activo ${item.Nombre} de la tabla?`, sticky: true});
      } else if(this.llave == 'todos') this.messageService.add({severity:'warn', key: this.llave, summary:'Elección', detail: `Está seguro que desea eliminar todos los activos de la tabla?`, sticky: true});
    }, 200);
  }

  onReject = () => this.messageService.clear(this.llave);

  /** Función que mostrará un tutorial describiendo paso a paso cada funcionalidad de la aplicación */
  verTutorial() {
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }
}
