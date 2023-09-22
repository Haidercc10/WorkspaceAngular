import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ZeusContabilidadService {

  constructor(private http : HttpClient,) { }

  readonly rutaZeusContabilidad = environment.rutaZeusContabilidad;

  /****************************************************************** CLIENTES ******************************************************************************/
  GetClientes = () : Observable<any> => this.http.get<any>(this.rutaZeusContabilidad + `/Clientes/getClientes`);

  /**************************************************************** FACTURAS BU *****************************************************************************/
  GetCarteraClientes = (id : string) => this.http.get<any>(this.rutaZeusContabilidad + `/FacturasBU/getCarteraClientes/${id}`);

  GetCarteraAgrupadaClientes = (ruta : string = '') => this.http.get<any>(`${this.rutaZeusContabilidad}/FacturasBU/getCarteraAgrupadaClientes${ruta}`);

  GetCarteraAgrupadaVendedores = (ruta : string = '') => this.http.get<any>(`${this.rutaZeusContabilidad}/FacturasBU/getCarteraAgrupadaVendedores${ruta}`);

  GetCartera = (ruta : string = '') => this.http.get<any>(`${this.rutaZeusContabilidad}/FacturasBU/getCartera${ruta}`);

  GetCartera_Anio_Mes = (anio : string, mes : string) => this.http.get<any>(`${this.rutaZeusContabilidad}/FacturasBU/getCartera_Anio_Mes/${anio}/${mes}`);

  GetCarteraTotal = (ruta : string = '') => this.http.get<any>(`${this.rutaZeusContabilidad}/FacturasBU/getCarteraTotal${ruta}`);

  GetCarteraVendedor = (id : any) => this.http.get<any>(`${this.rutaZeusContabilidad}/FacturasBU/getCarteraVendedor/${id}`);

  GetCartera_Mes_Anio = (periodo : any) => this.http.get<any>(`${this.rutaZeusContabilidad}/FacturasBU/getCartera_Mes_Anio/${periodo}`);

  /*********************************************************************** SaldoProvLibroPrincipal **********************************************************/
  GetCostosProveedores = (cuenta : string) => this.http.get<any>(`${this.rutaZeusContabilidad}/SaldoProv_LibroPrincipal/getCostosProveedores/${cuenta}`);

  GetCostosTotalProveedores = (cuenta : string) => this.http.get<any>(`${this.rutaZeusContabilidad}/SaldoProv_LibroPrincipal/getCostosTotalProveedores/${cuenta}`);

  /************************************************************************ FacturasLibroPrincipal *************************************************************/
  GetFacturasProveedores = (cuenta : string) => this.http.get<any>(`${this.rutaZeusContabilidad}/FacturasLibroPrincipal/getFacturasProveedores/${cuenta}`);

  GetCostosProveedores_Mes_Mes = (anio : string, cuenta : string) => this.http.get<any>(`${this.rutaZeusContabilidad}/FacturasLibroPrincipal/getCostosProveedores_Mes_Mes/${anio}/${cuenta}`);

  /************************************************************************ SaldocontBu *************************************************************/
  GetCostosCuentas_Mes_Mes = (anio : string) => this.http.get<any>(`${this.rutaZeusContabilidad}/SaldocontBu/getCostosCuentas_Mes_Mes/${anio}`);

  GetCostosCuentas_Mes_Mes_RangoFechas = (fechaInicio : any, fechaFin : any) => this.http.get<any>(`${this.rutaZeusContabilidad}/SaldocontBu/getCostosCuentas_Mes_Mes_RangoFechas/${fechaInicio}/${fechaFin}`);

  /************************************************************************ Transac *************************************************************/
  GetCostosCuentasxMesDetallada = (anio : string, mes : string, cuenta : string) => this.http.get<any>(`${this.rutaZeusContabilidad}/Transac/GetCostosCuentasxMesDetallada/${anio}/${mes}/${cuenta}`);

  GetCostos_Compras_Mes_Mes = (facturas : string [], anio : string, inver : string) => this.http.post<any>(`${this.rutaZeusContabilidad}/Transac/getCostos_Compras_Mes_Mes/${anio}/${inver}`, facturas);
  
  GetCostos_Compras_Proveedores_Mes_Mes = (facturas : string [], anio : string, inver : string) => this.http.post<any>(`${this.rutaZeusContabilidad}/Transac/getCostos_Compras_Proveedores_Mes_Mes/${anio}/${inver}`, facturas);
  
  GetCostos_Compras_Facturas_Mes_Mes = (facturas : string [], anio : string, inver : string) => this.http.post<any>(`${this.rutaZeusContabilidad}/Transac/getCostos_Compras_Facturas_Mes_Mes/${anio}/${inver}`, facturas);

}