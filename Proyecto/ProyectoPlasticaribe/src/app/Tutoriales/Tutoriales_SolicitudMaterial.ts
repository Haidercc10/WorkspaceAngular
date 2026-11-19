import Step from 'shepherd.js/src/types/step';
import { armar, paso } from 'src/app/Tutoriales/Tutoriales_Comun';

/*
 * Tutorial de Solicitud de Material de Producción (SolicitudMP_Extrusion).
 * Los elementos se marcan en el HTML con el atributo `data-tutorial`, para no depender de ids que la página
 * también usa para otras cosas. Los pasos cambian según lo que el rol del usuario puede hacer.
 */

/** Clave del inicio automático. Subir la versión hace que el tutorial vuelva a salir solo a todos. */
export const ClaveTutorialSolicitudMaterial = 'solicitud-material-v2';

export interface ContextoTutorialSolicitudMaterial {
  /** Puede consultar y editar solicitudes existentes (solo administrador). */
  puedeEditar : boolean;
  /** Elige el proceso (los roles sin proceso fijo). */
  puedeElegirProceso : boolean;
  /** Puede crear la solicitud aunque supere el límite de kg de la OT (con confirmación). */
  puedeExcederLimite : boolean;
  /** Porcentaje adicional de kg permitido sobre los kg de la OT (p. ej. 5). */
  porcentajeAdicional : number;
}

const el = (nombre : string) => `[data-tutorial="${nombre}"]`;

export function pasosTutorialSolicitudMaterial({ puedeEditar, puedeElegirProceso, puedeExcederLimite, porcentajeAdicional } : ContextoTutorialSolicitudMaterial) : Step.StepOptions[] {
  return armar('tutorial-solicitud-material', [
    paso(null, '¡Solicitud de Material de Producción!',
      `<p>¡Aquí le pedimos al encargado del inventario el material que necesitamos para producir una <b>orden de trabajo (OT)</b>!</p>
       <p>El proceso es:</p>
       <ol>
         <li>Llenamos el encabezado: <b>proceso</b>, <b>OT</b>, <b>fecha de entrega</b> y una o varias <b>máquinas</b>.</li>
         <li>Con <b>Agregar subcategoría</b> elegimos la subcategoría y luego <b>los materiales exactos</b> con su cantidad.</li>
         <li>Si hay varias máquinas, repartimos el material entre ellas.</li>
         <li>Escribimos una observación (si queremos) y presionamos <b>Crear Solicitud</b>: se guarda y el aviso nos deja <b>verla en movimientos</b> o <b>generar su PDF</b>.</li>
       </ol>
       <p><b>Importante:</b> una solicitud creada <b>no se puede editar</b>; revise bien antes de guardar.
       Si se equivoca, puede <b>cancelarla</b> mientras no tenga material entregado y crear otra.</p>`),

    paso(el('misSolicitudes'), '¡Mis solicitudes pendientes!',
      `<p>Aquí vemos las solicitudes que <b>nosotros</b> creamos y que todavía no tienen material entregado.</p>
       <p>Si nos equivocamos en una, la <b>cancelamos</b> con <i class="pi pi-ban"></i> (pide confirmar) y creamos una nueva.
       Cuando ya tiene material entregado, solo quien asigna puede finalizarla o cancelarla.</p>`),

    puedeEditar && paso(el('solicitud'), '¡Editar una solicitud!',
      `<p>Como <b>administrador</b>, para <b>modificar</b> una solicitud ya creada escribimos su número y presionamos <b>Enter</b>.</p>
       <p>Se cargan su OT, máquinas con su reparto, fecha, observación y los materiales pedidos, y el botón cambia a <b>Editar Solicitud</b>.</p>
       <p>Mientras se edita, la <b>OT</b> y el <b>proceso</b> no se pueden cambiar. Solo se pueden editar solicitudes <b>pendientes o parciales</b>.</p>`),

    paso(el('proceso'), '¡Proceso!',
      puedeElegirProceso
        ? `<p>Elegimos el proceso en el que se va a usar el material:</p>
           <ul>
             <li><b>Extrusión:</b> se solicitan <b>materias primas</b>.</li>
             <li><b>Impresión, Empaque o Laminado:</b> se solicitan <b>tintas</b>.</li>
           </ul>
           <p>Al cambiarlo se recargan las máquinas y se quitan las máquinas y las subcategorías agregadas, porque eran del proceso anterior.</p>`
        : `<p>El proceso <b>se carga solo según su rol</b> y no se puede cambiar.</p>
           <p>En <b>Extrusión</b> se solicitan materias primas; en Impresión, Empaque y Laminado se solicitan tintas.</p>`),

    paso(el('ot'), '¡Orden de Trabajo!',
      `<p>Escribimos el número de la OT y presionamos <b>Enter</b>.</p>
       <p>Si existe, se carga su información en la tabla de abajo y, en Extrusión, sale un mensaje con los <b>kg que aún se pueden solicitar</b>.
       Si la OT está <b>cerrada</b> nos avisa de una vez y no deja pedirle materiales.</p>
       <p>Con el botón <i class="pi pi-file-pdf"></i> de la derecha vemos el <b>PDF de la OT consultada</b>.</p>`),

    paso(el('fechaEntrega'), '¡Fecha de entrega!',
      `<p>Es la fecha en que <b>necesitamos</b> el material. Es <b>obligatoria</b> y no se pueden elegir fechas pasadas.</p>`),

    paso(el('tablaOT'), '¡Información de la OT!',
      `<p>Al consultar la OT vemos su cliente y referencia, y a la derecha el <b>Kg total OT</b>: lo que se puede solicitar (incluye un <b>${porcentajeAdicional}% adicional</b>).</p>
       <ul>
         <li><b>Solicitud:</b> lo <b>solicitado</b> que aún no se ha asignado y lo que todavía podemos pedir (<b>por solicitar</b>, en verde si queda y en rojo si ya no).</li>
         <li><b>Asignación:</b> lo que ya se entregó y lo que falta por entregar. Con <b>Ver materiales asignados</b> vemos el detalle de lo entregado.</li>
         <li>La <b>barra</b> resume los kg de la OT: asignado, solicitado sin asignar y por solicitar.</li>
       </ul>`),

    paso(el('maquinas'), '¡Máquinas!',
      `<p>En la sección <b>Distribución por máquinas</b>, debajo de la OT, salen las máquinas del proceso como botones.
       Con <b>un clic</b> elegimos una máquina (queda marcada con <i class="pi pi-check"></i>) y con otro clic la quitamos; podemos elegir <b>varias</b>.</p>
       <p>Si no caben todas, la fila se desplaza <b>arrastrando</b> con el mouse, con la rueda o con las flechas de los lados.</p>`),

    paso(el('distribucion'), '¡Distribución por máquinas!',
      `<p>Con <b>una</b> máquina, todo el material va a ella.</p>
       <p>Con <b>varias</b>, cada máquina tiene su tarjeta donde escribimos el <b>porcentaje</b> o la <b>cantidad</b> (por ejemplo 2000 y 1000 de 3000).
       La cantidad aparece cuando agregamos materiales; antes sale un guion.
       Con <b>dos</b> máquinas, al cambiar una la otra se ajusta sola. <b>Repartir en partes iguales</b> divide el total por igual.</p>
       <p>Los porcentajes deben sumar <b>100%</b> para poder guardar.</p>`),

    paso(el('agregarSubcategoria'), '¡Agregar subcategoría!',
      `<p>Se habilita con el encabezado completo (OT consultada, fecha de entrega y máquinas). Abre una ventana con dos pasos:</p>
       <ol>
         <li><b>Subcategorías:</b> la lista con su <b>stock</b>, su <b>disponible</b> y lo que ya está en la solicitud. Hacemos clic en una.</li>
         <li><b>Materiales de la subcategoría:</b> la lista se desliza y salen sus materiales. Hacemos clic en un material y escribimos la <b>cantidad</b>;
           podemos escribir en <b>varios</b> y luego presionar <b>Agregar a la solicitud</b> (o Enter).</li>
       </ol>
       <p>Con la flecha <i class="pi pi-arrow-left"></i> (o la tecla <b>Esc</b>) regresamos a las subcategorías: la que elegimos queda <b>resaltada</b> para no perder el hilo. En las subcategorías, <b>Esc</b> cierra la ventana y, si ya agregamos materiales, <b>Enter</b> hace lo mismo que <b>Listo</b>.</p>
       <p>Si se nos olvidó algo, volvemos a buscar el material y escribimos lo que falta: <b>se suma</b> a lo que ya tenía.</p>`),

    paso(el('tablaSolicitadas'), '¡Subcategorías solicitadas!',
      `<p>Cada subcategoría es una <b>fila‑título</b> con el <b>total</b> de sus materiales y su <b>disponible</b>; debajo van sus materiales,
       donde podemos <b>corregir la cantidad</b> o quitar un material con <i class="pi pi-times"></i>.</p>
       <p>Con <i class="pi pi-trash"></i> quitamos la subcategoría completa. El <b>disponible</b> se pone en <b>rojo</b> si lo pedido lo supera.</p>
       <p>Al final sale el <b>total solicitado</b> y, en <b>Extrusión</b>, los kg por solicitar de la OT y cuántos quedarían después de guardar.</p>`),

    paso(el('observacion'), '¡Observación!',
      `<p>Un comentario general de la solicitud (hasta 2000 caracteres). Lo ve el encargado de entregar el material y sale en el PDF.</p>`),

    paso(el('botonesSolicitud'), puedeEditar ? '¡Crear o Editar Solicitud!' : '¡Crear Solicitud!',
      `<p>Al presionar <b>${puedeEditar ? 'Crear Solicitud / Editar Solicitud' : 'Crear Solicitud'}</b> se revisa que:</p>
       <ul>
         <li>El encabezado esté completo y la OT consultada y <b>abierta</b>.</li>
         <li>Cada material tenga una cantidad mayor a cero y la distribución por máquina sume <b>100%</b>.</li>
         <li>En <b>Extrusión</b>, lo pedido no supere los <b>Kg por solicitar</b> de la OT. ${puedeExcederLimite
           ? 'Usted tiene permiso para pasarse: el sistema le pide <b>confirmarlo</b>.'
           : 'Si se pasa, no deja guardar y hay que pedir permiso al administrador.'}</li>
         <li>Si algo supera el <b>disponible</b>, pide confirmar.</li>
       </ul>
       <p>En las ventanas de confirmación, <b>Enter</b> acepta y <b>Esc</b> cancela.</p>
       <p>Al guardar, la pantalla queda limpia y sale un aviso con dos opciones: <b>Ver en movimientos</b> (abre la solicitud en Movimientos de solicitudes) y <b>Generar PDF</b>. El PDF ya no se descarga solo. <b>Limpiar Todo</b> borra todo sin guardar (si hay cambios, pide confirmar).</p>
       <p>Puede volver a ver este tutorial cuando quiera con el botón <b>i</b> junto al título.</p>`),
  ]);
}
