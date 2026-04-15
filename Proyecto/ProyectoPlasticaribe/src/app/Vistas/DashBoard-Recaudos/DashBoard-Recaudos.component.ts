import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { Table } from 'primeng/table';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { ZeusContabilidadService } from 'src/app/Servicios/Zeus_Contabilidad/zeusContabilidad.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsDashboardRecaudos as defaultSteps } from 'src/app/data';
import { PaginaPrincipalComponent } from '../PaginaPrincipal/PaginaPrincipal.component';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { ReportesConsolidadosComponent } from '../Reportes-Consolidados/Reportes-Consolidados.component';
import { OrdenFacturacionService } from 'src/app/Servicios/OrdenFacturacion/OrdenFacturacion.service';
import { Orden_FacturacionComponent } from '../Orden_Facturacion/Orden_Facturacion.component';
import { Devolucion_OrdenFacturacionComponent } from '../Devolucion_OrdenFacturacion/Devolucion_OrdenFacturacion.component';
import { CreacionExcelService } from 'src/app/Servicios/CreacionExcel/CreacionExcel.service';
import { finalize, forkJoin } from 'rxjs';

@Component({
  selector: 'app-DashBoard-Recaudos',
  templateUrl: './DashBoard-Recaudos.component.html',
  styleUrls: ['./DashBoard-Recaudos.component.css']
})

export class DashBoardRecaudosComponent implements OnInit {

  @ViewChild('dt1') dt1: Table | undefined;
  @ViewChild('dt2') dt2: Table | undefined;
  cargando: boolean = false; //Variable para validar que salga o no la imagen de carga  
  storage_Id: any; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre: any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol: any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol: any; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today: any = moment().format('YYYY-MM-DD'); //Variable que va a almacenar la fecha del dia de hoy
  primerDiaMes: any = moment().startOf('month').format('YYYY-MM-DD'); //Variable que va a almacenar el primer dia del mes
  modoSeleccionado: boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  carteraAgrupadaClientes: any = []; //Variable que almacenará la información de la cartera agrupada por los clientes
  carteraAgrupadaVendedores: any = []; //Variable que almacenará la información de la cartera agrupada por vendedores
  cartera: any = []; //Variable que almacenará la información de la cartera, información detalla de cada una de las facturas en cartera
  //totalCartera : number = 0; //Variable que almacenará el valor total de la cartera
  vendedores: any[] = []; //Variable que almacenará la información de los vendedores
  clientes: any[] = []; //Variable que almacenará la información de los clientes
  FormFiltros: FormGroup;
  traceability: boolean = false;
  cols: any = [];
  movements: any = [];
  invoiceSelected: any = null;

  constructor(private AppComponent: AppComponent,
    private zeusService: ZeusContabilidadService,
    private shepherdService: ShepherdService,
    private paginaPrincial: PaginaPrincipalComponent,
    private reportesConsolidadosComponent: ReportesConsolidadosComponent,
    private frmBuilder: FormBuilder,
    private vendedorService: UsuarioService,
    private msj: MensajesAplicacionService,
    private creacionPDFService: CreacionPdfService,
    private svOF: OrdenFacturacionService,
    private cmpOF: Orden_FacturacionComponent,
    private cmpDevolutions: Devolucion_OrdenFacturacionComponent,
    private svExcel: CreacionExcelService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;

    this.FormFiltros = this.frmBuilder.group({
      Cliente: [null],
      Vendedor: [null],
      CarteraOriginal: [false]
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.obtenerVendedor();
    this.obtenerClientes();
    this.tiempoExcedido();
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
  }

  // Funcion que iniciará el tutorial
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

  aplicarfiltro = ($event, data: any, campo: any) => data!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  //Funcion que va a encargarse de cargar la información de las cards y llama a la funcion de que contará en cunato tiempo se recargará la información
  tiempoExcedido() {
    if (this.paginaPrincial.recaudos || this.reportesConsolidadosComponent.cartera) {
      this.consultarCartera();
    }
  }

  // Funcion que consultará los clientes
  obtenerClientes() {
    this.zeusService.GetClientes().subscribe(data => {
      data.forEach(x => {
        x.displayLabel = `${x.idcliente} - ${x.razoncial}`;
        this.clientes.push(x);
      });
    });
  }

  // Funcion que consultará los vendedores
  obtenerVendedor = () => this.vendedorService.GetVendedores().subscribe(data => this.vendedores = data.map(x => x.usua_Nombre));

  // Función que ejecutará las peticiones de la cartera
  consultarCartera() {
    this.cargando = true;
    let ruta: string = "";
    let cliente: any = this.FormFiltros.value.Cliente == null ? [] : this.FormFiltros.value.Cliente;
    let vendedor: string = this.FormFiltros.value.Vendedor;
    let carteraOriginal: boolean = this.FormFiltros.value.CarteraOriginal;

    if (this.ValidarRol == 2) vendedor = `${this.storage_Nombre}`;
    this.carteraAgrupadaClientes = [];
    this.carteraAgrupadaVendedores = [];
    this.cartera = [];

    if (vendedor != null) ruta += `vendedor=${vendedor}`;
    //if (cliente != null) ruta.length > 0 ? ruta += `&cliente=${cliente}` : ruta += `cliente=${cliente}`;
    if (ruta.length > 0) ruta = `?${ruta}`;

    this.zeusService.GetCarteraAgrupadaClientes(cliente, ruta).subscribe(data => this.carteraAgrupadaClientes = data);
    this.zeusService.GetCarteraAgrupadaVendedores(ruta).subscribe(data => this.carteraAgrupadaVendedores = data);
    this.zeusService.GetCarteraTotal(cliente, ruta).subscribe((data: any) => {

      this.cartera = data.filter(x => x.saldo_Cartera > 0);
      if (carteraOriginal) this.cartera = this.cartera.filter(x => x.cantidad_Dias < 1000);
      this.cargando = false;
    }, error => {
      this.msj.mensajeError("Error al intentar consultar la cartera total", error.error.title);
      this.cargando = false
    });
  }

  consultarCartera2() {
    this.cargando = true;

    const { Cliente, Vendedor, CarteraOriginal } = this.FormFiltros.value;

    const cliente = Cliente ?? [];
    const vendedor = this.ValidarRol == 2
      ? String(this.storage_Id).padStart(3, '0')
      : Vendedor;

    // Construcción limpia del query string
    const params = new URLSearchParams();
    if (vendedor) params.append('vendedor', vendedor);

    const ruta = params.toString() ? `?${params.toString()}` : '';

    // Limpieza de arrays
    this.carteraAgrupadaClientes = [];
    this.carteraAgrupadaVendedores = [];
    this.cartera = [];

    forkJoin({
      clientes: this.zeusService.GetCarteraAgrupadaClientes(cliente, ruta),
      vendedores: this.zeusService.GetCarteraAgrupadaVendedores(ruta),
      total: this.zeusService.GetCarteraTotal(cliente, ruta)
    })
      .pipe(
        finalize(() => this.cargando = false)
      )
      .subscribe({
        next: (response) => {

          this.carteraAgrupadaClientes = response.clientes;
          this.carteraAgrupadaVendedores = response.vendedores;

          this.cartera = (response.total as any[])
            .filter(x => x.saldo_Cartera > 0)
            .filter(x => !CarteraOriginal || x.cantidad_Dias < 1000);
        },
        error: (error) => {
          this.msj.mensajeError(
            "Error al intentar consultar la cartera total",
            error?.error?.title ?? "Error desconocido"
          );
        }
      });
  }

  totalCartera = () => this.cartera.filter(x => x.saldo_Cartera > 0).reduce((acc, item) => acc + item.saldo_Cartera, 0);

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number: any) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  // Función que se encargará de generar el PDF, dependiendo de los filtros que se hayan seleccionado
  generarPDF() {
    if (this.cartera.length > 0) {
      this.cargando = true;
      let informacionPDF = this.seleccionarInformacionPDf();
      let titulo: string = "Cartera Plasticaribe";
      let content: any[] = this.contenidoPDF(informacionPDF);
      this.creacionPDFService.formatoPDF(titulo, content);
      setTimeout(() => this.cargando = false, 3000);
    } else {
      this.msj.mensajeAdvertencia("No hay datos para generar el PDF");
      this.cargando = false;
    }
  }

  // Función que se encargará de organizar la información para el PDF dependiendo de los filtros seleccionados
  contenidoPDF(informacionPDF) {
    let data: any[] = [];
    let vendedores: any[] = this.obtenerVendedoresCartera(informacionPDF);
    for (let i = 0; i < vendedores.length; i++) {
      data.push([
        {
          margin: [5, 0, 5, 5],
          text: `${vendedores[i].id} - ${vendedores[i].nombre}`,
          bold: true,
          fontSize: 11,
          alignment: 'left'
        },
        this.clientesVendedorPdf(vendedores[i].id, informacionPDF),
      ]);
    }
    data.push(this.totalCarteraPdf(informacionPDF));
    return data;
  }

  // Función que se encargará de organizar la información de los clientes dependiendo del vendedor para el PDF
  clientesVendedorPdf(vendedor: string, informacionPDF) {
    let clientes: any[] = informacionPDF.filter(x => x.id_Vendedor == vendedor);
    clientes.sort((a, b) => a.nombre_CLiente.localeCompare(b.nombre_CLiente));
    let clientesIncluidos: any[] = [];
    let data: any[] = [];
    for (let i = 0; i < clientes.length; i++) {
      if (!clientesIncluidos.includes(clientes[i].id_Cliente)) {
        clientesIncluidos.push(clientes[i].id_Cliente);
        data.push({
          margin: [5, 0, 5, 5],
          table: {
            headerRows: 1,
            widths: ['10%', '35%', '12%', '20%', '11%', '12%'],
            body: this.facturasClientes(clientes[i], informacionPDF)
          }
        });
      }
    }
    return data;
  }

  // Función que se encargará de organizar la información de las facturas dependiendo del cliente para el PDF
  facturasClientes(cliente, informacionPDF) {
    let facturas: any[] = informacionPDF.filter(x => x.id_Cliente == cliente.id_Cliente);
    facturas.sort((a, b) => a.id_Fecha.localeCompare(b.id_Fecha));
    let data: any[] = [];
    data.push(this.informacionClientePDF(cliente));
    data.push([
      {
        // margin: [3, 3, 3, 0],
        colSpan: 6,
        border: [true, false, true, true],
        table: {
          fontSize: 7,
          headerRows: 1,
          dontBreakRows: true,
          widths: ['11%', '11%', '11%', '5%', '12%', '12%', '12%', '14%', '12%',],
          body: this.datosFacturasPdf(facturas)
        }
      },
      {},
      {},
      {},
      {},
      {},
    ]);
    data.push(this.totalClientePdf(facturas));
    return data;
  }

  // Función que se encargará de organizar la información del cliente para el PDF
  informacionClientePDF(cliente) {
    return [
      { border: [true, true, false, true], text: `${cliente.id_Cliente}`, fillColor: '#ccc', bold: true, fontSize: 8, alignment: 'left' },
      { border: [false, true, false, true], text: `${cliente.nombre_CLiente}`, fillColor: '#ccc', bold: true, fontSize: 8, alignment: 'left' },
      { border: [false, true, false, true], text: `${cliente.ciudad_Cliente}`, fillColor: '#ccc', bold: true, fontSize: 8, alignment: 'center' },
      { border: [false, true, false, true], text: `${cliente.direccion_Cliente}`, fillColor: '#ccc', bold: true, fontSize: 8, alignment: 'center' },
      { border: [false, true, false, true], text: `${cliente.telefono_Cliente}`, fillColor: '#ccc', bold: true, fontSize: 8, alignment: 'center' },
      { border: [false, true, true, true], text: `Plazo: ${cliente.plazo_De_Pago} Días`, fillColor: '#ccc', bold: true, fontSize: 8, alignment: 'right' },
    ]
  }

  // Función que se encargará de organizar la información de las facturas para el PDF
  datosFacturasPdf(facturas) {
    let data: any[] = [];
    data.push(this.titulosFacturasPdf());
    for (let i = 0; i < facturas.length; i++) {
      data.push([
        { border: [false, false, false, false], fontSize: 7, alignment: 'center', text: `${facturas[i].num_Factura}` },
        { border: [false, false, false, false], fontSize: 7, alignment: 'center', text: `${facturas[i].id_Fecha}` },
        { border: [false, false, false, false], fontSize: 7, alignment: 'center', text: `${facturas[i].fecha_Vencimiento}` },
        { border: [false, false, false, false], fontSize: 7, alignment: 'center', text: `${facturas[i].cantidad_Dias}` },
        { border: [false, false, false, false], fontSize: 7, alignment: 'right', text: `${this.formatonumeros((facturas[i].saldoPlazo1)) == -1 ? '' : this.formatonumeros((facturas[i].saldoPlazo1).toFixed(2))}` },
        { border: [false, false, false, false], fontSize: 7, alignment: 'right', text: `${this.formatonumeros((facturas[i].saldoPlazo2)) == -1 ? '' : this.formatonumeros((facturas[i].saldoPlazo2).toFixed(2))}` },
        { border: [false, false, false, false], fontSize: 7, alignment: 'right', text: `${this.formatonumeros((facturas[i].saldoPlazo3)) == -1 ? '' : this.formatonumeros((facturas[i].saldoPlazo3).toFixed(2))}` },
        { border: [false, false, false, false], fontSize: 7, alignment: 'right', text: `${this.formatonumeros((facturas[i].saldoPlazo4)) == -1 ? '' : this.formatonumeros((facturas[i].saldoPlazo4).toFixed(2))}` },
        { border: [false, false, false, false], fontSize: 7, alignment: 'right', text: `${this.formatonumeros((facturas[i].saldoPlazo5)) == -1 ? '' : this.formatonumeros((facturas[i].saldoPlazo5).toFixed(2))}` },
      ]);
    }

    data.push([
      { border: [false, false, false, false], fontSize: 7, alignment: 'center', text: `` },
      { border: [false, false, false, false], fontSize: 7, alignment: 'center', text: `` },
      { border: [false, false, false, false], fontSize: 7, alignment: 'center', text: `` },
      { border: [false, false, false, false], fontSize: 7, alignment: 'center', text: `` },
      { border: [false, false, false, facturas.reduce((a, b) => a += b.saldoPlazo1, 0) > 0], bold: true, fontSize: 8, alignment: 'right', text: `${facturas.reduce((a, b) => a += b.saldoPlazo1, 0) <= 0 ? '' : this.formatonumeros((facturas.reduce((a, b) => a += b.saldoPlazo1, 0)).toFixed(2))}` },
      { border: [false, false, false, facturas.reduce((a, b) => a += b.saldoPlazo2, 0) > 0], bold: true, fontSize: 8, alignment: 'right', text: `${facturas.reduce((a, b) => a += b.saldoPlazo2, 0) <= 0 ? '' : this.formatonumeros((facturas.reduce((a, b) => a += b.saldoPlazo2, 0)).toFixed(2))}` },
      { border: [false, false, false, facturas.reduce((a, b) => a += b.saldoPlazo3, 0) > 0], bold: true, fontSize: 8, alignment: 'right', text: `${facturas.reduce((a, b) => a += b.saldoPlazo3, 0) <= 0 ? '' : this.formatonumeros((facturas.reduce((a, b) => a += b.saldoPlazo3, 0)).toFixed(2))}` },
      { border: [false, false, false, facturas.reduce((a, b) => a += b.saldoPlazo4, 0) > 0], bold: true, fontSize: 8, alignment: 'right', text: `${facturas.reduce((a, b) => a += b.saldoPlazo4, 0) <= 0 ? '' : this.formatonumeros((facturas.reduce((a, b) => a += b.saldoPlazo4, 0)).toFixed(2))}` },
      { border: [false, false, false, facturas.reduce((a, b) => a += b.saldoPlazo5, 0) > 0], bold: true, fontSize: 8, alignment: 'right', text: `${facturas.reduce((a, b) => a += b.saldoPlazo5, 0) <= 0 ? '' : this.formatonumeros((facturas.reduce((a, b) => a += b.saldoPlazo5, 0)).toFixed(2))}` },
    ]);
    return data;
  }

  // Función que se encargará de organizar la información de los títulos de las columnas para el PDF
  titulosFacturasPdf() {
    return [
      { border: [false, false, false, false], text: `Factura`, fillColor: '#ccc', bold: true, alignment: 'center', fontSize: 8 },
      { border: [false, false, false, false], text: `Fecha`, fillColor: '#ccc', bold: true, alignment: 'center', fontSize: 8 },
      { border: [false, false, false, false], text: `F. Vence`, fillColor: '#ccc', bold: true, alignment: 'center', fontSize: 8 },
      { border: [false, false, false, false], text: `Días`, fillColor: '#ccc', bold: true, alignment: 'center', fontSize: 8 },
      { border: [false, false, false, false], text: `1-30 Dias`, fillColor: '#ccc', bold: true, alignment: 'center', fontSize: 8 },
      { border: [false, false, false, false], text: `31-60 Dias`, fillColor: '#ccc', bold: true, alignment: 'center', fontSize: 8 },
      { border: [false, false, false, false], text: `61-90 Dias`, fillColor: '#ccc', bold: true, alignment: 'center', fontSize: 8 },
      { border: [false, false, false, false], text: `91-120 Dias`, fillColor: '#ccc', bold: true, alignment: 'center', fontSize: 8 },
      { border: [false, false, false, false], text: `+120 Dias`, fillColor: '#ccc', bold: true, alignment: 'center', fontSize: 8 },
    ];
  }

  //Función que se encargará de organizar la información del total del cliente para el PDF
  totalClientePdf(facturas) {
    let total = facturas.reduce((a, b) => a + b.saldo_Cartera, 0)
    return [
      {
        margin: [5, 5, 5, 0],
        colSpan: 6,
        alignment: 'right',
        fontSize: 10,
        bold: true,
        border: [false, true, false, false],
        text: `Total Cliente: $ ${this.formatonumeros((total).toFixed(2))}`,
      },
      {},
      {},
      {},
      {},

    ]
  }

  // Función que se encargará de organizar la información del total de la cartera para el PDF
  totalCarteraPdf(informacionPDF) {
    let totalCartera = informacionPDF.reduce((a, b) => a + b.saldo_Cartera, 0);
    return [
      {
        margin: [20, 5],
        table: {
          widths: [518],
          body: [
            [
              {
                margin: 10,
                border: [true, true, true, true],
                alignment: 'right',
                fontSize: 11,
                bold: true,
                text: `Total Cartera: $ ${this.formatonumeros((totalCartera).toFixed(2))}`
              }
            ]
          ],
        }
      },
    ]
  }

  // Función que se encargará de organizar la información de los vendedores para el PDF
  obtenerVendedoresCartera(informacionPDF) {
    let vendedores: any[] = [];
    informacionPDF.forEach(factura => {
      if (!vendedores.map(x => x.nombre).includes(factura.nombre_Vendedor)) {
        vendedores.push({
          id: factura.id_Vendedor,
          nombre: factura.nombre_Vendedor
        });
      }
    });
    vendedores.sort((a, b) => a.id - b.id);
    return vendedores;
  }

  // Función que se encargará de organizar la información del total de la cartera para el PDF
  seleccionarInformacionPDf(): any[] {
    let informacion: any[] = this.cartera;
    let carteraOriginal: boolean = this.FormFiltros.value.CarteraOriginal;
    if (carteraOriginal) informacion = this.cartera.filter(x => x.cantidad_Dias < 1000);
    if (this.FormFiltros.value.Vendedor) informacion = informacion.filter(x => x.nombre_Vendedor == this.FormFiltros.value.Vendedor);
    if (this.FormFiltros.value.Cliente) informacion = informacion.filter(x => this.FormFiltros.value.Cliente.includes(x.id_Cliente));
    console.log(informacion);
    return informacion;
  }

  //* FUNCIONES PARA MOVIMIENTOS DE FACTURA (OF, DESPACHO, DV)
  // Carga el header y body de la tabla.
  loadColumnsTable() {
    this.cols = [];
    this.cols = [
      { field: 'type', header: 'Movimiento', type: 'text' },
      { field: 'id', header: 'Id', type: 'number' },
      { field: 'date', header: 'Fecha', type: 'text' },
      { field: 'hour', header: 'Hora', type: 'text' },
      { field: 'userName', header: 'Usuario', type: 'text' },
      { field: 'status', header: 'Estado', type: 'text' },
      { field: 'observation', header: 'Observación', type: 'text' },
    ];
  }

  //Busca los movimientos de las facturas en plasticaribe.
  searchMovementsInvoicesPl(data) {
    this.invoiceSelected = data.num_Factura;
    this.movements = [];
    this.cargando = true;
    this.svOF.getMovementsInvoices(data.num_Factura).subscribe(dataPl => {
      if (dataPl.length > 0) {
        this.traceability = true;
        this.loadColumnsTable();
        this.movements = dataPl;
        this.movements.sort((a, b) => a.date.localeCompare(b.date));
        this.movements.sort((a, b) => a.hour > b.hour);
        this.cargando = false;
      } else this.messages(`Advertencia`, `No se encontraron movimientos para la factura N° ${data.num_Factura}`);
    }, error => {
      this.messages(`Error`, `Se encontraron errores consultando información de la factura N° ${data.num_Factura}`);
    });
  }

  //Muestra msjs dependiendo el tipo de msj.
  messages(msj1: string, msj2: string) {
    this.cargando = false;
    switch (msj1) {
      case 'Confirmación':
        return this.msj.mensajeConfirmacion(msj1, msj2);
      case 'Advertencia':
        return this.msj.mensajeAdvertencia(msj1, msj2);
      case 'Error':
        return this.msj.mensajeError(msj1, msj2);
      default:
        this.msj.mensajeAdvertencia(msj1, msj2);
        break;
    }
  }

  //Descarga un pdf dependiendo el tipo de movimiento
  downloadPDF(data: any) {
    this.cargando = true;
    if (data.type == `ORDEN FACTURACIÓN`) this.cmpOF.createPDF(data.id, ``);
    else if (data.type == `SALIDA DESPACHO`) this.cmpOF.createPDF(parseInt(data.observation.replace(`Orden de Facturación #`, ``)), data.id);
    else if (data.type == `DEVOLUCIÓN`) this.cmpDevolutions.createPDF(data.id, `exportada`);
    setTimeout(() => { this.cargando = false }, 1000);
  }

  exportExcel() {
    if (this.cartera.length > 0) {
      this.cargando = true;
      setTimeout(() => {
        let title: string = `Cartera Total Plasticaribe`;
        let fill: any = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } };
        let font: any = { size: 10, bold: true, alignment: 'center', name: 'Calibri' };
        let border: any = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        let workbook = this.svExcel.formatoExcel(title, true);
        this.addSheet2(workbook, fill, font, border, this.infoProduction2(), 1);
        this.svExcel.creacionHoja(workbook, `Cartera por Clientes`, false);
        this.addGroupedSheet2(workbook, fill, font, border, this.groupedInfoExcel2(), 2);
        this.svExcel.creacionHoja(workbook, `Cartera por Vendedores`, false);
        this.addGroupedSheet3(workbook, fill, font, border, this.groupedInfoExcel3(), 3);
        this.svExcel.creacionExcel(`Cartera ${moment().format('DD-MM-YYYY')}`, workbook);
        this.cargando = false;
      }, 2000);
    } else this.msj.mensajeAdvertencia(`No hay registros para exportar!`);
  }

  //.Agregar hoja al formato excel.
  addSheet2(workbook, fill, font, border, data: any, pageNumber: number) {
    let page = workbook.worksheets[pageNumber - 1];
    this.addHeaderPage2(page, font, border, fill);
    page.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    this.addInfoExcel2(page, data);
  }

  //.Información de la producción.
  infoProduction2() {
    let info: any = [];
    this.cartera.sort((a, b) => a.id_Vendedor - b.id_Vendedor);
    this.cartera.forEach(d => {
      let plazo1: any = d.saldoPlazo1 == -1 ? '' : d.saldoPlazo1;
      let plazo2: any = d.saldoPlazo2 == -1 ? '' : d.saldoPlazo2;
      let plazo3: any = d.saldoPlazo3 == -1 ? '' : d.saldoPlazo3;
      let plazo4: any = d.saldoPlazo4 == -1 ? '' : d.saldoPlazo4;
      let plazo5: any = d.saldoPlazo5 == -1 ? '' : d.saldoPlazo5;
      info.push([d.id_Cliente, d.nombre_CLiente, d.ciudad_Cliente, d.direccion_Cliente, d.telefono_Cliente, d.plazo_De_Pago, d.num_Factura, d.id_Fecha, d.fecha_Vencimiento, d.cantidad_Dias, plazo1, plazo2, plazo3, plazo4, plazo5, d.id_Vendedor, d.nombre_Vendedor]);
    });
    this.addTotalSheet1(info);
    return info;
  }

  //.Agregar información a la hoja del excel.
  addInfoExcel2(worksheet: any, data: any) {
    let formatNumber: Array<number> = [11, 12, 13, 14, 15];
    let contador: any = 6;
    let row: any = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q'];
    formatNumber.forEach(i => worksheet.getColumn(i).numFmt = '""#,##0.00;[Red]\-""#,##0.00');

    data.forEach(d => {
      worksheet.addRow(d)
      row.forEach(r => {
        worksheet.getCell(`${r}${contador}`).font = { name: 'Calibri', family: 4, size: 10 };
      });
      contador++
    });
    row.forEach(r => worksheet.getCell(`${r}${contador - 1}`).font = { name: 'Calibri', family: 4, size: 11, bold: true, });
  }

  //.Agregar encabezado a la hoja del excel.
  addHeaderPage2(worksheet, font, border, fill) {
    let rowHeader: any = ['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5', 'I5', 'J5', 'K5', 'L5', 'M5', 'N5', 'O5', 'P5', 'Q5']
    worksheet.addRow(['NIT-CC', 'Cliente', 'Ciudad', 'Dirección', 'Teléfono', 'Plazo', 'Factura', 'Fecha', 'Fecha Vencimiento', 'Dias', '1-30 Dias', '31-60 Dias', '61-90 Dias', '91-120 Dias', '+120 Dias', 'Codigo', 'Asesor Comercial']);

    rowHeader.forEach(x => worksheet.getCell(x).fill = fill);
    rowHeader.forEach(x => worksheet.getCell(x).font = font);
    rowHeader.forEach(x => worksheet.getCell(x).border = border);

    let concatCells: any = ['A1:Q3'];
    this.stylesPage2(worksheet, concatCells, []);
  }

  //.Estilos de la hoja del excel.
  stylesPage2(worksheet, concatCells, formatNumber) {
    formatNumber.forEach(i => worksheet.getColumn(i).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    [6, 10, 16].forEach(x => worksheet.getColumn(x).width = 6);
    [1, 8].forEach(x => worksheet.getColumn(x).width = 12);
    [7, 11, 12, 13, 14, 15, 5].forEach(x => worksheet.getColumn(x).width = 20);
    [9, 3].forEach(x => worksheet.getColumn(x).width = 20);
    [4].forEach(x => worksheet.getColumn(x).width = 30);
    [2, 17].forEach(x => worksheet.getColumn(x).width = 45);
    concatCells.forEach(cell => worksheet.mergeCells(cell));
  }

  //Totalizado hoja 1
  addTotalSheet1(info) {
    let data: any = info;
    let count: number = 0;
    let t1: number = 0, t2: number = 0, t3: number = 0, t4: number = 0, t5: number = 0;

    data.forEach(x => {
      let total1 = [null, undefined, '', -1].includes(x[10]) ? t1 += 0 : t1 += x[10];
      let total2 = [null, undefined, '', -1].includes(x[11]) ? t2 += 0 : t2 += x[11];
      let total3 = [null, undefined, '', -1].includes(x[12]) ? t3 += 0 : t3 += x[12];
      let total4 = [null, undefined, '', -1].includes(x[13]) ? t4 += 0 : t4 += x[13];
      let total5 = [null, undefined, '', -1].includes(x[14]) ? t5 += 0 : t5 += x[14];

      if ((data.length - 1) == count) info.push(['', '', '', '', '', '', '', '', '', 'TOTAL', total1, total2, total3, total4, total5, '', '']);
      count++;
    })
  }

  //Hoja 2 Agrupada
  addGroupedSheet2(workbook, fill, font, border, data: any, pageNumber: number) {
    let page = workbook.worksheets[pageNumber - 1];
    this.addGroupedHeader2(page, font, border, fill);
    page.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    this.addGroupedInfoExcel2(page, data);
  }

  //.Agregar encabezado de la hoja 2: .
  addGroupedHeader2(worksheet, font, border, fill) {
    worksheet.addRow([]);
    worksheet.addRow([]);
    let rowHeader: any = ['A4', 'B4', 'C4', 'D4', 'E4',]
    worksheet.addRow(['NIT-CC', 'Razón Social', 'Código', 'Asesor Comercial', 'Subtotal']);

    rowHeader.forEach(x => worksheet.getCell(x).fill = fill);
    rowHeader.forEach(x => worksheet.getCell(x).font = font);
    rowHeader.forEach(x => worksheet.getCell(x).border = border);

    let concatCells: any = ['A1:E3'];
    this.stylesGroupedPage2(worksheet, concatCells, []);
  }

  //.Agregar información a la hoja 2: .
  addGroupedExcel2(worksheet: any, data: any) {
    let formatNumber: Array<number> = [6];
    formatNumber.forEach(i => worksheet.getColumn(i).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    data.forEach(d => worksheet.addRow(d));
  }

  //.Agregar información a la hoja 2: .
  addGroupedInfoExcel2(worksheet: any, data: any) {
    let formatNumber: Array<number> = [5];
    let contador: any = 5;
    let row: any = ['A', 'B', 'C', 'D', 'E',];
    formatNumber.forEach(i => worksheet.getColumn(i).numFmt = '""#,##0.00;[Red]\-""#,##0.00');

    data.forEach(d => {
      worksheet.addRow(d)
      row.forEach(r => {
        worksheet.getCell(`${r}${contador}`).font = { name: 'Calibri', family: 4, size: 10 };
      });
      contador++
    });
    row.forEach(r => worksheet.getCell(`${r}${contador - 1}`).font = { name: 'Calibri', family: 4, size: 11, bold: true, });
  }

  //.Información agrupada de la hoja 2: .
  groupedInfoExcel2() {
    let info: any = [];
    this.carteraAgrupadaClientes.forEach(d => info.push([d.idcliente, d.razoncial, d.idvende, d.nombvende, d.subTotal]));
    this.addTotalSheetClients(info);
    return info;
  }

  //.Estilos de la hoja 2: .
  stylesGroupedPage2(worksheet, concatCells, formatNumber) {
    formatNumber.forEach(i => worksheet.getColumn(i).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    [1, 3, 5].forEach(x => worksheet.getColumn(x).width = 20);
    [2, 4].forEach(x => worksheet.getColumn(x).width = 45);
    concatCells.forEach(cell => worksheet.mergeCells(cell));
  }

  //.Totales de la hoja 2: .
  addTotalSheetClients(info) {
    let data: any = info;
    let count: number = 0;
    let total: number = 0;

    data.forEach(x => {
      total += x[4];
      if ((data.length - 1) == count) info.push(['', '', '', 'TOTAL', total]);
      count++;
    })
  }

  //Hoja 3 Agrupada
  addGroupedSheet3(workbook, fill, font, border, data: any, pageNumber: number) {
    let page = workbook.worksheets[pageNumber - 1];
    this.addGroupedHeader3(page, font, border, fill);
    page.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    this.addGroupedInfoExcel3(page, data);
  }

  //.Agregar encabezado de la hoja 3.
  addGroupedHeader3(worksheet, font, border, fill) {
    worksheet.addRow([]);
    worksheet.addRow([]);
    let rowHeader: any = ['A4', 'B4', 'C4',]
    worksheet.addRow(['Codigo', 'Asesor Comercial', 'Total']);

    rowHeader.forEach(x => worksheet.getCell(x).fill = fill);
    rowHeader.forEach(x => worksheet.getCell(x).font = font);
    rowHeader.forEach(x => worksheet.getCell(x).border = border);

    let concatCells: any = ['A1:C3'];
    this.stylesGroupedPage3(worksheet, concatCells, []);
  }

  //.Agregar información a la hoja 3.
  addGroupedExcel3(worksheet: any, data: any) {
    let formatNumber: Array<number> = [3];
    formatNumber.forEach(i => worksheet.getColumn(i).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    data.forEach(d => worksheet.addRow(d));
  }

  //.Agregar información a la hoja 3.
  addGroupedInfoExcel3(worksheet: any, data: any) {
    let formatNumber: Array<number> = [3];
    let contador: any = 5;
    let row: any = ['A', 'B', 'C',];
    formatNumber.forEach(i => worksheet.getColumn(i).numFmt = '""#,##0.00;[Red]\-""#,##0.00');

    data.forEach(d => {
      worksheet.addRow(d)
      row.forEach(r => {
        worksheet.getCell(`${r}${contador}`).font = { name: 'Calibri', family: 4, size: 10 };
      });
      contador++
    });
    row.forEach(r => worksheet.getCell(`${r}${contador - 1}`).font = { name: 'Calibri', family: 4, size: 11, bold: true, });
  }

  //.Información agrupada de la hoja 3.
  groupedInfoExcel3() {
    let info: any = [];
    this.carteraAgrupadaVendedores.forEach(d => info.push([d.idvende, d.nombvende, d.subTotal]));
    this.addTotalSheetSales(info);
    return info;
  }

  //.Estilos de la hoja 3.
  stylesGroupedPage3(worksheet, concatCells, formatNumber) {
    formatNumber.forEach(i => worksheet.getColumn(i).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    [1, 3].forEach(x => worksheet.getColumn(x).width = 20);
    [2].forEach(x => worksheet.getColumn(x).width = 45);
    concatCells.forEach(cell => worksheet.mergeCells(cell));
  }

  //Totalizado hoja 3
  addTotalSheetSales(info) {
    let data: any = info;
    let count: number = 0;
    let total: number = 0;

    data.forEach(x => {
      total += x[2];
      if ((data.length - 1) == count) info.push(['', 'TOTAL', total]);
      count++;
    });
  }
}


