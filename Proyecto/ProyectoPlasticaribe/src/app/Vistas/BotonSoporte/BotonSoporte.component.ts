import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { combineLatest, filter, startWith } from 'rxjs';
import { VistaFavorita, VistasFavoritasService } from 'src/app/Servicios/VistasFavoritas/VistasFavoritas.service';
import { TicketCreado } from '../Tickets/Formulario_Ticket/Formulario_Ticket.component';

/** Rutas donde no se muestra el botón: la propia página de tickets, la gestión de soporte y el login. */
const RUTAS_SIN_BOTON = ['/tickets', '/gestion-tickets', '/login', '/'];

/**
 * Botón flotante "Reportar incidente a soporte" (esquina inferior derecha, en todas las páginas salvo las de
 * RUTAS_SIN_BOTON). Abre un panel lateral derecho, sin máscara, con el formulario de "Nuevo ticket", para que el
 * usuario pueda seguir viendo la página mientras describe el problema. La página actual se anota en el ticket.
 */
@Component({
  selector: 'app-boton-soporte',
  templateUrl: './BotonSoporte.component.html',
  styleUrls: ['./BotonSoporte.component.css']
})
export class BotonSoporteComponent {

  static readonly CLAVE_TOAST = 'ticketCreadoSoporte';
  readonly claveToast = BotonSoporteComponent.CLAVE_TOAST;

  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  /** false en las rutas de RUTAS_SIN_BOTON: ni botón ni panel (así no se repiten los Id del formulario de /Tickets). */
  visible : boolean = false;
  panelVisible : boolean = false;
  /** El formulario se crea al abrir el panel la primera vez y se conserva al cerrarlo: lo escrito no se pierde. */
  formularioMontado : boolean = false;
  /** Página actual (nombre de la vista del menú y URL), que se anota en la descripción del ticket. */
  paginaActual : { nombre : string, url : string } | null = null;

  private readonly suscripcionRuta = combineLatest([
    this.router.events.pipe(filter(e => e instanceof NavigationEnd), startWith(null)),
    inject(VistasFavoritasService).disponiblesSinError(),
  ]).pipe(takeUntilDestroyed()).subscribe(([, vistas]) => this.alCambiarDePagina(vistas));

  private alCambiarDePagina(vistas : VistaFavorita[]) {
    const url = VistasFavoritasService.normalizarRuta(this.router.url);
    this.visible = !RUTAS_SIN_BOTON.some(r => url.toLowerCase() === r || (r !== '/' && url.toLowerCase().startsWith(`${r}/`)));
    if (!this.visible) {
      // En /Tickets el formulario de la página reemplaza al del panel: se cierra y se descarta
      this.panelVisible = false;
      this.formularioMontado = false;
      return;
    }
    const nombre = VistasFavoritasService.esInicio(url) ? 'Inicio' : VistasFavoritasService.vistaDeUrl(url, vistas)?.nombre;
    this.paginaActual = { nombre : nombre ?? url, url };
  }

  abrirPanel() {
    this.formularioMontado = true;
    this.panelVisible = true;
  }

  /** Ticket creado: se cierra el panel y sale el aviso de éxito al centro, como en la página de tickets. */
  alCrearTicket({ codigo, reportante } : TicketCreado) {
    this.panelVisible = false;
    this.messageService.clear(this.claveToast);
    this.messageService.add({
      key : this.claveToast,
      severity : 'success',
      summary : 'OK!',
      detail : `${reportante ? `¡Ticket #${codigo} creado a nombre de ${reportante}!` : `¡Ticket #${codigo} creado correctamente!`} Soporte lo revisará pronto. Puede seguir su estado en "Mis tickets".`,
      life : 8000,
    });
  }

  verMisTickets() {
    this.messageService.clear(this.claveToast);
    this.router.navigate(['/Tickets'], { queryParams : { pestana : 'mis-tickets' } });
  }
}
