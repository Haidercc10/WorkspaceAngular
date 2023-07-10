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
                      private router : Router){ }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const usuario : any = this.authenticationService.userValue;
    if(usuario){
      const ruta = route.data['nombre'];
      let rol = parseInt(this.encriptacion.decrypt(this.storage.get('Rol') == undefined ? '' : this.storage.get('Rol')));
      this.vistaPermisosService.GetPermisos(rol,ruta).toPromise().catch(() => this.router.navigate['/home']);
      return true;
    }
    return this.router.navigate['/'];
  }
  
}
