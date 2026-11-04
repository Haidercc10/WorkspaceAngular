import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RegistrarAsignacionRequest, RegistrarAsignacionResult } from 'src/app/Modelo/modelFlujoMaterialProduccion';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InventarioTransaccionalService {
  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http: HttpClient) { }

  /**
   * Registra la asignación, sus detalles, el consumo de inventario y el estado de la solicitud en una sola transacción.
   * Si la asignación supera el límite de la OT responde 409 con `requiereAutorizacion = true`.
   */
  registrarAsignacion = (data: RegistrarAsignacionRequest): Observable<RegistrarAsignacionResult> =>
    this.http.post<RegistrarAsignacionResult>(`${this.rutaPlasticaribeAPI}/InventarioTransaccional/registrar-asignacion`, data);
}
