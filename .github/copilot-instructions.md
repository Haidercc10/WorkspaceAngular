# Instrucciones generales de GitHub Copilot

Este repositorio pertenece al sistema empresarial Plasticaribe.

Antes de realizar cambios, consulta AGENTS.md y sigue sus
reglas generales.

## Análisis del código

- Busca primero implementaciones existentes.
- Revisa referencias y consumidores antes de cambiar métodos.
- Identifica las dependencias entre componentes, servicios y modelos.
- Cuando una funcionalidad consuma una API, identifica el endpoint
  y su contrato.
- No asumas que todos los datos proceden de una única API.
- Comprueba qué repositorios y archivos están disponibles antes
  de afirmar que has analizado toda la solución.

## Compatibilidad

- Mantener la compatibilidad con Angular 16.
- Respetar las versiones de las dependencias existentes.
- No incorporar nuevas librerías sin justificar su necesidad.
- Respetar los patrones existentes del proyecto.

## Calidad

- Priorizar soluciones mantenibles y seguras.
- Evitar duplicar lógica de negocio.
- Considerar manejo de errores, asincronía y rendimiento.
- Ejecutar las validaciones disponibles.
- Informar de las limitaciones cuando no sea posible validar.

## Convenciones obligatorias de modelos y base de datos

### 1. Nomenclatura de tablas y entidades

Toda entidad nueva debe seguir las convenciones
de nomenclatura utilizadas en Plasticaribe.

El nombre de la clase C# debe representar
claramente la entidad de negocio.

Ejemplo:
Tabla: AutorizacionExcesoOT
Clase: AutorizacionExcesoOT

### 2. Prefijos de columnas

Cada tabla debe tener un prefijo único y descriptivo.

Los campos propios de la tabla deben comenzar
con el prefijo establecido para esa entidad.

Ejemplo:

Tabla: AutorizacionExcesoOT
Prefijo: AutExOT_

Campos:
- AutExOT_Id
- AutExOT_OT
- AutExOT_CantidadAutorizada
- AutExOT_FechaAutorizacion
- AutExOT_Utilizada

No crear campos propios con nombres genéricos como:

- Id
- Fecha
- Cantidad
- Estado

### 3. Llaves primarias

La llave primaria debe utilizar el prefijo
de la tabla seguido de Id.

Ejemplo:

AutorizacionExcesoOT
    → AutExOT_Id

La PK debe configurarse explícitamente
en EF Core cuando sea necesario.

### 4. Llaves foráneas

OBLIGATORIO:

Toda llave foránea debe conservar exactamente
el nombre de la llave primaria de la tabla
a la que hace referencia.

Ejemplo:

Tabla: Asignacion_MateriaPrima
PK: AsigMP_Id

Tabla: AutorizacionExcesoOT
FK: AsigMP_Id

No renombrar la llave foránea como:

- AutExOT_AsigMP_Id
- AsignacionId
- IdAsignacion

La FK debe conservar:

- Nombre exacto.
- Tipo de dato compatible.
- Nulabilidad según la relación.
- Relación configurada correctamente.

Antes de crear una FK, inspeccionar la entidad
relacionada para identificar su PK real.

No inventar nombres de llaves foráneas.

### 5. Propiedades de navegación

Las propiedades de navegación pueden utilizar
nombres descriptivos en PascalCase.

Ejemplo:

public long AsigMP_Id { get; set; }

public Asignacion_MateriaPrima? Asignacion { get; set; }

Las propiedades de navegación no requieren
el prefijo de columnas de la tabla.

### 6. Entity Framework Core

Antes de crear o modificar una entidad:

1. Inspeccionar modelos relacionados.
2. Identificar los nombres reales de las PK.
3. Verificar los tipos de datos.
4. Definir el prefijo de la nueva entidad.
5. Configurar las relaciones correctamente.
6. Verificar que EF Core no genere columnas
   adicionales o llaves foráneas duplicadas.

No modificar nombres de columnas existentes
sin autorización explícita.

### 7. Migraciones

Las migraciones deben conservar los nombres
de tablas y columnas establecidos.

Antes de ejecutar una migración, verificar:

- Nombres de columnas.
- Llaves primarias.
- Llaves foráneas.
- Índices.
- Restricciones.
- Compatibilidad con tablas existentes.

Nunca ejecutar migraciones automáticamente
sin aprobación del usuario.

### 8. Aplicación de estas reglas

Estas convenciones son obligatorias para
entidades y tablas nuevas.

No renombrar automáticamente entidades,
columnas ni relaciones existentes.

Si se detectan nombres antiguos que no cumplen
las convenciones, informar al usuario y
solicitar autorización antes de cambiarlos.

Estas reglas deben ser revisadas periódicamente
para asegurar que se mantenga la consistencia
en toda la base de datos y el código del proyecto.

## Convención obligatoria de documentación de funciones

Toda función o método nuevo generado por IA debe incluir
comentarios de documentación antes de su declaración.

Esta regla aplica tanto al frontend como al backend.

### Backend: C# .NET

Utilizar comentarios XML de documentación:

/// <summary>
/// Describe brevemente qué hace el método.
/// </summary>
/// <param name="parametro">
/// Explica el propósito del parámetro.
/// </param>
/// <returns>
/// Describe el resultado del método.
/// </returns>

Reglas:

1. Documentar todos los métodos nuevos, públicos y privados.
2. Utilizar summary para explicar su responsabilidad.
3. Documentar todos los parámetros mediante param.
4. Documentar el resultado mediante returns cuando corresponda.
5. No incluir returns en métodos void.
6. Documentar excepciones relevantes cuando sea necesario.
7. Utilizar comentarios en español, claros y concisos.
8. No generar comentarios que simplemente repitan
   el nombre del método.
9. Mantener los comentarios actualizados cuando cambie
   el comportamiento del método.

### Frontend: Angular y TypeScript

Utilizar comentarios JSDoc:

/**
 * Describe brevemente qué hace la función.
 *
 * @param parametro Explica el propósito del parámetro.
 * @returns Describe el resultado de la función.
 */

Reglas:

1. Documentar todas las funciones y métodos nuevos.
2. Documentar funciones públicas y privadas.
3. Documentar métodos de componentes y servicios.
4. Documentar los parámetros mediante @param.
5. Documentar el resultado mediante @returns cuando corresponda.
6. No utilizar @returns en funciones void.
7. Utilizar comentarios en español.
8. Evitar comentarios redundantes.
9. Actualizar la documentación cuando cambie la lógica.

### Modificación de funciones existentes

Cuando se modifique una función existente:

- Si ya tiene documentación, actualizarla si es necesario.
- Si no tiene documentación, agregarla.
- No documentar funciones ajenas al alcance de la tarea.

### Restricciones

No agregar comentarios innecesarios en cada línea de código.

No utilizar comentarios para explicar sintaxis evidente.

Priorizar la explicación de:

- Responsabilidad del método.
- Parámetros.
- Resultado.
- Reglas de negocio importantes.
- Efectos secundarios relevantes.