import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import moment from 'moment';
import { Table } from 'primeng/table';
import { CreacionExcelService } from 'src/app/Servicios/CreacionExcel/CreacionExcel.service';
import { ExistenciasProductosService } from 'src/app/Servicios/ExistenciasProductos/existencias-productos.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { AppComponent } from 'src/app/app.component';
import { Recetas_ProductosComponent } from '../Recetas_Productos/Recetas_Productos.component';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { MessageService } from 'primeng/api';
import { Movimientos_RollosComponent } from '../Movimientos_Rollos/Movimientos_Rollos.component';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-Inventario-Productos-PBDD',
  templateUrl: './Inventario-Productos-PBDD.component.html',
  styleUrls: ['./Inventario-Productos-PBDD.component.css']
})

export class InventarioProductosPBDDComponent implements OnInit {

  load: boolean = false;
  storage_Id: number;
  storage_Nombre: string;
  ValidarRol: number;
  modoSeleccionado: boolean = false;
  columns: Array<Columns> = [];
  selectedColumns: Array<Columns> = [];
  selectedColumnsComparative: Array<Columns> = [];
  expandedRows: {} = {};
  expandedRows2: {} = {};
  stockInformation_Kg: Array<StockInformation> = [];
  stockInformation_UndPaq: Array<StockInformation> = [];
  stockInformation: Array<StockInformation> = [];
  @ViewChild('tableStock') tableStock: Table | undefined;
  @ViewChild('tableStock_Kg') tableStock_Kg: Table | undefined;
  @ViewChild('tableStock_UndPaq') tableStock_UndPaq: Table | undefined;
  @ViewChild('tableStockEmp') tableStockEmp: Table | undefined;
  @ViewChild('tableStockSella') tableStockSella: Table | undefined;
  @ViewChild('tableStockExt') tableStockExt: Table | undefined;
  @ViewChild('comparativeTable') comparativeTable: Table | undefined;
  @ViewChild('tableStockDelivered_NoAvaible') tableStockDelivered_NoAvaible: Table | undefined;
  recetaProducto: boolean = false;
  @ViewChild(Recetas_ProductosComponent) recetas_ProductosComponent: Recetas_ProductosComponent | undefined;
  stockEmpaque: Array<StockInformation> = [];
  stockSellado: Array<StockInformation> = [];
  stockExtrusion: Array<StockInformation> = [];
  comparativeStock: Array<StockInformation> = [];
  stockDelivered_NoAvaible: Array<StockInformation> = [];
  @ViewChild('tableRollsEmpaque') tableRollsEmpaque: Table | undefined;
  @ViewChild('tableRollsSellado') tableRollsSellado: Table | undefined;
  rollsAvailablesSellado: Array<any> = [];
  rollsAvailablesEmpaque: Array<any> = [];
  totalEmpaque: number = 0;
  totalSellado: number = 0;
  totalQtyEmpaque: number = 0;
  totalQtySellado: number = 0;
  loading: boolean = false;
  indexTab: number = 0;
  stateOptions: any[] = [{ value: 'off', icon: 'pi pi-table', title: 'Contraer filas' }, { value: 'on', icon: 'pi pi-list', title: 'Desplegar filas' }];
  value: string = 'off';
  itemSelected: any = {};
  @ViewChild('tableDetails1') tableDetails1: Table | undefined;
  @ViewChild('tableExpInvEmpaque') tableExpInvEmpaque: Table | undefined;
  @ViewChild('tableExpInvSellado') tableExpInvSellado: Table | undefined;
  tabStockEmpaque: boolean = false;
  tabStockSellado: boolean = false;
  tabStockExtrusion: boolean = false;
  tabStockKg: boolean = false;
  tabStockBulto: boolean = false;
  tabStockComparative: boolean = false;
  loaded: boolean = true;
  @ViewChild('tableQuality') tableQuality: Table | undefined;
  stockQuality: Array<StockInformation> = [];
  @ViewChild('tableRepacking') tableRepacking: Table | undefined;
  stockRepacking: Array<StockInformation> = [];
  totalRepack: number = 0;
  totalQuality: number = 0;
  totalQtyRepack: number = 0;
  totalQtyQuality: number = 0;
  traceability: boolean = false;
  selectedRoll: any = null;
  @ViewChild(Movimientos_RollosComponent) cmpMovRolls: Movimientos_RollosComponent;

  constructor(private appComponent: AppComponent,
    private msg: MensajesAplicacionService,
    private stockService: ExistenciasProductosService,
    private createExcelService: CreacionExcelService,
    private svProductionProcess: Produccion_ProcesosService,
    private svInvZeus: InventarioZeusService,
    private svMsg: MessageService,
  ) {
    this.modoSeleccionado = this.appComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.lecturaStorage();
    if ([86, 4].includes(this.ValidarRol)) {
      this.loadRollsProductionAvailable();
    }
    this.loadRollsQuality();
    this.loadRollsForRepack();
    //this.getStockInformation();
    //this.loadRollsProductionAvailable();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage() {
    this.storage_Id = this.appComponent.storage_Id;
    this.storage_Nombre = this.appComponent.storage_Nombre;
    this.ValidarRol = this.appComponent.storage_Rol;
  }

  fillColumns() {
    this.columns = [
      { header: 'Item', field: 'item', type: '', },
      { header: 'Cliente', field: 'client', type: '' },
      { header: 'Referencia', field: 'reference', type: '' },
      { header: 'Dias en Inventario', field: 'daysOnInv', type: '', },
      { header: 'Existencia', field: 'stock', type: 'number' },
      { header: 'Área', field: 'stockInProcess', type: 'number' },
      { header: 'Exis. Total', field: 'totalStock', type: 'number' },
      { header: 'Precio', field: 'price', type: 'number' },
      { header: 'Und', field: 'presentation', type: '' },
      { header: 'SubTotal', field: 'subTotal', type: 'number' },
      { header: 'Vendedor', field: 'seller', type: '' },
      { header: 'Ciudad', field: 'cityClient', type: '' },
      { header: 'Cant. Estandar', field: 'qtyStandard', type: 'number' },
      { header: 'Peso Bruto', field: 'weight', type: 'number' },
      { header: 'Unidades Producto', field: 'unityProducts', type: '' },

      /*{ header: 'Mes Actual', field: 'actualMonth', type: 'number' },
      { header: 'Enero', field: 'junuary', type: 'number' },
      { header: 'Febrero', field: 'february', type: 'number' },
      { header: 'Marzo', field: 'march', type: 'number' },
      { header: 'Abril', field: 'april', type: 'number' },
      { header: 'Mayo', field: 'may', type: 'number' },
      { header: 'Junio', field: 'june', type: 'number' },
      { header: 'Julio', field: 'july', type: 'number' },
      { header: 'Agosto', field: 'august', type: 'number' },
      { header: 'Septiembre', field: 'september', type: 'number' },
      { header: 'Octubre', field: 'october', type: 'number' },
      { header: 'Noviembre', field: 'november', type: 'number' },
      { header: 'Diciembre', field: 'december', type: 'number' },*/
    ];
    /*if([86,4].includes(this.ValidarRol)) {
      let cols : any = [];
      cols.push(this.columns[4], this.columns[5]);
      [4,5,6,8].forEach(x => this.columns.splice(x, 1));
      this.columns.splice(8, 12);
      this.columns.splice(4, 1);
      this.selectedColumns = [...this.columns];
      this.selectedColumnsComparative = [...this.columns];
      this.selectedColumnsComparative.splice(4, 0, cols[0], cols[1]);
    } else {*/
    this.selectedColumns = [...this.columns];
    this.selectedColumnsComparative = [...this.columns];
    //this.selectedColumnsComparative.splice(10, 13);
    //this.selectedColumns.splice(10, 13);
    this.selectedColumns.splice(5, 1);
    this.selectedColumns.splice(5, 1);
    //}
  }

  getStockInformation() {
    //if(!this.despacho) {
    let sales : string = this.ValidarRol == 2 ? `?sales=${String(this.storage_Id)}` : null;
    let salesEndPoint : string = [undefined, null].includes(sales) ? '' : sales;
    this.load = true;
    //this.despacho = true;
    this.stockService.GetStockProducts_AvaibleProduction(salesEndPoint).subscribe(data => {
      //this.getStockProcess();
      //this.getStockDeliveredNotAvaible();
      this.fillColumns();
      this.stockInformation = this.fillStockInformation(data);
      this.stockInformation = sales ? this.stockInformation.filter(stock => stock.seller == this.storage_Nombre) : this.stockInformation;
      this.fillComparativeStock(data, true);
      //this.stockInformation_Kg = this.stockInformation.filter(stock => stock.presentation == 'Kg');
      //this.stockInformation_UndPaq = this.stockInformation.filter(stock => ['Und', 'Paquete'].includes(stock.presentation));
      //this.stockInformation.forEach((stock) => this.expandedRows[stock.item] = true);
      //this.loadRollsProductionAvailable();
      this.load = false;
    });
    //}
  }

  getStockProcessSellado() {
    if (!this.tabStockSellado) {
      this.loading = true
      this.stockService.GetStockProducts_Process('SELLA').subscribe(data => {
        this.tabStockSellado = true;
        this.stockSellado = this.fillStockInformation(data, 'SELLA');
        this.fillComparativeStock(data, false);
        this.loading = false;
      });
    }
  }

  getStockProcessExtrusion() {
    if (!this.tabStockExtrusion) {
      this.loading = true
      this.stockService.GetStockProducts_Process('EXT').subscribe(data => {
        this.tabStockExtrusion = true;
        this.stockExtrusion = this.fillStockInformation(data, 'EXT');
        this.fillComparativeStock(data, false);
        this.loading = false;
      });
    }
  }

  getStockProcessEmpaque() {
    if (!this.tabStockEmpaque) {
      this.loading = true
      this.stockService.GetStockProducts_Process('EMP').subscribe(data => {
        this.tabStockEmpaque = true;
        this.stockEmpaque = this.fillStockInformation(data, 'EMP');
        this.fillComparativeStock(data, false);
        this.loading = false;
      });
    }
  }

  getStockInformationKg() {
    if (!this.tabStockKg) {
      this.loading = true
      this.tabStockKg = true;
      this.stockInformation_Kg = this.stockInformation.filter(stock => stock.presentation == 'Kg');
      this.loading = false
    }
  }

  getStockInformationBulto() {
    if (!this.tabStockBulto) {
      this.loading = true;
      this.tabStockBulto = true;
      this.stockInformation_UndPaq = this.stockInformation.filter(stock => ['Und', 'Paquete'].includes(stock.presentation));
      this.loading = false;
    }
  }

  getStockDeliveredNotAvaible() {
    this.stockService.GetStockDelivered_NoAvaible().subscribe(data => {
      this.stockDelivered_NoAvaible = this.fillStockInformation(data);
      this.fillComparativeStock(data, false);
    });
  }

  fillStockInformation(data: any, process?: string): Array<StockInformation> {
    let stockInformation: Array<StockInformation> = [];
    data.forEach(stock => {
      if (!stockInformation.map(x => x.item).includes(stock.product.item)) {
        stockInformation.push({
          item: stock.product.item,
          reference: stock.product.reference,
          client: stock.client,
          stock: stock.stock.stock,
          price: this.ValidarRol === 2 ? 0 : stock.stock.price,
          presentation: stock.stock.presentation,
          // subTotal: stock.stock.stockPrice,
          subTotal: this.ValidarRol === 2 ? 0 : (stock.stock.stock * stock.stock.price),
          daysOnInv: moment().diff(moment(stock.date), 'days'),
          seller: stock.seller,
          cityClient: stock.cityClient,
          weight: stock.weight,
          qtyStandard: stock.qtyStandard,
          unityProducts: stock.count,
          AvaibleProdution: [], // this.fillAvaibleProduction(stock.avaible_Production),
          /*actualMonth: (stock.stock_MonthByMonth).length == 0 ? 0 : this.fillActualMonth(stock.stock_MonthByMonth[0]),
          junuary: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].enero,
          february: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].febrero,
          march: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].marzo,
          april: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].abril,
          may: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].mayo,
          june: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].junio,
          july: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].julio,
          august: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].agosto,
          september: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].septiembre,
          october: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].octubre,
          november: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].noviembre,
          december: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].diciembre,*/
          process: process,
        });
      }
    });
    return stockInformation;
  }

  fillAvaibleProduction(data: any): Array<AvaibleProdution> {
    console.log(data);
    let AvaibleProdution: Array<AvaibleProdution> = [];
    data.forEach(stock => {
      AvaibleProdution.push({
        NumberProduction: stock.number_BagPro,
        Quantity: stock.quantity,
        Weight: stock.weight,
        Presentation: stock.presentation,
        Process: stock.process,
        Date: stock.date,
        Hour: stock.hour,
        Price: stock.sellPrice,
        Turn: stock.turn.turno_Nombre,
        Information: stock.information,
        orderProduction: stock.orderProduction,
        client: stock.client,
      });
    });
    return AvaibleProdution;
  }

  groupInfoAvailableByOt(data) {
    let info: any = this.fillAvaibleProduction(data).reduce((a, b) => {
      if (!a.map(x => x.orderProduction).includes(b.orderProduction)) a = [...a, b];
      return a;
    }, [])
    return info;
  }

  fillActualMonth(data: any): number {
    let month: number = moment().month();
    const stockMonths = {
      "0": data.enero,
      "1": data.febrero,
      "2": data.marzo,
      "3": data.abril,
      "4": data.mayo,
      "5": data.junio,
      "6": data.julio,
      "7": data.agosto,
      "8": data.septiembre,
      "9": data.octubre,
      "10": data.novimebre,
      "11": data.diciembre,
    }
    return stockMonths[month];
  }

  fillComparativeStock(data: any, avaible: boolean) {
    data.forEach(stock => {
      if (!this.comparativeStock.map(x => x.item).includes(stock.product.item)) {
        this.comparativeStock.push({
          item: stock.product.item,
          reference: stock.product.reference,
          client: stock.client,
          stock: avaible ? stock.stock.stock : 0,
          stockInProcess: !avaible ? stock.stock.stock : 0,
          totalStock: stock.stock.stock,
          price: stock.stock.price,
          presentation: stock.stock.presentation,
          subTotal: (stock.stock.stock * stock.stock.price),
          daysOnInv: moment().diff(moment(stock.date), 'days'),
          seller: stock.seller,
          cityClient: stock.cityClient,
          weight: stock.weight,
          qtyStandard: stock.qtyStandard,
          unityProducts: stock.count,
          AvaibleProdution: [], //this.fillAvaibleProduction(stock.avaible_Production),
          /*actualMonth: (stock.stock_MonthByMonth).length == 0 ? 0 : this.fillActualMonth(stock.stock_MonthByMonth[0]),
          junuary: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].enero,
          february: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].febrero,
          march: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].marzo,
          april: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].abril,
          may: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].mayo,
          june: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].junio,
          july: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].julio,
          august: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].agosto,
          september: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].septiembre,
          october: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].octubre,
          november: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].noviembre,
          december: (stock.stock_MonthByMonth).length == 0 ? 0 : stock.stock_MonthByMonth[0].diciembre,*/
        });
      } else {
        let i: number = this.comparativeStock.findIndex(x => x.item == stock.product.item);
        this.comparativeStock[i].stock += avaible ? stock.stock.stock : 0;
        this.comparativeStock[i].stockInProcess += !avaible ? stock.stock.stock : 0;
        this.comparativeStock[i].totalStock += stock.stock.stock;
        this.comparativeStock[i].subTotal += (stock.stock.stock * stock.stock.price);
      }
    });
  }

  apliedFilters = (data: Table, $event, campo: any) => data!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  totalStock(dataDocument: Array<StockInformation>): number {
    let total: number = 0;
    dataDocument.forEach(stock => total += stock.subTotal);
    return total;
  }

  showPopUpCreateAndEdit(data: any = "") {
    this.recetaProducto = true;
    this.recetas_ProductosComponent.limpiarTodo();
    if (data != "") {
      this.recetas_ProductosComponent.FormProductos.patchValue({ Nombre: data.Id, });
      this.recetas_ProductosComponent.buscarProductos();
      setTimeout(() => this.recetas_ProductosComponent.cambiarNombreProducto(), 500);
    }
  }

  //Función para cargar los rollos que se cargarán en cuanto se seleccione una fila 
  loadInfoRollsAvailables(data: any) {
    this.loaded = true;
    this.svProductionProcess.getRollsAvailablesForItem(data.item).subscribe(dataRolls => {
      let index: number = this.stockInformation.findIndex(x => x.item == data.item);
      this.stockInformation[index].AvaibleProdution = this.fillAvaibleProduction(dataRolls);
      this.loaded = false;
    }, error => { this.msjs(`Error`, `No se pudo obtener información del item N° ${data.item} en despacho.`); });
  }

  //Función para cargar los rollos que se cargarán en cuanto se seleccione el icono  
  loadInfoRollsInAreaSellado(data: any) {
    this.loading = true;
    let index: number = this.stockSellado.findIndex(x => x.item == data.item);
    this.svProductionProcess.getRollsInAreaForItem(data.item, data.process).subscribe(data => {
      this.stockSellado[index].AvaibleProdution = this.fillAvaibleProduction(data);
      this.loading = false;
    }, error => { this.msg.mensajeAdvertencia(`Error`, `No se pudo obtener información del item N° ${data.item} en Sellado.`); });
  }

  loadInfoRollsInAreaEmpaque(data: any) {
    this.loading = true;
    let index: number = this.stockEmpaque.findIndex(x => x.item == data.item);
    this.svProductionProcess.getRollsInAreaForItem(data.item, data.process).subscribe(data => {
      this.stockEmpaque[index].AvaibleProdution = this.fillAvaibleProduction(data);
      this.loading = false;
    }, error => { this.msg.mensajeAdvertencia(`Error`, `No se pudo obtener información del item N° ${data.item} en Empaque.`); });
  }

  loadInfoRollsInAreaExtrusion(data: any) {
    this.loading = true;
    let index: number = this.stockExtrusion.findIndex(x => x.item == data.item);
    this.svProductionProcess.getRollsInAreaForItem(data.item, data.process).subscribe(data => {
      this.stockExtrusion[index].AvaibleProdution = this.fillAvaibleProduction(data);
      this.loading = false;
    }, error => { this.msg.mensajeAdvertencia(`Error`, `No se pudo obtener información del item N° ${data.item} en Empaque.`); });
  }

  //Función para cargar los rollos que se cargarán en cuanto se seleccione una fila 
  loadInfoRollsPreDelivered(data: any) {
    this.svProductionProcess.getRollsPreDeliveredForItem(data.item).subscribe(data => {
      this.fillAvaibleProduction(data);
    }, error => {
      this.msg.mensajeAdvertencia(``, `No se pudo obtener información del item N° ${data.item}`);
    })
  }

  loadInfoComparative(data) {
    console.log(data);
    this.loaded = true;
    this.svProductionProcess.getRollsAvailables(data.item).subscribe(dataStock => {
      let index: number = this.comparativeStock.findIndex(x => x.item == data.item);
      this.comparativeStock[index].AvaibleProdution = dataStock;
      this.loaded = false;
    }, error => { this.msjs(`Error`, `No se pudo obtener información del item N° ${data.item}.`); });

  }

  //DES-USO
  //Función que mostrará un msj de confirmación para eliminación de items en la OF.
  seeMsjEditItem(data: any, roll?: any) {
    this.load = true;
    this.itemSelected = {};
    this.itemSelected = data;
    roll ? this.itemSelected.numberProduction = roll : null;
    let msg: string = ``;

    roll ? msg = `¿Está seguro que desea colocar el bulto N° ${roll} como 'NO DISPONIBLE'?` : msg = `¿Esta seguro que desea colocar todos los bultos del item '${data.item} - ${data.reference}' como 'NO DISPONIBLE'?`
    setTimeout(() => { this.svMsg.add({ severity: 'warn', key: 'item', summary: `Elección`, detail: msg, sticky: true }); }, 200);
  }

  //Función que creará un ajuste negativo en Zeus del item que se desea colocar como 'no disponible' en Plasticaribe. 
  sendAdjustmentZeus(data: any) {
    if (data != null) {
      this.onReject('item');
      this.load = true;
      let unit: string = data.presentation == 'Kg' ? 'KLS' : data.presentation == 'Und' ? 'UND' : 'PAQ';
      let qty: number = data.AvaibleProdution.reduce((a, b) => unit == 'KLS' ? a += b.Weight : a += b.Quantity, 0);
      let item: string = data.item;
      let price: string = data.price;
      let detail: string = `Ajuste desde App Plasticaribe del Item ${item} con cantidad de ${(-(qty))} ${unit}`;

      this.svInvZeus.getExistenciasProductos(data.item, unit).subscribe(dataExis => {
        if (dataExis.length == 0 || (dataExis[0].existencias < qty)) {
          let qtyZeus: number = dataExis.length == 0 ? 0 : dataExis[0].existencias;
          let message: string = `La cantidad del item a ajustar en Plasticaribe "${qty.toLocaleString()} ${unit}" es mayor al stock de Zeus "${qtyZeus.toLocaleString()} ${unit}"`
          this.msjs(`Advertencia`, message);
        } else {
          this.svProductionProcess.sendProductionToZeus(detail, item, unit, 0, (-(qty)).toString(), price).subscribe(dataAdjusment => {
            this.setItemNotAvailable(data, false);
          }, error => { this.msjs(`Error`, `No fue posible enviar el ajuste a Zeus!`); })
        }
      }, error => { this.msjs(`Error`, `No fue posible enviar el ajuste a Zeus!`); });
    } else this.msg.mensajeAdvertencia(`Advertencia`, `Debe seleccionar un item!`);
  }

  //Función que actualizará el estado de los rollos de un item a no disponible
  setItemNotAvailable(data: any, soloPlasticaribe: boolean) {
    soloPlasticaribe ? this.load = true : null;
    this.onReject('item');

    if (this.itemSelected.numberProduction) this.setRollNotAvailable(data);
    else {
      let index: number = this.stockInformation.findIndex(x => x.item == data.item);
      let rollsAvailables: any = [];
      data.AvaibleProdution.forEach(x => rollsAvailables.push({ 'roll': x.NumberProduction, 'item': data.item, }));

      this.svProductionProcess.putChangeStateProduction(rollsAvailables).subscribe(data => {
        this.stockInformation.splice(index, 1);
        this.msjs(`Confirmación`, `Se ha actualizado el stock de la referencia ${data.item - data.reference}`);
      });
    }
  }

  //Función que actualizará el estado de los rollos a no disponible
  setRollNotAvailable(data: any) {
    let indexItem: number = this.stockInformation.findIndex(x => x.item == data.item);
    let indexRoll: number = this.stockInformation[indexItem].AvaibleProdution.findIndex(x => x.NumberProduction == this.itemSelected.numberProduction)
    let roll: any = this.itemSelected.numberProduction;

    this.svProductionProcess.putChangeStateProduction([{ 'roll': roll, 'item': data.item, }]).subscribe(dataChange => {
      this.stockInformation[indexItem].AvaibleProdution.splice(indexRoll, 1);
      this.msjs(`Confirmación`, `El bulto N°${roll} ya NO ESTÁ DISPONIBLE en inventario!`);
    });
  }

  //Función que quitará el msj de elección
  onReject(key: any) {
    this.load = false;
    this.svMsg.clear(key);
  }

  //Acortar msjs de confirmación, error y adavertencia
  msjs(msj1: string, msj2: string) {
    this.load = false;
    this.loading = false;
    switch (msj1) {
      case 'Confirmación':
        return this.msg.mensajeConfirmacion(msj1, msj2);
      case 'Advertencia':
        return this.msg.mensajeAdvertencia(msj1, msj2);
      case 'Error':
        return this.msg.mensajeError(msj1, msj2);
      default:
        return this.msg.mensajeAdvertencia(`No hay un tipo de mensaje asociado!`);
    }
  }

  createExcel(dataDocument: Array<StockInformation>) {
    if (dataDocument.length > 0) {
      setTimeout(() => {
        const title = `Inventario Despacho Consolidado`;
        let font: any = { name: 'Calibri', family: 4, size: 11, bold: true };
        let border: any = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        let workbook = this.createExcelService.formatoExcel(title, true);

        this.addPageExcel(workbook, font, border, dataDocument);
        //this.createExcelService.creacionHoja(workbook, `Inventario Despacho Rollo a Rollo`, true);
        //this.addSheetExcel2(workbook, font, border, dataDocument);
        this.createExcelService.creacionExcel(`Inventario Productos Terminados ${moment().format('YYYY-MM-DD')}`, workbook);
      }, 1000);
    } else this.msg.mensajeAdvertencia(`¡No hay datos suficientes para crear el archivo de Excel!`);
  }

  addPageExcel(workbook, font, border, dataDocument: Array<StockInformation>) {
    let pageOne = workbook.worksheets[0];
    this.addHeaderPageOne(pageOne, font, border);
    pageOne.mergeCells('A1:M3');
    pageOne.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    this.addDataExcel(pageOne, dataDocument);
  }

  addHeaderPageOne(worksheet, font, border) {
    const header = ["Item", "Cliente", "Ciudad", "Referencia", "Días en Inventario", "Existencias", "Cant. Estandar", "Presentación", "Unidades Producto", "Peso Bruto Total", "Precio", "Subtotal", "Vendedor", /*"Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"*/];
    let headerRow = worksheet.addRow(header);
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } }
      cell.font = font;
      cell.border = border;
    });
  }

  addDataExcel(worksheet, dataDocument: Array<StockInformation>) {
    let dataStock = this.fillDataExcel(dataDocument);
    dataStock.forEach(d => {
      let row = worksheet.addRow(d);
      let formatNumber: number[] = [6, 7, 10, 11, 12];
      formatNumber.forEach(e => row.getCell(e).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    });
    this.changeSizeColumnsExcel(worksheet);
  }

  fillDataExcel(dataDocument: Array<StockInformation>): any[] {
    let dataStock = [];
    dataDocument.forEach(stock => {
      dataStock.push([
        stock.item,
        stock.client,
        stock.cityClient,
        stock.reference,
        stock.daysOnInv,
        stock.stock,
        stock.qtyStandard,
        stock.presentation,
        stock.unityProducts,
        stock.weight,
        stock.price,
        stock.subTotal,
        stock.seller,
        /*stock.junuary,
        stock.february,
        stock.march,
        stock.april,
        stock.may,
        stock.june,
        stock.july,
        stock.august,
        stock.september,
        stock.october,
        stock.november,
        stock.december,*/
      ]);
    });
    return dataStock;
  }

  changeSizeColumnsExcel(worksheet) {
    let size55: number[] = [2, 4, 13];
    let size20: number[] = [3, 5, 8];
    let size15: number[] = [1, 6, 7, 9, 10, 11, 12];
    size55.forEach(e => worksheet.getColumn(e).width = 55);
    size20.forEach(e => worksheet.getColumn(e).width = 20);
    size15.forEach(e => worksheet.getColumn(e).width = 15);
    worksheet.getColumn(1).width = 10;
  }

  //HOJA 2 Excel 
  //Inventario de despacho Rollo a rollo 
  addSheetExcel2(workbook, font, border, dataDocument: Array<StockInformation>) {
    let sheet2 = workbook.worksheets[1];
    this.addHeaderSheet2(sheet2, font, border);
    sheet2.mergeCells('A1:K3');
    sheet2.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    this.addDataSheet2(sheet2, dataDocument);
  }

  addHeaderSheet2(worksheet, font, border) {
    const header = ["#", "Rollo", "Item", "Cliente", "Referencia", "Existencias", "Presentación", "Precio", "Subtotal", "Vendedor", "Ubicación"];
    let headerRow = worksheet.addRow(header);
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } }
      cell.font = font;
      cell.border = border;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
  }

  addDataSheet2(worksheet, dataDocument: Array<StockInformation>) {
    let dataStock = this.fillDataSheet2Excel(dataDocument);
    dataStock.forEach(d => {
      let row = worksheet.addRow(d);
      let formatNumber: number[] = [6, 8, 9];
      formatNumber.forEach(e => row.getCell(e).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    });
    this.changeSizeColumnsSheet2Excel(worksheet);
  }

  changeSizeColumnsSheet2Excel(worksheet) {
    let size10: number[] = [1, 2, 3, 8];
    let size45: number[] = [4, 5, 10];
    let size15: number[] = [6, 7, 9];
    let size20: number[] = [11];
    size45.forEach(e => worksheet.getColumn(e).width = 45);
    size15.forEach(e => worksheet.getColumn(e).width = 15);
    size10.forEach(e => worksheet.getColumn(e).width = 10);
    size20.forEach(e => worksheet.getColumn(e).width = 20);
  }

  fillDataSheet2Excel(dataDocument: Array<StockInformation>): any[] {
    let dataStock = [];
    let count = 0;
    dataDocument.forEach(stock => {
      stock.AvaibleProdution.forEach(prod => {
        count++;
        dataStock.push([
          count,
          prod.NumberProduction,
          stock.item,
          stock.client,
          stock.reference,
          prod.Quantity,
          prod.Presentation,
          stock.price,
          (stock.price * prod.Quantity),
          stock.seller,
          prod.Information,
        ]);
      });
    });
    return dataStock;
  }

  //Función que se encarga de filtrar la información de la tabla
  applyFilter($event, campo: any, datos: Table) {
    datos!.filter(($event.target as HTMLInputElement).value, campo, 'contains');
    this.calculateTotalEmpaque();
    this.calculateTotalSellado();
    this.calculateTotalQuality();
    this.calculateTotalRepack();
  }

  //Función que se encarga de mantener expandida la información de la tabla.
  changeTab(e: any) {
    this.indexTab = e.index;
    if ([86, 4].includes(this.ValidarRol)) {
      if (this.indexTab == 1) {
        //this.getStockProcess();
        this.getStockProcessEmpaque();
        this.getStockProcessSellado();
        this.deployRows();
      } else null;
      this.indexTab == 2 ? this.getStockInformationKg() : null;
      this.indexTab == 3 ? this.getStockInformationBulto() : null;

    } else {
      this.indexTab == 1 ? this.loadRollsProductionAvailable() : null;
      this.indexTab == 2 ? this.loadRollsProductionAvailable() : null;
      this.indexTab == 5 ? this.getStockProcessExtrusion() : null;
      this.indexTab == 6 ? this.getStockInformationKg() : null;
      this.indexTab == 7 ? this.getStockInformationBulto() : null;

      if (this.indexTab == 3) {
        this.getStockProcessEmpaque();
        this.deployRows();
      } else null;
      if (this.indexTab == 4) {
        this.getStockProcessSellado();
        this.deployRows();
      } else null;

      if (this.indexTab == 8) {
        this.getStockProcessEmpaque();
        this.getStockProcessSellado();
        this.deployRows();
      } else null;
    }
  }

  //Cargar producción disponible en el area de sellado y empaque.
  loadRollsProductionAvailable() {
    this.rollsAvailablesEmpaque = [];
    this.rollsAvailablesSellado = [];
    this.loading = true;

    this.svProductionProcess.getInfoProductionAvailable().subscribe(data => {
      this.rollsAvailablesEmpaque = data.filter(x => x.process_Id == 'EMP');
      this.rollsAvailablesSellado = data.filter(x => x.process_Id == 'SELLA');
      this.calculateTotalEmpaque();
      this.calculateTotalSellado();
      this.loading = false;
    }, error => {
      this.msg.mensajeError(`Error`, `Ocurrió un error al consultar la producción disponible`);
      this.loading = false;
    });
  }

  ///.Función para cargar el estado de los rollos que están en una devolución y tienen estado devuelto (24)
  loadRollsQuality() {
    this.stockQuality = [];

    this.svProductionProcess.getRollsWarehouseQualityForItem().subscribe(data => {
      this.stockQuality = data;
      this.calculateTotalQuality();
      this.loading = false;
    }, error => {
      this.msg.mensajeError(`Error`, `Ocurrió un error al consultar la producción disponible`);
      this.loading = false;
    });
  }

  ///.Función para cargar los rollos que están en estado REEMPAQUE (45)
  loadRollsForRepack() {
    this.stockRepacking = [];

    this.svProductionProcess.getRollsForRepack().subscribe(data => {
      this.stockRepacking = data;
      this.calculateTotalRepack();
      console.log(data);
      this.loading = false;
    }, error => {
      this.msg.mensajeError(`Error`, `Ocurrió un error al consultar la producción disponible`);
      this.loading = false;
    });
  }

  /** Función que calcula el total de existencias y de valor que hay en la producción de empaque*/
  calculateTotalEmpaque() {
    setTimeout(() => {
      this.totalEmpaque = 0;
      this.totalQtyEmpaque = 0;
      if (this.tableRollsEmpaque) {
        if (this.tableRollsEmpaque.filteredValue != undefined) this.totalsForData(this.tableRollsEmpaque.filteredValue);
        else this.totalsForData(this.rollsAvailablesEmpaque);
      } else this.totalsForData(this.rollsAvailablesEmpaque);
    }, 500);
  }

  /** Función que calcula el total de existencias y de valor que hay en la producción de sellado*/
  calculateTotalSellado() {
    setTimeout(() => {
      this.totalSellado = 0;
      this.totalQtySellado = 0;
      if (this.tableRollsSellado) {
        if (this.tableRollsSellado.filteredValue != undefined) this.totalsForData(this.tableRollsSellado.filteredValue);
        else this.totalsForData(this.rollsAvailablesSellado);
      } else this.totalsForData(this.rollsAvailablesSellado);
    }, 500);
  }

  /** Función que calcula el total de existencias y de valor que hay en la bodega de calidad*/
  calculateTotalQuality() {
    setTimeout(() => {
      this.totalQuality = 0;
      this.totalQtyQuality = 0;
      if (this.tableQuality) {
        if (this.tableQuality.filteredValue != undefined) this.totalsForData(this.tableQuality.filteredValue);
        else this.totalsForDevolution(this.stockQuality);
      } else this.totalsForDevolution(this.stockQuality);
    }, 500);
  }

  /** Función que calcula el total de existencias y de valor que hay en la bodega de reempaque*/
  calculateTotalRepack() {
    setTimeout(() => {
      this.totalRepack = 0;
      this.totalQtyRepack = 0;
      if (this.tableRepacking) {
        if (this.tableRepacking.filteredValue != undefined) this.totalsForRepack(this.tableRepacking.filteredValue);
        else this.totalsForRepack(this.stockRepacking);
      } else this.totalsForRepack(this.stockRepacking);
    }, 500);
  }

  //Función para calcular los totales según la información que se le pase como parametro.
  totalsForData(data: any) {
    data.forEach(x => {
      if (x.process_Id == 'SELLA') {
        this.totalSellado += x.subtotal;
        this.totalQtySellado += x.realQty;
      } else if (x.process_Id == 'EMP') {
        this.totalEmpaque += x.subtotal;
        this.totalQtyEmpaque += x.realQty;
      }
    });
  }

  //Función para calcular los totales según la información que se le pase como parametro.
  totalsForDevolution(data: any) {
    data.forEach(x => {
      this.totalQuality += x.subtotal;
      this.totalQtyQuality += x.quantity;
    });
  }

  //Función para calcular los totales según la información que se le pase como parametro.
  totalsForRepack(data: any) {
    data.forEach(x => {
      this.totalRepack += x.subtotal;
      this.totalQtyRepack += x.quantity;
    });
  }

  /** Desplegar y contraer filas de la tabla. */
  deployRows() {
    const thisRef = this;

    if ([86].includes(this.ValidarRol)) this.indexTab == 1 && this.value == 'on' ? this.stockSellado.forEach((x) => thisRef.expandedRows[x.item] = true) : this.stockSellado.forEach((x) => thisRef.expandedRows[x.item] = false);
    else if ([4].includes(this.ValidarRol)) this.indexTab == 1 && this.value == 'on' ? this.stockEmpaque.forEach((x) => thisRef.expandedRows[x.item] = true) : this.stockEmpaque.forEach((x) => thisRef.expandedRows[x.item] = false);
    else {
      this.indexTab == 3 && this.value == 'on' ? this.stockEmpaque.forEach((x) => thisRef.expandedRows[x.item] = true) : this.stockEmpaque.forEach((x) => thisRef.expandedRows[x.item] = false);
      this.indexTab == 4 && this.value == 'on' ? this.stockSellado.forEach((x) => thisRef.expandedRows[x.item] = true) : this.stockSellado.forEach((x) => thisRef.expandedRows[x.item] = false);
    }
  }

  //EXCEL ROLLO A ROLLO.
  /** Función que se encarga de crear el archivo de Excel de la producción de empaque. */
  createExcelRollToRoll(data: any, process: string) {
    if (data.length > 0) {
      setTimeout(() => { this.loadSheetAndStyles(data, process); }, 500);
    } else this.msg.mensajeAdvertencia(`No hay datos para exportar`, `Debe haber al menos un registro en la tabla!`);
  }

  //Función que cargará la hoja de cálculo y los estilos.
  loadSheetAndStyles(data: any, process: string) {
    let title: any = `Reporte `;
    process == 'EMPAQUE' ? title += `rollo a rollo Empaque` : process == 'SELLADO' ? title += `bulto a bulto Sellado` : process == 'CALIDAD' ? title += `bodega de calidad` : title += `bodega de reempaque`;
    title += ` ${moment().format('DD-MM-YYYY')}`
    let fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } };
    let border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }, };
    let font = { name: 'Calibri', family: 4, size: 11, bold: true };
    let alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    let workbook = this.createExcelService.formatoExcel(title, true);

    this.addNewSheet(workbook, title, fill, border, font, alignment, data, process);
    this.createExcelService.creacionExcel(title, workbook);
  }

  //Función para agregar una nueva hoja de calculo.
  addNewSheet(wb: any, title: any, fill: any, border: any, font: any, alignment: any, data: any, process: string) {
    let fontTitle = { name: 'Calibri', family: 4, size: 15, bold: true };
    let worksheet: any = wb.worksheets[0];
    this.loadStyleTitle(worksheet, title, fontTitle, alignment);
    this.loadHeader(worksheet, fill, border, font, alignment);
    this.loadInfoExcel(worksheet, this.dataExcel(data, process), border, alignment);
  }

  //Cargar estilos del titulo de la hoja.
  loadStyleTitle(ws: any, title: any, fontTitle: any, alignment: any) {
    ws.getCell('A1').alignment = alignment;
    ws.getCell('A1').font = fontTitle;
    ws.getCell('A1').value = title;
  }

  //Función para cargar los titulos de el header y los estilos.
  loadHeader(ws: any, fill: any, border: any, font: any, alignment: any) {
    let rowHeader: any = ['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5', 'I5', 'J5', 'K5'];
    //ws.addRow([]);
    ws.addRow(this.loadFieldsHeader());

    rowHeader.forEach(x => ws.getCell(x).fill = fill);
    rowHeader.forEach(x => ws.getCell(x).alignment = alignment);
    rowHeader.forEach(x => ws.getCell(x).border = border);
    rowHeader.forEach(x => ws.getCell(x).font = font);
    ws.mergeCells('A1:K3');

    this.loadSizeHeader(ws);
  }

  //Función para cargar el tamaño y el alto de las columnas del header.
  loadSizeHeader(ws: any) {
    [5, 6].forEach(x => ws.getColumn(x).width = 50);
    [11].forEach(x => ws.getColumn(x).width = 30);
    [2, 3, 4].forEach(x => ws.getColumn(x).width = 10);
    [9].forEach(x => ws.getColumn(x).width = 8);
    [1].forEach(x => ws.getColumn(x).width = 5);
    [7, 8, 10,].forEach(x => ws.getColumn(x).width = 15);
  }

  //Función para cargar los nombres de las columnas del header
  loadFieldsHeader() {
    let headerRow = [
      'N°',
      'Rollo',
      'OT',
      'Item',
      'Cliente',
      'Referencia',
      'Existencias',
      'Precio',
      'Unidad',
      'Subtotal',
      'Fecha'
    ];
    return headerRow;
  }

  //Cargar información con los estilos al formato excel. 
  loadInfoExcel(ws: any, data: any, border: any, alignment: any) {
    let formatNumber: Array<number> = [7, 8, 10];
    let contador: any = 6;
    let row: any = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];

    formatNumber.forEach(x => ws.getColumn(x).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    data.forEach(x => {
      ws.addRow(x);
      row.forEach(r => {
        ws.getCell(`${r}${contador}`).border = border;
        ws.getCell(`${r}${contador}`).font = { name: 'Calibri', family: 4, size: 10 };
        ws.getCell(`${r}${contador}`).alignment = alignment;
      });
      contador++
    });
    row.forEach(r => ws.getCell(`${r}${contador - 1}`).font = { name: 'Calibri', family: 4, size: 11, bold: true, });
  }

  //Agregar fila de totales al formato excel.
  addTotal(info: any, process: string, warehouse: any) {
    info.push([
      '',
      '',
      '',
      '',
      '',
      'DISPONIBLES',
      warehouse == 'CALIDAD' ? this.totalQtyQuality : warehouse == 'REEMPAQUE' ? this.totalQtyRepack : process == 'EMP' ? this.totalQtyEmpaque : this.totalQtySellado,
      '',
      'TOTAL',
      warehouse == 'CALIDAD' ? this.totalQuality : warehouse == 'REEMPAQUE' ? this.totalRepack : process == 'EMP' ? this.totalEmpaque : this.totalSellado,
      ''
    ]);
  }

  //.Función que contendrá la info al documento excel. 
  dataExcel(data: any, process: string) {
    let info: any = [];
    let count: number = 0;
    data.forEach(x => {
      info.push([
        count += 1,
        ['CALIDAD', 'REEMPAQUE'].includes(process) ? x.number_BagPro : x.roll_BagPro,
        ['CALIDAD', 'REEMPAQUE'].includes(process) ? x.orderProduction : x.ot,
        x.item,
        x.client,
        x.reference,
        ['CALIDAD', 'REEMPAQUE'].includes(process) ? x.quantity : x.realQty,
        x.price,
        x.presentation,
        x.subtotal,
        x.date.replace('T00:00:00', ''),
      ]);
    });
    this.addTotal(info, data[0].process_Id, process);
    return info;
  }

  comparativeExcel() {
    if (this.comparativeStock.length > 0) {
      setTimeout(() => { this.loadSheetAndStyles2(this.comparativeStock); }, 500);
    } else this.msg.mensajeAdvertencia(`No hay datos para exportar`, `Debe haber al menos un registro en la tabla!`);
  }

  //Función que cargará la hoja de cálculo y los estilos.
  loadSheetAndStyles2(data: any) {
    console.log(data);
    let title: any = `Inventario comparativo de productos`;
    title += ` ${moment().format('DD-MM-YYYY')}`
    let fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } };
    let border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }, };
    let font = { name: 'Calibri', family: 4, size: 11, bold: true };
    let alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    let workbook = this.createExcelService.formatoExcel(title, true);

    this.addNewSheet2(workbook, title, fill, border, font, alignment, data);
    this.createExcelService.creacionExcel(title, workbook);
  }

  //Función para agregar una nueva hoja de calculo.
  addNewSheet2(wb: any, title: any, fill: any, border: any, font: any, alignment: any, data: any) {
    let fontTitle = { name: 'Calibri', family: 4, size: 15, bold: true };
    let worksheet: any = wb.worksheets[0];
    this.loadStyleTitle2(worksheet, title, fontTitle, alignment);
    this.loadHeader2(worksheet, fill, border, font, alignment);
    this.loadInfoExcel2(worksheet, this.dataExcel2(data), border, alignment);
  }

  //Cargar estilos del titulo de la hoja.
  loadStyleTitle2(ws: any, title: any, fontTitle: any, alignment: any) {
    ws.getCell('A1').alignment = alignment;
    ws.getCell('A1').font = fontTitle;
    ws.getCell('A1').value = title;
  }

  //Función para cargar los titulos de el header y los estilos.
  loadHeader2(ws: any, fill: any, border: any, font: any, alignment: any) {
    let rowHeader: any = ['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5', 'I5', 'J5', 'K5', 'L5', 'M5', 'N5'];
    //ws.addRow([]);
    ws.addRow(this.loadFieldsHeader2());

    rowHeader.forEach(x => ws.getCell(x).fill = fill);
    rowHeader.forEach(x => ws.getCell(x).alignment = alignment);
    rowHeader.forEach(x => ws.getCell(x).border = border);
    rowHeader.forEach(x => ws.getCell(x).font = font);
    ws.mergeCells('A1:N3');

    this.loadSizeHeader2(ws);
  }

  //Función para cargar el tamaño y el alto de las columnas del header.
  loadSizeHeader2(ws: any) {
    [5, 6, 7, 9, 10, 11, 12].forEach(x => ws.getColumn(x).width = 25);
    [3, 4, 14].forEach(x => ws.getColumn(x).width = 50);
    [1].forEach(x => ws.getColumn(x).width = 5);
    [2, 7, 8, 13].forEach(x => ws.getColumn(x).width = 15);
  }

  //Función para cargar los nombres de las columnas del header
  loadFieldsHeader2() {
    let headerRow = [
      'N°',
      'Item',
      'Cliente',
      'Referencia',
      'Días en Inventario',
      'Exist. Despacho',
      'Exist. Area',
      'Exist. Total',
      'Unidad',
      'Precio U.',
      'Valor en Despacho',
      'Valor en Producción',
      'Valor Total',
      'Vendedor'
    ];
    return headerRow;
  }

  //Cargar información con los estilos al formato excel. 
  loadInfoExcel2(ws: any, data: any, border: any, alignment: any) {
    let formatNumber: Array<number> = [6, 7, 8, 10, 11, 12, 13];
    let contador: any = 6;
    let row: any = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];

    formatNumber.forEach(x => ws.getColumn(x).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    data.forEach(x => {
      ws.addRow(x);
      row.forEach(r => {
        ws.getCell(`${r}${contador}`).border = border;
        ws.getCell(`${r}${contador}`).font = { name: 'Calibri', family: 4, size: 10 };
        ws.getCell(`${r}${contador}`).alignment = alignment;
      });
      contador++
    });
    //row.forEach(r => ws.getCell(`${r}${contador - 1}`).font = { name: 'Calibri', family: 4, size: 11, bold : true, }); 
  }

  //.Función que contendrá la info al documento excel. 
  dataExcel2(data: any) {
    let info: any = [];
    let count: number = 0;
    data.forEach(x => {
      info.push([
        count += 1,
        x.item,
        x.client,
        x.reference,
        x.daysOnInv,
        x.stock,
        x.stockInProcess,
        x.totalStock,
        x.presentation,
        x.price,
        (x.price * x.stock),
        (x.price * x.stockInProcess),
        x.price * (x.stock + x.stockInProcess),
        x.seller,
      ]);
    });
    return info;
  }

  //*Función para cargar el modal de movimientos.
  searchMovements(data: any) {
    this.load = true;
    setTimeout(() => {
      this.traceability = true;
      this.selectedRoll = data.number_BagPro;
      this.cmpMovRolls.searchMovements(data, `Producto Terminado`);
      this.load = false;
    }, 500);
  }
}

interface StockInformation {
  item: number,
  reference: string,
  client: string,
  stock: number,
  stockInProcess?: number,
  totalStock?: number,
  price: number,
  presentation: string,
  subTotal: number,
  seller: string,
  cityClient: string,
  weight: number,
  qtyStandard: number,
  unityProducts: number,
  AvaibleProdution: Array<AvaibleProdution>,
  /*actualMonth: number,
  junuary: number,
  february: number,
  march: number,
  april: number,
  may: number,
  june: number,
  july: number,
  august: number,
  september: number,
  october: number,
  november: number,
  december: number,*/
  process?: string,
  daysOnInv?: number,
}

interface AvaibleProdution {
  NumberProduction: number;
  Quantity: number,
  Weight: number,
  Presentation: string,
  Process: string,
  Date: any,
  Hour: string,
  Price: number,
  Turn: string,
  Information: string,
  orderProduction: number,
  client?: string,
  daysOnInv?: number,
}

interface Columns {
  header: string;
  field: string;
  type: string;
}
