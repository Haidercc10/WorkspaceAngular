import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelTiposActivos } from '../../Modelo/modelTiposActivos';

@Injectable({
  providedIn: 'root'
})
export class Tipo_ActivoService {

  constructor(private http : HttpClient) { }

  GetTodo = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Tipo_Activo');

  GetId = (id : number) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Tipo_Activo/${id}`);

  Put = (id:number|String, data:any) => this.http.put(this.rutaPlasticaribeAPI + `/Tipo_Activo/${id}`, data);

  Delete = (id:number|String) => this.http.delete(this.rutaPlasticaribeAPI + `/Tipo_Activo/${id}`);

  Insert = (data : modelTiposActivos) => this.http.post(this.rutaPlasticaribeAPI + '/Tipo_Activo', data);
}
