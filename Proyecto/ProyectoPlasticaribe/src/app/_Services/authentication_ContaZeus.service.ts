import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { user_Conta_Zeus } from '../_Models/user_Conta_Zeus';
import { rutaZeusContabilidad } from 'src/polyfills';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { EncriptacionService } from '../Servicios/Encriptacion/Encriptacion.service';

@Injectable({ providedIn: 'root' })

export class authentication_ContaZeus {
  readonly rutaZeusContabilidad = rutaZeusContabilidad;
  private userSubject: BehaviorSubject<user_Conta_Zeus | null>;
  public user: Observable<user_Conta_Zeus | null>;
  data:any=[];

  constructor(private router: Router,
                private http: HttpClient,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                    private encriptacion : EncriptacionService,) {

    this.userSubject = new BehaviorSubject(JSON.parse(this.encriptacion.decrypt(localStorage.getItem('user_Conta_Zeus'))!));
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
    let datos : any = { "Id_Usuario" : 123456987, "Contrasena" : "123456987", }
    return this.http.post<any>(`${this.rutaZeusContabilidad}/Authentication/login`, datos).pipe(map(user => {
      this.saveInLocal('Token_Conta_Zeus', this.encriptacion.encrypt(user.token));
      localStorage.setItem('user_Conta_Zeus', this.encriptacion.encrypt(JSON.stringify(user)));
      this.userSubject.next(user);
      return user;
    }));
  }

  logout() {
    localStorage.removeItem('user_Conta_Zeus');
    this.storage.clear();
    this.userSubject.next(null);
    this.router.navigate(['/']);
  }
}
