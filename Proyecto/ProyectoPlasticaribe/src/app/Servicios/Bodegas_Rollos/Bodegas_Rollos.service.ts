import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelBodegasRollos } from 'src/app/Modelo/modelBodegasRollos';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class Bodegas_RollosService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient) { }

  GetTodo = () : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Bodegas_Rollos`);

  Get_Id = (id : any) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Bodegas_Rollos/${id}`);

  Post = (data : modelBodegasRollos) : Observable<any> => this.http.post(`${this.rutaPlasticaribeAPI}/Bodegas_Rollos`, data);

  Put = (id : any, data : modelBodegasRollos) : Observable<any> => this.http.put(`${this.rutaPlasticaribeAPI}/Bodegas_Rollos/${id}`, data);

  Delete = (id : any) => this.http.delete(`${this.rutaPlasticaribeAPI}/Bodegas_Rollos/${id}`);

}
