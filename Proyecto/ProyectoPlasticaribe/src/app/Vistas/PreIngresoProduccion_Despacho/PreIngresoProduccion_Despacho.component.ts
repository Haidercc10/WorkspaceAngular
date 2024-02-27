import { HttpErrorResponse } from '@angular/common/http';
import { Component, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { modelDtPreEntregaRollos } from 'src/app/Modelo/modelDtPreEntregaRollo';
import { modelPreentregaRollos } from 'src/app/Modelo/modelPreEntregaRollo';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { DtPreEntregaRollosService } from 'src/app/Servicios/DetallesPreIngresoRollosDespacho/DtPreEntregaRollos.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { PreEntregaRollosService } from 'src/app/Servicios/PreIngresoRollosDespacho/PreEntregaRollos.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-PreIngresoProduccion_Despacho',
  templateUrl: './PreIngresoProduccion_Despacho.component.html',
  styleUrls: ['./PreIngresoProduccion_Despacho.component.css']
})

@Injectable({
  providedIn: 'root'
})

export class PreIngresoProduccion_DespachoComponent implements OnInit {

  storage_Id: number;
  ValidarRol: number;
  load: boolean = false;
  modoSeleccionado: boolean;
  formData: FormGroup;
  process: Array<any> = [];
  production: Array<OrderProduction> = [];
  productionSelected: Array<OrderProduction> = [];
  consolidatedProduction: Array<OrderProduction> = [];

  constructor(private appComponent: AppComponent,
    private formBuilder: FormBuilder,
    private msg: MensajesAplicacionService,
    private productionProcessService: Produccion_ProcesosService,
    private preInService: PreEntregaRollosService,
    private detailsPreInService: DtPreEntregaRollosService,
    private processService: ProcesosService,
    private createPDFService: CreacionPdfService,) {

    this.modoSeleccionado = appComponent.temaSeleccionado;
    this.formData = this.formBuilder.group({
      orderProduction: [null],
      process: [null, Validators.required],
      observation: [null],
    });
  }

  ngOnInit() {
    this.readStorage();
    this.getProcess();
  }

  readStorage() {
    this.storage_Id = this.appComponent.storage_Id;
    this.ValidarRol = this.appComponent.storage_Rol;
  }

  errorMessage(message: string, error: HttpErrorResponse) {
    this.load = false;
    this.msg.mensajeError(message, `Error: ${error.statusText} | Status: ${error.status}`);
  }

  formatNumbers = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  clearFields() {
    this.load = false;
    this.formData.reset();
    this.production = [];
    this.productionSelected = [];
    this.consolidatedProduction = [];
  }

  getProcess(){
    this.processService.srvObtenerLista().subscribe(data => {
      this.process = data.filter(x => ['EXT', 'EMP', 'SELLA'].includes(x.proceso_Id));
      this.formData.patchValue({ process: this.validateProcess() });
    });
  }

  validateProcess(): 'EMP' | 'SELLA' | 'EXT' {
    let process = {
      '87': 'EMP',
      '86': 'SELLA',
      '85': 'EXT',
    }
    return process[(this.ValidarRol).toString()];
  }

  searchDataOrderProduction(){
    let orderProduction = this.formData.value.orderProduction;
    let process: string = this.formData.value.process;
    this.productionProcessService.GetInformationAboutProductionByOrderProduction_Process(orderProduction, process).subscribe(data => {
      this.production = this.fillDataOrderProduction(data);
    }, error => this.errorMessage(`¡Error al consultar la producción!`, error));
  }

  fillDataOrderProduction(data : any): Array<OrderProduction>{
    let orderProduction: Array<OrderProduction> = [];
    data.forEach(dataProduction => {
      orderProduction.push({
        orderProduction : dataProduction.pp.ot,
        item: dataProduction.producto.prod_Id,
        reference: dataProduction.producto.prod_Nombre,
        numberProduction: dataProduction.pp.numeroRollo_BagPro,
        quantity: dataProduction.pp.presentacion == 'Kg' ? dataProduction.pp.peso_Neto : dataProduction.pp.cantidad,
        presentation: dataProduction.pp.presentacion,
        date: dataProduction.pp.fecha,
        process: dataProduction.proceso.proceso_Id
      });
    });
    return orderProduction;
  }

  selectedProduction(production: OrderProduction) {
    this.load = true;
    let index = this.production.findIndex(x => x.numberProduction == production.numberProduction);
    this.production.splice(index, 1);
    this.getConsolidateProduction();
    setTimeout(() => this.load = false, 5);
  }

  deselectedProduction(production: OrderProduction) {
    this.load = true;
    let index = this.productionSelected.findIndex(x => x.numberProduction == production.numberProduction);
    this.productionSelected.splice(index, 1);
    this.getConsolidateProduction();
    setTimeout(() => this.load = false, 5);
  }

  selectedAllProduction() {
    this.load = true;
    this.productionSelected = this.productionSelected.concat(this.production);
    this.production = [];
    this.getConsolidateProduction();
    setTimeout(() => this.load = false, 5);
  }

  deselectedAllProduction() {
    this.load = true;
    this.production = this.production.concat(this.productionSelected);
    this.productionSelected = [];
    this.getConsolidateProduction();
    setTimeout(() => this.load = false, 5);
  }

  getConsolidateProduction() {
    this.consolidatedProduction = this.productionSelected.reduce((a, b) => {
      if (!a.map(x => x.orderProduction).includes(b.orderProduction)) a = [...a, b];
      return a;
    }, []);
  }

  totalQuantityByProduct(item: number): number {
    let total: number = 0;
    this.productionSelected.filter(x => x.item == item).forEach(x => total += x.quantity);
    return total;
  }

  totalCountProductionByProduct(item: number): number {
    let total: number = 0;
    total = this.productionSelected.filter(x => x.item == item).length;
    return total;
  }

  validateInformation() {
    if (this.formData.valid) {
      if (this.productionSelected.length > 0) this.savePreIn();
      else this.msg.mensajeAdvertencia(`¡No ha seleccionado ningún rollo!`);
    } else this.msg.mensajeAdvertencia(`¡Debe seleccionar el proceso!`);
  }

  savePreIn(){
    this.load = true;
    let observation: string = this.formData.value.observation;
    const data : modelPreentregaRollos = {
      PreEntRollo_Fecha : moment().format('YYYY-MM-DD'),
      PreEntRollo_Observacion : ![null, undefined].includes(observation) ? observation.toUpperCase() : '',
      Usua_Id : this.storage_Id,
      PreEntRollo_Hora : moment().format('H:mm:ss'),
    }
    this.preInService.srvGuardar(data).subscribe(data => this.saveDetailsPreIn(data.preEntRollo_Id), error => this.errorMessage(`¡Ocurrió un error al crear el Pre Ingreso!`, error));
  }

  saveDetailsPreIn(idPreIn: number){
    let count: number = 0;
    this.productionSelected.forEach(pp => {
      const data: modelDtPreEntregaRollos = {
        PreEntRollo_Id : idPreIn,
        Rollo_Id : pp.numberProduction,
        DtlPreEntRollo_Cantidad : pp.quantity,
        UndMed_Rollo : pp.presentation,
        Proceso_Id : pp.process,
        Cli_Id: 1,
        DtlPreEntRollo_OT : pp.orderProduction,
        Prod_Id : pp.item,
        UndMed_Producto : pp.presentation,
      }
      this.detailsPreInService.srvGuardar(data).subscribe(() => {
        count++;
        if (count == this.productionSelected.length) this.PutDelivered_NoAvaible(idPreIn);
      }, error => this.errorMessage(`¡Ocurrió un error al crear los detalles del Pre Ingreso!`, error));
    });
  }

  PutDelivered_NoAvaible(idPreIn: number) {
    this.productionProcessService.PutDelivered_NoAvaible(idPreIn).subscribe(() => {
      this.msg.mensajeConfirmacion(`¡Pre Ingreso creado correctamente!`);
      this.createPDF(idPreIn);
    }, error => this.errorMessage(`¡Ocurrió un error al cambiar el estado de los rollos/bultos!`, error));
  }

  createPDF(idPreIn: number) {
    console.log(`1: ${1}`)
    this.detailsPreInService.GetInformactionAboutPreIn_ById(idPreIn).subscribe(data => {
      this.load = true;
      let title: string = `Pre Ingreso N° ${idPreIn}`;
      let content: any[] = this.contentPDF(data);
      this.createPDFService.formatoPDF(title, content);
      setTimeout(() => this.clearFields(), 3000);
    }, error => this.errorMessage(`¡Se guardó la información del Pre Ingreso pero no se puedo crear el PDF!`, error));
  }

  contentPDF(data): any[] {
    let content: any[] = [];
    let consolidatedInformation: Array<any> = this.consolidatedInformation(data);
    let informationProducts: Array<any> = this.getInformationProducts(data);
    content.push(this.tableInformationPreIn(data[0]));
    content.push(this.tableConsolidated(consolidatedInformation));
    content.push(this.tableProducts(informationProducts));
    return content;
  }

  consolidatedInformation(data: any): Array<any> {
    let consolidatedInformation: Array<any> = [];
    let count: number = 0;
    data.forEach(prod => {
      if (!consolidatedInformation.map(x => x.Item).includes(prod.details.item)) {
        count++;
        let cuontProduction: number = data.filter(x => x.details.item == prod.details.item).length;
        let totalQuantity: number = 0;
        data.filter(x => x.details.item == prod.details.item).forEach(x => totalQuantity += x.details.quantity);
        consolidatedInformation.push({
          "#": count,
          "OT": prod.details.orderProduction,
          "Item": prod.details.item,
          "Referencia": prod.details.reference,
          "Cant. Rollos": this.formatNumbers((cuontProduction).toFixed(2)),
          "Cantidad": this.formatNumbers((totalQuantity).toFixed(2)),
          "Presentación": prod.details.presentation
        });
      }
    });
    return consolidatedInformation;
  }

  getInformationProducts(data: any): Array<any> {
    let informationProducts: Array<any> = [];
    let count: number = 0;
    data.forEach(prod => {
      count++;
      informationProducts.push({
        "#": count,
        "OT": prod.details.orderProduction,
        "Rollo": prod.details.production,
        "Item": prod.details.item,
        "Referencia": prod.details.reference,
        "Cantidad": this.formatNumbers((prod.details.quantity).toFixed(2)),
        "Presentación": prod.details.presentation,
      });
    });
    return informationProducts;
  }

  tableInformationPreIn(data: any): {} {
    return {
      margin: [0, 10],
      table: {
        widths: ['50%', '20%', '30%'],
        body: [
          [
            { text: `Información General Pre Ingreso`, colSpan: 3, alignment: 'center', fontSize: 10, bold: true }, {}, {}
          ],
          [
            { text: `Nombre: ${data.pre.user_Name}`, colSpan: 2 },
            {},
            { text: `Fecha: ${data.pre.date}` }
          ],
          [
            { text: `Observación: ${(data.pre.observation).toUpperCase()}`, colSpan: 3 }, {}, {}
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
    let columns: Array<string> = ['#', 'OT', 'Item', 'Referencia', 'Cant. Rollos', 'Cantidad', 'Presentación'];
    let widths: Array<string> = ['8%', '10%', '10%', '40%', '10%', '12%', '10%'];
    return {
      margin: [0, 10],
      table: {
        headerRows: 2,
        widths: widths,
        body: this.buildTableBody(data, columns, 'Consolidado de producto(s)'),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex == 0 || rowIndex == 1) ? '#DDDDDD' : null;
        }
      }
    };
  }

  tableProducts(data) {
    let columns: Array<string> = ['#', 'OT', 'Rollo', 'Item', 'Referencia', 'Cantidad', 'Presentación'];
    let widths: Array<string> = ['8%', '10%', '10%', '10%', '40%', '12%', '10%'];
    return {
      margin: [0, 10],
      table: {
        headerRows: 2,
        widths: widths,
        body: this.buildTableBody(data, columns, 'Rollos Seleccionados'),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex == 0 || rowIndex == 1) ? '#DDDDDD' : null;
        }
      }
    };
  }

  buildTableBody(data, columns, title) {
    var body = [];
    body.push([{ colSpan: 7, text: title, bold: true, alignment: 'center', fontSize: 10 }, '', '', '', '', '', '']);
    body.push(columns);
    data.forEach(function (row) {
      var dataRow = [];
      columns.forEach((column) => dataRow.push(row[column].toString()));
      body.push(dataRow);
    });
    return body;
  }
}

interface OrderProduction{
  orderProduction : number;
  item: number;
  reference: string;
  numberProduction?: number;
  quantity: number;
  cuontProduction?: number;
  presentation: string;
  date: any;
  process: string;
}
