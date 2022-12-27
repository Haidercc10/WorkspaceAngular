import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { modelOrdenCompraRemision } from 'src/app/Modelo/modelOrdenCompraRemision';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class OrdenCompra_RemisionService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
                @Inject(SESSION_STORAGE) private storage: WebStorageService) { }

  getTodo_OrdenCompra() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Remision_OrdenCompra');
  }

  // Funcion que consultará el ultimo consecutivo de la orden de trabajo
  getUltimoId_OrdenCompra(){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Remision_OrdenCompra`);
  }

  // Funcion que consultará la informacion de una orden de trabajo por su consecutivo
  getId_OrdenCompra(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Remision_OrdenCompra/${dato}`);
  }

  //Metodo actualzar
  putId_OrdenCompra(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Remision_OrdenCompra/${id}`, data);
  }
  //Metodo eliminar
  deleteID_OrdenCompra(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Remision_OrdenCompra/${id}`);
  }

  insert_OrdenCompra(data : modelOrdenCompraRemision): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Remision_OrdenCompra', data);
  }

}
