import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaBagPro, rutaBagProLocate } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class SrvClienteOtItemsService {

  constructor(private http : HttpClient) { }


  readonly rutaBagproAPI = rutaBagProLocate;

    srvObtenerItemsBagpro():Observable<any[]> {
      return this.http.get<any>(this.rutaBagproAPI + '/ClientesOtItems');
    }

    srvObtenerItemsBagproXClienteItem(codigo : any):Observable<any[]> {
      return this.http.get<any>(this.rutaBagproAPI + `/ClientesOtItems/OtItem/${codigo}`);
    }
  }
