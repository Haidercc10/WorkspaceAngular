import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelEntradas_Salidas_MP } from 'src/app/Modelo/modelEntradas_Salidas_MP';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Entradas_Salidas_MPService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient) { }

  GetTodo = () : Observable<any []> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Entradas_Salidas_MP`);

  GetId = (id: number) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Entradas_Salidas_MP/${id}`);

  GetConsumos = (fechaInicio : any, fechaFin : any, material : any) : Observable<any []> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Entradas_Salidas_MP/getConsumos/${fechaInicio}/${fechaFin}/${material}`);

  GetSalidasRealizadas = (fechaInicio : any, fechaFin : any, material : number) : Observable<any []> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Entradas_Salidas_MP/getSalidasRealizadas/${fechaInicio}/${fechaFin}/${material}`);

  Post = (data : modelEntradas_Salidas_MP) : Observable<any> => this.http.post(`${this.rutaPlasticaribeAPI}/Entradas_Salidas_MP`, data);
}