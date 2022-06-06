import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelClienteProductos } from '../Modelo/modelClientesProductos';

@Injectable({
  providedIn: 'root'
})
export class ClientesProductosService {

  readonly rutaPlasticaribeAPI = "https://192.168.0.153:7137/api";

  constructor(private http : HttpClient) { }

  //Metodo buscar lista de Productos
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Cliente_Producto');
  }

  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Cliente_Producto/${id}`);
  }

  //Metodo agregar Productos
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Cliente_Producto', data)
  }

  //Metodo actualzar Productos
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Cliente_Producto/${id}`, data);
  }

  //Metodo eliminar Productos
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Cliente_Producto/${id}`);
  }

  //
  srvGuardar(data : modelClienteProductos): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Cliente_Producto', data)
  }

}
