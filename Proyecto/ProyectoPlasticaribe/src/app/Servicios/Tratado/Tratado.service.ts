import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { this.rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelTratado } from '../../Modelo/modelTratado';

@Injectable({
  providedIn: 'root'
})
export class TratadoService {

  constructor(private http : HttpClient,) { }

  srvObtenerLista = () => this.http.get<any>(this.rutaPlasticaribeAPI + '/Tratados');

  srvObtenerListaPorId = (dato : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Tratados/${dato}`);

  srvActualizar = (id:number|string, data:any) => this.http.put(this.rutaPlasticaribeAPI + `/Tratados/${id}`, data);

  srvEliminar = (id:number|string) => this.http.delete(this.rutaPlasticaribeAPI + `/Tratados/${id}`);

  srvGuardar = (data : modelTratado): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Tratados', data);
}
