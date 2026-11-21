import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy } from '@angular/core';
import { habilitarArrastreHorizontal } from './arrastre-horizontal.directive';

/**
 * Se aplica sola a todo `<p-tabView [scrollable]="true">`: la barra de pestañas se desplaza arrastrando con el mouse
 * y con la rueda vertical (en táctil el deslizamiento es nativo). Los botones laterales de PrimeNG siguen funcionando
 * y se muestran u ocultan solos, porque PrimeNG escucha el scroll de la barra.
 * Los estilos (cursor, altura de los botones laterales) están en styles.css, sección "Barras de pestañas".
 */
@Directive({
  selector: 'p-tabView[scrollable]',
})
export class ArrastrePestanasDirective implements AfterViewInit, OnDestroy {

  private quitarArrastre?: () => void;

  constructor(private elementRef: ElementRef<HTMLElement>, private zona: NgZone) { }

  ngAfterViewInit(): void {
    // El primer .p-tabview-nav-content en orden del documento es el de esta barra (los p-tabView anidados van dentro de los paneles)
    const barra = this.elementRef.nativeElement.querySelector<HTMLElement>('.p-tabview-nav-content');
    if (!barra) return;
    barra.classList.add('arrastre-pestanas');
    this.zona.runOutsideAngular(() => this.quitarArrastre = habilitarArrastreHorizontal(barra));
  }

  ngOnDestroy(): void {
    this.quitarArrastre?.();
  }
}
