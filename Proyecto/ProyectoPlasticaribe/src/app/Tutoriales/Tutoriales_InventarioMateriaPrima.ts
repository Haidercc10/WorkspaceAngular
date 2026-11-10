import Step from 'shepherd.js/src/types/step';
import { TutorialesService } from 'src/app/Servicios/Tutoriales/Tutoriales.service';
import { armar, paso } from 'src/app/Tutoriales/Tutoriales_Comun';

/*
 * Tutorial del Reporte de Materia Prima / BOPP / Tintas (reporteMateriaPrima).
 * Los elementos del encabezado se marcan con el atributo `data-tutorial`. Las tablas se repiten en cada pestaña
 * (mismos ids), así que sus pasos buscan el elemento dentro de la pestaña visible. Los pasos cambian según el rol.
 */

/** Clave del inicio automático. Subir la versión hace que el tutorial vuelva a salir solo a todos. */
export const ClaveTutorialInventarioMateriaPrima = 'inventario-materia-prima-v1';

export interface ContextoTutorialInventarioMateriaPrima {
  /** Ve las pestañas de Materias Primas, Polietilenos y Tintas (si no, su primera pestaña es Biorientados). */
  veInventarioGeneral : boolean;
  /** Ve las pestañas de Bopps agrupados y Subcategorías. */
  veAgrupados : boolean;
  /** Puede crear materias primas (botón Crear). */
  puedeCrear : boolean;
  /** Tiene la columna Editar en la primera pestaña. */
  puedeEditarPrimeraPestana : boolean;
  /** Ve precios, subtotales y totales del pie de tabla. */
  vePrecios : boolean;
  /** Cambia a la primera pestaña para mostrar los pasos de la tabla. */
  irPrimeraPestana : () => void;
}

const el = (nombre : string) => `[data-tutorial="${nombre}"]`;

/** Elemento dentro de la pestaña visible (las pestañas inactivas quedan con el atributo hidden). */
const enPestana = (selector : string) => `.p-tabview-panel:not([hidden]) ${selector}`;

export function pasosTutorialInventarioMateriaPrima(ctx : ContextoTutorialInventarioMateriaPrima) : Step.StepOptions[] {
  const { veInventarioGeneral, veAgrupados, puedeCrear, puedeEditarPrimeraPestana, vePrecios, irPrimeraPestana } = ctx;
  /** Antes del paso cambia a la primera pestaña y espera a que el elemento se vea. */
  const enPrimeraPestana = (selector : string) => ({ beforeShowPromise: TutorialesService.prepararPantalla(irPrimeraPestana, enPestana(selector)) });

  return armar('tutorial-inventario-mp', [
    paso(null, '¡Inventario de Materia Prima!',
      `<p>¡Aquí consultamos el <b>inventario</b> de ${veInventarioGeneral ? '<b>materias primas, polietilenos, tintas</b> y ' : ''}<b>biorientados (BOPP)</b>!</p>
       <p>El proceso es:</p>
       <ol>
         <li>Elegimos el <b>rango de fechas</b> y presionamos <b>Consultar</b> (al entrar ya se consulta el <b>último año</b>).</li>
         <li>Revisamos cada <b>pestaña</b>, filtrando y eligiendo las columnas que necesitamos.</li>
         <li>Si hace falta, <b>exportamos a Excel</b> una pestaña o todo el inventario.</li>
       </ol>`),

    paso(el('rangoFechas'), '¡Rango de fechas!',
      `<p>Elegimos el periodo a consultar: primero el <b>día inicial</b> y luego el <b>día final</b>.</p>
       <ul>
         <li>Al entrar a la página ya viene cargado el <b>último año</b> (de hoy a un año atrás).</li>
         <li>Podemos elegir cualquier rango, pero <b>no días después de hoy</b>.</li>
         <li>Si elegimos solo un día, se consulta ese día. Si dejamos el campo vacío, se vuelve a tomar el último año.</li>
       </ul>
       <p>El rango afecta las columnas <b>Entrada</b> y <b>Salida</b>; el <b>Stock</b> siempre es la existencia actual.</p>`),

    paso(el('consultar'), '¡Consultar!',
      `<p>Después de cambiar el rango de fechas presionamos <b>Consultar</b> para traer el inventario de ese periodo.</p>
       <p>Se actualizan todas las pestañas a la vez.</p>`),

    paso(el('mostrarSinStock'), '¡Mostrar sin Stock!',
      `<p>Por defecto las tablas muestran <b>solo los materiales con stock mayor a cero</b>.</p>
       <ul>
         <li><b>Activado:</b> se muestran también los que tienen stock en cero.</li>
         <li><b>Desactivado:</b> se vuelven a ocultar.</li>
       </ul>
       <p>El cambio es inmediato, no hace falta volver a consultar. Los totales y el Excel tienen en cuenta lo que se está mostrando.</p>`),

    puedeCrear && paso(el('crear'), '¡Crear material!',
      `<p>Con <b>Crear</b> elegimos qué vamos a crear: una <b>materia prima</b> (polietilenos) o una <b>tinta</b> (tintas, chips y solventes).
       Los rollos de BOPP no se crean aquí, se registran desde la entrada de BOPP.</p>
       <ul>
         <li>Si nos equivocamos de opción, con la flecha <i class="pi pi-arrow-left"></i> junto al título del formulario volvemos a elegir.</li>
         <li>Los campos con <b>*</b> son obligatorios, entre ellos la <b>subcategoría</b>, que es la que usan las solicitudes de material. El botón de crear se habilita cuando están completos.</li>
         <li>En las tintas, el <b>color</b> se puede elegir en el cuadro de colores o escribir en hexadecimal (por ejemplo FF0000).</li>
         <li>No se puede repetir el nombre de un material que ya existe.</li>
         <li>Podemos crear varios seguidos. El material se crea con stock en cero; al cerrar la ventana el reporte se actualiza y se activa <b>Mostrar sin Stock</b> para verlo.</li>
       </ul>`),

    paso(el('exportarTodo'), '¡Exportar todo!',
      `<p>Descarga <b>un solo Excel</b> con <b>una hoja por cada pestaña</b>.</p>
       <p>Exporta todos los registros de cada pestaña, <b>sin tener en cuenta los filtros</b> de las tablas, y con las <b>columnas elegidas</b> en el selector de columnas.</p>`),

    paso('#materias-primas .p-tabview-nav', '¡Pestañas!',
      `<p>Cada pestaña muestra una parte del inventario:</p>
       <ul>
         ${veInventarioGeneral ? `<li><b>Materias Primas:</b> todo junto (polietilenos, tintas y biorientados).</li>
         <li><b>Polietilenos</b> y <b>Tintas:</b> solo ese tipo de material.</li>` : ''}
         <li><b>Biorientados:</b> los rollos de BOPP.</li>
         ${veAgrupados ? `<li><b>Bopps agrupados:</b> los rollos de BOPP sumados por genérico (ancho y micras).</li>
         <li><b>Subcategorías:</b> el stock${vePrecios ? ' y el valor' : ''} sumados por subcategoría.</li>` : ''}
       </ul>`),

    paso(enPestana('p-multiselect'), '¡Columnas!',
      `<p>Aquí elegimos qué columnas queremos ver en la tabla. Por defecto se ocultan algunas para que la tabla sea más fácil de leer:</p>
       <ul>
         <li><b>Inicial:</b> el inventario con el que inició el material.</li>
         <li><b>Entrada</b> y <b>Salida:</b> lo que entró y salió dentro del <b>rango de fechas</b>.</li>
         <li><b>Diferencia:</b> el stock actual menos el inventario inicial.</li>
       </ul>
       <p>Las columnas elegidas son también las que salen en el <b>Excel</b>.</p>`,
      enPrimeraPestana('p-multiselect')),

    paso(enPestana('.exportar-pestana'), '¡Exportar la pestaña!',
      `<p>Cada pestaña tiene su botón para exportar <b>solo esa pestaña</b> a Excel.</p>
       <p>A diferencia de <b>Exportar todo</b>, este botón <b>sí respeta los filtros</b> que hayamos escrito en la tabla, y también las columnas elegidas.</p>`,
      enPrimeraPestana('.exportar-pestana')),

    paso(enPestana('#filtros'), '¡Filtros y orden!',
      `<p>En la primera fila de la tabla escribimos para <b>filtrar</b> por cualquier columna; podemos combinar varios filtros.</p>
       <p>Haciendo <b>clic en el título</b> de una columna ordenamos de menor a mayor, y con otro clic de mayor a menor.</p>`,
      enPrimeraPestana('#filtros')),

    puedeEditarPrimeraPestana && paso(enPestana('th#editar'), '¡Editar!',
      `<p>Con el botón <i class="pi pi-pencil"></i> de cada fila abrimos una ventana para editar el material: nombre, descripción, categoría, subcategoría, stock, unidad${vePrecios ? ' y precios' : ''}.</p>
       <ul>
         <li>Los campos con <b>*</b> son obligatorios. La subcategoría no lo es, pero sin ella el material no aparece en Subcategorías ni en las solicitudes de material.</li>
         <li>Si cambiamos el <b>stock</b>, se registra un ajuste de entrada o salida.</li>
         <li>En los rollos de BOPP también se editan el ancho, las micras y su <b>BOPP genérico</b>; en las tintas, el <b>color</b>.</li>
       </ul>`,
      enPrimeraPestana('th#editar')),

    vePrecios && paso(enPestana('#totales'), '¡Totales!',
      `<p>En el pie de la tabla vemos el <b>stock total (Kg)</b> y el <b>valor total (COP)</b>, debajo de las columnas <b>Stock</b> y <b>SubTotal</b> (si están elegidas).</p>
       <p>Los totales suman <b>todos los registros filtrados</b>, no solo los de la página que estamos viendo.</p>`,
      enPrimeraPestana('#totales')),

    paso(enPestana('.p-paginator'), '¡Páginas!',
      `<p>Las tablas muestran <b>100 registros por página</b>; con las flechas o los números cambiamos de página.</p>
       <ul>
         <li>En la lista de la derecha podemos ver <b>25, 50, 100 o 200</b> por página.</li>
         <li>El texto <b>"Mostrando 1 a 100 de N registros"</b> nos dice cuántos registros hay en total (o cuántos quedaron al filtrar).</li>
       </ul>`,
      enPrimeraPestana('.p-paginator')),

    veAgrupados && paso('.tab-bopps-agrupados', '¡Bopps agrupados!',
      `<p>En esta pestaña los rollos de BOPP se suman por <b>genérico</b> (mismo ancho y micras): cuántos rollos hay y cuántos Kg.</p>
       <p>Con el botón <i class="pi pi-eye"></i> de cada genérico vemos sus <b>rollos</b>, con las entradas y salidas del <b>rango de fechas</b> consultado.</p>`),

    veAgrupados && paso('.tab-subcategorias', '¡Subcategorías!',
      `<p>Aquí vemos el stock${vePrecios ? ' y el valor' : ''} de los materiales <b>sumados por subcategoría</b>, y además:</p>
       <ul>
         <li><b>Cant. Reservada:</b> lo que ya se pidió en las <b>solicitudes de material de producción</b> pendientes o parciales y todavía no se ha asignado.</li>
         <li><b>Cant. Disponible:</b> el stock menos lo reservado. Sale en <b>rojo</b> si lo reservado supera el stock.</li>
       </ul>
       ${veInventarioGeneral ? `<p>Si una subcategoría tiene material reservado pero sus materiales no aparecen en las tablas (por ejemplo, todos con stock en cero), igual sale en la lista para que se vea lo que falta.</p>` : ''}
       <p>Con el botón <i class="pi pi-eye"></i> vemos los materiales que componen cada subcategoría.</p>`),

    paso(null, '¡Listo!',
      `<p>Ya conocemos el reporte de inventario.</p>
       <p>Puede volver a ver este tutorial cuando quiera con el botón <b>i</b> junto al título.</p>`),
  ]);
}
