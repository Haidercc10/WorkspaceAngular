import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelDetSolicitudMP_Extrusion } from 'src/app/Modelo/modelDetSolicitudMP_Extrusion';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class DetSolicitudMP_ExtrusionService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient) { }

  GetId = (id : number) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/DetSolicitud_MatPrimaExtrusion/${id}`);

  GetTodo = () : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/DetSolicitud_MatPrimaExtrusion`);

  Post = (data : modelDetSolicitudMP_Extrusion) => this.http.post(`${this.rutaPlasticaribeAPI}/DetSolicitud_MatPrimaExtrusion`, data);

  Put = (id : number, data : modelDetSolicitudMP_Extrusion) => this.http.put(`${this.rutaPlasticaribeAPI}/DetSolicitud_MatPrimaExtrusion/${id}`, data);

  Delete = (id : number) => this.http.delete(`${this.rutaPlasticaribeAPI}/DetSolicitud_MatPrimaExtrusion/${id}`);

  GetSolicitudMp_Extrusion = (id : number) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/DetSolicitud_MatPrimaExtrusion/getSolicitudMp_Extrusion/${id}`);

  GetQuerySolicitudesMp_Extrusion = (fecha1 : number, fecha2 : any, ruta? : any) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/DetSolicitud_MatPrimaExtrusion/getQuerySolicitudesMp_Extrusion/${fecha1}/${fecha2}${ruta}`);

  GetSolicitudesConMatPrimas = (id : number, matprima : number) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/DetSolicitud_MatPrimaExtrusion/getSolicitudesConMatPrimas/${id}/${matprima}`);
}
