import Step from 'shepherd.js/src/types/step';
import { armar, paso } from 'src/app/Tutoriales/Tutoriales_Comun';

/*
 * Tutorial del Dashboard de Recaudos / Cartera (DashBoard-Recaudos).
 * Se muestra en Inicio (pestaña Recaudos) y en Reportes Consolidados (pestaña Cartera).
 * Los elementos se ubican por su id en la plantilla del dashboard.
 */

export interface ContextoTutorialRecaudos {
  /** Ve el filtro de Vendedor (roles 1, 69 y 103). */
  veFiltroVendedor : boolean;
}

export function pasosTutorialRecaudos(ctx : ContextoTutorialRecaudos) : Step.StepOptions[] {
  const { veFiltroVendedor } = ctx;

  return armar('tutorial-recaudos', [
    paso(null, '¡Dashboard Recaudos!',
      `<p>¡En este dashboard verás la cartera de la empresa: cuánto deben los clientes, qué tan antigua es esa deuda y a quién conviene cobrar primero!</p>
       <p>Al ingresar se carga automáticamente la cartera completa.</p>`),

    paso('#filtroCliente', '¡Filtro de Clientes!',
      `<p>¡Aquí puedes elegir uno o varios clientes para ver solo su cartera!</p>
       <p>Puedes escribir en la lista para buscarlos y marcar o desmarcar varios seguidos sin que la lista se cierre.</p>`),

    veFiltroVendedor && paso('#filtroVendedor', '¡Filtro de Vendedor!',
      `<p>¡Aquí puedes elegir un vendedor para ver solo la cartera de sus clientes!</p>`),

    paso('#filtroCarteraOriginal', '¡Cartera Original!',
      `<p>¡Marca esta opción para excluir las facturas con más de 1.000 días!</p>
       <p>Puedes hacer clic en la casilla o directamente sobre el texto <b>Cartera Original</b>.</p>`),

    paso('#botonesFiltros', '¡Acciones!',
      `<p><b>Consultar:</b> aplica los filtros seleccionados.</p>
       <p><b>Limpiar Campos:</b> quita los filtros para volver a consultar toda la cartera.</p>
       <p><b>PDF:</b> descarga la cartera organizada por vendedor y cliente, con los saldos según su antigüedad en días.</p>
       <p><b>Excel:</b> descarga la cartera detallada, por clientes y por vendedores, cada una en su propia hoja.</p>`),

    paso('#totalCartera', '¡Total Cartera!',
      `<p>¡Aquí verás el total que le deben los clientes a la empresa!</p>
       <p>En grande aparece abreviado en millones (<b>M</b>) y, debajo, el valor exacto.</p>`),

    paso('#btnDetalleCartera', '¡Detalle de la Cartera!',
      `<p>¡Haz clic en este botón para ver el detalle de la cartera!</p>
       <ul>
         <li>Cantidad de facturas y de clientes.</li>
         <li>Antigüedad de la deuda por días (1-30, 31-60, 61-90, 91-120 y +120), del verde al rojo según su urgencia.</li>
         <li>Cartera vencida y su porcentaje del total.</li>
         <li>Mayor deudor, para saber a quién cobrar primero.</li>
       </ul>
       <p>Si la información aún se está consultando, verás el mensaje <b>Cargando...</b></p>`,
      { attachTo: { element: '#btnDetalleCartera', on: 'left' } }),

    paso('#facturas', '¡Cartera Detallada!',
      `<p>¡Aquí verás cada una de las facturas pendientes por cobrar: cliente, ciudad, fechas de factura y vencimiento, saldo y vendedor!</p>
       <p>Puedes filtrar escribiendo en la parte superior de cada columna, y hacer <b>doble clic</b> sobre una factura para ver su trazabilidad (facturas desde febrero de 2024).</p>`,
      { attachTo: { element: '#facturas', on: 'top' } }),

    paso('#carteraVendedores', '¡Cartera por Vendedores!',
      `<p>¡En esta tabla verás el total que deben los clientes de cada vendedor!</p>`,
      { attachTo: { element: '#carteraVendedores', on: 'top' } }),

    paso('#carteraClientes', '¡Clientes en Cartera!',
      `<p>¡En esta tabla verás el total que debe cada cliente!</p>`,
      { attachTo: { element: '#carteraClientes', on: 'top' } }),
  ]);
}
