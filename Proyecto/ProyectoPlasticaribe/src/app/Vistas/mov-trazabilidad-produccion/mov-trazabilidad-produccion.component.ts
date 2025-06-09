import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { AppComponent } from 'src/app/app.component';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { dataDesp } from '../Movimientos-IngresosDespacho/Movimientos-IngresosDespacho.component';
import { TrazabilidadProduccionService } from 'src/app/Servicios/Trazabilidad_Produccion/trazabilidad-produccion.service';
import moment from 'moment';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { CreacionExcelService } from 'src/app/Servicios/CreacionExcel/CreacionExcel.service';

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
    @ViewChild('dt') dt: Table | undefined;
    @ViewChild('dt2') dt2: Table | undefined;
    @ViewChild('dt3') dt3: Table | undefined;
    modal1 : boolean = false;
    modal2 : boolean = false;
    dataSelected : any = [];
    selectedRoll : any = null;
    loading : boolean = false;
    groupTraceability :any = [];
    process : any = [];
    motherRoll : number = 0;
    motherRollChild : number = 0;
    childTraceability: Array<any> = [];
    informationExcel : Array<any> = [];

  constructor(private appComponent: AppComponent,
      private frmBuilder: FormBuilder,
      private productsService: ProductoService,
      private msg: MensajesAplicacionService,
      private svCreateExcel: CreacionExcelService,
      private svTraceability : TrazabilidadProduccionService,
      private svProcess : ProcesosService,
      private svBagpro : BagproService, 
    ) {
      this.selectedMode = this.appComponent.temaSeleccionado;
      this.initForm();
  }
  
  //
  ngOnInit() {
    this.readStorage();
    //this.searchTraceability();
    this.getProcess();
    this.loadRankDates();
  }

  //Función para cargar fechas en el rango.
  loadRankDates(){
    let initialDate = new Date(moment().subtract(30, 'days').format('YYYY-MM-DD'));
    this.formFilters.patchValue({ 'startDate' : initialDate, 'endDate' : new Date() });
  }

  //
  readStorage() {
    this.storage_Id = this.appComponent.storage_Id;
    this.validateRole = this.appComponent.storage_Rol;
  }

  //
  initForm() {
    this.formFilters = this.frmBuilder.group({
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      item: [null],
      reference: [null],
      production: [null],
      orderProduction: [null, Validators.required],
      process: [null, Validators.required]
    });
  }

  //
  clearFields() {
    this.products = [];
    this.groupTraceability = [];
    this.traceability = []
    this.childTraceability = [];
    this.formFilters.reset();
    this.load = false;
    this.loadRankDates();
  }

  ///
  getProcess = () => this.svProcess.srvObtenerLista().subscribe(data => this.process = data.filter(x => [9,1,2,7,3,4,15].includes(x.proceso_Codigo)), error => this.msg.mensajeError(error));

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

  ///.
  searchTraceability(){
    let count : number = 0;
    this.groupTraceability = [];
    this.traceability = [];
    this.childTraceability = [];
    let date1 : any = moment(this.formFilters.value.startDate).format('YYYY-MM-DD');
    let date2 : any = moment(this.formFilters.value.endDate).format('YYYY-MM-DD');
    let process : string = this.formFilters.value.process;
    console.log(date1, date2);
    
    if(this.formFilters.valid) {
      this.load = true;
      this.svTraceability.getTraceability(date1, date2, process, this.validateRoute()).subscribe(data => {
        if(data) {
          if(data.length > 0) this.loadDataFromBagpro(data, count);
          else this.warningMsj(`Advertencia`, `No se encontraron resultados de búsqueda!`);
        } else this.warningMsj(`Advertencia`, `No se encontraron resultados con los filtros consultados`);
      }, error => {
        this.warningMsj(`Advertencia`, `Ocurrió un error al consultar la trazabilidad | ${error.status} ${error.statusText}`);
        this.load = false;
      });
    } else {
      this.warningMsj(`Advertencia`, `Debe completar los campos obligatorios`);
      this.load = false;
    }
  }

  ///.
  loadDataFromBagpro(data : any, count : number){
    data.forEach(x => {
      this.svBagpro.getRollProduction(x.motherRoll, `?process=${x.motherProcess.toUpperCase()}`).subscribe(dataBag => {
        count++
        x.motherWeight = dataBag.peso; 
        x.motherDate = dataBag.fecha;
        x.motherOperator = dataBag.operario;
        x.motherHour = dataBag.hora;
        x.motherTurn = dataBag.turno;
        this.groupTraceability.push(x);
      }, error => {
        console.log(error);
      });
    });
    this.groupTraceability.sort((a, b) => Number(a.motherRoll) - Number(b.motherRoll));
    this.load = false;
  }

  groupMotherRolls(data : any){ 
    this.groupTraceability = data.reduce((a, b) => {
      if(!a.map(x => x.motherRoll).includes(b.motherRoll)) {
        a = [...a, b];
      } else {

      }
      return a;
    }, []);

    this.load = false;
  }
  
  aplicarFiltro = ($event, campo : any, datos : Table) => datos!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  warningMsj(msg1 : string, msg2 : string){
    this.msg.mensajeAdvertencia(msg1, msg2);
    this.load = false;
  }

  ///.Función para buscar rollos Hijos-Madres
  searchRollsChildren(data : any, numberChild : number){
    let roll : number = numberChild == 1 ? data.motherRoll : data.childRoll;
    let process : string = numberChild == 1 ? data.motherProcess : data.childProcess;
    numberChild == 1 ? this.motherRoll = data.motherRoll : this.motherRollChild = data.childRoll;

    this.svTraceability.getTraceabilityForProduction(roll, process).subscribe(data => {
      if(data) {
        if(data.length > 0) {
          numberChild == 1 ? this.modal1 = true : this.modal2 = true;
          numberChild == 1 ? this.traceability = data : this.childTraceability = data;
        } else this.warningMsj('Advertencia', 'El rollo/bulto seleccionado no tiene productos resultantes');
      } else this.warningMsj('Advertencia', `El rollo/bulto seleccionado N° ${roll} no tiene productos resultantes`);
    }, error => {
      this.warningMsj('Error', `No se encontraron productos resultantes del rollo N° ${roll} en ${process.toUpperCase()}`);
      this.modal1 = false;
      this.modal2 = false;
    });
  }

  ///.
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
  
  ///.
  applyFilter = ($event, campo: any, table : any) => table!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  ///.
  totalWeight = () => this.groupTraceability.reduce((a,b) => a + b.motherWeight, 0);

  ///.
  totalQuantity1 = () => this.traceability.reduce((a,b) => a + b.childQuantity, 0);

  ///.
  totalQuantity2 = () => this.childTraceability.reduce((a,b) => a + b.childQuantity, 0);

  ///.
  exportExcel(){
    let date1 : any = moment(this.formFilters.value.startDate).format('YYYY-MM-DD');
    let date2 : any = moment(this.formFilters.value.endDate).format('YYYY-MM-DD');

    if(this.groupTraceability.length > 0) {
      this.svTraceability.getFormatTraceability('2025-05-01', '2025-06-06', 'SELLA', '?ot=135928').subscribe(data => {
        this.informationExcel = data;
        this.dataSearchedExcel();
      }, error => {
        console.log(error);
      });
    } else this.warningMsj('Advertencia', 'No hay registros para exportar!');
  }

  ///.
  dataSearchedExcel(){
    if(this.informationExcel.length > 0) {
      setTimeout(() => { this.loadSheetAndStyles(this.informationExcel); }, 500);
    } else this.msg.mensajeAdvertencia(`No hay datos para exportar`, `Debe haber al menos un registro en la tabla!`);
  }

  //Función que cargará la hoja de cálculo y los estilos.
  loadSheetAndStyles(data : any){  
    console.log(data);
    let title : any = `Trazabilidad de Producción`;  
    title += ` ${moment().format('DD-MM-YYYY')}`
    let fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } };
    let border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }, };
    let font = { name: 'Calibri', family: 4, size: 11, bold: true };
    let alignment = { vertical: 'middle', horizontal: 'center', wrapText: true};
    let workbook = this.svCreateExcel.formatoExcel(title, true);

    this.addNewSheet(workbook, title, fill, border, font, alignment, data);
    this.svCreateExcel.creacionExcel(title, workbook);
  }

  //Función para agregar una nueva hoja de calculo.
  addNewSheet(wb : any, title : any, fill : any, border : any, font : any, alignment : any, data : any){
    let fontTitle = { name: 'Calibri', family: 4, size: 15, bold: true };
    let worksheet : any = wb.worksheets[0];
    this.loadStyleTitle(worksheet, title, fontTitle, alignment);
    this.loadHeader(worksheet, fill, border, font, alignment);
    //this.loadInfoExcel(worksheet, this.dataExcel(data), border,  alignment);
  }

  //Cargar estilos del titulo de la hoja.
  loadStyleTitle(ws: any, title : any, fontTitle : any, alignment : any){
    ws.getCell('A1').alignment = alignment;
    ws.getCell('A1').font = fontTitle;
    ws.getCell('A1').value = title;
  }

  //Función para cargar los titulos de el header y los estilos.
  loadHeader(ws : any, fill : any, border : any, font : any, alignment : any){
    let rowHeader : any = ['A5','B5','C5','D5','E5','F5','G5','H5','I5', 'J5','K5','L5','M5']; 
    //ws.addRow([]);
    ws.addRow(this.loadFieldsHeader());
    ws.addRow(this.loadFieldsHeader());
    rowHeader.forEach(x => ws.getCell(x).fill = fill);
    rowHeader.forEach(x => ws.getCell(x).alignment = alignment);
    rowHeader.forEach(x => ws.getCell(x).border = border);
    rowHeader.forEach(x => ws.getCell(x).font = font);
    ws.mergeCells('A1:M3');

    this.loadSizeHeader(ws);
  }

  //Función para cargar el tamaño y el alto de las columnas del header.
  loadSizeHeader(ws : any){
    [5,6,7,9,10,11,12].forEach(x => ws.getColumn(x).width = 25);
    [3,4,13].forEach(x => ws.getColumn(x).width = 50);
    [1].forEach(x => ws.getColumn(x).width = 5);
    [2,7,8].forEach(x => ws.getColumn(x).width = 15);
  }

 //Función para cargar los nombres de las columnas del header
  loadFieldsHeader(){
    let headerRow = [
      'N°',
      'OT',
      'Cliente',
      'Consecutivo',
      'Item',
      'Referencia',
      'Peso',  
      'Proceso',  
      'Operario',
      'Fecha',
      'Hora',
      'OT',
      'Consecutivo',
      'Item',
      'Referencia',
      'Peso',  
      'Proceso',  
      'Operario',
      'Fecha',
      'Hora',
    ];
    return headerRow;
  }

  //Cargar información con los estilos al formato excel. 
  loadInfoExcel(ws : any, data : any, border : any, alignment : any){
    let formatNumber: Array<number> = [5,6,7,9,10,11,12];
    let contador : any = 6;
    let row : any = ['A','B','C','D','E','F','G','H','I','J','K','L','M']; 

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
  dataExcel(data : any){
    let info : any = [];
    let count : number = 0;
    data.forEach(x => {
      info.push([
        count += 1,
        x.item,
        x.client,
        x.reference,
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
    
}
