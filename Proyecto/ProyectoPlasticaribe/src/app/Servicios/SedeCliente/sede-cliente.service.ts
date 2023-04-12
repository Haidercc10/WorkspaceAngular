import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelSedesClientes } from '../../Modelo/modelSedesClientes';

@Injectable({
  providedIn: 'root'
})
export class SedeClienteService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }

  //Metodo buscar lista de Productos
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/SedesClientes');
  }

  srvObtenerListaPorId(id : number){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/SedesClientes/${id}`);
  }

  srvObtenerListaPorCliente(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/SedesClientes/cliente/${id}`);
  }

  srvObtenerListaPorNombreCliente(nombre : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/SedesClientes/clienteNombre/${nombre}`);
  }

  srvObtenerListaPorClienteSede(cliente : any, ciudad : any, direccion : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/SedesClientes/clienteSede/${cliente}/${ciudad}/${direccion}`);
  }

  GetSedesCliente(cliente : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/SedesClientes/getSedesCliente/${cliente}`);
  }

  GetDireccionesCliente(cliente : number, ciudad : string){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/SedesClientes/getDireccionesCliente/${cliente}/${ciudad}`);
  }

  GetSedeCliente(cod : string, ciudad : string, direccion : string) : any {
    return this.http.get<any>(rutaPlasticaribeAPI + `/SedesClientes/getSedeCliente/${cod}/${ciudad}/${direccion}`);
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
