import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class RoleGuardServiceGuard implements CanActivate {

  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService,){ }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const expectedRole = route.data['expectedRole'];
    const rol = this.storage.get('Rol');
    if (!expectedRole.includes(rol)) window.location.href = './';
    return expectedRole

  }

}
