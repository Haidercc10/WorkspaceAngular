import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class EstadosProcesosOTxVendedoresService {

  constructor(private http : HttpClient) { }

  srvObtenerListaPorFechas = (fecha1 : any, fecha2 : any, vendedor : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorFechasVendedor/${fecha1}/${fecha2}/${vendedor}`);
  
  consultarPorFechasVendedor = (fecha1 : any, fecha2 : any, vendedor : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Estados_ProcesosOT/consultaPorFechasVendedor/${fecha1}/${fecha2}/${vendedor}`);
}
