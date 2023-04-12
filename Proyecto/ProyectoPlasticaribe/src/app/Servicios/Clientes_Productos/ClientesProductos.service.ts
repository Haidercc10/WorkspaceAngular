import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelClienteProductos } from '../../Modelo/modelClientesProductos';

@Injectable({
  providedIn: 'root'
})
export class ClientesProductosService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }

  //Metodo buscar lista de Productos
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Cliente_Producto');
  }

  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Cliente_Producto/${id}`);
  }

  srvObtenerListaPorNombreCli(cli : any, prod_id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Cliente_Producto/NombreCliente/${cli}/${prod_id}`);
  }

  srvObtenerListaPorNombreCliente(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Cliente_Producto/IdCliente/${id}`);
  }

  //Metodo agregar Productos
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Cliente_Producto', data)
  }

  //Metodo actualzar Productos
  srvActualizar(cli_id : any, prod_id : any, data : any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Cliente_Producto/ ?cli_Id=${cli_id}&prod_Id=${prod_id}`, data);
  }

  //Metodo eliminar Productos
  srvEliminar(cli_id : any, prod_id : any) {
    return this.http.delete(this.rutaPlasticaribeAPI +`/Cliente_Producto/ ?cli_Id=${cli_id}&prod_Id=${prod_id}`);
  }

  //
  srvGuardar(data : modelClienteProductos): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Cliente_Producto', data)
  }

}
