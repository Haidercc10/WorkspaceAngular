# Mapa de integraciones Angular → APIs

> Alcance de verificación: las entradas de abajo son llamadas identificadas en código Angular y cotejadas con atributos de ruta y acciones de controladores. **La tabla es una muestra verificada, no el mapa completo de servicios ni de endpoints del sistema.** La verificación es estática; no se ejecutaron llamadas HTTP.

## Bases URL

En [environment.ts](../Proyecto/ProyectoPlasticaribe/src/environments/environment.ts), Angular declara estas propiedades bajo el sufijo base `/api`:

| Propiedad usada por Angular | API que se cotejó | Desarrollo |
|---|---|---|
| `rutaPlasticaribeAPI` | PlasticaribeWebAPI | Host de `window.location.hostname`, puerto `9090` |
| `rutaZeus` | ZeusInventarioAPI | Host de `window.location.hostname`, puerto `9091` |
| `rutaZeusContabilidad` | ZeusContabilidadAPI | Host de `window.location.hostname`, puerto `9092` |
| `rutaBagPro` | BagPro_WebApi | Host de `window.location.hostname`, puerto `9093` |

El mismo archivo contiene referencias comentadas a entornos alternativos. [environment.prod.ts](../Proyecto/ProyectoPlasticaribe/src/environments/environment.prod.ts) configura otros puertos para las APIs en un host de red fijo; se omite aquí el host literal para no propagar direcciones internas. El reemplazo de archivo de producción está declarado en [angular.json](../Proyecto/ProyectoPlasticaribe/angular.json).

## Llamadas cotejadas

Las rutas abajo son relativas a la base terminada en `/api`. `[controller]` se sustituye por el nombre del controlador sin el sufijo `Controller`.

| Integración | Servicio Angular y método | HTTP y endpoint | Controller y acción de destino | DTO o modelo relacionado | Evidencia y estado |
|---|---|---|---|---|---|
| Plasticaribe: lista de clientes | [ClientesService](../Proyecto/ProyectoPlasticaribe/src/app/Servicios/Clientes/clientes.service.ts), `srvObtenerLista` | `GET /Clientes` | [ClientesController](../../PlasticaribeWebAPI/PlasticaribeAPI/Controllers/ClientesController.cs), `GetClientes()` (`[HttpGet]`, responde `IEnumerable<Clientes>`) | Entidad `PlasticaribeAPI.Models.Clientes`, usada como tipo de respuesta en la acción. No hay DTO Angular explícito en este método (`any[]`). | La base `rutaPlasticaribeAPI` y `/Clientes` aparecen en el servicio; el controlador declara `api/[controller]` y `[HttpGet]`. **Verificado estáticamente.** |
| Plasticaribe: clientes del Reporte de Procesos OT | [ClientesService](../Proyecto/ProyectoPlasticaribe/src/app/Servicios/Clientes/clientes.service.ts), `srvObtenerResumenReporteOT`; consumidor: [Reporte_Procesos_OTComponent](../Proyecto/ProyectoPlasticaribe/src/app/Vistas/Reporte_Procesos_OT/Reporte_Procesos_OT.component.ts), `obtenerClientes()` | `GET /Clientes/resumenReporteOT` | [ClientesController](../../PlasticaribeWebAPI/PlasticaribeAPI/Controllers/ClientesController.cs), `GetClientesResumenReporteOT()` (`[HttpGet("resumenReporteOT")]`) | API `ClienteReporteOTDto`; Angular [modelClienteReporteOT](../Proyecto/ProyectoPlasticaribe/src/app/Modelo/modelClienteReporteOT.ts). Campos: `Cli_Id`, `Cli_Nombre`, `usua_Id`. | La acción proyecta esos tres campos con `AsNoTracking()`; el componente consume el nuevo método. El endpoint está cubierto por prueba aislada del controlador. **Verificado estáticamente y mediante prueba automatizada; no se llamó al servidor.** |
| Plasticaribe: alta de cliente | [ClientesService](../Proyecto/ProyectoPlasticaribe/src/app/Servicios/Clientes/clientes.service.ts), `srvGuardar` | `POST /Clientes` | [ClientesController](../../PlasticaribeWebAPI/PlasticaribeAPI/Controllers/ClientesController.cs), `PostClientes(Clientes clientes)` (`[HttpPost]`) | El servicio recibe `modelCliente`, definido en [modelCliente.ts](../Proyecto/ProyectoPlasticaribe/src/app/Modelo/modelCliente.ts); la API enlaza el cuerpo a la entidad `Clientes`. La correspondencia de campos/contrato no se verificó campo por campo. | El método Angular llama `http.post` con `data`; la acción del controller recibe `Clientes`. **Verificado estáticamente; contrato detallado pendiente.** |
| BagPro: producción de sellado por OT | [BagproService](../Proyecto/ProyectoPlasticaribe/src/app/Servicios/BagPro/Bagpro.service.ts), `srvObtenerListaProcSelladoOT` | `GET /ProcSellado/OT/{ot}` | [ProcSelladoController](../../BagPro_WebApi/Controllers/ProcSelladoController.cs), `GetOT(string ot)` (`[HttpGet("OT/{ot}")]`) | Consulta la entidad `ProcSellado` y agrupa resultados; la acción proyecta campos agregados, no se identificó un DTO dedicado. | Coinciden el sufijo del servicio y el atributo de ruta. La entidad está expuesta por `plasticaribeContext.ProcSellados`. **Verificado estáticamente.** |
| Zeus Inventario: búsqueda de artículos por nombre | [InventarioZeusService](../Proyecto/ProyectoPlasticaribe/src/app/Servicios/InventarioZeus/inventario-zeus.service.ts), `GetItemsByName` | `GET /Articulos/getItemsByName/{name}` | [ArticulosController](../../ZeusInventarioAPI/ZeusInventarioWebAPI/Controllers/ArticulosController.cs), `GetItemsByName(string name)` (`[HttpGet("getItemsByName/{name}")]`) | Consulta `Articulo` y devuelve una proyección anónima con `Codigo` y `Nombre`; no se identificó un DTO explícito. | `rutaZeus` se usa para formar la llamada; ruta y acción coinciden. **Verificado estáticamente.** |
| Zeus Inventario: existencias de artículos | [InventarioZeusService](../Proyecto/ProyectoPlasticaribe/src/app/Servicios/InventarioZeus/inventario-zeus.service.ts), `srvObtenerExistenciasArticulosZeus` | `GET /existencias/BusquedaCodigoArticulo` | [ExistenciasController](../../ZeusInventarioAPI/ZeusInventarioWebAPI/Controllers/ExistenciasController.cs), acción GET marcada `[HttpGet("BusquedaCodigoArticulo")]` | Consulta `Existencia` y su navegación `ArticuloNavigation`; devuelve una proyección de campos de artículo y existencias, no se identificó un DTO explícito. | Coinciden la URL del servicio y el atributo de ruta del controlador. **Verificado estáticamente.** |
| Zeus Contabilidad: cartera de cliente | [ZeusContabilidadService](../Proyecto/ProyectoPlasticaribe/src/app/Servicios/Zeus_Contabilidad/zeusContabilidad.service.ts), `GetCarteraClientes(id)` | `GET /FacturasBU/getCarteraClientes/{cliente}` | [FacturasBUController](../../ZeusContabilidadAPI/Controllers/FacturasBUController.cs), `GetCarteraClientes(string cliente)` (`[HttpGet("getCarteraClientes/{cliente}")]`) | La consulta usa `Cliente`, `FacturasBu` y `Maevende`, y proyecta un objeto anónimo; no se identificó un DTO explícito. | `rutaZeusContabilidad` forma la URL y la ruta/action del controller coinciden. **Verificado estáticamente.** |

## Plasticaribe: autorizaciones de exceso de OT

La API expone `POST /AutorizacionesExcesoOT` para solicitar aprobación, `GET /AutorizacionesExcesoOT/pendientes` para listar solicitudes pendientes, `GET /AutorizacionesExcesoOT/mis-solicitudes/{ot}` para consultar las propias y `PUT /AutorizacionesExcesoOT/{id}/aprobar` o `/rechazar` para resolverlas. Aprobar y rechazar requieren la policy `ExcederLimiteOT` (roles 1 o 104); las demás acciones requieren un JWT con claim de identificador. Los estados persistidos usan la tabla `Estados`: 11 pendiente, 26 aceptado, 4 cancelado (rechazada) y 51 procesado (consumida).

La persistencia usa la entidad `AutorizacionExcesoOT` y la tabla `Autorizaciones_ExcesoOT` (columnas `AutEx_*`, `Estado_Id`, `AsigMp_Id`), con referencias a solicitante, aprobador y, cuando se consuma en T07, asignación. La migración fue aplicada por el responsable del proyecto en su base de datos. Aún no existe consumidor Angular de estos endpoints; el flujo de interfaz y el consumo atómico durante la asignación quedan pendientes de T07/T12.

## Plasticaribe: reservas informativas y solicitud de Extrusión (T06)

`GET /SolicitudesExtrusion/reservas?subcategorias=1,2` devuelve por subcategoría la existencia física (suma de `Materias_Primas` o `Tintas`), la reserva pendiente y la disponibilidad (existencia menos reserva, que puede ser negativa). La reserva no se almacena: se calcula con las solicitudes en estado 11 (pendiente) o 12 (parcial), excluyendo la solicitud genérica ID 1, como lo solicitado menos lo asignado por solicitud y subcategoría (vínculo `Asignacion_MatPrima.SolMpExt_Id`), sin valores negativos. Una solicitud libera su reserva solo al pasar a 4 (cancelada) o 5 (finalizada). Las solicitudes que estén en estado 13 quedan fuera del cálculo.

`POST /SolicitudesExtrusion` registra encabezado y detalles en una transacción, toma el usuario del claim del JWT, fija el estado 11 y obtiene fecha/hora del servidor (hora local). Si lo solicitado supera la disponibilidad responde 409 con `RequiereConfirmacion` y las advertencias; el cliente debe reenviar con `ConfirmarSaldoNegativo = true`. La reserva es informativa y no descuenta existencias. El límite de consumo por OT sigue validándose solo en Angular. Convive con el flujo actual de `POST /Solicitud_MatPrimaExtrusion` y `POST /DetSolicitud_MatPrimaExtrusion`; el consumo desde Angular (T10) está pendiente. `PUT /Solicitud_MatPrimaExtrusion/PutEstadoSolicitud/{id}` ahora asigna el estado parcial 12 (antes 13).

## Plasticaribe: consumo transaccional de inventario

`POST /InventarioTransaccional/consumir-asignacion` recibe una asignación, SKU y cantidades por lote. La API valida que coincidan con los detalles ya guardados de MP/tinta y que los lotes estén disponibles; en una transacción SQL serializable con la estrategia de reintentos de EF Core actualiza stock general, saldos y estados de lotes, y registra las salidas. El endpoint requiere autenticación. Aún no existe consumidor Angular: T07/T09 deben migrar el flujo actual, que hace esas escrituras en solicitudes HTTP separadas.

Este endpoint todavía no consume autorizaciones de T04 ni inserta encabezado/detalles de asignación dentro de la misma transacción. La atomicidad integral del flujo queda pendiente de T07. Los efectos de los triggers reales requieren validación con una base de pruebas.

## Lectura del estado

- **Verificado estáticamente** significa que la llamada, la propiedad de base usada y la ruta/acción del controlador están visibles y son compatibles en el código fuente. No implica que se haya comprobado la respuesta con el servidor real.
- Para el alta de cliente se comprobaron los tipos nominales utilizados en cada lado, pero no que todos los campos, validaciones, serialización y reglas de negocio formen un contrato completo.
- La muestra no es exhaustiva: no se recorrieron ni cotejaron todos los servicios Angular. Antes de modificar cualquier otro flujo, debe añadirse y verificar su ruta, parámetros, cuerpo, respuesta y consumidor.
