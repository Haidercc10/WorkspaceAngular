import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelDtAsgProductoFactura } from '../../Modelo/modelDtAsgProductoFactura';

@Injectable({
  providedIn: 'root'
})
export class DetallesAsignacionProductosFacturaService {

  constructor(private http : HttpClient,) { }

  srvObtenerListaPorCodigoFactura = (dato : any) => this.http.get<any>(rutaPlasticaribeAPI + `/DetallesAsignacionProducto_FacturaVenta/CodigoFactura/${dato}`);

  srvObtenerListaParaPDF = (dato : any) => this.http.get<any>(rutaPlasticaribeAPI + `/DetallesAsignacionProducto_FacturaVenta/CrearPdf/${dato}`);

  srvObtenerListaParaPDF2 = (dato : any) => this.http.get<any>(rutaPlasticaribeAPI + `/DetallesAsignacionProducto_FacturaVenta/CrearPdf2/${dato}`);

  srvConsultarPorFiltroFechas = (fecha1 : any, fecha2 : any) => this.http.get<any>(rutaPlasticaribeAPI + `/DetallesAsignacionProducto_FacturaVenta/FiltroFechas/${fecha1}/${fecha2}`);

  srvConsultarPorFiltroFactura = (factura : any, ot : any) => this.http.get<any>(rutaPlasticaribeAPI + `/DetallesAsignacionProducto_FacturaVenta/FiltroFactura/${factura}/${ot}`);

  srvGuardar = (data : modelDtAsgProductoFactura): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/DetallesAsignacionProducto_FacturaVenta', data);

  srvObtenerDocumentosXFechas = (fechaInicio : any, fechaFinal : any) : Observable<any> => this.http.get(rutaPlasticaribeAPI + `/DetallesAsignacionProducto_FacturaVenta/FiltroFechas/${fechaInicio}/${fechaFinal}`);
}
