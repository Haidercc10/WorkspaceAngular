import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelFacturacion_OrdenMaquila } from 'src/app/Modelo/modelFacturacion_OdenMaquila';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Facturacion_OrdenMaquilasService {

  constructor(private http : HttpClient,) { }

  getTodo = () => this.http.get<any>(this.rutaPlasticaribeAPI + '/Facturacion_OrdenMaquila');

  getId = (dato : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Facturacion_OrdenMaquila//${dato}`);

  put = (id:number|string, data:any) : Observable<any> => this.http.put(this.rutaPlasticaribeAPI + `/Facturacion_OrdenMaquila/${id}`, data);

  delete = (id:number|string) => this.http.delete(this.rutaPlasticaribeAPI + `/Facturacion_OrdenMaquila/${id}`);

  insert = (data : modelFacturacion_OrdenMaquila) : Observable<any>  => this.http.post(this.rutaPlasticaribeAPI + '/Facturacion_OrdenMaquila', data);
}
