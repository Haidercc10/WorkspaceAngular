import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../_Services/authentication.service';
import { EncriptacionService } from '../Servicios/Encriptacion/Encriptacion.service';

@Injectable({
  providedIn: 'root'
})

export class RoleGuardServiceGuard implements CanActivate {

  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService,
                private router: Router,
                  private authenticationService: AuthenticationService,
                    private encriptacion : EncriptacionService,){ }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const user = this.authenticationService.userValue;
    if (user) {
      const expectedRole = route.data['expectedRole'];
      let rol = parseInt(this.encriptacion.decrypt(this.storage.get('Rol')));
      if (!rol) rol = user.rolUsu_Id;
      if (!expectedRole.includes(rol)) window.location.pathname = '/home';
      return expectedRole;
    }
    window.location.pathname = '/'
    return false;
  }
}
