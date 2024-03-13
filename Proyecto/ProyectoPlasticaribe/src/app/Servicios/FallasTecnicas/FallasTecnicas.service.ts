import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { fails } from 'src/app/Vistas/Crear_Fallas/Crear_Fallas.component';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FallasTecnicasService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvObtenerLista = () => this.http.get<any>(this.rutaPlasticaribeAPI + '/Falla_Tecnica');

  Post = (data: fails) => this.http.post(`${this.rutaPlasticaribeAPI}/Falla_Tecnica`, data);

}
