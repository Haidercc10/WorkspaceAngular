import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class SrvRollosEliminadosService {

readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

constructor(private http : HttpClient,
  @Inject(SESSION_STORAGE) private storage: WebStorageService) {

  // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
  // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = ;
}

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

}


