import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EstadosProcesosOTxVendedoresService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient) { }

  srvObtenerListaPorFechas = (fecha1 : any, fecha2 : any, vendedor : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorFechasVendedor/${fecha1}/${fecha2}/${vendedor}`);
  
  consultarPorFechasVendedor = (fecha1 : any, fecha2 : any, vendedor : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorFechasVendedor/${fecha1}/${fecha2}/${vendedor}`);
}
