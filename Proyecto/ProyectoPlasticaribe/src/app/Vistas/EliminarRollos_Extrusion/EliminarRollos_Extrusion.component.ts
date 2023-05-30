import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { DetallesEntradaRollosService } from 'src/app/Servicios/DetallesEntradasRollosDespacho/DetallesEntradaRollos.service';
import { DtIngRollos_ExtrusionService } from 'src/app/Servicios/DetallesIngresoRollosExtrusion/DtIngRollos_Extrusion.service';
import { DtPreEntregaRollosService } from 'src/app/Servicios/DetallesPreIngresoRollosDespacho/DtPreEntregaRollos.service';
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
  bodegas : any [] = [{Nombre: 'Bodega Extrusion', Id: 'EXT'}, {Nombre: 'Bodega Despacho', Id: 'DESP'}];
  public arrayProcesos = [];
  public display : boolean = false;
  public bodegaExtrusion : boolean = false;
  public bodegaDespacho : boolean = false;
  public bdNueva : boolean;
  public bdBagpro : boolean;
  scrolly : number = 0;
  scrollx : number = 0;
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private frmBuilderPedExterno : FormBuilder,
                private AppComponent : AppComponent,
                  private dtIngRollosService : DtIngRollos_ExtrusionService,
                    private bagproService : BagproService,
                      private servicioProcesos : ProcesosService,
                        private servcioDetEntradaRollos : DetallesEntradaRollosService,
                          private servicioPreEntregaRollos : DtPreEntregaRollosService,
                            private messageService: MessageService,
                              private shepherdService: ShepherdService,
                                private mensajeService : MensajesAplicacionService) {

    this.FormConsultarRollos = this.frmBuilderPedExterno.group({
      OT_Id: [null],
      IdRollo : [null],
      fechaDoc : [null],
      fechaFinalDoc: [null],
      Proceso : [null],
      Bodega : [null],
    });

    this.cargando = true;
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.lecturaStorage();
    this.obtenerProcesos();
    window.onscroll = function() {
      this.scrolly = window.scrollY;
      this.scrollx = window.scrollX;
    };
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
  limpiarForm(){
    this.FormConsultarRollos.setValue({
      OT_Id: null,
      IdRollo: null,
      fechaDoc : null,
      fechaFinalDoc: null,
      Proceso : null,
      Bodega : null,
    });
  }

  // Funcion que va a limpiar todos los campos
  limpiarCampos(){
    this.FormConsultarRollos.setValue({
      OT_Id: null,
      IdRollo: null,
      fechaDoc : null,
      fechaFinalDoc: null,
      Proceso : null,
      Bodega : null,
    });
    this.rollos = [];
    this.error = false;
    this.rollosInsertar = [];
    this.validarRollo = [];
    this.grupoProductos = [];
    this,this.totalCantidad = 0;
    this.totalRollos = 0;
    this.cargando = true;
    this.bodegaExtrusion = false;
    this.bodegaDespacho = false;
  }

  // Funcion que va a consultar los rollos
  consultarRollos(){
    let ot : number = this.FormConsultarRollos.value.OT_Id;
    let fechaInicial : any = moment(this.FormConsultarRollos.value.fechaDoc).format('YYYY-MM-DD');
    let fechaFinal : any = moment(this.FormConsultarRollos.value.fechaFinalDoc).format('YYYY-MM-DD');
    let rollo : number = this.FormConsultarRollos.value.IdRollo;
    let proceso : any = this.FormConsultarRollos.value.Proceso;
    let bodega : any = this.FormConsultarRollos.value.Bodega;
    let rollos : any = [];
    let consulta : number;
    this.rollos = [];
    this.error = false;
    this.rollosInsertar = [];
    this.validarRollo = [];
    this.grupoProductos = [];
    this,this.totalCantidad = 0;
    this.totalRollos = 0;
    this.cargando = true;
    this.bodegaExtrusion = false;
    this.bodegaDespacho = false;

    if (fechaInicial == 'Invalid date') fechaInicial = null;
    if (fechaFinal == 'Invalid date') fechaFinal = null;

    if(proceso != null && bodega != null) {
      if ((proceso == 'Empaque' || proceso == 'Sellado') && bodega == 'EXT')
      this.mensajeService.mensajeAdvertencia(`Advertencia`, `La combinación de búsqueda es incorrecta, por favor verifique`);
      else {
        this.cargando = false;
        if(bodega == 'EXT') this.bodegaExtrusion = true;
        else if (bodega == 'DESP') this.bodegaDespacho = true;

        setTimeout(() => {
          if(proceso == 'Extrusion' || proceso == 'Empaque') {
            if (ot != null && fechaInicial != null && fechaFinal != null) {
              this.bagproService.srvObtenerListaProcExtrusionOT(ot).subscribe(datos_Rollos => {
                consulta = datos_Rollos.length;
                for (let i = 0; i < datos_Rollos.length; i++) {
                  if (!rollos.includes(datos_Rollos[i].item) && datos_Rollos[i].nomStatus == proceso.toUpperCase() && moment(datos_Rollos[i].fecha.replace('T00:00:00', '')).isBetween(fechaInicial, fechaFinal)) {
                    let info : any = {
                      Ot : datos_Rollos[i].ot,
                      Id : datos_Rollos[i].item,
                      IdProducto : datos_Rollos[i].clienteItem,
                      Producto : datos_Rollos[i].clienteItemNombre,
                      Cantidad : datos_Rollos[i].extnetokg,
                      Presentacion : 'Kg',
                      Fecha : datos_Rollos[i].fecha.replace('T00:00:00', ''),
                      Proceso : proceso,
                    }
                    rollos.push(datos_Rollos[i].item);
                    this.rollos.push(info);
                    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  }
                }
              });
            } else if (fechaInicial != null &&  fechaFinal != null) {
              this.bagproService.consultarFechas(fechaInicial, fechaFinal).subscribe(datos_Rollos => {
                consulta = datos_Rollos.length;
                for (let i = 0; i < datos_Rollos.length; i++) {
                  if (!rollos.includes(datos_Rollos[i].item) && datos_Rollos[i].nomStatus == proceso.toUpperCase()) {
                    let info : any = {
                      Ot : datos_Rollos[i].ot,
                      Id : datos_Rollos[i].item,
                      IdProducto : datos_Rollos[i].clienteItem,
                      Producto : datos_Rollos[i].clienteItemNombre,
                      Cantidad : datos_Rollos[i].extnetokg,
                      Presentacion : 'Kg',
                      Fecha : datos_Rollos[i].fecha.replace('T00:00:00', ''),
                      Proceso : proceso,
                    }
                    rollos.push(datos_Rollos[i].item);
                    this.rollos.push(info);
                    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  }
                }
              });
            } else if (ot != null && fechaInicial != null) {
              this.bagproService.srvObtenerListaProcExtOt(ot).subscribe(datos_Rollos => {
                consulta = datos_Rollos.length;
                for (let i = 0; i < datos_Rollos.length; i++) {
                  if (!rollos.includes(datos_Rollos[i].item) && datos_Rollos[i].nomStatus == proceso.toUpperCase() && datos_Rollos[i].fecha.replace('T00:00:00', '') == fechaInicial) {
                    let info : any = {
                      Ot : datos_Rollos[i].ot,
                      Id : datos_Rollos[i].item,
                      IdProducto : datos_Rollos[i].clienteItem,
                      Producto : datos_Rollos[i].clienteItemNombre,
                      Cantidad : datos_Rollos[i].extnetokg,
                      Presentacion : 'Kg',
                      Fecha : datos_Rollos[i].fecha.replace('T00:00:00', ''),
                      Proceso : proceso,
                    }
                    rollos.push(datos_Rollos[i].item);
                    this.rollos.push(info);
                    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  }
                }
              });
            } else if (fechaInicial != null) {
              this.bagproService.consultarFechas(fechaInicial, fechaInicial).subscribe(datos_Rollos => {
                consulta = datos_Rollos.length;
                for (let i = 0; i < datos_Rollos.length; i++) {
                  if (!rollos.includes(datos_Rollos[i].item) && datos_Rollos[i].nomStatus == proceso.toUpperCase()) {
                    let info : any = {
                      Ot : datos_Rollos[i].ot,
                      Id : datos_Rollos[i].item,
                      IdProducto : datos_Rollos[i].clienteItem,
                      Producto : datos_Rollos[i].clienteItemNombre,
                      Cantidad : datos_Rollos[i].extnetokg,
                      Presentacion : 'Kg',
                      Fecha : datos_Rollos[i].fecha.replace('T00:00:00', ''),
                      Proceso : proceso,
                    }
                    rollos.push(datos_Rollos[i].item);
                    this.rollos.push(info);
                    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  }
                }
              });
            } else if (ot != null) {
              this.bagproService.srvObtenerListaProcExtOt(ot).subscribe(datos_Rollos => {
                consulta = datos_Rollos.length;
                for (let i = 0; i < datos_Rollos.length; i++) {
                  if (!rollos.includes(datos_Rollos[i].item) && datos_Rollos[i].nomStatus == proceso.toUpperCase()) {
                    let info : any = {
                      Ot : datos_Rollos[i].ot,
                      Id : datos_Rollos[i].item,
                      IdProducto : datos_Rollos[i].clienteItem,
                      Producto : datos_Rollos[i].clienteItemNombre,
                      Cantidad : datos_Rollos[i].extnetokg,
                      Presentacion : 'Kg',
                      Fecha : datos_Rollos[i].fecha.replace('T00:00:00', ''),
                      Proceso : proceso,
                    }
                    rollos.push(datos_Rollos[i].item);
                    this.rollos.push(info);
                    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  }
                }
              });
            } else if (rollo != null) {
              this.bagproService.srvObtenerListaProcExtrusionRollos(rollo).subscribe(datos_Rollos => {
                consulta = datos_Rollos.length;
                for (let i = 0; i < datos_Rollos.length; i++) {
                  if (!rollos.includes(datos_Rollos[i].item) && datos_Rollos[i].nomStatus == proceso.toUpperCase()) {
                    let info : any = {
                      Ot : datos_Rollos[i].ot,
                      Id : datos_Rollos[i].item,
                      IdProducto : datos_Rollos[i].clienteItem,
                      Producto : datos_Rollos[i].clienteItemNombre,
                      Cantidad : datos_Rollos[i].extnetokg,
                      Presentacion : 'Kg',
                      Fecha : datos_Rollos[i].fecha.replace('T00:00:00', ''),
                      Proceso : proceso,
                    }
                    rollos.push(datos_Rollos[i].item);
                    this.rollos.push(info);
                    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  }
                }
              });
            } else {
              this.bagproService.consultarFechas(this.today, this.today).subscribe(datos_Rollos => {
                consulta = datos_Rollos.length;
                for (let i = 0; i < datos_Rollos.length; i++) {
                  if (!rollos.includes(datos_Rollos[i].item) && datos_Rollos[i].nomStatus == proceso.toUpperCase()) {
                    let info : any = {
                      Ot : datos_Rollos[i].ot,
                      Id : datos_Rollos[i].item,
                      IdProducto : datos_Rollos[i].clienteItem,
                      Producto : datos_Rollos[i].clienteItemNombre,
                      Cantidad : datos_Rollos[i].extnetokg,
                      Presentacion : 'Kg',
                      Fecha : datos_Rollos[i].fecha.replace('T00:00:00', ''),
                      Proceso : proceso,
                    }
                    rollos.push(datos_Rollos[i].item);
                    this.rollos.push(info);
                    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  }
                }
              });
            }
          } else if(proceso == 'Sellado') {
            if(ot != null && fechaInicial != null && fechaFinal != null) {
              this.bagproService.srvObtenerListaProcSelladoFechasOT(fechaInicial, fechaFinal, ot).subscribe(datos_Rollos => {
                for (let i = 0; i < datos_Rollos.length; i++) {
                  if (!rollos.includes(datos_Rollos[i].item) && datos_Rollos[i].nomStatus == proceso.toUpperCase()) {
                    let info : any = {
                      Ot : datos_Rollos[i].ot,
                      Id : datos_Rollos[i].item,
                      IdProducto : datos_Rollos[i].referencia,
                      Producto : datos_Rollos[i].nomReferencia,
                      Cantidad : datos_Rollos[i].qty,
                      Presentacion : datos_Rollos[i].unidad,
                      Fecha : datos_Rollos[i].fechaEntrada.replace('T00:00:00', ''),
                      Proceso : proceso,
                    }
                    if(info.Presentacion == 'KLS') info.Presentacion = 'Kg';
                    else if (info.Presentacion == 'PAQ') info.Presentacion = 'Paquete';
                    else if (info.Presentacion == 'UND') info.Presentacion = 'Und';

                    rollos.push(datos_Rollos[i].item);
                    this.rollos.push(info);
                    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  }
                }
              });
            } else if (fechaInicial != null && fechaFinal != null) {
              this.bagproService.srvObtenerListaProcSelladoFechas(fechaInicial, fechaFinal).subscribe(datos_Rollos => {
                for (let i = 0; i < datos_Rollos.length; i++) {
                  if (!rollos.includes(datos_Rollos[i].item) && datos_Rollos[i].nomStatus == proceso.toUpperCase()) {
                    let info : any = {
                      Ot : datos_Rollos[i].ot,
                      Id : datos_Rollos[i].item,
                      IdProducto : datos_Rollos[i].referencia,
                      Producto : datos_Rollos[i].nomReferencia,
                      Cantidad : datos_Rollos[i].qty,
                      Presentacion : datos_Rollos[i].unidad,
                      Fecha : datos_Rollos[i].fechaEntrada.replace('T00:00:00', ''),
                      Proceso : proceso,
                    }
                    if(info.Presentacion == 'KLS') info.Presentacion = 'Kg';
                    else if (info.Presentacion == 'PAQ') info.Presentacion = 'Paquete';
                    else if (info.Presentacion == 'UND') info.Presentacion = 'Und';

                    rollos.push(datos_Rollos[i].item);
                    this.rollos.push(info);
                    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  }
                }
              });
            } else if (ot != null && fechaInicial != null) {
              this.bagproService.srvObtenerListaProcSelladoFechasOT(fechaInicial, fechaInicial, ot).subscribe(datos_Rollos => {
                for (let i = 0; i < datos_Rollos.length; i++) {
                  if (!rollos.includes(datos_Rollos[i].item) && datos_Rollos[i].nomStatus == proceso.toUpperCase()) {
                    let info : any = {
                      Ot : datos_Rollos[i].ot,
                      Id : datos_Rollos[i].item,
                      IdProducto : datos_Rollos[i].referencia,
                      Producto : datos_Rollos[i].nomReferencia,
                      Cantidad : datos_Rollos[i].qty,
                      Presentacion : datos_Rollos[i].unidad,
                      Fecha : datos_Rollos[i].fechaEntrada.replace('T00:00:00', ''),
                      Proceso : proceso,
                    }
                    if(info.Presentacion == 'KLS') info.Presentacion = 'Kg';
                    else if (info.Presentacion == 'PAQ') info.Presentacion = 'Paquete';
                    else if (info.Presentacion == 'UND') info.Presentacion = 'Und';

                    rollos.push(datos_Rollos[i].item);
                    this.rollos.push(info);
                    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  }
                }
              });
            } else if (fechaInicial) {
              this.bagproService.srvObtenerListaProcSelladoFechas(fechaInicial, fechaInicial).subscribe(datos_Rollos => {
                for (let i = 0; i < datos_Rollos.length; i++) {
                  if (!rollos.includes(datos_Rollos[i].item) && datos_Rollos[i].nomStatus == proceso.toUpperCase()) {
                    let info : any = {
                      Ot : datos_Rollos[i].ot,
                      Id : datos_Rollos[i].item,
                      IdProducto : datos_Rollos[i].referencia,
                      Producto : datos_Rollos[i].nomReferencia,
                      Cantidad : datos_Rollos[i].qty,
                      Presentacion : datos_Rollos[i].unidad,
                      Fecha : datos_Rollos[i].fechaEntrada.replace('T00:00:00', ''),
                      Proceso : proceso,
                    }
                    if(info.Presentacion == 'KLS') info.Presentacion = 'Kg';
                    else if (info.Presentacion == 'PAQ') info.Presentacion = 'Paquete';
                    else if (info.Presentacion == 'UND') info.Presentacion = 'Und';

                    rollos.push(datos_Rollos[i].item);
                    this.rollos.push(info);
                    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  }
                }
              });
            } else if (ot != null) {
              this.bagproService.srvObtenerListaProcSelladoRollosOT(ot).subscribe(datos_Rollos => {
                for (let i = 0; i < datos_Rollos.length; i++) {
                  if (!rollos.includes(datos_Rollos[i].item) && datos_Rollos[i].nomStatus == proceso.toUpperCase()) {
                    let info : any = {
                      Ot : datos_Rollos[i].ot,
                      Id : datos_Rollos[i].item,
                      IdProducto : datos_Rollos[i].referencia,
                      Producto : datos_Rollos[i].nomReferencia,
                      Cantidad : datos_Rollos[i].qty,
                      Presentacion : datos_Rollos[i].unidad,
                      Fecha : datos_Rollos[i].fechaEntrada.replace('T00:00:00', ''),
                      Proceso : proceso,
                    }
                    if(info.Presentacion == 'KLS') info.Presentacion = 'Kg';
                    else if (info.Presentacion == 'PAQ') info.Presentacion = 'Paquete';
                    else if (info.Presentacion == 'UND') info.Presentacion = 'Und';

                    rollos.push(datos_Rollos[i].item);
                    this.rollos.push(info);
                    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  }
                }
              });
            } else if (rollo != null) {
              this.bagproService.srvObtenerListaProcSelladoRollo(rollo).subscribe(datos_Rollos => {
                for (let i = 0; i < datos_Rollos.length; i++) {
                  if (!rollos.includes(datos_Rollos[i].item) && datos_Rollos[i].nomStatus == proceso.toUpperCase()) {
                    let info : any = {
                      Ot : datos_Rollos[i].ot,
                      Id : datos_Rollos[i].item,
                      IdProducto : datos_Rollos[i].referencia,
                      Producto : datos_Rollos[i].nomReferencia,
                      Cantidad : datos_Rollos[i].qty,
                      Presentacion : datos_Rollos[i].unidad,
                      Fecha : datos_Rollos[i].fechaEntrada.replace('T00:00:00', ''),
                      Proceso : proceso,
                    }
                    if(info.Presentacion == 'KLS') info.Presentacion = 'Kg';
                    else if (info.Presentacion == 'PAQ') info.Presentacion = 'Paquete';
                    else if (info.Presentacion == 'UND') info.Presentacion = 'Und';

                    rollos.push(datos_Rollos[i].item);
                    this.rollos.push(info);
                    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  }
                }
              });
            } else {
              this.bagproService.srvObtenerListaProcSelladoFechas(this.today, this.today).subscribe(datos_Rollos => {
                for (let i = 0; i < datos_Rollos.length; i++) {
                  if (!rollos.includes(datos_Rollos[i].item) && datos_Rollos[i].nomStatus == proceso.toUpperCase()) {
                    let info : any = {
                      Ot : datos_Rollos[i].ot,
                      Id : datos_Rollos[i].item,
                      IdProducto : datos_Rollos[i].referencia,
                      Producto : datos_Rollos[i].nomReferencia,
                      Cantidad : datos_Rollos[i].qty,
                      Presentacion : datos_Rollos[i].unidad,
                      Fecha : datos_Rollos[i].fechaEntrada.replace('T00:00:00', ''),
                      Proceso : proceso,
                    }
                    if(info.Presentacion == 'KLS') info.Presentacion = 'Kg';
                    else if (info.Presentacion == 'PAQ') info.Presentacion = 'Paquete';
                    else if (info.Presentacion == 'UND') info.Presentacion = 'Und';

                    rollos.push(datos_Rollos[i].item);
                    this.rollos.push(info);
                    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  }
                }
              });
            }
          }
          setTimeout(() => {
            if (consulta <= 0) this.mensajeService.mensajeAdvertencia(`Advertencia`,`No se encontraron rollos con la combinación de búsqueda realizada!`)
            this.cargando = true;
          }, 3000);
        }, 1500);
       }
    } else this.mensajeService.mensajeAdvertencia(`Advertencia`,`Debe diligenciar los campos Proceso y/o Bodega!`);
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

  //Funcion que va a eliminar el rollo de la base de datos nueva y luego de BagPro.
  eliminarRolloIngresado(){
    this.display = false;
    this.cargando = false;
    let proceso : any = this.FormConsultarRollos.value.Proceso;
    proceso != null ? proceso = proceso.proceso_Nombre : proceso = null;

    if(proceso == 'Extrusion' && this.bodegaExtrusion == true) {
      for (let i = 0; i < this.rollosInsertar.length; i++) {
        this.dtIngRollosService.EliminarRollExtrusion(this.rollosInsertar[i].Id).subscribe();
      }
    }else if ((proceso == 'Sellado' || proceso == 'Empaque' || proceso == 'Extrusion') && this.bodegaDespacho == true) {
      for (let i = 0; i < this.rollosInsertar.length; i++) {
        this.servcioDetEntradaRollos.deleteRollosDespacho(this.rollosInsertar[i].Id).subscribe();
        this.eliminarRollosPreEntrega();
      }
    }
    setTimeout(() => { this.finalizarEliminacion(); }, 2500);
  }

  /**Funcion que va a eliminar el rollo de bagpro */
  eliminarRolloBagpro(){
    this.display = false;
    this.cargando = false;
    let proceso : any = this.FormConsultarRollos.value.Proceso;
    proceso != null ? proceso = proceso.proceso_Nombre : proceso = null;
    if(this.bodegaExtrusion == true) {
      if(proceso == 'Extrusion') {
        for (let i = 0; i < this.rollosInsertar.length; i++) {
          this.bagproService.EliminarRollExtrusion(this.rollosInsertar[i].Id).subscribe(() => {  }, () => {
            this.error = true;
            this.mensajeService.mensajeError(`Error`,`No fue posible eliminar los rollos de BagPro, dado que no fueron encontrados allí!`);
            this.cargando = true;
          });
        }
      }
    } else if (this.bodegaDespacho == true) {
      if(proceso == 'Empaque' || proceso == 'Extrusion') {
        for (let i = 0; i < this.rollosInsertar.length; i++) {
          this.bagproService.EliminarRollExtrusion(this.rollosInsertar[i].Id).subscribe(() => {  }, () => {
            this.error = true;
            this.mensajeService.mensajeError(`Error`,`No fue posible eliminar los rollos de BagPro, dado que no fueron encontrados allí!`);
            this.cargando = true;
          });
        }
      } else if (proceso == 'Sellado') {
        for (let i = 0; i < this.rollosInsertar.length; i++) {
          this.bagproService.DeleteRollosSellado_Wiketiado(this.rollosInsertar[i].Id).subscribe(() => {  }, () => {
            this.error = true;
            this.mensajeService.mensajeError(`Error`,`No fue posible eliminar los rollos de BagPro, dado que no fueron encontrados allí!`);
            this.cargando = true;
          });
        }
      }
    }
    setTimeout(() => {this.eliminarRolloIngresado(); }, 2000);
  }

  // Eliminación de rollos de la pre entrega
  eliminarRollosPreEntrega() {
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      this.servicioPreEntregaRollos.deleteRollosPreEntregados(this.rollosInsertar[i].Id).subscribe();
    }
  }

  //Funcion que se encargará de lenviar el mensaje de confirmación del envio y limpiará los campos
  finalizarEliminacion(){
    setTimeout(() => {
      this.mensajeService.mensajeConfirmacion(`Confirmación`,`${this.totalRollos} rollo(s) han sido eliminado(s) correctamente!`);
      this.limpiarCampos();
    }, 2000);
  }

  /** Cargar los procesos de donde puede venir el rollo. */
  obtenerProcesos = () => this.servicioProcesos.srvObtenerLista().subscribe(data =>  this.arrayProcesos = data.filter((item) => ['EXT', 'EMP', 'SELLA'].includes(item.proceso_Id)));

  /** Mostrar mensaje de Eleccion */
  mostrarEleccion(){
    if (this.rollosInsertar.length > 0) {
      this.messageService.add({severity:'warn', key: 'eleccion', summary: `Elección`, detail: `De cual base de datos desea eliminar la información?`, sticky: true});
    } else this.mensajeService.mensajeAdvertencia(`Advertencia`,`Debe cargar al menos un rollo en la tabla!`);
  }

  /** Eliminar rollos de bagpro al confirmar con el primer botón */
  onConfirm() {
    this.messageService.clear('eleccion');
    this.eliminarRolloBagpro();
  }

  /** Eliminar rollos de Plasticaribe BDD al confirmar con el primer botón */
  onConfirm2() {
    this.messageService.clear('eleccion');
    this.eliminarRolloIngresado();
  }

  /** Cerrar Dialogo de eliminación de rollos.*/
  onReject = () => this.messageService.clear('eleccion');
}
