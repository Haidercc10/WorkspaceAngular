import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { modelEstadosProcesos_OT } from '../../Modelo/modelEstadosPreceos_OT';
import { rutaPlasticaribeAPI,  } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class EstadosProcesos_OTService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = ;
  }

  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Estados_ProcesosOT/consultaGeneral');
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/${dato}`);
  }

  srvObtenerListaPorOT(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorOT/${dato}`);
  }

  srvObtenerListaPorFecha(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorFecha/${dato}`);
  }

  srvObtenerListaPorFallas(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorFallas/${dato}`);
  }

  srvObtenerListaPorFechas(fecha1 : any, fecha2 : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorFechas?EstProcOT_FechaCreacion1=${fecha1}&EstProcOT_FechaCreacion2=${fecha2}`);
  }

  srvObtenerListaPorOtFallas(ot : any, falla : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorOtFalla/${ot}/${falla}`);
  }

  srvObtenerListaPorOtFecha(ot : any, fecha : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorOtFecha/${ot}/${fecha}`);
  }

  srvObtenerListaPorOtFechas(ot : any, fecha : any, fecha2){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorOtFechas/${ot}?EstProcOT_FechaCreacion1=${fecha}&EstProcOT_FechaCreacion2=${fecha2}`);
  }

  srvObtenerListaPorFechasFallas(fecha : any, fecha2 : any, falla : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorFechasFallas/${falla}?EstProcOT_FechaCreacion1=${fecha}&EstProcOT_FechaCreacion2=${fecha2}`);
  }

  srvObtenerListaPorOtFechasFallas(ot : any, fecha : any, fecha2 : any, falla : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorOtFechasFallas/${ot}/${falla}?EstProcOT_FechaCreacion1=${fecha}&EstProcOT_FechaCreacion2=${fecha2}`);
  }

  srvObtenerListaPorOtFechaFalla(fecha : any, falla : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorOtFechsFalla/${fecha}/${falla}`);
  }

  srvObtenerListaPorOtEstado(estado : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultarPorEstados/${estado}`);
  }

  srvObtenerListaPorCliente(cliente : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorClientes/${cliente}`);
  }

  srvObtenerListaPorProductos(prod : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorProductos/${prod}`);
  }

  srvObtenerListaPorOtEstadoFalla(estado : any, falla : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorEstadosFallas/${estado}/${falla}`);
  }

  srvObtenerListaPorFechaEstadoFalla(fecha : any, estado : any, falla : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorFechaEstadoFalla/${fecha}/${estado}/${falla}`);
  }

  srvObtenerListaPorFechasEstado(fecha1 : any, fecha2 : any, estado : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorFechasEstado/${fecha1}/${fecha2}/${estado}`);
  }

  srvObtenerListaPorFechasEstadoFalla(fecha1 : any, fecha2 : any, estado : any, falla : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorFechasEstadoFallas/${fecha1}/${fecha2}/${estado}/${falla}`);
  }

  // Funcion que enviará los parametros de la consulta
  consultarPorFechasVendedor(fecha1 : any, fecha2 : any, vendedor : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorFechasVendedor/${fecha1}/${fecha2}/${vendedor}`);
  }

  // Funcion que enviará los parametros de la consulta
  consultarPorProductoVendedor(producto : any, vendedor : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaVendedorProducto/${producto}/${vendedor}`);
  }

  // Funcion que enviará los parametros de la consulta
  consultarPorClienteVendedor(cliente : any, vendedor : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaVendedorCliente/${cliente}/${vendedor}`);
  }

  // Funcion que va a consultar cuantas ordenes de trabajo se han hecho en el ultimo mes
  GetCantOrdenesUltimoMes(fecha1 : any, fecha2 : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/getCantOrdenesUltimoMes/${fecha1}/${fecha2}`);
  }

  // Funcion que va a consultar cuantas ordenes de trabajo se han hecho en el ultimo mes
  GetProductosOrdenesUltimoMes(fecha1 : any, fecha2 : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/getProductosOrdenesUltimoMes/${fecha1}/${fecha2}`);
  }

  // Funcion que va a consultar cuantas ordenes de trabajo se han hecho en el ultimo mes
  GetVendedoresOrdenesUltimoMes(fecha1 : any, fecha2 : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/getVendedoresOrdenesUltimoMes/${fecha1}/${fecha2}`);
  }

  // Funcion que va a consultar cuantas ordenes de trabajo se han hecho en el ultimo mes
  GetProcesosOrdenesUltimoMes(fecha1 : any, fecha2 : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/getProcesosOrdenesUltimoMes/${fecha1}/${fecha2}`);
  }

  // Funcion que va a consultar cuantas ordenes de trabajo se han hecho en el ultimo mes
  GetTotalMateriaPrimaAsignadaMes(fecha1 : any, fecha2 : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/getTotalMateriaPrimaAsignadaMes/${fecha1}/${fecha2}`);
  }

  GetReporteProcesosOt(fecha1 : any, fecha2 : any, ruta : string){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/getReporteProcesosOt/${fecha1}/${fecha2}/${ruta}`);
  }

  srvActualizar(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/${id}`, data);
  }

  srvActualizarPorOT(id : any, data : any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/ActualizacionFallaObservacion/${id}`, data);
  }

  srvEliminar(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/${id}`);
  }

  srvGuardar(data : modelEstadosProcesos_OT): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/Estados_ProcesosOT', data);
  }

}
