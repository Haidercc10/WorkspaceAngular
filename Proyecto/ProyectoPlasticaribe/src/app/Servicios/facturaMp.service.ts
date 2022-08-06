import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribe3, rutaPlasticaribeAPI } from 'src/polyfills';
import { modelFacturaMp } from '../Modelo/modelFacturaMp';

@Injectable({
  providedIn: 'root'
})
export class FacturaMpService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

//Encapsular httpclient en el constructor
  constructor(private http : HttpClient) { }

//Metodo buscar lista de Facturas de Facturas de Materia Prima Comprada Comprada
  srvObtenerLista():Observable<any[]> {
      return this.http.get<any>(this.rutaPlasticaribeAPI + '/FacturaCompra_MateriaPrima')
  }

  srvObtenerListaPorId(factura : any, mp : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/FacturaCompra_MateriaPrima/ Facco_Id=${factura}&MatPri_Id=${mp}`);
  }

  srvObtenerListaPorFacId(factura : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/FacturaCompra_MateriaPrima/facturaCompra/${factura}`);
  }

  srvObtenerListaPorMpId(materiaPrima : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/FacturaCompra_MateriaPrima/MP/${materiaPrima}`);
  }

  srvObtenerListaPorMpIdFechaActual(materiaPrima : any, fecha : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/FacturaCompra_MateriaPrima/MPFechaActual/${materiaPrima}?Facco_FechaFactura=${fecha} `);
  }

//Metodo agregar Facturas de Materia Prima Comprada
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/FacturaCompra_MateriaPrima', data)
  }

//Metodo actualzar Facturas de Materia Prima Comprada
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/FacturaCompra_MateriaPrima/${id}`, data);
  }

//Metodo eliminar Facturas de Materia Prima Comprada
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/FacturaCompra_MateriaPrima/${id}`);
  }

  //Duardar Facturas de Materia Prima Comprada
  srvGuardar(data : modelFacturaMp): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/FacturaCompra_MateriaPrima', data);
  }

}
