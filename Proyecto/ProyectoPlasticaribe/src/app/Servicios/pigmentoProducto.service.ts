import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelPigmento } from '../Modelo/modelPigmento';

@Injectable({
  providedIn: 'root'
})
export class PigmentoProductoService {


  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  constructor(private http : HttpClient) { }

  //Metodo buscar lista de Pigmentos
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Pigmentoes');
  }

  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Pigmentoes/${id}`);
  }

  srvObtenerListaPorNombrePigmento(nombre : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Pigmentoes/nombrePigmento/${nombre}`);
  }

  //Metodo agregar Pigmentos
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Pigmentoes', data)
  }

  //Metodo actualzar Pigmentos
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Pigmentoes/${id}`, data);
  }

  //Metodo eliminar Pigmentos
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Pigmentoes/${id}`);
  }

  //
  srvGuardar(data : modelPigmento): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Pigmentoes', data)
  }
}
