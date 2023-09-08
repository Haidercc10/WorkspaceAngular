import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelCajaMenor_Plasticaribe } from 'src/app/Modelo/CajaMenor_Plasticaribe';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class Entradas_Salidas_MPService {

  constructor(private http : HttpClient) { }

  GetTodo = () : Observable<any []> => this.http.get<any>(`${rutaPlasticaribeAPI}/Entradas_Salidas_MP`);

  GetId = (id: number) : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/Entradas_Salidas_MP/${id}`);

  GetConsumos = (fechaInicio : any, fechaFin : any, material : any) : Observable<any []> => this.http.get<any>(`${rutaPlasticaribeAPI}/Entradas_Salidas_MP/getConsumos/${fechaInicio}/${fechaFin}/${material}`);

  GetSalidasRealizadas = (fechaInicio : any, fechaFin : any, material : number) : Observable<any []> => this.http.get<any>(`${rutaPlasticaribeAPI}/Entradas_Salidas_MP/getSalidasRealizadas/${fechaInicio}/${fechaFin}/${material}`);

  Post = (data : modelCajaMenor_Plasticaribe) : Observable<any> => this.http.post(`${rutaPlasticaribeAPI}/CajaMenor_Plasticaribe`, data);
}