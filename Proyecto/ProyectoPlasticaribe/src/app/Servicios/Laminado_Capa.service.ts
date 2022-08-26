import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelLaminadoCapas } from '../Modelo/modelLaminadoCapas';

@Injectable({
  providedIn: 'root'
})
export class Laminado_CapaService {

  readonly rutaPlasticaribeAPI =  rutaPlasticaribeAPI; /*"https://localhost:7137/api"*/;

  //Encapsular httpclient en el constructor
  constructor(private http: HttpClient) { }

  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Laminado_Capa');
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Laminado_Capa/${dato}`);
  }

  srvActualizar(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Laminado_Capa/${id}`, data);
  }

  srvEliminar(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Laminado_Capa/${id}`);
  }

  srvGuardar(data : modelLaminadoCapas): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/Laminado_Capa', data);
  }

}
