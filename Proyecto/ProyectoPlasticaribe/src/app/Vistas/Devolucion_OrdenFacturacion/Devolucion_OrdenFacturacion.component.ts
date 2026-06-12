import { HttpErrorResponse } from '@angular/common/http';
import { Component, Injectable, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { modelDevolucionProductos } from 'src/app/Modelo/modelDevolucionProductos';
import { modelDtProductoDevuelto } from 'src/app/Modelo/modelDtProductoDevuelto';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { DetallesDevolucionesProductosService } from 'src/app/Servicios/DetallesDevolucionRollosFacturados/DetallesDevolucionesProductos.service';
import { DevolucionesProductosService } from 'src/app/Servicios/DevolucionesRollosFacturados/DevolucionesProductos.service';
import { Dt_OrdenFacturacionService } from 'src/app/Servicios/Dt_OrdenFacturacion/Dt_OrdenFacturacion.service';
import { FallasTecnicasService } from 'src/app/Servicios/FallasTecnicas/FallasTecnicas.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { AppComponent } from 'src/app/app.component';
import { tap } from 'rxjs/internal/operators/tap';
import { catchError } from 'rxjs/internal/operators/catchError';
import { finalize, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-Devolucion_OrdenFacturacion',
  templateUrl: './Devolucion_OrdenFacturacion.component.html',
  styleUrls: ['./Devolucion_OrdenFacturacion.component.css']
})

export class Devolucion_OrdenFacturacionComponent implements OnInit, OnChanges {

  storage_Id: number = 0;
  ValidarRol: number = 0;
  load: boolean = false;
  modoSeleccionado: boolean = false;
  formDataOrder: FormGroup;
  production: Array<production> = [];
  productionSelected: Array<production> = [];
  consolidatedProduction: Array<production> = [];
  fails: Array<any> = [];
  modalFails: boolean = false;
  reposition: boolean = false;
  fieldFocus: boolean = false;
  rollsScanned: any[] = [];
  form: FormGroup;
  products: any[] = [];
  isDevolution: boolean = false;
  modalDevolution: boolean = false;

  @ViewChild('tableOrder') tableOrder: Table | undefined;
  @ViewChild('tableDevolution') tableDevolution: Table | undefined;
  @ViewChild('tableConsolidate') tableConsolidate: Table | undefined;
  @Input() data: any;

  constructor(private appComponent: AppComponent,
    private frmBuilder: FormBuilder,
    private msg: MensajesAplicacionService,
    private dtOrderFactService: Dt_OrdenFacturacionService,
    private createPDFService: CreacionPdfService,
    private devService: DevolucionesProductosService,
    private dtDevService: DetallesDevolucionesProductosService,
    private svFails: FallasTecnicasService,
    private svProduction: Produccion_ProcesosService,) {

    this.modoSeleccionado = appComponent.temaSeleccionado;

    this.formDataOrder = this.frmBuilder.group({
      dv: [null,],
      order: [null,],
      fact: [null, Validators.required],
      idClient: [null, Validators.required],
      client: [null, Validators.required],
      reason: [null, Validators.required],
      //reposition : [false, Validators.required],
      //creditNote : [false, Validators.required ],
      roll: [null],
      observation: ['', Validators.required],
      salesId: [null],
      sales: [null],
      contact: [null, Validators.required],
      observationIn: [null,],
    });

    this.form = this.frmBuilder.group({
      roll: [null, Validators.required],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.getFails();
  }

  //Función que se ejecuta cuando cambian las propiedades de entrada
  ngOnChanges() {
    if (this.data) {
      setTimeout(() => {
        this.loadDevolution()
        this.searchDevolution();
      }, 500);
    }
  }

  loadDevolution() {
    this.clearFields();
    this.formDataOrder.patchValue({ 'dv': this.data.or.id, });
  }

  formatNumbers = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  errorMessage(message: string, error: HttpErrorResponse) {
    this.load = false;
    this.msg.mensajeError(message, `Error: ${error.statusText} | Status: ${error.status}`);
  }

  lecturaStorage() {
    this.storage_Id = this.appComponent.storage_Id;
    this.ValidarRol = this.appComponent.storage_Rol;
  }

  //Función para obtener las fallas técnicas.
  getFails = () => this.svFails.srvObtenerLista().subscribe(datos => { this.fails = datos.filter((item) => [13, 14, 15].includes(item.tipoFalla_Id)) });

  applyFilter = ($event, campo: any, table: any) => table!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  onFocus = () => this.fieldFocus = true;

  outFocus(qty: number, qty2: number) {
    if (qty <= qty2) return this.fieldFocus = false;
    else return this.fieldFocus = true;
  }

  clearFields() {
    this.load = false;
    this.formDataOrder.reset();
    this.production = [];
    this.productionSelected = [];
    this.consolidatedProduction = [];
    this.isDevolution = false;
  }

  clearTables() {
    this.production = [];
    //this.productionSelected = [];
    //this.consolidatedProduction = [];
  }

  validateUrl() {
    let order: any = this.formDataOrder.value.order;
    let fact: any = this.formDataOrder.value.fact;
    let roll: any = this.formDataOrder.value.roll;
    let url: string = ``;

    if (fact != null) fact.startsWith('0000') ? fact = fact.replace('0000', '') : fact = fact;

    if (order != null) url += `of=${order}`;
    if (fact != null) url.length > 0 ? url += `&fact=${fact}` : url += `fact=${fact}`;
    if (roll != null) url.length > 0 ? url += `&roll=${roll}` : url += `roll=${roll}`;

    if (url.length > 0) url = `?${url}`;
    return url;
  }

  //Función para buscar la información de la orden de facturación por filtros.
  searchData() {
    this.isDevolution = false;
    this.clearTables();
    let reason: any = this.formDataOrder.value.reason;
    let fact: any = this.formDataOrder.value.fact;

    if (reason != null) {
      if (![null, undefined, ''].includes(this.validateUrl())) {
        this.load = true;
        this.dtOrderFactService.GetInformationOrderFactByFilters(this.validateUrl()).subscribe(dataOf => {
          if (this.productionSelected.length > 0) {
            if (fact != dataOf.factura) {
              this.msg.mensajeAdvertencia(`No es posible generar una misma devolución a facturas diferentes!`);
              this.load = false;
              return;
            }
          }
          setTimeout(() => {
            this.dtOrderFactService.GetInformationOrderFactByFactForDevolution(dataOf.id).subscribe(data => {
              data.forEach(x => {
                this.production.push({
                  'item': x.producto.prod_Id,
                  'reference': x.producto.prod_Nombre,
                  'numberProduction': x.dtOrder.numero_Rollo,
                  'quantity': x.dtOrder.cantidad,
                  'presentation': x.dtOrder.presentacion,
                  'fail': reason,
                  'quantity2': x.dtOrder.cantidad,
                  'of': x.order.id,
                  'factura': x.order.factura,
                  'ot': x.orderProduction,
                  'weight': x.weight ? x.weight : 0,
                  'preIn': false,
                });
                this.changeInformationFact(x);
                this.load = false;
              });
            }, error => { this.errorMessage(`Ocurrió un error al consultar la orden de facturación N° ${dataOf.id}!`, error); });
          }, 1000);
        }, (error: HttpErrorResponse) => {
          this.errorMessage(`Error al consultar la orden de facturación por filtros!`, error);
        });
      } else this.msg.mensajeAdvertencia('Orden de facturación no valida!');
    } else this.msg.mensajeAdvertencia(`Debe elegir el motivo de la devolución!`);
  }

  //Función para buscar la información de la devolución por número de devolución.
  searchDevolution() {
    let dv: any = this.formDataOrder.value.dv;

    if (dv) {
      this.dtDevService.GetInformationDevById(dv).subscribe(data => {
        if ([53].includes(data[0].dev.estado_Id)) {
          this.load = true;
          this.dtOrderFactService.GetInformationOrderFactByFactForDevolution(data[0].dev.id_OrdenFact).subscribe(dataOF => {
            this.isDevolution = true;
            this.loadInfoDevolution(data[0]);
            this.loadInfoDetailsDevolution(data);
            dataOF.forEach(x => {
              if (!this.production.map(z => z.numberProduction).includes(x.dtOrder.numero_Rollo)) {
                this.production.push({
                  'item': x.producto.prod_Id,
                  'reference': x.producto.prod_Nombre,
                  'numberProduction': x.dtOrder.numero_Rollo,
                  'quantity': x.dtOrder.cantidad,
                  'presentation': x.dtOrder.presentacion,
                  'detailId': data[0].dtDev.dtDevProdFact_Id,
                  'fail': data[0].dev.falla_Id,
                  'quantity2': x.dtOrder.cantidad,
                  'of': x.dtOrder.id_OrdenFacturacion,
                  'factura': x.order.factura,
                  'ot': x.orderProduction,
                  'weight': x.weight ? x.weight : 0,
                  'preIn': false,
                });
              }
            })
            console.log(this.production);
          }, error => this.errorMessage(`Error al consultar la devolución N° ${dv}`, error));
        } //else this.msg.mensajeAdvertencia('Advertencia', `La devolución debe estar en estado PRE-DEVUELTO!`);
      }, error => {
        this.errorMessage(`¡Ocurrió un error al buscar la devolución N° ${dv}!`, error)
      });
    } else this.msg.mensajeAdvertencia('Advertencia', `Debe digitar una devolución válida!`);
  }

  //Función para cargar la información de la orden de facturación en el formulario.
  changeInformationFact(data: any) {
    this.formDataOrder.patchValue({
      'idClient': data.clientes.cli_Id,
      'client': data.clientes.cli_Nombre,
      'fact': data.order.factura,
      'order': data.order.id,
      'salesId': data.asesor_Comercial.usua_Id,
      'sales': data.asesor_Comercial.usua_Nombre, 
    });
  }

  //Función para cargar la información de la devolución en el formulario.
  loadInfoDevolution(data: any) {
    this.formDataOrder.patchValue({
      'reason': data.dtDev.falla_Id,
      'idClient': data.cliente.cli_Id,
      'client': data.cliente.cli_Nombre,
      'fact': data.dev.facturaVta_Id,
      'order': data.dev.orderFact_Id,
      'salesId': '', //data.asesor.asesor_Id,
      'sales': '', //data.asesor.usua_Nombre, 
      'contact': data.dev.devProdFact_Responsable,
      'observation': data.dev.devProdFact_Observacion,
    });
    this.load = false;
  }

  //Función para cargar la información de los detalles de la devolución en el formulario.
  loadInfoDetailsDevolution(data: any) {
    data.forEach(x => {
      this.production.push({
        'item': x.prod.prod_Id,
        'reference': x.prod.prod_Nombre,
        'numberProduction': x.dtDev.numero_Rollo,
        'quantity': x.dtDev.cantidad,
        'presentation': x.dtDev.presentacion,
        'fail': data[0].dev.falla_Id,
        'detailId': x.dtDev.dtDevProdFact_Id,
        'quantity2': x.dtDev.cantidad,
        'of': x.dtDev.of ? x.dtDev.of : x.dev.id_OrdenFact,
        'factura': x.dev.facturaVta_Id ? x.dev.facturaVta_Id : null,
        'ot': x.ot ? x.ot : null,
        'weight': x.weight ? x.weight : 0,
        'preIn': true,
      });
    });
    console.log(this.production);

    //this.getConsolidateProduction();
  }

  //Funciones para seleccionar y deseleccionar los rollos a devolver.
  selectedProduction(production: production) {
    this.load = true;
    let index = this.production.findIndex(x => x.numberProduction == production.numberProduction);
    this.production.splice(index, 1);
    this.getConsolidateProduction();
    setTimeout(() => this.load = false, 50);
  }

  //Función para deseleccionar los rollos a devolver.
  deselectedProduction(production: production) {
    this.load = true;
    let index = this.productionSelected.findIndex(x => x.numberProduction == production.numberProduction);
    this.productionSelected.splice(index, 1);
    this.getConsolidateProduction();
    setTimeout(() => this.load = false, 50);
  }

  //Función para seleccionar todos los rollos a devolver.
  selectedAllProduction() {
    this.load = true;
    this.productionSelected = this.productionSelected.concat(this.production);
    this.production = [];
    this.getConsolidateProduction();
    setTimeout(() => this.load = false, 50);
  }

  //Función para deseleccionar todos los rollos a devolver.
  deselectedAllProduction() {
    this.load = true;
    this.production = this.production.concat(this.productionSelected);
    this.productionSelected = [];
    this.getConsolidateProduction();
    setTimeout(() => this.load = false, 50);
  }

  //Funciones para seleccionar y deseleccionar los rollos a devolver con filtros.
  selectionForFilters() {
    let data = this.tableOrder!.filteredValue ? this.tableOrder!.filteredValue : this.tableOrder!.value;

    if (data.length > 0) {
      this.load = true;
      this.productionSelected = this.productionSelected.concat(data);
      if (!this.tableOrder!.filteredValue) this.production = [];
      else {
        data.forEach(x => {
          let index: number = this.production.findIndex(p => p.numberProduction == x.numberProduction);
          this.production.splice(index, 1);
        });
        this.productionSelected.sort((a, b) => Number(b.numberProduction) - Number(a.numberProduction));
      }
      this.getConsolidateProduction();
      setTimeout(() => { this.load = false; }, 5);
    } else this.msg.mensajeAdvertencia(`No hay datos para seleccionar!`, ``);
  }

  //Función para deseleccionar los rollos a devolver con filtros.
  deselectionForFilters() {
    let data = this.tableDevolution!.filteredValue ? this.tableDevolution!.filteredValue : this.tableDevolution!.value;

    if (data.length > 0) {
      this.load = true;
      this.production = this.production.concat(data);
      if (!this.tableDevolution!.filteredValue) this.productionSelected = [];
      else {
        data.forEach(x => {
          let index: number = this.productionSelected.findIndex(p => p.numberProduction == x.numberProduction);
          this.productionSelected.splice(index, 1);
        });
        this.production.sort((a, b) => Number(a.numberProduction) - Number(b.numberProduction));
      }
      this.getConsolidateProduction();
      setTimeout(() => { this.load = false; }, 5);
    } else this.msg.mensajeAdvertencia(`No hay datos para deseleccionar!`, ``);
  }

  //Función para consolidar la información de los rollos seleccionados a devolver.
  getConsolidateProduction() {
    this.consolidatedProduction = this.productionSelected.reduce((a: any[], b: any) => {
      if (!a.map((x: any) => x.item).includes(b.item)) a = [...a, b];
      return a;
    }, []);
  }

  totalQuantityByProduct(item: number): number {
    let total: number = 0;
    this.productionSelected.filter(x => x.item == item).forEach(x => total += x.quantity);
    return total;
  }

  totalWeightByProduct(item: number): number {
    let total: number = 0;
    this.productionSelected.filter(x => x.item == item).forEach(x => total += x.weight ? x.weight : 0);
    return total;
  }

  totalCountProductionByProduct(item: number): number {
    let total: number = 0;
    total = this.productionSelected.filter(x => x.item == item).length;
    return total;
  }

  //Función para validar la información de la devolución
  validateInformation() {
    if (this.formDataOrder.valid) {
      if (this.productionSelected.length > 0) {
        if (this.formDataOrder.value.order != null) this.saveDev();
        else this.msg.mensajeAdvertencia(`¡El campo 'N° de Orden' se encuentra vacío!`);
      } else this.msg.mensajeAdvertencia(`No ha seleccionado ningún rollo para devolver!`);
    } else this.msg.mensajeAdvertencia(`Debe ingresar todos los datos!`);
  }

  //Actualización de la devolución por parte de encargado de ingreso.
  validateInfoDevolution() {
    let dev: any = this.formDataOrder.value.dv;
    if (this.isDevolution) {
      if (this.formDataOrder.valid) {
        if (this.productionSelected.length > 0) {
          this.load = true;
          this.saveDetailsFact(dev);
        } else this.msg.mensajeAdvertencia(`No ha seleccionado ningún rollo para devolver!`);
      } else this.msg.mensajeAdvertencia(`Debe ingresar todos los datos!`);
    } else this.msg.mensajeAdvertencia(`Debe pasar al modo ingreso de devolución!`);
  }

  //Función para guardar la devolución.
  saveDev() {
    this.load = true;
    let order: number = this.formDataOrder.value.order;

    let info: modelDevolucionProductos = {
      'FacturaVta_Id': this.formDataOrder.value.fact,
      'Cli_Id': this.formDataOrder.value.idClient,
      'DevProdFact_Fecha': moment().format('YYYY-MM-DD'),
      'DevProdFact_Hora': moment().format('HH:mm:ss'),
      'DevProdFact_Observacion': this.formDataOrder.value.observation != null ? (this.formDataOrder.value.observation).toUpperCase() : '',
      'TipoDevProdFact_Id': 1,
      'Usua_Id': this.storage_Id,
      'Id_OrdenFact': order,
      'Estado_Id': 53,
      'DevProdFact_Reposicion': false,
      'UsuaModifica_Id': 0,
      'DevProdFact_NotaCredito': false,
      'Asesor_Id': this.formDataOrder.value.salesId ? this.formDataOrder.value.salesId : null,
      'UsuaFinaliza_Id': 0,
      'DevProdFact_Responsable': this.formDataOrder.value.contact ? this.formDataOrder.value.contact.toUpperCase() : '',
    };
    this.devService.srvGuardar(info).subscribe(data => this.saveDetailsFact(data), error => this.errorMessage(`¡Ocurrió un error al crear la devolución!`, error));
  }

  //Función para guardar los detalles de la devolución.
  saveDetailsFact(dato: any) {
    let count: number = 0;
    let qtyRecords: number = this.productionSelected.filter(z => z.preIn == false).length;
    let recordsSaved: any = this.productionSelected.filter(z => z.preIn == false);

    if (qtyRecords > 0) {
      recordsSaved.forEach(prod => {
        let info: modelDtProductoDevuelto = {
          'DevProdFact_Id': dato.devProdFact_Id ? dato.devProdFact_Id : dato,
          'Prod_Id': prod.item,
          'DtDevProdFact_Cantidad': prod.quantity,
          'UndMed_Id': prod.presentation,
          'Rollo_Id': prod.numberProduction,
          'Falla_Id': this.formDataOrder.value.reason,
          'DtDevprodFact_Factura': prod.factura ? prod.factura : null,
          'DtDevprodFact_OT': prod.ot ? prod.ot : null,
          'DtDevprodFact_PesoBruto': prod.weight ? prod.weight : null,
          'DtDevprodFact_PesoNeto': prod.presentation == 'Kg' ? prod.quantity : prod.weight,
          'Of_Id': prod.of ? prod.of : null,
        }
        this.dtDevService.srvGuardar(info).subscribe(data => {
          count++;
          if (count == recordsSaved.length) this.isDevolution ? this.changeStatus(data, 53, 24) : this.changeStatus(data, 23, 53);
        }, error => this.errorMessage(`Ocurrió un error al guardar los detalles de la devolución!`, error));
      });
    } else {
      if (this.isDevolution) {
        this.changeStatus(dato, 53, 24);
        this.validateDetailsDev(dato);
      } else this.changeStatus(dato, 23, 53);
    }
  }

  //Función para eliminar los detalles que no hayan sido seleccionados para la devolución.
  validateDetailsDev(dato: any) {
    let rowsNoSelectedLength: any = this.production.filter(z => z.preIn == true).length;
    let rowsNoSelected: any = this.production.filter(z => z.preIn == true);
    let count: number = 0;

    if (rowsNoSelectedLength > 0) {
      rowsNoSelected.forEach(row => {
        this.dtDevService.delete(row.detailId).subscribe(() => {
          count++;
          if (count == rowsNoSelectedLength) {
            this.changeStatusRollsNoSelected(dato);
          }
        }, error => {
          this.errorMessage(`Ocurrió un error al eliminar los detalles de la devolución!`, error);
        });
      });
    }
  }

  //Función para cambiar el estado de los rollos que no fueron seleccionados en la devolución.
  changeStatusRollsNoSelected(dato: any) {
    let rollsNoSelected: any = this.production.filter(z => z.preIn == true);
    let reelsOF: any = [];
    let reelsProduction: any = [];

    rollsNoSelected.forEach(row => {
      reelsOF.push({
        'of': row.of,
        'roll': row.numberProduction,
        'item': row.item,
        'currentStatus': 53,
        'newStatus': 20,
        'envioZeus': true,
      });

      reelsProduction.push({
        'of': row.of,
        'roll': row.numberProduction,
        'item': row.item,
        'currentStatus': 53,
        'newStatus': 23,
        'envioZeus': true
      });
    });
    this.dtOrderFactService.putStatusInOF(reelsOF).subscribe(() => {
      this.updateStatusProduction(reelsProduction, dato);
    }, error => this.errorMessage(`Error al cambiar el estado de los rollos no seleccionados en la(s) orden(es) de facturación!`, error));
  }

  //Cambiar estado de rollos en la OF.
  changeStatus(data: any, currentStatus: number, newStatus: number) {
    let reels: any = [];
    let reelsOF: any = [];

    this.productionSelected.forEach(x => {
      reelsOF.push({
        'of': x.of,
        'roll': x.numberProduction,
        'item': x.item,
        'currentStatus': x.preIn == false ? 20 : 53,
        'newStatus': newStatus,
        'envioZeus': true
      })

      reels.push({
        'of': x.of,
        'roll': x.numberProduction,
        'item': x.item,
        'currentStatus': x.preIn == false ? 23 : currentStatus,
        'newStatus': newStatus,
        'envioZeus': true
      });
    });

    this.dtOrderFactService.putStatusInOF(reelsOF).subscribe(() => {
      this.updateStatusDev(reels, data);

    }, (error) => this.errorMessage(`Error al cambiar el estado de los rollos en la(s) orden(es) de facturación!`, error));
  }

  //Actualizar encabezado de la devolución
  updateStatusDev(reels: any, data: any) {
    let dev: any = this.formDataOrder.value.dv;
    let date: any = moment().format('YYYY-MM-DD');
    let hour: string = moment().format('HH:mm:ss');
    let observation: any = this.formDataOrder.value.observationIn == null ? '' : `?observation=${this.formDataOrder.value.observationIn}`;
    let status: number = this.isDevolution ? 11 : 53;
    let realDv: number = data.devProdFact_Id ? data.devProdFact_Id : dev;

    this.devService.PutStatusDevolution(realDv, status, date, hour, this.storage_Id, false, false, observation).subscribe(() => {
      this.updateStatusProduction(reels, realDv);
    }, error => {
      this.msg.mensajeError(`No fue posible actualizar el estado de la devolución N° ${dev}!`, error);
      this.load = false;
    });
  }

  //Cambiar estado de rollos en tabla de producción.
  updateStatusProduction(rolls: any, data: any) {
    this.svProduction.putChangeStateProduction(rolls).subscribe(dataChange => {
      this.createPDF(data, 'creada');
    }, error => {
      this.errorMessage(`No fue posible actualizar el estado de los rollos devueltos!`, error);
    });
  }

  //Generación de formato PDF
  createPDF(devolution: any, action?: string) {
    this.dtDevService.GetInformationDevById(devolution).subscribe(data => {
      console.log(data);

      let title: string = `Devolución N° ${devolution}`;
      let content: any[] = this.contentPDF(data);
      this.createPDFService.formatoPDF(title, content);
      this.msg.mensajeConfirmacion(`Devolución N° ${devolution} ${action} exitosamente!`);
      setTimeout(() => this.clearFields(), 3000);
    }, error => this.errorMessage(`¡Ocurrió un error al buscar información de la devolución #${devolution}!`, error));
  }

  //
  contentPDF(data): any[] {
    console.log(data);
    let content: any[] = [];
    let consolidatedInformation: Array<any> = this.consolidatedInformation(data);
    let informationProducts: Array<any> = this.getInformationProducts(data);


    content.push(this.informationMovement(data[0]));
    content.push(this.informationClientPDF(data[0]));
    content.push(this.observationPDF(data[0]));
    content.push(this.observationInPDF(data[0]));
    content.push(this.observationManagementPDF(data[0]));
    content.push(this.observationEndPDF(data[0]));
    content.push(this.tableConsolidated(consolidatedInformation));
    content.push(this.tableProducts(informationProducts));
    return content;
  }

  consolidatedInformation(data: any): Array<any> {
    let consolidatedInformation: Array<any> = [];
    let count: number = 0;
    data.forEach(prod => {
      if (!consolidatedInformation.map(x => x.Item).includes(prod.prod.prod_Id)) {
        count++;
        let cuontProduction: number = data.filter(x => x.prod.prod_Id == prod.prod.prod_Id).length;
        let totalQuantity: number = 0;
        let totalWeight: number = 0;

        data.filter(x => x.prod.prod_Id == prod.prod.prod_Id).forEach(x => {
          totalQuantity += x.dtDev.cantidad
          totalWeight += x.production.weight ? x.production.weight : 0;
        });
        consolidatedInformation.push({
          "#": count,
          "Item": prod.prod.prod_Id,
          "Referencia": prod.prod.prod_Nombre,
          "Cant. Rollos": this.formatNumbers((cuontProduction).toFixed(2)),
          "Cantidad": this.formatNumbers((totalQuantity).toFixed(2)),
          "Peso": this.formatNumbers((totalWeight).toFixed(2)),
          "Presentación": prod.dtDev.presentacion
        });
      }
    });
    return consolidatedInformation;
  }

  getInformationProducts(data: any): Array<any> {
    console.log(data);
    let informationProducts: Array<any> = [];
    let count: number = 0;
    data.forEach(prod => {
      count++;
      informationProducts.push({
        "#": count,
        "Rollo": prod.dtDev.numero_Rollo,
        "OT": prod.production.ot,
        "Item": prod.prod.prod_Id,
        "Referencia": prod.prod.prod_Nombre,
        "Cantidad": this.formatNumbers((prod.dtDev.cantidad).toFixed(2)),
        "Und": prod.dtDev.presentacion,
        "Peso": this.formatNumbers((prod.production.weight ? prod.production.weight : 0).toFixed(2)),
        "Estado": prod.dtDev.estadoOF, //![null, undefined].includes(data[data.length - 1].estadoOF) ? data[data.length - 1].estadoOF : '',
      });
    });

    informationProducts.sort((a, b) => Number(a.Item) - Number(b.Item));
    informationProducts.sort((a, b) => a.Estado.localeCompare(b.Estado));
    informationProducts.sort((a, b) => Number(a["#"]) - Number(b["#"]));
    return informationProducts;
  }

  informationMovement(data): {} {
    return {
      table: {
        widths: ['34%', '33%', '33%'],
        body: [
          [
            { text: `Información general del movimiento`, colSpan: 3, alignment: 'center', fontSize: 10, bold: true }, {}, {}
          ],
          [
            { text: `Orden Fact: ${data.dev.id_OrdenFact}` },
            { text: `Factura: ${data.dev.facturaVta_Id}` },
            { text: `Reposición: ${data.dev.devProdFact_Reposicion == true ? 'SI' : 'NO'} | Nota Crédito: ${data.dev.devProdFact_NotaCredito == true ? 'SI' : 'NO'}` },
          ],
          [
            { text: `Pre-ingresa: ${data.usua.usua_Nombre}` },
            { text: `Ingresa: ${data.usua.usua_Modifica == 0 ? '' : data.usua.usua_Modifica}` },
            { text: `Gestiona: ${[0, null, undefined].includes(data.usua.usuaGestiona) ? '' : data.usua.usuaGestiona}` },
          ],
          [
            { text: `Fecha pre-ingreso: ${(data.dev.devProdFact_Fecha).replace('T00:00:00', '')} ${data.dev.devProdFact_Hora}`, },
            { text: `Fecha ingreso: ${data.dev.devProdFact_FechaModificado != null ? (data.dev.devProdFact_FechaModificado).replace('T00:00:00', '') : ''} ${data.dev.devProdFact_HoraModificado != null ? data.dev.devProdFact_HoraModificado : ''}`, },
            { text: `Fecha gestión: ${data.dev.devProdFact_FechaGestion != null ? (data.dev.devProdFact_FechaGestion).replace('T00:00:00', '') : ''} ${data.dev.devProdFact_HoraGestion != null ? data.dev.devProdFact_HoraGestion : ''}`, }
          ],
          [
            { text: `Finalizado por: ${data.usua.usuaFinaliza != 0 ? data.usua.usuaFinaliza : ''}`, },
            { text: `Fecha Final.: ${data.dev.devProdFact_FechaFinalizado != null ? (data.dev.devProdFact_FechaFinalizado).replace('T00:00:00', '') : ''}`, },
            { text: `N° Reposición: ${data.dev.reposicion_Id}`, },
          ],
          [
            { text: `Estado: ${data.estadoDv.estado_Nombre}` },
            { text: `Motivo devolución: ${data.dtDev.falla}`, colSpan: 2 },
          ]
        ]
      },
      fontSize: 9,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex == 0) ? '#DDDDDD' : null;
        }
      }
    }
  }

  informationClientPDF(data): {} {
    return {
      margin: [0, 15, 0, 20],
      table: {
        widths: ['50%', '20%', '30%'],
        body: [
          [
            { text: `Información detallada del Cliente`, colSpan: 3, alignment: 'center', fontSize: 10, bold: true }, {}, {}
          ],
          [
            { text: `Cliente: ${data.cliente.cli_Id} - ${data.cliente.cli_Nombre}` },
            { text: `Ciudad: ${data.sedes.city}` },
            { text: `Dirección: ${data.sedes.direction}` },
          ],
          [
            { text: `E-mail: ${data.cliente.cli_Email}`, },
            { text: `Telefono: ${data.cliente.cli_Telefono}` },
            { text: `Responsable: ${data.dev.devProdFact_Responsable}` },
          ],
          [
            { text: `Asesor: ${data.asesor.usua_Nombre == null ? '' : data.asesor.usua_Nombre}`, colSpan: 3 },
          ],
        ]
      },
      fontSize: 9,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex == 0) ? '#DDDDDD' : null;
        }
      }
    }
  }

  tableConsolidated(data) {
    let columns: Array<string> = ['#', 'Item', 'Referencia', 'Cant. Rollos', 'Cantidad', 'Peso', 'Presentación'];
    let widths: Array<string> = ['10%', '10%', '40%', '12%', '8%', '7%', '12%'];
    return {
      table: {
        headerRows: 2,
        widths: widths,
        body: this.buildTableBody1(data, columns, 'Consolidado de producto(s)'),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex <= 1) ? '#DDDDDD' : null;
        }
      }
    };
  }

  tableProducts(data) {
    let columns: Array<string> = ['#', 'Rollo', 'OT', 'Item', 'Referencia', 'Cantidad', 'Peso', 'Und', 'Estado'];
    let widths: Array<string> = ['4%', '8%', '7%', '7%', '32%', '8%', '7%', '8%', '19%'];
    return {
      margin: [0, 10],
      table: {
        headerRows: 2,
        widths: widths,
        body: this.buildTableBody2(data, columns, 'Rollos Seleccionados'),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex <= 1) ? '#DDDDDD' : null;
        }
      }
    };
  }

  buildTableBody1(data, columns, title) {
    var body: any[] = [];
    body.push([{ colSpan: 7, text: title, bold: true, alignment: 'center', fontSize: 10 }, '', '', '', '', '', '']);
    body.push(columns);
    data.forEach(function (row) {
      var dataRow: any[] = [];
      columns.forEach((column) => dataRow.push(row[column].toString()));
      body.push(dataRow);
    });
    return body;
  }

  buildTableBody2(data, columns, title) {
    var body: any[] = [];
    body.push([{ colSpan: 9, text: title, bold: true, alignment: 'center', fontSize: 10 }, '', '', '', '', '', '', '', '']);
    body.push(columns);
    data.forEach(function (row) {
      var dataRow: any[] = [];
      columns.forEach((column) => dataRow.push(row[column].toString()));
      body.push(dataRow);
    });
    return body;
  }

  observationPDF(data) {
    return {
      table: {
        widths: ['*'],
        body: [
          [{ border: [true, true, true, false], text: `Observación: `, style: 'subtitulo', bold: true }],
          [{ border: [true, false, true, true], text: `${data.dev.devProdFact_Observacion}` }]
        ]
      },
      fontSize: 9,
    }
  }

  observationInPDF(data) {
    return {
      table: {
        widths: ['*'],
        body: [
          [{ border: [true, false, true, false], text: `Observación de ingreso: `, style: 'subtitulo', bold: true }],
          [{ border: [true, false, true, true], text: `${data.dev.devProdFact_ObservacionModificado == null ? '' : data.dev.devProdFact_ObservacionModificado}` }]
        ]
      },
      fontSize: 9,
    }
  }

  observationManagementPDF(data) {
    return {
      table: {
        widths: ['*'],
        body: [
          [{ border: [true, false, true, false], text: `Observación de revisión: `, style: 'subtitulo', bold: true }],
          [{ border: [true, false, true, true], text: `${data.dev.devProdFact_ObservacionGestion == null ? '' : data.dev.devProdFact_ObservacionGestion}` }]
        ]
      },
      fontSize: 9,
    }
  }

  observationEndPDF(data) {
    return {
      margin: [0, 0, 0, 20],
      table: {
        widths: ['*'],
        body: [
          [{ border: [true, false, true, false], text: `Observación de cierre: `, style: 'subtitulo', bold: true }],
          [{ border: [true, false, true, true], text: `${data.dev.devProdFact_ObservacionFinal == null ? '' : data.dev.devProdFact_ObservacionFinal}` }]
        ]
      },
      fontSize: 9,
    }
  }

  scanRolls() {
    let roll: any = this.form.value.roll;
    if (this.production.length > 0) {
      this.rollsScanned = this.productionSelected.map(x => x.numberProduction);
      this.selectScanRolls(parseInt(roll));
      this.form.reset();
    } else this.msg.mensajeAdvertencia('Advertencia', 'No hay rollos/bultos para escanear!');
  }

  selectScanRolls(roll: any) {
    if (roll) {
      this.load = true;
      let index = this.production.findIndex(x => x.numberProduction == roll);
      if (index != -1) {
        this.productionSelected.push(this.production[index]);
        this.getConsolidateProduction();
        this.production.splice(index, 1);
      } else {
        console.log(this.rollsScanned, roll);

        if (this.rollsScanned.includes(roll)) {
          this.msg.mensajeAdvertencia('Advertencia', `El rollo/bulto N°${roll} ya ha sido seleccionado!`);
          this.form.reset();
        } else {
          this.msg.mensajeAdvertencia('Advertencia', `El rollo/bulto N° ${roll} no pertenece a la orden N° ${this.formDataOrder.value.order}!`);
          this.form.reset();
        }
      }
      setTimeout(() => this.load = false, 50);
    } else this.msg.mensajeAdvertencia('Advertencia', `Debe digitar un número de rollo/bulto válido!`);
  }

  //*FUNCIONES NUEVAS  ...
  private canProcessDevolution_(): boolean {
    if (!this.formDataOrder.valid) {
      this.msg.mensajeAdvertencia('Debe ingresar todos los datos!');
      return false;
    }

    if (this.productionSelected.length === 0) {
      this.msg.mensajeAdvertencia('No ha seleccionado ningún rollo para devolver!');
      return false;
    }

    return true;
  }

  //Función para validar los productos a ingresar en la devolución.
  private getSelectedRecords_() {
    return this.productionSelected.filter(x => x.preIn === false);
  }

  //Función para validar los productos que no fueron seleccionados para la devolución.
  private getPendingRecords_() {
    return this.production.filter(x => x.preIn === true);
  }

  //Función para construir el payload de los detalles de la devolución.
  private buildDetailPayload(prod: production, devId: number): modelDtProductoDevuelto {
    return {
      'DevProdFact_Id': devId,
      'Prod_Id': prod.item,
      'DtDevProdFact_Cantidad': prod.quantity,
      'UndMed_Id': prod.presentation,
      'Rollo_Id': prod.numberProduction,
      'Falla_Id': this.formDataOrder.value.reason,
      'DtDevprodFact_Factura': prod.factura ?? null,
      'DtDevprodFact_OT': prod.ot ?? null,
      'DtDevprodFact_PesoBruto': prod.weight ?? null,
      'DtDevprodFact_PesoNeto': prod.presentation === 'Kg' ? prod.quantity : prod.weight,
      'Of_Id': prod.of ?? null,
    };
  }

  //Función para construir el payload de cambio de estado de los rollos en la OF y producción.
  private buildRollStatusPayload_(rows: production[], currentStatus: number, newStatus: number) {
    const reelsOF = rows.map(row => ({
      'of': row.of,
      'roll': row.numberProduction,
      'item': row.item,
      'currentStatus': row.preIn === false ? 20 : currentStatus,
      'newStatus': newStatus,
      'envioZeus': true,
    }));

    const reelsProduction = rows.map(row => ({
      'of': row.of,
      'roll': row.numberProduction,
      'item': row.item,
      'currentStatus': row.preIn === false ? 23 : currentStatus,
      'newStatus': newStatus,
      'envioZeus': true,
    }));

    return { reelsOF, reelsProduction };
  }

  //Función para validar la información de la devolución.
  validateInformation_() {
    if (!this.formDataOrder.valid) {
      this.msg.mensajeAdvertencia('Debe ingresar todos los datos!');
      return;
    }

    if (this.productionSelected.length === 0) {
      this.msg.mensajeAdvertencia('No ha seleccionado ningún rollo para devolver!');
      return;
    }

    if (this.formDataOrder.value.order == null) {
      this.msg.mensajeAdvertencia("¡El campo 'N° de Orden' se encuentra vacío!");
      return;
    }

    this.saveDev_();
  }

  //Función para validar la información de la devolución por parte de encargado de ingreso.
  validateInfoDevolution_() {
    if (!this.isDevolution) {
      this.msg.mensajeAdvertencia('Debe pasar al modo ingreso de devolución!');
      return;
    }

    if (!this.canProcessDevolution_()) {
      return;
    }

    this.load = true;
    this.saveDetailsFact_(this.formDataOrder.value.dv);
  }

  //Función para cargar la información de la devolución a modificar.
  loadDevolution_() {
    this.clearFields();
    this.formDataOrder.patchValue({ dv: this.data.or.id });
  }

  //Función para guardar la devolución.
  saveDev_() {
    this.load = true;

    const info: modelDevolucionProductos = {
      'FacturaVta_Id': this.formDataOrder.value.fact,
      'Cli_Id': this.formDataOrder.value.idClient,
      'DevProdFact_Fecha': moment().format('YYYY-MM-DD'),
      'DevProdFact_Hora': moment().format('HH:mm:ss'),
      'DevProdFact_Observacion': this.formDataOrder.value.observation
        ? this.formDataOrder.value.observation.toUpperCase()
        : '',
      'TipoDevProdFact_Id': 1,
      'Usua_Id': this.storage_Id,
      'Id_OrdenFact': this.formDataOrder.value.order,
      'Estado_Id': 53,
      'DevProdFact_Reposicion': false,
      'UsuaModifica_Id': 0,
      'DevProdFact_NotaCredito': false,
      'Asesor_Id': this.formDataOrder.value.salesId ?? null,
      'UsuaFinaliza_Id': 0,
      'DevProdFact_Responsable': this.formDataOrder.value.contact
        ? this.formDataOrder.value.contact.toUpperCase()
        : '',
    };

    // Guardar devolución y detalles de forma secuencial para asegurar que se tiene el ID de la devolución antes de guardar los detalles.
    this.devService.srvGuardar(info).pipe(
      switchMap((devResp: any) => this.saveDetailsFact$(devResp)),
      finalize(() => this.load = false),
      catchError(error => {
        this.errorMessage('¡Ocurrió un error al crear la devolución!', error);
        return of(null);
      })
    ).subscribe();
  }

  //Función para guardar los detalles de la devolución.
  saveDetailsFact_(dato: any) {
    this.saveDetailsFact$(dato).pipe(
      finalize(() => this.load = false),
      catchError(error => {
        this.errorMessage('Ocurrió un error al guardar los detalles de la devolución!', error);
        return of(null);
      })
    ).subscribe();
  }

  //Función para guardar los detalles de la devolución con manejo de errores y finalización de carga.
  private saveDetailsFact$(dato: any) {
    const recordsSaved = this.getSelectedRecords_();
    const devId = dato.devProdFact_Id ?? dato;

    if (recordsSaved.length === 0) {
      return this.isDevolution
        ? this.changeStatus$(dato, 53, 24).pipe(tap(() => this.validateDetailsDev_(dato)))
        : this.changeStatus$(dato, 23, 53);
    }

    const detailsRequests = recordsSaved.map(prod =>
      this.dtDevService.srvGuardar(this.buildDetailPayload(prod, devId))
    );

    return forkJoin(detailsRequests).pipe(
      switchMap(() =>
        this.isDevolution
          ? this.changeStatus$(dato, 53, 24).pipe(tap(() => this.validateDetailsDev_(dato)))
          : this.changeStatus$(dato, 23, 53)
      )
    );
  }

  //Función para eliminar los detalles que no hayan sido seleccionados para la devolución.
  validateDetailsDev_(dato: any) {
    const rowsNoSelected = this.getPendingRecords_();

    if (rowsNoSelected.length === 0) {
      this.changeStatusRollsNoSelected_(dato);
      return;
    }

    const deleteRequests = rowsNoSelected.map(row => this.dtDevService.delete(row.detailId));

    forkJoin(deleteRequests).pipe(
      switchMap(() => this.changeStatusRollsNoSelected$(dato)),
      catchError(error => {
        this.errorMessage('Ocurrió un error al eliminar los detalles de la devolución!', error);
        return of(null);
      })
    ).subscribe();
  }

  //Función para cambiar el estado de los rollos que no fueron seleccionados en la devolución.
  changeStatusRollsNoSelected_(dato: any) {
    this.changeStatusRollsNoSelected$(dato).subscribe();
  }

  //Función para cambiar el estado de los rollos que no fueron seleccionados en la devolución con manejo de errores.
  private changeStatusRollsNoSelected$(dato: any) {
    const rowsNoSelected = this.getPendingRecords_();
    const { reelsOF, reelsProduction } = this.buildRollStatusPayload_(rowsNoSelected, 53, 23);

    return this.dtOrderFactService.putStatusInOF(reelsOF).pipe(
      switchMap(() => this.updateStatusProduction$(reelsProduction, dato))
    );
  }

  //Cambiar estado de rollos en la OF.
  changeStatus_(data: any, currentStatus: number, newStatus: number) {
    this.changeStatus$(data, currentStatus, newStatus).subscribe();
  }

  //Función para cambiar el estado de los rollos en la OF y producción con manejo de errores.
  private changeStatus$(data: any, currentStatus: number, newStatus: number) {
    const { reelsOF, reelsProduction } = this.buildRollStatusPayload_(this.productionSelected, currentStatus, newStatus);

    return this.dtOrderFactService.putStatusInOF(reelsOF).pipe(
      switchMap(() => this.updateStatusDev$(reelsProduction, data))
    );
  }

  //Actualizar encabezado de la devolución
  updateStatusDev_(reels: any, data: any) {
    this.updateStatusDev$(reels, data).subscribe();
  }

  private updateStatusDev$(reels: any, data: any) {
    const dev = this.formDataOrder.value.dv;
    const date = moment().format('YYYY-MM-DD');
    const hour = moment().format('HH:mm:ss');
    const observation = this.formDataOrder.value.observationIn == null
      ? ''
      : `?observation=${this.formDataOrder.value.observationIn}`;
    const status = this.isDevolution ? 11 : 53;
    const realDv = data.devProdFact_Id ?? dev;

    return this.devService.PutStatusDevolution(
      realDv,
      status,
      date,
      hour,
      this.storage_Id,
      false,
      false,
      observation
    ).pipe(
      switchMap(() => this.updateStatusProduction$(reels, realDv)),
      catchError(error => {
        this.msg.mensajeError(`No fue posible actualizar el estado de la devolución N° ${dev}!`, error);
        return of(null);
      })
    );
  }

  //Cambiar estado de rollos en tabla de producción.
  updateStatusProduction_(rolls: any, data: any) {
    this.updateStatusProduction$(rolls, data).subscribe();
  }

  //Función para cambiar el estado de los rollos en la tabla de producción con manejo de errores.
  private updateStatusProduction$(rolls: any, data: any) {
    return this.svProduction.putChangeStateProduction(rolls).pipe(
      tap(() => this.createPDF(data, 'creada')),
      catchError(error => {
        this.errorMessage('No fue posible actualizar el estado de los rollos devueltos!', error);
        return of(null);
      })
    );
  }
}

interface production {
  item: number;
  reference: string;
  numberProduction?: number;
  quantity: number;
  cuontProduction?: number;
  presentation: string;
  fail?: number;
  quantity2?: number;
  of?: number;
  factura?: string;
  ot?: number;
  weight?: number;
  preIn?: boolean;
  detailId?: number;
}