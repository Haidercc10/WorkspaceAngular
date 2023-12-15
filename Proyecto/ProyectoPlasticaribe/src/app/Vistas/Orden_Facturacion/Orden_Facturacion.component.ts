import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { modelDt_OrdenFacturacion } from 'src/app/Modelo/modelDt_OrdenFacturacion';
import { modelOrdenFacturacion } from 'src/app/Modelo/modelOrdenFacturacion';
import { ClientesService } from 'src/app/Servicios/Clientes/clientes.service';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { Dt_OrdenFacturacionService } from 'src/app/Servicios/Dt_OrdenFacturacion/Dt_OrdenFacturacion.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { OrdenFacturacionService } from 'src/app/Servicios/OrdenFacturacion/OrdenFacturacion.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-Orden_Facturacion',
  templateUrl: './Orden_Facturacion.component.html',
  styleUrls: ['./Orden_Facturacion.component.css']
})

export class Orden_FacturacionComponent implements OnInit {

  storage_Id: number;
  ValidarRol: number;
  load: boolean = false;
  modoSeleccionado: boolean;
  formDataOrder: FormGroup;
  clients: Array<any> = [];
  products: Array<any> = [];
  presentations: Array<string> = [];
  production: Array<production> = [];
  productionSelected: Array<production> = [];
  consolidatedProduction: Array<production> = [];

  constructor(private appComponent: AppComponent,
    private frmBuilder: FormBuilder,
    private clientService: ClientesService,
    private productService: ProductoService,
    private presentationService: UnidadMedidaService,
    private productionProcessService: Produccion_ProcesosService,
    private msj: MensajesAplicacionService,
    private orderFactService: OrdenFacturacionService,
    private dtOrderFactService: Dt_OrdenFacturacionService,
    private createPDFService: CreacionPdfService) {

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
    this.getPresentation();
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
    this.clients = [];
    this.products = [];
    this.productionSelected = [];
    this.consolidatedProduction = [];
  }

  getClients() {
    let nameClient: string = this.formDataOrder.value.client;
    this.clientService.LikeGetCliente(nameClient).subscribe(data => this.clients = data);
  }

  getProducts() {
    let nameProduct: string = this.formDataOrder.value.reference;
    this.productService.GetProductsByName(nameProduct).subscribe(data => this.products = data);
  }

  getPresentation() {
    let filterPresentations: Array<string> = ['Und', 'Kg', 'Paquete', 'Rollo'];
    this.presentationService.srvObtenerLista().subscribe(data => {
      this.presentations = data.filter(x => filterPresentations.includes(x.undMed_Id));
    });
  }

  selectedClient() {
    let idClient: string = this.formDataOrder.value.client;
    let dataClient: any = this.clients.find(x => x.cli_Id == idClient);
    this.formDataOrder.patchValue({
      idClient: dataClient.cli_Id,
      client: dataClient.cli_Nombre,
    });
  }

  selectedProduct() {
    let idProduct: string = this.formDataOrder.value.reference;
    let dataProduct: any = this.products.find(x => x.prod.prod_Id == idProduct);
    this.formDataOrder.patchValue({
      item: dataProduct.prod.prod_Id,
      reference: dataProduct.prod.prod_Nombre,
      presentation: dataProduct.exis.undMed_Id
    });
    this.searchAvaibleProduction();
  }

  searchProductByItem() {
    let idProduct: number = this.formDataOrder.value.item;
    this.productService.GetProductsById(idProduct).subscribe(data => {
      data.forEach(dataProduct => {
        this.formDataOrder.patchValue({
          item: dataProduct.prod.prod_Id,
          reference: dataProduct.prod.prod_Nombre,
          presentation: dataProduct.exis.undMed_Id
        });
        this.searchAvaibleProduction();
      });
    });
  }

  searchAvaibleProduction() {
    let idProduct: number = this.formDataOrder.value.item;
    this.productionProcessService.GetAvaibleProduction(idProduct).subscribe(data => {
      this.load = true;
      this.production = [];
      data.forEach(dataProduction => {
        this.production.push({
          item: dataProduction.prod.prod_Id,
          reference: dataProduction.prod.prod_Nombre,
          numberProduction: dataProduction.pp.numero_Rollo,
          quantity: dataProduction.pp.cantidad,
          presentation: dataProduction.pp.presentacion
        });
      });
      setTimeout(() => this.load = false, 50);
    }, error => this.msj.mensajeError(error));
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
        if ((this.formDataOrder.value.fact).trim() != '') this.saveOrderFact();
        else this.msj.mensajeAdvertencia(`¡El campo 'Factura' se encuentra vacío!`);
      } else this.msj.mensajeAdvertencia(`¡No ha seleccionado ningún rollo!`);
    } else this.msj.mensajeAdvertencia(`¡Debe ingresar todos los datos!`);
  }

  saveOrderFact() {
    this.load = true;
    let orderFact: modelOrdenFacturacion = {
      Factura: this.formDataOrder.value.fact,
      Cli_Id: this.formDataOrder.value.idClient,
      Usua_Id: this.storage_Id,
      Fecha: moment().format('YYYY-MM-DD'),
      Hora: moment().format('HH:mm:ss'),
      Observacion: !this.formDataOrder.value.observation ? '' : this.formDataOrder.value.observation
    }
    this.orderFactService.Post(orderFact).subscribe(data => this.saveDetailsOrderFact(data.id));
  }

  saveDetailsOrderFact(id_OrderFact: number) {
    let count: number = 0;
    this.productionSelected.forEach(production => {
      let dtOrderFact: modelDt_OrdenFacturacion = {
        Id_OrdenFacturacion: id_OrderFact,
        Numero_Rollo: production.numberProduction,
        Prod_Id: production.item,
        Cantidad: production.quantity,
        Presentacion: production.presentation
      }
      this.dtOrderFactService.Post(dtOrderFact).subscribe(() => {
        count++;
        if (count == this.productionSelected.length) {
          this.msj.mensajeConfirmacion('Orden de Facturacion Guardada');
          this.createPDF(id_OrderFact);
          this.clearFields();
        }
      });
    });
  }

  createPDF(id_OrderFact: number) {
    this.dtOrderFactService.GetInformacionOrderFact(id_OrderFact).subscribe(data => {
      let title: string = `Orden de Facutración N° ${id_OrderFact}`;
      let content: any[] = this.contentPDF(data);
      this.createPDFService.formatoPDF(title, content);
    }, error => this.msj.mensajeError(error));
  }

  contentPDF(data): any[] {
    let content: any[] = [];
    let consolidatedInformation: Array<any> = this.consolidatedInformation(data);
    let informationProducts: Array<any> = this.getInformationProducts(data);
    content.push(this.informationClientPDF(data[0]));
    content.push(this.informationConsolidatedProducts());
    content.push(this.tableConsolidated(consolidatedInformation));
    content.push(this.informationProducts());
    content.push(this.tableProducts(informationProducts));
    return content;
  }

  consolidatedInformation(data: any): Array<any> {
    let consolidatedInformation: Array<any> = [];
    data.forEach(prod => {
      if (!consolidatedInformation.map(x => x.Item).includes(prod.producto.prod_Id)) {
        let cuontProduction: number = data.filter(x => x.producto.prod_Id == prod.producto.prod_Id).length;
        let totalQuantity: number = 0;
        data.filter(x => x.producto.prod_Id == prod.producto.prod_Id).forEach(x => totalQuantity += x.dtOrder.cantidad);
        consolidatedInformation.push({
          "Item": prod.producto.prod_Id,
          "Referencia": prod.producto.prod_Nombre,
          "Cant. Rollos": this.formatNumbers((cuontProduction).toFixed(2)),
          "Cantidad": this.formatNumbers((totalQuantity).toFixed(2)),
          "Presentación": prod.dtOrder.presentacion
        });
      }
    });
    return consolidatedInformation;
  }

  getInformationProducts(data: any): Array<any> {
    let informationProducts: Array<any> = [];
    data.forEach(prod => {
      informationProducts.push({
        "Rollo": prod.dtOrder.numero_Rollo,
        "Item": prod.producto.prod_Id,
        "Referencia": prod.producto.prod_Nombre,
        "Cantidad": this.formatNumbers((prod.dtOrder.cantidad).toFixed(2)),
        "Presentación": prod.dtOrder.presentacion,
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
            { text: `Nombre: ${data.clientes.cli_Nombre}` },
            { text: `ID: ${data.clientes.cli_Id}` },
            { text: `Tipo de ID: ${data.clientes.tipoIdentificacion_Id}` },
          ],
          [
            { text: `Telefono: ${data.clientes.cli_Telefono}` },
            { text: `E-mail: ${data.clientes.cli_Email}`, colSpan: 2 },
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

}

interface production {
  item: number;
  reference: string;
  numberProduction?: number;
  quantity: number;
  cuontProduction?: number;
  presentation: string;
}