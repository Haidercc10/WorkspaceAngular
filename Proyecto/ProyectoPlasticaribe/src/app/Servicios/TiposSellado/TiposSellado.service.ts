import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelTiposSellados } from 'src/app/Modelo/modelTiposSellados';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TiposSelladoService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
  
  constructor(private http : HttpClient,) { }

  srvObtenerLista = () => this.http.get<any>(this.rutaPlasticaribeAPI + '/TiposSellados');

  srvObtenerListaPorId = (dato : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/TiposSellados/${dato}`);

  srvActualizar = (id:number|string, data:any) => this.http.put(this.rutaPlasticaribeAPI + `/TiposSellados/${id}`, data);

  srvEliminar = (id:number|string) => this.http.delete(this.rutaPlasticaribeAPI + `/TiposSellados/${id}`);

  srvGuardar = (data : modelTiposSellados): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/TiposSellados', data);
}
