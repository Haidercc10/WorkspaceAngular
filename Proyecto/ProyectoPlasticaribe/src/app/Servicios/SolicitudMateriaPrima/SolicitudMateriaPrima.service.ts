import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelSolicitudMateriaPrima } from 'src/app/Modelo/modelSolicituMateriaPrima';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})

export class SolicitudMateriaPrimaService {

constructor(private http : HttpClient) { }

  GetTodo = () : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/Solicitud_MateriaPrima`);

  Get_Id = (id : number) : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/Solicitud_MateriaPrima/${id}`);

  GetSiguienteConsecutivo = () : Observable<number> => this.http.get<any>(`${rutaPlasticaribeAPI}/Solicitud_MateriaPrima/getNuevoConsecutivo`);

  Post = (data : modelSolicitudMateriaPrima) : Observable<any> => this.http.post(`${rutaPlasticaribeAPI}/Solicitud_MateriaPrima`, data);

  Put = (id : number, data : modelSolicitudMateriaPrima) : Observable<any> => this.http.put(`${rutaPlasticaribeAPI}/Solicitud_MateriaPrima/${id}`, data);
}
