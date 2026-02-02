import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TomaFisicaInventario } from 'src/app/Vistas/TomaFisicaInventario/TomaFisicaInventario.component';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TomaFisicaInventarioService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
    
    constructor(private http : HttpClient,) { }

    Post = (data : TomaFisicaInventario) => this.http.post<any>(this.rutaPlasticaribeAPI + '/Toma_Fisica_Inventario', data);

    getPhysicalInventory = (roll : number, process : string[]) => this.http.post<any>(this.rutaPlasticaribeAPI + `/Toma_Fisica_Inventario/getPhysicalInventory/${roll}`, process);

    getPhysicalCountForItem = (item : number, unit : string) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Toma_Fisica_Inventario/getPhysicalCountForItem/${item}/${unit}`);

    getMovPhysicalCount = (inventory : number, url? : string) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Toma_Fisica_Inventario/getMovPhysicalCount/${inventory}${url}`);

  }
