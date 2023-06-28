import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelDtSolcitudMP } from 'src/app/Modelo/modelDtSolcitudMP';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})

export class SolicitudMP_ExtrusionService {

constructor(private http : HttpClient) { }

  GetId = (id : number) : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/SolicitudMatPrima_Extrusion/${id}`);

  GetTodo = () : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/SolicitudMatPrima_Extrusion`);

  Post = (data : modelDtSolcitudMP) => this.http.post(`${rutaPlasticaribeAPI}/SolicitudMatPrima_Extrusion`, data);

  Put = (id : number, data : modelDtSolcitudMP) => this.http.put(`${rutaPlasticaribeAPI}/SolicitudMatPrima_Extrusion/${id}`, data);

  Delete = (id : number) => this.http.delete(`${rutaPlasticaribeAPI}/SolicitudMatPrima_Extrusion/${id}`);

}
