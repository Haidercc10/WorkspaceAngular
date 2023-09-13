import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { this.rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelOT_Laminado } from '../../Modelo/modelOT_Laminado';

@Injectable({
  providedIn: 'root'
})
export class OT_LaminadoService {

  constructor(private http : HttpClient,) { }

  GetOT_Laminado = (ot : number) => this.http.get<any>(this.rutaPlasticaribeAPI + `/OT_Laminado/getOT_Laminado/${ot}`);
    
  srvActualizar = (id:number|string, data:any) => this.http.put(this.rutaPlasticaribeAPI + `/OT_Laminado/${id}`, data);

  srvGuardar = (data : modelOT_Laminado): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/OT_Laminado', data);

}
