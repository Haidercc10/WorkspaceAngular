import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { Table } from 'primeng/table';
import { AppComponent } from 'src/app/app.component';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { DesperdicioService } from 'src/app/Servicios/Desperdicio/desperdicio.service';
import { MaterialProductoService } from 'src/app/Servicios/MaterialProducto/materialProducto.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { defaultStepOptions, stepsReporteDesperdicio as defaultSteps } from 'src/app/data';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';

@Component({
  selector: 'app-Reporte_Desperdicios',
  templateUrl: './Reporte_Desperdicios.component.html',
  styleUrls: ['./Reporte_Desperdicios.component.css']
})

export class Reporte_DesperdiciosComponent implements OnInit {

  @ViewChild('dt') dt: Table | undefined;
  @ViewChild('dt2') dt2: Table | undefined;
  formFiltros !: FormGroup; /** Formulario de filtros */
  load: boolean = true; /** Variable que realizará la carga al momento de consultar */
  arrayMateriales = []; /** array que contendrá los materiales de materia prima*/
  arrayProductos = []; /** array que cargará los productos con la consulta de tipo LIKE*/
  idProducto: any = 0; /** ID de producto que se cargará en el campo ITEM, pero se mostrará el nombre. */
  arrayConsulta : any =[]; /** Array que cargará la consulta inicial */
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  arrayModal : any = []; /** Array que se cargará en la tabla del modal con la info de la OT Seleccionada */
  dialog : boolean = false; /** Variable que mostrará o no, el modal */
  totalDesperdicio : number = 0; /** Variable que contendrá la cantidad total de desperdicio por OT. */
  otSeleccionada : number = 0; /** Variable que contendrá la OT Seleccionada en la tabla */
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  arrayDesperdicios : any = []; //Array que guardará la información total de los desperdicios consultados.
  date : any | undefined = [new Date(), new Date()] //Variable que guardará la fecha seleccionada en el campo de rango de fechas

  constructor(private formBuilder : FormBuilder,
                private servicioMateriales : MaterialProductoService,
                  private servicioProductos : ProductoService,
                    private servicioDesperdicios : DesperdicioService,
                      private AppComponent : AppComponent,
                          private shepherdService: ShepherdService,
                            private msj : MensajesAplicacionService, 
                              private svcPDF : CreacionPdfService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.formFiltros = this.formBuilder.group({
      OT : [null],
      Producto : [null],
      productoId : [null],
      RangoFechas : [null, null],
      Material : [null],
    });
  }

  /** Función que inicializará otras funciones al momento de cargar este componente. */
  ngOnInit() {
    this.cargarMateriales();
    this.lecturaStorage();
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
  }

  // Funcion que va a hacer que se inicie el tutorial in-app
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

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  /** Función que cargará los materiales en el combobox.*/
  cargarMateriales = () => this.servicioMateriales.srvObtenerLista().subscribe(data => this.arrayMateriales = data.filter(x => x.material_Id != 1));

  /** Función que cargará los productos con una consulta de tipo LIKE */
  likeCargarProductos(){
    this.arrayProductos = [];
    let producto : any = this.formFiltros.value.Producto;

    if(producto != null) this.servicioProductos.obtenerItemsLike(producto).subscribe(dataProducto => { this.arrayProductos = dataProducto; });
  }

  /** Función que cargará el ID del producto en el campo, pero mostrará el nombre */
  seleccionarProducto() {
    let expresion : any = /^[0-9]*(\.?)[ 0-9]+$/;
    this.idProducto = this.formFiltros.value.Producto;

    if(this.idProducto.match(expresion) != null) {
      let nuevo: any[] = this.arrayProductos.filter((item) => item.prod_Id == this.idProducto);
      this.formFiltros.patchValue({
        productoId : nuevo[0].prod_Id,
        Producto: nuevo[0].prod_Nombre,
      });
    } else this.msj.mensajeAdvertencia(`Advertencia`, 'Debe cargar un Item válido.');
  }

  /** Función que consultará según los campos de busqueda diferentes de vacio. */
  Consultar() {
    let fecha : any = this.formFiltros.value.RangoFechas;
    let fecha1 : any = fecha == null ? this.today : moment(this.formFiltros.value.RangoFechas[0]).format('YYYY-MM-DD');
    let fecha2 : any = ['Fecha inválida', null, undefined, ''].includes(fecha == null ? fecha : fecha[1]) ? this.today : moment(this.formFiltros.value.RangoFechas[1]).format('YYYY-MM-DD');
    this.arrayConsulta = [];
    this.arrayDesperdicios = [];
    this.load = false;
    let ordenesTrabajo : any = [];

    setTimeout(() => {
      this.servicioDesperdicios.getDesperdicio(fecha1, fecha2, this.rutaAPI()).subscribe(data => {
        this.arrayDesperdicios = data;
        if (data.length == 0) {
          this.msj.mensajeAdvertencia(`Advertencia`, `No se encontraron resultados de búsqueda con los filtros consultados!`);
          this.load = true;
        } else {
          for (let i = 0; i < data.length; i++) {
            if(ordenesTrabajo.indexOf(data[i].ot) == -1) {
              ordenesTrabajo.push(data[i].ot);
              this.llenarTabla(data[i]);
            } 
          }
          setTimeout(() => { this.load = true; }, 1000);
        }
      });
    }, 500);
  }

  //Función que valida la ruta que se utilizará en la consulta en el API.
  rutaAPI() {
    let OT : any = this.formFiltros.value.OT;
    let material : any = this.formFiltros.value.Material;
    let item : any = this.formFiltros.value.productoId;
    let ruta : string = '';

    if (OT != null && material != null && item != null) ruta = `?OT=${OT}&material=${material}&item=${item}`;
    else if (OT != null && material != null) ruta = `?OT=${OT}&material=${material}`;
    else if (OT != null && item != null) ruta = `?OT=${OT}&item=${item}`;
    else if (material != null && item != null) ruta = `?material=${material}&item=${item}`;
    else if (OT != null) ruta = `?OT=${OT}`;
    else if (item != null) ruta = `?item=${item}`;
    else if (material != null) ruta = `?material=${material}`;
    else ruta = ``;

    return ruta;
  }

  /** Llenar la tabla inicial de resultados de busqueda */
  llenarTabla(datos : any) {
    datos.observacion = datos.observacion.replace('Rollo #', '');
    datos.observacion = datos.observacion.includes('Ext') ? datos.observacion.replace(' en ProcExtrusion Bagpro', '') : datos.observacion.replace(' en ProcDesperdicio Bagpro', '');
    const registro : any = {
      'OT' : datos.ot,
      'Item' : datos.item,
      'Referencia' : datos.referencia,
      'Material' : datos.material,
      'Impreso' : datos.impreso,
      'Cantidad' : this.calculateTotalOT(datos.ot),
      'Presentacion' : 'Kg',
      'No_Conformidades' : this.calculateNoConformityOT(datos.ot), 
      'Proceso' : datos.proceso,
      'Fecha' : datos.fecha.replace('T00:00:00', ''),
      'Maquina' : datos.maquina,
      'Operario' : datos.operario,
      'No_Conformidad' : datos.falla,
      'Observacion' : datos.observacion,
    }
    this.arrayConsulta.push(registro);
  }

  /** Función para que al momento de seleccionar una OT de la tabla se cargue el modal. */
  consultarOTenTabla(item : any){
    this.arrayModal = [];
    this.otSeleccionada = item.OT;
    this.load = false;
    this.servicioDesperdicios.getDesperdicioxOT(item.OT).subscribe(dataDesperdicios => {
      for (let index = 0; index < dataDesperdicios.length; index++) {
        this.llenarModal(dataDesperdicios[index]);
      }
      this.pesoTotalDesperdicio();
    });
    setTimeout(() => { this.load = true }, 500);
  }

  /** Función para llenar la tabla de modal. */
  llenarModal(datos : any){
    datos.observacion = datos.observacion.replace('Rollo #', '');
    datos.observacion = datos.observacion.includes('ProcExtrusion') ? datos.observacion.replace(' en ProcExtrusion Bagpro', '') : datos.observacion.replace(' en ProcDesperdicio Bagpro', '');
    this.dialog = true;
    this.otSeleccionada = datos.ot;

    const dataCompleta : any = {
      'OT' : datos.ot,
      'Bulto' : datos.bulto,
      'Item' : datos.item,
      'Referencia' : datos.referencia,
      'Peso' : datos.cantidad,
      'Cantidad' : this.formatonumeros(datos.cantidad),
      'Und' : datos.presentacion,
      'Proceso' : datos.proceso,
      'Material' : datos.material,
      "No_Conformidad" : datos.falla,
      'No_Conformidades' : this.calculateNoConformityOT(datos.ot),
      'Impreso' : datos.impreso,
      'Maquina' : datos.maquina,
      'Operario' : datos.operario,
      'Fecha' : datos.fecha.replace('T00:00:00', ''),
      'Observacion' : datos.observacion,
    }
    this.arrayModal.push(dataCompleta);
  }

  /** Función para limpiar filtros de busqueda */
  limpiarCampos(){
    this.formFiltros.reset();
    this.arrayConsulta = [];
    this.arrayModal = [];
    this.arrayDesperdicios = [];
    this.formFiltros.patchValue({ RangoFechas : [new Date(), new Date()] }); 
  }

  /** Función que calcula la cantidad total del desperdicio */
  pesoTotalDesperdicio(){
    setTimeout(() => {
      this.totalDesperdicio = 0;
      if(this.dt2.filteredValue != null) {
        for (let indx = 0; indx < this.dt2.filteredValue.length; indx++) {
          this.totalDesperdicio += this.dt2.filteredValue[indx].Peso;
        }
      } else {
      for (let index = 0; index < this.arrayModal.length; index++) {
            this.totalDesperdicio += this.arrayModal[index].Peso;
          }
    }
    }, 500);
  }

  // Funcion que permitirá filtrar la información de la tabla
  aplicarfiltro($event, campo : any, valorCampo : string){
    this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
  }

  // Funcion que permitirá filtrar la información de la tabla
  aplicarfiltro2($event, campo : any, valorCampo : string){
    this.dt2!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
    this.pesoTotalDesperdicio();
  }

  // Función para crear tanto el PDF del modal como el consolidado por OT.
  newPdf(){
    if(this.arrayConsulta.length > 0){
      this.load = false;
      let fecha : any = this.formFiltros.value.RangoFechas;
      let date1 : any = fecha == null ? this.today : moment(this.formFiltros.value.RangoFechas[0]).format('YYYY-MM-DD');
      let date2 : any = fecha == null ? this.today : moment(this.formFiltros.value.RangoFechas[1]).format('YYYY-MM-DD');
      let title : string = this.dialog ? `Reporte Desperdicios \nOT N° ${this.otSeleccionada}` : `Reporte Desperdicios \n ${date1} a ${date2}`;
      this.arrayModal = this.arrayModal.filter(item => item.OT == this.otSeleccionada);
      let content: any[] = this.dialog ? this.contentPDF(this.arrayModal) : this.contentPDF(this.arrayConsulta);
      this.svcPDF.formatoPDF(title, content);
      setTimeout(() => { this.load = true; }, 2000); 
    } else this.msj.mensajeAdvertencia(`Advertencia`, `No hay información para generar el reporte.`);
  }

  //Adición de contenido al pdf. 
  contentPDF(data : any) : any {
    let content : any[] = [];
    let groupedInformation : any = this.groupedInfo(data);
    let detailedInformation : any = this.dialog ? this.detailedInfo(data) : this.detailedInfo(this.arrayDesperdicios);

    content.push(this.headerTableConsolidated(groupedInformation));
    content.push(this.headerTableDetails(detailedInformation));
    content.push(this.totalInfo());
    return content;
  }


  //Encabezado de tabla consolidada del PDF
  headerTableConsolidated(data : any) {
    let columns : any[] = ['N°', 'OT', 'Item', 'Referencia', 'No_Conformidades', 'Cantidad', 'Presentacion'];
    let widths: Array<string> = ['5%', '10%', '10%', '40%', '15%', '10%', '10%'];
    return {
      margin: [0, 0, 0, 20],
      borders : 'noBorders',
      table : {
        headerRows : 2,
        widths : widths, 
        body : this.builderTableBody(data, columns, 'Información consolidada de desperdicios'),
      },
      fontSize : 8,
      layout : {
        fillColor : function(rowIndex) {
          return ([0, 1].includes(rowIndex)) ? '#DDDDDD' : null; 
        },
      }
    }
  }

  //Información consolidada de la(s) orden(es) de trabajo agrupada(s) por OT.
  groupedInfo(data : any){
    let info : any = [];
    data.forEach(x => {
      if(!info.map(y => y.OT).includes(x.OT)) {
        let object : any = {
          'N°' : info.length + 1,
          'OT' : x.OT,
          'Item' : x.Item, 
          'Referencia' : x.Referencia,
          'No_Conformidades' : x.No_Conformidades,
          'Cantidad' : this.dialog ? this.calculateTotalOT(x.OT) : x.Cantidad,
          'Presentacion' : 'Kg' 
        }
        info.push(object);
      }
    });
    return info;
  }

  //Encabezado de tabla consolidada del PDF
  headerTableDetails(data : any) {
    let columns : any[] = ['N°', 'OT', 'Item', 'Proceso', 'Maq', 'Material', 'Operario', 'No_Conformidad', 'Cant', 'Und', 'Impreso', 'Fecha'];
    let widths: Array<string> = ['3%', '7%','7%','9%','4%','7%','15%','20%','5%','5%','7%','9%'];
    return {
      margin: [0, 0, 0, 0],
      table : {
        widths : widths, 
        body : this.builderTableBody2(data, columns, 'Información consolidada de desperdicios'),
      },
      fontSize : 8,
      layout : {
        fillColor : function(rowIndex) {
          return ([0, 1].includes(rowIndex)) ? '#DDDDDD' : null; 
        },
      }
    }
  }

  //Información detallada de los desperdicios por bulto en el PDF
  detailedInfo(data : any){
    let info : any = [];
    data.forEach(x => {
      const completeData : any = {
        'N°' : info.length + 1,
        'OT' : this.dialog ? x.OT : x.ot,
        'Item' : this.dialog ? x.Item : x.item,
        'Referencia' : this.dialog ? x.Referencia : x.referencia,
        'Cantidad' : this.dialog ? x.Cantidad : x.cantidad,
        'Cant' : this.dialog ? this.formatonumeros(x.Cantidad) : this.formatonumeros(x.cantidad),
        'Und' : this.dialog ? x.Und : x.presentacion,
        'Proceso' : this.dialog ? x.Proceso : x.proceso,
        'Material' : this.dialog ? x.Material : x.material,
        "No_Conformidad" : this.dialog ? x.No_Conformidad : x.falla,
        'Impreso' : this.dialog ? x.Impreso : x.impreso,
        'Maq' : this.dialog ? x.Maquina : x.maquina,
        'Operario' : this.dialog ? x.Operario : x.operario,
        'Fecha' : this.dialog ? x.Fecha.replace('T00:00:00', '') : x.fecha.replace('T00:00:00', ''),
      }
      info.push(completeData);
    });
    return info;
  }

   //Cantidad total pesada en desperdicios en el PDF.
  totalInfo(){
    return {
      text: `\nCantidad total: ${this.dialog ? this.calculateTotalOT(this.otSeleccionada) : this.calculateTotal()} KLS`,
      alignment: 'right',
      style: 'header', 
      fontSize : 10, 
      bold : true,
    };
  }

  //Constructor tabla 1 (Consolidada)
  builderTableBody(data, columns, tittle) {
    var body = [];
    body.push([{ colSpan: 7, text: tittle, bold: true, alignment: 'center', fontSize: 10 }, {}, {}, {}, {}, {}, {}]);
    body.push(columns);
    data.forEach(function (row) {
      var dataRow = [];
      columns.forEach((column) => dataRow.push(row[column].toString()));
      body.push(dataRow);
    });
    return body;
  }

   //Constructor tabla 1 (Detalles)
  builderTableBody2(data, columns, tittle) {
    var body = [];
    body.push([{ colSpan: 12, text: tittle, bold: true, alignment: 'center', fontSize: 10 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}]);
    body.push(columns);
    data.forEach(function (row) {
      var dataRow = [];
      columns.forEach((column) => dataRow.push(row[column].toString()));
      body.push(dataRow);
    });
    return body;
  }

  //Función para calcular la cantidad total.
  calculateTotal = () => this.arrayDesperdicios.reduce((acc, item) => acc + item.cantidad, 0);

  //Función para calcular la cantidad total por orden de trabajo en el PDF.
  calculateTotalOT = (ot : number) => this.arrayDesperdicios.filter(x => x.ot == ot).reduce((acc, item) => acc + item.cantidad, 0);

  //Función para calcular la cantidad total de no conformidades en el PDF.
  calculateNoConformityOT = (ot : number) => this.arrayDesperdicios.filter(x => x.ot == ot).length;
}

