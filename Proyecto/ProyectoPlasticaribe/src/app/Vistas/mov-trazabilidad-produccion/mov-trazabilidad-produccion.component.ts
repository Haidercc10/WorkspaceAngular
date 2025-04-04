import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Table } from 'primeng/table';
import { AppComponent } from 'src/app/app.component';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { dataDesp } from '../Movimientos-IngresosDespacho/Movimientos-IngresosDespacho.component';

@Component({
  selector: 'app-mov-trazabilidad-produccion',
  templateUrl: './mov-trazabilidad-produccion.component.html',
  styleUrls: ['./mov-trazabilidad-produccion.component.css']
})
export class MovTrazabilidadProduccionComponent {

  formFilters: FormGroup;
    load: boolean = false;
    storage_Id: number;
    validateRole: number | undefined;
    selectedMode: boolean = false;
    products: any[] = [];
    dataSearched: Array<dataDesp> = [];
    @ViewChild('table') table: Table | undefined;
    modal : boolean = false;
    dataSelected : any = [];
    traceability : boolean = false;
    selectedRoll : any = null;

  constructor(private appComponent: AppComponent,
      private frmBuilder: FormBuilder,
      private productsService: ProductoService,
      private msg: MensajesAplicacionService,
      private svCreatePDF: CreacionPdfService,) {
  
      this.selectedMode = this.appComponent.temaSeleccionado;
  }
  
  ngOnInit() {
    this.readStorage();
    this.initForm();
  }
  readStorage() {
    this.storage_Id = this.appComponent.storage_Id;
    this.validateRole = this.appComponent.storage_Rol;
  }

  //
  initForm() {
    this.formFilters = this.frmBuilder.group({
      orderProduction: [null],
      startDate: [null],
      endDate: [null],
      item: [null],
      reference: [null],
      production: [null],
    });
  }

  //
  clearFields() {
    this.products = [];
    this.dataSearched = [];
    this.formFilters.reset();
    this.load = false;
  }

  //
  searchProduct() {
    let nombre: string = this.formFilters.value.reference;
    this.productsService.obtenerItemsLike(nombre).subscribe(resp => this.products = resp);
  }

  //
  selectedProduct() {
    let producto: any = this.formFilters.value.reference;
    this.formFilters.patchValue({
      item: producto,
      reference: this.products.find(x => x.prod_Id == producto).prod_Nombre
    });
  }

  searchTraceability(){
    
  }

  validateRoute(): string {
    let route: string = ``;
    let roll = this.formFilters.value.production;
    let ot = this.formFilters.value.orderProduction;
    let item = this.formFilters.value.item;

    if (roll != null) route += `roll=${roll}`;
    if (roll != null) route.length > 0 ? route += `&ot=${ot}` : route += `ot=${ot}`;
    if (item != null) route.length > 0 ? route += `&item=${item}` : route += `item=${item}`;
    if (route.length > 0) route = `?${route}`;

    return route;
  }
  
  applyFilter = ($event, campo: any) => this.table!.filter(($event.target as HTMLInputElement).value, campo, 'contains');
}
