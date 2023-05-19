export let vistasDisponibles : any = [
  // ROLLOS DE EXTRUSION
  { id : 2, nombre : 'Eliminar Rollos', icono : 'assets/Iconos_Menu/eliminar.png', categoria: 'Bodega de Extrusión', ruta : './Eliminar-rollos', roles : [1], },
  { id : 3, nombre : 'Ingreso de Rollos', icono : 'assets/Iconos_Menu/ingresar.png', categoria: 'Bodega de Extrusión', ruta : './IngresoRollos-Extrusion', roles : [1,5], },
  { id : 4, nombre : 'Salida de Rollos', icono : 'assets/Iconos_Menu/salida.png', categoria: 'Bodega de Extrusión', ruta : './AsignacionRollos-Extrusion', roles : [1,5], },
  { id : 34, nombre : 'Inventario Bodega Extrusión', icono : 'assets/Iconos_Menu/bodega.png', categoria: 'Reportes', ruta : './Inventario-Extrusion', roles : [1,5], },
  { id : 21, nombre : 'Movimientos Bodega de Extrusión', icono : 'assets/Iconos_Menu/bodega.png', categoria: 'Movimientos', ruta : './ReporteRollos-Extrusion', roles : [1,5], },

  // BOPP
  { id : 5, nombre : 'Asignación de BOPP', icono : 'assets/Iconos_Menu/salida.png', categoria: 'BOPP / BOPA / POLIESTER', ruta : './AsignacionBOPPTemporal', roles : [1,3], },
  { id : 6, nombre : 'Entrada de BOPP', icono : 'assets/Iconos_Menu/ingresar.png', categoria: 'BOPP / BOPA / POLIESTER', ruta : './entrada-BOPP', roles : [1,3], },

  // DESPACHO
  { id : 7, nombre : 'Ingresar Rollos', icono : 'assets/Iconos_Menu/ingresar.png', categoria: 'Despacho', ruta : './ingresar-productos', roles : [1,10], },
  { id : 8, nombre : 'Facturar Rollos', icono : 'assets/Iconos_Menu/factura.png', categoria: 'Despacho', ruta : './asignacion-productos-facturas', roles : [1,6], },
  { id : 9, nombre : 'Despachar Mercancia', icono : 'assets/Iconos_Menu/camion.png', categoria: 'Despacho', ruta : './factura-rollos-productos', roles : [1,10], },
  { id : 10, nombre : 'Devolución de Rollos', icono : 'assets/Iconos_Menu/devolucion.png', categoria: 'Despacho', ruta : './devolucion-rollos-productos', roles : [1,10], },
  { id : 11, nombre : 'Pre Ingreso Extrusión', icono : 'assets/Iconos_Menu/ingresar.png', categoria: 'Despacho', ruta : './preingreso-extrusion', roles : [1,7], },
  { id : 12, nombre : 'Pre Ingreso Sellado/Empaque', icono : 'assets/Iconos_Menu/ingresar.png', categoria: 'Despacho', ruta : './preingreso-sellado', roles : [1,8,9], },
  { id : 23, nombre : 'Movimientos Despacho', icono : 'assets/Iconos_Menu/caja.png', categoria: 'Movimientos', ruta : './reporte-despacho', roles : [1,6,7,8,9,10], },

  // DEPERDICIO
  { id : 45, nombre : 'Deperdicio', icono : 'assets/Iconos_Menu/caja.png', categoria: 'Deperdicio', ruta : './desperdicio', roles : [1, 12], },
  { id : 46, nombre : 'Reporte Desperdicio', icono : 'assets/Iconos_Menu/recibos.png', categoria: 'Reporte', ruta : './reporte-desperdicios', roles : [1, 12], },

  // ARCHIVOS
  { id : 13, nombre : 'Gestor de Archivos', icono : 'assets/Iconos_Menu/carpeta.png', categoria: 'Gestor de Archivos', ruta : './Archivos', roles : [1], },

  // MATERIA PRIMA
  { id : 14, nombre : 'Asignación Materia Prima', icono : 'assets/Iconos_Menu/salida.png', categoria: 'Materia Prima', ruta : './asignacionMP', roles : [1,3], },
  { id : 15, nombre : 'Creación Tintas', icono : 'assets/Iconos_Menu/tinta.png', categoria: 'Materia Prima', ruta : '/asignacion-tintas', roles : [1,3], },
  { id : 16, nombre : 'Devoluciones', icono : 'assets/Iconos_Menu/devolucion.png', categoria: 'Materia Prima', ruta : './mp-devoluciones', roles : [1,3], },
  { id : 17, nombre : 'Entradas', icono : 'assets/Iconos_Menu/ingresar.png', categoria: 'Materia Prima', ruta : './MateriaPrima', roles : [1,3], },
  { id : 19, nombre : 'Orden de Compra', icono : 'assets/Iconos_Menu/crearOrden.png', categoria: 'Materia Prima', ruta : './ocompra-materiaPrima', roles : [1,6,13], },
  { id : 20, nombre : 'Recuperado', icono : 'assets/Iconos_Menu/recuperado.png', categoria: 'Materia Prima', ruta : './mp-recuperada', roles : [1,3], },
  { id : 35, nombre : 'Inventario de Materia Prima', icono : 'assets/Iconos_Menu/bodega.png', categoria: 'Reportes', ruta : './reporte-Materia-Prima', roles : [1,3,4], },
  { id : 25, nombre : 'Movimientos MP', icono : 'assets/Iconos_Menu/materiaPrima.png', categoria: 'Movimientos', ruta : './movimiento-mp', roles : [1,3,4], },
  { id : 27, nombre : 'Movimientos Recuperado', icono : 'assets/Iconos_Menu/recuperado.png', categoria: 'Movimientos', ruta : './reporte-recuperado-mp', roles : [1,3], },
  { id : 28, nombre : 'Movimientos Ordenes de Compra', icono : 'assets/Iconos_Menu/recibos.png', categoria: 'Movimientos', ruta : './reporte-orden-compra', roles : [1,6,13], },

  // MANTENIMIENTO Y PEDIDOS DE MANTENIMIENTO
  { id : 41, nombre : 'Pedido de Mantenimiento de Activos', icono : 'assets/Iconos_Menu/pedido_mantenimiento.png', categoria: 'Mantenimiento', ruta : './pedido-mantenimiento', roles : [1], },
  { id : 44, nombre : 'Mantenimiento de Activos', icono : 'assets/Iconos_Menu/Mantenimiento.png', categoria: 'Mantenimiento', ruta : './mantenimiento-camiones', roles : [1], },
  { id : 43, nombre : 'Inventario de Activos', icono : 'assets/Iconos_Menu/activos.png', categoria: 'Reporte', ruta : './reporte-activos', roles : [1], },

  // MOVIMIENTOS
  { id : 22, nombre : 'Entradas de Materia Prima', icono : 'assets/Iconos_Menu/recibos.png', categoria: 'Movimientos', ruta : './reporte-facturas-remisiones-mp', roles : [1,3], },
  { id : 42, nombre : 'Movimiento de Mantenimientos de Activos', icono : 'assets/Iconos_Menu/Mantenimiento.png', categoria: 'Movimientos', ruta : './movimientos-mantenimientos', roles : [1], },

  // ORDEN DE MAQUILA
  { id : 49, nombre : 'Orden de Maquila', icono : 'assets/Iconos_Menu/crearOrden.png', categoria: 'Maquila', ruta : './Orden-Maquila', roles : [1], },
  { id : 50, nombre : 'Facturación de Maquila', icono : 'assets/Iconos_Menu/crearOrden.png', categoria: 'Maquila', ruta : './Facturacion-Orden-Maquila', roles : [1], },
  { id : 51, nombre : 'Movimentos de Maquilas', icono : 'assets/Iconos_Menu/crearOrden.png', categoria: 'Movimientos', ruta : './Reporte-Maquilas', roles : [1], },

  // ORDEN DE TRABAJO
  { id : 29, nombre : 'Crear OT', icono : 'assets/Iconos_Menu/crearOrden.png', categoria: 'Orden de Trabajo', ruta : './ordenes-trabajo', roles : [1], },

  // PEDIDOS DE PRODUCTOS
  { id : 30, nombre : 'Crear Pedido', icono : 'assets/Iconos_Menu/pedidos.png', categoria: 'Pedidos', ruta : './pedido-externo', roles : [1,2,60], },
  { id : 47, nombre : 'Ver Pedidos', icono : 'assets/Iconos_Menu/Pedidos_Zeus.png', categoria: 'Pedidos', ruta : './Pedidos-Zeus', roles : [1,2,6,10,60,61], },

  // PRODUCTO TERMINADO
  { id : 32, nombre : 'Producto Terminado (Zeus)', icono : 'assets/Iconos_Menu/bodega.png', categoria: 'Productos', ruta : './inventario-productos-terminados', roles : [1,6,10,60,61], },
  { id : 33, nombre : 'Producto Terminado', icono : 'assets/Iconos_Menu/bodega.png', categoria: 'Productos', ruta : './inventario-productos', roles : [1], },

  // REPORTES
  { id : 36, nombre : 'Reportes de Costos', icono : 'assets/Iconos_Menu/costos.png', categoria: 'Reportes', ruta : './reporte-costos-ot', roles : [1], },
  { id : 38, nombre : 'Reporte Procesos OT', icono : 'assets/Iconos_Menu/cronologia.png', categoria: 'Reportes', ruta : './reportes-procesos-ot', roles : [1,12], },
  { id : 39, nombre : 'Reporte Rollos Eliminados', icono : 'assets/Iconos_Menu/reporteEliminados.png', categoria: 'Reportes', ruta : './reporte-rollos-eliminados', roles : [1], },
  { id : 48, nombre : 'Consolidado Facturación', icono : 'assets/Iconos_Menu/factura.png', categoria: 'Reporte', ruta : './rpt-facturacion-zeus', roles : [1, 2, 60], },
  { id : 52, nombre : 'Consolidado Facturación 2', icono : 'assets/Iconos_Menu/factura.png', categoria: 'Reporte', ruta : './Reporte-Facturacion', roles : [1, 2, 60], },

  // TICKETS
  { id : 53, nombre : 'Creación de Tickets', icono : 'assets/Iconos_Menu/Tickets.png', categoria: 'Tickets', ruta : './Tickets', roles : [1,2,3,4,5,6,7,8,9,10,11,12,13,59,60,61], },
  { id : 54, nombre : 'Gestión de Tickets', icono : 'assets/Iconos_Menu/GestionTickets.png', categoria: 'Tickets', ruta : './Gestion-Tickets', roles : [1,2,3,4,5,6,7,8,9,10,11,12,13,59,60,61], },

  // USUARIOS
  { id : 40, nombre : 'Usuarios', icono : 'assets/Iconos_Menu/usuarios.png', categoria: 'Usuarios', ruta : './registro-usuario', roles : [1], },

  // SIGUIENTE 55
];
