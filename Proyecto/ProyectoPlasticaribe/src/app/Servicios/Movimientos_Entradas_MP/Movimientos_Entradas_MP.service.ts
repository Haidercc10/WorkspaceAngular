import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class Movimientos_Entradas_MPService {

  constructor(private httpClient: HttpClient) { }

  GetTodo = () : Observable<any []> => this.httpClient.get<any>(`${rutaPlasticaribeAPI}/Movimientros_Entradas_MP`);

  GetId = (id: number) : Observable<any> => this.httpClient.get<any>(`${rutaPlasticaribeAPI}/Movimientros_Entradas_MP/${id}`);

  GetComprasRealizadas = (fechaInicio : any, fechaFin : any, material : number) : Observable<any []> => this.httpClient.get<any>(`${rutaPlasticaribeAPI}/Movimientros_Entradas_MP/getComprasRealizadas/${fechaInicio}/${fechaFin}/${material}`);

  GetComprasAntiguas = (fecha : any, material : number) : Observable<any []> => this.httpClient.get<any>(`${rutaPlasticaribeAPI}/Movimientros_Entradas_MP/getComprasAntiguas/${fecha}/${material}`);

  GetInventarioMateriales = () : Observable<any []> => this.httpClient.get<any>(`${rutaPlasticaribeAPI}/Movimientros_Entradas_MP/getInventarioMateriales`);
}