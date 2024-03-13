import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { loan } from 'src/app/Vistas/Prestamos_Nomina/Prestamos_Nomina.component';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class Prestamos_NominaService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http: HttpClient) { }

  GetLoansForId = (id: any) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Prestamos/${id}`);

  GetLoansForCardId = (cardId: any): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Prestamos/getLoansForCardId/${cardId}`);

  GetActiveLoansByWorker = (worker: number): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Prestamos/getActiveLoansByWorker/${worker}`);

  Post = (data: loan): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Prestamos', data);

  putLoanAnulled = (id: any, data: any[] = []) => this.http.put(`${this.rutaPlasticaribeAPI}/Prestamos/putLoanAnulled/${id}`, data);

  Put = (id: any, data: loan) => this.http.put(`${this.rutaPlasticaribeAPI}/Prestamos/${id}`, data);

  AddPaymentLoan = (payment: Array<PaymentLoan>) => this.http.put(`${this.rutaPlasticaribeAPI}/Prestamos/paymentLoan`, payment);
}

export interface PaymentLoan {
  idLoan: number;
  valuePay: number;
}
