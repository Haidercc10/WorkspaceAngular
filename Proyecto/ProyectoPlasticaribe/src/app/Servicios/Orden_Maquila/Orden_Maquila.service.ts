import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelOrdenMaquila } from 'src/app/Modelo/modelOrdenMaquila';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class Orden_MaquilaService {

  constructor(private http : HttpClient,) { }

  GetUltimoId = () => this.http.get<any>(rutaPlasticaribeAPI + `/Orden_Maquila/GetUltimoId`);

  GetConsultaDocumentos = (fechaIncio : any, fechaFin : any, ruta : string) => this.http.get<any>(rutaPlasticaribeAPI + `/Orden_Maquila/getConsultaDocumentos/${fechaIncio}/${fechaFin}${ruta}`);
  
  GetConsultaConsolidado = (fechaIncio : any, fechaFin : any, ruta : string) => this.http.get<any>(rutaPlasticaribeAPI + `/Orden_Maquila/getConsultaConsolidado/${fechaIncio}/${fechaFin}${ruta}`);
  
  put = (id:number|string, data:any) : Observable<any> => this.http.put(rutaPlasticaribeAPI + `/Orden_Maquila/${id}`, data);

  delete = (id:number|string) => this.http.delete(rutaPlasticaribeAPI + `/Orden_Maquila/${id}`);

  insert = (data : modelOrdenMaquila) : Observable<any> => this.http.post(rutaPlasticaribeAPI + '/Orden_Maquila', data);
}
