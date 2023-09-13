import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class SrvTipos_UsuariosService {
  
  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
  constructor(private http : HttpClient) { }

  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Tipo_Usuario');

  srvObtenerListaPorId = (id : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Tipo_Usuario/${id}`);

  Insert = (data : any) => this.http.post(this.rutaPlasticaribeAPI + '/Tipo_Usuario/', data);
}
