import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelDtMantenimiento } from 'src/app/Modelo/modelDtMantenimiento';
import { rutaPlasticaribeAPI } from 'src/polyfills';


@Injectable({ providedIn: 'root' })

export class Detalle_MantenimientoService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  constructor(private http : HttpClient) { }

  GetTodo():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Detalle_Mantenimiento');
  }

  GetPDFMantenimiento(id : any) {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Detalle_Mantenimiento/getPDFMantenimiento/${id}`);
  }

  Put(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Detalle_Mantenimiento/${id}`, data);
  }

  Delete(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Detalle_Mantenimiento/${id}`);
  }

  Insert(data : modelDtMantenimiento): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Detalle_Mantenimiento', data);
  }

}
