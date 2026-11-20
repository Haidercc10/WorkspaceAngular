import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, Observable, distinctUntilChanged } from 'rxjs';

/**
 * Tamaño de letra de la aplicación, en porcentajes fijos.
 *
 * Es la única fuente de verdad del tamaño: guarda el porcentaje en la cookie "tamanoLetraPct", pone la variable CSS
 * --font-size (que usan las clases font-size-* de styles.css) y avisa a la interfaz a través de `porcentaje$`.
 *
 * 100 % es el tamaño que la aplicación usaba por defecto antes de este servicio (--font-size = 0.90), para que nadie
 * note un cambio al actualizar. Por eso --font-size = BASE × porcentaje / 100.
 *
 * El tamaño inicial lo aplica index.html antes de que arranque Angular (con la misma regla y la misma migración de la
 * cookie antigua), para que la página no se vea primero en un tamaño y luego en otro.
 */
@Injectable({ providedIn: 'root' })
export class TamanoLetraService {

  /** Porcentajes disponibles, de menor a mayor. Si se cambian, cambiarlos también en index.html e index.beta.html. */
  static readonly NIVELES: readonly number[] = [80, 90, 100, 110, 125];
  static readonly PREDETERMINADO = 100;

  /** Valor de --font-size que corresponde a 100 %. */
  private static readonly BASE = 0.9;
  private static readonly COOKIE = 'tamanoLetraPct';
  /** Cookies del esquema anterior (multiplicador directo + bandera de "ya se puso el valor por defecto"). */
  private static readonly COOKIES_ANTIGUAS = ['TamanoLetra', 'tamanoLetraCambiado'];

  private readonly porcentajeSubject: BehaviorSubject<number>;

  /** Emite el porcentaje actual al suscribirse y luego cada vez que cambia. */
  readonly porcentaje$: Observable<number>;

  constructor(private cookieService: CookieService, @Inject(DOCUMENT) private document: Document) {
    const porcentaje = this.leerPreferencia();
    this.porcentajeSubject = new BehaviorSubject<number>(porcentaje);
    this.porcentaje$ = this.porcentajeSubject.pipe(distinctUntilChanged());
    this.guardar(porcentaje); // deja la cookie nueva (y borra las antiguas) aunque el usuario no cambie nada
    this.aplicar(porcentaje);
  }

  get porcentaje(): number {
    return this.porcentajeSubject.value;
  }

  get puedeAumentar(): boolean {
    return this.indiceActual < TamanoLetraService.NIVELES.length - 1;
  }

  get puedeDisminuir(): boolean {
    return this.indiceActual > 0;
  }

  get esPredeterminado(): boolean {
    return this.porcentaje === TamanoLetraService.PREDETERMINADO;
  }

  /** Cambia al porcentaje indicado (se ajusta al nivel más cercano si no es uno de NIVELES). */
  establecer(porcentaje: number) {
    porcentaje = TamanoLetraService.nivelMasCercano(porcentaje);
    if (porcentaje === this.porcentaje) return;
    this.guardar(porcentaje);
    this.aplicar(porcentaje);
    this.porcentajeSubject.next(porcentaje);
  }

  aumentar() {
    if (this.puedeAumentar) this.establecer(TamanoLetraService.NIVELES[this.indiceActual + 1]);
  }

  disminuir() {
    if (this.puedeDisminuir) this.establecer(TamanoLetraService.NIVELES[this.indiceActual - 1]);
  }

  restablecer() {
    this.establecer(TamanoLetraService.PREDETERMINADO);
  }

  private get indiceActual(): number {
    return TamanoLetraService.NIVELES.indexOf(this.porcentaje);
  }

  /**
   * Lee la cookie nueva; si no existe, convierte la del esquema anterior ("TamanoLetra" = multiplicador, p. ej. 1.04)
   * al nivel más cercano. Sin ninguna de las dos, 100 %.
   */
  private leerPreferencia(): number {
    const actual = parseFloat(this.cookieService.get(TamanoLetraService.COOKIE));
    if (isFinite(actual)) return TamanoLetraService.nivelMasCercano(actual);

    const antigua = parseFloat(this.cookieService.get('TamanoLetra'));
    if (isFinite(antigua) && antigua > 0) return TamanoLetraService.nivelMasCercano(antigua / TamanoLetraService.BASE * 100);

    return TamanoLetraService.PREDETERMINADO;
  }

  private guardar(porcentaje: number) {
    this.cookieService.set(TamanoLetraService.COOKIE, `${porcentaje}`, { expires: 365, path: '/', sameSite: 'Lax' });
    // Las cookies antiguas se crearon sin "path", así que el navegador les puso el de la ruta en la que estaba el
    // usuario; se borran sin path (ruta actual) y con "/" para cubrir los casos habituales.
    for (const nombre of TamanoLetraService.COOKIES_ANTIGUAS) {
      if (!this.cookieService.check(nombre)) continue;
      this.cookieService.delete(nombre);
      this.cookieService.delete(nombre, '/');
    }
  }

  private aplicar(porcentaje: number) {
    const valor = +(TamanoLetraService.BASE * porcentaje / 100).toFixed(4);
    this.document.documentElement.style.setProperty('--font-size', `${valor}`);
  }

  private static nivelMasCercano(porcentaje: number): number {
    return TamanoLetraService.NIVELES.reduce((mejor, nivel) =>
      Math.abs(nivel - porcentaje) < Math.abs(mejor - porcentaje) ? nivel : mejor);
  }
}
