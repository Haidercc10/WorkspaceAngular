import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelDetSolicitudMP_Extrusion } from 'src/app/Modelo/modelDetSolicitudMP_Extrusion';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})

export class DetSolicitudMP_ExtrusionService {

  constructor(private http : HttpClient) { }

  GetId = (id : number) : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/DetSolicitud_MatPrimaExtrusion/${id}`);

  GetTodo = () : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/DetSolicitud_MatPrimaExtrusion`);

  Post = (data : modelDetSolicitudMP_Extrusion) => this.http.post(`${rutaPlasticaribeAPI}/DetSolicitud_MatPrimaExtrusion`, data);

  Put = (id : number, data : modelDetSolicitudMP_Extrusion) => this.http.put(`${rutaPlasticaribeAPI}/DetSolicitud_MatPrimaExtrusion/${id}`, data);

  Delete = (id : number) => this.http.delete(`${rutaPlasticaribeAPI}/DetSolicitud_MatPrimaExtrusion/${id}`);

  GetSolicitudMp_Extrusion = (id : number) : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/DetSolicitud_MatPrimaExtrusion/getSolicitudMp_Extrusion/${id}`);

  GetQuerySolicitudesMp_Extrusion = (fecha1 : number, fecha2 : any, ruta? : any) : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/DetSolicitud_MatPrimaExtrusion/getQuerySolicitudesMp_Extrusion/${fecha1}/${fecha2}${ruta}`);

  GetRelacionSolicitudesAsignaciones = (id : number) : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/DetSolicitud_MatPrimaExtrusion/getRelacionSolicitudesAsignaciones/${id}/`);
}
