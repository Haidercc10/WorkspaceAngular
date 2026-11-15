import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { filter } from 'rxjs';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { VistaFavorita, VistasFavoritasService } from 'src/app/Servicios/VistasFavoritas/VistasFavoritas.service';

/** Grupo de vistas que se muestra en el panel izquierdo del editor. */
interface GrupoVistas {
  modulo: string;
  vistas: VistaFavorita[];
}

/**
 * Barra inferior de accesos rápidos (vistas favoritas).
 *
 * - El dock muestra "Inicio", los favoritos del usuario en el orden elegido y el botón "Añadir"; resalta el de la
 *   página actual. Se puede ocultar (la preferencia se recuerda en este navegador).
 * - Mientras está visible, <body> lleva la clase `con-accesos-rapidos`, que reserva espacio abajo para que la barra
 *   no tape el contenido de las páginas (ver styles.css).
 * - El editor (botón +) tiene dos paneles: a la izquierda las vistas disponibles (buscador, filtro por módulo y
 *   agrupadas por módulo) y a la derecha los favoritos elegidos, que se reordenan arrastrando. Trabaja sobre una
 *   copia: no guarda nada hasta presionar "Guardar".
 * - Los favoritos viven en VistasFavoritasService, que comparte el estado con la estrella de la barra superior.
 */
@Component({
  selector: 'app-VistasFavoritas',
  templateUrl: './VistasFavoritas.component.html',
  styleUrls: ['./VistasFavoritas.component.css']
})
export class VistasFavoritasComponent implements OnInit, OnDestroy {

  /** Módulos que el menú lateral tampoco muestra como categoría. */
  private static readonly MODULOS_OCULTOS = ['Inicio', 'Pruebas', 'Vistas'];
  private static readonly SIN_MODULO = 'Otros';
  private static readonly CLAVE_OCULTO = 'accesosRapidos_oculto';
  private static readonly CLASE_BODY = 'con-accesos-rapidos';
  private static readonly RUTA_INICIO = '/home';

  limite = 7; // máximo de favoritos; lo define la API
  favoritos: VistaFavorita[] = []; // favoritos guardados, en orden
  dockItems: MenuItem[] = [];
  rutaActiva = ''; // ruta (normalizada) del acceso que corresponde a la página actual
  oculto = this.leerOculto();

  // Estado del editor
  editorVisible = false;
  cargandoEditor = false;
  guardando = false;
  seleccion: VistaFavorita[] = []; // copia editable de `favoritos`
  busqueda = '';
  moduloFiltro: string | null = null; // null = todos los módulos
  modulos: string[] = [];
  grupos: GrupoVistas[] = [];
  private seleccionIds = new Set<number>();
  private disponibles: VistaFavorita[] | null = null;

  constructor(private vistasFavService : VistasFavoritasService,
                private msj : MensajesAplicacionService,
                  private router : Router,
                    @Inject(DOCUMENT) private document : Document) {
    this.vistasFavService.misFavoritos$.pipe(takeUntilDestroyed()).subscribe(({ limite, favoritos }) => {
      this.limite = limite;
      this.favoritos = favoritos;
      this.construirDock();
    });
    this.router.events.pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => this.actualizarRutaActiva());
  }

  ngOnInit() {
    this.aplicarClaseBody();
    this.vistasFavService.cargar().subscribe({
      error: () => this.msj.mensajeError('¡No se pudieron cargar sus accesos rápidos!'),
    });
  }

  ngOnDestroy() {
    this.document.body.classList.remove(VistasFavoritasComponent.CLASE_BODY);
  }

  // ---------- Dock ----------

  private construirDock() {
    const item = (label: string, tooltip: string, icon: string, ruta: string, command: () => void): MenuItem => ({
      label,
      icon,
      command,
      state: { ruta: VistasFavoritasService.normalizarRuta(ruta) },
      tooltipOptions: { tooltipLabel: tooltip, tooltipPosition: 'top', positionTop: -15, positionLeft: 15 },
    });

    this.dockItems = [
      item('Inicio', 'Inicio', 'assets/Iconos_Menu/home.png', VistasFavoritasComponent.RUTA_INICIO,
        () => this.router.navigateByUrl(VistasFavoritasComponent.RUTA_INICIO)),
      ...this.favoritos.map(v => item(v.nombre, v.nombre, v.icono, v.ruta, () => this.router.navigateByUrl(v.ruta))),
      item('Añadir', 'Editar accesos rápidos', 'assets/Iconos_Menu/crear.png', '', () => this.abrirEditor()),
    ];
    this.actualizarRutaActiva();
  }

  /** Marca el acceso de la página actual (también en subrutas, p. ej. /inventario-areas/materiales). */
  private actualizarRutaActiva() {
    const inicio = { id: 0, nombre: 'Inicio', icono: '', categoria: '', ruta: VistasFavoritasComponent.RUTA_INICIO };
    const vista = VistasFavoritasService.vistaDeUrl(this.router.url, [inicio, ...this.favoritos]);
    this.rutaActiva = vista ? VistasFavoritasService.normalizarRuta(vista.ruta) : '';
  }

  esActivo = (item: MenuItem) => !!this.rutaActiva && item.state?.['ruta'] === this.rutaActiva;

  alternarOculto() {
    this.oculto = !this.oculto;
    try { localStorage.setItem(VistasFavoritasComponent.CLAVE_OCULTO, this.oculto ? '1' : '0'); } catch { /* sin localStorage: no se recuerda */ }
    this.aplicarClaseBody();
  }

  private leerOculto(): boolean {
    try { return localStorage.getItem(VistasFavoritasComponent.CLAVE_OCULTO) === '1'; } catch { return false; }
  }

  private aplicarClaseBody() {
    this.document.body.classList.toggle(VistasFavoritasComponent.CLASE_BODY, !this.oculto);
  }

  // ---------- Editor: apertura y cierre ----------

  abrirEditor() {
    this.busqueda = '';
    this.moduloFiltro = null;
    this.establecerSeleccion(this.favoritos);
    this.editorVisible = true;

    if (this.disponibles) return this.actualizarGrupos();

    this.cargandoEditor = true;
    this.vistasFavService.disponibles().subscribe({
      next: data => {
        this.disponibles = data ?? [];
        this.modulos = [...new Set(this.disponibles.flatMap(v => this.modulosDe(v)))].sort((a, b) => a.localeCompare(b));
        this.cargandoEditor = false;
        this.actualizarGrupos();
      },
      error: () => {
        this.cargandoEditor = false;
        this.editorVisible = false;
        this.msj.mensajeError('¡No se pudieron cargar las vistas disponibles!');
      },
    });
  }

  cancelar = () => this.editorVisible = false;

  /** Vuelve a los favoritos guardados, descartando lo editado. */
  restablecer = () => this.establecerSeleccion(this.favoritos);

  guardar() {
    if (!this.hayCambios || this.guardando) return;

    this.guardando = true;
    this.vistasFavService.guardar(this.seleccion.map(v => v.id)).subscribe({
      next: () => {
        this.guardando = false;
        this.editorVisible = false;
        this.msj.mensajeConfirmacion('OK!', '¡Sus accesos rápidos se guardaron correctamente!');
      },
      error: err => {
        this.guardando = false;
        const detalle = typeof err?.error === 'string' ? err.error : '';
        this.msj.mensajeError('¡No se pudieron guardar sus accesos rápidos!', detalle);
      },
    });
  }

  // ---------- Editor: selección ----------

  get hayCambios(): boolean {
    return this.seleccion.map(v => v.id).join(',') !== this.favoritos.map(v => v.id).join(',');
  }

  get limiteAlcanzado(): boolean {
    return this.seleccion.length >= this.limite;
  }

  /** Posiciones vacías que se dibujan debajo de los favoritos para que el límite sea visible. */
  get espaciosLibres(): number[] {
    return Array.from({ length: Math.max(this.limite - this.seleccion.length, 0) }, (_, i) => this.seleccion.length + i + 1);
  }

  estaSeleccionada = (vista: VistaFavorita) => this.seleccionIds.has(vista.id);

  /** Agrega la vista a los favoritos, o la quita si ya estaba. */
  alternar(vista: VistaFavorita) {
    if (this.estaSeleccionada(vista)) return this.quitar(vista);
    if (this.limiteAlcanzado) {
      this.msj.mensajeAdvertencia('Límite alcanzado', `Solo puede tener ${this.limite} accesos rápidos. Quite uno para agregar otro.`);
      return;
    }
    this.establecerSeleccion([...this.seleccion, vista]);
  }

  quitar = (vista: VistaFavorita) => this.establecerSeleccion(this.seleccion.filter(v => v.id !== vista.id));

  soltar(evento: CdkDragDrop<VistaFavorita[]>) {
    const nueva = [...this.seleccion];
    moveItemInArray(nueva, evento.previousIndex, evento.currentIndex);
    this.establecerSeleccion(nueva);
  }

  /** Mueve un favorito una posición arriba (-1) o abajo (+1); alternativa al arrastre para teclado. */
  mover(indice: number, direccion: -1 | 1) {
    const destino = indice + direccion;
    if (destino < 0 || destino >= this.seleccion.length) return;
    const nueva = [...this.seleccion];
    moveItemInArray(nueva, indice, destino);
    this.establecerSeleccion(nueva);
  }

  private establecerSeleccion(vistas: VistaFavorita[]) {
    this.seleccion = vistas;
    this.seleccionIds = new Set(vistas.map(v => v.id));
  }

  // ---------- Editor: búsqueda y filtro ----------

  filtrarPorModulo(modulo: string | null) {
    this.moduloFiltro = modulo;
    this.actualizarGrupos();
  }

  /**
   * Arma los grupos del panel izquierdo. Sin búsqueda, las vistas se agrupan por módulo (una vista con varios
   * módulos aparece en cada uno, igual que en el menú lateral). Con búsqueda se muestra una sola lista de
   * resultados, sin repetidos.
   */
  actualizarGrupos() {
    if (!this.disponibles) return;

    const texto = this.normalizar(this.busqueda.trim());
    const enModulo = (v: VistaFavorita) => !this.moduloFiltro || this.modulosDe(v).includes(this.moduloFiltro);
    const coincide = (v: VistaFavorita) => !texto || this.normalizar(`${v.nombre} ${this.modulosDe(v).join(' ')}`).includes(texto);
    const porNombre = (a: VistaFavorita, b: VistaFavorita) => a.nombre.localeCompare(b.nombre);

    const visibles = this.disponibles.filter(v => enModulo(v) && coincide(v));

    if (texto) {
      this.grupos = visibles.length ? [{ modulo: `Resultados (${visibles.length})`, vistas: [...visibles].sort(porNombre) }] : [];
      return;
    }

    const modulos = this.moduloFiltro ? [this.moduloFiltro] : this.modulos;
    this.grupos = modulos
      .map(modulo => ({ modulo, vistas: visibles.filter(v => this.modulosDe(v).includes(modulo)).sort(porNombre) }))
      .filter(g => g.vistas.length > 0);
  }

  /** Módulos de una vista a partir de "|Módulo A|Módulo B|". */
  modulosDe(vista: VistaFavorita): string[] {
    const modulos = (vista.categoria ?? '').split('|').map(m => m.trim())
      .filter(m => m && !VistasFavoritasComponent.MODULOS_OCULTOS.includes(m));
    return modulos.length ? modulos : [VistasFavoritasComponent.SIN_MODULO];
  }

  trackPorId = (_: number, vista: VistaFavorita) => vista.id;

  private normalizar = (texto: string) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}
