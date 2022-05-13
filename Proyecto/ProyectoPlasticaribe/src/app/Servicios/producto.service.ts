import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelProducto } from '../Modelo/modelProducto';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  readonly rutaPlasticaribeAPI = "https://localhost:7137/api";

  constructor(private http : HttpClient) { }

  //Metodo buscar lista de Productos
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Productoes')
  }

  srvObtenerListaPorId(id : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Productoes/${id}`)
  }

  //Metodo agregar Productos
  srvAgregar(datos_Productos:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Productoes', datos_Productos)
  }

  //Metodo actualzar Productos
  srvActualizar(id:number|String, datos_Productos:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Productoes/${id}`, datos_Productos);
  }

  //Metodo eliminar Productos
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Productoes/${id}`);
  }

  //
  srvGuardar(data : modelProducto): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Productoes', data)
  }
}