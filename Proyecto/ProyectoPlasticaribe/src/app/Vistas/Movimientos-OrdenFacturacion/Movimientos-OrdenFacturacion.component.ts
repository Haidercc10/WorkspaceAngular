import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { Dt_OrdenFacturacionService } from 'src/app/Servicios/Dt_OrdenFacturacion/Dt_OrdenFacturacion.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { AppComponent } from 'src/app/app.component';
import { Orden_FacturacionComponent } from '../Orden_Facturacion/Orden_Facturacion.component';
import { Devolucion_OrdenFacturacionComponent } from '../Devolucion_OrdenFacturacion/Devolucion_OrdenFacturacion.component';
import { DetallesDevolucionesProductosService } from 'src/app/Servicios/DetallesDevolucionRollosFacturados/DetallesDevolucionesProductos.service';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-Movimientos-OrdenFacturacion',
  templateUrl: './Movimientos-OrdenFacturacion.component.html',
  styleUrls: ['./Movimientos-OrdenFacturacion.component.css']
})
export class MovimientosOrdenFacturacionComponent implements OnInit {

  formFilters !: FormGroup;
  load: boolean = false;
  modoSeleccionado: boolean;
  ValidarRol: number;
  storage_Id : number;
  storage_Nombre : any;
  serchedData: any[] = [];
  @ViewChild('dt') dt: Table;

  constructor(private appComponent : AppComponent,
    private frmBuilder : FormBuilder,
    private dtOrderFactService : Dt_OrdenFacturacionService,
    private msg : MensajesAplicacionService,
    private orden_FacturacionComponent : Orden_FacturacionComponent,
    private devolucion_OrdenFacturacionComponent : Devolucion_OrdenFacturacionComponent,
    private dtDevolutionsService : DetallesDevolucionesProductosService,) {

    this.modoSeleccionado = this.appComponent.temaSeleccionado;
    this.formFilters = this.frmBuilder.group({
      orderFact : [null, Validators.required],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
  }

  lecturaStorage(){
    this.storage_Id = this.appComponent.storage_Id;
    this.storage_Nombre = this.appComponent.storage_Nombre;
    this.ValidarRol = this.appComponent.storage_Rol;
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
    this.clearFields();
    this.dtOrderFactService.GetOrders(startDate, endDate, route).subscribe(data => {
      data.forEach(dataOrder => this.serchedData.push(dataOrder));
    }, error => {
      this.load = false;
      this.msg.mensajeError(`¡No se encontró información de ordenes realizadas con los parametros consultados!`, `Error: ${error.error.title} | Status: ${error.status}`);
    });
    this.searchDataDevolutions(startDate, endDate, route);
    // this.searchSendOrders(startDate, endDate, route);
  }

  searchDataDevolutions(startDate: any, endDate: any, route: string){
    this.dtDevolutionsService.GetDevolutions(startDate, endDate, route).subscribe(data => {
      data.forEach(dataDevolution => this.serchedData.push(dataDevolution));
    }, () => this.load = false);
  }

  searchSendOrders(startDate: any, endDate: any, route: string){
    this.dtOrderFactService.GetSendOrders(startDate, endDate, route).subscribe(data => {
      data.forEach(dataOrder => this.serchedData.push(dataOrder));
    }, error => {
      this.load = false;
      this.msg.mensajeError(`¡No se encontró información de ordenes enviadas con los parametros consultados!`, `Error: ${error.error.title} | Status: ${error.status}`);
    });
  }

  createPDF(id : number, fact: string, type : string){
    this.load = true;
    if (type == 'Orden') this.orden_FacturacionComponent.createPDF(id, fact);
    else if (type == 'Devolucion') this.devolucion_OrdenFacturacionComponent.createPDF(id, fact);
    setTimeout(() => this.load = false, 3000);
  }

}