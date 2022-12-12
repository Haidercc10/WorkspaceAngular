import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelArchivo } from '../../Modelo/modelArchivos';

@Injectable({
  providedIn: 'root'
})
export class PruebaArchivosService {

readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient) { }

  //Metodo Guardar proveedor con un modelo
  srvGuardar(data : FormData, fecha : any, categoria_Id : any, usuario : any): Observable<any> {
    return this.http.post( `http://192.168.0.85:9085/api/Archivos?Fecha=${fecha}&categoria_Id=${categoria_Id}&usua_Id=${usuario}`, data);
  }

  // public downloadFile(file: string): Observable<HttpEvent<Blob>> {
  //   return this.http.request(new HttpRequest('GET', `https://localhost:7152/download/?file=${file}`, null,{responseType: 'blob' }));
  // }

  downloadFile(file : any) : Observable<any> {
    return this.http.request(new HttpRequest('GET', `https://localhost:7152/download/?file=${file}`, null, {responseType: 'blob' } ));
  }

}
