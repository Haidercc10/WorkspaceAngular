import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelTipoMoneda } from '../../Modelo/modelTipoMoneda';

@Injectable({
  providedIn: 'root'
})
export class TipoMonedaService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }

  //Metodo buscar lista
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Tipo_Moneda')
  }

  //Metodo agregar
  srvAgregar(data: any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Tipo_Moneda', data)
  }

  //Metodo actualzar
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Tipo_Moneda/${id}`, data);
  }

  //Metodo eliminar
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Tipo_Moneda/${id}`);
  }

  //
  srvGuardar(data : modelTipoMoneda): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Tipo_Moneda', data)
  }
}
