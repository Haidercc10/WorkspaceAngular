# `(Nombre App)`

`(Nombre app)` es una aplicación web desarrollada en Angular para la empresa Plasticaribe SAS de la ciudad de barranquilla. Esta aplicación busca realizar reportes de ventas, facturación, movimientos, mejorar el control de las existencias de materias primas, productos, etc.

Al Ingresar a la aplicación por primera vez nos topamos con un login.
![Login](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Login.jpg)

Tenemos 2 opciones para ingresar:
+ Iniciando Sesión con nuestro usuario y contraseña
- Como invitados.

## Gestión de Archivos
Si iniciamos como invitados se nos direccionará a una apartado donde podemos ver los archivos de una carpeta alojada en el servidor llamada "Calidad", aquá podremos subir, descargar y eliminar archivos de la carpeta, tambien podemos crear subcarpetas, copiar, mover y pegar carpetas y archivs. ![Gestion de archivos](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Gestion%20de%20Archivos.jpg)

## Dashboard
Al iniciar sesión con nuestras credenciales se nos redirecciona al dashboard donde dependiendo del rol que tengamos veremos o no cierta información.

1. Ordenes de Trabajo
   - Cantidades producidas por cada uno de los procesos en el mes.
   - Estados de las ordenes de trabajo del mes.
   - Cantidad de ordenes de trabajo creadas en total y por material.
   - Clientes con más compras realizadas en el mes.
   - Productos más comprados en el mes.
   - Vendedores con más ventas en el mes.
   - Clientes con más ordenes de trabajo en el mes.
   - Productos con más ordenes de trabajo en el mes.
   - Vendedores con más ordenes de trabajo en el mes.
2. Facturación
   - Ventas del mes.
   - Iva ventas del mes.
   - Total ventas del mes.
   - Ventas del día.
   - Grafica de ventas del año organizadas por mes, con opción de elegir el año a graficar.
3. Materias Primas
   - Materias primas más usadas en el mes actual.
   - Mat. Prima Asignada vs Extruida.
   - Inventario de Materias Primas.
   - Ranking de materias primas asignadas hoy.
   - Ranking de Tintas creadas en el mes actual.
   - Cantidad de rollos de polipropileno biorientado.
   - Materias primas más usadas en el mes para crear tintas.
4. Pedidos
   - Cantidad Total de Pedidos.
   - Pedidos con ordenes de trabajo asociadas.
   - Listado de pedidos facturables.
   - Clientes con más pedidos vigentes.
   - Productos con más pedidos vigentes.
   - Vendedores con más pedidos vigentes.
5. Facturación Vendedores
   - Se podrá graficar las ventas de cada vendedor en los años escogidos, esto con el fin de hacer comparativas de ventas año a año y mes a mes.

- Un usuario con rol de `Administrador` o `Director Comercial` tendrá acceso a todo en el dashboard.
* Un usuario con rol de `Presidencia` tendrá acceso a los `Pedidos` del dashboard.
+ Un usuario con rol de `Vendedor` tendrá acceso a `Facturación Vendedores` en el dashboard.
- Un usuario con rol de `Operario Materia Prima` tendrá acceso a `Materias Primas` en el dashboard.
![Dahboard](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Dashboard.jpg)

El resto de roles verán lo siguiente:
![Dahboard2](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Dashboard2.jpg)

## Modulos de la Aplicación
1. Bodega Extrusión.
2. BOPP / BOPA / Poliester
3. Despacho.
4. Desperdicio.
5. Gestor de Archivos.
6. Materia Prima.
7. Mantenimiento de Activos.
8. Movimientos.
9. Maquilas. 
10. Orden de Trabajo.
11. Pedidos.
12. Productos.
13. Reportes.
14. Tickets.
15. Usuarios.
