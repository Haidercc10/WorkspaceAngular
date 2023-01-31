import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { rutaZeusContabilidad } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class ZeusContabilidadService {

  readonly rutaPlasticaribeAPI = rutaZeusContabilidad;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {
  }

  getVistasFavUsuario(id : string){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/FacturasBU/getCarteraClientes/${id}`);
  }
}