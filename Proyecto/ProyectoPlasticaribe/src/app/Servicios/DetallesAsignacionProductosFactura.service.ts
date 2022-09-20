import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelAsigProductosFacturas } from '../Modelo/modelAsigProductosFacturas';

@Injectable({
  providedIn: 'root'
})
export class DetallesAsignacionProductosFacturaService {


  readonly rutaPlasticaribeAPI =  rutaPlasticaribeAPI; /*"https://localhost:7137/api"*/;

  //Encapsular httpclient en el constructor
  constructor(private http: HttpClient) { }

  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/DetallesAsignacionProducto_FacturaVenta');
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallesAsignacionProducto_FacturaVenta/${dato}`);
  }

  srvObtenerListaPorCodigoFactura(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallesAsignacionProducto_FacturaVenta/CodigoFactura/${dato}`);
  }

  srvActualizar(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/DetallesAsignacionProducto_FacturaVenta/${id}`, data);
  }

  srvEliminar(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/DetallesAsignacionProducto_FacturaVenta/${id}`);
  }

  srvGuardar(data : modelAsigProductosFacturas): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/DetallesAsignacionProducto_FacturaVenta', data);
  }

}
