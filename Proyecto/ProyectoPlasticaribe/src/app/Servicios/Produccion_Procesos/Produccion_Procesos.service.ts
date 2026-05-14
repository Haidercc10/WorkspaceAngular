import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelProduccionProcesos } from 'src/app/Modelo/modelProduccionProcesos';
import { rollsToDelete } from 'src/app/Vistas/EliminarRollos_Produccion/EliminarRollos_Produccion.component';
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

  sendProductionToZeus = (ot: string, item: number, presentation: string, reel: number, quantity: number, price: number) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/EnviarAjuste/${ot}/${item}/${presentation}/${reel}/${quantity}/${price}`);

  Post = (body: modelProduccionProcesos): Observable<any> => this.http.post(`${this.rutaPlasticaribeAPI}/Produccion_Procesos`, body);

  postProduccionProcesos = (body: modelProduccionProcesos): Observable<any> => this.http.post(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/postProduccionProcesos`, body);

  getOtSentToPeletizado = (ot : any) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/getOtSentToPeletizado/${ot}`);
  
  GetInfoProduction = (date1 : any, date2 : any, url? : string) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/getI nfoProduction/${date1}/${date2}${url}`);

  putStateDeletedRolls = (data : Array<rollsToDelete>) => this.http.put<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/putStateDeletedRolls`, data);

  putChangeStateProduction = (production: any[]) => this.http.put<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/putCambiarEstadoRollo`, production);

  getEtiquetaForId = (id: any): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/getEtiquetaForId/${id}`);

  getEtiquetaForOT = (ot: any, process : any): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/getEtiquetaForOT/${ot}/${process}`);
}
