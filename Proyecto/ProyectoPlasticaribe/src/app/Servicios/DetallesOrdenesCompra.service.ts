import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelDtOrdenCompra } from '../Modelo/modelDtOrdenCompra';

@Injectable({
  providedIn: 'root'
})
export class DetallesOrdenesCompraService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) { }

  getTodo_DtOrdenCompra() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Detalle_OrdenCompra');
  }

  // Funcion que consultará la informacion de una orden de trabajo por su consecutivo
  getId_DtOrdenCompra(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Detalle_OrdenCompra/${dato}`);
  }

  // Funcion que consultará la informacion de la ultima orden de compra creada para crear un pdf con dicha informacion
  GetUltimaOrdenCompra(){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Detalle_OrdenCompra/GetUltimaOrdenCompra`);
  }

  //Metodo actualzar
  putId_DtOrdenCompra(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Detalle_OrdenCompra/${id}`, data);
  }
  //Metodo eliminar
  deleteID_DtOrdenCompra(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Detalle_OrdenCompra/${id}`);
  }

  insert_DtOrdenCompra(data : modelDtOrdenCompra): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/Detalle_OrdenCompra', data);
  }

}
