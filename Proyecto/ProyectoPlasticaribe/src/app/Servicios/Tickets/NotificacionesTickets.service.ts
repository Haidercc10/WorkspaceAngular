import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, exhaustMap, filter, fromEvent, merge, of, tap, timer } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AvisoEsquina, AvisosEsquinaService } from '../AvisosEsquina/AvisosEsquina.service';
import { EstadoTicket } from './Tickets.service';

/** Qué pasó en el ticket (igual que TipoNotificacionTicket del API). */
export enum TipoNotificacionTicket {
  NUEVO = 1,
  CAMBIO_ESTADO = 2,
  COMENTARIO = 3,
}

/** Novedad sin leer de un ticket (GET Tickets/notificaciones). */
export interface NotificacionTicket {
  id: number;
  ticketId: number;
  asunto: string;
  tipo: TipoNotificacionTicket;
  /** Estado al que pasó (cambio de estado) o el estado actual del ticket. */
  estadoId: number;
  estado: string;
  autor: string;
  /** Comentario del movimiento (o descripción del ticket nuevo), recortado por el API. */
  comentario: string;
  fecha: string;
  /** Ticket propio (se abre en Mis tickets) o atendido como soporte (se abre en Gestionar tickets). */
  esMio: boolean;
}

export interface NovedadesTickets {
  total: number;
  notificaciones: NotificacionTicket[];
}

/** Título de la novedad (aviso de la esquina y panel de la barra superior). */
export function tituloNovedadTicket(n: NotificacionTicket): string {
  switch (n.tipo) {
    case TipoNotificacionTicket.NUEVO: return n.esMio ? `Ticket #${n.ticketId} registrado a su nombre` : `Nuevo ticket #${n.ticketId}`;
    case TipoNotificacionTicket.CAMBIO_ESTADO: return `Ticket #${n.ticketId} pasó a ${n.estado}`;
    default: return `Nuevo comentario en el ticket #${n.ticketId}`;
  }
}

/** Quién hizo el movimiento y su comentario (en un ticket nuevo, quién lo reportó o registró). */
export function autorNovedadTicket(n: NotificacionTicket): string {
  if (n.tipo === TipoNotificacionTicket.NUEVO) return `${n.esMio ? 'Registrado por' : 'Reportado por'} ${n.autor}`;
  const comentario = n.comentario?.trim();
  return comentario ? `${n.autor}: ${comentario}` : n.autor;
}

/** Última novedad de cada ticket (la más reciente primero) con cuántas tiene en total. */
export function ultimaNovedadPorTicket(notificaciones: NotificacionTicket[]): { novedad: NotificacionTicket; cantidad: number }[] {
  const porTicket = new Map<number, { novedad: NotificacionTicket; cantidad: number }>();
  for (const n of notificaciones) porTicket.set(n.ticketId, { novedad: n, cantidad: (porTicket.get(n.ticketId)?.cantidad ?? 0) + 1 });
  return [...porTicket.values()].sort((a, b) => b.novedad.id - a.novedad.id);
}

/** Cada cuánto se consultan las novedades (solo con la pestaña visible). */
const INTERVALO_CONSULTA_MS = 60 * 1000;
/** Con más tickets con novedades que este número sale un solo aviso de resumen en lugar de uno por ticket. */
const MAX_AVISOS_POR_TICKET = 3;
/** Prefijo de los avisos de tickets en AvisosEsquinaService. */
const PREFIJO_AVISO = 'ticket:';
const ID_AVISO_RESUMEN = `${PREFIJO_AVISO}resumen`;
/**
 * Por ticket, la última notificación ya mostrada en esta sesión (sessionStorage): no se repite el aviso al recargar,
 * pero las que sigan sin leer vuelven a salir al iniciar sesión de nuevo.
 */
const LLAVE_MOSTRADAS = 'avisosTicketsMostrados';

/**
 * Novedades de los tickets del usuario (cambios de estado, comentarios y, para soporte, tickets nuevos): las consulta
 * cada 60 s, las muestra como avisos de la esquina con "Ver ticket" y "Marcar como leído", y lleva el total sin leer
 * para el contador de la barra superior. Quién recibe cada novedad lo decide el API.
 */
@Injectable({ providedIn: 'root' })
export class NotificacionesTicketsService {

  private readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly avisos = inject(AvisosEsquinaService);

  private readonly novedades = new BehaviorSubject<NovedadesTickets>({ total: 0, notificaciones: [] });
  /** Últimas novedades sin leer conocidas (alimenta el contador de la barra superior). */
  readonly novedades$ = this.novedades.asObservable();

  private iniciado = false;

  getNotificaciones = (): Observable<NovedadesTickets> =>
    this.http.get<NovedadesTickets>(`${this.rutaPlasticaribeAPI}/Tickets/notificaciones`);

  /** Marca como leídas las notificaciones de un ticket, o todas si no se indica. */
  postLeidas = (ticketId?: number): Observable<void> =>
    this.http.post<void>(`${this.rutaPlasticaribeAPI}/Tickets/notificaciones/leidas`, null,
      { params: ticketId != null ? new HttpParams().set('ticketId', ticketId) : undefined });

  /**
   * Empieza a consultar las novedades: al iniciar, cada INTERVALO_CONSULTA_MS y al volver a la pestaña, solo con la
   * pestaña visible. Lo llama la barra superior (existe mientras hay sesión); se detiene al destruirse.
   */
  iniciar(destroyRef: DestroyRef) {
    if (this.iniciado) return;
    this.iniciado = true;
    destroyRef.onDestroy(() => {
      this.iniciado = false;
      this.avisos.quitarSi(a => a.id.startsWith(PREFIJO_AVISO));
      this.novedades.next({ total: 0, notificaciones: [] });
    });

    merge(timer(0, INTERVALO_CONSULTA_MS), fromEvent(this.document, 'visibilitychange')).pipe(
      filter(() => this.document.visibilityState === 'visible'),
      exhaustMap(() => this.getNotificaciones().pipe(catchError(() => of(null)))),
      takeUntilDestroyed(destroyRef),
    ).subscribe(novedades => { if (novedades) this.actualizar(novedades); });
  }

  /** Vuelve a consultar ya (p. ej. después de marcar como leído). */
  refrescar() {
    this.getNotificaciones().pipe(catchError(() => of(null))).subscribe(n => { if (n) this.actualizar(n); });
  }

  /**
   * Marca como leídas las novedades de un ticket (al abrirlo o con "Marcar como leído") y quita su aviso. Siempre
   * llama al API: puede haber una novedad que la consulta periódica aún no trajo.
   */
  marcarLeidas(ticketId: number) {
    const actual = this.novedades.value;
    this.avisos.quitar(PREFIJO_AVISO + ticketId);
    const restantes = actual.notificaciones.filter(n => n.ticketId !== ticketId);
    this.novedades.next({ total: Math.max(0, actual.total - (actual.notificaciones.length - restantes.length)), notificaciones: restantes });
    this.mostrarAvisos(restantes);
    this.postLeidas(ticketId).pipe(catchError(() => of(null))).subscribe(() => this.refrescar());
  }

  /** "Marcar todo como leído" del aviso de resumen. */
  marcarTodasLeidas() {
    this.avisos.quitarSi(a => a.id.startsWith(PREFIJO_AVISO));
    this.novedades.next({ total: 0, notificaciones: [] });
    this.postLeidas().pipe(catchError(() => of(null))).subscribe(() => this.refrescar());
  }

  /** Abre el ticket en Mis tickets (propio) o en Gestionar tickets (soporte); el detalle lo marca como leído. */
  verTicket(ticketId: number, esMio: boolean) {
    this.avisos.quitar(PREFIJO_AVISO + ticketId);
    this.router.navigate([esMio ? '/Tickets' : '/Gestion-Tickets'],
      { queryParams: esMio ? { pestana: 'mis-tickets', ticket: ticketId } : { ticket: ticketId } });
  }

  // ---------------------------------------------------------------- avisos

  private actualizar(novedades: NovedadesTickets) {
    this.novedades.next(novedades);
    this.mostrarAvisos(novedades.notificaciones);
  }

  /**
   * Un aviso por ticket con novedades (el último movimiento y cuántos más hay), o uno de resumen si son más de
   * MAX_AVISOS_POR_TICKET tickets. Solo sale lo que no se mostró en esta sesión; los avisos de tickets que ya se
   * leyeron (aquí o en otra pestaña) se quitan.
   */
  private mostrarAvisos(notificaciones: NotificacionTicket[]) {
    const porTicket = new Map<number, NotificacionTicket[]>();
    for (const n of notificaciones) porTicket.set(n.ticketId, [...(porTicket.get(n.ticketId) ?? []), n]);

    // Avisos de tickets que ya no tienen novedades sin leer
    this.avisos.quitarSi(a => a.id.startsWith(PREFIJO_AVISO) && a.id !== ID_AVISO_RESUMEN && !porTicket.has(Number(a.id.slice(PREFIJO_AVISO.length))));
    if (porTicket.size === 0) return this.avisos.quitar(ID_AVISO_RESUMEN);

    const mostradas = this.leerMostradas();
    const nuevas = [...porTicket.entries()].filter(([ticketId, lista]) => lista[lista.length - 1].id > (mostradas[ticketId] ?? 0));
    if (!nuevas.length) return;
    nuevas.forEach(([ticketId, lista]) => mostradas[ticketId] = lista[lista.length - 1].id);
    this.guardarMostradas(mostradas, porTicket);

    if (porTicket.size > MAX_AVISOS_POR_TICKET) {
      this.avisos.quitarSi(a => a.id.startsWith(PREFIJO_AVISO) && a.id !== ID_AVISO_RESUMEN);
      this.avisos.mostrar(this.avisoResumen(notificaciones.length, porTicket));
      return;
    }
    this.avisos.quitar(ID_AVISO_RESUMEN);
    nuevas.forEach(([, lista]) => this.avisos.mostrar(this.avisoTicket(lista)));
  }

  private avisoTicket(lista: NotificacionTicket[]): AvisoEsquina {
    const n = lista[lista.length - 1];
    const titulo = tituloNovedadTicket(n);
    let detalle = `${n.asunto}\n${autorNovedadTicket(n)}`;
    const mas = lista.length - 1;
    if (mas > 0) detalle += `\n(y ${mas} ${mas === 1 ? 'novedad más' : 'novedades más'})`;

    return {
      id: PREFIJO_AVISO + n.ticketId,
      severidad: this.severidad(n),
      icono: 'pi pi-ticket',
      titulo,
      detalle,
      acciones: [
        { etiqueta: 'Ver ticket', icono: 'pi pi-eye', accion: () => this.verTicket(n.ticketId, n.esMio) },
        { etiqueta: 'Marcar como leído', icono: 'pi pi-check', accion: () => this.marcarLeidas(n.ticketId) },
      ],
    };
  }

  private avisoResumen(total: number, porTicket: Map<number, NotificacionTicket[]>): AvisoEsquina {
    const todasMias = [...porTicket.values()].every(l => l[l.length - 1].esMio);
    return {
      id: ID_AVISO_RESUMEN,
      severidad: 'info',
      icono: 'pi pi-ticket',
      titulo: `Tiene ${total} novedades en ${porTicket.size} tickets`,
      detalle: todasMias ? 'Revíselas en Mis tickets.' : 'Revíselas en Gestionar tickets o en Mis tickets.',
      acciones: [
        {
          etiqueta: 'Ver tickets', icono: 'pi pi-eye', accion: () => {
            this.avisos.quitar(ID_AVISO_RESUMEN);
            this.router.navigate([todasMias ? '/Tickets' : '/Gestion-Tickets'], { queryParams: todasMias ? { pestana: 'mis-tickets' } : {} });
          }
        },
        { etiqueta: 'Marcar todo como leído', icono: 'pi pi-check', accion: () => this.marcarTodasLeidas() },
      ],
    };
  }

  /** Resuelto en verde, cancelado en amarillo; comentarios, tickets nuevos y "en revisión" en azul. */
  private severidad(n: NotificacionTicket): AvisoEsquina['severidad'] {
    if (n.tipo !== TipoNotificacionTicket.CAMBIO_ESTADO) return 'info';
    if (n.estadoId === EstadoTicket.RESUELTO) return 'success';
    if (n.estadoId === EstadoTicket.CANCELADO) return 'warn';
    return 'info';
  }

  private leerMostradas(): Record<number, number> {
    try { return JSON.parse(sessionStorage.getItem(LLAVE_MOSTRADAS) || '{}') ?? {}; } catch { return {}; }
  }

  /** Guarda el registro sin los tickets que ya no tienen novedades. */
  private guardarMostradas(mostradas: Record<number, number>, vigentes: Map<number, unknown>) {
    const limpio: Record<number, number> = {};
    for (const id of vigentes.keys()) if (mostradas[id] != null) limpio[id] = mostradas[id];
    try { sessionStorage.setItem(LLAVE_MOSTRADAS, JSON.stringify(limpio)); } catch { }
  }
}
