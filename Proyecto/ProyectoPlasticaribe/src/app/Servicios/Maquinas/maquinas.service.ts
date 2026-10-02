import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class MaquinasService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI; // Reemplaza con la URL de tu API

  constructor(private http: HttpClient) { }

  getMaquinasPorProceso(proceso: string) : Observable<any> {
    return this.http.get<any>(`${this.rutaPlasticaribeAPI}/Maquinas/GetMaquinasPorProceso/${proceso}`);
  }
}
