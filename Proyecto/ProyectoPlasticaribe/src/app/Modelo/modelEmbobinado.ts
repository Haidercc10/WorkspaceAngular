/*
 * Tipos de embobinado (desembobinado final) del cuadro "PLASTICARIBE - Tipos de Embobinado".
 * 1-8 son embobinado exterior y 9-16 interior; cada uno indica qué parte del diseño va hacia la máquina
 * y de qué lado queda la fotocelda. Las imágenes están en assets/Embobinado/{id}.png.
 */

/** Tipo de embobinado del cuadro de Plasticaribe. */
export interface TipoEmbobinado {
  id: number;
  grupo: 'Exterior' | 'Interior';
  /** Parte del diseño que va hacia la máquina. */
  haciaMaquina: string;
  /** Lado de la fotocelda. */
  fotocelda: 'izquierdo' | 'derecho';
}

const PATRON: ReadonlyArray<Pick<TipoEmbobinado, 'haciaMaquina' | 'fotocelda'>> = [
  { haciaMaquina: 'Cabeza', fotocelda: 'izquierdo' },
  { haciaMaquina: 'Fondo', fotocelda: 'derecho' },
  { haciaMaquina: 'Lado derecho', fotocelda: 'derecho' },
  { haciaMaquina: 'Lado izquierdo', fotocelda: 'izquierdo' },
  { haciaMaquina: 'Cabeza', fotocelda: 'derecho' },
  { haciaMaquina: 'Fondo', fotocelda: 'izquierdo' },
  { haciaMaquina: 'Lado derecho', fotocelda: 'izquierdo' },
  { haciaMaquina: 'Lado izquierdo', fotocelda: 'derecho' },
];

/** Los 16 tipos de embobinado: 1-8 exterior y 9-16 interior (el interior repite el patrón del exterior). */
export const TIPOS_EMBOBINADO: ReadonlyArray<TipoEmbobinado> = [
  ...PATRON.map((p, i) => ({ id: i + 1, grupo: 'Exterior' as const, ...p })),
  ...PATRON.map((p, i) => ({ id: i + 9, grupo: 'Interior' as const, ...p })),
];

/**
 * Ruta de la imagen de un tipo de embobinado.
 * @param id Tipo de embobinado (1-16).
 * @returns Ruta dentro de assets.
 */
export const imagenEmbobinado = (id: number): string => `assets/Embobinado/${id}.png`;

/**
 * Texto completo de un tipo de embobinado (p. ej. "N° 3 Exterior: lado derecho del diseño hacia la máquina, fotocelda al lado derecho").
 * @param id Tipo de embobinado (1-16).
 * @returns Descripción o cadena vacía si no existe.
 */
export function descripcionEmbobinado(id: number | null | undefined): string {
  const tipo = TIPOS_EMBOBINADO.find(t => t.id == id);
  return tipo ? `N° ${tipo.id} ${tipo.grupo}: ${tipo.haciaMaquina.toLowerCase()} del diseño hacia la máquina, fotocelda al lado ${tipo.fotocelda}` : '';
}

/** Datos del item que no existen en BagPro y se guardan en Plasticaribe (`Ficha_Complementaria_Item`). */
export interface FichaComplementariaItem {
  prod_Id: number;
  embobinado_Id: number | null;
  codigoBarras: string | null;
  repeticiones: string | null;
  pasoGuias: string | null;
  ubicacionGuia: string | null;
  largoContinuo: boolean;
  /** La mezcla del item en BagPro se ajustó en Crear Item: la OT y su PDF muestran la del item, no la predefinida. */
  mezclaAjustada: boolean;
}
