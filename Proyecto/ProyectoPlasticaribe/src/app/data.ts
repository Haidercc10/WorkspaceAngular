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

export const stepAsignacionTintas: Step.StepOptions[] = [
  {
    attachTo: {
      element: '#intro',
      on: 'bottom-end'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next,
    ],
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'eliminarRollos',
    title: '<h4 style="margin: auto; color: var(--rojo)">Elimiar Rollos Seleccionados!</h4>',
    text: `<p>¡Luego de haber seleccionado los rollos que queremos ingresar presionamos <b>'Ingresar Rollos'</b> y se ingresarán los rollos a la badega de extrusión!</p>`
  },
  {
    attachTo: {
      element: '#limpiarTodo',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back
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
      element: '#sort',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
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
      element: '#exportarExcel2',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
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
    classes: 'card',
    id: 'formulario',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Filtros!</h4>',
    text: `<p>¡Llenando estos filtros podemos realizar una busqueda mas selectiva de la información de los movimientos que han habido en la bodega de extrusión, si no queremos colocar filtros se buscará automaticamente por el día de hoy!</p>`
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
      builtInButtons.back,
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'limpiarTodo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Limpiar Todo!</h4>',
    text: `<p>¡Para limpiar todo (filtros y tablas) presionamos el botón <b>'Limpiar Todo'</b> y listo!</p>`
  },
];

/** BOPP, BOPA Y POLIESTER */

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
    classes: 'card',
    id: 'formulario1',
    title: `<h5 class="tituloRojo" style="margin: auto;">Búsqueda por filtros</h5>`,
    text: `En este formulario puedes <b>filtrar tus busquedas</b> para ver los movimientos de cada materia prima.<br><br>
    Ten en cuenta que puedes realizar distintas combinaciones de filtros, pero <b>DEBES elegir un rango de fechas específico para que se puede cargar la información solicitada en la tabla.</b><br><br>
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

