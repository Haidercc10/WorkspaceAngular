import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelOrdenMaquila_Facturacion } from 'src/app/Modelo/modelOrdenMaquila_Facturacion';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrdenMaquila_FacturacionService {

  constructor(private http : HttpClient,) { }

  getTodo = () => this.http.get<any>(this.rutaPlasticaribeAPI + '/OrdenMaquila_Facturacion');

  getId = (dato : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/OrdenMaquila_Facturacion//${dato}`);

  GetOrdenMaquilaFacturada = (id : number, mp : number) => this.http.get<any>(this.rutaPlasticaribeAPI + `/OrdenMaquila_Facturacion/getOrdenMaquilaFacturada/${id}/${mp}`);
  
  put = (id:number|string, data:any) : Observable<any> => this.http.put(this.rutaPlasticaribeAPI + `/OrdenMaquila_Facturacion/${id}`, data);

  delete = (id:number|string) => this.http.delete(this.rutaPlasticaribeAPI + `/OrdenMaquila_Facturacion/${id}`);

  insert = (data : modelOrdenMaquila_Facturacion) : Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/OrdenMaquila_Facturacion', data);
}
