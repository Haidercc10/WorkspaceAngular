import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelDtOrdenCompra } from '../../Modelo/modelDtOrdenCompra';

@Injectable({
  providedIn: 'root'
})
export class DetallesOrdenesCompraService {

  constructor(private http : HttpClient,) { }

  GetOrdenCompra = (dato : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Detalle_OrdenCompra/GetOrdenCompra/${dato}`);

  GetOrdenCompra_fechas = (fecha1 : any, fecha2 : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Detalle_OrdenCompra/GetOrdenCompra_fechas/${fecha1}/${fecha2}`);

  GetOrdenCompra_Estado = (dato : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Detalle_OrdenCompra/GetOrdenCompra_Estado/${dato}`);

  GetOrdenCompra_EstadoFechas = (dato : any, fecha1 : any, fecha2 : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Detalle_OrdenCompra/GetOrdenCompra_EstadoFechas/${dato}/${fecha1}/${fecha2}`);

  GetMateriaPrimaOrdenCompa = (orden : number, mp : number) => this.http.get<any>(rutaPlasticaribeAPI + `/Detalle_OrdenCompra/getMateriaPrimaOrdenCompa/${orden}/${mp}`);

  GetListaOrdenesComprasxId = (IdOrden : any):Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + `/Detalle_OrdenCompra/InfoOrdenCompraxId/${IdOrden}`);

  putId_DtOrdenCompra = (id: any, data:any) => this.http.put(rutaPlasticaribeAPI + `/Detalle_OrdenCompra/${id}`, data);
    
  deleteID_DtOrdenCompra = (id:any) => this.http.delete(rutaPlasticaribeAPI + `/Detalle_OrdenCompra/${id}`);

  insert_DtOrdenCompra = (data : modelDtOrdenCompra): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/Detalle_OrdenCompra', data);

}
