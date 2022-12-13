import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelActivos } from 'src/app/Modelo/modelActivos';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})

export class ActivosService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  constructor(private http : HttpClient) { }

  GetTodo():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Activos')
  }

  GetId(id : number) {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Activos/${id}`);
  }

  GetActivoNombre(datos : string) {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Activos/getActivoNombre/${datos}`);
  }

  GetInfoActivos(activo : number){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Activos/getInfoActivos/${activo}`);
  }

  Put(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Activos/${id}`, data);
  }

  Delete(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Activos/${id}`);
  }

  Insert(data : modelActivos): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Activos', data);
  }

}
