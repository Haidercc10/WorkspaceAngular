import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { ExistenciasProductosService } from 'src/app/Servicios/ExistenciasProductos/existencias-productos.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { CreacionExcelService } from 'src/app/Servicios/CreacionExcel/CreacionExcel.service';
import moment from 'moment';
import { ReposicionesComponent } from '../Reposiciones/Reposiciones.component';
import { DevolucionesProductosService } from 'src/app/Servicios/DevolucionesRollosFacturados/DevolucionesProductos.service';


@Component({
  selector: 'app-Movimientos-OrdenFacturacion',
  templateUrl: './Movimientos-OrdenFacturacion.component.html',
  styleUrls: ['./Movimientos-OrdenFacturacion.component.css']
})

export class MovimientosOrdenFacturacionComponent implements OnInit {

  formFilters !: FormGroup;
  formEndDevolutions !: FormGroup;
  load: boolean = false;
  modoSeleccionado: boolean;
  validateRole: number;
  storage_Id : number;
  storage_Nombre : any;
  serchedData: any[] = [];
  @ViewChild('dt') dt: Table;
  states: Array<string> = ['PENDIENTE','DESPACHADO', ];
  anulledOrder: number | undefined;
  ofDirect : boolean = false;
  detailsOF : number = 0;
  modalReposition : boolean = false;
  modalDevolution : boolean = false;
  //@ViewChild(Gestion_DevolucionesOFComponent) managementDevolutions : Gestion_DevolucionesOFComponent;
  //@ViewChild(ReposicionesComponent) Repositions : ReposicionesComponent;
 
  clients: any[] = [];
  sales: any[] = [];
  typesMovements: any = ['OF', 'DV'];
  modalEndOrders : boolean = false;
  
  constructor(private appComponent : AppComponent,
    private frmBuilder : FormBuilder,
    private dtOrderFactService : Dt_OrdenFacturacionService,
    private msg : MensajesAplicacionService,
    
    private dtDevolutionsService : DetallesDevolucionesProductosService,
    private orderFactService: OrdenFacturacionService,
    private messageService: MessageService,
    private productionProcessService : Produccion_ProcesosService,
    //private cmpOrdFact : OrdenFacturacion_PalletsComponent, 
    private svExistProduct : ExistenciasProductosService,
    private svZeusInv : InventarioZeusService,
    private svUsuarios : UsuarioService, 
    private svExcel : CreacionExcelService,
    private svDevolutions : DevolucionesProductosService,
    private cmpOrden_Facturacion : Orden_FacturacionComponent, 
    private cmpDevolutions : Devolucion_OrdenFacturacionComponent,
  ) {

    this.modoSeleccionado = this.appComponent.temaSeleccionado;
    this.formFilters = this.frmBuilder.group({
      orderFact : [null, Validators.required],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      clientId: [null,],
      client: [null,],
      salesId: [null,],
      sales: [null,],
      typeMov: [null, Validators.required],
    });

    this.loadFormEndDevolution();
  }

  ngOnInit() {
    this.readStorage();
    this.consultarVendedores();
    this.loadRankDates();
  }

  loadFormEndDevolution(){
    this.formEndDevolutions = this.frmBuilder.group({
      dv : [null, Validators.required],
      observationFinal: [null, Validators.required],
    });
  }

  //Función para cargar fechas en el rango.
  loadRankDates(){
    let initialDate = new Date(moment().subtract(30, 'days').format('YYYY-MM-DD'));
    this.formFilters.patchValue({ 'startDate' : initialDate, 'endDate' : new Date(), 'typeMov' : 'OF' });
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
    this.anulledOrder = null;
    this.ofDirect = false;
    this.detailsOF = 0;
    this.loadRankDates();
  }

  searchData(){
    let startDate : any = moment(this.formFilters.value.startDate).format('YYYY-MM-DD'); 
    let endDate : any = moment(this.formFilters.value.endDate).format('YYYY-MM-DD'); 
    let typeMov : any = this.formFilters.value.typeMov;

    this.serchedData = [];
    this.dt.clear();
    
    if (typeMov == 'OF') this.searchDataOrders(startDate, endDate, this.validateUrl());
    else if (typeMov == 'DV') this.searchDataDevolutions(startDate, endDate, this.validateUrl());
    else this.msg.mensajeAdvertencia(`¡Debe seleccionar un tipo de movimiento!`);
  }

  searchDataOrders(startDate: any, endDate: any, route: string){
    this.load = true;
    this.dtOrderFactService.GetOrders(startDate, endDate, route).subscribe(data => {
      if(![5,83].includes(this.validateRole)) data.forEach(dataOrder => this.serchedData.push(dataOrder));
      this.serchedData.forEach(x => {
        let date1 = moment(x.fechaHora).format('YYYY-MM-DD');
        let date2 = x.fechaDespacho == null ? moment().format('YYYY-MM-DD') : moment(x.fechaDespacho).format('YYYY-MM-DD');
        let initialDate = moment([moment(date1).year(), moment(date1).month() + 1, moment(date1).date()]); 
        let dateTerm = moment([moment(date2).year(), moment(date2).month() + 1, moment(date2).date()]); 
        x.dias = dateTerm.diff(initialDate, 'days'); 
      });
      setTimeout(() => {
        this.serchedData.sort((a, b) => Number(b.dias) - Number(a.dias));
        this.serchedData.sort((a, b) => b.estado.localeCompare(a.estado));
      }, 500);
      this.load = false;
      }, error => {
        this.load = false;
        this.msg.mensajeError(`¡No se encontraron ordenes con los parametros consultados!`, `Error: ${error.error.title} | Status: ${error.status}`);
      });
  }

  searchDataDevolutions(startDate: any, endDate: any, route: string){
    this.load = true;
    this.dtDevolutionsService.GetDevolutions(startDate, endDate, route).subscribe(data => {
      data.forEach(dataDevolution => this.serchedData.push(dataDevolution));
      this.serchedData.forEach(x => {
        let date1 = moment(x.fechaHora).format('YYYY-MM-DD');
        let date2 = x.fechaDespacho == " " ? moment().format('YYYY-MM-DD') : moment(x.fechaDespacho).format('YYYY-MM-DD');
        let initialDate = moment([moment(date1).year(), moment(date1).month() + 1, moment(date1).date()]); 
        let dateTerm = moment([moment(date2).year(), moment(date2).month() + 1, moment(date2).date()]); 
        x.dias = dateTerm.diff(initialDate, 'days'); 
      });
      setTimeout(() => { this.serchedData.sort((a, b) => b.estado.localeCompare(a.estado)); }, 500);
      this.load = false;
    }, error => {
      this.load = false;
      this.msg.mensajeError(`¡No se encontraron devoluciones con los parametros consultados!`, `Error: ${error.error.title} | Status: ${error.status}`);
    });
  }

  ///Generar
  createPDF(id : number, fact: string, type : string, ofDirect : boolean){
    this.load = true;
    if (type == 'OF') {
      //this.dtOrderFactService.GetInformacionOrderFact(id).subscribe(data => {
        //let pallet : boolean = data.some(x => x.dtOrder.pallet_Id != null);
        //console.log(pallet, ofDirect);
        /*!pallet ?*/ ofDirect ? this.cmpOrden_Facturacion.createPDFFactDirect(id, fact) : this.cmpOrden_Facturacion.createPDF(id, fact) /*: this.cmpOrdFact.createPDF(id, fact)*/;
      //}, error => {
        //this.msg.mensajeError(`Error`, `Error al consultar la OF N° ${id} | ${error.status} ${error.statusText}`);
      //});
    } else if (type == 'DV') this.cmpDevolutions.createPDF(id, 'exportada');
    setTimeout(() => this.load = false, 3000);
  }

  ///Mensaje de confirmación de la orden a anular. 
  confirmSendData(data : any) {
    this.anulledOrder = data.or.id;
    this.ofDirect = data.or.of_Directa;
    this.detailsOF = data.of;
    
    this.messageService.add({
      severity: 'warn',
      key: 'confirmation',
      summary: 'Confirmación',
      detail: `Se anulará la orden #${this.anulledOrder}, los rollos de está orden estarán nuevamente disponibles y la orden no se podrá despachar. ¿Desea continuar?`,
      sticky: true
    });
  }

  onReject = () => this.messageService.clear('confirmation');

  errorMessage(message: string, error: HttpErrorResponse) {
    this.load = false;
    this.msg.mensajeError(message, `Error: ${error.statusText} | Status: ${error.status}`);
  }

  ///Función para colocar en estado anulado la orden que se seleccione. 
  PutStatusOrderAnulled() {
    this.onReject();
    this.load = true;
    
    this.orderFactService.PutStatusOrderAnulled(this.anulledOrder).subscribe(() => {
      if(this.ofDirect) {
        if(this.detailsOF == 0) {
          this.updateStockProducts(true);
        } else if (this.detailsOF > 0) {
          this.updateStockProducts(true);
          this.PutStatusDetailsOrder(false);
        } 
      } else if(!this.ofDirect) {
        this.PutStatusDetailsOrder(false);
      } 
    }, error => this.errorMessage(`¡Ocurrió un error al intentar anular la orden N° ${this.anulledOrder}!`, error));
  }

  ///Función para actualizar el estado de los rollos a disponibles.
  PutStatusDetailsOrder(viewMsj : boolean){
    this.productionProcessService.putStateAvaible(this.anulledOrder).subscribe(() => {
      viewMsj ? this.msg.mensajeConfirmacion(`¡Orden de facturación anulada con éxito!`) : null;
      this.load = false;
    }, error => {
      this.errorMessage(`¡Ocurrió un error al colocar en disponible los rollos de la orden N° ${this.anulledOrder}!`, error);
      this.load = false;
    }); 
  }

  ///Actualizar stock de productos luego de anular una orden directa.
  updateStockProducts(viewMsj : boolean){
    this.svExistProduct.putStockThenAnullation(this.anulledOrder).subscribe(data => {
      viewMsj ? this.msg.mensajeConfirmacion(`¡Orden de facturación N° ${this.anulledOrder} anulada exitosamente!`) : null;
      this.load = false;
    }, error => {
      this.errorMessage(`¡Error al intentar devolver al stock los productos facturados de la orden N° ${this.anulledOrder}!`, error);
      this.load = false;
    });
  }

  ///
  loadModalOrderFact(data : any){
    if(data.type == 'DV' && data.or.reposicion && data.or.estado_Id == 38) {
      if([6,1].includes(this.validateRole)) {
        //this.Repositions.clearAll();
        this.modalReposition = true; 
        //this.Repositions.loadClientReposition(data);
       // this.Repositions.repositionForDv = true;
      } else this.msg.mensajeAdvertencia(`No cuenta con permisos suficientes para realizar ordenes de facturación.`);
    } else if(data.type == 'DV' && data.or.reposicion && [39, 54].includes(data.or.estado_Id)) {
      this.modalEndOrders = true;
      this.formEndDevolutions.patchValue({ dv : data.or.id });
    } else if(data.type == 'DV' && [11,29].includes(data.or.estado_Id)) {
      if([5,1].includes(this.validateRole)) {
        //this.managementDevolutions.clearFields();
        //this.managementDevolutions.devolution = true;
        this.modalDevolution = true;
        //this.managementDevolutions.form.patchValue({ dev : data.or.id, }); 
        //this.managementDevolutions.searchData();
      } else this.msg.mensajeAdvertencia(`No cuenta con permisos suficientes para gestionar devoluciones.`);
    } else this.msg.mensajeAdvertencia(`La devolución N° ${data.or.id} no está disponible para reposición y/o revisión!`);
  }

  //Limpiar campos del formulario de cierre de devoluciones
  clearFieldsDV(){
    this.formEndDevolutions.patchValue({
      'observationFinal' : null,
    });
  }

  //Función para cerrar la devolución.
  endDevolution(){
    let dv : number = this.formEndDevolutions.value.dv;
    let observation : string = this.formEndDevolutions.value.observationFinal;
    let date : any = moment().format('YYYY-MM-DD');
    let hour : string = moment().format('HH:mm:ss');
    this.load = true;

    this.svDevolutions.PutStatusDevolution(dv, 18, date, hour, this.storage_Id, true, false, `?observation=${observation}`).subscribe(data => {
      this.cmpDevolutions.createPDF(dv, 'cerrada');
      this.modalDevolution = false;
      this.formEndDevolutions.reset();
      this.load = false;
    }, error => {
      this.msg.mensajeError('Error', `No fue posible actualizar el estado de la devolución N° ${dv}!`);
      this.load = false;
    });  
  }

  msjDevolutions(data){
    return `${data.type == 'DV' && ![18,39].includes(data.or.estado_Id) ? 'Haz doble clic para continuar gestionando la devolución' : [18,39].includes(data.or.estado_Id) ? `La devolucion N° ${data.or.id} será repuesta en la orden N° ${data.of}` : ''}`
  }

  searchClients() {
    let idClient = this.formFilters.value.clientId;
    this.svZeusInv.getClientByIdThird(idClient).subscribe(data => {
      data.forEach(cli => { this.formFilters.patchValue({ 'clientId': cli.idcliente, 'client': cli.razoncial, }); });
    }, error => this.errorMessage(`¡No se encontró información del cliente consultado!`, error));
  }

  searchClientsByName() {
    let name = this.formFilters.value.client;
    this.svZeusInv.getClientByName(name).subscribe(data => this.clients = data);
  }

  selectClient() {
    let client = this.clients.find(x => x.idcliente == this.formFilters.value.client);
    this.formFilters.patchValue({ 'clientId': client.idcliente, 'client': client.razoncial, });
  }

  consultarVendedores = () =>  this.svUsuarios.GetVendedores().subscribe(data => { this.sales = data; });

  // Funcion que va a colocar a llenar los campos correspondientes del vendedor
  llenarVendedor(){
    let nombre = this.formFilters.value.sales;
    let vendedor = this.sales.find(x => x.usua_Nombre == nombre);
    let Id_Vendedor : string = `${vendedor.usua_Id}`;
    if (Id_Vendedor.length == 1) Id_Vendedor = `00${Id_Vendedor}`;
    else if (Id_Vendedor.length == 2) Id_Vendedor = `0${Id_Vendedor}`;
    this.formFilters.patchValue({
      sales: vendedor.usua_Nombre,
      salesId : Id_Vendedor,
    });
  }

   validateUrl(){
    let order: any = this.formFilters.value.orderFact;
    let clientId: any = this.formFilters.value.clientId;
    let salesId : any = this.formFilters.value.salesId;
    let url : string = ``;

    if(order != null) url += `order=${order}`;
    if(clientId != null) url.length > 0 ? url += `&clientId=${clientId}` : url += `clientId=${clientId}`;
    if(salesId != null) url.length > 0 ? url += `&salesId=${salesId}` : url += `salesId=${salesId}`;

    if(url.length > 0) url = `?${url}`;
    return url;
  }

   //Función que exportará un formato excel con los datos de los clientes
  exportExcel(){
    if(this.serchedData.length > 0) {
      setTimeout(() => { this.loadSheetAndStyles(this.serchedData); }, 500);
    } else this.msg.mensajeAdvertencia(`Advertencia`, `No hay datos para exportar.`);
  }

  //Función que cargará la hoja y los estilos. 
  loadSheetAndStyles(data : any){  
    let typeMov : string = this.formFilters.value.typeMov;
    let title : any = `Movimientos de `;  
    title += typeMov == 'OF' ? `Facturación` : `Devoluciones`
    title += ` ${moment().format('DD-MM-YYYY')}`;
    let fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } };
    let border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }, };
    let font = { name: 'Calibri', family: 4, size: 11, bold: true };
    let alignment = { vertical: 'middle', horizontal: 'center', wrapText: true};
    let workbook = this.svExcel.formatoExcel(title, true);

    this.addNewSheet(workbook, title, fill, border, font, alignment, data);
    this.svExcel.creacionExcel(title, workbook);
  }

  //Función para agregar una nueva hoja de calculo.
  addNewSheet(wb : any, title : any, fill : any, border : any, font : any, alignment : any, data : any){
    let fontTitle = { name: 'Calibri', family: 4, size: 15, bold: true };
    let worksheet : any = wb.worksheets[0];
    this.loadStyleTitle(worksheet, title, fontTitle, alignment);
    this.loadHeader(worksheet, fill, border, font, alignment);
    this.loadInfoExcel(worksheet, this.dataExcel(data), border,  alignment);
  }

  //Cargar estilos del titulo de la hoja.
  loadStyleTitle(ws: any, title : any, fontTitle : any, alignment : any){
    ws.getCell('A1').alignment = alignment;
    ws.getCell('A1').font = fontTitle;
    ws.getCell('A1').value = title;
  }

  //Función para cargar los titulos de el header y los estilos.
  loadHeader(ws : any, fill : any, border : any, font : any, alignment : any){
    let rowHeader : any = ['A5','B5','C5','D5','E5','F5','G5','H5','I5','J5']; 
    //ws.addRow([]);
    ws.addRow(this.loadFieldsHeader());
    
    rowHeader.forEach(x => ws.getCell(x).fill = fill);
    rowHeader.forEach(x => ws.getCell(x).alignment = alignment);
    rowHeader.forEach(x => ws.getCell(x).border = border);
    rowHeader.forEach(x => ws.getCell(x).font = font);
    ws.mergeCells('A1:J3');

    this.loadSizeHeader(ws);
  }

  //Función para cargar el tamaño y el alto de las columnas del header.
  loadSizeHeader(ws : any){
    [5].forEach(x => ws.getColumn(x).width = 50);
    [6].forEach(x => ws.getColumn(x).width = 40);
    [1].forEach(x => ws.getColumn(x).width = 5);
    [3].forEach(x => ws.getColumn(x).width = 10);
    [2,4,9,10].forEach(x => ws.getColumn(x).width = 15);
    [7,8].forEach(x => ws.getColumn(x).width = 20);
  }

 //Función para cargar los nombres de las columnas del header
  loadFieldsHeader(){
    let headerRow = [
      'N°',
      'Documento',
      'OF Directa',
      'Factura', 
      'Cliente',
      'Asesor', 
      'Fecha Creación',
      'Fecha Cierre',
      'Dias Pendiente',
      'Estado', 
    ];
    return headerRow;
  }

  //Cargar información con los estilos al formato excel. 
  loadInfoExcel(ws : any, data : any, border : any, alignment : any){
    let contador : any = 6;
    let row : any = ['A','B','C','D','E','F','G','H','I','J']; 
    
    data.forEach(x => {
      ws.addRow(x);
      row.forEach(r => {
        ws.getCell(`${r}${contador}`).border = border;
        ws.getCell(`${r}${contador}`).font = { name: 'Calibri', family: 4, size: 10 };
        ws.getCell(`${r}${contador}`).alignment = alignment;
      });
      contador++
    }); 
  }

  //.Función que contendrá la info al documento excel. 
  dataExcel(data : any){
    let info : any = [];
    let count : number = 0;
    data.forEach(x => {
      info.push([
        count += 1,
        x.or.id,
        x.or.of_Directa ? 'Sí' : 'No',
        x.or.factura,
        x.clientes.cli_Nombre,
        x.asesor,
        x.fechaHora,
        x.fechaDespacho,
        x.dias,
        x.estado,
      ]);
    });
    return info;
  }
}