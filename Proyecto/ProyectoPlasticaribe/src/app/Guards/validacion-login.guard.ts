import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import {SESSION_STORAGE, WebStorageService} from 'ngx-webstorage-service';

@Injectable({
  providedIn: 'root'
})
export class ValidacionLoginGuard implements CanActivate {
  constructor(private router: Router,
               @Inject(SESSION_STORAGE) private storage: WebStorageService,) {
  }

  redirect(flag : boolean) : any{
    if (!flag) {
      this.router.navigate(['/', 'Login']);
    }
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const id = this.storage.has('Id');
    this.redirect(id);
    return id;
  }
  
}
