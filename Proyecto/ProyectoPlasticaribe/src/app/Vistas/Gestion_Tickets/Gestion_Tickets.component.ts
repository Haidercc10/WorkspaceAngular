import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TutorialesService } from 'src/app/Servicios/Tutoriales/Tutoriales.service';
import moment from 'moment';
import { Table } from 'primeng/table';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { CantidadesTickets, claseEstadoTicket, TicketListado, TicketsService } from 'src/app/Servicios/Tickets/Tickets.service';
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
  ticketsDisponibles : TicketListado[] = [];
  tickets : TicketListado[] = [];

  anios : number [] = [];
  meses : { id: number, nombre: string } [] = [];
  private readonly todosLosMeses : { id: number, nombre: string } [] = [
    { id: 1, nombre: 'ENERO' }, { id: 2, nombre: 'FEBRERO' }, { id: 3, nombre: 'MARZO' },
    { id: 4, nombre: 'ABRIL' }, { id: 5, nombre: 'MAYO' }, { id: 6, nombre: 'JUNIO' },
    { id: 7, nombre: 'JULIO' }, { id: 8, nombre: 'AGOSTO' }, { id: 9, nombre: 'SEPTIEMBRE' },
    { id: 10, nombre: 'OCTUBRE' }, { id: 11, nombre: 'NOVIEMBRE' }, { id: 12, nombre: 'DICIEMBRE' }
  ];
  anioSeleccionado : number | null = null;
  mesSeleccionado : number | null = null;

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

  /** Consulta las cantidades de las tarjetas y la lista de tickets. */
  consultar(){
    this.cargando = true;
    this.ticketService.getCantidades().subscribe(c => this.cantidades = c);
    this.ticketService.getGestion(this.incluirFinalizados).subscribe({
      next: datos => {
        this.ticketsDisponibles = datos;
        this.filtrarTicketsPorFecha();
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

  /**
   * Filtra los tickets y actualiza los años y meses según las fechas de creación.
   * @param limpiarFiltrosInvalidos Indica si se deben limpiar selecciones que no existen en los datos.
   */
  filtrarTicketsPorFecha(limpiarFiltrosInvalidos: boolean = true){
    this.actualizarOpcionesFecha(limpiarFiltrosInvalidos);
    this.tickets = this.ticketsDisponibles.filter(ticket => {
      const fecha = moment(ticket.fechaCreacion);
      if (!fecha.isValid()) return this.anioSeleccionado == null && this.mesSeleccionado == null;
      const coincideAnio = this.anioSeleccionado == null || fecha.year() === this.anioSeleccionado;
      const coincideMes = this.mesSeleccionado == null || fecha.month() + 1 === this.mesSeleccionado;
      return coincideAnio && coincideMes;
    });
  }

  private actualizarOpcionesFecha(limpiarFiltrosInvalidos: boolean): void {
    const fechasValidas = this.ticketsDisponibles.map(t => moment(t.fechaCreacion)).filter(f => f.isValid());

    this.anios = [...new Set(fechasValidas.map(f => f.year()))].sort((a, b) => a - b);
    if (limpiarFiltrosInvalidos && this.anioSeleccionado !== null && !this.anios.includes(this.anioSeleccionado)) {
      this.anioSeleccionado = null;
      this.mesSeleccionado = null;
    }

    const idsMesesDisponibles = new Set(
      fechasValidas
        .filter(f => this.anioSeleccionado === null || f.year() === this.anioSeleccionado)
        .map(f => f.month() + 1)
    );
    this.meses = this.todosLosMeses.filter(mes => idsMesesDisponibles.has(mes.id));
    if (limpiarFiltrosInvalidos && this.mesSeleccionado !== null && !idsMesesDisponibles.has(this.mesSeleccionado)) {
      this.mesSeleccionado = null;
    }
  }

  filtrarMesActual(){
    this.anioSeleccionado = moment().year();
    this.mesSeleccionado = moment().month() + 1;
    this.filtrarTicketsPorFecha(false);
  }

  clearFilters(){
    this.anioSeleccionado = null;
    this.mesSeleccionado = null;
    this.filtrarTicketsPorFecha();
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
