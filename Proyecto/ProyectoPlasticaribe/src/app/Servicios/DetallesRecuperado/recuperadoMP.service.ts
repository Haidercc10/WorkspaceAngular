import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelRecuperadoMP } from '../../Modelo/modelRecuperadoMP';

@Injectable({
  providedIn: 'root'
})
export class RecuperadoMPService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  consultaRecuperado(fecha1 : any, fecha2 : any, operario : any, turno : any, materiaPrima : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleRecuperado_MateriaPrima/MostrarMPRecuperada/${fecha1}/${fecha2}/${operario}/${turno}/${materiaPrima}`);
  }

  consultaRecuperadoModal(fecha1 : any, fecha2 : any, turno : any, materiaPrima : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleRecuperado_MateriaPrima/MostrarRecuperadoModal/${fecha1}/${fecha2}/${turno}/${materiaPrima}`);
  }

  srvGuardar = (data : modelRecuperadoMP): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/DetalleRecuperado_MateriaPrima', data);

}
