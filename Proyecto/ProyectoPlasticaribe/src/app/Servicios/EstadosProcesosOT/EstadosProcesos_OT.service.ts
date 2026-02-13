import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EstadosProcesos_OTService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvObtenerListaPorOT = (dato : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorOT/${dato}`);

  GetInfo_OrdenesTrabajo(fechaIni : any, fechaFin : any, ruta : string) : Observable<any> {
    return this.http.get<any>(`${this.rutaPlasticaribeAPI}/Estados_ProcesosOT/getInfo_OrdenesTrabajo/${fechaIni}/${fechaFin}${ruta}`);
  }

  GetProductosOrdenesUltimoMes = (fecha1 : any, fecha2 : any, sales? : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/getProductosOrdenesUltimoMes/${fecha1}/${fecha2}${sales}`);

  GetVendedoresOrdenesUltimoMes = (fecha1 : any, fecha2 : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/getVendedoresOrdenesUltimoMes/${fecha1}/${fecha2}`);

  GetTotalMateriaPrimaAsignadaMes = (fecha1 : any, fecha2 : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/getTotalMateriaPrimaAsignadaMes/${fecha1}/${fecha2}`);

  GetOrdenesTrabajo_Pedido = (pedido : number) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/getOrdenesTrabajo_Pedido/${pedido}`);

  GetOrdenesMes_Estados = (sales? : string) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/getOrdenesMes_Estados${sales}`);

  getOtsForSalesOrder = (customerSales : any[]) => this.http.post<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/getOtsForSalesOrder`, customerSales);

  srvActualizarPorOT = (id : any, data : any) => this.http.put(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/ActualizacionFallaObservacion/${id}`, data);

  PutEstadoOrdenTrabajo = (ot : any, estado : any) => this.http.put(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/putEstadoOrden/${ot}?estadoOt=${estado}`, estado);

  consultaPorOT = (ot : number) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorOT/${ot}`);
}
