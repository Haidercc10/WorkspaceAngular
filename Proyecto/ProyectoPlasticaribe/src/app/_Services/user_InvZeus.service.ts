import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { user_Conta_Zeus } from '../_Models/user_Conta_Zeus';
import { rutaZeus } from 'src/polyfills';

@Injectable({ providedIn: 'root' })

export class UserService {

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<user_Conta_Zeus[]>(`${rutaZeus}/users`);
  }
}
