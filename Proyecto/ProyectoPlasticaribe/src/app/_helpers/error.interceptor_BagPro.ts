import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { authentication_BagPro } from '../_Services/authentication_BagPro.service';

@Injectable()

export class errorInterceptor_BagPro implements HttpInterceptor {
  constructor(private authenticationService: authentication_BagPro) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(err => {
      if ([401, 403].includes(err.status)) this.authenticationService.logout();
      const error = err.error.message || err.statusText;
      return throwError(err);
    }));
  }
}
