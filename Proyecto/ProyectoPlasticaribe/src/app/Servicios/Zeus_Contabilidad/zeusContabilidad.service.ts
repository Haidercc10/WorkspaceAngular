import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { rutaZeusContabilidad } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class ZeusContabilidadService {

  readonly rutaPlasticaribeAPI = rutaZeusContabilidad;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }

  getVistasFavUsuario(id : string){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/FacturasBU/getCarteraClientes/${id}`);
  }
}
