# Guía de publicación – ProyectoPlasticaribe

Cómo publicar el proyecto web en los entornos de **pruebas (BETA)** y **producción**, con el versionamiento automático.

## 1. Arquitectura

| | Producción | Pruebas (BETA) |
|---|---|---|
| Sitio web | 192.168.0.85 | 192.168.0.250 |
| APIs (puertos 9085, 9095, 9055, 9065) | 192.168.0.85 | 192.168.0.250 |
| Bases de datos (todas en el .250) | `PlasticaribeBDD`, `plasticaribe`, `Inventario` | `PlasticaribeBDD_Test`, `plasticaribe2`, `Inventario_Prea21` |
| Contabilidad Zeus | Producción | Producción (por decisión del equipo) |
| Comando de build | `npm run build:prod` | `npm run build:beta` |
| Archivo de entorno | `src/environments/environment.prod.ts` | `src/environments/environment.beta.ts` |

Cada comando genera la versión completa del sitio: rutas de las APIs, título de la pestaña y distintivo BETA.
**Ya no se edita a mano ni el `index.html` ni las IPs.**

## 2. Orden de los comandos

Primero se sube la versión y después se compila, porque el build toma la versión que tenga `package.json` en ese momento.
La versión se sube **una sola vez por entrega**. La misma versión validada en BETA es la que pasa a producción.

```
1. npm run version:parche   ← una sola vez, al empezar la entrega
2. npm run build:beta       → copiar al .250 y probar
3. npm run build:prod       → copiar al .85 (sin volver a subir la versión)
```

Todos los comandos se ejecutan en la carpeta `Proyecto/ProyectoPlasticaribe`.

## 3. Paso a paso

### Paso 1. Subir la versión

| Tipo de cambio | Comando | Ejemplo |
|---|---|---|
| Corrección | `npm run version:parche` | 7.2.5 → 7.2.6 |
| Funcionalidad nueva | `npm run version:menor` | 7.2.6 → 7.3.0 |
| Cambio grande | `npm run version:mayor` | 7.3.0 → 8.0.0 |

El comando actualiza `package.json`, `package-lock.json` y `src/environments/version.ts`.
Hay que hacer commit de los tres archivos. El comando no crea commits ni tags de git.

> `src/environments/version.ts` se genera automáticamente. No se edita a mano.

### Paso 2. Publicar en pruebas (.250)

1. Ejecutar `npm run build:beta`. La consola debe mostrar `Versión de la aplicación: X.Y.Z`.
2. El resultado queda en `dist/proyecto-plasticaribe/`.
3. En el .250, hacer una copia de la carpeta actual del sitio en `inetpub`. Esa copia es el respaldo para volver atrás.
4. Reemplazar el contenido de la carpeta del sitio por el de `dist/proyecto-plasticaribe/`.
   - ⚠️ **No borrar el `web.config`** de la carpeta del sitio. El build no lo genera, e IIS lo necesita para las rutas de Angular.
5. Validar con la lista de la sección 4.

### Paso 3. Publicar en producción (.85)

Solo después de validar la versión en pruebas.

1. Ejecutar `npm run build:prod`.
2. Repetir los puntos 2 a 4 del paso anterior, ahora en el .85.
3. Validar con la lista de la sección 4.

> El build siempre usa la misma carpeta `dist/`. Hay que copiar al servidor **justo después de compilar**, para no publicar en producción un build beta ni al revés.

### Casos especiales

- **Se encontró un error en pruebas y se corrigió:** volver a ejecutar `npm run version:parche` antes del siguiente `build:beta`. Así cada build distinto que llega al .250 tiene su propio número.
- **Solo se vuelve a publicar lo mismo** (por ejemplo, porque se copió mal la carpeta): no hace falta subir la versión.

## 4. Verificación después de publicar

Abrir el sitio con **Ctrl + F5** para limpiar la caché.

| Verificar | Pruebas (.250) | Producción (.85) |
|---|---|---|
| Título de la pestaña | PLASTICARIBE (BETA) | Plasticaribe |
| Login: verificación de conexión | Sin errores | Sin errores |
| Login: distintivo BETA bajo el logo | Sí | No |
| Login: versión al pie | `vX.Y.Z` | `vX.Y.Z` |
| Header: BETA junto al logo | Sí | No |
| Menú lateral bajo el logo | `BETA vX.Y.Z` | `vX.Y.Z` |
| F12 → Red: las peticiones van a | `192.168.0.250:90xx` | `192.168.0.85:90xx` |

## 5. Volver a la versión anterior

Si algo falla, restaurar la copia de la carpeta hecha en el paso 2.3 y recargar con Ctrl + F5.

## 6. Recordatorios de las APIs (Visual Studio)

- **.250 (pruebas):** publicar con el entorno `Development`, que usa las bases de pruebas. Ejemplo: el perfil `Testing` de BagPro.
- **.85 (producción):** publicar con el entorno `Production`. Ejemplo: el perfil `Servidor_BagPro`.
- Al arrancar, la consola de cada API muestra `ENTORNO:` y `BASE DE DATOS:`. Es la forma rápida de confirmar a qué base apunta.
- **CORS:** BagPro y PlasticaribeAPI permiten `http://192.168.0.85:4700` y `http://192.168.0.250:4700`. Si cambia el puerto de algún sitio web, hay que agregarlo en `Program.cs` de las APIs.

## 7. Archivos involucrados

| Archivo | Para qué sirve |
|---|---|
| `package.json` → `version` | Versión oficial de la aplicación |
| `scripts/generar-version.js` | Genera `version.ts` antes de cada build |
| `src/environments/version.ts` | Versión que muestra la app (archivo generado) |
| `src/environments/environment.prod.ts` | Rutas de las APIs del .85, `esBeta: false` |
| `src/environments/environment.beta.ts` | Rutas de las APIs del .250, `esBeta: true` |
| `src/index.beta.html` | `index.html` con el título "PLASTICARIBE (BETA)" |
| `angular.json` → configuración `beta` | Usa `environment.beta.ts` e `index.beta.html` |
