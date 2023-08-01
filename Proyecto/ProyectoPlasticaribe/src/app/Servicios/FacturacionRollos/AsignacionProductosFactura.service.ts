import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelAsigProductosFacturas } from '../../Modelo/modelAsigProductosFacturas';

@Injectable({
  providedIn: 'root'
})
export class AsignacionProductosFacturaService {

  constructor(private http : HttpClient,) { }

  srvObtenerListaPorFactura = (dato : any) => this.http.get<any>(rutaPlasticaribeAPI + `/AsignacionProducto_FacturaVenta/CodigoFactura/${dato}`);

  srvActualizarFactura = (id:number|string, data:any) => this.http.put(rutaPlasticaribeAPI + `/AsignacionProducto_FacturaVenta/ActualizacionFactura/${id}`, data);

  srvGuardar = (data : modelAsigProductosFacturas): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/AsignacionProducto_FacturaVenta', data);
}
