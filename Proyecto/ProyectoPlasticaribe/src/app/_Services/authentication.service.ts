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
import Swal from 'sweetalert2';
import { EncriptacionService } from '../Servicios/Encriptacion/Encriptacion.service';

@Injectable({ providedIn: 'root' })

export class AuthenticationService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;
  private userSubject: BehaviorSubject<User | null>;
  public user: Observable<User | null>;
  data:any=[];

  constructor(private http: HttpClient,
                @Inject(SESSION_STORAGE) private storage: WebStorageService,
                  private movAplicacionService : MovimientosAplicacionService,
                    private authenticationInvZeusService : AuthenticationService_InvZeus,
                      private authenticationContaZeusService : authentication_ContaZeus,
                        private authenticationBagPro : authentication_BagPro,
                          private encriptacion : EncriptacionService,) {

    let token = this.encriptacion.decrypt(localStorage.getItem('user') == undefined ? '' : localStorage.getItem('user'));
    this.userSubject = new BehaviorSubject(JSON.parse(token == '' ? null : token!));
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
      this.saveInLocal('Token', this.encriptacion.encrypt(user.token));
      localStorage.setItem('user', this.encriptacion.encrypt(JSON.stringify(user)));
      this.userSubject.next(user);
      return user;
    }));
  }

  logout() {
    let id = this.encriptacion.decrypt(this.storage.get('Id'));
    let Nombre = this.encriptacion.decrypt(this.storage.get('Nombre'));
    let infoMovimientoAplicacion : any = {
      "Usua_Id" : id,
      "MovApp_Nombre" : `Cierre de sesión`,
      "MovApp_Descripcion" : `El usuario "${Nombre}" con el ID ${id} cerró sesión el día ${moment().format('YYYY-MM-DD')} a las ${moment().format('H:mm:ss')} horas.`,
      "MovApp_Fecha" : moment().format('YYYY-MM-DD'),
      "MovApp_Hora" : moment().format('H:mm:ss'),
    }
    this.movAplicacionService.insert(infoMovimientoAplicacion).subscribe(() => {
      localStorage.clear();
      this.storage.clear();
      this.userSubject.next(null);
      this.authenticationInvZeusService.logout();
      this.authenticationContaZeusService.logout();
      this.authenticationBagPro.logout();
      window.location.pathname = '/';
    }, () => { Swal.fire({ icon: 'error', title: 'Error de Cierre de Sesión', text: '¡No se registró el cierre de sesión del usuario!' }); });
  }
}
