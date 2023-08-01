import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelOrdenCompraRemision } from 'src/app/Modelo/modelOrdenCompraRemision';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class OrdenCompra_RemisionService {

  constructor(private http : HttpClient,) { }

  getTodo_OrdenCompra = () => this.http.get<any>(rutaPlasticaribeAPI + '/Remision_OrdenCompra');

  getUltimoId_OrdenCompra = () => this.http.get<any>(rutaPlasticaribeAPI + `/Remision_OrdenCompra`);

  getId_OrdenCompra = (dato : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Remision_OrdenCompra/${dato}`);

  putId_OrdenCompra = (id:number|string, data:any) => this.http.put(rutaPlasticaribeAPI + `/Remision_OrdenCompra/${id}`, data);
  
  deleteID_OrdenCompra = (id:number|string) => this.http.delete(rutaPlasticaribeAPI + `/Remision_OrdenCompra/${id}`);

  insert_OrdenCompra = (data : modelOrdenCompraRemision): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/Remision_OrdenCompra', data);
}
