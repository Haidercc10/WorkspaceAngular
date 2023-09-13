import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { this.rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelRecuperado } from '../../Modelo/modelRecuperado';

@Injectable({
  providedIn: 'root'
})
export class RecuperadoService {

  constructor(private http : HttpClient,) { }

  srvObtenerUltimaAsignacion = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Recuperado_MatPrima/ultimoId');
  
  srvGuardar = (data : modelRecuperado): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Recuperado_MatPrima', data);

}
