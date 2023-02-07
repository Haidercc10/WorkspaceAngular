import { Inject, Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService_InvZeus } from '../_Services/authentication_InvZeus.service';
import { rutaZeus } from 'src/polyfills';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';

@Injectable()

export class JwtInterceptor_InvZeus implements HttpInterceptor {

  constructor(private authenticationService: AuthenticationService_InvZeus,
                @Inject(SESSION_STORAGE) private storage: WebStorageService,) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const user = this.authenticationService.userValue;
    const isLoggedIn = user?.token;
    const token = this.storage.get('Token_Inv_Zeus');
    const isApiUrl = request.url.startsWith(rutaZeus);
    if (token && isApiUrl) request = request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    return next.handle(request);
  }
}
