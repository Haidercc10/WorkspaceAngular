import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FichaComplementariaItem } from 'src/app/Modelo/modelEmbobinado';
import { environment } from 'src/environments/environment';

/** Datos complementarios del item guardados en Plasticaribe (embobinado, código de barras, guías...). */
@Injectable({ providedIn: 'root' })
export class FichaComplementariaItemService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http: HttpClient) { }

  /** Consulta la ficha complementaria de un item (404 si no tiene). */
  obtener = (prodId: number): Observable<FichaComplementariaItem> =>
    this.http.get<FichaComplementariaItem>(`${this.rutaPlasticaribeAPI}/Ficha_Complementaria_Item/${prodId}`);

  /** Crea o actualiza la ficha complementaria de un item. */
  guardar = (prodId: number, ficha: FichaComplementariaItem): Observable<FichaComplementariaItem> =>
    this.http.put<FichaComplementariaItem>(`${this.rutaPlasticaribeAPI}/Ficha_Complementaria_Item/${prodId}`, ficha);
}
