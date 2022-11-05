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

  srvObtenerListaRollos():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Rollo_Desecho');
  }

  srvObtenerListaRollosxOT(OT : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxOT/${OT}`);
  }

  srvObtenerListaRollosxRollo(rollo : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxRollo/${rollo}`);
  }

  /*srvObtenerListaRollosxOperario(operario : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxOperario/${operario}`);
  }*/

  srvObtenerListaRollosxFecha(fechaIni : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFecha/${fechaIni}`);
  }

  srvObtenerListaRollosxFechas(fechaIni : any, fechaFin : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechas/${fechaIni}/${fechaFin}`);
  }

  srvObtenerListaRollosxTurno(turno : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxTurno/${turno}`);
  }

  srvObtenerListaRollosxItem(producto : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxItem/${producto}`);
  }

  srvObtenerListaRollosxCliente(cliente : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxCliente/${cliente}`);
  }

  srvObtenerListaRollosxMaterial(material : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxMaterial/${material}`);
  }

  srvObtenerListaRollosxFechasxTurno(fechaIni : any, fechaFin : any, turno : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechasxTurno/${fechaIni}/${fechaFin}/${turno}`);
  }

  srvObtenerListaRollosxFechasxCliente(fechaIni : any, fechaFin : any, cliente : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechasxCliente/${fechaIni}/${fechaFin}/${cliente}`);
  }

  srvObtenerListaRollosxFechasxItem(fechaIni : any, fechaFin : any, item : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechasxItem/${fechaIni}/${fechaFin}/${item}`);
  }

  srvObtenerListaRollosxFechasxMaterial(fechaIni : any, fechaFin : any, material : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechasxMaterial/${fechaIni}/${fechaFin}/${material}`);
  }

  /*srvObtenerListaRollosxFechasxOperario(fechaIni : any, fechaFin : any, operario : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechasxCliente/${fechaIni}/${fechaFin}/${operario}`);
  }*/

  srvObtenerListaRollosxFechasxOT(fechaIni : any, fechaFin : any, OT : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechasxOT/${fechaIni}/${fechaFin}/${OT}`);
  }

  srvObtenerListaRollosxFechasxRollo(fechaIni : any, fechaFin : any, rollo : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rollo_Desecho/RollosxFechasxRollo/${fechaIni}/${fechaFin}/${rollo}`);
  }


}


