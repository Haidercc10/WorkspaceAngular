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
import { Modal_RptRecuperadoMPComponent } from './Vistas/Modal_RptRecuperadoMP/Modal_RptRecuperadoMP.component';
import { IngresoRollos_ExtrusionComponent } from './Vistas/IngresoRollos_Extrusion/IngresoRollos_Extrusion.component';
import { AsignacionRollos_ExtrusionComponent } from './Vistas/AsignacionRollos_Extrusion/AsignacionRollos_Extrusion.component';
import { ReporteBodegaExtrusionComponent } from './Vistas/ReporteBodegaExtrusion/ReporteBodegaExtrusion.component';
import { Reporte_RollosDesechosComponent } from './Vistas/Reporte_RollosDesechos/Reporte_RollosDesechos.component';
import { EliminarRollos_ExtrusionComponent } from './Vistas/EliminarRollos_Extrusion/EliminarRollos_Extrusion.component';
import { CrearBoppComponent } from './Vistas/crear-bopp/crear-bopp.component';
import {AccordionModule} from 'primeng/accordion';



export const routes: Routes = [

  /******************************************************************** Inicio y Login **********************************************************************/
  {path: 'inicio', component: InicioComponent},
  {path: 'Login', component: LoginComponentComponent},
  {path: '', component: LoginComponentComponent},
  {path: 'menu-lateral', canActivate: [ValidacionLoginGuard], component: MenuLateralComponent},
  {path: 'Archivos', component: ArchivosComponent},

  /******************************************************************* Materia Prima ************************************************************************/
  {path: 'ocompra-materiaPrima', canActivate: [ValidacionLoginGuard], component: OcompraComponent},
  {path: 'MateriaPrima', canActivate: [ValidacionLoginGuard], component: PedidomateriaprimaComponent},
  {path: 'asignacionMP', canActivate: [ValidacionLoginGuard], component: AsignacionMateriaPrimaComponent},
  {path: 'mp-recuperada', canActivate: [ValidacionLoginGuard], component: MateriaPrimaRecuperadaComponent},
  {path: 'mp-devoluciones', canActivate: [ValidacionLoginGuard], component: DevolucionesMPComponent},
  // Tintas
  {path: 'Entrada-Tintas', canActivate : [ValidacionLoginGuard], component : Entrada_TintasComponent},
  {path: 'asignacion-tintas', canActivate: [ValidacionLoginGuard], component: AsignacionTintasComponent},
  // BOPP
  {path: 'asignacion-bopp', canActivate: [ValidacionLoginGuard], component: AsignacionBOPPComponent},
  {path: 'entrada-BOPP', canActivate: [ValidacionLoginGuard], component: EntradaBOPPComponent},
  {path: 'AsignacionBOPPTemporal', canActivate: [ValidacionLoginGuard], component: AsignacionBOPP_TEMPORALComponent},
  // Creacion
  {path: 'crear-proveedor', canActivate: [ValidacionLoginGuard], component: CrearProveedorComponent},
  {path: 'crear-materiaprima', canActivate: [ValidacionLoginGuard], component: CrearMateriaprimaComponent},
  {path: 'crear-bopp', canActivate: [ValidacionLoginGuard], component: CrearBoppComponent},
  {path: 'crear-tintas', canActivate: [ValidacionLoginGuard], component: CrearTintasComponent},
  // Movimientos
  {path: 'movimiento-mp', canActivate: [ValidacionLoginGuard], component: MovimientoMPComponent},
  {path: 'movimientos-matprima', canActivate : [ValidacionLoginGuard], component : MovimientoMatPrimaComponent}, // MOVIMIENTOS DE MATERIA PRIMA
  {path: 'movimientos-bopp', canActivate : [ValidacionLoginGuard], component : MovimientosBOPPComponent}, // MOVIMIENTOS DE BOPP
  {path: 'movimientos-tintas', canActivate : [ValidacionLoginGuard], component : MovimientosTintasComponent}, // MOVIMIENTOS DE TINTAS
  {path: 'materias_primas', canActivate: [ValidacionLoginGuard], component: MateriasPrimasComponent},
  // Reportes de materia prima
  {path: 'reporte-Materia-Prima', canActivate: [ValidacionLoginGuard], component: ReporteMateriaPrimaComponent},
  {path: 'reporte-Materia-Prima-OT', canActivate: [ValidacionLoginGuard], component: ReporteMpOtComponent},
  {path: 'reporte-facturas-remisiones-mp', canActivate: [ValidacionLoginGuard], component: ConsultaFac_Rem_MPComponent},
  {path: 'reporte-recuperado-mp', canActivate : [ValidacionLoginGuard], component : Reporte_RecuperadoMPComponent}, // Reporte recuperado MP.

  /************************************************************************ DESPACHO ************************************************************************/
  // Pre ingresos
  {path: 'preingreso-extrusion', canActivate : [ValidacionLoginGuard], component : PreIngresoRollosExtrusionComponent}, // Pre Ingreso rollos extrusion
  {path: 'preingreso-sellado', canActivate : [ValidacionLoginGuard], component : PreIngresoRolloSelladoComponent}, // Pre Ingreso rollos sellado
  // Ingresos
  {path: 'ingresar-productos', canActivate : [ValidacionLoginGuard], component : Ingresar_ProductosComponent},
  // Facturacion de rollos
  {path: 'asignacion-productos-facturas', canActivate : [ValidacionLoginGuard], component : AsignarProductosFacturasComponent},
  // Despacho de maercancia
  {path: 'factura-rollos-productos', canActivate : [ValidacionLoginGuard], component : RollosAsignadasFacturaComponent},
  // Devolucion de Rollos
  {path: 'devolucion-rollos-productos', canActivate : [ValidacionLoginGuard], component : Devoluciones_Productos_RollosComponent},
  // Reporte
  {path: 'reporte-despacho', canActivate : [ValidacionLoginGuard], component : ReporteDespachoComponent}, // Ingresar Productos

  /********************************************************************* ORDEN DE TRABAJO ********************************************************************/
  {path: 'ordenes-trabajo', canActivate: [ValidacionLoginGuard], component: OrdenesTrabajoComponent},
  {path: 'reportes-procesos-ot', canActivate: [ValidacionLoginGuard], component: Reporte_Procesos_OTComponent},
  {path: 'estados-ot-vendedores', canActivate : [ValidacionLoginGuard], component : EstadosOT_VendedoresComponent}, // Estados OT Vendedores

  /************************************** Ingreso de Rollos a Extrusion y Asignacion de Rollos a otros Procesos **********************************************/
  {path: 'IngresoRollos-Extrusion', canActivate : [ValidacionLoginGuard], component : IngresoRollos_ExtrusionComponent}, // Ingreso de Rollos a Extrusion.
  {path: 'AsignacionRollos-Extrusion', canActivate : [ValidacionLoginGuard], component : AsignacionRollos_ExtrusionComponent}, // Asignación de rollos desde la bodega de extrusión.
  {path: 'ReporteRollos-Extrusion', canActivate : [ValidacionLoginGuard], component : ReporteBodegaExtrusionComponent}, // Reporte de la bodega de extrusión.
  {path: 'Eliminar-rollos', canActivate : [ValidacionLoginGuard], component : EliminarRollos_ExtrusionComponent}, //Eliminar Rollos de Extrusion
  {path: 'reporte-rollos-eliminados', canActivate : [ValidacionLoginGuard], component :Reporte_RollosDesechosComponent}, /** Reporte de rollos eliminados en extrusión */
  {path: 'reporte-costos-ot', canActivate: [ValidacionLoginGuard], component: ReporteCostosOTComponent},

  /****************************************************************** INVENTARIO DE PRODUCTOS ****************************************************************/
  {path: 'inventario-productos', canActivate : [ValidacionLoginGuard], component : InventarioProductosPBDDComponent},
  {path: 'inventario-productos-terminados', canActivate: [ValidacionLoginGuard], component: ModalGenerarInventarioZeusComponent},

  {path: 'registro', component: RegistroComponentComponent},
  {path: 'areas', canActivate: [ValidacionLoginGuard], component: AreasComponentComponent},
  {path: 'reportes', canActivate: [ValidacionLoginGuard], component: ReportesComponent},
  {path: 'roles', canActivate: [ValidacionLoginGuard], component: RolesComponentComponent},
  {path: 'eps', canActivate: [ValidacionLoginGuard], component: EpsComponent},
  {path: 'fpension', canActivate: [ValidacionLoginGuard], component: FpensionComponent},
  {path: 'cajacompensacion', canActivate: [ValidacionLoginGuard], component: CajacompensacionComponent},
  {path: 'opedido', canActivate: [ValidacionLoginGuard], component: OpedidoComponent},
  {path: 'opedidoproducto', canActivate: [ValidacionLoginGuard], component: OpedidoproductoComponent},
  {path: 'pedido-externo', canActivate: [ValidacionLoginGuard], component: PedidoExternoComponent},
  {path: 'usuario', canActivate: [ValidacionLoginGuard], component:UsuarioComponent},
  {path: 'crearproducto', canActivate: [ValidacionLoginGuard], component:CrearProductoComponent},
  {path: 'crear-clientes', canActivate: [ValidacionLoginGuard], component:ClientesComponent},
  {path: 'producto', canActivate: [ValidacionLoginGuard], component:ProductoComponent},
  {path: 'estados', canActivate: [ValidacionLoginGuard], component: EstadosComponent},
  {path: 'home', component: PaginaPrincipalComponent},
  {path: 'desperdicio', canActivate: [ValidacionLoginGuard], component: DesperdicioComponent},
  {path: 'prueba', component: PruebasComponent},
  {path: 'desperdicio', component: DesperdicioComponent},
  {path: 'prueba-cat-insumo',  component: PruebaImagenCatInsumoComponent},
  {path: 'reporte-estados-ot', canActivate: [ValidacionLoginGuard], component: ReporteEstadosOTComponent},
  {path: 'Categorias', component: CrearCategoriasComponent},

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
    AccordionModule
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
