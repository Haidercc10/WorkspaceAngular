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
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Filtros Eliminación de rollos!</h4>',
    text: `<p>¡Llenando estos filtros se pueden consultar los rollos que se quieren eliminar, es obligatorio llenar los campos de <b>'Procesos'</b> y <b>'Bodega'</b>!</p>`
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
    text: `<p>¡Luego de haber llenado los filtros podemos debemos presionar el botón <b>'Consultar'</b> para obtener la información de los rollos!</p>`
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
      element: '#eliminarRollos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'eliminarRollos',
    title: '<h4 style="margin: auto; color: var(--rojo)">Elimiar Rollos Seleccionados!</h4>',
    text: `<p>¡Luego de haber seleccionado los rollos que queremos eliminar presionamos <b>'Eliminar Rollos'</b> para posteriormente ver un mensaje de confirmación preguntando por la base de datos de la que queremos eliminar los rollos, elegimos y se habrán eliminado los rollos!</p>`
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
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'con-existencias',
    title: '<h5 class="tituloRojo" style="margin: auto;">Materiales con existencias</h5>',
    text: `Al hacer clic sobre este botón se cargarán en la tabla <b>solo las materias primas que tienen existencias mayores a cero.</b>`
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
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'diferencia',
    title: `<h5 class="tituloRojo" style="margin: auto;">Diferencia de materiales</h5>`,
    text: `En esta columna puedes ver <b>la diferencia entre el stock inicial, entradas y salidas de cada material en el día.</b>`
  },
  {
    attachTo: {
      element: '#exportar2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'exportar2',
    title: `<h5 class="tituloRojo" style="margin: auto;">Exportar Información</h5>`,
    text: `Desde este botón puedes <b>exportar a excel la información de la tabla, teniendo en cuenta si realizaste algún filtro</b>, sino, se descargará todo el inventario.`
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
    <br>El campo de observación es opcional!</p>`
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
