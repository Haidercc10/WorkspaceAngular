import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelDtProductoDevuelto } from '../../Modelo/modelDtProductoDevuelto';

@Injectable({
  providedIn: 'root'
})
export class DetallesDevolucionesProductosService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvObtenerCrearPDF = (dato : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleDevolucion_ProductoFacturado/CrearPdf/${dato}`);

  GetInformationDevById = (id : number) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/DetalleDevolucion_ProductoFacturado/getInformationDevById/${id}`);

  GetDevolutions = (startDate: any, endsDate, ruote: string) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/DetalleDevolucion_ProductoFacturado/getDevolutions/${startDate}/${endsDate}${ruote}`);

  srvGuardar = (data : modelDtProductoDevuelto): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/DetalleDevolucion_ProductoFacturado', data);

  getInfoDvForPeletizadoById = (id : number) => this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleDevolucion_ProductoFacturado/getInfoDvForPeletizadoById/${id}`);

}
