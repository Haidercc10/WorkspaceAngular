import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { rutaZeusContabilidad } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class ZeusContabilidadService {

  readonly rutaPlasticaribeAPI = rutaZeusContabilidad;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }

  GetCarteraClientes = (id : string) => this.http.get<any>(this.rutaPlasticaribeAPI + `/FacturasBU/getCarteraClientes/${id}`);

  GetCarteraAgrupadaClientes = () => this.http.get<any>(`${this.rutaPlasticaribeAPI}/FacturasBU/getCarteraAgrupadaClientes`);

  GetCarteraAgrupadaVendedores = () => this.http.get<any>(`${this.rutaPlasticaribeAPI}/FacturasBU/getCarteraAgrupadaVendedores`);

  GetCartera = () => this.http.get<any>(`${this.rutaPlasticaribeAPI}/FacturasBU/getCartera`);

  GetCarteraTotal = () => this.http.get<any>(`${this.rutaPlasticaribeAPI}/FacturasBU/getCarteraTotal`);

  GetCarteraVendedor = (id : any) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/FacturasBU/getCarteraVendedor/${id}`);
}
