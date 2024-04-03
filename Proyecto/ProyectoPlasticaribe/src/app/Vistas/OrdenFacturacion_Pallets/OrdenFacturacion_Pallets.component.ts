import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
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

  //Función para seleccionar todos los pallets
  selectAllPallets() {
    this.loading = true;
    this.selectedPallets = this.selectedPallets.concat(this.pallets);
    this.pallets = [];
    this.loadInfoConsolidate();
    setTimeout(() => { this.loading = false }, 5);
  }

  //Función para deseleccionar todos los pallets
  deselectAllPallets() {
    this.loading = true;
    this.pallets = this.pallets.concat(this.selectedPallets);
    this.selectedPallets = [];
    this.loadInfoConsolidate();
    setTimeout(() => { this.loading = false }, 5);
  }

  //Funcion para seleccionar un pallet en especifico
  selectPallet(data : any) {
    this.loading = true;
    let index = this.pallets.findIndex(x => x.pallet == data.pallet);
    this.selectedPallets.push(this.pallets[index]);
    this.pallets.splice(index, 1)
    this.selectedPallets.sort((a, b) => a.pallet.localeCompare(b.pallet));
    this.loadInfoConsolidate();
    setTimeout(() => { this.loading = false }, 5);
  }

  //Funcion para deseleccionar un pallet en especifico
  deselectPallet(data : any) {
    this.loading = true;
    let index = this.selectedPallets.findIndex(x => x.pallet == data.pallet);
    this.pallets.push(this.selectedPallets[index]);
    this.selectedPallets.splice(index, 1);
    this.pallets.sort((a, b) => a.pallet.localeCompare(b.pallet));
    this.loadInfoConsolidate();
    setTimeout(() => { this.loading = false }, 5);
  }

  //Función para seleccionar un rollo en especifico
  selectRoll(data : any, i : number) {
    this.loading = true;
    let index = this.pallets.findIndex(x => x.pallet == data.pallet);
    
    if(this.selectedPallets.find(x => x.pallet == data.pallet) == undefined) {
      this.selectedPallets.push(this.loadRoll(data));
      let indice = this.selectedPallets.findIndex(x => x.pallet == data.pallet);
      this.selectedPallets[indice].rolls.push(data);
    } else {
      let indice = this.selectedPallets.findIndex(x => x.pallet == data.pallet);
      this.selectedPallets[indice].rolls.push(data);
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
      let indice = this.pallets.findIndex(x => x.pallet == data.pallet);
      this.pallets[indice].rolls.push(data);
    } else {
      let indice = this.pallets.findIndex(x => x.pallet == data.pallet);
      this.pallets[indice].rolls.push(data);
    }
    this.selectedPallets[index].rolls.splice(i, 1);
    if (this.selectedPallets[index].rolls.length == 0) this.selectedPallets.splice(index, 1);
    this.pallets.sort((a, b) => a.pallet.localeCompare(b.pallet));
    this.loadInfoConsolidate();
    setTimeout(() => { this.loading = false }, 5);
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

  //Función para filtrar los pallets por referencia.
  selectByFilter(){
    this.loading = true;
    
    setTimeout(() => { this.loading = false }, 5);
  }
  
  //Función para filtrar los pallets por cantidad.
  selectByQuantity(){
    this.loading = true;
    
    setTimeout(() => { this.loading = false }, 5);
  }

}
