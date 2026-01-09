import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UpdateBillingDto, UpdateGoalDto } from 'src/app/Vistas/DashBoard_Facturacion/DashBoard_Facturacion.component';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CumplimientoFacturacionService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
  
    constructor(private http : HttpClient,) { }

    ComplianceToday = () => this.http.get<any>(this.rutaPlasticaribeAPI + `/Cumplimiento_Facturacion/ComplianceToday`);

    putActualGoal = (dto: UpdateGoalDto) => this.http.put<any>(`${this.rutaPlasticaribeAPI}/Cumplimiento_Facturacion/actual-goal`, dto);

    putCurrentBilling = (dto: UpdateBillingDto) => this.http.put<any>(`${this.rutaPlasticaribeAPI}/Cumplimiento_Facturacion/currentBilling`, dto);

}
