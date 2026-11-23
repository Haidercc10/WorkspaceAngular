import { HttpErrorResponse } from '@angular/common/http';
import { Component, Injectable, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription, catchError, concatMap, finalize, forkJoin, from, map, of, retry, switchMap, throwError, timer, toArray } from 'rxjs';
import { ArticuloZeus, CapaLaminadoItem, CrearItemDto, FichaItem, ItemBusqueda, ItemDuplicado, MezclaPredefinida, PresentacionBagPro, PresentacionItem, TintaBagPro, ValidacionItem } from 'src/app/Modelo/modelCrearItem';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { FormatosService } from 'src/app/Servicios/Formato/Formatos.service';
import { Laminado_CapaService } from 'src/app/Servicios/LaminadoCapa/Laminado_Capa.service';
import { MaterialProductoService } from 'src/app/Servicios/MaterialProducto/materialProducto.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { PigmentoProductoService } from 'src/app/Servicios/PigmentosProductos/pigmentoProducto.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { ExistenciasProductosService } from 'src/app/Servicios/ExistenciasProductos/existencias-productos.service';
import { Tipos_ImpresionService } from 'src/app/Servicios/TipoImpresion/Tipos_Impresion.service';
import { TipoProductoService } from 'src/app/Servicios/TipoProducto/tipo-producto.service';
import { TiposSelladoService } from 'src/app/Servicios/TiposSellado/TiposSellado.service';
import { TratadoService } from 'src/app/Servicios/Tratado/Tratado.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { AppComponent } from 'src/app/app.component';
import { alCambiarTema } from 'src/app/Servicios/Tema/Tema.service';
import { TutorialesService } from 'src/app/Servicios/Tutoriales/Tutoriales.service';
import { ClaveTutorialCrearItem, pasosTutorialCrearItem } from 'src/app/Tutoriales/Tutoriales_CrearItem';

/** Roles que pueden crear items y completar su sincronización (igual que crear/editar OT). */
const ROLES_CREAR_ITEM: readonly number[] = [1, 98];

/**
 * Tipo de producto de Plasticaribe (TpProd_Id) → formato de producto terminado de BagPro (PtFormatopt).
 * Es el inverso del mapeo de TR_CreacionProductosEnPBDD (BagPro → Plasticaribe).
 */
const TIPO_PRODUCTO_A_FORMATO_BAGPRO: Readonly<Record<number, number>> = { 7: 1, 4: 2, 2: 3, 1: 4, 8: 5, 3: 6, 6: 7, 5: 8 };

/** Formatos de BagPro que exigen largo: bolsa (3), hoja (5), camisilla (6) y precorte (7). */
const FORMATOS_CON_LARGO: readonly number[] = [3, 5, 6, 7];

/** Formato de BagPro camisilla: se nombra como BIODEGRADABLE con talla, línea y tipo. */
const FORMATO_CAMISILLA = 6;

/** Opciones del nombre de las camisillas biodegradables. */
const TALLAS_BIO = ['T0.5', 'T1.0', 'T1.5', 'T2.0', 'T2.5', 'T3.0'];
const LINEAS_BIO = ['ECO', 'ESPECIAL'];
const TIPOS_BIO = ['ARROZ', 'AZUCAR'];
const CANTIDADES_BIO = ['X 70', 'X 80'];

/** Formato de BagPro "sin formato": no se incluye en el nombre sugerido. */
const FORMATOS_SIN_NOMBRE: readonly number[] = [1, 9];

/** Unidades de extrusión de BagPro (ExtUnidades), como las asigna TR_ActualizarCampos_OTExtrusion. */
const UNIDADES_BAGPRO = [
  { codigo: 2, nombre: 'Cms' },
  { codigo: 3, nombre: 'Plgs' },
];

/** Secciones del formulario que dependen de un proceso; General y Nombre siempre están activas. */
type SeccionProceso = 'extrusion' | 'impresion' | 'laminado' | 'selladoCorte';

/** Campos de cada sección de proceso: se deshabilitan (y no se envían) si el proceso no está marcado. */
const CAMPOS_SECCION: Readonly<Record<SeccionProceso, readonly string[]>> = {
  extrusion: ['calibre', 'formatoExtrusion', 'tratado', 'anchoExtrusion1', 'anchoExtrusion2', 'anchoExtrusion3'],
  impresion: ['tipoImpresion', 'tintas', 'rodillo', 'pista', 'cyrel', 'descripcionComercial', 'gramaje'],
  laminado: [1, 2, 3].flatMap(n => [`capa${n}`, `calibreCapa${n}`, `cantidadCapa${n}`]),
  selladoCorte: ['tipoSellado', 'cantidadBulto', 'pesoMillar', 'peso', 'perforacion'],
};

/** Presentación de BagPro → presentación del artículo en Zeus. */
const PRESENTACION_ZEUS: Readonly<Record<string, string>> = { Kilo: 'KLS', Unidad: 'UND', Paquete: 'PAQ', MTS: 'MTS' };

/** Intentos y espera para encontrar en Plasticaribe el producto que crea el trigger de BagPro. */
const REINTENTOS_PRODUCTO = 5;
const ESPERA_PRODUCTO_MS = 1500;

/** Estado de un paso del guardado. */
type EstadoPaso = 'pendiente' | 'proceso' | 'ok' | 'error' | 'advertencia';

/** Paso del guardado que se muestra al usuario. */
interface PasoGuardado {
  titulo: string;
  estado: EstadoPaso;
  detalle?: string;
}

/** Estado de sincronización de un item en BagPro, Plasticaribe y Zeus. */
interface EstadoSincronizacion {
  codigo: number;
  presentacionesBagPro: PresentacionBagPro[] | null;
  errorBagPro?: string;
  existePlasticaribe: boolean | null;
  productoPlasticaribe?: any;
  errorPlasticaribe?: string;
  articulosZeus: ArticuloZeus[] | null;
  errorZeus?: string;
}

/** Fila de la tabla de sincronización: un registro (o un faltante) de BagPro, Plasticaribe o Zeus. */
interface FilaSync {
  sistema: 'BagPro' | 'Plasticaribe' | 'Zeus';
  existe: boolean;
  codigo: string;
  nombre: string;
  descripcion: string;
  presentacion: string;
  precio: number | null;
  costo: number | null;
  cliente: string;
  tipoProducto: string;
  estado: string;
  grupo: string;
  grupoFacturacion: string;
  nombreDifiere: boolean;
}

/** Estado de la card de un sistema: al día, con presentaciones faltantes, sin el item o sin respuesta. */
type EstadoTarjeta = 'ok' | 'parcial' | 'falta' | 'error';

/** Card de un sistema en el panel de sincronización. */
interface TarjetaSync {
  sistema: FilaSync['sistema'];
  icono: string;
  estado: EstadoTarjeta;
  etiqueta: string;
  nombre: string;
  descripcion: string;
  nombreDifiere: boolean;
  datos: { etiqueta: string, valor: string }[];
  chips: { presentacion: string, precio: number | null, costo: number | null, existe: boolean }[];
  error?: string;
}

/** Icono de cada sistema en las cards de sincronización. */
const ICONO_SISTEMA: Readonly<Record<FilaSync['sistema'], string>> = { BagPro: 'pi pi-briefcase', Plasticaribe: 'pi pi-box', Zeus: 'pi pi-server' };

/** Texto del estado de cada card. */
const ETIQUETA_TARJETA: Readonly<Record<EstadoTarjeta, string>> = { ok: 'Al día', parcial: 'Incompleto', falta: 'No existe', error: 'Sin respuesta' };

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-crear-producto',
  templateUrl: './crear-producto.component.html',
  styleUrls: ['./crear-producto.component.css']
})
export class CrearProductoComponent implements OnInit, OnDestroy {

  /** true cuando la vista se abre embebida (modal de Pedido Externo): oculta el título de página y el card. */
  @Input() embebido: boolean = false;

  ValidarRol: any; //Rol del usuario en sesión
  modoSeleccionado: boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  private readonly suscripcionTema = alCambiarTema(oscuro => this.modoSeleccionado = oscuro); // mantiene modoSeleccionado al día con el tema
  private suscripcionNombre?: Subscription;

  formItem: FormGroup; //Ficha técnica del item
  busquedaCopia = new FormControl<any>(null); //Item (o código escrito) del que se copia la ficha
  busquedaSync = new FormControl<any>(null); //Item (o código escrito) del panel de sincronización
  itemsSugeridos: ItemBusqueda[] = []; //Resultados del autocompletado de items
  formPresentacion: FormGroup; //Presentación nueva para un item existente

  clientesSugeridos: any[] = [];
  vendedores: any[] = [];
  formatos: { codigo: number, nombre: string }[] = [];
  materiales: any[] = [];
  pigmentos: any[] = [];
  tratados: any[] = [];
  formatosExtrusion: any[] = [];
  tiposImpresion: any[] = [];
  capasLaminado: any[] = [];
  tiposSellado: any[] = [];
  tiposProducto: any[] = [];
  estados: any[] = [];
  unidades = [...UNIDADES_BAGPRO];
  presentaciones: { valor: PresentacionItem, nombre: string }[] = [
    { valor: 'Kilo', nombre: 'Kilo' },
    { valor: 'Unidad', nombre: 'Unidad' },
    { valor: 'Paquete', nombre: 'Paquete' },
    { valor: 'MTS', nombre: 'Metros' },
  ];

  nombreManual: boolean = false; //true cuando el usuario editó el nombre a mano: deja de recalcularse
  mezclas: MezclaPredefinida[] = []; //Mezclas predefinidas de BagPro (bpMezclasPreDef)
  tintas: TintaBagPro[] = []; //Tintas de impresión de BagPro
  itemCopiado: number | null = null;

  guardando: boolean = false;
  copiando: boolean = false;
  pasos: PasoGuardado[] = [];

  consultandoSync: boolean = false;
  completando: boolean = false;
  agregandoPresentacion: boolean = false;
  estadoSync: EstadoSincronizacion | null = null;
  resultadosSync: PasoGuardado[] = [];
  tarjetasSync: TarjetaSync[] = [];
  tabActiva: number = 0; //Pestaña visible (0 Crear Item, 1 Estado de Sincronización)
  ultimoCodigo: number | null = null; //Código del último item creado, para abrirlo en Estado de Sincronización

  /** Procesos de la ficha, en el orden de producción, con su control e icono. */
  readonly tallasBio = TALLAS_BIO.map(t => ({ valor: t, nombre: `${t} KG` }));
  readonly lineasBio = LINEAS_BIO.map(l => ({ valor: l, nombre: l == 'ECO' ? 'Eco' : 'Especial' }));
  readonly tiposBio = TIPOS_BIO.map(t => ({ valor: t, nombre: t == 'ARROZ' ? 'Arroz' : 'Azúcar' }));
  readonly cantidadesBio = [...CANTIDADES_BIO];

  readonly procesosItem = [
    { control: 'extrusion', nombre: 'Extrusión', icono: 'pi pi-sliders-h' },
    { control: 'impresion', nombre: 'Impresión', icono: 'pi pi-print' },
    { control: 'laminado', nombre: 'Laminado', icono: 'pi pi-clone' },
    { control: 'sellado', nombre: 'Sellado', icono: 'pi pi-inbox' },
    { control: 'corte', nombre: 'Corte', icono: 'pi pi-th-large' },
  ];

  constructor(private frmBuilder: FormBuilder,
    private AppComponent: AppComponent,
    private bagProService: BagproService,
    private productoService: ProductoService,
    private usuarioService: UsuarioService,
    private tipoProductoService: TipoProductoService,
    private materialService: MaterialProductoService,
    private pigmentoService: PigmentoProductoService,
    private tratadoService: TratadoService,
    private formatoService: FormatosService,
    private tiposImpresionService: Tipos_ImpresionService,
    private laminadoCapaService: Laminado_CapaService,
    private tipoSelladoService: TiposSelladoService,
    private estadosService: EstadosService,
    private existenciasService: ExistenciasProductosService,
    private msj: MensajesAplicacionService,
    private tutoriales: TutorialesService,) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;

    this.formItem = this.frmBuilder.group({
      // General
      cliente: [null, Validators.required],
      vendedor: [null],
      formato: [null, Validators.required],
      material: [null, Validators.required],
      mezcla: [null, Validators.required],
      pigmento: [null],
      presentacion: [null, Validators.required],
      precio: [null, [Validators.required, Validators.min(0.01)]],
      cantidadPaquete: [null],
      unidad: [2, Validators.required],
      ancho: [null, [Validators.required, Validators.min(0.01)]],
      largo: [null],
      fuelle: [null],
      // Camisilla biodegradable: solo arman el nombre sugerido, no se envían a BagPro
      bioTalla: [null],
      bioLinea: [null],
      bioTipo: [null],
      bioCantidad: [null],
      nombre: [null, [Validators.required, Validators.minLength(3)]],
      observacion: [null],
      // Extrusión
      extrusion: [true],
      calibre: [null, [Validators.required, Validators.min(0.01)]],
      formatoExtrusion: [null],
      tratado: [null],
      anchoExtrusion1: [null],
      anchoExtrusion2: [null],
      anchoExtrusion3: [null],
      // Impresión
      impresion: [false],
      tipoImpresion: [{ value: null, disabled: true }],
      rodillo: [{ value: null, disabled: true }],
      pista: [{ value: null, disabled: true }],
      cyrel: [{ value: false, disabled: true }],
      descripcionComercial: [{ value: null, disabled: true }],
      gramaje: [{ value: null, disabled: true }],
      tintas: [{ value: [], disabled: true }],
      // Laminado
      laminado: [false],
      capa1: [{ value: null, disabled: true }], calibreCapa1: [{ value: null, disabled: true }], cantidadCapa1: [{ value: null, disabled: true }],
      capa2: [{ value: null, disabled: true }], calibreCapa2: [{ value: null, disabled: true }], cantidadCapa2: [{ value: null, disabled: true }],
      capa3: [{ value: null, disabled: true }], calibreCapa3: [{ value: null, disabled: true }], cantidadCapa3: [{ value: null, disabled: true }],
      // Sellado / Corte
      sellado: [false],
      corte: [false],
      tipoSellado: [{ value: null, disabled: true }],
      cantidadBulto: [{ value: null, disabled: true }],
      pesoMillar: [{ value: null, disabled: true }],
      peso: [{ value: null, disabled: true }],
      perforacion: [{ value: null, disabled: true }],
    });

    this.formPresentacion = this.frmBuilder.group({
      presentacion: [null, Validators.required],
      precio: [null, [Validators.required, Validators.min(0.01)]],
    });
  }

  ngOnInit(): void {
    this.ValidarRol = this.AppComponent.storage_Rol;
    if (!this.puedeCrearItems) return;
    this.cargarCatalogos();
    ['extrusion', 'impresion', 'laminado', 'sellado', 'corte']
      .forEach(proceso => this.formItem.get(proceso)?.valueChanges.subscribe(() => this.aplicarProcesos()));
    this.aplicarProcesos();
    // La sugerencia se escribe sin emitir eventos: cualquier cambio emitido por el campo nombre es del usuario
    this.formItem.get('nombre')?.valueChanges.subscribe(() => this.marcarNombreManual());
    this.suscripcionNombre = this.formItem.valueChanges.subscribe(() => this.recalcularNombre());
    // La primera vez que el usuario entra se muestra el tutorial (no dentro del modal de Pedido Externo)
    if (!this.embebido) this.tutoriales.iniciarPrimeraVez(ClaveTutorialCrearItem, this.AppComponent.storage_Id, () => this.pasosTutorial(), 1000);
  }

  /** Muestra el tutorial de la página (botón "i" junto al título). */
  tutorial = () => this.tutoriales.iniciar(this.pasosTutorial());

  private pasosTutorial = () => pasosTutorialCrearItem({ irPestana: indice => this.tabActiva = indice });

  ngOnDestroy(): void {
    this.tutoriales.cancelar(); // que no quede encima de otra página
    this.suscripcionNombre?.unsubscribe();
  }

  /** Indica si el rol del usuario puede crear items (`ROLES_CREAR_ITEM`); la vista se oculta si no puede. */
  get puedeCrearItems(): boolean {
    return ROLES_CREAR_ITEM.includes(Number(this.ValidarRol));
  }

  /** Indica si el formato elegido exige largo (bolsa, camisilla, precorte u hoja). */
  get requiereLargo(): boolean {
    return FORMATOS_CON_LARGO.includes(Number(this.formItem.get('formato')?.value));
  }

  /** Indica si el formato elegido es camisilla (se nombra como biodegradable). */
  get esBiodegradable(): boolean {
    return Number(this.formItem.get('formato')?.value) == FORMATO_CAMISILLA;
  }

  /**
   * Tres colores para el arte de impresión del dibujo de la bolsa: los de las tintas elegidas (repetidos si son
   * menos de tres) o una paleta por defecto si aún no hay tintas con color.
   */
  get coloresImpresion(): string[] {
    const elegidas: number[] = this.formItem.get('tintas')?.value ?? [];
    const colores = elegidas.map(id => this.tintas.find(t => t.id == id)?.color).filter((c): c is string => !!c);
    const base = colores.length ? colores : ['#C62828', '#1565C0', '#F9A825'];
    return [0, 1, 2].map(i => base[i % base.length]);
  }

  /** Tintas elegidas, en el orden de selección, para pintar los chips del campo con su color. */
  get tintasElegidas(): TintaBagPro[] {
    const elegidas: number[] = this.formItem.get('tintas')?.value ?? [];
    return elegidas.map(id => this.tintas.find(t => t.id == id)).filter((t): t is TintaBagPro => !!t);
  }

  /** Texto claro u oscuro según la luminosidad del color de la tinta, para que el nombre se lea sobre el chip. */
  textoSobreTinta(color?: string | null): string {
    if (!color) return 'var(--text-color)';
    const r = parseInt(color.substring(1, 3), 16), g = parseInt(color.substring(3, 5), 16), b = parseInt(color.substring(5, 7), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) > 160 ? 'var(--gris-800)' : 'var(--gris-100)';
  }

  /** Item elegido en la barra de copiar; mientras exista, el campo queda bloqueado hasta quitarlo con la X. */
  get itemCopiaElegido(): { codigo: number, etiqueta?: string } | null {
    const v = this.busquedaCopia.value;
    return v && typeof v == 'object' && Number(v.codigo) > 0 ? v : null;
  }

  /**
   * Quita el item elegido en la barra de copiar y borra toda la ficha para empezar de nuevo.
   * @returns No retorna un valor.
   */
  quitarItemCopia() {
    this.limpiarFormulario();
    this.itemsSugeridos = [];
  }

  /** Indica si la presentación elegida es Paquete (exige unidades por paquete). */
  get esPaquete(): boolean {
    return this.formItem.get('presentacion')?.value == 'Paquete';
  }

  /**
   * Indica si un proceso está marcado en la ficha.
   * @param control Control del proceso (extrusion, impresion, laminado, sellado, corte).
   * @returns true si el proceso está activo.
   */
  procesoActivo(control: string): boolean {
    return !!this.formItem.get(control)?.value;
  }

  /** true si la ficha tiene al menos un proceso marcado. */
  get algunProcesoActivo(): boolean {
    return this.procesosItem.some(p => this.procesoActivo(p.control));
  }

  /**
   * Activa o quita un proceso desde su tarjeta; aplicarProcesos habilita o deshabilita sus campos.
   * @param control Control del proceso.
   * @returns No retorna un valor.
   */
  alternarProceso(control: string) {
    const campo = this.formItem.get(control);
    if (!campo || this.guardando) return;
    campo.setValue(!campo.value);
  }

  /**
   * Texto corto de la tarjeta de un proceso con lo que ya tiene la ficha.
   * @param control Control del proceso.
   * @returns Resumen del proceso o "No aplica" si no está marcado.
   */
  resumenProceso(control: string): string {
    if (!this.procesoActivo(control)) return 'No aplica';
    const v = this.formItem.getRawValue();
    switch (control) {
      case 'extrusion': return Number(v.calibre) > 0 ? `Calibre ${v.calibre}` : 'Falta el calibre';
      case 'impresion': {
        const n = (v.tintas ?? []).length;
        return n > 0 ? `${n} ${n == 1 ? 'tinta' : 'tintas'}` : 'Sin tintas';
      }
      case 'laminado': {
        const n = [v.capa1, v.capa2, v.capa3].filter(c => c).length;
        return n > 0 ? `${n} ${n == 1 ? 'capa' : 'capas'}` : 'Sin capas';
      }
      case 'sellado': return this.tiposSellado.find(t => t.tpSellado_Id == v.tipoSellado)?.tpSellados_Nombre ?? 'Sin tipo de sellado';
      default: return 'Con corte';
    }
  }

  /** Campos obligatorios o reglas que faltan en la ficha (las mismas que valida Crear). */
  get pendientes(): string[] {
    return this.validarFicha();
  }

  /** Nombre de la unidad de medida elegida, para el resumen. */
  get nombreUnidad(): string {
    return this.unidades.find(u => u.codigo == this.formItem.get('unidad')?.value)?.nombre ?? '';
  }

  /**
   * Estado general del resultado de la creación.
   * @returns Estado y texto para la etiqueta.
   */
  get resumenPasos(): { estado: 'ok' | 'proceso' | 'error', texto: string } {
    if (this.pasos.some(p => p.estado == 'proceso' || p.estado == 'pendiente') && this.guardando) return { estado: 'proceso', texto: 'Creando...' };
    if (this.pasos.some(p => p.estado == 'error')) return { estado: 'error', texto: 'Con pendientes' };
    return { estado: 'ok', texto: 'Item creado' };
  }

  /** Presentaciones de BagPro del item que aún no tienen artículo en Zeus. */
  get faltantesZeus(): PresentacionBagPro[] {
    return this.estadoSync ? this.faltantesZeusDe(this.estadoSync) : [];
  }

  /** Presentaciones Zeus faltantes, separadas por coma, para mostrarlas en el panel. */
  get faltantesZeusTexto(): string {
    return this.faltantesZeus.map(p => this.presentacionZeus(p.presentacion)).join(', ');
  }

  /**
   * Carga los catálogos de Plasticaribe cuyos códigos coinciden con los de BagPro (material, pigmento, tratado,
   * formato de extrusión, tipo de impresión, capas de laminado y tipo de sellado), los vendedores y los formatos
   * de producto terminado (tipo de producto convertido al código PtFormatopt de BagPro). También los tipos de producto
   * y estados de Plasticaribe para mostrar sus nombres en el estado de sincronización.
   * @returns No retorna un valor.
   */
  cargarCatalogos() {
    this.usuarioService.GetVendedores().subscribe(data => this.vendedores = (data ?? []).sort((a: any, b: any) => a.usua_Nombre.localeCompare(b.usua_Nombre)));
    this.estadosService.srvObtenerListaEstados().subscribe(data => this.estados = data ?? []);
    this.tipoProductoService.srvObtenerLista().subscribe(data => {
      this.tiposProducto = data ?? [];
      const formatos: { codigo: number, nombre: string }[] = [];
      (data ?? []).forEach(tp => {
        const codigo = TIPO_PRODUCTO_A_FORMATO_BAGPRO[tp.tpProd_Id];
        if (codigo && !formatos.some(f => f.codigo == codigo)) formatos.push({ codigo, nombre: tp.tpProd_Nombre });
      });
      this.formatos = formatos.sort((a, b) => a.nombre.localeCompare(b.nombre));
    });
    this.materialService.srvObtenerLista().subscribe(data => this.materiales = data ?? []);
    this.pigmentoService.srvObtenerLista().subscribe(data => this.pigmentos = data ?? []);
    this.tratadoService.srvObtenerLista().subscribe(data => this.tratados = data ?? []);
    this.formatoService.srvObtenerLista().subscribe(data => this.formatosExtrusion = data ?? []);
    this.tiposImpresionService.srvObtenerLista().subscribe(data => this.tiposImpresion = data ?? []);
    this.laminadoCapaService.srvObtenerLista().subscribe(data => this.capasLaminado = data ?? []);
    this.tipoSelladoService.srvObtenerLista().subscribe(data => this.tiposSellado = data ?? []);
    this.bagProService.GetMezclasPredefinidas().subscribe({
      next: data => this.mezclas = data ?? [],
      error: (error: HttpErrorResponse) => this.msj.mensajeError('No fue posible cargar las mezclas de BagPro', this.detalleError(error)),
    });
    this.bagProService.GetTintasItem().subscribe({
      next: data => this.tintas = data ?? [],
      error: (error: HttpErrorResponse) => this.msj.mensajeError('No fue posible cargar las tintas de BagPro', this.detalleError(error)),
    });
  }

  /**
   * Busca clientes de BagPro por nombre comercial; solo se ofrecen los que tienen código BagPro numérico.
   * @param evento Evento del autocompletado con el texto escrito (`query`).
   * @returns No retorna un valor.
   */
  buscarClientes(evento: any) {
    const texto = (evento?.query ?? '').trim();
    if (texto.length < 3) { this.clientesSugeridos = []; return; }
    this.bagProService.GetClientesNombre(texto).subscribe({
      next: data => this.clientesSugeridos = (data ?? []).filter((c: any) => Number(c.codBagpro) > 0),
      error: (error: HttpErrorResponse) => this.msj.mensajeError('No fue posible consultar los clientes', this.detalleError(error)),
    });
  }

  /**
   * Indica si una sección de proceso está activa según los checks del formulario
   * (Sellado/Corte se activa con cualquiera de los dos procesos).
   * @param seccion Sección del formulario.
   * @returns true si el proceso de la sección está marcado.
   */
  seccionActiva(seccion: SeccionProceso): boolean {
    const v = this.formItem.getRawValue();
    return seccion == 'selladoCorte' ? !!(v.sellado || v.corte) : !!v[seccion];
  }

  /**
   * Habilita los campos (y sus validaciones) de las secciones cuyo proceso está marcado y deshabilita los demás.
   * La vista contrae las secciones inactivas.
   * @returns No retorna un valor.
   */
  aplicarProcesos() {
    (Object.keys(CAMPOS_SECCION) as SeccionProceso[]).forEach(seccion => {
      const activa = this.seccionActiva(seccion);
      CAMPOS_SECCION[seccion].forEach(campo => activa
        ? this.formItem.get(campo)?.enable({ emitEvent: false })
        : this.formItem.get(campo)?.disable({ emitEvent: false }));
    });
  }

  /**
   * Marca el nombre como editado a mano: deja de recalcularse hasta que se pulse "Sugerir".
   * @returns No retorna un valor.
   */
  marcarNombreManual() {
    this.nombreManual = true;
  }

  /**
   * Pone el nombre sugerido y vuelve a recalcularlo mientras el usuario no lo edite.
   * @returns No retorna un valor.
   */
  sugerirNombre() {
    this.nombreManual = false;
    this.recalcularNombre();
  }

  /**
   * Actualiza el nombre con la sugerencia si el usuario no lo ha editado a mano.
   * @returns No retorna un valor.
   */
  recalcularNombre() {
    if (this.nombreManual) return;
    const sugerido = this.construirNombreSugerido();
    if (sugerido != (this.formItem.get('nombre')?.value ?? '')) this.formItem.patchValue({ nombre: sugerido }, { emitEvent: false });
  }

  /**
   * Arma el nombre sugerido en mayúsculas, omitiendo las partes vacías.
   * Sin impresión: `FORMATO MATERIAL ANCHO[+F+F] X LARGO unidad CAL x.x [perforación] BAJA|ALTA NAT|pigmento`
   * (unidad `CMS` para centímetros y `"` para pulgadas).
   * Con impresión: `FORMATO MATERIAL descripción comercial gramaje ANCHO CMS` (ancho convertido a centímetros).
   * @returns El nombre sugerido.
   */
  construirNombreSugerido(): string {
    const v = this.formItem.getRawValue();
    const formato = FORMATOS_SIN_NOMBRE.includes(Number(v.formato)) ? '' : (this.formatos.find(f => f.codigo == v.formato)?.nombre ?? '');
    const material = this.materiales.find(m => m.material_Id == v.material)?.material_Nombre ?? '';
    const ancho = Number(v.ancho) || 0;
    const pulgadas = this.unidades.find(u => u.codigo == v.unidad)?.nombre == 'Plgs';
    let partes: string[];

    if (this.esBiodegradable) return this.nombreBiodegradable(v, material, ancho);

    if (v.impresion) {
      const anchoCms = pulgadas ? Math.round(ancho * 2.54 * 10) / 10 : ancho;
      partes = [formato, material, v.descripcionComercial, v.gramaje, anchoCms > 0 ? `${this.numero(anchoCms)} CMS` : ''];
    } else {
      const largo = Number(v.largo) || 0;
      const fuelle = Number(v.fuelle) || 0;
      const calibre = v.extrusion ? (Number(v.calibre) || 0) : 0;
      let medida = '';
      if (ancho > 0) {
        medida = this.numero(ancho) + (fuelle > 0 ? `+${this.numero(fuelle)}+${this.numero(fuelle)}` : '');
        if (largo > 0) medida += ` X ${this.numero(largo)}`;
        medida += pulgadas ? '"' : ' CMS';
      }
      // La densidad (BAJA/ALTA) va al final; si se deduce del material, el material no se repite al inicio
      const densidad = this.densidad(material);
      partes = [formato, densidad ? '' : material, medida, calibre > 0 ? `CAL ${calibre.toFixed(1)}` : '', (v.sellado || v.corte) ? v.perforacion : '', densidad, this.nombrePigmento(v.pigmento)];
    }
    return this.unirPartes(partes);
  }

  /**
   * Nombre de una camisilla biodegradable, como los nombra el área comercial:
   * con talla `BIODEGRADABLE [ARROZ|AZUCAR] T2.0 KG [ECO|ESPECIAL] pigmento`;
   * sin talla `BIODEGRADABLE [ARROZ|AZUCAR] ANCHO X LARGO BAJA|ALTA [ECO|ESPECIAL] pigmento`.
   * @param v Valores del formulario.
   * @param material Nombre del material.
   * @param ancho Ancho de la ficha.
   * @returns El nombre sugerido.
   */
  private nombreBiodegradable(v: any, material: string, ancho: number): string {
    let cuerpo: string[];
    if (v.bioTalla) cuerpo = [`${v.bioTalla} KG`];
    else {
      const largo = Number(v.largo) || 0;
      const medida = ancho > 0 ? this.numero(ancho) + (largo > 0 ? ` X ${this.numero(largo)}` : '') : '';
      cuerpo = [medida, this.densidad(material)];
    }
    return this.unirPartes(['BIODEGRADABLE', v.bioTipo, ...cuerpo, v.bioLinea, this.nombrePigmento(v.pigmento), this.cantidadBio(v.bioCantidad)]);
  }

  /**
   * Cantidad de la camisilla bio para el nombre: elegida (X 70, X 80) o escrita por el usuario; si escribe solo
   * el número se antepone "X " (70 → X 70).
   * @param valor Valor del combo editable.
   * @returns Texto de la cantidad o vacío.
   */
  private cantidadBio(valor: any): string {
    const texto = (valor ?? '').toString().trim().toUpperCase();
    if (!texto) return '';
    return /^\d+$/.test(texto) ? `X ${texto}` : texto;
  }

  /**
   * Une las partes del nombre en mayúsculas, omitiendo las vacías.
   * @param partes Partes del nombre.
   * @returns Nombre unido con un espacio.
   */
  private unirPartes(partes: any[]): string {
    return partes.map(p => (p ?? '').toString().trim()).filter(p => p != '').join(' ').replace(/\s+/g, ' ').toUpperCase();
  }

  /**
   * Infiere la densidad del material para el nombre: PEBD → BAJA, PEAD → ALTA.
   * @param material Nombre del material.
   * @returns `BAJA`, `ALTA` o vacío si no se puede inferir.
   */
  private densidad(material: string): string {
    const m = (material ?? '').toUpperCase();
    if (m.includes('PEBD') || m.includes('LDPE') || m.includes('BAJA')) return 'BAJA';
    if (m.includes('PEAD') || m.includes('HDPE') || m.includes('ALTA')) return 'ALTA';
    return '';
  }

  /**
   * Nombre del pigmento para el nombre del item: `NAT` si es natural, si no el nombre del pigmento.
   * @param pigmento Código del pigmento.
   * @returns Texto del pigmento o vacío si no hay pigmento.
   */
  private nombrePigmento(pigmento: any): string {
    const nombre = (this.pigmentos.find(p => p.pigmt_Id == pigmento)?.pigmt_Nombre ?? '').trim().toUpperCase();
    if (!nombre || nombre == 'NO APLICA') return '';
    return nombre.startsWith('NATURAL') || nombre == 'NAT' ? 'NAT' : nombre;
  }

  /**
   * Formatea una medida sin ceros sobrantes (12.50 → 12.5, 15.00 → 15).
   * @param valor Medida.
   * @returns Texto de la medida con máximo dos decimales.
   */
  private numero(valor: number): string {
    return String(Math.round(valor * 100) / 100);
  }

  /**
   * Consulta la ficha técnica de un item de BagPro y la carga en el formulario; deja vacío el nombre y
   * carga presentación y precio para que el usuario los revise y cambie.
   * @returns No retorna un valor.
   */
  /** Al elegir un item del autocompletado, deja el foco en él para que con Enter se copie la ficha. */
  enfocarItemElegido() {
    setTimeout(() => document.getElementById('itemElegidoCopia')?.focus());
  }

  /** Enter en el buscador: copia la ficha si se digitó un código (sin elegirlo de la lista). */
  copiarCodigoDigitado() {
    if (typeof this.busquedaCopia.value == 'string' && !this.copiando && !this.guardando) this.copiarDesdeItem();
  }

  copiarDesdeItem() {
    const codigo = this.codigoDe(this.busquedaCopia.value);
    if (!(codigo > 0)) { this.msj.mensajeAdvertencia('Advertencia', 'Busque el item a copiar por nombre o digite su código.'); return; }
    this.copiando = true;
    this.bagProService.GetFichaItem(codigo).pipe(finalize(() => this.copiando = false)).subscribe({
      next: ficha => {
        this.cargarFicha(ficha);
        // Deja el item elegido bloqueado en la barra (se cambia con la X)
        if (!this.itemCopiaElegido) this.busquedaCopia.setValue({ codigo, nombre: ficha.nombre ?? '', etiqueta: `${codigo}${ficha.nombre ? ' - ' + ficha.nombre : ''}` });
        this.msj.mensajeInformacion(`Ficha del item ${codigo} copiada`, 'Revise la presentación y el precio y defina el nombre (puede usar "Sugerir").', 5000);
      },
      error: (error: HttpErrorResponse) => error.status == 404
        ? this.msj.mensajeAdvertencia(`El item ${codigo} no existe en BagPro`)
        : this.msj.mensajeError(`No fue posible consultar el item ${codigo}`, this.detalleError(error)),
    });
  }

  /**
   * Llena el formulario con la ficha de BagPro. Los catálogos que no estén en las listas se agregan con el nombre
   * que trae la ficha para no perder el dato. Rotograbado (descontinuado) se carga como impresión.
   * @param ficha Ficha del item consultado.
   * @returns No retorna un valor.
   */
  cargarFicha(ficha: FichaItem) {
    if (ficha.formato && !this.formatos.some(f => f.codigo == ficha.formato)) this.formatos = [...this.formatos, { codigo: ficha.formato, nombre: ficha.formatoNom || `Formato ${ficha.formato}` }];
    if (ficha.unidad && !this.unidades.some(u => u.codigo == ficha.unidad)) this.unidades = [...this.unidades, { codigo: ficha.unidad, nombre: ficha.unidadNom || `Unidad ${ficha.unidad}` }];
    const vendedor = Number(ficha.vendedor);
    const capas = ficha.capasLaminado ?? [];
    const tintas = (ficha.tintas ?? []).slice(0, 8);
    // Tintas o mezcla que ya no estén en los catálogos se agregan con su código para no perder el dato.
    const tintasFaltantes = tintas.filter(t => !this.tintas.some(x => x.id == t)).map(t => ({ id: t, nombre: `Tinta ${t}` }));
    if (tintasFaltantes.length) this.tintas = [...this.tintas, ...tintasFaltantes];
    if (ficha.mezcla && !this.mezclas.some(m => m.item == ficha.mezcla)) this.mezclas = [...this.mezclas, { item: ficha.mezcla, nombre: ficha.mezclaNom || `Mezcla ${ficha.mezcla}`, capas: null }];
    this.itemCopiado = ficha.clienteItems;

    this.formItem.patchValue({
      cliente: ficha.cliente ? { codBagpro: String(ficha.cliente), nombreComercial: ficha.clienteNom } : null,
      vendedor: vendedor > 0 ? vendedor : null,
      formato: ficha.formato ?? null,
      material: ficha.material ?? null,
      mezcla: ficha.mezcla ?? null,
      pigmento: ficha.pigmento ?? null,
      // Presentación y precio del item copiado: quedan como punto de partida para que el usuario los cambie
      presentacion: this.presentacionDe(ficha.presentacion),
      precio: Number(ficha.precio) > 0 ? Number(ficha.precio) : null,
      cantidadPaquete: ficha.cantidadPaquete ?? null,
      unidad: ficha.unidad ?? 2,
      ancho: ficha.ancho || null,
      largo: ficha.largo || null,
      fuelle: ficha.fuelle || null,
      observacion: ficha.observacion ?? null,
      extrusion: ficha.extrusion ?? true,
      calibre: ficha.calibre || null,
      formatoExtrusion: ficha.formatoExtrusion ?? null,
      tratado: ficha.tratado ?? null,
      anchoExtrusion1: ficha.anchoExtrusion1 ?? null,
      anchoExtrusion2: ficha.anchoExtrusion2 ?? null,
      anchoExtrusion3: ficha.anchoExtrusion3 ?? null,
      impresion: !!(ficha.impresion || ficha.rotograbado),
      laminado: !!ficha.laminado,
      sellado: !!ficha.sellado,
      corte: !!ficha.corte,
      tipoSellado: ficha.tipoSellado ?? null,
      cantidadBulto: ficha.cantidadBulto ?? null,
      pesoMillar: ficha.pesoMillar ?? null,
      peso: ficha.peso ?? null,
    }, { emitEvent: false });
    this.aplicarProcesos();
    this.formItem.patchValue({
      tipoImpresion: ficha.tipoImpresion ?? null,
      rodillo: ficha.rodillo ?? null,
      pista: ficha.pista ?? null,
      cyrel: !!ficha.cyrel,
      tintas,
      capa1: capas[0]?.capa ?? null, calibreCapa1: capas[0]?.calibre ?? null, cantidadCapa1: capas[0]?.cantidad ?? null,
      capa2: capas[1]?.capa ?? null, calibreCapa2: capas[1]?.calibre ?? null, cantidadCapa2: capas[1]?.cantidad ?? null,
      capa3: capas[2]?.capa ?? null, calibreCapa3: capas[2]?.calibre ?? null, cantidadCapa3: capas[2]?.cantidad ?? null,
      nombre: null,
      ...this.bioDesdeNombre(Number(ficha.formato) == FORMATO_CAMISILLA ? ficha.nombre : null),
    }, { emitEvent: false });
    if (ficha.rotograbado) this.msj.mensajeAdvertencia('Proceso de Rotograbado', 'El item tenía Rotograbado, que ya no existe; se cargó como Impresión.');
    // El nombre queda vacío: no se recalcula hasta que el usuario pulse "Sugerir" o lo escriba
    this.nombreManual = true;
  }

  /**
   * Convierte el nombre de presentación de BagPro (Kilo, Unidad, Paquete, MTS/Metros) al valor del formulario.
   * @param nombre Presentación de BagPro.
   * @returns Valor de la presentación o null si no se reconoce.
   */
  private presentacionDe(nombre: string | null | undefined): PresentacionItem | null {
    const texto = (nombre ?? '').trim().toUpperCase();
    if (texto.startsWith('MET') || texto == 'MTS') return 'MTS';
    return this.presentaciones.find(p => p.valor.toUpperCase() == texto)?.valor ?? null;
  }

  /**
   * Toma talla, línea y tipo bio del nombre de una camisilla copiada (ej. BIODEGRADABLE ARROZ T2.0 KG ECO ...).
   * @param nombre Nombre del item copiado.
   * @returns Valores de bioTalla, bioLinea y bioTipo (null si no aparecen).
   */
  private bioDesdeNombre(nombre: string | null | undefined): { bioTalla: string | null, bioLinea: string | null, bioTipo: string | null, bioCantidad: string | null } {
    const palabras = (nombre ?? '').toUpperCase().split(/\s+/);
    const cantidad = (nombre ?? '').toUpperCase().match(/\bX\s*(\d+)\s*$/);
    return {
      bioCantidad: cantidad ? `X ${cantidad[1]}` : null,
      bioTalla: palabras.map(p => p.replace(/^T(\d)$/, 'T$1.0')).find(p => TALLAS_BIO.includes(p)) ?? null,
      bioLinea: LINEAS_BIO.find(l => palabras.includes(l)) ?? null,
      bioTipo: TIPOS_BIO.find(t => palabras.includes(t)) ?? null,
    };
  }

  /**
   * Valida la ficha con las reglas de creación: obligatorios del DTO, precio > 0, largo para bolsa/camisilla/
   * precorte/hoja, unidades por paquete para Paquete, calibre con extrusión y sin valores negativos.
   * @returns Lista de errores; vacía si la ficha es válida.
   */
  validarFicha(): string[] {
    const v = this.formItem.getRawValue();
    const errores: string[] = [];
    if (!(Number(v.cliente?.codBagpro) > 0)) errores.push('Seleccione un cliente de la lista.');
    if (!v.formato) errores.push('El formato es obligatorio.');
    if (!v.material) errores.push('El material es obligatorio.');
    if (!v.mezcla) errores.push('La mezcla es obligatoria.');
    if ((v.tintas ?? []).length > 8) errores.push('Máximo 8 tintas.');
    if (!v.unidad) errores.push('La unidad es obligatoria.');
    if (!v.presentacion) errores.push('La presentación es obligatoria.');
    if (!(Number(v.precio) > 0)) errores.push('El precio unitario debe ser mayor que 0.');
    if (!(Number(v.ancho) > 0)) errores.push('El ancho debe ser mayor que 0.');
    if (this.requiereLargo && !(Number(v.largo) > 0)) errores.push('El largo es obligatorio para bolsa, camisilla, precorte u hoja.');
    if (v.presentacion == 'Paquete' && !(Number(v.cantidadPaquete) > 0)) errores.push('La presentación Paquete requiere las unidades por paquete.');
    if (v.extrusion && !(Number(v.calibre) > 0)) errores.push('El calibre debe ser mayor que 0 cuando el item lleva extrusión.');
    if ((v.nombre ?? '').toString().trim().length < 3) errores.push('El nombre es obligatorio (mínimo 3 caracteres).');
    const numericos = ['precio', 'cantidadPaquete', 'ancho', 'largo', 'fuelle', 'calibre', 'anchoExtrusion1', 'anchoExtrusion2', 'anchoExtrusion3',
      'rodillo', 'pista', 'calibreCapa1', 'cantidadCapa1', 'calibreCapa2', 'cantidadCapa2', 'calibreCapa3', 'cantidadCapa3', 'cantidadBulto', 'pesoMillar', 'peso'];
    if (numericos.some(campo => this.formItem.get(campo)?.enabled !== false && Number(v[campo]) < 0)) errores.push('No se permiten valores negativos.');
    return errores;
  }

  /**
   * Arma el DTO de creación con los códigos de BagPro. Vendedor con tres dígitos (como en BagPro); los campos de
   * impresión y laminado solo se envían si el item lleva el proceso.
   * @returns Ficha lista para enviar a BagPro.
   */
  construirDto(): CrearItemDto {
    const v = this.formItem.getRawValue();
    const decimal = (valor: any) => valor === null || valor === undefined || valor === '' ? null : Number(valor);
    const ext = !!v.extrusion;
    const sc = !!(v.sellado || v.corte);
    const capas: CapaLaminadoItem[] = v.laminado
      ? [1, 2, 3].filter(n => Number(v[`capa${n}`]) > 0).map(n => ({ capa: Number(v[`capa${n}`]), calibre: decimal(v[`calibreCapa${n}`]), cantidad: decimal(v[`cantidadCapa${n}`]) }))
      : [];
    return {
      cliente: Number(v.cliente.codBagpro),
      clienteNom: (v.cliente.nombreComercial ?? '').trim(),
      nombre: v.nombre.toString().trim().toUpperCase(),
      formato: Number(v.formato),
      formatoExtrusion: ext ? decimal(v.formatoExtrusion) : null,
      material: Number(v.material),
      mezcla: Number(v.mezcla),
      pigmento: decimal(v.pigmento),
      tratado: ext ? decimal(v.tratado) : null,
      unidad: Number(v.unidad),
      ancho: Number(v.ancho),
      largo: Number(v.largo) || 0,
      fuelle: Number(v.fuelle) || 0,
      calibre: ext ? (Number(v.calibre) || 0) : 0,
      anchoExtrusion1: ext ? decimal(v.anchoExtrusion1) : null,
      anchoExtrusion2: ext ? decimal(v.anchoExtrusion2) : null,
      anchoExtrusion3: ext ? decimal(v.anchoExtrusion3) : null,
      extrusion: !!v.extrusion,
      impresion: !!v.impresion,
      laminado: !!v.laminado,
      rotograbado: false,
      corte: !!v.corte,
      sellado: !!v.sellado,
      cyrel: !!v.impresion && !!v.cyrel,
      tipoImpresion: v.impresion ? decimal(v.tipoImpresion) : null,
      rodillo: v.impresion ? decimal(v.rodillo) : null,
      pista: v.impresion ? decimal(v.pista) : null,
      tintas: v.impresion ? [...(v.tintas ?? [])].slice(0, 8) : [],
      capasLaminado: capas,
      tipoSellado: sc ? decimal(v.tipoSellado) : null,
      cantidadPaquete: decimal(v.cantidadPaquete),
      cantidadBulto: sc ? decimal(v.cantidadBulto) : null,
      pesoMillar: sc ? decimal(v.pesoMillar) : null,
      peso: sc ? decimal(v.peso) : null,
      presentacion: v.presentacion,
      precio: Number(v.precio),
      vendedor: v.vendedor ? String(v.vendedor).padStart(3, '0') : null,
      observacion: (v.observacion ?? '').toString().trim() || null,
    };
  }

  /**
   * Primer paso de Crear: valida la ficha y el nombre duplicado en BagPro y abre la confirmación con el consecutivo
   * estimado y los items con la misma ficha técnica (solo aviso).
   * @returns No retorna un valor.
   */
  guardar() {
    const errores = this.validarFicha();
    if (errores.length > 0) { this.msj.mensajeAdvertencia('Revise la ficha del item', errores.join(' '), 6000); return; }
    const dto = this.construirDto();
    this.pasos = [];
    this.guardando = true;
    this.bagProService.PostValidarDuplicadoItem(dto).pipe(finalize(() => this.guardando = false)).subscribe({
      next: validacion => this.confirmacion = { dto, validacion },
      error: (error: HttpErrorResponse) => this.msj.mensajeError('No se puede crear el item', this.mensajePaso(0, error, 0), 6000),
    });
  }

  /** Datos de la confirmación abierta antes de crear (null si está cerrada). */
  confirmacion: { dto: CrearItemDto, validacion: ValidacionItem } | null = null;

  /** Visibilidad del diálogo de confirmación (cerrarlo cancela la creación). */
  get confirmacionVisible(): boolean { return this.confirmacion != null; }
  set confirmacionVisible(valor: boolean) { if (!valor) this.confirmacion = null; }

  /**
   * Crea el item confirmado: crea el item en BagPro (asigna el código definitivo y su trigger crea el producto en
   * Plasticaribe), espera a que el producto exista en Plasticaribe y crea el artículo en Zeus con el precio.
   * Muestra el resultado de cada paso; si un paso falla, los siguientes quedan pendientes.
   * @returns No retorna un valor.
   */
  confirmarCreacion() {
    if (!this.confirmacion) return;
    const { dto, validacion } = this.confirmacion;
    this.confirmacion = null;
    let codigo = 0;
    this.ultimoCodigo = null;
    this.pasos = [
      { titulo: 'Validar duplicados en BagPro', estado: 'ok', detalle: 'Nombre sin duplicados; creación confirmada.' },
      { titulo: 'Crear item en BagPro', estado: 'pendiente' },
      { titulo: 'Verificar producto en Plasticaribe', estado: 'pendiente' },
      { titulo: `Crear artículo en Zeus (${PRESENTACION_ZEUS[dto.presentacion]})`, estado: 'pendiente' },
    ];
    let actual = 1;
    const iniciar = (indice: number) => { actual = indice; this.pasos[indice].estado = 'proceso'; };
    const terminar = (indice: number, detalle?: string) => { this.pasos[indice].estado = 'ok'; this.pasos[indice].detalle = detalle; };

    this.guardando = true;
    iniciar(1);
    this.bagProService.PostCrearItem(dto).pipe(
      switchMap(creado => {
        codigo = creado.clienteItems;
        this.ultimoCodigo = codigo;
        const cambio = codigo != validacion.siguienteCodigo ? ` El consecutivo cambió de ${validacion.siguienteCodigo} a ${codigo} porque se creó otro item antes.` : '';
        terminar(1, `Item ${codigo} creado: ${creado.nombre} (${creado.presentacion}).${cambio}`);
        iniciar(2);
        return this.esperarProductoPlasticaribe$(codigo);
      }),
      switchMap(() => { terminar(2, `Producto ${codigo} encontrado.`); iniciar(3); return this.productoService.PostArticuloZeus(codigo, dto.presentacion, dto.precio); }),
      finalize(() => this.guardando = false),
    ).subscribe({
      next: resultado => {
        terminar(3, resultado.yaExistia ? 'El artículo ya existía en Zeus.' : 'Artículo creado en Zeus.');
        this.msj.mensajeConfirmacion(`¡Item ${codigo} creado!`, 'Se creó en BagPro, Plasticaribe y Zeus.', 5000);
        this.limpiarFormulario();
        this.verEstado(codigo);
      },
      error: (error: HttpErrorResponse) => {
        this.pasos[actual].estado = 'error';
        this.pasos[actual].detalle = this.mensajePaso(actual, error, codigo);
        if (actual == 0 || actual == 1) this.msj.mensajeError('No se creó el item', this.pasos[actual].detalle, 6000);
        else {
          this.msj.mensajeAdvertencia(`Item ${codigo} creado con sincronización pendiente`, this.pasos[actual].detalle, 8000);
          this.verEstado(codigo);
        }
      },
    });
  }

  /**
   * Arma el mensaje de error de un paso del guardado.
   * @param paso Índice del paso que falló.
   * @param error Error HTTP.
   * @param codigo Código del item creado (0 si aún no existe).
   * @returns Mensaje para el usuario.
   */
  private mensajePaso(paso: number, error: HttpErrorResponse, codigo: number): string {
    const duplicado = this.duplicado(error);
    if (duplicado) return `Ya existe el item ${duplicado.codigo} (${duplicado.nombre}) con este nombre.`;
    if (paso == 2 && error.status == 404)
      return `El item ${codigo} se creó en BagPro pero aún no aparece en Plasticaribe. Use "Estado de sincronización" → "Completar" más tarde.`;
    if (paso >= 2) return `${this.detalleError(error)} Use "Estado de sincronización" → "Completar" para reintentar.`;
    return this.detalleError(error);
  }

  /**
   * Espera a que el producto creado por el trigger de BagPro exista en Plasticaribe, reintentando unas pocas veces
   * con una espera corta mientras responda 404.
   * @param codigo Código del item.
   * @returns Observable que emite el producto o falla con el último error.
   */
  private esperarProductoPlasticaribe$(codigo: number): Observable<any> {
    return this.productoService.srvObtenerListaPorId(codigo).pipe(
      retry({ count: REINTENTOS_PRODUCTO, delay: (error: HttpErrorResponse) => error.status == 404 ? timer(ESPERA_PRODUCTO_MS) : throwError(() => error) }),
    );
  }

  /**
   * Limpia la ficha y vuelve a sugerir el nombre automáticamente.
   * @returns No retorna un valor.
   */
  limpiarFormulario() {
    this.formItem.reset({ unidad: 2, extrusion: true, impresion: false, laminado: false, sellado: false, corte: false, cyrel: false, tintas: [] }, { emitEvent: false });
    this.aplicarProcesos();
    this.itemCopiado = null;
    this.busquedaCopia.reset();
    this.nombreManual = false;
  }

  /**
   * Carga en el panel de sincronización el estado del item indicado.
   * @param codigo Código del item.
   * @returns No retorna un valor.
   */
  verEstado(codigo: number) {
    this.busquedaSync.setValue({ codigo, nombre: '', etiqueta: String(codigo) });
    this.consultarEstado();
  }

  /**
   * Consulta el estado del item en BagPro (presentaciones), Plasticaribe (producto) y Zeus (artículos por
   * presentación) y arma la tabla de sincronización. Cada consulta falla por separado sin ocultar las demás.
   * @returns No retorna un valor.
   */
  consultarEstado() {
    const codigo = this.codigoDe(this.busquedaSync.value);
    if (!(codigo > 0)) { this.msj.mensajeAdvertencia('Advertencia', 'Busque el item por nombre o digite su código.'); return; }
    const estado: EstadoSincronizacion = { codigo, presentacionesBagPro: null, existePlasticaribe: null, articulosZeus: null };
    this.consultandoSync = true;
    forkJoin({
      bagPro: this.bagProService.GetPresentacionesItem(codigo).pipe(
        catchError((error: HttpErrorResponse) => { estado.errorBagPro = error.status == 404 ? 'El item no existe en BagPro.' : this.detalleError(error); return of(null); })),
      plasticaribe: this.productoService.srvObtenerListaPorId(codigo).pipe(
        // Las existencias dan la presentación y el precio de cada registro del producto en Plasticaribe.
        switchMap(producto => this.existenciasService.srvObtenerListaPorIdProducto(codigo).pipe(
          catchError(() => of([] as any[])),
          map(existencias => ({ existe: true as boolean | null, producto: { ...producto, existencias: (existencias ?? []).map((e: any) => e.exist ?? e) } })))),
        catchError((error: HttpErrorResponse) => {
          if (error.status == 404) return of({ existe: false as boolean | null, producto: null });
          estado.errorPlasticaribe = this.detalleError(error);
          return of({ existe: null as boolean | null, producto: null });
        })),
      zeus: this.productoService.GetArticulosZeus(codigo).pipe(
        catchError((error: HttpErrorResponse) => { estado.errorZeus = this.detalleError(error); return of(null); })),
    }).pipe(finalize(() => this.consultandoSync = false)).subscribe(resultado => {
      estado.presentacionesBagPro = resultado.bagPro;
      estado.existePlasticaribe = resultado.plasticaribe.existe;
      estado.productoPlasticaribe = resultado.plasticaribe.producto;
      // Si la API responde con la forma anterior (solo códigos de presentación), se convierte a objetos.
      estado.articulosZeus = resultado.zeus == null ? null
        : resultado.zeus.map((a: any) => typeof a == 'string' ? { codigo: String(codigo), presentacion: a } as ArticuloZeus : a);
      this.estadoSync = estado;
      this.tarjetasSync = this.construirTarjetasSync(estado, this.construirFilasSync(estado));
    });
  }

  /**
   * Crea en Zeus, una por una, las presentaciones de BagPro que faltan, con el precio de cada presentación.
   * Repetirlo es seguro: Zeus no se modifica si el artículo ya existe. Las presentaciones sin precio se omiten.
   * @returns No retorna un valor.
   */
  completarSincronizacion() {
    const estado = this.estadoSync;
    if (!estado) return;
    if (!estado.existePlasticaribe) { this.msj.mensajeAdvertencia('Advertencia', `El producto ${estado.codigo} aún no existe en Plasticaribe; no se puede crear en Zeus.`); return; }
    const faltantes = this.faltantesZeus;
    if (faltantes.length == 0) { this.msj.mensajeInformacion('Sin pendientes', 'Todas las presentaciones de BagPro ya están en Zeus.'); return; }
    this.completando = true;
    // Un paso por presentación faltante; cada uno se actualiza mientras se envía, para verlo avanzar.
    this.resultadosSync = faltantes.map(p => ({ titulo: `Zeus ${this.presentacionZeus(p.presentacion)}`, estado: 'pendiente' as EstadoPaso }));
    from(faltantes.map((p, i) => ({ p, i }))).pipe(
      concatMap(({ p, i }) => {
        if (!(Number(p.precio) > 0)) { this.marcarPasoSync(i, 'advertencia', 'Sin precio en BagPro: no se envió.'); return of(null); }
        this.marcarPasoSync(i, 'proceso', 'Enviando a Zeus...');
        return this.productoService.PostArticuloZeus(estado.codigo, p.presentacion, Number(p.precio)).pipe(
          map(r => this.marcarPasoSync(i, 'ok', r.yaExistia ? 'Ya existía.' : 'Artículo creado.')),
          catchError((error: HttpErrorResponse) => of(this.marcarPasoSync(i, 'error', this.detalleError(error)))),
        );
      }),
      toArray(),
      finalize(() => this.completando = false),
    ).subscribe(() => this.consultarEstado());
  }

  /** Presentación pendiente de confirmar antes de agregarla (null si el diálogo está cerrado). */
  confirmacionPresentacion: { codigo: number, nombre: string, presentacion: PresentacionItem, precio: number } | null = null;

  /** Visibilidad del diálogo de confirmación de presentación (cerrarlo cancela). */
  get confirmacionPresentacionVisible(): boolean { return this.confirmacionPresentacion != null; }
  set confirmacionPresentacionVisible(valor: boolean) { if (!valor) this.confirmacionPresentacion = null; }

  /**
   * Valida la presentación y el precio y abre la confirmación antes de agregarla.
   * @returns No retorna un valor.
   */
  agregarPresentacion() {
    const codigo = this.estadoSync?.codigo ?? 0;
    const { presentacion, precio } = this.formPresentacion.value;
    if (!(codigo > 0)) { this.msj.mensajeAdvertencia('Advertencia', 'Consulte primero el estado del item.'); return; }
    if (!presentacion || !(Number(precio) > 0)) { this.msj.mensajeAdvertencia('Advertencia', 'Seleccione la presentación y un precio mayor que 0.'); return; }
    this.confirmacionPresentacion = { codigo, nombre: this.resumenSync.nombre ?? '', presentacion, precio: Number(precio) };
  }

  /**
   * Agrega la presentación confirmada al item del panel: la crea en BagPro (su trigger la agrega en Plasticaribe) y
   * luego crea el artículo en Zeus con el precio indicado.
   * @returns No retorna un valor.
   */
  confirmarPresentacion() {
    if (!this.confirmacionPresentacion) return;
    const { codigo, presentacion, precio } = this.confirmacionPresentacion;
    this.confirmacionPresentacion = null;
    this.agregandoPresentacion = true;
    this.resultadosSync = [
      { titulo: `BagPro ${presentacion}`, estado: 'pendiente' },
      { titulo: 'Plasticaribe', estado: 'pendiente' },
      { titulo: `Zeus ${PRESENTACION_ZEUS[presentacion]}`, estado: 'pendiente' },
    ];
    let actual = 0;
    this.marcarPasoSync(0, 'proceso', 'Creando presentación...');
    this.bagProService.PostPresentacionItem(codigo, presentacion, Number(precio)).pipe(
      switchMap(() => {
        this.marcarPasoSync(0, 'ok', 'Presentación creada.');
        actual = 1;
        this.marcarPasoSync(1, 'proceso', 'Verificando producto...');
        return this.esperarProductoPlasticaribe$(codigo);
      }),
      switchMap(() => {
        this.marcarPasoSync(1, 'ok', 'Producto encontrado.');
        actual = 2;
        this.marcarPasoSync(2, 'proceso', 'Enviando a Zeus...');
        return this.productoService.PostArticuloZeus(codigo, presentacion, Number(precio));
      }),
      finalize(() => { this.agregandoPresentacion = false; this.verEstado(codigo); }),
    ).subscribe({
      next: r => {
        this.marcarPasoSync(2, 'ok', r.yaExistia ? 'Ya existía.' : 'Artículo creado.');
        this.msj.mensajeConfirmacion(`Presentación ${presentacion} agregada al item ${codigo}`);
        this.formPresentacion.reset();
      },
      error: (error: HttpErrorResponse) => {
        this.marcarPasoSync(actual, 'error', this.detalleError(error));
        this.msj.mensajeError('No fue posible agregar la presentación', this.detalleError(error), 6000);
      },
    });
  }

  /**
   * Busca items de BagPro por nombre o código para los autocompletados (mínimo 3 caracteres).
   * @param evento Evento del autocompletado con el texto escrito (`query`).
   * @returns No retorna un valor.
   */
  buscarItems(evento: any) {
    const texto = (evento?.query ?? '').toString().trim();
    if (texto.length < 3) { this.itemsSugeridos = []; return; }
    this.bagProService.GetBuscarItems(texto).subscribe({
      next: data => this.itemsSugeridos = (data ?? []).map(i => ({ ...i, etiqueta: `${i.codigo} - ${i.nombre}` })),
      error: (error: HttpErrorResponse) => this.msj.mensajeError('No fue posible buscar los items', this.detalleError(error)),
    });
  }

  /**
   * Obtiene el código del item a partir del valor del autocompletado: el item seleccionado o un código escrito.
   * @param valor Item seleccionado (`{ codigo }`) o texto/número digitado.
   * @returns Código del item, o 0 si el valor no corresponde a un código.
   */
  codigoDe(valor: any): number {
    if (valor && typeof valor == 'object') return Number(valor.codigo) || 0;
    const texto = (valor ?? '').toString().trim();
    return /^\d+$/.test(texto) ? Number(texto) : 0;
  }

  /**
   * Arma las filas de la tabla de sincronización: una por presentación de BagPro, una del producto de Plasticaribe y
   * una por artículo de Zeus, más una fila "falta" por cada registro esperado que no existe. Marca las filas cuyo
   * nombre difiere del de BagPro (o del de Plasticaribe si el item no está en BagPro).
   * @param estado Estado consultado del item.
   * @returns Filas de la tabla.
   */
  construirFilasSync(estado: EstadoSincronizacion): FilaSync[] {
    const codigo = String(estado.codigo);
    const vacia = (sistema: FilaSync['sistema'], presentacion: string = ''): FilaSync => ({
      sistema, existe: false, codigo, nombre: '', descripcion: '', presentacion, precio: null, costo: null,
      cliente: '', tipoProducto: '', estado: '', grupo: '', grupoFacturacion: '', nombreDifiere: false,
    });
    const filas: FilaSync[] = [];

    if (estado.presentacionesBagPro?.length) {
      // BagPro no tiene descripción aparte: se muestra el mismo nombre.
      estado.presentacionesBagPro.forEach(p => filas.push({ ...vacia('BagPro', p.presentacion), existe: true, nombre: p.nombre ?? '', descripcion: p.nombre ?? '', precio: p.precio, cliente: p.clienteNom ?? '' }));
    } else filas.push(vacia('BagPro'));

    const prod = estado.productoPlasticaribe;
    if (estado.existePlasticaribe && prod) {
      const base: FilaSync = {
        ...vacia('Plasticaribe'), existe: true,
        nombre: prod.prod_Nombre ?? '',
        descripcion: prod.prod_Descripcion ?? '',
        tipoProducto: this.tiposProducto.find(t => t.tpProd_Id == prod.tpProd_Id)?.tpProd_Nombre ?? (prod.tpProd_Id ?? '').toString(),
        estado: this.estados.find(e => e.estado_Id == prod.estado_Id)?.estado_Nombre ?? (prod.estado_Id ?? '').toString(),
      };
      // Una fila por existencia (presentación) con su precio; si no hay existencias, una sola fila del producto.
      const existencias: any[] = prod.existencias ?? [];
      if (existencias.length) existencias.forEach(e => filas.push({ ...base, presentacion: (e.undMed_Id ?? '').toString().trim(), precio: e.exProd_PrecioVenta ?? null }));
      else filas.push(base);
    } else filas.push(vacia('Plasticaribe'));

    (estado.articulosZeus ?? []).forEach(a => filas.push({
      ...vacia('Zeus', a.presentacion), existe: true, nombre: a.nombre ?? '', descripcion: a.descripcion ?? '',
      precio: a.precio, costo: a.costo, grupo: a.grupo ?? '', grupoFacturacion: a.grupoFacturacion ?? '',
    }));
    if (estado.articulosZeus) {
      this.faltantesZeusDe(estado).forEach(p => filas.push(vacia('Zeus', this.presentacionZeus(p.presentacion))));
      if (estado.articulosZeus.length == 0 && !estado.presentacionesBagPro?.length) filas.push(vacia('Zeus'));
    }

    const nombreBagPro = filas.find(f => f.sistema == 'BagPro' && f.existe)?.nombre;
    const nombrePlasticaribe = filas.find(f => f.sistema == 'Plasticaribe' && f.existe)?.nombre;
    const referencia = this.normalizarNombre(nombreBagPro ?? nombrePlasticaribe ?? '');
    filas.forEach(f => f.nombreDifiere = f.existe && referencia != '' && (f.nombre ?? '') != '' &&this.normalizarNombre(f.nombre) != referencia);
    return filas;
  }

  /**
   * Presentaciones de BagPro de un estado que no tienen artículo en Zeus.
   * @param estado Estado consultado del item.
   * @returns Presentaciones faltantes en Zeus.
   */
  private faltantesZeusDe(estado: EstadoSincronizacion): PresentacionBagPro[] {
    if (!estado.presentacionesBagPro || !estado.articulosZeus) return [];
    const enZeus = estado.articulosZeus.map(a => (a.presentacion ?? '').trim().toUpperCase());
    return estado.presentacionesBagPro.filter(p => !enZeus.includes(this.presentacionZeus(p.presentacion)));
  }

  /**
   * Normaliza un nombre para compararlo entre sistemas (mayúsculas, sin espacios repetidos ni a los extremos).
   * @param nombre Nombre a normalizar.
   * @returns Nombre normalizado.
   */
  private normalizarNombre(nombre: string): string {
    return (nombre ?? '').toUpperCase().replace(/\s+/g, ' ').trim();
  }

  /**
   * Agrupa las filas de sincronización en una card por sistema, con su estado, datos principales y presentaciones.
   * @param estado Estado consultado del item (para los errores de cada sistema).
   * @param filas Filas armadas con construirFilasSync.
   * @returns Cards de BagPro, Plasticaribe y Zeus.
   */
  construirTarjetasSync(estado: EstadoSincronizacion, filas: FilaSync[]): TarjetaSync[] {
    const errores: Record<FilaSync['sistema'], string | undefined> = { BagPro: estado.errorBagPro, Plasticaribe: estado.errorPlasticaribe, Zeus: estado.errorZeus };
    return (['BagPro', 'Plasticaribe', 'Zeus'] as FilaSync['sistema'][]).map(sistema => {
      const propias = filas.filter(f => f.sistema == sistema);
      const existentes = propias.filter(f => f.existe);
      const primera = existentes[0];
      const error = errores[sistema];
      const estadoTarjeta: EstadoTarjeta = error ? 'error' : existentes.length == 0 ? 'falta' : propias.some(f => !f.existe) ? 'parcial' : 'ok';
      const datos = [
        { etiqueta: 'Cliente', valor: primera?.cliente ?? '' },
        { etiqueta: 'Tipo de producto', valor: primera?.tipoProducto ?? '' },
        { etiqueta: 'Estado', valor: primera?.estado ?? '' },
        { etiqueta: 'Grupo', valor: primera?.grupo ?? '' },
        { etiqueta: 'Grupo facturación', valor: primera?.grupoFacturacion ?? '' },
      ].filter(d => d.valor != '');
      return {
        sistema, icono: ICONO_SISTEMA[sistema], estado: estadoTarjeta, etiqueta: ETIQUETA_TARJETA[estadoTarjeta],
        nombre: primera?.nombre ?? '', descripcion: primera?.descripcion ?? '',
        nombreDifiere: existentes.some(f => f.nombreDifiere), datos, error,
        chips: propias.filter(f => f.presentacion != '').map(f => ({ presentacion: f.presentacion, precio: f.precio, costo: f.costo, existe: f.existe })),
      };
    });
  }

  /**
   * Resumen del item consultado para el encabezado del panel: estado general, sistemas al día y presentaciones.
   * @returns Datos del resumen.
   */
  get resumenSync(): { estado: 'ok' | 'pendiente' | 'error', texto: string, icono: string, completos: number, presentaciones: number, nombre: string } {
    const tarjetas = this.tarjetasSync;
    const completos = tarjetas.filter(t => t.estado == 'ok').length;
    const nombre = tarjetas.find(t => t.nombre != '')?.nombre ?? '';
    const presentaciones = this.estadoSync?.presentacionesBagPro?.length ?? 0;
    if (tarjetas.some(t => t.estado == 'error')) return { estado: 'error', texto: 'Con errores de consulta', icono: 'pi pi-times-circle', completos, presentaciones, nombre };
    if (tarjetas.length > 0 && completos == tarjetas.length) return { estado: 'ok', texto: 'Sincronizado', icono: 'pi pi-check-circle', completos, presentaciones, nombre };
    return { estado: 'pendiente', texto: 'Sincronización pendiente', icono: 'pi pi-exclamation-circle', completos, presentaciones, nombre };
  }

  /**
   * Resumen del último resultado (Completar o Agregar presentación).
   * @returns Estado general y texto.
   */
  get resumenResultado(): { estado: 'ok' | 'proceso' | 'error', texto: string } {
    const pasos = this.resultadosSync;
    if (pasos.some(p => p.estado == 'proceso' || p.estado == 'pendiente')) return { estado: 'proceso', texto: 'En proceso' };
    if (pasos.some(p => p.estado == 'error' || p.estado == 'advertencia')) return { estado: 'error', texto: 'Con pendientes' };
    return { estado: 'ok', texto: 'Completado' };
  }

  /**
   * Actualiza un paso del resultado del panel de sincronización.
   * @param indice Posición del paso.
   * @param estado Estado nuevo.
   * @param detalle Texto que se muestra debajo del paso.
   * @returns No retorna un valor.
   */
  private marcarPasoSync(indice: number, estado: EstadoPaso, detalle?: string) {
    if (!this.resultadosSync[indice]) return;
    this.resultadosSync[indice] = { ...this.resultadosSync[indice], estado, detalle };
  }

  /**
   * Indica si el item consultado ya tiene la presentación en BagPro.
   * @param presentacion Presentación de BagPro (Kilo, Unidad, Paquete, MTS).
   * @returns true si ya existe.
   */
  presentacionYaExiste(presentacion: string): boolean {
    return (this.estadoSync?.presentacionesBagPro ?? []).some(p => (p.presentacion ?? '').trim() == presentacion);
  }

  /**
   * Icono del selector de presentación.
   * @param presentacion Presentación de BagPro.
   * @returns Clases PrimeIcons.
   */
  iconoPresentacion(presentacion: string): string {
    switch (presentacion) {
      case 'Kilo': return 'pi pi-shopping-bag';
      case 'Unidad': return 'pi pi-box';
      case 'Paquete': return 'pi pi-th-large';
      case 'MTS': return 'pi pi-arrows-h';
      default: return 'pi pi-tag';
    }
  }

  /**
   * Icono del estado de una card de sistema.
   * @param estado Estado de la card.
   * @returns Clases PrimeIcons.
   */
  iconoEstadoTarjeta(estado: EstadoTarjeta): string {
    switch (estado) {
      case 'ok': return 'pi pi-check-circle';
      case 'parcial': return 'pi pi-exclamation-triangle';
      case 'falta': return 'pi pi-times-circle';
      default: return 'pi pi-ban';
    }
  }

  /**
   * Icono dentro del círculo de un paso del resultado.
   * @param estado Estado del paso.
   * @returns Clases PrimeIcons.
   */
  iconoCirculoPaso(estado: EstadoPaso): string {
    switch (estado) {
      case 'ok': return 'pi pi-check';
      case 'error': return 'pi pi-times';
      case 'advertencia': return 'pi pi-exclamation-triangle';
      case 'proceso': return 'pi pi-spin pi-spinner';
      default: return 'pi pi-clock';
    }
  }

  /**
   * Texto por defecto de un paso del resultado cuando no tiene detalle.
   * @param estado Estado del paso.
   * @returns Texto del estado.
   */
  textoEstadoPaso(estado: EstadoPaso): string {
    return { pendiente: 'Pendiente', proceso: 'En proceso', ok: 'Completado', error: 'Error', advertencia: 'Advertencia' }[estado];
  }

  /**
   * Presentación de Zeus que corresponde a una presentación de BagPro.
   * @param presentacion Presentación de BagPro (Kilo, Unidad, Paquete, MTS).
   * @returns Código de Zeus (KLS, UND, PAQ, MTS) o la misma presentación si no se reconoce.
   */
  presentacionZeus(presentacion: string): string {
    return PRESENTACION_ZEUS[(presentacion ?? '').trim()] ?? (presentacion ?? '').trim().toUpperCase();
  }

  /**
   * Extrae el duplicado de una respuesta 409 de BagPro.
   * @param error Error HTTP.
   * @returns El duplicado o null si el error no es de duplicado.
   */
  private duplicado(error: HttpErrorResponse): ItemDuplicado | null {
    return error?.status == 409 && error.error?.tipo ? error.error as ItemDuplicado : null;
  }

  /**
   * Obtiene un mensaje legible de un error de las APIs (texto, `{ mensaje }`, ProblemDetails o errores de validación).
   * @param error Error HTTP.
   * @returns Mensaje para el usuario.
   */
  detalleError(error: HttpErrorResponse): string {
    const cuerpo = error?.error;
    if (typeof cuerpo == 'string' && cuerpo.trim() != '') return cuerpo;
    if (cuerpo?.mensaje) return cuerpo.mensaje;
    if (cuerpo?.errors) return Object.values(cuerpo.errors).flat().join(' ');
    if (cuerpo?.detail) return cuerpo.detail;
    if (cuerpo?.title) return cuerpo.title;
    if (error?.status == 403) return 'No tiene permisos para esta acción.';
    if (error?.status == 0) return 'No fue posible conectar con el servidor.';
    return `Error ${error?.status ?? ''} ${error?.statusText ?? ''}`.trim();
  }
}
