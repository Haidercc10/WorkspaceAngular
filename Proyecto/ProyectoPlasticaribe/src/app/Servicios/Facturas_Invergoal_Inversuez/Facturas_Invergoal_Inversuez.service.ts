import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelFacturasInvergoalInversuez } from 'src/app/Modelo/modelFacturasInvergoalInversuez';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class Facturas_Invergoal_InversuezService {

constructor(private http : HttpClient) { }

    Get_Facturas = () : Observable<any[]> => this.http.get<any[]>(`${this.rutaPlasticaribeAPI}/Facturas_Invergoal_Inversuez`);

    Get_Factura_Id = (id : number) : Observable<any[]> => this.http.get<any[]>(`${this.rutaPlasticaribeAPI}/Facturas_Invergoal_Inversuez/${id}`);

    GetFacturasIngresadas(emp : string, fechaInicial : any, fechaFinal : any, ruta : string) : Observable<any[]> {
        return this.http.get<any[]>(`${this.rutaPlasticaribeAPI}/Facturas_Invergoal_Inversuez/getFacturasIngresadas/${emp}/${fechaInicial}/${fechaFinal}${ruta}`);
    }

    GetProveedoresFacturas_Pagar = () : Observable<any[]> => this.http.get<any[]>(`${this.rutaPlasticaribeAPI}/Facturas_Invergoal_Inversuez/getProveedoresFacturas_Pagar`);

    GetFacturas_Pagar = () : Observable<any[]> => this.http.get<any[]>(`${this.rutaPlasticaribeAPI}/Facturas_Invergoal_Inversuez/getFacturas_Pagar`);

    GetFacturasPapel = (anio : number, mes : number, facturas : string []) => this.http.post(`${this.rutaPlasticaribeAPI}/Facturas_Invergoal_Inversuez/getFacturasPapel/${anio}/${mes}`, facturas);

    GetFacturasPapelIngresadas = (anio : number) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Facturas_Invergoal_Inversuez/getFacturasPapelIngresadas/${anio}`);
    
    Post = (data : modelFacturasInvergoalInversuez) => this.http.post(`${this.rutaPlasticaribeAPI}/Facturas_Invergoal_Inversuez`, data);

    Put = (id : number, data : modelFacturasInvergoalInversuez) => this.http.put(`${this.rutaPlasticaribeAPI}/Facturas_Invergoal_Inversuez/${id}`, data);

    Delete = (id : number) => this.http.delete(`${this.rutaPlasticaribeAPI}/Facturas_Invergoal_Inversuez/${id}`);
}