import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { Table } from 'primeng/table';
import { modelBodegasRollos } from 'src/app/Modelo/modelBodegasRollos';
import { modelDtBodegasRollos } from 'src/app/Modelo/modelDtBodegasRollos';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { Bodegas_RollosService } from 'src/app/Servicios/Bodegas_Rollos/Bodegas_Rollos.service';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { Detalle_BodegaRollosService } from 'src/app/Servicios/Detalle_BodegaRollos/Detalle_BodegaRollos.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { Ubicaciones_BodegaRollosService } from 'src/app/Servicios/Ubicaciones_BodegaRollos/Ubicaciones_BodegaRollos.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsBodegas as defaultSteps } from 'src/app/data';
import { UtileriaService } from 'src/app/Servicios/Utileria/utileria.service';
import { finalize, pipe } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-Ingreso_Rollos_Extrusion',
  templateUrl: './Ingreso_Rollos_Extrusion.component.html',
  styleUrls: ['./Ingreso_Rollos_Extrusion.component.css']
})
export class Ingreso_Rollos_ExtrusionComponent implements OnInit {

  load : boolean = false; //Variable para validar que salga o no la imagen de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : any; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : any; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  FormConsultarRollos !: FormGroup; //formulario para consultar y crear un ingreso de rollos
  rollosConsultados : any [] = []; //Variable que almacenará la información de los rollos que hayan sido consultados
  rollosIngresar : any [] = []; //Variable que almcanerá la información de los rollos que van a ser ingresados
  consolidadoProductos : any [] = []; //Variable que almacenará la información consolidad de los rollos que van a ser ingresados
  informacionPdf : any [] = [];

  procesos : any = []; //Variable que cargará los procesos.
  ubicaciones : any = ['IZQUIERDA', 'DERECHA'];
  @ViewChild('dt') dt : Table | undefined; 
  loadModal : boolean = false;
  rollosOT : any = [];
  rollosSeleccionados : any = [];
  procesos2 : any = [];
  title : string = ``;
  ubications : Array<any> = [];
  subUbications : Array<any> = [];
  loadModalAvailables : boolean = false;
  rollsAvailables : any = [];
  
  constructor(private AppComponent : AppComponent,
                private shepherdService: ShepherdService,
                  private frmBuilder : FormBuilder,
                    private bagProService : BagproService,
                      private bgRollosService : Bodegas_RollosService,
                        private dtBgRollosService : Detalle_BodegaRollosService,
                          private svProcesos : ProcesosService, 
                            private PDFService : CreacionPdfService,
                              private svUbicationsStore : Ubicaciones_BodegaRollosService,
                                private util : UtileriaService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;

    this.FormConsultarRollos = this.frmBuilder.group({
      Proceso : ['EXT', Validators.required],
      Bodega_Actual : [null, Validators.required],  
      OrdenTrabajo: [null, Validators.required],
      Rollo : [null],
      Peso : [null],
      Item : [null],
      SubUbicacion: [null],
      Ubicacion : [null, Validators.required],
      Ultimo_Rollo : [null, Validators.required],
      Observacion : [''],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
    this.getProcesos();
    //this.loadCurrentWareHouse();
  }

  //*
  loadCurrentWareHouse(){
    if([95,1].includes(this.ValidarRol))  {
      this.FormConsultarRollos.patchValue({ Bodega_Actual : 'BGPI' });
      this.title = ``;
    } else if([89].includes(this.ValidarRol)) {
      this.FormConsultarRollos.patchValue({ Bodega_Actual : 'ROT' });
      this.title = this.procesos2.find(x => x.proceso_Id == 'ROT').proceso_Nombre;
    } else if([86].includes(this.ValidarRol)) {
      this.FormConsultarRollos.patchValue({ Bodega_Actual : 'SELLA' });
      this.title = this.procesos2.find(x => x.proceso_Id == 'SELLA').proceso_Nombre;
    } else if([4].includes(this.ValidarRol)) {
      this.FormConsultarRollos.patchValue({ Bodega_Actual : 'IMP' });
      this.title = this.procesos2.find(x => x.proceso_Id == 'IMP').proceso_Nombre;
    } 
    this.getAllUbicationsStore();
  }

  // Funcion que va a hacer que se inicie el tutorial in-app
  tutorial(){
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // funcion que va a limpiar los campos del formulario
  limpiarForm() {
    this.FormConsultarRollos.reset()
    this.FormConsultarRollos.patchValue({ Proceso : 'EXT' });
    this.loadCurrentWareHouse();
  } 

  // Funcion que va a limpiar todos los campos
  limpiarCampos(){
    this.FormConsultarRollos.reset();
    this.FormConsultarRollos.patchValue({ Proceso : 'EXT' });
    this.loadCurrentWareHouse();
    this.rollosIngresar = [];
    this.rollosOT = [];
    this.rollosSeleccionados = [];
    this.load = false;
  }

  getAllUbicationsStore() {
    let bodega_Actual : any = this.FormConsultarRollos.value.Bodega_Actual;
    this.svUbicationsStore.getUbicationsForProcess(bodega_Actual).subscribe(data => { 
      this.ubicaciones = data;
      this.ubications = data.reduce((a, b) => {
        if(!a.map(x => x.ubR_Id).includes(b.ubR_Id)) a = [...a, b];
          return a;
      }, []); 
    }, error => {
      this.util.Notificacion(`Error`, `No fue posible cargar las ubicaciones | ${error.status} ${error.statusText}`)
    }); 
  }

  getSubUbications() {
    let ubication : any = this.FormConsultarRollos.value.Ubicacion;
    this.subUbications = this.ubicaciones.filter(x => x.ubR_Id == ubication);
  }

  //Función para obtener los procesos.
  getProcesos() {
    this.svProcesos.srvObtenerLista().subscribe(data => { 
      this.procesos = data.filter(x => [1].includes(x.proceso_Codigo));
      this.procesos2 = data.filter(x => [2,3,4,13,16].includes(x.proceso_Codigo));
      this.loadCurrentWareHouse(); 
    }, error => { 
      this.util.Notificacion(`Error`, `Error al consultar los procesos. | ${error.status} ${error.statusText}`); 
    });
  } 

  aplicarFiltro = ($event, campo : any, datos : Table) => datos!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  cargarRolloTabla(){
    if(this.FormConsultarRollos.value.Ubicacion) {
      if(this.FormConsultarRollos.value.Proceso) {
        if(this.FormConsultarRollos.value.Rollo) {
          let rollo : number = this.FormConsultarRollos.value.Rollo;
          let area :  string =  this.FormConsultarRollos.value.Proceso;
          let proceso : string =  this.procesos.find(x => x.proceso_Id == area).proceso_Nombre;
          this.load = true;

          this.dtBgRollosService.getRollo(rollo, area).pipe(finalize(()=> this.load = false)).subscribe(dataPl => {
            if(dataPl.length == 0) {
              this.bagProService.getRollProduction(rollo, `?process=${proceso.toUpperCase()}`).subscribe(data => {
                if(data != null) this.ingresarRollos(data);
                else {
                  this.util.Notificacion(`Advertencia`, `No se encontró el rollo N° '${rollo}' en el proceso de '${proceso.toUpperCase()}'`);
                  this.cargarUltimoRollo();
                } 
              }, error => { 
                this.util.Notificacion(`Error`, `Error al consultar el rollo N° ${rollo} en BagPro! | ${error.statusText} ${error.status}`); 
                this.cargarUltimoRollo();
              });
            } else {
              this.util.Notificacion(`Advertencia`, `El rollo N° '${rollo}' ya está registrado en la bodega`);
              this.cargarUltimoRollo();
            }
          }, error => {
            this.util.Notificacion(`Error`, `Se encontraron errores al consultar el rollo N° ${rollo} en Plasticaribe!`); 
            this.cargarUltimoRollo();
          });  
        } else this.util.Notificacion(`Advertencia`, `Debe llenar el campo 'Rollo'`);
      } else this.util.Notificacion(`Advertencia`, `Debe llenar el campo 'Proceso'`);
    } else this.util.Notificacion(`Advertencia`, `Debe llenar el campo 'Ubicación'`);
  }

  agregarRollo(data : any){
    let bulto : any = data.rollo;
    let subUbicacion : any = [undefined, null].includes(this.FormConsultarRollos.value.SubUbicacion) ? 0 : this.FormConsultarRollos.value.SubUbicacion;
    
    if(!this.rollosIngresar.map(x => x.rollo).includes(bulto)) {
      data.ubicacion = this.ubicaciones.find(x => x.ubR_Id == this.FormConsultarRollos.value.Ubicacion && x.ubR_SubId == subUbicacion).ubR_Nomenclatura;
      data.proceso_Id = this.FormConsultarRollos.value.Proceso;
      data.bodega_Actual = this.FormConsultarRollos.value.Bodega_Actual;
      data.bodega = this.procesos2.find(x => x.proceso_Id == data.bodega_Actual).proceso_Nombre;
      
      this.rollosIngresar.unshift(data); 
      this.FormConsultarRollos.patchValue({ 'OrdenTrabajo' : data.ot, 'Ultimo_Rollo' : data.rollo, 'Rollo' : null, 'Peso' : data.peso, });

      this.util.Notificacion(`Confirmación`, `El rollo N° ${bulto} ha sido agregado a la tabla correctamente.`);
      this.load = false; 
    } else {
      this.util.Notificacion(`Advertencia`, `El rollo N° ${bulto} ya se encuentra agregado en la tabla.`);
      this.cargarUltimoRollo();
    } 
  }

  cargarUltimoRollo(){
    let data = this.rollosIngresar[0];
    if(![undefined, null].includes(data)) {
      this.FormConsultarRollos.patchValue({ 'OrdenTrabajo' : data.ot, 'Ultimo_Rollo' : data.rollo, 'Rollo' : null, 'Peso' : data.peso, });
    } else this.FormConsultarRollos.patchValue({ 'OrdenTrabajo' : null, 'Ultimo_Rollo' : null, 'Rollo' : null, 'Peso' : null, });
    this.load = false;
  }

  getRolloOrdenProduccion(){
    if(this.FormConsultarRollos.value.Ubicacion) {
      if(this.FormConsultarRollos.value.Proceso) {
        if(this.FormConsultarRollos.value.OrdenTrabajo) {
          if(this.FormConsultarRollos.value.Peso) {
            let ot : any = this.FormConsultarRollos.value.OrdenTrabajo;
            let area : any = this.FormConsultarRollos.value.Proceso;
            
            let proceso : string = this.procesos.find(x => x.proceso_Id == area).proceso_Nombre;
            
            let peso : number = this.FormConsultarRollos.value.Peso;
            this.rollosSeleccionados = [];
            this.rollosOT = [];
            this.load = true;

            this.FormConsultarRollos.patchValue({ 'OrdenTrabajo' : null, 'Ultimo_Rollo' : null, 'Rollo' : null, 'Peso' : null });

            this.dtBgRollosService.getRollsForOT(ot).pipe(finalize(() => this.load = false)).subscribe(dataPl => {
              this.bagProService.getAvailablesRollsOT(ot, proceso, dataPl).subscribe(data => {
                if(data.length > 0) this.cargarRolloSemejante(data, peso, dataPl);
                else {
                  this.util.Notificacion(`Advertencia`, `No se encontró información de la orden N° ${ot} en el proceso ${proceso.toUpperCase()} en BagPro!`);
                  this.cargarUltimoRollo();
                } 
              }, error => {
                this.util.Notificacion(error.status == 400 ? `Advertencia` : `Error`, error.status == 400 ? `No se encontraron rollos pesados de la OT N° ${ot} en el proceso de ${proceso.toUpperCase()} BagPro!` : `Error en la busqueda de la OT N° ${ot} en BagPro!`); 
                this.cargarUltimoRollo();
              });
            }, error => {
                this.util.Notificacion(`Error`, `No fue posible consultar la OT N° ${ot} en la bodega de rollos`)
                this.cargarUltimoRollo();
            });
          } else this.util.Notificacion(`Advertencia`, `Para consultar un rollo por OT debe llenar el campo 'PESO'.`);
        }  else this.util.Notificacion(`Advertencia`, `Debe llenar el campo 'OT'.`);
      } else this.util.Notificacion(`Advertencia`, `Debe llenar el campo 'PROCESO'.`);
    } else this.util.Notificacion(`Advertencia`, `Debe llenar el campo 'UBICACIÓN'.`);
  }

  cargarRolloSemejante(data : any, peso : number, dataInStore : any){
    data.sort((a, b) => a.extnetokg - b.extnetokg);
    let count : number = 0

    for (let index = 0; index < data.length; index++) {
      if(!this.rollosIngresar.map(x => x.rollo).includes(data[index].item) && 
          (data[index].extnetokg >= (peso - 5) && data[index].extnetokg <= (peso + 5)) && 
            !dataInStore.map(x => x).includes(data[index].item)) {
        this.FormConsultarRollos.patchValue({ 'Rollo' : data[index].item, });
        this.cargarRolloTabla();
        break;
      } else count++;   
    }
    if(count == data.length) {
      this.cargarUltimoRollo();
      this.loadModal = true;
      this.rollosOT = data.filter(x => !this.rollosIngresar.map(x => x.rollo).includes(x.item));
    } 
    this.load = false;
  }

  onRowSelect(event: any) {
    setTimeout(() => {
      this.loadModal = false;
      this.FormConsultarRollos.patchValue({ 'Rollo' : event.data.item, });
      this.cargarRolloTabla();
    }, 500);
  }

  onRowUnselect(event: any) {
    //this.loadModal = false;
    //this.msg.add({ severity: 'info', summary: 'Rollo Seleccionado', detail: event.data.item });
    this.FormConsultarRollos.patchValue({ 'Rollo' : null, });
  }

  pesoTotal = () => this.rollosIngresar.reduce((acc, contador) => acc += contador.peso, 0);
  
  totalRollos = () => this.rollosIngresar.length;

  //Funcion que va a quitar lo rollos que se van a insertar
  quitarRolloTabla(item : any){
    this.load = true;
    
    setTimeout(() => {
      this.util.Notificacion(`Advertencia`, `Se quitó el rollo N° ${item.rollo} de la tabla!`);
      let index = this.rollosIngresar.findIndex(x => x.rollo == item.rollo && x.ot == item.ot);
      this.rollosIngresar.splice(index, 1);
      this.load = false;
      this.cargarUltimoRollo();
    }, 500); 
  }

  /// Funcion que va a crear los rollos en la base de datos
  ingresarRollos(dataBagpro : any){
    //if (this.rollosIngresar.length > 0){
      this.load = true;
      const info : modelBodegasRollos = {
        'BgRollo_FechaEntrada': moment().format('YYYY-MM-DD'),
        'BgRollo_HoraEntrada': moment().format('H:mm:ss'),
        'BgRollo_FechaModifica': moment().format('YYYY-MM-DD'),
        'BgRollo_HoraModifica': moment().format('H:mm:ss'),
        'BgRollo_Observacion': this.FormConsultarRollos.value.Observacion == null ? '' : this.FormConsultarRollos.value.Observacion.toUpperCase(),
        'Usua_Id': this.storage_Id,
      }
      this.bgRollosService.Post(info).pipe(finalize(()=> this.load = false)).subscribe(data => this.ingresarDetallesRollos(data.bgRollo_Id, dataBagpro), error => {
        this.util.Notificacion(`Error`, `Se encontró un error al ingresar los rollos | ${error.status} ${error.statusText}`);
      });
  }

  ingresarDetallesRollos(id : number, x : any){
    this.load = true;
    let subUbicacion : any = [undefined, null].includes(this.FormConsultarRollos.value.SubUbicacion) ? 0 : this.FormConsultarRollos.value.SubUbicacion;
    let ubicacion : any = this.ubicaciones.find(x => x.ubR_Id == this.FormConsultarRollos.value.Ubicacion && x.ubR_SubId == subUbicacion).ubR_Nomenclatura;
    let proceso_Id : any = this.FormConsultarRollos.value.Proceso;
    let bodega_Actual : any = this.FormConsultarRollos.value.Bodega_Actual;
    
    const info : modelDtBodegasRollos = {
      'BgRollo_Id': id,
      'BgRollo_OrdenTrabajo': x.ot,
      'Prod_Id': parseInt(x.item),
      'DtBgRollo_Rollo': x.rollo,
      'DtBgRollo_Cantidad': x.peso,
      'UndMed_Id': x.unidad,
      'BgRollo_BodegaActual': bodega_Actual,
      'DtBgRollo_Extrusion': true,
      'DtBgRollo_ProdIntermedio': true,
      'DtBgRollo_Impresion': bodega_Actual == 'IMP' ? true : false,
      'DtBgRollo_Rotograbado': bodega_Actual == 'ROT' ? true : false,
      'DtBgRollo_Sellado': bodega_Actual == 'SELLA' ? true : false,
      'DtBgRollo_Corte': bodega_Actual == 'CORTE' ? true : false,
      'DtBgRollo_Despacho': false,
      'DtBgRollo_Calidad': bodega_Actual == 'CALIDAD' ? true : false,
      'Estado_Id': 19,
      'BgRollo_BodegaInicial': proceso_Id,
      'DtBgRollo_Ubicacion': ubicacion, 
      'BgRollo_BodegaIngreso': bodega_Actual,
      'DtBgRollo_FechaFab': x.fecha,
      'DtBgRollo_Maq': x.maquina,
    }
    this.dtBgRollosService.Post(info).pipe(finalize(()=> this.load = false)).subscribe(() => {
      this.listarRolloTabla(info, x);
      this.msjIngresoExitoso(info);
    }, error => this.util.Notificacion(`Error`, `Ha ocurrido un error al ingresar el/los rollos | ${error.status} ${error.statusText}`));
  }

  //Función para 
  listarRolloTabla(infoPL : any, dataBg : any){
    let proceso : any = this.procesos2.find(x => x.proceso_Id == infoPL.BgRollo_BodegaIngreso).proceso_Nombre;

    this.rollosIngresar.unshift({
      'rollo' : infoPL.DtBgRollo_Rollo,
      'ot' : infoPL.BgRollo_OrdenTrabajo,
      'cliente' : dataBg.cliente,
      'item' : infoPL.Prod_Id,
      'referencia' : dataBg.referencia,
      'peso' : infoPL.DtBgRollo_Cantidad,
      'unidad' : infoPL.UndMed_Id,
      'proceso' : proceso.toUpperCase(),
      'bodega' : infoPL.BgRollo_BodegaInicial,
      'ubicacion' : infoPL.DtBgRollo_Ubicacion,
      'fecha' : infoPL.DtBgRollo_FechaFab,
      'maquina' : infoPL.DtBgRollo_Maq,
    });
  }

  // Funcion que se va a ejecutar cuando se hayan ingresado todos los rollos
  msjIngresoExitoso(data : any){
    this.FormConsultarRollos.patchValue({ 'OrdenTrabajo' : data.BgRollo_OrdenTrabajo, 'Ultimo_Rollo' : data.DtBgRollo_Rollo, 'Rollo' : null, 'Peso' : data.DtBgRollo_Cantidad, });
    this.util.Notificacion(`Confirmación`, `Se han ingresado el rollo N° ${data.DtBgRollo_Rollo} a la bodega con éxito.`);
    this.load = false;
  }

  createPDF(id : number, action : string) {
    this.load = true;
    this.dtBgRollosService.GetInformacionIngreso(id).pipe(finalize(()=> this.load = false)).subscribe(data => {
      let title: string = `Ingreso de rollos N° ${id}`;
      let content: any[] = this.PDFService.IngresoBodegaRollos_contentPDF(data);
      this.PDFService.formatoPDF(title, content);
      this.util.Notificacion(`Confirmación`, `Se realizó el ingreso de rollos a bodega ${action} con éxito!.`);
      setTimeout(() => this.limpiarCampos(), 3000);
    }, error => this.util.Notificacion(`Error`, `Error al consultar el ingreso de rollos N° ${id} | ${error.status} ${error.statusText}`));
  }
}
