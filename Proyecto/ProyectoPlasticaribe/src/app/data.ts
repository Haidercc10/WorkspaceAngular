import Step from 'shepherd.js/src/types/step';

export const builtInButtons = {
  cancel: {
    classes: 'p-button p-button-rounded p-button-danger pi pi-times mr-2',
    type: 'cancel',

  },
  next: {
    classes: 'p-button-rounded p-button-danger',
    text: 'Next',
    type: 'next'
  },
  back: {
    classes: 'p-button-rounded p-button-danger',
    text: 'Back',
    class: '.p-button-danger'
  }
};

export const defaultStepOptions: Step.StepOptions = {
  classes: '',
  scrollTo: true,
  cancelIcon: {
    enabled: true
  }
};

export const steps: Step.StepOptions[] = [
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
    title: 'Creación de Materias Primas! ',
    text: `<p>
            Aquí encontrarás 2 botones para realizar <br> la creación de tintas y materias primas!
          </p>`
  },
  {
    attachTo: {
      element: '.install-element',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'installation',
    title: 'Installation',
    text: 'Installation is simple, if you are using Ember-CLI, just install like any other addon.'
  },
  {
    attachTo: {
      element: '.usage-element',
      on: 'bottom'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'usage',
    title: 'Usage',
    text: 'To use the tour service, simply inject it into your application and use it like this example.'
  },
  {
    attachTo: {
      element: '.modal-element',
      on: 'top'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'modal',
    text: `
        <p>
          We implemented true modal functionality by disabling clicking of the rest of the page.
        </p>
        <p>
          If you would like to enable modal, simply do this.get('tour').set('modal', true).
        </p>`
  },
  {
    attachTo: {
      element: '.built-in-buttons-element',
      on: 'top'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.back,
      builtInButtons.next
    ],
    classes: 'custom-class-name-1 custom-class-name-2',
    id: 'buttons',
    text: `For the common button types ("next", "back", "cancel", etc.), we implemented Ember actions
          that perform these actions on your tour automatically. To use them, simply include
          in the buttons array in each step.`
  },
  {
    buttons: [
      builtInButtons.cancel,
      builtInButtons.back
    ],
    id: 'noAttachTo',
    title: 'Centered Modals',
    classes: 'custom-class-name-1 custom-class-name-2',
    text: 'If no attachTo is specified, the modal will appear in the center of the screen, as per the Shepherd docs.'
  }
];
