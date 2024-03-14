import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import moment from 'moment';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { SrvRollosEliminadosService } from 'src/app/Servicios/RollosDesechos/srvRollosEliminados.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsReporteRollosEliminados as defaultSteps } from 'src/app/data';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { CreacionExcelService } from 'src/app/Servicios/CreacionExcel/CreacionExcel.service';

@Component({
  selector: 'app-Reporte_RollosDesechos',
  templateUrl: './Reporte_RollosDesechos.component.html',
  styleUrls: ['./Reporte_RollosDesechos.component.css']
})
export class Reporte_RollosDesechosComponent implements OnInit {

  public formConsultaRollos !: FormGroup; /** Formulario de rollos con filtros de busqueda */
  public today : any = moment().format('YYYY-MM-DD'); /** Obtener fecha de hoy */
  public arrayProductos = []; /** Array que contendrá la info de los productos */
  idProducto : any = 0;
  public ArrayDocumento : any [] = []; /** Array que contendrá la info cargada en la tabla de consultar un filtro */
  public load : boolean = true; /** Carga la imagen de carga al momento de realizar una busqueda */
  _columnasSeleccionada : any [] = []; /**  */
  columnas : any[] = [];
  columnas2 : any[] = [];
  public storage_Id : number; /** Guarda el ID de la persona logueada */
  public storage_Nombre: any; /** Guarda el nombre de la persona logueada */
  public ValidarRol: number; /** valida el tipo de rol de la persona logueada */
  public storage_Rol: any; /** Guarda el rol de la persona logueada */
  public PesoTotalKg : number = 0; /** Peso total en Kg de rollos eliminados para mostrarlos en el PDF */
  public Item : any = null; /** variable ngModel que servirá para la consulta de tipo LIKE para traer nombres de productos */
  public arrayProcesos : any = [];
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private formbuilder : FormBuilder,
                private servicioProducto : ProductoService,
                  private servicioRollos : SrvRollosEliminadosService,
                    private AppComponent : AppComponent,
                      private servicioProcesos : ProcesosService,
                        private shepherdService: ShepherdService,
                          private msj : MensajesAplicacionService, 
                            private svExcel : CreacionExcelService) {
    
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.formConsultaRollos = this.formbuilder.group({
      OT : [null],
      fechas : [null],
      producto: [null, Validators.required],
      id_producto : [null],
      rollo : [null],
      Proceso : [null],
    });
  }

  ngOnInit() {
    this.obtenerProcesos();
    this.lecturaStorage();
    this.loadRankDates();
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
  }

  //Función para cargar fechas en el rango. 
  loadRankDates(){
    let initialDate = new Date(moment().subtract(7, 'days').format('YYYY-MM-DD'));
    this.formConsultaRollos.patchValue({ 'fechas' : [initialDate, new Date()] });
  }

  tutorial(){
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  /** Seleccionar el id del producto luego de seleccionar su nombre */
  selectEventProducto() {
    let expresion : any = /^[0-9]*(\.?)[ 0-9]+$/;
    this.idProducto = this.formConsultaRollos.value.producto;

    if(this.idProducto.match(expresion) != null) {
      this.servicioProducto.obtenerNombreProductos(this.formConsultaRollos.value.producto).subscribe(dataProducto => {
        this.formConsultaRollos.patchValue({
          producto: dataProducto,
          id_producto : this.idProducto,
        });
      });
    } else {
      this.msj.mensajeAdvertencia(`Advertencia`, 'Debe cargar un item válido');
      this.idProducto = 0;
    }
  }

  /** Limpiar campos de la vista */
  LimpiarCampos() {
    this.formConsultaRollos.reset();
    this.load = true;
    this.ArrayDocumento = [];
    this.loadRankDates();
  }

  /** Cargar los procesos de donde puede venir el rollo. */
  obtenerProcesos = () => this.servicioProcesos.srvObtenerLista().subscribe(data => { this.arrayProcesos = data.filter(x => [3,4,8,7,2,1,9,5,6].includes(x.proceso_Codigo)); });

  //Función que validará la ruta del API que será consultada.
  urlAPI(){
    let url : string = ``;
    let ot : any = this.formConsultaRollos.value.OT;
    let item : any = this.formConsultaRollos.value.id_producto;
    let roll : any = this.formConsultaRollos.value.rollo;
    let process : any = this.formConsultaRollos.value.Proceso;
    
    if(ot != null) url += `ot=${ot}`;
    if(item != null) url.length > 0 ? url += `&item=${item}` : url += `item=${item}`;
    if(roll != null) url.length > 0 ? url += `&roll=${roll}` : url += `roll=${roll}`;
    if(process != null) url.length > 0 ? url += `&process=${process}` : url += `process=${process}`;
    url.length > 0 ? url = `?${url}` : url = ``;
    console.log(url)
    return url;
  }

  //Función que realizará la busqueda de los rollos eliminados.
  validateSearch(){
    this.load = false;
    this.ArrayDocumento = [];
    let date1 : any = moment(this.formConsultaRollos.value.fechas[0]).format('YYYY-MM-DD');
    let date2 : any = moment(this.formConsultaRollos.value.fechas[1]).format('YYYY-MM-DD');

    this.servicioRollos.getRemovedRolls(date1, date2, this.urlAPI()).subscribe(data => {
      if(data.length > 0) this.parametrosTablaRollos(data);
      else {
        this.msj.mensajeAdvertencia(`Advertencia`, 'No se encontraron resultados de búsqueda!');
        this.load = true;
      } 
    }, error => {
      this.load = true;
      this.msj.mensajeError(`Error`, 'Error al consultar los rollos eliminados!');
    });
  }

   /** Función para cargar los productos en el datalist de la vista */
  obtenerProductos() {
    this.arrayProductos = [];
    let campoItem : string = this.formConsultaRollos.value.producto;
    if (campoItem.length > 2 && campoItem != null) this.servicioProducto.obtenerItemsLike(this.Item.trim()).subscribe(dataProducto => { this.arrayProductos = dataProducto; });
  }

  /** Campos que saldrán en la tabla al momento de consultar los filtros. */
  parametrosTablaRollos(datos : any) {
    datos.forEach(x => {
      console.log(x)
      let info : any = {
        'Orden' : x.rollo_OT,
        'Rollo' : x.rollo_Id,
        'Cliente' : x.rollo_Cliente,
        'Item_Id' : x.prod_Id,
        'Item' : x.prod_Nombre,
        'Ancho' : x.rollo_Ancho,
        'Largo' : x.rollo_Largo,
        'Fuelle' : x.rollo_Fuelle,
        'Peso': this.formatonumeros(parseFloat(x.rollo_PesoNeto)),
        'Unidad': (x.undMed_Id.trim() == 'Cms' && x.proceso_Nombre == 'Empaque') ? 'Kg' : x.undMed_Id,
        'Material' : x.material_Nombre,
        'Calibre' : x.rollo_Calibre,
        'Operario' : x.rollo_Operario,
        'Fecha' : x.rollo_FechaIngreso.replace('T00:00:00', ''),
        'Turno': x.turno_Nombre,
        'Proceso' : x.proceso_Nombre,
        'PesoNumero' : parseFloat(x.rollo_PesoNeto),
        'Fecha_Eliminacion' : x.rollo_FechaEliminacion.replace('T00:00:00', ''),
        'Hora_Eliminacion' : x.rollo_HoraEliminacion,
        'Observacion' : x.observacion == null ? '' : x.observacion,
        'Falla' : x.falla_Nombre,
      }
      this.ArrayDocumento.push(info);
      this.mostrarColumnas();
      this.load = true;
    });
  }

  /** Mostrar en la tabla las columnas elegidas en el Input-Select que se encuentra en la parte superior de la tabla. */
  mostrarColumnas() {
    this.columnas = [
      { header: 'Calibre', field: 'Calibre'},
      { header: 'Material', field: 'Material'},
      { header: 'Operario', field: 'Operario'},
      { header: 'Turno', field: 'Turno'},
      { header: 'Ancho', field: 'Ancho'},
      { header: 'Largo', field: 'Largo'},
      { header: 'Fuelle', field: 'Fuelle'},
    ];
  }  

  /** Exportar reporte de rollos en excel */
  exportarExcel(){
    if(this.ArrayDocumento.length > 0) {
      this.load = false;
      setTimeout(() => { this.loadSheetAndStyles(); }, 2000); 
    } else this.msj.mensajeAdvertencia(`No hay datos para exportar`, `Debe haber al menos un registro en la tabla!`);
  }

  //Función que cargará la hoja de cálculo y los estilos.
  loadSheetAndStyles(){
    let date1 : any = moment(this.formConsultaRollos.value.fechas[0]).format('DD-MM-YYYY');
    let date2 : any = moment(this.formConsultaRollos.value.fechas[1]).format('DD-MM-YYYY');
    let title = `Rollos Eliminados de ${date1} hasta ${date2}`;
    let fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } };
    let border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    let alignment = { vertical: 'middle', horizontal: 'center' };
    let font = { name: 'Calibri', family: 4, size: 11, bold: true };
    let workbook = this.svExcel.formatoExcel(title, true)

    this.addNewSheet(workbook, title, fill, border, font, alignment);
    this.svExcel.creacionExcel(`Reporte rollos eliminados`, workbook)
    this.load = true;
    this.msj.mensajeConfirmacion(`¡Información exportada a excel!`, 'Archivo generado con éxito!');
  }

  //Función para agregar una nueva hoja de calculo.
  addNewSheet(wb : any, title : any, fill : any, border : any, font : any, alignment : any){
    let fontTitle = { name: 'Calibri', family: 4, size: 15, bold: true }; 
    let worksheet : any = wb.worksheets[0];
    this.loadStyleTitle(worksheet, title, fontTitle, alignment);
    this.loadHeader(worksheet, fill, border, font, alignment);
    this.loadInfoExcel(worksheet, this.dataExcel());
  }

  //Cargar estilos del titulo de la hoja.
  loadStyleTitle(ws: any, title : any, fontTitle : any, alignment : any){
    ws.getCell('A1').alignment = alignment;
    ws.getCell('A1').font = fontTitle;
    ws.getCell('A1').value = title;
  }

  //Función para cargar los titulos de el header y los estilos.
  loadHeader(ws : any, fill : any, border : any, font : any, alignment : any){
    let headerRow = ws.addRow(this.loadFieldsHeader());
    
    headerRow.eachCell((cell) => {
      cell.fill = fill;
      cell.border = border;
      cell.alignment = alignment;
      cell.font = font;
    });

    ws.mergeCells('A1:T3');
    this.loadSizeHeader(ws);
  }

  //Función para cargar el tamaño de las columnas del header.
  loadSizeHeader(ws : any){
    let widths : number[] = [5,10,10,50,10,50,10,15,10,10,10,15,10,40,20,15,30,20,20,40];
    let columns : number[] = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]; 
    let count : number = 0;
    
    columns.forEach(x => {
      ws.getColumn(x).width = widths[count];
      count++;
    });
  }

  loadInfoExcel(ws : any, data : any){
    let formatNumber: Array<number> = [6,8,9,10,12];
    formatNumber.forEach(x => ws.getColumn(x).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    data.forEach(x => { 
      let row = ws.addRow(x); 
      let peso = row.getCell(7);
      let color = 'F1948A';
      peso.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
    }); 
  }

  //.Función que contendrá la info al documento excel. 
  dataExcel() {
    let info : any = [];
    let count : number = 0;
    for (const item of this.ArrayDocumento) {
      count++;
      const data  : any = [
        count,
        item.Orden, 
        item.Rollo, 
        item.Cliente, 
        item.Item_Id, 
        item.Item, 
        item.Peso, 
        item.Unidad, 
        item.Ancho, 
        item.Largo, 
        item.Fuelle, 
        item.Material, 
        item.Calibre, 
        item.Operario, 
        item.Fecha, item.Turno, 
        item.Falla, 
        item.Fecha_Eliminacion, 
        item.Hora_Eliminacion, 
        item.Observacion];

      info.push(data);
    }
    return info;
  }

  //Función para cargar los nombres de las columnas del header
  loadFieldsHeader(){
    let header = [
      "N°",
      "OT", 
      "Rollo", 
      "Cliente", 
      "Item", 
      "Referencia", 
      "Cantidad", 
      "Presentación", 
      "Ancho", 
      "Largo",
      "Fuelle", 
      "Material", 
      "Calibre",
      "Operario", 
      "Fecha Producción", 
      "Turno", 
      "Falla", 
      "Fecha Eliminación", 
      "Hora Eliminación", 
      "Observación"
    ];
    return header;
  }

  /** Prime NG */
  @Input() get columnasSeleccionada(): any[] {
    return this._columnasSeleccionada;
  }

  set columnasSeleccionada(val: any[]) {
    this._columnasSeleccionada = this.columnas.filter(col => val.includes(col));
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }
}
