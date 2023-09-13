import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelTipoMantenimiento } from '../../Modelo/modelTipoMantenimiento';

@Injectable({
  providedIn: 'root'
})
export class Tipo_MantenimientoService {

  constructor(private http : HttpClient) { }

  GetTodo = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Tipo_Mantenimiento');

  GetId = (id : number) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Tipo_Mantenimiento/${id}`);

  Put = (id:number|String, data:any) => this.http.put(this.rutaPlasticaribeAPI + `/Tipo_Mantenimiento/${id}`, data);

  Delete = (id:number|String) => this.http.delete(this.rutaPlasticaribeAPI + `/Tipo_Mantenimiento/${id}`);

  Insert = (data : modelTipoMantenimiento): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Tipo_Mantenimiento', data);
}
