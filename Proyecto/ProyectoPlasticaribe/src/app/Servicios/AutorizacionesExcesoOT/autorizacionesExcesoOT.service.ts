import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AutorizacionExcesoPendiente } from 'src/app/Modelo/modelFlujoMaterialProduccion';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AutorizacionesExcesoOTService {
  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http: HttpClient) { }

  /** Pide autorización para asignar más kg de los permitidos en una OT. */
  solicitar = (ordenTrabajo: number, cantidadExcesoKg: number, motivo: string) =>
    this.http.post(`${this.rutaPlasticaribeAPI}/AutorizacionesExcesoOT`, { OrdenTrabajo: ordenTrabajo, CantidadExcesoKg: cantidadExcesoKg, Motivo: motivo });

  /** Lista las autorizaciones pendientes. Solo para roles con permiso para exceder el límite. */
  getPendientes = (): Observable<AutorizacionExcesoPendiente[]> =>
    this.http.get<AutorizacionExcesoPendiente[]>(`${this.rutaPlasticaribeAPI}/AutorizacionesExcesoOT/pendientes`);

  aprobar = (id: number) => this.http.put(`${this.rutaPlasticaribeAPI}/AutorizacionesExcesoOT/${id}/aprobar`, {});

  rechazar = (id: number, motivo: string) =>
    this.http.put(`${this.rutaPlasticaribeAPI}/AutorizacionesExcesoOT/${id}/rechazar`, { Motivo: motivo });
}
