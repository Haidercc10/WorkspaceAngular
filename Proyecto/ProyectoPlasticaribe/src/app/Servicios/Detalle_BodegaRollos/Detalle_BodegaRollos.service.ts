import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelDtBodegasRollos } from 'src/app/Modelo/modelDtBodegasRollos';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Detalle_BodegaRollosService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient) { }

  GetTodo = () : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Detalles_BodegasRollos`);

  Get_Id = (id : any) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Detalles_BodegasRollos/${id}`);

  GetRollos = (data : any []) : Observable<any> => this.http.post(`${this.rutaPlasticaribeAPI}/Detalles_BodegasRollos/getRollos`, data);

  GetInfoRollo = (rollo : number, bodega : string) :Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Detalles_BodegasRollos/getInfoRollo/${rollo}/${bodega}`);

  getRollo = (rollo : number, bodega : string) :Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Detalles_BodegasRollos/getRollo/${rollo}/${bodega}`);

  GetRollosDisponibles = (bodega : string, ot : number, ruta : any) : Observable<any> => this.http.get(`${this.rutaPlasticaribeAPI}/Detalles_BodegasRollos/getRollosDisponibles/${bodega}/${ot}/${ruta}`);

  GetInventarioRollos = () : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Detalles_BodegasRollos/getInventarioRollos`);

  GetInventarioRollos_OrdenTrabajo = (orden : number, bodega : string) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Detalles_BodegasRollos/getInventarioRollos_OrdenTrabajo/${orden}/${bodega}`);

  GetInformacionIngreso = (id : any) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Detalles_BodegasRollos/getInformacionIngreso/${id}`);

  Post = (data : modelDtBodegasRollos) : Observable<any> => this.http.post(`${this.rutaPlasticaribeAPI}/Detalles_BodegasRollos`, data);

  Put = (id : any, data : modelDtBodegasRollos) : Observable<any> => this.http.put(`${this.rutaPlasticaribeAPI}/Detalles_BodegasRollos/${id}`, data);

  putRollsStore = (status : any, process : any, data : any[]) : Observable<any> => this.http.put(`${this.rutaPlasticaribeAPI}/Detalles_BodegasRollos/putRollsStore/${status}/${process}`, data);

  putUbicationRoll = (ubication : any, observation : any, data : any[]) : Observable<any> => this.http.put(`${this.rutaPlasticaribeAPI}/Detalles_BodegasRollos/putUbicationRoll/${ubication}/${observation}`, data);

  Delete = (id : any) => this.http.delete(`${this.rutaPlasticaribeAPI}/Detalles_BodegasRollos/${id}`);

  GetIdRollo = (rollo : any) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Detalles_BodegasRollos/getIdRollo/${rollo}`);
  
  getMovementsStore = (date1 : any, date2 : any, url : string) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Detalles_BodegasRollos/getMovementsStore/${date1}/${date2}${url}`);

  getRollsForOT = (ot : number) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Detalles_BodegasRollos/getRollsForOT/${ot}`);

  getInventoryAvailable = () : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Detalles_BodegasRollos/getInventoryAvailable`);
}
