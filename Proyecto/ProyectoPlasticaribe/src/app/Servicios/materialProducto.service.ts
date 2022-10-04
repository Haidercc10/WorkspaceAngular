import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs/internal/Observable';
import { AppComponent} from 'src/app/app.component';
import { modelMaterial } from '../Modelo/modelMaterial';
import { rutaPlasticaribeAPI, rutaPlasticaribeAPIPrueba } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class MaterialProductoService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = rutaPlasticaribeAPIPrueba;
  }

  //Metodo buscar lista de Materiales
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Material_MatPrima');
  }

  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Material_MatPrima/${id}`);
  }

  srvObtenerListaPorNombreMaterial(nombre : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Material_MatPrima/nombreMaterial/${nombre}`);
  }


  //Metodo agregar Materiales
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Material_MatPrima', data)
  }

  //Metodo actualzar Materiales
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Material_MatPrima/${id}`, data);
  }

  //Metodo eliminar Materiales
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Material_MatPrima/${id}`);
  }

  //
  srvGuardar(data : modelMaterial): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Material_MatPrima', data)
  }

}
