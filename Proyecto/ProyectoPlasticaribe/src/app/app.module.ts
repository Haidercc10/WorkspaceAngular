import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponentComponent } from './Vistas/login-component/login-component.component';
import { RegistroComponentComponent } from './Vistas/registro-component/registro-component.component';
import { PrincipalComponent } from './Vistas/principal/principal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AreasComponentComponent } from './Vistas/areas-component/areas-component.component';
import { ServicioAreasService } from './Servicios/servicio-areas.service';
import { ReportesComponent } from './Vistas/reportes/reportes.component';
import { InicioComponent } from './Vistas/inicio/inicio.component';
import { PprincipalComponent } from './Vistas/pprincipal/pprincipal.component';
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
import { PdfComponent } from './Vistas/pdf/pdf.component';
import { CookieService } from 'ngx-cookie-service';
import { EstadosComponent } from './Vistas/estados/estados.component';



export const routes: Routes = [

  {path: '', component: InicioComponent},
  {path: 'registro', component: RegistroComponentComponent},
  {path: 'principal', component: PrincipalComponent},
  {path: 'areas', component: AreasComponentComponent},
  {path: 'login', component: LoginComponentComponent},
  {path: 'reportes', component: ReportesComponent},
  {path: 'roles', component: RolesComponentComponent},
  {path: 'pprincipal', component: PprincipalComponent},
  {path: 'eps', component: EpsComponent},
  {path: 'fpension', component: FpensionComponent},
  {path: 'cajacompensacion', component: CajacompensacionComponent},
  {path: 'opedido', component: OpedidoComponent},
  {path: 'opedidoproducto', component: OpedidoproductoComponent},
  {path: 'ocompra', component: OcompraComponent},
  {path: 'usuario',component:UsuarioComponent},
  {path: 'pedidomateriaprima',component:PedidomateriaprimaComponent},
  {path: 'crearproducto',component:CrearProductoComponent},
  {path: 'crear-clientes',component:ClientesComponent},
  {path: 'producto',component:ProductoComponent},
  {path: 'pdf',component:PdfComponent},
  {path: 'estados',component: EstadosComponent},

]

@NgModule({
  declarations: [
    AppComponent,
    RegistroComponentComponent,
    LoginComponentComponent,
    PrincipalComponent,
    InicioComponent,
    PprincipalComponent,
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
    PdfComponent,
    EstadosComponent],

  imports: [

    BrowserModule,
    ReactiveFormsModule,
    AppRoutingModule,
    RouterModule.forRoot(routes),
    HttpClientModule,
    FormsModule
  ],


  providers: [ServicioAreasService,
    CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
