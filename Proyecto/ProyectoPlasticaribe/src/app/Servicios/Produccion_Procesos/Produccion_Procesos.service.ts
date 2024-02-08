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

  GetInformationAboutProduction = (production: number, process: string): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/getInformationAboutProduction/${production}/${process}`);

  GetInformationAboutProductionBagPro = (production: number): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/getInformationAboutProductionBagPro/${production}`);

  GetInformationAboutProductionToUpdateZeus = (production: number, process: string): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/getInformationAboutProductionToUpdateZeus/${production}/${process}`);

  GetAvaibleProduction = (item: number): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/getAvaibleProduction/${item}`);

  GetInformationAboutProductionByOrderProduction_Process = (order: number, process: string) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/getInformationAboutProductionByOrderProduction_Process/${order}/${process}`);

  GetInfoProduction = (date1 : any, date2 : any, url? : string) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/getInfoProduction/${date1}/${date2}${url}`); 

  sendProductionToZeus = (ot: string, item: string, presentation: string, reel: number, quantity: string, price: string) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/EnviarAjuste/${ot}/${item}/${presentation}/${reel}/${quantity}/${price}`);

  putChangeStateProduction = (production: number) => this.http.put<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/putCambiarEstadoRollo/${production}`, production);

  putStateForSend = (orderFac: number) => this.http.put<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/putEstadoPorDespachar/${orderFac}`, orderFac);

  putStateNotAvaible = (orderFac: number) => this.http.put<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/putEstadoNoDisponible/${orderFac}`, orderFac);

  putSendZeus = (production: number) => this.http.put<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/putEnvioZeus/${production}`, production);

  Post = (body: modelProduccionProcesos): Observable<any> => this.http.post(`${this.rutaPlasticaribeAPI}/Produccion_Procesos`, body);

  Delete = (id: number|string): Observable<any> => this.http.delete(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/${id}`);
}
