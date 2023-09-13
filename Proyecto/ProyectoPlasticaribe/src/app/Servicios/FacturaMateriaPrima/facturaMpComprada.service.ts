import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { this.rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelFacturaMpCompra } from '../../Modelo/modelFacturaMpComprada';

@Injectable({
  providedIn: 'root'
})
export class FactuaMpCompradaService {

  constructor(private http : HttpClient,) { }
  UltimoIdFactura = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Factura_Compra/UltimoIdFactura');
  
  srvGuardar = (data : modelFacturaMpCompra): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Factura_Compra', data);

}
