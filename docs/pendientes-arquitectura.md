# Pendientes de investigación arquitectónica

Este registro separa las dependencias demostradas de las hipótesis que aún no tienen evidencia suficiente. No se consultaron bases de datos ni se ejecutaron servicios.

## Integraciones entre APIs y datos

### Relaciones API↔API no demostradas

- **Pendiente:** localizar llamadas servidor-servidor entre PlasticaribeWebAPI, ZeusInventarioAPI y ZeusContabilidadAPI, si existen.
- **Evidencia disponible:** Angular tiene bases URL distintas para cada API; en los servicios cotejados hay llamadas directas desde Angular a sus destinos. Esto no demuestra ni descarta llamadas entre backends.
- **Preguntas:** ¿hay clientes HTTP, SOAP, colas o procesos batch entre las APIs? ¿Dónde se configuran y cuáles son sus contratos?

### Posibles dependencias entre bases de datos

- **No comprobado:** que los contextos correspondan a bases distintas, que compartan servidor, o que existan tablas/sinónimos compartidos. Los nombres de contextos y modelos no bastan para establecerlo.
- **Preguntas:** ¿qué base y esquema pertenecen a cada API? ¿Existen bases compartidas, vistas, linked servers, procedimientos almacenados o dependencias de lectura/escritura entre ellas?
- **Siguiente evidencia segura:** documentación de despliegue y diagramas de datos sanitizados. No copiar credenciales ni cadenas de conexión a esta documentación.

## Servicio SOAP de Zeus

- **Confirmado:** [ProcExtrusionController.cs](../../BagPro_WebApi/Controllers/ProcExtrusionController.cs) y [ProcSelladoController.cs](../../BagPro_WebApi/Controllers/ProcSelladoController.cs) contienen acciones `EnviarAjuste` y crean un `EndpointAddress` que termina en `wsGenericoZeus/ServiceWS.asmx`; ambos controladores importan `ServiceReference1`.
- **Pendiente:** identificar el WSDL/contrato, el servicio desplegado que atiende la dirección y el sistema/repositorio al que pertenece. No se encontró evidencia suficiente para atribuirlo a ZeusInventarioAPI ni a ZeusContabilidadAPI.
- **Preguntas:** ¿dónde vive la implementación de `ServiceReference1` y el servicio web? ¿Qué operación se invoca y qué datos intercambia? ¿Cómo se gestionan configuración por ambiente, autenticación, errores y disponibilidad?
- **Precaución documental:** no reproducir direcciones internas completas ni secretos de configuración.

## Electron

- **Pendiente:** confirmar si `WorkspaceAngular` incluye una aplicación Electron actualmente.
- **Evidencia disponible:** [AGENTS.md](../AGENTS.md) describe el repositorio como Angular y Electron, pero el [package.json de ProyectoPlasticaribe](../Proyecto/ProyectoPlasticaribe/package.json) no declara una dependencia Electron. La búsqueda de manifiestos visibles tampoco confirmó configuración de Electron.
- **Preguntas:** ¿hay un manifiesto Electron distinto, una rama/proyecto de escritorio separado o una configuración de empaquetado en otro repositorio? ¿Qué versión y flujo de compilación se utilizan?

## Nombres y rutas de repositorios

- **Confirmado en el entorno examinado:** la carpeta disponible es `ZeusInventarioAPI/ZeusInventarioWebAPI`; no había una carpeta llamada `ApiZeusInventario`.
- **Instrucciones del workspace:** [AGENTS.md](../AGENTS.md) nombra el repositorio como `ApiZeusInventario`. Esta discrepancia de alias/nombre de checkout debe aclararse para que futuras referencias y automatizaciones sean inequívocas.
- El usuario especificó `BagPro_WebApi`; el checkout accesible se llama `BagPro_WebApi`, mientras que algunas referencias de contexto usan variantes `BagPro_WebAPI` o `BagPro_WebAPI`. Acordar una denominación canónica.

## Contratos Angular ↔ API

- El [mapa de integraciones](./mapa-integraciones.md) es intencionalmente una muestra cotejada, no un inventario completo.
- **Pendiente:** recorrer el resto de servicios Angular, registrar cada método HTTP y cotejar endpoint, autorización, parámetros, cuerpo y respuesta en el backend.
- **Pendiente:** identificar consumidores de servicios, modelos/DTO compartidos y campos serializados; en los ejemplos revisados algunas respuestas son proyecciones anónimas y otras están tipadas como `any`.
- **Preguntas:** ¿hay una especificación OpenAPI vigente por ambiente? ¿Qué endpoints son consumidos fuera de Angular? ¿Hay compatibilidad entre versiones desplegadas y el cliente?

## Persistencia y ciclo de modelos

- **Clasificación disponible:** [AGENTS.md](../AGENTS.md) indica Code First para PlasticaribeWebAPI y Database First para Zeus Inventario, BagPro y Zeus Contabilidad. Los contextos, modelos y migraciones visibles son consistentes con esa guía, pero no se investigó su proceso histórico de generación.
- **Pendiente:** documentar fuentes de verdad de esquema, responsables de cambios, política de migraciones/scaffolding y diferencias entre el esquema desplegado y los modelos en cada checkout.
- No se inspeccionaron ni ejecutaron consultas, migraciones o procesos de scaffolding.

## Módulo de Órdenes de Trabajo

- **Confirmado:** las tablas `Orden_Trabajo`, `OT_Extrusion`, `OT_Impresion`, `OT_Laminado` y `OT_Sellado_Corte` declaran triggers en el `dataContext` de PlasticaribeWebAPI (`TR_CrearOTs`, `TR_ActualizarCampos_*`, `Auditoria_*`). Al guardar dentro de una transacción explícita, SQL Server informó que intentó promoverla a distribuida, lo que indica escritura por linked server (por inferencia, hacia BagPro). No se inspeccionó el código de los triggers.
- **Pendiente (API):** `GET Orden_Trabajo/getOrdenTrabajo/{orden}` hace INNER JOIN con los cuatro procesos y responde 400 cuando no hay filas; una OT sin algún proceso no se puede abrir. Evaluar LEFT JOIN y 404 revisando los demás consumidores (PDF, búsqueda).
- **Pendiente (seguridad):** el filtro por vendedor (`sales`) solo se aplica desde Angular y solo en la consulta a BagPro; la consulta a Plasticaribe no filtra por usuario. Debe validarse en el servidor con el usuario autenticado.
- **Pendiente (integridad):** el número de OT se calcula en el cliente como `UltimaOT de BagPro + 1` y `Numero_OT` no tiene índice único. `crearCompleta` responde 409 ante duplicados, pero falta índice único (previa revisión de duplicados existentes) y asignación del número en el servidor.
- **Pendiente (regla de negocio):** tras editar una OT, `cambiarEstadoProducto` hace PUT del producto completo con valores del formulario de la OT, fuera de la transacción. Confirmar si debe sobrescribir los datos maestros del producto.
- **Confirmado (búsqueda por item):** la ficha del item se carga desde BagPro `ClientesOtItem` (`GET ClientesOt/OT_Cliente_Item_Presentacion/{item}/{presentacion}`, con `?sales=` opcional) y, si no existe, desde la última OT de Plasticaribe (`getInfoUltOT`). El vendedor de la ficha se toma de `ClientesOtItem.UsrModifica`, igual que en `GetOrdenDeTrabajo`.
- **Pendiente (búsqueda por item):** confirmar que `UsrModifica` representa al vendedor del item; definir qué fila usar si hay varias por item+presentación (hoy se toma la primera); el respaldo a Plasticaribe no filtra por vendedor.
- **Confirmado (Rotograbado descontinuado):** el módulo `Orden_Trabajo` ya no ofrece el proceso Rotograbado; las OTs/items antiguos con Rotograbado se cargan como Impresión (flexografía) y al guardar se envía `Rotograbado = false`. La columna `Orden_Trabajo.Rotograbado`, el contrato de la API, BagPro (`Lamiando`) y el catálogo `Tipos_Impresion` (id 5) se conservan.
- **Pendiente (Rotograbado):** la vista antigua `ordenes-trabajo` (embebida en `opedidoproducto`) aún muestra y envía Rotograbado. Decidir si se retira la columna/campo del modelo y de los triggers hacia BagPro.
- **Preguntas:** ¿qué hace `TR_CrearOTs` cuando la OT ya existe en BagPro? ¿El linked server/MSDTC está configurado igual en todos los ambientes?

## Próximos pasos sugeridos

1. Acordar nombres canónicos y ubicación del repositorio de Zeus Inventario, así como la ubicación real de Electron.
2. Obtener diagramas de despliegue y de datos sanitizados, sin credenciales ni datos personales.
3. Localizar el contrato e implementación de `wsGenericoZeus/ServiceWS.asmx`.
4. Completar el inventario Angular→servicios→rutas→acciones por flujo funcional y verificar contratos con OpenAPI o pruebas de integración autorizadas.
5. Documentar autenticación y configuración por ambiente sin incluir secretos.
