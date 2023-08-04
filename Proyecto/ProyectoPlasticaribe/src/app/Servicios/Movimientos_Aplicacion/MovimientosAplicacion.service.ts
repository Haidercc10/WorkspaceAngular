import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class MovimientosAplicacionService {

  constructor(private http : HttpClient,) { }

  getTodo = () => this.http.get<any>(rutaPlasticaribeAPI + '/MovientosAplicacion');

  getId = (id : number) => this.http.get<any>(rutaPlasticaribeAPI + `/MovientosAplicacion`);

  putId = (id: any, data:any) => this.http.put(rutaPlasticaribeAPI + `/MovientosAplicacion/${id}`, data);

  deleteID_ = (id: any) => this.http.delete(rutaPlasticaribeAPI + `/MovientosAplicacion/${id}`);

  insert = (data : any): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/MovientosAplicacion', data);
}
