import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User_BagPro } from '../_Models/user_BagPro';
import { rutaBagPro } from 'src/polyfills';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { EncriptacionService } from '../Servicios/Encriptacion/Encriptacion.service';

@Injectable({ providedIn: 'root' })

export class authentication_BagPro {

  readonly rutaBagPro = rutaBagPro;
  private userSubject: BehaviorSubject<User_BagPro | null>;
  public user: Observable<User_BagPro | null>;
  data:any=[];

  constructor(private router: Router,
                private http: HttpClient,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                    private encriptacion : EncriptacionService,) {

    this.userSubject = new BehaviorSubject(JSON.parse(this.encriptacion.decrypt(localStorage.getItem('user_BagPro'))!));
    this.user = this.userSubject.asObservable();
  }

  public get userValue() { return this.userSubject.value; }

  saveInLocal(key, val): void {
    this.storage.set(key, val);
    this.data[key]= this.storage.get(key);
  }

  login() {
    let datos : any = { "Id_Usuario" : 1234568879, "Contrasena" : "123456879", }
    return this.http.post<any>(`${this.rutaBagPro}/Authentication/login`, datos).pipe(map(user => {
      this.saveInLocal('Token_BagPro', this.encriptacion.encrypt(user.token));
      localStorage.setItem('user_BagPro', this.encriptacion.encrypt(JSON.stringify(user)));
      this.userSubject.next(user);
      return user;
    }));
  }

  logout() {
    localStorage.removeItem('user_BagPro');
    this.storage.clear();
    this.userSubject.next(null);
    this.router.navigate(['/']);
  }
}
