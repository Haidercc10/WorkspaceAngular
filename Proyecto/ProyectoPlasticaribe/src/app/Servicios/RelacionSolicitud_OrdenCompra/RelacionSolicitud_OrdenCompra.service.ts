import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn : 'root' })

export class RelacionSolicitud_OrdenCompraService {
  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
  
  constructor(private http : HttpClient) { }

  Post = (data : any) : Observable<any> => this.http.post(`${this.rutaPlasticaribeAPI}/SolicitudesMP_OrdenesCompra`, data);
}
