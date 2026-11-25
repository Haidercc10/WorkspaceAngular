import Step from 'shepherd.js/src/types/step';
import { TutorialesService } from 'src/app/Servicios/Tutoriales/Tutoriales.service';
import { armar, paso } from 'src/app/Tutoriales/Tutoriales_Comun';

/*
 * Tutorial de Crear Item (crear-producto).
 * Los elementos se marcan con `data-tutorial` en la plantilla. El recorrido pasa por las dos pestañas:
 * "Crear Item" y "Estado de Sincronización".
 */

export const ClaveTutorialCrearItem = 'crear-item-v2';

export interface ContextoTutorialCrearItem {
  /** Cambia a la pestaña indicada (0 Crear Item, 1 Estado de Sincronización). */
  irPestana : (indice : number) => void;
}

const el = (nombre : string) => `[data-tutorial="${nombre}"]`;

/** Elemento dentro de la pestaña visible (las pestañas inactivas quedan con el atributo hidden). */
const enPestana = (selector : string) => `.p-tabview-panel:not([hidden]) ${selector}`;

export function pasosTutorialCrearItem(ctx : ContextoTutorialCrearItem) : Step.StepOptions[] {
  /** Paso de la pestaña indicada: antes de mostrarse cambia a esa pestaña y espera a que el elemento se vea. */
  const enLaPestana = (indice : number, nombre : string, titulo : string, texto : string, lado : 'top' | 'bottom' | 'left' = 'bottom') =>
    paso(el(nombre), titulo, texto, {
      attachTo: { element: el(nombre), on: lado },
      beforeShowPromise: TutorialesService.prepararPantalla(() => ctx.irPestana(indice), enPestana(el(nombre))),
    });
  const crear = (nombre : string, titulo : string, texto : string, lado : 'top' | 'bottom' | 'left' = 'bottom') => enLaPestana(0, nombre, titulo, texto, lado);
  const sync = (nombre : string, titulo : string, texto : string) => enLaPestana(1, nombre, titulo, texto);

  return armar('tutorial-crear-item', [
    paso(null, 'Crear Item',
      `<p>En esta página se crean los <b>items nuevos</b> de una sola vez en los tres sistemas.</p>
       <ol>
         <li><b>BagPro</b> asigna el código (consecutivo) y guarda la ficha técnica.</li>
         <li><b>Plasticaribe</b> crea el producto automáticamente (por trigger).</li>
         <li><b>Zeus</b> crea el artículo con su presentación y precio.</li>
       </ol>
       <p>El proceso es: llenar la ficha (o copiarla de un item parecido), revisar el resumen de la derecha y pulsar <b>Crear Item</b>.</p>`),

    crear('copiar', 'Partir de un Item Existente',
      `<p>Si ya hay un item parecido, búscalo por <b>código</b> o por al menos <b>3 letras</b> del nombre.</p>
       <p>Al elegirlo, pulsa <b>Enter</b> o <b>Copiar Ficha</b>: se carga toda la ficha técnica, la presentación y el precio para que los cambies. El <b>nombre queda vacío</b> para que definas el del item nuevo.</p>
       <p>El item elegido queda bloqueado; para cambiarlo pulsa la <b>X</b> (eso también limpia la ficha). <b>Limpiar Campos</b> vacía todo.</p>`),

    crear('bloqueCliente', '1. Cliente y Producto',
      `<p><b>Cliente</b>, <b>formato</b>, <b>presentación</b> y <b>precio unitario</b> son obligatorios (marcados con *). El vendedor es opcional.</p>
       <p>Si la presentación es <b>Paquete</b>, se pide también la cantidad por paquete.</p>
       <p>Cuando el formato es <b>Camisilla</b>, aparecen opciones de biodegradable (<b>talla</b>, <b>Eco/Especial</b>, <b>Arroz/Azúcar</b> y <b>cantidad</b>) que solo sirven para armar el nombre.</p>`),

    crear('bloqueMaterial', '2. Material y Medidas',
      `<p><b>Material</b> y <b>mezcla</b> son obligatorios. Luego el pigmento, la unidad de medida y las medidas: <b>ancho</b>, <b>largo</b> (obligatorio en bolsa, camisilla, precorte y hoja), <b>fuelle</b> y <b>calibre</b>.</p>
       <p>El botón junto a la mezcla muestra sus <b>capas, materiales y pigmentos</b> y permite ajustarlos <b>solo para este item</b> (la mezcla predefinida no cambia).</p>
       <p>En las <b>láminas</b> se puede marcar <b>Largo continuo</b>: el largo deja de ser obligatorio.</p>`),

    crear('procesos', '3. Procesos',
      `<p>Activa con un clic los procesos que lleva el item: <b>Extrusión</b>, <b>Impresión</b>, <b>Laminado</b>, <b>Sellado</b> y <b>Corte</b>.</p>
       <p>Cada proceso activo despliega debajo sus propios campos: en Impresión el tipo, las <b>tintas</b>, el <b>código de barras</b> y las <b>repeticiones</b>; en Sellado el tipo de sellado, bulto y perforación; en Corte el <b>paso entre guías</b>, la <b>ubicación de la guía</b> y el <b>desembobinado final</b> (se elige con su imagen y sale en el PDF de la OT).</p>
       <p>Si lleva impresión, el nombre usa la <b>descripción comercial</b> que escribas.</p>`),

    crear('bloqueObservacion', '4. Observación',
      `<p>Nota opcional que queda guardada con el item en BagPro.</p>`, 'top'),

    crear('nombre', 'Nombre del Item',
      `<p>El nombre se <b>sugiere solo</b> mientras llenas la ficha (formato, material, medidas, calibre, densidad y pigmento).</p>
       <p>Puedes editarlo a mano; si quieres volver a la sugerencia, pulsa <b>Sugerir</b>.</p>
       <p>Si ya existe un item con el <b>mismo nombre</b>, no se deja crear.</p>`, 'left'),

    crear('medidas', 'Vista Rápida',
      `<p>Dibujo de la bolsa con sus medidas. Cambia según el formato (la camisilla sale con asas) y, si lleva impresión, muestra un arte con los colores de las tintas elegidas.</p>`, 'left'),

    crear('pendientes', 'Pendientes',
      `<p>Lista lo que falta por llenar para poder crear el item. Cuando todo está completo se pone en verde.</p>`, 'left'),

    crear('destinos', 'Se Creará En',
      `<p>Muestra dónde se va a crear el item: BagPro (código automático), Plasticaribe (por trigger) y Zeus (con la presentación y el precio).</p>`, 'left'),

    crear('acciones', 'Crear Item',
      `<p>Al pulsar <b>Crear Item</b> sale una confirmación con el <b>consecutivo estimado</b> y, si hay items con una ficha técnica igual, la lista de <b>similares</b> (solo es un aviso).</p>
       <p>El consecutivo puede cambiar si otra persona crea un item al mismo tiempo; el definitivo se muestra en el resultado.</p>
       <p>Si algún sistema falla (por ejemplo Zeus), el item queda creado en los demás y se completa desde la pestaña <b>Estado de Sincronización</b>.</p>`, 'top'),

    sync('buscarSync', 'Estado de Sincronización',
      `<p>Aquí revisas si un item está completo en <b>BagPro</b>, <b>Plasticaribe</b> y <b>Zeus</b>.</p>
       <p>Búscalo por código o nombre y pulsa <b>Consultar Estado</b> (o <b>Enter</b>).</p>
       <p>Si le faltan artículos en Zeus, aparece el botón <b>Completar en Zeus</b>, que crea solo lo que falta con el precio de BagPro (repetirlo es seguro).</p>`),

    paso(null, 'Tarjetas y Nuevas Presentaciones',
      `<p>Después de consultar se ve una <b>tarjeta por sistema</b> con lo que tiene el item en cada uno, y un resumen de cuántos sistemas están al día.</p>
       <p>Debajo puedes <b>agregar otra presentación</b> al item (Kilo, Unidad, Paquete o MTS) con su precio: se crea en BagPro, Plasticaribe y Zeus después de confirmar.</p>`),
  ]);
}
