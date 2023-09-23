import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelRemisionFactura } from '../../Modelo/modelRemisionFactura';

@Injectable({
  providedIn: 'root'
})
export class RemisionFacturaService {
  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }
  
  srvGuardar = (data : modelRemisionFactura): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Remision_FacturaCompra', data);

}
