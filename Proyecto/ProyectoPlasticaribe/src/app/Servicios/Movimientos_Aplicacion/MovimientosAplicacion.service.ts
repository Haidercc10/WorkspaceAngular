import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MovimientosAplicacionService {

  constructor(private http : HttpClient,) { }

  getTodo = () => this.http.get<any>(this.rutaPlasticaribeAPI + '/MovientosAplicacion');

  getId = (id : number) => this.http.get<any>(this.rutaPlasticaribeAPI + `/MovientosAplicacion`);

  putId = (id: any, data:any) => this.http.put(this.rutaPlasticaribeAPI + `/MovientosAplicacion/${id}`, data);

  deleteID_ = (id: any) => this.http.delete(this.rutaPlasticaribeAPI + `/MovientosAplicacion/${id}`);

  insert = (data : any): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/MovientosAplicacion', data);
}
