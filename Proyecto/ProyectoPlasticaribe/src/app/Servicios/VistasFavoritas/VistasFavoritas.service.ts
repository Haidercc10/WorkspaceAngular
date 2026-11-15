import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, of, shareReplay, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

/** Vista que se puede usar como acceso rápido en la barra inferior. */
export interface VistaFavorita {
  id: number;
  nombre: string;
  icono: string;
  categoria: string;
  ruta: string;
}

/** Favoritos del usuario logueado, en el orden elegido, y el máximo que puede tener. */
export interface MisFavoritos {
  limite: number;
  favoritos: VistaFavorita[];
}

/**
 * Accesos rápidos (vistas favoritas) del usuario logueado.
 *
 * Además de las llamadas a la API, guarda el estado compartido entre la barra inferior (VistasFavoritasComponent)
 * y la estrella de la barra superior (menuLateral), para que ambas se actualicen juntas.
 * La API toma el usuario y el rol del token, por eso ningún método recibe el id del usuario.
 * Al cerrar sesión la app recarga la página, así que el estado no pasa de un usuario a otro.
 */
@Injectable({
  providedIn: 'root'
})
export class VistasFavoritasService {

  private readonly ruta = `${environment.rutaPlasticaribeAPI}/VistasFavoritas`;

  private readonly estado = new BehaviorSubject<MisFavoritos>({ limite: 7, favoritos: [] });
  /** Favoritos guardados y límite; emite el valor actual al suscribirse y cada vez que cambian. */
  readonly misFavoritos$ = this.estado.asObservable();

  private disponibles$?: Observable<VistaFavorita[]>;

  constructor(private http : HttpClient) { }

  /** Último estado conocido (sin suscribirse). */
  get actual(): MisFavoritos {
    return this.estado.value;
  }

  /** Pide a la API los favoritos del usuario y actualiza el estado compartido. */
  cargar = () : Observable<MisFavoritos> =>
    this.http.get<MisFavoritos>(`${this.ruta}/mias`).pipe(tap(data => this.publicar(data)));

  /** Reemplaza los favoritos por los ids recibidos (en ese orden) y actualiza el estado compartido. */
  guardar = (ids : number[]) : Observable<MisFavoritos> =>
    this.http.put<MisFavoritos>(`${this.ruta}/mias`, ids).pipe(tap(data => this.publicar(data)));

  /**
   * Vistas que el rol del usuario puede elegir como favoritas. Se piden una sola vez por sesión;
   * si la petición falla, la siguiente llamada vuelve a intentarlo.
   */
  disponibles() : Observable<VistaFavorita[]> {
    this.disponibles$ ??= this.http.get<VistaFavorita[]>(`${this.ruta}/disponibles`).pipe(
      catchError(err => {
        this.disponibles$ = undefined;
        throw err;
      }),
      shareReplay(1),
    );
    return this.disponibles$;
  }

  /** Igual que `disponibles()` pero sin errores: si falla devuelve una lista vacía (para usos no críticos). */
  disponiblesSinError = () : Observable<VistaFavorita[]> => this.disponibles().pipe(catchError(() => of([])));

  /**
   * Vista que corresponde a una URL. Acepta subrutas (p. ej. "/inventario-areas/materiales" → "/inventario-areas")
   * y, si varias coinciden, toma la ruta más larga.
   */
  static vistaDeUrl(url : string, vistas : VistaFavorita[]) : VistaFavorita | null {
    const ruta = VistasFavoritasService.normalizarRuta(url);
    let mejor : VistaFavorita | null = null;
    for (const vista of vistas) {
      const rutaVista = VistasFavoritasService.normalizarRuta(vista.ruta);
      if (rutaVista === '/' || !(ruta === rutaVista || ruta.startsWith(`${rutaVista}/`))) continue;
      if (!mejor || rutaVista.length > VistasFavoritasService.normalizarRuta(mejor.ruta).length) mejor = vista;
    }
    return mejor;
  }

  /** Quita query string y fragmento, asegura "/" inicial y quita "/" final. */
  static normalizarRuta(url : string) : string {
    const ruta = (url ?? '').split(/[?#]/)[0].trim().toLowerCase();
    const conBarra = ruta.startsWith('/') ? ruta : `/${ruta}`;
    return conBarra.length > 1 ? conBarra.replace(/\/+$/, '') : conBarra;
  }

  private publicar(data : MisFavoritos) {
    this.estado.next({ limite: data?.limite ?? this.actual.limite, favoritos: data?.favoritos ?? [] });
  }
}
