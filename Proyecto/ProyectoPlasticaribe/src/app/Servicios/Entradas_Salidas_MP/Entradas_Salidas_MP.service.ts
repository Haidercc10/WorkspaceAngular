import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class Entradas_Salidas_MPService {

constructor(private http : HttpClient) { }

GetTodo = () : Observable<any []> => this.http.get<any>(`${rutaPlasticaribeAPI}/Entradas_Salidas_MP`);

GetId = (id: number) : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/Entradas_Salidas_MP/${id}`);

GetConsumos = (fechaInicio : any, fechaFin : any, material : any) : Observable<any []> => this.http.get<any>(`${rutaPlasticaribeAPI}/Entradas_Salidas_MP/getConsumos/${fechaInicio}/${fechaFin}/${material}`);

}
