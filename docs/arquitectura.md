# Arquitectura técnica de Plasticaribe

> Estado: documentación exploratoria basada en los archivos fuente disponibles en los cinco repositorios. No se consultaron bases de datos ni se verificó conectividad en ejecución. Las versiones son las declaradas en los manifiestos examinados.

## Repositorios y responsabilidades observables

| Repositorio | Responsabilidad conocida y evidencia |
|---|---|
| `WorkspaceAngular` | Aplicación web Angular. El proyecto [ProyectoPlasticaribe](../Proyecto/ProyectoPlasticaribe/package.json) declara Angular 16. En [src/app/Servicios](../Proyecto/ProyectoPlasticaribe/src/app/Servicios/) hay servicios que construyen solicitudes para las cuatro APIs listadas en los entornos. Las instrucciones del repositorio también describen Electron, pero esa configuración no se pudo confirmar en los manifiestos revisados; véase [pendientes-arquitectura.md](./pendientes-arquitectura.md). |
| `PlasticaribeWebAPI` | API ASP.NET Core que expone recursos de negocio como clientes, productos y procesos. La evidencia incluye [ClientesController.cs](../../PlasticaribeWebAPI/PlasticaribeAPI/Controllers/ClientesController.cs) y el contexto [dataContext.cs](../../PlasticaribeWebAPI/PlasticaribeAPI/Data/dataContext.cs). |
| `ZeusInventarioAPI` | API ASP.NET Core con controladores para artículos y existencias. Ejemplos: [ArticulosController.cs](../../ZeusInventarioAPI/ZeusInventarioWebAPI/Controllers/ArticulosController.cs) y [ExistenciasController.cs](../../ZeusInventarioAPI/ZeusInventarioWebAPI/Controllers/ExistenciasController.cs). |
| `BagPro_WebApi` | API ASP.NET Core con endpoints de producción BagPro, por ejemplo [ProcSelladoController.cs](../../BagPro_WebApi/Controllers/ProcSelladoController.cs), que consulta registros de sellado y contiene operaciones relacionadas con el envío a Zeus. |
| `ZeusContabilidadAPI` | API ASP.NET Core con endpoints contables, incluyendo cartera y transacciones. Ejemplo: [FacturasBUController.cs](../../ZeusContabilidadAPI/Controllers/FacturasBUController.cs). |

Las responsabilidades más específicas de las APIs se describen únicamente hasta donde llegan sus controladores, entidades y rutas observadas; no se infieren límites de negocio o de propiedad de datos más amplios.

## Tecnologías y versiones declaradas

| Proyecto | Plataforma y versiones comprobadas | Fuente |
|---|---|---|
| Angular | Angular Core `^16.2.10`, Angular CLI `^16.2.7`, TypeScript `^4.9.3`, RxJS `~7.8.1` | [package.json](../Proyecto/ProyectoPlasticaribe/package.json) |
| Plasticaribe API | `net8.0`; EF Core, EF Core SQL Server y herramientas `8.0.2` | [PlasticaribeAPI.csproj](../../PlasticaribeWebAPI/PlasticaribeAPI/PlasticaribeAPI.csproj) |
| Zeus Inventario API | `net8.0`; EF Core, EF Core SQL Server y herramientas `8.0.1` | [ZeusInventarioWebAPI.csproj](../../ZeusInventarioAPI/ZeusInventarioWebAPI/ZeusInventarioWebAPI.csproj) |
| BagPro API | `net7.0`; EF Core, EF Core SQL Server y herramientas `7.0.13` | [BagproWebAPI.csproj](../../BagPro_WebApi/BagproWebAPI.csproj) |
| Zeus Contabilidad API | `net7.0`; EF Core, EF Core SQL Server y herramientas `7.0.11` | [ContabilidadZeusAPI.csproj](../../ZeusContabilidadAPI/ContabilidadZeusAPI.csproj) |

Los `.csproj` examinados incluyen el proveedor de SQL Server de EF Core. Esto acredita una dependencia configurada en los proyectos, no una conexión o consulta ejecutada durante este diagnóstico.

## Estructura principal

- **WorkspaceAngular:** el código de la aplicación está en `Proyecto/ProyectoPlasticaribe/`; configuración Angular en `angular.json`, dependencias en `package.json`, código de UI y servicios en `src/app/`, y bases URL en `src/environments/`.
- **PlasticaribeWebAPI:** la solución de API está bajo `PlasticaribeAPI/`, organizada en `Controllers/`, `Data/`, `Models/`, `Migrations/`, `Interfaces/` y `Service/`.
- **ZeusInventarioAPI:** la aplicación está bajo `ZeusInventarioWebAPI/`, con `Controllers/`, `Data/`, `Models/`, `Service/` y `Connected Services/`.
- **BagPro_WebApi:** el proyecto está organizado en `Controllers/`, `Data/`, `Models/`, `Service/` y `Connected Services/`.
- **ZeusContabilidadAPI:** el proyecto está organizado en `Controllers/`, `Data/`, `Models/` y `Service/`.

## Patrones arquitectónicos identificados

### Angular

- Los servicios Angular usan `HttpClient` y son inyectables, por ejemplo [ClientesService](../Proyecto/ProyectoPlasticaribe/src/app/Servicios/Clientes/clientes.service.ts) y [BagproService](../Proyecto/ProyectoPlasticaribe/src/app/Servicios/BagPro/Bagpro.service.ts).
- [environment.ts](../Proyecto/ProyectoPlasticaribe/src/environments/environment.ts) define bases por API mediante `rutaPlasticaribeAPI`, `rutaZeus`, `rutaZeusContabilidad` y `rutaBagPro`. Para el entorno de desarrollo usa el host de la ventana y puertos configurados en ese archivo. [angular.json](../Proyecto/ProyectoPlasticaribe/angular.json) establece el reemplazo de entorno para producción.
- Las rutas detalladas y las acciones servidoras que se cotejaron constan en [mapa-integraciones.md](./mapa-integraciones.md). El mapa no representa todos los métodos existentes.

### APIs

- Los controladores inspeccionados usan ASP.NET Core MVC, atributos como `[ApiController]`, `[Route("api/[controller]")]` y atributos `[HttpGet]`, `[HttpPost]`, entre otros.
- Los contextos se inyectan en controladores y las consultas observadas usan EF Core, LINQ y, en ejemplos, `AsNoTracking()` y métodos asíncronos. Ejemplos: [Plasticaribe ClientesController](../../PlasticaribeWebAPI/PlasticaribeAPI/Controllers/ClientesController.cs), [BagPro ProcSelladoController](../../BagPro_WebApi/Controllers/ProcSelladoController.cs) y [Zeus FacturasBUController](../../ZeusContabilidadAPI/Controllers/FacturasBUController.cs).
- Algunos controladores observados usan `[Authorize]`, pero no se comprobó que todos los endpoints de cada API compartan la misma política.
- Los endpoints pueden responder con entidades EF o con proyecciones anónimas, como se ve en [ArticulosController.GetItemsByName](../../ZeusInventarioAPI/ZeusInventarioWebAPI/Controllers/ArticulosController.cs) y [FacturasBUController.GetCarteraClientes](../../ZeusContabilidadAPI/Controllers/FacturasBUController.cs). No se identificó un DTO explícito para las integraciones documentadas en el mapa.

## Code First y Database First

Las instrucciones [AGENTS.md](../AGENTS.md) clasifican Plasticaribe como Code First y las tres APIs Zeus Inventario, BagPro y Zeus Contabilidad como Database First.

El código es consistente con esa clasificación:

- **Plasticaribe / Code First:** [dataContext.cs](../../PlasticaribeWebAPI/PlasticaribeAPI/Data/dataContext.cs) define el `DbContext` y sus `DbSet`; el proyecto incluye `Migrations/` y el `.csproj` enumera archivos de migración. Esas son evidencias del patrón presente en el repositorio.
- **Zeus Inventario, BagPro y Contabilidad / Database First:** los contextos [InventarioDataContext.cs](../../ZeusInventarioAPI/ZeusInventarioWebAPI/Data/InventarioDataContext.cs), [plasticaribeContext.cs](../../BagPro_WebApi/Data/plasticaribeContext.cs) y [ContabilidadContext.cs](../../ZeusContabilidadAPI/Data/ContabilidadContext.cs) exponen numerosos `DbSet` y configuración de entidades; los modelos asociados incluyen clases `partial`. Esto es consistente con modelos/contextos de scaffolding Database First.

La clasificación de enfoque procede de las instrucciones del repositorio y su corroboración estructural; no se ejecutó scaffolding ni se investigó el historial de generación.

## Límites y dependencias entre proyectos

### Comprobado

1. Angular configura cuatro bases HTTP distintas, y se cotejaron rutas cliente-servidor para las cuatro APIs. Véase [mapa-integraciones.md](./mapa-integraciones.md).
2. En BagPro hay acciones `EnviarAjuste` que crean una dirección `EndpointAddress` para `wsGenericoZeus/ServiceWS.asmx` en los controladores de Extrusión y Sellado. Esto confirma una dependencia de BagPro hacia un servicio SOAP identificado como Zeus; no identifica cuál proyecto o servicio desplegado lo implementa. Véase [pendientes-arquitectura.md](./pendientes-arquitectura.md).

### No establecido por la evidencia revisada

- No se ha demostrado que las APIs se llamen directamente entre sí fuera de la integración SOAP indicada.
- No se han demostrado bases de datos compartidas, tablas compartidas ni relaciones entre modelos de repositorios diferentes.
- Los puertos y las URL de entorno documentan configuración del cliente; no prueban que los servicios estén activos o accesibles.

## Límites de este documento

Es un inventario inicial verificable, no una especificación exhaustiva. Se revisaron archivos fuente y manifiestos puntuales; no se levantó el inventario completo de controladores, rutas, contratos, consumidores Angular, despliegues ni bases de datos. No se ejecutaron consultas, migraciones, pruebas ni llamadas HTTP.
