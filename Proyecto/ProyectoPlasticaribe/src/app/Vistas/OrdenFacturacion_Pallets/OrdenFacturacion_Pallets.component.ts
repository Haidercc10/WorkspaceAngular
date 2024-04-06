import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { log } from 'console';
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
  selector: 'app-OrdenFacturacion_Pallets',
  templateUrl: './OrdenFacturacion_Pallets.component.html',
  styleUrls: ['./OrdenFacturacion_Pallets.component.css']
})

@Injectable({
  providedIn: 'root'
})

export class OrdenFacturacion_PalletsComponent implements OnInit {

  storage_Id: number;
  ValidarRol: number;
  load: boolean = false;
  modoSeleccionado: boolean;
  form : FormGroup;
  pallets : Array<any> = [];
  copyPallets : Array<any> = [];
  selectedPallets : Array<any> = [];
  loading : boolean = false;
  @ViewChild('t1') t1: Table | undefined;
  @ViewChild('t2') t2: Table | undefined;
  @ViewChild('tRowExp1') tRowExp1: Table | undefined;
  @ViewChild('tRowExp2') tRowExp2: Table | undefined;
  infoConsolidate : Array<any> = [];
  selectedQty : number = 0;
  selectedProductSaleOrder: any = [];
  presentations: Array<string> = [];
  products: Array<any> = [];
  clients: Array<any> = [];

  constructor(private appComponent: AppComponent,
    private frmBuilder: FormBuilder,
    private svClients : ClientesService,
    private svProduct: ProductoService,
    private svPresentations : UnidadMedidaService,
    private svProductionProcess: Produccion_ProcesosService,
    private msj : MensajesAplicacionService,
    private svOrdFact : OrdenFacturacionService,
    private svDetOrdFact: Dt_OrdenFacturacionService,
    private svCreatePDF: CreacionPdfService,
    private svInvZeus : InventarioZeusService,
    private bagproService: BagproService,) { 
      this.loadForm();
    }

  ngOnInit() {
    this.lecturaStorage();
    this.getPresentations();
  }

  loadForm(){
    this.modoSeleccionado = this.appComponent.temaSeleccionado;

    this.form = this.frmBuilder.group({
      fact: [null],
      saleOrder: [null],
      idClient: [null, Validators.required],
      client: [null, Validators.required],
      observation: [null]
    });
  }

  formatNumbers = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  lecturaStorage() {
    this.storage_Id = this.appComponent.storage_Id;
    this.ValidarRol = this.appComponent.storage_Rol;
  }

  getPresentations() {
    let filterPresentations: Array<string> = ['Und', 'Kg', 'Paquete', 'Rollo'];
    this.svPresentations.srvObtenerLista().subscribe(data => {
      this.presentations = data.filter(x => filterPresentations.includes(x.undMed_Id));
    });
  }

  getSalesOrders() {
    let saleOrder: number = this.form.value.saleOrder;
    this.svInvZeus.getPedidosXConsecutivo(saleOrder).subscribe(data => {
      this.selectedProductSaleOrder = null;
      this.products = data.filter(x => x.cant_Pendiente > 0);
      if (this.products.length > 0) this.getClientFromSaleOrder();
      else this.msj.mensajeAdvertencia(`¡El pedido #${saleOrder} no tiene cantidades pendientes!`);
    }, error => this.msj.mensajeError(`¡No se encontró información del pedido consultado!`, `Error: ${error.error.title} | Status: ${error.status}`));
  }

  getClientFromSaleOrder() {
    let idthird: string = this.products[0].id_Cliente;
    this.svInvZeus.getClientByIdThird(idthird).subscribe(data => {
      data.forEach(cli => {
        this.form.patchValue({
          'idClient': cli.idtercero,
          'client': cli.razoncial,
        });
      });
    }, error => this.msj.mensajeError(`¡No se encontró información del cliente asociado al pedido!`, `Error: ${error.error.title} | Status: ${error.status}`));
  }

  getClients() {
    let nameClient: string = this.form.value.client;
    this.svClients.LikeGetCliente(nameClient).subscribe(data => this.clients = data);
  }

  selectedClient() {
    let idClient: string = this.form.value.client;
    let dataClient: any = this.clients.find(x => x.cli_Id == idClient);
    this.form.patchValue({
      'idClient': dataClient.cli_Id,
      'client': dataClient.cli_Nombre,
    });
  }

  //ORDEN DE FACTURACIÓN POR PALLETS
  getProducts2(){
    if(this.selectedProductSaleOrder != null) {
      this.loading = true;
      let item : any = this.selectedProductSaleOrder.id_Producto;
      this.pallets = [];
      
      this.svProductionProcess.getInfoItemsAvailablesOutPallet(item).subscribe(dataOut => { 
        this.svProductionProcess.getInfoItemsAvailablesInPallet(item).subscribe(dataIn => { 
          if(dataOut.concat(dataIn).length > 0) this.loadPallets(dataOut.concat(dataIn));
          else this.msj.mensajeAdvertencia(`Advertencia`, `No se encontraron rollos/bultos disponibles del item ${item}`);
          this.loading = false;
        }, error => {
          
        });
       }, error => {
        this.msj.mensajeError(`Error`, `No se encontraron rollos disponibles del item ${item}`);
        this.load = false;
      });
    }
  }

  //Función para cargar pallets y agregar el numero del pedido a los pallets 
  loadPallets(data : any){
    let saleOrder : any = this.selectedProductSaleOrder.consecutivo;
    data.forEach(d => { d.saleOrder = saleOrder });
    this.pallets = data;
    setTimeout(() => { this.referencesForOT(this.pallets) }, 500); 
  }

  //Función para obtener las diferentes referencias por OT. 
  referencesForOT(pallets : Array<any>){
    pallets.forEach(p => {
      let references = p.rolls.reduce((a, b) => {
        if(!a.map(x => x.ot).includes(b.ot)) a = [...a, b];
        return a;
      }, []);
      this.changeNameReferences(references, p);
    });
  }

  //Función para cambiar el nombre de las referencias dependiendo el numero de la OT. 
  changeNameReferences(reference : any, pallet : any) {
    reference.forEach(r => {
      this.bagproService.GetOrdenDeTrabajo(r.ot).subscribe(dataOT => {
        if(dataOT.length > 0) {
          pallet.rolls.filter(x => x.ot == r.ot).forEach(x => { 
            x.reference = dataOT[0].producto, 
            pallet.reference = dataOT[0].producto 
          });
        } 
      }, error => console.log(`No se encontró la OT ${r.ot}`))
    });
  }

  qtyPallets = (pallet : number, index : number) => this.pallets[index].rolls.filter(x => x.pallet == pallet).reduce((a, b) => a + b.qty, 0);

  qtySelectedPallets = (pallet : number, index : number) => this.selectedPallets[index].rolls.filter(x => x.pallet == pallet).reduce((a, b) => a + b.qty, 0)

  //SELECCIONAR TODO
  //Función para seleccionar todos los pallets
  selectAllPallets() {
    this.loading = true;
    
    if(this.selectedPallets.length == 0) this.selectedPallets = this.pallets.concat(this.selectedPallets);
    else {
      this.selectedPallets.forEach(s => {
        let index = this.pallets.findIndex(x => x.pallet == s.pallet);
        //if(index != -1) this.pallets.splice(index, 1);
        console.log(index)
      })
    }
    this.pallets = [];
    this.loadInfoConsolidate();
    setTimeout(() => { this.loading = false }, 5);
  }

  //Función para deseleccionar todos los pallets
  deselectAllPallets() {
    this.loading = true;
    if(this.pallets.length == 0) this.pallets = this.pallets.concat(this.selectedPallets);
    else {
      this.selectedPallets.forEach(s => {
        let index = this.pallets.findIndex(x => x.pallet == s.pallet);
        if(index == -1) {
          this.pallets.push(s);
          let ind = this.pallets.findIndex(x => x.pallet == s.pallet)
          this.pallets[ind].rolls.sort((a, b) => a.roll_BagPro - b.roll_BagPro);
        } else {
          this.pallets[index].rolls.push(...s.rolls);
          this.pallets[index].rolls.sort((a, b) => a.roll_BagPro - b.roll_BagPro);
        }
      });
    }
    
    this.selectedPallets = [];
    this.loadInfoConsolidate();
    this.pallets.sort((a, b) => a.pallet.localeCompare(b.pallet));
    setTimeout(() => { this.loading = false }, 5);
  }

  //SELECCIONAR PALLETS
  //Funcion para seleccionar un pallet en especifico
  selectPallet(data : any) {
    this.loading = true;
    let index = this.pallets.findIndex(x => x.pallet == data.pallet);
    if(this.selectedPallets.find(x => x.pallet == data.pallet) == undefined) {
      this.loadPalletsByPallet(this.selectedPallets, this.pallets, index, data);
    } else {
      this.loadPalletsSoloRoll(this.pallets, this.selectedPallets, index, data);
    }
    this.pallets.splice(index, 1)
    this.selectedPallets.sort((a, b) => a.pallet.localeCompare(b.pallet));
    this.loadInfoConsolidate();
    setTimeout(() => { this.loading = false }, 5);
  }

  //Funcion para deseleccionar un pallet en especifico
  deselectPallet(data : any) {
    this.loading = true;
    let index = this.selectedPallets.findIndex(x => x.pallet == data.pallet);
    if(this.pallets.find(x => x.pallet == data.pallet) == undefined) {
      this.loadPalletsByPallet(this.pallets, this.selectedPallets, index, data);
    } else {
      this.loadPalletsSoloRoll(this.selectedPallets, this.pallets, index, data);
    }
    this.selectedPallets.splice(index, 1);
    this.pallets.sort((a, b) => a.pallet.localeCompare(b.pallet));
    this.loadInfoConsolidate();
    setTimeout(() => { this.loading = false }, 5);
  }

  loadPalletsByPallet(array1 : any, array2 : any, index : number, data : any){
    array1.push(array2[index]);
    let indice = array1.findIndex(x => x.pallet == data.pallet);
    array1[indice].rolls.sort((a, b) => a.roll_BagPro - b.roll_BagPro);
  }

  loadPalletsSoloRoll(array1 : any, array2 : any, index : number, data : any){
    let indice = array2.findIndex(x => x.pallet == data.pallet);
    array2[indice].rolls.push(...array1[index].rolls);
    array2[indice].rolls.sort((a, b) => a.roll_BagPro - b.roll_BagPro);
  }

  //SELECCIONAR SOLO ROLLOS
  //Función para seleccionar un rollo en especifico
  selectRoll(data : any, i : number) {
    this.loading = true;
    let index = this.pallets.findIndex(x => x.pallet == data.pallet);
    
    if(this.selectedPallets.find(x => x.pallet == data.pallet) == undefined) {
      this.selectedPallets.push(this.loadRoll(data));
      this.loadPalletsByRoll(this.selectedPallets, data);
    } else {
      this.loadPalletsByRoll(this.selectedPallets, data);
    }
    this.pallets[index].rolls.splice(i, 1);
    if (this.pallets[index].rolls.length == 0) this.pallets.splice(index, 1);
    this.selectedPallets.sort((a, b) => a.pallet.localeCompare(b.pallet));
    this.loadInfoConsolidate();
    setTimeout(() => { this.loading = false }, 5);
  } 

  //Función para deseleccionar un rollo en especifico
  deselectRoll(data : any, i : number) {
    this.loading = true;
    let index = this.selectedPallets.findIndex(x => x.pallet == data.pallet);
    
    if(this.pallets.find(x => x.pallet == data.pallet) == undefined) {
      this.pallets.push(this.loadRoll(data));
      this.loadPalletsByRoll(this.pallets, data);
    } else {
      this.loadPalletsByRoll(this.pallets, data);
    }

    this.selectedPallets[index].rolls.splice(i, 1);
    if (this.selectedPallets[index].rolls.length == 0) this.selectedPallets.splice(index, 1);
    this.pallets.sort((a, b) => a.pallet.localeCompare(b.pallet));
    this.loadInfoConsolidate();
    setTimeout(() => { this.loading = false }, 5);
  } 

  //Función para seleccionar/deseleccionar los pallets y ordenarlos por rollo.
  loadPalletsByRoll(array : any, data : any){
    let index = array.findIndex(x => x.pallet == data.pallet);
    array[index].rolls.push(data);
    array[index].rolls.sort((a, b) => a.roll_BagPro - b.roll_BagPro);
  }

  //Función para cargar la información del rollo seleccionado.
  loadRoll(data : any){
    let saleOrder : any = this.selectedProductSaleOrder.consecutivo;  
    return {
      'pallet' : data.pallet,
      'client_Id' : data.client_Id,
      'client' : data.client,
      'item' : data.item,
      'reference' : data.reference,
      'qty' : data.qty,
      'presentation' : data.presentation,
      'saleOrder' : saleOrder,
      'rolls' : []
    }
  }

  //Función para cargar la información consolidada de los pallets seleccionados.
  loadInfoConsolidate(){
    this.infoConsolidate = this.selectedPallets.reduce((a, b) => {
      let item = a.find(x => x.item == b.item);
      if(item == undefined) a.push(b);
      return a;
    }, []);
  }

  //Funcion para obtener la cantidad consolidada de un item.
  qtyConsolidateForItem(item : any) {
    let total : number = 0
    this.selectedPallets.forEach(x => {
      x.rolls.forEach(y => {
        if(y.item == item) total += y.qty;
      });
    });
    return total;
  }

  //Función para obtener la cantidad de rollos seleccionados por item.
  qtyRollsForItem(item : any) {
    let total : number = 0
    this.selectedPallets.forEach(x => {
      x.rolls.forEach(y => {
        if(y.item == item) total++ ;
      });
    });
    return total;
  }
  
  //Función para obtener la cantidad total de rollos seleccionados.
  totalQtySelectedRolls(){
    let totalRolls : number = 0
    this.selectedPallets.forEach(x => {
      x.rolls.forEach(y => {
        totalRolls++;
      });
    });
    return totalRolls;
  }

  //Función para cargar la cantidad de rollos disponibles.
  qtyRollsAvailables = (index) => this.pallets[index].rolls.length;

  //Función para cargar la cantidad de rollos seleccionados.
  qtySelectedRolls = (index) => this.selectedPallets[index].rolls.length;

  //Función para cargar el total de rollos disponibles.
  totalRollsAvailables() {
    let total : number = 0;
    this.pallets.forEach(x => total += x.rolls.length);
    return total;
  }

  //Función para cargar la cantidad total por item
  totalQtyByItem(){
    let total : number = 0;
    this.pallets.forEach(x => x.rolls.forEach(z => total += z.qty));
    return total;
  }

  //Función para filtrar los pallets por referencia.
  selectByFilter(){
    this.loading = true;
    let data = this.t1.filteredValue ? this.t1.filteredValue : this.t1.value; 
    //console.log(data)
    this.selectedPallets = this.selectedPallets.concat(data);
    console.log(this.t1.filteredValue)
    if(!this.t1.filteredValue) this.pallets = []; 
    else {
      data.forEach(d => {
        let index = this.pallets.findIndex(x => x.pallet == d.pallet);
        this.pallets.splice(index, 1);
      });
      this.t1.clear();
    }
    this.loadInfoConsolidate();
    this.selectedPallets.sort((a, b) => a.pallet.localeCompare(b.pallet));
    setTimeout(() => { this.loading = false }, 5);
  }

  //Función para filtrar los pallets por referencia.
  deselectByFilter(){
    this.loading = true;
    
    setTimeout(() => { this.loading = false }, 5);
  }
  
  //SELECCIONAR POR CANTIDAD
  //Función para filtrar los pallets por cantidad.
  selectByQuantity(){
    this.loading = true;
    let sumQty : number = 0; 
    let totalQtyByItem : number = this.totalQtyByItem();
    let array : any = [];
    this.pallets.sort((a, b) => a.pallet.localeCompare(b.pallet));
    
    if(totalQtyByItem > 0) {
      if(totalQtyByItem >= this.selectedQty) {
        this.pallets.forEach(x => {
          x.rolls.forEach(y => {
            sumQty += y.qty;
            if(sumQty <= this.selectedQty) {
              if (array.find(z => z.pallet == y.pallet) == undefined) {
                array.push(this.loadRoll(x));
                let index = array.findIndex(a => a.pallet == y.pallet);
                array[index].rolls.push(y);
              } else {
                let index = array.findIndex(a => a.pallet == y.pallet);
                array[index].rolls.push(y);
              }
            }
          });
        });
        this.sendPalletsToSelected(array);
      } else {
        this.msj.mensajeError(`La cantidad total de rollos disponibles es menor a la cantidad digitada.`, `Error`);
        this.loading = false;
      }
    } else {
      this.loading = false;
      this.msj.mensajeAdvertencia(`Debe seleccionar un item`);
    }
  }

  //Función para enviar los pallets elegidos a la lista de pallets seleccionados.
  sendPalletsToSelected(array : any){
    console.log(array)
    setTimeout(() => {
      array.forEach(x => {
        let index = this.pallets.findIndex(y => y.pallet == x.pallet);
        x.rolls.forEach(y => {
          if(this.selectedPallets.find(s => s.pallet == x.pallet) == undefined) {
            this.selectedPallets.push(this.loadRoll(x));
            this.loadPalletsByQuantity(x, y);
          } else {
            this.loadPalletsByQuantity(x, y);
          }
          let index2 = this.pallets[index].rolls.findIndex(z => z.roll_BagPro == y.roll_BagPro);
          this.pallets[index].rolls.splice(index2, 1);
          if (this.pallets[index].rolls.length == 0) this.pallets.splice(index, 1);
        });
      });
      this.selectedPallets.sort((a, b) => a.pallet.localeCompare(b.pallet));
      this.loadInfoConsolidate();
      this.loading = false;
    }, 500);
  }

  //Función para cargar los pallets por cantidad y organizarlos por rollo
  loadPalletsByQuantity(pallet : any, detail : any){
    let index2 = this.selectedPallets.findIndex(z => z.pallet == pallet.pallet);
    this.selectedPallets[index2].rolls.push(detail);
    this.selectedPallets[index2].rolls.sort((a, b) => a.roll_BagPro - b.roll_BagPro);
  }

  applyFilter = ($event, campo : any, table : Table) => table!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  //Función para validar los datos.
  validateInformation(){
    if(this.form.valid) {
      if(this.selectedPallets.length > 0) this.saveOF()
      else this.msj.mensajeAdvertencia(`No hay pallets/rollos seleccionados!`,);
    } else this.msj.mensajeAdvertencia(`Debe ingresar la información requerida del pedido`,);
  }

  //Función para guardar los datos de encabezado de la OF
  saveOF(){
    this.load = true;
    let orderFact : modelOrdenFacturacion = {
      Factura: '',
      Cli_Id: 1061, //this.form.value.idClient,
      Usua_Id: this.storage_Id,
      Fecha: moment().format('YYYY-MM-DD'),
      Hora: moment().format('HH:mm:ss'),
      Observacion: !this.form.value.observation ? '' : (this.form.value.observation).toString().toUpperCase(),
      Estado_Id: 19
    }
    this.svOrdFact.Post(orderFact).subscribe(data => { this.saveDetailOF(data); }, error => {   
      let msj : string = `Ocurrió un error al crear la orden de facturación`;
      this.msj.mensajeError(`Error`, msj); 
      this.load = false; 
    });
  }
  
  //Función para guardar los detalles de la OF
  saveDetailOF(data : any){
    let count : number = 0; 
    let order : number = data.id;

    this.selectedPallets.forEach(x => {
      x.rolls.forEach(y => {
        let dtOrderFact : modelDt_OrdenFacturacion = {
          'Id_OrdenFacturacion' : order,
          'Numero_Rollo' : y.roll_BagPro,
          'Prod_Id' : y.item,
          'Cantidad' : y.qty,
          'Presentacion' : y.presentation,
          'Consecutivo_Pedido' : (x.saleOrder).toString(),
          'Estado_Id' : 20,
        }
        this.svDetOrdFact.Post(dtOrderFact).subscribe(() => {
          count++;
          if(count == this.selectedPallets.length) this.putStatusRollsInvoice(order, data.factura);
        }); 
      });
    });
  }

  //Función para colocar el estado de los rollos en facturado
  putStatusRollsInvoice(order: number, fact: string) {
    this.svProductionProcess.putStateForSend(order).subscribe(() => {
      this.msj.mensajeConfirmacion('Orden de facturación creada exitosamente!');
      this.createPDF(order, fact);
      this.clearFields();
    }, error => this.msj.mensajeError(`¡Ocurrió un error al actualizar el estado de los rollo seleccionados!`, `Error: ${error.error.title} | Status: ${error.status}`));
  }

  //Función para limpiar campos
  clearFields(){
    this.load = false;
    this.pallets = [];
    this.selectedPallets = [];
    this.form.reset();
    this.clients = [];
    this.products = [];
    this.infoConsolidate = [];
  }

  //FUNCIONES PARA CREAR PDF
  createPDF(idOF: number, fact: string) {
    this.svDetOrdFact.GetInformacionOrderFact(idOF).subscribe(data => {
      let title: string = `Orden de Facturación N° ${idOF}`;
      title += `${fact.length > 0 ? ` \n Factura N° ${fact}` : ''}`;
      let content: any[] = this.contentPDF(data);
      this.svCreatePDF.formatoPDF(title, content);
    }, error => this.msj.mensajeError(error));
  }

  contentPDF(data): any[] {
    let content: any[] = [];
    data = this.changeNameProductInPDF(data);
    console.log(data)
    let consolidatedInformation: Array<any> = this.consolidatedInformation(data);
    let informationProducts: Array<any> = this.getInformationProducts(data);
    content.push(this.informationClientPDF(data[0]));
    content.push(this.observationPDF(data[0]));
    content.push(this.tableConsolidated(consolidatedInformation));
    content.push(this.tableProducts(informationProducts));
    return content;
  }

  changeNameProductInPDF(data : Array<any>) {
    let orderProduction = data.reduce((a, b) => {
      if (!a.map(x => x.orderProduction).includes(b.orderProduction)) a = [...a, b];
      return a;
    }, []);
    orderProduction.forEach(d => {
      this.bagproService.GetOrdenDeTrabajo(d.orderProduction).subscribe(dataOrder => {
        data.filter(x => x.orderProduction == d.orderProduction).forEach(prod => {
          prod.Referencia = dataOrder[0].producto;
        });
      });
    });
    return data;
  }

  consolidatedInformation(data: any): Array<any> {
    let consolidatedInformation: Array<any> = [];
    let count: number = 0;
    data.forEach(prod => {
      if (!consolidatedInformation.map(x => x.Item).includes(prod.producto.prod_Id)) {
        count++;
        let countProduction: number = data.filter(x => x.producto.prod_Id == prod.producto.prod_Id).length;
        let totalQuantity: number = 0;
        data.filter(x => x.producto.prod_Id == prod.producto.prod_Id).forEach(x => totalQuantity += x.dtOrder.cantidad);
        consolidatedInformation.push({
          "#" : count,
          "Pedido": prod.dtOrder.consecutivo_Pedido,
          "Item": prod.producto.prod_Id,
          "Referencia": prod.producto.prod_Nombre,
          "Cant. Rollos": this.formatNumbers((countProduction)),
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
        "OT" : prod.orderProduction,
        "Item": prod.producto.prod_Id,
        "Referencia": prod.producto.prod_Nombre,
        "Cantidad": this.formatNumbers((prod.dtOrder.cantidad).toFixed(2)),
        "Presentación": prod.dtOrder.presentacion,
        "Ubicación": prod.ubication == null ? '' : prod.ubication,
        "Pallet" :  [0, null, undefined, ''].includes(prod.pallet) ? '' : prod.pallet,
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
    let columns: Array<string> = ['#', 'Rollo', 'OT', 'Item', 'Referencia', 'Cantidad', 'Presentación', 'Ubicación', 'Pallet'];
    let widths: Array<string> = ['3%', '7%', '7%', '7%', '35%', '8%', '10%', '17%', '6%'];
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

  buildTableBody2(data, columns, title) {
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
}
