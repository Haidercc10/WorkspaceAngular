import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelDtMantenimiento } from 'src/app/Modelo/modelDtMantenimiento';
import { rutaPlasticaribeAPI } from 'src/polyfills';


@Injectable({ providedIn: 'root' })

export class Detalle_MantenimientoService {

  constructor(private http : HttpClient) { }

  GetTodo = ():Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + '/Detalle_Mantenimiento');

  GetPDFMantenimiento = (id : any) =>this.http.get<any>(rutaPlasticaribeAPI + `/Detalle_Mantenimiento/getPDFMantenimiento/${id}`);

  getDetalleMtto = (idPedido : any):Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + `/Detalle_Mantenimiento/getDetalleMtto/${idPedido}`);

  getCodigoDetalleMtto = (idPedido : any):Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + `/Detalle_Mantenimiento/getCodigoMtto/${idPedido}`);

  GetDetalleMantenimiento = (id : any):Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + `/Mantenimiento/getMttoxId/${id}`);

  Put = (id:number|String, data:any) => this.http.put(rutaPlasticaribeAPI + `/Detalle_Mantenimiento/${id}`, data);

  PutEstado = (id: any, data:any, estado: any) => this.http.put(rutaPlasticaribeAPI + `/Detalle_Mantenimiento/CambioEstadoDetalleMtto/${id}?Estado=${estado}`, data);
  
  PutPrecio = (id: any, data:any) => this.http.put(rutaPlasticaribeAPI + `/Detalle_Mantenimiento/CambioPrecioDetalleMtto/${id}`, data);

  Delete = (id:number|String) => this.http.delete(rutaPlasticaribeAPI + `/Detalle_Mantenimiento/${id}`);

  Insert = (data : modelDtMantenimiento): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/Detalle_Mantenimiento', data);
}
