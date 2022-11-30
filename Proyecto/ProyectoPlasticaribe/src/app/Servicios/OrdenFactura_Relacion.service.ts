import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelOrdenCompra } from '../Modelo/modelOrdenCompra';
import { modelOrdenFactura_Relacion } from '../Modelo/modelOrdenFactura_Relacion';

@Injectable({
  providedIn: 'root'
})
export class OrdenFactura_RelacionService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
                @Inject(SESSION_STORAGE) private storage: WebStorageService) { }

  getTodo_OrdenCompra() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/OrdenesCompras_FacturasCompras');
  }

  // Funcion que consultará el ultimo consecutivo de la orden de trabajo
  getUltimoId_OrdenCompra(){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/OrdenesCompras_FacturasCompras`);
  }

  // Funcion que consultará la informacion de una orden de trabajo por su consecutivo
  getId_OrdenCompra(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/OrdenesCompras_FacturasCompras/${dato}`);
  }

  //Metodo actualzar
  putId_OrdenCompra(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/OrdenesCompras_FacturasCompras/${id}`, data);
  }
  //Metodo eliminar
  deleteID_OrdenCompra(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/OrdenesCompras_FacturasCompras/${id}`);
  }

  insert_OrdenCompra(data : modelOrdenFactura_Relacion): Observable<any> {
  return this.http.post(this.rutaPlasticaribeAPI + '/OrdenesCompras_FacturasCompras', data);
  }

}