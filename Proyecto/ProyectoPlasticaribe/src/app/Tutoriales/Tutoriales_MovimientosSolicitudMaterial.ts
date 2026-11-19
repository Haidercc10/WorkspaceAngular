import Step from 'shepherd.js/src/types/step';
import { TutorialesService } from 'src/app/Servicios/Tutoriales/Tutoriales.service';
import { armar, paso } from 'src/app/Tutoriales/Tutoriales_Comun';

/*
 * Tutorial de Movimientos de Solicitudes de Material (Reporte_SolicitudMpExtrusion).
 * Los elementos se marcan en el HTML con `data-tutorial`. Los pasos del detalle necesitan una solicitud
 * seleccionada: si no hay, se selecciona la primera de la lista antes de mostrarlos.
 */

/** Clave del inicio automático. Subir la versión hace que el tutorial vuelva a salir solo a todos. */
export const ClaveTutorialMovimientosSolicitud = 'movimientos-solicitud-material-v1';

export interface ContextoTutorialMovimientosSolicitud {
  /** Asigna material y finaliza o cancela solicitudes. */
  puedeGestionar : boolean;
  /** Marca como verificadas las solicitudes finalizadas. */
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

export function pasosTutorialMovimientosSolicitud(ctx : ContextoTutorialMovimientosSolicitud) : Step.StepOptions[] {
  const conDetalle = (nombre : string) : Partial<Step.StepOptions> => ({
    beforeShowPromise: TutorialesService.prepararPantalla(ctx.seleccionarPrimera, el(nombre)),
  });

  return armar('tutorial-movimientos-solicitud', [
    paso(null, '¡Movimientos de solicitudes de material!',
      `<p>Aquí vemos las <b>solicitudes de material</b> que hacen los operarios para producir sus órdenes de trabajo.</p>
       ${ctx.puedeGestionar
         ? `<p>Desde aquí las <b>atendemos</b>: vemos qué materiales pidieron, <b>asignamos</b> lo que hay disponible y, si hace falta, las finalizamos o cancelamos.</p>`
         : `<p>Podemos consultar cada solicitud con sus materiales, lo pedido y lo entregado.</p>`}
       <p>Al entrar se cargan solas las solicitudes <b>activas</b> (pendientes y parciales).</p>`),

    paso(el('chipsEstado'), '¡Solicitudes por estado!',
      `<p>Cada botón muestra cuántas solicitudes hay en ese estado:</p>
       <ul>
         <li><b>Pendientes:</b> sin material entregado.</li>
         <li><b>Parciales:</b> con una parte entregada.</li>
         <li><b>Finalizadas:</b> con todo entregado (o cerradas a mano).</li>
         <li><b>Verificadas:</b> finalizadas y revisadas por el administrador o el superior de extrusión.</li>
         <li><b>Canceladas.</b></li>
       </ul>
       <p>Con un clic vemos <b>todas</b> las de ese estado, sin importar la fecha.</p>`),

    ctx.puedeAutorizarExceso && paso(el('autorizaciones'), '¡Autorizaciones de exceso!',
      `<p>Cuando alguien necesita asignar <b>más kg de los permitidos</b> en una OT, pide autorización.</p>
       <p>Aquí las vemos y las <b>aprobamos</b> o <b>rechazamos</b> (para rechazar hay que escribir el motivo).</p>`),

    paso(el('filtros'), '¡Filtros de búsqueda!',
      `<ul>
         <li><b>N° Solicitud:</b> busca esa solicitud exacta, sin importar fechas ni estados.</li>
         <li><b>OT</b>, <b>Creada desde / hasta</b> y los <b>estados</b>: con un clic marcamos o quitamos cada uno (podemos marcar varios).</li>
       </ul>
       <p>Si consultamos sin filtros vuelven las solicitudes activas. <b>Limpiar</b> borra los filtros.</p>`),

    paso(el('listaSolicitudes'), '¡Lista de solicitudes!',
      `<p>Arriba dice qué estamos viendo y cuántos resultados hay. Con un clic en el encabezado <b>N°</b>, <b>OT</b> o <b>Entrega</b> ordenamos la lista de menor a mayor; con otro clic, de mayor a menor.</p>
       <p>Hacemos <b>clic en una solicitud</b> para ver su detalle a la derecha; queda <b>resaltada</b>.</p>`),

    paso(enDetalle('resumenSolicitud'), '¡Resumen de la solicitud!',
      `<p>Muestra el <b>estado</b>, la OT con su cliente y referencia, el proceso, quién la pidió, cuándo y para cuándo la necesita.</p>
       <p>En <b>Máquinas</b> vemos a qué máquinas va el material y, si son varias, qué parte le toca a cada una.</p>`,
      conDetalle('resumenSolicitud')),

    paso(enDetalle('materialesSolicitud'), '¡Materiales solicitados!',
      `<p>Cada <b>subcategoría</b> es una fila‑título con lo <b>solicitado</b>, lo <b>entregado</b> y lo que <b>falta</b> (en rojo) o <b>Completa</b> (en verde).</p>
       <p>Debajo de cada una están los <b>materiales exactos</b> que pidió el solicitante, con su stock y lo entregado de cada uno.
       Si se entregó un material distinto de la misma subcategoría, sale marcado como <b>Sustituto</b>.</p>
       <p>Al final salen los <b>totales</b> de la solicitud.</p>`,
      conDetalle('materialesSolicitud')),

    paso(enDetalle('observacionSolicitud'), '¡Observación del solicitante!',
      `<p>El comentario que dejó quien hizo la solicitud.</p>`,
      conDetalle('observacionSolicitud')),

    paso(enDetalle('accionesSolicitud'), '¡Acciones!',
      `<ul>
         ${ctx.puedeGestionar ? `
         <li><b>Crear Asignación:</b> abre la ventana para entregar los materiales de esta solicitud.</li>
         <li><b>Finalizar:</b> la cierra con lo que se haya entregado.</li>
         <li><b>Cancelar:</b> la anula (lo ya entregado no se devuelve).</li>` : ''}
         ${ctx.puedeVerificar ? `<li><b>Marcar como Verificado:</b> confirma que una solicitud <b>finalizada</b> quedó bien entregada.</li>` : ''}
         ${ctx.puedeVerPdf ? `<li><b>Ver PDF:</b> abre el PDF de la solicitud.</li>` : ''}
       </ul>
       ${ctx.puedeGestionar ? `<p>Asignar, finalizar y cancelar solo se puede con solicitudes <b>pendientes o parciales</b>.</p>` : ''}
       <p>En las ventanas de confirmación, <b>Enter</b> acepta y <b>Esc</b> cancela. Después de cada acción la lista se actualiza y la solicitud sigue seleccionada.</p>
       <p>Puede volver a ver este tutorial cuando quiera con el botón <b>i</b> junto al título.</p>`,
      conDetalle('accionesSolicitud')),
  ]);
}
