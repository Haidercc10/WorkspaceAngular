import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelDtOrdenCompra } from '../../Modelo/modelDtOrdenCompra';

@Injectable({
  providedIn: 'root'
})
export class DetallesOrdenesCompraService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  GetOrdenCompra = (dato : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Detalle_OrdenCompra/GetOrdenCompra/${dato}`);

  GetMateriaPrimaOrdenCompa = (orden : number, mp : number) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Detalle_OrdenCompra/getMateriaPrimaOrdenCompa/${orden}/${mp}`);

  GetListaOrdenesComprasxId = (IdOrden : any):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Detalle_OrdenCompra/InfoOrdenCompraxId/${IdOrden}`);

  GetOrdenesCompras = (fecha1 : any, fecha2 : any, ruta : string) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Detalle_OrdenCompra/getOrdenesCompras/${fecha1}/${fecha2}${ruta}`);

  putId_DtOrdenCompra = (id: any, data:any) => this.http.put(this.rutaPlasticaribeAPI + `/Detalle_OrdenCompra/${id}`, data);
    
  deleteID_DtOrdenCompra = (id:any) => this.http.delete(this.rutaPlasticaribeAPI + `/Detalle_OrdenCompra/${id}`);

  insert_DtOrdenCompra = (data : modelDtOrdenCompra): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Detalle_OrdenCompra', data);
}
