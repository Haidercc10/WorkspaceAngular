import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { claseEstadoTicket, EstadoTicket, TicketDetalle, TicketsService } from 'src/app/Servicios/Tickets/Tickets.service';
import { TutorialesService } from 'src/app/Servicios/Tutoriales/Tutoriales.service';
import { ClavesTutorialTickets, pasosTutorialDetalleTicket } from 'src/app/Tutoriales/Tutoriales_Tickets';
import { AppComponent } from 'src/app/app.component';

interface AccionEstado { estadoId: number; etiqueta: string; icono: string; clase: string; requiereComentario: boolean; }

/**
 * Detalle de un ticket: información, imágenes, historial, comentarios y acciones de estado.
 * Con `modoSoporte` muestra las acciones de soporte; sin él, solo las del creador (comentar / cancelar si está abierto).
 */
@Component({
  selector: 'app-detalle-ticket',
  templateUrl: './Detalle_Ticket.component.html',
  styleUrls: ['./Detalle_Ticket.component.css']
})
export class Detalle_TicketComponent implements OnChanges {

  @Input() codigo : number | null = null;
  @Input() modoSoporte : boolean = false;
  /** Se emite cuando el ticket cambió (estado o comentario) para que la vista padre recargue su lista. */
  @Output() actualizado = new EventEmitter<void>();

  readonly EstadoTicket = EstadoTicket;
  detalle : TicketDetalle | null = null;
  imagenes : { nombre: string, src: string }[] = [];
  /** Imágenes cuya descarga aún no termina (con éxito o error). */
  imagenesPendientes : number = 0;
  /** Imágenes que no se pudieron cargar (no están en la carpeta, error o tiempo agotado). */
  imagenesFallidas : number = 0;
  private subImagenes? : Subscription;
  private static readonly TiempoMaximoImagenMs = 15000;
  comentario : string = '';
  cargando : boolean = false;
  enviando : boolean = false;

  constructor(private ticketService : TicketsService,
                private msj : MensajesAplicacionService,
                  private tutoriales : TutorialesService,
                    private AppComponent : AppComponent) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['codigo'] || changes['modoSoporte']) this.cargar();
  }

  trackAccion = (_ : number, accion : AccionEstado) => `${accion.estadoId}-${accion.etiqueta}`;

  /**
   * Acciones de estado disponibles. Se calculan una sola vez al cargar el detalle (no en un getter):
   * un getter que devuelve un arreglo nuevo hace que *ngFor destruya y recree los botones en cada
   * ciclo de detección de cambios, y el clic nunca llega a completarse.
   */
  acciones : AccionEstado[] = [];

  /** Acciones según el estado actual y el rol. Debe coincidir con la validación de la API. */
  private calcularAcciones() : AccionEstado[] {
    const estado = this.detalle?.ticket.estadoId;
    if (estado == null) return [];
    const enRevision : AccionEstado = { estadoId: EstadoTicket.EN_REVISION, etiqueta: 'Tomar ticket', icono: 'pi pi-wrench', clase: 'p-button-info', requiereComentario: false };
    const resolver : AccionEstado = { estadoId: EstadoTicket.RESUELTO, etiqueta: 'Marcar como resuelto', icono: 'pi pi-check', clase: 'p-button-success', requiereComentario: true };
    const cancelar : AccionEstado = { estadoId: EstadoTicket.CANCELADO, etiqueta: 'Cancelar ticket', icono: 'pi pi-times', clase: 'p-button-danger', requiereComentario: true };
    const reabrir : AccionEstado = { estadoId: EstadoTicket.EN_REVISION, etiqueta: 'Reabrir', icono: 'pi pi-replay', clase: 'p-button-warning', requiereComentario: true };

    if (!this.modoSoporte) return estado === EstadoTicket.ABIERTO ? [{ ...cancelar, requiereComentario: false }] : [];
    if (estado === EstadoTicket.ABIERTO) return [enRevision, resolver, cancelar];
    if (estado === EstadoTicket.EN_REVISION) return [resolver, cancelar];
    return [reabrir];
  }

  cargar() {
    this.detalle = null;
    this.acciones = [];
    this.imagenes = [];
    this.subImagenes?.unsubscribe(); // evita que imágenes de una carga anterior lleguen al ticket nuevo
    this.imagenesPendientes = 0;
    this.imagenesFallidas = 0;
    this.comentario = '';
    if (this.codigo == null) return;

    this.cargando = true;
    this.ticketService.getDetalle(this.codigo).subscribe({
      next: detalle => {
        this.detalle = detalle;
        this.acciones = this.calcularAcciones();
        this.cargando = false;
        this.cargarImagenes();
        const clave = this.modoSoporte ? ClavesTutorialTickets.DETALLE_SOPORTE : ClavesTutorialTickets.DETALLE;
        this.tutoriales.iniciarPrimeraVez(clave, this.AppComponent.storage_Id, () => this.pasosTutorial());
      },
      error: (error : HttpErrorResponse) => {
        this.cargando = false;
        this.msj.mensajeError('¡No se pudo cargar el ticket!', this.mensajeApi(error));
      }
    });
  }

  /**
   * Descarga las imágenes del ticket. Las que no existan en el servidor (404), fallen o tarden más de
   * `TiempoMaximoImagenMs` se cuentan en `imagenesFallidas` para mostrar el aviso en lugar de "Cargando...".
   */
  private cargarImagenes() {
    const adjuntos = this.detalle?.adjuntos ?? [];
    if (!adjuntos.length) return;
    this.imagenesPendientes = adjuntos.length;
    this.subImagenes = forkJoin(adjuntos.map(a => this.ticketService.getAdjunto(a.url).pipe(
      timeout(Detalle_TicketComponent.TiempoMaximoImagenMs),
      catchError(() => of(null))
    ))).subscribe(blobs => {
      blobs.forEach((blob, i) => {
        if (!blob) return this.imagenTerminada(false);
        const lector = new FileReader();
        lector.onload = () => {
          this.imagenes = [...this.imagenes, { nombre: adjuntos[i].nombre, src: lector.result as string }];
          this.imagenTerminada(true);
        };
        lector.onerror = () => this.imagenTerminada(false);
        lector.readAsDataURL(blob);
      });
    });
  }

  private imagenTerminada(exito : boolean) {
    this.imagenesPendientes--;
    if (!exito) this.imagenesFallidas++;
  }

  cambiarEstado(accion : AccionEstado) {
    if (!this.detalle || this.enviando) return;
    const comentario = this.comentario.trim();
    if (accion.requiereComentario && !comentario) {
      this.msj.mensajeAdvertencia('¡Falta el comentario!', accion.estadoId === EstadoTicket.RESUELTO
        ? 'Escriba la solución que se aplicó antes de marcar el ticket como resuelto.'
        : 'Escriba el motivo de este cambio de estado.');
      return;
    }
    this.enviando = true;
    this.ticketService.cambiarEstado(this.detalle.ticket.codigo, accion.estadoId, comentario).subscribe({
      next: () => {
        this.enviando = false;
        this.msj.mensajeConfirmacion(`¡Éxito!`, `¡Ticket #${this.detalle!.ticket.codigo} actualizado!`);
        this.actualizado.emit();
        this.cargar();
      },
      error: (error : HttpErrorResponse) => {
        this.enviando = false;
        this.msj.mensajeError('¡No se pudo cambiar el estado!', this.mensajeApi(error));
      }
    });
  }

  comentar() {
    if (!this.detalle || this.enviando) return;
    const comentario = this.comentario.trim();
    if (!comentario) {
      this.msj.mensajeAdvertencia('¡Falta el comentario!', 'Escriba un comentario antes de enviarlo.');
      return;
    }
    this.enviando = true;
    this.ticketService.comentar(this.detalle.ticket.codigo, comentario).subscribe({
      next: () => {
        this.enviando = false;
        this.msj.mensajeConfirmacion(`¡Éxito!`, `Comentario agregado al ticket #${this.detalle!.ticket.codigo}.`);
        this.actualizado.emit();
        this.cargar();
      },
      error: (error : HttpErrorResponse) => {
        this.enviando = false;
        this.msj.mensajeError('¡No se pudo enviar el comentario!', this.mensajeApi(error));
      }
    });
  }

  /** Tutorial del detalle; explica solo los botones que se ven en este momento (según rol y estado). */
  tutorial = () => { if (this.detalle && !this.cargando) this.tutoriales.iniciar(this.pasosTutorial()); };

  private pasosTutorial = () => pasosTutorialDetalleTicket({
    modoSoporte : this.modoSoporte,
    tieneImagenes : !!this.detalle?.adjuntos.length,
    acciones : this.acciones.map(a => a.etiqueta),
  });

  claseEstado = (estadoId : number | null) : string => claseEstadoTicket(estadoId);

  private mensajeApi = (error : HttpErrorResponse) : string => typeof error.error === 'string' && error.error ? error.error : `Error ${error.status}`;
}
