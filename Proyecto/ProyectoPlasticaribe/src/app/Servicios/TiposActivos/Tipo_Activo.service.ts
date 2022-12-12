import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelTiposActivos } from '../../Modelo/modelTiposActivos';

@Injectable({
  providedIn: 'root'
})
export class Tipo_ActivoService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  constructor(private http : HttpClient) { }

  GetTodo():Observable<any[]> {
      return this.http.get<any>(this.rutaPlasticaribeAPI + '/Tipo_Activo')
  }

  Put(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Tipo_Activo/${id}`, data);
  }

  Delete(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Tipo_Activo/${id}`);
  }

  Insert(data : modelTiposActivos): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Tipo_Activo', data);
  }

}
