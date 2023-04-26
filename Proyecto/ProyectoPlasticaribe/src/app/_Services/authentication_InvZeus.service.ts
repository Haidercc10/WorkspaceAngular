import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User_Inv_Zeus } from '../_Models/user_Inv_Zeus';
import { rutaZeus } from 'src/polyfills';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { EncriptacionService } from '../Servicios/Encriptacion/Encriptacion.service';

@Injectable({ providedIn: 'root' })

export class AuthenticationService_InvZeus {
  readonly rutaZeus = rutaZeus;
  private userSubject: BehaviorSubject<User_Inv_Zeus | null>;
  public user: Observable<User_Inv_Zeus | null>;
  data:any=[];

  constructor(private router: Router,
                private http: HttpClient,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                  private encriptacion : EncriptacionService,) {

    let token = this.encriptacion.decrypt(localStorage.getItem('user_Inv_Zeus') == null ? '' : localStorage.getItem('user_Inv_Zeus'))
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

  login() {
    let datos : any = { "Id_Usuario" : 123456798, "Contrasena" : "", }
    return this.http.post<any>(`${this.rutaZeus}/Authentication/login`, datos).pipe(map(user => {
      this.saveInLocal('Token_Inv_Zeus', this.encriptacion.encrypt(user.token));
      localStorage.setItem('user_Inv_Zeus', this.encriptacion.encrypt(JSON.stringify(user)));
      this.saveInLocal('', user.token);
      localStorage.setItem('', JSON.stringify(user));
      this.userSubject.next(user);
      return user;
    }));
  }

  logout() {
    localStorage.removeItem('user_Inv_Zeus');
    this.storage.clear();
    this.userSubject.next(null);
    this.router.navigate(['/']);
  }
}
