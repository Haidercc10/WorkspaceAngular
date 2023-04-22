import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class Tickets_ResueltosService {

constructor(private http : HttpClient,) { }

  Get = () : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/Tickets_Revisados`);

  Get_Id = (id : number) : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/Tickets_Revisados/${id}`);

  Put = (id : number, data : any) : Observable<any> => this.http.put(`${rutaPlasticaribeAPI}/Tickets_Revisados`, data);

  Insert = (data : any) : Observable<any> => this.http.post(`${rutaPlasticaribeAPI}/Tickets_Revisados`, data);
}
