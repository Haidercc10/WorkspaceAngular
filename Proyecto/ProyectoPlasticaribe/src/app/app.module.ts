import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FullCalendarModule } from '@fullcalendar/angular';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { NgChartsModule } from 'ng2-charts';
import { CookieService } from 'ngx-cookie-service';
import { NgxPaginationModule } from 'ngx-pagination';
import { StorageServiceModule } from 'ngx-webstorage-service';
import { AccordionModule } from 'primeng/accordion';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { CarouselModule } from 'primeng/carousel';
import { CascadeSelectModule } from "primeng/cascadeselect";
import { ChartModule } from 'primeng/chart';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DataViewModule } from 'primeng/dataview';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DockModule } from 'primeng/dock';
import { DropdownModule } from 'primeng/dropdown';
import { FieldsetModule } from 'primeng/fieldset';
import { FileUploadModule } from 'primeng/fileupload';
import { GalleriaModule } from 'primeng/galleria';
import { ImageModule } from 'primeng/image';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { KnobModule } from 'primeng/knob';
import { ListboxModule } from 'primeng/listbox';
import { MenuModule } from 'primeng/menu';
import { MultiSelectModule } from 'primeng/multiselect';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PanelMenuModule } from 'primeng/panelmenu';
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
import { TieredMenuModule } from 'primeng/tieredmenu';
import { ToastModule } from 'primeng/toast';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { TreeSelectModule } from 'primeng/treeselect';
import { TreeTableModule } from 'primeng/treetable';
import { TriStateCheckboxModule } from 'primeng/tristatecheckbox';
import { VirtualScrollerModule } from 'primeng/virtualscroller';
import { MaterialExampleModule } from '../material.module';
import { MessagesModule } from 'primeng/messages';
import { ArchivosComponent } from './Vistas/Archivos/Archivos.component';
import { AsignacionRollos_ExtrusionComponent } from './Vistas/AsignacionRollos_Extrusion/AsignacionRollos_Extrusion.component';
import { AsignarProductosFacturasComponent } from './Vistas/AsignarProductosFacturas/AsignarProductosFacturas.component';
import { Busqueda_OrdenesTrabajoComponent } from './Vistas/Busqueda_OrdenesTrabajo/Busqueda_OrdenesTrabajo.component';
import { CalendarioComponent } from './Vistas/Calendario/Calendario.component';
import { CertificadoCalidadComponent } from './Vistas/Certificado-Calidad/Certificado-Calidad.component';
import { ControlCalidadComponent } from './Vistas/ControlCalidad/ControlCalidad.component';
import { ControlCalidad_ExtrusionComponent } from './Vistas/ControlCalidad_Extrusion/ControlCalidad_Extrusion.component';
import { ControlCalidad_SelladoComponent } from './Vistas/ControlCalidad_Sellado/ControlCalidad_Sellado.component';
import { Correos_PaginaWebComponent } from './Vistas/Correos_PaginaWeb/Correos_PaginaWeb.component';
import { Costos_CajaMenorComponent } from './Vistas/Costos_CajaMenor/Costos_CajaMenor.component';
import { CrearTerceroComponent } from './Vistas/Crear-Tercero/Crear-Tercero.component';
import { CrearTipoSalida_CajaMenorComponent } from './Vistas/CrearTipoSalida_CajaMenor/CrearTipoSalida_CajaMenor.component';
import { Crear_ConceptosComponent } from './Vistas/Crear_Conceptos/Crear_Conceptos.component';
import { DashBoardRecaudosComponent } from './Vistas/DashBoard-Recaudos/DashBoard-Recaudos.component';
import { DashBoard_FacturacionComponent } from './Vistas/DashBoard_Facturacion/DashBoard_Facturacion.component';
import { DashBoard_PedidosComponent } from './Vistas/DashBoard_Pedidos/DashBoard_Pedidos.component';
import { DashboardOTComponent } from './Vistas/Dashboard-OT/Dashboard-OT.component';
import { Dashboard_AreasComponent } from './Vistas/Dashboard_Areas/Dashboard_Areas.component';
import { Dashboard_ComprasComponent } from './Vistas/Dashboard_Compras/Dashboard_Compras.component';
import { Dashboard_CostosComponent } from './Vistas/Dashboard_Costos/Dashboard_Costos.component';
import { Dashboard_CuentasPagarComponent } from './Vistas/Dashboard_CuentasPagar/Dashboard_CuentasPagar.component';
import { Dashboard_GeneralComponent } from './Vistas/Dashboard_General/Dashboard_General.component';
import { Dashboard_MatPrimaComponent } from './Vistas/Dashboard_MatPrima/Dashboard_MatPrima.component';
import { Devolucion_OrdenFacturacionComponent } from './Vistas/Devolucion_OrdenFacturacion/Devolucion_OrdenFacturacion.component';
import { Devoluciones_Productos_RollosComponent } from './Vistas/Devoluciones_Productos_Rollos/Devoluciones_Productos_Rollos.component';
import { EliminarRollos_ExtrusionComponent } from './Vistas/EliminarRollos_Extrusion/EliminarRollos_Extrusion.component';
import { EliminarRollos_ProduccionComponent } from './Vistas/EliminarRollos_Produccion/EliminarRollos_Produccion.component';
import { EntradaBOPPComponent } from './Vistas/Entrada-BOPP/Entrada-BOPP.component';
import { Facturacion_OrdenMaquilaComponent } from './Vistas/Facturacion_OrdenMaquila/Facturacion_OrdenMaquila.component';
import { Facturas_Invergoal_InversuezComponent } from './Vistas/Facturas_Invergoal_Inversuez/Facturas_Invergoal_Inversuez.component';
import { Formato_Facturas_VentasComponent } from './Vistas/Formato_Facturas_Ventas/Formato_Facturas_Ventas.component';
import { Gestion_TicketsComponent } from './Vistas/Gestion_Tickets/Gestion_Tickets.component';
import { Gestion_VistasComponent } from './Vistas/Gestion_Vistas/Gestion_Vistas.component';
import { Gestionar_Facturas_Invergoal_InversuezComponent } from './Vistas/Gestionar_Facturas_Invergoal_Inversuez/Gestionar_Facturas_Invergoal_Inversuez.component';
import { Informe_ConsumosComponent } from './Vistas/Informe_Consumos/Informe_Consumos.component';
import { Ingresar_ProductosComponent } from './Vistas/Ingresar_Productos/Ingresar_Productos.component';
import { IngresoProduccion_DespachoComponent } from './Vistas/IngresoProduccion_Despacho/IngresoProduccion_Despacho.component';
import { IngresoRollos_ExtrusionComponent } from './Vistas/IngresoRollos_Extrusion/IngresoRollos_Extrusion.component';
import { Ingreso_NominaComponent } from './Vistas/Ingreso_Nomina/Ingreso_Nomina.component';
import { Ingreso_Rollos_ExtrusionComponent } from './Vistas/Ingreso_Rollos_Extrusion/Ingreso_Rollos_Extrusion.component';
import { InventarioProductosPBDDComponent } from './Vistas/Inventario-Productos-PBDD/Inventario-Productos-PBDD.component';
import { Inventario_AreasComponent } from './Vistas/Inventario_Areas/Inventario_Areas.component';
import { Inventario_Bodegas_RollosComponent } from './Vistas/Inventario_Bodegas_Rollos/Inventario_Bodegas_Rollos.component';
import { Inventario_ExtrusionComponent } from './Vistas/Inventario_Extrusion/Inventario_Extrusion.component';
import { Kardex_MateriasPrimasComponent } from './Vistas/Kardex_MateriasPrimas/Kardex_MateriasPrimas.component';
import { Mantenimiento_CamionesComponent } from './Vistas/Mantenimiento_Camiones/Mantenimiento_Camiones.component';
import { MateriaPrimaRecuperadaComponent } from './Vistas/MateriaPrimaRecuperada/MateriaPrimaRecuperada.component';
import { Modal_RptRecuperadoMPComponent } from './Vistas/Modal_RptRecuperadoMP/Modal_RptRecuperadoMP.component';
import { MovimientosIngresosDespachoComponent } from './Vistas/Movimientos-IngresosDespacho/Movimientos-IngresosDespacho.component';
import { MovimientosOrdenFacturacionComponent } from './Vistas/Movimientos-OrdenFacturacion/Movimientos-OrdenFacturacion.component';
import { Movimientos_DespachoComponent } from './Vistas/Movimientos_Despacho/Movimientos_Despacho.component';
import { Movimientos_MantenimientoComponent } from './Vistas/Movimientos_Mantenimiento/Movimientos_Mantenimiento.component';
import { Movimientos_PreIngresoProduccionComponent } from './Vistas/Movimientos_PreIngresoProduccion/Movimientos_PreIngresoProduccion.component';
import { Movimientos_SolicitudRollosComponent } from './Vistas/Movimientos_SolicitudRollos/Movimientos_SolicitudRollos.component';
import { NominaComponent } from './Vistas/Nomina/Nomina.component';
import { Orden_FacturacionComponent } from './Vistas/Orden_Facturacion/Orden_Facturacion.component';
import { Orden_MaquilaComponent } from './Vistas/Orden_Maquila/Orden_Maquila.component';
import { Orden_TrabajoComponent } from './Vistas/Orden_Trabajo/Orden_Trabajo.component';
import { PaginaPrincipalComponent } from './Vistas/PaginaPrincipal/PaginaPrincipal.component';
import { PedidoExternoComponent } from './Vistas/Pedido-Externo/Pedido-Externo.component';
import { PedidoMantenimientoComponent } from './Vistas/Pedido-Mantenimiento/Pedido-Mantenimiento.component';
import { PreIngresoProduccion_DespachoComponent } from './Vistas/PreIngresoProduccion_Despacho/PreIngresoProduccion_Despacho.component';
import { PreIngresoRolloSelladoComponent } from './Vistas/PreIngresoRolloSellado/PreIngresoRolloSellado.component';
import { PreIngresoRollosExtrusionComponent } from './Vistas/PreIngresoRollosExtrusion/PreIngresoRollosExtrusion.component';
import { Produccion_ExtrusionComponent } from './Vistas/Produccion_Extrusion/Produccion_Extrusion.component';
import { Produccion_SelladoComponent } from './Vistas/Produccion_Sellado/Produccion_Sellado.component';
import { Recetas_ProductosComponent } from './Vistas/Recetas_Productos/Recetas_Productos.component';
import { Recibos_CajaComponent } from './Vistas/Recibos_Caja/Recibos_Caja.component';
import { ReporteDespachoComponent } from './Vistas/Reporte-Despacho/Reporte-Despacho.component';
import { ReporteFacturacionDetalladaComponent } from './Vistas/Reporte-Facturacion-Detallada/Reporte-Facturacion-Detallada.component';
import { ReporteProduccionComponent } from './Vistas/Reporte-Produccion/Reporte-Produccion.component';
import { ReporteBodegaExtrusionComponent } from './Vistas/ReporteBodegaExtrusion/ReporteBodegaExtrusion.component';
import { ReporteFacturacion_VendedoresComponent } from './Vistas/ReporteFacturacion_Vendedores/ReporteFacturacion_Vendedores.component';
import { ReportePedidos_ZeusComponent } from './Vistas/ReportePedidos_Zeus/ReportePedidos_Zeus.component';
import { Reporte_CertificadosCalidadComponent } from './Vistas/Reporte_CertificadosCalidad/Reporte_CertificadosCalidad.component';
import { Reporte_DesperdiciosComponent } from './Vistas/Reporte_Desperdicios/Reporte_Desperdicios.component';
import { Reporte_EstadisticasVentasComponent } from './Vistas/Reporte_EstadisticasVentas/Reporte_EstadisticasVentas.component';
import { Reporte_FacturacionZeusComponent } from './Vistas/Reporte_FacturacionZeus/Reporte_FacturacionZeus.component';
import { Reporte_InventarioAreasComponent } from './Vistas/Reporte_InventarioAreas/Reporte_InventarioAreas.component';
import { Reporte_MantenimientoComponent } from './Vistas/Reporte_Mantenimiento/Reporte_Mantenimiento.component';
import { Reporte_MaquilasComponent } from './Vistas/Reporte_Maquilas/Reporte_Maquilas.component';
import { Reporte_OrdenCompraComponent } from './Vistas/Reporte_OrdenCompra/reporte_OrdenCompra.component';
import { Reporte_Procesos_OTComponent } from './Vistas/Reporte_Procesos_OT/Reporte_Procesos_OT.component';
import { Reporte_RecuperadoMPComponent } from './Vistas/Reporte_RecuperadoMP/Reporte_RecuperadoMP.component';
import { Reporte_RollosDesechosComponent } from './Vistas/Reporte_RollosDesechos/Reporte_RollosDesechos.component';
import { Reporte_SolicitudMpExtrusionComponent } from './Vistas/Reporte_SolicitudMpExtrusion/Reporte_SolicitudMpExtrusion.component';
import { Reporte_SolicitudesMPComponent } from './Vistas/Reporte_SolicitudesMP/Reporte_SolicitudesMP.component';
import { ReportesConsolidadosComponent } from './Vistas/Reportes-Consolidados/Reportes-Consolidados.component';
import { RollosAsignadasFacturaComponent } from './Vistas/RollosAsignadasFactura/RollosAsignadasFactura.component';
import { SalidaProduccion_DespachoComponent } from './Vistas/SalidaProduccion_Despacho/SalidaProduccion_Despacho.component';
import { SolicitudMateriaPrimaComponent } from './Vistas/Solicitud-Materia-Prima/Solicitud-Materia-Prima.component';
import { SolicitudMP_ExtrusionComponent } from './Vistas/SolicitudMP_Extrusion/SolicitudMP_Extrusion.component';
import { Solicitud_Rollos_BodegasComponent } from './Vistas/Solicitud_Rollos_Bodegas/Solicitud_Rollos_Bodegas.component';
import { TicketsComponent } from './Vistas/Tickets/Tickets.component';
import { VistasFavoritasComponent } from './Vistas/VistasFavoritas/VistasFavoritas.component';
import { AsignacionTintasComponent } from './Vistas/asignacion-Tintas/asignacion-Tintas.component';
import { AsignacionBOPPComponent } from './Vistas/asignacion-bopp/asignacion-bopp.component';
import { AsignacionMateriaPrimaComponent } from './Vistas/asignacion-materia-prima/asignacion-materia-prima.component';
import { AsignacionBOPP_TEMPORALComponent } from './Vistas/asignacionBOPP_TEMPORAL/asignacionBOPP_TEMPORAL.component';
import { CrearBoppComponent } from './Vistas/crear-bopp/crear-bopp.component';
import { CrearCategoriasMPComponent } from './Vistas/crear-categorias-mp/crear-categorias-mp.component';
import { ClientesComponent } from './Vistas/crear-clientes/crear-clientes.component';
import { CrearMateriaprimaComponent } from './Vistas/crear-materiaprima/crear-materiaprima.component';
import { CrearProductoComponent } from './Vistas/crear-producto/crear-producto.component';
import { CrearProveedorComponent } from './Vistas/crear-proveedor/crear-proveedor.component';
import { CrearSedesClientesComponent } from './Vistas/crear-sedes-clientes/crear-sedes-clientes.component';
import { CrearTintasComponent } from './Vistas/crear-tintas/crear-tintas.component';
import { DesperdicioComponent } from './Vistas/desperdicio/desperdicio.component';
import { DevolucionesMPComponent } from './Vistas/devolucionesMP/devolucionesMP.component';
import { InventarioBodegaDespachoComponent } from './Vistas/inventarioBodegaDespacho/inventarioBodegaDespacho.component';
import { LoginComponentComponent } from './Vistas/login-component/login-component.component';
import { MenuLateralComponent } from './Vistas/menuLateral/menuLateral.component';
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
import { TomaFisicaInventarioComponent } from './Vistas/TomaFisicaInventario/TomaFisicaInventario.component';
import { ReporteFacturacionClientesComponent } from './Vistas/ReporteFacturacionClientes/ReporteFacturacionClientes.component';
import { Ubicaciones_RollosComponent } from './Vistas/Ubicaciones_Rollos/Ubicaciones_Rollos.component';
import { Reporte_NominaComponent } from './Vistas/Reporte_Nomina/Reporte_Nomina.component';
import { NominaDetallada_PlasticaribeComponent } from './Vistas/NominaDetallada_Plasticaribe/NominaDetallada_Plasticaribe.component';
import { Prestamos_NominaComponent } from './Vistas/Prestamos_Nomina/Prestamos_Nomina.component';
import { IngresoDespacho_EntregaMercanciaComponent } from './Vistas/IngresoDespacho_EntregaMercancia/IngresoDespacho_EntregaMercancia.component';
import { FormEditarPrestamosComponent } from './Vistas/FormEditarPrestamos/FormEditarPrestamos.component';
import { Crear_FallasComponent } from './Vistas/Crear_Fallas/Crear_Fallas.component';
import { SelectButtonModule } from 'primeng/selectbutton';
import { OrdenFacturacion_PalletsComponent } from './Vistas/OrdenFacturacion_Pallets/OrdenFacturacion_Pallets.component';
import { Facturacion_Vs_IngresosDespachoComponent } from './Vistas/Facturacion_Vs_IngresosDespacho/Facturacion_Vs_IngresosDespacho.component';
import { Gestion_DevolucionesOFComponent } from './Vistas/Gestion_DevolucionesOF/Gestion_DevolucionesOF.component';
import { Ingreso_PeletizadoComponent } from './Vistas/Ingreso_Peletizado/Ingreso_Peletizado.component';
import { Mov_IngresoPeletizadoComponent } from './Vistas/Mov_IngresoPeletizado/Mov_IngresoPeletizado.component';
import { Reingreso_ProduccionComponent } from './Vistas/Reingreso_Produccion/Reingreso_Produccion.component';
import { Inventario_PeletizadoComponent } from './Vistas/Inventario_Peletizado/Inventario_Peletizado.component';
import { Mov_BodegaRollosComponent } from './Vistas/Mov_BodegaRollos/Mov_BodegaRollos.component';
import { Salidas_PeletizadoComponent } from './Vistas/Salidas_Peletizado/Salidas_Peletizado.component';
import { Movimientos_RollosComponent } from './Vistas/Movimientos_Rollos/Movimientos_Rollos.component';
import { Precargue_RollosDespachoComponent } from './Vistas/Precargue_RollosDespacho/Precargue_RollosDespacho.component';
import { Devolucion_BodegaRollosComponent } from './Vistas/Devolucion_BodegaRollos/Devolucion_BodegaRollos.component';
import { Asignacion_RollosOTComponent } from './Vistas/Asignacion_RollosOT/Asignacion_RollosOT.component';
import { Mov_PrecargueDespachoComponent } from './Vistas/Mov_PrecargueDespacho/Mov_PrecargueDespacho.component';
import { Reempaque_ProduccionComponent } from './Vistas/Reempaque_Produccion/Reempaque_Produccion.component';
import { Nomina_CorteComponent } from './Vistas/Nomina_Corte/Nomina_Corte.component';

@NgModule({
  declarations: [
    AppComponent,
    RegistroComponentComponent,
    LoginComponentComponent,
    OpedidoproductoComponent,
    PedidoExternoComponent,
    OcompraComponent,
    PedidomateriaprimaComponent,
    CrearProductoComponent,
    ClientesComponent,
    CrearSedesClientesComponent,
    PaginaPrincipalComponent,
    DesperdicioComponent,
    CrearProveedorComponent,
    CrearMateriaprimaComponent,
    ReporteMateriaPrimaComponent,
    ReporteMpOtComponent,
    AsignacionMateriaPrimaComponent,
    MovimientoMPComponent,
    MateriaPrimaRecuperadaComponent,
    PruebaImagenCatInsumoComponent,
    CrearCategoriasMPComponent,
    ReporteCostosOTComponent,
    DevolucionesMPComponent,
    AsignacionTintasComponent,
    CrearTintasComponent,
    AsignacionBOPPComponent,
    EntradaBOPPComponent,
    AsignacionBOPP_TEMPORALComponent,
    ModalGenerarInventarioZeusComponent,
    MenuLateralComponent,
    ArchivosComponent,
    OrdenesTrabajoComponent,
    Reporte_Procesos_OTComponent,
    Ingresar_ProductosComponent,
    RollosAsignadasFacturaComponent,
    Devoluciones_Productos_RollosComponent,
    AsignarProductosFacturasComponent,
    ReporteDespachoComponent,
    PreIngresoRollosExtrusionComponent,
    PreIngresoRolloSelladoComponent,
    InventarioProductosPBDDComponent,
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
    VistasFavoritasComponent,
    Reporte_SolicitudesMPComponent,
    SolicitudMateriaPrimaComponent,
    CalendarioComponent,
    NominaComponent,
    DashBoardRecaudosComponent,
    SolicitudMP_ExtrusionComponent,
    Ingreso_Rollos_ExtrusionComponent,
    Solicitud_Rollos_BodegasComponent,
    Movimientos_SolicitudRollosComponent,
    Dashboard_CuentasPagarComponent,
    Reporte_SolicitudMpExtrusionComponent,
    Inventario_Bodegas_RollosComponent,
    Facturas_Invergoal_InversuezComponent,
    Gestionar_Facturas_Invergoal_InversuezComponent,
    Dashboard_GeneralComponent,
    Recibos_CajaComponent,
    Dashboard_CostosComponent,
    Ingreso_NominaComponent,
    Dashboard_ComprasComponent,
    Gestion_VistasComponent,
    Reporte_CertificadosCalidadComponent,
    CertificadoCalidadComponent,
    ControlCalidad_ExtrusionComponent,
    ControlCalidad_SelladoComponent,
    ControlCalidadComponent,
    Informe_ConsumosComponent,
    Costos_CajaMenorComponent,
    CrearTipoSalida_CajaMenorComponent,
    Kardex_MateriasPrimasComponent,
    Recetas_ProductosComponent,
    Inventario_AreasComponent,
    Reporte_InventarioAreasComponent,
    Dashboard_AreasComponent,
    Orden_TrabajoComponent,
    Formato_Facturas_VentasComponent,
    ReporteFacturacionDetalladaComponent,
    ReporteProduccionComponent,
    ReportesConsolidadosComponent,
    Busqueda_OrdenesTrabajoComponent,
    Produccion_SelladoComponent,
    Produccion_ExtrusionComponent,
    Correos_PaginaWebComponent,
    IngresoProduccion_DespachoComponent,
    SalidaProduccion_DespachoComponent,
    Movimientos_DespachoComponent,
    Crear_ConceptosComponent,
    Reporte_EstadisticasVentasComponent,
    Orden_FacturacionComponent,
    MovimientosOrdenFacturacionComponent,
    Devolucion_OrdenFacturacionComponent,
    PreIngresoProduccion_DespachoComponent,
    Movimientos_PreIngresoProduccionComponent,
    MovimientosIngresosDespachoComponent,
    EliminarRollos_ProduccionComponent,
    InventarioBodegaDespachoComponent,
    TomaFisicaInventarioComponent,
    ReporteFacturacionClientesComponent,
    Ubicaciones_RollosComponent,
    Reporte_NominaComponent,
    NominaDetallada_PlasticaribeComponent,
    IngresoDespacho_EntregaMercanciaComponent,
    Prestamos_NominaComponent,
    FormEditarPrestamosComponent, 
    Crear_FallasComponent, 
    OrdenFacturacion_PalletsComponent, 
    Facturacion_Vs_IngresosDespachoComponent, 
    Gestion_DevolucionesOFComponent,
    Ingreso_PeletizadoComponent,
    Mov_IngresoPeletizadoComponent,
    Reingreso_ProduccionComponent,
    Inventario_PeletizadoComponent,
    Mov_BodegaRollosComponent,
    Salidas_PeletizadoComponent,
    Movimientos_RollosComponent,
    Precargue_RollosDespachoComponent, 
    Devolucion_BodegaRollosComponent,
    Asignacion_RollosOTComponent,
    Mov_PrecargueDespachoComponent,
    Reempaque_ProduccionComponent,
    Nomina_CorteComponent,
  ],

  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AppRoutingModule,
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
    ImageModule,
    GalleriaModule,
    OverlayPanelModule,
    SpeedDialModule,
    FullCalendarModule,
    TreeSelectModule,
    AvatarModule,
    BadgeModule,
    PanelMenuModule,
    FieldsetModule,
    AccordionModule,
    ToggleButtonModule,
    TieredMenuModule,
    ListboxModule,
    ColorPickerModule,
    TriStateCheckboxModule,
    SelectButtonModule,
    MessagesModule,
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
