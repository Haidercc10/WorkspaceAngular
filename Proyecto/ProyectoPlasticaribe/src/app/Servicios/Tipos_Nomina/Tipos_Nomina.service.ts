import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class Tipos_NominaService {

  constructor(private http : HttpClient,) { }

  Get = (): Observable<any[]> => this.http.get<any>(`${rutaPlasticaribeAPI}/Tipos_Nomina`);

  GetId = (id : number): Observable<any[]> => this.http.get<any>(`${rutaPlasticaribeAPI}/Tipos_Nomina/${id}`);
}
