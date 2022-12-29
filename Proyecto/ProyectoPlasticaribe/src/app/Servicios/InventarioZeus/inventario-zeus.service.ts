import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaZeus } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class InventarioZeusService {

 //Encapsular httpClient en Constructor.
  constructor(private http : HttpClient) { }

//Crear ruta del api
readonly rutaInventarioZeusAPI = rutaZeus;

  srvObtenerExistenciasZeus():Observable<any[]> {
    return this.http.get<any>(this.rutaInventarioZeusAPI + '/existencias');
  }

  srvObtenerExistenciasZeusXId(Articulo : number):Observable<any[]> {
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/existencias/idArticulo/${Articulo}`);
  }

  srvObtenerExistenciasArticulosZeus():Observable<any[]> {
    return this.http.get<any>(this.rutaInventarioZeusAPI + '/existencias/BusquedaCodigoArticulo');
  }


  /************************************************************ DOCUMENTOS ITEMS **************************************************************/
  GetProductosFacturados(fecha1 : any, fecha2 : any){
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/DocumentoItems/ProductosFacturados/${fecha1}/${fecha2}`);
  }

  /************************************************************ FACTURACION DE CLIENTES **************************************************************/
  GetValorFacturadoHoy(){
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/FacturaDeCliente/ValorFacturadoHoy`);
  }
  /************************************************************ MOVIMIENTOS ITEMS **************************************************************/
  GetFacturacionMensual(fecha1 : any, fecha2 : any){
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/MovimientoItems/FacturacionMensual/${fecha1}/${fecha2}`);
  }

  GetFacturacionTodosMeses(mes : number){
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/MovimientoItems/FacturacionTodosMeses/${mes}`);
  }

  GetIvaVentaMensual(fecha1 : any, fecha2 : any){
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/MovimientoItems/GetIvaVentaMensual/${fecha1}/${fecha2}`);
  }

  GetIvaCompraMensual(fecha1 : any, fecha2 : any){
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/MovimientoItems/GetIvaCompraMensual/${fecha1}/${fecha2}`);
  }

  GetIvaCompraTodosMeses(mes : any){
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/MovimientoItems/GetIvaCompraTodosMeses/${mes}`);
  }

  GetPedidos(){
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/MovimientoItems/getPedidos`);
  }
}
