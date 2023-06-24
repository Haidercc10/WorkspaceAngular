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
import { TreeSelectModule } from 'primeng/treeselect';
import { TreeTableModule } from 'primeng/treetable';
import { VirtualScrollerModule } from 'primeng/virtualscroller';
import { MaterialExampleModule } from '../material.module';
import { ArchivosComponent } from './Vistas/Archivos/Archivos.component';
import { AsignacionRollos_ExtrusionComponent } from './Vistas/AsignacionRollos_Extrusion/AsignacionRollos_Extrusion.component';
import { AsignarProductosFacturasComponent } from './Vistas/AsignarProductosFacturas/AsignarProductosFacturas.component';
import { CalendarioComponent } from './Vistas/Calendario/Calendario.component';
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
import { Reporte_SolicitudesMPComponent } from './Vistas/Reporte_SolicitudesMP/Reporte_SolicitudesMP.component';
import { RollosAsignadasFacturaComponent } from './Vistas/RollosAsignadasFactura/RollosAsignadasFactura.component';
import { SolicitudMateriaPrimaComponent } from './Vistas/Solicitud-Materia-Prima/Solicitud-Materia-Prima.component';
import { TicketsComponent } from './Vistas/Tickets/Tickets.component';
import { VistasFavoritasComponent } from './Vistas/VistasFavoritas/VistasFavoritas.component';
import { AsignacionTintasComponent } from './Vistas/asignacion-Tintas/asignacion-Tintas.component';
import { AsignacionBOPPComponent } from './Vistas/asignacion-bopp/asignacion-bopp.component';
import { AsignacionMateriaPrimaComponent } from './Vistas/asignacion-materia-prima/asignacion-materia-prima.component';
import { AsignacionBOPP_TEMPORALComponent } from './Vistas/asignacionBOPP_TEMPORAL/asignacionBOPP_TEMPORAL.component';
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
import { LoginComponentComponent } from './Vistas/login-component/login-component.component';
import { MenuLateralComponent } from './Vistas/menuLateral/menuLateral.component';
import { ModalCrearMateriasPrimasComponent } from './Vistas/modal-crear-materias-primas/modal-crear-materias-primas.component';
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
import { NominaComponent } from './Vistas/Nomina/Nomina.component';
import { DashBoardRecaudosComponent } from './Vistas/DashBoard-Recaudos/DashBoard-Recaudos.component';
import { SolicitudMP_ExtrusionComponent } from './Vistas/SolicitudMP_Extrusion/SolicitudMP_Extrusion.component';

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
    ConsultaFac_Rem_MPComponent,
    MovimientoMPComponent,
    MateriaPrimaRecuperadaComponent,
    PruebaImagenCatInsumoComponent,
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
    ModalGenerarInventarioZeusComponent,
    MenuLateralComponent,
    ArchivosComponent,
    CrearCategoriasComponent,
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
    Reporte_SolicitudesMPComponent,
    SolicitudMateriaPrimaComponent,
    CalendarioComponent,
    NominaComponent,
    DashBoardRecaudosComponent,
    SolicitudMP_ExtrusionComponent,
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
    EditorModule,
    ImageModule,
    GalleriaModule,
    OverlayPanelModule,
    SpeedDialModule,
    FullCalendarModule,
    TreeSelectModule,
    AvatarModule,
    BadgeModule,
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
