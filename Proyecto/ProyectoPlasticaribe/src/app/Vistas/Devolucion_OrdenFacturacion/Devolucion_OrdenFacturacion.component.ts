import { Component, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { DetallesDevolucionesProductosService } from 'src/app/Servicios/DetallesDevolucionRollosFacturados/DetallesDevolucionesProductos.service';
import { DevolucionesProductosService } from 'src/app/Servicios/DevolucionesRollosFacturados/DevolucionesProductos.service';
import { Dt_OrdenFacturacionService } from 'src/app/Servicios/Dt_OrdenFacturacion/Dt_OrdenFacturacion.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-Devolucion_OrdenFacturacion',
  templateUrl: './Devolucion_OrdenFacturacion.component.html',
  styleUrls: ['./Devolucion_OrdenFacturacion.component.css']
})

@Injectable({
  providedIn: 'root'
})

export class Devolucion_OrdenFacturacionComponent implements OnInit {

  storage_Id: number;
  ValidarRol: number;
  load: boolean = false;
  modoSeleccionado: boolean;
  formDataOrder: FormGroup;
  production: Array<production> = [];
  productionSelected: Array<production> = [];
  consolidatedProduction: Array<production> = [];

  constructor(private appComponent: AppComponent,
    private frmBuilder: FormBuilder,
    private msg: MensajesAplicacionService,
    private dtOrderFactService: Dt_OrdenFacturacionService,
    private createPDFService: CreacionPdfService,
    private devService : DevolucionesProductosService,
    private dtDevService : DetallesDevolucionesProductosService,) {

    this.modoSeleccionado = appComponent.temaSeleccionado;

    this.formDataOrder = this.frmBuilder.group({
      fact: [null, Validators.required],
      idClient: [null, Validators.required],
      client: [null, Validators.required],
      item: [null, Validators.required],
      reference: [null, Validators.required],
      observation: [null]
    });
  }

  ngOnInit() {
    this.lecturaStorage();
  }

  formatNumbers = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  lecturaStorage() {
    this.storage_Id = this.appComponent.storage_Id;
    this.ValidarRol = this.appComponent.storage_Rol;
  }

  clearFields() {
    this.load = false;
    this.formDataOrder.reset();
    this.production = [];
    this.productionSelected = [];
    this.consolidatedProduction = [];
  }

  searchData(){
    let fact : any = this.formDataOrder.value.fact.trim();
    if (![null, undefined, ''].includes(fact)){
      this.dtOrderFactService.GetInformationOrderFactByFactForDevolution(fact).subscribe(data => {
        data.forEach(dataProduction => {
          this.production.push({
            item: dataProduction.producto.prod_Id,
            reference: dataProduction.producto.prod_Nombre,
            numberProduction: dataProduction.dtOrder.numero_Rollo,
            quantity: dataProduction.dtOrder.cantidad,
            presentation: dataProduction.dtOrder.presentacion
          });
          this.changeInformationFact(dataProduction);
        });
      }, error => {
        this.load = false;
        this.msg.mensajeError(error);
      });
    } else this.msg.mensajeAdvertencia('¡El valor de la factura no es valido!');
  }

  changeInformationFact(data : any){
    this.formDataOrder.patchValue({
      idClient: data.clientes.cli_Id,
      client: data.clientes.cli_Nombre,
      item: data.producto.prod_Id,
      reference: data.producto.prod_Nombre,
    });
  }

  selectedProduction(production: production) {
    this.load = true;
    let index = this.production.findIndex(x => x.numberProduction == production.numberProduction);
    this.production.splice(index, 1);
    this.getConsolidateProduction();
    setTimeout(() => this.load = false, 50);
  }

  deselectedProduction(production: production) {
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
    if (this.formDataOrder.valid) {
      if (this.productionSelected.length > 0) {
        if ((this.formDataOrder.value.fact).trim() != '') this.saveDev();
        else this.msg.mensajeAdvertencia(`¡El campo 'Factura' se encuentra vacío!`);
      } else this.msg.mensajeAdvertencia(`¡No ha seleccionado ningún rollo!`);
    } else this.msg.mensajeAdvertencia(`¡Debe ingresar todos los datos!`);
  }

  saveDev(){
    this.load = true;
    let info : any = {
      FacturaVta_Id : this.formDataOrder.value.fact,
      Cli_Id : this.formDataOrder.value.idClient,
      DevProdFact_Fecha : moment().format('YYYY-MM-DD'),
      DevProdFact_Observacion : this.formDataOrder.value.observation != null ? this.formDataOrder.value.observation : '',
      TipoDevProdFact_Id : 1,
      Usua_Id : this.storage_Id,
      DevProdFact_Hora : moment().format('H:mm:ss'),
    }
    this.devService.srvGuardar(info).subscribe(data => this.saveDetailsFact(data), () => {
      this.msg.mensajeError(`¡Ocurrió un error al crear la devolución!`);
      this.load = true;
    });
  }

  saveDetailsFact(data : any){
    let coutn : number = 0;
    this.productionSelected.forEach(prod => {
      let info : any = {
        DevProdFact_Id : data.devProdFact_Id,
        Prod_Id : prod.item,
        DtDevProdFact_Cantidad : prod.quantity,
        UndMed_Id : prod.presentation,
        Rollo_Id : prod.numberProduction,
      }
      this.dtDevService.srvGuardar(info).subscribe(() => {
        coutn++;
        if (coutn == this.productionSelected.length) this.createPDF(data.devProdFact_Id, this.formDataOrder.value.fact);
      }, () => {
        this.msg.mensajeError(`Opps...`, `¡Error al crear la devolución de rollos!`);
        this.load = false;
      });
    });
  }

  createPDF(id_OrderFact: number, fact: string) {
    this.dtDevService.GetInformationDevById(id_OrderFact).subscribe(data => {
      let title: string = `Devolución de Facutración N° ${fact}`;
      let content: any[] = this.contentPDF(data);
      this.createPDFService.formatoPDF(title, content);
      setTimeout(() => this.clearFields(), 3000);
    }, error => this.msg.mensajeError(error));
  }

  contentPDF(data): any[] {
    let content: any[] = [];
    let consolidatedInformation: Array<any> = this.consolidatedInformation(data);
    let informationProducts: Array<any> = this.getInformationProducts(data);
    content.push(this.informationClientPDF(data[0]));
    content.push(this.observationPDF(data[0]));
    content.push(this.informationConsolidatedProducts());
    content.push(this.tableConsolidated(consolidatedInformation));
    content.push(this.informationProducts());
    content.push(this.tableProducts(informationProducts));
    return content;
  }

  consolidatedInformation(data: any): Array<any> {
    let consolidatedInformation: Array<any> = [];
    data.forEach(prod => {
      if (!consolidatedInformation.map(x => x.Item).includes(prod.prod.prod_Id)) {
        let cuontProduction: number = data.filter(x => x.prod.prod_Id == prod.prod.prod_Id).length;
        let totalQuantity: number = 0;
        data.filter(x => x.prod.prod_Id == prod.prod.prod_Id).forEach(x => totalQuantity += x.dtDev.cantidad);
        consolidatedInformation.push({
          "Item": prod.prod.prod_Id,
          "Referencia": prod.prod.prod_Nombre,
          "Cant. Rollos": this.formatNumbers((cuontProduction).toFixed(2)),
          "Cantidad": this.formatNumbers((totalQuantity).toFixed(2)),
          "Presentación": prod.dtDev.presentacion
        });
      }
    });
    return consolidatedInformation;
  }

  getInformationProducts(data: any): Array<any> {
    let informationProducts: Array<any> = [];
    data.forEach(prod => {
      informationProducts.push({
        "Rollo": prod.dtDev.numero_Rollo,
        "Item": prod.prod.prod_Id,
        "Referencia": prod.prod.prod_Nombre,
        "Cantidad": this.formatNumbers((prod.dtDev.cantidad).toFixed(2)),
        "Presentación": prod.dtDev.presentacion,
      });
    });
    return informationProducts;
  }

  titleInformationClientPDF(): {} {
    return {
      text: `\n Información detallada del Cliente \n \n`,
      alignment: 'center',
      fontSize: 10,
      bold: true
    };
  }

  informationClientPDF(data): {} {
    return {
      table: {
        widths: ['50%', '20%', '30%'],
        body: [
          [
            { text: `Información detallada del Cliente`, colSpan: 3, alignment: 'center', fontSize: 10, bold: true }, {}, {}
          ],
          [
            { text: `Nombre: ${data.cliente.cli_Nombre}` },
            { text: `ID: ${data.cliente.cli_Id}` },
            { text: `Tipo de ID: ${data.cliente.tipoIdentificacion_Id}` },
          ],
          [
            { text: `Telefono: ${data.cliente.cli_Telefono}` },
            { text: `E-mail: ${data.cliente.cli_Email}`, colSpan: 2 },
            {}
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

  informationConsolidatedProducts() {
    return {
      text: `\n\n Consolidado de producto(s) \n `,
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
          [{ border: [true, false, true, true], text: `${data.dev.devProdFact_Observacion.toString().trim()}` }]
        ]
      },
      fontSize: 9,
    }
  }

}

interface production {
  item: number;
  reference: string;
  numberProduction?: number;
  quantity: number;
  cuontProduction?: number;
  presentation: string;
}