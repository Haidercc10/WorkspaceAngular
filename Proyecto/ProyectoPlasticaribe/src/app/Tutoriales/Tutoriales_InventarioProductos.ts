import Step from 'shepherd.js/src/types/step';
import { TutorialesService } from 'src/app/Servicios/Tutoriales/Tutoriales.service';
import { armar, paso } from 'src/app/Tutoriales/Tutoriales_Comun';

/*
 * Tutorial del Inventario de Productos Terminados (modal-generar-inventario-zeus) y de su pestaña
 * "Inventario Por Bodegas" (Inventario-Productos-PBDD). Los elementos se marcan con el atributo `data-tutorial`.
 * Las dos pestañas principales y las sub-pestañas de bodegas dependen del rol, igual que precios y totales.
 */

/** Clave del inicio automático. Subir la versión hace que el tutorial vuelva a salir solo a todos. */
export const ClaveTutorialInventarioProductos = 'inventario-productos-v1';

export interface ContextoTutorialInventarioProductos {
  /** Rol del usuario (define pestañas, precios y totales visibles). */
  rol : number;
  /** Cambia a la pestaña "Inventario de Producto Terminado". */
  irPestanaProductos : () => void;
  /** Cambia a la pestaña "Inventario Por Bodegas". */
  irPestanaBodegas : () => void;
}

const el = (nombre : string) => `[data-tutorial="${nombre}"]`;

/** Sub-pestaña de "Inventario Por Bodegas" que está a la vista. */
const panelBodegaVisible = `${el('pestanasBodegas')} > .p-tabview > .p-tabview-panels > .p-tabview-panel:not([hidden])`;

export function pasosTutorialInventarioProductos(ctx : ContextoTutorialInventarioProductos) : Step.StepOptions[] {
  const { rol, irPestanaProductos, irPestanaBodegas } = ctx;
  const veProductos = ![86, 4].includes(rol);
  const veTotalStock = rol != 6;
  const vePrecios = ![6, 12].includes(rol);
  const editaCantMinima = rol == 1;
  const vePreciosBodegas = ![86, 4, 12].includes(rol);

  const enProductos = (selector : string) => ({ beforeShowPromise: TutorialesService.prepararPantalla(irPestanaProductos, selector) });
  const enBodegas = (selector : string) => ({ beforeShowPromise: TutorialesService.prepararPantalla(irPestanaBodegas, selector) });

  // Sub-pestañas de "Inventario Por Bodegas" que ve este rol (mismas condiciones del HTML).
  const subpestanas = [
    ![86, 4].includes(rol) && `<li><b>Inventario de Despacho:</b> la existencia de cada item en la bodega de despacho. Con la flecha <i class="pi pi-chevron-right"></i> vemos sus rollos/bultos disponibles.</li>`,
    ![86, 2].includes(rol) && `<li><b>Rollo a rollo Empaque:</b> cada rollo que está en Empaque, del más antiguo al más reciente.</li>`,
    ![4, 2].includes(rol) && `<li><b>Bulto a bulto Sellado:</b> cada bulto que está en Sellado, del más antiguo al más reciente.</li>`,
    ![86, 2].includes(rol) && `<li><b>Inventario Empaque:</b> lo que hay en Empaque sumado por item.</li>`,
    ![4, 2].includes(rol) && `<li><b>Inventario Sellado:</b> lo que hay en Sellado sumado por item.</li>`,
    ![2].includes(rol) && `<li><b>Inventario de Rollos:</b> los items de despacho que se manejan en <b>Kg</b>.</li>`,
    ![2].includes(rol) && `<li><b>Inventario de Bultos:</b> los items de despacho que se manejan en <b>unidades o paquetes</b>.</li>`,
    `<li><b>Inventario Comparativo:</b> por cada item, lo que hay en <b class="textBlue">Despacho</b> frente a lo que hay en el <b>Área de producción</b>, separado por OT.</li>`,
    ![86, 2].includes(rol) && `<li><b>Inventario Calidad:</b> los rollos/bultos que están en Calidad.</li>`,
    ![86, 2].includes(rol) && `<li><b>Inventario Reempaque:</b> los rollos/bultos que esperan reempaque.</li>`,
  ].filter(Boolean).join('');

  return armar('tutorial-inventario-productos', [
    paso(null, '¡Inventario de Productos Terminados!',
      `<p>¡Aquí consultamos el <b>inventario de producto terminado</b>!</p>
       <p>La página tiene ${veProductos ? '<b>dos pestañas</b>' : 'una pestaña'}:</p>
       <ul>
         ${veProductos ? `<li><b>Inventario de Producto Terminado:</b> las existencias de cada producto según <b>Zeus</b> (el sistema contable)${vePrecios ? ', con su precio y valor total' : ''}.</li>` : ''}
         <li><b>Inventario Por Bodegas:</b> lo que hay físicamente en <b>Plasticaribe</b>, rollo a rollo y bulto a bulto, separado por bodega (Despacho, Empaque, Sellado, Calidad...).</li>
       </ul>
       <p>Al entrar, la información se carga sola; no hace falta consultar.</p>`),

    veProductos && paso(`${el('pestanasPrincipales')} .p-tabview-nav`, '¡Pestañas!',
      `<p>Con estas pestañas cambiamos entre el inventario de <b>Zeus</b> y el inventario <b>Por Bodegas</b>.</p>
       <p>Primero veamos la pestaña de <b>Inventario de Producto Terminado</b>.</p>`,
      enProductos(`${el('pestanasPrincipales')} .p-tabview-nav`)),

    // ---------- Pestaña: Inventario de Producto Terminado (Zeus) ----------
    veProductos && veTotalStock && paso(el('totalStock'), '¡Total Stock!',
      `<p>Es el <b>valor total</b> (en pesos) de todo el inventario de producto terminado: la suma del <b>subtotal</b> (existencias × precio) de todos los productos.</p>`,
      enProductos(el('totalStock'))),

    veProductos && paso(el('exportarExcel'), '¡Exportar Excel!',
      `<p>Descarga la tabla en un archivo de <b>Excel</b>.</p>
       <p>Si escribimos algún <b>filtro</b> en la tabla, el Excel trae <b>solo los productos filtrados</b>; si no, trae todos.</p>`,
      enProductos(el('exportarExcel'))),

    veProductos && paso(el('tablaProductos'), '¡Tabla de productos!',
      `<p>Cada fila es un producto con existencias en Zeus:</p>
       <ul>
         <li><b>Item</b>, <b>Cliente</b>, <b>Referencia</b> y <b>Vendedor</b> del producto.</li>
         <li><b>Existencias</b> y su <b>Unidad</b> (Kg, Und, Paq...).</li>
         ${vePrecios ? '<li><b>Precio</b> de venta y <b>Subtotal</b> (existencias × precio).</li>' : ''}
         ${editaCantMinima ? '<li><b>Cant. Mínima:</b> el stock mínimo que debe haber del producto.</li>' : ''}
       </ul>
       <p>La celda de <b>Existencias</b> sale con fondo <b>azul</b>; si las existencias quedan <b>iguales o por debajo de la cantidad mínima</b> sale con fondo <b>rojo</b>, para saber qué producto hay que reponer.</p>`,
      enProductos(el('tablaProductos'))),

    veProductos && paso(el('filtrosProductos'), '¡Filtros y orden!',
      `<p>En la primera fila de la tabla escribimos para <b>filtrar</b> por cualquier columna; podemos combinar varios filtros.</p>
       <p>Haciendo <b>clic en el título</b> de una columna ordenamos de menor a mayor, y con otro clic de mayor a menor.</p>`,
      enProductos(el('filtrosProductos'))),

    veProductos && editaCantMinima && paso(el('tablaProductos'), '¡Cantidad mínima!',
      `<p>Para cambiar la <b>Cant. Mínima</b> de un producto hacemos <b>clic en su celda</b>, escribimos la cantidad y presionamos <b>Enter</b> para guardarla.</p>
       <p>Al guardar, la fila se vuelve a evaluar y, si las existencias quedan por debajo, pasa a <b>rojo</b>.</p>`,
      enProductos(el('tablaProductos'))),

    veProductos && vePrecios && paso(el('totalesProductos'), '¡Totales!',
      `<p>Al final de la tabla vemos el <b>valor total</b> del inventario (la suma de los subtotales), el mismo de <b>Total Stock</b>.</p>`,
      enProductos(el('totalesProductos'))),

    // ---------- Pestaña: Inventario Por Bodegas ----------
    paso(`${el('pestanasBodegas')} .p-tabview-nav`, '¡Inventario Por Bodegas!',
      `<p>Aquí el inventario se divide en <b>sub-pestañas</b>:</p>
       <ul>${subpestanas}</ul>
       <p>Algunas sub-pestañas cargan su información la primera vez que entramos a ellas; mientras tanto se ve el ícono de carga.</p>`,
      enBodegas(`${el('pestanasBodegas')} .p-tabview-nav`)),

    paso(panelBodegaVisible, '¡Tablas por item!',
      `<p>En las sub-pestañas que suman <b>por item</b> (Despacho, Empaque, Sellado, Rollos, Bultos y Comparativo):</p>
       <ul>
         <li>Con el selector de <b>columnas</b> elegimos qué columnas ver (Existencia, Área, Exis. Total, Precio, Ciudad, Peso Bruto...). También podemos <b>arrastrar</b> los títulos para cambiar el orden.</li>
         <li>Con la flecha <i class="pi pi-chevron-right"></i> de cada fila <b>desplegamos</b> sus rollos/bultos: número, OT, cantidad, peso, ubicación, proceso, turno y fecha.</li>
         <li>El botón verde de <b>Excel</b> descarga la sub-pestaña con las columnas elegidas.</li>
       </ul>`,
      enBodegas(panelBodegaVisible)),

    paso(panelBodegaVisible, '¡Tablas rollo a rollo!',
      `<p>En las sub-pestañas de <b>rollo a rollo</b>, <b>bulto a bulto</b>, <b>Calidad</b> y <b>Reempaque</b> cada fila es un rollo o bulto, con su OT, item, referencia${vePreciosBodegas ? ', precio y subtotal' : ''} y fecha.</p>
       <ul>
         <li>En la primera fila de la tabla escribimos para <b>filtrar</b>, y con clic en el título de una columna <b>ordenamos</b>.</li>
         <li>El botón <b>Exportar Excel</b> descarga la información de esa sub-pestaña.</li>
         <li>En <b>Calidad</b> y <b>Reempaque</b>, con <b>doble clic</b> sobre una fila vemos la <b>trazabilidad</b> del rollo/bulto (por dónde ha pasado).</li>
       </ul>
       ${vePreciosBodegas ? '<p>Al final de cada tabla vemos el <b>total</b> (en pesos) de lo que hay en esa bodega.</p>' : ''}`,
      enBodegas(panelBodegaVisible)),

    paso(null, '¡Listo!',
      `<p>Ya conocemos el inventario de productos terminados.</p>
       <p>Puede volver a ver este tutorial cuando quiera con el botón <b>i</b> junto al título.</p>`),
  ]);
}
