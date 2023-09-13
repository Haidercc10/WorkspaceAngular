import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelDetallesOrdenMaquila } from 'src/app/Modelo/modelDetallesOrdenMaquila';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class DetalleOrdenMaquilaService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient) { }

  getTodo() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Detalle_OrdenMaquila');
  }

  getId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Detalle_OrdenMaquila/${id}`);
  }

  getMateriaPrimaOrdenMaquila(orden : number, id : number){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Detalle_OrdenMaquila/getMateriaPrimaOrdenMaquila/${orden}/${id}`);
  }

  getInfoOrdenMaquila_Id(id : number){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Detalle_OrdenMaquila/getInfoOrdenMaquila_Id/${id}`);
  }

  put(id : any, data : any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Detalle_OrdenMaquila/${id}`, data);
  }

  delete(id : any) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Detalle_OrdenMaquila/${id}`);
  }

  insert(data : modelDetallesOrdenMaquila): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Detalle_OrdenMaquila', data);
  }

}
