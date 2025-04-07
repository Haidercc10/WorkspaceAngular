import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Table } from 'primeng/table';
import { AppComponent } from 'src/app/app.component';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { dataDesp } from '../Movimientos-IngresosDespacho/Movimientos-IngresosDespacho.component';
import { TrazabilidadProduccionService } from 'src/app/Servicios/Trazabilidad_Produccion/trazabilidad-produccion.service';
import moment from 'moment';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';

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
    traceability: Array<any> = [];
    @ViewChild('t1') t1: Table | undefined;
    @ViewChild('t2') t2: Table | undefined;
    modal : boolean = false;
    dataSelected : any = [];
    trace : boolean = false;
    selectedRoll : any = null;
    loading : boolean = false;
    groupTraceability :any = [];
    process : any = [];

  constructor(private appComponent: AppComponent,
      private frmBuilder: FormBuilder,
      private productsService: ProductoService,
      private msg: MensajesAplicacionService,
      private svCreatePDF: CreacionPdfService,
      private svTraceability : TrazabilidadProduccionService,
      private svProcess : ProcesosService,
    ) {
  
      this.selectedMode = this.appComponent.temaSeleccionado;
  }
  
  ngOnInit() {
    this.readStorage();
    this.initForm();
    this.searchTraceability();
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
    this.traceability = [];
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
    this.traceability = [];
    let date1 : any = moment(this.formFilters.value.startDate).format('YYYY-MM-DD');
    let date2 : any = moment(this.formFilters.value.endDate).format('YYYY-MM-DD');

    //if(date1 && date2) {
      this.svTraceability.getTraceability('2025-04-01', '2025-04-05', '?ot=134505').subscribe(data => {
        this.groupMotherRolls(data);
        this.groupTraceability.sort((a, b) => Number(a.motherRoll) - Number(b.motherRoll))
      }, error => {
        console.log(error);
      });
    //} else {
      //this.warningMsj(``, ``);
    //}
  }

  groupMotherRolls(data : any){ 
    this.groupTraceability = data.reduce((a, b) => {
      if(!a.map(x => x.motherRoll).includes(b.motherRoll)) {
        a = [...a, b];
      } 
      return a;
    }, []);

    this.load = false;
  }


  warningMsj(msg1 : string, msg2 : string){
    this.msg.mensajeAdvertencia(msg1, msg2);
    this.load = false;
  }

  validateRoute(): string {
    let route: string = ``;
    let roll = this.formFilters.value.production;
    let ot = this.formFilters.value.orderProduction;
    let item = this.formFilters.value.item;

    if (roll != null) route += `roll=${roll}`;
    if (ot != null) route.length > 0 ? route += `&ot=${ot}` : route += `ot=${ot}`;
    if (item != null) route.length > 0 ? route += `&item=${item}` : route += `item=${item}`;
    if (route.length > 0) route = `?${route}`;

    return route;
  }
  
  applyFilter = ($event, campo: any, table : any) => table!.filter(($event.target as HTMLInputElement).value, campo, 'contains');
}
