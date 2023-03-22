import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { modelPistas } from 'src/app/Modelo/modelPistas';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class Inventario_Mes_ProductosService {

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
                @Inject(SESSION_STORAGE) private storage: WebStorageService) { }

  srvObtenerLista() {
    return this.http.get<any>(rutaPlasticaribeAPI + '/Inventario_Mensual_Productos');
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(rutaPlasticaribeAPI + `/Inventario_Mensual_Productos/${dato}`);
  }

  GetCantidadMes_Producto(prod : number, und : string){
    return this.http.get<any>(rutaPlasticaribeAPI + `/Inventario_Mensual_Productos/getCantidadMes_Producto/${prod}/${und}`);
  }

  srvActualizar(id:number|string, data:any) {
    return this.http.put(rutaPlasticaribeAPI + `/Inventario_Mensual_Productos/${id}`, data);
  }

  srvEliminar(id:number|string) {
    return this.http.delete(rutaPlasticaribeAPI + `/Inventario_Mensual_Productos/${id}`);
  }

  srvGuardar(data : modelPistas): Observable<any> {
   return this.http.post(rutaPlasticaribeAPI + '/Inventario_Mensual_Productos', data);
  }

}
