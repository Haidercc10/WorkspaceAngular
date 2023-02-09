import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../_Models/user';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { MovimientosAplicacionService } from '../Servicios/Movimientos_Aplicacion/MovimientosAplicacion.service';
import moment from 'moment';
import { AuthenticationService_InvZeus } from './authentication_InvZeus.service';
import { authentication_ContaZeus } from './authentication_ContaZeus.service';
import { authentication_BagPro } from './authentication_BagPro.service';

@Injectable({ providedIn: 'root' })

export class AuthenticationService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;
  private userSubject: BehaviorSubject<User | null>;
  public user: Observable<User | null>;
  data:any=[];

  constructor(private router: Router,
                private http: HttpClient,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                    private movAplicacionService : MovimientosAplicacionService,
                      private authenticationInvZeusService : AuthenticationService_InvZeus,
                        private authenticationContaZeusService : authentication_ContaZeus,
                          private authenticationBagPro : authentication_BagPro,) {

    this.userSubject = new BehaviorSubject(JSON.parse(localStorage.getItem('user')!));
    this.user = this.userSubject.asObservable();
  }

  public get userValue() {
    return this.userSubject.value;
  }

  saveInLocal(key, val): void {
    this.storage.set(key, val);
    this.data[key]= this.storage.get(key);
  }

  login(datos : any) {
    return this.http.post<any>(`${this.rutaPlasticaribeAPI}/Authentication/login`, datos).pipe(map(user => {
      this.saveInLocal('Token', user.token);
      localStorage.setItem('user', JSON.stringify(user));
      this.userSubject.next(user);
      return user;
    }));
  }

  logout() {
    let infoMovimientoAplicacion : any = {
      "Usua_Id" : this.storage.get('Id'),
      "MovApp_Nombre" : `Se cerró la sesión del usuario "${this.storage.get('Nombre')}"`,
      "MovApp_Descripcion" : `El usuario "${this.storage.get('Nombre')}" con el ID ${this.storage.get('Id')} cerró sesión en el programa el día ${moment().format('YYYY-MM-DD')} a las ${moment().format('H:mm:ss')} horas.`,
      "MovApp_Fecha" : moment().format('YYYY-MM-DD'),
      "MovApp_Hora" : moment().format('H:mm:ss'),
    }
    this.movAplicacionService.insert(infoMovimientoAplicacion).subscribe(datos => { });
    localStorage.clear();
    this.storage.clear();
    this.userSubject.next(null);
    this.authenticationInvZeusService.logout();
    this.authenticationContaZeusService.logout();
    this.authenticationBagPro.logout();
    window.location.pathname = '/';
  }
}
