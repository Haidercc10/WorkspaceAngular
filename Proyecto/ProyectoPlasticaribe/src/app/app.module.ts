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
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxPaginationModule } from 'ngx-pagination';
import { ValidacionLoginGuard } from './Guards/validacion-login.guard';
import { StorageServiceModule} from 'ngx-webstorage-service';
import { PaginaPrincipalComponent } from './Vistas/PaginaPrincipal/PaginaPrincipal.component'
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MaterialExampleModule} from '../material.module';
import {MatNativeDateModule} from '@angular/material/core';
import { DesperdicioComponent } from './Vistas/desperdicio/desperdicio.component';
import { PruebasComponent } from './Vistas/pruebas/pruebas.component';
import { CrearProveedorComponent } from './Vistas/crear-proveedor/crear-proveedor.component';
import { CrearMateriaprimaComponent } from './Vistas/crear-materiaprima/crear-materiaprima.component';
import { ReporteMateriaPrimaComponent } from './Vistas/reporteMateriaPrima/reporteMateriaPrima.component';
import { ReporteMpOtComponent } from './Vistas/reporteMpOt/reporteMpOt.component';
import { AsignacionMateriaPrimaComponent } from './Vistas/asignacion-materia-prima/asignacion-materia-prima.component';
import { ConsultaFac_Rem_MPComponent } from './Vistas/consultaFac_Rem_MP/consultaFac_Rem_MP.component';
// import { AsignacionMateriaPrimaComponent } from './Vistas/asignacion-materia-prima/asignacion-materia-prima.component';
import { MpremisionComponent } from './Vistas/mpremision/mpremision.component';
import { MovimientoMPComponent } from './Vistas/movimientoMP/movimientoMP.component';
import { MateriaPrimaRecuperadaComponent } from './Vistas/MateriaPrimaRecuperada/MateriaPrimaRecuperada.component';
import { DevolucionesMPComponent } from './Vistas/devolucionesMP/devolucionesMP.component';
import { ReporteCostosOTComponent } from './Vistas/reporteCostosOT/reporteCostosOT.component';



export const routes: Routes = [

  {path: 'inicio', component: InicioComponent},
  {path: 'registro', component: RegistroComponentComponent},
  {path: 'areas', canActivate: [ValidacionLoginGuard], component: AreasComponentComponent},
  {path: 'Login', component: LoginComponentComponent},
  {path: '', component: LoginComponentComponent},
  {path: 'reportes', canActivate: [ValidacionLoginGuard], component: ReportesComponent},
  {path: 'roles', canActivate: [ValidacionLoginGuard], component: RolesComponentComponent},
  {path: 'eps', canActivate: [ValidacionLoginGuard], component: EpsComponent},
  {path: 'fpension', canActivate: [ValidacionLoginGuard], component: FpensionComponent},
  {path: 'cajacompensacion', canActivate: [ValidacionLoginGuard], component: CajacompensacionComponent},
  {path: 'opedido', canActivate: [ValidacionLoginGuard], component: OpedidoComponent},
  {path: 'opedidoproducto', canActivate: [ValidacionLoginGuard], component: OpedidoproductoComponent},
  {path: 'ocompra', canActivate: [ValidacionLoginGuard], component: OcompraComponent},
  {path: 'usuario', canActivate: [ValidacionLoginGuard], component:UsuarioComponent},
  {path: 'pedidomateriaprima', canActivate: [ValidacionLoginGuard], component:PedidomateriaprimaComponent},
  {path: 'crearproducto', canActivate: [ValidacionLoginGuard], component:CrearProductoComponent},
  {path: 'crear-clientes', canActivate: [ValidacionLoginGuard], component:ClientesComponent},
  {path: 'producto', canActivate: [ValidacionLoginGuard], component:ProductoComponent},
  {path: 'estados', canActivate: [ValidacionLoginGuard], component: EstadosComponent},
  {path: 'home', canActivate: [ValidacionLoginGuard], component: PaginaPrincipalComponent},
  {path: 'desperdicio', canActivate: [ValidacionLoginGuard], component: DesperdicioComponent},
  {path: 'MateriaPrima', canActivate: [ValidacionLoginGuard], component: PedidomateriaprimaComponent},
  {path: 'prueba', component: PruebasComponent},
  {path: 'desperdicio', component: DesperdicioComponent},
  {path: 'crear-proveedor', canActivate: [ValidacionLoginGuard], component: CrearProveedorComponent},
  {path: 'crear-materiaprima', canActivate: [ValidacionLoginGuard], component: CrearMateriaprimaComponent},
  {path: 'reporte-Materia-Prima', canActivate: [ValidacionLoginGuard], component: ReporteMateriaPrimaComponent},
  {path: 'reporte-Materia-Prima-OT', canActivate: [ValidacionLoginGuard], component: ReporteMpOtComponent},
  {path: 'asignacionMP', canActivate: [ValidacionLoginGuard], component: AsignacionMateriaPrimaComponent},
  {path: 'mpremision', canActivate: [ValidacionLoginGuard], component: MpremisionComponent},
  {path: 'reporte-facturas-remisiones-mp', canActivate: [ValidacionLoginGuard], component: ConsultaFac_Rem_MPComponent},
  {path: 'movimiento-mp', canActivate: [ValidacionLoginGuard], component: MovimientoMPComponent},
  {path: 'mp-recuperada', canActivate: [ValidacionLoginGuard], component: MateriaPrimaRecuperadaComponent},
  {path: 'mp-devoluciones', canActivate: [ValidacionLoginGuard], component: DevolucionesMPComponent},
  {path: 'reporte-costos-ot', canActivate: [ValidacionLoginGuard], component: ReporteCostosOTComponent},
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
    MpremisionComponent,
    ConsultaFac_Rem_MPComponent,
    MovimientoMPComponent,
    MateriaPrimaRecuperadaComponent,
    DevolucionesMPComponent,
    ReporteCostosOTComponent,
  ],


  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AppRoutingModule,
    RouterModule.forRoot(routes),
    FormsModule,
    NgxPaginationModule,
    StorageServiceModule,
    BrowserAnimationsModule,
    MatNativeDateModule,
    MaterialExampleModule,
    HttpClientModule,
  ],

  providers: [
    ServicioAreasService,
    CookieService,
  ],

  bootstrap: [AppComponent]
})
export class AppModule { }
