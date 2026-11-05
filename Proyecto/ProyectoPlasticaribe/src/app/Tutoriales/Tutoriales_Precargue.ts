import Step from 'shepherd.js/src/types/step';
import { armar, paso } from 'src/app/Tutoriales/Tutoriales_Comun';

/*
 * Tutorial del Precargue de Rollos (precargue-rollos-despacho).
 * La página tiene una pestaña por precargue y cada una repite los mismos campos, así que los elementos se buscan
 * dentro de la pestaña activa (contenedor `#precargue-<key>`, marcados con el atributo `data-tutorial`).
 */

/** Clave del inicio automático. Subir la versión hace que el tutorial vuelva a salir solo a todos. */
export const ClaveTutorialPrecargue = 'precargue-rollos-v1';

export interface ContextoTutorialPrecargue {
  /** Key de la pestaña de precargue visible en este momento. */
  pestanaActiva : () => number | undefined;
  /** Si se ve el aviso "Quedan N precargues en proceso" con el botón "Abrir siguiente". */
  hayPrecarguesPendientes : boolean;
  maxPestanas : number;
}

export function pasosTutorialPrecargue({ pestanaActiva, hayPrecarguesPendientes, maxPestanas } : ContextoTutorialPrecargue) : Step.StepOptions[] {
  /** Elemento marcado con data-tutorial dentro de la pestaña activa (se resuelve al mostrar el paso). */
  const enPestana = (nombre : string) => () => `#precargue-${pestanaActiva()} [data-tutorial="${nombre}"]`;

  return armar('tutorial-precargue', [
    paso(null, '¡Precargue de Rollos!',
      `<p>¡Aquí armamos el <b>precargue</b>: la lista de rollos/bultos que se le van a despachar a un cliente!</p>
       <p>El proceso es:</p>
       <ol>
         <li>Elegimos el <b>cliente</b>.</li>
         <li><b>Escaneamos</b> los rollos/bultos uno por uno.</li>
         <li>Revisamos las tablas y presionamos <b>Generar Precargue</b>.</li>
       </ol>
       <p>Cada rollo queda <b>guardado al escanearlo</b>: si se cierra la página o se va la luz, no se pierde nada.</p>`),

    paso('#pestanasPrecargue .p-tabview-nav-container', '¡Pestañas!',
      `<p>Cada pestaña es un <b>precargue distinto</b>, así podemos ir armando varios al mismo tiempo (por ejemplo, para clientes diferentes).</p>
       <ul>
         <li>Con la pestaña <i class="pi pi-plus"></i> abrimos un precargue nuevo (máximo <b>${maxPestanas}</b> pestañas).</li>
         <li>Con la <b>X</b> cerramos una pestaña. Si el precargue ya tenía rollos <b>no se borra</b>: sigue en proceso y se puede retomar después.</li>
       </ul>`),

    hayPrecarguesPendientes && paso('#precarguesPendientes', '¡Precargues pendientes!',
      `<p>Hay precargues en proceso que no cupieron en las pestañas. Con <b>Abrir siguiente</b> los vamos abriendo cuando haya espacio.</p>`),

    paso(enPestana('consecutivo'), '¡Consecutivo!',
      `<p>Es el número del precargue. Sale vacío y se llena solo cuando escaneamos el <b>primer rollo/bulto</b>, que es cuando el precargue se crea.</p>`),

    paso(enPestana('cliente'), '¡Cliente! (obligatorio)',
      `<p>Escribimos el <b>nombre del cliente</b> y lo elegimos de la lista que aparece.</p>
       <p>Sin cliente no se pueden escanear rollos.</p>
       <p>Antes de generar el precargue se puede cambiar el cliente; al confirmar se avisa que los rollos se escanearon a nombre de otro.</p>`),

    paso(enPestana('clienteStock'), '¡Cliente Stock!',
      `<p>Lo marcamos cuando en la etiqueta del rollo/bulto dice que es de <b>Cliente Stock</b>.</p>
       <p>En ese caso, en el campo Cliente buscamos el <b>nombre real</b> del cliente al que se le va a despachar.</p>`),

    paso(enPestana('rollo'), '¡Rollo/Bulto!',
      `<p>¡Aquí <b>escaneamos</b> la etiqueta (o escribimos el número y presionamos <b>Enter</b>)!</p>
       <ul>
         <li>El primer rollo <b>crea el precargue</b> y le asigna el consecutivo.</li>
         <li>Cada rollo escaneado queda guardado de una vez.</li>
         <li>Si un rollo ya estaba en el precargue, sale un aviso y no se repite.</li>
       </ul>
       <p>El cursor vuelve solo a este campo para seguir escaneando.</p>`),

    paso(enPestana('observacion'), '¡Observación! (opcional)',
      `<p>Cualquier nota que deba ir con el precargue, por ejemplo indicaciones para el despacho.</p>`),

    paso(enPestana('botonesFormulario'), '¡Limpiar / Cancelar!',
      `<ul>
         <li><b>Limpiar campos / Limpiar todo:</b> antes de escanear el primer rollo, borran lo escrito para empezar de nuevo.</li>
         <li><b>Cancelar Precargue:</b> aparece cuando el precargue ya existe. Lo <b>anula</b> y todos sus rollos/bultos vuelven a estar <b>disponibles</b>.</li>
       </ul>`),

    paso(enPestana('tablaConsolidada'), '¡Referencias consolidadas!',
      `<p>Resumen por <b>item</b>: cuánta cantidad/peso neto, cuántos rollos y cuánto peso bruto llevamos de cada referencia.</p>
       <p>Nos sirve para comparar con lo que pidió el cliente.</p>`),

    paso(enPestana('tablaRollos'), '¡Rollos agregados!',
      `<p>Aquí aparece cada rollo/bulto escaneado, <b>el último arriba</b>.</p>
       <ul>
         <li>Con los campos de arriba de cada columna podemos buscar por rollo, OT, cliente, item, etc.</li>
         <li>Con el botón <i class="pi pi-trash"></i> <b>Quitar</b> lo sacamos del precargue y vuelve a quedar disponible.</li>
         <li>Si un rollo sale en <b class="text-danger">rojo</b> con <i class="pi pi-exclamation-triangle"></i>, es porque otro proceso ya lo movió: hay que quitarlo para poder generar el precargue.</li>
       </ul>`),

    paso(enPestana('botonGenerar'), '¡Generar Precargue!',
      `<p>Cuando estén todos los rollos, presionamos este botón y confirmamos.</p>
       <ul>
         <li>El precargue queda listo para despacho.</li>
         <li>Se abre el <b>PDF</b> de la orden de precargue en una pestaña nueva.</li>
         <li>La pestaña queda libre para empezar otro precargue.</li>
       </ul>
       <p>Se activa solo cuando hay rollos y ninguno está en rojo.</p>`),

    paso(null, '¡Retomar precargues!',
      `<p>Si dejamos precargues <b>en proceso</b>, al volver a entrar a esta página nos pregunta si los queremos retomar.</p>
       <p>También se pueden retomar desde el módulo de <b>movimientos de precargue</b>.</p>
       <p>Puede volver a ver este tutorial cuando quiera con el botón <b>i</b> junto al título.</p>`),
  ]);
}
