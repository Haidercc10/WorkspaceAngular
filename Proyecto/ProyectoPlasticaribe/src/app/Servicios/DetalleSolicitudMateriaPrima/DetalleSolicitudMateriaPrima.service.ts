import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelDtSolcitudMP } from 'src/app/Modelo/modelDtSolcitudMP';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class DetalleSolicitudMateriaPrimaService {

constructor(private http : HttpClient) { }

  GetInfoSolicitud = (id : number) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Detalles_SolicitudMateriaPrima/getInfoSolicitud/${id}`);

  GetMateriaPrimaSolicitud = (sol : number, mp : number) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Detalles_SolicitudMateriaPrima/getMateriaPrimaSolicitud/${mp}/${sol}`);

  GetEstadosMateriasPrimas = (id : number) : Observable<number[]> => this.http.get<number[]>(`${this.rutaPlasticaribeAPI}/Detalles_SolicitudMateriaPrima/getEstadosMateriasPrimas/${id}`);

  Post = (data : modelDtSolcitudMP) => this.http.post(`${this.rutaPlasticaribeAPI}/Detalles_SolicitudMateriaPrima`, data);

  Put = (id : number, data : modelDtSolcitudMP) => this.http.put(`${this.rutaPlasticaribeAPI}/Detalles_SolicitudMateriaPrima/${id}`, data);

  Delete = (id : number) => this.http.delete(`${this.rutaPlasticaribeAPI}/Detalles_SolicitudMateriaPrima/${id}`);

  GetDtlSolicitud = (id : number) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Detalles_SolicitudMateriaPrima/${id}`);

  getRelacionSolicitudesMp_Oc = (id : number) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Detalles_SolicitudMateriaPrima/getRelacionSolicitudesMp_Oc/${id}`);
}
