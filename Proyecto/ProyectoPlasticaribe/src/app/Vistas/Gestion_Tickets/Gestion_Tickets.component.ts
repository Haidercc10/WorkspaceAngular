import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TutorialesService } from 'src/app/Servicios/Tutoriales/Tutoriales.service';
import moment from 'moment';
import { Table } from 'primeng/table';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { CantidadesTickets, claseEstadoTicket, rangoFechasTicketsPorDefecto, TicketListado, TicketsService } from 'src/app/Servicios/Tickets/Tickets.service';
import { AppComponent } from 'src/app/app.component';
import { ClavesTutorialTickets, pasosTutorialGestionTickets } from 'src/app/Tutoriales/Tutoriales_Tickets';

@Component({
  selector: 'app-Gestion_Tickets',
  templateUrl: './Gestion_Tickets.component.html',
  styleUrls: ['./Gestion_Tickets.component.css']
})

export class Gestion_TicketsComponent implements OnInit, OnDestroy {

  @ViewChild('dt') dt: Table | undefined; //Variable identificadora en la que se verán los tickets
  cargando : boolean = false;
  modoSeleccionado : boolean = false; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  private intervaloTema : any;

  cantidades : CantidadesTickets = { abiertos: 0, enRevision: 0, resueltosMes: 0 };
  incluirFinalizados : boolean = false; // muestra también resueltos y cancelados
  tickets : TicketListado[] = [];

  /** Rango de fechas de creación que se consulta en la API (por defecto, el último año). */
  fechaInicio : Date = rangoFechasTicketsPorDefecto().inicio;
  fechaFin : Date = rangoFechasTicketsPorDefecto().fin;
  readonly hoy : Date = new Date();

  codigoDetalle : number | null = null;
  detalleVisible : boolean = false;

  constructor(private AppComponent : AppComponent,
                private ticketService : TicketsService,
                  private tutoriales : TutorialesService,
                    private mensajeService : MensajesAplicacionService) { }

  ngOnInit() {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.intervaloTema = setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
    this.consultar();
  }

  ngOnDestroy() {
    clearInterval(this.intervaloTema);
  }

  tutorial = () => this.tutoriales.iniciar(pasosTutorialGestionTickets());

  /**
   * Consulta las cantidades de las tarjetas y la lista de tickets del rango de fechas.
   * @param reiniciarPagina true cuando cambió el filtro; false al recargar tras atender un ticket (se queda en la misma página).
   */
  consultar(reiniciarPagina : boolean = false){
    if (!this.fechaInicio || !this.fechaFin) {
      this.mensajeService.mensajeAdvertencia('¡Faltan fechas!', 'Seleccione la fecha inicial y la fecha final.');
      return;
    }
    if (this.fechaInicio > this.fechaFin) {
      this.mensajeService.mensajeAdvertencia('¡Rango inválido!', 'La fecha inicial no puede ser mayor que la fecha final.');
      return;
    }
    this.cargando = true;
    this.ticketService.getCantidades().subscribe(c => this.cantidades = c);
    this.ticketService.getGestion(this.fechaInicio, this.fechaFin, this.incluirFinalizados).subscribe({
      next: datos => {
        this.tickets = datos;
        if (reiniciarPagina && this.dt) this.dt.first = 0;
        this.cargando = false;
        // Primera vez: se inicia cuando la tabla ya tiene datos (y no está la animación de carga encima)
        this.tutoriales.iniciarPrimeraVez(ClavesTutorialTickets.GESTION, this.AppComponent.storage_Id, pasosTutorialGestionTickets);
      },
      error: () => {
        this.cargando = false;
        this.mensajeService.mensajeError('¡Ha ocurrido un error!', '¡No se pudieron consultar los tickets!');
      }
    });
  }

  /** Consulta los tickets creados desde el primer día del mes actual hasta hoy. */
  filtrarMesActual(){
    this.fechaInicio = moment().startOf('month').toDate();
    this.fechaFin = moment().startOf('day').toDate();
    this.consultar(true);
  }

  /** Vuelve al rango por defecto (último año) y consulta. */
  clearFilters(){
    const rango = rangoFechasTicketsPorDefecto();
    this.fechaInicio = rango.inicio;
    this.fechaFin = rango.fin;
    this.consultar(true);
  }

  abrirDetalle(ticket : TicketListado) {
    this.codigoDetalle = ticket.codigo;
    this.detalleVisible = true;
  }

  cerrarDetalle = () => this.codigoDetalle = null;

  claseEstado = (estadoId : number) => claseEstadoTicket(estadoId);

  // Funcion que permitirá filtrar la información de la tabla
  aplicarfiltro = ($event, campo : any, valorCampo : string) => this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
}
