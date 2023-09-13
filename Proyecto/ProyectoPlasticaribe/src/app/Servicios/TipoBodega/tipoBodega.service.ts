import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { this.rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelTipoBodega } from '../../Modelo/modelTipoBodega';

@Injectable({
  providedIn: 'root'
})
export class TipoBodegaService {
  
  constructor(private http : HttpClient,) { }
  
  srvObtenerListaPorId = (dato : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Tipo_Bodega/${dato}`);
}
