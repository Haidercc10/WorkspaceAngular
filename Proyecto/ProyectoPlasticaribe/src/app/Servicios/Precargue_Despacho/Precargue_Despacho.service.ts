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

  Post = (data : modelPrecargue_Despacho): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Precargue_Despacho', data);

  Put = (id : any, data : modelPrecargue_Despacho) => this.http.put(this.rutaPlasticaribeAPI + `/Precargue_Despacho/${id}`, data);

  putPreloadDispatch = (id : any, data : any) => this.http.put(this.rutaPlasticaribeAPI + `/Precargue_Despacho/putPreloadDispatch/${id}`, data);

}
