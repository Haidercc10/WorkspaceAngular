import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelTercero } from 'src/app/Modelo/modelTercero';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class TercerosService {

  constructor(private http : HttpClient,) { }

  getTodo = () => this.http.get<any>(rutaPlasticaribeAPI + '/Terceros');

  getId = (dato : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Terceros/${dato}`);

  getTerceroLike = (nombre : string) => this.http.get<any>(rutaPlasticaribeAPI + `/Terceros/getTerceroLike/${nombre}`);

  put = (id:number|string, data:any) => this.http.put(rutaPlasticaribeAPI + `/Terceros/${id}`, data);

  delete = (id:number|string) => this.http.delete(rutaPlasticaribeAPI + `/Terceros/${id}`);

  insert = (data : modelTercero): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/Terceros', data);
}
