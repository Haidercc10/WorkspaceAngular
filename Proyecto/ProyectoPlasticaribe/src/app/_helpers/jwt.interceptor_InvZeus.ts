import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { EncriptacionService } from '../Servicios/Encriptacion/Encriptacion.service';
import { environment } from 'src/environments/environment';

@Injectable()

export class JwtInterceptor_InvZeus implements HttpInterceptor {

  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService,
                private encriptacion : EncriptacionService,) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.encriptacion.decrypt(this.storage.get('Token_Inv_Zeus') == undefined ? '' : this.storage.get('Token_Inv_Zeus'));
    const isApiUrl = request.url.startsWith(environment.rutaZeus);
    if (token && isApiUrl) request = request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    return next.handle(request);
  }
}
