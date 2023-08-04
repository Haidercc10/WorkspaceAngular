import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelOrdenMaquila_Facturacion } from 'src/app/Modelo/modelOrdenMaquila_Facturacion';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class OrdenMaquila_FacturacionService {

  constructor(private http : HttpClient,) { }

  getTodo = () => this.http.get<any>(rutaPlasticaribeAPI + '/OrdenMaquila_Facturacion');

  getId = (dato : any) => this.http.get<any>(rutaPlasticaribeAPI + `/OrdenMaquila_Facturacion//${dato}`);

  GetOrdenMaquilaFacturada = (id : number, mp : number) => this.http.get<any>(rutaPlasticaribeAPI + `/OrdenMaquila_Facturacion/getOrdenMaquilaFacturada/${id}/${mp}`);
  
  put = (id:number|string, data:any) : Observable<any> => this.http.put(rutaPlasticaribeAPI + `/OrdenMaquila_Facturacion/${id}`, data);

  delete = (id:number|string) => this.http.delete(rutaPlasticaribeAPI + `/OrdenMaquila_Facturacion/${id}`);

  insert = (data : modelOrdenMaquila_Facturacion) : Observable<any> => this.http.post(rutaPlasticaribeAPI + '/OrdenMaquila_Facturacion', data);
}
