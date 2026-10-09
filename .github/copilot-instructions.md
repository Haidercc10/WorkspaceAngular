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