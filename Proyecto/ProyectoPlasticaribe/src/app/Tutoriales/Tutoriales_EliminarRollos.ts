import Step from 'shepherd.js/src/types/step';
import { TutorialesService } from 'src/app/Servicios/Tutoriales/Tutoriales.service';
import { armar, paso } from 'src/app/Tutoriales/Tutoriales_Comun';

/*
 * Tutorial de Eliminar Rollos Producción (EliminarRollos_Produccion).
 * Los elementos se marcan con `data-tutorial` en la plantilla. La tabla de rollos a eliminar y el consolidado están
 * en pestañas: los pasos de cada una cambian primero a su pestaña con prepararPantalla.
 */

export const ClaveTutorialEliminarRollos = 'eliminar-rollos-produccion-v2';

export interface ContextoTutorialEliminarRollos {
  /** Cambia la pestaña de "Rollos a Eliminar" (0 = Rollos, 1 = Consolidado). */
  irPestana : (indice : number) => void;
  /** Hay rollos eliminados pendientes de marca en BagPro (se ve el aviso con "Reintentar BagPro"). */
  hayPendientesBagPro : boolean;
}

const el = (nombre : string) => `[data-tutorial="${nombre}"]`;

export function pasosTutorialEliminarRollos(ctx : ContextoTutorialEliminarRollos) : Step.StepOptions[] {
  /** Paso que primero muestra la pestaña indicada (el resto de la página no está en pestañas, pero se vuelve a la primera). */
  const enPestana = (pestana : number, nombre : string) => ({ beforeShowPromise: TutorialesService.prepararPantalla(() => ctx.irPestana(pestana), el(nombre)) });

  /** Paso que resalta una tabla: el globo va arriba para no tapar las filas. */
  const tabla = (nombre : string, titulo : string, texto : string, extra : Partial<Step.StepOptions> = {}) =>
    paso(el(nombre), titulo, texto, { attachTo: { element: el(nombre), on: 'top' }, ...extra });

  return armar('tutorial-eliminar-rollos', [
    paso(null, '¡Eliminar Rollos Producción!',
      `<p>¡En esta página se eliminan rollos de producción que todavía están <b>disponibles</b> (sin despachar ni enviar a Zeus)!</p>
       <p>Se trabaja en <b>4 pasos</b>, uno por cada recuadro numerado:</p>
       <ol>
         <li><b>Buscar</b> los rollos por OT o N° de rollo.</li>
         <li><b>Agregar</b> a la lista de eliminar los que corresponden.</li>
         <li><b>Revisar</b> la lista y su consolidado.</li>
         <li><b>Autorizar</b> (quién autoriza, motivo y observación) y <b>eliminar</b>.</li>
       </ol>
       <p>Los rollos eliminados también quedan marcados en <b>BagPro</b>.</p>`),

    ctx.hayPendientesBagPro && paso(el('reintentarBagPro'), '¡Rollos pendientes en BagPro!',
      `<p>Hay rollos que se eliminaron, pero no quedaron marcados en BagPro (por ejemplo, porque BagPro no respondió).</p>
       <p>Presiona <b>Reintentar BagPro</b> para marcar solo esos rollos. Se puede repetir sin problema y la lista se conserva aunque recargues la página.</p>`),

    paso(el('ot'), '¡OT!',
      `<p>Escribe la orden de trabajo de los rollos a eliminar y presiona <b>Enter</b> para consultar de una vez.</p>
       <p>Con OT o N° de rollo la búsqueda es en <b>todas las fechas</b>, así se encuentran también los rollos antiguos.</p>`),

    paso(el('rollo'), '¡N° Rollo!',
      `<p>Busca un rollo específico por su número. También consulta con <b>Enter</b>.</p>
       <p>Puedes combinarlo con la OT.</p>`),

    paso(el('bodega'), '¡Bodega!',
      `<p>Opcional: limita la búsqueda a un proceso (Extrusión, Impresión, Sellado...). Con la <b>✕</b> se quita.</p>`),

    paso(el('fechas'), '¡Rango de Fechas!',
      `<p>Solo se usa cuando <b>no</b> hay OT ni N° de rollo: trae los rollos producidos en ese rango (por defecto, los <b>últimos 30 días</b>).</p>
       <p>Al escribir una OT o un N° de rollo, el rango se desactiva.</p>`),

    paso(el('botonesConsulta'), '¡Consultar y Limpiar!',
      `<ul>
         <li><b>Consultar Rollos:</b> trae los rollos disponibles. Cada consulta <b>reemplaza</b> la tabla de disponibles; la lista de eliminar se conserva.</li>
         <li><b>Limpiar Filtros:</b> borra solo los filtros.</li>
         <li><b>Limpiar Todo:</b> borra filtros, tablas y autorización.</li>
       </ul>`),

    tabla('tablaConsultados', '¡Rollos Disponibles!',
      `<p>Marca los rollos con la <b>casilla</b> o haciendo <b>clic en la fila</b>. La casilla del encabezado marca todos.</p>
       <p>La flecha <i class="pi pi-arrow-down"></i> al final de cada fila pasa ese rollo directamente a la lista de eliminar.</p>
       <p>La cantidad está en <b>Kg</b>, excepto los rollos de sellado en unidades o paquetes. Abajo están los totales.</p>`),

    paso(el('barraDisponibles'), '¡Buscar y Agregar!',
      `<ul>
         <li><b>Buscar en la tabla:</b> filtra por cualquier dato que se ve (rollo, OT, ítem, referencia, fecha, proceso...).</li>
         <li><b>Agregar seleccionados:</b> pasa a la lista de eliminar los rollos marcados.</li>
         <li><b>Agregar todos:</b> pasa todos los que se ven con el buscador actual.</li>
       </ul>`),

    tabla('tablaEliminar', '¡Rollos a Eliminar!',
      `<p>Estos son los rollos que se van a eliminar. Revísalos bien.</p>
       <p>Para devolver un rollo a disponibles usa la <b>✕</b> de su fila, o márcalos y usa <b>Quitar seleccionados</b> / <b>Quitar todos</b>.</p>`,
      enPestana(0, 'tablaEliminar')),

    tabla('tablaConsolidado', '¡Consolidado por Referencia!',
      `<p>Resumen de los rollos a eliminar agrupados por <b>OT, ítem y unidad</b>, con la cantidad total y el número de rollos.</p>
       <p>Compáralo con lo que te pidieron eliminar antes de continuar.</p>`,
      enPestana(1, 'tablaConsolidado')),

    paso(el('usuario'), '¡Usuario que Autoriza!',
      `<p>Persona que autorizó la eliminación. Puedes escribir en el buscador de la lista.</p>`,
      enPestana(0, 'usuario')),

    paso(el('motivo'), '¡Motivo!',
      `<p>Razón por la que se eliminan los rollos; puedes escribir en el buscador de la lista.</p>
       <p>Si el motivo no existe, créalo con el botón <b>+</b>: al guardarlo queda seleccionado.</p>`),

    paso(el('observacion'), '¡Observación!',
      `<p>Detalle de la eliminación: quién lo solicitó y por qué. Queda registrado con los rollos eliminados.</p>`),

    paso(el('eliminar'), '¡Eliminar Rollos!',
      `<p>Antes de eliminar se muestra un <b>resumen</b> (rollos, OTs, cantidades, quién autoriza, motivo y observación) para confirmar.</p>
       <p>Se eliminan todos o ninguno: si algún rollo ya no está disponible, se quita de la lista y no se borra nada para que puedas intentarlo de nuevo.</p>
       <p>Si algo falla, el mensaje tiene un enlace <b>Ver detalles</b> con los rollos afectados y su OT.</p>`),
  ]);
}
