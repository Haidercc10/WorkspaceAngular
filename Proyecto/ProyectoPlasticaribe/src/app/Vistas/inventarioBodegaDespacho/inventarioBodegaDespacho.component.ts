import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Table } from 'primeng/table';
import { TabView } from 'primeng/tabview';
import { BodegasDespachoService } from 'src/app/Servicios/BodegasDespacho/BodegasDespacho.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-inventarioBodegaDespacho',
  templateUrl: './inventarioBodegaDespacho.component.html',
  styleUrls: ['./inventarioBodegaDespacho.component.css']
})

export class InventarioBodegaDespachoComponent implements OnInit {

  load: boolean = false;
  storage_Id: number;
  ValidarRol: number;
  modoSeleccionado: boolean = false;
  formStorehouse: FormGroup;
  storehouse: Array<any> = [];
  ubicationsStorehouse: Array<any> = [];
  subUbicationsStorehouse: Array<any> = [];
  cubes: Array<any> = [];
  dataSearched: Array<StoreByUbication> = [];
  showDataStore: boolean = false;
  @ViewChild('consolidateTable') consolidateTable: Table | undefined;
  @ViewChild('detailsTable') detailsTable: Table | undefined;
  products: Array<any> = [];
  ubicationModal : string = `BODEGA 0031 - `;

  constructor(private appComponent: AppComponent,
    private frmBuilder: FormBuilder,
    private storehouseService: BodegasDespachoService,
    private msg: MensajesAplicacionService,
    private productService: ProductoService,) {
    this.modoSeleccionado = this.appComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.initFormStorehouse();
    this.formStorehouse.reset();
  }

  initFormStorehouse() {
    this.formStorehouse = this.frmBuilder.group({
      item: [''],
      reference: [''],
      numberProuction: 0,
    });
  }

  aplyFilter = ($event, campo: string, table: Table) => table!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  clearAll() {
    this.formStorehouse.reset();
    this.products = [];
    this.dataSearched = [];
    this.showDataStore = false;
    this.editClassProtectedPanel('');
    this.clearUbicationsFound();
  }

  editClassProtectedPanel(newClass: string) {
    document.getElementById('B0031_protectedPanel').className = newClass;
    document.getElementById('B0032_protectedPanel').className = newClass;
    document.getElementById('B0033_protectedPanel').className = newClass;
  }

  clearUbicationsFound() {
    let cantUbications: number = document.getElementsByClassName('ubicationFound').length;
    for (let i = 0; i < cantUbications; i++) {
      let ubicationFound = document.getElementsByClassName('ubicationFound')[0];
      if (ubicationFound) ubicationFound.className = (ubicationFound.className).replace(' ubicationFound', '');
    }
  }

  searchProductByItem() {
    let idProduct: number = this.formStorehouse.value.item;
    this.productService.GetProductsById(idProduct).subscribe(data => {
      data.forEach(dataProduct => {
        this.formStorehouse.patchValue({
          item: dataProduct.prod.prod_Id,
          reference: dataProduct.prod.prod_Nombre,
        });
      });
    });
  }

  searchProductByReference() {
    let reference: string = this.formStorehouse.value.reference;
    this.productService.GetProductsByName(reference).subscribe(data => this.products = data);
  }

  selectedProduct() {
    let idProduct: string = this.formStorehouse.value.reference;
    let dataProduct: any = this.products.find(x => x.prod.prod_Id == idProduct);
    this.formStorehouse.patchValue({
      item: dataProduct.prod.prod_Id,
      reference: dataProduct.prod.prod_Nombre,
    });
  }

  GetStoreByUbicationAndProducts() {
    let route: string = this.validateRoute();
    this.clearUbicationsFound();
    let ubicationIncluded: Array<string> = [];
    this.storehouseService.GetInventarioPorUbicacionYProducto(route).subscribe(data => {
      data.forEach(d => {
        this.editClassProtectedPanel('protectedPanel');
        if (!ubicationIncluded.includes(d.ubicacion)) {
          ubicationIncluded.push(d.ubicacion);
          document.getElementById((d.ubicacion).trim()).className += ' ubicationFound';
          let newUbication = document.getElementById((d.ubicacion).trim()).id;
          let cutString : number = newUbication.indexOf('_PL') > 0 ? newUbication.indexOf('_PL') : newUbication.indexOf('_ESTB');
          
          if(newUbication.startsWith('B0033_')) {
            newUbication = newUbication.substring(0, cutString);
            newUbication = newUbication.replace('B0033_', '');
            document.getElementById((newUbication).trim()).className += ' ubicationFound';
          }
        }
      });
    }, error => {
      this.editClassProtectedPanel('');
      this.msg.mensajeError(`¡No se encontró información de ingresos a despacho con los parametros consultados!`, `Error: ${error.error.title} | Status: ${error.status}`)
    });
  }

  validateRoute(): string {
    let route: string = '';
    let item = this.formStorehouse.value.item;
    let numberProduction = this.formStorehouse.value.numberProuction;

    if (item != null) route += `producto=${item}`;
    if (numberProduction != null) route.length > 0 ? route += `&numeroRollo=${numberProduction}` : route += `numeroRollo=${numberProduction}`;
    if (route.length > 0) route = `?${route}`;
    return route;
  }

  GetStoreByUbication(ubication: string) {
    this.load = true;
    this.ubicationModal = this.ubicationModal.length >= 14 ? this.ubicationModal.substring(0, 14) : this.ubicationModal;
    this.ubicationModal += document.getElementById(ubication).getAttribute('pTooltip');
    this.storehouseService.GetInventarioPorUbicacion(ubication).subscribe(data => {
      this.dataSearched = this.getConsolidateInformation(data);
      this.showDataStore = true;
    }, error => {
      this.msg.mensajeError(`¡No se encontró información de ingresos a despacho con los parametros consultados!`, `Error: ${error.error.title} | Status: ${error.status}`);
      this.load = false;
    }, () => this.load = false);
  }

  getConsolidateInformation(dataSearched: Array<any>): Array<StoreByUbication> {
    let data: Array<StoreByUbication> = [];
    let items: Array<any> = dataSearched.reduce((a, b) => {
      if (!a.map(x => x.prod_Id).includes(b.prod_Id)) a.push(b);
      return a;
    }, []);
    items.forEach(d => {
      data.push({
        item: d.prod_Id,
        reference: d.prod_Nombre,
        ubication: d.ubicacion,
        countProduction: dataSearched.filter(x => x.prod_Id == d.prod_Id).length,
        totalQuantity: dataSearched.filter(x => x.prod_Id == d.prod_Id).reduce((a, b) => a += b.cantTotal, 0),
        presentation: d.presentacion,
        subTotal: dataSearched.filter(x => x.prod_Id == d.prod_Id).reduce((a, b) => a += b.subTotal, 0),
        detailsProduction: this.getDetailsInformation(d.prod_Id, d.presentation, dataSearched),
      });
    });
    return data;
  }

  getDetailsInformation(item: number, presentation: string, dataSearched: Array<any>): Array<DetailsStoreByProducts> {
    let data: Array<DetailsStoreByProducts> = [];
    dataSearched.filter(x => x.prod_Id == item).forEach(d => {
      data.push({
        orderProduction: d.ot,
        numberProduction: d.numero_Rollo,
        numberProductionBagPro: d.numeroRollo_BagPro,
        weight: d.peso,
        quantity: d.cantTotal,
        presentation: d.presentacion,
        date: d.fecha.replace('T00:00:00', ''),
        hour: d.hora,
        price: d.precioVenta_Producto,
        subTotal: d.subTotal,
      });
    });
    return data;
  }

  changeTab(index : any) {
    this.ubicationModal = ``;  
    index == 0 ? this.ubicationModal = 'BODEGA 0031 - ' : 
    index == 1 ? this.ubicationModal = 'BODEGA 0032 - ' :
    index == 2 ? this.ubicationModal = 'BODEGA 0033 - ' : this.ubicationModal = 'BODEGA 0031 - ';
  }
}

interface StoreByUbication {
  item: number;
  reference: string;
  ubication: string;
  countProduction: number
  totalQuantity: number;
  presentation: string;
  subTotal: number;
  detailsProduction: Array<DetailsStoreByProducts>;
}

interface DetailsStoreByProducts {
  orderProduction: number;
  numberProduction: number;
  numberProductionBagPro: number;
  weight: number;
  quantity: number;
  presentation: string;
  date: string;
  hour: string;
  price: number;
  subTotal: number;
}