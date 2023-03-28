import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelOrdenCompra } from '../../Modelo/modelOrdenCompra';

@Injectable({
  providedIn: 'root'
})
export class OrdenCompra_MateriaPrimaService {


  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) { }

  getTodo_OrdenCompra() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Orden_Compra');
  }

  // Funcion que consultará el ultimo consecutivo de la orden de trabajo
  getUltimoId_OrdenCompra(){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Orden_Compra/GetUltimoId`);
  }

  // Funcion que consultará la informacion de una orden de trabajo por su consecutivo
  getId_OrdenCompra(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Orden_Compra/${dato}`);
  }

  // Funcion que consultará la informacion de una orden de trabajo por su consecutivo
  GetOrdenCompraFacturada(oc : number, mp : number){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Orden_Compra/getOrdenCompraFacturada/${oc}/${mp}`);
  }

    //Metodo buscar lista de OC por Id
  getListaOrdenesComprasxId(IdOrden : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Detalle_OrdenCompra/InfoOrdenCompraxId/${IdOrden}`);
  }

  getListaFacturasxOC(IdOrden : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/OrdenesCompras_FacturasCompras/InfoFacturaxOC/${IdOrden}`);
  }

  getFacturasAsociadasAOC(IdOrden : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/OrdenesCompras_FacturasCompras/FacturasAsociadasAOC/${IdOrden}`);
  }

  //Metodo actualzar
  putId_OrdenCompra(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Orden_Compra/${id}`, data);
  }
  //Metodo eliminar
  deleteID_OrdenCompra(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Orden_Compra/${id}`);
  }

  insert_OrdenCompra(data : modelOrdenCompra): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/Orden_Compra', data);
  }

    /** 2 formas de obtener las facturas que se encuentran asociadas a una OC.  */
  getFacturasComprasAsociadasAOC(IdOrden : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/OrdenesCompras_FacturasCompras/FacturasAsociadasAOC/${IdOrden}`);
  }

  getFacturasComprasAsociadasAOrden(IdOrden : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/OrdenesCompras_FacturasCompras/FacturasComprasAsociadasAOC/${IdOrden}`);
  }

  /** 2 formas de obtener las remisiones que se encuentran asociadas a una OC.  */
  getRemisionesAsociadasAOC(IdOrden : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Remision_OrdenCompra/RemisionesAsociadasAOC/${IdOrden}`);
  }

  getRemisionesComprasAsociadasAOC(IdOrden : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Remision_OrdenCompra/RemisionesComprasAsociadasAOC/${IdOrden}`);
  }

}
