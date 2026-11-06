# Plan de refactorización: módulo Órdenes de Trabajo (OT)

- **Fecha:** 2026-11-05
- **Base auditada:** `WorkspaceAngular` `testing/integracion` @ `d0537f36` · `PlasticaribeWebAPI` `testing/integracion` (net8 / EF Core 8.0.2) · `BagPro_WebAPI` `master` (net7 / EF Core 7.0.13, Database First)
- **Origen:** dos auditorías de solo lectura (`plasticaribe-code-reviewer`), una del frontend y otra del backend. Los hallazgos ALTO del frontend se comprobaron contra el código.
- **Ejecutor:** `plasticaribe-developer`. Este plan es multicapa: en cada fase, el ejecutor devuelve primero su plan detallado **PENDIENTE DE APROBACIÓN** antes de editar.

> Los números de línea corresponden al commit base. Se desplazan a medida que se edita: localizar siempre por el nombre del método.

---

## 0. Reglas para el ejecutor

1. Un PR por fase, o por tarea en las fases 2 y 3. No mezclar fases.
2. No ejecutar nada contra bases de datos (ni `dotnet ef database update`). Las migraciones e índices se entregan como archivo de migración o script, y **los aplica el responsable**.
3. Mantener los contratos que consume `Busqueda_OrdenesTrabajo.component.ts`: `limpiarCampos`, `consultarClientes`, `consultarInfoProducto`, `busquedaOTBagPro` y `FormOrdenTrabajo`.
4. No modificar los triggers de BD en este plan. Solo se documentan (ver F0).
5. Documentar con JSDoc o comentarios XML en español cada método nuevo o modificado.
6. Toda tarea marcada **[DECISIÓN]** queda bloqueada hasta que el responsable del proyecto responda (sección 2).

---

## 1. Archivos principales

| Capa | Archivo |
|---|---|
| Angular | `Proyecto/ProyectoPlasticaribe/src/app/Vistas/Orden_Trabajo/Orden_Trabajo.component.ts` (3722 líneas) y `.html` |
| Angular | `Servicios/OrdenTrabajo/Orden_Trabajo.service.ts`, `Servicios/BagPro/Bagpro.service.ts`, `Servicios/Mezclas*`, `Servicios/OrdenTrabajo_Sellado_Corte/*` |
| API Plasticaribe | `PlasticaribeAPI/Controllers/Orden_TrabajoController.cs`, `Service/OrdenTrabajoCompletaService.cs`, `Models/OrdenTrabajoCompletaRequest.cs` |
| API Plasticaribe | `Controllers/MezclasController.cs`, `Mezcla_MaterialController.cs`, `Mezcla_PigmentoController.cs`, `OT_SelladoCorteController.cs`, `SedesClientesController.cs`, `ClientesController.cs`, `Program.cs` |
| API BagPro | `Controllers/ClientesOtController.cs`, `Data/plasticaribeContext.cs` |

---

## 2. Decisiones de negocio pendientes (responsable del proyecto)

| ID | Pregunta | Respuesta (2026-11-06) | Efecto |
|---|---|---|---|
| D1 | Presentación **Und**: ¿`ValorOT` es siempre `Cantidad × Precio`? | **Sí.** | F1-04: `ValorOT = Cant × PrecioUnd` siempre. El peso solo afecta a `valorKg`. Se elimina el forzado a 0 o a 1. |
| D2 | ¿Qué tipos (`LAMINADO`, `HOJA`) usan PesoMillar ÷ 2, y en qué presentaciones? | **Por confirmar.** | F1-04 **no se bloquea**: se conserva la regla actual (÷2 para LAMINADO/HOJA), pero calculada en una variable local, sin modificar `ArrayProducto`, y aplicada igual en todas las presentaciones. Cuando haya respuesta, se ajusta una sola constante. |
| D3 | Roles autorizados para crear, editar y anular. | **Roles 1 y 98, por ahora.** El rol 2 (vendedor) **solo consulta sus propias OT**: no crea, no edita ni anula. | F2-04/F2-05: `CrearOT`, `EditarOT` y `AnularOT` = roles 1 y 98. Rol 2: solo lectura, filtrada por su código desde el token (F2-06). En Angular se ocultan o deshabilitan para el rol 2 los botones de crear, editar, anular y crear mezcla/material/pigmento. Es solo usabilidad: la restricción real la aplica el backend. |
| D4 | ¿Se conserva el creador al editar? | **Sí, y se agrega una columna para el último editor.** | F2-03: nuevas columnas `Ot_UsuarioModifica` (FK a `Usuarios.Usua_Id`) y `Ot_FechaModifica`. |
| D6 | Al **editar** una OT, el trigger actualiza el precio de venta y el costo del artículo en Zeus con el precio de esa OT. ¿Es lo deseado? ¿Y al anular? | **Pendiente.** | F2-16 |
| D5 | ¿Quién entrega `Numero_OT`? | **BagPro, por ahora**, hasta migrar todo a Plasticaribe. | F2-01 reescrita: el número lo calcula el servidor a partir de BagPro, no el navegador. |

---

## F0. Verificaciones previas (DBA o responsable, ambiente de pruebas, sin código)

**Bases de pruebas:** servidor **.250**: `PlasticaribeBDD_Test` (Plasticaribe) y `plasticaribe2` (BagPro). Servidor **.85**: `Inventario_Prea21` (Zeus inventario) y `Contabilidad` (Zeus contabilidad). Los scripts de triggers y SPs se versionan en el repo `C:\Dev\GitHub\PlasticaribeDB`.

| ID | Verificación | Motivo |
|---|---|---|
| F0-00 ✅ | **Comprobar que los triggers y linked servers de las bases de prueba apuntan a las bases de prueba**, no a las de producción (nombre del linked server y de la base en cada `INSERT`/`UPDATE` remoto). | Si apuntan a producción, cada OT de prueba se escribiría en BagPro o Zeus reales. |
| F0-01 ✅ (parcial) | Extraer con `sp_helptext` el código de `TR_CrearOTs`, `TR_ActualizarCampos_*` (Plasticaribe), `CrearOT_EnEstadoProcesosOT_PBdD`, `ActualizarOT_EstadosProcesosOT` y `TR_CreacionProductosEnPBDD` (BagPro). Comprobar `IF NOT EXISTS`, si son multi-fila, si hay recursión y `NOCOUNT`. | La replicación a BagPro ocurre por linked server y transacción distribuida. Define el impacto real de duplicados y errores. |
| F0-02 | Buscar duplicados existentes de `Orden_Trabajo.Numero_OT`, de filas de proceso por `Ot_Id` (Extrusión, Impresión, Laminado, Sellado/Corte) y de `Mezcla_Nombre`, `MezMaterial_Nombre` y `MezPigmto_Nombre`. | Hay que limpiarlos antes de crear índices únicos (F2-01, F2-08). |
| F0-03 | Confirmar si en la BD real ya existen índices únicos sobre esos campos. | El snapshot de EF no los tiene. |
| F0-04 | Comprobar si hay solapamiento entre `SedeCli_CodBagPro` y `SedeCli_Id`. | F2-07 |
| F0-05 | **Fuera de alcance, urgente:** `BagPro_WebAPI/Data/plasticaribeContext.cs` (línea ~120) tiene en un comentario una cadena de conexión con usuario `sa` y su contraseña, y está en el historial de git. Rotar la credencial y dejar de usar `sa` en las APIs. | Seguridad |

### Resultados F0 (2026-11-06, extracción de Pruebas en `PlasticaribeDB/Pruebas`)

**F0-00: OK, con una duda pendiente.**
- Los triggers y SPs de `PlasticaribeBDD_Test` escriben en `plasticaribe2` (BagPro de pruebas) mediante nombres de tres partes, porque están en la misma instancia y no usan linked server. A Zeus llegan por el linked server `192.168.0.85` → `Inventario_Prea21`.
- Las 6 referencias a bases de producción (`plasticaribe.dbo`, `PlasticaribeBDD.dbo`, `[192.168.0.85].Inventario`) están **comentadas**.
- **Pendiente:** confirmar si `[192.168.0.85].Contabilidad_Prea21` es la base de pruebas o la de producción de contabilidad. La usan los SPs de BagPro que sincronizan clientes desde Zeus.
- Los triggers tienen **el nombre de la base escrito en el código** (`plasticaribe2`, `PlasticaribeBDD_Test`). Las versiones de pruebas y de producción de un mismo trigger **son textos distintos**, y cualquier cambio de trigger se hace dos veces. Ver F4 (sinónimos).

**F0-01: resuelto en su mayor parte.** Cadena real de creación:

```
EF SaveChanges (transacción de CrearAsync)
 └─ INSERT Orden_Trabajo → TR_CrearOTs (AFTER INSERT, UPDATE)
     ├─ si la OT NO existe en plasticaribe2.ClientesOT y existen ClientesOT_Item(producto+presentación) y Zeus Articulo:
     │    EXEC plasticaribe2.SPCrearOTDesdePlasticaribeBDD → INSERT ClientesOT → trigger CrearOT_EnEstadoProcesosOT_PBdD
     │    EXEC plasticaribe2.Actualizar_ClientesOTItem
     │    EXEC plasticaribe2.ActualizarArticulos_Zeus → [192.168.0.85].Inventario_Prea21 (transacción distribuida, MSDTC)
     ├─ si SÍ existe en BagPro → Actualizar_ClientesOT + Actualizar_ClientesOTItem + ActualizarArticulos_Zeus (también en INSERT)
     └─ si falta el ítem en BagPro o el artículo en Zeus → no hace nada y no da error
 └─ INSERT OT_Extrusion / OT_Impresion / OT_Laminado / OT_Sellado_Corte
     → TR_ActualizarCampos_* → UPDATE plasticaribe2.ClientesOT / ClientesOT_Item (/ Wiketiando)
```

- **No hay recursión:** los SPs de BagPro solo **leen** `PlasticaribeBDD_Test.dbo.Orden_Trabajo` y no la modifican.
- No hay MSDTC entre Plasticaribe y BagPro (misma instancia). **Sí lo hay hacia Zeus (.85)**, dentro de la transacción de `CrearAsync`.
- Todos los triggers revisados son **de una sola fila**: `DECLARE @x = (SELECT … FROM inserted)`.
- El bloque `TRY/CATCH` de `TR_CrearOTs` está comentado, y tiene `@id_Pedido = 517` fijo y una variable `@CodigoBagPro` calculada que no se usa.
- **Pendiente:** comparar con la extracción de Producción (`git diff --no-index Pruebas\<X> Produccion\<X>`).

Hallazgos nuevos derivados de F0 (se incorporan como F2-13 a F2-16):

| ID | Sev. | Hallazgo | Evidencia |
|---|---|---|---|
| T1 | **CRÍTICO** | Si se inserta una OT con un número **que ya existe en BagPro**, `TR_CrearOTs` entra en la rama `ELSE … inserted AND NOT deleted` y **sobrescribe en silencio la OT existente de BagPro** con el cliente, el producto y la mezcla de la nueva. Esto confirma que H1 (número calculado en el navegador) no solo duplica: corrompe una OT real. | `TR_CrearOTs`, rama `PRINT('7. …')` |
| T2 | ALTO | Si el producto/presentación no existe en `ClientesOT_Item`, o el artículo no existe en Zeus, **la OT se crea solo en Plasticaribe, sin error**. Producción (BagPro) no la ve, y el siguiente número calculado desde BagPro **repetirá** ese número. | `TR_CrearOTs`, condiciones `EXISTS` de las dos ramas |
| T3 | ALTO | Todos los triggers de OT son de una sola fila. Un `INSERT` o `UPDATE` de varias filas sobre `Orden_Trabajo` o las tablas de proceso falla ("subquery returned more than 1 value") o replica solo una fila. | `TR_CrearOTs` línea `DECLARE @id_OT`, `TR_ActualizarCampos_*`, `CrearOT_EnEstadoProcesosOT_PBdD` |
| T4 | MEDIO / **DECISIÓN D6** | Cualquier `UPDATE` de `Orden_Trabajo` (editar, **anular**, cambiar estado) vuelve a ejecutar `Actualizar_ClientesOT` y **actualiza el precio de venta y el costo (precio × 0,75) del artículo en Zeus** con el precio de esa OT. | `TR_CrearOTs`, `ActualizarArticulos_Zeus` |

---

## F1. Correcciones de frontend de alto impacto (Angular, sin cambios de contrato)

Son cambios acotados que no dependen del backend. Pueden ir en un único PR.

| ID | Sev. | Método (líneas) | Problema verificado | Cambio | Criterio de aceptación |
|---|---|---|---|---|---|
| F1-01 | ALTO | `infoMezclaCrear` (~2020-2060) | La condición lee controles que no existen (`Mezcla_PorcentajeCapa2`, `MezMaterial_Id2xCapa2`, …), siempre da `undefined` y **toda mezcla de 2 o 3 capas creada desde el modal se guarda con la capa 2/3 en 0% y material/pigmento 1**. | Leer los controles reales (`Proc_Capa2`, `materialP1_Capa2`, `PorcentajeMaterialP1_Capa2`, `MezclaPigmentoP1_Capa2`, …) con `?? 0` / `?? 1`. | Al crear una mezcla de 3 capas desde el modal, el payload contiene los valores introducidos en las capas 2 y 3. |
| F1-02 | MEDIO | `crearPigmento` (~2105-2112), `crearMaterial` | Llama a `this.mezclasPigmentos()` y `this.mezclasPigmentos2()`, que son **arreglos**, y lanza un TypeError. Además no hay manejador de error y falla `toUpperCase` si el nombre es null. | Usar `cargarMezclaPigmento()` / `cargarMezclaPigmento2()`, validar el formulario antes de guardar y añadir manejador de error. | Tras crear un pigmento, la lista se refresca y el formulario se limpia, sin errores en consola. |
| F1-03 | ALTO | `editarOrdenTrabajo` (~2765) → `cambiarEstadoCliente`; `cambiarEstadoProducto` (~2447-2479) | Se envía `Id_Cliente` (que en edición es `SedeCli_Id`) a `PUT Clientes/putEstadoCliente/{id}`, que filtra por `Cli_Id`: activa otro cliente o produce un 500. `cambiarEstadoProducto` nunca hace nada (`datos.length` sobre un objeto) y, si se "arreglara", leería formularios ya limpiados. | Eliminar ambas llamadas en la edición, igual que ya están comentadas en la creación. Eliminar `cambiarEstadoProducto`. | Editar una OT no dispara `putEstadoCliente` ni `GET Producto/{id}`. |
| F1-04 | ALTO | `calcularCostosOT_Paquete` (1592-1602), `calcularCostosOT_Und` (1604-1615), `calcularPesoProducto` (~1565) | Paquete: con `PesoMillar = 0`, `pesoPaquete` se queda en 0 o en un valor anterior y `valorKg = Infinity`, que se serializa como `null` en el payload. Und: `ValorOT` se fuerza a 0 o a 1. `calcularPesoProducto` **divide `PesoMillar` dentro del propio arreglo** y el valor se acumula (P/2, P/4…) con cada pulsación de tecla. D1 aplicada (`ValorOT = Cant × PrecioUnd` siempre). D2 pendiente: se conserva el ÷2 de LAMINADO/HOJA como una constante configurable. Extraer a funciones puras (ver F3-01) con variables locales (`pesoPaquete`, `pesoMillarEfectivo`) sin modificar `ArrayProducto`. Si el divisor es ≤ 0, `valorKg = 0` y avisar. Antes de armar el payload, validar con `Number.isFinite` todos los valores numéricos y bloquear el guardado si alguno no es finito. | Pruebas unitarias: PesoMillar 0/null, LAMINADO/HOJA llamado N veces da siempre el mismo resultado, precio 0, cantidad 0. Nunca se envía `Infinity` ni `NaN`. |
| F1-05 | ALTO | `guardarOt` (~2246), `construirInfoOt_Sellado_Corte` (~2415), `validarFormularios` (~3630), `editarOrdenTrabajo` | `cargando = true` no se libera cuando: `GetSedeClientexNitBagPro` falla (no tiene manejador de error), `getTipoSellado_Formato` devuelve 204 (`datos.tpProd_Id` sobre null) o un subformulario es inválido. La pantalla queda bloqueada. | Convertir crear y editar en un único pipeline (`switchMap`) con `finalize(() => this.cargando = false)`. Comprobar explícitamente que `datosSellado` no sea null y mostrar un mensaje. Liberar `cargando` en cada `return` anticipado. | Con la API caída, con una combinación de sellado/formato inexistente y con un formulario inválido, el overlay desaparece y se muestra un mensaje. |
| F1-06 | ALTO | `prepararCargaOrdenTrabajo$` (~2646), `prepararCargaItem$` (~1092), `llenarFormularioCorte` (~1361), `llenarFormularioSellado` (~1384), `llenarFormularioExtrusion` (~1304) | Ignoran el `false` de `obtenerInformacionProducto$`, de modo que `ArrayProducto[0]` es undefined y se produce un TypeError. También `und_Extrusion.trim()` sobre null (datos de BagPro). | Si el producto no existe, cortar el flujo con un aviso y no entrar en modo edición. Usar `?.` y `?? ''` en todos los `trim` y `toString`. | Cargar una OT con un producto inexistente o con campos null de BagPro muestra un aviso y no deja el componente en un estado intermedio. |
| F1-07 | ALTO | `validarDatos` (~2216), botones Crear/Actualizar (HTML ~50, ~2607) | `cargando` se activa unos 700 ms después del clic y los botones no tienen `[disabled]`. Un doble clic envía dos `crearCompleta` con el mismo número. | Bandera `guardando` que se activa en el primer clic y `[disabled]="guardando \|\| cargando"` en los botones. Eliminar los `setTimeout` del flujo de guardado. | Un doble clic produce una sola petición POST (comprobar en la pestaña Network). |
| F1-08 | MEDIO | `formatoPDF` y auxiliares (~2836-3504) | `.toString().trim()` / `.toFixed()` sin protección contra nulos en decenas de campos. Una OT histórica o de BagPro con un null rompe el PDF y deja la carga bloqueada. Si llegan varias filas, se abren varios PDF. | Auxiliares `txt(v, def='')` y `num(v, dec)`, `try/finally` que libere `cargando` y usar solo `datos_ot[0]`. | Se genera el PDF de una OT que solo existe en BagPro y que tiene campos null. |

---

## F2. Backend: integridad, seguridad y contratos

Cada tarea cambia el contrato o la BD: plan detallado pendiente de aprobación antes de editar. Orden recomendado: F2-01 → F2-02/03 → F2-04/05 → resto.

| ID | Sev. | Ubicación | Problema | Cambio | Criterio de aceptación |
|---|---|---|---|---|---|
| F2-01 | ALTO | `OrdenTrabajoCompletaService.CrearAsync` (42-47); BagPro `ClientesOtController.GetUltimaOt` (777-788); componente `guardarOt` (`numOT.item + 1`) | El **número de OT lo calcula el cliente** (MAX+1 de BagPro) y el servidor hace `AnyAsync` y luego `Add` sin bloqueo ni índice único. Dos usuarios a la vez generan OT duplicadas o un 500. **D5: el número lo sigue entregando BagPro, pero lo calcula el servidor.** Dentro de la transacción de `CrearAsync`:<br>1. `sp_getapplock 'NumeroOT', 'Exclusive', 'Transaction'` para serializar las creaciones desde Plasticaribe.<br>2. `siguiente = MAX(MAX(BagPro.ClientesOT.Item), MAX(Orden_Trabajo.Numero_OT)) + 1`. El máximo de BagPro se lee por el mismo linked server que usan los triggers (confirmar su nombre en F0-01), o mediante una vista o sinónimo en Plasticaribe.<br>3. Insertar. El trigger replica y, si alguien creó ese número directamente en BagPro en ese instante, la PK de `ClientesOT` lo rechaza: capturarlo y responder 409 con el mensaje "reintente".<br>Además: índice único en `Orden_Trabajo.Numero_OT` (después de F0-02). En Angular, dejar de llamar a `UltimaOT`, no enviar `Numero_OT` y leerlo de la respuesta. | Dos `crearCompleta` simultáneos producen números distintos y consecutivos. Un duplicado forzado devuelve 409 con mensaje. |
| F2-02 | ALTO | `Models/OrdenTrabajoCompletaRequest.cs`, `CrearAsync` (46, 58) | El DTO expone entidades EF con sus navegaciones (`PedidoExterno`, `Usuario`, `Prod`, …). `Add` inserta todo el grafo, incluidos registros que disparan triggers hacia Zeus y BagPro. | DTOs planos (`CrearOrdenTrabajoDto`, `ProcesoExtrusionDto`, …) sin navegaciones y mapeo a entidades en el servicio. Validación con DataAnnotations: cantidad > 0, precio ≥ 0, fecha de entrega ≥ fecha de creación, y comprobar que existan producto, sede y mezcla. | Un payload con navegaciones anidadas no crea registros adicionales. Valores fuera de rango devuelven 400 con detalle. |
| F2-03 | MEDIO | `OrdenTrabajoCompletaService.EditarAsync` (82-86, 136-139) | `SetValues` aplica casi toda la entidad: sobrescribe `Usua_Id` (el creador), permite cambiar producto, sede, estado y valores financieros sin validar, y no hay control de concurrencia. **D4:** DTO de edición con lista blanca de campos. Conservar `Usua_Id`. Migración EF que agrega `Ot_UsuarioModifica` (FK a `Usuarios.Usua_Id`, nullable) y `Ot_FechaModifica`, que se llenan con el usuario del token. Columna `RowVersion` (`[Timestamp]`) y 409 si hay conflicto. Recalcular en el servidor `Ot_ValorOT`, `Ot_ValorKg` y `Ot_PesoNetoKg`, o validar que coincidan con el cálculo. | Editar no cambia el creador. Dos ediciones concurrentes: la segunda recibe 409. |
| F2-04 | ALTO | `Orden_TrabajoController` (`[Authorize]` sin roles), `MezclasController`, `OT_SelladoCorteController`, `Mezcla_*Controller`; `Program.cs` 137-141 | Cualquier token válido puede crear, editar, anular o borrar OT y mezclas. `Usua_Id` e `Id_Vendedor` vienen del cliente. **D3:** políticas `CrearOT`, `EditarOT` y `AnularOT` = roles 1 y 98. Aplicar también a `POST`/`PUT`/`DELETE` de Mezclas, Mezcla_Material, Mezcla_Pigmento y OT_SelladoCorte. El rol 2 solo puede hacer GET de sus propias OT. Usuario tomado de `ClaimTypes.NameIdentifier`, ignorando el que llega en el body. | Un rol sin permiso recibe 403. El usuario guardado es siempre el del token. |
| F2-05 | ALTO | `editarCompleta` (cambio de `Estado_Id`) | La anulación se hace editando el estado completo, sin validar la transición. **D3:** endpoint `PUT Orden_Trabajo/{id}/anular` (roles 1 y 98) que valide el estado actual y registre el usuario del token. Bloquear el cambio de `Estado_Id` en `editarCompleta`. | No se puede anular una OT en un estado no permitido. `editarCompleta` ignora `Estado_Id`. |
| F2-06 | ALTO | Plasticaribe `GetOrdenTrabajo` (326-540), `GetInfoUltOT` (641-855); BagPro `GetOrdenDeTrabajo` (561-570), `OT_Cliente_Item_Presentacion` (346-353) | El filtro por vendedor depende del query param `?sales=`, que arma el cliente (Plasticaribe ni siquiera lo lee). Basta con quitarlo para ver OT de otros vendedores. | Si el rol es vendedor, derivar su código del token y filtrar siempre en el servidor. Eliminar el parámetro en Angular. | Un vendedor que consulta la OT de otro recibe 404 o 403 aunque manipule la URL. |
| F2-07 | ALTO | `PutOrden_Trabajo` / `PostOrden_Trabajo` / `DeleteOrden_Trabajo` (859-954); vista antigua `Vistas/ordenes-trabajo/ordenes-trabajo.component.ts` (1188, 2141) | El PUT recibe la entidad completa con `EntityState.Modified` y permite reescribir `Numero_OT`, la fecha de creación y el usuario. El POST no comprueba duplicados. La vista antigua **no está en uso** (confirmado 2026-11-06). Eliminar `Vistas/ordenes-trabajo/` y su ruta o módulo si existe. Después, eliminar `PUT`/`POST`/`DELETE Orden_Trabajo/{id}` tras buscar con grep otros consumidores en Angular y en las otras APIs. | No queda ningún endpoint que permita cambiar `Numero_OT`. |
| F2-08 | MEDIO | `GetOrdenTrabajo` / `GetInfoUltOT` (INNER JOIN con los 4 procesos; 400 si no hay datos) | Una OT a la que le falta un proceso se considera inexistente, se carga desde BagPro como plantilla y **acaba creando una OT nueva duplicada**. Con procesos duplicados se devuelven varias filas. | LEFT JOIN, o una proyección por proceso con `FirstOrDefault`. Responder 404 cuando no exista. Índice único sobre `Ot_Id` en cada tabla de proceso (después de F0-02). | Una OT sin proceso de laminado se abre en modo edición. |
| F2-09 | MEDIO | `MezclasController.GetMezclaNombre` (51-63), `PostMezcla` (272-321), `Mezcla_*Controller.Post` | `NotFound(...)` se crea pero no se devuelve, así que llega `Ok(null)` → 204. `Convert.ToInt32(nombre)` responde 500. No hay unicidad de nombres en el servidor. | `int.TryParse` y `return NotFound(...)`. Índices únicos sobre los nombres y validación de duplicados (409). Validar que cada capa activa sume 100 (tolerancia 0.01). | Un nombre inexistente y no numérico devuelve 404. Un nombre duplicado devuelve 409. |
| F2-10 | MEDIO | `OT_SelladoCorteController.GetTipoSellado_Formato` (31-46), `PostOT_Sellado_Corte` (116) | Devuelve 204 cuando no encuentra datos, lo que rompe al cliente. `CreatedAtAction` usa un bool como id. | Responder 404. Corregir la ruta de `CreatedAtAction`. | El cliente recibe 404 y muestra un mensaje (combinado con F1-05). |
| F2-11 | MEDIO | `SedesClientesController.GetSedeClientexNitBagPro` | `CodBagPro == cod \|\| SedeCli_Id == Convert.ToInt32(cod)` sin `OrderBy`: puede asignar la OT a una sede equivocada, y un valor no numérico da 500. | Endpoint con el tipo de identificador explícito y resultado único. En Angular, `Id_Cliente` debe ser siempre `SedeCli_Id`. | Según F0-04, ningún código ambiguo devuelve más de una sede. |
| F2-12 | MEDIO | `OrdenTrabajoCompletaService` / `Program.cs` | Los errores del trigger o del linked server llegan como 500 sin cuerpo. No hay manejador global de excepciones. | Middleware de excepciones (ProblemDetails). Mapear `DbUpdateException` → 409 y `SqlException` de linked server → 502 con un mensaje legible. | Un fallo en BagPro muestra en Angular un mensaje comprensible. |
| F2-13 | **CRÍTICO** | `TR_CrearOTs` (T1) + `CrearAsync` | Insertar un número que ya existe en BagPro sobrescribe la OT de BagPro. | **Defensa doble:** (1) en `CrearAsync`, dentro de la transacción y después del `sp_getapplock` de F2-01, comprobar que el número **no exista en `plasticaribe2.dbo.ClientesOT`** y, si existe, responder 409; (2) **script de trigger** (lo aplica el responsable): en `TR_CrearOTs`, si es INSERT (`NOT EXISTS deleted`) y la OT ya existe en BagPro, ejecutar `THROW 50001, 'La OT ya existe en BagPro', 1;`. Entregar las versiones Pruebas y Producción. | Crear una OT con un número existente en BagPro devuelve 409 y la OT de BagPro queda intacta. |
| F2-14 | ALTO | `TR_CrearOTs` (T2) + `CrearAsync` | Una OT puede crearse sin replicarse a BagPro ni a Zeus, sin error. | Validar en `CrearAsync`, **antes** de insertar, que existan `plasticaribe2.dbo.ClientesOT_Item` (producto + presentación) y el artículo en Zeus. Si falta alguno, responder 422 con el motivo. Después del `SaveChanges`, comprobar que la OT existe en `ClientesOT`; si no, hacer rollback y responder 502. | No es posible tener una OT en Plasticaribe sin su par en BagPro. |
| F2-15 | ALTO | Todo código que escriba en `Orden_Trabajo` o en las tablas `OT_*` (T3) | Los triggers son de una sola fila. | **Regla para el developer:** prohibido `ExecuteUpdate`/`ExecuteDelete`, `UPDATE` masivos o `AddRange` de varias OT en una sola sentencia sobre estas tablas. La anulación (F2-05) y cualquier cambio de estado se hacen OT por OT. Documentarlo con un comentario en `OrdenTrabajoCompletaService`. A medio plazo, reescribir los triggers para varias filas (F4). | Revisión de código: no hay operaciones de varias filas sobre esas tablas. |
| F2-16 | MEDIO | `TR_CrearOTs` → `ActualizarArticulos_Zeus` (T4) | Editar o anular una OT cambia el precio y el costo del artículo en Zeus. | **[DECISIÓN D6]** Según la respuesta: (a) se mantiene, documentado; (b) solo se actualiza Zeus en el INSERT o cuando cambia el precio (`UPDATE(Ot_ValorUnidad)`/`UPDATE(Ot_ValorKg)`); (c) se elimina del trigger. Como mínimo, la anulación no debe tocar Zeus. | Anular una OT no modifica el artículo en Zeus. |

---

## F3. Reestructuración del componente Angular (mantenibilidad)

Se aborda después de F1, sobre un código ya estabilizado.

| ID | Cambio | Detalle |
|---|---|---|
| F3-01 | `OtCalculoCostosService` | Funciones puras para Kg, Paquete y Und, y peso del producto, con su `.spec.ts`. Las pruebas de F1-04 viven aquí. |
| F3-02 | Pipeline único de carga de OT | Integrar en el mismo `switchMap` de `busquedaOT` la consulta de mezcla (`getMezclaNombre`) y de producto (`GetInfoProducto_Prod_Presentacion`). Eliminar los `setTimeout` de 300, 500 y 1000 ms (`calcularDatosOt`, `llenarFormularios`, `cargarCombinacionMezclas`). Reiniciar `Id_Mezcla` en `limpiarFormMezclas` y `limpiarCampos`. Así se resuelve la carrera de navegación ◀ ▶ entre OT. |
| F3-03 | Constructor de payload | Una sola función para crear y editar (hoy duplicada en ~2257-2285 y ~2786-2815) que recalcule de forma síncrona justo antes de enviar, para evitar los valores viejos de la confirmación en la edición. |
| F3-04 | `OtPdfService` | Mover unas 700 líneas de `formatoPDF` fuera del componente, con los auxiliares de F1-08. |
| F3-05 | Ciclo de vida | `ngOnDestroy` con `clearInterval` (el `setInterval` de `ngOnInit`, ~405) y `takeUntilDestroyed` / `unsubscribe` de `busquedaOT` y `consultaProduccion`. |
| F3-06 | Quitar `@Injectable({providedIn:'root'})` del componente (58-60) | Sustituirlo por un servicio de estado compartido o por `@Output` hacia `Busqueda_OrdenesTrabajo`. |
| F3-07 | Codificación de URL | `encodeURIComponent` en `getMezclaNombre`, `srvObtenerListaPorNombre` y `srvObtenerListaConsultaImpresion`. Hoy solo se reemplaza el primer `%`. |
| F3-08 | Limpieza | Eliminar `console.log` (625, 859, 862, 2301, 3692), el código muerto `validarNuevoProducto` / `crearNuevoProducto` (~3654-3695), el `parseFloat(...) \| 0` de `llenarProducto` (~1015) y el `checkedCapa2` duplicado de `initFormCrearMezclas` (~1703). Unificar la validación en cascada repetida (2226, 2725, 3633). Añadir `Validators.min` a cantidad y precio. |

---

## F4. Backlog técnico (sin prioridad inmediata)

- Lecturas con `AsNoTracking` y en modo async: `GetDatosOrden`, `GetInfoUltOT`, `Estados_ProcesosOTController.GetPorOT`, `GetTipoSellado_Formato`. Dejar de cargar tablas completas en `GET Orden_Trabajo` y `GET Mezclas`.
- BagPro: mover las líneas `HasTrigger` de `plasticaribeContext.cs` (126, 2264-2265, 2738-2739) a un archivo parcial (`OnModelCreatingPartial`) para que no se pierdan al volver a hacer scaffold.
- BagPro `PutOrdenTrabajo`: la ruta `putOrdenTrabajo{orden}` no tiene `/` y está rota. Corregirla o eliminarla.
- BagPro `UltimaOT` devuelve la fila completa con costos: devolver solo `Item`, o eliminarlo después de F2-01.
- Idempotencia de `crearCompleta` con `EnableRetryOnFailure`: valorar una clave de idempotencia.
- Triggers: reemplazar los nombres de base escritos en el código (`plasticaribe2`, `PlasticaribeBDD_Test`, `Inventario_Prea21`) por **sinónimos** (`CREATE SYNONYM bp_ClientesOT FOR plasticaribe2.dbo.ClientesOT`), para que el mismo texto de trigger sirva en Pruebas y en Producción. Reescribir los triggers para varias filas (T3), descomentar `TRY/CATCH` + `THROW` y eliminar el `@id_Pedido = 517` fijo.
- A medio plazo: sustituir la replicación por triggers y linked server por una sincronización explícita (outbox) e idempotente, según lo que resulte de F0-01.
- Actualizar BagPro_WebAPI de net7 a una versión con soporte.

---

## 5. Plan de pruebas mínimo por fase

| Fase | Pruebas |
|---|---|
| F1 | Unitarias de cálculo (F1-04). Manuales: mezcla de 3 capas desde el modal; crear pigmento; doble clic en Crear; API caída durante el guardado; combinación sellado/formato inexistente; OT con producto inexistente; PDF de una OT solo en BagPro con nulls; editar una OT y comprobar en Network que no hay `putEstadoCliente`. |
| F2 | Integración en ambiente de pruebas: dos `crearCompleta` concurrentes; payload con navegaciones anidadas; edición concurrente (409); un rol sin permiso (403); un vendedor que manipula la URL; OT sin un proceso; nombre de mezcla duplicado. Verificar que los triggers siguen replicando a BagPro (F0-01). |
| F3 | Regresión completa de crear, editar, consultar, navegar ◀ ▶ y PDF. Comprobar que `Busqueda_OrdenesTrabajo` sigue funcionando. |

## 6. Plan de git

### Repositorios y ramas base

| Repo | Rama base del trabajo | Flujo de integración | Ramas de la refactorización |
|---|---|---|---|
| `WorkspaceAngular` | `Develop` | `Develop` → `testing/integracion` → `main` | `refactor/ot-*` |
| `PlasticaribeWebAPI` | `Develop` | `Develop` → `testing/integracion` → `main` | `refactor/ot-*` (mismo nombre que en Angular cuando la tarea es multicapa) |
| `BagPro_WebAPI` | `master` | `master` (validar con `Pruebas-Avances`) | `refactor/ot-bagpro` (solo F4) |
| `PlasticaribeDB` (nuevo) | `main` | directo | Una rama por extracción o cambio de script |

### Antes de empezar

1. La rama `depuracion-endpoints-bagpro` (commit `30ea42db`) elimina métodos de `Servicios/BagPro/Bagpro.service.ts`, un archivo que también usa la OT. Integrarla en `Develop` **antes** de crear ramas `refactor/ot-*`, o rebasar después.
2. Existe un stash `stash@{0}` ("OT: producto terminado, solapa PDF, observaciones (para develop)") con cambios en `Orden_Trabajo.component.ts`. Decidir si se integra **antes** de PR1. Si no, va a chocar con F1/F3.
3. `BagPro_WebAPI` tiene la rama `depuracion-endpoints-sin-uso`. Si esa depuración elimina endpoints de `ClientesOtController` (`UltimaOT`, `GetOrdenDeTrabajo`, `putOrdenTrabajo`), coordinarla con F2-01 y F4.

### Secuencia de PRs

| # | Rama | Repos | Contenido | Depende de |
|---|---|---|---|---|
| PR0 | `docs/plan-refactor-ot` | WorkspaceAngular | Este documento | — |
| PR1 | `refactor/ot-f1-frontend` | WorkspaceAngular | F1-01, 02, 03, 05, 06, 07, 08 | PR0 |
| PR2 | `refactor/ot-f1-calculos` | WorkspaceAngular | F1-04 + F3-01 (servicio de costos puro con `.spec.ts`), D1 aplicada y D2 como constante | PR1 |
| PR3 | `refactor/ot-f2-creacion` | PlasticaribeWebAPI + WorkspaceAngular | F2-01, F2-02, F2-03, F2-12, **F2-13, F2-14**, regla F2-15 y migración EF (índice único, `RowVersion`, columnas de último editor). Incluye el script de `TR_CrearOTs` (Pruebas y Producción) en el repo `PlasticaribeDB`, que aplica el responsable | F0 completa, PR1 |
| PR4 | `refactor/ot-f2-autorizacion` | PlasticaribeWebAPI + WorkspaceAngular + BagPro_WebAPI (F2-06) | F2-04, F2-05, F2-06 | PR3 |
| PR5 | `refactor/ot-f2-endpoints` | PlasticaribeWebAPI + WorkspaceAngular | F2-07 a F2-11 | PR3 |
| PR6 | `refactor/ot-f3-estructura` | WorkspaceAngular | F3-02 a F3-08 | PR2 |
| PR7 | `refactor/ot-f4-*` | Según la tarea | Backlog F4 | — |

### Reglas

- Ramas creadas desde `Develop` actualizado (`git pull` primero). PR hacia `Develop`. **No** hacer commits directos en `testing/integracion` ni en `main`.
- Formato de commit del repo: `+ OT: <descripción en español>`, un commit por tarea (`F1-01`, `F1-02`…) para que se puedan revertir de forma independiente.
- Antes de cada PR: compilar (`ng build` / `dotnet build`) y hacer la auditoría de `plasticaribe-code-reviewer` sobre el diff de la rama contra `Develop`.
- **PRs multicapa (PR3 a PR5):** mismo nombre de rama en cada repo y los PRs enlazados entre sí. Se integran y despliegan **juntos**, porque cambian el contrato `crearCompleta` / `editarCompleta`. Etiquetar ambos repos con `ot-refactor-f2-<n>`.
- **Migraciones EF:** el developer **solo genera** el archivo de migración (`dotnet ef migrations add …`) y, si se pide, el script con `dotnet ef migrations script --idempotent`. **Nunca** ejecuta `dotnet ef database update` ni scripts contra ninguna base: **las aplica el responsable**, primero en `PlasticaribeBDD_Test` y en producción después de validar en `testing/integracion`. Los índices únicos van en una migración separada, que se aplica solo cuando F0-02 confirme que no hay duplicados.
- **Validación:** `Develop` → merge a `testing/integracion` → pruebas de la sección 5 contra `PlasticaribeBDD_Test` / `plasticaribe2` (.250) e `Inventario_Prea21` (.85) → merge a `main`.
- **Rollback:** cada PR se revierte con `git revert` del merge. Las migraciones deben tener un `Down` funcional.

## 7. Riesgos de regresión

- Contrato de `crearCompleta` / `editarCompleta`: F2-01, F2-02 y F2-03 lo cambian, así que Angular y la API deben desplegarse juntos.
- Los triggers de replicación dependen de las columnas que se escriben. Revisar con F0-01 antes de cambiar el orden o la forma de los `INSERT`/`UPDATE`.
- OT históricas de BagPro (Rotograbado, campos null) deben seguir pudiéndose abrir y generando su PDF.
