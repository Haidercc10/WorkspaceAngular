import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { NgChartsModule } from 'ng2-charts';
import { CookieService } from 'ngx-cookie-service';
import { NgxPaginationModule } from 'ngx-pagination';
import { StorageServiceModule } from 'ngx-webstorage-service';
import { AccordionModule } from 'primeng/accordion';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { CarouselModule } from 'primeng/carousel';
import { CascadeSelectModule } from "primeng/cascadeselect";
import { ChartModule } from 'primeng/chart';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DataViewModule } from 'primeng/dataview';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DockModule } from 'primeng/dock';
import { DropdownModule } from 'primeng/dropdown';
import { EditorModule } from 'primeng/editor';
import { FieldsetModule } from 'primeng/fieldset';
import { FileUploadModule } from 'primeng/fileupload';
import { GalleriaModule } from 'primeng/galleria';
import { ImageModule } from 'primeng/image';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { KnobModule } from 'primeng/knob';
import { MenuModule } from 'primeng/menu';
import { MultiSelectModule } from 'primeng/multiselect';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PasswordModule } from 'primeng/password';
import { PickListModule } from 'primeng/picklist';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SidebarModule } from 'primeng/sidebar';
import { SkeletonModule } from 'primeng/skeleton';
import { SlideMenuModule } from 'primeng/slidemenu';
import { SliderModule } from 'primeng/slider';
import { SpeedDialModule } from 'primeng/speeddial';
import { TableModule } from 'primeng/table';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TreeTableModule } from 'primeng/treetable';
import { VirtualScrollerModule } from 'primeng/virtualscroller';
import { MaterialExampleModule } from '../material.module';
import { RoleGuardServiceGuard } from './Guards/role-guard-service.guard';
import { BuscarInventarioXProductoPipe } from './Pipes/BuscarInventarioXProducto.pipe';
import { FiltroXClientes_OTVendedoresPipe } from './Pipes/FiltroXClientes_OTVendedores.pipe';
import { FiltroXProducto_OTVendedoresPipe } from './Pipes/FiltroXProducto_OTVendedores.pipe';
import { FiltroNombreClientePTPipe } from './Pipes/filtro-nombre-cliente-pt.pipe';
import { FiltroXClienteDespachoPipe } from './Pipes/filtroXClienteDespacho.pipe';
import { FiltroXEstadoDespachoPipe } from './Pipes/filtroXEstadoDespacho.pipe';
import { FiltroXFacturasPipe } from './Pipes/filtroXFacturas.pipe';
import { FiltroXProducto_RptDespachoPipe } from './Pipes/filtroXProducto_RptDespacho.pipe';
import { FiltroXRollo_RptDespachoPipe } from './Pipes/filtroXRollo_RptDespacho.pipe';
import { FiltroXTipoDocumentoPipe } from './Pipes/filtroXTipoDocumento.pipe';
import { FiltrosProductosTerminadosZeusPipe } from './Pipes/filtros-productos-terminados-zeus.pipe';
import { ArchivosComponent } from './Vistas/Archivos/Archivos.component';
import { AsignacionRollos_ExtrusionComponent } from './Vistas/AsignacionRollos_Extrusion/AsignacionRollos_Extrusion.component';
import { AsignarProductosFacturasComponent } from './Vistas/AsignarProductosFacturas/AsignarProductosFacturas.component';
import { CrearTerceroComponent } from './Vistas/Crear-Tercero/Crear-Tercero.component';
import { CrearCategoriasComponent } from './Vistas/CrearCategorias/CrearCategorias.component';
import { DashBoard_FacturacionComponent } from './Vistas/DashBoard_Facturacion/DashBoard_Facturacion.component';
import { DashBoard_PedidosComponent } from './Vistas/DashBoard_Pedidos/DashBoard_Pedidos.component';
import { DashboardOTComponent } from './Vistas/Dashboard-OT/Dashboard-OT.component';
import { Dashboard_MatPrimaComponent } from './Vistas/Dashboard_MatPrima/Dashboard_MatPrima.component';
import { DatosOTStatusComponent } from './Vistas/DatosOT-Status/DatosOT-Status.component';
import { Devoluciones_Productos_RollosComponent } from './Vistas/Devoluciones_Productos_Rollos/Devoluciones_Productos_Rollos.component';
import { EliminarRollos_ExtrusionComponent } from './Vistas/EliminarRollos_Extrusion/EliminarRollos_Extrusion.component';
import { EntradaBOPPComponent } from './Vistas/Entrada-BOPP/Entrada-BOPP.component';
import { Entrada_TintasComponent } from './Vistas/Entrada_Tintas/Entrada_Tintas.component';
import { EstadosOT_VendedoresComponent } from './Vistas/EstadosOT_Vendedores/EstadosOT_Vendedores.component';
import { Facturacion_OrdenMaquilaComponent } from './Vistas/Facturacion_OrdenMaquila/Facturacion_OrdenMaquila.component';
import { Gestion_TicketsComponent } from './Vistas/Gestion_Tickets/Gestion_Tickets.component';
import { Ingresar_ProductosComponent } from './Vistas/Ingresar_Productos/Ingresar_Productos.component';
import { IngresoRollos_ExtrusionComponent } from './Vistas/IngresoRollos_Extrusion/IngresoRollos_Extrusion.component';
import { InventarioProductosPBDDComponent } from './Vistas/Inventario-Productos-PBDD/Inventario-Productos-PBDD.component';
import { Inventario_ExtrusionComponent } from './Vistas/Inventario_Extrusion/Inventario_Extrusion.component';
import { Mantenimiento_CamionesComponent } from './Vistas/Mantenimiento_Camiones/Mantenimiento_Camiones.component';
import { MateriaPrimaRecuperadaComponent } from './Vistas/MateriaPrimaRecuperada/MateriaPrimaRecuperada.component';
import { Modal_RptRecuperadoMPComponent } from './Vistas/Modal_RptRecuperadoMP/Modal_RptRecuperadoMP.component';
import { Movimientos_MantenimientoComponent } from './Vistas/Movimientos_Mantenimiento/Movimientos_Mantenimiento.component';
import { Orden_MaquilaComponent } from './Vistas/Orden_Maquila/Orden_Maquila.component';
import { PaginaPrincipalComponent } from './Vistas/PaginaPrincipal/PaginaPrincipal.component';
import { PedidoExternoComponent } from './Vistas/Pedido-Externo/Pedido-Externo.component';
import { PedidoMantenimientoComponent } from './Vistas/Pedido-Mantenimiento/Pedido-Mantenimiento.component';
import { PreIngresoRolloSelladoComponent } from './Vistas/PreIngresoRolloSellado/PreIngresoRolloSellado.component';
import { PreIngresoRollosExtrusionComponent } from './Vistas/PreIngresoRollosExtrusion/PreIngresoRollosExtrusion.component';
import { ReporteDespachoComponent } from './Vistas/Reporte-Despacho/Reporte-Despacho.component';
import { ReporteBodegaExtrusionComponent } from './Vistas/ReporteBodegaExtrusion/ReporteBodegaExtrusion.component';
import { ReporteFacturacion_VendedoresComponent } from './Vistas/ReporteFacturacion_Vendedores/ReporteFacturacion_Vendedores.component';
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
import { TicketsComponent } from './Vistas/Tickets/Tickets.component';
import { VistasFavoritasComponent } from './Vistas/VistasFavoritas/VistasFavoritas.component';
import { AsignacionTintasComponent } from './Vistas/asignacion-Tintas/asignacion-Tintas.component';
import { AsignacionBOPPComponent } from './Vistas/asignacion-bopp/asignacion-bopp.component';
import { AsignacionMateriaPrimaComponent } from './Vistas/asignacion-materia-prima/asignacion-materia-prima.component';
import { AsignacionBOPP_TEMPORALComponent } from './Vistas/asignacionBOPP_TEMPORAL/asignacionBOPP_TEMPORAL.component';
import { CajacompensacionComponent } from './Vistas/cajacompensacion/cajacompensacion.component';
import { ConsultaFac_Rem_MPComponent } from './Vistas/consultaFac_Rem_MP/consultaFac_Rem_MP.component';
import { CrearBoppComponent } from './Vistas/crear-bopp/crear-bopp.component';
import { CrearCategoriasMPComponent } from './Vistas/crear-categorias-mp/crear-categorias-mp.component';
import { ClientesComponent } from './Vistas/crear-clientes/crear-clientes.component';
import { CrearMateriaprimaComponent } from './Vistas/crear-materiaprima/crear-materiaprima.component';
import { CrearProductoComponent } from './Vistas/crear-producto/crear-producto.component';
import { CrearProveedorComponent } from './Vistas/crear-proveedor/crear-proveedor.component';
import { CrearSedesClientesComponent } from './Vistas/crear-sedes-clientes/crear-sedes-clientes.component';
import { CrearTintasComponent } from './Vistas/crear-tintas/crear-tintas.component';
import { CrearUnidadesMedidasComponent } from './Vistas/crear-unidades-medidas/crear-unidades-medidas.component';
import { DesperdicioComponent } from './Vistas/desperdicio/desperdicio.component';
import { DevolucionesMPComponent } from './Vistas/devolucionesMP/devolucionesMP.component';
import { EpsComponent } from './Vistas/eps/eps.component';
import { EstadosComponent } from './Vistas/estados/estados.component';
import { FpensionComponent } from './Vistas/fpension/fpension.component';
import { InicioComponent } from './Vistas/inicio/inicio.component';
import { LoginComponentComponent } from './Vistas/login-component/login-component.component';
import { MateriasPrimasComponent } from './Vistas/materias-primas/materias-primas.component';
import { MenuLateralComponent } from './Vistas/menuLateral/menuLateral.component';
import { ModalCrearMateriasPrimasComponent } from './Vistas/modal-crear-materias-primas/modal-crear-materias-primas.component';
import { ModalEditarAsignacionesBOPPComponent } from './Vistas/modal-editar-asignaciones-bopp/modal-editar-asignaciones-bopp.component';
import { ModalGenerarInventarioZeusComponent } from './Vistas/modal-generar-inventario-zeus/modal-generar-inventario-zeus.component';
import { MovimientoMPComponent } from './Vistas/movimientoMP/movimientoMP.component';
import { OcompraComponent } from './Vistas/ocompra/ocompra.component';
import { OpedidoproductoComponent } from './Vistas/opedidoproducto/opedidoproducto.component';
import { OrdenesTrabajoComponent } from './Vistas/ordenes-trabajo/ordenes-trabajo.component';
import { PedidomateriaprimaComponent } from './Vistas/pedidomateriaprima/pedidomateriaprima.component';
import { PruebaImagenCatInsumoComponent } from './Vistas/prueba-imagen-cat-insumo/prueba-imagen-cat-insumo.component';
import { RegistroComponentComponent } from './Vistas/registro-component/registro-component.component';
import { ReporteEstadosOTComponent } from './Vistas/reporte-estados-ot/reporte-estados-ot.component';
import { ReporteCostosOTComponent } from './Vistas/reporteCostosOT/reporteCostosOT.component';
import { ReporteMateriaPrimaComponent } from './Vistas/reporteMateriaPrima/reporteMateriaPrima.component';
import { ReporteMpOtComponent } from './Vistas/reporteMpOt/reporteMpOt.component';
import { ErrorInterceptor } from './_helpers/error.interceptor';
import { errorInterceptor_BagPro } from './_helpers/error.interceptor_BagPro';
import { ErrorInterceptor_ContaZeus } from './_helpers/error.interceptor_ContaZeus';
import { ErrorInterceptor_InvZeus } from './_helpers/error.interceptor_InvZeus';
import { JwtInterceptor } from './_helpers/jwt.interceptor';
import { jwtInterceptor_BagPro } from './_helpers/jwt.interceptor_BagPro';
import { JwtInterceptor_ContaZeus } from './_helpers/jwt.interceptor_ContaZeus';
import { JwtInterceptor_InvZeus } from './_helpers/jwt.interceptor_InvZeus';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

export const routes: Routes = [

  /******************************************************************** Inicio y Login **********************************************************************/
  {path: 'inicio', component: InicioComponent},
  {path: 'Login', component: LoginComponentComponent},
  {path: '', component: LoginComponentComponent},
  {path: 'home', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,2,3,4,5,6,7,8,9,10,11,12,13,60,61]}, component: PaginaPrincipalComponent},
  {path: 'Archivos', component: ArchivosComponent},

  /******************************************************************* Materia Prima ************************************************************************/
  {path: 'ocompra-materiaPrima', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,13]}, component: OcompraComponent},
  {path: 'MateriaPrima', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3]}, component: PedidomateriaprimaComponent},
  {path: 'asignacionMP', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3]}, component: AsignacionMateriaPrimaComponent},
  {path: 'mp-recuperada', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3]}, component: MateriaPrimaRecuperadaComponent},
  {path: 'mp-devoluciones', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3]}, component: DevolucionesMPComponent},
  // Tintas
  {path: 'Entrada-Tintas', canActivate : [RoleGuardServiceGuard], component : Entrada_TintasComponent},
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
  {path: 'materias_primas', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1]}, component: MateriasPrimasComponent},
  // Reportes de materia prima
  {path: 'reporte-Materia-Prima', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3,4]}, component: ReporteMateriaPrimaComponent},
  {path: 'reporte-facturas-remisiones-mp', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3]}, component: ConsultaFac_Rem_MPComponent},
  {path: 'reporte-recuperado-mp', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3]}, component : Reporte_RecuperadoMPComponent}, // Reporte recuperado MP.
  {path: 'reporte-orden-compra', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,13]}, component: Reporte_OrdenCompraComponent},

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
  {path: 'estados-ot-vendedores', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,2]}, component : EstadosOT_VendedoresComponent}, // Estados OT Vendedores
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
  {path: 'inventario-productos-terminados', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,6,60,61]}, component: ModalGenerarInventarioZeusComponent},

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
  {path: 'Pedidos-Zeus', canActivate: [RoleGuardServiceGuard], data: {expectedRole: [1,2,6,60,61]}, component: ReportePedidos_ZeusComponent},
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
]

@NgModule({
  declarations: [
    AppComponent,
    RegistroComponentComponent,
    LoginComponentComponent,
    InicioComponent,
    InicioComponent,
    FpensionComponent,
    EpsComponent,
    CajacompensacionComponent,
    OpedidoproductoComponent,
    PedidoExternoComponent,
    OcompraComponent,
    PedidomateriaprimaComponent,
    CrearProductoComponent,
    ClientesComponent,
    CrearSedesClientesComponent,
    EstadosComponent,
    PaginaPrincipalComponent,
    DesperdicioComponent,
    CrearProveedorComponent,
    CrearMateriaprimaComponent,
    ReporteMateriaPrimaComponent,
    ReporteMpOtComponent,
    AsignacionMateriaPrimaComponent,
    ConsultaFac_Rem_MPComponent,
    MovimientoMPComponent,
    MateriaPrimaRecuperadaComponent,
    PruebaImagenCatInsumoComponent,
    MateriasPrimasComponent,
    CrearCategoriasMPComponent,
    CrearUnidadesMedidasComponent,
    ReporteCostosOTComponent,
    DevolucionesMPComponent,
    AsignacionTintasComponent,
    CrearTintasComponent,
    ModalCrearMateriasPrimasComponent,
    AsignacionBOPPComponent,
    EntradaBOPPComponent,
    AsignacionBOPP_TEMPORALComponent,
    ModalEditarAsignacionesBOPPComponent,
    ModalGenerarInventarioZeusComponent,
    FiltrosProductosTerminadosZeusPipe,
    FiltroNombreClientePTPipe,
    ReporteEstadosOTComponent,
    MenuLateralComponent,
    ArchivosComponent,
    CrearCategoriasComponent,
    OrdenesTrabajoComponent,
    Reporte_Procesos_OTComponent,
    Entrada_TintasComponent,
    Ingresar_ProductosComponent,
    RollosAsignadasFacturaComponent,
    Devoluciones_Productos_RollosComponent,
    AsignarProductosFacturasComponent,
    ReporteDespachoComponent,
    FiltroXFacturasPipe,
    FiltroXRollo_RptDespachoPipe,
    FiltroXProducto_RptDespachoPipe,
    FiltroXTipoDocumentoPipe,
    FiltroXEstadoDespachoPipe,
    FiltroXClienteDespachoPipe,
    PreIngresoRollosExtrusionComponent,
    PreIngresoRolloSelladoComponent,
    InventarioProductosPBDDComponent,
    BuscarInventarioXProductoPipe,
    EstadosOT_VendedoresComponent,
    FiltroXClientes_OTVendedoresPipe,
    FiltroXProducto_OTVendedoresPipe,
    DatosOTStatusComponent,
    Reporte_RecuperadoMPComponent,
    Modal_RptRecuperadoMPComponent,
    IngresoRollos_ExtrusionComponent,
    AsignacionRollos_ExtrusionComponent,
    ReporteBodegaExtrusionComponent,
    EliminarRollos_ExtrusionComponent,
    Reporte_RollosDesechosComponent,
    CrearBoppComponent,
    Reporte_OrdenCompraComponent,
    Inventario_ExtrusionComponent,
    PedidoMantenimientoComponent,
    Mantenimiento_CamionesComponent,
    Movimientos_MantenimientoComponent,
    Reporte_MantenimientoComponent,
    Reporte_DesperdiciosComponent,
    ReportePedidos_ZeusComponent,
    Reporte_PedidosVendedoresComponent,
    Reporte_FacturacionZeusComponent,
    Orden_MaquilaComponent,
    CrearTerceroComponent,
    Facturacion_OrdenMaquilaComponent,
    Reporte_MaquilasComponent,
    Dashboard_MatPrimaComponent,
    DashBoard_FacturacionComponent,
    DashBoard_PedidosComponent,
    TicketsComponent,
    Gestion_TicketsComponent,
    DashboardOTComponent,
    ReporteFacturacion_VendedoresComponent,
    Reporte_Consolidado_FacturacionComponent,
    VistasFavoritasComponent,
  ],

  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AppRoutingModule,
    RouterModule.forRoot(routes),
    HttpClientModule,
    FormsModule,
    NgxPaginationModule,
    StorageServiceModule,
    BrowserAnimationsModule,
    MatNativeDateModule,
    MaterialExampleModule,
    AutocompleteLibModule,
    TableModule,
    CalendarModule,
		SliderModule,
		DialogModule,
		MultiSelectModule,
		ContextMenuModule,
		DropdownModule,
		ButtonModule,
		ToastModule,
    InputTextModule,
    ProgressBarModule,
    AutoCompleteModule,
    DockModule,
    BrowserModule,
    BrowserAnimationsModule,
    TableModule,
    CalendarModule,
		SliderModule,
		DialogModule,
		MultiSelectModule,
		ContextMenuModule,
		DropdownModule,
		ButtonModule,
		ToastModule,
    InputTextModule,
    ProgressBarModule,
    HttpClientModule,
    FileUploadModule,
    ToolbarModule,
    RatingModule,
    FormsModule,
    RadioButtonModule,
    InputNumberModule,
    ConfirmDialogModule,
    InputTextareaModule,
    AccordionModule,
    SlideMenuModule,
    CascadeSelectModule,
    MenuModule,
    PickListModule,
    CarouselModule,
    CardModule,
    ConfirmPopupModule,
    TabViewModule,
    ScrollPanelModule,
    NgChartsModule,
    ChartModule,
    SkeletonModule,
    InputSwitchModule,
    TreeTableModule,
    CheckboxModule,
    SidebarModule,
    TabMenuModule,
    PasswordModule,
    ProgressSpinnerModule,
    FieldsetModule,
    DividerModule,
    ChipModule,
    TagModule,
    VirtualScrollerModule,
    KnobModule,
    DataViewModule,
    RippleModule,
    EditorModule,
    ImageModule,
    GalleriaModule,
    OverlayPanelModule,
    SpeedDialModule,
  ],

  providers: [
    CookieService,
    MessageService,
    ConfirmationService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },

    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor_InvZeus, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor_InvZeus, multi: true },

    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor_ContaZeus, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor_ContaZeus, multi: true },

    { provide: HTTP_INTERCEPTORS, useClass: jwtInterceptor_BagPro, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: errorInterceptor_BagPro, multi: true },
  ],

  bootstrap: [AppComponent]
})
export class AppModule { }
