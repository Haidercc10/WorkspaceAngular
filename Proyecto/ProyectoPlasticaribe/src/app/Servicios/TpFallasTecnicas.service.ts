import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelTpFallasTecnicas } from '../Modelo/modelTpFallasTEcnicas';

@Injectable({
  providedIn: 'root'
})
export class TpFallasTecnicasService {

  readonly rutaPlasticaribeAPI =  rutaPlasticaribeAPI; /*"https://localhost:7137/api"*/;

  //Encapsular httpclient en el constructor
  constructor(private http: HttpClient) { }

  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Tipo_FallaTecnica');
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Tipo_FallaTecnica/${dato}`);
  }

  srvActualizar(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Tipo_FallaTecnica/${id}`, data);
  }

  srvEliminar(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Tipo_FallaTecnica/${id}`);
  }

  srvGuardar(data : modelTpFallasTecnicas): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/Tipo_FallaTecnica', data);
  }

}
