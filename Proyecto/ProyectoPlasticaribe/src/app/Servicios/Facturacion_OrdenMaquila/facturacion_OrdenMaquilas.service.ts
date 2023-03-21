import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelFacturacion_OrdenMaquila } from 'src/app/Modelo/modelFacturacion_OdenMaquila';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class Facturacion_OrdenMaquilasService {

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }

  getTodo() {
    return this.http.get<any>(rutaPlasticaribeAPI + '/Facturacion_OrdenMaquila');
  }

  getId(dato : any){
    return this.http.get<any>(rutaPlasticaribeAPI + `/Facturacion_OrdenMaquila//${dato}`);
  }

  put(id:number|string, data:any) : Observable<any> {
    return this.http.put(rutaPlasticaribeAPI + `/Facturacion_OrdenMaquila/${id}`, data);
  }

  delete(id:number|string) {
    return this.http.delete(rutaPlasticaribeAPI + `/Facturacion_OrdenMaquila/${id}`);
  }

  insert(data : modelFacturacion_OrdenMaquila) : Observable<any> {
    return this.http.post(rutaPlasticaribeAPI + '/Facturacion_OrdenMaquila', data);
  }
}
