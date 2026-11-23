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
}

export function pasosTutorialPedidosZeus(ctx : ContextoTutorialPedidosZeus) : Step.StepOptions[] {
  const { veFiltroVendedor, puedeVerOt } = ctx;

  return armar('tutorial-pedidos-zeus', [
    paso(null, 'Pedidos de Productos',
      `<p>Aquí verás los pedidos abiertos de Zeus (<b>Pendiente</b> y <b>Parcialmente satisfecho</b>): los que se deben entregar ya y los programados a futuro.</p>
       <p>La tabla aparece apenas llegan los pedidos; las órdenes de trabajo se completan unos segundos después.</p>`),

    paso('#kpisPedidos', 'Indicadores',
      `<p>Resumen de los pedidos que estás viendo:</p>
       <ul>
         <li><b>Valor pendiente:</b> lo que falta por facturar.</li>
         <li><b>Listo para facturar:</b> ítems con stock suficiente.</li>
         <li><b>Vencidos</b>, <b>Próximos 30 días</b> y <b>Programados</b>: según la fecha de entrega.</li>
         <li><b>Sin OT:</b> ítems que aún no tienen orden de trabajo.</li>
       </ul>
       <p>Haz clic en una tarjeta para filtrar la tabla; otro clic quita el filtro.</p>`),

    paso('#panelAnalisis', 'Análisis',
      `<p>Abre este panel para ver gráficas del valor pendiente por mes de entrega, por cliente y por vendedor.</p>
       <p>Las gráficas respetan los filtros que tengas aplicados.</p>`),

    paso('#filtrosPedidos', 'Filtros',
      `<p>Busca por número de pedido, cliente, ítem, producto, orden de compra u OT, y combina los filtros de departamento, municipio, cliente${veFiltroVendedor ? ', vendedor' : ''} y rango de fecha de entrega.</p>
       <p>Los municipios se limitan a los departamentos elegidos. Los botones de <b>Estado</b> y <b>Semáforo</b> se activan y desactivan con un clic.</p>
       <p>Todo lo que filtres se aplica también a los indicadores, las gráficas y las exportaciones.</p>`),

    paso('#leyendaPedidos', 'Semáforo',
      `<ul>
         <li><b>Completo (verde):</b> todos los ítems del pedido tienen stock: se puede facturar completo.</li>
         <li><b>Parcial (azul):</b> al menos un ítem tiene stock. Esos ítems salen con fondo verde.</li>
         <li><b>Sin stock (gris):</b> ningún ítem tiene stock suficiente.</li>
       </ul>`),

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
