import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from './Guards/vistas-permisos.guard';
import { Inventario_AreasComponent } from './Vistas/Inventario_Areas/Inventario_Areas.component';
import { Reporte_InventarioAreasComponent } from './Vistas/Reporte_InventarioAreas/Reporte_InventarioAreas.component';
import { LoginComponentComponent } from './Vistas/login-component/login-component.component';

export const routes: Routes = [

  /******************************************************************** Inicio y Login **********************************************************************/
  { path: '**', redirectTo: 'login' },
  { path: 'Login', loadChildren: () => import('./Modules/login/login.module').then(m => m.LoginModule) },
  { path: '', component: LoginComponentComponent },
  { path: 'home', loadChildren: () => import('./Modules/inicio/inicio.module').then(m => m.InicioModule) },
  { path: 'Archivos', loadChildren: () => import('./Modules/archivos/archivos.module').then(m => m.ArchivosModule) },

  /******************************************************************* Materia Prima ************************************************************************/
  { path: 'ocompra-materiaPrima', loadChildren: () => import('./Modules/orden-compra/orden-compra.module').then(m => m.OrdenCompraModule) },
  { path: 'MateriaPrima', loadChildren: () => import('./Modules/entrada-materia-prima/entrada-materia-prima.module').then(m => m.EntradaMateriaPrimaModule) },
  { path: 'asignacionMP', loadChildren: () => import('./Modules/asignacion-materia-prima/asignacion-materia-prima.module').then(m => m.AsignacionMateriaPrimaModule) },
  { path: 'mp-recuperada', loadChildren: () => import('./Modules/materia-prima-recuperada/materia-prima-recuperada.module').then(m => m.MateriaPrimaRecuperadaModule) },
  { path: 'mp-devoluciones', loadChildren: () => import('./Modules/devolucion-materias-primas/devolucion-materias-primas.module').then(m => m.DevolucionMateriasPrimasModule) },
  { path: 'asignacion-tintas', loadChildren: () => import('./Modules/creacion-tintas/creacion-tintas.module').then(m => m.CreacionTintasModule) },
  { path: 'entrada-BOPP', loadChildren: () => import('./Modules/ingreso-biorientados/ingreso-biorientados.module').then(m => m.IngresoBiorientadosModule) },
  { path: 'AsignacionBOPPTemporal', loadChildren: () => import('./Modules/asignacion-biorientado/asignacion-biorientado.module').then(m => m.AsignacionBiorientadoModule) },
  { path: 'movimiento-mp', loadChildren: () => import('./Modules/movimientos-materias-primas/movimientos-materias-primas.module').then(m => m.MovimientosMateriasPrimasModule) },
  { path: 'reporte-Materia-Prima', loadChildren: () => import('./Modules/inventario-materias-primas/inventario-materias-primas.module').then(m => m.InventarioMateriasPrimasModule) },
  { path: 'reporte-recuperado-mp', loadChildren: () => import('./Modules/movimientos-recuperado/movimientos-recuperado.module').then(m => m.MovimientosRecuperadoModule) },
  { path: 'reporte-orden-compra', loadChildren: () => import('./Modules/movimientos-orden-compra/movimientos-orden-compra.module').then(m => m.MovimientosOrdenCompraModule) },
  { path: 'solicitud-materia-prima', loadChildren: () => import('./Modules/solicitud-materia-prima/solicitud-materia-prima.module').then(m => m.SolicitudMateriaPrimaModule) },
  { path: 'reporte-solicitudes-mp', loadChildren: () => import('./Modules/mov-solicitud-materia-prima/mov-solicitud-materia-prima.module').then(m => m.MovSolicitudMateriaPrimaModule) },
  { path: 'kardex-materias-primas', loadChildren: () => import('./Modules/kardex-materia-prima/kardex-materia-prima.module').then(m => m.KardexMateriaPrimaModule) },

  /************************************************************************ DESPACHO ************************************************************************/
  { path: 'preingreso-extrusion', loadChildren: () => import('./Modules/pre-ingreso-extrusion/pre-ingreso-extrusion.module').then(m => m.PreIngresoExtrusionModule) },
  { path: 'preingreso-sellado', loadChildren: () => import('./Modules/pre-ingreso-sellado/pre-ingreso-sellado.module').then(m => m.PreIngresoSelladoModule) },
  { path: 'ingresar-productos', loadChildren: () => import('./Modules/ingreso-rollos-despacho/ingreso-rollos-despacho.module').then(m => m.IngresoRollosDespachoModule) },
  { path: 'asignacion-productos-facturas', loadChildren: () => import('./Modules/facturacion-rollos/facturacion-rollos.module').then(m => m.FacturacionRollosModule) },
  { path: 'factura-rollos-productos', loadChildren: () => import('./Modules/despachar-rollos/despachar-rollos.module').then(m => m.DespacharRollosModule) },
  { path: 'devolucion-rollos-productos', loadChildren: () => import('./Modules/devolucion-rollos/devolucion-rollos.module').then(m => m.DevolucionRollosModule) },
  { path: 'reporte-despacho', loadChildren: () => import('./Modules/movimientos-despacho/movimientos-despacho.module').then(m => m.MovimientosDespachoModule) },

  /********************************************************************* ORDEN DE TRABAJO ********************************************************************/
  { path: 'ordenes-trabajo', loadChildren: () => import('./Modules/orden-trabajo/orden-trabajo.module').then(m => m.OrdenTrabajoModule) },
  { path: 'reportes-procesos-ot', loadChildren: () => import('./Modules/reporte-procesos-ot/reporte-procesos-ot.module').then(m => m.ReporteProcesosOTModule) },

  /*************************************************************** PRODUCCION *************************************************************************************************/
  { path: 'produccion-procesos', loadChildren: () => import('./Modules/produccion-extrusion/produccion-extrusion.module').then(m => m.ProduccionExtrusionModule) },
  { path: 'produccion-sellado', loadChildren: () => import('./Modules/produccion-sellado/produccion-sellado.module').then(m => m.ProduccionSelladoModule) },
  { path: 'reempaque-sellado', loadChildren: () => import('./Modules/reempaque-sellado/reempaque-sellado.module').then(m => m.ReempaqueSelladoModule) },
  { path: 'ingreso-despacho', loadChildren: () => import('./Modules/ingreso-produccion-despacho/ingreso-produccion-despacho.module').then(m => m.IngresoProduccionDespachoModule) },
  { path: 'despacho-mercancia', loadChildren: () => import('./Modules/salida-produccion-despacho/salida-produccion-despacho.module').then(m => m.SalidaProduccionDespachoModule) },
  { path: 'orden-facturacion', loadChildren: () => import('./Modules/orden-facturacion/orden-facturacion.module').then(m => m.OrdenFacturacionModule) },
  { path: 'movimientos-orden-facturacion', loadChildren: () => import('./Modules/movimientos-orden-facturacion/movimientos-orden-facturacion.module').then(m => m.MovimientosOrdenFacturacionModule) },
  { path: 'devolucion-facturacion', loadChildren: () => import('./Modules/devolucion-orden-facturacion/devolucion-orden-facturacion.module').then(m => m.DevolucionOrdenFacturacionModule) },
  { path: 'pre-ingreso-produccion', loadChildren: () => import('./Modules/pre-ingreso-produccion-despacho/pre-ingreso-produccion-despacho.module').then(m => m.PreIngresoProduccionDespachoModule) },
  { path: 'mov-preingreso-produccion', loadChildren: () => import('./Modules/movimientos-preingreso-produccion/movimientos-preingreso-produccion.module').then(m => m.MovimientosPreingresoProduccionModule) },
  { path: 'eliminar-rollos-produccion', loadChildren: () => import('./Modules/eliminar-rollos-produccion/eliminar-rollos-produccion.module').then(m => m.EliminarRollosProduccionModule) },
  { path: 'gestion-devoluciones-of', loadChildren: () => import('./Modules/gestion-devoluciones-of/gestion-devoluciones-of.module').then(m => m.GestionDevolucionesOfModule) },
  { path: 'orden-facturacion-pallets', loadChildren: () => import('./Modules/orden-facturacion-pallets/orden-facturacion-pallets.module').then(m => m.OrdenFacturacionPalletsModule) },
  
  /********************************** Ingreso de Rollos a Extrusion, Solicitudes y Salidas de Rollos a otros Procesos ******************************************/
  { path: 'IngresoRollos-Extrusion', loadChildren: () => import('./Modules/ingreso-rollos/ingreso-rollos.module').then(m => m.IngresoRollosModule) }, 
  { path: 'Solicitud-Rollos-Bodegas', loadChildren: () => import('./Modules/solicitud-rollos/solicitud-rollos.module').then(m => m.SolicitudRollosModule) },
  { path: 'dev-bodega-rollos', loadChildren: () => import('./Modules/devolucion-bodega-rollos/devolucion-bodega-rollos.module').then(m => m.DevolucionBodegaRollosModule) },
  { path: 'Movimientos-Solicitud-Rollos', loadChildren: () => import('./Modules/movimientos-solicitudes-rollos/movimientos-solicitudes-rollos.module').then(m => m.MovimientosSolicitudesRollosModule) },
  { path: 'Inventario-Bodegas-Rollos', loadChildren: () => import('./Modules/inventario-bodegas-rollos/inventario-bodegas-rollos.module').then(m => m.InventarioBodegasRollosModule) },
  { path: 'mov-bodega-rollos', loadChildren: () => import('./Modules/mov-bodega-rollos/mov-bodega-rollos.module').then(m => m.MovBodegaRollosModule) },
  { path: 'asignacion-rollos-ot', loadChildren: () => import('./Modules/asignacion-rollos-ot/asignacion-rollos-ot.module').then(m => m.AsignacionRollosOtModule) },
  
  // {path: 'AsignacionRollos-Extrusion', canActivate: [VistasPermisosGuard], data: {expectedRole : [1,5]}, component : AsignacionRollos_ExtrusionComponent}, // Asignación de rollos desde la bodega de extrusión.
  // {path: 'ReporteRollos-Extrusion', canActivate: [VistasPermisosGuard], data: {expectedRole : [1,5]}, component : ReporteBodegaExtrusionComponent}, // Reporte de la bodega de extrusión.
  // {path: 'Inventario-Extrusion', canActivate: [VistasPermisosGuard], data: {expectedRole : [1,5]}, component: Inventario_ExtrusionComponent},
  { path: 'Eliminar-rollos', loadChildren: () => import('./Modules/eliminar-rollos/eliminar-rollos.module').then(m => m.EliminarRollosModule) },
  { path: 'reporte-rollos-eliminados', loadChildren: () => import('./Modules/mov-rollos-eliminados/mov-rollos-eliminados.module').then(m => m.MovRollosEliminadosModule) },
  { path: 'reporte-costos-ot', loadChildren: () => import('./Modules/reporte-costos/reporte-costos.module').then(m => m.ReporteCostosModule) },

  /****************************************************************** INVENTARIO DE PRODUCTOS ****************************************************************/
  { path: 'inventario-productos', loadChildren: () => import('./Modules/inventario-productos/inventario-productos.module').then(m => m.InventarioProductosModule) },
  { path: 'inventario-productos-terminados', loadChildren: () => import('./Modules/inventario-zeus-productos/inventario-zeus-productos.module').then(m => m.InventarioZeusProductosModule) },
  {
    path: 'inventario-areas',
    children: [{ path: 'materiales', canActivate: [VistasPermisosGuard], data: { nombre: 'Inventario Areas' }, component: Inventario_AreasComponent },]
  },
  {
    path: 'inventario-areas',
    children: [{ path: 'items', canActivate: [VistasPermisosGuard], data: { nombre: 'Inventario Areas' }, component: Inventario_AreasComponent },]
  },
  { path: 'reporte-inv-areas', canActivate: [VistasPermisosGuard], data: { nombre: 'Reporte de Inventarios' }, component: Reporte_InventarioAreasComponent },

  /****************************************************************** PEDIDO DE PRODUCTOS ****************************************************************/
  // {path: 'opedidoproducto', component: OpedidoproductoComponent},
  { path: 'pedido-externo', loadChildren: () => import('./Modules/pedido-externo/pedido-externo.module').then(m => m.PedidoExternoModule) },

  /***************************************************************** USUARIOS **********************************************************************************/
  { path: 'registro-usuario', loadChildren: () => import('./Modules/registro-usuarios/registro-usuarios.module').then(m => m.RegistroUsuariosModule) },

  /*************************************************************************************************************************************************************/
  { path: 'pruebas', loadChildren: () => import('./Modules/pruebas/pruebas.module').then(m => m.PruebasModule) },
  { path: 'gestion-vistas', loadChildren: () => import('./Modules/gestion-vistas/gestion-vistas.module').then(m => m.GestionVistasModule) },

  /******************************************************************* MANTENIMIENTO ***************************************************************************/
  { path: 'pedido-mantenimiento', loadChildren: () => import('./Modules/pedido-mantenimiento/pedido-mantenimiento.module').then(m => m.PedidoMantenimientoModule) },
  { path: 'movimientos-mantenimientos', loadChildren: () => import('./Modules/movimientos-mantenimiento/movimientos-mantenimiento.module').then(m => m.MovimientosMantenimientoModule) },
  { path: 'reporte-activos', loadChildren: () => import('./Modules/inventario-activos/inventario-activos.module').then(m => m.InventarioActivosModule) },
  { path: 'mantenimiento-activos', loadChildren: () => import('./Modules/mantenimiento-activos/mantenimiento-activos.module').then(m => m.MantenimientoActivosModule) },

  /*********************************************************************** REPORTE PEDIDOS ZEUS *****************************************************************/
  { path: 'Pedidos-Zeus', loadChildren: () => import('./Modules/pedidos-zeus/pedidos-zeus.module').then(m => m.PedidosZeusModule) },
  { path: 'rpt-facturacion-zeus', loadChildren: () => import('./Modules/consolidad-facturacion/consolidad-facturacion.module').then(m => m.ConsolidadFacturacionModule) },

  /*************************************************************** DESPERDICIO *********************************************************************************/
  { path: 'desperdicio', loadChildren: () => import('./Modules/desperdicios/desperdicios.module').then(m => m.DesperdiciosModule) },
  { path: 'reporte-desperdicios', loadChildren: () => import('./Modules/movimientos-desperdicios/movimientos-desperdicios.module').then(m => m.MovimientosDesperdiciosModule) },

  /*************************************************************** ORDEN DE MAQUILA **************************************************************************/
  { path: 'Orden-Maquila', loadChildren: () => import('./Modules/orden-maquila/orden-maquila.module').then(m => m.OrdenMaquilaModule) },
  { path: 'Facturacion-Orden-Maquila', loadChildren: () => import('./Modules/facturacion-orden-maquila/facturacion-orden-maquila.module').then(m => m.FacturacionOrdenMaquilaModule) },
  { path: 'Reporte-Maquilas', loadChildren: () => import('./Modules/movimientos-orden-maquila/movimientos-orden-maquila.module').then(m => m.MovimientosOrdenMaquilaModule) },

  /*************************************************************** DASBOARD **************************************************************************/
  { path: 'Tickets', loadChildren: () => import('./Modules/tickets/tickets.module').then(m => m.TicketsModule) },
  { path: 'Gestion-Tickets', loadChildren: () => import('./Modules/gestion-tickets/gestion-tickets.module').then(m => m.GestionTicketsModule) },

  /*************************************************************** DASBOARD **************************************************************************/
  { path: 'nomina', loadChildren: () => import('./Modules/nomina/nomina.module').then(m => m.NominaModule) },
  { path: 'ingreso-nomina', loadChildren: () => import('./Modules/ingreso-nomina/ingreso-nomina.module').then(m => m.IngresoNominaModule) },
  { path: 'reporte-nomina', loadChildren: () => import('./Modules/reporte-nomina/reporte-nomina.module').then(m => m.ReporteNominaModule) },
  { path: 'prestamos-nomina', loadChildren: () => import('./Modules/prestamos-nomina/prestamos-nomina/prestamos-nomina.module').then(m => m.PrestamosNominaModule) },

  /*************************************************************** SOLICITUDES DE MATERIA PRIMA A EXTRUSION **************************************************************************/
  { path: 'solicitud-mp-extrusion', loadChildren: () => import('./Modules/solicitud-mp-extrusion/solicitud-mp-extrusion.module').then(m => m.SolicitudMPExtrusionModule) },
  { path: 'reporte-solicitud-mp-extrusion', loadChildren: () => import('./Modules/mov-solicitud-mp-extrusion/mov-solicitud-mp-extrusion.module').then(m => m.MovSolicitudMPExtrusionModule) },

  { path: 'facturas-invergoal-inversuez', loadChildren: () => import('./Modules/facturas-invergoal-inversuez/facturas-invergoal-inversuez.module').then(m => m.FacturasInvergoalInversuezModule) },
  { path: 'Gestionar-facturas-invergoal-inversuez', loadChildren: () => import('./Modules/gestion-facturas-invergoal-inversuez/gestion-facturas-invergoal-inversuez.module').then(m => m.GestionFacturasInvergoalInversuezModule) },

  /*************************************************************** RECIBOS DE CAJA ZEUS **************************************************************************/
  { path: 'recibos-caja-zeus', loadChildren: () => import('./Modules/recibos-caja-zeus/recibos-caja-zeus.module').then(m => m.RecibosCajaZeusModule) },

  /*************************************************************** CERTIFICADOS DE CALIDAD **************************************************************************/
  { path: 'rpt-certificados-calidad', loadChildren: () => import('./Modules/mov-certificados-calidad/mov-certificados-calidad.module').then(m => m.MovCertificadosCalidadModule) },
  { path: 'certificados-calidad', loadChildren: () => import('./Modules/certificados-calidad/certificados-calidad.module').then(m => m.CertificadosCalidadModule) },

  /*************************************************************** CONTROLES DE CALIDAD *************************************************************************************************/
  { path: 'control-calidad', loadChildren: () => import('./Modules/control-calidad/control-calidad.module').then(m => m.ControlCalidadModule) },

  /***************************************************************  *************************************************************************************************/
  { path: 'costos-caja-menor', loadChildren: () => import('./Modules/costos-caja-menor/costos-caja-menor.module').then(m => m.CostosCajaMenorModule) },
  { path: 'facturacion-detallada', loadChildren: () => import('./Modules/reporte-facturacion-detallada/reporte-facturacion-detallada.module').then(m => m.ReporteFacturacionDetalladaModule) },
  { path: 'reporte-produccion', loadChildren: () => import('./Modules/reporte-produccion/reporte-produccion.module').then(m => m.ReporteProduccionModule) },
  { path: 'reportes-generales', loadChildren: () => import('./Modules/reportes-consolidados/reportes-consolidados.module').then(m => m.ReportesConsolidadosModule) },
  { path: 'reporte-facturacion-clientes', loadChildren: () => import('./Modules/reporte-facturacion-clientes/reporte-facturacion-clientes.module').then(m => m.ReporteFacturacionClientesModule) },
  
  /*************************************************************** PELETIZADO *************************************************************************************************/
  { path: 'ingreso-peletizado', loadChildren: () => import('./Modules/ingreso-peletizado/ingreso-peletizado.module').then(m => m.IngresoPeletizadoModule) },
  { path: 'mov-ingreso-peletizado', loadChildren: () => import('./Modules/mov-ingreso-peletizado/mov-ingreso-peletizado.module').then(m => m.MovIngresoPeletizadoModule) },
  { path: 'inventario-peletizado', loadChildren: () => import('./Modules/inventario-peletizado/inventario-peletizado.module').then(m => m.InventarioPeletizadoModule) },
  { path: 'salidas-peletizado', loadChildren: () => import('./Modules/salidas-peletizado/salidas-peletizado.module').then(m => m.SalidasPeletizadoModule) },
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
