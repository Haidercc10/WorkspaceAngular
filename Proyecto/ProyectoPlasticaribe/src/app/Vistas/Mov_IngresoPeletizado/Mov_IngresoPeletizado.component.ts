import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { dataDesp } from '../Movimientos-IngresosDespacho/Movimientos-IngresosDespacho.component';
import { Table } from 'primeng/table';
import { AppComponent } from 'src/app/app.component';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { DetallesEntradaRollosService } from 'src/app/Servicios/DetallesEntradasRollosDespacho/DetallesEntradaRollos.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import moment from 'moment';
import { Ingreso_PeletizadoService } from 'src/app/Servicios/Ingreso_Peletizado/Ingreso_Peletizado.service';
import { Ingreso_PeletizadoComponent } from '../Ingreso_Peletizado/Ingreso_Peletizado.component';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { Salidas_PeletizadoComponent } from '../Salidas_Peletizado/Salidas_Peletizado.component';

@Component({
  selector: 'app-Mov_IngresoPeletizado',
  templateUrl: './Mov_IngresoPeletizado.component.html',
  styleUrls: ['./Mov_IngresoPeletizado.component.css']
})
export class Mov_IngresoPeletizadoComponent implements OnInit {
  form: FormGroup;
  load: boolean = false;
  storage_Id: number;
  validateRole: number | undefined;
  selectedMode: boolean = false;
  products: any[] = [];
  dataSearched: Array<dataDesp> = [];
  @ViewChild('tableData1') tableData1: Table | undefined;
  @ViewChild('tableData2') tableData2: Table | undefined;
  modal : boolean = false;
  dataSelected : any = [];
  materiasPrimas : any [] = [];
  typesMovements : any = ['ENTRADA', 'SALIDA']; 
  dataFound : any = [];
  statuses : any = [];
  entries : any = [];
  outputs : any = []

  constructor(
    private appComponent: AppComponent,
    private frmBuilder: FormBuilder,
    private productsService: ProductoService,
    private msg: MensajesAplicacionService,
    private svMatPrima : MateriaPrimaService,
    private svIngPele : Ingreso_PeletizadoService,
    private cmpEntries : Ingreso_PeletizadoComponent,
    private svStatus : EstadosService,
    private cmpOutputs : Salidas_PeletizadoComponent,
  ) { 
    this.selectedMode = this.appComponent.temaSeleccionado;
    this.initForm();
  }

  ngOnInit() {
    this.readStorage();
    this.getMatPrimas();
    this.loadRankDates();
    this.getStatuses();
  }

  //*Leer storage del navegador.  
  readStorage() {
    this.storage_Id = this.appComponent.storage_Id;
    this.validateRole = this.appComponent.storage_Rol;
  }

  //*Función para cargar fechas en el rango.
  loadRankDates(){
    let initialDate = new Date(moment().subtract(30, 'days').format('YYYY-MM-DD'));
    this.form.patchValue({ 'rankDates' : [initialDate, new Date()] });
  }

  //*Función que inicializa el formulario.
  initForm() {
    this.form = this.frmBuilder.group({
      orderProduction: [null],
      rankDates : [null, Validators.required],
      mpId: [null],
      mpName: [null],
      status: [null],
      typeMov : [null], 
    });
  }

  //* Limpiar campos y tablas
  clearFields() {
    this.products = [];
    this.dataSearched = [];
    this.dataFound = [];
    this.form.reset();
    this.load = false;
  }

  searchProduct() {
    let nombre: string = this.form.value.reference;
    this.productsService.obtenerItemsLike(nombre).subscribe(resp => this.products = resp);
  }

  selectedProduct() {
    let producto: any = this.form.value.reference;
    this.form.patchValue({
      item: producto,
      reference: this.products.find(x => x.prod_Id == producto).prod_Nombre
    });
  }

  //* Función para obtener los estados.
  getStatuses = () => this.svStatus.srvObtenerListaEstados().subscribe(data => { this.statuses = data.filter(x => [11,26,19,23].includes(x.estado_Id)) }, error => { this.msg.mensajeError(`Error`, `No se cargaron los estados`) });
  
  //* Función para obtener las materias primas.
  getMatPrimas = () => this.svMatPrima.GetInventarioMateriasPrimas().subscribe(datos => this.materiasPrimas = datos);
  
  // Funcion que le va a colocar el nombre a la materia prima seleccionada
  changeMaterial(){
    let id : number = this.form.value.mpName;
    let matprima : any = this.materiasPrimas.filter((item) => item.id_Materia_Prima == id);
    
    this.form.patchValue({ 'mpId' : id, 'mpName' : matprima[0].nombre_Materia_Prima, });
  }

  searchInPeletizado(){
    this.dataFound = [];

    if((this.form.value.rankDates).length == 2) {
      let date1 : any = moment(this.form.value.rankDates[0]).format('YYYY-MM-DD');
      let date2 : any = moment(this.form.value.rankDates[1]).format('YYYY-MM-DD');
      this.load = true;

      this.svIngPele.getMovementsPeletizado(date1, date2, this.validateUrl()).subscribe(data => {
        this.dataFound = data;
        this.load = false;
      }, error => this.msg.mensajeError(`Error`, `No se ha podido consultar el ingreso de peletizado!`));
    } else this.msg.mensajeAdvertencia(`Advertencia`, `Debe elegir 2 fechas para consultar!`);
  }

  validateUrl(){
    let ot: any = this.form.value.orderProduction;
    let mp: any = this.form.value.mpId;
    let status : any = this.form.value.status;
    let typeMov : any = this.form.value.typeMov;
    let url : string = ``;

    if(ot != null) url += `ot=${ot}`;
    if(mp != null) url.length > 0 ? url += `&mp=${mp}` : url += `mp=${mp}`;
    if(status != null) url.length > 0 ? url += `&status=${status}` : url += `status=${status}`;
    if(typeMov != null) url.length > 0 ? url += `&typeMov=${typeMov}` : url += `typeMov=${typeMov}`;

    if(url.length > 0) url = `?${url}`;
    console.log(url);
    return url;
  }

  applyFilter = ($event, campo : any, table : any) => table!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  totalQty = () => this.dataFound.reduce((a, b) => a += b.mov.qty, 0);

  viewPDF = (data) => data.typeMov == 'ENTRADA' ? this.cmpEntries.createPDF(data.mov.date, data.mov.date, data.mov.hour, `exportado`) : this.cmpOutputs.createPDF(data.mov.code, `exportado`);

}
