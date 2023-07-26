import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { rutaZeusContabilidad } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class ZeusContabilidadService {

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }

  /**************************************************************** FACTURAS BU *****************************************************************************/
  GetCarteraClientes = (id : string) => this.http.get<any>(rutaZeusContabilidad + `/FacturasBU/getCarteraClientes/${id}`);

  GetCarteraAgrupadaClientes = () => this.http.get<any>(`${rutaZeusContabilidad}/FacturasBU/getCarteraAgrupadaClientes`);

  GetCarteraAgrupadaVendedores = () => this.http.get<any>(`${rutaZeusContabilidad}/FacturasBU/getCarteraAgrupadaVendedores`);

  GetCartera = () => this.http.get<any>(`${rutaZeusContabilidad}/FacturasBU/getCartera`);

  GetCartera_Anio_Mes = (anio : string, mes : string) => this.http.get<any>(`${rutaZeusContabilidad}/FacturasBU/getCartera_Anio_Mes/${anio}/${mes}`);

  GetCarteraTotal = () => this.http.get<any>(`${rutaZeusContabilidad}/FacturasBU/getCarteraTotal`);

  GetCarteraVendedor = (id : any) => this.http.get<any>(`${rutaZeusContabilidad}/FacturasBU/getCarteraVendedor/${id}`);

  GetCartera_Mes_Anio = (periodo : any) => this.http.get<any>(`${rutaZeusContabilidad}/FacturasBU/getCartera_Mes_Anio/${periodo}`);

  /*********************************************************************** SaldoProvLibroPrincipal **********************************************************/
  GetCostosProveedores = (cuenta : string) => this.http.get<any>(`${rutaZeusContabilidad}/SaldoProv_LibroPrincipal/getCostosProveedores/${cuenta}`);

  GetCostosTotalProveedores = (cuenta : string) => this.http.get<any>(`${rutaZeusContabilidad}/SaldoProv_LibroPrincipal/getCostosTotalProveedores/${cuenta}`);

  /************************************************************************ FacturasLibroPrincipal *************************************************************/
  GetFacturasProveedores = (cuenta : string) => this.http.get<any>(`${rutaZeusContabilidad}/FacturasLibroPrincipal/getFacturasProveedores/${cuenta}`);

  GetCostosProveedores_Mes_Mes = (anio : string, cuenta : string) => this.http.get<any>(`${rutaZeusContabilidad}/FacturasLibroPrincipal/getCostosProveedores_Mes_Mes/${anio}/${cuenta}`);

  /************************************************************************ FacturasLibroPrincipal *************************************************************/
  GetCostosCuentas_Mes_Mes = (anio : string) => this.http.get<any>(`${rutaZeusContabilidad}/SaldocontBu/getCostosCuentas_Mes_Mes/${anio}`);

  GetCostosCuentasxMesDetallada = (anio : string, mes : string, cuenta : string) => this.http.get<any>(`${rutaZeusContabilidad}/Transac/GetCostosCuentasxMesDetallada/${anio}/${mes}/${cuenta}`);
}
