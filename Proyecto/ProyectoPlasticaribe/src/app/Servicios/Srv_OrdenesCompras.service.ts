import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelAreas } from '../Modelo/modelAreas';

@Injectable()
export class Srv_OrdenesComprasService {

 //Ruta del API
 readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

 //Encapsular httpclient en el constructor
   constructor(private httpAreas : HttpClient) {  }

 //Metodo buscar lista de OC
   srvObtenerListaOrdenesCompras():Observable<any[]> {
       return this.httpAreas.get<any>(this.rutaPlasticaribeAPI + '/Orden_Compra')
   }

  //Metodo buscar lista de OC por Id
  srvObtenerListaOrdenesComprasxId(IdOrden : any):Observable<any[]> {
    return this.httpAreas.get<any>(this.rutaPlasticaribeAPI + `/Orden_Compra/${IdOrden}`)
  }


}
