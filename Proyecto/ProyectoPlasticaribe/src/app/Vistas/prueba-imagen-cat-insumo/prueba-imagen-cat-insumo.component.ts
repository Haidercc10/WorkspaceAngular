import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { Formato_Facturas_VentasComponent } from '../Formato_Facturas_Ventas/Formato_Facturas_Ventas.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AppComponent } from 'src/app/app.component';
import moment from 'moment';
import { modelDevolucionProductos } from 'src/app/Modelo/modelDevolucionProductos';
import { modelDtProductoDevuelto } from 'src/app/Modelo/modelDtProductoDevuelto';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { DetallesDevolucionesProductosService } from 'src/app/Servicios/DetallesDevolucionRollosFacturados/DetallesDevolucionesProductos.service';
import { DevolucionesProductosService } from 'src/app/Servicios/DevolucionesRollosFacturados/DevolucionesProductos.service';
import { Dt_OrdenFacturacionService } from 'src/app/Servicios/Dt_OrdenFacturacion/Dt_OrdenFacturacion.service';
import { FallasTecnicasService } from 'src/app/Servicios/FallasTecnicas/FallasTecnicas.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { Table } from 'primeng/table';
import { ThisReceiver } from '@angular/compiler';
import { Devolucion_OrdenFacturacionComponent } from '../Devolucion_OrdenFacturacion/Devolucion_OrdenFacturacion.component';
import { create } from 'domain';
import { MovimientosOrdenFacturacionComponent } from '../Movimientos-OrdenFacturacion/Movimientos-OrdenFacturacion.component';

@Component({
  selector: 'app-prueba-imagen-cat-insumo',
  templateUrl: './prueba-imagen-cat-insumo.component.html',
  styleUrls: ['./prueba-imagen-cat-insumo.component.css']
})

@Injectable({
  providedIn: 'root'
})

export class PruebaImagenCatInsumoComponent implements OnInit {

  load: boolean = false;
  storage_Id: number | undefined;
  storage_Name: string | undefined;
  ValidarRol: number | undefined;
  form !: FormGroup;
  modoSeleccionado: boolean;
  production: Array<production> = [];
  productionSelected: Array<production> = [];
  consolidatedProduction: Array<production> = [];
  fails : Array<any> = [];
  devolution: boolean = false;
  statuses : Array<any> = [{id : 19, name : 'DISPONIBLE'}, {id : 23, name : 'NO DISPONIBLE'}];
  status : any = null;
  qtyRollsDv : number = 0;
  
  //@ViewChild(MovimientosOrdenFacturacionComponent) movOF : MovimientosOrdenFacturacionComponent;
  
  @ViewChild('tableOrder') tableOrder : Table | undefined;
  @ViewChild('tableDevolution') tableDevolution : Table | undefined;
  @ViewChild('tableConsolidate') tableConsolidate : Table | undefined;

  constructor(private formatoFacturas : Formato_Facturas_VentasComponent, 
    private appComponent: AppComponent,
    private frmBuilder: FormBuilder,
    private msg: MensajesAplicacionService,
    private dtOrderFactService: Dt_OrdenFacturacionService,
    private createPDFService: CreacionPdfService,
    private svDevolutions: DevolucionesProductosService,
    private svDetailsDevolutions: DetallesDevolucionesProductosService,
    private svFails : FallasTecnicasService,
    private svProduction : Produccion_ProcesosService,
    private cmpDevolutions : Devolucion_OrdenFacturacionComponent, 
    private movOF : MovimientosOrdenFacturacionComponent) {
      this.modoSeleccionado = appComponent.temaSeleccionado;
      this.validateForm();
  }

  ngOnInit() {
    this.lecturaStorage();
    this.getFails();
  }

  validateForm(){
    this.form = this.frmBuilder.group({
      dev : [null, Validators.required],
      orderFact : [null, Validators.required],
      fact: [null, Validators.required],
      idClient: [null, Validators.required],
      client: [null, Validators.required],
      reason: [null, Validators.required],
      reposition : [false, Validators.required],
      observation: [''], 
    });
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
  getFails = () =>  this.svFails.srvObtenerLista().subscribe(datos => { this.fails = datos.filter((item) => [13,14,15].includes(item.tipoFalla_Id)) });
  
  applyFilter = ($event, campo : any, table : any) => table!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  //Función para limpiar campos
  clearFields() {
    this.load = false;
    this.form.reset();
    this.production = [];
    this.productionSelected = [];
    this.consolidatedProduction = [];
    this.status = null;
    this.qtyRollsDv = 0;
    if(this.devolution == true) {
      this.movOF.modalDevolution = false;
      this.movOF.searchData();
    }
    this.devolution = false; 
    
  }

  //Función para limpiar tablas.
  clearTables(){
    this.status = null;
    this.production = [];
    this.productionSelected = [];
    this.consolidatedProduction = [];
  }

  //Función para cargar la información de la devolución. 
  searchData() {
    this.clearTables();
    let dev: any = this.form.value.dev;
    let date : any = moment().format('YYYY-MM-DD');
    let hour : string = moment().format('HH:mm:ss');
    this.qtyRollsDv = 0;

    if (![null, undefined, ''].includes(dev)) {
      this.svDetailsDevolutions.GetInformationDevById(dev).subscribe(data => {
        if([11,29].includes(data[0].dev.estado_Id)) {
          this.load = true;
          this.svDevolutions.PutStatusDevolution(dev, 29, date, hour, this.storage_Id).subscribe(() =>{
            this.qtyRollsDv = data.length;
            data.forEach(x => {
              this.production.push({  
                'item': x.prod.prod_Id,
                'reference': x.prod.prod_Nombre,
                'numberProduction': x.dtDev.numero_Rollo,
                'quantity': x.dtDev.cantidad,
                'presentation': x.dtDev.presentacion, 
                'statusId': 23,
                'statusName': 'NO DISPONIBLE',
              });
              this.changeInformationDev(x);
              this.load = false;
            });
          }, error => {
            this.msg.mensajeError('No fue posible actualizar el estado de la devolución!', error);
            this.clearFields();
          });
        } else {
          this.msg.mensajeAdvertencia(`Devolución no disponible`, `La devolución N° ${dev} se encuentra por reponer y/o cerrada!`);
          this.clearFields();
        }
      }, (error: HttpErrorResponse) => {
        this.errorMessage(`No fue posible consultar la devolución N° ${dev}!`, error);
      }); 
    } else this.msg.mensajeAdvertencia('Número de devolución no valido!');
  }

  //Función para cargar la información de la factura.
  changeInformationDev(data: any) {
    this.form.patchValue({ 
      'orderFact': data.dev.id_OrdenFact,
      'idClient': data.cliente.cli_Id, 
      'client': data.cliente.cli_Nombre, 
      'fact': data.dev.facturaVta_Id, 
      'reason' : data.dtDev.falla_Id, 
      'reposition' : data.dev.devProdFact_Reposicion,
    });
  }

  //Función para seleccionar bultos
  selectedProduction(production: production) {
    if(this.status) {
      this.load = true;
      let index = this.production.findIndex(x => x.numberProduction == production.numberProduction);
      this.production.splice(index, 1);
      this.validateSelection(this.productionSelected, this.status, this.statuses.find(x => x.id == this.status).name, production);
      this.getConsolidateProduction();
      setTimeout(() => this.load = false, 50);
    } else this.msg.mensajeAdvertencia(`Advertencia`, `Debe seleccionar el nuevo estado del bulto seleccionado!`);
  }

  //Función para seleccionar bultos
  deselectedProduction(production: production) {
    this.load = true;
    let index = this.productionSelected.findIndex(x => x.numberProduction == production.numberProduction);
    this.productionSelected.splice(index, 1);
    this.validateSelection(this.production, 23, 'NO DISPONIBLE', production);
    this.getConsolidateProduction();
    setTimeout(() => this.load = false, 50);
  }
   
  //Función para validar el estado que tendrá los bultos
  validateSelection(data : any, statusId : any, statusName : any, production : any){
    let index2 = data.findIndex(x => x.numberProduction == production.numberProduction);
    data[index2].statusId = statusId;
    data[index2].statusName = statusName;  
  }

  //Función para seleccionar todos los bultos
  selectedAllProduction() {
    if(this.status) {
      this.load = true;
      this.productionSelected = this.productionSelected.concat(this.production);
      this.production = [];
      this.validateSelectionAllProduction(this.productionSelected, this.status, this.statuses.find(x => x.id == this.status).name);
      this.getConsolidateProduction();
      setTimeout(() => this.load = false, 50);
    } else this.msg.mensajeAdvertencia(`Advertencia`, `Debe seleccionar el nuevo estado de los bultos revisados!`);
  }

  //Función para deseleccionar todos los bultos
  deselectedAllProduction() {
    this.load = true;
    this.production = this.production.concat(this.productionSelected);
    this.productionSelected = [];
    this.validateSelectionAllProduction(this.production, 23, 'NO DISPONIBLE');
    this.getConsolidateProduction();
    setTimeout(() => this.load = false, 50);
  }

  //Validar que al seleccionar/deseleccionar todos los bultos tomen el estado correspondiente 
  validateSelectionAllProduction(data : any, statusId : number, statusName : string){
    data.forEach(x => {
      x.statusId = statusId, 
      x.statusName = statusName
    });
  }

  //Función para seleccionar según lo que esté filtrado en la tabla.
  selectionForFilters(){
    let data = this.tableOrder.filteredValue ? this.tableOrder.filteredValue : this.tableOrder.value;

    if(data.length > 0) {
      console.log(data);
      this.load = true;
      this.productionSelected = this.productionSelected.concat(data); 
      if(!this.tableOrder.filteredValue) {
        this.production = [];
        this.validateSelectionAllProduction(this.productionSelected, this.status, this.statuses.find(x => x.id == this.status).name);
      } 
      else {
        data.forEach(x => {
          x.statusId = this.status, 
          x.statusName = this.statuses.find(x => x.id == this.status).name
          let index : number = this.production.findIndex(p => p.numberProduction == x.numberProduction);
          this.production.splice(index, 1);
        });
        this.productionSelected.sort((a,b) => Number(b.numberProduction) - Number(a.numberProduction));
      }
      this.getConsolidateProduction();
      setTimeout(() => { this.load = false; }, 5);
    } else this.msg.mensajeAdvertencia(`No hay datos para seleccionar!`, ``);
  }

  //Función para seleccionar según lo que esté filtrado en la tabla.
  deselectionForFilters(){
    let data = this.tableDevolution.filteredValue ? this.tableDevolution.filteredValue : this.tableDevolution.value;

    if(data.length > 0) {
      this.load = true;
      this.production = this.production.concat(data); 
      if(!this.tableDevolution.filteredValue) {
        this.productionSelected = [];
      } else {
        data.forEach(x => {
          x.statusId = 23, 
          x.statusName = 'NO DISPONIBLE'
          let index : number = this.productionSelected.findIndex(p => p.numberProduction == x.numberProduction);
          this.productionSelected.splice(index, 1);
        });
        this.production.sort((a,b) => Number(a.numberProduction) - Number(b.numberProduction));
      }
      this.getConsolidateProduction();
      setTimeout(() => { this.load = false; }, 5);
    } else this.msg.mensajeAdvertencia(`No hay datos para deseleccionar!`, ``);  
  }

  //Función para consolidar la información de lo que se ha seleccionado.
  getConsolidateProduction() {
    this.consolidatedProduction = this.productionSelected.reduce((a, b) => {
      if (!a.map(x => x.item).includes(b.item)) a = [...a, b];
      return a;
    }, []);
  }

  //Función para calcular la cantidad consolidada por bulto.
  totalQuantityByProduct(item: number): number {
    let total: number = 0;
    this.productionSelected.filter(x => x.item == item).forEach(x => total += x.quantity);
    return total;
  }

  //Función para contar los bultos consolidados por item.
  totalCountProductionByProduct(item: number): number {
    let total: number = 0;
    total = this.productionSelected.filter(x => x.item == item).length;
    return total;
  }

  //Función para contar los bultos consolidados por item.
  totalCountProductionByProductStatus(item: number, status : number): number {
    let total: number = 0;
    total = this.productionSelected.filter(x => x.item == item && x.statusId == status).length;
    return total;
  }

  //Función para validar la información que se va a guardar.
  validateInformation(){
    if(this.form.valid) {
      if(this.productionSelected.length > 0) {
        if(this.qtyRollsDv == this.productionSelected.length) this.updateRollsInProduction();
        else this.msg.mensajeAdvertencia(`La cantidad de bultos/rollos seleccionados no coincide con la cantidad de bultos de la devolución!`);
      } else this.msg.mensajeAdvertencia(`Advertencia`, `Debe seleccionar al menos un bulto!`);
    } else this.msg.mensajeAdvertencia(`Advertencia`, `Debe llenar todos los campos!`);
  }

  //Función para actualizar el estado de los bultos en producción procesos.
  updateRollsInProduction(){
    this.load = true;
    let rolls : any = [];
    if(this.productionSelected.length > 0) {
      this.productionSelected.forEach(x => { 
        rolls.push({'roll': x.numberProduction, 'item': x.item, 'currentStatus' : 24, 'newStatus' : x.statusId });
      });
      this.svProduction.putChangeStateProduction(rolls).subscribe(data => {
        this.updateRollsInOrderFact(rolls);
      }, error => {
        this.msg.mensajeError('No fue posible actualizar el estado de los bultos a DISPONIBLE!', error);
        this.load = false;
      });
    }
  }

  //Función para actualizar el estado de los bultos en orden de facturación.
  updateRollsInOrderFact(rolls){
    let order : any = this.form.value.orderFact;
    rolls.forEach(x => {
      if(x.newStatus == 19) x.newStatus = 33;
      else x.newStatus = 36;
    });
    this.dtOrderFactService.putStatusRollInOrderFact(rolls, order).subscribe(data => {
      this.updateStatusDev();
    }, error => {
      this.msg.mensajeError('No fue posible actualizar el estado de los bultos en la orden de facturación!', error);
      this.load = false;
    });
  }

  //Función para actualizar el estado de la devolución.
  updateStatusDev(){
    let dev: any = this.form.value.dev;
    let date : any = moment().format('YYYY-MM-DD');
    let hour : string = moment().format('HH:mm:ss');
    let reposition : boolean = this.form.value.reposition;
    let status : number;
    status = this.qtyRollsDv == this.productionSelected.length ? reposition ? 38 : 18 : 29;
    this.load = true;

    this.svDevolutions.PutStatusDevolution(dev, status, date, hour, this.storage_Id).subscribe(data => {
      this.createPDF(dev, 'actualizada');
      //this.msg.mensajeConfirmacion('Confirmación', 'Los bultos seleccionados se actualizaron correctamente!');
    }, error => {
      this.msg.mensajeError('No fue posible actualizar el estado de la devolución!', error);
      this.load = false;
    });
  }

  createPDF(dev : any, action : any){
    this.cmpDevolutions.createPDF(dev, action);
    this.clearFields(); 
  }

}

interface production {
  item: number;
  reference: string;
  numberProduction?: number;
  quantity: number;
  cuontProduction?: number;
  presentation: string;
  fail? : number;
  statusId? : number;
  statusName? : string;
}