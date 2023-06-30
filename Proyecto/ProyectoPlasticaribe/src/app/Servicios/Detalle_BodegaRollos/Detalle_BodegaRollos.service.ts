import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelDtBodegasRollos } from 'src/app/Modelo/modelDtBodegasRollos';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class Detalle_BodegaRollosService {

  constructor(private http : HttpClient) { }

  GetTodo = () : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/Detalles_BodegasRollos`);

  Get_Id = (id : any) : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/Detalles_BodegasRollos/${id}`);

  GetRollos = (data : any []) : Observable<any> => this.http.post(`${rutaPlasticaribeAPI}/Detalles_BodegasRollos/getRollos`, data);

  GetInfoRollo = (rollo : number, bodega : string) :Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/Detalles_BodegasRollos/getInfoRollo/${rollo}/${bodega}`);

  GetRollosDisponibles = (bodega : string, fechaInicial : any, fechaFinal : any, ot : number, ruta : any) : Observable<any> => this.http.get(`${rutaPlasticaribeAPI}/Detalles_BodegasRollos/getRollosDisponibles/${bodega}/${fechaInicial}/${fechaFinal}/${ot}/${ruta}`);

  GetInventarioRollos = () : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/Detalles_BodegasRollos/getInventarioRollos`);

  GetInventarioRollos_OrdenTrabajo = (orden : number, bodega : string) : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/Detalles_BodegasRollos/getInventarioRollos_OrdenTrabajo/${orden}/${bodega}`);

  Post = (data : modelDtBodegasRollos) : Observable<any> => this.http.post(`${rutaPlasticaribeAPI}/Detalles_BodegasRollos`, data);

  Put = (id : any, data : modelDtBodegasRollos) : Observable<any> => this.http.put(`${rutaPlasticaribeAPI}/Detalles_BodegasRollos/${id}`, data);

  Delete = (id : any) => this.http.delete(`${rutaPlasticaribeAPI}/Detalles_BodegasRollos/${id}`);

}
