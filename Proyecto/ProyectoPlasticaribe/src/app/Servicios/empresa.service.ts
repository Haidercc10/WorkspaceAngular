import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelEmpresa } from '../Modelo/modelEmpresa';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {

  readonly rutaPlasticaribeAPI = "https://192.168.0.153:7137/api";

  constructor(private http : HttpClient) { }

  //Metodo buscar lista de Cajacompensacion
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Empresas')
  }

  srvObtenerListaPorId(id : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Empresas/${id}`)
  }
  //Metodo agregar Cajacompensacion
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Empresas', data)
  }
  //Metodo actualzar Cajacompensacion
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Empresas/${id}`, data);
  }
  //Metodo eliminar Cajacompensacion
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Empresas/${id}`);
  }

  srvGuardar(data: modelEmpresa): Observable<any> {
  return this.http.post(this.rutaPlasticaribeAPI + '/Empresas', data)
  }


}