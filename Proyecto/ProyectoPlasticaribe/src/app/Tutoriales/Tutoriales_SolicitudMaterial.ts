import Step from 'shepherd.js/src/types/step';
import { armar, paso } from 'src/app/Tutoriales/Tutoriales_Comun';

/*
 * Tutorial de Solicitud de Material de Producción (SolicitudMP_Extrusion).
 * Los elementos se marcan en el HTML con el atributo `data-tutorial`, para no depender de ids que la página
 * también usa para otras cosas. Los pasos cambian según lo que el rol del usuario puede hacer.
 */

/** Clave del inicio automático. Subir la versión hace que el tutorial vuelva a salir solo a todos. */
export const ClaveTutorialSolicitudMaterial = 'solicitud-material-v1';

export interface ContextoTutorialSolicitudMaterial {
  /** Puede consultar y editar solicitudes existentes, y elegir el proceso (administradores). */
  esAdministrador : boolean;
  /** Puede crear la solicitud aunque supere el límite de kg de la OT (con confirmación). */
  puedeExcederLimite : boolean;
  /** Porcentaje adicional de kg permitido sobre los kg de la OT (p. ej. 5). */
  porcentajeAdicional : number;
}

const el = (nombre : string) => `[data-tutorial="${nombre}"]`;

export function pasosTutorialSolicitudMaterial({ esAdministrador, puedeExcederLimite, porcentajeAdicional } : ContextoTutorialSolicitudMaterial) : Step.StepOptions[] {
  return armar('tutorial-solicitud-material', [
    paso(null, '¡Solicitud de Material de Producción!',
      `<p>¡Aquí le pedimos al encargado del inventario el material que necesitamos para producir una <b>orden de trabajo (OT)</b>!</p>
       <p>El proceso es:</p>
       <ol>
         <li>Llenamos el encabezado: <b>proceso</b>, <b>OT</b>, <b>máquina</b>, <b>fecha de entrega</b> y, si queremos, una observación.</li>
         <li>Buscamos cada <b>subcategoría</b> de material, escribimos la <b>cantidad</b> y la agregamos a la tabla.</li>
         <li>Presionamos <b>Crear Solicitud</b>: se guarda y se descarga el <b>PDF</b> de la solicitud.</li>
       </ol>
       <p>Después, el encargado del inventario <b>asigna</b> los materiales a la OT.</p>`),

    esAdministrador && paso(el('solicitud'), '¡Editar una solicitud!',
      `<p>Para <b>modificar</b> una solicitud ya creada, escribimos su número y presionamos <b>Enter</b>.</p>
       <p>Se cargan su OT, máquina, fecha, observación y los materiales pedidos, y el botón cambia a <b>Editar Solicitud</b>.</p>
       <p>Solo se pueden editar solicitudes <b>pendientes o parciales</b>; las finalizadas o canceladas no.</p>`),

    paso(el('proceso'), '¡Proceso!',
      esAdministrador
        ? `<p>Elegimos el proceso en el que se va a usar el material:</p>
           <ul>
             <li><b>Extrusión:</b> se solicitan <b>materias primas</b>.</li>
             <li><b>Impresión, Empaque o Laminado:</b> se solicitan <b>tintas</b>.</li>
           </ul>
           <p>Al cambiarlo se recargan las máquinas y se limpia la subcategoría que estuviera cargada.</p>`
        : `<p>El proceso <b>se carga solo según su rol</b> y no se puede cambiar.</p>
           <p>En <b>Extrusión</b> se solicitan materias primas; en Impresión, Empaque y Laminado se solicitan tintas.</p>`),

    paso(el('ot'), '¡Orden de Trabajo!',
      `<p>Escribimos el número de la OT y presionamos <b>Enter</b>.</p>
       <p>Si existe, se carga su información en la tabla de abajo y sale un mensaje con los <b>kg que aún se pueden solicitar</b>.</p>
       <p>Con el botón <i class="pi pi-file-pdf"></i> de la derecha vemos el <b>PDF de la OT consultada</b>: se genera y, a los pocos segundos, se abre en una pestaña nueva.
       Se habilita solo después de consultar la OT, y si cambiamos el número hay que volver a presionar <b>Enter</b>.</p>`),

    paso(el('maquina'), '¡Máquina!',
      `<p>Elegimos la máquina donde se va a usar el material.</p>
       <p>Solo salen las máquinas del <b>proceso</b> elegido, y podemos escribir el número para encontrarla más rápido.</p>`),

    paso(el('fechaEntrega'), '¡Fecha de entrega!',
      `<p>Es la fecha en que <b>necesitamos</b> el material, para que el encargado del inventario sepa cuándo entregarlo.</p>
       <p>Es <b>obligatoria</b>: sin ella no se pueden buscar subcategorías ni guardar la solicitud. No se pueden elegir fechas pasadas.</p>`),

    paso(el('observacion'), '¡Observación!',
      `<p>Aquí podemos dejar un comentario general de la solicitud (hasta 2000 caracteres).</p>
       <p>Lo ve el encargado de entregar el material y sale en el PDF.</p>`),

    paso(el('tablaOT'), '¡Información de la OT!',
      `<p>Al consultar la OT vemos:</p>
       <ul>
         <li><b>Kg total OT:</b> los kg que se pueden solicitar para la OT (incluye un <b>${porcentajeAdicional}% adicional</b>).</li>
         <li><b>Kg solicitados:</b> lo pedido en otras solicitudes que todavía no se ha asignado.</li>
         <li><b>Kg por solicitar:</b> lo que todavía podemos pedir. Sale en <b>verde</b> si queda y en <b>rojo</b> si ya no.</li>
         <li><b>Kg asignados:</b> lo que ya se entregó. Con el botón <i class="pi pi-eye"></i> vemos el detalle de esos materiales y sus devoluciones.</li>
         <li><b>Kg restantes por asignar:</b> lo que falta por entregar de la OT.</li>
       </ul>`),

    paso(el('verSubcategorias'), '¡Ver Subcategorías y Materiales!',
      `<p>Muestra todas las subcategorías del proceso elegido con su <b>stock</b> y su <b>disponible</b>.</p>
       <p>Con el botón <i class="pi pi-eye"></i> de cada subcategoría vemos los materiales que la componen. Sirve para consultar antes de pedir.</p>`),

    paso(el('subcategoria'), '¡Subcategoría!',
      `<p>Aquí buscamos el material que vamos a pedir, <b>por su Id o por su nombre</b>:</p>
       <ul>
         <li><b>Por Id:</b> escribimos el número (desde 1 dígito).</li>
         <li><b>Por nombre:</b> escribimos al menos <b>3 letras</b>.</li>
       </ul>
       <p>La elegimos de la lista (o presionamos <b>Enter</b> si coincide exacto) y se llenan solos el <b>Id</b>, el <b>disponible</b>, el <b>stock</b> y la <b>unidad</b>.</p>
       <p>El campo se habilita cuando el encabezado está completo (proceso, OT consultada, máquina y fecha de entrega); si falta algo, al escribir nos dice qué.</p>
       <p>La <b>X</b> borra la subcategoría y sus datos para elegir otra.</p>`),

    paso(el('cantidad'), '¡Cantidad!',
      `<p>Escribimos cuánto necesitamos y presionamos <b>Enter</b> para agregarla a la tabla.</p>
       <p>Con <b>un clic</b> se selecciona todo el valor, así lo reemplazamos sin borrar.</p>`),

    paso(el('disponible'), '¡Disponible y Stock!',
      `<ul>
         <li><b>Stock:</b> lo que hay en el inventario de esa subcategoría.</li>
         <li><b>Disponible:</b> el stock menos lo que ya pidieron otras solicitudes y aún no se ha entregado.</li>
       </ul>
       <p>Podemos pedir más que el disponible, pero nos avisa y al guardar nos pide <b>confirmarlo</b>.</p>`),

    paso(el('botonesSubcategoria'), '¡Agregar!',
      `<ul>
         <li><b>Agregar:</b> pasa la subcategoría y la cantidad a la tabla de abajo. La cantidad debe ser mayor a cero y la misma subcategoría no se puede agregar dos veces.</li>
         <li><b>Limpiar Campos:</b> borra la subcategoría y la cantidad para empezar otra.</li>
       </ul>`),

    paso(el('tablaSolicitadas'), '¡Subcategorías solicitadas!',
      `<p>Aquí quedan los materiales que vamos a pedir, con lo <b>entregado</b> y lo <b>faltante</b> de cada uno (al editar una solicitud).</p>
       <p>Abajo está el <b>total</b> pedido.</p>`),

    paso(el('editarCantidad'), '¡Editar cantidad!',
      `<p>Haciendo <b>clic sobre la cantidad</b> de una fila podemos corregirla.</p>
       <p>Debe ser mayor a cero y, si ya tiene entregas, no puede ser menor a lo entregado.</p>`),

    paso(el('quitar'), '¡Quitar!',
      `<p>Con el botón <i class="pi pi-trash"></i> quitamos un material de la tabla; antes nos pide confirmar.</p>
       <p>Si ese material <b>ya tiene entregas</b>, el botón queda deshabilitado.</p>`),

    paso(el('botonesSolicitud'), esAdministrador ? '¡Crear o Editar Solicitud!' : '¡Crear Solicitud!',
      `<p>Al presionar <b>${esAdministrador ? 'Crear Solicitud / Editar Solicitud' : 'Crear Solicitud'}</b> se revisa que:</p>
       <ul>
         <li>El encabezado esté completo (con la <b>fecha de entrega</b>) y la OT consultada y <b>abierta</b>.</li>
         <li>En <b>Extrusión</b>, lo pedido no supere los <b>Kg por solicitar</b> de la OT. ${puedeExcederLimite
           ? 'Usted tiene permiso para pasarse: el sistema le pide <b>confirmarlo</b>.'
           : 'Si se pasa, no deja guardar y hay que pedir permiso al administrador.'}</li>
         <li>Si algo supera el <b>disponible</b>, pide confirmar.</li>
       </ul>
       <p>En las confirmaciones, <b>Enter</b> es <b>Sí</b> y <b>Esc</b> es <b>No</b>.</p>
       <p>Al guardar se descarga el <b>PDF</b> de la solicitud y la pantalla queda limpia. <b>Limpiar Todo</b> borra todo sin guardar.</p>
       <p>Puede volver a ver este tutorial cuando quiera con el botón <b>i</b> junto al título.</p>`),
  ]);
}
