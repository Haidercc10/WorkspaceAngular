import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { co, s } from '@fullcalendar/core/internal-common';
import moment from 'moment';
import { Table } from 'primeng/table';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { CreacionExcelService } from 'src/app/Servicios/CreacionExcel/CreacionExcel.service';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-Reporte-Produccion',
  templateUrl: './Reporte-Produccion.component.html',
  styleUrls: ['./Reporte-Produccion.component.css']
})

export class ReporteProduccionComponent implements OnInit {

  @ViewChild('dt') dt !: Table;
  cargando: boolean = false;
  modoSeleccionado: boolean = false;
  storage_Id: number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  ValidarRol: number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  formFiltros !: FormGroup;
  areasEmpresa: string[] = [];
  turnos: string[] = ['DIA', 'NOCHE'];
  clientes: any[] = [];
  productos: any[] = [];
  produccion: any[] = [];
  rollosSeleccionados: any[] = [];

  constructor(private AppComponent: AppComponent,
    private frmBuilder: FormBuilder,
    private bagProService: BagproService,
    private msj: MensajesAplicacionService,
    private productosService: ProductoService,
    private svcPDF: CreacionPdfService, 
    private svcExcel : CreacionExcelService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;

    this.formFiltros = this.frmBuilder.group({
      rangoFechas: [null, Validators.required],
      OrdenTrabajo: [null],
      proceso: [null, Validators.required],
      idCliente: [null],
      cliente: [null],
      idProducto: [null],
      producto: [null],
      Turno: [null],
      EnvioZeus: [null],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.validarProcesoPorUsuarioRegistrado();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage() {
    this.storage_Id = this.AppComponent.storage_Id;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  validarProcesoPorUsuarioRegistrado() {
    if (![1, 10, 83].includes(this.ValidarRol)) {
      if (this.ValidarRol == 7) this.areasEmpresa = ['EXTRUSION'];
      if (this.ValidarRol == 8) this.areasEmpresa = ['SELLADO', 'Wiketiado'];
      if (this.ValidarRol == 9) this.areasEmpresa = ['EMPAQUE'];
      if (this.ValidarRol == 62) this.areasEmpresa = ['IMPRESION'];
      if (this.ValidarRol == 63) this.areasEmpresa = ['ROTOGRABADO'];
    } else this.areasEmpresa = ['EXTRUSION', 'IMPRESION', 'ROTOGRABADO', 'DOBLADO', 'LAMINADO', 'CORTE', 'EMPAQUE', 'SELLADO', 'Wiketiado'];
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  // Funcion que va a aplicar filtros a la tabla en la que se muestra la información consultada
  aplicarfiltroTabla = ($event, campo: any) => this.dt!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  // Funcion que va a limpiar los campos de busqueda y la información consultada
  limpiarCampos() {
    this.formFiltros.reset();
    this.formFiltros.patchValue({ EnvioZeus: null })
    this.produccion = [];
    this.clientes = [];
    this.productos = [];
  }

  // Funcion que se encargaá de buscar los clientes
  obtenerClientes() {
    let nombre: string = this.formFiltros.value.cliente;
    this.bagProService.GetClientesNombre(nombre).subscribe(resp => this.clientes = resp);
  }

  // Funcion que se encargará de colocar la información de los clientes en cada uno de los campos
  clienteSeleccionado() {
    let cliente: any = this.formFiltros.value.cliente;
    this.formFiltros.patchValue({
      idCliente: cliente,
      cliente: this.clientes.find(x => x.codBagpro == cliente).nombreComercial
    });
  }

  // Funcion que se encargará de buscar los productos
  obtenerProductos() {
    let nombre: string = this.formFiltros.value.producto;
    this.productosService.obtenerItemsLike(nombre).subscribe(resp => this.productos = resp);
  }

  // Funcion que se encargará de colocar la información de los productos en cada uno de los campos
  productoSeleccionado() {
    let producto: any = this.formFiltros.value.producto;
    this.formFiltros.patchValue({
      idProducto: producto,
      producto: this.productos.find(x => x.prod_Id == producto).prod_Nombre
    });
  }

  // Funcion que se encargará de consultar la informacion de produccion
  consultarProduccion() {
    if (this.formFiltros.value.rangoFechas.length > 1) {
      this.produccion = [];
      this.cargando = true;
      let fechaInicio = moment(this.formFiltros.value.rangoFechas[0]).format('YYYY-MM-DD');
      let fechaFin = moment(this.formFiltros.value.rangoFechas[1]).format('YYYY-MM-DD');
      let ruta: string = this.validarParametrosConsulta();
      this.bagProService.GetProduccionDetalladaAreas(fechaInicio, fechaFin, ruta).subscribe(res => this.produccion = res, error => {
        this.msj.mensajeAdvertencia(error.error);
        this.cargando = false;
      }, () => this.cargando = false);
    }
  }

  // Funcion que se encargará de validar los parametros de la consulta
  validarParametrosConsulta(): string {
    let ruta: string = ``;
    let orden: string = this.formFiltros.value.OrdenTrabajo;
    let proceso = this.formFiltros.value.proceso;
    let cliente = this.formFiltros.value.idCliente;
    let producto = this.formFiltros.value.idProducto;
    let turno = this.formFiltros.value.Turno;
    let envioZeus = this.formFiltros.value.EnvioZeus == null ? 'Todo' : this.formFiltros.value.EnvioZeus ? '1' : '0';

    if (orden != null) ruta += `orden=${orden}`;
    if (proceso != null) ruta.length > 0 ? ruta += `&proceso=${proceso}` : ruta += `proceso=${proceso}`;
    if (cliente != null) ruta.length > 0 ? ruta += `&cliente=${cliente}` : ruta += `cliente=${cliente}`;
    if (producto != null) ruta.length > 0 ? ruta += `&producto=${producto}` : ruta += `producto=${producto}`;
    if (turno != null) ruta.length > 0 ? ruta += `&turno=${turno}` : ruta += `turno=${turno}`;
    if (envioZeus != null) ruta.length > 0 ? ruta += `&envioZeus=${envioZeus}` : ruta += `envioZeus=${envioZeus}`;
    if (ruta.length > 0) ruta = `?${ruta}`;
    return ruta;
  }

  // Funcion que se encargará de sumar la cantidad o peso bruto de la información de producción
  totalCantidadConsultada() {
    let total: number = 0;
    this.produccion.forEach(x => total += x.cantidad);
    return total;
  }

  // Funcion que se encargará de sumar el peso neto de la información de producción
  totalPesoConsultado() {
    let total: number = 0;
    this.produccion.forEach(x => total += x.peso);
    return total;
  }

  // Funcion que se encargará de enviar los subir la producción a zeus
  enviarProduccionZeus() {
    if (this.rollosSeleccionados.length > 0) {
      this.cargando = true;
      let rollosSellado: any[] = this.rollosSeleccionados.filter(x => x.proceso == "SELLADO" && x.envioZeus.trim() == '0').map(x => x.rollo);
      let rollosEmpaque: any[] = this.rollosSeleccionados.filter(x => x.proceso == "EMPAQUE" && x.envioZeus.trim() == '0').map(x => x.rollo);
      if (rollosSellado.length > 0) {
        let count: number = 0;
        rollosSellado.forEach(data => {
          this.bagProService.EnvioZeusProcSellado(data).subscribe(() => {
            count++;
            if (count == rollosSellado.length) this.msj.mensajeConfirmacion(`¡Los rollos se han subido a Zeus!`)
          }, () => {
            this.msj.mensajeAdvertencia(`¡Ha ocurrido un error!`);
            this.cargando = false;
          }, () => this.cargando = false);
        });
      }

      if (rollosEmpaque.length > 0) {
        let count: number = 0;
        rollosEmpaque.forEach(data => {
          this.bagProService.EnvioZeusProcExtrusion(data).subscribe(() => {
            count++;
            if (count == rollosEmpaque.length) this.msj.mensajeConfirmacion(`¡Los rollos se han subido a Zeus!`)
          }, () => {
            this.msj.mensajeAdvertencia(`¡Ha ocurrido un error!`);
            this.cargando = false;
          }, () => this.cargando = false);
        });
      }
    } else this.msj.mensajeAdvertencia(`¡Debe seleccionar minimo un rollo!`);
  }

  //PDF
  //Función utilizada para descargar el PDF.
  downloadPdf() {
    this.cargando = true;
    let date1: any = moment(this.formFiltros.value.rangoFechas[0]).format("DD/MM/YYYY");
    let date2: any = moment(this.formFiltros.value.rangoFechas[1]).format("DD/MM/YYYY");
    let data: any = this.produccion;
    let title: string = `Informe de producción \nDel ${date1} al ${date2}`;
    let content: any[] = this.contentPDF(data);

    setTimeout(() => this.svcPDF.formatoPDF(title, content, this.headerInfo()), 1000);
    setTimeout(() => this.cargando = false, 4000);
  }

  //Función que almacena y retorna el contenido del PDF
  contentPDF(data: any): any {
    let content: any[] = [];
    let clients: any[] = this.getClients(data);
    let tableClients: any[] = this.tableClients(clients);
    let tableTotalsFinals: any = this.tableTotalsFinals(data);
    let tableTextsFinals: any = this.tableTextsFinals();

    content.push(tableClients);
    content.push(tableTotalsFinals);
    content.push(tableTextsFinals);
    return content;
  }

  //.Función que carga un header adicional en cada hoja del PDF.
  headerInfo() {
    let proceso: any = this.formFiltros.value.proceso;
    let info: any = [];
    info.push([
      {
        margin: [25, 0],
        fontSize: 10,
        bold: true,
        table: {
          widths: ['10%', '9%', '9%', '8%', '9%', '9%', '9%', '9%', '9%', '9%', '9%'],
          body: [
            [
              { text: `Fecha`, alignment: 'center', bold: true, border: [false, false, false, false] },
              { text: `Bulto`, alignment: 'center', bold: true, border: [false, false, false, false] },
              { text: `Cant.`, alignment: 'center', bold: true, border: [false, false, false, false] },
              { text: `Und.`, alignment: 'center', bold: true, border: [false, false, false, false] },
              { text: `Maq.`, alignment: 'center', bold: true, border: [false, false, false, false] },
              { text: proceso == 'SELLADO' || 'Wiketiado' ? `Teorico` : `P. Bruto`, alignment: 'center', bold: true, border: [false, false, false, false] },
              { text: proceso == 'SELLADO' || 'Wiketiado' ? `P. Real` : `P. Neto`, alignment: 'center', bold: true, border: [false, false, false, false] },
              { text: `Desv.`, alignment: 'center', bold: true, border: [false, false, false, false] },
              { text: `Turno`, alignment: 'center', bold: true, border: [false, false, false, false] },
              { text: `Hora`, alignment: 'center', bold: true, border: [false, false, false, false] },
              { text: `Zeus`, alignment: 'center', bold: true, border: [false, false, false, false] },
            ]
          ]
        }
      }
    ]);
    return info;
  }

  //.Función que filtra los clientes para que no sean repetidos. 
  getClients(data: any) {
    let clients: any[] = [];
    for (let i = 0; i < data.length; i++) {
      if (!clients.includes(data[i].cliente)) {
        clients.push(data[i].cliente);
      }
    }
    return clients;
  }

  //.Función que carga en la tabla los clientes previamente filtrados . 
  tableClients(clients: any) {
    let info: any = [];
    for (let index = 0; index < clients.length; index++) {
      info.push([{
        margin: [5, 10],
        fontSize: 10,
        bold: true,
        table: {
          headerRows: 1,
          widths: ['100%'],
          body: this.loadTableClients(clients[index])
        }
      }]);
    }
    return info;
  }

  //. Función que carga la tabla con los clientes y sus ordenes de trabajo.
  loadTableClients(clients: any) {
    let info: any = [];
    info.push([{ text: `Cliente: ${clients}`, alignment: 'left', fillColor: '#ccc', border: [true, true, true, true] }]);
    info.push([this.headerItemsClients(clients)]);
    return info;
  }

  //. Tabla que contendrá las ordenes de trabajo de los clientes. 
  headerItemsClients(clients: any) {
    let info: any = [];
    let orderProductions: any[] = [];

    this.produccion.forEach(x => {
      if (!orderProductions.includes(x.orden)) {
        orderProductions.push(x.orden);
        if (x.cliente == clients) info.push(this.tableItemsClients(x));
      }
    });
    return info;
  }

  //. Tabla de encabezado con la referencia, orden de trabajo y cantidad pedida.
  tableItemsClients(data: any) {
    let info: any[] = [];
    info.push({
      margin: [0, 5, 0, 5],
      fontSize: 9,
      bold: true,
      colSpan: 4,
      table: {
        headerRows: 1,
        dontBreakRows: true,
        widths: ['13%', '55%', '12%', '20%'],
        body: [
          [
            { text: `Item: ${data.item}`, alignment: 'left', border: [true, true, false, true] },
            { text: `Referencia: ${data.referencia}`, alignment: 'left', border: [false, true, false, true] },
            { text: `OT: ${data.orden}`, alignment: 'left', border: [false, true, false, true] },
            { text: `Cantidad: ${this.formatonumeros(data.cantPedida.toFixed())} ${data.presentacion}`, alignment: 'left', border: [false, true, true, true] },
          ],
        ],
      }
    });
    info.push([this.tableDetailsRolls(data)]);
    return info;
  }

  //Tabla que carga los detalles de la produccion por cliente, ot e item. 
  tableDetailsRolls(data: any) {
    let info: any = [];
    let rollos: any[] = this.produccion.filter(x => x.cliente == data.cliente && x.orden == data.orden && x.item == data.item);
    rollos.forEach(x => {
      info.push(this.detailsProduction(x));
    });
    info.push(this.tableTotalOrders(data));
    return info;
  }

  //.Tabla de detalles de la producción consultada
  detailsProduction(items: any) {
    return {
      margin: [0, 0],
      fontSize: 8,
      bold: false,
      table: {
        dontBreakRows: true,
        widths: ['10%', '9%', '9%', '8%', '9%', '9%', '9%', '9%', '9%', '9%', '9%'],
        body: [
          [
            { text: `${items.fecha.replace('T00:00:00', '')}`, alignment: 'center', border: [false, false, false, false], },
            { text: `${items.rollo}`, alignment: 'center', border: [false, false, false, false], },
            { text: ['SELLADO', 'Wiketiado'].includes(items.proceso) ? `${this.formatonumeros(items.cantidad)}` : `${this.formatonumeros(items.peso)}`, alignment: 'center', border: [false, false, false, false], },
            { text: `${items.presentacion}`, alignment: 'center', border: [false, false, false, false], },
            { text: `${items.maquina}`, alignment: 'center', border: [false, false, false, false], },
            { text: ['SELLADO', 'Wiketiado'].includes(items.proceso) ? `${this.formatonumeros(items.pesoTeorico)}` : `${this.formatonumeros(items.cantidad)}`, alignment: 'center', border: [false, false, false, false], },
            { text: `${this.formatonumeros(items.peso)}`, alignment: 'center', border: [false, false, false, false], color: items.desviacion < -10 ? 'blue' : 'black', },
            { text: `${this.formatonumeros(items.desviacion.toFixed(2))}%`, alignment: 'center', border: [false, false, false, false], color: items.desviacion < 5 ? 'black' : 'red', },
            { text: `${items.turno}`, alignment: 'center', border: [false, false, false, false], },
            { text: `${items.hora}`, alignment: 'center', border: [false, false, false, false], },
            { text: `${items.envioZeus}`, alignment: 'center', border: [false, false, false, false], },
          ],
        ],
      }
    }
  }

  //. Tabla de totales por orden de trabajo
  tableTotalOrders(data: any) {
    return {
      margin: [0, 0],
      fontSize: 8,
      bold: false,
      table: {
        widths: ['10%', '9%', '9%', '8%', '9%', '9%', '9%', '9%', '9%', '9%', '9%'],
        body: [
          [
            { text: ``, alignment: 'center', border: [false, false, false, false], },
            { text: `Bultos: ${this.totalRows(data.orden)}`, alignment: 'center', border: [false, true, false, false], bold: true, },
            { text: ['SELLADO', 'Wiketiado'].includes(data.proceso) ? `${this.formatonumeros(this.totalQty(data.orden).toFixed(2))}` : `${this.formatonumeros(this.totalWeightReal(data.orden).toFixed(2))}`, alignment: 'center', bold: true, border: [false, true, false, false], },
            { text: ``, alignment: 'center', border: [false, false, false, false], },
            { text: ``, alignment: 'center', border: [false, false, false, false], },
            { text: ['SELLADO', 'Wiketiado'].includes(data.proceso) ? `${this.formatonumeros(this.totalWeightTeoric(data.orden).toFixed(2))}` : `${this.formatonumeros(this.totalWeight(data.orden).toFixed(2))}`, alignment: 'center', bold: true, border: [false, true, false, false], },
            { text: `${this.formatonumeros(this.totalWeightReal(data.orden).toFixed(2))}`, alignment: 'center', bold: true, border: [false, true, false, false], },
            { text: ``, alignment: 'center', border: [false, false, false, false], },
            { text: ``, alignment: 'center', border: [false, false, false, false], },
            { text: ``, alignment: 'center', border: [false, false, false, false], },
            { text: ``, alignment: 'center', border: [false, false, false, false], },
          ],
        ],
      }
    }
  }

  // Tabla con pesos totales finales. 
  tableTotalsFinals(data: any) {
    return {
      margin: [0, 10, 0, 0],
      fontSize: 9,
      bold: false,
      table: {
        widths: ['9%', '9%', '9%', '7%', '10%', '10%', '9%', '9%', '9%', '9%', '9%'],
        body: [
          [
            { text: ``, alignment: 'center', border: [false, false, false, false], },
            { text: ``, alignment: 'center', border: [false, false, false, false], },
            { text: ``, alignment: 'center', border: [false, false, false, false], },
            { text: ``, alignment: 'center', border: [false, false, false, false], },
            { text: ['SELLADO', 'Wiketiado'].includes(data[data.length - 1].proceso) ? `${this.formatonumeros(this.totalFinalTeoricWeight().toFixed(2))}` : `${this.formatonumeros(this.totalFinalGrossWeight().toFixed(2))}`, alignment: 'center', bold: true, border: [false, false, false, true], },
            { text: ``, alignment: 'center', border: [false, false, false, false], },
            { text: `${this.formatonumeros(this.totalFinalWeightReal().toFixed(2))}`, alignment: 'center', bold: true, border: [false, false, false, true], },
            { text: ``, alignment: 'center', border: [false, false, false, false], },
            { text: ``, alignment: 'center', border: [false, false, false, false], },
            { text: ``, alignment: 'center', border: [false, false, false, false], },
            { text: ``, alignment: 'center', border: [false, false, false, false], },
          ],
        ],
      }
    }
  }

  // Tabla con textos finales. 
  tableTextsFinals() {
    return {
      margin: [0, 0],
      fontSize: 10,
      bold: true,
      table: {
        widths: ['10%', '9%', '9%', '8%', '9%', '9%', '9%', '9%', '9%', '9%', '9%'],
        body: [
          [
            { text: ``, alignment: 'center', border: [false, false, false, false], },
            { text: ``, alignment: 'center', border: [false, false, false, false], },
            { text: ``, alignment: 'center', bold: false, border: [false, false, false, false], },
            { text: ``, alignment: 'center', border: [false, false, false, false], },
            { text: `Kls Bruto`, alignment: 'center', bold: true, border: [false, false, false, false], },
            { text: ``, alignment: 'center', bold: false, border: [false, false, false, false], },
            { text: `Kls Neto`, alignment: 'center', bold: true, border: [false, false, false, false], },
            { text: ``, alignment: 'center', border: [false, false, false, false], },
            { text: ``, alignment: 'center', border: [false, false, false, false], },
            { text: ``, alignment: 'center', border: [false, false, false, false], },
            { text: ``, alignment: 'center', border: [false, false, false, false], },
          ],
        ],
      }
    }
  }

  //. Total cantidades por cliente y orden de trabajo.
  totalQty = (ot: any) => this.produccion.filter(x => x.orden == ot).reduce((total, item) => total + item.cantidad, 0);

  //. Total peso teorico por cliente y orden de trabajo.
  totalWeightTeoric = (ot: any) => this.produccion.filter(x => x.orden == ot).reduce((total, item) => total + item.pesoTeorico, 0);

  //. Total peso bruto por cliente y orden de trabajo.
  totalWeight = (ot: any) => this.produccion.filter(x => x.orden == ot).reduce((total, item) => total + item.cantidad, 0);

  //. Total peso neto por cliente y orden de trabajo.
  totalWeightReal = (ot: any) => this.produccion.filter(x => x.orden == ot).reduce((total, item) => total + item.peso, 0);

  //. Total final peso bruto por cliente y orden de trabajo.
  totalFinalGrossWeight = () => this.produccion.reduce((total, item) => total + item.cantidad, 0);

  //. Total final peso teorico por cliente y orden de trabajo.
  totalFinalTeoricWeight = () => this.produccion.reduce((total, item) => total + item.pesoTeorico, 0);

  //. Total final peso neto por cliente y orden de trabajo.
  totalFinalWeightReal = () => this.produccion.reduce((total, item) => total + item.peso, 0);

  //. Cantidad de bultos por orden de trabajo. 
  totalRows = (ot: any) => this.produccion.filter(x => x.orden == ot).length;

  //.Excel
  //. Función utilizada para descargar el formato excel
  exportExcel(){
    if(this.produccion.length > 0) {
      let date1 : any = moment(this.formFiltros.value.rangoFechas[0]).format('DD-MM-YYYY'); 
      let date2 : any = moment(this.formFiltros.value.rangoFechas[1]).format('DD-MM-YYYY'); 
      this.cargando = true;
      setTimeout(() => {
        let title : string = `Reporte Producción de ${date1} a ${date2}`;
        let fill : any = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } };
        let font : any = { size: 12, bold: true, alignment: 'center', name : 'Calibri' };
        let border : any = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        let workbook = this.svcExcel.formatoExcel(title, true);
        this.addSheet(workbook, fill, font, border, this.infoProduction(), 1);
        this.svcExcel.creacionHoja(workbook, `Reporte Producción Consolidado`, false);
        this.addGroupedSheet(workbook, fill, font, border, this.groupedInfoExcel(), 2);
        this.svcExcel.creacionExcel(`Reporte Producción de ${date1} a ${date2}`, workbook);
        this.cargando = false;  
      }, 2000);
    } else this.msj.mensajeAdvertencia(`No hay registros para exportar!`);
  }

  //.Agregar hoja al formato excel.
  addSheet(workbook, fill , font, border, data : any, pageNumber : number) {
    let page = workbook.worksheets[pageNumber - 1];
    this.addHeaderPage(page, font, border, fill);
    page.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    this.addInfoExcel(page, data);
  }

  //.Información de la producción.
  infoProduction(){
    let info : any = [];
    this.produccion.forEach(d => info.push([d.orden, d.rollo, d.cliente, d.item, d.referencia, d.peso, d.cantidad, d.presentacion, d.turno, d.fecha.replace('T00:00:00', ''), d.hora, d.proceso, d.maquina, d.envioZeus == 1 ? 'SI' : 'NO',]));
    return info;
  }

  //.Agregar información a la hoja del excel.
  addInfoExcel(worksheet : any, data : any) {
    let formatNumber: Array<number> = [7];
    formatNumber.forEach(i => worksheet.getColumn(i).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    data.forEach(d => worksheet.addRow(d));
  }

  //.Agregar encabezado a la hoja del excel.
  addHeaderPage(worksheet, font, border, fill) {
    
    let rowHeader : any = ['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5', 'I5', 'J5', 'K5', 'L5', 'M5', 'N5']
    worksheet.addRow(['OT', 'Rollo', 'Cliente', 'Item', 'Referencia', 'Peso', 'Cantidad', 'Unidad', 'Turno', 'Fecha', 'Hora', 'Proceso', 'Maquina', 'Envio Zeus', ]);
    
    rowHeader.forEach(x => worksheet.getCell(x).fill = fill);
    rowHeader.forEach(x => worksheet.getCell(x).font = font);
    rowHeader.forEach(x => worksheet.getCell(x).border = border);

    let concatCells : any = ['A1:N3'];
    this.stylesPage(worksheet, concatCells, []);
  }

  //.Estilos de la hoja del excel.
  stylesPage(worksheet, concatCells, formatNumber) {
    formatNumber.forEach(i => worksheet.getColumn(i).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    [1, 2, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].forEach(x => worksheet.getColumn(x).width = 12);
    [3,5].forEach(x => worksheet.getColumn(x).width = 50)
    concatCells.forEach(cell => worksheet.mergeCells(cell));
  }

  //Hoja 2 Agrupada
  addGroupedSheet(workbook, fill , font, border, data : any, pageNumber : number){
    let page = workbook.worksheets[pageNumber - 1];
    this.addGroupedHeader(page, font, border, fill);
    page.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    this.addGroupedInfoExcel(page, data);
  }

  //.Agregar encabezado a la hoja del excel.
  addGroupedHeader(worksheet, font, border, fill) {
    worksheet.addRow([]);
    worksheet.addRow([]);
    let rowHeader : any = ['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4'];
    worksheet.addRow(['OT', 'Cliente', 'Item', 'Referencia', 'Peso', 'Cantidad', 'Unidad', ]);
    
    rowHeader.forEach(x => worksheet.getCell(x).fill = fill);
    rowHeader.forEach(x => worksheet.getCell(x).font = font);
    rowHeader.forEach(x => worksheet.getCell(x).border = border);

    let concatCells : any = ['A1:G3'];
    this.stylesGroupedPage(worksheet, concatCells, []);
  }

  //.Agregar información a la hoja del excel.
  addGroupedExcel(worksheet : any, data : any) {
    let formatNumber: Array<number> = [7];
    formatNumber.forEach(i => worksheet.getColumn(i).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    data.forEach(d => worksheet.addRow(d));
  }

  //.Agregar información a la hoja del excel.
  addGroupedInfoExcel(worksheet : any, data : any) {
    let formatNumber: Array<number> = [6];
    formatNumber.forEach(i => worksheet.getColumn(i).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    data.forEach(d => worksheet.addRow(d));
  }

  groupedInfoExcel(){
    let info : any = [];
    info = this.produccion.reduce((acc, ot) => {
      console.log(acc);
      console.log(ot)
      if(!acc.map(x => x[0]).includes(ot.orden)) {
        acc = [...acc, [ot.orden, ot.cliente, ot.item, ot.referencia, ot.peso, ot.cantidad, ot.presentacion]]
      } else {
        acc[acc.map(x => x[0]).indexOf(ot.orden)][4] += ot.peso;
        acc[acc.map(x => x[0]).indexOf(ot.orden)][5] += ot.cantidad;
      }
      return acc;
    }, [])
    //this.produccion.forEach(d => info.push([d.orden, d.cliente, d.item, d.referencia, d.peso, d.cantidad, d.presentacion, ]));
    return info;
  }

  stylesGroupedPage(worksheet, concatCells, formatNumber) {
    formatNumber.forEach(i => worksheet.getColumn(i).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    [1, 2, 5, 6, 7].forEach(x => worksheet.getColumn(x).width = 12);
    [2, 4].forEach(x => worksheet.getColumn(x).width = 50)
    concatCells.forEach(cell => worksheet.mergeCells(cell));
  }

}