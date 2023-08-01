import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelDtFacturacion_OrdenMaquila } from 'src/app/Modelo/modelDtFacturacion_OrdenMaquila';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class DtFacturacion_OrdenMaquilaService {

  constructor(private http : HttpClient,) { }

  GetConsultarFacturacion = (dato : any) => this.http.get<any>(rutaPlasticaribeAPI + `/DetalleFacturacion_OrdenMaquila/getConsultarFacturacion/${dato}`);

  insert = (data : modelDtFacturacion_OrdenMaquila) : Observable<any> => this.http.post(rutaPlasticaribeAPI + '/DetalleFacturacion_OrdenMaquila', data);
}
