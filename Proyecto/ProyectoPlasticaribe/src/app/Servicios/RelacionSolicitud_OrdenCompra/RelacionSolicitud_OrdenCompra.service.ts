import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({ providedIn : 'root' })

export class RelacionSolicitud_OrdenCompraService {

constructor(private http : HttpClient) { }

  Post = (data : any) : Observable<any> => this.http.post(`${rutaPlasticaribeAPI}/SolicitudesMP_OrdenesCompra`, data);
}
