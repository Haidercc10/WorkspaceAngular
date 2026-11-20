import { HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable, catchError, map, of } from 'rxjs';
import { EncriptacionService } from '../Servicios/Encriptacion/Encriptacion.service';
import { MensajesAplicacionService } from '../Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Vistas_PermisosService } from '../Servicios/Vistas_Permisos/Vistas_Permisos.service';
import { AuthenticationService } from '../_Services/authentication.service';

/**
 * Permite entrar a una vista solo si el rol del usuario tiene permiso (Vistas_Permisos/get_permisos).
 * El nombre de la vista viene de `data: { nombre: '...' }` de la ruta.
 *
 * La navegación espera la respuesta de la API: la vista no se crea (ni pide sus datos) hasta confirmar el permiso.
 * Los permisos concedidos se recuerdan durante la sesión (se pierden al recargar), para no consultar la API cada vez
 * que se vuelve a la misma vista.
 *
 * - Sin sesión → login.
 * - Sin permiso (404) → inicio, con un aviso. Si ni siquiera tiene permiso al inicio, se cierra la sesión.
 * - Token vencido (401/403) → el interceptor de errores ya cierra la sesión; aquí solo se cancela la navegación.
 * - Error de red o del servidor → se queda en la página actual con el error y "Ver detalles" (o va al inicio si era
 *   la primera página que se abría).
 */
@Injectable({
  providedIn: 'root'
})
export class VistasPermisosGuard implements CanActivate {

  /** Vistas solo para el usuario de pruebas. */
  private static readonly VISTAS_SOLO_PRUEBAS = ['Pruebas', 'Vistas'];
  private static readonly ID_USUARIO_PRUEBAS = 123456789;
  private static readonly VISTA_INICIO = 'Inicio';

  /** Permisos ya confirmados en esta sesión: "rol|vista". */
  private readonly permitidas = new Set<string>();

  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService,
    private vistaPermisosService: Vistas_PermisosService,
    private authenticationService: AuthenticationService,
    private encriptacion: EncriptacionService,
    private mensajes: MensajesAplicacionService,
    private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | boolean | UrlTree {
    if (!this.authenticationService.userValue) return this.router.parseUrl('/');

    const vista: string = route.data['nombre'];
    const idUsuario = this.leerNumero('Id');
    const rol = this.leerNumero('Rol');
    if (!rol) return this.router.parseUrl('/');

    if (VistasPermisosGuard.VISTAS_SOLO_PRUEBAS.includes(vista) && idUsuario !== VistasPermisosGuard.ID_USUARIO_PRUEBAS)
      return this.router.parseUrl('/home');

    const clave = `${rol}|${vista}`;
    if (this.permitidas.has(clave)) return true;

    return this.vistaPermisosService.GetPermisos(rol, vista).pipe(
      map(() => {
        this.permitidas.add(clave);
        return true;
      }),
      catchError((error: HttpErrorResponse) => of(this.rechazar(vista, error))),
    );
  }

  private rechazar(vista: string, error: HttpErrorResponse): boolean | UrlTree {
    if ([401, 403].includes(error?.status)) return false; // el interceptor de errores ya está cerrando la sesión

    const esInicio = vista === VistasPermisosGuard.VISTA_INICIO;
    if (error?.status === 404) {
      if (esInicio) {
        this.mensajes.mensajeAdvertencia('Sin acceso', 'Su rol no tiene acceso a la página de inicio. Comuníquese con soporte.', 6000);
        this.authenticationService.logout();
        return false;
      }
      this.mensajes.mensajeAdvertencia('Sin permiso', `Su rol no tiene acceso a "${vista}".`);
      return this.router.parseUrl('/home');
    }

    this.mensajes.errorDetallado(error, `No se pudo verificar el permiso para entrar a "${vista}".`, {
      operacion: `Verificar permiso de la vista "${vista}"`,
      metodo: 'GET',
    });
    // Si ya había una página abierta, se queda en ella; si era la primera, se intenta el inicio (salvo que sea el inicio)
    return this.router.navigated || esInicio ? false : this.router.parseUrl('/home');
  }

  private leerNumero(llave: string): number {
    const valor = this.storage.get(llave);
    return parseInt(this.encriptacion.decrypt(valor == undefined ? '' : valor));
  }
}
