import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { rutaPlasticaribeAPI,  } from 'src/polyfills';
import { modelAsignacionBOPP } from '../../Modelo/modelAsignacionBOPP';

@Injectable( { providedIn: 'root' } )

export class AsignacionBOPPService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }

  //Metodo buscar lista
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Asignacion_BOPP')
  }

  srvObtenerListaPorId(id : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Asignacion_BOPP/${id}`)
  }

  srvObtenerListaPorfecha(id : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Asignacion_BOPP/fecha/${id}`)
  }

  srvObtenerListaPorOT(id : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Asignacion_BOPP/ot/${id}`)
  }

  srvObtenerListaPorAgrupadoOT(id : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Asignacion_BOPP/AsignacionesXOrden/${id}`)
  }

  srvObtenerListaUltimoId():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Asignacion_BOPP/ultimoId`)
  }

  srvObtenerListaPorfechas(fecha1 : any, fecha2 : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Asignacion_BOPP/fechas?AsigBOPP_FechaEntrega1=${fecha1}&AsigBOPP_FechaEntrega2=${fecha2}`)
  }
  //Metodo agregar
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Asignacion_BOPP', data)
  }
  //Metodo actualzar
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Asignacion_BOPP/${id}`, data);
  }
  //Metodo eliminar
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Asignacion_BOPP/${id}`);
  }

  srvGuardar(data: modelAsignacionBOPP): Observable<any> {
  return this.http.post(this.rutaPlasticaribeAPI + '/Asignacion_BOPP', data)
  }

}
