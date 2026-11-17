/**
 * Paleta Plasticaribe para el código TypeScript (gráficas de Chart.js).
 * Los mismos valores están como variables CSS en src/styles.css (--grafica-1 ... --grafica-8).
 * Si se cambia un color aquí, cambiarlo también allá.
 *
 * Uso típico junto con alCambiarTema:
 *   labels: { color: colorTextoGrafica(this.modoSeleccionado) }
 *   grid: { color: COLOR_REJILLA_GRAFICA }
 *   backgroundColor: coloresSeriesGrafica(this.modoSeleccionado)
 *
 * Nota: los PDF (pdfmake) no leen variables CSS; ahí se siguen usando colores fijos.
 */

/** Texto de leyendas y ejes: el mismo --text-color de PrimeNG en cada tema. */
export function colorTextoGrafica(oscuro: boolean): string {
  return oscuro ? 'rgba(255, 255, 255, 0.87)' : '#495057';
}

/** Líneas de la cuadrícula; sirve en ambos temas. */
export const COLOR_REJILLA_GRAFICA = 'rgba(128, 128, 128, 0.2)';

/** Colores de las series en orden: azul marino, rojo, verde azulado, ámbar, azul acero, violeta, café, gris. */
export const PALETA_GRAFICAS = {
  claro: ['#283a75', '#c42a35', '#2a9d8f', '#e9a23b', '#4a99b4', '#7b5ea7', '#8c6d46', '#6c757d'],
  oscuro: ['#8597c9', '#e4636e', '#3dbfae', '#e9a23b', '#6bb6d0', '#a68bd1', '#b89466', '#adb5bd'],
};

/** Colores de las series para el tema actual. */
export function coloresSeriesGrafica(oscuro: boolean): string[] {
  return oscuro ? PALETA_GRAFICAS.oscuro : PALETA_GRAFICAS.claro;
}
