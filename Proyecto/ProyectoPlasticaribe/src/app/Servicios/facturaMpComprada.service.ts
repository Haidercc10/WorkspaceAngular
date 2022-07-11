import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribe3, rutaPlasticaribeAPI } from 'src/polyfills';
import { modelFacturaMpCompra } from '../Modelo/modelFacturaMpComprada';

@Injectable({
  providedIn: 'root'
})
export class FactuaMpCompradaService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribe3;

  //Encapsular httpclient en el constructor
    constructor(private http : HttpClient) { }

  //Metodo buscar lista de Facturas de Facturas de Materia Prima Comprada Comprada
    srvObtenerLista():Observable<any[]> {
        return this.http.get<any>(this.rutaPlasticaribeAPI + '/Factura_Compra')
    }

    srvObtenerListaPorId(dato : any){
      return this.http.get<any>(this.rutaPlasticaribeAPI + `/Factura_Compra/${dato}`);
    }

    srvObtenerListaPorTipo(dato : string){
      return this.http.get<any>(this.rutaPlasticaribeAPI + `/Factura_Compra/api/Factura_Compra/%20?nombre=${dato}`);
    }

    srvObtenerListaPorUsuario(dato : number){
      return this.http.get<any>(this.rutaPlasticaribeAPI + `/Factura_Compra/F/${dato}`);
    }

    srvObtenerListaPorProvId(dato : any){
      return this.http.get<any>(this.rutaPlasticaribeAPI + `/Factura_Compra/P/${dato}`);
    }

    srvObtenerListaPorFecha(dato : any){
      return this.http.get<any>(this.rutaPlasticaribeAPI + `/Factura_Compra/fecha/${dato}`);
    }

  //Metodo agregar Facturas de Materia Prima Comprada
    srvAgregar(data:any) {
      return this.http.post(this.rutaPlasticaribeAPI + '/Factura_Compra', data)
    }

  //Metodo actualzar Facturas de Materia Prima Comprada
    srvActualizar(id:number|String, data:any) {
      return this.http.put(this.rutaPlasticaribeAPI + `/Factura_Compra/${id}`, data);
    }

  //Metodo eliminar Facturas de Materia Prima Comprada
    srvEliminar(id:number|String) {
      return this.http.delete(this.rutaPlasticaribeAPI + `/Factura_Compra/${id}`);
    }

    //Duardar Facturas de Materia Prima Comprada
    srvGuardar(data : modelFacturaMpCompra): Observable<any> {
     return this.http.post(this.rutaPlasticaribeAPI + '/Factura_Compra', data);
   }

}
