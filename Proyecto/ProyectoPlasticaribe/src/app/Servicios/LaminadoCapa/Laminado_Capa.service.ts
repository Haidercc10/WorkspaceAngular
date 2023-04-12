import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelLaminadoCapas } from '../../Modelo/modelLaminadoCapas';

@Injectable({
  providedIn: 'root'
})
export class Laminado_CapaService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }


  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Laminado_Capa');
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Laminado_Capa/${dato}`);
  }

  srvObtenerListaPorConsultaLaminado(c1 : string, c2 : string, c3 : string){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Laminado_Capa/consultaLaminado/${c1}/${c2}/${c3}`);
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
