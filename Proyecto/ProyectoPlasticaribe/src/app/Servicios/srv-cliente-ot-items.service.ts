import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SrvClienteOtItemsService {

  constructor(private http : HttpClient) { }


  readonly rutaBagproAPI = "http://192.168.0.140:9056/api";

    srvObtenerItemsBagpro():Observable<any[]> {
      return this.http.get<any>(this.rutaBagproAPI + '/ClientesOtItems');
    }

    srvObtenerItemsBagproXClienteItem(codigo : any):Observable<any[]> {
      return this.http.get<any>(this.rutaBagproAPI + `/ClientesOtItems/OtItem/${codigo}`);
    }
  }
