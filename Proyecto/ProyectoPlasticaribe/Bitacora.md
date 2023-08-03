# `Bitacora de Ideas y Actualizaciones`

En esta bitacora se estarán registrando todos los posibles cambios que se deben y pueden implementar en la aplicación, así como los cambios ya realizados.

## 
### `Movimientos.` (Terminado).
1. TERMINAR DE MEJORAR Y COMBINAR LOS FILTROS DE BUSQUEDA DE LOS MOVIMIENTOS
2. Añadir a los movientos las tintas y el BOPP.
3. Ingresar las tintas a los filtros de movimientos.
4. Realizar busqueda de ordenes por estado.
5. Combinar el filtro de estado con los otros filtros.
6. Hacer que el input donde se muestra el BOPP se llene cada vez que se cambie la fecha con el BOPP utilizado en la fecha indicada.

##
### `Edición de Materias Primas.` (Terminado).
Se podrán editar las materias primas, tintas y biorientados desde el reporte de inventario de materias primas

##
### `Tintas.` (Terminado).
1. Vista de asignación de materia prima para crear Tintas.
2. Crear Tintas.
6. Crear la asignacion de tintas a una OT.
    - Mover inventario de materia prima y tintas al realizar un asignación.
7. Crear la asignacion de materia prima para la creacion de una tinta.

## Día 11/07/2023
### `Invergoal e Inversuez.` (Terminado).
1.  Se debe crear un apartado donde se puedan gestionar las facturas de invergoal e inversuez.
2.  Se deben crear consultas que devuelvan las facturas pendientes de cada proveedor, el valor total.

## Día 13/07/2023
### `Dashboard de Cuentas por Pagar.` (Terminado).
Se ha añadido al dashboard de cuentas por pagar las facturas de invergoal e inversuez que se han añadido y/o insertado desde el nuevo programa a la base de datos, tabla 'Facturas_Invergoal_Inversuez'.

### `Nuevo Modulo.` (Terminado).
Se creará un modelo donde se podrán ver los roles que existen y se podrán editar las vistas a las que tiene acceso.

### `Sistema de Gestión.` (Terminado).
Cambiar nombre de Gestor de Archivos a Sistema de Gestión.

### `Recursos Humanos.` (Terminado).
Crear usuarios para recursos humanos, van a poder ver nomina y sistema de gestion.

### `Dashboard de Gerencia.` (Terminado).
Se debe crear una pesataña con las siguientes graficas:
1.  Facturación.
2.  Compras.
3.  Cuentas por cobrar
4.  Cuentas por pagar.
5.  Inventario Materia prima.
6.  Inventario producto temrinado.

## Día 15/07/2023
### `Dashboard de Gerencia.` (Terminado).
Para hacer que en el dashboard de gerencia se puedan ver por años los datos de los costos del inventario de materia prima y producto terminado se puede crear una tabla en la que guarde lo siguiente:
1.  Descripción: Será el nombre del registro/tabla/area, Ejemplos: 'Inventario Materia Prima', 'Inventario Producto Terminado', 'Facturación'.
2.  Enero, ..., Diciembre: Tendrán las cantidades correspondientes a cada una.
3.  Año: Tendrá el año del cual son los registros que se están almacenando.

## Día 24/07/2023
### `Costos Empresas Años.` (Terminado).
Se crearon jobs para insertar y actualizar en la tabla `Costos_Empresas_Anios` los costos monetarios de diferentes campos de la empresa, por ejemplo: facturación, inventarios, compras, etc...
Los jobs que se crearon fueron los siguientes:
1.  Compras_Mensuales_Invergoal: Se encargará de buscar, almacenar y/o actualizar los costos mes a mes de las compras que realizó la empresa Invergoal.
2.  Compras_Mensuales_Inversuez: Se encargará de buscar, almacenar y/o actualizar los costos mes a mes de las compras que realizó la empresa Inversuez.
3.  Compras_Mensuales_Plasticaribe: Se encargará de buscar, almacenar y/o actualizar los costos mes a mes de las compras que realizó la empresa Plasticaribe.
4.  Costo_Indirecto_Fabricacion_Mensuales: Se encargará de buscar, almacenar y/o actualizar los costos mes a mes de las siguiente cuentas `730545`, `730590`, `730525`, `730530`, `730555`, `730550`, `730540`, `730565`, `730570`, `730560`, `740505`, `720551`.
5.  Cuentas_Mensuales_Por_Cobrar: Se encargará de buscar, almacenar y/o actualizar los costos mes a mes del total de dinero que los clientes le deben a la empresa.
6.  Cuentas_Mensuales_Por_Pagar_Invergoal: Se encargará de buscar, almacenar y/o actualizar los costos mes a mes del costo total de lo que la empresa Invergoal está debiendo.
7.  Cuentas_Mensuales_Por_Pagar_Inversuez: Se encargará de buscar, almacenar y/o actualizar los costos mes a mes del costo total de lo que la empresa Inversuez está debiendo.
8.  Cuentas_Mensuales_Por_Pagar_Plasticaribe: Se encargará de buscar, almacenar y/o actualizar los costos mes a mes del costo total de lo que la empresa Plasticaribe está debiendo.
9.  Facturacion_Mensual_Plasticaribe: Se encargará de buscar, almacenar y/o actualizar la información de la cantidad de dinero que la empresa Plasticaribe factura en cada uno de los meses.
10.  Gastos_Mensuales_Administracion: Se encargará de buscar, almacenar y/o actualizar los costos mes a mes de las siguiente cuentas `5110`, `5115`, `5125`, `5130`, `513505`, `513510`, `513520`, `513525`, `513530`, `513535`, `513540`, `513550`, `5145`, `5155`, `5195`.
11. Gastos_Mensuales_No_Operacionales: Se encargará de buscar, almacenar y/o actualizar los costos mes a mes de las siguiente cuentas `53050505`, `53050510`, `530515`, `530525`, `530535`, `530595`.
12. Gastos_Mensuales_Ventas: Se encargará de buscar, almacenar y/o actualizar los costos mes a mes de las siguiente cuentas `5210`, `5215`, `5230`, `523505`, `523510`, `523520`, `523525`, `523530`, `523535`, `523540`, `523550`, `5254`, `5250`, `5255`, `5295`.
13. Inventario_Mensual_MateriaPrima: Se encargará de buscar, almacenar y/o actualizar la información de la sumatoria de los costos de materia prima con los que iniciarán cada uno de los meses.
14. Inventario_Mensual_Productos: Se encargará de buscar, almacenar y/o actualizar la información de la sumatoria de los costos de los productos terminados con los que iniciarán cada uno de los meses.

## Día 27/07/2023
### `Dashboard de Costos.` (Terminado).
1.  Se debe poder hacer que la información que va a aparecer en el archivo de excel se pueda buscar por medio de un rango de fechas, esto debe ser totalmente opcional.
3.  Si no se selecciona un rango de fechas se debe ver la información de los años que están graficados.
4.  Si se seleccionar un rango de fechas se deben mostar en el excel solamente los meses que se encuentre entre el rango de fechas.

## Día 02/08/2023
### `Dashboard de Costos.`
1.  Se debe verificar que las cuentas que se están tomando no tengan ningún tipo de relación con las empresas Invergoal e Inversuez.
2.  Se debe quitar algunas facturas de algunas cuentas, para ello se creará un modulo en el que se tendrán que ingresar las facturas que se deben quitar y posteriormente se sumará el costo total y se restará del total que aparece en la grafica.

### `Dashboard Cuentas por Pagar y Dashboard Compras.`
Se debe verificar el costo de las compras de materia prima.