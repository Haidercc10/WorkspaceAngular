import Step from 'shepherd.js/src/types/step';
import { armar, paso } from 'src/app/Tutoriales/Tutoriales_Comun';

/*
 * Tutorial de Pedidos de Productos (ReportePedidos_Zeus).
 * Se muestra en la ruta Pedidos-Zeus y en Reportes Consolidados (pestaña de pedidos).
 * Los elementos se ubican por su id en la plantilla del componente.
 */

export interface ContextoTutorialPedidosZeus {
  /** Ve el filtro de vendedor (todos menos el rol 2, que solo ve sus pedidos). */
  veFiltroVendedor : boolean;
  /** Puede abrir los procesos de la OT con doble clic (rol 1). */
  puedeVerOt : boolean;
  /** Ve el panel de Análisis (solo administradores, rol 1). */
  esAdministrador : boolean;
}

export function pasosTutorialPedidosZeus(ctx : ContextoTutorialPedidosZeus) : Step.StepOptions[] {
  const { veFiltroVendedor, puedeVerOt, esAdministrador } = ctx;

  return armar('tutorial-pedidos-zeus', [
    paso(null, 'Pedidos de Productos',
      `<p>Aquí verás los pedidos abiertos de Zeus (<b>Pendiente</b> y <b>Parcialmente satisfecho</b>): los que se deben entregar ya y los programados a futuro.</p>
       <p>La tabla aparece apenas llegan los pedidos; las órdenes de trabajo se completan unos segundos después.</p>`),

    paso('#kpisPedidos', 'Indicadores',
      `<p>Resumen de los pedidos que estás viendo:</p>
       <ul>
         <li><b>Valor pendiente:</b> lo que falta por facturar.</li>
         <li><b>Listo para facturar:</b> ítems cuyo stock sugerido cubre lo pendiente (el stock de un ítem se cuenta una sola vez aunque esté en varios pedidos).</li>
         <li><b>Vencidos</b>, <b>Próximos 30 días</b> y <b>Programados</b>: según la fecha de entrega.</li>
         <li><b>Sin OT:</b> ítems que aún no tienen orden de trabajo.</li>
       </ul>
       <p>Haz clic en una tarjeta para filtrar la tabla; otro clic quita el filtro.</p>`),

    esAdministrador && paso('#panelAnalisis', 'Análisis',
      `<p>Abre este panel para ver gráficas del valor pendiente por mes de entrega, por cliente y por vendedor.</p>
       <p>Las gráficas respetan los filtros que tengas aplicados.</p>`),

    paso('#filtrosPedidos', 'Filtros',
      `<p>Los filtros están por secciones: <b>Búsqueda</b>, <b>Cliente${veFiltroVendedor ? ' y vendedor' : ''}</b>, <b>Ubicación</b>, <b>Fechas</b> (rango de entrega, mes de creación y mes de entrega) y <b>Estado y semáforo</b>.</p>
       <p>Pasa el mouse sobre el ícono <i class="pi pi-question-circle"></i> de cada filtro para ver qué hace.</p>
       <p>Todo lo que filtres se aplica también a los indicadores, las gráficas y las exportaciones.</p>`),

    paso('#leyendaPedidos', 'Semáforo',
      `<ul>
         <li><b>Completo (verde):</b> el stock que le corresponde alcanza para todos los ítems del pedido.</li>
         <li><b>Parcial (azul):</b> alcanza para al menos un ítem. Esos ítems salen con fondo verde.</li>
         <li><b>Sin stock (rojo):</b> ningún ítem tiene stock disponible.</li>
       </ul>
       <p>Si varios pedidos piden el mismo ítem, el stock se reparte empezando por el más vencido.</p>`),

    paso('#pestanasPedidos', 'Por pedido o por ítem',
      `<p><b>Por pedido:</b> cada pedido con sus ítems.</p>
       <p><b>Por ítem:</b> cada ítem con todos los pedidos que lo piden, el stock sugerido para cada uno y a cuál conviene facturar primero:
       el más vencido o con la entrega más próxima; con la misma fecha, el cliente con menor plazo de pago; y luego el pedido más antiguo.</p>`),

    paso('#tablaPedidos', 'Pedidos',
      `<p>Cada pedido muestra su número, cliente, ciudad, fecha de entrega (en rojo si está vencido), valor pendiente y el botón para ver su <b>PDF</b>.</p>
       <p>Haz clic en un ítem para ver todo su detalle.${puedeVerOt ? ' Haz <b>doble clic</b> sobre la OT para ver sus procesos.' : ''}</p>
       <p>Con <b>Ordenar</b> cambias el orden de los pedidos y con <b>Columnas</b> eliges qué columnas ver (se recuerda para la próxima vez).</p>`,
      { attachTo: { element: '#tablaPedidos', on: 'top' } }),

    paso('#btnConsolidado', 'Consolidado de asesores',
      `<p>Facturación del mes anterior y del actual de cada asesor, junto con lo pendiente de sus pedidos (vencido, de este mes y futuro) y el proyectado del mes.</p>`),

    paso('#btnExportar', 'Exportar',
      `<p><b>PDF consolidado:</b> resumen e informe por vendedor, cliente y pedido.</p>
       <p><b>Excel detallado</b> y <b>Excel planeación de OT</b>: los pedidos que estás viendo.</p>`),
  ]);
}
