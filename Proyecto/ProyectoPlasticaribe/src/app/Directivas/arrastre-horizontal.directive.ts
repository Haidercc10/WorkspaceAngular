import { AfterViewInit, Directive, ElementRef, HostBinding, NgZone, OnDestroy } from '@angular/core';

/**
 * Fila con desplazamiento horizontal que se mueve arrastrando con el mouse (como la barra de pestañas de la página principal).
 * - Presionar y arrastrar desplaza la fila; si hubo arrastre, el clic al soltar se cancela (no activa el botón).
 * - La rueda vertical del mouse la desplaza horizontalmente.
 * - En táctil el deslizamiento es nativo.
 * Expone `puedeIzquierda`, `puedeDerecha` y `mover()` para mostrar flechas laterales:
 * ```html
 * <div appArrastreHorizontal #fila="arrastreHorizontal">...</div>
 * <button *ngIf="fila.puedeDerecha" (click)="fila.mover(1)">›</button>
 * ```
 */
@Directive({
  selector: '[appArrastreHorizontal]',
  exportAs: 'arrastreHorizontal',
})
export class ArrastreHorizontalDirective implements AfterViewInit, OnDestroy {

  /** Hay contenido oculto a la izquierda / a la derecha. */
  puedeIzquierda = false;
  puedeDerecha = false;

  @HostBinding('class.arrastre-horizontal') readonly claseBase = true;

  private presionado = false;
  private arrastro = false;
  private inicioX = 0;
  private scrollInicial = 0;
  private observador?: ResizeObserver;
  private limpiar: (() => void)[] = [];

  constructor(private elementRef: ElementRef<HTMLElement>, private zona: NgZone) { }

  private get fila(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  ngAfterViewInit(): void {
    const fila = this.fila;
    // Los eventos de mouse se escuchan fuera de Angular para no disparar la detección de cambios en cada movimiento.
    this.zona.runOutsideAngular(() => {
      this.escuchar(fila, 'mousedown', (e: MouseEvent) => {
        if (e.button !== 0) return;
        this.presionado = true;
        this.arrastro = false;
        this.inicioX = e.pageX;
        this.scrollInicial = fila.scrollLeft;
      });
      this.escuchar(window, 'mousemove', (e: MouseEvent) => {
        if (!this.presionado) return;
        const desplazamiento = e.pageX - this.inicioX;
        if (!this.arrastro && Math.abs(desplazamiento) > 5) {
          this.arrastro = true;
          fila.classList.add('arrastrando');
        }
        if (this.arrastro) {
          e.preventDefault();
          fila.scrollLeft = this.scrollInicial - desplazamiento;
        }
      });
      this.escuchar(window, 'mouseup', () => {
        this.presionado = false;
        fila.classList.remove('arrastrando');
      });
      // Si hubo arrastre, se cancela el clic para que no se active el botón al soltar.
      this.escuchar(fila, 'click', (e: MouseEvent) => {
        if (!this.arrastro) return;
        e.preventDefault();
        e.stopPropagation();
        this.arrastro = false;
      }, true);
      // La rueda vertical desplaza la fila horizontalmente (solo si hay algo oculto).
      this.escuchar(fila, 'wheel', (e: WheelEvent) => {
        if (fila.scrollWidth <= fila.clientWidth || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
        e.preventDefault();
        fila.scrollLeft += e.deltaY;
      }, { passive: false });
      this.escuchar(fila, 'scroll', () => this.actualizarFlechas(), { passive: true });
    });

    // Al cambiar el ancho de la fila o la cantidad de botones se recalculan las flechas.
    this.observador = new ResizeObserver(() => this.actualizarFlechas());
    this.observador.observe(fila);
    const mutaciones = new MutationObserver(() => this.actualizarFlechas());
    mutaciones.observe(fila, { childList: true, subtree: true });
    this.limpiar.push(() => mutaciones.disconnect());
    this.actualizarFlechas();
  }

  /**
   * Desplaza la fila casi un ancho completo hacia un lado.
   * @param direccion -1 izquierda, 1 derecha.
   */
  mover(direccion: -1 | 1) {
    this.fila.scrollBy({ left: direccion * this.fila.clientWidth * 0.8, behavior: 'smooth' });
  }

  /** Recalcula si hay contenido oculto a cada lado; solo vuelve a Angular si algo cambió. */
  private actualizarFlechas() {
    const fila = this.fila;
    const izquierda = fila.scrollLeft > 1;
    const derecha = fila.scrollLeft + fila.clientWidth < fila.scrollWidth - 1;
    if (izquierda === this.puedeIzquierda && derecha === this.puedeDerecha) return;
    this.zona.run(() => {
      this.puedeIzquierda = izquierda;
      this.puedeDerecha = derecha;
    });
  }

  private escuchar(objetivo: EventTarget, evento: string, manejador: (e: any) => void, opciones?: boolean | AddEventListenerOptions) {
    objetivo.addEventListener(evento, manejador, opciones);
    this.limpiar.push(() => objetivo.removeEventListener(evento, manejador, opciones));
  }

  ngOnDestroy(): void {
    this.observador?.disconnect();
    this.limpiar.forEach(quitar => quitar());
  }
}
