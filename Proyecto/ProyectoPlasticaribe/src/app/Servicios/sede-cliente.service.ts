import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelSedesClientes } from '../Modelo/modelSedesClientes';

@Injectable({
  providedIn: 'root'
})
export class SedeClienteService {

  readonly rutaPlasticaribeAPI = "http://192.168.0.153:9085/api";

  constructor(private http : HttpClient) { }

  //Metodo buscar lista de Productos
  srvObtenerLista():Observable<any[]> {

    return this.http.get<any>(this.rutaPlasticaribeAPI + '/SedesClientes')

  }
  
  srvObtenerListaPorId(id : number){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/SedesClientes/${id}`);
  }

  //Metodo agregar Productos
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/SedesClientes', data)
  }

  //Metodo actualzar Productos
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/SedesClientes/${id}`, data);
  }

  //Metodo eliminar Productos
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/SedesClientes/${id}`);
  }

  //
  srvGuardar(data : modelSedesClientes): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/SedesClientes', data)
  }
}
