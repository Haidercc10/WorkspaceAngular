import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelRemisionFactura } from '../../Modelo/modelRemisionFactura';

@Injectable({
  providedIn: 'root'
})
export class RemisionFacturaService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }

  //Metodo buscar lista de proveedor
  srvObtenerLista():Observable<any[]> {
      return this.http.get<any>(this.rutaPlasticaribeAPI + '/Remision_FacturaCompra')
  }

  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Remision_FacturaCompra/${id}`);
  }

  srvObtenerListaPorFactId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Remision_FacturaCompra/F/${id}`);
  }

//Metodo agregar proveedor
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Remision_FacturaCompra', data)
  }

//Metodo actualzar proveedor
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Remision_FacturaCompra/${id}`, data);
  }

//Metodo eliminar proveedor
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Remision_FacturaCompra/${id}`);
  }

  //Metodo Guardar proveedor con un modelo
  srvGuardar(data : modelRemisionFactura): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Remision_FacturaCompra', data);
  }

}
