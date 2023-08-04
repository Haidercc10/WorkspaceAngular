import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelEstadosProcesos_OT } from '../../Modelo/modelEstadosPreceos_OT';

@Injectable({
  providedIn: 'root'
})
export class EstadosProcesos_OTService {

  constructor(private http : HttpClient,) { }

  srvObtenerListaPorOT = (dato : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorOT/${dato}`);

  srvObtenerListaPorFallas = (dato : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorFallas/${dato}`);

  srvObtenerListaPorOtFechas(ot : any, fecha : any, fecha2){
    return this.http.get<any>(rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorOtFechas/${ot}?EstProcOT_FechaCreacion1=${fecha}&EstProcOT_FechaCreacion2=${fecha2}`);
  }

  srvObtenerListaPorFechasFallas(fecha : any, fecha2 : any, falla : any){
    return this.http.get<any>(rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorFechasFallas/${falla}?EstProcOT_FechaCreacion1=${fecha}&EstProcOT_FechaCreacion2=${fecha2}`);
  }

  srvObtenerListaPorOtEstado = (estado : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultarPorEstados/${estado}`);

  srvObtenerListaPorCliente = (cliente : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorClientes/${cliente}`);

  srvObtenerListaPorProductos = (prod : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorProductos/${prod}`);

  srvObtenerListaPorFechasEstado = (fecha1 : any, fecha2 : any, estado : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorFechasEstado/${fecha1}/${fecha2}/${estado}`);

  GetProductosOrdenesUltimoMes = (fecha1 : any, fecha2 : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Estados_ProcesosOT/getProductosOrdenesUltimoMes/${fecha1}/${fecha2}`);

  GetVendedoresOrdenesUltimoMes = (fecha1 : any, fecha2 : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Estados_ProcesosOT/getVendedoresOrdenesUltimoMes/${fecha1}/${fecha2}`);

  GetTotalMateriaPrimaAsignadaMes = (fecha1 : any, fecha2 : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Estados_ProcesosOT/getTotalMateriaPrimaAsignadaMes/${fecha1}/${fecha2}`);

  GetReporteProcesosOt = (fecha1 : any, fecha2 : any, ruta : string) => this.http.get<any>(rutaPlasticaribeAPI + `/Estados_ProcesosOT/getReporteProcesosOt/${fecha1}/${fecha2}/${ruta}`);

  GetOrdenesTrabajo_Pedido = (pedido : number) => this.http.get<any>(rutaPlasticaribeAPI + `/Estados_ProcesosOT/getOrdenesTrabajo_Pedido/${pedido}`);

  GetOrdenesMes_Estados = () => this.http.get<any>(rutaPlasticaribeAPI + `/Estados_ProcesosOT/getOrdenesMes_Estados`);

  srvActualizarPorOT = (id : any, data : any) => this.http.put(rutaPlasticaribeAPI + `/Estados_ProcesosOT/ActualizacionFallaObservacion/${id}`, data);

  PutEstadoOrdenTrabajo = (ot : any, estado : any) => this.http.put(rutaPlasticaribeAPI + `/Estados_ProcesosOT/putEstadoOrden/${ot}?estadoOt=${estado}`, estado);

}
