import { Component, inject } from '@angular/core';
import { AccionAvisoEsquina, AvisosEsquinaService } from 'src/app/Servicios/AvisosEsquina/AvisosEsquina.service';

/**
 * Contenedor de los avisos de la esquina superior derecha (AvisosEsquinaService): recordatorios del calendario,
 * novedades de tickets, etc. Va una sola vez en app.component.html.
 */
@Component({
  selector: 'app-avisos-esquina',
  templateUrl: './AvisosEsquina.component.html',
  styleUrls: ['./AvisosEsquina.component.css']
})
export class AvisosEsquinaComponent {
  readonly avisos = inject(AvisosEsquinaService);
  readonly claveToast = AvisosEsquinaService.CLAVE_TOAST;

  trackAccion = (_: number, accion: AccionAvisoEsquina) => accion.etiqueta;
}
