import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { modelRecuperado } from '../Modelo/modelRecuperado';
import { rutaPlasticaribeAPI,  } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class RecuperadoService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = ;
  }

  //Metodo buscar lista de proveedor
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Recuperado_MatPrima')
  }

  srvObtenerUltimaAsignacion():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Recuperado_MatPrima/ultimoId')
  }

  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Recuperado_MatPrima/${id}`);
  }

  srvObtenerListaPorFecha(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Recuperado_MatPrima/fecha/${id}`);
  }

  srvObtenerListaPorFechas(fecha1 : any, fecha2 : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Recuperado_MatPrima/fechas?RecMp_FechaIngreso1=${fecha1}&RecMp_FechaIngreso2=${fecha2}`);
  }

//Metodo agregar proveedor
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Recuperado_MatPrima', data)
  }

//Metodo actualzar proveedor
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Recuperado_MatPrima/${id}`, data);
  }

//Metodo eliminar proveedor
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Recuperado_MatPrima/${id}`);
  }

  //Metodo Guardar proveedor con un modelo
  srvGuardar(data : modelRecuperado): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Recuperado_MatPrima', data);
  }

}
