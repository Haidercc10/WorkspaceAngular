import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponentComponent } from './Vistas/login-component/login-component.component';
import { RegistroComponentComponent } from './Vistas/registro-component/registro-component.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AreasComponentComponent } from './Vistas/areas-component/areas-component.component';
import { ServicioAreasService } from './Servicios/servicio-areas.service';
import { ReportesComponent } from './Vistas/reportes/reportes.component';
import { InicioComponent } from './Vistas/inicio/inicio.component';
import { RolesComponentComponent } from './Vistas/roles-component/roles-component.component';
import { FpensionComponent } from './Vistas/fpension/fpension.component';
import { EpsComponent } from './Vistas/eps/eps.component';
import { CajacompensacionComponent } from './Vistas/cajacompensacion/cajacompensacion.component';
import { OpedidoComponent } from './Vistas/opedido/opedido.component';
import { OpedidoproductoComponent } from './Vistas/opedidoproducto/opedidoproducto.component';
import { OcompraComponent } from './Vistas/ocompra/ocompra.component';
import { UsuarioComponent } from './Vistas/usuario/usuario.component';
import { PedidomateriaprimaComponent } from './Vistas/pedidomateriaprima/pedidomateriaprima.component';
import { CrearProductoComponent } from './Vistas/crear-producto/crear-producto.component';
import { ClientesComponent } from './Vistas/crear-clientes/crear-clientes.component';
import { CrearSedesClientesComponent } from './Vistas/crear-sedes-clientes/crear-sedes-clientes.component';
import { ProductoComponent } from './Vistas/producto/producto.component';
import { CookieService } from 'ngx-cookie-service';
import { EstadosComponent } from './Vistas/estados/estados.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ValidacionLoginGuard } from './Guards/validacion-login.guard';
import { StorageServiceModule } from 'ngx-webstorage-service';
import { PaginaPrincipalComponent } from './Vistas/PaginaPrincipal/PaginaPrincipal.component'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialExampleModule } from '../material.module';
import { MatNativeDateModule } from '@angular/material/core';
import { DesperdicioComponent } from './Vistas/desperdicio/desperdicio.component';
import { PruebasComponent } from './Vistas/pruebas/pruebas.component';
import { CrearProveedorComponent } from './Vistas/crear-proveedor/crear-proveedor.component';
import { CrearMateriaprimaComponent } from './Vistas/crear-materiaprima/crear-materiaprima.component';
import { ReporteMateriaPrimaComponent } from './Vistas/reporteMateriaPrima/reporteMateriaPrima.component';
import { ReporteMpOtComponent } from './Vistas/reporteMpOt/reporteMpOt.component';
import { AsignacionMateriaPrimaComponent } from './Vistas/asignacion-materia-prima/asignacion-materia-prima.component';
import { ConsultaFac_Rem_MPComponent } from './Vistas/consultaFac_Rem_MP/consultaFac_Rem_MP.component';
import { MovimientoMPComponent } from './Vistas/movimientoMP/movimientoMP.component';
import { MateriaPrimaRecuperadaComponent } from './Vistas/MateriaPrimaRecuperada/MateriaPrimaRecuperada.component';
import { PruebaImagenCatInsumoComponent } from './Vistas/prueba-imagen-cat-insumo/prueba-imagen-cat-insumo.component';
import { MateriasPrimasComponent } from './Vistas/materias-primas/materias-primas.component';
import { CrearCategoriasMPComponent } from './Vistas/crear-categorias-mp/crear-categorias-mp.component';
import { CrearUnidadesMedidasComponent } from './Vistas/crear-unidades-medidas/crear-unidades-medidas.component';
import { ReporteCostosOTComponent } from './Vistas/reporteCostosOT/reporteCostosOT.component';
import { DevolucionesMPComponent } from './Vistas/devolucionesMP/devolucionesMP.component';
import { AsignacionTintasComponent } from './Vistas/asignacion-Tintas/asignacion-Tintas.component';
import { CrearTintasComponent } from './Vistas/crear-tintas/crear-tintas.component';
import { ModalCrearMateriasPrimasComponent } from './Vistas/modal-crear-materias-primas/modal-crear-materias-primas.component';
import { AsignacionBOPPComponent } from './Vistas/asignacion-bopp/asignacion-bopp.component';
import { EntradaBOPPComponent } from './Vistas/Entrada-BOPP/Entrada-BOPP.component';
import { AsignacionBOPP_TEMPORALComponent } from './Vistas/asignacionBOPP_TEMPORAL/asignacionBOPP_TEMPORAL.component';
import { ModalEditarAsignacionesBOPPComponent } from './Vistas/modal-editar-asignaciones-bopp/modal-editar-asignaciones-bopp.component';
import { ModalGenerarInventarioZeusComponent } from './Vistas/modal-generar-inventario-zeus/modal-generar-inventario-zeus.component';
import { FiltrosProductosTerminadosZeusPipe } from './Pipes/filtros-productos-terminados-zeus.pipe';
import { FiltroNombreClientePTPipe } from './Pipes/filtro-nombre-cliente-pt.pipe';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';
import { ReporteEstadosOTComponent } from './Vistas/reporte-estados-ot/reporte-estados-ot.component';
import { MenuLateralComponent } from './Vistas/menuLateral/menuLateral.component';
import { PedidoExternoComponent } from './Vistas/Pedido-Externo/Pedido-Externo.component';
import { ArchivosComponent } from './Vistas/Archivos/Archivos.component';
import { CrearCategoriasComponent } from './Vistas/CrearCategorias/CrearCategorias.component';
import { OrdenesTrabajoComponent } from './Vistas/ordenes-trabajo/ordenes-trabajo.component';
import { Reporte_Procesos_OTComponent } from './Vistas/Reporte_Procesos_OT/Reporte_Procesos_OT.component';
import { Entrada_TintasComponent } from './Vistas/Entrada_Tintas/Entrada_Tintas.component';
import { MovimientoMatPrimaComponent } from './Vistas/MovimientoMatPrima/MovimientoMatPrima.component';
import { MovimientosBOPPComponent } from './Vistas/MovimientosBOPP/MovimientosBOPP.component';
import { MovimientosTintasComponent } from './Vistas/movimientos-tintas/movimientos-tintas.component';
import { Ingresar_ProductosComponent } from './Vistas/Ingresar_Productos/Ingresar_Productos.component';
import { RollosAsignadasFacturaComponent } from './Vistas/RollosAsignadasFactura/RollosAsignadasFactura.component';
import { Devoluciones_Productos_RollosComponent } from './Vistas/Devoluciones_Productos_Rollos/Devoluciones_Productos_Rollos.component';
import { AsignarProductosFacturasComponent } from './Vistas/AsignarProductosFacturas/AsignarProductosFacturas.component';
import { ReporteDespachoComponent } from './Vistas/Reporte-Despacho/Reporte-Despacho.component';
import { FiltroXFacturasPipe } from './Pipes/filtroXFacturas.pipe';
import { FiltroXRollo_RptDespachoPipe } from './Pipes/filtroXRollo_RptDespacho.pipe';
import { FiltroXProducto_RptDespachoPipe } from './Pipes/filtroXProducto_RptDespacho.pipe';
import { FiltroXTipoDocumentoPipe } from './Pipes/filtroXTipoDocumento.pipe';
import { FiltroXEstadoDespachoPipe } from './Pipes/filtroXEstadoDespacho.pipe';
import { FiltroXClienteDespachoPipe } from './Pipes/filtroXClienteDespacho.pipe';
import { PreIngresoRollosExtrusionComponent } from './Vistas/PreIngresoRollosExtrusion/PreIngresoRollosExtrusion.component';
import { PreIngresoRolloSelladoComponent } from './Vistas/PreIngresoRolloSellado/PreIngresoRolloSellado.component';
import { InventarioProductosPBDDComponent } from './Vistas/Inventario-Productos-PBDD/Inventario-Productos-PBDD.component';
import { BuscarInventarioXProductoPipe } from './Pipes/BuscarInventarioXProducto.pipe';
import { EstadosOT_VendedoresComponent } from './Vistas/EstadosOT_Vendedores/EstadosOT_Vendedores.component';
import { FiltroXClientes_OTVendedoresPipe } from './Pipes/FiltroXClientes_OTVendedores.pipe';
import { FiltroXProducto_OTVendedoresPipe } from './Pipes/FiltroXProducto_OTVendedores.pipe';
import { DatosOTStatusComponent } from './Vistas/DatosOT-Status/DatosOT-Status.component';
import { Reporte_RecuperadoMPComponent } from './Vistas/Reporte_RecuperadoMP/Reporte_RecuperadoMP.component';
import { RoleGuardServiceGuard } from './Guards/role-guard-service.guard';
import { Reporte_OrdenCompraComponent } from './Vistas/Reporte_OrdenCompra/reporte_OrdenCompra.component';
import { Modal_RptRecuperadoMPComponent } from './Vistas/Modal_RptRecuperadoMP/Modal_RptRecuperadoMP.component';
import { IngresoRollos_ExtrusionComponent } from './Vistas/IngresoRollos_Extrusion/IngresoRollos_Extrusion.component';
import { AsignacionRollos_ExtrusionComponent } from './Vistas/AsignacionRollos_Extrusion/AsignacionRollos_Extrusion.component';
import { ReporteBodegaExtrusionComponent } from './Vistas/ReporteBodegaExtrusion/ReporteBodegaExtrusion.component';
import { Reporte_RollosDesechosComponent } from './Vistas/Reporte_RollosDesechos/Reporte_RollosDesechos.component';
import { EliminarRollos_ExtrusionComponent } from './Vistas/EliminarRollos_Extrusion/EliminarRollos_Extrusion.component';
import { CrearBoppComponent } from './Vistas/crear-bopp/crear-bopp.component';
import { Ventas_TemporalesComponent } from './Vistas/Ventas_Temporales/Ventas_Temporales.component';

// Prime NG
import {TableModule} from 'primeng/table';
import {ToastModule} from 'primeng/toast';
import {CalendarModule} from 'primeng/calendar';
import {SliderModule} from 'primeng/slider';
import {MultiSelectModule} from 'primeng/multiselect';
import {ContextMenuModule} from 'primeng/contextmenu';
import {DialogModule} from 'primeng/dialog';
import {ButtonModule} from 'primeng/button';
import {DropdownModule} from 'primeng/dropdown';
import {ProgressBarModule} from 'primeng/progressbar';
import {InputTextModule} from 'primeng/inputtext';
import { AutoCompleteModule } from 'primeng/autocomplete';
import {DockModule} from 'primeng/dock';
import {FileUploadModule} from 'primeng/fileupload';
import {ToolbarModule} from 'primeng/toolbar';
import {RatingModule} from 'primeng/rating';
import {RadioButtonModule} from 'primeng/radiobutton';
import {InputNumberModule} from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { InputTextareaModule } from 'primeng/inputtextarea';
import {AccordionModule} from 'primeng/accordion';
import { SlideMenuModule } from 'primeng/slidemenu';
import { Inventario_ExtrusionComponent } from './Vistas/Inventario_Extrusion/Inventario_Extrusion.component';

//


export const routes: Routes = [

  /******************************************************************** Inicio y Login **********************************************************************/
  // {path: 'inicio', component: InicioComponent},
  {path: 'Login', component: LoginComponentComponent},
  {path: '', component: LoginComponentComponent},
  {path: 'home', component: PaginaPrincipalComponent},
  {path: 'Archivos', component: ArchivosComponent},

  /******************************************************************* Materia Prima ************************************************************************/
  {path: 'ocompra-materiaPrima', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1]}, component: OcompraComponent},
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
  {path: 'crear-proveedor', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1]}, component: CrearProveedorComponent},
  {path: 'crear-materiaprima', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1]}, component: CrearMateriaprimaComponent},
  {path: 'crear-bopp', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1]}, component: CrearBoppComponent},
  {path: 'crear-tintas', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1]}, component: CrearTintasComponent},
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
  {path: 'reporte-orden-compra', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1]}, component: Reporte_OrdenCompraComponent},

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
  {path: 'reporte-despacho', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1,3,6,7,8,9,10]}, component : ReporteDespachoComponent}, // Ingresar Productos

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

 /************************************************************************************************************************************************************/
  {path: 'prueba-cat-insumo',  component: PruebaImagenCatInsumoComponent},
  {path: 'registro-usuario', component: RegistroComponentComponent},
  {path: 'reporte-ventas', component: Ventas_TemporalesComponent},
  // {path: 'areas', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1]}, component: AreasComponentComponent},
  // {path: 'reportes', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1]}, component: ReportesComponent},
  // {path: 'roles', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1]}, component: RolesComponentComponent},
  // {path: 'eps', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1]}, component: EpsComponent},
  // {path: 'fpension', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1]}, component: FpensionComponent},
  // {path: 'cajacompensacion', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1]}, component: CajacompensacionComponent},
  // {path: 'opedido', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1]}, component: OpedidoComponent},
  // {path: 'usuario', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1]}, component:UsuarioComponent},
  // {path: 'producto', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1]}, component:ProductoComponent},
  // {path: 'estados', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1]}, component: EstadosComponent},
  // {path: 'desperdicio', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1]}, component: DesperdicioComponent},
  // {path: 'prueba', component: PruebasComponent},
  // {path: 'desperdicio', component: DesperdicioComponent},
  // {path: 'reporte-estados-ot', canActivate: [RoleGuardServiceGuard], data: {expectedRole : [1]}, component: ReporteEstadosOTComponent},
  // {path: 'Categorias', component: CrearCategoriasComponent},
]

@NgModule({
  declarations: [
    AppComponent,
    RegistroComponentComponent,
    LoginComponentComponent,
    InicioComponent,
    AreasComponentComponent,
    InicioComponent,
    RolesComponentComponent,
    FpensionComponent,
    EpsComponent,
    CajacompensacionComponent,
    OpedidoComponent,
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
  ],

  providers: [
    ServicioAreasService,
    CookieService,
    MessageService,
    ConfirmationService
  ],

  bootstrap: [AppComponent]
})
export class AppModule { }
