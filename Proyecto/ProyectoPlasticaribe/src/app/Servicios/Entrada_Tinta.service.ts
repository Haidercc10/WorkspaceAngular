import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelEntrada_Tinta } from '../Modelo/modelEntrada_Tinta';

@Injectable({
  providedIn: 'root'
})
export class Entrada_TintaService {


  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  constructor(private http : HttpClient) { }

  //
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Entrada_Tintas');
  }

  srvObtenerUltimoId():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Entrada_Tintas/ultimoId');
  }

  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Entrada_Tintas/${id}`);
  }

  //
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Entrada_Tintas/${id}`, data);
  }

  //
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Entrada_Tintas/${id}`);
  }

  //
  srvGuardar(data : modelEntrada_Tinta): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Entrada_Tintas', data)
  }

}