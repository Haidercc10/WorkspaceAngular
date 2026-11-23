import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, shareReplay, tap } from 'rxjs';

/** Municipio de Colombia según el DANE (datos abiertos de datos.gov.co). */
export interface MunicipioColombia {
  departamento: string;
  municipio: string;
  codigoDane: string;
}

/** Dataset oficial del DANE: departamentos y municipios de Colombia (sin clave, gratuito). */
const URL_MUNICIPIOS = 'https://www.datos.gov.co/resource/8xzg-cn6x.json';
const CLAVE_CACHE = 'municipios-colombia-v1';
const VIGENCIA_CACHE_MS = 7 * 24 * 60 * 60 * 1000; // 7 días: la división política casi no cambia

@Injectable({
  providedIn: 'root'
})

export class DepartamentosMunicipiosColombiaService {

  private municipios$?: Observable<MunicipioColombia[]>;

  constructor(private http : HttpClient) { }

  /** Respuesta completa del dataset (se conserva por compatibilidad). */
  getDepartamentos = () : Observable<any> => this.http.get<any>(URL_MUNICIPIOS);

  /**
   * Municipios con su departamento. Se descarga una sola vez por sesión (y se guarda 7 días en el navegador),
   * pidiendo solo las columnas necesarias. Si la API no responde, devuelve una lista vacía.
   */
  getMunicipios() : Observable<MunicipioColombia[]> {
    if (!this.municipios$) {
      const enCache = this.leerCache();
      this.municipios$ = (enCache ? of(enCache) : this.http.get<any[]>(URL_MUNICIPIOS, {
        params: { '$select': 'departamento,municipio,c_digo_dane_del_municipio', '$limit': '2000' }
      }).pipe(
        map(filas => (filas ?? []).map(f => ({
          departamento: f.departamento ?? '',
          municipio: f.municipio ?? '',
          codigoDane: f.c_digo_dane_del_municipio ?? '',
        }) as MunicipioColombia)),
        tap(lista => this.guardarCache(lista)),
        catchError(() => {
          this.municipios$ = undefined; // se reintenta la próxima vez
          return of([] as MunicipioColombia[]);
        }),
      )).pipe(shareReplay(1));
    }
    return this.municipios$;
  }

  private leerCache() : MunicipioColombia[] | null {
    try {
      const guardado = JSON.parse(localStorage.getItem(CLAVE_CACHE) ?? 'null');
      if (guardado && Date.now() - guardado.fecha < VIGENCIA_CACHE_MS && Array.isArray(guardado.lista) && guardado.lista.length) return guardado.lista;
    } catch { }
    return null;
  }

  private guardarCache(lista : MunicipioColombia[]) {
    if (!lista.length) return;
    try { localStorage.setItem(CLAVE_CACHE, JSON.stringify({ fecha: Date.now(), lista })); } catch { }
  }
}
