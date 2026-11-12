import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, Observable, Subscription, distinctUntilChanged, skip } from 'rxjs';

/**
 * Tema de la aplicación (claro u oscuro).
 *
 * Es la única fuente de verdad del tema: guarda la preferencia (cookie "theme" + localStorage), cambia el CSS de
 * PrimeNG (<link id="app-theme">) y avisa a las vistas a través de `oscuro$`. Reemplaza el patrón anterior en el que
 * cada vista consultaba AppComponent.temaSeleccionado con un setInterval cada segundo.
 *
 * En las vistas no se usa directamente: se usa la función `alCambiarTema` de este archivo.
 * El tema inicial lo elige index.html antes de que arranque Angular, leyendo la misma cookie.
 */
@Injectable({ providedIn: 'root' })
export class TemaService {

  private static readonly COOKIE = 'theme';

  private readonly oscuroSubject: BehaviorSubject<boolean>;

  /** Emite el tema actual al suscribirse (true = oscuro) y luego cada vez que cambia. */
  readonly oscuro$: Observable<boolean>;

  /** <link> del tema que se está descargando (si el usuario cambia de tema varias veces seguidas, se descarta). */
  private linkTemaPendiente: HTMLLinkElement | null = null;

  constructor(private cookieService: CookieService, @Inject(DOCUMENT) private document: Document) {
    this.oscuroSubject = new BehaviorSubject<boolean>(this.cookieService.get(TemaService.COOKIE) === 'dark');
    this.oscuro$ = this.oscuroSubject.pipe(distinctUntilChanged());
    this.aplicarHojaTema();
  }

  /** true si el tema actual es el oscuro. */
  get oscuro(): boolean {
    return this.oscuroSubject.value;
  }

  /** Cambia el tema, guarda la preferencia y avisa a las vistas suscritas. */
  cambiar(oscuro: boolean) {
    const tema = oscuro ? 'dark' : 'light';
    this.cookieService.set(TemaService.COOKIE, tema, { expires: 365, sameSite: 'Lax' });
    try { window.localStorage.setItem(TemaService.COOKIE, tema); } catch { /* sin localStorage: basta la cookie */ }
    this.oscuroSubject.next(oscuro);
    this.aplicarHojaTema();
  }

  /**
   * Pone el CSS de PrimeNG del tema actual sin dejar la página sin estilos: en lugar de cambiar el href del
   * <link id="app-theme"> (lo que quita el CSS actual antes de que llegue el nuevo), se agrega un <link> nuevo y el
   * anterior se quita solo cuando el nuevo terminó de cargar. El id "app-theme" pasa al nuevo, porque styles.css lo
   * usa en sus selectores.
   */
  private aplicarHojaTema() {
    const href = `lara-${this.oscuro ? 'dark' : 'light'}-blue.css`;
    this.linkTemaPendiente?.remove();
    this.linkTemaPendiente = null;

    const actual = this.document.getElementById('app-theme') as HTMLLinkElement | null;
    if (!actual || actual.getAttribute('href') === href) return; // ya está aplicado (p. ej. lo eligió index.html)

    const nuevo = this.document.createElement('link');
    nuevo.rel = 'stylesheet';
    nuevo.href = href;
    nuevo.onload = () => {
      if (this.linkTemaPendiente !== nuevo) return;
      this.linkTemaPendiente = null;
      actual.remove();
      nuevo.id = 'app-theme';
    };
    nuevo.onerror = () => { // si no se pudo descargar, se conserva el tema actual
      if (this.linkTemaPendiente === nuevo) this.linkTemaPendiente = null;
      nuevo.remove();
    };
    this.linkTemaPendiente = nuevo;
    actual.after(nuevo);
  }
}

/**
 * Ejecuta `fn` con el tema actual (true = oscuro) y de nuevo cada vez que el usuario cambie el tema. La suscripción
 * se cancela sola al destruir la vista. Debe llamarse en un contexto de inyección; lo habitual es un campo de la clase,
 * declarado justo después de la variable que actualiza:
 *
 *   modoSeleccionado: boolean;
 *   private readonly suscripcionTema = alCambiarTema(oscuro => this.modoSeleccionado = oscuro);
 *
 * Con `omitirActual: true` solo se ejecuta en los cambios, no con el tema inicial (útil para actualizar opciones de
 * gráficas que aún no existen cuando se construye la vista).
 */
export function alCambiarTema(fn: (oscuro: boolean) => void, opciones?: { omitirActual?: boolean }): Subscription {
  let cambios$ = inject(TemaService).oscuro$;
  if (opciones?.omitirActual) cambios$ = cambios$.pipe(skip(1));
  return cambios$.pipe(takeUntilDestroyed()).subscribe(fn);
}
