import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelOrdenTrabajo_SelladoCorte } from 'src/app/Modelo/modelOrdenTrabajo_Sellado_Corte';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class OrdenTrabajo_Sellado_CorteService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  getTipoSellado_Formato = (tipoSellado : number, formato : number) => this.http.get<any>(this.rutaPlasticaribeAPI + `/OT_SelladoCorte/getTipoSellado_Formato/${tipoSellado}/${formato}`);

  GetOT_SelladoCorte = (ot : number) => this.http.get<any>(this.rutaPlasticaribeAPI + `/OT_SelladoCorte/getOT_Sellado_Corte/${ot}`);
    
  put = (id:number|string, data:any) => this.http.put(this.rutaPlasticaribeAPI + `/OT_SelladoCorte/${id}`, data);

  post = (data : modelOrdenTrabajo_SelladoCorte): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/OT_SelladoCorte', data);

}
