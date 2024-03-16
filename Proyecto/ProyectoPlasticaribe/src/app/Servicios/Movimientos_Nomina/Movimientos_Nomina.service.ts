import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class Movimientos_NominaService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http: HttpClient) { }

  Post = (movement: Movimientos_Nomina) => this.http.post(`${this.rutaPlasticaribeAPI}/Movimientos_Nomina`, movement);

}

export interface Movimientos_Nomina {
  id?: number;
  trabajador_Id: number;
  codigoMovimento: number;
  nombreMovimento: 'PRESTAMO' | 'ANTICIPO' | 'AHORRO' | 'INCAPACIDAD';
  valorTotal: number;
  valorDeuda: number;
  valorPagado: number;
  valorAbonado: number;
  valorFinalDeuda: number;
  fecha: string;
  hora: string;
  observacaion: string;
  estado_Id: 11 | 13;
  creador_Id: number;
}
