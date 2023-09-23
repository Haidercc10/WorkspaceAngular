import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelDevolucionProductos } from '../../Modelo/modelDevolucionProductos';

@Injectable({
  providedIn: 'root'
})
export class DevolucionesProductosService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvGuardar = (data : modelDevolucionProductos): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Devolucion_ProductoFacturado', data);
}
