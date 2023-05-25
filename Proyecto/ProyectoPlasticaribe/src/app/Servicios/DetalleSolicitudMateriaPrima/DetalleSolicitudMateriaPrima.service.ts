import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelDtSolcitudMP } from 'src/app/Modelo/modelDtSolcitudMP';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})

export class DetalleSolicitudMateriaPrimaService {

constructor(private http : HttpClient) { }

  GetInfoSolicitud = (id : number) : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/Detalles_SolicitudMateriaPrima/getInfoSolicitud/${id}`);

  GetMateriaPrimaSolicitud = (sol : number, mp : number) : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/Detalles_SolicitudMateriaPrima/getMateriaPrimaSolicitud/${mp}/${sol}`);

  Post = (data : modelDtSolcitudMP) => this.http.post(`${rutaPlasticaribeAPI}/Detalles_SolicitudMateriaPrima`, data);

  Put = (id : number, data : modelDtSolcitudMP) => this.http.put(`${rutaPlasticaribeAPI}/Detalles_SolicitudMateriaPrima/${id}`, data);

  Delete = (id : number) => this.http.delete(`${rutaPlasticaribeAPI}/Detalles_SolicitudMateriaPrima/${id}`);
}
