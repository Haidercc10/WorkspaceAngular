import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { dataDesp } from '../Movimientos-IngresosDespacho/Movimientos-IngresosDespacho.component';
import { Table } from 'primeng/table';
import { AppComponent } from 'src/app/app.component';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import moment from 'moment';
import { Ingreso_PeletizadoService } from 'src/app/Servicios/Ingreso_Peletizado/Ingreso_Peletizado.service';
import { Ingreso_PeletizadoComponent } from '../Ingreso_Peletizado/Ingreso_Peletizado.component';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { Salidas_PeletizadoComponent } from '../Salidas_Peletizado/Salidas_Peletizado.component';
import { MateriaPrimaRecuperadaComponent } from '../MateriaPrimaRecuperada/MateriaPrimaRecuperada.component';

@Injectable({
  providedIn: 'root'
})

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
  @ViewChild('tableData1') tableData1: Table | undefined;
  @ViewChild('tableData2') tableData2: Table | undefined;
  @ViewChild('tableData3') tableData3: Table | undefined;
  modal : boolean = false;
  dataSelected : any = [];
  materiasPrimas : any [] = [];
  typesMovements : any = ['ENTRADA', 'SALIDA']; 
  statuses : any = [];
  entries : any = [];
  outputs : any = []
  @ViewChild(MateriaPrimaRecuperadaComponent) cmpRecovery : MateriaPrimaRecuperadaComponent;
  hiddenOutputs : any = [];
  modalOutputs : boolean = false;
  detailsOutputs : any = [];

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

  //*
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
    this.entries = [];
    this.outputs = [];
    this.hiddenOutputs = [];
    this.form.reset();
    this.load = false;
    this.loadRankDates();
  }

  //*
  searchProduct() {
    let nombre: string = this.form.value.reference;
    this.productsService.obtenerItemsLike(nombre).subscribe(resp => this.products = resp);
  }

  //*
  selectedProduct() {
    let producto: any = this.form.value.reference;
    this.form.patchValue({
      item: producto,
      reference: this.products.find(x => x.prod_Id == producto).prod_Nombre
    });
  }

  //* Función para obtener los estados.
  getStatuses = () => this.svStatus.srvObtenerListaEstados().subscribe(data => { this.statuses = data.filter(x => [11,26,19,23,42].includes(x.estado_Id)) }, error => { this.msg.mensajeError(`Error`, `No se cargaron los estados`) });
  
  //* Función para obtener las materias primas.
  getMatPrimas = () => this.svMatPrima.GetInventarioMateriasPrimas().subscribe(datos => this.materiasPrimas = datos);
  
  //* Funcion que le va a colocar el nombre a la materia prima seleccionada
  changeMaterial(){
    let id : number = this.form.value.mpName;
    let matprima : any = this.materiasPrimas.filter((item) => item.id_Materia_Prima == id);
    
    this.form.patchValue({ 'mpId' : id, 'mpName' : matprima[0].nombre_Materia_Prima, });
  }

  //*Busqueda de información de mov. de peletizado
  searchInPeletizado(){
    this.entries = [];
    this.outputs = [];
    this.hiddenOutputs = [];

    if((this.form.value.rankDates).length == 2) {
      let date1 : any = moment(this.form.value.rankDates[0]).format('YYYY-MM-DD');
      let date2 : any = moment(this.form.value.rankDates[1]).format('YYYY-MM-DD');
      this.load = true;

      this.svIngPele.getMovementsPeletizado(date1, date2, this.validateUrl()).subscribe(data => {
        this.entries = data.filter(x => x.typeMov == 'ENTRADA');
        this.groupOutputs(data.filter(x => x.typeMov == 'SALIDA'));
        this.hiddenOutputs = data.filter(x => x.typeMov == 'SALIDA');
        
        this.load = false;
      }, error => {
        this.msg.mensajeError(`Error`, `No se ha podido consultar el ingreso de peletizado!`);
        this.load = false;
      }); 
    } else {
      this.msg.mensajeAdvertencia(`Advertencia`, `Debe elegir 2 fechas para consultar!`);
      this.load = false;
    } 
  }

  //* Agrupar las salidas peletizado por estado
  groupOutputs(dataOutputs : any){
    this.outputs = dataOutputs.reduce((a,b) => {
      if(!a.map(x => x.matPrimas.id).includes(b.matPrimas.id)) {
        if(!a.map(x => x.status).includes(b.status)) {
          a = [...a, b];
        }
      } else if(a.map(x => x.matPrimas.id).includes(b.matPrimas.id)) {
        if(!a.map(x => x.status).includes(b.status)) {
          a.push(b)
        }
      }
      return a;
    }, []);
  }


  groupQtyOutputs = (idMatPrima : number, state : string) => this.hiddenOutputs.filter(x => x.matPrimas.id == idMatPrima && x.status == state).reduce((a, b) => a += b.mov.qty, 0);

  viewModalDetailsOutputs(idMatPrima : number, state : any){
    this.detailsOutputs = [];
    this.modalOutputs = true;
    this.detailsOutputs = this.hiddenOutputs.filter(x => x.matPrimas.id == idMatPrima && x.status == state);
  } 

  //*
  validateUrl(){
    let ot: any = this.form.value.orderProduction;
    let mp: any = this.form.value.mpName;
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

  //*
  applyFilter = ($event, campo : any, table : any) => table!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  //*
  totalQty = (data) => data.reduce((a, b) => a += b.mov.initialQty, 0);

  //*
  viewPDF = (data) => data.typeMov == 'ENTRADA' ? this.cmpEntries.createPDF(data.mov.date, data.mov.date, data.mov.hour, `exportado`) : this.cmpOutputs.createPDF(data.mov.code, `exportado`);

  //*
  loadModalRecovery(data){
    if(data.status == 'PENDIENTE') {  
      this.modal = true
      this.cmpRecovery.title = false
      this.cmpRecovery.ArrayMateriaPrima = [];
      let user : any = this.cmpRecovery.usuarios.find(x => x.usua_Id == this.storage_Id).usua_Id;
      
      this.cmpRecovery.FormMateriaPrimaRecuperada.patchValue({ 'usuarioId' : this.storage_Id, 'usuarioNombre' : user, 'ConsecutivoSalida' : data.mov.id, 'MpObservacion' : `Salida de peletizado N° ${data.mov.id}`, 'MpingresoFecha' : new Date() })
      this.cmpRecovery.FormMateriaPrima.disable();
      this.cmpRecovery.ArrayMateriaPrima.push({ 'Id' : data.matPrimas.id, 'Nombre' : data.matPrimas.matPrima, 'Cant' : this.groupQtyOutputs(data.matPrimas.id, data.status), 'UndCant' : 'Kg', 'Cant2' : this.groupQtyOutputs(data.matPrimas.id, data.status) });
      this.cmpRecovery.outputsToUpdate = this.hiddenOutputs.filter(x => x.status == 'PENDIENTE').map(x => x.mov.code);
      //console.log(this.cmpRecovery.outputsToUpdate);
    } else this.modal = false;
  }
}
