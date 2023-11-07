import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { Detalle_BodegaRollosService } from 'src/app/Servicios/Detalle_BodegaRollos/Detalle_BodegaRollos.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsEliminarRollos as defaultSteps } from 'src/app/data';

@Component({
  selector: 'app-EliminarRollos_Extrusion',
  templateUrl: './EliminarRollos_Extrusion.component.html',
  styleUrls: ['./EliminarRollos_Extrusion.component.css']
})
export class EliminarRollos_ExtrusionComponent implements OnInit {

  public FormConsultarRollos !: FormGroup; //formulario para consultar y crear un ingreso de rollos
  cargando : boolean = true; //Variable para validar que salga o no la imagen de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  grupoProductos : any [] = []; //Variable que guardará de manera descriminada a cada producto
  rollos : any [] = []; //Variable que almacenará los difrentes rollos que se hicieron en la orden de trabajo
  rollosInsertar : any [] = []; //Variable que va a amacenar los diferentes rollos que se van a insertar
  validarRollo : any [] = []; //Variable para validará que el rollo no esté en la tabla
  totalRollos : number = 0; //Variable que almacenará el total de rollos escogidos
  totalCantidad : number = 0; //Variable que almacenará la cantidad de total de kg de los rollos escogidos
  rollosPDF : any [] = []; //Variable que almacenará la informacion de los rollos salientes
  error : boolean = false; //Variable que ayudará a saber si ocurre un error con la eliminación de algun rollo
  public arrayProcesos = [];
  scrolly : number = 0;
  scrollx : number = 0;
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  unMesAtras : any = moment().subtract(30, 'days').format('YYYY-MM-DD'); /** Variable que contendrá la fecha de hace un mes atrás para consultar desde esa fecha hasta hoy. */
  nroRollo : any = []; /** Variable que contendrá el id de los rollos consultados en el formulario de filtros. */
  bodegaElegida : string = '';
  tiempoEspera : number = 0;
  bagpro : boolean = false;

  constructor(private frmBuilderPedExterno : FormBuilder,
                private AppComponent : AppComponent,
                  private bagproService : BagproService,
                    private servicioProcesos : ProcesosService,
                      private messageService: MessageService,
                        private shepherdService: ShepherdService,
                          private mensajeService : MensajesAplicacionService,
                            private servicioDtBodega : Detalle_BodegaRollosService) {

    this.FormConsultarRollos = this.frmBuilderPedExterno.group({
      OT_Id: [null],
      IdRollo : [null],
      Bodega : [null],
    });

    this.cargando = true;
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.lecturaStorage();
    this.obtenerProcesos();
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
    window.onscroll = function() {
      this.scrolly = window.scrollY;
      this.scrollx = window.scrollX;
    };
    setTimeout(() => { this.FormConsultarRollos.patchValue({Bodega : 'EXT'}) }, 1000);
  }

  tutorial(){
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // funcion que va a limpiar los campos del formulario
  limpiarForm = () => this.FormConsultarRollos.patchValue({OT_Id: null, IdRollo: null, Bodega : 'EXT', });

  // Funcion que va a limpiar todos los campos
  limpiarCampos(){
    this.FormConsultarRollos.patchValue({OT_Id: null, IdRollo: null, Bodega : 'EXT', });
    this.rollos = [];
    this.error = false;
    this.rollosInsertar = [];
    this.validarRollo = [];
    this.grupoProductos = [];
    this.totalCantidad = 0;
    this.totalRollos = 0;
    this.cargando = true;
    this.tiempoEspera = 0;
    this.bodegaElegida = '';
    this.bagpro = false;
  }

  /** Función que consultará los rollos en bagpro por fechas y proceso. Opcionalmente por OT y por rollo */
  consultarRollos2(){
    let ot : string = this.FormConsultarRollos.value.OT_Id;
    let rollo : number = this.FormConsultarRollos.value.IdRollo;
    let bodega : any = this.FormConsultarRollos.value.Bodega;
    this.bodegaElegida = '';
    this.rollos = [];
    this.rollosInsertar = [];
    this.grupoProductos = [];
    this.totalCantidad = 0;
    this.totalRollos = 0;
    let ruta : any = ``;
    this.cargando = false;
    this.tiempoEspera = 0;
    this.error = false;
    this.nroRollo = [];

    if(bodega != null) {
      if(bodega == 'EXT') this.bodegaElegida = 'EXTRUSION';
      if(bodega == 'IMP') this.bodegaElegida = 'IMPRESION';
      if(bodega == 'ROT') this.bodegaElegida = 'ROTOGRABADO';
      if(bodega == 'SELLA') this.bodegaElegida = 'SELLADO';
      if(bodega == 'CORTE') this.bodegaElegida = 'IMPRESION';
      if(bodega == 'DESP') this.bodegaElegida = 'DESPACHO';
      if(bodega == 'BGPI') this.bodegaElegida = 'PRODUCTO INTERMEDIO';

      if(ot != null) ruta = `ot=${ot}`;
      if (rollo != null) ruta.length > 0 ? ruta += `&rollo=${rollo}` : ruta += `rollo=${rollo}`;

      ruta.length > 0 ? ruta = `?${ruta}` : ruta = ``;

      if(['DESP', 'BGPI'].includes(bodega)) this.buscarRollosBagPro(ruta);
      else {
        this.bagproService.GetRollosExtrusion_Empaque_Sellado('2017-01-01', this.today, this.bodegaElegida, ruta).subscribe(data => {
          if(data.length > 0) {
            for (let index = 0; index < data.length; index++) {
              if(data[index].proceso == this.bodegaElegida && !this.nroRollo.includes(data[index].rollo)) { this.llenarTabla(data[index]); }

              this.tiempoEspera += 1;
              this.tiempoEspera == data.length ? this.cargando = true : this.cargando = false;
            }
          } else {
            this.mensajeService.mensajeAdvertencia(`Advertencia`, `No se encontraron resultados de búsqueda!`);
            this.cargando = true;
          }
        });
      }
    } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `Debe seleccionar una bodega!`);
  }

  /** Función que consultará los rollos en bagpro. Solo por fechas. Opcionalmente por OT y por rollo */
  buscarRollosBagPro(ruta : any){
    this.bagproService.GetProcExtrusion_ProcSellado(this.unMesAtras, this.today, ruta).subscribe(data => {
      if(data.length > 0) {
        for (let index = 0; index < data.length; index++) {
          if(!this.nroRollo.includes(data[index].rollo)) { this.llenarTabla(data[index]); }

          this.tiempoEspera += 1;
          this.tiempoEspera == data.length ? this.cargando = true : this.cargando = false;
        }
      } else {
        this.mensajeService.mensajeAdvertencia(`Advertencia`, `No se encontraron resultados de búsqueda!`);
        this.cargando = true;
      }
    });
  }

  /** Función que llenará la tabla  */
  llenarTabla(datos : any){
    let info : any = {
      Ot : datos.orden,
      Id : datos.rollo,
      IdProducto : datos.id_Producto,
      Producto : datos.producto,
      Cantidad : parseInt(datos.cantidad),
      Presentacion : datos.presentacion,
      //Fecha : datos.fecha.replace('T00:00:00', ''),
      Proceso : datos.proceso,
    }
    this.rollos.push(info);
    this.nroRollo.push(info.Id);
  }

  // Funcion que colocará los rollos que se van a insertar
  llenarRollosAIngresar(item : any){
    this.rollos.splice(this.rollos.findIndex((data) => item.Id == data.Id), 1);
    this.rollosInsertar.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.rollosInsertar.sort((a,b) => Number(a.exits) - Number(b.exits) );
    this.GrupoProductos();
  }

  // Funcion que seleccionará y colocará todos los rollos que se van a insertar
  seleccionarTodosRollos(item : any){
    this.rollos = item.filter((data) => data.exits);
    this.rollosInsertar.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.rollosInsertar.sort((a,b) => Number(a.exits) - Number(b.exits) );
    this.GrupoProductos();
  }

  //Funcion que va a quitar lo rollos que se van a insertar
  quitarRollosAIngresar(item : any){
    this.rollosInsertar.splice(this.rollosInsertar.findIndex((data) => item.Id == data.Id), 1);
    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
    this.GrupoProductos();
  }

  // Funcion que va a quitar todos los rollos que se van a insertar
  quitarTodosRollos(){
    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
    this.rollosInsertar = [];
    this.GrupoProductos();
  }

  // Funcion que permitirá ver el total de lo escogido para cada producto
  GrupoProductos(){
    let producto : any = [];
    this.grupoProductos = [];
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      if (!producto.includes(this.rollosInsertar[i].IdProducto)) {
        let cantidad : number = 0;
        let cantRollo : number = 0;
        for (let j = 0; j < this.rollosInsertar.length; j++) {
          if (this.rollosInsertar[i].IdProducto == this.rollosInsertar[j].IdProducto && !this.rollosInsertar[j].exits && !this.rollosInsertar[j].exits) {
            cantidad += this.rollosInsertar[j].Cantidad;
            cantRollo += 1;
          }
        }
        if (cantRollo > 0){
          producto.push(this.rollosInsertar[i].IdProducto);
          let info : any = {
            Ot: this.rollosInsertar[i].Ot,
            Id : this.rollosInsertar[i].IdProducto,
            Nombre : this.rollosInsertar[i].Producto,
            Cantidad : this.formatonumeros(cantidad.toFixed(2)),
            Cantidad2 : cantidad,
            Rollos: this.formatonumeros(cantRollo),
            Rollos2: cantRollo,
            Presentacion : this.rollosInsertar[i].Presentacion,
          }
          this.grupoProductos.push(info);
        }
      }
    }
    setTimeout(() => {
      this.rollosInsertar.sort((a,b) => Number(a.Ot) - Number(b.Ot));
      this.grupoProductos.sort((a,b) => Number(a.Ot) - Number(b.Ot));
      this.calcularTotalRollos();
      this.calcularTotalCantidad();
    }, 500);
  }

  // Funcion que calculará el total de rollos que se están signanado
  calcularTotalRollos() {
    let total = 0;
    for(let sale of this.grupoProductos) {
      total += sale.Rollos2;
    }
    this.totalRollos = total;
  }

  // Funcion que calculará el total de la kg que se está ingresando
  calcularTotalCantidad() {
    let total = 0;
    for(let sale of this.grupoProductos) {
      total += sale.Cantidad2;
    }
    this.totalCantidad = total;
  }

  /** Función para eliminar rollos de bagpro y luego de plasticaribeBDD */
  eliminarRollosBagProBD(){
    this.onReject();
    let bodega : any = this.FormConsultarRollos.value.Bodega;
    this.cargando = false;
    this.error = false;
    this.bagpro = true;

    if(['EXT', 'BGPI', 'IMP', 'ROT', 'CORTE', 'DESP'].includes(bodega)) {
      for (let index = 0; index < this.rollosInsertar.length; index++) {
        this.bagproService.Delete(parseInt(this.rollosInsertar[index].Id)).subscribe(data => { this.error = false }, error => {
          this.error = true;
          this.mensajeService.mensajeError(`Error`,`No fue posible eliminar los rollos de BagPro, ya que no fueron encontrados!`);
          this.cargando = true;
        });
      }
    } else if (bodega == 'SELLA') {
      for (let i = 0; i < this.rollosInsertar.length; i++) {
        this.bagproService.DeleteRollosSellado_Wiketiado(this.rollosInsertar[i].Id).subscribe(() => { this.error = false }, () => {
          this.error = true;
          this.mensajeService.mensajeError(`Error`,`No fue posible eliminar los rollos de BagPro, ya que no fueron encontrados!`);
          this.cargando = true;
        });
      }
    }
    setTimeout(() => { if(!this.error) this.eliminarRolloBodegasPBDD(); }, 2000);
  }

  /** Función para eliminar rollos las bodegas de plasticaribeBDD */
  eliminarRolloBodegasPBDD() {
    this.onReject();
    let cantRollosPbdd : number = 0;
    this.cargando = false;
    this.error = false;

    for (let index = 0; index < this.rollosInsertar.length; index++) {
      let bodega = this.rollosInsertar[index].Proceso;
      if(bodega == 'EXTRUSION') bodega = 'EXT';
      if(bodega == 'IMPRESION') bodega = 'IMP';
      if(bodega == 'ROTOGRABADO') bodega = 'ROTO';
      if(bodega == 'CORTE') bodega = 'IMP';
      if(bodega == 'SELLADO') bodega = 'SELLA';

      this.servicioDtBodega.GetInfoRollo(this.rollosInsertar[index].Id, bodega).subscribe(data => {
        if(data.length > 0) {
          for (let i = 0; i < data.length; i++) {
            cantRollosPbdd += 1;
           this.servicioDtBodega.Delete(data[i].codigo).subscribe(data => { this.error = false; });
          }
        }
      }, error => {
        this.servicioDtBodega.GetIdRollo(this.rollosInsertar[index].Id).subscribe(data => {
          if(data.length > 0) {
            for (let i = 0; i < data.length; i++) {
              cantRollosPbdd += 1;
             this.servicioDtBodega.Delete(data[i].codigo).subscribe(data => { this.error = false; });
            }
          }
        });
      });
    }
    setTimeout(() => { this.finalizarEliminacion(cantRollosPbdd); }, 1000);
  }

  //Funcion que se encargará de lenviar el mensaje de confirmación del envio y limpiará los campos
  finalizarEliminacion(numero : number){
    setTimeout(() => {
      if(numero > 0 && this.bagpro) this.mensajeService.mensajeConfirmacion(`Confirmación`, `${this.totalRollos} rollo(s) de "Bagpro" y ${numero} rollo(s) del "Nuevo Programa" han sido eliminado(s) correctamente!`);
      else if(numero > 0 && !this.bagpro) this.mensajeService.mensajeConfirmacion(`Confirmación`, `${this.totalRollos} rollo(s) han sido eliminado(s) "solo del Nuevo Programa" correctamente!`);
      else if(numero <= 0 && this.bagpro) this.mensajeService.mensajeConfirmacion(`Confirmación`, `${this.totalRollos} rollo(s) han sido eliminado(s) "solo de Bagpro" correctamente !`);
      else if(numero <= 0 && !this.bagpro) this.mensajeService.mensajeAdvertencia(`Advertencia`, `No se eliminaron registros del "Nuevo Programa", ya que los rollos elegidos no están en la bodega seleccionada o solo están en "Bagpro"!`);
      this.limpiarCampos();
    }, 2000);
  }

  /** Cargar los procesos de donde puede venir el rollo. */
  obtenerProcesos = () => this.servicioProcesos.srvObtenerLista().subscribe(data =>  this.arrayProcesos = data.filter((item) => ['EXT', 'BGPI', 'IMP', 'ROT', 'CORTE', 'SELLA', 'DESP'].includes(item.proceso_Id)));

  /** Mostrar mensaje de Eleccion */
  mostrarEleccion(){
    if (this.rollosInsertar.length > 0) {
      this.messageService.add({severity:'warn', key: 'eleccion', summary: `Elección`, detail: `De cual base de datos desea eliminar la información?`, sticky: true});
    } else this.mensajeService.mensajeAdvertencia(`Advertencia`,`Debe cargar al menos un rollo en la tabla!`);
  }

  /** Cerrar Dialogo de eliminación de rollos.*/
  onReject = () => this.messageService.clear('eleccion');
}
