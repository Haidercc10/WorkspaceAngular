import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelOrdenTrabajo_SelladoCorte } from 'src/app/Modelo/modelOrdenTrabajo_Sellado_Corte';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})

export class OrdenTrabajo_Sellado_CorteService {

  constructor(private http : HttpClient,) { }

  getTipoSellado_Formato = (tipoSellado : number, formato : number) => this.http.get<any>(rutaPlasticaribeAPI + `/OT_SelladoCorte/getTipoSellado_Formato/${tipoSellado}/${formato}`);

  GetOT_SelladoCorte = (ot : number) => this.http.get<any>(rutaPlasticaribeAPI + `/OT_SelladoCorte/getOT_Sellado_Corte/${ot}`);
    
  put = (id:number|string, data:any) => this.http.put(rutaPlasticaribeAPI + `/OT_SelladoCorte/${id}`, data);

  post = (data : modelOrdenTrabajo_SelladoCorte): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/OT_SelladoCorte', data);

}
