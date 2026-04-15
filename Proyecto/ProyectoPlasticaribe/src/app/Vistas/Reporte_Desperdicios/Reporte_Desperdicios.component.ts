import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
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
import { TurnosService } from 'src/app/Servicios/Turnos/Turnos.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { FallasTecnicasService } from 'src/app/Servicios/FallasTecnicas/FallasTecnicas.service';
import { CreacionExcelService } from 'src/app/Servicios/CreacionExcel/CreacionExcel.service';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { ReporteProduccionComponent } from '../Reporte-Produccion/Reporte-Produccion.component';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-Reporte_Desperdicios',
  templateUrl: './Reporte_Desperdicios.component.html',
  styleUrls: ['./Reporte_Desperdicios.component.css']
})

export class Reporte_DesperdiciosComponent implements OnInit {
  @ViewChild(ReporteProduccionComponent) cmproduction: ReporteProduccionComponent | undefined;
  @ViewChild('dt') dt: Table | undefined; //Variable para la tabla principal
  @ViewChild('dt2') dt2: Table | undefined; //Variable para la tabla del modal
  formFiltros !: FormGroup; /** Formulario de filtros */
  load: boolean = true; /** Variable que realizará la carga al momento de consultar */
  arrayMateriales : any = []; /** array que contendrá los materiales de materia prima*/
  arrayProductos : any = []; /** array que cargará los productos con la consulta de tipo LIKE*/
  idProducto: any = 0; /** ID de producto que se cargará en el campo ITEM, pero se mostrará el nombre. */
  arrayConsulta: any = []; /** Array que cargará la consulta inicial */
  today: any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  arrayModal: any = []; /** Array que se cargará en la tabla del modal con la info de la OT Seleccionada */
  dialog: boolean = false; /** Variable que mostrará o no, el modal */
  totalDesperdicio: number = 0; /** Variable que contendrá la cantidad total de desperdicio por OT. */
  otSeleccionada: number = 0; /** Variable que contendrá la OT Seleccionada en la tabla */
  storage_Id: number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre: any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol: any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol: number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  modoSeleccionado: boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  arrayDesperdicios: any = []; //Array que guardará la información total de los desperdicios consultados.
  date: any | undefined = [new Date(), new Date()] //Variable que guardará la fecha seleccionada en el campo de rango de fechas
  turnos: string[] = []; //Variable que guardará los turnos obtenidos de la consulta al API
  process: any = []; //Variable que guardará los procesos obtenidos de la consulta al API
  fails: any = []; //Variable que guardará las fallas técnicas obtenidos de la consulta al API
  pesoTotal: number = 0; //Variable que guardará el peso total producido por OT y proceso para calcular el porcentaje de desperdicio.
  production: any = []; //Variable que guardará la información de producción obtenida del API para mostrarla en la tabla y calcular el porcentaje de desperdicio.
  productionReport: boolean = false; //Variable que se usará para mostrar u ocultar el reporte de producción al momento de consultar la producción por OT desde el modal de desperdicios.

  constructor(private formBuilder: FormBuilder,
    private servicioMateriales: MaterialProductoService,
    private servicioProductos: ProductoService,
    private servicioDesperdicios: DesperdicioService,
    private AppComponent: AppComponent,
    private shepherdService: ShepherdService,
    private msj: MensajesAplicacionService,
    private svcPDF: CreacionPdfService,
    private svTurnos: TurnosService,
    private svProcess: ProcesosService,
    private svFails: FallasTecnicasService,
    private svExcel: CreacionExcelService,
    private svBagpro: BagproService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;

    this.formFiltros = this.formBuilder.group({
      OT: [null],
      fail: [null],
      RangoFechas: [null, null],
      Material: [null],
      turn: [null],
      process: [null],
    });
  }

  /** Función que inicializará otras funciones al momento de cargar este componente. */
  ngOnInit() {
    this.cargarMateriales();
    this.lecturaStorage();
    this.getTurnos();
    this.obtenerFallas();
    this.obtenerProcesos();
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
  }

  //Función para validar el area del rol del usuario logueado.
  validateArea() {
    let area: any = ``;
    if ([74, 85, 7].includes(this.ValidarRol)) area = "EXT";
    else if ([88, 62, 4, 75].includes(this.ValidarRol)) area = "IMP";
    else if ([89, 76, 63].includes(this.ValidarRol)) area = "ROT";
    else if (this.ValidarRol == 77) area = "LAM";
    else if (this.ValidarRol == 78) area = "DBLD";
    else if ([79, 4].includes(this.ValidarRol)) area = "CORTE"
    else if (([87, 9, 80, 4].includes(this.ValidarRol))) area = "EMP";
    else if ([81, 86, 8, 82].includes(this.ValidarRol)) area = "SELLA";
    else if (this.ValidarRol == 82) area = "WIKE";
    else if (this.ValidarRol == 84) area = "RECUP";
    else area = "N/A";
    return area;
  }

  // Funcion que va a hacer que se inicie el tutorial in-app
  tutorial() {
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage() {
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  obtenerFallas() {
    this.svFails.srvObtenerLista().subscribe(datos => {
      this.fails = datos.filter((item) => [9, 11].includes(item.tipoFalla_Id));
      this.fails.sort((a, b) => Number(b.falla_Id) - Number(a.falla_Id));
    });
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp, rep);
  }

  /** Función que cargará los materiales en el combobox.*/
  cargarMateriales = () => this.servicioMateriales.srvObtenerLista().subscribe(data => this.arrayMateriales = data.filter(x => x.material_Id != 1));

  //
  getTurnos = () => this.svTurnos.srvObtenerLista().subscribe(data => this.turnos = data.filter((x: { turno_Id: string; }) => ['DIA', 'NOCHE'].includes(x.turno_Id)));

  /** Función que consultará según los campos de busqueda diferentes de vacio. (FECHAS)*/
  Consultar() {
    let fecha: any = this.formFiltros.value.RangoFechas;
    let fecha1: any = fecha == null ? this.today : moment(this.formFiltros.value.RangoFechas[0]).format('YYYY-MM-DD');
    let fecha2: any = ['Fecha inválida', null, undefined, ''].includes(fecha == null ? fecha : fecha[1]) ? this.today : moment(this.formFiltros.value.RangoFechas[1]).format('YYYY-MM-DD');
    this.arrayConsulta = [];
    this.arrayDesperdicios = [];
    this.load = false;
    let ordenesTrabajo: any = [];

    this.servicioDesperdicios.getDesperdicio(fecha1, fecha2, this.rutaAPI()).subscribe(data => {
      this.svBagpro.getProductionDay(fecha1, fecha2, this.ordersProduction(data), this.validateUrlProduction()).subscribe(prod => {
        this.production = prod;
        //if (![12, 1, 5].includes(this.ValidarRol)) data = data.filter((x) => x.id_Proceso == this.validateArea());
        this.arrayDesperdicios = data;
        if (data.length == 0) {
          this.msj.mensajeAdvertencia(`Advertencia`, `No se encontraron resultados de búsqueda con los filtros consultados!`);
          this.load = true;
        } else {
          data.forEach(x => {
            if (ordenesTrabajo.filter(z => z.Proceso == x.id_Proceso && z.Orden_Produccion == x.ot).length == 0) {
              ordenesTrabajo.push({ 'Proceso': x.id_Proceso, 'Orden_Produccion': x.ot });
              this.llenarTabla(x);
            }
          });
          setTimeout(() => { this.load = true; }, 1000);
        }
      });
    });
  }

  validateUrlProduction(){
    let turno : string = this.formFiltros.value.turn;
    let procesoId : string = this.formFiltros.value.process;
    let proceso : string = (procesoId) ? this.process.filter(x => x.proceso_Id == procesoId)[0].proceso_Nombre.toUpperCase() : null;
    let url: string = '';

    if (proceso != null) url += `proceso=${proceso}`;
    if (turno != null) url.length > 0 ? url += `&turno=${turno}` : url += `turno=${turno}`;
    if (url.length > 0) url = `?${url}`;
    return url;
  }

  //Función que cargará las maquinas por OT
  machinesForOT(data: any, row : any) {
    let machines: any = [];
    machines = data.filter(x => x.ot == row.ot && x.proceso == row.proceso).reduce((a, b) => {
      if (!a.map(x => x).includes(b.maquina)) a = [...a, b.maquina];
      return a;
    }, []);
    return machines;
  }

  //Función que cargar las ordenes de trabajo que se buscarán en el reporte de producción
  ordersProduction(data: any) {
    let orders: any = [];
    orders = data.reduce((a, b) => {
      if (!a.map(x => x).includes(b.ot)) a = [...a, b.ot.toString()];
      return a;
    }, []);
    return orders
  }

  //Función que valida la ruta que se utilizará en la consulta en el API.
  rutaAPI() {
    let OT: any = this.formFiltros.value.OT;
    let material: any = this.formFiltros.value.Material;
    let type: any = this.formFiltros.value.productoId;
    let turn: any = this.formFiltros.value.turn;
    let process: any = this.formFiltros.value.process;
    process = process == 'CAMISILLA' ? 'SELLA' : process;
    let url: string = '';

    if (OT != null) url += `OT=${OT}`;
    if (material != null) url.length > 0 ? url += `&material=${material}` : url += `material=${material}`;
    if (type != null) url.length > 0 ? url += `&type=${type}` : url += `type=${type}`;
    if (turn != null) url.length > 0 ? url += `&turn=${turn}` : url += `turn=${turn}`;
    if (process != null) url.length > 0 ? url += `&process=${process}` : url += `process=${process}`;
    if (url.length > 0) url = `?${url}`;

    return url;
  }

  /** Llenar la tabla inicial de resultados de busqueda */
  llenarTabla(datos: any) {
    const registro: any = {
      'OT': datos.ot,
      'Item': datos.item,
      'Referencia': datos.referencia,
      'Material': datos.material,
      'Impreso': datos.impreso,
      'Cantidad': this.calculateTotalOT(datos.ot, datos.id_Proceso),
      'Presentacion': 'Kg',
      'No_Conformidades': this.calculateNoConformityOT(datos.ot, datos.id_Proceso),
      'Production': this.productionForOTProcess(datos.ot, datos.proceso),
      'Porcentaje' : this.productionForOTProcess(datos.ot, datos.proceso) == 0 ? 0 : (this.calculateTotalOT(datos.ot, datos.id_Proceso) * 100) / this.productionForOTProcess(datos.ot, datos.proceso),
      'Proceso': datos.id_Proceso,
      'Nombre_Proceso': datos.proceso,
      'Fecha': datos.fecha_Registro.replace('T00:00:00', ''),
      'Hora': datos.hora_Registro,
      'Maquina': datos.maquina,
      'Operario': datos.operario,
      'No_Conformidad': datos.falla,
      'Observacion': datos.observacion,
      'Cantidad_Normal' : this.calculateTotalNormalOT(datos.ot, datos.id_Proceso),
      'Porcentaje_Normal' : this.productionForOTProcess(datos.ot, datos.proceso) == 0 ? 0 : (this.calculateTotalNormalOT(datos.ot, datos.id_Proceso) * 100) / this.productionForOTProcess(datos.ot, datos.proceso),
      'Maquinas' : this.machinesForOT(this.arrayDesperdicios, datos),
    }
    this.arrayConsulta.push(registro);
  }


  getDetailsProductionForOT(process?: any, ot?: string, maquina? : any) {
    let date1 = moment(this.formFiltros.value.RangoFechas[0]).add(1, 'd').format('YYYY-MM-DD');
    let date2 = moment(this.formFiltros.value.RangoFechas[1]).add(1, 'd').format('YYYY-MM-DD');
    let turn : string = this.formFiltros.value.turn;

    [35,37,38,39].includes(maquina[0]) && process == 'SELLADO' ? process = 'CAMISILLA' : process = process;
    process == 'CORTE' ? process = 'EMPAQUE' : process = process;

    this.productionReport = true;
    this.cmproduction?.formFiltros.patchValue({ 'rangoFechas': [new Date(date1), new Date(date2)], 'proceso': process.toUpperCase(), 'OrdenTrabajo': ot, 'Turno' : turn});
    this.cmproduction?.consultarProduccion();
  }

  productionForOTProcess(ot: any, process: any) {
    let production : number = 0;
    process == 'CORTE' ? process = 'EMPAQUE' : process = process;
    
    production = this.production.filter(x => x.ot == ot && x.proceso == process).reduce((a, b) => a += b.peso, 0);
    return production;
  } 

  //Funcion que va a conultar y obtener todas las areas de la empresa
  obtenerProcesos = () => this.svProcess.srvObtenerLista().subscribe(datos => this.process = datos.filter(x => [3, 4, 8, 12, 7, 2, 1, 9, 5, 6, 10, 17].includes(x.proceso_Codigo)));

  //! Función para que al momento de seleccionar una OT de la tabla se cargue el modal. */
  consultarOTenTabla(item: any) {
    this.arrayModal = [];
    this.otSeleccionada = item.OT;
    //this.load = false;
    this.servicioDesperdicios.getDesperdicioxOT(item.OT).subscribe(dataDesperdicios => {
      if (![12, 1, 5].includes(this.ValidarRol)) dataDesperdicios = dataDesperdicios.filter((x) => x.id_Proceso == this.validateArea());
      for (let index = 0; index < dataDesperdicios.length; index++) {
        this.llenarModal(dataDesperdicios[index], false);
      }
    });
    //setTimeout(() => { this.load = true }, 500);
  }

  /** Función para llenar la tabla de modal. */
  llenarModal(data: any, normal : boolean) {
    this.arrayModal = [];

    let info: any = (normal) ? 
    this.arrayDesperdicios.filter(x => x.ot == data.OT && x.id_Proceso == data.Proceso && [10,62].includes(x.id_Falla)) :
    this.arrayDesperdicios.filter(x => x.ot == data.OT && x.id_Proceso == data.Proceso && ![10,62].includes(x.id_Falla)) ;
    this.dialog = true;
    this.otSeleccionada = data.OT;

    info.forEach(datos => {
      const dataCompleta: any = {
        'OT': datos.ot,
        'Bulto': datos.bulto,
        'Item': datos.item,
        'Referencia': datos.referencia,
        'Peso': datos.cantidad,
        'Cantidad': this.formatonumeros(datos.cantidad),
        'Und': datos.presentacion,
        'Proceso': datos.id_Proceso,
        'Material': datos.material,
        "No_Conformidad": datos.falla,
        'No_Conformidades': this.calculateNoConformityOT(datos.ot, datos.id_Proceso),
        'Impreso': datos.impreso,
        'Maquina': datos.maquina,
        'Operario': datos.operario,
        'Fecha': datos.fecha_Registro.replace('T00:00:00', ''),
        'Hora': datos.hora_Registro,
        'Observacion': datos.observacion,
      }
      this.arrayModal.push(dataCompleta);
    });
  }

  /** Función para limpiar filtros de busqueda */
  limpiarCampos() {
    this.formFiltros.reset();
    this.arrayConsulta = [];
    this.arrayModal = [];
    this.arrayDesperdicios = [];
    this.formFiltros.patchValue({ RangoFechas: [new Date(), new Date()] });
  }

  /** Función que calcula la cantidad total del desperdicio */
  pesoTotalDesperdicio() {
    let total: number = 0;
    if (this.dt) {
      if (this.dt.filteredValue) total = this.dt.filteredValue.reduce((a, b) => a += b.Peso, 0);
      else total = this.arrayModal.reduce((a, b) => a += b.Peso, 0);
    } else total = this.arrayModal.reduce((a, b) => a += b.Peso, 0);
    return total;
  }

  //* Función para mostrar la cantidad total producida en la tabla principal.
  pesoProducido() {
    let total: number = 0;

    if (this.dt) {
      if (this.dt.filteredValue) total = this.dt.filteredValue.reduce((a, b) => a += b.Production, 0);
      else total = this.arrayConsulta.reduce((a, b) => a += b.Production, 0);
    } else total = this.arrayConsulta.reduce((a, b) => a += b.Production, 0);
    return total;
  }

  //* Función para mostrar la cantidad total de desperdicio en la tabla principal.
  pesoDesperdicio() {
    let total: number = 0;
    if (this.dt) {
      if (this.dt.filteredValue) total = this.dt.filteredValue.reduce((a, b) => a += b.Cantidad, 0);
      else total = this.arrayConsulta.reduce((a, b) => a += b.Cantidad, 0);
    } else total = this.arrayConsulta.reduce((a, b) => a += b.Cantidad, 0);
    return total;
  }

  //* Función que calculará el .
  totalPorcNormal() {
    let total: number = 0;
    if (this.dt) {
      if (this.dt.filteredValue) total = (this.totalCantidadNormal() * 100) / this.pesoProducido();
      else total = (this.totalCantidadNormal() * 100) / this.pesoProducido();
    } else total = (this.totalCantidadNormal() * 100) / this.pesoProducido();
    return total;
  }

  //* Función que calculará el .
  totalPorc() {
    let total: number = 0;
    if (this.dt) {
      if (this.dt.filteredValue) total = (this.pesoDesperdicio() * 100) / this.pesoProducido();
      else total = (this.pesoDesperdicio() * 100) / this.pesoProducido();
    } else total = (this.pesoDesperdicio() * 100) / this.pesoProducido();
    return total;
  }

  //* Función que calculará el .
  totalCantidadNormal() {
    let total: number = 0;
    //setTimeout(() => {
    if (this.dt) {
      if (this.dt.filteredValue) total = this.dt.filteredValue.reduce((a, b) => a += b.Cantidad_Normal, 0);
      else total = this.arrayConsulta.reduce((a, b) => a += b.Cantidad_Normal, 0);
    } else total = this.arrayConsulta.reduce((a, b) => a += b.Cantidad_Normal, 0);
    return total;
  }

  //* Función que calculará el total de no conformidades.
  totalFails() {
    let total: number = 0;
    //setTimeout(() => {
    if (this.dt) {
      if (this.dt.filteredValue) total = this.dt.filteredValue.reduce((a, b) => a += b.No_Conformidades, 0);
      else total = this.arrayConsulta.reduce((a, b) => a += b.No_Conformidades, 0);
    } else total = this.arrayConsulta.reduce((a, b) => a += b.No_Conformidades, 0);
    return total;
  }

  // Funcion que permitirá filtrar la información de la tabla
  aplicarfiltro($event, campo: any, valorCampo: string) {
    this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
  }

  // Funcion que permitirá filtrar la información de la tabla
  aplicarfiltro2($event, campo: any, valorCampo: string) {
    this.dt2!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
    this.pesoTotalDesperdicio();
  }

  //* INICIO PDF
  // Función para crear tanto el PDF del modal como el consolidado por OT.
  newPdf() {
    if (this.arrayDesperdicios.length > 0) {
      this.load = false;
      let fecha: any = this.formFiltros.value.RangoFechas;
      let date1: any = fecha == null ? this.today : moment(this.formFiltros.value.RangoFechas[0]).format('YYYY-MM-DD');
      let date2: any = ['Fecha inválida', null, undefined, ''].includes(fecha == null ? fecha : fecha[1]) ? this.today : moment(this.formFiltros.value.RangoFechas[1]).format('YYYY-MM-DD');
      let title: string = `Reporte Desperdicios \n ${date1} a ${date2}`;
      this.arrayModal = this.arrayModal.filter(item => item.OT == this.otSeleccionada);
      let content: any[] = this.contentPDF(this.arrayDesperdicios);
      this.svcPDF.formatoPDF(title, content);
      setTimeout(() => { this.load = true; }, 2000);
    } else this.msj.mensajeAdvertencia(`Advertencia`, `No hay información para generar el reporte.`);
  }

  //Adición de contenido al pdf. 
  contentPDF(data: any): any {
    let content: any[] = [];
    let groupedInformation: any = this.groupedInfo(data);
    let groupedInformationType: any = this.groupedInfoType(data);
    let detailedInformation: any = this.detailedInfo(this.arrayDesperdicios);

    content.push(this.headerTableConsolidated(groupedInformation));
    content.push(this.totalInfoTableOne())
    content.push(this.headerTableConsolidatedType(groupedInformationType));
    content.push(this.totalInfoTableTwo())
    content.push(this.headerTableDetails(detailedInformation));
    content.push(this.totalInfo());
    return content;
  }

  //Encabezado de tabla consolidada del PDF
  headerTableConsolidated(data: any) {
    let columns: any[] = ['N°', 'Area', 'Desperdicio', 'Proceso' , 'Presentacion'];
    let widths: Array<string> = ['20%', '20%', '20%', '20%', '20%'];
    return {
      margin: [0, 0, 0, 0],
      borders: 'noBorders',
      table: {
        headerRows: 2,
        widths: widths,
        body: this.builderTableBody(data, columns, 'Información consolidada de desperdicios por área'),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex) {
          return ([0, 1].includes(rowIndex)) ? '#DDDDDD' : null;
        },
      }
    }
  }

  //Encabezado de tabla consolidada del PDF por tipo
  headerTableConsolidatedType(data: any) {
    let columns: any[] = ['N°', 'Tipo', 'Cantidad', 'Presentacion'];
    let widths: Array<string> = ['25%', '25%', '25%', '25%',];
    return {
      margin: [0, 0, 0, 0],
      borders: 'noBorders',
      table: {
        headerRows: 2,
        widths: widths,
        body: this.builderTableBody2(data, columns, 'Información consolidada por tipos de desperdicios'),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex) {
          return ([0, 1].includes(rowIndex)) ? '#DDDDDD' : null;
        },
      }
    }
  }


  //Información consolidada de la(s) orden(es) de trabajo agrupada(s) por OT.
  groupedInfo(data: any) {
    let info: any = [];
    data.forEach(x => {
      if([35, 37, 38, 39].includes(x.maquina)) {

        x.proceso = 'CAMISILLA';
        console.log(x.proceso);
        
      }
      if (!info.map(y => y.Area).includes(x.proceso)) {
        let object: any = {
          'N°': info.length + 1,
          'Area': x.proceso,
          'Desperdicio': this.formatonumeros(parseFloat(this.calculateTotalForWaste(x.proceso)).toFixed(2)),
          'Proceso': this.formatonumeros(parseFloat(this.calculateTotalForProcess(x.proceso)).toFixed(2)),
          'Presentacion': 'Kg'
        }
        info.push(object);
      }
    });
    return info;
  }

  groupedInfoType(data: any) {
    let info: any = [];
    
    data.forEach(x => {
      if (!info.map(y => y.Tipo).includes(x.falla)) {
        let object: any = {
          'N°': info.length + 1,
          'Tipo': x.falla,
          'Cantidad': this.formatonumeros(parseFloat(this.calculateTotalForType(x.falla)).toFixed(2)),
          'Presentacion': 'Kg'
        }
        info.push(object);
      }
    });
    return info;
  }

  //Encabezado de tabla consolidada del PDF
  headerTableDetails(data: any) {
    let columns: any[] = ['N°', 'OT', 'Proceso', 'Maq', 'Material', 'Operario', 'No_Conformidad', 'Cant', 'Und', 'Imp', 'Fecha'];
    let widths: Array<string> = ['3%', '7%', '7%', '4%', '12%', '19%', '23%', '5%', '5%', '4%', '9%'];
    return {
      margin: [0, 0, 0, 0],
      table: {
        widths: widths,
        body: this.builderTableBody3(data, columns, 'Información detallada de desperdicios'),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex) {
          return ([0, 1].includes(rowIndex)) ? '#DDDDDD' : null;
        },
      }
    }
  }

  //Información detallada de los desperdicios por bulto en el PDF
  detailedInfo(data: any) {
    let info: any = [];
    data.forEach(x => {
      const completeData: any = {
        'N°': info.length + 1,
        'OT': x.ot,
        'Referencia': x.referencia,
        'Cantidad': x.cantidad,
        'Cant': this.formatonumeros(x.cantidad),
        'Und': x.presentacion,
        'Proceso': x.id_Proceso,
        'Material': x.material,
        "No_Conformidad": x.falla,
        'Imp': x.impreso,
        'Maq': x.maquina,
        'Operario': x.operario,
        'Fecha': x.fecha_Registro.replace('T00:00:00', ''),
      }
      info.push(completeData);
    });
    return info;
  }

  //Cantidad total pesada en desperdicios en el PDF.
  totalInfo() {
    return {
      text: `\nCantidad total: ${this.formatonumeros(parseFloat(this.calculateTotal()).toFixed(2))} KLS`,
      alignment: 'right',
      style: 'header',
      fontSize: 10,
      bold: true,
    };
  }

  //Tabla con la cantidad total pesada en desperdicios en el PDF en la tabla 1.
  totalInfoTableOne() {
    return {
      margin: [0, 0, 0, 20],
      table: {
        widths: ['20%', '20%', '20%', '20%', '20%'],
        body: [
          [
            { text: ``, border: [false, false, false, false], },
            { text: `Cantidad Total`, border: [true, false, true, true], fontSize: 8, bold: true, alignment: 'right', },
            { text: `${this.formatonumeros(parseFloat(this.calculateTotalWastePDF()).toFixed(2))}`, border: [true, false, true, true], fontSize: 8, bold: true, },
            { text: `${this.formatonumeros(parseFloat(this.calculateTotalProcessPDF()).toFixed(2))}`, border: [true, false, true, true], fontSize: 8, bold: true, },
            { text: 'Kg', border: [true, false, true, true], fontSize: 8, bold: true, }
          ],
        ]
      },
    }
  }

  //Tabla con la cantidad total pesada en desperdicios en el PDF en la tabla 2.
  totalInfoTableTwo() {
    return {
      margin: [0, 0, 0, 20],
      table: {
        widths: ['25%', '25%', '25%', '25%',],
        body: [
          [
            { text: ``, border: [false, false, false, false], },
            { text: `Cantidad Total`, border: [true, false, true, true], fontSize: 8, bold: true, alignment: 'right', },
            { text: `${this.formatonumeros(parseFloat(this.calculateTotal()).toFixed(2))}`, border: [true, false, true, true], fontSize: 8, bold: true, },
            { text: 'Kg', border: [true, false, true, true], fontSize: 8, bold: true, }
          ],
        ]
      },
    }
  }

  //Constructor tabla 1 (area)
  builderTableBody(data, columns, tittle) {
    var body : any = [];
    body.push([{ colSpan: 5, text: tittle, bold: true, alignment: 'center', fontSize: 10 }, {}, {}, {}, {},]);
    body.push(columns);
    data.forEach(function (row) {
      var dataRow : any = [];
      columns.forEach((column) => dataRow.push(row[column].toString()));
      body.push(dataRow);
    });
    return body;
  }

  //Constructor tabla 2 (Tipo)
  builderTableBody2(data, columns, tittle) {
    var body : any = [];
    body.push([{ colSpan: 4, text: tittle, bold: true, alignment: 'center', fontSize: 10 }, {}, {}, {},]);
    body.push(columns);
    data.forEach(function (row) {
      var dataRow : any = [];
      columns.forEach((column) => dataRow.push(row[column].toString()));
      body.push(dataRow);
    });
    return body;
  }

  //Constructor tabla 3 (Detalles)
  builderTableBody3(data, columns, tittle) {
    var body : any = [];
    body.push([{ colSpan: 11, text: tittle, bold: true, alignment: 'center', fontSize: 10 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {},]);
    body.push(columns);
    data.forEach(function (row) {
      var dataRow : any = [];
      columns.forEach((column) => dataRow.push(row[column].toString()));
      body.push(dataRow);
    });
    return body;
  }


  //*CALCULOS TOTALES

  //Función para calcular la cantidad total.
  calculateTotalWastePDF() {
    return this.arrayDesperdicios.filter(x => !['TROQUEL', 'REFILE'].includes(x.falla)).reduce((acc, item) => acc += item.cantidad, 0);
  }

  calculateTotalProcessPDF() {
    return this.arrayDesperdicios.filter(x => ['TROQUEL', 'REFILE'].includes(x.falla)).reduce((acc, item) => acc += item.cantidad, 0);
  }

  calculateTotal() {
    return this.arrayDesperdicios.reduce((acc, item) => acc += item.cantidad, 0);
  }

  //
  calculateTotalForProcess(process: string) {
    if(process == 'CAMISILLA') return this.arrayDesperdicios.filter(x => x.proceso == 'SELLADO' && ['TROQUEL', 'REFILE'].includes(x.falla) && [35,37,38,39].includes(x.maquina)).reduce((acc, item) => acc += item.cantidad, 0);
    else if (process == 'SELLADO') return this.arrayDesperdicios.filter(x => x.proceso == process && ['TROQUEL', 'REFILE'].includes(x.falla) && ![35,37,38,39].includes(x.maquina)).reduce((acc, item) => acc += item.cantidad, 0);
    else return this.arrayDesperdicios.filter(x => x.proceso == process && ['TROQUEL', 'REFILE'].includes(x.falla)).reduce((acc, item) => acc += item.cantidad, 0);
  } 
  
  calculateTotalForWaste(process: string) {
    if(process == 'CAMISILLA') return this.arrayDesperdicios.filter(x => x.proceso == 'SELLADO' && !['TROQUEL', 'REFILE'].includes(x.falla) && [35,37,38,39].includes(x.maquina)).reduce((acc, item) => acc += item.cantidad, 0);
    else if (process == 'SELLADO') return this.arrayDesperdicios.filter(x => x.proceso == process && !['TROQUEL', 'REFILE'].includes(x.falla) && ![35,37,38,39].includes(x.maquina)).reduce((acc, item) => acc += item.cantidad, 0);
    else return this.arrayDesperdicios.filter(x => x.proceso == process && !['TROQUEL', 'REFILE'].includes(x.falla)).reduce((acc, item) => acc += item.cantidad, 0);
  } 

  calculateTotalForType = (fail: string) => this.arrayDesperdicios.filter(x => x.falla == fail).reduce((acc, item) => acc += item.cantidad, 0);
  

  //Función para calcular la cantidad total por orden de trabajo en el PDF.
  calculateTotalOT = (ot: number, process: string) => this.arrayDesperdicios.filter(x => x.ot == ot && x.id_Proceso == process && ![10,62].includes(x.id_Falla)).reduce((acc, item) => acc += item.cantidad, 0);

  calculateTotalNormalOT = (ot: number, process: string) => this.arrayDesperdicios.filter(x => x.ot == ot && x.id_Proceso == process && [10,62].includes(x.id_Falla)).reduce((acc, item) => acc += item.cantidad, 0);

  //Función para calcular la cantidad total de no conformidades en el PDF.
  calculateNoConformityOT = (ot: number, process: string) => this.arrayDesperdicios.filter(x => x.ot == ot && x.id_Proceso == process).length;


  //* INICIO EXCEL  
  //Función que exportará un formato excel con los datos de los clientes
  exportExcel() {
    if (this.arrayConsulta.length > 0) {
      setTimeout(() => { this.loadSheetAndStyles(this.arrayConsulta); }, 500);
    } else this.msj.mensajeAdvertencia(`Advertencia`, `No hay datos para exportar.`);
  }

  //Función que cargará la hoja y los estilos. 
  loadSheetAndStyles(data: any) {
    let date1 : any = moment(this.formFiltros.value.RangoFechas[0]).format('YYYY-MM-DD');
    let date2 : any = moment(this.formFiltros.value.RangoFechas[1]).format('YYYY-MM-DD');

    let title: any = `Reporte Desperdicios ${date1} `;
    date2 != date1 ? title += `- ${date2}` : title = title;
    let fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } };
    let border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }, };
    let font = { name: 'Calibri', family: 4, size: 10, bold: true };
    let alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    let workbook = this.svExcel.formatoExcel(title, true);
    this.addNewSheet(workbook, title, fill, border, font, alignment, data);
    this.svExcel.creacionHoja(workbook, `Reporte Desperdicios Detallado`, false);
    this.addDetailedSheet(workbook, fill, font, border, this.addDetailedDataExcel(this.arrayDesperdicios), 2);
    this.svExcel.creacionExcel(title, workbook);
  }

  //Función para agregar una nueva hoja de calculo.
  addNewSheet(wb: any, title: any, fill: any, border: any, font: any, alignment: any, data: any) {
    let fontTitle = { name: 'Calibri', family: 4, size: 15, bold: true };
    let worksheet: any = wb.worksheets[0];
    this.loadStyleTitle(worksheet, title, fontTitle, alignment);
    this.loadHeader(worksheet, fill, border, font, alignment);
    this.loadInfoExcel(worksheet, this.dataExcel(data), border, alignment);
  }

  //Cargar estilos del titulo de la hoja.
  loadStyleTitle(ws: any, title: any, fontTitle: any, alignment: any) {
    ws.getCell('A1').alignment = alignment;
    ws.getCell('A1').font = fontTitle;
    ws.getCell('A1').value = title;
  }

  //Función para cargar los titulos de el header y los estilos.
  loadHeader(ws: any, fill: any, border: any, font: any, alignment: any) {
    let rowHeader: any = ['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5', 'I5', 'J5', 'K5', 'L5', 'M5'];
    //ws.addRow([]);
    ws.addRow(this.loadFieldsHeader());

    rowHeader.forEach(x => ws.getCell(x).fill = fill);
    rowHeader.forEach(x => ws.getCell(x).alignment = alignment);
    rowHeader.forEach(x => ws.getCell(x).border = border);
    rowHeader.forEach(x => ws.getCell(x).font = font);
    ws.mergeCells('A1:M3');

    this.loadSizeHeader(ws);
  }

  //Función para cargar el tamaño y el alto de las columnas del header.
  loadSizeHeader(ws: any) {
    [5].forEach(x => ws.getColumn(x).width = 15);
    [6, 2].forEach(x => ws.getColumn(x).width = 20);
    [1].forEach(x => ws.getColumn(x).width = 5);
    [3].forEach(x => ws.getColumn(x).width = 10);
    [4,].forEach(x => ws.getColumn(x).width = 40);
    [7, 8, 9, 10, 11, 12, 13].forEach(x => ws.getColumn(x).width = 20);
  }

  //Función para cargar los nombres de las columnas del header
  loadFieldsHeader() {
    let headerRow = [
      'N°',
      'OT',
      'Item',
      'Referencia',
      'Area',
      'Material',
      'No conformidades',
      'Producido (Kg)',
      'Desperdicio (Kg)',
      'Porcentaje',
      'Proceso',
      'Porc. Proceso',
      'Tipo',
    ];
    return headerRow;
  }

  //Cargar información con los estilos al formato excel. 
  loadInfoExcel(ws: any, data: any, border: any, alignment: any) {
    let contador: any = 6;
    let formatNumber: Array<number> = [8,9,10,11,12];
    let row: any = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];

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
    row.forEach(r => ws.getCell(`${r}${contador - 1}`).font = { name: 'Calibri', family: 4, size: 10, bold : true, }); 
  }

  //.Función que contendrá la info al documento excel. 
  dataExcel(data: any) {
    let info: any = [];
    let count: number = 0;
    data.forEach(x => {
      info.push([
        count += 1,
        x.OT,
        x.Item,
        x.Referencia,
        x.Nombre_Proceso,
        x.Material,
        x.No_Conformidades,
        x.Production,
        x.Cantidad,
        `${x.Porcentaje.toFixed(2)}%`,
        x.Cantidad_Normal,
        `${x.Porcentaje_Normal.toFixed(2)}%`,
        x.No_Conformidad,
      ]);
    });
    this.addTotal(info);
    return info;
  }

  //Agregar fila de totales al formato excel.
  addTotal(info: any) {
    info.push([
      '',
      '',
      '',
      '',
      '',
      'TOTALES',
      this.totalFails(),
      this.pesoProducido(),
      this.pesoDesperdicio(),
      `${this.totalPorc().toFixed(2)}%`, 
      this.totalCantidadNormal(),
      `${this.totalPorcNormal().toFixed(2)}%`,
      ''
    ]);
  }

  //? Hoja 2 INFORMACIÓN DETALLADA.
  addDetailedSheet(workbook, fill, font, border, data: any, pageNumber: number) {
    let page = workbook.worksheets[pageNumber - 1];
    this.addDetailedHeader(page, font, border, fill);
    page.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    this.addDetailedInfoExcel(page, data);
  }

  //.Agregar encabezado de la hoja 2: Reporte de producción consolidado.
  addDetailedHeader(worksheet, font, border, fill) {
    worksheet.addRow([]);
    worksheet.addRow([]);
    let rowHeader: any = ['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4', 'I4', 'J4', 'K4', 'L4', 'M4',];
    worksheet.addRow(['N°', 'OT', 'Item', 'Referencia', 'Area', 'Material', 'Peso (Kg)', 'Tipo', 'Operario', 'Maquina', 'Impreso', 'Fecha', 'Hora',]);

    rowHeader.forEach(x => worksheet.getCell(x).fill = fill);
    rowHeader.forEach(x => worksheet.getCell(x).font = font);
    rowHeader.forEach(x => worksheet.getCell(x).border = border);

    let concatCells: any = ['A1:M3'];
    this.stylesDetailedPage(worksheet, concatCells, []);
  }

  //.Agregar información a la hoja 2: Reporte de producción consolidado.
  addDetailedExcel(worksheet: any, data: any) {
    let formatNumber: Array<number> = [6];
    formatNumber.forEach(i => worksheet.getColumn(i).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    data.forEach(d => worksheet.addRow(d));
  }

  //.Agregar información a la hoja 2: Reporte de producción consolidado.
  addDetailedInfoExcel(worksheet: any, data: any) {
    let formatNumber: Array<number> = [6];
    formatNumber.forEach(i => worksheet.getColumn(i).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    data.forEach(d => worksheet.addRow(d));
  }

  //.Agregar información a la hoja 2: Reporte de producción consolidado.
  addDetailedDataExcel(data) {
    let info: any = [];
    let count: number = 0;

    info = data.reduce((acc, x) => {
      acc =
        [...acc, [
          count += 1,
          x.ot,
          x.item,
          x.referencia,
          x.proceso,
          x.material,
          x.cantidad,
          x.falla,
          x.operario,
          x.maquina,
          x.proceso == 'EXTRUSION' ? 'NO' : x.impreso,
          x.fecha_Registro.replace('T00:00:00', ''),
          x.hora_Registro,
        ]]
      return acc;
    }, [])
    this.addDetailedTotal(info);
    return info;
  }

  //.Estilos de la hoja 2: Reporte de producción consolidado..
  stylesDetailedPage(worksheet, concatCells, formatNumber) {
    formatNumber.forEach(i => worksheet.getColumn(i).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    [1].forEach(x => worksheet.getColumn(x).width = 5);
    [2, 3, 5, 6, 7, 10, 11, 12, 13].forEach(x => worksheet.getColumn(x).width = 12);
    [8, 9].forEach(x => worksheet.getColumn(x).width = 25);
    [4].forEach(x => worksheet.getColumn(x).width = 50);
    concatCells.forEach(cell => worksheet.mergeCells(cell));
  }

  //.Estilos de la hoja 2: Reporte de producción consolidado
  addDetailedTotal(info: any) {
    info.push([
      '',
      '',
      '',
      '',
      '',
      'TOTALES',
      this.pesoDesperdicio(),
      '',
      '',
      '',
      '',
      '',
      '',
    ]);
  }
}

