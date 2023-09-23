import { HttpClient, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TicketsService {
  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
  
  constructor(private http : HttpClient) { }

  Get = () => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Tickets`);

  Get_Id = (id : number) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Tickets/${id}`);

  GetUltimoTicket = () : Observable<number> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Tickets/get_IdSigTicket`);

  Get_InfoTicket_PDF = (codigo : number) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Tickets/get_InfoTicket_PDF/${codigo}`);

  Get_Tickets_AbiertosEnRevision = () : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Tickets/get_Tickets_AbiertosEnRevision`);

  Get_CantidadTickets = () : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Tickets/get_CantidadTickets`);

  Get_ImagenesTicket = (archivo : any, path : any ) : any => this.http.request(new HttpRequest('GET', `${this.rutaPlasticaribeAPI}/Tickets/get_ImagenesTicket?file=${archivo}&filePath=${path}`, null, {responseType: 'text' } ));

  crearTicket = (data : any) : Observable<any> => this.http.post(`${this.rutaPlasticaribeAPI}/Tickets`, data);

  crearImgTicket = (data : any) : Observable<any> => this.http.post(`${this.rutaPlasticaribeAPI}/Tickets/SubirArchivo`, data);

  actualizarTicket = (codigo : number, data : any) : Observable<any> => this.http.put(`${this.rutaPlasticaribeAPI}/Tickets/${codigo}`, data);
}
