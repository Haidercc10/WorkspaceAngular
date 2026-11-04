import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelPrecargue_Despacho } from 'src/app/Modelo/modelPrecargue_Despacho';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn : 'root'
})
export class Precargue_DespachoService {

readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;  

constructor(private http : HttpClient) { }
    
  getAll = ():Observable<any> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Precargue_Despacho`);

  getId = (id : any):Observable<any> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Precargue_Despacho/${id}`);

  GetIdPrecargue_Despacho = (id : any):Observable<any> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Precargue_Despacho/GetIdPrecargue_Despacho/${id}`);
  
  getLastPreload = () : Observable<any> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Reposiciones/getLastReposition`);

  getLastDispatchPreload = () : Observable<any> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Precargue_Despacho/getLastPreload`);

  Post = (data : modelPrecargue_Despacho): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Precargue_Despacho', data);

  Put = (id : any, data : modelPrecargue_Despacho) => this.http.put(this.rutaPlasticaribeAPI + `/Precargue_Despacho/${id}`, data);

  putPreloadDispatch = (id : any, data : any) => this.http.put(this.rutaPlasticaribeAPI + `/Precargue_Despacho/putPreloadDispatch/${id}`, data);

  putPreloadForOrderFact = (id : any, data : any) => this.http.put(this.rutaPlasticaribeAPI + `/Precargue_Despacho/putPreloadForOrderFact/${id}`, data);

  /**
   * Anula un precargue pendiente o en proceso y libera sus rollos (estado 50 a 19).
   * @param id Número del precargue.
   * @returns Observable con la cantidad de rollos liberados (`rollosLiberados`).
   */
  anular = (id : number) : Observable<any> => this.http.put<any>(this.rutaPlasticaribeAPI + `/Precargue_Despacho/anular/${id}`, null);

  // Precargue guardado rollo a rollo (estados En proceso → Pendiente o Anulado).
  getPreloadRolls = (id : number) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/PrecargueRollos/${id}`);

  getPreloadsInProcess = (user : number) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/PrecargueRollos/enProceso/${user}`);

  addRollToPreload = (data : any) : Observable<any> => this.http.post<any>(`${this.rutaPlasticaribeAPI}/PrecargueRollos/agregarRollo`, data);

  removeRollFromPreload = (id : number, roll : number, item : number) : Observable<any> => this.http.delete<any>(`${this.rutaPlasticaribeAPI}/PrecargueRollos/${id}/rollos/${roll}/${item}`);

  finishPreload = (id : number, data : any) : Observable<any> => this.http.put<any>(`${this.rutaPlasticaribeAPI}/PrecargueRollos/${id}/finalizar`, data);

  cancelPreload = (id : number, data : any) : Observable<any> => this.http.put<any>(`${this.rutaPlasticaribeAPI}/PrecargueRollos/${id}/anular`, data);

}
