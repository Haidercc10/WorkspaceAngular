import { HttpClient, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class ArchivosService {

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient) { }

  //Funcion que guardará los archivos que se deseen
  srvGuardar(data : any, fecha : any, categoria_Id : any, usuario : any, filePath : any): Observable<any> {
    return this.http.post(rutaPlasticaribeAPI + `/Archivos?Fecha=${fecha}&categoria_Id=${categoria_Id}&usua_Id=${usuario}&filePath=${filePath}`, data);
  }

  // Funcion que creará carpetas
  crearCarpetas(filePath : any){
    return this.http.get(rutaPlasticaribeAPI + `/Archivos/CrearCarpetas?filePath=${filePath}`);
  }

  // Funcion que hará una peticion al servidor, le pasará el nombre de un archivo para que lo busque y traiga la informacion de este en un dato tipo blob
  descargarArchivos(file : any, ruta : any) : Observable<any> {
    return this.http.request(new HttpRequest('GET', `${rutaPlasticaribeAPI}/Archivos/download?file=${file}&filePath=${ruta}`, null, {responseType: 'blob' } ));
  }

  // Funcion que devolverá las carpetas que estan en la ruta que se le pase
  mostrarCarpetas(ruta : string) : any{
    return this.http.get(`${rutaPlasticaribeAPI}/Archivos/Carpetas?filePath=${ruta}`);
  }

  // Funcion que devolverá los archivos que hay en la ruta que se le pase
  mostrarArchivos(ruta : string) : any {
    return this.http.get(`${rutaPlasticaribeAPI}/Archivos/Archivos?filePath=${ruta}`);
  }

  // Funcion que eliminará carpetas del directorio principal
  eliminarCarpetas(ruta : string) : any {
    return this.http.get(`${rutaPlasticaribeAPI}/Archivos/EliminarCarpeta?filePath=${ruta}`);
  }

  // funcion que eliminará archivos del directorio principal
  eliminarArchivos(ruta : string ) : any {
    return this.http.get(`${rutaPlasticaribeAPI}/Archivos/EliminarArchivos?filePath=${ruta}`);
  }

  //Funcion que moverá una carpeta
  moverCarpeta(rutaInicial : string, rutaFinal : string) : any{
    return this.http.get(`${rutaPlasticaribeAPI}/Archivos/MoverCarpeta?filePathInicial=${rutaInicial}&filePathFinal=${rutaFinal}`);
  }

  // Funcion que moverá un archivo
  moverArchivo(rutaInicial : string, rutaFinal : string) : any {
    return this.http.get(`${rutaPlasticaribeAPI}/Archivos/MoverArchivos?filePathInicial=${rutaInicial}&filePathFinal=${rutaFinal}`);
  }

  //Funcion que copiará un archivo
  copiarArchivo(rutaInicial : string, rutaFinal : string) : any {
    return this.http.get(`${rutaPlasticaribeAPI}/Archivos/CopiarArchivos?filePathInicial=${rutaInicial}&filePathFinal=${rutaFinal}`);
  }

  //Funcion que copiará una carpeta junto con sus archivos a otra carpeta
  copiarCarpeta(rutaInicial : string, rutaFinal : string){
    return this.http.get(`${rutaPlasticaribeAPI}/Archivos/CopiarCarpetas?sourceDir=${rutaInicial}&destinationDir=${rutaFinal}&recursive=true`);
  }
}
