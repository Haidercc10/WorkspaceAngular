import { Inject, Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { EncriptacionService } from '../Servicios/Encriptacion/Encriptacion.service';

@Injectable()
export class UnifiedJwtInterceptor implements HttpInterceptor {

  constructor(
    @Inject(SESSION_STORAGE) private storage: WebStorageService,
    private encriptacion: EncriptacionService,
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.url.includes('/Authentication/login')) {
      return next.handle(request);
    }

    let tokenKey = '';

    // Determinamos qué llave de token buscar según la URL
    const url = request.url;
    console.log(url);
    
    if (url.startsWith(environment.rutaPlasticaribeAPI)) {
      tokenKey = 'Token';
    } else if (url.startsWith(environment.rutaZeus)) {
      tokenKey = 'Token_InvZeus';
    } else if (url.startsWith(environment.rutaZeusContabilidad)) {
      tokenKey = 'Token_ContaZeus';
    } else if (url.startsWith(environment.rutaBagPro)) {
      tokenKey = 'Token_BagPro';
    }

    if (tokenKey) {
      const encryptedToken = this.storage.get(tokenKey);
      const token = this.encriptacion.decrypt(encryptedToken || '');

      if (token) {
        request = request.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        });
      }
    }
    return next.handle(request);
  }
}
