import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class Movimientos_NominaService {

  constructor(private http: HttpClient) { }

}

export interface Movimientos_Nomina {
  id?: number;
  trabajador_Id: number;
  codigoMovimento: number;
  nombreMovimento: 'PRESTAMO' | 'ANTICIPO' | 'AHORRO';
  valorTotal: number;
  valorDeuda: number;
  valorPagado: number;
  valorAbonado: number;
  valorFinalDeuda: number;
  fecha: string;
  hora: string;
  observacaion: string;
  creador_Id: number;
}
