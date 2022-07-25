import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribe3, rutaPlasticaribeAPI } from 'src/polyfills';
import { modelBOPP } from '../Modelo/modelBOPP';

@Injectable( { providedIn: 'root' } )

export class EntradaBOPPService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  constructor(private http : HttpClient) { }

  //Metodo buscar lista
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/BOPP')
  }

  srvObtenerListaPorId(id : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/BOPP/${id}`)
  }

  srvObtenerListaPorSerial(id : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/BOPP/serial/${id}`)
  }

  srvObtenerListaPorFecha(id : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/BOPP/fecha/${id}`)
  }

  srvObtenerListaPorFechas(fecha1 : any, fecha2 : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/BOPP/fechas?BOPP_FechaIngreso1=${fecha1}&BOPP_FechaIngreso2=${fecha2}`)
  }

  srvObtenerListaAgrupada():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/BOPP/BoppAgrupado`)
  }

  //Metodo agregar
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/BOPP', data)
  }

  //Metodo actualzar
  srvActualizar(id:any, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/BOPP/${id}`, data);
  }

  //Metodo eliminar
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/BOPP/${id}`);
  }

  srvGuardar(data: modelBOPP): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/BOPP', data)
  }

}
