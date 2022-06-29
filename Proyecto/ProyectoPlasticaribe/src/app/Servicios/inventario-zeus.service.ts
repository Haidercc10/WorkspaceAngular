import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventarioZeusService {
 //Encapsular httpClient en Constructor.
  constructor(private http : HttpClient) { }

readonly rutaInventarioZeusAPI = "http://192.168.0.137:9055/api";
readonly rutaBagproAPI = "http://192.168.0.137:9056/api";

  srvObtenerExistenciasZeus():Observable<any[]> {
    return this.http.get<any>(this.rutaInventarioZeusAPI + '/existencias')
  }

  srvObtenerArticulosZeus():Observable<any[]> {
    return this.http.get<any>(this.rutaInventarioZeusAPI + '/articulos')
  }

  srvObtenerItemsBagpro():Observable<any[]> {
    return this.http.get<any>(this.rutaBagproAPI + '/ClientesOtItems')
  }
}