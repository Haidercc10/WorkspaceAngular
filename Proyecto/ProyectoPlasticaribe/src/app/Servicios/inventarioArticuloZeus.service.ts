import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class InventarioArticuloZeusService {

  readonly rutaInventarioZeusAPI = "http://192.168.0.137:9055/api";

  constructor(private http : HttpClient) { }

  //Metodo buscar lista de Productos
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaInventarioZeusAPI + '/articulos');
  }

  srvObtenerListaPorId(idArticulo : number){
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/articulos/${idArticulo}`);
  }

  srvObtenerListaPorCodigo(Codigo : any){
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/articulos/Codigo/${Codigo}`);
  }

}
