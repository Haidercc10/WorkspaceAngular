import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelDevolucionProductos } from '../../Modelo/modelDevolucionProductos';

@Injectable({
  providedIn: 'root'
})
export class DevolucionesProductosService {

  constructor(private http : HttpClient,) { }

  srvGuardar = (data : modelDevolucionProductos): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/Devolucion_ProductoFacturado', data);
}
