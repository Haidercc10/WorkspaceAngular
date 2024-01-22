import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})

export class BodegasDespachoService {

constructor(private http: HttpClient) { }

    readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

    GetBodegas = (): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/BodegasDespacho/getBodegas`);

    GetUbicacionesPorBodegas = (bodega: string): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/BodegasDespacho/getUbicacionesPorBodegas/${bodega}`);

    GetSubUbicacionesPorUbicacion = (bg: string, ubi: string, nomUbi: string): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/BodegasDespacho/getSubUbicacionesPorUbicacion/${bg}/${ubi}/${nomUbi}`);

    GetCubosPorSubUbicacion = (bg: string, ubi: string, nomUbi: string, subUbi: string): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/BodegasDespacho/getCubosPorSubUbicacion/${bg}/${ubi}/${nomUbi}/${subUbi}`);

    GetCantidadRollosPorUbicacion = (): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/BodegasDespacho/getCantidadRollosPorUbicacion`);

    GetInventarioPorUbicacionYProductos = (): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/BodegasDespacho/getInventarioPorUbicacionYProductos`);

    GetInventarioPorUbicacionYProducto = (prod: number): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/BodegasDespacho/getInventarioPorUbicacionYProducto/${prod}`);

    GetInventarioPorUbicacion = (ubication: string): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/BodegasDespacho/getInventarioPorUbicacion/${ubication}`);
}
