import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelFacturaMp } from '../../Modelo/modelFacturaMp';

@Injectable({
  providedIn: 'root'
})
export class FacturaMpService {

  constructor(private http : HttpClient,) { }

  srvObtenerpdfMovimientos(codigo : any){
    return this.http.get<any>(rutaPlasticaribeAPI + `/FacturaCompra_MateriaPrima/pdfMovimientos/${codigo}`);
  }

  GetEntradaFacRem_Fechas(fecha1 : any, fecha2 : any){
    return this.http.get<any>(rutaPlasticaribeAPI + `/FacturaCompra_MateriaPrima/GetEntradaFacRem_Fechas/${fecha1}/${fecha2}`);
  }

  GetEntradaFacRem_Codigo(codigo : any){
    return this.http.get<any>(rutaPlasticaribeAPI + `/FacturaCompra_MateriaPrima/GetEntradaFacRem_Codigo/${codigo}`);
  }

  GetEntradaFacRem_Proveedor(prov : number){
    return this.http.get<any>(rutaPlasticaribeAPI + `/FacturaCompra_MateriaPrima/GetEntradaFacRem_Proveedor/${prov}`);
  }

  GetEntradaFacRem_FechasTipoDocProveedor(fecha1 : any, fecha2 : any, tipoDoc : string, prov : number){
    return this.http.get<any>(rutaPlasticaribeAPI + `/FacturaCompra_MateriaPrima/GetEntradaFacRem_FechasTipoDocProveedor/${fecha1}/${fecha2}/${tipoDoc}/${prov}`);
  }

//Metodo agregar Facturas de Materia Prima Comprada
  srvAgregar(data:any) {
    return this.http.post(rutaPlasticaribeAPI + '/FacturaCompra_MateriaPrima', data)
  }

//Metodo actualzar Facturas de Materia Prima Comprada
  srvActualizar(id:number|String, data:any) {
    return this.http.put(rutaPlasticaribeAPI + `/FacturaCompra_MateriaPrima/${id}`, data);
  }

//Metodo eliminar Facturas de Materia Prima Comprada
  srvEliminar(id:number|String) {
    return this.http.delete(rutaPlasticaribeAPI + `/FacturaCompra_MateriaPrima/${id}`);
  }

  //Duardar Facturas de Materia Prima Comprada
  srvGuardar(data : modelFacturaMp): Observable<any> {
    return this.http.post(rutaPlasticaribeAPI + '/FacturaCompra_MateriaPrima', data);
  }

}
