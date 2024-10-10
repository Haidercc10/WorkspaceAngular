import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { co } from '@fullcalendar/core/internal-common';
import { log } from 'console';
import moment from 'moment';
import { MessageService, TreeNode } from 'primeng/api';
import { Table } from 'primeng/table';
import { modelDt_OrdenFacturacion } from 'src/app/Modelo/modelDt_OrdenFacturacion';
import { modelOrdenFacturacion } from 'src/app/Modelo/modelOrdenFacturacion';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { ClientesService } from 'src/app/Servicios/Clientes/clientes.service';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { DetallesDevolucionesProductosService } from 'src/app/Servicios/DetallesDevolucionRollosFacturados/DetallesDevolucionesProductos.service';
import { Dt_OrdenFacturacionService } from 'src/app/Servicios/Dt_OrdenFacturacion/Dt_OrdenFacturacion.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { OrdenFacturacionService } from 'src/app/Servicios/OrdenFacturacion/OrdenFacturacion.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { TipoDocumentoService } from 'src/app/Servicios/TipoDocumento/tipoDocumento.service';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import { AppComponent } from 'src/app/app.component';
import { MovimientosOrdenFacturacionComponent } from '../Movimientos-OrdenFacturacion/Movimientos-OrdenFacturacion.component';
import { DevolucionesService } from 'src/app/Servicios/DevolucionMateriaPrima/devoluciones.service';
import { DevolucionesProductosService } from 'src/app/Servicios/DevolucionesRollosFacturados/DevolucionesProductos.service';
import { Detalles_PrecargueDespachoService } from 'src/app/Servicios/Detalles_PrecargueDespacho/Detalles_PrecargueDespacho.service';
import { Precargue_DespachoService } from 'src/app/Servicios/Precargue_Despacho/Precargue_Despacho.service';

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
  formItems: FormGroup;
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
  typesDoc : Array<string> = [];
  modalAddItems : boolean = false;
  productsModal : Array<any> = [];
  editOrderFact : boolean = false;
  rollSelected : any = {};
  itemSelected : any = {};
  reposition : boolean = false;
  preloadDispatch : boolean = false;
  //@ViewChild(MovimientosOrdenFacturacionComponent) movOrderFact : MovimientosOrdenFacturacionComponent;
  modalSaleOrderVsPreload : boolean = false;
  comparativeProduct : any = [];
  comparativePreload : any = [];
  @ViewChild('tablePreload') tablePreload: Table;
  @ViewChild('tableSaleOrder') tableSaleOrder: Table;
  
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
    private bagproService: BagproService,
    private svtypeDocs : TipoDocumentoService,
    private svMsg : MessageService,
    private svDevolutions : DetallesDevolucionesProductosService,
    private svHeaderDevolutions : DevolucionesProductosService,
    private movOrderFact : MovimientosOrdenFacturacionComponent,
    private svDtlPreload : Detalles_PrecargueDespachoService,
    private svPreload : Precargue_DespachoService
  ) {

    this.modoSeleccionado = appComponent.temaSeleccionado;

    this.formDataOrder = this.frmBuilder.group({
      order : [null],
      fact: [null],
      saleOrder: [null],
      idClient: [null, Validators.required],
      client: [null, Validators.required],
      observation: [null],
      typeDoc: [null], 
      preload : [null]
    });

    this.formItems = this.frmBuilder.group({
      item: [null, Validators.required],
      reference: [null, Validators.required],
      qty: [null, Validators.required],
      presentation: [null, Validators.required],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.getPresentation();
    this.getTypesDocument();
    this.getLastOrderFact();
  }

  formatNumbers = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  getLastOrderFact = () => this.orderFactService.getLastOrder().subscribe(data => { this.formDataOrder.patchValue({ 'order' : data + 1, }) }, error => { this.msj.mensajeError('Error', 'No fue posible consultar la última orden de facturación'); });

  lecturaStorage() {
    this.storage_Id = this.appComponent.storage_Id;
    this.ValidarRol = this.appComponent.storage_Rol;
  }

  clearFields(edit : boolean) {
    this.load = false;
    this.formDataOrder.reset();
    this.production = [];
    this.clients = [];
    this.products = [];
    this.productionSelected = [];
    this.consolidatedProduction = [];
    this.rollSelected = {};
    this.editOrderFact = false;
    this.selectedProductSaleOrder = null;
    if(this.reposition) {
      this.movOrderFact.searchData();
      this.movOrderFact.modalReposition = false;
    }
    this.reposition = false;
    this.movOrderFact.modalReposition = false;
    !edit ? this.getLastOrderFact() : null;
    this.preloadDispatch = false;
  }

  getClients() {
    let nameClient: string = this.formDataOrder.value.client;
    this.clientService.LikeGetCliente(nameClient).subscribe(data => this.clients = data);
  }

  getProducts() {
    if (this.selectedProductSaleOrder != null) {
      if(!this.preloadDispatch) {
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
                presentation: dataProduction.pp.presentacion,
                weight : dataProduction.pp.peso_Bruto, 
                netWeight : dataProduction.pp.peso_Neto,
                ubication : ![null, undefined, ''].includes(dataProduction.ubication) ? dataProduction.ubication : '',
                inOrder : false,
              });
            }
            if (countProductionAvaible.length == this.production.length) this.production = this.changeNameProduct(this.production);
            count++;
            if (count == data.length) this.load = false;
          });
        }, error => this.msj.mensajeError(`¡No se encontró produción disponible del Item ${idProduct}!`, `Error: ${error.error.title} | Status: ${error.status}`));
      } else this.msjsOF(`Advertencia`, `No es posible seleccionar items en una 'ORDEN DE FACTURACIÓN' por 'PRECARGUE DE DESPACHO'`)
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

  getTypesDocument = () => this.svtypeDocs.srvObtenerLista().subscribe(data => { this.typesDoc = data.filter(x => ['OF', 'REPO'].includes(x.tpDoc_Id)) },);

  //Función para validar el tipo de documento seleccionado.
  /*validateTypeDoc(){
    let typeDoc = this.formDataOrder.value.typeDoc;
    
    if(typeDoc == 'REPO') {
      this.clearFields();
      this.formDataOrder.patchValue({'saleOrder': 0, 'typeDoc' : 'REPO', });
    } else {
      this.clearFields();
      this.formDataOrder.patchValue({'saleOrder': null, 'typeDoc' : null, });
    } 
  }*/

  getPresentation() {
    let filterPresentations: Array<string> = ['Und', 'Kg', 'Paquete', 'Rollo'];
    this.presentationService.srvObtenerLista().subscribe(data => {
      this.presentations = data.filter(x => filterPresentations.includes(x.undMed_Id));
    });
  }

  getSalesOrders(info? : any) {
    let saleOrder: number = this.formDataOrder.value.saleOrder;
    
    //if ([null, undefined, ''].includes(preload)) {
      this.invZeusService.getPedidosXConsecutivo(saleOrder).subscribe(data => {
        this.selectedProductSaleOrder = null;
        this.products = data.filter(x => x.cant_Pendiente > 0);
        if (this.products.length > 0) {
          this.getClientFromSaleOrder(info);
        } else this.msj.mensajeAdvertencia(`¡El pedido #${saleOrder} no tiene cantidades pendientes!`);
      }, error => this.msj.mensajeError(`¡No se encontró información del pedido consultado!`, `Error: ${error.error.title} | Status: ${error.status}`));
    //} else this.msj.mensajeAdvertencia(`Advertencia`, `No es posible buscar pedidos en ORDENES DE FACTURACIÓN con PRECARGUE DE DESPACHO!`);
  }

  clearSomeFields(){
    this.production = [];
    this.productionSelected = [];
    this.consolidatedProduction = [];
    this.formDataOrder.patchValue({ preload : null });
    this.preloadDispatch = false;
  }

  getClientFromSaleOrder(info : any) {
    let idthird: string = this.products[0].id_Cliente;
    this.invZeusService.getClientByIdThird(idthird).subscribe(data => {
      data.forEach(cli => {
        this.formDataOrder.patchValue({
          idClient: cli.idtercero,
          client: cli.razoncial,
        });
      });
      info != null ? this.comparationSaleOrder_Preload(info) : null; //this.clearSomeFields();
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
    let idProduct: string = this.formItems.value.reference;
    let dataProduct: any = this.productsModal.find(x => x.prod.prod_Id == idProduct);
    this.formItems.patchValue({
      'item': dataProduct.prod.prod_Id,
      'reference': dataProduct.prod.prod_Nombre,
      'presentation': dataProduct.exis.undMed_Id,
    });
  }

  searchProductByItem() {
    let idProduct: number = this.formItems.value.item;
    this.productService.GetProductsById(idProduct).subscribe(data => {
      data.forEach(dataProduct => {
        this.formItems.patchValue({
          'item': dataProduct.prod.prod_Id,
          'reference': dataProduct.prod.prod_Nombre,
          'presentation': dataProduct.exis.undMed_Id
        });
      });
    });
  }

  searchProductByReference() {
    let reference: string = this.formItems.value.reference;
    if(reference.toString().length > 2) {
      this.productService.GetProductsByName(reference).subscribe(data => this.productsModal = data);
    }
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
            presentation: dataProduction.pp.presentacion, 
            weight : dataProduction.pp.peso_Bruto,
            netWeight : dataProduction.pp.peso_Neto,
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
              presentation: dataProduction.presentation, 
              weight : 0,
              netWeight : 0,
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
    !this.editOrderFact ? this.productionSelected.sort((a,b) => Number(b.numberProduction) - Number(a.numberProduction)) : this.productionSelected.sort((a, b) => +a.inOrder - +b.inOrder);
    //this.productionSelected.sort((a,b) => Number(b.numberProduction) - Number(a.numberProduction))
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

  totalWeightByProduct(item: number): number {
    let total: number = 0;
    this.productionSelected.filter(x => x.item == item).forEach(x => total += x.weight);
    return total;
  }

  totalNetWeightByProduct(item: number): number {
    let total: number = 0;
    this.productionSelected.filter(x => x.item == item).forEach(x => total += x.netWeight);
    return total;
  }

  totalQuantityByProduct(item: number): number {
    let total: number = 0;
    this.productionSelected.filter(x => x.item == item).forEach(x => total += x.quantity);
    return total;
  }

  totalTotalNetWeightProducts(): number {
    let total: number = 0;
    this.productionSelected.forEach(x => total += x.netWeight);
    return total;
  }

  totalTotalWeightProducts(): number {
    let total: number = 0;
    this.productionSelected.forEach(x => total += x.weight);
    return total;
  }

  totalTotalProducts(): number {
    let total: number = 0;
    this.productionSelected.forEach(x => total += x.quantity);
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
        if(!this.reposition) this.saveOrderFact();
        else this.validateReposition();
      } else this.msj.mensajeAdvertencia(`¡No ha seleccionado ningún rollo!`);
    } else this.msj.mensajeAdvertencia(`¡Debe ingresar todos los datos!`);
  }

  saveOrderFact() {
    if(this.reposition) this.onReject('reposition');
    this.load = true;
    let orderFact: modelOrdenFacturacion = {
      Factura: [undefined, null, ''].includes(this.formDataOrder.value.fact) ? `` : this.formDataOrder.value.fact,
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
      this.editOrderFact ? this.msj.mensajeConfirmacion(`Orden N° ${order} actualizada exitosamente!`) : this.msj.mensajeConfirmacion('Orden creada exitosamente!');
      if(this.reposition) this.updateDevolution();
      if(this.preloadDispatch) this.updateOrderPreload();
      this.createPDF(order, fact);
      this.clearFields(false);
    }, error => this.msj.mensajeError(`¡Ocurrió un error al actualizar el estado de los rollos seleccionados!`, `Error: ${error.error.title} | Status: ${error.status}`));
  }

  updateDevolution() {
    let dev : any = this.formDataOrder.value.saleOrder;
    let date : any = moment().format('YYYY-MM-DD');
    let hour : any = moment().format('HH:mm:ss');
    
    dev = dev.split('-')[0].replace('DV', '');
    console.log(dev);
    
    this.svHeaderDevolutions.PutStatusDevolution(dev, 39, date, hour, this.storage_Id, '').subscribe(data => {
    }, error => { this.msj.mensajeError(`Error`, `No fue posible actualizar la devolución`); });
  }

  updateOrderPreload(){
    let of : any = this.formDataOrder.value.order;
    let preload : any = this.formDataOrder.value.preload;
    let observation : any = this.formDataOrder.value.observation == null ? '' : this.formDataOrder.value.observation
    let updatedInfo : any = [];

    updatedInfo.push({ 'of' : of, 'user' : this.storage_Id, 'observation' : observation, 'status' : 26 });
    console.log(updatedInfo);
    
    this.svPreload.putPreloadDispatch(preload, updatedInfo).subscribe(data => {
      console.log(data);
    }, error => {
      this.msjsOF('Error', `Ocurrió un error actualizando los datos del precargue N° ${preload} | ${error.status} ${error.statusText}`);
    });
  }

  createPDF(id_OrderFact: number, fact: string) {
    this.dtOrderFactService.GetInformacionOrderFact(id_OrderFact).subscribe(data => {
      let saleOrder : string = `${data[0].dtOrder.consecutivo_Pedido}`;
      let title: string = saleOrder.startsWith('DV') ? `Orden de Reposición N° ${id_OrderFact}` : `Orden de Facturación N° ${id_OrderFact}`;
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
    content.push(this.tableTotals(data))
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
        let totalWeight: number = 0;
        let totalNetWeight : number = 0;
        data.filter(x => x.producto.prod_Id == prod.producto.prod_Id).forEach(x => {
          totalQuantity += x.dtOrder.cantidad,
          totalWeight += x.weight,
          totalNetWeight += x.netWeight
        }); 
        console.log(totalNetWeight);
        
        consolidatedInformation.push({
          "#" : count,
          "Pedido": prod.dtOrder.consecutivo_Pedido,
          "Item": prod.producto.prod_Id,
          "Referencia": prod.producto.prod_Nombre,
          "Rollos": this.formatNumbers((cuontProduction)),
          "Peso B.": this.formatNumbers((totalWeight).toFixed(2)),
          "Peso_Bruto": this.formatNumbers((totalWeight).toFixed(2)),
          "Peso N.": this.formatNumbers((totalNetWeight).toFixed(2)),
          "Peso_Neto": this.formatNumbers((totalNetWeight).toFixed(2)),
          "Cantidad": this.formatNumbers((totalQuantity).toFixed(2)),
          "Unidad": prod.dtOrder.presentacion
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
        "OT" : prod.orderProduction,
        "Item": prod.producto.prod_Id,
        "Referencia": prod.producto.prod_Nombre,
        "Peso" : this.formatNumbers((prod.weight).toFixed(2)),
        "Peso B." : this.formatNumbers((prod.weight).toFixed(2)),
        "Cantidad": this.formatNumbers((prod.dtOrder.cantidad).toFixed(2)),
        "Unidad": prod.dtOrder.presentacion,
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
    let columns: Array<string> = ['#', 'Pedido', 'Item', 'Referencia', 'Peso B.', 'Peso N.', 'Rollos', 'Cantidad', 'Unidad'];
    let widths: Array<string> = ['2%', '12%', '6%', '40%', '8%', '8%', '5%', '12%', '7%'];
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
    let columns: Array<string> = ['#', 'Rollo', 'OT', 'Item', 'Referencia', 'Peso'.replace('Peso', 'Peso B.'), 'Cantidad', 'Unidad', 'Ubicación'];
    let widths: Array<string> = ['3%', '7%', '7%', '7%', '38%', '6%', '8%', '7%', '17%'];
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
    body.push([{ colSpan: 9, text: title, bold: true, alignment: 'center', fontSize: 10 }, '', '', '', '', '', '', '', '']);
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

  // Tabla con totales finales. 
  tableTotals(data) {
    let qtyRolls = this.consolidatedInformation(data).reduce((a, b) => a + parseInt(b.Rollos), 0);
    let totalWeight = this.consolidatedInformation(data).reduce((a, b) => a + parseFloat(b.Peso_Bruto.replace().replace(',','')), 0); 
    let totalNetWeight = this.consolidatedInformation(data).reduce((a, b) => a + parseFloat(b.Peso_Neto.replace().replace(',','')), 0); 
    let totalQty = this.consolidatedInformation(data).reduce((a, b) => a + parseFloat(b.Cantidad.replace(',','') ), 0); 
    let units : any = [];
    
    this.consolidatedInformation(data).forEach(x => {
      if(!units.includes(x.Unidad)) {
        units.push(x.Unidad);
      } 
    });

    return {
      margin: [0, 0, 0, 0],
      fontSize: 8,
      bold: false,
      table: {
        widths: ['2%', '12%', '6%', '40%', '8%', '8%', '5%', '12%', '7%'],
        body: [
          [
            { text: ``, alignment: 'center', border: [true, false, false, true], },
            { text: ``, alignment: 'center', border: [false, false, false, true], },
            { text: ``, alignment: 'center', border: [false, false, false, true], },
            { text: `Totales`, alignment: 'right', bold : true, border: [false, false, false, true], },
            { text: `${this.formatNumbers((totalWeight).toFixed(2))}`, alignment: '', bold : true, border: [true, false, true, true], },
            { text: `${this.formatNumbers((totalNetWeight).toFixed(2))}`, alignment: '', bold : true, border: [true, false, true, true], },
            { text: `${this.formatNumbers((qtyRolls))}`, alignment: '', bold : true, border: [true, false, true, true] },
            { text: `${this.formatNumbers((totalQty).toFixed(2))}`, alignment: '', bold : true, border: [true, false, true, true], },
            { text: `${units.length == 1 ? units : ``}`, alignment: '', bold : true, border: [false, false, true, true], },
          ],
        ],
      }
    }
  }

  // ************ EDITAR ORDENES DE FACTURACIÓN ************ //

  //Función para obtener la orden de facturación
  getInfoOrderFact(){
    let of : any = this.formDataOrder.value.order;

    if(![null, undefined, 0, ''].includes(of)) {
      this.load = true;
      this.dtOrderFactService.GetInformacionOrderFact(of).subscribe(data => {
        if(data.length > 0) {
          if(![3, 21].includes(data[0].order.estado_Id)) {
            this.clearFields(true);
            this.editOrderFact = true;
            setTimeout(() => { this.loadInfoOrderFact(data); }, 500); 
          } else {
            this.msjsOF(`Advertencia`, `La orden de facturación N° ${data[0].order.id} no está disponible para editar`);
            this.clearFields(true);
          } 
        } else {
          this.msjsOF(`Advertencia`, `No se encontró información de la orden de facturación N° ${data[0].order.id}`);
          this.clearFields(true);
        } 
      }, error => {
        this.msj.mensajeError(`Error`, `No se encontró información de la orden de facturación N° ${of}`);
        this.clearFields(false);
      });
    } else {
      this.msj.mensajeAdvertencia(`Advertencia`, `Debe digitar una orden de facturación válida!`);
      this.clearFields(false);
    } 
  }

  //Función para cargar la información de la orden de facturación a editar.
  loadInfoOrderFact(data : any){
    data.forEach(x => {
      this.productionSelected.push({
        'saleOrder': x.dtOrder.consecutivo_Pedido,
        'client' : x.clientes.cli_Id, 
        'nameClient' : x.clientes.cli_Nombre,
        'item': x.producto.prod_Id,
        'reference' : x.producto.prod_Nombre,
        'orderProduction' : x.orderProduction,
        'numberProduction' : x.dtOrder.numero_Rollo,
        'quantity' : x.dtOrder.cantidad,
        'presentation' : x.dtOrder.presentacion,
        'ubication' : x.ubication,
        'weight' : x.weight,
        'inOrder' : true,
        'idDetail' : x.dtOrder.id,
        'netWeight' : x.netWeight,
      });
    });
    this.loadInfoClientOrder(data[0]);
    this.products = this.getProductsForOrderFact();
    //this.productionSelected.sort((a,b) => Number(b.numberProduction) - Number(a.numberProduction));
    this.getConsolidateProduction();
    this.load = false;
  } 

  //Función para cargar la información del cliente en la orden
  loadInfoClientOrder(data : any){
    this.formDataOrder.patchValue({ 
      'order' : data.order.id,
      'saleOrder' : data.dtOrder.consecutivo_Pedido,
      'idClient' : data.clientes.cli_Id,
      'client' : data.clientes.cli_Nombre,
      'observation' : data.order.observacion,
    });
  }

  //Función para cargar los productos de la orden
  getProductsForOrderFact() {
    let products = this.productionSelected.filter(x => x.inOrder).reduce((a : any, b : any) => {
      if(!a.map(x => x.id_Producto).includes(b.item)) {
        a.push({
          'consecutivo' : b.saleOrder,
          'id_Cliente' : b.client,
          'cliente' : b.nameClient,
          'id_Producto' : b.item,
          'producto' : b.reference,
          'cant_Pendiente' : b.quantity,
          'presentacion' : b.presentation,
        });
      } else a[a.findIndex(x => x.id_Producto == b.item)].cant_Pendiente += b.quantity;
      return a;
    }, []);
    return products;
  }

  //Función para mostrar el msj de confirmación de eliminación de rollos
  seeMsgDeleteRolls(data : any) {
    this.load = true;
    this.rollSelected = {};
    this.rollSelected = data;

    this.svMsg.add({severity:'warn', key:'deleteRoll', summary:'Elección', detail: `¿Está seguro que desea eliminar el rollo N° ${data.numberProduction} de la orden N° ${this.formDataOrder.value.order}?`, sticky: true});
  } 
  
  //Función para quitar msj de confirmación.
  onReject(key : any) {
    this.load = false;
    this.svMsg.clear(key);
  }

  //Función para eliminar rollos de la orden 
  deleteRollFromOrderFact(data : any, currentStatus : number, newStatus : number){
    this.onReject('deleteRoll');
    this.load = true;
    let index : any = this.productionSelected.findIndex(x => x.numberProduction == data.numberProduction);
    
    this.dtOrderFactService.deleteDetailOF(data.idDetail).subscribe(() => {
      let infoRoll : any = [{'roll': data.numberProduction, 'item': data.item, 'currentStatus' : currentStatus, 'newStatus' : newStatus, 'envioZeus' : true }]; 
      this.productionProcessService.putChangeStateProduction(infoRoll).subscribe(() => {
        this.msjsOF(`Confirmación`, `Rollo N° ${data.numberProduction} eliminado exitosamente de la orden N° ${this.formDataOrder.value.order}!`);
        this.productionSelected.splice(index, 1);
        this.getConsolidateProduction();
      }, error => {
        this.msjsOF(`Error`, `No fue posible actualizar el estado del rollo N° ${data.numberProduction}!`);
        this.tableProductionSelected.clear();
      });
    }, error => {
      this.msjsOF(`Error`, `Error al eliminar el rollo N° ${data.numberProduction} de la orden N° ${this.formDataOrder.value.order}`);
      this.tableProductionSelected.clear();
    });
  }

  //Función para eliminar items/rollos de la orden 
  deleteItemFromOrderFact(data : any, status : number, newStatus : number){
    this.onReject('deleteItem');
    this.load = true;
    let count : number = 0;
    let rollsItemOrder : any = this.productionSelected.filter(x => x.item == data.id_Producto && x.inOrder);
    let rollsToUpdate : any = [];
    
    rollsItemOrder.forEach(x => {
      this.dtOrderFactService.deleteDetailOF(x.idDetail).subscribe(() => {
        let indexRoll : any = this.productionSelected.findIndex(p => p.item == data.id_Producto && p.numberProduction == x.numberProduction && p.inOrder);
        rollsToUpdate.push({'roll' : x.numberProduction, 'item' : data.id_Producto, 'currentStatus' : status, 'newStatus' : newStatus, 'envioZeus' : true });
        this.productionSelected.splice(indexRoll, 1);
        count++
        if(count == rollsItemOrder.length) this.changeStatusRolls(data, rollsToUpdate);
      }, error => this.msjsOF(`Error`, `No fue posible eliminar los rollos del item ${x.item}.`));  
    });
  }

  //Función para cambiar el estado de rollos que se están sacando de la OF. 
  changeStatusRolls(data : any, rolls : any){
    let indexItem : number = this.products.findIndex(x => x.id_Producto == data.id_Producto);
    
    this.productionProcessService.putChangeStateProduction(rolls).subscribe(() => {
      this.msjsOF(`Confirmación`, `Item eliminado de la orden N° ${this.formDataOrder.value.order} exitosamente!`);
      this.products.splice(indexItem, 1);
      this.getConsolidateProduction();
    }, error => { this.msjsOF(`Error`, `No fue posible actualizar el estado de los bultos del item ${data.id_Producto}.`); });
  }

  //Función que editará la orden de facturación. 
  editOrder(){
    let of : any = this.formDataOrder.value.order;
    let qtyProductionSelected : number = this.productionSelected.filter(x => !x.inOrder).length; 
    this.selectedProductSaleOrder = null;
    this.load = true;
    
    this.orderFactService.getId(of).subscribe(dataOF => {
      if(qtyProductionSelected > 0) this.addRollsToOrderFact(dataOF);
      else {
        this.msj.mensajeConfirmacion(`Confirmación`, `Orden N° ${of} actualizada con éxito!`);
        this.createPDF(dataOF.id, dataOF.factura);
        this.clearFields(false);
      }
    }, error => { this.msjsOF(`Error`, `No se pudo consultar la orden de facturación N° ${of}`); });
  }

  //Función para insertar rollos a la orden de facturación luego de presionar el boton editar
  addRollsToOrderFact(dataOrder : any){
    this.selectedProductSaleOrder = null;
    let count : number = 0; 
    this.productionSelected.filter(x => !x.inOrder).forEach(x => {
      let detailOF : modelDt_OrdenFacturacion = {
        'Id_OrdenFacturacion': dataOrder.id,
        'Numero_Rollo': x.numberProduction,
        'Prod_Id': x.item,
        'Cantidad': x.quantity,
        'Presentacion': x.presentation,
        'Consecutivo_Pedido': (x.saleOrder).toString(),
        'Estado_Id': 20
      }
      this.dtOrderFactService.Post(detailOF).subscribe(data => {
        count++;
        if(count == this.productionSelected.filter(x => !x.inOrder).length) this.updateStatusRollsAdd(dataOrder.id, dataOrder.factura);
      }, error => { this.msjsOF(`Error`, `No fue posible agregar rollos/bultos en la orden N° ${this.formDataOrder.value.order}`); });
    });  
  }

  //Actualizar el estado de los bultos agregados a la orden de facturación.
  updateStatusRollsAdd(order : any, fact : string){
    let production : any = this.productionSelected.filter(x => !x.inOrder);
    let rolls : any = [];

    production.forEach(x => { rolls.push({'roll' : x.numberProduction, 'item' : x.item, 'currentStatus' : 19, 'newStatus' : 20, 'envioZeus' : true }); }); 
    this.productionProcessService.putChangeStateProduction(rolls).subscribe(() => { 
      this.msj.mensajeConfirmacion(`Confirmación`, `Orden N° ${order} actualizada con éxito!`);
      if(this.reposition) this.updateDevolution();
      this.createPDF(order, fact);
      this.clearFields(false); 
    }, error => { 
      this.msj.mensajeError(`Error`, `No fue posible actualizar el estado de los bultos.`); 
      this.load = false;
    });

  }

  //Validar el último rollo de la orden de facturación 
  validateLastRollOfItem = (item : any) => this.productionSelected.filter(x => x.item == item).length;

  //Función que mostrará un msj de confirmación para eliminación de items en la OF.
  seeMsjDeleteItem(item : any){
    this.load = true;
    this.itemSelected = {};
    this.itemSelected = item;

    this.svMsg.add({ severity:'warn', key:'deleteItem', summary: `Se eliminará el item ${item.id_Producto} de la orden N° ${this.formDataOrder.value.order}`, detail: `¿Los rollos/bultos seleccionados del item volverán al inventario de despacho?`, sticky: true});
  }

  //Acortar msjs en la edición de OF.
  msjsOF(msj1 : string, msj2 : string) {
    this.load = false;
    switch (msj1) {
      case 'Confirmación' :
        return this.msj.mensajeConfirmacion(msj1, msj2);
      case 'Advertencia' : 
        return this.msj.mensajeAdvertencia(msj1, msj2);
      case 'Error' : 
        return this.msj.mensajeError(msj1, msj2);
      default :
        return this.msj.mensajeAdvertencia(`No hay un tipo de mensaje asociado!`); 
    }
  }

  //ORDEN DE FACTURACIÓN POR REPOSICIÓN
  //Función para cargar info de la devolución a reponer
  loadInfoForDevolution(devId : number){
    this.load = true;
    this.reposition = true;
    this.svDevolutions.GetInformationDevById(devId).subscribe(data => {
      this.loadInfoHeaderReposition(data);
      this.getProductsReposition(data);
      this.load = false;
    }, error => {
      this.msjsOF(`Error`, `No fue posible consultar la devolución N° ${devId}! \n${error}`)
    });
  }

  //Función para cargar los campos de OF en base a los datos de la devolución 
  loadInfoHeaderReposition(data : any){
    this.formDataOrder.patchValue({
      'fact' : data[0].dev.facturaVta_Id,
      'saleOrder' : `DV${data[0].dev.devProdFact_Id}-OF${data[0].dev.id_OrdenFact}`,
      'idClient' : data[0].cliente.cli_Id,
      'client' : data[0].cliente.cli_Nombre,
      'observation' : `REPOSICIÓN POR: ${data[0].dtDev.falla}`,
      'typeDoc' : 'REPO',
    });
  }

  //Función para cargar los productos de la devolución que serán repuestos. 
  getProductsReposition(data : any) {
    this.products = data.reduce((a : any, b : any) => {
      console.log(b);
      if(!a.map(x => x.id_Producto).includes(b.prod.prod_Id)) {
        a.push({
          'consecutivo' : `DV${data[0].dev.devProdFact_Id}-OF${data[0].dev.id_OrdenFact}`,
          'id_Cliente' : b.cliente.cli_Id,
          'cliente' : b.cliente.cli_Nombre,
          'id_Producto' : b.prod.prod_Id,
          'producto' : b.prod.prod_Nombre,
          'cant_Pendiente' : b.dtDev.cantidad,
          'presentacion' : b.dtDev.presentacion,
        });
      } else a[a.findIndex(x => x.id_Producto == b.prod.prod_Id)].cant_Pendiente += b.dtDev.cantidad;
      console.log(a);
      return a;
    }, []);
  }

  //Función para cargar un item, si la devolución es por envio de item erroneo.
  addItemForReposition(){
    if(!this.products.map(x => x.id_Producto).includes(this.formItems.value.item)) {
      this.modalAddItems = false;
      this.load = true;
      this.products.push({
        'consecutivo' : this.formDataOrder.value.saleOrder,
        'id_Cliente' : this.formDataOrder.value.idClient,
        'cliente' : this.formDataOrder.value.client,
        'id_Producto' : this.formItems.value.item,
        'producto' : this.formItems.value.reference, 
        'cant_Pendiente' : this.formItems.value.qty,
        'presentacion' : this.formItems.value.presentation,
      });
      setTimeout(() => { 
        this.msjsOF(`Confirmación`, `Item ${this.formItems.value.item} - ${this.formItems.value.reference} agregado exitosamente!`);
        this.formItems.reset(); 
      }, 200); 
    } else this.msjsOF(`Advertencia`, `El item ${this.formItems.value.item} - ${this.formItems.value.reference} ya se encuentra cargado en la orden!`)
  }

  //Función que validará o no la creación de la OF por reposición.
  validateReposition() {
    console.log('1');
    let count : number = 0;
    this.load = true;
    let summary : string = `Algunas cantidades a reponer son mayores a las cantidades devueltas.`;
    let detail : string = `¿Está seguro que desea realizar la reposición?`;

    this.products.forEach(p => {
      let qty : number = 0;
      this.productionSelected.forEach(x => {
        if(x.item == p.id_Producto) {
          qty += x.quantity;
          if(qty > p.cant_Pendiente) count++; 
        }
      });
    });
    (count > 0) ? this.svMsg.add({ severity:'warn', key:'reposition', summary: summary, detail: detail, sticky: true}) : this.saveOrderFact();
  }

  //* PRECARGUE DE DESPACHO
  getPreloadForId(){
    let preload : number = this.formDataOrder.value.preload;
    let saleOrder : number = this.formDataOrder.value.saleOrder;

    if(!this.editOrderFact) {
      if(!this.reposition) {
        if(![null, 0, undefined, ''].includes(preload)) {
          if(![null, 0, undefined, ''].includes(saleOrder)) {
            this.load = true;
            this.svDtlPreload.getPreloadId(preload).subscribe(data => {
              this.clearTables();
              this.getSalesOrders(data);
              this.load = false;
            }, error => {
              this.msjsOF(`Error`, [400, 404].includes(error.status) ? `No se encontró la orden de precargue N° ${preload} | \n${error.status} ${error.statusText}` : `No fue posible consultar la orden de despacho N° ${preload} | \n${error.status} ${error.statusText}`);
            });
          } else this.msjsOF(`Advertencia`, `Debe asociar un número de pedido!`);
        } else this.msjsOF(`Advertencia`, `El número de precargue no es válido!`);
      } else this.msjsOF(`Advertencia`, `No se pueden generar ORDENES DE REPOSICIÓN con PRECARGUE DE ROLLOS!`);
    } else this.msjsOF(`Advertencia`, `No se puede precargar una orden que está siendo editada!`);
  }

  loadTableItemsSelected(data : any, saleOrder : any){
    data.forEach(x => {
      this.productionSelected.push({
        'saleOrder': saleOrder,
        'item': x.item,
        'reference': x.reference,
        'quantity': x.quantity,
        'presentation': x.presentation,
        'weight': x.weight,
        'client' : x.idClient,
        'nameClient' : x.client,
        'orderProduction' : x.ot,
        'numberProduction' : x.roll,
        'ubication' : x.ubication,
        'netWeight' : x.netWeight,
      })
    });
    this.getConsolidateProduction();
  }

  loadInfoClientPreload(data, saleOrder){
    this.formDataOrder.patchValue({'idClient' : data[0].idClient, 'client' : data[0].client, 'preload' : data[0].movement, 'saleOrder' : saleOrder });
  }

  //! EN DES USO
  loadProductsPreload(data : any, saleOrder : any){
    this.products = data.reduce((a : any, b : any) => {
      if(!a.map(x => x.id_Producto).includes(b.item)) {
        a.push({
          'consecutivo' : saleOrder,
          'id_Cliente' : b.idClient,
          'cliente' : b.client,
          'id_Producto' : b.item,
          'producto' : b.reference,
          'cant_Pendiente' : b.qty,
          'presentacion' : b.und,
        });
      } else a[a.findIndex(x => x.id_Producto == b.item)].cant_Pendiente += b.qty;
      return a;
    }, []);
  }

  comparationSaleOrder_Preload(info : any){
    let array : any = [];
    this.comparativeProduct = [];
    this.comparativePreload = [];

    this.comparativeProduct = this.products;
    this.comparativePreload = info.reduce((a, b) => {
      if(!a.map(x => x.item).includes(b.item)) a.push(b);
      else  a[a.findIndex(x => x.item == b.item)].quantity += b.quantity;
      return a;
    }, []);

    this.products.forEach(x => {
      info.forEach(y => {
        if(x.id_Producto == y.item) {
          if(!array.includes(y.item)) array.push(y.item);
        }
      });
    });
    
    if(array.length == this.products.length) {
      this.msj.mensajeConfirmacion(`Confirmación`, `El precargue de rollos se asoció exitosamente al pedido`);
      this.preloadDispatch = true;
      this.loadInfoClientPreload(info, this.formDataOrder.value.saleOrder);
      this.loadTableItemsSelected(info, this.formDataOrder.value.saleOrder);
    } else {
      this.clearTables();
      this.msj.mensajeAdvertencia(`Advertencia`, `Existen diferencias entre el pedido y el precargue consultados, verifique!`);
      setTimeout(() => { this.modalSaleOrderVsPreload = true; }, 1500); 
    } 
  }

  clearTables(){
    this.preloadDispatch = false;
    this.formDataOrder.patchValue({'idClient' : null, 'client' : null, });
    this.productionSelected = [];
    this.production = [];
    this.products = [];
    this.consolidatedProduction = [];
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
  weight : number;
  ubication? : string;
  inOrder? : boolean, 
  idDetail? : number;
  netWeight : number;
}


