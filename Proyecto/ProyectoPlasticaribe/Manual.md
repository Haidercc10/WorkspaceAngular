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

# Roles
| Codigo | Nombre                  | Descripción |
| ------ | ----------------------- | ----------- |
| 1      | Administrador           | Persona que tiene acceso de todos los precesos del software. |
| 2      | Vendedor                | Personas que son del área de Ventas de la empresa. |
| 3      | Operario Materia Prima  | Persona que lleva control de la materia prima |
| 4	     | Operario BOPP	         | Persona lleva control de la materia prima de tipo BOPP |
| 5	     | Calidad	               | Será quien se encargará de la parte de calidad de la empresa |
| 6	     | Facturación	           | Persona encargada de realizar la facturación de pedidos |
| 7	     | Superior Extrusion	     | Persona que es Jefe de extrusion |
| 8	     | Superior Sellado	       | Persona que es Jefe de Sellado |
| 9	     | Superior Empaque	       | Persona que es Jefe de Empaque |
| 10     | Superior Despacho	     | Persona que está encargada del área de despacho |
| 11     | Conductor	             | Es el encargado de llevar el producto terminado hasta las oficinas del cliente. |
| 12     | Producción	             | Persona encargada de velar por la producción |
| 13     | Orden de Compra	       | Personas encargadas de crear ordenes de compra de materia prima |
| 59     | Operarios de Producción | Personas del área de producción |
| 60     | Director Comercial	     | Persona a cargo del área comercial |
| 61     | Presidencia	           | Persona del área de presidencia |

# Modulos de la Aplicación
1. [Bodega Extrusión.](#bodega-extrusión)
2. [BOPP / BOPA / Poliester.](#bopp--bopa--poliester)
3. [Despacho.](#despacho)
4. [Desperdicio.](#desperdicio)
5. [Gestor de Archivos.](#gestión-de-archivos)
6. [Materia Prima.](#materia-prima)
7. [Mantenimiento de Activos.](#matenimiento-de-activos)
8. [Movimientos.](#movimientos)
9. [Maquilas.](#maquilas)
10. [Orden de Trabajo.](#orden-de-trabajo)
11. [Pedidos.](#pedidos)
12. [Productos.](#productos)
13. [Reportes.](#reportes)
14. [Tickets.](#tickets)
15. [Usuarios.](#usuarios)

## `Bodega Extrusión`
En este módulo tenemos diferentes acciones que son: 
1. Elimiar Rollos: Esto nos permite eleminar rollos que fueron pesados en el sistema bagPro o rollos que fueron ingresados a la bodega de extrusión. Para eliminar rollos podemos consultar por diferentes filtros que son OT, Rollo, Procesos, Bodega Fechas.
Tenemos que elegir obligatoriamente una bodega. Una vez se consulte la información se cargarán todos los rollos dentro de los filtros consultados en la primera tabla, los podemos elegir y se cargarán en la segunda tabla, por último en la tercer tabla se cargarán de manera consolidad por productos los rollos que se escogieron. Presionamos el botón de 'Eliminar Rollos' y nos mandará un mensaje de confirmación.
![Elminar Rollos](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Bodega%20Extrusion/EliminarRollos.jpg)

2. Ingreso de Rollos: Desde aquí podemos ingresar rollos a la bodega de extrusión, rollos que ya han sido pesados en BagPro. Para hacer esto debemos seguir los siguientes pasos:
    1. Llenar los filtros por los que vamos a buscar los rollos y luego presionar el botón "Consultar Rollos" y nos trará los rollos que se encuentran dentro de los filtros o presionar directamente el botón "Consultar Rollos" y esto nos traerá todos los rollos que no han sido ingresados.
    2. Los rollos se cargarán en la primera tabla, aquí podemos ver que el último campo de la tabla es un checkbox que al presionar nos envía el rollo a la tabla número 2 y lo elimina de la tabla número 1.
    3. En la tabla número 2 se encuentran todos los rollos que elegimos para ingresar y de igual manera tienen un checkbox en la última columna, este hace lo contrario al de la primera tabla, lo quita de la 2 y lo coloca en la 1.
    4. En la tabla 3 tenemos un consolidado de los rollos que hemos elegido, podemos ver que producto es, la cantidad de rollos, el peso sumado de todos los rollos y la presentación.
    5. Al tener en la tabla 2 todos los rollos que queremos ingresar podemos presionar el botón "Ingresar Rollos" saldrá un icono de carga (la carga dependerá de la cantidad de rollos que vayamos a ingresar). Luego de cargar aparecerá un mensaje en color verde que indicará que los rollos han sido ingresados a la base de datos.

![Ingresar Rollos a Extrusión](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Bodega%20Extrusion/IngresarRollosExtrusion.jpg)

3. Inventario de Extrusión: Aquí podremos ver los rollos que hay en bodega aún, veremos el nombre del producto, el peso total y si presionamos doble click sobre alguno veremos un modal con los rollos de ese producto.

![Inventario Rollos Extrusión](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Bodega%20Extrusion/InventarioRollosExtrusion.jpg)
![Inventario Rollos Extrusión](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Bodega%20Extrusion/InventarioRollosExtrusion2.jpg)

4. Bodega Extrusión: Aquí vamos a consultar y ver los movimientos que hemos realizado, llamese movimientos lo que es entradas y salidas de rollos. Debemos llenar los filtros o simplemente presionar el boton para consultar, si no se llenan los filtros el programa automaticamente buscará por el día actual.

![Inventario Rollos Extrusión](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Bodega%20Extrusion/BodegaExtrusion.jpg)

5. Salida de Rollos: Este funciona exactamente igual que el Ingreso de Rollos.

![Salida Rollos Extrusión](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Bodega%20Extrusion/SalidaRollosExtrusion.jpg)

Todos los botones de "Limpiar campos" borrarán de los campos la información digitada.

## `BOPP / BOPA / POLIESTER`
Desde este módulo se controlan los movimientos que tienen los biorientados. Se pueden hacer asignaciones y entradas de biorientados:
1. Asignación de BOPP / BOPA / POLIESTER: Desde aqui podremos asignar rollos biorientados a ordenes de trabajo para hacerlo debemos seguir estos pasos: 
    1. Consultar la orden a la que haremos la asignación. Esta se cargará en una tabla y desde la misma tabla se podrá quitar presionando el icono de basura de la última columna.
    2. Elegir el rollo que vamos a asignar, una vez elegido el rollo la información de este se colocará en una tabla y desde esta mismo podremos cambiar la cantidad de kilos a asignar (siempre cantidades menores o iguales a las que tiene el rollo). Podemos elegir multiples rollos.
    3. Presionamos "Crear Asignación y listo".
    4. Nota: Se pueden elegir varias ordenes de trabajo pero al hacer esto cada uno de los rollos elegidos se dividiran entre la cantidad de ordenes que hayan sido elegidas.

![Asignación de Biorientados](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Biorientados/Asignacion.jpg)

2. Entrada de BOPP / BOPA / POLIESTER: En este apartado podemos realizar entradas de rollos siguiendo estos pasos:
Inicialmente tenemos 2 formas de realizar las entradas, 1) Por Facturas o Remisiones y 2) Entradas sin Facturas o Remisiones. 
    1. Entradas por Facturas o Remisiones (solo es posible si tenemos una orden de compra):
        1. Diligenciamos el campo "Orden de Compra" o "OC" y presinamos Enter.
        2. Nos aparecerán los rollos a ingresar en la tabla y si no está ingresado le aparecerá un check.
        3. Al presionar el check se cargará la información del rollo en los campos inferiores, se presiona "Añadir Material" y se enviará a la tabla.
        4. Llenamos el campo Factura o Remisión con el codigo de una de estas 2.
        5. Por último solo debemos presionar "Crear Entrada" y listo, todo se habrá enviado a la base de datos.
    2. Entradas sin Facturas o Remisiones:
        1. Llenamos los campos con la información del biorientado.
        2. Lo añadimos a la tabla.
        3. Creamos la Entrada.

![Entradas de Biorientados](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Biorientados/Entradas.jpg)    

3. Inventario de BOPP / BOPA / POLIESTER: 
    - Desde aquí podremos ver de manera detallada la información de los rollos biorientados que hay en la bodega de inventario actualmente. 
    + Tambien podemos filtar si quieremos buscar un rollo en especifico, podemos ver el movimiento que tuvo un rollo en una rango de fechas. 
    * Podemos exportar la información a un archivo de excel.

![Inventario de Biorientados](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Biorientados/Inventario.jpg)  

4. Movimientos de Boirientados: Aquí vamos a consultar y ver los movimientos que hemos realizado, llamese movimientos lo que es entradas y asignaciones de rollos. Debemos llenar los filtros o simplemente presionar el boton para consultar, si no se llenan los filtros el programa automaticamente buscará por el día actual.

![Movimientos de Biorientados](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Biorientados/Movimientos.jpg)

Todos los botones de "Limpiar campos" borrarán de los campos la información digitada.

## `Despacho`
En este modulo se podrá pre-ingresar, ingresar, facturar, dar salida, devolver y ver movmientos de rollos.
1. Ingresar Rollos: Desde aquí podemos ingresar rollos a la bodega de extrusión, rollos que ya han sido pesados en BagPro. Para hacer esto debemos seguir los siguientes pasos:
    1. Llenar los filtros por los que vamos a buscar los rollos y luego presionar el botón "Consultar Rollos" y nos traerá los rollos que se encuentran dentro de los filtros o presionar directamente el botón "Consultar Rollos" y esto nos traerá todos los rollos que no han sido ingresados.
    2. Los rollos se cargarán en la primera tabla, aquí podemos ver que el último campo de la tabla es un checkbox que al presionar nos envía el rollo a la tabla número 2 y lo elimina de la tabla número 1.
    3. En la tabla número 2 se encuentran todos los rollos que elegimos para ingresar y de igual manera tienen un checkbox en la última columna, este hace lo contrario al de la primera tabla, lo quita de la 2 y lo coloca en la 1.
    4. En la tabla 3 tenemos un consolidado de los rollos que hemos elegido, podemos ver que producto es, la cantidad de rollos, el peso sumado de todos los rollos y la presentación.
    5. Al tener en la tabla 2 todos los rollos que queremos ingresar podemos presionar el botón "Ingresar Rollos" saldrá un icono de carga (la carga dependerá de la cantidad de rollos que vayamos a ingresar). Luego de cargar aparecerá un mensaje en color verde que indicará que los rollos han sido ingresados a la base de datos.

![Ingreso de Rollos](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Despacho/IngresoRollos.jpg)

2. Facturar Rollos: Para facturar rollos debemos: 
    1. En el campo "Factura" colocar el código de la factura a la que estará asociado el rollo.
    2. El campo "Nota Credito" es opcional.
    3. "Cod. Producto", en este campo colocamos el codigo del producto y presionamos enter para que se busquen todos los rollos disponibles de ese producto.
    4. "Cant Item" es para colocar una cantidad exacta en kilos o unidades a paquetes depende de la presentación del producto.
    5. Elegimos el cliente en el campo "Cliente".
    6. "Observación es opcional".
    7. En la tabla 1 aparecerán los rollos disponibles.
    8. En la tabla 2 se irán colocando los rollos que se vayan eligiendo y se podrna editar las cantidades a enviar en la columna cantidad.
    9. En la tabla 3 apareceran de manera consolidada la informacion de los rollo elegidos.
    10. Se presiona "Facturar Rollos" y listo.
    11. En la parte inferior derecha hay unas flechas apuntando hacia abajo, estas son para ir al final de la pagina.

![Facturar Rollos](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Despacho/Facturar.jpg)

3. Despachar Mercancia: Desde aquí confirmamos la facturación de los rollos y debemos elegir que rollos van a salir, la placa del camión que los transportará y el vendedor que se lo lleva.

![Despachar Rollos](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Despacho/Despachar.jpg)

4. Devolución de Mercancia: Para realizar una devolución debemos:
    1. Colocar la factura a la que se le realiza la devolución.
    2. Elegir los rollos a devolver.
    3. Presionar el boton de Devolución.

![Devolución de Rollos](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Despacho/Devolucion.jpg)

5. Movimientos Despacho: Aquí vamos a consultar y ver los movimientos que hemos realizado, llamese movimientos lo que es  pre-ingreso, ingreso, factura, salida, devolución de rollos. Debemos llenar los filtros o simplemente presionar el boton para consultar, si no se llenan los filtros el programa automaticamente buscará por el día actual.

![Movimientos de Rollos](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Despacho/Movimientos.jpg)

6. Pre ingresos: Para ingresar los rollos estos primero deben ser Pre-Ingresados. Los Pre-Ingresos se dividen en 2: Extrusión y Sellado
    1. Llenar los filtros por los que vamos a buscar los rollos y luego presionar el botón "Consultar Productción" y nos traerá los rollos que se encuentran dentro de los filtros o presionar directamente el botón "Consultar Productción" y esto nos traerá todos los rollos que no han sido ingresados.
    2. Los rollos se cargarán en la primera tabla, aquí podemos ver que el último campo de la tabla es un checkbox que al presionar nos envía el rollo a la tabla número 2 y lo elimina de la tabla número 1.
    3. En la tabla número 2 se encuentran todos los rollos que elegimos para ingresar y de igual manera tienen un checkbox en la última columna, este hace lo contrario al de la primera tabla, lo quita de la 2 y lo coloca en la 1.
    4. En la tabla 3 tenemos un consolidado de los rollos que hemos elegido, podemos ver que producto es, la cantidad de rollos, el peso sumado de todos los rollos y la presentación.
    5. Al tener en la tabla 2 todos los rollos que queremos ingresar podemos presionar el botón "Ingresar Producción" saldrá un icono de carga (la carga dependerá de la cantidad de rollos que vayamos a ingresar). Luego de cargar aparecerá un mensaje en color verde que indicará que los rollos han sido ingresados a la base de datos.

![Pre-Ingreso de Rollos](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Despacho/Pre-Ingreso.jpg)

## `Desperdicio`
En el módulo se podrán ingresar los desperdicios generados por orden de trabajo y se podrán sacar reportes de esto.
1. Desperdicio: Para ingresar los desperdicios generados debes: 
    1. Consulta la OT y algunos capos esto se llenará solo y algunos de estos campos se puede editar.
    2. Llene todos los campos.
    3. Agregue el desperdicio a la tabla.
    4. Crear desperdicio para terminar.

![Desperdicio](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Desperdicio/Desperdicio.jpg)

2. Reporte de Desperdicios: Aquí se puede consultar los desperdicios que se han ingresado. 

![Desperdicio](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Desperdicio/Reporte.jpg)

## `Materia Prima`
En este módulo se podrán realizar movmientos de materia prima como asignaciones, entradas, creaciones, devoluciones, etc..
1. Asignación de Materia Prima: Para realizar una asignación de materia prima a una orden de trabajo debemos:
    1. Buscar la orden de trabajo, para esto digitamos el codigo de la orden en el campo OT y presionamos enter.
    2. Colocamos el número de la maquina a la que irá la materia prima.
    3. El campo de observación es opcional.
    4. En la tabla siguiente estará la información de la orden de trabajo consultado. La información será el cliente, el item, la cantidad de kg por demanda la orden y la cantidad de kilos que se le pueden asignar.
    5. Elegimos la materia prima buscandola en el campo Materia Prima donde podemos colocar su nombre o codigo y aparecerán unas opciones con base a lo digitado en el campo. Al elegir una de estas se llenarán los campos con la información de la materia prima a exepción de 2 que serán Cantidad y Proceso que se refieren a la cantidad a asignar y el proceso hacia el que irá respectivamente.
    6. Asignamos la materia prima para que se cargue en la tabla y podemos elegir otras o directamente realizar la asignación presionando el botón Asignar Materia Prima que se encuentra al final de todo.

![Asignación de Materia Primas](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Materia%20Prima/Asignacion.jpg)

2. Creación de Tintas: Para crear una tinta debemos escoger la materia prima con la que se creará y la cantidad, esto lo hacemos de la siguiente manera:
    1. Elegimos la tinta que queremos crear.
    2. Digitamos la cantidad a crear.
    3. Al elegir la tinta el campos Und se llenará automaticamente.
    4. La observación es opcional.
    5. Elegimos cada una de las materias primas con las que se creará la tinta y cada una le colocamos la cantidad correspondiente.
    6. las agregamos a la tabla.
    7. Finalmente presionamos Asignar Materia prima y listo, habremos creado una tinta.

![Creación de Tintas](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Materia%20Prima/CrearTinta.jpg)

3. Devoluciones: Las devoluciones se realizarán sobre asignaciones de materias primas.
    1. Buscar la orden de trabajo, para esto digitamos el codigo de la orden en el campo OT y presionamos enter.
    2. Se cargarán las materias primas que esta orden tiene asignadas.
    3. Escogemos las que se van a devovler y colocamos la cantidad correcta a devolver.
    4. Presionamos Agregar Devolucion y listo, devolución creada.

![Devolución de Materia Prima](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Materia%20Prima/Devolucion.jpg)

4. Entradas de Materias Primas: Para realizar una entrada de materia prima necesitamos obligatoriamente una Orden de Compra, desde ella se sabrá las materias primas y las cantidades que entrarán.
    1. Diligenciamos el campo "Orden de Compra" o "OC" y presinamos Enter.
    2. Nos aparecerán las materias primas a ingresar en la tabla y si no está ingresado le aparecerá un check.
    3. Al presionar el check se cargará la información de la materia prima en la tabla siguiente.
    4. Llenamos el campo Factura o Remisión con el codigo de una de estas 2.
    5. Por último solo debemos presionar "Agregar Factura" y listo, todo se habrá enviado a la base de datos.
    6. Si lo que estamos ingresando en una factura tenemos la opción de relacionarle una remisión, para ello desplemos el bloque.Añadir remisión a factura y buscamos el código de la remisión (esto es opcional).

![Entrada de Materia Prima](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Materia%20Prima/Entrada.jpg)

5. Inventario de Materia Prima:
    - Desde aquí podremos ver de manera detallada la información de todas las materias primas que hay en la bodega de inventario actualmente. 
    + Tambien podemos filtar si queremos buscar una materia prima en especifico, podemos ver el movimiento que tuvo un en una rango de fechas. 
    * Podemos exportar la información a un archivo de excel.
    - Podemos ver cada Subbodega como Polietilenoes, Tintas, Biorientados.

![Inventario de Materia Prima](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Materia%20Prima/Inventario.jpg)

6. Movimientos de Materia Prima: Se dividen en 2:
    1. Movimientos de Materia Prima: Aquí vamos a consultar y ver los movimientos que hemos realizado, llamese movimientos lo que es entradas y asignaciones, creaciones, devoluciones de polietilenos, tintas o biorientados. Debemos llenar los filtros o simplemente presionar el boton para consultar, si no se llenan los filtros el programa automaticamente buscará por el día actual.
    ![Movimientos de Materia Prima](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Materia%20Prima/Movimientos.jpg)
    2. Movimientos de Recuperado: Aquí vamos a consultar y ver los PELETIZADO que se han ingresado y las cantidades. Debemos llenar los filtros o simplemente presionar el boton para consultar, si no se llenan los filtros el programa automaticamente buscará por el día actual. Si presionamos doble click sobre la columna día o noche veremos de forma detallada cada ingreso.
    ![Movimientos de Recuperado](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Materia%20Prima/MovimientosRecuperado.jpg)
    ![Movimientos de Recuperado](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Materia%20Prima/MovimientosRecuperado2.jpg)

7. Movimientos de Ordenes de Compras: Aquí podemos ver las ordenes de compra que se han creado consultando los filtros.

![Movimientos Orden de Compra](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Materia%20Prima/MovimientosOrdenCompra.jpg)

8. Orden de Compra: Las ordenes de compra son documentos que soporte sobre las materias primas que se pidieron y necesitan ser ingresadas. Desde aquí las podemos crear de manera sencilla, ademas podemos crear proveedores y materias primas nuevas. Para realizar todo esto debemos:
    1. Diligenciamos el campo proveedor escribiendo el nombre, al escribir el nombre el programa lo buscará y lo podrás elegir. Si no existe el proveedor procedemos a crear uno nuevo.
        - Presionamos el botón Crear Proveedor y llenamos los campos.
        * Presionamos el botón crear proveedor y listo.
        ![Orden  de Compra](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Materia%20Prima/OrdenCompra.jpg)
    2. El campo observación es opcional.
    3. Elegimos la materia prima colocandole la cantidad y el precio. Si es una nueva la creamos de la misma manera que el proveedor. Pero debemos elegir el tipo de materia prima a crear.
        - Presionamos el botón Crear Materia Prima y llenamos los campos.
        * Presionamos el botón Crear Materia Prima y listo.
        ![Orden  de Compra](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Materia%20Prima/OrdenCompra2.jpg)
        ![Orden  de Compra](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Materia%20Prima/OrdenCompra3.jpg)
    4. Colocamos la materia prima en la tabla.
    5. Presionamos Crear Orden Compra y listo, aparecerá un mensaje preguntandonos si queremos ver la orden que acabamos de crear en un PDF.

![Orden  de Compra](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Materia%20Prima/OrdenCompra4.jpg)

9. Recuperado de Materia Prima: 
    1. Seleccionar Operario.
    2. Seleccionar Turno.
    3. Seleccionar Fecha de ingreso.
    4. Observacion es opcional.
    5. Elegir materia prima.
    6. Digitar cantidad de materia prima.
    7. Cargarla en la tabla.
    8. Crear registro.

![Recuperado](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Materia%20Prima/Recuperado.jpg)

## `Matenimiento de Activos`
El mantenimiento de activos es algo que se debe tener en cuenta para saber la vida util de cada artefacto usado por la empresa, por ello mediante el mantenimiento de estos podemos de cierta manera saberlo.

1. Pedidos de Mantenimiento: El pedido de mantenimiento será realizado por operarios y/o mecanicos que deben realizar alguna reparacion a una maquina a camión, etc. Esto se realizará de la siguiente manera:
    1. Se elegi el activo.
    2. Se coloca la fecha en que sufrió la averiación.
    3. El tipo de mantenimiento que necesita.
    4. Una descripción del daño (opcional).
    5. Se añade el activo y se crea el pedido.

![Pedido de Mantenimiento](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/activos/PedidoMantenimiento.jpg)

2. Mantenimiento: Desde este apartado se podrán ver los pedidos que están en espera de ser aprobados o cancelado. Se pueden buscar por los filtros.
    1. Al consultarse los pedidos, estos saldrán en la tabla con información general como el concecutivo, movimiento, fecha, hora, usuario, estado, observacion y finalmente nos saldrá una lupa.
    2. Al presionar click sobre la lupa vamos a poder ver y elegir el proveedor que realizará el arreglo, tambien podremos elegir el nuevo estado que tendrá el activo.

![Mantenimiento](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/activos/Mantenimiento.jpg)
![Mantenimiento](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/activos/Mantenimiento2.jpg)

3. Inventario Activos: Aqui podremos ver todos los activos que tiene la empresa, con algunos de sus costo.

![Activos](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/activos/Activos.jpg)

## `Movimientos`
En los movimientos podemos ver los movimientos (valga la redundancia) de todos los módulos de la aplicación.

1. Bodega Extrusión: Aquí vamos a consultar y ver los movimientos que hemos realizado, llamese movimientos lo que es entradas y salidas de rollos. Debemos llenar los filtros o simplemente presionar el boton para consultar, si no se llenan los filtros el programa automaticamente buscará por el día actual.

![Inventario Rollos Extrusión](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Bodega%20Extrusion/BodegaExtrusion.jpg)

2. Entradas de Materia Prima: Aquí podemos ver todas las entradas que se han realizado de materia prima (no se incluyen biorientados).
3. Movimientos Mantenimientos: Desde aquí podemos ver todos los movimientos que se han realizado para los activos.
4. Movimientos Despacho: Aquí vamos a consultar y ver los movimientos que hemos realizado, llamese movimientos lo que es  pre-ingreso, ingreso, factura, salida, devolución de rollos. Debemos llenar los filtros o simplemente presionar el boton para consultar, si no se llenan los filtros el programa automaticamente buscará por el día actual.

![Movimientos de Rollos](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Despacho/Movimientos.jpg)

5. Movimientos de Materia Prima: Se dividen en 2:
    5.1. Movimientos de Materia Prima: Aquí vamos a consultar y ver los movimientos que hemos realizado, llamese movimientos lo que es entradas y asignaciones, creaciones, devoluciones de polietilenos, tintas o biorientados. Debemos llenar los filtros o simplemente presionar el boton para consultar, si no se llenan los filtros el programa automaticamente buscará por el día actual.
    ![Movimientos de Materia Prima](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Materia%20Prima/Movimientos.jpg)
    5.2. Movimientos de Recuperado: Aquí vamos a consultar y ver los PELETIZADO que se han ingresado y las cantidades. Debemos llenar los filtros o simplemente presionar el boton para consultar, si no se llenan los filtros el programa automaticamente buscará por el día actual. Si presionamos doble click sobre la columna día o noche veremos de forma detallada cada ingreso.
    ![Movimientos de Recuperado](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Materia%20Prima/MovimientosRecuperado.jpg)
    ![Movimientos de Recuperado](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Materia%20Prima/MovimientosRecuperado2.jpg)
    
6. Movimientos Ordenes de Compra: Aquí podemos ver las ordenes de compra que se han creado consultando los filtros.

![Movimientos Orden de Compra](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Materia%20Prima/MovimientosOrdenCompra.jpg)

7. Movimientos de Maquilas: Aquí podemos ver la información de las ordenes de maquilas que se han creado y facturado.

## `Maquilas`
Las maquilas con documentos en los que se verá reflejada la información de las materias primas que salen hacia otras empresas.

1. Orden de Maquila: Crear una orden de maquila es muy parecido a crear una orden de compra:
    1.1. Primero escogemos el tercero hacia el que saldrá y si este no existe podemos crearlo presionando el botón de "Crear Tercero".
    1.2. Segundo podemos llenar o no el campo de observación.
    1.3. Luego escogemos la materia prima que saldrá, colocamos la cantidad y el precio,
    1.4. Agregamos materia prima.
    1.5. Finalmente si ya agregamos todas las materias primas debemos presionar el botón de "Crear Orden de Maquila".
    1.6. Nos aparecerá un mensaje para ver la orden que acabamos de crear en formato pdf.


2. Facturar Orden de Maquila: Para facturar una orden de maquila debemos seguir los siguientes pasos:
    1. Diligenciamos el campo "Orden de Maquila" o "OM" y presinamos Enter.
    2. Nos aparecerán las materias primas a ingresar en la tabla y si no está ingresado le aparecerá un check.
    3. Al presionar el check se cargará la información de la materia prima en la tabla siguiente.
    4. Llenamos el campo Factura o Remisión con el codigo de una de estas 2.
    5. Por último solo debemos presionar "Facturar Maquila" y listo, todo se habrá enviado a la base de datos.


3. Movimientos de maquilas: Aquí podemos ver la información de las ordenes de maquilas que se han creado y facturado.


## `Orden de Trabajo`
Una orden de trabajo es un documento donde se especifica de manera detallada la información sobre como crear un producto indicando por que procesos debe pasar, los materiales a utilizar, etc. En la orden de trabajo se detalla el pedido del cual se está realizando la orden de trabajo, así como tambien podemos ver el vendedor, cliente, dirección del cliente, estado del pedido, fecha de creación y entrega del producto. Para crear una orden de compra debemos: 
1. Elegimos el pedido del cual obtendremos el producto que crearemos, al elegir el pedido se llenarán algumos campos automaticamente (vendedor, fecha entrega, id cliente, nombre cliente, ciudad cliente, dirección cliente, estado y observación), tambien se llenará una tabla con los productos que tiene el pedido que tengan cantidades pendientes.
2. Para elegir el producto debemos dar click sobre cualquier parte de la información del producto que está en la tabla. Al dar click se buscará la ultima orden de trabajo creada para el producto seleccionado, extraerá los detalles de la creación de este producto en la ultima orden de compra y llenará los campos correspondientes a esta creación.
    1. Bajo la tabla tenemos unos checkbox con los nombres de cada procesos por los que puede pasar la orden de trabajo, para crear el producto debemos seleccionar o dar click sobre el check por el que pasará y se habilitará una nueva opción en el apartado de "Procesos de Producción" con el nombre de cada proceso. Si el producto se ha creado antes al seleccionarlo estos campos se llenarán automaticamente pero siempre tendrá la opción de editarlos.
    2. En el apartado llamado "Datos OT" saldrán algunos calculos que se harán teniendo en cuenta algunos datos de cada procesos:
        1. Cantidad será la cantidad que se va a crear.
        2. Valor Und será el costo del producto por unidad.
        3. Neto Kg será el resultado del siguiente calculo. El calculo dependerá de la presentación del producto.
            - Kg: Cantidad + ((Cantidad * Margen Adicional) / 100)
            * Und: ((1 + (Margen Adicional / 100)) * ((Peso Millar / 1000) * Cantidad));
            + Paquete: ((1 + (Margen Adicional / 100)) * ((Peso Millar / 1000) * (Cantidad * Cantidad Und por Paquetes)));
        4. Valor Kg será el costo que tendrá por kilogramo. Para saber esto tenemos los siguientes calculos que dependerán de la presentación del producto.
            - Kg: Valor Unitario.
            * Und: Valor de La Orden / ((Cantidad * Peso Millar) / 1000);
            + Paquete: Precio Unitario / Peso del Paquete.
        5. Valor OT será el resultado del siguiente calculo:
            - Kg: Cantidad * Valor Unitario.
            * Und: Cantidad * Valor Unitario.
            + Paquete: Cantidad * Valor Unitario.
    3. En el apartado llamado "Extrusión" aparecerá:
        1. Material que se va a extruir.
        2. Formato.
        3. Pigmento.
        4. Tratado.
        5. Ancho 1.
        6. Ancho 2.
        7. Ancho 3.
        8. Calibre.
        9. Unidad de Medida.
        10. Peso de Extrusión se calculará de la siguiente manera.
            - Si la unidad de medida es centimetros: 
                - Si el material es Alta: ((ancho1 + ancho2 + ancho3) * calibre * 0.0048 * 100)
                + Si el material es diferente de Alta: ((ancho1 + ancho2 + ancho3) * calibre * 0.00468 * 100)
            * Si la unidad de medida es diferente de centimetros:
                - Si el material es Alta: ((ancho1 + ancho2 + ancho3) * calibre * 0.0317 * 39.3701)
                + Si el material es diferente de Alta: ((ancho1 + ancho2 + ancho3) * calibre * 0.0302 * 39.3701)
    4. En el apartado llamado "Impresión" aparecerá:
        1. Tipo de Impresión.
        2. Rodillo.
        3. Pista.
        4. Tinta 1 (Opcional).
        5. Tinta 2 (Opcional).
        6. Tinta 3 (Opcional).
        7. Tinta 4 (Opcional).
        8. Tinta 5 (Opcional).
        9. Tinta 6 (Opcional).
        10. Tinta 7 (Opcional).
        11. Tinta 8 (Opcional).
    5. En el apartado llamado "Laminado" aparecerá:
        1. Capa 1.
        2. Calibre 1.
        3. Cantidad 1.
        4.Capa 2.
        5.Calibre 2.
        6.Cantidad 2.
        7.Capa 3.
        8.Calibre 3.
        9.Cantidad 3.
    6. En el apartado llamado "Corte" aparecerá:
        1. Formato.
        2. Ancho.
        3. Largo.
        4. Fuelle.
        5. Porcentaje de Margen.
        6. Margen Kg se calculará de la siguiente manera:
            * Si la presentación es Kg: Margen Adicional * (Cantidad / 100).
            - Si la presentación es Und: Margen Adicional * (((Cantidad * Bolsas por Paquete * Peso Millar) / 1000) / 100).
            + Si la presentación es Paquete: (Margen Adicional * ((Cantidad * Peso Millar) / 1000)) / 100.
    7. En el apartado llamado "Sellado" aparecerá:
        1. Formato.
        2. Ancho.
        3. Largo.
        4. Fuelle.
        5. Porcentaje de Margen.
        6. Margen Kg se calculará de la siguiente manera:
            * Si la presentación es Kg: Margen Adicional * (Cantidad / 100).
            - Si la presentación es Und: Margen Adicional * (((Cantidad * Bolsas por Paquete * Peso Millar) / 1000) / 100).
            + Si la presentación es Paquete: (Margen Adicional * ((Cantidad * Peso Millar) / 1000)) / 100.
        7. Peso Millar : Peso del producto * 1000
        8. Tipo Sellado.
        9. Precio Día.
        10. Precio Noche.
        11. Cantidad de bolsas por paquete.
        12. Peso del Paquete.
        13. Cantidad de bolsas por Bulto.
        14. Peso del bulto.
    8. En el apartado llamado "Mezclas" aparecerá:
        1. Nombre de la mezcla.
        2. Capas.
        3. Porcentaje por capas.
        4. Materiales por capas.
        5. Porcentaje de cada material.
        6. Pigementos por capas.
        7. Porcentaje de cada pigmento.
        8. Si la mezcla no existe se debe crear, para ello se presiona el botón "Crear Mezclas" y se abrirá un modal. Una vez abierto podemos elegir una de las mezclas existentes para crear una parecida o podemos crear una totalmente nueva. Para crear una nueva llenamos todos los campos, si no existe un pigmento y/o un material debemos crealos con los botones que están en la parte superior derecha.
3. Podemos ver el botón de "Crear OT" que al presionarlo si tenemos todos los datos bien creará una nueva orden y inmediatamente nos las exportará a un archivo PDF.
4. Podemos ver que tenemos el botón "Limpiar campos" que limpiará todos los campos.
5. Si lo que queremos es ver en una orden de trabajo en un PDF lo que debemos hacer es consultar el codigo de la Orden de trabajo en el campo "Nro. OT" y presionar el botón "Ver PDF" que se encuentra al final.


## `Pedidos`
Los pedidos son documentos que realizan los vendedores para documentar lo que le piden los clientes, aquí colocan los productos pedidos, los precios por unidad del producto, el cliente, la ciudad en la que está el cliente, la dirección de entrega, fecha de entrega etc... 
1. Crear Pedido: Acontinuación explicaremos debe ser creado un pedido.
    1. Seleccionar el cliente: A cada vendedor le aparecerán los clientes que tiene asociados, debe buscar el cliente al que le va a vender en el campo "Cliente" y al seleccionarlo el programa verificará si es posible crearle un pedido o no, para saber si es posible o no se verifica si el cliente está en cartera, es decir, atrasado con algun pago.
    2. Al terminar la validación del cliente si está valido para pedidos se llenarán automaticamente los campos ciudad, dirección, vendedor. Si el cliente tiene sede en más de una ciudad los campos ciudad y dirección deben llenarse de manera manual.
    3. Podemos colocar el desceunto que se le hace al cliente en el campos "Descuento".
    4. la observación es opcional.
    5. Seguido tenemos un checkbox que inicialmente estará siempre seleccionado. Este checkbox sirve para saber si el cliente maneja IVA o no, si el cliente no maneja IVA simplemente se presiona click sobre el y ya ya no estará seleccionado.
    6. Lo siguiente a hacer es elegir los productos que tendrá el pedido. Para ello tenemos 2 opciones de hacerlo:
        1. Opción 1: Al elegir el cliente así como se llenan los campos de la información del vededor tambien se buscarán los productos que este cliente ha comprado anteriormente, estos aparecerán en el campo "Producto" y al seleccionarlo se llenarán algunos de los campos faltantes.
        2. Opción 2: Si es un producto que el cliente no ha comprado antes, podemos digitar el codigo del producto en el campo "Id" y presionar enter, el programa se encargará de llenar el resto de campos.
    7. Luego debemos digitar la cantidad pedida, la fecha de entrega del producto y podemos modificar el precio, el precio siempre deberá ser mayor o igual al de la última vez que se vendió.
    8. Sí ya tenemos completa la información del producto procedemos a presionar el botón "Agregar Producto" y veremos como se agrega en la tabla siguiente. Al agregar el producto veremos que en la parte inferior a la tabla se estarán realizando calculos sobre los productos que se llevan teniendo en cuenta el decuento y el IVA.
    9. Despues de tener los productos completos presionamos "Crear Pedido" y nos enviará un mensaje para que verifiquemos la información del pedido que vamos a crear, luego de verificar y aceptar se habrá creado nuestro pedido y nos lo mostrará en un archivo PDF.
2. Ver Pedidos: Aquí podemos ver los pedidos que tienen los estados "Pendiente" o "Parcialmente Satisfecho". Los pedidos se dividirán y organizarán por colores.
    - En la parte superior saldrán los pedidos con color verde. Estos indican que todos los productos de este pedido se pueden facturar por que en inventario hay cantidades iguales o suficientes a las cantidades pendientes del pedido.
    + Saldrán de segundos los pedidos con un color azul que nos dicen que minimo un producto se puede facturar pero no todo el pedido.
    - De terceros saldrán los pedidos con color rojo. Estos indican que el pedido fue creado pero no ha sido revisado y/o aceptado por gerencia.
    * Por ultimo saldrán los pedidos con color blanco que son los que no pueden ser facturados aún.
Estos pedidos tiene funciones como:
1. Ver en un archivo PDF el pedido.
2. Editar un pedido. Esta opción solo estará disponible para productos que no han sido aceptados.
3. Aceptar pedidos. Esta opción solo estará disponible para productos que no han sido aceptados.
4. Cancelar y/o Anular pedidos. Esta opción solo estará disponible para productos que no han sido aceptados.
5. Si el pedido tiene una orden de trabajo asignada podremos ver la información de la orden en el [Reporte Procesos OT](#).

## `Productos`
En este módulo podemos ver 2 inventarios de productos.
1. Inventario de Zeus: Aquí veremos los productos que hay en el inventario de Zeus.
2. Inventario: Aquí veremos los productos y las cantidades que hay en el inventario del programa.

## `Reportes`
Modulo donde se podrán ver todos los reportes que puede dar el programa.
1. Inventario Activos: Aqui podremos ver todos los activos que tiene la empresa, con algunos de sus costo.

![Activos](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/activos/Activos.jpg)

2. Bodega Extrusión: Aquí vamos a consultar y ver los movimientos que hemos realizado, llamese movimientos lo que es entradas y salidas de rollos. Debemos llenar los filtros o simplemente presionar el boton para consultar, si no se llenan los filtros el programa automaticamente buscará por el día actual.

![Inventario Rollos Extrusión](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Bodega%20Extrusion/BodegaExtrusion.jpg)

3. Inventario de Materia Prima:
    - Desde aquí podremos ver de manera detallada la información de todas las materias primas que hay en la bodega de inventario actualmente. 
    + Tambien podemos filtar si queremos buscar una materia prima en especifico, podemos ver el movimiento que tuvo un en una rango de fechas. 
    * Podemos exportar la información a un archivo de excel.
    - Podemos ver cada Subbodega como Polietilenoes, Tintas, Biorientados.

![Inventario de Materia Prima](/Proyecto/ProyectoPlasticaribe/src/assets/Manual%20App/Materia%20Prima/Inventario.jpg)

4. Reporte de Costos: En este reporte podemos ver el costo de una orden de trabajo con base a el costo de esta, el costo de la materia prima utilizada. Para ver el costo de una OT solo debemos digitar el codigo de la OT en el campos "OT" y presionar enter o presionar el botón "Consultar OT". Luego se cargará y realizará los calculos automaticamente. Desde aqui tambien podemos cambiar el estado de la orden de trabajo, esto con el botón verde para cerrarla o el botón naranja y el campo "Estado". Otra acción que tenemos es la de ver en un PDF la información consultada.

5. Consolidado de Facturación: Al ingresar al consolidado de facturación podemos ver que tenemos unos filtros, estos filtros nos sirven para que la busqueda sea más rapida y concisa. Para consultar llenamos los filtros o no y presionamos "Consultar" y empezará a cargar (dependeiendo de la cantidad de datos que se consulten se demorará cargando), al terminar de cargar saldrá la siguiente información:
    1. Mes, que indicará el mes del cual es el registro.
    2. Vendedor, que indicará de que vendedor es el registro.
    3. Cliente.
    4. Id Producto.
    5. Nombre del Producto comprado por el cliente.
    6. Cantidad total que compró el cliente durante el més y el año.
    7. Cuanto devolvió el cliente durante ese mismo periodo.
    8. Presentación del productos.
    9. Precio Unitario del producto durante ese pediodo de tiempo.
    10. SubTotal de lo comprado por el producto.
Este reporte está encargado de mostrarnos de manera consolidada lo que compró cada cliente en cada mes del año.
Esta información podemos exportarla a excel.

6. Consolidado de Facturación 2: Al ingresar al consolidado de facturación podemos ver que tenemos unos filtros, estos filtros nos sirven para que la busqueda sea más rapida y concisa. Para consultar llenamos los filtros o no y presionamos "Consultar" y empezará a cargar (dependeiendo de la cantidad de datos que se consulten se demorará cargando), al terminar de cargar saldrá la siguiente información:
    1. Cliente.
    2. Producto comprado por el cliente.
    3. Cantidad total que compró el cliente durante el més de Enero.
    4. Cantidad total que compró el cliente durante el més de Febrero.
    5. Cantidad total que compró el cliente durante el més de Marzo.
    6. Cantidad total que compró el cliente durante el més de Abril.
    7. Cantidad total que compró el cliente durante el més de Mayo.
    8. Cantidad total que compró el cliente durante el més de Junio.
    9. Cantidad total que compró el cliente durante el més de Julio.
    10. Cantidad total que compró el cliente durante el més de Agosto.
    11. Cantidad total que compró el cliente durante el més de Septiembre.
    12. Cantidad total que compró el cliente durante el més de Octubre.
    13. Cantidad total que compró el cliente durante el més de Noviembre.
    14. Cantidad total que compró el cliente durante el més de Diciembre.
    15. Precio Unitario del producto durante ese pediodo de tiempo.
    16. SubTotal de lo comprado por el producto.
Este reporte está encargado de mostrarnos de manera consolidada lo que compró cada cliente en cada mes del año.
Esta información podemos exportarla a excel.

7. Reporte de Procesos OT: Tenemos multiples funciones en este reporte, estas son:
Para consultar las ordenes de trabajo simplemente debemos llenar los filtros que tenemos con la información necesaria o consultar sin llenar los filtros (esto buscará las ordenes de trabajo del día actual).
    1. Una de las funciones más importantes de este reporte es ver el estado de la orden de trabajo y cuanto a producido cada proceso, tambien nos indica si la cantidad que inicialmente se pide en la orden de trabajo ya fue procesada en cada uno de los procesos.
    2. Podemos agregar fallas a la orden de trabajo.
    3. Exportar la información a excel.
    4. Tenemos acceso al reporte de costos, para verlo tenemos que presionar click sobre el número de la OT.
    5. Podemos ver cada uno de los rollos pesados en cada proceso.
    6. Podemos cambiar el estado de la orden de trabajo presionando el icono :pencil2: ubicado en la última columna de la tabla y nos aparecerá un modal con los posibles estados de la orden de trabajo.
    
8. Reporte de Rollos eliminados: Cuando se eliminan rollos de la base de datos es posible verlos desde este reporte. Se mostrarán todos los rollos que han sido eliminados de la base de datos de bagpro y de la bodega de extrusión y de la bodega de despacho.

## `Tickets`
Un ticket es creado por usuarios cuando tienen sugerencias o algún problema con el programa. Desde este módulo se le puede dar seguimiento a los tickets que han sido creados por usuarios.
1. Creación de Tickets: Para crear un ticket debemos describir el problema que tenemos en el campo "Descripción" y podemos o no agregar imagenes de nuestro problema.

2. Gestión de Tickets: Desde este punto podemos ver la cantidad de tickets que tenemos para cada uno de los estados, los tickets que tenemos y no hemos solucionado, podemos revisarlos y cambiarles el estado mediante los vamos revisando y/o solucionando. Para cambiarle el estado a un ticket hacemos lo siguiente:
    1. Seleccionamos el ticket presionando click sobre el radio button que esta en la parte derecha de la tabla.
    2. En la parte derecha de pantalla (para pantallas con resoluciones mayores a 768px) nos aparecerá la información del ticket con las imagenes adjuntadas por el usuario.
    3. En este mismo lugar al final de la información del ticket tenemos 2 botones con los que podemos cambiar el estado:
        1. "En Revisión": Al presionarlo colocará el ticket en revisión, es decir, que ya se vió y se está solucionando.
        2. "Resuelto": Al presionarlo nos aparecerá un modal con un campo descripción donde podemos escribir como solucionamos el problema del ticket o podemos nos llenar el campo y cambiar el estado.

## `Usuarios`
En este modulo vamos a poder manejar los usuarios que tendrá acceso al programa, es decir, desde quí podemos crear, editar y inhabilitar usuarios.
1. Crear Usuarios: Para crear un nuevo usuario debemos presionar el botón ":heavy_plus_sign: Nuevo" y se nos desplegará un modal desde el que podremos crear el usuario de manera sencilla.
    1. Crear Nuevo Rol: Si el usuario que vamos a crear va a tener un rol que no existe debemos crearlo, presionamos click en ":heavy_plus_sign: Nuevo Rol", lleamos los campos y listo.
    2. Crear Área: Si el usuario que vamos a crear va a tener un área que no existe debemos crearlo, presionamos click en ":heavy_plus_sign: Nueva Área", lleamos los campos y listo.
2. Editar Usuario: Para editar los usuarios nos vamos a la tabla y presionamos el icono :pencil2: ubicado en la antepenultima columna de la tabla, nos aparecerá un modal igual al de crear usuario pero esta vez con la información diligenciada, editamos los que queremos, le damos guardar y listo. 
3. Inhabilitar Usuarios: Para inhabilitar un usuario tenemos 2 formas de hacerlo:
    1. En la última columna de la tabla tenemos el siguiente icono :wastebasket: presionamos click sobre él y listo habremos cambiado el estado del usuario.
    2. Esta forma de inhabilitar usuarios es mucho más comoda si se van a inhabilitar varios usuarios, para ello selecionamos los usuarios marcando en checkbox que está en la primera columna de la tabla y luego presionamos el boton ":wastebasket: Eliminar" y habremos cambiado el estado de los usuarios.

## `Configuración`
1. Cambiar tamaño de letra: Para cambiar el tamaño de la letra presionamos los botones con los iconos :heavy_plus_sign: y :heavy_minus_sign: hasta que el tamaño de la letra sea de nuestro agrado.
