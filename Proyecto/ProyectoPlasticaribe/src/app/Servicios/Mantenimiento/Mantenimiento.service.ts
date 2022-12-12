import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelMantenimiento } from 'src/app/Modelo/modelMantenimiento';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable()
export class MantenimientoService {

    readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

    constructor(private http : HttpClient) { }

    GetTodo():Observable<any[]> {
        return this.http.get<any>(this.rutaPlasticaribeAPI + '/Mantenimiento')
    }

    Put(id:number|String, data:any) {
      return this.http.put(this.rutaPlasticaribeAPI + `/Mantenimiento/${id}`, data);
    }

    Delete(id:number|String) {
      return this.http.delete(this.rutaPlasticaribeAPI + `/Mantenimiento/${id}`);
    }

    Insert(data : modelMantenimiento): Observable<any> {
      return this.http.post(this.rutaPlasticaribeAPI + '/Mantenimiento', data);
    }

}
