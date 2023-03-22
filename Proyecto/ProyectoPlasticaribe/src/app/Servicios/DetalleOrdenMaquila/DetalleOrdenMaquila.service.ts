import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelDetallesOrdenMaquila } from 'src/app/Modelo/modelDetallesOrdenMaquila';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})

export class DetalleOrdenMaquilaService {

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient) { }

  getTodo() {
    return this.http.get<any>(rutaPlasticaribeAPI + '/Detalle_OrdenMaquila');
  }

  getId(id : any){
    return this.http.get<any>(rutaPlasticaribeAPI + `/Detalle_OrdenMaquila/${id}`);
  }

  getMateriaPrimaOrdenMaquila(orden : number, id : number){
    return this.http.get<any>(rutaPlasticaribeAPI + `/Detalle_OrdenMaquila/getMateriaPrimaOrdenMaquila/${orden}/${id}`);
  }

  getInfoOrdenMaquila_Id(id : number){
    return this.http.get<any>(rutaPlasticaribeAPI + `/Detalle_OrdenMaquila/getInfoOrdenMaquila_Id/${id}`);
  }

  put(id : any, data : any) {
    return this.http.put(rutaPlasticaribeAPI + `/Detalle_OrdenMaquila/${id}`, data);
  }

  delete(id : any) {
    return this.http.delete(rutaPlasticaribeAPI + `/Detalle_OrdenMaquila/${id}`);
  }

  insert(data : modelDetallesOrdenMaquila): Observable<any> {
    return this.http.post(rutaPlasticaribeAPI + '/Detalle_OrdenMaquila', data);
  }

}
