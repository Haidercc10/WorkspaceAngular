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

# Modulos de la Aplicación
1. [Bodega Extrusión.](#bodega-extrusión)
2. [BOPP / BOPA / Poliester.](#bopp-bopa-poliester)
3. [Despacho.](#despacho)
4. [Desperdicio.](#desperdicio)
5. [Gestor de Archivos.](#gestión-de-archivos)
6. [Materia Prima.](#materia-prima)
7. [Mantenimiento de Activos.](#matenimiento-de-activos)
8. [Movimientos.](#movimientos)
9. [Maquilas.](#maquilas)
10. [Orden de Trabajo.](#)
11. [Pedidos.](#)
12. [Productos.](#)
13. [Reportes.](#)
14. [Tickets.](#)
15. [Usuarios.](#)

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
