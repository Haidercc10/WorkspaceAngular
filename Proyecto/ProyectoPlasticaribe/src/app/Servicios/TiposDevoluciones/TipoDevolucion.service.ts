import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelTipoDevolucion } from '../../Modelo/modelTipoDevolucion';

@Injectable({
  providedIn: 'root'
})
export class TipoDevolucionService {
  
  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
  
  constructor(private http : HttpClient,) { }

  GetTodo = () => this.http.get<any>(this.rutaPlasticaribeAPI + '/');

  Get_Id = (dato : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `//${dato}`);

  Put = (id:number|string, data:any) => this.http.put(this.rutaPlasticaribeAPI + `//${id}`, data);

  Delete = (id:number|string) => this.http.delete(this.rutaPlasticaribeAPI + `//${id}`);

  Post = (data : modelTipoDevolucion): Observable<any>  => this.http.post(this.rutaPlasticaribeAPI + '/', data);

}
