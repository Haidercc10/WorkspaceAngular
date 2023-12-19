import { Component, OnInit } from '@angular/core';
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
      startDate: [null],
      endDate: [null],
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
    let process: 'EMP' | 'SELLA' | 'EXT';
    switch (this.ValidarRol) {
      case 9:
        process = 'EMP';
        break;
      case 8:
        process = 'SELLA';
        break;
      case 7:
        process = 'EXT';
        break;
      default:
        process = 'EMP';
        break;
    }
    return process;
  }

  searchDataOrderProduction(){
    let orderProduction = this.formData.value.orderProduction;
    let process: string = this.formData.value.process;
    this.productionProcessService.GetInformationAboutProductionByOrderProduction_Process(orderProduction, process).subscribe(data => {
      this.production = this.fillDataOrderProduction(data);
    }, error => this.msg.mensajeError(error));
  }

  fillDataOrderProduction(data : any): Array<OrderProduction>{
    let orderProduction: Array<OrderProduction> = [];
    data.forEach(dataProduction => {
      orderProduction.push({
        orderProduction : dataProduction.pp.ot,
        item: dataProduction.producto.prod_Id,
        reference: dataProduction.producto.prod_Nombre,
        numberProduction: dataProduction.pp.numero_Rollo,
        quantity: dataProduction.pp.cantidad,
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
    setTimeout(() => this.load = false, 50);
  }

  deselectedProduction(production: OrderProduction) {
    this.load = true;
    let index = this.productionSelected.findIndex(x => x.numberProduction == production.numberProduction);
    this.productionSelected.splice(index, 1);
    this.getConsolidateProduction();
    setTimeout(() => this.load = false, 50);
  }

  selectedAllProduction() {
    this.load = true;
    this.productionSelected = this.productionSelected.concat(this.production);
    this.production = [];
    this.getConsolidateProduction();
    setTimeout(() => this.load = false, 50);
  }

  deselectedAllProduction() {
    this.load = true;
    this.production = this.production.concat(this.productionSelected);
    this.productionSelected = [];
    this.getConsolidateProduction();
    setTimeout(() => this.load = false, 50);
  }

  getConsolidateProduction() {
    this.consolidatedProduction = this.productionSelected.reduce((a, b) => {
      if (!a.map(x => x.item).includes(b.item)) a = [...a, b];
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
    this.preInService.srvGuardar(data).subscribe(data => this.saveDetailsPreIn(data.preEntRollo_Id), error => {
      this.load = false;
      this.msg.mensajeError(`¡Ocurrió un error al crear el Pre Ingreso!`, error);
    });
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
      this.detailsPreInService.srvGuardar(data).subscribe(data => {
        count++;
        if (count == this.productionSelected.length) {
          this.msg.mensajeConfirmacion(`¡Pre Ingreso creado correctamente!`);
          this.createPDF(idPreIn);
        }
      });
    });
  }

  createPDF(idPreIn: number) {
    this.detailsPreInService.GetInformactionAboutPreIn_ById(idPreIn).subscribe(data => {
      this.load = true;
      let title: string = `Pre Ingreso N° ${idPreIn}`;
      let content: any[] = this.contentPDF(data);
      this.createPDFService.formatoPDF(title, content);
      setTimeout(() => this.clearFields(), 3000);
    }, error => this.msg.mensajeError(error));
  }

  contentPDF(data): any[] {
    let content: any[] = [];
    let consolidatedInformation: Array<any> = this.consolidatedInformation(data);
    let informationProducts: Array<any> = this.getInformationProducts(data);
    content.push(this.informationConsolidatedProducts());
    content.push(this.tableConsolidated(consolidatedInformation));
    content.push(this.informationProducts());
    content.push(this.tableProducts(informationProducts));
    content.push(this.observationPDF(data[0]));
    return content;
  }

  consolidatedInformation(data: any): Array<any> {
    let consolidatedInformation: Array<any> = [];
    data.forEach(prod => {
      if (!consolidatedInformation.map(x => x.Item).includes(prod.prod.prod_Id)) {
        let cuontProduction: number = data.filter(x => x.prod.prod_Id == prod.prod.prod_Id).length;
        let totalQuantity: number = 0;
        data.filter(x => x.prod.prod_Id == prod.prod.prod_Id).forEach(x => totalQuantity += x.dtPre.dtlPreEntRollo_Cantidad);
        consolidatedInformation.push({
          "Item": prod.prod.prod_Id,
          "Referencia": prod.prod.prod_Nombre,
          "Cant. Rollos": this.formatNumbers((cuontProduction).toFixed(2)),
          "Cantidad": this.formatNumbers((totalQuantity).toFixed(2)),
          "Presentación": prod.dtPre.undMed_Rollo
        });
      }
    });
    return consolidatedInformation;
  }

  getInformationProducts(data: any): Array<any> {
    let informationProducts: Array<any> = [];
    data.forEach(prod => {
      informationProducts.push({
        "Rollo": prod.dtPre.rollo_Id,
        "Item": prod.prod.prod_Id,
        "Referencia": prod.prod.prod_Nombre,
        "Cantidad": this.formatNumbers((prod.dtPre.dtlPreEntRollo_Cantidad).toFixed(2)),
        "Presentación": prod.dtPre.undMed_Rollo,
      });
    });
    return informationProducts;
  }

  informationConsolidatedProducts() {
    return {
      text: `Consolidado de producto(s) \n `,
      alignment: 'center',
      style: 'header',
      fontSize: 10,
    };
  }

  tableConsolidated(data) {
    let columns: Array<string> = ['Item', 'Referencia', 'Cant. Rollos', 'Cantidad', 'Presentación'];
    let widths: Array<string> = ['10%', '40%', '20%', '20%', '10%'];
    return {
      table: {
        headerRows: 1,
        widths: widths,
        body: this.buildTableBody(data, columns),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex == 0) ? '#DDDDDD' : null;
        }
      }
    };
  }

  informationProducts() {
    return {
      text: `\n Rollos Seleccionados \n `,
      alignment: 'center',
      style: 'header',
      fontSize: 10,
    };
  }

  tableProducts(data) {
    let columns: Array<string> = ['Rollo', 'Item', 'Referencia', 'Cantidad', 'Presentación'];
    let widths: Array<string> = ['15%', '15%', '40%', '20%', '10%'];
    return {
      table: {
        headerRows: 1,
        widths: widths,
        body: this.buildTableBody(data, columns),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex == 0) ? '#DDDDDD' : null;
        }
      }
    };
  }

  buildTableBody(data, columns) {
    var body = [];
    body.push(columns);
    data.forEach(function (row) {
      var dataRow = [];
      columns.forEach((column) => dataRow.push(row[column].toString()));
      body.push(dataRow);
    });
    return body;
  }

  observationPDF(data) {
    return {
      margin: [0, 20],
      table: {
        widths: ['*'],
        body: [
          [{ border: [true, true, true, false], text: `Observación: `, style: 'subtitulo' }],
          [{ border: [true, false, true, true], text: `${data.pre.preEntRollo_Observacion.toString().trim()}` }]
        ]
      },
      fontSize: 9,
    }
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
