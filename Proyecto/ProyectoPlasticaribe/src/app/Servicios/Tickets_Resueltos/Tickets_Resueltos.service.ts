import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Tickets_ResueltosService {
  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
  constructor(private http : HttpClient,) { }

  Get = () : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Tickets_Revisados`);

  Get_Id = (id : number) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Tickets_Revisados/${id}`);

  Put = (id : number, data : any) : Observable<any> => this.http.put(`${this.rutaPlasticaribeAPI}/Tickets_Revisados`, data);

  Insert = (data : any) : Observable<any> => this.http.post(`${this.rutaPlasticaribeAPI}/Tickets_Revisados`, data);
}
