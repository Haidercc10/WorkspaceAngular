import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import moment from 'moment';
import { Observable, Subject, catchError, map, of, shareReplay, switchMap, take, tap } from 'rxjs';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import { environment } from 'src/environments/environment';

/**
 * Quién ve un evento. Se guarda en EventoCal_Visibilidad como "|token|token|":
 *  - yo:    "|Solo Yo|"   solo el creador
 *  - rol:   "|<mi rol>|"  el rol de quien lo crea
 *  - roles: "|5|12|"      roles específicos (solo administradores)
 *  - todos: "|Todos|"     todos los roles, incluidos los que se creen después (solo administradores)
 */
export type TipoVisibilidad = 'yo' | 'rol' | 'roles' | 'todos';

export const TOKEN_SOLO_YO = 'Solo Yo';
export const TOKEN_TODOS = 'Todos';

export interface RolCalendario { id: number; nombre: string; }

export interface EventoCalendario {
  id: number;
  nombre: string;
  descripcion: string;
  inicio: Date;
  fin: Date;
  todoElDia: boolean;
  tipoVisibilidad: TipoVisibilidad;
  roles: number[];            // solo cuando tipoVisibilidad = 'roles' o 'rol'
  usuarioId: number;
  creador: string;
  esPropio: boolean;
  puedeEditar: boolean;       // creador o administrador
}

export interface EventoCalendarioGuardar {
  nombre: string;
  descripcion: string;
  inicio: Date;
  fin: Date;
  todoElDia: boolean;
  tipoVisibilidad: TipoVisibilidad;
  roles: number[];
}

interface EventoCalendarioApi {
  id: number; nombre: string; descripcion: string;
  fechaInicial: string; horaInicial: string; fechaFinal: string; horaFinal: string;
  visibilidad: string; usuarioId: number; creador: string; esPropio: boolean; puedeEditar: boolean;
}

/** Clase CSS del evento según quién lo ve (colores en Calendario.component.css y ListaEventos.component.css). */
export function claseVisibilidad(evento: EventoCalendario): string {
  switch (evento.tipoVisibilidad) {
    case 'yo': return 'evento-yo';
    case 'todos': return 'evento-todos';
    default: return 'evento-rol';
  }
}

export const nombreVisibilidad: Record<TipoVisibilidad, string> = {
  yo: 'Solo yo',
  rol: 'Mi rol',
  roles: 'Roles específicos',
  todos: 'Todos',
};

const fechaApi = (fecha: Date) => moment(fecha).format('YYYY-MM-DD');

@Injectable({
  providedIn: 'root'
})
export class EventosCalendarioService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
  private readonly ruta = `${this.rutaPlasticaribeAPI}/EventosCalendarios`;

  /** Emite cada vez que se crea, edita o elimina un evento (la barra superior refresca su contador). */
  private readonly cambios = new Subject<void>();
  readonly cambios$ = this.cambios.asObservable();

  /** Roles para la visibilidad "Roles específicos" (se consultan una sola vez). */
  readonly roles$: Observable<RolCalendario[]> = this.rolesService.srvObtenerLista().pipe(
    map((datos: any[]) => datos.map(r => ({ id: Number(r.rolUsu_Id), nombre: r.rolUsu_Nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre))),
    catchError(() => of([])),
    shareReplay(1),
  );

  constructor(private http: HttpClient, private rolesService: RolesService) { }

  /** Eventos visibles que se cruzan con el rango (ambas fechas inclusive). */
  getRango(inicio: Date, fin: Date, miRol: number): Observable<EventoCalendario[]> {
    const params = new HttpParams().set('fechaInicio', fechaApi(inicio)).set('fechaFin', fechaApi(fin));
    return this.roles$.pipe(take(1), switchMap(roles =>
      this.http.get<EventoCalendarioApi[]>(`${this.ruta}/rango`, { params }).pipe(map(lista => lista.map(e => this.mapear(e, miRol, roles.length))))));
  }

  /** Eventos que ocurren hoy (incluye los de varios días que empezaron antes). */
  getHoy(miRol: number): Observable<EventoCalendario[]> {
    return this.roles$.pipe(take(1), switchMap(roles =>
      this.http.get<EventoCalendarioApi[]>(`${this.ruta}/hoy`).pipe(map(lista => lista.map(e => this.mapear(e, miRol, roles.length))))));
  }

  crear = (datos: EventoCalendarioGuardar, miRol: number): Observable<unknown> =>
    this.http.post(this.ruta, this.aPeticion(datos, miRol)).pipe(tap(() => this.cambios.next()));

  editar = (id: number, datos: EventoCalendarioGuardar, miRol: number): Observable<unknown> =>
    this.http.put(`${this.ruta}/${id}`, this.aPeticion(datos, miRol)).pipe(tap(() => this.cambios.next()));

  eliminar = (id: number): Observable<unknown> =>
    this.http.delete(`${this.ruta}/${id}`).pipe(tap(() => this.cambios.next()));

  private aPeticion(datos: EventoCalendarioGuardar, miRol: number) {
    const visibilidad = datos.tipoVisibilidad == 'yo' ? `|${TOKEN_SOLO_YO}|`
      : datos.tipoVisibilidad == 'todos' ? `|${TOKEN_TODOS}|`
      : datos.tipoVisibilidad == 'rol' ? `|${miRol}|`
      : `|${datos.roles.join('|')}|`;
    return {
      nombre: datos.nombre.trim(),
      descripcion: (datos.descripcion ?? '').trim(),
      fechaInicial: fechaApi(datos.inicio),
      horaInicial: datos.todoElDia ? '00:00:00' : moment(datos.inicio).format('HH:mm:00'),
      fechaFinal: fechaApi(datos.fin),
      horaFinal: datos.todoElDia ? '23:59:59' : moment(datos.fin).format('HH:mm:00'),
      visibilidad,
    };
  }

  private mapear(e: EventoCalendarioApi, miRol: number, totalRoles: number): EventoCalendario {
    const horaInicial = moment(e.horaInicial, ['HH:mm:ss', 'H:mm:ss']).format('HH:mm:ss');
    const horaFinal = moment(e.horaFinal, ['HH:mm:ss', 'H:mm:ss']).format('HH:mm:ss');
    // Todo el día: 00:00:00 a 23:59:59. Los creados antes con clic en un día quedaron de 00:00:00 a 00:00:00.
    const todoElDia = horaInicial == '00:00:00' && (horaFinal == '23:59:59' || horaFinal == '00:00:00');
    const tokens = (e.visibilidad ?? '').split('|').map(t => t.trim()).filter(t => t != '');

    let tipoVisibilidad: TipoVisibilidad;
    let roles: number[] = [];
    if (tokens.includes(TOKEN_SOLO_YO)) tipoVisibilidad = 'yo';
    else if (tokens.includes(TOKEN_TODOS)) tipoVisibilidad = 'todos';
    else {
      roles = tokens.map(Number).filter(n => !isNaN(n));
      // Los eventos antiguos "para todos" guardaron la lista completa de roles de ese momento
      if (totalRoles > 0 && roles.length >= totalRoles) tipoVisibilidad = 'todos';
      else if (roles.length == 1 && roles[0] == miRol) tipoVisibilidad = 'rol';
      else tipoVisibilidad = 'roles';
    }

    return {
      id: e.id,
      nombre: e.nombre,
      descripcion: e.descripcion ?? '',
      inicio: moment(`${e.fechaInicial} ${horaInicial}`, 'YYYY-MM-DD HH:mm:ss').toDate(),
      fin: moment(`${e.fechaFinal} ${todoElDia ? '23:59:59' : horaFinal}`, 'YYYY-MM-DD HH:mm:ss').toDate(),
      todoElDia,
      tipoVisibilidad,
      roles,
      usuarioId: e.usuarioId,
      creador: e.creador ?? '',
      esPropio: e.esPropio,
      puedeEditar: e.puedeEditar,
    };
  }
}
