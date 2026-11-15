import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, tap } from 'rxjs';
import { modelEventosCalendario } from 'src/app/Modelo/modelEventosCalendario';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventosCalendarioService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  /** Emite cada vez que se crea, edita o elimina un evento (la barra superior refresca su contador). */
  private readonly cambios = new Subject<void>();
  readonly cambios$ = this.cambios.asObservable();

  constructor(private http : HttpClient) { }

  Get = () : Observable<any[]> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/EventosCalendarios`);

  GetId = (id : number) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/EventosCalendarios/${id}`);

  GetEventosUsuario = (id : number, rol : number, inicio : any, fin : any) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/EventosCalendarios/getEventosUsuario/${id}/${rol}/${inicio}/${fin}`);

  GetCantidadEventos = (id : number, rol : number, inicio : any, fin : any) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/EventosCalendarios/getCantidadEventos/${id}/${rol}/${inicio}/${fin}`);

  GetEventosDia = (id : number, rol : number) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/EventosCalendarios/getEventosDia/${id}/${rol}`);

  GEtEventosMes = (id : number, rol : number) : Observable<any> => this.http.get(`${this.rutaPlasticaribeAPI}/EventosCalendarios/getEventosMes/${id}/${rol}`);

  Post = (data : modelEventosCalendario) : Observable<any> => this.http.post(`${this.rutaPlasticaribeAPI}/EventosCalendarios`, data).pipe(tap(() => this.cambios.next()));

  Put = (id : number, data : modelEventosCalendario) => this.http.put(`${this.rutaPlasticaribeAPI}/EventosCalendarios/${id}`, data).pipe(tap(() => this.cambios.next()));

  Delete = (id : number) => this.http.delete(`${this.rutaPlasticaribeAPI}/EventosCalendarios/${id}`).pipe(tap(() => this.cambios.next()));
}
