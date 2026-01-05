import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CumplimientoFacturacionService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
  
    constructor(private http : HttpClient,) { }

    ComplianceToday = () => this.http.get<any>(this.rutaPlasticaribeAPI + `/Cumplimiento_Facturacion/ComplianceToday`);
}
