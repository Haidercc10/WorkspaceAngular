import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrazabilidadProduccionService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
    
    constructor(private http : HttpClient,) { }

  PostTraceability = (data : any): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Trazabilidad_Produccion', data);
}
