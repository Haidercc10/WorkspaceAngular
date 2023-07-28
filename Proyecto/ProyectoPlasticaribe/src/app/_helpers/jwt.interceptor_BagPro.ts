import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { rutaBagPro } from 'src/polyfills';
import { EncriptacionService } from '../Servicios/Encriptacion/Encriptacion.service';

@Injectable()

export class jwtInterceptor_BagPro implements HttpInterceptor {

  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService,
                private encriptacion : EncriptacionService,) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.encriptacion.decrypt(this.storage.get('Token_BagPro') == undefined ? '' : this.storage.get('Token_BagPro'));
    const isApiUrl = request.url.startsWith(rutaBagPro);
    if (token && isApiUrl) request = request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    return next.handle(request);
  }
}
