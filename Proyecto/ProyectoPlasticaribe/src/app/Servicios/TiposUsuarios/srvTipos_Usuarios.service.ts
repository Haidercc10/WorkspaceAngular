import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})

export class SrvTipos_UsuariosService {

  constructor(private http : HttpClient) { }

  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + '/Tipo_Usuario');

  srvObtenerListaPorId = (id : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Tipo_Usuario/${id}`);

  Insert = (data : any) => this.http.post(rutaPlasticaribeAPI + '/Tipo_Usuario/', data);
}
