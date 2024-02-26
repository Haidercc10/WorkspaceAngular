import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class NominaDetallada_PlasticaribeService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http: HttpClient) { }

  Post = (data: NominaDetallada_Plasticaribe) => this.http.post(`${this.rutaPlasticaribeAPI}/NominaDetallada_Plasticaribe`, data);

}

export interface NominaDetallada_Plasticaribe {
  Id?: number;
  Id_Trabajador: number;
  SalarioBase: number;
  PeriodoInicio: any;
  PeriodoFin: any;
  DiasAusente: number;
  DiasPagar: number;
  HorasPagar: number;
  ValorDiasPagar: number;
  DiasIncapEG: number;
  ValorIncapEG: number;
  DiasIncapAT: number;
  ValorIncapAT: number;
  DiasIncapPATMAT: number;
  ValorIncapPATMAT: number;
  HorasADCDiurnas: number;
  ValorADCDiurnas: number;
  HorasNoctDom: number;
  ValorNoctDom: number;
  HorasExtDiurnasDom: number;
  ValorExtDiurnasDom: number;
  HorasRecargo035: number;
  ValorRecargo035: number;
  HorasExtNocturnasDom: number;
  ValorExtNocturnasDom: number;
  HorasRecargo075: number;
  ValorRecargo075: number;
  HorasRecargo100: number;
  ValorRecargo100: number;
  TarifaADC: number;
  ValorTotalADCComp: number;
  AuxTransporte: number;
  ProductividadSella: number;
  ProductividadExt: number;
  ProductividadMontaje: number;
  Devengado: number;
  EPS: number;
  AFP: number;
  Ahorro: number;
  Prestamo: number;
  Anticipo: number;
  TotalDcto: number;
  PagoPTESemanaAnt: number;
  Dctos: number;
  Deducciones: number;
  TotalPagar: number;
  Novedades: string;
  TipoNomina: number;
  Estado_Nomina: number;
  Creador_Id: number;
  Fecha: any;
  Hora: string;
}
