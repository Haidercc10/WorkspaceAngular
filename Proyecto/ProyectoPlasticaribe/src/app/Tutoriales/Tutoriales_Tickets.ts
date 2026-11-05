import Step from 'shepherd.js/src/types/step';
import { builtInButtons } from 'src/app/data';
import { claseEstadoTicket, EstadoTicket } from 'src/app/Servicios/Tickets/Tickets.service';
import { TutorialesService } from 'src/app/Servicios/Tutoriales/Tutoriales.service';

/*
 * Tutoriales del módulo de Tickets. Los pasos se arman con funciones (no con arreglos fijos) para
 * incluir u omitir pasos según el rol y para poder cambiar de pestaña antes de resaltar un elemento.
 * Patrón a seguir para otros módulos grandes: un archivo por módulo en src/app/Tutoriales/.
 */

/** Claves del inicio automático. Subir la versión hace que el tutorial vuelva a salir solo a todos. */
export const ClavesTutorialTickets = {
  TICKETS: 'tickets-v1',
  GESTION: 'gestion-tickets-v1',
  DETALLE: 'detalle-ticket-v1',
  DETALLE_SOPORTE: 'detalle-ticket-soporte-v1',
} as const;

const botonTerminar = {
  classes: 'botonRojo',
  text: `<i class="pi pi-check mr-2"></i> <b> Terminar</b>`,
  type: 'next', // "siguiente" en el último paso finaliza el recorrido
};

/** Paso con el formato del proyecto. Sin `elemento` el paso sale centrado en la pantalla. */
function paso(elemento : string | null, titulo : string, texto : string, extra : Partial<Step.StepOptions> = {}) : Step.StepOptions {
  return {
    ...(elemento ? { attachTo: { element: elemento, on: 'bottom' } } : {}),
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    title: `<h4 style="margin: auto; color: var(--rojo)">${titulo}</h4>`,
    text: texto,
    ...extra,
  } as Step.StepOptions;
}

/** Pone ids únicos y los botones Cerrar/Atrás/Siguiente/Terminar según la posición de cada paso. */
function armar(prefijo : string, pasos : (Step.StepOptions | null | false)[]) : Step.StepOptions[] {
  const lista = pasos.filter(Boolean) as Step.StepOptions[];
  return lista.map((p, i) => ({
    ...p,
    id: `${prefijo}-${i + 1}`,
    buttons: [
      i === 0 ? builtInButtons.cancel : builtInButtons.back,
      i === lista.length - 1 ? botonTerminar : builtInButtons.next,
    ],
  }) as Step.StepOptions);
}

const badge = (estadoId : number, texto : string) => `<span class="badge badge-estado-ticket ${claseEstadoTicket(estadoId)}">${texto}</span>`;

const leyendaEstados = `<ul>
  <li>${badge(EstadoTicket.ABIERTO, 'Abierto')} Se creó y está esperando que soporte lo tome.</li>
  <li>${badge(EstadoTicket.EN_REVISION, 'En revisión')} Soporte ya lo está atendiendo.</li>
  <li>${badge(EstadoTicket.RESUELTO, 'Resuelto')} Se solucionó; en el detalle está la solución aplicada.</li>
  <li>${badge(EstadoTicket.CANCELADO, 'Cancelado')} Se cerró sin resolver (por ejemplo, porque estaba repetido).</li>
</ul>`;

// ===================================================================== TICKETS (crear + mis tickets)

export interface ContextoTutorialTickets {
  esSoporte : boolean;
  /** Cambia la pestaña visible: 0 = Nuevo ticket, 1 = Mis tickets. */
  irAPestana : (indice : number) => void;
}

export function pasosTutorialTickets({ esSoporte, irAPestana } : ContextoTutorialTickets) : Step.StepOptions[] {
  const enNuevo = (selector : string) => ({ beforeShowPromise: TutorialesService.prepararPantalla(() => irAPestana(0), selector) });
  const enMisTickets = (selector : string) => ({ beforeShowPromise: TutorialesService.prepararPantalla(() => irAPestana(1), selector) });

  return armar('tutorial-tickets', [
    paso(null, '¡Tickets!',
      `<p>¡Aquí le contamos a soporte cuando algo no funciona: una falla en el programa, un equipo dañado, o cuando necesitamos algo nuevo!</p>
       <p>Soporte revisa cada ticket y nos responde aquí mismo.</p>`),

    esSoporte && paso('#campoReportante', '¡Reportado por! (solo soporte)',
      `<p>Si una persona les reporta algo por teléfono, chat o en persona, pueden registrar el ticket <b>a nombre de ella</b>.</p>
       <p>Busque por <b>nombre, ID o área</b>. Si lo deja vacío, el ticket queda a su propio nombre.</p>
       <p>Cómo llegó el reporte u otros detalles se pueden dejar después como comentario.</p>`, enNuevo('#campoReportante')),

    paso('#campoAsunto', '¡Asunto!',
      `<p>¡Escribimos en pocas palabras qué está pasando, por ejemplo <i>"No imprime la etiqueta de sellado"</i>!</p>`, enNuevo('#campoAsunto')),

    paso('#campoTipo', '¡Tipo de Ticket!',
      `<p>Elegimos el que más se parezca:</p>
       <ul>
         <li><b>Incidente:</b> algo dejó de funcionar (el programa, un computador, una impresora...).</li>
         <li><b>Solicitud:</b> necesitamos algo (un usuario, un permiso, una instalación...).</li>
         <li><b>Requerimiento:</b> algo nuevo que el programa todavía no hace.</li>
         <li><b>Mejora:</b> una idea para que algo que ya existe funcione mejor.</li>
         <li><b>Otro:</b> si no encaja en ninguno.</li>
       </ul>`, enNuevo('#campoTipo')),

    paso('#campoDescripcion', '¡Descripción!',
      `<p>¡Contamos con detalle qué pasó: en qué pantalla o equipo, qué estábamos haciendo y qué mensaje salió!</p>
       <p>Mientras más claro, más rápido lo pueden solucionar.</p>`, enNuevo('#campoDescripcion')),

    paso('#imagen', '¡Imágenes! (opcional)',
      `<p>Podemos adjuntar hasta <b>5 imágenes .png o .jpg</b> de máximo 5 MB:</p>
       <ul>
         <li>Con el botón <b>Elegir imágenes</b>.</li>
         <li>Arrastrándolas a este recuadro.</li>
         <li>Tomando una captura de pantalla y pegándola con <b>Ctrl+V</b>.</li>
       </ul>
       <p>Para quitar una, se presiona la <b>X</b> de su miniatura.</p>`, enNuevo('#imagen')),

    paso('#enviarTicket', '¡Crear Ticket!',
      `<p>¡Cuando hayamos llenado el asunto, el tipo y la descripción, presionamos este botón para enviar el ticket!</p>`, enNuevo('#enviarTicket')),

    paso('#limpiarTodo', '¡Limpiar Todo!',
      `<p>¡Borra lo que hayamos escrito y las imágenes elegidas, para empezar de nuevo!</p>`, enNuevo('#limpiarTodo')),

    paso(null, '¡Ticket creado!',
      `<p>Al crear el ticket sale un mensaje en el centro de la pantalla con su <b>número</b>.</p>
       <p>Desde ese mensaje podemos ir a <b>VER MIS TICKETS</b>, cerrarlo con la <b>X</b> o dejar que se cierre solo después de unos segundos.</p>`),

    esSoporte && paso('#btnGestion', '¡Gestión de Tickets! (solo soporte)',
      `<p>Con este botón vamos a la pantalla donde soporte ve <b>los tickets de todos</b> y los atiende.</p>`),

    paso('#tablaMisTickets', '¡Mis tickets!',
      esSoporte
        ? `<p>En esta pestaña están los tickets que usted creó y también <b>los que registró a nombre de otras personas</b>.</p>
           <p>La columna <b>Reportado por</b> muestra a nombre de quién quedó; el ícono <i class="pi pi-user-edit"></i> indica que lo registró soporte.</p>`
        : `<p>¡En esta pestaña vemos todos los tickets que hemos creado, del más reciente al más antiguo!</p>`,
      enMisTickets('#tablaMisTickets')),

    paso('#tablaMisTickets', '¡Estados del ticket!',
      `<p>El color de la columna <b>Estado</b> nos dice en qué va cada ticket:</p>${leyendaEstados}`, enMisTickets('#tablaMisTickets')),

    paso('#tablaMisTickets', '¡Ver el detalle!',
      `<p>¡Haciendo <b>clic sobre un ticket</b> se abre su detalle!</p>
       <ul>
         <li>Vemos la descripción, las imágenes y las respuestas de soporte.</li>
         <li>Podemos agregar comentarios.</li>
         <li>${esSoporte ? 'Podemos cambiar su estado: tomarlo, resolverlo, cancelarlo o reabrirlo.' : 'Si todavía está <b>Abierto</b>, podemos cancelarlo.'}</li>
       </ul>
       <p>Dentro del detalle también hay un botón <b>i</b> con su propio tutorial.</p>`, enMisTickets('#tablaMisTickets')),

    paso('#btnActualizarMisTickets', '¡Actualizar!',
      `<p>¡Vuelve a consultar la lista para ver si soporte ya respondió o cambió el estado de algún ticket!</p>
       <p>Puede volver a ver este tutorial cuando quiera con el botón <b>i</b> junto al título.</p>`, enMisTickets('#btnActualizarMisTickets')),
  ]);
}

// ===================================================================== GESTIÓN DE TICKETS (soporte)

export function pasosTutorialGestionTickets() : Step.StepOptions[] {
  return armar('tutorial-gestion-tickets', [
    paso(null, '¡Gestión de Tickets!',
      `<p>¡Aquí soporte ve los tickets de todos los usuarios, los toma, les responde y los cierra!</p>`),

    paso('#cantTickets', '¡Cantidad de Tickets!',
      `<p>Muestra cuántos tickets están <b>Abiertos</b> (sin atender), cuántos están <b>En revisión</b> y cuántos se <b>resolvieron en el mes</b>.</p>`),

    paso('#filtrosFecha', '¡Filtros por fecha!',
      `<p>Con <b>Año</b> y <b>Mes</b> vemos solo los tickets creados en ese periodo.</p>`),

    paso('#switchFinalizados', '¡Ver resueltos y cancelados!',
      `<p>Por defecto solo salen los tickets <b>pendientes</b> (abiertos y en revisión).</p>
       <p>Al activarlo también se muestran los <b>resueltos y cancelados</b>, por ejemplo para consultar o reabrir uno.</p>`),

    paso('#accionesFiltros', '¡Botones de búsqueda!',
      `<ul>
         <li><b>Mes Actual:</b> filtra los tickets de este mes.</li>
         <li><b>Limpiar:</b> quita los filtros de año y mes.</li>
         <li><b>Actualizar:</b> vuelve a consultar para ver los tickets nuevos.</li>
       </ul>`),

    paso('#filtrosColumna', '¡Filtros por columna!',
      `<p>Escribiendo en estos campos buscamos por número, asunto, tipo, persona, área o estado.</p>`),

    paso('#tablaTickets', '¡Tabla de Tickets!',
      `<p>¡Haciendo <b>clic sobre un ticket</b> se abre su detalle para atenderlo!</p>
       <p>El ícono <i class="pi pi-user-edit"></i> junto al nombre indica que el ticket lo registró soporte a nombre de esa persona.</p>
       <p>El color de la columna Estado indica en qué va:</p>${leyendaEstados}`),

    paso(null, '¡Cómo se atiende un ticket!',
      `<p>Dentro del detalle están los botones para cambiar el estado:</p>
       <ol>
         <li>${badge(EstadoTicket.ABIERTO, 'Abierto')} → <b>Tomar ticket</b> → ${badge(EstadoTicket.EN_REVISION, 'En revisión')}: el usuario sabe que ya lo estamos atendiendo.</li>
         <li><b>Marcar como resuelto</b> → ${badge(EstadoTicket.RESUELTO, 'Resuelto')}: hay que escribir la solución aplicada.</li>
         <li><b>Cancelar ticket</b> → ${badge(EstadoTicket.CANCELADO, 'Cancelado')}: hay que escribir el motivo.</li>
         <li>Un ticket resuelto o cancelado se puede <b>Reabrir</b> (vuelve a En revisión) escribiendo el motivo.</li>
       </ol>
       <p>Todo queda en el <b>seguimiento</b> del ticket, y el usuario lo ve en su pestaña "Mis tickets".</p>
       <p>Puede volver a ver este tutorial con el botón <b>i</b> junto al título.</p>`),
  ]);
}

// ===================================================================== DETALLE DEL TICKET (popup)

export interface ContextoTutorialDetalle {
  modoSoporte : boolean;
  tieneImagenes : boolean;
  /** Etiquetas de los botones de estado que se ven en este momento. */
  acciones : string[];
}

const explicacionAccion : { [etiqueta : string] : string } = {
  'Tomar ticket': 'pasa el ticket a <b>En revisión</b> para que el usuario sepa que ya lo están atendiendo.',
  'Marcar como resuelto': 'cierra el ticket como <b>Resuelto</b>. Primero escriba en el comentario la solución aplicada.',
  'Cancelar ticket': 'cierra el ticket sin resolverlo.',
  'Reabrir': 'vuelve a poner el ticket <b>En revisión</b>. Escriba el motivo en el comentario.',
};

export function pasosTutorialDetalleTicket({ modoSoporte, tieneImagenes, acciones } : ContextoTutorialDetalle) : Step.StepOptions[] {
  const textoCancelar = modoSoporte ? 'cierra el ticket sin resolverlo. Escriba el motivo en el comentario.' : 'si ya no lo necesita, lo cancela. Solo se puede mientras el ticket está <b>Abierto</b>.';
  const listaAcciones = acciones.map(a => `<li><b>${a}:</b> ${a === 'Cancelar ticket' ? textoCancelar : explicacionAccion[a] ?? ''}</li>`).join('');

  return armar('tutorial-detalle-ticket', [
    paso('#infoTicket', '¡Detalle del ticket!',
      `<p>Arriba vemos el <b>asunto</b> y el <b>estado</b> del ticket, y debajo su tipo, la fecha de creación${modoSoporte ? ' y quién lo reportó' : ''}.</p>`),

    paso('#descripcionTicket', '¡Descripción!',
      `<p>Es lo que se escribió al crear el ticket.</p>`),

    tieneImagenes && paso('#imagenesTicket', '¡Imágenes!',
      `<p>Haciendo <b>clic sobre una imagen</b> se ve en tamaño completo.</p>`),

    paso('#seguimientoTicket', '¡Seguimiento!',
      `<p>Aquí quedan los comentarios y cada cambio de estado, con quién lo hizo y cuándo.</p>
       <p>${modoSoporte ? 'El usuario ve este mismo seguimiento en su pestaña "Mis tickets".' : 'Aquí aparecen las respuestas de soporte.'}</p>`),

    paso('#campoComentario', modoSoporte ? '¡Comentario / solución!' : '¡Comentario!',
      modoSoporte
        ? `<p>Escriba aquí lo que se le responde al usuario, la <b>solución aplicada</b> o el motivo de un cambio de estado.</p>`
        : `<p>¿Algo más que contarle a soporte? Escríbalo aquí, por ejemplo si el problema volvió a pasar.</p>`),

    paso('#botones', '¡Botones!',
      `<ul>
         <li><b>Agregar comentario:</b> envía el comentario sin cambiar el estado.</li>
         ${listaAcciones}
       </ul>`),
  ]);
}
