import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelBoppGenerico } from '../../Modelo/modelBoppGenerico';

@Injectable({
  providedIn: 'root'
})
export class BoppGenericoService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvObtenerLista = () => this.http.get<any>(this.rutaPlasticaribeAPI + '/Bopp_Generico');
  
  srvObtenerListaPorId = (dato : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Bopp_Generico/${dato}`);

  obtenerUltimoId = () => this.http.get<any>(this.rutaPlasticaribeAPI + `/Bopp_Generico/`);

  srvGuardar = (data : modelBoppGenerico): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Bopp_Generico', data);
}
