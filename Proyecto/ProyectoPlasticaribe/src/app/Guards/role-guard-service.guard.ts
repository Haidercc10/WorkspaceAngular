import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../_Services/authentication.service';

@Injectable({
  providedIn: 'root'
})

export class RoleGuardServiceGuard implements CanActivate {

  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService,
                private router: Router,
                  private authenticationService: AuthenticationService){ }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const user = this.authenticationService.userValue;
    if (user) {
      const expectedRole = route.data['expectedRole'];
      let rol = this.storage.get('Rol');
      if (!rol) rol = user.rolUsu_Id;
      if (!expectedRole.includes(rol)) this.router.navigate(['/home']);
      return expectedRole;
    }
    this.router.navigate(['/'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
