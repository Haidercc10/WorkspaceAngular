import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class InventInicialDiaService {

  constructor(private http : HttpClient,) { }

  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(rutaPlasticaribeAPI + '/InventarioInicialXDia_MatPrima')
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(rutaPlasticaribeAPI + `/InventarioInicialXDia_MatPrima/${dato}`);
  }

  Get_Cantidad_Material_Meses = () : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/InventarioInicialXDia_MatPrima/get_Cantidad_Material_Meses`);
}
