import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MatPrima_Material_PigmentoService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;  

  constructor(private http : HttpClient,) { }

  getPeletizadoForMaterialPigment = (material : number, pigment : number) => this.http.get<any>(this.rutaPlasticaribeAPI + `/MatPrima_Material_Pigmento/getPeletizadoForMaterialPigment/${material}/${pigment}`);

}
