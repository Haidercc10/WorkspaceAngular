import Step from 'shepherd.js/src/types/step';

export const builtInButtons = {
  cancel: {
    classes: 'p-button p-button-secondary mr-2',
    text:  `<i class="pi pi-times mr-2"></i> <b> Cerrar</b>`,
    type: 'cancel',
  },
  next: {
    classes: 'p-button p-button-danger',
    text:  `<i class="pi pi-arrow-right mr-2"></i> <b> Siguiente</b>`,
    type: 'next'
  },
  back: {
    classes: 'p-button p-button-secondary',
    text: '<i class="pi pi-arrow-left mr-2"></i> <b> Atrás</b>',
    type: 'back'
  },
};

export const defaultStepOptions: Step.StepOptions = {
  classes: '',
  scrollTo: true,
  cancelIcon: {
    enabled: true
  }
};

/**************************************************************** BODEGAS **********************************************************************************/
export const stepsBodegas : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#formulario',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.next,
    ],
    classes: 'card',
    id: 'formulario',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Filtros Busqueda de rollos!</h4>',
    text: `<p>¡Llenando estos filtros se pueden consultar los rollos que se quieren ingresar!</p>`
  },
  {
    attachTo: {
      element: '#consultarRollos',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'consultarRollos',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Consultar Rollos!</h4>',
    text: `<p>¡Luego de haber llenado los filtros debemos presionar el botón <b>'Consultar Rollos'</b> para obtener la información de los rollos!</p><br>
            <p>Nota: No es necesario llenar los filtros, se puede presionar el botón con los filtros vacíos y este buscará todos los rollos que se pesaron el día de hoy y no se han ingresado.</p>`
  },
  {
    attachTo: {
      element: '#limpiarFiltros',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'limpiarFiltros',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Limpiar Filtros!</h4>',
    text: `<p>¡Para limpiar los filtros presionamos el botón <b>'Limpiar Campos'</b> y listo, los campos estarán completamente vacíos.!</p>`
  },
  {
    attachTo: {
      element: '#tabla1',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tabla1',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Rollos Consultados!</h4>',
    text: `<p>¡En esta tabla apareceran los rollos que se coincidan con los filtros antes digitados!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollos',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollos',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Elegir Todos los Rollos!</h4>',
    text: `<p>¡Presionando este checkbox se eligirán todos los rollos que se hayan consultado!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollo',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Elegir Rollo!</h4>',
    text: `<p>¡Presionando este checkbox se eligirá el rollo!</p>`
  },
  {
    attachTo: {
      element: '#tabla2',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tabla2',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Rollos Elegidos!</h4>',
    text: `<p>¡En esta tabla apareceran los rollos que hayan sido elegidos previamente!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollos2',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollos2',
    title: '<h4 style="margin: auto; color: var(--rojo)">Quitar Todos los Rollos!</h4>',
    text: `<p>¡Presionando este checkbox se deseleccionarán todos los rollos que se hayan elegidos!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollo2',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollo2',
    title: '<h4 style="margin: auto; color: var(--rojo)">Quitar Rollo!</h4>',
    text: `<p>¡Presionando este checkbox se deseleccionará el rollo!</p>`
  },
  {
    attachTo: {
      element: '#tabla3',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tabla3',
    title: '<h4 style="margin: auto; color: var(--rojo)">Tabla Consolidada!</h4>',
    text: `<p>¡Aquí aparecerán de manera consolidada por producto todos los rollos que hayan sido elegidos!<br>Se consolidarán por:</p>
          <ol>
            <li>Orden de Trabajo.</li>
            <li>Producto.</li>
            <li>Cantidad Total en kilos.</li>
            <li>Numero de rollos.</li>
          </ol>`
  },
  {
    attachTo: {
      element: '#ingresarRollo',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'eliminarRollos',
    title: '<h4 style="margin: auto; color: var(--rojo)">Ingresar Rollos Seleccionados!</h4>',
    text: `<p>¡Luego de haber seleccionado los rollos que queremos ingresar presionamos <b>'Ingresar Rollos'</b> y se ingresarán los rollos a la badega de extrusión!</p>`
  },
  {
    attachTo: {
      element: '#limpiarTodo',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.back,
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'limpiarTodo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Limpiar Todo!</h4>',
    text: `<p>¡Para limpiar todo (filtros y tablas) presionamos el botón <b>'Limpiar Todo'</b> y listo!</p>`
  },
];

export const stepsInvenatarioBodegas : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#none',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.next,
    ],
    classes: 'card',
    id: 'none',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Inventario de Rollos por Bodegas!</h4>',
    text: `<p>¡En esta vista podemos ver el inventario de cada una de las bodegas, es decir, podemos tener constancia de la cantidad de rollos que cada bodega tiene.!</p>`
  },
  {
    attachTo: {
      element: '#exportar1',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'exportar1',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Exportar Todo a Excel!</h4>',
    text: `<p>¡Podemos exportar a Excel la información agrupada del inventario que hay en total. Para exportarlo a Excel simplemente presionamos este botón!</p>`
  },
  {
    attachTo: {
      element: '#seleccionInventarios',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'seleccionInventarios',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Inventarios!</h4>',
    text: `<p>¡En cada una de las pestañas aparecerán los inventarios que hay por cada bodega, inicialmente lo que veremos será el inventario total!</p>`
  },
  {
    attachTo: {
      element: '#tablasInventario',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tablasInventario',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Tablas con Inventarios!</h4>',
    text: `<p>En estas tablas se estará mostrando la información de cada uno de los inventarios dependiendo de la bodega. Estos inventarios aparecerán de manera agrupada por lo siguiente:</p>
    <ol>
      <li>Orden de Trabajo.</li>
      <li>Producto.</li>
      <li>Cantidad Total en kilos.</li>
      <li>Numero de rollos.</li>
    </ol>
    <p>¡Nota: AL presionar el botón de la derecha que tiene cada una de las finals, veremos los rollos que hay en la bodega de la orden que hayamos seleccionado!</p>`
  },
  {
    attachTo: {
      element: '#exportar2',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'exportar2',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Exporta a Excel!</h4>',
    text: `<p>¡En cada tabla estará apareciendo este botón para exportar a excel. <br>
    <b>¿En que se diferencia del botón que está en la parte superior?</b> <br>Sencillo, este botón solo exportará a excel la información que aparece en la tabla, a diferencia del otro que exportará a excel la información de todas las bodegas!</p>`
  },
  {
    attachTo: {
      element: '#filtros',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'filtros',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Filtros!</h4>',
    text: `<p>¡Si queremos filtrar la información que se muestra en la tabla podemos esribir sobre la culmna que queremos filtrar y automaticamente aparecerá la información relacionada a lo que escribimos sobre el campo!</p>`
  },
  {
    attachTo: {
      element: '#titulos',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'titulos',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Titulos!</h4>',
    text: `<p>¡En esta fila podemos ver lo titulos de las columnas y tenemos la acción de organizar la información presionando click sobre la columna que queremos organizar!</p>`
  },
  {
    attachTo: {
      element: '#botonDetalles',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'botonDetalles',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Detalles!</h4>',
    text: `<p>¡Si queremos ver los rollos que hay en una bodega de una orden en especifico podemos presionar click y veremos el reporte detallado!</p>`
  },
  {
    attachTo: {
      element: '#totales',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.back
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'totales',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Totales!</h4>',
    text: `<p>¡Por ultimo veremos los totales de la tabla, totales como cantidad de kilos y cantidad de rollos!</p>`
  },
];

export const stepsSolicitudRollos : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#none',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.next,
    ],
    classes: 'card',
    id: 'none',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Solicitud de Rollos por Bodegas!</h4>',
    text: `<p>¡En esta vista podemos realizar solicitudes de rollos entre bodegas, es decir, una bodega puede solicitarle rollos a otra y debe haber un intermediario que acepte la solicitud, una vez sea aceptada los rollos pasarán al la bodega que los solicitó!</p>`
  },
  {
    attachTo: {
      element: '#formulario',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.next,
    ],
    classes: 'card',
    id: 'formulario',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Filtros Busqueda de rollos!</h4>',
    text: `<p>¡Llenando estos filtros se pueden consultar los rollos que se quieren ingresar!</p>`
  },
  {
    attachTo: {
      element: '#devolucion',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.next,
    ],
    classes: 'card',
    id: 'devolucion',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Devolución de rollos!</h4>',
    text: `<p>¡Si queremos crear una solicitu de devolución marcamos esta casilla y seleccionamos la bodega a la que devolveremos el rollo y la bodega de la que está siendo devuelto respectivamente!</p>`
  },
  {
    attachTo: {
      element: '#observacion',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.next,
    ],
    classes: 'card',
    id: 'observacion',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Observación Solicitud!</h4>',
    text: `<p>¡Si tenemos alguna observación, comentario y descripción sobre la solicitud la podemos escribir aquí!</p>`
  },
  {
    attachTo: {
      element: '#consultarRollos',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'consultarRollos',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Consultar Rollos!</h4>',
    text: `<p>¡Luego de haber llenado los filtros debemos presionar el botón <b>'Consultar Rollos'</b> para obtener la información de los rollos!</p><br>
            <p>Nota: Es necesario llenar minimos los filtros 'Bodega Solicitada' y 'OT'.</p>`
  },
  {
    attachTo: {
      element: '#limpiarFiltros',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'limpiarFiltros',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Limpiar Filtros!</h4>',
    text: `<p>¡Para limpiar los filtros presionamos el botón <b>'Limpiar Campos'</b> y listo, los campos estarán completamente vacíos.!</p>`
  },
  {
    attachTo: {
      element: '#tabla1',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tabla1',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Rollos Consultados!</h4>',
    text: `<p>¡En esta tabla apareceran los rollos que se coincidan con los filtros antes digitados!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollos',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollos',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Elegir Todos los Rollos!</h4>',
    text: `<p>¡Presionando este checkbox se eligirán todos los rollos que se hayan consultado!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollo',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Elegir Rollo!</h4>',
    text: `<p>¡Presionando este checkbox se eligirá el rollo!</p>`
  },
  {
    attachTo: {
      element: '#tabla2',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tabla2',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Rollos Elegidos!</h4>',
    text: `<p>¡En esta tabla apareceran los rollos que hayan sido elegidos previamente!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollos2',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollos2',
    title: '<h4 style="margin: auto; color: var(--rojo)">Quitar Todos los Rollos!</h4>',
    text: `<p>¡Presionando este checkbox se deseleccionarán todos los rollos que se hayan elegidos!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollo2',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollo2',
    title: '<h4 style="margin: auto; color: var(--rojo)">Quitar Rollo!</h4>',
    text: `<p>¡Presionando este checkbox se deseleccionará el rollo!</p>`
  },
  {
    attachTo: {
      element: '#tabla3',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tabla3',
    title: '<h4 style="margin: auto; color: var(--rojo)">Tabla Consolidada!</h4>',
    text: `<p>¡Aquí aparecerán de manera consolidada por producto todos los rollos que hayan sido elegidos!<br>Se consolidarán por:</p>
          <ol>
            <li>Orden de Trabajo.</li>
            <li>Producto.</li>
            <li>Cantidad Total en kilos.</li>
            <li>Numero de rollos.</li>
          </ol>`
  },
  {
    attachTo: {
      element: '#ingresarRollo',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'eliminarRollos',
    title: '<h4 style="margin: auto; color: var(--rojo)">Solicitar Rollos Seleccionados!</h4>',
    text: `<p>¡Luego de haber seleccionado los rollos que queremos solicitar presionamos <b>'Crear Solicitud'</b> y se creará un PDF con la información que acabamos de diligenciar!</p>`
  },
  {
    attachTo: {
      element: '#limpiarTodo',
      on: 'bottom'
    },
    scrollTo: { behavior: 'smooth', block: 'center' },
    buttons: [
      builtInButtons.back,
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'limpiarTodo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Limpiar Todo!</h4>',
    text: `<p>¡Para limpiar todo (filtros y tablas) presionamos el botón <b>'Limpiar Todo'</b> y listo!</p>`
  },
];

export const stepsMovimientosSolicitudesRollos : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#movimientos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'movimientos',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-arrow-right-arrow-left"></i> Mov. de solicitudes</h5>',
    text: `<p>En este reporte se pueden ver los <b>movimientos de solicitudes de rollos</b>.
    Tendrás filtros de búsqueda por:<br>
    <b>- Id de solicitud</b><br>
    <b>- Fechas de la solicitud</b><br>
    <b>- Tipo de solicitud</b><br>
    <b>- Bodegas</b><br>
    <b>- Estado de la solicitud</b><br><br>
    Además podrás apreciar en que estado se encuentra la solicitud<br><br>
    También podrás cancelar o finalizar la solicitud</b>.</p>`
  },
  {
    attachTo: {
      element: '#formulario1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'formulario1',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-filter"></i> Filtros</h5>',
    text: `<p>Aquí encontraremos <b>los filtros de búsqueda donde podrás realizar tus consultas.</b><br><br>
    Además podrás crear las combinaciones que desees llenando los campos: <br>
    <b>- Id de solicitud</b><br>
    <b>- Fecha Inicial de la solicitud</b><br>
    <b>- Fecha Final de la solicitud</b><br>
    <b>- Bodega Solicitada</b><br>
    <b>- Bodega Solicitante</b><br>
    <b>- Estado de la solicitud</b><br>
    <b>- Tipo de solicitud</b><br><br>
    Y luego solo <b>pulsa el botón consultar para ver la información solicitada!</b></p>`
  },
  {
    attachTo: {
      element: '#botones1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'botones1',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-search"></i> Consultar / <i class="pi pi-eraser"></i> Limpiar Campos</h5>',
    text: `<p>Luego de llenar los filtros por los que deseas realizar tu búsqueda, <b>haz clic sobre el botón Consultar para cargar la información del encabezado de la solicitud en la tabla</b> de registros consultados.
    <br><br>Para reiniciar tu busqueda solo <b>haz click sobre el botón limpiar campos.</b></p>`
  },
  {
    attachTo: {
      element: '#tabla1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'tabla1',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-list"></i> Encabezado de solicitudes</h5>',
    text: `<p>Aquí podrás apreciar <b>el encabezado de las solicitudes que se encontraron luego de realizar tu consulta,</b> entre ellos su:<br><br>
    <b>- Id</b><br>
    <b>- Fecha Creación</b><br>
    <b>- Estado General</b><br>
    <b>- Bodegas Solicitante</b><br>
    <b>- Bodega Solicitada</b><br>
    <b>- Tipo de Solicitud</b></p>`
  },
  {
    attachTo: {
      element: '#detalle',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'detalle',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-eye"></i> Ver detalles de la solicitud</h5>',
    text: `<p>Si existen registros en la tabla, <b>pulsa sobre el botón <i class="pi pi-eye"></i></b> para ver detalles de la solicitud del registro que seleccionaste. <br><br>
    podrás apreciar <b>número de solicitud, operario solicitante, rollo, orden de trabajo, item, referencia, cantidad y presentación</b> en la tabla detalles de la solicitud.</p>`
  },
  {
    attachTo: {
      element: '#rollos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'rollos',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-list"></i> Detalles de la solicitud</h5>',
    text: `<p>En este apartado podrás ver <b>los detalle de la solicitud que selecciones de la tabla registros consultados.</b></p>`
  },
  {
    attachTo: {
      element: '#tabla2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'tabla2',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-box"></i> Rollos</h5>',
    text: `<p>Aquí podrás apreciar <b>los rollos solicitados, orden de trabajo, item, referencia, cantidad y presentación</b><br><br></p>`
  },
  {
    attachTo: {
      element: '#finalizar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'finalizar',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-check-square"></i> Finalizar solicitud</h5>',
    text: `<p>Pulsando sobre este botón podrás finalizar la solicitud, <b>solo si su estado es pendiente</b><br><br>
    </p>`
  },
  {
    attachTo: {
      element: '#cancelar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'cancelar',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-ban"></i> Cancelar solicitud</h5>',
    text: `<p>Pulsando sobre este botón podrás cancelar la solicitud, <b>solo si su estado es pendiente</b><br><br>`
  },
  {
    attachTo: {
      element: '#crearPdf',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'crearPdf',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-file-pdf"></i> Crear PDF</h5>',
    text: `<p>Pulsando sobre este botón podrás <b>crear un PDF de la solicictud que está cargada en la tabla de detalles</b><br><br>`
  },
];

/*********************************************************** BODEGA EXTRUSIÓN **************************************************************************/
export const stepsEliminarRollos : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#formulario',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'formulario',
    title: '<h4 style="margin: auto; color: var(--rojo)">Filtros de eliminación</h4>',
    text: `<p>Llenando estos filtros se pueden consultar los rollos que se desean eliminar, es obligatorio llenar el campo bodega.</p>`
  },
  {
    attachTo: {
      element: '#consultarRollos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'consultarRollos',
    title: '<h4 style="margin: auto; color: var(--rojo)">Consultar rollos</h4>',
    text: `<p>Luego de diligenciar los filtros debemos presionar el botón <b>'Consultar'</b> para obtener la información de los rollos.</p>`
  },
  {
    attachTo: {
      element: '#limpiarFiltros',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'limpiarFiltros',
    title: '<h4 style="margin: auto; color: var(--rojo)">Limpiar filtros</h4>',
    text: `<p>Para limpiar los filtros presionamos el botón <b>'Limpiar Campos'</b> y listo</p>`
  },
  {
    attachTo: {
      element: '#tabla1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tabla1',
    title: '<h4 style="margin: auto; color: var(--rojo)">Rollos consultados</h4>',
    text: `<p>En esta tabla apareceran los rollos que se coincidan con los filtros previamente consultados</p>`
  },
  {
    attachTo: {
      element: '#elegirRollos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollos',
    title: '<h4 style="margin: auto; color: var(--rojo)">Elegir todos los rollos</h4>',
    text: `<p>Presionando este checkbox se eligirán todos los rollos que se hayan consultado</p>`
  },
  {
    attachTo: {
      element: '#elegirRollo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollo',
    title: '<h4 style="margin: auto; color: var(--rojo)">Elegir rollo</h4>',
    text: `<p>Presionando el checkbox que se encuentra en los registros de la tabla se seleccionará uno de los rollos</p>`
  },
  {
    attachTo: {
      element: '#tabla2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tabla2',
    title: '<h4 style="margin: auto; color: var(--rojo)">Rollos elegidos</h4>',
    text: `<p>En esta tabla apareceran los rollos que hayan sido elegidos previamente</p>`
  },
  {
    attachTo: {
      element: '#elegirRollos2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollos2',
    title: '<h4 style="margin: auto; color: var(--rojo)">Quitar todos los rollos</h4>',
    text: `<p>Presionando este checkbox se deseleccionarán todos los rollos que se hayan elegidos</p>`
  },
  {
    attachTo: {
      element: '#elegirRollo2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollo2',
    title: '<h4 style="margin: auto; color: var(--rojo)">Quitar rollo</h4>',
    text: `<p>Presionando el checkbox que se encuentra en los registros de la tabla se deseleccionará uno de los rollos </p>`
  },
  {
    attachTo: {
      element: '#tabla3',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tabla3',
    title: '<h4 style="margin: auto; color: var(--rojo)">Tabla consolidada</h4>',
    text: `<p>Aquí aparecerán de manera consolidada por producto todos los rollos que hayan sido elegidos!<br>Se consolidarán por:</p>
          <ol>
            <li>Orden de Trabajo.</li>
            <li>Producto.</li>
            <li>Cantidad Total en kilos.</li>
            <li>Numero de rollos.</li>
          </ol>`
  },
  {
    attachTo: {
      element: '#eliminarRollos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'eliminarRollos',
    title: '<h4 style="margin: auto; color: var(--rojo)">Eliminar rollos seleccionados</h4>',
    text: `<p>Luego de haber seleccionado los rollos que queremos eliminar presionamos <b>'Eliminar Rollos'</b>.
    <br><br> Posteriormente se nos mostrará un mensaje de confirmación preguntando por la base de datos de la que queremos eliminar
    los rollos, elegimos y se habrán eliminado los rollos</p>`
  },
  {
    attachTo: {
      element: '#limpiarTodo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'limpiarTodo',
    title: '<h4 style="margin: auto; color: var(--rojo)">Limpiar todo</h4>',
    text: `<p>¡Para limpiar todo (filtros y tablas) presionamos el botón <b>'Limpiar Todo'</b> y listo!</p>`
  },
];

export const stepsIngresoRollosExtrusion : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#formulario',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'formulario',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Filtros Busqueda de rollos!</h4>',
    text: `<p>¡Llenando estos filtros se pueden consultar los rollos que se quieren ingresar!</p>`
  },
  {
    attachTo: {
      element: '#consultarRollos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'consultarRollos',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Consultar Rollos!</h4>',
    text: `<p>¡Luego de haber llenado los filtros podemos debemos presionar el botón <b>'Consultar Rollos'</b> para obtener la información de los rollos!</p><br>
            <p>Nota: No es necesario llenar los filtros, se puede presionar el botón con los filtros vacios y este buscará todos los rollos que se pesaron el día de hoy y no se han ingresado.</p>`
  },
  {
    attachTo: {
      element: '#limpiarFiltros',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'limpiarFiltros',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Limpiar Filtros!</h4>',
    text: `<p>¡Para limpiar los filtros presionamos el botón <b>'Limpiar Campos'</b> y listo!</p>`
  },
  {
    attachTo: {
      element: '#rollosIngresados',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'rollosIngresados',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Rollos Ingresados!</h4>',
    text: `<p>¡Cantidad de rollos que se han ingresado con base en los filtros consultados!</p>`
  },
  {
    attachTo: {
      element: '#rollosNoIngresados',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'rollosNoIngresados',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Rollos No Ingresados!</h4>',
    text: `<p>¡Cantidad de rollos que <b>'No'</b> se han ingresado con base en los filtros consultados!</p>`
  },
  {
    attachTo: {
      element: '#tabla1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tabla1',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Rollos Consultados!</h4>',
    text: `<p>¡En esta tabla apareceran los rollos que se coincidan con los filtros antes digitados!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollos',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Elegir Todos los Rollos!</h4>',
    text: `<p>¡Presionando este checkbox se eligirán todos los rollos que se hayan consultado!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Elegir Rollo!</h4>',
    text: `<p>¡Presionando este checkbox se eligirá el rollo!</p>`
  },
  {
    attachTo: {
      element: '#tabla2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tabla2',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Rollos Elegidos!</h4>',
    text: `<p>¡En esta tabla apareceran los rollos que hayan sido elegidos previamente!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollos2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollos2',
    title: '<h4 style="margin: auto; color: var(--rojo)">Quitar Todos los Rollos!</h4>',
    text: `<p>¡Presionando este checkbox se deseleccionarán todos los rollos que se hayan elegidos!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollo2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollo2',
    title: '<h4 style="margin: auto; color: var(--rojo)">Quitar Rollo!</h4>',
    text: `<p>¡Presionando este checkbox se deseleccionará el rollo!</p>`
  },
  {
    attachTo: {
      element: '#tabla3',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tabla3',
    title: '<h4 style="margin: auto; color: var(--rojo)">Tabla Consolidada!</h4>',
    text: `<p>¡Aquí aparecerán de manera consolidada por producto todos los rollos que hayan sido elegidos!<br>Se consolidarán por:</p>
          <ol>
            <li>Orden de Trabajo.</li>
            <li>Producto.</li>
            <li>Cantidad Total en kilos.</li>
            <li>Numero de rollos.</li>
          </ol>`
  },
  {
    attachTo: {
      element: '#ingresarRollo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'eliminarRollos',
    title: '<h4 style="margin: auto; color: var(--rojo)">Ingresar Rollos Seleccionados!</h4>',
    text: `<p>¡Luego de haber seleccionado los rollos que queremos ingresar presionamos <b>'Ingresar Rollos'</b> y se ingresarán los rollos a la badega de extrusión!</p>`
  },
  {
    attachTo: {
      element: '#limpiarTodo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'limpiarTodo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Limpiar Todo!</h4>',
    text: `<p>¡Para limpiar todo (filtros y tablas) presionamos el botón <b>'Limpiar Todo'</b> y listo!</p>`
  },
];

export const stepsInventarioExtrusion : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#exportarExcel',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'exportarExcel',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Exportar a Excel!</h4>',
    text: `<p>¡Podemos exportar a excel la información que tenemos en la tabla presionando este botón!</p>`
  },
  {
    attachTo: {
      element: '#table',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.next,
      builtInButtons.back,
    ],
    classes: 'card',
    id: 'table',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Bodega Extrusión!</h4>',
    text: `<p>¡En esta tabla veremos todos los rollos de la bodega de extrusión, los rollos se verán de manera consolidada por <b>productos</b> y <b>orden de trabajo</b>. Para ver la información de cada rollo presionamos doble click sobre el producto que queremos ver y nos aparecerá un modal con todos los rollos de ese producto!</p>`
  },
  {
    attachTo: {
      element: '#limpiarFiltros',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.next,
      builtInButtons.back
    ],
    classes: 'card',
    id: 'limpiarFiltros',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Limpiar Filtros!</h4>',
    text: `<p>¡Con este botón se limpiarán los filtros que se hayan implementado en cada una de las columnas de la tabla!</p>`
  },
  {
    attachTo: {
      element: '#sort',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.next,
      builtInButtons.back
    ],
    classes: 'card',
    id: 'sort',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Ordenar Datos!</h4>',
    text: `<p>¡Con este botón que se encuentra en cada columna podemos ordenar de maner ascendente y descendente por los datos de la columna la información de la tabla!</p>`
  },
  {
    attachTo: {
      element: '#filter',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.next,
      builtInButtons.back
    ],
    classes: 'card',
    id: 'filter',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Filtros!</h4>',
    text: `<p>¡Con este botón se puede filtrar la información de la tabla por la columna en la que se implemente!</p> <br>
          <p>Al desplegar el botón podemos:</p>
          <ul>
            <li>Elegir el tipo de filtrado.</li>
            <li>Digitar la información por la que queremos filtrar.</li>
            <li>Añadir reglas de filtrado.</li>
            <li>Quitar reglas de filtrado.</li>
            <li>Limpiar el filtro.</li>
          </ul>`
  },
  {
    attachTo: {
      element: '#exportarExcel2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back
    ],
    classes: 'card',
    id: 'exportarExcel2',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Exportar a Excel!</h4>',
    text: `<p>¡Podemos exportar a excel la información que tenemos en la tabla presionando este botón!</p>`
  },
];

export const stepsMovimientosExtrusion : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#formulario',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'formulario',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Filtros!</h4>',
    text: `<p>¡Llenando estos filtros podemos realizar una busqueda más selectiva de la información de los movimientos que han habido en la bodega de extrusión, si no queremos colocar filtros se buscará automaticamente por el día de hoy!</p>`
  },
  {
    attachTo: {
      element: '#consultar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back
    ],
    classes: 'card',
    id: 'consultar',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Consultar Movimientos!</h4>',
    text: `<p>¡Luego de haber o no llenado los filtros se presionamos el botón <b>'Consultar'</b> para que despues de cargar nos aparezca la información de los movimientos en la bodega de extrusión!</p>`
  },
  {
    attachTo: {
      element: '#limpiarTodo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'limpiarTodo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Limpiar Todo!</h4>',
    text: `<p>¡Para limpiar todo (filtros y tablas) presionamos el botón <b>'Limpiar Todo'</b> y listo!</p>`
  },
  {
    attachTo: {
      element: '#table',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back
    ],
    classes: 'card',
    id: 'table',
    title: '<h4 style="margin: auto; color: var(--rojo)">Movimientos Extrusión!</h4>',
    text: `<p>¡En esta tabla veremos todos los movimientos de la bodega de extrusión que consultamos</p>`
  },
  {
    attachTo: {
      element: '#limpiarFiltros',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back
    ],
    classes: 'card',
    id: 'limpiarFiltros',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Limpiar Filtros!</h4>',
    text: `<p>¡Con este botón se limpiarán los filtros que se hayan implementado en cada una de las columnas de la tabla!</p>`
  },
  {
    attachTo: {
      element: '#filter',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back
    ],
    classes: 'card',
    id: 'filter',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Filtros!</h4>',
    text: `<p>¡Con este botón se puede filtrar la información de la tabla por la columna en la que se implemente!</p> <br>
          <p>Al desplegar el botón podemos:</p>
          <ul>
            <li>Elegir el tipo de filtrado.</li>
            <li>Digitar la información por la que queremos filtrar.</li>
            <li>Añadir reglas de filtrado.</li>
            <li>Quitar reglas de filtrado.</li>
            <li>Limpiar el filtro.</li>
          </ul>`
  },
  {
    attachTo: {
      element: '#pdf',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.back
    ],
    classes: 'card',
    id: 'pdf',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Ver PDF!</h4>',
    text: `<p>¡al presionar este botón veremos la información completa del movimiento en un PDF!</p>`
  },
];

export const stepsSalidaRollosExtrusion : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#formulario',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'formulario',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Filtros y Campos Obligatorios!</h4>',
    text: `<p>¡Llenando estos filtros podemos realizar una busqueda más selectiva de los rollos que hay en la bodega de extrusión, si no queremos colocar filtros se buscará automaticamente los rollos disponibles!</p>
          <br><p>¡Se debe llenar obligatoriamente el campo <b>'Proceso'</b>, el cual es el proceso hacia el que saldrá el rollo. El campo <b>'Observación'</b> no es obligatorio!</p>`
  },
  {
    attachTo: {
      element: '#consultarRollos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'consultarRollos',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Consultar Rollos!</h4>',
    text: `<p>¡Luego de haber llenado los filtros podemos debemos presionar el botón <b>'Consultar Rollos'</b> para obtener la información de los rollos!</p>`
  },
  {
    attachTo: {
      element: '#limpiarFiltros',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'limpiarFiltros',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Limpiar Filtros!</h4>',
    text: `<p>¡Para limpiar los filtros presionamos el botón <b>'Limpiar Campos'</b> y listo!</p>`
  },
  {
    attachTo: {
      element: '#tabla1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tabla1',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Rollos Consultados!</h4>',
    text: `<p>¡En esta tabla apareceran los rollos que se coincidan con los filtros antes digitados!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollos',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Elegir Todos los Rollos!</h4>',
    text: `<p>¡Presionando este checkbox se eligirán todos los rollos que se hayan consultado!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Elegir Rollo!</h4>',
    text: `<p>¡Presionando este checkbox se eligirá el rollo!</p>`
  },
  {
    attachTo: {
      element: '#tabla2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tabla2',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Rollos Elegidos!</h4>',
    text: `<p>¡En esta tabla apareceran los rollos que hayan sido elegidos previamente!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollos2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollos2',
    title: '<h4 style="margin: auto; color: var(--rojo)">Quitar Todos los Rollos!</h4>',
    text: `<p>¡Presionando este checkbox se deseleccionarán todos los rollos que se hayan elegidos!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollo2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollo2',
    title: '<h4 style="margin: auto; color: var(--rojo)">Quitar Rollo!</h4>',
    text: `<p>¡Presionando este checkbox se deseleccionará el rollo!</p>`
  },
  {
    attachTo: {
      element: '#tabla3',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tabla3',
    title: '<h4 style="margin: auto; color: var(--rojo)">Tabla Consolidada!</h4>',
    text: `<p>¡Aquí aparecerán de manera consolidada por producto todos los rollos que hayan sido elegidos!<br>Se consolidarán por:</p>
          <ol>
            <li>Orden de Trabajo.</li>
            <li>Producto.</li>
            <li>Cantidad Total en kilos.</li>
            <li>Numero de rollos.</li>
          </ol>`
  },
  {
    attachTo: {
      element: '#salidaRollo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'salidaRollo',
    title: '<h4 style="margin: auto; color: var(--rojo)">Salida de Rollos Seleccionados!</h4>',
    text: `<p>¡Luego de haber seleccionado los rollos a los cuales queremos darle salida presionamos <b>'Asignar Rollos'</b> y se asignarán al proceso que hayamos elegido!</p>`
  },
  {
    attachTo: {
      element: '#limpiarTodo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'limpiarTodo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Limpiar Todo!</h4>',
    text: `<p>¡Para limpiar todo (filtros y tablas) presionamos el botón <b>'Limpiar Todo'</b> y listo!</p>`
  },
];

/************************************************************* BOPP, BOPA Y POLIESTER ********************************************************************/
export const stepAsignacionBopp: Step.StepOptions[] = [
  {
    attachTo: {
      element: '#formulario1',
      on: 'bottom-start'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'formulario1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Consultar Ordenes de Trabajo</h5>`,
    text: `<b>En el campo OT</b> digita los números de ordenes de trabajo a las que deseas asignar BOPP y <b>presiona Enter</b> para consultar su información detallada.<br><br>
    Además puedes agregar <b>una observación general de la asignación</b>`
  },
  {
    attachTo: {
      element: '#tabla1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tabla1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Tabla de OT's a Asignar Bopp</h5>`,
    text: `En esta tabla encontrarás la información detallada de la(s) orden(es) de trabajo a las cuales <b>se les realizará la asignación de BOPP.</b>`
  },
  {
    attachTo: {
      element: '#quitar-OT',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'quitar-OT',
    title: '<h5 class="tituloRojo" style="margin: auto;">Elegir Materias Primas</h5>',
    text: `En esta fila puedes quitar las ordenes de trabajo elegidas erróneamente, <b>haciendo clic sobre el icono <i class="pi pi-trash"></i> cuando
    existan OT's cargadas en la tabla</b>`
  },
  {
    attachTo: {
      element: '#formulario2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tabla',
    title: `<h5 class="tituloRojo" style="margin: auto;">BOPP's a asignar</h5>`,
    text: `En estos campos puedes <b>realizar la búsqueda de los rollos de BOPP</b> que deseas asignar a las ordenes de trabajo elegidas previamente.<br><br>
    <b>Nota: </b> Esta búsqueda puede ser por medio del serial, nombre, peso o micras del rollo.`
  },
  {
    attachTo: {
      element: '#botones1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'botones1',
    title: '<h5 class="tituloRojo" style="margin: auto;">Asignar Materias Primas</h5>',
    text: `Luego de elegir el BOPP a asignar <b>haz clic sobre Asignar Rollo</b> para añadirlo a la tabla que encontrarás acontinuación.<br><br>`
  },
  {
    attachTo: {
      element: '#tabla2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tabla2',
    title: `<h5 class="tituloRojo" style="margin: auto;">Tabla de rollos a asignar</h5>`,
    text: `En esta tabla encontrarás <b>los rollos que serán asignados a las ordenes de trabajo</b> elegidas previamente.<br><br>
    <b>Nota:</b> La cantidad asignada <b>será dividida proporcionalmente</b> por el número de ordenes de trabajo que se eligieron!`
  },
  {
    attachTo: {
      element: '#editar-cantidad',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'editar-cantidad',
    title: `<h5 class="tituloRojo" style="margin: auto;">Editar cantidad a asignar</h5>`,
    text: `Recuerda que <b>puedes editar la cantidad a asignar por rollo.</b> Haz clic sobre la cantidad de Kg del rollo que desees y coloca la nueva cantidad a asignar.`
  },
  {
    attachTo: {
      element: '#quitar-rollo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'quitar-rollo',
    title: `<h5 class="tituloRojo" style="margin: auto;">Quitar rollos de la tabla</h5>`,
    text: `<b>Haciendo clic sobre el icono</b> <i class="pi pi-trash"></i> puedes quitar los rollos elegidos previamente, si ya no deseas asignarlo o si te equivocaste de serial`
  },
  {
    attachTo: {
      element: '#botones2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'botones2',
    title: '<h5 class="tituloRojo" style="margin: auto;">Registrar Asignación</h5>',
    text: `Por último registra la asignación al sistema <b>haciendo clic sobre crear asignación</b><br><br>
    Además, puedes volver a iniciar la asignación si tienes algún error en la digitación, <b>solo haz clic en limpiar todo</b>`
  },
];

export const stepEntradaBopp: Step.StepOptions[] = [
  {
    attachTo: {
      element: '#opcional',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'opcional',
    title: `<h5 class="tituloRojo" style="margin: auto;">Ingreso de rollos opcional</h5>`,
    text: `Este módulo cuenta con <b>la entrada de BOPP opcional</b>, que consiste en el ingreso de <b>rollos de BOPP/BOPA/Poliester</b> al inventario, así:<br><br>
    1. Previamente creando una OC (Orden de compra).<br>
    2. Se consulta dicha OC en este módulo.<br>
    3. Por último se ingresan los rollos por medio de la factura/remisión en la que llegaron.`
  },
  {
    attachTo: {
      element: '#formulario1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'formulario1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Consultar OC</h5>`,
    text: `Este formulario es el encabezado del <b>ingreso opcional del BOPP/BOPA/Poliester.</b><br><br>
    Aquí puedes <b>consultar el número de la OC y luego pulsar la tecla Enter</b> para ver los materiales asociados a dicha OC en la tabla que se muestra acontinuación.<br><br>
    <b>Nota:</b> Recuerda que <b>solo debes diligenciar el campo factura o remisión</b>, ambos no pueden tener información al mismo tiempo.`
  },
  {
    attachTo: {
      element: '#tabla1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tabla1',
    title: '<h5 class="tituloRojo" style="margin: auto;">Materias Primas asociadas a OC</h5>',
    text: `Luego de consultar la OC, si existe, <b>se cargará la tabla con los materiales asociados a dicha orden.</b><br><br>
    <b>Nota:</b> Recuerda que aquí solo puedes ingresar <b>materiales de BOPP, BOPA y Poliester</b>, osea que si la orden de compra tiene otros materiales,
    estos apareceran inhabilitados</b>`
  },
  {
    attachTo: {
      element: '#formulario2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'formulario2',
    title: '<h5 class="tituloRojo" style="margin: auto;">Ingresar Material</h5>',
    text: `En este formulario <b>debes ingresar de manera detallada la información</b> del bopp, bopa o poliester entrante.<br><br>`
  },
  {
    attachTo: {
      element: '#botones1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'botones1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Agregar Material a tabla</h5>`,
    text: `Luego de digitar la información del bopp, bopa o poliester entrante, debes <b>hacer clic sobre el botón añadir material</b> para agregarlo a la tabla que
    encontraremos acontinuación.<br><br>
    Si te equivocas digitando un material puedes <b>limpiar los campos</b>`
  },
  {
    attachTo: {
      element: '#tabla2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tabla2',
    title: `<h5 class="tituloRojo" style="margin: auto;">Tabla de materiales entrantes</h5>`,
    text: `En esta tabla encontrarás los materiales de <b>BOPP, BOPA y Poliester cargados previamente y listos para ser ingresados.</b>`
  },
  {
    attachTo: {
      element: '#quitar-rollo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'quitar-rollo',
    title: '<h5 class="tituloRojo" style="margin: auto;">Quitar rollo</h5>',
    text: `Haciendo clic sobre el icono <i class="pi pi-trash"></i> <b>puedes quitar rollos agregados previamente</b>,
    si ya no deseas agregarlos o si te equivocaste en alguna de las caracteristicas.`
  },
  {
    attachTo: {
      element: '#botones2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'botones2',
    title: `<h5 class="tituloRojo" style="margin: auto;">Crear entrada de materiales</h5>`,
    text: `Por último puedes registrar la entrada de los materiales cargados en la tabla, <b>haciendo clic sobre crear entrada.</b><br><br>
    Además puedes <b>limpiar todo lo que llevabas hasta ese momento</b> e iniciar una nueva entrada`
  },
];

export const stepInventarioBopp: Step.StepOptions[] = [
  {
    attachTo: {
      element: '#rango-fechas',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'rango-fechas',
    title: `<h5 class="tituloRojo" style="margin: auto;">Búsqueda por rango de fechas</h5>`,
    text: `Realiza busquedas por rango de fechas haciendo click sobre este campo y <b>eligiendo el rango de tiempo en que deseas consultar.</b>`
  },
  {
    attachTo: {
      element: '#consultar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'consultar',
    title: `<h5 class="tituloRojo" style="margin: auto;">Consultar Inventario</h5>`,
    text: `<b>Luego de diligenciar el campo rango de fechas</b> haz clic aquí para consultar la información solicitada del lapso de tiempo elegido previamente.`
  },
  {
    attachTo: {
      element: '#con-existencias',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'con-existencias',
    title: '<h5 class="tituloRojo" style="margin: auto;">Materiales con existencias</h5>',
    text: `Al hacer clic sobre este botón se cargarán en la tabla <b>solo las materias primas que tienen existencias mayores a cero.</b>`
  },
  {
    attachTo: {
      element: '#nuevaMateriaPrima',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'nuevaMateriaPrima',
    title: `<h5 class="tituloRojo" style="margin: auto;">Crear Materia Prima</h5>`,
    text: `<p>¡Para crear una materia prima nueva presionamos este botón, seleccionamos el tipo de materia prima que vamos a crear, llenamos los campos y presionamos <b>'Crear...'</b>!</p>`
  },
  {
    attachTo: {
      element: '#exportar1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'exportar1',
    title: '<h5 class="tituloRojo" style="margin: auto;">Exportar todo a excel</h5>',
    text: `Al presionar este botón <b>podrás exportar todo el inventario de materias primas</b> en formato excel.<br><br>`
  },
  {
    attachTo: {
      element: '#materias-primas',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'materias-primas',
    title: `<h5 class="tituloRojo" style="margin: auto;">Información de Materiales</h5>`,
    text: `En este apartado encontrarás la información del <b>inventario de todas las categorias de materia prima.</b><br><br>
    En cada uno de los tabs podrás apreciarlo de manera detallada por las siguientes categorias:<br>
    - <b>Polietilenos</b><br>
    - <b>Tintas</b><br>
    - <b>Biorientados</b><br>
    `
  },
  {
    attachTo: {
      element: '#filtros',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'filtros',
    title: `<h5 class="tituloRojo" style="margin: auto;">Filtros por campos</h5>`,
    text: `En cada uno de estos campos <b>puedes filtrar tus busquedas para encontrar de manera más rápida y eficiente</b> los datos de materias primas que desees.`
  },
  {
    attachTo: {
      element: '#inicial',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'inicial',
    title: `<h5 class="tituloRojo" style="margin: auto;">Inventario inicial</h5>`,
    text: `En esta columna podrás observar <b>el inventario con el que inició el día cada polietileno, tinta y bopp.</b>`
  },
  {
    attachTo: {
      element: '#entrada',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'entrada',
    title: `<h5 class="tituloRojo" style="margin: auto;">Entrada diaria</h5>`,
    text: `En esta columna podrás observar <b>las entradas al inventario de cada polietileno, tinta y bopp del día.</b><br><br>
    Las entradas de materia prima pueden ser por distintos conceptos, tales como: <br>
    - <b>Por Factura.</b><br>
    - <b>Por Remisión.</b><br>
    - <b>Por Devolución.</b>`
  },
  {
    attachTo: {
      element: '#salida',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'salida',
    title: `<h5 class="tituloRojo" style="margin: auto;">Salidas de materiales</h5>`,
    text: `En esta columna podrás observar <b>las salidas del inventario de cada polietileno, tinta y bopp del día.</b><br><br>
    Las salidas de materia prima pueden ser por distintos conceptos, tales como: <br>
    - <b>Por asignación de materia prima</b> y bopp.<br>
    - <b>Por orden de maquila.</b><br>
    - <b>Por creación de tintas.</b>`
  },
  {
    attachTo: {
      element: '#stock',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'stock',
    title: `<h5 class="tituloRojo" style="margin: auto;">Stock de materiales</h5>`,
    text: `En esta columna podrás observar <b>las cantidades actuales en inventario de cada polietileno, tinta y bopp del día.</b><br><br>`
  },
  {
    attachTo: {
      element: '#diferencia',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'diferencia',
    title: `<h5 class="tituloRojo" style="margin: auto;">Diferencia de materiales</h5>`,
    text: `En esta columna puedes ver <b>la diferencia entre el stock inicial, entradas y salidas de cada material en el día.</b>`
  },
  {
    attachTo: {
      element: '#editar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'editar',
    title: `<h5 class="tituloRojo" style="margin: auto;">Editar Materia Prima</h5>`,
    text: `<p>¡Si presionamos uno de los botones de esta columna se nos abrirá un modal desde el que podremos editar la información de la materia prima!</p>`
  },
  {
    attachTo: {
      element: '#totales',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'totales',
    title: `<h5 class="tituloRojo" style="margin: auto;">Totales</h5>`,
    text: `En este pie de tabla <b>puedes ver los precios y los totales en kilos de cada una de las categorias de materia prima</b> en las columnas de:<br><br>
    - <b>Inventario inicial.</b><br>
    - <b>Entradas.</b><br>
    - <b>Salidas.</b><br>
    - <b>Stock actual.</b><br>
    - <b>Diferencia.</b><br>
    - <b>Subtotal.</b><br>`
  },
  {
    attachTo: {
      element: '#exportar3',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'exportar3',
    title: `<h5 class="tituloRojo" style="margin: auto;">Exportar Información</h5>`,
    text: `Desde este botón puedes <b>exportar a excel la información de la tabla, teniendo en cuenta si realizaste algún filtro</b>, sino, se descargará todo el inventario.`
  },
];

export const stepsMovimientosBopp: Step.StepOptions[] = [
  {
    attachTo: {
      element: '#formulario1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'formulario1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Búsqueda por filtros</h5>`,
    text: `En este formulario puedes <b>filtrar tus busquedas</b> para ver los movimientos de cada materia prima.<br><br>
    Ten en cuenta que puedes realizar distintas combinaciones de filtros, pero <b>sino llenas ningún campo solo se cargará en la tabla información del día de hoy.</b><br><br>
    En el campo código de documento <b>puedes hacer referencia a las OT, facturas, remisiones y/o asignaciones de bopp o tinta</b> en que las materias primas tuvieron movimientos.`
  },
  {
    attachTo: {
      element: '#botones1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'botones1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Consultar</h5>`,
    text: `Luego de elegir la combinación de filtros deseada, <b>pulsa el botón consultar</b>, para cargar la info en la tabla que encontrarás acontinuación<br><br>
    Si deseas realizar una combinación de filtros distinta, <b>haz clic sobre el botón limpiar campos</b> para iniciar tu nueva búsqueda`
  },
  {
    attachTo: {
      element: '#tab',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'tab',
    title: `<h5 class="tituloRojo" style="margin: auto;">Secciones por categoría</h5>`,
    text: `Después de consultar los filtros seleccionados, <b>en cada uno de los tabs encontrarás seccionada la información de movimientos</b> por:</b><br><br>
    - <b>Polietilenos</b><br>
    - <b>Tintas</b><br>
    - <b>Biorientados</b><br>`
  },
  {
    attachTo: {
      element: '#filtros',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'filtros',
    title: `<h5 class="tituloRojo" style="margin: auto;">Filtros</h5>`,
    text: `En cada uno de estos campos <b>puedes filtrar tus busquedas en tiempo real para encontrar de manera más exacta</b> los datos de movimientos que solicitas.`
  },
  {
    attachTo: {
      element: '#exportar1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'exportar1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Exportar</h5>`,
    text: `Después de cargar información en la tabla, <b>haciendo click sobre el botón <i class="pi pi-pdf-file"></i> que se encuentra en esta columna podrás exportar en PDF</b> el detalle específico del movimiento de materia prima que elijas.`
  },
  {
    attachTo: {
      element: '#pie-t1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back
    ],
    classes: 'card',
    id: 'pie-t1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Materia Prima asignada y faltante</h5>`,
    text: `Si consultas un código de documento en especifico, como orden de trabajo, <b>en este pie de tabla se cargarán los datos en kilos asignados de
    materia prima y la cantidad que aún falta por entregarle a dicha orden de trabajo.`
  },
];

/******************************************************************** DESPACHO ************************************************************************/
export const stepsIngresoRolloDespacho : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#formulario',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'formulario',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Filtros Busqueda de rollos!</h4>',
    text: `<p>¡Llenando estos filtros se pueden consultar los rollos que se quieren ingresar!</p>`
  },
  {
    attachTo: {
      element: '#consultarRollos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'consultarRollos',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Consultar Rollos!</h4>',
    text: `<p>¡Luego de haber llenado los filtros podemos debemos presionar el botón <b>'Consultar Rollos'</b> para obtener la información de los rollos!</p><br>
            <p>Nota: Es necesario llenar el campo <b>'Proceso'</b>, porque este indicará de donde se buscarán los rollos a ingresar</p>`
  },
  {
    attachTo: {
      element: '#limpiarFiltros',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'limpiarFiltros',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Limpiar Filtros!</h4>',
    text: `<p>¡Para limpiar los filtros presionamos el botón <b>'Limpiar Campos'</b> y listo!</p>`
  },
  {
    attachTo: {
      element: '#rollosIngresados',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'rollosIngresados',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Rollos Ingresados!</h4>',
    text: `<p>¡Cantidad de rollos que se han ingresado con base en los filtros consultados!</p>`
  },
  {
    attachTo: {
      element: '#rollosNoIngresados',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'rollosNoIngresados',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Rollos No Ingresados!</h4>',
    text: `<p>¡Cantidad de rollos que <b>'No'</b> se han ingresado con base en los filtros consultados!</p>`
  },
  {
    attachTo: {
      element: '#tabla1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tabla1',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Rollos Consultados!</h4>',
    text: `<p>¡En esta tabla apareceran los rollos que se coincidan con los filtros antes digitados. Si en la tabla salen filas de color rojo significa los rollos de esas filas ya han sido ingresados!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollos',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Elegir Todos los Rollos!</h4>',
    text: `<p>¡Presionando este checkbox se eligirán todos los rollos que se hayan consultado!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Elegir Rollo!</h4>',
    text: `<p>¡Presionando este checkbox se eligirá el rollo!</p>`
  },
  {
    attachTo: {
      element: '#tabla2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tabla2',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Rollos Elegidos!</h4>',
    text: `<p>¡En esta tabla apareceran los rollos que hayan sido elegidos previamente!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollos2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollos2',
    title: '<h4 style="margin: auto; color: var(--rojo)">Quitar Todos los Rollos!</h4>',
    text: `<p>¡Presionando este checkbox se deseleccionarán todos los rollos que se hayan elegidos!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollo2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollo2',
    title: '<h4 style="margin: auto; color: var(--rojo)">Quitar Rollo!</h4>',
    text: `<p>¡Presionando este checkbox se deseleccionará el rollo!</p>`
  },
  {
    attachTo: {
      element: '#tabla3',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tabla3',
    title: '<h4 style="margin: auto; color: var(--rojo)">Tabla Consolidada!</h4>',
    text: `<p>¡Aquí aparecerán de manera consolidada por producto todos los rollos que hayan sido elegidos!<br>Se consolidarán por:</p>
          <ol>
            <li>Producto.</li>
            <li>Cantidad Total en kilos.</li>
            <li>Numero de rollos.</li>
          </ol>`
  },
  {
    attachTo: {
      element: '#ingresarRollo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'eliminarRollos',
    title: '<h4 style="margin: auto; color: var(--rojo)">Ingresar Rollos Seleccionados!</h4>',
    text: `<p>¡Luego de haber seleccionado los rollos que queremos ingresar presionamos <b>'Ingresar Rollos'</b> y se ingresarán los rollos a la badega de despacho!</p>`
  },
  {
    attachTo: {
      element: '#limpiarTodo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'limpiarTodo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Limpiar Todo!</h4>',
    text: `<p>¡Para limpiar todo (filtros y tablas) presionamos el botón <b>'Limpiar Todo'</b> y listo!</p>`
  },
];

export const stepsFacturarRolloDespacho : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#formulario',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'formulario',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Filtros y Datos de la asignación!</h4>',
    text: `<p>¡Aquí podemos digitar los datos de la factura a la cual van a estár asociados los rollos y podemos consultar los rollos de un producto en especifico.!</p>`
  },
  {
    attachTo: {
      element: '#factura',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'factura',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Código de Factura!</h4>',
    text: `<p>¡En este campo debemos colocar el código de la factura a la cual estarán asociados los rollos a los que les daremos salida de la bodega de desapacho!</p>`
  },
  {
    attachTo: {
      element: '#notaCredito',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'notaCredito',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Nota Creadito!</h4>',
    text: `<p>¡Sí la factura tiene una nota credito podemos colocar el codigo de esta aquí, de lo contrario lo dejamos vacio!</p>`
  },
  {
    attachTo: {
      element: '#codProducto',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'codProducto',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Item!</h4>',
    text: `<p>¡Para buscar los rollos que tendrá la factura tenemos que buscar los rollos de cada uno de los productos que están en la factura. Para ello digitamos el código del producto y presionamos <b>'Enter'</b>, veremos como saldrán los rollos de este producto en la primera tabla!</p>`
  },
  {
    attachTo: {
      element: '#cantProducto',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'cantProducto',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Cantidad Item!</h4>',
    text: `<p>¡Sí queremos buscar la cantidad especifica de un producto digitamos la cantidad en este campo y presionamos <b>'Enter'</b>, para esto primero debemos diligenciar el campo <b>'Item'</b>!</p>`
  },
  {
    attachTo: {
      element: '#cliente',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'cliente',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Cliente!</h4>',
    text: `<p>¡Aquí podemos buscar por el nombre o por la identificación del cliente, al escribir el programa irá filtrando la información para que sea más facil de buscar!</p>`
  },
  {
    attachTo: {
      element: '#observacion',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'observacion',
    title: '<h4 style="margin: auto; color: var(--rojo)">observacion!</h4>',
    text: `<p>¡Aquí podemos escribir una observación sobre la asignación que estamos realizando. Este campo es opcional!</p>`
  },
  {
    attachTo: {
      element: '#tabla1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tabla1',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Rollos Consultados!</h4>',
    text: `<p>¡En esta tabla apareceran los rollos que estén disponibles del producto que se haya consultado.!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollos',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Elegir Todos los Rollos!</h4>',
    text: `<p>¡Presionando este checkbox se eligirán todos los rollos que se hayan consultado!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Elegir Rollo!</h4>',
    text: `<p>¡Presionando este checkbox se eligirá el rollo!</p>`
  },
  {
    attachTo: {
      element: '#cantidadRollos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'cantidadRollos',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Total Producto!</h4>',
    text: `<p>¡Suma de la cantidad disponible del producto que se haya consultado!</p>`
  },
  {
    attachTo: {
      element: '#tabla2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tabla2',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Rollos Elegidos!</h4>',
    text: `<p>¡En esta tabla apareceran los rollos que hayan sido elegidos previamente!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollos2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollos2',
    title: '<h4 style="margin: auto; color: var(--rojo)">Quitar Todos los Rollos!</h4>',
    text: `<p>¡Presionando este checkbox se deseleccionarán todos los rollos que se hayan elegidos!</p>`
  },
  {
    attachTo: {
      element: '#editarCantPaquetes',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'editarCantPaquetes',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Editar Cantidad de Paquetes!</h4>',
    text: `<p>¡Para editar la cantidad de paquetes presionamos click sobre la fila y columna que queremos editar, escribimos la cantidad y presionamos click en cualquier otra parte de la pantalla!</p>`
  },
  {
    attachTo: {
      element: '#editarCantUnidades',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'editarCantUnidades',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Editar Cantidad de Unidades!</h4>',
    text: `<p>¡Para editar la cantidad de unidades presionamos click sobre la fila y columna que queremos editar, escribimos la cantidad y presionamos click en cualquier otra parte de la pantalla!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollo2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollo2',
    title: '<h4 style="margin: auto; color: var(--rojo)">Quitar Rollo!</h4>',
    text: `<p>¡Presionando este checkbox se deseleccionará el rollo!</p>`
  },
  {
    attachTo: {
      element: '#tabla3',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tabla3',
    title: '<h4 style="margin: auto; color: var(--rojo)">Tabla Consolidada!</h4>',
    text: `<p>¡Aquí aparecerán de manera consolidada por producto todos los rollos que hayan sido elegidos!<br>Se consolidarán por:</p>
          <ol>
            <li>Producto.</li>
            <li>Cantidad Total en kilos.</li>
            <li>Numero de rollos.</li>
          </ol>`
  },
  {
    attachTo: {
      element: '#asignarRollos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'asignarRollos',
    title: '<h4 style="margin: auto; color: var(--rojo)">Facturar Rollos Seleccionados!</h4>',
    text: `<p>¡Luego de haber seleccionado los rollos que queremos facturar presionamos <b>'Facturar Rollos'</b> y se listo, se habrán facturado los rollos enviando un PDF con la información de la facturación!</p>`
  },
  {
    attachTo: {
      element: '#limpiarTodo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'limpiarTodo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Limpiar Todo!</h4>',
    text: `<p>¡Para limpiar todo (filtros y tablas) presionamos el botón <b>'Limpiar Todo'</b> y listo!</p>`
  },
];

export const stepsDespacharRollosDespacho : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#formulario',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'formulario',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Despacho de Mercancia!</h4>',
    text: `<p>¡Para despachar mercancia de una factura debemos confirmar los rollos de la factura que están saliendo y los necesitamos saber donde se transportarán!</p>`
  },
  {
    attachTo: {
      element: '#factura',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'factura',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Código de Factura!</h4>',
    text: `<p>¡En este campo debemos colocar el codigo de la factura y presionar <b>'Enter'</b> para que nos salgan los rollos que esta tiene asignados!</p>`
  },
  {
    attachTo: {
      element: '#coductor',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'coductor',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Conductor!</h4>',
    text: `<p>¡En este campo debemos tenemos que escoger el conductor que transpotará la mercancia!</p>`
  },
  {
    attachTo: {
      element: '#placaCamion',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'placaCamion',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Placa del Camión!</h4>',
    text: `<p>¡Aquí hay que colocar la placa del camión donde se estará transportando la mercancia!</p>`
  },
  {
    attachTo: {
      element: '#tabla1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tabla1',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Rollos Consultados!</h4>',
    text: `<p>¡En esta tabla apareceran los rollos de la factura, debemos elegir los que se despacharán!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollos',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Elegir Todos los Rollos!</h4>',
    text: `<p>¡Presionando este checkbox se eligirán todos los rollos!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Elegir Rollo!</h4>',
    text: `<p>¡Presionando este checkbox se eligirá el rollo!</p>`
  },
  {
    attachTo: {
      element: '#cantidadTotal',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'cantidadTotal',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Total Producto!</h4>',
    text: `<p>¡Suma de la cantidad total de cada uno de los rollos que tiene la factura asignados!</p>`
  },
  {
    attachTo: {
      element: '#tabla2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tabla2',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Rollos Elegidos!</h4>',
    text: `<p>¡En esta tabla apareceran los rollos que hayan sido elegidos previamente!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollos2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollos2',
    title: '<h4 style="margin: auto; color: var(--rojo)">Quitar Todos los Rollos!</h4>',
    text: `<p>¡Presionando este checkbox se deseleccionarán todos los rollos que se hayan elegidos!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollo2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollo2',
    title: '<h4 style="margin: auto; color: var(--rojo)">Quitar Rollo!</h4>',
    text: `<p>¡Presionando este checkbox se deseleccionará el rollo!</p>`
  },
  {
    attachTo: {
      element: '#tabla3',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tabla3',
    title: '<h4 style="margin: auto; color: var(--rojo)">Tabla Consolidada!</h4>',
    text: `<p>¡Aquí aparecerán de manera consolidada por producto todos los rollos que hayan sido elegidos!<br>Se consolidarán por:</p>
          <ol>
            <li>Producto.</li>
            <li>Cantidad Total en kilos.</li>
            <li>Numero de rollos.</li>
          </ol>`
  },
  {
    attachTo: {
      element: '#despachar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'despachar',
    title: '<h4 style="margin: auto; color: var(--rojo)">Despachar Rollos Seleccionados!</h4>',
    text: `<p>¡Luego de haber seleccionado los rollos que queremos despachar presionamos <b>'Confirmar Rollos'</b> y listo, se habrán despachado los rollos!</p>`
  },
  {
    attachTo: {
      element: '#limpiarTodo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'limpiarTodo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Limpiar Todo!</h4>',
    text: `<p>¡Para limpiar todo (filtros y tablas) presionamos el botón <b>'Limpiar Todo'</b> y listo!</p>`
  },
];

export const stepsDevolverRolloDespacho : Step.StepOptions[]= [
  {
    attachTo: {
      element: '#formulario',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'formulario',
    title: '<h4 style="margin: auto; color: var(--rojo)">Devolver Mercancia!</h4>',
    text: `<p>¡Para devolver la mercancia de una factura debemos buscar los rollos de la factura que están devolviendo!</p>`
  },
  {
    attachTo: {
      element: '#factura',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'factura',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Código de Factura!</h4>',
    text: `<p>¡En este campo debemos colocar el codigo de la factura y presionar <b>'Enter'</b> para que nos salgan los rollos que esta tiene asignados!</p>`
  },
  {
    attachTo: {
      element: '#observacion',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'observacion',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Observacion!</h4>',
    text: `<p>¡Aquí podemos escribir una observación sobre la devolución que estamos realizando. Este campo es opcional!</p>`
  },
  {
    attachTo: {
      element: '#tabla1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tabla1',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Rollos Consultados!</h4>',
    text: `<p>¡En esta tabla apareceran los rollos que la factura tenga asociados!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollos',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Elegir Todos los Rollos!</h4>',
    text: `<p>¡Presionando este checkbox se eligirán todos los rollos!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Elegir Rollo!</h4>',
    text: `<p>¡Presionando este checkbox se eligirá el rollo!</p>`
  },
  {
    attachTo: {
      element: '#tabla2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tabla2',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Rollos Elegidos!</h4>',
    text: `<p>¡En esta tabla apareceran los rollos que hayan sido elegidos previamente!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollos2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollos2',
    title: '<h4 style="margin: auto; color: var(--rojo)">Quitar Todos los Rollos!</h4>',
    text: `<p>¡Presionando este checkbox se deseleccionarán todos los rollos que se hayan elegidos!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollo2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollo2',
    title: '<h4 style="margin: auto; color: var(--rojo)">Quitar Rollo!</h4>',
    text: `<p>¡Presionando este checkbox se deseleccionará el rollo!</p>`
  },
  {
    attachTo: {
      element: '#devolverRollos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'devolverRollos',
    title: '<h4 style="margin: auto; color: var(--rojo)">Facturar Rollos Seleccionados!</h4>',
    text: `<p>¡Luego de haber seleccionado los rollos que queremos devolver presionamos <b>'Crear Devolución'</b>y listo, los rollos se habrán devuelto y estarán disponibles de nuvo!</p>`
  },
  {
    attachTo: {
      element: '#limpiarTodo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'limpiarTodo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Limpiar Todo!</h4>',
    text: `<p>¡Para limpiar todo (filtros y tablas) presionamos el botón <b>'Limpiar Todo'</b> y listo!</p>`
  },
];

export const stepsMovimientosDespacho : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#formulario',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'formulario',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Filtros!</h4>',
    text: `<p>¡Llenando estos filtros podemos realizar una busqueda mas selectiva de la información de los movimientos que han habido en la bodega de despacho, si no queremos colocar filtros se buscará automaticamente por el día de hoy!</p>`
  },
  {
    attachTo: {
      element: '#consultar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'consultar',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Consultar Movimientos!</h4>',
    text: `<p>¡Luego de haber o no llenado los filtros se presionamos el botón <b>'Consultar'</b> para que despues de cargar nos aparezca la información de los movimientos en la bodega de despacho!</p>`
  },
  {
    attachTo: {
      element: '#limpiar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'limpiar',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Limpiar Todo!</h4>',
    text: `<p>¡Para limpiar todo (filtros y tablas) presionamos el botón <b>'Limpiar Todo'</b> y listo!</p>`
  },
  {
    attachTo: {
      element: '#tabla1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'table',
    title: '<h4 style="margin: auto; color: var(--rojo)">Movimientos Extrusión!</h4>',
    text: `<p>¡En esta tabla veremos todos los movimientos de la bodega de extrusión que consultamos</p>`
  },
  {
    attachTo: {
      element: '#sort',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'sort',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Filtros!</h4>',
    text: `<p>¡Con este botón se puede ordenar la información de la tabla por la columna en la que se implemente!</p>`
  },
  {
    attachTo: {
      element: '#pdf',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back
    ],
    classes: 'card',
    id: 'pdf',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Ver PDF!</h4>',
    text: `<p>¡al presionar este botón veremos la información completa del movimiento en un PDF!</p>`
  },
];

export const stepsPreIngresoRolloDespacho : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#formulario',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'formulario',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Filtros Busqueda de rollos!</h4>',
    text: `<p>¡Llenando estos filtros se pueden consultar los rollos que se quieren ingresar!</p>`
  },
  {
    attachTo: {
      element: '#consultarRollos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'consultarRollos',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Consultar Rollos!</h4>',
    text: `<p>¡Luego de haber llenado los filtros debemos presionar el botón <b>'Consultar Rollos'</b> para obtener la información de los rollos!</p><br>
            <p>Nota: Es necesario llenar el campo <b>'Proceso'</b>, porque este indicará de donde se buscarán los rollos a ingresar</p>`
  },
  {
    attachTo: {
      element: '#limpiarFiltros',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'limpiarFiltros',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Limpiar Filtros!</h4>',
    text: `<p>¡Para limpiar los filtros presionamos el botón <b>'Limpiar Campos'</b> y listo!</p>`
  },
  {
    attachTo: {
      element: '#tabla1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tabla1',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Rollos Consultados!</h4>',
    text: `<p>¡En esta tabla apareceran los rollos que coincidan con los filtros antes digitados!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollos',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Elegir Todos los Rollos!</h4>',
    text: `<p>¡Presionando este checkbox se eligirán todos los rollos que se hayan consultado!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Elegir Rollo!</h4>',
    text: `<p>¡Presionando este checkbox se eligirá el rollo!</p>`
  },
  {
    attachTo: {
      element: '#tabla2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tabla2',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Rollos Elegidos!</h4>',
    text: `<p>¡En esta tabla apareceran los rollos que hayan sido elegidos previamente!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollos2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollos2',
    title: '<h4 style="margin: auto; color: var(--rojo)">Quitar Todos los Rollos!</h4>',
    text: `<p>¡Presionando este checkbox se deseleccionarán todos los rollos que se hayan elegidos!</p>`
  },
  {
    attachTo: {
      element: '#elegirRollo2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'elegirRollo2',
    title: '<h4 style="margin: auto; color: var(--rojo)">Quitar Rollo!</h4>',
    text: `<p>¡Presionando este checkbox se deseleccionará el rollo!</p>`
  },
  {
    attachTo: {
      element: '#tabla3',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tabla3',
    title: '<h4 style="margin: auto; color: var(--rojo)">Tabla Consolidada!</h4>',
    text: `<p>¡Aquí aparecerán de manera consolidada por producto todos los rollos que hayan sido elegidos!<br>Se consolidarán por:</p>
          <ol>
            <li>Producto.</li>
            <li>Cantidad Total en kilos.</li>
            <li>Numero de rollos.</li>
          </ol>`
  },
  {
    attachTo: {
      element: '#ingresarRollo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'eliminarRollos',
    title: '<h4 style="margin: auto; color: var(--rojo)">Ingresar Rollos Seleccionados!</h4>',
    text: `<p>¡Luego de haber seleccionado los rollos que queremos ingresar presionamos <b>'Ingresar Producción'</b> y se hará un pre-ingresaro de los rollos a la badega de despacho!</p>`
  },
  {
    attachTo: {
      element: '#limpiarTodo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'limpiarTodo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Limpiar Todo!</h4>',
    text: `<p>¡Para limpiar todo (filtros y tablas) presionamos el botón <b>'Limpiar Todo'</b> y listo!</p>`
  },
];

/************************************************************** DESPERDICIO ***********************************************************************/
export const stepsDesperdicio : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#formulario',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'formulario',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Entrada de Desperdicio!</h4>',
    text: `<p>¡Llenando estos campos podemos registrar el desperdicio de una orden de trabajo!</p>`
  },
  {
    attachTo: {
      element: '#ordenTrabajo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'ordenTrabajo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Orden de Trabajo!</h4>',
    text: `<p>¡Inicialmente para crear un desperdicio debemos buscar la orden de trabajo de la cual vamos a registrar el desperdicio, para ello la digitamos y presionamos <b>'Enter'</b>!</p>`
  },
  {
    attachTo: {
      element: '#item',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'item',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Item!</h4>',
    text: `<p>¡Al buscar la orden e trabajo se llenará este campo automaticamente con el codigo del producto que la orden de trabajo tiene asociado!</p>`
  },
  {
    attachTo: {
      element: '#referencia',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'referencia',
    title: '<h4 style="margin: auto; color: var(--rojo)">Referencia!</h4>',
    text: `<p>¡Igual que el campo anterior al buscar la orden e trabajo se llenará este campo automaticamente con el nombre del producto que la orden de trabajo tiene asociado!</p>`
  },
  {
    attachTo: {
      element: '#material',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'material',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Material!</h4>',
    text: `<p>¡Igual que el campo anterior al buscar la orden e trabajo se llenará este campo automaticamente con el nombre del material que la orden de trabajo tiene asociado, a diferencia de los 2 anteriores podemos buscar un nuevo material para digitar en este campo si se desea!</p>`
  },
  {
    attachTo: {
      element: '#impresion',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'impresion',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Impresión!</h4>',
    text: `<p>¡Igual que el campo anterior al buscar la orden e trabajo se llenará este campo automaticamente marcando si la orden lleva impresión o no, de igual manera se puede cambiar si la orden lleva o no impresión!</p>`
  },
  {
    attachTo: {
      element: '#maquina',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'maquina',
    title: '<h4 style="margin: auto; color: var(--rojo)">Maquina!</h4>',
    text: `<p>¡Se debe seleccionar la maquina en la que se generó el desperdicio!</p>`
  },
  {
    attachTo: {
      element: '#operario',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'operario',
    title: '<h4 style="margin: auto; color: var(--rojo)">Operario!</h4>',
    text: `<p>¡Se debe seleccionar el operario que generó el desperdicio!</p>`
  },
  {
    attachTo: {
      element: '#conformidad',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'conformidad',
    title: '<h4 style="margin: auto; color: var(--rojo)">Conformidad!</h4>',
    text: `<p>¡Se debe seleccionar el tipo de no conformidad por la que se estaba generando el desperdicio!</p>`
  },
  {
    attachTo: {
      element: '#cantidad',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'cantidad',
    title: '<h4 style="margin: auto; color: var(--rojo)">Cantidad!</h4>',
    text: `<p>¡Se debe registrar la cantidad que se generó de desperdicio!</p>`
  },
  {
    attachTo: {
      element: '#area',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'area',
    title: '<h4 style="margin: auto; color: var(--rojo)">Área!</h4>',
    text: `<p>¡Se debe registrar el área en que se generó de desperdicio!</p>`
  },
  {
    attachTo: {
      element: '#fecha',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'fecha',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Fecha!</h4>',
    text: `<p>¡Se debe registrar la fecha en la que se generó de desperdicio!</p>`
  },
  {
    attachTo: {
      element: '#observacion',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'observacion',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Observación!</h4>',
    text: `<p>¡Aquí se puede colocar o no una observación general del desperdicio registrado!</p>`
  },
  {
    attachTo: {
      element: '#agregar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'agregar',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Agregar Desperdicio!</h4>',
    text: `<p>¡Al haber llenado todos los campos podemos presionar este botón y se envirará a la tabla siguiente la información digitada!</p>`
  },
  {
    attachTo: {
      element: '#limpiarCampos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'limpiarCampos',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Limpiar Campos!</h4>',
    text: `<p>¡Si queremos limpiar los campos de registro, presionamos este botón y listo!</p>`
  },
  {
    attachTo: {
      element: '#tabla',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'tabla',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Tabla con Registros!</h4>',
    text: `<p>¡Aquí se irán agregando los desperdicios que se vayan registrando!</p>`
  },
  {
    attachTo: {
      element: '#quitar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'quitar',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Quitar Registro!</h4>',
    text: `<p>¡Para eliminar uno de los registros que tenemos en la tabla presionamos este botón y listo!</p>`
  },
  {
    attachTo: {
      element: '#crear',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'crear',
    title: '<h4 style="margin: auto; color: var(--rojo)">Crear Registros!</h4>',
    text: `<p>¡Para <b>Crear</b> los desperdicios digitados presionamos este botón y listo!</p>`
  },
  {
    attachTo: {
      element: '#limpiarTodo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    classes: 'card',
    id: 'limpiarTodo',
    title: '<h4 style="margin: auto; color: var(--rojo)">Limpiar Todo!</h4>',
    text: `<p>¡Si queremos limpiar todo en este modulo podemos presionar este botón!</p>`
  },
];

export const stepsReporteDesperdicio : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#formulario',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'formulario',
    title: '<h4 style="margin: auto; color: var(--rojo)">Filtros de Consulta!</h4>',
    text: `<p>¡Llenando estos campos podemos realizar una busqueda más exacta de registros de desperdicios, si no los llenamos se buscará automaticamente por el día de hoy!</p>`
  },
  {
    attachTo: {
      element: '#consultar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'consultar',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Consultar!</h4>',
    text: `<p>¡Posterior a llenar o no los filtros debemos presionar este botón para iniciar la busqueda de los desperdicios registrados!</p>`
  },
  {
    attachTo: {
      element: '#limpiar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'limpiar',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Limpiar Filtros de Consulta!</h4>',
    text: `<p>¡Presionando este botón se podemos limpiar los filtros de busqueda!</p>`
  },
  {
    attachTo: {
      element: '#tabla',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'tabla',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Tabla!</h4>',
    text: `<p>¡En esta tabla podremos ver las ordenes de trabajo a las cuales se les ha registrado desperdicios!</p>`
  },
  {
    attachTo: {
      element: '#filtros',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'filtros',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Filtros de Tabla!</h4>',
    text: `<p>¡Mediante estos campos se puede filtrar la información de los registros que hay en la tabla, los filtros se aplican por columna!</p>`
  },
  {
    attachTo: {
      element: '#ver',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    classes: 'card',
    id: 'ver',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Ver Desperdicios De Una OT!</h4>',
    text: `<p>¡En la tabla la información saldrá de manera consolidad, para ver todos los registros de desperdicio debemos presionar click en el boton con el icono <b><i class="pi pi-eye" style="color: var(--rojo)"></i></b>. <br>Al hacer esto saldrá un modal con la información de los desperdicios de la orden!</p>`
  },
];

/************************************************************ INVERGOAL E INVERSUEZ *********************************************************************/
export const stepsInvergoalInversuez : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#none',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'none',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Invergoal e Inversuez!</h4>',
    text: `<p>¡Desde este apartado podemos ingresar las facturas de invergoal e inversuez que se han emitido!</p>`
  },
  {
    attachTo: {
      element: '#formulario',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'formulario',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Formulario!</h4>',
    text: `<p>¡Se puede ingresar la información de la factura de invergoal e inversuez, llenando estos campos!</p>`
  },
  {
    attachTo: {
      element: '#botones1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'botones1',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Acciones!</h4>',
    text: `<p>¡Se pueden ir añadiendo las facturas en la tabla de abajo presionando el botón de <b>Añadir Factura</b>, se podrán limpiar los campos presionando el botón de <b>Limpiar Campos</b>!</p>`
  },
  {
    attachTo: {
      element: '#tabla',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'tabla',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Tabla de Facturas!</h4>',
    text: `<p>¡En esta tabla estarán apareciendo las facturas que hayamos digitado y añadido previamente!</p>`
  },
  {
    attachTo: {
      element: '#botonesFinales',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.back,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'botonesFinales',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Ingresar o Limpiar Todo!</h4>',
    text: `<p>¡Si queremos ingresar las facturas que hemos digitado y añadido a la tabla presionamos el botón <b>Crear Entrada</b>!
    <br><br>
    ¡Para limpiar todos los campos y la tabla presionamos el botón <b>Limpiar Todo</b>!</p>`
  },
];

/********************************************************* GESTIÓN DE ARCHIVOS *******************************************************************/
export const stepsArchivos : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#formulario',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'formulario',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Creación de archios y carpetas!</h4>',
    text: `<p>¡Desde aquí se pueden <b>crear</b> archivos y carpetas!</p>`
  },
  {
    attachTo: {
      element: '#crearCarpeta',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'crearCarpeta',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Creación de carpetas!</h4>',
    text: `<p>¡Para <b>crear una carpeta</b> digitamos el nombre y presionamos el botón de <b>crear carpeta</b>!</p>`
  },
  {
    attachTo: {
      element: '#archivo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'archivo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Elegir Archivos!</h4>',
    text: `<p>¡Para elegir un archivo presionamos <b>'Elegir Archivo(s)'</b>, se nos abre el explorador de archivos y elegimos los que queramos!</p>
    <br><p>¡Para quitar los archivos presionamos en <b>'Cancelar'</b>!</p>`
  },
  {
    attachTo: {
      element: '#subirArchivo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'subirArchivo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Subir Archivos!</h4>',
    text: `<p>¡Despues de haber elegido el archivo a subir presionamos este botón y listo!</p>`
  },
  {
    attachTo: {
      element: '#tabla',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'tabla',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Tabla Archivos!</h4>',
    text: `<p>¡En esta tabla se verán todos los archivos de la carpeta que se encuentra en el servidor, aquí vamos a poder <b>copiar, mover, pegar, eliminar y descargar archivos</b>!</p>`
  },
  {
    attachTo: {
      element: '#abrirCarpeta',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'abrirCarpeta',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Abrir Carpeta!</h4>',
    text: `<p>¡Para <b>abrir una carpeta</b> tenemos que <b>presionar click sobre el nombre de la carpeta</b>!</p>`
  },
  {
    attachTo: {
      element: '#minimizar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'minimizar',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Regresar Carpeta!</h4>',
    text: `<p>¡Para <b>volver atras</b> tenemos que <b>presionar este botón</b>!</p>`
  },
  {
    attachTo: {
      element: '#descargar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'descargar',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Descargar Archivo!</h4>',
    text: `<p>¡Para <b>descargar un archivo</b> debemos <b>presionar este botón</b>!</p>`
  },
  {
    attachTo: {
      element: '#copiar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'copiar',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Copiar Archivos y Carpetas!</h4>',
    text: `<p>¡Para <b>copiar un archivo o carpeta presionamos este botón y nos aparecerá un mensaje de confirmación</b>, luego de eso <b>vamos a la carpeta donde queremos copiar el archivo o carpeta y lo pegamos</b>!</p>`
  },
  {
    attachTo: {
      element: '#mover',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'mover',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Mover Archivos y Carpetas!</h4>',
    text: `<p>¡Para <b>mover un archivo o carpeta presionamos este botón y nos aparecerá un mensaje de confirmación</b>, luego de eso <b>vamos a la carpeta a la que queremos mover el archivo o carpeta y lo pegamos</b>!</p>`
  },
  {
    attachTo: {
      element: '#pegar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'pegar',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Pegar Archivos y Carpetas!</h4>',
    text: `<p>¡Para <b>pegar un archivo o carpeta presionamos este botón en la cualquiera de los archivos o carpetas de la carpeta en donde lo queremos pegar</b> o bien podemos presionar el titulo <b>Pegar</b> de la columna!</p>`
  },
  {
    attachTo: {
      element: '#cancelar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'cancelar',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Cancelar una copia o movimiento!</h4>',
    text: `<p>¡Si luego de haber presionado <b>Copiar</b> o <b>Mover</b> no queremos ejecutar esta acción lo que debemos hacer es presionar <b>Cancelar</b> y listo, no se hará la acción!</p>`
  },
  {
    attachTo: {
      element: '#eliminar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    classes: 'card',
    id: 'eliminar',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Eliminar un archivo o carpeta!</h4>',
    text: `<p>¡Para <b>eliminar un archivo o carpeta</b> presionamos el botón y nos saldrá un mensaje de confirmación!</p>`
  },
];

/**************************************************************** MATERIA PRIMA ******************************************************************/
export const stepsAsignacionMateriaPrima : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#formulario',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'formulario',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Información acerca de la asignación!</h4>',
    text: `<p>¡Aquí se deberá llenar la información general de la asignación!</p>`
  },
  {
    attachTo: {
      element: '#ordenTrabajo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'ordenTrabajo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Orden de Trabajo!</h4>',
    text: `<p>¡Para realizar una <b>asignación de materia prima</b> debemos <b>primero buscar la orden</b> a la que le haremos la asignación, para ello diligenciamos este campo y presionamos <b>enter</b>!</p>`
  },
  {
    attachTo: {
      element: '#tabla1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'tabla1',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Información de la OT!</h4>',
    text: `<p>¡Al buscar la orden de trabajo se colocará en este espacio una breve información de la esta. <br>
    La columna llamada <b>Kg Total</b> dirá la cantidad total de kilos que se deben pesar para esta OT. <br>
    La columna llamada <b>Kg Restante</b> indicará la cantidad de materia prima que hace falta por asignar a la OT. Sí la cantidad es negativa no se podrá hacer la asignación!</p>`
  },
  {
    attachTo: {
      element: '#maquina',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'maquina',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Maquina!</h4>',
    text: `<p>¡Debemos colocar el <b>número de la maquina</b> a la que irá la materia prima, simplemente colocamos ese número en este campo!</p>`
  },
  {
    attachTo: {
      element: '#observacion',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'observacion',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Observación!</h4>',
    text: `<p>¡Si es necesario podemos colocar una descripción o observación acerca de la asignación de materia prima!</p>`
  },
  {
    attachTo: {
      element: '#materiaPrima',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'materiaPrima',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Materia Prima!</h4>',
    text: `<p>¡Para <b>elegir la Materia Prima</b> que se asignará debemos llenar estos campos!</p>`
  },
  {
    attachTo: {
      element: '#idMp',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'idMp',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Id Materia Prima!</h4>',
    text: `<p>¡Para <b>elegir la Materia Prima</b> tenemos 2 formas de hacerlo, la primera es digitando el <b>Id de la Materia Prima</b> en este campo y se llenarán automaticamente los otros campos!</p>`
  },
  {
    attachTo: {
      element: '#nombreMp',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'nombreMp',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Nombre Materia Prima!</h4>',
    text: `<p>¡La segunda opción para <b>elegir la Materia Prima</b> es seleccionarla de este campo, podemos filtrarla escribiendo el nombre o el código de la materia prima para que sea más rapida y sencilla la busqueda!</p>`
  },
  {
    attachTo: {
      element: '#stockMp',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'stockMp',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Stock Materia Prima!</h4>',
    text: `<p>¡Aquí podremos ver al <b>cantidad total de materia prima que hay en la bodega</b>!</p>`
  },
  {
    attachTo: {
      element: '#cantidad',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'cantidad',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Cantidad Materia Prima!</h4>',
    text: `<p>¡Tenemos que digitar la <b>cantidad de materia prima que asignaremos</b>, esta cantidad no puede ser mayor a la cantidad que aparece en stock!</p>`
  },
  {
    attachTo: {
      element: '#und',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'und',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Unidad de medida!</h4>',
    text: `<p>¡Esta es la unidad de medida en que se presenta la materia prima (Kg, Und, etc...), por lo general siempre es Kg!</p>`
  },
  {
    attachTo: {
      element: '#proceso',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'proceso',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Proceso!</h4>',
    text: `<p>¡Debe quedar registro del proceso al que saldrá la materia prima, por eso tenemos que elegirlo aquí!</p>`
  },
  {
    attachTo: {
      element: '#agregarMp',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'agregarMp',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Agregar Materia Prima!</h4>',
    text: `<p>¡Al terminar de llenar todos los campos de materia prima debemos agregar esta a la tabla, esto lo hacemos presionando este botón!</p>`
  },
  {
    attachTo: {
      element: '#limpiarMp',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'limpiarMp',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Limpiar Materia Prima!</h4>',
    text: `<p>¡Si por X o Y motivo queremos limpiar todos los campos de materia prima presionamos aquí!</p>`
  },
  {
    attachTo: {
      element: '#tabla2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'tabla2',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Tabla Materia Prima!</h4>',
    text: `<p>¡Todas las materias primas que hayamos elegido se estarán guardando y mostrando en esta tabla para posteriormente crear la asignación!</p>`
  },
  {
    attachTo: {
      element: '#quitarMp',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'quitarMp',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Quitar Materia Prima!</h4>',
    text: `<p>¡Antes de realizar la asignación debemos verificar todas las materias primas, sí llegamos a encontrar una materia prima con información erronea la podemos quitar de la tabla presionando el icono <i class="pi pi-trash"></i>!</p>`
  },
  {
    attachTo: {
      element: '#asignar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'asignar',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Asignar Materia Prima!</h4>',
    text: `<p>¡Si ya tenemos toda la información correcta procedemos a <b>Crear la asignación</b> presionando este botón. Al presionarlo se validará toda la información digitada y si está correcta aparecerá un mensaje de 'Asignación creada' de lo contrario enviará un mensaje indicando el fallo que ocurrió!</p>`
  },
  {
    attachTo: {
      element: '#limpiarTodo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'limpiarTodo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Limpiar Todo!</h4>',
    text: `<p>¡Para limpiar todo (filtros y tablas) presionamos el botón <b>'Limpiar Todo'</b> y listo!</p>`
  },
];

export const stepAsignacionTintas : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#intro',
      on: 'bottom-end'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'intro',
    title: `<h5 class="tituloRojo" style="margin: auto;">Creación de Materias Primas</h5>`,
    text: `<p>
            Aquí encontrarás 2 botones para realizar la <b>creación de tintas y materias primas </b>
            que aún no se encuentran registradas en el sistema.
          </p> `
  },
  {
    attachTo: {
      element: '#creacion-tintas',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'creacion-tintas',
    title: '<h5 class="tituloRojo" style="margin: auto;">Crear Tintas</h5>',
    text: `En estos campos debe agregar <b>la información detallada de la tinta que desea crear.</b>`
  },
  {
    attachTo: {
      element: '#asig-matprima',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'asig-matprima',
    title: '<h5 class="tituloRojo" style="margin: auto;">Elegir Materias Primas</h5>',
    text: `Aquí debes <b>elegir las materias primas necesarias que asignarás para la creación de la tinta.</b><br><br>
    <b>Nota:</b>`
  },
  {
    attachTo: {
      element: '#botones-add',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'botones-add',
    title: '<h5 class="tituloRojo" style="margin: auto;">Agregar Materias Primas</h5>',
    text: `Luego de elegir la materia prima que deseas asignar, <b>haz clic sobre el botón Agregar Mat. Prima</b> para añadirla a un listado en la tabla que se encuentra acontinuación<br><br>
    Si te equivocas en la elección de una materia prima, <b>haz clic sobre limpiar campos</b>`
  },
  {
    attachTo: {
      element: '#tabla',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'tabla',
    title: '<h5 class="tituloRojo" style="margin: auto;">Materias Primas a asignar</h5>',
    text: `En esta tabla encontrarás las materias primas que <b>elegiste asignar para la creación de la tinta.</b>`
  },
  {
    attachTo: {
      element: '#quitar-mp',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'quitar-mp',
    title: '<h5 class="tituloRojo" style="margin: auto;">Quitar Materias Primas elegidas</h5>',
    text: `En esta fila puedes <b>quitar material(es)</b> elegido(s) erróneamente, haciendo click sobre el icono <i class="pi pi-trash"></i>
    que observarás <b>cuando existan materias primas cargadas en la tabla.</b>`
  },
  {
    attachTo: {
      element: '#botones',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'botones',
    title: '<h5 class="tituloRojo" style="margin: auto;">Asignar Materias Primas</h5>',
    text: `Luego de cargar las materias primas <b>haz clic sobre Asignar Materia Prima</b> para registrarla en el sistema!<br><br>
    <b>Si deseas volver a iniciar la asignación</b> que llevas hasta ese momento por algún error de digitación, <b>haz clic sobre limpiar todo.</b>`
  },

];

export const stepsDevolucionesMp: Step.StepOptions[] = [
  {
    attachTo: {
      element: '#formulario',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'formulario',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Devoluciones de Materia Prima!</h4>',
    text: `<p>¡Podemos <b>crear devoluciones</b> de la materia prima asignada a una orden de trabajo!</p>`
  },
  {
    attachTo: {
      element: '#ordenTrabajo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'ordenTrabajo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Orden de Trabajo!</h4>',
    text: `<p>¡Para realizar una <b>devolución</b> necitamos saber a que <b>orden de trabajo</b> se le hará, por eso debemos <b>digitar el número de la orden aquí y presionar enter</b> para que nos cargue todas las <b>materias primas que esta orden tiene asignadas</b>!</p>`
  },
  {
    attachTo: {
      element: '#observacion',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'observacion',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Observación!</h4>',
    text: `<p>¡Si queremos resgitrar una observación o descripción de la devolución podemos hacerlo aquí, si no tenemos ningún comentario omitimos este campo dejandolo vacio!</p>`
  },
  {
    attachTo: {
      element: '#tabla1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'tabla1',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Tabla Materias Primas!</h4>',
    text: `<p>¡Al momento de <b>buscar la orden de trabajo</b> (como se mencionó 2 pasos atras) se nos <b>cargarán en esta tabla las materias primas que esta orden tiene asignadas</b>!</p>`
  },
  {
    attachTo: {
      element: '#elegirTodo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'elegirTodo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Elegir Todo!</h4>',
    text: `<p>¡Si queremos devolver todas las materias primas de las ordenes de compra, presionamos aquí y se eligirán todas las materias primas!</p>`
  },
  {
    attachTo: {
      element: '#elegir',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'elegir',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Elegir Materia Prima!</h4>',
    text: `<p>¡Para <b>elegir una de las materias primas presionamos el check</b> de la materia prima que queremos devolver!</p>`
  },
  {
    attachTo: {
      element: '#tabla2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'tabla2',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Materias Primas Seleccionadas!</h4>',
    text: `<p>¡Aquí podremos ver las <b>materias primas que hayamos elegido para ser devueltas</b>, podremos cambiar la cantidad a devolver y podremos quitar alguna materia prima si no la queremos devolver!</p>`
  },
  {
    attachTo: {
      element: '#elegirTodo2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'elegirTodo2',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Quitar Todo!</h4>',
    text: `<p>¡Para <b>deseleccionar todas las materias primas</b> que hemos seleccionado, presionamos click en este check y listo!</p>`
  },
  {
    attachTo: {
      element: '#cantidad',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'cantidad',
    title: '<h4 style="margin: auto; color: var(--rojo)">Editar Cantidad Materia Prima!</h4>',
    text: `<p>¡Para <b>editar la cantidad de una de las materias primas</b> que hemos seleccionado, presionamos click en el campo donde se encuentra la cantidad y digitamos cuanto vamos a devolver. La cantidad a devolver <b>no puede ser mayor a la cantidad asignada</b>!</p>`
  },
  {
    attachTo: {
      element: '#elegir2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'elegir2',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Quitar Materia Prima!</h4>',
    text: `<p>¡Si solo vamos a <b>deseleccionar una de las materias primas</b> que hemos seleccionado, presionamos click en este check y listo!</p>`
  },
  {
    attachTo: {
      element: '#agregarDevolucion',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'agregarDevolucion',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Crear Devolución!</h4>',
    text: `<p>¡Finalmente para <b>crear la devolución</b>, presionamos click en este botón y el programa se encargará de validar que todo lo que se haya digitado esté correcto!</p>`
  },
  {
    attachTo: {
      element: '#limpiarTodo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    classes: 'card',
    id: 'limpiarTodo',
    title: '<h4 style="margin: auto; color: var(--rojo)">Limpiar Todo!</h4>',
    text: `<p>¡Si queremos limpiar todo en este modulo podemos presionar este botón!</p>`
  },
];

export const stepsEntradasMp: Step.StepOptions[] = [
  {
    attachTo: {
      element: '#formulario',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'formulario',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Entrada de Materia Prima!</h4>',
    text: `<p>¡Podemos <b>realizar entradas de materia prima</b> desde aquí teniendo en cuenta unos campos que debemos llenar!</p>`
  },
  {
    attachTo: {
      element: '#ordenCompra',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'ordenCompra',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Orden de Compra!</h4>',
    text: `<p>¡Para realizar una <b>entrada</b> necitamos saber de que <b>orden de compra</b> es la factura o remisión que está entrando, por eso debemos <b>digitar el número de la orden aquí y presionar enter</b> para que nos cargue todas las <b>materias primas que esta orden tiene asignadas</b>!</p>`
  },
  {
    attachTo: {
      element: '#factura',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'factura',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Factura!</h4>',
    text: `<p>¡La materia prima que entra debe tener un documento contable, si es una factura debemos colocar el código de esa factura en este campo. Esto para saber y relacionar la factura a la orden de compra!</p>`
  },
  {
    attachTo: {
      element: '#remision',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'remision',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Remisión!</h4>',
    text: `<p>¡La materia prima que entra debe tener un documento contable, si es una remisión debemos colocar el código de esa misma en este campo. Esto para saber y relacionarla a la orden de compra!</p>`
  },
  {
    attachTo: {
      element: '#proveedor',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'proveedor',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Proveedor!</h4>',
    text: `<p>¡Al buscar la orden de compra se llenará información relacionada a esta, uno de los campos que se llenarán será el de proveedor!</p>`
  },
  {
    attachTo: {
      element: '#observacion',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'observacion',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Observación!</h4>',
    text: `<p>¡En este campo podemos digitar o no una observación sobre la entrada de materia prima!</p>`
  },
  {
    attachTo: {
      element: '#tabla1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'tabla1',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Tabla de Materia Prima!</h4>',
    text: `<p>¡En la primera tabla podemos encontrar las materias primas (despues de buscar la orden de compra) asociadas a la orden buscada. Si al buscar una orden de compra vemos que en esta tabla salen las materias primas de color rojo significará que estas ya han sido ingresadas en su totalidad!</p>`
  },
  {
    attachTo: {
      element: '#elegirTodo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'elegirTodo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Elegir Todo!</h4>',
    text: `<p>¡Tenemos la opción de elegir todas las materias primas que tiene asociada la orden, para esto tenemos este check que al presionarlo seleccionará todo!</p>`
  },
  {
    attachTo: {
      element: '#elegir',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'elegir',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Elegir Materia Prima!</h4>',
    text: `<p>¡Para elegir una de las materias primas de la orden de compra y hacerle el ingreso, tenemos este check para eso!</p>`
  },
  {
    attachTo: {
      element: '#tabla2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'tabla2',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Materias Primas Seleccionadas!</h4>',
    text: `<p>¡Aquí podremos ver las materias primas que hemos seleccionado previamente, tambien podemos deseleccionarlas y cambiar la cantidad que está ingresando!</p>`
  },
  {
    attachTo: {
      element: '#elegirTodo2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'elegirTodo2',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Quitar Todo!</h4>',
    text: `<p>¡Para <b>deseleccionar todas las materias primas</b> que hemos seleccionado, presionamos click en este check y listo!</p>`
  },
  {
    attachTo: {
      element: '#cantidad',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'cantidad',
    title: '<h4 style="margin: auto; color: var(--rojo)">Editar Cantidad Materia Prima!</h4>',
    text: `<p>¡Para <b>editar la cantidad de una de las materias primas</b> que hemos seleccionado, presionamos click en el campo donde se encuentra la cantidad y digitamos cuanto vamos a ingresar. La cantidad a ingresar <b>no puede ser mayor a la cantidad que estipula la orden de compra</b>!</p>`
  },
  {
    attachTo: {
      element: '#elegir2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'elegir2',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Quitar Materia Prima!</h4>',
    text: `<p>¡Si solo vamos a <b>deseleccionar una de las materias primas</b> que hemos seleccionado, presionamos click en este check y listo!</p>`
  },
  {
    attachTo: {
      element: '#acordeon',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'acordeon',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Factura y Remisión!</h4>',
    text: `<p>¡Si queremos relacionar una factura con una o unas remisiones podemos hacerlo desde aquí!</p>`
  },
  {
    attachTo: {
      element: '#remision2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'remision2',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Remisión a Relacionar!</h4>',
    text: `<p>¡Podemos buscar las remisiones que queremos relacionar desde aquí, solo colocamos el codigo y presionamos enter!</p>`
  },
  {
    attachTo: {
      element: '#tabla3',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'tabla3',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Tabla Remisiones!</h4>',
    text: `<p>¡La información de las remisiones que hayamos buscado para estará apareciendo aquí!</p>`
  },
  {
    attachTo: {
      element: '#ver',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'ver',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Ver Remisiones!</h4>',
    text: `<p>¡Adicional a la tabla informativa con la información general de la remisión podemos ver la mucho mas detalla la remisión si generamos un PDF de esta, para ello presionamos el icono <i class="pi pi-file-pdf"></i>!</p>`
  },
  {
    attachTo: {
      element: '#crearIngreso',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'crearIngreso',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Crear Ingreso!</h4>',
    text: `<p>¡Finalmente para <b>crear el ingreso</b>, presionamos click en este botón y el programa se encargará de validar que todo lo que se haya digitado esté correcto!</p>`
  },
  {
    attachTo: {
      element: '#limpiarTodo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    classes: 'card',
    id: 'limpiarTodo',
    title: '<h4 style="margin: auto; color: var(--rojo)">Limpiar Todo!</h4>',
    text: `<p>¡Si queremos limpiar todo en este modulo podemos presionar este botón!</p>`
  },
];

export const stepsOrdenesCompra: Step.StepOptions[] = [
  {
    attachTo: {
      element: '#crearProveedor',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'crearProveedor',
    title: `<h4 class="tituloRojo" style="margin: auto;">Crear Proveedor</h4>`,
    text: `<p>¡Para crear un nuevo proveedor presionamos este botón, llenamos los campos y presionamos <b>'Crear Proveedor'</b>!</p>`
  },
  {
    attachTo: {
      element: '#crearMatPrima',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'crearMatPrima',
    title: `<h5 class="tituloRojo" style="margin: auto;">Crear Materia Prima</h5>`,
    text: `<p>¡Para crear una materia prima nueva presionamos este botón, seleccionamos el tipo de materia prima que vamos a crear, llenamos los campos y presionamos <b>'Crear...'</b>!</p>`
  },
  {
    attachTo: {
      element: '#formulario',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'formulario',
    title: `<h5 class="tituloRojo" style="margin: auto;">Orden de Compra</h5>`,
    text: `<p>¡Inicialmente para crear una orden de compra debemos elegir quien nos venderá la materia prima, en el campo <b>Proveedor</b> escribimos el nombre y luego lo seleccionamos.
    <br>El campo de observación es opcional!</p>
    <p>Si queremos hacer una orden de compra con base en una <b>Solicitud de Materia Prima</b>, podemos <b>llenar el campo 'Num. Solicitud' y presionar enter</b>. Al hacer lo anterior se cargará toda la información de la solicitud y podremos agregar, editar o quitar materias primas.</p>`
  },
  {
    attachTo: {
      element: '#formularioMatPrima',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'formularioMatPrima',
    title: `<h5 class="tituloRojo" style="margin: auto;">Materias Primas</h5>`,
    text: `<p>¡Lo siguiente que debemos hacer es elegir la materia prima que vamos a comprar!</p>`
  },
  {
    attachTo: {
      element: '#idMatPrima',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'idMatPrima',
    title: `<h5 class="tituloRojo" style="margin: auto;">Id</h5>`,
    text: `<p>¡Para <b>elegir la Materia Prima</b> tenemos 2 formas de hacerlo, la primera es digitando el <b>Id de la Materia Prima</b> en el campo Id y presionando 'enter'!</p>`
  },
  {
    attachTo: {
      element: '#nombreMatprima',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'nombreMatprima',
    title: `<h5 class="tituloRojo" style="margin: auto;">Nombre</h5>`,
    text: `<p>¡La segunda opción es seleccionarla de el campo 'Materia Prima', podemos filtrarla escribiendo el nombre o el código de la materia prima para que sea más rapida y sencilla la busqueda!</p>`
  },
  {
    attachTo: {
      element: '#cantidadMatPrima',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'cantidadMatPrima',
    title: `<h5 class="tituloRojo" style="margin: auto;">Cantidad</h5>`,
    text: `<p>¡Posterior a esto debemos digitar la cantidad de materia prima que queremos!</p>`
  },
  {
    attachTo: {
      element: '#undMatPtima',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'undMatPtima',
    title: `<h5 class="tituloRojo" style="margin: auto;">Unidad de Medida</h5>`,
    text: `<p>¡Esta es la unidad de medida en que se presenta la materia prima (Kg, Und, etc...), por lo general siempre es Kg!</p>`
  },
  {
    attachTo: {
      element: '#precioMatPrima',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'precioMatPrima',
    title: `<h5 class="tituloRojo" style="margin: auto;">Precio</h5>`,
    text: `<p>¡Podemos o no cambiarle el precio (al crear la orden de compra las materias primas se actualizarán con el precio que se haya digitado para cada una)!</p>`
  },
  {
    attachTo: {
      element: '#agregarMatPrima',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'agregarMatPrima',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Agregar Materia Prima!</h4>',
    text: `<p>¡Al terminar de llenar todos los campos de materia prima debemos agregar esta a la tabla, esto lo hacemos presionando este botón!</p>`
  },
  {
    attachTo: {
      element: '#limpiarMatPrima',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'limpiarMatPrima',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Limpiar Materia Prima!</h4>',
    text: `<p>¡Si por X o Y motivo queremos limpiar todos los campos de materia prima presionamos aquí!</p>`
  },
  {
    attachTo: {
      element: '#tabla2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'tabla2',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Tabla Materia Prima!</h4>',
    text: `<p>¡Todas las materias primas que hayamos elegido se estarán guardando y mostrando en esta tabla para posteriormente crear la orden de compra!</p>`
  },
  {
    attachTo: {
      element: '#cantidadTabla',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'cantidadTabla',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Editar Cantidad!</h4>',
    text: `<p>¡Desde la misma tabla <b>podemos editar la cantidad de materia prima que tendrá la orden de compra</b>, esto lo hacemos <b>presionando click sobre la cantidad que vamos a editar y colocar la cantidad correcta</b>!</p>`
  },
  {
    attachTo: {
      element: '#quitarMp',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'quitarMp',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Quitar Materia Prima!</h4>',
    text: `<p>¡Antes de realizar la orden de compra debemos verificar todas las materias primas, sí llegamos a encontrar una materia prima con información erronea la podemos quitar de la tabla presionando el icono <i class="pi pi-trash"></i>!</p>`
  },
  {
    attachTo: {
      element: '#crearOrden',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'crearOrden',
    title: '<h4 style="margin: auto; color: var(--rojo)">Crear Orden de Compra!</h4>',
    text: `<p>¡Si ya tenemos toda la información correcta procedemos a <b>Crear la Orden de compra</b> presionando este botón. Al presionarlo se validará toda la información digitada y si está correcta aparecerá un mensaje preguntando si queremos ver un pdf de la orden creada, de lo contrario enviará un mensaje indicando el fallo que ocurrió!</p>`
  },
  {
    attachTo: {
      element: '#limpiarTodo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'limpiarTodo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Limpiar Todo!</h4>',
    text: `<p>¡Para limpiar todo (filtros y tablas) presionamos el botón <b>'Limpiar Todo'</b> y listo!</p>`
  },
];

export const stepsRecuperado: Step.StepOptions[] = [
  {
    attachTo: {
      element: '#formulario1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'formulario1',
    title: `<h4 class="tituloRojo" style="margin: auto;">Recuperado</h4>`,
    text: `<p>¡Para registrar la materia prima recuperada necesitamos llenar a siguiente información!</p>`
  },
  {
    attachTo: {
      element: '#idOperario',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'idOperario',
    title: `<h4 class="tituloRojo" style="margin: auto;">Id Operario</h4>`,
    text: `<p>¡Podemos seleccionar el operariocon base en su codigo del programa, para ello lo escribimos y presionamos 'enter'!</p>`
  },
  {
    attachTo: {
      element: '#nombreOperario',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'nombreOperario',
    title: `<h5 class="tituloRojo" style="margin: auto;">Nombre Operario</h5>`,
    text: `<p>¡Podemos elegir el operario buscandolo en esta lista desplegable!</p>`
  },
  {
    attachTo: {
      element: '#turno',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'turno',
    title: `<h5 class="tituloRojo" style="margin: auto;">Turno</h5>`,
    text: `<p>¡Hay que registrar el turno en el que salió el recuperado, esto lo hacemos eligiendolo en esta lista desplegable!</p>`
  },
  {
    attachTo: {
      element: '#fecha',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'fecha',
    title: `<h5 class="tituloRojo" style="margin: auto;">Fecha</h5>`,
    text: `<p>¡Otro de los campos que necesitamos es elegir la fecha en que salió el recuperado!</p>`
  },
  {
    attachTo: {
      element: '#observacion',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'observacion',
    title: `<h5 class="tituloRojo" style="margin: auto;">Observación</h5>`,
    text: `<p>¡La observcaión es un campo opcional, en este campo podemos escribir una breve descripción o observación del recuperado!</p>`
  },
  {
    attachTo: {
      element: '#formulario2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'formulario2',
    title: `<h5 class="tituloRojo" style="margin: auto;">Materia Prima</h5>`,
    text: `<p>¡Con este formulario debemos elegir la materia prima que vamos a ingresar como recuperada!</p>`
  },
  {
    attachTo: {
      element: '#idMatPrima',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'idMatPrima',
    title: `<h5 class="tituloRojo" style="margin: auto;">Id</h5>`,
    text: `<p>¡Para <b>elegir la Materia Prima</b> tenemos 2 formas de hacerlo, la primera es digitando el <b>Id de la Materia Prima</b> en el campo Id y presionando 'enter'!</p>`
  },
  {
    attachTo: {
      element: '#nombreMatprima',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'nombreMatprima',
    title: `<h5 class="tituloRojo" style="margin: auto;">Nombre</h5>`,
    text: `<p>¡La segunda opción es seleccionarla de el campo 'Materia Prima', podemos filtrarla escribiendo el nombre o el código de la materia prima para que sea más rapida y sencilla la busqueda!</p>`
  },
  {
    attachTo: {
      element: '#cantidadMatPrima',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'cantidadMatPrima',
    title: `<h5 class="tituloRojo" style="margin: auto;">Cantidad</h5>`,
    text: `<p>¡Posterior a esto debemos digitar la cantidad de materia prima que queremos!</p>`
  },
  {
    attachTo: {
      element: '#undMatPtima',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'undMatPtima',
    title: `<h5 class="tituloRojo" style="margin: auto;">Unidad de Medida</h5>`,
    text: `<p>¡Esta es la unidad de medida en que se presenta la materia prima (Kg, Und, etc...), por lo general siempre es Kg!</p>`
  },
  {
    attachTo: {
      element: '#agregarMatPrima',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'agregarMatPrima',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Agregar Materia Prima!</h4>',
    text: `<p>¡Al terminar de llenar todos los campos de materia prima debemos agregar esta a la tabla, esto lo hacemos presionando este botón!</p>`
  },
  {
    attachTo: {
      element: '#limpiarMatPrima',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'limpiarMatPrima',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Limpiar Materia Prima!</h4>',
    text: `<p>¡Si por X o Y motivo queremos limpiar todos los campos de materia prima presionamos aquí!</p>`
  },
  {
    attachTo: {
      element: '#tabla2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'tabla2',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Tabla Materia Prima!</h4>',
    text: `<p>¡Todas las materias primas que hayamos elegido se estarán guardando y mostrando en esta tabla para posteriormente registrar el recuperado!</p>`
  },
  {
    attachTo: {
      element: '#quitarMp',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'quitarMp',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Quitar Materia Prima!</h4>',
    text: `<p>¡Antes de realizar el registro debemos verificar todas las materias primas, sí llegamos a encontrar una materia prima con información erronea la podemos quitar de la tabla presionando el icono <i class="pi pi-trash"></i>!</p>`
  },
  {
    attachTo: {
      element: '#crear',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'crear',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Registrar Recuperado!</h4>',
    text: `<p>¡Si ya tenemos toda la información correcta procedemos a <b>Regitrar el Recuperado</b> presionando este botón. Al presionarlo se validará toda la información digitada y si está correcta aparecerá un mensaje de confirmación indicando que el registro se realizó de manera exitosa, de lo contrario enviará un mensaje indicando el fallo que ocurrió!</p>`
  },
  {
    attachTo: {
      element: '#limpiarTodo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'limpiarTodo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Limpiar Todo!</h4>',
    text: `<p>¡Para limpiar todo (filtros y tablas) presionamos el botón <b>'Limpiar Todo'</b> y listo!</p>`
  },
];

export const stepsSolicitudMateriaPrima : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#none',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'none',
    title: `<h4 class="tituloRojo" style="margin: auto;">¡Solicitud de Materia Prima!</h4>`,
    text: `<p>¡El operador a cargo de esa área presentará a la gerencia sus pedidos de materia prima.!</p>`
  },
  {
    attachTo: {
      element: '#formulario',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'formulario',
    title: `<h4 class="tituloRojo" style="margin: auto;">¡Creación y edición!</h4>`,
    text: `<p>¡Desde aquí podremos consultar solicitudes pasadas para editarlas o simplemente para ver un PDF de las mismas, tambien podemos colocar una observación a una solicitud que estemos creando!</p>`
  },
  {
    attachTo: {
      element: '#codigoSolicitud',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'codigoSolicitud',
    title: `<h4 class="tituloRojo" style="margin: auto;">¡Código Solicitud!</h4>`,
    text: `<p>¡Desde aquí podemos <b>cosultar otras solicitudes de materias primas</b>, esto lo hacemos <b>digitando el código de la solicitud y presionando enter</b>. Si quieremos ver el PDF de esta solicitud digitamos el código y presionamos el botón rojo!</p>`
  },
  {
    attachTo: {
      element: '#formularioMateriaPrima',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'formularioMateriaPrima',
    title: `<h4 class="tituloRojo" style="margin: auto;">¡Materias Primas!</h4>`,
    text: `<p>¡Para elegir las materias primas llenamos los siguientes campos de la siguiente manera!</p>`
  },
  {
    attachTo: {
      element: '#idMatPrima',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'idMatPrima',
    title: `<h4 class="tituloRojo" style="margin: auto;">¡Id de Materia Prima!</h4>`,
    text: `<p>¡La primera forma de buscar las materias primas es <b>digitar el código de la materia prima y presionar enter</b>!</p>`
  },
  {
    attachTo: {
      element: '#nombreMatprima',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'nombreMatprima',
    title: `<h4 class="tituloRojo" style="margin: auto;">¡Nombre de Materia Prima!</h4>`,
    text: `<p>¡La segunda forma de buscar una materia prima es buscarlo por esta lista desplegable, para facilitar la busqueda podemos escribir el código o el nombre de la materia prima!</p>`
  },
  {
    attachTo: {
      element: '#cantidadMatPrima',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'cantidadMatPrima',
    title: `<h4 class="tituloRojo" style="margin: auto;">¡Cantidad de Materia Prima!</h4>`,
    text: `<p>¡En este campo digitamos la <b>cantidad de materia prima que queremos solicitar</b>!</p>`
  },
  {
    attachTo: {
      element: '#undMatPrima',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'undMatPrima',
    title: `<h4 class="tituloRojo" style="margin: auto;">¡Medida de Materia Prima!</h4>`,
    text: `<p>¡Este campo se llenará automaticamente al buscar la materia prima!</p>`
  },
  {
    attachTo: {
      element: '#botones',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'botones',
    title: `<h4 class="tituloRojo" style="margin: auto;">¡Botones Materia Prima!</h4>`,
    text: `<p>¡Con estos botones podemos seleccionar las materias primas y/o limpiar los campos!</p>`
  },
  {
    attachTo: {
      element: '#agregarMatPrima',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'agregarMatPrima',
    title: `<h4 class="tituloRojo" style="margin: auto;">¡Agregar Materia Prima!</h4>`,
    text: `<p>¡Luego de llenar los campos de materias primas podemos presionar este botón para que se vayan agregando a la tabla que tenemos acontinuación, si los campos de materia prima no están llenos este botón estará deshabilitado!</p>`
  },
  {
    attachTo: {
      element: '#limpiarMatPrima',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'limpiarMatPrima',
    title: `<h4 class="tituloRojo" style="margin: auto;">¡Limpiar Campos!</h4>`,
    text: `<p>¡Para limpiar los campos de materias primas presionamos este botón!</p>`
  },
  {
    attachTo: {
      element: '#tabla',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'tabla',
    title: `<h4 class="tituloRojo" style="margin: auto;">¡Tabla Materia Prima!</h4>`,
    text: `<p>¡En esta tabla se estarán guardando las materias primas que hayamos seleccionado anteriormente!</p>`
  },
  {
    attachTo: {
      element: '#accion',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'accion',
    title: `<h4 class="tituloRojo" style="margin: auto;">¡Quitar y Eliminar!</h4>`,
    text: `<p>En ese apartado podemos eliminar y quitar materias primas.</p>
          <p>
            Cuando tenemos una solicitud de materia prima creada desde cero, si presionamos el icono <i class="pi pi-trash"></i> y nos saldrá un mensaje de confirmación.
          </p>`
  },
  {
    attachTo: {
      element: '#crearSolicitud',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'crearSolicitud',
    title: `<h4 class="tituloRojo" style="margin: auto;">¡Crear y Editar Solicitud!</h4>`,
    text: `<p>Aquí podemos crear y editar la solicitud de materias primas</p>
          <ul>
            <li><b>Crear Solicitud:</b> Luego de haber completado todos los campos, podemos presionar este botón y se empezarán a validar todos los pasos, si están correctos nos saldrá un mensaje de confirmación y se generará un PDF</li>
            <li><b>Editar Solicitud:</b> Si estamos editando una solicitud el nombre del botón cambiará, de igual manera que al crear las solicitudes, se empezarán a validar todos los pasos, si están correctos nos saldrá un mensaje de confirmación y se generará un PDF</li>
          </ul>`
  },
  {
    attachTo: {
      element: '#limpiarTodo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'limpiarTodo',
    title: `<h4 class="tituloRojo" style="margin: auto;">¡Limpiar Todo!</h4>`,
    text: `<p>¡Para limpiar todos los campos y tablas presionamos este botón!</p>`
  },
];

export const stepsMovSolicitudesMP : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#movimientos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'movimientos',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-arrow-right-arrow-left"></i> Mov. de solicitudes</h5>',
    text: `<p>En este reporte se pueden ver los <b>movimientos de solicitudes de materias primas</b>, podrás apreciar la cantidad de
    solicitudes tanto <b>aceptadas, como pendientes, parciales y finalizadas.</b> <br><br>
    Tendrás filtros de búsqueda por:<br>
    <b>- Id de solicitud</b><br>
    <b>- Fechas de la solicitud</b><br>
    <b>- Estado de la solicitud</b><br><br>
    Además podrás apreciar en que estado se encuentra las solicitudes y los materiales de la mismas.<br><br>
    También podrás <b>cargar los datos de la solicitud en un modal de ordenes de compra, y cancelar o finalizar la solicitud</b>.</p>`
  },
  {
    attachTo: {
      element: '#rojo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'rojo',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-ban"></i> Solicitudes canceladas</h5>',
    text: `<p>Aquí se podrá apreciar <b>la cantidad de solicitudes de materia prima que se encuentran canceladas actualmente</b><br><br>
    Las solicitudes con estado cancelado son las que: <br>
    - <b>No fueron aprobadas por gerencia,</b> por ende, no se les creó una orden de compra.<br>
    - Se les creó una orden de compra, pero la gerencia decidió cancelarla <b>porque no creyó necesaria la compra de más material.</b><br><br>
    Además <b>haciendo click aquí se cargarán las solicitudes con este estado</b> en la tabla de registros consultados.</p>`
  },
  {
    attachTo: {
      element: '#naranja',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'naranja',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-exclamation-triangle"></i> Solicitudes pendientes</h5>',
    text: `<p>En este apartado podrás apreciar <b>la cantidad de solicitudes de materia prima que se encuentran pendientes actualmente</b><br><br>
    Las solicitudes con estado pendiente son las que <b>no han sido aprobadas por gerencia, por ende no se les ha creado ordenes de compra</b><br><br>
    Además <b>haciendo click aquí se cargarán las solicitudes con este estado</b> en la tabla de registros consultados.</p>`
  },
  {
    attachTo: {
      element: '#amarillo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'amarillo',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-sliders-h"></i> Solicitudes parciales</h5>',
    text: `<p>En este apartado podrás visualizar <b>la cantidad de solicitudes de materia prima que se encuentran parciales actualmente</b><br><br>
    Las solicitudes con estado parcial son las que <b>ya han sido aprobadas por gerencia, ya tienen ordenes de compra asociadas, pero no se pidió toda la materia prima de la solicitud.</b><br><br>
    Además <b>haciendo click aquí se cargarán las solicitudes con este estado</b> en la tabla de registros consultados.</p>`
  },
  {
    attachTo: {
      element: '#verde',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'verde',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-check"></i> Solicitudes finalizadas</h5>',
    text: `<p>Aquí encontraremos <b> la cantidad de solicitudes de materia prima que se encuentran finalizadas actualmente</b><br><br>
    Las solicitudes con estado finalizado son las que <b>ya han sido aprobadas por gerencia, ya tienen ordenes de compra asociadas, y se pidió toda la materia prima solicitada.</b><br><br>
    Además  <b>haciendo click aquí se cargarán las solicitudes con este estado</b> en la tabla de registros consultados.</p>`
  },
  {
    attachTo: {
      element: '#formulario1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'formulario1',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-filter"></i> Filtros</h5>',
    text: `<p>Aquí encontraremos <b>los filtros de búsqueda donde podrás realizar tus consultas.</b><br><br>
    Además podrás crear las combinaciones que desees llenando los campos: <br>
    <b>- Id de solicitud</b><br>
    <b>- Fecha Inicial de la solicitud</b><br>
    <b>- Fecha Final de la solicitud</b><br>
    <b>- Estado de la solicitud</b><br><br>
    Y luego solo <b>pulsa el botón consultar para ver la información solicitada!</b></p>`
  },
  {
    attachTo: {
      element: '#botones1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'botones1',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-search"></i> Consultar / <i class="pi pi-eraser"></i> Limpiar Campos</h5>',
    text: `<p>Luego de llenar los filtros por los que deseas realizar tu búsqueda, <b>haz clic sobre el botón Consultar para cargar la información del encabezado de la solicitud de materia prima en la tabla</b> de registros consultados.
    <br><br>Para reiniciar tu busqueda solo <b>haz click sobre el botón limpiar campos.</b></p>`
  },
  {
    attachTo: {
      element: '#tabla1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'tabla1',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-list"></i> Encabezado de solicitudes</h5>',
    text: `<p>Aquí podrás apreciar <b>el encabezado de las solicitudes de materia prima que se encontraron luego de realizar tu consulta,</b> entre ellos su:<br><br>
    <b>- Id</b><br>
    <b>- Fecha Creación</b><br>
    <b>- Estado General</b></p>`
  },
  {
    attachTo: {
      element: '#detalle',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'detalle',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-eye"></i> Ver detalles de la solicitud</h5>',
    text: `<p>Si existen registros en la tabla, <b>pulsa sobre el botón <i class="pi pi-eye"></i></b> para ver detalles de la solicitud del registro que seleccionaste. <br><br>
    podrás apreciar <b>número de solicitud, operario solicitante, materias primas, cantidad pedida, unidad de medida y el estado de las mismas</b> en la tabla detalles de la solicitud.</p>`
  },
  {
    attachTo: {
      element: '#matprimas',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'matprimas',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-list"></i> Detalles de la solicitud</h5>',
    text: `<p>En este apartado podrás ver <b>los detalle de las solicitudes de materia prima que selecciones de la tabla registros consultados.</b></p>`
  },
  {
    attachTo: {
      element: '#usuario',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'usuario',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-user"></i> Usuario solicitante</h5>',
    text: `<p>Luego de hacer click en <b>el botón <i class="pi pi-eye"></i> ver detalles</b> en la tabla registros consultados, <b>aquí visualizarás el nombre del usuario que realizó el pedido de materia prima.</b></p>`
  },
  {
    attachTo: {
      element: '#tabla2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'tabla2',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-box"></i> Materias Primas</h5>',
    text: `<p>Aquí podrás apreciar <b>las materias primas solicitadas, la cantidad pedida, la cantidad aprobada, unidad de medida y el estado de las mismas</b><br><br></p>`
  },
  {
    attachTo: {
      element: '#aprobada',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'aprobada',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-box"></i> Cantidad aprobada</h5>',
    text: `<p>Este campo se refiere a <b>la cantidad de cada item de materia prima que se pidió en la(s) orden(es) de compra asociada a la solicitud</b> que esté visualizando en el momento.<br><br></p>`
  },
  {
    attachTo: {
      element: '#crear-oc',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'crear-oc',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-window-maximize"></i> Cargar modal.</h5>',
    text: `<p>Pulsando sobre este botón <b>se mostrará un modal con el módulo de ordenes de compras</b> y se cargará el <b>campo Num. Solicitud</b> con el Id de la solicitud de materia prima.</b><br><br>
    Asi como también <b>se cargará la tabla con las materias pedidas en la solicitud,</b> dicha tabla cuenta con 2 funcionalidades importantes tales como:<br><br>
    <b>1. El campo de cantidad editable:</b> Haciendo clic sobre este campo podrás modificar la cantidad solicitada por el usuario.<br>
    <b>2. Quitar materia(s) prima(s):</b> Haciendo clic sobre el botón <i class="pi pi-trash"></i> <b>podrás quitar las materias primas</b> que no deseas que se encuentren en la orden de compra por el motivo que desees.<br> </p>`
  },
  {
    attachTo: {
      element: '#finalizar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'finalizar',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-check-square"></i> Finalizar solicitud</h5>',
    text: `<p>pulsando sobre este botón podrás finalizar la solicitud de materia prima, <b>solo si su estado general (estado del encabezado) es pendiente ó parcial</b><br><br>
    Ten en cuenta que:<br>
    - <b>Si al menos una materia prima solicitada</b> tiene estado pendiente, <b>cambiará a cancelada.</b><br>
    - <b>Si al menos una materia prima solicitada</b> tiene estado parcial, <b>cambiará a finalizada.</b>
    </p>`
  },
  {
    attachTo: {
      element: '#cancelar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'cancelar',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-ban"></i> Cancelar solicitud</h5>',
    text: `<p>pulsando sobre este botón podrás cancelar la solicitud de materia prima, <b>solo si su estado general (estado del encabezado) es pendiente ó parcial</b><br><br>
    Ten en cuenta que:<br>
    - <b>Si al menos una materia prima solicitada</b> tiene estado pendiente, <b>cambiará a cancelada.</b><br>
    - Si al menos <b>una materia prima solicitada</b> tiene estado parcial, <b>cambiará a finalizada.</b></p>`
  },
]

export const stepsSolicitudMaterialProduccion : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#titulo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'titulo',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class=""></i> Solicitudes de material</h5>',
    text: `<p>En este módulo podrás realizar <b>las solicitudes de material de producción</b> al encargado del inventario de materias primas. <br><br>
    Haz clic en siguiente y <b>mira el paso a paso que creamos para ti!</b></p>`
  },
  {
    attachTo: {
      element: '#solicitud',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'solicitud',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class=""></i> N° Solicitud</h5>',
    text: `<p>En este campo inicialmente visualizarás el <b>último consecutivo de la solicitud.</b><br><br>
    Además podrás visualizar la solicitud que desees, <b>digitando el N° de la solicitud y presionando la tecla enter</b><br><br>
    Si la solicitud existe, <b>se cargarán las materias prima asociadas</b> en la tabla que se encuentra en la parte inferior, donde podrás <b>agregar,
    editar y eliminar las materias primas</b>.
    </p>`
  },
  {
    attachTo: {
      element: '#ordenTrabajo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'ordenTrabajo',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class=""></i> N° Orden de trabajo</h5>',
    text: `<p>En este campo <b>debes digitar la orden de trabajo para la cual deseas solicitar el material</b> y luego presionar la tecla enter.<br><br>
    Si la OT existe se cargará los siguientes datos:<br>
    <b>- Cliente</b><br>
    <b>- Referencia</b><br>
    <b>- Tope de kilos de material a entregar.</b><br>
    <b>- Cantidad restante por entregar</b></p>`
  },
  {
    attachTo: {
      element: '#maquina',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'maquina',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class=""></i> Maquina</h5>',
    text: `<p>En este campo <b>debes digitar el n° de la maquina</b> en la cual se utilizará el material solicitado.</p>`
  },
  {
    attachTo: {
      element: '#proceso',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'proceso',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class=""></i> Proceso</h5>',
    text: `<p>En este campo <b>debes seleccionar el nombre del proceso</b> en el cual será utilizado el material solicitado.<br><br>
    Recuerda que inicialmente se carga el proceso de <b>Extrusion</b></p>`
  },
  {
    attachTo: {
      element: '#observacion',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'observacion',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class=""></i> Observación</h5>',
    text: `<p>En este campo <b>puedes realizar un comentario u observación general de tu solicitud</b>.<br><br>
    Dicha observación <b>podrá ser visualizada por el operario encargado de la entrega de materia prima</b></p>`
  },
  {
    attachTo: {
      element: '#tabla1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'tabla1',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class=""></i> Detalles de la OT</h5>',
    text: `<p>Si existe la OT que consultaste inicialmente se cargarán los siguientes datos:<br>
    <b>- Cliente</b><br>
    <b>- Referencia</b><br>
    <b>- Tope de kilos de material a entregar.</b><br>
    <b>- Cantidad restante por entregar</b></p>`
  },
  {
    attachTo: {
      element: '#materiaPrima',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'materiaPrima',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class=""></i> Selección de material</h5>',
    text: `<p>Aquí puedes seleccionar los materiales que deseas solicitar.
    Existen 2 formas de seleccionar el material:<br><br>
    1. Si conoces el Id del material, <b>digitalo en el campo Id y presiona enter</b>. Esta acción cargará el nombre.<br>
    2. También <b>puedes escribir el nombre en el campo Materia Prima,</b> allí se cargará una lista desplegable con materiales, <b>selecciona el que deseas solicitar.</b><br><br>
    Luego de cargar el nombre del material <b>digita la cantidad que deseas solicitar</b> y selecciona la unidad de medida,
    que inicialmente es <b>Kg (Kilogramos)</b>.
    </p>`
  },
  {
    attachTo: {
      element: '#botones1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'botones1',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class=""></i> Agregar Material</h5>',
    text: `<p><b>Haciendo clic sobre el botón "agregar materia prima" </b>se cargará en la tabla el material que seleccionaste inicialmente y
    que deseas solicitar.<br><br>
    Si tienes algún error de digitación al momento de seleccionar un material, solo haz clic el <b>botón en limpiar campos mp</b>
    </p>`
  },
  {
    attachTo: {
      element: '#tabla2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'tabla2',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class=""></i> Material a solicitar</h5>',
    text: `<p>En esta tabla encontrarás las materias primas que seleccionaste inicialmente y que deseas solicitar<br><br>
    Si tienes algún error de digitación en los materiales cargados en la tabla, <b>tienes la opción de quitarlo haciendo clic el botón</b> <i class="pi pi-trash"></i>
    </p>`
  },
  {
    attachTo: {
      element: '#cantidad2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'cantidad2',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class=""></i> Editar cantidad</h5>',
    text: `<p><b>Este campo es editable</b>, si te equivocas, solo haz clic sobre este campo de la tabla
    y <b>digita la cantidad que en realidad deseas solicitar y listo!</b></p>`
  },
  {
    attachTo: {
      element: '#quitarMP',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'quitarMP',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class=""></i> Quitar material</h5>',
    text: `<p>Si definitivamente te equivocaste en uno de los materiales seleccionados, <b>quitalo de la tabla haciendo clic sobre el icono <i class="pi pi-trash"></i></b></p>`
  },
  {
    attachTo: {
      element: '#botones2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'botones2',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class=""></i> Crear Solicitud</h5>',
    text: `<p>Luego de seleccionar los materiales que deseas solicitar, <b>haz clic sobre el botón "crear solicitud" para guardar el registro</b><br><br>
    Luego de esto, <b>se generará un formato PDF con las especificaciones de la solicitud</b>.<br><br>
    Si te arrepientes de realizar la solicitud y ya tenías información cargada en la tabla y en el formulario de la parte superior, <b>haz clic sobre el botón limpiar todo!</b>
    </p>`
  },
]

export const stepsMovSolicitudesMPExtrusion : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#movimientos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'movimientos',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-arrow-right-arrow-left"></i> Mov. de solicitudes</h5>',
    text: `<p>En este reporte se pueden ver los <b>movimientos de solicitudes de material de producción</b>, podrás apreciar la cantidad de
    solicitudes <b>aceptadas, pendientes, parciales y finalizadas.</b> <br><br>
    Tendrás filtros de búsqueda por:<br>
    <b>- Id de solicitud</b><br>
    <b>- Fechas de la solicitud</b><br>
    <b>- Estado de la solicitud</b><br><br>
    Además podrás apreciar en que estado se encuentra las solicitudes y los materiales de la mismas.<br><br>
    También podrás <b>cargar los datos de la solicitud en un modal de asignaciones, y cancelar o finalizar la solicitud</b>.</p>`
  },
  {
    attachTo: {
      element: '#rojo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'rojo',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-ban"></i> Solicitudes canceladas</h5>',
    text: `<p>Aquí se podrá apreciar <b>la cantidad de solicitudes de material que se encuentran canceladas actualmente de las ultimas 100 creadas.</b><br><br>
    <b>Nota:</b> A las solicitudes con estado cancelado no se les puede crear una asignación.<br><br>
    Además <b>haciendo click aquí se cargarán las solicitudes con este estado</b> en la tabla de registros consultados.</p>`
  },
  {
    attachTo: {
      element: '#naranja',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'naranja',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-exclamation-triangle"></i> Solicitudes pendientes</h5>',
    text: `<p>En este apartado podrás apreciar <b>la cantidad de solicitudes de material que se encuentran pendientes actualmente de las ultimas 100 creadas.</b><br><br>
    Las solicitudes con estado pendiente son a las que <b>no se les ha creado ó asociado una asignación.</b><br><br>
    Además <b>haciendo click aquí se cargarán las solicitudes con este estado</b> en la tabla de registros consultados.</p>`
  },
  {
    attachTo: {
      element: '#amarillo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'amarillo',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-sliders-h"></i> Solicitudes parciales</h5>',
    text: `<p>En este apartado podrás visualizar <b>la cantidad de solicitudes de material que se encuentran parciales actualmente de las ultimas 100 creadas.</b><br><br>
    Las solicitudes con estado parcial son las que <b>ya han sido aprobadas por el encargado de materia prima, ya tienen asignaciones asociadas, pero no se entregó toda la materia prima de la solicitud.</b><br><br>
    Además <b>haciendo click aquí se cargarán las solicitudes con este estado</b> en la tabla de registros consultados.</p>`
  },
  {
    attachTo: {
      element: '#verde',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'verde',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-check"></i> Solicitudes finalizadas</h5>',
    text: `<p>Aquí encontraremos <b> la cantidad de solicitudes de materia prima que se encuentran finalizadas actualmente de las ultimas 100 creadas</b><br><br>
    Las solicitudes con estado finalizado son las que <b> ya tienen asignaciones creadas, en las cuales se les entregó toda la materia prima solicitada.</b><br><br>
    Además  <b>haciendo click aquí se cargarán las solicitudes con este estado</b> en la tabla de registros consultados.</p>`
  },
  {
    attachTo: {
      element: '#formulario1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'formulario1',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-filter"></i> Filtros</h5>',
    text: `<p>Aquí encontraremos <b>los filtros de búsqueda donde podrás realizar tus consultas.</b><br><br>
    Además podrás crear las combinaciones que desees llenando los campos: <br>
    <b>- Id de solicitud</b><br>
    <b>- Fecha Inicial de la solicitud</b><br>
    <b>- Fecha Final de la solicitud</b><br>
    <b>- Estado de la solicitud</b><br><br>
    Y luego solo <b>pulsa el botón consultar para ver la información solicitada!</b></p>`
  },
  {
    attachTo: {
      element: '#botones1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'botones1',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-search"></i> Consultar / <i class="pi pi-eraser"></i> Limpiar Campos</h5>',
    text: `<p>Luego de llenar los filtros por los que deseas realizar tu búsqueda, <b>haz clic sobre el botón Consultar para cargar la información del encabezado de la solicitud de material en la tabla</b> de registros consultados.
    <br><br>Para reiniciar tu busqueda solo <b>haz click sobre el botón limpiar campos.</b></p>`
  },
  {
    attachTo: {
      element: '#tabla1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'tabla1',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-list"></i> Encabezado de solicitudes</h5>',
    text: `<p>Aquí podrás apreciar <b>el encabezado de las solicitudes de material que se encontraron luego de realizar tu consulta,</b> entre ellos su:<br><br>
    <b>- Id</b><br>
    <b>- OT</b><br>
    <b>- Fecha Creación</b><br>
    <b>- Estado General</b></p>`
  },
  {
    attachTo: {
      element: '#detalle',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'detalle',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-eye"></i> Ver detalles de la solicitud</h5>',
    text: `<p>Si existen registros en la tabla, <b>pulsa sobre el botón <i class="pi pi-eye"></i></b> para ver detalles de la solicitud del registro que seleccionaste. <br><br>
    podrás apreciar <b>número de solicitud, operario solicitante, materias primas, cantidad pedida, cantidad asignada unidad de medida y el estado de las mismas</b> en la tabla detalles de la solicitud.</p>`
  },
  {
    attachTo: {
      element: '#matprimas',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'matprimas',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-list"></i> Detalles de la solicitud</h5>',
    text: `<p>En este apartado podrás ver <b>los detalle de las solicitudes de material que selecciones de la tabla registros consultados.</b></p>`
  },
  {
    attachTo: {
      element: '#usuario',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'usuario',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-user"></i> Usuario solicitante</h5>',
    text: `<p>Luego de hacer click en <b>el botón <i class="pi pi-eye"></i> ver detalles</b> en la tabla registros consultados, <b>aquí visualizarás el nombre del usuario que realizó el pedido de materia prima.</b></p>`
  },
  {
    attachTo: {
      element: '#tabla2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'tabla2',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-box"></i> Materias Primas</h5>',
    text: `<p>Aquí podrás apreciar <b>las materias primas solicitadas, la cantidad pedida, unidad de medida y el estado de las mismas</b><br><br></p>`
  },
  {
    attachTo: {
      element: '#aprobada',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'aprobada',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-box"></i> Cantidad aprobada</h5>',
    text: `<p>Este campo se refiere a <b>la cantidad de cada item de materia prima que se ha asignado en base a la solicitud</b> que esté visualizando en el momento.<br><br></p>`
  },
  {
    attachTo: {
      element: '#crear-oc',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'crear-oc',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-window-maximize"></i> Cargar modal.</h5>',
    text: `<p>Pulsando sobre este botón <b>se mostrará un modal con el módulo de asignaciones de materia prima</b> y se cargará el <b>campo N°. Solicitud</b> con el Id de la solicitud de materia prima.</b><br><br>
    Asi como también <b>se cargará la tabla con las materias pedidas en la solicitud,</b> dicha tabla cuenta con 2 funcionalidades importantes tales como:<br><br>
    <b>1. El campo de cantidad editable:</b> Haciendo clic sobre este campo podrás modificar la cantidad solicitada por el usuario.<br>
    <b>2. Quitar materia(s) prima(s):</b> Haciendo clic sobre el botón <i class="pi pi-trash"></i> <b>podrás quitar las materias primas</b> que no deseas que se encuentren en la orden de compra por el motivo que desees.<br> </p>`
  },
  {
    attachTo: {
      element: '#finalizar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'finalizar',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-check-square"></i> Finalizar solicitud</h5>',
    text: `<p>pulsando sobre este botón podrás finalizar la solicitud de materia prima, <b>solo si su estado (estado del encabezado) es pendiente ó parcial</b></p>`
  },
  {
    attachTo: {
      element: '#cancelar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'cancelar',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-ban"></i> Cancelar solicitud</h5>',
    text: `<p>pulsando sobre este botón podrás cancelar la solicitud de materia prima, <b>solo si su estado (estado del encabezado) es pendiente ó parcial</b><br><br>
    </p>`
  },
]

/******************************************************** MANTENIMIENTO DE ACTIVOS ***************************************************************/
export const stepsPedidoMtto: Step.StepOptions[] = [
  {
    attachTo: {
      element: '#formulario1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'formulario1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Diligenciar pedido de mtto.</h5>`,
    text: `Selecciona el(los) activo(s) averiados, la fecha en que ocurrió el daño, el tipo de mantenimiento que necesita, y una observación concisa del
    daño, <b>para quien reciba el pedido y tenga que realizar la reparación.</b>`
  },
  {
    attachTo: {
      element: '#botones1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'botones1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Agregar activo</h5>`,
    text: `Luego de diligenciar los campos, <b>haz clic sobre el botón añadir activo para agregarlo(s) a la tabla que se muestra acontinuación</b>. Allí puedes cargar los activos averiados que desees.`
  },
  {
    attachTo: {
      element: '#tabla1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'tabla1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Tabla de activos</h5>`,
    text: `En esta tabla podrás observar los activos que haz agregado previamente desde el formulario, <b>los cuales se registrarán en el detalle del pedido.</b>`
  },
  {
    attachTo: {
      element: '#quitar1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'quitar1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Quitar activos elegidos</h5>`,
    text: `Haciendo clic sobre este icono, <b>podrás quitar todos los activos seleccionados de la tabla.</b><br><br>
    Si solo deseas quitar uno de los activos de la tabla <b>haz clic sobre el icono <i class="pi pi-trash"></i></b> que aparecerá en cada una de filas.`
  },
  {
    attachTo: {
      element: '#botones2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    classes: 'card',
    id: 'botones2',
    title: `<h5 class="tituloRojo" style="margin: auto;">Registrar Mtto.</h5>`,
    text: `Luego de cargar en la tabla los activos que necesitan ser reparados, <b>haz clic sobre crear pedido, para registrar el detalle del pedido de mantenimiento.</b>`
  }
];

export const stepsMttoActivos: Step.StepOptions[] = [
  {
    attachTo: {
      element: '#formulario1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'formulario1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Diligenciar pedido de mtto.</h5>`,
    text: `Desde este formulario puedes realizar la busqueda de <b>los pedidos y mantenimientos de activos.</b><br><br>`
  },
  {
    attachTo: {
      element: '#Pedido',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'Pedido',
    title: `<h5 class="tituloRojo" style="margin: auto;">Campo pedido de mtto.</h5>`,
    text: `En este campo puedes realizar la búsqueda de un número de pedido de mantenimiento en especifico,
    <b>Pero recuerda que DEBES seleccionar un rango de fechas para efectuar una consulta óptima.</b>`
  },
  {
    attachTo: {
      element: '#idMtto',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'idMtto',
    title: `<h5 class="tituloRojo" style="margin: auto;">Campo Mantenimiento</h5>`,
    text: `En este campo puedes realizar la búsqueda de un número de mantenimiento de activos en especifico,
    <b>Pero recuerda que DEBES seleccionar un rango de fechas para efectuar una consulta óptima.</b>`
  },
  {
    attachTo: {
      element: '#tipoMov',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'tipoMov',
    title: `<h5 class="tituloRojo" style="margin: auto;">Campo tipo de movimientos.</h5>`,
    text: `En este campo encontrarás <b>dos tipos de movimientos para realizar tus consultas</b>, entre ellos:<br><br>
    1- Pedido de Mantenimiento.<br>
    2- Mantenimiento.<br><br>
    <b>Pero recuerda que DEBES seleccionar un rango de fechas para efectuar una consulta óptima.</b>`
  },
  {
    attachTo: {
      element: '#FechaInicial',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'FechaInicial',
    title: `<h5 class="tituloRojo" style="margin: auto;">Campo fecha inicial</h5>`,
    text: `<b>Recuerda que DEBES seleccionar un rango de fechas</b> combinada con tus filtros de busqueda para realizar consultas óptimas.<br><br>
    Si no diligencias los campos de fecha, <b>las consultas serán realizadas teniendo en cuenta solo la fecha de hoy.</b>`
  },
  {
    attachTo: {
      element: '#FechaFinal',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'FechaFinal',
    title: `<h5 class="tituloRojo" style="margin: auto;">Campo fecha final.</h5>`,
    text: `En este campo <b>podrás colocar la fecha que limitará el lapso de tiempo que elijas consultar</b>, teniendo en cuenta la fecha inicial.`
  },
  {
    attachTo: {
      element: '#botones1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'botones1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Agregar activo</h5>`,
    text: `Luego de diligenciar los filtros, haz clic sobre el botón consultar <b>para cargar los registros de tu búsqueda en la tabla.</b>`
  },
  {
    attachTo: {
      element: '#tabla1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'tabla1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Tabla de activos</h5>`,
    text: `En esta tabla podrás observar <b>el encabezado de los pedidos y mantenimientos que aún se encuentran activos</b>,teniendo en cuenta los filtros consultados previamente.`
  },
  {
    attachTo: {
      element: '#ver1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    classes: 'card',
    id: 'ver1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Ver detalle</h5>`,
    text: `Luego de cargar los datos consultados en la tabla, haciendo clic sobre el botón <i class="pi pi-eye"></i> que aparecerá cada fila de esta columna, <b>podrás desplegar
    un modal con el detalle</b> del pedido de mantenimiento o el mantenimiento seleccionado.<br><br>
    En dicho modal podrás <b>aceptar un pedido</b> de mantenimiento, <b>actualizar el estado</b> de un item de mantenimiento, <b>realizar cambios</b> en el encabezado del mantenimiento. etc... `
  },

];

export const stepsReporteActivos: Step.StepOptions[] = [
  {
    attachTo: {
      element: '#table',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'table',
    title: `<h5 class="tituloRojo" style="margin: auto;">Tabla de activos</h5>`,
    text: `En esta tabla puedes apreciar de manera detallada <b>la información de los activos que hacen parte de la empresa.</b><br><br>`
  },
  {
    attachTo: {
      element: '#cuerpo-t1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    classes: 'card',
    id: 'cuerpo-t1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Ver movimientos del activo</h5>`,
    text: `Haciendo clic sobre cualquier registro de la tabla, <b>se cargará un modal en el cual podrás apreciar los movimientos de ese activo.<b>`
  }
];

/******************************************************** MOVIMIENTOS ***************************************************************/
export const stepsMovimientos: Step.StepOptions[] = [
  {
    attachTo: {
      element: '#formulario1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'formulario1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Filtros</h5>`,
    text: `En este formulario podrás realizar las consultas que desees <b>combinando los diferentes filtros de búsqueda</b><br><br>
     <b>Si no diligencias los campos,</b> la búsqueda será realizada teniendo en cuenta solo la fecha de hoy.`
  },
  {
    attachTo: {
      element: '#botones1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'botones1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Consultar</h5>`,
    text: `Luego de diligenciar los filtros, <b>pulsa sobre el botón consultar para ver los resultados de la búsqueda en la tabla .</b><br><br>
    Si deseas reiniciar la búsqueda, <b>haz clic sobre limpiar campos.</b>`
  },
  {
    attachTo: {
      element: '#table',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'table',
    title: `<h5 class="tituloRojo" style="margin: auto;">Información consultada</h5>`,
    text: `En esta tabla <b>se cargará la información de las remisiones y/o facturas,</b> teniendo en cuenta los filtros consultados.<br><br>
    <b>Pulsando sobre el icono <i class="pi pi-sort-alt"><i/></b> podrás organizar de manera ascendente o descendente los registros de esa columna de la tabla.`
  },
  {
    attachTo: {
      element: '#ver1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back
    ],
    classes: 'card',
    id: 'ver1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Ver detalle</h5>`,
    text: `Aquí podrás ver en PDF los detalles de la factura o remisión seleccionada. <b></b><br><br>`
  },
];

export const stepsMovimientosMtto: Step.StepOptions[] = [
  {
    attachTo: {
      element: '#formulario1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'formulario1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Filtros</h5>`,
    text: `En este formulario podrás realizar las consultas que desees <b>combinando los diferentes filtros de búsqueda</b><br><br>
     <b>Si no diligencias los campos,</b> la búsqueda será realizada teniendo en cuenta solo la fecha de hoy.`
  },
  {
    attachTo: {
      element: '#botones1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'botones1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Consultar</h5>`,
    text: `Luego de diligenciar los filtros, <b>pulsa sobre el botón consultar para ver los resultados de la búsqueda en la tabla .</b><br><br>
    Si deseas reiniciar la búsqueda, <b>haz clic sobre limpiar campos.</b>`
  },
  {
    attachTo: {
      element: '#table',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'table',
    title: `<h5 class="tituloRojo" style="margin: auto;">Información consultada</h5>`,
    text: `En esta tabla <b>se cargará la información de los movimientos de mantenimiento de los activos,</b> teniendo en cuenta los filtros consultados.<br><br>
    <b>Pulsando sobre el icono <i class="pi pi-sort-alt"><i/></b> podrás organizar de manera ascendente o descendente los registros de esa columna de la tabla.`
  },
  {
    attachTo: {
      element: '#ver1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back
    ],
    classes: 'card',
    id: 'ver1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Ver detalle</h5>`,
    text: `Aquí podrás ver en PDF los detalles del movimiento de mantenimiento de activos seleccionados. <b></b><br><br>`
  },
];

export const stepsMovRecuperado: Step.StepOptions[] = [
  {
    attachTo: {
      element: '#formulario1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'formulario1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Filtros</h5>`,
    text: `En este formulario podrás realizar las consultas que desees acerca de los movimientos de orden de compra de materia prima <b>combinando los diferentes filtros de búsqueda</b><br><br>
     <b>Si no diligencias los campos,</b> la búsqueda será realizada teniendo en cuenta solo la fecha de hoy.`
  },
  {
    attachTo: {
      element: '#botones1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'botones1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Consultar</h5>`,
    text: `Luego de diligenciar los filtros, <b>pulsa sobre el botón consultar para ver los resultados de la búsqueda en la tabla.</b><br><br>
    Si deseas reiniciar la búsqueda, <b>haz clic sobre el botón limpiar campos.</b>`
  },
  {
    attachTo: {
      element: '#tabla1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'tabla1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Información consultada</h5>`,
    text: `En esta tabla <b>se cargará la información de los movimientos de recuperado de materia prima,</b> teniendo en cuenta los filtros consultados.<br><br>`
  },
  {
    attachTo: {
      element: '#ver1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'ver1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Ver detalle</h5>`,
    text: `Si tienes registros cargados en la tabla, haz clic sobre este campo para apreciar en un modal de manera detallada y agrupado por el turno de día, <b>en que fecha, que operario y que cantidad fue recuperada del material seleccionado. </b>`
  },
  {
    attachTo: {
      element: '#ver2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back
    ],
    classes: 'card',
    id: 'ver2',
    title: `<h5 class="tituloRojo" style="margin: auto;">Ver detalle</h5>`,
    text: `Si tienes registros cargados en la tabla, haz clic sobre este campo para apreciar en un modal de manera detallada y agrupado por el turno de noche, <b>en que fecha, que operario y que cantidad fue recuperada del material seleccionado. </b>`
  },
];

export const stepsMovOrdenCompra: Step.StepOptions[] = [
  {
    attachTo: {
      element: '#formulario1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'formulario1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Filtros</h5>`,
    text: `En este formulario podrás realizar las consultas que desees acerca de los movimientos de orden de compra de materia prima <b>combinando los diferentes filtros de búsqueda</b><br><br>
     <b>Si no diligencias los campos,</b> la búsqueda será realizada teniendo en cuenta solo la fecha de hoy.`
  },
  {
    attachTo: {
      element: '#botones1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'botones1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Consultar</h5>`,
    text: `Luego de diligenciar los filtros, <b>pulsa sobre el botón consultar para ver los resultados de la búsqueda en la tabla.</b><br><br>
    Si deseas reiniciar la búsqueda, <b>haz clic sobre el botón limpiar campos.</b>`
  },
  {
    attachTo: {
      element: '#tabla1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'tabla1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Información consultada</h5>`,
    text: `En esta tabla <b>se cargará la información de los movimientos de orden de compra de materia prima,</b> teniendo en cuenta los filtros consultados.<br><br>
    Además puedes editar un movimiento de OC, <b>haciendo clic sobre cualquier registro de la tabla.</b>`
  },
  {
    attachTo: {
      element: '#ver1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'ver1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Filtrar registros de la tabla</h5>`,
    text: `Haciendo clic sobre este icono, <b>podrás realizar filtros sobre la información que se encuentra cargada en la tabla.</b><br><br>
    Entre los diferentes filtros se encuentran que la búsqueda:<br>
    - <b>Empiece con.</b><br>
    - <b>Contiene.</b><br>
    - <b>No contiene.</b><br>
    - <b>Termina con.</b><br>
    - <b>Igual.</b><br>
    - <b>No igual.</b><br><br>
    Luego de elegir una de las opciones, <b>escribe la palabra clave o número del registro con el que deseas realizar la búsqueda en la tabla</b> y haz clic sobre el botón aplicar.`
  },
  {
    attachTo: {
      element: '#limpiar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'limpiar',
    title: `<h5 class="tituloRojo" style="margin: auto;">Limpiar Filtros</h5>`,
    text: `Si seleccionas uno o varios filtros en la tabla y <b>deseas limpiarlos haz clic sobre este botón</b>`
  },
  {
    attachTo: {
      element: '#ver2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'ver2',
    title: `<h5 class="tituloRojo" style="margin: auto;">Ver Estado</h5>`,
    text: `En este campo de la tabla <b>podrás apreciar el estado en que se encuentra la orden de compra.</b><br><br>
    Entre los diferentes estados se encuentran: <br>
    - <b>Pendiente:</b> Indica que no se ha recibido por completo el material solicitado en la orden de compra.<br>
    - <b>Finalizado:</b> Indica que ya ha sido recibido e ingresado por completo el material solicitado en la orden de compra.<br>`
  },
  {
    attachTo: {
      element: '#ver3',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back
    ],
    classes: '',
    id: 'ver3',
    title: `<h5 class="tituloRojo" style="margin: auto;">Ver PDF</h5>`,
    text: `Pulsando sobre el boton <i class="pi pi-pdf-file"></i> que encontrarás en cada fila de esta columna, <b>podrás ver en PDF el detalle de la orden de compra seleccionada.</b><br><br>`
  },
];

export const stepsMovMaquilas: Step.StepOptions[] = [
  {
    attachTo: {
      element: '#formulario1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'formulario1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Filtros</h5>`,
    text: `En este formulario podrás realizar las consultas que desees <b>acerca de los movimientos de ordenes de maquila de materia prima</b> combinando los diferentes filtros de búsqueda<br><br>
     <b>Si no diligencias los campos,</b> la búsqueda será realizada teniendo en cuenta solo la fecha de hoy.`
  },
  {
    attachTo: {
      element: '#botones1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'botones1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Consultar</h5>`,
    text: `Luego de diligenciar los filtros, <b>pulsa sobre el botón consultar para ver los resultados de la búsqueda en la tabla.</b><br><br>
    Si deseas reiniciar la búsqueda, <b>haz clic sobre el botón limpiar campos.</b>`
  },
  {
    attachTo: {
      element: '#tabs',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'tabs',
    title: `<h5 class="tituloRojo" style="margin: auto; text-align: center;">Movimientos y facturación de<br> ordenes de maquila</h5>`,
    text: `En cada uno de estos tabs encontrarás la información <b>acerca de los movimientos y la facturación de las ordenes de maquila.</b>`
  },
  {
    attachTo: {
      element: '#tabla1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'tabla1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Información consultada</h5>`,
    text: `En esta tabla <b>se cargará la información de los movimientos de ordenes de maquilas de materia prima,</b> teniendo en cuenta los filtros consultados.`
  },
  {
    attachTo: {
      element: '#ver1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'ver1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Filtrar registros de la tabla</h5>`,
    text: `Haciendo clic sobre este icono, <b>podrás realizar filtros sobre la información que se encuentra cargada en la tabla.</b><br><br>
    Entre los diferentes filtros se encuentran que la búsqueda:<br>
    - <b>Empiece con.</b><br>
    - <b>Contiene.</b><br>
    - <b>No contiene.</b><br>
    - <b>Termina con.</b><br>
    - <b>Igual.</b><br>
    - <b>No igual.</b><br><br>
    Luego de elegir una de las opciones, <b>escribe la palabra clave o número del registro con el que deseas realizar la búsqueda en la tabla</b> y haz clic sobre el botón aplicar.<br><br>
    Para quitar los filtros consultados desde la tabla, <b>haz clic sobre el botón limpiar.</b>`
  },
  {
    attachTo: {
      element: '#ver2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'ver2',
    title: `<h5 class="tituloRojo" style="margin: auto;">Ver Estado</h5>`,
    text: `En este campo de la tabla <b>podrás apreciar el estado en que se encuentra la orden de maquila.</b><br><br>
    Entre los diferentes estados se encuentran: <br>
    - <b>Pendiente:</b> Indica que no se ha entregado por completo el material solicitado por el cliente/tercero en la orden de maquila.<br>
    - <b>Finalizado:</b> Indica que ya ha sido entregado por completo el material solicitado en la orden de maquila.<br>`
  },
  {
    attachTo: {
      element: '#ver3',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back
    ],
    classes: '',
    id: 'ver3',
    title: `<h5 class="tituloRojo" style="margin: auto;">Ver PDF</h5>`,
    text: `Pulsando sobre el boton <i class="pi pi-pdf-file"></i> que encontrarás en cada fila de esta columna, <b>podrás ver el detalle de la orden de maquila seleccionada en formato PDF.</b> `
  },
];

/************************************************************* NOMINA ****************************************************************************/
export const stepsNomina : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#nomina',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'nomina',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class=""></i> Nómina</h5>',
    text: `<p>En este módulo encontrarás la información de la nómina de los operarios de sellado de manera acumulada y detallada por
    item y empleado, además por cada rollo pesado.</p>`
  },
  {
    attachTo: {
      element: '#rango',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'rango',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class=""></i> Seleccionar Rango</h5>',
    text: `<p>En este campo puedes seleccionar un rango de fechas para generar la nomina de los operarios en ese lapso de tiempo elegido. </p>`
  },
  {
    attachTo: {
      element: '#consultar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'consultar',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class=""></i> Consultar Rango</h5>',
    text: `<p>Luego de seleccionar el rango de fechas, presiona este botón para realizar la consulta de la nomina de los operarios de sellado. <br><br>
    Nota: La consulta realizada agregará un día de más al rango de fechas, debido a que el turno de la noche del último día seleccionado
    en el rango finaliza el día siguiente a las 7 am. </p>`
  },
  {
    attachTo: {
      element: '#filtros',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'filtros',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class=""></i> Filtrar columnas</h5>',
    text: `<p>Luego de consultar el rango de fechas, desde estos campos podrás filtrar la información que se encuentre en la tabla por:
    <br>- Cedula.
    <br>- Operario.
    <br>- Cargo.
    <br>- Valor a Pagar.
    </p>`
  },
  {
    attachTo: {
      element: '#campos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'campos',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class=""></i> Información acumulada</h5>',
    text: `<p>Luego de realizar la consulta, encontrarás la información de los valores a devengar de manera acumulada por cada operario en el rango de fechas seleccionado.
    </p>`
  },
  {
    attachTo: {
      element: '#desplegable',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'desplegable',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class=""></i> Ver detalles por operario</h5>',
    text: `<p>En esta columna en cada una de las filas de la tabla haciendo clic sobre el botón <i class="pi pi-angle-right"></i> se desplegará la información
    de cada operario por item, se mostrará la cantidad de rollos que pesó de cada item. <br><br>
    Además puedes ver de manera aún más detallada, por item, cada rollo pesado por el operario pulsando sobre el botón <i class="pi pi-eye"></i>.
    </p>`
  },
  {
    attachTo: {
      element: '#total',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'total',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class=""></i> Total a pagar</h5>',
    text: `<p>Aquí se verá el valor total a pagar de la nómina de sellado en el rango de fechas seleccionado.</p>`
  },
  {
    attachTo: {
      element: '#exportar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.back,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'exportar',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class=""></i> Exportar a excel</h5>',
    text: `<p>Pulsando sobre este botón se mostrará un mensaje para elegir si deseas exportar la nomina de manera acumulada
    por operario ó detallada rollo a rollo por cada empleado. </p>`
  },
]

export const stepsIngresoNomina : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#nomina',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'nomina',
    title: '<h4 style="margin: auto; color: var(--rojo)">Ingreso de Nómina</h4>',
    text: `<p>En este módulo podrás <b>ingresar los registros de la nómina de los empleados</b> de Plasticaribe SAS.</p>`
  },
  {
    attachTo: {
      element: '#formulario',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'formulario',
    title: '<h4 style="margin: auto; color: var(--rojo)">Formulario</h4>',
    text: `<p>Para cargar los registros en la tabla <b>debes diligenciar todos los campos del formulario.</b> <br><br>
    <b>Nota:</b> Recuerda que puedes agregar varios registros de nominas a la tabla y luego crear la entrada!</p>`
  },
  {
    attachTo: {
      element: '#rango',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'rango',
    title: '<h4 style="margin: auto; color: var(--rojo)">Rango de fechas</h4>',
    text: `<p>En este campo debes <b>seleccionar el rango de fechas</b> de la nomina que deseas ingresar. </p>`
  },
  {
    attachTo: {
      element: '#tipoNomina',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'tipoNomina',
    title: '<h4 style="margin: auto; color: var(--rojo)">Tipo de nómina</h4>',
    text: `<p>En este campo debes seleccionar el <b>tipo de nomina que deseas ingresar</b>, las opciones son:
    <br><br>- <b>Administrativos:</b> Personal administrativo.
    <br>- <b>Ventas:</b> Asesores comerciales.
    <br>- <b>Fabricación:</b> Operarios de de producción. </p>`
  },
  {
    attachTo: {
      element: '#valorTotal',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'valorTotal',
    title: '<h4 style="margin: auto; color: var(--rojo)">Valor nómina</h4>',
    text: `<p>Aquí debes <b>digitar el valor en pesos de la nómina</b> que deseas ingresar del rango de fechas elegido.</p>`
  },
  {
    attachTo: {
      element: '#descripcion',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'descripcion',
    title: '<h4 style="margin: auto; color: var(--rojo)">Descripción</h4>',
    text: `<p><b>Opcional:</b> Si deseas puedes realizar una observación del registro que estás creando.</p>`
  },
  {
    attachTo: {
      element: '#botones',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'botones',
    title: '<h4 style="margin: auto; color: var(--rojo)">Botones</h4>',
    text: `<p><b>Agregar registro:</b> Luego de diligenciar los campos, debes hacer clic sobre este botón para enviar los datos a la tabla que se encuentra en la parte inferior.<br><br>
    <b>Limpiar campos:</b> haz clic aquí si deseas borrar la información de los campos del formulario.</p>`
  },
  {
    attachTo: {
      element: '#tabla',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'tabla',
    title: '<h4 style="margin: auto; color: var(--rojo)">Tabla de registros</h4>',
    text: `<p>En esta tabla se encontrarán <b>los registros que agregues inicialmente</b> desde el formulario.
    <br><br><b>Nota:</b> Recuerda que puedes agregar la cantidad de registros que desees a la tabla y luego crear la entrada.</p>`
  },
  {
    attachTo: {
      element: '#total',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'total',
    title: '<h4 style="margin: auto; color: var(--rojo)">Valor Total</h4>',
    text: `<p>Aquí podrás visualizar <b>el valor total en pesos de las nominas</b> cargadas en la tabla.</p>`
  },
  {
    attachTo: {
      element: '#quitar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'quitar',
    title: '<h4 style="margin: auto; color: var(--rojo)">Quitar registros</h4>',
    text: `<p>En esta columna podrás <b>quitar registros de la tabla</b>, si te equivocas en la adición de alguno.
    <br><br> Solo <b>debes hacer clic sobre el botón con el icono de </b> <i class="pi pi-trash"></i> y se mostrará un mensaje de elección para quitar el registro.</p>`
  },
  {
    attachTo: {
      element: '#entrada',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'entrada',
    title: '<h4 style="margin: auto; color: var(--rojo)">Crear Entrada</h4>',
    text: `<p>Haz clic aquí para <b>crear la entrada de los registros de nominas</b> cargados en la tabla. </p>`
  },
  {
    attachTo: {
      element: '#limpiarTodo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.cancel,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'limpiarTodo',
    title: '<h4 style="margin: auto; color: var(--rojo)">Limpiar todo</h4>',
    text: `<p>Pulsando este botón se quitaran los registros de la tabla y se limpiaran los campos del formulario.</p>`
  },
];

/******************************************************** ORDENES DE MAQUILA ***************************************************************/
export const stepsOrdenMaquila: Step.StepOptions[] = [
  {
    attachTo: {
      element: '#botones1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'botones1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Registrar Tercero</h5>`,
    text: `Haciendo clic sobre este botón, <b>se cargará un modal en el cual podrás registrar la información de un tercero</b> (Persona natural o jurídica que desea comprar materia prima a la empresa).`
  },
  {
    attachTo: {
      element: '#formulario1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'formulario1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Elegir tercero</h5>`,
    text: `En este primer formulario encontrarás el consecutivo de la orden de maquila y <b>debes elegir el tercero,</b> opcionalmente puedes
    agregar una observación acerca de la orden de maquila.`
  },
  {
    attachTo: {
      element: '#formulario2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'formulario2',
    title: `<h5 class="tituloRojo" style="margin: auto;">Elegir materia prima</h5>`,
    text: `En este formulario <b>debes seleccionar la materia prima que deseas vender</b> al tercero elegido previamente<br><br>
    Recuerda que no puedes agregar una materia prima a la tabla, <b>si el stock actual de la misma es inferior a la cantidad elegida.</b>`
  },
  {
    attachTo: {
      element: '#botones2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'botones2',
    title: `<h5 class="tituloRojo" style="margin: auto;">Agregar material</h5>`,
    text: `Luego de diligenciar los campos de la materia prima, <b>haz clic sobre agregar mat. prima para cargarlas a la tabla</b> que se encuentra acontinuación.<br><br>
    Si deseas reiniciar la búsqueda de un material, <b>haz clic sobre limpiar campos.</b>`
  },
  {
    attachTo: {
      element: '#tabla1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'tabla1',
    title: `<h5 class="tituloRojo" style="margin: auto; text-align: center;">Materias primas a vender</h5>`,
    text: `En esta tabla <b>se encontrarán las materias primas que elegiste previamente</b>, y las cuales serán vendidas al tercero seleccionado.`
  },
  {
    attachTo: {
      element: '#quitar1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'quitar1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Quitar materiales</h5>`,
    text: `Si deseas quitar una materia prima de la orden, haz clic sobre el icono <i class="pi pi-trash"></i> <b>que se mostrará en cada fila de esta columna cuando la tabla tenga registros.</b>`
  },
  {
    attachTo: {
      element: '#pie1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'pie1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Totales en kilos y precios</h5>`,
    text: `En este pie de tabla podrás apreciar <b>la cantidad total en kilos de la materia prima seleccionada y el precio total estimado de la orden.</b>`
  },
  {
    attachTo: {
      element: '#botones3',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back
    ],
    classes: '',
    id: 'botones3',
    title: `<h5 class="tituloRojo" style="margin: auto;">Registrar orden de maquila</h5>`,
    text: `Después de elegir las materias primas, haz clic sobre crear orden de maquila para registrarla.<br><br>
    Recuerda que al registrar la orden <b>se descontarán del stock las cantidades de las materias primas</b> que elegiste.<br><br>
    Si te equivocaste y deseas reiniciar la orden de maquila, <b>haz clic sobre limpiar todo.</b>`
  },
];

export const stepsFacturacionMaquilas: Step.StepOptions[] = [
  {
    attachTo: {
      element: '#orden',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'orden',
    title: `<h5 class="tituloRojo" style="margin: auto;">Seleccionar orden de maquila</h5>`,
    text: `<b>Digita el número de la orden de maquila en este campo y presiona ENTER</b> para cargar el tercero y los detalles de la OM en la primera tabla.`
  },
  {
    attachTo: {
      element: '#Factura',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'Factura',
    title: `<h5 class="tituloRojo" style="margin: auto;">Diligenciar Factura</h5>`,
    text:  `En este campo puedes colocar <b>el código de la factura que estará asociada a la orden de maquila</b>.<br><br>
    Recuerda que si este campo tiene información, <b>no puedes llenar el campo de remisión</b>`
  },
  {
    attachTo: {
      element: '#Remision',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'Remision',
    title: `<h5 class="tituloRojo" style="margin: auto;">Diligenciar Remisión</h5>`,
    text:  `En este campo puedes colocar <b>el código de la remisión que estará asociada a la orden de maquila</b>.<br><br>
    Recuerda que si este campo tiene información, <b>no puedes llenar el campo de factura</b>`
  },
  {
    attachTo: {
      element: '#tabla1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'tabla1',
    title: `<h5 class="tituloRojo" style="margin: auto; text-align: center;">Mat. primas asociadas a la OM</h5>`,
    text: `En esta tabla <b>se encontrarán las materias primas de la orden de maquila consultada previamente.</b>`
  },
  {
    attachTo: {
      element: '#ver1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'ver1',
    title: `<h5 class="tituloRojo" style="margin: auto; text-align: center;">Cantidad solicitada</h5>`,
    text: `En este campo puedes ver <b>la cantidad total de materia prima por la que se realizó la orden de maquila.</b>`
  },
  {
    attachTo: {
      element: '#ver2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'ver2',
    title: `<h5 class="tituloRojo" style="margin: auto; text-align: center;">Cantidad facturada</h5>`,
    text: `Este campo <b>indica la cantidad de materia prima facturada y/o remisionada</b> hasta el momento de la consulta.`
  },
  {
    attachTo: {
      element: '#ver3',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'ver3',
    title: `<h5 class="tituloRojo" style="margin: auto; text-align: center;">Cantidad faltante</h5>`,
    text: `En esta columna <b>podrás apreciar la cantidad de materia prima faltante por entregar</b> en la orden de maquila.`
  },
  {
    attachTo: {
      element: '#agregar1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'agregar1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Agregar materiales a entregar</h5>`,
    text: `Haz clic aquí para agregar materias primas a la facturación de maquila.<br><br>
    <b>Ten en cuenta que puedes agregar una por una o todas las materias primas</b> que serán facturadas y entregadas al tercero.</b>`
  },
  {
    attachTo: {
      element: '#tabla2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'tabla2',
    title: `<h5 class="tituloRojo" style="margin: auto; text-align: center;">Mat. primas seleccionadas de la OM</h5>`,
    text: `En esta tabla <b>se encontrarán las materias primas que elegiste previamente de la orden de maquila consultada</b>, y las cuales serán facturadas o remisionadas al tercero seleccionado.`
  },
  {
    attachTo: {
      element: '#ver1-t2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: '#ver1-t2',
    title: `<h5 class="tituloRojo" style="margin: auto;">Editar cantidad de mat. Prima</h5>`,
    text: `Haciendo clic sobre este campo, <b>puedes editar la cantidad de materia prima que será facturada o remisionada.</b><br><br>
    Si se desea realizar una entrega <b>por la misma cantidad solicitada en la orden de maquila</b>, no es necesario editar este campo.`
  },
  {
    attachTo: {
      element: '#ver2-t2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: '#ver2-t2',
    title: `<h5 class="tituloRojo" style="margin: auto;">Quitar materiales</h5>`,
    text: `Haciendo clic sobre este checkbox <b>puedes quitar todas las materias primas elegidas previamente de la orden de maquila</b>, si ya no deseas realizar la facturación o si tuviste algún error de digitación.<br><br>
    Si deseas quitar solo una materia prima cargada, <b>haz clic sobre el check que aparece en cada fila en esta misma columna.</b>`
  },
  {
    attachTo: {
      element: '#pie-t2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: '#pie-t2',
    title: `<h5 class="tituloRojo" style="margin: auto;">Ver totales</h5>`,
    text: `En este pie de la tabla puedes ver la <b>cantidad total en kilos de las materias primas que entregarás y el total facturado.</b>`
  },
  {
    attachTo: {
      element: '#botones1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back
    ],
    classes: '',
    id: '#botones1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Facturar maquila</h5>`,
    text: `Finalmente haz clic sobre facturar maquila para crear el registro con los detalles de las materias primas que serán vendidas al tercero.<br><br>
    Recuerda que en cuanto se crea el registro, se decontarán del inventario las cantidades de las materias primas facturadas o remisionadas.<br><br>
    Si te equivocas digitando o ya no deseas realizar la OM, <b>solo haz clic en el botón limpiar todo.</b>`
  },
];

/******************************************************** ORDENES DE TRABAJO ***************************************************************/
export const stepsOrdenesTrabajo: Step.StepOptions[] = [
  {
    attachTo: {
      element: '#none',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    classes: '',
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'none',
    title: `<h5 class="tituloRojo" style="margin: auto;">Ordne de Trabajo</h5>`,
    text: `<p>¡Las ordenes de trabajo son documentos que se crean para la creación de un producto, este documento tendrá todas las especificaciones necesarias sobre como se debe crear el producto!</p>
    <p>Desde aquí podremos crear, consultar y editar las ordenes de trabajo de manera sencilla y eficiente.</p>`
  },
  {
    attachTo: {
      element: '#formOrdenTrabajo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'formOrdenTrabajo',
    title: `<h5 class="tituloRojo" style="margin: auto;">Información General</h5>`,
    text: `<p>Para crear una Orden de Trabajo necesitamos información que debemos colocar en los siguientes campos.</p>`
  },
  {
    attachTo: {
      element: '#idCliente',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'idCliente',
    title: `<h5 class="tituloRojo" style="margin: auto;">Id del Cliente</h5>`,
    text: `<p>Este campo se estará llenando con la información del cliente que se seleccionó. Este campo no es editable y se llena de manera automatica.</p>`
  },
  {
    attachTo: {
      element: '#cliente',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'cliente',
    title: `<h5 class="tituloRojo" style="margin: auto;">Cliente</h5>`,
    text: `<p>Para seleccionar un cliente tenemos que escribir el nombre del mismo, y a medida que escribimos, se muestran los clientes que tengan en su nombre el texto que hemos escrito.</p>
    <p>Si encontramos el cliente que queremos presionamos click o lo seleccionamos y listo. El campo anterior (Id Cliente) se llenará automaticamente una vez hayamos elegido uno.</p>
    <p>De igual manera se llenarán de forma automatica los campos de vendedor que estaremos viendo más adelante.</p>
    <br>
    <p>Si el cliente no existe, <b>presionaremos el botón de crear cliente</b> que se encuentra en la parte superior de la pantalla. Acontinuación se explicará como se creará el cliente.</p>`
  },
  {
    attachTo: {
      element: '#crearCliente',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'crearCliente',
    title: `<h5 class="tituloRojo" style="margin: auto;">Crear Cliente</h5>`,
    text: `<p></p>`
  },
  {
    attachTo: {
      element: '#idProducto',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'idProducto',
    title: `<h5 class="tituloRojo" style="margin: auto;">Item (Id Producto)</h5>`,
    text: `<p></p>`
  },
  {
    attachTo: {
      element: '#crearProducto',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'crearProducto',
    title: `<h5 class="tituloRojo" style="margin: auto;">Crear Productos</h5>`,
    text: `<p></p>`
  },
];

export const stepsOrdenTrabajo: Step.StepOptions[] = [
  {
    attachTo: {
      element: '#ultima-ot',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'ultima-ot',
    title: `<h5 class="tituloRojo" style="margin: auto;">Última OT</h5>`,
    text: `Este número indica <b>el consecutivo de la última OT creada en BagPro.</b>`
  },
  {
    attachTo: {
      element: '#orden',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'orden',
    title: `<h5 class="tituloRojo" style="margin: auto;">Consultar OT</h5>`,
    text: `En este campo puedes consultar una orden de trabajo, <b>ya sea para ver y/o editar su información.</b>`
  },
  {
    attachTo: {
      element: '#Pedido',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'Pedido',
    title: `<h5 class="tituloRojo" style="margin: auto;">Seleccionar Pedido</h5>`,
    text: `En este campo tienes la opción de seleccionar pedidos, esto para <b>crear una orden de trabajo en base al pedido elegido.</b>`
  },
  {
    attachTo: {
      element: '#encabezado1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'encabezado1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Encabezado Pedido/OT</h5>`,
    text: `Aquí encontrarás <b>los datos del encabezado del pedido seleccionado o de la orden de trabajo consultada.</b>`
  },
  {
    attachTo: {
      element: '#tabla1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'tabla1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Productos del pedido / OT</h5>`,
    text: `En esta tabla <b>se cargarán los items del pedido consultado previamente.</b><br><br>
    Para la creación de una orden de trabajo <b>debes hacer clic sobre uno de los items del pedido cargados aquí</b>,
    luego de esto se consultará la última orden de trabajo creada para esta referencia.<br><br>
    <b>Además se cargarán los checkbox's y los tabs</b> de los procesos de producción por los que pasa el producto generalmente<br><br>`
  },
  {
    attachTo: {
      element: '#pedida',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'pedida',
    title: `<h5 class="tituloRojo" style="margin: auto;">Cantidad pedida</h5>`,
    text: `En este campo podrás apreciar la cantidad pedida para cada item.`
  },
  {
    attachTo: {
      element: '#aprobada',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'aprobada',
    title: `<h5 class="tituloRojo" style="margin: auto;">Cantidad aprobada</h5>`,
    text: `En este campo <b>podrás apreciar y/o editar la cantidad aprobada a producir</b> para cada item.`
  },
  {
    attachTo: {
      element: '#check',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'check',
    title: `<h5 class="tituloRojo" style="margin: auto;">Procesos de producción</h5>`,
    text: `La selección de cualquiera de estos checkbox <b>indica que la orden de trabajo debe pasar por el proceso que se encuentra chequeado.</b><br><br>
    <b>Se adicionarán tabs para cada proceso</b> donde se podrán visualizar diferentes campos <b>que estarán diligenciados con las caracteristicas
    que tendrá la orden de trabajo,</b> dependiendo el producto seleccionado en la tabla y si ya tiene una orden de trabajo creada anteriormente<br><br>
    Cabe resaltar que <b>si no existe una OT creada anteriormente para este producto, no se cargarán los checkbox, ni los tabs,</b> y deberás
    chequear cada proceso por donde pasará la OT y diligenciar cada campo en los procesos seleccionados.<br><br>`,
  },
  {
    attachTo: {
      element: '#Cyrel',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'Cyrel',
    title: `<h5 class="tituloRojo" style="margin: auto;">Cyrel</h5>`,
    text: `Si este check está seleccionado <b>indicará que la orden de trabajo necesita cyrel.</b>`
  },
  {
    attachTo: {
      element: '#ext1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'ext1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Extrusión</h5>`,
    text: `Si este checkbox esta seleccionado, <b>se realizará automáticamente una operación para calcular el valor que tendrá el campo peso extrusión</b>,
    Revisa los cálculos en los siguientes pasos.<br><br>`
  },
  {
    attachTo: {
      element: '#ext2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'ext2',
    title: `<h5 class="tituloRojo" style="margin: auto;">Cálculo 1</h5>`,
    text: `<b>Si la unidad de medida de extrusión es Centimetros</b>, el largo de la unidad será 100, y si el material es alta, entonces el cálculo quedará así:<br>
    <b>(Valor Ancho 1 + Valor Ancho 2 + Valor Ancho 3) x Valor Calibre x 0.0048 x Valor largo unidad.</b><br><br>
    Si el material es diferente de alta entonces el cálculo será este: <br>
    <b>(Valor Ancho 1 + Valor Ancho 2 + Valor Ancho 3) x Valor Calibre x 0.00468 x Valor largo Unidad.</b><br><br>`
    ,
  },
  {
    attachTo: {
      element: '#ext3',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'ext3',
    title: `<h5 class="tituloRojo" style="margin: auto;">Cálculo 2</h5>`,
    text: `<b>Si la unidad de medida de extrusión es Pulgadas</b>, el largo de la unidad será 39.3701, y si el material es alta, entonces el cálculo quedará así:<br>
    <b>(Valor Ancho 1 + Valor Ancho 2 + Valor Ancho 3) x Valor Calibre x 0.0317 x Valor largo unidad.</b><br><br>
    Si el material es diferente de alta entonces el cálculo será este: <br>
    <b>(Valor Ancho 1 + Valor Ancho 2 + Valor Ancho 3) x Valor Calibre x 0.0302 x Valor largo Unidad.</b><br>`
    ,
  },
  {
    attachTo: {
      element: '#imp',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    id: 'imp',
    title: `<h5 class="tituloRojo" style="margin: auto;">Impresión</h5>`,
    text: `Si este checkbox esta seleccionado, se cargarán los siguientes datos del producto:<br><br>
    - <b>Tipo impresión</b><br>
    - <b>Rodillo</b><br>
    - <b>Pista</b><br>
    - <b>Tintas</b><br><br>
    En el apartado de tintas, <b>debes elegir los colores que contiene el producto.</b>`
  },
  {
    attachTo: {
      element: '#rot',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'rot',
    title: `<h5 class="tituloRojo" style="margin: auto;">Rotograbado</h5>`,
    text: `Si este checkbox esta seleccionado, se cargarán los siguientes datos del producto:<br><br>
    - <b>Tipo impresión</b><br>
    - <b>Rodillo</b><br>
    - <b>Pista</b><br>
    - <b>Tintas</b><br><br>
    En el apartado de tintas, <b>puedes elegir los colores que contiene el producto, todos los campos son opcionales.</b>`
  },
  {
    attachTo: {
      element: '#lam',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    id: 'lam',
    title: `<h5 class="tituloRojo" style="margin: auto;">Laminado</h5>`,
    text: `Si este checkbox está seleccionado, se cargarán los siguientes datos del producto:<br><br>
    <b>* Capa 1 - Calibre 1 - Cantidad 1<br>
       * Capa 2 - Calibre 2 - Cantidad 2<br>
       * Capa 3 - Calibre 3 - Cantidad 3</b><br><br>`
  },
  {
    attachTo: {
      element: '#corte',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    id: 'corte',
    title: `<h5 class="tituloRojo" style="margin: auto;">Corte</h5>`,
    text: `Si este checkbox está seleccionado, se cargarán los siguientes datos del producto:<br><br>
    - <b>Formato.</b><br>
    - <b>Ancho.</b><br>
    - <b>Largo.</b><br>
    - <b>Fuelle.</b><br>
    - <b>Margen.</b><br>`
  },
  {
    attachTo: {
      element: '#sella',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    id: 'sella',
    title: `<h5 class="tituloRojo" style="margin: auto;">Sellado</h5>`,
    text: `Si este checkbox está seleccionado, se cargarán los siguientes datos del producto:<br><br>
    - <b>Formato.</b><br>
    - <b>Ancho.</b><br>
    - <b>Largo.</b><br>
    - <b>Fuelle.</b><br>
    - <b>Porcentaje de Margen.</b><br>
    - <b>Margen Kg, que será calculado así:</b><br>
        Si la presentación es Kg: Margen Adicional * (Cantidad / 100).<br>
        Si la presentación es Und: Margen Adicional * (((Cantidad * Bolsas por Paquete * Peso Millar) / 1000) / 100).<br>
        Si la presentación es Paquete: (Margen Adicional * ((Cantidad * Peso Millar) / 1000)) / 100.<br>
    - <b>Peso Millar : se calcula así: (Peso del producto * 1000)</b><br>
    - <b>Tipo Sellado.</b><br>
    - <b>Precio Día.</b><br>
    - <b>Precio Noche.</b><br>
    - <b>Cantidad de bolsas por paquete.</b><br>
    - <b>Peso del Paquete.</b><br>
    - <b>Cantidad de bolsas por Bulto.</b><br>
    - <b>Peso del bulto.</b><br>`
  },
  {
    attachTo: {
      element: '#datos-ot',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: 'datos-ot',
    id: 'procesos',
    title: `<h5 class="tituloRojo" style="margin: auto;">Datos OT</h5>`,
    text: `En este apartado se encontrarán los datos de la OT, entre los cuales se destacan:<br><br>
   `
  },
  {
    attachTo: {
      element: '#cantidad',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    id: 'cantidad',
    title: `<h5 class="tituloRojo" style="margin: auto;">Cantidad</h5>`,
    text: `Será la cantidad que se va a crear del producto seleccionado en la tabla.`
  },
  {
    attachTo: {
      element: '#valor1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    id: 'valor1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Valor Unitario</h5>`,
    text: `Será el <b>costo unitario del producto seleccionado</b> en la tabla`
  },
  {
    attachTo: {
      element: '#neto1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    id: 'neto1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Neto Kg</h5>`,
    text: `Será el resultado del siguiente cálculo. <b>Este dependerá de la presentación del producto.</b><br><br>
    <b>Kg:</b> Cantidad + ((Cantidad * Margen Adicional) / 100)<br>
    <b>Und:</b> ((1 + (Margen Adicional / 100)) * ((Peso Millar / 1000) * Cantidad))<br>
    <b>Paquete:</b> ((1 + (Margen Adicional / 100)) * ((Peso Millar / 1000) * (Cantidad * Cantidad Und por Paquetes)))`
  },
  {
    attachTo: {
      element: '#valor-kg',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    id: 'valor-kg',
    title: `<h5 class="tituloRojo" style="margin: auto;">Valor Kilogramo</h5>`,
    text: `Será el costo que tendrá el item por kilogramo. <b>Para saber esto tenemos los siguientes cálculos que dependerán de la presentación del producto.</b><br><br>
    - Para <b>Kg:</b> Valor Unitario.<br>
    - Para <b>Und:</b> Valor de la orden / ((Cantidad * Peso Millar) / 1000); <br>
    - Para <b>Paquete:</b> Precio Unitario / Peso del Paquete.`
  },
  {
    attachTo: {
      element: '#valor-ot',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    id: 'valor-ot',
    title: `<h5 class="tituloRojo" style="margin: auto;">Valor orden de trabajo</h5>`,
    text: `Será el resultado del siguiente calculo:<br><br>
    - Para <b>Kg:</b> Cantidad * Valor Unitario.<br>
    - Para <b>Und:</b> Cantidad * Valor Unitario.<br>
    - Para <b>Paquete:</b> Cantidad * Valor Unitario.`
  },
  {
    attachTo: {
      element: '#crear',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    id: 'crear',
    title: `<h5 class="tituloRojo" style="margin: auto;">Registrar OT</h5>`,
    text: `Haciendo clic sobre este botón, <b>podrás crear una orden trabajo en base a un pedido seleccionado.</b> Así como también podrás editar una OT consultada.`
  },
  {
    attachTo: {
      element: '#limpiar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    id: 'limpiar',
    title: `<h5 class="tituloRojo" style="margin: auto;">Limpiar información</h5>`,
    text: `<b>Haz clic sobre este botón para limpiar toda la información</b> que haz diligenciado hasta el momento.`
  },
  {
    attachTo: {
      element: '#pdf',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    id: 'pdf',
    title: `<h5 class="tituloRojo" style="margin: auto;">Ver PDF</h5>`,
    text: `Al hacer click sobre este botón, Luego de consultar, puedes ver su información de manera detalla en formato PDF`
  },
];

export const stepsMezclasOT: Step.StepOptions[] = [
  {
    attachTo: {
      element: '#mezclas-ot',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    classes: '',
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'mezclas-ot',
    title: `<h5 class="tituloRojo" style="margin: auto;">Mezclas predefinidas</h5>`,
    text: `En este apartado podrás apreciar <b>las mezclas predefinidas del producto al cual deseas crearle una OT</b>, entre sus características
    se encuentran: <br><br>
    <b>- Nombre de la mezcla.</b><br>
    <b>- Número de capas de la mezcla.</b><br>
    <b>- Porcentaje de mezcla por capa.</b><br>
    <b>- Porcentaje de mezcla de materiales</b>`
  },
  {
    attachTo: {
      element: '#crear-mezclas',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'crear-mezclas',
    title: `<h5 class="tituloRojo" style="margin: auto;">Registrar nueva mezcla</h5>`,
    text: `Haciendo clic sobre este botón, <b>se cargará un modal donde podrás crear nuevas mezclas predefinidas en base a las existentes</b>
    y luego seleccionarlas para los productos a los que deseas crear ordenes de trabajo.`
  },
  {
    attachTo: {
      element: '#Mezcla',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'Mezcla',
    title: `<h5 class="tituloRojo" style="margin: auto;">Nombre mezcla predef.</h5>`,
    text: `Aquí puedes ver <b>el nombre de la mezcla predefinida que tendrá el producto</b> en la OT que estás creando.<br><br>
    Además, haciendo clic sobre este campo <b>se cargarán las diferentes mezclas predefinidas</b> <br><br>
    Puedes cambiar la mezcla, eligiendo una de las opciones de la lista, <b>al realizar esta acción, se cargarán los demás campos con la información de la mezcla seleccionada.</b>`
  },
  {
    attachTo: {
      element: '#numero-capas',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'numero-capas',
    title: `<h5 class="tituloRojo" style="margin: auto;">Número de capas.</h5>`,
    text: `Aquí puedes ver <b>el número de capas</b> que contiene la mezcla predefinida seleccionada.<br><br>`
  },
  {
    attachTo: {
      element: '#porc-mezclas',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'porc-mezclas',
    title: `<h5 class="tituloRojo" style="margin: auto;">Porc. de mezclas por capa.</h5>`,
    text: `Este porcentaje de mezclas por capa depende de el número de capas seleccionadas.<br><br>
    - Si el número de capas es 1, entonces <b>el porcentaje de la capa 1 será del 100% y el resto será 0%</b><br><br>
    - Si el número de capas es 2, generalmente <b>el porcentaje será dividido entre la primera y segunda capa.</b><br><br>
    - Si el número de capas es 3, entonces <b>el porcentaje será dividido entre las 3 capas, agregando el porcentaje deseado a cada capa, para completar el 100%</b><br>`
  },
  {
    attachTo: {
      element: '#porc-materiales',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'porc-materiales',
    title: `<h5 class="tituloRojo" style="margin: auto;">Porc. de mezclas por materiales.</h5>`,
    text: `Aquí podrás ver el porcentaje de mezcla de materiales por capa.<br><br>
    - Dependiendo el número de capas, <b>entonces se cargarán opcionalmente los materiales mezclados, quienes sumados deben completar un 100% y los pigmentos para cada capa</b><br><br>`
  },
]

export const stepsCrearMezclasOT: Step.StepOptions[] = [
  {
    attachTo: {
      element: '#mezclas-ot',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    classes: '',
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'mezclas-ot',
    title: `<h5 class="tituloRojo" style="margin: auto;">Crear nuevas mezclas</h5>`,
    text: `En este apartado podrás <b>crear nuevas mezclas predefinidas</b>, para ello debes diligenciar los siguientes campos:
    se encuentran: <br><br>
    <b>- Nombre de la mezcla.</b><br>
    <b>- Material de la mezcla.</b><br>
    <b>- Número de capas de la mezcla.</b><br>
    <b>- Porcentaje de mezcla por capa.</b><br>
    <b>- Porcentaje de mezcla de materiales</b>`
  },
  {
    attachTo: {
      element: '#crear-material',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'crear-material',
    title: `<h5 class="tituloRojo" style="margin: auto;">Registrar material</h5>`,
    text: `Haciendo clic sobre este botón, <b>se cargará un modal para crear un nuevo material</b>`
  },
  {
    attachTo: {
      element: '#crear-pigmento',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'crear-pigmento',
    title: `<h5 class="tituloRojo" style="margin: auto;">Registrar pigmento</h5>`,
    text: `Haciendo clic sobre este botón, <b>se cargará un modal para crear un nuevo pigmento</b>`
  },
  {
    attachTo: {
      element: '#Mezcla',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'Mezcla',
    title: `<h5 class="tituloRojo" style="margin: auto;">Nombre mezcla predef.</h5>`,
    text: `Aquí debes colocar el nombre de la nueva mezcla o puedes crear una nueva mezcla en base a las que ya se encuentran registradas.</b><br><br>
    Esto lo puedes realizar cambiando el nombre y los datos de la mezcla seleccionada.`
  },
  {
    attachTo: {
      element: '#material',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'material',
    title: `<h5 class="tituloRojo" style="margin: auto;">Material</h5>`,
    text: `Aquí puedes elegir el material de la mezcla predefinida que deseas crear.`
  },
  {
    attachTo: {
      element: '#numero-capas',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'numero-capas',
    title: `<h5 class="tituloRojo" style="margin: auto;">Número de capas.</h5>`,
    text: `Aquí debes elegir <b>el número de capas</b> que contendrá la mezcla predefinida que deseas crear.<br><br>`
  },
  {
    attachTo: {
      element: '#porc-mezclas',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'porc-mezclas',
    title: `<h5 class="tituloRojo" style="margin: auto;">Porc. de mezclas por capa.</h5>`,
    text: `Este porcentaje de mezclas por capa depende de el número de capas seleccionadas.<br><br>
    - Si el número de capas es 1, entonces <b>el porcentaje de la capa 1 será del 100% y el resto será 0%</b><br><br>
    - Si el número de capas es 2, generalmente <b>el porcentaje será dividido entre la primera y segunda capa. </b><br><br>
    - Si el número de capas es 3, entonces <b>el porcentaje será dividido el 100% entre las 3 capas.</b><br>`
  },
  {
    attachTo: {
      element: '#porc-materiales',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'porc-materiales',
    title: `<h5 class="tituloRojo" style="margin: auto;">Porc. de mezclas por materiales.</h5>`,
    text: `Aquí podrás ver el porcentaje de mezcla de materiales por capa.<br><br>
    Depende el número de capas que elijas, <b>deberás seleccionar materiales que sumados completen un 100% en cada capa y los pigmentos de dicha capa. </b><br><br>`
  },
  {
    attachTo: {
      element: '#crear-nueva',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    classes: '',
    scrollTo: { behavior: 'smooth', block: 'center' },
    id: 'crear-nueva',
    title: `<h5 class="tituloRojo" style="margin: auto;">Porc. de mezclas por materiales.</h5>`,
    text: `<b>Haciendo clic sobre el botón crear mezcla</b>, se registrarán los datos de la nueva mezcla predefinida.<br><br>
    Si haces clic sobre limpiar campos se reiniciará el formulario.`
  },
]

/*********************************************************** PEDIDOS DE PRODUCTOS ********************************************************************/
export const stepsCrearPedidos : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#none',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'none',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Pedidos de Productos!</h4>',
    text: `<p>¡Es un documento donde quedará evidencia de los pedidos realizados por los clientes. Posteriormente a la creación los pedidos serán revisados y aceptados o denegados por una persona encargada!</p>`
  },
  {
    attachTo: {
      element: '#formulario1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'formulario1',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Información General del Pedido!</h4>',
    text: `<p>¡Para crear un pedido necesitamos saber cierta información acerca del cliente al que se le creará. A continueación se explicará como se llena esta información!</p>`
  },
  {
    attachTo: {
      element: '#cliente',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'cliente',
    title: '<h4 style="margin: auto; color: var(--rojo)"><i class="pi pi-users font-size-20"></i> ¡Cliente!</h4>',
    text: `<p>¡Iniciamos <b>eligiendo el cliente</b>, podemos buscarlo ya sea <b>escribiendo el nombre o la identificación</b> o podemos buscarlo directamente en la lista desplegable!</p>
          <br> <p>¡Algo a tener muy en cuenta es que al momento de seleccionar el cliente al que le vamos a crear el pedido el programa se encargará de <b>buscar si el cliente se encuentra o no en cartera, de ser así no se le podrá crear un pedido</b>!</p>`
  },
  {
    attachTo: {
      element: '#ciudad',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'ciudad',
    title: '<h4 style="margin: auto; color: var(--rojo)"><i class="pi pi-map-marker font-size-20"></i> ¡Ciudad!</h4>',
    text: `<p>¡Al seleccionar el cliente al que le haremos el pedido, la opción <b>ciudad se autocompletará si el cliente tiene registrada una sola ciudad</b>, de lo contario se colocarán en esta lista desplegable las ciudades en las que se encuentra el cliente para que elijamos una!</p>`
  },
  {
    attachTo: {
      element: '#sedeCliente',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'sedeCliente',
    title: '<h4 style="margin: auto; color: var(--rojo)"><i class="pi pi-building font-size-20"></i> ¡Dirección Sede!</h4>',
    text: `<p>¡Posterior a haber elegido la ciudad <b>este campo se llenará automaticamente si el cliente tiene una sede en la ciudad elegida</b>, si tiene más de una debemos elegir la direccion de las que están en la lista desplegable!</p>`
  },
  {
    attachTo: {
      element: '#vendedor',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'vendedor',
    title: '<h4 style="margin: auto; color: var(--rojo)"><i class="pi pi-user font-size-20"></i> ¡Vendedor!</h4>',
    text: `<p>¡El vendedor se eligirá automaticamente al seleccionar un cliente!</p>`
  },
  {
    attachTo: {
      element: '#descuento',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'descuento',
    title: '<h4 style="margin: auto; color: var(--rojo)"><i class="pi pi-percentage font-size-20"></i> ¡Descuento!</h4>',
    text: `<p>¡Para realizar un <b>descuento sobre el valor total del pedido</b> debemos colocar el <b>porcentaje de descuento que realizaremos</b>!</p>`
  },
  {
    attachTo: {
      element: '#observacion',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'observacion',
    title: '<h4 style="margin: auto; color: var(--rojo)"><i class="pi pi-book font-size-20"></i> ¡Observacion!</h4>',
    text: `<p>¡Si tenemos una observación o descripción sobre le pedido podemos colocarla aquí, sino lo dejamos vacio!</p>`
  },
  {
    attachTo: {
      element: '#iva',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'iva',
    title: '<h4 style="margin: auto; color: var(--rojo)"><i class="pi pi-check-square font-size-20"></i> ¡IVA!</h4>',
    text: `<p>¡Si el cliente que seleccionamos no tiene IVA podemos desmarcar o deseleccionar este check!</p>`
  },
  {
    attachTo: {
      element: '#formulario2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'formulario2',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Productos!</h4>',
    text: `<p>¡Llenando estos campos podemos elegir los productos que tendrá el pedido!</p>`
  },
  {
    attachTo: {
      element: '#item',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'item',
    title: '<h4 style="margin: auto; color: var(--rojo)"><i class="pi pi-shopping-bag font-size-20"></i> ¡Item!</h4>',
    text: `<p>¡Podemos <b>buscar un item</b> por medio de este campo, para ello necesitamos <b>saber el código del item y digitarlo aquí</b>!</p>`
  },
  {
    attachTo: {
      element: '#referencia',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'referencia',
    title: '<h4 style="margin: auto; color: var(--rojo)"><i class="pi pi-shopping-bag font-size-20"></i> ¡Referencia!</h4>',
    text: `<p>¡Cuando elegimos el cliente otro de los campos que se llena automaticamente es la Referencia, esta es una lista desplegable en la que <b>saldrán unicamente los productos que ha comprado este cliente a lo largo de los años</b>!</p>`
  },
  {
    attachTo: {
      element: '#cantidad',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'cantidad',
    title: '<h4 style="margin: auto; color: var(--rojo)"><i class="pi pi-cart-plus font-size-20"></i> ¡Cantidad!</h4>',
    text: `<p>¡En este campo debemo digitar la cantidad del producto que nos están pidiendo!</p>`
  },
  {
    attachTo: {
      element: '#presentacion',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'presentacion',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Presentación!</h4>',
    text: `<p>¡Cuando elegimos o buscamos un producto este campo <b>se llenará automaticamente</b>, pero <b>si queremos podemos cambiar la presentación</b> en la que se venderá el producto!</p>`
  },
  {
    attachTo: {
      element: '#precio',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'precio',
    title: '<h4 style="margin: auto; color: var(--rojo)"><i class="pi pi-dollar font-size-20"></i>¡Precio!</h4>',
    text: `<p>¡El precio de igual manerá se llenará con base el producto elegido, tambien podemos cambiar el precio. El precio que digitemos <b>debe ser mayor o igual al ultimo precio al que se vendió</b> este item!</p>`
  },
  {
    attachTo: {
      element: '#fecha',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'fecha',
    title: '<h4 style="margin: auto; color: var(--rojo)"><i class="pi pi-calendar font-size-20"></i>¡Fecha!</h4>',
    text: `<p>¡En esta fecha debemos colocar el <b>día en que será entregado</b> el producto terminado!</p>`
  },
  {
    attachTo: {
      element: '#stock',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'stock',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Stock!</h4>',
    text: `<p>¡Aquí podremos <b>ver el stock actual</b> del producto!</p>`
  },
  {
    attachTo: {
      element: '#ultPrecio',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'ultPrecio',
    title: '<h4 style="margin: auto; color: var(--rojo)"><i class="pi pi-dollar font-size-20"></i>¡Ultimo Precio!</h4>',
    text: `<p>¡<b>Ultimo precio al que se facturó</b> el item elegido o buscado!</p>`
  },
  {
    attachTo: {
      element: '#ultFecha',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'ultFecha',
    title: '<h4 style="margin: auto; color: var(--rojo)"><i class="pi pi-calendar font-size-20"></i>¡Ultima Fecha!</h4>',
    text: `<p>¡Está es la <b>ultima fecha en que se vendió</b> el producto!</p>`
  },
  {
    attachTo: {
      element: '#agregar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'agregar',
    title: '<h4 style="margin: auto; color: var(--rojo)"><i class="pi pi-send font-size-20"></i>¡Agregar!</h4>',
    text: `<p>¡Una vez hayamos terminado de llenar todos los campos de productos <b>agregamos este mismo a la tabla siguiente</b> para poder ir guardando momentaneamente ahí los productos que tendrá el pedido!</p>`
  },
  {
    attachTo: {
      element: '#limpiar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'limpiar',
    title: '<h4 style="margin: auto; color: var(--rojo)"><i class="pi pi-eraser font-size-20"></i>¡Limpiar!</h4>',
    text: `<p>¡Con este botón podemos <b>limpiar los campos de productos</b> para llenarlos nuevamente!</p>`
  },
  {
    attachTo: {
      element: '#tabla',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'tabla',
    title: '<h4 style="margin: auto; color: var(--rojo)"><i class="pi pi-table font-size-20"></i>¡Tabla Productos!</h4>',
    text: `<p>¡Esta será la tabla donde ser estarán almacenando los productos que vayamos seleccionando para el pedido!</p>`
  },
  {
    attachTo: {
      element: '#quitarEliminar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'quitarEliminar',
    title: '<h4 style="margin: auto; color: var(--rojo)"><i class="pi pi-trash font-size-20"></i>¡Quitar o Eliminar Productos!</h4>',
    text: `<p>¡Con este botón tenemos la opción de <b>quitar y/o eliminar productos</b> de pedidos ya existentes o pedidos que apenas estamos creando!</p>`
  },
  {
    attachTo: {
      element: '#costosPedidos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'costosPedidos',
    title: '<h4 style="margin: auto; color: var(--rojo)"><i class="pi pi-wallet font-size-20"></i>¡Costos del Pedido!</h4>',
    text: `<p>¡Se nos mostrarán los <b>costos que tendrá el pedido</b> con base a los productos seleccionados, descuentos e IVA!</p>`
  },
  {
    attachTo: {
      element: '#crearPedido',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'crearPedido',
    title: '<h4 style="margin: auto; color: var(--rojo)"><i class="pi pi-wallet font-size-20"></i>¡Crear Pedido!</h4>',
    text: `<p>¡Por último tenemos que <b>crear el pedido</b>, al presionar este botón <b>nos saldrá un mensaje donde debemos confirmar (o no) que queremos crear el pedido</b>, luego de eso el pedido se habrá creado y <b>nos mostrará un PDF con la información del pedido creado</b>!</p>`
  },
  {
    attachTo: {
      element: '#limpiarTodo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'limpiarTodo',
    title: '<h4 style="margin: auto; color: var(--rojo)"><i class="pi pi-wallet font-size-20"></i>¡Limpiar Todo!</h4>',
    text: `<p>¡Con este botón podrems <b>limpiar todos</b> los campos y tablas del modulo!</p>`
  },
];

export const stepsVerPedidos : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#none',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'none',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Ver Pedidos!</h4>',
    text: `<p>¡En este modulo podremos ver los pedidos de productos que tienen los estados <b>Pendiente</b> y <b>Parcialmente Satisfecho</b>, podremos aceptar o anular pedidos entre otras funciones que explicarán en el siguiente recorrido!</p>`
  },
  {
    attachTo: {
      element: '#informacionColores',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'informacionColores',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Información Colores!</h4>',
    text: `<p>En este modulo veremos los pedidos divididos por colores que son y significan los siguiente: </p>
          <ol>
            <li><b>Verde:</b> Indica que todos los productos de un pedido pueden ser facturados porque el stock de estos productos es mayor o igual a la cantidad que se está pidiendo.</li>
            <li><b>Azul:</b> Indica que algunos de los productos del pedido pueden ser facturados, pero no todo el pedido, porque algunos productos tienen stock suficiente y otros no. Los que tengan stock suficiente saldrán en verde dentro del pedido</li>
            <li><b>Rojo:</b> El rojo es para los pedidos que fueron creados pero aún no han sido aceptados.</li>
            <li><b>Blanco:</b> Indica que ninguno de los productos del pedido tiene stock suficiente para ser facturado.</li>
          </ol>`
  },
  {
    attachTo: {
      element: '#excel',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'excel',
    title: '<h4 style="margin: auto; color: var(--rojo)"><i class="pi pi-file-excel font-size-20"></i> ¡Excel!</h4>',
    text: `<p>¡Podemos ver en excel la información de los pedidos para mayor comodidad!</p>`
  },
  {
    attachTo: {
      element: '#tablaPedidos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'tablaPedidos',
    title: '<h4 style="margin: auto; color: var(--rojo)"><i class="pi pi-table font-size-20"></i> ¡Tabla Pedidos!</h4>',
    text: `<p>¡En esta tabla estaremos viendo la información de los pedidos. <br><br>Los pedidos saldrán agrupados, arriba del todo saldrá el número de pedido con el nombre del cliente y debajo de esto saldrán los productos relacionados a este pedido!</p>`
  },
  {
    attachTo: {
      element: '#columnas',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'columnas',
    title: '<h4 style="margin: auto; color: var(--rojo)"><i class="pi pi-bars font-size-20"></i> ¡Columnas de la Tabla!</h4>',
    text: `<p>¡Con la lista desplegable que tenemos podemos seleccionar que columnas queremos ver y cuales no!</p>`
  },
  {
    attachTo: {
      element: '#filtros',
      on: 'bottom-start'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'filtros',
    title: '<h4 style="margin: auto; color: var(--rojo)"><i class="pi pi-bars font-size-20"></i> ¡Filtros de Columnas!</h4>',
    text: `<p>¡Podemos filtrar la información de la tabla escribiendo en uno de los campos de las columnas por un dato en especifico o general que conozcamos!</p>`
  },
  {
    attachTo: {
      element: '#titulosColumnas',
      on: 'bottom-start'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'titulosColumnas',
    title: '<h4 style="margin: auto; color: var(--rojo)"><i class="pi pi-bars font-size-20"></i> ¡Titulos de Columnas!</h4>',
    text: `<p>En donde estan los titulos de las columnas tenemos las siguientes acciones disponibles:</p>
          <ul>
            <li><b>Ordenar los registros de la tabla por los datos de una columna:</b> Si presionamos click sobre el titulo de la columna veremos como esta se ordena de mayor a menor o menor a mayor.</li>
            <li><b>Reorganizar las columnas:</b> Si dejamos presionado el click sobre el titulo de una columna y luego la arrastramos nos irán apareciendo flechas en los bordes de las otras columnas, esto indica que ahí podemos posicionar la columnas que estamos arrastrando.</li>
            <li><b>Redimencionar columnas:</b> Para esto tenemos que posicionar nuestro mause sobre el borde demarcada de cada titulo, dejamos presionado y arrastramos.</li>
          </ul>`
  },
  {
    attachTo: {
      element: '#filas',
      on: 'bottom-start'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'filas',
    title: '<h4 style="margin: auto; color: var(--rojo)"><i class="pi pi-bars font-size-20"></i> ¡Ordenes de trabajo!</h4>',
    text: `<p>¡Si el pedido tiene ordenes de trabajo asociadas podemos presionar doble click sobre la fila de productos para poder ver la información de la OT!</p>`
  },
  {
    attachTo: {
      element: '#ver',
      on: 'bottom-start'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'ver',
    title: '<h4 style="margin: auto; color: var(--rojo)"><i class="pi pi-file-pdf font-size-20"></i> ¡Ver Pedido!</h4>',
    text: `<p>¡Podemos ver la información de un pedido en un PDF, esto lo hacemos presionando el botón con el icono <i class="pi pi-eye"></i>!</p>`
  },
  {
    attachTo: {
      element: '#editar',
      on: 'bottom-start'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'editar',
    title: '<h4 style="margin: auto; color: var(--rojo)"><i class="pi pi-pencil font-size-20"></i> ¡Editar Pedido!</h4>',
    text: `<p>¡Si hay un pedido que no ha sido aceptado aún y quieres editarlo puedes hacerlo presionando el icono <i class="pi pi-pencil"></i>!</p>`
  },
  {
    attachTo: {
      element: '#confirmar',
      on: 'bottom-start'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'confirmar',
    title: '<h4 style="margin: auto; color: var(--rojo)"><i class="pi pi-check font-size-20"></i> ¡Confirmar Pedido!</h4>',
    text: `<p>¡Cuando ya hemos revisado un pedido y queremos confirmarlo o aceptarlo presionamos el icono <i class="pi pi-check"></i>!</p>`
  },
  {
    attachTo: {
      element: '#anular',
      on: 'bottom-start'
    },
    buttons: [
      builtInButtons.back,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'anular',
    title: '<h4 style="margin: auto; color: var(--rojo)"><i class="pi pi-times font-size-20"></i> ¡Anular Pedido!</h4>',
    text: `<p>¡Si queremos anular uno de los pedidos que no han sido aceptados presionamos el icono <i class="pi pi-times"></i>!</p>`
  },
];

/***************************************************************** PRODUCTOS ************************************************************************/
export const stepsProductos : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#none',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'none',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Inventario de Productos!</h4>',
    text: `<p>¡En este modulo podremos ver el inventario de los productos terminados, además tenemos algunas acciones que podemos realizar, las cuales estaremos explicando más adelante!</p>`
  },
  {
    attachTo: {
      element: '#excel',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'excel',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Excel!</h4>',
    text: `<p>¡Una de las opciones a realizar es exportar la información de las excistencias a excel. Presionando este botón podemos exportar esta información a excel!</p>`
  },
  {
    attachTo: {
      element: '#editar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'editar',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Crear Receta!</h4>',
    text: `<p>¡Presionando este botón podremos crear una receta para un producto!</p>`
  },
  {
    attachTo: {
      element: '#costoTotal',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'costoTotal',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Costo Total!</h4>',
    text: `<p>¡Podemos ver el costo total de los productos en la bodega de inventario!</p>`
  },
  {
    attachTo: {
      element: '#tablaProductos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'tablaProductos',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Productos!</h4>',
    text: `<p>¡En esta tabla podremos ver la información de los productos que hay que stock!</p>`
  },
  {
    attachTo: {
      element: '#columnas',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'columnas',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Columnas de la tabla!</h4>',
    text: `<p>¡Con esta lista desplegable podemos ver, seleccionar y deseleccionar las columnas que queremos!</p>`
  },
  {
    attachTo: {
      element: '#filtros',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'filtros',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Filtros de la tabla!</h4>',
    text: `<p>¡Si necesitamos buscar un producto en especifico podemos filtrar la información por medio de estos campos, colocamos la información que conocemos en la conlumna correspondiente y automaticamente se reducirán la cantidad de productos que hay en la tabla!</p>`
  },
  {
    attachTo: {
      element: '#nombres',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'nombres',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Titulos de la tabla!</h4>',
    text: `<p>¡En cada uno de los campos en los que aparecen los nombres de las columnas tenemos el siguiente icono '<i class="pi pi-sort-alt"></i>', esto indica que la columnas puede ser ordenada de mayor a menor o de menor a mayor haciendo click sobre este campo!</p>`
  },
  {
    attachTo: {
      element: '#editarReceta',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.cancel,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'editarReceta',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Editar o Ver Receta!</h4>',
    text: `<p>¡Si queremos <b>ver o editar</b> la información de una receta <b>podemos presionar click</b> en el nombre o información del producto!</p>`
  },
];

/***************************************************************** RECETAS PRODUCTOS *******************************************************************/
export const stepsRecetaProductos : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#none',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'none',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Recetas Productos!</h4>',
    text: `<p>¡Desde este pequeño módulo podemos crear las recetas de los productos, además podemos ver y editar las recetas de los productos que hayamos creado!</p>`
  },
  {
    attachTo: {
      element: '#productos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'productos',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Productos!</h4>',
    text: `<p>¡Inicialmente debemos seleccionar el producto al que se le creará la receta!</p>`
  },
  {
    attachTo: {
      element: '#materiasPrimas',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'materiasPrimas',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Materias Primas!</h4>',
    text: `<p>¡Desde aquí podemos seleccionar las materias primas que se van a utilizar en la receta!</p>`
  },
  {
    attachTo: {
      element: '#tablaMateriasPrimas',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'tablaMateriasPrimas',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Mat. Primas Seleccionadas!</h4>',
    text: `<p>¡En esta tabla estarán las materias primas que se han seleccionado para la receta!</p>`
  },
  {
    attachTo: {
      element: '#botones',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.cancel,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'botones',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Acciones!</h4>',
    text: `<p>En esta apartado están las acciones que podemos realizar en el módulo.</p>
    <p><b>Guardar o Editar:</b> Una vez hayamos seleccionado todas las materias primas podemos <b>guardar o editar</b> la receta.</p>
    <p><b>Limpiar Campos:</b> Podemos limpiar todos los campos para volver a seleccionar el producto.</p>`
  },
];

/******************************************************************** REPORTES *************************************************************************/
export const stepsReporteCostos : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#none',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'none',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Reporte de Costos!</h4>',
    text: `<p>¡Con el reporte de costos vamos a poder saber que materia prima tiene una orden de trabajo, el costo de la materia prima, el proceso por el que está pasando y cuanto lleva pesado, las ganacias de la orden, podemos cambiar su estado si lo deseamos, etc...!</p>`
  },
  {
    attachTo: {
      element: '#formulario',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'formulario',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Formulario!</h4>',
    text: `<p>¡Para ver la información de una orden debemos buscar la orden, para eso tenemos el campo <b>OT</b>, en el que <b>digitamos el número de la OT y presionamos enter o el botón Consultar OT</b>. Los otros campos se llenarán dependiendo de la información de la OT!</p>`
  },
  {
    attachTo: {
      element: '#estado',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'estado',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Estado!</h4>',
    text: `<p>¡Cuando busquemos la OT, este campo se llenará automaticamente pero podemos cambiar su valor con el fin de cambiar el estado de la orden!</p>`
  },
  {
    attachTo: {
      element: '#cambiarEstado',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'cambiarEstado',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Cambiar Estado!</h4>',
    text: `<p>¡Posterior a haber seleccionado otro estado presionamos este botón y listo, habremos cambiado el estado de la OT!</p>`
  },
  {
    attachTo: {
      element: '#consultarOT',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'consultarOT',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Consultar OT!</h4>',
    text: `<p>¡Una de la opciones para consultar una orden es presionando este botón luego de haber diligenciado el campo OT!</p>`
  },
  {
    attachTo: {
      element: '#limpiarCampos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'limpiarCampos',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Limpiar Campos!</h4>',
    text: `<p>¡Este botón limpiará todos los campos, tablas y etiquetas con información!</p>`
  },
  {
    attachTo: {
      element: '#pdf',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'pdf',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Crear PDF!</h4>',
    text: `<p>¡Toda la información que vemos en este modulo la podemos ver en un archivo PDF si se nos hace más sencillo!</p>`
  },
  {
    attachTo: {
      element: '#cerrarOrden',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'cerrarOrden',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Cerrar Orden!</h4>',
    text: `<p>¡Si una orden de trabajo ya está completa y necesitamos que ya no deje pesar más, podemos cambiarle el estado a <b>Cerrada</b> solo con presionar este botón!</p>`
  },
  {
    attachTo: {
      element: '#tablaMatPrima',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'tablaMatPrima',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Tabla Materia Prima!</h4>',
    text: `<p>¡En esta tabla estará la información de las materias peimas asignadas a la orden de trabajo!</p>`
  },
  {
    attachTo: {
      element: '#kilosMatPrima',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'kilosMatPrima',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Total Kg Mat. Prima!</h4>',
    text: `<p>¡Este es el total de kilos de materia prima que se le asignaron a una orden de trabajo!</p>`
  },
  {
    attachTo: {
      element: '#valorMatPrima',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'valorMatPrima',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Valor Mat. Prima!</h4>',
    text: `<p>¡Costo total de la materia prima asignada!</p>`
  },
  {
    attachTo: {
      element: '#tablaProcesos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'tablaProcesos',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Tabla Procesos!</h4>',
    text: `<p>¡Cada uno de los procesos estará en una columna de la tabla, bajo cada proceso saldrá la cantidad que se ha pesado en el proceso correspondiente!</p>`
  },
  {
    attachTo: {
      element: '#costoTotalProducido',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'costoTotalProducido',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Costo Producido!</h4>',
    text: `<p>¡Si la OT buscada ya llegó al proceso de Empaque, Sellado o Wiketiado, se calculará el costo del producto producido en una de estás áreas, este será la multiplicación de la cantidad producida por el valor de kg o unidad, dependiendo de la presentación del producto!</p>`
  },
  {
    attachTo: {
      element: '#ganancia',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'ganancia',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Ganancia!</h4>',
    text: `<p>¡La ganancia es el restante de la operación del <b>Costo Producido</b> menos <b>el costo de las materias primas</b>!</p>`
  },
  {
    attachTo: {
      element: '#porcentajeGanacia',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'porcentajeGanacia',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Porcentaje Ganancia!</h4>',
    text: `<p>¡Porcentaje de ganancia generada!</p>`
  },
];

export const stepsReporteFacturacion : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#none',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'none',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Consolidad de Facturación!</h4>',
    text: `<p>¡Se podrá visualizar la cantidad de cada uno de los items que se piden mes a mes, esto se verá de manera consolidada por Item, Cliente, Vendedor, Mes y Año. Se podrá consultar por vendedor, cliente, item y un rango de años. <br><br>En el caso de los vendedores tendrán diligenciado con su nombre el filtro de vendedor y solo podrán editar los filtros de cliente, item y años.!</p>`
  },
  {
    attachTo: {
      element: '#formularioFiltros',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'formularioFiltros',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Filtros de Consulta!</h4>',
    text: `<p>¡Tenemos diferentes opciones de consultar la información de facturación, acontinuación las explicaremos una a una!</p>`
  },
  {
    attachTo: {
      element: '#vendedor',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'vendedor',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Vendedores!</h4>',
    text: `<p>¡Podemos seleccionar un vendedor en especifico para poder consultar la información de su facturación!</p>`
  },
  {
    attachTo: {
      element: '#cliente',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'cliente',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Clientes!</h4>',
    text: `<p>¡Cuando seleccionamos un vendedor se nos cargarán todos los clientes de este, de entre esos podemos escoger uno para una busqueda más eficiente. Tambien podemos escribir el nombre del cliente y nos irá saliendo una lista con los clientes a los que les conincide el nombre escrito!</p>`
  },
  {
    attachTo: {
      element: '#producto',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'producto',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Productos!</h4>',
    text: `<p>¡Si hemos seleccionado un cliente, nos saldrán los productos que ese cliente ha compra. Si queremos elegir un producto diferente simplemente escribimos el nombre y lo seleccionamos!</p>`
  },
  {
    attachTo: {
      element: '#anio1',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'anio1',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Año Incial!</h4>',
    text: `<p>¡Elegimos el año desde el que queremos buscar la facturación. Si no elegimos ningún año se consultará el año actual!</p>`
  },
  {
    attachTo: {
      element: '#anio2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'anio2',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Año Final!</h4>',
    text: `<p>¡Elegimos el año hasta el que queremos buscar la facturación. Si no elegimos ningún año se consultará el año actual!</p>`
  },
  {
    attachTo: {
      element: '#botones',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'botones',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Botones!</h4>',
    text: `<p>Tenemos 3 botones con las siguientes opciones:</p>
          <br>
          <ul>
            <li>Consultar: Al terminar de llenar los filtros lo presionamos e iniciará la busqueda. Si no llenamos ningún filtro buscará absolutamente toda la información de facturación del año actual</li>
            <li>Limpiar Campos: Limpiará todos los filtros.</li>
            <li>Exportar Excel: Tenemos la opción de ver la información consultada en un archivo de excel.</li>
          </ul>`
  },
  {
    attachTo: {
      element: '#tabla',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'tabla',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Tabla con Registros!</h4>',
    text: `<p>En esta tabla saldrá la información resultante de la busqueda realizada anteriormente, esta información saldrá consolidada de la siguiente manera:</p>
          <br>
          <ul>
            <li>Año.</li>
            <li>Mes.</li>
            <li>Vendedor.</li>
            <li>Cliente al que se le vendió el producto.</li>
            <li>Producto.</li>
            <li>Cantidad Vendidad del producto en el mes.</li>
            <li>Precio al que se vendió el producto. (Cabe la posibilidad de que salga un producto repetido en un mismo mes, esto es porque se vendió a precios diferentes).</li>
            <li>Presentación del producto.</li>
          </ul>
          <br>
          Podemos ordenar los registros de la tabla presionando click en el nombre de la columna.`
  },
  {
    attachTo: {
      element: '#filtros',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'filtros',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Filtros de la tabla!</h4>',
    text: `<p>¡Si necesitamos buscar un producto en especifico podemos filtrar la información por medio de estos campos, colocamos la información que conocemos en la conlumna correspondiente y automaticamente se reducirán la cantidad de productos que hay en la tabla!</p>`
  },
];

export const stepsReportesProcesosOT : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#none',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'none',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Reporte de Proceso OT!</h4>',
    text: `<p>¡El reporte de procesos OT es en podemos ver diferentes datos a cerca de las ordenes de trabajo, acontinuación se enumerarán los datos y acciones que podemos realizar!</p>
          <ol>
            <li>Agregar una falla a una orden de trabajo.</li>
            <li>Exportar la información consultada a excel.</li>
            <li>Ver los procesos por los que pasó o está pasando la orden de trabajo y cuanto lleva pesado en cada uno.</li>
            <li>Ver el reporte de costos de una orden de trabajo.</li>
            <li>Ver los rollos pesados en cada uno de los procesos.</li>
            <li>Cambiar el estado de una orden de trabajo.</li>
          </ol>`
  },
  {
    attachTo: {
      element: '#filtrosBusqueda',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'filtrosBusqueda',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Filtros de Busqueda!</h4>',
    text: `<p>¡Incialmente veremos todos los filtros por los que podemos consultar una orden de trabajo, llenadolos podremos consultar una(s) orden(es) en especifico con las caracteristicas que estamos colocando en los filtros!</p>`
  },
  {
    attachTo: {
      element: '#fallas',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'fallas',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Fallas!</h4>',
    text: `<p>¡Este campo no solo nos sirve para adicionar información a los filtros de busqueda, tambien nos sirve para agregar fallas a una orden de trbajo, falla que explicaria porqué no se completo o cualquier otro motivo!</p>`
  },
  {
    attachTo: {
      element: '#observacion',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'observacion',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Observación!</h4>',
    text: `<p>¡La observación no es un filtro como el resto de campos, es un complemento al campo falla. Si queremos agregar una falla podemos colocarle una descripción o observación sobre el porqué falló!</p>`
  },
  {
    attachTo: {
      element: '#consultar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'consultar',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Consultar!</h4>',
    text: `<p>¡Al terminar de llenar los filtros presionamos consultar y empezará a buscar ordenes de trabajo con la información que le pasamos en los filtros. Si no queremos llenar los filtros presionamos directamente este botón y nos traerá todas las ordenes creadas el día de hoy!</p>`
  },
  {
    attachTo: {
      element: '#limpiarTodo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'limpiarTodo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Limpiar Todo!</h4>',
    text: `<p>¡Este botón limpiará tanto los filtros como la tabla!</p>`
  },
  {
    attachTo: {
      element: '#agregarFalla',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'agregarFalla',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Agregar Falla!</h4>',
    text: `<p>¡Para agregar una falla debemos hacer click en la tabla sobre la orden de trabajo a la que le registraremos la falla y luego con los campos 'Fallas' y 'Observcaión' (que es opcional) llenos presionamos este botón y listo!</p>`
  },
  {
    attachTo: {
      element: '#excel',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'excel',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Excel!</h4>',
    text: `<p>¡Podemos exportar la información que hayamos consultado a un archivo de excel presionando este botón!</p>`
  },
  {
    attachTo: {
      element: '#columnasSeleccionables',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'columnasSeleccionables',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Columnas Disponibles!</h4>',
    text: `<p>¡Si desplegamos esta lista veremos que hay columnas que podemos añadir a la tabla para mayor información, simplemente seleccionamos la tabla que queremos!</p>`
  },
  {
    attachTo: {
      element: '#cambiarEstados',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'cambiarEstados',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Cambiar Estados!</h4>',
    text: `<p>¡Tenemos la opción de cambiar los estados de manera masiva, es decir, a varias ordenes al mismo tiempo. Podemos hacerlo seleccionando las ordenes a las que le queremos cambiar el estado y presionamos este botón, al presionarlo se abrirá un modal en el que podemos elegir el estado que tendrán las ordenes que elegimos!</p>`
  },
  {
    attachTo: {
      element: '#botonesColores',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'botonesColores',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Colores!</h4>',
    text: `<p>¡Presionando cada uno de esto botones podremos ver que significa cada color en la tabla!</p>`
  },
  {
    attachTo: {
      element: '#columnas',
      on: 'bottom-start'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'columnas',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Columnas!</h4>',
    text: `<p>¡Podemos redimencionar las columnas situando el mause al borde de titulo de cada donde el cursor cambiará de icono, presionamos click y arrastramos!</p><br><p>¡Tambien podemos ordenar de mayor a menor o de menor a mayor presionando click sobre las columnas con el icono '<i class="pi pi-sort-alt"></i>'!</p>`
  },
  {
    attachTo: {
      element: '#elegirTodo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'elegirTodo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Seleccionar Ordenes de Trabajo!</h4>',
    text: `<p>¡Podemos elegir todas las ordenes de trabajo que tenemos en el tabla presionando este check en la fila de las columnas!</p>
           <p>¡Podemos elegir solo una o unas de las ordenes de trabajo de la tabla presionando el check que se encuentra al lado izquierdo de los numeros de las ordenes de trabajo!</p>`
  },
  {
    attachTo: {
      element: '#ordenTrabajo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'ordenTrabajo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Reporte de Costos!</h4>',
    text: `<p>¡Podremos ver los costos de una orden de compra si presionamos click sobre el número de la orden. Se abrirá un modal donde se verá el reporte de costos!</p>`
  },
  {
    attachTo: {
      element: '#procesos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'procesos',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Procesos!</h4>',
    text: `<p>¡Cuando alguno de los procesos tenga cantidades pesadas podemos presionar click sobre el proceso y veremos de manera detallada los rollos que pertenecen a la orden de trabajo!</p>`
  },
  {
    attachTo: {
      element: '#cambiarEstado',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'cambiarEstado',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Cambiar Estado de OT!</h4>',
    text: `<p>¡En la última orden de trabajo podremos ver un botón con lapiz, si lo presionamos nos aparecerá un modal en el que vamos a poder cambiar el estado de la orden de trabajo!</p>`
  },
];

export const stepsReporteRollosEliminados : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#none',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'none',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Rollos Eliminados!</h4>',
    text: `<p>¡En este apartado podremos todos los rollos que han sido eliminados delas bodegas de extrusión, despacho e incluso los rollos que se han eliminado de la base de datos de BagPro!</p>`
  },
  {
    attachTo: {
      element: '#filtros',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'filtros',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Filtros!</h4>',
    text: `<p>¡Los filtros nos ayudan a realizar una busqueda más enfocada y precisa al momento de consultar los rollos eliminados!</p>`
  },
  {
    attachTo: {
      element: '#botones',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'botones',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Botones!</h4>',
    text: `<p>Tenemos los siguientes botones con las siguientes acciones: </p>` + `
    <br>
    <ul>
      <li><b>Consultar:</b> Luego de haber llenado los filtros podemos consultar presionando este botón. Sí no llenamos los filtros el programa buscará los rollos eliminados del día de hoy.</li>
      <li><b>Limpiar Campos:</b> Limpiará todos los filtros y la información de la tabla.</li>
      <li><b>Exportar:</b> Una vez hayamos consultamos podremos exportar la información a excel.</li>
    </ul>`
  },
  {
    attachTo: {
      element: '#tableProcesos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'tableProcesos',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Tabla!</h4>',
    text: `<p>¡En esta tabla estará apareciendo toda la información relacionada a los rollos consultados!</p>`
  },
  {
    attachTo: {
      element: '#columnasAdicionales',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'columnasAdicionales',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Columnas adicionales!</h4>',
    text: `<p>¡Luego de haber consultado y que se haya llenado la tabla podemos ver aquí columnas que podemos adicionar a la tabla!</p>`
  },
];

export const stepsReporteRecibosCaja : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#recibos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'recibos',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class=""></i> Recibos de caja</h5>',
    text: `<p>En este módulo encontrarás la información de los recibos de caja de pagos de facturas de venta que son guardados en Zeus por el área de cartera </p>`
  },
  {
    attachTo: {
      element: '#rango',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'rango',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class=""></i> Seleccionar Rango</h5>',
    text: `<p>En este campo puedes seleccionar un rango de fechas para generar los recibos de caja guardados en el lapso de tiempo consultado. </p>`
  },
  {
    attachTo: {
      element: '#consultar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'consultar',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class=""></i> Consultar Rango</h5>',
    text: `<p>Luego de seleccionar el rango de fechas, presiona este botón para realizar la consulta de los recibos de caja
    grabados por cartera en ese periodo de tiempo.</p>`
  },
  {
    attachTo: {
      element: '#filtros',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'filtros',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class=""></i> Filtrar columnas</h5>',
    text: `<p>Luego de consultar el rango de fechas, desde estos campos podrás filtrar la información que se encuentre en la tabla por:
    <br>- Periodo.
    <br>- Consecutivo.
    <br>- Fecha Transacción.
    <br>- Cliente.
    <br>- Descripcion.
    <br>- Valor.
    <br>- Cuenta.
    <br>- Vendedor.
    <br>- Factura.
    <br>- Fecha vencimiento.
    <br>- Fecha registro.
    <br>- Usuario.
    </p>`
  },
  {
    attachTo: {
      element: '#campos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'campos',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class=""></i> Información consultada</h5>',
    text: `<p>Luego de realizar la consulta, encontrarás la información de los recibos de caja que han sido ingresados a zeus por parte de cartera en el rango de fechas seleccionado.
    </p>`
  },
  {
    attachTo: {
      element: '#total',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'total',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class=""></i>Valor total cancelado</h5>',
    text: `<p>Aquí se visualizará el valor total cancelado de cada factura en el rango de fechas seleccionado.</p>`
  },
  {
    attachTo: {
      element: '#exportar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'exportar',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class=""></i> Exportar a excel</h5>',
    text: `<p>Pulsando sobre este botón se exportará a excel la información de los recibos de caja que se encuentre cargada en la tabla. </p>`
  },
  {
    attachTo: {
      element: '#exportar2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.back,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: '',
    id: 'exportar2',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class=""></i> Exportar a excel</h5>',
    text: `<p>Pulsando sobre este botón se exportará a excel la información de los recibos de caja que se encuentre cargada en la tabla. </p>`
  },
]

/******************************************************************* TICKETS **************************************************************************/
export const stepsCreacionTickets : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#none',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'none',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Tickets!</h4>',
    text: `<p>¡Si quieremos informar sobre una inconsistencia en el sistema o proponer una mejora podemos hacerlo mediante los tickets. Si creamos un ticket los encargados de administrar el programa lo revisarán y nos darán una solución!</p>`
  },
  {
    attachTo: {
      element: '#Ticket',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'Ticket',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Código del Ticket!</h4>',
    text: `<p>¡Este es el código del ticket que estamos creando!</p>`
  },
  {
    attachTo: {
      element: '#descripcion',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'descripcion',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Descripción del Ticket!</h4>',
    text: `<p>¡Debemos agregar una descripción al ticket que estamos creando!</p>`
  },
  {
    attachTo: {
      element: '#imagen',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'imagen',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Imagen(es)!</h4>',
    text: `<p>¡Tenemos la opción de agregar imagenes al ticket que estamos generando para ello elegimos las imagenes!</p>`
  },
  {
    attachTo: {
      element: '#enviarTicket',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'enviarTicket',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Crear Ticket!</h4>',
    text: `<p>¡Luego de haber llenado los campos procedemos a presionar este botón y se creará el ticket!</p>`
  },
  {
    attachTo: {
      element: '#limpiarTodo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'limpiarTodo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Limpiar Todos!</h4>',
    text: `<p>¡Limpiará todos los campos!</p>`
  },
];

export const stepsGetionTicktes : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#none',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'none',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Tickets!</h4>',
    text: `<p>¡En la gestión de tickets podemos ver los tickets que tenemos por revisar y los tickets a los que les hemos iniciado un proceso. Tambien podemos cambiar el estado de los tickets!</p>`
  },
  {
    attachTo: {
      element: '#cantTickets',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'cantTickets',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Cantidad de Tickets!</h4>',
    text: `<p>¡Veremos la cantidad de tickets que hemos resuelto en el mes, la cantidad de tickets abiertos y la cantidad de tickets en revisión!</p>`
  },
  {
    attachTo: {
      element: '#tablaTickets',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'tablaTickets',
    title: '<h4 style="margin: auto; color: var(--rojo)">Tabla de Tickets!</h4>',
    text: `<p>¡En esta tabla aparecerán los tickets que están en revisión y los que están abiertos, los que están en revisión tendrán un color amarillo de fondo y lo que estan abiertos aparecerán en blanco!</p><br><p>¡Presionando click sobre el circulo que se encuentra en la prima columna seleccionaremos el ticket para verlo detalladamente en el cuadro acontinuación!</p>`
  },
  {
    attachTo: {
      element: '#infoTicket',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'infoTicket',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Información del Ticket!</h4>',
    text: `<p>¡Una vez hayamos seleccionado el ticket en este cuadro nos saldrá la descripción completa y si tiene imagenes tambien las visualizaremos aquí!</p>`
  },
  {
    attachTo: {
      element: '#botones',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'botones',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Botones!</h4>',
    text: `<p>Para cambiar el estado de un ticket tenemos estos 2 botones, acontinuación los explicaremos:</p>`
    + `<ul>
        <li><b>En Revisión:</b> Con este botón cambiamos el estado del ticket a 'En Revisión', el cual nos dice que le ticket ya fue visto y se está solucionando el problema planteado en él</li>
        <li><b>Resuelto:</b> Si ya hemos culminado con la revisión del ticket y lo hemos solucionado, presionamos este botón y nos saldrá un modal en el que podremos (si quieremos) escribir una descripción de como solucionamos el problema</li>
      </ul>`
  },
];

/********************************************************************* USUARIOS **********************************************************************/
export const stepsUsuarios : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#usuarios',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'usuarios',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-users font-size-16"></i> Gestionar usuarios</h5>',
    text: `Este módulo será el encargado de la gestión de usuarios de nuestro sistema de información. <br><br><b>Aquí podrás ver, crear, editar e inactivar los usuarios que desees!</b>`
  },
  {
    attachTo: {
      element: '#nuevo-rol',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'nuevo-rol',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-plus-circle font-size-16"></i> Registrar nuevo rol</h5>',
    text: `Haciendo clic sobre este botón se cargará un modal para <b>registrar nuevos roles para los usuarios en el nuevo sistema de la empresa.</b><br><br>
    Al crear un rol desde este modal, también se <b>registrará un nuevo tipo de usuario con las mismas caracteristicas del rol creado.</b>`
  },
  {
    attachTo: {
      element: '#nueva-area',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'nueva-area',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-plus-circle font-size-16"></i> Registrar nueva área</h5>',
    text: `Haciendo clic sobre este botón se cargará un modal para <b>registrar una nueva área de la empresa</b>`
  },
  {
    attachTo: {
      element: '#nuevo-usuario',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'nuevo-usuario',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-plus-circle font-size-16"></i> Registrar nuevo usuario</h5>',
    text: `Al hacer clic sobre este botón, <b>se cargará un modal para crear un nuevo usuario en el sistema</b>, para ello debes diligenciar los siguientes campos: <br><br>
    - <b>Id Usuario</b><br>
    - <b>Nombre</b><br>
    - <b>Tipo</b><br>
    - <b>Área</b><br>
    - <b>Rol</b><br>
    - <b>Estado</b><br>
    - <b>Contraseña</b>
    `
  },
  {
    attachTo: {
      element: '#eliminar-usuario',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'eliminar-usuario',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-user-minus font-size-16"></i> Inactivar usuario</h5>',
    text: `Este botón solo se habilitará cuando selecciones un usuario de la tabla.<br><br>
    Si haces clic sobre él, luego de seleccionar un usuario, <b>este quedará con un estado inactivo y por ende, no podrá ingresar al sistema.</b>`
  },
  {
    attachTo: {
      element: '#exportar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'exportar',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-file-excel font-size-16"></i> Exportar datos</h5>',
    text: `Haciendo clic sobre este botón <b>se exportará en formato excel el listado de todos los usuarios del sistema.</b>`
  },
  {
    attachTo: {
      element: '#buscar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'buscar',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-search font-size-16"></i> Buscar usuarios</h5>',
    text: `Aquí puedes buscar el usuario que desees, <b>por Id, nombre o área.</b>`
  },
  {
    attachTo: {
      element: '#tabla',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'tabla',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-table font-size-16"></i> Tabla de usuarios</h5>',
    text: `En esta tabla <b>se cargarán todos los usuarios del sistema</b>, con sus respectivas areas, roles, tipos y estados.`
  },
  {
    attachTo: {
      element: '#check',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'check',
    id: 'tabla',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-check-square font-size-16"></i> Elegir usuarios</h5>',
    text: `Haciendo click sobre estos checkbox y luego sobre el botón eliminar usuarios <b>podrás inactivar usuarios masivamente.<B>`
  },
  {
    attachTo: {
      element: '#editar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'editar',
    id: 'tabla',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-user-edit font-size-16"></i> Editar usuarios</h5>',
    text: `Pulsando sobre este botón, <b>se cargará un modal para para editar la información del usuario seleccionado en la tabla.</b>`
  },
  {
    attachTo: {
      element: '#inactivar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'inactivar',
    id: 'tabla',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-user-minus font-size-16"></i> Inactivar usuarios</h5>',
    text: `Al hacer click sobre este botón, <b>podrás inactivar el usuario seleccionado en la tabla.</b>`
  },
  {
    attachTo: {
      element: '#roles',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'roles',
    id: 'tabla',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-users font-size-16"></i> Roles Usuarios</h5>',
    text: `¡En esta sección podrás ver la lista de roles que se manejan!`
  },
  {
    attachTo: {
      element: '#editarRol',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.cancel
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'editarRol',
    id: 'tabla',
    title: '<h5 style="margin: auto; color: var(--rojo)"><i class="pi pi-pencil font-size-16"></i> Editar Roles</h5>',
    text: `¡Podemos editar los roles de los usuarios, cambiando el nombre, descripción y las vistas a las cuales el rol puede acceder!`
  },
];

/******************************************************************** DASHBOARD **********************************************************************/
export const stepsDashboardOT : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#none',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'none',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Dashboard Ordenes de Trabajo!</h4>',
    text: `<p>¡Veremos información general sobre los movimientos de las ordenes de trabajo en el mes actual!</p>`
  },
  {
    attachTo: {
      element: '#cantProcesos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'cantProcesos',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Cantidad Producida Por Procesos!</h4>',
    text: `<p>¡En esta sección se puede apreciar <b>la cantidad producida en Kilogramos/Unidades</b> en cada <b>proceso de producción</b> en la empresa durante el mes en curso!</p>`
  },
  {
    attachTo: {
      element: '#estadoOrdenes',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'estadoOrdenes',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Estados de Ordenes de Trabajo!</h4>',
    text: `<p>¡Aquí puedes ver la <b>cantidad de ordenes de trabajo creadas durante el mes</b> y su estado actual<br><br>
    Adicionalmente haciendo clic sobre <img src="assets/Iconos_Menu/lupa.PNG" alt="" style="width: 30px; height: 30px">, puedes verificar <b>cuanto se ha pesado</b> en cada proceso y el <b>reporte de costos de cada OT.</b>!</p>`
  },
  {
    attachTo: {
      element: '#ordenesCreadas',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'ordenesCreadas',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Ordenes de Trabajo Creadas!</h4>',
    text: `<p>¡Listado con la <b>cantidad de veces que se han usado los materiales de producción</b> para la creación de ordenes de trabajo, su costo, y la cantidad en kilos.!</p>`
  },
  {
    attachTo: {
      element: '#clientesCompras',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'clientesCompras',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Compras de Clientes este mes!</h4>',
    text: `<p>¡En este listado encontrarás <b>el ranking de clientes a quienes más se les ha facturado</b> durante el mes en curso, <b>ordenado por la cantidad de veces</b> que compró.<br><br>
    Haciendo clic sobre el icono <i class="pi pi-sort-alt"></i> <b> en cada campo de la tabla puedes ordenar la información</b> por el dato que desees.!</p>`
  },
  {
    attachTo: {
      element: '#productosCompras',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'productosCompras',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Compras de Productos este mes!</h4>',
    text: `<p>¡A continuación podrás visualizar el listado de <b>productos más vendidos en el mes actual,</b> ordenado por la cantidad de veces que se vendió.<br><br>
    <b>Nota:</b> Haz clic sobre el icono <i class="pi pi-sort-alt"></i> <b> en cada campo de la tabla para ordenar la información</b> por el dato que desees.!</p>`
  },
  {
    attachTo: {
      element: '#vendedoresCompras',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'vendedoresCompras',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Ventas de vendedores este mes!</h4>',
    text: `<p>¡Aquí puedes ver el <b>ranking de los vendedores con mayor rentabilidad en facturación en este mes,</b> ordenado por la cantidad de veces que facturó.<br><br>
    Además puedes hacer clic sobre el icono <i class="pi pi-sort-alt"></i> <b> en cada campo de la tabla para ordenar la información</b> por el dato que desees!</p>`
  },
  {
    attachTo: {
      element: '#RankingClientes',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'RankingClientes',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Raking de Clientes!</h4>',
    text: `<p>¡En esta sección podrás ver el listado de clientes con <b>más ordenes de trabajo creadas durante el mes actual</b> y el costo total de las mismas<br><br>
    Además puedes <b>graficar la tabla</b> a través del botón <img src="assets/Iconos_Menu/graficar.PNG" alt="" style="width: 30px; height: 30px">!</p>`
  },
  {
    attachTo: {
      element: '#RankingProductos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'RankingClientes',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Raking de Productos!</h4>',
    text: `<p>¡ En este apartado <b>podrá visualizar el listado de productos</b> a los cuales se les ha realizado más<b> ordenes de trabajo</b> durante el mes.!</p>`
  },
  {
    attachTo: {
      element: '#RankingVendedores',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'RankingClientes',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Raking de Vendedores!</h4>',
    text: `<p>¡En este listado se puede apreciar <b>la cantidad de ordenes de trabajo realizadas a cada asesor comercial durante el mes actual</b>, el costo total y la cantidad en kilos.<br><br>
    Además puedes <b>graficar la tabla</b> a través del botón <img src="assets/Iconos_Menu/graficar.PNG" alt="" style="width: 30px; height: 30px">!</p>`
  },
];

export const stepsDashboardFacturacion : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#none',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'none',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Dashboard Facturación!</h4>',
    text: `<p>¡Es este dashboard estaremos viendo información sobre la facturación que va del día, del mes, etc!</p>`
  },
  {
    attachTo: {
      element: '#facturacion',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'facturacion',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Facturación!</h4>',
    text: `<p>¡Aquí estaremos viendo diferentes cards con datos a cerca de la facturación del mes y del día!</p>`
  },
  {
    attachTo: {
      element: '#grafica',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'grafica',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Grafica de Facturación!</h4>',
    text: `<p>¡En esta grafica podemos apreciar la curva que ha tenido la facturación mes a mes en el año actual!</p>`
  },
  {
    attachTo: {
      element: '#cambiarAnio',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'cambiarAnio',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Cambiar Año!</h4>',
    text: `<p>¡Si deseamos ver un año anterior en la grafica podemos cambiarlos en la lista desplegable que tenemos aquí, al cambiar el año automaticamente se cambiará la información de la grafica!</p>`
  },
];

export const stepsDashboardMateriaPrima : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#none',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'none',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Dashboard Materia Prima!</h4>',
    text: `<p>¡En este dashboard podemos ver información sobre la materia prima como su inventario, la que más se asigna, etc!</p>`
  },
  {
    attachTo: {
      element: '#materiaPrimaUsada',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'materiaPrimaUsada',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Materias Primas más usadas!</h4>',
    text: `<p>¡En esta sección se puede apreciar el <b >listado de materias primas más usadas / asignadas durante el mes actual</b> ordenado por la cantidad en kilogramos!</p>`
  },
  {
    attachTo: {
      element: '#asignadaExtruida',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'asignadaExtruida',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Materia Prima Asignada y Extruida!</h4>',
    text: `<p>¡En este apartado podrás visualizar una grafica comparativa entre <b>la cantidad en kilos de materia prima que se ha asignado y la cantidad que ha sido extruida.</b><br><br>
    <b>Nota:</b> Colocando el puntero del mouse <b>sobre la grafica</b> podrás ver la cantidad asignada / extruida en kilos.!</p>`
  },
  {
    attachTo: {
      element: '#inventario',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'inventario',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Inventario de Materia Prima!</h4>',
    text: `<p>¡Aquí puedes ver de forma rápida <b  >el estado, la cantidad con la que inició el día y el stock actual</b> de cada polietileno, tinta y BOPP. <br><br>
    Los estados están distribuidos así: <br><br>
      <b>Si es polietileno:</b><br>
      <span class="badge bg-danger1">Sin Stock:</span> Cantidad en 0. <br>
      <span class="badge bg-secondary1">Bajo:</span> Cantidades entre 1 y 1000.<br>
      <span class="badge bg-warning1">Medio:</span> Cantidades entre 1000 y 3000.<br>
      <span class="badge bg-success1">Alto:</span> Cantidades mayores a 3000.<br><br>
      <b>Si es Tinta y/o BOPP:</b><br>
      <span class="badge bg-danger1">Sin Stock:</span> Cantidad en 0. <br>
      <span class="badge bg-secondary1">Bajo:</span> Cantidades entre 1 y 100.<br>
      <span class="badge bg-warning1">Medio:</span> Cantidades entre 100 y 200<br>
      <span class="badge bg-success1">Alto:</span> Cantidades mayores a 200.<br><br>
      Nota: Sujeto a cambios de gerencia.!</p>`
  },
  {
    attachTo: {
      element: '#asigHoy',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'asigHoy',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Materia Prima Asignada Hoy!</h4>',
    text: `<p>¡En esta card se puede visualizar la <b >lista ordenada por kilogramos</b> de las materias primas asignadas el día de hoy.!</p>`
  },
  {
    attachTo: {
      element: '#tintasCreadas',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'tintasCreadas',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Tintas Creadas en el Mes!</h4>',
    text: `<p>¡En esta sección podrás ver un <b>listado ordenado por kilogramos de las tintas creadas en este mes.</b>!</p>`
  },
  {
    attachTo: {
      element: '#rollos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'rollos',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Biorientados!</h4>',
    text: `<p>¡Este apartado muestra la cantidad de rollos de <b>BOPP, BOPA y poliester disponibles.</b><br><br>
    Además se muestra el total de <b>rollos ingresados y utilizados</b> en el mes en curso.!</p>`
  },
  {
    attachTo: {
      element: '#mpCreacionTintas',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'mpCreacionTintas',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Mat. Prima - Creación Tintas!</h4>',
    text: `<p>¡Aquí podrás ver el <b>ranking de materias primas que más se han utilizado en el mes en curso</b> para crear tintas.!</p>`
  },
];

export const stepsDashboardPedidos : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#none',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'none',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Dashboard Pedidos!</h4>',
    text: `<p>¡Podemos ver información sobre los pedidos que hay en el sistemas!</p>`
  },
  {
    attachTo: {
      element: '#cantPedidos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'cantPedidos',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Cantidad de Pedidos!</h4>',
    text: `<p>¡Este apartado indica la <b>cantidad total de pedidos y el valor estimado</b> de los mismos.<br><br>
    <b>Al colocar el puntero del mouse</b> sobre cada color de la grafica se muestra la cantidad de pedidos:<br>
    <i class="pi pi-circle-fill rosado" ></i> Parcialmentes satisfechos<br>
    <i class="pi pi-circle-fill azul" ></i> Pendientes!</p>`
  },
  {
    attachTo: {
      element: '#pedidosOT',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'pedidosOT',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Pedidos con OT!</h4>',
    text: `<p>¡En esta sección se muestran los pedidos a los cuales <b>ya se les creó una orden de trabajo.</b><br><br>
    Además en la tabla se puede verificar <b>en cual de los procesos se encuentra la OT</b> y la <b>cantidad producida en kilos o unidades.</b><br><br>
    <b>Nota:</b> Si el campo de la tabla <b>"proceso de la OT"</b> está en blanco en porque la orden de trabajo no se ha iniciado.!</p>`
  },
  {
    attachTo: {
      element: '#pedidosFacturables',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'pedidosFacturables',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Pedidos Facturables!</h4>',
    text: `<p>¡En este apartado se mostrarán los pedidos<b> que pueden ser facturados</b>. Pueden ser facturados porque en los productos pedidos tienen en existencias una cantidad mayor o igual a la pedida!</p>`
  },
  {
    attachTo: {
      element: '#pedidosClientes',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'pedidosClientes',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Pedidos de Clientes!</h4>',
    text: `<p>¡En este apartado se mostrarán los clientes con la<b> mayor cantidad de items pedidos pendientes actualmente y su valor en pesos.</b><br><br>
    También puedes ver esta información de manera detallada <b>haciendo clic sobre el botón </b> <img src="assets/Iconos_Menu/tabla.PNG" class="imagen" alt="">!`
  },
  {
    attachTo: {
      element: '#productosPedidos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'productosPedidos',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Productos Pedidos!</h4>',
    text: `<p>¡En esta gráfica podrás visualizar <b>la cantidad de pedidos con más items pendientes de una misma referencia</b> y su costo total.<br><br>
    <b>Haciendo clic sobre el botón </b> <img src="assets/Iconos_Menu/tabla.PNG" class="imagen" alt=""> puedes ver los datos en una tabla.!`
  },
  {
    attachTo: {
      element: '#vendedoresPedidos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'vendedoresPedidos',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Pedidos Vendedores!</h4>',
    text: `<p>¡Esta sección muestra los <b>vendedores con más pedidos pendientes vigentes</b> y el valor total. <br><br>
    Si haces clic sobre el botón <img src="assets/Iconos_Menu/tabla.PNG" class="imagen" alt=""> puedes ver la información detallada en una tabla.!`
  },
];

export const stepsDashboardVentasVendedor : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#none',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'none',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Dashboard Facturación Vendedores!</h4>',
    text: `<p>¡Aquí podemos ver información de la facturación de los vendedores mes a mes en el año que elijamos, podemos realizar comparativas agregando varios años a la grafica!</p>`
  },
  {
    attachTo: {
      element: '#graficaVentas',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'graficaVentas',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Cantidad de Pedidos!</h4>',
    text: `<p>¡En esta sección podrás ver en la gráfica de manera detallada <b>los valores facturados por mes de cada vendedor en el/los años que elijas.</b><br><br>
    Solo debes buscar el año y el asesor comercial que desees en las listas desplegables y <b>hacer clic sobre el botón</b> <img src="assets/Iconos_Menu/graficar.PNG" class="imagen"><br><br>
    Además <b>puedes realizar comparativas eligiendo vendedores y años distintos</b>, para ver dinámicamente la rentabilidad de cada asesor.<br><br>
    <b>Nota:</b> Para limpiar la gráfica haz clic en el botón <img src="assets/Iconos_Menu/limpiar.PNG" class="imagen">!</p>`
  },
];

export const stepsDashboardRecaudos : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#none',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'none',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Dashboard Recaudos!</h4>',
    text: `<p>¡Es este dashboard estaremos viendo información sobre las facturas que la empresa puede cobrar!</p>`
  },
  {
    attachTo: {
      element: '#totalCartera',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'totalCartera',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Total Cartera!</h4>',
    text: `<p>¡Aquí estaremos viendo el costo total de lo que le deben los clientes a la empresa!</p>`
  },
  {
    attachTo: {
      element: '#facturas',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'facturas',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Facturas!</h4>',
    text: `<p>¡Aquí estaremos viendo cada una de las facturas que la empres puede cobrar!</p>`
  },
  {
    attachTo: {
      element: '#carteraVendedores',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'carteraVendedores',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Cartera Vendedores!</h4>',
    text: `<p>¡En esta tabla saldrá la cartera que tiene cada uno de los vendedores, es decir, la sumatoria total de lo que deben los clientes de cada vendedor!</p>`
  },
  {
    attachTo: {
      element: '#carteraClientes',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'carteraClientes',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Cartera Clientes!</h4>',
    text: `<p>¡En esta tabla saldrá la cartera que tiene cada uno de los clientes!</p>`
  },
];

export const stepsDashboardCuentasPagar : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#none',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'none',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Dashboard Cuentas Por Pagar!</h4>',
    text: `<p>¡Es este dashboard estaremos viendo información sobre las facturas que la empresa debe pagar!</p>`
  },
  {
    attachTo: {
      element: '#totalCartera',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'totalCartera',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Estado Proveedores!</h4>',
    text: `<p>¡Aquí estaremos viendo el costo total de lo que le deben los clientes a la empresa!</p>`
  },
  {
    attachTo: {
      element: '#datosProveedores',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'datosProveedores',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Facturas!</h4>',
    text: `<p>¡Aquí estaremos viendo cada uno de los proveedores a los que se les debe dinero!</p>
    <br>
    ¡Estos aparecerán agrupados y detro de ellos podemos ver las facturas que tienen!`
  },
  {
    attachTo: {
      element: '#crearPdf',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'crearPdf',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Crear PDF!</h4>',
    text: `<p>¡Podemos crear un PDF con la información que vemos aquí, este PDF será detallado agrupando por proveedores las facturas!</p>`
  },
  {
    attachTo: {
      element: '#desplegar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'desplegar',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Detalles!</h4>',
    text: `<p>¡Si queremos ver las facturas del proveedore presionamos este botón y se desplegarán o abrirá una fila en la que se verá una tabla con las facturas!</p>`
  },
  {
    attachTo: {
      element: '#facturasDetalladas',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'facturasDetalladas',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Facturas Detalladas!</h4>',
    text: `<p>¡En esa tabla aparecerán las facturas del proveedor!</p>`
  },
];

export const stepsDashboardGerencia : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#none',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'none',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Dashboard Gerencia!</h4>',
    text: `<p>¡En este dashboard estaremos viendo información general sobre los costos de la empresa!</p>`
  },
  {
    attachTo: {
      element: '#cambiarAnio',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'cambiarAnio',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Elegir Años!</h4>',
    text: `<p>¡Si queremos cambiar los años que estamos viendo podemos hacerlo desde este recuadro!</p>`
  },
  {
    attachTo: {
      element: '#seleccionarAnio',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'seleccionarAnio',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Seleccionar Año!</h4>',
    text: `<p>¡Podemos seleccionar el año que queremos ver desde este recuadro!</p>`
  },
  {
    attachTo: {
      element: '#botonesGraficado',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'botonesGraficado',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Graficar y/o Limpiar!</h4>',
    text: `<p>¡Luego de haber seleccionado el año podemos graficar la información del mismo presionando del botón rojo con el icono '<i class="pi pi-chart-bar"></i>'!
    <br><br>
    ¡Si lo que deseamos es limpiar las graficas podemos presionar el botón amarillo con el icono '<i class="pi pi-eraser"></i>'!</p>`
  },
  {
    attachTo: {
      element: '#facturacion',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'facturacion',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Facturación!</h4>',
    text: `<p>¡Podemos ver la facturación graficada en este recuadro, a demás podemos ver el total de lo que se facturó en cada uno de los años selecionados!</p>`
  },
  {
    attachTo: {
      element: '#cuentasCobrar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'cuentasCobrar',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Cuentas por Cobrar!</h4>',
    text: `<p>¡Se puede ver la información de las cuentas por cobrar en este recuadro!</p>`
  },
  {
    attachTo: {
      element: '#cuentasPagar',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'cuentasPagar',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Cuentas por Pagar!</h4>',
    text: `<p>¡Se puede ver la información de las cuentas por pagar en este recuadro!</p>`
  },
  {
    attachTo: {
      element: '#compras',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'compras',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Compras!</h4>',
    text: `<p>¡Se puede ver la información de las compras realizadas por las empresas Plasticaribe, Invergoal e Inversuez!</p>`
  },
  {
    attachTo: {
      element: '#matPrima_Producto',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.back,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'matPrima_Producto',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Materia Prima Y Productos!</h4>',
    text: `<p>¡Se puede ver la información del costo en cada uno de los meses del inventario de materia prima y productos en este recuadro!</p>`
  },
];

export const stepsDashboardCostos : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#none',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'none',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Dashboard Costos!</h4>',
    text: `<p>¡En este dashboard estaremos viendo información general sobre los <b>costos de la empresa</b>!</p>`
  },
  {
    attachTo: {
      element: '#cambiarAnio',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'cambiarAnio',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Elegir Años!</h4>',
    text: `<p>Incialmente se cargarán en las graficas los costos del año actual pero <b>tenemos la opción de graficar más años desde este apartado.</b>
    <br><br>
    Tambien <b>podemos exportar a un archivo de excel</b> los datos que se encuentran graficados o los datos de un rango de fechas que hayamos escogido.
    </p>`
  },
  {
    attachTo: {
      element: '#seleccionarAnio',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'seleccionarAnio',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Seleccionar Año!</h4>',
    text: `<p>En esta casilla tenemos la opción de <b>escoger un año</b> desde el 2019 hasta el año actual. <b>Este año escogido será el que se graficará.</b></p>`
  },
  {
    attachTo: {
      element: '#botonesGraficado',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'botonesGraficado',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Graficar y/o Limpiar!</h4>',
    text: `<p>¡Luego de haber seleccionado el año <b>podemos graficar la información del mismo presionando del botón rojo con el icono '<i class="pi pi-chart-bar"></i>'</b>, se tardará 3 segundos en cargar y posteriormente aparecerá el año graficado!
    <br><br>
    ¡<b>Podemos limpiar la información graficada</b> presionando el botón gris con el icono '<i class="pi pi-eraser"></i>'</b>!</p>`
  },
  {
    attachTo: {
      element: '#seleccionarFechas',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'seleccionarFechas',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Seleccionar Fechas!</h4>',
    text: `<p>Otra de las opciones que tenemos es <b>seleccionar un rango de fechas</b>. Se buscará la información en el rango escogido y posteriormente <b>esa información será la que se vea en el archivo de excel</b>.</p>`
  },
  {
    attachTo: {
      element: '#botonExcel',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'botonExcel',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Exportar a Excel!</h4>',
    text: `<p><b>Si queremos exportar a un archivo de excel podemos presionar el botón verde con el icono '<i class="pi pi-file-excel"></i>'</b> e inmediatamente saldrá un mensaje de confirmación y iniciará la descarga del archivo.
    <br>
    <b>Nota:</b> Se exportarán los datos que se hayan seleccionado en el rango de fechas escogido, de lo contrario se exportará la información de los años que hayan sido graficados!</p>`
  },
  {
    attachTo: {
      element: '#costoFabricacion',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'costoFabricacion',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Costos de Fabricación!</h4>',
    text: `<p>Podemos ver los <b>costos de fabricación</b> en cada uno de los meses de los años que se han graficado, <b>podemos hacer comparativas entre años o meses</b>.</p>`
  },
  {
    attachTo: {
      element: '#gastosAdmon',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'gastosAdmon',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Gastos de Administración!</h4>',
    text: `<p>Podemos ver los <b>costos de administración</b> en cada uno de los meses de los años que se han graficado, de igual menera podemos hacer comparativas entre años o meses</p>`
  },
  {
    attachTo: {
      element: '#gastosVentas',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'gastosVentas',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Gastos de Ventas!</h4>',
    text: `<p>En esta grafica estarán los <b>costos de ventas</b> en cada uno de los meses de los años que se han graficado, de igual menera podemos hacer comparativas entre años o meses.</p>`
  },
  {
    attachTo: {
      element: '#gastosNoOperacionales',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'gastosNoOperacionales',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Gastos No Operacionales!</h4>',
    text: `<p>Podemos ver los <b>costos no operacionales</b> en cada uno de los meses de los años que se han graficado, de igual menera podemos hacer comparativas entre años o meses.</p>`
  },
  {
    attachTo: {
      element: '#costosAnios',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'costosAnios',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Costos de los Años!</h4>',
    text: `<p>En cada grafica se mostrarán los <b>costos de los años</b> que se han graficado, en la parte inferior de cada grafica estarán apareciendo los costos.</p>`
  },
  {
    attachTo: {
      element: '#tablaDetallada',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.back,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'tablaDetallada',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Cuentas Detalladas!</h4>',
    text: `<p>¡Podemos <b>ver las cuentas detalladas presionando este botón</b>, adicionalmente podemos <b>ver los movimientos de cada cuenta en cada mes seleccionando</b> en esta tabla alguna cuenta!</p>`
  },
];

export const stepsDashboardCompras : Step.StepOptions[] = [
  {
    attachTo: {
      element: '#none',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'none',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Dashboard Compras!</h4>',
    text: `<p>¡En este Dashboard podremos ver los datos de las <b>compras de la empresa</b>, estos datos <b>saldrán agrupados por proveedor y periodo</b>!
    <br>
    Los datos estarán apareciendo agrupados por año, mes y proveedor.
    <br><br>
    De igual manera estará apareciendo un gráfico de barras donde se mostrarán los datos de las compras de cada mes del año.
    </p>`
  },
  {
    attachTo: {
      element: '#cambiarAnio',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'cambiarAnio',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Elegir Años!</h4>',
    text: `<p>Desde aquí podemos <b>añadir años</b> a la tabla y al grafico, tambien podemos <b>eliminarlos</b> de la misma</p>`
  },
  {
    attachTo: {
      element: '#seleccionarAnio',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'seleccionarAnio',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Seleccionar Año!</h4>',
    text: `<p>En esta casilla tenemos la opción de <b>escoger un año</b> desde el 2019 hasta el año actual. <b>Este año escogido será el que se graficará.</b></p>`
  },
  {
    attachTo: {
      element: '#botonesGraficado',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'botonesGraficado',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Graficar y/o Limpiar!</h4>',
    text: `<p>¡Luego de haber seleccionado el año <b>podemos graficar la información del mismo presionando del botón rojo con el icono '<i class="pi pi-chart-bar"></i>'</b>, posteriormente aparecerá el año graficado!
    <br><br>
    ¡<b>Podemos limpiar la información graficada</b> presionando el botón gris con el icono '<i class="pi pi-eraser"></i>'</b>!</p>`
  },
  {
    attachTo: {
      element: '#empresas',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'empresas',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Empresas!</h4>',
    text: `<p>¡Aquí podremos cambiar de empresa y ver los datos de las compras de la empresa escogida!</p>`
  },
  {
    attachTo: {
      element: '#totalCartera',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'totalCartera',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Estado Proveedores!</h4>',
    text: `<p>¡Aquí estaremos viendo el costo total de las compras de la empresa!</p>`
  },
  {
    attachTo: {
      element: '#datosProveedores',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'datosProveedores',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Facturas!</h4>',
    text: `<p>¡Aquí estaremos viendo cada uno de los proveedores a los que se les debe dinero!</p>
    ¡Estos aparecerán agrupados y detro de ellos podemos ver las facturas que tienen!`
  }, 
  {
    attachTo: {
      element: '#graficaCostos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'graficaCostos',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Grafica!</h4>',
    text: `<p>¡En esta grafica podremos ver los datos de las <b>compras de la empresa</b>, estos datos podremos verlos por cada uno de los meses!</p>`
  },
];

export const stepsDashboarsAreas : Step.StepOptions [] = [
  {
    attachTo: {
      element: '#none',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'none',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Dashboard Áreas!</h4>',
    text: `<p>¡En este dashboard <b>podemos ver los datos de las cantidades producidas por cada una de las áreas</b> de la empresa!</p>`
  },
  {
    attachTo: {
      element: '#cambiarAnio',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'cambiarAnio',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Cambiar año!</h4>',
    text: `<p>¡Si queremos cambiar o graficar un año diferente podemos hacerlo desde aquí!</p>`
  },
  {
    attachTo: {
      element: '#seleccionarAnio',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'seleccionarAnio',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Seleccionar año!</h4>',
    text: `<p>¡Si queremos cambiar el año <b>podemos desplegar esta lista y seleccionar el año que queramos</b>!</p>`
  },
  {
    attachTo: {
      element: '#botonesGraficado',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'botonesGraficado',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Botones de Graficado!</h4>',
    text: `<p>¡Luego de haber seleccionado un año <b>podemos presionar el botón rojo para ver los datos de la grafica</b>!</p>
    <p>¡Tambien <b>podemos limpiar todos los datos de la grafica</b> y volver a graficar desde aquí!</p>`
  },
  {
    attachTo: {
      element: '#extrusion',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'extrusion',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Extrusión!</h4>',
    text: `<p>¡En esta sección <b>podemos ver la producción de uno del área de extrusión</b> en cada uno de los meses, tambien podemos ver los compraciones entre años!</p>`
  },
  {
    attachTo: {
      element: '#impresion',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'impresion',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Impresión!</h4>',
    text: `<p>¡En esta sección <b>podemos ver la producción de uno del área de impresión</b> en cada uno de los meses, tambien podemos ver los compraciones entre años!</p>`
  },
  {
    attachTo: {
      element: '#rotograbado',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'rotograbado',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Rotograbado!</h4>',
    text: `<p>¡En esta sección <b>podemos ver la producción de uno del área de rotograbado</b> en cada uno de los meses, tambien podemos ver los compraciones entre años!</p>`
  },
  {
    attachTo: {
      element: '#doblado',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'doblado',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Doblado!</h4>',
    text: `<p>¡En esta sección <b>podemos ver la producción de uno del área de doblado</b> en cada uno de los meses, tambien podemos ver los compraciones entre años!</p>`
  },
  {
    attachTo: {
      element: '#laminado',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'laminado',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Laminado!</h4>',
    text: `<p>¡En esta sección <b>podemos ver la producción de uno del área de laminado</b> en cada uno de los meses, tambien podemos ver los compraciones entre años!</p>`
  },
  {
    attachTo: {
      element: '#corte',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'corte',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Corte!</h4>',
    text: `<p>¡En esta sección <b>podemos ver la producción de uno del área de corte</b> en cada uno de los meses, tambien podemos ver los compraciones entre años!</p>`
  },
  {
    attachTo: {
      element: '#empaque',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'empaque',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Empaque!</h4>',
    text: `<p>¡En esta sección <b>podemos ver la producción de uno del área de empaque</b> en cada uno de los meses, tambien podemos ver los compraciones entre años!</p>`
  },
  {
    attachTo: {
      element: '#sellado',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'sellado',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Sellado!</h4>',
    text: `<p>¡En esta sección <b>podemos ver la producción de uno del área de sellado</b> en cada uno de los meses, tambien podemos ver los compraciones entre años!</p>`
  },
  {
    attachTo: {
      element: '#wiketiado',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.cancel,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'wiketiado',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Wiketiado!</h4>',
    text: `<p>¡En esta sección <b>podemos ver la producción de uno del área de wiketiado</b> en cada uno de los meses, tambien podemos ver los compraciones entre años!</p>`
  },
];

/******************************************************************** CERTIFICADOS DE CALIDAD **********************************************************************/
export const CertificadoCalidad : Step.StepOptions [] = [
  {
    attachTo: {
      element: '#none',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'none',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Certificado de Calidad!</h4>',
    text: `<p>¡En este modulo podemos crear un certificado de calidad para una orden de trabajo!</p>`
  },
  {
    attachTo: {
      element: '#buscarOrdenTrabajo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'buscarOrdenTrabajo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Información de la OT!</h4>',
    text: `<p>Para poder llenar el certificado necesitamos saber la información de la OT que queremos certificar, para ello <b>podemos escribir el número identificativo de la orden de trabajo en el campo 'OT'</b>, luego podemos <b>presionar 'Enter' o presionar el botón rojo</b>.</p>
    <br>
    <p>Al hacer esto <b>se consultará la información de la OT y la información del último certificado que se le hizo al Itema de la OT</b>. Con base en eso se llenará la información <b>pero si al item no se le ha hecho un certificado</b> entonces se colocará la información de la OT y <b>se deberá editar de manera manual</b>.</p>`
  },
  {
    attachTo: {
      element: '#botones',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'botones',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Acciones!</h4>',
    text: `<p>¡Cons estos botones podemos realizar diferentes acciones con la información consultada, acontinuación se estarán describiendo y explicando cada uno de los botones!</p>`
  },
  {
    attachTo: {
      element: '#consultarOrden',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'consultarOrden',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Consultar OT!</h4>',
    text: `<p>¡Tenemos 2 formas de consultar la información de uan orden de trabajo, una de ellas es con el botón consultar. Para utilizar esta opción solo <b>debemos escribir el número de la orden de trabajo (en su respectivo campo) y presionar click sobre este botón!</b></p>`
  },
  {
    attachTo: {
      element: '#limpiarCampos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'limpiarCampos',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Limpiar Todo!</h4>',
    text: `<p>¡Con este botón podremos limpiar todo el formulario y las tablas de la página, es decir, lo podemos utilizar si queremos buscar otra OT o si queremos volver a crear un certificado!</p>`
  },
  {
    attachTo: {
      element: '#crearCertificado',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'crearCertificado',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Crear Certificado!</h4>',
    text: `<p>¡Una vez hayamos buscado, corregido y corroborado la información de la OT <b>podremos crear un certificado de calidad presionando este botón</b>, que <b>se encargará de enviar la información de la OT a la base de datos y posteriormente creará un PDF</b> con la información del certificado de calidad!</p>`
  },
  {
    attachTo: {
      element: '#parametrosCuantitativos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'parametrosCuantitativos',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Parametros Cuantitativos!</h4>',
    text: `<p>¡<b>Cuando buscamos la información de la OT, se nos cargarán los parametros cuantitativos</b> de la OT, <b>si deseamos cambiar la información de alguno de estos parametros</b>, podemos hacerlo <b>presionando click sobre el dato que queremos cambiar y escribir o elegir la nueva información</b>!</p>`
  },
  {
    attachTo: {
      element: '#parametrosCualitativos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.cancel,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'parametrosCualitativos',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Parametros Cualitativos!</h4>',
    text: `<p>¡Al igual que los parametros cuantitativos, se nos cargarán los parametros cualitativos de la OT, <b>si deseamos cambiar la información de alguno de estos parametros</b>, podemos hacerlo de la misma manera!</p>`
  },
];

export const stepsMov_CertificadosCalidad : Step.StepOptions [] = [
  {
    attachTo: {
      element: '#none',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'none',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Certificado de Calidad!</h4>',
    text: `<p>¡En este modulo podemos <b>ver los certificados de calidad</b> que se han creado con anterioridad, podemos <b>ver la información general de cada uno</b> y si queremos ver toda la información, podemos <b>ver el archivo PDF de cada certificado de calidad</b>!</p>`
  },
  {
    attachTo: {
      element: '#filtros',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'filtros',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Filtros de Busqueda!</h4>',
    text: `<p>¡Podemos <b>buscar los certificados de calida por los diferentes filtros que aparecen aquí</b>, a continuación se explicarán cada uno de los filtros que podemos aplicar!</p>`
  },
  {
    attachTo: {
      element: '#consecutivo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'consecutivo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Consecutivo!</h4>',
    text: `<p>¡Desde aquí podemos colocar el <b>consecutivo</b> del certificado que queremos buscar y ver!</p>`
  },
  {
    attachTo: {
      element: '#fechaInicio',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'fechaInicio',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Fecha Inicial!</h4>',
    text: `<p>¡Si queremos buscar un certificado de calidad por un rango de fechas, podemos <b>colocar la fecha inicial</b> en este campo!</p>
    <p><b>Nota:</b> <b>Si no colocamos nada en este campo</b>, es decir, lo dejamos vacio, el <b>automaticamente calculará la fecha del mes anterior desde el día actual</b>. 
    <br>Ejemplo: Si la fecha actual es el 23 de abril, el sistema tomatá la fecha del 23 de marzo.</p>`
  },
  {
    attachTo: {
      element: '#fechaFinal',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'fechaFinal',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Fecha Final!</h4>',
    text: `<p>¡Si queremos buscar un certificado de calidad por un rango de fechas, podemos <b>colocar la fecha final</b> en este campo!</p>
    <p><b>Nota</b>: Si no llenamos el campo el sistema tomará la fecha actual para este mismo.</p>`
  },
  {
    attachTo: {
      element: '#ordenTrabajo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'ordenTrabajo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Orden de Trabajo!</h4>',
    text: `<p>¡Si quieremos ver los certificados de unas ordenes de trabajo específicas, podemos <b>colocar el número de la orden de trabajo</b> que queremos ver!</p>`
  },
  {
    attachTo: {
      element: '#cliente',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'cliente',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Cliente!</h4>',
    text: `<p>¡Tambien podemos buscar por un cliente, para ello debemos <b>escribir el nombre del cliente</b> y nos irán saliendo recomendaciones de clientes que tienen en su nombre los caracteres que hemos escrito, <b>seleccionamos el que queremos</b> y listo!</p>`
  },
  {
    attachTo: {
      element: '#referencia',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'referencia',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Referencia!</h4>',
    text: `<p>¡Al igual que con el cliente, podemos <b>buscar por una referencia</b>. Se pueden buscar de la misma manera que lo hacemos con el cliente!</p>`
  },
  {
    attachTo: {
      element: '#acciones',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'acciones',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Acciones!</h4>',
    text: `<p>Luego de haber llenado (o no) los filtros, podemos realizar algunas siguientes acciones:</p>
    <p><b>1) Consultar:</b> Si presionamos este botón el sistema empezará a buscar los certificados de calidad que cumplan con los filtros que hemos seleccionado. Para realizar la busqueda podemos presionar click sobre este botón o presionar 'Enter' sobre alguno de los filtros.</p>
    <p><b>2) Limpiar Campos:</b> Con este botón podemos limpiar los campos de filtros y volver a empezar a buscar.</p>`
  },
  {
    attachTo: {
      element: '#infoGeneral',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'infoGeneral',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Información General!</h4>',
    text: `<p>¡En esta tabla estarán apareciendo los certificados de calidad resultantes de la busqueda realizada!</p>`
  },
  {
    attachTo: {
      element: '#encabezadoTabla',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'encabezadoTabla',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Encabezado de la Tabla!</h4>',
    text: `<p>¡En este encabezado aparecerán los titulos de cada columna de la tabla y unos campos, en estos campos <b>podemos escribir y filtrar la información que está en la tabla</b>!</p>`
  },
  {
    attachTo: {
      element: '#registros',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'registros',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Registros de la Tabla!</h4>',
    text: `<p>¡En la tabla estará la <b>información general de los certificados de calidad</b> resultantes de la busqueda realizada!</p>`
  },
  {
    attachTo: {
      element: '#expandir',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'expandir',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Expandir Información!</h4>',
    text: `<p>¡Si expandimos la información de un certificado de calidad, podemos ver todos los detalles de este, detalles como los <b>parametros cuantitativos y cualitativos</b>!</p>`
  },
  {
    attachTo: {
      element: '#pdf',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.cancel,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'pdf',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Ver PDF!</h4>',
    text: `<p>¡Finalmente podemos <b>ver el PDF de un certificado de calidad</b> que queramos, solo debemos presionar el botón rojo al final de cada fila de la tabla!</p>`
  },
];

/********************************************************************** CONTROL DE CALIDAD *************************************************************************/
export const ControlCalidad : Step.StepOptions [] = [
  {
    attachTo: {
      element: '#none',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'none',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Control de Calidad!</h4>',
    text: `<p>¡Desde este módulo podemos <b>crear y ver los controles de calidad</b> de las diferentes áreas por las que pasa la una orden de trabajo!</p>`
  },
  {
    attachTo: {
      element: '#none',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'none',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Buscar Antiguos!</h4>',
    text: `<p>¡Aquí podemos <b>seleccionar un rango de fechas</b> para buscar otros controles de calidad que se hayan creado con anterioridad!</p>`
  },
  {
    attachTo: {
      element: '#none',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'none',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Agregar Registro!</h4>',
    text: `<p>¡Si quieremos agregar un nuevo registro de control de calidad, podemos hacerlo <b>presionando click sobre el botón de 'Nuevo registro'</b> para agregar una fila nueva en la tabla!</p>`
  },
  {
    attachTo: {
      element: '#none',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'none',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Editar Información!</h4>',
    text: `<p>Para editar la información de un registro de control de calidad, podemos hacerlo <b>presionando click sobre el botón con el icono '<i class="pi pi-pencil"></i>'</b>
    y escribir o elegir la nueva información en cada uno de los campos.</p>
    <br>
    <p>Luego de editar los cambios podemos <b>guardarlos presionando el botón con el icono '<i class="pi pi-check"></i>'</b>.</p>`
  },
  {
    attachTo: {
      element: '#none',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.cancel,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'none',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Filtros de Busqueda!</h4>',
    text: `<p>¡Con estos filtros podemos <b>buscar por algunos campos</b> de la información de un registro de control de calidad que están en la tabla!</p>`
  },
];

/*************************************************************************** KARDEX *******************************************************************************/
export const stepsKardex : Step.StepOptions [] = [
  {
    attachTo: {
      element: '#none',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'none',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Kardex de Materias Primas!</h4>',
    text: `<p>¡Desde este módulo podemos ver el <b>Kardex de un Material</b> que se utiliza para crear un Item (producto)!</p>`
  },
  {
    attachTo: {
      element: '#filtros',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'filtros',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Filtros de Busqueda!</h4>',
    text: `<p>¡Con estos <b>filtros podemos buscar</b> la información de los movimientos de un material!</p>`
  },
  {
    attachTo: {
      element: '#rangoFechas',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'rangoFechas',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Rango de Fechas!</h4>',
    text: `<p>¡Debemos elegir el <b>rango de fechas</b> de los movimientos que queremos ver!</p>`
  },
  {
    attachTo: {
      element: '#material',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'material',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Materia Prima!</h4>',
    text: `<p>¡Debemos <b>elegir la materia prima</b> de la cual queremos ver el Kardex!</p>`
  },
  {
    attachTo: {
      element: '#producto',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'producto',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Producto!</h4>',
    text: `<p>¡Tenemos que <b>colocar el código del producto</b> del cual queremos ver el Kardex!</p>`
  },
  {
    attachTo: {
      element: '#botones',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'botones',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Acciones!</h4>',
    text: `<p>¡Con estos botones podemos <b>generar un reporte de los movimientos</b> de un material!</p>
    <br>
    <p>1) <b>Consultar</b>: Una vez llenos los filtros podemos <b>consultar</b> los movimientos del material seleccionado.</p>
    <p>2) <b>Limpiar Todo</b>: Podemos limpiar todos al presionar este botón.</p>
    <p>3) <b>Exportar a Excel</b>: Con este botón podemos <b>exportar los datos</b> a un archivo de Excel.</p>`
  },
  {
    attachTo: {
      element: '#tablaCompras',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'tablaCompras',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Tabla de Compras!</h4>',
    text: `<p>¡En esta <b>tabla podemos ver las compras realizadas</b> del material seleccionado!</p>`
  },
  {
    attachTo: {
      element: '#verKardex',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'verKardex',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Ver Kardex!</h4>',
    text: `<p>¡Si queremos ver el <b>Kardex</b> en el material podemos hacer click aquí!</p>`
  },
  {
    attachTo: {
      element: '#tablaConsumos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.cancel,
    ],
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    id: 'tablaConsumos',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Tabla de Consumos!</h4>',
    text: `<p>¡En esta tabla <b>podemos ver los consumos realizados</b> del material seleccionado!</p>`
  },
];