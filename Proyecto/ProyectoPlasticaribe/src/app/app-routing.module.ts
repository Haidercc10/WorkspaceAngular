import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuardServiceGuard } from './Guards/role-guard-service.guard';
import { ArchivosComponent } from './Vistas/Archivos/Archivos.component';
import { AsignacionRollos_ExtrusionComponent } from './Vistas/AsignacionRollos_Extrusion/AsignacionRollos_Extrusion.component';
import { AsignarProductosFacturasComponent } from './Vistas/AsignarProductosFacturas/AsignarProductosFacturas.component';
import { Devoluciones_Productos_RollosComponent } from './Vistas/Devoluciones_Productos_Rollos/Devoluciones_Productos_Rollos.component';
import { EliminarRollos_ExtrusionComponent } from './Vistas/EliminarRollos_Extrusion/EliminarRollos_Extrusion.component';
import { EntradaBOPPComponent } from './Vistas/Entrada-BOPP/Entrada-BOPP.component';
import { Facturacion_OrdenMaquilaComponent } from './Vistas/Facturacion_OrdenMaquila/Facturacion_OrdenMaquila.component';
import { Gestion_TicketsComponent } from './Vistas/Gestion_Tickets/Gestion_Tickets.component';
import { Ingresar_ProductosComponent } from './Vistas/Ingresar_Productos/Ingresar_Productos.component';
import { IngresoRollos_ExtrusionComponent } from './Vistas/IngresoRollos_Extrusion/IngresoRollos_Extrusion.component';
import { InventarioProductosPBDDComponent } from './Vistas/Inventario-Productos-PBDD/Inventario-Productos-PBDD.component';
import { Inventario_ExtrusionComponent } from './Vistas/Inventario_Extrusion/Inventario_Extrusion.component';
import { Mantenimiento_CamionesComponent } from './Vistas/Mantenimiento_Camiones/Mantenimiento_Camiones.component';
import { MateriaPrimaRecuperadaComponent } from './Vistas/MateriaPrimaRecuperada/MateriaPrimaRecuperada.component';
import { Movimientos_MantenimientoComponent } from './Vistas/Movimientos_Mantenimiento/Movimientos_Mantenimiento.component';
import { Orden_MaquilaComponent } from './Vistas/Orden_Maquila/Orden_Maquila.component';
import { PaginaPrincipalComponent } from './Vistas/PaginaPrincipal/PaginaPrincipal.component';
import { PedidoExternoComponent } from './Vistas/Pedido-Externo/Pedido-Externo.component';
import { PedidoMantenimientoComponent } from './Vistas/Pedido-Mantenimiento/Pedido-Mantenimiento.component';
import { PreIngresoRolloSelladoComponent } from './Vistas/PreIngresoRolloSellado/PreIngresoRolloSellado.component';
import { PreIngresoRollosExtrusionComponent } from './Vistas/PreIngresoRollosExtrusion/PreIngresoRollosExtrusion.component';
import { ReporteDespachoComponent } from './Vistas/Reporte-Despacho/Reporte-Despacho.component';
import { ReporteBodegaExtrusionComponent } from './Vistas/ReporteBodegaExtrusion/ReporteBodegaExtrusion.component';
import { ReportePedidos_ZeusComponent } from './Vistas/ReportePedidos_Zeus/ReportePedidos_Zeus.component';
import { Reporte_Consolidado_FacturacionComponent } from './Vistas/Reporte_Consolidado_Facturacion/Reporte_Consolidado_Facturacion.component';
import { Reporte_DesperdiciosComponent } from './Vistas/Reporte_Desperdicios/Reporte_Desperdicios.component';
import { Reporte_FacturacionZeusComponent } from './Vistas/Reporte_FacturacionZeus/Reporte_FacturacionZeus.component';
import { Reporte_MantenimientoComponent } from './Vistas/Reporte_Mantenimiento/Reporte_Mantenimiento.component';
import { Reporte_MaquilasComponent } from './Vistas/Reporte_Maquilas/Reporte_Maquilas.component';
import { Reporte_OrdenCompraComponent } from './Vistas/Reporte_OrdenCompra/reporte_OrdenCompra.component';
import { Reporte_PedidosVendedoresComponent } from './Vistas/Reporte_PedidosVendedores/Reporte_PedidosVendedores.component';
import { Reporte_Procesos_OTComponent } from './Vistas/Reporte_Procesos_OT/Reporte_Procesos_OT.component';
import { Reporte_RecuperadoMPComponent } from './Vistas/Reporte_RecuperadoMP/Reporte_RecuperadoMP.component';
import { Reporte_RollosDesechosComponent } from './Vistas/Reporte_RollosDesechos/Reporte_RollosDesechos.component';
import { RollosAsignadasFacturaComponent } from './Vistas/RollosAsignadasFactura/RollosAsignadasFactura.component';
import { SolicitudMateriaPrimaComponent } from './Vistas/Solicitud-Materia-Prima/Solicitud-Materia-Prima.component';
import { TicketsComponent } from './Vistas/Tickets/Tickets.component';
import { AsignacionTintasComponent } from './Vistas/asignacion-Tintas/asignacion-Tintas.component';
import { AsignacionBOPPComponent } from './Vistas/asignacion-bopp/asignacion-bopp.component';
import { AsignacionMateriaPrimaComponent } from './Vistas/asignacion-materia-prima/asignacion-materia-prima.component';
import { AsignacionBOPP_TEMPORALComponent } from './Vistas/asignacionBOPP_TEMPORAL/asignacionBOPP_TEMPORAL.component';
import { ConsultaFac_Rem_MPComponent } from './Vistas/consultaFac_Rem_MP/consultaFac_Rem_MP.component';
import { CrearBoppComponent } from './Vistas/crear-bopp/crear-bopp.component';
import { ClientesComponent } from './Vistas/crear-clientes/crear-clientes.component';
import { CrearMateriaprimaComponent } from './Vistas/crear-materiaprima/crear-materiaprima.component';
import { CrearProductoComponent } from './Vistas/crear-producto/crear-producto.component';
import { CrearProveedorComponent } from './Vistas/crear-proveedor/crear-proveedor.component';
import { CrearTintasComponent } from './Vistas/crear-tintas/crear-tintas.component';
import { DesperdicioComponent } from './Vistas/desperdicio/desperdicio.component';
import { DevolucionesMPComponent } from './Vistas/devolucionesMP/devolucionesMP.component';
import { LoginComponentComponent } from './Vistas/login-component/login-component.component';
import { ModalGenerarInventarioZeusComponent } from './Vistas/modal-generar-inventario-zeus/modal-generar-inventario-zeus.component';
import { MovimientoMPComponent } from './Vistas/movimientoMP/movimientoMP.component';
import { OcompraComponent } from './Vistas/ocompra/ocompra.component';
import { OpedidoproductoComponent } from './Vistas/opedidoproducto/opedidoproducto.component';
import { OrdenesTrabajoComponent } from './Vistas/ordenes-trabajo/ordenes-trabajo.component';
import { PedidomateriaprimaComponent } from './Vistas/pedidomateriaprima/pedidomateriaprima.component';
import { PruebaImagenCatInsumoComponent } from './Vistas/prueba-imagen-cat-insumo/prueba-imagen-cat-insumo.component';
import { RegistroComponentComponent } from './Vistas/registro-component/registro-component.component';
import { ReporteCostosOTComponent } from './Vistas/reporteCostosOT/reporteCostosOT.component';
import { ReporteMateriaPrimaComponent } from './Vistas/reporteMateriaPrima/reporteMateriaPrima.component';
import { Reporte_SolicitudesMPComponent } from './Vistas/Reporte_SolicitudesMP/Reporte_SolicitudesMP.component';
import { NominaComponent } from './Vistas/Nomina/Nomina.component';
import { SolicitudMP_ExtrusionComponent } from './Vistas/SolicitudMP_Extrusion/SolicitudMP_Extrusion.component';

export const routes: Routes = [

  /******************************************************************** Inicio y Login **********************************************************************/
  {path: 'Login', component: LoginComponentComponent},
  {path: '', component: LoginComponentComponent},
  {path: 'home', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,2,3,4,5,6,7,8,9,10,11,12,13,60,61]}, component: PaginaPrincipalComponent},
  {path: 'Archivos', component: ArchivosComponent},

  /******************************************************************* Materia Prima ************************************************************************/
  {path: 'ocompra-materiaPrima', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,6,13]}, component: OcompraComponent},
  {path: 'MateriaPrima', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3]}, component: PedidomateriaprimaComponent},
  {path: 'asignacionMP', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3]}, component: AsignacionMateriaPrimaComponent},
  {path: 'mp-recuperada', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3]}, component: MateriaPrimaRecuperadaComponent},
  {path: 'mp-devoluciones', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3]}, component: DevolucionesMPComponent},
  // Tintas
  {path: 'asignacion-tintas', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3]}, component: AsignacionTintasComponent},
  // BOPP
  {path: 'asignacion-bopp', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3]}, component: AsignacionBOPPComponent},
  {path: 'entrada-BOPP', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3]}, component: EntradaBOPPComponent},
  {path: 'AsignacionBOPPTemporal', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3]}, component: AsignacionBOPP_TEMPORALComponent},
  // Creacion
  {path: 'crear-proveedor', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,13]}, component: CrearProveedorComponent},
  {path: 'crear-materiaprima', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,13]}, component: CrearMateriaprimaComponent},
  {path: 'crear-bopp', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,13]}, component: CrearBoppComponent},
  {path: 'crear-tintas', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,13]}, component: CrearTintasComponent},
  // Movimientos
  {path: 'movimiento-mp', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3,4]}, component: MovimientoMPComponent},
  // Reportes de materia prima
  {path: 'reporte-Materia-Prima', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3,4]}, component: ReporteMateriaPrimaComponent},
  {path: 'reporte-facturas-remisiones-mp', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3]}, component: ConsultaFac_Rem_MPComponent},
  {path: 'reporte-recuperado-mp', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3]}, component : Reporte_RecuperadoMPComponent}, // Reporte recuperado MP.
  {path: 'reporte-orden-compra', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3,6,13]}, component: Reporte_OrdenCompraComponent},
  {path: 'solicitud-materia-prima', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3]}, component: SolicitudMateriaPrimaComponent},
  {path: 'reporte-solicitudes-mp', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3,13]}, component: Reporte_SolicitudesMPComponent},

  /************************************************************************ DESPACHO ************************************************************************/
  // Pre ingresos
  {path: 'preingreso-extrusion', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,7]}, component : PreIngresoRollosExtrusionComponent}, // Pre Ingreso rollos extrusion
  {path: 'preingreso-sellado', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,8,9]}, component : PreIngresoRolloSelladoComponent}, // Pre Ingreso rollos sellado
  // Ingresos
  {path: 'ingresar-productos', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,10]}, component : Ingresar_ProductosComponent},
  // Facturacion de rollos
  {path: 'asignacion-productos-facturas', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,6]}, component : AsignarProductosFacturasComponent},
  // Despacho de maercancia
  {path: 'factura-rollos-productos', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,10]}, component : RollosAsignadasFacturaComponent},
  // Devolucion de Rollos
  {path: 'devolucion-rollos-productos', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,10]}, component : Devoluciones_Productos_RollosComponent},
  // Reporte
  {path: 'reporte-despacho', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,6,7,8,9,10]}, component : ReporteDespachoComponent}, // Ingresar Productos

  /********************************************************************* ORDEN DE TRABAJO ********************************************************************/
  {path: 'ordenes-trabajo', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1]}, component: OrdenesTrabajoComponent},
  {path: 'reportes-procesos-ot', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,12]}, component: Reporte_Procesos_OTComponent},
  {path: 'reporte-pedidos-vendedores', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,2,60]}, component : Reporte_PedidosVendedoresComponent}, // Pedidos Vendedores

  /************************************** Ingreso de Rollos a Extrusion y Asignacion de Rollos a otros Procesos **********************************************/
  {path: 'IngresoRollos-Extrusion', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,5]}, component : IngresoRollos_ExtrusionComponent}, // Ingreso de Rollos a Extrusion.
  {path: 'AsignacionRollos-Extrusion', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,5]}, component : AsignacionRollos_ExtrusionComponent}, // Asignación de rollos desde la bodega de extrusión.
  {path: 'ReporteRollos-Extrusion', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,5]}, component : ReporteBodegaExtrusionComponent}, // Reporte de la bodega de extrusión.
  {path: 'Inventario-Extrusion', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,5]}, component: Inventario_ExtrusionComponent},
  {path: 'Eliminar-rollos', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1]}, component : EliminarRollos_ExtrusionComponent}, //Eliminar Rollos de Extrusion
  {path: 'reporte-rollos-eliminados', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1]}, component :Reporte_RollosDesechosComponent}, /** Reporte de rollos eliminados en extrusión */
  {path: 'reporte-costos-ot', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1]}, component: ReporteCostosOTComponent},

  /****************************************************************** INVENTARIO DE PRODUCTOS ****************************************************************/
  {path: 'inventario-productos', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1]}, component : InventarioProductosPBDDComponent},
  {path: 'inventario-productos-terminados', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,6,10,60,61]}, component: ModalGenerarInventarioZeusComponent},

  /****************************************************************** PEDIDO DE PRODUCTOS ****************************************************************/
  {path: 'opedidoproducto', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,2]}, component: OpedidoproductoComponent},
  {path: 'pedido-externo', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,2]}, component: PedidoExternoComponent},
  {path: 'crearproducto', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,2]}, component:CrearProductoComponent},
  {path: 'crear-clientes', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,2]}, component:ClientesComponent},

 /***************************************************************** USUARIOS **********************************************************************************/
  {path: 'prueba-cat-insumo',  component: PruebaImagenCatInsumoComponent},
  {path: 'registro-usuario', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1]}, component: RegistroComponentComponent},

 /*************************************************************************************************************************************************************/
  {path: 'prueba-cat-insumo', data: {expectedRole : [1]}, component: PruebaImagenCatInsumoComponent},

 /******************************************************************* MANTENIMIENTO ***************************************************************************/
  {path: 'pedido-mantenimiento', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1]}, component: PedidoMantenimientoComponent},
  {path: 'movimientos-mantenimientos', canActivate: [RoleGuardServiceGuard], data: {expectedRole: [1]}, component: Movimientos_MantenimientoComponent},
  {path: 'reporte-activos', canActivate: [RoleGuardServiceGuard], data: {expectedRole: [1]}, component: Reporte_MantenimientoComponent},
  {path: 'mantenimiento-activos', canActivate: [RoleGuardServiceGuard], data: {expectedRole: [1]}, component: Mantenimiento_CamionesComponent },

/*********************************************************************** REPORTE PEDIDOS ZEUS *****************************************************************/
  {path: 'Pedidos-Zeus', canActivate: [RoleGuardServiceGuard], data: {expectedRole: [1,2,6,10,60,61]}, component: ReportePedidos_ZeusComponent},
  {path: 'rpt-facturacion-zeus', canActivate: [RoleGuardServiceGuard], data: {expectedRole: [1,2,60]}, component: Reporte_FacturacionZeusComponent},

 /*************************************************************** DESPERDICIO *********************************************************************************/
  {path: 'desperdicio', canActivate: [RoleGuardServiceGuard], data: {expectedRole: [1, 12]}, component: DesperdicioComponent},
  {path: 'reporte-desperdicios', canActivate: [RoleGuardServiceGuard], data: {expectedRole: [1, 12]}, component: Reporte_DesperdiciosComponent },

  /*************************************************************** ORDEN DE MAQUILA **************************************************************************/
  {path: 'Orden-Maquila', canActivate: [RoleGuardServiceGuard], data: {expectedRole: [1]}, component: Orden_MaquilaComponent},
  {path: 'Facturacion-Orden-Maquila', canActivate: [RoleGuardServiceGuard], data: {expectedRole: [1,3]}, component: Facturacion_OrdenMaquilaComponent},
  {path: 'Reporte-Maquilas', canActivate: [RoleGuardServiceGuard], data: {expectedRole: [1,3]}, component: Reporte_MaquilasComponent},

  /*************************************************************** DASBOARD **************************************************************************/
  {path: 'Tickets', canActivate: [RoleGuardServiceGuard], data: {expectedRole: [1,2,3,4,5,6,7,8,9,10,11,12,13,59,60]}, component: TicketsComponent},
  {path: 'Gestion-Tickets', canActivate: [RoleGuardServiceGuard], data: {expectedRole: [1]}, component: Gestion_TicketsComponent},

  /** */
  {path: 'Reporte-Facturacion', canActivate: [RoleGuardServiceGuard], data: {expectedRole: [1,2,60]}, component: Reporte_Consolidado_FacturacionComponent},

  /*************************************************************** DASBOARD **************************************************************************/
  {path: 'nomina', canActivate: [RoleGuardServiceGuard], data: {expectedRole: [1,61]}, component: NominaComponent},

  /*************************************************************** SOLICITUDES DE MATERIA PRIMA A EXTRUSION **************************************************************************/
  {path: 'solicitud-mp-extrusion', canActivate: [RoleGuardServiceGuard], data: {expectedRole: [1]}, component: SolicitudMP_ExtrusionComponent},
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
