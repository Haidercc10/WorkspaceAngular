import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class ReImpresionEtiquetasService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http: HttpClient) { }

  insert = (data: ReImpresionEtiquetas) => this.http.post(`${this.rutaPlasticaribeAPI}/ReImpresionEtiquetas`, data);

  getCantidadReImpresionesPorEtiqueta = (rollos: Array<number>): Observable<any> => this.http.post(`${this.rutaPlasticaribeAPI}/ReImpresionEtiquetas/getCantidadReImpresionesPorEtiqueta`, rollos);

  getReImpresionesEtiquetaByRollo = (production: number): Observable<any> => this.http.get(`${this.rutaPlasticaribeAPI}/ReImpresionEtiquetas/getReImpresionesEtiquetaByRollo/${production}`);
}

export interface ReImpresionEtiquetas {
  Id?: number;
  Orden_Trabajo: number;
  NumeroRollo_BagPro: number;
  Proceso_Id: 'EXT' | 'IMP' | 'ROT' | 'LAM' | 'DBLD' | 'CORTE' | 'EMP' | 'SELLA' | 'WIKE';
  Fecha: any;
  Hora: string;
  Usua_Id: number;
}