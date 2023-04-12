import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelTiposClientes } from '../../Modelo/modelTiposClientes';

@Injectable({
  providedIn: 'root'
})
export class TipoClienteService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }

//Metodo buscar lista de Usuario
  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/TiposClientes')
  }

  srvObtenerListaPorId(id : number){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/TiposClientes/${id}`);
  }

  srvObtenerListaPorNombreTipoCliente(nombre : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/TiposClientes/nombreTipoCliente/${nombre}`);
  }

//Metodo agregar Usuario
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/TiposClientes', data)
  }
//Metodo actualzar Usuario
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/TiposClientes/${id}`, data);
  }
//Metodo eliminar Usuario
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/TiposClientes/${id}`);
  }

  srvGuardaro(data : modelTiposClientes): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/TiposClientes', data);
  }
}
