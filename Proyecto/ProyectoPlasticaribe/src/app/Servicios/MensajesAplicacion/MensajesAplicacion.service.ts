import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';
import moment from 'moment';

/**
 * Información técnica de un error para la ventana "Ver detalles".
 * Nunca incluye el cuerpo de la petición (puede llevar contraseñas u otros datos sensibles).
 */
export interface DetalleError {
  /** API o servicio que falló (p. ej. "Plasticaribe", "BagPro"). */
  api?: string;
  /** Qué se estaba haciendo (p. ej. "Inicio de sesión"). */
  operacion?: string;
  metodo?: string;
  url?: string;
  /** Código HTTP; 0 = el servidor no respondió. */
  status?: number;
  statusText?: string;
  /** Título y detalle que devolvió el servidor (ProblemDetails). */
  tituloServidor?: string;
  detalleServidor?: string;
  /** Identificador para buscar el error en los registros del servidor. */
  traceId?: string;
  /** Mensaje técnico del error (navegador / Angular). */
  mensajeTecnico?: string;
  /** Si el navegador tenía conexión a internet al momento del error. */
  conInternet: boolean;
  fecha: string;
}

/** Clave del toast de errores con "Ver detalles" (vive solo en app.component.html). */
export const CLAVE_TOAST_ERROR_DETALLADO = 'errorDetallado';

@Injectable({ providedIn: 'root'})

export class MensajesAplicacionService {

  /** Detalle que se muestra en la ventana "Ver detalles" (null = cerrada). */
  detalleVisible: DetalleError | null = null;

  constructor(private messageService: MessageService,) { }

  mensajeError = (titulo : string, detalles : string = '', tiempo : number = 3000) => this.messageService.add({severity:'error', summary: titulo, detail: detalles, life: tiempo });

  errorHttp = (message: string, error: HttpErrorResponse) => this.mensajeError(message, `Error: ${error.statusText} | Status: ${error.status}`);

  mensajeAdvertencia = (titulo : string, detalles : string = '', tiempo : number = 3000) => this.messageService.add({severity:'warn', summary: titulo, detail: detalles, life: tiempo });

  mensajeConfirmacion = (titulo : string, detalles : string = '', tiempo : number = 3000) => this.messageService.add({severity:'success', summary: titulo, detail: detalles, life: tiempo });

  mensajeInformacion = (titulo : string, detalles : string = '', tiempo : number = 3000) => this.messageService.add({severity:'info', summary: titulo, detail: detalles, life: tiempo });

  /**
   * Error con título "Error", un mensaje breve y el enlace "Ver detalles" que abre la información técnica.
   * @param mensaje Texto breve y entendible para el usuario.
   * @param detalle Información técnica (ver `detalleDeError`).
   */
  mensajeErrorDetallado(mensaje : string, detalle : DetalleError, tiempo : number = 8000) {
    this.messageService.add({ key: CLAVE_TOAST_ERROR_DETALLADO, severity: 'error', summary: 'Error', detail: mensaje, life: tiempo, data: detalle });
  }

  /** Abre la ventana con el detalle técnico (y cierra el toast). */
  verDetalles(detalle : DetalleError) {
    this.messageService.clear(CLAVE_TOAST_ERROR_DETALLADO);
    this.detalleVisible = detalle;
  }

  cerrarDetalles = () => this.detalleVisible = null;

  /**
   * Arma el detalle técnico a partir de cualquier error (HttpErrorResponse, TimeoutError u otro).
   * Del servidor solo toma title/detail/traceId o un texto corto; nunca el cuerpo de la petición.
   */
  static detalleDeError(error : any, contexto : { api?: string, operacion?: string, metodo?: string, url?: string } = {}) : DetalleError {
    const detalle : DetalleError = { ...contexto, conInternet: navigator.onLine, fecha: moment().format('YYYY-MM-DD HH:mm:ss') };

    if (error instanceof HttpErrorResponse) {
      detalle.url = error.url ?? contexto.url;
      detalle.status = error.status;
      detalle.statusText = error.status === 0 ? 'Sin respuesta del servidor' : error.statusText;
      detalle.mensajeTecnico = error.message;
      const cuerpo = error.error;
      if (cuerpo && typeof cuerpo === 'object' && !(cuerpo instanceof ProgressEvent)) {
        detalle.tituloServidor = cuerpo.title ?? cuerpo.titulo;
        detalle.detalleServidor = cuerpo.detail ?? cuerpo.detalle ?? cuerpo.message ?? cuerpo.mensaje;
        detalle.traceId = cuerpo.traceId ?? cuerpo.extensions?.traceId;
      } else if (typeof cuerpo === 'string' && cuerpo.trim()) {
        detalle.detalleServidor = cuerpo.length > 500 ? `${cuerpo.substring(0, 500)}...` : cuerpo;
      }
    } else if (error instanceof TimeoutError) {
      detalle.statusText = 'Tiempo de espera agotado';
      detalle.mensajeTecnico = 'El servidor no respondió dentro del tiempo máximo de espera.';
    } else {
      detalle.mensajeTecnico = error?.message ?? `${error ?? 'Error desconocido'}`;
    }
    return detalle;
  }

  /** Texto plano del detalle, para copiarlo y enviarlo a soporte. */
  static detalleComoTexto(detalle : DetalleError) : string {
    const filas : [string, any][] = [
      ['Fecha', detalle.fecha],
      ['Operación', detalle.operacion],
      ['API', detalle.api],
      ['Método', detalle.metodo],
      ['URL', detalle.url],
      ['Código', detalle.status !== undefined ? `${detalle.status} ${detalle.statusText ?? ''}`.trim() : detalle.statusText],
      ['Error del servidor', detalle.tituloServidor],
      ['Detalle del servidor', detalle.detalleServidor],
      ['TraceId', detalle.traceId],
      ['Mensaje técnico', detalle.mensajeTecnico],
      ['Conexión a internet', detalle.conInternet ? 'Sí' : 'No'],
    ];
    return filas.filter(([, valor]) => valor !== undefined && valor !== null && `${valor}` !== '').map(([nombre, valor]) => `${nombre}: ${valor}`).join('\n');
  }
}
