import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, Observable, Subscription, distinctUntilChanged, skip } from 'rxjs';

/** Preferencia de tema que elige el usuario. "system" sigue el tema de Windows/macOS en vivo. */
export type PreferenciaTema = 'light' | 'dark' | 'system';

/**
 * Tema de la aplicación (claro, oscuro o el del sistema).
 *
 * Es la única fuente de verdad del tema: guarda la preferencia (cookie "theme"), calcula el tema efectivo, cambia el
 * CSS de PrimeNG (<link id="app-theme">) y avisa a las vistas a través de `oscuro$`. Reemplaza el patrón anterior en el
 * que cada vista consultaba AppComponent.temaSeleccionado con un setInterval cada segundo.
 *
 * - `preferencia$`: lo que eligió el usuario (light / dark / system). Lo usa el selector de Apariencia.
 * - `oscuro$`: el tema que se ve realmente (true = oscuro). Con "system" cambia solo cuando cambia el sistema.
 *
 * En las vistas no se usa directamente: se usa la función `alCambiarTema` de este archivo.
 * El tema inicial lo elige index.html antes de que arranque Angular, leyendo la misma cookie (con la misma regla).
 */
@Injectable({ providedIn: 'root' })
export class TemaService {

  private static readonly COOKIE = 'theme';

  /** Consulta del tema del sistema; null si el navegador no la soporta (entonces "system" equivale a claro). */
  private readonly consultaSistema: MediaQueryList | null;

  private readonly preferenciaSubject: BehaviorSubject<PreferenciaTema>;
  private readonly oscuroSubject: BehaviorSubject<boolean>;

  /** Emite la preferencia actual al suscribirse y luego cada vez que el usuario la cambia. */
  readonly preferencia$: Observable<PreferenciaTema>;

  /** Emite el tema efectivo al suscribirse (true = oscuro) y luego cada vez que cambia. */
  readonly oscuro$: Observable<boolean>;

  /** <link> del tema que se está descargando (si el usuario cambia de tema varias veces seguidas, se descarta). */
  private linkTemaPendiente: HTMLLinkElement | null = null;

  constructor(private cookieService: CookieService, @Inject(DOCUMENT) private document: Document) {
    const ventana = this.document.defaultView;
    this.consultaSistema = ventana?.matchMedia ? ventana.matchMedia('(prefers-color-scheme: dark)') : null;

    const preferencia = TemaService.normalizar(this.cookieService.get(TemaService.COOKIE));
    this.preferenciaSubject = new BehaviorSubject<PreferenciaTema>(preferencia);
    this.oscuroSubject = new BehaviorSubject<boolean>(this.calcularOscuro(preferencia));
    this.preferencia$ = this.preferenciaSubject.pipe(distinctUntilChanged());
    this.oscuro$ = this.oscuroSubject.pipe(distinctUntilChanged());

    // Con "system", si el usuario cambia el tema de Windows mientras la app está abierta, la app lo sigue sin recargar.
    // El servicio vive lo mismo que la aplicación, por eso no se quita el listener.
    this.consultaSistema?.addEventListener?.('change', () => {
      if (this.preferencia === 'system') this.actualizarTemaEfectivo();
    });

    this.aplicarHojaTema();
  }

  /** Preferencia elegida por el usuario. */
  get preferencia(): PreferenciaTema {
    return this.preferenciaSubject.value;
  }

  /** true si el tema que se ve es el oscuro (ya resuelto si la preferencia es "system"). */
  get oscuro(): boolean {
    return this.oscuroSubject.value;
  }

  /** true si el sistema operativo está en modo oscuro (para mostrar "Ahora: oscuro" junto a la opción Sistema). */
  get sistemaOscuro(): boolean {
    return !!this.consultaSistema?.matches;
  }

  /** Guarda la preferencia del usuario, aplica el tema resultante y avisa a las vistas suscritas. */
  establecerPreferencia(preferencia: PreferenciaTema) {
    preferencia = TemaService.normalizar(preferencia);
    this.cookieService.set(TemaService.COOKIE, preferencia, { expires: 365, sameSite: 'Lax' });
    this.preferenciaSubject.next(preferencia);
    this.actualizarTemaEfectivo();
  }

  /** Fija el tema claro u oscuro (deja de seguir al sistema). Se mantiene por compatibilidad con el código existente. */
  cambiar(oscuro: boolean) {
    this.establecerPreferencia(oscuro ? 'dark' : 'light');
  }

  private actualizarTemaEfectivo() {
    this.oscuroSubject.next(this.calcularOscuro(this.preferencia));
    this.aplicarHojaTema();
  }

  private calcularOscuro(preferencia: PreferenciaTema): boolean {
    return preferencia === 'system' ? this.sistemaOscuro : preferencia === 'dark';
  }

  /** Cualquier valor desconocido (cookie vacía o manipulada) se toma como claro, igual que en index.html. */
  private static normalizar(valor: string): PreferenciaTema {
    return valor === 'dark' || valor === 'system' ? valor : 'light';
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
 * Ejecuta `fn` con el tema actual (true = oscuro) y de nuevo cada vez que cambie el tema que se ve (porque el usuario
 * lo cambió o, con la opción "Sistema", porque cambió el del sistema operativo). La suscripción se cancela sola al
 * destruir la vista. Debe llamarse en un contexto de inyección; lo habitual es un campo de la clase, declarado justo
 * después de la variable que actualiza:
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
