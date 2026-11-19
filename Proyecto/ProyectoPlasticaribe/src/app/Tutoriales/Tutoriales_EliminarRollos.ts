import Step from 'shepherd.js/src/types/step';
import { armar, paso } from 'src/app/Tutoriales/Tutoriales_Comun';

/*
 * Tutorial de Eliminar Rollos Producción (EliminarRollos_Produccion).
 * Los elementos se marcan con `data-tutorial` en la plantilla.
 */

export const ClaveTutorialEliminarRollos = 'eliminar-rollos-produccion-v1';

export interface ContextoTutorialEliminarRollos {
  /** TEMPORAL: el administrador ve el botón "Reenviar observación BagPro". */
  esAdmin : boolean;
}

const el = (nombre : string) => `[data-tutorial="${nombre}"]`;

/** Paso que resalta una tabla: el globo va arriba para no tapar las filas. */
const tabla = (nombre : string, titulo : string, texto : string) => paso(el(nombre), titulo, texto, { attachTo: { element: el(nombre), on: 'top' } });

export function pasosTutorialEliminarRollos(ctx : ContextoTutorialEliminarRollos) : Step.StepOptions[] {
  return armar('tutorial-eliminar-rollos', [
    paso(null, '¡Eliminar Rollos Producción!',
      `<p>¡En esta página se eliminan rollos de producción que todavía están <b>disponibles</b> (sin despachar ni enviar a Zeus)!</p>
       <p>El proceso es: <b>1.</b> consultar los rollos, <b>2.</b> pasar a la tabla de eliminar los que se van a borrar, <b>3.</b> indicar quién autoriza, el motivo y la observación, y <b>4.</b> eliminarlos.</p>
       <p>Los rollos eliminados también quedan marcados en <b>BagPro</b> con la observación.</p>`),

    paso(el('crearFalla'), '¡Crear Falla!',
      `<p>Si el motivo de la eliminación no existe en la lista de <b>Motivos</b>, créalo aquí. Al cerrar la ventana la lista se actualiza sola.</p>`),

    ctx.esAdmin && paso(el('reenviarBagPro'), '¡Reenviar observación a BagPro!',
      `<p><b>Temporal, solo administradores.</b> Vuelve a registrar en BagPro la observación de los rollos eliminados en el <b>rango de fechas</b> seleccionado, por si quedaron sin ella por un error.</p>
       <p>Se puede repetir sin problema: solo vuelve a escribir el mismo texto.</p>`),

    paso(el('fechas'), '¡Rango de Fechas!',
      `<p>Fechas de producción de los rollos a consultar. Por defecto trae los <b>últimos 30 días</b>.</p>`),

    paso(el('bodega'), '¡Bodega!',
      `<p>Opcional: consulta solo los rollos de un proceso (Extrusión, Impresión, Sellado...).</p>`),

    paso(el('ot'), '¡OT!',
      `<p>Opcional: consulta solo los rollos de una orden de trabajo. Presiona <b>Enter</b> para consultar de una vez.</p>`),

    paso(el('rollo'), '¡N° Rollo!',
      `<p>Opcional: busca un rollo específico por su número. También consulta con <b>Enter</b>.</p>`),

    paso(el('usuario'), '¡Usuario que Autoriza!',
      `<p>Persona que autorizó la eliminación. Es <b>obligatorio</b> para eliminar, pero no para consultar.</p>`),

    paso(el('motivo'), '¡Motivo!',
      `<p>Razón por la que se eliminan los rollos. Es <b>obligatorio</b> para eliminar; puedes escribir en el buscador de la lista para encontrarlo rápido.</p>`),

    paso(el('observacion'), '¡Observación!',
      `<p>Detalle de la eliminación. Es <b>obligatoria</b> y es el texto que queda registrado en BagPro.</p>
       <p>Si intentas eliminar sin llenar el usuario, el motivo o la observación, la página sube hasta el formulario y marca en <b>rojo</b> los campos que faltan.</p>`),

    paso(el('botonesConsulta'), '¡Consultar y Limpiar!',
      `<ul>
         <li><b>Consultar Rollos:</b> trae los rollos disponibles con los filtros. Cada consulta <b>reemplaza</b> la tabla de consultados (no se mezclan OTs de consultas anteriores).</li>
         <li><b>Limpiar Campos:</b> borra los filtros y deja las tablas como están.</li>
         <li><b>Limpiar Todo:</b> borra los filtros y vacía las tres tablas.</li>
       </ul>`),

    tabla('tablaConsultados', '¡Rollos Consultados!',
      `<p>Haz clic en la casilla de un rollo para pasarlo a la tabla de <b>Rollos a Eliminar</b>.</p>
       <p>La casilla del encabezado pasa <b>todos</b> los rollos visibles; si escribiste en los filtros de las columnas, solo pasa los filtrados.</p>
       <p>La cantidad se muestra en <b>Kg</b>, excepto los rollos de sellado en unidades o paquetes.</p>`),

    tabla('tablaEliminar', '¡Rollos a Eliminar!',
      `<p>Rollos que se van a eliminar. Haz clic en la casilla de un rollo para <b>devolverlo</b> a la tabla de consultados, o en la del encabezado para devolverlos todos (o los filtrados).</p>
       <p>Los rollos que pases aquí se conservan aunque hagas otra consulta.</p>`),

    tabla('tablaConsolidado', '¡Consolidado por Referencia!',
      `<p>Resumen de los rollos a eliminar agrupados por <b>OT, ítem y presentación</b>, con la cantidad total y el número de rollos.</p>
       <p>Revísalo antes de eliminar para confirmar que todo cuadra.</p>`),

    paso(el('eliminar'), '¡Eliminar Rollos!',
      `<p>Elimina los rollos de la tabla de <b>Rollos a Eliminar</b> después de pedir confirmación.</p>
       <p>Se eliminan todos o ninguno: si algún rollo ya no está disponible, se quita de la tabla y no se borra nada para que puedas intentarlo de nuevo.</p>
       <p>Si algo falla, el mensaje de error tiene un enlace <b>Ver detalles</b> con los rollos afectados y su OT.</p>`),
  ]);
}
