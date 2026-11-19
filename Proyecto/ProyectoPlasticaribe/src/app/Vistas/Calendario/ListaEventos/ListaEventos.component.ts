import { Component, EventEmitter, Input, Output } from '@angular/core';
import moment from 'moment';
import { EventoCalendario, claseVisibilidad, nombreVisibilidad } from 'src/app/Servicios/EventosCalendario/EventosCalendario.service';

/** Lista compacta de eventos: panel "Próximos eventos" del calendario y aviso de "Eventos de hoy" de la barra superior. */
@Component({
  selector: 'app-ListaEventos',
  templateUrl: './ListaEventos.component.html',
  styleUrls: ['./ListaEventos.component.css']
})
export class ListaEventosComponent {
  @Input() eventos: EventoCalendario[] = [];
  @Input() mensajeVacio: string = 'No hay eventos.';
  /** true: muestra la descripción completa (aviso del día); false: una línea (panel lateral). */
  @Input() detallado: boolean = false;
  @Output() seleccionar = new EventEmitter<EventoCalendario>();

  clase = (evento: EventoCalendario) => claseVisibilidad(evento);
  visibilidad = (evento: EventoCalendario) => nombreVisibilidad[evento.tipoVisibilidad];
  trackPorId = (_: number, evento: EventoCalendario) => evento.id;

  /** "Hoy", "Mañana" o la fecha corta; con la hora si no es de todo el día. */
  cuando(evento: EventoCalendario): string {
    const inicio = moment(evento.inicio);
    const fin = moment(evento.fin);
    const dia = (m: moment.Moment) => m.isSame(moment(), 'day') ? 'Hoy'
      : m.isSame(moment().add(1, 'day'), 'day') ? 'Mañana'
      : m.format(m.isSame(moment(), 'year') ? 'ddd D MMM' : 'D MMM YYYY');
    const varios = !inicio.isSame(fin, 'day');
    if (evento.todoElDia) return varios ? `${dia(inicio)} – ${dia(fin)}` : `${dia(inicio)} · Todo el día`;
    return varios ? `${dia(inicio)} ${inicio.format('h:mm a')} – ${dia(fin)} ${fin.format('h:mm a')}`
      : `${dia(inicio)} · ${inicio.format('h:mm a')} – ${fin.format('h:mm a')}`;
  }
}
