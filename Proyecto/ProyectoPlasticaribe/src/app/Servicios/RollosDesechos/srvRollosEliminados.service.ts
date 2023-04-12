import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class SrvRollosEliminadosService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

/** Completo */
  srvObtenerListaRollos():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Rollo_Desecho');
  }

  /** Individuales */
  srvObtenerListaRollosxOT(OT : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxOT/${OT}`);
  }

  srvObtenerListaRollosxRollo(rollo : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxRollo/${rollo}`);
  }

  srvObtenerListaRollosxFecha(fechaIni : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFecha/${fechaIni}`);
  }

  srvObtenerListaRollosxItem(producto : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxItem/${producto}`);
  }

  srvObtenerListaRollosxProceso(proceso : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxProceso/${proceso}`);
  }

/** Fechas y un parametro */
  srvObtenerListaRollosxFechas(fechaIni : any, fechaFin : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechas/${fechaIni}/${fechaFin}`);
  }

  srvObtenerListaRollosxFechasxItem(fechaIni : any, fechaFin : any, item : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechasxItem/${fechaIni}/${fechaFin}/${item}`);
  }

  srvObtenerListaRollosxFechasxOT(fechaIni : any, fechaFin : any, OT : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechasxOT/${fechaIni}/${fechaFin}/${OT}`);
  }

  srvObtenerListaRollosxFechasxRollo(fechaIni : any, fechaFin : any, rollo : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechasxRollo/${fechaIni}/${fechaFin}/${rollo}`);
  }


  /** Fechas + rollo + 1 parametro */
  srvObtenerListaRollosxFechasxRolloxItem(fechaIni : any, fechaFin : any, rollo : any, item : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechasxRolloxItem/${fechaIni}/${fechaFin}/${rollo}/${item}`);
  }

  srvObtenerListaRollosxFechasxRolloxOT(fechaIni : any, fechaFin : any, rollo : any, OT):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechasxRolloxOT/${fechaIni}/${fechaFin}/${rollo}/${OT}`);
  }


    /** Fechas + item + 1 parametro */

  srvObtenerListaRollosxFechasxItemxOT(fechaIni : any, fechaFin : any, item : any, OT):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechasxItemxOT/${fechaIni}/${fechaFin}/${item}/${OT}`);
  }


  srvObtenerListaRollosxFechasxRolloxItemxOT(fechaIni : any, fechaFin : any, rollo : any, item : any, OT):Observable<any[]> {
      return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechasxRolloxItemxOT/${fechaIni}/${fechaFin}/${rollo}/${item}/${OT}`);
  }

  /** OT y Rollo */
  srvObtenerListaRollosxOTxRollo(OT: any, rollo : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxOTxRollo/${OT}/${rollo}`);
  }

  /** Consulta por PROCESOS */
  getRollosxFechasxRolloxItemxOTXProceso(fecha1: any, fecha2 : any, rollo: any, item : any, OT: any, proceso : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechasxRolloxItemxOTXProceso/${fecha1}/${fecha2}/${rollo}/${item}/${OT}/${proceso}`);
  }

  getRollosxFechasxRolloxItemxProceso(fecha1: any, fecha2 : any, rollo: any, item : any, proceso : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechasxRolloxItemxProceso/${fecha1}/${fecha2}/${rollo}/${item}/${proceso}`);
  }

  getRollosxFechasxRolloxOTxProceso(fecha1: any, fecha2 : any, rollo: any, OT : any, proceso : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechasxRolloxOTxProceso/${fecha1}/${fecha2}/${rollo}/${OT}/${proceso}`);
  }

  getRollosxFechasxItemxOTxProceso(fecha1: any, fecha2 : any, item: any, OT : any, proceso : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechasxRolloxOTxProceso/${fecha1}/${fecha2}/${item}/${OT}/${proceso}`);
  }

  getRollosxFechasxRolloxProceso(fecha1: any, fecha2 : any, rollo: any, proceso : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechasxRolloxProceso/${fecha1}/${fecha2}/${rollo}/${proceso}`);
  }

  getRollosxFechasxItemxProceso(fecha1: any, fecha2 : any, item: any, proceso : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechasxItemxProceso/${fecha1}/${fecha2}/${item}/${proceso}`);
  }

  getRollosxFechasxOTxProceso(fecha1: any, fecha2 : any, OT: any, proceso : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechasxOTxProceso/${fecha1}/${fecha2}/${OT}/${proceso}`);
  }

  getRollosxFechasxProceso(fecha1: any, fecha2 : any, proceso : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechasxProceso/${fecha1}/${fecha2}/${proceso}`);
  }

  getRollosxFechaxOTxProceso(fecha1: any, OT : any, proceso : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechaxOTxProceso/${fecha1}/${OT}/${proceso}`);
  }

  getRollosxFechaxRolloxProceso(fecha1: any, rollo : any, proceso : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechaxRolloxProceso/${fecha1}/${rollo}/${proceso}`);
  }

  getRollosxFechaxItemxProceso(fecha1: any, item : any, proceso : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechaxItemxProceso/${fecha1}/${item}/${proceso}`);
  }

  getRollosxOTxRolloxProceso(OT: any, rollo : any, proceso : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxOTxRolloxProceso/${OT}/${rollo}/${proceso}`);
  }

  getRollosxOTxItemxProceso(OT: any, item : any, proceso : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxOTxItemxProceso/${OT}/${item}/${proceso}`);
  }



  /** Proceso e Item */
  srvObtenerListaRollosxProcesoxItem(proceso: any, item : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxProcesoxItem/${proceso}/${item}`);
  }

  /** fechas y proceso */
  srvObtenerListaRollosxFechasxProceso(fecha1: any, fecha2: any, proceso : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFProcesoxItem/${fecha1}/${fecha2}/${proceso}`);
  }

}


