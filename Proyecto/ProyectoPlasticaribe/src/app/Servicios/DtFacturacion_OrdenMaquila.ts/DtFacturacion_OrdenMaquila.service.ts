import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelDtFacturacion_OrdenMaquila } from 'src/app/Modelo/modelDtFacturacion_OrdenMaquila';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class DtFacturacion_OrdenMaquilaService {

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }

  getTodo() {
    return this.http.get<any>(rutaPlasticaribeAPI + '/DetalleFacturacion_OrdenMaquila');
  }

  getId(dato : any){
    return this.http.get<any>(rutaPlasticaribeAPI + `/DetalleFacturacion_OrdenMaquila//${dato}`);
  }

  put(id:number|string, data:any) : Observable<any> {
    return this.http.put(rutaPlasticaribeAPI + `/DetalleFacturacion_OrdenMaquila/${id}`, data);
  }

  delete(id:number|string) {
    return this.http.delete(rutaPlasticaribeAPI + `/DetalleFacturacion_OrdenMaquila/${id}`);
  }

  insert(data : modelDtFacturacion_OrdenMaquila) : Observable<any> {
    return this.http.post(rutaPlasticaribeAPI + '/DetalleFacturacion_OrdenMaquila', data);
  }
}
