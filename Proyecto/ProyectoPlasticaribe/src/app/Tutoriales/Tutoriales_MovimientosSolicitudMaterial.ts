import Step from 'shepherd.js/src/types/step';
import { TutorialesService } from 'src/app/Servicios/Tutoriales/Tutoriales.service';
import { armar, paso } from 'src/app/Tutoriales/Tutoriales_Comun';

/*
 * Tutorial de Movimientos de Solicitudes de Material (Reporte_SolicitudMpExtrusion).
 * Los elementos se marcan en el HTML con `data-tutorial`. Los pasos del detalle necesitan una solicitud
 * seleccionada: si no hay, se selecciona la primera de la lista antes de mostrarlos.
 */

/** Clave del inicio automático. Subir la versión hace que el tutorial vuelva a salir solo a todos. */
export const ClaveTutorialMovimientosSolicitud = 'movimientos-solicitud-material-v2';

export interface ContextoTutorialMovimientosSolicitud {
  /** Asigna material y cancela solicitudes. */
  puedeGestionar : boolean;
  /** Completa y finaliza la solicitud de la OT. */
  puedeGestionarOT : boolean;
  /** Verifica la solicitud de la OT finalizada. */
  puedeVerificar : boolean;
  puedeVerPdf : boolean;
  /** Aprueba o rechaza autorizaciones de exceso de kg de una OT. */
  puedeAutorizarExceso : boolean;
  /** Selecciona la primera solicitud de la lista si no hay una seleccionada (para los pasos del detalle). */
  seleccionarPrimera : () => void;
}

const el = (nombre : string) => `[data-tutorial="${nombre}"]`;

/** Resalta el elemento si ya está en pantalla; si no (no hay solicitudes), el panel del detalle. */
const enDetalle = (nombre : string) => () => document.querySelector(el(nombre)) ? el(nombre) : el('detalle');

/** El panel de la OT solo aparece al filtrar por OT; si no está, se resaltan los filtros. */
const panelOT = () => document.querySelector(el('panelOT')) ? el('panelOT') : el('filtros');

export function pasosTutorialMovimientosSolicitud(ctx : ContextoTutorialMovimientosSolicitud) : Step.StepOptions[] {
  const conDetalle = (nombre : string) : Partial<Step.StepOptions> => ({
    beforeShowPromise: TutorialesService.prepararPantalla(ctx.seleccionarPrimera, el(nombre)),
  });

  return armar('tutorial-movimientos-solicitud', [
    paso(null, 'Movimientos de solicitudes de materia prima',
      `<p>Aquí vemos las <b>solicitudes de materia prima</b> que hacen los operarios para producir sus órdenes de trabajo.</p>
       <p>Una OT puede tener <b>varias solicitudes</b> (se pide por partes) y se le puede solicitar hasta sus kg más un adicional.</p>
       ${ctx.puedeGestionar
         ? `<p>Desde aquí las <b>atendemos</b>: vemos qué materiales pidieron y <b>asignamos</b> lo que hay disponible.</p>`
         : `<p>Podemos consultar cada solicitud con sus materiales, lo pedido y lo entregado.</p>`}
       <p>Al entrar se cargan solas las solicitudes <b>activas</b> (pendientes y parciales).</p>`),

    paso(el('resumenSolicitudes'), '¡Resumen de solicitudes!',
      `<p>Con este botón vemos cuántas solicitudes hay en cada estado (es solo informativo; para consultarlas se usan los filtros):</p>
       <ul>
         <li><b>Pendientes:</b> sin material entregado.</li>
         <li><b>Parciales:</b> con una parte entregada.</li>
         <li><b>Completadas:</b> recibieron todo lo que pidieron, o su OT se completó. Ya no reciben más material.</li>
         <li><b>Finalizadas:</b> se cerró la asignación de materiales de su OT.</li>
         <li><b>Verificadas:</b> el solicitante comprobó lo recibido para la OT.</li>
         <li><b>Canceladas.</b></li>
       </ul>`),

    ctx.puedeAutorizarExceso && paso(el('autorizaciones'), 'Autorizaciones de exceso',
      `<p>Cuando alguien necesita asignar <b>más kg de los permitidos</b> en una OT, pide autorización.</p>
       <p>Aquí las vemos y las <b>aprobamos</b> o <b>rechazamos</b> (para rechazar hay que escribir el motivo).</p>`),

    paso(el('filtros'), 'Filtros de búsqueda',
      `<ul>
         <li><b>N° Solicitud:</b> busca esa solicitud exacta, sin importar fechas ni estados.</li>
         <li><b>OT:</b> muestra todas las solicitudes de esa OT, en cualquier estado, y el panel de la <b>solicitud de la OT</b>.</li>
         <li><b>Creada desde / hasta</b> y los <b>estados</b>: con un clic marcamos o quitamos cada uno (podemos marcar varios).</li>
       </ul>
       <p>Si consultamos sin filtros vuelven las solicitudes activas. <b>Limpiar</b> borra los filtros.</p>`),

    paso(panelOT, '¡Solicitud de la OT!',
      `<p>Al filtrar por OT aparece su panel: el estado de <b>todas</b> sus solicitudes, sus kg, el <b>tope</b> con el adicional, lo solicitado y lo asignado.
       La barra muestra lo asignado y la <b>marca</b> señala los kg de la OT.</p>
       <ul>
         ${ctx.puedeGestionarOT ? `
         <li><b>Completar OT:</b> aparece cuando lo asignado llega a los kg de la OT. Cierra sus solicitudes de materia prima y <b>no se puede deshacer</b>. Si se asigna hasta el tope, se completa sola.</li>
         <li><b>Finalizar OT:</b> cuando la OT está completada y ninguna solicitud está pendiente o parcial. Cierra la asignación de materiales de la OT.</li>` : ''}
         ${ctx.puedeVerificar ? `<li><b>Verificar OT:</b> después de finalizarla, confirma que se recibió físicamente el material.</li>` : ''}
         ${ctx.puedeVerPdf ? `<li><b>PDF de la OT:</b> un solo PDF con el resumen de la OT y una hoja por solicitud.</li>` : ''}
       </ul>`),

    paso(el('listaSolicitudes'), '¡Lista de solicitudes!',
      `<p>Arriba dice qué estamos viendo y cuántos resultados hay. Con un clic en el encabezado <b>N°</b>, <b>OT</b> o <b>Entrega</b> ordenamos la lista de menor a mayor; con otro clic, de mayor a menor.</p>
       <p>Hacemos <b>clic en una solicitud</b> para ver su detalle a la derecha; queda <b>resaltada</b>.</p>`),

    paso(enDetalle('resumenSolicitud'), '¡Resumen de la solicitud!',
      `<p>Muestra el <b>estado</b> de la solicitud y el de la <b>solicitud de su OT</b>, la OT con su cliente y referencia, el proceso, quién la pidió, cuándo y para cuándo la necesita.</p>
       <p>En <b>Máquinas</b> vemos a qué máquinas va el material y, si son varias, qué parte le toca a cada una.</p>`,
      conDetalle('resumenSolicitud')),

    paso(enDetalle('materialesSolicitud'), 'Materiales solicitados',
      `<p>Cada <b>subcategoría</b> es una fila‑título con lo <b>solicitado</b>, lo <b>entregado</b> y lo que <b>falta</b> (en rojo) o <b>Completa</b> (en verde).</p>
       <p>Debajo de cada una están los <b>materiales exactos</b> que pidió el solicitante, con su stock y lo entregado de cada uno.
       Si se entregó un material distinto de la misma subcategoría, sale marcado como <b>Sustituto</b>.</p>
       <p>Al final salen los <b>totales</b> de la solicitud.</p>`,
      conDetalle('materialesSolicitud')),

    paso(enDetalle('observacionSolicitud'), 'Observación del solicitante',
      `<p>El comentario que dejó quien hizo la solicitud.</p>`,
      conDetalle('observacionSolicitud')),

    paso(enDetalle('accionesSolicitud'), 'Acciones',
      `<ul>
         ${ctx.puedeGestionar ? `
         <li><b>Crear Asignación:</b> abre la ventana para entregar los materiales de esta solicitud.</li>
         <li><b>Cancelar:</b> la anula (lo ya entregado no se devuelve).</li>` : ''}
         ${ctx.puedeVerPdf ? `<li><b>Ver PDF:</b> abre el PDF solo de esta solicitud.</li>` : ''}
         <li><b>Solicitudes de la OT:</b> muestra todas las solicitudes de su OT con el panel de la OT.</li>
       </ul>
       ${ctx.puedeGestionar ? `<p>Asignar y cancelar solo se puede con solicitudes <b>pendientes o parciales</b>. Una solicitud ya no se finaliza sola: se finaliza con su OT.</p>` : ''}
       <p>En las ventanas de confirmación, <b>Enter</b> acepta y <b>Esc</b> cancela. Después de cada acción la lista se actualiza y la solicitud sigue seleccionada.</p>
       <p>Puede volver a ver este tutorial cuando quiera con el botón <b>i</b> junto al título.</p>`,
      conDetalle('accionesSolicitud')),
  ]);
}
