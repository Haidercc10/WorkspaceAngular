import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
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
  @ViewChild('dt1') dt1: Table | undefined;
  @ViewChild('dt2') dt2: Table | undefined;

  constructor(private AppComponent : AppComponent,
    private frmBld : FormBuilder, 
    private svcMsjs : MensajesAplicacionService,
    private svcProdProcess : Produccion_ProcesosService,
    private svcProcess : ProcesosService,
    private svcMsg : MessageService) { 
    this.initForm();  
    this.selectedMode = this.AppComponent.temaSeleccionado; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  }

  ngOnInit() {
    this.getProcess();
  }

  //Función para inicializar el formulario
  initForm(){
    this.form = this.frmBld.group({
      RangoFechas : [null],
      Bodega : [null],
      Rollo : [null],
      OT : [null]
    });
  }

  //Función para obtener los procesos. 
  getProcess = () => this.svcProcess.srvObtenerLista().subscribe(data => this.process = data.filter(x => [8,4,3,7,2,1,9,5,6].includes(x.proceso_Codigo)));

  //Función para buscar los rollos a eliminar. 
  searchRolls(){
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
    
    this.svcProdProcess.GetInfoProduction(date1, date2, url).subscribe(data => {
      this.rolls = this.rolls.concat(data);
      this.load = false;
    }, error => {
      this.svcMsjs.mensajeAdvertencia(`Advertencia`, `No se encontraron registros de busqueda!`);
      this.load = false;
    });
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
  
  //Cantidad total consolidada por item 
  totalQuantityByItem = (item: number): number => this.rollsInsert.filter(x => x.prod_Id == item).reduce((a, b) => a + b.cantidad, 0);

  //Cantidad total consolidada por item 
  totalWeightByItem = (item: number): number => this.rollsInsert.filter(x => x.prod_Id == item).reduce((a, b) => a + b.peso_Neto, 0);

  //Cantidad de rollos a eliminar consolidada por item 
  totalRollsByItems = (item: number): number => this.rollsInsert.filter(x => x.prod_Id == item).length;

  //Cantidad total consolidada de los rollos a eliminar.
  totalQuantityConsolidated = (): number => this.rollsInsert.reduce((a, b) => a + b.cantidad, 0);

  //Total de rollos a eliminar
  totalRollsConsolidated = (): number => this.rollsInsert.length;

  //Función para mostrar mensaje de confirmación de eliminación de rollos.
  seeMsgElection = () => this.svcMsg.add({severity:'warn', key:'delete', summary:'Elección', detail: `¿Está seguro que desea eliminar el/los rollo(s) seleccionado(s)?`, sticky: true});

  //Función para eliminar los rollos seleccionados.
  deleteRolls(){
    let isError : boolean = false;
    this.onReject('delete');
    this.load = true;
    this.rollsInsert.forEach(x => {
      this.svcProdProcess.Delete(x.id).subscribe(resp => {}, error => {
        this.load = false;
        error = true;
      });
    });
    this.confirmDeleteMessage(isError); 
  }

  //Función para mostrar mensaje de confirmación de eliminación de rollos.
  confirmDeleteMessage(isError : boolean) {
    if(isError) this.svcMsjs.mensajeError(`Error`, `Ha ocurrido un error, verifique!`) 
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
  clearLabels = () => this.form.reset();
    
  //Función para limpiar todo
  clearAll() {
    this.form.reset();
    this.rolls = [];
    this.rollsInsert = [];
    this.consolidatedInfo = [];
    this.load = false;
  }

  //Función para cerrar el dialogo de elección.
  onReject = (key : any) => this.svcMsg.clear(key);
}
