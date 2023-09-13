import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelTpRecuperado } from '../../Modelo/modelTpRecuperado';

@Injectable({
  providedIn: 'root'
})
export class TipoRecuperadoService {
  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
  constructor(private http : HttpClient,) { }

  GetTodo = () :Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Tipo_Recuperado');

  Get_Id = (id : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Tipo_Recuperado/${id}`);

  Put = (id:number|String, data:any) => this.http.put(this.rutaPlasticaribeAPI + `/Tipo_Recuperado/${id}`, data);

  Delete = (id:number|String) => this.http.delete(this.rutaPlasticaribeAPI + `/Tipo_Recuperado/${id}`);

  Post = (data : modelTpRecuperado): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Tipo_Recuperado', data);
}
