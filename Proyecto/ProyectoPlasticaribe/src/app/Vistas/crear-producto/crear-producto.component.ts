import { HttpErrorResponse } from '@angular/common/http';
import { Component, Injectable, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription, catchError, concatMap, finalize, forkJoin, from, map, of, retry, switchMap, throwError, timer, toArray } from 'rxjs';
import { Table } from 'primeng/table';
import { ArticuloZeus, CapaLaminadoItem, CrearItemDto, FichaItem, ItemBusqueda, ItemDuplicado, PresentacionBagPro, PresentacionItem } from 'src/app/Modelo/modelCrearItem';
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

/** Roles que pueden crear items y completar su sincronización (igual que crear/editar OT). */
const ROLES_CREAR_ITEM: readonly number[] = [1, 98];

/**
 * Tipo de producto de Plasticaribe (TpProd_Id) → formato de producto terminado de BagPro (PtFormatopt).
 * Es el inverso del mapeo de TR_CreacionProductosEnPBDD (BagPro → Plasticaribe).
 */
const TIPO_PRODUCTO_A_FORMATO_BAGPRO: Readonly<Record<number, number>> = { 7: 1, 4: 2, 2: 3, 1: 4, 8: 5, 3: 6, 6: 7, 5: 8 };

/** Formatos de BagPro que exigen largo: bolsa (3), hoja (5), camisilla (6) y precorte (7). */
const FORMATOS_CON_LARGO: readonly number[] = [3, 5, 6, 7];

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
  impresion: ['tipoImpresion', 'rodillo', 'pista', 'cyrel', 'descripcionComercial', 'gramaje'],
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
  @ViewChild('dtSync') dtSync?: Table;

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
  tintasCopiadas: number[] = []; //Códigos BagPro de las tintas de la ficha copiada
  itemCopiado: number | null = null;

  guardando: boolean = false;
  copiando: boolean = false;
  pasos: PasoGuardado[] = [];

  consultandoSync: boolean = false;
  completando: boolean = false;
  agregandoPresentacion: boolean = false;
  estadoSync: EstadoSincronizacion | null = null;
  resultadosSync: PasoGuardado[] = [];
  filasSync: FilaSync[] = [];

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
    private msj: MensajesAplicacionService,) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;

    this.formItem = this.frmBuilder.group({
      // General
      cliente: [null, Validators.required],
      vendedor: [null],
      formato: [null, Validators.required],
      material: [null, Validators.required],
      pigmento: [null],
      presentacion: [null, Validators.required],
      precio: [null, [Validators.required, Validators.min(0.01)]],
      cantidadPaquete: [null],
      unidad: [2, Validators.required],
      ancho: [null, [Validators.required, Validators.min(0.01)]],
      largo: [null],
      fuelle: [null],
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
  }

  ngOnDestroy(): void {
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

  /** Indica si la presentación elegida es Paquete (exige unidades por paquete). */
  get esPaquete(): boolean {
    return this.formItem.get('presentacion')?.value == 'Paquete';
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
      partes = [formato, material, medida, calibre > 0 ? `CAL ${calibre.toFixed(1)}` : '', (v.sellado || v.corte) ? v.perforacion : '', this.densidad(material), this.nombrePigmento(v.pigmento)];
    }
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
   * Consulta la ficha técnica de un item de BagPro y la carga en el formulario; deja vacíos nombre,
   * presentación y precio para que el usuario los defina.
   * @returns No retorna un valor.
   */
  copiarDesdeItem() {
    const codigo = this.codigoDe(this.busquedaCopia.value);
    if (!(codigo > 0)) { this.msj.mensajeAdvertencia('Advertencia', 'Busque el item a copiar por nombre o digite su código.'); return; }
    this.copiando = true;
    this.bagProService.GetFichaItem(codigo).pipe(finalize(() => this.copiando = false)).subscribe({
      next: ficha => {
        this.cargarFicha(ficha);
        this.msj.mensajeInformacion(`Ficha del item ${codigo} copiada`, 'Defina nombre, presentación y precio (puede usar "Sugerir" para el nombre).', 5000);
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
    this.tintasCopiadas = (ficha.tintas ?? []).slice(0, 8);
    this.itemCopiado = ficha.clienteItems;

    this.formItem.patchValue({
      cliente: ficha.cliente ? { codBagpro: String(ficha.cliente), nombreComercial: ficha.clienteNom } : null,
      vendedor: vendedor > 0 ? vendedor : null,
      formato: ficha.formato ?? null,
      material: ficha.material ?? null,
      pigmento: ficha.pigmento ?? null,
      presentacion: null,
      precio: null,
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
      capa1: capas[0]?.capa ?? null, calibreCapa1: capas[0]?.calibre ?? null, cantidadCapa1: capas[0]?.cantidad ?? null,
      capa2: capas[1]?.capa ?? null, calibreCapa2: capas[1]?.calibre ?? null, cantidadCapa2: capas[1]?.cantidad ?? null,
      capa3: capas[2]?.capa ?? null, calibreCapa3: capas[2]?.calibre ?? null, cantidadCapa3: capas[2]?.cantidad ?? null,
      nombre: null,
    }, { emitEvent: false });
    if (ficha.rotograbado) this.msj.mensajeAdvertencia('Proceso de Rotograbado', 'El item tenía Rotograbado, que ya no existe; se cargó como Impresión.');
    // El nombre queda vacío: no se recalcula hasta que el usuario pulse "Sugerir" o lo escriba
    this.nombreManual = true;
  }

  /**
   * Quita las tintas copiadas de la ficha de otro item.
   * @returns No retorna un valor.
   */
  quitarTintas() {
    this.tintasCopiadas = [];
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
      tintas: v.impresion ? [...this.tintasCopiadas] : [],
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
   * Crea el item: valida duplicados en BagPro, crea el item (BagPro asigna el código y su trigger crea el producto
   * en Plasticaribe), espera a que el producto exista en Plasticaribe y crea el artículo en Zeus con el precio.
   * Muestra el resultado de cada paso; si un paso falla, los siguientes quedan pendientes.
   * @returns No retorna un valor.
   */
  guardar() {
    const errores = this.validarFicha();
    if (errores.length > 0) { this.msj.mensajeAdvertencia('Revise la ficha del item', errores.join(' '), 6000); return; }
    const dto = this.construirDto();
    let codigo = 0;
    this.pasos = [
      { titulo: 'Validar duplicados en BagPro', estado: 'pendiente' },
      { titulo: 'Crear item en BagPro', estado: 'pendiente' },
      { titulo: 'Verificar producto en Plasticaribe', estado: 'pendiente' },
      { titulo: `Crear artículo en Zeus (${PRESENTACION_ZEUS[dto.presentacion]})`, estado: 'pendiente' },
    ];
    let actual = 0;
    const iniciar = (indice: number) => { actual = indice; this.pasos[indice].estado = 'proceso'; };
    const terminar = (indice: number, detalle?: string) => { this.pasos[indice].estado = 'ok'; this.pasos[indice].detalle = detalle; };

    this.guardando = true;
    iniciar(0);
    this.bagProService.PostValidarDuplicadoItem(dto).pipe(
      switchMap(() => { terminar(0, 'Sin duplicados.'); iniciar(1); return this.bagProService.PostCrearItem(dto); }),
      switchMap(creado => {
        codigo = creado.clienteItems;
        terminar(1, `Item ${codigo} creado: ${creado.nombre} (${creado.presentacion}).`);
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
    if (duplicado) return `Ya existe el item ${duplicado.codigo} (${duplicado.nombre}) con ${duplicado.tipo == 'ficha' ? 'esta ficha' : 'este nombre'}.`;
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
    this.formItem.reset({ unidad: 2, extrusion: true, impresion: false, laminado: false, sellado: false, corte: false, cyrel: false }, { emitEvent: false });
    this.aplicarProcesos();
    this.tintasCopiadas = [];
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
      this.filasSync = this.construirFilasSync(estado);
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
    this.resultadosSync = [];
    from(faltantes).pipe(
      concatMap(p => {
        const titulo = `${p.presentacion} → Zeus ${this.presentacionZeus(p.presentacion)}`;
        if (!(Number(p.precio) > 0)) return of<PasoGuardado>({ titulo, estado: 'advertencia', detalle: 'Sin precio en BagPro: no se envió.' });
        return this.productoService.PostArticuloZeus(estado.codigo, p.presentacion, Number(p.precio)).pipe(
          map(r => ({ titulo, estado: 'ok', detalle: r.yaExistia ? 'Ya existía.' : 'Creado.' } as PasoGuardado)),
          catchError((error: HttpErrorResponse) => of<PasoGuardado>({ titulo, estado: 'error', detalle: this.detalleError(error) })),
        );
      }),
      toArray(),
      finalize(() => this.completando = false),
    ).subscribe(resultados => {
      this.resultadosSync = resultados;
      this.consultarEstado();
    });
  }

  /**
   * Agrega una presentación al item del panel: la crea en BagPro (su trigger la agrega en Plasticaribe) y luego
   * crea el artículo en Zeus con el precio indicado.
   * @returns No retorna un valor.
   */
  agregarPresentacion() {
    const codigo = this.estadoSync?.codigo ?? 0;
    const { presentacion, precio } = this.formPresentacion.value;
    if (!(codigo > 0)) { this.msj.mensajeAdvertencia('Advertencia', 'Consulte primero el estado del item.'); return; }
    if (!presentacion || !(Number(precio) > 0)) { this.msj.mensajeAdvertencia('Advertencia', 'Seleccione la presentación y un precio mayor que 0.'); return; }
    this.agregandoPresentacion = true;
    this.resultadosSync = [
      { titulo: `Agregar ${presentacion} en BagPro`, estado: 'proceso' },
      { titulo: `Crear artículo en Zeus (${PRESENTACION_ZEUS[presentacion]})`, estado: 'pendiente' },
    ];
    let actual = 0;
    this.bagProService.PostPresentacionItem(codigo, presentacion, Number(precio)).pipe(
      switchMap(() => {
        this.resultadosSync[0] = { ...this.resultadosSync[0], estado: 'ok', detalle: 'Presentación creada.' };
        actual = 1;
        this.resultadosSync[1].estado = 'proceso';
        return this.esperarProductoPlasticaribe$(codigo).pipe(switchMap(() => this.productoService.PostArticuloZeus(codigo, presentacion, Number(precio))));
      }),
      finalize(() => { this.agregandoPresentacion = false; this.verEstado(codigo); }),
    ).subscribe({
      next: r => {
        this.resultadosSync[1] = { ...this.resultadosSync[1], estado: 'ok', detalle: r.yaExistia ? 'Ya existía.' : 'Creado.' };
        this.msj.mensajeConfirmacion(`Presentación ${presentacion} agregada al item ${codigo}`);
        this.formPresentacion.reset();
      },
      error: (error: HttpErrorResponse) => {
        this.resultadosSync[actual] = { ...this.resultadosSync[actual], estado: 'error', detalle: this.detalleError(error) };
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
   * Filtra la tabla de sincronización por una columna.
   * @param evento Evento de escritura del filtro.
   * @param campo Campo de la fila por el que se filtra.
   * @returns No retorna un valor.
   */
  filtrarSync(evento: Event, campo: string) {
    this.dtSync?.filter((evento.target as HTMLInputElement).value, campo, 'contains');
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

  /**
   * Icono PrimeIcons para el estado de un paso.
   * @param estado Estado del paso.
   * @returns Clases del icono.
   */
  iconoPaso(estado: EstadoPaso): string {
    switch (estado) {
      case 'ok': return 'pi pi-check-circle paso-ok';
      case 'error': return 'pi pi-times-circle paso-error';
      case 'advertencia': return 'pi pi-exclamation-triangle paso-advertencia';
      case 'proceso': return 'pi pi-spin pi-spinner';
      default: return 'pi pi-circle';
    }
  }
}
