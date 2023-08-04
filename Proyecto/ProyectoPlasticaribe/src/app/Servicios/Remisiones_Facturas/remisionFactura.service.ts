import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelRemisionFactura } from '../../Modelo/modelRemisionFactura';

@Injectable({
  providedIn: 'root'
})
export class RemisionFacturaService {

  constructor(private http : HttpClient,) { }
  
  srvGuardar = (data : modelRemisionFactura): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/Remision_FacturaCompra', data);

}
