import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { modelDt_OrdenFacturacion } from 'src/app/Modelo/modelDt_OrdenFacturacion';
import { modelOrdenFacturacion } from 'src/app/Modelo/modelOrdenFacturacion';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { ClientesService } from 'src/app/Servicios/Clientes/clientes.service';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { Dt_OrdenFacturacionService } from 'src/app/Servicios/Dt_OrdenFacturacion/Dt_OrdenFacturacion.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { OrdenFacturacionService } from 'src/app/Servicios/OrdenFacturacion/OrdenFacturacion.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-Orden_Facturacion',
  templateUrl: './Orden_Facturacion.component.html',
  styleUrls: ['./Orden_Facturacion.component.css'],
})

@Injectable({
  providedIn: 'root'
})

export class Orden_FacturacionComponent implements OnInit {

  storage_Id: number;
  ValidarRol: number;
  load: boolean = false;
  modoSeleccionado: boolean;
  formDataOrder: FormGroup;
  clients: Array<any> = [];
  products: Array<any> = [];
  selectedProductSaleOrder: any = [];
  @ViewChild('tableProduction') tableProduction: Table;
  @ViewChild('tableProductionSelected') tableProductionSelected: Table;
  presentations: Array<string> = [];
  production: Array<production> = [];
  productionSelected: Array<production> = [];
  consolidatedProduction: Array<production> = [];
  qtyToSend: number = 0;

  constructor(private appComponent: AppComponent,
    private frmBuilder: FormBuilder,
    private clientService: ClientesService,
    private productService: ProductoService,
    private presentationService: UnidadMedidaService,
    private productionProcessService: Produccion_ProcesosService,
    private msj: MensajesAplicacionService,
    private orderFactService: OrdenFacturacionService,
    private dtOrderFactService: Dt_OrdenFacturacionService,
    private createPDFService: CreacionPdfService,
    private invZeusService: InventarioZeusService,
    private bagproService: BagproService,) {

    this.modoSeleccionado = appComponent.temaSeleccionado;

    this.formDataOrder = this.frmBuilder.group({
      fact: [null],
      saleOrder: [null],
      idClient: [null, Validators.required],
      client: [null, Validators.required],
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
    if (this.selectedProductSaleOrder != null) {
      let idProduct: number = this.selectedProductSaleOrder.id_Producto;
      this.productionProcessService.GetAvaibleProduction(idProduct).subscribe(data => {
        this.load = true;
        let count: number = 0;
        this.production = [];
        let countProductionAvaible = data.reduce((a, b) => {
          if (!a.map(x => x.pp.numeroRollo_BagPro).includes(b.pp.numeroRollo_BagPro)) a = [...a, b];
          return a;
        }, []);
        data.forEach(dataProduction => {
          if (!this.productionSelected.filter(y => y.item == dataProduction.prod.prod_Id).map(x => x.numberProduction).includes(dataProduction.pp.numeroRollo_BagPro)) {
            this.production.push({
              saleOrder: this.formDataOrder.value.saleOrder,
              client: dataProduction.clientes.cli_Id,
              nameClient: dataProduction.clientes.cli_Nombre,
              item: dataProduction.prod.prod_Id,
              reference: dataProduction.prod.prod_Nombre,
              orderProduction: dataProduction.pp.ot,
              numberProduction: dataProduction.pp.numeroRollo_BagPro,
              quantity: dataProduction.pp.presentacion == 'Kg' ? dataProduction.pp.peso_Neto : dataProduction.pp.cantidad,
              presentation: dataProduction.pp.presentacion
            });
          }
          if (countProductionAvaible.length == this.production.length) this.production = this.changeNameProduct(this.production);
          count++;
          if (count == data.length) this.load = false;
        });
      }, error => this.msj.mensajeError(`¡No se encontró produción disponible del Item ${idProduct}!`, `Error: ${error.error.title} | Status: ${error.status}`));
    } else {
      this.selectedProductSaleOrder = null;
      this.production = [];
    }
  }

  changeNameProduct(production: Array<production>) {
    let orderProduction = production.reduce((a, b) => {
      if (!a.map(x => x.orderProduction).includes(b.orderProduction)) a = [...a, b];
      return a;
    }, []);
    orderProduction.forEach(d => {
      this.bagproService.GetOrdenDeTrabajo(d.orderProduction).subscribe(dataOrder => {
        production.filter(x => x.orderProduction == d.orderProduction).forEach(prod => {
          prod.reference = dataOrder[0].producto;
        });
      });
    });
    return production;
  }

  getPresentation() {
    let filterPresentations: Array<string> = ['Und', 'Kg', 'Paquete', 'Rollo'];
    this.presentationService.srvObtenerLista().subscribe(data => {
      this.presentations = data.filter(x => filterPresentations.includes(x.undMed_Id));
    });
  }

  getSalesOrders() {
    let saleOrder: number = this.formDataOrder.value.saleOrder;
    this.invZeusService.getPedidosXConsecutivo(saleOrder).subscribe(data => {
      this.selectedProductSaleOrder = null;
      this.products = data.filter(x => x.cant_Pendiente > 0);
      if (this.products.length > 0) this.getClientFromSaleOrder();
      else this.msj.mensajeAdvertencia(`¡El pedido #${saleOrder} no tiene cantidades pendientes!`);
    }, error => this.msj.mensajeError(`¡No se encontró información del pedido consultado!`, `Error: ${error.error.title} | Status: ${error.status}`));
  }

  getClientFromSaleOrder() {
    let idthird: string = this.products[0].id_Cliente;
    this.invZeusService.getClientByIdThird(idthird).subscribe(data => {
      data.forEach(cli => {
        this.formDataOrder.patchValue({
          idClient: cli.idtercero,
          client: cli.razoncial,
        });
      });
    }, error => this.msj.mensajeError(`¡No se encontró información del cliente asociado al pedido!`, `Error: ${error.error.title} | Status: ${error.status}`));
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
      let countProductionAvaible = data.reduce((a, b) => {
        if (!a.map(x => x.pp.numeroRollo_BagPro).includes(b.pp.numeroRollo_BagPro)) a = [...a, b];
        return a;
      }, []);
      data.forEach(dataProduction => {
        if (!this.productionSelected.map(x => x.numberProduction).includes(dataProduction.pp.numeroRollo_BagPro)) {
          this.production.push({
            saleOrder: this.formDataOrder.value.saleOrder,
            client: dataProduction.clientes.cli_Id,
            nameClient: dataProduction.clientes.cli_Nombre,
            item: dataProduction.prod.prod_Id,
            reference: dataProduction.prod.prod_Nombre,
            orderProduction: dataProduction.pp.ot,
            numberProduction: dataProduction.pp.numeroRollo_BagPro,
            quantity: dataProduction.pp.presentacion == 'Kg' ? dataProduction.pp.peso_Neto : dataProduction.pp.cantidad,
            presentation: dataProduction.pp.presentacion
          });
        }
        if (countProductionAvaible.length == this.production.length) {
          this.load = false;
          this.production = this.changeNameProduct(this.production);
        }
      });
    }, error => this.msj.mensajeError(error));
  }

  searchProductionFromBagPro() {
    let idProduct: number = this.formDataOrder.value.item;
    this.dtOrderFactService.GetNotAvaibleProduction().subscribe(notAvaible => {
      this.bagproService.getAvaibleProduction(idProduct.toString(), notAvaible).subscribe(data => {
        data.forEach(dataProduction => {
          if (!this.productionSelected.map(x => x.numberProduction).includes(dataProduction.item)) {
            this.production.push({
              saleOrder: this.formDataOrder.value.saleOrder,
              item: dataProduction.item,
              reference: dataProduction.reference,
              numberProduction: dataProduction.numberProduction,
              quantity: dataProduction.quantity,
              presentation: dataProduction.presentation
            });
          }
        });
      });
    });
  }

  selectByQuantity() {
    this.load = true;
    let finalArray: Array<production> = [];
    let sumQuantity: number = 0;
    let totalQuantity: number = this.totalProduccionSearched();
    this.production.sort((a,b) => Number(a.numberProduction) - Number(b.numberProduction));
    if (totalQuantity > 0) {
      if (totalQuantity >= this.qtyToSend) {
        this.production.forEach(d => {
          if (sumQuantity < this.qtyToSend) {
            finalArray.push(d);
            sumQuantity += d.quantity;
          }
        });
        this.productionSelected = [this.productionSelected, finalArray].reduce((a,b) => a.concat(b));
        finalArray.forEach(d => {
          setTimeout(() => this.selectedProduction(d), 500);
        });
      } else {
        this.load = false;
        this.msj.mensajeError(`¡La cantidad digitada es superior a la cantidad disponible!`);
      }
    } else {
      this.load = false;
      this.msj.mensajeError(`¡Debe haber seleccionado un item!`);
    }
  }

  selectByFilters() {
    this.load = true;
    let data = this.tableProduction.filteredValue ? this.tableProduction.filteredValue : this.tableProduction.value;
    this.productionSelected = [this.productionSelected, data].reduce((a,b) => a.concat(b));
    if (!this.tableProduction.filteredValue) this.production = [];
    else {
      data.forEach(d => {
        let index = this.production.findIndex(x => x.numberProduction == d.numberProduction);
        this.production.splice(index, 1);
      });
      this.productionSelected.sort((a,b) => Number(b.numberProduction) - Number(a.numberProduction));
    }
    setTimeout(() => this.load = false, 5);
  }

  deselectByFilters() {
    this.load = true;
    let data = this.tableProductionSelected.filteredValue ? this.tableProductionSelected.filteredValue : this.tableProductionSelected.value;
    this.production = [this.production, data].reduce((a,b) => a.concat(b));
    if (!this.tableProductionSelected.filteredValue) this.productionSelected = [];
    else {
      data.forEach(d => {
        let index = this.productionSelected.findIndex(x => x.numberProduction == d.numberProduction);
        this.productionSelected.splice(index, 1);
      });
      this.production.sort((a,b) => Number(a.numberProduction) - Number(b.numberProduction));
    }
    setTimeout(() => this.load = false, 5);
  }

  selectedProduction(production: production) {
    this.load = true;
    let index = this.production.findIndex(x => x.numberProduction == production.numberProduction);
    this.production.splice(index, 1);
    this.productionSelected.sort((a,b) => Number(b.numberProduction) - Number(a.numberProduction));
    this.getConsolidateProduction();
    setTimeout(() => this.load = false, 5);
  }

  deselectedProduction(production: production) {
    this.load = true;
    let index = this.productionSelected.findIndex(x => x.numberProduction == production.numberProduction);
    this.productionSelected.splice(index, 1);
    this.production.sort((a,b) => Number(a.numberProduction) - Number(b.numberProduction));
    this.getConsolidateProduction();
    setTimeout(() => this.load = false, 5);
  }

  selectedAllProduction() {
    this.load = true;
    this.productionSelected = this.productionSelected.concat(this.production);
    this.production = [];
    this.productionSelected.sort((a,b) => Number(b.numberProduction) - Number(a.numberProduction));
    this.getConsolidateProduction();
    setTimeout(() => this.load = false, 5);
  }

  deselectedAllProduction() {
    this.load = true;
    this.production = this.production.concat(this.productionSelected);
    this.productionSelected = [];
    this.production.sort((a,b) => Number(a.numberProduction) - Number(b.numberProduction));
    this.getConsolidateProduction();
    setTimeout(() => this.load = false, 5);
  }

  getConsolidateProduction() {
    this.consolidatedProduction = this.productionSelected.reduce((a, b) => {
      if (!a.map(x => x.item).includes(b.item)) a = [...a, b];
      return a;
    }, []);
  }

  totalProduccionSearched(): number {
    let total: number = 0;
    total = this.production.reduce((a, b) => a += b.quantity, 0);
    return total;
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
      if (this.productionSelected.length > 0) this.saveOrderFact();
      else this.msj.mensajeAdvertencia(`¡No ha seleccionado ningún rollo!`);
    } else this.msj.mensajeAdvertencia(`¡Debe ingresar todos los datos!`);
  }

  saveOrderFact() {
    this.load = true;
    let orderFact: modelOrdenFacturacion = {
      Factura: ``,
      Cli_Id: this.formDataOrder.value.idClient,
      Usua_Id: this.storage_Id,
      Fecha: moment().format('YYYY-MM-DD'),
      Hora: moment().format('HH:mm:ss'),
      Observacion: !this.formDataOrder.value.observation ? '' : (this.formDataOrder.value.observation).toUpperCase(),
      Estado_Id: 19
    }
    this.orderFactService.Post(orderFact).subscribe(data => this.saveDetailsOrderFact(data), error => this.msj.mensajeError(`¡Ocurrió un error al crear la orden de facturación!`, `Error: ${error.error.title} | Status: ${error.status}`));
  }

  saveDetailsOrderFact(data: any) {
    let count: number = 0;
    let order = data.id;
    this.productionSelected.forEach(production => {
      let dtOrderFact: modelDt_OrdenFacturacion = {
        Id_OrdenFacturacion: order,
        Numero_Rollo: production.numberProduction,
        Prod_Id: production.item,
        Cantidad: production.quantity,
        Presentacion: production.presentation,
        Consecutivo_Pedido: (production.saleOrder).toString(),
        Estado_Id: 20
      }
      this.dtOrderFactService.Post(dtOrderFact).subscribe(() => {
        count++;
        if (count == this.productionSelected.length) this.putStatusReels(order, data.factura);
      }, error => this.msj.mensajeError(`¡Ocurrió un error al crear los detalles de la orden de facturación!`, `Error: ${error.error.title} | Status: ${error.status}`));
    });
  }

  putStatusReels(order: number, fact: string) {
    this.productionProcessService.putStateForSend(order).subscribe(() => {
      this.msj.mensajeConfirmacion('Orden de Facturacion Guardada');
      this.createPDF(order, fact);
      this.clearFields();
    }, error => this.msj.mensajeError(`¡Ocurrió un error al actualizar el estado de los rollo seleccionados!`, `Error: ${error.error.title} | Status: ${error.status}`));
  }

  createPDF(id_OrderFact: number, fact: string) {
    this.dtOrderFactService.GetInformacionOrderFact(id_OrderFact).subscribe(data => {
      let title: string = `Orden de Facturación N° ${id_OrderFact}`;
      title += `${fact.length > 0 ? ` \n Factura N° ${fact}` : ''}`;
      let content: any[] = this.contentPDF(data);
      this.createPDFService.formatoPDF(title, content);
    }, error => this.msj.mensajeError(error));
  }

  contentPDF(data): any[] {
    let content: any[] = [];
    data = this.changeNameProductInPDF(data);
    let consolidatedInformation: Array<any> = this.consolidatedInformation(data);
    let informationProducts: Array<any> = this.getInformationProducts(data);
    content.push(this.informationClientPDF(data[0]));
    content.push(this.observationPDF(data[0]));
    content.push(this.tableConsolidated(consolidatedInformation));
    content.push(this.tableProducts(informationProducts));
    return content;
  }

  changeNameProductInPDF(production: Array<any>) {
    let orderProduction = production.reduce((a, b) => {
      if (!a.map(x => x.orderProduction).includes(b.orderProduction)) a = [...a, b];
      return a;
    }, []);
    orderProduction.forEach(d => {
      this.bagproService.GetOrdenDeTrabajo(d.orderProduction).subscribe(dataOrder => {
        production.filter(x => x.orderProduction == d.orderProduction).forEach(prod => {
          prod.Referencia = dataOrder[0].producto;
        });
      });
    });
    return production;
  }

  consolidatedInformation(data: any): Array<any> {
    let consolidatedInformation: Array<any> = [];
    let count: number = 0;
    data.forEach(prod => {
      if (!consolidatedInformation.map(x => x.Item).includes(prod.producto.prod_Id)) {
        count++;
        let cuontProduction: number = data.filter(x => x.producto.prod_Id == prod.producto.prod_Id).length;
        let totalQuantity: number = 0;
        data.filter(x => x.producto.prod_Id == prod.producto.prod_Id).forEach(x => totalQuantity += x.dtOrder.cantidad);
        consolidatedInformation.push({
          "#" : count,
          "Pedido": prod.dtOrder.consecutivo_Pedido,
          "Item": prod.producto.prod_Id,
          "Referencia": prod.producto.prod_Nombre,
          "Cant. Rollos": this.formatNumbers((cuontProduction)),
          "Cantidad": this.formatNumbers((totalQuantity).toFixed(2)),
          "Presentación": prod.dtOrder.presentacion
        });
      }
    });
    return consolidatedInformation;
  }

  getInformationProducts(data: any): Array<any> {
    let informationProducts: Array<any> = [];
    let count: number = 0;
    data.sort((a, b) => Number(a.dtOrder.numero_Rollo) - Number(b.dtOrder.numero_Rollo));
    data.sort((a, b) => Number(a.producto.prod_Id) - Number(b.producto.prod_Id));
    data.forEach(prod => {
      count++;
      informationProducts.push({
        "#" : count,
        "Rollo": prod.dtOrder.numero_Rollo,
        "Item": prod.producto.prod_Id,
        "Referencia": prod.producto.prod_Nombre,
        "Cantidad": this.formatNumbers((prod.dtOrder.cantidad).toFixed(2)),
        "Presentación": prod.dtOrder.presentacion,
        "Ubicación": prod.ubication == null ? '' : prod.ubication,
      });
    });
    return informationProducts;
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
          ],
          data.datosEnvio != null ? [
            { text: `Conductor: ${data.datosEnvio.conductor}` },
            { text: `Placa: ${data.datosEnvio.placa}` },
            { text: `Despachado Por: ${data.datosEnvio.creadoPor}` },
          ] : [
            { border: [false, false, false, false], colSpan: 3, text: '' }, {}, {}
          ],
          data.datosEnvio != null ? [
            { text: `Fecha de Orden: ${(data.order.fecha).replace('T00:00:00','')} ${data.order.hora}` },
            { text: `Fecha de Despacho: ${(data.datosEnvio.fecha).replace('T00:00:00','')} ${(data.datosEnvio.hora)}`, colSpan: 2 }, {}
          ] : [
            { text: `Fecha de Orden: ${(data.order.fecha).replace('T00:00:00','')} ${data.order.hora}`, colSpan: 3, }, {}, {}
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

  tableConsolidated(data) {
    let columns: Array<string> = ['#', 'Pedido', 'Item', 'Referencia', 'Cant. Rollos', 'Cantidad', 'Presentación'];
    let widths: Array<string> = ['5%', '7%', '8%', '40%', '10%', '20%', '10%'];
    return {
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
    let columns: Array<string> = ['#', 'Rollo', 'Item', 'Referencia', 'Cantidad', 'Presentación', 'Ubicación'];
    let widths: Array<string> = ['3%', '8%', '8%', '37%', '10%', '10%', '24%'];
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

  observationPDF(data) {
    return {
      margin: [0, 20],
      table: {
        widths: ['*'],
        body: [
          [{ border: [true, true, true, false], text: `Observación Orden:`, style: 'subtitulo', bold: true }],
          [{ border: [true, false, true, true], text: `${data.order.observacion.toString().trim()}` }],
          data.datosEnvio != null ?[{ border: [true, true, true, false], text: `Observación Despacho:`, style: 'subtitulo', bold: true }] : [{ border: [false, false, false, false], text: '' }],
          data.datosEnvio != null ? [{ border: [true, false, true, true], text: `${data.datosEnvio.observacion.toString().trim()}` }] : [{ border: [false, false, false, false], text: '' }]
        ]
      },
      fontSize: 9,
    }
  }

}

interface production {
  saleOrder: number;
  client?: number;
  nameClient?: string;
  item: number;
  reference: string;
  orderProduction?: number;
  numberProduction?: number;
  quantity: number;
  cuontProduction?: number;
  presentation: string;
}