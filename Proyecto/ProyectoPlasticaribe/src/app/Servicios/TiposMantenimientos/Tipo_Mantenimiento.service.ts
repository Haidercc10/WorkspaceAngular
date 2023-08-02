import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelTipoMantenimiento } from '../../Modelo/modelTipoMantenimiento';

@Injectable({
  providedIn: 'root'
})
export class Tipo_MantenimientoService {

  constructor(private http : HttpClient) { }

  GetTodo = ():Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + '/Tipo_Mantenimiento');

  GetId = (id : number) => this.http.get<any>(rutaPlasticaribeAPI + `/Tipo_Mantenimiento/${id}`);

  Put = (id:number|String, data:any) => this.http.put(rutaPlasticaribeAPI + `/Tipo_Mantenimiento/${id}`, data);

  Delete = (id:number|String) => this.http.delete(rutaPlasticaribeAPI + `/Tipo_Mantenimiento/${id}`);

  Insert = (data : modelTipoMantenimiento): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/Tipo_Mantenimiento', data);
}
