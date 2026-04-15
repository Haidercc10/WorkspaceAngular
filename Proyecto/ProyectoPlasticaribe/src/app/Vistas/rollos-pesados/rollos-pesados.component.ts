import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { AppComponent } from 'src/app/app.component';
import { CreacionExcelService } from 'src/app/Servicios/CreacionExcel/CreacionExcel.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { Movimientos_RollosComponent } from '../Movimientos_Rollos/Movimientos_Rollos.component';

@Component({
  selector: 'app-rollos-pesados',
  templateUrl: './rollos-pesados.component.html',
  styleUrls: ['./rollos-pesados.component.css']
})
export class RollosPesadosComponent {
  load: boolean = false;
  storage_Id: number | undefined;
  storage_Name: string | undefined;
  validateRole: number | undefined;
  form: FormGroup;
  selectedMode: boolean = false;
  process: Array<any> = [];
  rolls : any = [];
  rollsConsolidate : any = [];
  @ViewChild('tableRolls') tableRolls : Table | undefined;
  @ViewChild('tableConsolidate') tableConsolidate : Table | undefined;
  @ViewChild(Movimientos_RollosComponent) cmpMovRolls : Movimientos_RollosComponent;
  traceability : boolean = false;
  selectedRoll : number | null = null;

  constructor(private appComponent: AppComponent,
      private frmBuilder: FormBuilder,
      private msg: MensajesAplicacionService,
      private svExcel : CreacionExcelService, 
      private svProdProcess : Produccion_ProcesosService,
      private svProcess : ProcesosService,
    ) {
      this.selectedMode = this.appComponent.temaSeleccionado;
      this.initForm();
    }
  
    ngOnInit() {
      this.getProcess();
    }

    getProcess = () => this.svProcess.srvObtenerLista().subscribe(data => { this.process = data.filter(x => ['EXT','SELLA','EMP'].includes(x.proceso_Id))}, error => { this.msg.mensajeError(error) });
  
    initForm() {
      this.form = this.frmBuilder.group({
        process : [null],
        start: [new Date()],
        end: [new Date()],
      });
    }

    clearFields() {
      this.initForm();
      this.load = false;
      this.rolls = [];
      this.rollsConsolidate = [];
    }

    aplyFilter = ($event, campo: string, table: Table) => table!.filter(($event.target as HTMLInputElement).value, campo, 'contains');
    
    findRolls(){
      this.rolls = [];
      this.rollsConsolidate = [];
      this.load = true;
      let date1 : any = moment(this.form.value.start).format('YYYY-MM-DD');
      let date2 : any = moment(this.form.value.end).format('YYYY-MM-DD');
      let process : any = this.form.value.process;
      let url : string = ``;

      if(process != null) process.length > 0 ? url = `?process=${process}` : url = ``;

      this.svProdProcess.getRolls(date1, date2, url).subscribe(data => {
        this.rolls = data;
        this.dataConsolidated(data);
        this.load = false;
      }, error => {
        this.msg.mensajeAdvertencia(`Error`, `No se encontró información | ${error.status} ${error.statusText}`);
        this.load = false;
      }); 
    }

    dataConsolidated(data : any){
      this.rolls.forEach(x => {
        if(!this.rollsConsolidate.map(z => z.date).includes(x.fecha)) {
          this.rollsConsolidate.push({
            'date' : x.fecha,
          })
        }
      });
    }

    Total = (data : any, date : any) => data.filter(x => x.fecha == date).length;

    InProduction = (data : any, date : any) => data.filter(x => x.envio_Zeus == 'NO' && x.status_Id == 19 && x.fecha == date).length;

    Precharged = (data : any, date : any) => data.filter(x => x.envio_Zeus == 'SI' && x.status_Id == 50 && x.fecha == date).length;

    InDispatch = (data : any, date : any) => data.filter(x => x.envio_Zeus == 'SI' && x.status_Id == 19 && x.fecha == date).length;

    InFact = (data : any, date : any) => data.filter(x => x.envio_Zeus == 'SI' && x.status_Id == 20 && x.fecha == date).length;

    NotAvailable = (data : any, date : any) => data.filter(x => x.envio_Zeus == 'SI' && x.status_Id == 23 && x.fecha == date).length;

    eliminated = (data : any, date : any) => data.filter(x => x.envio_Zeus == 'NO' && x.status_Id == 22 && x.fecha == date).length;

    Peletizado = (data : any, date : any) => data.filter(x => x.envio_Zeus == 'SI' && x.status_Id == 44 && x.fecha == date).length;

    Devolution = (data : any, date : any) => data.filter(x => x.envio_Zeus == 'SI' && x.status_Id == 24 && x.fecha == date).length;

  //*Función para cargar el modal de movimientos.
  searchMovements(data : any){
    this.load = true;
    setTimeout(() => {
      this.traceability = true;
      this.selectedRoll = data.rollo;
      this.cmpMovRolls.searchMovements(data, `Produccion`, data.productionPL);
      this.load = false;
    }, 500);
  } 

    exportExcel(){}
}
