import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { rutaPlasticaribeAPI,  } from 'src/polyfills';
import { modelDevolucion } from '../Modelo/modelDevolucion';

@Injectable({
  providedIn: 'root'
})
export class DevolucionesService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = ;
  }

//Metodo buscar lista de
  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Devolucion_MatPrima')
  }

  srvObtenerUltimaDevolucion(){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Devolucion_MatPrima/ultimoId`);
  }

  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Devolucion_MatPrima/${id}`);
  }

  srvObtenerListaPorfecha(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Devolucion_MatPrima/fecha/${id}`);
  }

  srvObtenerListaPofechas(fecha1 : any, fecha2 : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Devolucion_MatPrima/fechas?DevMatPri_Fecha1=${fecha1}&DevMatPri_Fecha2=${fecha2}`);
  }

  srvObtenerListaPorOT(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Devolucion_MatPrima/OT/${id}`);
  }
//Metodo agregar
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Devolucion_MatPrima', data)
  }
//Metodo actualizar
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Devolucion_MatPrima/${id}`, data);
  }
//Metodo eliminar
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Devolucion_MatPrima/${id}`);
  }

  srvGuardar(data : modelDevolucion): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/Devolucion_MatPrima', data);
  }

}
