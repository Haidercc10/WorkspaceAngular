import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})

export class SrvTipos_UsuariosService {

  constructor(private http : HttpClient) { }

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Tipo_Usuario')
  }

  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Tipo_Usuario/${id}`);
  }
}
