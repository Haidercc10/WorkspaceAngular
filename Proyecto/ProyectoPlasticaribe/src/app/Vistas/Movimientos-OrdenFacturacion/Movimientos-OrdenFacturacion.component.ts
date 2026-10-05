import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Dt_OrdenFacturacionService } from 'src/app/Servicios/Dt_OrdenFacturacion/Dt_OrdenFacturacion.service';
import { FacturacionProductosService } from 'src/app/Servicios/Facturacion_Productos/facturacion-productos.service';
import { AppComponent } from 'src/app/app.component';
import { Orden_FacturacionComponent } from '../Orden_Facturacion/Orden_Facturacion.component';
import { Devolucion_OrdenFacturacionComponent } from '../Devolucion_OrdenFacturacion/Devolucion_OrdenFacturacion.component';
import { DetallesDevolucionesProductosService } from 'src/app/Servicios/DetallesDevolucionRollosFacturados/DetallesDevolucionesProductos.service';
import { Table } from 'primeng/table';
import { OrdenFacturacionService } from 'src/app/Servicios/OrdenFacturacion/OrdenFacturacion.service';
import { MessageService } from 'primeng/api';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { Gestion_DevolucionesOFComponent } from '../Gestion_DevolucionesOF/Gestion_DevolucionesOF.component';
import { ExistenciasProductosService } from 'src/app/Servicios/ExistenciasProductos/existencias-productos.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { CreacionExcelService } from 'src/app/Servicios/CreacionExcel/CreacionExcel.service';
import moment from 'moment';
import { ReposicionesComponent } from '../Reposiciones/Reposiciones.component';
import { DevolucionesProductosService } from 'src/app/Servicios/DevolucionesRollosFacturados/DevolucionesProductos.service';
import { finalize } from 'rxjs';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { UtileriaService } from 'src/app/Servicios/Utileria/utileria.service';

@Component({
  selector: 'app-Movimientos-OrdenFacturacion',
  templateUrl: './Movimientos-OrdenFacturacion.component.html',
  styleUrls: ['./Movimientos-OrdenFacturacion.component.css']
})

@Injectable({
  providedIn: 'root'
})

export class MovimientosOrdenFacturacionComponent implements OnInit {

  formFilters !: FormGroup;
  formEndDevolutions !: FormGroup;
  load: boolean = false;
  modoSeleccionado: boolean;
  validateRole: number = 0;
  storage_Id: number = 0;
  storage_Nombre: any;
  serchedData: any[] = [];
  @ViewChild('dt') dt: Table | undefined;
  states: Array<string> = ['PENDIENTE', 'DESPACHADO',];
  anulledOrder: any | undefined;
  ofDirect: boolean = false;
  detailsOF: number = 0;
  modalReposition: boolean = false;
  modalDevolution: boolean = false;
  modalManagerDevolution: boolean = false;

  clients: any[] = [];
  sales: any[] = [];
  typesMovements: any = ['OF', 'DV'];
  modalEndOrders: boolean = false;
  registroSeleccionado: any = null;

  constructor(private appComponent: AppComponent,
    private frmBuilder: FormBuilder,
    private dtOrderFactService: Dt_OrdenFacturacionService,
    private svFactProducts: FacturacionProductosService,
    private dtDevolutionsService: DetallesDevolucionesProductosService,
    private orderFactService: OrdenFacturacionService,
    private messageService: MessageService,
    private productionProcessService: Produccion_ProcesosService,
    private svExistProduct: ExistenciasProductosService,
    private svZeusInv: InventarioZeusService,
    private svUsuarios: UsuarioService,
    private svExcel: CreacionExcelService,
    private svDevolutions: DevolucionesProductosService,
    private cmpOrden_Facturacion: Orden_FacturacionComponent,
    private cmpDevolutions: Devolucion_OrdenFacturacionComponent,
    private managementDevolutions: Gestion_DevolucionesOFComponent,
    private Repositions: ReposicionesComponent,
    private PDFService: CreacionPdfService,
    private bagproService: BagproService,
    private util: UtileriaService
  ) {

    this.modoSeleccionado = this.appComponent.temaSeleccionado;
    this.formFilters = this.frmBuilder.group({
      orderFact: [null, Validators.required],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      clientId: [null,],
      client: [null,],
      sales: [null,],
      typeMov: [null, Validators.required],
    });

    this.loadFormEndDevolution();
  }

  ngOnInit() {
    this.readStorage();
    this.getSales();
    this.loadRankDates();
  }

  loadFormEndDevolution() {
    this.formEndDevolutions = this.frmBuilder.group({
      dv: [null, Validators.required],
      nc: [null,],
      reposition: [null,],
      observationFinal: [null, Validators.required],
    });
  }

  //Función para cargar fechas en el rango.
  loadRankDates() {
    let initialDate = new Date(moment().subtract(30, 'days').format('YYYY-MM-DD'));
    this.formFilters.patchValue({ 'startDate': initialDate, 'endDate': new Date(), 'typeMov': 'OF' });
  }

  readStorage() {
    this.storage_Id = this.appComponent.storage_Id;
    this.storage_Nombre = this.appComponent.storage_Nombre;
    this.validateRole = this.appComponent.storage_Rol;
  }

  clearFields() {
    this.load = false;
    this.serchedData = [];
    this.formFilters.reset();
    this.dt?.clear();
    this.anulledOrder = undefined;
    this.ofDirect = false;
    this.detailsOF = 0;
    this.loadRankDates();
    this.getSales();
  }

  getSales() {
    let asesor: any = this.validateRole == 2 ? this.appComponent.storage_Id : null;
    this.svUsuarios.GetVendedores().subscribe(resp => {
      this.sales = resp,
        this.sales = asesor ? this.sales.filter(x => x.usua_Id == asesor) : this.sales
    });
  }

  searchData() {
    let startDate: any = moment(this.formFilters.value.startDate).format('YYYY-MM-DD');
    let endDate: any = moment(this.formFilters.value.endDate).format('YYYY-MM-DD');
    let typeMov: any = this.formFilters.value.typeMov;

    this.serchedData = [];
    this.dt?.clear();

    if (typeMov == 'OF') this.searchDataOrders(startDate, endDate, this.validateUrl());
    else if (typeMov == 'DV') this.searchDataDevolutions(startDate, endDate, this.validateUrl());
    else this.util.Notificacion(`Advertencia`,`¡Debe seleccionar un tipo de movimiento!`);
  }

  searchDataOrders(startDate: any, endDate: any, route: string) {
    this.load = true;

    this.dtOrderFactService.GetOrders(startDate, endDate, route)
      .pipe(finalize(() => this.load = false))
      .subscribe({
        next: data => {
          if (data.length == 0) return this.util.Notificacion(`Advertencia`,`¡No se encontraron órdenes de facturación con los parámetros consultados!`);
          const today = moment();
          this.serchedData = data;
          this.serchedData = this.serchedData.map(order => {

            const fechaInicio = moment(order.fechaHora);
            const fechaFin = order.fechaDespacho
              ? moment(order.fechaDespacho)
              : today;

            return {
              ...order,
              dias: fechaFin.diff(fechaInicio, 'days')
            };
          })
            .sort((a, b) => {
              // Primero ordenar por estado
              const estadoCompare = b.estado.localeCompare(a.estado);
              if (estadoCompare !== 0) return estadoCompare;

              // Luego por días
              return b.dias - a.dias;
            });
        },
        error: () => {
          this.util.Notificacion(`Error`, `¡No se encontraron órdenes con los parámetros consultados!`);
        }
      })
  }

  searchDataDevolutions(startDate: any, endDate: any, route: string) {
    this.load = true;
    this.dtDevolutionsService.GetDevolutions(startDate, endDate, route).pipe(finalize(() => this.load = false)).subscribe({
      next: data => {
        const today = moment();
        this.serchedData = data;
        this.serchedData = this.serchedData.map(x => {
          const fechaInicio = moment(x.fechaHora);
          const fechaFin = x.fechaDespacho == " "
            ? today
            : moment(x.fechaDespacho);

          return {
            ...x,
            dias: fechaFin.diff(fechaInicio, 'days')
          };
        })
      }, error: () => this.util.Notificacion(`Error`, `¡No se encontraron devoluciones con los parámetros consultados!`)});
  }

  ///Generar
  createPDF(id: number, fact: string, type: string, ofDirect: boolean) {
    // los cargandos se definen en los dos metodos de creacion de PDF
    if (type == 'OF') {
        // Si es orden directa, crea PDF orden directa, sino, crea el PDF para ordenes NO directas.
        // ofDirect ? this.cmpOrden_Facturacion.createPDFFactDirect(id, fact) : this.createNoDirectOF_PDF(id, fact);
        ofDirect ? this.createDirectOF_PDF(id, fact) : this.createNoDirectOF_PDF(id, fact);
    } else if (type == 'DV') this.cmpDevolutions.createPDF(id, 'exportada');
    setTimeout(() => {
      this.load = false;
    }, 3000);
  }

  createDirectOF_PDF(OF_Id: number, fact: string){
    this.load = true;
    this.svFactProducts.getInfoOfDirect(OF_Id).pipe(finalize(() => {
      this.load = false;
      this.util.Notificacion('Confirmación',`Se generó la OF N°: ${OF_Id}. En unos momentos se cargará el PDF en una nueva pestaña.`);
    })).subscribe(data => {
      let title: string = `Orden de Facturación N° ${OF_Id}`;
      title += `${fact.length > 0 ? ` \n Factura N° ${fact}` : ''}`;
      let content: any[] = this.PDFService.DirectOFContent_PDF(data);
      this.PDFService.formatoPDF(title, content);
    }, error => this.util.Notificacion('error', `Error al momento de generar el documento N° ${OF_Id} | ${error.status} ${error.statusText}`));
  }

  createNoDirectOF_PDF(OF_Id: number, fact: string){
    this.load = true;
    this.dtOrderFactService.GetInformacionOrderFactAsync(OF_Id).pipe(finalize(() => {
      this.load = false; 
      this.util.Notificacion('Confirmación',`Se generó la OF N°: ${OF_Id}. En unos momentos se cargará el PDF en una nueva pestaña.`);
    })).subscribe(data => {
      let saleOrder: string = `${data[0].dtOrder.consecutivo_Pedido}`;
      let title: string = saleOrder.startsWith('DV') ? `Orden de Reposición N° ${OF_Id}` : `Orden de Facturación N° ${OF_Id}`;
      title += `${fact.length > 0 ? ` \n Factura N° ${fact}` : ''}`;
      data = this.changeNameProductToPDF(data);
      let content: any[] = this.PDFService.NoDirectOFContent_PDF(data);
      this.PDFService.formatoPDF(title, content);
    }, error => this.util.Notificacion('error', `Error al momento de generar el documento N° ${OF_Id} | ${error.status} ${error.statusText}`));
  }

  changeNameProductToPDF(production: Array<any>) {
    let orderProduction = production.reduce((a, b) => {
      if (!a.map(x => x.orderProduction).includes(b.orderProduction)) a = [...a, b];return a;
    }, []);
    orderProduction.forEach(d => {
      this.bagproService.GetOrdenDeTrabajo(d.orderProduction, '').subscribe(dataOrder => {
        production.filter(x => x.orderProduction == d.orderProduction).forEach(prod => {
          prod.Referencia = dataOrder[0].producto;
        });
      });
    });
    return production;
  }

  ///Mensaje de confirmación de la orden a anular. 
  confirmSendData(data: any) {
    console.log(data);
    
    this.anulledOrder = data.or.id;
    this.ofDirect = data.or.of_Directa;
    this.detailsOF = data.of;

    console.log(this.anulledOrder, this.ofDirect, this.detailsOF);

    this.messageService.add({
      severity: 'warn',
      key: 'confirmation',
      summary: 'Confirmación',
      detail: `Se anulará la orden #${this.anulledOrder}, los rollos de está orden estarán nuevamente disponibles y la orden no se podrá despachar. ¿Desea continuar?`,
      sticky: true
    });
  }

  onReject = () => this.messageService.clear('confirmation');

  ///Función para colocar en estado anulado la orden que se seleccione. 
  PutStatusOrderAnulled() {
    this.onReject();
    this.load = true;

    this.orderFactService.PutStatusOrderAnulled(this.anulledOrder).subscribe(() => {
      if (this.ofDirect) {
        if (this.detailsOF == 0) {
          this.updateStockProducts(true);
        } else if (this.detailsOF > 0) {
          this.updateStockProducts(true);
          this.PutStatusDetailsOrder(false);
        }
      } else if (!this.ofDirect) {
        this.PutStatusDetailsOrder(false);
      }
    }, error => this.util.Notificacion(`Error`,`¡Ocurrió un error al intentar anular la orden N° ${this.anulledOrder}! | ${error.statusText} ${error.status}`));
  }

  ///Función para actualizar el estado de los rollos a disponibles.
  PutStatusDetailsOrder(viewMsj: boolean) {
    this.load = true;
    this.productionProcessService.putStateAvaible(this.anulledOrder).pipe(finalize(() => this.load = false)).subscribe(() => {
      viewMsj ? this.util.Notificacion(`Confirmación`, `¡Orden de facturación anulada con éxito!`) : null;
    }, error => this.util.Notificacion(`Error`, `¡Ocurrió un error al colocar en disponible los rollos de la orden N° ${this.anulledOrder}! ${error.statusText} ${error.status}`));
  }

  ///Actualizar stock de productos luego de anular una orden directa.
  updateStockProducts(viewMsj: boolean) {
    this.load = true;
    this.svExistProduct.putStockThenAnullation(this.anulledOrder).pipe(finalize(() => this.load = false)).subscribe(data => {
      viewMsj ? this.util.Notificacion(`Confirmación`, `¡Orden de facturación N° ${this.anulledOrder} anulada con éxito!`) : null;
    }, error => this.util.Notificacion(`Error`, `¡Error al intentar devolver al stock los productos facturados de la orden N° ${this.anulledOrder}! ${error.statusText} ${error.status}`));
  }

  loadModalOrderFact(data: any) {
    if (data.type == 'DV'){
      console.log(data);
      this.registroSeleccionado = data;
      if (data.or.reposicion && data.or.estado_Id == 38) {
        if ([1, 10, 97].includes(this.validateRole)) {
          this.Repositions.clearAll();
          this.modalReposition = true;
          this.Repositions.loadClientReposition(data);
          this.Repositions.repositionForDv = true;
        } else this.util.Notificacion(`Advertencia`,`No cuenta con permisos suficientes para realizar ordenes de facturación.`);
      } else if ([39, 54].includes(data.or.estado_Id)) {
        this.modalEndOrders = true;
        this.formEndDevolutions.patchValue({
          'dv': data.or.id,
          'nc': data.or.nc,
          'reposition': data.or.reposicion,
        });
      } else if ([11, 29].includes(data.or.estado_Id)) {
        if ([5, 1].includes(this.validateRole)) {
          this.managementDevolutions.clearFields();
          this.managementDevolutions.devolution = true;
          this.modalManagerDevolution = true;
        } else this.util.Notificacion(`Advertencia`,`No cuenta con permisos suficientes para gestionar devoluciones.`);
      } else if ([53].includes(data.or.estado_Id)) {
        this.modalDevolution = true;
      } else this.util.Notificacion(`Advertencia`,`La devolución N° ${data.or.id} no está disponible para reposición y/o revisión!`);
    }
  }

  //Limpiar campos del formulario de cierre de devoluciones
  clearFieldsDV() {
    this.formEndDevolutions.patchValue({
      'dv': null,
      'nc': null,
      'reposition': null,
      'observationFinal': null,
    });
  }

  //Función para cerrar la devolución.
  endDevolution() {
    this.load = true;
    let dv: number = this.formEndDevolutions.value.dv;
    let observation: string = this.formEndDevolutions.value.observationFinal;
    let reposition: boolean = this.formEndDevolutions.value.reposition;
    let nc : boolean = this.formEndDevolutions.value.nc;
    let date: any = moment().format('YYYY-MM-DD');
    let hour: string = moment().format('HH:mm:ss');
    this.load = true;

    this.svDevolutions.PutStatusDevolution(dv, 18, date, hour, this.storage_Id, reposition, nc, `?observation=${observation}`).pipe(finalize(() => this.load = false)).subscribe(data => {
      this.cmpDevolutions.createPDF(dv, 'cerrada');
      this.modalDevolution = false;
      this.formEndDevolutions.reset();
    }, error => this.util.Notificacion('Error', `No fue posible actualizar el estado de la devolución N° ${dv}! ${error.statusText} ${error.status}`));
  }

  msjDevolutions(data) {
    return `${data.type == 'DV' && ![18, 39].includes(data.or.estado_Id) ? 'Haz doble clic para continuar gestionando la devolución' : [18, 39].includes(data.or.estado_Id) ? `La devolucion N° ${data.or.id} será repuesta en la orden N° ${data.of}` : ''}`
  }

  searchClients() {
    let idClient = this.formFilters.value.clientId;
    this.svZeusInv.getClientByIdThird(idClient).subscribe(data => {
      data.forEach(cli => { this.formFilters.patchValue({ 'clientId': cli.idcliente, 'client': cli.razoncial, }); });
    }, error => this.util.Notificacion(`Error`,`¡No se encontró información del cliente consultado! ${error.statusText} ${error.status}`));
  }

  //Función para buscar clientes por nombre.
  searchClientsByName() {
    let name = this.formFilters.value.client;
    this.svZeusInv.getClientByName(name).subscribe(data => this.clients = data);
  }

  //Funcion que va a colocar el id del cliente seleccionado
  selectClient() {
    let client = this.clients.find(x => x.idcliente == this.formFilters.value.client);
    this.formFilters.patchValue({ 'clientId': client.idcliente, 'client': client.razoncial, });
  }

  // Funcion que va a colocar a llenar los campos correspondientes del vendedor
  llenarVendedor() {
    let nombre = this.formFilters.value.sales;
    let vendedor = this.sales.find(x => x.usua_Nombre == nombre);
    let Id_Vendedor: string = `${vendedor.usua_Id}`;
    if (Id_Vendedor.length == 1) Id_Vendedor = `00${Id_Vendedor}`;
    else if (Id_Vendedor.length == 2) Id_Vendedor = `0${Id_Vendedor}`;
    this.formFilters.patchValue({
      sales: vendedor.usua_Nombre,
      salesId: Id_Vendedor,
    });
  }

  validateUrl() {
    let order: any = this.formFilters.value.orderFact;
    let clientId: any = this.formFilters.value.clientId;
    let salesId: any = this.formFilters.value.sales;
    let url: string = ``;

    if (order != null) url += `order=${order}`;
    if (clientId != null) url.length > 0 ? url += `&clientId=${clientId}` : url += `clientId=${clientId}`;
    if (salesId != null) url.length > 0 ? url += `&salesId=${salesId}` : url += `salesId=${salesId}`;

    if (url.length > 0) url = `?${url}`;
    return url;
  }

  //Función que exportará un formato excel con los datos de los clientes
  exportExcel() {
    this.load = true;
    if (this.serchedData.length > 0) {
      setTimeout(() => { 
        this.loadSheetAndStyles(this.serchedData);
        this.load = false;
       }, 500);
    } else this.util.Notificacion(`Advertencia`, `No hay datos para exportar.`);
  }

  //Función que cargará la hoja y los estilos. 
  loadSheetAndStyles(data: any) {
    let typeMov: string = this.formFilters.value.typeMov;
    let title: any = `Movimientos de `;
    title += typeMov == 'OF' ? `Facturación` : `Devoluciones`
    title += ` ${moment().format('DD-MM-YYYY')}`;
    let fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } };
    let border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }, };
    let font = { name: 'Calibri', family: 4, size: 11, bold: true };
    let alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    let workbook = this.svExcel.formatoExcel(title, true);

    this.addNewSheet(workbook, title, fill, border, font, alignment, data);
    this.svExcel.creacionExcel(title, workbook);
  }

  //Función para agregar una nueva hoja de calculo.
  addNewSheet(wb: any, title: any, fill: any, border: any, font: any, alignment: any, data: any) {
    let fontTitle = { name: 'Calibri', family: 4, size: 15, bold: true };
    let worksheet: any = wb.worksheets[0];
    this.loadStyleTitle(worksheet, title, fontTitle, alignment);
    this.loadHeader(worksheet, fill, border, font, alignment);
    this.loadInfoExcel(worksheet, this.dataExcel(data), border, alignment);
  }

  //Cargar estilos del titulo de la hoja.
  loadStyleTitle(ws: any, title: any, fontTitle: any, alignment: any) {
    ws.getCell('A1').alignment = alignment;
    ws.getCell('A1').font = fontTitle;
    ws.getCell('A1').value = title;
  }

  //Función para cargar los titulos de el header y los estilos.
  loadHeader(ws: any, fill: any, border: any, font: any, alignment: any) {
    let rowHeader: any = ['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5', 'I5', 'J5'];
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
  loadSizeHeader(ws: any) {
    [5].forEach(x => ws.getColumn(x).width = 50);
    [6].forEach(x => ws.getColumn(x).width = 40);
    [1].forEach(x => ws.getColumn(x).width = 5);
    [3].forEach(x => ws.getColumn(x).width = 10);
    [2, 4, 9, 10].forEach(x => ws.getColumn(x).width = 15);
    [7, 8].forEach(x => ws.getColumn(x).width = 20);
  }

  //Función para cargar los nombres de las columnas del header
  loadFieldsHeader() {
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
  loadInfoExcel(ws: any, data: any, border: any, alignment: any) {
    let contador: any = 6;
    let row: any = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

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
  dataExcel(data: any) {
    let info: any = [];
    let count: number = 0;
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