import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelRemisionMP } from '../../Modelo/modelRemisionMP';

@Injectable({
  providedIn: 'root'
})
export class RemisionesMPService {

  constructor(private http : HttpClient,) { }

  srvObtenerpdfMovimientos = (codigo : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Remision_MateriaPrima/pdfMovimientos/${codigo}`);

  GetRemisionSinFactura = (codigo : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Remision_MateriaPrima/GetRemisionSinFactura/${codigo}`);
  
  srvGuardar = (data : modelRemisionMP): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/Remision_MateriaPrima', data);

}
