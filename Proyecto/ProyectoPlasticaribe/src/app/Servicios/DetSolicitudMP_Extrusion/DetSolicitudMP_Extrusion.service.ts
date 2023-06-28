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

  GetId = (id : number) : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/DetSolicitudMatPrima_Extrusion/${id}`);

  GetTodo = () : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/DetSolicitudMatPrima_Extrusion`);

  Post = (data : modelDetSolicitudMP_Extrusion) => this.http.post(`${rutaPlasticaribeAPI}/DetSolicitudMatPrima_Extrusion`, data);

  Put = (id : number, data : modelDetSolicitudMP_Extrusion) => this.http.put(`${rutaPlasticaribeAPI}/DetSolicitudMatPrima_Extrusion/${id}`, data);

  Delete = (id : number) => this.http.delete(`${rutaPlasticaribeAPI}/DetSolicitudMatPrima_Extrusion/${id}`);
}
