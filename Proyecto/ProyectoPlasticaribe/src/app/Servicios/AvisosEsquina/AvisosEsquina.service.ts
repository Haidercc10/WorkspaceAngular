import { Injectable, inject } from '@angular/core';
import { Message, MessageService } from 'primeng/api';

/** Botón de un aviso de la esquina. El primero se ve como acción principal (relleno rojo) y los demás como texto. */
export interface AccionAvisoEsquina {
  etiqueta: string;
  icono: string;
  /** Se ejecuta al hacer clic; el aviso no se quita solo: la acción decide (p. ej. con quitar()). */
  accion: () => void;
}

/** Aviso de la esquina superior derecha (recordatorios del calendario, novedades de tickets...). */
export interface AvisoEsquina {
  /** Identificador único entre todos los avisos, con prefijo por origen (p. ej. 'evento:12', 'ticket:10079'). */
  id: string;
  severidad: 'info' | 'success' | 'warn' | 'error';
  icono: string;
  titulo: string;
  detalle: string;
  acciones: AccionAvisoEsquina[];
  /** Datos propios del origen (p. ej. la hora de inicio del evento para saber si quedó obsoleto). */
  datos?: any;
}

/**
 * Avisos que se quedan en la esquina superior derecha, bajo la barra superior, hasta que el usuario los cierra o
 * usa uno de sus botones. Todos comparten un solo p-toast (app-avisos-esquina) para que los de distintos orígenes
 * se apilen en vez de dibujarse uno encima del otro.
 */
@Injectable({ providedIn: 'root' })
export class AvisosEsquinaService {

  static readonly CLAVE_TOAST = 'avisoEsquina';

  private readonly messageService = inject(MessageService);
  /** Avisos en pantalla, en el orden en que se muestran. */
  private readonly avisos = new Map<string, Message>();

  /** Muestra el aviso; si ya había uno con el mismo id, lo reemplaza. */
  mostrar(aviso: AvisoEsquina) {
    this.avisos.delete(aviso.id);
    this.avisos.set(aviso.id, {
      key: AvisosEsquinaService.CLAVE_TOAST,
      severity: aviso.severidad,
      summary: aviso.titulo,
      detail: aviso.detalle,
      sticky: true,
      data: aviso,
    });
    this.redibujar();
  }

  /** Quita el aviso (si está). */
  quitar(id: string) {
    if (this.avisos.delete(id)) this.redibujar();
  }

  /** Quita los avisos cuyo id cumple la condición (p. ej. todos los de un origen). */
  quitarSi(condicion: (aviso: AvisoEsquina) => boolean) {
    const quitar = [...this.avisos.values()].filter(m => condicion(m.data));
    if (!quitar.length) return;
    quitar.forEach(m => this.avisos.delete(m.data.id));
    this.redibujar();
  }

  /** Avisos en pantalla que cumplen la condición. */
  buscar = (condicion: (aviso: AvisoEsquina) => boolean): AvisoEsquina[] =>
    [...this.avisos.values()].map(m => m.data as AvisoEsquina).filter(condicion);

  /** El usuario cerró el aviso con la X: PrimeNG ya lo quitó de la pantalla. */
  alCerrar(mensaje: Message) {
    this.avisos.delete(mensaje.data?.id);
  }

  /** PrimeNG no quita un mensaje suelto: se limpia la clave y se vuelven a agregar los vigentes. */
  private redibujar() {
    this.messageService.clear(AvisosEsquinaService.CLAVE_TOAST);
    if (this.avisos.size) this.messageService.addAll([...this.avisos.values()]);
  }
}
