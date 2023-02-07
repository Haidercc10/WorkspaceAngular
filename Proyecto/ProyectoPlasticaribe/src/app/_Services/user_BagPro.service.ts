import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User_BagPro } from '../_Models/user_BagPro';
import { rutaBagPro } from 'src/polyfills';

@Injectable({ providedIn: 'root' })

export class UserBagProService {

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<User_BagPro[]>(`${rutaBagPro}/users`);
  }
}
