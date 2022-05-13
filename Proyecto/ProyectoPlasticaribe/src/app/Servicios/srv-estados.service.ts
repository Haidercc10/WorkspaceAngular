import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelEstado } from '../Modelo/modelEstado';

@Injectable({
  providedIn: 'root'
})
export class SrvEstadosService {



  readonly rutaPlasticaribeAPI = "https://localhost:7137/api";

  //Encapsular httpclient en el constructor
    constructor(private httpEstados : HttpClient) {


    }
  //Metodo buscar lista de estados
    srvObtenerListaEstados():Observable<any[]> {
        return this.httpEstados.get<any>(this.rutaPlasticaribeAPI + '/Estadoes');
    }

    srvObtenerTiposEstados():Observable<any[]> {
      return this.httpEstados.get<any>(this.rutaPlasticaribeAPI + '/Tipo_Estado')
    }

    srvGuardarEstados(data : modelEstado):Observable<any[]> {
      return this.httpEstados.post<any>(this.rutaPlasticaribeAPI + '/Estadoes', data)
    }

}
