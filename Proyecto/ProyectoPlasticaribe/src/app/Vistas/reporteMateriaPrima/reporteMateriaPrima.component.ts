import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription, finalize, firstValueFrom } from 'rxjs';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import moment from 'moment';
import { Table } from 'primeng/table/table';
import { AppComponent } from 'src/app/app.component';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { EntradaBOPPService } from 'src/app/Servicios/BOPP/entrada-BOPP.service';
import { CategoriaMateriaPrimaService } from 'src/app/Servicios/CategoriasMateriaPrima/categoriaMateriaPrima.service';
import { MateriaPrimaService } from 'src/app/Servicios/MateriaPrima/materiaPrima.service';
import { TintasService } from 'src/app/Servicios/Tintas/tintas.service';
import { TutorialesService } from 'src/app/Servicios/Tutoriales/Tutoriales.service';
import { ClaveTutorialInventarioMateriaPrima, pasosTutorialInventarioMateriaPrima } from 'src/app/Tutoriales/Tutoriales_InventarioMateriaPrima';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UnidadMedidaService } from 'src/app/Servicios/UnidadMedida/unidad-medida.service';
import { modelMateriaPrima } from 'src/app/Modelo/modelMateriaPrima';
import { modelTintas } from 'src/app/Modelo/modelTintas';
import { modelBOPP } from 'src/app/Modelo/modelBOPP';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { BoppGenericoService } from 'src/app/Servicios/BoppGenerico/BoppGenerico.service';
import { modeloMovimientos_Entradas_MP } from 'src/app/Modelo/modeloMovimientos_Entradas_MP';
import { Movimientos_Entradas_MPService } from 'src/app/Servicios/Movimientos_Entradas_MP/Movimientos_Entradas_MP.service';
import { modelEntradas_Salidas_MP } from 'src/app/Modelo/modelEntradas_Salidas_MP';
import { Entradas_Salidas_MPService } from 'src/app/Servicios/Entradas_Salidas_MP/Entradas_Salidas_MP.service';
import { SubcategoriasMatPrimaService } from 'src/app/Servicios/Subcategorias_MatPrima/subcategorias-mat-prima.service';

/** Tablas del reporte que muestran totales en el footer. */
type TablaInventario = 'general' | 'polietilenos' | 'tintas' | 'biorientados';
interface TotalTabla { stock: number, valor: number }

/** Pestañas que se pueden exportar a Excel. */
type PestanaExcel = 'materiasPrimas' | 'polietilenos' | 'tintas' | 'biorientados' | 'boppsAgrupados' | 'subcategorias';

/** Columna de una hoja de Excel del reporte. */
interface ColumnaExcel { titulo: string, campo: string, ancho: number, formato?: 'cantidad' | 'moneda' | 'entero', total?: boolean, resaltar?: boolean }

@Component({
  selector: 'app-reporteMateriaPrima',
  templateUrl: './reporteMateriaPrima.component.html',
  styleUrls: ['./reporteMateriaPrima.component.css']
})

export class ReporteMateriaPrimaComponent implements OnInit, OnDestroy {

  FormEdicionMateriaPrima !: FormGroup;
  @ViewChild('dt') dt: Table | undefined;
  @ViewChild('dt_Polientileno') dt_Polientileno: Table | undefined;
  @ViewChild('dt_Tintas') dt_Tintas: Table | undefined;
  @ViewChild('dt_Biorientados') dt_Biorientados: Table | undefined;
  @ViewChild('dt_BoppGenerico') dt_BoppGenerico: Table | undefined;
  @ViewChild('dt_Biorientados2') dt_Biorientados2: Table | undefined;
  @ViewChild('dt_Subcategories') dt_Subcategories: Table | undefined;
  @ViewChild('dt_Materiales') dt_Materiales: Table | undefined;
  readonly rolesInventarioGeneral: number[] = [1, 3, 12, 85, 98, 2, 104]; //Roles que ven materias primas, polietilenos y tintas
  readonly rolesInventarioBopp: number[] = [1, 3, 4, 89, 63, 12, 85, 98, 2, 104]; //Roles que ven biorientados
  fechaMaxima: Date = moment().endOf('day').toDate(); //Fecha máxima permitida para consultar (hoy)
  pestanaActiva: number = 0; //Índice de la pestaña visible (el tutorial la cambia para mostrar las tablas)
  private tutorialAutomaticoRevisado: boolean = false; //Evita revisar más de una vez si el tutorial debe salir solo
  mostrarSinStock: boolean = false; //Si está marcado se muestran también los registros con stock en cero (por defecto solo stock mayor a cero)
  private inventarioCompleto: Record<TablaInventario, any[]> = { general: [], polietilenos: [], tintas: [], biorientados: [] }; //Inventario consultado sin filtrar por stock
  totales: Record<TablaInventario, TotalTabla> = this.totalesVacios(); //Totales de los footers de cada tabla (respetan los filtros)
  private subInventario?: Subscription; //Suscripción de la consulta de inventario en curso (se cancela si se lanza otra)
  private subBoppsAgrupados?: Subscription; //Suscripción de la consulta de bopps agrupados en curso
  private subModalBopp?: Subscription; //Suscripción de la consulta de rollos del modal en curso
  private consultasEnCurso: number = 0; //Cantidad de consultas activas, para saber cuándo ocultar la animación de carga
  private rangoConsultado?: { inicio: string, fin: string }; //Último rango consultado con éxito (se muestra en el Excel)
  private boppsAgrupadosCargados: boolean = false; //Indica si ya se consultaron los bopps agrupados
  private intervaloTema?: any; //Intervalo que sincroniza el tema claro/oscuro
  columnas: any[] = []; //Variable que almacenará las columnas de la tabla que no se verá inicialmente pero que se podrá elegir
  _columnasSeleccionada: any[] = []; //variable que almacenará las columnas de la tabla que han sido seleccionadas
  storage_Id: number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre: any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol: any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol: number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today: any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  categorias: any = []; //variable que almacenará las categorias existentes
  undMedidas: any[] = []; //Variable que almacenará las unidades de medidas
  bodegas: any = []; //variable que almacenará las bodegas
  rongoFechas: any[] = this.rangoPorDefecto(); //Variable que va a guardar el rango de fechas en el que se buscará informacion (por defecto, el último año)
  arryMateriaPrimaFiltrada: any[] = []; //Variable que tendrá la informacion filtrada en las tablas
  load: boolean = true; //Variable que validará cuando vaya a salir la animacion de carga
  ArrayMateriaPrima: any[] = []; //Variable que tendrá la informacion de los productos que se piden en el nuevo pedido
  valorTotal: number = 0; //Variable que guardará el valor total de la total de toda la materia prima
  cantInicial: number = 0; //Variable que guardará la cantidad inicial total de materia prima
  cantEntrante: number = 0; //Variable que guardará la cantidad total entrante de la materia prima
  cantSaliente: number = 0; //Variable que guardará la cantidad total saliente de la materia prima
  cantExistencias: number = 0; //Variable que guardará la cantidad total en existencias de la materia prima
  cantDiferencia: number = 0; //Variable que guardará la cantidad total de diferencia entre lo inical y lo actual
  polietilenos: any[] = []; //Variable que va a almacenar la informacion de los polietilenos
  valorTotalPolietileno: number = 0; //Variable que guardará el valor tatal de la cantidad de todos los polietilenos
  cantInicialPolietileno: number = 0; //Variable que guardará la cantidad inicial total de polietilenos
  cantEntrantePolietileno: number = 0; //Variable que guardará la cantidad total entrante de polietilenos
  cantSalientePolietileno: number = 0; //Variable que guardará la cantidad total saliente de polietilenos
  cantExistenciasPolientileno: number = 0; //Variable que guardará la cantidad total en existencias de polietilenos
  cantDiferenciaPolietileno: number = 0; //Variable que guardará la cantidad total de diferencia entre lo inical y lo actual de los polietilenos
  tintas: any[] = []; //Variable que va a almacenar la informacion de las tintas
  valorTotalTintas: number = 0; //Variable que guardará el valor tatal de la cantidad de todos las tintas
  cantInicialTintas: number = 0; //Variable que guardará la cantidad inicial total de las tintas
  cantEntranteTintas: number = 0; //Variable que guardará la cantidad total entrante de las tintas
  cantSalienteTintas: number = 0; //Variable que guardará la cantidad total saliente de las tintas
  cantExistenciasTintas: number = 0; //Variable que guardará la cantidad total en existencias de las tintas
  cantDiferenciaTintas: number = 0; //Variable que guardará la cantidad total de diferencia entre lo inical y lo actual de las tintas
  biorientados: any[] = []; //Variable que va a almacenar la información de los biorientados
  valorTotalBiorientado: number = 0; //Variable que guardará el valor tatal de la cantidad de todos los biorientados
  cantInicialBiorientado: number = 0; //Variable que guardará la cantidad inicial total de los biorientados
  cantEntranteBiorientado: number = 0; //Variable que guardará la cantidad total entrante de los biorientados
  cantSalienteBiorientado: number = 0; //Variable que guardará la cantidad total saliente de los biorientados
  cantExistenciasBiorientado: number = 0; //Variable que guardará la cantidad total en existencias de los biorientados
  cantDiferenciaBiorientado: number = 0; //Variable que guardará la cantidad total de diferencia entre lo inical y lo actual de los biorientados
  modoSeleccionado: boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  modalCreacionMateriaPrima: boolean = false; //Variable para validar que se abra el modal en que se pregusntará que se creará
  ModalCrearMateriaPrima: boolean = false; //Variable para validar que se abra el modal de creacion de polietileno
  ModalCrearTintas: boolean = false; //Variable para validar que se abra el modal de creacion de tintas, chips, solvenetes
  modalEditarMateriasPrimas: boolean = false; //Variable para validar que se abra el modal en que se editará la información de la materia prima
  modalVerBopps: boolean = false; /** Modal que cargará la información de los bopp asociados a los bopp genericos */
  arrayBopps: any = []; /** Array que cargará la información de los bopp genéricos con stock. */
  stockTotalBopps: number = 0; /** Variable que cargará el peso total del bopp generico agrupado */
  genericoSeleccionado: string = ''; //Variable que cargará el nombre del bopp genérico seleccionado para mostrar su información en el modal de bopp asociados
  arrayModalBopp: any = []; /** Array que cargará en el modal los bopp asociados a los agrupados */
  valorTotalBopp: number = 0; /** Variable que cargará el valor total del bopp */
  cantInicialBopp: number = 0; /** Variable que cargará la cantidad total inicial del bopp */
  cantEntranteBopp: number = 0; /** Variable que cargará la cantidad total entrante del bopp */
  cantSalienteBopp: number = 0; /** Variable que cargará la cantidad total saliente del bopp */
  cantExistenciasBopp: number = 0; /** Variable que cargará la cantidad total de existencias del bopp */
  cantDiferenciaBopp: number = 0; /** Variable que cargará la cantidad total de la diferencia del bopp */
  boppsAgrupados: boolean = false; /** variable que mostrará el tab del bopp agrupado */
  boppsGenericos: any = [];  /** Variable que contendrá los bopp genericos. */
  esBopp: boolean = false; /** Variable que definirá si la materia prima que se está editando es bopp */
  idBoppGenerico: number = 1; //Variable que almacenará el id del bopp genérico que se le asignará a la materia prima que se está editando en caso de ser bopp
  materialSeleccionado: any = {}; //Variable que almacenará la información de la materia prima seleccionada para editar
  hora: any = moment().format('H:mm:ss'); //Variable que se usará para colocar la hora en el reporte de inventario
  subcategories: any = []; //Variable que almacenará las subcategorias de los polietilenos
  isSubcategory: boolean = false; //Variable que validará si se ha seleccionado una subcategoria para mostrar la información en la tabla de subcategorias
  modalSubcat: boolean = false; //Variable para validar que se abra el modal en que se mostrarán las materias primas asociadas a la subcategoria seleccionada
  totalSubcategories: number = 0; //Variable que guardará el valor total de la suma de las subcategorias
  materials: any = []; //Variable que guardará la información de las materias primas asociadas a la subcategoria seleccionada para mostrar en el modal
  subcategory: string; //Variable que guardará el nombre de la subcategoria seleccionada para mostrarlo en el modal
  subcategoriesInModal: any = []; //Variable que almacenará todas las subcategorias para luego mostrar solo las que tengan materias primas asociadas en el modal de subcategorias

  constructor(private materiaPrimaService: MateriaPrimaService,
    private tintasService: TintasService,
    private categoriMpService: CategoriaMateriaPrimaService,
    private AppComponent: AppComponent,
    private boppService: EntradaBOPPService,
    private tutoriales: TutorialesService,
    private frmBuilder: FormBuilder,
    private undMedidaService: UnidadMedidaService,
    private msj: MensajesAplicacionService,
    private servicioBoppGen: BoppGenericoService,
    private srvMovEntradasMP: Movimientos_Entradas_MPService,
    private srvSalidasMP: Entradas_Salidas_MPService,
    private svSubcategories: SubcategoriasMatPrimaService,
  ) {

    this.modoSeleccionado = this.AppComponent.temaSeleccionado;

    this.FormEdicionMateriaPrima = this.frmBuilder.group({
      Id: [null, Validators.required],
      Nombre: [null, Validators.required],
      Categoria: [null, Validators.required],
      Ancho: [null, Validators.required],
      Stock: [null, Validators.required],
      Stock2: [null],
      UndMed: [null, Validators.required],
      Precio: [null, Validators.required],
      PrecioEstandar: [null, Validators.required],
      Micras: [null, Validators.required],
      BoppGenerico: [null],
      IdBoppGenerico: [null],
      subcategory: [null],
    });
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.cargarColumnas();
    this.obtenerCategorias();
    this.consultarInventario();
    this.obtenerUnidadesMedidas();
    this.getSubcategories();

    this.intervaloTema = setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
  }

  ngOnDestroy(): void {
    if (this.intervaloTema) clearInterval(this.intervaloTema);
    this.subInventario?.unsubscribe();
    this.subBoppsAgrupados?.unsubscribe();
    this.subModalBopp?.unsubscribe();
    this.tutoriales.cancelar();
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  /** Marca el inicio de una consulta y muestra la animación de carga. */
  private iniciarCarga() {
    this.consultasEnCurso++;
    this.load = false;
  }

  /** Marca el fin de una consulta; oculta la animación solo cuando no quedan consultas activas. */
  private terminarCarga() {
    this.consultasEnCurso = Math.max(0, this.consultasEnCurso - 1);
    if (this.consultasEnCurso == 0) this.load = true;
  }

  /** Extrae el mensaje de error enviado por la API (BadRequest) o devuelve uno genérico. */
  private mensajeErrorApi(error: any, porDefecto: string): string {
    return typeof error?.error === 'string' && error.error.length > 0 ? error.error : porDefecto;
  }

  /** Rango de fechas por defecto: desde hace un año hasta hoy. */
  private rangoPorDefecto(): Date[] {
    return [moment().subtract(1, 'year').startOf('day').toDate(), moment().startOf('day').toDate()];
  }

  /** Devuelve el rango de fechas a consultar. Si el campo está vacío se usa el último año; la fecha final no puede ser mayor a hoy. */
  private obtenerRangoFechas(): { inicio: string, fin: string } | null {
    if (!this.rongoFechas?.[0]) this.rongoFechas = this.rangoPorDefecto();
    let inicio = moment(this.rongoFechas[0]);
    let fin = this.rongoFechas?.[1] ? moment(this.rongoFechas[1]) : inicio.clone();
    if (inicio.isAfter(fin, 'day')) [inicio, fin] = [fin, inicio];
    if (fin.isAfter(this.fechaMaxima, 'day')) {
      this.msj.mensajeAdvertencia(`Advertencia`, `La fecha final no puede ser mayor que el día de hoy.`);
      return null;
    }
    return { inicio: inicio.format('YYYY-MM-DD'), fin: fin.format('YYYY-MM-DD') };
  }

  /** Columnas disponibles y seleccionadas por defecto de las tablas de inventario. */
  private cargarColumnas() {
    this.columnas = [
      { header: 'ID', field: 'Id', tipo: 'texto' },
      { header: 'Nombre', field: 'Nombre', tipo: 'texto' },
      { header: 'Descripción', field: 'Descripcion', tipo: 'texto' },
      { header: 'Ancho', field: 'Ancho', tipo: 'numero' },
      { header: 'Micras', field: 'Micras', tipo: 'numero' },
      { header: 'Stock', field: 'Cant', tipo: 'numero' },
      { header: 'Medida', field: 'UndCant', tipo: 'texto' },
      { header: 'Precio Und', field: 'PrecioUnd', tipo: 'numero' },
      { header: 'SubTotal', field: 'SubTotal', tipo: 'numero' },
      { header: 'Categoria', field: 'Categoria', tipo: 'texto' },
      { header: 'Subcategoria', field: 'Subcategoria', tipo: 'texto' },
      { header: 'Inicial', field: 'Inicial', tipo: 'numero' },
      { header: 'Entrada', field: 'Entrada', tipo: 'numero' },
      { header: 'Salida', field: 'Salida', tipo: 'numero' },
      { header: 'Diferencia', field: 'Diferencia', tipo: 'numero' },
    ];
    this._columnasSeleccionada = this.columnas.filter(c => !['Descripcion', 'Inicial', 'Entrada', 'Salida', 'Diferencia'].includes(c.field));
  }

  /** Totales vacíos de cada tabla. */
  private totalesVacios(): Record<TablaInventario, TotalTabla> {
    return {
      general: { stock: 0, valor: 0 },
      polietilenos: { stock: 0, valor: 0 },
      tintas: { stock: 0, valor: 0 },
      biorientados: { stock: 0, valor: 0 },
    };
  }

  /** Calcula stock y valor de un conjunto de filas. */
  private calcularTotales(filas: any[]) {
    return {
      stock: this.cantidadExistencias(filas),
      valor: [1, 104].includes(this.ValidarRol) ? this.valorTotalExistencia(filas) : 0,
    };
  }

  /** Recalcula los totales de todas las tablas con la información completa (sin filtros). */
  private recalcularTotales() {
    this.totales = {
      general: this.calcularTotales(this.ArrayMateriaPrima),
      polietilenos: this.calcularTotales(this.polietilenos),
      tintas: this.calcularTotales(this.tintas),
      biorientados: this.calcularTotales(this.biorientados),
    };
  }

  /** Si la página actual de la tabla quedó fuera del total de registros (p. ej. tras una nueva consulta con menos datos), la regresa a la primera página. */
  private ajustarPagina(tabla: Table | undefined, cantidad: number) {
    if (tabla && tabla.first >= cantidad) tabla.first = 0;
  }

  /** Ajusta la página de las tablas de materias primas, polietilenos, tintas y biorientados. */
  private ajustarPaginasInventario() {
    this.ajustarPagina(this.dt, this.ArrayMateriaPrima.length);
    this.ajustarPagina(this.dt_Polientileno, this.polietilenos.length);
    this.ajustarPagina(this.dt_Tintas, this.tintas.length);
    this.ajustarPagina(this.dt_Biorientados, this.biorientados.length);
  }

  /** Se ejecuta con el evento (onFilter) de cada tabla para que el footer muestre los totales de lo filtrado. */
  actualizarTotalesFiltro(tabla: TablaInventario, event: any) {
    this.totales[tabla] = this.calcularTotales(event?.filteredValue ?? []);
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage() {
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion para obtener las diferentes categorias de materia prima existentes
  obtenerCategorias() {
    this.categoriMpService.srvObtenerLista().subscribe(datos_categorias => {
      this.categorias = datos_categorias;
      this.categorias.sort((a, b) => (a.catMP_Nombre ?? '').localeCompare(b.catMP_Nombre ?? ''));
    });
  }

  // Funcion para obtener las diferentes categorias de materia prima existentes
  getSubcategories() {
    this.svSubcategories.GetAll().subscribe(data => this.subcategoriesInModal = data);
  }

  // Funcion que va a obtener las diferentes materias primas
  obtenerUnidadesMedidas = () => this.undMedidaService.srvObtenerLista().subscribe(data => this.undMedidas = data);

  // Funcion que convierte un registro de la API en la fila que usan las tablas
  private mapearFila(data: any) {
    return {
      Tipo: data.tipo, //MP | TINTA | BOPP (tabla de origen)
      Clave: data.clave, //Clave única (Tipo + Id) para evitar choques entre ids de distintas tablas
      Id: data.id,
      Id2: data.id2,
      Nombre: data.nombre,
      Descripcion: data.descripcion,
      Ancho: data.ancho,
      Micras: data.micras,
      Inicial: data.inicial,
      Entrada: data.entrada,
      Salida: data.salida,
      Cant: data.stock,
      Cant2: data.stock,
      Diferencia: data.diferencia,
      UndCant: data.presentacion,
      PrecioUnd: [1, 104].includes(this.ValidarRol) ? data.precio : 0,
      PrecioEstandar: data.precioEstandar,
      SubTotal: [1, 104].includes(this.ValidarRol) ? data.subTotal : 0,
      Categoria: data.categoria,
      Categoria_Id: data.categoria_Id,
      Subcategoria: data.subcategoria,
      Subcategoria_Id: data.subcategoria_Id,
    };
  }

  // Funcion que reparte la información consultada en las tablas de cada pestaña
  private cargarInventario(data: any[]) {
    const filas = (data ?? []).map(d => this.mapearFila(d)).sort((a, b) => (a.Nombre ?? '').localeCompare(b.Nombre ?? ''));
    const verGeneral = this.rolesInventarioGeneral.includes(this.ValidarRol);
    const verBopp = this.rolesInventarioBopp.includes(this.ValidarRol);

    this.inventarioCompleto = {
      general: verGeneral ? filas : [],
      polietilenos: verGeneral ? filas.filter(x => x.Tipo == 'MP') : [],
      tintas: verGeneral ? filas.filter(x => x.Tipo == 'TINTA') : [],
      biorientados: verBopp ? filas.filter(x => x.Tipo == 'BOPP') : [],
    };
    this.aplicarFiltroStock();
  }

  // Funcion que limpia la información de las tablas
  private limpiarInventario() {
    this.inventarioCompleto = { general: [], polietilenos: [], tintas: [], biorientados: [] };
    this.aplicarFiltroStock();
  }

  /** Muestra en las tablas solo los registros con stock mayor a cero, o todos si el checkbox "Mostrar sin Stock" está marcado. */
  aplicarFiltroStock() {
    const filtrar = (filas: any[]) => this.mostrarSinStock ? filas : filas.filter(item => (item.Cant ?? 0) > 0);
    this.ArrayMateriaPrima = filtrar(this.inventarioCompleto.general);
    this.polietilenos = filtrar(this.inventarioCompleto.polietilenos);
    this.tintas = filtrar(this.inventarioCompleto.tintas);
    this.biorientados = filtrar(this.inventarioCompleto.biorientados);
    this.recalcularTotales();
    this.ajustarPaginasInventario();
    if (this.isSubcategory) this.loadSubcategories();
  }

  // Funcion que va a consultar la informacion del inventario de las materias primas (una sola petición)
  consultarInventario() {
    const rango = this.obtenerRangoFechas();
    if (!rango) return;

    //Si había una consulta en curso se cancela para que sus datos no se mezclen con los de la nueva.
    this.subInventario?.unsubscribe();
    this.iniciarCarga();
    this.subInventario = this.materiaPrimaService.GetInventarioConsolidado(rango.inicio, rango.fin)
      .pipe(finalize(() => {
        this.terminarCarga();
        if (this.load) this.iniciarTutorialPrimeraVez();
      }))
      .subscribe({
        next: data => {
          this.rangoConsultado = rango;
          this.cargarInventario(data);
        },
        error: error => {
          this.limpiarInventario();
          this.msj.mensajeError(`¡Error!`, this.mensajeErrorApi(error, `¡Ocurrió un error al consultar el inventario de materias primas!`));
        }
      });
  }

  // Filas que alimentan la pestaña de subcategorías según el rol (los roles de biorientados solo ven sus rollos)
  private filasSubcategorias = (): any[] => this.ArrayMateriaPrima.length > 0 ? this.ArrayMateriaPrima : this.biorientados;

  //Función para cargar los materiales por subcategorias.
  loadSubcategories() {
    const mapa = new Map<number, any>();
    for (const item of this.filasSubcategorias()) {
      if ([null, undefined, 21].includes(item.Subcategoria_Id)) continue;
      let sub = mapa.get(item.Subcategoria_Id);
      if (!sub) {
        sub = { id: item.Subcategoria_Id, reference: item.Subcategoria, stock: 0, unit: 'Kg', subtotal: 0 };
        mapa.set(item.Subcategoria_Id, sub);
      }
      sub.stock += item.Cant ?? 0;
      sub.subtotal += item.SubTotal ?? 0;
    }
    this.subcategories = [...mapa.values()].sort((a, b) => Number(a.id) - Number(b.id));
    this.totalSubcategories = this.subcategories.reduce((a, b) => a + b.subtotal, 0);
    this.ajustarPagina(this.dt_Subcategories, this.subcategories.length);
  }

  //Modal para cargar las materias primas asociadas a la subcategoria seleccionada.
  loadModalSubcategories(mp: any) {
    this.modalSubcat = true;
    this.subcategory = mp.reference;
    this.materials = this.filasSubcategorias().filter(x => x.Subcategoria_Id == mp.id).sort((a, b) => Number(a.Id) - Number(b.Id));
    this.ajustarPagina(this.dt_Materiales, 0); //Cada subcategoría abre su listado desde la primera página
  }

  /** Filtros de las tablas. Los totales se recalculan con el evento (onFilter) de cada tabla. */
  aplicarfiltro = ($event, campo: any, valorCampo: string) => this.dt?.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  // Filtro de la tabla de subcategorías
  applyFilter = ($event, campo: any, valorCampo: string) => this.dt_Subcategories?.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  // Total de la tabla de subcategorías según lo filtrado
  actualizarTotalSubcategorias = (event: any) => this.totalSubcategories = (event?.filteredValue ?? []).reduce((a, b) => a + (b.subtotal ?? 0), 0);

  // Filtro de la tabla del modal de materiales por subcategoría
  aplicarFiltroMateriales = ($event, campo: any, valorCampo: string) => this.dt_Materiales?.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  cantidadExistencias = (data: any[]): number => (data ?? []).reduce((a, b) => a + (b.Cant ?? 0), 0);

  valorTotalExistencia = (data: any[]): number => (data ?? []).reduce((a, b) => a + ((b.Cant ?? 0) * (b.PrecioUnd ?? 0)), 0);

  // Funcion que va a filtrar la información de la tabla e polietilenos
  aplicarFiltroPolietilenos = ($event, campo: any, valorCampo: string) => this.dt_Polientileno?.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  // Funcion que va a filtar la información de la tabla de tintas
  aplicarFiltroTintas = ($event, campo: any, valorCampo: string) => this.dt_Tintas?.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  // Funcion que va a filtrar la información en la tabla de biorientados
  aplicarFiltrosBiorientados = ($event, campo: any, valorCampo: string) => this.dt_Biorientados?.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  /* ===================================================================================================
   * EXPORTACIÓN A EXCEL
   * - Botón superior "Exportar todo": un solo libro con una hoja por cada pestaña visible para el rol (sin filtros).
   * - Botón de cada pestaña: solo la información de esa pestaña, respetando los filtros aplicados.
   * =================================================================================================== */

  /** Información de cada pestaña exportable: nombre visible, roles que la ven y de dónde salen los datos. */
  private definicionPestanaExcel(pestana: PestanaExcel): { nombre: string, visible: boolean, columnas: ColumnaExcel[], filas: (conFiltros: boolean) => any[], subtitulo: () => string } {
    const rol = this.ValidarRol;
    const verPrecios = [1, 104].includes(rol);
    const rango = () => this.rangoConsultado ? `Movimientos del ${this.rangoConsultado.inicio} al ${this.rangoConsultado.fin}` : '';
    const filtradas = (tabla: Table | undefined, datos: any[]) => (conFiltros: boolean) => (conFiltros && tabla?.filteredValue) ? tabla.filteredValue : datos;
    const verPestanasGenerales = ![63, 89, 4].includes(rol) && this.rolesInventarioGeneral.includes(rol);
    const verPestanasBopp = [1, 3, 4, 89, 63, 12, 98, 2, 104].includes(rol);

    //Formato de cada columna posible de las tablas de inventario (por campo).
    const formatoColumnas: { [campo: string]: Omit<ColumnaExcel, 'titulo' | 'campo'> } = {
      Id: { ancho: 12 },
      Nombre: { ancho: 55 },
      Descripcion: { ancho: 45 },
      Ancho: { ancho: 10, formato: 'cantidad' },
      Micras: { ancho: 10, formato: 'cantidad' },
      Inicial: { ancho: 18, formato: 'cantidad', total: true },
      Entrada: { ancho: 14, formato: 'cantidad', total: true },
      Salida: { ancho: 14, formato: 'cantidad', total: true },
      Cant: { ancho: 18, formato: 'cantidad', total: true, resaltar: true },
      Diferencia: { ancho: 14, formato: 'cantidad', total: true },
      UndCant: { ancho: 10 },
      PrecioUnd: { ancho: 16, formato: 'moneda' },
      SubTotal: { ancho: 20, formato: 'moneda', total: true },
      Categoria: { ancho: 22 },
      Subcategoria: { ancho: 25 },
    };
    //Se exportan las columnas que el usuario eligió en el selector, en el mismo orden y con el mismo título que en la tabla.
    //Si no eligió ninguna se exportan todas. Precio y subtotal solo para los roles que pueden verlos.
    const seleccionadas = (this._columnasSeleccionada?.length ? this._columnasSeleccionada : this.columnas);
    const columnasInventario: ColumnaExcel[] = seleccionadas
      .filter(c => verPrecios || !['PrecioUnd', 'SubTotal'].includes(c.field))
      .map(c => ({ titulo: c.header, campo: c.field, ...(formatoColumnas[c.field] ?? { ancho: 18 }) }));

    switch (pestana) {
      case 'materiasPrimas':
        return { nombre: 'Materias Primas', visible: verPestanasGenerales, columnas: columnasInventario, filas: filtradas(this.dt, this.ArrayMateriaPrima), subtitulo: rango };
      case 'polietilenos':
        return { nombre: 'Polietilenos', visible: verPestanasGenerales, columnas: columnasInventario, filas: filtradas(this.dt_Polientileno, this.polietilenos), subtitulo: rango };
      case 'tintas':
        return { nombre: 'Tintas', visible: verPestanasGenerales, columnas: columnasInventario, filas: filtradas(this.dt_Tintas, this.tintas), subtitulo: rango };
      case 'biorientados':
        return { nombre: 'Biorientados', visible: this.rolesInventarioBopp.includes(rol), columnas: columnasInventario, filas: filtradas(this.dt_Biorientados, this.biorientados), subtitulo: rango };
      case 'boppsAgrupados':
        return {
          nombre: 'Bopps agrupados', visible: verPestanasBopp, subtitulo: () => 'Stock actual de rollos con existencias',
          filas: filtradas(this.dt_BoppGenerico, this.arrayBopps),
          columnas: [
            { titulo: 'Id', campo: 'Id', ancho: 12 },
            { titulo: 'Nombre', campo: 'Nombre', ancho: 40 },
            { titulo: 'Micras', campo: 'Micras', ancho: 10, formato: 'cantidad' },
            { titulo: 'Ancho', campo: 'Ancho', ancho: 10, formato: 'cantidad' },
            { titulo: 'Categoria', campo: 'NombreCateg', ancho: 22 },
            { titulo: 'Rollos', campo: 'Rollos', ancho: 10, formato: 'entero', total: true },
            { titulo: 'Stock', campo: 'Stock', ancho: 16, formato: 'cantidad', total: true, resaltar: true },
            { titulo: 'Medida', campo: 'Medida', ancho: 10 },
          ],
        };
      case 'subcategorias':
        return {
          nombre: 'Subcategorias', visible: verPestanasBopp, subtitulo: () => 'Stock actual agrupado por subcategoría',
          filas: filtradas(this.dt_Subcategories, this.subcategories),
          columnas: [
            { titulo: 'Id', campo: 'id', ancho: 10 },
            { titulo: 'Subcategoria', campo: 'reference', ancho: 45 },
            { titulo: 'Stock', campo: 'stock', ancho: 18, formato: 'cantidad', total: true, resaltar: true },
            { titulo: 'Presentación', campo: 'unit', ancho: 14 },
            ...(verPrecios ? [{ titulo: 'Subtotal', campo: 'subtotal', ancho: 20, formato: 'moneda', total: true } as ColumnaExcel] : []),
          ],
        };
    }
  }

  /** Agrega al libro una hoja con logo, título, subtítulo, encabezados, datos y fila de totales. */
  private agregarHojaExcel(workbook: Workbook, idLogo: number, nombreHoja: string, titulo: string, subtitulo: string, columnas: ColumnaExcel[], filas: any[]) {
    const formatos = { cantidad: '#,##0.00;[Red]-#,##0.00', moneda: '"$"#,##0.00;[Red]-"$"#,##0.00', entero: '#,##0;[Red]-#,##0' };
    const borde: any = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    const total = columnas.length;
    const filaEncabezado = 7;
    const ws = workbook.addWorksheet(nombreHoja.substring(0, 31), { views: [{ state: 'frozen', ySplit: filaEncabezado }] });

    columnas.forEach((c, i) => ws.getColumn(i + 1).width = c.ancho);

    //Logo en las filas 1-3 conservando su proporción original (no se deforma).
    const altoLogo = 55;
    ws.addImage(idLogo, { tl: { col: 0, row: 0 }, ext: { width: Math.round(altoLogo * this.proporcionLogo()), height: altoLogo } });

    //Título (fila 4), subtítulo (fila 5) y fila 6 como separación.
    if (total > 1) ws.mergeCells(4, 1, 4, total);
    ws.getRow(4).height = 24;
    ws.getCell(4, 1).value = titulo;
    ws.getCell(4, 1).font = { name: 'Calibri', family: 4, size: 16, underline: 'double', bold: true };
    ws.getCell(4, 1).alignment = { vertical: 'middle', horizontal: 'left' };
    if (total > 1) ws.mergeCells(5, 1, 5, total);
    ws.getCell(5, 1).value = [subtitulo, `Generado: ${moment().format('YYYY-MM-DD H:mm')}`].filter(x => x).join('  ·  ');
    ws.getCell(5, 1).font = { name: 'Calibri', size: 10, italic: true };
    ws.getCell(5, 1).alignment = { horizontal: 'left' };

    //Encabezados
    const encabezado = ws.getRow(filaEncabezado);
    columnas.forEach((c, i) => {
      const celda = encabezado.getCell(i + 1);
      celda.value = c.titulo;
      celda.font = { bold: true };
      celda.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EEEEEE' } };
      celda.border = borde;
    });

    //Datos
    filas.forEach((fila, f) => {
      const row = ws.getRow(filaEncabezado + 1 + f);
      columnas.forEach((c, i) => {
        const celda = row.getCell(i + 1);
        celda.value = fila[c.campo] ?? (c.formato ? 0 : '');
        if (c.formato) celda.numFmt = formatos[c.formato];
        if (c.resaltar) celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ADD8E6' } };
        celda.border = borde;
      });
    });

    //Totales
    if (columnas.some(c => c.total) && filas.length > 0) {
      const row = ws.getRow(filaEncabezado + 1 + filas.length);
      const primeraConTotal = columnas.findIndex(c => c.total);
      if (primeraConTotal > 0) row.getCell(primeraConTotal).value = 'TOTALES';
      columnas.forEach((c, i) => {
        const celda = row.getCell(i + 1);
        if (c.total) {
          celda.value = filas.reduce((a, b) => a + (Number(b[c.campo]) || 0), 0);
          celda.numFmt = formatos[c.formato ?? 'cantidad'];
        }
        celda.font = { bold: true };
        celda.border = borde;
      });
    }
  }

  /** Genera el archivo y lo descarga. */
  private async descargarExcel(workbook: Workbook, nombreArchivo: string) {
    const buffer = await workbook.xlsx.writeBuffer();
    fs.saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `${nombreArchivo}.xlsx`);
  }

  /** Crea un libro nuevo y devuelve el id del logo para usarlo en sus hojas. */
  /** Proporción ancho/alto del logo leída de la cabecera del PNG (si falla se usa la del logo actual, 1972x370). */
  private proporcionLogo(): number {
    try {
      const base64 = String(logoParaPdf).split(',').pop()!.substring(0, 44);
      const bytes = atob(base64);
      const leer = (i: number) => ((bytes.charCodeAt(i) << 24) >>> 0) + (bytes.charCodeAt(i + 1) << 16) + (bytes.charCodeAt(i + 2) << 8) + bytes.charCodeAt(i + 3);
      const ancho = leer(16), alto = leer(20);
      if (ancho > 0 && alto > 0) return ancho / alto;
    } catch { }
    return 1972 / 370;
  }

  private nuevoLibroExcel() {
    const workbook = new Workbook();
    const idLogo = workbook.addImage({ base64: logoParaPdf, extension: 'png' });
    return { workbook, idLogo };
  }

  /** Botón de cada pestaña: exporta solo esa pestaña respetando sus filtros. */
  async exportarPestana(pestana: PestanaExcel) {
    const def = this.definicionPestanaExcel(pestana);
    const filas = def.filas(true);
    if (filas.length == 0) {
      this.msj.mensajeAdvertencia(`Advertencia`, `No hay datos de ${def.nombre} para exportar.`);
      return;
    }
    const titulo = `Inventario ${def.nombre} - ${this.today}`;
    this.iniciarCarga();
    try {
      const { workbook, idLogo } = this.nuevoLibroExcel();
      this.agregarHojaExcel(workbook, idLogo, def.nombre, titulo, def.subtitulo(), def.columnas, filas);
      await this.descargarExcel(workbook, titulo);
      this.msj.mensajeConfirmacion(`Confirmación`, `¡Se ha exportado el ${titulo}!`);
    } catch {
      this.msj.mensajeError(`¡Error!`, `¡Ocurrió un error al generar el Excel de ${def.nombre}!`);
    } finally {
      this.terminarCarga();
    }
  }

  /** Botón superior: un solo libro con una hoja por cada pestaña visible para el rol (información completa, sin filtros). */
  async exportarTodo() {
    this.iniciarCarga();
    try {
      //Bopps agrupados y subcategorías se calculan solo al abrir su pestaña; si no se han cargado se cargan aquí.
      if (this.definicionPestanaExcel('boppsAgrupados').visible && !this.boppsAgrupadosCargados) await this.cargarBoppsAgrupadosParaExcel();
      if (this.definicionPestanaExcel('subcategorias').visible) this.loadSubcategories();

      const { workbook, idLogo } = this.nuevoLibroExcel();
      const pestanas: PestanaExcel[] = ['materiasPrimas', 'polietilenos', 'tintas', 'biorientados', 'boppsAgrupados', 'subcategorias'];
      let hojas = 0;
      for (const p of pestanas) {
        const def = this.definicionPestanaExcel(p);
        const filas = def.filas(false);
        if (!def.visible || filas.length == 0) continue;
        this.agregarHojaExcel(workbook, idLogo, def.nombre, `Inventario ${def.nombre} - ${this.today}`, def.subtitulo(), def.columnas, filas);
        hojas++;
      }
      if (hojas == 0) {
        this.msj.mensajeAdvertencia(`Advertencia`, `No hay datos para exportar.`);
        return;
      }
      const titulo = `Inventario Materia Prima Completo - ${this.today}`;
      await this.descargarExcel(workbook, titulo);
      this.msj.mensajeConfirmacion(`Confirmación`, `¡Se ha exportado el ${titulo} con ${hojas} hoja(s)!`);
    } catch {
      this.msj.mensajeError(`¡Error!`, `¡Ocurrió un error al generar el Excel del inventario!`);
    } finally {
      this.terminarCarga();
    }
  }

  /** Consulta los bopps agrupados para incluirlos en el Excel completo cuando aún no se ha abierto su pestaña. */
  private async cargarBoppsAgrupadosParaExcel() {
    const data = await firstValueFrom(this.boppService.GetInventarioBoppsGenericosV2());
    this.arrayBopps = (data ?? []).map(d => this.cargarTablaBopps(d));
    this.stockTotalBopps = this.arrayBopps.reduce((a, b) => a + (b.Stock ?? 0), 0);
    this.boppsAgrupadosCargados = true;
  }

  //#region Tutorial
  /** Muestra el tutorial (botón "i" del título). La primera vez que el usuario entra se muestra solo. */
  tutorial = () => this.tutoriales.iniciar(this.pasosTutorial());

  /** Pasos del tutorial según lo que el rol del usuario puede ver y hacer en la página. */
  private pasosTutorial() {
    const veInventarioGeneral = ![63, 89, 4].includes(this.ValidarRol);
    return pasosTutorialInventarioMateriaPrima({
      veInventarioGeneral,
      veAgrupados: [1, 3, 4, 89, 63, 12, 98, 2, 104].includes(this.ValidarRol),
      puedeCrear: [1, 104].includes(this.ValidarRol),
      //La primera pestaña es Materias Primas (editan 1, 104 y 3) o, para los roles de BOPP, Biorientados (editan 1 y 104).
      puedeEditarPrimeraPestana: veInventarioGeneral ? [1, 104, 3].includes(this.ValidarRol) : [1, 104].includes(this.ValidarRol),
      vePrecios: [1, 104].includes(this.ValidarRol),
      irPrimeraPestana: () => this.pestanaActiva = 0,
    });
  }

  /** Inicia el tutorial automáticamente la primera vez, cuando termina la primera consulta y las tablas ya se ven. */
  private iniciarTutorialPrimeraVez() {
    if (this.tutorialAutomaticoRevisado) return;
    this.tutorialAutomaticoRevisado = true;
    this.tutoriales.iniciarPrimeraVez(ClaveTutorialInventarioMateriaPrima, this.storage_Id, () => this.pasosTutorial());
  }
  //#endregion

  // Funcion para llamar el modal que pregunta que materia prima se va a crear
  LlamarModalCrearMateriaPrima = () => this.modalCreacionMateriaPrima = true;

  // Funcion para llamar el modal que crea polientileno
  crearPolientileno() {
    this.modalCreacionMateriaPrima = false;
    this.ModalCrearMateriaPrima = true;
  }

  // Funcion para llamar el modal que crea tintas
  creartinta() {
    this.modalCreacionMateriaPrima = false;
    this.ModalCrearTintas = true;
  }

  // Funcion que va a llamar el modal donde se editará la información de la materia prima
  llamarModalEdicionMateriaPrima(data: any) {
    this.materialSeleccionado = data;
    this.cargarBoppsGenericos();
    this.modalEditarMateriasPrimas = true;
    this.FormEdicionMateriaPrima.patchValue({
      Id: data.Id,
      Nombre: data.Nombre,
      Categoria: data.Categoria_Id,
      Ancho: data.Ancho,
      Stock: data.Cant,
      Stock2: data.Cant2,
      UndMed: data.UndCant,
      Precio: data.PrecioUnd,
      Micras: 0,
      PrecioEstandar: data.PrecioEstandar,
      subcategory: data.Subcategoria_Id,
    });
    if (data.Tipo == 'BOPP') {
      this.esBopp = true;
      this.boppService.srvObtenerListaPorSerial(this.FormEdicionMateriaPrima.value.Id).subscribe(data => {
        for (let i = 0; i < data.length; i++) {
          this.FormEdicionMateriaPrima.patchValue({ Micras: data[i].bopP_CantidadMicras, IdBoppGenerico: data[i].boppGen_Id, BoppGenerico: data[i].boppGen_Id, });
          this.idBoppGenerico = data[i].boppGen_Id;
        }
        setTimeout(() => { this.seleccionarBoppsGenericos(); }, 3000);
      });
    } else {
      this.FormEdicionMateriaPrima.patchValue({ Micras: 0, Ancho: 0, IdBoppGenerico: null, BoppGenerico: null, });
      this.esBopp = false;
    }
  }

  // Funcion que va a editar una materia primas
  editarMateriaPrima() {
    //Se decide la tabla a actualizar por el origen del registro (Tipo) y no por la categoría elegida en el formulario,
    //así cambiar la categoría no envía el registro a la tabla equivocada.
    const tipo: string = this.materialSeleccionado?.Tipo;
    if (tipo == 'MP') {
      const info: modelMateriaPrima = {
        MatPri_Id: this.FormEdicionMateriaPrima.value.Id,
        MatPri_Nombre: this.FormEdicionMateriaPrima.value.Nombre,
        MatPri_Descripcion: this.FormEdicionMateriaPrima.value.Nombre,
        MatPri_Stock: this.FormEdicionMateriaPrima.value.Stock,
        UndMed_Id: this.FormEdicionMateriaPrima.value.UndMed,
        CatMP_Id: this.FormEdicionMateriaPrima.value.Categoria,
        MatPri_Precio: this.FormEdicionMateriaPrima.value.Precio,
        TpBod_Id: 4,
        MatPri_PrecioEstandar: this.FormEdicionMateriaPrima.value.PrecioEstandar,
        SubCatMP_Id: this.FormEdicionMateriaPrima.value.subcategory,
      }
      this.materiaPrimaService.srvActualizar(info.MatPri_Id, info).subscribe(() => {
        this.crearAjustesMP(info.MatPri_Id, 2001, 1);
        this.consultarInventario();
        this.msj.mensajeConfirmacion(`¡Polietileno Actualizado!`, `¡La materia prima con el nombre '${info.MatPri_Nombre}' ha sido actualizada con exito!`);
        this.modalEditarMateriasPrimas = false;
        this.esBopp = false;
        this.idBoppGenerico = 1;
      }, () => {
        this.msj.mensajeError(`¡Error!`, `¡Ha ocurrido un error al intentar actualizar la materia prima!`);
        this.modalEditarMateriasPrimas = false;
        this.esBopp = false;
        this.idBoppGenerico = 1;
      });
    } else if (tipo == 'TINTA') {
      this.tintasService.srvObtenerListaPorId(this.FormEdicionMateriaPrima.value.Id).subscribe(data => {
        const info: modelTintas = {
          Tinta_Id: this.FormEdicionMateriaPrima.value.Id,
          Tinta_Nombre: this.FormEdicionMateriaPrima.value.Nombre,
          Tinta_Descripcion: this.FormEdicionMateriaPrima.value.Nombre,
          Tinta_CodigoHexadecimal: this.FormEdicionMateriaPrima.value.Nombre,
          Tinta_Stock: this.FormEdicionMateriaPrima.value.Stock,
          UndMed_Id: this.FormEdicionMateriaPrima.value.UndMed,
          Tinta_Precio: this.FormEdicionMateriaPrima.value.Precio,
          CatMP_Id: this.FormEdicionMateriaPrima.value.Categoria,
          TpBod_Id: data.tpBod_Id,
          Tinta_InvInicial: data.tinta_InvInicial,
          Tinta_FechaIngreso: data.tinta_FechaIngreso,
          Tinta_Hora: data.tinta_Hora,
          Tinta_PrecioEstandar: this.FormEdicionMateriaPrima.value.PrecioEstandar,
          SubCatMP_Id: this.FormEdicionMateriaPrima.value.subcategory,
        }
        if (info.Tinta_Id != null) {
          this.tintasService.srvActualizar(info.Tinta_Id, info).subscribe(() => {
            if (info.Tinta_Id != null) {
              this.crearAjustesMP(84, info.Tinta_Id, 1);
              this.consultarInventario();
              this.msj.mensajeConfirmacion(`¡Tinta Actualizada!`, `¡La tinta con el nombre '${info.Tinta_Nombre}' ha sido actualizada con exito!`);
              this.modalEditarMateriasPrimas = false;
              this.esBopp = false;
              this.idBoppGenerico = 1;
            }
          }, () => {
            this.msj.mensajeError(`¡Error!`, `¡Ha ocurrido un error al intentar actualizar la tinta!`);
            this.modalEditarMateriasPrimas = false;
            this.esBopp = false;
            this.idBoppGenerico = 1;
          })
        }

      });
    } else if (tipo == 'BOPP') {
      this.boppService.srvObtenerListaPorSerial(this.FormEdicionMateriaPrima.value.Id).subscribe(data => {
        for (let i = 0; i < data.length; i++) {
          const info: modelBOPP = {
            BOPP_Id: data[i].bopP_Id,
            BOPP_Nombre: `${this.FormEdicionMateriaPrima.value.Nombre}`,
            BOPP_Descripcion: this.FormEdicionMateriaPrima.value.Nombre,
            BOPP_Serial: data[i].bopP_Serial,
            BOPP_CantidadMicras: this.FormEdicionMateriaPrima.value.Micras,
            UndMed_Id: data[i].undMed_Id,
            CatMP_Id: this.FormEdicionMateriaPrima.value.Categoria,
            BOPP_Precio: this.FormEdicionMateriaPrima.value.Precio,
            TpBod_Id: data[i].tpBod_Id,
            BOPP_FechaIngreso: data[i].bopP_FechaIngreso,
            BOPP_Ancho: this.FormEdicionMateriaPrima.value.Ancho,
            BOPP_Stock: this.FormEdicionMateriaPrima.value.Stock,
            UndMed_Kg: this.FormEdicionMateriaPrima.value.UndMed,
            BOPP_CantidadInicialKg: data[i].bopP_CantidadInicialKg,
            Usua_Id: data[i].usua_Id,
            BOPP_Hora: data[i].bopP_Hora,
            BoppGen_Id: this.FormEdicionMateriaPrima.value.IdBoppGenerico == null ? this.idBoppGenerico : this.FormEdicionMateriaPrima.value.IdBoppGenerico,
            BOPP_CodigoDoc: data[i].bopP_CodigoDoc,
            BOPP_TipoDoc: data[i].bopP_TipoDoc,
            Prov_Id: data[i].prov_Id,
            SubCatMP_Id: this.FormEdicionMateriaPrima.value.subcategory,
          }
          this.servicioBoppGen.PutPrecioEstandar(this.idBoppGenerico, this.FormEdicionMateriaPrima.value.PrecioEstandar).subscribe();
          this.boppService.srvActualizar(info.BOPP_Id, info).subscribe(() => {
            this.crearAjustesMP(84, 2001, info.BoppGen_Id);
            this.consultarInventario();
            this.msj.mensajeConfirmacion(`¡Biorientado Actualizado!`, `El biorientado con el nombre '${info.BOPP_Nombre}' ha sido actualizado con exito!`);
            this.modalEditarMateriasPrimas = false;
            this.esBopp = false;
            this.idBoppGenerico = 1;
          }, () => {
            this.msj.mensajeError(`¡Error!`, `¡Ha ocurrido un error al intentar actualizar el biorientado!`);
            this.modalEditarMateriasPrimas = false;
            this.esBopp = false;
            this.idBoppGenerico = 1;
          })
        }
      });
    }
  }

  /** Función que consultará la información del BOPP agrupado por genérico. */
  boppsAgrupados_Genericos() {
    this.subBoppsAgrupados?.unsubscribe();
    this.iniciarCarga();
    this.subBoppsAgrupados = this.boppService.GetInventarioBoppsGenericosV2()
      .pipe(finalize(() => this.terminarCarga()))
      .subscribe({
        next: data => {
          this.arrayBopps = (data ?? []).map(d => this.cargarTablaBopps(d));
          this.stockTotalBopps = this.arrayBopps.reduce((a, b) => a + (b.Stock ?? 0), 0);
          this.boppsAgrupadosCargados = true;
          this.ajustarPagina(this.dt_BoppGenerico, this.arrayBopps.length);
        },
        error: error => {
          this.arrayBopps = [];
          this.stockTotalBopps = 0;
          this.msj.mensajeError(`¡Error!`, this.mensajeErrorApi(error, `¡Ocurrió un error al consultar los bopps agrupados!`));
        }
      });
  }

  /**  Función que convierte un registro del BOPP agrupado por genérico en la fila de la tabla. */
  cargarTablaBopps(datos: any) {
    return {
      Id: datos.id,
      Nombre: datos.nombre,
      Micras: datos.micras,
      Ancho: datos.ancho,
      IdCateg: datos.idCategoria,
      NombreCateg: datos.nombreCategoria,
      Rollos: datos.rollos,
      Stock: datos.stock,
      Medida: datos.medida,
    };
  }

  /** Filtro de la tabla de bopp agrupado. El total se recalcula con el evento (onFilter). */
  aplicarfiltroGenerico = ($event, campo: any, valorCampo: string) => this.dt_BoppGenerico?.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  /** Total de stock de la tabla de bopp agrupado según lo filtrado. */
  actualizarTotalBoppsAgrupados = (event: any) => this.stockTotalBopps = (event?.filteredValue ?? []).reduce((a, b) => a + (b.Stock ?? 0), 0);

  /** Función que llamará el modal y consultará la información de el(los) bopp(s) asociado(s) al bopp genérico que se seleccionó */
  llamarModalBopp(data: any) {
    const rango = this.obtenerRangoFechas();
    if (!rango) return;
    this.genericoSeleccionado = data.Nombre;
    this.modalVerBopps = true;
    this.arrayModalBopp = [];
    this.ajustarPagina(this.dt_Biorientados2, 0); //Cada genérico abre su listado de rollos desde la primera página
    this.calcularTotalesModalBopp([]);

    this.subModalBopp?.unsubscribe();
    this.iniciarCarga();
    this.subModalBopp = this.boppService.GetInventarioBoppsV2(rango.inicio, rango.fin, data.Id)
      .pipe(finalize(() => this.terminarCarga()))
      .subscribe({
        next: rollos => {
          this.arrayModalBopp = (rollos ?? []).map(r => this.cargarTablaModal(r));
          this.calcularTotalesModalBopp(this.arrayModalBopp);
        },
        error: error => this.msj.mensajeError(`¡Error!`, this.mensajeErrorApi(error, `¡Ocurrió un error al consultar los rollos del bopp genérico!`)),
      });
  }

  /** Función que convierte un rollo asociado al bopp genérico en la fila de la tabla del modal */
  cargarTablaModal(datos: any) {
    return {
      Id: datos.id,
      Nombre: datos.nombre,
      Ancho: datos.ancho,
      Micras: datos.micras,
      Inicial: datos.inicial,
      Entrada: datos.entrada,
      Salida: datos.salida,
      Cant: datos.stock,
      Diferencia: datos.diferencia,
      UndCant: datos.medida,
      PrecioUnd: datos.precio,
      SubTotal: datos.subtotal,
      Categoria: datos.categoria,
      Categoria_Id: datos.categoriaId,
    };
  }

  /** Calcula los totales del footer del modal de rollos. */
  private calcularTotalesModalBopp(filas: any[]) {
    const sumar = (campo: string) => (filas ?? []).reduce((a, b) => a + (b[campo] ?? 0), 0);
    this.valorTotalBopp = sumar('SubTotal');
    this.cantInicialBopp = sumar('Inicial');
    this.cantEntranteBopp = sumar('Entrada');
    this.cantSalienteBopp = sumar('Salida');
    this.cantExistenciasBopp = sumar('Cant');
    this.cantDiferenciaBopp = sumar('Diferencia');
  }

  /** Función que cargará el inventario de bopp's agrupados o las subcategorías según la pestaña seleccionada */
  cargarTabs(event) {
    //Se busca el encabezado de la pestaña para que funcione aunque se haga clic sobre el icono.
    const elemento = event?.originalEvent?.target as HTMLElement;
    const tab: string = (elemento?.closest('[role="tab"]')?.textContent ?? elemento?.innerText ?? '').trim();
    if (tab.includes('Bopps agrupados')) {
      this.boppsAgrupados = true;
      this.boppsAgrupados_Genericos();
    } else if (tab.includes('Subcategorias')) {
      this.isSubcategory = true;
      this.loadSubcategories();
    }
  }

  // Funcion que va a filtrar la información en la tabla del modal de rollos. Los totales se recalculan con (onFilter).
  aplicarFiltrosBiorientados2 = ($event, campo: any, valorCampo: string) => this.dt_Biorientados2?.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  // Totales del modal de rollos según lo filtrado
  actualizarTotalesModalBopp = (event: any) => this.calcularTotalesModalBopp(event?.filteredValue ?? []);

  /** Función para cargar los nombres de bopps genericos en el campo */
  cargarBoppsGenericos() {
    this.boppsGenericos = [];
    this.servicioBoppGen.srvObtenerLista().subscribe(data => {
      for (let index = 0; index < data.length; index++) {
        this.boppsGenericos.push(data[index])
      }
    });
  }

  /** Función para seleccionar el nombre del bopp en el campo, pero su valor será el Id. */
  seleccionarBoppsGenericos() {
    let bopp: any = this.FormEdicionMateriaPrima.value.BoppGenerico;
    let nuevo: any = [];
    nuevo = this.boppsGenericos.filter((item) => item.boppGen_Id == bopp);
    if (nuevo.length == 0) return;
    this.FormEdicionMateriaPrima.patchValue({ BoppGenerico: nuevo[0].boppGen_Nombre, IdBoppGenerico: nuevo[0].boppGen_Id });
  }

  //Función que creará ajustes de entradas/salidas de materia prima
  crearAjustesMP(mp1: number, mp2: number, mp3: number) {
    let esError: boolean = false;
    let cantidad: number = this.FormEdicionMateriaPrima.value.Stock;
    if (cantidad > this.materialSeleccionado.Cant) this.crearMovEntrada(mp1, mp2, mp3, cantidad);
    else if (cantidad < this.materialSeleccionado.Cant) {
      let cantSaliente: number = 0;
      let nueva: number = (this.materialSeleccionado.Cant - cantidad);
      this.srvMovEntradasMP.GetInventarioxMaterial(this.materialSeleccionado.Id2).subscribe(data => {
        if (data.length > 0) {
          data.forEach(element => {
            if (nueva > 0) {
              let entradas2: modeloMovimientos_Entradas_MP = {
                'Id': element.id,
                'MatPri_Id': element.matPri_Id,
                'Tinta_Id': element.tinta_Id,
                'Bopp_Id': element.bopp_Id,
                'Cantidad_Entrada': element.cantidad_Entrada,
                'UndMed_Id': element.undMed_Id,
                'Precio_RealUnitario': element.precio_RealUnitario,
                'Tipo_Entrada': element.tipo_Entrada,
                'Codigo_Entrada': element.codigo_Entrada,
                'Estado_Id': element.estado_Id,
                'Cantidad_Asignada': element.cantidad_Asignada,
                'Cantidad_Disponible': element.cantidad_Disponible,
                'Observacion': element.observacion,
                'Fecha_Entrada': element.fecha_Entrada,
                'Hora_Entrada': element.hora_Entrada,
                'Precio_EstandarUnitario': element.precio_EstandarUnitario
              }
              if (nueva > element.cantidad_Disponible) {
                cantSaliente = entradas2.Cantidad_Disponible;
                entradas2.Cantidad_Asignada += cantSaliente;
                entradas2.Cantidad_Disponible = (entradas2.Cantidad_Entrada - entradas2.Cantidad_Asignada);
                entradas2.Estado_Id = 5;
                nueva -= cantSaliente;
              } else if (nueva == element.cantidad_Disponible) {
                cantSaliente = nueva;
                entradas2.Cantidad_Asignada += cantSaliente;
                entradas2.Cantidad_Disponible = (entradas2.Cantidad_Entrada - entradas2.Cantidad_Asignada);
                entradas2.Estado_Id = 5;
                nueva = 0;
              } else if (nueva < element.cantidad_Disponible) {
                cantSaliente = nueva;
                entradas2.Cantidad_Asignada += nueva;
                entradas2.Cantidad_Disponible -= nueva;
                entradas2.Estado_Id = 19;
                nueva = 0;
              }
              if (entradas2.Id) {
                this.srvMovEntradasMP.Put(entradas2.Id, entradas2).subscribe(() => { esError = false; }, error => { esError = true; });
                if (!esError) this.crearMovSalida(entradas2, cantSaliente);
                else this.msj.mensajeError(`Error`, `Error al actualizar movimiento de entrada de materia prima`);
              }
            }
          });
        }
      }, error => { this.msj.mensajeError(`Error`, `Error al obtener los movimientos de entrada de materia prima`); });
    }
  }

  //Función que creará registros en la tabla movimientos entradas de materia prima cuando se actualice la cantidad de una materia prima.
  crearMovEntrada(mp1: number, mp2: number, mp3: number, cantidad: number) {
    let entrada: modeloMovimientos_Entradas_MP = {
      MatPri_Id: mp1,
      Tinta_Id: mp2,
      Bopp_Id: mp3,
      Cantidad_Entrada: (cantidad - this.materialSeleccionado.Cant),
      UndMed_Id: 'Kg',
      Precio_RealUnitario: this.FormEdicionMateriaPrima.value.Precio,
      Tipo_Entrada: 'AJUSTEMP',
      Codigo_Entrada: mp3 != 1 ? this.materialSeleccionado.Id2 : 1,
      Estado_Id: 19,
      Cantidad_Asignada: 0,
      Cantidad_Disponible: (cantidad - this.materialSeleccionado.Cant),
      Observacion: 'Ajuste de entrada por inventario de materia prima',
      Fecha_Entrada: this.today,
      Hora_Entrada: this.hora,
      Precio_EstandarUnitario: this.FormEdicionMateriaPrima.value.PrecioEstandar,
    }
    this.srvMovEntradasMP.Post(entrada).subscribe(data => { }, error => { this.msj.mensajeError(`Error`, `Error al crear movimiento de entrada de materia prima`) });
  }

  //Función que creará registros en la tabla entradas salidas de materia prima cuando se actualice la cantidad de una materia prima.
  crearMovSalida(entradas2: any, cantSaliente: number) {
    let salida: modelEntradas_Salidas_MP = {
      Id: 0,
      Id_Entrada: entradas2.Id,
      Tipo_Salida: 'AJUSTEMP',
      Codigo_Salida: 1,
      Tipo_Entrada: entradas2.Tipo_Entrada,
      Codigo_Entrada: entradas2.Codigo_Entrada,
      Fecha_Registro: this.today,
      Hora_Registro: this.hora,
      MatPri_Id: entradas2.MatPri_Id,
      Tinta_Id: entradas2.Tinta_Id,
      Bopp_Id: entradas2.Bopp_Id,
      Cantidad_Salida: cantSaliente,
      Orden_Trabajo: 0,
      Prod_Id: 1,
      Cant_PedidaOT: 0,
      UndMed_Id: 'N/E',
    }
    this.srvSalidasMP.Post(salida).subscribe(data => { }, error => console.log(error));
  }
}
