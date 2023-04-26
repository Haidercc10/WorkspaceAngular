import { Inject, Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { authentication_BagPro } from '../_Services/authentication_BagPro.service';
import { rutaBagPro } from 'src/polyfills';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { EncriptacionService } from '../Servicios/Encriptacion/Encriptacion.service';

@Injectable()

export class jwtInterceptor_BagPro implements HttpInterceptor {

  constructor(private authenticationService: authentication_BagPro,
                @Inject(SESSION_STORAGE) private storage: WebStorageService,
                  private encriptacion : EncriptacionService,) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const user = this.authenticationService.userValue;
    const isLoggedIn = user?.token;
    const token = this.encriptacion.decrypt(this.storage.get('Token_BagPro') == undefined ? '' : this.storage.get('Token_BagPro'));
    const isApiUrl = request.url.startsWith(rutaBagPro);
    if (token && isApiUrl) request = request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    return next.handle(request);
  }
}
