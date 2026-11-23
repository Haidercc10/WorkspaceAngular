import Step from 'shepherd.js/src/types/step';
import { armar, paso } from 'src/app/Tutoriales/Tutoriales_Comun';

/*
 * Tutorial de Asignación de Materia Prima (asignacion-materia-prima).
 * Tiene dos recorridos: la asignación de una solicitud (popup del reporte o solicitud consultada en la página)
 * y la asignación manual, sin solicitud, de la página directa. Elementos marcados con `data-tutorial`.
 */

/** Clave del inicio automático de la asignación por solicitud (popup del reporte). */
export const ClaveTutorialAsignacionSolicitud = 'asignacion-material-v2';

/** Clave del inicio automático de la asignación manual (página directa). */
export const ClaveTutorialAsignacionManual = 'asignacion-material-manual-v1';

export interface ContextoTutorialAsignacion {
  /** Hay una solicitud cargada: se asigna por sus subcategorías y materiales. */
  esSolicitud : boolean;
  /** Está dentro del popup del reporte. */
  modoPopup : boolean;
  /** Puede asignar por encima del límite de kg de la OT (con confirmación). */
  puedeExcederLimite : boolean;
}

const el = (nombre : string) => `[data-tutorial="${nombre}"]`;

/** Resalta el elemento si está en pantalla; si no, el paso sale centrado. */
const siExiste = (nombre : string) => () => document.querySelector(el(nombre)) ? el(nombre) : el('sin-elemento');

/** Texto del flujo cuando la asignación supera los kg permitidos de la OT, según el permiso del usuario. */
const textoExceso = (puedeExcederLimite : boolean) => puedeExcederLimite
  ? 'Si la asignación supera los <b>kg permitidos de la OT</b>, usted puede continuar <b>confirmándolo</b>.'
  : 'Si la asignación supera los <b>kg permitidos de la OT</b>, sale una ventana para <b>pedir autorización</b> con el motivo; cuando la aprueben, vuelva a asignar.';

export function pasosTutorialAsignacion(ctx : ContextoTutorialAsignacion) : Step.StepOptions[] {
  return ctx.esSolicitud ? pasosPorSolicitud(ctx) : pasosManual(ctx);
}

/** Asignación de una solicitud: se entregan los materiales que pidió el solicitante. */
function pasosPorSolicitud(ctx : ContextoTutorialAsignacion) : Step.StepOptions[] {
  return armar('tutorial-asignacion-solicitud', [
    paso(null, 'Asignar material de una solicitud',
      `<p>Aquí <b>entregamos</b> el material que pidió el solicitante: escribimos cuánto damos de cada material y creamos la asignación.</p>
       <p>Se descuenta del inventario y la solicitud queda <b>parcial</b> o <b>completada</b> según lo entregado (y si la OT llega a su tope con el adicional, se completa sola). La solicitud y la OT están en el título de la ventana.</p>`),

    paso(el('encabezadoAsignacion'), 'Fecha de entrega',
      `<p>Cuándo se entrega el material (por defecto hoy).</p>`),

    paso(el('tablaOTAsignacion'), 'Información de la OT',
      `<p>El cliente y la referencia de la OT, sus kg permitidos, lo ya asignado y lo que <b>resta</b> (en rojo si ya no queda).</p>`),

    paso(el('maquinasAsignacion'), 'Máquina que recibe',
      `<p>Cada asignación va a <b>una</b> máquina. Si la solicitud tiene una sola, ya viene elegida.</p>
       <p>Con varias, cada botón muestra su <b>parte</b> (%) y cuánto ha recibido de lo que le toca; con un clic elegimos a cuál entregamos.
       Viene elegida la primera que todavía tiene faltante.</p>
       <p>El reparto es <b>informativo</b>: si una máquina recibe más de su parte, solo se avisa.</p>`),

    paso(siExiste('observacionSolicitante'), 'Observación del solicitante',
      `<p>Si quien pidió el material dejó un comentario, sale aquí para tenerlo en cuenta al entregar.</p>`),

    paso(el('llenarFaltante'), 'Llenar con lo faltante',
      `<p>Propone en cada material <b>lo menor entre lo que le falta y su stock</b>, sin pasar lo que falta de su subcategoría. Solo llena los campos vacíos.</p>
       <p>Con varias máquinas propone solo la <b>parte de la máquina elegida</b>; a la última que le falta le propone todo lo que queda.</p>
       <p>Si a un material no le alcanza el stock, nos avisa. <b>Borrar cantidades</b> deja todo en cero.</p>`),

    paso(el('subcategoriasAsignar'), 'Materiales por subcategoría',
      `<p>Cada subcategoría es una fila‑título con lo <b>pedido</b>, lo <b>entregado</b> y lo que <b>falta</b>; debajo van los materiales que pidió el solicitante.
       Con <i class="pi pi-bolt"></i> <b>Llenar</b> llenamos solo esa subcategoría.</p>
       <p>En <b>A asignar</b> escribimos cuánto entregamos de cada material (podemos llenar varios). En la fila‑título sale el total a asignar, en <b>rojo</b> si nos pasamos de lo que falta.</p>
       <p>Si un material no tiene stock, con <b>Agregar otro material de esta subcategoría</b> agregamos uno equivalente; sale marcado como <b>Sustituto</b>.</p>`),

    paso(el('crearAsignacion'), 'Crear la asignación',
      `<p>Abajo escribimos la <b>observación de la entrega</b> (opcional) y vemos el resumen: cuánto vamos a asignar y a qué máquina, o qué falta para poder asignar.</p>
       <p>Al presionar <b>Crear Asignación</b> se revisa que cada cantidad sea mayor a cero, que no pase el <b>stock</b> del material
       ni lo que <b>falta</b> de su subcategoría. Luego sale un <b>resumen</b> para confirmar (<b>Enter</b> crea la asignación y <b>Esc</b> vuelve para revisar).</p>
       <p>Al crearla, la ventana <b>sigue abierta</b> con lo entregado al día y un aviso con <b>Generar PDF</b> y, si otra máquina tiene faltante, <b>Asignar a máquina N</b>.</p>
       <p>${textoExceso(ctx.puedeExcederLimite)}</p>
       <p>Puede volver a ver este tutorial con el botón <b>i</b>${ctx.modoPopup ? ' de esta ventana' : ' junto al título'}.</p>`),
  ]);
}

/** Asignación manual (sin solicitud) de la página directa. */
function pasosManual(ctx : ContextoTutorialAsignacion) : Step.StepOptions[] {
  return armar('tutorial-asignacion-manual', [
    paso(null, 'Asignación de Materia Prima',
      `<p>Aquí entregamos materia prima o tintas a una <b>orden de trabajo</b>.</p>
       <p>Lo normal es asignar desde <b>Movimientos de solicitudes de materia prima</b>, con el botón <b>Crear Asignación</b> de cada solicitud.
       Esta página también permite asignar <b>sin solicitud</b>.</p>`),

    paso(el('solicitudAsignacion'), 'Asignar una solicitud',
      `<p>Si escribimos el N° de una solicitud y presionamos <b>Enter</b>, se cargan sus materiales para entregarlos (igual que desde el reporte).</p>
       <p>La <b>X</b> quita la solicitud y vuelve a la asignación manual.</p>`),

    paso(el('encabezadoAsignacion'), 'Datos de la entrega',
      `<ul>
         <li><b>Fecha entrega:</b> cuándo se entrega el material.</li>
         <li><b>OT:</b> escribimos el número y presionamos <b>Enter</b> para consultarla.</li>
         <li><b>Máquina:</b> el número de la máquina que recibe el material.</li>
         <li><b>Observación:</b> opcional.</li>
       </ul>`),

    paso(el('tablaOTAsignacion'), 'Información de la OT',
      `<p>Los kg permitidos de la OT, lo ya asignado y lo que <b>resta</b>.</p>`),

    paso(el('formularioMaterial'), 'Seleccionar materia prima',
      `<p>Buscamos el material por su nombre o Id; se llenan su stock, unidad y proceso.</p>
       <p>Escribimos la <b>cantidad</b> y presionamos <b>Enter</b> o <b>Agregar Materia Prima</b>. No puede ser cero ni pasar el stock.</p>`),

    paso(el('tablaManual'), 'Materias primas a asignar',
      `<p>Aquí quedan los materiales elegidos. Podemos corregir la <b>cantidad</b> o quitarlos con <i class="pi pi-trash"></i>.</p>`),

    paso(el('botonesManual'), 'Asignar',
      `<p><b>Asignar Materia Prima</b> revisa el formulario, la OT (debe estar abierta) y que las cantidades no pasen el stock.</p>
       <p>${textoExceso(ctx.puedeExcederLimite)}</p>
       <p><b>Limpiar Todo</b> borra la pantalla. Puede volver a ver este tutorial con el botón <b>i</b> junto al título.</p>`),
  ]);
}
