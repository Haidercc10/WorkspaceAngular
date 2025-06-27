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
  
  //Funciones con las que inicia el módulo. 
  ngOnInit() {
    this.readStorage();
    this.getProcess();
    this.loadRankDates();
  }

  //Función para cargar fechas en el rango.
  loadRankDates(){
    let initialDate = new Date(moment().subtract(30, 'days').format('YYYY-MM-DD'));
    this.formFilters.patchValue({ 'startDate' : initialDate, 'endDate' : new Date() });
  }

  ///.Leer datos del almacenamiento del navegador.
  readStorage() {
    this.storage_Id = this.appComponent.storage_Id;
    this.validateRole = this.appComponent.storage_Rol;
  }

  //Inicializar formulario de producción. 
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

  //Limpiar campos luego de consultar.
  clearFields() {
    this.products = [];
    this.groupTraceability = [];
    this.traceability = []
    this.childTraceability = [];
    this.formFilters.reset();
    this.load = false;
    this.loadRankDates();
  }

  ///Obtener procesos especificos.
  getProcess = () => this.svProcess.srvObtenerLista().subscribe(data => this.process = data.filter(x => [9,1,2,7,3,4,15].includes(x.proceso_Codigo)), error => this.msg.mensajeError(error));

  // Buscar producto en el campo 
  searchProduct() {
    let nombre: string = this.formFilters.value.reference;
    this.productsService.obtenerItemsLike(nombre).subscribe(resp => this.products = resp);
  }

  // Seleccionar el producto luego de consultarlo
  selectedProduct() {
    let producto: any = this.formFilters.value.reference;
    this.formFilters.patchValue({
      item: producto,
      reference: this.products.find(x => x.prod_Id == producto).prod_Nombre
    });
  }

  ///. Consulta para buscar la trazabilidad de una OT. 
  searchTraceability(){
    let count : number = 0;
    this.groupTraceability = [];
    this.traceability = [];
    this.childTraceability = [];
    let date1 : any = moment(this.formFilters.value.startDate).format('YYYY-MM-DD');
    let date2 : any = moment(this.formFilters.value.endDate).format('YYYY-MM-DD');
    let process : string = this.formFilters.value.process;
    this.load = true;
    
    if(this.formFilters.valid) {
      this.svTraceability.getTraceability(date1, date2, process, this.validateRoute()).subscribe(data => {
        if(data) {
          if(data.length > 0) {
            let dataExtMatPrima : any[] = data.filter(x => ['EXT', 'MATPRIMA'].includes(x.motherProcess_Id));
            let dataImp : any[] = data.filter(x => ['IMP'].includes(x.motherProcess_Id));
            data = dataExtMatPrima.length > 0 ? dataExtMatPrima : dataImp;
            console.log(data);
            this.loadDataFromBagpro(data, count);
          } else this.warningMsj(`Advertencia`, `No se encontraron resultados de búsqueda!`);
        } else this.warningMsj(`Advertencia`, `No se encontraron resultados con los filtros consultados`);
      }, error => { this.warningMsj(`Advertencia`, `Ocurrió un error al consultar la trazabilidad | ${error.status} ${error.statusText}`); });
    } else this.warningMsj(`Advertencia`, `Debe completar los campos obligatorios`);
  }

  ///. Cargar datos de bagpro para productos madre.
  loadDataFromBagpro(data : any, count : number){
    data.forEach(x => {
      count++
      this.svBagpro.getRollProduction(x.motherRoll, `?process=${x.motherProcess.toUpperCase()}`).subscribe(dataBag => {
        count++
        x.motherWeight = dataBag.peso == null ? 0 : dataBag.peso; 
        x.motherDate = dataBag.fecha;
        x.motherOperator = dataBag.operario;
        x.motherHour = dataBag.hora;
        x.motherTurn = dataBag.turno;
        this.groupTraceability.push(x);
      }, error => { console.log(error); });
      console.log(count, data.length);
      
      if(count == data.length) {
        this.groupTraceability.sort((a, b) => Number(a.motherRoll) - Number(b.motherRoll));
        this.load = false;
      }
    });
    //this.load = false;
  }
  
  ///. Aplicar el filtro en las tablas 
  aplicarFiltro = ($event, campo : any, datos : Table) => datos!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  ///. Función para mostrar mensajes de advertencia y parar la carga de la pagina.
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

  ///. Validar la ruta de busqueda según los filtros consultados. 
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
  
  ///.Aplicar filtro en las tablas. 
  applyFilter = ($event, campo: any, table : any) => table!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  ///. Total en la tabla de trazabilidad madre. 
  totalWeight = () => this.groupTraceability.reduce((a,b) => a + b.motherWeight, 0);

  ///. Total en la tabla de trazabilidad media. 
  totalQuantity1 = () => this.traceability.reduce((a,b) => a + b.childQuantity, 0);

  ///. Total en la tabla de trazabilidad hija. 
  totalQuantity2 = () => this.childTraceability.reduce((a,b) => a + b.childQuantity, 0);

  ///.Exportación del formato a excel.
  exportExcel(){
    this.load = true;
    this.informationExcel = [];
    let date1 : any = moment(this.formFilters.value.startDate).format('YYYY-MM-DD');
    let date2 : any = moment(this.formFilters.value.endDate).format('YYYY-MM-DD');
    let process : string = this.formFilters.value.process;
    let roll : number = this.formFilters.value.roll;
    let count : number = 0;

    if(this.groupTraceability.length > 0) {
      this.svTraceability.getFormatTraceability(date1, date2, process, this.validateRoute()).subscribe(data => {
        if(data) {
          if(data.length > 0) {
            this.informationExcel = data;
            this.informationExcel.forEach(x => {
              this.svBagpro.getRollProduction(x.tr.trz_EtiquetaAnterior, `?process=${x.oldProcess.toUpperCase()}`).subscribe(dataBag => {
                count++
                x.weight = dataBag.peso; 
                x.date = dataBag.fecha;
                x.operator = dataBag.operario;
                x.hour = dataBag.hora;
                x.turn = dataBag.turno;
                x.clientBagpro = dataBag.cliente;
                if(count == this.informationExcel.length) {
                  this.informationExcel.sort((a, b) => Number(a.tr.trz_EtiquetaAnterior) - Number(b.tr.trz_EtiquetaAnterior));
                  this.informationExcel.sort((a, b) => a.oldProcess.localeCompare(b.oldProcess));
                  this.dataSearchedExcel();
                  this.load = false;
                }
                this.load = false;
              }, error => { 
                console.log(error);
                this.load = false;
              });
               if(count == this.informationExcel.length) this.load = false;
            });
          } else this.warningMsj('Advertencia', 'No se encontraron datos para exportar!');
        } else this.warningMsj('Advertencia', 'No se encontró información en la consulta!');
      }, error => {
        this.msg.mensajeError('Error', `Error consultando la información a exportar en el formato excel. | ${error.status} ${error.statusText}`);
        this.load = false;
      });
    } else this.warningMsj('Advertencia', 'No hay registros para exportar!');
  }

  ///.
  dataSearchedExcel(){
    //if(this.informationExcel.length > 0) {
      //setTimeout(() => { 
        this.loadSheetAndStyles(this.informationExcel); 
      //}, 500);
    //} else this.msg.mensajeAdvertencia(`No hay datos para exportar`, `Debe haber al menos un registro en la tabla!`);
  }

  //Función que cargará la hoja de cálculo y los estilos.
  loadSheetAndStyles(data : any){  
    let title : any = `Trazabilidad de Producción`;  
    //title += ` ${moment().format('DD-MM-YYYY')}`
    let fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } };
    let border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }, };
    let font = { name: 'Calibri', family: 4, size: 10, bold: true };
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
    this.loadHeader1(worksheet, fill, border, font, alignment);
    this.loadHeader2(worksheet, fill, border, font, alignment);
    this.loadInfoExcel(worksheet, this.dataExcel(data), border,  alignment);
  }

  //Cargar estilos del titulo de la hoja.
  loadStyleTitle(ws: any, title : any, fontTitle : any, alignment : any){
    ws.getCell('A1').alignment = alignment;
    ws.getCell('A1').font = fontTitle;
    ws.getCell('A1').value = title;
  }

    //Función para cargar los titulos de el header y los estilos.
  loadHeader1(ws : any, fill : any, border : any, font : any, alignment : any){
    let rowHeader1 : any = ['A5','B5','C5','D5','E5','F5','G5','H5','I5','J5','K5','L5','M5','N5','O5','P5','Q5','R5','S5','T5','U5']; 
    //ws.addRow([]);
    ws.addRow(this.loadFieldsHeader2());
    ws.mergeCells('B5:K5');
    ws.mergeCells('L5:U5');

    rowHeader1.forEach(x => ws.getCell(x).fill = fill);
    rowHeader1.forEach(x => ws.getCell(x).alignment = alignment);
    rowHeader1.forEach(x => ws.getCell(x).border = border);
    rowHeader1.forEach(x => ws.getCell(x).font = font);

    ws.getCell('L5').value = 'Información producto Hijo';
    ws.getCell('B5').font = { name: 'Calibri', family: 4, size: 12, bold: true };
    ws.getCell('L5').font = { name: 'Calibri', family: 4, size: 12, bold: true };
    ws.getCell('B5').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '91d2ff' } };
    ws.getCell('L5').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'a4ffa4' } };
    //this.loadSizeHeader(ws);
  }

  //Función para cargar los titulos de el header y los estilos.
  loadHeader2(ws : any, fill : any, border : any, font : any, alignment : any){
    let rowHeader2 : any = ['A6','B6','C6','D6','E6','F6','G6','H6','I6','J6','K6','L6','M6','N6','O6','P6','Q6','R6','S6','T6','U6']; 
    //ws.addRow([]);
    ws.addRow(this.loadFieldsHeader());

    rowHeader2.forEach(x => ws.getCell(x).fill = fill);
    rowHeader2.forEach(x => ws.getCell(x).alignment = alignment);
    rowHeader2.forEach(x => ws.getCell(x).border = border);
    rowHeader2.forEach(x => ws.getCell(x).font = font);
    
    ws.mergeCells('A1:U3');
    this.loadSizeHeader(ws);
  }

  //Función para cargar el tamaño y el alto de las columnas del header.
  loadSizeHeader(ws : any){
    [3,6,13,16,19].forEach(x => ws.getColumn(x).width = 50);
    [1].forEach(x => ws.getColumn(x).width = 5);
    [9,10].forEach(x => ws.getColumn(x).width = 20);
    [4,14,18,20,].forEach(x => ws.getColumn(x).width = 12);
    [2,5,7,8,11,12,15,17,21].forEach(x => ws.getColumn(x).width = 10);
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
      'Cliente',
      'Consecutivo',
      'Item',
      'Referencia',
      'Peso/Cant.',  
      'Proceso',  
      'Operario',
      'Fecha',
      'Hora',
    ];
    return headerRow;
  }

  loadFieldsHeader2(){
    let headerRow = [
      '',
      'Información producto Madre',
      'Información producto Hijo',
    ];
    return headerRow;
  }

  //Cargar información con los estilos al formato excel. 
  loadInfoExcel(ws : any, data : any, border : any, alignment : any){
    let formatNumber: Array<number> = [7,17];
    let contador : any = 7;
    let row : any = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U']; 

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
        x.tr.trz_OtAnterior,
        x.clientBagpro,
        x.tr.trz_EtiquetaAnterior,
        x.tr.prod_Anterior,
        x.oldReference,
        x.weight,
        x.tr.proceso_Anterior,
        x.operator, 
        x.date,
        x.hour,
        x.tr.trz_Ot,
        x.client,
        x.tr.trz_Etiqueta, 
        x.tr.prod_Id,
        x.newReference,
        x.tr.presentacion == 'Kg' ? x.tr.trz_PesoNeto : x.tr.trz_Cantidad == 0 ? x.tr.trz_PesoNeto : x.tr.trz_Cantidad,
        x.tr.proceso_Id,
        x.newOperator, 
        x.tr.trz_Fecha.replace('T00:00:00', ''),
        x.tr.trz_Hora,
      ]);
    });
    return info;
  }
    
}
