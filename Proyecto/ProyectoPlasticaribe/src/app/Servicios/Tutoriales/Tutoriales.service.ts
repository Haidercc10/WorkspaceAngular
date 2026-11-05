import { Injectable } from '@angular/core';
import { ShepherdService } from 'angular-shepherd';
import Step from 'shepherd.js/src/types/step';
import { defaultStepOptions } from 'src/app/data';

/**
 * Tutoriales guiados (Shepherd) reutilizables por cualquier módulo.
 *
 * Uso típico en un componente:
 * ```ts
 * tutorial = () => this.tutoriales.iniciar(pasosTutorialX({ ... }));
 * // en ngOnInit, cuando la pantalla ya cargó:
 * this.tutoriales.iniciarPrimeraVez('modulo-x-v1', this.AppComponent.storage_Id, () => pasosTutorialX({ ... }));
 * ```
 * Para volver a mostrar el tutorial automático a todos (p. ej. tras cambios grandes), sube la versión de la clave (`-v2`).
 */
@Injectable({ providedIn: 'root' })
export class TutorialesService {

  private static readonly PREFIJO_CLAVE = 'tutorialVisto:';

  constructor(private shepherd : ShepherdService) { }

  /** Inicia el tutorial con los pasos indicados (cierra cualquier otro que esté abierto). */
  iniciar(pasos : Step.StepOptions[]) {
    if (!pasos.length) return;
    if (this.shepherd.isActive) this.shepherd.cancel();
    this.shepherd.defaultStepOptions = defaultStepOptions;
    this.shepherd.modal = true;
    this.shepherd.confirmCancel = false;
    this.shepherd.addSteps(pasos);
    this.shepherd.start();
  }

  /** Si hay un tutorial en pantalla. */
  get activo() : boolean {
    return this.shepherd.isActive;
  }

  /** Cierra el tutorial abierto (p. ej. al salir de la página, para que no quede encima de otra). */
  cancelar() {
    if (this.shepherd.isActive) this.shepherd.cancel();
  }

  /**
   * Inicia el tutorial solo la primera vez que ese usuario entra (se recuerda en este navegador).
   * Se guarda por usuario porque en planta varios trabajadores comparten el mismo equipo.
   * @param clave Identificador del tutorial con su versión, p. ej. `tickets-v2`.
   * @param pasos Función que arma los pasos (se llama solo si de verdad se va a mostrar).
   * @param retrasoMs Espera para que la pantalla termine de dibujarse antes de resaltar elementos.
   * @returns true si lo inició.
   */
  iniciarPrimeraVez(clave : string, usuarioId : number | string | null | undefined, pasos : () => Step.StepOptions[], retrasoMs : number = 600) : boolean {
    const llave = `${TutorialesService.PREFIJO_CLAVE}${clave}:${usuarioId ?? 'anonimo'}`;
    if (this.leer(llave) || this.shepherd.isActive) return false;
    this.guardar(llave); // se marca al iniciar: si lo cierra, no vuelve a salir solo (queda el botón "i")
    setTimeout(() => this.iniciar(pasos()), retrasoMs);
    return true;
  }

  /**
   * Para `beforeShowPromise` de un paso: ejecuta una acción (cambiar de pestaña, abrir un panel...)
   * y espera a que el elemento exista en pantalla antes de mostrar el paso.
   */
  static prepararPantalla(accion : (() => void) | null, selector : string, esperaMaximaMs : number = 2000) : () => Promise<void> {
    return () => new Promise<void>(resolver => {
      accion?.();
      const inicio = Date.now();
      const revisar = () => {
        const elemento = document.querySelector(selector) as HTMLElement | null;
        if ((elemento && elemento.offsetParent !== null) || Date.now() - inicio > esperaMaximaMs) resolver();
        else setTimeout(revisar, 50);
      };
      setTimeout(revisar, 0);
    });
  }

  /**
   * Reemplazo de `localStorage.clear()` para login/logout: borra todo excepto las marcas de tutoriales vistos,
   * así el usuario no vuelve a ver el tutorial automático cada vez que inicia sesión.
   */
  static limpiarLocalStorageConservandoTutoriales() {
    try {
      const conservar : [string, string][] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const llave = window.localStorage.key(i);
        if (llave?.startsWith(TutorialesService.PREFIJO_CLAVE)) conservar.push([llave, window.localStorage.getItem(llave) ?? '1']);
      }
      window.localStorage.clear();
      conservar.forEach(([llave, valor]) => window.localStorage.setItem(llave, valor));
    } catch { /* sin almacenamiento: nada que limpiar */ }
  }

  // localStorage puede no estar disponible (modo privado / bloqueado): nunca debe romper la pantalla.
  private leer(llave : string) : boolean {
    try { return window.localStorage.getItem(llave) === '1'; } catch { return false; }
  }

  private guardar(llave : string) {
    try { window.localStorage.setItem(llave, '1'); } catch { /* sin almacenamiento: se mostrará de nuevo */ }
  }
}
