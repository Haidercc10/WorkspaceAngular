import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelArchivo } from '../Modelo/modelArchivos';

@Injectable({
  providedIn: 'root'
})
export class PruebaArchivosService {

readonly rutaPlasticaribeAPI = 'https://localhost:7152/api';

//Encapsular httpclient en el constructor
  constructor(private http : HttpClient) { }

//Metodo buscar lista de proveedor
  srvObtenerLista():Observable<any[]> {
      return this.http.get<any>(this.rutaPlasticaribeAPI + '/Archivoes')
  }

  //Metodo Guardar proveedor con un modelo
  srvGuardar(data : FormData): Observable<any> {
   return this.http.post('https://localhost:7152/api/Archivoes', data);
 }

}
