import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelEstadosProcesos_OT } from '../Modelo/modelEstadosPreceos_OT';

@Injectable({
  providedIn: 'root'
})
export class EstadosProcesos_OTService {

  readonly rutaPlasticaribeAPI =  rutaPlasticaribeAPI; /*"https://localhost:7137/api"*/;

  //Encapsular httpclient en el constructor
  constructor(private http: HttpClient) { }

  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Estados_ProcesosOT');
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/${dato}`);
  }

  srvObtenerListaPorOT(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorOT/${dato}`);
  }

  srvObtenerListaPorFecha(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorFecha/${dato}`);
  }

  srvObtenerListaPorFallas(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorFallas/${dato}`);
  }

  srvObtenerListaPorFechas(fecha1 : any, fecha2 : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorFechas?EstProcOT_FechaCreacion1=${fecha1}&EstProcOT_FechaCreacion2=${fecha2}`);
  }

  srvObtenerListaPorOtFallas(ot : any, falla : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorOtFalla/${ot}/${falla}`);
  }

  srvObtenerListaPorOtFecha(ot : any, fecha : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorOtFecha/${ot}/${fecha}`);
  }

  srvObtenerListaPorOtFechas(ot : any, fecha : any, fecha2){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorOtFechas/${ot}?EstProcOT_FechaCreacion1=${fecha}&EstProcOT_FechaCreacion2=${fecha2}`);
  }

  srvObtenerListaPorFechasFallas(fecha : any, fecha2 : any, falla : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorFechasFallas/${falla}?EstProcOT_FechaCreacion1=${fecha}&EstProcOT_FechaCreacion2=${fecha2}`);
  }

  srvObtenerListaPorOtFechasFallas(ot : any, fecha : any, fecha2 : any, falla : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorOtFechasFallas/${ot}/${falla}?EstProcOT_FechaCreacion1=${fecha}&EstProcOT_FechaCreacion2=${fecha2}`);
  }

  srvObtenerListaPorOtFechaFalla(fecha : any, falla : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorOtFechsFalla/${fecha}/${falla}`);
  }

  srvActualizar(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/${id}`, data);
  }

  srvActualizarPorOT(id : any, data : any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/ActualizacionFallaObservacion/${id}`, data);
  }

  srvEliminar(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/${id}`);
  }

  srvGuardar(data : modelEstadosProcesos_OT): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/Estados_ProcesosOT', data);
  }

}
