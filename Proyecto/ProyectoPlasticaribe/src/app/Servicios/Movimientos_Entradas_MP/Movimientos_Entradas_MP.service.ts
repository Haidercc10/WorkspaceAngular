import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modeloMovimientos_Entradas_MP } from 'src/app/Modelo/modeloMovimientos_Entradas_MP';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Movimientos_Entradas_MPService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private httpClient: HttpClient) { }

  GetTodo = () : Observable<any []> => this.httpClient.get<any>(`${this.rutaPlasticaribeAPI}/Movimientros_Entradas_MP`);

  GetId = (id: number) : Observable<any> => this.httpClient.get<any>(`${this.rutaPlasticaribeAPI}/Movimientros_Entradas_MP/${id}`);

  GetComprasRealizadas = (fechaInicio : any, fechaFin : any, material : number) : Observable<any []> => this.httpClient.get<any>(`${this.rutaPlasticaribeAPI}/Movimientros_Entradas_MP/getComprasRealizadas/${fechaInicio}/${fechaFin}/${material}`);

  GetComprasAntiguas = (fecha : any, material : number) : Observable<any []> => this.httpClient.get<any>(`${this.rutaPlasticaribeAPI}/Movimientros_Entradas_MP/getComprasAntiguas/${fecha}/${material}`);

  GetInventarioMateriales = () : Observable<any []> => this.httpClient.get<any>(`${this.rutaPlasticaribeAPI}/Movimientros_Entradas_MP/getInventarioMateriales`);

  GetInventarioxMaterial = (material : number) : Observable<any []> => this.httpClient.get<any>(`${this.rutaPlasticaribeAPI}/Movimientros_Entradas_MP/getInventarioxMaterial/${material}`);

  Put = (id : number, data : modeloMovimientos_Entradas_MP) => this.httpClient.put(`${this.rutaPlasticaribeAPI}/Movimientros_Entradas_MP/${id}`, data);

  Post = (data : modeloMovimientos_Entradas_MP) : Observable<any> => this.httpClient.post(`${this.rutaPlasticaribeAPI}/Movimientros_Entradas_MP`, data);
}