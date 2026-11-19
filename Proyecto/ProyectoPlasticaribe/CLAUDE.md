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

## Paleta de colores oficial (Plasticaribe)
La paleta está definida en `src/styles.css` (fuente de verdad; revisarla antes de aplicar estilos).
- Usar SOLO las variables de la paleta con `var(--nombre)`. No inventar colores hex/rgb nuevos
  ni colores aleatorios en CSS, SCSS, HTML o TS.
- Si falta un color: preguntar al usuario y, si lo aprueba, agregarlo en `src/styles.css` con su
  valor para tema claro y oscuro (bloque `:root:has(#app-theme[href*="dark"])`), nunca fijo en el componente.
- Marca: `--rojo` (botones/acentos), `--rojoHover`, `--rojoClaro`, `--rojo-texto` (texto y bordes rojos),
  `--azul-marca`, `--azul-marca-medio`, `--azul-marca-claro`, `--fondo-acento`.
  Títulos y menú van en rojo (decisión del usuario; el azul marino ahí fue rechazado).
- Neutros fijos (no cambian con el tema): `--gris-100` … `--gris-800`, en vez de #ccc, #ddd, #eee sueltos.
- Fondos y textos que deben cambiar con el tema: primero las de PrimeNG (`--surface-card`,
  `--surface-overlay`, `--surface-ground`, `--surface-border`, `--surface-hover`, `--text-color`,
  `--text-color-secondary`); luego las propias `--texto-fuerte`, `--fondo-sutil`, `--borde-sutil`.
- Estados: `--fondo-info`/`--texto-info`, `--fondo-peligro`/`--texto-peligro`,
  `--fondo-advertencia`/`--texto-advertencia`, `--fondo-exito`/`--texto-exito`,
  `--fondo-obligatorio`/`--borde-obligatorio`, `--fondo-contador`/`--texto-contador`.
- Gráficas: series `--grafica-1` … `--grafica-8` en ese orden, texto encima `--grafica-N-texto`,
  cuadrícula `--rejilla-graficas`. En TS usar `src/app/Servicios/Tema/Paleta.ts`
  (`PALETA_GRAFICAS`, `colorSerieGrafica`, `rellenoSerieGrafica`, `colorTextoGrafica`, `COLOR_REJILLA_GRAFICA`).
- Modo oscuro: reaccionar al tema con `alCambiarTema` de `src/app/Servicios/Tema/Tema.service.ts`,
  nunca con `setInterval`.
- Excepciones conocidas con colores fijos: PDF (pdfmake), el azul del tema PrimeNG lara y `.botonGris`.

## Flujo de trabajo del usuario
- El usuario publica, configura, depura y prueba en Visual Studio Community.
- No modificar perfiles de publicación, appsettings.Production.json
  ni environment.prod.ts.
- No commitear cambios locales de environment.ts.
- No hacer commits ni push salvo que el usuario lo pida.