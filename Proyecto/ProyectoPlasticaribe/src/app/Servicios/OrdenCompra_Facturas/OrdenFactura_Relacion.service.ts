import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelOrdenFactura_Relacion } from '../../Modelo/modelOrdenFactura_Relacion';

@Injectable({
  providedIn: 'root'
})
export class OrdenFactura_RelacionService {

  constructor(private http : HttpClient,) { }

  getTodo_OrdenCompra = () => this.http.get<any>(rutaPlasticaribeAPI + '/OrdenesCompras_FacturasCompras');

  getUltimoId_OrdenCompra = () => this.http.get<any>(rutaPlasticaribeAPI + `/OrdenesCompras_FacturasCompras`);

  getId_OrdenCompra = (dato : any) => this.http.get<any>(rutaPlasticaribeAPI + `/OrdenesCompras_FacturasCompras/${dato}`);

  putId_OrdenCompra = (id:number|string, data:any) => this.http.put(rutaPlasticaribeAPI + `/OrdenesCompras_FacturasCompras/${id}`, data);
  
  deleteID_OrdenCompra = (id:number|string) => this.http.delete(rutaPlasticaribeAPI + `/OrdenesCompras_FacturasCompras/${id}`);

  insert_OrdenCompra = (data : modelOrdenFactura_Relacion): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/OrdenesCompras_FacturasCompras', data);
}
