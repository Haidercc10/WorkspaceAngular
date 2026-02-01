import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InventarioSnapshotService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http: HttpClient,) { }

  getInventoriesSnapshot = () => this.http.get<any>(this.rutaPlasticaribeAPI + `/InventarioSnapshot/getInventoriesSnapshot`);
}
