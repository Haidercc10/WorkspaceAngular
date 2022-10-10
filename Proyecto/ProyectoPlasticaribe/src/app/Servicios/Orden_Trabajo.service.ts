import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { modelOrden_Trabajo } from '../Modelo/modelOrden_Trabajo';
import { rutaPlasticaribeAPI,  } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class Orden_TrabajoService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = ;
  }

  srvObtenerListaOrden_Trabajo() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Orden_Trabajo');
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Orden_Trabajo/${dato}`);
  }

  srvObtenerListaNumeroOt(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Orden_Trabajo/NumeroOt/${dato}`);
  }

  srvObtenerListaNumeroPedido(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Orden_Trabajo/NumeroPedido/${dato}`);
  }

  srvObtenerListaPdfOTInsertada(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Orden_Trabajo/PdfOTInsertada/${dato}`);
  }

  //Metodo actualzar Pedidos de Productos
  srvActualizar(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Orden_Trabajo/${id}`, data);
  }
  //Metodo eliminar Pedidos de Productos
  srvEliminar(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Orden_Trabajo/${id}`);
  }

  srvGuardar(data : modelOrden_Trabajo): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/Orden_Trabajo', data);
  }
}
