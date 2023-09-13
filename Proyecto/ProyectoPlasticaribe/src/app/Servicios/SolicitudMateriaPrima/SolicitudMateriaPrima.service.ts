import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelSolicitudMateriaPrima } from 'src/app/Modelo/modelSolicituMateriaPrima';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class SolicitudMateriaPrimaService {
  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
  
  constructor(private http : HttpClient) { }

  GetTodo = () : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Solicitud_MateriaPrima`);

  Get_Id = (id : number) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Solicitud_MateriaPrima/${id}`);

  GetSiguienteConsecutivo = () : Observable<number> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Solicitud_MateriaPrima/getNuevoConsecutivo`);

  Post = (data : modelSolicitudMateriaPrima) : Observable<any> => this.http.post(`${this.rutaPlasticaribeAPI}/Solicitud_MateriaPrima`, data);

  Put = (id : number, data : modelSolicitudMateriaPrima) : Observable<any> => this.http.put(`${this.rutaPlasticaribeAPI}/Solicitud_MateriaPrima/${id}`, data);

  getFechasEstado = (fecha1 : any, fecha2 : any, estado : any):Observable<any[]> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Solicitud_MateriaPrima/getFechasEstado/${fecha1}/${fecha2}/${estado}`);

  getFechas = (fecha1 : any, fecha2 : any):Observable<any[]> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Solicitud_MateriaPrima/getFechas/${fecha1}/${fecha2}`);

  getEstados = (estado : any):Observable<any[]> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Solicitud_MateriaPrima/getEstados/${estado}`);
}
