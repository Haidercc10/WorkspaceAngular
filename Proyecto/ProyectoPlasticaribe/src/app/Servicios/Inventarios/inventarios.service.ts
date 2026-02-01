import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InventariosService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
  
    constructor(private http : HttpClient,) { }

    getInventorySnapshot = (inventory : number) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Inventarios/getInventorySnapshot/${inventory}`);

    getInventorySnapshotForItem = (item : number, unit : string) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Inventarios/getInventorySnapshotForItem/${item}/${unit}`);
}
