import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelTipoMantenimiento } from '../../Modelo/modelTipoMantenimiento';

@Injectable({
  providedIn: 'root'
})
export class Tipo_MantenimientoService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  constructor(private http : HttpClient) { }

  GetTodo():Observable<any[]> {
      return this.http.get<any>(this.rutaPlasticaribeAPI + '/Tipo_Mantenimiento')
  }

  Put(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Tipo_Mantenimiento/${id}`, data);
  }

  Delete(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Tipo_Mantenimiento/${id}`);
  }

  Insert(data : modelTipoMantenimiento): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Tipo_Mantenimiento', data);
  }

}
