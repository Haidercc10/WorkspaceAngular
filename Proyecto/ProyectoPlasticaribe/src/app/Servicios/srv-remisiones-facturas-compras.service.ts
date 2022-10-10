import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { modelFacturaMp } from '../Modelo/modelFacturaMp';
import { rutaPlasticaribeAPI,  } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class SrvRemisionesFacturasComprasService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = ;
  }

  //Metodo buscar lista de facturas y remisiones en remisiones_facturascompras.
    srvObtenerLista():Observable<any[]> {
        return this.http.get<any>(this.rutaPlasticaribeAPI + '/Remision_FacturaCompra')
    }

    srvObtenerListaPorId(dato : any){
      return this.http.get<any>(this.rutaPlasticaribeAPI + `/Remision_FacturaCompra/${dato}`);
    }

  //Metodo agregar datos de Remision_FacturaCompra
    srvAgregar(data1:any, data2:any) {
      return this.http.post(this.rutaPlasticaribeAPI + '/Remision_FacturaCompra', data1, data2)
    }

  //Metodo actualzar Facturas de Remision_FacturaCompra
    srvActualizar(id:number|String, data:any) {
      return this.http.put(this.rutaPlasticaribeAPI + `/Remision_FacturaCompra/${id}`, data);
    }

  //Metodo eliminar Facturas de Remision_FacturaCompra
    srvEliminar(id:number|String) {
      return this.http.delete(this.rutaPlasticaribeAPI + `/Remision_FacturaCompra/${id}`);
    }

    //Duardar Facturas de Remision_FacturaCompra
    srvGuardar(data : modelFacturaMp): Observable<any> {
     return this.http.post(this.rutaPlasticaribeAPI + '/Remision_FacturaCompra', data);
   }
}
