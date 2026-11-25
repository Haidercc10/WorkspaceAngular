import moment from 'moment';
import { logoNuevoParaPdf } from 'src/app/logoPlasticaribeNuevo_Base64';
import { FichaComplementariaItem, descripcionEmbobinado } from 'src/app/Modelo/modelEmbobinado';

/*
 * PDF de la Orden de Trabajo, formato 2 (en prueba). Sigue el estilo del PDF de pedidos: tablas con borde gris,
 * título de sección sombreado y etiquetas en negrita; letra grande para planta, y la OT cabe en una sola hoja:
 *   información de la orden (cliente e item, cantidades y fechas), mezcla, extrusión | impresión, laminado, producto terminado (con el desembobinado
 *   final) y al final una sola tabla de observaciones (general y de cada proceso).
 * Solo salen los procesos por los que pasa la OT.
 * Es independiente del formato actual (CreacionPdfService.crearPdfOrdenTrabajo), que no cambia.
 * Recibe los mismos datos que el formato actual (ver CreacionPdfService.obtenerDatosOrdenTrabajo).
 */

const GRIS = '#DDDDDD';
/** Fondo de los subtítulos de sección dentro de una tabla. */
const GRIS_SUAVE = '#F0F0F0';
const BORDE = '#BBBBBB';
const TEXTO_SECUNDARIO = '#6c757d';
/** Alto reservado arriba para la cabecera (logo, título y número de OT); justo para que no quede una franja en blanco. */
const MARGEN_SUPERIOR = 68;
/** Separación entre tablas. */
const SEPARACION = 12;

/** Nombre de la columna de una capa: "Capa única" si la mezcla tiene una sola, si no "Capa N". */
const nombreCapa = (capa: number, totalCapas: number): string => totalCapas == 1 ? 'Capa única' : `Capa ${capa}`;

type Par = [string, string];

/** Texto limpio; los nulos (OT de BagPro o antiguas) quedan vacíos. */
const txt = (valor: any): string => valor == null ? '' : valor.toString().trim();

/** Número con separador de miles y los decimales indicados; los nulos o no numéricos son 0. */
const num = (valor: any, decimales: number = 2): string => {
  const numero = Number(valor);
  return (Number.isFinite(numero) ? numero : 0).toLocaleString('en-US', { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
};

/** Solo la fecha (yyyy-MM-dd): Plasticaribe y BagPro la envían con hora. */
const fecha = (valor: any): string => valor ? String(valor).substring(0, 10) : '';

/** Vacío o "NO APLICA..." cuenta como sin dato. */
const sinDato = (texto: string): boolean => texto == '' || texto.toUpperCase().startsWith('NO APLICA');

const etiqueta = (texto: string) => ({ text: texto, bold: true });

/** Celdas vacías que acompañan a un colSpan (cada una es un objeto nuevo: pdfmake modifica los nodos). */
const vacias = (cantidad: number) => Array.from({ length: cantidad }, () => ({}));

/** Fila de título de sección (sombreada por el layout) que ocupa todas las columnas. */
const filaTitulo = (texto: string, columnas: number) => [{ text: texto, colSpan: columnas, bold: true, fontSize: 11 }, ...vacias(columnas - 1)];

/** Layout de las tablas: bordes grises, las primeras `filasGris` filas sombreadas y relleno vertical corto. */
const layout = (filasGris: number = 1) => ({
  fillColor: (fila: number) => fila < filasGris ? GRIS : null,
  hLineColor: () => BORDE,
  vLineColor: () => BORDE,
  paddingTop: () => 2,
  paddingBottom: () => 2,
});

/** Interpreta las banderas de proceso de la OT (pueden llegar como booleano, número o texto). */
const activo = (valor: any): boolean => valor === true || valor == 1 || txt(valor).toUpperCase() == 'TRUE';

/**
 * Procesos por los que pasa la OT. Si la fila no trae ninguna bandera (p. ej. una OT antigua de BagPro),
 * se muestran todos para no perder información.
 */
function procesosOT(d: any) {
  const banderas = ['extrusion', 'impresion', 'rotograbado', 'laminado', 'corte', 'sellado'];
  if (!banderas.some(b => d[b] != null)) return { extrusion: true, impresion: true, laminado: true, productoTerminado: true };
  return {
    extrusion: activo(d.extrusion),
    impresion: activo(d.impresion) || activo(d.rotograbado),
    laminado: activo(d.laminado),
    productoTerminado: activo(d.corte) || activo(d.sellado),
  };
}

/**
 * Filas etiqueta/valor. Con `porFila` 2 van dos datos por fila (4 columnas), como "Información del pedido";
 * con 1, un dato por fila (2 columnas), para las tablas que van lado a lado.
 */
function filasPares(pares: Par[], porFila: 1 | 2): any[][] {
  if (porFila == 1) return pares.map(([e, v]) => [etiqueta(e), v]);
  const filas: any[][] = [];
  for (let i = 0; i < pares.length; i += 2) {
    const [e1, v1] = pares[i];
    const segundo = pares[i + 1];
    filas.push(segundo ? [etiqueta(e1), v1, etiqueta(segundo[0]), segundo[1]] : [etiqueta(e1), { text: v1, colSpan: 3 }, ...vacias(2)]);
  }
  return filas;
}

/** Tabla de pares etiqueta/valor con su título. */
function tablaPares(titulo: string, pares: Par[], porFila: 1 | 2 = 2) {
  return {
    table: {
      widths: porFila == 2 ? [92, '*', 92, '*'] : [92, '*'],
      dontBreakRows: true,
      body: [filaTitulo(titulo, porFila * 2), ...filasPares(pares, porFila)],
    },
    layout: layout(),
  };
}

/** Coloca las tablas lado a lado (si hay dos) o a todo el ancho (si hay una); null si no hay ninguna. */
function enFila(tablas: { titulo: string, pares: Par[] }[]) {
  if (tablas.length == 0) return null;
  if (tablas.length == 1) return { ...tablaPares(tablas[0].titulo, tablas[0].pares, 2), margin: [0, 0, 0, SEPARACION] };
  return {
    margin: [0, 0, 0, SEPARACION],
    columnGap: 12,
    columns: tablas.map(t => ({ width: '*', ...tablaPares(t.titulo, t.pares, 1) })),
  };
}

/** Nombre de un material o pigmento de la mezcla; los "NO APLICA" quedan vacíos. */
function nombreComponente(valor: any): string {
  const nombre = txt(valor);
  return sinDato(nombre) ? '' : nombre.replace('PIGMENTO', 'PIG.');
}

/**
 * Tabla de la mezcla: una columna por capa usada y una fila por material/pigmento.
 * Se omiten las capas sin porcentaje y las filas donde ninguna capa tiene ese componente.
 */
function tablaMezcla(d: any) {
  const capas = [1, 2, 3].filter(c => Number(d[`mezcla_PorcentajeCapa${c}`]) > 0);
  if (capas.length == 0) capas.push(1);
  const nombreTitulo = txt(d.mezcla_Nombre) || 'MATERIA PRIMA';

  const componentes = [
    ...[1, 2, 3, 4].map(n => ({ titulo: `Material ${n}`, nombre: (c: number) => d[`m${n}C${c}_nombre`], porcentaje: (c: number) => d[`mezcla_PorcentajeMaterial${n}_Capa${c}`] })),
    ...[1, 2].map(n => ({ titulo: `Pigmento ${n}`, nombre: (c: number) => d[`p${n}C${c}_Nombre`], porcentaje: (c: number) => d[`mezcla_PorcentajePigmto${n}_Capa${c}`] })),
  ];
  const filas = componentes
    .filter(comp => capas.some(c => nombreComponente(comp.nombre(c)) != ''))
    .map(comp => [
      etiqueta(comp.titulo),
      ...capas.map(c => {
        const nombre = nombreComponente(comp.nombre(c));
        return nombre == '' ? { text: '' } : {
          columns: [{ width: '*', text: nombre }, { width: 'auto', text: `${num(comp.porcentaje(c))} %`, bold: true }],
          columnGap: 4,
        };
      }),
    ]);

  return {
    margin: [0, 0, 0, SEPARACION],
    table: {
      widths: [72, ...capas.map(() => '*')],
      dontBreakRows: true,
      body: [
        filaTitulo(`Mezcla: ${nombreTitulo}${d.mezclaAjustada ? ' (ajustada para este item)' : ''}`, capas.length + 1),
        [etiqueta('Componente'), ...capas.map(c => etiqueta(`${nombreCapa(c, capas.length)} (${num(d[`mezcla_PorcentajeCapa${c}`])} %)`))],
        ...(filas.length ? filas : [[{ text: 'Sin materiales registrados', colSpan: capas.length + 1, color: TEXTO_SECUNDARIO }, ...vacias(capas.length)]]),
      ],
    },
    layout: layout(2),
  };
}

/** Tabla del laminado: solo las capas que aplican. */
function tablaLaminado(d: any) {
  const capas = [1, 2, 3]
    .map(c => ({ capa: txt(d[`laminado_Capa${c}`]), calibre: d[`calibre_Laminado_Capa${c}`], cantidad: d[`cantidad_Laminado_Capa${c}`] }))
    .filter(c => !sinDato(c.capa));
  const derecha = (texto: string) => ({ text: texto, alignment: 'right' });
  return {
    margin: [0, 0, 0, SEPARACION],
    table: {
      widths: ['*', 100, 100],
      dontBreakRows: true,
      body: [
        filaTitulo('Laminado', 3),
        [etiqueta('Capa'), { ...etiqueta('Calibre'), alignment: 'right' }, { ...etiqueta('Cantidad'), alignment: 'right' }],
        ...(capas.length
          ? capas.map(c => [c.capa, derecha(num(c.calibre)), derecha(num(c.cantidad))])
          : [[{ text: 'Sin capas registradas', colSpan: 3, color: TEXTO_SECUNDARIO }, ...vacias(2)]]),
      ],
    },
    layout: layout(2),
  };
}

/**
 * Producto terminado con el desembobinado final dentro de la misma tabla: una quinta columna a la derecha que
 * abarca todas las filas de datos (rowSpan), con el título, la imagen y la descripción enmarcados.
 */
function tablaProductoTerminado(d: any, ficha: Partial<FichaComplementariaItem>) {
  const pares: Par[] = [
    ['Formato bolsa', txt(d.formato_Producto)],
    ['Unidad medida', txt(d.und_Extrusion)],
    ['Ancho', num(d.selladoCorte_Ancho)],
    ['Largo', ficha.largoContinuo ? 'CONTINUO' : num(d.selladoCorte_Largo)],
    ['Fuelle', num(d.selladoCorte_Fuelle)],
    // Las OT que vienen de BagPro no traen la solapa
    ['Solapa', num(Number(d.selladoCorte_Solapa) || 0)],
    ['Sellado', txt(d.tpSellados_Nombre)],
    ['Margen', num(d.margen)],
    ['Peso millar', num(d.selladoCorte_PesoMillar)],
    ['Cant. x paquete', num(d.selladoCorte_CantBolsasPaquete)],
    ['Cant. x bulto', num(d.selladoCorte_CantBolsasBulto)],
    ['Paso entre guías', txt(ficha.pasoGuias)],
    ['Ubicación guía', txt(ficha.ubicacionGuia)],
  ];
  const filas = filasPares(pares, 2);
  const embobinado = ficha.embobinado_Id ? descripcionEmbobinado(ficha.embobinado_Id) : '';
  if (!embobinado) {
    return { margin: [0, 0, 0, SEPARACION], table: { widths: [92, '*', 92, '*'], dontBreakRows: true, body: [filaTitulo('Producto terminado', 4), ...filas] }, layout: layout() };
  }

  const celdaEmbobinado = {
    rowSpan: filas.length,
    alignment: 'center',
    stack: [
      etiqueta('Desembobinado final'),
      ...(d.embobinadoImagen ? [{ image: d.embobinadoImagen, fit: [100, 75], alignment: 'center', margin: [0, 4, 0, 4] }] : []),
      { text: embobinado, fontSize: 8.5 },
    ],
  };
  return {
    margin: [0, 0, 0, SEPARACION],
    table: {
      widths: [92, '*', 92, '*', 130],
      dontBreakRows: true,
      body: [
        filaTitulo('Producto terminado', 5),
        ...filas.map((fila, i) => [...fila, i == 0 ? celdaEmbobinado : {}]),
      ],
    },
    layout: layout(),
  };
}

/** Única tabla de observaciones, al final: la general y la de cada proceso por el que pasa la OT; null si ninguna tiene texto. */
function tablaObservaciones(d: any, procesos: ReturnType<typeof procesosOT>) {
  const filas = [
    { proceso: 'General', texto: txt(d.observacion), aplica: true },
    { proceso: 'Extrusión', texto: txt(d.extrusion_Observacion), aplica: procesos.extrusion },
    { proceso: 'Impresión', texto: txt(d.impresion_Observacion), aplica: procesos.impresion },
    { proceso: 'Laminado', texto: txt(d.laminado_Observacion), aplica: procesos.laminado },
    { proceso: 'Producto terminado', texto: txt(d.selladoCorte_Observacion), aplica: procesos.productoTerminado },
  ].filter(f => f.aplica && f.texto != '');
  if (filas.length == 0) return null;
  return {
    table: {
      widths: [110, '*'],
      dontBreakRows: true,
      body: [filaTitulo('Observaciones', 2), ...filas.map(f => [etiqueta(f.proceso), f.texto])],
    },
    layout: layout(),
  };
}

/** Cabecera de cada hoja: logo, título y el número de la OT en grande. */
function cabecera(d: any) {
  return (pagina: number, total: number) => [
    {
      margin: [25, 10, 25, 0],
      columns: [
        { image: logoNuevoParaPdf, width: 160, fit: [160, 32], margin: [0, 6, 0, 0] },
        // Mismo estilo del centro de la cabecera común (PDF de pedidos): NIT y título en negrita, tamaño 10
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
    { canvas: [{ type: 'line', x1: 25, y1: 4, x2: 587, y2: 4, lineWidth: 1, lineColor: BORDE }] },
  ];
}

/** Pie de cada hoja: quién generó el documento y cuándo. */
function pie(usuario: string) {
  const expedicion = `${moment().format('YYYY-MM-DD')} ${moment().format('H:mm:ss')}`;
  return (pagina: number, total: number) => ({
    margin: [25, 10, 25, 0],
    fontSize: 7,
    color: TEXTO_SECUNDARIO,
    columns: [
      { text: `Documento generado por ${usuario ?? ''}` },
      { text: `Expedición ${expedicion}`, alignment: 'center' },
      { text: `${pagina} de ${total}`, alignment: 'right' },
    ],
  });
}

/** Contenido de la OT en una hoja; solo los procesos por los que pasa. */
function contenido(d: any): any[] {
  const procesos = procesosOT(d);
  const ficha: Partial<FichaComplementariaItem> = d.fichaComplementaria ?? {};

  // Información de la orden en una sola tabla, por secciones: cliente e item juntos (lo que más se consulta)
  // y debajo, lado a lado, cantidades y fechas. El id del cliente no se muestra.
  const subtitulo = (texto: string, colSpan: number) => ({ text: texto, colSpan, bold: true, fillColor: GRIS_SUAVE });
  const informacion = {
    margin: [0, 0, 0, SEPARACION],
    table: {
      widths: [92, '*', 92, '*'],
      dontBreakRows: true,
      body: [
        filaTitulo('Información de la orden', 4),
        [subtitulo('Cliente e item', 4), ...vacias(3)],
        [etiqueta('Cliente'), { text: txt(d.cliente), colSpan: 3 }, ...vacias(2)],
        [etiqueta('Item'), { text: `${txt(d.id_Producto)} - ${txt(d.producto)}`, colSpan: 3, bold: true }, ...vacias(2)],
        [etiqueta('Material'), { text: txt(d.material), colSpan: 3 }, ...vacias(2)],
        [subtitulo('Cantidades', 2), {}, subtitulo('Fechas', 2), {}],
        [etiqueta('Cant. bolsas'), num(d.cantidad_Pedida), etiqueta('Fecha creación'), fecha(d.fecha_Creacion)],
        [etiqueta('Cant. kilos (Kg)'), num(d.peso_Neto), etiqueta('Fecha entrega'), fecha(d.fecha_Entrega)],
        [etiqueta('Presentación'), txt(d.presentacion), {}, {}],
      ],
    },
    layout: layout(),
  };

  const grafilado = d.extrusion_Grafilado === true ? 'SÍ' : d.extrusion_Grafilado === false ? 'NO' : 'NO APLICA';
  const extrusion = {
    titulo: 'Extrusión',
    pares: [
      ['Pigmento', txt(d.pigmento_Extrusion)],
      ['Formato', txt(d.formato_Extrusin)],
      ['Ancho', `${num(d.ancho1_Extrusion)} + ${num(d.ancho2_Extrusion)} + ${num(d.ancho3_Extrusion)}`],
      ['Unidad medida', txt(d.und_Extrusion)],
      ['Calibre', num(d.calibre_Extrusion)],
      ['Peso MT (Min/Max)', num(d.peso_Extrusion)],
      ['Tratado caras', txt(d.tratado)],
      ['Grafilado', grafilado],
    ] as Par[],
  };

  const tipo = txt(d.tipo_Impresion);
  // Las tintas van en una sola fila (solo las usadas) para que la impresión no sea más alta que la extrusión.
  const tintas = [1, 2, 3, 4, 5, 6, 7, 8]
    .map(n => ({ n, tinta: txt(d[`tinta${n}`]) }))
    .filter(t => !sinDato(t.tinta))
    .map(t => `${t.n}. ${t.tinta}`)
    .join('   ');
  const impresion = {
    titulo: 'Impresión',
    pares: [
      ['Tipo impresión', sinDato(tipo) ? 'FLEXOGRAFIA' : tipo],
      ['Hacer cyrel', d.cyrel == true || d.cyrel == '1' ? 'SÍ' : 'NO'],
      ['Rodillo N°', txt(d.rodillo)],
      ['N° de pista', txt(d.pista)],
      ['Tintas', tintas || 'Sin tintas'],
      ['Código de barras', txt(ficha.codigoBarras)],
      ['Repeticiones', txt(ficha.repeticiones)],
    ] as Par[],
  };

  return [
    informacion,
    tablaMezcla(d),
    enFila([...(procesos.extrusion ? [extrusion] : []), ...(procesos.impresion ? [impresion] : [])]),
    procesos.laminado ? tablaLaminado(d) : null,
    procesos.productoTerminado ? tablaProductoTerminado(d, ficha) : null,
    tablaObservaciones(d, procesos),
  ].filter(Boolean);
}

/**
 * Definición pdfmake del formato 2 de la OT.
 * @param datos_ot Fila de la OT (Plasticaribe o BagPro) ya complementada con la ficha del item.
 * @param usuario Nombre que sale en el pie como quien generó el documento.
 */
export function definicionPdfOrdenTrabajoV2(datos_ot: any, usuario: string): any {
  return {
    info: { title: `OT ${txt(datos_ot.numero_Orden)}` },
    pageSize: 'LETTER',
    pageOrientation: 'portrait',
    pageMargins: [25, MARGEN_SUPERIOR, 25, 35],
    watermark: { text: 'PLASTICARIBE SAS', color: 'red', opacity: 0.02, bold: true, italics: false },
    header: cabecera(datos_ot),
    footer: pie(usuario),
    content: contenido(datos_ot),
    defaultStyle: { fontSize: 9.5 },
  };
}
