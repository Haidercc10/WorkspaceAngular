import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelOrdenMaquila } from 'src/app/Modelo/modelOrdenMaquila';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class Orden_MaquilaService {

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }

  getTodo() {
    return this.http.get<any>(rutaPlasticaribeAPI + '/Orden_Maquila');
  }

  getId(dato : any){
    return this.http.get<any>(rutaPlasticaribeAPI + `/Orden_Maquila/${dato}`);
  }

  GetUltimoId() {
    return this.http.get<any>(rutaPlasticaribeAPI + `/Orden_Maquila/GetUltimoId`);
  }

  GetConsultaDocumentos(fechaIncio : any, fechaFin : any, ruta : string) {
    return this.http.get<any>(rutaPlasticaribeAPI + `/Orden_Maquila/getConsultaDocumentos/${fechaIncio}/${fechaFin}${ruta}`);
  }

  put(id:number|string, data:any) : Observable<any> {
    return this.http.put(rutaPlasticaribeAPI + `/Orden_Maquila/${id}`, data);
  }

  delete(id:number|string) {
    return this.http.delete(rutaPlasticaribeAPI + `/Orden_Maquila/${id}`);
  }

  insert(data : modelOrdenMaquila) : Observable<any> {
    return this.http.post(rutaPlasticaribeAPI + '/Orden_Maquila', data);
  }

}
