import { Inject, Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../_Services/authentication.service';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { EncriptacionService } from '../Servicios/Encriptacion/Encriptacion.service';

@Injectable()

export class JwtInterceptor implements HttpInterceptor {

  constructor(private authenticationService: AuthenticationService,
                @Inject(SESSION_STORAGE) private storage: WebStorageService,
                  private encriptacion : EncriptacionService,) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const user = this.authenticationService.userValue;
    const isLoggedIn = user?.token;
    const token = this.encriptacion.decrypt(this.storage.get('Token') == undefined ? '' : this.storage.get('Token'));
    const isApiUrl = request.url.startsWith(rutaPlasticaribeAPI);
    if (token && isApiUrl) request = request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    return next.handle(request);
  }
}
