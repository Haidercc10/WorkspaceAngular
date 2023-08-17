import { PrimeIcons, MenuItem } from 'primeng/api'
export let iconos : MenuItem[];
export let imagenes : any = [];

iconos = [
  {label: 'Alinear al centro',  icon : PrimeIcons.ALIGN_CENTER },
  {label: 'Alinear justificar',  icon : PrimeIcons.ALIGN_JUSTIFY },
  {label: 'Alinear a la izquierda',  icon : PrimeIcons.ALIGN_LEFT },
  {label: 'Alinear a la derecha',  icon : PrimeIcons.ALIGN_RIGHT },
  {label: 'Amazonas',  icon : PrimeIcons.AMAZON },
  {label: 'Androide',  icon : PrimeIcons.ANDROID },
  {label: 'Angulo doble hacia abajo',  icon : PrimeIcons.ANGLE_DOUBLE_DOWN },
  {label: 'Angulo doble izquierdo',  icon : PrimeIcons.ANGLE_DOUBLE_LEFT },
  {label: 'Angulo doble derecho',  icon : PrimeIcons.ANGLE_DOUBLE_RIGHT },
  {label: 'Angulo doble hacia arriba',  icon : PrimeIcons.ANGLE_DOUBLE_UP },
  {label: 'Angulo hacia abajo',  icon : PrimeIcons.ANGLE_DOWN },
  {label: 'Angulo izquierdo',  icon : PrimeIcons.ANGLE_LEFT },
  {label: 'Angulo derecho',  icon : PrimeIcons.ANGLE_RIGHT },
  {label: 'Angulo hacia arriba',  icon : PrimeIcons.ANGLE_UP },
  {label: 'Manzana',  icon : PrimeIcons.APPLE },
  {label: 'Flechas alt',  icon : PrimeIcons.ARROWS_ALT },
  {label: 'Flecha círculo abajo',  icon : PrimeIcons.ARROW_CIRCLE_DOWN },
  {label: 'Flecha círculo izquierda',  icon : PrimeIcons.ARROW_CIRCLE_LEFT },
  {label: 'Flecha círculo derecha',  icon : PrimeIcons.ARROW_CIRCLE_RIGHT },
  {label: 'Fírculo de flecha arriba',  icon : PrimeIcons.ARROW_CIRCLE_UP },
  {label: 'Flecha abajo',  icon : PrimeIcons.ARROW_DOWN },
  {label: 'Flecha abajo izquierda',  icon : PrimeIcons.ARROW_DOWN_LEFT },
  {label: 'Flecha abajo derecha',  icon : PrimeIcons.ARROW_DOWN_RIGHT },
  {label: 'Flecha h',  icon : PrimeIcons.ARROW_H },
  {label: 'Flecha izquierda',  icon : PrimeIcons.ARROW_LEFT },
  {label: 'Flecha derecha',  icon : PrimeIcons.ARROW_RIGHT },
  {label: 'Flecha derecha flecha izquierda',  icon : PrimeIcons.ARROW_RIGHT_ARROW_LEFT },
  {label: 'Flecha arriba',  icon : PrimeIcons.ARROW_UP },
  {label: 'Flecha arriba izquierda',  icon : PrimeIcons.ARROW_UP_LEFT },
  {label: 'Flecha arriba a la derecha',  icon : PrimeIcons.ARROW_UP_RIGHT },
  {label: 'Flecha v',  icon : PrimeIcons.ARROW_V },
  {label: 'En',  icon : PrimeIcons.AT },
  {label: 'Hacia atrás',  icon : PrimeIcons.BACKWARD },
  {label: 'Prohibición',  icon : PrimeIcons.BAN },
  {label: 'Barras',  icon : PrimeIcons.BARS },
  {label: 'Campana',  icon : PrimeIcons.BELL },
  {label: 'Bitcoin',  icon : PrimeIcons.BITCOIN },
  {label: 'Tornillo',  icon : PrimeIcons.BOLT },
  {label: 'Libro',  icon : PrimeIcons.BOOK },
  {label: 'Marcador',  icon : PrimeIcons.BOOKMARK },
  {label: 'Llenar marcador',  icon : PrimeIcons.BOOKMARK_FILL },
  {label: 'Caja',  icon : PrimeIcons.BOX },
  {label: 'Maletín',  icon : PrimeIcons.BRIEFCASE },
  {label: 'Edificio',  icon : PrimeIcons.BUILDING },
  {label: 'Calculadora',  icon : PrimeIcons.CALCULATOR },
  {label: 'Calendario',  icon : PrimeIcons.CALENDAR },
  {label: 'Menos calendario',  icon : PrimeIcons.CALENDAR_MINUS },
  {label: 'Calendario más',  icon : PrimeIcons.CALENDAR_PLUS },
  {label: 'Horarios del calendario',  icon : PrimeIcons.CALENDAR_TIMES },
  {label: 'Cámara',  icon : PrimeIcons.CAMERA },
  {label: 'Auto',  icon : PrimeIcons.CAR },
  {label: 'Careta abajo',  icon : PrimeIcons.CARET_DOWN },
  {label: 'Careta izquierda',  icon : PrimeIcons.CARET_LEFT },
  {label: 'Careta a la derecha',  icon : PrimeIcons.CARET_RIGHT },
  {label: 'Cuidado arriba',  icon : PrimeIcons.CARET_UP },
  {label: 'Carrito más',  icon : PrimeIcons.CART_PLUS },
  {label: 'Barra gráfica',  icon : PrimeIcons.CHART_BAR },
  {label: 'Línea del carta',  icon : PrimeIcons.CHART_LINE },
  {label: 'Gráfico circular',  icon : PrimeIcons.CHART_PIE },
  {label: 'Check',  icon : PrimeIcons.CHECK },
  {label: 'Círculo de comprobación',  icon : PrimeIcons.CHECK_CIRCLE },
  {label: 'Ver cuadrado',  icon : PrimeIcons.CHECK_SQUARE },
  {label: 'Círculo de chevron hacia abajo',  icon : PrimeIcons.CHEVRON_CIRCLE_DOWN },
  {label: 'Círculo chevron izquierdo',  icon : PrimeIcons.CHEVRON_CIRCLE_LEFT },
  {label: 'Círculo de chevron a la derecha',  icon : PrimeIcons.CHEVRON_CIRCLE_RIGHT },
  {label: 'Círculo de chevron hacia arriba',  icon : PrimeIcons.CHEVRON_CIRCLE_UP },
  {label: 'Chevron abajo',  icon : PrimeIcons.CHEVRON_DOWN },
  {label: 'Chevron izquierdo',  icon : PrimeIcons.CHEVRON_LEFT },
  {label: 'Chevron derecho',  icon : PrimeIcons.CHEVRON_RIGHT },
  {label: 'Chevron arriba',  icon : PrimeIcons.CHEVRON_UP },
  {label: 'Círculo',  icon : PrimeIcons.CIRCLE },
  {label: 'Llenar círculo',  icon : PrimeIcons.CIRCLE_FILL },
  {label: 'Reloj',  icon : PrimeIcons.CLOCK },
  {label: 'Clon',  icon : PrimeIcons.CLONE },
  {label: 'nube',  icon : PrimeIcons.CLOUD },
  {label: 'Descarga en la nube',  icon : PrimeIcons.CLOUD_DOWNLOAD },
  {label: 'Carga en la nube',  icon : PrimeIcons.CLOUD_UPLOAD },
  {label: 'Código',  icon : PrimeIcons.CODE },
  {label: 'Diente',  icon : PrimeIcons.COG },
  {label: 'Comentario',  icon : PrimeIcons.COMMENT },
  {label: 'Comentarios',  icon : PrimeIcons.COMMENTS },
  {label: 'Brújula',  icon : PrimeIcons.COMPASS },
  {label: 'Copiar',  icon : PrimeIcons.COPY },
  {label: 'Tarjeta de crédito',  icon : PrimeIcons.CREDIT_CARD },
  {label: 'Base de datos',  icon : PrimeIcons.DATABASE },
  {label: 'Eliminar izquierda',  icon : PrimeIcons.DELETE_LEFT },
  {label: 'Escritorio',  icon : PrimeIcons.DESKTOP },
  {label: 'Direcciones',  icon : PrimeIcons.DIRECTIONS },
  {label: 'Direcciones alternativas',  icon : PrimeIcons.DIRECTIONS_ALT },
  {label: 'Discordia',  icon : PrimeIcons.DISCORD },
  {label: 'Dólar',  icon : PrimeIcons.DOLLAR },
  {label: 'Descargar',  icon : PrimeIcons.DOWNLOAD },
  {label: 'Expulsar',  icon : PrimeIcons.EJECT },
  {label: 'Elipsis h',  icon : PrimeIcons.ELLIPSIS_H },
  {label: 'Elipsis v',  icon : PrimeIcons.ELLIPSIS_V },
  {label: 'Sobre',  icon : PrimeIcons.ENVELOPE },
  {label: 'Borrador',  icon : PrimeIcons.ERASER },
  {label: 'Euro',  icon : PrimeIcons.EURO },
  {label: 'Círculo de exclamación',  icon : PrimeIcons.EXCLAMATION_CIRCLE },
  {label: 'Triángulo de exclamación',  icon : PrimeIcons.EXCLAMATION_TRIANGLE },
  {label: 'Enlace externo',  icon : PrimeIcons.EXTERNAL_LINK },
  {label: 'Ojo',  icon : PrimeIcons.EYE },
  {label: 'corte de ojo',  icon : PrimeIcons.EYE_SLASH },
  {label: 'Facebook',  icon : PrimeIcons.FACEBOOK },
  {label: 'Rápido hacia atrás',  icon : PrimeIcons.FAST_BACKWARD },
  {label: 'Avance rápido',  icon : PrimeIcons.FAST_FORWARD },
  {label: 'Archivo',  icon : PrimeIcons.FILE },
  {label: 'Archivo de edición',  icon : PrimeIcons.FILE_EDIT },
  {label: 'Archivo excel',  icon : PrimeIcons.FILE_EXCEL },
  {label: 'Exportación de archivos',  icon : PrimeIcons.FILE_EXPORT },
  {label: 'Importación de archivos',  icon : PrimeIcons.FILE_IMPORT },
  {label: 'Archivo pdf',  icon : PrimeIcons.FILE_PDF },
  {label: 'Palabra de archivo',  icon : PrimeIcons.FILE_WORD },
  {label: 'Filtrar',  icon : PrimeIcons.FILTER },
  {label: 'Llenado de filtro',  icon : PrimeIcons.FILTER_FILL },
  {label: 'Barra de filtro',  icon : PrimeIcons.FILTER_SLASH },
  {label: 'Bandera',  icon : PrimeIcons.FLAG },
  {label: 'Relleno de bandera',  icon : PrimeIcons.FLAG_FILL },
  {label: 'Carpeta',  icon : PrimeIcons.FOLDER },
  {label: 'Carpeta abierta',  icon : PrimeIcons.FOLDER_OPEN },
  {label: 'Adelante',  icon : PrimeIcons.FORWARD },
  {label: 'Regalo',  icon : PrimeIcons.GIFT },
  {label: 'Github',  icon : PrimeIcons.GITHUB },
  {label: 'Globo',  icon : PrimeIcons.GLOBE },
  {label: 'Google',  icon : PrimeIcons.GOOGLE },
  {label: 'Hashtag',  icon : PrimeIcons.HASHTAG },
  {label: 'Corazón',  icon : PrimeIcons.HEART },
  {label: 'Llenar corazon',  icon : PrimeIcons.HEART_FILL },
  {label: 'Historia',  icon : PrimeIcons.HISTORY },
  {label: 'Hogar',  icon : PrimeIcons.HOME },
  {label: 'Reloj de arena',  icon : PrimeIcons.HOURGLASS },
  {label: 'Tarjeta de identificación',  icon : PrimeIcons.ID_CARD },
  {label: 'Imagen',  icon : PrimeIcons.IMAGE },
  {label: 'Imágenes',  icon : PrimeIcons.IMAGES },
  {label: 'Bandeja de entrada',  icon : PrimeIcons.INBOX },
  {label: 'Información',  icon : PrimeIcons.INFO },
  {label: 'Círculo de información',  icon : PrimeIcons.INFO_CIRCLE },
  {label: 'Instagram',  icon : PrimeIcons.INSTAGRAM },
  {label: 'Llave',  icon : PrimeIcons.KEY },
  {label: 'Idioma',  icon : PrimeIcons.LANGUAGE },
  {label: 'Enlace',  icon : PrimeIcons.LINK },
  {label: 'Linkedin',  icon : PrimeIcons.LINKEDIN },
  {label: 'Lista',  icon : PrimeIcons.LIST },
  {label: 'Cerrar con llave',  icon : PrimeIcons.LOCK },
  {label: 'Bloqueo abierto',  icon : PrimeIcons.LOCK_OPEN },
  {label: 'Mapa',  icon : PrimeIcons.MAP },
  {label: 'Marcador de mapa',  icon : PrimeIcons.MAP_MARKER },
  {label: 'Megáfono',  icon : PrimeIcons.MEGAPHONE },
  {label: 'Micrófono',  icon : PrimeIcons.MICROPHONE },
  {label: 'Microsoft',  icon : PrimeIcons.MICROSOFT },
  {label: 'Menos',  icon : PrimeIcons.MINUS },
  {label: 'Círculo menos',  icon : PrimeIcons.MINUS_CIRCLE },
  {label: 'Móvil',  icon : PrimeIcons.MOBILE },
  {label: 'Factura de dinero',  icon : PrimeIcons.MONEY_BILL },
  {label: 'Luna',  icon : PrimeIcons.MOON },
  {label: 'Paleta',  icon : PrimeIcons.PALETTE },
  {label: 'Clip de papel',  icon : PrimeIcons.PAPERCLIP },
  {label: 'Pausa',  icon : PrimeIcons.PAUSE },
  {label: 'Paypal',  icon : PrimeIcons.PAYPAL },
  {label: 'Lápiz',  icon : PrimeIcons.PENCIL },
  {label: 'Porcentaje',  icon : PrimeIcons.PERCENTAGE },
  {label: 'Teléfono',  icon : PrimeIcons.PHONE },
  {label: 'Jugar',  icon : PrimeIcons.PLAY },
  {label: 'Más',  icon : PrimeIcons.PLUS },
  {label: 'Círculo más',  icon : PrimeIcons.PLUS_CIRCLE },
  {label: 'Libra',  icon : PrimeIcons.POUND },
  {label: 'Apagado',  icon : PrimeIcons.POWER_OFF },
  {label: 'Principal',  icon : PrimeIcons.PRIME },
  {label: 'Imprimir',  icon : PrimeIcons.PRINT },
  {label: 'Código qr',  icon : PrimeIcons.QRCODE },
  {label: 'Pregunta',  icon : PrimeIcons.QUESTION },
  {label: 'Círculo de preguntas',  icon : PrimeIcons.QUESTION_CIRCLE },
  {label: 'Reddit',  icon : PrimeIcons.REDDIT },
  {label: 'Actualizar',  icon : PrimeIcons.REFRESH },
  {label: 'Repetición',  icon : PrimeIcons.REPLAY },
  {label: 'Responder',  icon : PrimeIcons.REPLY },
  {label: 'Ahorrar',  icon : PrimeIcons.SAVE },
  {label: 'Buscar',  icon : PrimeIcons.SEARCH },
  {label: 'Buscar menos',  icon : PrimeIcons.SEARCH_MINUS },
  {label: 'Búsqueda más',  icon : PrimeIcons.SEARCH_PLUS },
  {label: 'Enviar',  icon : PrimeIcons.SEND },
  {label: 'Servidor',  icon : PrimeIcons.SERVER },
  {label: 'Compartir alt',  icon : PrimeIcons.SHARE_ALT },
  {label: 'Blindaje',  icon : PrimeIcons.SHIELD },
  {label: 'Bolsa de la compra',  icon : PrimeIcons.SHOPPING_BAG },
  {label: 'Carro de la compra',  icon : PrimeIcons.SHOPPING_CART },
  {label: 'Iniciar sesión',  icon : PrimeIcons.SIGN_IN },
  {label: 'Desconectar',  icon : PrimeIcons.SIGN_OUT },
  {label: 'Mapa del sitio',  icon : PrimeIcons.SITEMAP },
  {label: 'Flojo',  icon : PrimeIcons.SLACK },
  {label: 'Deslizadores h',  icon : PrimeIcons.SLIDERS_H },
  {label: 'Deslizadores v',  icon : PrimeIcons.SLIDERS_V },
  {label: 'Clasificar',  icon : PrimeIcons.SORT },
  {label: 'Ordenar alfa alt abajo',  icon : PrimeIcons.SORT_ALPHA_ALT_DOWN },
  {label: 'Ordenar alfa alt arriba',  icon : PrimeIcons.SORT_ALPHA_ALT_UP },
  {label: 'Ordenar alfa hacia abajo',  icon : PrimeIcons.SORT_ALPHA_DOWN },
  {label: 'Ordenar alfa hacia arriba',  icon : PrimeIcons.SORT_ALPHA_UP },
  {label: 'Ordenar alt',  icon : PrimeIcons.SORT_ALT },
  {label: 'Ordenar alt barra',  icon : PrimeIcons.SORT_ALT_SLASH },
  {label: 'Ordenar cantidad hacia abajo',  icon : PrimeIcons.SORT_AMOUNT_DOWN},
  { label: 'Ordenar cantidad abajo alt', icon : PrimeIcons.SORT_AMOUNT_DOWN_ALT },
  { label: 'Ordenar cantidad arriba', icon : PrimeIcons.SORT_AMOUNT_UP },
  { label: 'Ordenar cantidad arriba alt', icon : PrimeIcons.SORT_AMOUNT_UP_ALT },
  { label: 'Ordenar', icon : PrimeIcons.SORT_DOWN },
  { label: 'Ordenar numérica abajo', icon : PrimeIcons.SORT_NUMERIC_DOWN },
  { label: 'Ordenar numérico abajo alt', icon : PrimeIcons.SORT_NUMERIC_ALT_DOWN },
  { label: 'Ordenar numéricamente', icon : PrimeIcons.SORT_NUMERIC_UP },
  { label: 'Ordenar numérico arriba alt', icon : PrimeIcons.SORT_NUMERIC_ALT_UP },
  { label: 'Ordenar', icon : PrimeIcons.SORT_UP },
  { label: 'Hilandero', icon : PrimeIcons.SPINNER },
  { label: 'Estrella', icon : PrimeIcons.STAR },
  { label: 'Relleno de estrellas', icon : PrimeIcons.STAR_FILL },
  { label: 'Paso atrás', icon : PrimeIcons.STEP_BACKWARD },
  { label: 'Paso atrás alt', icon : PrimeIcons.STEP_BACKWARD_ALT },
  { label: 'Un paso adelante', icon : PrimeIcons.STEP_FORWARD },
  { label: 'Paso adelante alt', icon : PrimeIcons.STEP_FORWARD_ALT },
  { label: 'Detener', icon : PrimeIcons.STOP },
  { label: 'Círculo de parada', icon : PrimeIcons.STOP_CIRCLE },
  { label: 'Cronógrafo', icon : PrimeIcons.STOPWATCH },
  { label: 'Sol', icon : PrimeIcons.SUN },
  { label: 'Sincronizar', icon : PrimeIcons.SYNC },
  { label: 'Mesa', icon : PrimeIcons.TABLE },
  { label: 'Tableta', icon : PrimeIcons.TABLET },
  { label: 'Etiqueta', icon : PrimeIcons.TAG },
  { label: 'Etiquetas', icon : PrimeIcons.TAGS },
  { label: 'Telegrama', icon : PrimeIcons.TELEGRAM },
  { label: 'Th grande', icon : PrimeIcons.TH_LARGE },
  { label: 'Pulgares abajo', icon : PrimeIcons.THUMBS_DOWN },
  { label: 'Pulgar abajo llenar', icon : PrimeIcons.THUMBS_DOWN_FILL },
  { label: 'Pulgares hacia arriba', icon : PrimeIcons.THUMBS_UP },
  { label: 'Pulgar arriba llenar', icon : PrimeIcons.THUMBS_UP_FILL },
  { label: 'Boleto', icon : PrimeIcons.TICKET },
  { label: 'Veces', icon : PrimeIcons.TIMES },
  { label: 'Tiempos círculo', icon : PrimeIcons.TIMES_CIRCLE },
  { label: 'Basura', icon : PrimeIcons.TRASH },
  { label: 'Camión', icon : PrimeIcons.TRUCK },
  { label: 'Gorjeo', icon : PrimeIcons.TWITTER },
  { label: 'Deshacer', icon : PrimeIcons.UNDO },
  { label: 'Desbloquear', icon : PrimeIcons.UNLOCK },
  { label: 'Subir', icon : PrimeIcons.UPLOAD },
  { label: 'Usuario', icon : PrimeIcons.USER },
  { label: 'Edición de usuario', icon : PrimeIcons.USER_EDIT },
  { label: 'Usuario menos', icon : PrimeIcons.USER_MINUS },
  { label: 'Usuario plus', icon : PrimeIcons.USER_PLUS },
  { label: 'Usuarios', icon : PrimeIcons.USERS },
  { label: 'Verificado', icon : PrimeIcons.VERIFIED },
  { label: 'Video', icon : PrimeIcons.VIDEO },
  { label: 'Vimeo', icon : PrimeIcons.VIMEO },
  { label: 'Bajar volumen', icon : PrimeIcons.VOLUME_DOWN },
  { label: 'Volumen apagado', icon : PrimeIcons.VOLUME_OFF },
  { label: 'Sube el volumen', icon : PrimeIcons.VOLUME_UP },
  { label: 'Billetera', icon : PrimeIcons.WALLET },
  { label: 'Whatsapp', icon : PrimeIcons.WHATSAPP },
  { label: 'Wifi', icon : PrimeIcons.WIFI },
  { label: 'Ventana maximizar', icon : PrimeIcons.WINDOW_MAXIMIZE },
  { label: 'Minimizar ventana', icon : PrimeIcons.WINDOW_MINIMIZE },
  { label: 'Llave inglesa', icon : PrimeIcons.WRENCH },
  { label: 'Youtube', icon : PrimeIcons.YOUTUBE },
];

imagenes = [
  {nombre : "activos.png", descripcion: 'Activos' },  
  {nombre : "factura.png", descripcion: 'Factura' }, 
  {nombre : "carpeta.png", descripcion: 'Carpeta' },  
  {nombre : "Pedidos_Zeus.png", descripcion: 'Pedidos Zeus' },
  {nombre : "devolucion.png", descripcion: 'Devolución' },  
  {nombre : "recibos.png", descripcion: 'Recibos' }, 
  {nombre : "salida.png", descripcion: 'Salida' }, 
  {nombre : "reportePedidos.png", descripcion: 'Reporte Pedidos' },
  {nombre : "pedido_mantenimiento.png", descripcion: 'Pedido Mtto.' },  
  {nombre : "caja.png", descripcion: 'Caja' }, 
  {nombre : "ingresar.png", descripcion: 'Ingresar' }, 
  {nombre : "cronologia.png", descripcion: 'Cronologia' },
  {nombre : "verDocumento.png", descripcion: 'Ver Doc.' }, 
  {nombre : "GestionTickets.png", descripcion: 'Gestión Tickets' }, 
  {nombre : "costos.png", descripcion: 'Costos' },  
  {nombre : "usuarios.png", descripcion: 'Usuarios' },
  {nombre : "advertencia.png", descripcion: 'Advertencia' },  
  {nombre : "recuperado.png", descripcion: 'Recuperado' }, 
  {nombre : "Tickets.png", descripcion: 'Tickets' }, 
  {nombre : "Entrega_Mercancia.png", descripcion: 'Entrega' },
  {nombre : "eliminar.png", descripcion: 'Eliminar' },  
  {nombre : "calcular_Costos.png", descripcion: 'Calcular Costos' }, 
  {nombre : "Mantenimiento.png", descripcion: 'Mantenimiento' }, 
  {nombre : "home.png", descripcion: 'Casa' },
  {nombre : "pedidos.png", descripcion: 'Pedidos' },  
  {nombre : "reporteEliminados.png", descripcion: 'Reporte Eliminados' }, 
  {nombre : "tinta.png", descripcion: 'Tinta' }, 
  {nombre : "materiaPrima.png", descripcion: 'Materia Prima' },
  {nombre : "bodega.png", descripcion: 'Bodega' },  
  {nombre : "camion.png", descripcion: 'Camión' }, 
  {nombre : "crearOrden.png", descripcion: 'Crear Orden' },
];
