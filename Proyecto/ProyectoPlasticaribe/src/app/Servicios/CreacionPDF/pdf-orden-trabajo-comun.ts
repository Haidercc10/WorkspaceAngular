import moment from 'moment';
import { logoNuevoParaPdf } from 'src/app/logoPlasticaribeNuevo_Base64';

/*
 * Piezas comunes de los PDF de la Orden de Trabajo (formato actual y formato 2): colores y bordes al estilo del
 * PDF de pedidos, encabezado con el logo y el número de la OT en grande, pie, íconos de los procesos y utilidades
 * para mostrar datos que pueden venir nulos (OT de BagPro o antiguas).
 * Los colores son fijos porque pdfmake no usa las variables CSS de la paleta.
 */

/** Fondo de la fila de título de cada tabla. */
export const GRIS = '#DDDDDD';
/** Fondo de los subtítulos y encabezados de columna dentro de una tabla. */
export const GRIS_SUAVE = '#F0F0F0';
/** Color de las líneas de las tablas. */
export const BORDE = '#BBBBBB';
export const TEXTO_SECUNDARIO = '#6c757d';
/** Color de los íconos de los títulos (gris oscuro: se imprime bien en blanco y negro). */
const COLOR_ICONO = '#333333';

/** Texto limpio; los nulos quedan vacíos. */
export const txt = (valor: any): string => valor == null ? '' : valor.toString().trim();

/** Número con separador de miles y los decimales indicados; los nulos o no numéricos son 0. */
export const num = (valor: any, decimales: number = 2): string => {
  const numero = Number(valor);
  return (Number.isFinite(numero) ? numero : 0).toLocaleString('en-US', { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
};

/** Solo la fecha (yyyy-MM-dd): Plasticaribe y BagPro la envían con hora. */
export const fecha = (valor: any): string => valor ? String(valor).substring(0, 10) : '';

/** Vacío o "NO APLICA..." cuenta como sin dato. */
export const sinDato = (texto: string): boolean => texto == '' || texto.toUpperCase().startsWith('NO APLICA');

/** Celdas vacías que acompañan a un colSpan (cada una es un objeto nuevo: pdfmake modifica los nodos). */
export const vacias = (cantidad: number) => Array.from({ length: cantidad }, () => ({}));

/** Interpreta las banderas de proceso de la OT (pueden llegar como booleano, número o texto). */
export const activo = (valor: any): boolean => valor === true || valor == 1 || txt(valor).toUpperCase() == 'TRUE';

/** La fila de la OT trae las banderas de proceso (las OT antiguas de BagPro pueden no traerlas). */
export const traeBanderasProceso = (d: any): boolean => ['extrusion', 'impresion', 'rotograbado', 'laminado', 'corte', 'sellado'].some(b => d[b] != null);

/**
 * Procesos por los que pasa la OT. Si la fila no trae ninguna bandera, se muestran todos para no perder información.
 */
export function procesosOT(d: any) {
  if (!traeBanderasProceso(d)) return { extrusion: true, impresion: true, laminado: true, productoTerminado: true };
  return {
    extrusion: activo(d.extrusion),
    impresion: activo(d.impresion) || activo(d.rotograbado),
    laminado: activo(d.laminado),
    productoTerminado: activo(d.corte) || activo(d.sellado),
  };
}

/** Layout de las tablas (estilo pedidos): líneas grises, las primeras `filasGris` filas sombreadas y relleno vertical corto. */
export const layoutTabla = (filasGris: number = 1) => ({
  fillColor: (fila: number) => fila < filasGris ? GRIS : null,
  hLineColor: () => BORDE,
  vLineColor: () => BORDE,
  paddingTop: () => 2,
  paddingBottom: () => 2,
});

/** Íconos (SVG de trazo) de los títulos de sección. */
const trazo = (contenido: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${COLOR_ICONO}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${contenido}</svg>`;

export const ICONOS_OT = {
  /** Matraz. */
  mezcla: trazo('<path d="M9 3h6"/><path d="M10 3v6l-5.5 9.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3"/><path d="M7.5 15h9"/>'),
  /** Rollo de película. */
  extrusion: trazo('<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><ellipse cx="12" cy="6" rx="2" ry="0.8"/>'),
  /** Impresora. */
  impresion: trazo('<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><rect x="6" y="14" width="12" height="7"/>'),
  /** Capas. */
  laminado: trazo('<path d="M12 3 2 8l10 5 10-5-10-5z"/><path d="M2 13l10 5 10-5"/><path d="M2 17.5l10 5 10-5"/>'),
  /** Caja. */
  productoTerminado: trazo('<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5l9 4.5 9-4.5"/><path d="M12 12v9"/>'),
  /** Nota. */
  observaciones: trazo('<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8"/><path d="M8 12h8"/><path d="M8 16h5"/>'),
  /** Documento con datos. */
  orden: trazo('<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M8 13h8"/><path d="M8 17h8"/>'),
};

export type IconoOT = keyof typeof ICONOS_OT;

/**
 * Contenido de una celda de título: el ícono a la izquierda del texto, ambos centrados en la celda.
 * @param texto Título de la sección.
 * @param icono Ícono de la sección (opcional).
 * @param tamano Tamaño de la letra del título.
 */
export function tituloConIcono(texto: string, icono?: IconoOT, tamano: number = 11) {
  if (!icono) return { text: texto, bold: true, fontSize: tamano, alignment: 'center' };
  return {
    columnGap: 5,
    columns: [
      { width: '*', text: '' },
      { width: tamano, svg: ICONOS_OT[icono], fit: [tamano, tamano], margin: [0, 1, 0, 0] },
      { width: 'auto', text: texto, bold: true, fontSize: tamano },
      { width: '*', text: '' },
    ],
  };
}

/**
 * Banda superior de cada hoja: logo, NIT y título (como el PDF de pedidos), el número de la OT en grande
 * y una línea debajo.
 * @param d Fila de la OT.
 * @param pagina Hoja actual.
 * @param total Total de hojas ("Hoja x de y" solo sale si hay más de una).
 * @param anchoPagina Ancho de la página, para la línea.
 * @param margenX Margen izquierdo y derecho.
 */
export function bandaCabeceraOT(d: any, pagina: number, total: number, anchoPagina: number, margenX: number = 25): any[] {
  return [
    {
      margin: [margenX, 10, margenX, 0],
      columns: [
        { image: logoNuevoParaPdf, width: 160, fit: [160, 32], margin: [0, 6, 0, 0] },
        {
          width: '*',
          alignment: 'center',
          bold: true,
          fontSize: 10,
          lineHeight: 1.15,
          margin: [0, 8, 0, 0],
          stack: [
            { text: 'NIT. 800188732' },
            { text: 'Orden de Trabajo' },
          ],
        },
        {
          width: 160,
          alignment: 'right',
          stack: [
            { text: `OT ${txt(d.numero_Orden)}`, bold: true, fontSize: 26 },
            ...(total > 1 ? [{ text: `Hoja ${pagina} de ${total}`, fontSize: 8, color: TEXTO_SECUNDARIO }] : []),
          ],
        },
      ],
    },
    { canvas: [{ type: 'line', x1: margenX, y1: 4, x2: anchoPagina - margenX, y2: 4, lineWidth: 1, lineColor: BORDE }] },
  ];
}

/** Pie de cada hoja: quién generó el documento y cuándo. */
export function pieOT(usuario: string, margenX: number = 25) {
  const expedicion = `${moment().format('YYYY-MM-DD')} ${moment().format('H:mm:ss')}`;
  return (pagina: number, total: number) => ({
    margin: [margenX, 10, margenX, 0],
    fontSize: 8,
    color: TEXTO_SECUNDARIO,
    columns: [
      { text: `Documento generado por ${usuario ?? ''}` },
      { text: `Expedición ${expedicion}`, alignment: 'center' },
      { text: `${pagina} de ${total}`, alignment: 'right' },
    ],
  });
}
