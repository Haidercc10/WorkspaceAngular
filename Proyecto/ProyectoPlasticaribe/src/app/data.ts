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
    title: '<h4 style="margin: auto; color: var(--rojo)">Ingresar Rollos Seleccionados!</h4>',
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
            <p>Nota: Es necesario llenar el campo <b>'Proceso'</b>, porque este indicará de donde se buscarán los rollos a ingresar</p>`
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
    text: `<p>¡En esta tabla apareceran los rollos que se coincidan con los filtros antes digitados. Si en la tabla salen filas de color rojo significa los rollos de esas filas ya han sido ingresados!</p>`
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
    title: '<h4 style="margin: auto; color: var(--rojo)">Ingresar Rollos Seleccionados!</h4>',
    text: `<p>¡Luego de haber seleccionado los rollos que queremos ingresar presionamos <b>'Ingresar Rollos'</b> y se ingresarán los rollos a la badega de despacho!</p>`
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      element: '#cantidadRollos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
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
      element: '#editarCantPaquetes',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      element: '#cantidadTotal',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      element: '#devolverRollos',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Filtros!</h4>',
    text: `<p>¡Con este botón se puede ordenar la información de la tabla por la columna en la que se implemente!</p>`
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
    text: `<p>¡Luego de haber llenado los filtros debemos presionar el botón <b>'Consultar Rollos'</b> para obtener la información de los rollos!</p><br>
            <p>Nota: Es necesario llenar el campo <b>'Proceso'</b>, porque este indicará de donde se buscarán los rollos a ingresar</p>`
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
    text: `<p>¡En esta tabla apareceran los rollos que coincidan con los filtros antes digitados!</p>`
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
    title: '<h4 style="margin: auto; color: var(--rojo)">Ingresar Rollos Seleccionados!</h4>',
    text: `<p>¡Luego de haber seleccionado los rollos que queremos ingresar presionamos <b>'Ingresar Producción'</b> y se hará un pre-ingresaro de los rollos a la badega de despacho!</p>`
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.next,
      builtInButtons.back,
    ],
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
      builtInButtons.cancel,
      builtInButtons.back,
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'limpiarTodo',
    title: '<h4 style="margin: auto; color: var(--rojo)">¡Limpiar Todo!</h4>',
    text: `<p>¡Para limpiar todo (filtros y tablas) presionamos el botón <b>'Limpiar Todo'</b> y listo!</p>`
  },
];
