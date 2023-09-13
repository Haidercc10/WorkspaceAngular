import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { this.rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelFacturaMp } from '../../Modelo/modelFacturaMp';

@Injectable({
  providedIn: 'root'
})
export class FacturaMpService {

  constructor(private http : HttpClient,) { }

  srvObtenerpdfMovimientos = (codigo : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/FacturaCompra_MateriaPrima/pdfMovimientos/${codigo}`);

  GetEntradaFacRem_Fechas = (fecha1 : any, fecha2 : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/FacturaCompra_MateriaPrima/GetEntradaFacRem_Fechas/${fecha1}/${fecha2}`);

  GetEntradaFacRem_Codigo = (codigo : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/FacturaCompra_MateriaPrima/GetEntradaFacRem_Codigo/${codigo}`);

  GetEntradaFacRem_Proveedor = (prov : number) => this.http.get<any>(this.rutaPlasticaribeAPI + `/FacturaCompra_MateriaPrima/GetEntradaFacRem_Proveedor/${prov}`);

  GetEntradaFacRem_FechasTipoDocProveedor = (fecha1 : any, fecha2 : any, tipoDoc : string, prov : number) => {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/FacturaCompra_MateriaPrima/GetEntradaFacRem_FechasTipoDocProveedor/${fecha1}/${fecha2}/${tipoDoc}/${prov}`);
  }

  srvGuardar = (data : modelFacturaMp): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/FacturaCompra_MateriaPrima', data);

}
