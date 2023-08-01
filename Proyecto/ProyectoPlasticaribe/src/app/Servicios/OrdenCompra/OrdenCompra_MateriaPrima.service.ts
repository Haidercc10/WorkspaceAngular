import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelOrdenCompra } from '../../Modelo/modelOrdenCompra';

@Injectable({
  providedIn: 'root'
})
export class OrdenCompra_MateriaPrimaService {

  constructor(private http : HttpClient,) { }

  getUltimoId_OrdenCompra = () => this.http.get<any>(rutaPlasticaribeAPI + `/Orden_Compra/GetUltimoId`);

  getId_OrdenCompra = (dato : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Orden_Compra/${dato}`);

  GetOrdenCompraFacturada = (oc : number, mp : number) => this.http.get<any>(rutaPlasticaribeAPI + `/Orden_Compra/getOrdenCompraFacturada/${oc}/${mp}`);

  getListaOrdenesComprasxId = (IdOrden : any):Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + `/Detalle_OrdenCompra/InfoOrdenCompraxId/${IdOrden}`);
  
  getFacturasAsociadasAOC = (IdOrden : any):Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + `/OrdenesCompras_FacturasCompras/FacturasAsociadasAOC/${IdOrden}`);
  
  putId_OrdenCompra = (id:number|string, data:any) => this.http.put(rutaPlasticaribeAPI + `/Orden_Compra/${id}`, data);

  insert_OrdenCompra = (data : modelOrdenCompra): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/Orden_Compra', data);

  getRemisionesAsociadasAOC = (IdOrden : any):Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + `/Remision_OrdenCompra/RemisionesAsociadasAOC/${IdOrden}`);
  
  getRemisionesComprasAsociadasAOC = (IdOrden : any):Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + `/Remision_OrdenCompra/RemisionesComprasAsociadasAOC/${IdOrden}`);
  
}
