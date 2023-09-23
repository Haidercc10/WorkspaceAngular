import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InventInicialDiaService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/InventarioInicialXDia_MatPrima');

  srvObtenerListaPorId = (dato : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/InventarioInicialXDia_MatPrima/${dato}`);

  Get_Cantidad_Material_Meses = () : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/InventarioInicialXDia_MatPrima/get_Cantidad_Material_Meses`);

  GetCostoInventarioMateriasPrimas = () : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/InventarioInicialXDia_MatPrima/getCostoInventarioMateriasPrimas`);

  GetCostoInventarioBiorientado = (mes : number, anio : number) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/InventarioInicialXDia_MatPrima/getCostoInventarioBiorientado/${mes}/${anio}`);
}