import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelVistasPermisos } from 'src/app/Modelo/modelVistasPermisos';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})

export class Vistas_PermisosService {

    
  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

    constructor(private http : HttpClient,) { }

    Get_Todo = () : Observable<any> => this.http.get(`${this.rutaPlasticaribeAPI}/Vistas_Permisos`);

    Get_VistasDistintas = () : Observable<any> => this.http.get(`${this.rutaPlasticaribeAPI}/Vistas_Permisos/get_VistasDistintas`);

    Get_By_Id = (id : any) : Observable<any> => this.http.get(`${this.rutaPlasticaribeAPI}/Vistas_Permisos/${id}`);

    GetPermisos = (rol : any, ruta : any) : Observable<any> => this.http.get(`${this.rutaPlasticaribeAPI}/Vistas_Permisos/get_permisos/${rol}/${ruta}`);

    GetOpcionesMenu = (rol : any) : Observable<any> => this.http.get(`${this.rutaPlasticaribeAPI}/Vistas_Permisos/get_opciones_menu/${rol}`);

    GetCategoriasMenu = (rol : any) : Observable<any> => this.http.get(`${this.rutaPlasticaribeAPI}/Vistas_Permisos/get_categorias_menu/${rol}`);

    Get_Vistas_Rol = (rol : any, categoria : string) : Observable<any> => this.http.get(`${this.rutaPlasticaribeAPI}/Vistas_Permisos/get_vistas_rol/${rol}/${categoria}`);

    Get_By_Rol = (rol : any) : Observable<any> => this.http.get(`${this.rutaPlasticaribeAPI}/Vistas_Permisos/get_By_Rol/${rol}`);

    Post = (data : modelVistasPermisos) : Observable<any> => this.http.post(`${this.rutaPlasticaribeAPI}/Vistas_Permisos`, data);

    Put = (id : any, data : modelVistasPermisos) : Observable<any> => this.http.put(`${this.rutaPlasticaribeAPI}/Vistas_Permisos/${id}`, data);

    Delete = (id : any) : Observable<any> => this.http.delete(`${this.rutaPlasticaribeAPI}/Vistas_Permisos/${id}`);
}
