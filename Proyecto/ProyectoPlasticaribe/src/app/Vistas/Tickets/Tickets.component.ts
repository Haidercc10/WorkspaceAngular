import { Component, DestroyRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Detalle_TicketComponent } from './Detalle_Ticket/Detalle_Ticket.component';
import { ActivatedRoute, Router } from '@angular/router';
import { TutorialesService } from 'src/app/Servicios/Tutoriales/Tutoriales.service';
import { MessageService } from 'primeng/api';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { claseEstadoTicket, rangoFechasTicketsPorDefecto, TicketListado, TicketsService } from 'src/app/Servicios/Tickets/Tickets.service';
import { AppComponent } from 'src/app/app.component';
import { ClavesTutorialTickets, pasosTutorialTickets } from 'src/app/Tutoriales/Tutoriales_Tickets';
import { alCambiarTema } from 'src/app/Servicios/Tema/Tema.service';
import { TicketCreado } from './Formulario_Ticket/Formulario_Ticket.component';

@Component({
  selector: 'app-Tickets',
  templateUrl: './Tickets.component.html',
  styleUrls: ['./Tickets.component.css']
})

export class TicketsComponent implements OnInit, OnDestroy {

  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  private readonly suscripcionTema = alCambiarTema(oscuro => this.modoSeleccionado = oscuro); // mantiene modoSeleccionado al día con el tema

  tabActiva : number = 0; // 0 = Nuevo ticket, 1 = Mis tickets

  misTickets : TicketListado[] = [];
  cargandoMisTickets : boolean = false;
  /** Rango de fechas de creación de "Mis tickets" (por defecto, el último año). */
  fechaInicio : Date = rangoFechasTicketsPorDefecto().inicio;
  fechaFin : Date = rangoFechasTicketsPorDefecto().fin;
  readonly hoy : Date = new Date();
  /** Índice de la primera fila visible del paginador; se pone en 0 al cambiar el filtro. */
  primeraFilaMisTickets : number = 0;
  esSoporte : boolean = false;
  codigoDetalle : number | null = null;
  detalleVisible : boolean = false;
  @ViewChild('detalleTicket') detalleTicket? : Detalle_TicketComponent;
  private readonly destroyRef = inject(DestroyRef);

  constructor(private AppComponent : AppComponent,
                private ticketService : TicketsService,
                  private msj : MensajesAplicacionService,
                    private messageService : MessageService,
                      private router : Router,
                        private route : ActivatedRoute,
                          private tutoriales : TutorialesService) { }

  ngOnInit() {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    // "VER MIS TICKETS" del aviso del botón flotante de soporte llega con ?pestana=mis-tickets; "Ver ticket" de los
    // avisos de novedades, además con ?ticket=<código>. Se escucha (no solo el snapshot) porque el aviso puede usarse
    // estando ya en esta página.
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(parametros => {
      const ticket = Number(parametros.get('ticket'));
      if (parametros.get('pestana') === 'mis-tickets' && (this.tabActiva !== 1 || ticket > 0)) this.cambioTab(1);
      if (ticket > 0) this.abrirTicketDesdeAviso(ticket);
    });
    this.ticketService.getPermisos().subscribe(p => {
      this.esSoporte = p.esSoporte;
      // Se espera a conocer el rol para que soporte vea también sus pasos extra
      this.tutoriales.iniciarPrimeraVez(ClavesTutorialTickets.TICKETS, this.AppComponent.storage_Id, () => this.pasosTutorial());
    });
  }

  ngOnDestroy() {
    this.messageService.clear('ticketCreado');
  }

  /** Mostrar tutorial escrito dentro del programa que especificará la funcionalidad de este módulo */
  tutorial = () => this.tutoriales.iniciar(this.pasosTutorial());

  private pasosTutorial = () => pasosTutorialTickets({
    esSoporte : this.esSoporte,
    irAPestana : indice => { if (this.tabActiva !== indice) this.cambioTab(indice); },
  });

  // ------------------------------------------------------------ crear ticket

  /** El formulario (app-formulario-ticket) ya creó el ticket y se limpió: aviso de éxito al centro. */
  alCrearTicket({ codigo, reportante } : TicketCreado) {
    this.messageService.clear('ticketCreado');
    this.messageService.add({
      key : 'ticketCreado',
      severity : 'success',
      summary : 'OK!',
      detail : `${reportante ? `¡Ticket #${codigo} creado a nombre de ${reportante}!` : `¡Ticket #${codigo} creado correctamente!`} Soporte lo revisará pronto. Puede seguir su estado en "Mis tickets".`,
      life : 8000,
    });
  }

  // ------------------------------------------------------------ mis tickets

  verMisTickets() {
    this.messageService.clear('ticketCreado');
    this.tabActiva = 1;
    this.consultarMisTickets();
  }

  cambioTab(indice : number) {
    this.tabActiva = indice;
    if (indice === 1) this.consultarMisTickets();
  }

  /**
   * Consulta los tickets propios del rango de fechas.
   * @param reiniciarPagina true cuando cambió el filtro; false al recargar tras comentar o cambiar un ticket.
   */
  consultarMisTickets(reiniciarPagina : boolean = false) {
    if (!this.fechaInicio || !this.fechaFin) {
      this.msj.mensajeAdvertencia('¡Faltan fechas!', 'Seleccione la fecha inicial y la fecha final.');
      return;
    }
    if (this.fechaInicio > this.fechaFin) {
      this.msj.mensajeAdvertencia('¡Rango inválido!', 'La fecha inicial no puede ser mayor que la fecha final.');
      return;
    }
    this.cargandoMisTickets = true;
    this.ticketService.getMisTickets(this.fechaInicio, this.fechaFin).subscribe({
      next: tickets => {
        this.misTickets = tickets;
        if (reiniciarPagina) this.primeraFilaMisTickets = 0;
        this.cargandoMisTickets = false;
      },
      error: () => { this.cargandoMisTickets = false; this.msj.mensajeError('¡No se pudieron consultar sus tickets!'); }
    });
  }

  /** Vuelve al rango por defecto (último año) y consulta. */
  limpiarFiltrosMisTickets() {
    const rango = rangoFechasTicketsPorDefecto();
    this.fechaInicio = rango.inicio;
    this.fechaFin = rango.fin;
    this.consultarMisTickets(true);
  }

  abrirDetalle(ticket : TicketListado) {
    this.codigoDetalle = ticket.codigo;
    this.detalleVisible = true;
  }

  /**
   * Abre (o recarga, si ya está abierto) el detalle del ticket del aviso de novedades y quita ?ticket de la URL,
   * para que al recargar no se vuelva a abrir y el mismo aviso funcione de nuevo.
   */
  private abrirTicketDesdeAviso(codigo : number) {
    if (this.detalleVisible && this.codigoDetalle === codigo) this.detalleTicket?.cargar();
    else {
      this.codigoDetalle = codigo;
      this.detalleVisible = true;
    }
    this.router.navigate([], { relativeTo: this.route, queryParams: { ticket: null }, queryParamsHandling: 'merge', replaceUrl: true });
  }

  cerrarDetalle = () => this.codigoDetalle = null;

  irAGestion = () => this.router.navigateByUrl('/Gestion-Tickets');

  claseEstado = (estadoId : number) => claseEstadoTicket(estadoId);
}
