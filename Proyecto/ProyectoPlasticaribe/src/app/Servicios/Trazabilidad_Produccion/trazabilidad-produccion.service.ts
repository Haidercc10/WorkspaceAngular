import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrazabilidadProduccionService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
  
    constructor(private http : HttpClient,) { }
  
    getAll = () => this.http.get<any>(this.rutaPlasticaribeAPI + '/Trazabilidad_Produccion');
  
    getId = (dato : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Trazabilidad_Produccion/${dato}`);
  
    getTraceability = (date1 : any, date2 : any, url? : string) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Trazabilidad_Produccion/getTraceability/${date1}/${date2}`);
  
}
