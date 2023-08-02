import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelTiposSellados } from 'src/app/Modelo/modelTiposSellados';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class TiposSelladoService {
  
  constructor(private http : HttpClient,) { }

  srvObtenerLista = () => this.http.get<any>(rutaPlasticaribeAPI + '/TiposSellados');

  srvObtenerListaPorId = (dato : any) => this.http.get<any>(rutaPlasticaribeAPI + `/TiposSellados/${dato}`);

  srvActualizar = (id:number|string, data:any) => this.http.put(rutaPlasticaribeAPI + `/TiposSellados/${id}`, data);

  srvEliminar = (id:number|string) => this.http.delete(rutaPlasticaribeAPI + `/TiposSellados/${id}`);

  srvGuardar = (data : modelTiposSellados): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/TiposSellados', data);
}
