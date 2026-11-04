/** Estados (`Estado_Id`) que maneja un precargue de despacho. */
export const ESTADOS_PRECARGUE = {
  PENDIENTE: 11,
  EN_PROCESO: 2,
  ACEPTADO: 26,
  FINALIZADO: 5,
  ANULADO: 3,
} as const;

/** OF genérica asignada a los precargues que aún no tienen una orden de facturación real; no se muestra en pantalla. */
export const OF_GENERICA_PRECARGUE = 4472;
