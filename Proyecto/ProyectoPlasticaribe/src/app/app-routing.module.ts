import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from './Guards/vistas-permisos.guard';
import { ArchivosComponent } from './Vistas/Archivos/Archivos.component';
import { AsignarProductosFacturasComponent } from './Vistas/AsignarProductosFacturas/AsignarProductosFacturas.component';
import { CertificadoCalidadComponent } from './Vistas/Certificado-Calidad/Certificado-Calidad.component';
import { ControlCalidadComponent } from './Vistas/ControlCalidad/ControlCalidad.component';
import { Devoluciones_Productos_RollosComponent } from './Vistas/Devoluciones_Productos_Rollos/Devoluciones_Productos_Rollos.component';
import { EliminarRollos_ExtrusionComponent } from './Vistas/EliminarRollos_Extrusion/EliminarRollos_Extrusion.component';
import { EntradaBOPPComponent } from './Vistas/Entrada-BOPP/Entrada-BOPP.component';
import { Facturacion_OrdenMaquilaComponent } from './Vistas/Facturacion_OrdenMaquila/Facturacion_OrdenMaquila.component';
import { Facturas_Invergoal_InversuezComponent } from './Vistas/Facturas_Invergoal_Inversuez/Facturas_Invergoal_Inversuez.component';
import { Gestion_TicketsComponent } from './Vistas/Gestion_Tickets/Gestion_Tickets.component';
import { Gestion_VistasComponent } from './Vistas/Gestion_Vistas/Gestion_Vistas.component';
import { Gestionar_Facturas_Invergoal_InversuezComponent } from './Vistas/Gestionar_Facturas_Invergoal_Inversuez/Gestionar_Facturas_Invergoal_Inversuez.component';
import { Ingresar_ProductosComponent } from './Vistas/Ingresar_Productos/Ingresar_Productos.component';
import { Ingreso_NominaComponent } from './Vistas/Ingreso_Nomina/Ingreso_Nomina.component';
import { Ingreso_Rollos_ExtrusionComponent } from './Vistas/Ingreso_Rollos_Extrusion/Ingreso_Rollos_Extrusion.component';
import { InventarioProductosPBDDComponent } from './Vistas/Inventario-Productos-PBDD/Inventario-Productos-PBDD.component';
import { Inventario_Bodegas_RollosComponent } from './Vistas/Inventario_Bodegas_Rollos/Inventario_Bodegas_Rollos.component';
import { Mantenimiento_CamionesComponent } from './Vistas/Mantenimiento_Camiones/Mantenimiento_Camiones.component';
import { MateriaPrimaRecuperadaComponent } from './Vistas/MateriaPrimaRecuperada/MateriaPrimaRecuperada.component';
import { Movimientos_MantenimientoComponent } from './Vistas/Movimientos_Mantenimiento/Movimientos_Mantenimiento.component';
import { Movimientos_SolicitudRollosComponent } from './Vistas/Movimientos_SolicitudRollos/Movimientos_SolicitudRollos.component';
import { NominaComponent } from './Vistas/Nomina/Nomina.component';
import { Orden_MaquilaComponent } from './Vistas/Orden_Maquila/Orden_Maquila.component';
import { PaginaPrincipalComponent } from './Vistas/PaginaPrincipal/PaginaPrincipal.component';
import { PedidoExternoComponent } from './Vistas/Pedido-Externo/Pedido-Externo.component';
import { PedidoMantenimientoComponent } from './Vistas/Pedido-Mantenimiento/Pedido-Mantenimiento.component';
import { PreIngresoRolloSelladoComponent } from './Vistas/PreIngresoRolloSellado/PreIngresoRolloSellado.component';
import { PreIngresoRollosExtrusionComponent } from './Vistas/PreIngresoRollosExtrusion/PreIngresoRollosExtrusion.component';
import { Recibos_CajaComponent } from './Vistas/Recibos_Caja/Recibos_Caja.component';
import { ReporteDespachoComponent } from './Vistas/Reporte-Despacho/Reporte-Despacho.component';
import { ReportePedidos_ZeusComponent } from './Vistas/ReportePedidos_Zeus/ReportePedidos_Zeus.component';
import { Reporte_CertificadosCalidadComponent } from './Vistas/Reporte_CertificadosCalidad/Reporte_CertificadosCalidad.component';
import { Reporte_Consolidado_FacturacionComponent } from './Vistas/Reporte_Consolidado_Facturacion/Reporte_Consolidado_Facturacion.component';
import { Reporte_DesperdiciosComponent } from './Vistas/Reporte_Desperdicios/Reporte_Desperdicios.component';
import { Reporte_FacturacionZeusComponent } from './Vistas/Reporte_FacturacionZeus/Reporte_FacturacionZeus.component';
import { Reporte_MantenimientoComponent } from './Vistas/Reporte_Mantenimiento/Reporte_Mantenimiento.component';
import { Reporte_MaquilasComponent } from './Vistas/Reporte_Maquilas/Reporte_Maquilas.component';
import { Reporte_OrdenCompraComponent } from './Vistas/Reporte_OrdenCompra/reporte_OrdenCompra.component';
import { Reporte_Procesos_OTComponent } from './Vistas/Reporte_Procesos_OT/Reporte_Procesos_OT.component';
import { Reporte_RecuperadoMPComponent } from './Vistas/Reporte_RecuperadoMP/Reporte_RecuperadoMP.component';
import { Reporte_RollosDesechosComponent } from './Vistas/Reporte_RollosDesechos/Reporte_RollosDesechos.component';
import { Reporte_SolicitudMpExtrusionComponent } from './Vistas/Reporte_SolicitudMpExtrusion/Reporte_SolicitudMpExtrusion.component';
import { Reporte_SolicitudesMPComponent } from './Vistas/Reporte_SolicitudesMP/Reporte_SolicitudesMP.component';
import { RollosAsignadasFacturaComponent } from './Vistas/RollosAsignadasFactura/RollosAsignadasFactura.component';
import { SolicitudMateriaPrimaComponent } from './Vistas/Solicitud-Materia-Prima/Solicitud-Materia-Prima.component';
import { SolicitudMP_ExtrusionComponent } from './Vistas/SolicitudMP_Extrusion/SolicitudMP_Extrusion.component';
import { Solicitud_Rollos_BodegasComponent } from './Vistas/Solicitud_Rollos_Bodegas/Solicitud_Rollos_Bodegas.component';
import { TicketsComponent } from './Vistas/Tickets/Tickets.component';
import { AsignacionTintasComponent } from './Vistas/asignacion-Tintas/asignacion-Tintas.component';
import { AsignacionMateriaPrimaComponent } from './Vistas/asignacion-materia-prima/asignacion-materia-prima.component';
import { AsignacionBOPP_TEMPORALComponent } from './Vistas/asignacionBOPP_TEMPORAL/asignacionBOPP_TEMPORAL.component';
import { DesperdicioComponent } from './Vistas/desperdicio/desperdicio.component';
import { DevolucionesMPComponent } from './Vistas/devolucionesMP/devolucionesMP.component';
import { LoginComponentComponent } from './Vistas/login-component/login-component.component';
import { ModalGenerarInventarioZeusComponent } from './Vistas/modal-generar-inventario-zeus/modal-generar-inventario-zeus.component';
import { MovimientoMPComponent } from './Vistas/movimientoMP/movimientoMP.component';
import { OcompraComponent } from './Vistas/ocompra/ocompra.component';
import { OrdenesTrabajoComponent } from './Vistas/ordenes-trabajo/ordenes-trabajo.component';
import { PedidomateriaprimaComponent } from './Vistas/pedidomateriaprima/pedidomateriaprima.component';
import { PruebaImagenCatInsumoComponent } from './Vistas/prueba-imagen-cat-insumo/prueba-imagen-cat-insumo.component';
import { RegistroComponentComponent } from './Vistas/registro-component/registro-component.component';
import { ReporteCostosOTComponent } from './Vistas/reporteCostosOT/reporteCostosOT.component';
import { ReporteMateriaPrimaComponent } from './Vistas/reporteMateriaPrima/reporteMateriaPrima.component';

export const routes: Routes = [

  /******************************************************************** Inicio y Login **********************************************************************/
  {path: 'Login', component: LoginComponentComponent},
  {path: '', component: LoginComponentComponent},
  {path: 'home', canActivate: [VistasPermisosGuard], data: {nombre: 'Inicio'}, component: PaginaPrincipalComponent},
  {path: 'Archivos', component: ArchivosComponent},

  /******************************************************************* Materia Prima ************************************************************************/
  {path: 'ocompra-materiaPrima', canActivate: [VistasPermisosGuard], data: {nombre: 'Orden de Compra'}, component: OcompraComponent},
  {path: 'MateriaPrima', canActivate: [VistasPermisosGuard], data: {nombre: 'Entrada Materia Prima'}, component: PedidomateriaprimaComponent},
  {path: 'asignacionMP', canActivate: [VistasPermisosGuard], data: {nombre: 'Asignación de Materia Prima'}, component: AsignacionMateriaPrimaComponent},
  {path: 'mp-recuperada', canActivate: [VistasPermisosGuard], data: {nombre: 'Mat. Prima Recuperada'}, component: MateriaPrimaRecuperadaComponent},
  {path: 'mp-devoluciones', canActivate: [VistasPermisosGuard], data: {nombre: 'Devolución Materia Prima'}, component: DevolucionesMPComponent},
  // Tintas
  {path: 'asignacion-tintas', canActivate: [VistasPermisosGuard], data: {nombre: 'Creación de Tintas'}, component: AsignacionTintasComponent},
  // BOPP
  // {path: 'asignacion-bopp', canActivate: [VistasPermisosGuard], data: {expectedRole : [1,3]}, component: AsignacionBOPPComponent},
  {path: 'entrada-BOPP', canActivate: [VistasPermisosGuard], data: {nombre: 'Entrada BOPP'}, component: EntradaBOPPComponent},
  {path: 'AsignacionBOPPTemporal', canActivate: [VistasPermisosGuard], data: {nombre: 'Asignación BOPP'}, component: AsignacionBOPP_TEMPORALComponent},
  // Movimientos
  {path: 'movimiento-mp', canActivate: [VistasPermisosGuard], data: {nombre: 'Movimientos Mat. Prima'}, component: MovimientoMPComponent},
  // Reportes de materia prima
  {path: 'reporte-Materia-Prima', canActivate: [VistasPermisosGuard], data: {nombre: 'Inventario Mat. Prima'}, component: ReporteMateriaPrimaComponent},
  {path: 'reporte-recuperado-mp', canActivate: [VistasPermisosGuard], data: {nombre: 'Movimientos Recuperado'}, component : Reporte_RecuperadoMPComponent}, // Reporte recuperado MP.
  {path: 'reporte-orden-compra', canActivate: [VistasPermisosGuard], data: {nombre: 'Movimientos Orden Compra'}, component: Reporte_OrdenCompraComponent},
  {path: 'solicitud-materia-prima', canActivate: [VistasPermisosGuard], data: {nombre: 'Solicitud Materia Prima'}, component: SolicitudMateriaPrimaComponent},
  {path: 'reporte-solicitudes-mp', canActivate: [VistasPermisosGuard], data: {nombre: 'Mov. Solicitud Materia Prima'}, component: Reporte_SolicitudesMPComponent},

  /************************************************************************ DESPACHO ************************************************************************/
  // Pre ingresos
  {path: 'preingreso-extrusion', canActivate: [VistasPermisosGuard], data: {nombre: 'Pre Ingreso Extrusión'}, component : PreIngresoRollosExtrusionComponent}, // Pre Ingreso rollos extrusion
  {path: 'preingreso-sellado', canActivate: [VistasPermisosGuard], data: {nombre: 'Pre Ingreso Empaque/Sellado'}, component : PreIngresoRolloSelladoComponent}, // Pre Ingreso rollos sellado
  // Ingresos
  {path: 'ingresar-productos', canActivate: [VistasPermisosGuard], data: {nombre: 'Ingresar Rollos Despacho'}, component : Ingresar_ProductosComponent},
  // Facturacion de rollos
  {path: 'asignacion-productos-facturas', canActivate: [VistasPermisosGuard], data: {nombre: 'Facturar Rollos'}, component : AsignarProductosFacturasComponent},
  // Despacho de maercancia
  {path: 'factura-rollos-productos', canActivate: [VistasPermisosGuard], data: {nombre: 'Despachar Mercancia'}, component : RollosAsignadasFacturaComponent},
  // Devolucion de Rollos
  {path: 'devolucion-rollos-productos', canActivate: [VistasPermisosGuard], data: {nombre: 'Devolución de Rollos'}, component : Devoluciones_Productos_RollosComponent},
  // Reporte
  {path: 'reporte-despacho', canActivate: [VistasPermisosGuard], data: {nombre: 'Movimientos Despacho'}, component : ReporteDespachoComponent}, // Ingresar Productos

  /********************************************************************* ORDEN DE TRABAJO ********************************************************************/
  {path: 'ordenes-trabajo', canActivate: [VistasPermisosGuard], data: {nombre: 'Orden de Trabajo'}, component: OrdenesTrabajoComponent},
  {path: 'reportes-procesos-ot', canActivate: [VistasPermisosGuard], data: {nombre: 'Reporte Procesos OT'}, component: Reporte_Procesos_OTComponent},

  /********************************** Ingreso de Rollos a Extrusion, Solicitudes y Salidas de Rollos a otros Procesos ******************************************/
  {path: 'IngresoRollos-Extrusion', canActivate: [VistasPermisosGuard], data: {nombre: 'Ingreso de Rollos'}, component : Ingreso_Rollos_ExtrusionComponent}, // Ingreso de Rollos a Extrusion.
  {path: 'Solicitud-Rollos-Bodegas', canActivate: [VistasPermisosGuard], data: {nombre: 'Solicitud de Rollos'}, component : Solicitud_Rollos_BodegasComponent}, // Solicitud de Rollos
  {path: 'Movimientos-Solicitud-Rollos', canActivate: [VistasPermisosGuard], data: {nombre: 'Movimientos Solicitudes de Rollos'}, component : Movimientos_SolicitudRollosComponent}, // Movimientos de las Solicitudes de Rollos
  {path: 'Inventario-Bodegas-Rollos', canActivate: [VistasPermisosGuard], data: {nombre: 'Inventario de Bodegas'}, component: Inventario_Bodegas_RollosComponent},

  // {path: 'AsignacionRollos-Extrusion', canActivate: [VistasPermisosGuard], data: {expectedRole : [1,5]}, component : AsignacionRollos_ExtrusionComponent}, // Asignación de rollos desde la bodega de extrusión.
  // {path: 'ReporteRollos-Extrusion', canActivate: [VistasPermisosGuard], data: {expectedRole : [1,5]}, component : ReporteBodegaExtrusionComponent}, // Reporte de la bodega de extrusión.
  // {path: 'Inventario-Extrusion', canActivate: [VistasPermisosGuard], data: {expectedRole : [1,5]}, component: Inventario_ExtrusionComponent},
  {path: 'Eliminar-rollos', canActivate: [VistasPermisosGuard], data: {nombre: 'Eliminar Rollos'}, component : EliminarRollos_ExtrusionComponent}, //Eliminar Rollos de Extrusion
  {path: 'reporte-rollos-eliminados', canActivate: [VistasPermisosGuard], data: {nombre: 'Reporte Rollos Eliminados'}, component :Reporte_RollosDesechosComponent}, /** Reporte de rollos eliminados en extrusión */
  {path: 'reporte-costos-ot', canActivate: [VistasPermisosGuard], data: {nombre: 'Reporte de Costos'}, component: ReporteCostosOTComponent},

  /****************************************************************** INVENTARIO DE PRODUCTOS ****************************************************************/
  {path: 'inventario-productos', canActivate: [VistasPermisosGuard], data: {nombre: 'Producto Terminado'}, component : InventarioProductosPBDDComponent},
  {path: 'inventario-productos-terminados', canActivate: [VistasPermisosGuard], data: {nombre: 'Producto Terminado (Zeus)'}, component: ModalGenerarInventarioZeusComponent},

  /****************************************************************** PEDIDO DE PRODUCTOS ****************************************************************/
  // {path: 'opedidoproducto', component: OpedidoproductoComponent},
  {path: 'pedido-externo', canActivate: [VistasPermisosGuard], data: {nombre: 'Crear Pedido'}, component: PedidoExternoComponent},

  /***************************************************************** USUARIOS **********************************************************************************/
  {path: 'registro-usuario', canActivate: [VistasPermisosGuard], data: {nombre: 'Usuarios'}, component: RegistroComponentComponent},

 /*************************************************************************************************************************************************************/
  {path: 'pruebas', canActivate: [VistasPermisosGuard], data: {nombre: 'Pruebas'}, component: PruebaImagenCatInsumoComponent},
  {path: 'gestion-vistas', canActivate: [VistasPermisosGuard], data: {nombre: 'Vistas'}, component: Gestion_VistasComponent},

 /******************************************************************* MANTENIMIENTO ***************************************************************************/
  {path: 'pedido-mantenimiento', canActivate: [VistasPermisosGuard], data: {nombre: 'Pedido de Mantenimiento de Activos'}, component: PedidoMantenimientoComponent},
  {path: 'movimientos-mantenimientos', canActivate: [VistasPermisosGuard], data: {nombre: 'Movimiento de Mantenimientos de Activos'}, component: Movimientos_MantenimientoComponent},
  {path: 'reporte-activos', canActivate: [VistasPermisosGuard], data: {nombre: 'Inventario de Activos'}, component: Reporte_MantenimientoComponent},
  {path: 'mantenimiento-activos', canActivate: [VistasPermisosGuard], data: {nombre: 'Mantenimiento de Activos'}, component: Mantenimiento_CamionesComponent },

/*********************************************************************** REPORTE PEDIDOS ZEUS *****************************************************************/
  {path: 'Pedidos-Zeus', canActivate: [VistasPermisosGuard], data: {nombre: 'Ver Pedidos'}, component: ReportePedidos_ZeusComponent},
  {path: 'rpt-facturacion-zeus', canActivate: [VistasPermisosGuard], data: {nombre: 'Consolidado de Facturación'}, component: Reporte_FacturacionZeusComponent},

 /*************************************************************** DESPERDICIO *********************************************************************************/
  {path: 'desperdicio', canActivate: [VistasPermisosGuard], data: {nombre: 'Ingresar Desperdicio'}, component: DesperdicioComponent},
  {path: 'reporte-desperdicios', canActivate: [VistasPermisosGuard], data: {nombre: 'Reporte Desperdicio'}, component: Reporte_DesperdiciosComponent },

  /*************************************************************** ORDEN DE MAQUILA **************************************************************************/
  {path: 'Orden-Maquila', canActivate: [VistasPermisosGuard], data: {nombre: 'Orden de Maquila'}, component: Orden_MaquilaComponent},
  {path: 'Facturacion-Orden-Maquila', canActivate: [VistasPermisosGuard], data: {nombre: 'Facturar Orden de Maquila'}, component: Facturacion_OrdenMaquilaComponent},
  {path: 'Reporte-Maquilas', canActivate: [VistasPermisosGuard], data: {nombre: 'Movimientos de Maquilas'}, component: Reporte_MaquilasComponent},

  /*************************************************************** DASBOARD **************************************************************************/
  {path: 'Tickets', canActivate: [VistasPermisosGuard], data: {nombre: 'Tickets'}, component: TicketsComponent},
  {path: 'Gestion-Tickets', canActivate: [VistasPermisosGuard], data: {nombre : 'Gestionar Tickets'}, component: Gestion_TicketsComponent},

  /** */
  {path: 'Reporte-Facturacion', canActivate: [VistasPermisosGuard], data: {nombre: 'Consolidado Facturación 2'}, component: Reporte_Consolidado_FacturacionComponent},

  /*************************************************************** DASBOARD **************************************************************************/
  {path: 'nomina', canActivate: [VistasPermisosGuard], data: {nombre: 'Nómina'}, component: NominaComponent},
  {path: 'ingreso-nomina', canActivate: [VistasPermisosGuard], data: {nombre: 'Ingreso de Nómina'}, component: Ingreso_NominaComponent},

  /*************************************************************** SOLICITUDES DE MATERIA PRIMA A EXTRUSION **************************************************************************/
  {path: 'solicitud-mp-extrusion', canActivate: [VistasPermisosGuard], data: {nombre: 'Solicitud Material Producción'}, component: SolicitudMP_ExtrusionComponent},
  {path: 'reporte-solicitud-mp-extrusion', canActivate: [VistasPermisosGuard], data: {nombre: 'Mov. Solicitud Material Producción'}, component: Reporte_SolicitudMpExtrusionComponent},

  {path: 'facturas-invergoal-inversuez', canActivate: [VistasPermisosGuard], data: {nombre: 'Ingreso de Facturas'}, component: Facturas_Invergoal_InversuezComponent},
  {path: 'Gestionar-facturas-invergoal-inversuez', canActivate: [VistasPermisosGuard], data: {nombre: 'Gestion de Facturas'}, component: Gestionar_Facturas_Invergoal_InversuezComponent},

  /*************************************************************** RECIBOS DE CAJA ZEUS **************************************************************************/
  {path: 'recibos-caja-zeus', canActivate: [VistasPermisosGuard], data: {nombre: 'Reporte Recibos de Caja'}, component: Recibos_CajaComponent},

  /*************************************************************** CERTIFICADOS DE CALIDAD **************************************************************************/
  {path: 'rpt-certificados-calidad', canActivate: [VistasPermisosGuard], data: {nombre: 'Reporte Certificados Calidad'}, component: Reporte_CertificadosCalidadComponent},
  {path: 'certificados-calidad', canActivate: [VistasPermisosGuard], data: {nombre: 'Certificados de Calidad'}, component: CertificadoCalidadComponent},

  /*************************************************************** CONTROLES DE CALIDAD *************************************************************************************************/
  {path: 'control-calidad', canActivate: [VistasPermisosGuard], data: {nombre: 'Control de Calidad'}, component: ControlCalidadComponent},
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
