import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelSolicitudMP_Extrusion } from 'src/app/Modelo/modelSolicitudMP_Extrusion';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})

export class SolicitudMP_ExtrusionService {

constructor(private http : HttpClient) { }

  GetId = (id : number) : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/Solicitud_MatPrimaExtrusion/${id}`);

  GetTodo = () : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/Solicitud_MatPrimaExtrusion`);

  Post = (data : modelSolicitudMP_Extrusion) => this.http.post<any>(`${rutaPlasticaribeAPI}/Solicitud_MatPrimaExtrusion`, data);

  Put = (id : number, data : modelSolicitudMP_Extrusion) => this.http.put(`${rutaPlasticaribeAPI}/Solicitud_MatPrimaExtrusion/${id}`, data);

  Delete = (id : number) => this.http.delete(`${rutaPlasticaribeAPI}/Solicitud_MatPrimaExtrusion/${id}`);

  GetUltimas100Solicitudes = () : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/Solicitud_MatPrimaExtrusion/getUltimas100Solicitudes`);

  GetUltimaSolicitud = () : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/Solicitud_MatPrimaExtrusion/getUltimaSolicitud`);
}
