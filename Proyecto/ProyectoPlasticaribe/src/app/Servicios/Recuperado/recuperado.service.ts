import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelRecuperado } from '../../Modelo/modelRecuperado';

@Injectable({
  providedIn: 'root'
})
export class RecuperadoService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvObtenerUltimaAsignacion = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Recuperado_MatPrima/ultimoId');
  
  srvGuardar = (data : modelRecuperado): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Recuperado_MatPrima', data);

}
