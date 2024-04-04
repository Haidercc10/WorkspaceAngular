import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { modelRollosDesechos } from 'src/app/Modelo/modelRollosDesechos';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { FallasTecnicasService } from 'src/app/Servicios/FallasTecnicas/FallasTecnicas.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { SrvRollosEliminadosService } from 'src/app/Servicios/RollosDesechos/srvRollosEliminados.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-EliminarRollos_Produccion',
  templateUrl: './EliminarRollos_Produccion.component.html',
  styleUrls: ['./EliminarRollos_Produccion.component.css']
})
export class EliminarRollos_ProduccionComponent implements OnInit {
  load : boolean = false; //Variable para validar que salga o no la imagen de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  form !: FormGroup; //Variable que se usará para validar el formulario
  selectedMode : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  process : any = []; //Variable que almacenará la informacion de los procesos de producción
  rolls : any = []; //Variable que almacenará la informacion de los rollos de producción
  rollsInsert : any = []; //Variable que almacenará la informacion de los rollos a insertar en la base de datos
  consolidatedInfo : any = []; //Variable que almacenará la informacion consolidada de los rollos de producción
  fails : any = [];
  @ViewChild('dt1') dt1: Table | undefined;
  @ViewChild('dt2') dt2: Table | undefined;
  modalFails : boolean = false;
  rollsToDelete : Array<rollsToDelete> = []; 
  arrayDiscardRolls : Array<modelRollosDesechos> = [];

  constructor(private AppComponent : AppComponent,
    private frmBld : FormBuilder,
    private svcMsjs : MensajesAplicacionService,
    private svcProdProcess : Produccion_ProcesosService,
    private svcProcess : ProcesosService,
    private svcMsg : MessageService,
    private failsService : FallasTecnicasService,
    private svDiscardRolls : SrvRollosEliminadosService, 
    private svBagPro : BagproService) {
    this.initForm();
    this.selectedMode = this.AppComponent.temaSeleccionado; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  }

  ngOnInit() {
    this.getProcess();
    this.getFails();
    this.loadRankDates();
    //this.msjAuthorizeDeleteRolls();
  }

  //Función para cargar fechas en el rango.
  loadRankDates(){
    let initialDate = new Date(moment().subtract(30, 'days').format('YYYY-MM-DD'));
    this.form.patchValue({ 'RangoFechas' : [initialDate, new Date()] });
  }

  //Función para inicializar el formulario
  initForm(){
    this.form = this.frmBld.group({
      RangoFechas : [null],
      Bodega : [null],
      Rollo : [null],
      OT : [null],
      Falla : [null, Validators.required],
      Observacion : [null],
    });
  }

  //Función para obtener los procesos.
  getProcess = () => this.svcProcess.srvObtenerLista().subscribe(data => this.process = data.filter(x => [8,4,3,7,2,1,9,5,6].includes(x.proceso_Codigo)));

  //Función para obtener las fallas técnicas.
  getFails = () =>  this.failsService.srvObtenerLista().subscribe(datos => { this.fails = datos.filter((item) => item.tipoFalla_Id == 12) });

  //Función para buscar los rollos a eliminar.
  searchRolls(){
    if(this.form.valid) {
      let ot : any = this.form.value.OT;
      let process : any = this.form.value.Bodega;
      let roll : any = this.form.value.Rollo;
      let date1 : any = this.form.value.RangoFechas == null || this.form.value.RangoFechas.length == 0 ? this.today : moment(this.form.value.RangoFechas[0]).format('YYYY-MM-DD');
      let date2 : any = this.form.value.RangoFechas == null || this.form.value.RangoFechas.length == 0 ? date1 : moment(this.form.value.RangoFechas[1]).format('YYYY-MM-DD');

      this.load = true;
      let url : any = ``;

      if(process != null) url.length > 0 ? url += `&process=${process}` : url += `process=${process}`
      if(ot != null) url.length > 0 ? url += `&ot=${ot}` : url += `ot=${ot}`
      if(roll != null) url.length > 0 ? url += `&roll=${roll}` : url += `roll=${roll}`
      url.length > 0 ? url = `?${url}` : url = ``;

      this.svcProdProcess.GetInfoProduction(date1, date2, url).subscribe(data => { this.loadTable(data); }, error => {
        this.svcMsjs.mensajeAdvertencia(`Advertencia`, `No se encontraron registros de busqueda!`);
        this.load = false;
      });
    } else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `Debe elegir el motivo de la eliminación!`);
  }

  loadTable(data : any, ){
    let falla : any = this.form.value.Falla;
    let observacion : any = this.form.value.Observacion
     data.forEach(x => {
      if(!this.rolls.map(z => z.numeroRollo_BagPro).includes(x.numeroRollo_BagPro)) {
        this.rolls.push({
          'id': x.id,
          'ot': x.ot,
          'cli_Id': x.cli_Id,
          'cli_Nombre': x.cli_Nombre,
          'prod_Id': x.prod_Id,
          'prod_Nombre': x.prod_Nombre,
          'cantidad_Pedida': x.cantidad_Pedida,
          'numero_Rollo': x.numero_Rollo,
          'numeroRollo_BagPro': x.numeroRollo_BagPro,
          'prod_Ancho': x.prod_Ancho,
          'prod_Fuelle': x.prod_Fuelle,
          'prod_Largo': x.prod_Largo,
          'tara_Cono': x.tara_Cono,
          'cono_Id': x.cono_Id,
          'material_Id': x.material_Id,
          'material_Nombre': x.material_Nombre,
          'prod_Calibre': x.prod_Calibre,
          'fecha': x.fecha,
          'hora': x.hora,
          'maquina': x.maquina,
          'usua_Nombre': x.usua_Nombre,
          'proceso_Id': x.proceso_Id,
          'turno_Id': x.turno_Id,
          'estado_Rollo': x.estado_Rollo,
          'estado_Nombre': x.estado_Nombre,
          'peso_Bruto': x.peso_Bruto,
          'peso_Neto': x.peso_Neto,
          'cantidad': x.cantidad,
          'presentacion': x.presentacion,
          'proceso_Nombre': x.proceso_Nombre,
          'falla' : falla,
          'observacion' : observacion
        });
      }
    });
    this.load = false;
  }

  //Función para seleccionar todos los rollos consultados a la tabla de rollos a eliminar.
  selectAllRolls(){
    this.load = true;
    this.rolls = [];
    this.rollsInsert = this.rollsInsert.concat(this.rolls);
    this.getInfoConsolidated();
    setTimeout(() => this.load = false, 5);
  }

  //Función para seleccionar un rollo consultado a la tabla de rollos a eliminar.
  loadRollInsert(roll : any){
    this.load = true;
    let index = this.rolls.findIndex(x => x.numeroRollo_BagPro == roll.numeroRollo_BagPro);
    this.rolls.splice(index, 1);
    this.getInfoConsolidated();
    setTimeout(() => this.load = false, 5);
  }

  //Función para deseleccionar todos los rollos a eliminar.
  quitAllRolls(){
    this.load = true;
    this.rollsInsert = [];
    this.rolls = this.rolls.concat(this.rollsInsert);
    this.getInfoConsolidated();
    setTimeout(() => this.load = false, 5);
  }

  //Función para deseleccionar un rollo a eliminar.
  quitRollInsert(roll : any){
    this.load = true;
    let index = this.rollsInsert.findIndex(x => x.numeroRollo_BagPro == roll.numeroRollo_BagPro);
    this.rollsInsert.splice(index, 1);
    this.getInfoConsolidated();
    setTimeout(() => this.load = false, 5);
  }

  //Función para mostrar la información consolidada de los rollos a eliminar
  getInfoConsolidated(){
    this.consolidatedInfo = this.rollsInsert.reduce((a, b) => {
      if(!a.map(x => x.prod_Id).includes(b.prod_Id)) a = [...a, b];
      return a;
    }, [])
  }

  //Función que cargará los rollos a los que se cambiará el estado a eliminado.
  loadRollsToDelete(roll : any){
    this.rollsToDelete = [];
    roll.forEach(x => {
      this.rollsToDelete.push({
        'roll': x.numeroRollo_BagPro,
        'process' : x.proceso_Id,
      });
    });
  }

  //Función que va a cargar los rollos que se van a crear en la tabla rollos desechos.
  loadDiscardRolls(roll : any){
    this.arrayDiscardRolls = [];
    roll.forEach(x => {
      this.arrayDiscardRolls.push({
        'Rollo_Codigo' : 0,
        'Rollo_OT' : x.ot,
        'Rollo_Cliente': x.cli_Nombre,
        'Prod_Id' : x.prod_Id,
        'Rollo_TotalPedidoOT' : x.cantidad_Pedida,
        'Rollo_Id' : x.numeroRollo_BagPro,
        'Rollo_Ancho' : x.prod_Ancho,
        'Rollo_Largo' : x.prod_Largo,
        'Rollo_Fuelle' : x.prod_Fuelle,
        'UndMed_Id' : x.presentacion,
        'Rollo_PesoBruto' : x.peso_Bruto,
        'Rollo_PesoNeto' : x.peso_Neto,
        'Rollo_Tara' : x.tara_Cono,
        'Cono_Id' : x.cono_Id,
        'Material_Id' : x.material_Id,
        'Rollo_Calibre' : x.prod_Calibre,
        'Rollo_FechaIngreso' : x.fecha,
        'Rollo_Hora' : x.hora,
        'Rollo_Maquina' : x.maquina,
        'Rollo_Operario' : x.usua_Nombre,
        'Proceso_Id' : x.proceso_Id,
        'Turno_Id' : x.turno_Id,
        'Estado_Id' : 22,
        'Rollo_FechaEliminacion' : moment().format('YYYY-MM-DD'),
        'Rollo_HoraEliminacion' : moment().format('HH:mm:ss'),
        'Rollo_Observacion' : x.observacion,
        'Falla_Id' : x.falla
      })
    });
  }

  //Cantidad total consolidada por item
  totalQuantityByItem = (item: number): number => this.rollsInsert.filter(x => x.prod_Id == item).reduce((a, b) => a + b.cantidad, 0);

  //Cantidad total consolidada por item
  totalWeightByItem = (item: number): number => this.rollsInsert.filter(x => x.prod_Id == item).reduce((a, b) => a + b.peso_Neto, 0);

  //Cantidad de rollos a eliminar consolidada por item
  totalRollsByItems = (item: number): number => this.rollsInsert.filter(x => x.prod_Id == item).length;

  //Cantidad total consolidada de los rollos a eliminar.
  totalQuantityConsolidated() {
    let total = 0;
    for (const rolls of this.rollsInsert) {
      rolls.presentacion == 'Kg' ? total += rolls.peso_Neto : total += rolls.cantidad;
    }
    return total;
  }

  //Total de rollos a eliminar
  totalRollsConsolidated = (): number => this.rollsInsert.length;

  //Función para mostrar mensaje de confirmación de eliminación de rollos.
  seeMsgElection = () => this.svcMsg.add({severity:'warn', key:'delete', summary:'Elección', detail: `¿Está seguro que desea eliminar el/los rollo(s) seleccionado(s)?`, sticky: true});

  //Función para eliminar los rollos seleccionados.
  deleteRolls(){
    if(this.form.valid) {
      this.loadRollsToDelete(this.rollsInsert);
      this.loadDiscardRolls(this.rollsInsert)
      this.onReject('delete');
      this.load = true;

      this.svcProdProcess.putStateDeletedRolls(this.rollsToDelete).subscribe(data => { this.createDiscardRolls(); }, error => {
         this.svcMsjs.mensajeError(`Error`, `No fue posible eliminar los rollos!`);
         this.load = false;
      });
    } else this.svcMsjs.mensajeAdvertencia(`Advertencia`, `Debe justificar el motivo de eliminación de rollos/bultos.`);
  }

  //Función que creará los rollos eliminados en la tabla rollos desechos.
  createDiscardRolls(){
    let count : number = 0;
    this.arrayDiscardRolls.forEach(x => {
      
      this.svDiscardRolls.Post(x).subscribe(data => {
        count++;
        if(count == this.rollsInsert.length) this.addObservationDeletedRollsBagPro(this.rollsToDelete); //this.confirmDeleteMessage(false);
      }, error => {
        this.svcMsjs.mensajeError(`Error`, `No fue posible crear el registro de los rollos eliminados!`);
        this.load = false;
      });
    })
  }

  //Función para agregar la observación de los rollos eliminados en BagPro.
  addObservationDeletedRollsBagPro(rolls : any){
    this.svBagPro.putObservationDeletedRolls(rolls).subscribe(data => { this.confirmDeleteMessage(false); }, error =>{
      this.confirmDeleteMessage(true);
      this.load = false;
    })
  }

  //Función para mostrar mensaje de confirmación de eliminación de rollos.
  confirmDeleteMessage(isError : boolean) {
    if(isError) this.svcMsjs.mensajeError(`Error`, `Ha ocurrido actualizando la observación de los rollos eliminados en BagPro!`);
    else {
      this.svcMsjs.mensajeConfirmacion(`Rollos eliminados exitosamente!`);
      setTimeout(() => { this.clearAll(); }, 1000);
    }
  }

  //Función para filtrar la tabla de rollos consultados.
  applyFilter = ($event, campo : any, valorCampo : string) => this.dt1!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  //Función para filtrar la tabla de rollos a eliminar.
  applyFilter2 = ($event, campo : any, valorCampo : string) => this.dt2!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  //Función para limpiar los campos de filtros.
  clearLabels() {
    this.form.reset();
    this.loadRankDates();
    //this.msjAuthorizeDeleteRolls();
  } 
    
  //Función para limpiar todo
  clearAll() {
    this.form.reset();
    this.rolls = [];
    this.rollsInsert = [];
    this.consolidatedInfo = [];
    this.load = false;
    this.loadRankDates();
    this.arrayDiscardRolls = [];
    this.rollsToDelete = [];
    //this.msjAuthorizeDeleteRolls();
  }

  //Función para cerrar el dialogo de elección.
  onReject = (key : any) => this.svcMsg.clear(key);

  msjAuthorizeDeleteRolls = () => this.form.patchValue({ 'Observacion' : 'ELIMINACIÓN DE BULTOS/ROLLOS AUTORIZADA' })
}

export interface rollsToDelete {
  roll : number;
  process : string;
}
