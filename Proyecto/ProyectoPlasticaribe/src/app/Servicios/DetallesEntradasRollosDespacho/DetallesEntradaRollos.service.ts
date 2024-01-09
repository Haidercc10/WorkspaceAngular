import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelDtEntradaRollos } from '../../Modelo/modelDtEntradaRollos';

@Injectable({
  providedIn: 'root'
})
export class DetallesEntradaRollosService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvObtenerVerificarRollo = (dato : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleEntradaRollo_Producto/VerificarRollo/${dato}`);

  srvConsultarProducto = (dato : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleEntradaRollo_Producto/consultarProducto/${dato}`);

  srvObtenerCrearPDF = (dato : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleEntradaRollo_Producto/CrearPdf/${dato}`);

  srvObtenerCrearPDF2 = (dato : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleEntradaRollo_Producto/CrearPdf2/${dato}`);

  srvCrearPDFUltimoId = (id : number) => this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleEntradaRollo_Producto/CrearPDFUltimoID/${id}`);
  
  GetRollos = (data : any []): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/DetalleEntradaRollo_Producto/getRollos', data);

  GetDataProductionIncome = (startDate: any, endDate: any, route: string) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/DetalleEntradaRollo_Producto/getDataProductionIncome/${startDate}/${endDate}${route}`);

  srvActualizar = (id:number|string, data:any) => this.http.put(this.rutaPlasticaribeAPI + `/DetalleEntradaRollo_Producto/${id}`, data);

  srvGuardar = (data : modelDtEntradaRollos): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/DetalleEntradaRollo_Producto', data);
}
