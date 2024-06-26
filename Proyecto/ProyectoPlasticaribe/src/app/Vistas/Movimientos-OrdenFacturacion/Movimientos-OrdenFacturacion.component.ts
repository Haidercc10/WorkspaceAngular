import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { Dt_OrdenFacturacionService } from 'src/app/Servicios/Dt_OrdenFacturacion/Dt_OrdenFacturacion.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { AppComponent } from 'src/app/app.component';
import { Orden_FacturacionComponent } from '../Orden_Facturacion/Orden_Facturacion.component';
import { Devolucion_OrdenFacturacionComponent } from '../Devolucion_OrdenFacturacion/Devolucion_OrdenFacturacion.component';
import { DetallesDevolucionesProductosService } from 'src/app/Servicios/DetallesDevolucionRollosFacturados/DetallesDevolucionesProductos.service';
import { Table } from 'primeng/table';
import { OrdenFacturacionService } from 'src/app/Servicios/OrdenFacturacion/OrdenFacturacion.service';
import { MessageService } from 'primeng/api';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { HttpErrorResponse } from '@angular/common/http';
import { OrdenFacturacion_PalletsComponent } from '../OrdenFacturacion_Pallets/OrdenFacturacion_Pallets.component';
import { Gestion_DevolucionesOFComponent } from '../Gestion_DevolucionesOF/Gestion_DevolucionesOF.component';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-Movimientos-OrdenFacturacion',
  templateUrl: './Movimientos-OrdenFacturacion.component.html',
  styleUrls: ['./Movimientos-OrdenFacturacion.component.css']
})
export class MovimientosOrdenFacturacionComponent implements OnInit {

  formFilters !: FormGroup;
  load: boolean = false;
  modoSeleccionado: boolean;
  validateRole: number;
  storage_Id : number;
  storage_Nombre : any;
  serchedData: any[] = [];
  @ViewChild('dt') dt: Table;
  states: Array<string> = ['PENDIENTE','DESPACHADO', ];
  anulledOrder: number | undefined;
  modalReposition : boolean = false;
  modalDevolution : boolean = false;
  @ViewChild(Gestion_DevolucionesOFComponent) managementDevolutions : Gestion_DevolucionesOFComponent;
  @ViewChild(Orden_FacturacionComponent) Orden_FacturacionComponent : Orden_FacturacionComponent;
  
  constructor(private appComponent : AppComponent,
    private frmBuilder : FormBuilder,
    private dtOrderFactService : Dt_OrdenFacturacionService,
    private msg : MensajesAplicacionService,
    private devolucion_OrdenFacturacionComponent : Devolucion_OrdenFacturacionComponent,
    private dtDevolutionsService : DetallesDevolucionesProductosService,
    private orderFactService: OrdenFacturacionService,
    private messageService: MessageService,
    private productionProcessService : Produccion_ProcesosService,
    private cmpOrdFact : OrdenFacturacion_PalletsComponent, ) {

    this.modoSeleccionado = this.appComponent.temaSeleccionado;
    this.formFilters = this.frmBuilder.group({
      orderFact : [null, Validators.required],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
    });
  }

  ngOnInit() {
    this.readStorage();
  }

  readStorage(){
    this.storage_Id = this.appComponent.storage_Id;
    this.storage_Nombre = this.appComponent.storage_Nombre;
    this.validateRole = this.appComponent.storage_Rol;
  }

  clearFields(){
    this.load = false;
    this.serchedData = [];
    this.formFilters.reset();
    this.dt.clear();
  }

  searchData(){
    let orderNum : any = this.formFilters.value.orderFact;
    let dateLastMonth : any = moment().subtract(1, 'M').format('YYYY-MM-DD');
    let startDate : any = moment(this.formFilters.value.startDate).format('YYYY-MM-DD') == 'Fecha inválida' ? dateLastMonth : moment(this.formFilters.value.startDate).format('YYYY-MM-DD');
    let endDate : any = moment(this.formFilters.value.endDate).format('YYYY-MM-DD') == 'Fecha inválida' ? moment().format('YYYY-MM-DD') : moment(this.formFilters.value.endDate).format('YYYY-MM-DD');
    let route : string = orderNum != null ? `?order=${orderNum}` : '';
    this.load = true;
    this.serchedData = [];
    this.dt.clear();
    this.dtOrderFactService.GetOrders(startDate, endDate, route).subscribe(data => {
      if(![5,83].includes(this.validateRole)) data.forEach(dataOrder => this.serchedData.push(dataOrder));
      this.load = false;
    }, error => {
      this.load = false;
      this.msg.mensajeError(`¡No se encontró información de ordenes realizadas con los parametros consultados!`, `Error: ${error.error.title} | Status: ${error.status}`);
    });
    this.searchDataDevolutions(startDate, endDate, route);
  }

  searchDataDevolutions(startDate: any, endDate: any, route: string){
    this.dtDevolutionsService.GetDevolutions(startDate, endDate, route).subscribe(data => {
      data.forEach(dataDevolution => this.serchedData.push(dataDevolution));
    }, () => this.load = false);
  }

  createPDF(id : number, fact: string, type : string){
    this.load = true;
    if (type == 'Orden') {
      this.dtOrderFactService.GetInformacionOrderFact(id).subscribe(data => {
        let pallet : boolean = data.some(x => x.dtOrder.pallet_Id != null);
        !pallet ? this.Orden_FacturacionComponent.createPDF(id, fact) : this.cmpOrdFact.createPDF(id, fact);
      }, error => {
        this.msg.mensajeError(`Error`, `Error al consultar la OF N° ${id} | ${error.status} ${error.statusText}`);
      });
    } else if (type == 'Devolucion') this.devolucion_OrdenFacturacionComponent.createPDF(id, 'exportada');
    setTimeout(() => this.load = false, 3000);
  }

  confirmSendData(order: number) {
    this.anulledOrder = order;
    this.messageService.add({
      severity: 'warn',
      key: 'confirmation',
      summary: 'Confirmación',
      detail: `Se anulará la orden #${order}, los rollos de está orden estarán nuevamente disponibles y la orden no se podrá despachar. ¿Desea continuar?`,
      sticky: true
    });
  }

  onReject = () => this.messageService.clear('confirmation');

  errorMessage(message: string, error: HttpErrorResponse) {
    this.load = false;
    this.msg.mensajeError(message, `Error: ${error.statusText} | Status: ${error.status}`);
  }

  PutStatusOrderAnulled() {
    this.onReject();
    this.load = true;
    this.orderFactService.PutStatusOrderAnulled(this.anulledOrder).subscribe(() => {
      this.PutStatusDetailsOrder();
    }, error => this.errorMessage(`¡Ocurrió un error al intentar anular la orden #${this.anulledOrder}!`, error));
  }

  PutStatusDetailsOrder(){
    this.productionProcessService.putStateAvaible(this.anulledOrder).subscribe(() => {
      this.msg.mensajeConfirmacion(`¡Orden de facturación anulada con éxito!`);
      this.load = false;
    }, error => this.errorMessage(`¡Ocurrió un error al colocar en disponible los rollos de la orden #${this.anulledOrder}!`, error));
  }

  //
  loadModalOrderFact(data : any){
    console.log(data);
    if(data.type == 'Devolucion' && data.or.reposicion && data.or.estado_Id == 38) {
      if([6,1].includes(this.validateRole)) {
        this.Orden_FacturacionComponent.clearFields(false);
        this.modalReposition = true;  
        this.Orden_FacturacionComponent.loadInfoForDevolution(data.or.id); 
      } else this.msg.mensajeAdvertencia(`No cuenta con permisos suficientes para realizar ordenes de facturación.`);
    } else if(data.type == 'Devolucion' && [11,29].includes(data.or.estado_Id)) {
      if([5,1].includes(this.validateRole)) {
        this.managementDevolutions.clearFields();
        this.managementDevolutions.devolution = true;
        this.modalDevolution = true;
        this.managementDevolutions.form.patchValue({ dev : data.or.id, }); 
        this.managementDevolutions.searchData();
      } else this.msg.mensajeAdvertencia(`No cuenta con permisos suficientes para gestionar devoluciones.`);
    } else this.msg.mensajeAdvertencia(`La devolución N° ${data.or.id} no está disponible para reposición y/o revisión!`);
  }

  msjDevolutions(data){
    return `${data.type == 'Devolucion' && ![18,39].includes(data.or.estado_Id) ? 'Haz doble clic para continuar gestionando la devolución' : [18,39].includes(data.or.estado_Id) ? `La devolucion N° ${data.or.id} será repuesta en la orden N° ${data.of}` : ''}`
  }
}