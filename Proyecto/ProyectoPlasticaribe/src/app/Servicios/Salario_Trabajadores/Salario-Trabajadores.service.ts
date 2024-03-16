import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class SalarioTrabajadoresService {

  constructor(private http: HttpClient) { }

  readonly routeAPIPlasticaribe: string = environment.rutaPlasticaribeAPI;

  PutMoneySave = (data: Array<DataMoneySave>) => this.http.put(`${this.routeAPIPlasticaribe}/SalariosTrabajadores/putMoneySave`, data);
}

export interface DataMoneySave {
  idWorker: number;
  value: number;
}
