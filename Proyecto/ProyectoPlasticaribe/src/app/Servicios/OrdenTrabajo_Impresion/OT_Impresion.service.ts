import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelOT_Impresion } from '../../Modelo/modelOT_Impresion';

@Injectable({
  providedIn: 'root'
})
export class OT_ImpresionService {

  constructor(private http : HttpClient,) { }

  srvObtenerListaOrden_Trabajo = () => this.http.get<any>(rutaPlasticaribeAPI + '/OT_Impresion');

  srvObtenerListaPorId = (dato : any) => this.http.get<any>(rutaPlasticaribeAPI + `/OT_Impresion/${dato}`);

  GetOT_Impresion = (ot : number) => this.http.get<any>(rutaPlasticaribeAPI + `/OT_Impresion/getOT_Impresion/${ot}`);

  srvActualizar = (id:number|string, data:any) => this.http.put(rutaPlasticaribeAPI + `/OT_Impresion/${id}`, data);
  
  srvEliminar = (id:number|string) => this.http.delete(rutaPlasticaribeAPI + `/OT_Impresion/${id}`);

  srvGuardar = (data : modelOT_Impresion): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/OT_Impresion', data);
}
