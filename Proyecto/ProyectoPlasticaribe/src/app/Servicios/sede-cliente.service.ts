import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelSedesClientes } from '../Modelo/modelSedesClientes';

@Injectable({
  providedIn: 'root'
})
export class SedeClienteService {

  readonly rutaPlasticaribeAPI = "https://localhost:7137/api";

  constructor(private http : HttpClient) { }

  //Metodo buscar lista de Productos
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Clientes')
  }

  //Metodo agregar Productos
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Clientes', data)
  }

  //Metodo actualzar Productos
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Clientes/${id}`, data);
  }

  //Metodo eliminar Productos
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Clientes/${id}`);
  }

  //
  srvGuardar(data : modelSedesClientes): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Clientes', data)
  }
}
