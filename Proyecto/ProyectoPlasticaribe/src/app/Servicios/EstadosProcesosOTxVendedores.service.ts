import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class EstadosProcesosOTxVendedoresService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  constructor(private http : HttpClient) { }

  srvObtenerListaPorOT(dato : any, vendedor : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorOTVendedor/${dato}/${vendedor}`);
  }

  srvObtenerListaPorFecha(dato : any, vendedor : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorFechaVendedor/${dato}/${vendedor}`);
  }

  srvObtenerListaPorFechas(fecha1 : any, fecha2 : any, vendedor : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorFechasVendedor/${vendedor}?EstProcOT_FechaCreacion1=${fecha1}&EstProcOT_FechaCreacion2=${fecha2}`);
  }

  srvObtenerListaPorOtFecha(ot : any, fecha : any, vendedor : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorOtFechaVendedor/${ot}/${fecha}/${vendedor}`);
  }

  srvObtenerListaPorOtFechas(ot : any, fecha : any, fecha2, vendedor : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorOtFechasVendedor/${ot}?EstProcOT_FechaCreacion1=${fecha}&EstProcOT_FechaCreacion2=${fecha2}/${vendedor}`);
  }

  srvObtenerListaPorOtEstado(estado : any, vendedor : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultarPorEstadosVendedor/${estado}/${vendedor}`);
  }

  srvObtenerListaPorFechasEstado(fecha1 : any, fecha2 : any, estado : any, vendedor : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorFechasEstadoVendedor/${fecha1}/${fecha2}/${estado}/${vendedor}`);
  }

  // Funcion que va a enviar los parametros de la consulta
  consultarPorFechasVendedor(fecha1 : any, fecha2 : any, vendedor : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorFechasVendedor/${fecha1}/${fecha2}/${vendedor}`);
  }


}
