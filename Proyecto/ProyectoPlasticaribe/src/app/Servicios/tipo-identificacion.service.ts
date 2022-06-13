import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelTipoIdentificacion } from '../Modelo/modelTipoIdentificacion';

@Injectable({
  providedIn: 'root'
})
export class TipoIdentificacionService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

//Encapsular httpclient en el constructor
  constructor(private http: HttpClient) { }

//Metodo buscar lista de Usuario
  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/TipoIdentificacions')
  }

  srvObtenerListaPorId(id : number){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/TipoIdentificacions/${id}`);
  }
//Metodo agregar Usuario
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/TipoIdentificacions', data)
  }
//Metodo actualzar Usuario
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/TipoIdentificacions/${id}`, data);
  }
//Metodo eliminar Usuario
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/TipoIdentificacions/${id}`);
  }

  srvGuardaro(data : modelTipoIdentificacion): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/TipoIdentificacions', data);
  }
}
