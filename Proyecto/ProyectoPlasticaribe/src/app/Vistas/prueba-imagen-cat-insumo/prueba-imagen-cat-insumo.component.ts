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
  modalFails : boolean = false;
  reposition: boolean = false;
  statuses : Array<any> = [{id : 19, name : 'DISPONIBLE'}, {id : 23, name : 'NO DISPONIBLE'}];
  status : any = null;
  
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
    private svProduction : Produccion_ProcesosService,) {
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
  getFails = () =>  this.svFails.srvObtenerLista().subscribe(datos => { this.fails = datos.filter((item) => [14,13].includes(item.tipoFalla_Id)) });
  
  applyFilter = ($event, campo : any, table : any) => table!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  //Función para limpiar campos
  clearFields() {
    this.load = false;
    this.form.reset();
    this.production = [];
    this.productionSelected = [];
    this.consolidatedProduction = [];
    this.status = null;
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
    let dev: any = this.form.value.dev.trim();

    if (![null, undefined, ''].includes(dev)) {
      this.load = true;
      this.svDetailsDevolutions.GetInformationDevById(dev).subscribe(data => {
        data.forEach(x => {
          this.production.push({  
            'item': x.prod.prod_Id,
            'reference': x.prod.prod_Nombre,
            'numberProduction': x.dtDev.numero_Rollo,
            'quantity': x.dtDev.cantidad,
            'presentation': x.dtDev.presentacion, 
          });
          this.changeInformationDev(x);
          this.load = false;
        });
      }, (error: HttpErrorResponse) => {
        this.errorMessage(`No fue posible consultar la devolución N° ${dev}!`, error);
      }); 
    } else this.msg.mensajeAdvertencia('Número de devolución no valido!');
  }

  //Función para cargar la información de la factura.
  changeInformationDev(data: any) {
    this.form.patchValue({ 
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
      this.getConsolidateProduction();
      setTimeout(() => this.load = false, 50);
    } else this.msg.mensajeAdvertencia(`Advertencia`, `Debe seleccionar el nuevo estado del bulto seleccionado!`);
  }

  //Función para seleccionar bultos
  deselectedProduction(production: production) {
    this.load = true;
    let index = this.productionSelected.findIndex(x => x.numberProduction == production.numberProduction);
    this.productionSelected.splice(index, 1);
    this.getConsolidateProduction();
    setTimeout(() => this.load = false, 50);
  }
      

  //Función para seleccionar todos los bultos
  selectedAllProduction() {
    if(this.status) {
      this.load = true;
      this.productionSelected = this.productionSelected.concat(this.production);
      this.production = [];
      this.getConsolidateProduction();
      setTimeout(() => this.load = false, 50);
    } else this.msg.mensajeAdvertencia(`Advertencia`, `Debe seleccionar el nuevo estado de los bultos revisados!`);
  }

  //Función para deseleccionar todos los bultos
  deselectedAllProduction() {
    this.load = true;
    this.production = this.production.concat(this.productionSelected);
    this.productionSelected = [];
    this.getConsolidateProduction();
    setTimeout(() => this.load = false, 50);
  }

  //Función para seleccionar según lo que esté filtrado en la tabla.
  selectionForFilters(){
    let data = this.tableOrder.filteredValue ? this.tableOrder.filteredValue : this.tableOrder.value;

    if(data.length > 0) {
      this.load = true;
      this.productionSelected = this.productionSelected.concat(data); 
      if(!this.tableOrder.filteredValue) this.production = [];
      else {
        data.forEach(x => {
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
      if(!this.tableDevolution.filteredValue) this.productionSelected = [];
      else {
        data.forEach(x => {
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

  //CAMBIAR.
  validateInformation() {
    if (this.form.valid) {
      if (this.productionSelected.length > 0) {
        if ((this.form.value.order).trim() != '') this.saveDev();
        else this.msg.mensajeAdvertencia(`¡El campo 'N° de Orden' se encuentra vacío!`);
      } else this.msg.mensajeAdvertencia(`No ha seleccionado ningún rollo para devolver!`);
    } else this.msg.mensajeAdvertencia(`Debe ingresar todos los datos!`);
  }

  //CAMBIAR.
  saveDev() {
    this.load = true;
    let order : number = this.form.value.order;
    let reposition : boolean = this.form.value.reposition;
    let info: modelDevolucionProductos = {
      'FacturaVta_Id': this.form.value.fact,
      'Cli_Id': this.form.value.idClient,
      'DevProdFact_Fecha': moment().format('YYYY-MM-DD'),
      'DevProdFact_Hora': moment().format('HH:mm:ss'),
      'DevProdFact_Observacion': this.form.value.observation != null ? (this.form.value.observation).toUpperCase() : '',
      'TipoDevProdFact_Id': 1,
      'Usua_Id': this.storage_Id,
      'Id_OrdenFact': order,
      'Estado_Id': 11,
      'DevProdFact_Reposicion': reposition,
    };
    this.svDevolutions.srvGuardar(info).subscribe(data => this.saveDetailsFact(data), error => this.errorMessage(`¡Ocurrió un error al crear la devolución!`, error));
  }

  //CAMBIAR
  saveDetailsFact(data: any) {
    let count: number = 0;
    this.productionSelected.forEach(prod => {
      let info: modelDtProductoDevuelto = {
        'DevProdFact_Id': data.devProdFact_Id,
        'Prod_Id': prod.item,
        'DtDevProdFact_Cantidad': prod.quantity,
        'UndMed_Id': prod.presentation,
        'Rollo_Id': prod.numberProduction,
        'Falla_Id': prod.fail,
      }
      this.svDetailsDevolutions.srvGuardar(info).subscribe(() => {
        count++;
        if (count == this.productionSelected.length) this.changeStatus(data);
      }, error => this.errorMessage(`Ocurrió un error al guardar los detalles de la devolución!`, error));
    });
  }

  //CAMBIAR.
  changeStatus(data: any){
    let order: number = this.form.value.order;
    let reels: any = [];
    this.productionSelected.forEach(x => { reels.push({ 'roll' : x.numberProduction, 'item' : x.item, }) });
    this.dtOrderFactService.PutStatusProduction(reels.map(x => x.roll), order).subscribe(() => {
      this.updateStatusProduction(reels, data);
    }, (error) => this.errorMessage(`Ocurrió un error al cambiar el estado de los rollos en la orden N° ${order}!`, error));
  }

  updateStatusProduction(rolls : any, data : any){
    this.svProduction.putChangeStateProduction(rolls, 20, 24).subscribe(dataChange => {
      //this.createPDF(data.devProdFact_Id, 'creada');
    }, error => {
      this.errorMessage(`No fue posible actualizar el estado de los rollos devueltos!`, error);
    })
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
  available? : number;
  reposition? : boolean;
}