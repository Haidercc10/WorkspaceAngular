import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';
import moment from 'moment';
import { environment } from 'src/environments/environment';

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
  /** Registros afectados por el error (p. ej. rollos que no se pudieron eliminar), se muestran como tabla. */
  listado?: ListadoDetalleError;
}

/** Tabla opcional de la ventana "Ver detalles". */
export interface ListadoDetalleError {
  titulo: string;
  columnas: string[];
  filas: (string | number | null | undefined)[][];
}

/** Clave del toast de errores con "Ver detalles" (vive solo en app.component.html). */
export const CLAVE_TOAST_ERROR_DETALLADO = 'errorDetallado';

/** Qué se estaba haciendo cuando ocurrió el error (para el mensaje y la ventana "Ver detalles"). */
export interface ContextoError {
  /** Qué se estaba haciendo (p. ej. "Consultar OT"). */
  operacion: string;
  /** Método HTTP, si aplica. */
  metodo?: string;
  /** API que falló; si no se indica, se deduce de la URL del error. */
  api?: string;
}

/** Duración por defecto de los errores con "Ver detalles" (da tiempo de abrirlos). */
const DURACION_ERROR_DETALLADO_MS = 10000;

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

  /**
   * Control de errores común: muestra un mensaje entendible según la causa y el enlace "Ver detalles" con la información técnica.
   * @param error Error recibido (HttpErrorResponse, TimeoutError u otro).
   * @param mensajePorDefecto Mensaje si el servidor no explicó la causa (p. ej. "No se pudo consultar la OT 1234.").
   * @param contexto Operación que se estaba haciendo.
   */
  errorDetallado(error : any, mensajePorDefecto : string, contexto : ContextoError, tiempo : number = DURACION_ERROR_DETALLADO_MS) {
    const api = contexto.api ?? MensajesAplicacionService.apiDeUrl(error?.url);
    const detalle = MensajesAplicacionService.detalleDeError(error, { ...contexto, api });
    this.mensajeErrorDetallado(MensajesAplicacionService.mensajeAmigable(error, mensajePorDefecto, api), detalle, tiempo);
  }

  /**
   * Mensaje breve y entendible según la causa del error:
   * sin internet, servidor apagado, tiempo agotado, sesión vencida, sin permiso, regla de negocio (mensaje del servidor) o error interno.
   */
  static mensajeAmigable(error : any, porDefecto : string, api? : string) : string {
    const servidor = api ?? 'el servidor';
    if (!navigator.onLine) return 'No hay conexión a internet. Verifique su red e inténtelo de nuevo.';
    if (error instanceof TimeoutError) return `${servidor} tardó demasiado en responder. Inténtelo de nuevo.`;
    if (!(error instanceof HttpErrorResponse)) return porDefecto;

    const delServidor = MensajesAplicacionService.mensajeDelServidor(error);
    if (error.status === 0) return `No se pudo conectar con ${servidor}. Verifique que esté en la red de la empresa o que el servidor esté encendido.`;
    if (error.status === 401) return 'Su sesión venció. Inicie sesión de nuevo.';
    if (error.status === 403) return delServidor ?? 'No tiene permiso para realizar esta acción.';
    if (error.status >= 500) return `${porDefecto} ${servidor} tuvo un problema interno; si continúa, envíe los detalles a soporte.`;
    return delServidor ?? porDefecto;
  }

  /** Mensaje de negocio que devolvió el API (texto corto o campo mensaje/detail), si lo hay. */
  static mensajeDelServidor(error : HttpErrorResponse) : string | undefined {
    const cuerpo = error.error;
    let texto : any;
    if (typeof cuerpo === 'string') texto = cuerpo;
    else if (cuerpo && typeof cuerpo === 'object' && !(cuerpo instanceof ProgressEvent)) {
      texto = cuerpo.mensaje ?? cuerpo.message ?? cuerpo.detail ?? cuerpo.detalle;
      // Errores de validación de ASP.NET (ProblemDetails.errors): { campo: ["mensaje", ...] }
      if (texto == null && cuerpo.errors && typeof cuerpo.errors === 'object') {
        texto = Object.values(cuerpo.errors).flatMap(v => Array.isArray(v) ? v : [v]).filter(v => typeof v === 'string').join(' ');
      }
    }
    if (typeof texto !== 'string') return undefined;
    texto = texto.trim();
    // Un HTML o una traza larga no sirven como mensaje para el usuario (quedan en "Ver detalles").
    return texto && texto.length <= 300 && !texto.startsWith('<') ? texto : undefined;
  }

  /** Nombre de la API según la URL de la petición. */
  static apiDeUrl(url? : string | null) : string | undefined {
    if (!url) return undefined;
    const apis : [string, string][] = [
      [environment.rutaPlasticaribeAPI, 'Plasticaribe'],
      [environment.rutaBagPro, 'BagPro'],
      [environment.rutaZeusContabilidad, 'Zeus Contabilidad'],
      [environment.rutaZeus, 'Zeus'],
    ];
    return apis.find(([ruta]) => ruta && url.startsWith(ruta))?.[1];
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
    const texto = filas.filter(([, valor]) => valor !== undefined && valor !== null && `${valor}` !== '').map(([nombre, valor]) => `${nombre}: ${valor}`).join('\n');
    if (!detalle.listado?.filas.length) return texto;

    const { titulo, columnas, filas: registros } = detalle.listado;
    const tabla = [columnas.join('\t'), ...registros.map(fila => fila.map(valor => valor ?? '').join('\t'))].join('\n');
    return `${texto}\n\n${titulo} (${registros.length}):\n${tabla}`;
  }
}
