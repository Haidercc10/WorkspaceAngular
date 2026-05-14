import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthenticationService } from '../_Services/authentication.service';
import { AuthenticationService_InvZeus } from '../_Services/authentication_InvZeus.service';
import { authentication_ContaZeus } from '../_Services/authentication_ContaZeus.service';
import { authentication_BagPro } from '../_Services/authentication_BagPro.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class UnifiedErrorInterceptor implements HttpInterceptor {

  constructor(private authPlasticaribe: AuthenticationService,
    private authInvZeus: AuthenticationService_InvZeus,
    private authContabilidadZeus: authentication_ContaZeus,
    private authBagpro: authentication_BagPro,
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError(err => {
        // Si cualquiera de las APIs devuelve 401 o 403, cerramos sesión
        if ([401, 403].includes(err.status)) {
          const url = request.url;
          console.log(url)
          if (!request.url.includes('/Authentication/login')) {
            // Lógica de logout condicional según URL...
            if (url.startsWith(environment.rutaPlasticaribeAPI)) {
              this.authPlasticaribe.logout();
            } else if (url.startsWith(environment.rutaZeus)) {
              this.authInvZeus.logout();
            } else if (url.startsWith(environment.rutaZeusContabilidad)) {
              this.authContabilidadZeus.logout();
            } else if (url.startsWith(environment.rutaBagPro)) {
              this.authBagpro.logout();
            }
          }
        }
        // Puedes agregar un log específico para depurar esos 57 segundos
        if (err.status === 0) {
          console.error('La petición fue cancelada o el servidor no respondió (Timeout/Queueing)');
        }

        // Retornamos el error original para que el componente pueda mostrar alertas si lo desea
        return throwError(() => err);
      })
    );
  }
}
