import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelDtSolicitudRollos } from 'src/app/Modelo/modelDtSolicitudRollos';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Detalles_SolicitudRollosService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient) { }

  GetTodo = () : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Detalles_SolicitudRollos`);

  Get_Id = (id : any) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Detalles_SolicitudRollos/${id}`);

  GetInformacionSolicitud = (id : any) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Detalles_SolicitudRollos/getInformacionSolicitud/${id}`);

  Post = (data : modelDtSolicitudRollos) : Observable<any> => this.http.post(`${this.rutaPlasticaribeAPI}/Detalles_SolicitudRollos`, data);

  Put = (id : any, data : any) : Observable<any> => this.http.put(`${this.rutaPlasticaribeAPI}/Detalles_SolicitudRollos/${id}`, data);

  Delete = (id : any) => this.http.delete(`${this.rutaPlasticaribeAPI}/Detalles_SolicitudRollos/${id}`);

  GetSolicitudesRealizadas(tpSol : number, fechaInicio : any, fechaFin : any, ruta : string) : Observable<any[]>{
    return this.http.get<any>(`${this.rutaPlasticaribeAPI}/Detalles_SolicitudRollos/getSolicitudesRealizadas/${tpSol}/${fechaInicio}/${fechaFin}/${ruta}`);
  }

  GetDetallesSolicitud = (sol : number) : Observable<any[]> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Detalles_SolicitudRollos/getDetallesSolicitud/${sol}`);

}
