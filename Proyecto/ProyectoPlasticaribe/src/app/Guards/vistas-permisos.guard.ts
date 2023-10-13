import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { EncriptacionService } from '../Servicios/Encriptacion/Encriptacion.service';
import { Vistas_PermisosService } from '../Servicios/Vistas_Permisos/Vistas_Permisos.service';
import { AuthenticationService } from '../_Services/authentication.service';

@Injectable({
  providedIn: 'root'
})

export class VistasPermisosGuard implements CanActivate {

  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService,
                private vistaPermisosService : Vistas_PermisosService,
                  private authenticationService: AuthenticationService,
                    private encriptacion : EncriptacionService,
                      private router: Router){ }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const usuario : any = this.authenticationService.userValue;
    if(!usuario) return false;
    const ruta = route.data['nombre'];
    let Id_usuario = parseInt(this.encriptacion.decrypt(this.storage.get('Id') == undefined ? '' : this.storage.get('Id')));
    let rol = parseInt(this.encriptacion.decrypt(this.storage.get('Rol') == undefined ? '' : this.storage.get('Rol')));
    this.vistaPermisosService.GetPermisos(rol,ruta).toPromise().then(() => {
      return (['Pruebas', 'Vistas'].includes(ruta) && Id_usuario != 123456789) ? this.router.navigateByUrl('/') : true;
    }).catch(() => this.router.navigateByUrl('/'));
    return true;
  }
}