import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelRollosDesechos } from 'src/app/Modelo/modelRollosDesechos';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SrvRollosEliminadosService {
  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvObtenerListaRollosxOT = (OT : any):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxOT/${OT}`);

  srvObtenerListaRollosxRollo = (rollo : any):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxRollo/${rollo}`);

  srvObtenerListaRollosxItem = (producto : any):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxItem/${producto}`);

  srvObtenerListaRollosxProceso = (proceso : any):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxProceso/${proceso}`);

  srvObtenerListaRollosxFechas = (fechaIni : any, fechaFin : any):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechas/${fechaIni}/${fechaFin}`);

  srvObtenerListaRollosxFechasxItem = (fechaIni : any, fechaFin : any, item : any):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechasxItem/${fechaIni}/${fechaFin}/${item}`);

  srvObtenerListaRollosxFechasxOT = (fechaIni : any, fechaFin : any, OT : any):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechasxOT/${fechaIni}/${fechaFin}/${OT}`);

  srvObtenerListaRollosxFechasxRolloxItem = (fechaIni : any, fechaFin : any, rollo : any, item : any):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechasxRolloxItem/${fechaIni}/${fechaFin}/${rollo}/${item}`);

  srvObtenerListaRollosxFechasxRolloxOT = (fechaIni : any, fechaFin : any, rollo : any, OT):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechasxRolloxOT/${fechaIni}/${fechaFin}/${rollo}/${OT}`);

  srvObtenerListaRollosxFechasxRolloxItemxOT = (fechaIni : any, fechaFin : any, rollo : any, item : any, OT):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechasxRolloxItemxOT/${fechaIni}/${fechaFin}/${rollo}/${item}/${OT}`);

  getRollosxFechasxRolloxItemxProceso = (fecha1: any, fecha2 : any, rollo: any, item : any, proceso : any):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechasxRolloxItemxProceso/${fecha1}/${fecha2}/${rollo}/${item}/${proceso}`);

  getRollosxFechasxItemxOTxProceso = (fecha1: any, fecha2 : any, item: any, OT : any, proceso : any):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechasxRolloxOTxProceso/${fecha1}/${fecha2}/${item}/${OT}/${proceso}`);

  getRollosxFechasxRolloxProceso = (fecha1: any, fecha2 : any, rollo: any, proceso : any):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechasxRolloxProceso/${fecha1}/${fecha2}/${rollo}/${proceso}`);

  getRollosxFechasxItemxProceso = (fecha1: any, fecha2 : any, item: any, proceso : any):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechasxItemxProceso/${fecha1}/${fecha2}/${item}/${proceso}`);

  getRollosxFechasxProceso = (fecha1: any, fecha2 : any, proceso : any):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechasxProceso/${fecha1}/${fecha2}/${proceso}`);

  getRemovedRolls = (fecha1: any, fecha2 : any, ruta : string):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/getRemovedRolls/${fecha1}/${fecha2}${ruta}`);

  Post = (data : modelRollosDesechos): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Rollo_Desecho', data);
}


