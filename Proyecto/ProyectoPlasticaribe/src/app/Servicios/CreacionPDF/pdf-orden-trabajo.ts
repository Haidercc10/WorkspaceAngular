import { FichaComplementariaItem, descripcionEmbobinado } from 'src/app/Modelo/modelEmbobinado';
import {
  GRIS_SUAVE, IconoOT, activo, bandaCabeceraOT, fecha, layoutTabla, num, pieOT, sinDato, traeBanderasProceso,
  tituloConIcono, txt, vacias,
} from './pdf-orden-trabajo-comun';

/*
 * PDF de la Orden de Trabajo (formato actual, dos hojas) con el estilo del PDF de pedidos.
 *   Encabezado de cada hoja: logo, NIT, título y OT en grande; debajo, cliente e item y los datos de la orden.
 *   Hoja 1: mezcla, resumen de extrusión y observaciones (general y extrusión).
 *   Hoja 2: extrusión | laminado, impresión | producto terminado y observaciones (general y demás procesos).
 * Tamaños de letra del formato anterior: datos 9, etiquetas 10 y títulos 11.
 * Recibe la fila de CreacionPdfService.obtenerDatosOrdenTrabajo (ya complementada con la ficha del item).
 */

const ANCHO_PAGINA = 630;
const ALTO_PAGINA = 760;
const MARGEN_X = 25;
/** Alto del encabezado: banda con el logo y la OT, cliente e item y datos de la orden. */
const MARGEN_SUPERIOR = 178;
/** Separación entre tablas. */
const SEPARACION = 20;
/** Separación entre las tablas que van lado a lado. */
const ESPACIO_COLUMNAS = 12;

type Par = [string, string];

/** Etiqueta de un dato (negrita, 10). */
const etiqueta = (texto: string) => ({ text: texto, bold: true, fontSize: 10 });

/** Encabezado de columna o subtítulo dentro de una tabla (sombreado suave). */
const subtitulo = (texto: string, extra: any = {}) => ({ text: texto, bold: true, fontSize: 10, fillColor: GRIS_SUAVE, alignment: 'center', ...extra });

/** Fila de título (sombreada por el layout) con su ícono, que ocupa todas las columnas. */
const filaTitulo = (texto: string, columnas: number, icono?: IconoOT) => [{ ...tituloConIcono(texto, icono), colSpan: columnas }, ...vacias(columnas - 1)];

/** Fila etiqueta + valor que ocupa las 4 columnas. */
const filaCompleta = (titulo: string, valor: any) => [etiqueta(titulo), { ...(typeof valor == 'string' ? { text: valor } : valor), colSpan: 3 }, ...vacias(2)];

/** Pares etiqueta/valor de a dos por fila (4 columnas); si queda uno solo, su valor ocupa el resto de la fila. */
function filasPares(pares: Par[]): any[][] {
  const filas: any[][] = [];
  for (let i = 0; i < pares.length; i += 2) {
    const [e1, v1] = pares[i];
    const segundo = pares[i + 1];
    filas.push(segundo ? [etiqueta(e1), v1, etiqueta(segundo[0]), segundo[1]] : filaCompleta(e1, v1));
  }
  return filas;
}

/** Tabla con el layout de pedidos (primera fila de título sombreada). */
const tabla = (widths: any[], body: any[][], extra: any = {}) => ({ table: { widths, dontBreakRows: true, body }, layout: layoutTabla(1), ...extra });

/** Dos tablas lado a lado. */
const ladoALado = (izquierda: any, derecha: any, extra: any = {}) => ({
  columnGap: ESPACIO_COLUMNAS,
  columns: [{ width: '*', ...izquierda }, { width: '*', ...derecha }],
  ...extra,
});

const grafilado = (valor: boolean | null | undefined): string => valor === true ? 'SÍ' : valor === false ? 'NO' : 'NO APLICA';

const llevaCyrel = (d: any): boolean => d.cyrel == true || d.cyrel == '1';

/**
 * El producto terminado lleva sellado: según la bandera de sellado de la OT; si la fila no trae banderas
 * (OT antiguas de BagPro), según el tipo de sellado registrado.
 */
const llevaSellado = (d: any): boolean => traeBanderasProceso(d) ? activo(d.sellado) : !sinDato(txt(d.tpSellados_Nombre));

// ---------------------------------------------------------------- Encabezado

/** Cliente e item: el número del item y la referencia en la misma fila, que es lo que más se consulta. */
function tablaClienteItem(d: any) {
  const etiquetaSombreada = (texto: string) => ({ ...etiqueta(texto), fillColor: GRIS_SUAVE });
  return {
    margin: [MARGEN_X, 16, MARGEN_X, 0],
    fontSize: 9,
    table: {
      widths: [62, 62, 72, '*'],
      body: [
        [etiquetaSombreada('Cliente'), { text: txt(d.cliente), colSpan: 3 }, ...vacias(2)],
        [etiquetaSombreada('Item'), { text: txt(d.id_Producto), bold: true, fontSize: 10 }, etiquetaSombreada('Referencia'), { text: txt(d.producto), bold: true }],
      ],
    },
    layout: layoutTabla(0),
  };
}

/** Datos de la orden: una columna por dato, con líneas que separan cada columna. */
function tablaDatosOrden(d: any) {
  const datos: Par[] = [
    ['Fecha creación', fecha(d.fecha_Creacion)],
    ['Material', txt(d.material)],
    ['Cant. bolsas', num(d.cantidad_Pedida)],
    ['Cant. kilos (Kg)', num(d.peso_Neto)],
    ['Presentación', txt(d.presentacion)],
    ['Fecha entrega', fecha(d.fecha_Entrega)],
  ];
  return {
    margin: [MARGEN_X, SEPARACION, MARGEN_X, 0],
    fontSize: 9,
    table: {
      widths: datos.map(() => '*'),
      body: [
        datos.map(([titulo]) => subtitulo(titulo)),
        datos.map(([, valor]) => ({ text: valor, alignment: 'center' })),
      ],
    },
    layout: layoutTabla(0),
  };
}

function cabecera(d: any) {
  return (pagina: number, total: number) => [
    ...bandaCabeceraOT(d, pagina, total, ANCHO_PAGINA, MARGEN_X),
    tablaClienteItem(d),
    tablaDatosOrden(d),
  ];
}

// ---------------------------------------------------------------- Hoja 1

/** Mezcla: las tres capas lado a lado, cada una con el nombre del componente y su porcentaje. */
function tablaMezcla(d: any) {
  const capas = [{ n: 1, nombre: 'Capa única' }, { n: 2, nombre: 'Capa interna' }, { n: 3, nombre: 'Capa externa' }];
  const porcentaje = (valor: any) => `${Number(valor) || 0}%`;
  const nombre = (valor: any) => {
    const texto = txt(valor);
    return sinDato(texto) ? 'N/A' : texto.replace('PIGMENTO', 'PIG.');
  };
  const componentes = [
    ...[1, 2, 3, 4].map(n => ({ titulo: `Mat. ${n}`, nombre: (c: number) => d[`m${n}C${c}_nombre`], porcentaje: (c: number) => d[`mezcla_PorcentajeMaterial${n}_Capa${c}`] })),
    ...[1, 2].map(n => ({ titulo: `Pig. ${n}`, nombre: (c: number) => d[`p${n}C${c}_Nombre`], porcentaje: (c: number) => d[`mezcla_PorcentajePigmto${n}_Capa${c}`] })),
  ];
  const titulo = `${txt(d.mezcla_Nombre) || 'MATERIA PRIMA'}${d.mezclaAjustada ? ' (AJUSTADA PARA ESTE ITEM)' : ''}`;

  return tabla([48, '*', 34, '*', 34, '*', 34], [
    filaTitulo(titulo, 7, 'mezcla'),
    [subtitulo('Componente'), ...capas.flatMap(c => [subtitulo(`${c.nombre} (${porcentaje(d[`mezcla_PorcentajeCapa${c.n}`])})`, { colSpan: 2 }), {}])],
    ...componentes.map(comp => [
      etiqueta(comp.titulo),
      ...capas.flatMap(c => [nombre(comp.nombre(c.n)), { text: porcentaje(comp.porcentaje(c.n)), alignment: 'right' }]),
    ]),
  ], { margin: [0, 0, 0, SEPARACION] });
}

/** Resumen de extrusión de la hoja 1: un dato por columna, con líneas entre columnas. */
function tablaExtrusionResumen(d: any) {
  const datos: Par[] = [
    ['Pigmento', txt(d.pigmento_Extrusion)],
    ['Formato', txt(d.formato_Extrusin)],
    ['Ancho', `${num(d.ancho1_Extrusion)} + ${num(d.ancho2_Extrusion)} + ${num(d.ancho3_Extrusion)}`],
    ['Und. medida', txt(d.und_Extrusion)],
    ['Calibre', num(d.calibre_Extrusion)],
    ['Peso MT\n(Min/Max)', num(d.peso_Extrusion)],
    ['Tratado', txt(d.tratado)],
    ['Grafilado', grafilado(d.extrusion_Grafilado)],
  ];
  return tabla([58, 58, '*', 48, 50, 55, 55, 55], [
    filaTitulo('EXTRUSIÓN', datos.length, 'extrusion'),
    datos.map(([titulo]) => subtitulo(titulo)),
    datos.map(([, valor]) => ({ text: valor, alignment: 'center' })),
  ], { margin: [0, 0, 0, SEPARACION] });
}

/**
 * Observaciones por proceso; solo las que tienen texto (la general va primero). Null si ninguna tiene texto.
 * @param filas Proceso y observación de cada fila.
 */
function tablaObservaciones(filas: { proceso: string, texto: any }[]) {
  const conTexto = filas.map(f => ({ proceso: f.proceso, texto: txt(f.texto) })).filter(f => f.texto != '');
  if (conTexto.length == 0) return null;
  return tabla([120, '*'], [
    filaTitulo('OBSERVACIONES POR PROCESO', 2, 'observaciones'),
    [subtitulo('Proceso'), subtitulo('Observación')],
    ...conTexto.map(f => [etiqueta(f.proceso), f.texto]),
  ]);
}

function hoja1(d: any): any[] {
  return [
    tablaMezcla(d),
    tablaExtrusionResumen(d),
    tablaObservaciones([
      { proceso: 'General', texto: d.observacion },
      { proceso: 'Extrusión', texto: d.extrusion_Observacion },
    ]),
  ].filter(Boolean);
}

// ---------------------------------------------------------------- Hoja 2

function procesoExtrusion(d: any) {
  const pares: Par[] = [
    ['Pigmento', txt(d.pigmento_Extrusion)],
    ['Formato', txt(d.formato_Extrusin)],
    ['Calibre', num(d.calibre_Extrusion)],
    ['Unidad medida', txt(d.und_Extrusion)],
    ['Ancho', `${num(d.ancho1_Extrusion)} + ${num(d.ancho2_Extrusion)} + ${num(d.ancho3_Extrusion)}`],
    ['Peso MT (Min/Max)', num(d.peso_Extrusion)],
    ['Tratado caras', txt(d.tratado)],
    ['Grafilado', grafilado(d.extrusion_Grafilado)],
  ];
  return tabla(['auto', '*'], [filaTitulo('EXTRUSIÓN', 2, 'extrusion'), ...pares.map(([e, v]) => [etiqueta(e), v])]);
}

function procesoLaminado(d: any) {
  const derecha = (texto: string) => ({ text: texto, alignment: 'right' });
  return tabla(['*', 62, 62], [
    filaTitulo('LAMINADO', 3, 'laminado'),
    [subtitulo('Capa'), subtitulo('Calibre'), subtitulo('Cantidad')],
    ...[1, 2, 3].map(c => [txt(d[`laminado_Capa${c}`]), derecha(num(d[`calibre_Laminado_Capa${c}`])), derecha(num(d[`cantidad_Laminado_Capa${c}`]))]),
  ]);
}

/** Impresión: tintas 1 a 4 en la primera columna y 5 a 8 en la segunda. */
function procesoImpresion(d: any, ficha: Partial<FichaComplementariaItem>) {
  const tipo = txt(d.tipo_Impresion);
  const tinta = (n: number) => txt(d[`tinta${n}`]);
  return tabla(['auto', '*', 'auto', '*'], [
    filaTitulo('IMPRESIÓN', 4, 'impresion'),
    filaCompleta('Tipo impresión', sinDato(tipo) ? 'FLEXOGRAFIA' : tipo),
    ...(llevaCyrel(d) ? [filaCompleta('Hacer cyrel', { text: 'SÍ', bold: true, fontSize: 10 })] : []),
    [etiqueta('Rodillo N°'), txt(d.rodillo), etiqueta('N° de pista'), txt(d.pista)],
    [subtitulo('Tintas', { colSpan: 4 }), ...vacias(3)],
    ...[1, 2, 3, 4].map(n => [etiqueta(`Tinta ${n}`), tinta(n), etiqueta(`Tinta ${n + 4}`), tinta(n + 4)]),
    filaCompleta('Código de barras', txt(ficha.codigoBarras)),
    filaCompleta('Repeticiones', txt(ficha.repeticiones)),
  ]);
}

/**
 * Producto terminado: formato, medidas en una fila, los demás datos de a dos por fila (sellado, cantidad por
 * paquete y por bulto solo si lleva sellado) y el desembobinado final con su imagen.
 */
function procesoProductoTerminado(d: any, ficha: Partial<FichaComplementariaItem>) {
  const unidad = txt(d.und_Extrusion);
  const conUnidad = (titulo: string) => unidad ? `${titulo} (${unidad})` : titulo;
  const centro = (texto: string) => ({ text: texto, alignment: 'center' });
  const sellado = llevaSellado(d);
  const pares: Par[] = [
    ...(sellado ? [['Sellado', txt(d.tpSellados_Nombre)] as Par] : []),
    ['Margen', num(d.margen)],
    ['Peso millar', num(d.selladoCorte_PesoMillar)],
    ...(sellado ? [['Cant. x paq.', num(d.selladoCorte_CantBolsasPaquete)], ['Cant. x bulto', num(d.selladoCorte_CantBolsasBulto)]] as Par[] : []),
    ['Paso guías', txt(ficha.pasoGuias)],
    ['Ubicación guía', txt(ficha.ubicacionGuia)],
  ];
  const embobinado = ficha.embobinado_Id ? descripcionEmbobinado(ficha.embobinado_Id) : '';
  const filaEmbobinado = embobinado ? [[
    {
      colSpan: 4,
      columnGap: 8,
      columns: [
        { width: '*', stack: [etiqueta('Desembobinado final'), { text: embobinado, fontSize: 8.5, margin: [0, 2, 0, 0] }] },
        ...(d.embobinadoImagen ? [{ width: 70, image: d.embobinadoImagen, fit: [70, 55] }] : []),
      ],
    },
    ...vacias(3),
  ]] : [];

  return tabla(['auto', '*', 'auto', '*'], [
    filaTitulo('PRODUCTO TERMINADO', 4, 'productoTerminado'),
    filaCompleta('Formato bolsa', txt(d.formato_Producto)),
    [subtitulo(conUnidad('Ancho')), subtitulo(conUnidad('Largo')), subtitulo(conUnidad('Fuelle')), subtitulo(conUnidad('Solapa'))],
    [
      centro(num(d.selladoCorte_Ancho)),
      centro(ficha.largoContinuo ? 'CONTINUO' : num(d.selladoCorte_Largo)),
      centro(num(d.selladoCorte_Fuelle)),
      // Las OT que vienen de BagPro no traen la solapa
      centro(num(Number(d.selladoCorte_Solapa) || 0)),
    ],
    ...filasPares(pares),
    ...filaEmbobinado,
  ]);
}

function hoja2(d: any): any[] {
  const ficha: Partial<FichaComplementariaItem> = d.fichaComplementaria ?? {};
  return [
    ladoALado(procesoExtrusion(d), procesoLaminado(d), { pageBreak: 'before', margin: [0, 0, 0, SEPARACION] }),
    ladoALado(procesoImpresion(d, ficha), procesoProductoTerminado(d, ficha), { margin: [0, 0, 0, SEPARACION] }),
    tablaObservaciones([
      { proceso: 'General', texto: d.observacion },
      { proceso: 'Laminado', texto: d.laminado_Observacion },
      { proceso: 'Impresión', texto: d.impresion_Observacion },
      { proceso: 'Producto Terminado', texto: d.selladoCorte_Observacion },
    ]),
  ].filter(Boolean);
}

/**
 * Definición pdfmake del PDF de la OT.
 * @param datos_ot Fila de la OT (Plasticaribe o BagPro) ya complementada con la ficha del item.
 * @param usuario Nombre que sale en el pie como quien generó el documento.
 */
export function definicionPdfOrdenTrabajo(datos_ot: any, usuario: string): any {
  return {
    info: { title: `OT ${txt(datos_ot.numero_Orden)}` }, // Título de la pestaña del navegador al abrir el PDF
    pageSize: { width: ANCHO_PAGINA, height: ALTO_PAGINA },
    pageMargins: [MARGEN_X, MARGEN_SUPERIOR, MARGEN_X, 35],
    watermark: { text: 'PLASTICARIBE SAS', color: 'red', opacity: 0.03, bold: true, italics: false },
    header: cabecera(datos_ot),
    footer: pieOT(usuario, MARGEN_X),
    content: [...hoja1(datos_ot), ...hoja2(datos_ot)],
    defaultStyle: { fontSize: 9 },
  };
}
