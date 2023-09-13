import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelTercero } from 'src/app/Modelo/modelTercero';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TercerosService {

  constructor(private http : HttpClient,) { }

  getTodo = () => this.http.get<any>(this.rutaPlasticaribeAPI + '/Terceros');

  getId = (dato : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Terceros/${dato}`);

  getTerceroLike = (nombre : string) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Terceros/getTerceroLike/${nombre}`);

  put = (id:number|string, data:any) => this.http.put(this.rutaPlasticaribeAPI + `/Terceros/${id}`, data);

  delete = (id:number|string) => this.http.delete(this.rutaPlasticaribeAPI + `/Terceros/${id}`);

  insert = (data : modelTercero): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Terceros', data);
}
