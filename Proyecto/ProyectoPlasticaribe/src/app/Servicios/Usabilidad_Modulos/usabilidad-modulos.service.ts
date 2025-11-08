import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { modelUsabilidad_Modulos } from 'src/app/Modelo/modelUsabilidad_Modulos';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsabilidadModulosService {
  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  Post = (data : modelUsabilidad_Modulos) => this.http.post(this.rutaPlasticaribeAPI + '/Usabilidad_Modulos', data);
}
