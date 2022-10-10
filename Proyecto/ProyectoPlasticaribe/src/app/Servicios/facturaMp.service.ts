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
export class FacturaMpService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = ;
  }

//Metodo buscar lista de Facturas de Facturas de Materia Prima Comprada Comprada
  srvObtenerLista():Observable<any[]> {
      return this.http.get<any>(this.rutaPlasticaribeAPI + '/FacturaCompra_MateriaPrima')
  }

  srvObtenerListaPorId(factura : any, mp : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/FacturaCompra_MateriaPrima/ Facco_Id=${factura}&MatPri_Id=${mp}`);
  }

  srvObtenerListaPorFacId(factura : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/FacturaCompra_MateriaPrima/facturaCompra/${factura}`);
  }

  srvObtenerListaPorMpId(materiaPrima : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/FacturaCompra_MateriaPrima/MP/${materiaPrima}`);
  }

  srvObtenerListaPorMpIdFechaActual(materiaPrima : any, fecha : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/FacturaCompra_MateriaPrima/MPFechaActual/${materiaPrima}?Facco_FechaFactura=${fecha} `);
  }

  srvObtenerListaMov0(fecha : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/FacturaCompra_MateriaPrima/consultaMovimiento0/${fecha}`);
  }

  srvObtenerListaMov1(materiaPrima : any, fecha : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/FacturaCompra_MateriaPrima/consultaMovimiento1/${materiaPrima}/${fecha}`);
  }

  srvObtenerListaMov2(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/FacturaCompra_MateriaPrima/consultaMovimientos2/${id}`);
  }

  srvObtenerListaMov3(fechaIncial : any, fechaFinal : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/FacturaCompra_MateriaPrima/consultaMovimientos3/${fechaIncial}/${fechaFinal}`);
  }

  srvObtenerConsultaMov4(fechaIncial : any, materiaPrima : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/FacturaCompra_MateriaPrima/consultaMovimientos4/${fechaIncial}/${materiaPrima}`);
  }

  srvObtenerConsultaMov5(ot : number, fechaIncial : any, fechaFinal : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/FacturaCompra_MateriaPrima/consultaMovimientos5/${ot}/${fechaIncial}/${fechaFinal}`);
  }

  srvObtenerConsultaMov6(fechaIncial : any, fechaFinal : any, materiaPrima){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/FacturaCompra_MateriaPrima/consultaMovimientos6/${fechaIncial}/${fechaFinal}/${materiaPrima}`);
  }

  srvObtenerpdfMovimientos(codigo : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/FacturaCompra_MateriaPrima/pdfMovimientos/${codigo}`);
  }

//Metodo agregar Facturas de Materia Prima Comprada
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/FacturaCompra_MateriaPrima', data)
  }

//Metodo actualzar Facturas de Materia Prima Comprada
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/FacturaCompra_MateriaPrima/${id}`, data);
  }

//Metodo eliminar Facturas de Materia Prima Comprada
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/FacturaCompra_MateriaPrima/${id}`);
  }

  //Duardar Facturas de Materia Prima Comprada
  srvGuardar(data : modelFacturaMp): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/FacturaCompra_MateriaPrima', data);
  }

}
