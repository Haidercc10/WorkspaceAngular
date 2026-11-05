import { AfterViewInit, Directive, ElementRef, HostListener, Input, OnDestroy, Optional, Renderer2, RendererStyleFlags2, Self } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';

/**
 * Muestra un contador de caracteres ("n/máximo") en la esquina inferior derecha de un textarea o input.
 *
 * Uso: agregar el atributo al campo; el máximo se toma de su `maxlength`.
 * ```html
 * <textarea formControlName="observacion" maxlength="200" pInputTextarea appContadorCaracteres></textarea>
 * ```
 * - Funciona con formularios reactivos, ngModel o sin formulario, y se actualiza también cuando el valor cambia
 *   desde el código (cargar datos, limpiar el formulario).
 * - El contador se superpone al campo (un textarea no puede contener elementos) y el campo reserva a la derecha
 *   el ancho del contador, así el texto no queda debajo y el campo conserva su altura. No intercepta clics.
 * - Cambia de color al llegar al 90 % (`contador-caracteres--alerta`) y al máximo (`contador-caracteres--limite`).
 * - Sin `maxlength` muestra solo la cantidad de caracteres.
 * Los estilos están en `src/styles.css` (sección "Contador de caracteres").
 */
@Directive({
  selector: 'textarea[appContadorCaracteres], input[appContadorCaracteres]'
})
export class ContadorCaracteresDirective implements AfterViewInit, OnDestroy {

  /** Máximo opcional; si no se indica se usa el atributo `maxlength` del campo. */
  @Input('appContadorCaracteres') maximo: number | string | '' = '';

  /** Porcentaje del máximo desde el cual el contador se resalta como alerta. */
  private static readonly PORCENTAJE_ALERTA = 0.9;

  private contador?: HTMLElement;
  private cambiosValor?: Subscription;

  constructor(
    private elemento: ElementRef<HTMLTextAreaElement | HTMLInputElement>,
    private renderer: Renderer2,
    @Optional() @Self() private control: NgControl | null,
  ) { }

  ngAfterViewInit(): void {
    const campo = this.elemento.nativeElement;
    const contenedor = campo.parentElement;
    if (!contenedor) return;

    // El contador se ubica respecto al contenedor del campo (p. ej. el span.p-float-label).
    if (getComputedStyle(contenedor).position === 'static') this.renderer.setStyle(contenedor, 'position', 'relative');

    this.contador = this.renderer.createElement('small');
    this.renderer.addClass(this.contador, 'contador-caracteres');
    this.renderer.setAttribute(this.contador, 'aria-live', 'polite');
    this.renderer.insertBefore(contenedor, this.contador, campo.nextSibling);
    this.renderer.addClass(campo, 'con-contador-caracteres');

    this.reservarEspacio();
    this.cambiosValor = this.control?.valueChanges?.subscribe(() => this.actualizar());
    this.actualizar();
  }

  /**
   * Reserva a la derecha del campo el ancho del contador con su texto más largo (p. ej. "200/200"), así el texto
   * salta de línea antes del contador y el campo conserva su altura. Si no se puede medir (campo oculto), queda
   * el valor del CSS.
   */
  private reservarEspacio(): void {
    if (!this.contador) return;
    const limite = this.limite;
    this.renderer.setProperty(this.contador, 'textContent', limite ? `${limite}/${limite}` : '0000');
    const ancho = this.contador.offsetWidth;
    if (ancho > 0) {
      const margenDerecho = parseFloat(getComputedStyle(this.contador).right) || 0;
      this.renderer.setStyle(this.elemento.nativeElement, 'padding-right', `${Math.ceil(ancho + margenDerecho + 8)}px`, RendererStyleFlags2.Important);
    }
  }

  /** Actualiza mientras el usuario escribe (también sin formulario). */
  @HostListener('input')
  alEscribir(): void {
    this.actualizar();
  }

  ngOnDestroy(): void {
    this.cambiosValor?.unsubscribe();
    if (this.contador) this.contador.remove();
  }

  /** Máximo configurado: el valor de la directiva o el `maxlength` del campo; null si no hay límite. */
  private get limite(): number | null {
    const valor = this.maximo !== '' && this.maximo != null ? this.maximo : this.elemento.nativeElement.getAttribute('maxlength');
    const numero = Number(valor);
    return Number.isFinite(numero) && numero > 0 ? numero : null;
  }

  private actualizar(): void {
    if (!this.contador) return;

    const cantidad = (this.elemento.nativeElement.value ?? '').length;
    const limite = this.limite;
    this.renderer.setProperty(this.contador, 'textContent', limite ? `${cantidad}/${limite}` : `${cantidad}`);

    const enLimite = limite != null && cantidad >= limite;
    const enAlerta = limite != null && !enLimite && cantidad >= limite * ContadorCaracteresDirective.PORCENTAJE_ALERTA;
    this.alternarClase('contador-caracteres--limite', enLimite);
    this.alternarClase('contador-caracteres--alerta', enAlerta);
  }

  private alternarClase(clase: string, activa: boolean): void {
    if (activa) this.renderer.addClass(this.contador, clase);
    else this.renderer.removeClass(this.contador, clase);
  }
}
