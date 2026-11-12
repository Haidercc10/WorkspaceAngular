import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { ZeusContabilidadService } from 'src/app/Servicios/Zeus_Contabilidad/zeusContabilidad.service';
import { AppComponent } from 'src/app/app.component';
import { TutorialesService } from 'src/app/Servicios/Tutoriales/Tutoriales.service';
import { pasosTutorialRecaudos } from 'src/app/Tutoriales/Tutoriales_Recaudos';
import { PaginaPrincipalComponent } from '../PaginaPrincipal/PaginaPrincipal.component';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { ReportesConsolidadosComponent } from '../Reportes-Consolidados/Reportes-Consolidados.component';
import { OrdenFacturacionService } from 'src/app/Servicios/OrdenFacturacion/OrdenFacturacion.service';
import { Orden_FacturacionComponent } from '../Orden_Facturacion/Orden_Facturacion.component';
import { Devolucion_OrdenFacturacionComponent } from '../Devolucion_OrdenFacturacion/Devolucion_OrdenFacturacion.component';
import { CreacionExcelService } from 'src/app/Servicios/CreacionExcel/CreacionExcel.service';
import { finalize, forkJoin, Subscription } from 'rxjs';
import { alCambiarTema } from 'src/app/Servicios/Tema/Tema.service';

@Component({
  selector: 'app-DashBoard-Recaudos',
  templateUrl: './DashBoard-Recaudos.component.html',
  styleUrls: ['./DashBoard-Recaudos.component.css']
})

export class DashBoardRecaudosComponent implements OnInit, OnDestroy {

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
  private readonly suscripcionTema = alCambiarTema(oscuro => this.modoSeleccionado = oscuro); // mantiene modoSeleccionado al día con el tema
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
  totalCarteraValor: number = 0; //Total de la cartera, se calcula una sola vez cuando llegan los datos (en lugar de recalcularlo en cada ciclo de la vista)
  totalCarteraCorto: string = '$ 0'; //Total de la cartera abreviado en millones (ej: $ 12.812 M)
  resumenCartera: any = null; //Detalle de la cartera para el panel de información (antigüedad, vencida, mayor deudor)
  cargandoResumen: boolean = false; //Indica si la cartera se está consultando, para mostrar "Cargando..." en el panel de detalle
  private readonly formatoCO = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }); //Formato colombiano: punto como separador de miles
  //Tramos de antigüedad de la cartera (campos que ya calcula el backend por factura), con colores en escala de urgencia
  readonly tramosCartera = [
    { campo: 'saldoPlazo1', etiqueta: '1-30 días', color: '#22c55e' },
    { campo: 'saldoPlazo2', etiqueta: '31-60 días', color: '#eab308' },
    { campo: 'saldoPlazo3', etiqueta: '61-90 días', color: '#f97316' },
    { campo: 'saldoPlazo4', etiqueta: '91-120 días', color: '#ef4444' },
    { campo: 'saldoPlazo5', etiqueta: '+120 días', color: '#991b1b' },
  ];
  private subCartera: Subscription | undefined; //Consulta de cartera en curso, se cancela si se lanza una nueva
  private subClientesVacios: Subscription | undefined; //Escucha el filtro de clientes para dejarlo en null cuando queda vacío

  constructor(private AppComponent: AppComponent,
    private zeusService: ZeusContabilidadService,
    private tutoriales: TutorialesService,
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
    this.tiempoExcedido2();
    this.limpiarClientesVacios();
  }

  ngOnDestroy(): void {
    this.subCartera?.unsubscribe();
    this.subClientesVacios?.unsubscribe();
    this.tutoriales.cancelar(); //Si se cambia de pestaña con el tutorial abierto, no queda encima de otra
  }

  // Función que iniciará el tutorial (pasos en src/app/Tutoriales/Tutoriales_Recaudos.ts)
  tutorial = () => this.tutoriales.iniciar(pasosTutorialRecaudos({
    veFiltroVendedor: [1, 69, 103].includes(this.ValidarRol),
  }));

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

  // PrimeNG 16 marca el p-multiSelect como "lleno" aunque su valor sea un arreglo vacío ([] != null), dejando la etiqueta flotante arriba.
  // Al deseleccionar todos los clientes (uno a uno o con "seleccionar todos") se deja el valor en null para que la etiqueta vuelva a su posición.
  // Se usa valueChanges porque "seleccionar todos" no emite el evento onChange del componente.
  // El cambio a null se difiere (setTimeout) porque PrimeNG, en updateModel, vuelve a asignar [] a su modelo interno
  // justo después de notificar al formulario; si se hiciera de inmediato, PrimeNG lo sobrescribiría.
  limpiarClientesVacios() {
    this.subClientesVacios = this.FormFiltros.get('Cliente')?.valueChanges.subscribe(valor => {
      if (Array.isArray(valor) && valor.length === 0) {
        setTimeout(() => {
          const control = this.FormFiltros.get('Cliente');
          if (Array.isArray(control?.value) && control.value.length === 0) control.setValue(null);
        });
      }
    });
  }

  //Copia de tiempoExcedido que usa la consulta optimizada de la cartera.
  //No valida paginaPrincial.recaudos / reportesConsolidadosComponent.cartera porque este componente solo se crea cuando su pestaña
  //está activa (*ngIf="recaudos" en Inicio y *ngIf="cartera" en Reportes Consolidados), y esas referencias inyectadas
  //son instancias distintas a las que están en pantalla.
  tiempoExcedido2() {
    this.consultarCarteraOptimizada();
  }

  // Copia de consultarCartera que usa los endpoints optimizados (getCarteraTotal2, getCarteraAgrupadaClientes2 y getCarteraAgrupadaVendedores2),
  // lanza las 3 peticiones en paralelo, calcula el total una sola vez y cancela una consulta anterior que siga en curso.
  consultarCarteraOptimizada() {
    this.cargando = true;
    let ruta: string = "";
    let cliente: any = this.FormFiltros.value.Cliente == null ? [] : this.FormFiltros.value.Cliente;
    let vendedor: string = this.FormFiltros.value.Vendedor;
    let carteraOriginal: boolean = this.FormFiltros.value.CarteraOriginal;

    if (this.ValidarRol == 2) vendedor = `${this.storage_Nombre}`;
    this.carteraAgrupadaClientes = [];
    this.carteraAgrupadaVendedores = [];
    this.cartera = [];
    this.totalCarteraValor = 0;
    this.totalCarteraCorto = '$ 0';
    this.resumenCartera = null;
    this.cargandoResumen = true;

    if (vendedor != null) ruta += `vendedor=${encodeURIComponent(vendedor)}`;
    if (ruta.length > 0) ruta = `?${ruta}`;

    this.subCartera?.unsubscribe();
    this.subCartera = forkJoin({
      clientes: this.zeusService.GetCarteraAgrupadaClientes2(cliente, ruta),
      vendedores: this.zeusService.GetCarteraAgrupadaVendedores2(ruta),
      total: this.zeusService.GetCarteraTotal2(cliente, ruta),
    }).pipe(finalize(() => {
      this.cargando = false;
      this.cargandoResumen = false;
    })).subscribe({
      next: (resp) => {
        this.carteraAgrupadaClientes = resp.clientes;
        this.carteraAgrupadaVendedores = resp.vendedores;
        this.cartera = resp.total.filter(x => x.saldo_Cartera > 0 && (!carteraOriginal || x.cantidad_Dias < 1000));
        this.totalCarteraValor = this.cartera.reduce((acc, item) => acc + item.saldo_Cartera, 0);
        this.calcularResumenCartera(carteraOriginal);
      },
      error: (error) => this.msj.mensajeError("Error al intentar consultar la cartera total", error?.error?.title ?? ''),
    });
  }

  // Función que abrevia un valor en millones con formato colombiano (ej: 12812174110.99 -> "$ 12.812 M")
  formatoMillones(valor: number): string {
    return Math.abs(valor) >= 1_000_000 ? `$ ${this.formatoCO.format(valor / 1_000_000)} M` : `$ ${this.formatoCO.format(valor)}`;
  }

  // Función que indica si una factura está vencida: usa la fecha de vencimiento y, si no se puede interpretar,
  // compara los días transcurridos contra el plazo de pago del cliente
  private facturaVencida(factura: any, hoy: moment.Moment): boolean {
    const formatos = ['YYYY-MM-DD', 'YYYY/MM/DD', 'YYYYMMDD', 'DD/MM/YYYY', 'YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DDTHH:mm:ss'];
    const vencimiento = moment(factura.fecha_Vencimiento, formatos, true);
    if (vencimiento.isValid()) return vencimiento.isBefore(hoy);
    return factura.cantidad_Dias > (factura.plazo_De_Pago ?? 0);
  }

  // Función que calcula, en una sola pasada, el resumen que se muestra en el panel de detalle de la cartera
  calcularResumenCartera(carteraOriginal: boolean) {
    const total = this.totalCarteraValor;
    const hoy = moment().startOf('day');
    const porcentaje = (valor: number) => total > 0 ? valor / total * 100 : 0;

    const valoresTramos = this.tramosCartera.map(() => 0);
    const saldoPorCliente = new Map<string, { nombre: string, valor: number }>();
    let vencida = 0;

    this.cartera.forEach(factura => {
      this.tramosCartera.forEach((tramo, i) => {
        if (factura[tramo.campo] > 0) valoresTramos[i] += factura[tramo.campo];
      });
      if (this.facturaVencida(factura, hoy)) vencida += factura.saldo_Cartera;
      const cliente = saldoPorCliente.get(factura.id_Cliente) ?? { nombre: factura.nombre_CLiente, valor: 0 };
      cliente.valor += factura.saldo_Cartera;
      saldoPorCliente.set(factura.id_Cliente, cliente);
    });

    let mayorDeudor: { nombre: string, valor: number } | null = null;
    for (const cliente of saldoPorCliente.values()) {
      if (!mayorDeudor || cliente.valor > mayorDeudor.valor) mayorDeudor = cliente;
    }

    this.totalCarteraCorto = this.formatoMillones(total);
    this.resumenCartera = {
      facturas: this.formatoCO.format(this.cartera.length),
      clientes: this.formatoCO.format(saldoPorCliente.size),
      carteraOriginal,
      tramos: this.tramosCartera.map((tramo, i) => ({
        ...tramo,
        valorCorto: this.formatoMillones(valoresTramos[i]),
        porcentaje: porcentaje(valoresTramos[i]),
      })),
      vencidaCorto: this.formatoMillones(vencida),
      porcentajeVencida: porcentaje(vencida),
      mayorDeudor: mayorDeudor ? { nombre: mayorDeudor.nombre, valorCorto: this.formatoMillones(mayorDeudor.valor) } : null,
    };
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

  //* ==================== PDF OPTIMIZADO ====================
  // Copias de generarPDF, seleccionarInformacionPDf, contenidoPDF, obtenerVendedoresCartera, clientesVendedorPdf,
  // facturasClientes y datosFacturasPdf. Generan el mismo PDF, pero agrupan las facturas una sola vez (Map)
  // en lugar de filtrar el arreglo completo por cada vendedor / cliente, y calculan cada total una sola vez.

  // Copia de generarPDF que usa la generación optimizada
  generarPDF2() {
    if (this.cartera.length > 0) {
      this.cargando = true;
      let informacionPDF = this.seleccionarInformacionPDf2();
      let titulo: string = "Cartera Plasticaribe";
      let content: any[] = this.contenidoPDF2(informacionPDF);
      this.creacionPDFService.formatoPDF(titulo, content);
      setTimeout(() => this.cargando = false, 3000);
    } else {
      this.msj.mensajeAdvertencia("No hay datos para generar el PDF");
      this.cargando = false;
    }
  }

  // Copia de seleccionarInformacionPDf sin console.log y con búsqueda de clientes por Set
  seleccionarInformacionPDf2(): any[] {
    const { CarteraOriginal, Vendedor, Cliente } = this.FormFiltros.value;
    let informacion: any[] = this.cartera;
    if (CarteraOriginal) informacion = informacion.filter(x => x.cantidad_Dias < 1000);
    if (Vendedor) informacion = informacion.filter(x => x.nombre_Vendedor == Vendedor);
    if (Cliente) {
      const clientes = new Set(Cliente);
      informacion = informacion.filter(x => clientes.has(x.id_Cliente));
    }
    return informacion;
  }

  // Función que agrupa un arreglo por la llave indicada, en una sola pasada
  private agruparPor(datos: any[], llave: (x: any) => any): Map<any, any[]> {
    const grupos = new Map<any, any[]>();
    datos.forEach(x => {
      const k = llave(x);
      const grupo = grupos.get(k);
      if (grupo) grupo.push(x);
      else grupos.set(k, [x]);
    });
    return grupos;
  }

  // Copia de contenidoPDF: agrupa por vendedor y por cliente una sola vez
  contenidoPDF2(informacionPDF: any[]) {
    let data: any[] = [];
    const facturasPorVendedor = this.agruparPor(informacionPDF, x => x.id_Vendedor);
    const facturasPorCliente = this.agruparPor(informacionPDF, x => x.id_Cliente);
    let vendedores: any[] = this.obtenerVendedoresCartera2(informacionPDF);
    vendedores.forEach(vendedor => {
      data.push([
        {
          margin: [5, 0, 5, 5],
          text: `${vendedor.id} - ${vendedor.nombre}`,
          bold: true,
          fontSize: 11,
          alignment: 'left'
        },
        this.clientesVendedorPdf2(facturasPorVendedor.get(vendedor.id) ?? [], facturasPorCliente),
      ]);
    });
    data.push(this.totalCarteraPdf(informacionPDF));
    return data;
  }

  // Copia de obtenerVendedoresCartera: usa un Map por nombre en vez de map + includes por cada factura
  obtenerVendedoresCartera2(informacionPDF: any[]) {
    const vendedores = new Map<string, any>();
    informacionPDF.forEach(factura => {
      if (!vendedores.has(factura.nombre_Vendedor)) vendedores.set(factura.nombre_Vendedor, { id: factura.id_Vendedor, nombre: factura.nombre_Vendedor });
    });
    return [...vendedores.values()].sort((a, b) => a.id - b.id);
  }

  // Copia de clientesVendedorPdf: recibe las facturas del vendedor y las facturas agrupadas por cliente
  clientesVendedorPdf2(facturasVendedor: any[], facturasPorCliente: Map<any, any[]>) {
    let clientes: any[] = [...facturasVendedor].sort((a, b) => (a.nombre_CLiente ?? '').localeCompare(b.nombre_CLiente ?? ''));
    const clientesIncluidos = new Set<any>();
    let data: any[] = [];
    clientes.forEach(cliente => {
      if (clientesIncluidos.has(cliente.id_Cliente)) return;
      clientesIncluidos.add(cliente.id_Cliente);
      data.push({
        margin: [5, 0, 5, 5],
        table: {
          headerRows: 1,
          widths: ['10%', '35%', '12%', '20%', '11%', '12%'],
          body: this.facturasClientes2(cliente, facturasPorCliente.get(cliente.id_Cliente) ?? [])
        }
      });
    });
    return data;
  }

  // Copia de facturasClientes: recibe directamente las facturas del cliente
  facturasClientes2(cliente: any, facturasCliente: any[]) {
    let facturas: any[] = [...facturasCliente].sort((a, b) => (a.id_Fecha ?? '').localeCompare(b.id_Fecha ?? ''));
    let data: any[] = [];
    data.push(this.informacionClientePDF(cliente));
    data.push([
      {
        colSpan: 6,
        border: [true, false, true, true],
        table: {
          fontSize: 7,
          headerRows: 1,
          dontBreakRows: true,
          widths: ['11%', '11%', '11%', '5%', '12%', '12%', '12%', '14%', '12%',],
          body: this.datosFacturasPdf2(facturas)
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

  // Copia de datosFacturasPdf: calcula los 5 totales una sola vez (antes se recalculaba cada total 2 o 3 veces)
  datosFacturasPdf2(facturas: any[]) {
    const plazos = ['saldoPlazo1', 'saldoPlazo2', 'saldoPlazo3', 'saldoPlazo4', 'saldoPlazo5'];
    const valorPlazo = (valor: number) => valor == -1 ? '' : this.formatonumeros(valor.toFixed(2));
    const celda = (text: string, alignment: string) => ({ border: [false, false, false, false], fontSize: 7, alignment, text });

    let data: any[] = [];
    data.push(this.titulosFacturasPdf());
    facturas.forEach(f => {
      data.push([
        celda(`${f.num_Factura}`, 'center'),
        celda(`${f.id_Fecha}`, 'center'),
        celda(`${f.fecha_Vencimiento}`, 'center'),
        celda(`${f.cantidad_Dias}`, 'center'),
        ...plazos.map(p => celda(`${valorPlazo(f[p])}`, 'right')),
      ]);
    });

    const totales = plazos.map(p => facturas.reduce((a, b) => a + b[p], 0));
    data.push([
      celda(``, 'center'),
      celda(``, 'center'),
      celda(``, 'center'),
      celda(``, 'center'),
      ...totales.map(total => ({
        border: [false, false, false, total > 0],
        bold: true,
        fontSize: 8,
        alignment: 'right',
        text: `${total <= 0 ? '' : this.formatonumeros(total.toFixed(2))}`
      })),
    ]);
    return data;
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
        this.addSheet2(workbook, fill, font, border, this.seleccionarInformacionPDf(), 1);
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
    page.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    this.stylesGroupedDetailedPage(page, ['A1:I3'], []);
    this.addGroupedDetailedInfoExcel2(page, data, fill, font, border);
  }

  stylesGroupedDetailedPage(worksheet: any, concatCells: any[], formatNumber: number[]) {
    formatNumber.forEach(i => worksheet.getColumn(i).numFmt = '""#,##0.00;[Red]\\-""#,##0.00');
    [1, 2, 3].forEach(x => worksheet.getColumn(x).width = 18);
    worksheet.getColumn(4).width = 30;
    worksheet.getColumn(5).width = 16;
    worksheet.getColumn(6).width = 16;
    [7, 8, 9].forEach(x => worksheet.getColumn(x).width = 16);
    concatCells.forEach(cell => worksheet.mergeCells(cell));
  }

  // Agrega la hoja detallada con la misma jerarquía del PDF: asesor, cliente y facturas.
  addGroupedDetailedInfoExcel2(worksheet: any, data: any[], fill: any, font: any, border: any) {
    const invoiceHeaders = ['Factura', 'Fecha', 'Fecha Vencimiento', 'Dias', '1-30 Dias', '31-60 Dias', '61-90 Dias', '91-120 Dias', '+120 Dias'];
    const rows = [...data].sort((a, b) => {
      const advisor = Number(a.id_Vendedor) - Number(b.id_Vendedor);
      if (advisor !== 0) return advisor;
      const client = String(a.nombre_CLiente ?? '').localeCompare(String(b.nombre_CLiente ?? ''));
      if (client !== 0) return client;
      return String(a.id_Fecha ?? '').localeCompare(String(b.id_Fecha ?? ''));
    });
    const numberFormat = '""#,##0.00;[Red]\\-""#,##0.00';

    let totalPlazos = [0, 0, 0, 0, 0];
    let index = 0;
    while (index < rows.length) {
      const advisorId = rows[index].id_Vendedor;
      const advisorName = rows[index].nombre_Vendedor;
      const advisorRow = worksheet.addRow([`${advisorId} - ${advisorName}`]);
      worksheet.mergeCells(`A${advisorRow.number}:I${advisorRow.number}`);
      advisorRow.getCell(1).font = { ...font, size: 11, bold: true };
      advisorRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

      while (index < rows.length && rows[index].id_Vendedor == advisorId) {
        const clientId = rows[index].id_Cliente;
        const clientInvoices: any[] = [];
        while (index < rows.length && rows[index].id_Vendedor == advisorId && rows[index].id_Cliente == clientId) {
          clientInvoices.push(rows[index]);
          index++;
        }

        const client = clientInvoices[0];
        const clientRow = worksheet.addRow([
          client.id_Cliente, client.nombre_CLiente, client.ciudad_Cliente,
          client.direccion_Cliente, client.telefono_Cliente,
          `Plazo: ${client.plazo_De_Pago} Días`,'','',''
        ]);
        this.formatExcelRow(clientRow, 9, border, fill, { size: 9, bold: true });

        const headerRow = worksheet.addRow(invoiceHeaders);
        this.formatExcelRow(headerRow, 9, border, fill, font);

        const clientTotals: number[] = [0, 0, 0, 0, 0];
        clientInvoices.forEach(invoice => {
          const amounts = [invoice.saldoPlazo1, invoice.saldoPlazo2, invoice.saldoPlazo3, invoice.saldoPlazo4, invoice.saldoPlazo5]
            .map(value => value == -1 ? '' : value);
          const invoiceRow = worksheet.addRow([invoice.num_Factura, invoice.id_Fecha,
            invoice.fecha_Vencimiento, invoice.cantidad_Dias, ...amounts]);
          this.formatExcelRow(invoiceRow, 9, border, null, { name: 'Calibri', family: 4, size: 10 });
          invoiceRow.getCell(4).alignment = { horizontal: 'left', vertical: 'middle' };
          amounts.forEach((_, amountIndex) => invoiceRow.getCell(amountIndex + 5).numFmt = numberFormat);
          amounts.forEach((value, amountIndex) => {
            if (typeof value === 'number') {
              clientTotals[amountIndex] += value;
              totalPlazos[amountIndex] += value;
            }
          });
        });

        const subtotalRow = worksheet.addRow(['Total', '', '', '', ...clientTotals]);
        this.formatExcelRow(subtotalRow, 9, border, null, { name: 'Calibri', family: 4, size: 10, bold: true });
        clientTotals.forEach((_, amountIndex) => subtotalRow.getCell(amountIndex + 5).numFmt = numberFormat);

        const clientTotal = clientTotals.reduce((total, amount) => total + amount, 0);
        const clientTotalRow = worksheet.addRow(['Total Cliente:', clientTotal]);
        this.formatExcelRow(clientTotalRow, 9, border, null, { name: 'Calibri', family: 4, size: 10, bold: true });
        worksheet.mergeCells(`B${clientTotalRow.number}:I${clientTotalRow.number}`);
        clientTotalRow.getCell(2).numFmt = numberFormat;
        clientTotalRow.getCell(2).alignment = { horizontal: 'right', vertical: 'middle' };
        worksheet.addRow([]);
      }
    }

    const totalRow = worksheet.addRow(['TOTAL:', '', '', '', ...totalPlazos]);
    this.formatExcelRow(totalRow, 9, border, fill, { name: 'Calibri', family: 4, size: 11, bold: true });
    worksheet.mergeCells(`A${totalRow.number}:D${totalRow.number}`);
    totalRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
    totalPlazos.forEach((_, amountIndex) => {
      totalRow.getCell(amountIndex + 5).numFmt = numberFormat;
      totalRow.getCell(amountIndex + 5).alignment = { horizontal: 'right', vertical: 'middle' };
    });

    const totalCartera = totalPlazos.reduce((total, amount) => total + amount, 0);
    const totalCarteraRow = worksheet.addRow(['TOTAL CARTERA:', '','','',totalCartera,'','','','']);
    this.formatExcelRow(totalCarteraRow, 9, border, fill, { name: 'Calibri', family: 4, size: 11, bold: true });
    worksheet.mergeCells(`A${totalCarteraRow.number}:D${totalCarteraRow.number}`);
    worksheet.mergeCells(`E${totalCarteraRow.number}:I${totalCarteraRow.number}`);
    totalCarteraRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
    totalCarteraRow.getCell(5).numFmt = numberFormat;
    totalCarteraRow.getCell(5).alignment = { horizontal: 'right', vertical: 'middle' };
  }

  formatExcelRow(row: any, columns: number, border: any, fill: any, font: any) {
    for (let column = 1; column <= columns; column++) {
      const cell = row.getCell(column);
      cell.border = border;
      cell.font = font;
      if (fill) cell.fill = fill;
    }
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


