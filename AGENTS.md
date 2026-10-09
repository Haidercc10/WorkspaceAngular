# AGENTS.md — Plasticaribe

## 1. Contexto del sistema

Este proyecto forma parte del sistema empresarial Plasticaribe.

La solución está compuesta por cinco repositorios Git independientes:

1. WorkspaceAngular
   - Frontend Angular 16.
   - Aplicación Electron para funcionalidades de escritorio y comunicación con dispositivos.

2. PlasticaribeWebAPI
   - Backend desarrollado en C# y .NET.
   - Entity Framework Core.
   - Enfoque Code First.

3. ApiZeusInventario
   - Backend desarrollado en C# y .NET.
   - Entity Framework Core.
   - Enfoque Database First.

4. BagPro_WebAPI
   - Backend desarrollado en C# y .NET.
   - Entity Framework Core.
   - Enfoque Database First.

5. ZeusContabilidadAPI
   - Backend desarrollado en C# y .NET.
   - Entity Framework Core.
   - Enfoque Database First.

## 2. Alcance

El análisis debe limitarse a los cinco repositorios anteriores.

No incluir el repositorio Web_Plasticaribe, porque corresponde
al sitio web corporativo y es independiente de este sistema.

## 3. Reglas generales

Antes de modificar código:

1. Comprender el requerimiento funcional.
2. Identificar los módulos involucrados.
3. Buscar las implementaciones existentes.
4. Identificar los componentes y servicios consumidores.
5. Identificar las APIs y endpoints relacionados.
6. Revisar DTO, modelos y contratos HTTP.
7. Revisar entidades, consultas EF Core y dependencias SQL.
8. Identificar impactos potenciales.
9. Proponer un plan de implementación.

Para funcionalidades que afecten varias capas, analizar:

Angular
  -> Servicio Angular
  -> Endpoint HTTP
  -> Controller de la API
  -> Lógica de negocio
  -> Entity Framework Core
  -> SQL Server

El flujo anterior es una guía de investigación, no una
suposición de que todas las funcionalidades siguen esa estructura.

## 4. Seguridad y cambios

- No modificar producción.
- No ejecutar operaciones destructivas en bases de datos.
- No eliminar funcionalidades existentes sin justificarlo.
- No cambiar contratos de API sin evaluar sus consumidores.
- No actualizar versiones mayores de dependencias sin autorización.
- No inventar relaciones entre tablas, APIs o módulos.
- Si falta información, buscar primero en el código y la documentación.
- Si persisten dudas relevantes, explicar qué información falta.

## 5. Implementación

Una vez aprobado el plan:

1. Realizar cambios acotados.
2. Respetar las convenciones del repositorio.
3. Reutilizar componentes y servicios existentes cuando corresponda.
4. Ejecutar compilaciones y pruebas disponibles.
5. Revisar el diff final.
6. Documentar los cambios realizados.

## 6. Informe final

Al terminar una tarea, resumir:

- Objetivo.
- Problema resuelto.
- Archivos modificados.
- Cambios en frontend.
- Cambios en backend.
- Cambios en base de datos, si existen.
- Reglas de negocio afectadas.
- Pruebas y validaciones ejecutadas.
- Riesgos o pendientes.