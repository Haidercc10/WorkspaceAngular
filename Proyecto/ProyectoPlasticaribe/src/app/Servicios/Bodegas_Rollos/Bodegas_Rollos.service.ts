import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelBodegasRollos } from 'src/app/Modelo/modelBodegasRollos';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})

export class Bodegas_RollosService {

  constructor(private http : HttpClient) { }

  GetTodo = () : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/Bodegas_Rollos`);

  Get_Id = (id : any) : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/Bodegas_Rollos/${id}`);

  GetRollos = (data : any []) : Observable<any> => this.http.post(`${rutaPlasticaribeAPI}/Bodegas_Rollos/getRollos`, data);

  Post = (data : modelBodegasRollos) : Observable<any> => this.http.post(`${rutaPlasticaribeAPI}/Bodegas_Rollos`, data);

  Put = (id : any, data : any) : Observable<any> => this.http.put(`${rutaPlasticaribeAPI}/Bodegas_Rollos/${id}`, data);

  Delete = (id : any) => this.http.delete(`${rutaPlasticaribeAPI}/Bodegas_Rollos/${id}`);

}
