import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import moment from 'moment';
import { Observable, from, map, shareReplay, switchMap } from 'rxjs';
import { db } from 'src/app/conexionFirebase';
import { environment } from 'src/environments/environment';

/** Estados de un correo de la página web (campo Estado del documento en Firebase). */
export const EstadoCorreo = {
  NUEVO: 'Nuevo',
  LEIDO: 'Leido',
  RESPONDIDO: 'Respondido',
  ARCHIVADO: 'Archivado',
} as const;
export type EstadoCorreoWeb = typeof EstadoCorreo[keyof typeof EstadoCorreo];

/** Máximo de caracteres de una respuesta. */
export const MAX_CARACTERES_RESPUESTA = 2000;

export interface CorreoWeb {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  asunto: string;
  mensaje: string;
  fecha: string;          // tal como lo guarda la página web (YYYY-MM-DD)
  hora: string;           // normalizada a HH:mm:ss
  marcaTiempo: string;    // 'fecha hora', sirve para ordenar
  estado: EstadoCorreoWeb;
  respuesta: string | null;
  fechaRespuesta: string | null;
  horaRespuesta: string | null;
  respondidoPor: string | null;
}

/** Clase global (styles.css) del badge de estado; mismo criterio de colores que los tickets. */
export function claseEstadoCorreo(estado: EstadoCorreoWeb): string {
  switch (estado) {
    case EstadoCorreo.NUEVO: return 'bg-warning1';
    case EstadoCorreo.LEIDO: return 'bg-blue1';
    case EstadoCorreo.RESPONDIDO: return 'bg-success1';
    default: return 'bg-secondary1';
  }
}

export const nombreEstadoCorreo = (estado: EstadoCorreoWeb): string => estado == EstadoCorreo.LEIDO ? 'Leído' : estado;

/**
 * Estado efectivo de un documento. Los correos que crea la página web no traen Estado (o traen false),
 * y los respondidos con la versión anterior quedaron con Estado 'Leido' y una Respuesta.
 */
function estadoDe(datos: any): EstadoCorreoWeb {
  const estado = datos['Estado'];
  if (estado === EstadoCorreo.ARCHIVADO) return EstadoCorreo.ARCHIVADO;
  if (estado === EstadoCorreo.NUEVO) return EstadoCorreo.NUEVO; // marcado como no leído a mano, aunque ya tenga respuesta
  if (estado === EstadoCorreo.RESPONDIDO || (datos['Respuesta'] ?? '').toString().trim() != '') return EstadoCorreo.RESPONDIDO;
  if (estado === EstadoCorreo.LEIDO) return EstadoCorreo.LEIDO;
  return EstadoCorreo.NUEVO;
}

/** La página web guarda la hora como H:mm:ss (sin cero inicial): se normaliza para ordenar y mostrar. */
function normalizarHora(hora: any): string {
  const texto = (hora ?? '').toString().trim();
  return texto.length == 7 ? `0${texto}` : texto;
}

/** Escapa el texto para insertarlo en el HTML del correo y conserva los saltos de línea. */
function aHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/\r?\n/g, '<br>');
}

@Injectable({
  providedIn: 'root'
})
export class CorreosWebService {

  private readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  /**
   * Correos de la página web en tiempo real, del más reciente al más antiguo.
   * Una sola escucha a Firebase compartida entre la barra superior y la bandeja; se cierra cuando nadie la usa.
   */
  readonly correos$: Observable<CorreoWeb[]> = new Observable<CorreoWeb[]>(suscriptor => {
    const dejarDeEscuchar = onSnapshot(collection(db, 'Correos'),
      snapshot => this.zone.run(() => suscriptor.next(snapshot.docs.map(d => this.mapear(d.id, d.data()))
        .sort((a, b) => b.marcaTiempo.localeCompare(a.marcaTiempo)))),
      error => this.zone.run(() => suscriptor.error(error)));
    return dejarDeEscuchar;
  }).pipe(shareReplay({ bufferSize: 1, refCount: true }));

  /** Cantidad de correos nuevos (sin leer), para el badge de la barra superior. */
  readonly cantidadNuevos$: Observable<number> = this.correos$.pipe(map(lista => lista.filter(c => c.estado == EstadoCorreo.NUEVO).length));

  constructor(private http: HttpClient, private zone: NgZone) { }

  private mapear(id: string, datos: any): CorreoWeb {
    const fecha = (datos['Fecha'] ?? '').toString();
    const hora = normalizarHora(datos['Hora']);
    return {
      id,
      nombre: datos['Nombre'] ?? '',
      correo: datos['Correo'] ?? '',
      telefono: datos['Telefono'] ?? '',
      asunto: datos['Asunto'] ?? '',
      mensaje: datos['Mensaje'] ?? '',
      fecha,
      hora,
      marcaTiempo: `${fecha} ${hora}`,
      estado: estadoDe(datos),
      respuesta: datos['Respuesta'] || null,
      fechaRespuesta: datos['FechaRespuesta'] ?? null,
      horaRespuesta: datos['HoraRespuesta'] ?? null,
      respondidoPor: datos['RespondidoPor'] ?? null,
    };
  }

  /** Cambia el estado del correo en Firebase (la lista se actualiza sola por la escucha en tiempo real). */
  cambiarEstado = (id: string, estado: EstadoCorreoWeb): Promise<void> => setDoc(doc(db, 'Correos', id), { Estado: estado }, { merge: true });

  /** Al abrir un correo: solo los nuevos pasan a leídos. */
  marcarLeido(correo: CorreoWeb): Promise<void> {
    return correo.estado == EstadoCorreo.NUEVO ? this.cambiarEstado(correo.id, EstadoCorreo.LEIDO) : Promise.resolve();
  }

  /** Al desarchivar vuelve a Respondido si ya tenía respuesta; si no, a Leído. */
  desarchivar = (correo: CorreoWeb): Promise<void> =>
    this.cambiarEstado(correo.id, correo.respuesta ? EstadoCorreo.RESPONDIDO : EstadoCorreo.LEIDO);

  /**
   * Envía la respuesta al cliente y, solo si el envío salió bien, la guarda en Firebase con quién y cuándo respondió.
   * Usa el endpoint existente Envio_Correo, que envía a la dirección del campo Correo e inserta Mensaje en el HTML del correo.
   */
  enviarRespuesta(correo: CorreoWeb, respuesta: string, usuario: string): Observable<void> {
    const original = `El ${correo.fecha} a las ${correo.hora}, ${correo.nombre} escribió:`;
    const firmaHtml = `Atentamente,<br><b>${aHtml(usuario)}</b><br>Plasticaribe S.A.S`;
    const cuerpoHtml = `${aHtml(respuesta.trim())}<br><br>${firmaHtml}<br><br><hr>`
      + `<i>${aHtml(original)}</i><br>`
      + `<blockquote style="margin: 8px 0; padding-left: 12px; border-left: 3px solid #db4149; color: #555;">${aHtml(correo.mensaje)}</blockquote>`;

    const firma = `${usuario} - Plasticaribe S.A.S`;
    const textoPlano = `${respuesta.trim()}\n\nAtentamente,\n${usuario}\nPlasticaribe S.A.S\n\n`
      + `----------------------------------------\n${original}\n`
      + correo.mensaje.split(/\r?\n/).map(linea => `> ${linea}`).join('\n');

    const datos = {
      Nombre: firma,
      Telefono: correo.telefono || 'N/A',
      Correo: correo.correo,
      Asunto: correo.asunto.toLowerCase().startsWith('re:') ? correo.asunto : `Re: ${correo.asunto}`,
      // La API pasa el mensaje por string.Format: las llaves se duplican para que no fallen
      Mensaje: cuerpoHtml.replace(/\{/g, '{{').replace(/\}/g, '}}'),
      Fecha_Envio: moment().format('YYYY-MM-DD'),
      Hora_Envio: moment().format('HH:mm:ss'),
      // La API no agrega el pie "Correo enviado por / contacto" del cliente: la firma ya va en el mensaje
      EsRespuesta: true,
      // Versión para programas de correo que no muestran HTML (sin etiquetas ni llaves duplicadas)
      MensajeTexto: textoPlano,
    };

    // La API responde texto plano ("El correo ha sido enviado"), no JSON
    return this.http.post(`${this.rutaPlasticaribeAPI}/Web_ContactoCorreo/Envio_Correo`, datos, { responseType: 'text' }).pipe(
      switchMap(() => from(setDoc(doc(db, 'Correos', correo.id), {
        Estado: EstadoCorreo.RESPONDIDO,
        Respuesta: respuesta.trim(),
        FechaRespuesta: moment().format('YYYY-MM-DD'),
        HoraRespuesta: moment().format('HH:mm:ss'),
        RespondidoPor: usuario,
      }, { merge: true }))),
    );
  }
}
