import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Tipos_NominaService {
  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
  constructor(private http : HttpClient,) { }

  Get = (): Observable<any[]> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Tipos_Nomina`);

  GetId = (id : number): Observable<any[]> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Tipos_Nomina/${id}`);
}
