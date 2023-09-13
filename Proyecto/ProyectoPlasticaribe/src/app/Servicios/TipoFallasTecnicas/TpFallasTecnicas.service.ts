import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { this.rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelTpFallasTecnicas } from '../../Modelo/modelTpFallasTEcnicas';

@Injectable({
  providedIn: 'root'
})
export class TpFallasTecnicasService {

  constructor(private http : HttpClient,) { }

  GetTodo = () : Observable<any> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Tipo_FallaTecnica');

  Get_Id = (dato : any) : Observable<any> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Tipo_FallaTecnica/${dato}`);

  Put = (id:number|string, data:any) => this.http.put(this.rutaPlasticaribeAPI + `/Tipo_FallaTecnica/${id}`, data);

  Delete = (id:number|string) => this.http.delete(this.rutaPlasticaribeAPI + `/Tipo_FallaTecnica/${id}`);

  Post = (data : modelTpFallasTecnicas): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Tipo_FallaTecnica', data);
}
