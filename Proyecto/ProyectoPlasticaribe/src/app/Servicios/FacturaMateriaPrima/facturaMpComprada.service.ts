import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelFacturaMpCompra } from '../../Modelo/modelFacturaMpComprada';

@Injectable({
  providedIn: 'root'
})
export class FactuaMpCompradaService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }
  
  UltimoIdFactura = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Factura_Compra/UltimoIdFactura');
  
  srvGuardar = (data : modelFacturaMpCompra): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Factura_Compra', data);

}
