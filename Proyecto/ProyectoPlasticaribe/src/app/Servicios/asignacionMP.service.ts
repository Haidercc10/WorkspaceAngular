import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelAsignacionMP } from '../Modelo/modelAsignacionMP';

@Injectable({
  providedIn: 'root'
})
export class AsignacionMPService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
    constructor(private http : HttpClient) { }

  //Metodo buscar lista de
    srvObtenerLista():Observable<any[]> {
        return this.http.get<any>(this.rutaPlasticaribeAPI + '/Asignacion_MatPrima')
    }

    srvObtenerListaPorId(dato : any){
      return this.http.get<any>(this.rutaPlasticaribeAPI + `/Asignacion_MatPrima/${dato}`);
    }

    srvObtenerListaPorOt(dato : any){
      return this.http.get<any>(this.rutaPlasticaribeAPI + `/Asignacion_MatPrima/ot/${dato}`);
    }

    srvObtenerListaPorFecha(dato : any){
      return this.http.get<any>(this.rutaPlasticaribeAPI + `/Asignacion_MatPrima/fecha/${dato}`);
    }

    srvObtenerListaPorFechas(fecha1 : any, fecha2 : any){
      return this.http.get<any>(this.rutaPlasticaribeAPI + `/Asignacion_MatPrima/fechas?AsigMp_FechaEntrega1=${fecha1}&AsigMp_FechaEntrega2=${fecha2}`);
    }

    srvObtenerListaPorFecha_Ot(fecha : any, ot : any){
      return this.http.get<any>(this.rutaPlasticaribeAPI + `/Asignacion_MatPrima/fecha_Ot?AsigMp_FechaEntrega=${fecha}&AsigMP_OrdenTrabajo=${ot}`);
    }

  //Metodo agregar
    srvAgregar(data:any) {
      return this.http.post(this.rutaPlasticaribeAPI + '/Asignacion_MatPrima', data)
    }

  //Metodo actualzar
    srvActualizar(id:number|String, data:any) {
      return this.http.put(this.rutaPlasticaribeAPI + `/Asignacion_MatPrima/${id}`, data);
    }

  //Metodo eliminar
    srvEliminar(id:number|String) {
      return this.http.delete(this.rutaPlasticaribeAPI + `/Asignacion_MatPrima/${id}`);
    }

    //Duardar
    srvGuardar(data : modelAsignacionMP): Observable<any> {
     return this.http.post(this.rutaPlasticaribeAPI + '/Asignacion_MatPrima', data);
   }

}
