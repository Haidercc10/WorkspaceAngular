import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelProduccionProcesos } from 'src/app/Modelo/modelProduccionProcesos';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class Produccion_ProcesosService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http: HttpClient) { }

  GetTodo = (): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos`);

  GetById = (id: any): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/${id}`);

  GetInformationAboutProduction = (production: number): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/getInformationAboutProduction/${production}`);

  GetInformationAboutProductionToUpdateZeus = (production: number): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/getInformationAboutProductionToUpdateZeus/${production}`);

  GetAvaibleProduction = (item: number): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/getAvaibleProduction/${item}`);

  GetInformationAboutProductionByOrderProduction_Process = (order: number, process: string) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/getInformationAboutProductionByOrderProduction_Process/${order}/${process}`);

  sendProductionToZeus = (ot: string, item: string, presentation: string, reel: number, quantity: string, price: string) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/EnviarAjuste/${ot}/${item}/${presentation}/${reel}/${quantity}/${price}`);

  putChangeStateProduction = (production: number) => this.http.put<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/putCambiarEstadoRollo/${production}`, production);

  putSendZeus = (production: number) => this.http.put<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/putEnvioZeus/${production}`, production);

  Post = (body: modelProduccionProcesos): Observable<any> => this.http.post(`${this.rutaPlasticaribeAPI}/Produccion_Procesos`, body);
}
