import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelBoppGenerico } from '../../Modelo/modelBoppGenerico';

@Injectable({
  providedIn: 'root'
})
export class BoppGenericoService {

  constructor(private http : HttpClient,) { }

  srvObtenerLista = () => this.http.get<any>(rutaPlasticaribeAPI + '/Bopp_Generico');
  
  srvObtenerListaPorId = (dato : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Bopp_Generico/${dato}`);

  obtenerUltimoId = () => this.http.get<any>(rutaPlasticaribeAPI + `/Bopp_Generico/`);

  srvGuardar = (data : modelBoppGenerico): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/Bopp_Generico', data);
}
