import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelSolicitudRollos } from 'src/app/Modelo/modelSolicitudRollos';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class Solicitud_Rollos_AreasService {

  constructor(private http : HttpClient) { }

  GetTodo = () : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/Solicitud_Rollos_Areas`);

  Get_Id = (id : any) : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/Solicitud_Rollos_Areas/${id}`);

  Post = (data : modelSolicitudRollos) : Observable<any> => this.http.post(`${rutaPlasticaribeAPI}/Solicitud_Rollos_Areas`, data);

  Put = (id : any, data : any) : Observable<any> => this.http.put(`${rutaPlasticaribeAPI}/Solicitud_Rollos_Areas/${id}`, data);

  Delete = (id : any) => this.http.delete(`${rutaPlasticaribeAPI}/Solicitud_Rollos_Areas/${id}`);

}