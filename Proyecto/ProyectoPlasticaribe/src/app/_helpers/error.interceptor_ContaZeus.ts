import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { authentication_ContaZeus } from '../_Services/authentication_ContaZeus.service';

@Injectable()

export class ErrorInterceptor_ContaZeus implements HttpInterceptor {
  constructor(private authenticationService: authentication_ContaZeus) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(err => {
      // En el login un 401/403 es "credenciales incorrectas" o "usuario inactivo": lo maneja la pantalla de login, no se cierra sesión.
      if ([401, 403].includes(err.status) && !request.url.includes('/Authentication/login')) this.authenticationService.logout();
      return throwError(err);
    }));
  }
}
