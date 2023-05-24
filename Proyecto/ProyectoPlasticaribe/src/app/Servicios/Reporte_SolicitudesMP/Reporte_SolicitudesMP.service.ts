import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})

export class Reporte_SolicitudesMPService {

readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

constructor(private http : HttpClient) { }

  getSolicitudMP():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Solicitud_MateriaPrima`);
  }

  getIdSolicitudMP(doc : number):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Detalles_SolicitudMateriaPrima/getInfoSolicitud/${doc}`);
  }

  getFechasEstado(fecha1 : any, fecha2 : any, estado : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Solicitud_MateriaPrima/getFechasEstado/${fecha1}/${fecha2}/${estado}`);
  }

  getFechas(fecha1 : any, fecha2 : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Solicitud_MateriaPrima/getFechas/${fecha1}/${fecha2}`);
  }

  getEstados(estado : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Solicitud_MateriaPrima/getEstados/${estado}`);
  }
}
