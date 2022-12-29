import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';

import { NgChartsModule } from 'ng2-charts';
import { CookieService } from 'ngx-cookie-service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
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
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DialogModule } from 'primeng/dialog';
import { DockModule } from 'primeng/dock';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MenuModule } from 'primeng/menu';
import { MultiSelectModule } from 'primeng/multiselect';
import { PickListModule } from 'primeng/picklist';
import { ProgressBarModule } from 'primeng/progressbar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SkeletonModule } from 'primeng/skeleton';
import { SlideMenuModule } from 'primeng/slidemenu';
import { SliderModule } from 'primeng/slider';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { MaterialExampleModule } from '../material.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RoleGuardServiceGuard } from './Guards/role-guard-service.guard';
import { ValidacionLoginGuard } from './Guards/validacion-login.guard';
import { BuscarInventarioXProductoPipe } from './Pipes/BuscarInventarioXProducto.pipe';
import { FiltroNombreClientePTPipe } from './Pipes/filtro-nombre-cliente-pt.pipe';
import { FiltrosProductosTerminadosZeusPipe } from './Pipes/filtros-productos-terminados-zeus.pipe';
import { FiltroXClienteDespachoPipe } from './Pipes/filtroXClienteDespacho.pipe';
import { FiltroXClientes_OTVendedoresPipe } from './Pipes/FiltroXClientes_OTVendedores.pipe';
import { FiltroXEstadoDespachoPipe } from './Pipes/filtroXEstadoDespacho.pipe';
import { FiltroXFacturasPipe } from './Pipes/filtroXFacturas.pipe';
import { FiltroXProducto_OTVendedoresPipe } from './Pipes/FiltroXProducto_OTVendedores.pipe';
import { FiltroXProducto_RptDespachoPipe } from './Pipes/filtroXProducto_RptDespacho.pipe';
import { FiltroXRollo_RptDespachoPipe } from './Pipes/filtroXRollo_RptDespacho.pipe';
import { FiltroXTipoDocumentoPipe } from './Pipes/filtroXTipoDocumento.pipe';
import { ArchivosComponent } from './Vistas/Archivos/Archivos.component';
import { AsignacionBOPPComponent } from './Vistas/asignacion-bopp/asignacion-bopp.component';
import { AsignacionMateriaPrimaComponent } from './Vistas/asignacion-materia-prima/asignacion-materia-prima.component';
import { AsignacionTintasComponent } from './Vistas/asignacion-Tintas/asignacion-Tintas.component';
import { AsignacionBOPP_TEMPORALComponent } from './Vistas/asignacionBOPP_TEMPORAL/asignacionBOPP_TEMPORAL.component';
import { AsignacionRollos_ExtrusionComponent } from './Vistas/AsignacionRollos_Extrusion/AsignacionRollos_Extrusion.component';
import { AsignarProductosFacturasComponent } from './Vistas/AsignarProductosFacturas/AsignarProductosFacturas.component';
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
import { CrearCategoriasComponent } from './Vistas/CrearCategorias/CrearCategorias.component';
import { DatosOTStatusComponent } from './Vistas/DatosOT-Status/DatosOT-Status.component';
import { DesperdicioComponent } from './Vistas/desperdicio/desperdicio.component';
import { DevolucionesMPComponent } from './Vistas/devolucionesMP/devolucionesMP.component';
import { Devoluciones_Productos_RollosComponent } from './Vistas/Devoluciones_Productos_Rollos/Devoluciones_Productos_Rollos.component';
import { EliminarRollos_ExtrusionComponent } from './Vistas/EliminarRollos_Extrusion/EliminarRollos_Extrusion.component';
import { EntradaBOPPComponent } from './Vistas/Entrada-BOPP/Entrada-BOPP.component';
import { Entrada_TintasComponent } from './Vistas/Entrada_Tintas/Entrada_Tintas.component';
import { EpsComponent } from './Vistas/eps/eps.component';
import { EstadosComponent } from './Vistas/estados/estados.component';
import { EstadosOT_VendedoresComponent } from './Vistas/EstadosOT_Vendedores/EstadosOT_Vendedores.component';
import { FpensionComponent } from './Vistas/fpension/fpension.component';
import { Ingresar_ProductosComponent } from './Vistas/Ingresar_Productos/Ingresar_Productos.component';
import { IngresoRollos_ExtrusionComponent } from './Vistas/IngresoRollos_Extrusion/IngresoRollos_Extrusion.component';
import { InicioComponent } from './Vistas/inicio/inicio.component';
import { InventarioProductosPBDDComponent } from './Vistas/Inventario-Productos-PBDD/Inventario-Productos-PBDD.component';
import { Inventario_ExtrusionComponent } from './Vistas/Inventario_Extrusion/Inventario_Extrusion.component';
import { LoginComponentComponent } from './Vistas/login-component/login-component.component';
import { Mantenimiento_CamionesComponent } from './Vistas/Mantenimiento_Camiones/Mantenimiento_Camiones.component';
import { MateriaPrimaRecuperadaComponent } from './Vistas/MateriaPrimaRecuperada/MateriaPrimaRecuperada.component';
import { MateriasPrimasComponent } from './Vistas/materias-primas/materias-primas.component';
import { MenuLateralComponent } from './Vistas/menuLateral/menuLateral.component';
import { ModalCrearMateriasPrimasComponent } from './Vistas/modal-crear-materias-primas/modal-crear-materias-primas.component';
import { ModalEditarAsignacionesBOPPComponent } from './Vistas/modal-editar-asignaciones-bopp/modal-editar-asignaciones-bopp.component';
import { ModalGenerarInventarioZeusComponent } from './Vistas/modal-generar-inventario-zeus/modal-generar-inventario-zeus.component';
import { Modal_RptRecuperadoMPComponent } from './Vistas/Modal_RptRecuperadoMP/Modal_RptRecuperadoMP.component';
import { MovimientoMatPrimaComponent } from './Vistas/MovimientoMatPrima/MovimientoMatPrima.component';
import { MovimientoMPComponent } from './Vistas/movimientoMP/movimientoMP.component';
import { MovimientosTintasComponent } from './Vistas/movimientos-tintas/movimientos-tintas.component';
import { MovimientosBOPPComponent } from './Vistas/MovimientosBOPP/MovimientosBOPP.component';
import { Movimientos_MantenimientoComponent } from './Vistas/Movimientos_Mantenimiento/Movimientos_Mantenimiento.component';
import { OcompraComponent } from './Vistas/ocompra/ocompra.component';
import { OpedidoproductoComponent } from './Vistas/opedidoproducto/opedidoproducto.component';
import { OrdenesTrabajoComponent } from './Vistas/ordenes-trabajo/ordenes-trabajo.component';
import { PaginaPrincipalComponent } from './Vistas/PaginaPrincipal/PaginaPrincipal.component';
import { PedidoExternoComponent } from './Vistas/Pedido-Externo/Pedido-Externo.component';
import { PedidoMantenimientoComponent } from './Vistas/Pedido-Mantenimiento/Pedido-Mantenimiento.component';
import { PedidomateriaprimaComponent } from './Vistas/pedidomateriaprima/pedidomateriaprima.component';
import { PreIngresoRolloSelladoComponent } from './Vistas/PreIngresoRolloSellado/PreIngresoRolloSellado.component';
import { PreIngresoRollosExtrusionComponent } from './Vistas/PreIngresoRollosExtrusion/PreIngresoRollosExtrusion.component';
import { ProductoComponent } from './Vistas/producto/producto.component';
import { PruebaImagenCatInsumoComponent } from './Vistas/prueba-imagen-cat-insumo/prueba-imagen-cat-insumo.component';
import { PruebasComponent } from './Vistas/pruebas/pruebas.component';
import { RegistroComponentComponent } from './Vistas/registro-component/registro-component.component';
import { ReporteDespachoComponent } from './Vistas/Reporte-Despacho/Reporte-Despacho.component';
import { ReporteEstadosOTComponent } from './Vistas/reporte-estados-ot/reporte-estados-ot.component';
import { ReporteBodegaExtrusionComponent } from './Vistas/ReporteBodegaExtrusion/ReporteBodegaExtrusion.component';
import { ReporteCostosOTComponent } from './Vistas/reporteCostosOT/reporteCostosOT.component';
import { ReporteMateriaPrimaComponent } from './Vistas/reporteMateriaPrima/reporteMateriaPrima.component';
import { ReporteMpOtComponent } from './Vistas/reporteMpOt/reporteMpOt.component';
import { ReportesComponent } from './Vistas/reportes/reportes.component';
import { Reporte_DesperdiciosComponent } from './Vistas/Reporte_Desperdicios/Reporte_Desperdicios.component';
import { Reporte_MantenimientoComponent } from './Vistas/Reporte_Mantenimiento/Reporte_Mantenimiento.component';
import { Reporte_OrdenCompraComponent } from './Vistas/Reporte_OrdenCompra/reporte_OrdenCompra.component';
import { Reporte_Procesos_OTComponent } from './Vistas/Reporte_Procesos_OT/Reporte_Procesos_OT.component';
import { Reporte_RecuperadoMPComponent } from './Vistas/Reporte_RecuperadoMP/Reporte_RecuperadoMP.component';
import { Reporte_RollosDesechosComponent } from './Vistas/Reporte_RollosDesechos/Reporte_RollosDesechos.component';
import { RolesComponentComponent } from './Vistas/roles-component/roles-component.component';
import { RollosAsignadasFacturaComponent } from './Vistas/RollosAsignadasFactura/RollosAsignadasFactura.component';
import { UsuarioComponent } from './Vistas/usuario/usuario.component';
import { Ventas_TemporalesComponent } from './Vistas/Ventas_Temporales/Ventas_Temporales.component';
import {InputSwitchModule} from 'primeng/inputswitch';
import { ReporteInventarioBOPPComponent } from './Vistas/reporteInventarioBOPP/reporteInventarioBOPP.component';
import { ReporteInventarioMateriaPrimaComponent } from './Vistas/ReporteInventarioMateriaPrima/ReporteInventarioMateriaPrima.component';
import { ReportePedidos_ZeusComponent } from './Vistas/ReportePedidos_Zeus/ReportePedidos_Zeus.component';

export const routes: Routes = [

  /******************************************************************** Inicio y Login **********************************************************************/
  // {path: 'inicio', component: InicioComponent},
  {path: 'Login', component: LoginComponentComponent},
  {path: '', component: LoginComponentComponent},
  {path: 'home', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,2,3,4,5,6,7,8,9,10,11,12,13]}, component: PaginaPrincipalComponent},
  {path: 'Archivos', component: ArchivosComponent},

  /******************************************************************* Materia Prima ************************************************************************/
  {path: 'ocompra-materiaPrima', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,13]}, component: OcompraComponent},
  {path: 'MateriaPrima', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3]}, component: PedidomateriaprimaComponent},
  {path: 'asignacionMP', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3]}, component: AsignacionMateriaPrimaComponent},
  {path: 'mp-recuperada', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3]}, component: MateriaPrimaRecuperadaComponent},
  {path: 'mp-devoluciones', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3]}, component: DevolucionesMPComponent},
  // Tintas
  {path: 'Entrada-Tintas', canActivate : [ValidacionLoginGuard], component : Entrada_TintasComponent},
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
  {path: 'movimiento-mp', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3]}, component: MovimientoMPComponent},
  {path: 'movimientos-matprima', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3]}, component : MovimientoMatPrimaComponent}, // MOVIMIENTOS DE MATERIA PRIMA
  {path: 'movimientos-bopp', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3]}, component : MovimientosBOPPComponent}, // MOVIMIENTOS DE BOPP
  {path: 'movimientos-tintas', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3]}, component : MovimientosTintasComponent}, // MOVIMIENTOS DE TINTAS
  {path: 'materias_primas', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1]}, component: MateriasPrimasComponent},
  // Reportes de materia prima
  {path: 'reporte-Materia-Prima', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3]}, component: ReporteMateriaPrimaComponent},
  {path: 'reporte-Materia-Prima-OT', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1]}, component: ReporteMpOtComponent},
  {path: 'reporte-facturas-remisiones-mp', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3]}, component: ConsultaFac_Rem_MPComponent},
  {path: 'reporte-recuperado-mp', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3]}, component : Reporte_RecuperadoMPComponent}, // Reporte recuperado MP.
  {path: 'reporte-orden-compra', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,13]}, component: Reporte_OrdenCompraComponent},
  {path: 'reporte-BOPP', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3]}, component: ReporteInventarioBOPPComponent},
  {path: 'reporte-Inventario-MateriaPrima', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3]}, component: ReporteInventarioMateriaPrimaComponent},

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
  {path: 'inventario-productos-terminados', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1]}, component: ModalGenerarInventarioZeusComponent},

  /****************************************************************** PEDIDO DE PRODUCTOS ****************************************************************/
  {path: 'opedidoproducto', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,2]}, component: OpedidoproductoComponent},
  {path: 'pedido-externo', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,2]}, component: PedidoExternoComponent},
  {path: 'crearproducto', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,2]}, component:CrearProductoComponent},
  {path: 'crear-clientes', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,2]}, component:ClientesComponent},

 /***************************************************************** USUARIOS **********************************************************************************/
  {path: 'prueba-cat-insumo',  component: PruebaImagenCatInsumoComponent},
  {path: 'registro-usuario', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1]}, component: RegistroComponentComponent},

 /*************************************************************************************************************************************************************/
 {path: 'prueba-cat-insumo',  component: PruebaImagenCatInsumoComponent},
//  {path: 'ventas', component: Ventas_TemporalesComponent},

 /******************************************************************* MANTENIMIENTO ***************************************************************************/
 {path: 'pedido-mantenimiento', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1]}, component: PedidoMantenimientoComponent},
 {path: 'movimientos-mantenimientos', canActivate: [RoleGuardServiceGuard], data: {expectedRole: [1]}, component: Movimientos_MantenimientoComponent},
 {path: 'reporte-activos', canActivate: [RoleGuardServiceGuard], data: {expectedRole: [1]}, component: Reporte_MantenimientoComponent},
 {path: 'mantenimiento-activos', canActivate: [RoleGuardServiceGuard], data: {expectedRole: [1]}, component: Mantenimiento_CamionesComponent },

/*********************************************************************** REPORTE PEDIDOS ZEUS *****************************************************************/
 {path: 'Pedidos-Zeus', canActivate: [RoleGuardServiceGuard], data: {expectedRole: [1]}, component: ReportePedidos_ZeusComponent},

 /*************************************************************** DESPERDICIO *********************************************************************************/
  {path: 'desperdicio', canActivate: [RoleGuardServiceGuard], data: {expectedRole: [1]}, component: DesperdicioComponent},
  {path: 'reporte-desperdicios', canActivate: [RoleGuardServiceGuard], data: {expectedRole: [1]}, component: Reporte_DesperdiciosComponent },

]

@NgModule({
  declarations: [
    AppComponent,
    RegistroComponentComponent,
    LoginComponentComponent,
    InicioComponent,
    InicioComponent,
    RolesComponentComponent,
    FpensionComponent,
    EpsComponent,
    CajacompensacionComponent,
    OpedidoproductoComponent,
    PedidoExternoComponent,
    OcompraComponent,
    UsuarioComponent,
    PedidomateriaprimaComponent,
    CrearProductoComponent,
    ClientesComponent,
    CrearSedesClientesComponent,
    ProductoComponent,
    ReportesComponent,
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
    PruebasComponent,
    FiltrosProductosTerminadosZeusPipe,
    FiltroNombreClientePTPipe,
    ReporteEstadosOTComponent,
    MenuLateralComponent,
    ArchivosComponent,
    CrearCategoriasComponent,
    OrdenesTrabajoComponent,
    Reporte_Procesos_OTComponent,
    Entrada_TintasComponent,
    MovimientoMatPrimaComponent,
    MovimientosBOPPComponent,
    MovimientosTintasComponent,
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
    Ventas_TemporalesComponent,
    Inventario_ExtrusionComponent,
    PedidoMantenimientoComponent,
    Mantenimiento_CamionesComponent,
    Movimientos_MantenimientoComponent,
    Reporte_MantenimientoComponent,
    Reporte_DesperdiciosComponent,
    ReporteInventarioBOPPComponent,
    ReporteInventarioMateriaPrimaComponent,
    ReportePedidos_ZeusComponent
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
    NgxMatSelectSearchModule,
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
  ],

  providers: [
    CookieService,
    MessageService,
    ConfirmationService
  ],

  bootstrap: [AppComponent]
})
export class AppModule { }
