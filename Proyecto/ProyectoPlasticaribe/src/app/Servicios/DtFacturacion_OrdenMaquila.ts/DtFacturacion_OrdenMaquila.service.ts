import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelDtFacturacion_OrdenMaquila } from 'src/app/Modelo/modelDtFacturacion_OrdenMaquila';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DtFacturacion_OrdenMaquilaService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  GetConsultarFacturacion = (dato : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleFacturacion_OrdenMaquila/getConsultarFacturacion/${dato}`);

  insert = (data : modelDtFacturacion_OrdenMaquila) : Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/DetalleFacturacion_OrdenMaquila', data);
}
