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

## Confirmaciones (estándar único)
Toda confirmación o aviso que pida una decisión usa `p-confirmDialog` con este diseño. No crear diseños de
confirmación distintos (recuadros de color, botones azules, toasts). Reemplaza poco a poco al toast amarillo de
confirmación (`p-toast` con botones Sí/No) de las páginas que aún lo usan: al tocar una de esas páginas, migrarla.
Ejemplos: Calendario (eliminar evento), registro-component (inactivar usuarios), PaginaPrincipal (tickets pendientes).
- Tarjeta blanca del tema, título a la izquierda (sin ícono), botón X arriba a la derecha.
- Mensaje con ícono según el caso: `pi pi-info-circle` (información), `pi pi-exclamation-triangle` (advertencia o
  acción delicada), `pi pi-times-circle` (error), `pi pi-question-circle` (pregunta).
- Acción principal: siempre el rojo del logo (`p-button-danger`) y con el verbo de la acción ("Eliminar",
  "Inactivar", "Ver tickets"), no "Sí". Cancelar: gris (`p-button-text p-button-secondary`), texto "Cancelar".
- Tercera acción (opcional): outline (`p-button-outlined p-button-danger`), entre Cancelar y la principal.
- Enter acepta (`defaultFocus: 'accept'`); Esc o la X cancelan.
- Solo colores de la paleta: no agregar estilos de color propios al confirm. styles.css solo fija el color del
  título (`.p-dialog.p-confirm-dialog .p-dialog-title`) para que reglas `::ng-deep` de otras vistas no lo cambien.

```html
<p-confirmDialog key="eliminarEvento" [style]="{width: '28rem'}" [breakpoints]="{'640px': '92vw'}"></p-confirmDialog>
```
```ts
this.confirmationService.confirm({
  key: 'eliminarEvento',
  header: 'Eliminar evento',
  message: `¿Seguro que desea eliminar el evento <b>${nombre}</b>? Esta acción no se puede deshacer.`,
  icon: 'pi pi-exclamation-triangle',
  acceptLabel: 'Eliminar',
  rejectLabel: 'Cancelar',
  acceptButtonStyleClass: 'p-button-danger',
  rejectButtonStyleClass: 'p-button-text p-button-secondary',
  defaultFocus: 'accept',
  accept: () => this.eliminar(),
});
```
Con tercera acción, footer propio (el mensaje, el ícono y el título siguen saliendo de `confirm()`):
```html
<p-confirmDialog #cd key="guardarCambios" [style]="{width: '30rem'}" [breakpoints]="{'640px': '92vw'}">
  <ng-template pTemplate="footer">
    <button pButton type="button" label="Cancelar" icon="pi pi-times" class="p-button-text p-button-secondary" (click)="cd.reject()"></button>
    <button pButton type="button" label="Guardar como borrador" icon="pi pi-file" class="p-button-outlined p-button-danger" (click)="cd.hide(); guardarBorrador()"></button>
    <button pButton type="button" label="Guardar" icon="pi pi-check" class="p-button-danger" (click)="cd.accept()"></button>
  </ng-template>
</p-confirmDialog>
```

## Flujo de trabajo del usuario
- El usuario publica, configura, depura y prueba en Visual Studio Community.
- No modificar perfiles de publicación, appsettings.Production.json
  ni environment.prod.ts.
- No commitear cambios locales de environment.ts.
- No hacer commits ni push salvo que el usuario lo pida.