import { Injectable } from '@angular/core';
import { Subscription, combineLatest } from 'rxjs';
import { TamanoLetraService } from '../TamanoLetra/TamanoLetra.service';
import { PreferenciaTema, TemaService } from '../Tema/Tema.service';

/** Apariencia guardada de un usuario. */
interface AparienciaGuardada {
  tema: PreferenciaTema;
  tamanoLetra: number;
}

/**
 * Apariencia (tema y tamaño de letra) por usuario, guardada en el navegador.
 *
 * En los PCs compartidos de planta la cookie de apariencia es una sola para todos. Este servicio guarda la apariencia
 * de cada usuario en localStorage ("apariencia:<idUsuario>"), la aplica al iniciar sesión y, al cerrar sesión, deja la
 * apariencia por defecto (Claro y 100 %), así el siguiente usuario ve el login neutro y luego recupera la suya.
 *
 * Se recuerda por usuario en cada PC (no viaja entre PCs: no hay cambios en la base de datos ni en las APIs).
 * TemaService y TamanoLetraService siguen siendo la fuente de verdad de lo que se ve; la cookie sigue sirviendo para
 * que index.html pinte sin parpadeo.
 */
@Injectable({ providedIn: 'root' })
export class PreferenciasUsuarioService {

  /** Prefijo de las llaves en localStorage. TutorialesService lo conserva al limpiar localStorage en login/logout. */
  static readonly PREFIJO = 'apariencia:';

  private suscripcion?: Subscription;

  constructor(private temaService: TemaService, private tamanoLetraService: TamanoLetraService) { }

  /**
   * Aplica la apariencia guardada del usuario y, desde ese momento, guarda cada cambio bajo su id.
   * Si el usuario no tiene nada guardado en este PC, se guarda la apariencia actual: quien ya la tenía configurada
   * en la cookie antes de este cambio no la pierde.
   */
  iniciarSesion(usuarioId: number | string | null | undefined) {
    this.detener();
    const id = `${usuarioId ?? ''}`.trim();
    if (!id || id === 'NaN') return;

    const llave = PreferenciasUsuarioService.PREFIJO + id;
    const guardada = PreferenciasUsuarioService.leer(llave);
    if (guardada) {
      this.temaService.establecerPreferencia(guardada.tema);
      this.tamanoLetraService.establecer(guardada.tamanoLetra);
    }

    // combineLatest emite de inmediato con los valores actuales (guarda la primera vez) y luego en cada cambio
    this.suscripcion = combineLatest([this.temaService.preferencia$, this.tamanoLetraService.porcentaje$])
      .subscribe(([tema, tamanoLetra]) => PreferenciasUsuarioService.escribir(llave, { tema, tamanoLetra }));
  }

  /**
   * Deja de guardar cambios y vuelve a la apariencia por defecto (Claro y 100 %). Se llama al cerrar sesión y al
   * mostrar el login. Primero se detiene el guardado para no sobrescribir la apariencia del usuario con la de defecto.
   */
  cerrarSesion() {
    this.detener();
    this.temaService.establecerPreferencia('light');
    this.tamanoLetraService.restablecer();
  }

  private detener() {
    this.suscripcion?.unsubscribe();
    this.suscripcion = undefined;
  }

  /** Lee y valida lo guardado; si no existe o está dañado, null (los servicios ajustan valores fuera de rango). */
  private static leer(llave: string): AparienciaGuardada | null {
    try {
      const valor = JSON.parse(window.localStorage.getItem(llave) ?? 'null');
      if (!valor || !['light', 'dark', 'system'].includes(valor.tema) || !isFinite(valor.tamanoLetra)) return null;
      return { tema: valor.tema, tamanoLetra: Number(valor.tamanoLetra) };
    } catch {
      return null; // sin localStorage o JSON dañado
    }
  }

  private static escribir(llave: string, apariencia: AparienciaGuardada) {
    try { window.localStorage.setItem(llave, JSON.stringify(apariencia)); } catch { /* sin localStorage: queda la cookie */ }
  }
}
