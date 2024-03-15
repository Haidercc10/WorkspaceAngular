import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class NominaDetallada_PlasticaribeService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http: HttpClient) { }

  getReportPayroll = (date1: any, date2: any, route: string) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/NominaDetallada_Plasticaribe/getReportPayroll/${date1}/${date2}${route}`);

  Post = (payroll: Payroll) => this.http.post(`${this.rutaPlasticaribeAPI}/NominaDetallada_Plasticaribe`, payroll);

  PutChangeState = (advances: Array<AdvancePayroll>) => this.http.put(`${this.rutaPlasticaribeAPI}/NominaDetallada_Plasticaribe/putChangeState`, advances);
}

export interface Payroll {
  id?: number;
  id_Trabajador: number;
  salarioBase: number;
  periodoInicio: Date;
  periodoFin: Date;
  diasAusente: number;
  diasPagar: number;
  horasPagar: number;
  valorDiasPagar: number;
  diasIncapEG: number;
  valorIncapEG: number;
  diasIncapAT: number;
  valorIncapAT: number;
  diasIncapPATMAT: number;
  valorIncapPATMAT: number;
  horasADCDiurnas: number;
  valorADCDiurnas: number;
  horasNoctDom: number;
  valorNoctDom: number;
  horasExtDiurnasDom: number;
  valorExtDiurnasDom: number;
  horasRecargo035: number;
  valorRecargo035: number;
  horasExtNocturnasDom: number;
  valorExtNocturnasDom: number;
  horasRecargo075: number;
  valorRecargo075: number;
  horasRecargo100: number;
  valorRecargo100: number;
  tarifaADC: number;
  valorTotalADCComp: number;
  auxTransporte: number;
  productividadSella: number;
  productividadExt: number;
  productividadMontaje: number;
  devengado: number;
  eps: number;
  afp: number;
  ahorro: number;
  prestamo: number;
  anticipo: number;
  totalDcto: number;
  pagoPTESemanaAnt: number;
  dctos: number;
  deducciones: number;
  totalPagar: number;
  novedades: string;
  tipoNomina: 1 | 2 | 3 | 4;
  estado_Nomina: 11 | 13;
  creador_Id: number;
  fecha: Date;
  hora: string;
}

export interface AdvancePayroll {
  id: number;
  idWorker: number;
}
