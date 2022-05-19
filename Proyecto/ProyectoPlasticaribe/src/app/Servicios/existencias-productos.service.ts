import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelExistenciaProductos } from '../Modelo/modelExisteciaProductos';

@Injectable({
  providedIn: 'root'
})
export class ExistenciasProductosService {

  readonly rutaPlasticaribeAPI = "https://localhost:7137/api";

  constructor(private http : HttpClient) { }

  //Metodo buscar lista
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Existencia_Productos')
  }

  srvObtenerListaPorId(id : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Existencia_Productos/${id}`)
  }

  //Metodo agregar
  srvAgregar(datos_Productos:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Existencia_Productos', datos_Productos)
  }

  //Metodo actualzar
  srvActualizar(id:number|String, datos_Productos:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Existencia_Productos/${id}`, datos_Productos);
  }

  //Metodo eliminar
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Existencia_Productos/${id}`);
  }

  //
  srvGuardar(data : modelExistenciaProductos): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Existencia_Productos', data)
  }
}
