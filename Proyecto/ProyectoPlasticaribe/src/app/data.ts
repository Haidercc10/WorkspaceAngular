import Step from 'shepherd.js/src/types/step';

export const builtInButtons = {
  cancel: {
    secondary: true,
    text: 'Exit',
    type: 'cancel'
  },
  next: {
    text: 'Next',
    type: 'next'
  },
  back: {
    secondary: true,
    text: 'Back',
    type: 'back'
  }
};

export const defaultStepOptions: Step.StepOptions = {
  scrollTo: true,
  cancelIcon: {
    enabled: true
  }
};

export const steps: Step.StepOptions[] = [
  {
    attachTo: {
      element: '.first-element',
      on: 'bottom-start'
    },
    buttons: [
      builtInButtons.cancel,
      builtInButtons.next
    ],
    id: 'intro',
    title: 'Welcome to Angular Shepherd!',
    text:``
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
