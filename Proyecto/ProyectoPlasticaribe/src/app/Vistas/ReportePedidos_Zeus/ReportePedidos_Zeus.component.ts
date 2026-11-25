import { Component, DestroyRef, Input, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import moment from 'moment';
import { MenuItem } from 'primeng/api';
import { Table } from 'primeng/table';
import { Subject, debounceTime, finalize, forkJoin, of, shareReplay, catchError, map, Observable } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { CreacionExcelService } from 'src/app/Servicios/CreacionExcel/CreacionExcel.service';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { DepartamentosMunicipiosColombiaService, MunicipioColombia } from 'src/app/Servicios/DepartamentosMunicipiosColombia/DepartamentosMunicipiosColombia.service';
import { EstadosProcesos_OTService } from 'src/app/Servicios/EstadosProcesosOT/EstadosProcesos_OT.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { alCambiarTema } from 'src/app/Servicios/Tema/Tema.service';
import { COLOR_REJILLA_GRAFICA, colorSerieGrafica, colorTextoGrafica } from 'src/app/Servicios/Tema/Paleta';
import { TutorialesService } from 'src/app/Servicios/Tutoriales/Tutoriales.service';
import { pasosTutorialPedidosZeus } from 'src/app/Tutoriales/Tutoriales_PedidosZeus';
import { Reporte_Procesos_OTComponent } from '../Reporte_Procesos_OT/Reporte_Procesos_OT.component';
import {
  DIAS_PROXIMOS, ESTADOS_OT, IndicadoresPedidos, OtDePedido, PedidoZeusLinea, ResumenPedido, Semaforo,
  agruparPorConsecutivo, calcularIndicadores, calcularSemaforo, ciudadLegible, mapearLinea, normalizar, normalizarMunicipio, parsearCiudad,
  procesoActualOt, resumirPedidos, sumarPor, textoBusqueda,
} from './ReportePedidos_Zeus.modelo';

/** Columna de la tabla de detalle. */
interface ColumnaPedido {
  field: keyof PedidoZeusLinea | 'ciudadLegible';
  header: string;
  tipo: 'texto' | 'numero' | 'moneda' | 'estado' | 'ot' | 'proceso' | 'producto' | 'entrega';
  defecto: boolean;
}

/** Chip de un filtro activo (se quita con la ×). */
interface ChipFiltro {
  etiqueta: string;
  quitar: () => void;
}

/** Pedidos (grupos) que se muestran por página de la tabla. */
const OPCIONES_POR_PAGINA = [10, 25, 50, 100];

/** Filtros que se activan al hacer clic en una tarjeta de indicadores. */
type FiltroKpi = 'facturable' | 'vencido' | 'proximos' | 'programados' | 'sinOt' | null;

/** Fila del consolidado de asesores. */
interface ConsolidadoAsesor {
  codigo: string;
  vendedor: string;
  factMesAnterior: number | null;
  factMesActual: number | null;
  pendienteVencido: number;
  pendienteMes: number;
  pendienteFuturo: number;
  pendienteTotal: number;
  proyectado: number | null;
}

const CLAVE_COLUMNAS = 'pedidos-zeus-columnas-v1';

@Component({
  selector: 'app-ReportePedidos_Zeus',
  templateUrl: './ReportePedidos_Zeus.component.html',
  styleUrls: ['./ReportePedidos_Zeus.component.css']
})
export class ReportePedidos_ZeusComponent implements OnInit, OnDestroy {

  @ViewChild(Reporte_Procesos_OTComponent) modalEstadosProcesos_OT: Reporte_Procesos_OTComponent;
  @ViewChild('dtAsesor') dtAsesor?: Table;
  /** true cuando la vista se muestra dentro de Reportes Consolidados (sin título propio). */
  @Input() reporteConsolidado: boolean = false;

  private readonly destroyRef = inject(DestroyRef);
  private readonly busqueda$ = new Subject<string>();

  // ---------- Estado general ----------
  cargando: boolean = false;            // spinner global (exportaciones)
  cargandoTabla: boolean = true;        // primera carga de pedidos
  cargandoOts: boolean = false;         // las OT llegan después de la tabla
  errorCarga: boolean = false;
  ultimaActualizacion: Date | null = null;
  storage_Id: number;
  storage_Nombre: any;
  ValidarRol: number;
  modoSeleccionado: boolean;
  private readonly temaActual = alCambiarTema(oscuro => {
    this.modoSeleccionado = oscuro;
    if (this.mostrarAnalisis) this.armarGraficas();
  });

  // ---------- Datos ----------
  lineas: PedidoZeusLinea[] = [];
  lineasFiltradas: PedidoZeusLinea[] = [];
  resumenes = new Map<string, ResumenPedido>();
  indicadores: IndicadoresPedidos = calcularIndicadores([]);
  expandedRows: { [consecutivo: string]: boolean } = {};
  readonly estadosOt = ESTADOS_OT;
  readonly diasProximos = DIAS_PROXIMOS;

  // ---------- Filtros ----------
  busqueda: string = '';
  departamentosSel: string[] = [];
  municipiosSel: string[] = [];
  clientesSel: string[] = [];
  vendedorSel: string | null = null;
  rangoEntrega: Date[] | null = null;
  mesesCreacionSel: string[] = [];      // 'YYYY-MM'
  mesesEntregaSel: string[] = [];       // 'YYYY-MM'
  estadosSel: string[] = [];
  semaforosSel: Semaforo[] = [];
  filtroKpi: FiltroKpi = null;
  ordenarPor: 'semaforo' | 'entrega' | 'valor' | 'cliente' | 'pedido' = 'semaforo';

  opcionesDepartamentos: { label: string; value: string }[] = [];
  opcionesMunicipios: { label: string; value: string; departamento: string }[] = [];
  opcionesClientes: { label: string; value: string }[] = [];
  opcionesVendedores: { label: string; value: string }[] = [];
  opcionesMesesCreacion: { label: string; value: string }[] = [];
  opcionesMesesEntrega: { label: string; value: string }[] = [];
  filtrosActivos: ChipFiltro[] = [];
  readonly opcionesEstado = [
    { label: 'Pendiente', value: 'Pendiente' },
    { label: 'Parcialmente satisfecho', value: 'Parcialmente Satisfecho' },
  ];
  readonly opcionesSemaforo: { label: string; value: Semaforo; tooltip: string }[] = [
    { label: 'Completo', value: 'completo', tooltip: 'Todos los ítems del pedido tienen stock suficiente: se puede facturar completo' },
    { label: 'Parcial', value: 'parcial', tooltip: 'Al menos un ítem del pedido tiene stock suficiente' },
    { label: 'Sin stock', value: 'sinStock', tooltip: 'Ningún ítem del pedido tiene stock suficiente' },
  ];
  readonly opcionesOrden = [
    { label: 'Semáforo', value: 'semaforo' },
    { label: 'Fecha de entrega', value: 'entrega' },
    { label: 'Valor pendiente', value: 'valor' },
    { label: 'Cliente', value: 'cliente' },
    { label: 'N° de pedido', value: 'pedido' },
  ];
  private municipiosDane: MunicipioColombia[] = [];

  // ---------- Tabla ----------
  readonly columnas: ColumnaPedido[] = [
    { field: 'id_Producto', header: 'Ítem', tipo: 'texto', defecto: true },
    { field: 'producto', header: 'Producto', tipo: 'producto', defecto: true },
    { field: 'cant_Pendiente', header: 'Pendiente', tipo: 'numero', defecto: true },
    { field: 'existencias', header: 'Stock', tipo: 'numero', defecto: true },
    { field: 'presentacion', header: 'Und', tipo: 'texto', defecto: true },
    { field: 'precioUnidad', header: 'Precio U.', tipo: 'moneda', defecto: true },
    { field: 'costo_Cant_Pendiente', header: 'Total pendiente', tipo: 'moneda', defecto: true },
    { field: 'estado', header: 'Estado', tipo: 'estado', defecto: true },
    { field: 'OT', header: 'OT', tipo: 'ot', defecto: true },
    { field: 'Proceso_OT', header: 'Proceso actual', tipo: 'proceso', defecto: true },
    { field: 'ciudadLegible', header: 'Ciudad', tipo: 'texto', defecto: false },
    { field: 'cant_Pedida', header: 'Cant. pedida', tipo: 'numero', defecto: false },
    { field: 'cant_Facturada', header: 'Facturada', tipo: 'numero', defecto: false },
    { field: 'vendedor', header: 'Vendedor', tipo: 'texto', defecto: false },
    { field: 'orden_Compra_CLiente', header: 'OC cliente', tipo: 'texto', defecto: false },
    { field: 'fecha_Creacion', header: 'Fecha creación', tipo: 'texto', defecto: false },
    { field: 'fecha_Entrega', header: 'Fecha entrega', tipo: 'entrega', defecto: false },
    { field: 'costo_Cant_Total', header: 'Total', tipo: 'moneda', defecto: false },
  ];
  columnasSeleccionadas: ColumnaPedido[] = [];
  // Paginación por pedidos: un pedido nunca queda partido entre dos páginas
  readonly opcionesPorPagina = OPCIONES_POR_PAGINA.map(n => ({ label: `${n} pedidos`, value: n }));
  pedidosPorPagina: number = 25;
  paginas: PedidoZeusLinea[][] = [];
  pagina: number = 0;
  lineasPagina: PedidoZeusLinea[] = [];
  /** Página (base 0) donde empiezan los pedidos sin stock; null si no aplica. */
  paginaSinStock: number | null = null;
  lineaDetalle: PedidoZeusLinea | null = null;
  detalleVisible: boolean = false;
  modalEstadosOrdenes: boolean = false;
  consecutivoPedido: string = '';

  // ---------- Exportar ----------
  menuExportar: MenuItem[] = [
    { label: 'PDF consolidado', icon: 'pi pi-file-pdf', command: () => this.pdfConsolidado() },
    { label: 'Excel detallado', icon: 'pi pi-file-excel', command: () => this.exportarExcel() },
    { label: 'Excel planeación de OT', icon: 'pi pi-file-excel', command: () => this.exportarExcelPlaneacion() },
  ];

  // ---------- Análisis (gráficas) ----------
  mostrarAnalisis: boolean = false;
  graficaMeses: any;
  graficaClientes: any;
  graficaVendedores: any;
  opcionesGraficaMeses: any;
  opcionesGraficaBarras: any;

  // ---------- Consolidado de asesores ----------
  modalConsolidado: boolean = false;
  cargandoConsolidado: boolean = false;
  consolidadoAsesores: ConsolidadoAsesor[] = [];
  totalesConsolidado: ConsolidadoAsesor | null = null;
  readonly nombreMesActual = this.nombreMes(moment());
  readonly nombreMesAnterior = this.nombreMes(moment().subtract(1, 'month'));
  private facturacion$?: Observable<{ anterior: Map<string, number>; actual: Map<string, number> } | null>;
  /** El modal del consolidado desliza de la lista de asesores a los pedidos del asesor elegido. */
  panelConsolidado: 'asesores' | 'pedidos' = 'asesores';
  codigoAsesorSeleccionado: string = '';
  filtroAsesor: string = '';
  asesorSeleccionado: string = '';
  pedidosAsesor: PedidoZeusLinea[] = [];
  totalesClienteAsesor = new Map<string, number>();
  totalAsesor: number = 0;

  constructor(private AppComponent: AppComponent,
    private inventarioZeusService: InventarioZeusService,
    private estadosProcesos_OTService: EstadosProcesos_OTService,
    private msj: MensajesAplicacionService,
    private svMunicipios: DepartamentosMunicipiosColombiaService,
    private svExcel: CreacionExcelService,
    private svPdf: CreacionPdfService,
    private tutoriales: TutorialesService,
  ) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
    this.columnasSeleccionadas = this.leerColumnas();
    this.busqueda$.pipe(debounceTime(250), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.aplicarFiltros());
    this.svMunicipios.getMunicipios().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(lista => {
      this.municipiosDane = lista;
      // Si los pedidos llegaron antes que el DANE, se completan ahora los departamentos que faltaban
      if (this.completarDepartamentos()) this.aplicarFiltros(false);
      this.armarOpcionesLugares();
    });
    this.consultarPedidos();
  }

  ngOnDestroy() {
    this.tutoriales.cancelar(); // alCambiarTema ya se desuscribe solo al destruir el componente
  }

  tutorial = () => this.tutoriales.iniciar(pasosTutorialPedidosZeus({ veFiltroVendedor: this.veFiltroVendedor, puedeVerOt: this.ValidarRol == 1 }));

  /** El rol 2 (vendedor) ya recibe solo sus pedidos desde el servidor. */
  get veFiltroVendedor(): boolean { return this.ValidarRol != 2; }

  // =====================================================================
  // Carga
  // =====================================================================

  /** Consulta los pedidos abiertos de Zeus; la tabla se muestra apenas llegan y las OT se completan después. */
  consultarPedidos() {
    this.cargandoTabla = true;
    this.errorCarga = false;
    const ventas = this.ValidarRol == 2 ? `?sales=${String(this.storage_Id).padStart(3, '0')}` : '';
    this.inventarioZeusService.GetPedidos(ventas).pipe(
      finalize(() => this.cargandoTabla = false),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (datos: any[]) => {
        const hoy = moment().startOf('day');
        this.lineas = (datos ?? []).map((d, i) => mapearLinea(d, i, hoy));
        calcularSemaforo(this.lineas);
        this.completarDepartamentos();
        this.ultimaActualizacion = new Date();
        this.armarOpciones();
        this.aplicarFiltros();
        this.cargarOts();
      },
      error: () => {
        this.errorCarga = true;
        this.lineas = [];
        this.aplicarFiltros();
        this.msj.mensajeError('Error', 'No fue posible consultar los pedidos de Zeus. Intenta de nuevo con el botón Actualizar.');
      },
    });
  }

  /** Una sola petición con todas las líneas: busca la OT de cada ítem (±5 días de la fecha del pedido). */
  private cargarOts() {
    if (!this.lineas.length) return;
    this.cargandoOts = true;
    const DIAS_OT = 5;
    const solicitud = this.lineas.map(l => ({
      date1: moment(l.fecha_Creacion).subtract(DIAS_OT, 'd').format('YYYY-MM-DD'),
      date2: moment(l.fecha_Creacion).add(DIAS_OT, 'd').format('YYYY-MM-DD'),
      item: Number(l.id_Producto) || 0,
      consecutivo: l.consecutivo,
    }));
    const lineasConsultadas = this.lineas;
    this.estadosProcesos_OTService.getOtsForSalesOrder(solicitud).pipe(
      finalize(() => this.cargandoOts = false),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (ots: (OtDePedido | null)[]) => {
        if (lineasConsultadas !== this.lineas) return; // llegó tarde: ya se recargaron los pedidos
        // La respuesta trae un elemento por línea, en el mismo orden de la solicitud
        (ots ?? []).forEach((ot, i) => {
          const linea = lineasConsultadas[i];
          if (!ot || !linea) return;
          linea.OT = String(ot.ot ?? '');
          linea.Estado_OT = ot.status ?? null;
          linea.Proceso_OT = procesoActualOt(ot);
          linea.busqueda = textoBusqueda(linea);
        });
        this.aplicarFiltros(false);
      },
      error: () => this.msj.mensajeAdvertencia('Advertencia', 'No se pudieron consultar las órdenes de trabajo asociadas. Los pedidos se muestran sin OT.'),
    });
  }

  /** Opciones de cliente, vendedor y lugares a partir de los pedidos consultados. */
  private armarOpciones() {
    const clientes = new Map<string, string>();
    const vendedores = new Map<string, string>();
    this.lineas.forEach(l => {
      if (!clientes.has(l.nitCliente)) clientes.set(l.nitCliente, `${l.cliente} · ${ciudadLegible(l)}`);
      if (!vendedores.has(l.idVendedor)) vendedores.set(l.idVendedor, `${l.idVendedor} - ${l.vendedor}`);
    });
    this.opcionesClientes = [...clientes].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
    this.opcionesVendedores = [...vendedores].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
    this.opcionesMesesCreacion = this.opcionesMeses(this.lineas.map(l => l.fecha_Creacion));
    this.opcionesMesesEntrega = this.opcionesMeses(this.lineas.map(l => l.fecha_Entrega));
    this.armarOpcionesLugares();
  }

  /** Meses (año-mes) presentes en las fechas, del más reciente al más antiguo: "Nov 2026". */
  private opcionesMeses(fechas: string[]): { label: string; value: string }[] {
    const meses = [...new Set(fechas.filter(Boolean).map(f => f.substring(0, 7)))].sort().reverse();
    return meses.map(value => ({ value, label: this.nombreMesLargo(value) }));
  }

  private nombreMesLargo(anioMes: string): string {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const [anio, mes] = anioMes.split('-');
    return `${meses[Number(mes) - 1] ?? mes} ${anio}`;
  }

  /**
   * Zeus entrega algunas ciudades sin departamento ("BARRANQUILLA" en vez de "Atlántico-Barranquilla").
   * Se deduce con el DANE por el nombre del municipio, solo si ese nombre existe en un único departamento
   * (p. ej. "La Unión" está en varios y se deja sin departamento). Devuelve true si completó alguno.
   */
  private completarDepartamentos(): boolean {
    if (!this.municipiosDane.length || !this.lineas.length) return false;
    const titulo = (texto: string) => texto.toLowerCase().replace(/(^|\s)\S/g, c => c.toUpperCase());
    const departamentosPorMunicipio = new Map<string, Set<string>>();
    this.municipiosDane.forEach(m => {
      const clave = normalizar(m.municipio);
      const deps = departamentosPorMunicipio.get(clave) ?? new Set<string>();
      deps.add(m.departamento);
      departamentosPorMunicipio.set(clave, deps);
    });
    let cambio = false;
    this.lineas.forEach(l => {
      if (l.departamento || !l.municipio) return;
      const deps = departamentosPorMunicipio.get(normalizarMunicipio(l.municipio));
      if (deps?.size !== 1) return;
      l.departamento = titulo([...deps][0]);
      l.municipio = titulo(l.municipio);
      cambio = true;
    });
    return cambio;
  }

  /**
   * Departamentos y municipios: solo los que tienen pedidos (así ningún filtro deja la tabla vacía),
   * con el nombre oficial del DANE (datos.gov.co) cuando coincide; si la API no responde, el de Zeus.
   */
  private armarOpcionesLugares() {
    const nombreDane = new Map<string, string>();
    this.municipiosDane.forEach(m => {
      nombreDane.set(`d|${normalizar(m.departamento)}`, m.departamento);
      nombreDane.set(`m|${normalizar(m.departamento)}|${normalizar(m.municipio)}`, m.municipio);
    });
    const titulo = (texto: string) => texto.toLowerCase().replace(/(^|\s)\S/g, c => c.toUpperCase());
    const departamentos = new Map<string, string>();
    const municipios = new Map<string, { label: string; value: string; departamento: string }>();
    this.lineas.forEach(l => {
      const dep = normalizar(l.departamento);
      const mun = normalizarMunicipio(l.municipio);
      if (dep && !departamentos.has(dep)) departamentos.set(dep, titulo(nombreDane.get(`d|${dep}`) ?? l.departamento));
      if (mun && !municipios.has(`${dep}|${mun}`)) {
        const nombre = titulo(nombreDane.get(`m|${dep}|${mun}`) ?? l.municipio);
        municipios.set(`${dep}|${mun}`, { value: `${dep}|${mun}`, label: dep ? `${nombre} (${departamentos.get(dep)})` : nombre, departamento: dep });
      }
    });
    this.opcionesDepartamentos = [...departamentos].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
    this.todosMunicipios = [...municipios.values()].sort((a, b) => a.label.localeCompare(b.label));
    this.filtrarOpcionesMunicipios();
  }
  private todosMunicipios: { label: string; value: string; departamento: string }[] = [];

  /** Municipios en cascada: si hay departamentos elegidos, solo los de esos departamentos. */
  private filtrarOpcionesMunicipios() {
    this.opcionesMunicipios = this.departamentosSel.length
      ? this.todosMunicipios.filter(m => this.departamentosSel.includes(m.departamento))
      : this.todosMunicipios;
    const validos = new Set(this.opcionesMunicipios.map(m => m.value));
    this.municipiosSel = this.municipiosSel.filter(m => validos.has(m));
  }

  // =====================================================================
  // Filtros
  // =====================================================================

  buscar = () => this.busqueda$.next(this.busqueda);

  cambiarDepartamentos() {
    this.filtrarOpcionesMunicipios();
    this.aplicarFiltros();
  }

  seleccionarKpi(filtro: FiltroKpi) {
    this.filtroKpi = this.filtroKpi === filtro ? null : filtro;
    this.aplicarFiltros();
  }

  alternarSemaforo(valor: Semaforo) {
    this.semaforosSel = this.semaforosSel.includes(valor) ? this.semaforosSel.filter(s => s !== valor) : [...this.semaforosSel, valor];
    this.aplicarFiltros();
  }

  alternarEstado(valor: string) {
    this.estadosSel = this.estadosSel.includes(valor) ? this.estadosSel.filter(s => s !== valor) : [...this.estadosSel, valor];
    this.aplicarFiltros();
  }

  /**
   * Aplica todos los filtros: la tabla, los indicadores, las gráficas y las exportaciones usan este resultado.
   * @param reiniciarPagina false cuando solo se actualizan datos (llegada de las OT) para no mover al usuario de página.
   */
  aplicarFiltros(reiniciarPagina: boolean = true) {
    const texto = normalizar(this.busqueda);
    const departamentos = new Set(this.departamentosSel);
    const municipios = new Set(this.municipiosSel);
    const clientes = new Set(this.clientesSel);
    const estados = new Set(this.estadosSel);
    const semaforos = new Set(this.semaforosSel);
    const mesesCreacion = new Set(this.mesesCreacionSel);
    const mesesEntrega = new Set(this.mesesEntregaSel);
    const [desde, hasta] = (this.rangoEntrega ?? []).map(f => f ? moment(f).format('YYYY-MM-DD') : null);

    this.lineasFiltradas = this.lineas.filter(l => {
      if (texto && !l.busqueda.includes(texto)) return false;
      if (departamentos.size && !departamentos.has(normalizar(l.departamento))) return false;
      if (municipios.size && !municipios.has(`${normalizar(l.departamento)}|${normalizarMunicipio(l.municipio)}`)) return false;
      if (clientes.size && !clientes.has(l.nitCliente)) return false;
      if (this.vendedorSel && l.idVendedor !== this.vendedorSel) return false;
      if (estados.size && !estados.has(l.estado)) return false;
      if (semaforos.size && !semaforos.has(l.semaforoPedido)) return false;
      if (desde && l.fecha_Entrega < desde) return false;
      if (hasta && l.fecha_Entrega > hasta) return false;
      if (mesesCreacion.size && !mesesCreacion.has(l.fecha_Creacion.substring(0, 7))) return false;
      if (mesesEntrega.size && !mesesEntrega.has(l.fecha_Entrega.substring(0, 7))) return false;
      switch (this.filtroKpi) {
        case 'facturable': return l.facturable;
        case 'vencido': return l.vencido;
        case 'proximos': return !l.vencido && l.diasEntrega <= DIAS_PROXIMOS;
        case 'programados': return l.diasEntrega > DIAS_PROXIMOS;
        case 'sinOt': return !l.OT;
      }
      return true;
    });

    this.resumenes = resumirPedidos(this.lineasFiltradas);
    this.indicadores = calcularIndicadores(this.lineasFiltradas);
    this.ordenarLineas();
    this.paginar(reiniciarPagina);
    if (reiniciarPagina) {
      this.expandedRows = {};
      this.resumenes.forEach((_, consecutivo) => this.expandedRows[consecutivo] = true);
    }
    // Se calcula aquí y no en un getter: un getter crearía un arreglo nuevo en cada detección de cambios
    this.filtrosActivos = this.calcularFiltrosActivos();
    if (this.mostrarAnalisis) this.armarGraficas();
  }

  cambiarOrden() {
    this.ordenarLineas();
    this.paginar(true);
  }

  /**
   * Arma las páginas por pedido. Con el orden por semáforo, los pedidos completos y parciales llenan las
   * primeras páginas y los que no tienen stock empiezan en una página aparte.
   */
  private paginar(reiniciar: boolean) {
    const trozos = (grupos: PedidoZeusLinea[][]) => {
      const resultado: PedidoZeusLinea[][] = [];
      for (let i = 0; i < grupos.length; i += this.pedidosPorPagina) resultado.push(grupos.slice(i, i + this.pedidosPorPagina).flat());
      return resultado;
    };
    const grupos = [...agruparPorConsecutivo(this.lineasFiltradas).values()];
    this.paginaSinStock = null;
    if (this.ordenarPor === 'semaforo') {
      const conStock = trozos(grupos.filter(g => g[0].semaforoPedido !== 'sinStock'));
      const sinStock = trozos(grupos.filter(g => g[0].semaforoPedido === 'sinStock'));
      if (conStock.length && sinStock.length) this.paginaSinStock = conStock.length;
      this.paginas = [...conStock, ...sinStock];
    } else this.paginas = trozos(grupos);
    this.pagina = reiniciar ? 0 : Math.min(this.pagina, Math.max(this.paginas.length - 1, 0));
    this.lineasPagina = this.paginas[this.pagina] ?? [];
  }

  cambiarPagina(pagina: number, tabla?: Table) {
    this.pagina = pagina;
    this.lineasPagina = this.paginas[pagina] ?? [];
    tabla?.resetScrollTop();
  }

  cambiarPedidosPorPagina() {
    this.paginar(true);
  }

  /** Ordena los pedidos (grupos) según el criterio elegido; la tabla agrupada necesita las líneas de cada pedido juntas. */
  private ordenarLineas() {
    const prioridadSemaforo: Record<Semaforo, number> = { completo: 0, parcial: 1, sinStock: 2 };
    const r = (l: PedidoZeusLinea) => this.resumenes.get(l.consecutivo)!;
    const criterio: Record<string, (a: PedidoZeusLinea, b: PedidoZeusLinea) => number> = {
      semaforo: (a, b) => prioridadSemaforo[a.semaforoPedido] - prioridadSemaforo[b.semaforoPedido] || r(a).fechaEntrega.localeCompare(r(b).fechaEntrega),
      entrega: (a, b) => r(a).fechaEntrega.localeCompare(r(b).fechaEntrega),
      valor: (a, b) => r(b).totalPendiente - r(a).totalPendiente,
      cliente: (a, b) => a.cliente.localeCompare(b.cliente),
      pedido: (a, b) => Number(b.consecutivo) - Number(a.consecutivo),
    };
    const comparar = criterio[this.ordenarPor];
    this.lineasFiltradas = [...this.lineasFiltradas].sort((a, b) =>
      comparar(a, b) || a.consecutivo.localeCompare(b.consecutivo) || a.id - b.id);
  }

  /** Chips de los filtros activos (cada uno se puede quitar con la ×). */
  private calcularFiltrosActivos(): ChipFiltro[] {
    const chips: ChipFiltro[] = [];
    const etiqueta = (opciones: { label: string; value: any }[], valor: any) => opciones.find(o => o.value === valor)?.label ?? valor;
    if (this.busqueda) chips.push({ etiqueta: `Búsqueda: "${this.busqueda}"`, quitar: () => { this.busqueda = ''; this.aplicarFiltros(); } });
    this.departamentosSel.forEach(d => chips.push({ etiqueta: etiqueta(this.opcionesDepartamentos, d), quitar: () => { this.departamentosSel = this.departamentosSel.filter(x => x !== d); this.cambiarDepartamentos(); } }));
    this.municipiosSel.forEach(m => chips.push({ etiqueta: etiqueta(this.todosMunicipios, m), quitar: () => { this.municipiosSel = this.municipiosSel.filter(x => x !== m); this.aplicarFiltros(); } }));
    this.clientesSel.forEach(c => chips.push({ etiqueta: etiqueta(this.opcionesClientes, c).split(' · ')[0], quitar: () => { this.clientesSel = this.clientesSel.filter(x => x !== c); this.aplicarFiltros(); } }));
    if (this.vendedorSel) chips.push({ etiqueta: etiqueta(this.opcionesVendedores, this.vendedorSel), quitar: () => { this.vendedorSel = null; this.aplicarFiltros(); } });
    if (this.rangoEntrega?.[0]) chips.push({ etiqueta: `Entrega ${moment(this.rangoEntrega[0]).format('DD/MM/YYYY')}${this.rangoEntrega[1] ? ' - ' + moment(this.rangoEntrega[1]).format('DD/MM/YYYY') : ''}`, quitar: () => { this.rangoEntrega = null; this.aplicarFiltros(); } });
    this.mesesCreacionSel.forEach(m => chips.push({ etiqueta: `Creado en ${this.nombreMesLargo(m)}`, quitar: () => { this.mesesCreacionSel = this.mesesCreacionSel.filter(x => x !== m); this.aplicarFiltros(); } }));
    this.mesesEntregaSel.forEach(m => chips.push({ etiqueta: `Entrega en ${this.nombreMesLargo(m)}`, quitar: () => { this.mesesEntregaSel = this.mesesEntregaSel.filter(x => x !== m); this.aplicarFiltros(); } }));
    this.estadosSel.forEach(e => chips.push({ etiqueta: etiqueta(this.opcionesEstado, e), quitar: () => this.alternarEstado(e) }));
    this.semaforosSel.forEach(s => chips.push({ etiqueta: `Semáforo: ${etiqueta(this.opcionesSemaforo, s)}`, quitar: () => this.alternarSemaforo(s) }));
    const nombresKpi: Record<string, string> = { facturable: 'Listo para facturar', vencido: 'Vencidos', proximos: `Próximos ${DIAS_PROXIMOS} días`, programados: 'Programados', sinOt: 'Sin OT' };
    if (this.filtroKpi) chips.push({ etiqueta: nombresKpi[this.filtroKpi], quitar: () => this.seleccionarKpi(this.filtroKpi) });
    return chips;
  }

  limpiarFiltros() {
    this.busqueda = '';
    this.departamentosSel = [];
    this.municipiosSel = [];
    this.clientesSel = [];
    this.vendedorSel = null;
    this.rangoEntrega = null;
    this.mesesCreacionSel = [];
    this.mesesEntregaSel = [];
    this.estadosSel = [];
    this.semaforosSel = [];
    this.filtroKpi = null;
    this.filtrarOpcionesMunicipios();
    this.aplicarFiltros();
  }

  // =====================================================================
  // Tabla
  // =====================================================================

  valorCelda(linea: PedidoZeusLinea, col: ColumnaPedido): any {
    return col.field === 'ciudadLegible' ? ciudadLegible(linea) : linea[col.field];
  }

  cambiarColumnas() {
    // Conserva el orden original de las columnas aunque se elijan en otro orden
    const elegidas = new Set(this.columnasSeleccionadas.map(c => c.field));
    this.columnasSeleccionadas = this.columnas.filter(c => elegidas.has(c.field));
    try { localStorage.setItem(CLAVE_COLUMNAS, JSON.stringify([...elegidas])); } catch { }
  }

  restablecerColumnas() {
    this.columnasSeleccionadas = this.columnas.filter(c => c.defecto);
    try { localStorage.removeItem(CLAVE_COLUMNAS); } catch { }
  }

  private leerColumnas(): ColumnaPedido[] {
    try {
      const guardadas: string[] = JSON.parse(localStorage.getItem(CLAVE_COLUMNAS) ?? 'null');
      if (Array.isArray(guardadas) && guardadas.length) {
        const elegidas = this.columnas.filter(c => guardadas.includes(c.field));
        if (elegidas.length) return elegidas;
      }
    } catch { }
    return this.columnas.filter(c => c.defecto);
  }

  get todosExpandidos(): boolean {
    return this.resumenes.size > 0 && Object.keys(this.expandedRows).length === this.resumenes.size;
  }

  alternarExpandirTodo() {
    const expandir = !this.todosExpandidos;
    this.expandedRows = {};
    if (expandir) this.resumenes.forEach((_, consecutivo) => this.expandedRows[consecutivo] = true);
  }

  verDetalle(linea: PedidoZeusLinea) {
    this.lineaDetalle = linea;
    this.detalleVisible = true;
  }

  ciudadDe = (linea: PedidoZeusLinea) => ciudadLegible(linea);

  /** Nombre y clase del badge del estado de la OT (undefined si no tiene). */
  estadoOt = (linea: PedidoZeusLinea) => linea.Estado_OT != null ? ESTADOS_OT[linea.Estado_OT] : undefined;

  /** Doble clic en la OT (rol 1): estados de la orden de trabajo del pedido. */
  verOrdenTrabajo(linea: PedidoZeusLinea, evento?: Event) {
    evento?.stopPropagation();
    if (this.ValidarRol != 1) return;
    this.estadosProcesos_OTService.GetOrdenesTrabajo_Pedido(Number(linea.consecutivo)).subscribe(datos_orden => {
      if (datos_orden.length > 0) {
        this.consecutivoPedido = linea.consecutivo;
        this.modalEstadosOrdenes = true;
        setTimeout(() => { // espera a que el diálogo cree el componente hijo
          this.modalEstadosProcesos_OT.modeModal = true;
          this.modalEstadosProcesos_OT.ArrayDocumento = [];
          datos_orden.forEach(ot => this.modalEstadosProcesos_OT.llenarArray(ot));
        });
      } else this.msj.mensajeAdvertencia('Advertencia', `¡No hay orden asociada al pedido ${linea.consecutivo}!`);
    }, () => this.msj.mensajeError('Error', `¡No se obtuvo información de las órdenes de trabajo asociadas al pedido ${linea.consecutivo}!`));
  }

  // =====================================================================
  // Análisis (gráficas)
  // =====================================================================

  alternarAnalisis() {
    this.mostrarAnalisis = !this.mostrarAnalisis;
    if (this.mostrarAnalisis) this.armarGraficas();
  }

  private armarGraficas() {
    const oscuro = this.modoSeleccionado;
    const texto = colorTextoGrafica(oscuro);
    const millones = (v: number) => `$${(v / 1_000_000).toLocaleString('en-US', { maximumFractionDigits: 1 })}M`;
    const tooltipMoneda = { callbacks: { label: (c: any) => `${c.dataset.label ?? ''}: $${Number(c.raw).toLocaleString('en-US', { maximumFractionDigits: 0 })}` } };

    // Pendiente por mes de entrega: vencido, mes actual y los 5 siguientes, y posteriores; separado por facturable o no
    const inicioMes = moment().startOf('month');
    const etiquetas = ['Vencido', ...Array.from({ length: 6 }, (_, i) => this.nombreMes(inicioMes.clone().add(i, 'month'))), 'Posteriores'];
    const facturable = new Array(etiquetas.length).fill(0);
    const sinStock = new Array(etiquetas.length).fill(0);
    this.lineasFiltradas.forEach(l => {
      let indice: number;
      if (l.vencido) indice = 0;
      else {
        const meses = moment(l.fecha_Entrega).startOf('month').diff(inicioMes, 'months');
        indice = meses < 0 ? 1 : meses > 5 ? etiquetas.length - 1 : meses + 1;
      }
      (l.facturable ? facturable : sinStock)[indice] += l.costo_Cant_Pendiente;
    });
    this.graficaMeses = {
      labels: etiquetas,
      datasets: [
        { label: 'Con stock', data: facturable, backgroundColor: colorSerieGrafica(2, oscuro), stack: 'pendiente' },
        { label: 'Sin stock', data: sinStock, backgroundColor: colorSerieGrafica(0, oscuro), stack: 'pendiente' },
      ],
    };
    this.opcionesGraficaMeses = {
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: texto } }, tooltip: tooltipMoneda },
      scales: {
        x: { stacked: true, ticks: { color: texto }, grid: { color: COLOR_REJILLA_GRAFICA } },
        y: { stacked: true, ticks: { color: texto, callback: (v: number) => millones(v) }, grid: { color: COLOR_REJILLA_GRAFICA } },
      },
    };

    const top = (lista: { clave: string; valor: number }[], n: number) => lista.slice(0, n);
    const clientes = top(sumarPor(this.lineasFiltradas, l => l.cliente, l => l.costo_Cant_Pendiente), 10);
    const vendedores = top(sumarPor(this.lineasFiltradas, l => l.vendedor, l => l.costo_Cant_Pendiente), 10);
    const recortar = (t: string) => t.length > 28 ? t.substring(0, 27) + '…' : t;
    this.graficaClientes = {
      labels: clientes.map(c => recortar(c.clave)),
      datasets: [{ label: 'Valor pendiente', data: clientes.map(c => c.valor), backgroundColor: colorSerieGrafica(1, oscuro) }],
    };
    this.graficaVendedores = {
      labels: vendedores.map(c => recortar(c.clave)),
      datasets: [{ label: 'Valor pendiente', data: vendedores.map(c => c.valor), backgroundColor: colorSerieGrafica(4, oscuro) }],
    };
    this.opcionesGraficaBarras = {
      indexAxis: 'y',
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: tooltipMoneda },
      scales: {
        x: { ticks: { color: texto, callback: (v: number) => millones(v) }, grid: { color: COLOR_REJILLA_GRAFICA } },
        y: { ticks: { color: texto }, grid: { color: COLOR_REJILLA_GRAFICA } },
      },
    };
  }

  private nombreMes(fecha: moment.Moment): string {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${meses[fecha.month()]} ${fecha.format('YY')}`;
  }

  // =====================================================================
  // Consolidado de asesores
  // =====================================================================

  /**
   * Por asesor: facturación del mes anterior y del actual (una consulta por mes para todos los asesores) y lo pendiente
   * de los pedidos filtrados, separado en vencido, con entrega este mes y futuro.
   * Proyectado del mes = facturado este mes + pendiente vencido + pendiente con entrega este mes.
   */
  abrirConsolidado() {
    this.panelConsolidado = 'asesores';
    this.codigoAsesorSeleccionado = '';
    this.modalConsolidado = true;
    this.cargandoConsolidado = true;
    this.obtenerFacturacion().pipe(
      finalize(() => this.cargandoConsolidado = false),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(facturacion => {
      if (!facturacion) this.msj.mensajeAdvertencia('Advertencia', 'No se pudo consultar la facturación de los asesores; se muestra solo lo pendiente.');
      const finMes = moment().endOf('month').format('YYYY-MM-DD');
      const asesores = new Map<string, ConsolidadoAsesor>();
      this.lineasFiltradas.forEach(l => {
        const codigo = this.codigoVendedor(l.idVendedor);
        let a = asesores.get(codigo);
        if (!a) {
          a = {
            codigo, vendedor: l.vendedor,
            factMesAnterior: facturacion ? facturacion.anterior.get(codigo) ?? 0 : null,
            factMesActual: facturacion ? facturacion.actual.get(codigo) ?? 0 : null,
            pendienteVencido: 0, pendienteMes: 0, pendienteFuturo: 0, pendienteTotal: 0, proyectado: null,
          };
          asesores.set(codigo, a);
        }
        if (l.vencido) a.pendienteVencido += l.costo_Cant_Pendiente;
        else if (l.fecha_Entrega <= finMes) a.pendienteMes += l.costo_Cant_Pendiente;
        else a.pendienteFuturo += l.costo_Cant_Pendiente;
        a.pendienteTotal += l.costo_Cant_Pendiente;
      });
      asesores.forEach(a => a.proyectado = a.factMesActual == null ? null : a.factMesActual + a.pendienteVencido + a.pendienteMes);
      this.consolidadoAsesores = [...asesores.values()].sort((a, b) => b.pendienteTotal - a.pendienteTotal);
      const suma = (campo: keyof ConsolidadoAsesor) => this.consolidadoAsesores.reduce((t, a) => t + (Number(a[campo]) || 0), 0);
      this.totalesConsolidado = {
        codigo: '', vendedor: 'Totales',
        factMesAnterior: facturacion ? suma('factMesAnterior') : null,
        factMesActual: facturacion ? suma('factMesActual') : null,
        pendienteVencido: suma('pendienteVencido'), pendienteMes: suma('pendienteMes'),
        pendienteFuturo: suma('pendienteFuturo'), pendienteTotal: suma('pendienteTotal'),
        proyectado: facturacion ? suma('proyectado') : null,
      };
    });
  }

  /** Facturación de todos los asesores en el mes anterior y el actual; se consulta una sola vez por visita. */
  private obtenerFacturacion() {
    if (!this.facturacion$) {
      const actual = moment();
      const anterior = moment().subtract(1, 'month'); // en enero, el mes anterior es diciembre del año pasado
      const aMapa = (lista: { vendedor: string; total: number }[]) =>
        new Map((lista ?? []).map(x => [this.codigoVendedor(x.vendedor), Number(x.total) || 0] as [string, number]));
      this.facturacion$ = forkJoin([
        this.inventarioZeusService.GetCostoFacturado_Vendedores(anterior.format('MM'), anterior.year()),
        this.inventarioZeusService.GetCostoFacturado_Vendedores(actual.format('MM'), actual.year()),
      ]).pipe(
        map(([ant, act]) => ({ anterior: aMapa(ant), actual: aMapa(act) })),
        catchError(() => {
          this.facturacion$ = undefined; // se reintenta al volver a abrir
          return of(null);
        }),
        shareReplay(1),
      );
    }
    return this.facturacion$;
  }

  /** Zeus usa códigos de vendedor de 3 dígitos ("007"). */
  private codigoVendedor = (codigo: string) => String(codigo ?? '').trim().padStart(3, '0');

  /** Doble clic en un asesor del consolidado: el modal se desliza a sus pedidos agrupados por cliente. */
  verPedidosAsesor(asesor: ConsolidadoAsesor) {
    this.asesorSeleccionado = asesor.vendedor;
    this.codigoAsesorSeleccionado = asesor.codigo;
    this.pedidosAsesor = this.lineasFiltradas
      .filter(l => this.codigoVendedor(l.idVendedor) === asesor.codigo)
      .sort((a, b) => a.cliente.localeCompare(b.cliente) || a.consecutivo.localeCompare(b.consecutivo));
    this.totalesClienteAsesor = new Map(sumarPor(this.pedidosAsesor, l => l.cliente, l => l.costo_Cant_Pendiente).map(x => [x.clave, x.valor]));
    this.totalAsesor = this.pedidosAsesor.reduce((t, l) => t + l.costo_Cant_Pendiente, 0);
    if (!this.pedidosAsesor.length) {
      this.msj.mensajeAdvertencia('Advertencia', `No se encontraron pedidos pendientes del asesor ${asesor.vendedor}`);
      return;
    }
    this.filtroAsesor = '';
    this.dtAsesor?.clear(); // la búsqueda del asesor anterior no debe filtrar al nuevo
    this.panelConsolidado = 'pedidos';
  }

  volverAsesores() {
    this.panelConsolidado = 'asesores';
  }

  exportarExcelConsolidado() {
    if (!this.consolidadoAsesores.length || !this.totalesConsolidado) {
      this.msj.mensajeAdvertencia('Advertencia', 'No hay datos para exportar.');
      return;
    }
    const titulo = 'Información consolidada por asesores';
    const workbook = this.svExcel.formatoExcel(titulo, true);
    const hoja: any = workbook.worksheets[0];
    const borde = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    const alineacion = { vertical: 'middle', horizontal: 'center', wrapText: true };
    hoja.getCell('A1').value = titulo;
    hoja.getCell('A1').alignment = alineacion;
    hoja.getCell('A1').font = { name: 'Calibri', family: 4, size: 15, bold: true };
    hoja.mergeCells('A1:J3');
    const encabezado = ['N°', 'Código', 'Asesor', `Facturado ${this.nombreMesAnterior}`, `Facturado ${this.nombreMesActual}`, 'Pendiente vencido', 'Pendiente este mes', 'Pendiente futuro', 'Pendiente total', 'Proyectado mes'];
    const filaEncabezado = hoja.addRow(encabezado);
    filaEncabezado.eachCell((c: any) => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } };
      c.font = { name: 'Calibri', family: 4, size: 10, bold: true };
      c.border = borde;
      c.alignment = alineacion;
    });
    const filas = [...this.consolidadoAsesores.map((a, i) => [i + 1, a.codigo, a.vendedor, a.factMesAnterior, a.factMesActual, a.pendienteVencido, a.pendienteMes, a.pendienteFuturo, a.pendienteTotal, a.proyectado]),
      ['', '', 'TOTALES', this.totalesConsolidado.factMesAnterior, this.totalesConsolidado.factMesActual, this.totalesConsolidado.pendienteVencido, this.totalesConsolidado.pendienteMes, this.totalesConsolidado.pendienteFuturo, this.totalesConsolidado.pendienteTotal, this.totalesConsolidado.proyectado]];
    filas.forEach((f, i) => {
      const fila = hoja.addRow(f);
      fila.eachCell((c: any) => { c.border = borde; c.font = { name: 'Calibri', family: 4, size: 10, bold: i === filas.length - 1 }; });
    });
    [4, 5, 6, 7, 8, 9, 10].forEach(c => { hoja.getColumn(c).numFmt = '""#,##0.00;[Red]\-""#,##0.00'; hoja.getColumn(c).width = 18; });
    hoja.getColumn(1).width = 5;
    hoja.getColumn(2).width = 10;
    hoja.getColumn(3).width = 40;
    this.svExcel.creacionExcel(titulo, workbook);
  }

  // =====================================================================
  // PDF
  // =====================================================================

  private moneda = (v: number) => `$${(Number(v) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  private cantidad = (v: number) => (Number(v) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  /** Formatos cortos para el PDF consolidado: sin decimales cuando no aportan, para que las columnas sean angostas. */
  private monedaEntera = (v: number) => `$${Math.round(Number(v) || 0).toLocaleString('en-US')}`;
  private monedaCompacta = (v: number) => `$${(Number(v) || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  private cantidadCompacta = (v: number) => (Number(v) || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });
  private readonly grisPdf = '#DDDDDD'; // mismo gris de los demás PDF (CreacionPdfService)
  /** Margen superior de los PDF de esta vista: la cabecera ocupa ~70 pt, así no queda una franja en blanco. */
  private readonly margenSuperiorPdf = 85;

  /** Abre el PDF en una pestaña nueva; si el navegador la bloquea, lo descarga. */
  private abrirPdf(pdf: Blob, archivo: string) {
    const url = URL.createObjectURL(pdf);
    if (!window.open(url, '_blank')) fs.saveAs(pdf, archivo);
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  /** PDF de un pedido, con el formato común de los PDF del sistema. Una sola consulta. */
  pdfPedido(consecutivo: string, evento?: Event) {
    evento?.stopPropagation();
    this.cargando = true;
    this.inventarioZeusService.getPedidosXConsecutivo(consecutivo).pipe(
      finalize(() => this.cargando = false),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (items: any[]) => {
        if (!items?.length) {
          this.msj.mensajeAdvertencia('Advertencia', `No se encontró información del pedido ${consecutivo}.`);
          return;
        }
        this.cargando = true;
        this.svPdf.generarBlobFormatoComun(`Pedido Zeus N° ${consecutivo}`, () => this.contenidoPdfPedido(items), `Pedido ${consecutivo}`, 'portrait', this.margenSuperiorPdf)
          .pipe(finalize(() => this.cargando = false))
          .subscribe({
            next: pdf => this.abrirPdf(pdf, `Pedido ${consecutivo}.pdf`),
            error: () => this.msj.mensajeError('Error', `No fue posible generar el PDF del pedido ${consecutivo}.`),
          });
      },
      error: () => this.msj.mensajeError('Error', `No fue posible consultar el pedido ${consecutivo}.`),
    });
  }

  private contenidoPdfPedido(items: any[]): any[] {
    const p = items[0];
    const ciudad = ciudadLegible({ ciudad: p.ciudad ?? '', ...parsearCiudad(p.ciudad) });
    const total = items.reduce((t, i) => t + (Number(i.costo_Cant_Total) || 0), 0);
    const pendiente = items.reduce((t, i) => t + (Number(i.costo_Cant_Pendiente) || 0), 0);
    const etiqueta = (texto: string) => ({ text: texto, bold: true });
    const fecha = (v: any) => v ? String(v).substring(0, 10) : '';

    const datosGenerales = {
      margin: [0, 0, 0, 12],
      table: {
        widths: [80, '*', 80, '*'],
        body: [
          [{ text: 'Información del pedido', colSpan: 4, bold: true, fontSize: 10 }, {}, {}, {}],
          [etiqueta('Cliente'), p.cliente ?? '', etiqueta('NIT'), String(p.id_Cliente ?? '')],
          [etiqueta('Ciudad'), ciudad, etiqueta('Dirección'), p.direccion_Cliente ?? ''],
          [etiqueta('Comercial'), `${String(p.id_Vendedor ?? '').trim()} - ${p.vendedor ?? ''}`, etiqueta('OC cliente'), p.orden_Compra_CLiente ?? ''],
          [etiqueta('Fecha pedido'), fecha(p.fecha_Creacion), etiqueta('Estado'), p.estado ?? ''],
        ],
      },
      layout: { fillColor: (fila: number) => fila === 0 ? this.grisPdf : null, hLineColor: () => '#BBBBBB', vLineColor: () => '#BBBBBB' },
      fontSize: 8,
    };

    const derecha = (texto: string) => ({ text: texto, alignment: 'right' });
    const productos = {
      table: {
        headerRows: 2,
        dontBreakRows: true,
        widths: [32, '*', 22, 44, 44, 44, 44, 48, 58],
        body: [
          [{ text: 'Productos del pedido', colSpan: 9, bold: true, fontSize: 10 }, {}, {}, {}, {}, {}, {}, {}, {}],
          ['Ítem', 'Producto', 'Und', derecha('Pedida'), derecha('Facturada'), derecha('Pendiente'), 'F. entrega', derecha('Precio'), derecha('Subtotal')].map(c => typeof c === 'string' ? { text: c, bold: true } : { ...c, bold: true }),
          ...items.map(i => [
            String(i.id_Producto ?? ''),
            i.producto ?? '',
            i.presentacion ?? '',
            derecha(this.cantidad(i.cant_Pedida)),
            derecha(this.cantidad(i.cant_Facturada)),
            derecha(this.cantidad(i.cant_Pendiente)),
            fecha(i.fecha_Entrega),
            derecha(this.moneda(i.precioUnidad)),
            derecha(this.moneda(i.costo_Cant_Total)),
          ]),
        ],
      },
      layout: { fillColor: (fila: number) => fila <= 1 ? this.grisPdf : null, hLineColor: () => '#BBBBBB', vLineColor: () => '#BBBBBB' },
      fontSize: 7.5,
    };

    const totales = {
      margin: [0, 10, 0, 0],
      columns: [
        { width: '*', text: '' },
        {
          width: 220,
          table: {
            widths: ['*', 100],
            body: [
              [etiqueta('Total pedido'), derecha(this.moneda(total))],
              [etiqueta('Total facturado'), derecha(this.moneda(total - pendiente))],
              [{ text: 'Total pendiente', bold: true, fillColor: this.grisPdf }, { ...derecha(this.moneda(pendiente)), bold: true, fillColor: this.grisPdf }],
            ],
          },
          layout: { hLineColor: () => '#BBBBBB', vLineColor: () => '#BBBBBB' },
          fontSize: 8,
        },
      ],
    };

    const pie = { text: `Documento generado por ${this.storage_Nombre ?? ''}`, fontSize: 7, color: '#6c757d', margin: [0, 14, 0, 0] };
    return [datosGenerales, productos, totales, pie];
  }

  /** PDF de los pedidos filtrados: resumen (indicadores y totales por vendedor) y detalle vendedor → cliente → pedido. */
  pdfConsolidado() {
    if (!this.lineasFiltradas.length) {
      this.msj.mensajeAdvertencia('Advertencia', 'No hay pedidos para exportar con los filtros actuales.');
      return;
    }
    this.cargando = true;
    const lineas = [...this.lineasFiltradas];
    this.svPdf.generarBlobFormatoComun('Pedidos de Ventas', () => this.contenidoPdfConsolidado(lineas), 'Pedidos de Ventas', 'landscape', this.margenSuperiorPdf).pipe(
      finalize(() => this.cargando = false),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: pdf => this.abrirPdf(pdf, `Pedidos de Ventas ${moment().format('YYYY-MM-DD')}.pdf`),
      error: () => this.msj.mensajeError('Error', 'No fue posible generar el PDF de los pedidos.'),
    });
  }

  private contenidoPdfConsolidado(lineas: PedidoZeusLinea[]): any[] {
    const ind = calcularIndicadores(lineas);
    const lineaGris = { hLineColor: () => '#BBBBBB', vLineColor: () => '#BBBBBB' };
    const derecha = (texto: string, extra: any = {}) => ({ text: texto, alignment: 'right', ...extra });
    const contenido: any[] = [];

    // Filtros aplicados
    const filtros = this.filtrosActivos.map(f => f.etiqueta);
    contenido.push({ text: filtros.length ? `Filtros: ${filtros.join(' · ')}` : 'Sin filtros: todos los pedidos abiertos', fontSize: 7.5, italics: true, margin: [0, 0, 0, 4] });

    // Resumen de indicadores
    const celdaKpi = (titulo: string, valor: string, detalle: string) => ({
      stack: [{ text: titulo, fontSize: 7, bold: true }, { text: valor, fontSize: 10, bold: true }, { text: detalle, fontSize: 6.5 }],
      margin: [3, 2, 3, 2],
    });
    contenido.push({
      margin: [0, 0, 0, 6],
      table: {
        widths: ['*', '*', '*', '*', '*'],
        body: [[
          celdaKpi('Valor pendiente', this.monedaEntera(ind.valorPendiente), `${ind.pedidos} pedidos · ${ind.items} ítems`),
          celdaKpi('Listo para facturar', this.monedaEntera(ind.facturableValor), `${ind.facturableItems} ítems con stock`),
          celdaKpi('Vencido', this.monedaEntera(ind.vencidoValor), `${ind.vencidoItems} ítems`),
          celdaKpi(`Próximos ${DIAS_PROXIMOS} días`, this.monedaEntera(ind.proximosValor), `${ind.proximosItems} ítems`),
          celdaKpi('Programado', this.monedaEntera(ind.programadosValor), `${ind.programadosItems} ítems`),
        ]],
      },
      layout: { ...lineaGris, fillColor: () => '#F1F3F5' },
    });

    // Totales por vendedor (tabla angosta, no de ancho completo)
    const porVendedor = sumarPor(lineas, l => `${l.idVendedor} - ${l.vendedor}`, l => l.costo_Cant_Pendiente);
    contenido.push({
      margin: [0, 0, 0, 8],
      table: {
        headerRows: 2,
        widths: [260, 90, 40],
        body: [
          [{ text: 'Pendiente por vendedor', colSpan: 3, bold: true, fontSize: 8.5 }, {}, {}],
          [{ text: 'Vendedor', bold: true }, derecha('Valor pendiente', { bold: true }), derecha('%', { bold: true })],
          ...porVendedor.map(v => [v.clave, derecha(this.monedaEntera(v.valor)), derecha(ind.valorPendiente ? `${(v.valor / ind.valorPendiente * 100).toFixed(1)}%` : '0%')]),
        ],
      },
      layout: { ...lineaGris, fillColor: (fila: number) => fila <= 1 ? this.grisPdf : null, paddingTop: () => 1, paddingBottom: () => 1 },
      fontSize: 7,
    });

    // Detalle: una tabla por vendedor; filas de cliente (con su total) y una fila por ítem.
    // El N° de pedido va en la primera columna (solo en su primer ítem) para no gastar una fila por pedido,
    // y el encabezado de columnas se repite solo al cambiar de hoja: así el informe usa muchas menos hojas.
    const vendedores = new Map<string, PedidoZeusLinea[]>();
    lineas.forEach(l => {
      const clave = `${l.idVendedor} - ${l.vendedor}`;
      const grupo = vendedores.get(clave);
      if (grupo) grupo.push(l); else vendedores.set(clave, [l]);
    });
    // Carta horizontal: 742 pt útiles; las columnas de valores van justas y la referencia toma el resto (~310 pt)
    const anchos = [30, 32, '*', 22, 38, 54, 40, 40, 40, 40, 44, 54];
    const columnas = anchos.length;
    const vacias = (n: number) => new Array(n).fill({});
    const encabezado = ['PV', 'Ítem', 'Referencia', 'Und', 'Creado', 'Entrega', 'Pedida', 'Facturada', 'Pendiente', 'Stock', 'Precio U.', 'Subtotal']
      .map((t, i) => i >= 6 ? derecha(t, { bold: true }) : { text: t, bold: true });
    const fechaCorta = (f: string) => f ? moment(f).format('DD/MM/YY') : '';
    const layoutDetalle = {
      ...lineaGris,
      fillColor: (fila: number) => fila <= 1 ? this.grisPdf : null,
      paddingTop: () => 1, paddingBottom: () => 1, paddingLeft: () => 2, paddingRight: () => 2,
    };

    [...vendedores.keys()].sort().forEach(vendedor => {
      const lineasVendedor = vendedores.get(vendedor)!;
      const totalVendedor = lineasVendedor.reduce((t, l) => t + l.costo_Cant_Pendiente, 0);
      const body: any[] = [
        [{ text: vendedor, colSpan: columnas, bold: true, fontSize: 8.5, color: '#131f4c' }, ...vacias(columnas - 1)],
        encabezado,
      ];
      const clientes = new Map<string, PedidoZeusLinea[]>();
      lineasVendedor.forEach(l => {
        const grupo = clientes.get(l.nitCliente);
        if (grupo) grupo.push(l); else clientes.set(l.nitCliente, [l]);
      });
      clientes.forEach(lineasCliente => {
        const c = lineasCliente[0];
        const totalCliente = lineasCliente.reduce((t, l) => t + l.costo_Cant_Pendiente, 0);
        body.push([
          { text: `${c.cliente}  ·  NIT ${c.nitCliente}  ·  ${ciudadLegible(c)}`, colSpan: columnas - 2, bold: true, fillColor: '#F1F3F5' }, ...vacias(columnas - 3),
          derecha(this.monedaEntera(totalCliente), { colSpan: 2, bold: true, fillColor: '#F1F3F5' }), {},
        ]);
        let pedidoAnterior = '';
        lineasCliente.forEach(i => {
          const primeraDelPedido = i.consecutivo !== pedidoAnterior;
          pedidoAnterior = i.consecutivo;
          body.push([
            primeraDelPedido ? { text: i.consecutivo, bold: true } : '',
            i.id_Producto, i.producto, i.presentacion,
            primeraDelPedido ? fechaCorta(i.fecha_Creacion) : '',
            { text: fechaCorta(i.fecha_Entrega) + (i.diasVencido ? ` · ${i.diasVencido}d` : ''), color: i.vencido ? '#b91c1c' : undefined },
            derecha(this.cantidadCompacta(i.cant_Pedida)), derecha(this.cantidadCompacta(i.cant_Facturada)), derecha(this.cantidadCompacta(i.cant_Pendiente)),
            derecha(this.cantidadCompacta(i.existencias), i.facturable ? { color: '#166534', bold: true } : {}),
            derecha(this.monedaCompacta(i.precioUnidad)), derecha(this.monedaEntera(i.costo_Cant_Pendiente)),
          ]);
        });
      });
      body.push([derecha(`Total ${vendedor}: ${this.monedaEntera(totalVendedor)}`, { colSpan: columnas, bold: true, fontSize: 7.5 }), ...vacias(columnas - 1)]);
      contenido.push({ margin: [0, 0, 0, 8], table: { headerRows: 2, widths: anchos, body }, layout: layoutDetalle, fontSize: 6.5 });
    });

    contenido.push({ text: `Total pedidos: ${this.monedaEntera(ind.valorPendiente)}`, alignment: 'right', bold: true, fontSize: 10, margin: [0, 4, 0, 0] });
    contenido.push({ text: `Documento generado por ${this.storage_Nombre ?? ''}`, fontSize: 7, color: '#6c757d', margin: [0, 10, 0, 0] });
    return contenido;
  }

  // =====================================================================
  // Excel
  // =====================================================================

  /** Excel con el detalle de los pedidos filtrados. */
  exportarExcel() {
    if (!this.lineasFiltradas.length) {
      this.msj.mensajeAdvertencia('Advertencia', 'No hay pedidos para exportar con los filtros actuales.');
      return;
    }
    const hoy = moment().format('YYYY-MM-DD');
    const titulo = `Reporte de Pedidos Zeus - ${hoy}`;
    const encabezado = ['N° Pedido', 'Cliente', 'Ciudad', 'Id Producto', 'Producto', 'Cant. Pedida', 'Pendiente', 'Facturada', 'Stock', 'Und', 'Precio Und', 'Estado', 'Vendedor', 'OC', 'Costo Cant. Pendiente', 'Costo Cant. Total', 'Fecha Creación', 'Fecha Entrega', 'OT', 'Proceso Actual', 'Estado OT'];
    const borde = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    const workbook = new Workbook();
    const logo = workbook.addImage({ base64: logoParaPdf, extension: 'png' });
    const hoja = workbook.addWorksheet(`Reporte Pedidos Zeus - ${hoy}`);
    hoja.addImage(logo, 'A1:C3');
    const filaTitulo = hoja.addRow([titulo]);
    filaTitulo.font = { name: 'Calibri', family: 4, size: 16, underline: 'double', bold: true };
    hoja.addRow([]);
    hoja.addRow([]);
    hoja.addRow(encabezado).eachCell(c => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } };
      c.border = borde as any;
    });
    hoja.mergeCells('A1:U3');
    hoja.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

    const coloresOt: Record<number, string> = { 17: '8AFC9B', 18: '53CC48', 3: 'FF7878', 14: '83D3FF', 16: 'F3FC20', 15: 'F6D45D' };
    const formatoNumero = '""#,##0.00;[Red]\-""#,##0.00';
    this.lineasFiltradas.forEach(l => {
      const fila = hoja.addRow([l.consecutivo, l.cliente, l.ciudad, l.id_Producto, l.producto, l.cant_Pedida, l.cant_Pendiente, l.cant_Facturada, l.existencias, l.presentacion, l.precioUnidad, l.estado, l.vendedor, l.orden_Compra_CLiente, l.costo_Cant_Pendiente, l.costo_Cant_Total, l.fecha_Creacion, l.fecha_Entrega, l.OT, l.Proceso_OT, l.Estado_OT != null ? (ESTADOS_OT[l.Estado_OT]?.nombre ?? '') : '']);
      fila.alignment = { horizontal: 'center' };
      [6, 7, 8, 9, 11, 15, 16].forEach(c => fila.getCell(c).numFmt = formatoNumero);
      fila.getCell(6).font = { color: { argb: 'FF7F71' }, name: 'Calibri', bold: true, size: 11 };
      if (l.Estado_OT != null && coloresOt[l.Estado_OT]) fila.getCell(21).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: coloresOt[l.Estado_OT] } };
      const colorEstado = l.estado == 'Pendiente' ? 'FF7F71' : l.estado == 'Parcialmente Satisfecho' ? 'FFF55D' : null;
      if (colorEstado) fila.getCell(12).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorEstado } };
    });
    [12, 60, 30, 15, 60, 15, 15, 15, 18, 15, 15, 30, 50, 25, 20, 20, 15, 15, 15, 40, 30].forEach((ancho, i) => hoja.getColumn(i + 1).width = ancho);
    workbook.xlsx.writeBuffer().then(datos => {
      fs.saveAs(new Blob([datos], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `Reporte Pedidos Zeus - ${hoy}.xlsx`);
      this.msj.mensajeConfirmacion('Confirmación', '¡Archivo de excel generado exitosamente!');
    });
  }

  /** Excel con el formato para la planeación de OT (pedidos filtrados). */
  exportarExcelPlaneacion() {
    if (!this.lineasFiltradas.length) {
      this.msj.mensajeAdvertencia('Advertencia', 'No hay pedidos para exportar con los filtros actuales.');
      return;
    }
    const fill: any = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } };
    const font: any = { size: 10, bold: true, name: 'Calibri' };
    const border: any = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    const workbook = this.svExcel.formatoExcel('Formato de pedidos de Zeus ', true);
    const hoja = workbook.worksheets[0];
    hoja.addRow(['Consecutivo', 'Item', 'Estado', 'Cliente', 'Referencia', 'OT', 'Fecha Pedido', 'Cantidad', 'Fecha Solicitada', 'Cantidad Despachada', 'Fecha Despacho', 'Precio', 'Total Factura', 'Vendedor']);
    ['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5', 'I5', 'J5', 'K5', 'L5', 'M5', 'N5'].forEach(c => {
      hoja.getCell(c).fill = fill;
      hoja.getCell(c).font = font;
      hoja.getCell(c).border = border;
    });
    hoja.mergeCells('A1:N3');
    hoja.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    [8, 10, 12, 13].forEach(c => hoja.getColumn(c).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    this.lineasFiltradas.forEach(p => {
      const fila = hoja.addRow([parseInt(p.consecutivo), parseInt(p.id_Producto), p.estado, p.cliente, p.producto, p.OT, p.fecha_Creacion, p.cant_Pedida, p.fecha_Entrega, p.cant_Facturada, p.cant_Facturada > 0 ? p.fecha_Factura : '', p.precioUnidad, p.costo_Cant_Total, p.vendedor]);
      fila.font = { name: 'Calibri', family: 4, size: 10 };
    });
    [1, 7, 8, 12].forEach(x => hoja.getColumn(x).width = 12);
    [4, 5].forEach(x => hoja.getColumn(x).width = 50);
    [14].forEach(x => hoja.getColumn(x).width = 40);
    [9, 11, 13].forEach(x => hoja.getColumn(x).width = 15);
    [10].forEach(x => hoja.getColumn(x).width = 20);
    [3].forEach(x => hoja.getColumn(x).width = 25);
    [2, 6].forEach(x => hoja.getColumn(x).width = 10);
    this.svExcel.creacionExcel(`Pedidos Zeus ${moment().format('DD-MM-YYYY')}`, workbook);
    this.msj.mensajeConfirmacion('Confirmación', '¡Archivo de excel generado exitosamente!');
  }
}
