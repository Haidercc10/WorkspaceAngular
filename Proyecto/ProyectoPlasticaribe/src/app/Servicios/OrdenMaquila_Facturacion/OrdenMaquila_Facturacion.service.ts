import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelOrdenMaquila_Facturacion } from 'src/app/Modelo/modelOrdenMaquila_Facturacion';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class OrdenMaquila_FacturacionService {


  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }

  getTodo() {
    return this.http.get<any>(rutaPlasticaribeAPI + '/OrdenMaquila_Facturacion');
  }

  getId(dato : any){
    return this.http.get<any>(rutaPlasticaribeAPI + `/OrdenMaquila_Facturacion//${dato}`);
  }

  GetOrdenMaquilaFacturada(id : number, mp : number) {
    return this.http.get<any>(rutaPlasticaribeAPI + `/OrdenMaquila_Facturacion/getOrdenMaquilaFacturada/${id}/${mp}`);
  }

  put(id:number|string, data:any) : Observable<any> {
    return this.http.put(rutaPlasticaribeAPI + `/OrdenMaquila_Facturacion/${id}`, data);
  }

  delete(id:number|string) {
    return this.http.delete(rutaPlasticaribeAPI + `/OrdenMaquila_Facturacion/${id}`);
  }

  insert(data : modelOrdenMaquila_Facturacion) : Observable<any> {
    return this.http.post(rutaPlasticaribeAPI + '/OrdenMaquila_Facturacion', data);
  }
}
