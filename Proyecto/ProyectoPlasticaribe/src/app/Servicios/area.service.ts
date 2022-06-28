import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribe3 } from 'src/polyfills';
import { modelAreas } from '../Modelo/modelAreas';

@Injectable({
  providedIn: 'root'
})
export class AreaService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribe3;

  //Encapsular httpclient en el constructor
    constructor(private http : HttpClient) { }

  //Metodo buscar lista de
    srvObtenerLista():Observable<any[]> {
        return this.http.get<any>(this.rutaPlasticaribeAPI + '/Areas')
    }

    srvObtenerListaPorId(dato : any){
      return this.http.get<any>(this.rutaPlasticaribeAPI + `/Areas/${dato}`);
    }

  //Metodo agregar
    srvAgregar(data:any) {
      return this.http.post(this.rutaPlasticaribeAPI + '/Areas', data)
    }

  //Metodo actualzar
    srvActualizar(id:number|String, data:any) {
      return this.http.put(this.rutaPlasticaribeAPI + `/Areas/${id}`, data);
    }

  //Metodo eliminar
    srvEliminar(id:number|String) {
      return this.http.delete(this.rutaPlasticaribeAPI + `/Areas/${id}`);
    }

    //Duardar
    srvGuardar(data : modelAreas): Observable<any> {
     return this.http.post(this.rutaPlasticaribeAPI + '/Areas', data);
   }

}
