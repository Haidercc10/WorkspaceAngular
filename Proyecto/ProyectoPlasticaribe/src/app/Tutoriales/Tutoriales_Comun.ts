import Step from 'shepherd.js/src/types/step';
import { builtInButtons } from 'src/app/data';

/*
 * Utilidades compartidas por los archivos de pasos de src/app/Tutoriales/ (uno por módulo).
 * Se usan junto con TutorialesService (src/app/Servicios/Tutoriales).
 */

export const botonTerminar = {
  classes: 'botonRojo',
  text: `<i class="pi pi-check mr-2"></i> <b> Terminar</b>`,
  type: 'next', // "siguiente" en el último paso finaliza el recorrido
};

/**
 * Elemento a resaltar: un selector CSS, o una función que lo devuelve al momento de mostrar el paso
 * (útil cuando el elemento depende de la pestaña activa). Sin elemento el paso sale centrado.
 */
export type ElementoPaso = string | (() => string) | null;

/** Paso con el formato del proyecto. */
export function paso(elemento : ElementoPaso, titulo : string, texto : string, extra : Partial<Step.StepOptions> = {}) : Step.StepOptions {
  return {
    ...(elemento ? { attachTo: { element: elemento, on: 'bottom' } } : {}),
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'card',
    title: `<h4 style="margin: auto; color: var(--rojo)">${titulo}</h4>`,
    text: texto,
    ...extra,
  } as Step.StepOptions;
}

/** Pone ids únicos y los botones Cerrar/Atrás/Siguiente/Terminar según la posición de cada paso. */
export function armar(prefijo : string, pasos : (Step.StepOptions | null | false)[]) : Step.StepOptions[] {
  const lista = pasos.filter(Boolean) as Step.StepOptions[];
  return lista.map((p, i) => ({
    ...p,
    id: `${prefijo}-${i + 1}`,
    buttons: [
      i === 0 ? builtInButtons.cancel : builtInButtons.back,
      i === lista.length - 1 ? botonTerminar : builtInButtons.next,
    ],
  }) as Step.StepOptions);
}
