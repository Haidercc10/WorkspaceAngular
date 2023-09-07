import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelNominaPlasticaribe } from 'src/app/Modelo/modelNominaPlasticaribe';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class Nomina_PlasticaribeService {

  constructor(private http : HttpClient) { }

  Get_Id = (id : number) : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/Nomina_Plasticaribe/${id}`);

  GetMovimientosNomina = (anio : number, mes : number, tipo : number) : Observable<any> => this.http.get(`${rutaPlasticaribeAPI}/Nomina_Plasticaribe/getMovimientosNomina/${anio}/${mes}/${tipo}`);

  GetNominaIngresada = (fechaInicio : any, fechFin : any) : Observable<any> => this.http.get(`${rutaPlasticaribeAPI}/Nomina_Plasticaribe/getNominaIngresada/${fechaInicio}/${fechFin}`);

  Post = (data : any) => this.http.post(`${rutaPlasticaribeAPI}/Nomina_Plasticaribe`, data);

  Put = (id : number, data : modelNominaPlasticaribe) => this.http.put(`${rutaPlasticaribeAPI}/Nomina_Plasticaribe/${id}`, data);
}