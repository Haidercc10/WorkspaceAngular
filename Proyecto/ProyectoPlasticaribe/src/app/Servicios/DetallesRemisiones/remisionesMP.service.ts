import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelRemisionMP } from '../../Modelo/modelRemisionMP';

@Injectable({
  providedIn: 'root'
})
export class RemisionesMPService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvObtenerpdfMovimientos = (codigo : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Remision_MateriaPrima/pdfMovimientos/${codigo}`);

  GetRemisionSinFactura = (codigo : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Remision_MateriaPrima/GetRemisionSinFactura/${codigo}`);
  
  srvGuardar = (data : modelRemisionMP): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Remision_MateriaPrima', data);

}
