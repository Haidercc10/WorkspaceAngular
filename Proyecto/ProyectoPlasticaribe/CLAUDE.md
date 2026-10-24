@AGENTS.md

# Instrucciones adicionales para Claude Code

## Directorio de trabajo
Los 5 repositorios están en la misma carpeta padre. Cada uno es un repo Git
independiente: revisar `git status` en el repo correspondiente, no en la raíz.

## Compilación y validación
- WorkspaceAngular: `npm run build` (no ejecutar `npm install` ni actualizar paquetes sin autorización).
- APIs .NET: `dotnet build` dentro de la carpeta del proyecto.
- PlasticaribeWebAPI tiene proyecto de tests: ejecutar `dotnet test` si se modifica.

## Entity Framework Core
- ApiZeusInventario, BagPro_WebAPI, ZeusContabilidadAPI (Database First):
  NO editar entidades ni DbContext generados por scaffolding.
  Extender con clases `partial`. Si la BD cambia, indicar el comando
  Scaffold-DbContext necesario; no ejecutarlo.
- PlasticaribeWebAPI (Code First): se pueden crear migraciones con
  `dotnet ef migrations add`, pero NUNCA ejecutar `dotnet ef database update`.
  Mostrar el SQL de la migración para revisión.

## Flujo de trabajo del usuario
- El usuario publica, configura, depura y prueba en Visual Studio Community.
- No modificar perfiles de publicación, appsettings.Production.json
  ni environment.prod.ts.
- No commitear cambios locales de environment.ts.
- No hacer commits ni push salvo que el usuario lo pida.