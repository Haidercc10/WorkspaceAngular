﻿import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../_Models/user';
import { rutaZeusContabilidad } from 'src/polyfills';

@Injectable({ providedIn: 'root' })

export class UserService {

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<User[]>(`${rutaZeusContabilidad}/users`);
  }
}