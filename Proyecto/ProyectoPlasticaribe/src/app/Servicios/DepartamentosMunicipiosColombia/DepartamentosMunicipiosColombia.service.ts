import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, shareReplay, tap } from 'rxjs';

/** Municipio de Colombia según el DANE (datos abiertos de datos.gov.co). */
export interface MunicipioColombia {
  departamento: string;
  municipio: string;
  codigoDane: string;
}

/**
 * DIVIPOLA del DANE en datos.gov.co (1.122 municipios; sin clave, gratuito). Campos: dpto, nom_mpio, cod_mpio.
 * El dataset anterior (8xzg-cn6x) fue retirado y responde "dataset.missing".
 */
const URL_MUNICIPIOS = 'https://www.datos.gov.co/resource/gdxc-w37w.json';
const CLAVE_CACHE = 'municipios-colombia-v2';
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
        params: { '$select': 'dpto,nom_mpio,cod_mpio', '$limit': '2000' }
      }).pipe(
        map(filas => (Array.isArray(filas) ? filas : []).map(f => ({
          departamento: f.dpto ?? '',
          municipio: f.nom_mpio ?? '',
          codigoDane: f.cod_mpio ?? '',
        }) as MunicipioColombia).filter(m => m.departamento && m.municipio)),
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
